/* AmbiSecure — Certificate fingerprint generator (Web Crypto). Client-side. */
(function () {
  'use strict';
  function init() {
    var input = AS.$('fp-input'), output = AS.$('fp-output');
    var sample = AS.$('fp-sample'), clearBtn = AS.$('fp-clear');
    var dropPanel = AS.$('fp-drop'), filePicker = AS.$('fp-file');
    if (!input || !output) return;

    function row(label, value) {
      return '<div class="parsed-row"><span class="label">' + AS.escHTML(label) + '</span>' +
        '<div><div class="value" style="word-break:break-all;">' + value + '</div></div></div>';
    }

    function go() {
      var raw = input.value.trim();
      if (!raw) { AS.renderPlaceholder(output, 'Paste a PEM-armoured certificate, or load a .crt / .pem / .cer file.'); return; }
      if (!window.crypto || !window.crypto.subtle) {
        AS.renderError(output, 'Web Crypto API is not available in this browser.');
        return;
      }
      try {
        var blocks = AmbiSecureX509.autoDecode(raw);
        if (!blocks.length) throw new Error('No certificate data found.');
        var first = blocks[0].der;
        Promise.all([
          AmbiSecureX509.fingerprint(first, 'sha-1'),
          AmbiSecureX509.fingerprint(first, 'sha-256'),
          AmbiSecureX509.fingerprint(first, 'sha-384'),
          AmbiSecureX509.fingerprint(first, 'sha-512')
        ]).then(function (fps) {
          var html = '<div style="margin-bottom:14px;"><span class="tech-badge tech-badge--ok">FINGERPRINTS</span> <span class="tech-badge">' + first.length + ' bytes DER</span></div>';
          html += row('SHA-1',   '<span class="tech-badge tech-badge--warn" style="margin-right:8px;">deprecated</span>' + fps[0]);
          html += row('SHA-256', '<span class="tech-badge tech-badge--ok" style="margin-right:8px;">recommended</span>' + fps[1]);
          html += row('SHA-384', fps[2]);
          html += row('SHA-512', fps[3]);
          output.innerHTML = html;
        }).catch(function (e) { AS.renderError(output, 'Hash failed: ' + e.message); });
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
