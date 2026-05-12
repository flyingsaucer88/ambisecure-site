(function () {
  'use strict';


  var TAG_DICT = {
    '4F': 'Application Identifier (AID)',
    '50': 'Application Label',
    '57': 'Track 2 Equivalent Data',
    '5A': 'Application PAN',
    '5F20': 'Cardholder Name',
    '5F24': 'Application Expiration Date',
    '5F25': 'Application Effective Date',
    '5F28': 'Issuer Country Code',
    '5F2A': 'Transaction Currency Code',
    '5F2D': 'Language Preference',
    '5F30': 'Service Code',
    '5F34': 'Application PAN Sequence Number',
    '6F':  'File Control Information (FCI) Template',
    '70':  'EMV Proprietary Template',
    '71':  'Issuer Script Template 1',
    '72':  'Issuer Script Template 2',
    '77':  'Response Message Template Format 2',
    '80':  'Response Message Template Format 1',
    '82':  'Application Interchange Profile (AIP)',
    '83':  'Command Template',
    '84':  'DF Name',
    '86':  'Issuer Script Command',
    '87':  'Application Priority Indicator',
    '88':  'SFI',
    '8A':  'Authorisation Response Code',
    '8C':  'Card Risk Management DOL 1 (CDOL1)',
    '8D':  'Card Risk Management DOL 2 (CDOL2)',
    '8E':  'Cardholder Verification Method (CVM) List',
    '8F':  'CA Public Key Index',
    '90':  'Issuer Public Key Certificate',
    '92':  'Issuer Public Key Remainder',
    '93':  'Signed Static Application Data',
    '94':  'Application File Locator (AFL)',
    '95':  'Terminal Verification Results (TVR)',
    '97':  'Transaction Certificate DOL (TDOL)',
    '9A':  'Transaction Date',
    '9B':  'Transaction Status Information',
    '9C':  'Transaction Type',
    '9D':  'DDF Name',
    'A5':  'FCI Proprietary Template',
    '9F02':'Amount, Authorised (Numeric)',
    '9F03':'Amount, Other (Numeric)',
    '9F05':'Application Discretionary Data',
    '9F07':'Application Usage Control',
    '9F08':'Application Version Number',
    '9F0D':'Issuer Action Code – Default',
    '9F0E':'Issuer Action Code – Denial',
    '9F0F':'Issuer Action Code – Online',
    '9F10':'Issuer Application Data',
    '9F11':'Issuer Code Table Index',
    '9F12':'Application Preferred Name',
    '9F13':'Last Online ATC Register',
    '9F14':'Lower Consecutive Offline Limit',
    '9F17':'PIN Try Counter',
    '9F1A':'Terminal Country Code',
    '9F1F':'Track 1 Discretionary Data',
    '9F20':'Track 2 Discretionary Data',
    '9F21':'Transaction Time',
    '9F26':'Application Cryptogram (AC)',
    '9F27':'Cryptogram Information Data (CID)',
    '9F32':'Issuer Public Key Exponent',
    '9F33':'Terminal Capabilities',
    '9F34':'CVM Results',
    '9F35':'Terminal Type',
    '9F36':'Application Transaction Counter (ATC)',
    '9F37':'Unpredictable Number',
    '9F38':'PDOL',
    '9F39':'POS Entry Mode',
    '9F40':'Additional Terminal Capabilities',
    '9F41':'Transaction Sequence Counter',
    '9F42':'Application Currency Code',
    '9F44':'Application Currency Exponent',
    '9F4A':'SDA Tag List',
    '9F4D':'Log Entry',
    'BF0C':'FCI Issuer Discretionary Data'
  };

  function clean(hex) { return (hex || '').replace(/0x/gi, '').replace(/[\s,;:_-]+/g, '').toLowerCase(); }
  function toBytes(hex) {
    var s = clean(hex);
    if (s.length % 2 !== 0) throw new Error('Hex length must be even (got ' + s.length + ' nibbles).');
    if (!/^[0-9a-f]*$/.test(s)) throw new Error('Non-hex characters in input.');
    var out = [];
    for (var i = 0; i < s.length; i += 2) out.push(parseInt(s.substr(i, 2), 16));
    return out;
  }
  function hex(b, w) { var x = b.toString(16).toUpperCase(); while (w && x.length < w) x = '0' + x; return x; }
  function escHTML(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  function readTag(bytes, i) {
    if (i >= bytes.length) throw new Error('Truncated tag at offset ' + i + '.');
    var first = bytes[i++];
    var tag = [first];
    var clazz = (first >> 6) & 0x03;
    var constructed = (first & 0x20) !== 0;
    var lower = first & 0x1F;
    if (lower === 0x1F) {

      var more;
      do {
        if (i >= bytes.length) throw new Error('Truncated multi-byte tag.');
        more = bytes[i++];
        tag.push(more);
      } while (more & 0x80);
    }
    var tagHex = tag.map(function (b) { return hex(b, 2); }).join('');
    return { tag: tagHex, constructed: constructed, clazz: clazz, next: i };
  }

  function readLen(bytes, i) {
    if (i >= bytes.length) throw new Error('Truncated length at offset ' + i + '.');
    var first = bytes[i++];
    if (first < 0x80) return { len: first, next: i, indef: false };
    if (first === 0x80) return { len: -1, next: i, indef: true };
    var n = first & 0x7F;
    if (n === 0) throw new Error('Invalid length form (0x80 with n=0).');
    if (i + n > bytes.length) throw new Error('Truncated long-form length.');
    var L = 0;
    for (var k = 0; k < n; k++) L = (L * 256) + bytes[i++];
    return { len: L, next: i, indef: false };
  }

  function classLabel(c) {
    return ['Universal', 'Application', 'Context-specific', 'Private'][c] || '?';
  }

  function parseTLV(bytes, depth) {
    var out = [];
    var i = 0;
    while (i < bytes.length) {
      var t = readTag(bytes, i);
      i = t.next;
      var l = readLen(bytes, i);
      i = l.next;
      if (l.indef) throw new Error('Indefinite-length BER not supported in this parser.');
      if (i + l.len > bytes.length) throw new Error('Length 0x' + hex(l.len, 2) + ' exceeds remaining bytes for tag ' + t.tag + '.');
      var val = bytes.slice(i, i + l.len);
      i += l.len;

      var node = {
        tag: t.tag.toUpperCase(),
        clazz: t.clazz,
        constructed: t.constructed,
        len: l.len,
        value: val,
        children: null,
        meaning: TAG_DICT[t.tag.toUpperCase()] || null
      };
      if (t.constructed && val.length > 0) {
        node.children = parseTLV(val, depth + 1);
      }
      out.push(node);
    }
    return out;
  }

  function nodeHTML(node) {
    var html = '';
    var classBits = node.constructed ? 'constructed' : 'primitive';
    html += '<div class="node ' + classBits + '">';
    html += '<span class="tag">' + escHTML(node.tag) + '</span> ';
    html += '<span class="len">L=' + node.len + '</span> ';
    if (!node.constructed) {
      var v = node.value.map(function (b) { return hex(b, 2); }).join(' ');
      html += '<span class="val">' + escHTML(v || '(empty)') + '</span>';
      if (node.value.length && node.value.length <= 32) {
        var ascii = node.value.map(function (b) { return (b >= 0x20 && b <= 0x7E) ? String.fromCharCode(b) : '.'; }).join('');
        if (/[A-Za-z0-9 ]/.test(ascii)) html += '<span class="meaning">"' + escHTML(ascii) + '"</span>';
      }
    } else {
      html += '<span class="meaning">[constructed &middot; ' + node.children.length + ' child' + (node.children.length === 1 ? '' : 'ren') + ']</span>';
    }
    if (node.meaning) html += '<span class="meaning">&mdash; ' + escHTML(node.meaning) + '</span>';
    if (!node.meaning) {
      var cls = classLabel(node.clazz);
      if (cls !== 'Universal') html += '<span class="meaning">&mdash; ' + escHTML(cls) + '</span>';
    }
    if (node.children && node.children.length) {
      html += node.children.map(nodeHTML).join('');
    }
    html += '</div>';
    return html;
  }

  function render(nodes, container) {
    var totalBytes = 0;
    nodes.forEach(function recur(n) {
      totalBytes += (n.tag.length / 2);

      totalBytes += n.value.length;
      if (n.children) n.children.forEach(recur);
    });
    var html = '<div style="margin-bottom: 14px;">';
    html += '<span class="tech-badge tech-badge--ok">VALID TLV</span> ';
    html += '<span class="tech-badge">' + nodes.length + ' top-level node' + (nodes.length === 1 ? '' : 's') + '</span>';
    html += '</div>';
    html += '<div class="tlv-tree">' + nodes.map(nodeHTML).join('') + '</div>';
    container.innerHTML = html;
  }
  function renderError(msg, container) {
    container.innerHTML = '<div style="margin-bottom:10px;"><span class="tech-badge tech-badge--err">PARSE ERROR</span></div>' +
      '<div class="parsed-row"><span class="label">Error</span><div class="value">' + escHTML(msg) + '</div></div>';
  }

  function init() {
    var input = document.getElementById('tlv-input');
    var output = document.getElementById('tlv-output');
    var sample = document.getElementById('tlv-sample');
    var clearBtn = document.getElementById('tlv-clear');
    if (!input || !output) return;

    function go() {
      var raw = input.value.trim();
      if (!raw) {
        output.innerHTML = '<div class="placeholder">Paste BER-TLV bytes to see them parsed.</div>';
        return;
      }
      try {
        var bytes = toBytes(raw);
        var nodes = parseTLV(bytes, 0);
        render(nodes, output);
      } catch (e) {
        renderError(e.message || String(e), output);
      }
    }

    input.addEventListener('input', go);
    if (sample) sample.addEventListener('click', function () {

      input.value = '6F 1E 84 07 A0 00 00 00 03 10 10 A5 13 50 0A 56 49 53 41 20 44 45 42 49 54 87 01 02 9F 38 03 9F 1A 02';
      go();
    });
    if (clearBtn) clearBtn.addEventListener('click', function () { input.value = ''; go(); input.focus(); });
    go();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
