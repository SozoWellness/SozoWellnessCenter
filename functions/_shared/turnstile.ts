const siteverifyUrl = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/** No contact details are sent to Siteverify; never expose its raw response. */
export async function verifyTurnstile(
  secret: string | undefined, token: string | undefined, ip: string, hostname: string,
): Promise<"verified" | "rejected" | "unavailable"> {
  if (!secret?.trim()) return "unavailable";
  if (!token || token.length > 2048) return "rejected";
  try {
    const response = await fetch(siteverifyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: secret.trim(), response: token, remoteip: ip }),
      // Workers does not implement redirect:"error". Do not follow redirects;
      // the response.ok check below rejects 3xx without sending secrets onward.
      redirect: "manual",
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return "unavailable";
    const result: unknown = await response.json();
    if (!result || typeof result !== "object") return "unavailable";
    const data = result as Record<string, unknown>;
    if (data.success !== true) {
      const codes = data["error-codes"];
      if (Array.isArray(codes) && codes.some(code =>
        ["missing-input-secret", "invalid-input-secret", "internal-error"].includes(code))) {
        return "unavailable";
      }
      return "rejected";
    }
    return data.hostname === hostname && data.action === "assessment_request"
      ? "verified" : "rejected";
  } catch {
    // Fail closed on timeout, redirects, malformed JSON, and network errors.
    return "unavailable";
  }
}
