(function () {
  'use strict';
  function init() {
    var input = AS.$('ax-input'), output = AS.$('ax-output'), dir = AS.$('ax-direction');
    var sample = AS.$('ax-sample'), clearBtn = AS.$('ax-clear'), copyBtn = AS.$('ax-copy');
    var sep = AS.$('ax-sep');
    if (!input || !output) return;

    function encodeAscii(s) {
      var out = [];
      for (var i = 0; i < s.length; i++) {
        var c = s.charCodeAt(i);
        if (c > 0xFF) throw new Error('Non-ASCII character at offset ' + i + ' (U+' + c.toString(16).toUpperCase() + '). Use the UTF-8 tool for multi-byte text.');
        out.push(c);
      }
      return out;
    }
    function bytesToHex(b, sep) {
      var out = '';
      for (var i = 0; i < b.length; i++) {
        var x = b[i].toString(16).toUpperCase();
        if (x.length < 2) x = '0' + x;
        out += (i ? sep : '') + x;
      }
      return out;
    }
    function hexToBytes(hex) {
      var s = String(hex).replace(/0x/gi, '').replace(/[\s,;:_-]+/g, '').toLowerCase();
      if (s.length % 2 !== 0) throw new Error('Hex length must be even (got ' + s.length + ' nibbles).');
      if (!/^[0-9a-f]*$/.test(s)) throw new Error('Non-hex characters in input.');
      var out = [];
      for (var i = 0; i < s.length; i += 2) out.push(parseInt(s.substr(i, 2), 16));
      return out;
    }
    function bytesToAscii(b) {
      var s = '';
      for (var i = 0; i < b.length; i++) {
        if (b[i] >= 0x20 && b[i] <= 0x7E) s += String.fromCharCode(b[i]);
        else if (b[i] === 0x0A) s += '\n';
        else if (b[i] === 0x09) s += '\t';
        else s += '·';
      }
      return s;
    }
    function lastResult(){ return output.dataset.value || ''; }
    function setResult(value) { output.dataset.value = value; }

    function go() {
      var raw = input.value;
      output.dataset.value = '';
      if (!raw) { AS.renderPlaceholder(output, 'Type something to convert.'); return; }
      try {
        var direction = dir.value;
        if (direction === 'a2h') {
          var b = encodeAscii(raw);
          var sepCh = ({space:' ', comma:', ', none:'', dash:'-'}[sep.value] || ' ');
          var hex = bytesToHex(b, sepCh);
          setResult(hex);
          output.innerHTML = '<div style="margin-bottom:10px;"><span class="tech-badge tech-badge--ok">' + b.length + ' BYTES</span></div>' +
            '<div style="font-family:\'JetBrains Mono\',monospace;font-size:13.5px;line-height:1.7;word-break:break-all;">' + AS.escHTML(hex) + '</div>';
        } else {
          var bytes = hexToBytes(raw);
          var s = bytesToAscii(bytes);
          setResult(s);
          output.innerHTML = '<div style="margin-bottom:10px;"><span class="tech-badge tech-badge--ok">' + bytes.length + ' BYTES</span></div>' +
            '<pre style="white-space:pre-wrap;font-family:\'Source Sans 3\',sans-serif;font-size:14.5px;color:var(--ink);">' + AS.escHTML(s) + '</pre>';
        }
      } catch (e) { AS.renderError(output, e.message); }
    }

    input.addEventListener('input', go);
    dir.addEventListener('change', go);
    sep.addEventListener('change', go);
    if (sample) sample.addEventListener('click', function(){
      if (dir.value === 'a2h') input.value = 'Authentication without compromise';
      else input.value = '41 75 74 68 65 6E 74 69 63 61 74 69 6F 6E';
      go();
    });
    if (clearBtn) clearBtn.addEventListener('click', function () { input.value=''; go(); input.focus(); });
    AS.bindCopy(copyBtn, lastResult);
    go();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
