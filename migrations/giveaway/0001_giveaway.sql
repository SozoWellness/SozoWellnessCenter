-- Run against a NEW, dedicated Cloudflare D1 database. Does not alter existing site data.
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS giveaway_campaigns (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','closed')),
  starts_at TEXT NOT NULL DEFAULT '',
  ends_at TEXT NOT NULL DEFAULT '',
  prize_value REAL NOT NULL DEFAULT 0,
  rules_approved INTEGER NOT NULL DEFAULT 0,
  rules_version TEXT NOT NULL DEFAULT '1',
  updated_at TEXT NOT NULL,
  updated_by TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS giveaway_entries (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL REFERENCES giveaway_campaigns(id),
  first_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  wellness_interest TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  marketing_consent INTEGER NOT NULL CHECK(marketing_consent = 1),
  consent_version TEXT NOT NULL DEFAULT 'giveaway-email-v1',
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
CREATE INDEX IF NOT EXISTS giveaway_entries_created ON giveaway_entries(campaign_id, created_at);
CREATE TABLE IF NOT EXISTS giveaway_draws (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL REFERENCES giveaway_campaigns(id),
  entry_id TEXT NOT NULL REFERENCES giveaway_entries(id),
  status TEXT NOT NULL CHECK(status IN ('pending','confirmed','unclaimed')),
  selected_at TEXT NOT NULL,
  confirmed_at TEXT,
  notified_at TEXT,
  released_at TEXT,
  selected_by TEXT NOT NULL,
  confirmed_by TEXT,
  eligible_count INTEGER NOT NULL,
  UNIQUE(campaign_id, entry_id)
);
CREATE UNIQUE INDEX IF NOT EXISTS giveaway_one_current_draw
  ON giveaway_draws(campaign_id) WHERE status IN ('pending','confirmed');
CREATE TABLE IF NOT EXISTS giveaway_audit (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL,
  action TEXT NOT NULL,
  actor TEXT NOT NULL,
  created_at TEXT NOT NULL,
  detail TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS giveaway_attempts (
  bucket TEXT PRIMARY KEY,
  started_at INTEGER NOT NULL,
  attempts INTEGER NOT NULL
);
INSERT OR IGNORE INTO giveaway_campaigns(id,updated_at,updated_by)
  VALUES('hyperbaric-giveaway',strftime('%Y-%m-%dT%H:%M:%fZ','now'),'initial setup');
