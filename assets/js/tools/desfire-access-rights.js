/* AmbiSecure — DESFire Access-Rights decoder.
   Decodes the 16-bit access-rights word into the four key references:
   Read · Write · Read+Write · ChangeAccessRights. */
(function () {
  'use strict';
  function init() {
    var input = AS.$('dar-input'), output = AS.$('dar-output');
    var sample = AS.$('dar-sample'), clearBtn = AS.$('dar-clear');
    if (!input || !output) return;

    function nibbleLabel(n) {
      if (n === 0xE) return 'free access (any key, no auth required)';
      if (n === 0xF) return 'denied (no key — operation forbidden)';
      return 'requires authentication with key #' + n;
    }
    function tone(n) {
      if (n === 0xE) return 'warn';
      if (n === 0xF) return 'err';
      return 'ok';
    }

    function go() {
      var raw = (input.value || '').trim().replace(/0x/i, '').replace(/\s+/g, '');
      if (!raw) { AS.renderPlaceholder(output, 'Enter the 4-hex-digit DESFire access-rights word (e.g. 1234).'); return; }
      if (!/^[0-9a-fA-F]{1,4}$/.test(raw)) { AS.renderError(output, 'Need 1–4 hex digits.'); return; }
      var v = parseInt(raw, 16);
      while (raw.length < 4) raw = '0' + raw;
      var read    = (v >> 12) & 0x0F;
      var write   = (v >> 8)  & 0x0F;
      var rw      = (v >> 4)  & 0x0F;
      var chg     =  v        & 0x0F;

      function row(label, hex, n) {
        return '<div class="parsed-row"><span class="label">' + label + '</span>' +
          '<div><div class="value"><span class="tech-badge tech-badge--' + tone(n) + '">' + hex.toString(16).toUpperCase() + '</span> ' +
          '<span style="font-family:\'Source Sans 3\',sans-serif; color:var(--ink);">' + nibbleLabel(n) + '</span></div></div></div>';
      }

      var html = '<div style="margin-bottom:14px;"><span class="tech-badge tech-badge--ok">VALID</span> <span class="tech-badge">0x' + raw.toUpperCase() + '</span></div>';
      html += row('Read access',           read,  read);
      html += row('Write access',          write, write);
      html += row('Read &amp; Write',      rw,    rw);
      html += row('Change access rights',  chg,   chg);
      html += '<div class="parsed-row"><span class="label">Bit layout</span><div class="value">' +
        'b15..b12 Read &middot; b11..b8 Write &middot; b7..b4 R+W &middot; b3..b0 ChangeARights' +
        '</div></div>';
      output.innerHTML = html;
    }
    input.addEventListener('input', go);
    if (sample) sample.addEventListener('click', function () { input.value = '1230'; go(); });
    if (clearBtn) clearBtn.addEventListener('click', function () { input.value=''; go(); input.focus(); });
    go();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
