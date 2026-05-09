/* AmbiSecure — Base64 encoder/decoder */
(function () {
  'use strict';
  function init() {
    var input = AS.$('b64-input'), output = AS.$('b64-output');
    var dir = AS.$('b64-direction'), variant = AS.$('b64-variant');
    var sample = AS.$('b64-sample'), clearBtn = AS.$('b64-clear'), copyBtn = AS.$('b64-copy');
    if (!input || !output) return;

    function encodeText(s, urlsafe) {
      var u8 = new TextEncoder().encode(s);
      var bin = ''; for (var i = 0; i < u8.length; i++) bin += String.fromCharCode(u8[i]);
      var b64 = btoa(bin);
      return urlsafe ? b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') : b64;
    }
    function decodeText(s, urlsafe) {
      var t = String(s).replace(/\s+/g, '');
      if (urlsafe) { t = t.replace(/-/g, '+').replace(/_/g, '/'); while (t.length % 4) t += '='; }
      var bin = atob(t);
      var u8 = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
      try { return new TextDecoder('utf-8', { fatal: false }).decode(u8); }
      catch (e) { return Array.prototype.map.call(u8, function(x){ return x.toString(16).padStart(2,'0'); }).join(' '); }
    }
    function lastResult(){ return output.dataset.value || ''; }

    function go() {
      var raw = input.value;
      output.dataset.value = '';
      if (!raw) { AS.renderPlaceholder(output, 'Type or paste text / base64.'); return; }
      try {
        var urlsafe = variant.value === 'urlsafe';
        var result, label;
        if (dir.value === 'encode') { result = encodeText(raw, urlsafe); label = urlsafe ? 'BASE64URL' : 'BASE64'; }
        else { result = decodeText(raw, urlsafe); label = 'TEXT (UTF-8 if possible)'; }
        output.dataset.value = result;
        output.innerHTML = '<div style="margin-bottom:10px;"><span class="tech-badge tech-badge--ok">' + AS.escHTML(label) + '</span> <span class="tech-badge">' + result.length + ' chars</span></div>' +
          '<pre style="white-space:pre-wrap;word-break:break-all;font-family:\'JetBrains Mono\',monospace;font-size:13.5px;line-height:1.65;">' + AS.escHTML(result) + '</pre>';
      } catch (e) { AS.renderError(output, e.message); }
    }

    input.addEventListener('input', go);
    dir.addEventListener('change', go);
    variant.addEventListener('change', go);
    if (sample) sample.addEventListener('click', function(){
      if (dir.value === 'encode') input.value = 'Authentication without compromise';
      else input.value = 'QXV0aGVudGljYXRpb24gd2l0aG91dCBjb21wcm9taXNl';
      go();
    });
    if (clearBtn) clearBtn.addEventListener('click', function () { input.value=''; go(); input.focus(); });
    AS.bindCopy(copyBtn, lastResult);
    go();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
