(function () {
  'use strict';

  // --- Pure tokenizer / formatter (DOM-free, unit-testable in Node) ---
  // We re-serialize via a light token pass so the logic does not depend on
  // a browser DOM. Well-formedness is still gated by DOMParser in the browser.

  // Split XML into a flat list of tokens: tags (open/close/self/decl/comment/
  // cdata/pi) and text nodes. This does NOT validate; it assumes input already
  // passed the DOMParser well-formedness gate when run in the browser.
  function tokenize(xml) {
    var tokens = [];
    var i = 0, n = xml.length;
    while (i < n) {
      if (xml.charAt(i) === '<') {
        var close = findTagEnd(xml, i);
        if (close === -1) { tokens.push({ type: 'text', value: xml.slice(i) }); break; }
        var raw = xml.slice(i, close + 1);
        tokens.push({ type: classifyTag(raw), value: raw });
        i = close + 1;
      } else {
        var next = xml.indexOf('<', i);
        if (next === -1) next = n;
        tokens.push({ type: 'text', value: xml.slice(i, next) });
        i = next;
      }
    }
    return tokens;
  }

  // Find the index of the '>' that closes the construct starting at `start`.
  // Handles comments, CDATA, and processing instructions whose '>' may be
  // preceded by special terminators.
  function findTagEnd(xml, start) {
    if (xml.substr(start, 4) === '<!--') {
      var c = xml.indexOf('-->', start);
      return c === -1 ? -1 : c + 2;
    }
    if (xml.substr(start, 9) === '<![CDATA[') {
      var cd = xml.indexOf(']]>', start);
      return cd === -1 ? -1 : cd + 2;
    }
    var inS = false, inD = false;
    for (var j = start; j < xml.length; j++) {
      var ch = xml.charAt(j);
      if (ch === '"' && !inS) inD = !inD;
      else if (ch === "'" && !inD) inS = !inS;
      else if (ch === '>' && !inS && !inD) return j;
    }
    return -1;
  }

  function classifyTag(raw) {
    if (raw.indexOf('<!--') === 0) return 'comment';
    if (raw.indexOf('<![CDATA[') === 0) return 'cdata';
    if (raw.indexOf('<?') === 0) return 'pi';
    if (raw.indexOf('<!') === 0) return 'decl';
    if (raw.charAt(1) === '/') return 'close';
    if (raw.charAt(raw.length - 2) === '/') return 'self';
    return 'open';
  }

  // Pretty-print: walk tokens, indenting on open, de-indenting on close.
  // Text-only element bodies are kept on the same line.
  function prettyPrint(xml, indentUnit) {
    var tokens = tokenize(xml);
    var out = [];
    var depth = 0;
    for (var k = 0; k < tokens.length; k++) {
      var t = tokens[k];
      if (t.type === 'text') {
        if (t.value.trim() === '') continue; // drop insignificant whitespace
        // Inline short text: attach to previous open tag, close on next token.
        var prev = lastNonText(tokens, k);
        var next = nextNonText(tokens, k);
        if (prev && prev.type === 'open' && next && next.type === 'close') {
          // collapse <a>text</a> onto one line
          out[out.length - 1] = out[out.length - 1] + escapeText(t.value.trim());
          // mark so the following close tag joins this line
          t._inlineHandled = true;
          continue;
        }
        out.push(pad(depth, indentUnit) + escapeText(t.value.trim()));
        continue;
      }
      if (t.type === 'close') {
        depth = Math.max(0, depth - 1);
        var pn = tokens[k - 1];
        if (pn && pn.type === 'text' && pn._inlineHandled) {
          out[out.length - 1] = out[out.length - 1] + t.value;
        } else {
          out.push(pad(depth, indentUnit) + t.value);
        }
        continue;
      }
      out.push(pad(depth, indentUnit) + t.value);
      if (t.type === 'open') depth++;
    }
    return out.join('\n');
  }

  function lastNonText(tokens, idx) {
    for (var i = idx - 1; i >= 0; i--) { if (tokens[i].type !== 'text' || tokens[i].value.trim() !== '') return tokens[i]; }
    return null;
  }
  function nextNonText(tokens, idx) {
    for (var i = idx + 1; i < tokens.length; i++) { if (tokens[i].type !== 'text' || tokens[i].value.trim() !== '') return tokens[i]; }
    return null;
  }

  // Minify: drop whitespace-only text nodes, trim significant text edges lightly.
  function minify(xml) {
    var tokens = tokenize(xml);
    var out = '';
    for (var k = 0; k < tokens.length; k++) {
      var t = tokens[k];
      if (t.type === 'text') {
        if (t.value.trim() === '') continue;
        out += escapeText(t.value.trim());
      } else {
        out += t.value;
      }
    }
    return out;
  }

  function pad(depth, unit) {
    var s = '';
    for (var i = 0; i < depth; i++) s += unit;
    return s;
  }

  // Text was pulled out of already-well-formed source, so existing entities
  // (&amp;, &lt;, …) are intact. Re-escaping would double them, so return as-is.
  function escapeText(s) {
    return String(s);
  }

  function rootName(xml) {
    var tokens = tokenize(xml);
    for (var k = 0; k < tokens.length; k++) {
      if (tokens[k].type === 'open' || tokens[k].type === 'self') {
        var m = tokens[k].value.match(/^<\s*([^\s\/>]+)/);
        return m ? m[1] : '';
      }
    }
    return '';
  }

  function nodeCount(xml) {
    var tokens = tokenize(xml);
    var c = 0;
    for (var k = 0; k < tokens.length; k++) {
      var ty = tokens[k].type;
      if (ty === 'open' || ty === 'self') c++;
    }
    return c;
  }

  // --- Browser-only: well-formedness via DOMParser ---
  function checkWellFormed(xml) {
    if (typeof window === 'undefined' || typeof window.DOMParser === 'undefined') {
      return { ok: false, message: 'DOMParser is not available in this environment.' };
    }
    var doc = new window.DOMParser().parseFromString(xml, 'application/xml');
    var err = doc.getElementsByTagName('parsererror');
    if (err && err.length > 0) {
      var text = (err[0].textContent || 'XML is not well-formed.').replace(/\s+/g, ' ').trim();
      return { ok: false, message: text };
    }
    // Some engines return an empty document with no parsererror on blank input.
    if (!doc.documentElement) {
      return { ok: false, message: 'No root element found.' };
    }
    return { ok: true };
  }

  function init() {
    var input = AS.$('xf-input'), output = AS.$('xf-output');
    var mode = AS.$('xf-mode'), indent = AS.$('xf-indent');
    var sample = AS.$('xf-sample'), clearBtn = AS.$('xf-clear');
    var copyBtn = AS.$('xf-copy'), dlBtn = AS.$('xf-download');
    if (!input || !output) return;

    function lastResult() { return output.dataset.value || ''; }

    function indentUnit() {
      if (indent.value === 'tab') return '\t';
      if (indent.value === '4') return '    ';
      return '  ';
    }

    function go() {
      output.dataset.value = '';
      var raw = input.value;
      if (!raw.trim()) { AS.renderPlaceholder(output, 'Paste XML to format.'); return; }

      var wf = checkWellFormed(raw);
      if (!wf.ok) { AS.renderError(output, wf.message); return; }

      try {
        var result, badge;
        if (mode.value === 'minify') {
          result = minify(raw);
          badge = 'MINIFIED';
        } else if (mode.value === 'check') {
          result = raw;
          badge = 'WELL-FORMED';
        } else {
          result = prettyPrint(raw, indentUnit());
          badge = 'PRETTY-PRINTED';
        }
        output.dataset.value = result;

        var root = rootName(raw);
        var count = nodeCount(raw);
        var meta =
          '<span class="tech-badge tech-badge--ok">' + AS.escHTML(badge) + '</span> ' +
          (root ? '<span class="tech-badge tech-badge--info">root: ' + AS.escHTML(root) + '</span> ' : '') +
          '<span class="tech-badge">' + count + ' element' + (count === 1 ? '' : 's') + '</span> ' +
          '<span class="tech-badge">' + result.length + ' chars</span>';

        if (mode.value === 'check') {
          output.innerHTML =
            '<div style="margin-bottom:10px;">' + meta + '</div>' +
            '<div class="parsed-row"><span class="label">Status</span><div class="value">Document is well-formed XML. This is a syntax check only — not DTD or XSD validation.</div></div>';
        } else {
          output.innerHTML =
            '<div style="margin-bottom:10px;">' + meta + '</div>' +
            '<pre style="white-space:pre-wrap;word-break:break-all;font-family:\'JetBrains Mono\',monospace;font-size:13.5px;line-height:1.65;">' +
            AS.escHTML(result) + '</pre>';
        }
      } catch (e) {
        AS.renderError(output, e.message || 'Could not format the XML.');
      }
    }

    input.addEventListener('input', go);
    mode.addEventListener('change', go);
    indent.addEventListener('change', go);

    if (sample) sample.addEventListener('click', function () {
      input.value =
        '<?xml version="1.0" encoding="UTF-8"?>' +
        '<catalog xmlns="urn:demo:catalog"><book id="bk1" lang="en">' +
        '<title>Hardware-Rooted Trust</title><tags><tag>secure-element</tag>' +
        '<tag>fido2</tag></tags><note>Use &amp; verify keys.</note></book></catalog>';
      go();
    });
    if (clearBtn) clearBtn.addEventListener('click', function () { input.value = ''; go(); input.focus(); });

    AS.bindCopy(copyBtn, lastResult);
    if (dlBtn) dlBtn.addEventListener('click', function () {
      var txt = lastResult();
      if (!txt) return;
      AS.downloadBlob('formatted.xml', 'application/xml', new TextEncoder().encode(txt));
    });

    go();
  }

  // Expose pure logic for self-test (Node) and isolated reuse.
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      tokenize: tokenize,
      prettyPrint: prettyPrint,
      minify: minify,
      rootName: rootName,
      nodeCount: nodeCount,
      classifyTag: classifyTag
    };
  }
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  }
})();
