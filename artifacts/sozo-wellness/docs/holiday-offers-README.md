# Black Friday–Cyber Monday 2026 reservation page

## Scope and status

- Draft route: `/black-friday/`. No navigation link has been added.
- Not published by creating this draft. It is marked **noindex**, omitted from
  the sitemap, and not password-protected. Anyone with the preview URL can view it.
- No payment, checkout, card fields, Quo sync, Jane sync or automatic confirmation
  email. Staff follow up after the office reopens. Success means Mailchimp member
  and tag writes both succeeded, not that payment was made or an email was sent.
- Uses the owner's updated Freedom **7** package. The general Packages page was
  deliberately not changed as part of this campaign.
- The first two supplied campaign images are used. Other posters are reference
  material, not added services, redemption guarantees or medical claims.

## Configuration

The live website uses **Cloudflare Pages**, not Replit Publishing.
Set these in the intended Cloudflare Pages environment's Variables and secrets:

| Name | Type | Purpose |
| --- | --- | --- |
| `MAILCHIMP_API_KEY` | Secret | Existing Mailchimp Marketing API key |
| `MAILCHIMP_SERVER_PREFIX` | Text | Account data-center prefix, such as `us13` |
| `MAILCHIMP_AUDIENCE_ID` | Text | Intended existing audience ID |
| `HOLIDAY_CLAIMS_ENABLED` | Text | `true` only after testing and launch approval |
| `TURNSTILE_SECRET_KEY` | Secret | Existing Turnstile secret |
| `VITE_TURNSTILE_SITE_KEY` | Text/build | Matching public Turnstile site key |

Reuse the existing Mailchimp key and prefix if appropriate; do not disclose
them in chat, source code, or browser variables. The existing giveaway uses
`MAILCHIMP_GIVEAWAY_AUDIENCE_ID`; this campaign deliberately uses a separate
setting, `MAILCHIMP_AUDIENCE_ID`. Point it to the same audience only if intended.
Do not replace or rename the giveaway setting.

For a future Replit-hosted server, the three Mailchimp settings belong in
Replit's Secrets tool; setting them there does **not** configure Cloudflare.
The current Replit Vite preview explicitly returns disabled availability and
never sends contacts to Mailchimp. It uses a development-only
`/__holiday-preview/claim` endpoint because `/api` is routed to the separate API
artifact here; production builds use `/api/claim` on Cloudflare.
No new secrets are required just to review
the draft layout. Cloudflare functions remain under root `functions/`.

Cloudflare must build and deploy from the repository root so
`functions/api/claim.ts` and the shared TypeScript imports are bundled, as for
the existing Pages functions. Redeploy after settings change. Allow the
approved hostname in Turnstile. Never use a test secret in production.

## Opening and closing

The handler is fail-closed unless explicitly enabled and configured. Even if
enabled early, it only accepts requests from **November 27, 2026 at 12:00 a.m.
through November 30, 2026 at 11:59:59 p.m., America/New_York**. UTC boundaries
are November 27 05:00 inclusive and December 1 05:00 exclusive.
There is no public query parameter that bypasses this window.

### Controlled pre-opening test (Preview only)

The separate `holiday-test` branch can run one reservation-only test before
opening. This is not a public early-access offer and does not alter live dates.
It requires **all** of:

- `HOLIDAY_CLAIMS_ENABLED=true` and `HOLIDAY_PREVIEW_TEST=true` in Preview only.
- A secret `HOLIDAY_TEST_EMAIL` containing the owner's chosen test address.
- Cloudflare deployment metadata available to the Function:
  `CF_PAGES_BRANCH=holiday-test` and `CF_PAGES_URL` matching the request's exact
  unique HTTPS deployment URL under `sozowellnesscenter.pages.dev`.
- An unchecked promotional-email box and an email matching the allowlist.
- All normal validation, same-origin and Turnstile checks.

Missing deployment metadata fails closed; check GET `/api/claim` on the unique
test URL before submitting. Custom domains, the production branch, branch
aliases and other deployment URLs do not qualify. Never override Cloudflare's
deployment metadata to make a failing check pass. The UI displays a controlled
test notice without revealing the allowlisted address. This writes a real
Mailchimp contact and campaign tags, not a separate sandbox audience. Keep the
holiday journey inactive and verify the regular welcome exclusions first.

Do not set these test settings in Production. After the approved test, disable
claims and preview test mode, remove the test email secret, and redeploy the
test branch. Redeploying does **not** revoke an old immutable deployment URL;
retire the old test deployment separately with the owner's approval. The test
exception automatically expires at the normal November 27 opening regardless
of old deployment settings.
Review removal of test records separately; do not delete a pre-existing contact.

The page checks availability before enabling submission. The API independently
checks it again on POST, so keeping a tab open cannot bypass closing time.
Gift credit expiration remains March 31, 2027 as supplied. No unapproved bonus
gift-card expiration or other conditions have been invented.

## Mailchimp preparation and permissions

1. Confirm the intended audience has `FNAME`, `LNAME`, `PHONE`, and `BFRESAT` merge fields.
   `BFRESAT` is a **Text** field labeled **Holiday reservation time**, not required
   on Mailchimp's public forms and hidden from them where possible. The handler
   requires its presence and writes an ISO timestamp in the initial member PUT.
   Missing required fields fail explicitly instead of dropping contact details.
2. Optionally add a **Text** merge field named `PACKAGE`. If absent, the form
   still works and saves the selected package as a campaign-specific tag.
3. Review **existing audience welcome journeys and tag-triggered automations
   before enabling**. Adding a subscribed contact or a tag may trigger an
   existing automation even though this code never sends an email itself.
   Do not automatically edit or disable unrelated journeys.
   The existing **Email Subscriber Welcome** signup trigger must require **All**
   entry filters: **Giveaway entry time is blank** AND **Holiday reservation time
   is blank**, preserving any other applicable restrictions. The holiday marker
   is supplied when the contact is created; excluding only a tag added in a later
   request can let the regular welcome journey start too early. Verify and save
   this external Mailchimp setting before testing; the code does not configure it.
4. For any holiday promotional audience or journey, require both Mailchimp
   **Subscribed** status and the tag **`BF 2026 - Email Opt-in`**.
   `Black Friday 2026`, `BOGO Package`, and `Gift Card Bonus` track reservations,
   **not marketing permission**. Do not use them alone to send promotions.
5. New contacts without optional promotional-email permission are created with
   `status_if_new: transactional`, not subscribed. Staff must include
   non-subscribed contacts when looking at reservations.
6. Existing contact subscription status is never changed. An existing
   unsubscribed, cleaned or pending member is not silently resubscribed, even
   if they check the campaign email box. Direct them through your normal
   resubscription process if needed.
7. Required follow-up permission is separate from optional email marketing.
   This page does not collect consent for future promotional text messages.
   Reservation follow-up approval is reflected in its campaign-specific tag.
   No claim is made that these tags provide a full legal consent audit log.

Find reservations using **`Black Friday 2026`**. Offer tags identify their
selection, and `BF 2026 Package - …` identifies the package or “Not sure yet.”
Package tags and offer tags reflect the latest successful submission for an
email; a repeat submission updates the same member, not a second reservation.
There is no automatic campaign send, purchase, gift issuance or stock hold.

## Error handling and limits

- Same-origin JSON only; strict server-side validation; bounded request size;
  hidden honeypot; Turnstile hostname/action check; request timeouts; no raw
  provider response or contact details in logs.
- Success is shown only after member PUT **and** tags succeed. If the member
  saves but tagging fails, the visitor sees an error. Staff should check that
  contact before manual follow-up. Retrying updates the same member; no email
  sending is implemented here.
- No durable outbox, independent backup database or global rate limiter is
  introduced. Availability depends on Mailchimp. If stronger anti-abuse control
  is needed, approve a path-specific Cloudflare rule for `/api/claim` rather than
  assuming existing giveaway/book-request rules cover this endpoint.

## Images and copy

- Hero: `public/images/holiday-2026/bf-bogo-hero.webp`
- Package artwork: `public/images/holiday-2026/bf-bogo-packages.webp`
- Logo: `public/images/sozo-logo.png`
- Page layout and accessible copy: `src/components/holiday-offers.tsx`
- Scoped styles: `src/components/holiday-offers.css`
- Package values, form contract, consent wording and dates:
  `src/lib/holiday-offers.ts`
- Page title and description: `src/App.tsx`

Replace the optimized WebP files at those paths, or update their references.
Keep important offer details as real HTML, not only embedded in artwork.
Do not reproduce rounded per-credit amounts from posters as exact unit prices.

## Verification and launch checklist

Run from the repository root:

```sh
node --test artifacts/sozo-wellness/scripts/holiday-offers.test.mjs
pnpm --filter @workspace/sozo-wellness typecheck
pnpm exec tsc -p functions/tsconfig.json
PORT=4173 BASE_PATH=/ pnpm --filter @workspace/sozo-wellness build
```

The API tests mock Siteverify and Mailchimp; they never create live contacts.
They cover both consent choices, repeat submissions, existing subscription
statuses, missing optional fields, validation, opening/closing, bot protection,
and provider failure. They do not verify real credentials or automations.

Before live use: approve the page and copy, configure the intended Cloudflare
environment, review journeys/segments, and conduct one separately approved,
controlled end-to-end Mailchimp test. Date-boundary checks can be tested in the
mocked test suite without changing live dates. Publish only the scoped campaign
changes, excluding the resource-library drafts and unrelated preview work.
