import { SubmitAssessmentRequestBody } from "../../lib/api-zod/src/generated/api.ts";

interface Env {
  ZAPIER_ASSESSMENT_WEBHOOK_URL?: string;
  ASSESSMENT_DELIVERY_ENABLED?: string;
}

const maxBodyBytes = 16 * 1024;
const windowMs = 60 * 60 * 1000;
// Best-effort protection within one isolate, not a distributed rate limiter.
const attempts = new Map<string, number[]>();

function json(status: number, body: object, extraHeaders: Record<string, string> = {}) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...extraHeaders },
  });
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
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return JSON.parse(new TextDecoder().decode(bytes));
}

export async function onRequest({ request, env }: { request: Request; env: Env }): Promise<Response> {
  if (request.method !== "POST") {
    return json(405, { error: "Method not allowed." }, { Allow: "POST" });
  }
  // Explicit opt-in at deployment; never silently discard or pretend to deliver.
  if (env.ASSESSMENT_DELIVERY_ENABLED !== "true") {
    return json(503, { error: "Online requests are not enabled. Please text or call 352-802-2248." });
  }
  if (request.headers.get("Origin") !== new URL(request.url).origin) {
    return json(403, { error: "Please submit your request from this website." });
  }
  if (request.headers.get("Content-Type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    return json(415, { error: "Expected a JSON request." });
  }
  const ip = request.headers.get("CF-Connecting-IP");
  if (!ip) return json(403, { error: "Unable to verify the request." });
  const now = Date.now();
  const recent = (attempts.get(ip) ?? []).filter(time => now - time < windowMs);
  if (recent.length >= 5) {
    return json(429, { error: "Too many requests. Please text or call 352-802-2248." }, { "Retry-After": "3600" });
  }
  attempts.delete(ip);
  attempts.set(ip, [...recent, now]);
  // Bound memory, including when many distinct clients send invalid requests.
  if (attempts.size > 5000) attempts.delete(attempts.keys().next().value!);

  let body: unknown;
  try {
    body = await readBody(request);
  } catch (error) {
    return json(error instanceof RangeError ? 413 : 400, { error: "Please check your request and try again." });
  }
  // Same generated contract as the Replit API, including the honeypot.
  const parsed = SubmitAssessmentRequestBody.strict().safeParse(body);
  if (!parsed.success || parsed.data.name.trim().length < 2 || !parsed.data.interest.trim()) {
    return json(400, { error: "Please check the required fields and try again." });
  }

  let hook: URL;
  try {
    hook = new URL(env.ZAPIER_ASSESSMENT_WEBHOOK_URL ?? "");
    if (hook.protocol !== "https:" || hook.hostname !== "hooks.zapier.com" ||
        hook.port || hook.username || hook.password || hook.search || hook.hash ||
        !/^\/hooks\/catch\/[^/]+\/[^/]+\/?$/.test(hook.pathname)) {
      throw new Error("Invalid webhook configuration");
    }
  } catch {
    return json(503, { error: "Online requests are unavailable. Please text or call 352-802-2248." });
  }

  const input = parsed.data;
  const name = input.name.trim().replace(/\s+/g, " ");
  const [firstName, ...rest] = name.split(" ");
  const payload = {
    request_id: crypto.randomUUID(),
    is_test: false,
    source: "sozo_website",
    form_type: "initial_assessment",
    name,
    first_name: firstName,
    last_name: rest.join(" "),
    email: input.email.trim().toLowerCase(),
    phone: input.phone,
    interest: input.interest.trim(),
    message: input.message?.trim() ?? "",
    consent: input.consent,
    sms_consent: input.smsConsent,
    marketing_consent: input.marketingConsent,
    submitted_at: new Date().toISOString(),
  };

  try {
    // One attempt only: retries after an ambiguous timeout can duplicate texts.
    const response = await fetch(hook.href, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      redirect: "error",
      signal: AbortSignal.timeout(10_000),
    });
    await response.body?.cancel();
    if (!response.ok) throw new Error("Webhook rejected");
  } catch {
    // Never log/return webhook URLs, upstream response bodies or contact details.
    return json(502, {
      error: "We could not confirm delivery. Please text or call 352-802-2248 before submitting again.",
    });
  }

  return json(201, {
    success: true,
    message: "Your request has been accepted for processing. This does not reserve an appointment.",
  });
}
