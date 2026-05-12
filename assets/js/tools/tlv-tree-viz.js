(function () {
  'use strict';


  var TAGS = {
    '4F': 'AID (Application Identifier)',
    '50': 'Application Label',
    '57': 'Track 2 Equivalent Data',
    '5A': 'PAN',
    '5F20': 'Cardholder Name',
    '5F24': 'Application Expiration Date',
    '5F25': 'Application Effective Date',
    '5F28': 'Issuer Country Code',
    '5F2A': 'Transaction Currency Code',
    '5F2D': 'Language Preference',
    '5F30': 'Service Code',
    '5F34': 'Application PAN Sequence Number',
    '6F':   'FCI Template',
    '70':   'AEF Data Template',
    '77':   'Response Message Template Format 2',
    '80':   'Response Message Template Format 1',
    '82':   'Application Interchange Profile',
    '84':   'DF Name',
    '87':   'Application Priority Indicator',
    '88':   'SFI',
    '8C':   'CDOL1',
    '8D':   'CDOL2',
    '8E':   'CVM List',
    '8F':   'CA Public Key Index',
    '94':   'AFL',
    '95':   'TVR',
    '9A':   'Transaction Date',
    '9C':   'Transaction Type',
    '9F02': 'Amount, Authorised',
    '9F03': 'Amount, Other',
    '9F1A': 'Terminal Country Code',
    '9F26': 'Application Cryptogram',
    '9F27': 'Cryptogram Information Data',
    '9F33': 'Terminal Capabilities',
    '9F34': 'CVM Results',
    '9F36': 'ATC',
    '9F37': 'Unpredictable Number',
    '9F38': 'PDOL',
    '9F40': 'Additional Terminal Capabilities',
    'A5':   'FCI Proprietary Template',
    'BF0C': 'FCI Issuer Discretionary Data'
  };

  function clean(hex) { return String(hex).replace(/0x/gi,'').replace(/[\s,;:_-]+/g,'').toLowerCase(); }
  function toBytes(hex) {
    var s = clean(hex);
    if (!/^[0-9a-f]*$/.test(s)) throw new Error('Non-hex characters.');
    if (s.length % 2 !== 0) throw new Error('Hex length must be even.');
    var b = []; for (var i = 0; i < s.length; i += 2) b.push(parseInt(s.substr(i, 2), 16));
    return b;
  }
  function bytesHex(b) { return b.map(function (x) { return x.toString(16).toUpperCase().padStart(2, '0'); }).join(''); }
  function bytesHexSpaced(b) { return b.map(function (x) { return x.toString(16).toUpperCase().padStart(2, '0'); }).join(' '); }

  function decodeTag(b, off) {
    var first = b[off]; var len = 1;
    if ((first & 0x1F) === 0x1F) {
      while (off + len < b.length) {
        var byte = b[off + len]; len += 1;
        if (!(byte & 0x80)) break;
      }
    }
    var tagBytes = b.slice(off, off + len);
    return { tag: bytesHex(tagBytes), bytes: len, isConstructed: !!(first & 0x20) };
  }

  function decodeLen(b, off) {
    var first = b[off];
    if (first < 0x80) return { value: first, bytes: 1 };
    var n = first & 0x7F;
    if (n === 0) return { value: -1, bytes: 1, indef: true };
    if (off + n + 1 > b.length) throw new Error('Truncated long-form length.');
    var v = 0;
    for (var i = 0; i < n; i++) v = (v * 256) + b[off + 1 + i];
    return { value: v, bytes: 1 + n };
  }

  function walk(b, depth) {
    depth = depth || 0;
    var out = '';
    var off = 0;
    while (off < b.length) {
      var t = decodeTag(b, off); off += t.bytes;
      var L = decodeLen(b, off); off += L.bytes;
      if (L.value < 0) throw new Error('Indefinite-length forbidden in BER-TLV here.');
      var v = b.slice(off, off + L.value); off += L.value;
      var tagName = TAGS[t.tag] || (t.isConstructed ? 'Constructed (proprietary)' : 'Primitive (proprietary)');
      out += '<details class="tlv-node" ' + (depth < 1 ? 'open' : '') + ' style="margin-left:' + (depth * 16) + 'px; padding-left:8px; border-left:2px solid ' + (t.isConstructed ? 'var(--secure-cyan)' : 'var(--line)') + '; margin-bottom:4px;">' +
        '<summary style="cursor:pointer; font-family:JetBrains Mono,monospace; font-size:12.5px; color:var(--ink); padding:4px 0;">' +
          '<span style="color:var(--brand-red-dark); font-weight:600;">' + t.tag + '</span> ' +
          '<span style="color:var(--brand-grey);">[L=' + L.value + ']</span> ' +
          '<span style="font-family:Source Sans 3,sans-serif; font-size:12px; color:var(--brand-grey);">' + AS.escHTML(tagName) + '</span>' +
        '</summary>';
      if (t.isConstructed && v.length > 0) {
        try { out += walk(v, depth + 1); }
        catch (e) {
          out += '<div style="font-family:JetBrains Mono,monospace; font-size:12px; color:var(--brand-red-dark); margin:4px 0 4px 16px;">parse error: ' + AS.escHTML(e.message) + '</div>';
        }
      } else {
        var preview = bytesHexSpaced(v);
        if (preview.length > 240) preview = preview.slice(0, 240) + ' …';
        out += '<div style="font-family:JetBrains Mono,monospace; font-size:12px; color:var(--ink); margin:2px 0 6px 8px;">' + preview + '</div>';
      }
      out += '</details>';
    }
    return out;
  }

  function init() {
    var input = AS.$('tlv-input'), output = AS.$('tlv-output');
    var sample = AS.$('tlv-sample'), clearBtn = AS.$('tlv-clear');
    if (!input || !output) return;

    function go() {
      var raw = (input.value || '').trim();
      if (!raw) { AS.renderPlaceholder(output, 'Paste BER-TLV bytes — e.g. an EMV READ RECORD response, FCI template, or any nested TLV.'); return; }
      try {
        var b = toBytes(raw);
        var html = '<div style="margin-bottom:14px;"><span class="tech-badge tech-badge--ok">TLV tree</span> <span class="tech-badge">' + b.length + ' bytes</span></div>';
        html += '<div style="background:#fff; border:1px solid var(--line); border-radius:6px; padding:14px;">' + walk(b) + '</div>';
        html += '<div class="note" style="margin-top:14px;">Click each node to collapse / expand. EMV tag names are surfaced from the offline dictionary; unknown tags show their class.</div>';
        output.innerHTML = html;
      } catch (e) { AS.renderError(output, e.message); }
    }
    input.addEventListener('input', go);
    if (sample) sample.addEventListener('click', function () {
      input.value = '6F 1A 84 07 A0 00 00 00 04 10 10 A5 0F 50 0A 4D 41 53 54 45 52 43 41 52 44 87 01 01';
      go();
    });
    if (clearBtn) clearBtn.addEventListener('click', function () { input.value=''; go(); input.focus(); });
    go();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
