import { EMPTY_CAMPAIGN, type CampaignSettings } from '../../artifacts/sozo-wellness/src/lib/giveaway-contract.ts';
import type { GiveawayDatabase, GiveawayEnv } from './types.ts';
export const CAMPAIGN_ID = 'hyperbaric-giveaway';
export function json(status: number, body: unknown, extra: Record<string, string> = {}) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'X-Robots-Tag': 'noindex, nofollow', ...extra } });
}
export async function body(request: Request): Promise<Record<string, unknown>> {
  if (request.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase() !== 'application/json') throw new Error('Expected JSON.');
  if (request.headers.get('Origin') !== new URL(request.url).origin) throw new Error('Submit from this website.');
  const reader = request.body?.getReader();
  if (!reader) throw new Error('Missing request.');
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 12_288) { await reader.cancel(); throw new Error('Request too large.'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const result = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { result.set(chunk, offset); offset += chunk.byteLength; }
  const parsed = JSON.parse(new TextDecoder().decode(result));
  if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') throw new Error('Invalid request.');
  return parsed;
}
export async function campaign(db?: GiveawayDatabase): Promise<CampaignSettings> {
  if (!db) return { ...EMPTY_CAMPAIGN };
  const row = await db.prepare('SELECT * FROM giveaway_campaigns WHERE id=?').bind(CAMPAIGN_ID).first<{
    id: string; status: CampaignSettings['status']; starts_at: string; ends_at: string;
    prize_value: number; rules_approved: number; rules_version: string;
  }>();
  if (!row) return { ...EMPTY_CAMPAIGN };
  return { id: row.id, status: row.status, startsAt: row.starts_at, endsAt: row.ends_at,
    prizeValue: row.prize_value, rulesApproved: row.rules_approved === 1, rulesVersion: row.rules_version };
}
export function mailchimpReady(env: GiveawayEnv) {
  return !!env.MAILCHIMP_API_KEY?.trim() && /^us\d+$/.test(env.MAILCHIMP_SERVER_PREFIX || '') &&
    /^[a-zA-Z0-9]+$/.test(env.MAILCHIMP_GIVEAWAY_AUDIENCE_ID || '');
}
export function accepting(settings: CampaignSettings, env: GiveawayEnv, now = Date.now()) {
  return env.GIVEAWAY_ENABLED === 'true' && !!env.GIVEAWAY_DB && !!env.TURNSTILE_SECRET_KEY?.trim() &&
    mailchimpReady(env) && settings.status === 'active' && settings.rulesApproved &&
    settings.prizeValue > 0 && Date.parse(settings.startsAt) <= now && Date.parse(settings.endsAt) > now;
}
export function audit(db: GiveawayDatabase, actor: string, action: string, detail: string) {
  return db.prepare('INSERT INTO giveaway_audit(id,campaign_id,action,actor,created_at,detail) VALUES(?,?,?,?,?,?)')
    .bind(crypto.randomUUID(), CAMPAIGN_ID, action, actor, new Date().toISOString(), detail);
}
export function csv(rows: unknown[][], filename: string) {
  const text = '\uFEFF' + rows.map(row => row.map(value => {
    let str = String(value ?? '');
    // Protect spreadsheet users against CSV formula injection, including whitespace prefixes.
    if (/^[\s]*[=+\-@]/.test(str) || /^[\t\r\n]/.test(str)) str = "'" + str;
    return `"${str.replace(/"/g, '""')}"`;
  }).join(',')).join('\r\n');
  return new Response(text, { headers: {
    'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${filename}.csv"`,
    'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'X-Robots-Tag': 'noindex, nofollow',
  } });
}
