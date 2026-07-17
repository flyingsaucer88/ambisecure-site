# AmbiSecure — Claude Design batch input

One section per eligible Resource or Blog page. 166 pages, each needing a unique 1200x630 LinkedIn / Open Graph featured image.
Design system: approved AmbiSecure visual language. Do not design or upload during briefing — this document is the design input.

Global rules that apply to every image in this batch:

- A private key never leaves a secure element or authenticator. Never draw one crossing that boundary.
- FIDO2/WebAuthn is phishing-RESISTANT, never "phishing-proof". Origin binding is the mechanism.
- Passkeys may be synced (BE=1) or device-bound (BE=0) — a passkey is not automatically a hardware key.
- Parsers and reference tables are decode/lookup surfaces — never scanners, attack tools or security validators.
- Client-side tools run entirely in-browser; never draw an upload or server round-trip.
- Do not imply AmbiSecure certifications, benchmarks or claims not present on the page.

---

# RESOURCE PAGES

## 001 — Sequence Diagram Generator

- **Record number:** 1
- **Page name:** Sequence Diagram Generator
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/sequence-diagram-generator/
- **Section:** Resource
- **Page type:** ENGINEERING TOOL
- **Primary topic:** Other | **Secondary:** FIDO2; V2X; SIM/eSIM
- **Design priority:** P2
- **Approved headline:** Sequence diagrams for security ceremonies
- **Alternative headline:** FIDO2 to SGP.32, drawn locally
- **Category label:** TOOL
- **Core message:** A browser-only sequence diagram generator whose templates match the real ceremonies security engineers review — FIDO2 assertion, SCP03 personalisation, eSIM SGP.32 download, V2X PKI enrolment — so no source ever leaves the machine to get a diagram drawn.
- **Audience:** Security architect
- **Diagram type:** TECHNICAL WORKBENCH
- **Visual concept:** Dominant object is a two-pane workbench: a monospace source pane on the left holding WebSequenceDiagrams-style lines, a rendered lifeline diagram on the right. The flow is source text to in-browser parse and layout to SVG, drawn as a short arrow that never leaves an enclosing browser-boundary frame. Five nodes maximum: source pane, parse/layout step, rendered diagram, template selector chip strip (FIDO2 / SCP03 / SGP.32 / V2X), Export SVG control. Nothing is transmitted — the boundary frame is the point, and any server or cloud glyph is outside it and crossed. Allowed labels: title, A -> B:, alt / else / end, autonumber, Export SVG. Must not imply the tool checks, validates, or simulates a protocol; it only draws what is typed.
- **Avoid:**
    - Do not show a cloud, server, or upload arrow receiving the diagram source — all parsing and rendering is in-browser
    - Do not draw the FIDO2 template lifelines with a private key or credential secret travelling from the authenticator to the relying party
    - Do not imply the generator validates or simulates a ceremony — it renders text, it does not check protocol correctness
    - Do not brand the syntax as WebSequenceDiagrams.com or Mermaid — the tool implements a subset, not either product
- **Alt text:** Two-pane workbench with diagram source left and a rendered FIDO2 lifeline flow right, parsed inside the browser boundary with no source ever uploaded.
- **Export filename:** `ambisecure-resources-tools-sequence-diagram-generator-1200x630.png`
- **Visual similarity group:** VSG-DIAGRAM-WORKBENCH
- **Currently uses:** default.png
- **Notes:** Template list includes UPI and banking-login flows that sit outside the core security narrative; keep the image on the FIDO2 / SCP03 / SGP.32 / V2X templates.

## 002 — IEEE 1609.2 V2X Certificate Parser

- **Record number:** 2
- **Page name:** IEEE 1609.2 V2X Certificate Parser
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/ieee-1609-2-parser/
- **Section:** Resource
- **Page type:** PARSER
- **Primary topic:** V2X | **Secondary:** PKI; Connected mobility; Certificate lifecycle
- **Design priority:** P1
- **Approved headline:** V2X Certificates Are COER, Not DER
- **Alternative headline:** Enrolment Credential or Pseudonymous Certificate?
- **Category label:** TOOL
- **Core message:** A hand-rolled client-side COER decoder that turns an IEEE 1609.2 V2X certificate into an inspectable field tree, stopping cleanly rather than guessing at fields it does not cover.
- **Audience:** Automotive-security engineer
- **Diagram type:** CERTIFICATE STRUCTURE
- **Visual concept:** Dominant object: a single CertificateBase octet ribbon unrolling left-to-right into an indented field tree, with the ribbon drawn as continuous schema-driven octets rather than tagged TLV boxes. Flow: bytes enter at the paste edge and resolve into exactly five branch nodes — IssuerIdentifier, CertificateId (named / linkageData / binaryId), ValidityPeriod (Time32 + Duration), VerificationKeyIndicator (verificationKey vs reconstructionValue), and the trailing ECDSA signature over P-256/P-384. Everything happens inside a browser frame: the pasted bytes stay local and no arrow leaves the frame toward any CA, HSM, or network. One branch is deliberately hatched and tagged 'present-but-opaque' with a small 'decoder stopped' marker where GeographicRegion and PSID/SSP permissions would sit. Allowed labels: COER, ToBeSignedCertificate, VerificationKeyIndicator, Time32, P-256, decoder stopped. Must not imply that the tool verifies the signature or judges compliance.
- **Avoid:**
    - Do not show a signature being verified or a green valid tick — the parser never checks signatures
    - Do not draw X.509/DER tag-length-value boxes, since COER strips per-field tags and relies on the compiled schema
    - Do not show bytes travelling to a server or PKI backend — parsing is entirely in-browser
    - Do not depict GeographicRegion or SequenceOfPsidSsp as decoded fields — they are flagged present-but-opaque
    - Do not equate a long-lived Enrolment Credential with a short-lived Pseudonymous Certificate
- **Alt text:** Field tree unrolled from a COER-encoded 1609.2 certificate in AmbiSecure's in-browser parser, showing issuer, validity and key indicator — no signature check.
- **Export filename:** `ambisecure-resources-tools-ieee-1609-2-parser-1200x630.png`
- **Visual similarity group:** VSG-CERT-STRUCTURE
- **Currently uses:** connected-mobility.png
- **Notes:** Only lightweight client-side 1609.2 COER decoder of its kind; strong differentiation and internal linking to the V2X PKI pillar and the sister chain validator. Current OG image reuses connected-mobility.png and should be replaced.

## 003 — V2X Certificate Chain Validator

- **Record number:** 3
- **Page name:** V2X Certificate Chain Validator
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/v2x-cert-chain-validator/
- **Section:** Resource
- **Page type:** ENGINEERING TOOL
- **Primary topic:** V2X | **Secondary:** PKI; Certificate lifecycle; Connected mobility
- **Design priority:** P1
- **Approved headline:** Link V2X certificates by HashedId8
- **Alternative headline:** IEEE 1609.2 chains, structurally checked
- **Category label:** TOOL
- **Core message:** A client-side structural sanity check for IEEE 1609.2 certificate chains that confirms issuer linkage by HashedId8 without ever claiming cryptographic validation.
- **Audience:** Automotive-security engineer
- **Diagram type:** TRUST CHAIN
- **Visual concept:** Dominant object: a three-link vertical chain of IEEE 1609.2 certificates drawn as COER byte blocks — Root CA, AA/EA intermediate, PC/EC end-entity — deliberately not X.509 cards. Flow: each lower block's issuer field emits an 8-byte tag matched against a SHA-256 digest strip computed over the block above it; five nodes only — the three certificates, the digest strip, and a neutral linkage-matched marker. All hashing sits inside a browser frame with no outbound arrow: certificate bytes never leave the page and WebCrypto does the digest locally. Labels allowed: HashedId8, SHA-256, Root CA, AA/EA, PC/EC. Must not imply signature verification, revocation, PSID/SSP permission checks, or a time-validity verdict. Within VSG-CERT-STRUCTURE this is the only hash-linked COER chain; name-based linkage belongs to the X.509 chain viewer.
- **Avoid:**
    - Do not show ECDSA signature verification or a cryptographic 'valid' verdict — linkage is by HashedId8 only
    - Do not draw X.509 cards — IEEE 1609.2 certificates are COER-encoded
    - Do not imply revocation or PSID/SSP permission checking
    - Do not show certificate bytes being sent to a server
- **Alt text:** Three IEEE 1609.2 certificates stacked as COER blocks, linked upward by HashedId8 digests — AmbiSecure's structural check, not signature verification.
- **Export filename:** `ambisecure-resources-tools-v2x-cert-chain-validator-1200x630.png`
- **Visual similarity group:** VSG-CERT-STRUCTURE
- **Currently uses:** connected-mobility.png
- **Notes:** Structural-only scope is the page's own emphasis — the image must never read as a cryptographic gate. Tool is capped at 3 chain levels.

## 004 — ATR Parser

- **Record number:** 4
- **Page name:** ATR Parser
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/atr-parser/
- **Section:** Resource
- **Page type:** PARSER
- **Primary topic:** ATR | **Secondary:** Smart cards; APDU
- **Design priority:** P1
- **Approved headline:** What your card says at reset
- **Alternative headline:** TS to TCK, decoded locally
- **Category label:** TOOL
- **Core message:** A client-side parser that turns a raw ISO/IEC 7816-3 Answer-To-Reset into readable card capabilities without sending a single byte to a server.
- **Audience:** Smart-card engineer
- **Diagram type:** DATA PARSER
- **Visual concept:** Dominant object: a contact smart card seated in a reader slot, with a single horizontal ribbon of ATR bytes streaming out of the contact pad from left to right at the instant of a cold reset — this is the reset-moment framing that separates it from every other parser in the group. The flow reads strictly in ATR emission order, with exactly five labelled nodes tapping the ribbon: TS (direct convention, 3B), T0 (interface-byte map), TA1 (clock-rate / bit-rate conversion Fi/Di), TD1 (protocol offered — T=0 byte-oriented, T=1 block-oriented), and the trailing Historical Bytes block with an optional TCK checksum. Inside the hardware stays the card OS and any keys; what communicates externally is only the ATR byte string itself, travelling card-to-reader. Allowed labels: TS, T0, TA1, TD1, Historical Bytes, TCK, T=0, T=1, ISO/IEC 7816-3, 3B. Must not imply the parser talks to the card, drives the reader, or judges the card's security.
- **Avoid:**
    - Do not show a contactless antenna or RF field — the ATR is a contact-interface (ISO/IEC 7816-3) event
    - Do not draw the byte ribbon flowing to a cloud or server, parsing is entirely in-browser
    - Do not decode the historical bytes into fixed meanings — their format is card-specific and issuer-defined
    - Do not show TCK as mandatory, it is present only for T=1
    - Do not present the parser as validating or certifying the card
- **Alt text:** AmbiSecure ATR parser diagram showing a smart card emitting TS, T0, TA1, TD1 and historical bytes at reset, decoded in-browser to reveal protocol and timing.
- **Export filename:** `ambisecure-resources-tools-atr-parser-1200x630.png`
- **Visual similarity group:** VSG-BYTE-PARSER
- **Currently uses:** resources.png
- **Notes:** Group variation: only parser in the batch anchored to the reset moment and the contact pad; node set is ATR interface bytes exclusively.

## 005 — APDU Parser

- **Record number:** 5
- **Page name:** APDU Parser
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/apdu-parser/
- **Section:** Resource
- **Page type:** PARSER
- **Primary topic:** APDU | **Secondary:** Smart cards; Secure Elements
- **Design priority:** P1
- **Approved headline:** CLA INS P1 P2, decoded
- **Alternative headline:** From 6A82 to root cause
- **Category label:** TOOL
- **Core message:** A client-side parser that splits any command or response APDU into its ISO/IEC 7816-4 fields and resolves the status word, so engineers can read a reader trace at a glance.
- **Audience:** Smart-card engineer
- **Diagram type:** DATA PARSER
- **Visual concept:** Dominant object: a two-lane message exchange between a terminal and a card — an outbound command APDU strip above, an inbound response strip below — rather than a single byte ribbon, which is what distinguishes it from the ATR and ATS parsers in this group. The command lane carries the worked example 00 A4 04 00 07 A0000002471001 with exactly four labelled header segments (CLA, INS = A4 SELECT, P1/P2 = 04 00 select-by-name, Lc + data = 7-byte AID) and the return lane terminates in a fifth node, the SW1 SW2 status word, showing 90 00 resolved as success and 6A 82 as file-or-application-not-found. Inside the card stays the file system, applet and keys; what communicates externally is only the APDU pair crossing the terminal-card boundary. Allowed labels: CLA, INS, P1, P2, Lc, Le, SW1, SW2, 90 00, 6A 82, A4 SELECT, ISO/IEC 7816-4. Must not imply the tool sends APDUs to a card or a server.
- **Avoid:**
    - Do not show Lc and Le present together unless the strip is labelled case 4 — cases 1-3 omit one or both
    - Do not draw extended-length fields as 1 byte, they are 3 bytes with a leading 0x00
    - Do not interpret proprietary CLA ranges, the parser explicitly leaves those uninterpreted
    - Do not show the trace uploading to a server for decoding
    - Do not present the status-word lookup as a security verdict on the card
- **Alt text:** AmbiSecure APDU parser visual splitting a SELECT command into header, AID data and a 9000 or 6A82 status word returned by the card, all parsed in the browser.
- **Export filename:** `ambisecure-resources-tools-apdu-parser-1200x630.png`
- **Visual similarity group:** VSG-BYTE-PARSER
- **Currently uses:** resources.png
- **Notes:** Group variation: only parser using a bidirectional command/response pair; node set is APDU header fields plus SW1/SW2.

## 006 — TLV Parser

- **Record number:** 6
- **Page name:** BER-TLV Parser
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/tlv-parser/
- **Section:** Resource
- **Page type:** PARSER
- **Primary topic:** BER-TLV | **Secondary:** Smart cards; Personalization
- **Design priority:** P1
- **Approved headline:** Walk the BER-TLV tree
- **Alternative headline:** EMV tag 6F, fully unfolded
- **Category label:** TOOL
- **Core message:** A client-side BER-TLV parser that walks tag/length/value trees to any depth and names known EMV tags, so engineers can find the data object they need inside a card response.
- **Audience:** Smart-card engineer
- **Diagram type:** DATA PARSER
- **Visual concept:** Dominant object: a vertical nesting tree that recurses inward — a flat byte run at the top unfolding into indented parent/child branches — the only recursive-container concept in this group, versus the linear ribbons and lanes used by the ATR and APDU parsers. The relationship shown is containment, not sequence: exactly five nodes, starting at 6F (File Control Information template, constructed) whose value opens into 84 (DF Name, primitive) and A5 (FCI proprietary template, constructed), which nests one level deeper, with a fifth node showing an unknown proprietary tag rendered as bare hex with correct length but no friendly name. A small callout marks bit 6 of the first tag byte as the constructed/primitive discriminator. Nothing hardware-side is depicted; what enters is a pasted byte string from a reader trace, and it never leaves the browser. Allowed labels: 6F, 84, A5, tag, length, value, constructed, primitive, bit 6, EMV, ISO/IEC 8825-1. Must not imply the parser validates an EMV transaction or authorises anything.
- **Avoid:**
    - Do not draw the TLV structure as a flat list — nesting depth is the whole point of this tool
    - Do not label every tag with a friendly name, proprietary tags are shown as hex only
    - Do not show a primitive tag such as 84 containing child TLVs
    - Do not present the EMV tag dictionary as an issuer-authoritative or certified source
    - Do not imply the parser performs EMV cryptogram verification
- **Alt text:** Nested tag-length-value tree in AmbiSecure's BER-TLV parser, unfolding EMV template 6F into DF Name and FCI proprietary children with client-side decoding.
- **Export filename:** `ambisecure-resources-tools-tlv-parser-1200x630.png`
- **Visual similarity group:** VSG-BYTE-PARSER
- **Currently uses:** resources.png
- **Notes:** Group variation: only concept built on recursive containment and depth; node set is EMV constructed/primitive tags.

## 007 — X.509 Certificate Viewer

- **Record number:** 7
- **Page name:** X.509 Certificate Viewer
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/x509-viewer/
- **Section:** Resource
- **Page type:** PARSER
- **Primary topic:** PKI | **Secondary:** Certificate lifecycle; Device identity
- **Design priority:** P1
- **Approved headline:** Read what a certificate actually asserts
- **Alternative headline:** Why your X.509 certificate got rejected
- **Category label:** TOOL
- **Core message:** Decodes an X.509 certificate in-browser so engineers can see the fields that explain a rejection — SANs, validity, key usage, basic constraints — without uploading anything.
- **Audience:** PKI engineer
- **Diagram type:** CERTIFICATE STRUCTURE
- **Visual concept:** Dominant object: one X.509 certificate rendered as an ASN.1 SEQUENCE card fanning open into its three top-level parts. Flow: tbsCertificate expands rightward into field chips — Subject/Issuer, Validity, Public Key, Extensions (SAN, keyUsage/EKU, basicConstraints) — while signatureAlgorithm and signatureValue sit inert and greyed at the bottom to show they are displayed, not checked; five nodes max. The card sits inside a browser viewport outline with a struck-through upload arrow: parsing is local and no certificate bytes leave the page. Labels allowed: tbsCertificate, RFC 5280, CA:TRUE / CA:FALSE, SAN, notBefore/notAfter. Must not imply chain validation, trust or revocation status. Within VSG-CERT-STRUCTURE this is the single-certificate field explosion, distinct from the chain ladder and the V2X hash chain.
- **Avoid:**
    - Do not show a green 'trusted' padlock or chain-validated verdict — the viewer verifies nothing
    - Do not draw a private key inside the certificate — only the public key is present
    - Do not label PEM and DER as certificate formats — X.509 is the format, they are encodings
    - Do not depict the certificate being uploaded
- **Alt text:** An X.509 certificate fanned open into subject, validity, key and extension chips in AmbiSecure's in-browser viewer — it reads assertions, it does not trust them.
- **Export filename:** `ambisecure-resources-tools-x509-viewer-1200x630.png`
- **Visual similarity group:** VSG-CERT-STRUCTURE
- **Currently uses:** resources.png

## 008 — PEM ↔ DER Converter

- **Record number:** 8
- **Page name:** PEM ↔ DER Converter
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/pem-der/
- **Section:** Resource
- **Page type:** ENGINEERING TOOL
- **Primary topic:** PKI | **Secondary:** Certificate lifecycle
- **Design priority:** P2
- **Approved headline:** PEM is DER in base64 armour
- **Alternative headline:** Same bytes, different container
- **Category label:** TOOL
- **Core message:** Converts certificates, CSRs and keys between PEM armour and raw DER in the browser, changing only the container and never the content.
- **Audience:** PKI engineer
- **Diagram type:** DATA PARSER
- **Visual concept:** Dominant object: a single DER byte-run shown twice — once as raw hex, once wrapped in base64 armour — joined by a two-headed arrow with an equals sign between them to make 'same bytes' explicit. Three primary nodes: the DER hex block, the -----BEGIN/END----- frame, and the PEM label chip (CERTIFICATE, CERTIFICATE REQUEST, PRIVATE KEY); a fourth node, an encrypted PRIVATE KEY block, is greyed and padlocked to show the converter swaps container only and never decrypts. Everything renders inside a browser frame with no network element — key material stays local. Labels allowed: DER, PEM, RFC 7468, X.690, and the label list. Must not imply re-encoding alters, re-signs or validates content. Within VSG-ENCODING-CONVERTER this is the symmetric two-way equality; the base64 decoder instead shows a detection funnel.
- **Avoid:**
    - Do not imply the converter can decrypt an encrypted private key
    - Do not present PEM and DER as different certificate formats — the DER bytes are identical
    - Do not show a key or certificate being uploaded
    - Do not suggest conversion changes or re-signs the content
- **Alt text:** One DER byte-run shown as raw hex and as base64 armour with an equals sign between: AmbiSecure's converter swaps the container, never the content.
- **Export filename:** `ambisecure-resources-tools-pem-der-1200x630.png`
- **Visual similarity group:** VSG-ENCODING-CONVERTER
- **Currently uses:** resources.png

## 009 — CSR Decoder

- **Record number:** 9
- **Page name:** PKCS#10 CSR Decoder
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/csr-decoder/
- **Section:** Resource
- **Page type:** PARSER
- **Primary topic:** PKI | **Secondary:** Certificate lifecycle
- **Design priority:** P2
- **Approved headline:** Decode your CSR before you submit
- **Alternative headline:** A CSR carries the public key only
- **Category label:** TOOL
- **Core message:** Decodes a PKCS#10 CSR client-side so you can confirm the subject DN, key type and requested SANs before a CA turns a typo into an issued certificate.
- **Audience:** PKI engineer
- **Diagram type:** CERTIFICATE STRUCTURE
- **Visual concept:** Dominant object: a PKCS#10 CSR drawn as a self-signed envelope, split into CertificationRequestInfo above and its signatureAlgorithm plus signature below. Flow: CertificationRequestInfo opens into three chips — subject DN, public key (algorithm + size), requestedExtensions/SAN list — and an arrow points toward a CA silhouette at the frame edge that is dimmed and unconnected, because the tool never contacts a CA; five nodes total. A private-key glyph sits outside the envelope, crossed out, since a CSR never carries one; parsing runs locally with no upload path. Labels allowed: RFC 2986, CertificationRequestInfo, CN, SAN. Must not imply the self-signature is verified or that submission happens here. Varies from the X.509 viewer by centring a request rather than an issued certificate.
- **Avoid:**
    - Do not draw a private key inside the CSR — only the public key is present
    - Do not show the tool contacting a CA or issuing a certificate
    - Do not imply the self-signature is checked or that private-key possession is proven
    - Do not give Common Name more visual weight than the SAN list
- **Alt text:** A PKCS#10 request opened into subject DN, public key and requested SANs, private key crossed out beside it — AmbiSecure's client-side CSR decoder.
- **Export filename:** `ambisecure-resources-tools-csr-decoder-1200x630.png`
- **Visual similarity group:** VSG-CERT-STRUCTURE
- **Currently uses:** resources.png

## 010 — Certificate Fingerprint

- **Record number:** 10
- **Page name:** Certificate Fingerprint Generator
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/cert-fingerprint/
- **Section:** Resource
- **Page type:** CALCULATOR
- **Primary topic:** PKI | **Secondary:** Certificate lifecycle; Attestation
- **Design priority:** P2
- **Approved headline:** Hash the DER, not the key
- **Alternative headline:** SHA-256 fingerprints for certificate pinning
- **Category label:** TOOL
- **Core message:** Computes SHA-1/256/384/512 fingerprints over a certificate's DER bytes in the browser via Web Crypto, for pinning and allow-list matching.
- **Audience:** PKI engineer
- **Diagram type:** TECHNICAL WORKBENCH
- **Visual concept:** Dominant object: a certificate's DER byte-run feeding a hash block and emerging as a colon-grouped digest strip. Flow: four nodes — DER bytes, an algorithm selector chip (SHA-256 emphasised, SHA-1 present but dimmed and tagged legacy), the resulting fingerprint, and an allow-list panel where the digest is compared. A fifth element, the public key drawn as a small chip inside the certificate, runs a dotted line to a second and visibly different digest — that contrast is the whole point: the fingerprint identifies the certificate, not the key. Hashing happens inside the browser via Web Crypto; no server node appears anywhere. Labels allowed: SHA-1/SHA-256/SHA-384/SHA-512, DER, Web Crypto. Must not imply the fingerprint proves authenticity, validity or issuance.
- **Avoid:**
    - Do not depict the fingerprint as a signature or a validity verdict — it is a hash of DER bytes
    - Do not present SHA-1 as a recommended default
    - Do not conflate certificate pinning with key pinning — reissuing the same key changes the cert fingerprint
    - Do not show bytes sent to a server for hashing
- **Alt text:** Certificate DER bytes entering a Web Crypto hash block and leaving as a digest strip, with SHA-1 dimmed as legacy — AmbiSecure's client-side fingerprint tool.
- **Export filename:** `ambisecure-resources-tools-cert-fingerprint-1200x630.png`
- **Visual similarity group:** VSG-CRYPTO-CALC
- **Currently uses:** resources.png
- **Notes:** Body mentions pinning AAGUIDs in FIDO MDS allow-lists; a FIDO cue is optional but must not imply attestation verification.

## 011 — Certificate Chain Viewer

- **Record number:** 11
- **Page name:** Certificate Chain Viewer
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/cert-chain/
- **Section:** Resource
- **Page type:** PARSER
- **Primary topic:** PKI | **Secondary:** Certificate lifecycle
- **Design priority:** P2
- **Approved headline:** Leaf, intermediate, root — in that order
- **Alternative headline:** Missing intermediate breaks the chain
- **Category label:** TOOL
- **Core message:** Shows how a PEM bundle's certificates line up by subject and issuer name so you can spot a missing intermediate or an out-of-order chain.
- **Audience:** PKI engineer
- **Diagram type:** TRUST CHAIN
- **Visual concept:** Dominant object: a vertical ladder of three certificate cards — leaf, intermediate, root — in the order a server must send them. Flow: each card's Issuer chip connects by a name-matching link to the Subject chip of the card below, and the root loops back on itself to show subject = issuer; a fourth element is a dashed gap where an intermediate is absent, carrying the error string 'unable to get local issuer certificate'. Signature, expiry and CRL/OCSP glyphs sit outside the frame, greyed and labelled as the TLS stack's job; parsing is local, nothing is transmitted. Labels allowed: Subject, Issuer, leaf/intermediate/root, RFC 5280 §6. Must not imply cryptographic path validation. Within VSG-CERT-STRUCTURE this is the name-linkage ladder, distinct from the single-cert field explosion and the V2X HashedId8 chain.
- **Avoid:**
    - Do not show signature verification, expiry or CRL/OCSP checks — linkage is by subject/issuer name only
    - Do not draw the root as issued from above — the root is self-signed
    - Do not order the root first — convention is leaf, intermediates, then root
    - Do not render a green 'chain trusted' badge
- **Alt text:** Leaf, intermediate and self-looping root cards joined by subject-issuer name links, with a dashed gap marking the missing intermediate that breaks TLS chains.
- **Export filename:** `ambisecure-resources-tools-cert-chain-1200x630.png`
- **Visual similarity group:** VSG-CERT-STRUCTURE
- **Currently uses:** resources.png

## 012 — Base64 Certificate Decoder
- **Record number:** 12
- **Page name:** Base64 Certificate Decoder
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/base64-cert/
- **Section:** Resource
- **Page type:** PARSER
- **Primary topic:** PKI | **Secondary:** Certificate lifecycle
- **Design priority:** P3
- **Approved headline:** Base64 in, DER and PEM out
- **Alternative headline:** Identify an unlabelled certificate blob
- **Category label:** TOOL
- **Core message:** Identifies an unlabelled certificate blob — PEM, bare base64 or hex — normalises it to DER and re-armours it as PEM with the correct label, entirely in-browser.
- **Audience:** Security practitioner
- **Diagram type:** DATA PARSER
- **Visual concept:** Dominant object: a funnel taking three unlabelled inputs — a full PEM block, bare headerless base64, and a hex dump — and narrowing to one normalised DER byte-run. Flow: five nodes — the three inputs, a type-detection chip reading 'X.509 cert? CSR?', and the re-armoured PEM output carrying the correct label, with a multi-block bundle hinted as a stack behind the output. Set inside a browser window with the dev-tools network pane visible and empty, echoing the page's own 'verify with dev-tools' privacy claim; nothing is uploaded. Labels allowed: base64, DER, hex, -----BEGIN CERTIFICATE-----. Must not imply chain building, revocation checking or decryption. Within VSG-ENCODING-CONVERTER this leads with identification of an unknown blob rather than the PEM↔DER converter's two-way equality.
- **Avoid:**
    - Do not show chain building or revocation — this decodes one blob at a time
    - Do not present base64 as encryption or obfuscation
    - Do not lead with raw binary DER input — this tool focuses on base64/PEM text
    - Do not show an upload progress bar or server round-trip
- **Alt text:** A funnel taking PEM, bare base64 and hex blobs down to normalised DER, then re-armouring with the right label — AmbiSecure's local certificate blob decoder.
- **Export filename:** `ambisecure-resources-tools-base64-cert-1200x630.png`
- **Visual similarity group:** VSG-ENCODING-CONVERTER
- **Currently uses:** resources.png
- **Notes:** Overlaps heavily with the X.509 viewer and the PEM↔DER converter; consolidation candidate — the detection-funnel visual is what keeps it distinct.

## 013 — PFX / PKCS#12 Inspector

- **Record number:** 13
- **Page name:** PFX / PKCS#12 Inspector
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/pfx-inspector/
- **Section:** Resource
- **Page type:** PARSER
- **Primary topic:** PKI | **Secondary:** Certificate lifecycle; Provisioning
- **Design priority:** P3
- **Approved headline:** What is inside a .pfx archive
- **Alternative headline:** PKCS#12 bags, keys left encrypted
- **Category label:** TOOL
- **Core message:** Reads the public structure of a .pfx/.p12 archive — bags, encryption schemes, embedded certificates — in the browser, deliberately without decrypting private-key bags.
- **Audience:** PKI engineer
- **Diagram type:** DATA PARSER
- **Visual concept:** Dominant object: a .pfx container cut away as an outer SEQUENCE box holding an AuthenticatedSafe with two SafeContents bags side by side. Flow: the certificate bag opens to reveal readable X.509 cards; the private-key bag stays shut behind a PBE padlock tagged PBES2 (PBKDF2 + AES), with a dimmed PBES1 SHA-1+3DES chip beside it marked legacy; a fifth node, the optional MAC, sits on the container edge. Draw the closed bag as a deliberate design boundary, not a failure state — the tool reads public structure only, locally, with the .pfx never leaving the browser. Labels allowed: RFC 7292, AuthenticatedSafe, SafeContents, PBES2, MAC. Must not show a decrypted key, a recovered password, or an extracted usable credential. Within VSG-BYTE-PARSER this is a nested container cutaway rather than a flat map decode.
- **Avoid:**
    - Do not show decrypted private keys or a password being cracked — key bags stay sealed
    - Do not depict PBES1 with SHA-1+3DES as current practice
    - Do not imply the tool extracts a usable key or credential
    - Do not show the .pfx being uploaded for server-side processing
- **Alt text:** A PKCS#12 container cutaway: certificate bags open and readable, the private-key bag padlocked under PBES2 — AmbiSecure inspects .pfx structure without decrypting.
- **Export filename:** `ambisecure-resources-tools-pfx-inspector-1200x630.png`
- **Visual similarity group:** VSG-BYTE-PARSER
- **Currently uses:** resources.png
- **Notes:** Page is incomplete by design (no password-based decryption; PBES2 support on the roadmap) and the body is thin. Human review before promoting on LinkedIn.

## 014 — ASN.1 BER/DER Parser

- **Record number:** 14
- **Page name:** ASN.1 BER/DER Parser
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/asn1-parser/
- **Section:** Resource
- **Page type:** PARSER
- **Primary topic:** BER-TLV | **Secondary:** PKI; Certificate lifecycle
- **Design priority:** P2
- **Approved headline:** Every DER byte has a shape
- **Alternative headline:** PEM in, ASN.1 tree out
- **Category label:** TOOL
- **Core message:** A client-side ASN.1 BER/DER parser that decodes hex, base64 or PEM into a clickable tree of SEQUENCEs, INTEGERs, OIDs and OCTET STRINGs with X.509 OID lookup.
- **Audience:** PKI engineer
- **Diagram type:** DATA PARSER
- **Visual concept:** Dominant object: a PEM block — the classic BEGIN/END armoured text slab — peeling open into a typed DER tree on the right, an input-transformation framing that sets it apart from the raw-hex ribbons elsewhere in this group and from the TLV parser's smart-card tags. The flow is decode-and-type: exactly five nodes, the worked example 30 03 02 01 05 shown as SEQUENCE (0x30, constructed, length 3) containing INTEGER (0x02, length 1, value 5), alongside three sibling type nodes — OBJECT IDENTIFIER (0x06) resolved via X.509 OID lookup, OCTET STRING (0x04), and a context-specific constructed tag A0 marked as optional field [0]. A quiet side note contrasts BER (several valid encodings) against DER (one canonical encoding, required by X.509). No hardware is shown; the file or pasted blob is decoded locally and nothing is transmitted. Allowed labels: SEQUENCE, INTEGER, OBJECT IDENTIFIER, OCTET STRING, 0x30, 0x02, 0xA0, BER, DER, X.690, PEM. Must not imply certificate validation.
- **Avoid:**
    - Do not present the tool as verifying a certificate chain, signature or trust — it decodes structure only
    - Do not attach semantic meaning to every OID, only common X.509 OIDs are looked up
    - Do not conflate this with the smart-card BER-TLV parser, whose conventions differ
    - Do not show DER as permitting multiple encodings of one value
    - Do not draw uploaded files travelling to a server
- **Alt text:** AmbiSecure ASN.1 BER/DER parser concept: a PEM block opening into a typed tree of SEQUENCE, INTEGER, OID and OCTET STRING nodes decoded entirely client-side.
- **Export filename:** `ambisecure-resources-tools-asn1-parser-1200x630.png`
- **Visual similarity group:** VSG-BYTE-PARSER
- **Currently uses:** resources.png
- **Notes:** Group variation: only concept driven by PEM/base64 input and ASN.1 universal types rather than hex bytes and card tags.

## 015 — ASCII ↔ HEX Converter

- **Record number:** 15
- **Page name:** ASCII ↔ HEX Converter
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/ascii-hex/
- **Section:** Resource
- **Page type:** ENGINEERING TOOL
- **Primary topic:** Other | **Secondary:** APDU; NFC; Smart cards
- **Design priority:** P3
- **Approved headline:** See what the bytes spell
- **Alternative headline:** One character is not one byte
- **Category label:** TOOL
- **Core message:** Converts text to its exact byte values and back so an engineer reading an APDU log, NDEF payload, or hex dump can see what the bytes actually spell, entirely in the browser.
- **Audience:** Smart-card engineer
- **Diagram type:** DATA PARSER
- **Visual concept:** Dominant object is a single horizontal ribbon: a row of ASCII characters sitting directly above its byte row, tied by short alignment ligatures — A over 41, B over 42, and a second worked pair H over 48, i over 69. The relationship is strict one-glyph-to-one-byte for ASCII, with one deliberate exception node showing the accented letter e-acute widening to C3 A9 under UTF-8. Five nodes maximum: character row, byte row, direction toggle (ASCII to HEX / HEX to ASCII), separator selector (space / comma / dash / none), enclosing browser-boundary ring marking that conversion is local. Variation within VSG-ENCODING-CONVERTER: this is the character-to-byte alignment ribbon — no code literals, no alphabet rails, no width grouping. Allowed labels: 41 42, 48 69, 0x41 = 'A', C3 A9. Must not imply hex is a protective transformation or that byte count always equals character count.
- **Avoid:**
    - Do not imply hex is encryption, obfuscation, or protection — it is the same bytes in a different notation
    - Do not show every character mapping to exactly one byte — e-acute is C3 A9 in UTF-8 and one byte only in Latin-1
    - Do not draw an upload or server round-trip — conversion is local to the browser
    - Do not depict this as an APDU parser: it converts strings and does not decode CLA/INS/P1/P2 or status words
- **Alt text:** Character-to-byte ribbon showing A and B resolve to 41 42 — the browser-local ASCII/hex view engineers use when reading APDU logs and NDEF payloads.
- **Export filename:** `ambisecure-resources-tools-ascii-hex-1200x630.png`
- **Visual similarity group:** VSG-ENCODING-CONVERTER
- **Currently uses:** resources.png
- **Notes:** Commodity converter with low differentiation; consolidation candidate alongside hex-bytes and the UTF-8 inspector if the tool set is trimmed.

## 016 — HEX ↔ Byte-Array Converter
- **Record number:** 16
- **Page name:** HEX ↔ Byte-Array
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/hex-bytes/
- **Section:** Resource
- **Page type:** ENGINEERING TOOL
- **Primary topic:** Other | **Secondary:** APDU; Smart cards; Embedded security
- **Design priority:** P3
- **Approved headline:** Log hex in, byte array out
- **Alternative headline:** Every byte is two hex digits
- **Category label:** TOOL
- **Core message:** Normalises the inconsistent hex emitted by PC/SC, Wireshark, gpshell, and OpenSC into clean counted byte pairs, then re-emits it as the C, Java, Python, or JavaScript literal the next tool expects.
- **Audience:** Embedded engineer
- **Diagram type:** DATA PARSER
- **Visual concept:** Dominant object is a normalising funnel: three ragged input spellings of the same value on the left (9000, 90:00, 0x90, 0x00) converging into one canonical byte-pair strip, which then fans out to programmer-literal cards. The relationship is many-formats-in, one-canonical-form, many-formats-out, with a byte counter riding on the strip. Five nodes maximum: ragged input stack, normaliser, canonical byte-pair strip with a '3 bytes' count badge reading 0A 0B 0C, a C array card { 0x0A, 0x0B, 0x0C }, a Uint8Array card. A small rejected chip shows 0A0 struck through as odd-length. Everything sits inside a browser-boundary frame; nothing communicates outward. Variation within VSG-ENCODING-CONVERTER: this one is the many-in/one-canonical-out funnel with code-literal cards, distinct from the ASCII character ribbon and the base64 alphabet tracks. Allowed labels: 0A 0B 0C, 90:00, 3 bytes, 32 bytes (SHA-256), 16 bytes (AES-128). Must not imply the tool interprets what the bytes mean.
- **Avoid:**
    - Do not show the tool decoding APDU or TLV meaning — it reformats and counts bytes, nothing more
    - Do not render an odd-length hex string such as 0A0 as producing valid output — it is rejected as ambiguous
    - Do not imply an AES key or SHA-256 value shown is generated, derived, or stored by the tool
    - Do not draw a server round-trip or telemetry — formatting and counting are client-side
- **Alt text:** Ragged hex from PC/SC and Wireshark logs funnelling into counted byte pairs and C, Java and Uint8Array literals in an AmbiSecure browser-local formatter.
- **Export filename:** `ambisecure-resources-tools-hex-bytes-1200x630.png`
- **Visual similarity group:** VSG-ENCODING-CONVERTER
- **Currently uses:** resources.png
- **Notes:** Scope overlaps ASCII to HEX and the endian converter; consolidation candidate within the byte-utility cluster.

## 017 — Base64 Encoder / Decoder

- **Record number:** 17
- **Page name:** Base64 Encoder / Decoder
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/base64/
- **Section:** Resource
- **Page type:** ENGINEERING TOOL
- **Primary topic:** Other | **Secondary:** FIDO2; WebAuthn
- **Design priority:** P2
- **Approved headline:** Base64 is encoding, not encryption
- **Alternative headline:** Same bytes, two alphabets
- **Category label:** TOOL
- **Core message:** Encodes and decodes standard and URL-safe base64 in the browser while making the page's central point unmissable: base64 is a transport encoding with no key and no confidentiality.
- **Audience:** Security practitioner
- **Diagram type:** COMPARISON
- **Visual concept:** Dominant object is a two-track comparison fed by one shared byte source: the word hello splits into a standard base64 track producing aGVsbG8= (alphabet chip + /, padding chip =) and a URL-safe track producing aGVsbG8 (alphabet chip - _, padding dropped). The relationship is one input, two alphabets, identical recovered bytes. Four nodes: source bytes, standard track, URL-safe track, and a marker rendered as an open padlock with no keyhole labelled 'no key, no confidentiality'. All of it sits inside a browser-boundary frame; no server node exists. Variation within VSG-ENCODING-CONVERTER: this is the two-track alphabet fork off a single source, unlike the ASCII ribbon, the hex funnel, or the base64url radial fan. Allowed labels: hello, aGVsbG8=, aGVsbG8, RFC 4648, + / vs - _. Must not imply base64 protects anything or belongs solely to WebAuthn.
- **Avoid:**
    - Do not draw a closed padlock, key, cipher, or shield — base64 is reversible with no key and provides zero confidentiality
    - Do not show URL-safe base64 retaining = padding or using + and / characters
    - Do not present base64 as compression — it grows the payload by roughly one third
    - Do not show the blob being decoded on an AmbiSecure or third-party server
- **Alt text:** Two-column comparison of standard base64 against base64url, contrasting their alphabets, padding and RFC 4648 sections.
- **Export filename:** `ambisecure-resources-tools-base64-1200x630.png`
- **Visual similarity group:** VSG-ENCODING-CONVERTER
- **Currently uses:** resources.png
- **Notes:** Overlaps rec 48; keep the standard-versus-URL-safe comparison here and reserve the WebAuthn/JOSE/CTAP2 framing for the base64url page.

## 018 — UTF-8 Inspector

- **Record number:** 18
- **Page name:** UTF-8 Inspector
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/utf8/
- **Section:** Resource
- **Page type:** ENGINEERING TOOL
- **Primary topic:** Other | **Secondary:** BER-TLV; JavaCard
- **Design priority:** P3
- **Approved headline:** One to four bytes per character
- **Alternative headline:** Codepoints, bytes, and a hidden BOM
- **Category label:** TOOL
- **Core message:** Breaks a string into per-character codepoints and UTF-8 byte counts with BOM detection, showing exactly why a string is longer in bytes than in characters.
- **Audience:** Embedded engineer
- **Diagram type:** DATA PARSER
- **Visual concept:** Dominant object is a vertical per-character breakdown stack, one row per character, where each row's byte block visibly widens: A / U+0041 / 41 at one byte; e-acute / U+00E9 / C3 A9 at two; a CJK glyph / U+6C34 at three; an emoji at four. A fifth row is a flagged EF BB BF BOM chip marked 'detected, not required'. The relationship is codepoint to variable-width byte run, read top to bottom, with a running byte-count gutter. Five rows maximum. The whole stack sits inside a browser-boundary frame; no byte communicates outward. Variation within VSG-ENCODING-CONVERTER: this is the stacked per-character breakdown showing variable byte width — not a two-track fork, funnel, or mirrored axis. Allowed labels: U+0041, U+00E9, C3 A9, EF BB BF, RFC 3629. Must not imply UTF-8 is fixed-width or that the tool re-encodes text.
- **Avoid:**
    - Do not show a fixed two-bytes-per-character grid — that is UTF-16, not UTF-8
    - Do not show ASCII characters in U+0000 to U+007F expanding beyond a single byte
    - Do not present the BOM as required or expected in UTF-8 — it is merely detected
    - Do not imply the inspector converts or re-encodes text — it only reports codepoints and byte widths
- **Alt text:** Per-character stack showing ASCII at one byte, an accented letter as C3 A9 and an emoji at four bytes, plus a flagged BOM row, inspected locally in the browser.
- **Export filename:** `ambisecure-resources-tools-utf8-1200x630.png`
- **Visual similarity group:** VSG-ENCODING-CONVERTER
- **Currently uses:** resources.png
- **Notes:** Very thin body (~717 chars); worth expanding the copy before promoting the image anywhere.

## 019 — Endian Converter

- **Record number:** 19
- **Page name:** Endian Converter
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/endian/
- **Section:** Resource
- **Page type:** ENGINEERING TOOL
- **Primary topic:** Other | **Secondary:** APDU; ATR; Embedded security
- **Design priority:** P3
- **Approved headline:** Big-endian card, little-endian host
- **Alternative headline:** Byte order bugs, made visible
- **Category label:** TOOL
- **Core message:** Swaps u16/u32/u64 byte order between big- and little-endian and shows the unsigned value, so big-endian card and network fields stop silently disagreeing with little-endian x86 and ARM hosts.
- **Audience:** Embedded engineer
- **Diagram type:** COMPARISON
- **Visual concept:** Dominant object is one u32 word rendered twice across a mirrored vertical axis: 00 00 12 34 on the big-endian side, 34 12 00 00 on the little-endian side, whole bytes swapping as intact blocks with crossing tie-lines. Anchored on the axis itself is the single unsigned value 4660, unchanged by the mirror — that invariance is the technical point. Five nodes maximum: source hex block, width selector (u16 / u32 / u64), BE lane tagged 'smart card / network', LE lane tagged 'x86 / ARM', the shared value chip. Enclosed by a browser-boundary frame; nothing is sent out. Variation within VSG-ENCODING-CONVERTER: this is the mirrored byte-order axis with one invariant numeric value — not an alphabet fork, character stack, or literal funnel. Allowed labels: u16 / u32 / u64, 00 00 12 34, 34 12 00 00, 4660, BE, LE. Must not imply bits or nibbles reverse.
- **Avoid:**
    - Do not reverse bits or nibbles — endianness swaps whole bytes only
    - Do not show the unsigned value changing between the BE and LE views — only the byte layout differs
    - Do not label smart-card, banking, or network byte order as little-endian — those are big-endian
    - Do not show a swap applied to a hex string that is not a whole multiple of the selected width
- **Alt text:** Mirrored axis turning a big-endian u32 into its little-endian layout while the unsigned value holds steady, in the AmbiSecure client-side byte-order converter.
- **Export filename:** `ambisecure-resources-tools-endian-1200x630.png`
- **Visual similarity group:** VSG-ENCODING-CONVERTER
- **Currently uses:** resources.png
- **Notes:** Thin body (~797 chars) and narrow utility; supporting reference for the APDU/ATR tool cluster.

## 020 — Length-Field Encoder

- **Record number:** 20
- **Page name:** Length-Field Encoder
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/length-field/
- **Section:** Resource
- **Page type:** CALCULATOR
- **Primary topic:** BER-TLV | **Secondary:** APDU; Personalization
- **Design priority:** P3
- **Approved headline:** One length, five encodings
- **Alternative headline:** BER, DGI, or raw u16
- **Category label:** TOOL
- **Core message:** Encodes one integer length into BER long-form, GlobalPlatform DGI, and raw u8/u16 big- and little-endian, for engineers hand-building TLV and APDU structures.
- **Audience:** Smart-card engineer
- **Diagram type:** TECHNICAL WORKBENCH
- **Visual concept:** Dominant object: a single decimal integer — 300 (0x12C) — sitting at a fan-out hub on the left, with encoded byte groups radiating to the right; a one-to-many divergence rather than the one-to-one decode of the parsers, and the only concept in this batch where bytes are produced rather than taken apart. Exactly four output nodes plus the source: BER long form (0x82 01 2C — the 0x80|N marker followed by N length bytes), DGI long form (0xFF 01 2C, used when the value is not short), raw u16 big-endian (01 2C), and raw u16 little-endian (2C 01), with a greyed u8 lane marked as out-of-range for this value. A short rule strip notes BER short form applies at or below 127 and DGI short form below 0xFF. Nothing hardware-side; encoding runs locally. Allowed labels: BER, DGI, u8, u16, BE, LE, 0x82, 0xFF, 300, 0x12C, X.690, GP 2.3.1. Must not imply the tool writes to a card.
- **Avoid:**
    - Do not swap the BER and DGI long-form markers — BER uses 0x80|N, DGI uses 0xFF followed by two bytes
    - Do not show a u8 lane carrying a value above 255
    - Do not present length encoding as a cryptographic or security operation
    - Do not imply the encoder personalises or provisions a card
    - Do not show identical byte order for the BE and LE outputs
- **Alt text:** Length-field encoder concept from AmbiSecure fanning the value 300 into BER long-form, GlobalPlatform DGI and raw u16 big- and little-endian byte groups.
- **Export filename:** `ambisecure-resources-tools-length-field-1200x630.png`
- **Visual similarity group:** VSG-ENCODING-CONVERTER
- **Currently uses:** resources.png
- **Notes:** Thin page (795 chars body). Possible consolidation candidate with the endian converter.

## 021 — SW1/SW2 Lookup

- **Record number:** 21
- **Page name:** SW1/SW2 Lookup
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/sw-lookup/
- **Section:** Resource
- **Page type:** ENGINEERING TOOL
- **Primary topic:** APDU | **Secondary:** Smart cards; JavaCard
- **Design priority:** P3
- **Approved headline:** Find the status word fast
- **Alternative headline:** Two bytes explain the failure
- **Category label:** TOOL
- **Core message:** A local search that resolves any smart-card status word by hex or by phrase across ISO/IEC 7816-4, GlobalPlatform, EMV and FIDO returns.
- **Audience:** Smart-card engineer
- **Diagram type:** TECHNICAL WORKBENCH
- **Visual concept:** Dominant object: a single search field holding the query 6A82, with a short stack of ranked match cards resolving beneath it — a query-and-match interaction, deliberately unlike the exhaustive grid used for the APDU status dictionary in the same family. The flow is bidirectional lookup: hex in, meaning out, and phrase in, hex out (a second chip shows the query "file not found" resolving back to 6A82). Exactly five result nodes: 9000 (OK), 6A82 (file or application not found), 6982 (security status not satisfied), 63CX (PIN retries remaining, X = attempts left), and 6CXX (wrong Le, exact length is XX). No card or reader is drawn — the emphasis is that the table is static and every search runs locally with nothing transmitted. Allowed labels: SW1, SW2, 9000, 6A82, 6982, 63CX, 6CXX, ISO/IEC 7816-4 §5.1.4. Must not imply the tool queries a card, a reader, or a remote database.
- **Avoid:**
    - Do not show the search calling a remote API — the dictionary is static and searched in-browser
    - Do not present 63CX as a fixed value, the low nibble carries the remaining retry count
    - Do not frame status-word lookup as PIN recovery, brute-forcing or an attack aid
    - Do not show 9000 as an error colour or 6XYY as uniformly fatal — 62/63 are warnings
    - Do not attribute every status word to ISO 7816-4 when GlobalPlatform, EMV and FIDO extend the range
- **Alt text:** AmbiSecure SW1/SW2 lookup concept: a local search resolving 6A82 and related smart-card status words by hex or phrase, with no query leaving the browser.
- **Export filename:** `ambisecure-resources-tools-sw-lookup-1200x630.png`
- **Visual similarity group:** VSG-REFERENCE-TABLE
- **Currently uses:** resources.png
- **Notes:** Thin page (840 chars). Strong consolidation candidate with rec 22 APDU status dictionary — same corpus, different interaction. Flag for human review.

## 022 — APDU Status Dictionary

- **Record number:** 22
- **Page name:** APDU Status Dictionary
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/apdu-status-dict/
- **Section:** Resource
- **Page type:** REFERENCE DATABASE
- **Primary topic:** APDU | **Secondary:** Smart cards; JavaCard
- **Design priority:** P2
- **Approved headline:** The whole SW1/SW2 table
- **Alternative headline:** Status words from four standards
- **Category label:** REFERENCE
- **Core message:** A browseable, filterable dictionary of every common smart-card status word, grouped by range and filterable by source standard.
- **Audience:** Smart-card engineer
- **Diagram type:** COMPARISON
- **Visual concept:** Dominant object: a dense, full-bleed reference grid of status words seen all at once, with a source-filter rail down the left — the completeness of the corpus is the point, in direct contrast to the single-query search card used for the SW lookup tool in this family. The organising relationship is range grouping: exactly five structural nodes — the 9XYY band (success and proprietary), the 6XYY band (warnings and errors), and three pattern rows called out as wildcards, 61XX (more data available), 6CXX (wrong Le, exact length is XX) and 63CX (PIN retries remaining). The filter rail carries four source chips: ISO 7816-4, GlobalPlatform, EMV, FIDO. No hardware and no network — a static reference where no input leaves the browser. Allowed labels: SW1, SW2, 9XYY, 6XYY, 61XX, 6CXX, 63CX, ISO 7816-4, GlobalPlatform, EMV, FIDO. Must not imply the table is exhaustive of proprietary card-specific returns.
- **Avoid:**
    - Do not render 61XX, 6CXX or 63CX as literal fixed hex — the low byte or nibble is a variable
    - Do not show the table as live-fetched or backed by a server, it is a static in-page reference
    - Do not imply the four source standards define identical meanings for the same status word
    - Do not present the dictionary as a compliance or certification check
    - Do not label the whole 6XYY range as errors when 62 and 63 are warnings
- **Alt text:** Filterable status-word reference from AmbiSecure grouping 9XYY successes against 6XYY warnings and errors, with ISO 7816-4, GlobalPlatform, EMV and FIDO sources.
- **Export filename:** `ambisecure-resources-tools-apdu-status-dict-1200x630.png`
- **Visual similarity group:** VSG-REFERENCE-TABLE
- **Currently uses:** resources.png
- **Notes:** Consolidation candidate with rec 21; if merged, this page is the surviving canonical reference.

## 023 — ISO/IEC 7816 Quick Reference

- **Record number:** 23
- **Page name:** ISO/IEC 7816 Quick Reference
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/iso7816-ref/
- **Section:** Resource
- **Page type:** PROTOCOL REFERENCE
- **Primary topic:** APDU | **Secondary:** Smart cards; Secure Elements
- **Design priority:** P2
- **Approved headline:** ISO/IEC 7816 on one page
- **Alternative headline:** Four APDU cases, CLA bits, INS bytes
- **Category label:** REFERENCE
- **Core message:** A bookmark-friendly quick reference covering APDU case shapes, CLA bit meanings, common INS bytes and the ISO/IEC 7816 part family on one page.
- **Audience:** Smart-card engineer
- **Diagram type:** STANDARD STACK
- **Visual concept:** Dominant object: a printed quick-reference card, laid out as four stacked panels — the artefact itself is the subject, not a byte stream, which separates it from every parser and lookup in the batch. The relationship is compositional, moving from message shape down to standard family, across exactly five nodes: the four APDU case shapes (case 1 header only; case 2 adds Le; case 3 adds Lc + data; case 4 both), a CLA bit-field ruler marking b8=1 as proprietary and b4..b3 as the secure-messaging indicator with b2..b1 as logical channel, a two-column INS table (A4 SELECT, B0 READ BINARY, 20 VERIFY, 86 GENERAL AUTHENTICATE), an extended-length note (0x00-prefixed, 2-byte, up to 65535 per direction), and a spine listing the parts -3, -4, -8, -9, -15. Static reference; no input leaves the browser. Allowed labels: CLA, INS, P1, P2, Lc, Le, A4, B0, 20, 86, ISO/IEC 7816-3/-4/-8/-9/-15. Must not imply a live card session.
- **Avoid:**
    - Do not show case 1 carrying Lc or Le — it is header-only
    - Do not draw extended-length Lc/Le as single bytes
    - Do not present GlobalPlatform's 0x80 CLA as inter-industry ISO 7816-4
    - Do not imply secure messaging is in force when b4..b3 = 00
    - Do not present the quick reference as a substitute for the ISO/IEC 7816-4 specification itself
- **Alt text:** AmbiSecure quick-reference card visual covering the four ISO/IEC 7816-4 APDU cases, CLA bit meanings including secure messaging, and common INS byte values.
- **Export filename:** `ambisecure-resources-tools-iso7816-ref-1200x630.png`
- **Visual similarity group:** VSG-REFERENCE-TABLE
- **Currently uses:** resources.png
- **Notes:** High internal-link value as the hub for the APDU tool cluster.

## 024 — GlobalPlatform Status Reference

- **Record number:** 24
- **Page name:** GlobalPlatform Status Reference
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/gp-status/
- **Section:** Resource
- **Page type:** REFERENCE DATABASE
- **Primary topic:** JavaCard | **Secondary:** Smart cards; Provisioning; APDU
- **Design priority:** P2
- **Approved headline:** From OP_READY to TERMINATED
- **Alternative headline:** Why your applet is not selectable
- **Category label:** REFERENCE
- **Core message:** A reference to GlobalPlatform 2.3.1 card and application lifecycle states and ISD privileges, for engineers debugging why an applet is not selectable.
- **Audience:** JavaCard developer
- **Diagram type:** LIFECYCLE
- **Visual concept:** Dominant object: a one-way card lifecycle track running left to right, drawn as a ratchet — states advance and, past a point, cannot return. Exactly five nodes carrying their lifecycle bytes: OP_READY (01), INITIALIZED (07), SECURED (0F, secure channel required for management), CARD_LOCKED (7F, reversible only by the ISD), and TERMINATED (FF, permanent, all management commands rejected) drawn as a hard terminal stop. A slim parallel lane beneath shows the application track (INSTALLED 03 → SELECTABLE 07 → PERSONALIZED 0F, with LOCKED 83 branching off) to make the two-level relationship explicit. Inside the card stay the ISD, its keys and the applet code; what crosses outward is only the GET STATUS response carrying the lifecycle byte. Allowed labels: OP_READY, INITIALIZED, SECURED, CARD_LOCKED, TERMINATED, 01, 07, 0F, 7F, FF, GET STATUS, ISD, GlobalPlatform 2.3.1. Must not imply TERMINATED is recoverable.
- **Avoid:**
    - Do not draw a return arrow out of TERMINATED — it is permanent end-of-life
    - Do not show CARD_LOCKED as unrecoverable, only the ISD can transition it back
    - Do not conflate the card lifecycle with the application lifecycle, they are separate state sets that reuse hex values such as 07 and 0F
    - Do not show management commands succeeding in SECURED without a secure channel
    - Do not imply AmbiSecure certifies GlobalPlatform compliance
- **Alt text:** GlobalPlatform lifecycle reference from AmbiSecure tracing a card from OP_READY through SECURED to irreversible TERMINATED, alongside the applet state track.
- **Export filename:** `ambisecure-resources-tools-gp-status-1200x630.png`
- **Visual similarity group:** VSG-CARD-LIFECYCLE
- **Currently uses:** resources.png
- **Notes:** New VSG: card/applet lifecycle states are neither PKI lifecycle nor a byte parser. Links to the JavaCard development service — mild commercial pull.

# BLOG PAGES

## 025 — APDU from First Principles

- **Record number:** 25
- **Page name:** APDU from First Principles: CLA, INS, P1/P2, Le, Lc, and SW1/SW2
- **Canonical URL:** https://ambisecure.ambimat.com/blog/apdu-from-first-principles/
- **Section:** Blog
- **Page type:** TECHNICAL ARTICLE
- **Primary topic:** APDU | **Secondary:** Smart cards;JavaCard
- **Design priority:** P1
- **Approved headline:** Four Cases, Two Status Bytes
- **Alternative headline:** ISO/IEC 7816-4 Without the Spec PDF
- **Category label:** TECHNICAL ARTICLE
- **Core message:** The four ISO/IEC 7816-4 APDU cases, the CLA bit layout, and the status words an engineer actually meets in production — plus the length and encoding pitfalls that keep biting shipped code.
- **Audience:** Smart-card engineer
- **Diagram type:** DATA PARSER
- **Visual concept:** Dominant object: a single command APDU laid out as a byte ribbon, with the four ISO/IEC 7816-4 cases stacked beneath it as progressively longer rows so the reader sees Lc and Le appear and disappear. The technical relationship is directional: reader sends the command ribbon to the card, the card returns a response ribbon that always terminates in SW1 SW2. Five major nodes only: CLA, INS, P1 P2, Lc+Data, Le — with the response tail (Data || SW1 SW2) drawn as a detached return row. Nothing lives inside hardware in this frame; this is the wire format, so the card is a flat silhouette at the ribbon's end rather than a cutaway, and no key material appears anywhere on the bus. Labels allowed: CLA, INS, P1, P2, Lc, Le, SW1, SW2, Case 1–4, and the worked bytes 00 A4 04 00, 9000, 6A82. Must not imply the article or its companion parser validates security or attacks a card.
- **Avoid:**
    - Do not draw Le in a Case 1 or Case 3 layout, or Lc in a Case 2 layout — the case is defined by which length fields are absent
    - Do not render 9000 as a security verdict rather than a plain normal-completion status word
    - Do not depict the APDU bus as an encrypted channel — plain APDUs carry no confidentiality unless secure messaging is set in CLA
    - Do not show an extended-length APDU with a single-byte Lc field
- **Alt text:** Byte-level anatomy of an ISO/IEC 7816-4 command APDU across its four cases, showing how CLA, INS, P1/P2, Lc, Le and SW1/SW2 frame every smart-card exchange.
- **Export filename:** `ambisecure-blog-apdu-from-first-principles-1200x630.png`
- **Visual similarity group:** VSG-BYTE-PARSER
- **Currently uses:** blog.png
- **Notes:** Cornerstone of the APDU cluster and links out to the APDU parser tool. Keep the image clearly editorial (byte anatomy) rather than tool UI, so it does not collide visually with the parser page's own featured image.

## 026 — Engineering Blog

- **Record number:** 26
- **Page name:** Practical, code-first writing on hardware-rooted security.
- **Canonical URL:** https://ambisecure.ambimat.com/blog/
- **Section:** Blog
- **Page type:** OTHER BLOG
- **Primary topic:** Other | **Secondary:** FIDO2;JavaCard;Transit security
- **Design priority:** P2
- **Approved headline:** Code-First Writing on Hardware Security
- **Alternative headline:** Written by Engineers Who Shipped It
- **Category label:** BLOG
- **Core message:** The index to AmbiSecure's code-first engineering writing across FIDO and WebAuthn, JavaCard and APDU, DESFire and SAM-backed transit, V2X and secure-element architecture.
- **Audience:** Security practitioner
- **Diagram type:** CONCEPTUAL ILLUSTRATION
- **Visual concept:** Dominant object: an editorial index plate — five topic tiles arranged as a table of contents, deliberately not a technical diagram, because this is the blog hub rather than any one article. The relationship shown is wayfinding: each tile names one engineering cluster and carries a small monochrome hardware glyph as its only illustration. Five nodes maximum: FIDO & WebAuthn, JavaCard & APDU, DESFire & SAM transit, V2X & device identity, secure-element architecture. Nothing is inside hardware here — hardware appears only as tile glyphs at glyph scale, never opened or cut away. What communicates externally: nothing; there is no flow to draw. Labels allowed: the five cluster names and the words 'Engineering blog'. Must not imply a product page, a single article's subject, or any certification. Within its group this is the only page whose dominant object is a content index rather than a technical structure.
- **Avoid:**
    - Do not borrow any single article's diagram as the hero — this is the index, and reusing one article's visual mis-signals the destination
    - Do not feature a specific product or form factor as the dominant object on a hub page
    - Do not imply the 24-item engineering archive and the current blog are one collection — the page separates them
    - Do not print article counts or dates that will go stale between publication and share
- **Alt text:** Wayfinding plate for the AmbiSecure engineering blog, grouping its clusters — FIDO, JavaCard and APDU, DESFire transit, V2X and secure-element work — into five topic tiles.
- **Export filename:** `ambisecure-blog-1200x630.png`
- **Visual similarity group:** VSG-CONTENT-HUB
- **Currently uses:** blog.png
- **Notes:** Blog index, not an article; no pub/mod date. Body advertises a separate 'Engineering archive (24)' alongside current content — confirm with a human whether the hub image should represent current engineering content only. VSG-CONTENT-HUB invented because no listed VSG covers a content index.

## 027 — Implementing FIDO2

- **Record number:** 27
- **Page name:** Implementing FIDO2 Authentication: A Complete Developer Guide
- **Canonical URL:** https://ambisecure.ambimat.com/blog/implementing-fido2-developer-guide/
- **Section:** Blog
- **Page type:** HOW-TO ARTICLE
- **Primary topic:** FIDO2 | **Secondary:** WebAuthn;Attestation;Phishing-resistant authentication
- **Design priority:** P1
- **Approved headline:** Six Steps to a FIDO2 Credential
- **Alternative headline:** WebAuthn Above, CTAP2 Below
- **Category label:** TECHNICAL ARTICLE
- **Core message:** An end-to-end FIDO2 implementation walkthrough — WebAuthn and CTAP2, the registration and authentication ceremonies, attestation, and resident-credential choices — with code that compiles.
- **Audience:** Security architect
- **Diagram type:** PROTOCOL FLOW
- **Visual concept:** Dominant object: the registration ceremony as a left-to-right protocol flow, drawn as the article's own six numbered steps rather than an abstract trust triangle. The technical relationship is a round trip: server issues a random challenge → browser calls navigator.credentials.create() → authenticator mints a fresh keypair scoped to that origin → attestation and credential ID return → server verifies and stores credentialId + publicKey. Five nodes only: relying-party server, browser (WebAuthn), CTAP2 transport, authenticator, credential store. What stays inside hardware: the ES256 private key, sealed in the authenticator node with no outbound arrow of any kind. What communicates externally: the challenge inbound, and credential ID, public key and attestation statement outbound. Labels allowed: WebAuthn, CTAP2, USB-HID/NFC/BLE, ES256 (-7), challenge, attestation, credentialId, publicKey. Must not imply the server ever holds replayable secret material. Within VSG-FIDO-CEREMONY this is the create() registration round trip, not the get() assertion.
- **Avoid:**
    - Do not draw any arrow carrying the private key out of the authenticator — the article's core claim is that it is generated and stays inside
    - Do not show one keypair shared across origins
    - each origin gets its own, and that is what makes the credential phishing-resistant
    - Do not depict the server storing anything that, if leaked, lets an attacker log in
    - Do not present attestation as proving who the user is — it proves make and model only
- **Alt text:** WebAuthn registration end to end: a server challenge, an origin-scoped keypair born inside the authenticator, attestation out, and only the public key stored server-side.
- **Export filename:** `ambisecure-blog-implementing-fido2-developer-guide-1200x630.png`
- **Visual similarity group:** VSG-FIDO-CEREMONY
- **Currently uses:** blog.png
- **Notes:** Cornerstone; first published 2025-01-20 and updated 2026. Code samples use @simplewebauthn — do not surface third-party library branding in the image.

## 028 — Why use Multi-factor Authentication?
- **Record number:** 28
- **Page name:** Why use Multi-factor Authentication?
- **Canonical URL:** https://ambisecure.ambimat.com/blog/why-use-multi-factor-authentication/
- **Section:** Blog
- **Page type:** SECURITY ANALYSIS
- **Primary topic:** Phishing-resistant authentication | **Secondary:** Hardware security keys;FIDO2
- **Design priority:** P2
- **Approved headline:** Twelve Billion Credentials Already Leaked
- **Alternative headline:** The Long Tail of Credential Stuffing
- **Category label:** SECURITY EXPLAINER
- **Core message:** Attackers already hold billions of leaked credentials, so the value of a second factor — and especially a hardware-bound one — is that it cuts off the long tail of credential stuffing and phishing replay.
- **Audience:** CISO
- **Diagram type:** CONCEPTUAL ILLUSTRATION
- **Visual concept:** Dominant object: a credential-stuffing funnel — a dense field of leaked credential rows on the left, narrowing through successive gates to the right. The relationship is attrition at scale: enormous stolen volume meets each factor requirement and the attacker's survival rate collapses gate by gate. Five nodes: the leaked credential field (~12 billion), automated login attempts, the password-only gate (passes freely), the OTP gate (attacker must intercept in real time, per account), the hardware-bound gate (origin binding makes the phished credential unusable). What stays inside hardware: the FIDO2 credential inside the final gate's token glyph, which has no outbound key arrow. What communicates externally: only the attempt traffic flowing left to right. Labels allowed: knowledge / possession / inherence, credential stuffing, ~12 billion. Must not imply a measured block rate or vendor benchmark — the article claims only that hardware-bound factors are not phishable because the challenge is origin-bound.
- **Avoid:**
    - Do not show SMS or app OTP as phishing-resistant — the article's pivot is that it is harvestable and replayable inside its 30-second window
    - Do not put a numeric block rate or efficacy percentage on any gate
    - Do not depict biometrics as a standalone factor replacing possession rather than an inherence factor combined with one
    - Do not present the ~12 billion figure as an AmbiSecure measurement — it is attributed to Have I Been Pwned
- **Alt text:** Credential-stuffing funnel showing why a password gate falls open, an OTP gate only raises attacker cost, and an origin-bound hardware factor blocks credential reuse outright.
- **Export filename:** `ambisecure-blog-why-use-multi-factor-authentication-1200x630.png`
- **Visual similarity group:** VSG-THREAT-LANDSCAPE
- **Currently uses:** blog.png
- **Notes:** 2021 post refreshed in 2026; overlaps heavily with rec 29 (Top 3 Benefits of MFA) — same thesis, same era, same CTA family. Consolidation candidate: flag for human review before commissioning two separate images. Treated here as the broader/canonical of the pair.

## 029 — Top 3 Benefits of Multi-factor Authentication
- **Record number:** 29
- **Page name:** Top 3 Benefits of Multi-factor Authentication
- **Canonical URL:** https://ambisecure.ambimat.com/blog/top-3-benefits-of-mfa/
- **Section:** Blog
- **Page type:** SECURITY ANALYSIS
- **Primary topic:** Hardware security keys | **Secondary:** Phishing-resistant authentication;FIDO2;Attestation
- **Design priority:** P3
- **Approved headline:** Three Reasons MFA Isn't Optional
- **Alternative headline:** What Hardware-Bound Actually Changes
- **Category label:** SECURITY EXPLAINER
- **Core message:** MFA earns its place by killing credential stuffing, bounding the blast radius of a successful phish, and producing audit evidence — and hardware-bound factors change what each of those three is worth.
- **Audience:** IAM leader
- **Diagram type:** COMPARISON
- **Visual concept:** Dominant object: a compact grading matrix — three factor classes down the rows, three attack-or-outcome classes across the columns. Rows: password only, SMS/app OTP, hardware-bound (FIDO2 card, USB key, biometric token). Columns: credential stuffing, phishing blast radius, audit evidence. Five nodes: the three row headers plus the two axis labels; individual cells are marks, not nodes. What stays inside hardware: the bottom row's cell art carries a small OnePass-class card glyph whose credential is sealed and drawn with no exit path. What communicates externally: only the AAGUID and attestation named in the audit column, travelling to the verifier. Labels allowed: credential stuffing, phishing, audit, AAGUID, attestation, FIDO2. Must not imply certification claims for AmbiSecure. Within VSG-COMPARISON-MATRIX this is the only matrix graded against attack classes; the DESFire ladder grades generations and the workforce matrix grades form factors.
- **Avoid:**
    - Do not mark OTP as failing credential stuffing — the article explicitly credits it with raising cost from free to real-time interception
    - Do not present PCI DSS, NIST 800-63, SOC 2, ISO 27001 or India DPDP as certifications AmbiSecure holds
    - they are frameworks named as context
    - Do not show AAGUID or attestation as identifying the user rather than the device make and model
    - Do not draw the hardware-bound row as immune to enrolment fraud or help-desk recovery abuse
- **Alt text:** Matrix scoring password-only, OTP and hardware-bound MFA against credential stuffing, phishing blast radius and audit evidence, with AAGUID attestation as the audit lever.
- **Export filename:** `ambisecure-blog-top-3-benefits-of-mfa-1200x630.png`
- **Visual similarity group:** VSG-COMPARISON-MATRIX
- **Currently uses:** blog.png
- **Notes:** Consolidation candidate with rec 28 — near-identical thesis, both 2021, both short. If the two posts merge, retire this image in favour of rec 28's. Compliance frameworks in the body are context only, never AmbiSecure certifications.

# RESOURCE PAGES

## 030 — DESFire Status Decoder

- **Record number:** 30
- **Page name:** DESFire Status Decoder
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/desfire-status/
- **Section:** Resource
- **Page type:** REFERENCE DATABASE
- **Primary topic:** Smart cards | **Secondary:** NFC; Transit security; APDU
- **Design priority:** P3
- **Approved headline:** What DESFire 00, AF and AE Mean
- **Alternative headline:** Every DESFire Status Byte, Searchable
- **Category label:** REFERENCE
- **Core message:** A searchable field reference for the DESFire response status bytes engineers actually meet, distinguishing success, chaining and authentication-state refusals at a glance.
- **Audience:** Smart-card engineer
- **Diagram type:** TECHNICAL WORKBENCH
- **Visual concept:** Dominant object: a search field sitting above a filtered column of status-byte rows, with a DESFire response frame running along the top and its single trailing byte pulled out and magnified into the list. Flow: typing a hex byte or phrase narrows the column — the relationship shown is lookup, not decode, which is what separates this from the DESFire parser images in the same family. Exactly five rows carry labels: 00 OPERATION_OK (success tone), AF ADDITIONAL_FRAME (info tone, chained response), AE AUTHENTICATION_ERROR, 9D PERMISSION_DENIED, and 1E INTEGRITY_ERROR. The whole table lives inside a browser frame with a small 'static reference, nothing leaves your browser' cue and no card, reader or network link attached. Allowed labels: the five hex values and their exact NXP names. Must not imply live card interrogation or that the list is exhaustive of NXP's full table.
- **Avoid:**
    - Do not render DESFire status as an ISO 7816 status word pair such as 9000 or 6A82 — native DESFire returns a single trailing byte
    - Do not colour AF as an error, it signals a chained response with more data to come
    - Do not conflate AE AUTHENTICATION_ERROR with 9D PERMISSION_DENIED — they are distinct refusals
    - Do not show a card, reader or SAM being queried — this is a static searchable table, not a probe
- **Alt text:** Searchable DESFire status-byte table from AmbiSecure contrasting 00 success, AF chained response and AE authentication state, as a static in-browser reference.
- **Export filename:** `ambisecure-resources-tools-desfire-status-1200x630.png`
- **Visual similarity group:** VSG-REFERENCE-TABLE
- **Currently uses:** resources.png
- **Notes:** Thin supporting reference (~780 chars) whose value is as a companion to the DESFire command reference and access-rights decoder; consolidation candidate if the DESFire tool cluster is ever merged into one workbench.

## 031 — DESFire Access-Rights Decoder

- **Record number:** 31
- **Page name:** DESFire Access-Rights Decoder
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/desfire-access-rights/
- **Section:** Resource
- **Page type:** PARSER
- **Primary topic:** Smart cards | **Secondary:** NFC; Transit security; Personalization
- **Design priority:** P2
- **Approved headline:** Four Nibbles Control DESFire File Access
- **Alternative headline:** 0x1230 Means Four Different Keys
- **Category label:** TOOL
- **Core message:** Decodes the 16-bit DESFire access-rights word into the four key references that govern reading, writing and re-permissioning a file.
- **Audience:** Smart-card engineer
- **Diagram type:** DATA PARSER
- **Visual concept:** Dominant object: one 16-bit word rendered as a nibble ruler — 0x1230 shown as four adjacent 4-bit cells with their bit ranges b15..b12, b11..b8, b7..b4, b3..b0 ticked underneath. This is the only image in the DESFire parser family whose subject is a single word rather than a response frame: the flow is a straight four-way fan from cell to permission. Exactly four fan-out nodes plus one legend node: Read = key 1, Write = key 2, Read+Write = key 3, ChangeAccessRights = key 0, and a small legend marking 0xE as free access and 0xF as always denied. The decode runs inside a browser frame with the pasted hex staying local; no card, reader or SAM appears and nothing leaves the frame. Allowed labels: 0x1230, the four bit ranges, the four permission names, 0xE free, 0xF denied. Must not imply the tool sets or changes rights on a card.
- **Avoid:**
    - Do not treat 0xE as a key number — it means free access with no authentication required
    - Do not label 0xF as a key — it means always denied
    - Do not draw a single 8-bit byte — the access-rights word is 16 bits split into four 4-bit fields
    - Do not show a card or reader session — the tool decodes pasted hex locally and never writes permissions
- **Alt text:** A DESFire 16-bit access word splitting into four key references, showing how AmbiSecure's decoder reveals which key each file operation requires.
- **Export filename:** `ambisecure-resources-tools-desfire-access-rights-1200x630.png`
- **Visual similarity group:** VSG-BYTE-PARSER
- **Currently uses:** resources.png
- **Notes:** Small but genuinely teachable concept with good shareability; pairs with the file-settings parser, which surfaces the same word in context.

## 032 — NDEF Decoder

- **Record number:** 32
- **Page name:** NDEF Decoder
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/ndef-decoder/
- **Section:** Resource
- **Page type:** PARSER
- **Primary topic:** NFC | **Secondary:** Smart cards
- **Design priority:** P2
- **Approved headline:** Decode what an NFC tag carries
- **Alternative headline:** URI, Text, Smart Poster records
- **Category label:** TOOL
- **Core message:** A client-side decoder that breaks an NDEF message into its records and expands URI, Text, Smart Poster and MIME payloads.
- **Audience:** Embedded engineer
- **Diagram type:** DATA PARSER
- **Visual concept:** Dominant object: an NFC tag rendered as a chain of linked record blocks — a segmented train rather than a byte ribbon or a tag tree, which is what sets it apart from the ATR, TLV and ATS concepts. The relationship is sequence-plus-one-level-of-nesting: exactly five nodes, a record header (TNF and the MB/ME flags marking message begin and end), a type U record whose 1-byte prefix code expands to http://www., a type T record with its language code preceding the text, a type Sp Smart Poster shown containing a nested NDEF message, and an External/MIME record whose payload stays opaque. Inside the tag stays whatever the issuer wrote; what communicates externally is the NDEF byte stream read over NFC, and the pasted hex is decoded in-browser only. Allowed labels: NDEF, TNF, MB, ME, U, T, Sp, http://www., NFC Forum. Must not imply NDEF content is authenticated.
- **Avoid:**
    - Do not imply NDEF records are signed, encrypted or trustworthy by default — NDEF carries no inherent authentication
    - Do not show the URI prefix code as part of the URI text, it is a separate 1-byte abbreviation
    - Do not draw a Smart Poster as a flat record, it nests a full NDEF message
    - Do not present the decoder as a tag writer or an NFC scanner
    - Do not show decoded bytes being uploaded
- **Alt text:** NDEF decoder concept from AmbiSecure showing an NFC tag's record chain with URI prefix expansion, language-coded text and a nested Smart Poster, decoded locally.
- **Export filename:** `ambisecure-resources-tools-ndef-decoder-1200x630.png`
- **Visual similarity group:** VSG-BYTE-PARSER
- **Currently uses:** resources.png
- **Notes:** Thin page (769 chars body); body could be enriched to match the depth of the ATR/APDU/TLV parsers.

## 033 — UID Analyzer

- **Record number:** 33
- **Page name:** UID Analyzer
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/uid-analyzer/
- **Section:** Resource
- **Page type:** PARSER
- **Primary topic:** NFC | **Secondary:** Device identity; Smart cards
- **Design priority:** P2
- **Approved headline:** A UID is not a secret
- **Alternative headline:** Fixed, legacy, or randomised per tap
- **Category label:** TOOL
- **Core message:** Inspects an ISO/IEC 14443 Type A UID to reveal its length class, manufacturer byte and whether it is fixed or randomised — and makes clear a UID is never a secret.
- **Audience:** Security architect
- **Diagram type:** DATA PARSER
- **Visual concept:** Dominant object: a card in an open RF field during anti-collision, with the UID bytes drawn as broadcast into the air — deliberately exposed rather than enclosed, the only concept in this group whose point is that the data is public, and the only one set in the RF gap rather than at a contact pad or in a parsed tree. Exactly five nodes: a 7-byte UID with its leading manufacturer ID byte flagged, a 4-byte legacy MIFARE Classic UID, a 10-byte form, a cascade-level marker showing how longer UIDs are read in stages, and a 4-byte UID leading with 0x08 called out as a random ID (RID/nUID) that re-randomises every power cycle. Inside the card stay the keys and file data; what leaves is only the UID, readable by any reader in range. Allowed labels: UID, ISO/IEC 14443-3 Type A, cascade level, RID, nUID, 0x08, manufacturer ID. Must not imply UID confidentiality or UID-based access control.
- **Avoid:**
    - Do not depict the UID as secret, protected or key-like — it is broadcast to any reader in RF range
    - Do not present UID matching as an authentication or access-control mechanism
    - Do not show a 4-byte UID leading with 0x08 as a stable identifier, it is re-randomised per power cycle
    - Do not label the first byte of a 4-byte legacy UID as a manufacturer ID, that applies to the 7-byte form
    - Do not frame the analyzer as a cloning or emulation tool
- **Alt text:** AmbiSecure UID analyzer visual: an ISO/IEC 14443 Type A card broadcasting 4-, 7- and 10-byte UIDs during anti-collision, with random 0x08 IDs distinguished.
- **Export filename:** `ambisecure-resources-tools-uid-analyzer-1200x630.png`
- **Visual similarity group:** VSG-BYTE-PARSER
- **Currently uses:** resources.png
- **Notes:** Security-messaging value: the 'UID is not a secret' point is the shareable angle and supports the DESFire/architecture content.

## 034 — ATS Parser

- **Record number:** 34
- **Page name:** ATS Parser
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/ats-parser/
- **Section:** Resource
- **Page type:** PARSER
- **Primary topic:** NFC | **Secondary:** Smart cards
- **Design priority:** P3
- **Approved headline:** What a PICC answers after RATS
- **Alternative headline:** Frame size and timing, negotiated once
- **Category label:** TOOL
- **Core message:** A client-side parser for ISO/IEC 14443-4 ATS bytes, revealing the frame size, bit rates, timing and CID/NAD support a contactless card negotiates after RATS.
- **Audience:** Embedded engineer
- **Diagram type:** DATA PARSER
- **Visual concept:** Dominant object: a handshake moment — the reader's RATS command going out and the PICC's ATS coming back across an RF gap, with the returned bytes fanning into a parameter panel; framed as a negotiation exchange, unlike the ATR parser's one-way reset emission at a contact pad. Exactly five nodes tap the ATS: TL (length of the ATS itself), T0 (which interface bytes follow, and FSCI giving the maximum frame size the card can receive), TA(1) (supported bit rates in each direction), TB(1) (frame waiting time and start-up frame guard time), and TC(1) (CID and NAD support) with the historical bytes trailing as a card-specific block. A quiet note marks that readers typically parse the ATS once and cache it for the session. Inside the card stay the applets and keys; only the ATS bytes cross the RF interface, and parsing is in-browser. Allowed labels: ATS, RATS, TL, T0, TA(1), TB(1), TC(1), FSC, FWT, CID, NAD, ISO/IEC 14443-4 §5.2.1. Must not imply the ATS is a security parameter.
- **Avoid:**
    - Do not show contact pads or a card slot — ATS is the contactless (ISO/IEC 14443-4) counterpart to the ATR
    - Do not present ATS bytes as authentication or security parameters, they are transport parameters only
    - Do not draw all interface bytes as always present, T0 declares which of TA(1)/TB(1)/TC(1) follow
    - Do not show the ATS renegotiated per APDU, readers cache it for the session
    - Do not treat the historical bytes as a standard-defined structure
- **Alt text:** ATS parser concept from AmbiSecure decoding TL, T0, TA(1), TB(1) and TC(1) from a contactless card's answer to RATS, revealing frame size and timing limits.
- **Export filename:** `ambisecure-resources-tools-ats-parser-1200x630.png`
- **Visual similarity group:** VSG-BYTE-PARSER
- **Currently uses:** resources.png
- **Notes:** Thin page (770 chars). Narrow audience; pairs naturally with the ATR parser as a contact/contactless duo.

## 035 — ISO/IEC 14443 Quick Reference

- **Record number:** 35
- **Page name:** ISO/IEC 14443 Quick Reference
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/iso14443-ref/
- **Section:** Resource
- **Page type:** PROTOCOL REFERENCE
- **Primary topic:** NFC | **Secondary:** Smart cards; APDU; Transit security
- **Design priority:** P2
- **Approved headline:** ISO/IEC 14443 in four parts
- **Alternative headline:** From REQA to RATS in five steps
- **Category label:** REFERENCE
- **Core message:** A one-page map of the ISO/IEC 14443 contactless stack — the four parts, Type A vs B signalling, the anti-collision sequence, and the I/R/S block protocol that carries APDUs.
- **Audience:** Smart-card engineer
- **Diagram type:** STANDARD STACK
- **Visual concept:** Dominant object: a four-tier layered stack of the ISO/IEC 14443 parts, read bottom-up — -1 physical characteristics, -2 RF interface at 13.56 MHz (Type A = ASK 100%/Miller, Type B = ASK 10%/NRZ), -3 initialisation and anti-collision, -4 T=CL block protocol — with a compact side ladder showing REQA/WUPA to ATQA to the anti-collision loop to SELECT/SAK to RATS/ATS. Five major nodes maximum: the four parts plus the selection ladder. Inside hardware: the PICC's UID and its SAK response originate in the card chip and are simply reported; nothing is computed in the image. External: the only thing crossing is the 13.56 MHz RF link between reader (PCD) and card (PICC), with a thin band at the top showing 7816-4 APDUs riding over the 14443-4 transport. Labels allowed: '-1 -2 -3 -4', '13.56 MHz', 'Type A / Type B', 'REQA', 'ATQA', 'SAK', 'RATS/ATS', 'I / R / S'. Must not imply an interactive tool — this is a static reference page with no input field. Variation within VSG-REFERENCE-TABLE: this is a layered standard stack plus a selection ladder, whereas the EMV tag dictionary (rec 53) is a filterable row directory with a search field.
- **Avoid:**
    - Do not show a contact pad module or 7816 contacts — 14443 is contactless only
    - Do not label Type A as ASK 10% (Type A is ASK 100% / Miller, Type B is ASK 10% / NRZ)
    - Do not imply 14443 itself provides encryption or authentication — it is a transport layer
    - Do not draw an input or paste box — this page is a static reference with no input
    - Do not show a 4-byte UID for a cascaded 7- or 10-byte UID example
- **Alt text:** Layered view of the ISO/IEC 14443 contactless stack, from RF signalling to T=CL blocks, with the anti-collision ladder that narrows the field to a single card.
- **Export filename:** `ambisecure-resources-tools-iso14443-ref-1200x630.png`
- **Visual similarity group:** VSG-REFERENCE-TABLE
- **Currently uses:** resources.png
- **Notes:** Adjacent to rec 89 (ISO/IEC 14443 Frame Explorer) and to the ATS parser / UID analyzer tools; this page is the static reference and 89 is the byte decoder — keep the images visibly different. Not a consolidation candidate: the reference serves a genuine hub role and internally links the frame tools.

# BLOG PAGES

## 036 — DESFire EV1 vs EV2 vs EV3

- **Record number:** 36
- **Page name:** DESFire EV1 vs EV2 vs EV3 — an architectural evolution.
- **Canonical URL:** https://ambisecure.ambimat.com/blog/desfire-ev1-vs-ev2-vs-ev3/
- **Section:** Blog
- **Page type:** COMPARISON
- **Primary topic:** Smart cards | **Secondary:** Transit security;NFC;Personalization
- **Design priority:** P1
- **Approved headline:** EV2 Is the Architectural Pivot
- **Alternative headline:** Buy EV3, Personalise in EV2 Mode
- **Category label:** TECHNICAL ARTICLE
- **Core message:** Across twelve years of DESFire the cipher never changed — what changed is how hard the platform makes it to use AES badly, which is why greenfield should buy EV3 silicon and personalise it in EV2 mode.
- **Audience:** Smart-card engineer
- **Diagram type:** COMPARISON
- **Visual concept:** Dominant object: a three-column generation ladder — EV1 (c.2008), EV2 (c.2016), EV3 (c.2020) — with capability rows filling in from left to right, so the eye reads accumulation rather than replacement. The relationship the image must carry: AES-128 is a constant across all three columns; what actually evolves is enforcement. Five nodes: the three generation columns plus two highlighted rows — EV2 secure messaging (per-session keys bound to a command counter) and Transaction MAC. What stays inside hardware: K_app and the derived K_card[i], drawn sealed inside the card and SAM silicon. What communicates externally: the counter-bound, CMACed APDUs crossing the ISO/IEC 14443 Type A air interface under proprietary CLA 0x90. Labels allowed: EV1, EV2, EV3, AES-128, 3DES/D40, TMAC, CLA 0x90, ISO/IEC 14443 Type A. Within VSG-COMPARISON-MATRIX this is a generational ladder over time, unlike the attack-class and form-factor matrices in the group.
- **Avoid:**
    - Do not show EV3 introducing a new cipher — AES-128 is the same primitive across EV1, EV2 and EV3, and the article says so explicitly
    - Do not depict EV1 as lacking AES
    - it was the first AES-capable generation
    - Do not illustrate specific DPA countermeasure internals — the article states neither it nor the public spec documents them
    - Do not draw a contact interface on a DESFire card, which is ISO/IEC 14443 Type A contactless
- **Alt text:** Generation ladder across DESFire EV1, EV2 and EV3 — AES-128 stays constant while per-session secure messaging and transaction MAC change what a transit issuer can prove.
- **Export filename:** `ambisecure-blog-desfire-ev1-vs-ev2-vs-ev3-1200x630.png`
- **Visual similarity group:** VSG-COMPARISON-MATRIX
- **Currently uses:** blog.png
- **Notes:** Cornerstone with the strongest transit commercial pull in the batch; feeds the SAM and validator pillars. EV3's DPA countermeasures are deliberately undocumented in the body — hold the visual at architecture level rather than inventing chip internals.

## 037 — Why SAMs Matter in Closed-Loop Transit Systems
- **Record number:** 37
- **Page name:** Why SAMs matter in closed-loop transit systems.
- **Canonical URL:** https://ambisecure.ambimat.com/blog/why-sams-matter-in-closed-loop-transit/
- **Section:** Blog
- **Page type:** ARCHITECTURE ARTICLE
- **Primary topic:** Transit security | **Secondary:** Secure Elements;Smart cards;Provisioning
- **Design priority:** P1
- **Approved headline:** The Issuer Key Never Leaves the SAM
- **Alternative headline:** One Validator Stolen, Zero Keys Lost
- **Category label:** ARCHITECTURE
- **Core message:** Putting the issuer key in a Secure Access Module rather than validator firmware is the architectural difference between an incident at one validator and an incident across the whole fleet.
- **Audience:** Transit-system architect
- **Diagram type:** TRUST CHAIN
- **Visual concept:** Dominant object: the four-level key hierarchy as a vertical trust chain, cut across by one hard boundary line marking everything the validator's main CPU can never see. The flow runs downward by derivation: K_master in the issuer's HSM → K_app inside every SAM → K_card[i] = KDF(K_app, UID_i) on the card → K_session for a single tap. Five nodes: issuer HSM, SAM (a field-replaceable unit inside the validator), reader CPU, card, back office. What stays inside hardware: K_master in the HSM, and K_app plus every derivation inside the SAM's tamper-resistant silicon — the reader CPU sits below the boundary line holding only ciphertext and a state machine. What communicates externally: the encrypted-and-MACed host secure channel between reader CPU and SAM, and the SAM-signed transaction receipt uploaded to the back office. Labels allowed: K_master, K_app, K_card[i], K_session, KDF, UID, SAM, FRU, TMAC. Within VSG-TRANSIT this is the key-custody hierarchy, distinct from any card or validator hardware view.
- **Avoid:**
    - Do not draw K_app or K_card[i] on the reader CPU or its bus — preventing exactly that is the entire reason the SAM exists
    - Do not show the host channel between reader CPU and SAM as plaintext, since it is mutually authenticated and MACed per boot session
    - Do not present a TPM attached to the reader CPU as architecturally equivalent to a SAM
    - Do not depict tamper-evident housing as a substitute for the SAM's tamper resistance — the article calls it additive
    - Do not brand the SAM as an AmbiSecure product, as the body describes NXP AV2/AV3 and vendor-neutral SAM-class parts
- **Alt text:** Transit key hierarchy running from the issuer's HSM down to a per-tap session key, with K_app sealed inside the validator's Secure Access Module and never on the reader CPU.
- **Export filename:** `ambisecure-blog-why-sams-matter-in-closed-loop-transit-1200x630.png`
- **Visual similarity group:** VSG-TRANSIT
- **Currently uses:** blog.png
- **Notes:** Cornerstone. Body names NXP SAM AV2/AV3 as common market parts rather than AmbiSecure products — keep the SAM vendor-neutral in the artwork.

## 038 — Designing Low-Latency Secure Transit Validators
- **Record number:** 38
- **Page name:** Designing low-latency secure transit validators.
- **Canonical URL:** https://ambisecure.ambimat.com/blog/designing-low-latency-secure-transit-validators/
- **Section:** Blog
- **Page type:** ARCHITECTURE ARTICLE
- **Primary topic:** Transit security | **Secondary:** Smart cards;Secure Elements;NFC
- **Design priority:** P1
- **Approved headline:** Tap to Decision in 300 Milliseconds
- **Alternative headline:** Where the 300 ms Actually Goes
- **Category label:** ARCHITECTURE
- **Core message:** A gate-class transit validator has 300 milliseconds to run RF activation, EV2 mutual authentication, fare logic, transaction MAC and gate actuation — and the budget has no slack anywhere in it.
- **Audience:** Transit-system architect
- **Diagram type:** PROTOCOL FLOW
- **Visual concept:** Dominant object: a single horizontal 300 ms latency-budget bar, segmented proportionally, running from card-enters-field to gate-latch-decides. The relationship is strict seriality — each segment depends on the last completing, which is why the bar has no gaps and no parallel tracks. Five segments: RF activation and ISO 14443-3 anti-collision (~25 ms), SELECT plus first APDU (~30 ms), EV2 mutual authentication (~80 ms), fare logic (~80 ms), commit and gate actuation (~85 ms). What stays inside hardware: the SAM's key derivation inside the authentication segment, and the fare table pinned in the validator's RAM inside the fare-logic segment. What communicates externally: only asynchronous depot-sync traffic — blacklist in, receipt batches out — drawn as detached arrows above the bar to prove they never touch the tap path. Labels allowed: 300 ms and the per-stage millisecond figures, ISO 14443-3, EV2, TMAC. Within VSG-TIMELINE the dominant object is a proportional latency budget, not a calendar or roadmap.
- **Avoid:**
    - Do not route blacklist updates or receipt uploads through the tap path — the article is emphatic that these are asynchronous depot-sync flows
    - Do not show the validator waiting on a network round trip to decide a fare, since most gates decide offline
    - Do not present the millisecond figures as a certified benchmark — they are the article's estimates from shipped deployments
    - Do not depict the SAM host session being opened per tap, as the article says open once at boot and hold it
- **Alt text:** A 300-millisecond tap-to-decision budget split across RF activation, SELECT, EV2 mutual authentication, fare logic and commit, showing a transit validator with no slack left.
- **Export filename:** `ambisecure-blog-designing-low-latency-secure-transit-validators-1200x630.png`
- **Visual similarity group:** VSG-TIMELINE
- **Currently uses:** blog.png
- **Notes:** Cornerstone. Millisecond figures are the article's shipped-deployment estimates, not measured or certified claims — avoid any treatment that reads as a benchmark chart.

# RESOURCE PAGES

## 039 — WebAuthn Reference

- **Record number:** 39
- **Page name:** WebAuthn engineering reference#
- **Canonical URL:** https://ambisecure.ambimat.com/resources/webauthn/
- **Section:** Resource
- **Page type:** PROTOCOL REFERENCE
- **Primary topic:** WebAuthn | **Secondary:** FIDO2; Attestation; Passkeys
- **Design priority:** P1
- **Approved headline:** WebAuthn verification, byte by byte
- **Alternative headline:** Six checks every relying party owes
- **Category label:** REFERENCE
- **Core message:** A version-pinned engineering reference that walks the exact WebAuthn ceremony fields, byte layouts and relying-party verification steps an integrator must get right.
- **Audience:** Security architect
- **Diagram type:** PROTOCOL FLOW
- **Visual concept:** Dominant object: a horizontal authenticatorData byte ribbon split into labelled segments — rpIdHash (32) | flags (1) | signCount (4 BE) | aaguid (16) | credentialPublicKey (COSE_Key) — with the flags byte exploded into a bit strip reading UP 0x01, UV 0x04, BE 0x08, BS 0x10, AT 0x40. The relationship: five relying-party verification nodes read off that ribbon in order — clientDataJSON (type/challenge/origin), SHA-256(rpId) vs rpIdHash, flags policy, attestation x5c against the MDS BLOB, persist credential. Stays inside the authenticator: the credential private key and the signature operation, drawn sealed. Crosses the wire: only clientDataJSON, authenticatorData and the signature. Labels allowed: rpIdHash, flags, signCount, aaguid, UP/UV/BE/BS/AT, webauthn.create, 9000-style hex byte runs. Must not imply AmbiSecure hosts or performs the ceremony — this is static documentation.
- **Avoid:**
    - Do not show the credential private key or the private half of a COSE_Key leaving the authenticator
    - Do not depict this reference as a live validation service or hosted API — the portal is static and sends no bytes to a server
    - Do not draw BE=0 with BS=1, an invalid flag combination the page tells RPs to reject
    - Do not show attestation or attestedCredentialData on the authentication ceremony — AT is registration-only
    - Do not present a synced passkey and a hardware authenticator as the same credential class
- **Alt text:** Annotated authenticatorData layout beside the relying-party checks — rpIdHash, flags, attestation — from the AmbiSecure WebAuthn engineering reference portal.
- **Export filename:** `ambisecure-resources-webauthn-1200x630.png`
- **Visual similarity group:** VSG-FIDO-CEREMONY
- **Currently uses:** resources.png
- **Notes:** Static developer portal, version-pinned v1.0; links out to AmbiSecure client-side tools (CBOR decoder, authData parser). Image must not imply a hosted verification service. Strong internal-link hub for the tools cluster.

## 040 — AmbiSecure deck

- **Record number:** 40
- **Page name:** The AmbiSecure deck
- **Canonical URL:** https://ambisecure.ambimat.com/resources/ambisecure-deck/
- **Section:** Resource
- **Page type:** DOWNLOADABLE RESOURCE
- **Primary topic:** Secure Elements | **Secondary:** FIDO2; JavaCard; Device identity
- **Design priority:** P1
- **Approved headline:** One trust chain, many surfaces
- **Alternative headline:** The AmbiSecure platform in 20 slides
- **Category label:** ARCHITECTURE
- **Core message:** A 20-slide downloadable overview of the AmbiSecure platform, from secure-element silicon up through applets, authenticators and the engagement model.
- **Audience:** Technical evaluator
- **Diagram type:** SYSTEM ARCHITECTURE
- **Visual concept:** Dominant object: the AmbiSecure platform stack as four stacked slabs in slight perspective, framed by a subtle slide-deck motif (page corner and a small 1/20 counter) that signals a downloadable deck rather than an article. The relationship is bottom-up dependency: EAL6+ secure-element silicon (root) carries the AmbiSEC nano-card / MFF2 module, which carries JavaCard applets (FIDO2, PIV, OpenPGP, IoT), which carry OnePass authenticators — feeding a fifth node, the enterprise / telecom / IoT systems that consume them. Stays inside hardware: key generation and custody plus applet isolation, both confined to the two lowest slabs. Communicates externally: only the top slab's consuming systems and the attestation they verify. Labels allowed: EAL6+ secure element, AmbiSEC, JavaCard, OnePass, FIDO2 / PIV / OpenPGP, 20 slides. Must not imply certifications beyond the EAL6+ rating the deck attributes to the secure element itself.
- **Avoid:**
    - Do not imply AmbiSecure products are themselves EAL6+ certified — the deck attributes EAL6+ to the underlying secure element
    - Do not show keys or personalisation material leaving the secure element, including at the SCP03 personalisation step
    - Do not depict the deck as gated or lead-captured — it is a direct PDF download
    - Do not place eSIM / SIM-Auth inside the AmbiSecure product stack — the deck locates it on the separate SIMAuth platform
    - Do not reproduce real slide screenshots or imply a live webinar or event
- **Alt text:** Layered AmbiSecure platform stack — EAL6+ secure element, AmbiSEC module, JavaCard applets, OnePass authenticators — behind a downloadable 20-slide deck.
- **Export filename:** `ambisecure-resources-ambisecure-deck-1200x630.png`
- **Visual similarity group:** VSG-SE-ARCHITECTURE
- **Currently uses:** resources.png
- **Notes:** Direct PDF download (/assets/deck/ambisecure-deck.pdf), no gate. Company-level asset: the image must read as a platform overview, not a single product. Highest-value LinkedIn share of this batch alongside rec 39.

## 041 — CBOR Decoder

- **Record number:** 41
- **Page name:** CBOR Decoder
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/cbor-decoder/
- **Section:** Resource
- **Page type:** PARSER
- **Primary topic:** WebAuthn | **Secondary:** FIDO2; Attestation; Hardware security keys
- **Design priority:** P1
- **Approved headline:** Decode the bytes behind WebAuthn
- **Alternative headline:** Inside CTAP2's wire format
- **Category label:** TOOL
- **Core message:** Decode RFC 8949 CBOR blobs in the browser so engineers can read WebAuthn attestation objects, COSE keys and CTAP2 messages without shipping bytes to a server.
- **Audience:** Security architect
- **Diagram type:** DATA PARSER
- **Visual concept:** Dominant object: a nested CBOR item tree unfolding rightward out of a short hex ribbon, each node stamped with its major type rather than a bit-field breakdown. Flow: raw hex enters at the left, the major-type byte of each item selects its shape, and the tree opens into a typed hierarchy. Five major nodes maximum: a map (major type 5) at the root, a text-string key such as 'fmt', a byte string (major type 2) holding authData, an array under 'attStmt' (x5c), and one tagged item (tag 24, encoded CBOR data item). Inside hardware: nothing — the authenticator that produced the attestation object is out of frame; no key material appears. External: nothing leaves the page — show a small 'decodes locally' marker, as all decoding runs in-browser. Labels allowed: 'RFC 8949', 'major type 0..7', 'tag 24', 'fmt', 'attStmt', 'authData'. Must not imply the tool verifies an attestation signature or trust path. Variation within VSG-BYTE-PARSER: this is a typed nesting tree of variable-length items — no bit cells, no fixed-offset ribbon split, no frame-type rail.
- **Avoid:**
    - Do not show bytes being uploaded to a server — CBOR decoding is entirely in-browser
    - Do not imply the decoder verifies attestation signatures or builds a trust chain
    - Do not conflate CBOR with JSON or with BER-TLV — CBOR uses major-type encoding, not tag-length-value
    - Do not depict the decoder as a scanner or vulnerability check
    - Do not show a private key inside the decoded COSE structure — COSE keys here are public
- **Alt text:** Nested CBOR item tree unfolding from raw hex, showing how AmbiSecure engineers read WebAuthn attestation and COSE structures entirely in-browser.
- **Export filename:** `ambisecure-resources-tools-cbor-decoder-1200x630.png`
- **Visual similarity group:** VSG-BYTE-PARSER
- **Currently uses:** resources.png
- **Notes:** Highest commercial pull in this batch — CBOR sits directly under FIDO2/WebAuthn/CTAP2, which is AmbiSecure's core positioning. Companion pages (COSE key inspector, attestation decoder) are separate records; keep node sets distinct across those three.

## 042 — COSE Key Inspector

- **Record number:** 42
- **Page name:** COSE Key Inspector
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/cose-key/
- **Section:** Resource
- **Page type:** PARSER
- **Primary topic:** WebAuthn | **Secondary:** FIDO2; Attestation; Hardware security keys
- **Design priority:** P2
- **Approved headline:** Decode the WebAuthn credentialPublicKey
- **Alternative headline:** kty, alg, crv — read from CBOR
- **Category label:** TOOL
- **Core message:** Decodes a COSE_Key CBOR blob into its integer-keyed parameters, so you can read the credentialPublicKey out of any WebAuthn attestation.
- **Audience:** Security architect
- **Diagram type:** DATA PARSER
- **Visual concept:** Dominant object: a CBOR byte string unfolding into a COSE_Key map whose keys are shown as the actual small integers, not friendly names. Flow: five rows — 1=kty, 3=alg, -1=crv, -2=x, -3=y — each integer paired with its decoded meaning, with a callout that the negative keys are the per-key-type (EC2) parameters. Upstream, a WebAuthn attestation envelope hands the credentialPublicKey into the decoder; downstream there is nothing — the tool decodes and stops, locally, with no server. Labels allowed: COSE_Key, RFC 8152 §7, credentialPublicKey, kty/alg/crv/x/y, EC2. Must not imply attestation verification and must never show a private key: only the public key ships in the envelope. Within VSG-BYTE-PARSER this is a flat integer-keyed CBOR map, contrasting with the PFX nested-container cutaway.
- **Avoid:**
    - Do not show a private key in the COSE_Key — WebAuthn ships only the credentialPublicKey
    - Do not depict the tool verifying an attestation statement or signature
    - Do not draw JSON/JWK braces — COSE_Key is a CBOR map keyed by integers
    - Do not mark the negative keys as errors — -1/-2/-3 are valid EC2 parameters
- **Alt text:** A CBOR blob unfolding into COSE_Key rows keyed by small integers, carrying a WebAuthn credentialPublicKey into AmbiSecure's local decoder — public key only.
- **Export filename:** `ambisecure-resources-tools-cose-key-1200x630.png`
- **Visual similarity group:** VSG-BYTE-PARSER
- **Currently uses:** resources.png
- **Notes:** Thin body (~800 chars), but the FIDO2/WebAuthn tie-in makes it worth an image; consider expanding the page copy.

## 043 — AAGUID Lookup

- **Record number:** 43
- **Page name:** AAGUID Lookup
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/aaguid-lookup/
- **Section:** Resource
- **Page type:** REFERENCE DATABASE
- **Primary topic:** FIDO2 | **Secondary:** WebAuthn; Attestation; Hardware security keys
- **Design priority:** P1
- **Approved headline:** AAGUID to authenticator make and model
- **Alternative headline:** Identify FIDO2 authenticators offline
- **Category label:** REFERENCE
- **Core message:** Resolve a FIDO2 AAGUID to a known authenticator make and model against a curated offline directory, with the FIDO MDS BLOB named as the authoritative production source.
- **Audience:** Security architect
- **Diagram type:** TECHNICAL WORKBENCH
- **Visual concept:** Dominant object: a single 16-byte AAGUID in canonical 8-4-4-4-12 form (cb69481e-8ff7-4039-93ec-0a2729a154a8) on an input rail, resolving rightwards into one match card. Five nodes: the AAGUID string; the curated offline dictionary; the match card carrying vendor, model and USB/NFC transports; a zero-AAGUID branch labelled 'make/model not declared'; and a greyed FIDO MDS BLOB chip marked as the authoritative production source this page does not fetch. Nothing hardware-internal appears — an AAGUID is a public make/model identifier, never a key or a user; the only external element is the greyed MDS fetch, explicitly drawn as not performed because lookup runs entirely in-browser. Labels allowed: AAGUID, vendor, model, USB, NFC, FIDO MDS. Must not imply the lookup verifies attestation or that the offline set is complete.
- **Avoid:**
    - Do not show private keys or credential material — an AAGUID identifies a make and model, never a user or a key
    - Do not present the curated offline dictionary as the authoritative FIDO MDS BLOB
    - Do not imply the lookup verifies an attestation signature
    - Do not draw a network fetch — the lookup runs entirely in-browser
    - Do not depict a zero AAGUID as an error, it is allowed by WebAuthn Level 2
- **Alt text:** AmbiSecure AAGUID lookup resolving a 16-byte FIDO2 identifier into a vendor and model card, with the FIDO MDS BLOB marked as the production source.
- **Export filename:** `ambisecure-resources-tools-aaguid-lookup-1200x630.png`
- **Visual similarity group:** VSG-REFERENCE-TABLE
- **Currently uses:** resources.png
- **Notes:** Offline dictionary (assets/js/lib/aaguid-dict.js) contains two AmbiSecure entries explicitly marked 'placeholder AAGUID' for OnePass Card and OnePass USB Key — the image must not depict a real or certified AmbiSecure AAGUID. Heavy overlap with FIDO Metadata Explorer (rec 93): both render the same AmbiSecureAAGUID.entries() set; consolidation candidate.

## 044 — clientDataJSON Decoder

- **Record number:** 44
- **Page name:** clientDataJSON Decoder
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/clientdata-decoder/
- **Section:** Resource
- **Page type:** PARSER
- **Primary topic:** WebAuthn | **Secondary:** Phishing-resistant authentication; FIDO2
- **Design priority:** P2
- **Approved headline:** Where WebAuthn binds the origin
- **Alternative headline:** The SHA-256 the authenticator signs over
- **Category label:** TOOL
- **Core message:** Decode a base64url clientDataJSON to see the exact type, challenge and origin the browser bound into a ceremony, plus the SHA-256 digest that forms half of what the authenticator signs.
- **Audience:** Security practitioner
- **Diagram type:** DATA PARSER
- **Visual concept:** Dominant object: a base64url string unfolding into a four-field JSON card and then collapsing into a 32-byte digest chip. Five nodes: the base64url input; the JSON body with type 'webauthn.create' / 'webauthn.get'; the challenge field; the origin field (https://example.com) carrying the load-bearing exact-match check against the RP allow-list; and SHA-256(clientDataJSON) feeding a concatenation chip reading authData || digest. No hardware interior is shown — clientDataJSON is produced by the browser and holds no key material; nothing communicates externally, since decoding and hashing happen locally in the page. Labels allowed: type, challenge, origin, crossOrigin, SHA-256. Must not imply the tool verifies signatures, challenges or origins. Within VSG-FIDO-CEREMONY this page owns the browser-side JSON object alone: no authenticator, no actor lanes, no message sequence.
- **Avoid:**
    - Do not show the authenticator or a private key producing clientDataJSON — the browser produces it
    - Do not show clientDataJSON being sent to a server, decoding is entirely in-browser
    - Do not present the SHA-256 digest alone as the signed message — the authenticator signs authenticatorData concatenated with that digest
    - Do not present the decoder as verifying the origin or challenge against an RP allow-list
    - Do not depict the challenge as originating in the browser, the RP issues it
- **Alt text:** AmbiSecure decoder unfolding a base64url clientDataJSON into type, challenge and origin, then the SHA-256 digest that anchors WebAuthn origin binding.
- **Export filename:** `ambisecure-resources-tools-clientdata-decoder-1200x630.png`
- **Visual similarity group:** VSG-FIDO-CEREMONY
- **Currently uses:** resources.png

## 045 — authenticatorData Parser

- **Record number:** 45
- **Page name:** authenticatorData Parser
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/authdata-parser/
- **Section:** Resource
- **Page type:** PARSER
- **Primary topic:** WebAuthn | **Secondary:** Passkeys; FIDO2; Attestation
- **Design priority:** P1
- **Approved headline:** The 37 bytes every assertion carries
- **Alternative headline:** BE and BS decide device-bound or synced
- **Category label:** TOOL
- **Core message:** Walk the binary authenticatorData structure field by field — rpIdHash, flags, signCount, AAGUID, credentialId, COSE_Key — entirely in the browser.
- **Audience:** Security architect
- **Diagram type:** DATA PARSER
- **Visual concept:** Dominant object: a horizontal byte ribbon with real numeric offsets running left to right. Five nodes: bytes 0-31 rpIdHash = SHA-256(rpId), the anti-phishing anchor the RP re-computes; byte 32 flags exploded into bit cells UP 0x01, UV 0x04, BE 0x08, BS 0x10, AT 0x40, ED 0x80; bytes 33-36 signCount as a uint32; the attestedCredentialData run (AAGUID, credentialIdLength, credentialId) shown gated behind AT; and the trailing COSE_Key handed off to the COSE inspector. What stays inside hardware: the private key, which never appears anywhere in authenticatorData — only the public COSE_Key does. Nothing communicates externally; parsing is local. Labels allowed: byte offsets, rpIdHash, flags, signCount, AAGUID, credentialId, COSE_Key. Must not imply signCount 0 is a fault or BE=1 is a weakness. Within VSG-BYTE-PARSER this page owns the flat offset ribbon with bit-level flag explosion.
- **Avoid:**
    - Do not draw a private key inside authenticatorData — only the public COSE_Key is present
    - Do not flag signCount = 0 as an error, Windows Hello and Apple authenticators deliberately hold it at 0
    - Do not equate BE=1 with a weak credential — it means backup-eligible, not compromised
    - Do not show attestedCredentialData when the AT flag is clear
    - Do not present the parser as verifying the assertion signature
- **Alt text:** Byte-offset ribbon of WebAuthn authenticatorData in the AmbiSecure parser, exploding the flags byte into UP, UV, BE, BS and AT bits beside signCount.
- **Export filename:** `ambisecure-resources-tools-authdata-parser-1200x630.png`
- **Visual similarity group:** VSG-BYTE-PARSER
- **Currently uses:** resources.png

## 046 — WebAuthn Attestation Decoder

- **Record number:** 46
- **Page name:** WebAuthn Attestation Decoder
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/attestation-decoder/
- **Section:** Resource
- **Page type:** PARSER
- **Primary topic:** Attestation | **Secondary:** WebAuthn; FIDO2; Hardware security keys
- **Design priority:** P1
- **Approved headline:** Attestation identifies the device, not the person
- **Alternative headline:** Inside the CBOR attestationObject
- **Category label:** TOOL
- **Core message:** Decode a CBOR attestationObject into fmt, attStmt and authData so a relying-party team can read exactly what an authenticator claims about its make and model.
- **Audience:** Security architect
- **Diagram type:** DATA PARSER
- **Visual concept:** Dominant object: a three-branch CBOR map tree hanging off the attestationObject root. Five nodes: the root map; the fmt branch showing none / packed / tpm side by side; the attStmt branch carrying alg (-7 ES256), sig and an x5c certificate array handed to the X.509 viewer; the authData branch as a byte block handed to the authenticatorData parser; and an AAGUID chip pointing at a greyed FIDO MDS BLOB for enterprise policy. What stays inside hardware: the attestation private key — only the signature and the attestation certificate chain travel outward. The only external element is the MDS BLOB, drawn as an RP-side step this decode-only tool does not perform. Labels allowed: fmt, attStmt, authData, x5c, alg, AAGUID. Must not imply signature or chain verification, or that attestation carries user identity. Within VSG-BYTE-PARSER this page owns the nested CBOR key/value tree with a certificate-array branch, not a linear byte ribbon.
- **Avoid:**
    - Do not present the decoder as an attestation verifier — it checks neither the signature nor the x5c chain
    - Do not show attestation carrying user identity, it identifies make and model only
    - Do not draw the attestation private key leaving the authenticator — only the signature and certificate chain travel
    - Do not imply fmt: none is broken, it is the normal consumer case
    - Do not place a FIDO root certificate inside x5c, the chain stops below the root
- **Alt text:** AmbiSecure attestation decoder splitting a CBOR attestationObject into fmt, attStmt and authData, showing how an AAGUID pins an authenticator's make and model.
- **Export filename:** `ambisecure-resources-tools-attestation-decoder-1200x630.png`
- **Visual similarity group:** VSG-BYTE-PARSER
- **Currently uses:** resources.png

## 047 — RP ID / Origin Validator

- **Record number:** 47
- **Page name:** RP ID / Origin Validator
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/rp-id-validator/
- **Section:** Resource
- **Page type:** ENGINEERING TOOL
- **Primary topic:** WebAuthn | **Secondary:** Phishing-resistant authentication; FIDO2; Passkeys
- **Design priority:** P2
- **Approved headline:** rpId must be a registrable suffix
- **Alternative headline:** Credential scope is a domain decision
- **Category label:** TOOL
- **Core message:** Check an origin and rpId pair against the WebAuthn registrable-domain-suffix rule before a browser rejects the ceremony in production.
- **Audience:** Security architect
- **Diagram type:** CONCEPTUAL ILLUSTRATION
- **Visual concept:** Dominant object: a domain-name hierarchy with a scope bracket drawn over it. Five nodes: the origin https://login.example.com; its effective domain login.example.com; the rpId example.com rendered as the bracket enclosing every *.example.com host the credential may roam across; an ALLOWED verdict chip on that pair; and a REJECTED chip on a non-suffix pair with a public-suffix stop-line at 'com'. Nothing hardware-internal is shown — RP ID scoping is enforced by the browser before the authenticator is ever reached, so no keys or authenticators appear. Nothing communicates externally either: validation is local string logic against the registrable-suffix rule, with no DNS or certificate traffic. Labels allowed: origin, rpId, https, registrable suffix, ALLOWED, REJECTED. Within VSG-FIDO-CEREMONY this page owns the static domain hierarchy: no actors, no messages, no byte fields.
- **Avoid:**
    - Do not show an authenticator or key material — RP ID scoping is browser-enforced before the authenticator is reached
    - Do not imply the tool queries live DNS, TLS certificates or the Public Suffix List over the network
    - Do not draw an rpId with a scheme, port or path — rpId is a bare domain
    - Do not present an ALLOWED verdict as phishing protection in itself
    - Do not mark http://localhost as invalid, it is the one HTTP exception
- **Alt text:** Layered diagram from the AmbiSecure RP ID validator tracing an origin down to its rpId suffix, with the key held in the authenticator.
- **Export filename:** `ambisecure-resources-tools-rp-id-validator-1200x630.png`
- **Visual similarity group:** VSG-FIDO-CEREMONY
- **Currently uses:** resources.png
- **Notes:** The tool's public-suffix check is a heuristic (short hardcoded list plus a 2-3 letter regex), not a real Public Suffix List lookup — the image must not imply authoritative PSL coverage.

## 048 — Base64URL Converter

- **Record number:** 48
- **Page name:** Base64URL Converter
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/base64url/
- **Section:** Resource
- **Page type:** ENGINEERING TOOL
- **Primary topic:** WebAuthn | **Secondary:** FIDO2
- **Design priority:** P2
- **Approved headline:** The alphabet WebAuthn actually uses
- **Alternative headline:** One value, four representations
- **Category label:** TOOL
- **Core message:** Decodes and re-encodes base64url — the RFC 4648 section 5 format WebAuthn, JOSE, and CTAP2 use for every binary field — and shows the same value simultaneously as base64, hex, and UTF-8.
- **Audience:** Security practitioner
- **Diagram type:** DATA PARSER
- **Visual concept:** Dominant object is a single WebAuthn credentialId value at centre, radiating into four synchronised representation lanes that all describe the same bytes: base64url (- _, no padding), standard base64 (+ /, = padding), hex bytes, and UTF-8 text shown greyed and struck because the field is a raw identifier, not readable text. Five nodes: the source value plus the four lanes. Small consumer chips ring the base64url lane — WebAuthn challenge/credentialId, JWS, CTAP2, PKCE — naming who relies on this alphabet. The entire fan sits inside a browser-boundary frame: no authenticator, relying party, or server is contacted. Variation within VSG-ENCODING-CONVERTER: this is the one-to-many radial representation fan anchored to a real WebAuthn field, distinct from rec 17's two-track base64 fork. Allowed labels: RFC 4648 section 5, base64url, - _, + /, credentialId. Must not imply any ceremony participation.
- **Avoid:**
    - Do not show base64url carrying = padding or + and / characters — it uses - and _ and drops padding
    - Do not imply the tool contacts an authenticator, verifies an assertion, or checks a signature
    - Do not depict base64url as conferring any security property — it is transport encoding, and origin binding is what makes WebAuthn phishing-resistant
    - Do not render a decoded credentialId as readable text — the bytes are opaque
- **Alt text:** A WebAuthn credentialId fanned into base64url, base64, hex and UTF-8 lanes, showing the RFC 4648 section 5 alphabet FIDO2 and JOSE use — decoded in the browser.
- **Export filename:** `ambisecure-resources-tools-base64url-1200x630.png`
- **Visual similarity group:** VSG-ENCODING-CONVERTER
- **Currently uses:** resources.png
- **Notes:** Thin body (~775 chars) and overlaps rec 17; differentiate strictly on the WebAuthn/JOSE/CTAP2 framing and consider expanding the copy.

## 049 — Credential ID Inspector

- **Record number:** 49
- **Page name:** Credential ID Inspector
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/credential-id/
- **Section:** Resource
- **Page type:** ENGINEERING TOOL
- **Primary topic:** WebAuthn | **Secondary:** FIDO2; Passkeys; Hardware security keys
- **Design priority:** P3
- **Approved headline:** credentialId is opaque to the RP
- **Alternative headline:** Small ID or wrapped key blob
- **Category label:** TOOL
- **Core message:** Sanity-check a credentialId's length, entropy and encoding while keeping the governing rule visible — the credentialId is opaque to the relying party.
- **Audience:** Security practitioner
- **Diagram type:** DATA PARSER
- **Visual concept:** Dominant object: one credentialId blob split into two contrasting silhouettes. Five nodes: the byte blob with its length chip; a short discoverable-credential ID whose credential lives on the authenticator; a long server-side-resident ID carrying an encrypted key wrap, drawn as a sealed box the RP cannot open; a Shannon entropy readout in bits/byte; and an optional AAGUID-shaped first-16-bytes prefix chip that only some vendors prepend. What stays inside hardware: the wrapping key, which never leaves the authenticator even though the wrapped blob rides inside the ID. Nothing communicates externally; inspection is local. Labels allowed: credentialId, bytes, bits/byte, allowCredentials, AAGUID prefix. Must not imply the RP can derive identity or key material from the bytes. Within VSG-BYTE-PARSER this page owns the whole-blob comparison with an entropy readout — no offsets, no tree.
- **Avoid:**
    - Do not show the RP reading identity or key material out of the credentialId — it is opaque by design
    - Do not draw the wrapping key leaving the authenticator, only the wrapped blob travels inside the ID
    - Do not present low entropy as a vulnerability finding — this is a diagnostic, not a scanner
    - Do not imply an AAGUID-shaped prefix is required, only some vendors prepend one
    - Do not imply long IDs are weaker than short ones, both are spec-compliant
- **Alt text:** AmbiSecure credential ID inspector contrasting a short discoverable WebAuthn credentialId with a long wrapped-key blob, both opaque to the relying party.
- **Export filename:** `ambisecure-resources-tools-credential-id-1200x630.png`
- **Visual similarity group:** VSG-BYTE-PARSER
- **Currently uses:** resources.png
- **Notes:** Narrow diagnostic utility, low sharing potential — supporting page for the AAGUID and authenticatorData tools. Separate content bug (not image-blocking): in credential-id-inspector.js the b.length === 64 note is unreachable, shadowed by the preceding 32-64 range branch.

## 050 — WebAuthn Challenge Viewer

- **Record number:** 50
- **Page name:** WebAuthn Challenge Viewer
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/challenge-viewer/
- **Section:** Resource
- **Page type:** ENGINEERING TOOL
- **Primary topic:** WebAuthn | **Secondary:** FIDO2; Phishing-resistant authentication
- **Design priority:** P2
- **Approved headline:** 32 random bytes, server-side, single-use
- **Alternative headline:** Without freshness, signatures replay
- **Category label:** TOOL
- **Core message:** Inspect a WebAuthn challenge's length and entropy and generate a fresh 32-byte one with the platform CSPRNG, so predictable challenges never reach production.
- **Audience:** Security practitioner
- **Diagram type:** TECHNICAL WORKBENCH
- **Visual concept:** Dominant object: a 32-cell byte grid with uniformly scattered values, paired with an entropy gauge. Five nodes: the challenge byte grid; the gauge reading bits/byte against the 8.0 ideal; a length chip contrasting the spec floor of 16 bytes with the recommended 32; a rejected counter-example whose bytes are all printable ASCII, flagged suspicious; and a CSPRNG source chip (crypto.getRandomValues / crypto.randomBytes) with Math.random struck through. Nothing hardware-internal appears — a challenge is public, RP-generated freshness data, not key material, and it is not produced by the authenticator. Nothing communicates externally: generation uses the local platform CSPRNG in-page and no bytes are transmitted. Labels allowed: bytes, bits/byte, 16, 32, CSPRNG. Must not imply the challenge is secret or that an entropy score proves RNG soundness.
- **Avoid:**
    - Do not depict the challenge as a secret or a key — it is public, single-use freshness data
    - Do not show the challenge originating in the authenticator, the relying party generates it
    - Do not imply the entropy readout proves an RNG is cryptographically sound, it is a smoke test on one sample
    - Do not present a challenge below the 16-byte spec floor as acceptable
    - Do not imply generated challenges are sent to or stored on an AmbiSecure server
- **Alt text:** Byte grid and entropy gauge from the AmbiSecure WebAuthn challenge viewer, contrasting CSPRNG output with predictable challenges that let signatures replay.
- **Export filename:** `ambisecure-resources-tools-challenge-viewer-1200x630.png`
- **Visual similarity group:** VSG-CRYPTO-CALC
- **Currently uses:** resources.png

## 051 — ISO 7816-4 CLA Decoder

- **Record number:** 51
- **Page name:** ISO 7816-4 CLA Decoder
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/iso7816-cla/
- **Section:** Resource
- **Page type:** PARSER
- **Primary topic:** APDU | **Secondary:** Smart cards; Secure Elements
- **Design priority:** P2
- **Approved headline:** What the CLA byte declares
- **Alternative headline:** Secure messaging, chaining, channel — in one byte
- **Category label:** TOOL
- **Core message:** Decode the ISO/IEC 7816-4 CLA byte into its bit-fields so engineers can see at a glance whether a command is interindustry or proprietary, secure-messaged, chained, and on which logical channel.
- **Audience:** Smart-card engineer
- **Diagram type:** DATA PARSER
- **Visual concept:** Dominant object: a single CLA byte magnified into eight labelled bit cells, sitting at the head of a greyed-out APDU header (CLA INS P1 P2), with callout lines fanning to four readouts. Flow: one byte in, four independent field meanings out. Five major nodes maximum: class type (interindustry vs proprietary, top bit), secure messaging (bits b3..b2, four states from 'no SM' to 'header authenticated'), command chaining (bit b4), logical channel (low two bits, channels 0-3), and a small strip of real sample values 00 / 0C / 80 / 84. Inside hardware: nothing is computed on a card — the card that would interpret this CLA stays out of frame. External: show the APDU header as the thing that would travel to a card, but with no reader, no cable and no transmission depicted; decoding runs locally. Labels allowed: 'CLA INS P1 P2', '00 / 0C / 80 / 84', 'b3..b2 SM', 'b4 chaining', 'channel 0-3', 'ISO/IEC 7816-4 §5.4.1'. Must not imply the tool sends anything or that proprietary classes are defective. Variation within VSG-BYTE-PARSER: this is the only concept at single-byte bit-cell resolution — one byte, no tree, no sequence, no multi-field ribbon.
- **Avoid:**
    - Do not show a card reader, cable or live card — the decoder never transmits an APDU
    - Do not present proprietary CLA 0x80/0x84 as invalid or insecure — they are simply application-defined (e.g. GlobalPlatform)
    - Do not depict the SM bits performing encryption — they only signal that secure messaging is in effect
    - Do not show CLA 0xFF as a normal class — it is reserved by 7816-3 for PPS
    - Do not show a logical channel above 3 on the first-interindustry encoding (channels 4-19 use the further-interindustry form)
- **Alt text:** A single ISO 7816-4 CLA byte magnified into bit cells, showing how a card learns the class, secure-messaging state, chaining and logical channel.
- **Export filename:** `ambisecure-resources-tools-iso7816-cla-1200x630.png`
- **Visual similarity group:** VSG-BYTE-PARSER
- **Currently uses:** resources.png
- **Notes:** Bit-numbering caveat for human review: the page and its JS use zero-indexed names (b3..b2 for SM, b4 for chaining), whereas ISO/IEC 7816-4 numbers bits b1..b8. Match the site's own naming in the image for consistency with the tool, but a reviewer may want the page itself aligned to ISO numbering.

## 052 — BER Length Visualizer

- **Record number:** 52
- **Page name:** BER Length Visualizer
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/ber-length/
- **Section:** Resource
- **Page type:** CALCULATOR
- **Primary topic:** BER-TLV | **Secondary:** Smart cards; JavaCard; Personalization
- **Design priority:** P3
- **Approved headline:** Three ways BER encodes a length
- **Alternative headline:** Long-form length octets, decoded and built
- **Category label:** TOOL
- **Core message:** Decode BER length octets and encode an integer back into them, covering short-form, long-form and indefinite-form under ITU-T X.690 §8.1.3.
- **Audience:** Smart-card engineer
- **Diagram type:** COMPARISON
- **Visual concept:** Dominant object: one length value shown three ways on a horizontal comparison rail, with a two-headed arrow across the middle marking that the tool runs in both directions (octets to integer, integer to octets). Flow: a length in bytes maps to a distinct octet pattern depending on magnitude and encoding rules. Five major nodes maximum: short-form (single octet ≤ 0x7F), long-form (first octet 0x80|N then N big-endian octets, e.g. 82 01 2C), indefinite-form (0x80, BER only, terminated by 00 00), the DGI long-form variant (always FF followed by a 2-byte big-endian length, even for small values), and the encode direction. Inside hardware: nothing — this is pure encoding arithmetic, no card and no key material. External: nothing leaves the browser; decoding and encoding are local. Labels allowed: 'ITU-T X.690 §8.1.3', '0x7F', '0x80 | N', '00 00', 'FF || 2-byte BE', 'DER forbids'. Must not imply this parses whole TLV structures — it handles the length field only.
- **Avoid:**
    - Do not show indefinite-form 0x80 as valid DER — DER forbids it, it is BER-only
    - Do not present 0xFF as a usable length octet — it is reserved
    - Do not merge the tag byte into the length octets — the rail shows the length field alone
    - Do not imply the tool parses complete TLV objects or values
    - Do not show DGI long-form as a general BER rule — it is a stricter EMV personalisation variant
- **Alt text:** Three BER length forms compared side by side — short, long and indefinite — showing how X.690 encodes any TLV length in one or more octets.
- **Export filename:** `ambisecure-resources-tools-ber-length-1200x630.png`
- **Visual similarity group:** VSG-ENCODING-CONVERTER
- **Currently uses:** resources.png
- **Notes:** Consolidation candidate: overlaps the Length-Field Encoder at /resources/tools/length-field/ (BER, DGI, u8, u16 BE/LE), which the page itself links as a companion. The encode halves substantially duplicate; a reviewer may want these merged into one length tool, or this page narrowed to decode-plus-explainer. Narrow utility and low sharing potential either way.

## 053 — EMV Tag Dictionary

- **Record number:** 53
- **Page name:** EMV Tag Dictionary Explorer
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/emv-tag-dict/
- **Section:** Resource
- **Page type:** REFERENCE DATABASE
- **Primary topic:** BER-TLV | **Secondary:** Smart cards; APDU; NFC
- **Design priority:** P2
- **Approved headline:** Every EMV tag, one filter box
- **Alternative headline:** From 4F to 9F26, explained
- **Category label:** REFERENCE
- **Core message:** A filterable directory of EMV BER-TLV tags across Books 3, 4 and contactless, so implementers can resolve a hex prefix or a name fragment without opening the specs.
- **Audience:** Smart-card engineer
- **Diagram type:** TECHNICAL WORKBENCH
- **Visual concept:** Dominant object: a single filter field at the top with a short column of EMV tag rows narrowing beneath it, each row showing hex tag, name and source. Flow: typing a hex prefix or name fragment collapses the directory to matching rows — the image should show the narrowing, not a full dump. Five major nodes maximum: the filter input and four real rows — 4F (Application Identifier, AID), 6F (File Control Information Template, returned in SELECT), 82 (Application Interchange Profile), and 9F26 (Application Cryptogram, a 2-byte tag). Inside hardware: nothing — no card, no terminal, no transaction; this is a lookup surface. External: nothing leaves the browser; filtering is local. Labels allowed: 'EMV Books 3 & 4', 'EMV Contactless C-2 / C-3', '4F', '6F', '82', '9F26', 'primitive / constructed'. Must not imply this is a transaction decoder. Variation within VSG-REFERENCE-TABLE: a search-driven row directory that visibly filters, versus the layered four-part standard stack of the ISO/IEC 14443 reference (rec 35).
- **Avoid:**
    - Do not show a real PAN, cardholder name or track-2 data in any sample row — use tag names only
    - Do not present the dictionary as an EMV transaction decoder, terminal or kernel
    - Do not show only 1-byte tags — many EMV tags are 2 bytes (e.g. 9F26)
    - Do not imply EMV Level 1/Level 2 certification or approval of AmbiSecure
    - Do not show a payment card being tapped — this is a static lookup, not a live capture
- **Alt text:** Filterable directory of EMV BER-TLV tags on AmbiSecure, with a search field narrowing rows like 4F, 82 and 9F26 down to the ones an implementer needs.
- **Export filename:** `ambisecure-resources-tools-emv-tag-dict-1200x630.png`
- **Visual similarity group:** VSG-REFERENCE-TABLE
- **Currently uses:** resources.png
- **Notes:** EMV is adjacent to rather than central in AmbiSecure's positioning, but the dictionary has real search value and links onward to the TLV parser. Page references a 'future cornerstone: EMV transaction flow' article that does not appear to exist yet — worth a human check before the image leans on EMV depth.

## 054 — Key Diversification Visualizer

- **Record number:** 54
- **Page name:** Key Diversification Visualizer
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/key-diversification/
- **Section:** Resource
- **Page type:** ENGINEERING TOOL
- **Primary topic:** Smart cards | **Secondary:** Transit security; Personalization; Secure Elements
- **Design priority:** P2
- **Approved headline:** One master key, one key per card
- **Alternative headline:** Why the master key stays in the SAM
- **Category label:** ENGINEERING RESOURCE
- **Core message:** An educational visualizer showing the shape of AES-CMAC key diversification — why the master key stays in the SAM and each card carries only its own derivative — without producing a usable key.
- **Audience:** Transit-system architect
- **Diagram type:** SYSTEM ARCHITECTURE
- **Visual concept:** Dominant object: a SAM module on the left, drawn as a sealed enclosure holding the master key K_app, feeding a derivation block that takes a card UID and emits one per-card key into one card among a small fan of cards on the right. Flow: UID in, derivation, unique key out, repeated per card. Five major nodes maximum: the SAM holding K_app, the incoming card UID, the derivation function (AES-CMAC per NXP AN10922/AV2), the diversified per-card key landing in a card, and a small blast-radius marker showing that one compromised card exposes only that card. Inside hardware: the master key never leaves the SAM/HSM enclosure — draw it fully contained, with no line carrying it outward; the diversified key sits inside the card's protected memory. External: only the UID and the resulting per-card key move, and only during personalisation. Labels allowed: 'K_app', 'UID', 'AES-CMAC', 'AN10922', 'SAM', 'EDUCATIONAL'. Must not imply the browser performs production key derivation. Variation within VSG-CRYPTO-CALC: this is a key-distribution topology across SAM and cards, whereas the CMAC length calculator (rec 85) is a flat block-arithmetic bar with no cards in frame.
- **Avoid:**
    - Do not present the output as a real or usable diversified key — the tool uses a SHA-256 stand-in, not production AES-CMAC
    - Do not show the master key leaving the SAM or HSM
    - Do not depict this as production-ready derivation or a personalisation system
    - Do not suggest pasting real master keys into a browser — the page explicitly warns against it
    - Do not show one card's compromise propagating to other cards — that is the failure mode diversification prevents
- **Alt text:** A SAM holding the master key derives a unique per-card key from each UID, illustrating why compromising one transit card exposes only that card.
- **Export filename:** `ambisecure-resources-tools-key-diversification-1200x630.png`
- **Visual similarity group:** VSG-CRYPTO-CALC
- **Currently uses:** resources.png
- **Notes:** The educational caveat is load-bearing: the page states plainly that it uses a SHA-256 stand-in so users grasp the shape without producing a usable key. The image must carry an EDUCATIONAL marker or it misrepresents the tool. Ties naturally to AmbiSecure's SAM/transit content.

## 055 — SCP03 Session Walkthrough

- **Record number:** 55
- **Page name:** SCP03 Session Walkthrough
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/scp03-walkthrough/
- **Section:** Resource
- **Page type:** PROTOCOL REFERENCE
- **Primary topic:** Secure Elements | **Secondary:** JavaCard; APDU; Provisioning
- **Design priority:** P1
- **Approved headline:** How SCP03 opens a secure channel
- **Alternative headline:** Mutual authentication in six steps
- **Category label:** ENGINEERING RESOURCE
- **Core message:** An annotated walkthrough of the GlobalPlatform SCP03 handshake — challenges, session-key derivation, mutual authentication and secure messaging — with real command bytes and no key computation.
- **Audience:** JavaCard developer
- **Diagram type:** PROTOCOL FLOW
- **Visual concept:** Dominant object: a vertical ladder diagram between two columns, Host on the left and Card (secure element) on the right, with the static-key store drawn as a sealed vault inside each column. Flow: challenge exchange, key derivation on both sides independently, cryptogram verification each way, then wrapped traffic. Five major nodes maximum: INITIALIZE UPDATE carrying the 8-byte host_challenge (CLA=0x80 INS=0x50); the card response returning card_challenge, card_cryptogram and the sequence counter; session-key derivation performed separately on both sides from the static keys plus both challenges; EXTERNAL AUTHENTICATE carrying the host cryptogram (CLA=0x84 INS=0x82), completing mutual authentication; and secure messaging in effect, with every command APDU wrapped as AES-CBC body plus C-MAC. Inside hardware: the static keys S-ENC, S-MAC and S-DEK stay in the HSM on the host side and in the secure element on the card side — draw them inside the vaults with no line crossing the ladder. External: only challenges, cryptograms and wrapped APDUs cross the link. Labels allowed: 'CLA=80 INS=50', 'CLA=84 INS=82', 'S-ENC / S-MAC / S-DEK', 'C-MAC / R-MAC', 'GP 2.3.1 Amd D'. Must not imply a runnable simulator — the page is annotation only.
- **Avoid:**
    - Do not show static keys S-ENC/S-MAC/S-DEK crossing the host-card link — session keys are derived independently on each side, never transmitted
    - Do not depict SCP03 as 3DES-based — SCP03 is AES-128 and supplants 3DES-based SCP02
    - Do not present the page as a live simulator or key-compute tool — it is annotation, not runnable
    - Do not show mutual authentication as complete before EXTERNAL AUTHENTICATE is verified by the card
    - Do not show secure messaging wrapping the INITIALIZE UPDATE exchange — wrapping only begins after mutual authentication
- **Alt text:** Ladder diagram of a GlobalPlatform SCP03 handshake between host and secure element, where challenges cross the link but static AES keys never do.
- **Export filename:** `ambisecure-resources-tools-scp03-walkthrough-1200x630.png`
- **Visual similarity group:** VSG-SECURE-CHANNEL
- **Currently uses:** resources.png
- **Notes:** New VSG coined: no listed group fits a two-party protocol ladder (VSG-FIDO-CEREMONY is FIDO-specific). Reusable for other secure-channel pages. Strong commercial relevance — GlobalPlatform/SCP03 sits directly on AmbiSecure's secure-element and JavaCard lines. Adjacent to /resources/tools/scp03-helper/, which does compute session keys with AES-CMAC; keep the two images distinct (walkthrough = ladder, helper = compute surface).

# BLOG PAGES

## 056 — Understanding WebAuthn Attestation Objects
- **Record number:** 56
- **Page name:** Understanding WebAuthn Attestation Objects.
- **Canonical URL:** https://ambisecure.ambimat.com/blog/understanding-webauthn-attestation-objects/
- **Section:** Blog
- **Page type:** TECHNICAL ARTICLE
- **Primary topic:** Attestation | **Secondary:** WebAuthn;FIDO2;Hardware security keys
- **Design priority:** P1
- **Approved headline:** Decoded Attestation Is Decorative Attestation
- **Alternative headline:** Verify the Chain, Not Just the AAGUID
- **Category label:** TECHNICAL ARTICLE
- **Core message:** Attestation is the policy primitive that lets an enterprise require certified hardware — but only if the relying party verifies the signature and validates the x5c chain against an MDS-derived trust anchor, rather than merely decoding it.
- **Audience:** Security architect
- **Diagram type:** CERTIFICATE STRUCTURE
- **Visual concept:** Dominant object: the attestationObject opened as a CBOR map, its three keys expanded, with an x5c chain climbing out of attStmt toward a manufacturer root. The relationship is verification, not decoding: fmt selects the attStmt schema → the signature over authData || SHA-256(clientDataJSON) is checked against the x5c leaf → the chain validates to the trust anchor the MDS BLOB names for that AAGUID. Five nodes: the CBOR map (fmt / attStmt / authData), authData's byte layout (32-byte rpIdHash | flags | signCount | attestedCredentialData), the x5c leaf, the manufacturer root, the cached MDS BLOB. What stays inside hardware: the credential private key, which appears nowhere in this structure — only its public COSE_Key does, and the image should make that absence legible. What communicates externally: the attestation blob to the relying party, and the daily MDS BLOB fetch drawn deliberately off the hot path. Labels allowed: fmt, attStmt, authData, packed, x5c, AAGUID, rpIdHash, signCount, UP/UV/AT, MDS BLOB. Within VSG-CERT-STRUCTURE the dominant object is a CBOR envelope, not an X.509 body.
- **Avoid:**
    - Do not place the credential private key anywhere inside the attestationObject — only the public COSE_Key is carried there
    - Do not present attestation as identifying the user or proving the device is currently in a trustworthy state, only that it was a known make and model at registration
    - Do not draw the MDS fetch on the registration hot path — the article prescribes a daily sync and cache reads
    - Do not render fmt: none as a failed registration, since it is a valid one that simply lacks make/model proof
    - Do not depict a decoded x5c chain as a validated one
- **Alt text:** WebAuthn attestationObject unpacked into fmt, attStmt and authData, its x5c chain validating to the manufacturer root that a cached FIDO MDS BLOB names for that AAGUID.
- **Export filename:** `ambisecure-blog-understanding-webauthn-attestation-objects-1200x630.png`
- **Visual similarity group:** VSG-CERT-STRUCTURE
- **Currently uses:** blog.png
- **Notes:** Longest and most technical piece in the batch (26 min). Seven fmt values are covered in the body; this concept intentionally renders only the packed/x5c basic-attestation path to stay legible at LinkedIn preview size.

## 057 — Embedded Secure-Element FIDO2 Authenticators for Enterprise Identity

- **Record number:** 57
- **Page name:** Embedded Secure-Element FIDO2 Authenticators for Enterprise Identity.
- **Canonical URL:** https://ambisecure.ambimat.com/blog/sim-based-fido2-authenticators/
- **Section:** Blog
- **Page type:** ARCHITECTURE ARTICLE
- **Primary topic:** Secure Elements | **Secondary:** FIDO2;JavaCard;Enterprise access
- **Design priority:** P1
- **Approved headline:** One Secure Element, One Revocation Surface
- **Alternative headline:** FIDO2 Under the Issuer's Keys
- **Category label:** ARCHITECTURE
- **Core message:** The same CC EAL6+ secure element, packaged as a removable 4FF nano-card or a solderable MFF2 module, can carry the enterprise FIDO2 credential under the issuer's own keys — collapsing two certification and personalisation pipelines into one.
- **Audience:** Device-security architect
- **Diagram type:** SYSTEM ARCHITECTURE
- **Visual concept:** Dominant object: one secure-element die shown twice — mounted in a removable 4FF nano-card and reflowed as a solderable MFF2 module — sharing a single applet stack drawn once beneath both packages, so the identical-silicon argument is the composition itself. The relationship: same CC EAL6+ die, same JavaCard 3.x on GlobalPlatform 2.3.1, same SCP03 issuer keys; only the package and the WebAuthn role differ — roaming authenticator versus platform authenticator. Five nodes: the SE die, the 4FF package, the MFF2 package, the issuer's personalisation line, and the host device speaking CTAP2.1 over ISO/IEC 7816 T=0/T=1. What stays inside hardware: the ECC P-256 keypair, whose private half never crosses the chip boundary — not even to the host device's own operating system. What communicates externally: CTAP2.1 traffic on the contact interface, and applet loading under SCP03 from the personalisation line. Labels allowed: 4FF, MFF2, CC EAL6+, JavaCard 3.x, GlobalPlatform 2.3.1, SCP03, CTAP2.1, ECC P-256. Within VSG-SE-ARCHITECTURE the variation is the one-die-two-packages framing.
- **Avoid:**
    - Do not conflate the 4FF or MFF2 secure element with a SIM subscription, carrier profile, or any telecom connectivity — these are form factors, not a network service
    - Do not show the P-256 private key reaching the host OS
    - Do not draw the MFF2 module as removable or the 4FF nano-card as soldered — the packaging distinction carries the roaming-versus-platform argument
    - Do not depict the trust root as the device vendor's, since the article's whole gain is an attestation chain running through the issuing organisation's own CA
    - Do not add FIDO certification marks — the body claims CC EAL6+ for the chip only
- **Alt text:** One CC EAL6+ secure element in two packages — removable 4FF nano-card and solderable MFF2 — running a FIDO2 applet whose P-256 private key never leaves the chip boundary.
- **Export filename:** `ambisecure-blog-sim-based-fido2-authenticators-1200x630.png`
- **Visual similarity group:** VSG-SE-ARCHITECTURE
- **Currently uses:** blog.png
- **Notes:** ACCURACY FLAG: the slug is sim-based-fido2-authenticators but the title, H1 and body deliberately reframe away from SIM/telecom to 'embedded secure element'. The image must not reintroduce SIM or connectivity imagery. Flag the slug/title mismatch for human review.

## 058 — PIV Smart Cards vs USB Tokens vs Embedded Secure Elements

- **Record number:** 58
- **Page name:** PIV Smart Cards vs USB Tokens vs Embedded Secure Elements.
- **Canonical URL:** https://ambisecure.ambimat.com/blog/piv-vs-usb-tokens-vs-embedded/
- **Section:** Blog
- **Page type:** COMPARISON
- **Primary topic:** PIV | **Secondary:** Secure Elements;Certificate lifecycle;Enterprise access
- **Design priority:** P1
- **Approved headline:** Pick on Lifecycle, Not Security
- **Alternative headline:** Badge, Token, or Soldered Silicon
- **Category label:** TECHNICAL ARTICLE
- **Core message:** PIV cards, USB tokens and embedded secure elements are all hardware-backed and all equally secure — the workforce decision turns on lifecycle, physical-logical convergence, and what happens at recovery time.
- **Audience:** IAM leader
- **Diagram type:** COMPARISON
- **Visual concept:** Dominant object: three credential form factors rendered as physical objects in a row — a PIV smart card, a USB token, a secure element soldered to a board — sitting above a lifecycle track rather than a security scale, because the article's thesis is that a security ranking would be wrong. The relationship: all three seal a private key identically, so the differentiator drawn beneath each is where its lifecycle is operated — issuance CA line, help-desk slot configuration, MDM channel. Five nodes: the three form factors plus two lifecycle endpoints, the issuing CA and the MDM. What stays inside hardware: the private key in each of the three, drawn with visually identical sealing so the parity is unmistakable. What communicates externally: certificates outbound, CRL/OCSP pulls at the relying party, and MDM rotation traffic to the embedded SE. Labels allowed: PIV, PKCS#11, NIST SP 800-73, CHUID, TPM, MDM, OCSP/CRL, AAGUID. Within VSG-COMPARISON-MATRIX this compares physical form factors on lifecycle, unlike the attack-class and generational matrices in the group.
- **Avoid:**
    - Do not rank the three by security or draw one as stronger — the article states all three are hardware-backed and that the question is not which is most secure
    - Do not show a private key exported or extracted from any of the three
    - Do not draw the embedded secure element as portable between devices, since its credential dies with the device
    - Do not give the USB token badge or personnel-record semantics, which the article reserves to the PIV card
    - Do not imply hardware credentials solve enrolment fraud, help-desk recovery, or a compromised relying party
- **Alt text:** PIV card, USB token and soldered secure element compared on lifecycle — issuance CA, help-desk setup, or MDM channel — since all three seal the workforce private key equally.
- **Export filename:** `ambisecure-blog-piv-vs-usb-tokens-vs-embedded-1200x630.png`
- **Visual similarity group:** VSG-COMPARISON-MATRIX
- **Currently uses:** blog.png
- **Notes:** Cornerstone. The thesis is explicitly that none of the three is more secure than the others — any visual security ranking would directly contradict the page.

## 059 — Designing Secure Email and Document Signing Platforms

- **Record number:** 59
- **Page name:** Designing Secure Email and Document Signing Platforms.
- **Canonical URL:** https://ambisecure.ambimat.com/blog/designing-email-document-signing-platforms/
- **Section:** Blog
- **Page type:** ARCHITECTURE ARTICLE
- **Primary topic:** PKI | **Secondary:** Certificate lifecycle;Smart cards;Hardware security keys
- **Design priority:** P1
- **Approved headline:** Signatures That Outlive the Certificate
- **Alternative headline:** Where the Signing Key Lives Decides Everything
- **Category label:** ARCHITECTURE
- **Core message:** A signing platform is a stack — hardware-held credentials, an issuance CA, a trust list, a timestamp authority and an audit-signing key — and where the signing key lives decides everything else, including whether the signature is legally binding.
- **Audience:** PKI engineer
- **Diagram type:** LIFECYCLE
- **Visual concept:** Dominant object: one signature travelling left to right along a time axis, crossing the signer certificate's expiry line and still verifying on the far side. The relationship is capture-at-signing-time: as the CMS envelope is built it absorbs the OCSP response and an RFC 3161 Time-Stamp Token into its signed attributes, so a verifier years later rebuilds the whole validation chain from the bundle alone, with no live responder to call. Five nodes: the hardware-held signing credential (card or token), the CMS/PKCS#7 envelope, the Time-Stamp Authority, the certificate-expiry line on the axis, and the future verifier. What stays inside hardware: the signing private key — the platform sends a document hash in via APDU and gets a signature out, and the key has no path off the card. What communicates externally: the hash to the credential, the TSA request, and the OCSP fetch made once at signing time. Labels allowed: S/MIME, CMS/PKCS#7, PAdES, RFC 3161, OCSP, LTV, X.509. Within VSG-PKI-LIFECYCLE the axis is signature longevity across expiry, not certificate issuance and renewal.
- **Avoid:**
    - Do not show the signing private key leaving the card or token — the platform sends a hash and receives a signature back
    - Do not draw the future verifier contacting a live OCSP responder, since LTV exists precisely because that responder may be long gone
    - Do not present server-side HSM signing as satisfying eIDAS sole-control without explicit cryptographic-control attestation
    - Do not conflate TLS protection in transit with signature integrity that survives storage and expiry
    - Do not imply AmbiSecure holds AATL or EU Trusted List inclusion
- **Alt text:** A signature crossing its own certificate's expiry and still verifying, because LTV baked the OCSP response and an RFC 3161 timestamp into the CMS bundle at signing time.
- **Export filename:** `ambisecure-blog-designing-email-document-signing-platforms-1200x630.png`
- **Visual similarity group:** VSG-PKI-LIFECYCLE
- **Currently uses:** blog.png
- **Notes:** Cornerstone. Body references Secure Mail Suite, PKCS Signature Suite and Digital Signature Token as AmbiSecure products — keep the image at architecture level rather than product-branded.

## 060 — Building Secure IoT Identity with Security Applets

- **Record number:** 60
- **Page name:** Building Secure IoT Identity with Security Applets.
- **Canonical URL:** https://ambisecure.ambimat.com/blog/secure-iot-identity-with-applets/
- **Section:** Blog
- **Page type:** ARCHITECTURE ARTICLE
- **Primary topic:** IoT security | **Secondary:** JavaCard; Device identity; Provisioning
- **Design priority:** P1
- **Approved headline:** Five Applets, One Device Identity
- **Alternative headline:** The Host MCU Never Sees the Key
- **Category label:** ARCHITECTURE
- **Core message:** Hardware-backed IoT identity is not one applet but five — provisioning, attestation, mTLS, signed firmware and key rotation — running on a CC EAL6+ secure element the host MCU can never read.
- **Audience:** Connected-product OEM
- **Diagram type:** SYSTEM ARCHITECTURE
- **Visual concept:** Dominant object: a secure-element die shown as a bounded enclosure, with five labelled applet tiles stacked inside it (PROVISIONING, ATTESTATION, mTLS, SIGNED FIRMWARE, KEY ROTATION) — exactly five nodes, no more. The host MCU sits outside the boundary connected by a single thin bus line labelled ISO 7816 / I2C / SPI; the flow across that bus is command-and-result only, drawn as request arrows in and signature/public-key arrows out. Inside the boundary: identity_key = KDF(master_key, UID) resting in a non-extractable slot; outside: the public key and signed quote travelling to a fleet platform. Variation within VSG-SE-ARCHITECTURE: this is the applet-stack view of an SE (five functional tiles), not a silicon cutaway or a trust chain. Allowed labels: applet names, the bus name, SCP03, UID. Must not imply the applets are firmware on the MCU or that the MCU holds any key.
- **Avoid:**
    - Do not draw the identity private key crossing the bus to the host MCU
    - do not show the Master Key present on the host or in the fleet platform
    - do not depict per-device keys as copies of one shared fleet key
    - do not label the secure element with a certification the page does not claim beyond CC EAL6+
    - do not show more than the five named applets
- **Alt text:** Five AmbiSecure JavaCard applets inside a secure-element boundary — provisioning to key rotation — with only commands and public keys crossing to the host MCU.
- **Export filename:** `ambisecure-blog-secure-iot-identity-with-applets-1200x630.png`
- **Visual similarity group:** VSG-SE-ARCHITECTURE
- **Currently uses:** blog.png

## 061 — Engineering ePassport Issuance and Identity Platforms

- **Record number:** 61
- **Page name:** Engineering ePassport Issuance and Identity Platforms.
- **Canonical URL:** https://ambisecure.ambimat.com/blog/engineering-epassport-issuance-platforms/
- **Section:** Blog
- **Page type:** ARCHITECTURE ARTICLE
- **Primary topic:** Government identity | **Secondary:** PKI; Personalization; Certificate lifecycle
- **Design priority:** P1
- **Approved headline:** An ePassport Is Two Systems
- **Alternative headline:** CSCA to Chip: The Issuing Backbone
- **Category label:** ARCHITECTURE
- **Core message:** An ICAO 9303 ePassport programme is mostly the data-centre half — CSCA/DSC PKI, LDS generation, SOd signing, personalisation and inspection support — and that is where the seams break.
- **Audience:** Government programme
- **Diagram type:** TRUST CHAIN
- **Visual concept:** Dominant object: a vertical signing chain from CSCA (root, one per country, long-lived) down through DSC (short-lived, months) to the SOd sitting on a contactless passport chip — the chip rendered small and inset, deliberately dwarfed by the data-centre side. Five nodes maximum: CSCA, DSC, personalisation backbone, SOd/LDS on chip, ICAO PKD. The flow: DSC signs the SOd that binds hashed data groups DG1 (MRZ) and DG2 (face); the CSCA publishes DSCs to the PKD so a border verifier can walk the chain. Inside hardware: the LDS data groups and the signed SOd on the chip. Externally communicating: PKD publication and the contactless personalisation write. Allowed labels: CSCA, DSC, SOd, LDS, DG1, DG2, ICAO PKD, ISO/IEC 14443. Must not imply the CSCA signs individual passports directly.
- **Avoid:**
    - Do not show the CSCA signing the SOd — only a DSC does
    - do not draw contact pads or a chip module on what is a contactless ISO/IEC 14443 inlay
    - do not show DG3 fingerprints readable without EAC gating
    - do not depict the ICAO PKD as a live per-border lookup like OCSP
    - do not imply AmbiSecure issues or operates a country's CSCA
- **Alt text:** The issuing half of an ICAO 9303 passport programme: CSCA signs short-lived DSCs, a DSC signs each SOd, and the PKD publishes the chain for border verifiers.
- **Export filename:** `ambisecure-blog-engineering-epassport-issuance-platforms-1200x630.png`
- **Visual similarity group:** VSG-EPASSPORT
- **Currently uses:** blog.png

## 062 — Passkeys vs Traditional MFA

- **Record number:** 62
- **Page name:** Passkeys vs Traditional MFA.
- **Canonical URL:** https://ambisecure.ambimat.com/blog/passkeys-vs-traditional-mfa/
- **Section:** Blog
- **Page type:** COMPARISON
- **Primary topic:** Passkeys | **Secondary:** Phishing-resistant authentication; WebAuthn; Passwordless authentication
- **Design priority:** P1
- **Approved headline:** MFA Was a Strategy, Passkeys Are a Primitive
- **Alternative headline:** Origin Binding Retires the Phishing Page
- **Category label:** SECURITY EXPLAINER
- **Core message:** Passkeys are not a stronger factor bolted onto MFA — they are a different cryptographic primitive whose origin binding retires phishing, replay, credential stuffing and push fatigue as attack classes.
- **Audience:** IAM leader
- **Diagram type:** COMPARISON
- **Visual concept:** Dominant object: two credential objects side by side under a single AITM proxy page positioned between user and relying party. Left: a bearer token (a 6-digit OTP / push approval) drawn as a value that copies cleanly through the proxy and arrives valid at the backend. Right: an origin-bound key pair whose assertion is computed over the relying-party origin, so the proxy's origin does not match and the ceremony yields nothing usable. Four nodes only: user, AITM proxy, legitimate RP, credential store. Inside hardware: the passkey's private key, never rendered in transit. Externally: only a signed assertion and the origin string. Variation within VSG-COMPARISON-MATRIX: this is a two-object attack-path comparison under a live proxy, not a feature grid. Allowed labels: TOTP, push, origin, signed assertion, AITM. Must not imply passkeys are simply a third factor added to a stack.
- **Avoid:**
    - Do not equate a passkey with a hardware security key — passkeys may be synced (BE=1) or device-bound (BE=0)
    - do not show the passkey private key travelling to the relying party
    - do not present passkeys as an extra factor stacked on password plus OTP
    - do not imply passkeys defeat endpoint malware or device theft
    - do not show an OTP being blocked by the proxy — the point is that it passes through
- **Alt text:** Why an adversary-in-the-middle proxy replays a one-time code but cannot use a passkey: the assertion is bound to the relying-party origin it never matches.
- **Export filename:** `ambisecure-blog-passkeys-vs-traditional-mfa-1200x630.png`
- **Visual similarity group:** VSG-COMPARISON-MATRIX
- **Currently uses:** blog.png

## 063 — Why Hardware-Backed Identity Matters

- **Record number:** 63
- **Page name:** Why Hardware-Backed Identity Matters.
- **Canonical URL:** https://ambisecure.ambimat.com/blog/why-hardware-backed-identity-matters/
- **Section:** Blog
- **Page type:** THOUGHT LEADERSHIP
- **Primary topic:** Secure Elements | **Secondary:** Hardware security keys; Device identity; Attestation
- **Design priority:** P1
- **Approved headline:** Cost Per Extraction Decides the Architecture
- **Alternative headline:** What a Credential Costs to Steal
- **Category label:** TECHNICAL ARTICLE
- **Core message:** Hardware does not make key theft impossible — it moves cost-per-extraction by orders of magnitude, and that economics is what decides whether authentication holds at fleet scale.
- **Audience:** CISO
- **Diagram type:** COMPARISON
- **Visual concept:** Dominant object: a rising cost-per-extraction ladder on a logarithmic cost axis, exactly five rungs drawn as credential tiers: password ($0–$5, phishing kit), software key on a laptop ($50–$5k, malware or access broker), TPM-bound ($5k–$50k, kernel compromise or chip-level rig), consumer secure element ($50k–$500k, decap and microprobe), CC EAL6+ secure element ($500k–$5m+, funded actor, months). A horizontal 'mass attack becomes uneconomic' threshold line crosses the ladder above the software tier. Inside hardware: nothing rendered as extractable — each hardware rung shows a physical attack rig, not a key in flight. Externally: only the attacker's cost. Variation within VSG-THREAT-LANDSCAPE: this is an economic ladder with a cost axis, distinct from rec 125's field-device failure-mode map. Allowed labels: the five tier names and their dollar bands verbatim from the page.
- **Avoid:**
    - Do not present hardware as making extraction impossible — the page's claim is cost, not impossibility
    - do not treat TPM, consumer SE and CC EAL6+ SE as one hardware tier
    - do not show a private key being read out of any secure element
    - do not attribute the dollar bands to a benchmark or certification AmbiSecure performed
    - do not imply platform secure enclaves are inadequate for consumer use — the page says they are fine there
- **Alt text:** A logarithmic ladder of what stealing one credential costs an attacker, from a $5 phishing kit to millions against a CC EAL6+ secure element boundary.
- **Export filename:** `ambisecure-blog-why-hardware-backed-identity-matters-1200x630.png`
- **Visual similarity group:** VSG-THREAT-LANDSCAPE
- **Currently uses:** blog.png

## 064 — Designing Enterprise Passwordless Systems

- **Record number:** 64
- **Page name:** Designing Enterprise Passwordless Systems.
- **Canonical URL:** https://ambisecure.ambimat.com/blog/designing-enterprise-passwordless-systems/
- **Section:** Blog
- **Page type:** HOW-TO ARTICLE
- **Primary topic:** Passwordless authentication | **Secondary:** WebAuthn; Enterprise access; Attestation
- **Design priority:** P1
- **Approved headline:** Nine Components Around the Protocol
- **Alternative headline:** WebAuthn Is the Easy Part
- **Category label:** ARCHITECTURE
- **Core message:** WebAuthn is the easy part — what separates a weekend demo from a 10,000-seat rollout is the nine operational components around the protocol.
- **Audience:** IAM leader
- **Diagram type:** SYSTEM ARCHITECTURE
- **Visual concept:** Dominant object: a small WebAuthn ceremony box drawn deliberately compact at the centre, ringed by the operational scaffolding that dwarfs it. Five major nodes only, chosen from the page's nine components: authenticators (card + USB key, two per user), provisioning pipeline (HR-triggered, day-1 IT desk), FIDO validation server with AAGUID allow-list, IdP federation fanning out to SAML/OIDC apps, and lifecycle automation with IT-mediated recovery. Inside hardware: the credential key pairs on the two authenticators. Externally: attestation statements, AAGUID and signCount flowing into audit logging. Variation within VSG-ENTERPRISE-ACCESS: the organising idea is scaffolding-around-a-small-protocol-core, with an HR-to-IdP propagation spine. Allowed labels: component names, AAGUID, signCount, SAML/OIDC, FIDO MDS. Must not imply the protocol itself is the hard part.
- **Avoid:**
    - Do not show a password fallback anywhere in the recovery path — the page is explicit that recovery is IT-mediated re-enrolment
    - do not draw self-service recovery without identity verification
    - do not show attestation enforcement without an AAGUID allow-list
    - do not depict apps integrating WebAuthn individually rather than federating at the IdP
    - do not imply AmbiSecure operates the customer's HR or IdP systems
- **Alt text:** A compact WebAuthn ceremony ringed by the provisioning, validation, federation, recovery and lifecycle machinery a workforce rollout actually runs on.
- **Export filename:** `ambisecure-blog-designing-enterprise-passwordless-systems-1200x630.png`
- **Visual similarity group:** VSG-ENTERPRISE-ACCESS
- **Currently uses:** blog.png

## 065 — Platform vs Roaming Authenticators

- **Record number:** 65
- **Page name:** Platform vs Roaming Authenticators.
- **Canonical URL:** https://ambisecure.ambimat.com/blog/platform-vs-roaming-authenticators/
- **Section:** Blog
- **Page type:** COMPARISON
- **Primary topic:** Hardware security keys | **Secondary:** FIDO2; WebAuthn; Passkeys
- **Design priority:** P1
- **Approved headline:** Platform or Roaming Is an Operational Choice
- **Alternative headline:** Both Are First-Class WebAuthn Citizens
- **Category label:** TECHNICAL ARTICLE
- **Core message:** Platform and roaming authenticators are both first-class WebAuthn citizens; the choice is operational — work patterns, assurance and budget — and the right answer is usually both.
- **Audience:** Security architect
- **Diagram type:** COMPARISON
- **Visual concept:** Dominant object: a two-column form-factor grid with an equal-weight balance, not a winner. Left column, platform: a laptop with its TPM 2.0 / Secure Enclave shown bound to that one host, attestation formats tpm and apple noted. Right column, roaming: an OnePass Card and OnePass USB Key that detach and travel across hosts over USB-HID and NFC. Five nodes maximum: platform authenticator, host device, roaming authenticator, second host, and the phone-as-roaming node reached over the hybrid (caBLE) transport drawn as a dashed link rather than a cable. Inside hardware: the credential key in each authenticator's secure element. Externally: the assertion only. Variation within VSG-COMPARISON-MATRIX: this is a form-factor and portability grid with a mobility axis, unlike rec 62's attack-path comparison. Allowed labels: form-factor names, USB-HID, NFC, caBLE, AAGUID, TPM 2.0.
- **Avoid:**
    - Do not depict WebAuthn as preferring or ranking one attachment over the other
    - do not draw the caBLE phone as a platform authenticator on the host it signs for — over hybrid transport it is roaming
    - do not show a credential migrating from a platform authenticator to a roaming key
    - do not give a battery-free USB key a battery or a pairing step
    - do not conflate a synced passkey in a platform authenticator with a device-bound credential
- **Alt text:** Platform authenticators bound to one host versus roaming OnePass cards and keys that travel, with the phone reaching hosts over WebAuthn hybrid transport.
- **Export filename:** `ambisecure-blog-platform-vs-roaming-authenticators-1200x630.png`
- **Visual similarity group:** VSG-COMPARISON-MATRIX
- **Currently uses:** blog.png

# RESOURCE PAGES

## 066 — Engineering References

- **Record number:** 66
- **Page name:** Searchable reference databases for the bytes you stare at every day.
- **Canonical URL:** https://ambisecure.ambimat.com/references/
- **Section:** Resource
- **Page type:** REFERENCE DATABASE
- **Primary topic:** Other | **Secondary:** APDU; PKI; FIDO2
- **Design priority:** P1
- **Approved headline:** The bytes you stare at, indexed
- **Alternative headline:** Reference lookups that never leave your browser
- **Category label:** REFERENCE
- **Core message:** A client-side library of searchable smart-card, FIDO, PKI-encoding and V2X reference databases that an engineer can deep-link into without an account.
- **Audience:** Smart-card engineer
- **Diagram type:** CONCEPTUAL ILLUSTRATION
- **Visual concept:** VSG variation: this is the only concept in the group with NO data rows visible — the dominant object is an index board of table spines, not a table. A flat wall-mounted card-catalogue board shows five labelled domain shelves, each holding a stack of closed table spines: 'V2X / ITS PKI', 'Smart-card & APDU', 'ASN.1 & PKI encoding', 'FIDO / WebAuthn', 'EMV & NFC'. A thin browser chrome frames the whole board to signal that lookup and search happen entirely client-side; no server, cloud, or upload arrow appears anywhere. Allowed labels: the five shelf names only, plus spine ticks such as 'ISO 7816-4', 'IEEE 1609.2', 'SGP.32' — no entry counts, since the on-page total and the number of published references currently disagree.
- **Avoid:**
    - Do not draw a server, cloud, upload arrow or account/login element — every reference searches client-side
    - Do not print an entry or reference count, the body says 17 while 18 references are published
    - Do not depict this as a scanner, validator or live card session
    - Do not show a card, reader or authenticator device — this is a library index, not hardware
- **Alt text:** AmbiSecure engineering reference library shown as a catalogue board of smart-card, FIDO, PKI-encoding and V2X lookup tables, all searched inside the browser.
- **Export filename:** `ambisecure-references-1200x630.png`
- **Visual similarity group:** VSG-REFERENCE-TABLE
- **Currently uses:** references.png
- **Notes:** Hub page; strong internal-link value. Flag: body claims '17 engineering references' but /references/ ships 18 subdirectories (desfire-commands added 2026-07-06) — count likely stale, so the image must not state a number.

## 067 — APDU Status Words

- **Record number:** 67
- **Page name:** APDU Status Words
- **Canonical URL:** https://ambisecure.ambimat.com/references/apdu-status/
- **Section:** Resource
- **Page type:** REFERENCE DATABASE
- **Primary topic:** APDU | **Secondary:** Smart cards; JavaCard
- **Design priority:** P1
- **Approved headline:** SW1 SW2, decoded across four specs
- **Alternative headline:** Why 6982 is not 6A82
- **Category label:** REFERENCE
- **Core message:** One searchable table resolves any SW1/SW2 status word across ISO/IEC 7816-4 and the GlobalPlatform, EMV and FIDO U2F additions that reuse the same two bytes.
- **Audience:** Smart-card engineer
- **Diagram type:** TECHNICAL WORKBENCH
- **Visual concept:** VSG variation: the dominant object is a single oversized two-byte KEY COLUMN — the hex code itself is the hero, and the data shape is one key fanning out to a provenance column, unlike the flat row grids elsewhere in this group. A tall left-hand column of SW1/SW2 codes sits beside three severity lanes (OK, Warning, Error); at most five codes are legible: 9000 Success, 6282 End of file reached, 6982 Security status not satisfied, 6A82 File not found, 6D00 INS not supported. A narrow right-hand 'Source' gutter shows the same two-byte space being claimed by four specs — ISO/IEC 7816-4, GlobalPlatform, EMV, FIDO U2F — which is the page's real point. Allowed labels: those hex codes, the three lane names, the four spec names; nothing communicates externally because this is a static dictionary, not a card session.
- **Avoid:**
    - Do not draw a card, reader, or live APDU exchange — no command is being sent, this is a lookup dictionary
    - Do not present a status word as a security verdict — 6982 reports state, it does not prove an attack
    - Do not invent status words outside the 48 published rows
    - Do not colour 6100 or 6282 as errors — they are warnings, and 9000 is the only success code
- **Alt text:** SW1/SW2 status-word lookup where one two-byte code resolves against ISO 7816-4, GlobalPlatform, EMV and FIDO U2F meanings in AmbiSecure's smart-card reference.
- **Export filename:** `ambisecure-references-apdu-status-1200x630.png`
- **Visual similarity group:** VSG-REFERENCE-TABLE
- **Currently uses:** references.png
- **Notes:** Highest search value in the batch. Minor site bug (not image-affecting): idCol is 'sw', but 6985, 6A80 and 6D00 each appear twice (ISO row + FIDO U2F row), so those anchor IDs collide and #6985 only reaches the first row.

## 068 — EMV Tags Reference

- **Record number:** 68
- **Page name:** EMV Tags
- **Canonical URL:** https://ambisecure.ambimat.com/references/emv-tags/
- **Section:** Resource
- **Page type:** REFERENCE DATABASE
- **Primary topic:** BER-TLV | **Secondary:** Smart cards; APDU; Transit security
- **Design priority:** P2
- **Approved headline:** EMV tags, filtered by what they do
- **Alternative headline:** Books 3, 4 and Contactless in one table
- **Category label:** REFERENCE
- **Core message:** A category-faceted EMV tag catalogue covering Books 3 and 4 plus Contactless C-2/C-3, so an engineer can narrow to the handful of tags that matter at one point in a transaction.
- **Audience:** Fintech security team
- **Diagram type:** TECHNICAL WORKBENCH
- **Visual concept:** VSG variation: the dominant object is a row of FACET CHIPS above a partially-filtered catalogue — the filter mechanism, not the key column, is the hero, and the data shape is a subset carved out of 56 rows. Six category chips run across the top, one visibly active: card-data, transaction, crypto, capability, DOL, template. Beneath, a shortened table shows at most five surviving entries by name — Application Cryptogram (ARQC/TC/AAC), Application Interchange Profile (AIP), CDOL1, FCI Template, Track 2 Equivalent Data — with a detail gutter carrying real annotations such as 'CID: 0x80 ARQC, 0x40 TC, 0x00 AAC'. Allowed labels: the six chip names, those five entry names, that CID line; nothing depicts a terminal, an amount, or a live authorisation.
- **Avoid:**
    - Do not render a POS terminal, contactless tap, payment amount or approval tick — no transaction is running
    - Do not show cardholder data such as a real PAN, expiry, or Track 2 payload
    - Do not print invented EMV hex tag values — the page's Tag column currently emits category strings, not hex tags
    - Do not imply the catalogue validates or approves a cryptogram — ARQC/TC/AAC are named, never verified
- **Alt text:** Faceted EMV tag catalogue on AmbiSecure narrowing Books 3, 4 and Contactless entries to one category — crypto, DOL, template — for card bring-up work.
- **Export filename:** `ambisecure-references-emv-tags-1200x630.png`
- **Visual similarity group:** VSG-REFERENCE-TABLE
- **Currently uses:** references.png
- **Notes:** HUMAN REVIEW — data bug: in the page's AS_REF the first column is field 'tag' (label 'Tag') but every row's 'tag' value holds the filter category ('AID', 'card-data', 'crypto'), so the hex EMV tags (4F, 50, 57, 5A, 9F02, 9F26 …) never render and the column duplicates 'Category'. idCol='tag' also collapses all 56 anchor IDs onto 9 duplicates. Fix the data before an image cites hex tags.

## 069 — ISO/IEC 7816 CLA Values Reference

- **Record number:** 69
- **Page name:** ISO 7816 CLA Values
- **Canonical URL:** https://ambisecure.ambimat.com/references/iso7816/
- **Section:** Resource
- **Page type:** PROTOCOL REFERENCE
- **Primary topic:** APDU | **Secondary:** Smart cards; JavaCard
- **Design priority:** P2
- **Approved headline:** The CLA byte, one bit at a time
- **Alternative headline:** Why FF is never a CLA
- **Category label:** REFERENCE
- **Core message:** The ISO/IEC 7816-4 CLA byte is a bit-field, and this reference shows what each common value encodes about channel, secure messaging and chaining.
- **Audience:** Smart-card engineer
- **Diagram type:** DATA PARSER
- **Visual concept:** VSG variation: the dominant object is a SINGLE BYTE blown up into a bit ruler — this is the only concept in the group that decomposes one key rather than listing many, and the data shape is bit-field → meaning. A wide eight-cell ruler labelled b8…b1 sits across the upper third, with brackets marking the secure-messaging bits and the logical-channel bits; a short five-row table below anchors it to real values: 00 (standard interindustry, channel 0), 0C (SM with authenticated header), 80 (proprietary), 84 (proprietary with SM, SCP02/SCP03), FF (reserved for PPS — not a valid CLA). The FF row is drawn struck-through or set apart, because the page's point is that FF collides with the ISO 7816-3 PPS request. Allowed labels: b8…b1, those five hex values, and the words 'Interindustry', 'Proprietary', 'Reserved'.
- **Avoid:**
    - Do not show FF as a usable CLA — it is reserved for PPS and collides with ISO 7816-3
    - Do not draw an INS, P1, P2, Lc or Le field — this reference covers the CLA byte only
    - Do not depict a card, reader or live command being transmitted
    - Do not imply GlobalPlatform owns 80/84/E0 by standard — they are proprietary-class values GP conventionally uses
- **Alt text:** ISO/IEC 7816-4 CLA byte expanded into its bit-field, mapping 00, 0C, 80 and 84 to channel, secure-messaging and chaining meaning in AmbiSecure's APDU reference.
- **Export filename:** `ambisecure-references-iso7816-1200x630.png`
- **Visual similarity group:** VSG-REFERENCE-TABLE
- **Currently uses:** references.png

## 070 — WebAuthn COSE Algorithms Reference

- **Record number:** 70
- **Page name:** WebAuthn COSE Algorithms
- **Canonical URL:** https://ambisecure.ambimat.com/references/webauthn-cose/
- **Section:** Resource
- **Page type:** REFERENCE DATABASE
- **Primary topic:** WebAuthn | **Secondary:** FIDO2; Attestation; Hardware security keys
- **Design priority:** P2
- **Approved headline:** ES256 is -7, and why that matters
- **Alternative headline:** COSE identifiers WebAuthn actually negotiates
- **Category label:** REFERENCE
- **Core message:** COSE algorithm identifiers are signed integers from the IANA registry, and this reference names the ones a relying party will actually negotiate — and the one it should refuse.
- **Audience:** Security architect
- **Diagram type:** CONCEPTUAL ILLUSTRATION
- **Visual concept:** VSG variation: the dominant object is a signed NUMBER LINE, not a grid — the key space here is negative integers, and no other concept in the group uses an axis as its organising shape. A horizontal axis runs from -65535 through zero into the small positives, with at most five identifiers pinned to it: -7 ES256 (marked as the WebAuthn default), -8 EdDSA, -37 PS256, -257 RS256, and -65535 RS1 pinned far left and visibly greyed/struck as deprecated. A faint divider separates the asymmetric run (negative IDs) from the symmetric cluster (4, 5, 24) so the two classes read as different regions of the registry. Allowed labels: the five algorithm names with their integer IDs, 'Asymmetric', 'Symmetric', 'RFC 8152 / IANA'; no key material, ceremony, or device appears.
- **Avoid:**
    - Do not show a public or private key leaving an authenticator — the page lists identifiers, not key material
    - Do not draw a registration or assertion ceremony, browser, or relying party — this is a registry, not a flow
    - Do not present RS1 (-65535) as acceptable — it is SHA-1-based and marked do-not-accept
    - Do not imply the reference tests or negotiates algorithms on the reader's behalf
- **Alt text:** COSE algorithm identifiers plotted on a signed axis — ES256 at -7, EdDSA at -8, deprecated RS1 at -65535 — in AmbiSecure's WebAuthn and FIDO2 reference.
- **Export filename:** `ambisecure-references-webauthn-cose-1200x630.png`
- **Visual similarity group:** VSG-REFERENCE-TABLE
- **Currently uses:** references.png

## 071 — FIDO AAGUIDs Reference

- **Record number:** 71
- **Page name:** FIDO AAGUIDs
- **Canonical URL:** https://ambisecure.ambimat.com/references/aaguids/
- **Section:** Resource
- **Page type:** REFERENCE DATABASE
- **Primary topic:** FIDO2 | **Secondary:** WebAuthn; Attestation; Hardware security keys
- **Design priority:** P1
- **Approved headline:** Which authenticator is that AAGUID
- **Alternative headline:** AAGUIDs name the model, not the device
- **Category label:** REFERENCE
- **Core message:** A curated AAGUID directory that turns the 128-bit identifier in an attestation statement into a vendor, authenticator model and transport set.
- **Audience:** IAM leader
- **Diagram type:** TECHNICAL WORKBENCH
- **Visual concept:** VSG variation: the dominant object is a VENDOR-GROUPED directory keyed by a 128-bit GUID — the widest key in the group, and the only concept whose rows resolve to product identity rather than to a byte meaning. A left column carries full hyphenated AAGUIDs in mono, resolving rightward into vendor, model and a transports chip (USB / NFC / Platform). At most five vendor bands are legible — Yubico, Google, Microsoft, Apple, Feitian — with one row fully readable as the real anchor: cb69481e-8ff7-4039-93ec-0a2729a154a8 → Yubico → YubiKey 5 Series → USB, NFC. A small caption may read 'FIDO Metadata Service v3 · curated subset'; the image must read as a directory lookup, never as device inspection.
- **Avoid:**
    - Do not imply an AAGUID identifies an individual device — it identifies an authenticator model, and is deliberately not unique per unit
    - Do not show the AmbiSecure placeholder AAGUIDs (f2b8b8b8-… / a1a1a1a1-…) — they are not real registered values
    - Do not draw a plugged-in key being read, scanned or verified — nothing is queried live
    - Do not conflate the platform rows (iCloud Keychain, Google Password Manager) with hardware security keys — those are synced-passkey providers
- **Alt text:** AAGUID directory resolving a 128-bit FIDO2 identifier into vendor, model and transports, letting AmbiSecure readers map attestation data to real devices.
- **Export filename:** `ambisecure-references-aaguids-1200x630.png`
- **Visual similarity group:** VSG-REFERENCE-TABLE
- **Currently uses:** references.png
- **Notes:** HUMAN REVIEW — the live table publishes two obviously fake AmbiSecure rows: 'f2b8b8b8-b8b8-b8b8-b8b8-b8b8b8b8b8b8 / OnePass Card (placeholder)' and 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1 / OnePass USB Key (placeholder)'. Placeholder AAGUIDs for own products on a public reference page is a credibility risk — replace with registered values or remove. Image must not depict them.

## 072 — DESFire Status Codes Reference

- **Record number:** 72
- **Page name:** DESFire Status Codes
- **Canonical URL:** https://ambisecure.ambimat.com/references/desfire/
- **Section:** Resource
- **Page type:** REFERENCE DATABASE
- **Primary topic:** Smart cards | **Secondary:** NFC; Transit security
- **Design priority:** P2
- **Approved headline:** DESFire answers in one byte
- **Alternative headline:** AF is not an error
- **Category label:** REFERENCE
- **Core message:** Every documented DESFire EV1/EV2/EV3 response status resolved from its one-byte code to the constant name and what it actually tells you about card state.
- **Audience:** Transit-system architect
- **Diagram type:** TECHNICAL WORKBENCH
- **Visual concept:** VSG variation: the dominant object is a CONSTANT-NAME column — the hero text is the SCREAMING_SNAKE identifier rather than the hex, inverting the key/meaning emphasis used on the APDU status page. A narrow one-byte code strip on the left feeds a wide constant column: 00 OPERATION_OK, AF ADDITIONAL_FRAME, 1E INTEGRITY_ERROR, 9D PERMISSION_DENIED, AE AUTHENTICATION_ERROR — five rows maximum. AF is visually classed with 00 as Info/Success rather than with the error rows, since ADDITIONAL_FRAME simply means more data follows in a multi-frame exchange; a small band marks the three classes Success, Info, Error. Allowed labels: those five codes and constants, the three class names, and 'EV1 / EV2 / EV3'; no card, validator or gate appears.
- **Avoid:**
    - Do not classify AF (ADDITIONAL_FRAME) or 0C (NO_CHANGES) as errors — they are informational
    - Do not draw a transit gate, validator, or tap animation — this is a status dictionary, not a live session
    - Do not present INTEGRITY_ERROR as proof of tampering — it means CRC/MAC mismatch, which is commonly a transmission fault
    - Do not show a contact chip pad on DESFire, which is a contactless PICC over ISO/IEC 14443
- **Alt text:** DESFire EV1/EV2/EV3 response statuses mapped from one-byte code to constants like OPERATION_OK and PERMISSION_DENIED in the AmbiSecure contactless reference.
- **Export filename:** `ambisecure-references-desfire-1200x630.png`
- **Visual similarity group:** VSG-REFERENCE-TABLE
- **Currently uses:** references.png

## 073 — DESFire Command Set Reference

- **Record number:** 73
- **Page name:** DESFire Command Set
- **Canonical URL:** https://ambisecure.ambimat.com/references/desfire-commands/
- **Section:** Resource
- **Page type:** PROTOCOL REFERENCE
- **Primary topic:** Smart cards | **Secondary:** NFC; Transit security; APDU
- **Design priority:** P2
- **Approved headline:** Does that command exist on EV2
- **Alternative headline:** DESFire command set across three generations
- **Category label:** REFERENCE
- **Core message:** An interface-level DESFire command reference answering three questions fast: does the command exist on your target generation, what is its one-byte code, and which authentication state it belongs to.
- **Audience:** Smart-card engineer
- **Diagram type:** COMPARISON
- **Visual concept:** VSG variation: the only CAPABILITY MATRIX in the group — the dominant object is three support columns (EV1 / EV2 / EV3) of yes/no marks, so the data shape is generation coverage rather than key→meaning lookup. Command name and one-byte code sit at the left; at most five rows are legible and each is chosen to show a different matrix pattern: AuthenticateAES 0xAA (yes/yes/yes), AuthenticateEV2First 0x71 (no/yes/yes), CreateApplication 0xCA, ReadData 0xBD/0xAD (dual opcode form), ISOSelectFile (ISO 7816-4 wrapped class). A left rail carries the functional classes — Auth & keys, PICC & config, File management, Data & value, ISO 7816-4 — signalling that DESFire gates commands behind authentication state. Allowed labels: those command names and codes, the class names, the EV1/EV2/EV3 headers.
- **Avoid:**
    - Do not show byte-level framing, secure-messaging payloads or session-key material — the page is explicitly an architecture-level interface reference
    - Do not mark AuthenticateEV2First/EV2NonFirst, delegated applications, multiple key sets, Transaction MAC or Proximity Check as EV1 features — they arrive at EV2
    - Do not imply EV3 adds a large new command set — it mostly refines existing commands
    - Do not present the matrix as a card-compatibility test or a live capability probe
- **Alt text:** DESFire command support matrix across EV1, EV2 and EV3 with one-byte codes and functional classes, for reader and personalisation bring-up on AmbiSecure.
- **Export filename:** `ambisecure-references-desfire-commands-1200x630.png`
- **Visual similarity group:** VSG-REFERENCE-TABLE
- **Currently uses:** references.png

## 074 — GlobalPlatform Status Words Reference

- **Record number:** 74
- **Page name:** GlobalPlatform Status Words
- **Canonical URL:** https://ambisecure.ambimat.com/references/globalplatform/
- **Section:** Resource
- **Page type:** REFERENCE DATABASE
- **Primary topic:** JavaCard | **Secondary:** Smart cards; APDU; Personalization
- **Design priority:** P2
- **Approved headline:** GlobalPlatform status words for INSTALL and LOAD
- **Alternative headline:** When GET STATUS returns 6A84
- **Category label:** REFERENCE
- **Core message:** The status words GlobalPlatform 2.3.1 card-management commands return, so a failed INSTALL or LOAD resolves to a cause instead of a guess.
- **Audience:** JavaCard developer
- **Diagram type:** TECHNICAL WORKBENCH
- **Visual concept:** VSG variation: the dominant object is a COMMAND RAIL feeding a status column — the data shape is command→outcome, the only concept in the group organised by the issuing command rather than by the key alone. A left rail lists the five GP 2.3.1 card-management commands INSTALL, LOAD, DELETE, GET STATUS, GET DATA; arrows converge into a returned-SW column showing at most five codes: 9000 Success, 6A84 Not enough memory space, 6283 Card Life Cycle State is CARD_LOCKED, 6300 Authentication of host cryptogram failed, 9485 Invalid key check value. The two GP-specific 94xx codes are visually set apart from the ISO-shaped 6xxx codes to show GP extends the same two-byte space. Allowed labels: the five command names, the five hex codes with short meanings, 'GP 2.3.1 §11'; no key material or SCP session bytes are drawn.
- **Avoid:**
    - Do not show SCP02/SCP03 session keys, host cryptograms or key material in the clear — 6300 and 9485 are named, never computed
    - Do not depict content being loaded onto a card — no CAP file transfer or live card-management session
    - Do not treat 9484/9485 as ISO 7816-4 codes — they are GlobalPlatform key-handling specific
    - Do not imply CARD_LOCKED (6283) is a card fault — it is a life-cycle state
- **Alt text:** GlobalPlatform 2.3.1 card-management commands mapped to the status words they return, including 6A84 and 9485, in the AmbiSecure JavaCard engineering reference.
- **Export filename:** `ambisecure-references-globalplatform-1200x630.png`
- **Visual similarity group:** VSG-REFERENCE-TABLE
- **Currently uses:** references.png

## 075 — ASN.1 Universal Tags Reference

- **Record number:** 75
- **Page name:** ASN.1 Universal Tags
- **Canonical URL:** https://ambisecure.ambimat.com/references/asn1/
- **Section:** Resource
- **Page type:** PROTOCOL REFERENCE
- **Primary topic:** BER-TLV | **Secondary:** PKI; Certificate lifecycle; Attestation
- **Design priority:** P2
- **Approved headline:** The 16 tags under every certificate
- **Alternative headline:** Primitive or constructed: the ASN.1 floor
- **Category label:** REFERENCE
- **Core message:** The sixteen ASN.1 universal-class tags, split by primitive versus constructed form, are the encoding floor beneath X.509, PKCS, CMS and FIDO attestation.
- **Audience:** PKI engineer
- **Diagram type:** DATA PARSER
- **Visual concept:** VSG variation: the dominant object is a FORM SPLIT — one closed set of 16 tags divided into two columns by primitive vs constructed, the only binary-partition shape in the group. Left column (primitive) shows at most three legible entries: 2 INTEGER (two's-complement big-endian), 3 BIT STRING (first octet = unused-bit count), 6 OBJECT IDENTIFIER; right column (constructed) shows 16 SEQUENCE and 17 SET, each drawn as a container holding smaller TLV children so the constructed form is visually literal. A thin footer band names the three encoding rules with their relationship — BER permissive, DER the canonical subset you always write, CER rare — and nothing else. Allowed labels: those five tag numbers and names, 'Primitive', 'Constructed', 'BER · DER · CER', 'ITU-T X.680 / X.690'.
- **Avoid:**
    - Do not show a full X.509 certificate, chain, or signature check — this page stops at the tag layer
    - Do not depict BER as the encoding to write — DER is the canonical form used by X.509, PKCS, CMS and WebAuthn attestation
    - Do not draw SEQUENCE or SET as primitive — they are always constructed
    - Do not label JavaCard CAP files as ASN.1 — the page is explicit that they are not
- **Alt text:** The sixteen ASN.1 universal tags split into primitive and constructed forms, showing the DER encoding floor beneath X.509 and FIDO attestation on AmbiSecure.
- **Export filename:** `ambisecure-references-asn1-1200x630.png`
- **Visual similarity group:** VSG-REFERENCE-TABLE
- **Currently uses:** references.png

## 076 — NFC NDEF TNF Types Reference

- **Record number:** 76
- **Page name:** NDEF TNF Types
- **Canonical URL:** https://ambisecure.ambimat.com/references/nfc/
- **Section:** Resource
- **Page type:** PROTOCOL REFERENCE
- **Primary topic:** NFC | **Secondary:** Smart cards
- **Design priority:** P3
- **Approved headline:** Eight TNF values, no more
- **Alternative headline:** What the first three bits of NDEF mean
- **Category label:** REFERENCE
- **Core message:** The NDEF Type Name Format field is three bits with only eight defined values, and this reference states exactly what each one means.
- **Audience:** Embedded engineer
- **Diagram type:** CONCEPTUAL ILLUSTRATION
- **Visual concept:** VSG variation: the smallest key space in the group, so the dominant object is an EXHAUSTIVE eight-slot dial rather than a scrollable table — the shape argues completeness, which no other concept in this group can claim. Eight numbered slots run 0x00 to 0x07 around or across the frame, with at most five carrying legible meaning: 0x01 NFC Forum well-known type, 0x02 Media-type (RFC 2046), 0x03 Absolute URI (RFC 3986), 0x04 NFC Forum external type, 0x06 Unchanged (chunked records only). 0x07 is drawn dimmed and labelled Reserved, and a small caption marks the field as three bits inside the NDEF record header. Allowed labels: the eight hex values, those five type names, 'TNF · 3 bits', 'NFC Forum NDEF v1.0'.
- **Avoid:**
    - Do not show a ninth TNF value or leave 0x07 undimmed — the field is 3 bits and 0x07 is Reserved
    - Do not depict a phone tapping a tag, a scan, or a live read — this is a value enumeration
    - Do not imply an NDEF record is authenticated or signed by virtue of its TNF — TNF describes the type field only
    - Do not confuse 0x06 Unchanged with 0x05 Unknown — Unchanged applies only to chunks after the first
- **Alt text:** All eight NDEF Type Name Format values from 0x00 to 0x07 shown as a complete three-bit enumeration, with well-known, MIME and external types, on AmbiSecure.
- **Export filename:** `ambisecure-references-nfc-1200x630.png`
- **Visual similarity group:** VSG-REFERENCE-TABLE
- **Currently uses:** references.png
- **Notes:** Narrow utility, 8 rows; consolidation candidate with a broader NFC/NDEF reference if the /references/ set is ever trimmed.

## 077 — X.509 / Certificate OIDs Reference

- **Record number:** 77
- **Page name:** X.509 / Certificate OIDs
- **Canonical URL:** https://ambisecure.ambimat.com/references/x509-oids/
- **Section:** Resource
- **Page type:** REFERENCE DATABASE
- **Primary topic:** PKI | **Secondary:** Certificate lifecycle; Attestation; BER-TLV
- **Design priority:** P2
- **Approved headline:** The OIDs inside a DER certificate
- **Alternative headline:** 2.5.29.15 is keyUsage
- **Category label:** REFERENCE
- **Core message:** The OIDs actually encountered inside a DER-encoded certificate — RDN attribute types, v3 extensions, signature algorithms, curves and FIDO attestation arcs — resolved to names.
- **Audience:** PKI engineer
- **Diagram type:** CERTIFICATE STRUCTURE
- **Visual concept:** VSG variation: the dominant object is an ARC TREE — dotted OID prefixes branching before they resolve into a name column, the only hierarchical key structure in the group (every other page keys on a flat code). Five arcs branch from a common root and are the only nodes: 2.5.4.x → RDN attribute types (2.5.4.3 commonName), 2.5.29.x → v3 extensions (2.5.29.15 keyUsage, 2.5.29.17 subjectAltName), 1.2.840.113549.1.1.11 → sha256WithRSAEncryption, 1.2.840.10045.4.3.2 → ecdsa-with-SHA256, and 1.3.6.1.4.1.45724.1.1.4 → id-fido-gen-ce-aaguid. Each arc terminates in a plain resolved name; the FIDO arc is set slightly apart to show attestation certificates extend the same namespace. Allowed labels: those OID strings and their names, plus the class words RDN, Extension, Algorithm, Curve, FIDO.
- **Avoid:**
    - Do not draw a certificate chain, trust path, or validation verdict — the page resolves OIDs, it does not verify certificates
    - Do not show a private key, CSR, or key-generation step
    - Do not present criticality or policy enforcement — OID identity only, extension criticality lives on the X.509 Extensions reference
    - Do not misattribute the FIDO arc — 1.3.6.1.4.1.45724 is FIDO Alliance, 1.3.6.1.4.1.41482 is Yubico
- **Alt text:** X.509 OID arcs branching into resolved names — RDN types, v3 extensions, signature algorithms and the FIDO AAGUID extension — in AmbiSecure's PKI reference.
- **Export filename:** `ambisecure-references-x509-oids-1200x630.png`
- **Visual similarity group:** VSG-REFERENCE-TABLE
- **Currently uses:** references.png
- **Notes:** Overlaps /references/x509-extensions/ (rec not in this batch); keep distinct — this page is OID identity, that page is extension semantics and criticality.

## 078 — X.509 Extensions Reference

- **Record number:** 78
- **Page name:** X.509 Extensions
- **Canonical URL:** https://ambisecure.ambimat.com/references/x509-extensions/
- **Section:** Resource
- **Page type:** REFERENCE DATABASE
- **Primary topic:** PKI | **Secondary:** Certificate lifecycle; Attestation; FIDO2
- **Design priority:** P2
- **Approved headline:** X.509 v3 Extensions Indexed by OID
- **Alternative headline:** Which X.509 Extensions Are Critical
- **Category label:** REFERENCE
- **Core message:** A searchable OID-keyed index of the X.509 v3 extensions engineers actually meet, with the criticality flag that decides whether a path validator may ignore them.
- **Audience:** PKI engineer
- **Diagram type:** CERTIFICATE STRUCTURE
- **Visual concept:** Dominant object: the extensions block of a single X.509 v3 certificate exploded into a vertical lookup rail, each row keyed by its dotted OID. Show at most five rows as exemplars — subjectKeyIdentifier 2.5.29.14 (non-critical), keyUsage 2.5.29.15 (critical), basicConstraints 2.5.29.19 (critical), extKeyUsage 2.5.29.37 (non-critical), and id-fido-gen-ce-aaguid 1.3.6.1.4.1.45724.1.1.4 (non-critical) — with the criticality flag as a distinct column marker; the relationship shown is OID to meaning to criticality, nothing more. Nothing sits inside hardware here: the certificate is the public half and travels freely, while the matching private key stays in the authenticator and is deliberately absent from the frame. Allowed labels are the dotted OIDs, extension short names, and the words critical / non-critical. Variation within VSG-REFERENCE-TABLE: this is the only member keyed by dotted OID strings with a criticality flag as the organising column; it must not read as a chain builder, validator, or scanner.
- **Avoid:**
    - Do not present the OID index as a certificate validator or chain checker
    - Do not mark keyUsage or basicConstraints as non-critical
    - Do not draw a private key next to subjectKeyIdentifier — SKID is a hash of the public key
    - Do not imply the FIDO AAGUID extension is part of RFC 5280 itself
- **Alt text:** AmbiSecure reference rail of X.509 v3 extension OIDs, flagging which extensions a path validator must treat as critical.
- **Export filename:** `ambisecure-references-x509-extensions-1200x630.png`
- **Visual similarity group:** VSG-REFERENCE-TABLE
- **Currently uses:** references.png
- **Notes:** Table renders client-side from window.AS_REF (13 rows: OID / Extension / Criticality / Class / Detail) — the thin body text is by design, not a placeholder. Companion tools are the X.509 viewer and cert chain viewer; keep this image distinct from those.

## 079 — JavaCard CAP Components Reference

- **Record number:** 79
- **Page name:** JavaCard CAP Components
- **Canonical URL:** https://ambisecure.ambimat.com/references/javacard-cap/
- **Section:** Resource
- **Page type:** REFERENCE DATABASE
- **Primary topic:** JavaCard | **Secondary:** Smart cards; Secure Elements; Provisioning
- **Design priority:** P2
- **Approved headline:** The 12 Components Inside a CAP File
- **Alternative headline:** Which CAP Components the Verifier Needs
- **Category label:** REFERENCE
- **Core message:** The twelve CAP file component types, which nine are mandatory, and what each one gives the on-card verifier before an applet may run.
- **Audience:** JavaCard developer
- **Diagram type:** STANDARD STACK
- **Visual concept:** Dominant object: one CAP file drawn as a stacked ribbon of named components, with Directory.cap's size-and-offset entries drawn as short pointers into the neighbouring blocks. Limit to five labelled blocks — Header.cap (magic, version, package AID), Directory.cap, Method.cap (JCVM bytecode), Descriptor.cap (verifier input), and a greyed Debug.cap marked as stripped — with a Mandatory / Optional marker per block. Inside hardware: the on-card verifier and the linked, relocated bytecode resident in the JavaCard secure element; communicating externally: the CAP file itself, arriving once from the off-card toolchain during loading. Allowed labels are the component filenames and the words Mandatory and Optional. Variation within VSG-REFERENCE-TABLE: this is the only member whose dominant object is a file-layout ribbon with internal offset pointers rather than a row-per-entry table.
- **Avoid:**
    - Do not depict the CAP file as directly executable bytecode that skips on-card verification
    - Do not mark Applet.cap, Export.cap or Debug.cap as mandatory
    - Do not show Debug.cap present in a production CAP
    - Do not present this reference as the interactive CAP structure explorer tool
- **Alt text:** Layout of a JavaCard CAP file's 12 components, showing which ones the on-card verifier requires and which are stripped before production.
- **Export filename:** `ambisecure-references-javacard-cap-1200x630.png`
- **Visual similarity group:** VSG-REFERENCE-TABLE
- **Currently uses:** references.png
- **Notes:** Table renders client-side from window.AS_REF (12 rows, Mandatory/Optional tag filter) — thin body text is by design. Companion CAP structure explorer lives at /resources/tools/javacard-cap/; the reference image must not be mistaken for the tool image.

## 080 — IEEE 1609.2 V2X Certificate Reference
- **Record number:** 80
- **Page name:** IEEE 1609.2 V2X Certificate Reference
- **Canonical URL:** https://ambisecure.ambimat.com/references/ieee-1609-2/
- **Section:** Resource
- **Page type:** PROTOCOL REFERENCE
- **Primary topic:** V2X | **Secondary:** PKI; Device identity; Connected mobility
- **Design priority:** P1
- **Approved headline:** IEEE 1609.2 Certificates, COER Not DER
- **Alternative headline:** A V2X Certificate Is Not X.509
- **Category label:** REFERENCE
- **Core message:** The IEEE 1609.2 CertificateBase field-by-field, and why a V2X certificate is an order of magnitude smaller than the X.509 certificate engineers already know.
- **Audience:** Automotive-security engineer
- **Diagram type:** COMPARISON
- **Visual concept:** Dominant object: a two-column comparison — a compact IEEE 1609.2 CertificateBase skeleton set against a visibly larger X.509 slab, drawn to honest relative scale (120–250 bytes versus 1.0–2.5 kB). The 1609.2 column carries at most five fields: version (Uint8, fixed at 3), type (explicit or implicit), issuer (HashedId8 — the last 8 bytes of the SHA over the issuer's COER-encoded cert), toBeSigned, and signature (ECDSA, present for explicit certs only); connecting rails call out the real contrasts — COER schema-driven and untagged versus DER TLV, HashedId8 versus Issuer DN, a 5–10 minute Pseudonymous Certificate versus multi-year end-entity validity. Inside hardware: the ECDSA private key, which stays in the ITS-S secure element; communicating externally: only the encoded certificate bytes. Allowed labels are the ASN.1 field names, COER, DER, and the byte ranges. Variation within VSG-REFERENCE-TABLE: this is the only member built as a two-column encoding-and-size comparison; it must not read as the V2X certificate parser tool.
- **Avoid:**
    - Do not draw 1609.2 fields as DER TLV triplets — COER is untagged and schema-driven
    - Do not show a trailing signature on an implicit certificate
    - Do not give a 1609.2 certificate a Subject DN or SAN
    - Do not imply the ECDSA private key leaves the ITS-S secure element
    - Do not present this reference as the IEEE 1609.2 certificate parser
- **Alt text:** AmbiSecure comparison of a compact COER-encoded V2X certificate against a DER X.509 certificate, contrasting size and issuer identification.
- **Export filename:** `ambisecure-references-ieee-1609-2-1200x630.png`
- **Visual similarity group:** VSG-REFERENCE-TABLE
- **Currently uses:** references.png
- **Notes:** Long-form prose reference (~8.2k chars), NOT a JS-rendered table — the batch premise about thin bodies does not apply to this page. Strong commercial tie to the V2X security solution and IoT Security Co-Processor. Keep visually distinct from the companion 1609.2 parser tool image.

## 081 — ETSI TS 103 097 V2X Secured-Message Reference

- **Record number:** 81
- **Page name:** ETSI TS 103 097 Secured-Message Reference
- **Canonical URL:** https://ambisecure.ambimat.com/references/etsi-ts-103-097/
- **Section:** Resource
- **Page type:** PROTOCOL REFERENCE
- **Primary topic:** V2X | **Secondary:** Connected mobility; Device identity; Embedded security
- **Design priority:** P2
- **Approved headline:** Inside a V2X SecuredMessage
- **Alternative headline:** Digest or Full Certificate, Every Message
- **Category label:** REFERENCE
- **Core message:** The on-wire ETSI TS 103 097 SecuredMessage envelope and the profile-driven cadence that decides when a frame carries a full certificate instead of an 8-byte digest.
- **Audience:** Embedded engineer
- **Diagram type:** PROTOCOL FLOW
- **Visual concept:** Dominant object: a single SecuredMessage envelope laid out left-to-right as it sits on the ITS-G5 wire, with four labelled segments — protocolVersion, headerFields (canonically ordered: generation_time as Time64 microseconds since the 2004 IEEE 1609 epoch, signer_info, its_aid), payloadFields (the CAM or DENM carried as an opaque OCTET STRING), and trailerFields holding the ECDSA signature. Beneath it, a fifth element: a short broadcast cadence strip of 10 Hz CAM frames in which most frames carry only the signing certificate's HashedId8 while every Nth carries the full certificate inline (~80 bytes of extra signer info). Inside hardware: one ECDSA signature per frame, ten per second, computed in the secure element; communicating externally: the broadcast frame and the receiver's HashedId8 certificate cache. Allowed labels are the field names, HashedId8, generation_time, and the cadence annotation. Variation within VSG-REFERENCE-TABLE: this is the only member whose dominant object is a wire-format envelope paired with a repeating broadcast cadence strip.
- **Avoid:**
    - Do not depict the payload as encrypted — SecuredMessages are signed, confidentiality is a separate scheme
    - Do not show a full certificate in every frame — the application profile sets the digest cadence
    - Do not draw the broadcast sequence as a session or handshake
    - Do not conflate generation_time with expiry_time, which most profiles omit
- **Alt text:** ETSI ITS-G5 secured-message envelope showing how signed V2X frames alternate between a certificate digest and a full inline certificate.
- **Export filename:** `ambisecure-references-etsi-ts-103-097-1200x630.png`
- **Visual similarity group:** VSG-REFERENCE-TABLE
- **Currently uses:** references.png
- **Notes:** Prose reference (~7.3k chars), no AS_REF table on the page. Shares HashedId8 vocabulary with rec 80 — keep the envelope-plus-cadence angle exclusive to this page and the size comparison exclusive to 1609.2.

## 082 — ETSI TS 102 941 V2X Trust & Privacy Management Reference

- **Record number:** 82
- **Page name:** ETSI TS 102 941 Trust & Privacy Management
- **Canonical URL:** https://ambisecure.ambimat.com/references/etsi-ts-102-941/
- **Section:** Resource
- **Page type:** ARCHITECTURE GUIDE
- **Primary topic:** V2X | **Secondary:** PKI; Certificate lifecycle; Device identity
- **Design priority:** P1
- **Approved headline:** No Authority Can Link a Vehicle
- **Alternative headline:** How EA and AA Split V2X Trust
- **Category label:** REFERENCE
- **Core message:** The ETSI TS 102 941 trust model splits enrolment from authorisation so that no single authority can link a signed V2X message back to a specific vehicle.
- **Audience:** Device-security architect
- **Diagram type:** TRUST CHAIN
- **Visual concept:** Dominant object: the ETSI ITS PKI hierarchy drawn with one deliberate vertical partition wall running down its middle, separating identity from authorisation. Five nodes only: Root CA at the top signing both authorities, Trust List Manager distributing the CTL, Enrolment Authority on the identity side, Authorisation Authority on the authorisation side, and the ITS Station at the base; the flows are enrolment (ITS-S presents a manufacturer-attested key, receives a long-lived Enrolment Credential) and authorisation (ITS-S sends a caterpillar public key plus seed, receives a batch of short-lived Pseudonymous Certificates). Inside hardware: the EC and the caterpillar private key never leave the ITS-S secure element, and each PC's private half is re-derived on-card from the seed; communicating externally: enrolment and authorisation requests, plus CRL and CTL distribution. Allowed labels are the entity names and EC, PC, CTL, CRL — plus the partition annotation 'EA sees identity, never messages / AA signs PCs, never sees the EC'. Variation within VSG-REFERENCE-TABLE: this is the only member organised around a privacy partition wall rather than a structure, envelope, or comparison.
- **Avoid:**
    - Do not place the manufacturer inside the operational PKI — it is the out-of-band bootstrap trust anchor only
    - Do not show the AA learning which EC requested a PC batch
    - Do not show the caterpillar private key or seed-derived private keys travelling to the AA
    - Do not conflate the CTL (who is trusted) with the CRL (what is revoked)
    - Do not draw the EA receiving signed V2X messages
- **Alt text:** V2X PKI hierarchy showing the enrolment and authorisation split that stops any single authority linking a signed message to a vehicle.
- **Export filename:** `ambisecure-references-etsi-ts-102-941-1200x630.png`
- **Visual similarity group:** VSG-REFERENCE-TABLE
- **Currently uses:** references.png
- **Notes:** Prose architecture reference (~7.4k chars), not a table page. VSG-PKI-LIFECYCLE arguably fits this page better than VSG-REFERENCE-TABLE; kept in the batch-assigned group per instruction — flag for human review. Strongest LinkedIn candidate in the batch (the privacy-partition story travels well).

## 083 — ISO 21177 ITS Station Security Services Reference

- **Record number:** 83
- **Page name:** ISO 21177 ITS Station Security Services
- **Canonical URL:** https://ambisecure.ambimat.com/references/iso-21177/
- **Section:** Resource
- **Page type:** PROTOCOL REFERENCE
- **Primary topic:** V2X | **Secondary:** Connected mobility; Device identity; Secure Elements
- **Design priority:** P3
- **Approved headline:** ITS Sessions, Not Broadcast Messages
- **Alternative headline:** 1609.2 Certificates at the Session Layer
- **Category label:** REFERENCE
- **Core message:** ISO 21177 is the session layer above 1609.2 and 102 941 — mutual authentication for unicast ITS sessions, which is a different problem from broadcast V2X messages.
- **Audience:** Automotive-security engineer
- **Diagram type:** IDENTITY FLOW
- **Visual concept:** Dominant object: two ITS stations facing each other across a four-rung unicast handshake ladder — the deliberate contrast being that this is a two-party session, not a one-to-many broadcast. Four nodes, one per rung: initiator hello (1609.2 certificate or cached digest, ephemeral key contribution, nonce, cipher-suite selection), responder hello with its certificate and a signature over the exchange transcript, initiator transcript signature, and the confirmed session. Inside hardware: the ephemeral ECDH contributions and the derived session keys, held in the secure element and wiped on termination; communicating externally: certificates, nonces, and transcript signatures only. Allowed labels are the four step names plus 'EC, not PC', 'transcript signature', and 'SAP'. Variation within VSG-REFERENCE-TABLE: this is the only member drawn as a two-party handshake ladder with a temporal top-to-bottom read, against the static structures used by every other member.
- **Avoid:**
    - Do not depict CAMs or DENMs — ISO 21177 covers unicast sessions, not broadcast messages
    - Do not show Pseudonymous Certificates authenticating a session — sessions typically use the long-lived EC
    - Do not imply confidentiality is always on, it is optional and selected at establishment
    - Do not show session keys persisting after termination
- **Alt text:** Mutual-authentication handshake between two ITS stations, deriving session keys inside an AmbiSecure secure element from 1609.2 certificates.
- **Export filename:** `ambisecure-references-iso-21177-1200x630.png`
- **Visual similarity group:** VSG-REFERENCE-TABLE
- **Currently uses:** references.png
- **Notes:** Prose reference (~6.1k chars), no table. Narrowest page in the batch and the clearest consolidation candidate — the session-layer material could fold into the 102 941 or 103 097 reference if the library is trimmed.

## 084 — GSMA SGP.32 IoT eSIM Reference
- **Record number:** 84
- **Page name:** GSMA SGP.32 IoT eSIM Reference
- **Canonical URL:** https://ambisecure.ambimat.com/references/sgp-32/
- **Section:** Resource
- **Page type:** ARCHITECTURE GUIDE
- **Primary topic:** SIM/eSIM | **Secondary:** IoT security; Device identity; Provisioning
- **Design priority:** P2
- **Approved headline:** eSIM Provisioning Without a Screen
- **Alternative headline:** SGP.32 Pulls Profiles by Device Identity
- **Category label:** REFERENCE
- **Core message:** GSMA SGP.32 provisions eSIM profiles to headless IoT devices that have no screen and no user to scan a QR code, pulling profiles autonomously on device identity and policy.
- **Audience:** Connected-product OEM
- **Diagram type:** SYSTEM ARCHITECTURE
- **Visual concept:** Dominant object: a headless IoT endpoint — explicitly no screen, no keypad — with the eUICC drawn as the anchor at its centre and the SGP.32 entities arranged around it. Five nodes: eUICC, IPA (the host-side IoT Profile Assistant driving the exchange a consumer UI would otherwise drive), eIM for fleet-level profile policy, SM-DP+ holding and encrypting the Bound Profile Package, and SM-DS indexing which SM-DP+ has a profile waiting; the flow runs discovery (IPA queries SM-DS by eUICC identity) to mutual authentication (eUICC certificate signed by the EUM, SM-DP+ certificate signed by the GSMA CI Root CA) to BPP delivery and install. Inside hardware: the eUICC private key and the decrypted profile, neither of which crosses the eUICC boundary; communicating externally: the discovery query, the TLS session to SM-DP+, and the encrypted BPP in transit. Allowed labels are the entity names, BPP, EUM, and an annotation such as 'no QR, no user'. Variation within VSG-REFERENCE-TABLE: the only member centred on a physical headless device with a surrounding entity ring, and the only non-V2X, non-certificate-format page in the group.
- **Avoid:**
    - Do not show a QR code or activation code — that is the SGP.22 consumer flow, which SGP.32 exists to avoid
    - Do not conflate eSIM with the eUICC silicon that hosts it
    - Do not show two profiles enabled at once — only one may be active
    - Do not show the eUICC private key or the decrypted BPP leaving the eUICC boundary
    - Do not imply the eIM is mandatory — it is an optional management entity
- **Alt text:** GSMA SGP.32 entities delivering an encrypted eSIM profile to a headless IoT device's eUICC without any user-driven activation step.
- **Export filename:** `ambisecure-references-sgp-32-1200x630.png`
- **Visual similarity group:** VSG-REFERENCE-TABLE
- **Currently uses:** references.png
- **Notes:** Prose reference (~7.1k chars), no table; the only non-V2X page in the batch. VSG-SIM-ESIM arguably fits better than VSG-REFERENCE-TABLE; kept in the batch-assigned group per instruction — flag for human review. Page ties to the SIMAuth sister site and the IoT Security Co-Processor; the CC EAL6+ note is the eUICC silicon norm, not an AmbiSecure certification claim.

## 085 — CMAC Length Calculator

- **Record number:** 85
- **Page name:** CMAC Length Calculator
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/cmac-length/
- **Section:** Resource
- **Page type:** CALCULATOR
- **Primary topic:** Embedded security | **Secondary:** Secure Elements; Smart cards; Transit security
- **Design priority:** P3
- **Approved headline:** Padding decides which CMAC subkey
- **Alternative headline:** CMAC blocks, padding and truncation
- **Category label:** TOOL
- **Core message:** Compute CMAC block count, padded length and output truncation for AES or TDES, so SCP03, DESFire and EMV CDA implementers can size their MAC operations correctly.
- **Audience:** Embedded engineer
- **Diagram type:** TECHNICAL WORKBENCH
- **Visual concept:** Dominant object: a horizontal message-length bar chopped into equal cipher blocks, with the final block drawn two ways — full versus padded — as the pivot of the whole image. Flow: input length and cipher choice determine block count, final-block treatment, subkey selection and output size. Five major nodes maximum: input length in bytes; block size (16 for AES-128/192/256, 8 for TDES); the final-block fork where a full last block selects subkey K1 and a padded one (0x80 followed by 0x00 bytes) selects K2; the resulting CMAC block count; and the output strip showing the native block-size output truncated to a shorter tag (commonly 16 down to 8 bytes). Inside hardware: nothing — no keys are entered or held; the real CMAC key would live in an HSM or secure element, out of frame. External: nothing leaves the browser; this is local arithmetic. Labels allowed: 'NIST SP 800-38B', 'K1 / K2', '0x80 00 ...', 'AES-128 / TDES', 'truncate to 8'. Must not imply the tool computes an actual MAC value. Variation within VSG-CRYPTO-CALC: a flat length/block arithmetic bar with no cards, no SAM and no key topology — the opposite of the key-diversification architecture (rec 54).
- **Avoid:**
    - Do not show a computed MAC or tag value — the tool computes block counts, padded length and output size, never the MAC itself
    - Do not draw AES with an 8-byte block — AES is 16 bytes, TDES is 8
    - Do not show key material being entered or stored — the tool takes a length and a cipher only
    - Do not swap the subkeys — K1 applies to a full final block, K2 to a padded one
    - Do not present truncation as a weakness — 8-byte truncation is a standard deployment choice
- **Alt text:** A message length bar split into cipher blocks with a padded tail, showing how CMAC picks subkey K1 or K2 and how implementers truncate the output.
- **Export filename:** `ambisecure-resources-tools-cmac-length-1200x630.png`
- **Visual similarity group:** VSG-CRYPTO-CALC
- **Currently uses:** resources.png
- **Notes:** Narrow utility — block arithmetic that most implementers do once. Low standalone sharing potential; earns its place mainly as a companion to the SCP03 and secure-messaging pages it links to. Possible consolidation candidate into a broader CMAC/secure-messaging explainer if the tool inventory is ever trimmed.

## 086 — DESFire File Settings Parser

- **Record number:** 86
- **Page name:** DESFire File Settings Parser
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/desfire-file-settings/
- **Section:** Resource
- **Page type:** PARSER
- **Primary topic:** Smart cards | **Secondary:** NFC; Transit security; APDU
- **Design priority:** P2
- **Approved headline:** Six DESFire File Types, One Response
- **Alternative headline:** Read GetFileSettings Byte by Byte
- **Category label:** TOOL
- **Core message:** Decodes a GetFileSettings response into file type, communication mode, access-rights word and the per-type fields that differ across the six DESFire file types.
- **Audience:** Smart-card engineer
- **Diagram type:** DATA PARSER
- **Visual concept:** Dominant object: a horizontal GetFileSettings response frame that branches on its first byte — unlike the single-word ruler of the access-rights decoder, the subject here is a whole response fanning into type-dependent tails. Flow: fileType byte selects one of the tails, then commSettings and the 16-bit access-rights word are read the same way regardless of branch. Exactly five labelled nodes: fileType, commSettings (plain / MACed / enciphered), access-rights word (drawn as a compact hand-off token to the sister decoder rather than re-expanded), the per-type payload (file size, or value limits, or record size and count), and a Transaction MAC tail tagged EV2/EV3 only. The frame sits inside a browser boundary — pasted hex stays local, no reader or backend appears. Allowed labels: GetFileSettings, Standard, Backup, Value, Linear Record, Cyclic Record, Transaction MAC, 0xE, 0xF. Must not imply the tool reads the file contents themselves.
- **Avoid:**
    - Do not show a Transaction MAC file on EV1 — TMAC exists only on EV2/EV3
    - Do not conflate comms settings (plain / MACed / enciphered) with access rights — they are separate fields
    - Do not show a seventh file type — DESFire defines exactly six
    - Do not depict a live card or reader session — the tool parses pasted hex entirely in the browser
    - Do not show file data or key material — GetFileSettings returns metadata only
- **Alt text:** GetFileSettings response branching by DESFire file type in AmbiSecure's parser, revealing comms mode and the access rights guarding each file.
- **Export filename:** `ambisecure-resources-tools-desfire-file-settings-1200x630.png`
- **Visual similarity group:** VSG-BYTE-PARSER
- **Currently uses:** resources.png
- **Notes:** Widest-scope tool of the DESFire decoder cluster and the natural hub page for it.

## 087 — DESFire Key Settings Interpreter

- **Record number:** 87
- **Page name:** DESFire Key Settings Interpreter
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/desfire-key-settings/
- **Section:** Resource
- **Page type:** PARSER
- **Primary topic:** Smart cards | **Secondary:** Personalization; NFC; Transit security
- **Design priority:** P3
- **Approved headline:** Two Bytes Decide Who Can Rekey
- **Alternative headline:** Read Key Settings Before You Personalize
- **Category label:** TOOL
- **Core message:** Interprets the two-byte GetKeySettings response so engineers can see who may change keys, whether configuration is frozen, and which crypto the application runs.
- **Audience:** Smart-card engineer
- **Diagram type:** DATA PARSER
- **Visual concept:** Dominant object: just two magnified hex bytes with a bit-flag ladder dropping from the first — the distinguishing subject in this parser family, where the sisters show a nibble ruler and a branching frame. Flow: byte 1 (keySettings) rungs down into privilege flags; byte 2 splits into a crypto-type field and a key-count field. Exactly five labelled nodes: ChangeKey privilege (which key number may change keys), configuration-changeable flag (the freeze), application-master-key-changeable flag, crypto type (DES / 3DES / AES-128), and numKeys shown on a 0–14 scale. Everything sits inside a browser boundary — the pasted two bytes stay local, and no card, SAM or personalization bureau link is drawn. Allowed labels: GetKeySettings, keySettings, numKeys, DES, 3DES, AES-128, 0–14. Must not imply the tool can write or alter key settings.
- **Avoid:**
    - Do not show more than 14 application keys — numKeys spans 0 to 14
    - Do not display key values or key material — GetKeySettings returns settings, not keys
    - Do not imply the tool changes settings or rolls the master key — it only interprets a pasted response
    - Do not present AES-128 as the only crypto type — DES and 3DES are also encoded in that field
- **Alt text:** Two-byte GetKeySettings response expanded into ChangeKey privilege, config lock, crypto type and key count by AmbiSecure's client-side interpreter.
- **Export filename:** `ambisecure-resources-tools-desfire-key-settings-1200x630.png`
- **Visual similarity group:** VSG-BYTE-PARSER
- **Currently uses:** resources.png
- **Notes:** Thinnest page in the DESFire cluster (~650 chars) with the narrowest audience; worth enriching the body before treating it as a standalone share target.

## 088 — Transaction MAC Field Visualizer

- **Record number:** 88
- **Page name:** Transaction MAC Field Visualizer
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/tmac-visualizer/
- **Section:** Resource
- **Page type:** PARSER
- **Primary topic:** Transit security | **Secondary:** NFC; Smart cards; Embedded security
- **Design priority:** P2
- **Approved headline:** Inside the DESFire Transaction MAC field
- **Alternative headline:** TMC counter, TMV value, twelve bytes
- **Category label:** TOOL
- **Core message:** Split a DESFire EV2/EV3 Transaction MAC field into its TMC counter and TMV MAC value so ticketing implementers can read what the backend reconciles after each commit.
- **Audience:** Transit-system architect
- **Diagram type:** DATA PARSER
- **Visual concept:** Dominant object: a single 12-byte hex ribbon cleaved at one fixed offset into TMC(4) and TMV(8), with the split itself as the visual event. Flow: a fixed-layout field divides into a counter and a MAC, each read differently. Five major nodes maximum: the TMC 4 bytes with its little-endian integer readout beside it; the TMV 8 bytes marked as a CMAC truncated to 8; the CommitTransaction event that increments TMC and produces a fresh TMV; the backend holding its own expected counter for reconciliation; and an optional trailing-bytes tail for PICC configurations that append padding or vendor extensions. Inside hardware: the per-application TMAC key stays on the PICC and in the backend SAM — the card computes the CMAC itself; no key appears in the ribbon. External: only the TMC and TMV bytes are read out of the file. Labels allowed: 'TMC(4)', 'TMV(8)', 'LE', 'CommitTransaction', 'DESFire EV2/EV3'. Must not imply the tool verifies the MAC or blocks fraud — the backend does reconciliation, offline and elsewhere. Variation within VSG-BYTE-PARSER: a fixed-offset two-field split of one flat field with an integer readout — no tree, no bit cells, no frame variants.
- **Avoid:**
    - Do not show the tool verifying or recomputing the TMV CMAC — it splits and labels fields only
    - Do not show the TMAC key on the wire or in the browser — it stays on the PICC and in the backend SAM
    - Do not read TMC as big-endian — it is a 4-byte little-endian counter
    - Do not present the visualizer as a fraud-detection or replay-blocking system — replay detection happens when a backend reconciles counters
    - Do not imply the tool talks to a card or reader
- **Alt text:** The DESFire EV2 Transaction MAC field split into its 4-byte TMC counter and 8-byte TMV, the pair a transit backend reconciles after every commit.
- **Export filename:** `ambisecure-resources-tools-tmac-visualizer-1200x630.png`
- **Visual similarity group:** VSG-BYTE-PARSER
- **Currently uses:** resources.png
- **Notes:** Strong fit with AmbiSecure's transit and closed-loop ticketing narrative. Sits in a DESFire tool cluster (status decoder, file settings, key settings, access rights) — those share a family and need node-set separation from each other.

## 089 — ISO/IEC 14443 Frame Explorer

- **Record number:** 89
- **Page name:** ISO/IEC 14443 Frame Explorer
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/iso14443-frame/
- **Section:** Resource
- **Page type:** PARSER
- **Primary topic:** NFC | **Secondary:** Smart cards; Transit security; Hardware security keys
- **Design priority:** P2
- **Approved headline:** Read a contactless frame byte by byte
- **Alternative headline:** ATQA, SAK, PCB — decoded locally
- **Category label:** TOOL
- **Core message:** Decode pasted ISO/IEC 14443-3 and 14443-4 frame bytes — REQA, WUPA, ATQA, SAK, RATS and I/R/S blocks — into their field meanings, locally in the browser.
- **Audience:** Smart-card engineer
- **Diagram type:** DATA PARSER
- **Visual concept:** Dominant object: a vertical rail of selectable frame types, one highlighted and expanded into its decoded fields — the frame-type choice is the organising idea. Flow: pick a frame type, paste its bytes, read the field meanings. Five major nodes maximum: REQA (0x26) / WUPA (0x52) as single-byte probes; ATQA (2 bytes, decoding UID size — single 4, double 7, triple 10 — plus the bit-frame anticollision bits); SAK (1 byte, where bit 0x20 signals ISO/IEC 14443-4 / T=CL support); RATS (0xE0 plus parameter); and a PCB byte classified as I-block, R-block or S-block. Inside hardware: nothing computed — the UID and SAK a real PICC would emit come from its chip, which is out of frame. External: nothing leaves the browser — bytes are pasted by hand and decoded locally; no antenna, no reader, no capture. Labels allowed: 'REQA 26', 'WUPA 52', 'ATQA', 'SAK 0x20', 'RATS E0', 'PCB', 'I / R / S'. Must not imply live RF interception. Variation within VSG-BYTE-PARSER: a multi-variant frame rail where the dominant object is a set of alternative frame layouts, unlike the single-object concepts in rec 51, 88 and 90.
- **Avoid:**
    - Do not depict an RF sniffer, antenna or over-the-air capture — bytes are pasted by hand and the tool never touches a card
    - Do not imply the tool reads, clones or emulates a card UID
    - Do not show SAK bit 0x20 meaning anything other than ISO/IEC 14443-4 (T=CL) support
    - Do not mix the 14443-3 anti-collision frames with the 14443-4 I/R/S blocks — they are different layers
    - Do not present the decoder as a security or conformance test
- **Alt text:** Contactless frames from ISO/IEC 14443 laid out byte by byte — ATQA, SAK, RATS and PCB blocks — decoded locally by an AmbiSecure engineering tool.
- **Export filename:** `ambisecure-resources-tools-iso14443-frame-1200x630.png`
- **Visual similarity group:** VSG-BYTE-PARSER
- **Currently uses:** resources.png
- **Notes:** Pairs with rec 35 (the static 14443 reference) and with the ATS parser / UID analyzer. The 'no bytes leave your browser' point matters here more than most — a contactless frame decoder is easily mistaken for a sniffer, so the avoid_list is doing real work.

## 090 — Secure Messaging Field Visualizer

- **Record number:** 90
- **Page name:** Secure Messaging Field Visualizer
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/secure-messaging-viz/
- **Section:** Resource
- **Page type:** PARSER
- **Primary topic:** APDU | **Secondary:** BER-TLV; Smart cards; Secure Elements
- **Design priority:** P2
- **Approved headline:** What secure messaging wraps around an APDU
- **Alternative headline:** DOs 87, 97, 99 and 8E explained
- **Category label:** TOOL
- **Core message:** Walk the BER-TLV data objects inside a secure-messaging-wrapped APDU body — cryptogram, expected length, status and checksum — as defined by ISO/IEC 7816-4 §6.
- **Audience:** Smart-card engineer
- **Diagram type:** DATA PARSER
- **Visual concept:** Dominant object: one SM-wrapped APDU drawn end to end — a compact header (CLA INS P1 P2) with the CLA's SM bits flagged, opening into a left-to-right chain of BER-TLV data objects in the body. Flow: the CLA declares SM is in effect, and the body's DO chain carries the protected payload in order, checksum last. Five major nodes maximum: the CLA with bits b3..b2 confirming SM; DO 87 (padding-indicator plus cryptogram); DO 97 (Le, the expected response length); DO 99 (processing status, SW1 SW2); and DO 8E (cryptographic checksum — the MAC computed over the preceding objects). Inside hardware: the session keys that produced the cryptogram and the checksum stay in the card and the host security module — neither appears in the browser or the image. External: only the wrapped body bytes travel to the card; the tool itself decodes locally and sends nothing. Labels allowed: 'ISO/IEC 7816-4 §6', '87', '97', '99', '8E', 'CLA 0C'. Must not imply the tool decrypts or verifies anything. Variation within VSG-BYTE-PARSER: a linear ordered chain of TLV data objects inside an APDU envelope, distinct from the CBOR nesting tree (rec 41) and the fixed-offset field split (rec 88).
- **Avoid:**
    - Do not show the tool decrypting DO 87 or verifying the DO 8E MAC — it walks and labels the data-object chain only
    - Do not show session keys or plaintext payloads in the browser
    - Do not place DO 8E before the data objects — the checksum comes last, over what precedes it
    - Do not confuse DO 87 (with padding indicator) with the legacy proprietary DO 84
    - Do not imply that secure messaging alone authenticates the header — that depends on which CLA SM bits are set
- **Alt text:** An SM-wrapped APDU body opened into its BER-TLV data objects, showing where the cryptogram, expected length, status and MAC sit under ISO 7816-4.
- **Export filename:** `ambisecure-resources-tools-secure-messaging-viz-1200x630.png`
- **Visual similarity group:** VSG-BYTE-PARSER
- **Currently uses:** resources.png
- **Notes:** Natural companion to rec 51 (CLA decoder) and rec 55 (SCP03 walkthrough) — the three form a secure-messaging arc. No consolidation concern; each occupies a distinct layer.

## 091 — APDU Script Validator

- **Record number:** 91
- **Page name:** APDU Script Validator
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/apdu-script-validator/
- **Section:** Resource
- **Page type:** ENGINEERING TOOL
- **Primary topic:** APDU | **Secondary:** Smart cards; JavaCard
- **Design priority:** P2
- **Approved headline:** Check every APDU before you send it
- **Alternative headline:** Case 1 to 4, line by line
- **Category label:** TOOL
- **Core message:** Check a multi-line APDU script line by line against the ISO/IEC 7816-4 case 1-4 structure, short and extended length, without executing a single command.
- **Audience:** JavaCard developer
- **Diagram type:** TECHNICAL WORKBENCH
- **Visual concept:** Dominant object: a multi-line script listing — several APDUs stacked as text lines, each with a small per-line verdict badge in the gutter, one line showing a structural error. The listing, not a byte ribbon, is the hero. Flow: each line is measured against the four case shapes and reported independently. Five major nodes maximum: a case 1 line (header only, 4 bytes); a case 2 line (Le only); a case 3 line (Lc plus data); a case 4 line (Lc, data, Le); and one extended-length line where a leading 0x00 in the body signals extended encoding. Inside hardware: nothing — no card, no applet, no execution anywhere in the frame. External: nothing — validation is local and shape-only; no reader, no connection, no response. Labels allowed: 'CLA INS P1 P2', 'case 1..4', 'Lc / Le', '00 = extended', '# comment'. Must not imply execution, a card connection, or any security verdict — the page states plainly that it never executes APDUs. Distinct from the byte-parser family: the dominant object is a line-oriented script with gutter verdicts, not a decoded byte structure.
- **Avoid:**
    - Do not show APDUs being sent to a card or reader — the validator never executes anything
    - Do not present a pass verdict as a security or functional guarantee — it checks structure only, not whether the card would accept the command
    - Do not show status words such as 9000 or 6A82 in the results — nothing responds, because nothing is sent
    - Do not misdraw extended length — extended encoding is signalled by a leading 0x00 in the body, not by a longer header
    - Do not depict it as a scripting engine, terminal emulator or test harness
- **Alt text:** A multi-line APDU script checked line by line for ISO 7816-4 case shape, with no card, no reader and no execution behind the AmbiSecure verdicts.
- **Export filename:** `ambisecure-resources-tools-apdu-script-validator-1200x630.png`
- **Visual similarity group:** VSG-SCRIPT-LINTER
- **Currently uses:** resources.png
- **Notes:** New VSG coined deliberately: this is not a decode-only parser, so forcing it into VSG-BYTE-PARSER would misrepresent it and crowd an already five-member group. Its dominant object is a line-oriented listing with verdicts. Note the naming risk — 'Validator' invites a security reading, but the page is a shape-only linter; the image must not suggest otherwise. Adjacent to /resources/tools/apdu-parser/ (single-shot decode); the split is defensible and not a consolidation candidate.

## 092 — JavaCard CAP Structure Explorer

- **Record number:** 92
- **Page name:** JavaCard CAP Structure Explorer
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/javacard-cap/
- **Section:** Resource
- **Page type:** PARSER
- **Primary topic:** JavaCard | **Secondary:** Secure Elements;Smart cards
- **Design priority:** P2
- **Approved headline:** Inside a JavaCard CAP File
- **Alternative headline:** Header.cap Starts With 0xDECAFFED
- **Category label:** TOOL
- **Core message:** Paste any CAP component's bytes and see exactly which of the twelve JCVM 3.x components it is and what its header fields mean, decoded entirely in your browser.
- **Audience:** JavaCard developer
- **Diagram type:** DATA PARSER
- **Visual concept:** Dominant object: a vertical ordered ladder of the twelve CAP components, tags 0x01 Header through 0x0C Debug, with mandatory ones weighted and Applet/Export/Debug visibly lighter as optional. Flow: a pasted hex strip enters at the tag byte, the tag selects one rung of the ladder, and that rung expands into decoded field rows. Max five nodes: (1) input hex strip 01 00 14 DE CA FF ED 00 03 06 08 A0 ..., (2) the Header.cap rung, (3) magic 0xDECAFFED, (4) version 3.0 plus flags ACC_INT / ACC_EXPORT / ACC_APPLET, (5) package AID A0:00:00:00:62:03:01:0C:01. No hardware is in the picture at all: a CAP is an offline load file and nothing is inside a card here; nothing communicates externally either, since decoding is browser-local. Labels allowed: component names with their tag bytes, 0xDECAFFED, ACC_* flag names, the package AID. Must not imply loading, installing, or verifying the applet. Varies from other VSG-BYTE-PARSER pages by using an ordered twelve-rung component ladder as the dominant object rather than a nested tree, and by naming CAP-only fields.
- **Avoid:**
    - Do not show a card reader, a GlobalPlatform INSTALL/LOAD flow, or bytes travelling to a card — the explorer decodes an offline CAP component only
    - Do not present it as a JavaCard bytecode verifier or an applet installer
    - Do not label the magic as anything other than 0xDECAFFED
    - Do not draw Applet.cap, Export.cap or Debug.cap as mandatory — those three are optional
- **Alt text:** Ladder of the twelve JavaCard CAP components with Header.cap expanded to its 0xDECAFFED magic and package AID, decoded locally in AmbiSecure's browser tool.
- **Export filename:** `ambisecure-resources-tools-javacard-cap-1200x630.png`
- **Visual similarity group:** VSG-BYTE-PARSER
- **Currently uses:** resources.png
- **Notes:** Narrow but tightly tied to the JavaCard applets product line. Body is thin (465 chars) relative to the tool's depth; the component table is the real substance.

## 093 — FIDO Metadata Explorer

- **Record number:** 93
- **Page name:** FIDO Metadata Explorer
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/fido-mds-explorer/
- **Section:** Resource
- **Page type:** REFERENCE DATABASE
- **Primary topic:** FIDO2 | **Secondary:** Attestation; Hardware security keys; Enterprise access
- **Design priority:** P2
- **Approved headline:** Enforce AAGUID policy at registration
- **Alternative headline:** Fetch and verify the signed MDS BLOB
- **Category label:** REFERENCE
- **Core message:** Browse AAGUID-keyed authenticator metadata by vendor, model and transport, with the signed FIDO MDS BLOB named as the source production relying parties must fetch and verify.
- **Audience:** IAM leader
- **Diagram type:** SYSTEM ARCHITECTURE
- **Visual concept:** Dominant object: the JWS-signed MDS BLOB feeding an RP policy gate. Five nodes: mds.fidoalliance.org publishing the JWS-signed BLOB; the RP's daily fetch-and-verify step; an AAGUID allow-list gate at registration time; a vendor-grouped grid of metadata cards showing model plus USB/NFC transports; and one authenticator admitted while another is refused at the gate. Nothing hardware-internal is shown — metadata describes make, model and transports, never keys or users. The only external step is the BLOB fetch, and it belongs to the relying party, not to this page, which renders a curated offline subset. Labels allowed: AAGUID, vendor, model, USB, NFC, JWS. Within VSG-REFERENCE-TABLE this page owns the card wall plus signed-BLOB policy pipeline, versus the AAGUID lookup's single-value resolve.
- **Avoid:**
    - Do not show this page fetching the live MDS BLOB — it renders a curated offline subset
    - Do not present the offline card set as the complete list of certified authenticators
    - Do not badge synced platform credentials such as iCloud Keychain or Google Password Manager as BE=0
    - Do not imply MDS metadata contains user or key data, it describes make, model and transports
    - Do not imply AmbiSecure entries carry certified production AAGUIDs
- **Alt text:** AmbiSecure FIDO metadata explorer grouping authenticator cards by vendor and AAGUID, showing how a signed MDS BLOB drives allow-list policy at registration.
- **Export filename:** `ambisecure-resources-tools-fido-mds-explorer-1200x630.png`
- **Visual similarity group:** VSG-REFERENCE-TABLE
- **Currently uses:** resources.png
- **Notes:** Content bug for human review: fido-mds-explorer.js badges every card BE=0 unconditionally, but the dictionary includes synced platform credentials (Apple iCloud Keychain, Google Password Manager) which are BE=1 — the page currently mislabels syncable passkeys as device-bound. Also shares the same AmbiSecureAAGUID.entries() dataset as AAGUID Lookup (rec 43); consolidation candidate.

## 094 — Passkey Flow Visualizer

- **Record number:** 94
- **Page name:** Passkey Flow Visualizer
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/passkey-flow-viz/
- **Section:** Resource
- **Page type:** TECHNICAL EXPLAINER
- **Primary topic:** Passkeys | **Secondary:** WebAuthn; FIDO2; Phishing-resistant authentication
- **Design priority:** P1
- **Approved headline:** Two ceremonies: create() and get()
- **Alternative headline:** Origin binding kills the phishing class
- **Category label:** SECURITY EXPLAINER
- **Core message:** Walk both WebAuthn ceremonies step by step, create() and get(), showing where every byte the companion decoders parse actually comes from.
- **Audience:** Security architect
- **Diagram type:** PROTOCOL FLOW
- **Visual concept:** Dominant object: a three-lane, time-ordered sequence across RP, browser and authenticator. Five nodes: the RP issuing PublicKeyCredentialCreationOptions with a fresh challenge and rpId; the browser building clientDataJSON and stamping the true origin; the authenticator generating a fresh keypair and signing authData || SHA-256(clientDataJSON); the returned PublicKeyCredential carrying attestationObject and clientDataJSON; and RP verification persisting credentialId, publicKey and signCount. What stays inside hardware: the private key, generated inside the authenticator behind a sealed boundary it never crosses. What communicates externally: only the public COSE_Key, credentialId, authenticatorData and signature. Labels allowed: create(), get(), challenge, origin, signature, ES256. Within VSG-FIDO-CEREMONY this is the only member with actor lanes and message ordering; siblings show a static JSON object and a domain hierarchy.
- **Avoid:**
    - Do not draw the private key crossing the authenticator boundary — only the public key, credentialId and signature leave
    - Do not depict this as a live ceremony runner, it is an annotated walkthrough
    - Do not show a hardware key as the only authenticator — passkeys may be synced platform credentials
    - Do not show the browser issuing the challenge, the relying party issues it
    - Do not merge create() and get() into one flow, they are two distinct ceremonies
- **Alt text:** Three-lane WebAuthn ceremony walkthrough from AmbiSecure across relying party, browser and authenticator, with the private key sealed inside the authenticator.
- **Export filename:** `ambisecure-resources-tools-passkey-flow-viz-1200x630.png`
- **Visual similarity group:** VSG-FIDO-CEREMONY
- **Currently uses:** resources.png
- **Notes:** Page lives under /resources/tools/ but is explicitly annotation-only ('does not run live ceremonies'), so typed as an explainer rather than a tool.

## 095 — TLV Tree Visualizer

- **Record number:** 95
- **Page name:** TLV Tree Visualizer
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/tlv-tree-viz/
- **Section:** Resource
- **Page type:** PARSER
- **Primary topic:** BER-TLV | **Secondary:** Smart cards;APDU
- **Design priority:** P2
- **Approved headline:** BER-TLV as a Nested Tree
- **Alternative headline:** Expand Every EMV Constructed Tag
- **Category label:** TOOL
- **Core message:** Turns a flat run of BER-TLV bytes into a collapsible nested tree with EMV tag names attached, so nesting depth becomes visible instead of inferred.
- **Audience:** Smart-card engineer
- **Diagram type:** DATA PARSER
- **Visual concept:** Dominant object: an indented, collapsible node tree where constructed tags carry a cyan left rule and primitives a plain grey one — containment, not sequence, is the whole point. Flow: a flat hex line at the top splits into Tag / Length / Value triples, and each constructed value recurses one indent deeper. Max five nodes: (1) 6F FCI Template [L=26], (2) 84 DF Name carrying A0 00 00 00 04 10 10, (3) A5 FCI Proprietary Template, (4) 50 Application Label showing "MASTERCARD", (5) 87 Application Priority Indicator [L=1] 01. Nothing sits inside hardware — this is a byte view of a card response already captured; nothing communicates externally, as the walk runs locally. Labels allowed: the tag hex, L= lengths, and EMV tag names from the offline dictionary. Must not imply a live transaction. Varies from other VSG-BYTE-PARSER pages by making indentation depth and the constructed/primitive border distinction the dominant motif, keyed to EMV tag names.
- **Avoid:**
    - Do not show a POS terminal, a payment being authorised, or an approval tick — the tool only decodes bytes
    - Do not render primitive tags such as 50, 84 or 87 as expandable parents — only constructed tags like 6F, A5, 70 and 77 nest
    - Do not present it as an EMV compliance, cryptogram or security validator
    - Do not display a realistic PAN (tag 5A) or Track 2 data (tag 57) in the sample tree
- **Alt text:** Collapsible BER-TLV tree from AmbiSecure showing EMV FCI template 6F nesting DF Name 84 and proprietary template A5, decoded entirely in the browser.
- **Export filename:** `ambisecure-resources-tools-tlv-tree-viz-1200x630.png`
- **Visual similarity group:** VSG-BYTE-PARSER
- **Currently uses:** resources.png
- **Notes:** Consolidation candidate: explicitly the visual companion to the linear TLV parser. Keep separate only if the tree/linear split is deliberate; the featured image should lean on nesting to justify the split.

## 096 — ASN.1 Tree Explorer

- **Record number:** 96
- **Page name:** ASN.1 Tree Explorer
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/asn1-tree-explorer/
- **Section:** Resource
- **Page type:** PARSER
- **Primary topic:** PKI | **Secondary:** Attestation;Certificate lifecycle
- **Design priority:** P2
- **Approved headline:** Walk DER as a Tree
- **Alternative headline:** From PEM to Named OIDs
- **Category label:** TOOL
- **Core message:** Walks DER-encoded ASN.1 — or a pasted PEM block — into a collapsible tree that resolves OIDs to their canonical names and previews each node's bytes.
- **Audience:** PKI engineer
- **Diagram type:** DATA PARSER
- **Visual concept:** Dominant object: an OID resolution moment — a raw dotted arc turning into a human name beside its node. Flow: a PEM block sheds its dashed armour into DER bytes, the outer tag is read, and the tree opens with each node showing type, content length, and a decoded preview. Max five nodes: (1) the PEM/DER input block, (2) outer SEQUENCE (0x30) [19], (3) OBJECT IDENTIFIER 1.2.840.10045.2.1 resolving to id-ecPublicKey, (4) OBJECT IDENTIFIER 1.2.840.10045.3.1.7 resolving to prime256v1, (5) a per-node hex preview strip. Nothing is inside hardware here; nothing communicates externally, since the walk and OID lookup are in-browser with an offline dictionary. Labels allowed: type names (SEQUENCE, OBJECT IDENTIFIER, INTEGER), the two dotted OIDs and their names, byte counts. Must not imply any trust decision. Varies from other VSG-BYTE-PARSER pages by making dotted-OID-to-name resolution and PEM armour stripping the dominant motif, rather than EMV tag names or a component ladder.
- **Avoid:**
    - Do not show trust-chain validation, signature verification, or a 'certificate valid' badge — the explorer walks structure only
    - Do not depict PEM and DER as different structures — PEM is that same DER, base64-armoured
    - Do not render primitive nodes such as OBJECT IDENTIFIER, INTEGER or NULL with expandable children
    - Do not imply a pasted key or certificate is uploaded anywhere — parsing is in-browser
- **Alt text:** AmbiSecure ASN.1 explorer walking a DER SEQUENCE into named OIDs id-ecPublicKey and prime256v1, accepting PEM and decoding every node in-browser.
- **Export filename:** `ambisecure-resources-tools-asn1-tree-explorer-1200x630.png`
- **Visual similarity group:** VSG-BYTE-PARSER
- **Currently uses:** resources.png
- **Notes:** Consolidation candidate alongside the linear ASN.1 parser, same pattern as the TLV pair. Strong internal-link hub (X.509 viewer, attestation x5c).

## 097 — JSON Bin Builder and Validator
- **Record number:** 97
- **Page name:** JSON Bin Builder and Validator
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/json-bin-builder/
- **Section:** Resource
- **Page type:** ENGINEERING TOOL
- **Primary topic:** Other
- **Design priority:** P3
- **Approved headline:** A JSON bin with no server
- **Alternative headline:** localStorage is not a vault
- **Category label:** TOOL
- **Core message:** A JSON bin that validates, formats, minifies, and saves named bins in this browser's localStorage with no endpoint and no token URL — and says plainly that local storage is a convenience, not a vault.
- **Audience:** Security practitioner
- **Diagram type:** SYSTEM ARCHITECTURE
- **Visual concept:** Dominant object is a heavy browser-boundary frame that contains the entire system, with the absent server as the story. Inside: a JSON editor pane, a schema panel, and a shelf of named saved bins resting on a localStorage slab. Outside and greyed with a struck path: a hosted bin service emitting a token-bearing URL, annotated 'anyone with the link can read'. Five nodes maximum: editor, local schema check, bin shelf, localStorage slab, the crossed external service. Nothing crosses the frame in either direction — no upload, no fetch, no sync. Variation within VSG-JSON-WORKBENCH: the dominant object here is a containment architecture built around storage and a deliberately absent server, whereas rec 151 is a transform fan and rec 152 an error-locator. Allowed labels: localStorage, no endpoint, no token URL, READY. Must not imply the bins are secure or shareable.
- **Avoid:**
    - Do not show a public or fetchable bin URL — the reopen link only works in the same browser and fetches nothing
    - Do not draw an AmbiSecure API endpoint, upload arrow, or profile-sync path
    - Do not depict localStorage as a vault, safe, or encrypted store — extensions and shared machines can read it
    - Do not imply full JSON Schema support: this is a local subset and $ref is not resolved
- **Alt text:** Browser-boundary architecture for an AmbiSecure JSON bin: editor and localStorage shelf inside, hosted token-URL services struck out beyond the frame.
- **Export filename:** `ambisecure-resources-tools-json-bin-builder-1200x630.png`
- **Visual similarity group:** VSG-JSON-WORKBENCH
- **Currently uses:** resources.png
- **Notes:** Off-core topic for a hardware-security brand and overlapping the JSON formatter and validator; the three JSON tools are a consolidation candidate. Body says 'Draft-07 style' while rec 152 claims a draft 2020-12 subset — reconcile in copy.

# BLOG PAGES

## 098 — Common Misconceptions About 2FA (Archive 2021)

- **Record number:** 98
- **Page name:** Common Misconceptions about Two-Factor Authentication
- **Canonical URL:** https://ambisecure.ambimat.com/blog/archive/common-misconceptions-about-2fa/
- **Section:** Blog
- **Page type:** SECURITY ANALYSIS
- **Primary topic:** Phishing-resistant authentication | **Secondary:** Hardware security keys;FIDO2
- **Design priority:** P3
- **Approved headline:** Not All Second Factors Are Equal
- **Alternative headline:** What 2FA Actually Defends Against
- **Category label:** SECURITY EXPLAINER
- **Core message:** Two-factor authentication is not one thing — the myths collapse once you separate possession-only factors like SMS and push from origin-bound, hardware-rooted ones.
- **Audience:** IAM leader
- **Diagram type:** COMPARISON
- **Visual concept:** Dominant object: a factor-versus-attack grid — five second-factor rows tested against two attack columns (credential phishing via a real-time relay, and endpoint/SMS interception). The five rows are the only nodes: SMS OTP, authenticator-app TOTP, push approval, PIN-protected FIDO2 security key, on-card biometric. The relationship is a verdict per cell, not a narrative flow: the first three rows fail the relay column because the user can hand the code onward; the FIDO2 rows hold because the signature is bound to the origin, so a proxy site gets nothing it can replay. Nothing here is a hardware cutaway — the key appears as a flat row glyph and the private key is never drawn on the grid at all. Labels allowed: SMS OTP, TOTP, Push, FIDO2, origin-bound, relay. Must not imply that adding any second factor equals phishing resistance, nor that 2FA addresses endpoint malware.
- **Avoid:**
    - Do not label FIDO2 'phishing-proof' or 'the only phishing-proof factor' — the 2021 archive copy overstates this
    - PIV certificates are also phishing-resistant
    - Do not show authenticator-app TOTP as immune to real-time relay phishing — the code is still user-transcribable
    - Do not depict 2FA as blocking malware already resident on the endpoint
    - Do not show the AmbiSecure key needing a battery or network link — it requires neither
- **Alt text:** Common second factors tested against phishing and interception, showing why only origin-bound hardware authenticators survive a credential-relay attack.
- **Export filename:** `ambisecure-blog-archive-common-misconceptions-about-2fa-1200x630.png`
- **Visual similarity group:** VSG-COMPARISON-MATRIX
- **Currently uses:** blog-archive.png
- **Notes:** Held at P3: the page's own 2026 box says the misconception is largely resolved, and myths #3 and #5 (device count, cost) are dated consumer-2021 framing. Consolidation candidate with the modern 'Why use MFA' / 'Top 3 benefits of MFA' articles, which should carry the stronger image. The durable idea (factor differentiation) is what the visual should keep. Body corrected 2026-07-17: the 'phishing-proof' wording is gone from the page; the avoid-list entry still stands as guidance for the artwork. VSG-COMPARISON-MATRIX variation: factor-vs-attack verdict grid; rec 106 in the same group uses a two-column server-architecture contrast instead.

## 099 — Single Sign-On vs MFA (Archive 2021)

- **Record number:** 99
- **Page name:** Single Sign-On Vs. Multi-Factor Authentication
- **Canonical URL:** https://ambisecure.ambimat.com/blog/archive/single-sign-on-vs-mfa/
- **Section:** Blog
- **Page type:** COMPARISON
- **Primary topic:** Enterprise access | **Secondary:** Phishing-resistant authentication;Hardware security keys
- **Design priority:** P2
- **Approved headline:** SSO Carries Identity, MFA Carries Proof
- **Alternative headline:** Why SSO and MFA Are Not Rivals
- **Category label:** SECURITY EXPLAINER
- **Core message:** SSO and MFA are not alternatives — SSO carries identity across applications while MFA sets the strength of the authentication event, and enterprise programmes need both.
- **Audience:** IAM leader
- **Diagram type:** SYSTEM ARCHITECTURE
- **Visual concept:** Dominant object: a single enterprise login event drawn as one horizontal spine with two stacked planes rather than a left/right versus split — the point is that they operate at different layers, not that they compete. Upper plane (SSO): the identity provider issues one session assertion that fans out to three relying applications, so identity is asserted once and reused. Lower plane (MFA): at the spine's origin, an AmbiSecure OnePass authenticator answers the challenge that gates that single event. Five nodes only: user, AmbiSecure authenticator, identity provider, SSO session assertion, the app fan-out. Inside hardware: the private key and any biometric template, both drawn as sealed and unlabelled with no outbound line. Externally communicated: only the signed assertion and the OIDC/SAML session token. Labels allowed: SSO, MFA, IdP, session assertion, authentication event. Must not imply MFA is a competing path to SSO or that either is optional.
- **Avoid:**
    - Do not draw SSO and MFA as two branches of a fork or as a versus scoreboard — they sit on different planes of the same login
    - Do not repeat the MFA challenge at every application — it binds the authentication event, not each SSO handoff
    - Do not show the private key or biometric template travelling from the authenticator to the identity provider
    - Do not draw an SMS OTP as an equivalent-strength peer of the hardware authenticator in the factor slot
- **Alt text:** Two-plane view of an enterprise login: an SSO session carrying identity across apps while an AmbiSecure authenticator supplies the cryptographic proof beneath it.
- **Export filename:** `ambisecure-blog-archive-single-sign-on-vs-mfa-1200x630.png`
- **Visual similarity group:** VSG-ENTERPRISE-ACCESS
- **Currently uses:** blog-archive.png
- **Notes:** Promoted to P2: the SSO-vs-MFA confusion is genuinely durable and this page has no modern replacement CTA — only a 2026 reframe box, whose 'SSO carries identity; MFA carries proof' line is the strongest concept in the batch and drives the headline. Good LinkedIn value for IAM audiences. VSG-ENTERPRISE-ACCESS variation: two-plane login spine; rec 104 in the same group uses an attack-surface ring.

## 100 — MFA in Government Sector (Archive 2021)

- **Record number:** 100
- **Page name:** Multi-factor Authentication in Government Sector
- **Canonical URL:** https://ambisecure.ambimat.com/blog/archive/mfa-in-government/
- **Section:** Blog
- **Page type:** INDUSTRY ARTICLE
- **Primary topic:** Government identity | **Secondary:** Phishing-resistant authentication;Hardware security keys;PIV
- **Design priority:** P2
- **Approved headline:** Phishing-Resistant MFA for Public Agencies
- **Alternative headline:** Where Government MFA Changes the Threat Model
- **Category label:** SECURITY EXPLAINER
- **Core message:** Government agencies are prime credential-theft targets, and the MFA implementation choice decides whether the threat model actually changes or the deployment just adds friction.
- **Audience:** Government programme
- **Diagram type:** IDENTITY FLOW
- **Visual concept:** Dominant object: a generic government relying-party portal at the right, approached by two inbound authentication paths that pass through the same attacker-controlled phishing proxy in the middle — the page's own point that agencies face MFA-resistant phishing. Upper path: the employee reads an SMS OTP and types it into the proxy, which relays it onward and succeeds; the code is drawn as transcribable text. Lower path: an AmbiSecure FIDO2 authenticator (or PIV applet) signs a challenge scoped to the real portal origin, so the proxy's relay is rejected at the origin check and the path terminates at the proxy. Five nodes: government employee, phishing proxy, SMS OTP path, hardware authenticator path, agency portal. Inside hardware: the signing key, never drawn on a wire. Labels allowed: SMS OTP, FIDO2, PIV, origin check, relayed. Must not imply an agency deployment or endorsement.
- **Avoid:**
    - Do not show the FIDO2 credential being successfully relayed by the phishing proxy — origin binding is exactly what stops it
    - Do not use real government seals, flags, ministry crests or agency logos
    - Do not depict SMS OTP interception as requiring physical possession of the handset — relay and SIM re-issue need neither
    - Do not imply AmbiSecure holds FIPS 201, PIV or Common Criteria certification — this page claims none
- **Alt text:** A phishing proxy fronting a government portal, succeeding against a typed SMS code but failing against the origin-bound FIDO2 credential on an AmbiSecure authenticator.
- **Export filename:** `ambisecure-blog-archive-mfa-in-government-1200x630.png`
- **Visual similarity group:** VSG-GOV-IDENTITY
- **Currently uses:** blog-archive.png
- **Notes:** Promoted to P2: government identity is a live AmbiSecure industry surface and the phishing-resistance argument is durable — the 2026 box updates the mandate context (OMB M-22-09, NIST SP 800-63-4) rather than retiring the piece. New VSG-GOV-IDENTITY invented: no listed group covers non-ePassport government access; it is now the sole member of that group after rec 108 was retired from the site, so there is no in-group repetition risk. Correction 2026-07-17: an earlier draft of this note claimed the body asserts 'FIDO2 is the only phishing-proof factor' — it does not. The page correctly says OMB M-22-09 and NIST SP 800-63-4 made phishing-resistant MFA the federal baseline. No body change was needed or made.

## 101 — Cyber Attacks in India – Part 3 (Archive 2021)

- **Record number:** 101
- **Page name:** Cyber Attacks in India – Part 3
- **Canonical URL:** https://ambisecure.ambimat.com/blog/archive/cyber-attacks-in-india-part-3/
- **Section:** Blog
- **Page type:** SECURITY ANALYSIS
- **Primary topic:** Other | **Secondary:** Phishing-resistant authentication;Hardware security keys
- **Design priority:** P3
- **Approved headline:** Where Incident Response Broke Down
- **Alternative headline:** Static Secrets Do Not Age Well
- **Category label:** BLOG
- **Core message:** Part three closes the series on the systemic side of India's large consumer-data breaches — stale access secrets, and the lag between compromise, discovery and disclosure.
- **Audience:** Security practitioner
- **Diagram type:** LIFECYCLE
- **Visual concept:** Dominant object: a disclosure-lag timeline — five horizontal bars, each running from compromise to discovery to public notification, so the visible message is elapsed time rather than breach count. Five nodes, one per incident, labelled generically by sector not brand: payments processor (unrecycled access key), online grocery, edtech platform, healthcare records, local-search directory. A single annotation calls out the durable root the page names — a long-lived access key that was never rotated. Nothing is a hardware object in this frame; the AmbiSecure angle appears only as a closing caption strip on attested, rotatable credentials, not as a product inset. Series treatment: same bar-and-rule visual language as recs 102 and 103 but a different dominant object (lag bars, not ledgers or exposure rows). Labels allowed: compromise, discovered, disclosed, access key, and the series marker 'Part 3', which matches this page's H1. Must not imply the record counts are AmbiSecure findings.
- **Avoid:**
    - Do not imply a hardware authenticator would have prevented a server-side database dump — the page's incidents are data-at-rest exposures where authentication is one root cause among several
    - Do not use Juspay, BigBasket, Unacademy or JustDial logos, wordmarks or brand colours
    - Do not present the dark-web resale prices or record counts as verified AmbiSecure research — they are 2021 press reports
    - Do not render an unrecycled access key as a cracked password — it was a valid credential left live
- **Alt text:** Disclosure-lag bars across five Indian consumer-data breaches, tracing the incident-response and credential-hygiene gaps that closed this archive series.
- **Export filename:** `ambisecure-blog-archive-cyber-attacks-in-india-part-3-1200x630.png`
- **Visual similarity group:** VSG-THREAT-LANDSCAPE
- **Currently uses:** blog-archive.png
- **Notes:** SERIES: cyber-attacks-in-india parts 1-3 = recs 103, 102, 101. Strong consolidation candidate — three thin 2021 breach retrospectives that would serve better as one India threat retrospective; flagging for human decision before any image spend. P3: dated (2018-2021 incidents), no product differentiation, low sharing value. Part numbering: this page's H1 does say 'Part 3', so a 'Part 3' marker is safe here — but see rec 103, whose H1 carries no number. VSG-THREAT-LANDSCAPE variation: disclosure-lag timeline. Distinct from rec 102 (exposure rows), rec 103 (root-cause ledger), rec 107 (linear OTP delivery path with tap points).

## 102 — Cyber Attacks in India – Part 2 (Archive 2021)

- **Record number:** 102
- **Page name:** Cyber Attacks in India – Part 2
- **Canonical URL:** https://ambisecure.ambimat.com/blog/archive/cyber-attacks-in-india-part-2/
- **Section:** Blog
- **Page type:** SECURITY ANALYSIS
- **Primary topic:** Other | **Secondary:** Phishing-resistant authentication;Enterprise access
- **Design priority:** P3
- **Approved headline:** Weak Second Factors, Repeated at Scale
- **Alternative headline:** Five More Exposures, One Access Gap
- **Category label:** BLOG
- **Core message:** Part two of the series reads five Indian breaches for their common shape — credential theft, weak second factors, and privileged access that was never hardened.
- **Audience:** Security practitioner
- **Diagram type:** COMPARISON
- **Visual concept:** Dominant object: an exposure-surface row — five data stores drawn as identical stacked slabs along a perimeter line, each annotated beneath with the single access control that was missing rather than with the attack that landed. Five nodes, sector-labelled not brand-labelled: an unsecured messaging server (bank SMS notifications), an order-history store, a third-party KYC warehouse, a personnel-records database, a public-health results portal indexed by a search engine. The relationship is repetition, not sequence: the same gap recurring across unrelated operators, which is the page's actual argument. No hardware cutaway; the tamper-resistant-key-custody point from the 2026 box appears as one small sealed-slab contrast at the row's end. Series treatment: shares the slab-and-annotation language of recs 103 and 101 but is the only one built on a perimeter row. Labels allowed: exposed store, missing control, third-party, indexed, and the 'Part 2' marker, which matches this page's H1.
- **Avoid:**
    - Do not use SBI, Domino's, Jubilant FoodWorks or Upstox logos, wordmarks or brand colours
    - Do not depict a search-engine-indexed results page as a hacking intrusion — it was public exposure requiring no compromise
    - Do not imply AmbiSecure hardware would have closed a third-party data-warehouse exposure — none of these five stores were breached at the authentication step
    - Do not show the 13 TB or 180 million figures as AmbiSecure-verified research
- **Alt text:** Five Indian data-exposure incidents drawn as a perimeter row, each mapped to the access control it lacked, from an unsecured SMS server to a third-party KYC warehouse.
- **Export filename:** `ambisecure-blog-archive-cyber-attacks-in-india-part-2-1200x630.png`
- **Visual similarity group:** VSG-THREAT-LANDSCAPE
- **Currently uses:** blog-archive.png
- **Notes:** SERIES middle instalment (see rec 101 note). Consolidation candidate. P3: 2019-2021 incident recap, no durable technical content, minimal AmbiSecure differentiation. Accuracy caution for the illustrator: most incidents here are storage/exposure failures rather than authentication failures, so the image must not overclaim a hardware-key remedy — the honest visual claim is 'missing control', not 'missing security key'. VSG-THREAT-LANDSCAPE variation: perimeter exposure row. Distinct from recs 101, 103, 107.

## 103 — Cyber Attacks in India (Archive 2021)

- **Record number:** 103
- **Page name:** Cyber Attacks in India
- **Canonical URL:** https://ambisecure.ambimat.com/blog/archive/cyber-attacks-in-india-part-1/
- **Section:** Blog
- **Page type:** SECURITY ANALYSIS
- **Primary topic:** Other | **Secondary:** Hardware security keys;Phishing-resistant authentication
- **Design priority:** P3
- **Approved headline:** Five Breaches, One Credential Weakness
- **Alternative headline:** What India's Largest Breaches Had in Common
- **Category label:** BLOG
- **Core message:** The first instalment reads India's landmark banking and identity incidents as systemic patterns in identity hygiene rather than isolated failures.
- **Audience:** Security practitioner
- **Diagram type:** CONCEPTUAL ILLUSTRATION
- **Visual concept:** Dominant object: a root-cause ledger — five incident rows on the left converging by ruled leader lines into a single node on the right labelled 'a secret a person could hand over'. Five nodes, described by mechanism and sector, never by brand: a national ID database leak, an ATM-server compromise reached through skimmed card data, a SIM-swap account takeover, a bank employee opening a forged central-bank attachment that yielded SWIFT access codes, and a second ATM-switch compromise cashed out across multiple countries. The convergence is the whole idea — different sectors, one class of weakness. No hardware object dominates; a single sealed-key glyph sits past the convergence node as the counterfactual, small and unlabelled by product. Series treatment: shares the ruled-line language of recs 102 and 101 but is the only one using convergence-to-a-root. Labels allowed: sector names, SIM swap, skimming, forged attachment, SWIFT codes.
- **Avoid:**
    - Do not print 'Part 1', '1 of 3' or any numbering — this page's H1 is simply 'Cyber Attacks in India' with no number, and numbering it would contradict the page
    - Do not show the Aadhaar logo, UIDAI branding, Indian national emblem, or Canara/Cosmos/Union Bank marks
    - Do not depict SIM swap as physical SIM theft — it is a fraudulent re-issue against the operator's subscriber record
    - Do not imply a FIDO2 key would have stopped the ATM-switch or skimming compromises — those bypassed cardholder authentication entirely
- **Alt text:** Landmark Indian banking and identity incidents converging on one shared root: secrets a person could hand over, and access paths that nothing attested.
- **Export filename:** `ambisecure-blog-archive-cyber-attacks-in-india-part-1-1200x630.png`
- **Visual similarity group:** VSG-THREAT-LANDSCAPE
- **Currently uses:** blog-archive.png
- **Notes:** SERIES opener (recs 103 -> 102 -> 101). IMPORTANT numbering flag: the H1 and title of part one carry no number while parts 2 and 3 do, so this image must stay unnumbered even though it opens the series — the sibling images may carry 'Part 2'/'Part 3'. Consolidation candidate with 101/102. P3: 2018-era incidents, no differentiated technical content. Accuracy caution: the ATM/skimming and SWIFT incidents are not authenticator-remediable, so the counterfactual must stay understated. VSG-THREAT-LANDSCAPE variation: convergence-to-root ledger. Distinct from recs 101, 102, 107.

## 104 — Enterprise Security Threats (Archive 2021)

- **Record number:** 104
- **Page name:** Enterprise Security Threats
- **Canonical URL:** https://ambisecure.ambimat.com/blog/archive/enterprise-security-threats/
- **Section:** Blog
- **Page type:** INDUSTRY ARTICLE
- **Primary topic:** Enterprise access | **Secondary:** Phishing-resistant authentication;IoT security;Hardware security keys
- **Design priority:** P3
- **Approved headline:** Every New Platform Widens the Surface
- **Alternative headline:** Where Hardware Identity Narrows the Surface
- **Category label:** BLOG
- **Core message:** Every platform an enterprise brings online widens the attack surface, and hardware-rooted identity narrows the one slice of it that credentials control.
- **Audience:** CISO
- **Diagram type:** SYSTEM ARCHITECTURE
- **Visual concept:** Dominant object: a widening surface ring — a former network perimeter drawn as a broken inner circle, with five entry classes pushed outside it and connected inward: cloud workloads, SaaS access, contractor identities, BYOD endpoints, unmanaged IoT. The relationship is honest scoping rather than a security-blanket claim: a shaded wedge across the ring marks only the identity-controlled portion, and a hardware-rooted credential narrows that wedge while the remainder of the ring stays open — ransomware exfiltration and unsecured-network exposure are not identity problems. Inside hardware: the credential's private key, shown sealed within the small authenticator glyph at the wedge's base. Externally communicated: signed assertions only. Labels allowed: cloud, SaaS, contractor, BYOD, IoT, identity-controlled. Must not imply the ring closes.
- **Avoid:**
    - Do not draw hardware-rooted identity as sealing the whole perimeter — it narrows the credential wedge only, and the page's ransomware and unsecured-network threats sit outside it
    - Do not name or depict Microsoft Teams or Zoom product UI, which the 2021 body cites
    - Do not frame this as a pandemic/remote-work moment with home-office imagery — the point is structural, not situational
    - Do not show an SMS OTP or push approval as the mitigation for the phishing entry class
- **Alt text:** The enterprise attack surface widening across cloud, SaaS, contractor, BYOD and IoT entry points, and the credential-controlled wedge hardware-rooted identity narrows.
- **Export filename:** `ambisecure-blog-archive-enterprise-security-threats-1200x630.png`
- **Visual similarity group:** VSG-ENTERPRISE-ACCESS
- **Currently uses:** blog-archive.png
- **Notes:** P3: generic 2021 threat overview with pandemic-era framing and no AmbiSecure-specific technical content; the most consolidatable page in the batch alongside the India series, and the archive's own 2026 box concedes the picture has moved on. VSG-ENTERPRISE-ACCESS variation: attack-surface ring — dominant object differs from rec 99's two-plane login spine. Human review: the temptation to imply hardware keys fix the whole surface is the main risk here.

## 105 — What is Passwordless Authentication? (Archive 2021)

- **Record number:** 105
- **Page name:** What is Passwordless Authentication?
- **Canonical URL:** https://ambisecure.ambimat.com/blog/archive/what-is-passwordless-authentication/
- **Section:** Blog
- **Page type:** STANDARDS EXPLAINER
- **Primary topic:** Passwordless authentication | **Secondary:** FIDO2;WebAuthn;Hardware security keys
- **Design priority:** P2
- **Approved headline:** The Factor Stops Being a Shared Secret
- **Alternative headline:** Only the Public Key Leaves
- **Category label:** SECURITY EXPLAINER
- **Core message:** Passwordless does not mean no factor — it means the factor stops being a user-supplied shared secret and becomes a hardware-bound credential the user never has to transmit.
- **Audience:** Security architect
- **Diagram type:** PROTOCOL FLOW
- **Visual concept:** Dominant object: the FIDO2 registration moment drawn as a keypair splitting at the authenticator — one half stays behind a sealed boundary, the other half travels. Left of the boundary: user verification (fingerprint or PIN) unlocking the authenticator locally, drawn as a local loop that never crosses. Crossing the boundary: only the public key and the attestation-signed response, riding CTAP to the client and the WebAuthn API to the relying party, which stores the public key alone. Five nodes: user verification, AmbiSecure authenticator, CTAP link, browser/WebAuthn API, relying party. Inside hardware: private key and biometric template, both drawn stopped at the boundary with a visible terminator. Labels allowed: FIDO2, WebAuthn, CTAP, public key, private key (inside only), user verification. Must not imply the relying party ever receives anything secret.
- **Avoid:**
    - Do not show the private key or the biometric template crossing the authenticator boundary — user verification is local and the template never travels
    - Do not draw magic links, emailed tokens or SMS tokens as equivalents to FIDO2 — the 2021 body lists them as passwordless, but they are shared secrets in transit and are not phishing-resistant
    - Do not conflate synced passkeys with the hardware authenticator shown — this page predates passkeys entirely
    - Do not restate the body's 'only phishing-proof factor available' claim
- **Alt text:** How FIDO2 registration keeps the private key sealed inside the authenticator while only a public key reaches the relying party, retiring the stored shared secret.
- **Export filename:** `ambisecure-blog-archive-what-is-passwordless-authentication-1200x630.png`
- **Visual similarity group:** VSG-FIDO-CEREMONY
- **Currently uses:** blog-archive.png
- **Notes:** Promoted to P2: the strongest evergreen in the batch — a passwordless primer with durable search value, and the keypair-split visual stays correct regardless of the 2021 copy. Consolidation flag: this page carries an explicit 'Read the current article' CTA to modern passwordless coverage, which should own the P1-grade image; keep this one clearly subordinate and standards-focused, not product-led. Human review: the body's inclusion of magic links and SMS tokens under 'passwordless' is technically true but misleading by current positioning — the avoid_list handles it.

## 106 — Is Passwordless the future? (Archive 2021)

- **Record number:** 106
- **Page name:** Is Passwordless the future?
- **Canonical URL:** https://ambisecure.ambimat.com/blog/archive/is-passwordless-the-future/
- **Section:** Blog
- **Page type:** THOUGHT LEADERSHIP
- **Primary topic:** Passwordless authentication | **Secondary:** FIDO2;Hardware security keys
- **Design priority:** P3
- **Approved headline:** Passwordless Is an Architecture, Not a Feature
- **Alternative headline:** From Stored Hash to Hardware-Bound Key
- **Category label:** BLOG
- **Core message:** Passwordless is not a feature label but a different architecture — verifying a hardware-bound credential by public-key cryptography instead of comparing a submitted secret against a stored hash.
- **Audience:** Security architect
- **Diagram type:** SYSTEM ARCHITECTURE
- **Visual concept:** Dominant object: two server-side boxes set side by side, and the contrast is what each box is worth stealing. Left box: a credential store holding password hashes — every record is a target, and a dashed exfiltration arrow leaves it. Right box: a relying-party record holding only a public key — the same exfiltration arrow leaves it and is drawn terminating in nothing, because a public key is not a secret. Five nodes: user, client, credential store (hashes), relying-party record (public keys), authenticator holding the private key sealed at the far right. Inside hardware: the private key, which is the reason the right-hand box has nothing to lose. Externally communicated: a signature over a challenge, never a secret. Labels allowed: stored hash, public key, signature, private key (inside only). Must not pose passwordless as an open question — the architecture is deployed, and the image must not date itself the way the 2021 headline does.
- **Avoid:**
    - Do not restate the body's 'only phishing-proof factor available' claim — FIDO2 is phishing-resistant and is not the only such factor
    - PIV certificates qualify
    - Do not frame the image as an unresolved question with question marks or a fork in the road — the page's own 2026 box answers it 'yes'
    - Do not place the private key, a biometric template, or any secret inside either server box
    - Do not depict a synced passkey and a hardware key as interchangeable — the 2021 body predates passkeys and never distinguishes them
- **Alt text:** Architectural contrast between a server holding password hashes worth stealing and one holding only a public key, the shift AmbiSecure's FIDO2 hardware makes possible.
- **Export filename:** `ambisecure-blog-archive-is-passwordless-the-future-1200x630.png`
- **Visual similarity group:** VSG-COMPARISON-MATRIX
- **Currently uses:** blog-archive.png
- **Notes:** P3 and the batch's clearest dated-outlook risk: the title asks a question the market has answered. Body corrected 2026-07-17 — the 'only phishing-proof factor' line now reads as phishing-resistant with the origin-binding mechanism named — but the 'passwords cannot be eliminated entirely' hedge remains 2021 framing, so the brief still reframes to the durable architectural claim rather than the hedge. Overlaps heavily with rec 105 — consolidation candidate; the page also links out to modern 'Passkeys vs traditional MFA' coverage. VSG-COMPARISON-MATRIX variation: server-side architecture contrast, vs rec 98's factor-vs-attack grid.

## 107 — SMS-Based OTP Disadvantages (Archive 2021)

- **Record number:** 107
- **Page name:** SMS-based OTP Authentication and Its Disadvantages
- **Canonical URL:** https://ambisecure.ambimat.com/blog/archive/sms-otp-disadvantages/
- **Section:** Blog
- **Page type:** SECURITY ANALYSIS
- **Primary topic:** Telecom authentication | **Secondary:** Phishing-resistant authentication;SIM/eSIM;Hardware security keys
- **Design priority:** P2
- **Approved headline:** SMS OTP Inherits the Telecom Threat Model
- **Alternative headline:** SIM Swap, SS7, and OTP Relay
- **Category label:** SECURITY EXPLAINER
- **Core message:** SMS-based OTP inherits the telecom network's trust assumptions, which is why SIM swap, SS7 interception and OTP relay have made it indefensible as a second factor.
- **Audience:** Fintech security team
- **Diagram type:** PROTOCOL FLOW
- **Visual concept:** Dominant object: the OTP's delivery path drawn as one long horizontal line from relying party to human — and the point is its length, because every hop is someone else's trust boundary. Five nodes along it: relying party, SMS gateway, carrier subscriber record, SS7/transit, handset. Three tap marks hang off the line where the page places them: a fraudulent re-issue at the carrier's subscriber record (SIM swap), interception in transit (SS7, plain text), and a relay at the far end where the user retypes the code into a phishing page. Beneath it, a deliberately short second line: challenge to AmbiSecure authenticator and back, origin-bound, never entering the telecom path at all. The visual argument is path length and custody, not cryptographic strength. Labels allowed: SMS gateway, SS7, SIM swap, relay, origin-bound. Must not imply the short path is merely a faster version of the long one.
- **Avoid:**
    - Do not depict SIM swap as physical theft or cloning of a SIM card — it is a fraudulent re-issue against the operator's subscriber record
    - Do not show the OTP as an encrypted payload — the page's whole point is that SMS transits as plain text
    - Do not present SMS OTP as universally abolished — the page's 2026 box notes it survives as a consumer recovery method
    - Do not repeat the body's 'only phishing-proof factor available' claim
    - Do not show the AmbiSecure key drawing a network or battery connection — it needs neither, which is the contrast with a handset that needs both
- **Alt text:** The SMS one-time-password delivery path with its SIM-swap, SS7 and relay tap points, set against a FIDO2 exchange that never touches the telecom network.
- **Export filename:** `ambisecure-blog-archive-sms-otp-disadvantages-1200x630.png`
- **Visual similarity group:** VSG-THREAT-LANDSCAPE
- **Currently uses:** blog-archive.png
- **Notes:** Promoted to P2 — the most durable and most shareable archive piece here: SIM swap and SS7 are still live arguments, the page's regulatory context (NIST SP 800-63-4 dropping SMS for AAL2+, OMB M-22-09) has strengthened rather than dated the thesis, and SMS-OTP remains the default second factor across Indian banking and telco, which is AmbiSecure's home market. Note it does carry a 'Read the current take' CTA to the OTP/SMS timeline, so keep the image analytic rather than product-led. VSG-THREAT-LANDSCAPE variation: linear delivery path with tap points — distinct from the India series' ledgers and exposure rows.

## 109 — How Chip-Based ePassports Work (Archive 2021)

- **Record number:** 109
- **Page name:** ePassport and How will chip-based e-Passports work
- **Canonical URL:** https://ambisecure.ambimat.com/blog/archive/how-chip-based-epassports-work/
- **Section:** Blog
- **Page type:** TECHNICAL ARTICLE
- **Primary topic:** Government identity | **Secondary:** Smart cards;Secure Elements;PKI
- **Design priority:** P2
- **Approved headline:** Inside the ePassport Trust Chain
- **Alternative headline:** The Chip Opens Only After PACE
- **Category label:** TECHNICAL ARTICLE
- **Core message:** A chip-based ePassport works because a tamper-resistant secure element runs ICAO 9303 applets bound to a national PKI, exposing a small set of access-controlled read protocols and never revealing private keys.
- **Audience:** Government programme
- **Diagram type:** TRUST CHAIN
- **Visual concept:** Dominant object: the contactless inlay inside the passport cover — antenna loop plus secure element — drawn as a cutaway at the centre, with two distinct axes meeting on it. Vertical axis above (the trust chain): CSCA national root signs the Document Signer Certificate, which signs the SOD, which in turn covers the LDS data groups on the chip; the PKD sits beside the DSC as the distribution point. Horizontal axis below (the read path): an inspection system establishes a PACE-protected channel before any data group can be read, and only then does DG1 (MRZ data) and DG2 (facial image) come out. Five nodes: CSCA, DSC/PKD, SOD over LDS, secure element, inspection system. Inside hardware: the Active Authentication private key, drawn sealed with no read path — the chip proves it is genuine without ever emitting it. Externally: only signed, access-controlled data groups. Labels allowed: ICAO 9303, CSCA, DSC, PKD, SOD, DG1, DG2, PACE, ISO/IEC 14443.
- **Avoid:**
    - Do not show BAC as a current access-control mechanism unless marked superseded — PACE has replaced it, per the page's own 2026 note
    - Do not draw a contact pad or contact plate on the passport inlay — the ePassport chip is contactless ISO/IEC 14443 only
    - Do not show DG3 fingerprint data as freely readable alongside DG1 and DG2 — it requires Extended Access Control with terminal authentication
    - Do not show the Active Authentication private key being read out, exported, or held by the inspection system
    - Do not depict raw biometric templates on the chip — the page states a digital image (JPEG/JPEG2000) is what is stored
- **Alt text:** The contactless inlay inside a biometric passport, with the ICAO 9303 signing chain above it and the PACE-protected read path an inspection system must complete first.
- **Export filename:** `ambisecure-blog-archive-how-chip-based-epassports-work-1200x630.png`
- **Visual similarity group:** VSG-EPASSPORT
- **Currently uses:** blog-archive.png
- **Notes:** Promoted to P2: the most technically durable page in the batch and commercially live — AmbiSecure ships an ePassport platform, and the CSCA/DSC/SOD chain plus PACE has not dated. VSG COLLISION FLAG: rec 110 (epassport-applications, batch 18) shares VSG-EPASSPORT — this brief is deliberately the protocol-and-trust-chain cutaway, so 110 must take the border-control/application-surface angle instead; worth a human check that the two do not converge. Body-accuracy flag: the 2021 copy's '30 international visits with 64 kilobytes memory' and 'Malaysia first in 1998 / 120 countries by 2017' figures are dated and must not appear in the image.

## 110 — ePassport and Its Application (Archive 2021)

- **Record number:** 110
- **Page name:** ePassport and Its Application
- **Canonical URL:** https://ambisecure.ambimat.com/blog/archive/epassport-applications/
- **Section:** Blog
- **Page type:** INDUSTRY ARTICLE
- **Primary topic:** Government identity | **Secondary:** Biometric authentication; Smart cards; Secure Elements
- **Design priority:** P2
- **Approved headline:** Where ePassport Chips Meet the Border
- **Alternative headline:** The Four-Way Check Behind Border Control
- **Category label:** TECHNICAL ARTICLE
- **Core message:** The value of an ePassport is realised at the application surface — airline check-in, advance passenger information, and the border gate — not just in the chip.
- **Audience:** Government programme
- **Diagram type:** SYSTEM ARCHITECTURE
- **Visual concept:** Dominant object: a border-control lane read left to right, with the ICAO 9303 ePassport booklet and its contactless chip as the anchor at the left. Five nodes only: (1) ePassport with secure element, (2) airline check-in reader authenticating the document, (3) the Advance Passenger Information message travelling airline→border authority ahead of the flight, (4) the eGate / inspection reader performing the live biometric comparison, (5) the border officer's fraudulent-document and watchlist check. Inside hardware: the enrolled biometric template and the chip's signing keys — only a read result and a match/no-match verdict cross the boundary. External comms: the contactless ISO/IEC 14443 read at each reader, and the API passenger manifest, which carries passenger list data and not chip contents. Labels allowed: "ePassport", "Check-in", "API", "eGate", "Border authority". Variation within VSG-EPASSPORT: this is the stakeholder/application surface across the journey — deliberately NOT the CSCA→DSC→SOD trust chain or PACE read path, which the companion how-chip-based-epassports-work image owns.
- **Avoid:**
    - Do not show biometric templates or private keys leaving the ePassport chip — only a match verdict crosses out
    - Do not draw a contact interface or insert slot — ICAO 9303 ePassports are read over contactless ISO/IEC 14443
    - Do not depict the CSCA/DSC/SOD trust chain or PACE handshake — that angle belongs to the companion how-chip-based-epassports-work image
    - Do not imply a single global biometric database — API is an airline-to-authority passenger manifest, not chip data replication
    - Do not imply AmbiSecure operates a border system or acts as an issuing authority
- **Alt text:** Border-control lane tracing an ICAO 9303 ePassport from airline check-in to eGate, showing why the biometric template stays inside the chip's secure element.
- **Export filename:** `ambisecure-blog-archive-epassport-applications-1200x630.png`
- **Visual similarity group:** VSG-EPASSPORT
- **Currently uses:** blog-archive.png
- **Notes:** Promoted from P3: ePassport application architecture is durable and maps directly to AmbiSecure's government-identity and personalisation lines. Coordinated with rec 109 — that image takes the protocol/trust-chain cutaway, this one takes the border-control application surface, so the shared VSG-EPASSPORT does not converge. Body's 'one/two/three/four-way check' ladder is the alt_headline hook and is accurate to the copy.

## 111 — Introduction to Java Card (Archive 2020)

- **Record number:** 111
- **Page name:** An Introduction to Java Card Technology
- **Canonical URL:** https://ambisecure.ambimat.com/blog/archive/introduction-to-java-card/
- **Section:** Blog
- **Page type:** TECHNICAL ARTICLE
- **Primary topic:** JavaCard | **Secondary:** Smart cards; Secure Elements; Provisioning
- **Design priority:** P2
- **Approved headline:** JavaCard: One Chip, Many Applets
- **Alternative headline:** Why Smart Cards Became Programmable
- **Category label:** TECHNICAL ARTICLE
- **Core message:** JavaCard is the runtime that makes a smart card programmable, letting isolated applets co-reside on one chip and load post-issuance under the issuer's keys.
- **Audience:** JavaCard developer
- **Diagram type:** SYSTEM ARCHITECTURE
- **Visual concept:** Dominant object: a cutaway of a single smart-card chip, sliced to expose the JavaCard runtime as a horizontal layer with applets seated above it. Five nodes only: (1) the JavaCard VM / runtime, (2) the applet firewall drawn as a hard vertical partition between applet contexts, (3) three co-resident applets — FIDO, PIV, ePassport — each in its own walled context, (4) the ISO/IEC 7816-4 APDU command–response channel at the chip edge, the applet's only conversation with the outside world, (5) the authenticated post-issuance load channel entering under the issuer's keys rather than the chip vendor's. Inside hardware: applet bytecode, per-applet keys, and the VM — none of it exportable. External comms: APDU command/response pairs and the authenticated applet load only. Labels allowed: "JavaCard VM", "Applet firewall", "FIDO", "PIV", "ePassport", "APDU". Variation within VSG-SE-ARCHITECTURE: the dominant object is the runtime-and-firewall layering, not a key hierarchy or provisioning line.
- **Avoid:**
    - Do not show applets sharing memory or reading across the applet firewall — isolation between contexts is the whole point
    - Do not draw JavaCard as a desktop JVM or full Java SE stack — it is a constrained subset for small-memory devices
    - Do not show applet keys or bytecode leaving the chip — post-issuance load is inbound and authenticated under issuer keys
    - Do not foreground DES/3DES from the 2020 body as a current recommendation — AES/ECC with GlobalPlatform SCP03 is the modern baseline
    - Do not imply AmbiSecure certifies the JavaCard platform itself
- **Alt text:** Chip cutaway of the JavaCard runtime and applet firewall, showing how AmbiSecure keeps co-resident FIDO, PIV and ePassport applets isolated on a single die.
- **Export filename:** `ambisecure-blog-archive-introduction-to-java-card-1200x630.png`
- **Visual similarity group:** VSG-SE-ARCHITECTURE
- **Currently uses:** blog-archive.png
- **Notes:** Promoted from P3: JavaCard is a live AmbiSecure product line (/products/javacard-applets) and the multi-applet co-residency story is durable and shareable. Body cites DES/3DES as supported crypto — accurate to 2020 but must not be visually promoted as current; the page's own 2026 sidebar names JavaCard 3.x + GlobalPlatform 2.3.1 (SCP03) as the baseline.

## 112 — Fast Identity Online (FIDO) (Archive 2020)

- **Record number:** 112
- **Page name:** Fast Identity Online (FIDO)
- **Canonical URL:** https://ambisecure.ambimat.com/blog/archive/fast-identity-online/
- **Section:** Blog
- **Page type:** STANDARDS EXPLAINER
- **Primary topic:** FIDO2 | **Secondary:** Hardware security keys; Passwordless authentication; Phishing-resistant authentication
- **Design priority:** P2
- **Approved headline:** FIDO Replaced the Shared Secret
- **Alternative headline:** From U2F to Username-less Login
- **Category label:** SECURITY EXPLAINER
- **Core message:** FIDO removes the shared secret from the centre of authentication, binding credentials to hardware that signs challenges so there is nothing useful left to phish.
- **Audience:** IAM leader
- **Diagram type:** IDENTITY FLOW
- **Visual concept:** Dominant object: a split panel. Left, the legacy shared-secret store — a central database of passwords and OTP seeds — drawn as the single phishable target every legacy system inherits. Right, a hardware authenticator answering a challenge. Five nodes only: (1) the central shared-secret store as the old model, (2) the hardware authenticator holding the private key, (3) the origin-bound challenge arriving from the relying party, (4) the signature returned across the boundary, (5) per-service unique key pairs fanning out to three relying parties with no linkage between them. Inside hardware: the private key, which never crosses the line under any circumstance. External comms: only the challenge in and the signature plus public key out. Labels allowed: "Shared secret", "Challenge", "Signature", "Public key", "Origin-bound". Variation within VSG-FIDO-CEREMONY: the dominant contrast is old-model secret store versus signing authenticator, not a registration/authentication ceremony sequence.
- **Avoid:**
    - Do not show the private key leaving the authenticator — only the signature and public key cross the boundary
    - Do not label FIDO "phishing-proof" — origin binding makes it phishing-RESISTANT, and the on-image wording must say so
    - Do not depict FIDO as encrypting a payload — the ceremony is a challenge signature, despite the 2020 body's loose "public-key encryption" phrasing
    - Do not draw synced passkeys or cloud credential backup — this page's model is hardware-bound, and multi-device registration is not credential sync
    - Do not caption the authenticator "AmbiSecure Key" — that legacy name appears in the body but the shipping line is OnePass USB Key / OnePass Card / BioKey
- **Alt text:** Split diagram contrasting a phishable central secret store with an AmbiSecure authenticator signing an origin-bound challenge, private key never leaving.
- **Export filename:** `ambisecure-blog-archive-fast-identity-online-1200x630.png`
- **Visual similarity group:** VSG-FIDO-CEREMONY
- **Currently uses:** blog-archive.png
- **Notes:** Promoted from P3: FIDO fundamentals are durable and this is the highest-share-potential page in the batch. Two legacy-copy hazards flagged into avoid_list — the body says "public-key encryption" (should be signatures) and names "AmbiSecure Key", which is not current product naming. Body also uses "FIDO Resident Credentials"; modern term is discoverable credentials — prefer the alt_headline's "username-less" phrasing over either. Body does not claim phishing-proof, but the blanket coordination check applies to on-image wording.

## 113 — EMV Certification in Public Transport (Archive 2020)

- **Record number:** 113
- **Page name:** Understanding EMV certification In Public Transportation
- **Canonical URL:** https://ambisecure.ambimat.com/blog/archive/emv-certification-in-public-transport/
- **Section:** Blog
- **Page type:** STANDARDS EXPLAINER
- **Primary topic:** Transit security | **Secondary:** Smart cards; NFC
- **Design priority:** P2
- **Approved headline:** EMV Certification Is Not One Test
- **Alternative headline:** Who Certifies What in EMV Transit
- **Category label:** TECHNICAL ARTICLE
- **Core message:** EMV in transit is not one certification — scope depends on the acceptance model, and different bodies own different levels of the stack.
- **Audience:** Transit-system architect
- **Diagram type:** LIFECYCLE
- **Visual concept:** Dominant object: a three-rung certification ladder climbing from silicon to revenue service, with an ownership bracket running alongside it. Five nodes only: (1) Level 1 — the physical terminal, contactless interface, logic and transmission, (2) Level 2 — the payment kernel software, (3) Level 3 — each card brand tested against the whole processing solution, (4) the EMVCo bracket spanning ONLY rungs 1 and 2, (5) the acquirer / scheme bracket owning rung 3, with terminal vendor and transit authority shown as the parties who carry the work. A prototype→revenue-service arrow runs beneath the ladder, undated. Inside hardware: the kernel and terminal keys under test at L1/L2. External: the scheme-side acceptance testing at L3. Labels allowed: "Level 1", "Level 2", "Level 3", "EMVCo", "Acquirer / scheme". Variation within VSG-TRANSIT: this is a certification-authority ladder — the only page in the transit group with no regional map, card, or validator as its dominant object.
- **Avoid:**
    - Do not show EMVCo certifying Level 3 — EMVCo manages the specifications and certifies Levels 1 and 2 only, and Level 3 is acquirer/scheme-run
    - Do not present EMV transit as a single certification — the page's core claim is that scope depends on acceptance model, schemes accepted, and where the merchant boundary sits
    - Do not print "EMV 4.2" or any version number as current — the 2020 body's version claim is stale
    - Do not draw a contact chip-insert slot on the transit terminal — transit acceptance is contactless
    - Do not imply AmbiSecure holds, issues, or grants any EMV certification
- **Alt text:** Certification ladder splitting EMV Level 1 hardware, Level 2 kernel and Level 3 brand testing, with the body that owns each rung in a transit rollout.
- **Export filename:** `ambisecure-blog-archive-emv-certification-in-public-transport-1200x630.png`
- **Visual similarity group:** VSG-TRANSIT
- **Currently uses:** blog-archive.png
- **Notes:** Promoted from P3: the L1/L2/L3 ownership split is a durable reference transit architects still get wrong, and the page's own 2026 sidebar confirms the certification questions remain relevant. Stale-fact hazard flagged: body states "current version is 4.2 from 2008" — keep all version numbers off the image.

## 114 — Workplace Biometrics

- **Record number:** 114
- **Page name:** Workplace Security — How Biometrics Is the Key to the New Normal
- **Canonical URL:** https://ambisecure.ambimat.com/blog/archive/workplace-biometrics/
- **Section:** Blog
- **Page type:** INDUSTRY ARTICLE
- **Primary topic:** Biometric authentication | **Secondary:** Enterprise access; Passwordless authentication; Secure Elements
- **Design priority:** P3
- **Approved headline:** Biometrics Layer On, They Don't Replace
- **Alternative headline:** Which Modality for Which Workplace Surface
- **Category label:** BLOG
- **Core message:** Workplace biometrics work because they layer onto existing authentication — the real question is which modality fits which surface and how templates are managed.
- **Audience:** IAM leader
- **Diagram type:** SYSTEM ARCHITECTURE
- **Visual concept:** Dominant object: three workplace surfaces in a row, each paired with the modality that actually fits it, sitting on top of an existing authentication layer that stays intact. Five nodes only: (1) physical door / access pad — card plus fingerprint, (2) workstation login — fingerprint on the card, (3) time-and-attendance terminal — contactless palm, (4) the existing MFA / FIDO factor drawn as the foundation beneath all three, visibly added to rather than removed, (5) the secure element on the credential where the enrolled template lives and the comparison happens. Inside hardware: the template and the match, both on the card. External comms: a match / no-match verdict to the door controller or workstation — nothing else leaves. Labels allowed: "Door", "Workstation", "Time & attendance", "Match on card", "Match / no match". Variation within VSG-BIOMETRIC-MATCH: this is a surface-to-modality mapping across enterprise touchpoints; the companion consumer-biometrics image owns the template lifecycle and the match-on-device/server split.
- **Avoid:**
    - Do not show biometrics replacing MFA, passwords, or FIDO — the page's claim is that they layer onto existing authentication
    - Do not draw a central template database or cloud biometric store — match-on-card / match-on-device is the pattern OnePass Bio Card and BioKey ship
    - Do not show a raw fingerprint, face, or palm image travelling to a reader or server — only a match verdict leaves the card
    - Do not put the 2020 COVID "new normal" framing or the body's dated statistics on the image
    - Do not imply a biometric is a secret that can be rotated or revoked like a password
- **Alt text:** Workplace surfaces mapped to biometric modalities — door, workstation, time-and-attendance — with matching staying on the AmbiSecure card's secure element.
- **Export filename:** `ambisecure-blog-archive-workplace-biometrics-1200x630.png`
- **Visual similarity group:** VSG-BIOMETRIC-MATCH
- **Currently uses:** blog-archive.png
- **Notes:** Held at P3: the 2020 COVID "new normal" framing and its statistics (54% phishing rise, Microsoft's $12M month, 99% password reuse) date the piece badly, and the durable architectural content is carried better by rec 115. Consolidation candidate with rec 115 — the two overlap heavily on match-on-device; if merged, keep 115's template-lifecycle spine and fold this page's surface mapping in as a section. VSG-BIOMETRIC-MATCH coined for this pair; no listed VSG covers biometric template handling.

## 115 — Consumer Biometrics & Privacy (Archive 2020)

- **Record number:** 115
- **Page name:** Consumer Biometrics in the Data Privacy Age
- **Canonical URL:** https://ambisecure.ambimat.com/blog/archive/consumer-biometrics-and-privacy/
- **Section:** Blog
- **Page type:** TECHNICAL ARTICLE
- **Primary topic:** Biometric authentication | **Secondary:** Secure Elements; Smart cards
- **Design priority:** P2
- **Approved headline:** The Template Never Leaves the Device
- **Alternative headline:** Biometric Privacy Is an Architecture Choice
- **Category label:** SECURITY EXPLAINER
- **Core message:** Biometric privacy is an architecture decision — an irreversible template matched on the device keeps the exposure that a central template store creates.
- **Audience:** Security architect
- **Diagram type:** COMPARISON
- **Visual concept:** Dominant object: a two-column comparison — match-on-device against match-on-server — sharing one template-lifecycle strip that forks partway across. Five nodes only: (1) capture at the sensor, (2) extraction into an irreversible binary template, drawn as structured binary and explicitly not as a stored image, (3a) the device column, where the comparison happens inside the secure element and only a verdict emerges, (3b) the server column, where the template is shipped to a central store — the fork that creates the exposure, (4) the result returning to the application in both columns, identical in output, (5) a GDPR / BIPA regime bracket sitting over the server column where the regulatory weight actually lands. Inside hardware: template plus comparison, device column only. External comms: match/no-match on the left; the template itself on the right. Labels allowed: "Capture", "Template", "Match on device", "Match on server", "Secure element". Variation within VSG-BIOMETRIC-MATCH: the dominant object is the forking lifecycle, not the enterprise surface map of the companion workplace-biometrics image.
- **Avoid:**
    - Do not draw the stored template as a fingerprint or face image — templates are binary and cannot be reverse-engineered to the original biometric
    - Do not render match-on-server as equivalent to match-on-device — the identical output is the point, and the privacy exposure is what differs
    - Do not conflate a TEE with a secure element — the 2020 body cites TEE, but AmbiSecure's own pattern is the SE, and the two are distinct trust boundaries
    - Do not show GDPR or BIPA as endorsing or certifying any AmbiSecure product — they are constraints, not credentials
    - Do not reuse the enterprise door/workstation surface map from the companion workplace-biometrics image
- **Alt text:** Two-column comparison of match-on-device against match-on-server, tracing an irreversible template to the secure element where AmbiSecure keeps the comparison.
- **Export filename:** `ambisecure-blog-archive-consumer-biometrics-and-privacy-1200x630.png`
- **Visual similarity group:** VSG-BIOMETRIC-MATCH
- **Currently uses:** blog-archive.png
- **Notes:** Promoted from P3: the match-on-device architecture and irreversible-template argument are genuinely durable — the page's own 2026 sidebar confirms on-device matching has since become the default, which makes this the archive's most defensible biometric piece. TEE/SE distinction flagged into avoid_list: the body says TEE, AmbiSecure ships SE. Consolidation candidate with rec 114 — this page should be the survivor if the pair is merged.

## 116 — Securing your IIoT infrastructure (Archive 2020)

- **Record number:** 116
- **Page name:** Securing your IIoT infrastructure
- **Canonical URL:** https://ambisecure.ambimat.com/blog/archive/securing-iiot-infrastructure/
- **Section:** Blog
- **Page type:** SECURITY ANALYSIS
- **Primary topic:** IoT security | **Secondary:** Embedded security; Device identity; Secure Elements
- **Design priority:** P3
- **Approved headline:** Put the Protection Inside the PLC
- **Alternative headline:** Where ICS Trust Actually Breaks
- **Category label:** SECURITY EXPLAINER
- **Core message:** Industrial control systems need protection placed inside the controller — embedded cryptography and signed commands — because IT-shaped security stops at the OT boundary.
- **Audience:** Device-security architect
- **Diagram type:** SYSTEM ARCHITECTURE
- **Visual concept:** Dominant object: a PLC cabinet on a factory line, cut open so the defence layers read as concentric rather than perimeter-shaped. Five nodes only: (1) the PLC itself with an embedded crypto core holding the device key, drawn as the innermost and last line, (2) the control network segment carrying commands to the line, (3) the SCADA / HMI supervisory layer, (4) the enterprise IT boundary, drawn as the point where conventional tooling stops being sufficient rather than as a wall that holds, (5) three threat arrows entering at different depths — malware injection, forged command, configuration change — showing that outer layers do not catch all of them. Inside hardware: the device key and the signing operation, never exported. External comms: signed commands and telemetry crossing the control network. Labels allowed: "PLC", "Control network", "SCADA / HMI", "IT boundary", "Signed command". Variation within VSG-IOT-DEVICE: an OT cabinet cutaway with depth-ordered layers — no device fleet, no threat grid.
- **Avoid:**
    - Do not draw a PLC directly exposed to the public internet as though that were normal design
    - Do not show enterprise IT security tooling dropped unchanged into the OT segment — the page argues explicitly that traditional IT approaches are inadequate for industrial environments
    - Do not show the device private key leaving the embedded crypto core
    - Do not imply AmbiSecure supplies a full ICS or SCADA platform — the scope is hardware-rooted device identity inside the controller
    - Do not label any layer as certified to IEC 62443 or similar — no certification is claimed anywhere on the page
- **Alt text:** Cutaway of a PLC cabinet layering control network out to the IT boundary, showing why AmbiSecure puts device keys in embedded crypto inside the controller.
- **Export filename:** `ambisecure-blog-archive-securing-iiot-infrastructure-1200x630.png`
- **Visual similarity group:** VSG-IOT-DEVICE
- **Currently uses:** blog-archive.png
- **Notes:** Held at P3: the ICS threat list is generic 2020 survey material and the page overlaps the two IoT-challenges parts without adding a distinct argument. The one durable line — "put the highest level of protection inside the ICS" — is what the visual is built on. Consolidation candidate with recs 120/121 as a single IoT-security piece.

## 117 — Public Transport Ticketing (Part 3) (Archive 2020)

- **Record number:** 117
- **Page name:** Public Transport Ticketing System (Part-3)
- **Canonical URL:** https://ambisecure.ambimat.com/blog/archive/public-transport-ticketing-part-3/
- **Section:** Blog
- **Page type:** INDUSTRY ARTICLE
- **Primary topic:** Transit security | **Secondary:** Smart cards; NFC
- **Design priority:** P3
- **Approved headline:** When a Transit Card Becomes Currency
- **Alternative headline:** Closed-Loop Cards Outgrew the Gate
- **Category label:** BLOG
- **Core message:** Singapore, Indonesia and Hong Kong show closed-loop fare cards outgrowing the gate and becoming general-purpose stored-value instruments.
- **Audience:** Transit-system architect
- **Diagram type:** DEVICE NETWORK
- **Visual concept:** Dominant object: three city clusters — Singapore, Jakarta, Hong Kong — with each fare card's reach radiating outward past the fare gate into non-transit acceptance. Five nodes only: (1) Singapore EZ-Link / CEPAS, radiating to taxis, ERP gantries, car parks and convenience stores, (2) Indonesia TransJakarta, with bank-issued e-tickets acquired at shelters, minimarkets and banks and reused on the Commuterline, (3) Hong Kong Octopus, radiating widest — retail, parking meters, vending, libraries, building access, (4) the validator as the common tap point every card funnels through, (5) the SAM behind the validator holding the offline trust that lets the tap settle without a network round trip. Inside hardware: SAM keys at the validator, card keys in the card — neither crosses the RF gap. External comms: the contactless tap and the later settlement upload. Labels allowed: "EZ-Link / CEPAS", "TransJakarta", "Octopus", "Validator", "SAM", plus a small "Part 3 of 3" corner tag. Variation within VSG-TRANSIT: this is the outward radiation of card acceptance beyond transit — distinct from Part 1's architecture comparison and Part 2's converging-validator view.
- **Avoid:**
    - Do not label EZ-Link, Octopus, or FeliCa-family cards as EMV — they are CEPAS/FeliCa closed-loop schemes, and conflating them erases the page's point
    - Do not tag this image Part 1 or Part 2 — this is Part 3 of the three-part AFC series and covers Singapore, Indonesia and Hong Kong only
    - Do not show SAM keys leaving the validator's secure module
    - Do not imply AmbiSecure supplied or operates EZ-Link, TransJakarta, or Octopus
    - Do not present the body's 2020 adoption figures (Octopus at 99% of residents) as current on-image text
- **Alt text:** Hub-and-spoke diagram placing an EZ-Link transit card at the centre, linked to MRT/LRT, bus, taxi and ERP gantry payment points.
- **Export filename:** `ambisecure-blog-archive-public-transport-ticketing-part-3-1200x630.png`
- **Visual similarity group:** VSG-TRANSIT
- **Currently uses:** blog-archive.png
- **Notes:** Held at P3: dated 2020 regional survey, low differentiation. SERIES: Part 3 of 3 with recs 118 (Part 2) and 119 (Part 1) — all three share VSG-TRANSIT and must be visually kin but regionally distinct; part tags must be correct. CONTENT MISMATCH FLAG: the meta description promises "comparative notes across the analysed countries" and the intro promises an EMV/ABT/closed-loop model comparison, but the body is a Singapore/Indonesia/Hong Kong regional survey — briefed to actual body content. Strong consolidation candidate: the three parts are one geographic survey split by continent and would serve better merged.

## 118 — Public Transport Ticketing (Part 2) (Archive 2020)

- **Record number:** 118
- **Page name:** Public Transport Ticketing System (Part-2)
- **Canonical URL:** https://ambisecure.ambimat.com/blog/archive/public-transport-ticketing-part-2/
- **Section:** Blog
- **Page type:** INDUSTRY ARTICLE
- **Primary topic:** Transit security | **Secondary:** Smart cards; NFC
- **Design priority:** P3
- **Approved headline:** Contactless Bank Cards Reach the Gate
- **Alternative headline:** Oyster, RioCard, and the Open-Loop Shift
- **Category label:** BLOG
- **Core message:** Across Europe and Latin America, closed-loop fare cards and open-loop bank cards ended up meeting at the same validator rather than displacing one another.
- **Audience:** Transit-system architect
- **Diagram type:** SYSTEM ARCHITECTURE
- **Visual concept:** Dominant object: two credential streams — closed-loop transit card above, open-loop bank card and phone wallet below — converging on one validator drawn at the centre. Five nodes only: (1) London Oyster alongside TfL's separate contactless bank-card acceptance, the first network in the world to take one, (2) Berlin's app and WelcomeCard mobile ticket across S-Bahn / U-Bahn / bus / tram / ferry, (3) Moscow's unified chip card with remote top-up plus PayPass and phone wallets, (4) Rio's RioCard and Brazil's first NFC mobile transit ticketing, (5) Mexico City's Metrobus contactless smartcard and multimodal Tarjeta DF. The two streams meet at the validator and stay distinct — same tap, different trust model. Inside hardware: card keys and the validator's SAM. External comms: the contactless tap and the top-up / settlement channel. Labels allowed: "Oyster", "WelcomeCard", "Moscow", "RioCard", "Metrobus", plus a small "Part 2 of 3" corner tag. Variation within VSG-TRANSIT: the dominant object is the convergence of two credential types on one validator — not Part 3's outward retail radiation or Part 1's optimisation comparison.
- **Avoid:**
    - Do not brief this as Ambimat's own validator and SAM engineering story — the meta description says so, but the 2020 body is a UK/Germany/Russia/Brazil/Mexico regional survey
    - Do not tag this image Part 1 or Part 3 — this is Part 2 of the three-part AFC series
    - Do not show Oyster as an EMV card — it is closed-loop, running alongside TfL's separate open-loop contactless acceptance, not merged with it
    - Do not print the "one in ten UK contactless transactions" figure as current — it is a 2020 claim
    - Do not imply AmbiSecure operates or supplied any of these networks
- **Alt text:** Europe and Latin America fare systems from Oyster to RioCard, showing closed-loop cards and open-loop bank cards converging on a single contactless validator.
- **Export filename:** `ambisecure-blog-archive-public-transport-ticketing-part-2-1200x630.png`
- **Visual similarity group:** VSG-TRANSIT
- **Currently uses:** blog-archive.png
- **Notes:** Held at P3: dated 2020 regional survey. SERIES: Part 2 of 3 with recs 119 (Part 1) and 117 (Part 3). CONTENT MISMATCH FLAG — the most serious in the batch: this page's meta description and the site's cross-links describe it as "how Ambimat Electronics has approached automated fare collection: validators, SAM-backed offline trust, and revenue assurance", but the body contains none of that — it is a UK/Germany/Russia/Brazil/Mexico survey. Briefed to actual body content; the description warrants human review independently of the image work.

## 119 — Public Transport Ticketing (Part 1) (Archive 2020)

- **Record number:** 119
- **Page name:** Public Transport Ticketing System (Part-1)
- **Canonical URL:** https://ambisecure.ambimat.com/blog/archive/public-transport-ticketing-part-1/
- **Section:** Blog
- **Page type:** INDUSTRY ARTICLE
- **Primary topic:** Transit security | **Secondary:** Smart cards; NFC
- **Design priority:** P3
- **Approved headline:** Asia's Fare Systems Chose Differently
- **Alternative headline:** What Each AFC Architecture Optimised For
- **Category label:** BLOG
- **Core message:** Asia's major fare-collection networks each optimised for something different — interoperability, coverage, or retail reach — and their architectures still show it.
- **Audience:** Transit-system architect
- **Diagram type:** COMPARISON
- **Visual concept:** Dominant object: a five-column comparison strip, one column per network, each headed by its card and footed by the single design goal it optimised for. Five nodes only: (1) India NCMC — interoperable open-loop EMV-based contactless, spanning transport, toll and retail, (2) China Yikatong — phone-based contactless replacing the magnetic-strip barrier era, (3) Saudi Arabia Riyadh — one system spanning on-board bus sale and validation plus metro station access control, (4) South Korea T-money — boarding and transfer data aggregated wirelessly at the depot rather than authorised live, (5) Japan Suica / Pasmo — FeliCa closed-loop, interoperable across 52 rail and 96 bus operators. Inside hardware: card keys in each chip. External comms: the tap, and the later aggregation of ride records. Labels allowed: "NCMC", "Yikatong", "Riyadh", "T-money", "Suica / Pasmo", plus a small "Part 1 of 3" corner tag. Variation within VSG-TRANSIT: a per-network optimisation comparison — distinct from Part 2's converging validator and Part 3's retail radiation.
- **Avoid:**
    - Do not show NCMC and Suica as the same model — NCMC is interoperable open-loop EMV-based, Suica/Pasmo are Sony FeliCa closed-loop
    - Do not tag this image Part 2 or Part 3 — this is Part 1 of the three-part AFC series (India, China, Saudi Arabia, South Korea, Japan, South Africa)
    - Do not draw satellites over the T-money flow — the 2020 body's "satellite location data" phrasing is garbled legacy copy, and the real mechanism is wireless aggregation to a depot access point, never a live online authorisation
    - Do not print the body's 2020 counts (80 million cards, 30,641 shops) as current figures
- **Alt text:** Five-column comparison of NCMC, Yikatong, Riyadh, T-money and Suica fare architectures, showing what each Asian network optimised for and where card keys stay.
- **Export filename:** `ambisecure-blog-archive-public-transport-ticketing-part-1-1200x630.png`
- **Visual similarity group:** VSG-TRANSIT
- **Currently uses:** blog-archive.png
- **Notes:** Held at P3: dated 2020 regional survey. SERIES: Part 1 of 3 with recs 118 (Part 2) and 117 (Part 3) — note the parts split by GEOGRAPHY, not by theme, despite intros implying otherwise; briefed to actual body. Body covers six regions; South Africa dropped from the visual to honour the five-node cap. Legacy-copy hazard flagged: the T-money "satellite location data" line is nonsense and must not be illustrated literally.

## 120 — Challenges to IoT Security (Part 2) (Archive 2020)

- **Record number:** 120
- **Page name:** Challenges to IoT Security (Part 2)
- **Canonical URL:** https://ambisecure.ambimat.com/blog/archive/iot-security-challenges-part-2/
- **Section:** Blog
- **Page type:** SECURITY ANALYSIS
- **Primary topic:** IoT security | **Secondary:** Device identity; Embedded security
- **Design priority:** P3
- **Approved headline:** You Can't Patch What You Can't See
- **Alternative headline:** The IoT Gaps That Stay Invisible
- **Category label:** SECURITY EXPLAINER
- **Core message:** The hardest IoT security problems are post-deployment blind spots — compromise that nobody observes, on devices nobody monitors, running firmware nobody updates.
- **Audience:** Device-security architect
- **Diagram type:** DEVICE NETWORK
- **Visual concept:** Dominant object: a fleet grid of deployed devices seen from above, where only a thin minority are instrumented and legible — the rest fade toward unobservable. Five nodes only: (1) the compromised device sitting silent in the grid, indistinguishable from its neighbours because it never announces its own compromise, (2) the data path hopping device→mobile→cloud, where records leak in transit across hands, (3) the stale firmware marker, showing known exploits still live because updates are infrequent, (4) the small-scale target — a printer or camera — sitting deliberately under the detection threshold that catches large breaches, (5) the connected vehicle as the high-consequence tail of the same fleet. Inside hardware: deliberately little — the missing trust anchor is the argument, drawn as an unpopulated slot rather than a claimed fix. External comms: the multi-hop data path. Labels allowed: "Unseen", "Data in transit", "Stale firmware", "Small-scale", "Vehicle". Variation within VSG-THREAT-LANDSCAPE: a post-deployment fleet-observability grid — the companion Part 1 image owns the single-device attack-surface fan-out.
- **Avoid:**
    - Do not brief this as the mitigations half of the series — the modern intro promises hardware root of trust, signed update and attestation, but the 2020 body lists further challenges and never delivers them
    - Do not tag this image Part 1 — this is Part 2 of the two-part IoT security series
    - Do not show blockchain or AI as a proven IoT security fix — the body mentions them only as things some organisations try
    - Do not depict a compromised device visibly signalling its own compromise — the page's whole point is that it does not
    - Do not imply an AmbiSecure secure element closes every gap shown
- **Alt text:** Fleet grid where a compromised IoT device stays indistinguishable from its neighbours, mapping the blind spots hardware-rooted identity is meant to narrow.
- **Export filename:** `ambisecure-blog-archive-iot-security-challenges-part-2-1200x630.png`
- **Visual similarity group:** VSG-THREAT-LANDSCAPE
- **Currently uses:** blog-archive.png
- **Notes:** Held at P3: 2020 threat enumeration, low differentiation. SERIES: Part 2 of 2 with rec 121 — shared VSG-THREAT-LANDSCAPE, distinct node sets (Part 1 = single-device attack surface, Part 2 = fleet observability); part tags must be correct. CONTENT MISMATCH FLAG: the page's modern intro and every cross-link describe Part 2 as "practical mitigations: hardware root of trust, signed firmware update, attestation", but the body headings are all further challenges. Briefed to the body; the framing gap warrants human review. Consolidation candidate with recs 116 and 121.

## 121 — Challenges to IoT Security (Part 1) (Archive 2020)

- **Record number:** 121
- **Page name:** Challenges to IoT Security (Part 1)
- **Canonical URL:** https://ambisecure.ambimat.com/blog/archive/iot-security-challenges-part-1/
- **Section:** Blog
- **Page type:** SECURITY ANALYSIS
- **Primary topic:** IoT security | **Secondary:** Device identity; Embedded security; Secure Elements
- **Design priority:** P3
- **Approved headline:** Default Passwords Still Run the Botnets
- **Alternative headline:** A Billion Devices, A Billion Vectors
- **Category label:** SECURITY EXPLAINER
- **Core message:** A billion IoT devices talk to enterprise systems on default credentials, stale firmware, and unencrypted links — an attack surface that needs a trust anchor, not a patch.
- **Audience:** Device-security architect
- **Diagram type:** CONCEPTUAL ILLUSTRATION
- **Visual concept:** Dominant object: one exposed IoT device at centre, with its attack surface fanning outward as labelled vectors rather than as a network. Five nodes only: (1) default credentials — literal "admin / password" — feeding a Mirai-style botnet recruitment arrow, (2) outdated firmware, left unpatched because manufacturers prioritise new devices over updates, (3) the missing encryption on a constrained link, where storage and processing headroom simply is not there, (4) the WAN segment — smart meters and street lights — where one trusted device compromised takes the municipal estate with it, (5) the empty trust-anchor slot on the die, drawn as unpopulated silicon where a device key in a secure element belongs. Inside hardware: nothing yet — that absence is the argument. External comms: the plaintext link leaving the device. Labels allowed: "admin / password", "Firmware", "No encryption", "WAN", "Trust anchor". Variation within VSG-THREAT-LANDSCAPE: a single-device attack-surface fan-out — the companion Part 2 image owns the fleet-observability grid.
- **Avoid:**
    - Do not tag this image Part 2 — this is Part 1 of the two-part IoT security series, covering attack surface rather than mitigations
    - Do not draw phishing as a chip-level or on-device exploit — the body frames it as a vector against the operators and cloud consoles around the fleet
    - Do not show "lack of encryption" as fixable in software alone on constrained devices with no key store — the body's point is the headroom does not exist
    - Do not name or depict a real vendor's product as the Mirai-vulnerable device
    - Do not imply AmbiSecure scans, audits, or monitors deployed IoT fleets — the offering is hardware-rooted device identity
- **Alt text:** One IoT device with its attack surface fanned out — default credentials, stale firmware, plaintext links — and the empty slot where a trust anchor belongs.
- **Export filename:** `ambisecure-blog-archive-iot-security-challenges-part-1-1200x630.png`
- **Visual similarity group:** VSG-THREAT-LANDSCAPE
- **Currently uses:** blog-archive.png
- **Notes:** Held at P3: 2020 threat enumeration with dated case studies. SERIES: Part 1 of 2 with rec 120 — visually kin, node sets deliberately disjoint. Mirai reference is accurate to the body and safe as long as no real product is depicted. Consolidation candidate with recs 116 and 120 as a single durable IoT-security piece.

## 122 — Lava Lamps and Cryptographic Entropy
- **Record number:** 122
- **Page name:** Lava Lamps and Cryptographic Entropy: Inside the Wall of Entropy
- **Canonical URL:** https://ambisecure.ambimat.com/blog/lava-lamps-and-cryptographic-entropy/
- **Section:** Blog
- **Page type:** TECHNICAL EXPLAINER
- **Primary topic:** Other | **Secondary:** Secure Elements; PKI; V2X
- **Design priority:** P2
- **Approved headline:** Chaos in a Lobby, Entropy in Silicon
- **Alternative headline:** Every Key Starts as Physical Noise
- **Category label:** TECHNICAL ARTICLE
- **Core message:** Cloudflare's lava-lamp wall is one photogenic input to a much larger entropy pipeline, and the same TRNG-seeds-CSPRNG pattern sits inside every secure element behind FIDO, V2X, eSIM and smart cards.
- **Audience:** Security practitioner
- **Diagram type:** CONCEPTUAL ILLUSTRATION
- **Visual concept:** Dominant object: two parallel entropy pipelines rendered in the same shape to make the architectural rhyme the point. Upper pipeline: lava-lamp wall (chaotic convection plus camera sensor noise) to raw multi-MB frame to SHA-256 digest to entropy pool. Lower pipeline: on-chip thermal-noise TRNG inside a secure-element boundary to conditioning to CSPRNG seed. Exactly five nodes across both: physical source, raw sample, hash conditioning, pool/seed, and the CSPRNG that produces the working key material. Inside hardware: the lower pipeline entirely — the SE's TRNG output never leaves as raw entropy. Externally: only keys and nonces derived downstream. Allowed labels: TRNG, CSPRNG, SHA-256, entropy pool, LavaRand. Must not imply the lava wall feeds any device's secure element.
- **Avoid:**
    - Do not draw the lava-lamp wall seeding a secure element, a FIDO key or an eSIM — the SE has its own on-chip TRNG
    - do not present LavaRand as Cloudflare's sole entropy source, it is one input to a pool
    - do not imply AmbiSecure operates a lava-lamp wall or a Cloudflare facility
    - do not show a TRNG delivering the gigabit throughput that belongs to the CSPRNG
    - do not depict the entropy pool as a key store
- **Alt text:** Cloudflare's lava-lamp wall and a secure element's on-chip thermal TRNG follow the same pipeline shape: physical noise, hashing, then a seeded CSPRNG.
- **Export filename:** `ambisecure-blog-lava-lamps-and-cryptographic-entropy-1200x630.png`
- **Visual similarity group:** VSG-ENTROPY-PIPELINE
- **Currently uses:** blog.png
- **Notes:** Third-party brand (Cloudflare) is central to the hook; keep any lava-lamp rendering generic and unbranded, and keep the LavaRand facts attributable to Cloudflare's public Learning Center page. Human review suggested on brand depiction.

## 123 — How V2X PKI Works

- **Record number:** 123
- **Page name:** How V2X PKI Works: EA, AA, Pseudonymous Certificates, Lifecycle
- **Canonical URL:** https://ambisecure.ambimat.com/blog/how-v2x-pki-works/
- **Section:** Blog
- **Page type:** STANDARDS EXPLAINER
- **Primary topic:** V2X | **Secondary:** PKI; Certificate lifecycle; Connected mobility
- **Design priority:** P1
- **Approved headline:** Two Authorities Keep the Vehicle Anonymous
- **Alternative headline:** Certificates That Expire in Minutes
- **Category label:** ARCHITECTURE
- **Core message:** V2X PKI diverges from web PKI by design: two issuing authorities split identity from authorisation so a signed safety message proves certified hardware without revealing which vehicle sent it.
- **Audience:** Automotive-security engineer
- **Diagram type:** TRUST CHAIN
- **Visual concept:** Dominant object: the deliberate fork in the V2X hierarchy — a single Root CA splitting into Enrolment Authority and Authorisation Authority, the split drawn as the architectural centre rather than an implementation detail. Five nodes: Root CA, EA, AA, the ITS station (OBU) with its secure element, and the CRL/CTL distribution channel. Flow: EA issues one long-lived Enrolment Credential; AA issues batches of short-lived Pseudonym Certificates; the OBU signs a CAM at 10 Hz with the current PC. Inside hardware: the EC and the active PC batch, held in the OBU's tamper-resistant secure element. Externally: only signed messages on PC5 sidelink and pre-distributed revocation material. Variation within VSG-V2X-NETWORK: this is the hierarchy-and-fork view, not a road scene or a per-device lifecycle line. Allowed labels: Root CA, EA, AA, EC, PC, HashedId8, CAM, CRL/CTL, IEEE 1609.2, ETSI TS 102 941.
- **Avoid:**
    - Do not let the EA see which PC the AA issued, or the AA see the vehicle's enrolment identity — the split is the privacy property
    - do not show a pseudonym certificate carrying a plate, VIN or owner identity
    - do not draw OCSP or any real-time online lookup on the PC5 sidelink verification path
    - do not swap the credential types — EA issues the EC, AA issues PC batches
    - do not show private keys leaving the OBU's secure element during Butterfly Key Expansion
- **Alt text:** The V2X trust fork: an Enrolment Authority and an Authorisation Authority split identity from authorisation so an OBU's signed CAM proves hardware, not identity.
- **Export filename:** `ambisecure-blog-how-v2x-pki-works-1200x630.png`
- **Visual similarity group:** VSG-V2X-NETWORK
- **Currently uses:** blog.png

## 124 — Device Identity at Manufacturing Scale
- **Record number:** 124
- **Page name:** Device Identity at Manufacturing Scale
- **Canonical URL:** https://ambisecure.ambimat.com/blog/device-identity-at-manufacturing-scale/
- **Section:** Blog
- **Page type:** ARCHITECTURE ARTICLE
- **Primary topic:** Provisioning | **Secondary:** Device identity; Certificate lifecycle; IoT security
- **Design priority:** P1
- **Approved headline:** One Million Devices, One Million Keys
- **Alternative headline:** The Line Decides the Fleet's Identity
- **Category label:** ARCHITECTURE
- **Core message:** A million non-clonable device identities demand HSM-derived per-device keys, SCP03 custody on the personalisation line, OTA rotation without recall, and revocation tuned to each connectivity tier.
- **Audience:** Device-security architect
- **Diagram type:** LIFECYCLE
- **Visual concept:** Dominant object: a horizontal credential lifecycle spine running left to right across the whole frame, from factory to field. Five nodes: HSM cluster under split-knowledge custody deriving per-device material, personalisation host forwarding wrapped APDUs, SE programmer stations (1..N parallel) applying them under an SCP03 session, the append-only audit log capturing serial/operator/timestamp/attestation hash, and the fielded device doing OTA rotation under cryptographic continuity. A short branch off the field node fans revocation into three connectivity tiers: always-connected polls, intermittent refreshes on contact, offline pre-distributes. Inside hardware: the per-device key generated inside the SE boundary and never emitted. Externally: wrapped APDUs, attestation responses, audit entries. Variation within VSG-PKI-LIFECYCLE: factory-to-field spine with a revocation fan-out.
- **Avoid:**
    - Do not show a plaintext key in the personalisation host, the programmer, or any manufacturing log
    - do not depict one shared master key burned into every unit — per-device derivation is the whole architecture
    - do not show per-device keys generated on the host rather than derived in the HSM and generated inside the SE boundary
    - do not draw OTA rotation as requiring return-to-base
    - do not give offline fleets a live revocation lookup
- **Alt text:** Factory-to-field identity: HSM-derived per-device keys land inside secure elements over SCP03, leave an append-only audit trail, then rotate over the air.
- **Export filename:** `ambisecure-blog-device-identity-at-manufacturing-scale-1200x630.png`
- **Visual similarity group:** VSG-PKI-LIFECYCLE
- **Currently uses:** blog.png

## 125 — Why Software-Only Device Trust Fails
- **Record number:** 125
- **Page name:** Why Software-Only Device Trust Fails
- **Canonical URL:** https://ambisecure.ambimat.com/blog/why-software-only-device-trust-fails/
- **Section:** Blog
- **Page type:** SECURITY ANALYSIS
- **Primary topic:** Embedded security | **Secondary:** Device identity; IoT security; Secure Elements
- **Design priority:** P1
- **Approved headline:** The Environment, Not the Algorithm
- **Alternative headline:** Field Devices Break Software-Only Trust
- **Category label:** SECURITY EXPLAINER
- **Core message:** Software-only device trust fails not because the cryptography is weak but because field deployment hands attackers physical access and unlimited time — a structural mismatch, not an implementation defect.
- **Audience:** Embedded engineer
- **Diagram type:** HARDWARE CUTAWAY
- **Visual concept:** Dominant object: a cutaway of a field-deployed board — MCU with internal flash plus an external SPI flash chip — annotated with the physical extraction vectors the page names. Five nodes maximum: exposed JTAG/SWD debug pads, external SPI flash under a SOIC clip, the MCU holding the decryption key, the firmware image, and the fleet of cloned devices that one extracted key produces. The flow runs bench equipment to flash contents to key to fleet-wide clone, showing why 'rare per machine' becomes 'certain across the fleet'. Nothing here is inside a protected boundary — that absence is the point; a small inset shows what a tamper-resistant boundary would have contained. Variation within VSG-THREAT-LANDSCAPE: a physical board teardown, distinct from rec 63's cost ladder. Allowed labels: JTAG, SWD, SPI flash, lock bits, ECDSA-P256.
- **Avoid:**
    - Do not suggest the cryptography is broken — the page is explicit that ECDSA-P256 over SHA-256 is sound
    - the key's location is the flaw
    - do not equate a TPM with a secure element, the page ranks them separately
    - do not show an attacker on the network as the primary threat when the model is physical access with unlimited dwell time
    - do not imply lock bits alone defeat flash extraction
- **Alt text:** A field device teardown showing why firmware-stored keys fall: exposed debug pads, an external SPI flash under a clip, and one extraction cloning a whole fleet.
- **Export filename:** `ambisecure-blog-why-software-only-device-trust-fails-1200x630.png`
- **Visual similarity group:** VSG-THREAT-LANDSCAPE
- **Currently uses:** blog.png

## 126 — EU Cyber Resilience Act for IoT & Hardware
- **Record number:** 126
- **Page name:** EU Cyber Resilience Act: What It Means for Connected Hardware and IoT Manufacturers
- **Canonical URL:** https://ambisecure.ambimat.com/blog/eu-cyber-resilience-act-connected-hardware-iot/
- **Section:** Blog
- **Page type:** INDUSTRY ARTICLE
- **Primary topic:** IoT security | **Secondary:** Embedded security; Device identity; Smart cities
- **Design priority:** P1
- **Approved headline:** Two CRA Dates, Long Hardware Lead Times
- **Alternative headline:** Security Becomes a Product Requirement
- **Category label:** BLOG
- **Core message:** The EU Cyber Resilience Act makes cybersecurity a whole-life product requirement for anything connected, and the hardware decisions behind it have to be made well before the 2027 deadline.
- **Audience:** Connected-product OEM
- **Diagram type:** TIMELINE
- **Visual concept:** Dominant object: a horizontal compliance timeline with two hard anchors marked — 11 September 2026 (reporting obligations for actively exploited vulnerabilities and severe incidents) and 11 December 2027 (main body of manufacturer obligations). Beneath the line, a hardware programme's lead-time bars run backwards from those dates and visibly start before today: silicon selection, provisioning-line build, certification. Five nodes: the two dates, plus the three lead-time bars. The visual argument is that the gap between the dates is not slack. Nothing inside a hardware boundary here; the external flow is documentation and evidence heading toward conformity assessment. Allowed labels: the two dates verbatim, 'products with digital elements', 'secure by design and by default'. Must not depict AmbiSecure as issuing or granting conformity.
- **Avoid:**
    - Do not show a CE mark being applied or granted by AmbiSecure — conformity assessment is the manufacturer's process
    - do not state a product class (default, important, critical) for any device, the page defers that to official EU text
    - do not imply buying a component confers CRA compliance
    - do not present the two dates as one deadline or reorder them
    - do not frame this article as legal advice
- **Alt text:** The CRA calendar for connected hardware: reporting duties from September 2026, manufacturer obligations from December 2027, and the silicon lead times behind both.
- **Export filename:** `ambisecure-blog-eu-cyber-resilience-act-connected-hardware-iot-1200x630.png`
- **Visual similarity group:** VSG-TIMELINE
- **Currently uses:** blog.png
- **Notes:** Regulatory content — the page carries an explicit disclaimer that AmbiSecure products do not replace conformity assessment or legal review. Image must not weaken that. Related to rec 127 (same CRA cluster) but distinct angle: 126 is scope and dates, 127 is the trust-layer architecture. Not a consolidation candidate.

## 127 — CRA Secure by Design: Hardware-Backed Trust
- **Record number:** 127
- **Page name:** Secure by Design Under the CRA: Why Hardware-Backed Trust Matters
- **Canonical URL:** https://ambisecure.ambimat.com/blog/cra-secure-by-design-hardware-backed-trust/
- **Section:** Blog
- **Page type:** TECHNICAL EXPLAINER
- **Primary topic:** Embedded security | **Secondary:** Device identity; IoT security; Smart cities
- **Design priority:** P1
- **Approved headline:** Can an Attacker Extract Your Keys
- **Alternative headline:** Secure by Design Starts in Silicon
- **Category label:** SECURITY EXPLAINER
- **Core message:** Secure by design, for connected hardware, reduces to one question a patch cannot answer later — can an attacker holding the device extract its keys — and that is settled by the trust layer in silicon.
- **Audience:** Device-security architect
- **Diagram type:** TRUST CHAIN
- **Visual concept:** Dominant object: a smart-city or IoT node with the AmbiSEC module drawn as the root of a trust chain rising through the stack — hardware root of trust, non-extractable per-device key, authenticated firmware verifier, then application firmware at the top. Five nodes: AmbiSEC root of trust, per-device identity key, secure OTA update verifier, application firmware, and the back end that distinguishes a genuine device from a clone. The four design-time questions the page poses (where keys live, per-device identity, update authentication, rotation and revocation) annotate the chain. Inside hardware: the private key and the verifier's root key, both below the firmware line. Externally: signed attestations and authenticated update packages. Variation within VSG-IOT-DEVICE: a bottom-up trust chain anchored in a named module, not a device network or a factory line.
- **Avoid:**
    - Do not show application firmware able to read the private key — the page's core question is precisely that it cannot
    - do not place the update-verification root key in rewritable firmware
    - do not depict AmbiSEC as delivering CRA compliance or conformity assessment, the page says it supports readiness only
    - do not show a shared master key across the node population
    - do not imply a firmware update can retrofit a hardware root of trust
- **Alt text:** AmbiSEC as the trust layer under a connected node: keys and the update verifier sit below the firmware line, so application code can never read what it protects.
- **Export filename:** `ambisecure-blog-cra-secure-by-design-hardware-backed-trust-1200x630.png`
- **Visual similarity group:** VSG-IOT-DEVICE
- **Currently uses:** blog.png
- **Notes:** Regulatory adjacency — page carries an explicit CRA disclaimer; the image must not imply compliance is conferred by AmbiSEC. Pairs with rec 126; keep the two visually distinct (126 = dates timeline, 127 = silicon trust chain).

## 128 — CRA Vulnerability Handling & Lifecycle
- **Record number:** 128
- **Page name:** CRA Vulnerability Handling and Product Lifecycle Security: What Manufacturers Need to Prepare
- **Canonical URL:** https://ambisecure.ambimat.com/blog/cra-vulnerability-handling-product-lifecycle-security/
- **Section:** Blog
- **Page type:** STANDARDS EXPLAINER
- **Primary topic:** IoT security | **Secondary:** Device identity; Certificate lifecycle; Embedded security
- **Design priority:** P1
- **Approved headline:** CRA Reporting Clock Starts September 2026
- **Alternative headline:** The Update Channel Is the Obligation
- **Category label:** SECURITY EXPLAINER
- **Core message:** The CRA turns vulnerability handling into a continuous obligation across a declared support period, and the evidence and update channel must exist before the 11 September 2026 reporting date.
- **Audience:** Connected-product OEM
- **Diagram type:** LIFECYCLE
- **Visual concept:** Dominant object is a horizontal support-period rail running left to right, with the product ship date at the left and the declared end-of-support at the right; two date markers sit on the rail, 11 Sep 2026 (reporting obligations) and 11 Dec 2027 (main obligations). The technical flow is the staged notification model branching upward off the rail at an 'awareness' point: five nodes only — Awareness, Early-warning notification, Fuller notification (~72 h), Final report, and the signed update pushed back down to the fielded device. What stays inside hardware is the update-verification trust anchor and the device key held in the secure element, drawn as a small sealed block on the rail; what communicates externally is the notification arrow to the authority and the coordinated-disclosure inbox arrow inbound from a researcher. Allowed labels: CRA, 11 Sep 2026, 11 Dec 2027, ~72 h, SBOM, support period. Must not imply the timeline is a certified compliance path or that AmbiSecure performs conformity assessment. Within VSG-TIMELINE this is the only concept built on a regulatory date rail with an inbound disclosure channel.
- **Avoid:**
    - Do not depict CRA compliance as a product or certificate AmbiSecure can supply
    - do not present the ~72 h staged timeline as exact statutory text rather than the planning shape
    - do not draw an SBOM as a vulnerability scanner or as automatic remediation
    - do not show the update arriving without signature verification inside the device
- **Alt text:** Staged CRA reporting timeline from awareness to final report, with the support-period rail and the signed update channel a connected product must keep open.
- **Export filename:** `ambisecure-blog-cra-vulnerability-handling-product-lifecycle-security-1200x630.png`
- **Visual similarity group:** VSG-TIMELINE
- **Currently uses:** blog.png
- **Notes:** Page carries an explicit legal disclaimer (no conformity assessment, no legal review). Keep the image strictly architectural — no compliance-badge imagery.

## 129 — AmbiSecure Products & CRA Readiness
- **Record number:** 129
- **Page name:** Mapping AmbiSecure Products to CRA Readiness: AmbiSEC, ONE Pass, BioKey and Secure Identity
- **Canonical URL:** https://ambisecure.ambimat.com/blog/ambisecure-products-cra-readiness/
- **Section:** Blog
- **Page type:** PRODUCT EDUCATION
- **Primary topic:** Device identity | **Secondary:** Secure Elements; Phishing-resistant authentication; IoT security
- **Design priority:** P1
- **Approved headline:** CRA Is Not a Product You Buy
- **Alternative headline:** Where AmbiSEC, OnePass and BioKey Fit
- **Category label:** TECHNICAL ARTICLE
- **Core message:** CRA readiness is a process obligation, but several CRA-aligned security needs map cleanly onto AmbiSecure building blocks — AmbiSEC device identity and key storage, OnePass and FIDO for phishing-resistant access, BioKey for user authentication.
- **Audience:** Technical evaluator
- **Diagram type:** COMPARISON
- **Visual concept:** Dominant object is a three-column mapping table — CRA-aligned need | product-security challenge | AmbiSecure building block — rendered as stacked cards rather than a grid, with the foundation rows visually weighted at the bottom. The relationship is bottom-up dependency: five rows only — Hardware-backed device identity (AmbiSEC), Secure key storage & on-chip crypto (AmbiSEC), Phishing-resistant access (FIDO validation server + OnePass), Multi-application credential (OnePass: DESFire + FIDO + NDEF), Secure user authentication (BioKey). What stays inside hardware is the per-device key generated in and never leaving the tamper-resistant secure element, drawn as a sealed cell inside the AmbiSEC rows; what communicates externally is the attested identity assertion and the sign/verify result leaving the module, never the key. Allowed labels: AmbiSEC, OnePass, BioKey, FIDO2, PIV, DESFire, NDEF. Must not imply the table is a compliance checklist or that any row discharges a CRA obligation. Within VSG-COMPARISON-MATRIX this is the need-to-product mapping variant; rec 132 is the credential-class matrix.
- **Avoid:**
    - Do not render the mapping as a compliance checklist with ticks or a CRA conformity badge
    - do not show private keys reaching application firmware from AmbiSEC
    - do not show OnePass as separate cards per function when the point is one credential carrying DESFire, FIDO and NDEF
    - do not attribute certifications or conformity assessment to AmbiSecure products
- **Alt text:** Mapping table pairing CRA-aligned security needs with AmbiSecure building blocks — AmbiSEC device identity, OnePass credentials and BioKey user authentication.
- **Export filename:** `ambisecure-blog-ambisecure-products-cra-readiness-1200x630.png`
- **Visual similarity group:** VSG-COMPARISON-MATRIX
- **Currently uses:** blog.png
- **Notes:** ACCURACY FLAG: this page writes 'ONE Pass' (20 occurrences) while the rest of the site uses 'OnePass' (445 occurrences). Brief uses OnePass per spec; recommend a human fix on the page body for consistency.

## 130 — Secure Elements in Connected Vehicles
- **Record number:** 130
- **Page name:** Secure Elements in Connected Vehicles
- **Canonical URL:** https://ambisecure.ambimat.com/blog/secure-elements-in-connected-vehicles/
- **Section:** Blog
- **Page type:** ARCHITECTURE ARTICLE
- **Primary topic:** Secure Elements | **Secondary:** V2X; Connected mobility; Embedded security
- **Design priority:** P1
- **Approved headline:** The Keys Cannot Live in Software
- **Alternative headline:** Nano-Card or MFF2: The OBU Decision
- **Category label:** ARCHITECTURE
- **Core message:** In field-deployed OBUs and RSUs the attacker has physical access and unlimited time, so identity has to be rooted in a discrete tamper-resistant secure element rather than in firmware.
- **Audience:** Automotive-security engineer
- **Diagram type:** HARDWARE CUTAWAY
- **Visual concept:** Dominant object is a cutaway of a discrete secure element seated on an OBU board, drawn as a tamper boundary containing a CPU with secure RAM, a non-extractable key store, and a crypto coprocessor. The relationship is a narrow command surface: five nodes only — tamper boundary, key store, crypto engine, host MCU outside the boundary, and the PC5 antenna beyond it. What stays inside hardware is every private key and every signing operation; the boundary is crossed only by a command in and a signature or verify result out. What communicates externally is the signed V2X message leaving via the host MCU to the antenna, plus a signed-boot measurement arrow. Allowed labels: MFF2, nano-card, ISO/IEC 7816, I2C/SPI, EC/PC key store, PC5. Must not imply the SE is a general-purpose coprocessor running application code. Within VSG-SE-ARCHITECTURE this is the single-die cutaway inside a vehicle unit; rec 133 is the three-zone siting comparison.
- **Avoid:**
    - Do not draw any key or key material crossing the tamper boundary to the host MCU or flash
    - do not render the secure element as a rack-mount HSM or a motherboard TPM
    - do not show contact pads or a removable socket on a solder-down MFF2 package
    - do not depict the SE as executing OBU application firmware rather than a narrow key-custody command set
- **Alt text:** Cutaway of a tamper-resistant secure element inside a V2X on-board unit, showing key custody that stays on-chip while the host MCU only passes commands.
- **Export filename:** `ambisecure-blog-secure-elements-in-connected-vehicles-1200x630.png`
- **Visual similarity group:** VSG-SE-ARCHITECTURE
- **Currently uses:** blog.png
- **Notes:** Body attributes CC EAL6+ to the underlying secure-element silicon at chip level, not to AmbiSecure as a vendor certification — do not put a certification badge on the image.

## 131 — Pseudonymous Certificates and Privacy in V2X
- **Record number:** 131
- **Page name:** Pseudonymous Certificates and Privacy in V2X
- **Canonical URL:** https://ambisecure.ambimat.com/blog/pseudonymous-certificates-and-privacy/
- **Section:** Blog
- **Page type:** TECHNICAL ARTICLE
- **Primary topic:** V2X | **Secondary:** PKI; Certificate lifecycle; Connected mobility
- **Design priority:** P2
- **Approved headline:** Authentication Without Identification
- **Alternative headline:** Butterfly Keys Break the Tracking Link
- **Category label:** TECHNICAL ARTICLE
- **Core message:** Pseudonymous Certificates decouple authentication from identification, so a V2X fleet can sign every safety message without handing roadside observers a tracking primitive.
- **Audience:** Automotive-security engineer
- **Diagram type:** IDENTITY FLOW
- **Visual concept:** Dominant object is the two-persona split inside one vehicle: a long-lived Enrolment Credential sealed in the secure element on one side, a rotating batch of Pseudonymous Certificates on the other. The flow runs across five nodes only — SE holding the EC, Enrolment Authority (sees entitlement, never signs messages), Authorisation Authority (issues the PC batch, cannot link back to the EC), the active PC signing a CAM, and a passive roadside observer whose reconstructed trajectory breaks into disconnected fragments at each rotation. What stays inside hardware is both the EC and every PC private key, with rotation cadence enforced SE-side; what communicates externally is the signed CAM carrying a certificate with no device identifier. Allowed labels: EC, PC, EA, AA, CAM, <10 min rotation. Must not imply AmbiSecure operates any authority in this chain. Within VSG-V2X-NETWORK this is the privacy-persona flow, distinct from any coverage or roadside-topology view.
- **Avoid:**
    - Do not show the Enrolment Credential signing V2X messages directly — it only proves entitlement
    - do not place a device identifier or VIN inside a Pseudonymous Certificate
    - do not depict AmbiSecure as operating the Root CA, Enrolment Authority, Authorisation Authority or linkage authority
    - do not draw the observer reconstructing one unbroken trajectory, which is the failure case the architecture prevents
- **Alt text:** V2X privacy flow: an enrolment credential stays sealed in the secure element while rotating pseudonymous certificates sign messages carrying no device identifier.
- **Export filename:** `ambisecure-blog-pseudonymous-certificates-and-privacy-1200x630.png`
- **Visual similarity group:** VSG-V2X-NETWORK
- **Currently uses:** blog.png
- **Notes:** Page states an explicit boundary: AmbiSecure supplies SE silicon, applets and personalisation lines only. Deep architecture piece — strong editorially, narrower buyer pull than rec 130.

## 132 — Smart Cards vs FIDO Tokens vs Passkeys
- **Record number:** 132
- **Page name:** How to Choose Between Smart Cards, FIDO Tokens and Passkeys
- **Canonical URL:** https://ambisecure.ambimat.com/blog/smart-cards-vs-fido-tokens-vs-passkeys/
- **Section:** Blog
- **Page type:** COMPARISON
- **Primary topic:** Hardware security keys | **Secondary:** Passkeys; FIDO2; Smart cards
- **Design priority:** P1
- **Approved headline:** Device-Bound or Account-Bound Credentials
- **Alternative headline:** Not Interchangeable: Cards, Keys, Passkeys
- **Category label:** TECHNICAL ARTICLE
- **Core message:** Smart cards, dedicated FIDO keys and synced passkeys look interchangeable at the relying party but differ on extraction, recovery and attestation — and the recovery model is what actually decides the choice.
- **Audience:** Technical evaluator
- **Diagram type:** COMPARISON
- **Visual concept:** Dominant object is three headed columns — an ISO/IEC 7810 ID-1 smart card, a USB-plus-NFC FIDO key, and a phone holding a synced passkey — sitting over a compact matrix. The relationship is convergence then divergence: a single top row shows all three producing the same origin-bound WebAuthn assertion at the relying party, and the rows beneath them split. Five compared rows only: origin-bound (equal), private key extractable, loss of device, compromised cloud account, attestation-pinnable to certified hardware. What stays inside hardware is the private key for the card and the key, drawn sealed; for the synced passkey the key is held by the platform credential manager and shown replicating to a second device via an account-bound cloud. What communicates externally is only the signed assertion. Allowed labels: FIDO2, WebAuthn, ID-1, AAGUID, device-bound, account-bound. Within VSG-COMPARISON-MATRIX this is the credential-class matrix with a highlighted recovery row; rec 129 is the need-to-product mapping.
- **Avoid:**
    - Do not show any of the three as phishing-susceptible — all three are origin-bound under WebAuthn
    - do not draw a synced passkey as a physical device or conflate it with a device-bound passkey
    - do not give the dedicated FIDO key a multi-applet or PIV/APDU surface it does not have
    - do not show a private key leaving a smart card's secure element
- **Alt text:** Comparison of smart-card, FIDO security-key and synced-passkey credentials across extraction, loss recovery and attestation, all origin-bound at the relying party.
- **Export filename:** `ambisecure-blog-smart-cards-vs-fido-tokens-vs-passkeys-1200x630.png`
- **Visual similarity group:** VSG-COMPARISON-MATRIX
- **Currently uses:** blog.png
- **Notes:** Cornerstone comparison and the highest-value LinkedIn asset in this batch. Accuracy is load-bearing: the synced-passkey column must read as a deliberate design tradeoff, not a weakness.

## 133 — Secure Element vs TPM vs HSM

- **Record number:** 133
- **Page name:** Secure Element vs TPM vs HSM — Where Each Fits
- **Canonical URL:** https://ambisecure.ambimat.com/blog/secure-element-vs-tpm-vs-hsm/
- **Section:** Blog
- **Page type:** COMPARISON
- **Primary topic:** Secure Elements | **Secondary:** Embedded security; PKI; Attestation
- **Design priority:** P1
- **Approved headline:** Where the Key Lives Decides the Chip
- **Alternative headline:** An HSM Is Not a Secure Element
- **Category label:** TECHNICAL ARTICLE
- **Core message:** Secure elements, TPMs and HSMs are three chip classes built for three deployment contexts, and where the key has to live is what decides which one you pick.
- **Audience:** Security architect
- **Diagram type:** SYSTEM ARCHITECTURE
- **Visual concept:** Dominant object is a three-zone siting diagram read left to right, each zone drawn at its true physical scale: an embedded device (SE on the BOM, talking I2C/SPI or ISO/IEC 7816 to a host MCU), a PC motherboard (TPM 2.0 with PCR measured-boot registers bound to the boot chain), and a data-centre rack (HSM serving PKCS#11 clients). Five nodes only: SE, host MCU, TPM+PCRs, HSM, and the CA signing key held inside the HSM. The relationship is scale asymmetry — a throughput gauge under each zone shows a few ops per second for SE and TPM against tens of thousands for the HSM. What stays inside hardware in every zone is the key; what communicates externally is a signature, an attestation quote from the TPM, and a PKCS#11 call to the HSM. Allowed labels: TPM 2.0, PCR, PKCS#11, I2C/SPI, ISO/IEC 7816. Within VSG-SE-ARCHITECTURE this is the three-zone siting view; rec 130 is the single-die cutaway.
- **Avoid:**
    - Do not show a TPM as portable between machines or in a card form factor — it is soldered to one platform
    - do not place an HSM inside an embedded device or a card
    - do not show a secure element sustaining HSM-class bulk throughput
    - do not attach measured-boot PCRs or boot-chain attestation to the secure element
- **Alt text:** Three-zone diagram siting a secure element in a device, a TPM on a motherboard and an HSM in a rack, showing why key location decides the hardware class.
- **Export filename:** `ambisecure-blog-secure-element-vs-tpm-vs-hsm-1200x630.png`
- **Visual similarity group:** VSG-SE-ARCHITECTURE
- **Currently uses:** blog.png
- **Notes:** Certifications named in the body (CC EAL6+, FIPS 140-3 L3/L4) describe general industry classes, not AmbiSecure product claims — render as column text at most, never as a badge.

## 134 — Designing Secure Credential Lifecycle Management
- **Record number:** 134
- **Page name:** Designing Secure Credential Lifecycle Management
- **Canonical URL:** https://ambisecure.ambimat.com/blog/credential-lifecycle-management/
- **Section:** Blog
- **Page type:** ARCHITECTURE ARTICLE
- **Primary topic:** Certificate lifecycle | **Secondary:** Enterprise access; Attestation; Hardware security keys
- **Design priority:** P2
- **Approved headline:** Issuance Is 30% of the Work
- **Alternative headline:** Eight States Every Credential Lives Through
- **Category label:** ARCHITECTURE
- **Core message:** Credential programmes are designed around issuance and fail around everything else — rotation, recovery, revocation and attestation drift are the states that decide whether the programme survives production.
- **Audience:** IAM leader
- **Diagram type:** LIFECYCLE
- **Visual concept:** Dominant object is a credential state ring, with the easy forward arc drawn thin and the hard transitions drawn heavy. Five states carry labels: Personalised, Enrolled/Active, Suspended, Rotated-out, Revoked (with Destroyed as the ring's exit). The relationship is that the heavy arrows all leave Active — to suspension, to rotation, to revocation — and the article's point is that these, not issuance, are where programmes break. What stays inside hardware is the keypair generated on the secure element at personalisation, drawn as a sealed chip icon that never opens at any state; the attestation record captured at issuance travels alongside as a logged artifact, not as key material. What communicates externally is registration to relying parties and a revocation signal fanning out to them with visible propagation delay. Allowed labels: AAGUID, attestation, serial, batch ID. Within VSG-PKI-LIFECYCLE this is the credential state ring; rec 137 is the CA hierarchy view.
- **Avoid:**
    - Do not show an operator console generating or holding the private key — it is generated on the secure element
    - do not draw revocation as instantaneous at every relying party when propagation delay is the stated risk
    - do not present issuance as the terminal state of the ring
    - do not render the article's anonymised loss and helpdesk rates as AmbiSecure benchmarks
- **Alt text:** Credential state ring from personalisation through enrolment, rotation and revocation, showing where hardware credentials keep keys on-chip across every transition.
- **Export filename:** `ambisecure-blog-credential-lifecycle-management-1200x630.png`
- **Visual similarity group:** VSG-PKI-LIFECYCLE
- **Currently uses:** blog.png
- **Notes:** Body cites approximate anonymised operational figures (loss rates, helpdesk tickets). Keep numbers off the image entirely to avoid reading as vendor benchmarks.

## 135 — Why Transit Validators Need Offline Trust Architecture
- **Record number:** 135
- **Page name:** Why Transit Validators Need Offline Trust Architecture
- **Canonical URL:** https://ambisecure.ambimat.com/blog/transit-validators-offline-trust-architecture/
- **Section:** Blog
- **Page type:** ARCHITECTURE ARTICLE
- **Primary topic:** Transit security | **Secondary:** Smart cards; NFC; Secure Elements
- **Design priority:** P1
- **Approved headline:** The Gate Decides, Not the Backend
- **Alternative headline:** Master Keys Never Leave the SAM
- **Category label:** ARCHITECTURE
- **Core message:** Closed-loop transit works because the validator and card decide the tap locally against a SAM-held master key, so fare collection survives a backend outage without fail-open or fail-closed.
- **Audience:** Transit-system architect
- **Diagram type:** SYSTEM ARCHITECTURE
- **Visual concept:** Dominant object is a validator cutaway at a gate, with a DESFire card in the antenna field at the left and the backend at the right drawn behind a broken, greyed link. The flow crosses five nodes only: card, SAM (master key plus UID-diversified per-card key), host CPU marked as plumbing, the local SAM-MAC'd tap journal, and the unreachable backend. The relationship is that the mutual-auth handshake completes entirely between card and SAM with no backend round-trip, and the gate opens. What stays inside hardware is the master key and the key derivation inside the SAM — the host CPU never sees either. What communicates externally is the batched journal upload and the recent-revocations deny list, both drawn as dashed arrows that only flow when the link returns. Allowed labels: ISO/IEC 14443, DESFire EV2/EV3, AES-128, SAM, <300 ms. Within VSG-TRANSIT this is the offline-decision validator cutaway.
- **Avoid:**
    - Do not show the host CPU holding, seeing, or passing master keys
    - do not draw the backend as required to authorise a tap — that is the architecture the page argues against
    - do not show a contact interface on a contactless ISO/IEC 14443 tap
    - do not present the hot list as sufficient on its own when SAM-derived mutual auth is the first tier
- **Alt text:** Transit validator cutaway where a SAM derives per-card keys and completes DESFire mutual authentication offline, journaling each tap for later reconciliation.
- **Export filename:** `ambisecure-blog-transit-validators-offline-trust-architecture-1200x630.png`
- **Visual similarity group:** VSG-TRANSIT
- **Currently uses:** blog.png

## 136 — JavaCard Applet Development for Enterprise Identity
- **Record number:** 136
- **Page name:** JavaCard Applet Development for Enterprise Identity
- **Canonical URL:** https://ambisecure.ambimat.com/blog/javacard-applet-development-enterprise-identity/
- **Section:** Blog
- **Page type:** HOW-TO ARTICLE
- **Primary topic:** JavaCard | **Secondary:** Smart cards; APDU; Personalization
- **Design priority:** P1
- **Approved headline:** JavaCard Is Not Java
- **Alternative headline:** AID Design to SCP03 Personalisation
- **Category label:** TECHNICAL ARTICLE
- **Core message:** Shipping an enterprise JavaCard applet is embedded development with a Java surface — AID design, a rigid lifecycle, strict memory rules and GlobalPlatform plumbing decide whether it survives production.
- **Audience:** JavaCard developer
- **Diagram type:** LIFECYCLE
- **Visual concept:** Dominant object is the applet's path onto the card, drawn as a left-to-right rail: CAP file → GlobalPlatform LOAD → INSTALL (install() runs, storage allocated, AID registered) → SELECT by AID → PERSONALISE under SCP03 → LOCK. Five nodes only: CAP file, GP card manager, applet instance tagged with its AID split into RID (5 bytes) and PIX (0-11 bytes), the personalisation line's HSM, and the locked applet answering APDUs. What stays inside hardware is the per-card key material written under secure messaging and the process() dispatcher executing on the chip's crypto coprocessor. What communicates externally is the APDU exchange only — show a SELECT command in and status words 9000 on success, 6A82 on an unknown AID, coming back. Allowed labels: AID, RID, PIX, CAP, SCP02/SCP03, 9000, 6A82. Within VSG-APPLET-LIFECYCLE this is the only load-to-lock rail concept.
- **Avoid:**
    - Do not depict a garbage collector or steady-state object allocation — JavaCard forbids both
    - do not show applet keys readable over the APDU interface after personalisation
    - do not draw personalisation happening in the clear without SCP02/SCP03 secure messaging
    - do not show two co-resident applet versions sharing one AID when version belongs in the AID
- **Alt text:** JavaCard applet path from CAP file through GlobalPlatform load and install to SCP03 personalisation and lock, with AID selection over the APDU interface.
- **Export filename:** `ambisecure-blog-javacard-applet-development-enterprise-identity-1200x630.png`
- **Visual similarity group:** VSG-APPLET-LIFECYCLE
- **Currently uses:** blog.png
- **Notes:** Invented VSG — no listed family covers applet software lifecycle (VSG-CARD-HARDWARE is physical, VSG-PKI-LIFECYCLE is credentials). Pulls through to the JavaCard applets product and JavaCard development service.

## 137 — PKI Credential Issuance

- **Record number:** 137
- **Page name:** PKI Credential Issuance for Workforce and Government Identity
- **Canonical URL:** https://ambisecure.ambimat.com/blog/pki-credential-issuance-workforce-government/
- **Section:** Blog
- **Page type:** ARCHITECTURE ARTICLE
- **Primary topic:** PKI | **Secondary:** Certificate lifecycle; Attestation; Government identity
- **Design priority:** P1
- **Approved headline:** The CA Should Never Sign Blind
- **Alternative headline:** The Procedural Side Is Where PKI Breaks
- **Category label:** ARCHITECTURE
- **Core message:** The procedural side of PKI — CA/RA/VA roles, offline-root hierarchy, HSM key custody and attestation in the issuance flow — is what decides whether a workforce or government credential programme holds up.
- **Audience:** PKI engineer
- **Diagram type:** TRUST CHAIN
- **Visual concept:** Dominant object is a two-tier hierarchy stacked vertically, with an air-gap gap drawn literally as white space under the root. Five nodes only: offline root CA sealed in a vault-stored HSM (ceremony-only, signs the issuing CA and nothing else), issuing CA in a networked HSM, RA as the identity-verification and policy gate in front of it, VA publishing OCSP/CRL from an operationally separate box, and the subscriber's hardware credential at the bottom. The relationship that carries the image is the attestation gate on the RA→CA path: the CSR arrives paired with a hardware attestation, the CA checks it against the manufacturer's attestation root, and a refused path branches away when the chip class is not on the approved list. What stays inside hardware is the subscriber keypair generated on-chip and every CA signing key inside its HSM. What communicates externally is the CSR plus attestation upward, the signed certificate downward, and revocation status from the VA. Allowed labels: root CA, issuing CA, RA, VA, OCSP, CRL, CSR, M-of-N. Within VSG-PKI-LIFECYCLE this is the tiered hierarchy with an attestation gate; rec 134 is the credential state ring.
- **Avoid:**
    - Do not draw the root CA online, networked, or issuing end-entity certificates
    - do not show a CA signing key existing outside an HSM at any point including backup
    - do not show the subscriber's private key travelling inside the CSR — only the public key and attestation do
    - do not have the issuing CA serve its own revocation status when the VA is operationally separate
- **Alt text:** Two-tier PKI issuance architecture with an offline root, HSM-backed issuing CA, and an RA gate that checks hardware attestation before any certificate is signed.
- **Export filename:** `ambisecure-blog-pki-credential-issuance-workforce-government-1200x630.png`
- **Visual similarity group:** VSG-PKI-LIFECYCLE
- **Currently uses:** blog.png
- **Notes:** Supports the government-and-defence and enterprise-access industry pages; FIPS levels cited in body are deployment guidance, not AmbiSecure claims.

## 138 — Cyber Security Threats

- **Record number:** 138
- **Page name:** Cyber Security Threats — What Actually Matters in 2026
- **Canonical URL:** https://ambisecure.ambimat.com/blog/cyber-security-threats-overview/
- **Section:** Blog
- **Page type:** SECURITY ANALYSIS
- **Primary topic:** Phishing-resistant authentication | **Secondary:** Passwordless authentication; Hardware security keys; Device identity
- **Design priority:** P1
- **Approved headline:** Six Threats That Actually Drive Decisions
- **Alternative headline:** AitM Proxies Beat SMS, TOTP and Push
- **Category label:** SECURITY EXPLAINER
- **Core message:** The threat list is endless but the list that should drive identity and hardware-credential spending is short — and most of it is answered by origin-bound credentials and hardware-rooted identity.
- **Audience:** CISO
- **Diagram type:** CONCEPTUAL ILLUSTRATION
- **Visual concept:** Dominant object is a threat board of five tiles — AitM reverse-proxy phishing, MFA push fatigue, SIM swap, credential stuffing, device cloning / key extraction — each tile paired with the one control that answers it, all converging on a single origin-bound gate at the right. The relationship the image must carry is the AitM lane: the proxy relays the user's session to the real site and harvests the cookie, and SMS/TOTP/push tiles pass straight through it, while the FIDO2 lane stops at the gate because the origin does not match. What stays inside hardware is the credential private key that will not produce a signature for the wrong origin, drawn sealed in the authenticator at the gate. What communicates externally is the origin-checked WebAuthn assertion. Allowed labels: AitM, FIDO2, WebAuthn, origin binding, AAGUID, SMS/TOTP/push. Within VSG-THREAT-LANDSCAPE this is the threat-to-control board with an AitM proxy lane.
- **Avoid:**
    - Do not show FIDO2 defeating post-authentication session-token abuse — the property depicted is origin binding at sign-in
    - do not depict TOTP or push as origin-bound
    - do not show a SIM swap defeating a hardware-bound FIDO credential when the real exposure is the SMS recovery path
    - do not present supply-chain compromise as solved by hardware credentials rather than blast-radius limits
- **Alt text:** Threat board pairing AitM phishing, push fatigue, SIM swap and device cloning with the origin-bound, hardware-rooted controls that actually answer each one.
- **Export filename:** `ambisecure-blog-cyber-security-threats-overview-1200x630.png`
- **Visual similarity group:** VSG-THREAT-LANDSCAPE
- **Currently uses:** blog.png
- **Notes:** Thinnest body in the batch (~5.2k chars) but functions as the top-of-funnel hub linking to the cornerstone cluster. Year is in the H1 — keep '2026' off the image so the asset does not date.

## 139 — Where Your AmbiSecure FIDO Key Works
- **Record number:** 139
- **Page name:** Where Your AmbiSecure FIDO Key Works
- **Canonical URL:** https://ambisecure.ambimat.com/blog/fido-supported-services/
- **Section:** Blog
- **Page type:** PRODUCT EDUCATION
- **Primary topic:** FIDO2 | **Secondary:** WebAuthn; Hardware security keys; Enterprise access
- **Design priority:** P2
- **Approved headline:** Ask What Doesn't Work Yet
- **Alternative headline:** One IdP, Every SP Inherits FIDO2
- **Category label:** REFERENCE
- **Core message:** An AmbiSecure FIDO2 authenticator works with any WebAuthn relying party, so the useful deployment question is which legacy corners still need a validation server behind SSO.
- **Audience:** IAM leader
- **Diagram type:** SYSTEM ARCHITECTURE
- **Visual concept:** Dominant object is an AmbiSecure FIDO2 authenticator (USB-C with NFC) at the left, feeding a hub-and-spoke fan-out. Five nodes only: the authenticator, the IdP hub carrying an AAGUID allow-list, the SaaS estate inheriting FIDO2 through SSO (drawn as a dense but unlabelled tile field), OS-level sign-in (Windows Hello platform authenticator, PAM-U2F), and a small shaded 'not yet' bucket of legacy apps served by a FIDO Validation Server. The relationship is inheritance: one configuration at the hub reaches every spoke, which is why the spokes carry no individual branding. What stays inside hardware is the credential private key and user verification; what communicates externally is a WebAuthn assertion bound to a single origin, drawn bouncing off a second origin to show it does not travel. Allowed labels: FIDO2, WebAuthn, AAGUID, SSO, PAM-U2F. Within VSG-ENTERPRISE-ACCESS this is the IdP fan-out coverage view.
- **Avoid:**
    - Do not use third-party logos or imply AmbiSecure endorses, certifies, or has tested the listed services
    - do not show the authenticator storing per-service passwords or secrets
    - do not conflate a synced passkey with the hardware authenticator the page is about
    - do not show one WebAuthn assertion being accepted at a second origin
- **Alt text:** Coverage map fanning an AmbiSecure FIDO2 authenticator through an IdP to the SaaS estate, OS sign-in, and the legacy apps a validation server still has to cover.
- **Export filename:** `ambisecure-blog-fido-supported-services-1200x630.png`
- **Visual similarity group:** VSG-ENTERPRISE-ACCESS
- **Currently uses:** blog.png
- **Notes:** Page is an explicitly dated snapshot ('Refreshed 2026-05', 'treat vendor docs as authoritative') and will age — keep dates and vendor names out of the image so it survives content refreshes. Logo use would create a false-endorsement risk.

## 140 — How FIDO Authentication Works
- **Record number:** 140
- **Page name:** How FIDO Authentication Works
- **Canonical URL:** https://ambisecure.ambimat.com/blog/how-fido-authentication-works/
- **Section:** Blog
- **Page type:** STANDARDS EXPLAINER
- **Primary topic:** FIDO2 | **Secondary:** WebAuthn;Phishing-resistant authentication;Hardware security keys
- **Design priority:** P1
- **Approved headline:** The origin is in the signature
- **Alternative headline:** Public-key signatures replace shared secrets
- **Category label:** SECURITY EXPLAINER
- **Core message:** FIDO2 / WebAuthn replaces the password with an origin-bound public-key signature generated inside a hardware authenticator, so a look-alike domain can never obtain a usable credential.
- **Audience:** Security architect
- **Diagram type:** PROTOCOL FLOW
- **Visual concept:** Dominant object: a single left-to-right ceremony rail running from a relying-party panel to a sealed hardware authenticator, forking at an origin gate on the right. The flow reads as one login: the RP issues a fresh challenge plus its origin and the stored credential ID, the browser relays it over CTAP2, and the authenticator resolves a credential bound to that exact origin before it will sign — exactly five nodes: relying party, browser / WebAuthn client, CTAP2 link, authenticator (private key + credential store + UV check), and the origin gate that splits to example.com (signature returned, sign-in succeeds) versus examp1e.com (no credential bound, ceremony silently fails). Everything inside the authenticator's sealed outline stays there: the private key, the per-origin credential lookup, and the PIN/biometric UV step; the only things crossing the boundary are the challenge and origin travelling in, and the signature plus (at registration) the public key travelling out. Allowed labels: 'challenge', 'origin', 'example.com', 'examp1e.com', 'signature', 'public key', 'CTAP2', 'UV' — and nothing must imply that the user or the browser spotted the typosquatted domain, because the whole point is that the authenticator simply holds no credential for the wrong origin. VSG variation: this is the canonical end-to-end registration/authentication ceremony with the origin fork as the dominant form; sibling FIDO pages in this group vary by node set (byte-level attestation, authenticator form factor, storage comparison) and must not reuse the fork.
- **Avoid:**
    - Do not show the private key or credential store leaving the authenticator outline — only the signature and the public key cross the boundary
    - Do not depict the browser, a warning banner, or the user detecting and blocking examp1e.com — the authenticator finds no credential bound to that origin and the ceremony silently fails
    - Do not draw a synced-passkey cloud or account-recovery path as part of this flow, which shows a device-bound hardware authenticator
    - Do not merge WebAuthn and CTAP2 into one labelled link — WebAuthn is browser-to-relying-party, CTAP2 is browser-to-authenticator
    - Do not include a password field, TOTP digits, or an SMS code anywhere in the ceremony
- **Alt text:** Diagram of an AmbiSecure FIDO2 authenticator signing a challenge bound to example.com while a look-alike domain finds no matching credential and fails.
- **Export filename:** `ambisecure-blog-how-fido-authentication-works-1200x630.png`
- **Visual similarity group:** VSG-FIDO-CEREMONY
- **Currently uses:** blog.png
- **Notes:** INPUT MISMATCH — human review: the batch-12 task description said this record is the /blog/ directory hub and asked for page_type OTHER BLOG. It is not. Record 140 in batch-12-blog.json is the article 'How FIDO Authentication Works' (url /blog/how-fido-authentication-works/). The blog hub is a separate record, rec 26 in batch-09-blog.json (sect blog-hub). This brief is written for the article per the actual input record, since rec must match input and hub framing would have mis-briefed the article and duplicated rec 26. Confirm hub coverage lands via batch-09. Cornerstone FIDO explainer — many see-also links point to it, so priority 1.

# RESOURCE PAGES

## 141 — Standards evolution timelines

- **Record number:** 141
- **Page name:** How the standards we build against have evolved.
- **Canonical URL:** https://ambisecure.ambimat.com/resources/timelines/
- **Section:** Resource
- **Page type:** OTHER RESOURCE
- **Primary topic:** Other | **Secondary:** FIDO2; PIV; Secure Elements
- **Design priority:** P2
- **Approved headline:** Seven standards families, decade by decade
- **Alternative headline:** Standards do not arrive fully formed
- **Category label:** REFERENCE
- **Core message:** An index to seven decade-scale timelines tracing how the authentication, identity and trust standards AmbiSecure builds against actually accumulated.
- **Audience:** Security architect
- **Diagram type:** CONCEPTUAL ILLUSTRATION
- **Visual concept:** Dominant object: a braid — seven thin standards lanes entering from the left and converging into one spine at the right, reading as an index across the whole set rather than any single technology's timeline. Lane labels sit small at the left edge (FIDO, PIV, ePassport, OTP/SMS, smart cards, WebAuthn, secure elements) and are supporting texture, not nodes; the five major nodes are era bands marked on the shared spine at 1974, 1991, 2005, 2018 and 2026, the real origin and inflection years drawn from the child pages. The relationship: the lanes start decades apart and only converge late, toward hardware-rooted, phishing-resistant credentials. Nothing hardware-internal is depicted here — this is an index view, not a device drawing; what is 'external' is the spec bodies themselves (ISO, ICAO, NIST, W3C, FIDO Alliance) named along the spine. Labels allowed: the seven lane names, the five years, the spec-body names. Must not imply a single unified standard or an AmbiSecure-authored roadmap.
- **Avoid:**
    - Do not present the hub as one technology's timeline — it indexes seven separate standards families
    - Do not imply AmbiSecure authored, owns or governs any of these specifications (ISO, ICAO, NIST, W3C, FIDO Alliance do)
    - Do not draw the lanes as starting together — smart cards begin in 1974 while the FIDO Alliance forms in 2012
    - Do not show the OTP/SMS lane as an active recommended path — the set marks it as removed from AAL2+
    - Do not show a single terminal endpoint implying the standards have stopped evolving
- **Alt text:** Seven standards lanes — FIDO, PIV, ePassport, OTP, smart cards, WebAuthn, secure elements — converging on hardware-rooted trust in the AmbiSecure index.
- **Export filename:** `ambisecure-resources-timelines-1200x630.png`
- **Visual similarity group:** VSG-TIMELINE
- **Currently uses:** resources.png
- **Notes:** HUB page, not an article — it indexes the seven child timelines (recs 142-148). Concept deliberately spans the set (braid of lanes + shared era spine) so it does not duplicate any child's dominant object. Only hub in the VSG-TIMELINE group.

## 142 — FIDO evolution timeline

- **Record number:** 142
- **Page name:** FIDO — from FIDO 1.0 to passkeys.
- **Canonical URL:** https://ambisecure.ambimat.com/resources/timelines/fido/
- **Section:** Resource
- **Page type:** TECHNICAL EXPLAINER
- **Primary topic:** FIDO2 | **Secondary:** WebAuthn; Passkeys; Hardware security keys
- **Design priority:** P1
- **Approved headline:** From U2F dongle to synced passkey
- **Alternative headline:** Why FIDO2 replaced the second factor
- **Category label:** REFERENCE
- **Core message:** The fourteen-year path from a U2F second factor to multi-device passkeys, and why relying parties now need per-credential provenance policy.
- **Audience:** IAM leader
- **Diagram type:** LIFECYCLE
- **Visual concept:** Dominant object: a left-to-right ratchet of five year plinths, each carrying the physical artefact of its era rather than a generic dot — 2012 an empty FIDO Alliance seal, 2014 a U2F dongle (FIDO 1.0, UAF + U2F), 2018 a FIDO2 pairing badge showing WebAuthn L1 CR beside CTAP2.0, 2022 a phone holding a synced multi-device passkey, 2026 a validation-server policy card reading AAGUID + transport. The relationship: the credential grows steadily more portable left to right, and the diagram's tension is that key custody weakens as portability rises. Stays inside hardware: the private key in the dongle and in the secure element, drawn sealed at those markers only. Communicates externally: public key, AAGUID and attestation statement. Labels allowed: U2F, FIDO2, CTAP2.0/2.1, WebAuthn L1/L2/L3, passkeys, AAGUID, MDS3. Varies from the other VSG-TIMELINE pages by using authenticator form factors as its era markers. Must not imply a synced passkey is hardware-bound.
- **Avoid:**
    - Do not show the 2022 synced passkey as hardware-bound or claim its private key never leaves the device — that property holds for the attested hardware authenticators, not synced credentials
    - Do not date WebAuthn's W3C Recommendation to 2018 — 2018 is Candidate Recommendation, 2019 the Recommendation
    - Do not show UAF surviving past 2018 — the FIDO2 brand replaced UAF + U2F
    - Do not imply AmbiSecure authored the FIDO specifications — only the 2026 validation-server milestone is AmbiSecure's
    - Do not show CTAP2.1 features such as discoverable credentials or alwaysUv before 2023
- **Alt text:** Milestone markers running from the 2012 FIDO Alliance and U2F keys through FIDO2 and CTAP2 to multi-device passkeys and per-credential provenance policy.
- **Export filename:** `ambisecure-resources-timelines-fido-1200x630.png`
- **Visual similarity group:** VSG-TIMELINE
- **Currently uses:** resources.png
- **Notes:** Shares VSG-TIMELINE with recs 141, 143-148; varied by dominant object (authenticator form-factor artefacts on a ratchet) and by era markers 2012/2014/2018/2022/2026. Highest LinkedIn value of the timeline set. Close adjacency to rec 147 — the two concepts are deliberately split hardware-artefact vs spec-level.

## 143 — PIV evolution timeline

- **Record number:** 143
- **Page name:** PIV — from FIPS 201 to derived credentials.
- **Canonical URL:** https://ambisecure.ambimat.com/resources/timelines/piv/
- **Section:** Resource
- **Page type:** TECHNICAL EXPLAINER
- **Primary topic:** PIV | **Secondary:** Government identity; Smart cards; FIDO2
- **Design priority:** P2
- **Approved headline:** PIV outgrew the card
- **Alternative headline:** One credential family, four form factors
- **Category label:** REFERENCE
- **Core message:** How PIV moved from a federal smart-card mandate to a multi-form-factor credential family while keeping its SP 800-73 functional surface intact.
- **Audience:** Government programme
- **Diagram type:** LIFECYCLE
- **Visual concept:** Dominant object: one PIV credential drawn five times as it changes body, morphing rather than repeating — 2004 an HSPD-12 policy directive with no chip at all, 2005 a FIPS 201 contact card, 2014 a phone carrying an SP 800-157 derived credential, 2018 an SP 800-73-4 BER-TLV data model with key reference codes 9A / 9C / 9D / 9E, 2026 a nano-card secure element sitting beside a FIDO2 key as an alternative AAL3 factor. The relationship: the packaging changes at every marker while the SP 800-73 functional surface underneath stays constant — that constancy is the whole point. Stays inside hardware: the PIV authentication private key, in every form factor shown. Communicates externally: the credential certificates and PIV data objects a relying system reads. Labels allowed: HSPD-12, FIPS 201, SP 800-157, SP 800-73-4, 9A/9C/9D/9E, OMB M-22-09. Varies within VSG-TIMELINE by morphing a single object across eras instead of plotting separate events. Must not show the derived credential orphaned from its parent card.
- **Avoid:**
    - Do not show a derived PIV credential as independent of its parent card — SP 800-157 derives it from a parent PIV card
    - Do not show a private key travelling from card to phone during derivation — the derived credential's key is generated on the target device
    - Do not credit derived credentials to FIPS 201-2 — SP 800-157 (2014) defines the pattern
    - Do not depict SP 800-73-4 as superseded — the page states it is still the implementation target
    - Do not merge PIV and FIDO2 into one credential — the 2026 milestone treats them as alternative phishing-resistant factors under per-tenant policy
- **Alt text:** A PIV credential shown across card, USB token, phone and nano-card secure element, its SP 800-73 surface unchanged, in the AmbiSecure standards-evolution set.
- **Export filename:** `ambisecure-resources-timelines-piv-1200x630.png`
- **Visual similarity group:** VSG-TIMELINE
- **Currently uses:** resources.png
- **Notes:** Shares VSG-TIMELINE; varied by dominant object (one credential morphing across form factors) and by era markers 2004/2005/2014/2018/2026. Page body has a typo ("OEM and OEM") in the 2024 entry — flag for human review, does not affect the brief.

## 144 — ePassport evolution timeline

- **Record number:** 144
- **Page name:** ePassport — from BAC to PACE-CAM.
- **Canonical URL:** https://ambisecure.ambimat.com/resources/timelines/epassport/
- **Section:** Resource
- **Page type:** TECHNICAL EXPLAINER
- **Primary topic:** Government identity | **Secondary:** Smart cards; PKI; NFC
- **Design priority:** P2
- **Approved headline:** Why BAC gave way to PACE
- **Alternative headline:** From printed MRZ to digital travel credential
- **Category label:** REFERENCE
- **Core message:** How the electronic travel document went from an optical MRZ strip to a PACE-protected, biometric-rich chip with PKD-distributed trust roots.
- **Audience:** Government programme
- **Diagram type:** LIFECYCLE
- **Visual concept:** Dominant object: the chip-to-reader channel itself, drawn as a channel that hardens and widens across five era markers — not the passport booklet. 1980 an optical MRZ strip read by light; 2004 a BAC-protected contactless read keyed from the MRZ; 2006 the ICAO PKD fanning CSCA / DSC trust anchors out to inspection systems; 2012 PACE replacing BAC with stronger key derivation and forward secrecy on the chip-reader link (Doc 9303 7th ed.); 2022 an ICAO DTC extracted from the chip and bound to a phone. The relationship: every step closes a channel weakness rather than adding data. Stays inside hardware: the chip's authentication private key and the EAC-gated fingerprint biometrics. Communicates externally: DSC-signed LDS data groups and PKD-distributed anchors. Labels allowed: MRZ, BAC, PACE, SAC, EAC, LDS2, CSCA/DSC, ICAO 9303. Varies within VSG-TIMELINE by evolving the reader channel rather than the credential. Must not show biometrics readable without terminal authentication.
- **Avoid:**
    - Do not show BAC and PACE as concurrent equals — SAC (PACE) supersedes BAC, which survives only as a reader fall-back for older equipment
    - Do not show fingerprint biometrics released without EAC terminal authentication — only the face image sits behind BAC/PACE
    - Do not place a CSCA or DSC private key on the chip — the chip carries DSC-signed data, not CA keys
    - Do not depict the ICAO DTC as replacing the physical passport — the page frames it as derived from the chip and bound to a mobile credential
    - Do not conflate DESFire EV2 national-ID pilots with ICAO 9303 eMRTD chips
- **Alt text:** The ePassport chip-to-reader channel hardening from optical MRZ through BAC and PACE to ICAO Digital Travel Credentials, with PKD-distributed trust anchors.
- **Export filename:** `ambisecure-resources-timelines-epassport-1200x630.png`
- **Visual similarity group:** VSG-TIMELINE
- **Currently uses:** resources.png
- **Notes:** Shares VSG-TIMELINE; varied by dominant object (the reader channel, not the credential) and by era markers 1980/2004/2006/2012/2022. PACE-CAM appears in the H1 but not in the body milestones — brief stays on PACE/SAC, which the body supports.

## 145 — OTP and SMS authentication evolution timeline

- **Record number:** 145
- **Page name:** OTP / SMS — from S/Key to deprecation.
- **Canonical URL:** https://ambisecure.ambimat.com/resources/timelines/otp-sms/
- **Section:** Resource
- **Page type:** TECHNICAL EXPLAINER
- **Primary topic:** Phishing-resistant authentication | **Secondary:** Telecom authentication; FIDO2; Passwordless authentication
- **Design priority:** P2
- **Approved headline:** The 45-year OTP era ends
- **Alternative headline:** Why SMS stopped counting as MFA
- **Category label:** REFERENCE
- **Core message:** Forty-five years of one-time passwords — invented, standardised, weaponised, and finally struck from AAL2+ in favour of phishing-resistant factors.
- **Audience:** IAM leader
- **Diagram type:** LIFECYCLE
- **Visual concept:** Dominant object: two crossing lines rather than one spine — a descending arc tracking the shared secret's assurance against a rising line tracking the FIDO key pair, crossing around 2019. Five markers sit on the descending arc: 1981 Lamport's one-way hash chain (S/Key), 2005 RFC 4226 HOTP's HMAC counter, 2011 RFC 6238 TOTP's 30-second time step, 2017 an SS7 / SIM-swap interception severing the SMS delivery leg, 2025 NIST SP 800-63-4 striking SMS from AAL2+. The relationship the image must land: every OTP is a shared secret that exists in two places and can be relayed to an attacker; a key pair cannot. What is 'inside hardware' is only the SecurID / TOTP seed — draw it as copied to a server, not sealed. What travels externally is the six-digit code, which is the whole problem. Labels allowed: S/Key, RFC 4226, RFC 6238, SS7, SIM-swap, OMB M-22-09, NIST SP 800-63-4. Varies within VSG-TIMELINE by using two crossing trend lines instead of a marker spine.
- **Avoid:**
    - Do not imply HOTP or TOTP are cryptographically broken — the failure is the shared secret and the relay channel, not the HMAC construction
    - Do not draw SS7 interception as an attack on the OTP algorithm — it compromises the SMS delivery channel and the phone number
    - Do not pin NIST's SMS restriction to one year — SP 800-63-3 deprecated it for AAL2+ in 2016/2017 and SP 800-63-4 firms up the prohibition in 2025
    - Do not show TOTP as fully removed — the page retains it as a recovery method, just not a primary factor
    - Do not depict AmbiSecure as an OTP vendor — the page's endpoint is FIDO and hardware tokens
- **Alt text:** Assurance of shared-secret one-time passwords declining from S/Key and HOTP through SIM-swap and NIST's SMS removal, crossed by the rise of FIDO key pairs.
- **Export filename:** `ambisecure-resources-timelines-otp-sms-1200x630.png`
- **Visual similarity group:** VSG-TIMELINE
- **Currently uses:** resources.png
- **Notes:** Shares VSG-TIMELINE; varied by dominant object (two crossing trend lines) and by era markers 1981/2005/2011/2017/2025. No exact primary_topic exists for OTP in the allowed list — mapped to Phishing-resistant authentication, which is the page's endpoint; flag if a topic value is added.

## 146 — Smart-card evolution timeline

- **Record number:** 146
- **Page name:** Smart cards — from telephone card to FIDO authenticator.
- **Canonical URL:** https://ambisecure.ambimat.com/resources/timelines/smart-cards/
- **Section:** Resource
- **Page type:** TECHNICAL EXPLAINER
- **Primary topic:** Smart cards | **Secondary:** JavaCard; Secure Elements; NFC
- **Design priority:** P2
- **Approved headline:** One card, twelve applets, one firewall
- **Alternative headline:** ISO/IEC 7816 to FIDO2 on JavaCard
- **Category label:** REFERENCE
- **Core message:** Fifty years of smart-card evolution, from a single memory cell to a firewalled chip hosting a dozen AID-selectable credential applets.
- **Audience:** Smart-card engineer
- **Diagram type:** LIFECYCLE
- **Visual concept:** Dominant object: a single card die shown in five internal states, gaining compartments over time rather than a row of separate cards — 1974 one undivided Moreno memory cell; 1987 an ISO/IEC 7816 contact-pad die with a single file system; 1996 a JavaCard 1.0 VM hosting two applets; 2008 a struck-through Crypto-1 block as MIFARE Classic falls and DESFire migration begins; 2026 a JCVM firewall partitioning up to a dozen AID-selectable applets (FIDO2, PIV, OpenPGP, NDEF). The relationship: what changed is isolation and capacity, not the card's outline. Stays inside hardware: each applet's keys behind the firewall, plus SCP03 personalisation keys. Communicates externally: only APDUs across the contact or ISO/IEC 14443 contactless interface. Labels allowed: ISO/IEC 7816, ISO/IEC 14443, JavaCard, GlobalPlatform SCP03, DESFire EV2, AID, JCVM. Varies within VSG-TIMELINE by partitioning one die internally rather than relocating or reshaping it. Must not show applets reading each other's memory.
- **Avoid:**
    - Do not show co-resident applets sharing memory — the JCVM firewall isolates them and cross-applet access requires shareable interfaces
    - Do not apply the 2008 Crypto-1 break to DESFire — Crypto-1 is MIFARE Classic, and DESFire was the migration target
    - Do not show SCP03 before 2015 or with non-AES keys — SCP03 mandates AES-128
    - Do not draw a contact pad on the ISO/IEC 14443 contactless milestone
    - Do not imply every AmbiSecure card ships twelve applets — the page describes an AID-selectable co-resident architecture, not a fixed load-out
- **Alt text:** A smart-card die evolving from a Moreno memory cell through ISO/IEC 7816 and JavaCard to a JCVM firewall isolating a dozen AID-selectable credential applets.
- **Export filename:** `ambisecure-resources-timelines-smart-cards-1200x630.png`
- **Visual similarity group:** VSG-TIMELINE
- **Currently uses:** resources.png
- **Notes:** Shares VSG-TIMELINE; varied by dominant object (one die's internal partitioning) and by era markers 1974/1987/1996/2008/2026. Deliberately distinct from rec 148, which relocates a die across host products rather than subdividing it.

## 147 — WebAuthn and passkey evolution timeline

- **Record number:** 147
- **Page name:** WebAuthn — from credential.create() to synced passkeys.
- **Canonical URL:** https://ambisecure.ambimat.com/resources/timelines/webauthn-passkey/
- **Section:** Resource
- **Page type:** TECHNICAL EXPLAINER
- **Primary topic:** WebAuthn | **Secondary:** Passkeys; FIDO2; Attestation
- **Design priority:** P1
- **Approved headline:** The browser grew a key store
- **Alternative headline:** Every WebAuthn level, what it added
- **Category label:** REFERENCE
- **Core message:** How the web platform absorbed FIDO — what each WebAuthn level added, and why provenance now matters once passkeys sync.
- **Audience:** Security architect
- **Diagram type:** LIFECYCLE
- **Visual concept:** Dominant object: the browser API surface as five stacked spec-level plates, each plate adding exactly one named capability — 2016 the W3C Credential Management API base plate; 2018 WebAuthn L1 CR exposing navigator.credentials.create() alongside CTAP2.0; 2021 L2 adding residentKey semantics and the large-blob extension; 2023 hybrid CTAP transport drawing a phone-to-desktop tunnel across the plate edge; 2026 an L3-era policy plate reading AAGUID + transport + attestation per credential. The relationship: the API accumulates surface while the origin binding underneath never changes, and that binding is the anti-phishing property. Stays inside the credential store: the private key — drawn with two visibly different custody models, a secure element for hardware keys and a platform vault for synced passkeys. Communicates externally: clientDataJSON, authenticatorData and the signature. Labels allowed: navigator.credentials, WebAuthn L1/L2/L3, CTAP2.0, conditional mediation, AAGUID. Varies from rec 142 in this VSG by using spec levels and API surface as markers rather than authenticator hardware.
- **Avoid:**
    - Do not give synced passkeys and hardware-bound credentials identical key custody — iCloud Keychain and Google Password Manager sync the credential, a security key does not
    - Do not draw cross-device authentication as a cloud relay of the credential — hybrid transport proximity-checks over BLE and tunnels CTAP messages
    - Do not credit passkeys to a WebAuthn level — L2 (2021) laid the foundation, but the 2022 announcement was a platform decision
    - Do not label WebAuthn Level 3 as final — the page marks it a Working Draft
    - Do not show the relying party receiving a private key or any raw biometric
- **Alt text:** WebAuthn spec levels stacking from the W3C Credential Management API to synced passkeys and hybrid transport, ending in per-credential provenance policy.
- **Export filename:** `ambisecure-resources-timelines-webauthn-passkey-1200x630.png`
- **Visual similarity group:** VSG-TIMELINE
- **Currently uses:** resources.png
- **Notes:** Shares VSG-TIMELINE; varied by dominant object (spec-level plates / API surface) and by era markers 2016/2018/2021/2023/2026. Closest overlap risk in the set is rec 142 (FIDO) — the two are split hardware-artefact vs spec-level and share no marker artefact. Possible consolidation candidate with rec 142 if the set is ever trimmed.

## 148 — Secure-element evolution timeline

- **Record number:** 148
- **Page name:** Secure elements — from SIM to IoT identity chip.
- **Canonical URL:** https://ambisecure.ambimat.com/resources/timelines/secure-elements/
- **Section:** Resource
- **Page type:** TECHNICAL EXPLAINER
- **Primary topic:** Secure Elements | **Secondary:** SIM/eSIM; IoT security; Embedded security
- **Design priority:** P2
- **Approved headline:** The same chip, five new jobs
- **Alternative headline:** Tamper-resistant silicon left the SIM slot
- **Category label:** REFERENCE
- **Core message:** Tamper-resistant silicon kept one job — key custody and attestation — while moving from the SIM slot into TPMs, embedded SEs, eUICCs and IoT trust chips.
- **Audience:** Device-security architect
- **Diagram type:** LIFECYCLE
- **Visual concept:** Dominant object: one tamper-resistant die, drawn once and then shown relocating into five different host bodies across the years — 1991 a GSM SIM in a handset (ETSI GSM 11.11); 1999 a discrete TPM 1.0 soldered to a PC mainboard; 2011 an embedded SE beside the NFC controller in a phone, distinct from the SIM; 2014 an eUICC remotely provisioned under GSMA SGP.22; 2022 an I2C/SPI IoT secure element next to a host MCU. The relationship: the die's job — tamper-resistant key custody plus attestation primitives — is constant; only the host and the bus change. Stays inside hardware at every marker: private keys and attestation keys, never visible on the bus. Communicates externally: the host interface (I2C / SPI / ISO 7816-3) and an attestation statement a tenant-scoped service verifies. Labels allowed: GSM 11.11, TPM 1.0/2.0, eSE, SGP.22, SGP.32, I2C/SPI, CC EAL5+/EAL6+. Varies from rec 146 in this VSG by relocating one die across host products rather than subdividing one die internally.
- **Avoid:**
    - Do not conflate eSIM with eUICC — the eUICC is the secure element, the eSIM profile is what gets provisioned onto it
    - Do not show the eSE and the SIM as one chip after 2011 — the page states the eSE became a distinct element
    - Do not show a host MCU or CPU reading key material out of the secure element over I2C/SPI
    - Do not treat a TPM as a smart-card secure element — the page tracks them as parallel branches that only converge conceptually
    - Do not attribute CC EAL5+/EAL6+ to a whole product — the certifications named belong to the secure-element chip platform
- **Alt text:** One tamper-resistant die migrating from GSM SIM to TPM, embedded SE, eUICC and IoT trust chip, holding key custody constant as only the host changes.
- **Export filename:** `ambisecure-resources-timelines-secure-elements-1200x630.png`
- **Visual similarity group:** VSG-TIMELINE
- **Currently uses:** resources.png
- **Notes:** Shares VSG-TIMELINE; varied by dominant object (one die relocating across hosts) and by era markers 1991/1999/2011/2014/2022. Body's 2017 entry is loosely worded ("Eventually GSMA SGP.32..." under a 2017 SGP.02 heading) — flag for human review; brief avoids that marker.

## 149 — Base32 Encoder and Decoder

- **Record number:** 149
- **Page name:** Base32 Encoder and Decoder
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/base32/
- **Section:** Resource
- **Page type:** ENGINEERING TOOL
- **Primary topic:** Other
- **Design priority:** P2
- **Approved headline:** The alphabet behind your TOTP secret
- **Alternative headline:** Two alphabets, not interchangeable
- **Category label:** TOOL
- **Core message:** Encodes and decodes Base32 and base32hex locally — the case-insensitive alphabet behind otpauth:// TOTP secrets, QR codes, and NSEC3 keys — and shows why the two alphabets are not interchangeable.
- **Audience:** Security practitioner
- **Diagram type:** COMPARISON
- **Visual concept:** Dominant object is an otpauth:// URI strip with its secret= parameter pulled out and magnified into a run of Base32 characters, which then forks onto two alphabet rails: standard A-Z 2-7 tagged 'TOTP, 2FA apps' and base32hex 0-9 A-V tagged 'sort-preserving, NSEC3'. The relationship is one secret, two mutually incompatible decodings — a small struck chip shows a cross-alphabet decode yielding different bytes. Five nodes maximum: otpauth URI, extracted secret, standard rail, base32hex rail, a '5 bytes to 8 characters' ratio chip. The decoded result renders as hex, never as words. All inside a browser-boundary frame; nothing is uploaded. Variation within VSG-ENCODING-CONVERTER: anchored on a real otpauth:// URI with alphabet rails and an overhead ratio chip, unlike the base64 fork or the base64url fan. Allowed labels: otpauth://, secret=, A-Z 2-7, 0-9 A-V, RFC 6238.
- **Avoid:**
    - Do not show 0, 1, or 8 anywhere in the standard Base32 alphabet — they are not in it and usually signal transcription errors for O, I/L, and B
    - Do not imply the tool generates, verifies, or times TOTP codes — it only encodes and decodes bytes
    - Do not present a TOTP shared secret as phishing-resistant — unlike FIDO2 it is not origin-bound
    - Do not render a decoded secret as readable text — the bytes are a raw key and fall back to hex
- **Alt text:** An otpauth:// secret expanded to Base32 and split across the A-Z 2-7 rail and the sort-preserving base32hex rail, decoded locally in an AmbiSecure browser tool.
- **Export filename:** `ambisecure-resources-tools-base32-1200x630.png`
- **Visual similarity group:** VSG-ENCODING-CONVERTER
- **Currently uses:** resources.png
- **Notes:** TOTP sits adjacent to, not inside, the FIDO2 narrative — the image must not imply shared-secret 2FA is phishing-resistant.

## 150 — URL Encoder and Decoder

- **Record number:** 150
- **Page name:** URL Encoder and Decoder
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/url-encoder/
- **Section:** Resource
- **Page type:** ENGINEERING TOOL
- **Primary topic:** Other
- **Design priority:** P3
- **Approved headline:** Component or full URL, not the same
- **Alternative headline:** Why + is not always a space
- **Category label:** TOOL
- **Core message:** Percent-encodes and decodes using the browser's own encodeURI and encodeURIComponent primitives, making explicit the component-versus-full-URL distinction that quietly corrupts query strings.
- **Audience:** Security practitioner
- **Diagram type:** COMPARISON
- **Visual concept:** Dominant object is one dissected URL bar with its structural delimiters lit up as separators — : / ? # & = — segmenting scheme, host, path, query, and fragment. Beneath it, a single query value containing & and = is pushed down two lanes: encodeURIComponent, where the delimiters become %26 and %3D and the value stays sealed inside its field; and encodeURI, where they survive intact and the value visibly breaks out and corrupts the next field, marked as the failure case. Five nodes maximum: URL bar, delimiter set, the value, the component lane, the full-URL lane. A small toggle chip shows %20 versus + for spaces. Inside a browser-boundary frame. Variation within VSG-ENCODING-CONVERTER: the dominant object is a structural URL bar with a break-out consequence, not a byte, alphabet, or codepoint mapping. Allowed labels: %20, +, %26, encodeURIComponent, encodeURI. Must not imply escaping is a security control.
- **Avoid:**
    - Do not imply percent-encoding sanitises input or defends against injection — it is a syntax rule, not a security control
    - Do not show + decoding to a space inside a path — that holds only for form-urlencoded data, where + is otherwise a literal plus
    - Do not depict double-encoding, where % becomes %25, as a correct result
    - Do not show a URL carrying a token or session identifier being sent anywhere — encoding is local
- **Alt text:** A dissected URL bar with delimiters lit, contrasting a query value safely escaped by component encoding against the same value breaking out under encodeURI.
- **Export filename:** `ambisecure-resources-tools-url-encoder-1200x630.png`
- **Visual similarity group:** VSG-ENCODING-CONVERTER
- **Currently uses:** resources.png
- **Notes:** Commodity utility with no hardware-security tie; supporting reference and internal-link filler only.

## 151 — JSON Formatter and Minifier

- **Record number:** 151
- **Page name:** JSON Formatter and Minifier
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/json-formatter/
- **Section:** Resource
- **Page type:** ENGINEERING TOOL
- **Primary topic:** Other
- **Design priority:** P3
- **Approved headline:** Format JSON, diff without the noise
- **Alternative headline:** Parse first, then print
- **Category label:** TOOL
- **Core message:** Pretty-prints, minifies, and recursively sort-keys JSON in-browser through native JSON.parse with a precise line and column on failure, so captured traces read cleanly and configs diff without reordering noise.
- **Audience:** Security practitioner
- **Diagram type:** DATA PARSER
- **Visual concept:** Dominant object is a one-line minified response body entering a single parse gate and emerging as three alternative outputs — every mode parses first, so the gate doubles as a validity check. Five nodes maximum: the minified input strip, the JSON.parse gate (with a small 'line 12, column 5' error tag on its reject path), a pretty-printed block carrying a 2 / 4 / tab indent chip, a re-minified strip, and a sort-keys output rendered as two config panes diffing cleanly with only real changes highlighted. Everything is contained by a browser-boundary frame — the payload may hold tokens and never leaves. Variation within VSG-JSON-WORKBENCH: this is the one-in, three-out transform fan around a parse gate; rec 152 owns the error caret and pointer rail, rec 97 owns the storage containment. Allowed labels: JSON.parse, 2 / 4 / tab, sort keys, line 12 column 5. Must not imply schema checking.
- **Avoid:**
    - Do not show sort-keys reordering array elements — only object members are sorted, arrays keep their order
    - Do not depict schema validation on this page — that belongs to the JSON validator
    - Do not show a server or API formatting the payload — parsing is local, which is what makes it safe for JSON holding tokens
    - Do not show trailing commas, comments, or single-quoted keys being accepted as valid JSON
- **Alt text:** A minified trace body passing a JSON.parse gate and emerging pretty-printed, minified and key-sorted for clean diffs — formatted locally, never uploaded.
- **Export filename:** `ambisecure-resources-tools-json-formatter-1200x630.png`
- **Visual similarity group:** VSG-JSON-WORKBENCH
- **Currently uses:** resources.png
- **Notes:** Near-duplicate scope with the JSON validator and JSON bin builder; consolidation candidate.

## 152 — JSON Validator

- **Record number:** 152
- **Page name:** JSON Validator
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/json-validator/
- **Section:** Resource
- **Page type:** ENGINEERING TOOL
- **Primary topic:** Other | **Secondary:** Attestation; WebAuthn
- **Design priority:** P3
- **Approved headline:** Line, column, and the exact character
- **Alternative headline:** Every violation gets a JSON Pointer
- **Category label:** TOOL
- **Core message:** Turns a terse 'Unexpected token' into a 1-based line, column, and snippet, and optionally checks an instance against a JSON Schema subset with a JSON Pointer on every violation — all client-side.
- **Audience:** Security practitioner
- **Diagram type:** DATA PARSER
- **Visual concept:** Dominant object is a JSON instance block with a caret pinned hard to one offending character, captioned 'line 8, column 14' — the location, not the layout, is the whole subject. Below it runs a findings rail listing schema violations addressed by JSON Pointer, the top row reading /items/2/port. Five nodes maximum: instance block, pinned error caret, optional schema panel, the result badge set (VALID JSON / INVALID JSON / SCHEMA PASS / SCHEMA FAIL), the pointer findings rail. A browser-boundary frame encloses both inputs: no network request, no telemetry, no storage, which matters when the instance is a credential, access policy, or attestation blob. Variation within VSG-JSON-WORKBENCH: this is the error-locator caret plus pointer rail — no transform outputs (rec 151) and no storage shelf (rec 97). Allowed labels: /items/2/port, line 8 column 14, SCHEMA FAIL, draft 2020-12.
- **Avoid:**
    - Do not imply full JSON Schema conformance — format assertions, remote $ref, if/then/else, dependentSchemas, and unevaluatedProperties are out of scope
    - Do not present schema validation as a security check on an attestation payload — a well-formed blob is not a verified one
    - Do not show pretty-printing or minifying here — that is the JSON formatter's job
    - Do not draw an upload, storage, or telemetry path — both instance and schema stay on the page
- **Alt text:** A JSON instance with a caret pinned to the exact failing character beside a rail of schema violations addressed by JSON Pointer, checked inside the browser.
- **Export filename:** `ambisecure-resources-tools-json-validator-1200x630.png`
- **Visual similarity group:** VSG-JSON-WORKBENCH
- **Currently uses:** resources.png
- **Notes:** Overlaps the JSON formatter and bin builder. Copy inconsistency for human review: this page claims a draft 2020-12 subset while the JSON bin builder (rec 97) describes its validator as Draft-07 style.

## 153 — XML Formatter and Validator

- **Record number:** 153
- **Page name:** XML Formatter and Validator
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/xml-formatter/
- **Section:** Resource
- **Page type:** ENGINEERING TOOL
- **Primary topic:** Other | **Secondary:** PKI
- **Design priority:** P3
- **Approved headline:** Format XML without external entities
- **Alternative headline:** Well-formed is not the same as valid
- **Category label:** TOOL
- **Core message:** Pretty-print, minify, or well-formedness-check XML entirely in the browser via DOMParser, which never resolves DTDs or external entities.
- **Audience:** Security practitioner
- **Diagram type:** DATA PARSER
- **Visual concept:** Dominant object is a single browser-framed panel holding a dense one-line XML string on the left and the same document re-serialized with indentation on the right. The flow runs through exactly four nodes: raw minified XML, the browser DOMParser, a resulting element tree, and the indented output; a fifth node sits off to the side as a severed branch, a <!DOCTYPE> / external-entity URL reference struck through to show it is never fetched. Everything stays inside the browser frame — no server, no network leg, no upload arrow anywhere. Permitted labels: <soap:Envelope>, <!DOCTYPE>, DOMParser, well-formed, and a parse-error line/column marker; within VSG-MARKUP-FORMATTER this page is the only one whose dominant object is a document-tree re-serialization with a cut external-entity branch. Must not imply that the tool checks conformance to a DTD, XSD, or RELAX NG grammar.
- **Avoid:**
    - Do not show an XSD, DTD, or schema badge with a green tick implying validation
    - do not draw XML uploading to a server or cloud
    - do not depict an external entity or DTD URL being successfully fetched
    - do not present the formatter as an XXE vulnerability scanner or attack tool
- **Alt text:** AmbiSecure XML tool concept art: minified markup entering the browser DOMParser, indented output returned, and a DTD external-entity fetch cut off in-browser.
- **Export filename:** `ambisecure-resources-tools-xml-formatter-1200x630.png`
- **Visual similarity group:** VSG-MARKUP-FORMATTER
- **Currently uses:** resources.png
- **Notes:** Generic developer utility with limited commercial pull; the no-DTD/no-XXE angle is its only security differentiator. Consolidation candidate with the JSON Formatter page if the utility tools are ever merged.

## 154 — Binary Calculator

- **Record number:** 154
- **Page name:** Binary Calculator
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/binary-calculator/
- **Section:** Resource
- **Page type:** CALCULATOR
- **Primary topic:** Other | **Secondary:** APDU; Embedded security
- **Design priority:** P2
- **Approved headline:** Bitwise math that survives 64 bits
- **Alternative headline:** One value, four bases, exact widths
- **Category label:** TOOL
- **Core message:** A BigInt-backed base converter and bitwise calculator that keeps 8/16/32/64-bit results exact where native JavaScript bit operations silently truncate to signed 32 bits.
- **Audience:** Embedded engineer
- **Diagram type:** TECHNICAL WORKBENCH
- **Visual concept:** Dominant object is a two-panel workbench: a base converter on the left and a bitwise operation panel on the right, sharing one width/signedness setting shown as a connecting rail between them. Five nodes maximum: a single typed value (0x9000), its four-base readout (binary, decimal, hex, octal), the nibble-grouped bit view 1001 0000 0000 0000, the width selector 8/16/32/64, and one operation tile (A XOR B). All computation is drawn inside the browser chrome with a BigInt marker on the compute path — no server leg, since register dumps and key material never leave the page. Permitted labels: 0x9000, 0xFF, AND/OR/XOR/NOT, two's complement, BigInt; within VSG-ENCODING-CONVERTER this page varies the family by using a dual-panel calculator with a shared width rail rather than a single linear text-conversion pipe. Must not imply the tool decodes or interprets protocol structures — it operates on values, not messages.
- **Avoid:**
    - Do not render 0xFFFFFFFF & 0xFFFFFFFF as -1 as though the tool produced it — that is the native-JS trap the page exists to avoid
    - do not draw operands or results travelling to a server
    - do not depict logical and arithmetic right shift as the same operation
    - do not imply the calculator parses APDUs, TLV records, or EMV tags
- **Alt text:** Concept art for the AmbiSecure binary calculator: a value read at once in four bases beside a bitwise panel, with width masking and two's-complement views.
- **Export filename:** `ambisecure-resources-tools-binary-calculator-1200x630.png`
- **Visual similarity group:** VSG-ENCODING-CONVERTER
- **Currently uses:** resources.png

## 155 — Byte Offset Calculator

- **Record number:** 155
- **Page name:** Byte Offset Calculator
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/byte-offset-calculator/
- **Section:** Resource
- **Page type:** ENGINEERING TOOL
- **Primary topic:** APDU | **Secondary:** BER-TLV; Smart cards; NFC
- **Design priority:** P2
- **Approved headline:** Which byte sits at which offset
- **Alternative headline:** Both offset bases, both byte orders
- **Category label:** TOOL
- **Core message:** Turns a wall of hex into a position-addressable offset table and reads any slice as an integer in both byte orders, signed and unsigned.
- **Audience:** Smart-card engineer
- **Diagram type:** DATA PARSER
- **Visual concept:** Dominant object is a monospaced hex dump with a triple offset gutter running down its left edge — 0-based decimal, 0-based hex, and 1-based decimal side by side — which is the page's whole argument made visible. Five nodes maximum: the offset gutter, the grouped hex rows, the printable-ASCII column with dots standing in for bytes outside 0x20-0x7E, a bracket selecting a two-byte slice, and a readout tile giving that slice's big-endian and little-endian values. The bracket sits over 90 00, and one row is annotated at the Lc field of an ISO 7816 command; the whole dump stays inside a browser frame with no upload path. Permitted labels: 00 A4 04 00 07, Lc, SW1 SW2, 0x00/0x10 offsets, big-endian/little-endian; within VSG-BYTE-PARSER this page's dominant object is an offset-gutter dump with a slice bracket, not a decoded tag tree. Must not imply the tool assigns meaning to tags or judges whether the APDU is correct.
- **Avoid:**
    - Do not show BER-TLV tags decoded into a labelled tree — this tool addresses bytes by position and does not interpret tag semantics
    - do not show a short slice zero-padded, since running past the end raises an error
    - do not draw hex bytes being sent to a server
    - do not imply it validates APDU correctness or explains what a status word means
- **Alt text:** Planned AmbiSecure visual: a hex dump with decimal, hex and 1-based offset gutters plus ASCII preview, one slice bracketed and read in both byte orders.
- **Export filename:** `ambisecure-resources-tools-byte-offset-calculator-1200x630.png`
- **Visual similarity group:** VSG-BYTE-PARSER
- **Currently uses:** resources.png
- **Notes:** Overlaps in audience with the Hex-Bytes and TLV Parser tools it links to; keep the offset-gutter dominant object distinct from the TLV parser's tag-tree visual so the VSG-BYTE-PARSER family does not converge.

## 156 — CRC Calculator

- **Record number:** 156
- **Page name:** CRC Calculator
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/crc-calculator/
- **Section:** Resource
- **Page type:** CALCULATOR
- **Primary topic:** Other | **Secondary:** Embedded security; IoT security
- **Design priority:** P2
- **Approved headline:** Six parameters define every CRC
- **Alternative headline:** CRC-16 alone tells you nothing
- **Category label:** TOOL
- **Core message:** One generic BigInt CRC engine driven by the six parameters that actually define a variant, with 70+ reveng presets and a live check-value badge, all in-browser.
- **Audience:** Embedded engineer
- **Diagram type:** TECHNICAL WORKBENCH
- **Visual concept:** Dominant object: a rack of six dials — width, poly, init, RefIn, RefOut, XorOut — feeding a single shift-register engine, with message bytes entering from the left. Flow: the string 123456789 runs through the engine and lands on a check-value badge compared against the catalogue figure, while a small fan of preset chips (MODBUS, XMODEM, CRC-32C, CCITT-FALSE) points back at the dial rack to show each preset is just a six-tuple; five nodes — input bytes, dial rack, engine, hex CRC result, check badge. Everything computes in-browser, so no upload path is drawn — proprietary frame layouts stay local. Labels allowed: the six parameter names, 0x-prefixed poly values, the preset names, 123456789. Must not present the CRC as tamper-evident or as a hash.
- **Avoid:**
    - Do not present a CRC as a security or tamper-detection mechanism
    - Do not label the engine 'CRC-16' or 'CRC-32' without its six parameters — the name alone does not pin a value
    - Do not draw the CRC result as a cryptographic digest
    - Do not show the payload being sent to a server to be computed
- **Alt text:** Six dials — width, poly, init, RefIn, RefOut, XorOut — feeding one shift-register engine with a live check badge for 123456789 in AmbiSecure's CRC calculator.
- **Export filename:** `ambisecure-resources-tools-crc-calculator-1200x630.png`
- **Visual similarity group:** VSG-CHECKSUM-CALC
- **Currently uses:** resources.png
- **Notes:** Uses an invented VSG-CHECKSUM-CALC to group the three non-cryptographic integrity calculators; VSG-CRYPTO-CALC would wrongly imply cryptographic strength.

## 157 — LRC Calculator

- **Record number:** 157
- **Page name:** LRC Calculator
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/lrc-calculator/
- **Section:** Resource
- **Page type:** CALCULATOR
- **Primary topic:** Other | **Secondary:** Embedded security
- **Design priority:** P3
- **Approved headline:** XOR or two's-complement — match the spec
- **Alternative headline:** Does the frame include STX and ETX
- **Category label:** TOOL
- **Core message:** Computes XOR and additive LRC variants over text or hex with optional STX/ETX framing and a step-by-step accumulator table, entirely client-side.
- **Audience:** Embedded engineer
- **Diagram type:** TECHNICAL WORKBENCH
- **Visual concept:** Dominant object: a framed serial message laid out as one horizontal byte row — STX, body bytes, ETX, LRC trailer. Flow: a running accumulator strip beneath the row shows the value after each byte and terminates at the trailer; a two-way switch at the left selects XOR parity versus additive two's-complement, and a bracket over STX/ETX marks their coverage as toggleable — the page's most common mismatch. Four nodes: byte row, variant switch, accumulator strip, final LRC byte, plus a footnote chip contrasting Modbus ASCII (LRC) with Modbus RTU (CRC-16). Computation is local; no network element appears. Labels allowed: STX 0x02, ETX 0x03, LRC, XOR, two's-complement, Modbus ASCII. Must not imply tamper resistance. Within VSG-CHECKSUM-CALC this is the per-byte accumulator walk, unlike the CRC parameter rack.
- **Avoid:**
    - Do not present an LRC as tamper protection — it detects accidental corruption only
    - Do not show STX/ETX as always covered — coverage varies by spec
    - Do not conflate the modulo-256 sum with its two's-complement form
    - Do not pair an LRC with Modbus RTU — RTU uses a 16-bit CRC, ASCII uses the LRC
- **Alt text:** A framed STX/body/ETX message with a running accumulator strip beneath, showing how AmbiSecure's LRC tool builds a trailing byte for Modbus ASCII-style links.
- **Export filename:** `ambisecure-resources-tools-lrc-calculator-1200x630.png`
- **Visual similarity group:** VSG-CHECKSUM-CALC
- **Currently uses:** resources.png
- **Notes:** Sibling of the CRC and checksum calculators, and the checksum tool also computes an XOR LRC — possible consolidation; keep the accumulator-walk visual distinct.

## 158 — Checksum Calculator

- **Record number:** 158
- **Page name:** Checksum Calculator
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/checksum/
- **Section:** Resource
- **Page type:** CALCULATOR
- **Primary topic:** Other | **Secondary:** Embedded security
- **Design priority:** P3
- **Approved headline:** Ten checksums over the same bytes
- **Alternative headline:** Detects accidents, not attackers
- **Category label:** TOOL
- **Core message:** Runs ten non-cryptographic checksums over the same input side by side, so you can find which algorithm a device's trailer byte actually matches.
- **Audience:** Embedded engineer
- **Diagram type:** COMPARISON
- **Visual concept:** Dominant object: a single payload byte-run across the top feeding a column of parallel result rows — one per algorithm — so the eye scans downward for the value matching a frame's existing trailer. Flow: five representative rows only (8-bit sum, XOR/LRC, Fletcher-16, Adler-32, RFC 1071 Internet checksum), each showing width and hex result, with a word-order toggle bracketed to the two additive-sum rows alone. A band running under the whole column reads 'accidental corruption only'; all rows compute in-browser over the same bytes with no server node, keeping firmware images and APDU scripts local. Labels allowed: the algorithm names, RFC 1071, Adler-32 seed=1, little/big-endian. Must not imply tamper resistance. Within VSG-CHECKSUM-CALC this is the parallel algorithm comparison, not a single engine.
- **Avoid:**
    - Do not imply these checksums resist tampering — an attacker can adjust bytes to hit any target
    - Do not show Adler-32 seeded at 0 — it starts at 1
    - Do not attach the endianness toggle to byte-wise algorithms — only the 16/32-bit word sums are affected
    - Do not present the Internet checksum as a polynomial CRC
- **Alt text:** One payload byte-run feeding parallel rows for sum, XOR, Fletcher, Adler-32 and RFC 1071, so an engineer can scan for the algorithm a device's trailer matches.
- **Export filename:** `ambisecure-resources-tools-checksum-1200x630.png`
- **Visual similarity group:** VSG-CHECKSUM-CALC
- **Currently uses:** resources.png
- **Notes:** Overlaps the LRC tool (shares an XOR row) and points at the CRC tool; consolidation candidate across the three integrity calculators.

## 159 — SHA Hash Generator

- **Record number:** 159
- **Page name:** SHA Hash Generator
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/sha-hash-generator/
- **Section:** Resource
- **Page type:** CALCULATOR
- **Primary topic:** Other | **Secondary:** Certificate lifecycle; PKI
- **Design priority:** P2
- **Approved headline:** SHA digests computed in your browser
- **Alternative headline:** One input, four SHA-2 digests
- **Category label:** TOOL
- **Core message:** Compute SHA-1/256/384/512 digests of text, hex, or a local file entirely in the browser via Web Crypto, with matching hex and Base64 output and nothing uploaded.
- **Audience:** Security practitioner
- **Diagram type:** TECHNICAL WORKBENCH
- **Visual concept:** Dominant object: a single horizontal byte stream labelled for the three input modes (Text UTF-8 / Hex bytes / File) feeding one crypto.subtle.digest block, which fans out into four stacked digest rails of visibly increasing length. Exactly five nodes: input bytes, crypto.subtle.digest, the four-rail digest stack (SHA-1 160-bit drawn greyed and tagged legacy, then SHA-256, SHA-384, SHA-512), a hex encoder and a Base64 encoder — the last two rendering the same digest twice and joined by an equals mark so the encodings read as identical bytes, not different values. The whole flow is enclosed inside a drawn browser-viewport boundary; nothing crosses it, and the only external element is a struck-through upload arrow at the edge marking that no bytes reach a server. Allowed labels: crypto.subtle.digest, SHA-1/256/384/512, 160/256/384/512-bit, hex, Base64, no upload; must not imply reversal, decryption, key material, or that SHA-3 or SHA-224 are computable here. Within VSG-CRYPTO-CALC this page's variation is the one-to-many fan-out of a single input into four digest lengths, with the encoding pair as the terminal nodes.
- **Avoid:**
    - Do not draw any network or upload arrow to a server — hashing runs in-browser through crypto.subtle.digest
    - Do not show SHA-3, Keccak, SHAKE, SHA-224 or SHA-512/256 as available algorithms
    - Do not depict hashing as reversible or as encryption — no decrypt arrow, no key icon
    - Do not present SHA-1 as safe for new signatures, mark it legacy and collision-broken
    - Do not render the hex and Base64 outputs as two different digest values
- **Alt text:** Diagram of AmbiSecure's client-side SHA tool: one byte stream fanning into SHA-1/256/384/512 rails, rendered as hex and Base64, with no network path out.
- **Export filename:** `ambisecure-resources-tools-sha-hash-generator-1200x630.png`
- **Visual similarity group:** VSG-CRYPTO-CALC
- **Currently uses:** resources.png
- **Notes:** Commodity utility category; the only real differentiators are the client-side Web Crypto guarantee and the honest omission of SHA-3/SHA-224. Keep the no-upload boundary visually explicit or the image says nothing the page doesn't.

## 160 — APDU Builder

- **Record number:** 160
- **Page name:** APDU Builder
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/apdu-builder/
- **Section:** Resource
- **Page type:** ENGINEERING TOOL
- **Primary topic:** APDU | **Secondary:** Smart cards;Secure Elements
- **Design priority:** P1
- **Approved headline:** Build a Valid ISO/IEC 7816-4 APDU
- **Alternative headline:** Lc Is Computed, Never Typed
- **Category label:** TOOL
- **Core message:** Composes a byte-exact ISO/IEC 7816-4 command APDU from CLA/INS/P1/P2/data/Le with the length fields derived rather than typed, and parses one back the other way.
- **Audience:** Smart-card engineer
- **Diagram type:** TECHNICAL WORKBENCH
- **Visual concept:** Dominant object: four labelled header chips — CLA, INS, P1, P2 — merging left-to-right into one assembled byte string, with the Lc chip rendered as derived output (tinted, padlocked from editing) rather than an input. Flow: fields compose into bytes, with a thin reverse arrow underneath for the parse-back mode. Max five nodes: (1) the CLA/INS/P1/P2 header chips seeded as SELECT by AID 00 A4 04 00, (2) the Data field A0 00 00 00 03 10 10, (3) the computed Lc = 07, (4) the Le selector with its three states, (5) the emitted APDU 00 A4 04 00 07 A0 00 00 00 03 10 10 00 under a 'Case 4 (short)' badge. Nothing sits inside hardware and nothing is transmitted: no card, no reader, no response — assembly runs locally, which is why it is safe for commands carrying PINs or keys. Labels allowed: CLA, INS, P1, P2, Lc, Data, Le, the case badge, the sample header bytes. Must not imply a card ever answers. Composition, not decoding — the inverse direction from the parser pages.
- **Avoid:**
    - Do not show a card replying 9000 or 6A82 — the builder composes a command and never transmits it
    - Do not draw Lc as a hand-typed input field — it is derived from the Data length, which is the point of the tool
    - Do not put a reader, contactless field or card in the loop — nothing leaves the browser
    - Do not make extended length (a leading 00 then a big-endian 16-bit value) look like the default — short length is the everyday case
- **Alt text:** AmbiSecure APDU builder assembling CLA, INS, P1, P2 and data into an ISO/IEC 7816-4 SELECT command, with Lc derived automatically and the case detected locally.
- **Export filename:** `ambisecure-resources-tools-apdu-builder-1200x630.png`
- **Visual similarity group:** VSG-ENCODING-CONVERTER
- **Currently uses:** resources.png
- **Notes:** Not a parser despite the batch grouping — it composes fields into bytes (parse-back is a secondary mode), so it is filed under VSG-ENCODING-CONVERTER to keep VSG-BYTE-PARSER decode-only. Strong search term and a link hub to the APDU parser, CLA decoder and status-word dictionary.

## 161 — SCP03 Helper

- **Record number:** 161
- **Page name:** SCP03 Helper
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/scp03-helper/
- **Section:** Resource
- **Page type:** CALCULATOR
- **Primary topic:** Secure Elements | **Secondary:** APDU;Provisioning;Personalization
- **Design priority:** P2
- **Approved headline:** How SCP03 Derives Session Keys
- **Alternative headline:** S-ENC, S-MAC, S-RMAC From Two Challenges
- **Category label:** TOOL
- **Core message:** Reproduces the SCP03 key-derivation maths with concrete numbers — three session keys and both cryptograms from two static keys and two challenges — as an in-browser teaching aid.
- **Audience:** Smart-card engineer
- **Diagram type:** PROTOCOL FLOW
- **Visual concept:** Dominant object: a derivation fan — two static base keys at the left widening through one KDF block into five derived values, with the derivation constant printed on each output branch. Max five nodes: (1) static K-ENC / K-MAC (16/24/32-byte AES, equal length), (2) context = host || card, the 16-byte challenge concatenation, (3) the SP 800-108 counter-mode KDF block with AES-CMAC as its PRF, (4) session keys S-ENC (0x04), S-MAC (0x06), S-RMAC (0x07), (5) the two 8-byte cryptograms, card (0x00) and host (0x01), branching off S-MAC rather than the static keys. What stays inside hardware: the real card's static keys and its own derivation never leave the secure element — the page only mirrors the arithmetic using throwaway test values. What communicates externally: nothing; all AES-CMAC runs in Web Crypto locally. Labels allowed: key names with constants, 'AES-CMAC / SP 800-108', an amber 'EDUCATIONAL AID' badge. Must not imply a certified implementation.
- **Avoid:**
    - Do not imply a certified GlobalPlatform implementation — it is an educational aid with no key wrapping, channel state or sequence-counter handling
    - Do not depict real or production keys — the tool takes sample-format throwaway values only
    - Do not swap the cryptograms — the card returns the card cryptogram (0x00) in INITIALIZE UPDATE, the host sends the host cryptogram (0x01) in EXTERNAL AUTHENTICATE
    - Do not reverse the KDF context: it is host || card, never card || host
    - Do not show static keys leaving a secure element or being uploaded anywhere
- **Alt text:** AmbiSecure SCP03 helper deriving S-ENC, S-MAC and S-RMAC plus both cryptograms from static keys and a host||card context using AES-CMAC in the browser.
- **Export filename:** `ambisecure-resources-tools-scp03-helper-1200x630.png`
- **Visual similarity group:** VSG-CRYPTO-CALC
- **Currently uses:** resources.png
- **Notes:** Human review on tone: the page carries an explicit 'not a certified implementation / test keys only' disclaimer, and the image must not read as a production key-management utility. Cryptograms derive under S-MAC, not under the static K-MAC — easy to draw wrong.

## 162 — ICCID Decoder

- **Record number:** 162
- **Page name:** ICCID Decoder
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/iccid-decoder/
- **Section:** Resource
- **Page type:** PARSER
- **Primary topic:** SIM/eSIM | **Secondary:** Telecom authentication; Smart cards; Provisioning
- **Design priority:** P1
- **Approved headline:** ICCID Names the Card, Not the Subscriber
- **Alternative headline:** Catch a Bad Luhn Digit Before Provisioning
- **Category label:** TOOL
- **Core message:** Splits an ICCID into its E.118 fields and checks the Luhn digit locally, so a mistyped card serial is caught before it reaches an HLR/HSS or billing system.
- **Audience:** Telecom operator
- **Diagram type:** DATA PARSER
- **Visual concept:** Dominant object: a dummy ICCID digit strip drawn as it appears laser-etched along the plastic of a SIM body, segmented by E.118 boundaries — the only image in the SIM/eSIM family anchored to a removable card. Flow: the strip reads left to right into exactly five nodes — MII 89 (telecom), country code (1–3 digits), issuer identifier, individual account number, and an optional trailing check digit fed into a small mod-10 Luhn wheel returning pass/fail. A faint ghost of the EF-ICCID elementary file behind the strip shows the same value living on the card itself; the decode runs inside a browser boundary with no upload arrow. Allowed labels: ICCID, E.118, MII 89, Luhn, EF-ICCID, DUMMY. Must not imply the value identifies a subscriber, or that the issuer/account boundary is fixed — it varies by operator and is shown intact.
- **Avoid:**
    - Do not present the ICCID as a subscriber identity — that is the IMSI, whereas the ICCID identifies the card and survives a subscription change
    - Do not fix the length at 20 digits — E.118 allows up to 19 plus an optional check digit, so 19- and 20-digit forms are both valid
    - Do not imply a Luhn failure means a fake or cloned card — some operators never add a check digit
    - Do not show a real SIM number — samples must read as generated dummy values
    - Do not draw an upload or server call — parsing and Luhn validation are fully in-browser
- **Alt text:** E.118 digit strip on a SIM splitting into MII 89, country code, issuer and Luhn digit in AmbiSecure's offline decoder for the card's own serial.
- **Export filename:** `ambisecure-resources-tools-iccid-decoder-1200x630.png`
- **Visual similarity group:** VSG-SIM-ESIM
- **Currently uses:** resources.png
- **Notes:** Highest search intent of the SIM identifier trio and a strong internal-link hub to the IMSI and EID decoders.

## 163 — IMSI Decoder

- **Record number:** 163
- **Page name:** IMSI Decoder
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/imsi-decoder/
- **Section:** Resource
- **Page type:** PARSER
- **Primary topic:** SIM/eSIM | **Secondary:** Telecom authentication; Device identity
- **Design priority:** P2
- **Approved headline:** MCC and MNC Make the PLMN
- **Alternative headline:** IMSI Doesn't Carry Its Own MNC Length
- **Category label:** TOOL
- **Core message:** Splits an IMSI into MCC, MNC and MSIN with an explicit 2- or 3-digit MNC choice, and is honest that it resolves country but never operator.
- **Audience:** Telecom operator
- **Diagram type:** DATA PARSER
- **Visual concept:** Dominant object: a bare 15-digit IMSI ruler with a movable boundary marker sitting between the MNC and MSIN — no card body and no check digit, which is exactly what separates this from the ICCID and EID images in the same family. Flow: fixed-position fields read left to right into exactly five nodes — MCC (3 digits, resolved to a country from a small built-in map), MNC (2 or 3 digits, with the slider showing the choice), MSIN (shown verbatim, uninterpreted), a bracket spanning MCC+MNC labelled PLMN identity, and an operator row deliberately greyed out and tagged 'not resolved'. The ruler lives inside a browser boundary with a 'dummy values only' cue and no network arrow. Allowed labels: IMSI, MCC, MNC, MSIN, PLMN, 3GPP TS 23.003, DUMMY. Must not imply a subscriber lookup or a live operator directory.
- **Avoid:**
    - Do not give the IMSI an MII 89 prefix or a Luhn check digit — those belong to the ICCID, not the IMSI
    - Do not resolve the MNC to a named operator — the tool deliberately leaves that row unresolved
    - Do not fix the MNC at two digits — its length is region-dependent and is not carried inside the IMSI
    - Do not show a real subscriber IMSI or imply a subscriber/HLR database is being queried
    - Do not present the country map as authoritative — it is a curated best-effort subset
- **Alt text:** IMSI digits divided into MCC, MNC and MSIN with a movable operator boundary, showing how AmbiSecure's local decoder identifies a home PLMN.
- **Export filename:** `ambisecure-resources-tools-imsi-decoder-1200x630.png`
- **Visual similarity group:** VSG-SIM-ESIM
- **Currently uses:** resources.png
- **Notes:** The page's scope-and-honesty note (no operator resolution) is a differentiator worth preserving in the visual rather than designing it away.

## 164 — eUICC EID Decoder

- **Record number:** 164
- **Page name:** eUICC EID Decoder
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/euicc-eid-decoder/
- **Section:** Resource
- **Page type:** PARSER
- **Primary topic:** SIM/eSIM | **Secondary:** Secure Elements; Provisioning; Device identity
- **Design priority:** P2
- **Approved headline:** 32 Digits That Address One eUICC
- **Alternative headline:** Some EID Digits Have No Public Meaning
- **Category label:** TOOL
- **Core message:** Decodes a 32-digit eUICC EID into its documented regions and revalidates the two Luhn check digits, while refusing to invent meanings for the issuer-specific digits.
- **Audience:** Telecom operator
- **Diagram type:** DATA PARSER
- **Visual concept:** Dominant object: a soldered-down eUICC package on a board fragment, with a 32-digit EID band arcing out of the chip — the only image in the SIM/eSIM family with silicon in it, versus the plastic card of the ICCID brief and the bare ruler of the IMSI brief. Flow: the band segments into exactly five nodes — digits 1–5 (MII 89 + GSMA format/version), digits 6–30 drawn as a single hatched block tagged 'issuer-specific, not publicly specified', digits 31–32 as a check-digit pair feeding a Luhn wheel, a status strip reading length 32 / MII / Luhn, and a small stack of carrier profiles resting on the chip labelled ICCID + IMSI to make clear the EID names the chip while profiles name the subscription. Everything stays inside a browser boundary; the RSP server is not drawn. Allowed labels: EID, eUICC, SGP.22, SGP.02, E.118, MII 89, Luhn, DUMMY. Must not imply the manufacturer digits encode a country, operator or date.
- **Avoid:**
    - Do not draw a removable SIM card — an eUICC is a soldered-down secure element
    - Do not use eSIM and eUICC interchangeably: the eUICC is the chip, the eSIM profile is what it holds and switches
    - Do not invent meanings for the EUM allocation or serial digits — that layout is issuer-specific and not publicly specified
    - Do not show an EID with a single check digit or a length other than 32 digits — it ends in two Luhn digits
    - Do not show a real device EID, and do not depict the value being sent to an RSP or entitlement server
- **Alt text:** A soldered eUICC and its 32-digit serial banding into telecom prefix, manufacturer region and dual Luhn digits in AmbiSecure's client-side decoder.
- **Export filename:** `ambisecure-resources-tools-euicc-eid-decoder-1200x630.png`
- **Visual similarity group:** VSG-SIM-ESIM
- **Currently uses:** resources.png
- **Notes:** Closest of the three identifier tools to AmbiSecure's secure-element line; promote to P1 if eSIM/eUICC becomes an active commercial push.

## 165 — RSA Key Formats

- **Record number:** 165
- **Page name:** RSA Key Formats
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/rsa-key-formats/
- **Section:** Resource
- **Page type:** COMPARISON
- **Primary topic:** PKI | **Secondary:** Certificate lifecycle
- **Design priority:** P2
- **Approved headline:** One RSA Key, Many Containers
- **Alternative headline:** Which PEM Header Maps to What
- **Category label:** REFERENCE
- **Core message:** Lays the RSA key containers side by side — PKCS#1, PKCS#8, SubjectPublicKeyInfo, PEM/DER and JWK — and generates a throwaway demo pair in-browser so the mapping is concrete.
- **Audience:** PKI engineer
- **Diagram type:** COMPARISON
- **Visual concept:** Dominant object: nesting boxes, not arrows — the same RSA key drawn once and then shown re-wrapped, so containment carries the meaning and no step looks like a transformation of the key itself. Max five nodes: (1) PKCS#1 RSAPrivateKey / RSAPublicKey, the bare RSA integers, header 'RSA PRIVATE KEY', (2) PKCS#8 PrivateKeyInfo — an AlgorithmIdentifier (rsaEncryption) wrapping that PKCS#1 body in an OCTET STRING, header 'PRIVATE KEY', (3) SubjectPublicKeyInfo — AlgorithmIdentifier plus a BIT STRING around RSAPublicKey, header 'PUBLIC KEY', (4) a PEM/DER band showing the identical bytes with and without base64 armour, (5) JWK with kty, n, e. Nothing is inside hardware — these are file containers, not secure-element key stores; nothing communicates externally, as generation and PEM identification run through Web Crypto locally. Labels allowed: PEM header strings, the outer SEQUENCE tag 0x30, JWK field names. Must not imply re-wrapping changes strength.
- **Avoid:**
    - Do not imply that changing container or converting PEM to DER changes the key's strength — it is the same key, re-wrapped
    - Do not show Web Crypto exporting PKCS#1 — the browser exports spki, pkcs8 and jwk only
    - Do not present the demo generator's private key as production material or show it leaving the browser
    - Do not draw 1024-bit as a normal choice — the page marks it LEGACY / INSECURE
    - Do not depict SubjectPublicKeyInfo as a private-key container
- **Alt text:** AmbiSecure reference nesting one RSA key through PKCS#1, PKCS#8, SPKI and JWK, showing PEM as base64-armoured DER with demo keys generated in-browser.
- **Export filename:** `ambisecure-resources-tools-rsa-key-formats-1200x630.png`
- **Visual similarity group:** VSG-COMPARISON-MATRIX
- **Currently uses:** resources.png
- **Notes:** Dual-nature page: a reference table plus a demo key generator. Filed as COMPARISON because the container mapping is the durable value; the generator is secondary and must not dominate the image.

## 166 — ECC Curve Reference

- **Record number:** 166
- **Page name:** ECC Curve Reference
- **Canonical URL:** https://ambisecure.ambimat.com/resources/tools/ecc-curve-reference/
- **Section:** Resource
- **Page type:** REFERENCE DATABASE
- **Primary topic:** Other | **Secondary:** FIDO2; PKI
- **Design priority:** P2
- **Approved headline:** Not every named curve interoperates
- **Alternative headline:** secp256r1, P-256, prime256v1: one curve
- **Category label:** REFERENCE
- **Core message:** A working engineer's map of the elliptic curves actually encountered — NIST prime, secp256k1, Brainpool, and the Curve25519/448 family — showing what each is for and which the browser's Web Crypto can genuinely run.
- **Audience:** PKI engineer
- **Diagram type:** COMPARISON
- **Visual concept:** Dominant object: three labelled family columns standing side by side — NIST prime (P-192 through P-521, Weierstrass, FIPS 186), special and regional (secp256k1 for Bitcoin/Ethereum, Brainpool for European and government stacks), and modern (Ed25519/Ed448 signing, X25519/X448 key agreement) — each column's curves feeding rightward into a single vertical Web Crypto support gate that passes P-256/P-384/P-521 and stamps secp256k1, Brainpool, and the 448-bit curves as reference-only. Five nodes maximum: NIST prime family, secp256k1, Brainpool, the Curve25519/448 family, and the Web Crypto gate. The demo key panel sits below as a small terminal node: a locally generated public key shown as a JWK and as the raw uncompressed 04 || X || Y point, with the private key drawn as a sealed, valueless slot that never emits a line — generated in the browser, never displayed, never stored, never sent. Allowed labels: P-256, P-384, P-521, secp256k1, Brainpool, Ed25519, X25519, prime256v1, Web Crypto, reference only, 04 || X || Y; must not imply that the gate tests security strength rather than browser availability, or that the table is anything but static reference data. Within VSG-REFERENCE-TABLE this page's variation is the three-family column grouping resolved through a single live support gate, rather than a flat lookup grid.
- **Avoid:**
    - Do not show secp256k1, Brainpool, or the 448-bit curves passing the Web Crypto gate — no browser exposes them there
    - Do not depict Ed25519 and X25519 as interchangeable — one signs, the other performs Diffie-Hellman
    - Do not draw secp256k1 and secp256r1/P-256 as the same curve, while secp256r1, P-256 and prime256v1 must read as aliases of one curve
    - Do not print or hint at a private key value in the demo key-pair node — only the public JWK and the 04 || X || Y point are shown
    - Do not present P-192 or P-224 as recommended for new keys
- **Alt text:** Comparison of NIST prime, secp256k1, Brainpool and Curve25519 families in AmbiSecure's curve reference, gated by what a browser's Web Crypto really runs.
- **Export filename:** `ambisecure-resources-tools-ecc-curve-reference-1200x630.png`
- **Visual similarity group:** VSG-REFERENCE-TABLE
- **Currently uses:** resources.png
- **Notes:** Hybrid page — static reference table plus a live demo key generator; the brief leads with the table and keeps the generator subordinate. Links out to COSE Key and X.509 Viewer, so the FIDO/COSE curve-identifier angle is a legitimate secondary hook if a second variant is wanted.
