import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createHash } from 'node:crypto';
import { onRequest, holidayAvailability } from '../../../functions/api/claim.ts';
import { saveHolidayClaim } from '../../../functions/_holiday/mailchimp.ts';
import { HOLIDAY_START, HOLIDAY_END, validateHolidayClaim } from '../src/lib/holiday-offers.ts';

const env = {
  HOLIDAY_CLAIMS_ENABLED: 'true', MAILCHIMP_API_KEY: 'mock-only-key',
  MAILCHIMP_SERVER_PREFIX: 'us13', MAILCHIMP_AUDIENCE_ID: 'mockaudience',
  TURNSTILE_SECRET_KEY: 'mock-only-turnstile',
};
const base = {
  firstName: 'Example', lastName: 'Client', email: 'example@example.com',
  phone: '(202) 555-0137', offers: ['bogo', 'gift-card'], packageId: 'freedom-7',
  reservationConsent: true, marketingConsent: false, website: '', turnstileToken: 'mock-only-token',
};
const valid = (changes = {}) => validateHolidayClaim({ ...base, ...changes }).value;
function request(body = base, options = {}) {
  return new Request('https://sozo.example/api/claim', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://sozo.example' },
    body: JSON.stringify(body), ...options,
  });
}
function provider(t, options = {}) {
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, init = {}) => {
    assert.equal(init.redirect, 'manual', 'Compatible with Cloudflare Workers');
    assert.ok(init.signal instanceof AbortSignal);
    const payload = init.body ? JSON.parse(init.body) : null;
    calls.push({ url, init, payload });
    if (url.includes('/siteverify')) return Response.json({
      success: true, hostname: 'sozo.example', action: 'holiday_claim', ...options.verification,
    });
    assert.match(url, /^https:\/\/us13\.api\.mailchimp\.com\/3\.0\/lists\/mockaudience\//);
    assert.ok(init.headers.Authorization.startsWith('Basic '));
    if (url.includes('/merge-fields?')) return Response.json({
      merge_fields: (options.fields || ['FNAME', 'LNAME', 'PHONE', 'BFRESAT', 'PACKAGE']).map(tag => ({ tag })),
    });
    if (url.endsWith('/tags')) return new Response(null, { status: options.tagStatus || 204 });
    if (init.method === 'GET') return options.existing
      ? Response.json({ status: options.existing }) : new Response(null, { status: 404 });
    if (options.memberStatus) return new Response('Private provider body', { status: options.memberStatus });
    return Response.json({ status: options.existing || payload.status_if_new });
  });
  t.after(() => t.mock.restoreAll());
  return calls;
}

test('validation requires names, email, US phone, offers and follow-up but not marketing', () => {
  assert.deepEqual(validateHolidayClaim(base).errors, {});
  assert.equal(valid().phone, '+12025550137');
  for (const changes of [
    { firstName: '' }, { lastName: '' }, { firstName: 'x'.repeat(81) },
    { email: 'invalid' }, { phone: '+442079460000' }, { phone: '1111111111' },
    { offers: [] }, { offers: ['not-an-offer'] }, { offers: ['bogo', 'bad'] },
    { reservationConsent: false }, { reservationConsent: 'true' },
    { marketingConsent: undefined }, { website: 'spam.example' }, { packageId: 'wrong' },
  ]) assert.ok(Object.keys(validateHolidayClaim({ ...base, ...changes }).errors).length, JSON.stringify(changes));
  assert.equal(valid({ offers: ['gift-card'], packageId: 'freedom-7' }).packageId, '');
  assert.equal(valid({ email: ' EXAMPLE@EXAMPLE.COM ' }).email, 'example@example.com');
});

test('campaign opens and closes on Florida time; disabled and incomplete settings fail closed', () => {
  const start = Date.parse(HOLIDAY_START), end = Date.parse(HOLIDAY_END);
  assert.equal(holidayAvailability(env, start - 1).reason, 'upcoming');
  assert.equal(holidayAvailability(env, start).accepting, true);
  assert.equal(holidayAvailability(env, end - 1).accepting, true);
  assert.equal(holidayAvailability(env, end).reason, 'closed');
  assert.equal(holidayAvailability({}, start).reason, 'disabled');
  assert.equal(holidayAvailability({ ...env, MAILCHIMP_API_KEY: '' }, start).reason, 'unavailable');
});

test('new opt-out is transactional; reservation and package are saved without marketing permission', async t => {
  const calls = provider(t);
  await saveHolidayClaim(env, valid());
  const put = calls.find(call => call.init.method === 'PUT');
  assert.ok(put.url.endsWith(`/${createHash('md5').update(base.email).digest('hex')}`));
  assert.equal(put.payload.status_if_new, 'transactional');
  assert.equal(put.payload.status, undefined);
  assert.ok(Number.isFinite(Date.parse(put.payload.merge_fields.BFRESAT)));
  assert.equal(put.payload.merge_fields.PACKAGE, 'Freedom 7 — 7 credits — $600');
  const tags = calls.find(call => call.url.endsWith('/tags')).payload.tags;
  for (const name of ['Black Friday 2026', 'BOGO Package', 'Gift Card Bonus', 'BF 2026 Package - Freedom 7']) {
    assert.equal(tags.find(tag => tag.name === name).status, 'active');
  }
  assert.equal(tags.find(tag => tag.name === 'BF 2026 - Email Opt-in').status, 'inactive');
});

test('new email opt-in subscribes and receives the campaign permission tag', async t => {
  const calls = provider(t);
  await saveHolidayClaim(env, valid({ marketingConsent: true }));
  const put = calls.find(call => call.init.method === 'PUT').payload;
  assert.equal(put.status_if_new, 'subscribed');
  assert.ok(put.timestamp_opt);
  assert.equal(put.merge_fields.BFRESAT, put.timestamp_opt);
  assert.equal(calls.at(-1).payload.tags.find(tag => tag.name === 'BF 2026 - Email Opt-in').status, 'active');
});

test('signup welcome exclusion is available in the initial member write, before tags', async t => {
  const calls = provider(t);
  await saveHolidayClaim(env, valid({ marketingConsent: true }));
  const writeIndex = calls.findIndex(call => call.init.method === 'PUT');
  const tagIndex = calls.findIndex(call => call.url.endsWith('/tags'));
  assert.ok(writeIndex >= 0 && writeIndex < tagIndex);
  const fields = calls[writeIndex].payload.merge_fields;
  assert.deepEqual(Object.keys(fields).sort(), ['BFRESAT', 'FNAME', 'LNAME', 'PACKAGE', 'PHONE']);
  assert.match(fields.BFRESAT, /^\d{4}-\d{2}-\d{2}T/);
  assert.equal('GVENTERED' in fields, false, 'Does not mislabel a reservation as a giveaway entry');
});

for (const existing of ['subscribed', 'unsubscribed', 'cleaned', 'pending', 'transactional']) {
  test(`repeat submission preserves ${existing} member status`, async t => {
    const calls = provider(t, { existing });
    await saveHolidayClaim(env, valid({ marketingConsent: true }));
    await saveHolidayClaim(env, valid({ offers: ['gift-card'], packageId: '' }));
    const writes = calls.filter(call => call.init.method === 'PUT');
    assert.equal(writes.length, 2);
    assert.ok(writes.every(call => !('status' in call.payload) && !('timestamp_opt' in call.payload)));
    assert.ok(writes.every(call => Number.isFinite(Date.parse(call.payload.merge_fields.BFRESAT))));
    const tags = calls.at(-1).payload.tags;
    assert.equal(tags.find(tag => tag.name === 'BOGO Package').status, 'inactive');
    assert.equal(tags.find(tag => tag.name === 'Gift Card Bonus').status, 'active');
    assert.equal(tags.find(tag => tag.name === 'BF 2026 - Email Opt-in').status, 'inactive');
  });
}

test('missing optional PACKAGE merge field still saves package as a campaign tag', async t => {
  const calls = provider(t, { fields: ['FNAME', 'LNAME', 'PHONE', 'BFRESAT'] });
  await saveHolidayClaim(env, valid());
  assert.equal('PACKAGE' in calls.find(call => call.init.method === 'PUT').payload.merge_fields, false);
  assert.equal(calls.at(-1).payload.tags.find(tag => tag.name === 'BF 2026 Package - Freedom 7').status, 'active');
});

test('missing required merge field fails before member write', async t => {
  const calls = provider(t, { fields: ['FNAME'] });
  await assert.rejects(saveHolidayClaim(env, valid()), /required-fields/);
  assert.equal(calls.some(call => call.init.method === 'PUT'), false);
});

test('missing holiday exclusion field fails before subscribing or tagging a contact', async t => {
  const calls = provider(t, { fields: ['FNAME', 'LNAME', 'PHONE', 'PACKAGE'] });
  await assert.rejects(saveHolidayClaim(env, valid({ marketingConsent: true })), /required-fields/);
  assert.equal(calls.some(call => call.init.method === 'PUT' || call.url.endsWith('/tags')), false);
});

const previewOrigin = 'https://1234abcd.sozowellnesscenter.pages.dev';
const previewEnv = {
  ...env, HOLIDAY_PREVIEW_TEST: 'true', HOLIDAY_TEST_EMAIL: base.email,
  CF_PAGES_BRANCH: 'holiday-test', CF_PAGES_URL: previewOrigin,
};
function previewRequest(changes = {}, origin = previewOrigin) {
  return new Request(`${origin}/api/claim`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: origin },
    body: JSON.stringify({ ...base, ...changes }),
  });
}
function previewClock(t) {
  t.mock.timers.enable({ apis: ['Date'], now: Date.parse('2026-11-26T12:00:00Z') });
  t.after(() => t.mock.timers.reset());
}

test('controlled preview opens early only on its exact deployment and test branch', () => {
  const beforeOpening = Date.parse(HOLIDAY_START) - 86_400_000;
  assert.deepEqual(holidayAvailability(previewEnv, beforeOpening, previewOrigin), {
    accepting: true, reason: 'open', testMode: true,
  });
  for (const [settings, url] of [
    [{ ...previewEnv, CF_PAGES_BRANCH: 'main' }, previewOrigin],
    [{ ...previewEnv, CF_PAGES_BRANCH: undefined }, previewOrigin],
    [{ ...previewEnv, CF_PAGES_URL: undefined }, previewOrigin],
    [{ ...previewEnv, HOLIDAY_TEST_EMAIL: '' }, previewOrigin],
    [{ ...previewEnv, HOLIDAY_TEST_EMAIL: 'not an email' }, previewOrigin],
    [previewEnv, 'https://sozorootedwellness.com'],
    [previewEnv, 'https://holiday-test.sozowellnesscenter.pages.dev'],
    [previewEnv, 'https://9999abcd.sozowellnesscenter.pages.dev'],
    [previewEnv, 'http://1234abcd.sozowellnesscenter.pages.dev'],
    [previewEnv, undefined],
  ]) assert.equal(holidayAvailability(settings, beforeOpening, url).accepting, false);
  assert.equal(holidayAvailability({ ...previewEnv, HOLIDAY_CLAIMS_ENABLED: 'false' }, beforeOpening, previewOrigin).accepting, false);
  assert.equal(holidayAvailability({ ...previewEnv, HOLIDAY_PREVIEW_TEST: 'false' }, beforeOpening, previewOrigin).reason, 'upcoming');
  assert.equal(holidayAvailability(env, beforeOpening, `${previewOrigin}?test=true`).reason, 'upcoming');
  assert.equal(holidayAvailability(previewEnv, Date.parse(HOLIDAY_START), previewOrigin).accepting, false);
});

test('controlled preview rejects other emails or marketing permission before external requests', async t => {
  previewClock(t);
  const spy = t.mock.method(globalThis, 'fetch', () => { throw new Error('No external request expected'); });
  t.after(() => t.mock.restoreAll());
  for (const changes of [{ email: 'another@example.com' }, { marketingConsent: true }]) {
    const result = await onRequest({ request: previewRequest(changes), env: previewEnv });
    assert.equal(result.status, 400);
    assert.equal((await result.json()).ok, false);
  }
  assert.equal(spy.mock.callCount(), 0);
});

test('controlled preview saves only the allowlisted opt-out with real security verification', async t => {
  previewClock(t);
  const calls = provider(t, {
    verification: { hostname: new URL(previewOrigin).hostname },
  });
  const result = await onRequest({ request: previewRequest(), env: previewEnv });
  assert.equal(result.status, 200);
  assert.deepEqual(await result.json(), { ok: true });
  const put = calls.find(call => call.init.method === 'PUT').payload;
  assert.equal(put.status_if_new, 'transactional');
  assert.ok(put.merge_fields.BFRESAT);
  assert.equal(calls.at(-1).payload.tags.find(tag => tag.name === 'BF 2026 - Email Opt-in').status, 'inactive');
});

test('controlled preview cannot write on production or without valid Turnstile verification', async t => {
  previewClock(t);
  const calls = provider(t, { verification: { success: false } });
  const live = await onRequest({ request: previewRequest({}, 'https://sozorootedwellness.com'), env: previewEnv });
  assert.equal(live.status, 503);
  assert.equal(calls.length, 0);
  const rejected = await onRequest({ request: previewRequest(), env: previewEnv });
  assert.equal(rejected.status, 403);
  assert.equal(calls.length, 1);
  assert.ok(calls[0].url.endsWith('/siteverify'));
});

test('GET and disabled POST never call Mailchimp or leak config', async t => {
  const spy = t.mock.method(globalThis, 'fetch', () => { throw new Error('No external request expected'); });
  t.after(() => t.mock.restoreAll());
  const result = await onRequest({ request: new Request('https://sozo.example/api/claim'), env: {} });
  assert.deepEqual(await result.json(), { accepting: false, reason: 'disabled' });
  assert.equal(result.headers.get('cache-control'), 'no-store');
  assert.equal((await onRequest({ request: request(), env: {} })).status, 503);
  assert.equal(spy.mock.callCount(), 0);
});

test('POST verifies security and acknowledges only completed member AND tag writes', async t => {
  t.mock.timers.enable({ apis: ['Date'], now: Date.parse('2026-11-28T12:00:00Z') });
  t.after(() => t.mock.timers.reset());
  const calls = provider(t);
  const result = await onRequest({ request: request(), env });
  assert.equal(result.status, 200);
  assert.deepEqual(await result.json(), { ok: true });
  assert.ok(calls[0].url.endsWith('/siteverify'));
  assert.ok(calls.at(-1).url.endsWith('/tags'));
});

test('cross-origin, malformed, oversized and invalid submissions never reach provider', async t => {
  t.mock.timers.enable({ apis: ['Date'], now: Date.parse('2026-11-28T12:00:00Z') });
  t.after(() => t.mock.timers.reset());
  const calls = provider(t);
  assert.equal((await onRequest({ request: request(base, { headers: { Origin: 'https://evil.example' } }), env })).status, 403);
  assert.equal((await onRequest({ request: request(base, { body: '{bad' }), env })).status, 400);
  assert.equal((await onRequest({ request: request(base, { body: 'x'.repeat(13000) }), env })).status, 400);
  const invalid = await onRequest({ request: request({ ...base, phone: '' }), env });
  assert.ok((await invalid.json()).fieldErrors.phone);
  assert.equal(calls.length, 0);
});

test('wrong Turnstile action fails before Mailchimp', async t => {
  t.mock.timers.enable({ apis: ['Date'], now: Date.parse('2026-11-28T12:00:00Z') });
  t.after(() => t.mock.timers.reset());
  const calls = provider(t, { verification: { action: 'guide_request' } });
  assert.equal((await onRequest({ request: request(), env })).status, 403);
  assert.equal(calls.length, 1);
});

test('provider tag failure is not shown as success; raw details are hidden', async t => {
  t.mock.timers.enable({ apis: ['Date'], now: Date.parse('2026-11-28T12:00:00Z') });
  t.after(() => t.mock.timers.reset());
  provider(t, { tagStatus: 500 });
  const result = await onRequest({ request: request(), env });
  assert.equal(result.status, 502);
  const payload = await result.json();
  assert.equal(payload.ok, false);
  assert.equal(payload.error, 'Something went wrong — please call us at 352-802-2248');
  assert.equal(JSON.stringify(payload).includes(base.email), false);
});
