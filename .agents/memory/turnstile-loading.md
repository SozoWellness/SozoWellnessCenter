---
name: Turnstile runtime constraints
description: Browser SDK and Workers fetch restrictions missed by permissive local mocks.
---

For an asynchronously loaded explicit-render Turnstile script, use the script
load event as the readiness signal rather than calling `turnstile.ready()`.

**Why:** The real Cloudflare SDK throws error 3857 when `ready()` is combined
with async/defer loading. This prevented the production widget from rendering,
even though the initial browser mock passed because its `ready()` always
invoked the callback. Both the real deployed browser exception and the vendor
script confirmed the restriction; widget key/hostname validity was not
established by that failure.
The user subsequently confirmed that the live widget completed successfully
with load-event readiness. This confirms the client-loading approach, not
server-side token validation or downstream enquiry delivery.

**How to apply:** Preserve the async-load contract when changing the loader.
Model the throwing vendor behavior in regression tests, not only a permissive
mock. A mocked browser pass does not prove that the live widget configuration
works; verify the real widget without submitting contacts before launch.

## Workers redirect handling

Use `redirect: "manual"` and reject non-2xx responses for sensitive outbound
requests from Cloudflare Workers. Do not use `redirect: "error"`.

**Why:** Workers does not implement the Fetch-standard `error` redirect mode;
it throws before sending any request. Node accepts it, so Node-based mocks alone
miss this incompatibility. Cloudflare's official Request documentation explicitly
states this restriction. Do not diagnose this exception as a bad widget secret.
The user confirmed a successful protected form submission with supported
redirect handling. This verifies server-side Turnstile validation and webhook
acceptance, not completion of the downstream Quo or Mailchimp actions.

**How to apply:** Check Workers-specific request support when adding or changing
outbound calls, and model incompatible options in local tests. Manual mode must
still reject redirects rather than following them with secrets.
