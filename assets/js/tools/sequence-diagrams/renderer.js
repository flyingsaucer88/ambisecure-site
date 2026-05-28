// AmbiSecure Sequence Diagram Generator — SVG renderer
// Layout -> standalone, theme-aware SVG element.
// Every text input is escaped; no innerHTML user-data path. Safe to ship.
(function (root) {
  'use strict';

  var SVGNS = 'http://www.w3.org/2000/svg';

  function el(name, attrs, children) {
    var node = document.createElementNS(SVGNS, name);
    if (attrs) {
      for (var k in attrs) {
        if (Object.prototype.hasOwnProperty.call(attrs, k) && attrs[k] != null) {
          node.setAttribute(k, attrs[k]);
        }
      }
    }
    if (children) {
      for (var i = 0; i < children.length; i++) {
        if (children[i] != null) node.appendChild(children[i]);
      }
    }
    return node;
  }

  function textEl(text, attrs) {
    var t = document.createElementNS(SVGNS, 'text');
    if (attrs) {
      for (var k in attrs) {
        if (Object.prototype.hasOwnProperty.call(attrs, k) && attrs[k] != null) {
          t.setAttribute(k, attrs[k]);
        }
      }
    }
    t.textContent = String(text == null ? '' : text);
    return t;
  }

  function drawArrowMarker(defs, id, fillVar, closed) {
    var marker = el('marker', {
      id: id,
      viewBox: '0 0 10 10',
      refX: closed ? 9 : 10,
      refY: 5,
      markerUnits: 'userSpaceOnUse',
      markerWidth: 10,
      markerHeight: 10,
      orient: 'auto'
    });
    if (closed) {
      marker.appendChild(el('path', { d: 'M0,0 L10,5 L0,10 z', fill: fillVar }));
    } else {
      // Open V-shape arrow for async messages.
      marker.appendChild(el('path', { d: 'M0,0 L10,5 L0,10', fill: 'none', stroke: fillVar, 'stroke-width': '1.6', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
    }
    defs.appendChild(marker);
  }

  function isDashedArrow(arrow) { return arrow === '-->' || arrow === '-->>'; }
  function isAsyncArrow(arrow)  { return arrow === '->>' || arrow === '-->>'; }

  function render(layout) {
    var width = Math.max(layout.width, 480);
    var height = Math.max(layout.height, 220);

    var svg = el('svg', {
      xmlns: SVGNS,
      'xmlns:xlink': 'http://www.w3.org/1999/xlink',
      viewBox: '0 0 ' + width + ' ' + height,
      width: width,
      height: height,
      'font-family': '"Source Sans 3", "Source Sans Pro", system-ui, sans-serif',
      class: 'asseq-svg',
      role: 'img',
      'aria-label': layout.title || 'Sequence diagram'
    });

    // Inline style block keeps the SVG self-contained for clipboard / export.
    var style = document.createElementNS(SVGNS, 'style');
    style.textContent = [
      '.asseq-bg { fill: var(--asseq-bg, #ffffff); }',
      '.asseq-axis { stroke: var(--asseq-axis, #c9cdd1); stroke-width: 1.2; stroke-dasharray: 4 4; }',
      '.asseq-pbox { fill: var(--asseq-pbox-bg, #f5f6f8); stroke: var(--asseq-pbox-stroke, #1f2933); stroke-width: 1.4; }',
      '.asseq-pbox-actor { fill: none; stroke: var(--asseq-pbox-stroke, #1f2933); stroke-width: 1.6; stroke-linecap: round; }',
      '.asseq-plabel { fill: var(--asseq-ink, #1f2933); font-weight: 600; font-size: 13px; }',
      '.asseq-title { fill: var(--asseq-ink, #1f2933); font-weight: 700; font-size: 17px; }',
      '.asseq-msg { stroke: var(--asseq-ink, #1f2933); stroke-width: 1.4; fill: none; stroke-linecap: round; }',
      '.asseq-msg.dashed { stroke-dasharray: 6 5; }',
      '.asseq-mlabel { fill: var(--asseq-ink, #1f2933); font-size: 12.5px; }',
      '.asseq-mnum { fill: var(--asseq-ink, #1f2933); font-size: 11px; font-weight: 600; }',
      '.asseq-note-bg { fill: var(--asseq-note-bg, #fff7d6); stroke: var(--asseq-note-stroke, #b08a1a); stroke-width: 1.2; }',
      '.asseq-note-text { fill: var(--asseq-ink, #1f2933); font-size: 12.5px; }',
      '.asseq-block { fill: none; stroke: var(--asseq-block-stroke, #4a5560); stroke-width: 1.3; }',
      '.asseq-block-header { fill: var(--asseq-block-header-bg, #1f2933); }',
      '.asseq-block-header-text { fill: var(--asseq-block-header-fg, #ffffff); font-size: 11.5px; font-weight: 700; letter-spacing: 0.04em; }',
      '.asseq-block-divider { stroke: var(--asseq-block-stroke, #4a5560); stroke-width: 1; stroke-dasharray: 4 4; fill: none; }',
      '@media (prefers-color-scheme: dark) {',
      '  .asseq-svg { --asseq-bg: #0f1419; --asseq-ink: #e6e9ed; --asseq-axis: #3a4148;',
      '    --asseq-pbox-bg: #1a1f25; --asseq-pbox-stroke: #c9cdd1;',
      '    --asseq-note-bg: #3a2f12; --asseq-note-stroke: #d1a23a;',
      '    --asseq-block-stroke: #c9cdd1; --asseq-block-header-bg: #c9cdd1; --asseq-block-header-fg: #0f1419; }',
      '}'
    ].join('\n');
    svg.appendChild(style);

    var defs = el('defs');
    // Light + dark arrow markers use currentColor through the .asseq-msg stroke.
    // We define markers per (style x direction) since SVG markers can't easily
    // inherit dashed/non-dashed; using single-shape markers and setting stroke
    // via CSS keeps the visual consistent.
    drawArrowMarker(defs, 'asseq-arrow-closed', 'currentColor', true);
    drawArrowMarker(defs, 'asseq-arrow-open', 'currentColor', false);
    svg.appendChild(defs);

    // Background — explicit so exported SVG has the right surface in dark mode.
    svg.appendChild(el('rect', { class: 'asseq-bg', x: 0, y: 0, width: width, height: height }));

    // Title
    if (layout.title) {
      svg.appendChild(textEl(layout.title, {
        x: width / 2, y: 28,
        'text-anchor': 'middle',
        class: 'asseq-title'
      }));
    }

    // Block frames go behind everything (drawn first so axis + messages overlay).
    for (var bi = 0; bi < layout.blocks.length; bi++) {
      var bk = layout.blocks[bi];
      var leftP = layout.participants[Math.max(0, Math.min(bk.leftIdx, layout.participants.length - 1))];
      var rightP = layout.participants[Math.max(0, Math.min(bk.rightIdx, layout.participants.length - 1))];
      var leftX = leftP.x - leftP.colWidth / 2 - 6;
      var rightX = rightP.x + rightP.colWidth / 2 + 6;
      var frameW = rightX - leftX;
      var frameH = bk.bottom - bk.top;

      svg.appendChild(el('rect', {
        class: 'asseq-block',
        x: leftX, y: bk.top, width: frameW, height: frameH, rx: 4, ry: 4
      }));

      // Header strip for the first segment + dividers/labels for else-segments.
      for (var si = 0; si < bk.segments.length; si++) {
        var seg = bk.segments[si];
        if (si === 0) {
          // Header pill
          var label = seg.label.toUpperCase();
          var pillWidth = Math.max(60, label.length * 8 + 22);
          svg.appendChild(el('rect', {
            class: 'asseq-block-header',
            x: leftX, y: seg.top, width: pillWidth, height: 20, rx: 0, ry: 0
          }));
          svg.appendChild(textEl(label, {
            x: leftX + 11, y: seg.top + 14,
            class: 'asseq-block-header-text'
          }));
        } else {
          // Dashed divider for else/etc.
          svg.appendChild(el('line', {
            class: 'asseq-block-divider',
            x1: leftX, y1: seg.top, x2: rightX, y2: seg.top
          }));
          svg.appendChild(textEl(seg.label, {
            x: leftX + 10, y: seg.top + 14,
            class: 'asseq-mlabel'
          }));
        }
      }
    }

    // Participant lifelines (vertical dashed axes)
    for (var i = 0; i < layout.participants.length; i++) {
      var p = layout.participants[i];
      svg.appendChild(el('line', {
        class: 'asseq-axis',
        x1: p.x, y1: layout.participantHeaderBottom + 4,
        x2: p.x, y2: layout.height - 8
      }));
    }

    // Participant header boxes (top of diagram)
    for (var j = 0; j < layout.participants.length; j++) {
      var pp = layout.participants[j];
      if (pp.type === 'actor') {
        // Stick figure: head circle + neck line + body box label below
        var headCY = layout.participantHeaderTop - 18;
        svg.appendChild(el('circle', {
          class: 'asseq-pbox-actor', cx: pp.x, cy: headCY, r: 7
        }));
        svg.appendChild(el('line', {
          class: 'asseq-pbox-actor', x1: pp.x, y1: headCY + 7, x2: pp.x, y2: headCY + 22
        }));
        svg.appendChild(el('line', {
          class: 'asseq-pbox-actor', x1: pp.x - 9, y1: headCY + 13, x2: pp.x + 9, y2: headCY + 13
        }));
        svg.appendChild(el('line', {
          class: 'asseq-pbox-actor', x1: pp.x, y1: headCY + 22, x2: pp.x - 8, y2: headCY + 33
        }));
        svg.appendChild(el('line', {
          class: 'asseq-pbox-actor', x1: pp.x, y1: headCY + 22, x2: pp.x + 8, y2: headCY + 33
        }));
      }
      // Box
      svg.appendChild(el('rect', {
        class: 'asseq-pbox',
        x: pp.x - pp.colWidth / 2,
        y: layout.participantHeaderTop,
        width: pp.colWidth,
        height: layout.participantHeaderBottom - layout.participantHeaderTop,
        rx: 3, ry: 3
      }));
      svg.appendChild(textEl(pp.label, {
        x: pp.x, y: layout.participantHeaderTop + (layout.participantHeaderBottom - layout.participantHeaderTop) / 2 + 5,
        'text-anchor': 'middle',
        class: 'asseq-plabel'
      }));
    }

    // Rows: messages and notes
    for (var r = 0; r < layout.rows.length; r++) {
      var row = layout.rows[r];

      if (row.type === 'message') {
        var dashedCls = isDashedArrow(row.arrow) ? ' dashed' : '';
        var marker = isAsyncArrow(row.arrow) ? 'url(#asseq-arrow-open)' : 'url(#asseq-arrow-closed)';
        if (row.suffix === 'x') {
          // Lost message: small X near target
          marker = null;
        }

        if (row.isSelf) {
          var sx = row.fromX;
          var top = row.y - 16;
          var bot = row.y + 16;
          var stub = 36;
          var path = 'M ' + sx + ' ' + top
                   + ' L ' + (sx + stub) + ' ' + top
                   + ' L ' + (sx + stub) + ' ' + bot
                   + ' L ' + (sx + 2) + ' ' + bot;
          svg.appendChild(el('path', {
            class: 'asseq-msg' + dashedCls,
            d: path,
            'marker-end': marker
          }));
          if (row.label) {
            svg.appendChild(textEl(row.label, {
              x: sx + stub + 8, y: row.y + 4,
              class: 'asseq-mlabel'
            }));
          }
        } else {
          var x1 = row.fromX, x2 = row.toX;
          // Inset from the edges so arrowhead doesn't overlap the lifeline.
          var dir = x2 > x1 ? 1 : -1;
          var inset = 4;
          svg.appendChild(el('line', {
            class: 'asseq-msg' + dashedCls,
            x1: x1 + dir * inset, y1: row.y, x2: x2 - dir * inset, y2: row.y,
            'marker-end': marker
          }));
          if (row.suffix === 'x') {
            // Draw a small X at the message terminus.
            var xx = x2 - dir * inset;
            svg.appendChild(el('line', { class: 'asseq-msg', x1: xx - 5, y1: row.y - 5, x2: xx + 5, y2: row.y + 5 }));
            svg.appendChild(el('line', { class: 'asseq-msg', x1: xx - 5, y1: row.y + 5, x2: xx + 5, y2: row.y - 5 }));
          }
          if (row.label) {
            var labelX = (x1 + x2) / 2;
            svg.appendChild(textEl(row.label, {
              x: labelX, y: row.y - 8,
              'text-anchor': 'middle',
              class: 'asseq-mlabel'
            }));
          }
          if (row.number != null) {
            var numX = Math.min(x1, x2) + 6 + (dir > 0 ? 0 : 0);
            svg.appendChild(textEl(String(row.number) + '.', {
              x: numX, y: row.y - 8,
              'text-anchor': 'start',
              class: 'asseq-mnum'
            }));
          }
        }
      }

      if (row.type === 'note') {
        svg.appendChild(el('rect', {
          class: 'asseq-note-bg',
          x: row.x, y: row.y, width: row.w, height: row.h, rx: 3, ry: 3
        }));
        for (var ln = 0; ln < row.lines.length; ln++) {
          svg.appendChild(textEl(row.lines[ln], {
            x: row.x + 14, y: row.y + 18 + ln * 18,
            class: 'asseq-note-text'
          }));
        }
      }
    }

    return svg;
  }

  root.ASSeqRenderer = { render: render };
})(window);
