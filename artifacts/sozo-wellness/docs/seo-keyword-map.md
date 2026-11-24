# SOZO Google and local-search foundation

## Scope and evidence

This is a page-targeting map, not a keyword-volume study, a rank report or proof of Google indexing.
Public web search returned SOZO's current home page and older `/therapies/` addresses alongside local hyperbaric providers, including Aviv Clinics and OxyPeak. This confirms relevant topics and a migration issue, not a particular Google position.

Read-only checks of the live site found:
- The home page, services listing and sampled therapy pages return content in HTML without waiting for JavaScript.
- Real robots.txt and sitemap.xml files are accessible. The live sitemap contained 40 indexable page URLs.
- `/therapies/`, `/therapies/hyperbaric-oxygen-therapy/` and `/hyperbaric-oxygen-therapy-a-comprehensive-guide/` returned 404.
- Cloudflare redirects no-slash service URLs to slash URLs, but the old canonical tags and sitemap used no-slash URLs.
- An unrelated invented URL correctly returned a real 404. Preserve that behavior.

Changes are prepared in preview. Cloudflare permanent redirects only take effect after publication; Vite preview does not execute `_redirects`.

## Priority page map

Use one relevant page per search intent, not duplicate pages for every nearby town.
The physical address remains **5029 Co Rd 159, Wildwood, FL 34785**.
Use **near The Villages** or **serving The Villages**, not an address claiming a different city.

| Current page | Primary intent | Supporting phrases and boundaries |
| --- | --- | --- |
| `/` | wellness center near The Villages, FL | Whole-person wellness, Wildwood wellness center; preserve mental, emotional, physical and spiritual philosophy without implying licensed counseling |
| `/about/` | SOZO Wellness Center team | Named team members and actual qualifications; clinic location and approach |
| `/services/` | wellness services near The Villages | Link to each available service, not a list of conditions purportedly treated |
| `/services/assessments/` | wellness assessments near The Villages | Vitalyzer, NeuralChek, HRV, live blood microscopy; keep the distinct assessment methods clear |
| `/services/hyperbaric-oxygen/` | hyperbaric oxygen therapy near The Villages | HBOT, hyperbaric chamber, session experience and suitability; do not equate every research protocol with SOZO's offering |
| `/services/shockwave/` | shockwave therapy near The Villages | Radial ESWT, CellSonic, mobility and comfort; maintain evidence qualifications |
| `/services/rife/` | Rife frequency therapy near The Villages | Guided mat-based sessions, complementary wellness, evidence limitations |
| `/services/therawellness/` | TheraWellness near The Villages | Relaxation, personal balance, what to expect |
| `/services/cardio-medbed/` | Cardio MedBed EECP near The Villages | External counterpulsation and circulatory wellness; available, not coming soon |
| `/services/red-light-therapy/` | red light therapy near The Villages | Pulse Light is the same SOZO service, not a duplicate page |
| `/services/core-restore/` | pelvic floor chair near The Villages | Core Restore, pelvic floor support for women and men; available now; no guaranteed bladder or sexual results |
| `/services/ozone-therapy/` | ozone therapy near The Villages | Rectal and ear insufflation, ozonated water; preserve safety and evidence limits, not disease cures or dosage instructions |
| `/services/foot-detox/` | foot detox near The Villages | AO Infinity and the session experience, not proof of systemic detoxification |
| `/services/wolfe-non-surgical-bodywork/` | Wolfe non-surgical bodywork near The Villages | Hands-on bodywork, flexibility and comfortable movement |
| `/services/whole-life-coaching/` | whole life wellness coaching near The Villages | Whole-person guidance, not mental-health treatment |
| `/chiropractic-care/` | chiropractic care near The Villages | Actual chiropractors and qualifications; do not make SOZO the treating physician in schema |
| `/services/packages/` | wellness credit packages near The Villages | Current Freedom and Pain packages; credits are not guaranteed session counts; no unapproved prices or terms |
| `/independent-physicians/` | Kevin Stasney, MD / Years Younger MD | EBOO, PRP and other services belong to the independent practice, not SOZO-operated therapy pages |
| `/products-and-partners/` | SOZO wellness products and partners | Preserve partner names, referral links and affiliate disclosure; not all products are clinic services |
| `/blog/` and `/research/.../` | Specific educational questions | Link to relevant services; use actual authors and sources, never invented reviewers or guarantees |
| `/perfect-day-lifestyle/` | Perfect Day Lifestyle guide | The guide already has a page and signup; the supplied list's “future lead magnet” description is outdated |

## Technical safeguards prepared

- Exact 301 redirects for 12 legacy addresses, including both slash variants. No broad redirect of all missing pages to home.
- Canonical tags, social URLs and sitemap entries agree on directory-style URLs.
- A connected business, website and page graph; service markup for SOZO's own named services and breadcrumbs.
- No invented opening hours, geographic coordinates, ratings, provider qualifications or review scores.
- Campaign and resource-review pages stay noindex and out of the sitemap.
- Unique page metadata and readable pre-rendered content remain required by automated checks.

## Google account work still to verify

1. **Search Console:** confirm ownership of the final domain; submit `https://sozorootedwellness.com/sitemap.xml` after publication; inspect the home page and priority service pages. Review indexing, migration errors and actual search queries.
2. **Business Profile:** verify the existing listing; confirm business name, category, Wildwood address, phone, hours, website link and appointment link. Add Core Restore and Ozone accurately; no medical guarantees.
3. **Local reputation:** request genuine reviews consistently without incentives or selective review gating; respond thoughtfully. Keep business details consistent in relevant directories.
4. **Measurement:** compare queries, impressions, clicks and qualified enquiries over time. Do not claim immediate ranking improvements or a guaranteed top-three Maps position.
5. **Performance:** run Google's PageSpeed Insights on the published changes and check real-user Core Web Vitals in Search Console when data is available. A passing build is not a page-speed score.
6. **Content trust:** have the responsible clinical reviewer check disease-specific legacy articles and supporting evidence. Adding schema does not validate medical claims.

Google account access and ownership have not been verified in this work. No account settings have been changed.

## References

- [Google: permanent redirects](https://developers.google.com/search/docs/crawling-indexing/301-redirects)
- [Google: local-business structured data](https://developers.google.com/search/docs/appearance/structured-data/local-business)
- [Google: local ranking factors](https://support.google.com/business/answer/7091?hl=en)
