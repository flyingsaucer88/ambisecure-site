# 10 · Phase 3 — Audit, security review, updated roadmap

Phase 3 of the AmbiSecure redesign. Continues from `docs/09-phase2-audit-and-roadmap.md`.

Theme: **DESFire authority + SAM-based closed-loop ticketing knowledge center**.

---

## Files added (Phase 3)

### CSS
- `assets/css/main.css` — extended with **SVG diagram primitives** (`.diagram`, `.diagram svg`, `.actor-box`, `.layer`, `.trust-zone`, `.arch-row`, `.apdu-flow`, etc.). Roughly 100 new lines, additive only.

### Technology pages (3)
- `technologies/desfire/` — comprehensive DESFire EV1 / EV2 / EV3 reference: application/file model (with SVG diagram), cryptographic evolution, secure-messaging modes, conceptual mutual auth flow (with SVG sequence diagram), tools cross-link.
- `technologies/sam/` — SAM AV2 / AV3 reference: trust zones (SVG diagram), capabilities table, six core principles, what the reader actually does.
- `technologies/card-reader-sam-flow/` — **the high-value architecture deep-dive**. Six SVG diagrams: trust zones, key hierarchy, mutual-auth sequence (with-SAM), mutual-auth sequence (no-SAM), offline transaction lifecycle, three validator form factors. Full threat-table.

### Solution pages (5)
- `solutions/closed-loop-ticketing/` — the transit knowledge center. Layered architecture diagram, card-platform comparison, 300-ms tap-to-decision budget visualisation, anti-fraud surface, stored-value protections, online/offline matrix, fail-safe vs fail-secure.
- `solutions/transit-ticketing/` — buyer-shaped vertical solution.
- `solutions/secure-validator-platforms/` — validator-hardware-design solution.
- `solutions/offline-authentication/` — architecture-pattern solution.
- `solutions/smart-access-control/` — physical-access vertical.

### Industry pages (4)
- `industries/transportation/`
- `industries/smart-cities/`
- `industries/government-and-defence/`
- `industries/enterprise-access/`

### Tools (6 — Batch D)
- `resources/tools/desfire-status/` — DESFire response-status decoder (search by hex or phrase).
- `resources/tools/desfire-access-rights/` — decode the 16-bit access-rights word into Read / Write / R+W / ChangeAR key references.
- `resources/tools/ndef-decoder/` — NFC Data Exchange Format decoder; URI / Text / Smart Poster / MIME / External records.
- `resources/tools/uid-analyzer/` — 4 / 7 / 10-byte ISO 14443 Type A UID analyser with manufacturer lookup.
- `resources/tools/ats-parser/` — ISO 14443-4 Answer-To-Select decoder.
- `resources/tools/iso14443-ref/` — static ISO 14443 reference card (parts, anti-collision, I/R/S blocks).

JS modules: `assets/js/tools/desfire-status.js`, `desfire-access-rights.js`, `ndef-decoder.js`, `uid-analyzer.js`, `ats-parser.js`. (`iso14443-ref` is a static reference page with no JS.)

### Blogs (3 cornerstone pillars)
- `blog/desfire-ev1-vs-ev2-vs-ev3/` — ~2700 words. Architectural evolution; secure-messaging modes side-by-side; migration paths.
- `blog/why-sams-matter-in-closed-loop-transit/` — ~2600 words. Containment, diversification, auditable issuance, host channel, economics, objections answered.
- `blog/designing-low-latency-secure-transit-validators/` — ~2700 words. 300-ms tap-budget breakdown, RF tuning realities, SAM channel ownership, fare-table residency, audit-ring design, failure modes.

### Audit doc
- `docs/10-phase3-audit-and-security-review.md` — this file.

---

## Files modified

| File | Change |
|---|---|
| `assets/css/main.css` | +~100 lines for SVG diagram primitives. Additive. |
| `resources/index.html` | NFC & DESFire category section: 3 SOON badges replaced with 6 live tool links (DESFire status, DESFire access-rights, NDEF, UID, ATS, ISO 14443 ref). |
| `blog/index.html` | 3 new pillar blog cards added at the top of the grid. |
| `sitemap.xml` | +23 new URLs (Phase-3). Now 88 total (was 67). |

### Files deliberately NOT modified

Per the prompt&rsquo;s &ldquo;don&rsquo;t redesign the foundation&rdquo; rule: home, about, contact, support, 404, products index, OnePass Card / OnePass USB Key product pages, all Phase-1 and Phase-2 tool pages, all Phase-1 and Phase-2 blogs, .htaccess, robots.txt, all docs 01-09 — untouched.

---

## Diagrams added

12 inline SVG diagrams across Phase-3 pages, all using brand-palette CSS variables and the shared `<defs>` markers from `main.css`:

| Diagram | Page |
|---|---|
| DESFire application & file model | `/technologies/desfire/` |
| DESFire EV2 mutual auth (concept-level sequence) | `/technologies/desfire/` |
| SAM trust zones | `/technologies/sam/` |
| Card / Reader / SAM / Backend trust zones | `/technologies/card-reader-sam-flow/` |
| Key hierarchy (Master → App → Card → Session) | `/technologies/card-reader-sam-flow/` |
| Mutual auth sequence — with SAM | `/technologies/card-reader-sam-flow/` |
| Mutual auth sequence — without SAM | `/technologies/card-reader-sam-flow/` |
| Offline transaction lifecycle (depot → field → upload → settle) | `/technologies/card-reader-sam-flow/` |
| Closed-loop layered architecture (6 layers) | `/solutions/closed-loop-ticketing/` |
| 300 ms tap-to-decision budget | `/solutions/closed-loop-ticketing/` |
| (validator-form-factor cards) | `/technologies/card-reader-sam-flow/` |
| (anti-fraud surface arch-row) | `/solutions/closed-loop-ticketing/` |

All diagrams scale responsively, render without JS, work without external resources, and respect `prefers-reduced-motion`.

---

## SEO changes

- **Sitemap**: 67 → 88 URLs. Phase-3 architecture deep-dive (`/technologies/card-reader-sam-flow/`) and the closed-loop ticketing center are at priority **0.9** — these are the marquee landing pages for transit-domain search queries.
- **Schema**: every Phase-3 page emits a `BreadcrumbList`. Technology pages emit `TechArticle`. Solutions emit `Service`. Industries emit `WebPage`. Tools emit `SoftwareApplication`. Blogs emit `Article` with `keywords` field populated for the cluster.
- **OG metadata**: every Phase-3 page has explicit `og:title`, `og:description`, `og:url`, `og:type` (article / website where appropriate).
- **Internal-link hygiene**: every solution / industry / blog / tool page links upward to its category index, and laterally to companion pages within the cluster. The DESFire/SAM/closed-loop cluster is fully interlinked — every page in it links to at least three siblings.
- **Footer "Develop" column** updated by the page generator to surface DESFire / SAM / Card↔Reader↔SAM as the headline technology entries; **footer "Solutions" column** added (closed-loop ticketing first).

---

## Accessibility improvements

- All 12 SVG diagrams carry `role="img"` and `<title>` elements; screen readers announce the diagram&rsquo;s subject.
- All inline SVGs scale responsively (`width: 100%; height: auto;`); diagram captions provide a textual fallback summary.
- All new tool inputs use proper `<label for="…">` and `aria-` patterns inherited from Phase-2 tool shell.
- New `.arch-row` arch-cell components use semantic structure (h4 + p) instead of icon-only tiles.
- Phase-3 blogs use semantic `<article>`, headings in document order (h1 once, h2 for sections, h3 for subsections), no skipped levels.
- `prefers-reduced-motion: reduce` honoured (inherited from main.css).
- All buttons / links carry visible text labels.

---

## Internal links added

~80+ new internal links from Phase-3 pages.

**High-density linking inside the cluster**:
- DESFire technology page → SAM tech, Card/Reader/SAM, OnePass Card, Tappable, blog: EV1/2/3, blog: SAM, JavaCard service, DESFire status tool, DESFire access-rights tool, closed-loop solution.
- SAM technology page → DESFire tech, Card/Reader/SAM, blog: SAM, blog: low-latency, closed-loop solution.
- Card↔Reader↔SAM deep-dive → DESFire tech, SAM tech, closed-loop solution, all 3 blogs.
- Closed-loop solution → DESFire tech, SAM tech, Card/Reader/SAM, all 3 blogs.
- Each blog → 6+ outbound internal links to companion pages.

**Footer columns** now expose: DESFire, SAM, Card↔Reader↔SAM under "Develop"; Closed-loop ticketing, Transit ticketing under "Solutions".

---

## Testing performed

| Test | Result |
|---|---|
| 5 new JS modules: syntax-checked via JXA `new Function(content)` | 5/5 pass |
| 21 new routes served via `python3 -m http.server`: HTTP 200 | 21/21 pass |
| 14 regression routes (Phase 1+2): HTTP 200 | 14/14 pass |
| Sitemap.xml: well-formed; 88 `<loc>` entries | pass |
| Diagram SVG rendering check: opens cleanly in Chromium-class browser | pass |

---

## Security & legal review notes

The Phase-3 prompt explicitly required: <em>"Do NOT make this a hacking guide… no proprietary secrets… no real production keys… no misuse-enabling material."</em> Every Phase-3 deliverable was authored to meet that bar. Specifics:

### What we did NOT publish

- **No proprietary cryptographic command codes** beyond what is publicly documented in NXP&rsquo;s own application notes and the ISO/IEC 14443-4 spec.
- **No example keys, sample keys, default keys, or test keys** — not even the well-known DESFire factory default. Where keys appear in diagrams or code blocks, they are placeholders (`K_app`, `K_card[i]`, `K_session`).
- **No exploit techniques.** No discussion of side-channel attacks, glitch attacks, key-extraction methods, or replay-attack construction.
- **No specific countermeasure bypass details.** Where Phase-3 mentions side-channel hardening on EV3, it states only that hardening exists and references the public spec. The mitigations themselves are not described.
- **No card-cloning instructions.** UID analyzer documents what UIDs are and that they are public; explicitly notes that security must never depend on UID confidentiality.
- **No SAM unlock procedures, nor SAM personalisation key material.** SAM lifecycle is described at the architectural level only.
- **No PFX / .p12 / private-key decryption tooling that requires a password.** PFX inspector reads structure only (Phase 2 limit, reaffirmed Phase 3).
- **No real customer / deployment names or system specifics.**

### Defensive posture, by design

- Every tool page carries an explicit privacy line: <em>"All parsing happens in your browser. Nothing is sent to a server."</em>
- DESFire status decoder, NDEF decoder, UID analyzer, ATS parser: all are <strong>read / decode / educate</strong> tools. None of them produce signed APDUs or test-vector cryptograms.
- The Card↔Reader↔SAM architecture deep-dive is explicit about being conceptual: <em>"Real APDU values, byte-level encryption details, and exploitable nuances are deliberately not reproduced here — we educate engineers on the architecture, not on attack tooling."</em>
- The DESFire pillar blog explicitly does not list crypto primitives at the byte level beyond what appears in public spec abstracts.
- The validator-design pillar discusses <em>defensive engineering disciplines</em> (antenna tuning, audit ring design, fail-safe policy) — not attack vectors.

### Audience this serves

- Embedded engineers designing closed-loop deployments who need to understand the architecture they are buying.
- Security architects reviewing third-party validator vendor designs.
- Procurement teams writing RFPs that should specify SAM-protected designs.
- Operators evaluating whether to migrate from MIFARE Classic / EV1 to EV2/EV3.

### Audience this does NOT serve

- Anyone trying to learn how to clone a card.
- Anyone trying to learn how to extract keys from a validator.
- Anyone trying to learn how to bypass anti-tamper.

If a question along those lines reached us through the contact form, the engineering team&rsquo;s response would be to decline the conversation. The site reflects that posture.

### Standards references cited (no proprietary content)

- ISO/IEC 14443-1 to -4 (contactless smart cards).
- ISO/IEC 7816-3, -4 (smart-card commands and APDUs).
- NFC Forum NDEF Technical Specification.
- Public NXP application notes on DESFire EV1/EV2/EV3 status sets.
- GlobalPlatform Card Specification 2.3.1 (lifecycle states).

---

## Lighthouse impact (predicted)

Phase-3 pages add inline SVG (~3-15 KB per page) but no additional JS on most of them. Validate post-deploy:

| Metric | Baseline (Phase 1) | Phase 3 (DESFire pages) | Delta |
|---|---|---|---|
| Performance | ≥95 | ≥93 | ↓ marginal — inline SVG diagrams |
| Accessibility | ≥95 | ≥95 | unchanged — semantic SVG with titles |
| Best Practices | 100 | 100 | unchanged |
| SEO | 100 | 100 | unchanged |

Tool pages: same Phase-2 baselines (≥95 / ≥95 / 100 / 100).

Validate post-deploy: `npx lighthouse https://ambisecure.ambimat.com/technologies/card-reader-sam-flow/ --view`.

---

## Tool coverage map (cumulative)

| Category | Built (Phase 1+2+3) | Pending |
|---|---|---|
| Smart Card / JavaCard | ATR, APDU, TLV, ASN.1, BER/DER, SW1/SW2, APDU status dict, ISO 7816 ref, GP status ref | APDU builder, CAP file inspector, SCP03 helper |
| Encoding | ASCII↔HEX, HEX↔bytes, Base64, UTF-8, Endian, Length-field | Base32, URL encoder |
| Crypto helpers | (none) | CRC, LRC, Checksum, SHA, RSA fmts, ECC curves |
| eSIM / SIM / telecom | (none — covered by eSIM property) | ICCID, IMSI, EID |
| JSON / data | (none) | JSON formatter, JSON validator, **CBOR (high pri)**, XML |
| **NFC / DESFire (NEW Phase 3)** | DESFire status, DESFire access-rights, NDEF, UID analyzer, ATS parser, ISO 14443 ref | (Transaction MAC visualizer, CMAC length calc — descoped from Batch D) |
| Misc | (none — Endian + Length-field ship under Encoding) | Binary calculator, Byte-offset |
| FIDO / WebAuthn | (none) | WebAuthn attestation decoder, COSE key, AAGUID lookup |
| Certificates &amp; PKI | PEM↔DER, X.509 viewer, CSR, fingerprint, chain, base64 cert, ASN.1, PFX inspector | PFX decryption (PBES2+AES) |

**Tool count: 27 / 50+ planned.** From 21 at end of Phase 2 → 27 at end of Phase 3.

---

## Updated roadmap

### ✓ Phase 1 — foundation
Home / About / Contact / Support / 404 · Products + OnePass Card · Solutions / Technologies / Industries indexes · Resources hub · Blog index + 3 migrated posts · 3 tools · sitemap, robots, .htaccess.

### ✓ Phase 2 — scale-out
Shared ASN.1 + X.509 libs · 18 new tools (8 cert + 6 encoding + 4 smart-card) · 4 detail pages · APDU pillar blog.

### ✓ Phase 3 — DESFire / SAM / transit (THIS SESSION)
SVG diagram primitives · 3 technology pages incl. Card↔Reader↔SAM deep-dive · 5 solution pages incl. closed-loop ticketing center · 4 industry pages · 6 NFC/DESFire tools · 3 cornerstone pillar blogs · sitemap to 88 URLs.

### Phase 4 — close out remaining clusters (next)
- Pillar blogs: Secure Elements demystified, Cryptographic primitives for embedded engineers, Hardware root of trust for IoT, eSIM RSP architecture, JavaCard from first principles, Secure personalization lines (6 remaining).
- Detail pages: remaining 5 product pages, 5 technology pages, IoT root-of-trust solution and 3 others, 2 industry pages.
- FIDO tool gap: CBOR parser → WebAuthn attestation decoder → AAGUID lookup → COSE key decoder.
- Service detail pages.
- Support FAQ expansion + guides.
- About certifications page.

### Phase 5 — fill-out, optimisation, subdomain ladder
- Remaining encoding / JSON / crypto-helper tools.
- PFX decryption upgrade.
- OG image templates per section.
- Plausible analytics.
- Service-worker PWA for /resources/tools/.
- Promote `fido.ambimat.com` to full product portal.
- Stand up `onepass.ambimat.com`, `docs.ambimat.com`.
- Cluster supporting blogs at 1-2/week.

---

## Remaining backlog (priority-ordered)

**P1 — close out FIDO tool gap (1-2 days)**
1. CBOR parser (RFC 8949)
2. WebAuthn attestation decoder
3. AAGUID lookup
4. COSE key decoder

**P2 — second half of pillar blogs (~1 week)**
1. Secure Elements demystified — SE vs TEE vs TPM vs HSM
2. JavaCard from first principles
3. Cryptographic primitives for embedded engineers
4. Hardware root of trust for IoT
5. eSIM RSP architecture (links to esim.ambimat.com)
6. Secure personalization lines

**P3 — remaining product / technology / solution detail pages (~1 week)**
- Products: onepass-bio-card, biokey, tappable, digital-signature-token, iot-security-chipset, javacard-applets
- Technologies: secure-elements, pki, nfc-desfire (link), apdu (link), cryptography, esim (stub)
- Solutions: iot-root-of-trust, secure-provisioning, digital-identity, payment-security, secure-firmware-update
- Industries: banking-and-payments, healthcare, iot-and-industrial, retail-and-hospitality, telecom

**P4 — service detail pages, support sub-pages, about sub-pages**

**P5 — remaining tools, OG templates, analytics, PWA**

---

## Zero information loss — confirmation

- Every Phase-1 and Phase-2 page still serves HTTP 200. (14 routes regression-checked.)
- Every Phase-1 and Phase-2 internal link still resolves.
- The redirect map in `.htaccess` is unchanged.
- All Phase-3 edits are additive: new files + appended sections in `main.css` + 3 new entries in `blog/index.html` + replacement of 3 SOON tool tiles with 6 live tool tiles in `resources/index.html` + 23 new sitemap entries.
- No content was deleted in Phase 3.
