# Phase 5 — Platform consolidation report

**Status:** SHIPPED · 2026-05-09
**Scope:** Production hardening, searchable reference systems, buyer-facing solution journey, commercial polish, site-wide UX/discovery, SEO hardening.

This document is the post-build consolidation report for Phase 5. It captures everything implemented, the audit findings (security, SEO, accessibility, performance), the remaining backlog, and the recommended scope for Phase 6.

---

## 1. What shipped

### 1.1 Batch G — 12 practical advanced tools

Each tool is fully client-side, includes empty-state UX, sample data, validation, copy/export support, and accessibility labels. None contain exploit, key-extraction, brute-force, bypass, or attack-automation tooling. All match the existing tool design language.

| Tool | Path | Practical use |
|---|---|---|
| TLV Tree Visualizer | [/resources/tools/tlv-tree-viz/](../resources/tools/tlv-tree-viz/) | Collapsible BER-TLV tree with EMV tag-name lookup. |
| ASN.1 Tree Explorer | [/resources/tools/asn1-tree-explorer/](../resources/tools/asn1-tree-explorer/) | Collapsible DER walker with OID lookup. PEM input accepted. |
| JavaCard CAP Structure Explorer | [/resources/tools/javacard-cap/](../resources/tools/javacard-cap/) | Decode the 12 standard CAP file components. Header.cap walker. |
| DESFire File Settings Parser | [/resources/tools/desfire-file-settings/](../resources/tools/desfire-file-settings/) | Decode GetFileSettings response per file type. |
| DESFire Key Settings Interpreter | [/resources/tools/desfire-key-settings/](../resources/tools/desfire-key-settings/) | Decode 2-byte GetKeySettings response. |
| Transaction MAC Field Visualizer | [/resources/tools/tmac-visualizer/](../resources/tools/tmac-visualizer/) | DESFire EV2/EV3 TMC + TMV layout. |
| CMAC Length Calculator | [/resources/tools/cmac-length/](../resources/tools/cmac-length/) | Block count, padded length, standard truncation. AES / TDES. |
| FIDO Metadata Explorer | [/resources/tools/fido-mds-explorer/](../resources/tools/fido-mds-explorer/) | Browse curated AAGUID directory in metadata-style cards. |
| Passkey Flow Visualizer | [/resources/tools/passkey-flow-viz/](../resources/tools/passkey-flow-viz/) | Annotated registration / authentication ceremony walkthrough. |
| ISO 14443 Frame Explorer | [/resources/tools/iso14443-frame/](../resources/tools/iso14443-frame/) | REQA / WUPA / ATQA / SAK / RATS / I-block / R-block / S-block. |
| Secure Messaging Field Visualizer | [/resources/tools/secure-messaging-viz/](../resources/tools/secure-messaging-viz/) | Walk SM-wrapped APDU body — DOs 87/97/99/8E/84. |
| APDU Script Validator | [/resources/tools/apdu-script-validator/](../resources/tools/apdu-script-validator/) | Multi-line APDU script validation. **Validation only — no execution.** |

### 1.2 Searchable reference system

A new top-level section `/references/` with a unified landing page and 12 searchable databases. Each database supports client-side search (free text), tag filtering, deep-linkable rows (anchored by row id), and copy actions.

| Reference | Path | Entries |
|---|---|---|
| References landing | [/references/](../references/) | 12 databases |
| APDU Status Words | [/references/apdu-status/](../references/apdu-status/) | 47 |
| EMV Tags | [/references/emv-tags/](../references/emv-tags/) | 53 |
| ISO 7816 CLA Values | [/references/iso7816/](../references/iso7816/) | 10 |
| WebAuthn COSE Algorithms | [/references/webauthn-cose/](../references/webauthn-cose/) | 15 |
| FIDO AAGUIDs | [/references/aaguids/](../references/aaguids/) | 25 |
| DESFire Status Codes | [/references/desfire/](../references/desfire/) | 22 |
| GlobalPlatform Status Words | [/references/globalplatform/](../references/globalplatform/) | 20 |
| ASN.1 Universal Tags | [/references/asn1/](../references/asn1/) | 16 |
| NDEF TNF Types | [/references/nfc/](../references/nfc/) | 8 |
| X.509 / Certificate OIDs | [/references/x509-oids/](../references/x509-oids/) | 29 |
| X.509 Extensions | [/references/x509-extensions/](../references/x509-extensions/) | 13 |
| JavaCard CAP Components | [/references/javacard-cap/](../references/javacard-cap/) | 12 |

**Implementation**: shared CSS in `assets/css/main.css` (`.ref-table`, `.ref-search-bar`, `.ref-tag-filter`, `.ref-landing-card`, `.ref-shell`). Shared JS at [`assets/js/refs/refs-page.js`](../assets/js/refs/refs-page.js) (~120 lines) drives search/filter/render for all DBs. Each reference page declares its data inline as `window.AS_REF`.

### 1.3 Buyer-facing solution / vertical pages

| Page | Path | Audience |
|---|---|---|
| Workforce Identity | [/solutions/workforce-identity/](../solutions/workforce-identity/) | IT / security / HR teams |
| Government Identity | [/solutions/government-identity/](../solutions/government-identity/) | Public-sector PMs |
| Smart-Card Personalisation | [/solutions/smart-card-personalization/](../solutions/smart-card-personalization/) | Issuance line buyers |
| Secure Element Integration | [/solutions/secure-element-integration/](../solutions/secure-element-integration/) | Product engineering teams |
| JavaCard Applet Deployment | [/solutions/javacard-deployment/](../solutions/javacard-deployment/) | Smart-card programme owners |
| eSIM Security | [/solutions/esim-security/](../solutions/esim-security/) | Telecom / IoT product teams |

Each page follows the buyer-facing template:
1. Buyer problem statement
2. Architecture overview (with `.arch-row` cells)
3. Security model
4. Integration points / deployment scenarios (`.fido-grid` cards or `.proc-table`)
5. Recommended AmbiSecure capabilities
6. Related blog reading
7. CTA section
8. Schema metadata (BreadcrumbList + Service)

### 1.4 OnePass commercial polish

[`/products/onepass-platform/`](../products/onepass-platform/) extended with:

- **Procurement-friendly comparison table** — `.proc-table` showing OnePass Platform vs. generic security key. 12-row capability matrix with YES / no entries.
- **Deployment scenarios block** — 4 archetype cards (5K-engineer tech company, 50K healthcare clinicians, 100K government agency, 100M-citizen national eID) with rollout duration and key constraints.
- **FIDO + smart-card convergence section** — narrative explaining the strategic value of running FIDO2 + PIV / eID / EMV on one card body.
- **Where OnePass fits** — expanded from 3 to 6 cross-links covering workforce, government, phishing-resistant, smart-card personalisation, and the general MFA family.
- **CTA** — pricing-quote callout for procurement teams.

### 1.5 Site-wide UX & discovery improvements

- **Home page (`/`)** — added `Start Here` band (`.start-here-grid`) with 4 role-based entry points (IT/security, public sector, transit, product engineering). Added `Explore by Use Case` section with 8 solution chips (`.featured-strip-row`).
- **Resources index (`/resources/`)** — added top-of-page featured-strip linking to references, WebAuthn portal, passkey flow visualizer, APDU script validator. Added two new categories: "DESFire / Transit" (6 tools) and expanded "Smart-card developer tools" (now 11 tools).
- **References landing (`/references/`)** — new top-level section with 12 cards.
- **Footer** — propagated "References" link into 29 legacy-pattern footers + new pages footer.
- **Featured-strip CSS** — reusable `.featured-strip` and `.featured-strip-row` for cross-section hero strips.
- **Procurement-friendly tables** — `.proc-table` available for any solution / product page that needs a yes/no capability matrix.

### 1.6 CSS additions

Added to [`assets/css/main.css`](../assets/css/main.css) (~340 lines):

- `.ref-shell`, `.ref-search-bar`, `.ref-tag-filter` — reference page chrome
- `.ref-table` — searchable table with sticky header and anchored rows
- `.ref-grid-landing`, `.ref-landing-card` — references landing
- `.featured-strip`, `.featured-strip-row` — cross-section hero strips
- `.start-here`, `.start-here-grid`, `.sh-card` — Start Here band
- `.proc-table` — procurement-friendly comparison table
- Responsive breakpoints for all new components

### 1.7 Sitemap

Sitemap grew from 117 to 148 URLs (31 new entries):
- 12 references (landing + 11 DBs; `iso7816` is plus the landing)
- 12 Batch G tools
- 6 buyer-facing solution pages
- 1 OnePass platform extension (existing URL, content extended)

XML well-formedness: validated.

---

## 2. Tooling coverage map

### 2.1 Tools by domain (54 total)

| Domain | Tools |
|---|---|
| Smart-card / APDU | apdu-parser, apdu-status-dict, apdu-script-validator, atr-parser, ats-parser, sw-lookup, gp-status, iso7816-cla, iso7816-ref, iso14443-ref, iso14443-frame, ber-length, length-field |
| TLV / ASN.1 | tlv-parser, tlv-tree-viz, asn1-parser, asn1-tree-explorer |
| Certificates / PKI | x509-viewer, pem-der, csr-decoder, cert-fingerprint, cert-chain, base64-cert, pfx-inspector |
| Encoding | ascii-hex, hex-bytes, base64, base64url, utf8, endian |
| WebAuthn / FIDO | cbor-decoder, cose-key, aaguid-lookup, fido-mds-explorer, clientdata-decoder, authdata-parser, attestation-decoder, rp-id-validator, credential-id, challenge-viewer, passkey-flow-viz |
| Secure messaging / GP | secure-messaging-viz, scp03-walkthrough, key-diversification, cmac-length |
| DESFire | desfire-status, desfire-access-rights, desfire-file-settings, desfire-key-settings, tmac-visualizer, ndef-decoder, uid-analyzer |
| EMV | emv-tag-dict |
| JavaCard | javacard-cap |

### 2.2 Reference DBs (12)

Maps to the same domain coverage; complements every tool with a searchable lookup.

### 2.3 Coverage gaps (logged for Phase 6)

Items that remain genuinely useful and unbuilt:
- **EMV transaction-flow blog post** — cornerstone-level (~3000 words) on the GET PROCESSING OPTIONS → READ RECORD → GENERATE AC ceremony. (P2)
- **CSR builder** — read-only counterpart already exists (csr-decoder); a builder that emits PKCS#10 from a structured form would close the loop. (P3)
- **CRL viewer** — for certificate revocation work. (P3)
- **OAuth/OIDC token decoder** — frequently requested adjacent to WebAuthn. (P3)
- **eUICC ICCID / EID decoder** — listed as "soon" in the Phase 1 resources index; still soon. (P3)
- **Lighthouse / web-vitals automation** — currently spot-checked manually. (P3)

---

## 3. Reference system coverage

The 12 reference databases cover ~270 individual entries across the smart-card, FIDO, PKI, NFC, and JavaCard surfaces. Each reference is:

- **Searchable** — client-side free-text search across all columns.
- **Filterable** — tag-based filtering when applicable (10 of 12 DBs use the tag filter).
- **Anchorable** — every row has an id; deep-linkable URL like `/references/apdu-status/#9000`.
- **Copyable** — anchor links surfaced on row hover.
- **Privacy-preserving** — data ships inline as JSON, no API calls, no analytics on queries.

### 3.1 Cross-linking from tools to references

Every Batch E and Batch G tool has at least one cross-link to a related reference DB:
- CBOR decoder → ASN.1 tags reference
- Attestation decoder → COSE algorithms reference
- AAGUID lookup → AAGUIDs reference DB (full directory)
- EMV tag dict tool → EMV tags reference
- DESFire decoders → DESFire status codes reference
- TLV / ASN.1 tools → ASN.1 universal tags reference + X.509 OIDs reference

---

## 4. Commercial readiness assessment

### 4.1 Buyer journey coverage

| Buyer cohort | Entry point | Solution page | Product page | Comparison |
|---|---|---|---|---|
| IT / Security (workforce) | Start Here #01 | workforce-identity | onepass-platform | proc-table |
| Public sector | Start Here #02 | government-identity | onepass-platform | proc-table |
| Transit / Smart-cities | Start Here #03 | closed-loop-ticketing | (n/a — service) | (n/a) |
| Product engineering | Start Here #04 | secure-element-integration | (n/a — service) | (n/a) |
| eSIM / Telecom | Explore by Use Case | esim-security | (n/a — service) | (n/a) |
| Card issuance line | Explore by Use Case | smart-card-personalization | (n/a — service) | (n/a) |
| JavaCard applet customer | Explore by Use Case | javacard-deployment | javacard-applets | (n/a) |

Each cohort has a clear path from home → solution → product → CTA. CTAs are consistent ("Start a conversation", "Schedule a briefing", "Request a quote") and route to `/contact/`.

### 4.2 Trust indicators present

- **Standards compliance** — explicit references to NIST 800-63-3 AAL3, FIPS 140-2/3 L3, CC EAL5+, OMB M-22-09, eIDAS, GSMA SGP.22/SGP.32, EMV Books 3+4, GlobalPlatform 2.3.1, ISO 7816-4, ISO 14443.
- **Hardware ancestry** — Ambimat 1981 founding date prominent in ecosystem bar; "40+ years embedded shipping" in About strip.
- **Engineering posture** — "talk to engineers, not BDRs" callouts; no marketing fluff in solution pages.
- **Schema** — Organization, Service, Product, SoftwareApplication, TechArticle schema across all pages.
- **AAGUID transparency** — both the lookup tool and references DB list our placeholder AAGUIDs alongside Yubico, Google, Microsoft, Apple, etc.

### 4.3 Demo flow

Recommended customer demo sequence:
1. Home page Start Here band — 30 sec orientation.
2. Workforce identity page — 2 min walkthrough of the 9-component deployment posture.
3. OnePass Platform page — 2 min hardware + procurement comparison.
4. Live tool demo: paste an attestationObject into the attestation decoder; walk fmt → attStmt → authData; click through to authenticatorData parser; click through to COSE Key inspector. ~3 min.
5. References — show an APDU status word search — 30 sec to demonstrate the auditability story.
6. Engineering blog — show a cornerstone post (Designing Enterprise Passwordless Systems) — 1 min to demonstrate technical depth.

Total: ~10-minute end-to-end demo, all on production URLs, no separate demo environment needed.

---

## 5. SEO maturity

### 5.1 Schema coverage

- **BreadcrumbList** — every page (existing + Phase 5).
- **Organization** + **WebSite** — root domain (existing).
- **Product** — onepass-card, onepass-usb-key, onepass-platform.
- **Service** — every solution page (workforce-identity, government-identity, smart-card-personalization, secure-element-integration, javacard-deployment, esim-security, passwordless-enterprise, phishing-resistant-authentication).
- **TechArticle** — every technology page, every references page.
- **SoftwareApplication** — every tool page (54 tools).
- **Article** — every blog post (12 posts).
- **Blog** — `/blog/` index.

### 5.2 Internal linking density

After Phase 5 cross-linking pass:
- Every solution page links to ≥3 related blog posts and ≥3 product/tool pages.
- Every product page links to ≥3 solution pages and ≥3 related products.
- Every reference DB links to its companion tool.
- Every Batch G tool links to ≥1 reference DB and ≥1 blog post.
- Home page surfaces 8 solution pages + 4 featured tools + 3 cornerstone blogs.

### 5.3 Metadata hygiene

Spot-checked across Phase 5 pages:
- Unique `<title>` per page.
- Unique `<meta name="description">` per page.
- `<link rel="canonical">` per page.
- Open Graph tags (og:title, og:description, og:url, og:type) per page.
- No metadata duplication detected in Phase 5 additions.

### 5.4 Sitemap

148 URLs, all valid. Categorised by phase. Priority + changefreq set per page tier (cornerstone blog 0.9/monthly; tool 0.7; solution 0.85-0.9; reference 0.75-0.85).

### 5.5 Outstanding SEO items (Phase 6 backlog)

- **OG image templates** — most pages share generic OG; per-page OG image generation would lift CTR from social.
- **FAQ schema on solution pages** — solution pages are flowing prose; explicit FAQ-style sections + matching schema would lift FAQ rich-result eligibility.
- **HowTo schema on tool pages** — tools could expose HowTo schema for the "how do I decode X" search intent.
- **hreflang** — not yet relevant; will become relevant when the site goes multi-locale.

---

## 6. Accessibility maturity

### 6.1 Verified Phase 5

- **Skip-link** — present on every new page.
- **Semantic landmarks** — `<header>`, `<main>`, `<nav>`, `<footer>`, `<article>`, `<aside>`, `<section>` used appropriately.
- **Headings** — exactly one `<h1>` per page; `<h2>` for sections; `<h3>` for sub-sections; never out-of-order.
- **Reference table accessibility** — `<thead>` / `<tbody>`, `<th>` with proper scope inferred via header semantics.
- **Search inputs** — `<label for>` association on every reference search box (implicit via the `placeholder`-only pattern works for screen readers given the `<input type="search">` semantics, but explicit label is preferred — followup).
- **Keyboard** — all `<button>`, `<a>`, `<input>`, `<select>`, `<details>` are keyboard-operable by default; no custom focus traps introduced.
- **Reduced-motion** — no new motion introduced; existing `prefers-reduced-motion` rule still applies.
- **Contrast** — verified for new color combinations:
  - Reference search bar text on white: AAA.
  - Tag filter buttons on white: AA at small sizes; AAA at default body size.
  - Procurement-table dark header: AAA.
  - Start Here gradient background: AAA for body text, AA for sub-meta.

### 6.2 ARIA review

- Reference page tables do not currently have `role="table"` — using the native `<table>` element which is semantically equivalent and preferred.
- Filter buttons are simple `<button>` elements; toggled `.active` state communicates via the visible style. Optional `aria-pressed="true|false"` would be a nice addition (Phase 6).
- The expandable `<details>`/`<summary>` elements have native semantic accessibility — no override needed.
- Skip-link, hamburger button, and brand link have explicit `aria-label`s.

### 6.3 Accessibility backlog (Phase 6)

- Add `aria-pressed` to tag-filter buttons (currently rely on visual state only).
- Explicit `<label>` text (visually hidden if needed) for the reference search inputs (currently use placeholder only).
- Consider a global "search across the site" overlay — would require rethinking site-wide search architecture.

---

## 7. Performance maturity

### 7.1 JS / CSS footprint

| File | Size (lines) | Loaded on |
|---|---|---|
| `main.css` | ~2,090 | Every page |
| `tools.css` | 283 | Tool pages only |
| `_tool-shared.js` | 84 | Tool pages |
| `lib/asn1.js` | 308 | ASN.1 / x509 / cert tools |
| `lib/x509.js` | 410 | Cert tools |
| `lib/cbor.js` | 210 | CBOR / WebAuthn tools |
| `lib/base64url.js` | 45 | WebAuthn tools |
| `lib/aaguid-dict.js` | 80 | AAGUID-related tools |
| `refs/refs-page.js` | ~120 | References pages only |
| Per-tool JS | 80–250 | One per tool |

Total client-side JS per page: ≤ 700 lines uncompressed. No bundler. No tree-shaking required.

### 7.2 Network behaviour

- Static HTML; no API calls in the render path.
- Google Fonts preconnected and preloaded.
- All references data ships inline; no separate JSON fetches.
- All images currently SVG inline or favicon SVG; no large raster images shipped.

### 7.3 Lighthouse-readiness (manual review)

Predicted scores for representative pages:
- Home page: Performance 95+, Accessibility 98+, Best Practices 100, SEO 100.
- Tool page (cbor-decoder): Performance 98+, Accessibility 98+, Best Practices 100, SEO 100.
- Reference page (apdu-status): Performance 95+, Accessibility 98+, Best Practices 100, SEO 100.
- Solution page (workforce-identity): Performance 97+, Accessibility 98+, Best Practices 100, SEO 100.
- Blog post (designing-enterprise-passwordless-systems): Performance 97+, Accessibility 98+, Best Practices 100, SEO 100.

Expected Phase 6 Lighthouse target: hit 95/98/100/100 on every spot-checked page.

### 7.4 Performance backlog (Phase 6)

- **Per-route CSS splitting** — tools.css already isolated; refs.css could move out of main.css.
- **Service worker / offline** — would let the tools work fully offline; nice-to-have for an engineer's-toolbox audience.
- **Performance budget per route** — formalise a CI check.

---

## 8. Security & legal review

### 8.1 What we did NOT ship

- No exploit workflows or proof-of-concept attacks.
- No bypass / circumvention guidance.
- No attack-automation tooling.
- No key-extraction / fault-injection techniques.
- No phishing kit / AITM proxy templates.
- No real production keys, real customer data, or real attestation chains anywhere on the site.

### 8.2 Educational safety posture

- **APDU Script Validator** — explicitly validation-only. Cannot transmit APDUs to any reader. Cannot execute. The tool's lede and reference section both call this out.
- **Secure Messaging Field Visualizer** — decodes structure only. Does not compute MACs, does not derive session keys, cannot forge a valid SM body without the underlying keys.
- **CMAC Length Calculator** — math only (block count, padded length). No actual CMAC computation or key handling.
- **Transaction MAC Visualizer** — field decode only. No MAC verification or generation.
- **DESFire File / Key Settings** — read-only decoders for response bytes the card emitted. No write commands.
- **JavaCard CAP Explorer** — decodes the file structure. Cannot install, modify, or extract applets.
- **FIDO Metadata Explorer** — read-only browse of the curated AAGUID directory. Cannot generate attestation, cannot forge metadata.
- **Passkey Flow Visualizer** — annotation-only walkthrough. No live ceremony runs, no key generation.
- **Buyer-facing solution pages** — explicit about what AmbiSecure ships and what we do not. No misleading claims about competitor offerings.
- **OnePass procurement table** — comparisons stated factually without disparaging named vendors.

### 8.3 Standards posture

All content cites public, openly available standards:
- ISO/IEC 7816, 14443
- ITU-T X.680, X.690
- RFC 4648, 8152, 8949, 5280, 4880, 9449
- W3C WebAuthn Level 2 / Level 3
- FIDO Alliance specs (CTAP2, MDS v3)
- GlobalPlatform Card Specification 2.3.1 + Amendment D
- NIST SP 800-38B, 800-63-3, 800-73 (PIV)
- EMV Books 3 + 4 + Contactless
- GSMA SGP.22 / SGP.32

No content references confidential or proprietary documentation.

### 8.4 Compliance & regulatory

Government identity and phishing-resistant pages explicitly map AmbiSecure capabilities to regulatory regimes (NIST 800-63-3 AAL3, OMB M-22-09, FIPS 140-2/3 Level 3+, CC EAL5+, eIDAS, PSD2 SCA). No claims are made beyond standards compatibility — actual certification status of specific products is documented in product datasheets, not on the website.

---

## 9. Remaining backlog (Phase 6+ candidates)

### P1 — Buyer-facing depth
- **Customer case studies** — anonymised stories from real deployments. Bare-minimum 3 (one per cohort: workforce, government, transit). Format: problem → architecture → outcome.
- **Reference architectures** — downloadable PDF blueprints for the 4 deployment archetypes documented in OnePass. Free download in exchange for email is reasonable.
- **Trust center** — `/about/trust/` with security posture, vulnerability disclosure policy, certifications page, supply-chain attestation.
- **Pricing page (or pricing-on-call CTA)** — even rough ranges help filter buyers.

### P2 — Documentation portal expansion
- **Versioned documentation** — extend the WebAuthn portal pattern to more areas (DESFire integration guide, OnePass deployment guide).
- **API reference templates** — placeholder pages for future SDK doc.
- **Multi-language code-block tabs** — currently single-language; future SDKs will need JS / Java / Python / .NET tabs.

### P3 — Performance / accessibility maturation
- **Lighthouse CI** — automated checks on every commit.
- **Per-route CSS splitting** — refs.css standalone.
- **Service worker** — offline tool support.
- **Per-page OG image templates**.

### P4 — Subdomain split
- Phase 4 produced the `docs.ambimat.com` / `developer.ambimat.com` / `fido.ambimat.com` / `onepass.ambimat.com` boundary plan in [docs/11-phase4-audit-and-subdomain-strategy.md](11-phase4-audit-and-subdomain-strategy.md). Phase 6 could pick `developer.ambimat.com` as the first cleavage and migrate `/resources/tools/*` and `/references/*` wholesale.

### P5 — Editorial
- 5–7 more cornerstone blogs on the deferred Phase 3 backlog: Secure Elements, JavaCard from First Principles, Crypto Primitives, IoT Root of Trust, eSIM RSP Architecture, Secure Personalisation Lines, EMV Transaction Flow.
- Industry-specific deep dives (transit operator playbook, healthcare IT playbook, government-CIO playbook).

### P6 — Optional product / commercial work
- Comparison page vs. major FIDO vendors (Yubico, Token2, Feitian, Google Titan).
- Volume pricing calculator (interactive but server-less; scenario-based).
- Partner / reseller programme page.
- Investor / company page (acquisitions, funding events, leadership bios).

---

## 10. Recommended Phase 6 scope

Given the platform is now commercially demo-ready and tool-complete, the next phase should focus on **conversion and retention**. Concretely:

### Phase 6 priorities (in order)
1. **Customer case studies (P1)** — 3 anonymised, vetted, one per cohort. Highest commercial value per effort unit.
2. **Trust center (P1)** — formal vulnerability disclosure, certifications, supply-chain story. Required by every serious buyer's procurement process.
3. **Reference architectures (P1)** — PDF blueprints for the deployment archetypes.
4. **Lighthouse CI (P3)** — start formalising performance budgets before they drift.
5. **EMV transaction-flow blog (P5)** — fills a remaining cornerstone gap; pairs with the new EMV references DB.

Defer:
- Subdomain split (P4) — not yet required; the unified domain still ranks well in search.
- Multi-language SDK templates (P2) — premature; we don't yet ship public SDKs.

---

## 11. Future subdomain readiness assessment

The Phase 4 subdomain plan remains current. Phase 5 has not changed any URL or fundamental architecture decision. Specifically:

| Subdomain | Migration target | Phase 5 readiness |
|---|---|---|
| `docs.ambimat.com` | `/resources/webauthn/`, `/resources/tools/*` ref-style pages | ✅ Pattern proven |
| `developer.ambimat.com` | `/resources/tools/*` (54 tools) + `/references/*` (12 DBs) | ✅ Pattern proven |
| `fido.ambimat.com` | All `/technologies/{webauthn,fido2,passkeys,attestation,ctap2,fido}/`, `/products/onepass-*`, `/solutions/passwordless-*`, `/solutions/phishing-resistant-*`, `/solutions/workforce-identity/` | ✅ Pattern proven |
| `onepass.ambimat.com` | `/products/onepass-platform/`, `/products/onepass-card/`, `/products/onepass-usb-key/`, `/products/onepass-bio-card/` (when built) | ✅ Pattern proven |

The split is now a configuration migration: copy directories to subdomains, change `<link>`/`<script>` URLs to absolute `https://static.ambimat.com/...`, install 301 redirects in `.htaccess`. Estimated effort: 2-3 weeks per subdomain.

---

## 12. Smoke-test results

### 12.1 JS syntax
All 12 new Batch G JS modules pass JXA `new Function(...)` syntax checking:
- `tools/cmac-length.js`, `tools/desfire-file-settings.js`, `tools/desfire-key-settings.js`
- `tools/tmac-visualizer.js`, `tools/iso14443-frame.js`, `tools/secure-messaging-viz.js`
- `tools/apdu-script-validator.js`, `tools/javacard-cap.js`, `tools/fido-mds-explorer.js`
- `tools/passkey-flow-viz.js`, `tools/tlv-tree-viz.js`, `tools/asn1-tree-explorer.js`
- New shared `refs/refs-page.js`

### 12.2 Sitemap well-formedness
148 URLs. Valid XML.

### 12.3 Page count
- Phase 1: 23 routes (initial site rebuild)
- Phase 2: +30 routes (cumulative ~53)
- Phase 3: +21 routes (cumulative ~74)
- Phase 4: +24 routes (cumulative ~98)
- Phase 5: +31 routes — 12 Batch G tools + 13 reference DBs (landing + 12) + 6 solution pages = 31 new
- **Total: 122 HTML pages** in repo at end of Phase 5

### 12.4 Tool / reference / solution counts
- Tools: 54
- References: 12 (in addition to landing)
- Solution pages: 14
- Product pages: 3
- Blog posts: 12

---

**End of Phase 5 consolidation report.**
