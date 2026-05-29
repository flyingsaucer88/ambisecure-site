/**
 * AmbiSecure homepage banner — daily rotation pool.
 *
 * The Phase 28 highlight-banner.js picks ONE entry per UTC day deterministically,
 * so every visitor on a given day sees the same banner (and the banner changes
 * automatically at the UTC day boundary). No server, no API, no localStorage.
 *
 * Entries span the full Ambimat ecosystem:
 *   - AmbiSecure internal capabilities (FIDO, PIV, JavaCard, secure element,
 *     ePassport, IoT, validation server, MFF2 vs nano-card form factor)
 *   - SIMAuth (esim.ambimat.com) — telecom-grade identity, eUICC,
 *     SGP.22 / SGP.32 lifecycle
 *   - Ambimat Electronics group (ambimat.com) — embedded engineering heritage,
 *     industrial / connected-product systems
 *
 * To rotate priority, reorder the array. To take an entry out of the pool
 * without deleting it, set `enabled: false`. `startsAt` / `endsAt` (ISO-8601)
 * time-box campaign messaging.
 *
 * Terminology rule (see MASTER_OPS §44): never imply telecom-issued SIMs when
 * describing the nano-card form factor. Frame it as "convenient nano-card
 * form factor" alongside "MFF2 solderable" — both are integration-convenience
 * packages for the same secure-element silicon.
 */
window.AS_HOMEPAGE_BANNERS = [
  /* === AmbiSecure capability banners === */
  {
    id: "ambisecure-onepass",
    enabled: true,
    eyebrow: "FEATURED · OnePass platform",
    title: "One identity card. Phishing-resistant. Procurement-ready.",
    body: "Replace badges and security keys with a single FIDO2 smart card that ships under your issuer keys, brand artwork, and audit hooks.",
    accent: "red",
    primaryCta: { label: "Explore OnePass", url: "/products/onepass-platform/" },
    secondaryCta: { label: "Request a pilot", url: "/contact/" }
  },
  {
    id: "ambisecure-piv-form-factors",
    enabled: true,
    eyebrow: "FEATURED · PIV across form factors",
    title: "PIV smart card, bio card, USB key — same applet, four packages.",
    body: "FIPS 201 functional PIV applet available as an ID-1 contact + contactless card, on-card biometric bio card, USB-A / USB-C key, and embedded MFF2 secure-element module.",
    accent: "red",
    primaryCta: { label: "View PIV card", url: "/products/piv-card/" },
    secondaryCta: { label: "PIV Bio card", url: "/products/piv-bio-card/" }
  },
  {
    id: "ambisecure-javacard",
    enabled: true,
    eyebrow: "SERVICE · JavaCard development",
    title: "Twelve applets. One chip. AID-selectable.",
    body: "FIDO, PIV, OpenPGP, NDEF, OIDC, biometric variants, IoT — multi-applet on a single CC EAL5+ chip. CAP files loaded under your issuer keys via SCP03.",
    accent: "dark",
    primaryCta: { label: "View applet matrix", url: "/products/javacard-applets/" },
    secondaryCta: { label: "JavaCard service", url: "/services/javacard-development/" }
  },
  {
    id: "ambisecure-fvs",
    enabled: true,
    eyebrow: "SERVICE · FIDO Validation Server",
    title: "A FIDO server you can deploy in a fortnight.",
    body: "Multi-tenant FIDO2 / WebAuthn SaaS. Per-tenant policy, attestation verification, MDS lookup. Drop-in JS + tenant-scoped REST.",
    accent: "cyan",
    primaryCta: { label: "View service", url: "/services/fido-validation-server/" },
    secondaryCta: { label: "Demo posture", url: "/services/fido-validation-server/demo/" }
  },
  {
    id: "ambisecure-mff2",
    enabled: true,
    eyebrow: "FEATURED · MFF2 secure elements",
    title: "Solderable secure identity for connected products.",
    body: "Embed FIDO, PIV, IoT-identity, and OpenID Connect applets directly onto your product board via MFF2 secure-element modules — alongside the same applets in a convenient nano-card form factor.",
    accent: "red",
    primaryCta: { label: "IoT security co-processor", url: "/products/iot-security-coprocessor/" },
    secondaryCta: { label: "JavaCard applets", url: "/products/javacard-applets/" }
  },
  {
    id: "ambisecure-epassport",
    enabled: true,
    eyebrow: "SERVICE · ePassport platform",
    title: "End-to-end ICAO 9303 platform delivery.",
    body: "Enrolment frontend, biometric capture, CSCA / DSC / PKD PKI, personalisation line, BAC / PACE / Active Authentication, LDS — by the engineers who shipped it.",
    accent: "dark",
    primaryCta: { label: "ePassport service", url: "/services/epassport-platform/" },
    secondaryCta: { label: "Engagement models", url: "/engagement-models/" }
  },
  {
    id: "ambisecure-iot",
    enabled: true,
    eyebrow: "PRODUCT · IoT identity",
    title: "Hardware root of trust on the connected-product BOM.",
    body: "Secure Element integration for OEM devices — key provisioning, signed firmware update, attestation, mTLS, key rotation. Available as MFF2-solderable or nano-card package for the same silicon.",
    accent: "red",
    primaryCta: { label: "IoT co-processor", url: "/products/iot-security-coprocessor/" },
    secondaryCta: { label: "Secure-element integration", url: "/solutions/secure-element-integration/" }
  },
  {
    id: "ambisecure-case-studies",
    enabled: true,
    eyebrow: "NEW · Case studies",
    title: "Three anonymised deployments, written by the engineers.",
    body: "Passwordless workforce across mixed IdPs. DESFire EV2 transit with SAM-backed offline trust. Hardware-rooted device identity. Architecture-first, no fabricated metrics.",
    accent: "red",
    primaryCta: { label: "Read case studies", url: "/case-studies/" },
    secondaryCta: { label: "Engagement models", url: "/engagement-models/" }
  },
  {
    id: "ambisecure-faqs",
    enabled: true,
    eyebrow: "RESOURCE · Engineering FAQs",
    title: "Answers from engineering, not marketing.",
    body: "FIDO vs SMS OTP, lost-card behaviour, JavaCard loading on third-party chips, ePassport scope, biometric privacy. Fourteen questions, answered by the people who build the platform.",
    accent: "cyan",
    primaryCta: { label: "Read the FAQs", url: "/faqs/" },
    secondaryCta: { label: "Engineering blog", url: "/blog/" }
  },

  /* === SIMAuth (esim.ambimat.com) === */
  {
    id: "esim-ecosystem",
    enabled: true,
    eyebrow: "ECOSYSTEM · SIMAuth",
    title: "eUICC platform engineering — RSP, SGP.22, SGP.32.",
    body: "AmbiSecure's sister property — the SIMAuth — covers SGP.22 / SGP.32 RSP lifecycle, eUICC platform integration, profile management, and consumer / M2M / automotive variants.",
    accent: "cyan",
    primaryCta: { label: "Visit SIMAuth", url: "https://esim.ambimat.com/" },
    secondaryCta: { label: "OpenID Connect on SE", url: "/products/esim-solution/" }
  },
  {
    id: "esim-otp-bridge",
    enabled: true,
    eyebrow: "ECOSYSTEM · SIMAuth",
    title: "Bridge from SMS OTP to hardware-rooted MFA.",
    body: "When a telco wants to retire SMS OTP without re-issuing every SIM, the SIMAuth covers the migration path — same eUICC, new applet, phishing-resistant credentials. SIMAuth is the dedicated telecom platform; AmbiSecure ships the non-telecom nano-card / MFF2 applet portfolio.",
    accent: "cyan",
    primaryCta: { label: "SIMAuth", url: "https://esim.ambimat.com/" },
    secondaryCta: { label: "Why hardware-rooted identity matters", url: "/blog/why-hardware-backed-identity-matters/" }
  },

  /* === Ambimat Electronics group (ambimat.com) === */
  {
    id: "ambimat-parent",
    enabled: true,
    eyebrow: "ECOSYSTEM · Ambimat Electronics",
    title: "Forty-five years of embedded engineering.",
    body: "AmbiSecure is the security business unit of Ambimat Electronics — the parent group has been shipping PCB designs, firmware, contactless modules, GSM / Bluetooth platforms for medical devices, smart watches, smart homes and utilities since 1981.",
    accent: "dark",
    primaryCta: { label: "Visit Ambimat Electronics", url: "https://ambimat.com/" },
    secondaryCta: { label: "About AmbiSecure", url: "/about/" }
  },
  {
    id: "ambimat-engineering",
    enabled: true,
    eyebrow: "ECOSYSTEM · Ambimat Electronics",
    title: "Hardware engineering, in-house.",
    body: "AmbiSecure secure-element products sit on top of Ambimat's in-house hardware capability — silicon vendor relationships, contactless / NFC modules, biometric sensors, personalisation lines, and certified manufacturing.",
    accent: "dark",
    primaryCta: { label: "Visit Ambimat Electronics", url: "https://ambimat.com/" },
    secondaryCta: { label: "Certifications", url: "/about/certifications/" }
  }
];
