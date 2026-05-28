// AmbiSecure Sequence Diagram Generator — lexer
// WebSequenceDiagrams syntax subset. Vanilla ES5, no dependencies.
// Tokens produced:
//   { type: 'title'|'participant'|'actor'|'note'|'message'|'block_start'|'block_else'|'block_end'|'autonumber',
//     line: <1-based>, ...payload }
(function (root) {
  'use strict';

  // Arrow forms in order of decreasing specificity so longer matches win.
  // -->>, ->>, -->, -> with optional 'x' or '/' suffix for lost / cancelled.
  var ARROW_RE = /(-->>|->>|-->|->)([x\/]?)/;

  function unquoteIdent(s) {
    s = s.trim();
    if (!s) return '';
    if (s.charAt(0) === '"' && s.charAt(s.length - 1) === '"') {
      return s.slice(1, -1).replace(/\\"/g, '"');
    }
    return s;
  }

  function splitTopLevel(s, sep) {
    // Split on sep but respect double-quoted regions.
    var out = []; var buf = ''; var inQ = false;
    for (var i = 0; i < s.length; i++) {
      var c = s.charAt(i);
      if (c === '"') { inQ = !inQ; buf += c; continue; }
      if (!inQ && c === sep) { out.push(buf); buf = ''; continue; }
      buf += c;
    }
    out.push(buf);
    return out;
  }

  function tokenize(text) {
    var tokens = [];
    var errors = [];
    if (text == null) return { tokens: tokens, errors: errors };

    var rawLines = String(text).split(/\r?\n/);
    for (var i = 0; i < rawLines.length; i++) {
      var line = rawLines[i];
      var lineNo = i + 1;

      // Strip trailing whitespace; preserve internal quoting.
      var trimmed = line.replace(/^\s+|\s+$/g, '');
      if (!trimmed) continue;
      // Comments — # at start of line or //. Inline # is treated as literal
      // because labels can legitimately contain hashes.
      if (trimmed.charAt(0) === '#') continue;
      if (trimmed.indexOf('//') === 0) continue;

      var lower = trimmed.toLowerCase();

      // --- title -----------------------------------------------------------
      if (lower.indexOf('title') === 0 && (trimmed.length === 5 || /\s/.test(trimmed.charAt(5)) || trimmed.charAt(5) === ':')) {
        var rest = trimmed.substring(5).replace(/^\s*:?\s*/, '');
        tokens.push({ type: 'title', line: lineNo, text: rest });
        continue;
      }

      // --- autonumber ------------------------------------------------------
      if (lower === 'autonumber' || lower.indexOf('autonumber ') === 0) {
        var arg = trimmed.substring(10).trim();
        var startNum = 1;
        if (arg) {
          var n = parseInt(arg, 10);
          if (!isNaN(n) && n >= 0) startNum = n;
        }
        tokens.push({ type: 'autonumber', line: lineNo, start: startNum });
        continue;
      }

      // --- participant / actor --------------------------------------------
      if (lower.indexOf('participant ') === 0 || lower.indexOf('actor ') === 0) {
        var kind = lower.indexOf('actor ') === 0 ? 'actor' : 'participant';
        var body = trimmed.substring(kind.length + 1).trim();
        // Forms:
        //   participant Alice
        //   participant Alice as A
        //   participant "Long Name" as A
        var asMatch = /\s+as\s+(\S.*)$/i.exec(body);
        var label = body, alias = null;
        if (asMatch) {
          label = body.substring(0, asMatch.index).trim();
          alias = asMatch[1].trim();
        }
        label = unquoteIdent(label);
        if (!label) { errors.push({ line: lineNo, msg: 'participant declaration has no name' }); continue; }
        tokens.push({ type: kind, line: lineNo, name: alias || label, label: label });
        continue;
      }

      // --- note ------------------------------------------------------------
      if (lower.indexOf('note ') === 0) {
        var noteBody = trimmed.substring(5).trim();
        // Forms:
        //   note left of A: text
        //   note right of A: text
        //   note over A: text
        //   note over A,B: text
        var placement = null; var targetsRaw = '';
        var lower2 = noteBody.toLowerCase();
        if (lower2.indexOf('left of ') === 0)  { placement = 'left';  noteBody = noteBody.substring(8); }
        else if (lower2.indexOf('right of ') === 0) { placement = 'right'; noteBody = noteBody.substring(9); }
        else if (lower2.indexOf('over ') === 0) { placement = 'over';  noteBody = noteBody.substring(5); }
        else { errors.push({ line: lineNo, msg: 'note requires "left of", "right of", or "over"' }); continue; }

        var colonIdx = noteBody.indexOf(':');
        if (colonIdx < 0) { errors.push({ line: lineNo, msg: 'note requires ":" before its label' }); continue; }
        targetsRaw = noteBody.substring(0, colonIdx).trim();
        var noteLabel = noteBody.substring(colonIdx + 1).trim();
        var targets = splitTopLevel(targetsRaw, ',').map(function (t) { return unquoteIdent(t.trim()); }).filter(Boolean);
        if (!targets.length) { errors.push({ line: lineNo, msg: 'note has no target participant' }); continue; }
        if (placement !== 'over' && targets.length > 1) {
          errors.push({ line: lineNo, msg: 'note ' + placement + ' of takes a single participant' });
          continue;
        }
        tokens.push({ type: 'note', line: lineNo, placement: placement, targets: targets, label: noteLabel });
        continue;
      }

      // --- block markers ---------------------------------------------------
      if (lower === 'end') { tokens.push({ type: 'block_end', line: lineNo }); continue; }
      if (lower.indexOf('alt ') === 0 || lower === 'alt') {
        tokens.push({ type: 'block_start', kind: 'alt', line: lineNo, label: trimmed.substring(3).trim() });
        continue;
      }
      if (lower.indexOf('else') === 0 && (trimmed.length === 4 || /\s/.test(trimmed.charAt(4)))) {
        tokens.push({ type: 'block_else', line: lineNo, label: trimmed.substring(4).trim() });
        continue;
      }
      if (lower.indexOf('loop ') === 0 || lower === 'loop') {
        tokens.push({ type: 'block_start', kind: 'loop', line: lineNo, label: trimmed.substring(4).trim() });
        continue;
      }
      if (lower.indexOf('opt ') === 0 || lower === 'opt') {
        tokens.push({ type: 'block_start', kind: 'opt', line: lineNo, label: trimmed.substring(3).trim() });
        continue;
      }

      // --- message ---------------------------------------------------------
      var arrowMatch = ARROW_RE.exec(trimmed);
      if (arrowMatch) {
        var from = trimmed.substring(0, arrowMatch.index).trim();
        var tail = trimmed.substring(arrowMatch.index + arrowMatch[0].length);
        var arrow = arrowMatch[1];
        var arrowSuffix = arrowMatch[2] || ''; // 'x' = lost, '/' = open
        // Tail is "<to>: <label>" or just "<to>" (label-less)
        var colon = tail.indexOf(':');
        var to, label2;
        if (colon < 0) { to = tail.trim(); label2 = ''; }
        else { to = tail.substring(0, colon).trim(); label2 = tail.substring(colon + 1).trim(); }
        from = unquoteIdent(from);
        to = unquoteIdent(to);
        if (!from || !to) {
          errors.push({ line: lineNo, msg: 'message missing participant on one side' });
          continue;
        }
        tokens.push({
          type: 'message', line: lineNo,
          from: from, to: to,
          arrow: arrow,
          suffix: arrowSuffix,
          label: label2
        });
        continue;
      }

      errors.push({ line: lineNo, msg: 'unrecognised line: ' + trimmed.substring(0, 60) });
    }

    return { tokens: tokens, errors: errors };
  }

  root.ASSeqLexer = { tokenize: tokenize };
})(window);
