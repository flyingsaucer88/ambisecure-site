/* AmbiSecure tools — small shared UI helpers used by multiple tools.
   Loaded before any tool script. */
(function (root) {
  'use strict';
  function $(id) { return document.getElementById(id); }
  function escHTML(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function bindCopy(btn, getText) {
    if (!btn) return;
    btn.addEventListener('click', function () {
      var txt = typeof getText === 'function' ? getText() : '';
      if (!txt) return;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(txt).then(function () {
          var prev = btn.textContent; btn.textContent = 'Copied'; setTimeout(function(){ btn.textContent = prev; }, 1200);
        });
      }
    });
  }
  function bindDrop(panel, onFile) {
    if (!panel || !window.FileReader) return;
    panel.addEventListener('dragover', function (e) { e.preventDefault(); panel.classList.add('drop-on'); });
    panel.addEventListener('dragleave', function () { panel.classList.remove('drop-on'); });
    panel.addEventListener('drop', function (e) {
      e.preventDefault(); panel.classList.remove('drop-on');
      var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (!f) return;
      var r = new FileReader();
      r.onload = function () { onFile({ name: f.name, text: r.result, bytes: null }); };
      r.onerror = function () { onFile({ error: 'Could not read file.' }); };
      r.readAsText(f);
    });
  }
  function bindFilePicker(input, onFile) {
    if (!input) return;
    input.addEventListener('change', function () {
      var f = input.files && input.files[0]; if (!f) return;
      var r = new FileReader();
      r.onload = function () { onFile({ name: f.name, text: r.result, bytes: null }); };
      r.onerror = function () { onFile({ error: 'Could not read file.' }); };
      r.readAsText(f);
    });
  }
  function bindFilePickerBinary(input, onFile) {
    if (!input) return;
    input.addEventListener('change', function () {
      var f = input.files && input.files[0]; if (!f) return;
      var r = new FileReader();
      r.onload = function () {
        var b = new Uint8Array(r.result);
        onFile({ name: f.name, text: null, bytes: b });
      };
      r.onerror = function () { onFile({ error: 'Could not read file.' }); };
      r.readAsArrayBuffer(f);
    });
  }
  function downloadBlob(filename, mime, bytes) {
    var blob = new Blob([bytes], { type: mime || 'application/octet-stream' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    setTimeout(function(){ URL.revokeObjectURL(url); a.remove(); }, 0);
  }
  function renderError(container, msg) {
    if (!container) return;
    container.innerHTML = '<div style="margin-bottom:10px;"><span class="tech-badge tech-badge--err">PARSE ERROR</span></div>' +
      '<div class="parsed-row"><span class="label">Error</span><div class="value">' + escHTML(msg) + '</div></div>';
  }
  function renderPlaceholder(container, msg) {
    if (!container) return;
    container.innerHTML = '<div class="placeholder">' + escHTML(msg) + '</div>';
  }
  root.AS = {
    $: $, escHTML: escHTML,
    bindCopy: bindCopy, bindDrop: bindDrop,
    bindFilePicker: bindFilePicker, bindFilePickerBinary: bindFilePickerBinary,
    downloadBlob: downloadBlob,
    renderError: renderError, renderPlaceholder: renderPlaceholder
  };
})(typeof window !== 'undefined' ? window : globalThis);
