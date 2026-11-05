# SOZO owner review and launch readiness

Review date: November 5, 2026.

**Status: Preview updates and review deliverables prepared. Not approved for public launch. The existing live website remains untouched.**

## Completed in this review

- [x] Audited the eight requested journey categories and documented destinations, known behavior, missing connections and evidence limits.
- [x] Replaced the old 10/20/35-credit package lineup with the owner-approved session packages.
- [x] Added Pain Package: 5 sessions for $400.
- [x] Added Freedom packages: 6/$600, 12/$1,000, 22/$1,800 and 36/$2,800.
- [x] Retained the approved existing $5,000 Circulation & Vitality Program.
- [x] Removed old public credit-equivalence and cost-per-credit claims rather than inventing rules for the new session packages.
- [x] Checked source and all built page HTML for obsolete/internal package names; no public Warrior, Half Warrior, Signature membership, handwritten holiday offer or old Pain Solutions A/B/C references were found.
- [x] Retained the ten example pathways and service directory, with clear wording that the directory does not establish package inclusions.
- [x] Preserved provider separation, team links, physician topics, Articles & Resources, approved coaching content and latest homepage wording.
- [x] Reviewed Energy Therapy, Optimum Therapy, scalar/frequency terminology and earlier Bioptron request; documented questions rather than inventing or deleting offerings.
- [x] Reviewed the book page, supplied original PDF and hosted sharing link; kept the request form disabled until delivery is connected.
- [x] Produced a resource inventory, exact-duplicate analysis and proposed folder structure; no files moved or deleted.
- [x] Corrected an outdated verification script to reflect already-approved Jane booking links and current submission wording.
- [x] Corrected stale form setup documentation that still called the original follow-up unconditional; user-confirmed reply suppression is now distinguished from unverified Jane-booking cancellation.

## Verification evidence

| Check | Result and boundary |
| --- | --- |
| Frontend TypeScript | Passed. |
| Preview API TypeScript | Passed; no server behavior changed. |
| Cloudflare Functions TypeScript | Passed. |
| Production web build | Passed; 36 prerendered public routes. Built locally only, not deployed. |
| Automated test suite | 74 passed, zero failed. Includes mocked assessment/guide security and delivery cases; no live sends. |
| Search metadata, sitemap, routes and rewrite alignment | Passed for all 36 routes, with true-404 configuration/output checks. Not a new test of the live host's HTTP behavior. |
| Conversion checks | Passed across 36 pages: booking/phone links, four pathways, three assessment selections, five testimonial entries and separate provider destinations. |
| Coaching checks | Passed: adapted copy, seven actual therapy destinations, discovery links, Jane/enquiry links and all four wellness dimensions. |
| Built HTML local link/asset/fragment audit | 37 HTML files including 404; 984 local anchor links, 357 asset references, 43 fragments, 48 distinct referenced images. No missing local targets found. |
| Image accessibility source check | All built images have alt attributes; two redundant provider thumbnails intentionally use empty alt next to visible names. This is not a comprehensive accessibility audit. |
| Desktop/mobile Packages screenshots | Inspected at 1440 px and 390 px widths; readable package layout and wrapping, no visible clipping in captured areas. Static screenshots do not exercise menus or every lower-page interaction. |
| Workflow and browser output after restart | Web workflow running; captures showed no browser errors. Earlier hot-update noise during the batch was followed by successful updates/restart. API root GET 404 is normal: routes are under `/api`, not `/`. |
| Jane and book viewer signed-out public GET | Both returned 200 with expected titles. No appointment made; no full PDF/phone-download acceptance claim. |
| External-link inventory | 34 unique public destinations checked, including the hosted book viewer. 28 returned 2xx; six required manual review. No 404/410 was observed. This does not verify partner eligibility, affiliate credit, content accuracy or completed bookings. |
| Resource inventory | 82 uploads plus 62 public files; zero exact duplicate groups across those locations. No standalone QR asset identified by filename. |

Existing nonblocking build warnings remain: source-map reporting for two UI modules and a bundle-size advisory. These did not prevent a successful build; no broad framework change was made.

Reproduction:

```text
pnpm --filter @workspace/sozo-wellness run typecheck
pnpm --filter @workspace/api-server run typecheck
pnpm exec tsc -p functions/tsconfig.json
PORT=4173 BASE_PATH=/ pnpm --filter @workspace/sozo-wellness run build
node --test artifacts/sozo-wellness/scripts/*.test.mjs
node artifacts/sozo-wellness/scripts/check-conversion-pages.mjs
node artifacts/sozo-wellness/scripts/check-coaching-pages.mjs
node artifacts/sozo-wellness/scripts/check-owner-review.mjs
```

The owner-review audit generates ignored evidence under `generated-artifacts/owner-review/`. External-link responses are a dated observation, not a recurring delivery monitor.

## External links requiring manual review

These returned access restrictions, rate limits or other method restrictions during read-only checks. Do not remove them on that basis alone:

| Destination | Response | Recommended check |
| --- | --- | --- |
| Oxford Academic EECP reference | 403 | Open the article in a normal browser and verify citation/destination. |
| ASEA partner link | 429 | Check later without repeated automated requests; confirm affiliate destination. |
| CDA-AMC live blood analysis PDF | 403 | Open/download in browser; confirm intended resource is accessible to visitors. |
| JACC EECP reference | 403 | Verify full DOI destination and whether abstract/access information is usable. |
| National Institute on Aging brain-health resource | 405 | Open in browser; do not mistake server filtering for a confirmed missing page. |
| ScienceDirect EECP reference | 403 | Verify intended article/abstract destination in browser. |

## Outstanding owner decisions

- [ ] Approve the revised Packages page's wording and presentation.
- [ ] Confirm eligible treatments and terms for each session package, especially Pain Package.
- [ ] Confirm whether credits remain relevant and any expiration, sharing or redemption exceptions; no internal sheet rules are public.
- [ ] Clarify Energy Therapy, Optimum Therapy, scalar-wave equipment and Bioptron availability using the service review.
- [ ] Review other uncertain service/product listings without deleting them automatically.
- [ ] Confirm secure new-patient intake/setup through Jane or staff, including who sends it.
- [ ] Confirm whether enquiry acknowledgement emails and staff email alerts are required, with approved recipients/senders and wording.
- [ ] Approve book sender/email copy, optional marketing behavior and resource organization plan.
- [ ] Approve clinic claims, independent-practice attribution, photos, testimonials and final privacy/disclosure text against the actual live flows.

## Launch blockers

| Blocker | Next action / owner |
| --- | --- |
| Latest revised site has not received owner acceptance | Owner reviews Preview; launch coordinator records approval before any push/deployment. |
| Final updated-form external acceptance is incomplete | Implementer and authorized staff agree an isolated test environment and recipients; use the workflow audit matrix. Do not replace the live site solely for testing. |
| Website-started after-hours sequence is not verified | Controlled enquiry → initial SMS → visitor reply after hours; confirm no duplicate acknowledgement or inappropriate follow-up. Direct incoming-text test alone is insufficient. |
| Book signup/delivery is disabled and external connection is unfinished | Existing connection task: Gmail, separate Zap, request log, duplicate protection, independent Mailchimp branch and real recipient/download tests. |
| Secure intake and required email notification expectations are unconfirmed | Clinic identifies actual intended paths; connection task addresses confirmed missing requirements rather than silently assuming them. |
| Package terms and service terminology are unresolved | Staff supply approved facts; implementer updates only confirmed material. |
| Public abuse protection and operational monitoring need sign-off | Review actual hosting controls, consent gates, failure handling, staff assignments and restricted-to-public activation steps. Per-process rate limits are not distributed protection. |
| Final device and external-account acceptance remains | Verify interactive desktop/mobile menus, chosen booking/intake paths, actual phone handlers, download/QR scans and inbox/subscriber outcomes in the approved environment. No broad live browser submission was run here. |
| Weekend launch/cutover is not authorized | Prepare backups, exact old-page redirects, www/non-www behavior, email-preserving DNS plan and rollback before separately approved maintenance window. |

## Suggested launch sequence — not executed

1. Resolve the owner decisions and external connections; retain the old site.
2. Agree an isolated final review version and approved test recipients. Do not assume Preview saves exercise Cloudflare automations.
3. Finish the consent/delivery/booking/book acceptance matrix and owner sign-off.
4. Back up current site and DNS; record redirects, email records, activation settings, responsible staff and rollback criteria.
5. During a separately approved weekend maintenance window, deploy/cut over using the existing approved hosting process.
6. Verify secure domain, redirects, key pages, forms, delivery, email continuity and monitoring. Keep old hosting available until verified.

No GitHub push, public deployment, DNS change, automation edit, asset deletion, message, subscription or appointment was performed by this task.

## Companion reports

- `WEBSITE-WORKFLOW-AUDIT.md`: journey inventory, historical evidence and acceptance matrix.
- `WEBSITE-SERVICE-REVIEW.md`: requested service coverage, review candidates and book-flow gaps.
- `RESOURCE-ORGANIZATION-PLAN.md`: inventory findings and proposed organization.
- `PERFECT-DAY-DELIVERY.md`: separate book-delivery setup instructions.

This is a completed review/update task with documented launch blockers, **not a statement that the website is ready to go live**.
