# Perfect Day Lifestyle: book delivery setup

The website and Cloudflare handler are prepared. **This is not a live delivery
connection yet.** Do not enable public requests until the separate Zap and real
recipient tests below pass. Nothing here authorizes a GitHub push or publication.

## Setup checkpoint — November 5, 2026

The user has prepared the separate draft book Zap with a JSON POST trigger
sample and passing form/consent filter. The temporary self-post sample action
was removed. They created the restricted Requests sheet and installed the
protected Google Apps Script helper. Its anonymous GET returned
`post_required` after deployment access was corrected to Anyone.

The user confirmed that the helper POST and Google Sheet write worked after
true/false text normalization. Local mocked guard tests: 13 passing.
The user subsequently confirmed that the guard-result filter stopped a
duplicate sample, then allowed a fresh claimed sample that created a pending
row. The SOZO Gmail sender was selected and the delivery email configured with
dynamic trigger fields and no attachment. With permission for one email to an
inbox they control, the user confirmed receipt and a working book link.

The user also confirmed that the Google Sheets Update Spreadsheet Row action
updated the claimed row's delivery status, Gmail message ID and timestamp
while preserving the request details and creating no additional row. Its Row
input uses the helper's dynamic row number; the other columns remain unmapped.

The marketing-consent filter after logging stopped the marketing-false sample
as expected. The user selected SOZO's existing Mailchimp audience and saved an
untested Add/Update Subscriber action with email/status only; its available
fields did not expose first-name merge mapping. First name remains in the
request log and Gmail body. The user created an empty `Perfect Day Book` tag,
selected it in the separate Add Subscriber to Tag action, and saved a final
Sheet update for `marketing_status=subscribed_tagged` plus the current UTC
timestamp. Both marketing actions and the final logging action remain untested.
No Mailchimp enrollment test has been approved; review applicable active
Mailchimp automations before requesting permission for one.

This is a **controlled draft-Zap delivery test**, not public activation or
end-to-end website acceptance. Next: optional marketing connection and remaining
delivery/marketing acceptance checks. The Zap and revised website remain
unpublished; no permission for another email send has been given.
Do not copy private keys, deployment URLs, recipient details or request IDs into
this checkpoint.

## What visitors will receive

- The original **The Perfect Day Lifestyle**, by **Dr. Darrell Wolfe**, Edition 15.
- A free PDF, 529 pages, approximately 45 MB.
- First name and email are required. No phone number or health details.
- Successful capture reveals a link to open/download the PDF in Google Drive.
  Google may show its PDF viewer first; use its download control to save a copy.
- The separate workflow requests a Gmail email with the same link.
- Marketing consent is optional and starts unchecked.
- No assessment texts, booking, or Quo automation is triggered by this flow.

The Google Drive sharing link was supplied by SOZO. Its unauthenticated page
shows the expected file title. Keep it accessible to anyone with the link,
with viewer/download permission. It is not a private, email-locked file.
The website does not rehost the 45 MB PDF or change its contents.

## First: connect the correct Google email account

Signing in to Zapier with a Google email address does **not** automatically
connect Gmail as a sending app.

In the **new book Zap**, choose **Gmail → Send Email**. If Zapier asks for an
account, connect the Google account SOZO intends to use as the sender. Check the
account address shown on that step; do not accidentally use a personal account.
Enter credentials only in Google's own authorization screen, never in chat.
Do not test this action until its recipient is your approved test email.

## New Zap: “Website — Perfect Day Book”

Do not edit or duplicate the assessment/text Zap or the outside-event capture Zap.

For trigger mapping, select a **JSON POST** sample matching the website's
payload. A browser-address-bar GET puts fields under `Querystring`, which is
not the website's structure. Copy the pristine hook URL from its Copy control,
not a browser tab containing test query parameters. Remove any temporary
self-post sample action before publishing; otherwise it can create a Zap loop.

1. **Webhooks by Zapier → Catch Hook.** Create a new hook.
2. **Filter:** `form_type` exactly `perfect_day_book`,
   `book_request_consent` true, and `sms_consent` false.
3. **Prepare the restricted request log and locked claim helper:** use the
   SOZO-owned Requests sheet and the separately authorized Apps Script helper in
   `scripts/perfect-day/README.md`. The helper checks the request ID, creates its
   `pending` row and flushes it under one script lock. An ordinary separate
   Sheets lookup/create or timed Delay is not sufficient concurrency protection.
   The log includes people who decline marketing, not just subscribers.
4. **Filter the claim result:** continue only when helper `ok` is true AND
   `decision` is exactly `claimed`. HTTP 200 alone does not grant permission.
   Duplicate, busy, invalid, restricted or failed claims must stop. A genuinely
   new request from the same email has a new ID and may receive the book again.
   Do not add a second Create Row action; use the helper's returned row number.
5. **Gmail → Send Email**, using the mapped **email** field as the sole recipient.
   Use the draft below and map `first_name` and `book_download_url` as dynamic
   fields, not typed labels. Send a link, not a PDF attachment. Leave CC/BCC empty.
6. Update the request log with Gmail's message ID and a sent/accepted status.
   A Gmail acceptance is not proof of inbox placement; check the actual inbox.
7. **Only if `marketing_consent` is true:** add/update the contact in SOZO's
   existing Mailchimp audience using the established single opt-in policy.
   Apply a book-source tag without replacing unrelated tags or audience data.
   Fresh explicit opt-in may permit resubscription; never resubscribe on a
   marketing-false request. Preserve existing subscriber preferences otherwise.
8. When marketing is false, skip Mailchimp entirely. Do not unsubscribe an
   existing subscriber merely because they left this request's checkbox empty.

Send the book email **before** the optional marketing branch, so a Mailchimp
problem cannot prevent book delivery. Do not add an SMS step.

### Failure handling

Monitor Zap History and the request log for pending/failed deliveries. If a send
is ambiguous, check Gmail's Sent folder and the message ID before replaying.
Do not blindly replay the whole Zap or automatically resubmit the website form.
Use a deliberate retry over the failed step only after checking whether it sent.
If delivery fails after the website receives webhook acceptance, the website
cannot see that downstream failure: staff must handle it from Zap History.

## Draft delivery email — review the sender and wording with SOZO

**Subject:** Your free copy of The Perfect Day Lifestyle

Hi **[mapped first_name]**,

Thank you for requesting The Perfect Day Lifestyle by Dr. Darrell Wolfe.

**Open or download your free PDF: [mapped book_download_url]**

The book is 529 pages and approximately 45 MB. It opens in Google Drive, where
you can read it or use the download button to save a copy.

At SOZO, we bring mental, emotional, physical and spiritual well-being into the
same conversation. If your reading raises questions about your own wellness
goals or our services, reply to this email or text or call 352-802-2248.

The book reflects its author's perspectives and is not a personalized care plan.

Warmly,  
SOZO Wellness Center  
352-802-2248

You are receiving this email because you requested the free book. This request
does not sign you up for promotional emails unless you separately chose them.

This is the requested delivery email, not a promotional follow-up sequence.
Any later marketing must use Mailchimp's unsubscribe handling and the visitor's
separate consent. Review book promotion and the applicable privacy notice before
launch; do not silently change the approved Privacy Policy.

## Cloudflare Production settings — only after approval to push the code

Add new settings without changing any `ASSESSMENT_*` settings.

| Name | Type | Initial value |
| --- | --- | --- |
| `GUIDE_DELIVERY_ENABLED` | Text | `false` until the dedicated Zap is ready |
| `GUIDE_DELIVERY_MODE` | Text | `test` |
| `GUIDE_TEST_EMAIL` | Secret | Approved recipient email, entered directly in Cloudflare |
| `ZAPIER_GUIDE_WEBHOOK_URL` | Secret | The **new** book Catch Hook URL, entered directly in Cloudflare |

Reuse the existing `TURNSTILE_SECRET_KEY` and `VITE_TURNSTILE_SITE_KEY`; do not
rotate them for this feature. The book widget uses action `guide_request`,
separate from the existing assessment action. The handler rejects wrong actions,
wrong hostnames, expired tokens, and missing/invalid security configuration.
Never paste a webhook URL, widget secret, password, or authorization token in chat.

If the new hook equals the configured assessment hook, book delivery stays
disabled. No general online-enquiry setting enables book delivery automatically.

Deploy the approved code and saved settings. When the new Zap is configured and
published, set `GUIDE_DELIVERY_ENABLED` to `true`, retaining mode `test`, save and
redeploy. The public page will show that only the approved test recipient may
submit; it will not disclose that address.

## Controlled acceptance tests

Do these with the approved test email only, after separate permission to send.
Do not use Zapier's whole-Zap test or click a send action with sample recipients.

- Marketing unchecked: exactly one Gmail book email, immediate PDF access,
  request log saved, no Mailchimp enrollment or texts.
- Existing subscriber and repeat request: book still arrives; no unrelated
  preference changes. Replaying the **same request ID** must not send a duplicate.
- Marketing checked: only when explicitly approved, verify the correct
  Mailchimp audience/tag and expected consent behavior.
- Open the PDF while signed out of Google and check a phone download.
- Verify both new-recipient and returning-recipient delivery, sender address,
  reply handling, spam placement and the supplied PDF.
- Verify a non-test address is rejected in test mode without a Zap run.
- Confirm no extra appointment, initial assessment, Quo thread, or SMS is created.

The website reports **accepted for processing**, not **email delivered**.
Only move `GUIDE_DELIVERY_MODE` to `live` after all checks and explicit public
launch approval. Save/redeploy after the setting change. To stop new requests,
set `GUIDE_DELIVERY_ENABLED` to `false` and redeploy; queued Zap runs need separate
attention in Zapier.

Configure an edge rate-limit rule for `POST /api/guide-requests` before public
launch. The built-in five-attempts-per-hour guard is best-effort per isolate,
not distributed protection across Cloudflare locations.

## Preview behavior and maintenance

Replit preview deliberately reports book delivery disabled and rejects POSTs.
It never fakes success, saves a request, or sends an email. You can review the
page, cover, book description and consent wording there.

Edit book metadata and its public link in
`artifacts/sozo-wellness/src/data/perfect-day.ts`; review and approve a push.
The original PDF remains credited to its author. Keep the “Coming soon” state
until production configuration and the actual delivery flow are verified.
