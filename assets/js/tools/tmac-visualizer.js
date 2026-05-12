(function () {
  'use strict';

  function clean(hex) { return String(hex).replace(/0x/gi,'').replace(/[\s,;:_-]+/g,'').toLowerCase(); }
  function toBytes(hex) {
    var s = clean(hex);
    if (!/^[0-9a-f]*$/.test(s)) throw new Error('Non-hex characters.');
    if (s.length % 2 !== 0) throw new Error('Hex length must be even.');
    var b = []; for (var i = 0; i < s.length; i += 2) b.push(parseInt(s.substr(i, 2), 16));
    return b;
  }

  function row(label, value, note) {
    return '<div class="parsed-row"><span class="label">' + label + '</span>' +
      '<div><div class="value">' + value + '</div>' +
      (note ? '<span class="note">' + note + '</span>' : '') + '</div></div>';
  }

  function bytesHex(b) { var s = ''; for (var i = 0; i < b.length; i++) s += (b[i] < 16 ? '0' : '') + b[i].toString(16); return s.toUpperCase(); }

  function init() {
    var input = AS.$('tmac-input'), output = AS.$('tmac-output');
    var sample = AS.$('tmac-sample'), clearBtn = AS.$('tmac-clear');
    if (!input || !output) return;

    function go() {
      var raw = (input.value || '').trim();
      if (!raw) { AS.renderPlaceholder(output, 'Paste TMAC field bytes (hex). Standard layout: TMC(4) || TMV(8).'); return; }
      try {
        var b = toBytes(raw);
        if (b.length < 12) throw new Error('Standard TMAC field is at least 12 bytes — TMC (4) + TMV (8).');

        var tmc = b.slice(0, 4);
        var tmcLE = (tmc[0]) | (tmc[1] << 8) | (tmc[2] << 16) | (tmc[3] << 24);
        tmcLE = tmcLE >>> 0;
        var tmv = b.slice(4, 12);

        var html = '<div style="margin-bottom:14px;"><span class="tech-badge tech-badge--ok">TMAC field</span> <span class="tech-badge">' + b.length + ' bytes</span></div>';
        html += row('TMC (counter)', '<span class="mono">' + bytesHex(tmc) + '</span>',
          'Transaction Message Counter, 4 bytes LE = ' + tmcLE + '. Increments with each successful CommitTransaction; rollback safe.');
        html += row('TMV (MAC value)', '<span class="mono">' + bytesHex(tmv) + '</span>',
          'CMAC truncated to 8 bytes, computed by the card over the transaction structure with the per-application TMAC key.');

        if (b.length > 12) {
          var extra = b.slice(12);
          html += row('Trailing bytes', '<span class="mono">' + bytesHex(extra) + '</span>',
            extra.length + ' extra bytes — depending on PICC config, may include padding or vendor-specific extension.');
        }

        html += '<div class="note" style="margin-top:14px; padding:12px 16px; background:var(--secure-cyan-soft); border-left:3px solid var(--secure-cyan); border-radius:3px;">' +
          '<strong>What TMAC buys you</strong>: a tamper-evident transaction log. Every successful CommitTransaction increments TMC and produces a fresh CMAC. The backend can verify TMAC against its own state to detect: replayed transactions (TMC re-use), missing transactions (TMC gap), and tampered values (TMV mismatch). Available on DESFire EV2 and EV3.</div>';

        output.innerHTML = html;
      } catch (e) { AS.renderError(output, e.message); }
    }
    input.addEventListener('input', go);
    if (sample) sample.addEventListener('click', function () {
      input.value = '17 00 00 00 11 22 33 44 55 66 77 88';
      go();
    });
    if (clearBtn) clearBtn.addEventListener('click', function () { input.value=''; go(); input.focus(); });
    go();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
