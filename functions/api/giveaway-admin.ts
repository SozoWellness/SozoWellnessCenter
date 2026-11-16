import type { CampaignSettings } from '../../artifacts/sozo-wellness/src/lib/giveaway-contract.ts';
import { administrator } from '../_giveaway/auth.ts';
import { adminData, exportData } from '../_giveaway/admin-data.ts';
import { audit, body, campaign, CAMPAIGN_ID, json } from '../_giveaway/common.ts';
import { drawCommand } from '../_giveaway/draws.ts';
import { syncEntry } from '../_giveaway/mailchimp.ts';
import type { GiveawayEnv } from '../_giveaway/types.ts';

export async function onRequest({ request, env }: { request: Request; env: GiveawayEnv }): Promise<Response> {
  if (env.GIVEAWAY_CUSTOM_ADMIN_ENABLED !== 'true') {
    return json(404, { error: 'Giveaway administration is managed in Mailchimp. Custom administration is not enabled.' });
  }
  if (!['GET','POST'].includes(request.method)) return json(405, { error: 'Method not allowed.' }, { Allow: 'GET, POST' });
  const actor = await administrator(request,env);
  if (!actor) return json(403, { error: 'Administrator sign-in is required. Open this page through your configured Cloudflare Access login. If access has not been configured, the dashboard stays locked.' });
  if (!env.GIVEAWAY_DB) return json(503, { error: 'The private giveaway database has not been connected yet.' });
  const db = env.GIVEAWAY_DB;
  try {
    if (request.method === 'GET') {
      const url = new URL(request.url);
      const kind = url.searchParams.get('export');
      if (kind) {
        if (!['entries','emails','winners'].includes(kind)) return json(400, { error: 'Unknown export.' });
        await audit(db,actor,`export ${kind}`,'CSV export').run();
        return await exportData(db,kind);
      }
      return json(200, await adminData(env,url));
    }
    let input: Record<string, unknown>;
    try { input = await body(request); } catch { return json(400, { error: 'Submit a valid request from this website.' }); }
    const action = String(input.action || '');
    if (action === 'settings') {
      const s = input.settings as CampaignSettings | undefined;
      if (!s || !['draft','active','closed'].includes(s.status) || typeof s.rulesApproved !== 'boolean' ||
        typeof s.prizeValue !== 'number' || !Number.isFinite(s.prizeValue) || s.prizeValue < 0 || s.prizeValue > 1_000_000 ||
        typeof s.rulesVersion !== 'string' || !/^[a-zA-Z0-9._-]{1,30}$/.test(s.rulesVersion) ||
        typeof s.startsAt !== 'string' || typeof s.endsAt !== 'string') return json(400, { error: 'Check all campaign settings.' });
      const startsAt = s.startsAt ? new Date(s.startsAt).toISOString() : '';
      const endsAt = s.endsAt ? new Date(s.endsAt).toISOString() : '';
      if ((startsAt || endsAt) && (!startsAt || !endsAt || endsAt <= startsAt)) return json(400, { error: 'Entry end must be after the start. Supply explicit timezone dates.' });
      if (s.status === 'active' && (!startsAt || !endsAt || s.prizeValue <= 0 || !s.rulesApproved)) return json(400, { error: 'Before activation, set the dates and prize value and approve the official rules.' });
      // Atomic guard: material rules cannot be altered once anyone has entered.
      const result = await db.prepare(`UPDATE giveaway_campaigns SET status=?,starts_at=?,ends_at=?,prize_value=?,rules_approved=?,rules_version=?,updated_at=?,updated_by=?
        WHERE id=? AND (NOT EXISTS(SELECT 1 FROM giveaway_entries WHERE campaign_id=?) OR (starts_at=? AND ends_at=? AND prize_value=? AND rules_version=?))
        AND (?<>'active' OR NOT EXISTS(SELECT 1 FROM giveaway_draws WHERE campaign_id=?))`)
        .bind(s.status,startsAt,endsAt,s.prizeValue,s.rulesApproved ? 1 : 0,s.rulesVersion,new Date().toISOString(),actor,CAMPAIGN_ID,
          CAMPAIGN_ID,startsAt,endsAt,s.prizeValue,s.rulesVersion,s.status,CAMPAIGN_ID).run();
      if (result.meta.changes !== 1) return json(409, { error: 'After the first entry, dates, prize value and rules version are locked. A drawn campaign cannot reopen.' });
      await audit(db,actor,'settings',JSON.stringify(await campaign(db))).run();
      return json(200, { ok: true });
    }
    if (['draw','confirm','notified','release'].includes(action)) return await drawCommand(db,actor,action,typeof input.drawId === 'string' ? input.drawId : '');
    if (action === 'retry') {
      const id = typeof input.entryId === 'string' ? input.entryId : '';
      const entry = await db.prepare('SELECT id FROM giveaway_entries WHERE id=? AND campaign_id=?').bind(id,CAMPAIGN_ID).first();
      if (!entry) return json(404, { error: 'Entry not found.' });
      const status = await syncEntry(env,id);
      await audit(db,actor,'Mailchimp retry',`${id}: ${status}`).run();
      return status === 'failed' ? json(502, { error: 'The entry remains saved, but Mailchimp sync failed. Check the audience settings and merge fields, then retry.' }) : json(200, { ok: true });
    }
    return json(400, { error: 'Unknown administrator command.' });
  } catch {
    return json(503, { error: 'The administration service is unavailable. Check the dedicated database and configuration, then retry.' });
  }
}
