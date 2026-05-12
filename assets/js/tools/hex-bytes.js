(function () {
  'use strict';
  function init() {
    var input = AS.$('hb-input'), output = AS.$('hb-output');
    var fmt = AS.$('hb-format'), sample = AS.$('hb-sample'), clearBtn = AS.$('hb-clear'), copyBtn = AS.$('hb-copy');
    if (!input || !output) return;

    function clean(hex){ return String(hex).replace(/0x/gi,'').replace(/[\s,;:_\-\\\\\[\]\(\)\{\}]+/g,'').replace(/x/gi,'').toLowerCase(); }
    function toBytes(hex){
      var s = clean(hex);
      if (s.length % 2 !== 0) throw new Error('Hex length must be even (got ' + s.length + ' nibbles).');
      if (!/^[0-9a-f]*$/.test(s)) throw new Error('Non-hex characters in input.');
      var b = [];
      for (var i = 0; i < s.length; i += 2) b.push(parseInt(s.substr(i,2),16));
      return b;
    }
    function pad(b){ var x = b.toString(16).toUpperCase(); return x.length < 2 ? '0'+x : x; }
    function emit(b, format) {
      switch (format) {
        case 'space':   return b.map(pad).join(' ');
        case 'comma':   return b.map(pad).join(', ');
        case 'colon':   return b.map(pad).join(':');
        case 'compact': return b.map(pad).join('');
        case 'c':       return '{ ' + b.map(function(x){ return '0x' + pad(x); }).join(', ') + ' }';
        case 'java':    return 'new byte[]{ ' + b.map(function(x){ var v = x > 127 ? x - 256 : x; return '(byte)0x' + pad(x); }).join(', ') + ' }';
        case 'python':  return 'bytes([' + b.map(function(x){ return '0x' + pad(x); }).join(', ') + '])';
        case 'js':      return 'new Uint8Array([' + b.map(function(x){ return '0x' + pad(x); }).join(', ') + '])';
        case 'esc':     return '"' + b.map(function(x){ return '\\\\x' + pad(x); }).join('') + '"';
        default:        return b.map(pad).join(' ');
      }
    }
    function lastResult(){ return output.dataset.value || ''; }

    function go() {
      var raw = input.value;
      output.dataset.value = '';
      if (!raw.trim()) { AS.renderPlaceholder(output, 'Paste hex in any format.'); return; }
      try {
        var b = toBytes(raw);
        var formatted = emit(b, fmt.value);
        output.dataset.value = formatted;
        output.innerHTML = '<div style="margin-bottom:10px;"><span class="tech-badge tech-badge--ok">' + b.length + ' BYTES</span> <span class="tech-badge tech-badge--info">' + AS.escHTML(fmt.options[fmt.selectedIndex].text) + '</span></div>' +
          '<pre style="white-space:pre-wrap;word-break:break-all;font-family:\'JetBrains Mono\',monospace;font-size:13.5px;line-height:1.7;">' + AS.escHTML(formatted) + '</pre>';
      } catch (e) { AS.renderError(output, e.message); }
    }

    input.addEventListener('input', go);
    fmt.addEventListener('change', go);
    if (sample) sample.addEventListener('click', function(){
      input.value = '0x90, 0x00, 0x6F, 0x1E, 0x84, 0x07, 0xA0, 0x00, 0x00, 0x00, 0x03, 0x10, 0x10';
      go();
    });
    if (clearBtn) clearBtn.addEventListener('click', function () { input.value=''; go(); input.focus(); });
    AS.bindCopy(copyBtn, lastResult);
    go();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
