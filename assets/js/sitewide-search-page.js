/**
 * Sitewide search renderer for the /search/ page.
 *
 * Reads /assets/data/search-index.json (the same index the navbar ⌘K
 * overlay uses, 280+ pages across products / services / technologies /
 * solutions / industries / case studies / blog / archive / categories /
 * tags / references / resources / videos / brochures / engagement /
 * about / support / contact / partners / trust / privacy) and renders
 * grouped results inline on the page. Client-side only; no network beyond
 * the one-time index fetch.
 *
 * Cache-busting: the index is fetched with the site asset version (?v=NN),
 * matching every other versioned asset on the page, so a release bump
 * re-fetches a fresh index.
 *
 * Analytics: search_submitted / search_no_results / search_result_clicked
 * are emitted via window.ASTrack when the site's analytics layer is active.
 * Only an event name + a numeric value are sent — never the query text or
 * the destination URL — matching the site's privacy-first convention.
 */
(function () {
  'use strict';

  var INDEX_URL = '/assets/data/search-index.json?v=31';
  var input = document.querySelector('[data-sitewide-search]');
  var results = document.querySelector('[data-sitewide-search-results]');
  if (!input || !results) return;

  // Privacy-safe analytics shim: no-op unless the site analytics layer
  // (assets/js/analytics.js) has defined window.ASTrack. We never pass the
  // query string or a URL — only the event marker and a coarse numeric value.
  function track(name, value) {
    try {
      if (typeof window.ASTrack === 'function') window.ASTrack(name, Number(value || 1));
    } catch (_) {}
  }

  var GROUPS = [
    { slug: 'product',   label: 'Products' },
    { slug: 'service',   label: 'Services' },
    { slug: 'solution',  label: 'Solutions' },
    { slug: 'tech',      label: 'Technologies' },
    { slug: 'technology',label: 'Technologies' },
    { slug: 'industry',  label: 'Industries' },
    { slug: 'case',      label: 'Case studies' },
    { slug: 'timeline',  label: 'Timelines' },
    { slug: 'ref',       label: 'References' },
    { slug: 'tool',      label: 'Developer tools' },
    { slug: 'blog',      label: 'Engineering blog' },
    { slug: 'archive',   label: 'Engineering archive' },
    { slug: 'category',  label: 'Blog categories' },
    { slug: 'tag',       label: 'Tags' },
    { slug: 'video',     label: 'Videos' },
    { slug: 'brochure',  label: 'Brochures' },
    { slug: 'engage',    label: 'Engagement models' },
    { slug: 'res',       label: 'Resources' },
    { slug: 'about',     label: 'Company' },
    { slug: 'support',   label: 'Support' },
    { slug: 'partners',  label: 'Partners' },
    { slug: 'trust',     label: 'Trust' },
    { slug: 'contact',   label: 'Contact' },
    { slug: 'privacy',   label: 'Privacy' },
    { slug: 'page',      label: 'Other pages' }
  ];

  var SYNONYMS = {
    'webauthn': ['fido', 'passkey'],
    'fido': ['webauthn', 'ctap2', 'passkey'],
    'passkey': ['fido', 'webauthn', 'passkeys'],
    'passkeys': ['passkey', 'fido'],
    'se': ['secure-element', 'secure element'],
    'secure-element': ['se', 'eal5+'],
    '2fa': ['mfa', 'multi-factor'],
    'mfa': ['2fa', 'multi-factor'],
    'otp': ['totp', 'one-time-password'],
    'desfire': ['mifare'],
    'sam': ['secure-access-module'],
    'hsm': ['hardware-security-module'],
    'tpm': ['trusted-platform-module'],
    'apdu': ['iso7816', 'iso-7816'],
    'nfc': ['iso14443', 'iso-14443', 'contactless'],
    'pki': ['x509', 'x.509', 'certificate'],
    'oidc': ['openid', 'openid-connect'],
    'mff2': ['solderable', 'embedded-se'],
    'euicc': ['esim', 'sgp'],
    'esim': ['euicc', 'sgp'],
    'v2x': ['ieee', '1609', 'etsi', 'its'],
    'sms': ['otp', 'sms-otp']
  };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  function norm(s) {
    return String(s || '').toLowerCase().normalize ? String(s || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '') : String(s || '').toLowerCase();
  }

  // Highlight raw query tokens inside an already-escaped string.
  function highlight(text, rawTerms) {
    var safe = esc(text);
    if (!rawTerms || !rawTerms.length) return safe;
    rawTerms.forEach(function (t) {
      if (!t || t.length < 2) return;
      var re = new RegExp('(' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
      safe = safe.replace(re, '<mark>$1</mark>');
    });
    return safe;
  }

  function expandTerms(terms) {
    var out = [];
    terms.forEach(function (t) {
      out.push(t);
      var syns = SYNONYMS[t];
      if (syns) syns.forEach(function (s) { out.push(s); });
    });
    return out;
  }

  function scorePage(p, terms) {
    var kw = (p.k && p.k.length) ? p.k.join(' ') : '';
    var hay = (p.t || '') + ' ' + (p.d || '') + ' ' + (p.e || '') + ' ' + (p.x || '') + ' ' + kw + ' ' + (p.u || '');
    hay = norm(hay);
    var score = 0;
    for (var i = 0; i < terms.length; i++) {
      var t = terms[i];
      if (!t) continue;
      var idx = hay.indexOf(t);
      if (idx === -1) return 0;
      score += 5 + Math.max(0, 24 - idx) / 4;
      if (norm(p.t || '').indexOf(t) !== -1) score += 8;
      if (norm(p.e || '').indexOf(t) !== -1) score += 4;
      if (kw && norm(kw).indexOf(t) !== -1) score += 6;
    }
    return score;
  }

  var indexPromise = null;
  function loadIndex() {
    if (indexPromise) return indexPromise;
    indexPromise = fetch(INDEX_URL, { credentials: 'same-origin' })
      .then(function (r) { return r.json(); })
      .then(function (j) { return j.pages || []; })
      .catch(function () { return []; });
    return indexPromise;
  }

  function groupResults(matches) {
    var by = {};
    matches.forEach(function (m) {
      var s = m.s || 'page';
      (by[s] = by[s] || []).push(m);
    });
    return by;
  }

  var lastSubmitted = '';
  var lastNoResults = '';

  function render(query, pages) {
    var q = norm(query).trim();
    if (!q) {
      results.innerHTML = '<li class="sitewide-search-empty"><strong>' + pages.length + ' pages indexed.</strong> Type a topic, protocol, or product to search across products, services, technologies, solutions, industries, case studies, blog posts, references, and more. Or pick a suggestion above.</li>';
      return;
    }
    var rawTerms = q.split(/\s+/).filter(Boolean);
    var terms = expandTerms(rawTerms);

    if (q.length >= 2 && q !== lastSubmitted) {
      lastSubmitted = q;
      track('search_submitted', q.length);
    }

    var matches = [];
    for (var i = 0; i < pages.length; i++) {
      var sc = scorePage(pages[i], terms);
      if (sc > 0) matches.push({ p: pages[i], score: sc });
    }
    if (!matches.length) {
      if (q !== lastNoResults) { lastNoResults = q; track('search_no_results', q.length); }
      results.innerHTML = '<li class="sitewide-search-empty">No matches for <strong>' + esc(query) + '</strong>. Try a different protocol, product name, or standard — or jump straight to <a href="/products/">products</a>, <a href="/technologies/">technologies</a>, <a href="/references/">references</a>, or the <a href="/blog/">engineering blog</a>.</li>';
      return;
    }
    matches.sort(function (a, b) { return b.score - a.score; });
    var grouped = groupResults(matches.map(function (m) { return m.p; }));
    var html = '';
    var seenGroups = {};
    for (var g = 0; g < GROUPS.length; g++) {
      var grp = GROUPS[g];
      var arr = grouped[grp.slug];
      if (!arr || !arr.length || seenGroups[grp.label]) continue;
      seenGroups[grp.label] = 1;
      html += '<li class="sitewide-search-group"><span class="sitewide-search-group-label">' + esc(grp.label) + '</span></li>';
      for (var j = 0; j < arr.length && j < 12; j++) {
        var p = arr[j];
        var title = p.t || p.u || '';
        var titleClean = title.replace(/\s*\|\s*AmbiSecure\s*$/, '').replace(/\s*[—\-]\s*AmbiSecure\s*$/, '');
        var snippet = p.x || p.d || '';
        html += '<li class="sitewide-search-item">' +
                '<a href="' + esc(p.u || '#') + '" data-search-result="1">' +
                '<span class="sitewide-search-title">' + highlight(titleClean, rawTerms) +
                (p.l ? ' <span class="sitewide-search-type">' + esc(p.l) + '</span>' : '') +
                '</span>' +
                (snippet ? '<span class="sitewide-search-desc">' + highlight(snippet, rawTerms) + '</span>' : '') +
                '</a></li>';
      }
    }
    results.innerHTML = html;
  }

  // Delegated click tracking for result links (privacy-safe: no URL sent).
  results.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[data-search-result]') : null;
    if (a) track('search_result_clicked', 1);
  }, { passive: true });

  loadIndex().then(function (pages) {
    var run = function () { render(input.value, pages); };
    input.addEventListener('input', run);

    // Suggestion chips: clicking one fills the box and runs the search.
    var chips = document.querySelectorAll('[data-search-suggest]');
    Array.prototype.forEach.call(chips, function (chip) {
      chip.addEventListener('click', function (e) {
        e.preventDefault();
        input.value = chip.getAttribute('data-search-suggest') || chip.textContent || '';
        run();
        input.focus();
      });
    });

    // Pre-populate from ?q= query string
    var m = (location.search || '').match(/[?&]q=([^&]*)/);
    if (m && m[1]) {
      input.value = decodeURIComponent(m[1].replace(/\+/g, ' '));
    }
    run();
    input.focus();
  });
})();
