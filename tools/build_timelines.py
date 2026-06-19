#!/usr/bin/env python3
"""Generate /resources/timelines/<slug>/index.html for each standards-evolution topic.

Each timeline page:
  - chronological milestones with year + description + cross-refs
  - JSON-LD CollectionPage + BreadcrumbList
  - cross-links to relevant products / blogs / references
"""
import os, json

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

TIMELINES = [
    {
        'slug': 'fido',
        'title': 'FIDO evolution timeline',
        'eyebrow': 'Standards evolution',
        'h1': 'FIDO &mdash; from FIDO 1.0 to passkeys.',
        'dek': 'The path from FIDO Universal Second Factor to phishing-resistant, hardware-bound, multi-device passkeys &mdash; with the standards milestones, deployment shifts, and ecosystem turning points along the way.',
        'description': 'A chronological timeline of FIDO standards evolution, from FIDO 1.0 / U2F through CTAP, FIDO2, WebAuthn, and modern multi-device passkeys.',
        'entries': [
            ('2012', 'FIDO Alliance formed', 'PayPal, Lenovo, Nok Nok Labs, Validity Sensors, Infineon, and Agnitio found the FIDO Alliance to standardise a passwordless second factor.', 'FIDO Alliance'),
            ('2014', 'FIDO 1.0 published (UAF + U2F)', 'Universal Authentication Framework and Universal Second Factor specifications released. U2F adopted by Google for Gmail; second-factor hardware keys begin to ship.', 'FIDO Alliance UAF / U2F'),
            ('2015', 'Google U2F Security Key rollout', 'Google publishes results showing U2F eliminates phishing of Google accounts among its workforce.', 'U2F deployment'),
            ('2018', 'FIDO2 / WebAuthn Level 1 (W3C Candidate Recommendation)', 'WebAuthn becomes a Web standard; CTAP2.0 defines the authenticator client-to-authenticator protocol. The "FIDO2" brand replaces UAF + U2F.', 'W3C WebAuthn L1 · CTAP2.0'),
            ('2019', 'WebAuthn Level 1 becomes a W3C Recommendation', 'Major browsers (Chrome, Edge, Firefox, Safari) ship platform support. Hardware keys with FIDO2 attestation become the gold standard for high-assurance enterprise MFA.', 'W3C WebAuthn L1 Rec.'),
            ('2020', 'CTAP2.1 work begins; biometric authenticators arrive', 'On-card and on-device biometric verification (BIO-FIDO) starts shipping. PIN-protected resident credentials become viable for consumer-grade products.', 'CTAP2.1'),
            ('2021', 'WebAuthn Level 2 published', 'Algorithm agility, residentKey semantics, large-blob extension, and cleaner conditional-UI flows arrive. Foundation for the passkey UX layer.', 'W3C WebAuthn L2'),
            ('2022', 'Passkeys announced (Apple / Google / Microsoft)', 'Multi-device, synced FIDO credentials &mdash; the WWDC22 announcement marks the consumer pivot from hardware-only keys to platform-synced credentials.', 'Passkeys'),
            ('2023', 'CTAP2.1 finalised; FIDO MDS3 production', 'Discoverable credentials, cred-mgmt, alwaysUv become first-class. The FIDO Metadata Service v3 BLOB becomes the canonical attestation-trust source.', 'CTAP2.1 · FIDO MDS3'),
            ('2024', 'WebAuthn Level 3 working draft', 'Cross-device authentication (CDA, hybrid-transport), conditional mediation v2, and signal-API to remove orphaned credentials reach working-draft state.', 'W3C WebAuthn L3 WD'),
            ('2025', 'Enterprise migration from password+OTP', 'Phishing-resistant MFA mandates (OMB M-22-09; NIST SP 800-63-4 draft AAL3 patterns) push enterprise IdPs to ship synced + hardware-key options side by side.', 'OMB M-22-09 · NIST SP 800-63'),
            ('2026', 'Hardware-bound + synced converge', 'Validation servers begin recording per-credential provenance (synced vs. attested-hardware-bound) so relying parties can apply policy. AmbiSecure validation server ships per-tenant policy on AAGUID + transport.', '<a href="/services/fido-validation-server/">FIDO Validation Server</a>'),
        ],
        'related': [
            ('/technologies/fido/', 'Technology: FIDO / WebAuthn'),
            ('/technologies/passkeys/', 'Technology: passkeys'),
            ('/technologies/ctap2/', 'Technology: CTAP2'),
            ('/services/fido-validation-server/', 'Service: FIDO validation server'),
            ('/blog/sim-based-fido2-authenticators/', 'Blog: SIM-based FIDO2 authenticators'),
            ('/references/webauthn-cose/', 'Reference: WebAuthn COSE algorithms'),
        ],
    },
    {
        'slug': 'piv',
        'title': 'PIV evolution timeline',
        'eyebrow': 'Standards evolution',
        'h1': 'PIV &mdash; from FIPS 201 to derived credentials.',
        'dek': 'Personal Identity Verification has moved from a smart-card mandate for U.S. federal civilian agencies to a credential family that lives on cards, USB tokens, mobile devices, and SIM-resident applets &mdash; while keeping its NIST SP 800-73 functional surface intact.',
        'description': 'A chronological timeline of PIV standards evolution &mdash; FIPS 201, SP 800-73, derived PIV credentials, and the modern multi-form-factor PIV deployment.',
        'entries': [
            ('2004', 'HSPD-12 issued', 'Homeland Security Presidential Directive 12 mandates a common identity standard for U.S. federal employees and contractors.', 'HSPD-12'),
            ('2005', 'FIPS 201 published', 'Personal Identity Verification of Federal Employees and Contractors. The PIV card and the underlying applet architecture are defined.', 'FIPS 201'),
            ('2008', 'NIST SP 800-73-2 / SP 800-78-2', 'Card-side specification matured: card commands, data model, key references; cryptographic algorithm constraints separately specified.', 'SP 800-73-2 · SP 800-78-2'),
            ('2010', 'PIV-I (interoperable) ecosystem', 'Non-federal PIV-Interoperable credentials gain traction in defence industrial base and first-responder communities.', 'PIV-I'),
            ('2013', 'FIPS 201-2 revision', 'Adds optional features: biometric on-card comparison, contactless on-card biometric matching, on-card discoverability. Acknowledges mobile use cases.', 'FIPS 201-2'),
            ('2014', 'SP 800-157 &mdash; Derived PIV Credentials', 'NIST publishes the derived-credential pattern: a smartphone-resident credential cryptographically derived from a parent PIV card.', 'SP 800-157'),
            ('2015', 'OPM breach refocuses PIV', 'The OPM credential-theft incident sharpens federal focus on hardware-rooted, phishing-resistant authentication. PIV deployment depth increases.', 'PIV federal mandate'),
            ('2018', 'SP 800-73-4 published', 'Latest functional PIV card spec: BER-TLV data model, key reference codes, on-card biometric. Still the implementation target a decade later.', 'SP 800-73-4'),
            ('2022', 'OMB M-22-09 (zero-trust)', 'White House memo elevates phishing-resistant MFA. Federal IdPs accept PIV cards alongside FIDO2 hardware keys; mobile-derived PIV in scope.', 'OMB M-22-09'),
            ('2024', 'SIM-resident PIV applets in production', 'PIV applets on nano-SIM secure elements ship for OEM and telecom-integrated identity programmes. AmbiSecure PIV nano-SIM applet enters the market with four-slot card edge and FIPS 201 functional surface.', '<a href="/products/piv-nano-sim-applet/">PIV Nano SIM Applet</a>'),
            ('2025', 'Multi-form-factor PIV', 'PIV credentials simultaneously live on cards, USB tokens, mobile devices, and SIM applets. The PIV "card" is now the credential family, not the form factor.', 'PIV ecosystem'),
            ('2026', 'PIV ⇄ FIDO bridging', 'Validation servers treat PIV and FIDO2 as alternative phishing-resistant factors, with per-tenant policy controlling which factor counts for AAL3.', '<a href="/products/onepass-card/">OnePass Card</a>'),
        ],
        'related': [
            ('/products/onepass-card/', 'Product: OnePass Card'),
            ('/products/piv-nano-sim-applet/', 'Product: PIV Nano SIM applet'),
            ('/solutions/government-identity/', 'Solution: government identity'),
            ('/blog/piv-vs-usb-tokens-vs-embedded/', 'Blog: PIV vs USB vs embedded SE'),
        ],
    },
    {
        'slug': 'epassport',
        'title': 'ePassport evolution timeline',
        'eyebrow': 'Standards evolution',
        'h1': 'ePassport &mdash; from BAC to PACE-CAM.',
        'dek': 'Electronic travel documents have evolved from contact-only paper-plus-chip to PACE-protected, biometric-rich, multi-application travel credentials with PKD-distributed trust roots.',
        'description': 'A chronological timeline of ePassport standards evolution: ICAO 9303, BAC, PACE, SAC, EAC, multi-application travel documents.',
        'entries': [
            ('1980', 'First MRZ machine-readable passport', 'Optical-character MRZ added to the printed booklet. The starting point of the digital travel document.', 'ICAO MRZ'),
            ('1998', 'ICAO 9303 Doc 9303 first edition', 'Earliest unified standard for machine-readable travel documents.', 'ICAO 9303 (1998)'),
            ('2003', 'Biometric data on chip recommended', 'ICAO publishes recommendations on biometric facial image storage on a contactless chip.', 'ICAO biometrics'),
            ('2004', 'First chip-enabled passports rolled out', 'Malaysia and Belgium issue the first widely-deployed ePassports with face-image data on chip and Basic Access Control (BAC) protecting the chip read.', 'BAC · ePassport'),
            ('2006', 'PKD launched', 'ICAO Public Key Directory begins distributing CSCA / DSC trust anchors across participating states.', 'ICAO PKD'),
            ('2008', 'Extended Access Control (EAC) v1 in EU', 'EU member states adopt EAC to protect fingerprint biometrics: chip authentication + terminal authentication.', 'EAC v1'),
            ('2012', 'PACE replaces BAC (Doc 9303 7th ed.)', 'Password Authenticated Connection Establishment fixes BAC weaknesses: stronger key derivation, perfect forward secrecy on the chip-reader channel.', 'PACE · ICAO 9303 7e'),
            ('2015', 'Supplemental Access Control (SAC) deployed', 'EU mandates SAC = PACE for new passports issued from 2016. BAC remains as a fall-back for older readers.', 'SAC'),
            ('2017', 'Logical Data Structure 2 (LDS2)', 'Doc 9303 extends the on-chip data model: travel records, visa records, biometric refreshes &mdash; not just static issuance data.', 'LDS2'),
            ('2019', 'DESFire-class travel documents in pilots', 'Some smaller-jurisdiction national-ID + travel-document combinations adopt DESFire EV2 alongside ICAO 9303 chips.', 'DESFire EV2'),
            ('2022', 'eMRTD on phone (Digital Travel Credential)', 'ICAO DTC concept: travel credential extractable from the ePassport chip and bound to a verifiable mobile credential. Pilots in Finland and the Netherlands.', 'ICAO DTC'),
            ('2024', 'Backend platforms for issuance + personalisation', 'In-country enrolment, sovereign personalisation, CSCA-key custody, and PKD upload pipelines become standard parts of national-ID programmes.', '<a href="/services/epassport-platform/">ePassport platform</a>'),
            ('2026', 'Frontend + backend converge', 'A single platform handles enrolment UIs, biometric capture, applet personalisation, DSC signing, and PKD distribution &mdash; with audit hooks across the entire issuance chain.', '<a href="/services/epassport-platform/">ePassport platform</a>'),
        ],
        'related': [
            ('/services/epassport-platform/', 'Service: ePassport platform'),
            ('/solutions/government-identity/', 'Solution: government identity'),
            ('/blog/engineering-epassport-issuance-platforms/', 'Blog: engineering ePassport issuance platforms'),
        ],
    },
    {
        'slug': 'otp-sms',
        'title': 'OTP and SMS authentication evolution timeline',
        'eyebrow': 'Standards evolution',
        'h1': 'OTP / SMS &mdash; from S/Key to deprecation.',
        'dek': 'How one-time passwords were invented, standardised, weaponised, and (slowly) replaced &mdash; from S/Key in 1981 to SS7-attack disclosures in 2017 to NIST&rsquo;s discouragement of SMS OTP in 2025.',
        'description': 'A chronological timeline of one-time-password authentication standards: S/Key, RSA SecurID, HOTP, TOTP, SMS OTP, and the FIDO-driven phishing-resistance pivot.',
        'entries': [
            ('1981', 'S/Key one-time password scheme proposed', 'Leslie Lamport publishes a one-time-password method based on a one-way hash chain &mdash; the conceptual ancestor of modern OTPs.', 'Lamport / S/Key'),
            ('1986', 'RSA SecurID launched', 'Proprietary time-based hardware tokens with a six-digit display become the first widely-deployed OTP product.', 'RSA SecurID'),
            ('1995', 'S/Key formalised in RFC 1760', 'IETF documents the S/Key OTP method.', 'RFC 1760'),
            ('1998', 'RFC 2289 &mdash; OTP system', 'Updates and supersedes RFC 1760 with a more general OTP framework.', 'RFC 2289'),
            ('2005', 'HOTP standardised (RFC 4226)', 'HMAC-based event-counter OTP. Foundation for all modern OTP authenticators.', 'RFC 4226 HOTP'),
            ('2011', 'TOTP standardised (RFC 6238)', 'Time-based OTP &mdash; the algorithm behind Google Authenticator and most mobile authenticator apps.', 'RFC 6238 TOTP'),
            ('2013', 'SMS OTP everywhere', 'Online banking, e-commerce, and government services adopt SMS OTP as a "second factor" at consumer scale &mdash; despite known SMS-channel risks.', 'SMS OTP era'),
            ('2016', 'NIST SP 800-63-3 deprecates SMS for AAL2+', 'NIST draft removes SMS OTP from the recommended AAL2 authenticator types. Final version published 2017.', 'NIST SP 800-63-3'),
            ('2017', 'SS7 phone-number takeover demonstrated', 'Researchers and journalists demonstrate live SMS OTP interception via SS7 attacks. SIM-swap attacks become a routine consumer-fraud vector.', 'SS7 / SIM-swap'),
            ('2019', 'FIDO2 mainstreams phishing-resistant MFA', 'FIDO2 hardware keys and platform authenticators become the reference replacement for OTP in high-assurance deployments.', 'FIDO2'),
            ('2022', 'OMB M-22-09 phishing-resistant MFA mandate', 'U.S. federal civilian executive branch directed to deploy phishing-resistant MFA (read: FIDO2 / PIV), not OTP, by FY24.', 'OMB M-22-09'),
            ('2025', 'NIST SP 800-63-4 final removes SMS', 'Final revision firms up the prohibition on SMS for AAL2+. Banking regulators in EU and APAC follow suit.', 'NIST SP 800-63-4'),
            ('2026', 'OTP relegated to recovery codes only', 'Consumer services keep TOTP as a recovery method; the primary factor is FIDO / passkey or hardware token. The 45-year OTP era effectively ends as a primary factor.', '<a href="/services/fido-validation-server/">FIDO Validation Server</a>'),
        ],
        'related': [
            ('/technologies/fido/', 'Technology: FIDO / WebAuthn'),
            ('/blog/why-use-multi-factor-authentication/', 'Blog: Why use MFA'),
            ('/blog/top-3-benefits-of-mfa/', 'Blog: Top 3 benefits of MFA'),
            ('/blog/archive/sms-otp-disadvantages/', 'Archive: SMS-based OTP disadvantages'),
        ],
    },
    {
        'slug': 'smart-cards',
        'title': 'Smart-card evolution timeline',
        'eyebrow': 'Standards evolution',
        'h1': 'Smart cards &mdash; from telephone card to FIDO authenticator.',
        'dek': 'Forty-five years of smart-card evolution &mdash; from the original contact-card patent through ISO/IEC 7816, GlobalPlatform, JavaCard, contactless DESFire, and modern multi-applet FIDO + PIV co-resident credentials.',
        'description': 'A chronological timeline of smart-card standards and platform evolution: ISO 7816, JavaCard, GlobalPlatform, DESFire, multi-applet smart cards.',
        'entries': [
            ('1974', 'Roland Moreno patents smart card', 'French inventor patents the integrated-circuit memory card &mdash; the conceptual origin of the modern smart card.', 'Moreno patent'),
            ('1983', 'Carte Bancaire and France T&eacute;l&eacute;com cards', 'First widely-deployed smart cards: payment cards in France, prepaid telephone cards across Europe.', 'CB · t&eacute;l&eacute;carte'),
            ('1987', 'ISO/IEC 7816-1/2 first edition', 'Physical characteristics and dimensions of integrated-circuit cards standardised internationally.', 'ISO/IEC 7816'),
            ('1995', 'ISO/IEC 14443 (proximity cards)', 'Contactless 13.56&thinsp;MHz proximity-card interface specified. Foundation of NFC, transit, and contactless payment.', 'ISO/IEC 14443'),
            ('1996', 'JavaCard 1.0', 'Sun Microsystems publishes JavaCard 1.0. The "Java for smart cards" platform begins.', 'JavaCard 1.0'),
            ('1999', 'GlobalPlatform Card Spec 2.0', 'Multi-application card management is standardised. SCP02 secure channel and ISD-based card content management defined.', 'GP 2.0'),
            ('2002', 'MIFARE Classic ubiquitous in transit', 'Contactless smart cards dominate urban public transit. The vulnerabilities that will be disclosed in 2008 are already in the field.', 'MIFARE Classic'),
            ('2005', 'NIST FIPS 201 / PIV card', 'Standardised contact + contactless smart card for federal-employee identity. PIV applet defined.', 'FIPS 201'),
            ('2008', 'MIFARE Classic cryptanalysis published', 'Crypto-1 stream cipher broken in public; transit operators begin migration to DESFire.', 'Crypto-1'),
            ('2011', 'EMV contactless takes off', 'Visa payWave and Mastercard PayPass deploy widely; NFC contactless payments enter the consumer mainstream.', 'EMV contactless'),
            ('2015', 'JavaCard 3.0.5 + GlobalPlatform 2.3.1 SCP03', 'Modern JavaCard + GP combination becomes the baseline for high-assurance smart-card platforms. SCP03 secure channel mandates AES-128 keys.', 'JavaCard 3.0.5 · GP 2.3.1 SCP03'),
            ('2018', 'DESFire EV2 production', 'EV2 brings multi-application support, transaction MAC, secure messaging upgrades. Transit + access-control deploy at scale.', 'DESFire EV2'),
            ('2020', 'FIDO2 smart cards in production', 'FIDO2 applets on JavaCard secure elements ship as the next generation of multi-protocol identity cards.', 'FIDO2 on JC'),
            ('2023', 'Twelve-applet co-resident architecture', 'A single CC EAL6+ smart card carries FIDO2 + PIV + OpenPGP + NDEF + Door Access + OIDC + biometric variants, AID-selectable.', '<a href="/products/javacard-applets/">JavaCard applets</a>'),
            ('2026', 'Smart card as identity hub', 'The modern smart card is no longer one credential &mdash; it is an issuer-policy boundary, with the JCVM firewall isolating up to a dozen credential applets per chip.', '<a href="/products/onepass-card/">OnePass Card</a>'),
        ],
        'related': [
            ('/technologies/javacard/', 'Technology: JavaCard'),
            ('/technologies/desfire/', 'Technology: DESFire'),
            ('/technologies/secure-elements/', 'Technology: Secure Elements'),
            ('/products/javacard-applets/', 'Product: JavaCard applets'),
            ('/products/onepass-card/', 'Product: OnePass Card'),
        ],
    },
    {
        'slug': 'webauthn-passkey',
        'title': 'WebAuthn and passkey evolution timeline',
        'eyebrow': 'Standards evolution',
        'h1': 'WebAuthn &mdash; from credential.create() to synced passkeys.',
        'dek': 'How the web platform absorbed FIDO &mdash; from the W3C Credential Management API in 2016 to ubiquitous platform-synced passkeys in 2024 &mdash; and what each WebAuthn level added along the way.',
        'description': 'A chronological timeline of WebAuthn and passkey evolution &mdash; W3C standardisation, browser support, and the platform shift to synced passkeys.',
        'entries': [
            ('2016', 'W3C Credential Management API', 'The browser foundation for credential storage and retrieval. The WebAuthn standard will live on top of this API.', 'W3C CredMan'),
            ('2017', 'WebAuthn Working Draft', 'W3C Web Authentication WG publishes first public working drafts.', 'W3C WebAuthn WD'),
            ('2018', 'WebAuthn Level 1 Candidate Recommendation', 'Major browsers ship behind a flag. CTAP2.0 published in parallel. The "FIDO2" pairing is official.', 'WebAuthn L1 CR · CTAP2.0'),
            ('2019', 'WebAuthn Level 1 Recommendation', 'Stable W3C Recommendation. Chrome, Edge, Firefox, Safari ship platform support.', 'WebAuthn L1 Rec.'),
            ('2020', 'Conditional UI first proposals', 'Discussion of autofill-style passkey UX begins. The path to passkey ubiquity opens.', 'Conditional mediation'),
            ('2021', 'WebAuthn Level 2 published', 'Adds residentKey / requireResidentKey semantics, large-blob extension, algorithm agility. Foundation for passkeys.', 'WebAuthn L2 Rec.'),
            ('2022', 'Apple, Google, Microsoft announce passkeys', 'WWDC22 + Google I/O announce platform-synced FIDO credentials. iCloud Keychain and Google Password Manager become passkey vaults.', 'Passkeys'),
            ('2023', 'Cross-device authentication shipping', 'Hybrid CTAP transport (Bluetooth + tunnel server) lets a phone authenticate a desktop session.', 'caBLE / hybrid transport'),
            ('2024', 'Passkeys at consumer scale', '1Password, Dashlane, Bitwarden ship passkey support. Major consumer sites (Google, eBay, Amazon, GitHub) accept passkeys as a primary factor.', 'Passkey deployment'),
            ('2025', 'WebAuthn Level 3 Working Draft', 'Signal API for orphan credentials, conditional-mediation v2, attestation-conveyance refinements.', 'WebAuthn L3 WD'),
            ('2026', 'Per-credential provenance policy', 'Relying parties begin to distinguish attested-hardware passkeys from synced passkeys at policy time. AmbiSecure validation server records AAGUID + transport + attestation per credential.', '<a href="/services/fido-validation-server/">FIDO Validation Server</a>'),
        ],
        'related': [
            ('/technologies/passkeys/', 'Technology: passkeys'),
            ('/technologies/fido/', 'Technology: FIDO / WebAuthn'),
            ('/services/fido-validation-server/', 'Service: FIDO validation server'),
            ('/references/webauthn-cose/', 'Reference: WebAuthn COSE algorithms'),
            ('/resources/webauthn/', 'Resource: WebAuthn'),
        ],
    },
    {
        'slug': 'secure-elements',
        'title': 'Secure-element evolution timeline',
        'eyebrow': 'Standards evolution',
        'h1': 'Secure elements &mdash; from SIM to IoT identity chip.',
        'dek': 'Tamper-resistant silicon has moved from carrier-controlled SIM cards into NFC payment elements, embedded secure elements (eSE), TPMs, eSIM / eUICC, and finally purpose-built IoT trust chips &mdash; each step pushed by a new use case and a new threat model.',
        'description': 'A chronological timeline of secure-element evolution &mdash; from SIM cards through embedded SEs, TPMs, eUICCs, and IoT trust chips.',
        'entries': [
            ('1991', 'GSM SIM standardised (ETSI GSM 11.11)', 'The mobile-subscriber identity module is the original mass-deployed secure element. Three decades of SIM iteration begin.', 'GSM SIM'),
            ('1998', 'Java Card secure-element platform', 'Multi-application secure elements with the JCVM firewall become possible &mdash; same chip, isolated applets.', 'JavaCard'),
            ('1999', 'TCPA / TPM 1.0 specifications', 'Trusted Computing Platform Alliance publishes the TPM 1.0 spec. Discrete TPM chips begin shipping on enterprise PCs.', 'TPM 1.0'),
            ('2003', 'Common Criteria EAL5+ chip platforms', 'Smart-card silicon attains CC EAL5+ certification at the chip-platform level &mdash; the de facto baseline for high-assurance SEs.', 'CC EAL5+'),
            ('2011', 'NFC payments + embedded SE (eSE)', 'Google Wallet and Apple Pay drive embedded SE adoption in handsets. The eSE becomes a distinct chip from the SIM.', 'eSE'),
            ('2012', 'TPM 2.0 specifications', 'Library-based redesign with algorithm agility, hierarchical key storage, and platform authorisation. fTPM / dTPM coexist.', 'TPM 2.0'),
            ('2014', 'GSMA eUICC consumer specification', 'GSMA SGP.22 (consumer eSIM) standardised. The SIM moves from removable card to embedded provisionable element.', 'GSMA SGP.22'),
            ('2017', 'M2M eSIM (GSMA SGP.02 → SGP.32)', 'Eventually GSMA SGP.32 modernises M2M eSIM provisioning for IoT use cases. The eUICC becomes a general-purpose telecom SE.', 'GSMA SGP.02 / SGP.32'),
            ('2019', 'TPM 2.0 + Microsoft Pluton platform announcements', 'Embedded security processors begin to ship inside CPUs. The boundary between SE and CPU softens.', 'Pluton'),
            ('2022', 'IoT-grade secure elements at scale', 'Purpose-built secure elements for connected devices: I&sup2;C / SPI interface, low power, attestation primitives, signed-firmware verification. The IoT SE category matures.', '<a href="/products/iot-security-chipset/">IoT Security Chipset</a>'),
            ('2024', 'Multi-applet SEs across form factors', 'A single CC EAL6+ secure element carries FIDO2 + PIV + OpenPGP + NDEF in card form, embedded form, USB form, or nano-SIM form &mdash; AID-selectable.', '<a href="/products/javacard-applets/">JavaCard applets</a>'),
            ('2026', 'SE-anchored identity in every connected product', 'Authenticators, automotive identity, eMRTD chips, and IoT devices share one architectural pattern: tamper-resistant key custody in a secure element, attestation verified by a tenant-scoped service.', '<a href="/technologies/secure-elements/">Secure elements</a>'),
        ],
        'related': [
            ('/technologies/secure-elements/', 'Technology: secure elements'),
            ('/products/iot-security-chipset/', 'Product: IoT Security Chipset'),
            ('/products/esim-solution/', 'Product: eSIM solution'),
            ('/blog/secure-iot-identity-with-applets/', 'Blog: secure IoT identity with JavaCard applets'),
        ],
    },
]

NAV = """<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>{title} &mdash; AmbiSecure resources</title>
<meta name="description" content="{description}" />
<link rel="canonical" href="https://ambisecure.ambimat.com/resources/timelines/{slug}/" />
<meta property="og:type" content="article" />
<meta property="og:title" content="{title} &mdash; AmbiSecure" />
<meta property="og:description" content="{description}" />
<meta property="og:url" content="https://ambisecure.ambimat.com/resources/timelines/{slug}/" />
<meta property="og:image" content="https://ambisecure.ambimat.com/assets/img/og/resources.png" />
<meta property="og:image:type" content="image/png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="AmbiSecure &mdash; Hardware-rooted security" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="https://ambisecure.ambimat.com/assets/img/og/default.png" />
<link rel="preload" href="/assets/fonts/montserrat.woff2" as="font" type="font/woff2" crossorigin />
<link rel="preload" href="/assets/fonts/source-sans-3.woff2" as="font" type="font/woff2" crossorigin />
<link rel="stylesheet" href="/assets/css/fonts.css" />
<link rel="stylesheet" href="/assets/css/main.css" />
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml" />
<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png" />
<meta name="theme-color" content="#E3222A" />
<script type="application/ld+json">{ldjson}</script>
</head>
<body>
<a href="#main" class="skip-link">Skip to main content</a>
<div class="ecosystem-bar"><div class="ecosystem-bar-inner"><span class="ecosystem-label">Ambimat Group</span><a href="https://ambimat.com/" class="ext">Ambimat</a><a href="/" class="current">AmbiSecure</a><a href="https://esim.ambimat.com/" class="ext">SIMAuth</a><a href="/blog/">Engineering Blog</a><span class="spacer"></span><span class="meta">Ahmedabad &middot; India &middot; Est. 1982</span></div></div>
<header class="navbar"><a href="/" class="brand"><span class="brand-mark">AS</span><span class="brand-text"><span class="brand-line">Ambi<span class="accent">Secure</span></span><span class="brand-tag">Hardware-rooted security</span></span></a><nav aria-label="Primary"><ul class="nav-links"><li><a href="/products/">Products</a></li><li><a href="/solutions/">Solutions</a></li><li><a href="/technologies/">Technologies</a></li><li><a href="/industries/">Industries</a></li><li><a href="/resources/" class="active">Resources</a></li><li><a href="/blog/">Blog</a></li><li><a href="/about/">About</a></li></ul></nav><div class="nav-actions"><a href="/contact/" class="nav-btn">Contact</a><button class="hamburger" aria-label="Toggle navigation" aria-expanded="false"><span></span><span></span><span></span></button></div></header>
<nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span class="sep">/</span><a href="/resources/">Resources</a><span class="sep">/</span><a href="/resources/timelines/">Timelines</a><span class="sep">/</span><span class="current">{short_title}</span></nav>

<main id="main">

<section style="padding: 60px 80px 30px;">
  <div class="prose">
    <span class="eyebrow">{eyebrow}</span>
    <h1>{h1}</h1>
    <p class="dek">{dek}</p>
  </div>
</section>

<section>
  <div class="section-container">
    <div class="prose" style="max-width:880px;margin:0;">
      <div class="timeline">
{timeline_entries}
      </div>
    </div>
  </div>
</section>

<section class="alt">
  <div class="section-container">
    <div class="section-head left">
      <span class="eyebrow">Connected reading</span>
      <h2 class="section-title">Continue exploring.</h2>
      <span class="section-line"></span>
    </div>
    <div class="grid-3 is-centered">
{related_entries}
    </div>
  </div>
</section>

<section>
  <div class="section-container">
    <div class="callout">
      <div><h2>Building against this evolution?</h2><p>If your roadmap touches any of these milestones, our engineering team can map the standards posture to a deployable architecture.</p></div>
      <div><a href="/contact/" class="btn btn-primary">Talk to engineering</a></div>
    </div>
  </div>
</section>

</main>

<footer class="site-footer"><div class="footer-inner">
  <div class="footer-grid">
    <div class="footer-brand"><div class="brand"><span class="brand-mark">AS</span><span class="brand-text"><span class="brand-line">Ambi<span class="accent">Secure</span></span><span class="brand-tag">Hardware-rooted security</span></span></div><p>Hardware-rooted identity, FIDO authenticators, JavaCard applets, and IoT trust systems &mdash; engineered by the Ambimat Electronics team.</p><div class="footer-ecosystem">Part of the <a href="https://ambimat.com/">Ambimat Group</a> &middot; <a href="https://esim.ambimat.com/">SIMAuth</a></div></div>
    <div><h4>Products</h4><ul><li><a href="/products/onepass-platform/">OnePass Platform</a></li><li><a href="/products/onepass-card/">OnePass Card</a></li><li><a href="/products/onepass-usb-key/">OnePass USB Key</a></li><li><a href="/products/javacard-applets/">JavaCard Applets</a></li><li><a href="/products/iot-security-chipset/">IoT Security Chipset</a></li><li><a href="/products/">All products</a></li></ul></div>
    <div><h4>Resources</h4><ul><li><a href="/resources/">Tools</a></li><li><a href="/references/">References</a></li><li><a href="/resources/timelines/">Standards timelines</a></li><li><a href="/blog/">Engineering blog</a></li><li><a href="/case-studies/">Case studies</a></li></ul></div>
    <div><h4>Company</h4><ul><li><a href="/about/">About</a></li><li><a href="/about/certifications/">Certifications</a></li><li><a href="/industries/">Industries</a></li><li><a href="/support/">Support</a></li><li><a href="/contact/">Contact</a></li></ul></div>
    <div><h4>Contact</h4><ul><li>Ahmedabad, Gujarat 380015<br />India</li><li>India: +91 79255 01989</li><li>US: +1 215 397 3819</li><li><a href="mailto:support@ambimat.com">support@ambimat.com</a></li></ul></div>
  </div>
  <div class="footer-base"><span>&copy; 2026 Ambimat Electronics. All rights reserved.</span><span class="footer-privacy"> &middot; <a href="/privacy/">Privacy</a></span><div class="footer-social"><a href="https://www.linkedin.com/company/ambimat-electronics" aria-label="LinkedIn">in</a><a href="https://twitter.com/ambimat" aria-label="Twitter">tw</a><a href="https://www.facebook.com/Ambimat-Electronics-213415895353632/" aria-label="Facebook">fb</a></div></div>
</div></footer>
<script src="/assets/js/nav.js" defer></script>
<script src="/assets/js/web-vitals.js" defer></script>
</body>
</html>
"""

def build_timeline(t):
    slug = t['slug']
    short_title = t['title'].split(' evolution')[0]
    entries_html = ''
    for year, head, body, refs in t['entries']:
        entries_html += (
            f'        <div class="timeline-entry">\n'
            f'          <span class="tl-year">{year}</span>\n'
            f'          <h3>{head}</h3>\n'
            f'          <p>{body}</p>\n'
            f'          <div class="tl-refs">{refs}</div>\n'
            f'        </div>\n'
        )
    related_html = ''
    for url, label in t['related']:
        related_html += f'      <a href="{url}" class="card"><h3>{label}</h3><div class="card-meta">Open &rarr;</div></a>\n'

    ld = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'BreadcrumbList',
                'itemListElement': [
                    {'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://ambisecure.ambimat.com/'},
                    {'@type': 'ListItem', 'position': 2, 'name': 'Resources', 'item': 'https://ambisecure.ambimat.com/resources/'},
                    {'@type': 'ListItem', 'position': 3, 'name': 'Timelines', 'item': 'https://ambisecure.ambimat.com/resources/timelines/'},
                    {'@type': 'ListItem', 'position': 4, 'name': short_title, 'item': f'https://ambisecure.ambimat.com/resources/timelines/{slug}/'},
                ]
            },
            {
                '@type': 'CollectionPage',
                'name': t['title'],
                'url': f'https://ambisecure.ambimat.com/resources/timelines/{slug}/',
                'description': t['description'],
                'mainEntity': {
                    '@type': 'ItemList',
                    'itemListOrder': 'Ascending',
                    'numberOfItems': len(t['entries']),
                    'itemListElement': [
                        {
                            '@type': 'ListItem',
                            'position': i + 1,
                            'name': f"{year} — {head}",
                            'description': body,
                        }
                        for i, (year, head, body, _refs) in enumerate(t['entries'])
                    ]
                }
            }
        ]
    }
    html = NAV.format(
        title=t['title'], description=t['description'], slug=slug,
        short_title=short_title, eyebrow=t['eyebrow'], h1=t['h1'], dek=t['dek'],
        timeline_entries=entries_html, related_entries=related_html,
        ldjson=json.dumps(ld, ensure_ascii=False, indent=1),
    )
    out = os.path.join(ROOT, 'resources', 'timelines', slug, 'index.html')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with open(out, 'w', encoding='utf-8') as f:
        f.write(html)
    return out

def build_index():
    # Index page lists all timelines
    items = []
    for t in TIMELINES:
        short = t['title'].split(' evolution')[0]
        items.append((t['slug'], short, t['description']))
    cards = '\n'.join(
        f'      <a href="/resources/timelines/{slug}/" class="card"><h3>{short}</h3><p>{desc}</p><div class="card-meta">Open timeline &rarr;</div></a>'
        for slug, short, desc in items
    )
    ld = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'BreadcrumbList',
                'itemListElement': [
                    {'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://ambisecure.ambimat.com/'},
                    {'@type': 'ListItem', 'position': 2, 'name': 'Resources', 'item': 'https://ambisecure.ambimat.com/resources/'},
                    {'@type': 'ListItem', 'position': 3, 'name': 'Timelines', 'item': 'https://ambisecure.ambimat.com/resources/timelines/'},
                ]
            },
            {
                '@type': 'CollectionPage',
                'name': 'Standards evolution timelines',
                'url': 'https://ambisecure.ambimat.com/resources/timelines/',
                'description': 'Decade-scale evolution of the standards AmbiSecure builds against &mdash; FIDO, PIV, ePassport, OTP, smart cards, WebAuthn, secure elements.',
            }
        ]
    }
    html = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Standards evolution timelines &mdash; AmbiSecure resources</title>
<meta name="description" content="Decade-scale evolution of the standards AmbiSecure builds against — FIDO, PIV, ePassport, OTP, smart cards, WebAuthn, secure elements." />
<link rel="canonical" href="https://ambisecure.ambimat.com/resources/timelines/" />
<meta property="og:type" content="website" />
<meta property="og:title" content="Standards evolution timelines &mdash; AmbiSecure" />
<meta property="og:description" content="Chronological standards evolution — FIDO, PIV, ePassport, OTP, smart cards, WebAuthn, secure elements." />
<meta property="og:url" content="https://ambisecure.ambimat.com/resources/timelines/" />
<meta property="og:image" content="https://ambisecure.ambimat.com/assets/img/og/resources.png" />
<meta property="og:image:type" content="image/png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="AmbiSecure &mdash; Hardware-rooted security" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="https://ambisecure.ambimat.com/assets/img/og/default.png" />
<link rel="preload" href="/assets/fonts/montserrat.woff2" as="font" type="font/woff2" crossorigin />
<link rel="preload" href="/assets/fonts/source-sans-3.woff2" as="font" type="font/woff2" crossorigin />
<link rel="stylesheet" href="/assets/css/fonts.css" />
<link rel="stylesheet" href="/assets/css/main.css" />
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml" />
<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png" />
<meta name="theme-color" content="#E3222A" />
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False, indent=1)}</script>
</head>
<body>
<a href="#main" class="skip-link">Skip to main content</a>
<div class="ecosystem-bar"><div class="ecosystem-bar-inner"><span class="ecosystem-label">Ambimat Group</span><a href="https://ambimat.com/" class="ext">Ambimat</a><a href="/" class="current">AmbiSecure</a><a href="https://esim.ambimat.com/" class="ext">SIMAuth</a><a href="/blog/">Engineering Blog</a><span class="spacer"></span><span class="meta">Ahmedabad &middot; India &middot; Est. 1982</span></div></div>
<header class="navbar"><a href="/" class="brand"><span class="brand-mark">AS</span><span class="brand-text"><span class="brand-line">Ambi<span class="accent">Secure</span></span><span class="brand-tag">Hardware-rooted security</span></span></a><nav aria-label="Primary"><ul class="nav-links"><li><a href="/products/">Products</a></li><li><a href="/solutions/">Solutions</a></li><li><a href="/technologies/">Technologies</a></li><li><a href="/industries/">Industries</a></li><li><a href="/resources/" class="active">Resources</a></li><li><a href="/blog/">Blog</a></li><li><a href="/about/">About</a></li></ul></nav><div class="nav-actions"><a href="/contact/" class="nav-btn">Contact</a><button class="hamburger" aria-label="Toggle navigation" aria-expanded="false"><span></span><span></span><span></span></button></div></header>
<nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span class="sep">/</span><a href="/resources/">Resources</a><span class="sep">/</span><span class="current">Timelines</span></nav>

<main id="main">

<section style="padding: 60px 80px 30px;">
  <div class="prose">
    <span class="eyebrow">Standards evolution</span>
    <h1>How the standards we build against have evolved.</h1>
    <p class="dek">Authentication, identity, and trust standards do not arrive fully-formed &mdash; they accumulate over decades, shaped by deployment lessons, threat-model shifts, and ecosystem turning points. These timelines trace each family of standards we work with, year by year.</p>
  </div>
</section>

<section>
  <div class="section-container">
    <div class="grid-3 is-centered">
{cards}
    </div>
  </div>
</section>

<section class="alt">
  <div class="section-container">
    <div class="callout">
      <div><h2>Have a standards-evolution question?</h2><p>Our engineers track these specifications because we ship against them. If you need to know where a protocol is going before you commit, talk to us.</p></div>
      <div><a href="/contact/" class="btn btn-primary">Ask an engineer</a></div>
    </div>
  </div>
</section>

</main>

<footer class="site-footer"><div class="footer-inner">
  <div class="footer-grid">
    <div class="footer-brand"><div class="brand"><span class="brand-mark">AS</span><span class="brand-text"><span class="brand-line">Ambi<span class="accent">Secure</span></span><span class="brand-tag">Hardware-rooted security</span></span></div><p>Hardware-rooted identity, FIDO authenticators, JavaCard applets, and IoT trust systems &mdash; engineered by the Ambimat Electronics team.</p><div class="footer-ecosystem">Part of the <a href="https://ambimat.com/">Ambimat Group</a> &middot; <a href="https://esim.ambimat.com/">SIMAuth</a></div></div>
    <div><h4>Products</h4><ul><li><a href="/products/onepass-platform/">OnePass Platform</a></li><li><a href="/products/onepass-card/">OnePass Card</a></li><li><a href="/products/onepass-usb-key/">OnePass USB Key</a></li><li><a href="/products/javacard-applets/">JavaCard Applets</a></li><li><a href="/products/iot-security-chipset/">IoT Security Chipset</a></li><li><a href="/products/">All products</a></li></ul></div>
    <div><h4>Resources</h4><ul><li><a href="/resources/">Tools</a></li><li><a href="/references/">References</a></li><li><a href="/resources/timelines/">Standards timelines</a></li><li><a href="/blog/">Engineering blog</a></li><li><a href="/case-studies/">Case studies</a></li></ul></div>
    <div><h4>Company</h4><ul><li><a href="/about/">About</a></li><li><a href="/about/certifications/">Certifications</a></li><li><a href="/industries/">Industries</a></li><li><a href="/support/">Support</a></li><li><a href="/contact/">Contact</a></li></ul></div>
    <div><h4>Contact</h4><ul><li>Ahmedabad, Gujarat 380015<br />India</li><li>India: +91 79255 01989</li><li>US: +1 215 397 3819</li><li><a href="mailto:support@ambimat.com">support@ambimat.com</a></li></ul></div>
  </div>
  <div class="footer-base"><span>&copy; 2026 Ambimat Electronics. All rights reserved.</span><span class="footer-privacy"> &middot; <a href="/privacy/">Privacy</a></span><div class="footer-social"><a href="https://www.linkedin.com/company/ambimat-electronics" aria-label="LinkedIn">in</a><a href="https://twitter.com/ambimat" aria-label="Twitter">tw</a><a href="https://www.facebook.com/Ambimat-Electronics-213415895353632/" aria-label="Facebook">fb</a></div></div>
</div></footer>
<script src="/assets/js/nav.js" defer></script>
<script src="/assets/js/web-vitals.js" defer></script>
</body>
</html>
"""
    out = os.path.join(ROOT, 'resources', 'timelines', 'index.html')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with open(out, 'w', encoding='utf-8') as f:
        f.write(html)
    return out

if __name__ == '__main__':
    paths = [build_timeline(t) for t in TIMELINES]
    paths.append(build_index())
    for p in paths: print('wrote', os.path.relpath(p, ROOT))
