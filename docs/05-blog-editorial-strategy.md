# 05 · Blog Editorial Strategy

## Mandate

> Knowledge sharing happens **only** through Blog. Resources is utilities-only.
> Blogs must read like they were written by real engineers — deployment-focused, technically deep, practical, not AI-generic.

## Tone

- Lead with a concrete problem or scenario.
- Show real APDUs, real status words, real key sizes — not vague "secure" hand-waving.
- Reference standards by document number (ISO/IEC 7816-4, GlobalPlatform 2.3.1, FIDO CTAP2, GSMA SGP.22, etc.).
- Code blocks are tested, not pseudocode.
- No "in today's threat landscape…" intros.
- Sign-off when relevant: a "What this means for your deployment" closer.

## Topic clusters and pillar pages

Each cluster has one **cornerstone pillar page** (long, ~3000+ words, links to every cluster post) and 4-7 supporting posts. Pillars become long-tail SEO magnets and the natural target for sales-led content.

| Cluster | Cornerstone pillar | Maps to |
|---|---|---|
| **JavaCard & Applet Engineering** | "JavaCard from First Principles: Bytecode, Lifecycle, and CAP Files" | `/products/javacard-applets/`, `/services/javacard-development/` |
| **FIDO & Passwordless** | "Implementing FIDO2 Authentication: A Complete Developer Guide" *(already exists — promoted to pillar)* | `/products/onepass-card/`, `/services/fido-validation-server/`, `/solutions/passwordless-mfa/` |
| **Secure Elements & Trust Anchors** | "Secure Elements Demystified: SE vs TEE vs TPM vs HSM" | `/technologies/secure-elements/`, `/products/iot-security-chipset/` |
| **NFC, DESFire & Smart Cards** | "DESFire EV3 in Production: Authentication, Sessions, and Pitfalls" | `/technologies/nfc-desfire/`, `/products/tappable/` |
| **eSIM, eUICC & Secure Provisioning** | "eSIM RSP Architecture: SM-DP+, SM-DS, and the Profile Lifecycle" | `/technologies/esim/` (links out to esim.ambimat.com) |
| **APDU & Smart Card Protocols** | "APDU from First Principles: CLA, INS, P1/P2, Le, Lc, and SW1/SW2" | `/technologies/apdu/`, all card products |
| **Cryptography in Embedded Systems** | "Cryptographic Primitives for Embedded Engineers: ECC, RSA, AES, HMAC" | `/technologies/cryptography/` |
| **IoT Security & Device Identity** | "Hardware Root of Trust for IoT: From Provisioning to Field Update" | `/products/iot-security-chipset/`, `/solutions/iot-root-of-trust/` |
| **Secure Manufacturing & Personalization** | "Secure Personalization Lines: Keys, Splits, KMS, and Audit Trails" | `/services/tool-chain-development/`, `/solutions/secure-provisioning/` |

## Master post list (35 posts)

Each row gives: title · slug · category · target keyword · meta description (max ~155 chars) · search intent · depth · CTA.

### JavaCard & Applet Engineering (5 posts)

1. **"JavaCard from First Principles: Bytecode, Lifecycle, and CAP Files"** *(pillar)*
   - slug: `javacard-from-first-principles`
   - target: `javacard tutorial`, `javacard applet development`
   - meta: A practical, deployment-focused walkthrough of JavaCard internals — bytecode, lifecycle, CAP files, install parameters, and SCP03 loading.
   - intent: informational + commercial-investigation
   - depth: deep · CTA: "Talk to our applet team"
2. **"Writing Your First JavaCard Applet: install(), select(), process()"**
   - slug: `writing-your-first-javacard-applet`
   - target: `javacard applet hello world`, `javacard process method`
   - depth: medium · CTA: link to the JavaCard pillar
3. **"GlobalPlatform Loading: SCP03 and the Install-for-Load Flow Explained"**
   - slug: `globalplatform-scp03-install-for-load`
   - target: `globalplatform scp03`, `install for load apdu`
   - depth: deep · CTA: "Try the Multi-Card Applet Loading Tool"
4. **"Persistent vs Transient Memory in JavaCard: When and Why"**
   - slug: `javacard-persistent-vs-transient-memory`
   - target: `javacard transient array`, `eeprom wear javacard`
   - depth: medium
5. **"Debugging JavaCard Applets Without a JTAG: Tools and Techniques"**
   - slug: `debugging-javacard-applets`
   - target: `javacard debugging`, `applet debug log`
   - depth: medium

### FIDO & Passwordless (4 posts)

6. **"Implementing FIDO2 Authentication: A Complete Developer Guide"** *(pillar — already exists, slug preserved as `implementing-fido2-developer-guide`)*
7. **"WebAuthn vs CTAP2: Where the Browser Ends and the Authenticator Begins"**
   - slug: `webauthn-vs-ctap2`
   - target: `webauthn ctap2 difference`, `fido stack architecture`
   - depth: deep
8. **"Why Use Multi-Factor Authentication?"** *(existing — preserved at `why-use-multi-factor-authentication`)*
9. **"Top 3 Benefits of Multi-Factor Authentication"** *(existing — preserved at `top-3-benefits-of-mfa`)*

### Secure Elements & Trust Anchors (4 posts)

10. **"Secure Elements Demystified: SE vs TEE vs TPM vs HSM"** *(pillar)*
    - slug: `secure-elements-se-vs-tee-vs-tpm-vs-hsm`
    - target: `se vs tee`, `secure element vs tpm`
    - depth: deep · CTA: "View IoT Security Chipset"
11. **"Choosing a Secure Element: Footprint, Certification, and Cost Trade-offs"**
    - slug: `choosing-a-secure-element`
    - target: `secure element selection`, `cc eal5 chip`
    - depth: medium
12. **"Common Criteria EAL Levels for Hardware Security: A Practitioner's Map"**
    - slug: `common-criteria-eal-levels-explained`
    - target: `cc eal5 explained`, `common criteria certification`
    - depth: medium
13. **"Personalising Secure Elements: Pre-Personalization, Personalization, and Audit"**
    - slug: `personalising-secure-elements`
    - target: `secure element personalization`, `key injection`
    - depth: deep

### NFC, DESFire & Smart Cards (4 posts)

14. **"DESFire EV3 in Production: Authentication, Sessions, and Pitfalls"** *(pillar)*
    - slug: `desfire-ev3-in-production`
    - target: `desfire ev3 authentication`, `aes desfire session`
    - depth: deep
15. **"Decoding ATR: What Your Card Is Telling You at Reset"**
    - slug: `decoding-atr-what-your-card-tells-you`
    - target: `atr parser`, `atr historical bytes`
    - depth: medium · CTA: "Use our ATR parser →"
16. **"NDEF Records on NFC Tags: URI, Text, MIME, and Custom Records"**
    - slug: `ndef-records-on-nfc-tags`
    - target: `ndef record format`, `ndef parser`
    - depth: medium · CTA: "NDEF Personalisation Tool"
17. **"ISO/IEC 14443 vs 15693: Picking the Right Contactless Standard"**
    - slug: `iso-14443-vs-15693`
    - target: `iso 14443 vs 15693`, `contactless protocol`
    - depth: medium

### eSIM, eUICC & Secure Provisioning (3 posts — surface eSIM property)

18. **"eSIM RSP Architecture: SM-DP+, SM-DS, and the Profile Lifecycle"** *(pillar)*
    - slug: `esim-rsp-architecture`
    - target: `esim rsp`, `sm-dp+ explained`
    - depth: deep · CTA: "Explore the eSIM Initiative →" *(link out to esim.ambimat.com)*
19. **"eSIM vs eUICC vs iSIM: Cutting Through the Confusion"**
    - slug: `esim-vs-euicc-vs-isim`
    - target: `esim vs euicc`, `isim vs euicc`
    - depth: medium
20. **"GSMA SGP.22 in Practice: Profile Download Step-by-Step"**
    - slug: `gsma-sgp22-profile-download-walkthrough`
    - target: `sgp22 profile download`, `gsma rsp profile install`
    - depth: deep

### APDU & Smart Card Protocols (3 posts)

21. **"APDU from First Principles: CLA, INS, P1/P2, Le, Lc, and SW1/SW2"** *(pillar)*
    - slug: `apdu-from-first-principles`
    - target: `apdu format`, `apdu cla ins p1 p2`
    - depth: deep · CTA: "Open the APDU parser →"
22. **"The 50 Most Common Status Words and What They Actually Mean"**
    - slug: `common-apdu-status-words-explained`
    - target: `9000 status word`, `6a82 status word`
    - depth: medium · CTA: "SW1/SW2 lookup tool →"
23. **"Extended-Length APDUs: When You Need Them and What Breaks"**
    - slug: `extended-length-apdus`
    - target: `extended length apdu`, `apdu chaining`
    - depth: medium

### Cryptography in Embedded Systems (4 posts)

24. **"Cryptographic Primitives for Embedded Engineers: ECC, RSA, AES, HMAC"** *(pillar)*
    - slug: `cryptographic-primitives-for-embedded-engineers`
    - target: `embedded cryptography`, `ecc vs rsa embedded`
    - depth: deep
25. **"Choosing an ECC Curve: P-256, P-384, Curve25519, and What Cards Actually Support"**
    - slug: `choosing-an-ecc-curve`
    - target: `ecc curve selection`, `p256 vs curve25519`
    - depth: medium
26. **"Why You Should Stop Using ECB Mode (and What to Use Instead)"**
    - slug: `why-stop-using-ecb-mode`
    - target: `aes ecb why bad`, `ecb mode security`
    - depth: medium
27. **"Key Derivation in Smart Cards: KDF, NIST SP800-108, and Card-Specific Quirks"**
    - slug: `key-derivation-smart-cards`
    - target: `kdf smart card`, `nist sp800-108`
    - depth: deep

### IoT Security & Device Identity (4 posts)

28. **"Hardware Root of Trust for IoT: From Provisioning to Field Update"** *(pillar)*
    - slug: `hardware-root-of-trust-for-iot`
    - target: `iot root of trust`, `secure boot iot`
    - depth: deep
29. **"Secure Boot Chains Explained: ROM, BL1, BL2, OS — and Where They Fail"**
    - slug: `secure-boot-chains-explained`
    - target: `secure boot chain`, `rom bootloader trust`
    - depth: medium
30. **"OTA Update Security: Signing, Anti-Rollback, and Recovery"**
    - slug: `ota-update-security-fundamentals`
    - target: `ota firmware signing`, `anti-rollback ota`
    - depth: deep
31. **"Device Attestation in IoT: TPM, EAT, and Why It Matters"**
    - slug: `device-attestation-iot`
    - target: `iot device attestation`, `eat token`
    - depth: medium

### Secure Manufacturing & Personalization (3 posts)

32. **"Secure Personalization Lines: Keys, Splits, KMS, and Audit Trails"** *(pillar)*
    - slug: `secure-personalization-lines`
    - target: `card personalization process`, `key injection workflow`
    - depth: deep
33. **"From Wafer to Wallet: The Lifecycle of a FIDO Card"**
    - slug: `wafer-to-wallet-fido-card-lifecycle`
    - target: `fido card manufacturing`, `smart card lifecycle`
    - depth: medium
34. **"PKI for the Embedded World: Issuing Certificates That Live in Silicon"**
    - slug: `pki-for-embedded-systems`
    - target: `embedded pki`, `device certificate enrollment`
    - depth: medium

### Editorial / industry context (1 post)

35. **"Cyber Security Threats Overview: Phishing, Ransomware, Credential Stuffing, and the Hardware Defence"** *(rehosted from existing `/cyber-security-threats/`)*
    - slug: `cyber-security-threats-overview`
    - target: `cyber security threats overview`, `hardware authentication threats`
    - depth: medium

## Per-post template

Every post page in the repo carries:

- Title (`<h1>`)
- Subtitle / dek
- Eyebrow chip showing category (e.g., `JAVACARD`)
- Post meta: published date · updated date · reading time · author
- Anchor TOC for posts > 1500 words
- 1+ technical diagram or table
- 1+ code/APDU example (in `<pre>`)
- "Related posts" — 3 sibling cards
- "Related products / services" — 1-2 cards
- JSON-LD `Article` block

## Author & freshness

- Posts attributed to authors (real engineering team members or "AmbiSecure Engineering"). The "real engineer" voice is the point — anonymous "AI-generic" tone is forbidden.
- "Last updated" date refreshed when meaningful changes happen — boosts ranking signal.
- Pillar posts revisited every 6 months.

## Backlink opportunities

- Submit pillars to: Hacker News, Reddit r/cryptography, r/embedded, r/RFID, smartcard-focus subreddits, NFC Forum mailing list, FIDO Alliance member resources, GitHub awesome-lists (awesome-cryptography, awesome-iot-security, awesome-smartcard).
- Cite original specs (FIDO, GSMA, GlobalPlatform) — drives backlinks from spec aggregators and technical wikis.
- Offer pillar PDFs for download in exchange for newsletter sign-up.

## Editorial calendar

Phase 1 ships **3 posts** (the existing 3, migrated). Phase 2 adds the **8 pillars** (the cornerstone of every cluster). Phase 3 fills out supporting posts at a 1-2/week cadence. See `docs/08-implementation-roadmap.md`.
