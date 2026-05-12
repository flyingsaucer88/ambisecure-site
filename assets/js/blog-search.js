(function () {
  'use strict';

  var INDEX_URL = "/assets/data/blog-search-index.json";



  var SYNONYM_GROUPS = [
    ["fido", "webauthn", "ctap2"],
    ["passkey", "passkeys"],
    ["secure-element", "se"],
    ["smart-card", "smartcard", "card"],
    ["mfa", "2fa", "multi-factor"],
    ["totp", "otp", "one-time-password"],
    ["desfire", "mifare"],
    ["sam", "secure-access-module"],
    ["hsm", "hardware-security-module"],
    ["tpm", "trusted-platform-module"],
    ["rp", "relying-party"],
    ["scp02", "scp"],
    ["scp03", "scp"],
    ["aaguid", "authenticator-aaguid"],
    ["x509", "x-509", "certificate"],
    ["pki", "certificate-authority", "ca"],
    ["est", "rfc7030", "rfc-7030"],
    ["ocsp", "revocation"],
    ["crl", "revocation"],
    ["nfc", "iso14443", "iso-14443", "contactless"],
    ["apdu", "iso7816", "iso-7816"],
    ["onepass", "one-pass"],
    ["biokey", "bio-key", "biometric"],
    ["fingerprint", "biometric"],
    ["transit", "metro", "ticketing"]
  ];

  var SYNONYM_MAP = (function () {
    var m = Object.create(null);
    SYNONYM_GROUPS.forEach(function (g) {
      g.forEach(function (t) {
        m[t] = m[t] || [];
        g.forEach(function (s) { if (s !== t) m[t].push(s); });
      });
    });
    return m;
  })();


  var POPULAR = [
    "fido", "desfire", "javacard", "passkey", "attestation",
    "sam", "scp03", "secure element", "transit", "pki"
  ];



  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  function parseQuery() {
    var out = {};
    if (!window.location || !window.location.search) return out;
    window.location.search.replace(/^\?/, "").split("&").forEach(function (p) {
      if (!p) return;
      var i = p.indexOf("=");
      var k = i >= 0 ? p.slice(0, i) : p;
      var v = i >= 0 ? decodeURIComponent(p.slice(i + 1).replace(/\+/g, " ")) : "";
      out[k] = v;
    });
    return out;
  }

  function tokenize(text) {
    return text.toLowerCase().split(/[^a-z0-9-]+/).filter(function (t) {
      return t && t.length > 1;
    });
  }

  function stem(t) {
    if (t.length <= 4) return t;
    if (t.endsWith("ies")) return t.slice(0, -3) + "y";
    if (t.endsWith("es")) return t.slice(0, -2);
    if (t.endsWith("s")) return t.slice(0, -1);
    if (t.endsWith("ing")) return t.slice(0, -3);
    if (t.endsWith("ed")) return t.slice(0, -2);
    return t;
  }

  function expandQuery(tokens) {
    var out = new Set();
    tokens.forEach(function (t) {
      out.add(t);
      out.add(stem(t));
      var syns = SYNONYM_MAP[t] || SYNONYM_MAP[stem(t)];
      if (syns) syns.forEach(function (s) { out.add(s); });
    });
    return Array.from(out);
  }



  function scoreEntry(entry, qTokens, expanded, filters) {
    if (filters.category) {
      var cats = (entry.categories || []).map(function (c) { return c.toLowerCase(); });
      if (cats.indexOf(filters.category.toLowerCase()) === -1) return -1;
    }
    if (filters.tag) {
      var tags = (entry.tags || []).map(function (t) { return t.toLowerCase(); });
      if (tags.indexOf(filters.tag.toLowerCase()) === -1) return -1;
    }
    if (filters.type) {
      if ((entry.type || "modern") !== filters.type) return -1;
    }
    if (!qTokens.length) return 1;

    var titleTok = tokenize(entry.title);
    var summaryTok = tokenize(entry.summary);
    var indexed = entry.tokens || [];

    var score = 0;
    qTokens.forEach(function (qt) {
      var qtStem = stem(qt);

      if (titleTok.indexOf(qt) !== -1 || titleTok.indexOf(qtStem) !== -1) score += 10;

      else if (summaryTok.indexOf(qt) !== -1 || summaryTok.indexOf(qtStem) !== -1) score += 5;

      else if (indexed.indexOf(qt) !== -1 || indexed.indexOf(qtStem) !== -1) score += 3;
      else {

        var titleMatch = false;
        for (var i = 0; i < titleTok.length; i++) {
          if (titleTok[i].indexOf(qt) === 0) { score += 2; titleMatch = true; break; }
        }
        if (!titleMatch) {

          for (var j = 0; j < indexed.length; j++) {
            if (indexed[j].indexOf(qt) === 0) { score += 1; break; }
          }
        }
      }
    });


    expanded.forEach(function (et) {
      if (qTokens.indexOf(et) !== -1) return;
      if (indexed.indexOf(et) !== -1 ||
          titleTok.indexOf(et) !== -1 ||
          summaryTok.indexOf(et) !== -1) {
        score += 1;
      }
    });


    if (entry.type === "archive") score = Math.max(0, score - 0.5);
    return score;
  }



  function emptyState(list, query, allEntries) {
    list.innerHTML = "";
    var msg = document.createElement("li");
    msg.className = "blog-search-empty";
    msg.textContent = query
      ? "No matches for “" + query + "”. Try one of the popular searches below."
      : "Type to search across " + (allEntries.length || "all") +
        " engineering posts — cornerstone, modern, and archive.";
    list.appendChild(msg);

    var popularWrap = document.createElement("li");
    popularWrap.className = "blog-search-meta-section";
    var popH = document.createElement("h4");
    popH.textContent = "Popular searches";
    popularWrap.appendChild(popH);
    var popList = document.createElement("ul");
    popList.className = "blog-search-popular";
    POPULAR.forEach(function (term) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = "/search/?q=" + encodeURIComponent(term);
      a.textContent = term;
      a.className = "blog-search-popular-link";
      li.appendChild(a);
      popList.appendChild(li);
    });
    popularWrap.appendChild(popList);
    list.appendChild(popularWrap);


    var tags = new Set();
    allEntries.forEach(function (e) {
      (e.tags || []).forEach(function (t) { tags.add(t); });
    });
    if (tags.size) {
      var tagWrap = document.createElement("li");
      tagWrap.className = "blog-search-meta-section";
      var tagH = document.createElement("h4");
      tagH.textContent = "Or browse by tag";
      tagWrap.appendChild(tagH);
      var tagList = document.createElement("ul");
      tagList.className = "blog-search-popular";
      Array.from(tags).sort().slice(0, 16).forEach(function (t) {
        var slug = t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.href = "/tags/" + slug + "/";
        a.textContent = t;
        a.className = "blog-search-popular-link";
        li.appendChild(a);
        tagList.appendChild(li);
      });
      tagWrap.appendChild(tagList);
      list.appendChild(tagWrap);
    }
  }

  function renderHit(e) {
    var li = document.createElement("li");
    li.className = "blog-search-hit";

    var meta = document.createElement("div");
    meta.className = "blog-search-hit-meta";
    meta.textContent = e.date + " · " + (e.type === "archive" ? "archive" : "modern");
    li.appendChild(meta);

    var a = document.createElement("a");
    a.href = e.url;
    a.className = "blog-search-hit-title";
    a.textContent = e.title;
    li.appendChild(a);

    if (e.summary) {
      var p = document.createElement("p");
      p.className = "blog-search-hit-summary";
      p.textContent = e.summary;
      li.appendChild(p);
    }

    if ((e.tags || []).length) {
      var tagWrap = document.createElement("div");
      tagWrap.className = "blog-search-hit-tags";
      e.tags.forEach(function (t) {
        var slug = t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        var tagLink = document.createElement("a");
        tagLink.href = "/tags/" + slug + "/";
        tagLink.className = "blog-search-hit-tag";
        tagLink.textContent = t;
        tagWrap.appendChild(tagLink);
      });
      li.appendChild(tagWrap);
    }
    return li;
  }

  function renderGroup(list, label, entries) {
    if (!entries.length) return;
    var header = document.createElement("li");
    header.className = "blog-search-group-header";
    header.textContent = label + " · " + entries.length;
    list.appendChild(header);
    entries.forEach(function (e) { list.appendChild(renderHit(e)); });
  }

  function renderResults(list, scored, query, allEntries) {
    list.innerHTML = "";
    if (!scored.length) {
      emptyState(list, query, allEntries);
      return;
    }

    var cornerstoneCut = scored[0] && scored[0].s >= 8 ? 8 : null;
    var cornerstones = [];
    var modern = [];
    var archive = [];
    scored.forEach(function (x) {
      if (x.e.type === "archive") archive.push(x.e);
      else if (cornerstoneCut !== null && x.s >= cornerstoneCut) cornerstones.push(x.e);
      else modern.push(x.e);
    });

    if (cornerstones.length > 5) {
      modern = cornerstones.concat(modern);
      cornerstones = [];
    }
    renderGroup(list, "Cornerstone matches", cornerstones);
    renderGroup(list, "Modern engineering", modern);
    renderGroup(list, "Engineering archive", archive);
  }



  function setUpSearch(input, list) {
    var entries = null;
    var loading = false;

    function ensureIndex() {
      if (entries || loading) return Promise.resolve(entries);
      loading = true;
      return fetch(INDEX_URL, { credentials: "same-origin" })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          entries = (data && data.entries) || [];
          window.AS_BLOG_SEARCH_COUNT = entries.length;
          return entries;
        })
        .catch(function () { entries = []; return entries; })
        .then(function (e) { loading = false; return e; });
    }

    function applyFilters() {
      var q = (input.value || "").trim();
      var query = parseQuery();
      var filters = {
        category: query.category || null,
        tag: query.tag || list.getAttribute("data-default-tag") || null,
        type: query.type || null
      };
      var qTokens = tokenize(q);
      var expanded = expandQuery(qTokens);

      ensureIndex().then(function (all) {
        var scored = [];
        all.forEach(function (e) {
          var s = scoreEntry(e, qTokens, expanded, filters);
          if (s >= 1) scored.push({ e: e, s: s });
        });
        scored.sort(function (a, b) {
          if (b.s !== a.s) return b.s - a.s;
          return (b.e.date || "").localeCompare(a.e.date || "");
        });
        renderResults(list, scored, q, all);
      });
    }

    var debounce = null;
    input.addEventListener("input", function () {
      clearTimeout(debounce);
      debounce = setTimeout(applyFilters, 80);
    });
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        applyFilters();
      }
    });

    var initialQ = parseQuery().q;
    if (initialQ) input.value = initialQ;
    applyFilters();
  }

  function init() {
    var input = $("[data-blog-search]");
    var list = $("[data-blog-search-results]");
    if (!input || !list) return;
    setUpSearch(input, list);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
