(function () {
  "use strict";

  if (typeof window === "undefined") return;
  if (!window.PerformanceObserver) return;

  var DEBUG = false;
  try {
    DEBUG = localStorage.getItem("as-vitals-debug") === "1" ||
            (window.location.search || "").indexOf("as_vitals_debug=1") !== -1;
  } catch (e) {}

  if (!DEBUG) {
    try {
      if (navigator.doNotTrack === "1" || window.doNotTrack === "1") return;
      if (localStorage.getItem("as-analytics-opt-out") === "1") return;
    } catch (e) {}
  }

  function deriveGroup(path) {
    if (!path || path === "/") return "home";
    var parts = path.split("/").filter(Boolean);
    if (!parts.length) return "home";
    var top = parts[0];
    var groupMap = {
      blog: parts[1] === "archive" ? "blog-archive" :
            parts[1] === "categories" ? "blog-categories" :
            parts[1] === "page" ? "blog-pagination" :
            (parts.length >= 2 ? "blog-post" : "blog-index"),
      "case-studies": parts.length >= 2 ? "case-study" : "case-studies-index",
      brochures: parts.length >= 2 ? "brochure" : "brochures-index",
      products: parts.length >= 2 ? "product" : "products-index",
      services: parts.length >= 2 ? "service" : "services-index",
      solutions: parts.length >= 2 ? "solution" : "solutions-index",
      technologies: parts.length >= 2 ? "technology" : "technologies-index",
      industries: parts.length >= 2 ? "industry" : "industries-index",
      videos: parts.length >= 2 ? "video" : "videos-index",
      resources: parts.length >= 2 ? "tool" : "resources-index",
      references: parts.length >= 2 ? "reference" : "references-index",
      tags: parts.length >= 2 ? "tag" : "tags-index",
      "engagement-models": "engagement",
      about: "about",
      contact: "contact",
      support: "support",
      trust: "trust",
      partners: "partners",
      search: "search",
      privacy: "privacy"
    };
    return groupMap[top] || ("misc-" + top);
  }

  var PATH = window.location.pathname || "/";
  var PAGE_GROUP = deriveGroup(PATH);

  var buffer = [];
  var seen = Object.create(null);

  function enqueue(name, value, extra) {

    if (seen[name] && name !== "CLS") return;
    seen[name] = true;
    buffer.push({
      name: name,
      value: Math.round(value * 1000) / 1000,
      pageGroup: PAGE_GROUP,
      path: PATH,
      ts: Date.now(),
      extra: extra || null
    });
  }

  function updateCLS(newValue) {
    for (var i = 0; i < buffer.length; i++) {
      if (buffer[i].name === "CLS") {
        buffer[i].value = Math.round(newValue * 1000) / 1000;
        buffer[i].ts = Date.now();
        return;
      }
    }
    enqueue("CLS", newValue);
  }

  var flushed = false;
  function flush() {
    if (flushed) return;
    flushed = true;
    if (!buffer.length) return;
    if (DEBUG && typeof console !== "undefined" && console.table) {
      try { console.table(buffer); } catch (e) {}
    }
    if (DEBUG) return;
    try {
      if (window.AS_ANALYTICS && typeof window.AS_ANALYTICS.report === "function") {
        buffer.forEach(function (m) { window.AS_ANALYTICS.report(m); });
      } else {

        window.AS_WEB_VITALS_BUFFER = window.AS_WEB_VITALS_BUFFER || [];
        Array.prototype.push.apply(window.AS_WEB_VITALS_BUFFER, buffer);
      }
    } catch (e) {}
  }

  addEventListener("pagehide", flush, { once: true });
  addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") flush();
  }, { once: false });

  try {
    var lcpValue = 0;
    var lcpObs = new PerformanceObserver(function (list) {
      var entries = list.getEntries();
      var last = entries[entries.length - 1];
      if (last) lcpValue = last.startTime;
    });
    lcpObs.observe({ type: "largest-contentful-paint", buffered: true });
    addEventListener("pagehide", function () {
      if (lcpValue) enqueue("LCP", lcpValue);
      try { lcpObs.disconnect(); } catch (e) {}
    }, { once: true });
    addEventListener("visibilitychange", function () {
      if (document.visibilityState === "hidden" && lcpValue) enqueue("LCP", lcpValue);
    }, { once: false });
  } catch (e) {}

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
          updateCLS(clsValue);
        }
      });
    });
    clsObs.observe({ type: "layout-shift", buffered: true });
  } catch (e) {}

  try {
    var inpValue = 0;
    var entryTypes = PerformanceObserver.supportedEntryTypes || [];
    if (entryTypes.indexOf("event") !== -1) {
      var inpObs = new PerformanceObserver(function (list) {
        list.getEntries().forEach(function (entry) {
          if (entry.duration > inpValue) inpValue = entry.duration;
        });
      });
      try {
        inpObs.observe({ type: "event", buffered: true, durationThreshold: 16 });
      } catch (e) {
        inpObs.observe({ type: "event", buffered: true });
      }
      addEventListener("pagehide", function () {
        if (inpValue) enqueue("INP", inpValue);
      }, { once: true });
    } else if (entryTypes.indexOf("first-input") !== -1) {
      var fidObs = new PerformanceObserver(function (list) {
        list.getEntries().forEach(function (entry) {
          enqueue("FID", entry.processingStart - entry.startTime);
          try { fidObs.disconnect(); } catch (e) {}
        });
      });
      fidObs.observe({ type: "first-input", buffered: true });
    }
  } catch (e) {}

  try {
    var nav = performance.getEntriesByType("navigation")[0];
    if (nav && typeof nav.responseStart === "number") {
      enqueue("TTFB", nav.responseStart);
    }
  } catch (e) {}

  window.AS_VITALS = {
    mark: function (name, value, extra) {
      if (typeof name === "string" && typeof value === "number") {
        enqueue(name, value, extra || null);
      }
    },
    flush: flush,
    debug: function () { return DEBUG; },
    pageGroup: function () { return PAGE_GROUP; }
  };
})();
