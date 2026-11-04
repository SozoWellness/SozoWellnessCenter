# SOZO Wellness Center

A patient-first website for SOZO Wellness Center in Wildwood, Florida, with service pages and an initial-assessment request form.

## Run & Operate

These are implementation references, not setup assignments for SOZO staff. The existing request API still depends on PostgreSQL; that dependency has not been removed by simplifying the handoff documents. Follow the separately supplied custom form/automation instructions to adapt the frontend, backend and deployment before launch. Do not silently ignore an API startup error or describe the custom flows as connected.

- `pnpm --filter @workspace/api-server run dev` — API service command; use its managed workflow (port 8080).
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — managed Postgres connection string
- Optional at launch: `VITE_SITE_URL` — override canonical page URLs if the intended domain changes; never set it to a development URL.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: Vite with prerendered public pages; esbuild ESM bundle for the API.

## Where things live

- `artifacts/sozo-wellness/` — public website and source content; `src/App.tsx` contains the current routes and page copy, `src/index.css` is the visual theme.
- `artifacts/api-server/` — assessment request submission API.
- `lib/api-spec/openapi.yaml` — API contract; `lib/db/src/schema/` — persisted requests.

## Architecture decisions

- Write health-related copy with confidence in the session experience, what visitors can expect, and their wellness goals. Avoid blanket "not a proven cure or treatment" style disclaimers on marketing pages; keep specific safety or availability information where it helps visitors make a decision. Do not invent efficacy, diagnosis, cures, guaranteed outcomes or unsupported certifications beyond the client's supplied DODPowerPack wording.
- The contact form persists requests but **does not email clinic staff**. Do not tell visitors that the clinic will automatically follow up until notifications and handling are confirmed.
- Nothing on this site should link visitors back to the old clinic website. Display clinic content locally; testimonials belong on the Testimonials page. The user approved light testimonial copyediting for spelling, capitalization, punctuation and readability. Preserve attribution, meaning and care-setting context; never relabel another facility as SOZO or add outcome claims.
- The user confirms SOZO offers Radial ESWT and CellSonic ESWT for deeper pain concerns. Do not describe CellSonic as a planned addition or unavailable.

## Product

- Homepage, service pages (Cardio MedBed is available now), clinic/about gallery, on-site patient testimonials, Articles & Resources, and assessment request form.

## User preferences

- Keep visual service discovery and assessment comparison easy to find, with contextual enquiry buttons that retain the chosen service. SOZO identifies as whole life wellness coaches providing “wellness from the root” across mental, emotional, physical and spiritual well-being. Make this identity clear throughout the site and connect it with SOZO's actual assessments, therapies and philosophy. Do not infer licensed counseling, psychotherapy, spiritual-treatment services or new staff credentials from that philosophy. Promote the future Perfect Day Guide as coming soon until the approved asset and delivery flow are available.
- SOZO has permission to use content from the sites referenced in the revision list. The user explicitly prefers adapting it into original, cohesive SOZO branding language rather than using it verbatim. Preserve the Whole Life Coach source's substantive consultation, not-broken-or-damaged, philosophy and process themes while avoiding unsupported medical mechanisms, guarantees or another clinic's staff details. This direction supersedes the original revision list's request for a verbatim migration.
- The user confirmed that the Privacy Policy should retain the supplied policy’s privacy contacts, separate from the main clinic contacts. Meta Pixel may be used in the future; this is not authorization to install it or describe it as currently active. Revised policy wording requires clinic approval before publication.
- Use confident, impactful, benefit-led service copy rather than defensive caveats in every paragraph. The user wants one visible, SOZO-specific U.S. catch-all disclaimer in the footer, not individual service disclaimers or inline disclaimer links. Preserve essential factual qualifications in treatment explanations; do not invent medical efficacy or promise Google rankings.
- Every service page must explain the actual service or assessment, why a patient would choose it, how it works and what to expect. Use the ESWT page as the model; generic relaxation or supportive-setting copy is not enough.
- Keep requested benefits visibly labeled on service pages. Engaging card titles must not hide the benefits section or replace benefits with session logistics.
- All public-facing copy must sound like SOZO speaking directly to visitors, using we/our/us where appropriate. Never use an outside reviewer’s voice such as “SOZO describes…” or commentary about what SOZO has published or verified. Be assertive about supported facts without inventing medical efficacy or equipment details. Preserve testimonial speakers’ meaning while allowing the approved light copyediting.
- “Book Your Assessment” is the primary site-wide call-to-action, including mobile. Keep the phone number highly visible and preserve service selections when visitors continue to the assessment request page. Do not imply an online request reserves an appointment; the current direct booking route is contacting the clinic.

- The audience includes many seniors in The Villages. Keep navigation and body copy comfortably legible (avoid tiny labels, low-contrast teal-on-cream text, and mobile-only hidden service descriptions). Keep the serif feel but use relaxed letter and line spacing in headings. Services should be discoverable from the desktop navigation dropdown and mobile menu.
- The requester will provide separate custom flows for forms and automations. The website ZIP may be handed over before those connections are implemented, but it is not launch approval. The receiving SOZO team is nontechnical: keep client-facing instructions simple and do not tell them they must create a database or run schema commands. **Why:** the requester owns the flow specification and explicitly clarified that technical setup should not be assigned to this team. Use the supplied flow instructions when available, and keep the current form limitations clear until implementation is verified.
- The replacement is intended to launch at `https://sozorootedwellness.com/`; confirm www/non-www redirects and old-page redirect mapping before cutover. Update canonical configuration, robots.txt and structured data together if the domain changes. Public routes are prerendered with page-specific metadata; keep the route list, sitemap and exact static rewrites synchronized, and preserve true 404 responses. Do not promise Google rankings or profile ratings.
- The client selected a one-time ZIP handoff to SOZO's own Replit account. See README.md and HANDOFF-CHECKLIST.md for the plain-language handoff. The implementer must reconcile the existing runtime dependencies with the supplied custom flows; do not turn the old form architecture into a mandatory client setup checklist.

## Gotchas

- Source logo and selected clinic photos were retrieved from the client's current site at their request; review final image rights/approvals with the clinic before publishing.
- The user approved the AI-generated Live Blood Analysis illustration after being told it is not a photo of SOZO's actual equipment. Preserve that distinction when describing or reusing the image.
- Never collect medical history or sensitive health information through the public assessment form.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
