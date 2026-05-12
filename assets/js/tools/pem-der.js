(function () {
  'use strict';
  function init() {
    var input = AS.$('pem-input'), output = AS.$('pem-output');
    var dirSel = AS.$('pem-direction'), labelSel = AS.$('pem-label');
    var sample = AS.$('pem-sample'), clearBtn = AS.$('pem-clear'), dl = AS.$('pem-download');
    var dropPanel = AS.$('pem-drop'), filePicker = AS.$('pem-file');
    if (!input || !output) return;

    var lastBytes = null, lastIsDER = false;

    function go() {
      var raw = input.value.trim();
      output.textContent = ''; lastBytes = null;
      if (!raw) { AS.renderPlaceholder(output, 'Paste PEM, base64, or hex to convert.'); return; }
      try {
        var dir = dirSel.value;
        var label = labelSel.value;
        if (dir === 'pem-to-der') {
          var blocks;
          if (raw.indexOf('-----BEGIN') !== -1) blocks = AmbiSecureX509.decodePEM(raw);
          else blocks = [{ label: 'BASE64', der: AmbiSecureX509.base64Decode(raw.replace(/[\s]/g,'')) }];
          if (!blocks.length) throw new Error('No PEM block recognised. Headers like -----BEGIN CERTIFICATE----- are required.');
          var first = blocks[0];
          lastBytes = first.der; lastIsDER = true;
          output.innerHTML =
            '<div style="margin-bottom:14px;"><span class="tech-badge tech-badge--ok">DECODED</span> ' +
            '<span class="tech-badge tech-badge--info">' + AS.escHTML(first.label) + '</span> ' +
            '<span class="tech-badge">' + first.der.length + ' bytes</span>' +
            (blocks.length > 1 ? ' <span class="tech-badge tech-badge--warn">' + (blocks.length - 1) + ' more block(s)</span>' : '') +
            '</div>' +
            '<div class="parsed-row"><span class="label">DER (hex)</span>' +
            '<div class="value" style="word-break:break-all; max-height:340px; overflow:auto;">' +
            AS.escHTML(AmbiSecureASN1.bytesToHex(first.der, ' ').replace(/((?:[0-9A-F]{2} ){16})/g, '$1\n')) +
            '</div></div>';
        } else {

          var bytes;
          if (/^[0-9a-f\s,;:_-]+$/i.test(raw)) bytes = AmbiSecureASN1.hexToBytes(raw);
          else bytes = AmbiSecureX509.base64Decode(raw.replace(/[\s]/g,''));
          var pem = AmbiSecureX509.encodePEM(bytes, label);
          lastBytes = new TextEncoder().encode(pem); lastIsDER = false;
          output.innerHTML =
            '<div style="margin-bottom:14px;"><span class="tech-badge tech-badge--ok">ENCODED</span> ' +
            '<span class="tech-badge tech-badge--info">' + AS.escHTML(label) + '</span> ' +
            '<span class="tech-badge">' + bytes.length + ' input bytes</span></div>' +
            '<pre class="mono" style="background:#14161A;color:#E6E6EA;padding:14px;border-radius:6px;overflow-x:auto;font-size:12.5px;line-height:1.55;">' +
            AS.escHTML(pem) + '</pre>';
        }
      } catch (e) {
        AS.renderError(output, e.message || String(e));
        lastBytes = null;
      }
    }

    input.addEventListener('input', go);
    dirSel.addEventListener('change', go);
    labelSel.addEventListener('change', go);
    if (sample) sample.addEventListener('click', function () {
      input.value = '-----BEGIN CERTIFICATE-----\nMIIBszCCAVigAwIBAgIJAPHd5Z7nIwBpMAoGCCqGSM49BAMCMDcxCzAJBgNVBAYT\nAlVTMRMwEQYDVQQKDApBbWJpU2VjdXJlMRMwEQYDVQQDDApFeGFtcGxlIENBMB4X\nDTI1MDEwMTAwMDAwMFoXDTI3MDEwMTAwMDAwMFowOzELMAkGA1UEBhMCVVMxEzAR\nBgNVBAoMCkFtYmlTZWN1cmUxFzAVBgNVBAMMDmRldmljZS5leGFtcGxlMFkwEwYH\nKoZIzj0CAQYIKoZIzj0DAQcDQgAE/Q4wAB1z6nWuzx5y4xH1n0hVcOTtgQjbUg0S\nfP9pAvQq7y+w9cKDCsPNiZc8mXBE6h1zwZK4uV6n1k7g/HjT7qNCMEAwHQYDVR0O\nBBYEFEf+1zYXq6f8yfEHX0w0FU3ELqg6MB8GA1UdIwQYMBaAFEf+1zYXq6f8yfEH\nX0w0FU3ELqg6MAoGCCqGSM49BAMCA0kAMEYCIQCkO9D5Fe9P3lN5wcyZ3oNg8I9o\n0Kf+GgwYpO5LRwZcTQIhANqJZyT3Q0H7XU1g0O4FcM3jdcuMt2I8pjY9/KnH6q3R\n-----END CERTIFICATE-----';
      dirSel.value = 'pem-to-der';
      go();
    });
    if (clearBtn) clearBtn.addEventListener('click', function () { input.value=''; go(); input.focus(); });
    if (dl) dl.addEventListener('click', function () {
      if (!lastBytes) return;
      var label = labelSel.value;
      if (lastIsDER) {
        var safe = label.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        AS.downloadBlob('output-' + safe + '.der', 'application/x-x509-ca-cert', lastBytes);
      } else {
        AS.downloadBlob('output.pem', 'application/x-pem-file', lastBytes);
      }
    });
    AS.bindDrop(dropPanel, function (f) { if (f.error) { AS.renderError(output, f.error); return; } input.value = f.text; go(); });
    AS.bindFilePicker(filePicker, function (f) { if (f.error) { AS.renderError(output, f.error); return; } input.value = f.text; go(); });
    go();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
