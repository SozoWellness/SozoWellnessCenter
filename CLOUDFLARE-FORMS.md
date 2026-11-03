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

The webhook secret already in Replit does **not** transfer to Cloudflare. Paste it
directly into Cloudflare's encrypted secret field; do not put it in chat, Git, a
`VITE_` variable or browser JavaScript. Redeploy after changing these settings.
Leave delivery disabled in **Preview** deployments and do not give previews the
live webhook secret. No Mailchimp or Quo API keys are needed here: Zapier uses its
existing account connections.

Missing configuration or a delivery switch other than the exact string `true`
returns an explicit error. It does not pretend to save an enquiry.
Delivery also requires an explicit mode: `contact_capture_test` or `live`.
Missing or misspelled modes fail closed.

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
limit. The in-memory limit is **not global or durable**; configure Cloudflare
edge rate limiting/bot protection for this endpoint before public launch.
No submitted contact details, webhook URL or upstream error body are logged.

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
7. Before public use, approve and update the current form's saved-only,
   no-notifications notice and success text to describe the verified delivery
   behavior. Those existing notices are intentionally unchanged until the
   connection is tested, per the handoff instructions.
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
