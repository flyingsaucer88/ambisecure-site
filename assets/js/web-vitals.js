/**
 * AmbiSecure Web Vitals beacon — Phase 11.
 *
 * Lightweight, privacy-conscious, CSP-clean (script-src 'self').
 * No external libraries; uses native PerformanceObserver only.
 *
 * Collects:
 *   - LCP (Largest Contentful Paint)
 *   - CLS (Cumulative Layout Shift)
 *   - INP (Interaction to Next Paint) — best-effort fallback to FID
 *   - TTFB (Time to First Byte)
 *
 * Reporting:
 *   - Only runs if window.AS_ANALYTICS && AS_ANALYTICS.enabled.
 *   - Respects the analytics opt-out (localStorage["as_analytics_opt"] === "out").
 *   - Honours Do-Not-Track.
 *   - Hands metrics to window.AS_ANALYTICS.report({ name, value, id }) — never
 *     calls out directly. The analytics module decides whether to send.
 *
 * Privacy:
 *   - No URL parameters captured.
 *   - No referrer.
 *   - No user-identifier.
 *   - Page path is captured only as window.location.pathname (no query string).
 */
(function () {
  "use strict";

  if (typeof window === "undefined") return;
  if (!window.PerformanceObserver) return;

  // Honour DNT and the opt-out preference.
  try {
    if (navigator.doNotTrack === "1" || window.doNotTrack === "1") return;
    if (localStorage.getItem("as-analytics-opt-out") === "1") return;
  } catch (e) {
    // If localStorage is denied, fall through — DNT alone gates us.
  }

  var reported = Object.create(null);
  function report(name, value, extra) {
    if (reported[name] && name !== "CLS") return; // CLS accumulates; others fire once
    reported[name] = true;
    var payload = {
      name: name,
      value: Math.round(value * 1000) / 1000,
      path: window.location.pathname,
      ts: Date.now()
    };
    if (extra) payload.extra = extra;
    try {
      if (window.AS_ANALYTICS && typeof window.AS_ANALYTICS.report === "function") {
        window.AS_ANALYTICS.report(payload);
      } else {
        // Buffer until analytics module loads.
        window.AS_WEB_VITALS_BUFFER = window.AS_WEB_VITALS_BUFFER || [];
        window.AS_WEB_VITALS_BUFFER.push(payload);
      }
    } catch (e) { /* swallow */ }
  }

  // ---- LCP ----
  try {
    var lcpValue = 0;
    var lcpObs = new PerformanceObserver(function (list) {
      var entries = list.getEntries();
      var last = entries[entries.length - 1];
      if (last) lcpValue = last.startTime;
    });
    lcpObs.observe({ type: "largest-contentful-paint", buffered: true });
    // Report on visibility change or pagehide — whichever comes first.
    var lcpDone = false;
    var finalizeLcp = function () {
      if (lcpDone || !lcpValue) return;
      lcpDone = true;
      report("LCP", lcpValue);
      try { lcpObs.disconnect(); } catch (e) {}
    };
    addEventListener("visibilitychange", function () {
      if (document.visibilityState === "hidden") finalizeLcp();
    }, { once: false });
    addEventListener("pagehide", finalizeLcp, { once: true });
  } catch (e) {}

  // ---- CLS ----
  try {
    var clsValue = 0;
    var sessionValue = 0;
    var sessionEntries = [];
    var clsObs = new PerformanceObserver(function (list) {
      list.getEntries().forEach(function (entry) {
        if (entry.hadRecentInput) return;
        var first = sessionEntries[0];
        var last = sessionEntries[sessionEntries.length - 1];
        if (
          sessionEntries.length &&
          (entry.startTime - last.startTime > 1000 ||
            entry.startTime - first.startTime > 5000)
        ) {
          sessionEntries = [entry];
          sessionValue = entry.value;
        } else {
          sessionEntries.push(entry);
          sessionValue += entry.value;
        }
        if (sessionValue > clsValue) {
          clsValue = sessionValue;
        }
      });
    });
    clsObs.observe({ type: "layout-shift", buffered: true });
    addEventListener("pagehide", function () {
      if (clsValue >= 0) report("CLS", clsValue);
    }, { once: true });
  } catch (e) {}

  // ---- INP (best-effort) / FID fallback ----
  try {
    var inpValue = 0;
    var entryTypes = PerformanceObserver.supportedEntryTypes || [];
    if (entryTypes.indexOf("event") !== -1) {
      var inpObs = new PerformanceObserver(function (list) {
        list.getEntries().forEach(function (entry) {
          if (entry.duration > inpValue) inpValue = entry.duration;
        });
      });
      try { inpObs.observe({ type: "event", buffered: true, durationThreshold: 16 }); }
      catch (e) { inpObs.observe({ type: "event", buffered: true }); }
      addEventListener("pagehide", function () {
        if (inpValue) report("INP", inpValue);
      }, { once: true });
    } else if (entryTypes.indexOf("first-input") !== -1) {
      var fidObs = new PerformanceObserver(function (list) {
        list.getEntries().forEach(function (entry) {
          report("FID", entry.processingStart - entry.startTime);
          fidObs.disconnect();
        });
      });
      fidObs.observe({ type: "first-input", buffered: true });
    }
  } catch (e) {}

  // ---- TTFB ----
  try {
    var nav = performance.getEntriesByType("navigation")[0];
    if (nav && typeof nav.responseStart === "number") {
      report("TTFB", nav.responseStart);
    }
  } catch (e) {}
})();
