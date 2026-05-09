/* AmbiSecure — ATS (Answer To Select) parser.
   ISO/IEC 14443-4 §5.2.1 — the response to a RATS command.
   Decodes TL, T0, TA(1), TB(1), TC(1), and historical bytes. */
(function () {
  'use strict';

  function clean(hex) { return String(hex).replace(/0x/gi,'').replace(/[\s,;:_-]+/g,'').toLowerCase(); }
  function toBytes(hex) {
    var s = clean(hex);
    if (s.length % 2 !== 0) throw new Error('Hex length must be even.');
    if (!/^[0-9a-f]*$/.test(s)) throw new Error('Non-hex characters.');
    var b = []; for (var i = 0; i < s.length; i += 2) b.push(parseInt(s.substr(i, 2), 16));
    return b;
  }

  function init() {
    var input = AS.$('ats-input'), output = AS.$('ats-output');
    var sample = AS.$('ats-sample'), clearBtn = AS.$('ats-clear');
    if (!input || !output) return;

    function row(label, value, note) {
      return '<div class="parsed-row"><span class="label">' + label + '</span>' +
        '<div><div class="value">' + value + '</div>' + (note ? '<span class="note">' + note + '</span>' : '') + '</div></div>';
    }

    function go() {
      var raw = (input.value || '').trim();
      if (!raw) { AS.renderPlaceholder(output, 'Paste ATS bytes (typically starts with TL).'); return; }
      try {
        var b = toBytes(raw);
        if (b.length < 2) throw new Error('ATS is at least 2 bytes (TL + T0).');
        var TL = b[0];
        if (TL !== b.length) {
          // tolerate but warn
          var warn = ' <span class="tech-badge tech-badge--warn">TL=' + TL + ' but message length=' + b.length + '</span>';
        } else {
          var warn = ' <span class="tech-badge tech-badge--ok">TL matches</span>';
        }
        var T0 = b[1];
        var Y = (T0 >> 4) & 0x07;
        var FSCI = T0 & 0x0F;
        var FSC_TABLE = [16, 24, 32, 40, 48, 64, 96, 128, 256, 512, 1024, 2048, 4096];
        var FSC = FSC_TABLE[Math.min(FSCI, FSC_TABLE.length - 1)];

        var html = '<div style="margin-bottom:14px;"><span class="tech-badge tech-badge--ok">ATS</span> <span class="tech-badge">' + b.length + ' bytes</span>' + warn + '</div>';
        html += row('TL', '<span class="mono">0x' + TL.toString(16).toUpperCase().padStart(2,'0') + '</span>', 'Total length of ATS, including this byte.');
        html += row('T0', '<span class="mono">0x' + T0.toString(16).toUpperCase().padStart(2,'0') + '</span>',
          'TA(1) ' + (Y & 1 ? 'present' : 'absent') + ' &middot; TB(1) ' + ((Y >> 1) & 1 ? 'present' : 'absent') +
          ' &middot; TC(1) ' + ((Y >> 2) & 1 ? 'present' : 'absent') +
          ' &middot; FSCI=' + FSCI + ' (FSC = ' + FSC + ' bytes)');

        var i = 2;
        if (Y & 1) {
          var TA = b[i++];
          var DR_PCD = (TA >> 4) & 0x07;
          var DS_PICC = TA & 0x07;
          var same = !!(TA & 0x80);
          html += row('TA(1)', '<span class="mono">0x' + TA.toString(16).toUpperCase().padStart(2,'0') + '</span>',
            'Bit-rate: PCD->PICC ' + DR_PCD + ' &middot; PICC->PCD ' + DS_PICC + (same ? ' &middot; same in both directions only' : ' &middot; different rates allowed'));
        }
        if (Y & 2) {
          var TB = b[i++];
          var FWI = (TB >> 4) & 0x0F;
          var SFGI = TB & 0x0F;
          html += row('TB(1)', '<span class="mono">0x' + TB.toString(16).toUpperCase().padStart(2,'0') + '</span>',
            'FWI=' + FWI + ' (frame waiting time) &middot; SFGI=' + SFGI + ' (start-of-frame guard time)');
        }
        if (Y & 4) {
          var TC = b[i++];
          var nadOK = !!(TC & 0x01);
          var cidOK = !!(TC & 0x02);
          html += row('TC(1)', '<span class="mono">0x' + TC.toString(16).toUpperCase().padStart(2,'0') + '</span>',
            'NAD ' + (nadOK ? 'supported' : 'not supported') + ' &middot; CID ' + (cidOK ? 'supported' : 'not supported'));
        }
        if (i < b.length) {
          var hist = b.slice(i);
          var ascii = hist.map(function(x){ return (x >= 0x20 && x <= 0x7E) ? String.fromCharCode(x) : '.'; }).join('');
          html += row('Historical bytes',
            '<span class="mono">' + hist.map(function(x){return x.toString(16).toUpperCase().padStart(2,'0');}).join(' ') + '</span>',
            hist.length + ' bytes &middot; ASCII view: <span class="mono">' + AS.escHTML(ascii) + '</span>');
        }
        output.innerHTML = html;
      } catch (e) { AS.renderError(output, e.message); }
    }
    input.addEventListener('input', go);
    if (sample) sample.addEventListener('click', function () {
      // typical DESFire ATS
      input.value = '06 75 77 81 02 80';
      go();
    });
    if (clearBtn) clearBtn.addEventListener('click', function () { input.value=''; go(); input.focus(); });
    go();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
