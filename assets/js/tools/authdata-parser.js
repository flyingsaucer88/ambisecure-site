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

  function bytesPreview(b, max) {
    max = max || 80;
    var hex = AmbiSecureB64URL.bytesToHex(b);
    if (hex.length > max) return hex.slice(0, max) + '… (' + b.length + ' bytes)';
    return hex;
  }

  var FLAG = {
    UP: 0x01,
    UV: 0x04,
    BE: 0x08,
    BS: 0x10,
    AT: 0x40,
    ED: 0x80
  };

  function init() {
    var input = AS.$('ad-input'), output = AS.$('ad-output');
    var sample = AS.$('ad-sample'), clearBtn = AS.$('ad-clear');
    if (!input || !output) return;

    function go() {
      var raw = (input.value || '').trim();
      if (!raw) { AS.renderPlaceholder(output, 'Paste authenticatorData (hex or base64url).'); return; }
      try {
        var b = inputToBytes(raw);
        if (b.length < 37) throw new Error('authenticatorData must be at least 37 bytes (rpIdHash + flags + counter).');
        var rpIdHash = b.slice(0, 32);
        var flags = b[32];
        var counter = (b[33] << 24) | (b[34] << 16) | (b[35] << 8) | b[36];
        counter = counter >>> 0;

        var html = '<div style="margin-bottom:14px;"><span class="tech-badge tech-badge--ok">authenticatorData</span> <span class="tech-badge">' + b.length + ' bytes</span></div>';
        html += row('rpIdHash', '<span class="mono">' + bytesPreview(rpIdHash, 64) + '</span>',
          'SHA-256 of the relying party ID (e.g. SHA-256("example.com")). The RP must compare this against its own digest.');

        var flagBits = [];
        if (flags & FLAG.UP) flagBits.push('UP (User Present)');
        if (flags & FLAG.UV) flagBits.push('UV (User Verified)');
        if (flags & FLAG.BE) flagBits.push('BE (Backup Eligible)');
        if (flags & FLAG.BS) flagBits.push('BS (Backup State)');
        if (flags & FLAG.AT) flagBits.push('AT (Attested credential data)');
        if (flags & FLAG.ED) flagBits.push('ED (Extension data)');
        html += row('flags', '0x' + flags.toString(16).toUpperCase().padStart(2, '0'),
          flagBits.length ? flagBits.join(' &middot; ') : '(none set)');

        var counterNote = counter === 0
          ? 'Counter is 0 — many platform authenticators (Windows Hello, Apple) deliberately keep this at 0. Don\'t treat 0 as a regression.'
          : 'Counter must strictly increase between assertions for the same credential. A non-monotonic value suggests a clone or replay.';
        html += row('signCount', String(counter), counterNote);

        var i = 37;
        if (flags & FLAG.AT) {
          if (b.length < i + 18) throw new Error('AT flag set but not enough bytes for attestedCredentialData.');
          var aaguidB = b.slice(i, i + 16); i += 16;
          var credLen = (b[i] << 8) | b[i + 1]; i += 2;
          if (b.length < i + credLen) throw new Error('AT flag set but credentialId length exceeds buffer.');
          var credId = b.slice(i, i + credLen); i += credLen;
          var aaguid = AmbiSecureAAGUID.format(aaguidB);
          var aaguidHit = AmbiSecureAAGUID.lookup(aaguid);
          var aaguidNote = AmbiSecureAAGUID.isZero(aaguidB)
            ? 'Zero AAGUID — authenticator is not declaring a make/model (allowed by WebAuthn L2).'
            : (aaguidHit ? AS.escHTML(aaguidHit.vendor) + ' &middot; ' + AS.escHTML(aaguidHit.model) : 'Not in offline directory — fetch the FIDO MDS BLOB to identify.');
          html += row('AAGUID', '<span class="mono">' + aaguid + '</span>', aaguidNote);
          html += row('credentialIdLength', String(credLen));
          html += row('credentialId', '<span class="mono">' + bytesPreview(credId, 80) + '</span>',
            credLen + ' bytes. Opaque to the RP — store and present back on assertion.');

          var pubKeyBytes = b.slice(i);
          try {
            var dec = AmbiSecureCBOR.decode(pubKeyBytes);
            i += dec.consumed;
            var consumed = dec.consumed;
            html += row('credentialPublicKey', '<span class="tech-badge tech-badge--info">COSE_Key (' + consumed + ' bytes)</span>',
              'Use the COSE Key Inspector to decode kty, alg, crv, x, y. The leading bytes are: <span class="mono">' + AmbiSecureB64URL.bytesToHex(pubKeyBytes.slice(0, Math.min(48, consumed))) + (consumed > 48 ? '…' : '') + '</span>');

            try {
              var coseHex = AmbiSecureB64URL.bytesToHex(pubKeyBytes.slice(0, consumed));
              html += '<div class="note" style="margin-top:6px;">Open the <a href="/resources/tools/cose-key/?h=' + coseHex + '" style="color:var(--brand-red); font-weight:600;">COSE Key Inspector</a> with this blob.</div>';
            } catch (e) {}
          } catch (e) {
            html += row('credentialPublicKey', '<span class="tech-badge tech-badge--err">CBOR decode failed</span>', e.message);
          }
        }

        if (flags & FLAG.ED) {
          if (i < b.length) {
            try {
              var dec2 = AmbiSecureCBOR.decode(b.slice(i));
              html += row('extensions', '<span class="tech-badge tech-badge--info">CBOR map (' + dec2.consumed + ' bytes)</span>',
                'Extension outputs (e.g. credProtect, hmac-secret).');
            } catch (e) {
              html += row('extensions', '<span class="tech-badge tech-badge--warn">CBOR decode failed</span>', e.message);
            }
          }
        }

        if (flags & FLAG.BE) {
          html += '<div class="note" style="margin-top:12px; padding:10px 14px; background:var(--secure-cyan-soft); border-left:3px solid var(--secure-cyan); border-radius:3px;"><strong>BE flag set:</strong> the credential is backup-eligible. If <strong>BS</strong> is also set, the credential is currently backed up (e.g. iCloud Keychain, Google Password Manager). For high-assurance enterprise use, you may want to require <strong>BE=0</strong> (device-bound).</div>';
        }
        output.innerHTML = html;
      } catch (e) { AS.renderError(output, e.message); }
    }
    input.addEventListener('input', go);
    if (sample) sample.addEventListener('click', function () {

      input.value = '49960de5880e8c687434170f6476605b8fe4aeb9a28632c7995cf3ba831d97634500000000cb69481e8ff7403993ec0a2729a154a80010aabbccddeeff00112233445566778899a401020326200121582000000000000000000000000000000000000000000000000000000000000000002258200000000000000000000000000000000000000000000000000000000000000000';
      go();
    });
    if (clearBtn) clearBtn.addEventListener('click', function () { input.value=''; go(); input.focus(); });

    try {
      var q = new URLSearchParams(window.location.search);
      if (q.get('h')) { input.value = q.get('h'); go(); }
    } catch (e) {  }
    go();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
