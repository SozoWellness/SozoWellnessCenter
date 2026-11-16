import type { GiveawayAdminData, GiveawayDraw, GiveawayEntry } from '../../artifacts/sozo-wellness/src/lib/giveaway-contract.ts';
import { campaign, CAMPAIGN_ID, csv, mailchimpReady } from './common.ts';
import type { GiveawayDatabase, GiveawayEnv } from './types.ts';
export const drawSelect = `SELECT d.*, e.first_name,e.email,e.phone FROM giveaway_draws d
  JOIN giveaway_entries e ON e.id=d.entry_id WHERE d.campaign_id=?`;
export async function getDraw(db: GiveawayDatabase, id: string) {
  return db.prepare(`${drawSelect} AND d.id=?`).bind(CAMPAIGN_ID, id).first<GiveawayDraw>();
}
export async function adminData(env: GiveawayEnv, url: URL): Promise<GiveawayAdminData> {
  const db = env.GIVEAWAY_DB!;
  const search = (url.searchParams.get('q') || '').slice(0, 100);
  const requested = Number(url.searchParams.get('page') || 1);
  const page = Number.isSafeInteger(requested) && requested > 0 ? Math.min(requested, 100_000) : 1;
  const where = `campaign_id=? AND (instr(lower(first_name),lower(?))>0 OR instr(lower(email),lower(?))>0 OR instr(phone,?)>0)`;
  const [entries, total, totalEntries, days, goals, sources, draws, settings] = await Promise.all([
    db.prepare(`SELECT * FROM giveaway_entries WHERE ${where} ORDER BY created_at DESC,id LIMIT 25 OFFSET ?`)
      .bind(CAMPAIGN_ID, search, search, search, (page - 1) * 25).all<GiveawayEntry>(),
    db.prepare(`SELECT count(*) AS n FROM giveaway_entries WHERE ${where}`).bind(CAMPAIGN_ID, search, search, search).first<{ n: number }>(),
    db.prepare('SELECT count(*) AS n FROM giveaway_entries WHERE campaign_id=?').bind(CAMPAIGN_ID).first<{ n: number }>(),
    // Eastern day grouping including daylight saving boundaries, computed from stored UTC instants below.
    db.prepare('SELECT created_at FROM giveaway_entries WHERE campaign_id=? ORDER BY created_at').bind(CAMPAIGN_ID).all<{ created_at: string }>(),
    db.prepare("SELECT coalesce(nullif(wellness_interest,''),'Not specified') AS label,count(*) AS count FROM giveaway_entries WHERE campaign_id=? GROUP BY wellness_interest ORDER BY count DESC,label")
      .bind(CAMPAIGN_ID).all<{ label: string; count: number }>(),
    db.prepare("SELECT coalesce(nullif(qr_source,''),'Untracked / direct') AS label,count(*) AS count FROM giveaway_entries WHERE campaign_id=? GROUP BY qr_source ORDER BY count DESC,label")
      .bind(CAMPAIGN_ID).all<{ label: string; count: number }>(),
    db.prepare(`${drawSelect} ORDER BY d.selected_at DESC`).bind(CAMPAIGN_ID).all<GiveawayDraw>(),
    campaign(db),
  ]);
  const dateFormat = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' });
  const counts = new Map<string, number>();
  for (const { created_at } of days.results) {
    const label = dateFormat.format(new Date(created_at));
    counts.set(label, (counts.get(label) || 0) + 1);
  }
  return {
    campaign: settings, entries: entries.results, page, total: total?.n || 0, totalEntries: totalEntries?.n || 0,
    days: Array.from(counts, ([label, count]) => ({ label, count })), goals: goals.results, sources: sources.results, draws: draws.results,
    connections: { database: true, mailchimp: mailchimpReady(env), turnstile: !!env.TURNSTILE_SECRET_KEY?.trim(), publicEnabled: env.GIVEAWAY_ENABLED === 'true' },
  };
}
export async function exportData(db: GiveawayDatabase, kind: string): Promise<Response> {
  if (kind === 'winners') {
    const { results } = await db.prepare(`${drawSelect} ORDER BY d.selected_at`).bind(CAMPAIGN_ID).all<GiveawayDraw>();
    return csv([['Draw ID','Status','First name','Email','Phone','Selected at (UTC)','Confirmed at (UTC)','Notified at (UTC)','Eligible entries','Selected by'],
      ...results.map(d => [d.id,d.status,d.first_name,d.email,d.phone,d.selected_at,d.confirmed_at,d.notified_at,d.eligible_count,d.selected_by])], 'sozo-giveaway-winners');
  }
  const { results } = await db.prepare('SELECT * FROM giveaway_entries WHERE campaign_id=? ORDER BY created_at,id').bind(CAMPAIGN_ID).all<GiveawayEntry>();
  if (kind === 'emails') return csv([['Email','First name','Email consent at (UTC)','Sync status'],
    ...results.filter(e => e.marketing_consent === 1 && e.sync_status === 'synced').map(e => [e.email,e.first_name,e.created_at,e.sync_status])], 'sozo-giveaway-opted-in-emails');
  return csv([['Entry ID','First name','Email','Phone','Wellness interest','Entered at (UTC)','QR source','UTM source','UTM medium','UTM campaign','UTM content','Email consent','Consent version','Eligibility confirmed','Rules accepted','Rules version','Mailchimp status'],
    ...results.map(e => [e.id,e.first_name,e.email,e.phone,e.wellness_interest,e.created_at,e.qr_source,e.utm_source,e.utm_medium,e.utm_campaign,e.utm_content,e.marketing_consent,e.consent_version,e.eligibility_confirmed,e.rules_accepted,e.rules_version,e.sync_status])], 'sozo-giveaway-entries');
}
