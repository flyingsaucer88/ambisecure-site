/* AmbiSecure — CBOR (RFC 8949) decoder.
   Accepts hex or base64url. Renders a structural tree using the same
   tlv-tree primitives the ASN.1 / TLV tools use. */
(function () {
  'use strict';

  function inputToBytes(raw) {
    var s = String(raw).trim();
    // base64url-y or contains URL-safe characters
    if (/[A-Za-z]/.test(s) && /^[A-Za-z0-9_\-=\s]+$/.test(s) && !/^[0-9A-Fa-f\s]+$/.test(s)) {
      return AmbiSecureB64URL.decode(s);
    }
    return AmbiSecureB64URL.hexToBytes(s);
  }

  function tagName(t) {
    var TAGS = {
      0: 'standard date/time string',
      1: 'epoch-based date/time',
      2: 'unsigned bignum',
      3: 'negative bignum',
      4: 'decimal fraction',
      5: 'bigfloat',
      24: 'encoded CBOR data item',
      32: 'URI',
      33: 'base64url',
      34: 'base64',
      35: 'regular expression',
      36: 'MIME message',
      55799: 'self-described CBOR'
    };
    return TAGS[t] || null;
  }

  function escapeHTML(s) { return AS.escHTML(s); }

  function nodeHtml(item, depth, opts) {
    if (!item) return '<div class="node">(null)</div>';
    var pad = depth || 0;
    var indent = ''; // CSS handles indentation per .node nest
    var isConstructed = (item.type === 'array' || item.type === 'map' || item.type === 'tag');
    var cls = 'node' + (isConstructed ? ' constructed' : '');

    function row(typeTag, summary, meaningHtml, children) {
      var r = '<div class="' + cls + '">';
      r += '<span class="tag">' + escapeHTML(typeTag) + '</span> ';
      if (summary !== undefined) r += '<span class="val">' + summary + '</span>';
      if (meaningHtml) r += '<span class="meaning">' + meaningHtml + '</span>';
      if (children) r += children;
      r += '</div>';
      return r;
    }

    switch (item.type) {
      case 'uint': return row('uint', String(item.value));
      case 'nint': return row('nint', String(item.value));
      case 'float': return row('float', String(item.value));
      case 'bool': return row('bool', item.value ? 'true' : 'false');
      case 'null': return row('null', 'null');
      case 'undef': return row('undef', 'undefined');
      case 'simple': return row('simple', String(item.value));
      case 'bytes': {
        var hex = AmbiSecureCBOR.bytesToHex(item.value);
        var preview = hex.length > 64 ? hex.slice(0, 64) + '…' : hex;
        return row('bytes (' + item.value.length + ')', preview);
      }
      case 'text': return row('text', '"' + escapeHTML(item.value) + '"');
      case 'tag': {
        var label = 'tag ' + item.tag;
        var t = tagName(item.tag); if (t) label += ' (' + t + ')';
        return row(label, '', '', nodeHtml(item.value, depth + 1, opts));
      }
      case 'array': {
        var inner = item.value.map(function (v) { return nodeHtml(v, depth + 1, opts); }).join('');
        return row('array', '[' + item.value.length + ']', '', inner);
      }
      case 'map': {
        var inner = item.value.map(function (kv) {
          var k = kv[0], v = kv[1];
          var kStr;
          if (k.type === 'text') kStr = '"' + escapeHTML(k.value) + '"';
          else if (k.type === 'uint' || k.type === 'nint') kStr = String(k.value);
          else kStr = '<' + k.type + '>';
          return '<div class="node">' +
            '<span class="tag">key</span> <span class="val">' + kStr + '</span>' +
            nodeHtml(v, depth + 2, opts) +
            '</div>';
        }).join('');
        return row('map', '{' + item.value.length + '}', '', inner);
      }
      default: return row(item.type || 'unknown', '');
    }
  }

  function init() {
    var input = AS.$('cbor-input'), output = AS.$('cbor-output');
    var sample = AS.$('cbor-sample'), clearBtn = AS.$('cbor-clear');
    if (!input || !output) return;

    function go() {
      var raw = (input.value || '').trim();
      if (!raw) { AS.renderPlaceholder(output, 'Paste CBOR bytes (hex or base64url).'); return; }
      try {
        var bytes = inputToBytes(raw);
        var dec = AmbiSecureCBOR.decode(bytes);
        var hdr = '<div style="margin-bottom:14px;">' +
          '<span class="tech-badge tech-badge--ok">CBOR</span> ' +
          '<span class="tech-badge">' + bytes.length + ' bytes</span>';
        if (dec.remaining > 0) hdr += ' <span class="tech-badge tech-badge--warn">' + dec.remaining + ' trailing bytes ignored</span>';
        hdr += '</div>';
        output.innerHTML = hdr +
          '<div class="tlv-tree">' + nodeHtml(dec.item, 0, {}) + '</div>' +
          '<details style="margin-top:14px;"><summary style="cursor:pointer; font-family:Montserrat,sans-serif; font-size:12px; color:var(--brand-grey);">Pretty-printed (CBOR diagnostic notation)</summary>' +
          '<pre style="margin-top:8px; padding:14px; background:var(--code-bg); color:var(--code-fg); border-radius:6px; font-size:12.5px; overflow-x:auto;">' +
          AS.escHTML(AmbiSecureCBOR.stringify(dec.item)) + '</pre></details>';
      } catch (e) { AS.renderError(output, e.message); }
    }
    input.addEventListener('input', go);
    if (sample) sample.addEventListener('click', function () {
      // sample CBOR map { 1: -7, 3: -7, -1: 1, -2: bytes(32), -3: bytes(32) } — COSE_Key (truncated example)
      input.value = 'a40102032620012158200102030405060708090a0b0c0d0e0f10111213141516171819ffffffffffffffff';
      go();
    });
    if (clearBtn) clearBtn.addEventListener('click', function () { input.value=''; go(); input.focus(); });
    go();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
