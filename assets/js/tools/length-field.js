/* AmbiSecure — Length-field encoder
   Encodes an integer length in: BER long-form, DGI long-form, 1-byte, 2-byte BE/LE. */
(function () {
  'use strict';
  function init() {
    var input = AS.$('lf-input'), output = AS.$('lf-output');
    var sample = AS.$('lf-sample'), clearBtn = AS.$('lf-clear'), copyBtn = AS.$('lf-copy');
    if (!input || !output) return;

    function pad(b){ var x = b.toString(16).toUpperCase(); return x.length < 2 ? '0'+x : x; }
    function asBytes(arr){ return arr.map(pad).join(' '); }

    function ber(n) {
      if (n < 0x80) return [n];
      var out = [];
      var v = n;
      while (v > 0) { out.unshift(v & 0xFF); v = Math.floor(v / 256); }
      return [0x80 | out.length].concat(out);
    }
    function dgi(n) {
      if (n < 0xFF) return [n];
      var hi = (n >> 8) & 0xFF, lo = n & 0xFF;
      return [0xFF, hi, lo];
    }
    function u8(n){ if (n > 0xFF) throw new Error('> 255 — too big for 1 byte.'); return [n]; }
    function u16BE(n){ if (n > 0xFFFF) throw new Error('> 65535 — too big for 2 bytes.'); return [(n>>8)&0xFF, n&0xFF]; }
    function u16LE(n){ if (n > 0xFFFF) throw new Error('> 65535 — too big for 2 bytes.'); return [n&0xFF, (n>>8)&0xFF]; }

    function row(label, arr, note) {
      return '<div class="parsed-row"><span class="label">' + AS.escHTML(label) + '</span>' +
        '<div><div class="value">' + AS.escHTML(asBytes(arr)) + ' &nbsp;<span style="color:var(--muted-2);">(' + arr.length + ' B)</span></div>' +
        (note ? '<span class="note">' + note + '</span>' : '') + '</div></div>';
    }

    function go() {
      var raw = input.value.trim();
      if (!raw) { AS.renderPlaceholder(output, 'Enter a non-negative integer.'); return; }
      var n;
      if (/^0x[0-9a-f]+$/i.test(raw)) n = parseInt(raw.slice(2), 16);
      else if (/^\d+$/.test(raw)) n = parseInt(raw, 10);
      else { AS.renderError(output, 'Enter a decimal integer or 0x-prefixed hex.'); return; }
      if (n < 0 || !Number.isFinite(n)) { AS.renderError(output, 'Must be non-negative.'); return; }

      var html = '<div style="margin-bottom:14px;"><span class="tech-badge tech-badge--ok">' + n + '</span> <span class="tech-badge">0x' + n.toString(16).toUpperCase() + '</span></div>';
      try { html += row('BER (X.690)', ber(n), 'Short form when ≤127; long form 0x80|N then N MSB-first bytes.'); } catch(e) { html += row('BER', [], e.message); }
      try { html += row('DGI (GP)', dgi(n), 'Short when <0xFF; otherwise 0xFF, hi, lo.'); } catch(e) {}
      try { html += row('Unsigned 1-byte', u8(n)); } catch (e) { html += row('Unsigned 1-byte', [], e.message); }
      try { html += row('Unsigned 2-byte BE', u16BE(n)); } catch (e) { html += row('Unsigned 2-byte BE', [], e.message); }
      try { html += row('Unsigned 2-byte LE', u16LE(n)); } catch (e) { html += row('Unsigned 2-byte LE', [], e.message); }
      output.dataset.value = asBytes(ber(n));
      output.innerHTML = html;
    }

    input.addEventListener('input', go);
    if (sample) sample.addEventListener('click', function(){ input.value = '300'; go(); });
    if (clearBtn) clearBtn.addEventListener('click', function () { input.value=''; go(); input.focus(); });
    AS.bindCopy(copyBtn, function(){ return output.dataset.value || ''; });
    go();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
