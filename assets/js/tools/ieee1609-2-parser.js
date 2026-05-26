// Page glue for /resources/tools/ieee-1609-2-parser/
// Connects the textarea + buttons to the COER decoder + tree renderer.
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    var input = document.getElementById('cert-input');
    var output = document.getElementById('cert-output');
    var summary = document.getElementById('cert-summary');
    var parseBtn = document.getElementById('cert-parse');
    var clearBtn = document.getElementById('cert-clear');
    var formatSel = document.getElementById('cert-format');
    var exampleSel = document.getElementById('cert-example');

    if (!input || !output || !window.IEEE1609 || !window.IEEE1609Renderer) return;

    function autoDetect(text) {
      try { return window.IEEE1609.detectFormat(text); }
      catch (e) { return 'Unknown'; }
    }

    function runParse() {
      var text = input.value;
      output.innerHTML = '';
      if (summary) summary.innerHTML = '';
      if (!text || !text.trim()) {
        window.IEEE1609Renderer.renderError(output,
          'Paste an IEEE 1609.2 certificate above as hex, base64, or PEM-wrapped base64.');
        return;
      }
      var bytes;
      try { bytes = window.IEEE1609.inputToBytes(text); }
      catch (e) {
        window.IEEE1609Renderer.renderError(output,
          'Input rejected: ' + (e && e.message ? e.message : e));
        return;
      }
      var formatLabel = formatSel && formatSel.value !== 'auto'
        ? formatSel.value
        : autoDetect(text);
      var top = window.IEEE1609.decodeCertificate(bytes);
      if (summary) window.IEEE1609Renderer.renderSummary(summary, top, formatLabel);
      window.IEEE1609Renderer.renderTree(output, top.tree);
    }

    function loadExample(key) {
      var ex = window.IEEE1609Examples && window.IEEE1609Examples[key];
      if (!ex) return;
      input.value = ex.hex;
      if (formatSel) formatSel.value = 'auto';
      runParse();
    }

    if (parseBtn) parseBtn.addEventListener('click', runParse);
    if (clearBtn) clearBtn.addEventListener('click', function () {
      input.value = '';
      output.innerHTML = '';
      if (summary) summary.innerHTML = '';
      input.focus();
    });
    if (exampleSel) exampleSel.addEventListener('change', function () {
      var v = exampleSel.value;
      if (v) loadExample(v);
    });

    // Parse on Cmd/Ctrl + Enter inside the textarea.
    input.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'Enter' || e.keyCode === 13)) {
        e.preventDefault();
        runParse();
      }
    });

    // Auto-load the first example on initial page view so the demo is ready.
    var keys = window.IEEE1609Examples ? Object.keys(window.IEEE1609Examples) : [];
    if (!input.value && keys.length) {
      if (exampleSel) exampleSel.value = keys[0];
      loadExample(keys[0]);
    }
  });
})();
