(function () {
  'use strict';

  function row(label, value, note) {
    return '<div class="parsed-row"><span class="label">' + label + '</span>' +
      '<div><div class="value">' + value + '</div>' + (note ? '<span class="note">' + note + '</span>' : '') + '</div></div>';
  }

  function init() {
    var uidInput = AS.$('kd-uid'), masterInput = AS.$('kd-master'), output = AS.$('kd-output');
    var sample = AS.$('kd-sample'), clearBtn = AS.$('kd-clear');
    if (!uidInput || !masterInput || !output) return;

    function bytesToHex(b) { var s = ''; for (var i = 0; i < b.length; i++) s += (b[i] < 16 ? '0' : '') + b[i].toString(16); return s.toUpperCase(); }

    async function go() {
      var uid = (uidInput.value || '').trim().replace(/[\s:_-]/g, '');
      var master = (masterInput.value || '').trim().replace(/[\s:_-]/g, '');
      if (!uid || !master) { AS.renderPlaceholder(output, 'Enter a card UID and a (placeholder) master key.'); return; }
      if (!/^[0-9a-fA-F]+$/.test(uid)) { AS.renderError(output, 'UID must be hex.'); return; }
      if (!/^[0-9a-fA-F]+$/.test(master)) { AS.renderError(output, 'Master key must be hex.'); return; }
      if (master.length !== 32) { AS.renderError(output, 'AES-128 master key must be 16 bytes (32 hex characters). NEVER paste a real key here — this tool is an illustration only.'); return; }

      try {

        var uidBytes = new Uint8Array(uid.length / 2);
        for (var i = 0; i < uidBytes.length; i++) uidBytes[i] = parseInt(uid.substr(i * 2, 2), 16);
        var keyBytes = new Uint8Array(16);
        for (var j = 0; j < 16; j++) keyBytes[j] = parseInt(master.substr(j * 2, 2), 16);
        var input = new Uint8Array(1 + uidBytes.length + keyBytes.length);
        input[0] = 0x01;
        input.set(uidBytes, 1);
        input.set(keyBytes, 1 + uidBytes.length);
        var digest = await crypto.subtle.digest('SHA-256', input);
        var dBytes = new Uint8Array(digest);
        var demoKey = dBytes.slice(0, 16);

        var html = '<div style="margin-bottom:14px;">' +
          '<span class="tech-badge tech-badge--info">EDUCATIONAL DEMONSTRATION</span> ' +
          '<span class="tech-badge tech-badge--warn">NOT a production diversification</span></div>';

        html += row('Master key K<sub>app</sub>', '<span class="mono">' + master.toUpperCase() + '</span>', 'Lives in your SAM only — never on a card. NEVER paste a real master key into a webpage.');
        html += row('Card UID', '<span class="mono">' + bytesToHex(uidBytes) + '</span>', 'Unique per card.');
        html += row('Diversification input', '<span class="mono">01 || UID || K<sub>app</sub></span>', 'Real algorithm: AES-CMAC over <code>0x01 || UID</code> with K<sub>app</sub>. We use SHA-256 for demonstration only.');
        html += row('Demo K<sub>card</sub>', '<span class="mono">' + bytesToHex(demoKey) + '</span>', 'This is SHA-256 truncated to 16 bytes — for illustration. Production: AES-CMAC per NXP AN10922. The point is that <em>every card gets a different key</em>.');

        html += '<div class="note" style="margin-top:14px; padding:12px 16px; background:var(--secure-cyan-soft); border-left:3px solid var(--secure-cyan); border-radius:3px;"><strong>Why diversification matters:</strong> compromising one card\'s key reveals only that card. The master stays in the SAM, in the security boundary the issuer controls. Without diversification, one extracted key compromises the entire fleet — a deployment posture no transit operator should accept.</div>';

        html += '<div class="note" style="margin-top:10px; padding:12px 16px; background:rgba(199,122,0,0.08); border-left:3px solid var(--secure-amber); border-radius:3px;"><strong>Operator note:</strong> production diversification keys must be managed inside an HSM or a SAM. They are never exposed to host software, and the diversification function itself should run inside that hardware boundary.</div>';

        output.innerHTML = html;
      } catch (e) { AS.renderError(output, e.message); }
    }
    uidInput.addEventListener('input', go); masterInput.addEventListener('input', go);
    if (sample) sample.addEventListener('click', function () {
      uidInput.value = '04AABBCCDDEEFF';
      masterInput.value = '00112233445566778899AABBCCDDEEFF';
      go();
    });
    if (clearBtn) clearBtn.addEventListener('click', function () { uidInput.value=''; masterInput.value=''; go(); uidInput.focus(); });
    go();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
