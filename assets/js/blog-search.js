/**
 * AmbiSecure blog search — Phase 11.
 *
 * Client-side. No backend, no third-party SaaS.
 * Loads /assets/data/blog-search-index.json on demand. Filters in memory.
 *
 * Markup contract:
 *   <input type="search" data-blog-search>
 *   <ul    data-blog-search-results></ul>
 *
 * Optional filters (driven by query string or attributes):
 *   ?q=...            initial query
 *   ?category=...     pre-applies a category filter
 *   ?tag=...          pre-applies a tag filter
 *   ?type=modern|archive
 *
 * CSP: parse-time only. One fetch to /assets/data/blog-search-index.json
 * which is same-origin (script-src 'self', connect-src 'self').
 */
(function () {
  'use strict';

  var INDEX_URL = "/assets/data/blog-search-index.json";

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

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
    return text.toLowerCase().split(/[^a-z0-9-]+/).filter(function (t) { return t && t.length > 1; });
  }

  function scoreEntry(entry, queryTokens, filters) {
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
    if (!queryTokens.length) return 1; // pure-filter mode

    var titleTok = tokenize(entry.title);
    var summaryTok = tokenize(entry.summary);
    var indexed = entry.tokens || [];
    var score = 0;
    queryTokens.forEach(function (qt) {
      // Exact token hit in title: heavy weight.
      if (titleTok.indexOf(qt) !== -1) score += 8;
      // Exact token hit in summary: medium.
      else if (summaryTok.indexOf(qt) !== -1) score += 4;
      // Token hit in precomputed index (categories/tags/etc.): light.
      else if (indexed.indexOf(qt) !== -1) score += 2;
      else {
        // Prefix match anywhere — half score.
        var found = false;
        for (var i = 0; i < indexed.length; i++) {
          if (indexed[i].indexOf(qt) === 0) { score += 1; found = true; break; }
        }
        if (!found && entry.title.toLowerCase().indexOf(qt) !== -1) score += 1;
      }
    });
    return score;
  }

  function renderResults(list, entries, query) {
    list.innerHTML = "";
    if (!entries.length) {
      var li = document.createElement("li");
      li.className = "blog-search-empty";
      li.textContent = query
        ? "No matches for “" + query + "”."
        : "Type to search across " + (window.AS_BLOG_SEARCH_COUNT || "all") + " engineering posts.";
      list.appendChild(li);
      return;
    }
    entries.forEach(function (e) {
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
          var tagSlug = t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
          var tagLink = document.createElement("a");
          tagLink.href = "/tags/" + tagSlug + "/";
          tagLink.className = "blog-search-hit-tag";
          tagLink.textContent = t;
          tagWrap.appendChild(tagLink);
        });
        li.appendChild(tagWrap);
      }

      list.appendChild(li);
    });
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
      var queryTokens = tokenize(q);
      ensureIndex().then(function (all) {
        var scored = [];
        all.forEach(function (e) {
          var s = scoreEntry(e, queryTokens, filters);
          if (s >= (queryTokens.length ? 1 : 1)) scored.push({ e: e, s: s });
        });
        scored.sort(function (a, b) {
          if (b.s !== a.s) return b.s - a.s;
          return (b.e.date || "").localeCompare(a.e.date || "");
        });
        renderResults(list, scored.map(function (x) { return x.e; }), q);
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
