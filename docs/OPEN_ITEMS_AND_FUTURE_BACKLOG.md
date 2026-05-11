# OPEN ITEMS AND FUTURE BACKLOG — AmbiSecure site

**Owner:** AmbiSecure engineering
**Last updated:** 2026-05-11 (Phase 14 — SEO audit close-out + content governance)

Companion to [`MASTER_OPERATIONS_AND_MAINTENANCE.md`](MASTER_OPERATIONS_AND_MAINTENANCE.md).

This file is the **only** running backlog. Every item below is one of:
- **Future enhancement** — useful but not load-bearing yet.
- **Operationally deferred** — gated on an operational signal (analytics on, traffic threshold, etc.).
- **Architectural expansion** — would only matter at a future scale.

Each item carries:
- **Why deferred** — the actual reason it isn't done.
- **Complexity** — S / M / L.
- **Trigger** — the event that would unblock it.
- **Value** — what shipping it would unlock.

When an item ships, delete its row. When an item stops being relevant, delete it. Do not let this file grow unbounded.

---

## 1. Analytics depth (post-launch instrumentation)

| Item | Why deferred | Complexity | Trigger | Value |
|------|--------------|:----------:|---------|-------|
| Flip analytics provider on (Plausible-first) | No operator decision yet on hosted vs self-hosted Plausible | S | Operator decision | Site visibility |
| Surface Web Vitals dashboard in operator portal | Beacon ships in Phase 11; the dashboard depends on the provider | M | Provider on | Performance regression detection |
| Per-page conversion-event tagging (`Contact Click`, `Brochure Download`, `Case Study Read`) | Need real traffic to know which events matter | S | Provider on + 30 days of traffic | Funnel insight |
| Hook Web Vitals beacon into Plausible custom-event API | Wired in `analytics.js` `report()` — just needs provider to be on | XS | Provider on | RUM Web Vitals data |

---

## 2. Content depth

| Item | Why deferred | Complexity | Trigger | Value |
|------|--------------|:----------:|---------|-------|
| 4th and 5th anonymised case study (e.g. eSIM rollout, partner-led JavaCard programme) | Phase 10 shipped the first three; further studies need real engagement debriefs | M | Two new engagements complete and willing to be anonymised | Conversion authority |
| Customer-named case studies with logo permission | Today everything is anonymised | M | Customer sign-off + legal review | Authority + trust |
| Pricing tier publishing | Today `/engagement-models/` describes shapes, not prices | S | Procurement decision to publish | Reduces inbound qualification friction |
| Tech-talk video series | Existing video set is product walkthroughs, not technical deep-dives | L | Production budget + speaker availability | Brand authority on engineering blog topics |

---

## 3. Site-wide UX features

| Item | Why deferred | Complexity | Trigger | Value |
|------|--------------|:----------:|---------|-------|
| Blog-post pagination across the modern blog | Phase 11 ships the `/blog/page/2/` scaffold; real second-page content kicks in when modern entry count > 24 | S | 25th modern blog post merged | Discovery |
| Per-category pagination | Same threshold — no current category exceeds 24 entries | S | Single category > 24 entries | Discovery |
| In-page table-of-contents on long-form posts | Cornerstone posts are 15–20 min reads | S | Anyone asks; no signal today | Long-read UX |
| Dark mode | Brand palette is light-first | M | Operator decision | Aesthetic |
| Per-section search beyond the blog | Resources/tools are findable via navigation; references via navigation | M | A specific user complaint | Discovery |

---

## 4. Performance / front-end maintenance

| Item | Why deferred | Complexity | Trigger | Value |
|------|--------------|:----------:|---------|-------|
| CSS without `style-src 'unsafe-inline'` | Most inline styles already removed; a few hand-edited card grids use inline style for the date row | M | Security-review push | CSP tightening |
| Service worker / offline cache | Static site is already cacheable; SW is over-engineering today | M | Lighthouse asks for installability score | PWA installability |
| Brotli pre-compression on disk | LiteSpeed compresses on the fly | S | Move off LiteSpeed | Cold-cache TTFB |
| Per-route CSS splitting | Single 60 KB CSS is fine | M | CSS exceeds 200 KB | Initial paint |
| Per-blog-post OG cards (one per post, not per section) | Phase 12 ships 22 per-section OG cards via `tools/gen-og-batch.py`; per-post variants would push the OG image count to ~50+ | S | A post-share volume signal showing per-post OG matters | Sharper per-share social previews |

---

## 5. CI + automation

| Item | Why deferred | Complexity | Trigger | Value |
|------|--------------|:----------:|---------|-------|
| Lighthouse CI auto-blocking on regression | Phase 11 workflow is advisory (`continue-on-error: true`) | S | One real regression that the advisory CI catches | Performance guardrails |
| Automated WebP regeneration when a PNG > 200 KB is added | Today the `audit-media` check surfaces it; regeneration is still manual | S | Operator chooses to invest the script time | Reduces drift |
| Automated sitemap regeneration from on-disk page set | Sitemap is hand-curated; `audit-seo` catches drift but doesn't fix it | M | Sitemap entry count > 500 | Removes manual error class |
| Expand `.githooks/pre-commit` to also run `tools/audit-all.sh` | Phase 14 hook only runs `lint-htaccess` + `check-last-reviewed`; the full audit suite is too slow (~6s) to gate every commit | S | Audit suite drops below 2s, or a regression slips through | Catches everything before CI |
| `audit-freshness` operator-side reminder dashboard | Today it's a CI report; could be a one-page operator view | S | Engineering team wants a single "what to review" page | Drives quarterly content review |

---

## 6. Architectural expansion

| Item | Why deferred | Complexity | Trigger | Value |
|------|--------------|:----------:|---------|-------|
| `developer.ambimat.com` subdomain split | No current trigger; navigation isn't crowded yet | L | Resources/references surface exceeds ~100 tools each | Domain-of-concerns separation, faster mental model |
| External docs platform (Mintlify/Docusaurus) for the technologies section | Static HTML is fine at current scale | L | Tech docs grow to need search + versioning | Better docs UX |
| Multilingual content | Audience is English-first today | XL | India or Latam expansion brief | Regional reach |
| Public-API or developer portal | No public API yet | XL | Productisation of the validation server SaaS | Developer adoption |

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
