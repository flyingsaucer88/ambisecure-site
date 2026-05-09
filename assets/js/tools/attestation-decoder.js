/* AmbiSecure — WebAuthn attestation object decoder.
   The attestationObject is a CBOR map { fmt, attStmt, authData }.
   This tool surfaces fmt, walks attStmt, and links into the
   authenticatorData parser for authData. */
(function () {
  'use strict';

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

  var FMT_NOTES = {
    'none': 'Self-attestation skipped — common for consumer flows. Acceptable when the RP does not need to verify make/model.',
    'packed': 'Generic FIDO attestation format (FIDO Alliance §8.2). attStmt may include alg, sig, and optionally x5c.',
    'tpm': 'TPM-based attestation (Windows Hello with hardware TPM).',
    'android-key': 'Android KeyStore attestation.',
    'android-safetynet': 'SafetyNet (deprecated by Google — verify only legacy assertions).',
    'fido-u2f': 'Legacy U2F attestation envelope.',
    'apple': 'Apple Anonymous Attestation (used by Touch ID / Face ID).',
    'apple-appattest': 'Apple App Attest (iOS app integrity).'
  };

  function bytesPreview(b, max) {
    max = max || 80;
    var hex = AmbiSecureB64URL.bytesToHex(b);
    if (hex.length > max) return hex.slice(0, max) + '… (' + b.length + ' bytes)';
    return hex;
  }

  function init() {
    var input = AS.$('att-input'), output = AS.$('att-output');
    var sample = AS.$('att-sample'), clearBtn = AS.$('att-clear');
    if (!input || !output) return;

    function go() {
      var raw = (input.value || '').trim();
      if (!raw) { AS.renderPlaceholder(output, 'Paste an attestationObject (CBOR — hex or base64url).'); return; }
      try {
        var bytes = inputToBytes(raw);
        var dec = AmbiSecureCBOR.decode(bytes);
        if (!dec.item || dec.item.type !== 'map') throw new Error('Top-level item is not a CBOR map.');
        var fmtItem = AmbiSecureCBOR.findInMap(dec.item, 'fmt');
        var attStmt = AmbiSecureCBOR.findInMap(dec.item, 'attStmt');
        var authData = AmbiSecureCBOR.findInMap(dec.item, 'authData');
        if (!fmtItem || !attStmt || !authData) throw new Error('attestationObject must contain fmt, attStmt, and authData.');

        var html = '<div style="margin-bottom:14px;"><span class="tech-badge tech-badge--ok">attestationObject</span> <span class="tech-badge">' + bytes.length + ' bytes</span></div>';
        var fmt = fmtItem.value;
        html += row('fmt', '<strong>' + AS.escHTML(fmt) + '</strong>', FMT_NOTES[fmt] || 'Unknown attestation format.');

        // attStmt walk
        if (attStmt.type === 'map') {
          if (attStmt.value.length === 0) {
            html += row('attStmt', '<em>(empty)</em>', 'Empty attStmt is normal when fmt = "none".');
          } else {
            var rows = '';
            attStmt.value.forEach(function (kv) {
              var k = kv[0], v = kv[1];
              var keyName = (k.type === 'text') ? k.value : ((k.type === 'uint' || k.type === 'nint') ? String(k.value) : '<' + k.type + '>');
              var rendered;
              if (v.type === 'bytes') {
                rendered = '<span class="mono">' + bytesPreview(v.value, 80) + '</span>';
              } else if (v.type === 'array') {
                if (keyName === 'x5c') {
                  rendered = v.value.length + ' certificate(s) in chain';
                  rendered += '<div style="margin-top:6px;"><a href="/resources/tools/x509-viewer/" style="color:var(--brand-red);font-weight:600;">Open X.509 viewer</a> to inspect a leaf cert. The first item is the attestation cert; the rest are intermediates up to (but not including) a FIDO root.</div>';
                } else {
                  rendered = '[' + v.value.length + ' items]';
                }
              } else if (v.type === 'uint' || v.type === 'nint') {
                rendered = String(v.value);
                if (keyName === 'alg') {
                  var algMap = { '-7': 'ES256', '-8': 'EdDSA', '-35': 'ES384', '-36': 'ES512', '-37': 'PS256', '-257': 'RS256' };
                  if (algMap[String(v.value)]) rendered += ' &middot; ' + algMap[String(v.value)];
                }
              } else if (v.type === 'text') {
                rendered = '"' + AS.escHTML(v.value) + '"';
              } else {
                rendered = '<' + v.type + '>';
              }
              rows += row('attStmt.' + keyName, rendered);
            });
            html += rows;
          }
        }

        // authData
        if (authData.type === 'bytes') {
          var ab = authData.value;
          html += row('authData', '<span class="tech-badge tech-badge--info">' + ab.length + ' bytes</span>',
            'Open the <a href="/resources/tools/authdata-parser/?h=' + AmbiSecureB64URL.bytesToHex(ab) + '" style="color:var(--brand-red);font-weight:600;">authenticatorData parser</a> to walk rpIdHash / flags / counter / AAGUID / credentialId / publicKey.');
          // Quick flags summary inline
          if (ab.length >= 37) {
            var flags = ab[32];
            var bits = [];
            if (flags & 0x01) bits.push('UP'); if (flags & 0x04) bits.push('UV');
            if (flags & 0x08) bits.push('BE'); if (flags & 0x10) bits.push('BS');
            if (flags & 0x40) bits.push('AT'); if (flags & 0x80) bits.push('ED');
            html += row('authData.flags', '0x' + flags.toString(16).toUpperCase().padStart(2, '0'), bits.join(' &middot; ') || '(none set)');
            var counter = ((ab[33] << 24) | (ab[34] << 16) | (ab[35] << 8) | ab[36]) >>> 0;
            html += row('authData.signCount', String(counter));
            // AAGUID if present
            if ((flags & 0x40) && ab.length >= 53) {
              var aaguid = AmbiSecureAAGUID.format(ab.slice(37, 53));
              var hit = AmbiSecureAAGUID.lookup(aaguid);
              html += row('authData.AAGUID', '<span class="mono">' + aaguid + '</span>',
                AmbiSecureAAGUID.isZero(ab.slice(37, 53)) ? 'Zero AAGUID — make/model not declared.' :
                (hit ? AS.escHTML(hit.vendor + ' · ' + hit.model) : 'Not in offline directory.'));
            }
          }
        }

        // Validation guidance
        html += '<div class="note" style="margin-top:18px; padding:12px 16px; background:var(--secure-cyan-soft); border-left:3px solid var(--secure-cyan); border-radius:3px;">' +
          '<strong>Verification checklist (registration ceremony):</strong>' +
          '<ol style="margin:8px 0 0 20px; font-size:13px; line-height:1.65;">' +
          '<li>Decode <code>clientDataJSON</code>, verify <code>type === "webauthn.create"</code>, challenge matches, origin is in your allow-list.</li>' +
          '<li>Compute <code>SHA-256(rpId)</code> and verify it equals <code>authData.rpIdHash</code>.</li>' +
          '<li>Verify <code>UP</code> is set; verify <code>UV</code> if your policy requires it.</li>' +
          '<li>If the <code>fmt</code> requires it, verify the attestation signature against <code>authData || SHA-256(clientDataJSON)</code>.</li>' +
          '<li>If you require certified hardware, validate the <code>x5c</code> chain against your trust anchors and the FIDO MDS BLOB; enforce your AAGUID allow-list.</li>' +
          '<li>Persist the <code>credentialId</code>, <code>credentialPublicKey</code>, and <code>signCount</code>.</li>' +
          '</ol></div>';

        output.innerHTML = html;
      } catch (e) { AS.renderError(output, e.message); }
    }
    input.addEventListener('input', go);
    if (sample) sample.addEventListener('click', function () {
      // Minimal "fmt: none" attestation for demo
      // a3 63 66 6d 74 64 6e 6f 6e 65   67 61 74 74 53 74 6d 74 a0   68 61 75 74 68 44 61 74 61 58 25 ... 37 bytes
      var hex = 'a363666d74646e6f6e656761747453746d74a06861757468446174615825' +
        '49960de5880e8c687434170f6476605b8fe4aeb9a28632c7995cf3ba831d97630500000000';
      input.value = hex;
      go();
    });
    if (clearBtn) clearBtn.addEventListener('click', function () { input.value=''; go(); input.focus(); });
    go();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
