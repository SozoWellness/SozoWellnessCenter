---
name: Turnstile async loading
description: A vendor SDK restriction missed by a permissive browser mock.
---

For an asynchronously loaded explicit-render Turnstile script, use the script
load event as the readiness signal rather than calling `turnstile.ready()`.

**Why:** The real Cloudflare SDK throws error 3857 when `ready()` is combined
with async/defer loading. This prevented the production widget from rendering,
even though the initial browser mock passed because its `ready()` always
invoked the callback. Both the real deployed browser exception and the vendor
script confirmed the restriction; widget key/hostname validity was not
established by that failure.

**How to apply:** Preserve the async-load contract when changing the loader.
Model the throwing vendor behavior in regression tests, not only a permissive
mock. A mocked browser pass does not prove that the live widget configuration
works; verify the real widget without submitting contacts before launch.
