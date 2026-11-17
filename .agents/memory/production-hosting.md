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

The user approved optional promotional-email consent for giveaway entry.
Contact email/phone, rules acceptance, and Florida/age eligibility remain
required. An unchecked email box must not create a marketing subscription or
authorize the giveaway email sequence; existing subscription preferences remain
unchanged.

**Why:** The owner chose to separate giveaway entry from promotional permission
during the rules review.

**How to apply:** Treat every eligible entrant equally for the drawing and keep
entry records distinct from permission to send promotional messages.

For giveaway rules, use the original brief and the user's explicitly approved
amendments, without inventing additional prize conditions.

**Why:** When asked about additional prize restrictions, the user said, “Only
what was already included the prompt,” and objected to being asked for terms
already covered by the brief.

**How to apply:** Do not make a specific drawing date, screening condition,
expiration, or other unrequested restriction a prerequisite for approving the
rules. Distinguish optional recommendations from requirements.

The user approved limiting the existing general welcome flow to contacts whose
giveaway entry timestamp (`GVENTERED`) is blank.

**Why:** Giveaway entrants should not receive both welcome emails. The entry
timestamp is supplied when the contact is created, whereas giveaway tags are
added afterward.

**How to apply:** Preserve the general welcome email's content and unrelated
settings. Use this narrow exclusion rather than relying on a later-added tag;
verify the external Mailchimp setting rather than assuming it was applied.

Verify GitHub's actual branch reference before treating a push error as a failed
release.

**Why:** This workspace can accept a remote push and then report a nonzero exit
when the local remote-tracking reference update is blocked.

**How to apply:** Use a read-only remote-reference check to distinguish remote
acceptance from a local bookkeeping error. Do not repeat a successful push just
to repair the local tracking reference.
