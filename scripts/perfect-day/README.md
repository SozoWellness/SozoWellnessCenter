# SOZO book-request guard

This is source code for a SOZO-owned, spreadsheet-bound Google Apps Script.
It is **not deployed** by adding it to this repository. It sends no messages.

## Purpose and boundary

The script takes one script-wide lock around an exact request-ID lookup, row
reservation and flush. Only a newly committed row gets `ok: true` and
`decision: claimed`. Replays return `duplicate`; simultaneous contenders cannot
both reserve the same ID. A different UUID for the same email is a new request.

This is an **at-most-one claim**, not a promise of exactly-once Gmail delivery.
If a claim succeeds but Gmail/the response fails, inspect the sheet, Gmail Sent
and Zap History. Do not delete the row, create a new ID or blindly replay Gmail.
Directly testing/replaying a downstream send step can bypass the guard.

## Install with the user

1. In SOZO's restricted **SOZO — Perfect Day Book Requests** spreadsheet, confirm
   the tab is `Requests` and the first eleven cells are:
   `request_id`, `submitted_at`, `first_name`, `email`, `marketing_consent`,
   `consent_version`, `is_test`, `delivery_status`, `gmail_message_id`,
   `marketing_status`, `updated_at`.
2. Open **Extensions → Apps Script**. In this new bound project, replace the
   default function with the complete contents of `request-guard.gs`. Do not
   overwrite any unrelated existing project.
3. Save, then select and run **setupBookRequestLog** once from the editor.
   Review Google's authorization screen under SOZO's account. The script uses
   Google Sheets access; `openById` requires the Sheets authorization scope,
   which can permit access to other spreadsheets under that account. The code
   restricts itself to the configured ledger. It requests no Gmail/Drive sending
   access and does not fetch external URLs. Do not bypass an unexpected warning
   or organization restriction; stop and review it.
4. In **Project Settings → Script Properties**, review the generated settings.
   `BOOK_REQUEST_KEY` is a private 64-character generated key: never send it in
   chat, screenshots, source, logs or a URL. Copy it only into the dedicated
   Zap's authenticated helper request. `BOOK_SHEET_ID` points to this spreadsheet.
5. Keep `BOOK_MODE=test`. `BOOK_TEST_EMAIL` initially allows only the reserved
   synthetic `book-workflow-test@example.com` for a log-only test. It is not an
   email recipient. A real approved recipient must replace this setting before
   any expressly authorized real email test.
6. After permission to test the helper, set `BOOK_ENABLED=true` for this separate
   test helper only. This does not enable the website.
7. Deploy a **Web app**, execute as the SOZO deploying account, allow the
   unauthenticated caller option needed by Zapier (usually **Anyone**). This
   exposes a private-key-protected endpoint, not the Sheet. If SOZO policy
   prevents this, stop rather than weakening account controls.
8. Use the `/exec` deployment URL in the book Zap only. Google web-app source
   edits require a new deployment version; changing Script Properties does not.
   Keep one authoritative script project/ledger; do not clone active claim
   endpoints into projects with independent locks.

No deployment or property changes have been made by the local tests.

## Add the actual claim step in the book Zap

After the form/consent filter, add **Webhooks by Zapier → POST**. This is a call
to the **Google helper**, never a self-post to the Zapier Catch Hook.

- Payload type: **JSON**.
- URL: the Google web-app `/exec` URL.
- Data: enter `auth_key` as the private generated key directly in Zapier.
- Map these other data keys from the actual JSON Catch Hook sample:
  `request_id`, `submitted_at`, `source`, `form_type`, `is_test`, `first_name`,
  `email`, `book_request_consent`, `marketing_consent`, `sms_consent`,
  `consent_version`.
- Use individual structured Data key/value rows, not raw string interpolation:
  Zapier must JSON-escape names and other values safely.
- Do not send tokens, phone numbers or health details.
- Keep the Zap draft. Any test creates a synthetic ledger row, but no email.
- Do not share screenshots of this step's auth key. Restrict Zap editing/history
  access to appropriate staff; the key is an action input visible to that role.

Then add **Filter by Zapier**, requiring BOTH:

- helper `ok` exactly `true`;
- helper `decision` exactly `claimed`.

**HTTP success alone is insufficient.** Google ContentService returns JSON even
when a claim is refused. `duplicate`, `busy`, `disabled`, `restricted`,
`invalid_request`, `unauthorized`, `ledger_unavailable` and `ledger_capacity`
must all stop before Gmail. Refused claims are visible in Zap History, not email
notifications from this helper.

The successful result contains `row_number` for later updates of the same
sheet row. Do **not** add a second Google Sheets Create Row action.

## After the claim

1. Configure Gmail with the original validated request email as sole recipient,
   requested-book link, approved copy, no attachment, no CC/BCC.
2. Update the existing row identified by the helper's `row_number`: save Gmail's
   returned message ID, `delivery_status=sent_accepted` and an updated timestamp.
   Preserve request ID, other original fields and optional marketing choice.
   Gmail acceptance is not inbox-delivered proof.
3. Gate the Mailchimp branch on explicit marketing permission, after Gmail.
   Update `marketing_status` only after its actual result; skip Mailchimp for
   false without changing existing subscribers.
4. Staff monitor old `pending` rows and unsuccessful claim/send steps. Never
   treat a duplicate's existing row as permission to send.

## Tests before public activation

- New ID: exactly one `pending` row and `claimed`.
- Same ID again: `duplicate`, no new row; duplicate with different casing also
  stops. New ID for same email: another legitimate claim.
- Simultaneous same-ID calls: at most one `claimed`/row. Busy or duplicate
  contenders must not reach Gmail.
- Wrong key, malformed data, missing consent, SMS=true, wrong mode/email,
  changed sheet headings or disabled helper: no permission to send.
- Literal names beginning `=`, `+`, `-` or `@` are spreadsheet-safe.
- Verify failures/partial writes stop sends and preserve a record for review.
- These helper tests are in addition to the book flow's actual inbox,
  marketing-choice, signed-out/phone PDF and no-SMS acceptance checks.

Local unit tests use mocked Google services, not the user's Google account:

```sh
node --test scripts/perfect-day/request-guard.test.mjs
```

## Operational limits

- Keep the Sheet Restricted; limit editing/deletion of IDs, headers and statuses.
  Google Sheets edits or other script projects bypass this project's lock.
- A ledger above 50,000 rows refuses new claims rather than silently missing old
  IDs. Plan a durable replacement or migration before reaching that limit.
- Google quotas/unavailability cause refusal, not fallback to an unguarded send.
  No automatic retry or unlocking of pending records is implemented.
- Turning `BOOK_ENABLED=false` stops new claims. It does not cancel Zap runs
  already authorized or prevent a direct downstream Gmail replay.
- Key rotation needs both the script property and the Zap input updated. Do not
  rotate during in-flight sends without a coordinated pause.
