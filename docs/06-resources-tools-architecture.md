# 06 · Resources / Utility Tools Architecture

## Mandate

> Resources is **utility tools only**. No editorial content here.
> Blog handles knowledge-sharing. Resources handles "I have a hex string, decode it for me."

## Why this matters

Embedded / smart-card / telecom engineers reach for the same tools every week: ATR parsers, APDU dissectors, TLV walkers, ASN.1 decoders, status-word lookups. Today most of them live on slow ad-laden sites. Hosting a clean, fast, **offline-capable** suite under `ambisecure.ambimat.com/resources/tools/` builds organic traffic, dev mindshare, and credibility that translates to product enquiries.

Each tool is a **single static HTML page** with a small (<5 KB) inline-or-deferred JS module. No SPA, no framework. They work without network after first load.

## Tool catalogue (50+ tools)

Every tool URL: `/resources/tools/<slug>/`. Each has its own `index.html` + a JS module under `/assets/js/tools/<slug>.js`.

### Smart Card / JavaCard utilities (9)

| Slug | Tool | One-line description |
|---|---|---|
| `atr-parser` | ATR Parser | Parse Answer-To-Reset bytes → TS, T0, TA/TB/TC/TD interface bytes, historical bytes, TCK |
| `apdu-parser` | APDU Parser | Decode CLA/INS/P1/P2/Lc/data/Le for Case 1-4, short and extended length |
| `apdu-builder` | APDU Builder | Build a valid APDU from selected fields with live validation |
| `tlv-parser` | TLV Parser | Walk BER-TLV / DGI-TLV / EMV TLV trees with tag dictionary lookup |
| `asn1-decoder` | ASN.1 Decoder | Decode BER/DER blobs into a clickable tree |
| `ber-der-decoder` | BER/DER Decoder | Lower-level BER/DER bytes-to-tree |
| `sw-lookup` | SW1/SW2 Lookup | Search 200+ status words by hex or by phrase |
| `cap-inspector` | CAP File Inspector | Decode JavaCard CAP file components (Header, Directory, Class, Method, Import, etc.) |
| `scp03-helper` | SCP03 Reference Helper | Compute SCP03 session keys / cryptograms / MACs given static keys + sequence counter |
| `gp-status-lookup` | GlobalPlatform Status Lookup | GP card lifecycle / app lifecycle states |

### Encoding & conversion (6)

| Slug | Tool |
|---|---|
| `ascii-hex` | ASCII ↔ HEX converter |
| `hex-bytes` | HEX ↔ byte-array (multiple formats: `0xAA, 0xBB`, `\xAA\xBB`, `AA BB`, `aabb`) |
| `base64` | Base64 encoder/decoder |
| `base32` | Base32 encoder/decoder |
| `utf8` | UTF-8 inspector (showing code-points, byte counts, BOM detection) |
| `url-codec` | URL encode / decode |

### Crypto / security helpers (6)

| Slug | Tool |
|---|---|
| `crc-calc` | CRC-8 / CRC-16 / CRC-32 calculator with polynomial picker |
| `lrc-calc` | LRC (longitudinal redundancy check) calculator |
| `checksum` | Generic checksum (XOR, sum-mod-256, two's-complement) |
| `sha-hash` | SHA-1 / SHA-256 / SHA-384 / SHA-512 / SHA3 hash generator (uses Web Crypto API) |
| `rsa-keyformat` | RSA key format reference (PKCS#1, PKCS#8, SPKI, OpenSSH) — explainer + sample blobs |
| `ecc-curves` | ECC curve quick reference (P-256, P-384, Curve25519, secp256k1, brainpool) |

### eSIM / SIM / telecom (5)

| Slug | Tool |
|---|---|
| `iccid-decoder` | ICCID decoder (issuer ID, country code, MII, Luhn check) |
| `imsi-decoder` | IMSI decoder (MCC, MNC, MSIN) |
| `iso7816-ref` | ISO/IEC 7816 quick reference card |
| `apdu-status-dict` | APDU status-word dictionary (ISO 7816-4 + GP + EMV + FIDO + GSMA) |
| `euicc-eid-decoder` | eUICC EID decoder (per ITU-T E.118 / GSMA) |

### JSON / data utilities (4)

| Slug | Tool |
|---|---|
| `json-format` | JSON formatter / minifier with error pinpointing |
| `json-validate` | JSON validator + schema-against-instance checker |
| `cbor-parser` | CBOR (RFC 8949) decoder — important for FIDO/CTAP2 attestation |
| `xml-format` | XML formatter / validator |

### NFC / DESFire references (3)

| Slug | Tool |
|---|---|
| `desfire-status` | DESFire status / error code lookup |
| `ndef-decoder` | NDEF record decoder (URI, Text, MIME, Smart Poster, AAR) |
| `iso14443-ref` | ISO/IEC 14443 quick reference (Type A/B framing, anti-collision overview) |

### Misc developer utilities (4)

| Slug | Tool |
|---|---|
| `binary-calc` | Binary calculator (AND/OR/XOR/NOT/shift) with multi-base display |
| `byte-offset` | Byte-offset / length-field calculator for parsing assistance |
| `length-field` | Length-field encoder (1-byte, 2-byte, BER-length, DGI-length) |
| `endian-convert` | Endian converter (LE↔BE) for u16/u32/u64 |

### FIDO / WebAuthn (3 — bonus, AmbiSecure-specific)

| Slug | Tool |
|---|---|
| `webauthn-attestation-decoder` | Decode WebAuthn `attestationObject` (CBOR → AuthData → COSE key) |
| `cose-key-decoder` | Decode COSE_Key (RFC 8152) — used by FIDO2 |
| `aaguid-lookup` | FIDO AAGUID directory lookup (links to FIDO MDS) |

**Total: 50 utilities** across 7 categories.

## Tool page layout (standard)

Every tool page uses the same shell:

```
[Ecosystem bar]
[Navbar]
[Breadcrumb: Home › Resources › Tools › <Tool>]
[Tool header: title · short subhead · "added Apr 2026" · view source link]
[Tool shell:
  Left/top:  Input panel (textarea / hex input + options)
  Right/bottom: Output panel (parsed tree / table / hex view)
  Below: Reference (definitions, links to spec, related tools, related blog post)
]
[Footer]
```

Implemented in `/assets/css/tools.css` via `.tool-shell`, `.tool-input`, `.tool-output`, `.tool-reference` classes (see `docs/03-design-system.md`).

## Implementation rules

1. **No framework.** Vanilla JS, ES2020. Each tool is its own page + its own JS file. Tools can be opened standalone.
2. **No tracking, no telemetry.** Every input is processed entirely client-side. Display this fact at the bottom of every tool: "All parsing happens in your browser. Nothing is sent to a server."
3. **Sample inputs.** Every tool has a "Try a sample" button that fills a real-world example.
4. **Permalinks.** Where useful, the input is base64-encoded into the URL hash (`#input=...`) so engineers can share. **No** server logging.
5. **Copy-output.** Every result row has a one-click "copy hex" button.
6. **Reference panel.** Every tool ends with: link to spec, link to related blog post, link to related Technology page, link to related product if any.
7. **Accessibility.** All inputs labelled. Errors announced via `aria-live="polite"` regions. Keyboard-only flow tested.
8. **Schema.org `SoftwareApplication`.** Each tool emits `SoftwareApplication` JSON-LD with `applicationCategory: "DeveloperApplication"`, `operatingSystem: "Web"`, `offers: { "@type": "Offer", "price": "0" }`.
9. **Offline-capable.** Each tool's HTML+CSS+JS works offline once cached. (Optional Phase 2: add a service worker so the whole `/resources/tools/` directory installs as a PWA.)

## SEO uplift

Each tool URL targets a specific high-intent query:

| URL | Primary query |
|---|---|
| `/resources/tools/atr-parser/` | "atr parser" |
| `/resources/tools/apdu-parser/` | "apdu parser online" |
| `/resources/tools/tlv-parser/` | "tlv parser online", "ber-tlv decoder" |
| `/resources/tools/sw-lookup/` | "smart card status word lookup" |
| `/resources/tools/iccid-decoder/` | "iccid decoder" |
| `/resources/tools/cbor-parser/` | "cbor decoder", "fido cbor decoder" |
| ... | ... |

Existing tools in this space (gpshell-online, smartcard-focus tables, webauthn.io) are sparse, ad-heavy, or scattered. A clean curated suite under one premium domain is a meaningful SEO and developer-mindshare play.

## Index page (`/resources/`)

Layout:
- Hero: "Engineer's toolbox for smart cards, secure elements, and telecom identity."
- Filter pills: All · JavaCard · APDU · Crypto · eSIM · NFC · Encoding · JSON · Misc
- Grid of tool cards (icon · name · one-liner · category chip)
- "Suggest a tool" CTA → mailto link
- Disclaimer footer: "All tools run client-side. No data leaves your browser."

Tool list is hard-coded in the HTML for now; later moves to a `tools.json` consumed by a small renderer if it grows past ~80 entries.

## Phase-1 deliverables for tools

Phase 1 ships **3 working tools** as a proof-of-system: `atr-parser`, `apdu-parser`, `tlv-parser`. The remaining 47 tool pages get **placeholder shells** in Phase 2 (so the URL space and SEO is reserved) and are filled in across Phase 3 / Phase 4.
