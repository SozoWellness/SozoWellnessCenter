# SOZO website workflow audit

Review date: November 5, 2026. Scope: current workspace source, local checks and the user's previously observed controlled tests. **This is not live-site acceptance or permission to publish.** No submissions, emails, texts, appointments or external account changes were made for this audit.

## Important environment distinction

- **Replit Preview:** the assessment API saves to the development database only. It does not notify staff, subscribe to Mailchimp or send texts. This audit does not create database records.
- **Cloudflare website:** the production assessment Function can forward to the website Zap only when the configured delivery switch, mode and security checks allow it. The current account settings and published Zap mappings were not independently inspected here.
- **Existing live website:** the user reported that it still has the older form. Its behavior must not be inferred from this Preview.
- **Latest revisions:** unpublished pending owner review. Do not publish merely to test. Arrange an approved isolated review/test environment before a controlled updated-form acceptance test.

## Journey inventory

| Journey | Entry and destination | Current behavior and evidence | Gap / launch condition |
| --- | --- | --- | --- |
| Contact enquiry | `/request-assessment`; optional direct phone/email alternatives | Name, email, required mobile, selected interest and optional message. Required request consent; independent optional unchecked SMS and email-marketing choices. Preview → development database; Cloudflare → assessment Catch Hook → Quo, with separate consent-gated branches. Source and mocked handler tests cover validation and forwarding gates. User previously confirmed Quo capture and selected Mailchimp capture without SMS when SMS was unchecked. | Final approved-form test must verify actual destination records, truthful receipt and all permitted consent combinations. Confirm which staff monitor Quo; a webhook success does not prove downstream completion. |
| Email newsletter signup | Optional marketing checkbox on enquiry; planned book request checkbox | No separate newsletter-only form exists. Cloudflare includes `marketing_consent`; Mailchimp processing is configured externally. Prior controlled capture was reported successful. Book signup remains disabled. | Decide whether a standalone newsletter signup is wanted; do not invent it. Verify audience/tag, existing and unsubscribed contacts, unsubscribe handling, and absence of unintended welcome messages. Never interpret request consent as marketing consent. |
| SMS signup / acknowledgement | Optional SMS checkbox on enquiry; website Zap → Quo | Requires explicit SMS consent. Original acknowledgement and delayed follow-up were received by the user in restricted tests. User verified no-reply follow-up and suppression after an incoming reply. | Inspect current published consent gates and approved recipient restrictions before opening to public use. SMS signup does not imply a booked appointment. |
| Reply during staffed hours | Incoming Quo message → Website — Reply Handling | User verified fallback at five minutes when staff did not answer, and a manual staff response prevented fallback. Staffed window is Monday–Friday 9 a.m.–5 p.m. Eastern; weekends are after hours. | Preserve staff-first handling and native Quo acknowledgements. Validate this against the final approved website version without repeating live sends as part of routine QA. |
| Reply after hours | Direct incoming Quo message → after-hours branch/native acknowledgement | User's live run screenshot selected After Hours; user received the next-business-day message. This verifies **direct incoming text**, not the whole website-started sequence. | **Pending:** approved updated website submission → initial SMS → visitor reply after hours → correct acknowledgement, no duplicate sender or later inappropriate follow-up. Do not add another after-hours send action without checking native Quo behavior. |
| Appointment request | Enquiry page or contextual service enquiry links | Service interest is retained in the enquiry route. Submission explicitly does not reserve an appointment. The server receipt says accepted for processing, not scheduled or delivered. | Confirm staff response responsibilities and correct service-interest mapping. Do not describe a contact request as a booking or assume it starts Jane intake. |
| Direct SOZO booking | Header/mobile/footer and relevant page links → `https://sozowellnesscenter.janeapp.com` | Native external link with new-tab notice; no enquiry details passed in URL. Other contextual buttons intentionally lead to the information-request page. | Link presence is verifiable locally; appointment inventory, actual booking, reminders, confirmations and intake require SOZO's Jane account and an approved controlled test. No appointment was booked. |
| Independent physician booking | Independent Physician page → Years Younger MD | Kept separate from SOZO's Jane links and Chiropractic. Provider/team separation is retained. | Verify external practice destination and its actual booking process with that practice; do not merge its intake or imply SOZO processes it. |
| New patient intake / setup | Jane or staff-directed next step after booking | No separate public new-patient intake/setup form or website-to-Jane patient-creation integration was found. Public forms explicitly discourage sensitive health details. | Clinic must identify the intended secure intake path, who sends it and whether Jane handles it. Verify within Jane without collecting medical information through the public site. An absent flow is not a working integration. |
| Staff email notifications | No mail-sending action in the assessment Express API or Cloudflare Function | Preview saves only. Cloudflare forwards to Zapier; the website itself does not email staff. Quo contact capture does not establish that a staff email notification is configured. | Confirm whether staff email alerts are required, the destination and responsible staff. If required, connection work and controlled delivery proof are outstanding. |
| Visitor email confirmations | No assessment transactional-email action in website code | On-screen request receipt is implemented. SMS confirmations depend on SMS choice. Mailchimp marketing enrollment is separate and is not a transactional acknowledgement. | Decide whether enquiry-confirmation email is required, approve wording/sender, and verify it separately. Jane appointment confirmation must be verified in Jane. Do not promise either from webhook acceptance. |
| Perfect Day book request | `/perfect-day-lifestyle` → separate guide API → intended new book Zap | First name/email only; optional unchecked marketing consent; no phone/SMS. Preview GET reports disabled and POST returns 503. Configured Cloudflare handler can return a hosted Drive link after webhook acceptance; Gmail/request log/optional Mailchimp are separate downstream steps. | **Blocked:** book Zap, SOZO Gmail sending connection, sender/copy approval, request log/deduplication and real delivery tests. Existing connection task covers this work. Do not enable form or remove Coming soon until verified. |
| Direct call / email | `tel:` / `mailto:` links | Opens the visitor's own phone/mail client; it is not an automated website notification. | Device behavior and actual staff response are operational acceptance checks. A link cannot prove a phone call or email was answered. |

## Test evidence: what is established and what is not

### Previously confirmed by the user

- Controlled contact capture reached Quo; optional Mailchimp capture was reported successful; no texts when SMS permission was unchecked.
- A consented test received the initial message and original delayed follow-up.
- Replying stopped the original delayed follow-up; not replying allowed it.
- A daytime incoming reply received the five-minute fallback when unanswered.
- A manual staff reply arrived and prevented the automated fallback.
- A direct after-hours text selected the after-hours path and received the next-business-day acknowledgement.

These are historical controlled observations, not a claim that current account settings were re-read or that every marketing/booking scenario has passed.

### Safe verification in this task

- Source tracing of both assessment implementations, frontend consent state, Jane links and separate guide implementation.
- Automated tests use mocked upstream calls; no live webhook is called.
- Browser QA, if used, must not save records or send messages: intercept API requests and use synthetic responses only, or limit to navigation/validation.
- Read-only public link checks establish reachability only, not appointment availability, inbox placement or completed delivery.

### Not performed / not yet established

- No Zap run replay, account edits, live form submission, contact creation, subscription, real message, booking or patient record access.
- No independent inspection of Cloudflare variables, current Zap mappings, Mailchimp audience preferences, Quo staff assignments or Jane intake rules.
- No proof that Jane booking cancels the original delayed SMS. Previous evidence establishes suppression by incoming reply/additional outgoing activity, not a Jane booking event.
- No verified public live-mode readiness, durable delivery retry queue, distributed rate limit or exactly-once guarantee.

## Required acceptance matrix before launch

Use one agreed controlled recipient and an isolated approved test version. Obtain explicit permission for every real send/subscription. Do not use placeholder trigger phone numbers, bulk Test Run or blind replay after ambiguous delivery.

| Case | Expected result |
| --- | --- |
| Enquiry, both optional boxes unchecked | Quo enquiry/contact; no SMS or marketing enrollment; truthful receipt, no appointment reservation. |
| Enquiry, approved email marketing only | Correct Mailchimp audience/tag and opt-in handling; no SMS; no unintended emails. |
| Enquiry, approved SMS only | Initial SMS; no marketing enrollment; original follow-up follows reply/no-reply guard. |
| Both permissions selected | Independent approved actions, no duplication; verify only with explicit permission. |
| Existing / unsubscribed / repeated contact | Preserve independent consent and stable Quo matching; no accidental resubscription or duplicate contact. |
| Invalid/security failure / delivery disabled | Explicit failure, no forwarding, no false success; preserve visitor input and do not auto-retry ambiguous delivery. |
| Staffed reply: unanswered / manual response | Five-minute fallback only in unanswered case, not after a manual staff answer. |
| Website-started after-hours reply | Correct next-business-day acknowledgement without duplicates; no inappropriate later follow-up. |
| Jane booking + new-patient setup | Correct appointment, confirmation and secure intake path verified by authorized staff; separately decide whether booking should cancel follow-ups. |
| Book request, marketing false / true | Immediate hosted link and exactly one requested email; request logged; marketing independent, no assessment/SMS/Quo actions. |
| Book repeat / same-ID replay | New request can receive book again; replay of identical request ID does not send twice. |
| Book signed out / phone | Correct complete original PDF accessible and downloadable without Google login; actual phone download verified. |

## Responsibility and next steps

- Implementer: retain this audit and local verification evidence; correct website defects within approved scope.
- SOZO owner/staff: approve missing notification/intake requirements, sender/copy, service eligibility and monitoring ownership.
- Existing **Connect the approved enquiry and guide delivery flows before launch** task: implement/verify outstanding external connections after required approvals.
- Launch coordinator: secure owner approval, isolated acceptance-test access and final evidence before a separately authorized weekend cutover.

The older October handoff checklist and verification document describe an earlier archive. Their unchecked boxes and old counts are not current failure evidence. This audit and the new readiness review must accompany them.
