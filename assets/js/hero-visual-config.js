/**
 * AmbiSecure homepage hero right-side visual — daily rotation pool.
 *
 * Only the right-hand visual block of the hero rotates. The left-hand
 * H1/eyebrow/CTA stack and the rest of the page stay stable.
 *
 * Each theme renders as: AmbiSecure crest medallion + themed accent ring,
 * a corner badge with a themed SVG icon, then a small "Today's focus"
 * eyebrow + theme label + caption + CTA.
 *
 * The picker is deterministic per UTC day:
 *   Math.floor(Date.now() / 86400000) % themes.length
 * Every visitor on the same UTC day sees the same theme; the visual changes
 * automatically at the UTC day boundary. No backend, no API, no localStorage.
 *
 * Terminology rule (MASTER_OPS §44): "available in SIM-card and MFF2
 * solderable form factors", not "SIM-resident applets".
 */
window.AS_HERO_VISUAL_THEMES = [
  {
    id: "identity-root",
    label: "Hardware-rooted identity",
    caption: "Keys live in tamper-resistant silicon — never in software, never on disk.",
    accent: "red",
    cta: { label: "Trust chain", url: "/technologies/secure-elements/" },
    icon: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L4 6v6c0 4.4 3 8.4 8 10 5-1.6 8-5.6 8-10V6l-8-4Z"/><rect x="9" y="10" width="6" height="5" rx="1"/><path d="M10 10V8a2 2 0 1 1 4 0v2"/></svg>'
  },
  {
    id: "fido",
    label: "FIDO / WebAuthn",
    caption: "Phishing-resistant authenticators with attestation that issuers verify.",
    accent: "red",
    cta: { label: "FIDO technologies", url: "/technologies/fido/" },
    icon: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 11a6 6 0 0 1 12 0v2"/><path d="M9 11a3 3 0 0 1 6 0v3a4 4 0 0 1-1 2.7"/><path d="M6 14c0 4 1 6 2 7"/><path d="M12 12v3"/></svg>'
  },
  {
    id: "piv",
    label: "PIV / PKI smart cards",
    caption: "FIPS 201 functional cards, bio cards, and USB keys under your issuer keys.",
    accent: "red",
    cta: { label: "PIV product family", url: "/products/piv-card/" },
    icon: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><rect x="6" y="9" width="5" height="4" rx="0.5"/><line x1="14" y1="10" x2="18" y2="10"/><line x1="14" y1="13" x2="18" y2="13"/></svg>'
  },
  {
    id: "secure-elements",
    label: "Secure Elements",
    caption: "CC EAL5+ silicon with attestation, key rotation, and signed update.",
    accent: "red",
    cta: { label: "Secure-element technology", url: "/technologies/secure-elements/" },
    icon: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="6" width="12" height="12" rx="1.5"/><rect x="9" y="9" width="6" height="6"/><line x1="3" y1="9" x2="6" y2="9"/><line x1="3" y1="12" x2="6" y2="12"/><line x1="3" y1="15" x2="6" y2="15"/><line x1="18" y1="9" x2="21" y2="9"/><line x1="18" y1="12" x2="21" y2="12"/><line x1="18" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="6"/><line x1="12" y1="3" x2="12" y2="6"/><line x1="15" y1="3" x2="15" y2="6"/><line x1="9" y1="18" x2="9" y2="21"/><line x1="12" y1="18" x2="12" y2="21"/><line x1="15" y1="18" x2="15" y2="21"/></svg>'
  },
  {
    id: "javacard",
    label: "JavaCard applets",
    caption: "FIDO, PIV, OpenPGP, NDEF, OIDC, biometric variants — one chip, multi-applet.",
    accent: "dark",
    cta: { label: "Applet portfolio", url: "/products/javacard-applets/" },
    icon: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="14" height="10" rx="1.5"/><rect x="7" y="10" width="14" height="10" rx="1.5" opacity="0.55"/></svg>'
  },
  {
    id: "epassport",
    label: "ePassport identity systems",
    caption: "End-to-end ICAO 9303 delivery — enrolment, CSCA / DSC / PKD, personalisation.",
    accent: "dark",
    cta: { label: "ePassport service", url: "/services/epassport-platform/" },
    icon: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="18" rx="1.5"/><circle cx="12" cy="10" r="2.5"/><path d="M8 16c1.5-1.5 6.5-1.5 8 0"/></svg>'
  },
  {
    id: "iot",
    label: "IoT trust anchors",
    caption: "Hardware root of trust on the connected-product BOM — SIM-card and MFF2 solderable form factors.",
    accent: "red",
    cta: { label: "IoT chipset", url: "/products/iot-security-chipset/" },
    icon: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="17" r="1.4"/><path d="M8.5 13.5a5 5 0 0 1 7 0"/><path d="M5.5 10.5a9 9 0 0 1 13 0"/><path d="M2.5 7.5a13 13 0 0 1 19 0"/></svg>'
  },
  {
    id: "fvs",
    label: "FIDO Validation Server",
    caption: "Multi-tenant WebAuthn SaaS — attestation, MDS lookup, tenant-scoped REST.",
    accent: "cyan",
    cta: { label: "Validation server", url: "/services/fido-validation-server/" },
    icon: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="5" rx="1"/><rect x="4" y="10" width="16" height="5" rx="1"/><rect x="4" y="16" width="16" height="5" rx="1"/><circle cx="8" cy="6.5" r="0.6" fill="currentColor"/><circle cx="8" cy="12.5" r="0.6" fill="currentColor"/><circle cx="8" cy="18.5" r="0.6" fill="currentColor"/></svg>'
  },
  {
    id: "esim",
    label: "eSIM Initiative",
    caption: "SGP.22 / SGP.32 RSP lifecycle, eUICC platform engineering — our dedicated sister property.",
    accent: "cyan",
    cta: { label: "esim.ambimat.com", url: "https://esim.ambimat.com/" },
    icon: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="3" width="12" height="18" rx="2"/><rect x="9" y="9" width="6" height="6" rx="0.6"/><circle cx="12" cy="6" r="0.6" fill="currentColor"/></svg>'
  },
  {
    id: "ambimat",
    label: "Ambimat Electronics",
    caption: "Forty-five years of embedded engineering — the parent group behind AmbiSecure.",
    accent: "dark",
    cta: { label: "ambimat.com", url: "https://ambimat.com/" },
    icon: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21V9l5-4 5 4v12"/><path d="M13 21V13l4-3 4 3v8"/><line x1="3" y1="21" x2="21" y2="21"/></svg>'
  }
];
