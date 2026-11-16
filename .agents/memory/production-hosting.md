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
