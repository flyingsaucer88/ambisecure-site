"""SEO override map: tightened titles and meta descriptions for pages whose
existing values would be truncated in Google SERPs.

Targets:
- title <=65 chars (hard cap 70; Google truncates at ~60 char display width)
- meta description <=160 chars (hard cap 175; Google truncates at ~155-160)

Keys are paths relative to the repo root. Each entry replaces the exact text
between <title>...</title> and the content="..." of <meta name="description">.

Editorial principle: preserve the substantive claim and brand suffix; drop
keyword-stuffing tails ("X, Y, Z & more parsers") and descriptive sub-clauses
that only existed for keyword padding.
"""

OVERRIDES = {
  # ===== Top-level / hub pages =====
  'index.html': {
    'title': 'AmbiSecure — Hardware-rooted identity: FIDO, JavaCard, V2X PKI',
  },
  'industries/index.html': {
    'title': 'Industries — BFSI, Government, Telecom, IoT, Transit | AmbiSecure',
  },
  'industries/transportation/index.html': {
    'title': 'Transportation — Transit ticketing & validator platforms | AmbiSecure',
  },
  'industries/government-and-defence/index.html': {
    'title': 'Government & Defence — PIV, eID, civil-servant auth | AmbiSecure',
  },
  'industries/smart-cities/index.html': {
    'title': 'Smart cities — multi-application credentials at scale | AmbiSecure',
  },
  'products/index.html': {
    'title': 'Products — FIDO authenticators, JavaCard applets, IoT SE | AmbiSecure',
  },
  'solutions/index.html': {
    'title': 'Solutions — passwordless, IoT root of trust, provisioning | AmbiSecure',
  },
  'solutions/passwordless-mfa/index.html': {
    'title': 'Passwordless & MFA — hardware-bound enterprise auth | AmbiSecure',
  },
  'solutions/passwordless-enterprise/index.html': {
    'title': 'Passwordless Enterprise — real, not hidden passwords | AmbiSecure',
  },
  'solutions/government-identity/index.html': {
    'title': 'Government Identity — high-assurance, attested | AmbiSecure',
  },
  'solutions/transit-ticketing/index.html': {
    'title': 'Transit ticketing — closed-loop deployments | AmbiSecure',
  },
  'solutions/device-identity-at-scale/index.html': {
    'title': 'Device Identity at Scale — hardware roots, lifecycle | AmbiSecure',
  },
  'technologies/index.html': {
    'title': 'Technologies — JavaCard, FIDO, Secure Elements, NFC, eSIM | AmbiSecure',
  },
  'technologies/v2x-pki/index.html': {
    'title': 'V2X PKI — IEEE 1609.2 & ETSI TS 103 097 | AmbiSecure',
  },
  'technologies/passkeys/index.html': {
    'title': 'Passkeys — BE/BS, syncable vs device-bound | AmbiSecure',
  },
  'technologies/webauthn/index.html': {
    'title': 'WebAuthn — registration, authentication, attestation | AmbiSecure',
  },
  'technologies/attestation/index.html': {
    'title': 'WebAuthn Attestation — fmt, x5c, MDS, AAGUID | AmbiSecure',
  },
  'resources/index.html': {
    'title': 'Engineering Resources — parsers, references, tools | AmbiSecure',
  },
  'references/index.html': {
    'title': 'Engineering References — smart-card, FIDO, V2X PKI | AmbiSecure',
  },
  'references/ieee-1609-2/index.html': {
    'title': 'IEEE 1609.2 V2X Certificate Reference | AmbiSecure',
  },
  'references/apdu-status/index.html': {
    'title': 'APDU Status Words — ISO 7816, GP, EMV, FIDO | AmbiSecure',
  },
  'references/sgp-32/index.html': {
    'title': 'GSMA SGP.32 IoT eSIM Reference | AmbiSecure',
  },
  'trust/index.html': {
    'title': 'Trust Center — certifications, posture, disclosures | AmbiSecure',
  },

  # ===== Products =====
  'products/iot-security-coprocessor/index.html': {
    'title': 'AmbiSEC IoT Security Co-Processor — dual-domain SE | AmbiSecure',
  },
  'products/iot-solution/index.html': {
    'title': 'AmbiSecure IoT Solution — end-to-end platform | AmbiSecure',
  },
  'products/esim-solution/index.html': {
    'title': 'AmbiSecure eSIM — SGP.22 / SGP.32 eUICC + OIDC | AmbiSecure',
  },
  'products/javacard-applets/index.html': {
    'title': 'JavaCard Applets — FIDO, PIV, OpenPGP, NDEF | AmbiSecure',
  },
  'products/piv-card/index.html': {
    'title': 'PIV Smart Card — contact + contactless ID-1 | AmbiSecure',
  },
  'products/piv-nano-sim-applet/index.html': {
    'title': 'PIV Nano-Card Applet — secure-element PIV | AmbiSecure',
  },
  'products/fido2-nano-sim-applet/index.html': {
    'title': 'FIDO2 Nano-Card Applet — embedded SE authenticator | AmbiSecure',
  },

  # ===== Services =====
  'services/javacard-development/index.html': {
    'title': 'JavaCard Applet Development — full-cycle JCOP | AmbiSecure',
  },
  'services/tool-chain-development/index.html': {
    'title': 'Tool-Chain Development — bio, key manager, loader | AmbiSecure',
  },
  'services/tool-chain-development/bio-enrollment-app/index.html': {
    'title': 'Bio Enrollment App — match-on-card biometrics | AmbiSecure',
  },
  'services/tool-chain-development/ndef-personalisation/index.html': {
    'title': 'NDEF Personalisation Tool — NFC Forum NDEF | AmbiSecure',
  },
  'services/tool-chain-development/security-key-manager/index.html': {
    'title': 'Security Key Manager — enterprise key lifecycle | AmbiSecure',
  },
  'services/tool-chain-development/multi-card-applet-loader/index.html': {
    'title': 'Multi-Card Applet Loader — SCP03 CAP loader | AmbiSecure',
  },

  # ===== Resources / Tools =====
  'resources/tools/sequence-diagram-generator/index.html': {
    'title': 'Sequence Diagram Generator — auth, V2X, eSIM flows | AmbiSecure',
    'description': 'Client-side sequence diagram generator for security engineers. WebSequenceDiagrams syntax in, clean SVG/PNG out. Templates for FIDO2, SCP03, eSIM SGP.32, V2X PKI.',
  },
  'resources/tools/apdu-parser/index.html': {
    'title': 'APDU Parser — ISO 7816-4 command & response | AmbiSecure',
  },
  'resources/tools/pem-der/index.html': {
    'title': 'PEM ↔ DER Converter — client-side | AmbiSecure',
  },
  'resources/tools/base64-cert/index.html': {
    'title': 'Base64 Certificate Decoder | AmbiSecure',
  },
  'resources/tools/cert-fingerprint/index.html': {
    'title': 'Certificate Fingerprint — SHA-1/256/512 | AmbiSecure',
  },
  'resources/tools/hex-bytes/index.html': {
    'title': 'HEX ↔ Byte-Array Converter | AmbiSecure',
  },

  # ===== Blog (current) =====
  'blog/apdu-from-first-principles/index.html': {
    'title': 'APDU from First Principles — CLA, INS, P1/P2, SW | AmbiSecure',
  },
  'blog/lava-lamps-and-cryptographic-entropy/index.html': {
    'title': 'Lava Lamps and Cryptographic Entropy | AmbiSecure',
    'description': "How Cloudflare's lava-lamp Wall of Entropy feeds randomness pools — and why hardware TRNGs in secure-element silicon underpin TLS, FIDO, V2X, and eSIM.",
  },
  'blog/how-v2x-pki-works/index.html': {
    'title': 'How V2X PKI Works — EA, AA, pseudonymous certs | AmbiSecure',
  },
  'blog/device-identity-at-manufacturing-scale/index.html': {
    'title': 'Device Identity at Manufacturing Scale | AmbiSecure',
    'description': 'Per-device keys on the personalisation line, HSM-backed SCP03 custody, OTA rotation, revocation across tiers — V2X / eSIM / IoT convergence in engineering depth.',
  },
  'blog/why-software-only-device-trust-fails/index.html': {
    'title': 'Why Software-Only Device Trust Fails | AmbiSecure',
    'description': 'Why field-deployed hardware cannot rely on software identity: firmware extraction, key cloning, replay, fleet-scale compromise. Software vs TPM vs secure element.',
  },
  'blog/secure-elements-in-connected-vehicles/index.html': {
    'title': 'Secure Elements in Connected Vehicles | AmbiSecure',
  },
  'blog/pseudonymous-certificates-and-privacy/index.html': {
    'title': 'Pseudonymous Certificates and Privacy in V2X | AmbiSecure',
    'description': 'The privacy property of V2X PKI in depth: unlinkability, Butterfly Key Expansion, EA/AA split, and revocation that does not de-anonymise the fleet.',
  },
  'blog/implementing-fido2-developer-guide/index.html': {
    'title': 'Implementing FIDO2 — a developer guide | AmbiSecure',
  },
  'blog/pki-credential-issuance-workforce-government/index.html': {
    'title': 'PKI Credential Issuance — workforce, government | AmbiSecure',
  },
  'blog/smart-cards-vs-fido-tokens-vs-passkeys/index.html': {
    'title': 'Smart Cards vs FIDO Tokens vs Passkeys | AmbiSecure',
  },
  'blog/understanding-webauthn-attestation-objects/index.html': {
    'title': 'Understanding WebAuthn Attestation Objects | AmbiSecure',
  },

  # ===== Blog archive =====
  'blog/archive/workplace-biometrics/index.html': {
    'title': 'Workplace Biometrics — the New Normal | AmbiSecure (Archive 2020)',
  },
  'blog/archive/emv-certification-in-public-transport/index.html': {
    'title': 'EMV Certification in Public Transport | AmbiSecure (Archive 2020)',
  },
  'blog/archive/common-misconceptions-about-2fa/index.html': {
    'title': 'Common Misconceptions About 2FA | AmbiSecure (Archive 2021)',
  },
  'blog/archive/how-chip-based-epassports-work/index.html': {
    'title': 'How Chip-Based ePassports Work | AmbiSecure (Archive 2021)',
  },
  'blog/archive/sms-otp-disadvantages/index.html': {
    'title': 'SMS-Based OTP Disadvantages | AmbiSecure (Archive 2021)',
  },
  'blog/archive/mfa-in-government/index.html': {
    'title': 'MFA in Government Sector | AmbiSecure (Archive 2021)',
  },
  'blog/archive/single-sign-on-vs-mfa/index.html': {
    'title': 'Single Sign-On vs MFA | AmbiSecure (Archive 2021)',
  },
  'blog/archive/consumer-biometrics-and-privacy/index.html': {
    'title': 'Consumer Biometrics & Privacy | AmbiSecure (Archive 2020)',
  },
  'blog/archive/public-transport-ticketing-part-1/index.html': {
    'title': 'Public Transport Ticketing (Part 1) | AmbiSecure (Archive 2020)',
  },
  'blog/archive/public-transport-ticketing-part-2/index.html': {
    'title': 'Public Transport Ticketing (Part 2) | AmbiSecure (Archive 2020)',
  },
  'blog/archive/public-transport-ticketing-part-3/index.html': {
    'title': 'Public Transport Ticketing (Part 3) | AmbiSecure (Archive 2020)',
  },
  'blog/archive/introduction-to-java-card/index.html': {
    'title': 'Introduction to Java Card | AmbiSecure (Archive 2020)',
  },

  # ===== Videos =====
  'videos/setup-ambisecure-card-desktop/index.html': {
    'title': 'Set up AmbiSecure card on desktop (U2F/FIDO) | Videos',
  },
  'videos/setup-ambisecure-card-facebook/index.html': {
    'title': 'Set up AmbiSecure card on Facebook (U2F/FIDO) | Videos',
  },
  'videos/setup-ambisecure-card-gmail/index.html': {
    'title': 'Set up AmbiSecure card on Gmail (U2F/FIDO) | Videos',
  },
  'videos/setup-ambisecure-card-mobile-facebook/index.html': {
    'title': 'Set up card on phone — Facebook | AmbiSecure Videos',
  },
  'videos/setup-ambisecure-card-mobile-gmail/index.html': {
    'title': 'Set up card on phone — Gmail | AmbiSecure Videos',
  },
}


# ===== Description-only overrides for pages whose title is fine but
# meta description was over the 175-char SERP cap. Pages already present
# in OVERRIDES above with a 'description' key get it applied there. =====

DESCRIPTION_ONLY = {
  'blog/secure-elements-in-connected-vehicles/index.html':
    'The secure element in connected vehicles: key isolation, hardware-bound identity, anti-cloning, secure boot, OTA trust anchors. SIM, MFF2, TPM vs HSM vs SE.',
  'blog/how-v2x-pki-works/index.html':
    'V2X PKI in engineering depth: Root CA, EA, AA, EC, PC, HashedId8, Butterfly Key Expansion, CRL/CTL. IEEE 1609.2 + ETSI TS 102 941 in practice.',
  'products/iot-security-coprocessor/index.html':
    'AmbiSEC is a dual-domain IoT security co-processor: MCU runs the app, the crypto domain holds keys, signs, verifies, and authenticates secure OTA.',
  'references/index.html':
    'Engineering reference DB: APDU status words, EMV tags, ISO 7816, COSE algs, FIDO AAGUIDs, DESFire, GlobalPlatform, ASN.1, X.509, IEEE 1609.2, SGP.32.',
  'products/fido2-nano-sim-applet/index.html':
    'FIDO2 / CTAP2 applet on a CC EAL5+ secure element. Nano-card (4FF) and MFF2 packages. ECC P-256, ISO/IEC 7816 contact + 14443 contactless.',
  'blog/how-fido-authentication-works/index.html':
    'A clear, non-academic explanation of how FIDO2 / WebAuthn actually works — registration, authentication, origin binding, what device and server do.',
  'blog/sim-based-fido2-authenticators/index.html':
    'How nano-card and MFF2 secure elements act as roaming or embedded FIDO2 authenticators — threat-model gains and enterprise deployment economics.',
  'products/piv-nano-sim-applet/index.html':
    'PIV-compatible JavaCard applet on a CC EAL5+ secure element. Nano-card (4FF) and MFF2 packages. Four cert slots, RSA + ECC, hardware-backed store.',
  'references/iso-21177/index.html':
    'ISO 21177 reference — ITS station security service architecture, secure session establishment, and the bridge from 1609.2 / 102 941 PKI to session protocols.',
  'resources/tools/v2x-cert-chain-validator/index.html':
    'Client-side structural validator for IEEE 1609.2 V2X cert chains. Checks parse, issuer linkage by HashedId8, validity, signature schemes.',
  'products/piv-card/index.html':
    'PIV-compatible JavaCard applet on an ID-1 smart card with contact + contactless. Four cert slots, RSA + ECC, Windows/macOS logon, PKCS#11, FIPS 201 surface.',
  'blog/archive/common-misconceptions-about-2fa/index.html':
    'Unpacks common misconceptions about 2FA — what it actually defends against, where SMS codes fall short, why hardware-rooted second factors hold up.',
  'blog/archive/emv-certification-in-public-transport/index.html':
    'A practical look at EMV certification in public transport — which certifications apply, roles of acquirer / scheme / vendor / authority, typical timeline.',
  'blog/javacard-applet-development-enterprise-identity/index.html':
    'Building JavaCard applets that ship: AID design, lifecycle, secure messaging, personalisation, and the mistakes to avoid in enterprise identity.',
  'blog/archive/introduction-to-java-card/index.html':
    'An introduction to JavaCard — how applets run securely on smart cards and small-memory secure elements, and what the runtime enables for FIDO, PIV, ePassport.',
  'technologies/passkeys/index.html':
    'Passkeys are WebAuthn credentials with BE/BS posture. The engineering page — what to require, what to accept, what to reject in device-bound vs syncable.',
  'blog/archive/consumer-biometrics-and-privacy/index.html':
    'Deploying biometric auth while meeting modern privacy expectations — match-on-device vs match-on-server, template storage, and the regulatory shape.',
  'solutions/device-identity-at-scale/index.html':
    'Architecture for device identity at scale: hardware roots of trust, manufacturing-time provisioning, OTA lifecycle, V2X EA/AA, eSIM SM-DP+, fleet revocation.',
  'blog/archive/workplace-biometrics/index.html':
    'How workplace biometrics layer onto existing auth — face / fingerprint / palm, privacy controls that keep them defensible, where they sit beside FIDO and MFA.',
  'search/index.html':
    'Sitewide client-side search across products, services, technologies, solutions, industries, case studies, references, blog, and archive. No backend.',
  'resources/tools/javacard-cap/index.html':
    'Explore JavaCard CAP file components (Header, Directory, Applet, Import, ConstantPool, Class, Method, StaticField, RefLocation, Export, Descriptor, Debug).',
  'blog/archive/fast-identity-online/index.html':
    'A primer on FIDO and the Universal Second Factor model — how FIDO replaces shared secrets with hardware-bound credentials, and why phishing resistance changes.',
  'blog/archive/cyber-attacks-in-india-part-2/index.html':
    'Part two of a three-part analysis of major cyber attacks in India — attack patterns, identity weaknesses they exploited, and the auth posture that would have helped.',
  'blog/archive/public-transport-ticketing-part-3/index.html':
    'Part three of the AFC series — comparative notes across countries, what was common in mature ticketing, and where hardware-rooted SAMs sit in the stack.',
  'about/certifications/index.html':
    'AmbiSecure certifications, conformance, and trust posture — FIDO, JavaCard 3.x, GlobalPlatform 2.3.1, ISO 7816, ISO 14443, NIST SP 800-73, plus disclaimers.',
  'industries/connected-mobility/index.html':
    "Hardware-backed identity for V2X infrastructure — SE integration for OBUs and RSUs, V2X PKI architecture, and ITS cert lifecycle for India's connected road ecosystem.",
  'references/ieee-1609-2/index.html':
    'IEEE 1609.2 V2X cert reference — structure, COER encoding, IssuerIdentifier, ToBeSignedCertificate, validity, verification key, signatures, vs X.509.',
  'blog/archive/cyber-attacks-in-india-part-3/index.html':
    'Part three of a three-part analysis of cyber attacks in India — closing on systemic gaps in incident response, identity hygiene, hardware-rooted adoption.',
  'blog/cyber-security-threats-overview/index.html':
    'A modern, clear-eyed overview of the cyber-security threats that drive identity and hardware-credential decisions in 2026 — phishing, MFA bypass, SIM swap.',
  'blog/archive/mfa-in-government/index.html':
    'Why government identity programmes are adopting MFA, how MFA holds up against phishing and credential theft, and where hardware-rooted authenticators sit.',
  'products/piv-usb-key/index.html':
    'PIV-compatible JavaCard applet in a USB-A / USB-C key. CCID + WebAuthn dual interface, smart-card logon, PKCS#11, SSH agent forwarding, CC EAL5+ SE.',
  'solutions/phishing-resistant-authentication/index.html':
    'Phishing-resistant MFA has a precise meaning — origin-bound, hardware-backed credentials. What WebAuthn buys, and how it maps to AAL3 / CISA / OMB M-22-09.',
  'technologies/ctap2/index.html':
    'CTAP2 is the FIDO Client-To-Authenticator Protocol — wire format browsers use to talk to USB-HID, NFC, and BLE roaming authenticators. Commands, transports.',
  'blog/archive/enterprise-security-threats/index.html':
    'A field overview of enterprise security threats in the cloud era — how the attack surface expands with new platforms, and where hardware identity narrows it.',
  'technologies/fido2/index.html':
    'FIDO2 is two specs working together: WebAuthn (W3C) and CTAP2 (FIDO Alliance). What each does, what is in the family, and how certification levels work.',
  'solutions/v2x-security/index.html':
    'Cryptographic trust architecture for V2X infrastructure — EA/AA PKI, pseudonymous certificates, hardware-isolated key storage, secure manufacturing.',
  'blog/pki-credential-issuance-workforce-government/index.html':
    'Issuing X.509 credentials at workforce or government scale is more architecture than crypto — RA, CA, key custody, attestation, lifecycle, audit.',
  'products/piv-bio-card/index.html':
    'PIV-compatible JavaCard applet on a biometric smart card with on-card fingerprint sensor. Three-factor auth (have / know / are) on one ID-1 card. CC EAL5+ SE.',
  'blog/platform-vs-roaming-authenticators/index.html':
    'Platform and roaming FIDO2 authenticators look interchangeable on a slide and behave differently in production. The decision matrix and the right hybrid mix.',
  'resources/tools/ieee-1609-2-parser/index.html':
    'Client-side IEEE 1609.2 cert parser for V2X / ITS PKI. Decodes hex, Base64, and PEM-wrapped certificates into a field tree with standards references.',
  'technologies/webauthn/index.html':
    'WebAuthn (W3C) — registration and authentication ceremonies, clientDataJSON, authenticatorData, attestation objects, RP ID rules, BE/BS flags, with diagrams.',
  'blog/archive/iot-security-challenges-part-1/index.html':
    'Part one of a two-part look at IoT security — how billions of devices talk to enterprise systems, the attack surface that follows, and the trust anchors that contain it.',
  'blog/archive/security-future-for-government/index.html':
    'How governments move from password-only access to MFA for citizen and employee identity — and where hardware-rooted credentials reshape the threat model.',
  'blog/credential-lifecycle-management/index.html':
    "Credentials don't just get issued and used — they get re-issued, rotated, recovered, and revoked. The lifecycle every hardware-credential programme has to design.",
  'blog/understanding-webauthn-attestation-objects/index.html':
    'WebAuthn attestation as engineering, not spec text — the seven formats, the verification pipeline, MDS BLOB, AAGUID allow-lists, production pitfalls.',
  'products/onepass-platform/index.html':
    'OnePass is a unified hardware-backed identity platform — smart card, USB key, validation server, lifecycle. Built for device-bound rather than syncable identity.',
  'references/etsi-ts-103-097/index.html':
    'ETSI TS 103 097 reference — V2X SecuredMessage structure, header info fields, signer-info modes, profile constraints, and equivalence with IEEE 1609.2.',
  'references/javacard-cap/index.html':
    'Reference for the 12 standard JavaCard CAP file components — Header, Directory, Applet, Import, ConstantPool, Class, Method, StaticField, and friends.',
  'blog/designing-enterprise-passwordless-systems/index.html':
    'What a passwordless rollout actually looks like at workforce scale — nine load-bearing components, recovery flow, attestation policy, lifecycle, migration.',
  'resources/webauthn/index.html':
    'WebAuthn engineering reference — registration, authentication, attestation, RP ID rules, BE/BS flags, troubleshooting. Static, fast, copy-able code samples.',
  'blog/archive/what-is-passwordless-authentication/index.html':
    'A primer on passwordless authentication — what it actually means, how FIDO and biometrics replace shared secrets, why hardware-bound credentials sit at the centre.',
  'blog/piv-vs-usb-tokens-vs-embedded/index.html':
    'Workforce identity matrix: PIV smart card vs USB token vs embedded secure element. Lifecycle, physical-logical convergence, certificate workflows.',
  'resources/tools/desfire-file-settings/index.html':
    'Decode the DESFire GetFileSettings response — file type, comms settings, access rights word, per-type fields (Std / Backup / Value / Linear / Cyclic Record / TMAC).',
  'blog/smart-cards-vs-fido-tokens-vs-passkeys/index.html':
    'A decision-grade comparison of smart-card authenticators, dedicated FIDO keys, and passkeys — threat model, lifecycle, recovery, choosing per deployment.',
  'blog/transit-validators-offline-trust-architecture/index.html':
    'Closed-loop transit ticketing has to keep collecting fares when the backend is unreachable. The architecture that lets validators do it without phoning home.',
  'resources/tools/fido-mds-explorer/index.html':
    'Browse the AAGUID directory in metadata-style cards — vendor, model, transports, BE=0 posture. Searchable. Production should fetch the FIDO MDS BLOB.',
  'blog/archive/securing-iiot-infrastructure/index.html':
    'Why industrial IoT remains a high-value target — markets driving adoption, trust gaps in legacy OT, and how hardware-rooted device identity tightens them.',
  'blog/why-hardware-backed-identity-matters/index.html':
    'Hardware moves the cost-per-extraction of a credential up by orders of magnitude. The threat surfaces software cannot defend, and what hardware changes.',
  'blog/archive/iot-security-challenges-part-2/index.html':
    'Part two of a two-part look at IoT security — practical mitigations: hardware root of trust, signed firmware update, attestation, identity in a secure element.',
  'references/sgp-32/index.html':
    'GSMA SGP.32 IoT eSIM reference — eUICC architecture, IPA (IoT Profile Assistant), SM-DP+, SM-DS, IoT Profile Discovery, parallels to V2X EA / AA lifecycle.',
  'resources/tools/pfx-inspector/index.html':
    'Inspect the structure of a .pfx / .p12 PKCS#12 archive — bag types, encryption schemes, embedded certificates. Client-side; password-decryption is a TODO.',
  'services/index.html':
    'AmbiSecure engineering services — JavaCard applet development, FIDO Validation Server, tool-chain development (bio enrollment, key manager, loader, NDEF).',
  'technologies/attestation/index.html':
    'WebAuthn attestation — fmt formats, attStmt structure, x5c chain validation, FIDO MDS BLOB integration, AAGUID allow-listing, enterprise attestation.',
}

