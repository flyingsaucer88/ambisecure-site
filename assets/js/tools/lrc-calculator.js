(function () {
  'use strict';

  // ---- byte helpers -------------------------------------------------------
  function hexToBytes(s) {
    var clean = String(s).replace(/0x/gi, '').replace(/[\s,:;]+/g, '');
    if (clean.length % 2 !== 0) throw new Error('Hex input must have an even number of digits.');
    if (!/^[0-9a-fA-F]*$/.test(clean)) throw new Error('Hex input contains non-hex characters.');
    var u8 = new Uint8Array(clean.length / 2);
    for (var i = 0; i < u8.length; i++) u8[i] = parseInt(clean.substr(i * 2, 2), 16);
    return u8;
  }

  function byteHex(b) { return ('0' + (b & 0xff).toString(16)).slice(-2).toUpperCase(); }

  function bytesToHex(u8) {
    var s = '';
    for (var i = 0; i < u8.length; i++) s += byteHex(u8[i]) + (i < u8.length - 1 ? ' ' : '');
    return s;
  }

  function word16(v) { return ('000' + (v & 0xffff).toString(16)).slice(-4).toUpperCase(); }

  // ---- core LRC -----------------------------------------------------------
  // Computes the chosen LRC variant over a Uint8Array.
  // Returns { value, width, steps:[{offset,byte,running}], label }.
  // width is 1 (8-bit / single byte) or 2 (16-bit / two bytes).
  function lrc(bytes, variant) {
    var u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || []);
    var steps = [];
    var acc = 0;
    var i, b;

    if (variant === 'xor') {
      for (i = 0; i < u8.length; i++) {
        b = u8[i];
        acc = (acc ^ b) & 0xff;
        steps.push({ offset: i, byte: b, running: acc });
      }
      return { value: acc & 0xff, width: 1, steps: steps, label: 'XOR LRC' };
    }

    if (variant === 'sum8mod') {
      for (i = 0; i < u8.length; i++) {
        b = u8[i];
        acc = (acc + b) & 0xff;
        steps.push({ offset: i, byte: b, running: acc });
      }
      return { value: acc & 0xff, width: 1, steps: steps, label: 'Additive 8-bit modulo-256 sum' };
    }

    if (variant === 'twos8') {
      for (i = 0; i < u8.length; i++) {
        b = u8[i];
        acc = (acc + b) & 0xff;
        steps.push({ offset: i, byte: b, running: acc });
      }
      // two's-complement: (256 - (sum & 0xFF)) & 0xFF
      return { value: ((256 - (acc & 0xff)) & 0xff), width: 1, steps: steps, label: 'Additive 8-bit two’s-complement LRC' };
    }

    if (variant === 'sum16mod') {
      for (i = 0; i < u8.length; i++) {
        b = u8[i];
        acc = (acc + b) & 0xffff;
        steps.push({ offset: i, byte: b, running: acc });
      }
      return { value: acc & 0xffff, width: 2, steps: steps, label: 'Additive 16-bit modulo-65536 sum' };
    }

    if (variant === 'twos16') {
      for (i = 0; i < u8.length; i++) {
        b = u8[i];
        acc = (acc + b) & 0xffff;
        steps.push({ offset: i, byte: b, running: acc });
      }
      return { value: ((65536 - (acc & 0xffff)) & 0xffff), width: 2, steps: steps, label: 'Additive 16-bit two’s-complement LRC' };
    }

    throw new Error('Unknown LRC variant "' + variant + '".');
  }

  // Build the input byte array from raw input, mode, and framing options.
  function buildBytes(raw, inmode, addStx, addEtx) {
    var body = inmode === 'hex' ? hexToBytes(raw) : new TextEncoder().encode(raw);
    var out = [];
    if (addStx) out.push(0x02);
    for (var i = 0; i < body.length; i++) out.push(body[i]);
    if (addEtx) out.push(0x03);
    return new Uint8Array(out);
  }

  // ---- UI -----------------------------------------------------------------
  function valueHex(res) {
    return res.width === 2 ? word16(res.value) : byteHex(res.value);
  }

  function renderTable(steps) {
    if (!steps.length) return '';
    var max = 256;
    var rows = '';
    var shown = steps.length > max ? steps.slice(0, max) : steps;
    for (var i = 0; i < shown.length; i++) {
      var s = shown[i];
      var ch = (s.byte >= 0x20 && s.byte <= 0x7e) ? String.fromCharCode(s.byte) : '.';
      rows += '<tr><td>' + s.offset + '</td><td>' + byteHex(s.byte) + '</td><td>' + AS.escHTML(ch) +
        '</td><td>' + (s.running > 0xff ? word16(s.running) : byteHex(s.running)) + '</td></tr>';
    }
    var note = steps.length > max
      ? '<p style="font-size:12px;color:var(--brand-grey);margin:6px 0 0;">Showing the first ' + max + ' of ' + steps.length + ' steps.</p>'
      : '';
    return '<div style="margin-top:14px;"><h3 style="font-size:13px;margin:0 0 6px;">Running accumulator</h3>' +
      '<table class="lrc-table" style="border-collapse:collapse;font-family:\'JetBrains Mono\',monospace;font-size:12.5px;width:100%;">' +
      '<thead><tr style="text-align:left;"><th style="padding:3px 10px 3px 0;">Off</th><th style="padding:3px 10px 3px 0;">Byte</th>' +
      '<th style="padding:3px 10px 3px 0;">Char</th><th style="padding:3px 0;">Running</th></tr></thead><tbody>' +
      rows + '</tbody></table>' + note + '</div>';
  }

  function init() {
    var input = AS.$('lrc-input'), output = AS.$('lrc-output');
    var variant = AS.$('lrc-variant'), inmode = AS.$('lrc-inmode');
    var stx = AS.$('lrc-stx'), etx = AS.$('lrc-etx');
    var sample = AS.$('lrc-sample'), clearBtn = AS.$('lrc-clear'), copyBtn = AS.$('lrc-copy');
    if (!input || !output) return;

    function lastResult() { return output.dataset.value || ''; }

    function go() {
      output.dataset.value = '';
      var raw = input.value;
      if (!raw.trim()) { AS.renderPlaceholder(output, 'Enter text or hex bytes to compute an LRC.'); return; }
      try {
        var bytes = buildBytes(raw, inmode.value, !!stx.checked, !!etx.checked);
        if (!bytes.length) { AS.renderPlaceholder(output, 'No bytes to process.'); return; }
        var res = lrc(bytes, variant.value);
        var vhex = valueHex(res);
        output.dataset.value = vhex;
        var frame = (stx.checked ? 'STX ' : '') + bytesToHex(bytes) + (etx.checked ? '' : '');
        output.innerHTML =
          '<div style="margin-bottom:10px;"><span class="tech-badge tech-badge--ok">' + AS.escHTML(res.label) + '</span> ' +
          '<span class="tech-badge">' + bytes.length + ' bytes</span> ' +
          '<span class="tech-badge tech-badge--info">' + (res.width === 2 ? '16-bit' : '8-bit') + '</span></div>' +
          '<div class="parsed-row"><span class="label">LRC (hex)</span><div class="value" style="font-family:\'JetBrains Mono\',monospace;font-size:18px;">' +
          AS.escHTML(vhex) + '</div></div>' +
          '<div class="parsed-row"><span class="label">LRC (dec)</span><div class="value" style="font-family:\'JetBrains Mono\',monospace;">' +
          res.value + '</div></div>' +
          '<div class="parsed-row"><span class="label">Bytes processed</span><div class="value" style="font-family:\'JetBrains Mono\',monospace;word-break:break-all;">' +
          AS.escHTML(bytesToHex(bytes)) + '</div></div>' +
          renderTable(res.steps);
      } catch (e) { AS.renderError(output, e.message); }
    }

    input.addEventListener('input', go);
    variant.addEventListener('change', go);
    inmode.addEventListener('change', go);
    stx.addEventListener('change', go);
    etx.addEventListener('change', go);
    if (sample) sample.addEventListener('click', function () {
      if (inmode.value === 'hex') { input.value = '31 32 33 34 35 36 37'; }
      else { input.value = '1234567'; }
      stx.checked = false; etx.checked = false;
      go();
    });
    if (clearBtn) clearBtn.addEventListener('click', function () { input.value = ''; go(); input.focus(); });
    AS.bindCopy(copyBtn, lastResult);
    go();
  }

  // Expose pure logic for Node self-test and isolated reuse.
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { lrc: lrc, buildBytes: buildBytes, hexToBytes: hexToBytes };
  }
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  }
})();
