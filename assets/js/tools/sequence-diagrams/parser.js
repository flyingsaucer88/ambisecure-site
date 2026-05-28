// AmbiSecure Sequence Diagram Generator — parser
// Token stream -> AST { title, participants, events, errors }
// Auto-declares participants referenced by messages but never declared.
(function (root) {
  'use strict';

  function parse(tokens, lexerErrors) {
    var ast = {
      title: null,
      participants: [],     // [{ name, type, label }]
      events: [],           // see lexer event shapes; block events kept inline
      errors: (lexerErrors || []).slice()
    };

    var seenParticipants = {};
    function declare(name, type, label, line) {
      if (!name) return;
      if (seenParticipants[name]) return;
      seenParticipants[name] = true;
      ast.participants.push({ name: name, type: type || 'participant', label: label || name, line: line });
    }

    // First pass: explicit participant / actor declarations (preserve order).
    for (var i = 0; i < tokens.length; i++) {
      var t = tokens[i];
      if (t.type === 'participant' || t.type === 'actor') {
        declare(t.name, t.type, t.label, t.line);
      }
    }

    // Second pass: walk events.
    var blockStack = [];
    for (var j = 0; j < tokens.length; j++) {
      var ev = tokens[j];
      switch (ev.type) {
        case 'title':
          if (ast.title == null) ast.title = ev.text;
          else ast.errors.push({ line: ev.line, msg: 'duplicate title ignored' });
          break;

        case 'participant':
        case 'actor':
          // Already handled in pass 1.
          break;

        case 'autonumber':
          ast.events.push({ type: 'autonumber', line: ev.line, start: ev.start });
          break;

        case 'message':
          declare(ev.from, 'participant', ev.from, ev.line);
          declare(ev.to, 'participant', ev.to, ev.line);
          ast.events.push({
            type: 'message',
            line: ev.line,
            from: ev.from,
            to: ev.to,
            arrow: ev.arrow,
            suffix: ev.suffix,
            label: ev.label,
            isSelf: ev.from === ev.to
          });
          break;

        case 'note':
          for (var k = 0; k < ev.targets.length; k++) {
            declare(ev.targets[k], 'participant', ev.targets[k], ev.line);
          }
          ast.events.push({
            type: 'note',
            line: ev.line,
            placement: ev.placement,
            targets: ev.targets.slice(),
            label: ev.label
          });
          break;

        case 'block_start':
          blockStack.push({ kind: ev.kind, openLine: ev.line });
          ast.events.push({
            type: 'block_start',
            line: ev.line,
            kind: ev.kind,
            label: ev.label
          });
          break;

        case 'block_else':
          if (!blockStack.length || blockStack[blockStack.length - 1].kind !== 'alt') {
            ast.errors.push({ line: ev.line, msg: '"else" outside of "alt" block' });
          }
          ast.events.push({ type: 'block_else', line: ev.line, label: ev.label });
          break;

        case 'block_end':
          if (!blockStack.length) {
            ast.errors.push({ line: ev.line, msg: '"end" with no matching block opener' });
          } else {
            blockStack.pop();
          }
          ast.events.push({ type: 'block_end', line: ev.line });
          break;

        default:
          ast.errors.push({ line: ev.line, msg: 'unexpected token type: ' + ev.type });
      }
    }

    // Unclosed blocks: emit synthetic block_ends so the layout engine doesn't
    // hang, and report each as an error.
    while (blockStack.length) {
      var dangling = blockStack.pop();
      ast.errors.push({ line: dangling.openLine, msg: 'block opened on line ' + dangling.openLine + ' is never closed; auto-closing' });
      ast.events.push({ type: 'block_end', line: -1, synthetic: true });
    }

    return ast;
  }

  root.ASSeqParser = { parse: parse };
})(window);
