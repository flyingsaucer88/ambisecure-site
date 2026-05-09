/* AmbiSecure — FIDO Metadata Explorer.
   Browse the curated AAGUID directory in metadata-style cards: vendor,
   model, transports, posture (BE=0 in our shipping definition).
   Production should fetch the FIDO MDS BLOB; this is a useful stand-in
   for offline browsing during integration. */
(function () {
  'use strict';

  function badge(text, cls) {
    return '<span class="tech-badge ' + (cls || '') + '">' + AS.escHTML(text) + '</span>';
  }

  function init() {
    var search = AS.$('mds-search'), filterTransport = AS.$('mds-transport');
    var output = AS.$('mds-output'), countEl = AS.$('mds-count');
    if (!output) return;
    var entries = AmbiSecureAAGUID.entries();

    function render() {
      var q = (search ? search.value : '').toLowerCase().trim();
      var t = filterTransport ? filterTransport.value : 'all';
      var filtered = entries.filter(function (e) {
        if (q) {
          var hay = (e.vendor + ' ' + e.model + ' ' + e.aaguid).toLowerCase();
          if (hay.indexOf(q) === -1) return false;
        }
        if (t === 'usb' && !e.usb) return false;
        if (t === 'nfc' && !e.nfc) return false;
        return true;
      });
      if (countEl) countEl.textContent = filtered.length + ' authenticator' + (filtered.length === 1 ? '' : 's');
      if (filtered.length === 0) {
        output.innerHTML = '<div class="placeholder">No authenticators match.</div>';
        return;
      }
      // Group by vendor
      var byVendor = {};
      filtered.forEach(function (e) { (byVendor[e.vendor] = byVendor[e.vendor] || []).push(e); });
      var html = '';
      Object.keys(byVendor).sort().forEach(function (v) {
        html += '<h3 style="font-family:Montserrat,sans-serif; font-size:14px; letter-spacing:0.6px; text-transform:uppercase; color:var(--brand-dark); margin:24px 0 12px; padding-bottom:6px; border-bottom:1px solid var(--line);">' + AS.escHTML(v) + '</h3>';
        html += '<div class="fido-grid" style="margin:0;">';
        byVendor[v].forEach(function (e) {
          var transports = [];
          if (e.usb) transports.push(badge('USB', 'tech-badge--info'));
          if (e.nfc) transports.push(badge('NFC', 'tech-badge--info'));
          html += '<div class="fido-card">' +
            '<span class="fc-tag mono" style="font-size:9.5px;">' + e.aaguid + '</span>' +
            '<h3>' + AS.escHTML(e.model) + '</h3>' +
            '<p style="margin-top:8px;">' + transports.join(' ') + ' ' + badge('BE=0', 'tech-badge--ok') + '</p>' +
            '</div>';
        });
        html += '</div>';
      });
      output.innerHTML = html;
    }
    if (search) search.addEventListener('input', render);
    if (filterTransport) filterTransport.addEventListener('change', render);
    render();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
