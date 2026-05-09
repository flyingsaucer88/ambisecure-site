/* AmbiSecure — PFX / PKCS#12 structural inspector.
   Reads the outer ASN.1 structure of a .pfx / .p12 file:
   identifies bag types, encryption schemes, certificate bags (unencrypted), etc.
   Does NOT decrypt password-protected blobs in this implementation —
   that is documented as a limitation and a future enhancement.
   File never leaves the browser. */
(function () {
  'use strict';
  function init() {
    var input = AS.$('pfx-input'), output = AS.$('pfx-output');
    var sample = AS.$('pfx-sample'), clearBtn = AS.$('pfx-clear');
    var dropPanel = AS.$('pfx-drop'), filePicker = AS.$('pfx-file');
    if (!input || !output) return;

    function row(label, value, note) {
      return '<div class="parsed-row"><span class="label">' + AS.escHTML(label) + '</span>' +
        '<div><div class="value">' + value + '</div>' + (note ? '<span class="note">' + note + '</span>' : '') + '</div></div>';
    }

    function inspect(der) {
      var top = AmbiSecureASN1.parse(der)[0];
      if (!top || !top.children) throw new Error('Not a SEQUENCE.');
      /* PFX ::= SEQUENCE { version INTEGER, authSafe ContentInfo, macData MacData OPTIONAL } */
      var version = AmbiSecureASN1.decodeValue(top.children[0]);
      var authSafe = top.children[1];
      var macData = top.children[2] || null;

      var contentTypeOid = authSafe && authSafe.children && authSafe.children[0] ? AmbiSecureASN1.decodeValue(authSafe.children[0]) : null;
      var html = '';
      html += '<div style="margin-bottom:14px;"><span class="tech-badge tech-badge--ok">PFX / PKCS#12</span> <span class="tech-badge">v' + version + '</span> <span class="tech-badge">' + der.length + ' bytes</span>';
      if (macData) html += ' <span class="tech-badge tech-badge--info">HMAC integrity</span>';
      html += '</div>';
      html += row('Outer ContentInfo', AS.escHTML(AmbiSecureASN1.oidName(contentTypeOid) || contentTypeOid));

      /* Walk the AuthenticatedSafe — typically pkcs7-data containing a SEQUENCE OF ContentInfo */
      var safeBags = [];
      try {
        var ci = authSafe.children[1].children[0]; // [0] EXPLICIT → OCTET STRING
        var inner = AmbiSecureASN1.parse(ci.value)[0];
        if (inner && inner.children) {
          inner.children.forEach(function (contentInfo) {
            if (!contentInfo.children) return;
            var typeOid = AmbiSecureASN1.decodeValue(contentInfo.children[0]);
            var content = contentInfo.children[1];
            if (typeOid === '1.2.840.113549.1.7.1') {
              /* data — usually contains a SafeContents */
              try {
                var inner2 = AmbiSecureASN1.parse(content.children[0].value)[0];
                if (inner2 && inner2.children) inner2.children.forEach(function (b) { safeBags.push(decodeBag(b, false)); });
              } catch (e) { safeBags.push({ error: 'Could not parse data bag: ' + e.message }); }
            } else if (typeOid === '1.2.840.113549.1.7.6') {
              /* encryptedData — password-encrypted SafeContents */
              safeBags.push({ encrypted: true, oid: typeOid, name: AmbiSecureASN1.oidName(typeOid) || typeOid });
              try {
                var ed = content.children[0]; // [0] EXPLICIT → EncryptedData SEQUENCE
                var encrypted = ed.children[1]; // EncryptedContentInfo
                if (encrypted && encrypted.children && encrypted.children[1]) {
                  var algId = encrypted.children[1];
                  var alg = AmbiSecureX509.decodeAlgId(algId);
                  safeBags[safeBags.length - 1].encryption = alg;
                }
              } catch (e) {}
            } else {
              safeBags.push({ unknown: true, oid: typeOid, name: AmbiSecureASN1.oidName(typeOid) || typeOid });
            }
          });
        }
      } catch (e) { html += row('AuthenticatedSafe', '<span class="tech-badge tech-badge--warn">walk skipped</span>', 'Could not walk inner ContentInfo sequence: ' + AS.escHTML(e.message)); }

      html += '<div style="margin:18px 0 10px; font-family:\'Montserrat\',sans-serif; font-size:12px; letter-spacing:1px; text-transform:uppercase; color:var(--brand-dark);">SafeContents (' + safeBags.length + ')</div>';
      safeBags.forEach(function (sb, i) {
        if (sb.error) { html += row('SafeBag ' + (i+1), '<span class="tech-badge tech-badge--err">ERROR</span> ' + AS.escHTML(sb.error)); return; }
        if (sb.encrypted) {
          html += row('SafeContents ' + (i + 1) + ' (encrypted)',
            '<span class="tech-badge tech-badge--warn">ENCRYPTED</span> ' + AS.escHTML(sb.name),
            'Decryption with password is not implemented in this client-side tool. ' +
            (sb.encryption ? 'PBE algorithm: ' + AS.escHTML(sb.encryption.name || sb.encryption.oid) + '.' : ''));
          return;
        }
        if (sb.unknown) {
          html += row('SafeContents ' + (i + 1), '<span class="tech-badge tech-badge--info">UNKNOWN</span> ' + AS.escHTML(sb.name));
          return;
        }
        html += row('SafeBag ' + (i + 1) + ' — ' + AS.escHTML(sb.bagType || ''),
          (sb.summary ? AS.escHTML(sb.summary) : ''),
          sb.attributes ? AS.escHTML(sb.attributes) : '');
      });

      if (macData) {
        try {
          var mac = macData.children[0]; // DigestInfo
          var algNode = mac.children[0];
          var alg = AmbiSecureX509.decodeAlgId(algNode);
          html += row('MAC algorithm', AS.escHTML(alg.name || alg.oid));
        } catch (e) {}
      }
      return html;
    }

    function decodeBag(bagNode) {
      try {
        var bagId = AmbiSecureASN1.decodeValue(bagNode.children[0]);
        var name = AmbiSecureASN1.oidName(bagId) || bagId;
        var bag = { bagType: name, oid: bagId };
        if (bagId === '1.2.840.113549.1.12.10.1.3') {
          /* certBag */
          try {
            var certBag = bagNode.children[1].children[0];
            var certType = AmbiSecureASN1.decodeValue(certBag.children[0]);
            var derCert = certBag.children[1].children[0].value;
            var c = AmbiSecureX509.parseCertificate(derCert);
            bag.summary = 'Certificate · ' + c.subject;
            bag.cert = c;
          } catch (e) { bag.summary = 'Certificate (parse skipped)'; }
        } else if (bagId === '1.2.840.113549.1.12.10.1.2') {
          bag.summary = 'PKCS#8 shrouded private key (encrypted)';
        } else if (bagId === '1.2.840.113549.1.12.10.1.1') {
          bag.summary = 'Unshrouded private key';
        }
        /* Friendly attributes */
        if (bagNode.children[2] && bagNode.children[2].children) {
          var fn = '';
          bagNode.children[2].children.forEach(function (attr) {
            if (!attr.children || attr.children.length < 2) return;
            var oid = AmbiSecureASN1.decodeValue(attr.children[0]);
            var v = attr.children[1].children && attr.children[1].children[0];
            if (oid === '1.2.840.113549.1.9.20' && v) fn = 'friendlyName: ' + AmbiSecureASN1.decodeValue(v);
            else if (oid === '1.2.840.113549.1.9.21' && v) fn = 'localKeyID: 0x' + AmbiSecureASN1.bytesToHex(v.value);
          });
          if (fn) bag.attributes = fn;
        }
        return bag;
      } catch (e) { return { error: e.message }; }
    }

    function go() {
      var raw = input.value.trim();
      if (!raw) { AS.renderPlaceholder(output, 'Drop a .pfx / .p12 file, or paste base64/hex.'); return; }
      try {
        var bytes;
        if (/^[0-9a-f\s,;:_-]+$/i.test(raw)) bytes = AmbiSecureASN1.hexToBytes(raw);
        else bytes = AmbiSecureX509.base64Decode(raw.replace(/[\s]/g,''));
        output.innerHTML = inspect(bytes);
      } catch (e) { AS.renderError(output, e.message || String(e)); }
    }

    input.addEventListener('input', go);
    if (clearBtn) clearBtn.addEventListener('click', function () { input.value=''; go(); input.focus(); });
    AS.bindDrop(dropPanel, function (f) {
      if (f.error) { AS.renderError(output, f.error); return; }
      /* The text-mode read won't help for binary PFX. Suggest the file picker. */
      AS.renderPlaceholder(output, 'Use the “Choose file” button for binary .pfx / .p12 files.');
    });
    /* Use binary file picker for .pfx files */
    AS.bindFilePickerBinary(filePicker, function (f) {
      if (f.error) { AS.renderError(output, f.error); return; }
      try { output.innerHTML = inspect(f.bytes); }
      catch (e) { AS.renderError(output, e.message || String(e)); }
    });
    go();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
