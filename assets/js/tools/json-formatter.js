(function () {
  'use strict';

  // Recursively sort object keys. Arrays keep their order; primitives unchanged.
  function sortKeys(value) {
    if (Array.isArray(value)) {
      var arr = [];
      for (var i = 0; i < value.length; i++) arr.push(sortKeys(value[i]));
      return arr;
    }
    if (value && typeof value === 'object') {
      var out = {};
      var keys = Object.keys(value).sort();
      for (var j = 0; j < keys.length; j++) out[keys[j]] = sortKeys(value[keys[j]]);
      return out;
    }
    return value;
  }

  // Pick the JSON.stringify indent argument from a UI setting.
  function indentArg(indent) {
    if (indent === 'tab') return '\t';
    if (indent === '4') return 4;
    return 2;
  }

  // Format JSON text. Returns { ok, output } or { ok:false, error, line, col }.
  function format(text, opts) {
    opts = opts || {};
    var parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      var loc = locateError(text, e);
      return { ok: false, error: e.message, line: loc.line, col: loc.col, pos: loc.pos };
    }
    if (opts.sort) parsed = sortKeys(parsed);
    var output;
    if (opts.mode === 'minify') output = JSON.stringify(parsed);
    else output = JSON.stringify(parsed, null, indentArg(opts.indent));
    return { ok: true, output: output };
  }

  // Derive a 1-based line/column from a JSON.parse SyntaxError.
  function locateError(text, err) {
    var msg = String(err && err.message || '');
    var pos = -1;
    var m = msg.match(/position\s+(\d+)/i);
    if (m) pos = parseInt(m[1], 10);
    if (pos < 0) {
      // Some engines report line/column directly.
      var lm = msg.match(/line\s+(\d+)\s+column\s+(\d+)/i);
      if (lm) return { line: parseInt(lm[1], 10), col: parseInt(lm[2], 10), pos: -1 };
      return { line: 0, col: 0, pos: -1 };
    }
    if (pos > text.length) pos = text.length;
    var line = 1, col = 1;
    for (var i = 0; i < pos; i++) {
      if (text.charAt(i) === '\n') { line++; col = 1; } else { col++; }
    }
    return { line: line, col: col, pos: pos };
  }

  function init() {
    var input = AS.$('jf-input'), output = AS.$('jf-output');
    var mode = AS.$('jf-mode'), indent = AS.$('jf-indent'), sort = AS.$('jf-sort');
    var sample = AS.$('jf-sample'), clearBtn = AS.$('jf-clear');
    var copyBtn = AS.$('jf-copy'), dlBtn = AS.$('jf-download');
    var indentRow = indent ? indent.closest('label') : null;
    if (!input || !output) return;

    function lastResult() { return output.dataset.value || ''; }

    function go() {
      output.dataset.value = '';
      // Minify mode ignores indentation; dim the control to make that clear.
      if (indentRow) indentRow.style.opacity = (mode.value === 'minify') ? '0.45' : '1';
      var raw = input.value;
      if (!raw.trim()) { AS.renderPlaceholder(output, 'Paste JSON to format it.'); return; }
      var res = format(raw, { mode: mode.value, indent: indent.value, sort: !!sort.checked });
      if (!res.ok) {
        var where = res.line > 0
          ? 'Line ' + res.line + ', column ' + res.col + (res.pos >= 0 ? ' (offset ' + res.pos + ')' : '')
          : 'Position not reported by the browser.';
        output.innerHTML =
          '<div style="margin-bottom:10px;"><span class="tech-badge tech-badge--err">PARSE ERROR</span></div>' +
          '<div class="parsed-row"><span class="label">Where</span><div class="value">' + AS.escHTML(where) + '</div></div>' +
          '<div class="parsed-row"><span class="label">Message</span><div class="value">' + AS.escHTML(res.error) + '</div></div>';
        return;
      }
      output.dataset.value = res.output;
      var bytes = new TextEncoder().encode(res.output).length;
      var modeLabel = mode.value === 'minify' ? 'MINIFIED' : 'PRETTY';
      output.innerHTML =
        '<div style="margin-bottom:10px;"><span class="tech-badge tech-badge--ok">' + modeLabel + '</span> ' +
        '<span class="tech-badge">' + res.output.length + ' chars</span> ' +
        '<span class="tech-badge tech-badge--info">' + bytes + ' bytes</span>' +
        (sort.checked ? ' <span class="tech-badge tech-badge--warn">keys sorted</span>' : '') + '</div>' +
        '<pre style="white-space:pre;overflow-x:auto;font-family:\'JetBrains Mono\',monospace;font-size:13.5px;line-height:1.65;">' +
        AS.escHTML(res.output) + '</pre>';
    }

    var SAMPLE = '{ "id": "rp.example.com", "version": 2, "enabled": true, '
      + '"algorithms": [ -7, -257 ], "meta": { "region": "ahmedabad", '
      + '"created": "2026-06-03", "tags": ["fido", "javacard"] }, "note": null }';

    input.addEventListener('input', go);
    mode.addEventListener('change', go);
    indent.addEventListener('change', go);
    sort.addEventListener('change', go);
    if (sample) sample.addEventListener('click', function () { input.value = SAMPLE; go(); });
    if (clearBtn) clearBtn.addEventListener('click', function () { input.value = ''; go(); input.focus(); });
    AS.bindCopy(copyBtn, lastResult);
    if (dlBtn) dlBtn.addEventListener('click', function () {
      var txt = lastResult();
      if (!txt) return;
      AS.downloadBlob('formatted.json', 'application/json', new TextEncoder().encode(txt));
    });
    go();
  }

  // Expose for self-test (Node) and isolated reuse.
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { format: format, sortKeys: sortKeys, locateError: locateError, indentArg: indentArg };
  }
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  }
})();
