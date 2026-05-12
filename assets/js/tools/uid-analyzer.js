(function () {
  'use strict';


  var MFG = {
    0x00: '(reserved)',
    0x02: 'STMicroelectronics',
    0x04: 'NXP Semiconductors',
    0x05: 'Infineon',
    0x06: 'Cylink',
    0x09: 'Honeywell',
    0x0E: 'C2C',
    0x16: 'Texas Instruments',
    0x18: 'Toshiba',
    0x19: 'Samsung',
    0x1F: 'AMP Incorporated',
    0x20: 'Hitachi',
    0x29: 'Inside Secure',
    0x33: 'AKM',
    0x34: 'Semiconductor Manufacturing International',
    0x44: 'Watchdata',
    0x47: 'Renesas',
    0x4A: 'Tongfang',
    0x4F: 'SonyMobile',
    0x52: 'Solar Turbines',
    0x80: 'Innovision'
  };

  function clean(hex) { return String(hex).replace(/0x/gi,'').replace(/[\s,;:_-]+/g,'').toLowerCase(); }
  function toBytes(hex) {
    var s = clean(hex);
    if (s.length % 2 !== 0) throw new Error('Hex length must be even.');
    if (!/^[0-9a-f]*$/.test(s)) throw new Error('Non-hex characters.');
    var b = []; for (var i = 0; i < s.length; i += 2) b.push(parseInt(s.substr(i, 2), 16));
    return b;
  }

  function init() {
    var input = AS.$('uid-input'), output = AS.$('uid-output');
    var sample = AS.$('uid-sample'), clearBtn = AS.$('uid-clear');
    if (!input || !output) return;

    function row(label, value, note) {
      return '<div class="parsed-row"><span class="label">' + label + '</span>' +
        '<div><div class="value">' + value + '</div>' +
        (note ? '<span class="note">' + note + '</span>' : '') + '</div></div>';
    }

    function go() {
      var raw = (input.value || '').trim();
      if (!raw) { AS.renderPlaceholder(output, 'Paste a 4 / 7 / 10-byte hex UID.'); return; }
      try {
        var b = toBytes(raw);
        var len = b.length;
        if (len !== 4 && len !== 7 && len !== 10) throw new Error('Length ' + len + ' bytes — expected 4, 7, or 10.');
        var tone = 'ok', kindBadge, cascade;
        if (len === 4) {
          cascade = 'Single (4 byte)';
          if (b[0] === 0x08) {
            kindBadge = '<span class="tech-badge tech-badge--warn">RANDOM ID (RID)</span>';
            tone = 'warn';
          } else if (b[0] === 0x00) {
            kindBadge = '<span class="tech-badge tech-badge--info">FIXED · vendor unknown (00)</span>';
          } else {
            kindBadge = '<span class="tech-badge tech-badge--info">FIXED · vendor=0x' + b[0].toString(16).toUpperCase() + '</span>';
          }
        } else if (len === 7) {
          cascade = 'Double (7 byte)';
          kindBadge = '<span class="tech-badge tech-badge--ok">UNIQUE — vendor=0x' + b[0].toString(16).toUpperCase() + '</span>';
        } else {
          cascade = 'Triple (10 byte)';
          kindBadge = '<span class="tech-badge tech-badge--ok">UNIQUE — vendor=0x' + b[0].toString(16).toUpperCase() + '</span>';
        }
        var vendor = MFG[b[0]] || '(unknown / not in built-in dictionary)';

        var html = '<div style="margin-bottom:14px;">' + kindBadge + ' <span class="tech-badge tech-badge--info">' + cascade + '</span></div>';
        html += row('UID', '<span class="mono">' + b.map(function(x){return x.toString(16).toUpperCase().padStart(2,'0');}).join(' ') + '</span>');
        html += row('Manufacturer ID',
          '<span class="mono">0x' + b[0].toString(16).toUpperCase().padStart(2,'0') + '</span>',
          AS.escHTML(vendor));
        if (len === 4 && b[0] === 0x08) {
          html += row('Notes', '<em>nUID / random UID — re-randomised on each anti-collision sequence; not unique across power cycles unless the card is configured for fixed RID.</em>');
        }
        if (len >= 7) {
          html += row('Bytes 1..n', b.slice(1).map(function(x){return x.toString(16).toUpperCase().padStart(2,'0');}).join(' '), 'serial-number portion');
        }
        output.innerHTML = html;
      } catch (e) { AS.renderError(output, e.message); }
    }
    input.addEventListener('input', go);
    if (sample) sample.addEventListener('click', function () { input.value = '04 8A 1B 22 3C 4D 80'; go(); });
    if (clearBtn) clearBtn.addEventListener('click', function () { input.value=''; go(); input.focus(); });
    go();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
