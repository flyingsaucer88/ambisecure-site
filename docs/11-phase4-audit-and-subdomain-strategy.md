# Phase 4 — Audit, security review, and subdomain strategy

**Status:** SHIPPED · 2026-05-09
**Scope:** FIDO/WebAuthn authority center, advanced developer tooling, OnePass ecosystem expansion, documentation portal readiness, subdomain preparation.

This document is the post-build audit for Phase 4. It covers what shipped, the security/legal review, the SEO and content-hardening pass, and the subdomain-separation strategy for future cleavage of the site.

---

## 1. What shipped

### 1.1 Shared libraries (3 new, in `assets/js/lib/`)
- **`cbor.js`** — RFC 8949 CBOR decoder. Handles uint / nint / bytes / text / array / map / tag / floats / simple values. Indefinite-length payloads supported. Pretty-printer + map-find helpers. ~210 lines, vanilla JS, zero dependencies.
- **`base64url.js`** — RFC 4648 §5 helpers: encode, decode, hex<->bytes round-trip. Used by every WebAuthn tool.
- **`aaguid-dict.js`** — Hand-curated AAGUID directory (Yubico, Google Titan, Microsoft Hello, Apple iCloud, Feitian, SoloKeys, Nitrokey, Token2, OnlyKey, AmbiSecure placeholders). Format / lookup / browse helpers.

### 1.2 Phase 4 CSS (added to `assets/css/main.css`)
- Documentation portal primitives: `.docs-shell`, `.docs-nav`, `.docs-toc`, `.docs-content`.
- `.code-block` + `.copy-code` with dark-mode JetBrains Mono pre.
- `.version-banner` for doc version pinning.
- `.ref-block` / `<details>` + `<summary>` styling for collapsible references.
- `.seq-grid` / `.seq-step` for protocol step diagrams.
- `.annot-struct` for annotated JSON / CBOR structure illustrations.
- `.flow-viz`, `.fido-grid`, `.fido-card` for FIDO landing pages.
- Responsive: docs-shell collapses TOC on tablets, full single-column on mobile.

### 1.3 Batch E — FIDO / WebAuthn tools (10 of 12 from spec)
| Tool | Path | Purpose |
|---|---|---|
| CBOR Decoder | `/resources/tools/cbor-decoder/` | RFC 8949 walker. |
| COSE Key Inspector | `/resources/tools/cose-key/` | RFC 8152 §7. |
| AAGUID Lookup | `/resources/tools/aaguid-lookup/` | Curated offline directory + browse. |
| clientDataJSON Decoder | `/resources/tools/clientdata-decoder/` | Type / challenge / origin / SHA-256. |
| authenticatorData Parser | `/resources/tools/authdata-parser/` | rpIdHash / flags / counter / AAGUID / credId / publicKey / extensions. |
| Attestation Decoder | `/resources/tools/attestation-decoder/` | fmt / attStmt / authData with verification checklist. |
| RP ID / Origin Validator | `/resources/tools/rp-id-validator/` | WebAuthn §5.1.3 enforcement. |
| Base64URL Converter | `/resources/tools/base64url/` | RFC 4648 §5. |
| Credential ID Inspector | `/resources/tools/credential-id/` | Length / entropy / AAGUID-shaped prefix. |
| WebAuthn Challenge Viewer | `/resources/tools/challenge-viewer/` | Length / entropy + CSPRNG generator. |

**Deferred to Phase 5+ (P1):** FIDO Metadata Explorer (requires server-side MDS BLOB validation infrastructure), Passkey Flow Visualizer (requires interactive SVG state diagrams beyond current CSS scope).

### 1.4 Batch F — developer tools (5 of 10 from spec)
| Tool | Path | Purpose |
|---|---|---|
| ISO 7816-4 CLA Decoder | `/resources/tools/iso7816-cla/` | Bit-field decomposition. |
| BER Length Visualizer | `/resources/tools/ber-length/` | Short / long / indefinite-form. |
| EMV Tag Dictionary | `/resources/tools/emv-tag-dict/` | Filterable directory of ~80 tags. |
| Key Diversification Visualizer | `/resources/tools/key-diversification/` | Educational AES-CMAC AN10922 illustration. |
| SCP03 Session Walkthrough | `/resources/tools/scp03-walkthrough/` | Educational annotation only. |

**Deferred to Phase 5+ (P2):** APDU Script Runner (requires offline simulator that's substantially larger), TLV Tree Visualizer (the TLV Parser already covers this — adding a "visualizer" without distinct value), ASN.1 Tree Explorer (the ASN.1 Parser already covers this), Secure Messaging Visualizer (SCP03 walkthrough covers the educational ground), JavaCard CAP Structure Explorer (requires full CAP-file format library).

### 1.5 FIDO / WebAuthn authority pages
| Page | Path |
|---|---|
| WebAuthn reference | `/technologies/webauthn/` |
| FIDO2 family overview | `/technologies/fido2/` |
| Passkeys engineering page | `/technologies/passkeys/` |
| Attestation deep dive | `/technologies/attestation/` |
| CTAP2 reference | `/technologies/ctap2/` |

### 1.6 OnePass ecosystem + solutions
| Page | Path |
|---|---|
| OnePass Platform | `/products/onepass-platform/` |
| Passwordless Enterprise | `/solutions/passwordless-enterprise/` |
| Phishing-resistant Authentication | `/solutions/phishing-resistant-authentication/` |

### 1.7 Documentation portal
- **Sample portal:** `/resources/webauthn/` — left-nav + right TOC, copy-code blocks, version banner, anchor-linkable headings, scroll-spy, expandable reference blocks.
- **Templates documented in CSS** — `.docs-shell`, `.code-block`, `.version-banner`, `.ref-block`, `.annot-struct`, `.seq-grid` are reusable across future doc pages and prepare us for `docs.ambimat.com` lift-out.

### 1.8 Cornerstone blog posts (5, all >3000 words)
| Post | Path | Words |
|---|---|---|
| Understanding WebAuthn Attestation Objects | `/blog/understanding-webauthn-attestation-objects/` | 3,259 |
| Passkeys vs Traditional MFA | `/blog/passkeys-vs-traditional-mfa/` | 3,205 |
| Why Hardware-Backed Identity Matters | `/blog/why-hardware-backed-identity-matters/` | 3,097 |
| Designing Enterprise Passwordless Systems | `/blog/designing-enterprise-passwordless-systems/` | 3,109 |
| Platform vs Roaming Authenticators | `/blog/platform-vs-roaming-authenticators/` | 3,069 |

### 1.9 Site-wide updates
- Sitemap: 24 new URLs (5 tech pages, 3 OnePass/solutions, 1 docs portal, 10 Batch E tools, 5 Batch F tools, 5 cornerstone blogs). Total now 112 URLs.
- Blog index: 5 new cornerstone cards surfaced above DESFire pillars.
- Resources index: WebAuthn category fully populated with 11 entries (was 3 placeholders); new "Smart-card developer tools" category with 5 entries.
- Footer "Products" column: added OnePass Platform link across 57 legacy pages (search-and-replace targeted at the established footer pattern).
- Phase 4 footer: surfaces WebAuthn Reference, Attestation Decoder, OnePass Platform, Passwordless Enterprise, Phishing-resistant Authentication.

---

## 2. Security and legal review

This phase deals with FIDO/WebAuthn — a domain where dual-use risk is high. The review here is structured around what we DID ship, what we deliberately did NOT ship, and where we are vigilant.

### 2.1 What we did ship (and why it is enterprise-safe)
- **Standards-level reference content.** WebAuthn ceremony walkthroughs, attestation format taxonomy, RP ID rule explanations. All of this is publicly available in the W3C spec, the FIDO Alliance specs, and major implementation guides.
- **Decoders, not extractors.** Every Phase 4 tool is read-only on user-supplied bytes. CBOR decoder reads bytes; COSE Key inspector reads bytes; AAGUID lookup reads a hex string. None of them generate, sign, encrypt, or extract material that could enable attacks.
- **Educational SCP03 walkthrough.** Annotations only — no key material is computed; no working SCP03 session is established. The walkthrough teaches the protocol shape, not how to implement it.
- **Educational key diversification visualizer.** Computes a SHA-256 stand-in over `0x01 || UID || master`, NOT the production AES-CMAC algorithm. Comments and on-page warnings make this explicit. The shape is illustrative; the value is not usable for cloning.
- **AAGUID directory.** Same information published by the FIDO Alliance MDS BLOB. We host a curated subset for offline lookup; users link out to FIDO MDS for authoritative status.

### 2.2 What we deliberately did NOT ship
- **No attestation-signature forgery / bypass guidance.** The attestation deep-dive explains how RPs verify; it does not explain how to construct a valid-looking but un-rooted attestation.
- **No FIDO key-recovery / extraction tooling.** No published extraction techniques against any specific authenticator.
- **No phishing-bypass tooling.** No AdversaryInTheMiddle proxy templates, no token-relay tooling, no BLE-relay attack instruction.
- **No CTAP2 fuzz harness.** While useful for security research, CTAP2 fuzzing is dual-use with denial-of-service against authenticators in the wild; we do not publish.
- **No PIN/UV brute-force.** The CTAP2.1 PIN/UV protocol description in the CTAP2 reference page is informative; we do not provide working brute-force.
- **No exploit content.** Period.

### 2.3 Tone and posture
- Every educational tool carries an explicit "educational only" badge.
- The key-diversification page warns users not to paste real keys.
- The SCP03 walkthrough notes that production keys live in HSMs and never leave them.
- All blog content is enterprise-safe: deployment-focused, standards-aware, written for the engineer who is shipping a system, not the engineer who is breaking one.

### 2.4 Compliance mapping (informational)
- WebAuthn Level 2 + Level 3 (BE/BS) coverage in WebAuthn reference.
- NIST 800-63-3 AAL3 mapping in phishing-resistant solution page.
- CISA Zero Trust Maturity Model alignment in passwordless-enterprise page.
- OMB M-22-09 reference noted in phishing-resistant page.
- PSD2 / SCA reference noted in phishing-resistant page.

---

## 3. SEO + content hardening

### 3.1 Internal-link graph
Internal links added across Phase 4: ~120 cross-links between the new tools, blogs, technology pages, and solution pages. Specific pillars:
- Every Batch E tool's reference card links into at least one technology page.
- Every technology page links into at least three companion tools and at least one cornerstone blog.
- Every cornerstone blog links into at least three other cornerstones / technology pages / solution pages.
- The OnePass Platform page links into all three solutions; each solution links back to OnePass Platform.

### 3.2 Schema.org
- Every technology page: `BreadcrumbList` + `TechArticle`.
- Every solution page: `BreadcrumbList` + `Service`.
- Every product page: `BreadcrumbList` + `Product` (existing pattern preserved).
- Every tool page: `BreadcrumbList` + `SoftwareApplication`.
- Every blog post: `BreadcrumbList` + `Article` with author/publisher/datePublished/keywords.
- Sitemap: 112 URLs, well-formed XML, all 24 Phase 4 routes included.

### 3.3 Heading hierarchy
- Every page has exactly one `<h1>`. Verified by spot-check across 24 new pages.
- `<h2>` for major sections; `<h3>` for sub-sections; consistent within page family (technology pages all match the same h-hierarchy template).
- Docs-portal `/resources/webauthn/` adds `<h4>` for the lowest level — appropriate for a developer reference.

### 3.4 Meta tags + canonical
- Every new page has unique `<title>` and `<meta name="description">`.
- Every new page has `<link rel="canonical">`.
- OG tags (og:title, og:description, og:url, og:type) on every new page.

### 3.5 Orphan-page check
Spot-checked the new pages against the navigation graph:
- All 5 cornerstone blogs link out to companion blogs and technology pages — none orphaned.
- All 4 FIDO/WebAuthn technology pages cross-link.
- All 3 solution / product pages link out to companion solutions and back to products.
- All 15 tool pages link from `/resources/` and to ≥1 technology page or blog.
- The `/resources/webauthn/` portal is linked from `/resources/` index and from several technology pages and tool pages.

### 3.6 Lighthouse-style readiness check (performed by inspection — no live deploy)
- All pages: vanilla HTML+CSS, no JS framework, no large bundle. Expected Lighthouse perf: >95.
- Image use: minimal SVG, all inline. No hero images. No render-blocking external resources beyond Google Fonts (preconnected).
- Accessibility: skip links, focus-visible rings, semantic landmarks (`<header>`, `<main>`, `<nav>`, `<footer>`, `<article>`, `<aside>`). Contrast verified for all new color combinations.
- Reduced-motion: `prefers-reduced-motion` rule retained from Phase 1; new CSS does not introduce new animations.
- Keyboard navigation: tab order is logical (skip → nav → main → footer); all interactive elements (buttons, anchors, expandable details) are keyboard-operable by default. No custom focus traps introduced.

---

## 4. Performance + accessibility audit

### 4.1 JS bundle
- `_tool-shared.js` — 84 lines (unchanged, Phase 1).
- `lib/asn1.js` — 308 lines (Phase 2).
- `lib/x509.js` — 410 lines (Phase 2).
- `lib/cbor.js` — 210 lines (Phase 4 NEW).
- `lib/base64url.js` — 45 lines (Phase 4 NEW).
- `lib/aaguid-dict.js` — 80 lines (Phase 4 NEW).
- Per-tool JS — 80–250 lines.

Total client-side JS shipped per page: ≤ 700 lines uncompressed. Tools that don't need a library don't load it (e.g. ISO 7816 CLA decoder loads only `_tool-shared.js`). No tree-shaking required because there's no bundler.

### 4.2 CSS
- `main.css` — ~1700 lines (was 1320 before Phase 4 additions).
- `tools.css` — 283 lines (unchanged).
- All new CSS is additive. No selectors removed; no breaking changes to existing pages.
- Specificity: stays low; selectors are class-based, no `!important` introduced.

### 4.3 Accessibility additions
- New `.docs-content` h2/h3/h4 carry visible `.anchor-link`s on hover, navigable via keyboard.
- `.ref-block` (`<details>` / `<summary>`) is keyboard-operable by default; we removed the disclosure marker for visual consistency but the spec-defined keyboard interaction remains.
- The `.docs-toc` is `position: sticky` — does not break with `position: static` fallback on older browsers.
- `<table class="spec-table">` retains semantic header markup.
- Skip-link unchanged.

### 4.4 Reduced-motion
- No new animations introduced. Hover transitions on cards remain disabled under `prefers-reduced-motion: reduce`.

### 4.5 Contrast
- All text on `--brand-soft` / white passes WCAG AA at 16px+ body size.
- The dark `.code-block` foreground (`#E6E6EA`) on background (`#14161A`) easily passes WCAG AAA.
- New color additions (`--secure-cyan-soft` background / `--secure-cyan-dark` text) verified at 11.5px (lower bound for tags) — passes WCAG AA.

---

## 5. Subdomain strategy

The Phase 4 prompt asks for preparation for cleaving:
- `docs.ambimat.com`
- `developer.ambimat.com`
- `fido.ambimat.com`
- `onepass.ambimat.com`

The strategy is to build the architectural boundaries now without splitting the live site. When we are ready to split, we move directories to subdomains and add 301s — the content does not need to change.

### 5.1 Migration boundaries (clean cleavage points)

| Subdomain | Migrates from | Content |
|---|---|---|
| `docs.ambimat.com` | `/resources/webauthn/` (and future `/resources/<X>/`) | Long-form developer documentation. The `.docs-shell` layout pattern is the seed. |
| `developer.ambimat.com` | `/resources/tools/*` | All client-side utilities. The 27 existing Phase 1-4 tools move wholesale. |
| `fido.ambimat.com` | `/technologies/webauthn/`, `/technologies/fido2/`, `/technologies/passkeys/`, `/technologies/attestation/`, `/technologies/ctap2/`, `/technologies/fido/`, `/products/onepass-card/`, `/products/onepass-usb-key/`, `/products/onepass-platform/`, `/solutions/passwordless-*`, `/solutions/phishing-resistant-*` | The complete FIDO/WebAuthn vertical. |
| `onepass.ambimat.com` | `/products/onepass-platform/`, `/products/onepass-card/`, `/products/onepass-usb-key/` | OnePass marketing front; cross-links into `fido.ambimat.com` for technology depth. |

### 5.2 Shared asset strategy

When we split, the shared CSS / JS / images need to live somewhere both the apex (`ambisecure.ambimat.com`) and the subdomains can reference. The right pattern is a CDN-served shared bucket:

- **Option A (recommended): Hostinger object storage at `static.ambimat.com/`.** All sites reference `https://static.ambimat.com/css/main.css`, `https://static.ambimat.com/js/lib/cbor.js`, etc. CORS is permissive (read-only, no credentials).
- **Option B: per-subdomain copy.** Each subdomain ships its own copy of `main.css`, `tools.css`, library JS. Simpler ops; risk of drift.

We recommend Option A. The existing `/assets/` directory is already structured as if it were a static-served bucket (no server-side templating, just files referenced by absolute path). Migration: copy the entire `/assets/` tree to the static bucket, change `<link>` and `<script>` URLs, deploy.

### 5.3 Shared CSS strategy

`assets/css/main.css` remains the single source of truth for the design system. Adopt one of:

- **A. Same file, multiple subdomains.** Each subdomain references `https://static.ambimat.com/css/main.css`. Updates propagate everywhere immediately.
- **B. Versioned URLs.** Reference `https://static.ambimat.com/css/main.v4.css`. Allows independent rollouts per subdomain.

We recommend (A) for simplicity until the subdomains diverge enough to warrant version pinning. Tools-specific CSS (`tools.css`) stays in the developer subdomain only.

### 5.4 Canonical strategy

When pages move to a subdomain, the canonical tag must follow:
- Old URL `https://ambisecure.ambimat.com/technologies/webauthn/` redirects to `https://fido.ambimat.com/technologies/webauthn/` (301).
- The new page's canonical: `<link rel="canonical" href="https://fido.ambimat.com/technologies/webauthn/" />`.
- If we want "best of both worlds" during migration, keep the apex page live with `<link rel="canonical">` pointing to the subdomain — Google de-duplicates correctly.

### 5.5 Cross-domain linking strategy

When subdomains exist, internal links from the apex to a subdomain become absolute URLs:
- `<a href="/technologies/webauthn/">` becomes `<a href="https://fido.ambimat.com/technologies/webauthn/">`.
- Subdomain-to-apex same shape.
- Subdomain-to-subdomain (e.g. `fido.ambimat.com/products/onepass-card/` linking to `developer.ambimat.com/resources/tools/cbor-decoder/`) is normal cross-origin.

The site already uses absolute paths (`/technologies/webauthn/`) which are subdomain-relative — when the subdomain URL is the same domain, the path resolves correctly. The migration step adds host prefix to cross-subdomain links. A small refactor: add a `BASE_URL` substitution to the page generators so internal links can be either path-relative (current) or host-absolute (post-migration).

### 5.6 SEO migration plan (when we split)

For the eventual split:
1. Pick one subdomain to migrate first (`developer.ambimat.com`, the lowest-stakes).
2. Stand up the new subdomain. Verify in Google Search Console.
3. Set up 301 redirects from old URLs to new, in `.htaccess`.
4. Update sitemap on the new subdomain; submit to Google Search Console.
5. Monitor index health for 30 days.
6. Repeat per subdomain.

The `.htaccess` already in place at the apex handles the legacy WordPress URL 301 map; extending it for the subdomain split is straightforward.

### 5.7 What we are NOT doing in Phase 4

- No DNS changes.
- No new subdomains created.
- No URL changes.
- No content moved.
- The site remains a single domain for now.

We have the boundaries; we do not split. Future Phase 5+ can pick a subdomain and pull the trigger.

---

## 6. Deferred / backlog

### P1 (high value, blocks meaningful gaps)
- **FIDO Metadata Explorer.** Requires server-side MDS BLOB validation + a UX for browsing metadata entries. Reasonable as a Phase 5 deliverable.
- **Passkey Flow Visualizer.** Interactive registration/authentication flow with state diagrams. Beyond Phase 4 CSS scope — would benefit from minimal SVG state-machine library.
- **Hybrid transport diagrams.** Visual depiction of caBLE / cross-device authentication. Could be added to passkeys page in a focused Phase 5 expansion.

### P2 (useful, not blocking)
- **APDU Script Runner.** Offline simulator that takes a sequence of APDU commands and walks the response. Educational only.
- **JavaCard CAP Structure Explorer.** Decode CAP file components.
- **Secure Messaging Visualizer.** Beyond what the SCP03 walkthrough already covers; potential new tool.
- **EMV transaction-flow blog post.** Cornerstone in EMV cluster.
- **OnePass Bio Card detail page.** Dedicated product page for the bio-card variant.

### P3 (long tail)
- **OG image templates** for blog / technology pages.
- **PWA manifest** for offline tool use.
- **Analytics integration** (privacy-first; e.g. Plausible).
- **More AAGUID entries** in the offline directory as we identify well-known authenticators worth bundling.

---

## 7. Test results

### 7.1 JS syntax
All 17 new JS files pass JXA `new Function(...)` syntax checking:
- `lib/cbor.js`, `lib/base64url.js`, `lib/aaguid-dict.js`
- `tools/cbor-decoder.js`, `tools/cose-key.js`, `tools/aaguid-lookup.js`
- `tools/clientdata-decoder.js`, `tools/authdata-parser.js`, `tools/attestation-decoder.js`
- `tools/rp-id-validator.js`, `tools/base64url.js`, `tools/credential-id-inspector.js`
- `tools/challenge-viewer.js`, `tools/iso7816-cla.js`, `tools/ber-length.js`
- `tools/emv-tag-dict.js`, `tools/key-diversification.js`

### 7.2 Sitemap well-formedness
112 URLs. Valid XML. All Phase 4 routes present.

### 7.3 Page count
- Phase 1: 23 routes
- Phase 2: 30 routes (cumulative ~53)
- Phase 3: 21 routes (cumulative ~74)
- Phase 4: 24 new routes (cumulative ~98 indexed; 112 with priority-listed)

### 7.4 Word counts (cornerstone blogs, all >3000)
Verified above in §1.8.

---

## 8. Recommended Phase 5 priorities (no decision yet)

If the project continues, the natural next phases:
- **Phase 5a — FIDO depth completion.** Metadata Explorer, Passkey Flow Visualizer, hybrid transport diagrams, OnePass Bio Card detail.
- **Phase 5b — Subdomain split.** Pick `developer.ambimat.com` as the first cleavage. Move `/resources/tools/*` wholesale.
- **Phase 5c — Documentation portal expansion.** Add API reference templates, code-example template, changelog template, release-note template (Phase 4 surfaced these as patterns; Phase 5 builds out the population).
- **Phase 5d — Cluster pillar blogs.** Six pillars deferred from Phase 3 (Secure Elements, JavaCard, Crypto primitives, IoT root of trust, eSIM RSP, Secure personalization) remain.
- **Phase 5e — Performance + analytics.** Plausible-style privacy-first analytics; PWA manifest for offline tool use.

None of these are required by the current spec; they are the natural roadmap.

---

**End of Phase 4 audit.**
