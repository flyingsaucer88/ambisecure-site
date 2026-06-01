/**
 * "Ask AmbiSecure" — a NON-AI discovery assistant.
 *
 * It looks conversational, but it does NOT generate answers. It maps a
 * natural-language question to one of a handful of curated intent groups
 * (and to the static search index) and replies with links to real,
 * crawlable AmbiSecure pages. No model, no API, no network beyond the
 * one-time, cache-busted search-index.json fetch the rest of the search
 * UI already uses.
 *
 * Phase 3 readiness: an AI retrieval path is intentionally NOT implemented.
 * A future AI mode is gated behind window.AS_ASSISTANT_CONFIG.enableAI,
 * which ships false. When false (always, in production) this file's
 * deterministic intent+search routing is the only code path.
 *
 * Progressive enhancement: the page ships a static, crawlable "Browse by
 * topic" block (the same curated links) that is always visible, so with
 * JS disabled the visitor still gets real navigation — content is never
 * hidden inside a JS-only chat.
 */
(function () {
  'use strict';

  var root = document.querySelector('[data-ask-assistant]');
  if (!root) return;

  var form     = root.querySelector('[data-ask-form]');
  var input    = root.querySelector('[data-ask-input]');
  var response = root.querySelector('[data-ask-response]');
  if (!form || !input || !response) return;

  var INDEX_URL = '/assets/data/search-index.json?v=31';

  // AI is disabled by default and unimplemented; this only documents intent.
  var cfg = window.AS_ASSISTANT_CONFIG || {};
  var AI_ENABLED = cfg.enableAI === true; // always false in production

  // Privacy-safe analytics shim (no query text / URLs sent).
  function track(name, value) {
    try { if (typeof window.ASTrack === 'function') window.ASTrack(name, Number(value || 1)); } catch (_) {}
  }

  // ---- Intent map: trigger phrases -> curated, real, crawlable pages. -----
  // Every URL here is validated against the live index by tools/audit-search.py.
  var INTENTS = [
    {
      id: 'fido',
      label: 'FIDO, passkeys & the validation server',
      triggers: ['fido', 'fido2', 'passkey', 'passkeys', 'webauthn', 'ctap', 'ctap2',
                 'validation server', 'authenticator', 'passwordless', 'phishing', 'mfa', '2fa', 'security key'],
      pages: ['/technologies/fido2/', '/technologies/passkeys/', '/services/fido-validation-server/',
              '/products/onepass-platform/', '/references/webauthn-cose/']
    },
    {
      id: 'secure-element',
      label: 'Secure element, AmbiSEC & hardware root of trust',
      triggers: ['secure element', 'secure-element', 'ambisec', 'root of trust', 'hardware root',
                 'javacard', 'java card', 'applet', 'eal5', 'tamper', 'coprocessor', 'co-processor', 'attestation'],
      pages: ['/technologies/secure-elements/', '/products/iot-security-coprocessor/',
              '/products/javacard-applets/', '/references/globalplatform/', '/resources/timelines/secure-elements/']
    },
    {
      id: 'telco',
      label: 'SIMAuth, SMS-OTP replacement & telco authentication',
      triggers: ['simauth', 'sms otp', 'sms-otp', 'otp', 'one-time password', 'telco', 'telecom',
                 'sim swap', 'subscriber', 'mobile authentication'],
      pages: ['/solutions/esim-security/', '/products/esim-solution/', '/resources/timelines/otp-sms/',
              '/solutions/device-identity-at-scale/', '/references/sgp-32/']
    },
    {
      id: 'v2x',
      label: 'V2X / ITS PKI — IEEE 1609.2, ETSI & ISO 21177',
      triggers: ['v2x', 'its ', 'vehicle', 'ieee 1609', '1609', 'etsi', '102 941', '103 097',
                 'iso 21177', '21177', 'pseudonym', 'c-its', 'connected mobility', 'butterfly'],
      pages: ['/references/etsi-ts-102-941/', '/references/ieee-1609-2/', '/solutions/device-identity-at-scale/',
              '/solutions/v2x-security/', '/technologies/v2x-pki/', '/references/etsi-ts-103-097/',
              '/references/iso-21177/', '/blog/how-v2x-pki-works/']
    },
    {
      id: 'desfire',
      label: 'DESFire, ticketing & closed-loop payments',
      triggers: ['desfire', 'mifare', 'ticket', 'ticketing', 'transit', 'transport', 'closed-loop',
                 'closed loop', 'fare', 'access control', 'contactless payment'],
      pages: ['/technologies/desfire/', '/references/desfire/', '/solutions/closed-loop-ticketing/',
              '/solutions/transit-ticketing/', '/industries/transportation/']
    },
    {
      id: 'esim',
      label: 'eSIM, eUICC & SM-DP+',
      triggers: ['esim', 'e-sim', 'euicc', 'sm-dp', 'smdp', 'sgp', 'remote provisioning', 'rsp', 'profile'],
      pages: ['/products/esim-solution/', '/solutions/esim-security/', '/references/sgp-32/',
              '/solutions/device-identity-at-scale/']
    },
    {
      id: 'pki',
      label: 'PKI — certificates, signing & verification',
      triggers: ['pki', 'certificate', 'cert', 'x.509', 'x509', 'signing', 'signature', 'verification',
                 'asn.1', 'asn1', 'csr', 'public key infrastructure', 'digital signature'],
      pages: ['/references/x509-extensions/', '/references/x509-oids/', '/products/digital-signature-token/',
              '/resources/tools/cert-chain/', '/resources/tools/asn1-parser/', '/technologies/v2x-pki/']
    }
  ];

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }
  function norm(s) { return String(s || '').toLowerCase().replace(/\s+/g, ' ').trim(); }

  var byUrl = {};
  var indexPromise = null;
  function loadIndex() {
    if (indexPromise) return indexPromise;
    indexPromise = fetch(INDEX_URL, { credentials: 'same-origin' })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        var pages = j.pages || [];
        pages.forEach(function (p) { byUrl[p.u] = p; });
        return pages;
      })
      .catch(function () { return []; });
    return indexPromise;
  }

  function titleFor(url) {
    var p = byUrl[url];
    if (p && p.t) return p.t.replace(/\s*[|—\-]\s*AmbiSecure\s*$/, '');
    // Humanise the last path segment as a fallback.
    var seg = url.replace(/\/$/, '').split('/').pop() || url;
    return seg.replace(/[-_]/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }
  function descFor(url) { var p = byUrl[url]; return p ? (p.x || p.d || '') : ''; }
  function typeFor(url) { var p = byUrl[url]; return p ? (p.l || '') : ''; }

  function scoreIntents(q) {
    var scored = [];
    INTENTS.forEach(function (it) {
      var s = 0;
      it.triggers.forEach(function (t) { if (q.indexOf(t) !== -1) s += (t.length > 4 ? 3 : 2); });
      if (s > 0) scored.push({ intent: it, score: s });
    });
    scored.sort(function (a, b) { return b.score - a.score; });
    return scored;
  }

  // Lightweight direct index search (mirrors the /search/ scorer, trimmed).
  function searchIndex(pages, q) {
    var terms = q.split(' ').filter(function (t) { return t.length > 1; });
    if (!terms.length) return [];
    var out = [];
    for (var i = 0; i < pages.length; i++) {
      var p = pages[i];
      var hay = norm((p.t || '') + ' ' + (p.d || '') + ' ' + (p.e || '') + ' ' +
                     (p.x || '') + ' ' + ((p.k || []).join(' ')) + ' ' + (p.u || ''));
      var s = 0, ok = true;
      for (var j = 0; j < terms.length; j++) {
        if (hay.indexOf(terms[j]) === -1) { ok = false; break; }
        s += 1;
        if (norm(p.t || '').indexOf(terms[j]) !== -1) s += 2;
        if (((p.k || []).join(' ').toLowerCase()).indexOf(terms[j]) !== -1) s += 2;
      }
      if (ok) out.push({ p: p, s: s });
    }
    out.sort(function (a, b) { return b.s - a.s; });
    return out.map(function (m) { return m.p; });
  }

  function renderList(urls) {
    var seen = {}, html = '';
    urls.forEach(function (u) {
      if (!u || seen[u]) return;
      seen[u] = 1;
      var d = descFor(u), ty = typeFor(u);
      html += '<li class="ask-result">' +
              '<a href="' + esc(u) + '" data-ask-link="1">' +
              '<span class="ask-result-title">' + esc(titleFor(u)) +
              (ty ? ' <span class="sitewide-search-type">' + esc(ty) + '</span>' : '') + '</span>' +
              (d ? '<span class="ask-result-desc">' + esc(d) + '</span>' : '') +
              '</a></li>';
    });
    return html;
  }

  function answer(rawQuery, pages) {
    var q = norm(rawQuery);
    if (!q) { response.innerHTML = ''; return; }
    track('assistant_query', q.length);

    var intents = scoreIntents(q);
    var direct = searchIndex(pages, q);

    var html = '';
    if (intents.length || direct.length) {
      html += '<p class="ask-lead">I found relevant AmbiSecure resources:</p>';
      // Curated intent group(s) first — up to two.
      intents.slice(0, 2).forEach(function (m) {
        html += '<div class="ask-group"><h3 class="ask-group-label">' + esc(m.intent.label) + '</h3>' +
                '<ul class="ask-results">' + renderList(m.intent.pages) + '</ul></div>';
      });
      // Then a few direct index hits that aren't already shown.
      var shownUrls = {};
      intents.slice(0, 2).forEach(function (m) { m.intent.pages.forEach(function (u) { shownUrls[u] = 1; }); });
      var extra = direct.filter(function (p) { return !shownUrls[p.u]; }).slice(0, 6).map(function (p) { return p.u; });
      if (extra.length) {
        html += '<div class="ask-group"><h3 class="ask-group-label">More matches from search</h3>' +
                '<ul class="ask-results">' + renderList(extra) + '</ul></div>';
      }
    } else {
      html += '<p class="ask-lead">I couldn’t match that to a specific topic. Try the popular topics below, ' +
              'use the <a href="#sitewide-search-input">sitewide search</a>, or start from ' +
              '<a href="/products/">products</a>, <a href="/technologies/">technologies</a>, or ' +
              '<a href="/references/">references</a>.</p>';
      track('assistant_no_match', 1);
    }
    response.innerHTML = html;
  }

  // Track outbound clicks (privacy-safe: no URL sent).
  response.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[data-ask-link]') : null;
    if (a) track('assistant_result_clicked', 1);
  }, { passive: true });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    loadIndex().then(function (pages) { answer(input.value, pages); });
  });

  // Pre-warm the index on first focus so the first answer is instant.
  input.addEventListener('focus', loadIndex, { once: true });

  // (AI_ENABLED is intentionally unused beyond this guard — there is no AI path.)
  if (AI_ENABLED) {
    // Reserved for a future, citation-bound retrieval mode. Not shipped.
    response.setAttribute('data-ai-reserved', '1');
  }
})();
