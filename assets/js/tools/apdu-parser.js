(function () {
  'use strict';


  var INS_DICT = {
    0x04: 'DEACTIVATE FILE',
    0x0C: 'ERASE RECORD',
    0x0E: 'ERASE BINARY',
    0x10: 'PERFORM SCQL OPERATION',
    0x12: 'PERFORM TRANSACTION OP',
    0x14: 'PERFORM USER OP',
    0x20: 'VERIFY',
    0x21: 'VERIFY (variant)',
    0x22: 'MANAGE SECURITY ENVIRONMENT',
    0x24: 'CHANGE REFERENCE DATA',
    0x26: 'DISABLE VERIFICATION',
    0x28: 'ENABLE VERIFICATION',
    0x2A: 'PERFORM SECURITY OPERATION',
    0x2C: 'RESET RETRY COUNTER',
    0x44: 'ACTIVATE FILE',
    0x46: 'GENERATE ASYMMETRIC KEY PAIR',
    0x70: 'MANAGE CHANNEL',
    0x82: 'EXTERNAL AUTHENTICATE',
    0x84: 'GET CHALLENGE',
    0x86: 'GENERAL AUTHENTICATE',
    0x87: 'GENERAL AUTHENTICATE (variant)',
    0x88: 'INTERNAL AUTHENTICATE',
    0xA0: 'SEARCH BINARY',
    0xA2: 'SEARCH RECORD',
    0xA4: 'SELECT (FILE / AID)',
    0xB0: 'READ BINARY',
    0xB1: 'READ BINARY (variant)',
    0xB2: 'READ RECORD',
    0xB3: 'READ RECORD (variant)',
    0xC0: 'GET RESPONSE',
    0xC2: 'ENVELOPE',
    0xC3: 'ENVELOPE (variant)',
    0xCA: 'GET DATA',
    0xCB: 'GET DATA (variant)',
    0xD0: 'WRITE BINARY',
    0xD1: 'WRITE BINARY (variant)',
    0xD2: 'WRITE RECORD',
    0xD6: 'UPDATE BINARY',
    0xD7: 'UPDATE BINARY (variant)',
    0xDA: 'PUT DATA',
    0xDB: 'PUT DATA (variant)',
    0xDC: 'UPDATE RECORD',
    0xDD: 'UPDATE RECORD (variant)',
    0xE0: 'CREATE FILE',
    0xE2: 'APPEND RECORD',
    0xE4: 'DELETE FILE',
    0xE6: 'TERMINATE DF',
    0xE8: 'TERMINATE EF',
    0xF2: 'STATUS',
    0xFE: 'TERMINATE CARD USAGE',

    0x50: 'INITIALIZE UPDATE (GP)',
    0x80: 'GP variants — see CLA',
    0xE4: 'DELETE (GP)',
    0xE6: 'INSTALL (GP) / TERMINATE',
    0xE8: 'LOAD (GP) / TERMINATE EF',
    0xF0: 'SET STATUS (GP)',
    0xF2: 'GET STATUS (GP)'
  };


  var SW = {
    '9000': 'Normal — no further qualification.',
    '6100': 'Normal, with bytes available (SW2 = number of bytes).',
    '6200': 'Warning — state of NV memory unchanged.',
    '6281': 'Part of returned data may be corrupted.',
    '6282': 'End of file/record reached before reading Le bytes.',
    '6283': 'Selected file invalidated.',
    '6285': 'File terminated.',
    '6300': 'Warning — state of NV memory changed.',
    '6381': 'File filled by last write.',
    '6382': 'Unsuccessful comparison (verification failed).',
    '6400': 'Execution error — state unchanged.',
    '6500': 'Execution error — state may have changed.',
    '6581': 'Memory failure.',
    '6700': 'Wrong length (Le or Lc).',
    '6800': 'Function in CLA not supported.',
    '6881': 'Logical channel not supported.',
    '6882': 'Secure messaging not supported.',
    '6900': 'Command not allowed.',
    '6981': 'Command incompatible with file structure.',
    '6982': 'Security status not satisfied.',
    '6983': 'Authentication method blocked.',
    '6984': 'Reference data invalidated.',
    '6985': 'Conditions of use not satisfied.',
    '6986': 'Command not allowed (no current EF).',
    '6987': 'Expected secure messaging data objects missing.',
    '6988': 'Incorrect secure messaging data objects.',
    '6A00': 'Wrong parameter(s) P1-P2.',
    '6A80': 'Incorrect parameters in data field.',
    '6A81': 'Function not supported.',
    '6A82': 'File not found.',
    '6A83': 'Record not found.',
    '6A84': 'Not enough memory space in the file.',
    '6A85': 'Lc inconsistent with TLV structure.',
    '6A86': 'Incorrect parameters P1-P2.',
    '6A87': 'Lc inconsistent with P1-P2.',
    '6A88': 'Referenced data not found.',
    '6A89': 'File already exists.',
    '6A8A': 'DF name already exists.',
    '6B00': 'Wrong parameter(s) P1-P2 (out of range).',
    '6C00': 'Wrong length Le — exact length in SW2.',
    '6D00': 'Instruction code not supported or invalid.',
    '6E00': 'Class not supported.',
    '6F00': 'No precise diagnosis.'
  };

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
  function escHTML(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  function classifyCLA(cla) {
    var note = [];
    var top = (cla >> 4) & 0x0F;
    if (top === 0x0) note.push('Inter-industry, ISO/IEC 7816-4');
    else if (top >= 0x8 && top <= 0xB) note.push('Proprietary CLA range');
    else if (top === 0xC || top === 0xD || top === 0xE) note.push('Reserved / proprietary');
    else note.push('CLA top nibble 0x' + hex(top, 1));

    if ((cla & 0x0C) === 0x04) note.push('Secure messaging — proprietary header');
    if ((cla & 0x0C) === 0x08) note.push('Secure messaging — header authenticated');
    if ((cla & 0x0C) === 0x0C) note.push('Secure messaging — full');
    var ch = cla & 0x03;
    note.push('Logical channel ' + ch);
    if ((cla & 0xE0) === 0x80) note.push('GlobalPlatform CLA pattern (0x80)');
    return note.join(' &middot; ');
  }

  function describeSelectP1(p1, p2) {
    var p1Map = {
      0x00: 'Select MF, DF or EF (by file ID, or implicit)',
      0x01: 'Select child DF',
      0x02: 'Select EF under current DF',
      0x03: 'Select parent DF',
      0x04: 'Select by DF name (AID)',
      0x08: 'Select by path from MF',
      0x09: 'Select by path from current DF'
    };
    var p2Bits = [];
    var occ = p2 & 0x03;
    if (occ === 0x00) p2Bits.push('first or only occurrence');
    else if (occ === 0x01) p2Bits.push('last occurrence');
    else if (occ === 0x02) p2Bits.push('next occurrence');
    else if (occ === 0x03) p2Bits.push('previous occurrence');
    var fci = (p2 >> 2) & 0x03;
    if (fci === 0x00) p2Bits.push('return FCI');
    else if (fci === 0x01) p2Bits.push('return FCP');
    else if (fci === 0x02) p2Bits.push('return FMD');
    else p2Bits.push('no response data');
    return (p1Map[p1] || ('P1 = 0x' + hex(p1, 2))) + ' &middot; ' + p2Bits.join(', ');
  }

  function lookupINS(ins) { return INS_DICT[ins] || null; }

  function parseAPDU(bytes, mode) {
    var fields = [];


    if (mode === 'response' || (bytes.length === 2 && (bytes[0] >= 0x60 && bytes[0] <= 0x9F))) {
      return parseResponse(bytes);
    }

    if (bytes.length < 4) throw new Error('Command APDU is at least 4 bytes (header CLA INS P1 P2).');

    var CLA = bytes[0], INS = bytes[1], P1 = bytes[2], P2 = bytes[3];
    fields.push({ label: 'CLA', value: '0x' + hex(CLA, 2), note: classifyCLA(CLA), tone: 'info' });
    var insName = lookupINS(INS);
    fields.push({ label: 'INS', value: '0x' + hex(INS, 2), note: insName ? '<strong>' + escHTML(insName) + '</strong>' : 'Unknown / proprietary INS.', tone: insName ? 'ok' : 'warn' });
    var p1note = '', p2note = '';
    if (INS === 0xA4) {
      p1note = describeSelectP1(P1, P2).split(' &middot; ')[0];
      p2note = describeSelectP1(P1, P2).split(' &middot; ').slice(1).join(' &middot; ');
    }
    fields.push({ label: 'P1', value: '0x' + hex(P1, 2), note: p1note, tone: 'info' });
    fields.push({ label: 'P2', value: '0x' + hex(P2, 2), note: p2note, tone: 'info' });

    var i = 4;
    var Lc = null, data = null, Le = null, caseName = null, extended = false;

    if (i === bytes.length) {

      caseName = 'Case 1';
    } else if (i + 1 === bytes.length) {

      Le = bytes[i] === 0 ? 256 : bytes[i];
      caseName = 'Case 2 (short)';
    } else {

      var lenByte = bytes[i];
      if (lenByte === 0x00 && (bytes.length - i) >= 3) {

        extended = true;
        if (bytes.length - i === 3) {

          Le = (bytes[i + 1] << 8) | bytes[i + 2];
          if (Le === 0) Le = 65536;
          caseName = 'Case 2 (extended)';
          i += 3;
        } else {
          var Lc16 = (bytes[i + 1] << 8) | bytes[i + 2];
          if (Lc16 === 0) throw new Error('Extended Lc is zero.');
          Lc = Lc16;
          i += 3;
          if (i + Lc > bytes.length) throw new Error('Extended Lc=' + Lc + ' exceeds remaining ' + (bytes.length - i) + ' bytes.');
          data = bytes.slice(i, i + Lc);
          i += Lc;
          if (i + 2 === bytes.length) {
            Le = (bytes[i] << 8) | bytes[i + 1];
            if (Le === 0) Le = 65536;
            caseName = 'Case 4 (extended)';
            i += 2;
          } else if (i === bytes.length) {
            caseName = 'Case 3 (extended)';
          } else {
            throw new Error('Trailing bytes after extended Case 4 Le.');
          }
        }
      } else {
        Lc = lenByte;
        i += 1;
        if (i + Lc > bytes.length) throw new Error('Short Lc=' + Lc + ' exceeds remaining ' + (bytes.length - i) + ' bytes.');
        data = bytes.slice(i, i + Lc);
        i += Lc;
        if (i === bytes.length) caseName = 'Case 3 (short)';
        else if (i + 1 === bytes.length) {
          Le = bytes[i] === 0 ? 256 : bytes[i];
          caseName = 'Case 4 (short)';
          i += 1;
        } else {
          throw new Error('Trailing bytes after Case 4 short Le.');
        }
      }
    }

    if (Lc !== null) {
      var dataHex = data.map(function (b) { return hex(b, 2); }).join(' ');
      fields.push({ label: 'Lc', value: (extended ? '00 ' + hex((Lc >> 8) & 0xFF, 2) + ' ' + hex(Lc & 0xFF, 2) : hex(Lc, 2)), note: Lc + ' bytes' + (extended ? ' (extended length)' : ''), tone: 'info' });
      fields.push({ label: 'Data', value: dataHex || '(empty)', note: 'Command body.', tone: 'info' });
    }
    if (Le !== null) {
      var leDisp;
      if (caseName.indexOf('extended') !== -1) {
        if (Lc === null) leDisp = '00 ' + hex((Le >> 8) & 0xFF, 2) + ' ' + hex(Le & 0xFF, 2);
        else leDisp = hex((Le >> 8) & 0xFF, 2) + ' ' + hex(Le & 0xFF, 2);
      } else {
        leDisp = hex(Le === 256 ? 0 : Le, 2);
      }
      fields.push({ label: 'Le', value: leDisp, note: 'Expected response length: ' + Le + ' bytes (' + (Le === 256 || Le === 65536 ? 'maximum' : 'exact') + ').', tone: 'info' });
    }

    fields.unshift({ label: 'Case', value: caseName, note: 'ISO/IEC 7816-4 command structure.', tone: 'ok' });

    return { kind: 'command', fields: fields, raw: bytes.map(function (b) { return hex(b, 2); }).join(' ') };
  }

  function parseResponse(bytes) {
    var fields = [];
    if (bytes.length < 2) throw new Error('Response APDU is at least 2 bytes (SW1 SW2).');
    var data = bytes.slice(0, bytes.length - 2);
    var SW1 = bytes[bytes.length - 2];
    var SW2 = bytes[bytes.length - 1];
    var swKey = hex(SW1, 2) + hex(SW2, 2);
    var swMeaning = SW[swKey];
    if (!swMeaning) {

      var wildcard = hex(SW1, 2) + '00';
      if (SW[wildcard]) swMeaning = SW[wildcard] + ' (SW2 = 0x' + hex(SW2, 2) + ')';
    }
    fields.push({
      label: 'Status',
      value: '0x' + swKey,
      note: swMeaning ? '<strong>' + escHTML(swMeaning) + '</strong>' : 'Status word not in built-in dictionary.',
      tone: swKey === '9000' ? 'ok' : (SW1 === 0x61 || SW1 === 0x62 || SW1 === 0x63 ? 'warn' : (SW1 >= 0x64 ? 'err' : 'info'))
    });
    if (data.length) {
      var dh = data.map(function (b) { return hex(b, 2); }).join(' ');
      var ascii = data.map(function (b) { return (b >= 0x20 && b <= 0x7E) ? String.fromCharCode(b) : '.'; }).join('');
      fields.push({ label: 'Data', value: dh, note: data.length + ' bytes &middot; ASCII: <span class="mono">' + escHTML(ascii) + '</span>', tone: 'info' });
    }
    return { kind: 'response', fields: fields, raw: bytes.map(function (b) { return hex(b, 2); }).join(' ') };
  }

  function render(parsed, container) {
    var kindBadge = parsed.kind === 'command'
      ? '<span class="tech-badge tech-badge--info">COMMAND APDU</span>'
      : '<span class="tech-badge tech-badge--ok">RESPONSE APDU</span>';
    var html = '<div style="margin-bottom:14px;">' + kindBadge + ' <span class="tech-badge">' + parsed.raw.split(' ').length + ' bytes</span></div>';
    parsed.fields.forEach(function (f) {
      html += '<div class="parsed-row">';
      html += '<span class="label">' + escHTML(f.label) + '</span>';
      html += '<div><div class="value">';
      if (f.tone) html += '<span class="tech-badge tech-badge--' + f.tone + '" style="margin-right:6px;">' + escHTML(f.value) + '</span>';
      else html += escHTML(f.value);
      html += '</div>';
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
    var input = document.getElementById('apdu-input');
    var output = document.getElementById('apdu-output');
    var modeSel = document.getElementById('apdu-mode');
    var sample = document.getElementById('apdu-sample');
    var sampleResp = document.getElementById('apdu-sample-resp');
    var clearBtn = document.getElementById('apdu-clear');
    if (!input || !output) return;

    function go() {
      var raw = input.value.trim();
      if (!raw) {
        output.innerHTML = '<div class="placeholder">Paste a command or response APDU to see it parsed.</div>';
        return;
      }
      try {
        var bytes = toBytes(raw);
        var mode = modeSel ? modeSel.value : 'auto';
        var parsed = parseAPDU(bytes, mode === 'auto' ? null : mode);
        render(parsed, output);
      } catch (e) {
        renderError(e.message || String(e), output);
      }
    }

    input.addEventListener('input', go);
    if (modeSel) modeSel.addEventListener('change', go);

    if (sample) sample.addEventListener('click', function () {
      input.value = '00 A4 04 00 07 A0 00 00 00 03 10 10 00';
      if (modeSel) modeSel.value = 'command';
      go();
    });
    if (sampleResp) sampleResp.addEventListener('click', function () {
      input.value = '6F 1E 84 07 A0 00 00 00 03 10 10 A5 13 50 0A 56 49 53 41 20 44 45 42 49 54 87 01 02 9F 38 03 9F 1A 02 90 00';
      if (modeSel) modeSel.value = 'response';
      go();
    });
    if (clearBtn) clearBtn.addEventListener('click', function () { input.value = ''; go(); input.focus(); });
    go();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
