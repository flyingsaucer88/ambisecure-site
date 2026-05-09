/* AmbiSecure — COSE_Key (RFC 8152 §7) inspector.
   Reads a CBOR-encoded COSE_Key map and decodes the kty/alg/crv/x/y/n/e
   fields. Used for inspecting WebAuthn credentialPublicKey blobs. */
(function () {
  'use strict';

  var KTY = { 1: 'OKP (Octet Key Pair)', 2: 'EC2 (Elliptic Curve, x+y)', 3: 'RSA', 4: 'Symmetric' };
  var ALG = {
    '-7':  'ES256 (ECDSA / SHA-256 / P-256)',
    '-8':  'EdDSA',
    '-35': 'ES384 (ECDSA / SHA-384 / P-384)',
    '-36': 'ES512 (ECDSA / SHA-512 / P-521)',
    '-37': 'PS256 (RSA-PSS / SHA-256)',
    '-38': 'PS384 (RSA-PSS / SHA-384)',
    '-39': 'PS512 (RSA-PSS / SHA-512)',
    '-257': 'RS256 (RSA-v1.5 / SHA-256)',
    '-258': 'RS384 (RSA-v1.5 / SHA-384)',
    '-259': 'RS512 (RSA-v1.5 / SHA-512)',
    '-65535': 'RS1 (deprecated)'
  };
  var CRV = {
    1: 'P-256 (secp256r1)',
    2: 'P-384 (secp384r1)',
    3: 'P-521 (secp521r1)',
    4: 'X25519',
    5: 'X448',
    6: 'Ed25519',
    7: 'Ed448'
  };

  function inputToBytes(raw) {
    var s = String(raw).trim();
    if (/[A-Za-z]/.test(s) && /^[A-Za-z0-9_\-=\s]+$/.test(s) && !/^[0-9A-Fa-f\s]+$/.test(s)) {
      return AmbiSecureB64URL.decode(s);
    }
    return AmbiSecureB64URL.hexToBytes(s);
  }

  function row(label, value, note) {
    return '<div class="parsed-row"><span class="label">' + label + '</span>' +
      '<div><div class="value">' + value + '</div>' +
      (note ? '<span class="note">' + note + '</span>' : '') + '</div></div>';
  }

  function bytesPreview(b) {
    var hex = AmbiSecureCBOR.bytesToHex(b);
    if (hex.length > 80) hex = hex.slice(0, 80) + '… (' + b.length + ' bytes)';
    return '<span class="mono">' + hex + '</span>';
  }

  function init() {
    var input = AS.$('cose-input'), output = AS.$('cose-output');
    var sample = AS.$('cose-sample'), clearBtn = AS.$('cose-clear');
    if (!input || !output) return;

    function go() {
      var raw = (input.value || '').trim();
      if (!raw) { AS.renderPlaceholder(output, 'Paste a COSE_Key (CBOR map). Hex or base64url.'); return; }
      try {
        var bytes = inputToBytes(raw);
        var dec = AmbiSecureCBOR.decode(bytes);
        if (!dec.item || dec.item.type !== 'map') throw new Error('Top-level item must be a CBOR map.');
        var m = dec.item;
        var kty = AmbiSecureCBOR.findInMap(m, 1);
        var alg = AmbiSecureCBOR.findInMap(m, 3);
        var html = '<div style="margin-bottom:14px;"><span class="tech-badge tech-badge--ok">COSE_Key</span> ' +
          '<span class="tech-badge">' + bytes.length + ' bytes</span></div>';
        var ktyV = (kty && (kty.type === 'uint' || kty.type === 'nint')) ? kty.value : null;
        var algV = (alg && (alg.type === 'uint' || alg.type === 'nint')) ? alg.value : null;
        html += row('kty (1)', ktyV != null ? String(ktyV) : '-', ktyV != null ? (KTY[ktyV] || 'unknown') : 'missing');
        html += row('alg (3)', algV != null ? String(algV) : '-', algV != null ? (ALG[String(algV)] || 'unknown') : 'missing');
        var kid = AmbiSecureCBOR.findInMap(m, 2);
        if (kid && kid.type === 'bytes') html += row('kid (2)', bytesPreview(kid.value), 'Key identifier.');
        else if (kid && kid.type === 'text') html += row('kid (2)', '"' + AS.escHTML(kid.value) + '"');

        if (ktyV === 2) {
          // EC2
          var crv = AmbiSecureCBOR.findInMap(m, -1);
          var x = AmbiSecureCBOR.findInMap(m, -2);
          var y = AmbiSecureCBOR.findInMap(m, -3);
          var crvV = (crv && (crv.type === 'uint' || crv.type === 'nint')) ? crv.value : null;
          html += row('crv (-1)', crvV != null ? String(crvV) : '-', crvV != null ? (CRV[crvV] || 'unknown') : 'missing');
          if (x && x.type === 'bytes') html += row('x (-2)', bytesPreview(x.value), x.value.length + '-byte x-coordinate.');
          if (y && y.type === 'bytes') html += row('y (-3)', bytesPreview(y.value), y.value.length + '-byte y-coordinate.');
          html += '<div class="note" style="margin-top:14px;">For ES256 / P-256 you should see kty=2, alg=-7, crv=1, and 32-byte x and y. The public key is the concatenation of <code>04 || x || y</code> (uncompressed point).</div>';
        } else if (ktyV === 1) {
          // OKP (Ed25519)
          var crv = AmbiSecureCBOR.findInMap(m, -1);
          var x = AmbiSecureCBOR.findInMap(m, -2);
          var crvV = (crv && (crv.type === 'uint' || crv.type === 'nint')) ? crv.value : null;
          html += row('crv (-1)', crvV != null ? String(crvV) : '-', crvV != null ? (CRV[crvV] || 'unknown') : 'missing');
          if (x && x.type === 'bytes') html += row('x (-2)', bytesPreview(x.value), x.value.length + '-byte public key.');
          html += '<div class="note" style="margin-top:14px;">For EdDSA / Ed25519 you should see kty=1, alg=-8, crv=6, and a 32-byte x.</div>';
        } else if (ktyV === 3) {
          // RSA
          var n = AmbiSecureCBOR.findInMap(m, -1);
          var e = AmbiSecureCBOR.findInMap(m, -2);
          if (n && n.type === 'bytes') html += row('n (-1)', bytesPreview(n.value), 'RSA modulus (' + (n.value.length * 8) + ' bits).');
          if (e && e.type === 'bytes') html += row('e (-2)', bytesPreview(e.value), 'RSA public exponent.');
        }
        output.innerHTML = html;
      } catch (err) { AS.renderError(output, err.message); }
    }
    input.addEventListener('input', go);
    if (sample) sample.addEventListener('click', function () {
      // a4 01 02 03 26 20 01 21 58 20 (32 bytes of x) 22 58 20 (32 bytes of y)
      input.value = 'a401020326200121582051a8d4e8f1c2b3a4051a8d4e8f1c2b3a4051a8d4e8f1c2b3a4051a8d4e8f1c2b3a4225820e1d2c3b4a5061f17283940516273849aabcdef00112233445566778899aabbcc';
      go();
    });
    if (clearBtn) clearBtn.addEventListener('click', function () { input.value=''; go(); input.focus(); });
    go();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
