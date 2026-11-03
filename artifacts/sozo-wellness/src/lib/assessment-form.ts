/**
 * Normalize US national numbers or explicitly international numbers for the API.
 * This checks formatting, not whether a number belongs to a mobile device.
 */
export function normalizeAssessmentMobile(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed || !/^\+?[\d\s().-]+$/.test(trimmed)) return null;
  const digits = trimmed.replace(/\D/g, '');
  if (trimmed.startsWith('+')) {
    return /^[1-9]\d{7,14}$/.test(digits) ? `+${digits}` : null;
  }
  if (/^\d{10}$/.test(digits)) return `+1${digits}`;
  if (/^1\d{10}$/.test(digits)) return `+${digits}`;
  return null;
}

/** Show actionable errors without exposing arbitrary response bodies or URLs. */
export function assessmentErrorMessage(error: unknown): string {
  const fallback = 'We couldn’t confirm your request. Please don’t submit again until delivery has been checked. You can ';
  if (!error || typeof error !== 'object' || !('status' in error)) return fallback;
  const data = 'data' in error ? error.data : null;
  const reason = data && typeof data === 'object' && 'error' in data ? data.error : null;
  switch (error.status) {
    case 400:
      return 'Your request was rejected before delivery. Please check your name, email, mobile number, selected interest and required request consent. For help, ';
    case 403:
      if (reason === 'SMS delivery testing is restricted. Use the approved test email and mobile number, check text consent, and leave marketing email unchecked.') {
        return 'This text test requires the email and mobile number configured in Cloudflare, text consent checked, and marketing email unchecked. The request was not forwarded. For help, ';
      }
      return reason === 'Contact capture testing is restricted. Use the approved test email and leave automated texts unchecked.'
        ? 'This test only accepts the email configured in Cloudflare, with automated text consent unchecked. The request was not forwarded. For help, '
        : 'The website could not verify this submission, so it was not forwarded. Please use the form directly on the website. For help, ';
    case 429:
      return 'Too many attempts have been made from this connection. This attempt was not forwarded. Please wait at least one hour before trying again, or ';
    case 503:
      return reason === 'Online requests are not enabled. Please text or call 352-802-2248.'
        ? 'Online requests are still disabled in the deployed settings. This request was not forwarded. For help, '
        : 'The website’s delivery settings are incomplete or unavailable. This request was not forwarded. For help, ';
    case 502: {
      const diagnostic = data && typeof data === 'object' && 'diagnostic' in data ? data.diagnostic : null;
      if (diagnostic && typeof diagnostic === 'object' && 'code' in diagnostic) {
        if (diagnostic.code === 'WEBHOOK_HTTP_ERROR' && 'upstream_status' in diagnostic &&
            typeof diagnostic.upstream_status === 'number' &&
            Number.isInteger(diagnostic.upstream_status) &&
            diagnostic.upstream_status >= 300 && diagnostic.upstream_status <= 599) {
          return `Delivery test: Zapier returned HTTP ${diagnostic.upstream_status}. Do not resubmit; report this code and check Zap History, or `;
        }
        if (diagnostic.code === 'WEBHOOK_TIMEOUT') {
          return 'Delivery test: the connection to Zapier timed out (WEBHOOK_TIMEOUT). Check Zap History before submitting again, or ';
        }
        if (diagnostic.code === 'WEBHOOK_CONNECTION_ERROR') {
          return 'Delivery test: the server could not complete its connection to Zapier (WEBHOOK_CONNECTION_ERROR). Do not resubmit; report this code, or ';
        }
      }
      return 'We couldn’t confirm delivery. Please check Zap History before submitting again, or ';
    }
    default:
      return fallback;
  }
}
