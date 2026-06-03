(function () {
  'use strict';

  // CRC parameter catalogue (Greg Cook / reveng). Each entry:
  // { width, poly, init, refin, refout, xorout, check } using BigInt for poly/init/xorout.
  // 'check' is the CRC of the ASCII string "123456789".
  function P(width, poly, init, refin, refout, xorout, check) {
    return {
      width: width,
      poly: BigInt(poly),
      init: BigInt(init),
      refin: refin,
      refout: refout,
      xorout: BigInt(xorout),
      check: BigInt(check)
    };
  }

  var PRESETS = {
    'CRC-3/GSM': P(3, 0x3, 0x0, false, false, 0x7, 0x4),
    'CRC-4/ITU': P(4, 0x3, 0x0, true, true, 0x0, 0x7),
    'CRC-5/EPC': P(5, 0x09, 0x09, false, false, 0x00, 0x00),
    'CRC-5/USB': P(5, 0x05, 0x1f, true, true, 0x1f, 0x19),
    'CRC-6/CDMA2000-A': P(6, 0x27, 0x3f, false, false, 0x00, 0x0d),
    'CRC-6/CDMA2000-B': P(6, 0x07, 0x3f, false, false, 0x00, 0x3b),
    'CRC-7/MMC': P(7, 0x09, 0x00, false, false, 0x00, 0x75),
    'CRC-8': P(8, 0x07, 0x00, false, false, 0x00, 0xf4),
    'CRC-8/CDMA2000': P(8, 0x9b, 0xff, false, false, 0x00, 0xda),
    'CRC-8/DARC': P(8, 0x39, 0x00, true, true, 0x00, 0x15),
    'CRC-8/DVB-S2': P(8, 0xd5, 0x00, false, false, 0x00, 0xbc),
    'CRC-8/EBU (AES)': P(8, 0x1d, 0xff, true, true, 0x00, 0x97),
    'CRC-8/I-CODE': P(8, 0x1d, 0xfd, false, false, 0x00, 0x7e),
    'CRC-8/ITU': P(8, 0x07, 0x00, false, false, 0x55, 0xa1),
    'CRC-8/MAXIM': P(8, 0x31, 0x00, true, true, 0x00, 0xa1),
    'CRC-8/ROHC': P(8, 0x07, 0xff, true, true, 0x00, 0xd0),
    'CRC-8/SAE-J1850': P(8, 0x1d, 0xff, false, false, 0xff, 0x4b),
    'CRC-10': P(10, 0x233, 0x000, false, false, 0x000, 0x199),
    'CRC-11': P(11, 0x385, 0x01a, false, false, 0x000, 0x5a3),
    'CRC-12/3GPP': P(12, 0x80f, 0x000, false, true, 0x000, 0xdaf),
    'CRC-15/CAN': P(15, 0x4599, 0x0000, false, false, 0x0000, 0x059e),
    'CRC-16/CCITT-FALSE': P(16, 0x1021, 0xffff, false, false, 0x0000, 0x29b1),
    'CRC-16/ARC': P(16, 0x8005, 0x0000, true, true, 0x0000, 0xbb3d),
    'CRC-16/AUG-CCITT': P(16, 0x1021, 0x1d0f, false, false, 0x0000, 0xe5cc),
    'CRC-16/BUYPASS': P(16, 0x8005, 0x0000, false, false, 0x0000, 0xfee8),
    'CRC-16/CDMA2000': P(16, 0xc867, 0xffff, false, false, 0x0000, 0x4c06),
    'CRC-16/DDS-110': P(16, 0x8005, 0x800d, false, false, 0x0000, 0x9ecf),
    'CRC-16/DECT-R': P(16, 0x0589, 0x0000, false, false, 0x0001, 0x007e),
    'CRC-16/DECT-X': P(16, 0x0589, 0x0000, false, false, 0x0000, 0x007f),
    'CRC-16/DNP': P(16, 0x3d65, 0x0000, true, true, 0xffff, 0xea82),
    'CRC-16/EN-13757': P(16, 0x3d65, 0x0000, false, false, 0xffff, 0xc2b7),
    'CRC-16/GENIBUS': P(16, 0x1021, 0xffff, false, false, 0xffff, 0xd64e),
    'CRC-16/MAXIM': P(16, 0x8005, 0x0000, true, true, 0xffff, 0x44c2),
    'CRC-16/MCRF4XX': P(16, 0x1021, 0xffff, true, true, 0x0000, 0x6f91),
    'CRC-16/RIELLO': P(16, 0x1021, 0xb2aa, true, true, 0x0000, 0x63d0),
    'CRC-16/T10-DIF': P(16, 0x8bb7, 0x0000, false, false, 0x0000, 0xd0db),
    'CRC-16/TELEDISK': P(16, 0xa097, 0x0000, false, false, 0x0000, 0x0fb3),
    'CRC-16/TMS37157': P(16, 0x1021, 0x89ec, true, true, 0x0000, 0x26b1),
    'CRC-16/USB': P(16, 0x8005, 0xffff, true, true, 0xffff, 0xb4c8),
    'CRC-16/X-25': P(16, 0x1021, 0xffff, true, true, 0xffff, 0x906e),
    'CRC-16/XMODEM': P(16, 0x1021, 0x0000, false, false, 0x0000, 0x31c3),
    'CRC-16/KERMIT': P(16, 0x1021, 0x0000, true, true, 0x0000, 0x2189),
    'CRC-16/MODBUS': P(16, 0x8005, 0xffff, true, true, 0x0000, 0x4b37),
    'CRC-24': P(24, 0x864cfb, 0xb704ce, false, false, 0x000000, 0x21cf02),
    'CRC-24/FLEXRAY-A': P(24, 0x5d6dcb, 0xfedcba, false, false, 0x000000, 0x7979bd),
    'CRC-24/FLEXRAY-B': P(24, 0x5d6dcb, 0xabcdef, false, false, 0x000000, 0x1f23b8),
    'CRC-32': P(32, 0x04c11db7, 0xffffffff, true, true, 0xffffffff, 0xcbf43926),
    'CRC-32/BZIP2': P(32, 0x04c11db7, 0xffffffff, false, false, 0xffffffff, 0xfc891918),
    'CRC-32C': P(32, 0x1edc6f41, 0xffffffff, true, true, 0xffffffff, 0xe3069283),
    'CRC-32D': P(32, 0xa833982b, 0xffffffff, true, true, 0xffffffff, 0x87315576),
    'CRC-32/MPEG-2': P(32, 0x04c11db7, 0xffffffff, false, false, 0x00000000, 0x0376e6e7),
    'CRC-32/POSIX': P(32, 0x04c11db7, 0x00000000, false, false, 0xffffffff, 0x765e7680),
    'CRC-32Q': P(32, 0x814141ab, 0x00000000, false, false, 0x00000000, 0x3010bf7f),
    'CRC-32/JAMCRC': P(32, 0x04c11db7, 0xffffffff, true, true, 0x00000000, 0x340bc6d9),
    'CRC-32/XFER': P(32, 0x000000af, 0x00000000, false, false, 0x00000000, 0xbd0be338),
    'CRC-64/ECMA-182': P(64, 0x42f0e1eba9ea3693n, 0x0000000000000000n, false, false, 0x0000000000000000n, 0x6c40df5f0b497347n),
    'CRC-64/GO-ISO': P(64, 0x000000000000001bn, 0xffffffffffffffffn, true, true, 0xffffffffffffffffn, 0xb90956c775a41001n),
    'CRC-64/WE': P(64, 0x42f0e1eba9ea3693n, 0xffffffffffffffffn, false, false, 0xffffffffffffffffn, 0x62ec59e3f1a4f00an),
    'CRC-64/XZ': P(64, 0x42f0e1eba9ea3693n, 0xffffffffffffffffn, true, true, 0xffffffffffffffffn, 0x995dc9bbdf1939fan)
  };

  // Reflect the low `width` bits of value (BigInt -> BigInt).
  function reflect(value, width) {
    var out = 0n;
    var w = BigInt(width);
    for (var i = 0n; i < w; i++) {
      if ((value >> i) & 1n) out |= (1n << (w - 1n - i));
    }
    return out;
  }

  // Generic bit-by-bit CRC engine. params = {width,poly,init,refin,refout,xorout}.
  // bytes = Uint8Array or plain array of byte values.
  function crcCompute(params, bytes) {
    var width = params.width;
    var w = BigInt(width);
    var poly = BigInt(params.poly);
    var topBit = 1n << (w - 1n);
    var mask = (1n << w) - 1n;
    var reg = BigInt(params.init) & mask;

    // Feed each message bit MSB-first (after optional input reflection of the
    // byte). Bringing one bit at a time into the top of the register keeps the
    // engine correct for every width 3..64, including widths below 8 where a
    // whole-byte shift would underflow.
    for (var i = 0; i < bytes.length; i++) {
      var b = BigInt(bytes[i] & 0xff);
      if (params.refin) b = reflect(b, 8);
      for (var k = 7; k >= 0; k--) {
        var bit = (b >> BigInt(k)) & 1n;
        var msb = (reg & topBit) ? 1n : 0n;
        reg = (reg << 1n) & mask;
        if (msb ^ bit) reg ^= poly;
      }
    }
    if (params.refout) reg = reflect(reg, width);
    reg = (reg ^ (BigInt(params.xorout) & mask)) & mask;
    return reg;
  }

  function strToBytes(s) {
    var out = [];
    // UTF-8 encode without relying on TextEncoder for Node test parity.
    if (typeof TextEncoder !== 'undefined') {
      return new TextEncoder().encode(String(s));
    }
    var str = unescape(encodeURIComponent(String(s)));
    for (var i = 0; i < str.length; i++) out.push(str.charCodeAt(i) & 0xff);
    return out;
  }

  // Public engine: crc(presetNameOrParams, bytesOrString) -> BigInt
  function crc(presetNameOrParams, bytesOrString) {
    var params;
    if (typeof presetNameOrParams === 'string') {
      params = PRESETS[presetNameOrParams];
      if (!params) throw new Error('Unknown CRC preset: ' + presetNameOrParams);
    } else {
      params = presetNameOrParams;
    }
    var bytes;
    if (typeof bytesOrString === 'string') {
      bytes = strToBytes(bytesOrString);
    } else {
      bytes = bytesOrString;
    }
    return crcCompute(params, bytes);
  }

  // ---- Formatting helpers ----
  function toHex(value, width) {
    var digits = Math.ceil(width / 4);
    var s = (value & ((1n << BigInt(width)) - 1n)).toString(16);
    while (s.length < digits) s = '0' + s;
    return '0x' + s.toUpperCase();
  }
  function toBin(value, width) {
    var s = (value & ((1n << BigInt(width)) - 1n)).toString(2);
    while (s.length < width) s = '0' + s;
    return s;
  }

  function parseHexInput(s) {
    var clean = String(s).replace(/0x/gi, '').replace(/[\s,:;_-]+/g, '');
    if (clean === '') return [];
    if (clean.length % 2 !== 0) throw new Error('Hex input must have an even number of digits.');
    if (!/^[0-9a-fA-F]*$/.test(clean)) throw new Error('Hex input contains non-hex characters.');
    var out = [];
    for (var i = 0; i < clean.length; i += 2) out.push(parseInt(clean.substr(i, 2), 16));
    return out;
  }

  function parseBinInput(s) {
    var clean = String(s).replace(/[\s,_]+/g, '');
    if (clean === '') return [];
    if (!/^[01]+$/.test(clean)) throw new Error('Binary input may only contain 0 and 1 (whitespace allowed).');
    if (clean.length % 8 !== 0) throw new Error('Binary input length must be a multiple of 8 bits.');
    var out = [];
    for (var i = 0; i < clean.length; i += 8) out.push(parseInt(clean.substr(i, 8), 2));
    return out;
  }

  function init() {
    var input = AS.$('crc-input'), output = AS.$('crc-output');
    var presetSel = AS.$('crc-preset'), inmode = AS.$('crc-inmode');
    var widthEl = AS.$('crc-width'), polyEl = AS.$('crc-poly'), initEl = AS.$('crc-init');
    var refinEl = AS.$('crc-refin'), refoutEl = AS.$('crc-refout'), xoroutEl = AS.$('crc-xorout');
    var customFields = AS.$('crc-custom-fields');
    var sample = AS.$('crc-sample'), clearBtn = AS.$('crc-clear'), copyBtn = AS.$('crc-copy');
    if (!input || !output || !presetSel) return;

    // Populate preset dropdown.
    var names = Object.keys(PRESETS);
    var optHtml = '<option value="custom">Custom (set fields below)</option>';
    for (var n = 0; n < names.length; n++) {
      optHtml += '<option value="' + AS.escHTML(names[n]) + '">' + AS.escHTML(names[n]) + '</option>';
    }
    presetSel.innerHTML = optHtml;
    presetSel.value = 'CRC-32';

    function isCustom() { return presetSel.value === 'custom'; }

    function syncFieldsFromPreset() {
      if (isCustom()) { customFields.style.display = ''; return; }
      var p = PRESETS[presetSel.value];
      widthEl.value = String(p.width);
      polyEl.value = toHex(p.poly, p.width);
      initEl.value = toHex(p.init, p.width);
      xoroutEl.value = toHex(p.xorout, p.width);
      refinEl.checked = p.refin;
      refoutEl.checked = p.refout;
      customFields.style.display = 'none';
    }

    function currentParams() {
      if (!isCustom()) return PRESETS[presetSel.value];
      var width = parseInt(widthEl.value, 10);
      if (!(width >= 3 && width <= 64)) throw new Error('Width must be an integer between 3 and 64.');
      function bi(label, v) {
        var t = String(v).trim().replace(/^0x/i, '');
        if (t === '') t = '0';
        if (!/^[0-9a-fA-F]+$/.test(t)) throw new Error(label + ' must be a hex value.');
        return BigInt('0x' + t);
      }
      var mask = (1n << BigInt(width)) - 1n;
      var poly = bi('Polynomial', polyEl.value) & mask;
      var ini = bi('Init', initEl.value) & mask;
      var xor = bi('XorOut', xoroutEl.value) & mask;
      return {
        width: width, poly: poly, init: ini,
        refin: !!refinEl.checked, refout: !!refoutEl.checked, xorout: xor
      };
    }

    function getBytes() {
      var raw = input.value;
      if (inmode.value === 'hex') return parseHexInput(raw);
      if (inmode.value === 'binary') return parseBinInput(raw);
      return strToBytes(raw);
    }

    function go() {
      output.dataset.value = '';
      var params;
      try { params = currentParams(); }
      catch (e) { AS.renderError(output, e.message); return; }

      var bytes;
      try { bytes = getBytes(); }
      catch (e) { AS.renderError(output, e.message); return; }

      var raw = input.value;
      if (!raw.trim()) {
        // Still show the parameter / check-value verification even with empty input.
        renderResult(params, null);
        return;
      }
      renderResult(params, bytes);
    }

    function checkBadge(params) {
      // Recompute documented check value over "123456789" for named presets.
      if (isCustom()) return '';
      var p = PRESETS[presetSel.value];
      var computed = crcCompute(p, strToBytes('123456789'));
      var pass = computed === p.check;
      var cls = pass ? 'tech-badge--ok' : 'tech-badge--err';
      var word = pass ? 'check PASS' : 'check FAIL';
      return '<span class="tech-badge ' + cls + '">' + word + '</span> ' +
        '<span class="tech-badge tech-badge--info">check ' + AS.escHTML(toHex(p.check, p.width)) +
        ' vs computed ' + AS.escHTML(toHex(computed, p.width)) + '</span>';
    }

    function renderResult(params, bytes) {
      var w = params.width;
      var paramLine =
        '<span class="tech-badge">width ' + w + '</span> ' +
        '<span class="tech-badge">poly ' + AS.escHTML(toHex(params.poly, w)) + '</span> ' +
        '<span class="tech-badge">init ' + AS.escHTML(toHex(params.init, w)) + '</span> ' +
        '<span class="tech-badge">refin ' + (params.refin ? 'true' : 'false') + '</span> ' +
        '<span class="tech-badge">refout ' + (params.refout ? 'true' : 'false') + '</span> ' +
        '<span class="tech-badge">xorout ' + AS.escHTML(toHex(params.xorout, w)) + '</span>';

      var html = '<div style="margin-bottom:10px;">' + checkBadge(params) + '</div>' +
        '<div style="margin-bottom:12px;">' + paramLine + '</div>';

      if (bytes === null) {
        html += '<div class="placeholder">Enter input above to compute its CRC. Parameters and the catalogue check value are shown.</div>';
        output.innerHTML = html;
        return;
      }

      var value = crcCompute(params, bytes);
      var hex = toHex(value, w);
      var dec = value.toString(10);
      var bin = toBin(value, w);
      output.dataset.value = hex;

      html +=
        '<div class="parsed-row"><span class="label">Bytes in</span><div class="value">' + bytes.length + '</div></div>' +
        '<div class="parsed-row"><span class="label">CRC (hex)</span><div class="value" style="font-family:\'JetBrains Mono\',monospace;font-size:15px;">' + AS.escHTML(hex) + '</div></div>' +
        '<div class="parsed-row"><span class="label">CRC (dec)</span><div class="value" style="font-family:\'JetBrains Mono\',monospace;">' + AS.escHTML(dec) + '</div></div>' +
        '<div class="parsed-row"><span class="label">CRC (bin)</span><div class="value" style="font-family:\'JetBrains Mono\',monospace;word-break:break-all;">' + AS.escHTML(bin) + '</div></div>';
      output.innerHTML = html;
    }

    presetSel.addEventListener('change', function () { syncFieldsFromPreset(); go(); });
    inmode.addEventListener('change', go);
    input.addEventListener('input', go);
    [widthEl, polyEl, initEl, xoroutEl].forEach(function (el) {
      if (el) el.addEventListener('input', go);
    });
    [refinEl, refoutEl].forEach(function (el) {
      if (el) el.addEventListener('change', go);
    });

    if (sample) sample.addEventListener('click', function () {
      inmode.value = 'text';
      input.value = '123456789';
      go();
    });
    if (clearBtn) clearBtn.addEventListener('click', function () { input.value = ''; go(); input.focus(); });
    AS.bindCopy(copyBtn, function () { return output.dataset.value || ''; });

    syncFieldsFromPreset();
    go();
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { crc: crc, PRESETS: PRESETS };
  }
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  }
})();
