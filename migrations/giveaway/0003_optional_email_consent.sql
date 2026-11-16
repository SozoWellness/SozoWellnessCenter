-- Apply only to the dedicated giveaway database, with entries disabled.
-- D1 migrations run transactionally. Deferred foreign keys preserve draw links
-- while the entries table is rebuilt; every existing field/row is copied.
PRAGMA defer_foreign_keys = ON;

CREATE TABLE giveaway_entries_optional_consent (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL REFERENCES giveaway_campaigns(id),
  first_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  wellness_interest TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  marketing_consent INTEGER NOT NULL DEFAULT 0 CHECK(marketing_consent IN (0,1)),
  consent_version TEXT NOT NULL DEFAULT 'giveaway-email-v2',
  eligibility_confirmed INTEGER NOT NULL DEFAULT 1 CHECK(eligibility_confirmed = 1),
  rules_accepted INTEGER NOT NULL DEFAULT 1 CHECK(rules_accepted = 1),
  rules_version TEXT NOT NULL,
  qr_source TEXT NOT NULL DEFAULT '',
  utm_source TEXT NOT NULL DEFAULT '',
  utm_medium TEXT NOT NULL DEFAULT '',
  utm_campaign TEXT NOT NULL DEFAULT '',
  utm_content TEXT NOT NULL DEFAULT '',
  sync_status TEXT NOT NULL DEFAULT 'pending',
  sync_error TEXT,
  sync_started_at TEXT,
  UNIQUE(campaign_id, email),
  UNIQUE(campaign_id, phone)
);

INSERT INTO giveaway_entries_optional_consent
  SELECT * FROM giveaway_entries;
DROP TABLE giveaway_entries;
ALTER TABLE giveaway_entries_optional_consent RENAME TO giveaway_entries;
CREATE INDEX giveaway_entries_created ON giveaway_entries(campaign_id, created_at);

UPDATE giveaway_campaigns
SET status='draft', rules_approved=0, rules_version='2',
    updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now'),
    updated_by='owner-approved optional promotional email consent'
WHERE id='hyperbaric-giveaway' AND rules_version='1';

PRAGMA defer_foreign_keys = OFF;
