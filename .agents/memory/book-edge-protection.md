---
name: Book endpoint edge scope
description: Approved Free-plan compromise for book-request burst protection.
---

The user approved path-only edge rate limiting for the book endpoint after being
told it also counts GET availability checks, not just POST submissions.

**Why:** Cloudflare Free rate limiting cannot filter by HTTP method. Requiring
POST-only matching would not fit the selected plan. Edge counters are scoped
per data center, so never describe this as a global hourly quota.

**How to apply:** Preserve the disclosed all-method scope unless a new approach
is approved. See PERFECT-DAY-DELIVERY.md for operational evidence and settings.
Do not assume custom-domain protection applies to Pages project aliases.
