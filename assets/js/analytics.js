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
      // Privacy-first GA4 config: deny ad/personalization signals, anonymize IP,
      // and run consent-mode in denied state for ad_storage so GA4 never sets
      // advertising cookies even if the operator later flips other categories.
      gtag("consent", "default", {
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
        analytics_storage: "granted"
      });
      gtag("config", id, {
        anonymize_ip: !!cfg.ga4.anonymizeIp,
        allow_google_signals: false,
        allow_ad_personalization_signals: false
      });
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

  // ----------------------------------------------------------------------
  // Event-tracking helpers. Privacy-first: no PII, no payload exfiltration.
  // Each helper routes through cfg.report() which already honours DNT,
  // analytics opt-out, and provider="none".
  //
  // Documented event names (see docs/MASTER_OPS §50):
  //   request_demo, contact_engineering, product_interest, service_interest,
  //   search_query, tool_usage, timeline_view, video_play,
  //   download_brochure, scroll_depth
  //
  // Tagging convention on the HTML side:
  //   <a data-analytics-event="contact_engineering" ...>
  //   <button data-analytics-event="request_demo" ...>
  // ----------------------------------------------------------------------
  window.ASTrack = function (name, value) {
    if (!name) return;
    cfg.report({ name: String(name), value: Number(value || 1) });
  };

  // Click-tag listener: fires when any element carrying
  // data-analytics-event="<name>" is clicked. Single delegated listener.
  document.addEventListener('click', function (e) {
    var t = e.target;
    while (t && t !== document) {
      if (t.dataset && t.dataset.analyticsEvent) {
        window.ASTrack(t.dataset.analyticsEvent, t.dataset.analyticsValue);
        return;
      }
      t = t.parentNode;
    }
  }, { passive: true });

  // Search-query event: fires when the sitewide search page input has been
  // idle for 600ms and the query is at least 3 chars long. We never send
  // the query value itself — only the event marker.
  (function () {
    var input = document.querySelector('[data-sitewide-search]') ||
                document.querySelector('.as-search-input');
    if (!input) return;
    var timer = null, last = '';
    input.addEventListener('input', function () {
      if (timer) clearTimeout(timer);
      timer = setTimeout(function () {
        var q = (input.value || '').trim();
        if (q.length >= 3 && q !== last) {
          last = q;
          window.ASTrack('search_query', q.length);
        }
      }, 600);
    }, { passive: true });
  })();

  // Scroll-depth event: fires once per page at 25 / 50 / 75 / 100 percent
  // of document height. Throttled with rAF.
  (function () {
    var fired = {};
    var ticking = false;
    function check() {
      ticking = false;
      var h = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight) - window.innerHeight;
      if (h <= 0) return;
      var pct = Math.round((window.scrollY / h) * 100);
      [25, 50, 75, 100].forEach(function (bucket) {
        if (!fired[bucket] && pct >= bucket) {
          fired[bucket] = true;
          window.ASTrack('scroll_depth', bucket);
        }
      });
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { window.requestAnimationFrame(check); ticking = true; }
    }, { passive: true });
  })();

  // Page-typed events: tool / timeline / case-study impressions fire once
  // on load so the operator can see which content types pull traffic.
  (function () {
    var p = window.location && window.location.pathname || '';
    if (/^\/resources\/tools\/[^/]+\/$/.test(p))     window.ASTrack('tool_usage', 1);
    else if (/^\/resources\/timelines\/[^/]+\/$/.test(p)) window.ASTrack('timeline_view', 1);
    else if (/^\/case-studies\/[^/]+\/$/.test(p))    window.ASTrack('case_study_view', 1);
  })();
})();
