(function () {
  'use strict';

  var DOS = {
    0x87: { name: '87 — Padding-indicator + cryptogram (BER, plain encoding)' },
    0x97: { name: '97 — Le (expected response length, plain)' },
    0x86: { name: '86 — Cryptogram without padding indicator (constructed BER variant)' },
    0x99: { name: '99 — Processing status (SW1 SW2)' },
    0x8E: { name: '8E — Cryptographic checksum (MAC over command)' },
    0x84: { name: '84 — Cryptogram (proprietary; legacy)' },
    0x96: { name: '96 — Le (constructed BER variant; secure)' },
    0x80: { name: '80 — Plain value (not BER-TLV padded)' }
  };

  function clean(hex) { return String(hex).replace(/0x/gi,'').replace(/[\s,;:_-]+/g,'').toLowerCase(); }
  function toBytes(hex) {
    var s = clean(hex);
    if (!/^[0-9a-f]*$/.test(s)) throw new Error('Non-hex characters.');
    if (s.length % 2 !== 0) throw new Error('Hex length must be even.');
    var b = []; for (var i = 0; i < s.length; i += 2) b.push(parseInt(s.substr(i, 2), 16));
    return b;
  }
  function bytesHex(b) { return b.map(function (x) { return x.toString(16).toUpperCase().padStart(2,'0'); }).join(' '); }

  function decodeLength(b, off) {
    if (off >= b.length) throw new Error('Truncated length octet.');
    var first = b[off];
    if (first < 0x80) return { value: first, bytes: 1 };
    if (first === 0x80) return { value: -1, bytes: 1, indef: true };
    var n = first & 0x7F;
    if (off + 1 + n > b.length) throw new Error('Truncated long-form length (' + n + ' octets).');
    var v = 0;
    for (var i = 0; i < n; i++) v = (v * 256) + b[off + 1 + i];
    return { value: v, bytes: 1 + n };
  }

  function row(label, value, note) {
    return '<div class="parsed-row"><span class="label">' + label + '</span>' +
      '<div><div class="value">' + value + '</div>' +
      (note ? '<span class="note">' + note + '</span>' : '') + '</div></div>';
  }

  function init() {
    var input = AS.$('sm-input'), output = AS.$('sm-output');
    var inputCLA = AS.$('sm-cla');
    var sample = AS.$('sm-sample'), clearBtn = AS.$('sm-clear');
    if (!input || !output) return;

    function go() {
      var raw = (input.value || '').trim();
      var cla = (inputCLA && inputCLA.value) ? inputCLA.value.trim() : '';
      if (!raw) { AS.renderPlaceholder(output, 'Paste BER-TLV body of an SM-wrapped APDU. Optionally provide CLA byte to confirm SM bits.'); return; }
      try {
        var b = toBytes(raw);
        var html = '<div style="margin-bottom:14px;"><span class="tech-badge tech-badge--ok">SM body</span> <span class="tech-badge">' + b.length + ' bytes</span></div>';

        if (cla) {
          var c = parseInt(cla.replace(/0x/i, ''), 16);
          if (!Number.isNaN(c)) {
            var smBits = (c >> 2) & 0x03;
            var smLabel = ['No SM',
                           'SM proprietary (header not authenticated)',
                           'SM ISO (body authenticated, header not)',
                           'SM ISO (header authenticated)'][smBits];
            html += row('CLA byte', '0x' + c.toString(16).toUpperCase().padStart(2,'0'),
              'SM bits b3..b2 = 0x' + smBits.toString(16).toUpperCase() + ' — ' + smLabel);
          }
        }

        var i = 0;
        while (i < b.length) {
          var tag = b[i]; var tagOff = i; i += 1;

          while (b[i - 1] && (b[i - 1] & 0x1F) === 0x1F && i < b.length) {
            tag = (tag << 8) | b[i]; i += 1;
            if (!(b[i - 1] & 0x80)) break;
          }
          var L = decodeLength(b, i); i += L.bytes;
          if (L.value < 0) throw new Error('Indefinite-length BER not supported in SM body.');
          var v = b.slice(i, i + L.value); i += L.value;

          var doInfo = DOS[tag] || { name: 'Unknown DO (0x' + tag.toString(16).toUpperCase() + ')' };
          var label = doInfo.name;
          var detail = '<span class="mono">' + bytesHex(v) + '</span>';
          var note;

          if (tag === 0x87 && v.length > 0) {
            var padInd = v[0];
            var padDesc = padInd === 0x01 ? 'ISO/IEC 9797-1 padding (method 2: 80 || 00 ...)' :
                          padInd === 0x02 ? 'no padding (data is full-block multiple)' :
                          'padding-indicator 0x' + padInd.toString(16).toUpperCase();
            note = padDesc + '. Cryptogram length ' + (v.length - 1) + ' bytes.';
            detail = '<span class="mono">PI=' + v[0].toString(16).toUpperCase().padStart(2,'0') + ' || ' + bytesHex(v.slice(1)) + '</span>';
          } else if (tag === 0x97) {
            note = 'Le requested = 0x' + bytesHex(v).replace(/ /g,'') + (v.length === 1 ? ' (' + (v[0] === 0 ? 256 : v[0]) + ' bytes)' : '');
          } else if (tag === 0x99) {
            note = 'SW1 SW2 = ' + (v.length >= 2 ? bytesHex(v.slice(0, 2)) : '(short)');
          } else if (tag === 0x8E) {
            note = 'Cryptographic checksum / MAC. Length ' + v.length + ' bytes (typically 4 or 8 for retail-MAC, 8 for CMAC truncated).';
          }

          html += row(label, detail, note);
        }

        html += '<div class="note" style="margin-top:14px; padding:10px 14px; background:var(--secure-cyan-soft); border-left:3px solid var(--secure-cyan); border-radius:3px;">' +
          '<strong>Spec:</strong> ISO/IEC 7816-4 §6 (Secure Messaging) and Annex A (DO catalogue). Each SM-wrapped APDU is reconstructed from these BER-TLV objects; the MAC (8E) covers the header and DOs; the cryptogram (87/86) carries the payload.</div>';

        output.innerHTML = html;
      } catch (e) { AS.renderError(output, e.message); }
    }
    input.addEventListener('input', go);
    if (inputCLA) inputCLA.addEventListener('input', go);
    if (sample) sample.addEventListener('click', function () {
      if (inputCLA) inputCLA.value = '0C';
      input.value = '87 09 01 11 22 33 44 55 66 77 88  97 01 00  8E 08 99 88 77 66 55 44 33 22';
      go();
    });
    if (clearBtn) clearBtn.addEventListener('click', function () { input.value=''; if (inputCLA) inputCLA.value=''; go(); input.focus(); });
    go();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
