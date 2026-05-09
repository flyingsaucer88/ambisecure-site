/* AmbiSecure — UTF-8 inspector */
(function () {
  'use strict';
  function init() {
    var input = AS.$('utf-input'), output = AS.$('utf-output');
    var sample = AS.$('utf-sample'), clearBtn = AS.$('utf-clear'), copyBtn = AS.$('utf-copy');
    if (!input || !output) return;

    function go() {
      var raw = input.value;
      if (!raw) { AS.renderPlaceholder(output, 'Type or paste a string to inspect its UTF-8 encoding.'); return; }
      var bytes = new TextEncoder().encode(raw);
      var pts = Array.from(raw).map(function(c){ return c.codePointAt(0); });
      var bom = (bytes.length >= 3 && bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF);

      var html = '';
      html += '<div style="margin-bottom:14px;"><span class="tech-badge tech-badge--ok">' + bytes.length + ' BYTES</span> ' +
              '<span class="tech-badge">' + pts.length + ' code points</span> ' +
              '<span class="tech-badge">' + raw.length + ' UTF-16 code units</span>' +
              (bom ? ' <span class="tech-badge tech-badge--warn">BOM present</span>' : '') +
              '</div>';

      html += '<div class="parsed-row"><span class="label">UTF-8 (hex)</span><div class="value" style="word-break:break-all;">' + AS.escHTML(Array.from(bytes).map(function(b){return b.toString(16).toUpperCase().padStart(2,'0');}).join(' ')) + '</div></div>';
      html += '<div class="parsed-row"><span class="label">Codepoints</span><div class="value" style="word-break:break-all;">' +
        AS.escHTML(pts.map(function(p){ return 'U+' + p.toString(16).toUpperCase().padStart(4,'0'); }).join(' ')) + '</div></div>';

      var perChar = '<div style="margin-top:14px;font-family:\'JetBrains Mono\',monospace;font-size:13px;">';
      var idx = 0, byteIdx = 0;
      Array.from(raw).forEach(function (ch) {
        var cp = ch.codePointAt(0);
        var byteCount = cp < 0x80 ? 1 : cp < 0x800 ? 2 : cp < 0x10000 ? 3 : 4;
        var hex = '';
        for (var k = 0; k < byteCount; k++) {
          hex += bytes[byteIdx + k].toString(16).toUpperCase().padStart(2, '0') + ' ';
        }
        perChar += '<div style="display:flex;gap:14px;padding:4px 0;border-bottom:1px dashed var(--line);">' +
          '<span style="min-width:30px;color:var(--muted-2);">[' + (idx++) + ']</span>' +
          '<span style="min-width:50px;font-family:\'Source Sans 3\',sans-serif;font-size:15px;">' + AS.escHTML(ch) + '</span>' +
          '<span style="min-width:90px;color:var(--secure-cyan-dark);">U+' + cp.toString(16).toUpperCase().padStart(4,'0') + '</span>' +
          '<span style="color:var(--brand-dark);">' + hex.trim() + '</span>' +
          '<span style="color:var(--muted);">(' + byteCount + ' byte' + (byteCount === 1 ? '' : 's') + ')</span>' +
          '</div>';
        byteIdx += byteCount;
      });
      perChar += '</div>';
      output.dataset.value = Array.from(bytes).map(function(b){return b.toString(16).toUpperCase().padStart(2,'0');}).join(' ');
      output.innerHTML = html + perChar;
    }

    input.addEventListener('input', go);
    if (sample) sample.addEventListener('click', function () {
      input.value = 'AmbiSecure — “एम्बीसिक्योर” 🔐';
      go();
    });
    if (clearBtn) clearBtn.addEventListener('click', function () { input.value=''; go(); input.focus(); });
    AS.bindCopy(copyBtn, function(){ return output.dataset.value || ''; });
    go();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
