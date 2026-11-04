---
name: SOZO service connections
description: User-specified services and purposes for contact capture, booking, and the guidebook.
---

Assessment enquiries should capture names, phone numbers, and email addresses and flow into Quo (formerly OpenPhone) and SOZO's existing Mailchimp account for email messaging.

SOZO uses Jane for appointment booking; the website should point clients to SOZO's Jane booking site.

The Perfect Day Lifestyle guidebook is free, and requests for it need to be captured.

**Why:** The user specified these business requirements and existing services.

**How to apply:** Use these providers and purposes when discussing or implementing the connections; confirm unspecified workflow details rather than assuming them.

## Jane booking and website enquiries

Keep direct Jane booking separate from the website enquiry workflow. Use styled
external booking links rather than the supplied fixed-size 177×28 iframe button;
do not send enquiry form values to Jane through URL parameters.

**Why:** Native links preserve the site's existing button styling and mobile
accessibility without introducing a small fixed-size embedded control. Jane
handles booking; the public website enquiry is not an appointment reservation.

**How to apply:** Keep the enquiry form and service-interest links available
alongside online booking. Ask for actual service/practitioner-specific Jane
URLs before adding deep links; do not invent them from the general booking URL.

## WordPress retirement

Retire WordPress entirely; do not keep it running to host Gravity Forms.

**Why:** The user explicitly chose to retire WordPress when asked whether to retain it for forms.

**How to apply:** Plan form connections without a running WordPress installation. Do not assume embedding the existing Gravity Form is an acceptable long-term solution.

## Assessment mobile number

Require a mobile number for assessment requests.

**Why:** The user explicitly chose to require a mobile number rather than keep phone optional.

**How to apply:** Treat mobile number entry as required when implementing the assessment form and its submission validation. This requirement does not itself establish consent to automated texts or marketing.

## Independent messaging opt-ins

Offer a separate optional text consent checkbox and a separate optional email marketing signup checkbox on the assessment form. Both start unchecked.

**Why:** The user selected both optional opt-ins after these separate, unchecked choices were proposed.
They also confirmed in a controlled website test that Quo and Mailchimp both
saved the contact while no texts were sent with SMS consent unchecked.
With explicit SMS consent in a separate restricted test, the user confirmed
receipt of both the acknowledgement and delayed follow-up. This verifies that
delivery path, not cancellation after a reply or booking.

**How to apply:** An assessment enquiry must still be accepted when either or both boxes are unchecked. Gate automated request texts on text consent, and marketing subscription on email marketing consent.

## Reply handling and staff availability

Staff should respond to incoming replies in Quo, with an automated text fallback
if staff do not respond right away, including after hours.
During staffed hours, wait five minutes for a staff response before the fallback.
Use Monday–Friday, 9:00 a.m.–5:00 p.m., America/New_York, as the staffed window.
Count weekends as after hours.

**Why:** The user said, “Ideally, staff will respond in Quo, but we'll need to be
prepared with an automated text if they don't respond right away (ex: after hours).”
They selected the five-minute staffed-hours fallback.
They explicitly confirmed a 9 a.m. Eastern opening after an outdated 8 a.m.
website listing was discovered, and said to count weekends as after hours
“to be on the safe side.”

**How to apply:** Keep staff as the primary responders and use the agreed
schedule, with daylight-saving-aware Eastern time rather than a fixed UTC
offset. Confirm any future schedule changes rather than inferring coverage.

An existing automation already sends an after-hours acknowledgement: the user
received a message saying the center was closed after 5 p.m. and SOZO would
respond the next business day when they sent a direct test text.

**Why:** This was observed before a sending action was added to the new reply
workflow. The user's Quo settings screenshot subsequently confirmed enabled
incoming-message auto-replies during business hours and after hours. The
daytime message acknowledges receipt without a stated wait.

**How to apply:** Inspect existing Quo auto-replies and other relevant automations
before adding an after-hours sender. Do not assume this direct-text result also
verifies a reply shortly after the website's automated acknowledgement.
These native settings affect the whole SOZO number, not just website enquiries.
The after-hours message correctly says Monday–Friday 9 a.m.–5 p.m.; the legacy
website's 8 a.m. opening is outdated according to the user's clarification.
Message wording alone does not prove Quo's configured business-hours schedule.

## Quo incoming-trigger test samples

Treat generic Quo trigger samples as schema examples, not evidence of a live
incoming message or a broken connection.

**Why:** Repeated trigger tests returned placeholder sender/recipient numbers
and generic text even after the user received an after-hours response to their
real incoming test. Zapier documents that some apps only provide generic test
records: https://help.zapier.com/hc/en-us/articles/8496262128141 .

**How to apply:** Do not repeatedly ask the user to send texts just to replace
these samples. Use them only to map a draft, retain a real test-sender allowlist
that deliberately rejects placeholders, and require controlled real-event
verification before trusting the workflow. Never send an action test to the
sample's recipient or claim sample tests prove live delivery.

## Zapier inherited publishing warnings

A Paths container warning can come from an untested child Delay step rather
than a sending action or a path condition that correctly rejects the sample.

**Why:** The user confirmed that testing the Delay alone cleared both its
warning and the parent Paths warning, allowing the restricted reply Zap to
publish without testing its SMS sending action.

**How to apply:** Inspect the marked child steps first. Test a Delay individually
when appropriate; never use a bulk path test or send an SMS merely to clear an
inherited publishing warning.

## SMS guard query windows

Use different guards for the reply fallback and the original delayed follow-up.

**Why:** A query starting at an incoming reply's timestamp excludes earlier
acknowledgements. A query starting at the website submission includes the
initial outgoing acknowledgement, so blindly blocking every outgoing message
would suppress every original follow-up.
The user confirmed the guarded workflow with a real controlled website
submission followed by a mobile reply. Its run history showed the filter
stopping the run and the follow-up sending action not attempted. In a separate
controlled enquiry without a reply, the user confirmed receiving the follow-up.
Both original follow-up cases are verified. The user also confirmed receiving
the separate reply fallback at five minutes after a controlled reply, showing
that the earlier website acknowledgement did not suppress that fallback.
This does not verify suppression after a staff answer or website-specific
after-hours handling.

**How to apply:** Prefer identifying the initial acknowledgement by its actual
message ID or creation timestamp when available, without sending action tests
merely to populate editor output. If using the submission-time window instead,
only permit the delayed follow-up when the complete result contains exactly
one delivered outgoing message; incoming messages or additional outgoing
activity block it. Missing, inconsistent, or paginated results must not send.

## Separate event-capture workflow

The existing Zapier Forms → Mailchimp → Quo workflow is for outside-event email captures, not the website. Keep that form and workflow as-is.

**Why:** The user clarified its purpose and explicitly said it will still be used unchanged.

**How to apply:** Treat website marketing opt-ins as a separate connection; do not replace or repurpose the event-capture workflow.

## Website hosting and email opt-in

The user selected Cloudflare Pages for the website form connection. They chose
Mailchimp Double Opt-In False: the website's optional email checkbox is the
single opt-in, without a separate confirmation email.

**Why:** These were explicit user selections during the website connection setup.

**How to apply:** Keep website delivery compatible with Cloudflare Pages rather
than assuming the Replit Express server runs there. Preserve the selected opt-in
behavior unless the user changes it; it does not authorize testing live emails,
automatically resubscribing unsubscribed contacts, or enabling new automations.

## Quo contact matching

Do not assume the configured Quo “Create or Update Contact” action deduplicates
by phone or email when its ID field is blank.

**Why:** The user ran the same isolated contact action twice with identical
synthetic input and confirmed two matching contacts in Quo.

Mapping the webhook's normalized Phone token into ID prevented an additional
duplicate in the user's controlled repeat test. Keep that stable mapping for
new website leads; never use a per-submission request ID as the contact ID.

**Why:** After introducing the Phone-based ID, the user confirmed that a further
identical contact-action test left the matching contact count unchanged.

**How to apply:** Reverify matching if the ID mapping changes. This test does not
prove existing fields update correctly or establish matching against legacy or
event-capture contacts created with different identifiers. It does not merge
duplicates created before the stable mapping.

## Cloudflare delivery confirmation

Keep webhook acceptance separate from response-body cleanup and from completion
of the downstream Quo/Mailchimp actions. Never retry automatically after an
ambiguous delivery error.

**Why:** The user's controlled Cloudflare submission repeatedly reported delivery
failure, including after replacing the hook secret. They confirmed website
success after response handling was revised to make cleanup non-fatal and add
restricted diagnostics. The original failure's exact cause was not captured;
do not claim that either revision alone proved the cause.

**How to apply:** Preserve these delivery boundaries during future refactors.
A website success still requires checking Zap history and destination records
before claiming the whole contact flow works.
