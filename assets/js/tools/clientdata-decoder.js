(function () {
  'use strict';

  function row(label, value, note) {
    return '<div class="parsed-row"><span class="label">' + label + '</span>' +
      '<div><div class="value">' + value + '</div>' +
      (note ? '<span class="note">' + note + '</span>' : '') + '</div></div>';
  }

  async function sha256Hex(bytes) {
    if (!crypto || !crypto.subtle) return null;
    var d = await crypto.subtle.digest('SHA-256', bytes);
    var b = new Uint8Array(d);
    var s = '';
    for (var i = 0; i < b.length; i++) s += (b[i] < 16 ? '0' : '') + b[i].toString(16);
    return s;
  }

  function init() {
    var input = AS.$('cd-input'), output = AS.$('cd-output');
    var sample = AS.$('cd-sample'), clearBtn = AS.$('cd-clear');
    if (!input || !output) return;

    async function go() {
      var raw = (input.value || '').trim();
      if (!raw) { AS.renderPlaceholder(output, 'Paste a base64url-encoded clientDataJSON (or raw JSON).'); return; }
      try {
        var bytes;
        var jsonText;
        if (raw.charAt(0) === '{') {

          jsonText = raw;
          if (typeof TextEncoder !== 'undefined') bytes = new TextEncoder().encode(jsonText);
          else { bytes = new Uint8Array(jsonText.length); for (var i = 0; i < jsonText.length; i++) bytes[i] = jsonText.charCodeAt(i); }
        } else {
          bytes = AmbiSecureB64URL.decode(raw);
          if (typeof TextDecoder !== 'undefined') jsonText = new TextDecoder('utf-8').decode(bytes);
          else jsonText = String.fromCharCode.apply(null, bytes);
        }
        var obj;
        try { obj = JSON.parse(jsonText); } catch (e) { throw new Error('Not valid JSON after decoding.'); }

        var html = '<div style="margin-bottom:14px;"><span class="tech-badge tech-badge--ok">clientDataJSON</span> <span class="tech-badge">' + bytes.length + ' bytes</span></div>';

        var typeOK = (obj.type === 'webauthn.create' || obj.type === 'webauthn.get');
        var typeBadge = typeOK ? 'tech-badge--ok' : 'tech-badge--warn';
        html += row('type', '<span class="tech-badge ' + typeBadge + '">' + AS.escHTML(obj.type || '(missing)') + '</span>',
          obj.type === 'webauthn.create' ? 'Registration ceremony.' :
          obj.type === 'webauthn.get'    ? 'Authentication ceremony.' :
          'Unrecognised type. Expect either "webauthn.create" or "webauthn.get".');

        if (obj.challenge) {
          var cb;
          try { cb = AmbiSecureB64URL.decode(obj.challenge); }
          catch (e) { cb = null; }
          var chHex = cb ? AmbiSecureB64URL.bytesToHex(cb) : '';
          html += row('challenge', '<span class="mono">' + AS.escHTML(obj.challenge) + '</span>',
            cb ? (cb.length + ' bytes &middot; hex: <span class="mono">' + chHex + '</span> &middot; ensure this matches the challenge your RP issued.') : '(could not decode as base64url)');
        }

        if (obj.origin) {
          var u; try { u = new URL(obj.origin); } catch (e) { u = null; }
          html += row('origin', '<span class="mono">' + AS.escHTML(obj.origin) + '</span>',
            u ? ('scheme: ' + u.protocol + ' &middot; host: ' + u.host + ' &middot; the RP MUST verify this exactly matches an expected origin.') : '(not a valid URL)');
        }

        if (typeof obj.crossOrigin === 'boolean') {
          html += row('crossOrigin', String(obj.crossOrigin),
            obj.crossOrigin ? 'Set when the ceremony was performed in a cross-origin iframe — verify your RP allows this.' : 'Same-origin context (typical).');
        }

        if (obj.tokenBinding) {
          html += row('tokenBinding', '<span class="mono">' + AS.escHTML(JSON.stringify(obj.tokenBinding)) + '</span>',
            'Legacy field — generally absent in modern browsers.');
        }

        html += '<details style="margin-top:14px;"><summary style="cursor:pointer; font-family:Montserrat,sans-serif; font-size:12px; color:var(--brand-grey);">Show full JSON</summary>' +
          '<pre style="margin-top:8px; padding:14px; background:var(--code-bg); color:var(--code-fg); border-radius:6px; font-size:12.5px; overflow-x:auto;">' +
          AS.escHTML(JSON.stringify(obj, null, 2)) + '</pre></details>';

        try {
          var h = await sha256Hex(bytes);
          if (h) html += row('SHA-256(clientDataJSON)', '<span class="mono">' + h + '</span>',
            'This 32-byte digest is the second half of the data the authenticator signs (after authenticatorData). Useful for cross-checking your verification path.');
        } catch (e) {  }

        output.innerHTML = html;
      } catch (e) { AS.renderError(output, e.message); }
    }
    input.addEventListener('input', function () { go(); });
    if (sample) sample.addEventListener('click', function () {
      var sample = '{"type":"webauthn.get","challenge":"aabbccddeeff00112233445566778899","origin":"https://example.com","crossOrigin":false}';
      var b = new TextEncoder().encode(sample);
      input.value = AmbiSecureB64URL.encode(b);
      go();
    });
    if (clearBtn) clearBtn.addEventListener('click', function () { input.value=''; go(); input.focus(); });
    go();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
