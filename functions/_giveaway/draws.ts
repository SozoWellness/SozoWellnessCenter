import { audit, CAMPAIGN_ID, json } from './common.ts';
import { drawSelect, getDraw } from './admin-data.ts';
import type { GiveawayDraw } from '../../artifacts/sozo-wellness/src/lib/giveaway-contract.ts';
import type { GiveawayDatabase } from './types.ts';
/** Rejection sampling avoids modulo bias; never Math.random() for a prize drawing. */
export function randomIndex(count: number): number {
  if (!Number.isSafeInteger(count) || count < 1 || count > 0xFFFF_FFFF) throw new Error('Invalid eligible count.');
  const ceiling = Math.floor(0x1_0000_0000 / count) * count;
  const value = new Uint32Array(1);
  do { crypto.getRandomValues(value); } while (value[0] >= ceiling);
  return value[0] % count;
}
export async function drawCommand(db: GiveawayDatabase, actor: string, action: string, drawId: string): Promise<Response> {
  const now = new Date().toISOString();
  if (action === 'draw') {
    const current = await db.prepare(`${drawSelect} AND d.status IN ('pending','confirmed')`).bind(CAMPAIGN_ID).first<GiveawayDraw>();
    if (current) return current.status === 'pending' ? json(200, { ok: true, draw: current }) : json(409, { error: 'A winner is already confirmed.' });
    const eligibleSQL = `SELECT e.id FROM giveaway_entries e JOIN giveaway_campaigns c ON c.id=e.campaign_id
      WHERE e.campaign_id=? AND c.status='closed' AND c.rules_approved=1 AND c.ends_at<=? AND c.ends_at<>''
      AND e.created_at>=c.starts_at AND e.created_at<c.ends_at
      AND NOT EXISTS(SELECT 1 FROM giveaway_draws d WHERE d.entry_id=e.id) ORDER BY e.id`;
    const eligible = await db.prepare(eligibleSQL).bind(CAMPAIGN_ID, now).all<{ id: string }>();
    if (!eligible.results.length) return json(409, { error: 'Close the giveaway after the entry period ends. At least one eligible, previously undrawn entry is required.' });
    const chosen = eligible.results[randomIndex(eligible.results.length)].id;
    const id = crypto.randomUUID();
    // Partial unique index serializes concurrent administrators; a pending preview cannot be rerolled.
    try {
      await db.batch([
        db.prepare(`INSERT INTO giveaway_draws(id,campaign_id,entry_id,status,selected_at,selected_by,eligible_count)
          SELECT ?,?,?,'pending',?,?,? FROM giveaway_campaigns c
          WHERE c.id=? AND c.status='closed' AND c.rules_approved=1 AND c.ends_at<=?`)
          .bind(id,CAMPAIGN_ID,chosen,now,actor,eligible.results.length,CAMPAIGN_ID,now),
        audit(db,actor,'draw preview',id),
      ]);
    } catch {
      return json(409, { error: 'Another administrator already started a drawing. Refresh to view it.' });
    }
    const draw = await getDraw(db,id);
    return draw ? json(200,{ ok: true,draw }) : json(409,{ error: 'Campaign settings changed. Refresh before drawing.' });
  }
  const draw = await getDraw(db,drawId);
  if (!draw) return json(404, { error: 'Drawing not found.' });
  let statement;
  if (action === 'confirm') {
    statement = db.prepare(`UPDATE giveaway_draws SET status='confirmed',confirmed_at=?,confirmed_by=? WHERE id=? AND status='pending'
      AND EXISTS(SELECT 1 FROM giveaway_campaigns c WHERE c.id=giveaway_draws.campaign_id AND c.status='closed' AND c.rules_approved=1 AND c.ends_at<=?)`)
      .bind(now,actor,drawId,now);
  } else if (action === 'notified') {
    statement = db.prepare("UPDATE giveaway_draws SET notified_at=? WHERE id=? AND status='confirmed' AND notified_at IS NULL").bind(now,drawId);
  } else if (action === 'release') {
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    statement = db.prepare("UPDATE giveaway_draws SET status='unclaimed',released_at=? WHERE id=? AND status='confirmed' AND notified_at IS NOT NULL AND notified_at<=?").bind(now,drawId,cutoff);
  } else return json(400, { error: 'Unknown drawing command.' });
  const result = await statement.run();
  if (result.meta.changes !== 1) return json(409, { error: action === 'release' ? 'An alternate is allowed only after seven full days from recorded winner notification. Verify the winner has not responded.' : 'The drawing changed or this action is not allowed. Refresh before continuing.' });
  await audit(db,actor,`draw ${action}`,drawId).run();
  return json(200, { ok: true, draw: await getDraw(db,drawId) });
}
