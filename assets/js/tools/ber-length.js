/* AmbiSecure — BER length-field visualizer.
   ITU-T X.690 §8.1.3. Decode short-form (≤127), long-form (1..126 length
   octets), and indefinite-form (0x80) length encodings. Encode any
   non-negative integer back into BER. */
(function () {
  'use strict';

  function row(label, value, note) {
    return '<div class="parsed-row"><span class="label">' + label + '</span>' +
      '<div><div class="value">' + value + '</div>' + (note ? '<span class="note">' + note + '</span>' : '') + '</div></div>';
  }

  function bytesToHex(b) {
    var s = '';
    for (var i = 0; i < b.length; i++) s += (b[i] < 16 ? '0' : '') + b[i].toString(16);
    return s.toUpperCase();
  }

  function decode(hex) {
    var s = hex.replace(/0x/gi, '').replace(/[\s,;:_-]+/g, '').toLowerCase();
    if (!/^[0-9a-f]+$/.test(s) || s.length % 2) throw new Error('Need a hex string with an even number of digits.');
    var b = []; for (var i = 0; i < s.length; i += 2) b.push(parseInt(s.substr(i, 2), 16));
    if (b.length === 0) throw new Error('Empty.');
    var first = b[0];
    if (first < 0x80) return { form: 'short', bytes: 1, length: first, octets: [first] };
    if (first === 0x80) return { form: 'indefinite', bytes: 1, length: null, octets: [0x80], note: 'Indefinite-form (BER only). Used with constructed types; ends with end-of-contents 00 00. Forbidden in DER.' };
    if (first === 0xFF) throw new Error('0xFF is reserved as a length octet.');
    var n = first & 0x7F;
    if (b.length < 1 + n) throw new Error('Long-form needs ' + n + ' more octet(s) but only ' + (b.length - 1) + ' provided.');
    var len = 0;
    for (var j = 0; j < n; j++) len = (len * 256) + b[1 + j];
    if (n > 6 && len > Number.MAX_SAFE_INTEGER) throw new Error('Length exceeds JS safe integer.');
    return { form: 'long', bytes: 1 + n, length: len, octets: b.slice(0, 1 + n), n: n };
  }

  function encode(num) {
    if (num < 0 || !Number.isFinite(num)) throw new Error('Length must be a non-negative integer.');
    if (num < 128) return [num];
    var bytes = [];
    var n = num;
    while (n > 0) { bytes.unshift(n & 0xFF); n = Math.floor(n / 256); }
    return [0x80 | bytes.length].concat(bytes);
  }

  function init() {
    var inputDecode = AS.$('berl-decode'), inputEncode = AS.$('berl-encode'), output = AS.$('berl-output');
    var sample = AS.$('berl-sample'), clearBtn = AS.$('berl-clear');
    if (!inputDecode || !inputEncode || !output) return;

    function render(decRes, encRes) {
      var html = '';
      if (decRes) {
        html += '<div style="margin-bottom:14px;"><span class="tech-badge tech-badge--ok">DECODE</span></div>';
        html += row('Form', decRes.form, decRes.note || (decRes.form === 'short' ? 'Length ≤ 127, encoded in a single octet.' :
          decRes.form === 'long' ? 'Length > 127, encoded in 1 + N octets where the first byte is 0x80 | N.' : ''));
        html += row('Octets consumed', String(decRes.bytes), '<span class="mono">' + bytesToHex(decRes.octets) + '</span>');
        if (decRes.length !== null) html += row('Decoded length', decRes.length + ' bytes');
        if (decRes.form === 'long') html += row('N (long-form digits)', String(decRes.n), 'First byte is 0x' + decRes.octets[0].toString(16).toUpperCase() + ' = 0x80 | ' + decRes.n + '.');
      }
      if (encRes) {
        html += '<div style="margin: 18px 0 14px;"><span class="tech-badge tech-badge--ok">ENCODE</span></div>';
        html += row('Length value', String(encRes.value));
        html += row('BER octets', '<span class="mono">' + bytesToHex(encRes.bytes) + '</span>', encRes.bytes.length === 1 ? 'Short-form (single octet).' : 'Long-form: 0x' + encRes.bytes[0].toString(16).toUpperCase() + ' (0x80 | ' + (encRes.bytes.length - 1) + ') followed by big-endian length.');
        // DGI long form note
        if (encRes.value < 0xFF) {
          html += '<div class="note" style="margin-top:10px;">For DGI long form (used in some EMV personalisation specs): always encode as <code>FF || 2-byte BE length</code>, even for small values. Different from BER long-form, which uses minimum-length encoding.</div>';
        }
      }
      if (!decRes && !encRes) {
        AS.renderPlaceholder(output, 'Enter a hex length (e.g. 81 80) or an integer length to encode.');
        return;
      }
      output.innerHTML = html;
    }

    function go() {
      var dec = (inputDecode.value || '').trim();
      var enc = (inputEncode.value || '').trim();
      var decRes = null, encRes = null;
      try { if (dec) decRes = decode(dec); } catch (e) { AS.renderError(output, '[decode] ' + e.message); return; }
      try {
        if (enc) {
          var n = parseInt(enc, 10);
          if (Number.isNaN(n)) throw new Error('Not a valid integer.');
          encRes = { value: n, bytes: encode(n) };
        }
      } catch (e) { AS.renderError(output, '[encode] ' + e.message); return; }
      render(decRes, encRes);
    }
    inputDecode.addEventListener('input', go);
    inputEncode.addEventListener('input', go);
    if (sample) sample.addEventListener('click', function () { inputDecode.value = '82 01 00'; inputEncode.value = '256'; go(); });
    if (clearBtn) clearBtn.addEventListener('click', function () { inputDecode.value=''; inputEncode.value=''; go(); inputDecode.focus(); });
    go();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
