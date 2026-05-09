/* AmbiSecure — X.509 Certificate viewer. Client-side. */
(function () {
  'use strict';
  function init() {
    var input = AS.$('x-input'), output = AS.$('x-output');
    var sample = AS.$('x-sample'), clearBtn = AS.$('x-clear');
    var dropPanel = AS.$('x-drop'), filePicker = AS.$('x-file');
    if (!input || !output) return;

    function row(label, value, note, mono) {
      return '<div class="parsed-row"><span class="label">' + AS.escHTML(label) + '</span>' +
        '<div><div class="value"' + (mono ? '' : ' style="font-family:\'Source Sans 3\',sans-serif;font-size:14px;color:var(--ink);"') + '>' + (value || '<em style="color:var(--muted-2);">(none)</em>') + '</div>' +
        (note ? '<span class="note">' + note + '</span>' : '') + '</div></div>';
    }

    function renderCert(cert, idx, total) {
      var spki = cert.subjectPublicKeyInfo;
      var algName = (cert.signatureAlgorithm && (cert.signatureAlgorithm.name || cert.signatureAlgorithm.oid)) || '';
      var pkAlgName = (spki && spki.algorithm && (spki.algorithm.name || spki.algorithm.oid)) || '';
      var pkBits = spki && spki.rsa ? spki.rsa.modulusBits : (spki ? spki.sizeBits : null);
      var validity = cert.validity || {};
      var now = new Date();
      var notAfter = validity.notAfter ? new Date(validity.notAfter) : null;
      var validBadge = '';
      if (notAfter) {
        var daysLeft = Math.floor((notAfter - now) / 86400000);
        if (daysLeft < 0) validBadge = '<span class="tech-badge tech-badge--err">EXPIRED</span>';
        else if (daysLeft < 30) validBadge = '<span class="tech-badge tech-badge--warn">' + daysLeft + ' DAYS LEFT</span>';
        else validBadge = '<span class="tech-badge tech-badge--ok">VALID · ' + daysLeft + ' DAYS LEFT</span>';
      }

      var html = '';
      if (total > 1) html += '<h3 style="font-family:\'Montserrat\',sans-serif;font-size:13px;letter-spacing:1.2px;text-transform:uppercase;margin:24px 0 12px;color:var(--brand-dark);">Certificate ' + (idx + 1) + ' of ' + total + '</h3>';
      html += '<div style="margin-bottom:14px;"><span class="tech-badge tech-badge--ok">X.509 v' + cert.version + '</span> ' + validBadge + ' <span class="tech-badge tech-badge--info">' + AS.escHTML(algName) + '</span></div>';
      html += row('Subject', AS.escHTML(cert.subject || ''), '');
      html += row('Issuer', AS.escHTML(cert.issuer || ''), '');
      html += row('Serial number', AS.escHTML(cert.serialNumberHex || ''), '', true);
      html += row('Valid from', AS.escHTML(validity.notBefore || ''), '');
      html += row('Valid to', AS.escHTML(validity.notAfter || ''), '');
      html += row('Signature algorithm', AS.escHTML(algName) + (cert.signatureAlgorithm && cert.signatureAlgorithm.oid ? ' <span style="color:var(--muted-2);">[' + AS.escHTML(cert.signatureAlgorithm.oid) + ']</span>' : ''), '');
      html += row('Public key algorithm', AS.escHTML(pkAlgName) + (pkBits ? ' · ' + pkBits + ' bits' : ''), '');
      if (spki && spki.rsa) {
        html += row('Modulus preview', AS.escHTML(spki.rsa.modulusHexPreview || ''), 'Public exponent: ' + AS.escHTML(spki.rsa.exponent), true);
      }

      if (cert.extensions && cert.extensions.length) {
        html += '<div style="margin:18px 0 8px; font-family:\'Montserrat\',sans-serif; font-size:12px; letter-spacing:1px; text-transform:uppercase; color:var(--brand-dark);">Extensions (' + cert.extensions.length + ')</div>';
        cert.extensions.forEach(function (e) {
          var label = (e.name || e.oid) + (e.critical ? ' (critical)' : '');
          var val = e.human != null ? AS.escHTML(e.human) : (e.value ? AS.escHTML(AmbiSecureASN1.bytesToHex(e.value.subarray(0, 32), ' ')) + (e.value.length > 32 ? ' …' : '') : '');
          html += row(label, val, e.critical ? 'Marked CRITICAL — clients MUST process.' : '', !e.human);
        });
      }
      html += row('Signature value', AS.escHTML(cert.signatureValuePreview || ''), '', true);
      return html;
    }

    function go() {
      var raw = input.value.trim();
      if (!raw) { AS.renderPlaceholder(output, 'Paste a PEM-armoured certificate (or several in a chain), or load a .crt/.pem/.cer file.'); return; }
      try {
        var blocks = AmbiSecureX509.autoDecode(raw);
        if (!blocks.length) throw new Error('No certificate data found.');
        var html = '';
        for (var i = 0; i < blocks.length; i++) {
          try {
            var cert = AmbiSecureX509.parseCertificate(blocks[i].der);
            html += renderCert(cert, i, blocks.length);
          } catch (e) {
            html += '<div class="parsed-row"><span class="label">Block ' + (i + 1) + '</span><div class="value"><span class="tech-badge tech-badge--err">PARSE ERROR</span> ' + AS.escHTML(e.message) + '</div></div>';
          }
        }
        output.innerHTML = html;
      } catch (e) { AS.renderError(output, e.message || String(e)); }
    }

    input.addEventListener('input', go);
    if (sample) sample.addEventListener('click', function () {
      input.value = '-----BEGIN CERTIFICATE-----\nMIIBszCCAVigAwIBAgIJAPHd5Z7nIwBpMAoGCCqGSM49BAMCMDcxCzAJBgNVBAYT\nAlVTMRMwEQYDVQQKDApBbWJpU2VjdXJlMRMwEQYDVQQDDApFeGFtcGxlIENBMB4X\nDTI1MDEwMTAwMDAwMFoXDTI3MDEwMTAwMDAwMFowOzELMAkGA1UEBhMCVVMxEzAR\nBgNVBAoMCkFtYmlTZWN1cmUxFzAVBgNVBAMMDmRldmljZS5leGFtcGxlMFkwEwYH\nKoZIzj0CAQYIKoZIzj0DAQcDQgAE/Q4wAB1z6nWuzx5y4xH1n0hVcOTtgQjbUg0S\nfP9pAvQq7y+w9cKDCsPNiZc8mXBE6h1zwZK4uV6n1k7g/HjT7qNCMEAwHQYDVR0O\nBBYEFEf+1zYXq6f8yfEHX0w0FU3ELqg6MB8GA1UdIwQYMBaAFEf+1zYXq6f8yfEH\nX0w0FU3ELqg6MAoGCCqGSM49BAMCA0kAMEYCIQCkO9D5Fe9P3lN5wcyZ3oNg8I9o\n0Kf+GgwYpO5LRwZcTQIhANqJZyT3Q0H7XU1g0O4FcM3jdcuMt2I8pjY9/KnH6q3R\n-----END CERTIFICATE-----';
      go();
    });
    if (clearBtn) clearBtn.addEventListener('click', function () { input.value=''; go(); input.focus(); });
    AS.bindDrop(dropPanel, function (f) { if (f.error) { AS.renderError(output, f.error); return; } input.value = f.text; go(); });
    AS.bindFilePicker(filePicker, function (f) { if (f.error) { AS.renderError(output, f.error); return; } input.value = f.text; go(); });
    go();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
