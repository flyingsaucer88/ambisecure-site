(function () {
  'use strict';

  // Count UTF-8 bytes of a string without leaving the browser.
  function byteLength(s) {
    if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(s).length;
    return unescape(encodeURIComponent(s)).length;
  }

  // Encode a value. spaceAsPlus turns %20 into + (form-style).
  function encode(raw, full, spaceAsPlus) {
    var out = full ? encodeURI(raw) : encodeURIComponent(raw);
    if (spaceAsPlus) out = out.replace(/%20/g, '+');
    return out;
  }

  // Decode a value. May throw URIError on malformed input.
  function decode(raw, full, plusAsSpace) {
    var s = plusAsSpace ? String(raw).replace(/\+/g, ' ') : String(raw);
    return full ? decodeURI(s) : decodeURIComponent(s);
  }

  function modeIsEncode(mode) {
    return mode === 'encodeComponent' || mode === 'encodeUri';
  }
  function modeIsFull(mode) {
    return mode === 'encodeUri' || mode === 'decodeUri';
  }

  function init() {
    var input = AS.$('url-input'), output = AS.$('url-output');
    var mode = AS.$('url-mode'), plus = AS.$('url-plus');
    var sample = AS.$('url-sample'), clearBtn = AS.$('url-clear'), copyBtn = AS.$('url-copy');
    if (!input || !output) return;

    function lastResult() { return output.dataset.value || ''; }

    function go() {
      output.dataset.value = '';
      var raw = input.value;
      if (!raw) { AS.renderPlaceholder(output, 'Type or paste text, a URL, or a percent-encoded string.'); return; }
      var full = modeIsFull(mode.value);
      var usePlus = !!plus.checked;
      try {
        var result, label;
        if (modeIsEncode(mode.value)) {
          result = encode(raw, full, usePlus);
          label = full ? 'encodeURI' : 'encodeURIComponent';
        } else {
          result = decode(raw, full, usePlus);
          label = full ? 'decodeURI' : 'decodeURIComponent';
        }
        output.dataset.value = result;
        output.innerHTML =
          '<div style="margin-bottom:10px;"><span class="tech-badge tech-badge--ok">' +
          AS.escHTML(label) + '</span> <span class="tech-badge">' + result.length + ' chars</span> ' +
          '<span class="tech-badge tech-badge--info">' + byteLength(result) + ' bytes</span></div>' +
          '<pre style="white-space:pre-wrap;word-break:break-all;font-family:\'JetBrains Mono\',monospace;font-size:13.5px;line-height:1.65;">' +
          AS.escHTML(result) + '</pre>';
      } catch (e) {
        AS.renderError(output, 'Malformed input for ' + (full ? 'decodeURI' : 'decodeURIComponent') +
          ': ' + e.message + '. Check for a lone "%" or an invalid percent sequence.');
      }
    }

    input.addEventListener('input', go);
    mode.addEventListener('change', go);
    plus.addEventListener('change', go);
    if (sample) sample.addEventListener('click', function () {
      if (modeIsEncode(mode.value)) {
        input.value = 'https://example.com/search?q=café & crème brûlée?page=2#top';
      } else {
        input.value = 'https://example.com/search?q=caf%C3%A9%20%26%20cr%C3%A8me%20br%C3%BBl%C3%A9e%3Fpage%3D2%23top';
      }
      go();
    });
    if (clearBtn) clearBtn.addEventListener('click', function () { input.value = ''; go(); input.focus(); });
    AS.bindCopy(copyBtn, lastResult);
    go();
  }

  // Expose for self-test (Node) and isolated reuse.
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { encode: encode, decode: decode, byteLength: byteLength, modeIsEncode: modeIsEncode, modeIsFull: modeIsFull };
  }
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  }
})();
