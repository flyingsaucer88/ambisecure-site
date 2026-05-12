(function () {
  'use strict';
  function init() {
    var input = AS.$('chain-input'), output = AS.$('chain-output');
    var sample = AS.$('chain-sample'), clearBtn = AS.$('chain-clear');
    var dropPanel = AS.$('chain-drop'), filePicker = AS.$('chain-file');
    if (!input || !output) return;

    function go() {
      var raw = input.value.trim();
      if (!raw) { AS.renderPlaceholder(output, 'Paste a certificate chain (multiple PEM blocks), or load a .pem/.crt bundle.'); return; }
      try {
        var blocks = AmbiSecureX509.autoDecode(raw);
        if (!blocks.length) throw new Error('No certificate data found.');
        var certs = [];
        for (var i = 0; i < blocks.length; i++) {
          try { certs.push(AmbiSecureX509.parseCertificate(blocks[i].der)); }
          catch (e) { certs.push({ error: e.message, idx: i }); }
        }

        var html = '';
        html += '<div style="margin-bottom:14px;"><span class="tech-badge tech-badge--ok">' + certs.length + ' CERTIFICATE' + (certs.length === 1 ? '' : 'S') + '</span></div>';

        certs.forEach(function (c, i) {
          if (c.error) {
            html += '<div class="parsed-row"><span class="label">#' + (i + 1) + '</span><div class="value"><span class="tech-badge tech-badge--err">PARSE ERROR</span> ' + AS.escHTML(c.error) + '</div></div>';
            return;
          }
          var selfSigned = (c.subject && c.issuer && c.subject === c.issuer);
          var validity = c.validity || {};
          var notAfter = validity.notAfter ? new Date(validity.notAfter) : null;
          var nowAt = new Date();
          var validBadge = '';
          if (notAfter) {
            var d = Math.floor((notAfter - nowAt) / 86400000);
            if (d < 0) validBadge = '<span class="tech-badge tech-badge--err">EXPIRED</span>';
            else if (d < 30) validBadge = '<span class="tech-badge tech-badge--warn">' + d + ' days left</span>';
            else validBadge = '<span class="tech-badge tech-badge--ok">' + d + ' days left</span>';
          }
          html += '<div style="border:1px solid var(--line);border-radius:6px;padding:14px 16px;margin-bottom:10px;background:#fff;">';
          html += '<div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-bottom:8px;">';
          html += '<span class="tech-badge tech-badge--info">#' + (i + 1) + (i === 0 ? ' · LEAF' : (selfSigned ? ' · ROOT (self-signed)' : ' · INTERMEDIATE')) + '</span>';
          html += validBadge;
          html += '<span class="tech-badge">' + AS.escHTML(c.signatureAlgorithm && (c.signatureAlgorithm.name || c.signatureAlgorithm.oid) || '') + '</span>';
          html += '</div>';
          html += '<div style="font-family:\'Source Sans 3\',sans-serif;font-size:14px;color:var(--ink);"><strong>Subject:</strong> ' + AS.escHTML(c.subject || '') + '</div>';
          html += '<div style="font-family:\'Source Sans 3\',sans-serif;font-size:14px;color:var(--brand-grey);margin-top:2px;"><strong>Issuer:</strong> ' + AS.escHTML(c.issuer || '') + '</div>';
          html += '<div style="font-family:\'JetBrains Mono\',monospace;font-size:12px;color:var(--muted-2);margin-top:6px;">Serial ' + AS.escHTML(c.serialNumberHex || '') + ' · valid ' + AS.escHTML(validity.notBefore || '') + ' → ' + AS.escHTML(validity.notAfter || '') + '</div>';
          html += '</div>';
          if (i < certs.length - 1 && !certs[i+1].error) {
            var matches = c.issuer === certs[i+1].subject;
            html += '<div style="text-align:center;margin:0 0 10px;font-family:\'Montserrat\',sans-serif;font-size:11px;letter-spacing:0.6px;color:' + (matches ? 'var(--secure-cyan-dark)' : 'var(--brand-red)') + ';">' +
              (matches ? '↓ issuer matches subject of next' : '✗ ISSUER ≠ SUBJECT OF NEXT (chain broken here)') + '</div>';
          }
        });

        output.innerHTML = html;
      } catch (e) { AS.renderError(output, e.message || String(e)); }
    }

    input.addEventListener('input', go);
    if (sample) sample.addEventListener('click', function () {
      input.value =
'-----BEGIN CERTIFICATE-----\nMIIBszCCAVigAwIBAgIJAPHd5Z7nIwBpMAoGCCqGSM49BAMCMDcxCzAJBgNVBAYT\nAlVTMRMwEQYDVQQKDApBbWJpU2VjdXJlMRMwEQYDVQQDDApFeGFtcGxlIENBMB4X\nDTI1MDEwMTAwMDAwMFoXDTI3MDEwMTAwMDAwMFowOzELMAkGA1UEBhMCVVMxEzAR\nBgNVBAoMCkFtYmlTZWN1cmUxFzAVBgNVBAMMDmRldmljZS5leGFtcGxlMFkwEwYH\nKoZIzj0CAQYIKoZIzj0DAQcDQgAE/Q4wAB1z6nWuzx5y4xH1n0hVcOTtgQjbUg0S\nfP9pAvQq7y+w9cKDCsPNiZc8mXBE6h1zwZK4uV6n1k7g/HjT7qNCMEAwHQYDVR0O\nBBYEFEf+1zYXq6f8yfEHX0w0FU3ELqg6MB8GA1UdIwQYMBaAFEf+1zYXq6f8yfEH\nX0w0FU3ELqg6MAoGCCqGSM49BAMCA0kAMEYCIQCkO9D5Fe9P3lN5wcyZ3oNg8I9o\n0Kf+GgwYpO5LRwZcTQIhANqJZyT3Q0H7XU1g0O4FcM3jdcuMt2I8pjY9/KnH6q3R\n-----END CERTIFICATE-----';
      go();
    });
    if (clearBtn) clearBtn.addEventListener('click', function () { input.value=''; go(); input.focus(); });
    AS.bindDrop(dropPanel, function (f) { if (f.error) { AS.renderError(output, f.error); return; } input.value = f.text; go(); });
    AS.bindFilePicker(filePicker, function (f) { if (f.error) { AS.renderError(output, f.error); return; } input.value = f.text; go(); });
    go();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
