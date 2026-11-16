import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { onRequest as publicAPI } from '../../../functions/api/giveaway.ts';
import { onRequest as adminAPI } from '../../../functions/api/giveaway-admin.ts';
import { onRequest as redirectAPI } from '../../../functions/hyperbaric-giveaway.ts';
import { randomIndex } from '../../../functions/_giveaway/draws.ts';
import { csv } from '../../../functions/_giveaway/common.ts';
import { syncEntry } from '../../../functions/_giveaway/mailchimp.ts';
import { GIVEAWAY_ENTRY_TAG } from '../src/lib/giveaway-contract.ts';

// Real SQLite enforces the same schema and constraints as Cloudflare D1.
function database(t, draft = false) {
  const sql = new DatabaseSync(':memory:');
  sql.exec(readFileSync(new URL('../../../migrations/giveaway/0001_giveaway.sql', import.meta.url), 'utf8'));
  sql.exec(readFileSync(new URL('../../../migrations/giveaway/0002_campaign_terms.sql', import.meta.url), 'utf8'));
  t.after(() => sql.close());
  const prepare = (query) => {
    let values = [];
    return {
      bind(...v) { values = v; return this; },
      async first() { return sql.prepare(query).get(...values) ?? null; },
      async all() { return { results: sql.prepare(query).all(...values) }; },
      async run() { return { meta: { changes: Number(sql.prepare(query).run(...values).changes) } }; },
    };
  };
  const db = { prepare, async batch(statements) {
    sql.exec('BEGIN');
    try { const out = []; for (const statement of statements) out.push(await statement.run()); sql.exec('COMMIT'); return out; }
    catch (e) { sql.exec('ROLLBACK'); throw e; }
  } };
  const now = Date.now();
  if (!draft) sql.prepare("UPDATE giveaway_campaigns SET status='active',starts_at=?,ends_at=?,prize_value=500,rules_approved=1")
    .run(new Date(now - 86400_000).toISOString(), new Date(now + 86400_000).toISOString());
  return { db, sql };
}
const keys = await crypto.subtle.generateKey({ name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1,0,1]), hash: 'SHA-256' }, true, ['sign','verify']);
const jwk = { ...await crypto.subtle.exportKey('jwk', keys.publicKey), kid: 'test-key', alg: 'RS256' };
const base64 = (v) => Buffer.from(typeof v === 'string' ? v : new Uint8Array(v)).toString('base64url');
async function jwt(overrides = {}) {
  const claims = { iss: 'https://sozo-test.cloudflareaccess.com', aud: ['test-audience'], iat: Math.floor(Date.now()/1000)-10, exp: Math.floor(Date.now()/1000)+3600, email: 'staff@example.com', ...overrides };
  const payload = `${base64(JSON.stringify({alg:'RS256',kid:'test-key'}))}.${base64(JSON.stringify(claims))}`;
  return `${payload}.${base64(await crypto.subtle.sign('RSASSA-PKCS1-v1_5', keys.privateKey, new TextEncoder().encode(payload)))}`;
}
function env(db) {
  return { GIVEAWAY_DB: db, GIVEAWAY_ENABLED: 'true', GIVEAWAY_CUSTOM_ADMIN_ENABLED: 'true', TURNSTILE_SECRET_KEY: 'test-only-not-real',
    MAILCHIMP_API_KEY: 'test-only-not-real', MAILCHIMP_SERVER_PREFIX: 'us1', MAILCHIMP_GIVEAWAY_AUDIENCE_ID: 'test123',
    GIVEAWAY_ACCESS_TEAM: 'sozo-test', GIVEAWAY_ACCESS_AUD: 'test-audience', GIVEAWAY_ADMIN_EMAILS: 'staff@example.com' };
}
const input = (overrides = {}) => ({
  firstName: 'Test', email: 'entrant@example.com', phone: '352-555-0101', wellnessInterest: 'More Energy',
  marketingConsent: true, rulesAccepted: true, eligible: true, turnstileToken: 'test-only-token',
  attribution: { qrSource: 'event-poster', utmSource: 'fair', utmMedium: 'qr', utmCampaign: 'fall' }, ...overrides,
});
function request(path, data, headers = {}) {
  return new Request(`https://website.example${path}`, {
    ...(data === undefined ? {} : { method: 'POST', body: JSON.stringify(data) }),
    headers: { 'Content-Type':'application/json', Origin:'https://website.example', 'CF-Connecting-IP':'198.51.100.4', ...headers },
  });
}
function mockNetwork(t, options = {}) {
  const calls = [];
  t.mock.method(globalThis,'fetch',async (url, init = {}) => {
    assert.equal(init.redirect,'manual');
    assert.ok(init.signal instanceof AbortSignal);
    calls.push({ url:String(url), ...init, parsed: init.body ? JSON.parse(init.body) : undefined });
    if (String(url).includes('/cdn-cgi/access/certs')) return Response.json({ keys:[jwk] });
    if (String(url).includes('/turnstile/')) return Response.json(options.turnstile || { success:true, hostname:'website.example', action:'giveaway_entry' });
    if (options.offline) return new Response('Provider unavailable',{status:503});
    if (String(url).endsWith('/tags')) return new Response(null,{status:204});
    if (!init.method || init.method === 'GET') return options.member ? Response.json({status:options.member}) : new Response(null,{status:404});
    return Response.json({ status: options.savedStatus || options.member || 'subscribed' });
  });
  return calls;
}
async function admin(env, data, path = '/api/giveaway-admin', token) {
  return adminAPI({env,request:request(path,data,{'Cf-Access-Jwt-Assertion': token || await jwt()})});
}
async function enter(env, data = input()) { return publicAPI({env,request:request('/api/giveaway',data)}); }

test('owner-provided dates and prize value remain draft and match Eastern Time', async t => {
  const {db,sql}=database(t,true);
  const response=await publicAPI({env:env(db),request:request('/api/giveaway')});
  const result=await response.json();
  assert.equal(result.campaign.startsAt,'2026-11-20T14:00:00.000Z');
  assert.equal(result.campaign.endsAt,'2026-11-20T23:00:00.000Z');
  assert.equal(result.campaign.prizeValue,2000);
  assert.equal(result.campaign.status,'draft');
  assert.equal(result.campaign.rulesApproved,false);
  assert.equal(result.acceptingEntries,false);
  const eastern=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',hour:'numeric',minute:'2-digit',hour12:true});
  assert.equal(eastern.format(new Date(result.campaign.startsAt)),'9:00 AM');
  assert.equal(eastern.format(new Date(result.campaign.endsAt)),'6:00 PM');
  // Reapplying setup cannot overwrite later staff changes or enable entries.
  sql.prepare('UPDATE giveaway_campaigns SET prize_value=2100').run();
  sql.exec(readFileSync(new URL('../../../migrations/giveaway/0002_campaign_terms.sql', import.meta.url),'utf8'));
  assert.equal(sql.prepare('SELECT prize_value FROM giveaway_campaigns').get().prize_value,2100);
});

test('unconfigured campaign stays closed; anonymous and forged admin access fail closed', async t => {
  const calls = mockNetwork(t);
  const availability = await (await publicAPI({env:{},request:request('/api/giveaway')})).json();
  assert.equal(availability.acceptingEntries,false);
  assert.equal((await enter({})).status,503);
  assert.equal((await adminAPI({env:{},request:request('/api/giveaway-admin',undefined,{'Cf-Access-Authenticated-User-Email':'staff@example.com'})})).status,404);
  const {db} = database(t);
  assert.equal((await admin(env(db),undefined,'/api/giveaway-admin','forged.token.string')).status,403);
  assert.equal(calls.length,0);
});

test('entry is saved with source and email consent before idempotent Mailchimp member/tag sync', async t => {
  const {db,sql} = database(t); const calls = mockNetwork(t);
  const response = await enter(env(db));
  assert.equal(response.status,201);
  const result = await response.json();
  assert.equal(result.marketingStatus,'synced');
  const row = sql.prepare('SELECT * FROM giveaway_entries').get();
  assert.equal(row.id,result.entryId); assert.equal(row.qr_source,'event-poster');
  assert.equal(row.email,'entrant@example.com'); assert.equal(row.phone,'+13525550101');
  assert.equal(row.marketing_consent,1); assert.equal(row.rules_version,'1');
  const put = calls.find(c=>c.method==='PUT');
  assert.equal(put.parsed.status_if_new,'subscribed');
  assert.equal(put.parsed.status,undefined);
  assert.equal(put.parsed.merge_fields.WELLNESS,'More Energy');
  assert.equal(put.parsed.merge_fields.GVENTERED,row.created_at);
  assert.equal(put.parsed.merge_fields.GVENTRYID,row.id);
  assert.equal(put.parsed.merge_fields.GVSOURCE,'event-poster');
  assert.deepEqual(calls.find(c=>c.url.endsWith('/tags')).parsed.tags.map(t=>t.name),[GIVEAWAY_ENTRY_TAG,'Vendor Event','Hyperbaric Giveaway','QR Code Lead']);
  const before = calls.length;
  assert.equal(await syncEntry(env(db),row.id),'synced');
  assert.equal(calls.length,before);
});

test('duplicate email and phone are rejected atomically without a second marketing write', async t => {
  const {db,sql} = database(t); const calls = mockNetwork(t); const e = env(db);
  assert.equal((await enter(e)).status,201);
  assert.equal((await enter(e,input({email:'ENTRANT@example.com',phone:'3525550102'}))).status,409);
  assert.equal((await enter(e,input({email:'other@example.com'}))).status,409);
  assert.equal(sql.prepare('SELECT count(*) n FROM giveaway_entries').get().n,1);
  assert.equal(calls.filter(c=>c.method==='PUT').length,1);
});

test('invalid fields, missing consent, ineligible entry and honeypot never reach marketing', async t => {
  const {db,sql} = database(t); const calls = mockNetwork(t);
  for (const patch of [{marketingConsent:false},{rulesAccepted:false},{eligible:false},{website:'spam'},{phone:'123'},{wellnessInterest:'Private diagnosis'},{email:'invalid'}]) {
    assert.equal((await enter(env(db),input(patch))).status,400);
  }
  assert.equal(sql.prepare('SELECT count(*) n FROM giveaway_entries').get().n,0);
  assert.equal(calls.length,0);
});

test('wrong action or hostname in a Turnstile result is rejected', async t => {
  const {db} = database(t);
  mockNetwork(t,{turnstile:{success:true,hostname:'wrong.example',action:'guide_request'}});
  assert.equal((await enter(env(db))).status,400);
});

test('provider failure preserves entry and authenticated retry does not create a second entry', async t => {
  const {db,sql} = database(t); const options = {offline:true}; mockNetwork(t,options);
  const e = env(db);
  const receipt = await (await enter(e)).json();
  assert.equal(receipt.marketingStatus,'failed');
  assert.equal(sql.prepare('SELECT count(*) n FROM giveaway_entries').get().n,1);
  options.offline = false;
  assert.equal((await admin(e,{action:'retry',entryId:receipt.entryId})).status,200);
  assert.equal(sql.prepare('SELECT sync_status FROM giveaway_entries').get().sync_status,'synced');
  assert.equal(sql.prepare('SELECT count(*) n FROM giveaway_entries').get().n,1);
});

test('unsubscribed contacts get the entry tag, not marketing tags or resubscription', async t => {
  const {db,sql} = database(t); const calls = mockNetwork(t,{member:'unsubscribed'});
  const receipt = await (await enter(env(db))).json();
  assert.equal(receipt.marketingStatus,'suppressed');
  assert.equal(sql.prepare('SELECT count(*) n FROM giveaway_entries').get().n,1);
  const put=calls.find(c=>c.method==='PUT');
  assert.equal(put.parsed.status,undefined);
  assert.equal(put.parsed.timestamp_opt,undefined);
  assert.equal(put.parsed.merge_fields.GVENTERED,sql.prepare('SELECT created_at FROM giveaway_entries').get().created_at);
  assert.deepEqual(calls.find(c=>c.url.endsWith('/tags')).parsed.tags,[{name:GIVEAWAY_ENTRY_TAG,status:'active'}]);
});

test('custom administration stays unavailable even with valid credentials unless explicitly enabled', async t => {
  const {db}=database(t); const calls=mockNetwork(t);
  const e={...env(db),GIVEAWAY_CUSTOM_ADMIN_ENABLED:undefined};
  assert.equal((await admin(e,undefined)).status,404);
  assert.equal((await admin(e,{action:'draw'})).status,404);
  assert.equal(calls.length,0);
});

test('returning subscribers receive an event timestamp without changing their original opt-in date', async t => {
  const {db,sql}=database(t); const calls=mockNetwork(t,{member:'subscribed'});
  assert.equal((await enter(env(db))).status,201);
  const put=calls.find(c=>c.method==='PUT');
  assert.equal(put.parsed.timestamp_opt,undefined);
  assert.equal(put.parsed.status,undefined);
  assert.equal(put.parsed.merge_fields.GVENTERED,sql.prepare('SELECT created_at FROM giveaway_entries').get().created_at);
});

test('an unsubscribe racing member update receives only the event tag', async t => {
  const {db}=database(t); const calls=mockNetwork(t,{member:'subscribed',savedStatus:'unsubscribed'});
  const response=await (await enter(env(db))).json();
  assert.equal(response.marketingStatus,'suppressed');
  assert.deepEqual(calls.find(c=>c.url.endsWith('/tags')).parsed.tags.map(t=>t.name),[GIVEAWAY_ENTRY_TAG]);
});

test('direct entry receives no QR tag; no invented attribution', async t => {
  const {db} = database(t); const calls = mockNetwork(t);
  assert.equal((await enter(env(db),input({attribution:{}}))).status,201);
  assert.deepEqual(calls.find(c=>c.url.endsWith('/tags')).parsed.tags.map(t=>t.name),[GIVEAWAY_ENTRY_TAG,'Vendor Event','Hyperbaric Giveaway']);
});

test('authenticated search, source summaries, CSV exports and CSV formula protection', async t => {
  const {db} = database(t); mockNetwork(t); const e = env(db);
  await enter(e,input({firstName:'=DANGEROUS()'}));
  const data = await (await admin(e,undefined,'/api/giveaway-admin?q=entrant')).json();
  assert.equal(data.total,1); assert.equal(data.totalEntries,1);
  assert.equal(data.sources[0].label,'event-poster'); assert.equal(data.goals[0].count,1);
  const exported = await admin(e,undefined,'/api/giveaway-admin?export=entries');
  assert.equal(exported.headers.get('Cache-Control'),'no-store');
  assert.match(await exported.text(), /"'=DANGEROUS\(\)"/);
  const emails = await admin(e,undefined,'/api/giveaway-admin?export=emails');
  assert.match(await emails.text(),/entrant@example.com/);
  assert.match(await csv([[' +FORMULA()']], 'test').text(), /"' \+FORMULA\(\)"/);
});

test('invalid, expired, wrong-audience and non-allowlisted Access sessions are denied', async t => {
  const {db} = database(t); mockNetwork(t);
  for (const patch of [{exp:1},{aud:['wrong']},{email:'outsider@example.com'},{iss:'https://evil.example'}]) {
    assert.equal((await admin(env(db),undefined,'/api/giveaway-admin',await jwt(patch))).status,403);
  }
  const token = await jwt();
  const pieces = token.split('.'); pieces[1] = base64(JSON.stringify({email:'staff@example.com'}));
  assert.equal((await admin(env(db),undefined,'/api/giveaway-admin',pieces.join('.'))).status,403);
});

test('rules and prize terms lock after first entry; cross-origin admin writes are refused', async t => {
  const {db} = database(t); mockNetwork(t); const e=env(db);
  await enter(e);
  const data=await (await admin(e,undefined)).json();
  assert.equal((await admin(e,{action:'settings',settings:{...data.campaign,prizeValue:999}})).status,409);
  assert.equal((await admin(e,{action:'settings',settings:{...data.campaign,status:'closed'}})).status,200);
  const foreign = request('/api/giveaway-admin',{action:'draw'},{Origin:'https://evil.example','Cf-Access-Jwt-Assertion':await jwt()});
  assert.equal((await adminAPI({env:e,request:foreign})).status,400);
});

test('drawing is persisted, requires separate confirmation, and alternate excludes previous winner', async t => {
  const {db,sql} = database(t); mockNetwork(t); const e=env(db);
  await enter(e);
  await enter(e,input({email:'second@example.com',phone:'3525550102'}));
  assert.equal((await admin(e,{action:'draw'})).status,409);
  const ended = new Date(Date.now()-1000).toISOString();
  // Fixture simulates the real entry period ending, without changing application terms.
  sql.prepare("UPDATE giveaway_campaigns SET status='closed',ends_at=?").run(ended);
  sql.prepare('UPDATE giveaway_entries SET created_at=?').run(new Date(Date.now()-2000).toISOString());
  const first = await (await admin(e,{action:'draw'})).json();
  assert.ok(first.draw.id); assert.equal(first.draw.status,'pending'); assert.equal(first.draw.eligible_count,2);
  const again = await (await admin(e,{action:'draw'})).json();
  assert.equal(again.draw.id,first.draw.id);
  assert.equal((await admin(e,{action:'confirm',drawId:first.draw.id})).status,200);
  assert.equal((await admin(e,{action:'draw'})).status,409);
  assert.equal((await admin(e,{action:'release',drawId:first.draw.id})).status,409);
  assert.equal((await admin(e,{action:'notified',drawId:first.draw.id})).status,200);
  assert.equal((await admin(e,{action:'release',drawId:first.draw.id})).status,409);
  sql.prepare('UPDATE giveaway_draws SET notified_at=? WHERE id=?').run(new Date(Date.now()-8*86400_000).toISOString(),first.draw.id);
  assert.equal((await admin(e,{action:'release',drawId:first.draw.id})).status,200);
  const alternate = await (await admin(e,{action:'draw'})).json();
  assert.notEqual(alternate.draw.entry_id,first.draw.entry_id); assert.equal(alternate.draw.eligible_count,1);
  assert.equal(sql.prepare('SELECT count(*) n FROM giveaway_draws').get().n,2);
  const exportResponse=await admin(e,undefined,'/api/giveaway-admin?export=winners');
  assert.match(await exportResponse.text(),/unclaimed/);
});

test('expiry and public kill switch stop entries; source redirect preserves tracking', async t => {
  const {db,sql}=database(t); mockNetwork(t); const e=env(db);
  assert.equal((await enter({...e,GIVEAWAY_ENABLED:'false'})).status,503);
  sql.prepare('UPDATE giveaway_campaigns SET ends_at=?').run(new Date(Date.now()-1).toISOString());
  assert.equal((await enter(e)).status,503);
  const redirected=redirectAPI({request:request('/hyperbaric-giveaway?qr_source=poster&utm_campaign=fall')});
  assert.equal(redirected.status,301);
  assert.equal(redirected.headers.get('Location'),'https://website.example/enter-to-win?qr_source=poster&utm_campaign=fall');
});

test('random index bounds and invalid draw sizes', () => {
  assert.throws(()=>randomIndex(0));
  assert.throws(()=>randomIndex(1.5));
  for(let n=0;n<100;n++) assert.ok(randomIndex(7)<7);
  assert.equal(randomIndex(1),0);
});
