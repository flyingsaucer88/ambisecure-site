(function () {
  'use strict';

  var INDEX_URL = '/assets/data/search-index.json';
  var indexPromise = null;
  var modal = null, input = null, list = null, hint = null, opened = false;

  function loadIndex() {
    if (indexPromise) return indexPromise;
    indexPromise = fetch(INDEX_URL, { credentials: 'same-origin' })
      .then(function (r) { return r.json(); })
      .then(function (j) { return j.pages || []; })
      .catch(function () { return []; });
    return indexPromise;
  }

  function ensureModal() {
    if (modal) return modal;
    modal = document.createElement('div');
    modal.className = 'as-search-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Site search');
    modal.innerHTML =
      '<div class="as-search-backdrop" data-close="1"></div>' +
      '<div class="as-search-panel">' +
      '  <div class="as-search-row">' +
      '    <span class="as-search-icon" aria-hidden="true">' + searchIconSVG() + '</span>' +
      '    <input class="as-search-input" type="search" placeholder="Search products, references, blogs, timelines…" autocomplete="off" spellcheck="false" aria-label="Search the site" />' +
      '    <kbd class="as-search-kbd" aria-hidden="true">esc</kbd>' +
      '  </div>' +
      '  <ul class="as-search-results" role="listbox" aria-label="Search results"></ul>' +
      '  <div class="as-search-hint">' +
      '    <span>↑ ↓ to move &middot; ↵ to open &middot; esc to close</span>' +
      '    <span class="as-search-count"></span>' +
      '  </div>' +
      '</div>';
    document.body.appendChild(modal);
    input = modal.querySelector('.as-search-input');
    list = modal.querySelector('.as-search-results');
    hint = modal.querySelector('.as-search-count');
    modal.addEventListener('click', function (e) {
      if (e.target.dataset.close === '1') closeModal();
    });
    input.addEventListener('input', onQuery);
    input.addEventListener('keydown', onKey);
    return modal;
  }

  function searchIconSVG() {
    return '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>';
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
    if (input) input.value = '';
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
    var s = 0;
    var tokens = q.split(' ').filter(Boolean);
    for (var i = 0; i < tokens.length; i++) {
      var tok = tokens[i];
      if (!tok) continue;
      if (t.indexOf(tok) === 0) s += 50;
      else if (t.indexOf(' ' + tok) > -1) s += 20;
      else if (t.indexOf(tok) > -1) s += 12;
      if (e === tok) s += 18;
      else if (e.indexOf(tok) > -1) s += 6;
      if (u.indexOf(tok) > -1) s += 4;
      if (d.indexOf(tok) > -1) s += 3;
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

  function renderResults(q) {
    q = normalize(q);
    loadIndex().then(function (pages) {
      var ranked = [];
      if (!q) {
        ranked = pages.slice(0, 12).map(function (p) { return { p: p, s: 1 }; });
      } else {
        for (var i = 0; i < pages.length; i++) {
          var v = score(pages[i], q);
          if (v > 0) ranked.push({ p: pages[i], s: v });
        }
        ranked.sort(function (a, b) { return b.s - a.s; });
        ranked = ranked.slice(0, 24);
      }
      list.innerHTML = '';
      if (ranked.length === 0) {
        list.innerHTML = '<li class="as-search-empty">No matches. Try a standards name (FIDO, PIV, ASN.1) or a tool name (APDU, X.509, CBOR).</li>';
        hint.textContent = '';
        return;
      }
      ranked.forEach(function (r, i) {
        var li = document.createElement('li');
        li.className = 'as-search-result';
        li.setAttribute('role', 'option');
        if (i === 0) li.classList.add('is-active');
        li.dataset.url = r.p.u;
        var typeBadge = '<span class="as-search-badge as-badge-' + r.p.s + '">' + escapeHTML(r.p.l) + '</span>';
        var desc = r.p.d ? '<div class="as-search-desc">' + escapeHTML(r.p.d) + '</div>' : '';
        li.innerHTML =
          '<a href="' + escapeAttr(r.p.u) + '" class="as-search-link">' +
          '  <div class="as-search-line">' + typeBadge + '<span class="as-search-title">' + escapeHTML(r.p.t) + '</span></div>' +
          desc +
          '  <span class="as-search-url">' + escapeHTML(r.p.u) + '</span>' +
          '</a>';
        list.appendChild(li);
      });
      hint.textContent = q ? (ranked.length + ' match' + (ranked.length === 1 ? '' : 'es')) : 'Showing top entries';
    });
  }

  function onQuery() {
    renderResults(input.value);
  }

  function activeItem() {
    return list.querySelector('.as-search-result.is-active');
  }
  function setActive(item) {
    var prev = activeItem();
    if (prev) prev.classList.remove('is-active');
    if (item) item.classList.add('is-active');
    if (item && item.scrollIntoView) item.scrollIntoView({ block: 'nearest' });
  }
  function onKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); closeModal(); return; }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      var a = activeItem();
      var next = a && a.nextElementSibling;
      if (next) setActive(next);
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      var a2 = activeItem();
      var prev = a2 && a2.previousElementSibling;
      if (prev) setActive(prev);
      return;
    }
    if (e.key === 'Enter') {
      var a3 = activeItem();
      if (a3) {
        var url = a3.dataset.url;
        if (url) {
          e.preventDefault();
          window.location.href = url;
        }
      }
    }
  }

  function escapeHTML(s) {
    return String(s || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function escapeAttr(s) { return escapeHTML(s); }

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

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else { fn(); }
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

  ready(function () {
    bindGlobalShortcut();
    bindTriggers();
    checkUrlQuery();
  });

  window.AS_SEARCH = { open: openModal, close: closeModal };
})();
