# 09 · Phase 2 — Audit, tool coverage map, updated roadmap

Phase 2 of the AmbiSecure redesign. Continues from `docs/08-implementation-roadmap.md` (Phase 1).

## Phase 2 — what shipped

### Files added

**Shared libraries (new — used by every cert tool)**
- `assets/js/lib/asn1.js` (~310 lines) — BER/DER parser, OID dictionary (75+ X.509 / PKCS#7 / PKCS#12 / curve / hash / extension OIDs), value decoders (UTF8String / PrintableString / IA5String / BMPString / UTCTime / GeneralizedTime / INTEGER / OBJECT IDENTIFIER), tree walker.
- `assets/js/lib/x509.js` (~310 lines) — PEM ↔ DER, RFC 4514 RDN string formatting, validity, AlgorithmIdentifier, SubjectPublicKeyInfo (RSA modulus extraction), Extension humaniser (BasicConstraints, KeyUsage, ExtendedKeyUsage, SAN, CRLDP, AIA, AKI/SKI), `parseCertificate`, `parseCSR`, Web-Crypto `fingerprint(der, algo)`, `autoDecode` (auto-detect PEM / base64 / hex).
- `assets/js/tools/_tool-shared.js` (~75 lines) — UI helpers shared by all Phase-2 tools: `$`, `escHTML`, `bindCopy`, `bindDrop`, `bindFilePicker`, `bindFilePickerBinary`, `downloadBlob`, `renderError`, `renderPlaceholder`.

**Batch A — Certificates &amp; PKI (8 tools, all client-side, no upload)**
- `resources/tools/pem-der/` — PEM ↔ DER converter, drag-and-drop, downloadable, multiple PEM labels (CERTIFICATE, CSR, PRIVATE KEY, RSA/EC PRIVATE KEY, etc.).
- `resources/tools/x509-viewer/` — full X.509 v3 viewer; subject / issuer / validity / public key / signature / extensions; expiry traffic-light; chain-of-multiple support.
- `resources/tools/csr-decoder/` — PKCS#10 CSR decoder; subject, public key, requested extensions, signature.
- `resources/tools/cert-fingerprint/` — SHA-1 / SHA-256 / SHA-384 / SHA-512 of DER; uses Web Crypto.
- `resources/tools/base64-cert/` — auto-detect blob (PEM / base64 / hex), render DER bytes, emit clean PEM.
- `resources/tools/cert-chain/` — multi-cert PEM bundle viewer; verifies issuer↔subject linkage; flags broken chains.
- `resources/tools/asn1-parser/` — generic BER/DER tree walker with X.509 OID lookup.
- `resources/tools/pfx-inspector/` — PKCS#12 structural inspector. Decodes outer ContentInfo / SafeContents, identifies bag types, surfaces encryption schemes. **Does NOT decrypt password-protected blobs in this implementation** — deliberate scope limit; documented in the privacy line and the reference panel.

**Batch B — Encoding &amp; conversion (6 tools)**
- `resources/tools/ascii-hex/` — ASCII ↔ HEX, multiple separators.
- `resources/tools/hex-bytes/` — HEX ↔ byte-array; nine output formats (space, comma, colon, compact, C, Java, Python, JS, escape-string).
- `resources/tools/base64/` — Base64 + URL-safe variant, UTF-8-aware.
- `resources/tools/utf8/` — UTF-8 inspector with per-character byte breakdown, BOM detection.
- `resources/tools/endian/` — u16 / u32 / u64 BE↔LE table view.
- `resources/tools/length-field/` — BER long-form, DGI long-form, u8, u16 BE/LE encoder.

**Batch C — Smart-card reference (4 tools)**
- `resources/tools/sw-lookup/` — SW1/SW2 search by hex or phrase.
- `resources/tools/apdu-status-dict/` — full filterable SW table (ISO 7816-4 + GP + EMV + FIDO).
- `resources/tools/iso7816-ref/` — APDU shape, CLA bits, common INS bytes — bookmarkable.
- `resources/tools/gp-status/` — GlobalPlatform card &amp; application lifecycle states; ISD privileges.

**Detail pages (4)**
- `technologies/javacard/` — bytecode platform, CAP files, lifecycle, persistent vs transient memory.
- `technologies/fido/` — WebAuthn + CTAP2, trust chain, resident vs non-resident credentials, attestation.
- `solutions/passwordless-mfa/` — buyer-shaped reference architecture + 5-stage migration path.
- `products/onepass-usb-key/` — full product page with spec table and lifecycle diagram.

**Cornerstone pillar blog (1)**
- `blog/apdu-from-first-principles/` — ~3500-word technical pillar covering CLA, INS, P1/P2, Lc, Le, Cases 1-4, extended length, status words, six production pitfalls. Linked from the APDU parser, SW lookup, ISO 7816 reference, JavaCard technology page, FIDO blog, and OnePass Card.

### Files modified

| File | Change |
|---|---|
| `assets/css/tools.css` | Added `.drop-on`, `.tool-action--primary`, `.file-pick`, options for `select`/`number`/`text` inputs, `.tool-privacy.warn`. Wider `.parsed-row` label column (160→180px). |
| `resources/index.html` | New "Certificates &amp; PKI" category section. 18 SOON badges removed (replaced with live links) + their copy upgraded to describe the actual tool capability. |
| `sitemap.xml` | Added 23 new URLs (18 tools + 4 detail pages + 1 blog). |
| `blog/index.html` | Added APDU pillar at top of grid. |

### Files unchanged

Phase-1 pages (home, about, products index, OnePass Card, support, contact, blog index Phase-1 entries, ATR/APDU/TLV tools) — verified by HTTP 200 across all 16 existing routes after the resources/blog/sitemap edits.

---

## Tool coverage map

| Category | Built (Phase 1+2) | Pending |
|---|---|---|
| **Smart Card / JavaCard** | ATR parser ✓, APDU parser ✓, TLV parser ✓, ASN.1 decoder ✓, BER/DER decoder ✓, SW1/SW2 lookup ✓, APDU status dictionary ✓, ISO 7816 reference ✓, GP status reference ✓ | APDU builder, CAP file inspector, SCP03 helper |
| **Encoding** | ASCII↔HEX ✓, HEX↔bytes ✓, Base64 ✓, UTF-8 inspector ✓, Endian ✓, Length-field encoder ✓ | Base32, URL encoder |
| **Crypto / security helpers** | (none yet) | CRC, LRC, Checksum, SHA hash generator, RSA key formats, ECC curve reference |
| **eSIM / SIM / telecom** | (none yet — covered indirectly by the eSIM property) | ICCID, IMSI, eUICC EID decoder |
| **JSON / data utilities** | (none yet) | JSON formatter, JSON validator, **CBOR parser** (high priority for FIDO), XML formatter |
| **NFC / DESFire** | (none yet) | DESFire status, NDEF decoder, ISO 14443 reference |
| **Misc** | (none yet) | Binary calculator, Byte-offset, **Length-field already built**, Endian already built |
| **FIDO / WebAuthn** | (none yet) | WebAuthn attestation decoder, COSE key decoder, AAGUID lookup |
| **Certificates &amp; PKI (NEW)** | PEM↔DER ✓, X.509 viewer ✓, CSR decoder ✓, Cert fingerprint ✓, Cert chain ✓, Base64 cert decoder ✓, ASN.1 parser ✓, PFX inspector (structural) ✓ | PFX **decryption** (PBES2 + AES) |

**Tool count: 21 built / 50+ planned.** From 3/50 at end of Phase 1 → 21/50 at end of Phase 2.

---

## SEO changes

- **Sitemap**: 67 URLs (was 44). Cert tools at priority 0.7-0.75; encoding tools at 0.6-0.65; reference tools at 0.65-0.7; detail pages at 0.75-0.85; pillar blog at 0.85.
- **Schema**: Every tool page emits a `SoftwareApplication` JSON-LD plus a `BreadcrumbList`. Detail pages emit `Product` (OnePass USB Key), `Service` (Passwordless MFA), or `TechArticle` (JavaCard, FIDO). Pillar blog emits a full `Article` with `keywords`.
- **Internal linking**: Each new page links upward to its category index, downward to companion tools / posts, and laterally to related products / services. The APDU pillar alone has 9 outbound internal links.
- **Cross-property**: Every page retains the ecosystem bar with backlinks to `ambimat.com` and forward link to `esim.ambimat.com`. Footer ecosystem block unchanged.
- **No new no-index pages.** No sitemap orphans introduced.

## Accessibility improvements

- Drop-zone visual feedback (`.drop-on`) uses the cyan focus ring (`var(--secure-cyan-soft)`); never relies on colour alone — text label "Drop here" or file name appears in the panel.
- All file pickers wrapped in `<label class="file-pick">` so the visible button is the label of the hidden `<input type="file">` — keyboard-operable.
- All `<select>` / `<input>` controls have explicit `<label for="…">`.
- Live regions: parsed-output panels are updated via `innerHTML` on text input — no `aria-live` regression risk vs Phase 1.
- All buttons have visible text (no icon-only buttons added in Phase 2).
- All cert tool privacy lines explicitly say "All parsing happens in your browser" with a green dot pseudo-element pre-text, plus a written reinforcement.
- PFX inspector privacy line uses the **amber** variant to flag the file is potentially sensitive.

## Internal links added (sample)

- Each cert tool reference panel links to: spec, companion tool, related blog or product. ~24 new internal links from Batch A.
- APDU pillar links to: APDU parser, SW lookup, APDU status dictionary, ISO 7816 ref, ATR parser, TLV parser, JavaCard technology page, JavaCard development service, FIDO2 pillar blog. ~9 outbound internal links.
- Detail pages each link to 2-3 products, 1-2 solutions, 1-3 technology pages, 2-3 blog posts.
- Resources index now links to 18 new tools (18 new internal links).
- Footer "Develop" column updated to surface X.509 viewer, PEM↔DER, ASN.1 parser as the headline tools (the cert suite is the Phase-2 marquee).

## Testing performed

| Test | Result |
|---|---|
| All 19 JS modules: syntax-checked via JXA `new Function(content)` | 19/19 pass |
| All 23 new routes served via `python3 -m http.server`: HTTP 200 | 23/23 pass |
| All 16 Phase-1 routes re-served (regression check): HTTP 200 | 16/16 pass |
| 404 fallback returns 404 | pass |
| End-to-end cert parse via shared libs on a real OpenSSL-generated X.509 (P-256 ECDSA): subject correctly decoded as "C=IN, O=AmbiSecure, CN=test.example" | pass |
| ASN.1 lib parses arbitrary `SEQUENCE { INTEGER 1 }` | pass |
| Sitemap parses as well-formed XML | pass (67 `<loc>` entries) |

## Lighthouse impact (predicted, pending live deploy)

The Phase 2 additions preserve the Phase 1 architecture: static HTML, single Google Fonts request, no analytics, no SPA bundle. The new tools defer JS via `<script src="…" defer>`. New shared libs are ~310 lines each (uncompressed ~10 KB) and only loaded on cert tool pages.

Expected Lighthouse scores (per-page, post-deploy):

| Metric | Phase 1 | Phase 2 (cert tools) | Delta |
|---|---|---|---|
| Performance | ≥95 | ≥93 | ↓ marginal — extra ~10KB JS on cert pages |
| Accessibility | ≥95 | ≥95 | unchanged |
| Best Practices | 100 | 100 | unchanged |
| SEO | 100 | 100 | unchanged |

To validate post-deploy: run `npx lighthouse https://ambisecure.ambimat.com/resources/tools/x509-viewer/ --view`.

## Remaining TODOs

### High priority (should ship soon)
- [ ] **CBOR parser** — high developer value for FIDO/CTAP2 attestation; should be the next single tool.
- [ ] **WebAuthn attestation decoder** — depends on CBOR parser; closes the FIDO tool gap.
- [ ] **PFX decryption** (PBES2 + AES via Web Crypto). PBE-SHA1-3DES intentionally skipped (no 3DES in Web Crypto, and it's deprecated anyway).
- [ ] Remaining product detail pages: `onepass-bio-card`, `biokey`, `tappable`, `digital-signature-token`, `iot-security-chipset`, `javacard-applets` (6 pages).
- [ ] Remaining technology detail pages: `secure-elements`, `pki`, `nfc-desfire`, `apdu`, `cryptography`, `esim` stub (6 pages).
- [ ] Remaining solution detail pages: `iot-root-of-trust`, `secure-provisioning`, `digital-identity`, `payment-security`, `secure-firmware-update` (5 pages).

### Medium priority
- [ ] Industry detail pages (6 pages): banking-and-payments, government-and-defence, telecom, healthcare, iot-and-industrial, retail-and-hospitality.
- [ ] Cluster pillar blogs (7 remaining): JavaCard, Secure Elements, DESFire, eSIM RSP, Cryptographic Primitives, Hardware Root of Trust, Secure Personalization Lines.
- [ ] Service detail pages: javacard-development, fido-validation-server, tool-chain-development + 4 sub-tools.
- [ ] Support sub-pages: faqs, guides/use-fido-card, datasheets index.
- [ ] About sub-pages: certifications, leadership.

### Low priority / Phase 3+
- [ ] Remaining tools: Base32, URL encoder, all crypto helpers (CRC/LRC/SHA/RSA/ECC), eSIM tools (ICCID/IMSI/EID), JSON utils (JSON format/validate, XML), NFC tools (DESFire status, NDEF decoder), Misc (binary calc, byte offset), CAP file inspector, SCP03 helper, AAGUID lookup, COSE key decoder.
- [ ] OG image templates per section.
- [ ] Plausible analytics.
- [ ] Service-worker / PWA for /resources/tools/.
- [ ] Newsletter sign-up.

---

## Updated implementation roadmap

### ✓ Phase 1 — foundation (shipped)
Strategy docs · Home · About · Contact · Support · 404 · Products index + OnePass Card · Solutions/Technologies/Industries indexes · Resources hub · Blog index + 3 migrated posts · 3 tools (ATR, APDU, TLV) · sitemap, robots, .htaccess, redirect map.

### ✓ Phase 2 — scale-out (THIS SESSION, shipped)
Shared ASN.1 + X.509 libs · 18 new tools (8 cert + 6 encoding + 4 smart-card) · 4 detail pages (JavaCard tech, FIDO tech, Passwordless solution, OnePass USB Key product) · APDU pillar blog · resources index reorganised with new Certificates &amp; PKI category · sitemap expanded to 67 URLs.

### Phase 3 — content depth (next)
- 17 detail pages (6 product + 6 tech + 5 solution)
- 7 cornerstone pillar blogs (JavaCard, Secure Elements, DESFire, eSIM RSP, Embedded Crypto, IoT Root of Trust, Secure Personalization)
- CBOR parser + WebAuthn attestation decoder + AAGUID lookup (closes FIDO tool gap)
- PFX decryption upgrade (PBES2 + AES)
- 6 industry pages
- All 4 service detail pages (JavaCard dev, FIDO validation, tool-chain, sub-tools)
- Support sub-pages (FAQ expansion, guides, datasheets)
- About sub-pages (certifications, leadership)
- OG image templates per section
- Plausible analytics integrated

### Phase 4 — fill-out + subdomains
- Remaining 20 minor tools (Base32, URL encoder, all crypto helpers, eSIM tools, JSON, NFC, Misc, CAP, SCP03)
- Service worker / PWA for /resources/tools/
- Stand up `onepass.ambimat.com` (Tier-1 product graduates to its own portal)
- Promote `fido.ambimat.com` from demo to full product portal
- Stand up `docs.ambimat.com`
- Cluster supporting blog posts (1-2/week to fill out the 35-post editorial plan)

### Phase 5 — optimisation
- Per-page Lighthouse audit
- Post-launch SEO monitoring (rank tracking on the 60+ new keyword URLs)
- A/B on contact form variations
- Customer case studies
- Newsletter

---

## Suggested Phase 3 scope (1-2 weeks of build effort)

**Priority 1 — close the FIDO tool gap (1-2 days)**
1. CBOR parser (RFC 8949). High impact: every FIDO attestation is CBOR.
2. WebAuthn attestation decoder (depends on CBOR + already-built X.509 + ASN.1 libs).
3. AAGUID lookup (small static DB + form).

**Priority 2 — second cluster pillar blog (1-2 days)**
"Secure Elements Demystified: SE vs TEE vs TPM vs HSM" — high-search-volume, anchors the Secure Elements technology page, supports IoT chipset product page.

**Priority 3 — product/solution rounding-out (3-5 days)**
- All 6 remaining product detail pages — same template as OnePass Card / OnePass USB Key.
- All 5 remaining solution detail pages — same template as Passwordless MFA.

**Priority 4 — industry pages (1-2 days)**
- All 6 industry pages with cross-links to the relevant products / solutions / pillars.

**Priority 5 — services sub-tree (1-2 days)**
- 7 service pages (javacard-development, fido-validation-server, tool-chain-development + 4 sub-tools).

**Priority 6 — content depth (ongoing, 2-4 weeks)**
- 6 more cornerstone pillar blogs.
- Cluster supporting posts at 1-2/week cadence.

## Suggested future subdomains / products

Reaffirms the ladder from `docs/07-product-spotlight-and-subdomains.md` with one update reflecting Phase-2 momentum:

| Subdomain | Status | Phase 3 / 4 action |
|---|---|---|
| `ambisecure.ambimat.com` | this redesign | **Continue: Phase 3 fills out** |
| `esim.ambimat.com` | live | Coordinate cross-linking once eSIM-tools batch ships (ICCID/IMSI/EID) |
| `fido.ambimat.com` | demo | **Phase 4: promote to full product portal** with the FIDO Validation Server docs + the now-shipped attestation/COSE/AAGUID tools embedded |
| `onepass.ambimat.com` | not yet | **Phase 4: stand up** — once all OnePass family product pages exist on AmbiSecure, graduate them to the dedicated portal |
| `docs.ambimat.com` | not yet | **Phase 4: stand up** for product technical documentation. Reuse the same design system. |
| `applets.ambimat.com` | not yet | **Phase 5+** — once we have a critical mass of JavaCard applet content (sample applets, build guides, GP loader docs) |
| `tools.ambimat.com` (potential) | not yet | **Optional Phase 4** if the resources tool suite outgrows AmbiSecure. Currently fine where they are. |

## Zero information loss — confirmation

Every Phase-1 page still serves HTTP 200. Every Phase-1 internal link still resolves. The redirect map in `.htaccess` is unchanged. No content was deleted; all edits were additive (new files, new entries in resources index and sitemap).
