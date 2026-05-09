/* AmbiSecure — APDU script validator (validation-only).
   Multi-line APDU script. For each line:
     - Strips comments after '#' or ';'
     - Decodes CLA/INS/P1/P2 + Lc/Le per ISO 7816-4 case 1-4 (short / extended)
     - Reports per-line VALID / INVALID with reason
   No execution. No simulator. Static check only. */
(function () {
  'use strict';

  function clean(hex) { return String(hex).replace(/0x/gi,'').replace(/[\s,;:_]+/g,'').toLowerCase(); }
  function toBytes(hex) {
    if (hex === '') return [];
    if (hex.length % 2 !== 0) throw new Error('Hex length must be even.');
    if (!/^[0-9a-f]*$/.test(hex)) throw new Error('Non-hex characters.');
    var b = []; for (var i = 0; i < hex.length; i += 2) b.push(parseInt(hex.substr(i, 2), 16));
    return b;
  }

  function classifyAPDU(b) {
    if (b.length < 4) throw new Error('APDU shorter than 4 bytes (need CLA INS P1 P2).');
    var cla = b[0], ins = b[1], p1 = b[2], p2 = b[3];
    var rest = b.slice(4);
    if (rest.length === 0) {
      return { case: 1, cla: cla, ins: ins, p1: p1, p2: p2, lc: 0, data: [], le: null, total: 4 };
    }
    if (rest.length === 1) {
      // Case 2 short: just Le (one byte; 0x00 means 256)
      var leB = rest[0];
      return { case: 2, cla: cla, ins: ins, p1: p1, p2: p2, lc: 0, data: [], le: leB === 0 ? 256 : leB, leBytes: 1, total: 5 };
    }
    var first = rest[0];
    if (first !== 0 && first !== 0x00) {
      // Short Lc
      var lc = first;
      if (rest.length < 1 + lc) throw new Error('Short Lc=' + lc + ' but only ' + (rest.length - 1) + ' data bytes.');
      var data = rest.slice(1, 1 + lc);
      var trail = rest.slice(1 + lc);
      if (trail.length === 0) return { case: 3, cla: cla, ins: ins, p1: p1, p2: p2, lc: lc, data: data, le: null, total: 4 + 1 + lc };
      if (trail.length === 1) {
        var le = trail[0]; if (le === 0) le = 256;
        return { case: 4, cla: cla, ins: ins, p1: p1, p2: p2, lc: lc, data: data, le: le, leBytes: 1, total: 4 + 1 + lc + 1 };
      }
      throw new Error('Short Lc consumes data but ' + trail.length + ' trailing bytes (expected 0 or 1 Le).');
    }
    // Extended length: rest[0] === 0; rest[1..2] = Lc-extended, then data, then optional 2-byte Le
    if (rest.length === 3) {
      var leExt = (rest[1] << 8) | rest[2]; if (leExt === 0) leExt = 65536;
      return { case: 2, extended: true, cla: cla, ins: ins, p1: p1, p2: p2, lc: 0, data: [], le: leExt, leBytes: 3, total: 7 };
    }
    if (rest.length < 3) throw new Error('Body starts with 0x00 (extended) but too short for Lc.');
    var lcExt = (rest[1] << 8) | rest[2];
    if (rest.length < 3 + lcExt) throw new Error('Extended Lc=' + lcExt + ' but only ' + (rest.length - 3) + ' bytes remaining.');
    var dataE = rest.slice(3, 3 + lcExt);
    var trailE = rest.slice(3 + lcExt);
    if (trailE.length === 0) return { case: 3, extended: true, cla: cla, ins: ins, p1: p1, p2: p2, lc: lcExt, data: dataE, le: null, total: 4 + 3 + lcExt };
    if (trailE.length === 2) {
      var leE = (trailE[0] << 8) | trailE[1]; if (leE === 0) leE = 65536;
      return { case: 4, extended: true, cla: cla, ins: ins, p1: p1, p2: p2, lc: lcExt, data: dataE, le: leE, leBytes: 2, total: 4 + 3 + lcExt + 2 };
    }
    throw new Error('Extended Lc consumes data but ' + trailE.length + ' trailing bytes (expected 0 or 2 Le).');
  }

  function classifyCLA(cla) {
    if (cla === 0xFF) return 'reserved (PPS)';
    if ((cla & 0x80) === 0) return 'interindustry';
    return 'proprietary';
  }

  function init() {
    var input = AS.$('asv-input'), output = AS.$('asv-output');
    var sample = AS.$('asv-sample'), clearBtn = AS.$('asv-clear');
    if (!input || !output) return;

    function go() {
      var raw = (input.value || '');
      if (!raw.trim()) { AS.renderPlaceholder(output, 'Paste an APDU script — one APDU per line. Lines starting with # or after ; are treated as comments.'); return; }
      var lines = raw.split(/\r?\n/);
      var rows = [];
      var validCount = 0, invalidCount = 0;
      for (var idx = 0; idx < lines.length; idx++) {
        var rawLine = lines[idx];
        var stripped = rawLine.replace(/[#;].*$/, '').trim();
        if (!stripped) continue;
        var hex = clean(stripped);
        try {
          var b = toBytes(hex);
          var info = classifyAPDU(b);
          var leNote = info.le === null ? '—' : String(info.le) + (info.extended ? ' (extended)' : '');
          rows.push({
            ok: true,
            n: idx + 1,
            input: stripped,
            badge: 'tech-badge--ok',
            label: 'CASE ' + info.case + (info.extended ? ' (ext)' : ''),
            cla: '0x' + info.cla.toString(16).toUpperCase().padStart(2, '0') + ' (' + classifyCLA(info.cla) + ')',
            ins: '0x' + info.ins.toString(16).toUpperCase().padStart(2, '0'),
            p1p2: '0x' + info.p1.toString(16).toUpperCase().padStart(2,'0') + ' 0x' + info.p2.toString(16).toUpperCase().padStart(2,'0'),
            lc: info.lc + (info.extended && info.lc > 0 ? ' (extended)' : ''),
            le: leNote,
            total: info.total
          });
          validCount += 1;
        } catch (e) {
          rows.push({ ok: false, n: idx + 1, input: stripped, error: e.message });
          invalidCount += 1;
        }
      }
      var html = '<div style="margin-bottom:14px;"><span class="tech-badge tech-badge--ok">VALID ' + validCount + '</span> ' +
        '<span class="tech-badge ' + (invalidCount ? 'tech-badge--err' : '') + '">INVALID ' + invalidCount + '</span></div>';
      var t = '<table style="width:100%; border-collapse:collapse; font-family:Source Sans 3,sans-serif; font-size:12.5px;">' +
        '<thead><tr style="background:var(--brand-soft);">' +
        '<th style="text-align:left;padding:6px 10px;font-family:Montserrat,sans-serif;font-size:10.5px;text-transform:uppercase;letter-spacing:0.4px;">#</th>' +
        '<th style="text-align:left;padding:6px 10px;font-family:Montserrat,sans-serif;font-size:10.5px;text-transform:uppercase;letter-spacing:0.4px;">Status</th>' +
        '<th style="text-align:left;padding:6px 10px;font-family:Montserrat,sans-serif;font-size:10.5px;text-transform:uppercase;letter-spacing:0.4px;">Case / Detail</th>' +
        '</tr></thead><tbody>';
      rows.forEach(function (r) {
        if (r.ok) {
          t += '<tr style="border-bottom:1px dashed var(--line);">' +
            '<td style="padding:6px 10px; font-family:JetBrains Mono,monospace; color:var(--brand-grey);">' + r.n + '</td>' +
            '<td style="padding:6px 10px;"><span class="tech-badge ' + r.badge + '">' + r.label + '</span></td>' +
            '<td style="padding:6px 10px;">' +
              '<div class="mono" style="font-size:11.5px; color:var(--brand-grey);">' + AS.escHTML(r.input) + '</div>' +
              '<div style="font-size:12px; color:var(--ink); margin-top:4px;">CLA=' + r.cla + ' &middot; INS=' + r.ins + ' &middot; P1P2=' + r.p1p2 + ' &middot; Lc=' + r.lc + ' &middot; Le=' + r.le + ' &middot; total ' + r.total + ' bytes</div>' +
            '</td>' +
            '</tr>';
        } else {
          t += '<tr style="border-bottom:1px dashed var(--line);">' +
            '<td style="padding:6px 10px; font-family:JetBrains Mono,monospace; color:var(--brand-grey);">' + r.n + '</td>' +
            '<td style="padding:6px 10px;"><span class="tech-badge tech-badge--err">INVALID</span></td>' +
            '<td style="padding:6px 10px;">' +
              '<div class="mono" style="font-size:11.5px; color:var(--brand-grey);">' + AS.escHTML(r.input) + '</div>' +
              '<div style="font-size:12px; color:var(--brand-red-dark); margin-top:4px;">' + AS.escHTML(r.error) + '</div>' +
            '</td>' +
            '</tr>';
        }
      });
      t += '</tbody></table>';
      output.innerHTML = html + t +
        '<div class="note" style="margin-top:14px; padding:10px 14px; background:var(--brand-soft); border-radius:4px; font-size:12.5px;">' +
        '<strong>Validation only.</strong> This tool does not execute APDUs against any card. It checks shape (case 1-4, short / extended length) per ISO/IEC 7816-4.</div>';
    }
    input.addEventListener('input', go);
    if (sample) sample.addEventListener('click', function () {
      input.value = '# ISO 7816-4 sample script\n' +
        '00 A4 04 00 07 A0000000041010   ; SELECT MASTERCARD AID\n' +
        '80 50 00 00 08 1122334455667788 1F  ; INITIALIZE UPDATE\n' +
        '00 B0 00 00 00              ; READ BINARY (case 2 short)\n' +
        '0C E0 00 00 00 0001 11      ; bad: ext header but truncated';
      go();
    });
    if (clearBtn) clearBtn.addEventListener('click', function () { input.value=''; go(); input.focus(); });
    go();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
