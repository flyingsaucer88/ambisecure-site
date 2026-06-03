/* JSON Bin Builder and Validator — fully client-side.
 *
 * Validate / format / minify / copy JSON, plus a local-only bin manager
 * (save / open / duplicate / delete / clear-all) backed by localStorage,
 * an optional JSON-Schema-subset validator, and starter-schema generation.
 *
 * Nothing is uploaded. No network calls. No JSON is sent to analytics.
 * Storage key is namespaced: ambisecure:json-bins:v1
 */
(function () {
  'use strict';

  var AS = window.AS || {};
  var $ = AS.$ || function (id) { return document.getElementById(id); };
  var escHTML = AS.escHTML || function (s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  };

  var STORE_KEY = 'ambisecure:json-bins:v1';

  // ---- elements ----------------------------------------------------------
  var input = $('jbb-input'), output = $('jbb-output');
  var statusBox = $('jbb-status'), meta = {
    chars: $('jbb-count-chars'), bytes: $('jbb-count-bytes'), status: $('jbb-count-status')
  };
  var indentSel = $('jbb-indent');
  var schemaIn = $('jbb-schema'), schemaOut = $('jbb-schema-output');
  var binName = $('jbb-bin-name'), binList = $('jbb-bin-list');
  var shareWrap = $('jbb-share'), shareLink = $('jbb-share-link');

  var activeId = null; // id of the currently-open local bin, if any

  // ---- byte / char counts ------------------------------------------------
  function byteLen(s) {
    if (window.TextEncoder) { try { return new TextEncoder().encode(s).length; } catch (e) {} }
    return unescape(encodeURIComponent(s)).length; // UTF-8 fallback
  }
  function setStatus(kind, label, detailHTML) {
    var cls = 'tech-badge--info';
    if (kind === 'ok') cls = 'tech-badge--ok';
    else if (kind === 'err') cls = 'tech-badge--err';
    else if (kind === 'warn') cls = 'tech-badge--warn';
    statusBox.innerHTML = '<span class="tech-badge ' + cls + '">' + escHTML(label) + '</span>' +
      (detailHTML ? ' <span class="jbb-errpos">' + detailHTML + '</span>' : '');
  }
  function updateCounts() {
    var v = input.value;
    meta.chars.textContent = v.length.toLocaleString() + ' chars';
    meta.bytes.textContent = byteLen(v).toLocaleString() + ' bytes (UTF-8)';
    if (!v.trim()) { meta.status.textContent = 'Empty'; setStatus('info', 'READY'); return; }
    var r = parse(v);
    if (r.ok) { meta.status.textContent = 'Valid JSON'; setStatus('ok', 'VALID JSON'); }
    else { meta.status.textContent = 'Invalid'; setStatus('err', 'INVALID', errLabel(r)); }
  }

  // ---- parse with line/column -------------------------------------------
  function lineColFromPos(text, pos) {
    if (pos == null || pos < 0) return null;
    var line = 1, col = 1;
    for (var i = 0; i < pos && i < text.length; i++) {
      if (text[i] === '\n') { line++; col = 1; } else { col++; }
    }
    return { line: line, col: col };
  }
  function parse(text) {
    try { return { ok: true, value: JSON.parse(text) }; }
    catch (e) {
      var msg = e && e.message ? e.message : 'Invalid JSON';
      var pos = null, m = /position (\d+)/i.exec(msg);
      if (m) pos = parseInt(m[1], 10);
      var lc = pos != null ? lineColFromPos(text, pos) : null;
      // Some engines already include line/column in the message.
      if (!lc) { var m2 = /line (\d+) column (\d+)/i.exec(msg); if (m2) lc = { line: +m2[1], col: +m2[2] }; }
      return { ok: false, message: msg, pos: pos, lc: lc };
    }
  }
  function errLabel(r) {
    if (r.lc) return 'line ' + r.lc.line + ', column ' + r.lc.col;
    return escHTML(r.message);
  }
  function errFull(r) {
    var where = r.lc ? ' (line ' + r.lc.line + ', column ' + r.lc.col + ')' : '';
    return escHTML(r.message) + where;
  }

  // ---- format / minify ---------------------------------------------------
  function indentValue() {
    var v = indentSel ? indentSel.value : '2';
    return v === 'tab' ? '\t' : parseInt(v, 10);
  }
  function doFormat() {
    var r = parse(input.value);
    if (!r.ok) { output.value = ''; setStatus('err', 'INVALID', errFull(r)); return; }
    output.value = JSON.stringify(r.value, null, indentValue());
    setStatus('ok', 'FORMATTED');
  }
  function doMinify() {
    var r = parse(input.value);
    if (!r.ok) { output.value = ''; setStatus('err', 'INVALID', errFull(r)); return; }
    var min = JSON.stringify(r.value);
    output.value = min;
    setStatus('ok', 'MINIFIED', escHTML(byteLen(min).toLocaleString() + ' bytes'));
  }

  // ---- copy / clear ------------------------------------------------------
  function copyText(text, btn) {
    if (!text) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        var prev = btn.textContent; btn.textContent = 'Copied'; setTimeout(function () { btn.textContent = prev; }, 1200);
      }, function () {});
    }
  }

  // ===== JSON Schema subset validator =====================================
  function typeOf(v) {
    if (v === null) return 'null';
    if (Array.isArray(v)) return 'array';
    if (typeof v === 'number') return Number.isInteger(v) ? 'integer' : 'number';
    return typeof v; // string | boolean | object
  }
  function typeMatches(want, actual) {
    if (want === 'number') return actual === 'number' || actual === 'integer';
    return want === actual;
  }
  function validate(schema, data, path, errors) {
    if (schema == null || typeof schema !== 'object') return;
    var at = path || '$';

    if (schema.type) {
      var types = Array.isArray(schema.type) ? schema.type : [schema.type];
      var actual = typeOf(data);
      if (!types.some(function (t) { return typeMatches(t, actual); })) {
        errors.push(at + ': expected type ' + types.join(' | ') + ', got ' + actual);
        return; // type mismatch — further keyword checks are noise
      }
    }
    if (schema.enum && Array.isArray(schema.enum)) {
      var ok = schema.enum.some(function (e) { return deepEqual(e, data); });
      if (!ok) errors.push(at + ': value not in enum');
    }
    if (Object.prototype.hasOwnProperty.call(schema, 'const')) {
      if (!deepEqual(schema.const, data)) errors.push(at + ': value !== const');
    }

    var t = typeOf(data);
    if (t === 'string') {
      if (schema.minLength != null && data.length < schema.minLength) errors.push(at + ': shorter than minLength ' + schema.minLength);
      if (schema.maxLength != null && data.length > schema.maxLength) errors.push(at + ': longer than maxLength ' + schema.maxLength);
      if (schema.pattern) { try { if (!new RegExp(schema.pattern).test(data)) errors.push(at + ': does not match pattern'); } catch (e) { errors.push(at + ': invalid pattern in schema'); } }
    }
    if (t === 'number' || t === 'integer') {
      if (schema.minimum != null && data < schema.minimum) errors.push(at + ': below minimum ' + schema.minimum);
      if (schema.maximum != null && data > schema.maximum) errors.push(at + ': above maximum ' + schema.maximum);
      if (schema.exclusiveMinimum != null && data <= schema.exclusiveMinimum) errors.push(at + ': <= exclusiveMinimum');
      if (schema.exclusiveMaximum != null && data >= schema.exclusiveMaximum) errors.push(at + ': >= exclusiveMaximum');
    }
    if (t === 'array') {
      if (schema.minItems != null && data.length < schema.minItems) errors.push(at + ': fewer than minItems ' + schema.minItems);
      if (schema.maxItems != null && data.length > schema.maxItems) errors.push(at + ': more than maxItems ' + schema.maxItems);
      if (schema.items) {
        if (Array.isArray(schema.items)) {
          for (var i = 0; i < schema.items.length && i < data.length; i++) validate(schema.items[i], data[i], at + '[' + i + ']', errors);
        } else {
          for (var j = 0; j < data.length; j++) validate(schema.items, data[j], at + '[' + j + ']', errors);
        }
      }
    }
    if (t === 'object') {
      if (Array.isArray(schema.required)) {
        schema.required.forEach(function (k) {
          if (!Object.prototype.hasOwnProperty.call(data, k)) errors.push(at + ': missing required property "' + k + '"');
        });
      }
      var props = schema.properties || {};
      Object.keys(props).forEach(function (k) {
        if (Object.prototype.hasOwnProperty.call(data, k)) validate(props[k], data[k], at + '.' + k, errors);
      });
      if (schema.additionalProperties === false) {
        Object.keys(data).forEach(function (k) {
          if (!Object.prototype.hasOwnProperty.call(props, k)) errors.push(at + ': additional property "' + k + '" not allowed');
        });
      }
    }

    ['allOf', 'anyOf', 'oneOf'].forEach(function (key) {
      if (!Array.isArray(schema[key])) return;
      var passes = schema[key].map(function (sub) { var e = []; validate(sub, data, at, e); return e.length === 0; });
      var n = passes.filter(Boolean).length;
      if (key === 'allOf' && n !== passes.length) errors.push(at + ': failed allOf');
      if (key === 'anyOf' && n === 0) errors.push(at + ': failed anyOf (matched none)');
      if (key === 'oneOf' && n !== 1) errors.push(at + ': failed oneOf (matched ' + n + ', expected exactly 1)');
    });
  }
  function deepEqual(a, b) {
    if (a === b) return true;
    if (typeOf(a) !== typeOf(b)) return false;
    if (Array.isArray(a)) { if (a.length !== b.length) return false; return a.every(function (x, i) { return deepEqual(x, b[i]); }); }
    if (a && typeof a === 'object') {
      var ka = Object.keys(a), kb = Object.keys(b);
      if (ka.length !== kb.length) return false;
      return ka.every(function (k) { return deepEqual(a[k], b[k]); });
    }
    return false;
  }

  function runSchemaValidation() {
    var dj = parse(input.value);
    if (!dj.ok) { renderSchema('err', 'JSON is invalid', ['Fix the JSON above first &mdash; ' + errFull(dj)]); return; }
    var sj = parse(schemaIn.value);
    if (!schemaIn.value.trim()) { renderSchema('warn', 'No schema', ['Paste a JSON Schema, or generate one from your JSON.']); return; }
    if (!sj.ok) { renderSchema('err', 'Schema is invalid JSON', [errFull(sj)]); return; }
    var errors = [];
    try { validate(sj.value, dj.value, '$', errors); }
    catch (e) { renderSchema('err', 'Validation error', [escHTML(String(e && e.message || e))]); return; }
    if (errors.length === 0) renderSchema('ok', 'Valid against schema', []);
    else renderSchema('err', errors.length + ' schema error' + (errors.length === 1 ? '' : 's'), errors.map(escHTML));
  }
  function renderSchema(kind, label, lines) {
    var cls = kind === 'ok' ? 'tech-badge--ok' : kind === 'err' ? 'tech-badge--err' : kind === 'warn' ? 'tech-badge--warn' : 'tech-badge--info';
    var html = '<div style="margin-bottom:10px;"><span class="tech-badge ' + cls + '">' + escHTML(label) + '</span></div>';
    if (lines && lines.length) {
      html += '<div>' + lines.map(function (l) { return '<div class="parsed-row"><span class="value">' + l + '</span></div>'; }).join('') + '</div>';
    }
    schemaOut.innerHTML = html;
  }

  // ---- schema generation from a sample -----------------------------------
  function inferSchema(v) {
    var t = typeOf(v);
    if (t === 'object') {
      var props = {}, req = [];
      Object.keys(v).forEach(function (k) { props[k] = inferSchema(v[k]); req.push(k); });
      var s = { type: 'object', properties: props };
      if (req.length) s.required = req;
      return s;
    }
    if (t === 'array') {
      if (v.length === 0) return { type: 'array', items: {} };
      // Merge item schemas shallowly: if homogeneous primitive, single items schema.
      var first = inferSchema(v[0]);
      return { type: 'array', items: first };
    }
    if (t === 'integer') return { type: 'integer' };
    if (t === 'number') return { type: 'number' };
    if (t === 'null') return { type: 'null' };
    return { type: t }; // string | boolean
  }
  function generateSchema() {
    var dj = parse(input.value);
    if (!dj.ok) { renderSchema('err', 'JSON is invalid', ['Fix the JSON above first &mdash; ' + errFull(dj)]); return; }
    var schema = { '$schema': 'http://json-schema.org/draft-07/schema#' };
    var inferred = inferSchema(dj.value);
    Object.keys(inferred).forEach(function (k) { schema[k] = inferred[k]; });
    schemaIn.value = JSON.stringify(schema, null, indentValue());
    renderSchema('info', 'Starter schema generated', ['Generated from your JSON sample. Review and tighten it (formats, ranges, required) before relying on it.']);
  }

  // ===== local bins (localStorage) ========================================
  function uid() {
    if (window.crypto && crypto.getRandomValues) {
      var a = new Uint8Array(8); crypto.getRandomValues(a);
      return Array.prototype.map.call(a, function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
    }
    return 'b' + new Date().getTime().toString(36) + Math.floor(Math.random() * 1e6).toString(36);
  }
  function loadStore() {
    var raw = null;
    try { raw = localStorage.getItem(STORE_KEY); } catch (e) { return { v: 1, bins: [], blocked: true }; }
    if (!raw) return { v: 1, bins: [] };
    try {
      var d = JSON.parse(raw);
      if (!d || !Array.isArray(d.bins)) return { v: 1, bins: [] };
      return d;
    } catch (e) { return { v: 1, bins: [] }; }
  }
  function saveStore(store) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); return { ok: true }; }
    catch (e) {
      var quota = e && (e.name === 'QuotaExceededError' || e.code === 22 || e.code === 1014);
      return { ok: false, quota: quota, message: e && e.message };
    }
  }
  function nowISO() { return new Date().toISOString(); }

  function saveCurrent() {
    var name = (binName.value || '').trim();
    if (!name) { binName.focus(); flashStatus('Name your bin before saving.'); return; }
    if (!input.value.trim()) { flashStatus('Nothing to save — the JSON is empty.'); return; }
    var store = loadStore();
    if (store.blocked) { flashStatus('Local storage is unavailable (private mode?).'); return; }
    var existing = store.bins.filter(function (b) { return b.name === name; })[0];
    if (existing) { existing.json = input.value; existing.updated = nowISO(); activeId = existing.id; }
    else {
      var id = uid();
      store.bins.push({ id: id, name: name, json: input.value, created: nowISO(), updated: nowISO() });
      activeId = id;
    }
    var res = saveStore(store);
    if (!res.ok) { flashStatus(res.quota ? 'Storage is full — delete some bins and retry.' : 'Could not save to local storage.'); return; }
    renderBins(); updateShare();
    flashStatus('Saved "' + name + '" locally.');
  }
  function openBin(id) {
    var b = loadStore().bins.filter(function (x) { return x.id === id; })[0];
    if (!b) return;
    input.value = b.json; binName.value = b.name; activeId = id;
    updateCounts(); output.value = ''; setStatus('info', 'OPENED', escHTML(b.name));
    renderBins(); updateShare();
  }
  function duplicateBin(id) {
    var store = loadStore();
    var b = store.bins.filter(function (x) { return x.id === id; })[0];
    if (!b) return;
    var base = b.name + ' copy', name = base, n = 2;
    while (store.bins.some(function (x) { return x.name === name; })) { name = base + ' ' + (n++); }
    var nid = uid();
    store.bins.push({ id: nid, name: name, json: b.json, created: nowISO(), updated: nowISO() });
    var res = saveStore(store);
    if (!res.ok) { flashStatus(res.quota ? 'Storage is full — delete some bins and retry.' : 'Could not save to local storage.'); return; }
    activeId = nid; renderBins(); flashStatus('Duplicated as "' + name + '".');
  }
  function deleteBin(id) {
    var store = loadStore();
    var b = store.bins.filter(function (x) { return x.id === id; })[0];
    if (!b) return;
    if (!window.confirm('Delete local bin "' + b.name + '"? This cannot be undone.')) return;
    store.bins = store.bins.filter(function (x) { return x.id !== id; });
    saveStore(store);
    if (activeId === id) { activeId = null; }
    renderBins(); updateShare();
  }
  function clearAll() {
    var store = loadStore();
    if (!store.bins.length) { flashStatus('No local bins to clear.'); return; }
    if (!window.confirm('Delete ALL ' + store.bins.length + ' local bin(s) in this browser? This cannot be undone.')) return;
    try { localStorage.removeItem(STORE_KEY); } catch (e) {}
    activeId = null; renderBins(); updateShare();
    flashStatus('All local bins cleared.');
  }
  function flashStatus(msg) { setStatus('info', 'NOTE', escHTML(msg)); }

  function renderBins() {
    var store = loadStore();
    if (store.blocked) { binList.innerHTML = '<li class="jbb-bin-empty">Local storage is unavailable in this browser.</li>'; return; }
    if (!store.bins.length) { binList.innerHTML = '<li class="jbb-bin-empty">No saved bins yet.</li>'; return; }
    var rows = store.bins.slice().sort(function (a, b) { return (b.updated || '').localeCompare(a.updated || ''); }).map(function (b) {
      var size = byteLen(b.json || '');
      return '<li class="jbb-bin-row' + (b.id === activeId ? ' is-active' : '') + '" data-id="' + escHTML(b.id) + '">' +
        '<span class="jbb-bin-name">' + escHTML(b.name) + '</span>' +
        '<span class="jbb-bin-meta">' + size.toLocaleString() + ' B</span>' +
        '<span class="jbb-bin-spacer"></span>' +
        '<button class="tool-action" type="button" data-act="open" data-id="' + escHTML(b.id) + '">Open</button>' +
        '<button class="tool-action" type="button" data-act="dup" data-id="' + escHTML(b.id) + '">Duplicate</button>' +
        '<button class="tool-action" type="button" data-act="del" data-id="' + escHTML(b.id) + '">Delete</button>' +
        '</li>';
    }).join('');
    binList.innerHTML = rows;
  }

  // ---- local reopen link (hash + local id; not a public URL) -------------
  function updateShare() {
    if (!activeId) { shareWrap.hidden = true; return; }
    var url = location.origin + location.pathname + '#bin=' + activeId;
    shareLink.textContent = url;
    shareWrap.hidden = false;
  }
  function openFromHash() {
    var m = /[#&]bin=([a-zA-Z0-9]+)/.exec(location.hash || '');
    if (!m) return;
    var id = m[1];
    if (loadStore().bins.some(function (b) { return b.id === id; })) openBin(id);
  }

  // ---- sample ------------------------------------------------------------
  var SAMPLE = {
    name: 'AmbiSecure demo payload',
    version: 1,
    active: true,
    tags: ['fido2', 'javacard', 'iot'],
    limits: { maxBins: 50, maxBytes: 1048576 },
    note: 'Local-only. Do not store secrets here.'
  };

  // ---- wiring ------------------------------------------------------------
  function init() {
    if (!input) return;
    input.addEventListener('input', updateCounts);
    $('jbb-format').addEventListener('click', doFormat);
    $('jbb-minify').addEventListener('click', doMinify);
    $('jbb-sample').addEventListener('click', function () { input.value = JSON.stringify(SAMPLE, null, 2); updateCounts(); output.value = ''; });
    $('jbb-clear').addEventListener('click', function () { input.value = ''; output.value = ''; activeId = null; updateCounts(); updateShare(); });
    $('jbb-clear-out').addEventListener('click', function () { output.value = ''; });
    $('jbb-copy').addEventListener('click', function () { copyText(output.value, this); });
    if (indentSel) indentSel.addEventListener('change', function () { if (output.value) doFormat(); });

    $('jbb-schema-validate').addEventListener('click', runSchemaValidation);
    $('jbb-schema-generate').addEventListener('click', generateSchema);
    $('jbb-schema-clear').addEventListener('click', function () { schemaIn.value = ''; renderSchema('info', 'READY', []); });

    $('jbb-save').addEventListener('click', saveCurrent);
    $('jbb-clear-all').addEventListener('click', clearAll);
    binName.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); saveCurrent(); } });

    binList.addEventListener('click', function (e) {
      var btn = e.target.closest && e.target.closest('button[data-act]');
      if (!btn) return;
      var id = btn.getAttribute('data-id'), act = btn.getAttribute('data-act');
      if (act === 'open') openBin(id);
      else if (act === 'dup') duplicateBin(id);
      else if (act === 'del') deleteBin(id);
    });
    $('jbb-copy-link').addEventListener('click', function () { copyText(shareLink.textContent, this); });

    renderBins();
    updateCounts();
    openFromHash();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
