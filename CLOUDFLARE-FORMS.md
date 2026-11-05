# Cloudflare Pages assessment form connection

## What is implemented

The root `functions/api/assessment-requests.ts` handles the existing browser request
at `/api/assessment-requests`. It uses the same generated validation contract as
the Replit API. The website design, form fields, build command and package
configuration are unchanged. `_routes.json` limits Function invocations to this API
route; website pages and assets remain static.

The Cloudflare handler sends contact details, selected interest, optional message,
request consent and the **two independent** messaging permissions to the website
assessment Catch Hook. Free-text enquiry content must not be mapped into Mailchimp.
The form continues to warn visitors not to submit sensitive health information.

The existing outside-event Zapier Form → Mailchimp → Quo workflow is separate and
must remain unchanged. No Jane booking or guidebook delivery is added here.

## Git-connected Pages build settings

- Framework: None/custom.
- Root directory: repository root (leave blank), **not** the website subdirectory.
  Cloudflare must detect the repository-root `functions/` directory.
- Build: `pnpm --filter @workspace/sozo-wellness run build`
- Output: `artifacts/sozo-wellness/dist/public`
- Keep the existing Node/pnpm build settings (`NODE_VERSION=24.22.1`,
  `PNPM_VERSION=10.26.1`). Set build variables `PORT=4173` and `BASE_PATH=/`;
  the existing prerender step requires them even though Pages does not run a
  persistent web server. Do not set `NODE_ENV=production` globally during
  dependency installation, because the build uses devDependencies.
  No Express process or Replit database is needed by the Cloudflare handler.
- Do not deploy only the static output folder with dashboard drag-and-drop:
  use the Git-connected Pages build so the Function is compiled too.

## Cloudflare-only variables and secrets

In the Pages project's **Settings → Variables and Secrets**, choose the
**Production** environment:

| Name | Type | Initial setting |
| --- | --- | --- |
| `ZAPIER_ASSESSMENT_WEBHOOK_URL` | Secret/encrypted | The Catch Hook for the **website assessment** Zap |
| `ASSESSMENT_DELIVERY_ENABLED` | Plain text | `false` |
| `ASSESSMENT_DELIVERY_MODE` | Plain text | `contact_capture_test` |
| `ASSESSMENT_TEST_EMAIL` | Secret/encrypted | An email address you control, entered directly in Cloudflare |
| `ASSESSMENT_TEST_PHONE` | Secret/encrypted | Only for the SMS test: your own mobile number, in E.164 format |
| `VITE_TURNSTILE_SITE_KEY` | Plain text | Public site key from the SOZO Turnstile widget (available during build) |
| `TURNSTILE_SECRET_KEY` | Secret/encrypted | Matching widget secret, server only; never use a `VITE_` prefix |

The webhook secret already in Replit does **not** transfer to Cloudflare. Paste it
directly into Cloudflare's encrypted secret field; do not put it in chat, Git, a
`VITE_` variable or browser JavaScript. Redeploy after changing these settings.
Leave delivery disabled in **Preview** deployments and do not give previews the
live webhook secret. No Mailchimp or Quo API keys are needed here: Zapier uses its
existing account connections.

Missing configuration or a delivery switch other than the exact string `true`
returns an explicit error. It does not pretend to save an enquiry.
Delivery also requires an explicit mode: `contact_capture_test`,
`sms_delivery_test`, or `live`.
Missing or misspelled modes fail closed.

### Turnstile verification

Create a Managed widget in Cloudflare Turnstile for the exact production
hostname, currently `sozowellnesscenter.pages.dev` (no protocol or path).
Pre-clearance is not needed. Add any future custom hostname to the widget before
testing there; do not change DNS as part of this setup.

Enter the public site key and encrypted secret directly in the Pages project's
Production settings using the names above. These settings do not transfer to
Replit. Save and redeploy; the `VITE_` site key is embedded at build time, whereas
the secret is available only to the Function. Do not share the secret in chat.

The form explicitly renders a flexible-width widget with action
`assessment_request`. Submission is disabled until a token is ready. Expired,
failed, or interrupted challenges clear the token and offer a security-check
retry without clearing the entered form values. Every completed API attempt
discards the single-use token; refreshing a challenge never resubmits the form.
Do not retry a submission after an ambiguous Zapier delivery error without
checking history first.

The Function requires Siteverify success, a hostname matching the request's
hostname, and the correct action before making any Zapier request. This applies
to **all** delivery modes; there is no production bypass. Missing secrets,
network errors, invalid JSON and verification timeouts fail closed. Missing,
expired, reused or wrong-site tokens cannot reach Zapier. Tokens and secrets
are neither stored nor included in the webhook. Siteverify receives only the
verification token, widget secret and client IP—not enquiry fields.

Without a configured site key a production build disables form submission and
shows contact alternatives. The keyless Replit development preview remains
explicitly save-only and does not verify Cloudflare deployment protection.
The handler's token property is optional in the shared API contract only to
preserve that save-only development endpoint; Cloudflare still requires it.

After an approved code deployment, check the widget and make one agreed
contact-only submission with SMS consent **unchecked**, using the configured
test email. Keep marketing unchecked unless an additional real subscription
test has been approved. Verify the Zap run and Quo record; never infer a new
contact from a Mailchimp branch skipped due to marketing consent being false.
Use mocked Siteverify responses for local automated tests, not live recipients.

### Restricted contact-capture test

Keep delivery `false` and the website Zap off while preparing these settings.
In `contact_capture_test` mode, the handler requires a valid configured test email
and accepts only that address (case-insensitive). It rejects requests with SMS
consent checked, without forwarding them. Email marketing consent is still
independent: check it for the controlled Mailchimp subscription test.
Do not commit the real test address or put it in chat.

After this version is deployed and settings verified, enable only the website
Zap and delivery switch for the agreed test. Submit once on the Cloudflare site
with your own phone number and approved email, SMS unchecked, and email signup
checked. This creates real Quo/Mailchimp records; it is not a synthetic mapping
sample, so the payload retains `is_test: false`. No Mailchimp welcome automation
is configured or authorized here. Verify both results in Zap history and the
destination apps; do not infer completion from the website success response.
Then disable delivery and the Zap while reviewing results. Public launch requires
separate approval, truthful form notices, edge protection, and changing mode to
`live`; remove the test-email setting when it is no longer needed.

### Restricted SMS delivery test

This mode prepares a real two-message test; deploying the code alone sends
nothing and does not change the environment settings. Obtain approval before
enabling or submitting the test. Keep the outside-event workflow unchanged.

1. Enter your own mobile number directly into Cloudflare Production as the
   encrypted `ASSESSMENT_TEST_PHONE` setting. Use E.164: a leading `+`, country
   code and digits only, with no spaces or punctuation. Never commit the real
   test phone or email to the repository.
2. Keep `ASSESSMENT_TEST_EMAIL` set to the same controlled address. Change
   `ASSESSMENT_DELIVERY_MODE` to `sms_delivery_test`, retaining the existing
   website webhook. Missing/invalid recipient settings disable delivery.
3. After code/settings deployment and approval, submit **once** from the
   Cloudflare website using exactly those contact details, required request
   consent checked, SMS consent checked, and marketing email unchecked.
   The handler rejects mismatched contacts or consent choices before forwarding;
   it never silently overrides consent.
4. The existing website Zap must be on. Quo contact capture runs, Mailchimp is
   skipped, and the SMS branch receives `sms_consent: true, is_test: false`.
   Expect the acknowledgement and the follow-up after the configured ten-minute
   delay. Quo/carrier charges may apply. No messages are sent by local tests.
5. Verify both actual texts and the corresponding Zap run. Do not use Zapier's
   full Test Run or retest with the synthetic mapping sample. If delivery is
    uncertain, inspect history before resubmitting. The follow-up now has a
    message-history guard: controlled tests confirmed suppression after a
    visitor reply and delivery when no reply was received. No Jane-booking
    cancellation integration has been verified; do not infer one from SMS tests.
6. When the test finishes, return to `contact_capture_test` or disable delivery
   and redeploy. Disabling new submissions does not cancel an already queued
   Zapier delay. Review pending runs separately if a queued follow-up must stop.
   Public launch still requires protection review and separate approval.

## Payload and delivery boundaries

The payload matches the trigger samples already mapped in Zapier:
`name`, `first_name`, `last_name`, `email`, `phone`, `interest`, `message`,
`consent`, `sms_consent`, `marketing_consent`, `source: sozo_website`,
`form_type: initial_assessment`, `is_test: false`, `submitted_at`, plus a
server-generated `request_id`.

The full entered name is preserved. First name uses the first whitespace-separated
word, with the remainder in last name; this is only a mapping convenience and
cannot reliably interpret every person's name.

Cloudflare does **not** write to Replit PostgreSQL. A successful response means
Zapier accepted the webhook, not that Quo/Mailchimp finished successfully. There is
no durable retry queue or exactly-once guarantee. The handler makes one outbound
attempt, blocks redirects and times out after 10 seconds. A timeout can occur
after Zapier received the request: check Zap history before repeating a request.

Protection includes same-origin JSON requests, a 16 KiB streamed body limit,
server-side validation, honeypot and a bounded per-isolate five-attempt/hour IP
limit, plus mandatory Turnstile server verification. The in-memory limit is
**not global or durable**; Turnstile is not a distributed rate limiter or a
guarantee against every form of abuse. Review additional edge rate limits if
needed, using controls available for the actual Pages hostname/account rather
than assuming zone-based WAF rules apply to a `pages.dev` hostname.
No submitted contact details, webhook URL or upstream error body are logged.
In restricted contact-capture and SMS test modes only, a failed forwarding response
includes a safe diagnostic: upstream HTTP status, timeout, or connection error.
The form displays that code without exposing the hook URL, response body or
contact details. Live mode omits these diagnostics. Redirects are never followed.
Failure to cancel an upstream response body does not negate a confirmed 2xx
acceptance. No diagnostic adds a retry or sends a separate test request.

## Do not enable live delivery yet

1. Commit/push the implementation only when approved. This change does not itself
   push, deploy, change DNS, enable a Zap or send messages.
2. Deploy with delivery **false**. Confirm the website loads, and a form submission
   reports an error rather than a false success.
3. Verify the website Zap: Quo contact capture before branching; Mailchimp branch
   before the SMS delay; email path requires marketing consent; SMS path requires
   SMS consent; both paths reject `is_test: true`.
4. Mailchimp was configured with single opt-in (`Double Opt-In: False`) and no
   existing-contact updates. Existing audience contacts can halt that action;
   this conservative behavior must not be mistaken for updated contact details.
5. Confirm the Quo matching behavior does not create duplicate contacts. Ensure
   someone monitors failures in Zap history.
6. Agree on a controlled end-to-end test, permitted test recipient(s), and exactly
   which messages may be sent. Do not test Mailchimp/Quo actions with the synthetic
   example address/number. An off Zap's Catch Hook may accept a request without
   running its actions; webhook acceptance alone is not a launch test.
7. The form uses submission wording and displays the API's receipt message,
   without promising completed downstream actions, messages or an appointment.
   The no-notifications/saved-only notices were replaced after the controlled
   contact-capture test. This does not authorize public delivery or verify SMS
   sending; maintain the restricted test settings until launch approval.
8. Only after approval, enable the intended Zap and set production delivery to
   `true`, redeploy, then verify the agreed controlled submission. Neither action
   has been taken here.

The Replit preview continues using the existing save-only Express endpoint.
Do not use that preview as proof the Cloudflare Function is deployed.

## Local verification (no live webhook traffic)

From the repository root:

```sh
pnpm exec tsc -p functions/tsconfig.json
node --test artifacts/sozo-wellness/scripts/cloudflare-assessment.test.mjs
pnpm run typecheck
PORT=4173 BASE_PATH=/ pnpm --filter @workspace/sozo-wellness run build
```

The Function tests replace `fetch` with mocks; no real webhook, contact, text or
email is created.
