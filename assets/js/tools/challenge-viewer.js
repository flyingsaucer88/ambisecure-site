/* AmbiSecure — WebAuthn challenge viewer.
   Decodes a base64url challenge, reports length and entropy, and warns
   about common mistakes (under-length, ASCII-only, predictable). */
(function () {
  'use strict';

  function row(label, value, note) {
    return '<div class="parsed-row"><span class="label">' + label + '</span>' +
      '<div><div class="value">' + value + '</div>' + (note ? '<span class="note">' + note + '</span>' : '') + '</div></div>';
  }

  function shannonEntropy(bytes) {
    var counts = new Array(256).fill(0);
    for (var i = 0; i < bytes.length; i++) counts[bytes[i]]++;
    var H = 0, n = bytes.length;
    for (var j = 0; j < 256; j++) { if (counts[j] === 0) continue; var p = counts[j] / n; H -= p * Math.log2(p); }
    return H;
  }

  function init() {
    var input = AS.$('chal-input'), output = AS.$('chal-output');
    var sample = AS.$('chal-sample'), clearBtn = AS.$('chal-clear');
    var generate = AS.$('chal-generate');
    if (!input || !output) return;

    function go() {
      var raw = (input.value || '').trim();
      if (!raw) { AS.renderPlaceholder(output, 'Paste a base64url challenge.'); return; }
      try {
        var b;
        try { b = AmbiSecureB64URL.decode(raw); }
        catch (e) { b = AmbiSecureB64URL.hexToBytes(raw); }
        var html = '<div style="margin-bottom:14px;"><span class="tech-badge tech-badge--ok">challenge</span> <span class="tech-badge">' + b.length + ' bytes</span></div>';
        html += row('hex', '<span class="mono">' + AmbiSecureB64URL.bytesToHex(b) + '</span>');
        html += row('base64url', '<span class="mono">' + AmbiSecureB64URL.encode(b) + '</span>');

        var lenBadge = b.length >= 16 ? 'tech-badge--ok' : 'tech-badge--err';
        var lenNote = b.length >= 32 ? 'Recommended: at least 32 bytes (the spec allows ≥16; security guidance is 32).' :
          b.length >= 16 ? 'Spec-compliant minimum (16 bytes). Strong recommendation: 32 bytes.' :
          'TOO SHORT — WebAuthn spec requires at least 16 bytes, with 32 recommended.';
        html += row('length', '<span class="tech-badge ' + lenBadge + '">' + b.length + ' bytes</span>', lenNote);

        var H = shannonEntropy(b);
        var entBadge = H > 7.0 ? 'tech-badge--ok' : H > 5.5 ? 'tech-badge--warn' : 'tech-badge--err';
        var entNote = H > 7.0 ? 'High entropy — looks random.' : H > 5.5 ? 'Moderate entropy — verify your RNG.' :
          'Low entropy — DO NOT use predictable challenges. WebAuthn challenges must be cryptographically random.';
        html += row('entropy', '<span class="tech-badge ' + entBadge + '">' + H.toFixed(2) + ' bits/byte</span>', entNote);

        // Common pitfalls
        var ascii = '';
        var allPrintable = true;
        for (var i = 0; i < b.length; i++) {
          var c = b[i];
          if (c < 0x20 || c > 0x7E) allPrintable = false;
          ascii += (c >= 0x20 && c <= 0x7E) ? String.fromCharCode(c) : '.';
        }
        if (allPrintable && b.length < 64) {
          html += '<div class="note" style="margin-top:10px; padding:10px 14px; background:rgba(199,122,0,0.08); border-left:3px solid var(--secure-amber); border-radius:3px;">' +
            '<strong>Suspicious:</strong> all bytes are printable ASCII (<code>' + AS.escHTML(ascii) + '</code>). Real cryptographic random will look uniformly distributed across all byte values. Verify the RP is generating challenges with crypto.randomBytes / crypto.getRandomValues, not Math.random or string concatenation.</div>';
        }

        html += '<div class="note" style="margin-top:14px;"><strong>RP rules:</strong> generate the challenge server-side with a CSPRNG, store it bound to the user session, and verify on assertion that the clientData challenge matches. Single-use; expire after a short window (~5 min).</div>';
        output.innerHTML = html;
      } catch (e) { AS.renderError(output, e.message); }
    }
    input.addEventListener('input', go);
    if (sample) sample.addEventListener('click', function () {
      // 32 random bytes (visually realistic challenge)
      var b = new Uint8Array(32);
      if (crypto && crypto.getRandomValues) crypto.getRandomValues(b);
      else for (var i = 0; i < 32; i++) b[i] = Math.floor(Math.random() * 256);
      input.value = AmbiSecureB64URL.encode(b);
      go();
    });
    if (generate) generate.addEventListener('click', function () {
      var b = new Uint8Array(32);
      if (crypto && crypto.getRandomValues) crypto.getRandomValues(b);
      input.value = AmbiSecureB64URL.encode(b);
      go();
    });
    if (clearBtn) clearBtn.addEventListener('click', function () { input.value=''; go(); input.focus(); });
    go();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
