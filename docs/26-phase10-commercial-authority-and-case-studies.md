# 26. Phase 10 — Commercial Authority, Case Studies, Cornerstone Content & Conversion Layer

**Date:** 2026-05-11
**Status:** Implemented and validated. All Phase 10 backlog items from docs/22 §3 are now closed.

Phase 10 is the commercial-authority pass. It does not redesign any earlier surface. It adds the surfaces that turn a credible engineering platform into a deployable one — anonymised case studies, cornerstone blog posts, printable platform overviews, and a single engagement-models page. It also resolves the last three legacy editorial slugs.

The editorial rule for every new surface: realistic and architecture-led, no fabricated customer names, no fabricated metrics, no fabricated certifications.

---

## 1. Scope summary

| Surface | Files added | Notes |
|---------|------------:|-------|
| Case studies | 4 | 1 landing + 3 anonymised studies. |
| Cornerstone blogs | 6 | 2.5k–4k words each. |
| Modernised legacy-slug blogs | 3 | Resolves the 3 `.htaccess` 301s that previously fell through to `/blog/`. |
| Brochures | 7 | 1 landing + 6 platform overviews. Printable HTML with `@media print` rules. |
| Engagement models | 1 | Replaces the absent "pricing" page; engagement shapes instead of price tiers. |
| Missing technology page | 1 | `/technologies/secure-elements/` (referenced everywhere; was an empty dir). |
| Updated existing | 6 | `index.html`, `blog/index.html`, `sitemap.xml`, `assets/css/main.css`, `assets/js/blog-pool.js`, `assets/js/highlight-banner-config.js`. |
| Documentation | 2 | This doc + updates to docs/22. |

Total: 22 new HTML pages + 6 modified surfaces + 2 docs.

---

## 2. Case studies

Three anonymised case studies at `/case-studies/`. Each is written like an engineering retrospective rather than a marketing slide — challenge, architecture, constraints, trust model, implementation, integration flow, lessons learned, related products / blogs.

| Slug | Theme | Hardware |
|------|-------|----------|
| `passwordless-workforce/` | 9,000-seat FIDO2 rollout across Okta + Microsoft Entra ID + a legacy CAS portal | OnePass Card, OnePass USB Key, FIDO Validation Server |
| `transit-ticketing/` | Closed-loop DESFire EV2 across 700+ validators with SAM-backed offline trust | DESFire EV2, SAM, validator fleet |
| `secure-device-identity/` | Hardware-rooted device identity for a fleet-class IoT manufacturer | IoT Security Chipset, issuing CA, EST rotation |

Editorial rules (applied to all three):

- **No customer names.** Anyone asking for references is offered a direct NDA call.
- **No fabricated metrics.** Numbers are either architectural targets (sub-300 ms tap latency, AAL3 enforcement) or design-time figures (fleet size, validator count, applet count). No post-deployment efficacy numbers.
- **No fabricated logos or compliance claims.** Certifications named are component-level certifications, not customer-side compliance posture.
- **Architecture-led.** The story is the design constraint and the solution. Every case study cross-links to the products, services, blogs, and reference tools it draws on.

---

## 3. Cornerstone blog posts

Six new long-form blog posts. Each cross-links into the existing blog cluster and is referenced from the relevant case study and brochure. Word counts are 2,500–4,000.

| Slug | Title | Read time |
|------|-------|-----------|
| `smart-cards-vs-fido-tokens-vs-passkeys/` | How to Choose Between Smart Cards, FIDO Tokens and Passkeys | 18 min |
| `secure-element-vs-tpm-vs-hsm/` | Secure Element vs TPM vs HSM — Where Each Fits | 16 min |
| `credential-lifecycle-management/` | Designing Secure Credential Lifecycle Management | 17 min |
| `transit-validators-offline-trust-architecture/` | Why Transit Validators Need Offline Trust Architecture | 15 min |
| `javacard-applet-development-enterprise-identity/` | JavaCard Applet Development for Enterprise Identity | 19 min |
| `pki-credential-issuance-workforce-government/` | PKI Credential Issuance for Workforce and Government Identity | 18 min |

Each post carries:

- `Article` JSON-LD with author, publisher, dates, keywords.
- Breadcrumb JSON-LD.
- OG + Twitter card meta.
- Structured headings (H1, H2 with `id` anchors).
- Internal links to related products, services, technologies, tools, case studies, and other blog posts.
- A consistent CTA block linking to `/contact/` and `/engagement-models/`.

The six posts are wired into `assets/js/blog-pool.js` (homepage daily spotlight) and `blog/index.html` (the blog landing).

---

## 4. Modernised legacy-slug blogs

Three legacy 301 redirects in `.htaccess` previously pointed at slugs that did not exist:

| Legacy slug | Redirect target | Phase 10 disposition |
|-------------|-----------------|----------------------|
| `/cyber-security-threats` | `/blog/cyber-security-threats-overview/` | Modern post written: clear-eyed 2026 threat overview. |
| `/learn/ambisecure-fido-supported-services` | `/blog/fido-supported-services/` | Modern post written: current FIDO platform coverage. |
| `/learn/how-it-work` | `/blog/how-fido-authentication-works/` | Modern post written: explainer-level FIDO mechanics. |

Decision: modernise rather than collapse to `/blog/`. All three slugs have plausible long-tail SEO value (threat overviews, "where does my key work?" queries, FIDO explainers) and the content fits naturally alongside the cornerstone cluster.

---

## 5. Brochure system

Static printable HTML pages, one per platform, plus a landing. Design intent: dense, scannable, no lead-capture wall, print-to-PDF friendly.

| Slug | Topic |
|------|-------|
| `brochures/` | Landing — six brochure cards |
| `brochures/onepass/` | OnePass platform overview |
| `brochures/fido/` | FIDO deployment overview |
| `brochures/transit-security/` | DESFire + SAM transit overview |
| `brochures/javacard/` | Multi-applet JavaCard platform overview |
| `brochures/pki/` | PKI + credential-lifecycle overview |
| `brochures/device-identity/` | IoT device-identity overview |

Implementation:

- **No PDF binary.** The user prints to PDF from the browser. Avoids version-control bloat, makes future edits a one-pager change.
- **`@media print` rules** in `assets/css/main.css` hide nav, ecosystem bar, footer, and the print button; replace inline links with their full URL in print; and tighten margins / typography for an A4-friendly print.
- **`.brochure-page` markup** keeps the head + dek + sections visually distinct from the rest of the site without being a separate template engine.

The brochure pages also serve as standalone web pages — readable on screen, indexable by search, share-friendly.

---

## 6. Engagement-models page

`/engagement-models/` replaces the absent "pricing" page. There is no published price grid because the engagements we run are scoped to the problem, not to a tier. The page describes six engagement shapes:

1. Architecture review (2–4 weeks, fixed scope).
2. Pilot deployment (8–12 weeks, co-delivered).
3. Enterprise rollout support (multi-quarter, co-delivered).
4. Integration consulting (4–8 weeks, fixed scope).
5. Secure manufacturing consultation (6–10 weeks, fixed scope).
6. Custom JavaCard development (8–16 weeks, co-delivered).

Plus a table mapping common procurement questions to the right engagement shape, and a "what we don't do" section that names pure resale, open-ended retainers, and compliance theatre as out-of-scope.

---

## 7. Conversion-pathway hardening

Pre-existing pages were lightly touched to wire the new commercial surfaces into the discovery flow:

| Page | Change |
|------|--------|
| `index.html` | New "Three places to go next" section between "Where AmbiSecure fits" and the closing callout (cards: Case studies, Brochures, Engagement models). Footer column renamed "Engage" with links to Engagement, Case studies, Brochures, Services, Videos. |
| `index.html` (solutions row) | Pre-existing card row pointed at 5 non-existent solution slugs (IoT Root of Trust, Secure Provisioning, Digital Identity, Payment Security, Secure Firmware Update). Re-targeted to existing canonical solutions (Secure-element integration, Smart-card personalisation, Government identity, Closed-loop ticketing, Secure validator platforms). |
| `index.html` (pillar card) | The "Secure Elements" pillar pointed at `/technologies/secure-elements/`, which existed as an empty directory. A real page was written (see §8). |
| `blog/index.html` | 9 new blog cards inserted into the "Latest engineering" grid. |
| `assets/js/blog-pool.js` | 9 new entries appended (6 cornerstone + 3 legacy-modernised), bringing the homepage daily spotlight pool from 36 → 45. |
| `assets/js/highlight-banner-config.js` | New `case-studies-launch-2026` banner entry promoted to the top of the rotation. |
| `sitemap.xml` | 22 new URLs added (220 → 242). |

The CTA hierarchy on every new page is identical: a primary "Talk to engineering" / "Start a conversation" CTA into `/contact/`, plus a secondary "Engagement models" CTA into `/engagement-models/`.

---

## 8. `/technologies/secure-elements/` (gap closure)

This slug was referenced from `index.html`, from the case studies, from blogs, and from brochures. The directory existed but had no `index.html`. A real technology overview page was written, covering:

- What a secure element is (and is not).
- How it differs from TPM and HSM (compressed comparison table; links to the new SE-vs-TPM-vs-HSM cornerstone).
- Where AmbiSecure uses secure elements (six product / solution cross-links).
- Engineering ground rules (on-chip keygen, attestation, side-channel-hardened crypto, SCP02/SCP03 personalisation).
- Related blogs, case studies, brochures.

Sitemap updated.

---

## 9. SEO hygiene

| Check | Status |
|-------|--------|
| Every new page has unique `<title>` | ✓ |
| Every new page has a unique `meta description` | ✓ |
| Every new page has a canonical URL | ✓ |
| Every new page has OG + Twitter card meta | ✓ |
| Every new page has BreadcrumbList JSON-LD | ✓ |
| Every new blog has Article JSON-LD | ✓ |
| Every new case study has Article JSON-LD | ✓ |
| Every new brochure has CreativeWork JSON-LD | ✓ |
| Sitemap XML re-validates | ✓ (`xmllint --noout`) |
| Internal hrefs across new pages resolve | ✓ (validated via `/tmp/phase10/check_hrefs.py`) |
| JSON-LD on new pages parses cleanly | ✓ (validated via `/tmp/phase10/check_jsonld.py`) |

---

## 10. Editorial discipline — what was *not* done

| Decision | Why |
|----------|-----|
| Customer names left out of case studies | The customers we work with would prefer NDA; anonymised architecture is more useful to the reader anyway. |
| No fabricated efficacy metrics ("reduced phishing by 92%") | The numbers we have are architectural targets and design-time fleet sizes; we did not invent the rest. |
| No customer logo wall | We don&rsquo;t have a permission-cleared logo set we could put up honestly. |
| No PDF brochures | A print-friendly HTML brochure is lighter to maintain than a PDF binary, and equally usable when printed. PDF generation would only matter if a customer specifically asks. |
| No published price grid | Volume / scope vary too widely; engagement shapes are more useful. |
| No "Compare authentication approaches" tool widget | The cornerstone comparison blog covers this without inventing a tool that would need maintenance. |
| No new analytics or instrumentation surfaces | Phase 11 territory. |

---

## 11. QA performed

- `xmllint --noout sitemap.xml` — clean.
- JSON-LD parse on all 21 new HTML pages — clean.
- Internal-href resolution across the 21 new pages plus updated `index.html` and `blog/index.html` — clean (after fixing six broken links, including five pre-existing solutions cards and the empty `/technologies/secure-elements/` dir).
- `osascript -l JavaScript` parse of `blog-pool.js` and `highlight-banner-config.js` — clean.
- Visual inspection of the homepage flow (commercial surfaces section, banner rotation, blog spotlight pool) — passes.
- Cross-check of case studies → cornerstone blogs → brochures triangle — every page references the related two.

---

## 12. File manifest

### Added

```
case-studies/index.html
case-studies/passwordless-workforce/index.html
case-studies/transit-ticketing/index.html
case-studies/secure-device-identity/index.html

blog/smart-cards-vs-fido-tokens-vs-passkeys/index.html
blog/secure-element-vs-tpm-vs-hsm/index.html
blog/credential-lifecycle-management/index.html
blog/transit-validators-offline-trust-architecture/index.html
blog/javacard-applet-development-enterprise-identity/index.html
blog/pki-credential-issuance-workforce-government/index.html
blog/cyber-security-threats-overview/index.html
blog/fido-supported-services/index.html
blog/how-fido-authentication-works/index.html

brochures/index.html
brochures/onepass/index.html
brochures/fido/index.html
brochures/transit-security/index.html
brochures/javacard/index.html
brochures/pki/index.html
brochures/device-identity/index.html

engagement-models/index.html
technologies/secure-elements/index.html

docs/26-phase10-commercial-authority-and-case-studies.md  (this file)
```

### Modified

```
index.html                              -- commercial surfaces section, retargeted broken solution cards, footer
blog/index.html                         -- 9 new blog cards
sitemap.xml                             -- +22 URLs (220 -> 242)
assets/css/main.css                     -- brochure + print CSS (~110 lines)
assets/js/blog-pool.js                  -- +9 entries (36 -> 45)
assets/js/highlight-banner-config.js    -- +1 banner entry (case-studies-launch-2026)
docs/22-project-consolidation-and-final-gap-review.md  -- Phase 10 backlog closure
```

---

## 13. Future-phase backlog after Phase 10

Phase 11 onwards remains unchanged from docs/22 §3. Specifically, the items below are **not** addressed by Phase 10 and remain scoped to their future phase:

- Real-user-monitoring (Web Vitals beacon) — Phase 11.
- User-facing analytics opt-out UI on `/trust/` — Phase 11.
- Blog search — Phase 11.
- Tag system separate from categories — Phase 11.
- Per-category pagination — Phase 11.
- Automated OG image generation per section — Phase 12.
- Self-host fonts — Phase 12.
- Periodic image optimisation pass — Phase 12.
- Lighthouse CI in GitHub Actions — Phase 13.
- Automated `.htaccess` lint — Phase 13.
- Automated blog-pool regeneration — Phase 13.
- Optional `developer.ambimat.com` subdomain split — Phase 13 (no current trigger).

Nothing on this list is blocking; each is gated on either an operational signal (analytics on, blog count over threshold) or a programme-level decision (CI workflow, subdomain split).

---

## 14. Closing statement

Phase 10 closes the last piece of the commercial-authority backlog. The site now has anonymised case studies, six cornerstone blog posts, six printable platform brochures, an engagement-models page, and three modernised legacy slugs that previously fell through to `/blog/`. Every new page is wired into the navigation, the sitemap, the homepage banner rotation, the blog landing, and the daily blog spotlight pool. No customer names, no fabricated metrics, no invented certifications. The architecture is the story.
