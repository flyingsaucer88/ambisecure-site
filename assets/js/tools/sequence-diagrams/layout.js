// AmbiSecure Sequence Diagram Generator — layout engine
// Walks the AST and assigns x/y coordinates to participants, messages, notes,
// and block frames. Produces a fully-positioned Layout the renderer consumes.
(function (root) {
  'use strict';

  // ---------- Layout constants (px) ----------
  var PARTICIPANT_GAP_MIN = 110;      // minimum horizontal gap between participants
  var PARTICIPANT_BOX_PAD_X = 16;     // padding inside participant header box
  var PARTICIPANT_BOX_HEIGHT = 38;    // height of participant header box
  var ACTOR_HEAD_H = 40;              // additional vertical room for actor stick figure
  var SIDE_MARGIN = 40;               // left/right margin around the diagram
  var TOP_MARGIN = 24;                // top margin above title
  var TITLE_HEIGHT = 36;              // vertical room for the title line
  var TITLE_GAP = 18;                 // gap between title and participant row
  var PARTICIPANT_ROW_GAP = 28;       // gap between participant headers and first event
  var MESSAGE_ROW_HEIGHT = 50;        // vertical space per message
  var SELF_MESSAGE_HEIGHT = 60;       // taller for self-loop messages
  var NOTE_PADDING_X = 14;
  var NOTE_PADDING_Y = 10;
  var NOTE_ROW_GAP = 8;
  var BLOCK_HEADER_HEIGHT = 24;       // alt/loop/opt header strip
  var BLOCK_INSET_X = 10;             // left/right inset for block frame around participants
  var BLOCK_VPAD = 12;                // vertical padding inside block before first event
  var BOTTOM_MARGIN = 30;

  // Rough monospace-ish character width estimate (px per char @ 13px font).
  // Used to size labels without measuring DOM. Slightly generous.
  function estimateTextWidth(str, fontPx) {
    var px = fontPx || 13;
    if (!str) return 0;
    // Approx: 0.58 * fontSize for proportional sans. We tune toward 0.62 to
    // give some headroom for the wider glyphs.
    return Math.ceil(str.length * px * 0.62);
  }

  function wrapNoteText(label, maxWidthPx, fontPx) {
    if (!label) return [''];
    // Honour explicit \n separators.
    var lines = String(label).split(/\\n|\n/);
    var out = [];
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      if (estimateTextWidth(line, fontPx) <= maxWidthPx) { out.push(line); continue; }
      // Greedy word wrap.
      var words = line.split(/\s+/);
      var cur = '';
      for (var w = 0; w < words.length; w++) {
        var candidate = cur ? cur + ' ' + words[w] : words[w];
        if (estimateTextWidth(candidate, fontPx) <= maxWidthPx) cur = candidate;
        else {
          if (cur) out.push(cur);
          cur = words[w];
        }
      }
      if (cur) out.push(cur);
    }
    if (!out.length) out.push('');
    return out;
  }

  function layout(ast) {
    var L = {
      title: ast.title || null,
      participants: [],
      rows: [],            // each row has y, height, type-specific payload
      blocks: [],          // resolved blocks with top/bottom y and left/right x
      width: 0,
      height: 0,
      hasActors: false,
      errors: (ast.errors || []).slice()
    };

    // ----- Pass A: participant horizontal positions -----
    // Compute each participant's minimum column width: max(label_width + pad, gap_min)
    var pList = ast.participants.slice();
    if (!pList.length) {
      L.width = 600;
      L.height = TOP_MARGIN + 80;
      return L;
    }

    // Column width = max(label width + 2*pad, PARTICIPANT_GAP_MIN baseline)
    var colWidths = pList.map(function (p) {
      var w = estimateTextWidth(p.label, 14) + PARTICIPANT_BOX_PAD_X * 2;
      return Math.max(w, 80);
    });

    // Inter-participant centre-to-centre distance has to be at least the
    // average of adjacent col widths + the minimum gap. We also need extra
    // room when a long message label sits between two adjacent participants.
    var minCentreGap = [];
    for (var k = 0; k < pList.length - 1; k++) {
      minCentreGap.push(Math.max(
        PARTICIPANT_GAP_MIN,
        (colWidths[k] + colWidths[k + 1]) / 2 + 30
      ));
    }

    // Inflate centre gaps for message labels that fall between participants.
    var nameToIdx = {};
    for (var i = 0; i < pList.length; i++) nameToIdx[pList[i].name] = i;

    for (var e = 0; e < ast.events.length; e++) {
      var ev = ast.events[e];
      if (ev.type === 'message' && !ev.isSelf && ev.label) {
        var a = nameToIdx[ev.from], b = nameToIdx[ev.to];
        if (a == null || b == null) continue;
        var lo = Math.min(a, b), hi = Math.max(a, b);
        // For adjacent participants, ensure label fits in one segment.
        // For wider spans, distribute extra width across all crossed segments.
        var labelWidth = estimateTextWidth(ev.label, 12) + 24;
        if (hi - lo === 0) continue;
        var perSeg = labelWidth / (hi - lo);
        for (var s = lo; s < hi; s++) {
          if (perSeg > minCentreGap[s]) minCentreGap[s] = perSeg;
        }
      }
    }

    // Assign x positions left-to-right.
    var x = SIDE_MARGIN + colWidths[0] / 2;
    for (var p = 0; p < pList.length; p++) {
      L.participants.push({
        name: pList[p].name,
        type: pList[p].type,
        label: pList[p].label,
        x: x,
        colWidth: colWidths[p]
      });
      if (pList[p].type === 'actor') L.hasActors = true;
      if (p < pList.length - 1) x += minCentreGap[p];
    }
    var rightmostCentre = L.participants[L.participants.length - 1].x;
    L.width = rightmostCentre + colWidths[colWidths.length - 1] / 2 + SIDE_MARGIN;

    // Y position of the participant header centre line.
    var titleBlock = L.title ? TITLE_HEIGHT + TITLE_GAP : 0;
    var headerTop = TOP_MARGIN + titleBlock + (L.hasActors ? ACTOR_HEAD_H : 0);
    var headerBottom = headerTop + PARTICIPANT_BOX_HEIGHT;
    L.participantHeaderTop = headerTop;
    L.participantHeaderBottom = headerBottom;

    // ----- Pass B: assign y positions to events, resolve blocks -----
    var y = headerBottom + PARTICIPANT_ROW_GAP;
    var autoNum = null; // null = off; otherwise an integer counter
    var blockStack = []; // each: { kind, label, frame: {top, leftIdx, rightIdx, segments:[{top,label}]} }

    function expandBlockExtents(idxFrom, idxTo) {
      // For every open block, ensure its participant span includes [idxFrom..idxTo]
      for (var b = 0; b < blockStack.length; b++) {
        var fr = blockStack[b].frame;
        if (idxFrom < fr.leftIdx) fr.leftIdx = idxFrom;
        if (idxTo > fr.rightIdx) fr.rightIdx = idxTo;
      }
    }

    for (var n = 0; n < ast.events.length; n++) {
      var ev2 = ast.events[n];

      if (ev2.type === 'autonumber') {
        autoNum = ev2.start;
        continue;
      }

      if (ev2.type === 'block_start') {
        var initialIdx = pList.length ? 0 : 0;
        var frame = {
          kind: ev2.kind,
          label: ev2.label,
          top: y,
          leftIdx: pList.length - 1,    // start tight; expand as inner events land
          rightIdx: 0,
          segments: [{ top: y, label: ev2.kind + (ev2.label ? ' [' + ev2.label + ']' : '') }],
          bottom: y
        };
        blockStack.push({ frame: frame });
        L.blocks.push(frame);
        y += BLOCK_HEADER_HEIGHT + BLOCK_VPAD;
        continue;
      }

      if (ev2.type === 'block_else') {
        if (!blockStack.length) continue;
        var fr2 = blockStack[blockStack.length - 1].frame;
        fr2.segments.push({ top: y, label: 'else' + (ev2.label ? ' [' + ev2.label + ']' : '') });
        y += BLOCK_HEADER_HEIGHT;
        continue;
      }

      if (ev2.type === 'block_end') {
        if (!blockStack.length) continue;
        var fr3 = blockStack.pop().frame;
        fr3.bottom = y + 4;
        // If the block never enclosed any participant (no inner events) keep
        // a reasonable default span centred on the participant set.
        if (fr3.leftIdx > fr3.rightIdx) {
          fr3.leftIdx = 0;
          fr3.rightIdx = pList.length - 1;
        }
        y = fr3.bottom + 8;
        continue;
      }

      if (ev2.type === 'message') {
        var fromIdx = nameToIdx[ev2.from];
        var toIdx = nameToIdx[ev2.to];
        if (fromIdx == null || toIdx == null) continue;
        expandBlockExtents(Math.min(fromIdx, toIdx), Math.max(fromIdx, toIdx));
        var h = ev2.isSelf ? SELF_MESSAGE_HEIGHT : MESSAGE_ROW_HEIGHT;
        var num = null;
        if (autoNum != null) { num = autoNum; autoNum += 1; }
        L.rows.push({
          type: 'message',
          y: y + h / 2,
          fromIdx: fromIdx,
          toIdx: toIdx,
          fromX: L.participants[fromIdx].x,
          toX: L.participants[toIdx].x,
          arrow: ev2.arrow,
          suffix: ev2.suffix,
          label: ev2.label || '',
          isSelf: ev2.isSelf,
          number: num
        });
        y += h;
        continue;
      }

      if (ev2.type === 'note') {
        // Determine target x-range.
        var xs = ev2.targets.map(function (t) { return nameToIdx[t]; }).filter(function (v) { return v != null; });
        if (!xs.length) continue;
        var minIdx = Math.min.apply(null, xs);
        var maxIdx = Math.max.apply(null, xs);
        expandBlockExtents(minIdx, maxIdx);

        var anchorX, noteW, noteAlign;
        var minIdxX = L.participants[minIdx].x;
        var maxIdxX = L.participants[maxIdx].x;
        // Estimate width budget for wrapping; cap so notes don't get absurdly wide.
        var maxW = Math.max(180, Math.min(360, (maxIdxX - minIdxX) + 180));
        var wrapped = wrapNoteText(ev2.label, maxW - NOTE_PADDING_X * 2, 13);
        var widest = 0;
        for (var wi = 0; wi < wrapped.length; wi++) {
          widest = Math.max(widest, estimateTextWidth(wrapped[wi], 13));
        }
        noteW = Math.max(60, widest + NOTE_PADDING_X * 2);

        if (ev2.placement === 'left') {
          anchorX = minIdxX - 32 - noteW;
          noteAlign = 'left';
        } else if (ev2.placement === 'right') {
          anchorX = maxIdxX + 32;
          noteAlign = 'right';
        } else { // over
          var centre = (minIdxX + maxIdxX) / 2;
          if (minIdx === maxIdx) {
            anchorX = L.participants[minIdx].x - noteW / 2;
          } else {
            noteW = Math.max(noteW, (maxIdxX - minIdxX) + 60);
            anchorX = centre - noteW / 2;
          }
          noteAlign = 'over';
        }
        var noteH = wrapped.length * 18 + NOTE_PADDING_Y * 2;
        L.rows.push({
          type: 'note',
          y: y,
          x: anchorX,
          w: noteW,
          h: noteH,
          lines: wrapped,
          placement: ev2.placement,
          align: noteAlign
        });
        y += noteH + NOTE_ROW_GAP;
        continue;
      }
    }

    // Close any blocks the parser already closed defensively.
    while (blockStack.length) {
      var fr4 = blockStack.pop().frame;
      fr4.bottom = y + 4;
      if (fr4.leftIdx > fr4.rightIdx) { fr4.leftIdx = 0; fr4.rightIdx = pList.length - 1; }
      y = fr4.bottom + 8;
    }

    L.height = y + BOTTOM_MARGIN;
    return L;
  }

  root.ASSeqLayout = { layout: layout, _const: {
    PARTICIPANT_BOX_HEIGHT: PARTICIPANT_BOX_HEIGHT,
    PARTICIPANT_BOX_PAD_X: PARTICIPANT_BOX_PAD_X,
    BLOCK_HEADER_HEIGHT: BLOCK_HEADER_HEIGHT,
    BLOCK_INSET_X: BLOCK_INSET_X
  } };
})(window);
