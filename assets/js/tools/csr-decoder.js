/* AmbiSecure — PKCS#10 CSR decoder. Client-side. */
(function () {
  'use strict';
  function init() {
    var input = AS.$('csr-input'), output = AS.$('csr-output');
    var sample = AS.$('csr-sample'), clearBtn = AS.$('csr-clear');
    var dropPanel = AS.$('csr-drop'), filePicker = AS.$('csr-file');
    if (!input || !output) return;

    function row(label, value, note) {
      return '<div class="parsed-row"><span class="label">' + AS.escHTML(label) + '</span>' +
        '<div><div class="value" style="font-family:\'Source Sans 3\',sans-serif;font-size:14px;color:var(--ink);">' +
        (value || '<em style="color:var(--muted-2);">(none)</em>') + '</div>' +
        (note ? '<span class="note">' + note + '</span>' : '') + '</div></div>';
    }
    function rowMono(label, value, note) {
      return '<div class="parsed-row"><span class="label">' + AS.escHTML(label) + '</span>' +
        '<div><div class="value">' + (value || '<em style="color:var(--muted-2);">(none)</em>') + '</div>' +
        (note ? '<span class="note">' + note + '</span>' : '') + '</div></div>';
    }

    function go() {
      var raw = input.value.trim();
      if (!raw) { AS.renderPlaceholder(output, 'Paste a PEM-armoured CSR, or load a .csr file.'); return; }
      try {
        var blocks = AmbiSecureX509.autoDecode(raw);
        if (!blocks.length) throw new Error('No CSR data found.');
        var html = '';
        for (var i = 0; i < blocks.length; i++) {
          try {
            var csr = AmbiSecureX509.parseCSR(blocks[i].der);
            var spki = csr.subjectPublicKeyInfo;
            var algName = csr.signatureAlgorithm && (csr.signatureAlgorithm.name || csr.signatureAlgorithm.oid) || '';
            var pkAlgName = spki && spki.algorithm && (spki.algorithm.name || spki.algorithm.oid) || '';
            var pkBits = spki && spki.rsa ? spki.rsa.modulusBits : (spki ? spki.sizeBits : null);

            html += '<div style="margin-bottom:14px;"><span class="tech-badge tech-badge--ok">PKCS#10 CSR v' + csr.version + '</span> <span class="tech-badge tech-badge--info">' + AS.escHTML(algName) + '</span></div>';
            html += row('Subject', AS.escHTML(csr.subject || ''));
            html += row('Public key algorithm', AS.escHTML(pkAlgName) + (pkBits ? ' · ' + pkBits + ' bits' : ''));
            if (spki && spki.rsa) html += rowMono('Modulus preview', AS.escHTML(spki.rsa.modulusHexPreview || ''), 'Public exponent: ' + AS.escHTML(spki.rsa.exponent));
            html += row('Signature algorithm', AS.escHTML(algName) + (csr.signatureAlgorithm && csr.signatureAlgorithm.oid ? ' <span style="color:var(--muted-2);">[' + AS.escHTML(csr.signatureAlgorithm.oid) + ']</span>' : ''));
            if (csr.extensions && csr.extensions.length) {
              html += '<div style="margin:18px 0 8px; font-family:\'Montserrat\',sans-serif; font-size:12px; letter-spacing:1px; text-transform:uppercase; color:var(--brand-dark);">Requested extensions (' + csr.extensions.length + ')</div>';
              csr.extensions.forEach(function (e) {
                var label = (e.name || e.oid) + (e.critical ? ' (critical)' : '');
                var val = e.human != null ? AS.escHTML(e.human) : '(opaque)';
                html += row(label, val);
              });
            }
            html += rowMono('Signature value preview', AS.escHTML(csr.signatureValuePreview || ''));
          } catch (e) {
            html += '<div class="parsed-row"><span class="label">Block ' + (i+1) + '</span><div class="value"><span class="tech-badge tech-badge--err">PARSE ERROR</span> ' + AS.escHTML(e.message) + '</div></div>';
          }
        }
        output.innerHTML = html;
      } catch (e) { AS.renderError(output, e.message || String(e)); }
    }

    input.addEventListener('input', go);
    if (sample) sample.addEventListener('click', function () {
      input.value = '-----BEGIN CERTIFICATE REQUEST-----\nMIHmMIGNAgEAMCsxCzAJBgNVBAYTAlVTMRMwEQYDVQQKDApBbWJpU2VjdXJlMQcw\nBQYDVQQDDA4qLmV4YW1wbGUuY29ycDBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IA\nBOM3KvSDcXm9PwSc4JNZ8t6mY/3aGc5GYYL1aQwDz7Pee4TFEuDmFcb5+UzZQYZN\n6h1F8yFvwzQ7dY5lD8zXh/igADAKBggqhkjOPQQDAgNHADBEAiBHfjm/QwGZ8xq+\n3o5CZJcYj4FJTexk3hHwqPzvy6h1WAIgcU6jGZmGIZ8VtybKSQqzZJTJjZQO3eYB\nZxOX9NTiW9c=\n-----END CERTIFICATE REQUEST-----';
      go();
    });
    if (clearBtn) clearBtn.addEventListener('click', function () { input.value=''; go(); input.focus(); });
    AS.bindDrop(dropPanel, function (f) { if (f.error) { AS.renderError(output, f.error); return; } input.value = f.text; go(); });
    AS.bindFilePicker(filePicker, function (f) { if (f.error) { AS.renderError(output, f.error); return; } input.value = f.text; go(); });
    go();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
