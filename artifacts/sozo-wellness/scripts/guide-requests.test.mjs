import assert from "node:assert/strict";
import { test } from "node:test";
import { onRequest } from "../../../functions/api/guide-requests.ts";
import { perfectDayBook } from "../src/data/perfect-day.ts";

const env = {
  GUIDE_DELIVERY_ENABLED: "true",
  GUIDE_DELIVERY_MODE: "live",
  TURNSTILE_SECRET_KEY: "mock-only-secret",
  ZAPIER_GUIDE_WEBHOOK_URL: "https://hooks.zapier.com/hooks/catch/000000/mock-guide/",
  ZAPIER_ASSESSMENT_WEBHOOK_URL: "https://hooks.zapier.com/hooks/catch/000000/mock-assessment/",
};
const base = {
  firstName: "TEST",
  email: "book-test@example.com",
  marketingConsent: false,
  website: "",
  requestId: "ed147422-1b3b-4ba4-aa00-e8499ba8b6a0",
  turnstileToken: "mock-only-token",
};
let ip = 0;
function request(body = base, options = {}) {
  const { headers = {}, ...rest } = options;
  return new Request("https://website.example/api/guide-requests", {
    method: "POST", body: JSON.stringify(body), ...rest,
    headers: { Origin: "https://website.example", "Content-Type": "application/json",
      "CF-Connecting-IP": `198.51.100.${++ip}`, ...headers },
  });
}
function mockFetch(t, delivery, verification = { success: true, hostname: "website.example", action: "guide_request" }) {
  const calls = [];
  t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(options.redirect, "manual");
    assert.ok(options.signal instanceof AbortSignal);
    calls.push({ url, body: JSON.parse(options.body) });
    if (url === "https://challenges.cloudflare.com/turnstile/v0/siteverify") {
      return Response.json(verification);
    }
    assert.equal(url, env.ZAPIER_GUIDE_WEBHOOK_URL);
    return delivery ? delivery(options) : new Response('{"status":"success"}');
  });
  t.after(() => t.mock.restoreAll());
  return calls;
}

test("availability is non-cached and never exposes recipients or secrets", async () => {
  const settings = { ...env, GUIDE_DELIVERY_MODE: "test", GUIDE_TEST_EMAIL: "book-test@example.com" };
  const response = await onRequest({ request: new Request("https://website.example/api/guide-requests"), env: settings });
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(await response.json(), { enabled: true, mode: "test" });
});

test("disabled, incomplete, misconfigured and assessment-hook configurations fail closed without fetching", async t => {
  const spy = t.mock.method(globalThis, "fetch", () => { throw new Error("Must not fetch"); });
  t.after(() => t.mock.restoreAll());
  for (const settings of [{}, { ...env, GUIDE_DELIVERY_ENABLED: "false" }, { ...env, GUIDE_DELIVERY_MODE: "" },
    { ...env, TURNSTILE_SECRET_KEY: "" }, { ...env, GUIDE_DELIVERY_MODE: "test" },
    { ...env, ZAPIER_GUIDE_WEBHOOK_URL: env.ZAPIER_ASSESSMENT_WEBHOOK_URL },
    { ...env, ZAPIER_GUIDE_WEBHOOK_URL: "https://untrusted.example/hook" }]) {
    assert.equal((await onRequest({ request: request(), env: settings })).status, 503);
  }
  assert.equal(spy.mock.callCount(), 0);
});

test("only the strict separate book contract is accepted", async t => {
  const spy = t.mock.method(globalThis, "fetch", () => { throw new Error("Must not fetch"); });
  t.after(() => t.mock.restoreAll());
  for (const changes of [{ firstName: "  " }, { email: "invalid" }, { marketingConsent: undefined },
    { marketingConsent: "false" }, { website: "bot.example" }, { turnstileToken: "" },
    { requestId: "invalid" }, { phone: "+12025550147" }, { smsConsent: true }, { firstName: "x".repeat(81) }]) {
    assert.equal((await onRequest({ request: request({ ...base, ...changes }), env })).status, 400);
  }
  assert.equal(spy.mock.callCount(), 0);
});

test("origin, content type, size and missing edge identity are checked before delivery", async t => {
  const spy = t.mock.method(globalThis, "fetch", () => { throw new Error("Must not fetch"); });
  t.after(() => t.mock.restoreAll());
  assert.equal((await onRequest({ request: request(base, { headers: { Origin: "https://foreign.example" } }), env })).status, 403);
  assert.equal((await onRequest({ request: request(base, { headers: { "Content-Type": "text/plain" } }), env })).status, 415);
  const missingIP = request(); missingIP.headers.delete("CF-Connecting-IP");
  assert.equal((await onRequest({ request: missingIP, env })).status, 403);
  assert.equal((await onRequest({ request: request({ ...base, padding: "x".repeat(9000) }), env })).status, 413);
  assert.equal(spy.mock.callCount(), 0);
});

test("security rejects assessment tokens, wrong hosts and expired tokens without a webhook", async t => {
  let verification = { success: true, hostname: "website.example", action: "assessment_request" };
  let webhooks = 0;
  t.mock.method(globalThis, "fetch", async url => {
    if (url === "https://challenges.cloudflare.com/turnstile/v0/siteverify") return Response.json(verification);
    webhooks++; throw new Error("Must not forward");
  });
  t.after(() => t.mock.restoreAll());
  for (const data of [verification, { success: true, hostname: "foreign.example", action: "guide_request" }, { success: false }]) {
    verification = data;
    assert.equal((await onRequest({ request: request(), env })).status, 403);
  }
  assert.equal(webhooks, 0);
});

test("verification service failure explicitly does not forward the book request", async t => {
  const calls = mockFetch(t, undefined, { success: false, "error-codes": ["internal-error"] });
  assert.equal((await onRequest({ request: request(), env })).status, 503);
  assert.equal(calls.length, 1);
});

test("test mode only accepts the approved email and labels the resulting book event", async t => {
  const calls = mockFetch(t);
  const settings = { ...env, GUIDE_DELIVERY_MODE: "test", GUIDE_TEST_EMAIL: "book-test@example.com" };
  assert.equal((await onRequest({ request: request({ ...base, email: "not-approved@example.com" }), env: settings })).status, 403);
  assert.equal(calls.length, 0);
  assert.equal((await onRequest({ request: request(), env: settings })).status, 201);
  assert.equal(calls[1].body.is_test, true);
});

test("book fulfillment is independent of marketing, normalized, and never sends phone, token or SMS consent", async t => {
  const calls = mockFetch(t);
  for (const marketingConsent of [false, true]) {
    const response = await onRequest({ request: request({ ...base, firstName: " TEST ", email: " BOOK-TEST@EXAMPLE.COM ", marketingConsent }), env });
    assert.equal(response.status, 201);
    assert.equal(response.headers.get("cache-control"), "no-store");
    const receipt = await response.json();
    assert.equal(receipt.downloadUrl, perfectDayBook.downloadUrl);
    assert.equal(receipt.requestId, base.requestId);
    assert.match(receipt.message, /accepted for processing/);
    const payload = calls.at(-1).body;
    assert.equal(payload.form_type, "perfect_day_book");
    assert.equal(payload.source, "sozo_website_book");
    assert.equal(payload.email, base.email);
    assert.equal(payload.first_name, "TEST");
    assert.equal(payload.sms_consent, false);
    assert.equal(payload.marketing_consent, marketingConsent);
    assert.equal(payload.book_request_consent, true);
    assert.equal(payload.book_download_url, perfectDayBook.downloadUrl);
    for (const field of ["phone", "turnstileToken", "turnstile_token", "website", "interest", "message"]) assert.equal(field in payload, false);
    assert.equal(calls.at(-2).body.response, base.turnstileToken);
  }
});

test("upstream rejection, redirect and timeout are ambiguous and never retried", async t => {
  let result = () => new Response("", { status: 500 });
  const calls = mockFetch(t, () => result());
  for (const callback of [
    () => new Response("", { status: 500 }),
    () => new Response("", { status: 302, headers: { Location: "https://foreign.example" } }),
    () => { throw new DOMException("Timed out", "TimeoutError"); },
  ]) {
    result = callback;
    const response = await onRequest({ request: request(), env });
    assert.equal(response.status, 502);
    assert.equal((await response.json()).deliveryUnconfirmed, true);
  }
  assert.equal(calls.filter(call => call.url === env.ZAPIER_GUIDE_WEBHOOK_URL).length, 3);
});

test("unsupported methods and excessive attempts cannot queue emails", async t => {
  const calls = mockFetch(t);
  assert.equal((await onRequest({ request: new Request("https://website.example/api/guide-requests", { method: "DELETE" }), env })).status, 405);
  for (let attempt = 0; attempt < 5; attempt++) {
    assert.equal((await onRequest({ request: request({ ...base, email: "invalid" }, { headers: { "CF-Connecting-IP": "203.0.113.200" } }), env })).status, 400);
  }
  const limited = await onRequest({ request: request(base, { headers: { "CF-Connecting-IP": "203.0.113.200" } }), env });
  assert.equal(limited.status, 429);
  assert.equal(limited.headers.get("retry-after"), "3600");
  assert.equal(calls.length, 0);
});
