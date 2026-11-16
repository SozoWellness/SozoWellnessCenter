# SOZO Hyperbaric Giveaway — setup and operating guide

## Current state

The campaign is built for the **existing Cloudflare Pages website**, not a new
Replit-hosted site. It is deliberately **draft/closed to entries by default**.
This code change does not create a Cloudflare database, grant staff access, modify
Mailchimp, send emails, publish the website, or change existing automations.

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
- Authorized staff email addresses. Do not put them in public site code.

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

### 2. Staff-only access through Cloudflare Access

Use Cloudflare Access for this Cloudflare-hosted site's private tools; do not
add a Replit-only login/proxy to production.

Create a self-hosted Access application protecting **both** paths on the live
site, under the **same application audience**:

- `sozorootedwellness.com/giveaway-admin`
- `sozorootedwellness.com/api/giveaway-admin`

If staff use `www`, include its equivalent paths in that same application, or
require staff to use the apex address above. Configure a policy allowing only
the owner-approved staff emails and a supported staff sign-in method. Require
MFA through the identity provider where available. Do not create a public
allow-all or bypass policy. This does **not** protect public entry/rules pages.

Set these Pages Production text variables:

| Variable | Value |
| --- | --- |
| `GIVEAWAY_ACCESS_TEAM` | The team's slug, without `.cloudflareaccess.com` |
| `GIVEAWAY_ACCESS_AUD` | This Access application's audience identifier |
| `GIVEAWAY_ADMIN_EMAILS` | Comma-separated approved staff emails |

The API verifies the signed Access JWT's issuer, signature, expiry, audience,
and allowlisted email on **every** private request. A forged email header,
missing configuration, or direct visit through `pages.dev` grants no access.
Protecting the page alone is insufficient; configure both paths.

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

**Mailchimp limits merge tags to ten characters**, so the brief's
`WELLNESS_INTEREST` cannot be the literal merge tag. Use the display label
**Wellness Interest** with merge tag **`WELLNESS`**. The full wellness-interest
value is also retained in the entry database and CSV.

Create/verify these tags:

- `Vendor Event`
- `Hyperbaric Giveaway`
- `QR Code Lead` — applied only when a `qr_source` is supplied.

The API preserves existing unsubscribe/cleaned/pending/transactional statuses.
It never silently resubscribes an existing non-subscribed contact. Their
giveaway entry is still saved and eligible, with marketing sync marked
`suppressed`. A new contact explicitly agreeing to the required email checkbox
is created subscribed; an existing subscribed contact remains subscribed.
Other existing tags are not removed.

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
2. Confirm staff login works, an unauthorized visitor cannot access either
   admin path, and alternate hostnames expose no private data.
3. Save the dates, prize value, and approved rules through `/giveaway-admin`.
   Public rules draw these values from the database.
4. Use an isolated Preview database and test Mailchimp audience/paused flow for
   a single approved entry test. Use the live Turnstile widget with its allowed
   hostname; never substitute bypass tokens or test keys into Production.
5. Verify saved entry, source, consent, duplicate rejection, tags, and exports.
   Verify the signed-in dashboard before trusting its operations.
6. With explicit approval, configure the approved production audience/flow,
   save Active status and `GIVEAWAY_ENABLED=true`, then redeploy. The dates and
   rules must also permit entry. Do not silently enable a live email sequence.
7. Confirm the live entry form is open, then generate final production QR codes.

## QR source tracking

Staff can generate a link and downloadable SVG QR in the private dashboard.
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

## Day-to-day administration

- Search by first name, email, or phone. Entries are paginated, 25 at a time.
- View total entries, Eastern-calendar day counts, wellness goals, and QR sources.
- CSV exports escape spreadsheet formulas. Keep files private and delete local
  copies when no longer needed.
- The email export contains records that had email consent and successful sync;
  it is **not** a live Mailchimp suppression-status export. Do not use it to
  resubscribe anyone or overwrite a current unsubscribe.
- Failed Mailchimp calls do not erase entries. Retry explicitly from the
  dashboard. Stale processing leases become retryable after two minutes.
  Never treat an unavailable provider as a delivered email.
- One email and one normalized US phone number per campaign are enforced by
  database uniqueness. This helps enforce one entry per person, but is not
  identity verification; staff still review eligibility.
- Dates, prize value, and rules version lock after the first entry. Pause or
  close the campaign rather than altering entrants' terms.

## Drawing the winner

Close the campaign **after** its end time. Start the random drawing from the
private dashboard. Review the pending candidate, then use the separate
confirmation button. The pending pick is saved and cannot be rerolled by
refreshing. Cryptographically secure rejection sampling avoids modulo bias.

Confirming does **not** send an email or text. Contact the winner through the
normal staff process; only then click **Mark notified**. If the winner does not
respond within seven full days, staff can release the record as unclaimed and
draw an alternate. Previous picks are excluded and historical records retained.
The tool records selection time, confirmation, notification, actor, and eligible
entry count. A partial unique index prevents simultaneous active winners.

Do not run a real drawing merely to test the dashboard. Use an isolated test
database for test drawings. Define the clinic's retention/deletion policy for
giveaway contacts and secure database backups before operating the promotion.

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
