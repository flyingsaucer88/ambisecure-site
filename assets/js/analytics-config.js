/**
 * AmbiSecure analytics configuration.
 *
 * Privacy posture:
 *   - No PII is ever collected or stored.
 *   - No fingerprinting, no cross-site profiling, no advertising cookies.
 *   - No analytics requests fire until the visitor explicitly accepts via
 *     the cookie-consent banner (see cookie-consent.js).
 *   - Do-Not-Track is respected even if consent was previously granted.
 *   - Opt-out is persisted in localStorage (key: as-analytics-opt-out).
 *
 * Provider direction:
 *   GA4 is the chosen provider. To activate analytics in production:
 *     1. Replace ga4.measurementId below with the real "G-XXXXXXXXXX" ID.
 *     2. Flip provider to "ga4".
 *   The consent banner remains user-facing in both states; while provider
 *   is "none" no analytics script is loaded regardless of consent.
 *
 *   Plausible remains as an alternative path (see MASTER_OPS §23.3) but is
 *   not the chosen default.
 */
window.AS_ANALYTICS = {

  provider: "none",

  plausible: {
    domain: "ambisecure.ambimat.com",
    scriptSrc: "https://plausible.io/js/script.js"
  },

  ga4: {
    measurementId: "G-XXXXXXXXXX",
    anonymizeIp: true
  },

  respectDoNotTrack: true,

  optOutLocalStorageKey: "as-analytics-opt-out"
};
