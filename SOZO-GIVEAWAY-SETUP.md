# SOZO Hyperbaric Giveaway — setup and operating guide

## Current state

The campaign is built for the **existing Cloudflare Pages website**, not a new
Replit-hosted site. It is deliberately **draft/closed to entries by default**.
This code change does not create a Cloudflare database, grant staff access, modify
Mailchimp, send emails, publish the website, or change existing automations.

**Approved simplified launch:** use the existing Mailchimp account to view and
export tagged entrants, then select and record the winner manually. No new
staff-login service is required. The already-created D1 database remains a
quiet backup entry ledger, preserving timestamps, consent, duplicate protection,
and entries during a Mailchimp outage. It is not a second staff dashboard.

The Replit preview displays the entry/rules/thank-you pages but does not collect
entries or simulate administrator access. Production capture requires the
dedicated Cloudflare bindings below. Do not print or distribute a campaign QR
until the production entry flow and final rules have been approved.

## What the owner must approve before public activation

Confirmed campaign terms:

- **Entry period:** November 20, 2026, **9:00 a.m. through 6:00 p.m. EST**
  (**America/New_York**). Stored as 14:00–23:00 UTC on that date.
- **Approximate retail value:** **$2,000 total** for all ten sessions.

The dates and value are confirmed; the following still require approval/setup:

- Final official rules and eligibility. The supplied draft requires Florida
  residency, age 18+, one entry per person, random selection, and seven days to
  respond after winner notification.
- Review the required promotional-email consent in the brief with the person
  approving the promotion's rules. Marketing consent is currently required as
  requested, distinct from rules acceptance and eligibility. **A phone number
  does not authorize promotional texts.** Review applicable giveaway,
  advertising, privacy, and therapy eligibility requirements before launch.
- Any additional clinically necessary prize-use conditions must be supplied
  and approved; the system has not invented treatment-clearance or forfeiture
  conditions.
- Existing Mailchimp permissions for the staff who will export the entry list.

## Technical setup — implementer, not a clinic-staff assignment

### 1. Dedicated Cloudflare D1 storage

Create a **new** D1 database for this giveaway. Do not convert, replace, or migrate
the existing website/request database. Apply `migrations/giveaway/0001_giveaway.sql`
and then `0002_campaign_terms.sql` to that new database, then bind it to the existing Pages project as
`GIVEAWAY_DB` in Production. Use a separate empty database for any Pages Preview
environment; never bind a test deployment to real entries.

Example after Cloudflare's Wrangler CLI has been authorized in the operator's
environment (do not paste API credentials into chat):

```sh
wrangler d1 create sozo-hyperbaric-giveaway
wrangler d1 execute sozo-hyperbaric-giveaway --remote --file=migrations/giveaway/0001_giveaway.sql
wrangler d1 execute sozo-hyperbaric-giveaway --remote --file=migrations/giveaway/0002_campaign_terms.sql
```

In Workers & Pages → **sozowellnesscenter** → Settings → Bindings, add the D1
binding. Keep the existing project, form secrets, build command, and output
directory. No DNS changes are needed.

### 2. Administration uses the existing Mailchimp login

Do not complete Zero Trust billing or create an Auth0 account. No new login
provider, approved-staff environment variables, or Access application is needed.
Use existing Mailchimp account permissions and MFA for staff access.

`/giveaway-admin` now provides only Mailchimp instructions and a QR link builder.
It displays no entrant data and makes no private API requests. The retained
custom administration API returns 404 by default, even with otherwise valid
Access credentials. Do not set `GIVEAWAY_CUSTOM_ADMIN_ENABLED`; those deferred
tools are not part of this launch. They must not be enabled without separately
approved authentication, configuration, and testing.

### 3. Mailchimp and security configuration

The live site runs in Cloudflare, so its runtime credentials must be set in
**Cloudflare Pages Production → Variables and secrets**. A Replit connector
alone does not install credentials into the external Cloudflare runtime.
Never place any secret in a `VITE_` variable or send it through chat.

| Variable | Type | Purpose |
| --- | --- | --- |
| `MAILCHIMP_API_KEY` | Secret | Restricted operator-managed Mailchimp API access |
| `MAILCHIMP_SERVER_PREFIX` | Text | The account's data center, such as `usN` |
| `MAILCHIMP_GIVEAWAY_AUDIENCE_ID` | Text | ID of the existing **SOZO Main Audience** |
| `GIVEAWAY_ENABLED` | Text | Keep `false` until the campaign is approved and tested |
| `TURNSTILE_SECRET_KEY` | Existing secret | Reuse the site's existing approved widget |
| `VITE_TURNSTILE_SITE_KEY` | Existing public text | Existing widget site key for the frontend build |

Do not reuse any existing assessment or book webhook for this campaign.
Do not put the Mailchimp key in a public build or a query string.

In **SOZO Main Audience**, verify the merge fields before opening entries:

| Public/data field | Mailchimp merge tag | Type |
| --- | --- | --- |
| First name | `FNAME` | Text |
| Mobile phone | `PHONE` | Phone |
| Wellness interest | `WELLNESS` | Text |
| Giveaway entry time (UTC ISO timestamp) | `GVENTERED` | Text |
| Giveaway entry identifier | `GVENTRYID` | Text |
| Giveaway QR/source label | `GVSOURCE` | Text |

**Mailchimp limits merge tags to ten characters**, so the brief's
`WELLNESS_INTEREST` cannot be the literal merge tag. Use the display label
**Wellness Interest** with merge tag **`WELLNESS`**. The full wellness-interest
value is also retained in the entry database and CSV.

Create/verify these tags:

- `HBOT Giveaway — Nov 20, 2026` — the event-specific entry list, not an email permission.
- `Vendor Event`
- `Hyperbaric Giveaway`
- `QR Code Lead` — applied only when a `qr_source` is supplied.

The event-specific tag is applied to successfully synced entrants regardless
of their existing subscription status. The other three tags are applied only
to subscribed contacts. Existing unsubscribe/cleaned/pending/transactional
statuses are not changed. `suppressed` means the entry reached Mailchimp but
marketing remains disabled; it does **not** mean an ineligible giveaway entry.
Provider rejections remain failed in D1 and require reconciliation before drawing.
A new contact explicitly agreeing to the required email checkbox is created
subscribed. Other existing tags are not removed.

`GVENTERED` is the actual giveaway entry time for returning subscribers too.
Do not use Mailchimp's original subscription date to identify entrants.
`GVENTRYID` supports reconciliation with the backup ledger. `GVSOURCE` uses the
submitted QR source, then UTM source, or `direct`; full UTM values remain in D1.

### 4. Dedicated four-email Mailchimp flow

Use the approved content in `campaigns/hyperbaric-giveaway/emails.md`. Create the
flow in Mailchimp, **paused at first**. Trigger on the `Hyperbaric Giveaway` tag
being added to a subscribed member. Disable re-entry.

Timing is relative to entry:

1. Immediate entry welcome.
2. Wait **3 days**, then assessment introduction.
3. Wait **4 more days** (day 7), then hyperbaric education.
4. Wait **7 more days** (day 14), then assessment invitation.

Do not use successive waits of 3, 7, and 14 days; that would send on days 3, 10,
and 24. Preserve unsubscribe handling and Mailchimp's required postal/unsubscribe
footer. No SMS or automatic winner-contact flow is being enabled.

**Important existing-welcome overlap:** the site's generic new-subscriber welcome
flow already exists. A newly subscribed giveaway entrant can qualify for it as
well as this new tagged flow. Review those entry conditions together before
activation. Do not silently edit or pause the existing flow. The campaign API
creates/updates the member and then adds tags, so a generic welcome triggered
instantly on subscription must not rely solely on a tag that arrives later.
Use an owner-approved delayed eligibility check/exclusion in the generic flow,
or an explicitly approved shared-welcome strategy. This is a pre-activation
configuration check, not authorization to change existing email behavior.

### 5. Approve, verify, then open

1. Publish the code to Cloudflare only after site-owner approval; initially leave
   `GIVEAWAY_ENABLED=false`.
2. Confirm existing Mailchimp staff access and entry-tag export permissions.
   Verify the custom admin API stays disabled on all hostnames.
3. Confirm the seeded dates and prize value in D1. Public rules draw these
   values from the database. Only after explicit final rules approval, an
   implementer can update `rules_approved=1,status='active'` for
   `id='hyperbaric-giveaway'` using the authenticated Cloudflare D1 console.
   Do not change dates, value, or rules after entries have started.
4. Use an isolated Preview database and test Mailchimp audience/paused flow for
   a single approved entry test. Use the live Turnstile widget with its allowed
   hostname; never substitute bypass tokens or test keys into Production.
5. Verify saved entry, source, consent, duplicate rejection, tags, and exports.
   Include both a returning subscriber and an opt-out in the isolated checks;
   both must appear in the event segment without resubscribing the opt-out.
6. With explicit approval, configure the approved production audience/flow,
   set `GIVEAWAY_ENABLED=true`, then redeploy. The active status, dates and
   rules must also permit entry. Do not silently enable a live email sequence.
7. Confirm the live entry form is open, then generate final production QR codes.

## QR source tracking

Staff can generate a link and downloadable SVG QR at `/giveaway-admin`.
This non-sensitive resource page is not an entrant dashboard or login screen.
No external QR service sees visitor/contact data.

Example:

```text
https://sozorootedwellness.com/enter-to-win?qr_source=event-poster&utm_source=event-poster&utm_medium=qr&utm_campaign=wellness-fair
```

Use distinct `qr_source` labels for signage, business cards, handouts, and posters.
Use `utm_campaign` for the event name. Never put a person's name, email, phone
number, or health details into a source label or URL.

The entry keeps its submitted source and UTM values. The alternative
`/hyperbaric-giveaway` URL redirects to `/enter-to-win` **without dropping query
parameters**. Attribution is campaign reporting, not tamper-proof identity.
This implementation counts **submitted entries by source**, not every scan or
completed assessment booking. It sets no tracking cookies. Visitors returning
without the tagged URL are recorded as untracked/direct.

Campaign pages and admin/receipt pages are noindex and excluded from the sitemap.
No new navigation link advertises an unapproved campaign.

## Day-to-day administration in Mailchimp

- Open the SOZO Main Audience and filter by the exact tag
  `HBOT Giveaway — Nov 20, 2026`. Do not filter by original subscription date.
- View/search entrants and their interest, source, and giveaway entry time in
  the existing Mailchimp interface.
- Export the tagged segment to CSV. Include **all contact statuses**, not just
  subscribed contacts. Mailchimp may provide separate CSVs per status; combine
  them for the eligible drawing pool.
- Use Mailchimp's current subscribed segment for promotional emails, never the
  full giveaway export. A giveaway tag does not override an unsubscribe.
- Keep downloaded files private, do not upload contact lists to public
  random-picker websites, and delete copies when no longer needed.
- Failed Mailchimp calls do not erase entries. Before drawing, an implementer
  must reconcile the backup ledger with Mailchimp, including any failed or
  interrupted syncs. Never treat an unavailable provider as a delivered email.
- One email and one normalized US phone number per campaign are enforced by
  database uniqueness. This helps enforce one entry per person, but is not
  identity verification; staff still review eligibility.
- The form checks the event window on the server and closes automatically at
  6 p.m. EST. Its kill switch can pause entries without changing their terms.

Read-only D1 pre-draw reconciliation check (expected result: zero):

```sql
SELECT COUNT(*) AS entries_needing_reconciliation
FROM giveaway_entries
WHERE campaign_id='hyperbaric-giveaway'
AND sync_status NOT IN ('synced','suppressed');
```

If nonzero, stop before drawing. The implementer must recover those rows from
the private D1 console, match each `id` to `GVENTRYID` in Mailchimp, and add
missing event records without overriding opt-outs. Compare the full D1 entry
count against unique Mailchimp event entry identifiers; investigate any mismatch.
Do not draw from an incomplete segment.

## Drawing the winner

After 6 p.m. EST, complete reconciliation, export the full event-tagged segment,
and review eligibility and duplicate people. Freeze that final eligible list.
Number its rows from 1 to N and make one random selection locally, without
uploading personal information to another service.

Record the selected entry identifier, name, selection timestamp, eligible count,
and staff member privately before contacting the winner. Save the frozen list
and selection record so a spreadsheet refresh cannot silently replace the pick.
Contact the winner through the normal staff process and record the notification
time. Only after seven full days without response may an alternate be selected;
exclude previous picks and retain their records. There is no automated drawing,
winner email, or text message in this simplified launch.

## Verification commands

```sh
pnpm --filter @workspace/sozo-wellness test:giveaway
pnpm --filter @workspace/sozo-wellness typecheck
PORT=4173 BASE_PATH=/ pnpm --filter @workspace/sozo-wellness build
node artifacts/sozo-wellness/scripts/check-conversion-pages.mjs
```

Automated tests use real in-memory SQLite with the D1 schema and signed test
JWTs. Turnstile and Mailchimp are mocked; they send no actual emails and do not
verify the external account configuration.
