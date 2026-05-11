/**
 * AmbiSecure analytics loader.
 *
 * Reads window.AS_ANALYTICS (from /assets/js/analytics-config.js) and loads
 * one provider snippet, honouring:
 *   - provider === "none"           -> load nothing
 *   - Do-Not-Track (when respectDoNotTrack === true)
 *   - per-visitor opt-out via localStorage["as-analytics-opt-out"] === "1"
 *
 * Zero work happens at this file's parse time beyond reading the config.
 * Network calls only happen when a non-"none" provider is selected AND the
 * visitor has not opted out.
 *
 * CSP: the runtime checks happen on 'self'. The provider tag itself is
 * loaded by appending a <script> tag whose src is the configured provider
 * URL — that URL must be allowed by the deployed CSP. See
 * docs/20-analytics-and-observability.md for the .htaccess CSP snippets.
 */
(function () {
  'use strict';
  var cfg = window.AS_ANALYTICS;
  if (!cfg || cfg.provider === "none") return;

  // Do-Not-Track signal
  if (cfg.respectDoNotTrack) {
    var dnt = navigator.doNotTrack || window.doNotTrack || (navigator.msDoNotTrack);
    if (dnt === "1" || dnt === "yes") return;
  }

  // Per-visitor opt-out
  try {
    if (cfg.optOutLocalStorageKey &&
        window.localStorage &&
        window.localStorage.getItem(cfg.optOutLocalStorageKey) === "1") {
      return;
    }
  } catch (_) { /* localStorage may be blocked; ignore */ }

  function injectScript(src, attrs) {
    var s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.defer = true;
    if (attrs) {
      Object.keys(attrs).forEach(function (k) { s.setAttribute(k, attrs[k]); });
    }
    document.head.appendChild(s);
    return s;
  }

  if (cfg.provider === "plausible") {
    if (!cfg.plausible || !cfg.plausible.domain) return;
    injectScript(cfg.plausible.scriptSrc || "https://plausible.io/js/script.js", {
      "data-domain": cfg.plausible.domain
    });
    // Plausible exposes window.plausible() for custom events once loaded.
    // To track an event later from page-specific code:
    //   if (window.plausible) window.plausible("Contact Click", { props: { surface: "footer" } });
    return;
  }

  if (cfg.provider === "ga4") {
    if (!cfg.ga4 || !cfg.ga4.measurementId || cfg.ga4.measurementId.indexOf("G-") !== 0) return;
    var id = cfg.ga4.measurementId;
    // Load gtag.js, then initialise via inline-equivalent calls.
    // Note: GA4 needs an inline-equivalent dataLayer push. We do this via
    // a same-origin helper rather than CSP-blocked inline script:
    var loader = injectScript("https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id));
    loader.addEventListener("load", function () {
      window.dataLayer = window.dataLayer || [];
      function gtag() { window.dataLayer.push(arguments); }
      window.gtag = gtag;
      gtag("js", new Date());
      gtag("config", id, { anonymize_ip: !!cfg.ga4.anonymizeIp });
    }, { once: true });
    return;
  }
})();
