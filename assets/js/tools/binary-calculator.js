(function () {
  'use strict';

  // Mask for a given bit width, e.g. 8 -> 0xFF.
  function maskFor(width) {
    return (1n << BigInt(width)) - 1n;
  }

  // Parse a string in the given base into a BigInt. Honours 0x/0b/0o prefixes
  // which override the supplied base. Throws on invalid input.
  function parseValue(str, base) {
    var s = String(str == null ? '' : str).trim().replace(/[_\s]/g, '');
    if (!s) throw new Error('Empty input.');
    var neg = false;
    if (s.charAt(0) === '+') s = s.slice(1);
    else if (s.charAt(0) === '-') { neg = true; s = s.slice(1); }
    var b = Number(base) || 10;
    var m = s.match(/^0([xbo])/i);
    if (m) {
      var p = m[1].toLowerCase();
      b = p === 'x' ? 16 : p === 'b' ? 2 : 8;
      s = s.slice(2);
    }
    if (!s) throw new Error('No digits after sign or prefix.');
    var digits = '0123456789abcdefghijklmnopqrstuvwxyz'.slice(0, b);
    var re = new RegExp('^[' + digits + ']+$', 'i');
    if (!re.test(s)) {
      throw new Error('"' + str + '" is not a valid base-' + b + ' value.');
    }
    var v = 0n, bb = BigInt(b);
    for (var i = 0; i < s.length; i++) {
      v = v * bb + BigInt(parseInt(s.charAt(i), b));
    }
    return neg ? -v : v;
  }

  // Reduce a (possibly negative or oversized) BigInt into the unsigned
  // representation for the width. Returns { value, truncated }.
  function toWidth(v, width) {
    var mask = maskFor(width);
    var u = v & mask;
    // Flag when bits fell outside the width window (positive overflow, or a
    // negative magnitude that does not fit the two's-complement range).
    var signBit = 1n << BigInt(width - 1);
    var truncated = v < 0n ? (-v) > signBit : v > mask;
    return { value: u, truncated: truncated };
  }

  // Signed (two's complement) interpretation of an unsigned width value.
  function asSigned(u, width) {
    var signBit = 1n << BigInt(width - 1);
    if (u & signBit) return u - (1n << BigInt(width));
    return u;
  }

  // Group a binary string into nibbles (4 bits) from the right.
  function groupNibbles(bin) {
    var out = [];
    for (var i = bin.length; i > 0; i -= 4) {
      out.unshift(bin.slice(Math.max(0, i - 4), i));
    }
    return out.join(' ');
  }

  function toBin(u, width) {
    return u.toString(2).padStart(width, '0');
  }
  function toHex(u, width) {
    return u.toString(16).toUpperCase().padStart(width / 4, '0');
  }
  function toOct(u) {
    return u.toString(8);
  }

  // Apply a bitwise operation. a, b are unsigned BigInts already in width.
  // Returns an unsigned BigInt in width.
  function applyOp(op, a, b, width) {
    var mask = maskFor(width);
    var r;
    switch (op) {
      case 'and': r = a & b; break;
      case 'or': r = a | b; break;
      case 'xor': r = a ^ b; break;
      case 'not': r = ~a; break;
      case 'shl': r = a << b; break;
      case 'shr_logical': r = a >> b; break;
      case 'shr_arith':
        r = asSigned(a, width) >> b; // BigInt >> on negative is arithmetic
        break;
      default: throw new Error('Unknown operation.');
    }
    return r & mask;
  }

  function badges(parts) { return '<div style="margin-bottom:10px;">' + parts.join(' ') + '</div>'; }
  function badge(cls, txt, esc) { return '<span class="tech-badge ' + cls + '">' + (esc ? esc(txt) : txt) + '</span>'; }

  function rowsHtml(u, width, esc) {
    var bin = toBin(u, width);
    var signed = asSigned(u, width);
    function row(label, value, mono) {
      return '<div class="parsed-row"><span class="label">' + label + '</span><div class="value"' +
        (mono ? ' style="font-family:\'JetBrains Mono\',monospace;word-break:break-all;"' : '') + '>' +
        esc(value) + '</div></div>';
    }
    return row('Binary', groupNibbles(bin), true) +
      row('Hex', '0x' + toHex(u, width), true) +
      row('Octal', '0o' + toOct(u), true) +
      row('Decimal (unsigned)', u.toString(10), true) +
      row('Decimal (signed)', signed.toString(10), true);
  }

  function init() {
    var convVal = AS.$('bc-conv-value'), convBase = AS.$('bc-conv-base');
    var convWidth = AS.$('bc-conv-width'), convSign = AS.$('bc-conv-sign');
    var convOut = AS.$('bc-conv-output');
    var opA = AS.$('bc-op-a'), opB = AS.$('bc-op-b'), opOp = AS.$('bc-op-op');
    var opBase = AS.$('bc-op-base'), opOut = AS.$('bc-op-output');
    var sample = AS.$('bc-sample'), clearBtn = AS.$('bc-clear'), copyBtn = AS.$('bc-op-copy');
    if (!convVal || !convOut || !opOut) return;

    function width() { return parseInt(convWidth.value, 10) || 32; }

    function runConv() {
      convOut.dataset.value = '';
      var raw = convVal.value;
      if (!raw.trim()) { AS.renderPlaceholder(convOut, 'Enter a value to see all bases.'); return; }
      try {
        var w = width();
        var v = parseValue(raw, convBase.value);
        var t = toWidth(v, w);
        var head = badges([
          badge('tech-badge--ok', w + '-bit', AS.escHTML),
          badge('tech-badge--info', convSign.value === 'signed' ? 'SIGNED' : 'UNSIGNED', AS.escHTML),
          t.truncated ? badge('tech-badge--warn', 'TRUNCATED to width', AS.escHTML) : ''
        ]);
        convOut.dataset.value = '0x' + toHex(t.value, w);
        convOut.innerHTML = head + rowsHtml(t.value, w, AS.escHTML);
      } catch (e) { AS.renderError(convOut, e.message); }
    }

    function runOp() {
      opOut.dataset.value = '';
      var op = opOp.value;
      var needB = op !== 'not';
      if (!opA.value.trim()) { AS.renderPlaceholder(opOut, 'Choose an operation and enter operands.'); return; }
      try {
        var w = width();
        var a = toWidth(parseValue(opA.value, opBase.value), w).value;
        var b = 0n;
        if (needB) {
          if (!opB.value.trim()) { AS.renderPlaceholder(opOut, 'Enter operand B.'); return; }
          var rawB = parseValue(opB.value, opBase.value);
          if (op === 'shl' || op === 'shr_logical' || op === 'shr_arith') {
            if (rawB < 0n) throw new Error('Shift amount cannot be negative.');
            b = rawB; // shift amount is not width-masked
          } else {
            b = toWidth(rawB, w).value;
          }
        }
        var r = applyOp(op, a, b, w);
        var labels = { and: 'A AND B', or: 'A OR B', xor: 'A XOR B', not: 'NOT A',
          shl: 'A << B', shr_logical: 'A >>> B (logical)', shr_arith: 'A >> B (arithmetic)' };
        var head = badges([
          badge('tech-badge--ok', labels[op], AS.escHTML),
          badge('tech-badge--info', w + '-bit', AS.escHTML)
        ]);
        opOut.dataset.value = '0x' + toHex(r, w);
        opOut.innerHTML = head + rowsHtml(r, w, AS.escHTML);
      } catch (e) { AS.renderError(opOut, e.message); }
    }

    function runAll() { runConv(); runOp(); }

    convVal.addEventListener('input', runConv);
    convBase.addEventListener('change', runConv);
    convWidth.addEventListener('change', runAll);
    convSign.addEventListener('change', runConv);
    opA.addEventListener('input', runOp);
    opB.addEventListener('input', runOp);
    opOp.addEventListener('change', runOp);
    opBase.addEventListener('change', runOp);

    if (sample) sample.addEventListener('click', function () {
      convBase.value = '16'; convWidth.value = '16'; convSign.value = 'signed';
      convVal.value = '0xFF80';
      opBase.value = '16'; opOp.value = 'and';
      opA.value = '0xFF80'; opB.value = '0x0FF0';
      runAll();
      convVal.focus();
    });
    if (clearBtn) clearBtn.addEventListener('click', function () {
      convVal.value = ''; opA.value = ''; opB.value = '';
      runAll(); convVal.focus();
    });
    AS.bindCopy(copyBtn, function () { return opOut.dataset.value || ''; });

    runAll();
  }

  // Expose pure logic for Node-based self-test and isolated reuse.
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      parseValue: parseValue, toWidth: toWidth, asSigned: asSigned,
      applyOp: applyOp, groupNibbles: groupNibbles, maskFor: maskFor,
      toBin: toBin, toHex: toHex, toOct: toOct
    };
  }
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  }
})();
