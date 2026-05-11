/**
 * Homepage banner configuration.
 *
 * To rotate banners: edit this file only. No deploy step needed beyond a
 * normal file upload. First enabled banner whose start/end window matches
 * "now" wins; reorder the array to change priority.
 *
 * Banner shape documented in /assets/js/highlight-banner.js.
 */
window.AS_HOMEPAGE_BANNERS = [
  {
    id: "onepass-platform-2026",
    enabled: true,
    eyebrow: "FEATURED · OnePass platform",
    title: "One identity card. Phishing-resistant. Procurement-ready.",
    body: "Replace badges and security keys with a single FIDO2 smart card that ships under your issuer keys, brand artwork, and audit hooks.",
    accent: "red",
    primaryCta: { label: "Explore OnePass", url: "/products/onepass-platform/" },
    secondaryCta: { label: "Request a pilot", url: "/contact/" }
  },
  {
    id: "videos-launch-2026",
    enabled: true,
    eyebrow: "NEW · Videos",
    title: "Walkthroughs and product demos under 90 seconds.",
    body: "FIDO setup on Gmail and Facebook, multi-application card use cases, and product loops. Click-to-play YouTube so nothing loads until you press Play.",
    accent: "cyan",
    primaryCta: { label: "Browse videos", url: "/videos/" },
    secondaryCta: { label: "Talk to engineering", url: "/contact/" }
  },
  {
    id: "fido-validation-server",
    enabled: true,
    eyebrow: "SERVICE · FIDO Validation Server",
    title: "A FIDO server you can actually deploy in a fortnight.",
    body: "JavaScript API. REST endpoints. Transparent per-active-credential billing. White-label option for MSSPs.",
    accent: "cyan",
    primaryCta: { label: "View service", url: "/services/fido-validation-server/" }
  },
  {
    id: "javacard-applet-platform",
    enabled: true,
    eyebrow: "PRODUCT · JavaCard applet platform",
    title: "Twelve applets. One chip. AID-selectable.",
    body: "FIDO, PIV, OpenPGP, NDEF, OIDC, SCP02, biometric variants, IoT — multi-applet on a single CC EAL5+ chip.",
    accent: "dark",
    primaryCta: { label: "View applet matrix", url: "/products/javacard-applets/" }
  }
];
