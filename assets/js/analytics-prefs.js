(function () {
  'use strict';

  var KEY = "as-analytics-opt-out";

  function readPref() {
    try { return localStorage.getItem(KEY); } catch (_) { return null; }
  }
  function writePref(v) {
    try {
      if (v === null) localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, v);
    } catch (_) {}
  }
  function isDntOn() {
    var d = navigator.doNotTrack || window.doNotTrack || navigator.msDoNotTrack;
    return d === "1" || d === "yes";
  }
  function effectiveStatus() {
    var p = readPref();
    if (p === "1") return "opted-out";
    if (p === "0") return "opted-in";
    if (isDntOn()) return "opted-out";
    return "default";
  }

  function render(host) {
    var status = effectiveStatus();
    host.innerHTML = "";

    var wrap = document.createElement("div");
    wrap.className = "analytics-prefs";

    var h = document.createElement("h2");
    h.textContent = "Analytics preferences";
    wrap.appendChild(h);

    var p = document.createElement("p");
    p.className = "analytics-prefs-status";
    if (status === "opted-out") {
      p.textContent = "Analytics is disabled in your browser. No measurement scripts will load on AmbiSecure pages.";
    } else if (status === "opted-in") {
      p.textContent = "Analytics is enabled in your browser. Privacy-conscious aggregate measurement runs in the background.";
    } else {
      p.textContent = "Analytics is at the default — runs when the site has analytics enabled and your browser does not signal Do-Not-Track.";
    }
    wrap.appendChild(p);

    if (isDntOn()) {
      var dnt = document.createElement("p");
      dnt.className = "analytics-prefs-dnt";
      dnt.textContent = "Your browser sends Do-Not-Track. AmbiSecure respects that signal regardless of the buttons below.";
      wrap.appendChild(dnt);
    }

    var row = document.createElement("div");
    row.className = "analytics-prefs-row";

    var btnOut = document.createElement("button");
    btnOut.type = "button";
    btnOut.className = "btn btn-outline";
    btnOut.textContent = "Opt out of analytics";
    btnOut.disabled = status === "opted-out";
    btnOut.addEventListener("click", function () {
      writePref("1");
      render(host);
    });

    var btnIn = document.createElement("button");
    btnIn.type = "button";
    btnIn.className = "btn btn-outline";
    btnIn.textContent = "Opt in";
    btnIn.disabled = status === "opted-in";
    btnIn.addEventListener("click", function () {
      writePref("0");
      render(host);
    });

    var btnDefault = document.createElement("button");
    btnDefault.type = "button";
    btnDefault.className = "btn btn-outline";
    btnDefault.textContent = "Use site default";
    btnDefault.disabled = status === "default";
    btnDefault.addEventListener("click", function () {
      writePref(null);
      render(host);
    });

    row.appendChild(btnOut);
    row.appendChild(btnIn);
    row.appendChild(btnDefault);
    wrap.appendChild(row);

    var note = document.createElement("p");
    note.className = "analytics-prefs-note";
    note.textContent = "Preference stored in your browser only (localStorage). Clear site data to reset.";
    wrap.appendChild(note);

    host.appendChild(wrap);
  }

  function init() {
    var hosts = document.querySelectorAll("[data-analytics-prefs]");
    for (var i = 0; i < hosts.length; i++) render(hosts[i]);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
