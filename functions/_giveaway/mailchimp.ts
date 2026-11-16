import { md5 } from '@noble/hashes/legacy.js';
import { mailchimpReady } from './common.ts';
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
  let error: string | null = 'Mailchimp could not be reached. Retry from the entry list.';
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
    // Never overwrite unsubscribed, cleaned, archived, transactional or pending status.
    if (existing && existing.status !== 'subscribed') {
      final = 'suppressed';
      error = 'Existing Mailchimp contact is not subscribed. No marketing was enabled.';
    } else {
      const mergeFields: Record<string, string> = { FNAME: entry.first_name, PHONE: entry.phone };
      if (entry.wellness_interest) mergeFields.WELLNESS = entry.wellness_interest;
      const saved = await call(root, 'PUT', {
        email_address: entry.email, status_if_new: 'subscribed',
        merge_fields: mergeFields,
        ...(existing ? {} : { timestamp_opt: entry.created_at }),
      });
      if (!saved.ok) throw new Error('member');
      // Recheck returned status: never tag an opt-out that raced the earlier lookup.
      const member = await saved.json() as { status?: string };
      if (member.status !== 'subscribed') {
        final = 'suppressed'; error = 'Contact is not subscribed. Campaign tags were not applied.';
      } else {
        const names = ['Vendor Event', 'Hyperbaric Giveaway'];
        if (entry.qr_source) names.push('QR Code Lead');
        const tagged = await call(`${root}/tags`, 'POST', { tags: names.map(name => ({ name, status: 'active' })) });
        if (!tagged.ok) throw new Error('tags');
        final = 'synced'; error = null;
      }
    }
  } catch {
    // Never persist provider responses (which can echo contact data or credentials).
  }
  await db.prepare('UPDATE giveaway_entries SET sync_status=?,sync_error=? WHERE id=? AND sync_started_at=?')
    .bind(final, error, entryId, now).run();
  return final;
}
