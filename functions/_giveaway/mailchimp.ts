import { md5 } from '@noble/hashes/legacy.js';
import { mailchimpReady } from './common.ts';
import { GIVEAWAY_ENTRY_TAG } from '../../artifacts/sozo-wellness/src/lib/giveaway-contract.ts';
import type { GiveawayEntry } from '../../artifacts/sozo-wellness/src/lib/giveaway-contract.ts';
import type { GiveawayEnv } from './types.ts';

type SyncStage = 'prepare' | 'lookup' | 'member' | 'tags';

async function safeFailure(response: Response, stage: SyncStage): Promise<string> {
  // Only retain known field names, never provider messages, values, or raw bodies.
  const allowed = new Set(['email_address', 'status', 'status_if_new', 'timestamp_opt', 'merge_fields',
    'merge_fields.FNAME', 'merge_fields.LNAME', 'merge_fields.ADDRESS',
    'merge_fields.BIRTHDAY', 'merge_fields.PHONE', 'merge_fields.GVENTERED',
    'merge_fields.GVENTRYID', 'merge_fields.GVSOURCE', 'merge_fields.GVEMAIL',
    'merge_fields.WELLNESS', 'tags']);
  const fields = new Set<string>();
  try {
    const detail = await response.json() as { errors?: { field?: unknown }[] };
    if (Array.isArray(detail?.errors)) {
      for (const item of detail.errors) {
        if (typeof item?.field === 'string' && allowed.has(item.field)) fields.add(item.field);
      }
    }
  } catch { /* Non-JSON error bodies are intentionally discarded. */ }
  return `Mailchimp ${stage} failed (HTTP ${response.status})${fields.size ? `; fields: ${[...fields].join(', ')}` : ''}. Reconcile the saved entry before retrying.`;
}

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
  let stage: SyncStage = 'prepare';
  try {
    const hash = Array.from(md5(new TextEncoder().encode(entry.email))).map(v => v.toString(16).padStart(2, '0')).join('');
    const root = `https://${env.MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${env.MAILCHIMP_GIVEAWAY_AUDIENCE_ID}/members/${hash}`;
    const call = (url: string, method = 'GET', payload?: object) => fetch(url, {
      method, headers: { Authorization: `Basic ${btoa(`sozo:${env.MAILCHIMP_API_KEY}`)}`, 'Content-Type': 'application/json' },
      ...(payload ? { body: JSON.stringify(payload) } : {}),
      redirect: 'manual', signal: AbortSignal.timeout(10_000),
    });
    stage = 'lookup';
    const lookup = await call(root);
    if (!lookup.ok && lookup.status !== 404) {
      error = await safeFailure(lookup, stage);
      throw new Error('provider');
    }
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
    stage = 'member';
    const saved = await call(root, 'PUT', {
      email_address: entry.email, status_if_new: entry.marketing_consent === 1 ? 'subscribed' : 'transactional',
      merge_fields: mergeFields,
      ...(existing || entry.marketing_consent !== 1 ? {} : { timestamp_opt: entry.created_at }),
    });
    if (!saved.ok) {
      error = await safeFailure(saved, stage);
      throw new Error('provider');
    }
    // Event membership and permission to receive marketing are separate.
    // The event tag includes opt-outs for the drawing; marketing tags do not.
    const member = await saved.json() as { status?: string };
    const subscribed = member.status === 'subscribed' && entry.marketing_consent === 1;
    const names = [GIVEAWAY_ENTRY_TAG];
    if (subscribed) {
      names.push('Vendor Event', 'Hyperbaric Giveaway');
      if (entry.qr_source) names.push('QR Code Lead');
    }
    stage = 'tags';
    const tagged = await call(`${root}/tags`, 'POST', { tags: names.map(name => ({ name, status: 'active' })) });
    if (!tagged.ok) {
      error = await safeFailure(tagged, stage);
      throw new Error('provider');
    }
    final = subscribed ? 'synced' : 'suppressed';
    error = subscribed ? null : 'Giveaway entry tagged. No promotional permission added; existing subscription preferences preserved.';
  } catch {
    if (!error?.startsWith(`Mailchimp ${stage} failed (`)) {
      error = `Mailchimp ${stage} failed (network or response error). Reconcile the saved entry before retrying.`;
    }
  }
  await db.prepare('UPDATE giveaway_entries SET sync_status=?,sync_error=? WHERE id=? AND sync_started_at=?')
    .bind(final, error, entryId, now).run();
  return final;
}
