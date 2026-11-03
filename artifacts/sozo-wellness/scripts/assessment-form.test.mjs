import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { assessmentErrorMessage, normalizeAssessmentMobile } from '../src/lib/assessment-form.ts';
import { SubmitAssessmentRequestBody } from '../../../lib/api-zod/src/generated/api.ts';

const base = {
  name: 'TEST ENQUIRY',
  email: 'sozo-assessment-test@example.com',
  phone: '+12025550147',
  interest: 'General question',
  consent: true,
  smsConsent: false,
  marketingConsent: false,
  website: '',
};

test('normalizes formatted US and explicit international numbers', () => {
  for (const phone of ['2025550147', '(202) 555-0147', '1-202-555-0147', '+1 (202) 555-0147']) {
    assert.equal(normalizeAssessmentMobile(phone), '+12025550147');
  }
  assert.equal(normalizeAssessmentMobile('+44 7700 900123'), '+447700900123');
});

test('rejects empty, malformed and incomplete mobile numbers', () => {
  for (const phone of ['', ' ', '123', 'phone number', '+', '+00 1234567890', '2025550147 ext 4', '++12025550147', '1+2025550147', '+1234567890123456']) {
    assert.equal(normalizeAssessmentMobile(phone), null, phone);
  }
});

test('accepts all four independent opt-in combinations, including neither', () => {
  for (const smsConsent of [false, true]) {
    for (const marketingConsent of [false, true]) {
      const result = SubmitAssessmentRequestBody.parse({ ...base, smsConsent, marketingConsent });
      assert.equal(result.smsConsent, smsConsent);
      assert.equal(result.marketingConsent, marketingConsent);
    }
  }
});

test('requires mobile, explicit boolean consent choices and request consent', () => {
  for (const field of ['phone', 'smsConsent', 'marketingConsent']) {
    const input = { ...base };
    delete input[field];
    assert.equal(SubmitAssessmentRequestBody.safeParse(input).success, false, field);
  }
  for (const phone of ['', ' ', '2025550147', '+0012345678']) {
    assert.equal(SubmitAssessmentRequestBody.safeParse({ ...base, phone }).success, false);
  }
  assert.equal(SubmitAssessmentRequestBody.safeParse({ ...base, smsConsent: 'true' }).success, false);
  assert.equal(SubmitAssessmentRequestBody.safeParse({ ...base, marketingConsent: 'false' }).success, false);
  assert.equal(SubmitAssessmentRequestBody.safeParse({ ...base, consent: false }).success, false);
  assert.equal(SubmitAssessmentRequestBody.safeParse({ ...base, website: 'spam' }).success, false);
});

test('both optional consent controls start unchecked and reset after a successful save', () => {
  const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
  assert.equal((app.match(/smsConsent:false, marketingConsent:false/g) ?? []).length, 2);
  assert.match(app, /register\('smsConsent'\)/);
  assert.match(app, /register\('marketingConsent'\)/);
  assert.doesNotMatch(app, /register\('(?:smsConsent|marketingConsent)',\s*\{required/);
});

test('explains test restrictions, disabled delivery, validation and rate limits safely', () => {
  assert.match(assessmentErrorMessage({
    status: 403,
    data: { error: 'Contact capture testing is restricted. Use the approved test email and leave automated texts unchecked.' },
  }), /email configured in Cloudflare.*text consent unchecked/);
  assert.match(assessmentErrorMessage({ status: 400 }), /rejected before delivery/);
  assert.match(assessmentErrorMessage({ status: 429 }), /at least one hour/);
  assert.match(assessmentErrorMessage({ status: 503, data: {
    error: 'Online requests are not enabled. Please text or call 352-802-2248.',
  } }), /still disabled/);
  assert.match(assessmentErrorMessage({ status: 503 }), /settings are incomplete/);
  assert.match(assessmentErrorMessage({ status: 502 }), /check Zap History before submitting again/);
  for (const error of [null, new Error('private URL'), { status: 500 },
    { status: 403, data: { error: '<script>private URL</script>' } }]) {
    assert.doesNotMatch(assessmentErrorMessage(error), /private URL|<script>/);
  }
});
