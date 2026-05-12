(function () {
  'use strict';

  function clean(hex) { return String(hex).replace(/0x/gi,'').replace(/[\s,;:_-]+/g,'').toLowerCase(); }
  function toBytes(hex) {
    var s = clean(hex);
    if (!/^[0-9a-f]*$/.test(s)) throw new Error('Non-hex characters.');
    if (s.length % 2 !== 0) throw new Error('Hex length must be even.');
    var b = []; for (var i = 0; i < s.length; i += 2) b.push(parseInt(s.substr(i, 2), 16));
    return new Uint8Array(b);
  }
  function bytesHexSpaced(b, max) {
    max = max || 80;
    var s = '';
    var n = Math.min(b.length, max);
    for (var i = 0; i < n; i++) s += (b[i] < 16 ? '0' : '') + b[i].toString(16) + ' ';
    if (b.length > max) s += '…';
    return s.toUpperCase();
  }

  function renderNode(node, depth) {
    depth = depth || 0;
    var label = node.typeName;
    var preview = '';
    if (node.tagClass === 0 && node.tagNumber === 0x06) {

      try {
        var oid = AmbiSecureASN1.oidToString(node.value);
        var name = AmbiSecureASN1.oidName(oid);
        preview = AS.escHTML(oid) + (name ? ' <span style="color:var(--secure-cyan-dark);">(' + AS.escHTML(name) + ')</span>' : '');
      } catch (e) { preview = '(invalid OID)'; }
    } else if (node.tagClass === 0 && (node.tagNumber === 0x0C || node.tagNumber === 0x13 || node.tagNumber === 0x16 || node.tagNumber === 0x14 || node.tagNumber === 0x1E)) {
      try {
        var dec = (typeof TextDecoder !== 'undefined') ? new TextDecoder('utf-8', { fatal: false }) : null;
        var text = dec ? dec.decode(node.value) : String.fromCharCode.apply(null, node.value);
        preview = '"' + AS.escHTML(text) + '"';
      } catch (e) {}
    } else if (node.tagClass === 0 && node.tagNumber === 0x02) {
      if (node.value.length <= 4) {
        var v = 0; for (var i = 0; i < node.value.length; i++) v = (v * 256) + node.value[i];
        preview = String(v);
      } else {
        preview = '<span class="mono" style="font-size:11.5px;">' + bytesHexSpaced(node.value, 32) + '</span> (' + node.value.length + ' bytes)';
      }
    } else if (node.tagClass === 0 && node.tagNumber === 0x01) {
      preview = node.value.length > 0 && node.value[0] ? 'true' : 'false';
    } else if (node.tagClass === 0 && node.tagNumber === 0x05) {
      preview = '(NULL)';
    } else if (!node.constructed && node.value.length > 0) {
      preview = '<span class="mono" style="font-size:11.5px;">' + bytesHexSpaced(node.value, 24) + '</span>';
    }

    var summary = '<summary style="cursor:pointer; font-family:JetBrains Mono,monospace; font-size:12.5px; padding:4px 0;">' +
      '<span style="color:var(--brand-red-dark); font-weight:600;">' + AS.escHTML(label) + '</span> ' +
      '<span style="color:var(--brand-grey);">[' + node.value.length + ']</span>';
    if (preview) summary += ' <span style="color:var(--ink);">' + preview + '</span>';
    summary += '</summary>';

    var out = '<details ' + (depth < 1 ? 'open' : '') + ' style="margin-left:' + (depth * 16) + 'px; padding-left:8px; border-left:2px solid ' + (node.constructed ? 'var(--secure-cyan)' : 'var(--line)') + '; margin-bottom:4px;">';
    out += summary;
    if (node.constructed && node.children && node.children.length > 0) {
      node.children.forEach(function (c) { out += renderNode(c, depth + 1); });
    } else if (!preview && node.value.length > 24) {
      out += '<div style="font-family:JetBrains Mono,monospace; font-size:11.5px; color:var(--brand-grey); margin:4px 0 4px 8px; word-break:break-all;">' + bytesHexSpaced(node.value, 200) + '</div>';
    }
    out += '</details>';
    return out;
  }

  function init() {
    var input = AS.$('asne-input'), output = AS.$('asne-output');
    var sample = AS.$('asne-sample'), clearBtn = AS.$('asne-clear');
    if (!input || !output) return;

    function tryDecodePEM(s) {
      var m = s.match(/-----BEGIN[^-]+-----([\s\S]+?)-----END[^-]+-----/);
      if (!m) return null;
      var b64 = m[1].replace(/[\s\r\n]/g, '');
      var raw = atob(b64);
      var out = new Uint8Array(raw.length);
      for (var i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
      return out;
    }

    function go() {
      var raw = (input.value || '').trim();
      if (!raw) { AS.renderPlaceholder(output, 'Paste DER bytes (hex), or paste a PEM block — the tool will base64-decode and walk the ASN.1 tree.'); return; }
      try {
        var bytes;
        if (raw.indexOf('-----BEGIN') !== -1) {
          bytes = tryDecodePEM(raw);
        } else {
          bytes = toBytes(raw);
        }
        if (!bytes || bytes.length === 0) throw new Error('No bytes to parse.');
        var nodes = AmbiSecureASN1.parse(bytes);
        var html = '<div style="margin-bottom:14px;"><span class="tech-badge tech-badge--ok">ASN.1 / BER-DER</span> <span class="tech-badge">' + bytes.length + ' bytes</span></div>';
        html += '<div style="background:#fff; border:1px solid var(--line); border-radius:6px; padding:14px;">';
        nodes.forEach(function (n) { html += renderNode(n, 0); });
        html += '</div>';
        html += '<div class="note" style="margin-top:14px;">Constructed nodes (SEQUENCE / SET) have a cyan left-border and are clickable to expand. OIDs are surfaced with their canonical names where known.</div>';
        output.innerHTML = html;
      } catch (e) { AS.renderError(output, e.message); }
    }
    input.addEventListener('input', go);
    if (sample) sample.addEventListener('click', function () {

      input.value = '30 13 06 07 2A 86 48 CE 3D 02 01 06 08 2A 86 48 CE 3D 03 01 07';
      go();
    });
    if (clearBtn) clearBtn.addEventListener('click', function () { input.value=''; go(); input.focus(); });
    go();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
