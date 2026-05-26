// Page glue for /resources/tools/v2x-cert-chain-validator/
// Reuses the IEEE 1609.2 decoder. Performs STRUCTURAL validation only.
// Cryptographic signature verification is NOT performed.
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    var inputEnd = document.getElementById('chain-input-end');
    var inputMids = document.getElementById('chain-input-mids');
    var inputRoot = document.getElementById('chain-input-root');
    var validateBtn = document.getElementById('chain-validate');
    var clearBtn = document.getElementById('chain-clear');
    var loadBtn = document.getElementById('chain-load-example');
    var output = document.getElementById('chain-output');

    if (!output || !window.IEEE1609) return;

    function parseOne(text, label) {
      var t = String(text || '').trim();
      if (!t) return null;
      var bytes;
      try { bytes = window.IEEE1609.inputToBytes(t); }
      catch (e) {
        return { label: label, error: 'Input parse rejected: ' + e.message };
      }
      var top = window.IEEE1609.decodeCertificate(bytes);
      return { label: label, bytes: bytes, decoded: top };
    }

    function el(tag, cls, text) {
      var e = document.createElement(tag);
      if (cls) e.className = cls;
      if (text != null) e.textContent = text;
      return e;
    }

    function findIssuerSummary(decoded) {
      var iss = decoded.tree.filter(function (n) { return n.name === 'issuer'; })[0];
      if (!iss) return { type: 'unknown', value: null };
      if (iss.value && iss.value.indexOf('self') === 0) {
        var ha = iss.children && iss.children.filter(function (c) { return c.name === 'hashAlgorithm'; })[0];
        return { type: 'self', hashAlgorithm: ha ? ha.value : null };
      }
      if (iss.value && iss.value === 'sha256AndDigest') {
        var h = iss.children && iss.children.filter(function (c) { return c.name === 'HashedId8'; })[0];
        return { type: 'sha256AndDigest', hashedId8: h ? h.value : null };
      }
      if (iss.value && iss.value === 'sha384AndDigest') {
        var h2 = iss.children && iss.children.filter(function (c) { return c.name === 'HashedId8'; })[0];
        return { type: 'sha384AndDigest', hashedId8: h2 ? h2.value : null };
      }
      return { type: 'unknown', value: iss.value };
    }

    function findValiditySummary(decoded) {
      var tbs = decoded.tree.filter(function (n) { return n.name === 'toBeSigned'; })[0];
      if (!tbs || !tbs.children) return null;
      var vp = tbs.children.filter(function (c) { return c.name === 'validityPeriod'; })[0];
      if (!vp) return null;
      var start = vp.children && vp.children.filter(function (c) { return c.name === 'start'; })[0];
      var dur = vp.children && vp.children.filter(function (c) { return c.name === 'duration'; })[0];
      return {
        startLabel: start ? start.value : 'unknown',
        durationLabel: dur ? dur.value : 'unknown'
      };
    }

    function findSignatureScheme(decoded) {
      var sig = decoded.tree.filter(function (n) { return n.name === 'signature'; })[0];
      if (!sig) return 'unknown';
      return sig.value || 'unknown';
    }

    function renderRow(parent, ok, label, detail) {
      var row = el('div', 'chain-row');
      var status = el('span', 'chain-status ' + (ok === true ? 'ok' : ok === false ? 'fail' : 'warn'),
        ok === true ? '✓' : ok === false ? '✗' : '⚠');
      row.appendChild(status);
      row.appendChild(el('span', 'chain-label', label));
      if (detail) row.appendChild(el('span', 'chain-detail', detail));
      parent.appendChild(row);
    }

    function renderCertCard(parent, cert, idx, total) {
      var card = el('section', 'chain-cert');
      var head = el('header', 'chain-cert-head');
      head.appendChild(el('span', 'chain-cert-pos', '#' + (idx + 1) + ' / ' + total));
      head.appendChild(el('h3', 'chain-cert-label', cert.label));
      card.appendChild(head);

      if (cert.error) {
        renderRow(card, false, 'Parse', cert.error);
        parent.appendChild(card);
        return;
      }
      var d = cert.decoded;
      renderRow(card, d.ok, 'Parse',
        d.bytesRead + ' of ' + d.bytesTotal + ' bytes' +
        (d.error ? ' (' + d.error + ')' : ''));

      var iss = findIssuerSummary(d);
      if (iss.type === 'self') {
        renderRow(card, idx === 0, 'Issuer type',
          'self-signed (' + (iss.hashAlgorithm || 'unknown hash') + ')' +
          (idx === 0 ? '' : ' — expected only at the chain root'));
      } else if (iss.type === 'sha256AndDigest' || iss.type === 'sha384AndDigest') {
        renderRow(card, true, 'Issuer type',
          iss.type + ' = ' + iss.hashedId8);
        cert.issuerHashedId8 = iss.hashedId8;
      } else {
        renderRow(card, null, 'Issuer type', 'unknown: ' + JSON.stringify(iss));
      }

      var vp = findValiditySummary(d);
      if (vp) {
        renderRow(card, true, 'Validity',
          'start ' + vp.startLabel + ' · ' + vp.durationLabel);
      }
      var scheme = findSignatureScheme(d);
      var schemeOk = /ecdsa(Nist|Brainpool)/.test(scheme);
      renderRow(card, schemeOk, 'Signature scheme', scheme);

      parent.appendChild(card);
    }

    function renderLinkageCheck(parent, lower, upper, hashed) {
      var ok = lower.issuerHashedId8 && hashed && lower.issuerHashedId8 === hashed;
      renderRow(parent,
        ok ? true : (lower.issuerHashedId8 ? false : null),
        'Linkage: ' + lower.label + ' → ' + upper.label,
        lower.issuerHashedId8
          ? 'cert says issuer HashedId8 = ' + lower.issuerHashedId8 +
            (hashed ? '; computed from ' + upper.label + ' = ' + hashed : '')
          : 'cert does not reference its issuer by HashedId8 (self-signed?)');
    }

    function validate() {
      output.innerHTML = '';
      var certs = [
        parseOne(inputEnd.value, 'End-entity (PC or EC)'),
        parseOne(inputMids ? inputMids.value : '', 'Intermediate (AA / EA / SubCA)'),
        parseOne(inputRoot ? inputRoot.value : '', 'Root CA')
      ].filter(Boolean);

      if (certs.length === 0) {
        output.appendChild(el('div', 'chain-empty',
          'Provide at least one IEEE 1609.2 certificate above.'));
        return;
      }

      var notice = el('div', 'tool-privacy');
      notice.textContent = 'Structural validation only. Cryptographic signature verification is not performed by this tool.';
      output.appendChild(notice);

      certs.forEach(function (c, i) {
        renderCertCard(output, c, i, certs.length);
      });

      // Linkage checks: for each pair (lower, upper), compute HashedId8(upper)
      // and compare against lower.issuer.HashedId8.
      var linkage = el('section', 'chain-linkage');
      linkage.appendChild(el('h3', null, 'Chain linkage'));
      output.appendChild(linkage);

      if (certs.length < 2) {
        renderRow(linkage, null, 'Chain depth',
          'Only one certificate supplied — no linkage to check.');
        return;
      }

      var pending = certs.length - 1;
      for (var i = 0; i < certs.length - 1; i++) {
        (function (lower, upper) {
          if (!upper.bytes || upper.error || !lower.bytes || lower.error) {
            renderLinkageCheck(linkage, lower, upper, null);
            if (--pending === 0) finish();
            return;
          }
          window.IEEE1609.hashedId8(upper.bytes).then(function (h) {
            renderLinkageCheck(linkage, lower, upper, h);
          }).catch(function (e) {
            renderRow(linkage, null,
              'Linkage: ' + lower.label + ' → ' + upper.label,
              'WebCrypto unavailable: ' + (e && e.message ? e.message : e));
          }).then(function () {
            if (--pending === 0) finish();
          });
        })(certs[i], certs[i + 1]);
      }

      function finish() {
        renderRow(linkage, null, 'Reminder',
          'Structural linkage only. A matching HashedId8 does NOT prove that the issuer signed the certificate.');
      }
    }

    function loadExample() {
      if (!window.IEEE1609Examples) return;
      var ex = window.IEEE1609Examples;
      if (ex['pseudonymous-certificate']) inputEnd.value = ex['pseudonymous-certificate'].hex;
      if (inputMids && ex['enrolment-credential']) inputMids.value = ex['enrolment-credential'].hex;
      if (inputRoot && ex['self-signed-root']) inputRoot.value = ex['self-signed-root'].hex;
      validate();
    }

    if (validateBtn) validateBtn.addEventListener('click', validate);
    if (clearBtn) clearBtn.addEventListener('click', function () {
      inputEnd.value = '';
      if (inputMids) inputMids.value = '';
      if (inputRoot) inputRoot.value = '';
      output.innerHTML = '';
    });
    if (loadBtn) loadBtn.addEventListener('click', loadExample);

    if (!inputEnd.value) loadExample();
  });
})();
