(function () {
  'use strict';

  // ---- byte parsing helpers -------------------------------------------------
  function hexToBytes(s) {
    var clean = String(s).replace(/0x/gi, '').replace(/[\s,:;]+/g, '');
    if (clean.length % 2 !== 0) throw new Error('Hex input must have an even number of digits.');
    if (!/^[0-9a-fA-F]*$/.test(clean)) throw new Error('Hex input contains non-hex characters.');
    var u8 = new Uint8Array(clean.length / 2);
    for (var i = 0; i < u8.length; i++) u8[i] = parseInt(clean.substr(i * 2, 2), 16);
    return u8;
  }

  function binToBytes(s) {
    var clean = String(s).replace(/[\s,_]+/g, '');
    if (!/^[01]*$/.test(clean)) throw new Error('Binary input may only contain 0 and 1 (and whitespace).');
    if (clean.length % 8 !== 0) throw new Error('Binary input length must be a multiple of 8 bits.');
    var u8 = new Uint8Array(clean.length / 8);
    for (var i = 0; i < u8.length; i++) u8[i] = parseInt(clean.substr(i * 8, 8), 2);
    return u8;
  }

  function toBytes(raw, mode) {
    if (mode === 'hex') return hexToBytes(raw);
    if (mode === 'binary') return binToBytes(raw);
    return new TextEncoder().encode(raw);
  }

  // ---- 16/32-bit word reader (endian aware, zero padded) --------------------
  function read16(u8, i, little) {
    var lo = u8[i], hi = i + 1 < u8.length ? u8[i + 1] : 0;
    return little ? ((hi << 8) | lo) : ((lo << 8) | hi);
  }
  function read32(u8, i, little) {
    var b0 = u8[i];
    var b1 = i + 1 < u8.length ? u8[i + 1] : 0;
    var b2 = i + 2 < u8.length ? u8[i + 2] : 0;
    var b3 = i + 3 < u8.length ? u8[i + 3] : 0;
    if (little) return ((b3 << 24) | (b2 << 16) | (b1 << 8) | b0) >>> 0;
    return ((b0 << 24) | (b1 << 16) | (b2 << 8) | b3) >>> 0;
  }

  // ---- individual algorithms ------------------------------------------------
  function sum8(u8) {
    var s = 0;
    for (var i = 0; i < u8.length; i++) s = (s + u8[i]) & 0xff;
    return s >>> 0;
  }
  function sum16(u8, little) {
    var s = 0;
    for (var i = 0; i < u8.length; i += 2) s = (s + read16(u8, i, little)) & 0xffff;
    return s >>> 0;
  }
  function sum32(u8, little) {
    var s = 0;
    for (var i = 0; i < u8.length; i += 4) s = (s + read32(u8, i, little)) >>> 0;
    return s >>> 0;
  }
  // One's-complement 8-bit checksum: bitwise NOT of the truncated byte sum.
  function onesComp8(u8) { return (~sum8(u8)) & 0xff; }
  // Two's-complement 8-bit checksum: value that makes the byte sum wrap to 0.
  function twosComp8(u8) { return (-sum8(u8)) & 0xff; }
  function xor8(u8) {
    var s = 0;
    for (var i = 0; i < u8.length; i++) s ^= u8[i];
    return s & 0xff;
  }
  function fletcher16(u8) {
    var s1 = 0, s2 = 0;
    for (var i = 0; i < u8.length; i++) {
      s1 = (s1 + u8[i]) % 255;
      s2 = (s2 + s1) % 255;
    }
    return ((s2 << 8) | s1) >>> 0;
  }
  function fletcher32(u8) {
    // Operates over 16-bit little-endian words, modulo 65535.
    var s1 = 0, s2 = 0;
    for (var i = 0; i < u8.length; i += 2) {
      var w = read16(u8, i, true);
      s1 = (s1 + w) % 65535;
      s2 = (s2 + s1) % 65535;
    }
    return ((s2 * 65536) + s1) >>> 0;
  }
  function adler32(u8) {
    var MOD = 65521, a = 1, b = 0;
    for (var i = 0; i < u8.length; i++) {
      a = (a + u8[i]) % MOD;
      b = (b + a) % MOD;
    }
    return (((b * 65536) + a)) >>> 0;
  }
  // Internet checksum, RFC 1071: 16-bit one's-complement of the one's-complement sum.
  function internet(u8) {
    var sum = 0;
    for (var i = 0; i < u8.length; i += 2) sum += read16(u8, i, false);
    while (sum >>> 16) sum = (sum & 0xffff) + (sum >>> 16);
    return (~sum) & 0xffff;
  }

  // Width in bytes of each algorithm's result (for hex/binary padding).
  var WIDTH = {
    'sum8': 1, 'ones8': 1, 'twos8': 1, 'xor8': 1,
    'sum16': 2, 'fletcher16': 2, 'internet': 2,
    'sum32': 4, 'fletcher32': 4, 'adler32': 4
  };

  // compute(name, bytes[, little]) -> { hex, dec }
  function compute(name, bytes, little) {
    var le = little !== false; // default little-endian for word sums
    var v;
    switch (name) {
      case 'sum8': v = sum8(bytes); break;
      case 'sum16': v = sum16(bytes, le); break;
      case 'sum32': v = sum32(bytes, le); break;
      case 'ones8': v = onesComp8(bytes); break;
      case 'twos8': v = twosComp8(bytes); break;
      case 'xor8': v = xor8(bytes); break;
      case 'fletcher16': v = fletcher16(bytes); break;
      case 'fletcher32': v = fletcher32(bytes); break;
      case 'adler32': v = adler32(bytes); break;
      case 'internet': v = internet(bytes); break;
      default: throw new Error('Unknown checksum "' + name + '".');
    }
    v = v >>> 0;
    var width = WIDTH[name] || 4;
    var hex = v.toString(16).toUpperCase();
    while (hex.length < width * 2) hex = '0' + hex;
    return { hex: hex, dec: v };
  }

  var ALGOS = [
    { id: 'sum8', label: '8-bit sum', endian: false },
    { id: 'sum16', label: '16-bit sum', endian: true },
    { id: 'sum32', label: '32-bit sum', endian: true },
    { id: 'ones8', label: "One's-complement (8-bit)", endian: false },
    { id: 'twos8', label: "Two's-complement (8-bit)", endian: false },
    { id: 'xor8', label: 'XOR (8-bit, LRC)', endian: false },
    { id: 'fletcher16', label: 'Fletcher-16', endian: false },
    { id: 'fletcher32', label: 'Fletcher-32', endian: false },
    { id: 'adler32', label: 'Adler-32', endian: false },
    { id: 'internet', label: 'Internet checksum (RFC 1071)', endian: false }
  ];

  function toBinary(v, width) {
    var s = (v >>> 0).toString(2);
    while (s.length < width * 8) s = '0' + s;
    // group into nibbles for readability
    return s.replace(/(....)(?=.)/g, '$1 ');
  }

  // ---- DOM init -------------------------------------------------------------
  function init() {
    var input = AS.$('cs-input'), output = AS.$('cs-output');
    var inmode = AS.$('cs-inmode'), endian = AS.$('cs-endian'), base = AS.$('cs-base');
    var sample = AS.$('cs-sample'), clearBtn = AS.$('cs-clear'), copyBtn = AS.$('cs-copy');
    if (!input || !output) return;

    function lastResult() { return output.dataset.value || ''; }

    function go() {
      output.dataset.value = '';
      var raw = input.value;
      if (!raw || !raw.trim()) { AS.renderPlaceholder(output, 'Type or paste data to checksum.'); return; }
      var bytes;
      try {
        bytes = toBytes(raw, inmode.value);
      } catch (e) { AS.renderError(output, e.message); return; }

      var little = endian.value === 'little';
      var rows = '';
      var copyLines = [];
      for (var i = 0; i < ALGOS.length; i++) {
        var a = ALGOS[i];
        var res;
        try {
          res = compute(a.id, bytes, little);
        } catch (e2) { AS.renderError(output, e2.message); return; }
        var width = WIDTH[a.id] || 4;
        var shown;
        if (base.value === 'dec') shown = String(res.dec >>> 0);
        else if (base.value === 'bin') shown = toBinary(res.dec, width);
        else shown = '0x' + res.hex;
        var endianNote = a.endian
          ? ' <span class="tech-badge tech-badge--info">' + (little ? 'LE' : 'BE') + '</span>'
          : '';
        rows += '<div class="parsed-row"><span class="label">' + AS.escHTML(a.label) + endianNote +
          '</span><div class="value" style="font-family:\'JetBrains Mono\',monospace;">' +
          AS.escHTML(shown) + '</div></div>';
        copyLines.push(a.label + '\t' + shown);
      }
      output.dataset.value = copyLines.join('\n');
      output.innerHTML =
        '<div style="margin-bottom:10px;"><span class="tech-badge tech-badge--ok">' +
        bytes.length + ' bytes</span> <span class="tech-badge">' +
        AS.escHTML(inmode.value.toUpperCase()) + '</span> <span class="tech-badge tech-badge--info">' +
        AS.escHTML(base.value.toUpperCase()) + '</span></div>' + rows;
    }

    input.addEventListener('input', go);
    inmode.addEventListener('change', go);
    endian.addEventListener('change', go);
    base.addEventListener('change', go);
    if (sample) sample.addEventListener('click', function () {
      inmode.value = 'text';
      input.value = 'Wikipedia';
      go();
    });
    if (clearBtn) clearBtn.addEventListener('click', function () { input.value = ''; go(); input.focus(); });
    AS.bindCopy(copyBtn, lastResult);
    go();
  }

  // Expose pure logic for Node self-test and isolated reuse.
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { compute: compute };
  }
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  }
})();
