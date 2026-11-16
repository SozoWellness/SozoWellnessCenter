-- Owner-supplied terms: November 20, 2026, 9 AM–6 PM EST; total ARV $2,000.
-- Apply after 0001. Seed only a still-empty draft; never overwrite staff settings
-- or the terms of a campaign that already has entries. Does not activate entries.
UPDATE giveaway_campaigns
SET starts_at='2026-11-20T14:00:00.000Z',
    ends_at='2026-11-20T23:00:00.000Z',
    prize_value=2000,
    updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now'),
    updated_by='owner-approved campaign terms'
WHERE id='hyperbaric-giveaway'
  AND status='draft' AND starts_at='' AND ends_at='' AND prize_value=0
  AND NOT EXISTS(SELECT 1 FROM giveaway_entries WHERE campaign_id='hyperbaric-giveaway');
