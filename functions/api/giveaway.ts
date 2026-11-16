import { WELLNESS_GOALS } from '../../artifacts/sozo-wellness/src/lib/giveaway-contract.ts';
import { verifyTurnstile } from '../_shared/turnstile.ts';
import { accepting, body, campaign, CAMPAIGN_ID, json } from '../_giveaway/common.ts';
import { syncEntry } from '../_giveaway/mailchimp.ts';
import type { GiveawayEnv } from '../_giveaway/types.ts';

export async function onRequest({ request, env }: { request: Request; env: GiveawayEnv }): Promise<Response> {
  if (!['GET', 'POST'].includes(request.method)) return json(405, { error: 'Method not allowed.' }, { Allow: 'GET, POST' });
  try {
    const settings = await campaign(env.GIVEAWAY_DB);
    const open = accepting(settings, env);
    if (request.method === 'GET') return json(200, {
      campaign: settings, acceptingEntries: open,
      message: open ? 'Entries are open.' : settings.status === 'closed' || (settings.endsAt && Date.parse(settings.endsAt) <= Date.now())
        ? 'This giveaway is closed to new entries.' : 'This giveaway is not accepting entries yet. Please check back.',
    });
    if (!open) return json(503, { error: 'This giveaway is not accepting entries right now.' });
    let input: Record<string, unknown>;
    try { input = await body(request); } catch { return json(400, { error: 'Please submit a valid entry from this website.' }); }
    const firstName = typeof input.firstName === 'string' ? input.firstName.trim() : '';
    const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
    const rawPhone = typeof input.phone === 'string' ? input.phone.replace(/[\s().+-]/g, '') : '';
    const phone = /^[2-9]\d{9}$/.test(rawPhone) ? `+1${rawPhone}` : /^1[2-9]\d{9}$/.test(rawPhone) ? `+${rawPhone}` : '';
    const interest = typeof input.wellnessInterest === 'string' ? input.wellnessInterest : '';
    if (!firstName || firstName.length > 80 || /[\u0000-\u001f]/.test(firstName) ||
      email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !phone ||
      (interest && !(WELLNESS_GOALS as readonly string[]).includes(interest)) ||
      input.marketingConsent !== true || input.rulesAccepted !== true || input.eligible !== true ||
      (input.website !== undefined && input.website !== '')) {
      return json(400, { error: 'Check your name, email, US mobile number, consent, eligibility, and rules acceptance.' });
    }
    const ip = request.headers.get('CF-Connecting-IP');
    if (!ip) return json(403, { error: 'Unable to verify your entry. Please try again on the website.' });
    // A shared vendor-event connection may serve many phones. Bound bursts,
    // not total event entries. Store only a secret-salted IP digest for one day.
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${env.TURNSTILE_SECRET_KEY}\n${ip}`));
    const bucket = Array.from(new Uint8Array(digest)).map(n => n.toString(16).padStart(2, '0')).join('');
    const minute = Math.floor(Date.now() / 60_000);
    const limit = await env.GIVEAWAY_DB!.prepare(`INSERT INTO giveaway_attempts(bucket,started_at,attempts) VALUES(?,?,1)
      ON CONFLICT(bucket) DO UPDATE SET attempts=CASE WHEN started_at<excluded.started_at THEN 1 ELSE attempts+1 END,started_at=excluded.started_at
      WHERE started_at<excluded.started_at OR attempts<30`).bind(bucket,minute).run();
    if (limit.meta.changes !== 1) return json(429, { error: 'There have been several attempts from this connection. Please wait one minute and try again.' }, { 'Retry-After': '60' });
    await env.GIVEAWAY_DB!.prepare('DELETE FROM giveaway_attempts WHERE started_at<?').bind(minute - 1440).run();
    const verified = await verifyTurnstile(env.TURNSTILE_SECRET_KEY, typeof input.turnstileToken === 'string' ? input.turnstileToken : '', ip, new URL(request.url).hostname, 'giveaway_entry');
    if (verified !== 'verified') return json(verified === 'unavailable' ? 503 : 400, { error: 'Please retry the security check before entering.' });
    const attribution = input.attribution && typeof input.attribution === 'object' ? input.attribution as Record<string, unknown> : {};
    const clean = (key: string) => typeof attribution[key] === 'string' ? (attribution[key] as string).replace(/[^a-zA-Z0-9 _.-]/g, '').slice(0, 80) : '';
    const id = crypto.randomUUID();
    const timestamp = new Date().toISOString();
    // The INSERT SELECT rechecks campaign state atomically with duplicate constraints.
    try {
      const inserted = await env.GIVEAWAY_DB!.prepare(`INSERT INTO giveaway_entries
        (id,campaign_id,first_name,email,phone,wellness_interest,created_at,marketing_consent,rules_version,qr_source,utm_source,utm_medium,utm_campaign,utm_content)
        SELECT ?,id,?,?,?,?,?,1,rules_version,?,?,?,?,? FROM giveaway_campaigns
        WHERE id=? AND status='active' AND rules_approved=1 AND prize_value>0 AND starts_at<=? AND ends_at>?`)
        .bind(id, firstName, email, phone, interest, timestamp, clean('qrSource'), clean('utmSource'), clean('utmMedium'), clean('utmCampaign'), clean('utmContent'), CAMPAIGN_ID, timestamp, timestamp).run();
      if (inserted.meta.changes !== 1) return json(409, { error: 'The entry period has ended or the giveaway has been paused.' });
    } catch (error) {
      if (/unique/i.test(String(error))) return json(409, { error: 'An entry with this email or mobile number has already been received. Only one entry per person is allowed.' });
      throw error;
    }
    // Capture is durable before marketing sync. A provider outage never discards the entry.
    let marketingStatus = 'pending';
    try { marketingStatus = await syncEntry(env, id); } catch { /* Saved entry remains retryable in admin. */ }
    return json(201, { entryId: id, marketingStatus });
  } catch {
    return json(503, { error: 'The giveaway service is temporarily unavailable. Please try again later.' });
  }
}
