// Tree renderer for the IEEE 1609.2 decoder output.
// Matches the existing tool styling (tools.css .tree-node, .tree-name, etc.).
// Vanilla DOM; no innerHTML for user-controlled paths.
(function (root) {
  'use strict';

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  // Render a decoded tree (array of node objects) into a DOM container.
  function renderTree(container, tree) {
    container.innerHTML = '';
    var ul = el('ul', 'ieee-tree');
    tree.forEach(function (n) { ul.appendChild(renderNode(n)); });
    container.appendChild(ul);
  }

  function renderNode(n) {
    var li = el('li', 'ieee-tree-node');
    var head = el('div', 'ieee-tree-row');
    head.appendChild(el('span', 'ieee-tree-name', n.name));
    if (n.value != null && n.value !== '') {
      var val = el('span', 'ieee-tree-value');
      val.textContent = String(n.value);
      head.appendChild(val);
    }
    if (n.ref) {
      var ref = el('span', 'ieee-tree-ref', n.ref);
      head.appendChild(ref);
    }
    li.appendChild(head);
    if (n.children && n.children.length) {
      var sub = el('ul', 'ieee-tree');
      n.children.forEach(function (c) { sub.appendChild(renderNode(c)); });
      li.appendChild(sub);
    }
    return li;
  }

  function renderSummary(container, top, formatLabel) {
    var box = el('div', 'ieee-summary');
    var row1 = el('div', 'ieee-summary-row');
    row1.appendChild(el('strong', null, 'Input format'));
    row1.appendChild(el('span', null, formatLabel));
    box.appendChild(row1);
    var row2 = el('div', 'ieee-summary-row');
    row2.appendChild(el('strong', null, 'Bytes'));
    row2.appendChild(el('span', null, top.bytesRead + ' / ' + top.bytesTotal));
    box.appendChild(row2);
    var row3 = el('div', 'ieee-summary-row');
    row3.appendChild(el('strong', null, 'Status'));
    var status = el('span', null);
    if (top.ok) { status.textContent = 'Fully decoded'; status.classList.add('ok'); }
    else if (top.error) { status.textContent = 'Partial — see tree'; status.classList.add('warn'); }
    else { status.textContent = 'Trailing bytes after structure'; status.classList.add('warn'); }
    row3.appendChild(status);
    box.appendChild(row3);
    container.appendChild(box);
  }

  function renderError(container, msg) {
    container.innerHTML = '';
    var box = el('div', 'ieee-error');
    box.appendChild(el('strong', null, 'Unable to parse'));
    box.appendChild(el('p', null, msg));
    container.appendChild(box);
  }

  root.IEEE1609Renderer = {
    renderTree: renderTree,
    renderSummary: renderSummary,
    renderError: renderError
  };
})(window);
