/* AmbiSecure — Searchable reference page renderer.
   Each reference page declares window.AS_REF = { columns, rows, slug, idCol }.
   This file installs the search box, optional category filter, copy buttons,
   anchor-link deep-linking, and the table rendering. */
(function () {
  'use strict';

  function init() {
    var def = window.AS_REF;
    if (!def) return;
    var search = document.getElementById('ref-search');
    var output = document.getElementById('ref-output');
    var countEl = document.getElementById('ref-count');
    var tagFilter = document.getElementById('ref-tag-filter');
    if (!search || !output) return;

    var allTags = [];
    if (def.rows[0] && def.rows[0].tag) {
      var tagSet = {};
      def.rows.forEach(function (r) { if (r.tag) tagSet[r.tag] = true; });
      allTags = Object.keys(tagSet).sort();
    }
    var activeTag = 'all';

    function buildTagFilter() {
      if (!tagFilter || allTags.length === 0) return;
      var html = '<button class="active" data-tag="all">All</button>';
      allTags.forEach(function (t) {
        html += '<button data-tag="' + t.replace(/"/g, '&quot;') + '">' + t + '</button>';
      });
      tagFilter.innerHTML = html;
      tagFilter.querySelectorAll('button').forEach(function (b) {
        b.addEventListener('click', function () {
          activeTag = b.dataset.tag;
          tagFilter.querySelectorAll('button').forEach(function (x) { x.classList.toggle('active', x.dataset.tag === activeTag); });
          render();
        });
      });
    }

    function escape(s) {
      if (s == null) return '';
      return String(s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function highlight(text, q) {
      if (!q) return escape(text);
      var idx = String(text).toLowerCase().indexOf(q.toLowerCase());
      if (idx < 0) return escape(text);
      var s = String(text);
      return escape(s.slice(0, idx)) +
        '<mark style="background:#fff4a3;color:var(--ink);padding:0 2px;border-radius:2px;">' + escape(s.slice(idx, idx + q.length)) + '</mark>' +
        escape(s.slice(idx + q.length));
    }

    function render() {
      var q = (search.value || '').trim().toLowerCase();
      var filtered = def.rows.filter(function (r) {
        if (activeTag !== 'all' && r.tag !== activeTag) return false;
        if (!q) return true;
        return def.columns.some(function (c) {
          var v = r[c.field];
          return v != null && String(v).toLowerCase().indexOf(q) !== -1;
        });
      });
      if (countEl) countEl.textContent = filtered.length + ' / ' + def.rows.length + ' entries';

      if (filtered.length === 0) {
        output.innerHTML = '<div class="ref-empty">No entries match.</div>';
        return;
      }
      var thead = '<thead><tr>' +
        def.columns.map(function (c) {
          return '<th' + (c.width ? ' style="width:' + c.width + ';"' : '') + '>' + escape(c.label) + '</th>';
        }).join('') +
        '</tr></thead>';
      var anchor = '';
      try { anchor = (location.hash || '').replace(/^#/, ''); } catch (e) {}
      var tbody = '<tbody>' + filtered.map(function (r, i) {
        var id = def.idCol ? String(r[def.idCol]).toLowerCase().replace(/[^a-z0-9_]/g, '-') : ('r-' + i);
        var trCls = (anchor && anchor === id) ? ' class="ref-row-anchored"' : '';
        return '<tr id="' + id + '"' + trCls + '>' +
          def.columns.map(function (c, ci) {
            var raw = r[c.field];
            var cellText = raw == null ? '' : (c.formatter ? c.formatter(raw, r) : highlight(raw, q));
            var cellCls = c.cls || '';
            var copy = '';
            if (ci === 0 && def.idCol) {
              copy = ' <a href="#' + id + '" class="ref-anchor-link" title="Anchor link">#</a>';
            }
            return '<td' + (cellCls ? ' class="' + cellCls + '"' : '') + '>' + cellText + copy + '</td>';
          }).join('') +
          '</tr>';
      }).join('') + '</tbody>';
      output.innerHTML = '<table class="ref-table">' + thead + tbody + '</table>';
    }

    search.addEventListener('input', render);
    buildTagFilter();
    render();

    // Auto-scroll to anchored row
    try {
      var anchor = (location.hash || '').replace(/^#/, '');
      if (anchor) setTimeout(function () {
        var el = document.getElementById(anchor);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } catch (e) {}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
