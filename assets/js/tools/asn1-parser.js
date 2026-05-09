/* AmbiSecure — ASN.1 BER/DER tree parser. Client-side. */
(function () {
  'use strict';
  function init() {
    var input = AS.$('a1-input'), output = AS.$('a1-output');
    var sample = AS.$('a1-sample'), clearBtn = AS.$('a1-clear');
    var dropPanel = AS.$('a1-drop'), filePicker = AS.$('a1-file');
    if (!input || !output) return;

    function nodeHTML(n, depth) {
      var classBits = n.constructed ? 'constructed' : 'primitive';
      var html = '<div class="node ' + classBits + '">';
      html += '<span class="tag">' + AS.escHTML(n.typeName) + '</span> ';
      html += '<span class="len">L=' + n.contentLength + '</span> ';
      if (!n.constructed) {
        var v = AmbiSecureASN1.decodeValue(n);
        if (n.tagClass === 0 && n.tagNumber === 6) {
          var name = AmbiSecureASN1.oidName(v);
          html += '<span class="val">' + AS.escHTML(v) + '</span>';
          if (name) html += '<span class="meaning">— ' + AS.escHTML(name) + '</span>';
        } else if (typeof v === 'string') {
          html += '<span class="val">' + AS.escHTML(v.length > 80 ? v.substring(0, 80) + '…' : v) + '</span>';
        } else if (typeof v === 'number') {
          html += '<span class="val">' + v + '</span>';
          html += '<span class="meaning">(0x' + AmbiSecureASN1.bytesToHex(n.value) + ')</span>';
        } else if (typeof v === 'boolean') {
          html += '<span class="val">' + (v ? 'TRUE' : 'FALSE') + '</span>';
        } else {
          var hex = AmbiSecureASN1.bytesToHex(n.value.subarray(0, 24), ' ');
          html += '<span class="val">' + AS.escHTML(hex) + (n.value.length > 24 ? ' …' : '') + '</span>';
        }
      } else {
        html += '<span class="meaning">[constructed · ' + n.children.length + ' child' + (n.children.length === 1 ? '' : 'ren') + ']</span>';
      }
      if (n.children) html += n.children.map(function (c) { return nodeHTML(c, depth + 1); }).join('');
      html += '</div>';
      return html;
    }

    function go() {
      var raw = input.value.trim();
      if (!raw) { AS.renderPlaceholder(output, 'Paste hex, base64, or a PEM block.'); return; }
      try {
        var bytes;
        if (raw.indexOf('-----BEGIN') !== -1) bytes = AmbiSecureX509.decodePEM(raw)[0].der;
        else if (/^[0-9a-f\s,;:_-]+$/i.test(raw)) bytes = AmbiSecureASN1.hexToBytes(raw);
        else bytes = AmbiSecureX509.base64Decode(raw.replace(/[\s]/g,''));
        var nodes = AmbiSecureASN1.parse(bytes);
        var html = '<div style="margin-bottom:14px;"><span class="tech-badge tech-badge--ok">VALID ASN.1</span> <span class="tech-badge">' + bytes.length + ' bytes</span> <span class="tech-badge">' + nodes.length + ' top-level</span></div>';
        html += '<div class="tlv-tree">' + nodes.map(function (n) { return nodeHTML(n, 0); }).join('') + '</div>';
        output.innerHTML = html;
      } catch (e) { AS.renderError(output, e.message || String(e)); }
    }

    input.addEventListener('input', go);
    if (sample) sample.addEventListener('click', function () {
      input.value = '30 13 02 01 01 06 09 2A 86 48 86 F7 0D 01 01 0B 04 03 41 42 43';
      go();
    });
    if (clearBtn) clearBtn.addEventListener('click', function () { input.value=''; go(); input.focus(); });
    AS.bindDrop(dropPanel, function (f) { if (f.error) { AS.renderError(output, f.error); return; } input.value = f.text; go(); });
    AS.bindFilePicker(filePicker, function (f) { if (f.error) { AS.renderError(output, f.error); return; } input.value = f.text; go(); });
    go();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
