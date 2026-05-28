// AmbiSecure Sequence Diagram Generator — page glue
// Wires the textarea, line-number gutter, template picker, render pipeline,
// error pane, export buttons, autosave to localStorage, file import,
// keyboard shortcuts.
(function (root) {
  'use strict';

  var STORAGE_KEY = 'asseq.source.v1';
  var RENDER_DEBOUNCE_MS = 180;

  function $(id) { return document.getElementById(id); }
  function el(tag, attrs, children) {
    var n = document.createElement(tag);
    if (attrs) for (var k in attrs) if (Object.prototype.hasOwnProperty.call(attrs, k)) n.setAttribute(k, attrs[k]);
    if (children) for (var i = 0; i < children.length; i++) if (children[i] != null) n.appendChild(children[i]);
    return n;
  }

  function debounce(fn, ms) {
    var t = null;
    return function () {
      var args = arguments;
      if (t) clearTimeout(t);
      t = setTimeout(function () { fn.apply(null, args); }, ms);
    };
  }

  function buildSVG(source) {
    var lex = ASSeqLexer.tokenize(source);
    var ast = ASSeqParser.parse(lex.tokens, lex.errors);
    var lay = ASSeqLayout.layout(ast);
    var svg = ASSeqRenderer.render(lay);
    return { svg: svg, ast: ast, errors: (ast.errors || []).slice() };
  }

  function renderErrors(errs) {
    var box = $('asseq-errors');
    if (!box) return;
    box.innerHTML = '';
    if (!errs.length) {
      box.classList.remove('has-errors');
      box.classList.add('clean');
      box.textContent = 'No syntax errors.';
      return;
    }
    box.classList.add('has-errors');
    box.classList.remove('clean');
    var ul = el('ul', { class: 'asseq-error-list' });
    for (var i = 0; i < errs.length; i++) {
      var e = errs[i];
      var li = el('li');
      li.textContent = 'Line ' + (e.line > 0 ? e.line : '?') + ': ' + e.msg;
      ul.appendChild(li);
    }
    box.appendChild(ul);
  }

  function updateGutter(textarea, gutter) {
    var lines = String(textarea.value || '').split(/\r?\n/).length;
    var existing = gutter.childNodes.length;
    if (existing < lines) {
      var frag = document.createDocumentFragment();
      for (var i = existing; i < lines; i++) {
        var d = document.createElement('div');
        d.textContent = String(i + 1);
        frag.appendChild(d);
      }
      gutter.appendChild(frag);
    } else if (existing > lines) {
      while (gutter.childNodes.length > lines) gutter.removeChild(gutter.lastChild);
    }
    gutter.scrollTop = textarea.scrollTop;
  }

  function init() {
    var textarea = $('asseq-source');
    var preview = $('asseq-preview');
    var gutter = $('asseq-gutter');
    var pick = $('asseq-template');
    var clearBtn = $('asseq-clear');
    var renderBtn = $('asseq-render');
    var btnSvg = $('asseq-export-svg');
    var btnPng = $('asseq-export-png');
    var btnTxt = $('asseq-export-txt');
    var btnCopy = $('asseq-copy-source');
    var fileInput = $('asseq-import');

    if (!textarea || !preview) return;

    var currentSVG = null;

    function rerender() {
      var out = buildSVG(textarea.value);
      currentSVG = out.svg;
      preview.innerHTML = '';
      preview.appendChild(currentSVG);
      renderErrors(out.errors);
      try { localStorage.setItem(STORAGE_KEY, textarea.value); } catch (e) { /* private mode etc. */ }
    }

    var rerenderDebounced = debounce(rerender, RENDER_DEBOUNCE_MS);

    // Populate the template picker from the templates module.
    if (pick && root.ASSeqTemplates) {
      for (var key in root.ASSeqTemplates) {
        if (!Object.prototype.hasOwnProperty.call(root.ASSeqTemplates, key)) continue;
        var opt = document.createElement('option');
        opt.value = key;
        opt.textContent = root.ASSeqTemplates[key].label;
        pick.appendChild(opt);
      }
      pick.addEventListener('change', function () {
        var k = pick.value;
        if (!k || !root.ASSeqTemplates[k]) return;
        textarea.value = root.ASSeqTemplates[k].source;
        updateGutter(textarea, gutter);
        rerender();
      });
    }

    // Editor events.
    textarea.addEventListener('input', function () {
      updateGutter(textarea, gutter);
      rerenderDebounced();
    });
    textarea.addEventListener('scroll', function () { gutter.scrollTop = textarea.scrollTop; });

    // Cmd/Ctrl+Enter forces a render.
    textarea.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        rerender();
      }
      // Tab indents by two spaces.
      if (e.key === 'Tab') {
        e.preventDefault();
        var start = textarea.selectionStart;
        var end = textarea.selectionEnd;
        textarea.value = textarea.value.substring(0, start) + '  ' + textarea.value.substring(end);
        textarea.selectionStart = textarea.selectionEnd = start + 2;
        updateGutter(textarea, gutter);
        rerenderDebounced();
      }
    });

    if (clearBtn) clearBtn.addEventListener('click', function () {
      textarea.value = '';
      try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
      updateGutter(textarea, gutter);
      rerender();
    });

    if (renderBtn) renderBtn.addEventListener('click', rerender);

    if (btnSvg) btnSvg.addEventListener('click', function () {
      if (!currentSVG) return;
      ASSeqExport.downloadSVG(currentSVG, 'sequence-diagram.svg');
    });
    if (btnPng) btnPng.addEventListener('click', function () {
      if (!currentSVG) return;
      ASSeqExport.downloadPNG(currentSVG, 'sequence-diagram.png', 2);
    });
    if (btnTxt) btnTxt.addEventListener('click', function () {
      ASSeqExport.downloadSource(textarea.value, 'sequence-diagram.txt');
    });
    if (btnCopy) btnCopy.addEventListener('click', function () {
      ASSeqExport.copyText(textarea.value).then(function () {
        var prev = btnCopy.textContent;
        btnCopy.textContent = 'Copied';
        setTimeout(function () { btnCopy.textContent = prev; }, 1200);
      }).catch(function () {});
    });

    if (fileInput) fileInput.addEventListener('change', function () {
      var f = fileInput.files && fileInput.files[0];
      if (!f) return;
      var r = new FileReader();
      r.onload = function () {
        textarea.value = String(r.result || '');
        updateGutter(textarea, gutter);
        rerender();
      };
      r.readAsText(f);
      // Reset so the same file can be picked again.
      fileInput.value = '';
    });

    // Restore saved source, or load the FIDO2 template on first visit.
    var restored = null;
    try { restored = localStorage.getItem(STORAGE_KEY); } catch (e) {}
    if (restored && restored.trim()) {
      textarea.value = restored;
    } else if (root.ASSeqTemplates && root.ASSeqTemplates['fido2-authentication']) {
      textarea.value = root.ASSeqTemplates['fido2-authentication'].source;
      if (pick) pick.value = 'fido2-authentication';
    }
    updateGutter(textarea, gutter);
    rerender();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window);
