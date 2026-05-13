/**
 * Sitewide search renderer for the /search/ page.
 *
 * Reads /assets/data/search-index.json (the same index the navbar ⌘K
 * overlay uses, 260+ pages across products / services / technologies /
 * solutions / industries / case studies / blog / archive / categories /
 * tags / references / resources / videos / brochures / engagement /
 * about / support / contact / partners / trust / privacy) and renders
 * grouped results inline on the page. Client-side only; no network.
 */
(function () {
  'use strict';

  var INDEX_URL = '/assets/data/search-index.json';
  var input = document.querySelector('[data-sitewide-search]');
  var results = document.querySelector('[data-sitewide-search-results]');
  if (!input || !results) return;

  var GROUPS = [
    { slug: 'product',   label: 'Products' },
    { slug: 'service',   label: 'Services' },
    { slug: 'solution',  label: 'Solutions' },
    { slug: 'tech',      label: 'Technologies' },
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
    'mff2': ['solderable', 'embedded-se']
  };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  function norm(s) {
    return String(s || '').toLowerCase().normalize ? String(s || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '') : String(s || '').toLowerCase();
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
    var hay = (p.t || '') + ' ' + (p.d || '') + ' ' + (p.e || '') + ' ' + (p.u || '');
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

  function render(query, pages) {
    var q = norm(query).trim();
    if (!q) {
      results.innerHTML = '<li class="sitewide-search-empty"><strong>' + pages.length + ' pages indexed.</strong> Type a topic, protocol, or product to search across products, services, technologies, solutions, industries, case studies, blog posts, references, and more.</li>';
      return;
    }
    var rawTerms = q.split(/\s+/).filter(Boolean);
    var terms = expandTerms(rawTerms);
    var matches = [];
    for (var i = 0; i < pages.length; i++) {
      var sc = scorePage(pages[i], terms);
      if (sc > 0) matches.push({ p: pages[i], score: sc });
    }
    if (!matches.length) {
      results.innerHTML = '<li class="sitewide-search-empty">No matches for <strong>' + esc(query) + '</strong>. Try a different protocol, product name, or standard — or open <a href="/blog/">the engineering blog</a> and <a href="/products/">products</a> directly.</li>';
      return;
    }
    matches.sort(function (a, b) { return b.score - a.score; });
    var grouped = groupResults(matches.map(function (m) { return m.p; }));
    var html = '';
    for (var g = 0; g < GROUPS.length; g++) {
      var grp = GROUPS[g];
      var arr = grouped[grp.slug];
      if (!arr || !arr.length) continue;
      html += '<li class="sitewide-search-group"><span class="sitewide-search-group-label">' + esc(grp.label) + '</span></li>';
      for (var j = 0; j < arr.length && j < 12; j++) {
        var p = arr[j];
        var title = p.t || p.u || '';
        var titleClean = title.replace(/\s*\|\s*AmbiSecure\s*$/, '').replace(/\s*[—\-]\s*AmbiSecure\s*$/, '');
        html += '<li class="sitewide-search-item">' +
                '<a href="' + esc(p.u || '#') + '">' +
                '<span class="sitewide-search-title">' + esc(titleClean) + '</span>' +
                (p.d ? '<span class="sitewide-search-desc">' + esc(p.d) + '</span>' : '') +
                '</a></li>';
      }
    }
    results.innerHTML = html;
  }

  loadIndex().then(function (pages) {
    var run = function () { render(input.value, pages); };
    input.addEventListener('input', run);
    // Pre-populate from ?q= query string
    var m = (location.search || '').match(/[?&]q=([^&]*)/);
    if (m && m[1]) {
      input.value = decodeURIComponent(m[1].replace(/\+/g, ' '));
    }
    run();
    input.focus();
  });
})();
