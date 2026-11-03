import assert from "node:assert/strict";
import { test } from "node:test";
import { onRequest } from "../../../functions/api/assessment-requests.ts";

const env = {
  ASSESSMENT_DELIVERY_ENABLED: "true",
  // Fabricated URL; every fetch in these tests is mocked.
  ZAPIER_ASSESSMENT_WEBHOOK_URL: "https://hooks.zapier.com/hooks/catch/000000/mock-only/",
};
const base = {
  name: "TEST ENQUIRY",
  email: "sozo-test@example.com",
  phone: "+12025550147",
  interest: "Initial Assessment",
  message: "Synthetic sample only.",
  consent: true,
  smsConsent: false,
  marketingConsent: false,
  website: "",
};
let client = 0;
function request(body = base, options = {}) {
  const { headers = {}, ...rest } = options;
  return new Request("https://website.example/api/assessment-requests", {
    method: "POST",
    body: JSON.stringify(body),
    ...rest,
    headers: {
      Origin: "https://website.example",
      "Content-Type": "application/json",
      "CF-Connecting-IP": `192.0.2.${++client}`,
      ...headers,
    },
  });
}

test("delivery is disabled by default and no network requests occur", async t => {
  const fetch = t.mock.method(globalThis, "fetch", () => { throw new Error("Must not fetch"); });
  for (const settings of [{}, { ...env, ASSESSMENT_DELIVERY_ENABLED: "false" }]) {
    assert.equal((await onRequest({ request: request(), env: settings })).status, 503);
  }
  assert.equal(fetch.mock.callCount(), 0);
  t.after(() => t.mock.restoreAll());
});

test("all independent consent combinations map to the existing webhook field names", async t => {
  const sent = [];
  t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(url, env.ZAPIER_ASSESSMENT_WEBHOOK_URL);
    assert.equal(options.redirect, "error");
    assert.ok(options.signal instanceof AbortSignal);
    sent.push(JSON.parse(options.body));
    return new Response('{"status":"success"}', { status: 200 });
  });
  t.after(() => t.mock.restoreAll());
  for (const smsConsent of [false, true]) {
    for (const marketingConsent of [false, true]) {
      const response = await onRequest({ request: request({ ...base, smsConsent, marketingConsent }), env });
      assert.equal(response.status, 201);
      assert.equal(response.headers.get("cache-control"), "no-store");
      assert.equal((await response.json()).success, true);
      const payload = sent.at(-1);
      assert.equal(payload.sms_consent, smsConsent);
      assert.equal(payload.marketing_consent, marketingConsent);
      assert.equal(payload.is_test, false);
      assert.equal(payload.first_name, "TEST");
      assert.equal(payload.last_name, "ENQUIRY");
      assert.equal(payload.name, base.name);
      assert.equal(payload.phone, base.phone);
      assert.equal(payload.source, "sozo_website");
      assert.equal(payload.form_type, "initial_assessment");
      assert.ok(payload.request_id);
      assert.ok(payload.submitted_at);
    }
  }
  assert.equal(sent.length, 4);
  assert.equal(new Set(sent.map(item => item.request_id)).size, 4);
});

test("invalid submissions, spoofed metadata, bot traps and foreign origins never reach Zapier", async t => {
  const fetch = t.mock.method(globalThis, "fetch", () => { throw new Error("Must not fetch"); });
  t.after(() => t.mock.restoreAll());
  for (const input of [
    { ...base, phone: "" }, { ...base, consent: false },
    { ...base, smsConsent: "true" }, { ...base, marketingConsent: undefined },
    { ...base, website: "bot" }, { ...base, name: "  " },
    { ...base, is_test: false }, { ...base, source: "spoof" },
  ]) {
    assert.equal((await onRequest({ request: request(input), env })).status, 400);
  }
  assert.equal((await onRequest({ request: request(base, { headers: { Origin: "https://other.example" } }), env })).status, 403);
  assert.equal((await onRequest({ request: request(base, { headers: { Origin: "" } }), env })).status, 403);
  assert.equal((await onRequest({ request: request(base, { headers: { "Content-Type": "text/plain" } }), env })).status, 415);
  assert.equal((await onRequest({ request: request(base, { body: "{" }), env })).status, 400);
  assert.equal((await onRequest({ request: request(base, { body: "x".repeat(17 * 1024) }), env })).status, 413);
  const get = new Request("https://website.example/api/assessment-requests");
  assert.equal((await onRequest({ request: get, env })).status, 405);
  assert.equal(fetch.mock.callCount(), 0);
});

test("invalid webhook configurations fail closed without leaking details", async t => {
  const fetch = t.mock.method(globalThis, "fetch", () => { throw new Error("Must not fetch"); });
  t.after(() => t.mock.restoreAll());
  for (const url of [undefined, "http://hooks.zapier.com/hooks/catch/a/b/",
    "https://other.example/hooks/catch/a/b/", "https://hooks.zapier.com/elsewhere",
    "https://user:secret@hooks.zapier.com/hooks/catch/a/b/"]) {
    const response = await onRequest({ request: request(), env: { ...env, ZAPIER_ASSESSMENT_WEBHOOK_URL: url } });
    assert.equal(response.status, 503);
    assert.doesNotMatch(await response.text(), /hooks\.zapier|secret/);
  }
  assert.equal(fetch.mock.callCount(), 0);
});

test("upstream rejection, redirect failure and timeout report failure with no automatic retry", async t => {
  t.after(() => t.mock.restoreAll());
  for (const outcome of [
    () => new Response("private upstream details", { status: 403 }),
    () => { throw new Error("secret upstream URL"); },
    () => { throw new DOMException("Timeout", "TimeoutError"); },
  ]) {
    const fetch = t.mock.method(globalThis, "fetch", outcome);
    const response = await onRequest({ request: request(), env });
    assert.equal(response.status, 502);
    assert.equal(fetch.mock.callCount(), 1);
    assert.doesNotMatch(await response.text(), /secret|private|hooks\.zapier/);
    t.mock.restoreAll();
  }
});

test("sixth request from the same client is rate limited within the isolate", async t => {
  const fetch = t.mock.method(globalThis, "fetch", async () => new Response("ok"));
  t.after(() => t.mock.restoreAll());
  const headers = { "CF-Connecting-IP": "198.51.100.200" };
  for (let i = 0; i < 5; i++) {
    assert.equal((await onRequest({ request: request(base, { headers }), env })).status, 201);
  }
  const response = await onRequest({ request: request(base, { headers }), env });
  assert.equal(response.status, 429);
  assert.equal(response.headers.get("retry-after"), "3600");
  assert.equal(fetch.mock.callCount(), 5);
});
