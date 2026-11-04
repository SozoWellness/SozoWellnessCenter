import { SubmitGuideRequestBody } from "../../lib/api-zod/src/generated/api.ts";
import { perfectDayBook } from "../../artifacts/sozo-wellness/src/data/perfect-day.ts";
import { verifyTurnstile } from "../_shared/turnstile.ts";

interface Env {
  GUIDE_DELIVERY_ENABLED?: string;
  GUIDE_DELIVERY_MODE?: string;
  GUIDE_TEST_EMAIL?: string;
  ZAPIER_GUIDE_WEBHOOK_URL?: string;
  ZAPIER_ASSESSMENT_WEBHOOK_URL?: string;
  TURNSTILE_SECRET_KEY?: string;
}

const maxBodyBytes = 8192;
// Best-effort isolate protection only. Also configure an edge rate-limit rule.
const attempts = new Map<string, number[]>();
const hour = 3_600_000;
const unavailable = "Book requests are not available yet. Please text or call 352-802-2248.";
const json = (status: number, body: object, headers: Record<string, string> = {}) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });

function configuration(env: Env): { hook: URL; mode: "test" | "live"; testEmail?: string } | undefined {
  if (env.GUIDE_DELIVERY_ENABLED !== "true" || !env.TURNSTILE_SECRET_KEY?.trim()) return;
  const mode = env.GUIDE_DELIVERY_MODE;
  if (mode !== "test" && mode !== "live") return;
  const testEmail = env.GUIDE_TEST_EMAIL?.trim().toLowerCase();
  if (mode === "test" && !SubmitGuideRequestBody.shape.email.safeParse(testEmail).success) return;
  try {
    const hook = new URL(env.ZAPIER_GUIDE_WEBHOOK_URL ?? "");
    if (hook.protocol !== "https:" || hook.hostname !== "hooks.zapier.com" ||
        hook.port || hook.username || hook.password || hook.search || hook.hash ||
        !/^\/hooks\/catch\/[^/]+\/[^/]+\/?$/.test(hook.pathname)) return;
    // A separate endpoint and a separate Zap: no assessment SMS branch.
    if (hook.href.replace(/\/+$/, "") === env.ZAPIER_ASSESSMENT_WEBHOOK_URL?.trim().replace(/\/+$/, "")) return;
    return { hook, mode, testEmail };
  } catch { return; }
}

async function readBody(request: Request): Promise<unknown> {
  const reader = request.body?.getReader();
  if (!reader) throw new Error("Missing body");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBodyBytes) {
        await reader.cancel();
        throw new RangeError("Body too large");
      }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return JSON.parse(new TextDecoder().decode(bytes));
}

export async function onRequest({ request, env }: { request: Request; env: Env }): Promise<Response> {
  const config = configuration(env);
  if (request.method === "GET") {
    return json(200, { enabled: Boolean(config), mode: config?.mode ?? "disabled" });
  }
  if (request.method !== "POST") return json(405, { error: "Method not allowed." }, { Allow: "GET, POST" });
  if (!config) return json(503, { error: unavailable });
  const url = new URL(request.url);
  if (request.headers.get("Origin") !== url.origin) return json(403, { error: "Please request the book from this website." });
  if (request.headers.get("Content-Type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    return json(415, { error: "Expected a JSON request." });
  }
  const ip = request.headers.get("CF-Connecting-IP");
  if (!ip) return json(403, { error: "Unable to verify the request." });
  const now = Date.now();
  const recent = (attempts.get(ip) ?? []).filter(time => now - time < hour);
  if (recent.length >= 5) return json(429, { error: "Too many attempts. Please try later or call 352-802-2248." }, { "Retry-After": "3600" });
  attempts.delete(ip);
  attempts.set(ip, [...recent, now]);
  if (attempts.size > 5000) attempts.delete(attempts.keys().next().value!);

  let body: unknown;
  try { body = await readBody(request); } catch (error) {
    return json(error instanceof RangeError ? 413 : 400, { error: "Please check the book request fields." });
  }
  if (body && typeof body === "object" && !Array.isArray(body)) {
    const input = body as Record<string, unknown>;
    if (typeof input.firstName === "string") input.firstName = input.firstName.trim().replace(/\s+/g, " ");
    if (typeof input.email === "string") input.email = input.email.trim().toLowerCase();
  }
  const parsed = SubmitGuideRequestBody.strict().safeParse(body);
  if (!parsed.success || /[\u0000-\u001f\u007f]/.test(parsed.data.firstName)) {
    return json(400, { error: "Please enter your first name, a valid email address and complete the security check." });
  }
  if (config.mode === "test" && parsed.data.email !== config.testEmail) {
    return json(403, { error: "Book delivery testing is restricted to the approved test email." });
  }
  const verification = await verifyTurnstile(
    env.TURNSTILE_SECRET_KEY, parsed.data.turnstileToken, ip, url.hostname, "guide_request",
  );
  if (verification !== "verified") {
    return json(verification === "rejected" ? 403 : 503, {
      error: verification === "rejected"
        ? "The security check failed or expired. Please retry the check."
        : "The security verification service is unavailable. Your book request was not forwarded.",
    });
  }
  const payload = {
    request_id: parsed.data.requestId,
    submitted_at: new Date().toISOString(),
    source: "sozo_website_book",
    form_type: "perfect_day_book",
    is_test: config.mode === "test",
    first_name: parsed.data.firstName,
    email: parsed.data.email,
    book_title: perfectDayBook.title,
    book_author: perfectDayBook.author,
    book_download_url: perfectDayBook.downloadUrl,
    book_request_consent: true,
    marketing_consent: parsed.data.marketingConsent,
    sms_consent: false,
    consent_version: "perfect-day-request-v1",
  };
  try {
    const response = await fetch(config.hook.href, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      redirect: "manual",
      signal: AbortSignal.timeout(10_000),
    });
    try { await response.body?.cancel(); } catch { /* A cleanup failure is not a delivery failure. */ }
    if (!response.ok) throw new Error("Webhook not accepted");
  } catch {
    // No automatic retries, contact details, tokens, URLs or upstream bodies.
    return json(502, {
      error: "We could not confirm your book request. Please check your email, including spam, or call 352-802-2248 before submitting again.",
      deliveryUnconfirmed: true,
    });
  }
  return json(201, {
    success: true,
    message: "Your book request has been accepted for processing. Open the PDF below. An email with the link has been requested; check your inbox and spam folder.",
    downloadUrl: perfectDayBook.downloadUrl,
    requestId: parsed.data.requestId,
  });
}
