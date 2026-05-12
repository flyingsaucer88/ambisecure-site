(function () {
  'use strict';

  function row(label, value, note) {
    return '<div class="parsed-row"><span class="label">' + label + '</span>' +
      '<div><div class="value">' + value + '</div>' + (note ? '<span class="note">' + note + '</span>' : '') + '</div></div>';
  }

  function decodeCLA(cla) {
    var out = { type: '', sm: '', chain: false, ch: 0, raw: cla, fields: [] };
    var b7 = (cla & 0x80) >> 7;
    var b6 = (cla & 0x40) >> 6;
    var b5 = (cla & 0x20) >> 5;
    var b4 = (cla & 0x10) >> 4;
    var b3 = (cla & 0x08) >> 3;
    var b2 = (cla & 0x04) >> 2;
    var b1 = (cla & 0x02) >> 1;
    var b0 = (cla & 0x01);

    if (cla === 0xFF) {
      out.type = 'reserved (PPS / proprietary)';
      out.note = '0xFF is reserved by ISO/IEC 7816-3 for the Protocol Parameter Selection (PPS) sequence and must not be used as a normal CLA.';
      return out;
    }

    if (b7 === 0) {

      if (b6 === 0) {
        out.type = 'interindustry — first interindustry values (X.b6=0)';
        out.fields.push({ name: 'Logical channel', bits: 'b1..b0 (low 2 bits)', value: cla & 0x03, note: 'Channel 0–3.' });
        out.fields.push({ name: 'Command chaining', bits: 'b4', value: b4, note: b4 ? 'YES — this is not the last command of a chain.' : 'NO (last command of any chain).' });
        var smBits = (cla >> 2) & 0x03;
        var smLabel = ['no SM',
                       'SM (proprietary, header not authenticated)',
                       'SM (header not authenticated)',
                       'SM (header authenticated)'][smBits];
        out.fields.push({ name: 'Secure messaging', bits: 'b3..b2', value: smBits, note: smLabel });
      } else {
        out.type = 'interindustry — further interindustry values (b7=0, b6=1)';
        out.fields.push({ name: 'Logical channel', bits: 'b3..b0 (low 4 bits) + 4', value: 4 + (cla & 0x0F), note: 'Channel 4–19.' });
        out.fields.push({ name: 'Secure messaging', bits: 'b5', value: b5, note: b5 ? 'SM applied (no further qualifier).' : 'no SM.' });
        out.fields.push({ name: 'Command chaining', bits: 'b4', value: b4, note: b4 ? 'YES (not last).' : 'NO (last).' });
      }
    } else {
      out.type = 'proprietary class (b7=1)';
      out.note = 'Proprietary CLA — semantics defined by the application or platform (e.g. GlobalPlatform 0x80/0x84, EMV proprietary). Not standardised.';
    }
    return out;
  }

  function init() {
    var input = AS.$('cla-input'), output = AS.$('cla-output');
    var sample = AS.$('cla-sample'), clearBtn = AS.$('cla-clear');
    if (!input || !output) return;

    function go() {
      var raw = (input.value || '').trim();
      if (!raw) { AS.renderPlaceholder(output, 'Enter a CLA byte (e.g. 00, 80, 84, 0C).'); return; }
      try {
        var s = raw.replace(/0x/i, '').replace(/[\s,]/g, '');
        if (!/^[0-9a-fA-F]{1,2}$/.test(s)) throw new Error('Enter a single hex byte.');
        var cla = parseInt(s, 16);
        var d = decodeCLA(cla);
        var html = '<div style="margin-bottom:14px;"><span class="tech-badge tech-badge--ok">CLA = 0x' + cla.toString(16).toUpperCase().padStart(2, '0') + '</span></div>';
        html += row('Binary', '<span class="mono">' + cla.toString(2).padStart(8, '0') + '</span>', 'b7..b0');
        html += row('Class type', d.type, d.note || '');
        d.fields.forEach(function (f) {
          html += row(f.name, '<span class="mono">' + f.value + '</span>', '<strong>' + f.bits + '</strong> &middot; ' + f.note);
        });

        var common = {
          0x00: 'Standard ISO interindustry, channel 0, no SM, no chaining.',
          0x0C: 'ISO interindustry, channel 0, SM with authenticated header, no chaining.',
          0x10: 'ISO interindustry, command chaining, channel 0.',
          0x80: 'Proprietary (commonly GlobalPlatform un-secured).',
          0x84: 'Proprietary with SM (e.g. GlobalPlatform secured by SCP02/SCP03).',
          0xE0: 'GlobalPlatform card-management (SCP02 wrapped).',
          0xFF: 'Reserved for PPS / not a valid CLA.'
        };
        if (common[cla]) {
          html += '<div class="note" style="margin-top:14px; padding:10px 14px; background:var(--secure-cyan-soft); border-left:3px solid var(--secure-cyan); border-radius:3px;"><strong>Common usage:</strong> ' + common[cla] + '</div>';
        }
        output.innerHTML = html;
      } catch (e) { AS.renderError(output, e.message); }
    }
    input.addEventListener('input', go);
    if (sample) sample.addEventListener('click', function () { input.value = '0C'; go(); });
    if (clearBtn) clearBtn.addEventListener('click', function () { input.value=''; go(); input.focus(); });
    go();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
