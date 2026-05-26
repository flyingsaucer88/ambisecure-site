# V2X / ITS Security Positioning — Implementation Plan

> Plan-only document. No HTML / JS / schema written yet. Derived from the strategic alignment ask against TRAI CP 30/04/2026. Three answers from intake fix the discipline boundaries:
>
> 1. **Scope of this plan**: outlines and specs only — execution happens in follow-up turns.
> 2. **Sitemap policy**: new V2X pages enter `sitemap.xml` on land, despite the GSC indexed=0 recovery status, because TRAI consultation timing outranks ranking-velocity caution.
> 3. **CC EAL5+ phrasing**: the underlying secure-element silicon carries Common Criteria EAL5+ certification at the chip level — say so factually. Automotive-grade certification (ISO 26262, ASPICE) of the integrated AmbiSEC Module product is a *target*, not yet claimed.

---

## 0. Phasing — what ships when

The prompt's full ask is roughly 10× the size of any prior shipment. Phased delivery:

### Phase A — Foundation (one execution turn)
The minimum coherent unit that gives AmbiSecure visible V2X positioning.

- 3 new pages: `/industries/connected-mobility/`, `/solutions/v2x-security/`, `/technologies/v2x-pki/`
- V2X positioning block added to `/products/iot-security-coprocessor/`
- Standards additions to `/about/certifications/`
- Homepage "Seven domains" pillar tile (becomes "Eight domains")
- Hub-page tiles added at **top of grid** on `/industries/`, `/solutions/`, `/technologies/` (per intake answer)
- Footer "Products" column update (surgical, on relevant pages)
- **New sitewide footer "By Industry" column** added across all 269 pages (per intake answer — no defer)
- **New V2X-specific OG image** (1200×630 SVG + matching PNG/WebP via `tools/gen-og-image.py`) depicting secure-element silicon + vehicle motif in brand red/dark (per intake answer)
- Sitemap entries + lastmod
- `llms.txt` and `llms-full.txt` entries
- Cross-link wiring as specified in the prompt

### Phase B — Tools (one execution turn each)
- `/resources/tools/ieee-1609-2-parser/` — substantive client-side parser, ~500–700 LOC
- `/resources/tools/v2x-cert-chain-validator/` — built on top of the parser, structural-only

### Phase C — Reference data + 4th page
- `/solutions/device-identity-at-scale/` (unification page — needs Phase A to exist first)
- `/references/ieee-1609-2/`
- `/references/etsi-ts-103-097/`
- `/references/etsi-ts-102-941/`
- `/references/iso-21177/`
- `/references/sgp-32/`
- `/trust/` V2X mention

### Phase D — Editorial content
- 5 blog posts (1,000–2,200 words each, 6–10k words total)
- These are real authoring work and warrant their own turns

### Phase E — External (separate repo)
- eSIM Initiative bridge link back from `esim.ambimat.com` — lives in `esim-website/`, not this repo
- AmbiAutomation reciprocal link — lives in `ambiautomations-site/`, not this repo

---

## 1. Claim-discipline reference card

Anchor every V2X surface to this language. Deviations need explicit override.

| Topic | Use | Do NOT use |
|---|---|---|
| Standards | "designed against", "aligned with", "consistent with" | "certified under", "compliant with" (unless formally certified) |
| CC EAL5+ | "underlying secure-element silicon is CC EAL5+ certified at the chip level" | "AmbiSEC Module is CC EAL5+" — that's the integrated product, not yet evaluated |
| Automotive certification | "automotive-grade certification (ISO 26262, ASPICE) is a target" | Claim of either; no fake numbers |
| MTCTE | "designed against TEC 31318:2021 baseline" | "MTCTE certified" unless formally obtained |
| TRAI consultation | "TRAI CP 30/04/2026 is a public consultation document" | "endorsed by TRAI", "government approved" |
| Deployment claims | "city-scale IoT and infrastructure programmes" (generic) | Named cities, named customers, deployment numbers — unless authorised |
| Product framing | "AmbiSEC Module — one representative embedded cryptographic trust platform" | "the V2X product", "the V2X solution", "the only platform" |

**Core positioning sentence (verbatim across V2X pages):**

> "V2X message integrity and device identity assurance cannot be reliably achieved through software-only implementations in open, field-deployed environments subject to physical access and firmware tampering. Every RSU and OBU in a compliant V2X deployment requires a hardware root of trust: a tamper-resistant secure element that holds identity keys, executes cryptographic operations in hardware isolation, and enforces certificate lifecycle management without exposing private key material to application firmware or operating system layers."

---

## 2. Page outlines

### 2.1 `/industries/connected-mobility/`

**Title (≤70 char):** `Connected Mobility & V2X Security | AmbiSecure`
**Meta description (110–170):** `Hardware-backed identity for V2X infrastructure. Secure element integration for OBUs and RSUs, V2X PKI architecture, and ITS certificate lifecycle management for India's connected road ecosystem.`
**Canonical:** `https://ambisecure.ambimat.com/industries/connected-mobility/`
**OG image:** `/assets/img/og/industries.png` (reuse existing) — flag for new V2X-specific OG image as a separate task
**Schema:** `BreadcrumbList` + `WebPage` + `about` pointing to schema.org `IntelligentTransportationSystem` if Schema.org supports it (it does via Place / Thing extensions; otherwise omit `about`)
**Word-count target:** 1,400–1,800

**Sections (h2):**
1. **Why V2X infrastructure demands hardware-backed identity** — RSUs/OBUs as active PKI participants; every message signed/verified; software key storage inadequate for physically accessible field devices.
2. **The V2X PKI challenge** — Enrolment Credentials (EC) vs Pseudonymous Certificates (PC); high-velocity issuance (millions of PCs/min); offline trust requirement (PC5 sidelink); revocation at scale via RSU broadcast.
3. **How secure elements map to OBU/RSU requirements** — key generation inside tamper boundary; hardware-isolated signing; certificate lifecycle inside SE; attestation to Enrolment Authority; automotive operating range −40°C to +105°C.
4. **How JavaCard applets support V2X certificate management** — custom EC/PC applets; AID-selectable multi-applet; applet upgradability for certificate-policy changes without device recall.
5. **How eSIM/eUICC architecture informs V2X credential lifecycle** — SGP.32 IoT eSIM parallels to EA/AA; SM-DP+/SM-DS structural mapping; common patterns: automated provisioning, OTA rotation, revocation without recall.
6. **Standards we design against** — TEC 31318:2021, ETSI TS 103 097, IEEE 1609.2, ISO 21177, ETSI TS 102 941, GSMA SGP.32.

**Hero CTA:**
- Primary: "Discuss V2X integration" → `/contact/`
- Secondary: "V2X architecture detail" → `/solutions/v2x-security/`

**Internal links out:**
- `/products/iot-security-coprocessor/`
- `/products/javacard-applets/`
- `/services/javacard-development/`
- `https://esim.ambimat.com/` (rel="noopener")
- `/technologies/secure-elements/`
- `/technologies/v2x-pki/`
- `/solutions/v2x-security/`

**Navigation:** Add to Industries nav block as new tile.

---

### 2.2 `/solutions/v2x-security/`

**Title:** `V2X Security Architecture — OBU, RSU, and ITS PKI | AmbiSecure`
**Meta description:** `Cryptographic trust architecture for Vehicle-to-Everything infrastructure. EA/AA PKI, pseudonymous certificates, hardware-isolated key storage, and secure manufacturing for V2X deployments.`
**Canonical:** `https://ambisecure.ambimat.com/solutions/v2x-security/`
**Schema:** `BreadcrumbList` + `WebPage`
**Word-count target:** 1,600–2,000

**Sections (h2):**
1. **The trust problem in V2X** — unsigned messages are forgeable (road hazards, emergency preemption, collision warnings); extractable keys mean clonable devices; offline verification on PC5 sidelink.
2. **PKI for V2X: EA, AA, pseudonymous certificate architecture** — EA verifies hardware-backed identity, issues long-lived ECs; AA issues short-lived PCs without knowledge of vehicle identity; privacy-safety balance; ref ETSI TS 102 941.
3. **Hardware binding: why software key storage is insufficient** — OBUs in vehicles (theft/damage); RSUs at roadsides (physical access); CC EAL5+ or equivalent tamper resistance; MTCTE cybersecurity baseline should mandate hardware-backed key storage.
4. **Secure manufacturing and provisioning** — EC injection on controlled provisioning line under HSM-backed key custody; SCP03-equivalent wrapping; per-device unique identity via hardware attestation.
5. **Certificate lifecycle in field deployments** — PC rotation automated SE-managed; OTA credential updates over authenticated channel; revocation via CRL broadcast for offline OBUs and OCSP-like for connected.
6. **AmbiSecure capabilities relevant to V2X** — IoT Security Co-Processor (CC EAL5+ silicon, hardware key isolation, signed boot, OTA); JavaCard applet development (custom V2X certificate management); smart-card personalisation (HSM-backed provisioning line); eSIM Initiative (credential lifecycle at telecom scale).
7. **What AmbiSecure does NOT yet provide** — explicit disclaimer block: not currently shipping an ISO 26262 / ASPICE-certified V2X stack; not a V2X Root CA operator; not a turnkey OBU vendor. We provide the *components* — secure-element silicon, applet platform, provisioning infrastructure — and integrate alongside OBU/RSU OEMs and PKI operators. This block prevents a regulator or system integrator from misinterpreting positioning.

**Hero CTA:**
- Primary: "Discuss V2X integration" → `/contact/`
- Secondary: "Co-Processor spec" → `/products/iot-security-coprocessor/`

**Internal links out:**
- `/products/iot-security-coprocessor/`
- `/services/javacard-development/`
- `https://esim.ambimat.com/` (rel="noopener")
- `/solutions/smart-card-personalization/`
- `/technologies/v2x-pki/`
- `/industries/connected-mobility/`

---

### 2.3 `/technologies/v2x-pki/`

**Title:** `V2X PKI: IEEE 1609.2 and ETSI TS 103 097 Certificate Architecture`
**Meta description:** `Technical reference for V2X PKI: Enrolment Credentials, Pseudonymous Certificates, certificate lifecycle, and hardware binding requirements for connected vehicle deployments.`
**Canonical:** `https://ambisecure.ambimat.com/technologies/v2x-pki/`
**Schema:** `BreadcrumbList` + `WebPage` + (optional) `TechArticle` if the page reads as an article rather than a reference hub.
**Word-count target:** 2,000–2,400 — this is a reference page, denser is fine.
**Heading hierarchy:** keep H1→H2→H3 strictly clean; this page is most likely to have schema/yoast scrutiny.

**Sections (h2):**
1. **V2X PKI vs general-purpose web PKI: key differences** — the comparison table specified in the prompt (Web PKI X.509 vs V2X PKI IEEE 1609.2 across identity, certificate lifetime, issuance volume, offline trust, key storage, privacy).
2. **IEEE 1609.2 certificate format** — structure (version, type, issuer, toBeSigned subject/validity/verifyKeyIndicator); implicit vs explicit types; EccP256CurvePoint public-key representation; ECDSA-P256/P-384 signature; field-by-field reference table in the existing site's APDU / TLV reference style; CTA to the parser tool when it ships in Phase B (use a placeholder anchor with `rel="canonical"` to `/resources/tools/ieee-1609-2-parser/` — page will be added later).
3. **ETSI TS 103 097 security headers** — secured message structure (header / payload / trailer); certificate-included vs certificate-digest-referenced modes; validity period and geographic region restrictions; signing certificate chain construction.
4. **Enrolment Credentials vs Pseudonymous Certificates** — EC long-lived, hardware-bound, attests MTCTE-certified hardware; PC short-lived, AA-issued without EC identity knowledge, used for signing; Butterfly Key Expansion technique for AA to batch-issue PCs without revealing EC.
5. **Certificate lifecycle: provisioning → refresh → revocation** — EA enrolment (hardware attestation → MTCTE verification → EC issuance); AA PC issuance (anonymous request with EC proof → PC batch returned); SE-managed PC rotation (~5–10 min cadence per OBU); CRL distribution via RSU broadcast for offline OBUs; OCSP for connected.
6. **India context: TRAI CP 30/04/2026** — proposed V2X PKI governance (CCA as Root CA oversight, DoT/C-DOT as EA/AA operator); MTCTE requirement; parallel hierarchy to RCAI.

**Internal links out:**
- `/technologies/secure-elements/`
- `/products/iot-security-coprocessor/`
- `/technologies/fido/` (attestation parallels — labelled explicitly as "the FIDO attestation model is a useful analogy, not equivalent")
- `/solutions/v2x-security/`
- `/industries/connected-mobility/`

---

### 2.4 `/solutions/device-identity-at-scale/` (Phase C — defer)

Unification page across V2X OBUs / IoT fleets / transit cards / eSIM provisioning. Builds on Phase A pages. Outline summary only:

1. The scale problem (millions of devices, automated lifecycle)
2. Manufacturing-time provisioning (HSM-backed injection, SCP03 wrapping)
3. Field rotation without recall (OTA credential-update patterns)
4. Revocation architecture (CRL, OCSP, broadcast)
5. Comparison table: eSIM RSP (SM-DP+/SM-DS) vs V2X EA/AA structural parallels
6. AmbiSecure capabilities mapping

Defer until Phase A ships and cross-links exist.

---

## 3. `/products/iot-security-coprocessor/` updates

Add a new section **"V2X / ITS deployment fit"** near the existing Deployment Models grid:

- Automotive operating range (−40°C to +105°C) — flag for the underlying SE silicon.
- IEEE 1609.2-compatible key isolation; ECDSA-P256/P-384 signing hardware-isolated from host MCU.
- EC storage + PC batch-management patterns consistent with ETSI TS 102 941.
- Hardware-signed attestation enables EA enrolment verification.

Add to the existing "Capability ecosystem" grid the two new V2X surfaces:
- `/industries/connected-mobility/` card
- `/solutions/v2x-security/` card
- `/technologies/v2x-pki/` card

Update the page-level `Product` JSON-LD `keywords` (if present) to include: `V2X secure element`, `OBU identity`, `RSU key storage`, `IEEE 1609.2`, `ITS hardware security`, `ECDSA P-256`, `ECDSA P-384`.

**Word-count override:** the page is already at `<meta name="audit-yoast-word-max" content="2500" />`. Adding V2X content may push it to ~2,800 — raise the override to 3,000 in the same edit.

---

## 4. `/about/certifications/` updates

Add under existing "Standards we build to" section. Use **design alignment** phrasing throughout. Add the underlying SE silicon's CC EAL5+ certification as the one *certified* claim — distinct from the *design-alignment* claims:

- **Common Criteria EAL5+** — underlying secure-element silicon, certified at the chip level (factual, supported).
- **ETSI TS 103 097** — V2X security header format + certificate structure (design alignment).
- **IEEE 1609.2** — V2X certificate format and trust model (design alignment).
- **ETSI TS 102 941** — V2X trust and privacy management (design alignment).
- **ISO 21177** — ITS station security services (design alignment).
- **TEC 31318:2021** — IoT Security Code of Practice (design alignment).
- **GSMA SGP.32** — IoT eSIM profile lifecycle (design alignment, via eSIM Initiative).
- **ISO 26262 / ASPICE** — automotive-grade certification of the integrated AmbiSEC Module product is a *target*, not yet claimed.

---

## 5. Homepage updates

### 5.1 "Seven domains" → "Eight domains" pillar tile

Add an eighth pillar after the current seven:

```
V2X / Connected Mobility
Secure-element integration, V2X PKI architecture, and OBU/RSU hardware identity
for Intelligent Transportation Systems.
→ /industries/connected-mobility/
```

Renames the existing section heading: "Seven domains, one engineering team." → "Eight domains, one engineering team." Verify the H2 anchor (`#pillars-heading`) text in the homepage.

### 5.2 Organization JSON-LD `knowsAbout[]`

Append to existing knowsAbout array:
- `"V2X"`, `"V2X PKI"`, `"IEEE 1609.2"`, `"ETSI TS 103 097"`, `"ETSI TS 102 941"`, `"ISO 21177"`, `"Pseudonymous Certificate"`, `"Enrolment Credential"`, `"Connected Mobility"`, `"C-V2X"`, `"OBU"`, `"RSU"`, `"ITS"`, `"TEC 31318"`

Validate after edit: still single JSON-LD block, sameAs array intact (the duplicate-sameAs bug from the AmbiAutomation work is the cautionary tale).

---

## 6. Navigation + footer updates

### 6.1 Top nav
The current top nav lists Products / Solutions / Technologies / Industries / Resources / Blog / About — no dropdowns. New pages are linked from the respective hub pages (`/industries/`, `/solutions/`, `/technologies/`), so the top nav itself does not need changes. **Verify** the hub pages render the new entries:

- `/industries/index.html` — add Connected Mobility tile
- `/solutions/index.html` — add V2X Security tile
- `/technologies/index.html` — add V2X PKI tile

### 6.2 Footer — sitewide
The current footer has Products / Services / Company / Contact (varies by page). Two changes, both ship in Phase A:

- **Products column** on the relevant pages: add `<li><a href="/solutions/v2x-security/">V2X / ITS Identity</a></li>` between IoT Co-Processor and JavaCard Applets.
- **New "By Industry" footer column** ships in Phase A (per intake answer — no defer). Adds a fifth column across all 269 pages. Entries (in order — see hub-page link targets, not nav links): Government → `/industries/government-and-defence/` · Enterprise → `/industries/enterprise-access/` · Transit → `/industries/transportation/` · Smart Cities → `/industries/smart-cities/` · **Connected Mobility** → `/industries/connected-mobility/` · All industries → `/industries/`.

  **Sitewide-edit discipline** for this change — to avoid the sed-`&`-backreference disaster from commit `2b3160c`:
  1. Build the new footer column as a Python-defined string literal; do NOT use sed.
  2. Use a Python script that locates the `<div class="footer-grid">...</div>` block, parses children with a regex, inserts the new column between the existing columns at the correct ordinal position, and writes back. One file at a time, verified.
  3. Idempotency check: detect the marker `By Industry` on the page; skip if already present.
  4. Validation pass after run: `grep -c 'By Industry' across all HTML must equal expected count`, plus `audit-all` must remain green, plus visual sanity-check on a sampled 5 pages (homepage, products/index, a blog post, a tool page, contact).

---

## 7. Sitemap + llms.txt + llms-full.txt

### 7.1 sitemap.xml
Add three entries with `<lastmod>` set to the implementation date, `<priority>0.9</priority>`, `<changefreq>monthly</changefreq>`:

```xml
<url><loc>https://ambisecure.ambimat.com/industries/connected-mobility/</loc>...</url>
<url><loc>https://ambisecure.ambimat.com/solutions/v2x-security/</loc>...</url>
<url><loc>https://ambisecure.ambimat.com/technologies/v2x-pki/</loc>...</url>
```

Run `python3 tools/regen-sitemap.py` if it exists and is preferred over manual edits.

### 7.2 llms.txt
Add three entries under the relevant sections (`## Solutions`, `## Industries`, `## Technologies`).

### 7.3 llms-full.txt
Add three corresponding entries with title + meta description.

---

## 8. Tool spec — `/resources/tools/ieee-1609-2-parser/`

### Purpose
Parse an IEEE 1609.2 V2X certificate provided as hex or Base64. Output a parsed field tree with field names, decoded values, and the standard section that defines each field. Match existing APDU / TLV / ATR parser UI style exactly.

### Technical approach

**Encoding**: IEEE 1609.2 certificates are encoded in **COER (Canonical Octet Encoding Rules)**, an ASN.1 encoding variant. There is no off-the-shelf, lightweight JS COER decoder. The realistic path:

1. **Hand-roll a small COER decoder** for the subset of the 1609.2 schema actually needed. Helper functions:
   - `readUint8`, `readUint16`, `readUint32` (big-endian)
   - `readVarLength` (COER length determinant, 1-byte short form or 1+N long form)
   - `readChoice` (1-byte tag for CHOICE selector)
   - `readSequenceWithExtensions` (preamble byte for OPTIONAL/extension presence)
2. **Implement the 1609.2 schema as a tree of decoder functions**:
   - `Certificate ::= SEQUENCE { version, type, issuer, toBeSigned, signature? }`
   - `version Uint8 ::= 3` (fixed at 3 for current spec)
   - `type CertificateType ::= ENUMERATED { explicit (0), implicit (1) }`
   - `issuer IssuerIdentifier ::= CHOICE { sha256AndDigest HashedId8, self HashAlgorithm, sha384AndDigest HashedId8 }`
   - `toBeSigned ToBeSignedCertificate ::= SEQUENCE { id, cracaId, crlSeries, validityPeriod, region?, assuranceLevel?, appPermissions?, certIssuePermissions?, certRequestPermissions?, canRequestRollover?, encryptionKey?, verifyKeyIndicator }`
   - `validityPeriod ValidityPeriod ::= SEQUENCE { start Time32, duration Duration }`
   - `verifyKeyIndicator VerificationKeyIndicator ::= CHOICE { verificationKey PublicVerificationKey, reconstructionValue EccP256CurvePoint }`
   - `signature Signature ::= CHOICE { ecdsaNistP256Signature, ecdsaBrainpoolP256r1Signature, ecdsaNistP384Signature, ecdsaBrainpoolP384r1Signature }`
   - `EccP256CurvePoint CHOICE { x-only OCTET STRING(32), fill NULL, compressed-y-0 OCTET STRING(32), compressed-y-1 OCTET STRING(32), uncompressedP256 SEQUENCE { x OCTET STRING(32), y OCTET STRING(32) } }`
3. **Defensive parsing**: every field includes try/catch; errors render in-place with a clear "unable to decode beyond this point" marker rather than failing the whole tree.
4. **No WebCrypto required for parsing**. Optional Phase B+ enhancement: verify ECDSA signature against a supplied parent public key using WebCrypto's `subtle.verify`. Not required for the parser-only deliverable.

### UI

- Input: textarea, accepts hex with optional whitespace/0x prefix; Base64; PEM-stripped Base64 (`-----BEGIN ...` lines removed).
- Format toggle button (Hex / Base64 / auto-detect).
- Output: collapsible tree view, mirroring `/resources/tools/tlv-parser/` styling exactly. Re-use `assets/css/tools.css` and the existing tree-rendering helper module if one exists in `assets/js/tools/`.
- Each rendered field row carries:
  - Field name (bold)
  - Decoded value (monospace)
  - Reference (e.g. "IEEE 1609.2 §6.4.5") — small, muted

### Privacy

Client-side only. No network round-trip. No telemetry. Add the existing **"client-side only · no data leaves your browser"** badge already used by other tools.

### Test inputs

Include 3 example certificates in the page UI ("Load example: EC / PC / self-signed root"). Use IEEE-published or ETSI-published example bytes; or generate via the cert-builder helper that ships with libv2x (open-source) and document provenance. **Do not** use real-world deployment certificates.

### LOC estimate

400–700 lines of JS + ~80 lines of HTML + reuse of existing `tools.css`. One Phase-B turn.

---

## 9. Tool spec — `/resources/tools/v2x-cert-chain-validator/`

Builds on top of the parser. Walks a supplied chain (root → CA → EE) and validates **structural** properties only:

- Each cert parses cleanly.
- Each cert's `issuer` field references the next cert in the chain (matches HashedId8 of the next cert's encoding).
- ValidityPeriod is currently in-window (current time vs start/duration).
- Each signature is one of the supported ECDSA schemes.

Explicit **no-signature-verification** disclaimer surfaced in the UI: structural validation only; cryptographic signature verification is a Phase C+ enhancement that requires the parent public key extraction logic.

LOC estimate: 200–300 on top of the parser. One Phase-B turn.

---

## 10. Blog post outlines

Each post must follow the existing AmbiSecure blog house style: engineer-authored voice, technically deep, no promotional framing. FAQPage schema where natural. Last_reviewed date in `assets/data/blogs.json` updated at write-time.

### 10.1 `v2x-pki-why-vehicle-identity-is-harder-than-web-pki` (1,800–2,200 words)
Cornerstone post. Sections:
- "Why not just use HTTPS certificates?" — set the comparison
- Pseudonymity: authentication ≠ identification
- Scale: millions of certificates, minute-long lifetimes
- Offline trust: PC5 sidelink, no network round-trip
- Hardware binding: the secure-element requirement
- India context: what TRAI CP 30/04/2026 implies for OEMs/RSU manufacturers

Tags: `V2X`, `PKI`, `secure-elements`, `IEEE-1609-2`, `ETSI`, `ITS`, `automotive-security`

### 10.2 `pseudonymous-certificates-v2x-privacy` (1,400–1,800 words)
- The privacy problem: signed V2X message reveals location
- How PCs solve this: AA without EC visibility
- Butterfly Key Expansion explained at depth (this is the technical centerpiece)
- Revocation challenge: revoking PCs without de-anonymising
- Hardware implication: per-OBU secure element required

Tags: `pseudonymous-certificates`, `V2X`, `PKI`, `privacy`, `secure-elements`

### 10.3 `hardware-bound-keys-obu-rsu-standards` (1,200–1,600 words)
- What the standards say (ETSI TS 103 097, IEEE 1609.2, TEC 31318)
- Why software key storage fails in V2X threat models
- SE integration patterns (I²C / SPI host interface)
- Attestation flow: SE → EA enrolment verification
- Automotive operating requirements for SE selection

Tags: `secure-elements`, `OBU`, `RSU`, `V2X`, `hardware-security`, `TEC-31318`

### 10.4 `india-v2x-security-framework-trai-consultation` (1,200–1,500 words)
- **Critical: factual policy summary, no product promotion**
- TRAI CP 30/04/2026 security questions (Q5, Q7)
- PKI governance question: CCA, EA/AA, parallel-to-RCAI hierarchy
- MTCTE for V2X: what cybersecurity testing should cover
- Why MTCTE should mandate SE-backed key storage
- What OEM integrators should prepare for

Tags: `TRAI`, `V2X`, `India`, `regulatory`, `PKI`, `MTCTE`, `OBU`, `RSU`
Pre-publish review: factual / policy accuracy gate.

### 10.5 `esim-v2x-credential-lifecycle-common-thread` (1,000–1,400 words)
- eSIM RSP architecture (SM-DP+ / SM-DS) lifecycle
- V2X cert lifecycle (EA / AA, EC issuance, PC refresh, revocation)
- Structural parallels: what telecom teaches V2X PKI design
- OTA credential management: common patterns, different contexts
- India angle: SGP.32 IoT eSIM + V2X PKI governance convergence

Tags: `eSIM`, `eUICC`, `V2X`, `PKI`, `SGP-32`, `automotive`, `credential-lifecycle`

Each post: ~3 hours of careful authoring + research. One post per execution turn is realistic; batching erodes quality.

---

## 11. References pages (Phase C)

Add five new `/references/` entries matching the existing reference page style. Each is a structured technical card with field tables and external links, not prose.

- `/references/ieee-1609-2/` — certificate field structure, implicit vs explicit types, signature schemes, comparison table with X.509.
- `/references/etsi-ts-103-097/` — secured-message header structure, cert-format variants, external link to ETSI.
- `/references/etsi-ts-102-941/` — V2X trust + privacy management, EA/AA roles, PKI hierarchy.
- `/references/iso-21177/` — ITS station security services summary.
- `/references/sgp-32/` — IoT eSIM profile lifecycle, cross-reference to eSIM Initiative.

Each is ~200–400 words; the value is structured field tables, not prose.

---

## 12. Schema.org plan

| Surface | Schema | Notes |
|---|---|---|
| `/industries/connected-mobility/` | `BreadcrumbList` + `WebPage` | Add `about` linking to Wikipedia entries for "Vehicle-to-everything" and "Intelligent transportation system" via `sameAs` if pattern allowed. |
| `/solutions/v2x-security/` | `BreadcrumbList` + `WebPage` | Same as above. |
| `/technologies/v2x-pki/` | `BreadcrumbList` + `TechArticle` | Reference page that reads as an authored technical piece; `TechArticle` is justifiable. |
| `/products/iot-security-coprocessor/` (update) | `Product` keywords expansion | See section 3. |
| Homepage Organization | `knowsAbout[]` extension | See section 5.2. |
| Tool pages (Phase B) | `SoftwareApplication` | Match existing tool pattern. |
| Blog posts (Phase D) | `TechArticle` + optional `FAQPage` | Match existing blog pattern. |

---

## 13. Validation checklist (mirrors prompt's final checklist)

Before Phase A merges:

- [ ] No claim of ISO 26262 or ASPICE certification anywhere
- [ ] No claim of government / TRAI / CCA endorsement
- [ ] CC EAL5+ phrasing: "underlying secure-element silicon" only, never "AmbiSEC Module is EAL5+"
- [ ] All standards described as "design aligns with" / "consistent with"
- [ ] AmbiSEC Module / IoT Co-Processor framed as "one representative implementation"
- [ ] All `/products/iot-security-coprocessor/` links resolve (sed-verify across the new V2X pages)
- [ ] TRAI consultation referenced as public document, not endorsement
- [ ] No deployment numbers or named customers
- [ ] City-scale claims generic, not named-city
- [ ] eSIM Initiative links use `rel="noopener"` (matches existing pattern)
- [ ] Internal-link graph from section 14 fully implemented
- [ ] Navigation entries on `/industries/`, `/solutions/`, `/technologies/` hubs
- [ ] Mobile responsiveness on new layout tiles (use existing `.grid-3` / `.card` / `.card-soft` classes — same as recent commits)
- [ ] Sitemap.xml + llms.txt + llms-full.txt all updated
- [ ] `bash tools/audit-all.sh` exits clean
- [ ] No duplicate JSON-LD keys, no duplicate `sameAs` arrays (cautionary tale from prior commit)
- [ ] Yoast word-max override added if any page exceeds 900 (likely `/technologies/v2x-pki/` will need it)
- [ ] No commit pushed without GSC recovery context — review against `docs/GSC_RECOVERY_ACTION_PLAN.md` timing

Phase A additions (from intake decisions):
- [ ] New OG SVG renders correctly on Twitter / LinkedIn / WhatsApp link previews — manual check post-deploy
- [ ] OG asset is 1200×630, brand palette only, no fabricated logos/marks
- [ ] Hub-page V2X tile lands at top of grid on all three hubs (Industries / Solutions / Technologies)
- [ ] Footer "By Industry" column appears on all 269 pages with identical markup; idempotency check passes (no double-insertions)
- [ ] Footer column links: Government / Enterprise / Transit / Smart Cities / Connected Mobility / All industries — verify each resolves on a sampled page
- [ ] No use of `sed` with `&` in a replacement string for any sitewide edit in this phase

Phase B (tool):
- [ ] Tool runs client-side only — verified via DevTools network tab
- [ ] Sample inputs work; malformed inputs render readable error messages
- [ ] Privacy badge present and accurate
- [ ] Mobile responsive (uses existing `tools.css`)

Phase D (blog posts):
- [ ] Pre-publish review by named technical lead
- [ ] For the TRAI/regulatory post: factual / policy accuracy gate
- [ ] Last_reviewed dates updated in `assets/data/blogs.json`

---

## 14. Internal link graph (verbatim from prompt)

```
/products/iot-security-coprocessor/   → /solutions/v2x-security/
/solutions/v2x-security/              → /products/iot-security-coprocessor/
/solutions/v2x-security/              → /technologies/v2x-pki/
/solutions/v2x-security/              → /services/javacard-development/
/solutions/v2x-security/              → https://esim.ambimat.com
/technologies/v2x-pki/                → /technologies/secure-elements/
/technologies/v2x-pki/                → /products/iot-security-coprocessor/
/technologies/v2x-pki/                → /technologies/fido/ (attestation parallels)
/industries/connected-mobility/       → /solutions/v2x-security/
/industries/connected-mobility/       → /products/iot-security-coprocessor/
/industries/connected-mobility/       → /technologies/v2x-pki/
/industries/connected-mobility/       → https://esim.ambimat.com
```

Note: the prompt references `/products/iot-security-chipset/` in places — replace with `/products/iot-security-coprocessor/` (the chipset slug now serves a redirect stub; see commit `e7d0962`).

---

## 15. SEO + indexing notes

### 15.1 Sitemap timing
Per intake answer: new pages enter sitemap immediately on land. Submit re-crawl via GSC URL Inspection for each new URL — counts against the ~10/day request-indexing quota documented in `docs/GSC_RECOVERY_ACTION_PLAN.md`. Likely sequence:

- Day 0 (Phase A merges): submit 3 new V2X URLs + 1 updated co-processor URL via URL Inspection.
- Day 1: submit 4 priority pages from the GSC recovery plan (homepage + flagships).
- Day 2: submit remaining recovery-plan priority pages.

### 15.2 Keywords (organic placement only)

High-priority terms to organically place across the V2X pages: `V2X PKI India`, `OBU RSU secure element`, `connected vehicle identity`, `IEEE 1609.2 certificate`, `V2X security India`, `hardware root of trust OBU`, `ETSI TS 103 097`, `C-V2X security`, `ITS security India`, `TRAI V2X consultation`.

No keyword density tracking. No stuffing. Each term lands once or twice in natural prose. The prompt's medium-priority list lives in section 12 of the source prompt.

### 15.3 Risk: outbound link concentration
V2X pages cross-link to `esim.ambimat.com` (already a sister site). Existing `rel="noopener"` pattern applies. No `rel="nofollow"` needed for editorial sister-site links.

---

## 16. Risk + timing notes

- **Indexed=0 context**: Adding 3+ pages while the domain has indexed=0 dilutes whatever crawl budget Google grants. Per the intake answer, TRAI consultation timing overrides this concern. If TRAI cycle deadlines slip, re-evaluate.
- **Tools (Phase B)**: IEEE 1609.2 parser is real work. Estimated 1 focused execution turn for parser + 0.5 for chain validator. Defer until Phase A pages have settled and at least one blog post exists to drive traffic to the tool.
- **Blog posts (Phase D)**: 5 posts × ~3 hours of careful authoring each = 15h of focused work. Plan for one post per turn, not all five batched. The TRAI/regulatory post specifically needs policy-accuracy review and should not ship without it.
- **Schema drift**: every new page adds JSON-LD. The duplicate-key bug pattern from commit `2b3160c` is a cautionary tale — validate all new JSON-LD with `json.loads` before merging.

---

## 17. Next-turn execution proposal

When the user authorises Phase A, execute strictly in this order so cross-links resolve as each page is added:

1. **OG asset.** Hand-build `/assets/img/og/connected-mobility.svg` (1200×630, secure-element silicon + vehicle motif, brand palette). Note: PNG/WebP generation deferred to a `tools/gen-og-image.py` follow-up unless the script is invocable in the same turn.
2. **Page: `/industries/connected-mobility/`** (entry tile for the entire vertical). OG points to the new asset.
3. **Page: `/solutions/v2x-security/`** (solution-shaped; cross-links both directions).
4. **Page: `/technologies/v2x-pki/`** (reference page, denser, last because longest; likely needs the `audit-yoast-word-max` override pattern).
5. **Update `/products/iot-security-coprocessor/`**: add V2X / ITS deployment-fit section + three capability-ecosystem cards (Connected Mobility / V2X Security / V2X PKI); raise the Yoast word-max override.
6. **Update `/about/certifications/`**: standards block with design-alignment language; one factual CC EAL5+ claim limited to the silicon.
7. **Update homepage**: rename "Seven domains" → "Eight domains"; add V2X pillar tile; extend `Organization.knowsAbout[]`.
8. **Update hub pages** (`/industries/index.html`, `/solutions/index.html`, `/technologies/index.html`): add V2X tile at **top of grid** on each.
9. **Update footer Products column** (surgical, only on pages with that column).
10. **Sitewide footer "By Industry" column** added via Python script per section 6.2 discipline. Validation: marker-count + audit-all + 5-page visual sanity check.
11. **Sitemap.xml** + `llms.txt` + `llms-full.txt`: add the three new URLs.
12. `bash tools/audit-all.sh` — must exit green.
13. Update `docs/GSC_RECOVERY_ACTION_PLAN.md` priority-URL list to include the three new pages.
14. Commit with explicit "in this commit" vs "deferred to Phase B/C/D/E" summary.

Realistic single-turn duration: substantial. Roughly 1.3× the scope of the original IoT Co-Processor build (commit `e7d0962`) because of the sitewide footer-column addition and the OG-asset work. All Phase B / C / D / E items remain in separate turns.

---

## 18. Decisions locked in (from intake)

- **V2X-specific OG image**: **Commission new.** Brief: 1200×630 SVG depicting a secure-element silicon package paired with a vehicle motif, brand-aligned (brand-red `#E3222A` + ink `#3a3f40` on neutral background). Match the visual register of existing OG SVGs in `/assets/img/og/`. SVG hand-built in Phase A alongside the page work; PNG and WebP generated via existing `tools/gen-og-image.py` or batch tool. Filename: `/assets/img/og/connected-mobility.{svg,png,webp}`. Three V2X pages share this OG asset.
- **Hub-page tile placement**: **Top of grid** on each of `/industries/`, `/solutions/`, `/technologies/` index pages. Justification: TRAI-cycle timing and the strategic intent to make V2X immediately visible to anyone landing on a hub page.
- **Footer "By Industry" column**: **Ships in Phase A.** No defer. Implemented per the sitewide-edit discipline in section 6.2.

### Items still in follow-up

- **`/blog/categories/v2x/`** and **`/tags/v2x/`** category/tag pages: standard auto-generation pattern after the first V2X blog post lands. Pick up in Phase D.
- **eSIM Initiative reciprocal link**: separate repo (`esim-website/`), separate commit. Plan documented here; execute there.

---

*End of plan. No HTML / JS / schema changes shipped this turn. Awaiting explicit go on Phase A.*
