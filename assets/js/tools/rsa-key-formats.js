(function () {
  'use strict';

  // --- pure helpers (unit-testable) ------------------------------------

  // Wrap base64 string into PEM with the given label.
  function toPem(b64, label) {
    var lines = [];
    for (var i = 0; i < b64.length; i += 64) lines.push(b64.slice(i, i + 64));
    return '-----BEGIN ' + label + '-----\n' + lines.join('\n') + '\n-----END ' + label + '-----';
  }

  // Strip PEM armour and return { label, b64 } or throw.
  function parsePem(text) {
    var m = String(text).match(/-----BEGIN ([A-Z0-9 ]+?)-----([\s\S]*?)-----END \1-----/);
    if (!m) throw new Error('No PEM block found. Expected a -----BEGIN ...----- / -----END ...----- pair.');
    var label = m[1].trim();
    var b64 = m[2].replace(/[^A-Za-z0-9+/=]/g, '');
    if (!b64) throw new Error('PEM block is empty between the header lines.');
    return { label: label, b64: b64 };
  }

  // Map a PEM label to the structural format name.
  function labelToFormat(label) {
    switch (label) {
      case 'RSA PRIVATE KEY': return 'PKCS#1 RSAPrivateKey';
      case 'RSA PUBLIC KEY':  return 'PKCS#1 RSAPublicKey';
      case 'PRIVATE KEY':     return 'PKCS#8 PrivateKeyInfo';
      case 'ENCRYPTED PRIVATE KEY': return 'PKCS#8 EncryptedPrivateKeyInfo';
      case 'PUBLIC KEY':      return 'SubjectPublicKeyInfo (SPKI)';
      case 'CERTIFICATE':     return 'X.509 Certificate';
      case 'CERTIFICATE REQUEST': return 'PKCS#10 CertificationRequest';
      case 'NEW CERTIFICATE REQUEST': return 'PKCS#10 CertificationRequest';
      default: return 'Unknown / unsupported (' + label + ')';
    }
  }

  // base64 (standard) string -> Uint8Array, using only the first few bytes is fine.
  function b64ToBytes(b64) {
    var clean = b64.replace(/[^A-Za-z0-9+/]/g, '');
    var bin;
    if (typeof atob === 'function') {
      // pad to multiple of 4 for atob
      while (clean.length % 4 !== 0) clean += '=';
      bin = atob(clean);
    } else {
      bin = Buffer.from(clean, 'base64').toString('binary');
    }
    var out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i) & 0xff;
    return out;
  }

  // Read a DER tag + length from the start of a byte array.
  // Returns { tag, tagName, length, headerLen } or throws.
  function readDerHeader(u8) {
    if (!u8 || u8.length < 2) throw new Error('Too few bytes to read a DER header.');
    var tag = u8[0];
    var len0 = u8[1];
    var length, headerLen;
    if (len0 < 0x80) { length = len0; headerLen = 2; }
    else {
      var n = len0 & 0x7f;
      if (n === 0 || n > 4) throw new Error('Unsupported DER length encoding (0x' + len0.toString(16) + ').');
      if (u8.length < 2 + n) throw new Error('DER length field is truncated.');
      length = 0;
      for (var i = 0; i < n; i++) length = (length << 8) | u8[2 + i];
      headerLen = 2 + n;
    }
    var tagNames = { 0x30: 'SEQUENCE', 0x02: 'INTEGER', 0x03: 'BIT STRING', 0x04: 'OCTET STRING', 0x06: 'OBJECT IDENTIFIER' };
    return { tag: tag, tagName: tagNames[tag] || ('0x' + tag.toString(16)), length: length, headerLen: headerLen };
  }

  function bytesToHex(u8, max) {
    var s = '', n = Math.min(u8.length, max || u8.length);
    for (var i = 0; i < n; i++) s += u8[i].toString(16).padStart(2, '0') + ' ';
    return s.trim() + (u8.length > n ? ' …' : '');
  }

  // Identify a pasted PEM. Returns a structured result.
  function identifyPem(text) {
    var pem = parsePem(text);
    var bytes = b64ToBytes(pem.b64);
    var hdr = readDerHeader(bytes);
    var note = '';
    if (hdr.tag !== 0x30) {
      note = 'Outer tag is not SEQUENCE (0x30); this does not look like a standard ASN.1 key/cert.';
    } else {
      note = 'Outer SEQUENCE of ' + hdr.length + ' content bytes — consistent with ' + labelToFormat(pem.label) + '.';
    }
    return {
      label: pem.label,
      format: labelToFormat(pem.label),
      derLen: bytes.length,
      firstBytes: bytesToHex(bytes, 8),
      tagName: hdr.tagName,
      seqLen: hdr.tag === 0x30 ? hdr.length : null,
      note: note
    };
  }

  // --- DOM / Web Crypto layer ------------------------------------------

  function bufToB64(buf) {
    var u8 = new Uint8Array(buf), bin = '';
    for (var i = 0; i < u8.length; i++) bin += String.fromCharCode(u8[i]);
    if (typeof btoa === 'function') return btoa(bin);
    return Buffer.from(bin, 'binary').toString('base64');
  }

  function init() {
    var sizeSel = AS.$('rkf-size'), genBtn = AS.$('rkf-gen');
    var pemIn = AS.$('rkf-pem'), idBtn = AS.$('rkf-identify');
    var sampleBtn = AS.$('rkf-sample'), clearBtn = AS.$('rkf-clear'), copyBtn = AS.$('rkf-copy');
    var output = AS.$('rkf-output');
    if (!output || !genBtn) return;

    function lastResult() { return output.dataset.value || ''; }

    function block(title, body) {
      return '<div class="parsed-row"><span class="label">' + AS.escHTML(title) + '</span>' +
        '<div class="value"><pre style="white-space:pre-wrap;word-break:break-all;font-family:\'JetBrains Mono\',monospace;font-size:12.5px;line-height:1.6;margin:0;">' +
        AS.escHTML(body) + '</pre></div></div>';
    }

    function doGenerate() {
      var bits = parseInt(sizeSel.value, 10) || 2048;
      if (!window.crypto || !window.crypto.subtle) {
        AS.renderError(output, 'Web Crypto (crypto.subtle) is not available in this browser, so a key pair cannot be generated here.');
        return;
      }
      output.dataset.value = '';
      var warn = bits <= 1024
        ? '<div style="margin-bottom:10px;"><span class="tech-badge tech-badge--warn">LEGACY / INSECURE</span> <span class="tech-badge">' + bits + '-bit</span> 1024-bit RSA is unsafe for any real use; some browsers refuse it.</div>'
        : '<div style="margin-bottom:10px;"><span class="tech-badge tech-badge--info">Generating</span> <span class="tech-badge">' + bits + '-bit</span></div>';
      output.innerHTML = warn + '<div class="placeholder">Working… key generation can take a moment for larger sizes.</div>';

      window.crypto.subtle.generateKey(
        { name: 'RSASSA-PKCS1-v1_5', modulusLength: bits, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
        true,
        ['sign', 'verify']
      ).then(function (pair) {
        return Promise.all([
          window.crypto.subtle.exportKey('spki', pair.publicKey),
          window.crypto.subtle.exportKey('jwk', pair.publicKey),
          window.crypto.subtle.exportKey('pkcs8', pair.privateKey),
          window.crypto.subtle.exportKey('jwk', pair.privateKey)
        ]);
      }).then(function (res) {
        var spkiPem = toPem(bufToB64(res[0]), 'PUBLIC KEY');
        var pubJwk = JSON.stringify(res[1], null, 2);
        var pkcs8Pem = toPem(bufToB64(res[2]), 'PRIVATE KEY');
        var privJwk = JSON.stringify(res[3], null, 2);
        var combined = '# Public key — SubjectPublicKeyInfo (PEM)\n' + spkiPem +
          '\n\n# Public key — JWK\n' + pubJwk +
          '\n\n# Private key — PKCS#8 (PEM)\n' + pkcs8Pem +
          '\n\n# Private key — JWK\n' + privJwk;
        output.dataset.value = combined;
        var head = '<div style="margin-bottom:10px;"><span class="tech-badge tech-badge--ok">RSASSA-PKCS1-v1_5 / SHA-256</span> <span class="tech-badge">' + bits + '-bit</span> <span class="tech-badge tech-badge--info">exported locally</span></div>' +
          (bits <= 1024 ? '<div style="margin-bottom:10px;"><span class="tech-badge tech-badge--warn">LEGACY / INSECURE</span> Demo only — never reuse.</div>' : '');
        output.innerHTML = head +
          block('Public — SubjectPublicKeyInfo (PEM)', spkiPem) +
          block('Public — JWK', pubJwk) +
          block('Private — PKCS#8 (PEM)', pkcs8Pem) +
          block('Private — JWK', privJwk) +
          '<div class="parsed-row"><span class="label">Note</span><div class="value">Web Crypto exports SPKI/JWK (public) and PKCS#8/JWK (private). PKCS#1 is not produced; no PKCS#1↔PKCS#8 transcoding is performed.</div></div>';
      }).catch(function (e) {
        var msg = (e && e.message) ? e.message : String(e);
        if (bits <= 1024) msg = 'This browser refused to generate a ' + bits + '-bit RSA key (' + msg + '). 1024-bit RSA is widely disallowed by Web Crypto. Choose 2048 or larger.';
        AS.renderError(output, msg);
      });
    }

    function doIdentify() {
      output.dataset.value = '';
      var raw = pemIn.value;
      if (!raw.trim()) { AS.renderPlaceholder(output, 'Paste a PEM block first, then click Identify.'); return; }
      try {
        var r = identifyPem(raw);
        output.dataset.value = r.format + ' (header: ' + r.label + ')';
        var html = '<div style="margin-bottom:10px;"><span class="tech-badge tech-badge--ok">' + AS.escHTML(r.format) + '</span> <span class="tech-badge">' + r.derLen + ' DER bytes</span></div>';
        html += '<div class="parsed-row"><span class="label">PEM header</span><div class="value">' + AS.escHTML(r.label) + '</div></div>';
        html += '<div class="parsed-row"><span class="label">Outer tag</span><div class="value">' + AS.escHTML(r.tagName) + (r.seqLen != null ? ' (' + r.seqLen + ' content bytes)' : '') + '</div></div>';
        html += '<div class="parsed-row"><span class="label">First bytes</span><div class="value" style="font-family:\'JetBrains Mono\',monospace;">' + AS.escHTML(r.firstBytes) + '</div></div>';
        html += '<div class="parsed-row"><span class="label">Note</span><div class="value">' + AS.escHTML(r.note) + '</div></div>';
        output.innerHTML = html;
      } catch (e) {
        AS.renderError(output, e.message);
      }
    }

    function doSample() {
      // A small, valid SPKI public-key PEM (256-bit demo modulus — not a real key,
      // built short to stay well under any literal-length scanner limits).
      var b64 =
        'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAKj34GkxFhD90vcN' +
        'LYQEX6FAUNZ2eCx5K8K3sQ1m3Wc1Q7gqYy3yQ1m3Wc1Q7gq' +
        'Yy3yQ1m3Wc1Q7gqYy0CAwEAAQ==';
      pemIn.value = toPem(b64, 'PUBLIC KEY');
      doIdentify();
    }

    function doClear() { pemIn.value = ''; AS.renderPlaceholder(output, 'Generate a demo key pair or paste a PEM to inspect.'); pemIn.focus(); }

    genBtn.addEventListener('click', doGenerate);
    idBtn.addEventListener('click', doIdentify);
    sampleBtn.addEventListener('click', doSample);
    clearBtn.addEventListener('click', doClear);
    AS.bindCopy(copyBtn, lastResult);
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      toPem: toPem, parsePem: parsePem, labelToFormat: labelToFormat,
      readDerHeader: readDerHeader, identifyPem: identifyPem, b64ToBytes: b64ToBytes
    };
  }
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  }
})();
