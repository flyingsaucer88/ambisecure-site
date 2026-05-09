/* AmbiSecure — AAGUID lookup.
   Hand-curated offline directory. See assets/js/lib/aaguid-dict.js. */
(function () {
  'use strict';

  function row(label, value, note) {
    return '<div class="parsed-row"><span class="label">' + label + '</span>' +
      '<div><div class="value">' + value + '</div>' +
      (note ? '<span class="note">' + note + '</span>' : '') + '</div></div>';
  }

  function init() {
    var input = AS.$('aaguid-input'), output = AS.$('aaguid-output');
    var sample = AS.$('aaguid-sample'), clearBtn = AS.$('aaguid-clear');
    var browse = AS.$('aaguid-browse');
    if (!input || !output) return;

    function go() {
      var raw = (input.value || '').trim();
      if (!raw) { AS.renderPlaceholder(output, 'Paste an AAGUID (32 hex chars or canonical 8-4-4-4-12 form).'); return; }
      try {
        var hit = AmbiSecureAAGUID.lookup(raw);
        var canon = String(raw).toLowerCase().replace(/[^0-9a-f]/g, '');
        if (canon.length !== 32) throw new Error('AAGUID must be 16 bytes (32 hex characters).');
        var formatted = canon.substr(0, 8) + '-' + canon.substr(8, 4) + '-' + canon.substr(12, 4) + '-' + canon.substr(16, 4) + '-' + canon.substr(20, 12);
        var allZero = /^0+$/.test(canon);
        var html = '<div style="margin-bottom:14px;"><span class="tech-badge tech-badge--ok">AAGUID</span></div>';
        html += row('Canonical', '<span class="mono">' + formatted + '</span>', 'RFC 4122 hex form.');
        if (allZero) {
          html += row('Match', '<span class="tech-badge tech-badge--info">Zero AAGUID</span>',
            'A zero AAGUID is allowed for self-attestation or unverified authenticators in WebAuthn level 2 — the authenticator is not declaring a make/model.');
        } else if (hit) {
          html += row('Vendor', '<strong>' + AS.escHTML(hit.vendor) + '</strong>', '');
          html += row('Model', AS.escHTML(hit.model), '');
          var transports = []; if (hit.usb) transports.push('USB'); if (hit.nfc) transports.push('NFC');
          if (transports.length) html += row('Transports', transports.join(' &middot; '), 'Reported transports.');
          html += '<div class="note" style="margin-top:12px;">For production attestation validation, fetch and verify the FIDO Metadata Service (MDS) BLOB rather than relying on a hand-curated dictionary.</div>';
        } else {
          html += row('Match', '<span class="tech-badge tech-badge--warn">Not in offline dictionary</span>',
            'Not present in the AmbiSecure curated set. The FIDO Metadata Service (MDS) BLOB is the authoritative directory — fetch it for production lookups.');
        }
        output.innerHTML = html;
      } catch (e) { AS.renderError(output, e.message); }
    }
    input.addEventListener('input', go);
    if (sample) sample.addEventListener('click', function () {
      input.value = 'cb69481e-8ff7-4039-93ec-0a2729a154a8';
      go();
    });
    if (clearBtn) clearBtn.addEventListener('click', function () { input.value=''; go(); input.focus(); });

    if (browse) {
      var rows = AmbiSecureAAGUID.entries().map(function (e) {
        return '<tr><td><span class="mono" style="font-size:11.5px;">' + e.aaguid + '</span></td>' +
          '<td>' + AS.escHTML(e.vendor) + '</td>' +
          '<td>' + AS.escHTML(e.model) + '</td>' +
          '<td style="font-family:Montserrat,sans-serif;font-size:11.5px;color:var(--brand-grey);">' +
            (e.usb ? 'USB ' : '') + (e.nfc ? 'NFC' : '') +
          '</td></tr>';
      }).join('');
      browse.innerHTML = '<table style="width:100%; font-family:Source Sans 3,sans-serif; font-size:12.5px; border-collapse:collapse;">' +
        '<thead><tr style="background:var(--brand-soft);"><th style="text-align:left;padding:8px 10px;font-family:Montserrat,sans-serif;font-size:11px;letter-spacing:0.4px;text-transform:uppercase;">AAGUID</th>' +
        '<th style="text-align:left;padding:8px 10px;font-family:Montserrat,sans-serif;font-size:11px;letter-spacing:0.4px;text-transform:uppercase;">Vendor</th>' +
        '<th style="text-align:left;padding:8px 10px;font-family:Montserrat,sans-serif;font-size:11px;letter-spacing:0.4px;text-transform:uppercase;">Model</th>' +
        '<th style="text-align:left;padding:8px 10px;font-family:Montserrat,sans-serif;font-size:11px;letter-spacing:0.4px;text-transform:uppercase;">Transports</th></tr></thead>' +
        '<tbody>' + rows + '</tbody></table>';
    }

    go();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
