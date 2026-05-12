# OPEN ITEMS AND FUTURE BACKLOG — AmbiSecure site

**Owner:** AmbiSecure engineering
**Last updated:** 2026-05-12 (Phase 19 — branding refinement, visual assets, tile/grid governance, standards timelines)

Companion to [`MASTER_OPERATIONS_AND_MAINTENANCE.md`](MASTER_OPERATIONS_AND_MAINTENANCE.md).

Every item below is **genuinely deferred** — it requires an external decision (business, legal, product, or operational data we don't have yet). Items that could be implemented without that gate have been built and removed from this file.

Each item carries:
- **Why deferred** — the actual reason it isn't done.
- **Decision owner** — who must approve / decide.
- **Trigger** — the event that unblocks it.
- **Next action** — what the operator does when the trigger fires.

When an item ships, delete its row. When an item stops being relevant, delete it. Do not let this file grow unbounded.

---

## 1. Analytics depth (post-launch instrumentation)

| Item | Why deferred | Decision owner | Trigger | Next action |
|------|--------------|----------------|---------|-------------|
| Flip analytics provider on (Plausible-first) | Operator must choose hosted vs self-hosted Plausible. Pricing + privacy posture decision. | Business / operator | Provider chosen | Edit `assets/js/analytics-config.js` `provider:` field; apply matching CSP delta in `.htaccess`. |
| Surface Web Vitals dashboard in operator portal | Provider must be on to feed it. | Operator | Provider on | Add Plausible / GA4 dashboard panel filtering on `vitals_*` custom events. |
| Per-page conversion-event tagging (Contact Click, Brochure Download, Case Study Read) | Tagging without traffic data is guessing. | Operator + product | Provider on + 30 days of traffic | Add `data-analytics-event` attributes to CTAs; wire to `AS_ANALYTICS.report()`. |
| Hook Web Vitals beacon into Plausible custom-event API | Beacon shape already wired in `analytics.js`. | Operator | Provider on | Set `provider: "plausible"`; vitals automatically flow through `report()`. |

---

## 2. Content depth

| Item | Why deferred | Decision owner | Trigger | Next action |
|------|--------------|----------------|---------|-------------|
| 4th and 5th anonymised case study (eSIM rollout, partner-led JavaCard programme, ePassport) | Three exist already; further studies need real engagement debriefs we can anonymise honestly. Fabricating them is off the table. | Engineering + customer success | Two new engagements complete + willing to be anonymised | Author `/case-studies/<slug>/` following the existing template; link from `/case-studies/index.html` and the homepage commercial strip. |
| Customer-named case studies with logo permission | Everything is anonymised today. Named studies need customer + legal sign-off. | Customer + legal | Customer sign-off + AmbiSecure legal review | Author the page; add logo asset to `/assets/img/customers/`; cite specific metrics with the customer's written approval. |
| Pricing tier publishing | `/engagement-models/` describes engagement shapes but not prices. | Procurement / leadership | Procurement decision to publish public pricing | Add pricing rows to `/engagement-models/`; add structured `Offer` data to existing JSON-LD; update the contact-form qualification copy. |
| Tech-talk video series | Existing video set is product walkthroughs, not technical deep-dives. | Marketing + engineering | Production budget + speaker availability | Record per talk; transcode to YouTube; add `/videos/<slug>/` pages using the existing YT-facade template. |

---

## 3. Site-wide UX features

| Item | Why deferred | Decision owner | Trigger | Next action |
|------|--------------|----------------|---------|-------------|
| Per-category pagination | No category currently exceeds 24 entries. | Operator (data-driven) | A single category passes 24 entries (today's largest is FIDO at 13). | Apply the same `/blog/page/N/` pattern to `/blog/categories/<cat>/page/N/`. |
| In-page table-of-contents on long-form posts | Cornerstone posts are 13–20 min reads but no user signal yet that TOC is missing. | Operator | A reader feedback signal or an analytics signal that the long posts have a high drop rate after 30%. | Add a small `assets/js/blog-toc.js` that scans H2/H3 in `<main>` and renders a fixed-position TOC on viewports >= 1100px. |
| Dark mode | Brand palette is light-first by design. | Operator / brand | Operator decision to invest in a dual palette. | Add `prefers-color-scheme` CSS variables + a manual toggle to nav. |
| Per-section search beyond the blog | Resources/tools/references are reachable via navigation. | Operator | A specific user complaint or a drop in tool-page traffic. | Extend `assets/js/blog-search.js` index format to cover resources/references; expose at `/search/?scope=...`. |

---

## 4. Performance / front-end maintenance

| Item | Why deferred | Decision owner | Trigger | Next action |
|------|--------------|----------------|---------|-------------|
| Remove `style-src 'unsafe-inline'` from CSP | Some hand-edited card grids still use inline `style=` for the date row. Removing requires a sweep + class extraction. | Engineering | Security review push, or a CSP audit failure | Convert remaining inline styles to utility classes in `assets/css/main.css`; drop `'unsafe-inline'` from CSP in `.htaccess` and per-page meta. |
| Tighten CSP: remove unused Google Fonts whitelist | CSP currently allows `fonts.googleapis.com` and `fonts.gstatic.com` though the site is fully self-hosted. Defensive but unused — security hygiene says drop it. | Engineering | Security audit | Remove the `fonts.googleapis.com` / `fonts.gstatic.com` allow-list from the CSP `style-src` / `font-src` directives in `.htaccess`. |
| Service worker / offline cache | Static site already caches well via LiteSpeed + browser. SW adds installability but is over-engineering at current scale. | Operator | Lighthouse PWA-installability becomes a requirement | Add `service-worker.js` + manifest; cache the asset shell; do not cache the HTML pages (sitemap drift problem). |
| Brotli pre-compression on disk | LiteSpeed compresses on the fly. Pre-compression matters only on cold cache + slower origins. | Operator | Move off LiteSpeed | `find . -name '*.html' -o -name '*.css' -o -name '*.js' \| xargs -I {} brotli -k {}` as part of the package build. |
| Per-route CSS splitting | Single 60 KB CSS is well under the budget. | Engineering | `main.css` exceeds 200 KB | Split per top-level section; lazy-load via media queries / link rel preload. |
| Per-blog-post OG cards | Phase 16 added 7 per-product OG cards; per-blog cards would push the OG-image count to ~80+. Section OGs are sharp enough today. | Operator | A signal that per-post social shares matter (e.g. analytics shows a single post driving 50%+ of LinkedIn traffic). | Extend `tools/og-templates.json` with per-blog match prefixes; re-run `gen-og-batch.py --wire`. |

---

## 5. CI + automation

| Item | Why deferred | Decision owner | Trigger | Next action |
|------|--------------|----------------|---------|-------------|
| Expand `.githooks/pre-commit` to also run `tools/audit-all.sh` | Audit suite is ~6s — too slow to gate every commit. | Engineering | Audit suite drops below 2s, OR a regression slips through to CI that the hook would catch. | Append `bash tools/audit-all.sh` to `.githooks/pre-commit`. |
| `audit-freshness` operator-side reminder dashboard (single HTML page that summarises stale blogs) | Today the freshness report is CI-only. A one-page operator view would drive quarterly review better. | Operator | Engineering team explicitly asks for a single "what to review" surface. | Add `tools/render-freshness-page.py` that emits `/_internal/freshness.html`; gate behind `.htaccess` if it should be operator-only. |

---

## 6. Architectural expansion

| Item | Why deferred | Decision owner | Trigger | Next action |
|------|--------------|----------------|---------|-------------|
| `developer.ambimat.com` subdomain split | Navigation isn't crowded yet; resources/references combined are 66 surfaces. Split adds DNS, CSP, sitemap work for no current user benefit. | Architecture / operator | Resources OR references exceeds ~100 surfaces each. | Carve out `/resources/` + `/references/` into a sister origin; rewrite cross-origin links to absolute URLs; add a `sitemapindex` referencing both per-origin sitemaps. |
| External docs platform (Mintlify / Docusaurus) for `/technologies/` | Static HTML is fine at current scale. Adds a build system and a deploy target for marginal docs UX gain today. | Architecture / operator | Tech docs grow to need search + versioning (more than ~30 distinct technology surfaces). | Decide on platform; migrate `/technologies/` content; set up redirects from old paths. |
| Multilingual content | English-first audience today. Localisation cost is high (translation + dual asset trees). | Business / operator | Operator decides to expand into a non-English-primary market. | Add `lang` query param or per-language subpath; provide translations for the homepage + top 10 product pages first; extend later. |
| Public-API / self-serve developer portal for the FIDO Validation Server | Phase 16 documented the four-step **enterprise** onboarding. A self-serve sandbox needs productisation: sign-up flow, rate limiting, abuse prevention, billing pipeline. | Product / business | Productisation decision to open up self-serve sandbox + API key issuance. | Stand up `developer.ambisecure.ambimat.com`; add sign-up UI; integrate billing; document the sandbox-tenant policy. |
| `fido.ambisecure.ambimat.com` live deployment | Phase 19 wired the "Request demo" CTA to this URL on the assumption operator will stand up the FIDO Validation Server runtime there. The DNS, TLS cert, and deployment posture (operator-hosted vs hosted SaaS, see §9b in MASTER_OPS) are not yet in place. | Operator + ops | Operator decides on hosting shape (hosted SaaS vs operator-hosted) and stands up the runtime. | Provision DNS (A or CNAME) for `fido.ambisecure.ambimat.com`; issue TLS via Hostinger / Let's Encrypt; deploy validation-server container; confirm no source-tree or admin paths are publicly reachable; smoke-test the demo flow. |

---

## 7. Closed / explicitly-not-doing

Recorded here to prevent re-litigation. Each item was considered and rejected; the reason is the gate.

| Item | Why not |
|------|---------|
| Algolia or other hosted search SaaS | Phase 11 client-side search is sufficient; no need for an external dep + cost |
| `lunr` or `flexsearch` JS dependency | Same — the precomputed token index is small and fast enough |
| Generating PDFs of brochures | Print-to-PDF from the browser works; binary PDFs would bloat the repo |
| Customer logo wall on homepage | No permission-cleared logo set; would be fabrication |
| Customer-named metrics ("reduced phishing by 92%") | No real measurements to back numbers |
| Cookie banner | No advertising cookies, no marketing cookies. Banner would be noise |
| Server-side rendering / Next.js / framework migration | Static is the right answer at this scale |
| Real-time chat widget | Engineering is the first call; a BDR-chat surface defeats the brand |
| Self-hosted Plausible | If operator wants to avoid the hosted plan, the Plausible Docker image works fine on the existing Hostinger VPS plan |

---

## 8. Triage cadence

This document is reviewed:

- After every shipped phase (operator's choice to delete done rows).
- Every quarter as part of the maintenance checklist in `MASTER_OPERATIONS_AND_MAINTENANCE.md` §15.
- Any time a user-facing complaint surfaces — verify whether a backlog item maps to it.

Keep this file under 200 lines. If it grows past that, items are being added that should have been declined.
