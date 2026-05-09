/* AmbiSecure — Base64 certificate decoder. Detects + extracts cert from a PEM, header-less base64, or hex. */
(function () {
  'use strict';
  function init() {
    var input = AS.$('b64c-input'), output = AS.$('b64c-output');
    var sample = AS.$('b64c-sample'), clearBtn = AS.$('b64c-clear');
    var dropPanel = AS.$('b64c-drop'), filePicker = AS.$('b64c-file');
    if (!input || !output) return;

    function go() {
      var raw = input.value.trim();
      if (!raw) { AS.renderPlaceholder(output, 'Paste a base64 blob (with or without PEM headers), or load a file.'); return; }
      try {
        var blocks = AmbiSecureX509.autoDecode(raw);
        if (!blocks.length) throw new Error('No data recognised.');
        var html = '<div style="margin-bottom:14px;"><span class="tech-badge tech-badge--ok">' + blocks.length + ' BLOCK' + (blocks.length === 1 ? '' : 'S') + '</span></div>';
        for (var i = 0; i < blocks.length; i++) {
          var b = blocks[i];
          var label = b.label || ('Block ' + (i + 1));
          var pem = AmbiSecureX509.encodePEM(b.der, label === 'BASE64' || label === 'HEX' || label === 'DER' ? 'CERTIFICATE' : label);
          var detected = '';
          try {
            var top = AmbiSecureASN1.parse(b.der)[0];
            if (top && top.children && top.children.length === 3 &&
                top.children[0].constructed && top.children[1].constructed && top.children[2].tagNumber === 3) {
              detected = 'Looks like an X.509 Certificate (TBS / SignatureAlg / Signature).';
            } else if (top && top.children && top.children.length === 3 && top.children[0].constructed) {
              detected = 'Looks like a PKCS#10 CSR or similar 3-part SEQUENCE.';
            } else {
              detected = 'Top-level: ' + (top ? top.typeName : '?') + ', ' + (top && top.children ? top.children.length + ' children' : 'primitive');
            }
          } catch (e) { detected = 'Could not parse as DER (' + e.message + ').'; }

          html += '<div class="parsed-row"><span class="label">Block ' + (i + 1) + '</span><div>' +
            '<div class="value">' +
              '<span class="tech-badge tech-badge--info">' + AS.escHTML(label) + '</span> ' +
              '<span class="tech-badge">' + b.der.length + ' bytes</span>' +
            '</div>' +
            '<span class="note">' + AS.escHTML(detected) + '</span></div></div>';
          html += '<div class="parsed-row"><span class="label">DER (hex)</span><div class="value" style="word-break:break-all;max-height:160px;overflow:auto;">' +
            AS.escHTML(AmbiSecureASN1.bytesToHex(b.der.subarray(0, 256), ' ').replace(/((?:[0-9A-F]{2} ){16})/g, '$1\n')) +
            (b.der.length > 256 ? '\n…' : '') + '</div></div>';
          html += '<div class="parsed-row"><span class="label">PEM</span><div class="value"><pre class="mono" style="background:#14161A;color:#E6E6EA;padding:12px;border-radius:6px;overflow-x:auto;font-size:12px;line-height:1.5;">' +
            AS.escHTML(pem) + '</pre></div></div>';
        }
        output.innerHTML = html;
      } catch (e) { AS.renderError(output, e.message || String(e)); }
    }

    input.addEventListener('input', go);
    if (sample) sample.addEventListener('click', function () {
      input.value = 'MIIBszCCAVigAwIBAgIJAPHd5Z7nIwBpMAoGCCqGSM49BAMCMDcxCzAJBgNVBAYTAlVTMRMwEQYDVQQKDApBbWJpU2VjdXJlMRMwEQYDVQQDDApFeGFtcGxlIENBMB4XDTI1MDEwMTAwMDAwMFoXDTI3MDEwMTAwMDAwMFowOzELMAkGA1UEBhMCVVMxEzARBgNVBAoMCkFtYmlTZWN1cmUxFzAVBgNVBAMMDmRldmljZS5leGFtcGxlMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE/Q4wAB1z6nWuzx5y4xH1n0hVcOTtgQjbUg0SfP9pAvQq7y+w9cKDCsPNiZc8mXBE6h1zwZK4uV6n1k7g/HjT7qNCMEAwHQYDVR0OBBYEFEf+1zYXq6f8yfEHX0w0FU3ELqg6MB8GA1UdIwQYMBaAFEf+1zYXq6f8yfEHX0w0FU3ELqg6MAoGCCqGSM49BAMCA0kAMEYCIQCkO9D5Fe9P3lN5wcyZ3oNg8I9o0Kf+GgwYpO5LRwZcTQIhANqJZyT3Q0H7XU1g0O4FcM3jdcuMt2I8pjY9/KnH6q3R';
      go();
    });
    if (clearBtn) clearBtn.addEventListener('click', function () { input.value=''; go(); input.focus(); });
    AS.bindDrop(dropPanel, function (f) { if (f.error) { AS.renderError(output, f.error); return; } input.value = f.text; go(); });
    AS.bindFilePicker(filePicker, function (f) { if (f.error) { AS.renderError(output, f.error); return; } input.value = f.text; go(); });
    go();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
