(function () {
  'use strict';

  function cleanHex(s) {
    return String(s == null ? '' : s).replace(/0x/gi, '').replace(/[\s,;:_-]+/g, '').toLowerCase();
  }

  function byteFromHex(s, label) {
    var c = cleanHex(s);
    if (c === '') throw new Error(label + ' is required (2 hex digits).');
    if (!/^[0-9a-f]+$/.test(c)) throw new Error(label + ' contains non-hex characters.');
    if (c.length !== 2) throw new Error(label + ' must be exactly 2 hex digits (one byte), got ' + c.length + '.');
    return parseInt(c, 16);
  }

  function dataBytes(s) {
    var c = cleanHex(s);
    if (c === '') return [];
    if (!/^[0-9a-f]+$/.test(c)) throw new Error('Command data contains non-hex characters.');
    if (c.length % 2 !== 0) throw new Error('Command data must be whole bytes (even number of hex digits).');
    var out = [];
    for (var i = 0; i < c.length; i += 2) out.push(parseInt(c.substr(i, 2), 16));
    return out;
  }

  function hx(b, w) {
    var x = b.toString(16).toUpperCase();
    while (w && x.length < w) x = '0' + x;
    return x;
  }

  function joinHex(arr) {
    return arr.map(function (b) { return hx(b, 2); }).join(' ');
  }

  // Build a command APDU from structured fields.
  // fields: { cla, ins, p1, p2 (numbers 0..255), data (array of bytes), le (number|null) }
  // Returns { bytes, caseName, extended, lc, le, parts }
  function buildApdu(fields) {
    var cla = fields.cla, ins = fields.ins, p1 = fields.p1, p2 = fields.p2;
    [['CLA', cla], ['INS', ins], ['P1', p1], ['P2', p2]].forEach(function (pair) {
      if (typeof pair[1] !== 'number' || pair[1] < 0 || pair[1] > 255 || (pair[1] | 0) !== pair[1]) {
        throw new Error(pair[0] + ' must be a single byte (0–255).');
      }
    });

    var data = fields.data || [];
    var hasData = data.length > 0;
    var le = (fields.le === null || fields.le === undefined) ? null : fields.le;
    var hasLe = le !== null;

    if (hasLe && (typeof le !== 'number' || le < 0 || (le | 0) !== le)) {
      throw new Error('Le must be a non-negative integer.');
    }
    if (data.length > 65535) throw new Error('Command data exceeds 65535 bytes (extended Lc maximum).');
    if (hasLe && le > 65536) throw new Error('Le exceeds 65536 bytes (extended maximum).');

    var bytes = [cla, ins, p1, p2];
    var parts = [
      { label: 'CLA', hex: hx(cla, 2) },
      { label: 'INS', hex: hx(ins, 2) },
      { label: 'P1', hex: hx(p1, 2) },
      { label: 'P2', hex: hx(p2, 2) }
    ];

    var lc = hasData ? data.length : null;
    var caseName, extended = false;

    // Decide short vs extended: extended needed when data > 255 or Le > 256.
    var needExtended = (lc !== null && lc > 255) || (hasLe && le > 256);

    if (!hasData && !hasLe) {
      caseName = 'Case 1 (header only)';
    } else if (!hasData && hasLe) {
      caseName = needExtended ? 'Case 2 (extended)' : 'Case 2 (short)';
      if (needExtended) {
        extended = true;
        var le2 = le === 65536 ? 0 : le;
        bytes.push(0x00, (le2 >> 8) & 0xFF, le2 & 0xFF);
        parts.push({ label: 'Le', hex: '00 ' + hx((le2 >> 8) & 0xFF, 2) + ' ' + hx(le2 & 0xFF, 2) });
      } else {
        var le1 = le === 256 ? 0 : le;
        bytes.push(le1);
        parts.push({ label: 'Le', hex: hx(le1, 2) });
      }
    } else if (hasData && !hasLe) {
      caseName = needExtended ? 'Case 3 (extended)' : 'Case 3 (short)';
      if (needExtended) {
        extended = true;
        bytes.push(0x00, (lc >> 8) & 0xFF, lc & 0xFF);
        parts.push({ label: 'Lc', hex: '00 ' + hx((lc >> 8) & 0xFF, 2) + ' ' + hx(lc & 0xFF, 2) });
      } else {
        bytes.push(lc);
        parts.push({ label: 'Lc', hex: hx(lc, 2) });
      }
      bytes = bytes.concat(data);
      parts.push({ label: 'Data', hex: joinHex(data) });
    } else {
      // data + Le
      caseName = needExtended ? 'Case 4 (extended)' : 'Case 4 (short)';
      if (needExtended) {
        extended = true;
        bytes.push(0x00, (lc >> 8) & 0xFF, lc & 0xFF);
        parts.push({ label: 'Lc', hex: '00 ' + hx((lc >> 8) & 0xFF, 2) + ' ' + hx(lc & 0xFF, 2) });
        bytes = bytes.concat(data);
        parts.push({ label: 'Data', hex: joinHex(data) });
        var le4 = le === 65536 ? 0 : le;
        bytes.push((le4 >> 8) & 0xFF, le4 & 0xFF);
        parts.push({ label: 'Le', hex: hx((le4 >> 8) & 0xFF, 2) + ' ' + hx(le4 & 0xFF, 2) });
      } else {
        bytes.push(lc);
        parts.push({ label: 'Lc', hex: hx(lc, 2) });
        bytes = bytes.concat(data);
        parts.push({ label: 'Data', hex: joinHex(data) });
        var le4s = le === 256 ? 0 : le;
        bytes.push(le4s);
        parts.push({ label: 'Le', hex: hx(le4s, 2) });
      }
    }

    return {
      bytes: bytes,
      caseName: caseName,
      extended: extended,
      lc: lc,
      le: hasLe ? le : null,
      parts: parts
    };
  }

  // Parse a command APDU hex string back into fields. Returns { fields:[...], raw }.
  function parseApdu(hexStr) {
    var c = cleanHex(hexStr);
    if (c === '') throw new Error('No APDU bytes supplied.');
    if (!/^[0-9a-f]+$/.test(c)) throw new Error('Input contains non-hex characters.');
    if (c.length % 2 !== 0) throw new Error('APDU must be whole bytes (even number of hex digits).');
    var bytes = [];
    for (var k = 0; k < c.length; k += 2) bytes.push(parseInt(c.substr(k, 2), 16));
    if (bytes.length < 4) throw new Error('A command APDU is at least 4 bytes (CLA INS P1 P2).');

    var fields = [
      { label: 'CLA', value: hx(bytes[0], 2) },
      { label: 'INS', value: hx(bytes[1], 2) },
      { label: 'P1', value: hx(bytes[2], 2) },
      { label: 'P2', value: hx(bytes[3], 2) }
    ];

    var i = 4, lc = null, data = null, le = null, caseName, extended = false;

    if (i === bytes.length) {
      caseName = 'Case 1 (header only)';
    } else if (i + 1 === bytes.length) {
      le = bytes[i] === 0 ? 256 : bytes[i];
      caseName = 'Case 2 (short)';
    } else {
      var first = bytes[i];
      if (first === 0x00 && (bytes.length - i) >= 3) {
        extended = true;
        if (bytes.length - i === 3) {
          le = (bytes[i + 1] << 8) | bytes[i + 2];
          if (le === 0) le = 65536;
          caseName = 'Case 2 (extended)';
        } else {
          lc = (bytes[i + 1] << 8) | bytes[i + 2];
          if (lc === 0) throw new Error('Extended Lc is zero but data follows.');
          i += 3;
          if (i + lc > bytes.length) throw new Error('Extended Lc=' + lc + ' exceeds remaining ' + (bytes.length - i) + ' bytes.');
          data = bytes.slice(i, i + lc);
          i += lc;
          if (i === bytes.length) {
            caseName = 'Case 3 (extended)';
          } else if (i + 2 === bytes.length) {
            le = (bytes[i] << 8) | bytes[i + 1];
            if (le === 0) le = 65536;
            caseName = 'Case 4 (extended)';
          } else {
            throw new Error('Trailing bytes after extended Case 4 Le.');
          }
        }
      } else {
        lc = first;
        i += 1;
        if (i + lc > bytes.length) throw new Error('Short Lc=' + lc + ' exceeds remaining ' + (bytes.length - i) + ' bytes.');
        data = bytes.slice(i, i + lc);
        i += lc;
        if (i === bytes.length) {
          caseName = 'Case 3 (short)';
        } else if (i + 1 === bytes.length) {
          le = bytes[i] === 0 ? 256 : bytes[i];
          caseName = 'Case 4 (short)';
        } else {
          throw new Error('Trailing bytes after Case 4 short Le.');
        }
      }
    }

    if (lc !== null) {
      fields.push({ label: 'Lc', value: lc + ' bytes' + (extended ? ' (extended)' : '') });
      fields.push({ label: 'Data', value: data.length ? joinHex(data) : '(empty)' });
    }
    if (le !== null) {
      fields.push({ label: 'Le', value: le + ' bytes' + (le === 256 || le === 65536 ? ' (maximum)' : ' (exact)') });
    }
    fields.unshift({ label: 'Case', value: caseName });

    return { fields: fields, raw: joinHex(bytes) };
  }

  var EXAMPLES = {
    select: { cla: '00', ins: 'A4', p1: '04', p2: '00', data: 'A0 00 00 00 03 10 10', le: '00' },
    getresp: { cla: '00', ins: 'C0', p1: '00', p2: '00', data: '', le: '0C' },
    readbin: { cla: '00', ins: 'B0', p1: '00', p2: '00', data: '', le: '10' },
    verify: { cla: '00', ins: '20', p1: '00', p2: '80', data: '31 32 33 34 FF FF FF FF', le: '' },
    getdata: { cla: '00', ins: 'CA', p1: '9F', p2: '17', data: '', le: '00' }
  };

  if (typeof document !== 'undefined') {
    var AS = (typeof window !== 'undefined' && window.AS) ? window.AS : null;

    var init = function () {
      if (!AS) return;
      var cla = AS.$('ab-cla'), ins = AS.$('ab-ins'), p1 = AS.$('ab-p1'), p2 = AS.$('ab-p2');
      var dataIn = AS.$('ab-data'), leIn = AS.$('ab-le'), leMode = AS.$('ab-lemode');
      var out = AS.$('ab-output'), exSel = AS.$('ab-example');
      var sample = AS.$('ab-sample'), clearBtn = AS.$('ab-clear'), copyBtn = AS.$('ab-copy');
      var parseIn = AS.$('ab-parse-input'), parseOut = AS.$('ab-parse-output');
      var parseSample = AS.$('ab-parse-sample'), parseClear = AS.$('ab-parse-clear'), parseCopy = AS.$('ab-parse-copy');
      if (!cla || !out) return;

      function build() {
        out.dataset.value = '';
        try {
          var le = null;
          var lm = leMode ? leMode.value : 'none';
          if (lm === 'value') {
            var lv = String(leIn.value).trim();
            if (lv === '') throw new Error('Le is enabled but empty — set a value or choose "No Le".');
            if (!/^[0-9]+$/.test(lv)) throw new Error('Le must be a decimal number of bytes (e.g. 256).');
            le = parseInt(lv, 10);
          } else if (lm === 'max') {
            le = 256;
          }
          var fields = {
            cla: byteFromHex(cla.value, 'CLA'),
            ins: byteFromHex(ins.value, 'INS'),
            p1: byteFromHex(p1.value, 'P1'),
            p2: byteFromHex(p2.value, 'P2'),
            data: dataBytes(dataIn.value),
            le: le
          };
          var res = buildApdu(fields);
          out.dataset.value = joinHex(res.bytes);
          var rows = '';
          res.parts.forEach(function (pt) {
            rows += '<div class="parsed-row"><span class="label">' + AS.escHTML(pt.label) +
              '</span><div class="value" style="font-family:\'JetBrains Mono\',monospace;">' + AS.escHTML(pt.hex) + '</div></div>';
          });
          var lcNote = res.lc === null ? 'no command data' : (res.lc + ' data byte' + (res.lc === 1 ? '' : 's'));
          out.innerHTML =
            '<div style="margin-bottom:10px;"><span class="tech-badge tech-badge--ok">' + AS.escHTML(res.caseName) + '</span> ' +
            '<span class="tech-badge">' + res.bytes.length + ' bytes</span> ' +
            '<span class="tech-badge tech-badge--info">' + AS.escHTML(lcNote) + '</span>' +
            (res.extended ? ' <span class="tech-badge tech-badge--warn">extended length</span>' : '') + '</div>' +
            '<pre style="white-space:pre-wrap;word-break:break-all;font-family:\'JetBrains Mono\',monospace;font-size:13.5px;line-height:1.65;">' +
            AS.escHTML(joinHex(res.bytes)) + '</pre>' + rows;
        } catch (e) {
          AS.renderError(out, e.message || String(e));
        }
      }

      function syncLeMode() {
        if (!leIn || !leMode) return;
        leIn.disabled = leMode.value !== 'value';
      }

      [cla, ins, p1, p2, dataIn, leIn].forEach(function (el) {
        if (el) el.addEventListener('input', build);
      });
      if (leMode) leMode.addEventListener('change', function () { syncLeMode(); build(); });

      function applyExample(key) {
        var ex = EXAMPLES[key];
        if (!ex) return;
        cla.value = ex.cla; ins.value = ex.ins; p1.value = ex.p1; p2.value = ex.p2;
        dataIn.value = ex.data;
        if (ex.le === '') { leMode.value = 'none'; leIn.value = ''; }
        else if (ex.le === '00') { leMode.value = 'max'; leIn.value = ''; }
        else { leMode.value = 'value'; leIn.value = String(parseInt(ex.le, 16)); }
        syncLeMode();
        build();
      }

      if (exSel) exSel.addEventListener('change', function () {
        if (exSel.value) applyExample(exSel.value);
      });

      if (sample) sample.addEventListener('click', function () {
        applyExample('select');
        if (exSel) exSel.value = 'select';
      });
      if (clearBtn) clearBtn.addEventListener('click', function () {
        cla.value = ''; ins.value = ''; p1.value = ''; p2.value = '';
        dataIn.value = ''; leIn.value = ''; if (leMode) leMode.value = 'none';
        if (exSel) exSel.value = '';
        syncLeMode(); build(); cla.focus();
      });
      AS.bindCopy(copyBtn, function () { return out.dataset.value || ''; });

      // Reverse parser.
      function parse() {
        if (!parseIn || !parseOut) return;
        parseOut.dataset.value = '';
        var raw = parseIn.value.trim();
        if (!raw) { AS.renderPlaceholder(parseOut, 'Paste a command APDU hex to break it into fields.'); return; }
        try {
          var res = parseApdu(raw);
          parseOut.dataset.value = res.raw;
          var rows = '';
          res.fields.forEach(function (f) {
            rows += '<div class="parsed-row"><span class="label">' + AS.escHTML(f.label) +
              '</span><div class="value">' + AS.escHTML(f.value) + '</div></div>';
          });
          parseOut.innerHTML =
            '<div style="margin-bottom:10px;"><span class="tech-badge tech-badge--ok">COMMAND APDU</span> ' +
            '<span class="tech-badge">' + res.raw.split(' ').length + ' bytes</span></div>' + rows;
        } catch (e) {
          AS.renderError(parseOut, e.message || String(e));
        }
      }
      if (parseIn) parseIn.addEventListener('input', parse);
      if (parseSample) parseSample.addEventListener('click', function () {
        parseIn.value = '00 A4 04 00 07 A0 00 00 00 03 10 10 00';
        parse();
      });
      if (parseClear) parseClear.addEventListener('click', function () { parseIn.value = ''; parse(); parseIn.focus(); });
      AS.bindCopy(parseCopy, function () { return parseOut.dataset.value || ''; });

      syncLeMode();
      build();
      parse();
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { buildApdu: buildApdu, parseApdu: parseApdu };
  }
})();
