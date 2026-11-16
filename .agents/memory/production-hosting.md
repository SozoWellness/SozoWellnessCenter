---
name: Production hosting boundaries
description: Why new live features must respect the external Cloudflare hosting and existing automations.
---

The live website is hosted on Cloudflare Pages through its GitHub-connected
project, not the separately published Replit review app.

**Why:** The owner-approved domain cutover retained Cloudflare hosting. Replit
preview changes, Replit Republish, and Replit-managed runtime credentials do not
configure or update that external production runtime.

**How to apply:** Prepare changes in preview, obtain publication approval, and
use the existing GitHub-to-Cloudflare release route. Keep production secrets and
service bindings in Cloudflare. Do not introduce a Replit-only authentication
proxy or assume a Replit connector is automatically available in Cloudflare.
Giveaway storage and administration were intentionally isolated from the
existing enquiry, book-delivery, and staff messaging flows to avoid disrupting
those live workflows.

The user declined adding payment details to activate Cloudflare Zero Trust
for giveaway staff access.

**Why:** The user chose “Avoid adding payment details” at the Free-plan checkout.

**How to apply:** Do not resume that checkout or ask for payment details again.
Use a verified no-card alternative only after the user approves the change.

For the one-day hyperbaric giveaway, the user approved the simpler Mailchimp
setup: existing staff login, tagged entrant exports, and manual winner selection
instead of the custom dashboard and a new authentication service.

**Why:** The user asked for a simpler way to run the giveaway without adding
payment details or another staff-login service.

**How to apply:** Keep Mailchimp as the staff interface; do not resume Auth0 or
Zero Trust onboarding for this launch. Background backup storage does not imply
that the user approved bringing the custom dashboard back.

Verify GitHub's actual branch reference before treating a push error as a failed
release.

**Why:** This workspace can accept a remote push and then report a nonzero exit
when the local remote-tracking reference update is blocked.

**How to apply:** Use a read-only remote-reference check to distinguish remote
acceptance from a local bookkeeping error. Do not repeat a successful push just
to repair the local tracking reference.
