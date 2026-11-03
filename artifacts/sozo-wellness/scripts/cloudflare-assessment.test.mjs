import assert from "node:assert/strict";
import { test } from "node:test";
import { onRequest } from "../../../functions/api/assessment-requests.ts";

const env = {
  ASSESSMENT_DELIVERY_ENABLED: "true",
  ASSESSMENT_DELIVERY_MODE: "live",
  TURNSTILE_SECRET_KEY: "mock-only-turnstile-secret",
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
  turnstileToken: "mock-only-single-use-token",
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

// Keep legacy delivery spies scoped to Zapier, with verified Siteverify traffic.
function mockDeliveryFetch(t, callback) {
  const delivery = t.mock.fn(callback);
  t.mock.method(globalThis, "fetch", async (url, options) => {
    if (url === "https://challenges.cloudflare.com/turnstile/v0/siteverify") {
      const input = JSON.parse(options.body);
      assert.equal(input.secret, env.TURNSTILE_SECRET_KEY);
      assert.equal(input.response, base.turnstileToken);
      assert.deepEqual(Object.keys(input).sort(), ["remoteip", "response", "secret"]);
      assert.equal(options.redirect, "manual");
      assert.ok(options.signal instanceof AbortSignal);
      return Response.json({ success: true, hostname: "website.example", action: "assessment_request" });
    }
    return delivery(url, options);
  });
  return delivery;
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
  mockDeliveryFetch(t, async (url, options) => {
    assert.equal(url, env.ZAPIER_ASSESSMENT_WEBHOOK_URL);
    assert.equal(options.redirect, "manual");
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
      assert.equal(payload.turnstileToken, undefined);
      assert.doesNotMatch(JSON.stringify(payload), /mock-only-single-use-token|mock-only-turnstile-secret/);
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

test("missing or invalid delivery modes and test emails fail closed", async t => {
  const fetch = t.mock.method(globalThis, "fetch", () => { throw new Error("Must not fetch"); });
  t.after(() => t.mock.restoreAll());
  for (const settings of [
    { ASSESSMENT_DELIVERY_MODE: undefined },
    { ASSESSMENT_DELIVERY_MODE: "typo" },
    ...[undefined, "", "not-an-email"].map(email => ({
      ASSESSMENT_DELIVERY_MODE: "contact_capture_test", ASSESSMENT_TEST_EMAIL: email,
    })),
  ]) {
    assert.equal((await onRequest({ request: request(), env: { ...env, ...settings } })).status, 503);
  }
  assert.equal(fetch.mock.callCount(), 0);
});

test("contact-only mode restricts email and rejects SMS opt-in without sending", async t => {
  const sent = [];
  mockDeliveryFetch(t, async (_url, options) => {
    sent.push(JSON.parse(options.body));
    return new Response("ok");
  });
  t.after(() => t.mock.restoreAll());
  const settings = {
    ...env,
    ASSESSMENT_DELIVERY_MODE: "contact_capture_test",
    ASSESSMENT_TEST_EMAIL: " SOZO-TEST@example.com ",
  };
  for (const input of [
    { ...base, email: "other@example.com" },
    { ...base, smsConsent: true },
    { ...base, smsConsent: true, marketingConsent: true },
  ]) {
    assert.equal((await onRequest({ request: request(input), env: settings })).status, 403);
  }
  assert.equal(sent.length, 0);
  for (const marketingConsent of [false, true]) {
    assert.equal((await onRequest({
      request: request({ ...base, email: "SOZO-TEST@example.com", marketingConsent }),
      env: settings,
    })).status, 201);
    const payload = sent.at(-1);
    assert.equal(payload.email, base.email);
    assert.equal(payload.sms_consent, false);
    assert.equal(payload.marketing_consent, marketingConsent);
    // Real controlled contact, not the synthetic mapping sample filtered by the Zap.
    assert.equal(payload.is_test, false);
  }
  assert.equal(sent.length, 2);
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

test("SMS test configuration fails closed without both valid recipient settings", async t => {
  const fetch = t.mock.method(globalThis, "fetch", () => { throw new Error("Must not fetch"); });
  t.after(() => t.mock.restoreAll());
  const smsEnv = { ...env, ASSESSMENT_DELIVERY_MODE: "sms_delivery_test", ASSESSMENT_TEST_EMAIL: base.email };
  for (const phone of [undefined, "", "2025550147", "+0012345678", "not a phone"]) {
    const response = await onRequest({
      request: request({ ...base, smsConsent: true }),
      env: { ...smsEnv, ASSESSMENT_TEST_PHONE: phone },
    });
    assert.equal(response.status, 503);
  }
  for (const email of [undefined, "", "not-an-email"]) {
    assert.equal((await onRequest({
      request: request({ ...base, smsConsent: true }),
      env: { ...smsEnv, ASSESSMENT_TEST_PHONE: base.phone, ASSESSMENT_TEST_EMAIL: email },
    })).status, 503);
  }
  assert.equal(fetch.mock.callCount(), 0);
});

test("SMS test permits only the configured recipient with explicit SMS consent and no marketing", async t => {
  const sent = [];
  mockDeliveryFetch(t, async (_url, options) => {
    sent.push(JSON.parse(options.body));
    return new Response("ok");
  });
  t.after(() => t.mock.restoreAll());
  const settings = {
    ...env, ASSESSMENT_DELIVERY_MODE: "sms_delivery_test",
    ASSESSMENT_TEST_EMAIL: ` ${base.email.toUpperCase()} `,
    ASSESSMENT_TEST_PHONE: ` ${base.phone} `,
  };
  for (const input of [
    { ...base, smsConsent: true, email: "other@example.com" },
    { ...base, smsConsent: true, phone: "+12025550148" },
    { ...base, smsConsent: false },
    { ...base, smsConsent: true, marketingConsent: true },
    { ...base, smsConsent: false, marketingConsent: true },
  ]) {
    const response = await onRequest({ request: request(input), env: settings });
    assert.equal(response.status, 403);
    const text = await response.text();
    assert.doesNotMatch(text, /sozo-test@example|\+12025550147/);
  }
  assert.equal(sent.length, 0);
  const input = { ...base, email: base.email.toUpperCase(), smsConsent: true };
  assert.equal((await onRequest({ request: request(input), env: settings })).status, 201);
  assert.equal(sent.length, 1);
  assert.equal(sent[0].email, base.email);
  assert.equal(sent[0].phone, base.phone);
  assert.equal(sent[0].sms_consent, true);
  assert.equal(sent[0].marketing_consent, false);
  assert.equal(sent[0].is_test, false);
  // The existing kill switch takes precedence even with a valid SMS recipient.
  assert.equal((await onRequest({
    request: request(input), env: { ...settings, ASSESSMENT_DELIVERY_ENABLED: "false" },
  })).status, 503);
  assert.equal(sent.length, 1);
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
    const fetch = mockDeliveryFetch(t, outcome);
    const response = await onRequest({ request: request(), env });
    assert.equal(response.status, 502);
    assert.equal(fetch.mock.callCount(), 1);
    assert.doesNotMatch(await response.text(), /secret|private|hooks\.zapier/);
    t.mock.restoreAll();
  }
});

test("sixth request from the same client is rate limited within the isolate", async t => {
  const fetch = mockDeliveryFetch(t, async () => new Response("ok"));
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

test("restricted tests expose only safe delivery diagnostics; live mode omits them", async t => {
  t.after(() => t.mock.restoreAll());
  const settings = { ...env, ASSESSMENT_DELIVERY_MODE: "contact_capture_test", ASSESSMENT_TEST_EMAIL: base.email };
  for (const [outcome, code, status] of [
    [() => new Response("private details", { status: 404 }), "WEBHOOK_HTTP_ERROR", 404],
    [() => new Response(null, { status: 302, headers: { Location: "https://private.example" } }), "WEBHOOK_HTTP_ERROR", 302],
    [() => { throw new DOMException("secret URL", "TimeoutError"); }, "WEBHOOK_TIMEOUT", undefined],
    [() => { throw new Error("secret URL"); }, "WEBHOOK_CONNECTION_ERROR", undefined],
  ]) {
    const fetch = mockDeliveryFetch(t, outcome);
    for (const selected of [settings, env]) {
      const response = await onRequest({ request: request(), env: selected });
      assert.equal(response.status, 502);
      const text = await response.text();
      assert.doesNotMatch(text, /secret|private|hooks\.zapier|sozo-test@example/);
      const data = JSON.parse(text);
      if (selected === settings) {
        assert.equal(data.diagnostic.code, code);
        assert.equal(data.diagnostic.upstream_status, status);
      } else {
        assert.equal(data.diagnostic, undefined);
      }
    }
    assert.equal(fetch.mock.callCount(), 2);
    t.mock.restoreAll();
  }
});

test("response cleanup failures do not mask confirmed webhook acceptance", async t => {
  mockDeliveryFetch(t, async () => ({
    ok: true, status: 200,
    body: { cancel: async () => { throw new Error("cleanup failure"); } },
  }));
  t.after(() => t.mock.restoreAll());
  assert.equal((await onRequest({ request: request(), env })).status, 201);
});

test("missing configuration or token cannot bypass verification in any mode", async t => {
  const fetch = t.mock.method(globalThis, "fetch", () => { throw new Error("Must not fetch"); });
  t.after(() => t.mock.restoreAll());
  for (const mode of ["live", "contact_capture_test", "sms_delivery_test"]) {
    const settings = { ...env, ASSESSMENT_DELIVERY_MODE: mode,
      ASSESSMENT_TEST_EMAIL: base.email, ASSESSMENT_TEST_PHONE: base.phone };
    const input = { ...base, smsConsent: mode === "sms_delivery_test" };
    for (const secret of [undefined, "", "  "]) {
      assert.equal((await onRequest({
        request: request(input), env: { ...settings, TURNSTILE_SECRET_KEY: secret },
      })).status, 503);
    }
    for (const [token, status] of [[undefined, 403], ["", 400], ["x".repeat(2049), 400]]) {
      assert.equal((await onRequest({
        request: request({ ...input, turnstileToken: token }), env: settings,
      })).status, status);
    }
  }
  assert.equal(fetch.mock.callCount(), 0);
});

test("failed, expired, reused, foreign and unavailable verification never reaches Zapier", async t => {
  t.after(() => t.mock.restoreAll());
  for (const [result, status] of [
    [{ success: false, "error-codes": ["invalid-input-response"] }, 403],
    [{ success: false, "error-codes": ["timeout-or-duplicate"] }, 403],
    [{ success: false, "error-codes": ["invalid-input-secret"] }, 503],
    [{ success: false, "error-codes": ["internal-error"] }, 503],
    [{ success: true, hostname: "other.example", action: "assessment_request" }, 403],
    [{ success: true, hostname: "website.example", action: "other_form" }, 403],
    [{ success: "true", hostname: "website.example", action: "assessment_request" }, 403],
    [null, 503],
  ]) {
    const fetch = t.mock.method(globalThis, "fetch", async url => {
      assert.equal(url, "https://challenges.cloudflare.com/turnstile/v0/siteverify");
      return Response.json(result);
    });
    const response = await onRequest({ request: request(), env });
    assert.equal(response.status, status);
    assert.doesNotMatch(await response.text(), /mock-only|other\.example|invalid-input-secret/);
    assert.equal(fetch.mock.callCount(), 1);
    t.mock.restoreAll();
  }
  for (const outcome of [
    () => new Response("private error", { status: 503 }),
    () => new Response("not JSON"),
    () => { throw new DOMException("private detail", "TimeoutError"); },
    () => { throw new Error("private URL"); },
  ]) {
    const fetch = t.mock.method(globalThis, "fetch", async url => {
      assert.equal(url, "https://challenges.cloudflare.com/turnstile/v0/siteverify");
      return outcome();
    });
    const response = await onRequest({ request: request(), env });
    assert.equal(response.status, 503);
    assert.equal(fetch.mock.callCount(), 1);
    assert.doesNotMatch(await response.text(), /private|mock-only/);
    t.mock.restoreAll();
  }
});

test("verification uses Workers-supported redirect handling and never follows redirects", async t => {
  t.after(() => t.mock.restoreAll());
  const urls = [];
  let redirectVerification = false;
  t.mock.method(globalThis, "fetch", async (url, options) => {
    // Model workerd's restriction: Node's native fetch accepts this unsupported mode.
    if (options.redirect === "error") throw new TypeError("Unsupported redirect mode");
    assert.equal(options.redirect, "manual");
    urls.push(url);
    if (url === "https://challenges.cloudflare.com/turnstile/v0/siteverify") {
      if (redirectVerification) {
        return new Response(null, { status: 302, headers: { Location: "https://never-follow.example" } });
      }
      return Response.json({ success: true, hostname: "website.example", action: "assessment_request" });
    }
    assert.equal(url, env.ZAPIER_ASSESSMENT_WEBHOOK_URL);
    return new Response("ok");
  });
  assert.equal((await onRequest({ request: request(), env })).status, 201);
  assert.deepEqual(urls, [
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    env.ZAPIER_ASSESSMENT_WEBHOOK_URL,
  ]);
  urls.length = 0;
  redirectVerification = true;
  const rejected = await onRequest({ request: request(), env });
  assert.equal(rejected.status, 503);
  assert.equal((await rejected.json()).error, "Security verification unavailable.");
  assert.deepEqual(urls, ["https://challenges.cloudflare.com/turnstile/v0/siteverify"]);
});
