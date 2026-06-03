(function () {
  'use strict';

  // Parse a hex string tolerating spaces, 0x prefixes, colons, commas, semicolons.
  function parseHex(s) {
    var clean = String(s).replace(/0x/gi, '').replace(/[\s,:;_]+/g, '');
    if (clean.length === 0) return new Uint8Array(0);
    if (!/^[0-9a-fA-F]*$/.test(clean)) {
      var bad = clean.replace(/[0-9a-fA-F]/g, '').charAt(0);
      throw new Error('Input contains a non-hex character "' + bad + '". Allowed: 0-9 a-f, plus spaces, 0x, : ; , as separators.');
    }
    if (clean.length % 2 !== 0) {
      throw new Error('Hex input has an odd number of digits (' + clean.length + '). Each byte needs two hex digits.');
    }
    var u8 = new Uint8Array(clean.length / 2);
    for (var i = 0; i < u8.length; i++) u8[i] = parseInt(clean.substr(i * 2, 2), 16);
    return u8;
  }

  function hex2(n) { return n.toString(16).toUpperCase().padStart(2, '0'); }

  // One printable-ASCII char (0x20-0x7E) or '.' otherwise.
  function printable(b) { return (b >= 0x20 && b <= 0x7e) ? String.fromCharCode(b) : '.'; }

  // Build rows of {start0, bytes:[...]} for a given group size.
  function groupRows(u8, group) {
    var rows = [];
    for (var i = 0; i < u8.length; i += group) {
      var slice = [];
      for (var j = i; j < i + group && j < u8.length; j++) slice.push(u8[j]);
      rows.push({ start0: i, bytes: slice });
    }
    return rows;
  }

  // Interpret a slice [start, start+len) as an integer.
  // Returns { unsigned, signed } as decimal strings. Uses BigInt for >6 bytes.
  function interpret(u8, start, len, little) {
    if (len < 1) throw new Error('Length must be at least 1 byte.');
    if (len > 8) throw new Error('Integer interpretation is limited to 8 bytes (64-bit). Requested ' + len + '.');
    if (start < 0) throw new Error('Start offset cannot be negative.');
    if (start + len > u8.length) {
      throw new Error('Slice [' + start + ', ' + (start + len) + ') runs past the end of the data (' + u8.length + ' bytes).');
    }
    var val = 0n;
    for (var k = 0; k < len; k++) {
      var idx = little ? (start + (len - 1 - k)) : (start + k);
      val = (val << 8n) | BigInt(u8[idx]);
    }
    var bits = BigInt(len * 8);
    var unsigned = val;
    var signed = val;
    var signBit = 1n << (bits - 1n);
    if (signed & signBit) signed = signed - (1n << bits);
    return { unsigned: unsigned.toString(10), signed: signed.toString(10) };
  }

  function render(u8, group, output) {
    var n = u8.length;
    var addrW = Math.max(4, String(n).length);
    var hexAddrW = Math.max(4, (n - 1).toString(16).length);

    var head =
      '<div style="margin-bottom:10px;">' +
      '<span class="tech-badge tech-badge--ok">' + n + ' bytes</span> ' +
      '<span class="tech-badge tech-badge--info">group ' + group + '</span> ' +
      '<span class="tech-badge">' + groupRows(u8, group).length + ' rows</span>' +
      '</div>';

    var rows = groupRows(u8, group);
    var lines = [];
    // Column header line.
    var hdr = pad('Dec', addrW) + '  ' + pad('Hex', hexAddrW + 2) + '  ' + pad('1-based', addrW) + '   bytes' ;
    lines.push(hdr);
    for (var r = 0; r < rows.length; r++) {
      var row = rows[r];
      var bytesHex = row.bytes.map(hex2).join(' ');
      var ascii = row.bytes.map(printable).join('');
      var dec = pad(String(row.start0), addrW);
      var hx = pad('0x' + row.start0.toString(16).toUpperCase().padStart(hexAddrW, '0'), hexAddrW + 2);
      var one = pad(String(row.start0 + 1), addrW);
      lines.push(dec + '  ' + hx + '  ' + one + '   ' + padEnd(bytesHex, group * 3) + ' |' + ascii + '|');
    }
    var table = lines.join('\n');

    output.dataset.value = table;
    output.innerHTML = head +
      '<pre style="white-space:pre;overflow-x:auto;font-family:\'JetBrains Mono\',monospace;font-size:13px;line-height:1.6;">' +
      AS.escHTML(table) + '</pre>';
  }

  function pad(s, w) { s = String(s); while (s.length < w) s = ' ' + s; return s; }
  function padEnd(s, w) { s = String(s); while (s.length < w) s = s + ' '; return s; }

  function init() {
    var input = AS.$('boc-input'), output = AS.$('boc-output');
    var group = AS.$('boc-group');
    var sample = AS.$('boc-sample'), clearBtn = AS.$('boc-clear'), copyBtn = AS.$('boc-copy');
    var startEl = AS.$('boc-start'), lenEl = AS.$('boc-len'), endianEl = AS.$('boc-endian');
    var intOut = AS.$('boc-int-output'), intCopy = AS.$('boc-int-copy');
    if (!input || !output) return;

    var lastBytes = new Uint8Array(0);

    function tableValue() { return output.dataset.value || ''; }
    function intValue() { return intOut ? (intOut.dataset.value || '') : ''; }

    function go() {
      output.dataset.value = '';
      var raw = input.value;
      if (!raw.trim()) {
        AS.renderPlaceholder(output, 'Paste hex bytes to build the offset table.');
        lastBytes = new Uint8Array(0);
        runInterpret();
        return;
      }
      try {
        lastBytes = parseHex(raw);
        if (lastBytes.length === 0) {
          AS.renderPlaceholder(output, 'No bytes found in input.');
        } else {
          render(lastBytes, parseInt(group.value, 10) || 1, output);
        }
      } catch (e) {
        lastBytes = new Uint8Array(0);
        AS.renderError(output, e.message);
      }
      runInterpret();
    }

    function runInterpret() {
      if (!intOut) return;
      intOut.dataset.value = '';
      if (lastBytes.length === 0) {
        AS.renderPlaceholder(intOut, 'Parse some bytes, then choose a start and length.');
        return;
      }
      var start = parseInt(startEl.value, 10);
      var len = parseInt(lenEl.value, 10);
      if (isNaN(start)) start = 0;
      if (isNaN(len)) len = 1;
      try {
        var le = interpret(lastBytes, start, len, true);
        var be = interpret(lastBytes, start, len, false);
        var sliceHex = [];
        for (var i = start; i < start + len; i++) sliceHex.push(hex2(lastBytes[i]));
        var txt =
          'slice [' + start + ', ' + (start + len) + ')  =  ' + sliceHex.join(' ') + '\n' +
          'big-endian    unsigned ' + be.unsigned + '   signed ' + be.signed + '\n' +
          'little-endian unsigned ' + le.unsigned + '   signed ' + le.signed;
        intOut.dataset.value = txt;
        intOut.innerHTML =
          '<div style="margin-bottom:10px;">' +
          '<span class="tech-badge tech-badge--ok">' + len + '-byte slice</span> ' +
          '<span class="tech-badge tech-badge--info">@ offset ' + start + '</span></div>' +
          '<div class="parsed-row"><span class="label">Bytes</span><div class="value" style="font-family:\'JetBrains Mono\',monospace;">' + AS.escHTML(sliceHex.join(' ')) + '</div></div>' +
          '<div class="parsed-row"><span class="label">BE unsigned</span><div class="value" style="font-family:\'JetBrains Mono\',monospace;">' + AS.escHTML(be.unsigned) + '</div></div>' +
          '<div class="parsed-row"><span class="label">BE signed</span><div class="value" style="font-family:\'JetBrains Mono\',monospace;">' + AS.escHTML(be.signed) + '</div></div>' +
          '<div class="parsed-row"><span class="label">LE unsigned</span><div class="value" style="font-family:\'JetBrains Mono\',monospace;">' + AS.escHTML(le.unsigned) + '</div></div>' +
          '<div class="parsed-row"><span class="label">LE signed</span><div class="value" style="font-family:\'JetBrains Mono\',monospace;">' + AS.escHTML(le.signed) + '</div></div>';
      } catch (e) {
        AS.renderError(intOut, e.message);
      }
    }

    input.addEventListener('input', go);
    group.addEventListener('change', go);
    if (startEl) startEl.addEventListener('input', runInterpret);
    if (lenEl) lenEl.addEventListener('input', runInterpret);
    if (endianEl) endianEl.addEventListener('change', runInterpret);

    if (sample) sample.addEventListener('click', function () {
      // A short SELECT-by-AID APDU (ISO 7816-4): CLA INS P1 P2 Lc AID...
      input.value = '00 A4 04 00 07 A0 00 00 00 03 10 10';
      group.value = '4';
      if (startEl) startEl.value = '4';
      if (lenEl) lenEl.value = '1';
      go();
    });
    if (clearBtn) clearBtn.addEventListener('click', function () { input.value = ''; go(); input.focus(); });
    AS.bindCopy(copyBtn, tableValue);
    AS.bindCopy(intCopy, intValue);
    go();
  }

  // Expose pure logic for Node self-test and isolated reuse.
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { parseHex: parseHex, groupRows: groupRows, interpret: interpret, printable: printable };
  }
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  }
})();
