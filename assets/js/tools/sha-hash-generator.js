(function () {
  'use strict';

  var ALGOS = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];

  function hexToBytes(s) {
    var clean = String(s).replace(/0x/gi, '').replace(/[\s,:;]+/g, '');
    if (clean.length % 2 !== 0) throw new Error('Hex input must have an even number of digits.');
    if (!/^[0-9a-fA-F]*$/.test(clean)) throw new Error('Hex input contains non-hex characters.');
    var u8 = new Uint8Array(clean.length / 2);
    for (var i = 0; i < u8.length; i++) u8[i] = parseInt(clean.substr(i * 2, 2), 16);
    return u8;
  }

  function bytesToHex(u8) {
    var s = '';
    for (var i = 0; i < u8.length; i++) s += u8[i].toString(16).padStart(2, '0');
    return s;
  }

  function bytesToB64(u8) {
    var bin = '';
    for (var i = 0; i < u8.length; i++) bin += String.fromCharCode(u8[i]);
    return btoa(bin);
  }

  function fmtSize(n) {
    if (n < 1024) return n + ' bytes';
    if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
    return (n / (1024 * 1024)).toFixed(2) + ' MB';
  }

  function init() {
    var input = AS.$('sha-input'), output = AS.$('sha-output');
    var inmode = AS.$('sha-inmode'), which = AS.$('sha-which');
    var sample = AS.$('sha-sample'), clearBtn = AS.$('sha-clear'), copyBtn = AS.$('sha-copy');
    var filePicker = AS.$('sha-file'), fileInfo = AS.$('sha-fileinfo');
    if (!input || !output) return;

    if (!(window.crypto && window.crypto.subtle && typeof window.crypto.subtle.digest === 'function')) {
      AS.renderError(output, 'This browser does not expose the Web Crypto digest API (crypto.subtle.digest), so SHA hashing cannot run here.');
      return;
    }

    var fileBytes = null;   // when set, hash these bytes instead of the textarea
    var fileLabel = '';

    function lastResult() { return output.dataset.value || ''; }

    function selectedAlgos() {
      return which.value === 'all' ? ALGOS.slice() : [which.value];
    }

    function rowHTML(algo, hexStr, b64Str) {
      var bits = hexStr.length * 4;
      return '<div style="margin:14px 0 4px;"><span class="tech-badge tech-badge--ok">' +
        AS.escHTML(algo) + '</span> <span class="tech-badge tech-badge--info">' + bits + '-bit</span>' +
        (algo === 'SHA-1' ? ' <span class="tech-badge tech-badge--warn">legacy &mdash; collisions known</span>' : '') +
        '</div>' +
        '<div class="parsed-row"><span class="label">Hex</span><div class="value" style="font-family:\'JetBrains Mono\',monospace;word-break:break-all;">' + AS.escHTML(hexStr) + '</div></div>' +
        '<div class="parsed-row"><span class="label">Base64</span><div class="value" style="font-family:\'JetBrains Mono\',monospace;word-break:break-all;">' + AS.escHTML(b64Str) + '</div></div>';
    }

    function go() {
      output.dataset.value = '';
      var bytes;
      try {
        if (fileBytes) {
          bytes = fileBytes;
        } else {
          var raw = input.value;
          if (!raw.trim() && inmode.value === 'text') {
            // still allow empty-string hashing, but prompt first
          }
          bytes = inmode.value === 'hex' ? hexToBytes(raw) : new TextEncoder().encode(raw);
        }
      } catch (e) {
        AS.renderError(output, e.message);
        return;
      }

      if (!fileBytes && !input.value && inmode.value === 'text') {
        AS.renderPlaceholder(output, 'Type something, paste hex, or choose a file to hash.');
        return;
      }

      var algos = selectedAlgos();
      var pending = algos.length;
      var results = {};
      var failed = false;

      // Use a stable copy of the bytes for the async closures.
      var src = bytes;

      algos.forEach(function (algo) {
        window.crypto.subtle.digest(algo, src).then(function (buf) {
          results[algo] = new Uint8Array(buf);
          pending -= 1;
          if (pending === 0 && !failed) render(algos, results, src.length);
        }).catch(function (err) {
          if (failed) return;
          failed = true;
          AS.renderError(output, 'Web Crypto could not compute ' + algo + ': ' + (err && err.message ? err.message : String(err)));
        });
      });
    }

    function render(algos, results, byteLen) {
      var head = '<div style="margin-bottom:6px;">' +
        '<span class="tech-badge">' + byteLen + ' bytes hashed</span>' +
        (fileBytes ? ' <span class="tech-badge tech-badge--info">file</span>' : '') +
        '</div>';
      var body = '';
      var copyParts = [];
      algos.forEach(function (algo) {
        var u8 = results[algo];
        var hexStr = bytesToHex(u8);
        var b64Str = bytesToB64(u8);
        body += rowHTML(algo, hexStr, b64Str);
        copyParts.push(algo + '  ' + hexStr);
      });
      output.dataset.value = copyParts.join('\n');
      output.innerHTML = head + body;
    }

    function clearFile() {
      fileBytes = null; fileLabel = '';
      if (fileInfo) fileInfo.textContent = '';
      if (filePicker) filePicker.value = '';
    }

    input.addEventListener('input', function () { if (fileBytes) clearFile(); go(); });
    inmode.addEventListener('change', function () { if (fileBytes) clearFile(); go(); });
    which.addEventListener('change', go);

    if (sample) sample.addEventListener('click', function () {
      clearFile();
      inmode.value = 'text';
      input.value = 'Authentication without compromise';
      go();
    });

    if (clearBtn) clearBtn.addEventListener('click', function () {
      clearFile(); input.value = '';
      AS.renderPlaceholder(output, 'Type something, or choose a file, to hash.');
      output.dataset.value = '';
      input.focus();
    });

    AS.bindFilePickerBinary(filePicker, function (f) {
      if (f.error) { AS.renderError(output, f.error); return; }
      fileBytes = f.bytes;
      fileLabel = f.name;
      if (fileInfo) fileInfo.textContent = 'Hashing file: ' + f.name + ' (' + fmtSize(f.bytes.length) + '). Editing the text box clears the file.';
      go();
    });

    AS.bindCopy(copyBtn, lastResult);
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  }
})();
