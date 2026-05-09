/* AmbiSecure — DESFire GetKeySettings response interpreter.
   NXP DESFire EV1/EV2/EV3. Decodes the 2-byte response from
   GetKeySettings (0x45): keySettings byte + numKeys/cryptoType byte. */
(function () {
  'use strict';

  var KEY_TYPE = {
    0x00: 'DES (single)',
    0x40: '3DES (TDEA — 2-key, 16 bytes)',
    0x80: 'AES-128'
  };

  function clean(hex) { return String(hex).replace(/0x/gi,'').replace(/[\s,;:_-]+/g,'').toLowerCase(); }
  function toBytes(hex) {
    var s = clean(hex);
    if (!/^[0-9a-f]*$/.test(s)) throw new Error('Non-hex characters.');
    if (s.length % 2 !== 0) throw new Error('Hex length must be even.');
    var b = []; for (var i = 0; i < s.length; i += 2) b.push(parseInt(s.substr(i, 2), 16));
    return b;
  }

  function row(label, value, note) {
    return '<div class="parsed-row"><span class="label">' + label + '</span>' +
      '<div><div class="value">' + value + '</div>' +
      (note ? '<span class="note">' + note + '</span>' : '') + '</div></div>';
  }

  function init() {
    var input = AS.$('dks-input'), output = AS.$('dks-output');
    var sample = AS.$('dks-sample'), clearBtn = AS.$('dks-clear');
    if (!input || !output) return;

    function go() {
      var raw = (input.value || '').trim();
      if (!raw) { AS.renderPlaceholder(output, 'Paste 2 bytes (hex). Byte 1 = key settings, byte 2 = numKeys + crypto type.'); return; }
      try {
        var b = toBytes(raw);
        if (b.length < 2) throw new Error('Need 2 bytes — keySettings + numKeys/cryptoType.');
        var ks = b[0];
        var nk = b[1];

        var html = '<div style="margin-bottom:14px;"><span class="tech-badge tech-badge--ok">DESFire key settings</span></div>';
        html += row('keySettings', '0x' + ks.toString(16).toUpperCase().padStart(2, '0'),
          'Bit 7..4 = key for ChangeKeySetttings. Bit 3 = ChangeKey privilege; bit 2 = create/delete with key 0; bit 1 = directory listing free; bit 0 = master key changeable.');

        var changeKeyKey = (ks >> 4) & 0x0F;
        var changeKeyPriv = (ks >> 3) & 1;
        var freeCreateDelete = (ks >> 2) & 1;
        var freeDirList = (ks >> 1) & 1;
        var allowChangeMaster = ks & 1;

        var changeKeyDesc;
        if (changeKeyKey === 0xE) changeKeyDesc = 'free access (any key)';
        else if (changeKeyKey === 0xF) changeKeyDesc = 'denied (no key can change keys)';
        else changeKeyDesc = 'requires key #' + changeKeyKey;

        html += row('  ChangeKey access', changeKeyDesc, 'Which key authorizes ChangeKey on application keys.');
        html += row('  ChangeKeySettings privilege', changeKeyPriv ? 'allowed' : 'frozen', changeKeyPriv ? 'keySettings can be modified.' : 'keySettings is frozen — cannot be changed.');
        html += row('  CreateFile / DeleteFile', freeCreateDelete ? 'free (no auth)' : 'requires master key', '');
        html += row('  Directory listing', freeDirList ? 'free' : 'requires master key', '');
        html += row('  Master key changeable', allowChangeMaster ? 'yes' : 'no (frozen)', allowChangeMaster ? 'Master key can be rolled in field.' : 'Master key is permanent.');

        var numKeys = nk & 0x3F;
        var cryptoBits = nk & 0xC0;
        html += row('Total bytes', '0x' + nk.toString(16).toUpperCase().padStart(2, '0'),
          'Bits 7..6 = crypto type. Bits 5..0 = number of keys.');
        html += row('  Crypto type', '0x' + cryptoBits.toString(16).toUpperCase().padStart(2, '0'), KEY_TYPE[cryptoBits] || 'Reserved');
        html += row('  Number of keys', String(numKeys), '0..14 application keys + master key.');

        html += '<div class="note" style="margin-top:14px; padding:10px 14px; background:var(--secure-cyan-soft); border-left:3px solid var(--secure-cyan); border-radius:3px;">' +
          '<strong>Issuer guidance:</strong> production deployments should set ChangeKeySettings privilege to <em>frozen</em> after issuance, and pin ChangeKey to a specific key. AES-128 is recommended for new deployments; TDES is legacy.</div>';

        output.innerHTML = html;
      } catch (e) { AS.renderError(output, e.message); }
    }
    input.addEventListener('input', go);
    if (sample) sample.addEventListener('click', function () { input.value = '0F 83'; go(); }); // F1: master changeable, all free, AES, 3 keys
    if (clearBtn) clearBtn.addEventListener('click', function () { input.value=''; go(); input.focus(); });
    go();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
