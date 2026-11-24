import { HOLIDAY_END, HOLIDAY_ERROR, HOLIDAY_START, validateHolidayClaim, type HolidayAvailability } from '../../artifacts/sozo-wellness/src/lib/holiday-offers.ts';
import { holidayConfigured, HolidayProviderError, saveHolidayClaim, type HolidayEnv } from '../_holiday/mailchimp.ts';
import { verifyTurnstile } from '../_shared/turnstile.ts';
import { holidayPreviewTestAllowed } from '../_holiday/preview-test.ts';

const json = (status: number, body: unknown) => Response.json(body, {
  status, headers: {
    'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff',
    'X-Robots-Tag': 'noindex, nofollow',
  },
});

export function holidayAvailability(env: HolidayEnv, now = Date.now(), requestUrl?: string): HolidayAvailability {
  if (env.HOLIDAY_CLAIMS_ENABLED !== 'true') return { accepting: false, reason: 'disabled' };
  if (!holidayConfigured(env)) return { accepting: false, reason: 'unavailable' };
  if (env.HOLIDAY_PREVIEW_TEST === 'true') {
    if (!holidayPreviewTestAllowed(env, requestUrl, now)) return { accepting: false, reason: 'unavailable' };
    return { accepting: true, reason: 'open', testMode: true };
  }
  if (now < Date.parse(HOLIDAY_START)) return { accepting: false, reason: 'upcoming' };
  if (now >= Date.parse(HOLIDAY_END)) return { accepting: false, reason: 'closed' };
  return { accepting: true, reason: 'open' };
}

/** Isolated Cloudflare Pages function. Does not touch giveaway or Zapier flows. */
export async function onRequest({ request, env }: { request: Request; env: HolidayEnv }) {
  if (request.method === 'GET') return json(200, holidayAvailability(env, Date.now(), request.url));
  if (request.method !== 'POST') return new Response(null, { status: 405, headers: { Allow: 'GET, POST' } });
  if (request.headers.get('Origin') !== new URL(request.url).origin) return json(403, { ok: false, error: 'Please submit from the SOZO website.' });
  const available = holidayAvailability(env, Date.now(), request.url);
  if (!available.accepting) return json(503, {
    ok: false, error: available.reason === 'upcoming'
      ? 'Reservations open November 25, 2026. Please return then.'
      : available.reason === 'closed'
        ? 'This holiday reservation period has ended. Please call 352-802-2248.'
        : 'Online reservations are not enabled. Please call 352-802-2248.',
  });
  let input: unknown;
  try {
    if (request.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase() !== 'application/json') throw new Error('JSON required');
    const reader = request.body?.getReader();
    if (!reader) throw new Error('Missing body');
    const chunks: Uint8Array[] = [];
    let length = 0;
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        length += value.byteLength;
        if (length > 12_288) { await reader.cancel(); throw new Error('Too large'); }
        chunks.push(value);
      }
    } finally { reader.releaseLock(); }
    const bytes = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    input = JSON.parse(new TextDecoder().decode(bytes));
  } catch { return json(400, { ok: false, error: 'Please check your form and try again.' }); }
  const { value, errors } = validateHolidayClaim(input);
  if (Object.keys(errors).length) return json(400, { ok: false, error: 'Please check the highlighted fields.', fieldErrors: errors });
  if (available.testMode) {
    if (value.email !== env.HOLIDAY_TEST_EMAIL!.trim().toLowerCase()) return json(400, {
      ok: false, error: 'This preview accepts only the approved test email address.',
      fieldErrors: { email: 'Use the email address configured for this controlled test.' },
    });
    if (value.marketingConsent) return json(400, {
      ok: false, error: 'Leave promotional emails unchecked for this reservation-only test.',
      fieldErrors: { marketingConsent: 'Leave this unchecked during the controlled test.' },
    });
  }
  const verification = await verifyTurnstile(env.TURNSTILE_SECRET_KEY, value.turnstileToken,
    request.headers.get('CF-Connecting-IP') || '', new URL(request.url).hostname, 'holiday_claim');
  if (verification !== 'verified') return json(verification === 'rejected' ? 403 : 503, {
    ok: false, error: 'Please complete a fresh security check and try again.',
  });
  try {
    await saveHolidayClaim(env, value);
    return json(200, { ok: true });
  } catch (error) {
    // Log only a controlled stage and status, never the provider's raw payload.
    if (error instanceof HolidayProviderError) console.warn(error.message);
    else console.warn('Holiday reservation provider response failed.');
    return json(502, { ok: false, error: HOLIDAY_ERROR });
  }
}
