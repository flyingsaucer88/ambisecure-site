/**
 * AmbiSecure analytics configuration.
 *
 * EDIT THIS FILE to enable / change analytics for the entire site.
 * No template change required.
 *
 * Provider options:
 *   "none"      -> no analytics tags load. (Default — privacy-safe out of the box.)
 *   "plausible" -> loads Plausible. Set `domain` (Plausible site identifier).
 *   "ga4"       -> loads Google Analytics 4. Set `measurementId` ("G-XXXXXXX").
 *
 * Both providers respect Do-Not-Track and the in-browser
 * `localStorage["as-analytics-opt-out"] === "1"` opt-out flag.
 *
 * CSP impact:
 *   - Plausible adds:  script-src 'self' https://plausible.io;
 *                      connect-src 'self' https://plausible.io;
 *   - GA4 adds:        script-src 'self' https://www.googletagmanager.com;
 *                      connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com;
 *   See docs/20-analytics-and-observability.md for the .htaccess CSP edits
 *   that go with each option.
 */
window.AS_ANALYTICS = {
  // ---- Toggle ----
  provider: "none",

  // ---- Plausible ----
  plausible: {
    domain: "ambisecure.ambimat.com",
    scriptSrc: "https://plausible.io/js/script.js"
    // To enable extensions (outbound links, file downloads), use:
    //   scriptSrc: "https://plausible.io/js/script.outbound-links.file-downloads.js"
  },

  // ---- GA4 ----
  ga4: {
    measurementId: "G-XXXXXXXXXX",
    anonymizeIp: true
  },

  // ---- Privacy ----
  respectDoNotTrack: true,
  // localStorage key used by the small opt-out helper at the bottom of
  // assets/js/analytics.js. Visitors who set this to "1" never load any tag.
  optOutLocalStorageKey: "as-analytics-opt-out"
};
