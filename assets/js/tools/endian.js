/* AmbiSecure — Endian converter */
(function () {
  'use strict';
  function init() {
    var input = AS.$('en-input'), output = AS.$('en-output');
    var width = AS.$('en-width'), sample = AS.$('en-sample'), clearBtn = AS.$('en-clear'), copyBtn = AS.$('en-copy');
    if (!input || !output) return;

    function clean(hex){ return String(hex).replace(/0x/gi,'').replace(/[\s,;:_-]+/g,'').toLowerCase(); }
    function toBytes(hex){
      var s = clean(hex);
      if (s.length % 2 !== 0) throw new Error('Hex length must be even.');
      if (!/^[0-9a-f]*$/.test(s)) throw new Error('Non-hex characters.');
      var b = []; for (var i = 0; i < s.length; i += 2) b.push(parseInt(s.substr(i,2),16));
      return b;
    }
    function pad(b){ var x = b.toString(16).toUpperCase(); return x.length < 2 ? '0'+x : x; }
    function group(b, w) {
      var out = [];
      for (var i = 0; i < b.length; i += w) out.push(b.slice(i, i + w));
      return out;
    }

    function go() {
      var raw = input.value.trim();
      if (!raw) { AS.renderPlaceholder(output, 'Paste hex, choose a width, see endian conversions.'); return; }
      try {
        var b = toBytes(raw);
        var w = parseInt(width.value, 10);
        if (b.length % w !== 0) throw new Error('Input length (' + b.length + ' bytes) must be a multiple of ' + w + '.');
        var groups = group(b, w);
        var html = '<div style="margin-bottom:14px;"><span class="tech-badge tech-badge--ok">' + groups.length + '×u' + (w*8) + '</span></div>';
        html += '<table style="width:100%;border-collapse:collapse;font-family:\'JetBrains Mono\',monospace;font-size:13px;">';
        html += '<thead><tr style="background:var(--brand-soft);font-family:\'Montserrat\',sans-serif;font-size:11px;letter-spacing:0.5px;text-transform:uppercase;color:var(--brand-dark);"><th style="padding:8px;text-align:left;">#</th><th style="padding:8px;text-align:left;">Big-endian (BE)</th><th style="padding:8px;text-align:left;">Little-endian (LE)</th><th style="padding:8px;text-align:left;">BE → unsigned</th><th style="padding:8px;text-align:left;">LE → unsigned</th></tr></thead><tbody>';
        var copies = [];
        groups.forEach(function (g, i) {
          var be = g.map(pad).join('');
          var le = g.slice().reverse().map(pad).join('');
          var beVal = parseInt(be, 16);
          var leVal = parseInt(le, 16);
          html += '<tr style="border-bottom:1px solid var(--line);"><td style="padding:6px 8px;color:var(--muted-2);">' + i + '</td><td style="padding:6px 8px;">' + be + '</td><td style="padding:6px 8px;">' + le + '</td><td style="padding:6px 8px;">' + beVal + '</td><td style="padding:6px 8px;">' + leVal + '</td></tr>';
          copies.push(le);
        });
        html += '</tbody></table>';
        output.dataset.value = copies.join(' ');
        output.innerHTML = html;
      } catch (e) { AS.renderError(output, e.message); }
    }

    input.addEventListener('input', go);
    width.addEventListener('change', go);
    if (sample) sample.addEventListener('click', function(){ input.value = 'DEADBEEF12345678'; width.value = '4'; go(); });
    if (clearBtn) clearBtn.addEventListener('click', function () { input.value=''; go(); input.focus(); });
    AS.bindCopy(copyBtn, function(){ return output.dataset.value || ''; });
    go();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
