(function () {
  'use strict';

  function clean(hex) { return (hex || '').replace(/0x/gi, '').replace(/[\s,;:_-]+/g, '').toLowerCase(); }
  function toBytes(hex) {
    var s = clean(hex);
    if (s.length % 2 !== 0) throw new Error('Hex length must be even (got ' + s.length + ' nibbles).');
    if (!/^[0-9a-f]*$/.test(s)) throw new Error('Non-hex characters in input.');
    var out = [];
    for (var i = 0; i < s.length; i += 2) out.push(parseInt(s.substr(i, 2), 16));
    return out;
  }
  function hex(b, w) { var x = b.toString(16).toUpperCase(); while (w && x.length < w) x = '0' + x; return x; }


  function parseATR(bytes) {
    var fields = [];
    var i = 0;
    if (bytes.length < 2) throw new Error('ATR must be at least 2 bytes (TS + T0).');


    var TS = bytes[i++];
    var conv = TS === 0x3B ? 'Direct' : (TS === 0x3F ? 'Inverse' : 'Unknown (expected 0x3B or 0x3F)');
    fields.push({
      label: 'TS',
      value: '0x' + hex(TS, 2),
      note: 'Initial character &mdash; ' + conv + ' convention.',
      tone: TS === 0x3B || TS === 0x3F ? 'ok' : 'warn'
    });

    if (i >= bytes.length) throw new Error('Truncated after TS.');
    var T0 = bytes[i++];
    var Y1 = (T0 >> 4) & 0x0F;
    var K = T0 & 0x0F;
    fields.push({
      label: 'T0',
      value: '0x' + hex(T0, 2),
      note: 'Format byte. Y1 = 0x' + hex(Y1, 1) + ' (which TA1/TB1/TC1/TD1 follow). K = ' + K + ' historical bytes.',
      tone: 'info'
    });

    var T_protocols = [];
    var Y = Y1;
    var idx = 1;
    var Tprev = -1;

    while (Y !== 0) {
      var letters = ['TA', 'TB', 'TC', 'TD'];
      for (var bit = 0; bit < 4; bit++) {
        if (Y & (1 << bit)) {
          if (i >= bytes.length) throw new Error('Truncated within interface bytes (expected ' + letters[bit] + idx + ').');
          var b = bytes[i++];
          var label = letters[bit] + idx;
          var note = '';
          var tone = 'info';
          if (label === 'TA1') {
            var Fi = (b >> 4) & 0x0F;
            var Di = b & 0x0F;
            note = 'Fi index = ' + Fi + ', Di index = ' + Di + ' (clock-rate / bit-rate adjustment).';
          } else if (label === 'TB1') {
            note = 'Programming voltage / current (deprecated; should be 0x00 on modern cards).';
          } else if (label === 'TC1') {
            note = 'Extra guard time = ' + b + ' ETU.';
          } else if (letters[bit] === 'TD') {
            var nextT = b & 0x0F;
            T_protocols.push(nextT);
            note = 'Next set follows. Indicated protocol T = ' + nextT + '.';
          } else if (label.indexOf('TA') === 0 && Tprev === 1) {
            note = 'IFSC for T=1 = ' + b + ' bytes.';
          } else if (label.indexOf('TB') === 0 && Tprev === 1) {
            var BWI = (b >> 4) & 0x0F;
            var CWI = b & 0x0F;
            note = 'BWI = ' + BWI + ', CWI = ' + CWI + ' (block / character waiting time, T=1).';
          } else if (label.indexOf('TC') === 0 && Tprev === 1) {
            note = (b & 0x01) ? 'Error detection: CRC.' : 'Error detection: LRC.';
          }
          fields.push({ label: label, value: '0x' + hex(b, 2), note: note, tone: tone });
        }
      }
      if (Y & 0x08) {

        var lastTd = T_protocols[T_protocols.length - 1];
        Tprev = lastTd;




        var tdLabel = 'TD' + idx;
        var tdField = null;
        for (var j = fields.length - 1; j >= 0; j--) { if (fields[j].label === tdLabel) { tdField = fields[j]; break; } }
        var tdByte = tdField ? parseInt(tdField.value.replace('0x', ''), 16) : 0;
        Y = (tdByte >> 4) & 0x0F;
      } else {
        Y = 0;
      }
      idx++;
      if (idx > 8) throw new Error('Interface byte loop runaway.');
    }


    if (i + K > bytes.length) throw new Error('Declared ' + K + ' historical bytes but only ' + (bytes.length - i) + ' remain.');
    if (K > 0) {
      var hist = bytes.slice(i, i + K);
      var histHex = hist.map(function (b) { return hex(b, 2); }).join(' ');
      var ascii = hist.map(function (b) { return (b >= 0x20 && b <= 0x7E) ? String.fromCharCode(b) : '.'; }).join('');
      fields.push({
        label: 'Historical',
        value: histHex,
        note: K + ' bytes &middot; ASCII-printable view: <span class="mono">' + escHTML(ascii) + '</span>',
        tone: 'info'
      });
      i += K;
    } else {
      fields.push({ label: 'Historical', value: '(none)', note: 'K = 0, no historical bytes present.', tone: 'info' });
    }


    var nonT0 = T_protocols.some(function (t) { return t !== 0; });
    if (nonT0 || i < bytes.length) {
      if (i < bytes.length) {
        var TCK = bytes[i++];
        var xor = 0;
        for (var k = 1; k < bytes.length - 1; k++) xor ^= bytes[k];
        var matches = (xor === TCK);
        fields.push({
          label: 'TCK',
          value: '0x' + hex(TCK, 2),
          note: matches ? 'Check byte verifies (XOR of T0..last = TCK).' : 'Check byte does NOT verify. Computed XOR = 0x' + hex(xor, 2) + '.',
          tone: matches ? 'ok' : 'err'
        });
      }
    }

    if (i < bytes.length) {
      fields.push({
        label: 'Trailing',
        value: bytes.slice(i).map(function (b) { return hex(b, 2); }).join(' '),
        note: 'Unexpected trailing bytes.',
        tone: 'warn'
      });
    }

    return {
      ok: true,
      fields: fields,
      raw: bytes.map(function (b) { return hex(b, 2); }).join(' '),
      protocols: T_protocols.length ? T_protocols : [0]
    };
  }

  function escHTML(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function render(parsed, container) {
    var protos = parsed.protocols.map(function (p) { return 'T=' + p; }).join(', ');
    var html = '';
    html += '<div style="margin-bottom: 14px;">';
    html += '<span class="tech-badge tech-badge--ok">VALID ATR</span> ';
    html += '<span class="tech-badge tech-badge--info">PROTOCOLS &middot; ' + escHTML(protos) + '</span> ';
    html += '<span class="tech-badge">' + parsed.raw.split(' ').length + ' bytes</span>';
    html += '</div>';

    parsed.fields.forEach(function (f) {
      html += '<div class="parsed-row">';
      html += '<span class="label">' + escHTML(f.label) + '</span>';
      html += '<div><div class="value">' + escHTML(f.value) + '</div>';
      if (f.note) html += '<span class="note">' + f.note + '</span>';
      html += '</div></div>';
    });

    container.innerHTML = html;
  }

  function renderError(msg, container) {
    container.innerHTML = '<div style="margin-bottom:10px;"><span class="tech-badge tech-badge--err">PARSE ERROR</span></div>' +
      '<div class="parsed-row"><span class="label">Error</span><div class="value">' + escHTML(msg) + '</div></div>';
  }

  function init() {
    var input = document.getElementById('atr-input');
    var output = document.getElementById('atr-output');
    var sample = document.getElementById('atr-sample');
    var clearBtn = document.getElementById('atr-clear');
    var copyBtn = document.getElementById('atr-copy');

    if (!input || !output) return;

    function go() {
      var raw = input.value.trim();
      if (!raw) {
        output.innerHTML = '<div class="placeholder">Paste an ATR to see it parsed.</div>';
        return;
      }
      try {
        var bytes = toBytes(raw);
        var parsed = parseATR(bytes);
        render(parsed, output);
      } catch (e) {
        renderError(e.message || String(e), output);
      }
    }

    input.addEventListener('input', go);

    if (sample) sample.addEventListener('click', function () {
      input.value = '3B 8F 80 01 80 4F 0C A0 00 00 03 06 03 00 01 00 00 00 00 6A';
      go();
    });
    if (clearBtn) clearBtn.addEventListener('click', function () { input.value = ''; go(); input.focus(); });
    if (copyBtn) copyBtn.addEventListener('click', function () {
      navigator.clipboard && navigator.clipboard.writeText(output.innerText || '');
    });

    go();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
