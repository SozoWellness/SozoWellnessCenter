import { md5 } from '@noble/hashes/legacy.js';
import { mailchimpReady } from './common.ts';
import { GIVEAWAY_ENTRY_TAG } from '../../artifacts/sozo-wellness/src/lib/giveaway-contract.ts';
import type { GiveawayEntry } from '../../artifacts/sozo-wellness/src/lib/giveaway-contract.ts';
import type { GiveawayEnv } from './types.ts';

/** Idempotent member/tag writes; no campaign send, no text messaging, no resubscription. */
export async function syncEntry(env: GiveawayEnv, entryId: string): Promise<string> {
  const db = env.GIVEAWAY_DB!;
  if (!mailchimpReady(env)) return 'failed';
  const now = new Date().toISOString();
  const stale = new Date(Date.now() - 120_000).toISOString();
  const claimed = await db.prepare(`UPDATE giveaway_entries SET sync_status='processing',sync_started_at=?,sync_error=NULL
    WHERE id=? AND (sync_status IN ('pending','failed') OR (sync_status='processing' AND sync_started_at<?))`)
    .bind(now, entryId, stale).run();
  if (claimed.meta.changes !== 1) {
    return (await db.prepare('SELECT sync_status FROM giveaway_entries WHERE id=?').bind(entryId).first<{ sync_status: string }>())?.sync_status || 'failed';
  }
  const entry = await db.prepare('SELECT * FROM giveaway_entries WHERE id=?').bind(entryId).first<GiveawayEntry>();
  if (!entry) return 'failed';
  let final = 'failed';
  let error: string | null = 'Mailchimp sync failed. Reconcile the saved entry before the winner export.';
  try {
    const hash = Array.from(md5(new TextEncoder().encode(entry.email))).map(v => v.toString(16).padStart(2, '0')).join('');
    const root = `https://${env.MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${env.MAILCHIMP_GIVEAWAY_AUDIENCE_ID}/members/${hash}`;
    const call = (url: string, method = 'GET', payload?: object) => fetch(url, {
      method, headers: { Authorization: `Basic ${btoa(`sozo:${env.MAILCHIMP_API_KEY}`)}`, 'Content-Type': 'application/json' },
      ...(payload ? { body: JSON.stringify(payload) } : {}),
      redirect: 'manual', signal: AbortSignal.timeout(10_000),
    });
    const lookup = await call(root);
    if (!lookup.ok && lookup.status !== 404) throw new Error('lookup');
    const existing = lookup.ok ? await lookup.json() as { status?: string } : null;
    // A giveaway entry is not a new subscription date. Update the event fields
    // for returning contacts too, without changing their subscription status.
    const mergeFields: Record<string, string> = {
      FNAME: entry.first_name, PHONE: entry.phone,
      GVENTERED: entry.created_at, GVENTRYID: entry.id,
      GVSOURCE: entry.qr_source || entry.utm_source || 'direct',
      GVEMAIL: entry.marketing_consent === 1 ? 'yes' : 'no',
    };
    if (entry.wellness_interest) mergeFields.WELLNESS = entry.wellness_interest;
    const saved = await call(root, 'PUT', {
      email_address: entry.email, status_if_new: entry.marketing_consent === 1 ? 'subscribed' : 'transactional',
      merge_fields: mergeFields,
      ...(existing || entry.marketing_consent !== 1 ? {} : { timestamp_opt: entry.created_at }),
    });
    if (!saved.ok) throw new Error('member');
    // Event membership and permission to receive marketing are separate.
    // The event tag includes opt-outs for the drawing; marketing tags do not.
    const member = await saved.json() as { status?: string };
    const subscribed = member.status === 'subscribed' && entry.marketing_consent === 1;
    const names = [GIVEAWAY_ENTRY_TAG];
    if (subscribed) {
      names.push('Vendor Event', 'Hyperbaric Giveaway');
      if (entry.qr_source) names.push('QR Code Lead');
    }
    const tagged = await call(`${root}/tags`, 'POST', { tags: names.map(name => ({ name, status: 'active' })) });
    if (!tagged.ok) throw new Error('tags');
    final = subscribed ? 'synced' : 'suppressed';
    error = subscribed ? null : 'Giveaway entry tagged. No promotional permission added; existing subscription preferences preserved.';
  } catch {
    // Never persist provider responses (which can echo contact data or credentials).
  }
  await db.prepare('UPDATE giveaway_entries SET sync_status=?,sync_error=? WHERE id=? AND sync_started_at=?')
    .bind(final, error, entryId, now).run();
  return final;
}
