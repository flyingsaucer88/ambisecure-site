/* AmbiSecure — base64url converter (WebAuthn / JOSE / CTAP2 friendly).
   Bidirectional: base64url <-> hex/text/standard-base64. */
(function () {
  'use strict';

  function bytesToHex(b) { return AmbiSecureB64URL.bytesToHex(b); }
  function bytesToText(b) {
    if (typeof TextDecoder !== 'undefined') {
      try { return new TextDecoder('utf-8', { fatal: false }).decode(b); } catch (e) { return ''; }
    }
    return String.fromCharCode.apply(null, b);
  }
  function bytesToStdB64(b) {
    var s = ''; for (var i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
    return btoa(s);
  }

  function init() {
    var input = AS.$('b64u-input'), output = AS.$('b64u-output');
    var sample = AS.$('b64u-sample'), clearBtn = AS.$('b64u-clear');
    var modeSel = AS.$('b64u-mode');
    if (!input || !output) return;

    function row(label, value) {
      return '<div class="parsed-row"><span class="label">' + label + '</span>' +
        '<div class="value">' + AS.escHTML(value) + '</div></div>';
    }

    function go() {
      var raw = (input.value || '').trim();
      if (!raw) { AS.renderPlaceholder(output, 'Paste base64url, base64, hex, or text and pick a direction.'); return; }
      var mode = modeSel ? modeSel.value : 'auto';
      try {
        var bytes;
        if (mode === 'fromB64URL' || (mode === 'auto' && /^[A-Za-z0-9_\-]+={0,2}$/.test(raw.replace(/\s+/g,'')))) {
          bytes = AmbiSecureB64URL.decode(raw);
        } else if (mode === 'fromB64') {
          var s = raw.replace(/\s+/g, '');
          while (s.length % 4) s += '=';
          var raw2 = atob(s);
          bytes = new Uint8Array(raw2.length);
          for (var i = 0; i < raw2.length; i++) bytes[i] = raw2.charCodeAt(i);
        } else if (mode === 'fromHex') {
          bytes = AmbiSecureB64URL.hexToBytes(raw);
        } else if (mode === 'fromText') {
          var s = raw;
          if (typeof TextEncoder !== 'undefined') bytes = new TextEncoder().encode(s);
          else { bytes = new Uint8Array(s.length); for (var j = 0; j < s.length; j++) bytes[j] = s.charCodeAt(j); }
        } else {
          bytes = AmbiSecureB64URL.decode(raw);
        }
        var html = '<div style="margin-bottom:10px;"><span class="tech-badge tech-badge--ok">' + bytes.length + ' bytes</span></div>';
        html += row('base64url', AmbiSecureB64URL.encode(bytes));
        html += row('base64 (standard)', bytesToStdB64(bytes));
        html += row('hex', bytesToHex(bytes));
        var txt = bytesToText(bytes);
        var printable = /^[\x20-\x7E\r\n\t]*$/.test(txt);
        html += row('text (utf-8)', printable ? txt : '(non-printable bytes)');
        output.innerHTML = html;
      } catch (e) { AS.renderError(output, e.message); }
    }
    input.addEventListener('input', go);
    if (modeSel) modeSel.addEventListener('change', go);
    if (sample) sample.addEventListener('click', function () {
      input.value = 'eyJ0eXBlIjoid2ViYXV0aG4uZ2V0IiwiY2hhbGxlbmdlIjoiYWFiYmNjZGRlZWZmIiwib3JpZ2luIjoiaHR0cHM6Ly9leGFtcGxlLmNvbSJ9';
      if (modeSel) modeSel.value = 'fromB64URL';
      go();
    });
    if (clearBtn) clearBtn.addEventListener('click', function () { input.value=''; go(); input.focus(); });
    go();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
