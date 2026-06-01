(function () {
  'use strict';

  var INDEX_URL = '/assets/data/search-index.json?v=31';
  var indexPromise = null;

  // Privacy-safe analytics shim: no-op unless analytics.js has defined
  // window.ASTrack. Only an event marker + numeric value are sent — never
  // the query text or destination URL.
  function track(name, value) {
    try {
      if (typeof window.ASTrack === 'function') window.ASTrack(name, Number(value || 1));
    } catch (_) {}
  }
  var lastSubmitted = '', lastNoResults = '';
  var modal = null, input = null, list = null, footerCount = null, footerHint = null, opened = false;

  var GROUPS = [
    { slug: 'product',   label: 'Products' },
    { slug: 'service',   label: 'Services' },
    { slug: 'solution',  label: 'Solutions' },
    { slug: 'tech',      label: 'Technologies' },
    { slug: 'industry',  label: 'Industries' },
    { slug: 'timeline',  label: 'Timelines' },
    { slug: 'ref',       label: 'References' },
    { slug: 'tool',      label: 'Tools' },
    { slug: 'blog',      label: 'Blog' },
    { slug: 'archive',   label: 'Archive' },
    { slug: 'category',  label: 'Categories' },
    { slug: 'tag',       label: 'Tags' },
    { slug: 'case',      label: 'Case studies' },
    { slug: 'video',     label: 'Videos' },
    { slug: 'brochure',  label: 'Brochures' },
    { slug: 'engage',    label: 'Engagement' },
    { slug: 'about',     label: 'Company' },
    { slug: 'res',       label: 'Resources' },
    { slug: 'partners',  label: 'Partners' },
    { slug: 'support',   label: 'Support' },
    { slug: 'contact',   label: 'Contact' },
    { slug: 'trust',     label: 'Trust' },
    { slug: 'privacy',   label: 'Privacy' },
    { slug: 'page',      label: 'Other' },
  ];

  function loadIndex() {
    if (indexPromise) return indexPromise;
    indexPromise = fetch(INDEX_URL, { credentials: 'same-origin' })
      .then(function (r) { return r.json(); })
      .then(function (j) { return j.pages || []; })
      .catch(function () { return []; });
    return indexPromise;
  }

  function searchIconSVG() {
    return '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>';
  }
  function arrowIconSVG() {
    return '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>';
  }

  function ensureModal() {
    if (modal) return modal;
    modal = document.createElement('div');
    modal.className = 'as-search';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Site search');
    modal.innerHTML =
      '<div class="as-search-backdrop" data-close="1"></div>' +
      '<div class="as-search-panel" role="combobox" aria-expanded="true" aria-haspopup="listbox" aria-owns="as-search-list">' +
      '  <div class="as-search-input-row">' +
      '    <span class="as-search-input-icon" aria-hidden="true">' + searchIconSVG() + '</span>' +
      '    <input class="as-search-input" type="search" placeholder="Search AmbiSecure…" autocomplete="off" spellcheck="false" autocorrect="off" autocapitalize="off" aria-label="Search the site" aria-controls="as-search-list" />' +
      '    <kbd class="as-search-kbd" aria-hidden="true">esc</kbd>' +
      '  </div>' +
      '  <div class="as-search-results" id="as-search-list" role="listbox" tabindex="-1"></div>' +
      '  <div class="as-search-footer">' +
      '    <div class="as-search-hints">' +
      '      <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>' +
      '      <span><kbd>↵</kbd> open</span>' +
      '      <span><kbd>esc</kbd> close</span>' +
      '    </div>' +
      '    <div class="as-search-count" aria-live="polite"></div>' +
      '  </div>' +
      '</div>';
    document.body.appendChild(modal);
    input = modal.querySelector('.as-search-input');
    list = modal.querySelector('.as-search-results');
    footerCount = modal.querySelector('.as-search-count');
    modal.addEventListener('mousedown', function (e) {
      if (e.target.dataset && e.target.dataset.close === '1') closeModal();
    });
    input.addEventListener('input', onQuery);
    input.addEventListener('keydown', onKey);
    list.addEventListener('mouseover', function (e) {
      var li = e.target.closest('.as-search-item');
      if (li) setActive(li);
    });
    list.addEventListener('click', function (e) {
      var li = e.target.closest('.as-search-item');
      if (!li) return;
      var url = li.dataset.url;
      if (url) { e.preventDefault(); track('search_result_clicked', 1); window.location.href = url; }
    });
    return modal;
  }

  function openModal() {
    ensureModal();
    if (opened) return;
    opened = true;
    document.body.classList.add('as-search-open');
    modal.classList.add('is-open');
    setTimeout(function () { input.focus(); }, 30);
    loadIndex().then(function () { renderResults(''); });
  }

  function closeModal() {
    if (!opened) return;
    opened = false;
    document.body.classList.remove('as-search-open');
    if (modal) modal.classList.remove('is-open');
  }

  function normalize(s) {
    return (s || '').toLowerCase()
      .replace(/[—–]/g, '-')
      .replace(/[^\w\s\-.\/#+]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function score(p, q) {
    if (!q) return 1;
    var t = p._t || (p._t = normalize(p.t));
    var d = p._d || (p._d = normalize(p.d));
    var e = p._e || (p._e = normalize(p.e));
    var u = p._u || (p._u = normalize(p.u));
    var k = p._k || (p._k = normalize((p.k || []).join(' ')));
    var x = p._x || (p._x = normalize(p.x));
    var s = 0;
    var tokens = q.split(' ').filter(Boolean);
    for (var i = 0; i < tokens.length; i++) {
      var tok = tokens[i];
      if (!tok) continue;
      if (t.indexOf(tok) === 0) s += 60;
      else if (t.indexOf(' ' + tok) > -1) s += 28;
      else if (t.indexOf(tok) > -1) s += 14;
      if (e === tok) s += 22;
      else if (e.indexOf(tok) > -1) s += 8;
      if (k.indexOf(tok) > -1) s += 16;
      if (u.indexOf(tok) > -1) s += 5;
      if (d.indexOf(tok) > -1) s += 4;
      if (x.indexOf(tok) > -1) s += 3;
      if (s === 0) {
        var words = t.split(' ');
        for (var w = 0; w < words.length; w++) {
          if (words[w].length > 3 && tok.length > 3 && words[w].indexOf(tok.slice(0, 4)) === 0) {
            s += 4; break;
          }
        }
      }
    }
    return s;
  }

  function highlight(text, q) {
    if (!q) return escapeHTML(text);
    var tokens = q.split(' ').filter(Boolean);
    if (!tokens.length) return escapeHTML(text);
    var safe = escapeHTML(text);
    tokens.forEach(function (tok) {
      if (tok.length < 2) return;
      var re = new RegExp('(' + tok.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
      safe = safe.replace(re, '<mark>$1</mark>');
    });
    return safe;
  }

  function groupRanked(ranked) {
    var byGroup = {};
    ranked.forEach(function (r) {
      var s = r.p.s;
      if (!byGroup[s]) byGroup[s] = [];
      byGroup[s].push(r);
    });
    var out = [];
    for (var i = 0; i < GROUPS.length; i++) {
      var g = GROUPS[i];
      if (byGroup[g.slug]) {
        out.push({ group: g, results: byGroup[g.slug] });
        delete byGroup[g.slug];
      }
    }
    Object.keys(byGroup).forEach(function (slug) {
      out.push({ group: { slug: slug, label: slug }, results: byGroup[slug] });
    });
    return out;
  }

  function renderResults(q) {
    var nq = normalize(q);
    loadIndex().then(function (pages) {
      var ranked = [];
      if (!nq) {
        ranked = pages.slice(0, 16).map(function (p) { return { p: p, s: 1 }; });
      } else {
        if (nq.length >= 2 && nq !== lastSubmitted) { lastSubmitted = nq; track('search_submitted', nq.length); }
        for (var i = 0; i < pages.length; i++) {
          var v = score(pages[i], nq);
          if (v > 0) ranked.push({ p: pages[i], s: v });
        }
        ranked.sort(function (a, b) { return b.s - a.s; });
        ranked = ranked.slice(0, 32);
      }

      list.innerHTML = '';
      if (ranked.length === 0) {
        if (nq !== lastNoResults) { lastNoResults = nq; track('search_no_results', nq.length); }
        list.innerHTML = '<div class="as-search-empty"><strong>No matches.</strong><span>Try a standard (FIDO, PIV, ASN.1, ICAO) or a tool (APDU parser, X.509 viewer, CBOR).</span></div>';
        footerCount.textContent = '';
        return;
      }

      var groups = groupRanked(ranked);
      var idx = 0;
      groups.forEach(function (g) {
        var header = document.createElement('div');
        header.className = 'as-search-group';
        header.textContent = g.group.label;
        list.appendChild(header);
        g.results.forEach(function (r) {
          var li = document.createElement('a');
          li.className = 'as-search-item';
          li.setAttribute('role', 'option');
          li.setAttribute('href', r.p.u);
          li.dataset.url = r.p.u;
          if (idx === 0) li.classList.add('is-active');
          idx++;
          var titleH = highlight(r.p.t, nq);
          var descH = r.p.d ? '<div class="as-item-desc">' + highlight(r.p.d, nq) + '</div>' : '';
          li.innerHTML =
            '<div class="as-item-main">' +
            '  <div class="as-item-title">' + titleH + '</div>' +
            descH +
            '  <div class="as-item-url">' + escapeHTML(r.p.u) + '</div>' +
            '</div>' +
            '<span class="as-item-arrow" aria-hidden="true">' + arrowIconSVG() + '</span>';
          list.appendChild(li);
        });
      });

      var n = ranked.length;
      footerCount.textContent = nq
        ? n + ' result' + (n === 1 ? '' : 's')
        : 'Top entries · type to filter';
    });
  }

  function onQuery() { renderResults(input.value); }

  function activeItem() { return list.querySelector('.as-search-item.is-active'); }
  function allItems() { return list.querySelectorAll('.as-search-item'); }
  function setActive(item) {
    var prev = activeItem();
    if (prev) prev.classList.remove('is-active');
    if (item) {
      item.classList.add('is-active');
      if (item.scrollIntoView) item.scrollIntoView({ block: 'nearest' });
    }
  }
  function nextItem(dir) {
    var items = allItems();
    if (!items.length) return null;
    var cur = activeItem();
    var idx = -1;
    for (var i = 0; i < items.length; i++) if (items[i] === cur) { idx = i; break; }
    idx = (idx + dir + items.length) % items.length;
    return items[idx];
  }

  function onKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); closeModal(); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(nextItem(+1)); return; }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActive(nextItem(-1)); return; }
    if (e.key === 'Enter') {
      var a = activeItem();
      if (a && a.dataset.url) { e.preventDefault(); window.location.href = a.dataset.url; }
    }
  }

  function escapeHTML(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function bindGlobalShortcut() {
    document.addEventListener('keydown', function (e) {
      var mod = e.metaKey || e.ctrlKey;
      if (mod && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        if (opened) closeModal(); else openModal();
      }
      if (e.key === '/' && !opened) {
        var t = e.target;
        var tag = t && t.tagName;
        if (tag !== 'INPUT' && tag !== 'TEXTAREA' && (!t || !t.isContentEditable)) {
          e.preventDefault();
          openModal();
        }
      }
    });
  }

  function bindTriggers() {
    document.addEventListener('click', function (e) {
      var t = e.target;
      while (t && t !== document.body) {
        if (t.classList && t.classList.contains('as-search-trigger')) {
          e.preventDefault();
          openModal();
          return;
        }
        t = t.parentNode;
      }
    });
  }

  function checkUrlQuery() {
    try {
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q) {
        openModal();
        ensureModal();
        if (input) {
          input.value = q;
          renderResults(q);
        }
      }
    } catch (_) {}
  }

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else { fn(); }
  }

  ready(function () {
    bindGlobalShortcut();
    bindTriggers();
    checkUrlQuery();
  });

  window.AS_SEARCH = { open: openModal, close: closeModal };
})();
