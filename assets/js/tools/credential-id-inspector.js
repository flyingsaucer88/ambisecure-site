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
      '<div><div class="value">' + value + '</div>' + (note ? '<span class="note">' + note + '</span>' : '') + '</div></div>';
  }

  function shannonEntropy(bytes) {
    var counts = new Array(256).fill(0);
    for (var i = 0; i < bytes.length; i++) counts[bytes[i]]++;
    var H = 0, n = bytes.length;
    for (var j = 0; j < 256; j++) {
      if (counts[j] === 0) continue;
      var p = counts[j] / n;
      H -= p * Math.log2(p);
    }
    return H;
  }

  function init() {
    var input = AS.$('cid-input'), output = AS.$('cid-output');
    var sample = AS.$('cid-sample'), clearBtn = AS.$('cid-clear');
    if (!input || !output) return;

    function go() {
      var raw = (input.value || '').trim();
      if (!raw) { AS.renderPlaceholder(output, 'Paste a credentialId (hex or base64url).'); return; }
      try {
        var b = inputToBytes(raw);
        if (b.length === 0) throw new Error('Empty input.');
        var html = '<div style="margin-bottom:14px;"><span class="tech-badge tech-badge--ok">credentialId</span> <span class="tech-badge">' + b.length + ' bytes</span></div>';
        html += row('hex', '<span class="mono">' + AmbiSecureB64URL.bytesToHex(b) + '</span>');
        html += row('base64url', '<span class="mono">' + AmbiSecureB64URL.encode(b) + '</span>');


        var lenNote;
        if (b.length === 16) lenNote = 'Likely a 16-byte synthetic ID (rare).';
        else if (b.length >= 32 && b.length <= 64) lenNote = 'Common length range — typical for resident credentials and short discoverable creds.';
        else if (b.length >= 64 && b.length <= 128) lenNote = 'Typical for vendors that wrap a server-encrypted blob (the credentialId carries the wrapped key).';
        else if (b.length === 64) lenNote = 'Often U2F key handle (32-byte handle + 32-byte HMAC). Sanity check: can the legacy U2F flow assert with this?';
        else if (b.length > 128) lenNote = 'Long ID — likely an encrypted server-side blob (the authenticator does not store the credential locally).';
        else lenNote = 'Length is unusual.';
        html += row('length', String(b.length) + ' bytes', lenNote);


        var H = shannonEntropy(b);
        var Hpct = (H / 8 * 100).toFixed(1) + '%';
        var entropyNote = H > 7.0 ? 'High entropy — looks random / encrypted.' :
          H > 5.5 ? 'Moderate entropy — may include structured prefixes.' :
          'Low entropy — likely contains structured / repeated data.';
        html += row('shannon entropy', H.toFixed(2) + ' bits/byte (' + Hpct + ' of ideal)', entropyNote);


        if (b.length >= 16) {
          var prefix = b.slice(0, 16);
          var aaguidStr = AmbiSecureAAGUID.format(prefix);
          var hit = AmbiSecureAAGUID.lookup(aaguidStr);
          if (hit) {
            html += row('first 16 bytes', '<span class="mono">' + aaguidStr + '</span>',
              'Matches AAGUID for <strong>' + AS.escHTML(hit.vendor + ' · ' + hit.model) + '</strong>. Some vendors prepend AAGUID to the credentialId.');
          } else if (AmbiSecureAAGUID.isZero(prefix)) {
            html += row('first 16 bytes', '<span class="mono">' + aaguidStr + '</span>', 'All-zero AAGUID-shaped prefix.');
          }
        }

        html += '<div class="note" style="margin-top:14px; padding:12px 14px; background:var(--brand-soft); border-radius:4px;">' +
          '<strong>For RPs:</strong> credentialId is opaque — store it byte-for-byte and present it back in <code>allowCredentials</code> ' +
          'on assertion. Don\'t try to derive identity from the bytes; let the authenticator route requests.</div>';

        output.innerHTML = html;
      } catch (e) { AS.renderError(output, e.message); }
    }
    input.addEventListener('input', go);
    if (sample) sample.addEventListener('click', function () {
      input.value = 'AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8gISIjJCUmJygpKissLS4v';
      go();
    });
    if (clearBtn) clearBtn.addEventListener('click', function () { input.value=''; go(); input.focus(); });
    go();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
