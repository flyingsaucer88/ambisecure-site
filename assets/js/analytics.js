(function () {
  'use strict';
  var cfg = window.AS_ANALYTICS;
  if (!cfg || cfg.provider === "none") return;


  if (cfg.respectDoNotTrack) {
    var dnt = navigator.doNotTrack || window.doNotTrack || (navigator.msDoNotTrack);
    if (dnt === "1" || dnt === "yes") return;
  }


  try {
    if (cfg.optOutLocalStorageKey &&
        window.localStorage &&
        window.localStorage.getItem(cfg.optOutLocalStorageKey) === "1") {
      return;
    }
  } catch (_) {  }

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



    return;
  }

  if (cfg.provider === "ga4") {
    if (!cfg.ga4 || !cfg.ga4.measurementId || cfg.ga4.measurementId.indexOf("G-") !== 0) return;
    var id = cfg.ga4.measurementId;



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

(function () {
  'use strict';
  var cfg = window.AS_ANALYTICS;
  if (!cfg) return;

  function isOptedOut() {
    if (cfg.respectDoNotTrack) {
      var dnt = navigator.doNotTrack || window.doNotTrack || navigator.msDoNotTrack;
      if (dnt === "1" || dnt === "yes") return true;
    }
    try {
      if (cfg.optOutLocalStorageKey &&
          window.localStorage &&
          window.localStorage.getItem(cfg.optOutLocalStorageKey) === "1") {
        return true;
      }
    } catch (_) {}
    return false;
  }

  cfg.report = function (payload) {
    if (!payload || cfg.provider === "none") return;
    if (isOptedOut()) return;
    var name = String(payload.name || "metric");
    var value = Number(payload.value || 0);
    var path = payload.path || (window.location && window.location.pathname);

    try {
      if (cfg.provider === "plausible" && typeof window.plausible === "function") {
        window.plausible("WebVital", { props: { metric: name, value: value, path: path } });
      } else if (cfg.provider === "ga4" && typeof window.gtag === "function") {
        window.gtag("event", name, { value: value, page_path: path, metric_id: name });
      }
    } catch (_) {  }
  };


  try {
    var buf = window.AS_WEB_VITALS_BUFFER;
    if (Array.isArray(buf) && buf.length) {
      buf.forEach(function (p) { cfg.report(p); });
      window.AS_WEB_VITALS_BUFFER = [];
    }
  } catch (_) {}
})();
