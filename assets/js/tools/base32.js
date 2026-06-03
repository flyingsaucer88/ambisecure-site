(function () {
  'use strict';

  var ALPHA = {
    base32: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567',
    base32hex: '0123456789ABCDEFGHIJKLMNOPQRSTUV'
  };

  function buildReverse(alpha) {
    var map = {};
    for (var i = 0; i < alpha.length; i++) map[alpha.charAt(i)] = i;
    return map;
  }

  // Encode a Uint8Array to Base32 text.
  function encodeBytes(u8, alpha, pad) {
    var out = '', bits = 0, value = 0;
    for (var i = 0; i < u8.length; i++) {
      value = (value << 8) | u8[i];
      bits += 8;
      while (bits >= 5) {
        out += alpha.charAt((value >>> (bits - 5)) & 31);
        bits -= 5;
      }
    }
    if (bits > 0) out += alpha.charAt((value << (5 - bits)) & 31);
    if (pad) { while (out.length % 8 !== 0) out += '='; }
    return out;
  }

  // Decode Base32 text to a Uint8Array. Throws on invalid characters.
  function decodeToBytes(str, alpha) {
    var rev = buildReverse(alpha);
    var clean = String(str).replace(/=+$/, '').replace(/\s+/g, '').toUpperCase();
    var bits = 0, value = 0, out = [];
    for (var i = 0; i < clean.length; i++) {
      var c = clean.charAt(i);
      if (!(c in rev)) throw new Error('Invalid Base32 character "' + c + '" at position ' + (i + 1) + '.');
      value = (value << 5) | rev[c];
      bits += 5;
      if (bits >= 8) {
        out.push((value >>> (bits - 8)) & 0xff);
        bits -= 8;
      }
    }
    return new Uint8Array(out);
  }

  function hexToBytes(s) {
    var clean = String(s).replace(/0x/gi, '').replace(/[\s,:;]+/g, '');
    if (clean.length % 2 !== 0) throw new Error('Hex input must have an even number of digits.');
    if (!/^[0-9a-fA-F]*$/.test(clean)) throw new Error('Hex input contains non-hex characters.');
    var u8 = new Uint8Array(clean.length / 2);
    for (var i = 0; i < u8.length; i++) u8[i] = parseInt(clean.substr(i * 2, 2), 16);
    return u8;
  }

  function bytesToHex(u8) {
    var s = '';
    for (var i = 0; i < u8.length; i++) s += u8[i].toString(16).padStart(2, '0');
    return s.replace(/(..)(?=.)/g, '$1 ');
  }

  function tryUtf8(u8) {
    try {
      var t = new TextDecoder('utf-8', { fatal: true }).decode(u8);
      return { ok: true, text: t };
    } catch (e) { return { ok: false }; }
  }

  function init() {
    var input = AS.$('b32-input'), output = AS.$('b32-output');
    var dir = AS.$('b32-direction'), variant = AS.$('b32-variant');
    var inmode = AS.$('b32-inmode'), pad = AS.$('b32-pad');
    var sample = AS.$('b32-sample'), clearBtn = AS.$('b32-clear'), copyBtn = AS.$('b32-copy');
    if (!input || !output) return;

    function lastResult() { return output.dataset.value || ''; }

    function go() {
      output.dataset.value = '';
      var raw = input.value;
      if (!raw.trim()) { AS.renderPlaceholder(output, 'Type or paste text, hex, or Base32.'); return; }
      var alpha = ALPHA[variant.value] || ALPHA.base32;
      try {
        if (dir.value === 'encode') {
          var bytes = inmode.value === 'hex' ? hexToBytes(raw) : new TextEncoder().encode(raw);
          var enc = encodeBytes(bytes, alpha, !!pad.checked);
          output.dataset.value = enc;
          output.innerHTML =
            '<div style="margin-bottom:10px;"><span class="tech-badge tech-badge--ok">' +
            AS.escHTML(variant.value.toUpperCase()) + '</span> <span class="tech-badge">' +
            enc.length + ' chars</span> <span class="tech-badge tech-badge--info">' + bytes.length + ' bytes in</span></div>' +
            '<pre style="white-space:pre-wrap;word-break:break-all;font-family:\'JetBrains Mono\',monospace;font-size:13.5px;line-height:1.65;">' +
            AS.escHTML(enc) + '</pre>';
        } else {
          var dec = decodeToBytes(raw, alpha);
          var u = tryUtf8(dec);
          var hex = bytesToHex(dec);
          var label = u.ok ? 'TEXT (UTF-8)' : 'RAW BYTES (hex)';
          var body = u.ok ? u.text : hex;
          output.dataset.value = body;
          output.innerHTML =
            '<div style="margin-bottom:10px;"><span class="tech-badge tech-badge--ok">' +
            AS.escHTML(label) + '</span> <span class="tech-badge">' + dec.length + ' bytes</span></div>' +
            '<pre style="white-space:pre-wrap;word-break:break-all;font-family:\'JetBrains Mono\',monospace;font-size:13.5px;line-height:1.65;">' +
            AS.escHTML(body) + '</pre>' +
            (u.ok ? '<div class="parsed-row"><span class="label">Hex</span><div class="value" style="font-family:\'JetBrains Mono\',monospace;">' + AS.escHTML(hex) + '</div></div>' : '');
        }
      } catch (e) { AS.renderError(output, e.message); }
    }

    input.addEventListener('input', go);
    dir.addEventListener('change', go);
    variant.addEventListener('change', go);
    inmode.addEventListener('change', go);
    pad.addEventListener('change', go);
    if (sample) sample.addEventListener('click', function () {
      if (dir.value === 'encode') { inmode.value = 'text'; input.value = 'Authentication without compromise'; }
      else { input.value = 'JFTGS43FOIQHI2DJGFUHO2DBFQQHI2DBGFQXLTC='; }
      go();
    });
    if (clearBtn) clearBtn.addEventListener('click', function () { input.value = ''; go(); input.focus(); });
    AS.bindCopy(copyBtn, lastResult);
    go();
  }

  // Expose for self-test (Node) and isolated reuse.
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { encodeBytes: encodeBytes, decodeToBytes: decodeToBytes, ALPHA: ALPHA };
  }
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  }
})();
