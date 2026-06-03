(function () {
  'use strict';

  // ---- Syntax validation with precise line/column ----------------------
  // Use the native JSON.parse, then locate the error position. Browsers
  // report position differently (V8 gives a char offset, SpiderMonkey gives
  // line/column), so we normalise to a 1-based line + column.
  function locateError(text, err) {
    var msg = String(err && err.message || 'Invalid JSON');
    var pos = -1;
    var m = msg.match(/position\s+(\d+)/i);
    if (m) pos = parseInt(m[1], 10);
    var lineCol = msg.match(/line\s+(\d+)\s+column\s+(\d+)/i);
    var line, col;
    if (lineCol) {
      line = parseInt(lineCol[1], 10);
      col = parseInt(lineCol[2], 10);
      // derive offset for snippet
      pos = offsetFromLineCol(text, line, col);
    } else if (pos >= 0) {
      var lc = lineColFromOffset(text, pos);
      line = lc.line; col = lc.col;
    }
    return { message: msg, pos: pos, line: line, col: col };
  }

  function lineColFromOffset(text, offset) {
    var line = 1, col = 1;
    for (var i = 0; i < offset && i < text.length; i++) {
      if (text.charAt(i) === '\n') { line++; col = 1; } else { col++; }
    }
    return { line: line, col: col };
  }

  function offsetFromLineCol(text, line, col) {
    var off = 0, ln = 1;
    while (ln < line && off < text.length) {
      if (text.charAt(off) === '\n') ln++;
      off++;
    }
    return off + (col - 1);
  }

  function snippet(text, pos) {
    if (pos == null || pos < 0) return '';
    var start = Math.max(0, pos - 24);
    var end = Math.min(text.length, pos + 24);
    var before = text.slice(start, pos);
    var after = text.slice(pos, end);
    return (start > 0 ? '…' : '') + before + '⟂' + after + (end < text.length ? '…' : '');
  }

  // Parse JSON; returns { ok, value } or { ok:false, error:{message,line,col,pos} }.
  function parseJSON(text) {
    try {
      return { ok: true, value: JSON.parse(text) };
    } catch (e) {
      return { ok: false, error: locateError(text, e) };
    }
  }

  // ---- Minimal JSON Schema validator (practical 2020-12 subset) --------
  // Supported keywords: type, required, properties, items, enum, const,
  // minimum, maximum, minLength, maxLength, pattern, minItems, maxItems,
  // additionalProperties (boolean), anyOf, allOf, oneOf, $ref to local
  // "#/definitions/..." and "#/$defs/...". NOT supported (documented in UI):
  // format assertions, remote $ref, if/then/else, dependentSchemas.

  function typeOf(v) {
    if (v === null) return 'null';
    if (Array.isArray(v)) return 'array';
    if (typeof v === 'number') return Number.isInteger(v) ? 'integer' : 'number';
    return typeof v; // 'string' | 'boolean' | 'object'
  }

  function typeMatches(expected, actualType, value) {
    if (expected === 'number') return actualType === 'number' || actualType === 'integer';
    if (expected === 'integer') return actualType === 'integer';
    return expected === actualType;
  }

  function resolveRef(ref, root) {
    if (typeof ref !== 'string' || ref.charAt(0) !== '#') {
      throw new Error('Only local $ref starting with "#/" is supported (got "' + ref + '").');
    }
    var path = ref.slice(1).split('/').filter(function (p) { return p !== ''; });
    var node = root;
    for (var i = 0; i < path.length; i++) {
      var key = decodeURIComponent(path[i].replace(/~1/g, '/').replace(/~0/g, '~'));
      if (node == null || typeof node !== 'object' || !(key in node)) {
        throw new Error('Cannot resolve $ref "' + ref + '".');
      }
      node = node[key];
    }
    return node;
  }

  // Validate instance against schema. Collects {path, message} errors.
  function validate(instance, schema, root, ptr, errors, depth) {
    if (depth > 200) { errors.push({ path: ptr, message: 'Maximum $ref depth exceeded.' }); return; }
    if (schema === true) return;
    if (schema === false) { errors.push({ path: ptr, message: 'Schema is "false": no value is valid here.' }); return; }
    if (typeof schema !== 'object' || schema === null) return;

    if (typeof schema.$ref === 'string') {
      var resolved = resolveRef(schema.$ref, root);
      validate(instance, resolved, root, ptr, errors, depth + 1);
      // continue to sibling keywords (2020-12 allows them)
    }

    var actualType = typeOf(instance);

    // type
    if (schema.type != null) {
      var types = Array.isArray(schema.type) ? schema.type : [schema.type];
      var hit = types.some(function (t) { return typeMatches(t, actualType, instance); });
      if (!hit) {
        errors.push({ path: ptr, message: 'Expected type ' + types.join(' or ') + ', got ' + actualType + '.' });
      }
    }

    // const
    if ('const' in schema) {
      if (!deepEqual(instance, schema.const)) {
        errors.push({ path: ptr, message: 'Value must equal const ' + JSON.stringify(schema.const) + '.' });
      }
    }

    // enum
    if (Array.isArray(schema.enum)) {
      var inEnum = schema.enum.some(function (e) { return deepEqual(instance, e); });
      if (!inEnum) {
        errors.push({ path: ptr, message: 'Value is not one of the allowed enum entries.' });
      }
    }

    // numbers
    if (actualType === 'number' || actualType === 'integer') {
      if (typeof schema.minimum === 'number' && instance < schema.minimum) {
        errors.push({ path: ptr, message: 'Must be >= ' + schema.minimum + ' (got ' + instance + ').' });
      }
      if (typeof schema.maximum === 'number' && instance > schema.maximum) {
        errors.push({ path: ptr, message: 'Must be <= ' + schema.maximum + ' (got ' + instance + ').' });
      }
    }

    // strings
    if (actualType === 'string') {
      var len = stringLength(instance);
      if (typeof schema.minLength === 'number' && len < schema.minLength) {
        errors.push({ path: ptr, message: 'String shorter than minLength ' + schema.minLength + ' (length ' + len + ').' });
      }
      if (typeof schema.maxLength === 'number' && len > schema.maxLength) {
        errors.push({ path: ptr, message: 'String longer than maxLength ' + schema.maxLength + ' (length ' + len + ').' });
      }
      if (typeof schema.pattern === 'string') {
        var re;
        try { re = new RegExp(schema.pattern); }
        catch (e) { errors.push({ path: ptr, message: 'Schema pattern is not a valid regex: ' + e.message }); re = null; }
        if (re && !re.test(instance)) {
          errors.push({ path: ptr, message: 'String does not match pattern /' + schema.pattern + '/.' });
        }
      }
    }

    // arrays
    if (actualType === 'array') {
      if (typeof schema.minItems === 'number' && instance.length < schema.minItems) {
        errors.push({ path: ptr, message: 'Array has fewer than minItems ' + schema.minItems + ' (' + instance.length + ').' });
      }
      if (typeof schema.maxItems === 'number' && instance.length > schema.maxItems) {
        errors.push({ path: ptr, message: 'Array has more than maxItems ' + schema.maxItems + ' (' + instance.length + ').' });
      }
      if (schema.items != null && typeof schema.items === 'object') {
        for (var i = 0; i < instance.length; i++) {
          validate(instance[i], schema.items, root, ptr + '/' + i, errors, depth);
        }
      }
    }

    // objects
    if (actualType === 'object') {
      var props = schema.properties && typeof schema.properties === 'object' ? schema.properties : null;
      if (Array.isArray(schema.required)) {
        for (var r = 0; r < schema.required.length; r++) {
          var req = schema.required[r];
          if (!Object.prototype.hasOwnProperty.call(instance, req)) {
            errors.push({ path: ptr, message: 'Missing required property "' + req + '".' });
          }
        }
      }
      var keys = Object.keys(instance);
      for (var k = 0; k < keys.length; k++) {
        var key = keys[k];
        var childPtr = ptr + '/' + escapePtr(key);
        if (props && Object.prototype.hasOwnProperty.call(props, key)) {
          validate(instance[key], props[key], root, childPtr, errors, depth);
        } else if (schema.additionalProperties === false) {
          errors.push({ path: childPtr, message: 'Additional property "' + key + '" is not allowed (additionalProperties:false).' });
        } else if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
          validate(instance[key], schema.additionalProperties, root, childPtr, errors, depth);
        }
      }
    }

    // allOf
    if (Array.isArray(schema.allOf)) {
      for (var a = 0; a < schema.allOf.length; a++) {
        validate(instance, schema.allOf[a], root, ptr, errors, depth);
      }
    }

    // anyOf
    if (Array.isArray(schema.anyOf)) {
      var anyPass = schema.anyOf.some(function (sub) {
        return subValid(instance, sub, root, depth);
      });
      if (!anyPass) {
        errors.push({ path: ptr, message: 'Value matches none of the anyOf subschemas.' });
      }
    }

    // oneOf
    if (Array.isArray(schema.oneOf)) {
      var matches = 0;
      for (var o = 0; o < schema.oneOf.length; o++) {
        if (subValid(instance, schema.oneOf[o], root, depth)) matches++;
      }
      if (matches !== 1) {
        errors.push({ path: ptr, message: 'Value must match exactly one oneOf subschema (matched ' + matches + ').' });
      }
    }
  }

  function subValid(instance, schema, root, depth) {
    var e = [];
    validate(instance, schema, root, '', e, depth + 1);
    return e.length === 0;
  }

  function escapePtr(key) {
    return String(key).replace(/~/g, '~0').replace(/\//g, '~1');
  }

  function stringLength(s) {
    // count Unicode code points, not UTF-16 units
    var n = 0;
    for (var i = 0; i < s.length; i++) {
      n++;
      var c = s.charCodeAt(i);
      if (c >= 0xD800 && c <= 0xDBFF) i++; // skip low surrogate
    }
    return n;
  }

  function deepEqual(a, b) {
    if (a === b) return true;
    if (typeof a !== typeof b) return false;
    if (a == null || b == null) return a === b;
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      for (var i = 0; i < a.length; i++) if (!deepEqual(a[i], b[i])) return false;
      return true;
    }
    if (typeof a === 'object' && typeof b === 'object') {
      var ka = Object.keys(a), kb = Object.keys(b);
      if (ka.length !== kb.length) return false;
      for (var j = 0; j < ka.length; j++) {
        if (!Object.prototype.hasOwnProperty.call(b, ka[j])) return false;
        if (!deepEqual(a[ka[j]], b[ka[j]])) return false;
      }
      return true;
    }
    return false;
  }

  // Top-level schema validation entry. Returns { errors:[], schemaError? }.
  function validateAgainstSchema(instance, schema) {
    var errors = [];
    try {
      validate(instance, schema, schema, '', errors, 0);
    } catch (e) {
      return { schemaError: e.message, errors: errors };
    }
    return { errors: errors };
  }

  // ---- DOM wiring ------------------------------------------------------
  function init() {
    var inst = AS.$('jv-instance'), sch = AS.$('jv-schema');
    var output = AS.$('jv-output');
    var useSchema = AS.$('jv-use-schema');
    var sample = AS.$('jv-sample'), clearBtn = AS.$('jv-clear'), copyBtn = AS.$('jv-copy');
    if (!inst || !output) return;

    function summaryText() { return output.dataset.value || ''; }

    function go() {
      output.dataset.value = '';
      var raw = inst.value;
      if (!raw.trim()) { AS.renderPlaceholder(output, 'Paste JSON above to validate it.'); return; }

      var parsed = parseJSON(raw);
      if (!parsed.ok) {
        var er = parsed.error;
        var where = '';
        if (er.line != null) where = ' (line ' + er.line + ', column ' + er.col + ')';
        var snip = snippet(raw, er.pos);
        output.dataset.value = 'Invalid JSON' + where + ': ' + er.message;
        output.innerHTML =
          '<div style="margin-bottom:10px;"><span class="tech-badge tech-badge--err">INVALID JSON</span>' +
          (er.line != null ? ' <span class="tech-badge">line ' + er.line + '</span> <span class="tech-badge">col ' + er.col + '</span>' : '') +
          '</div>' +
          '<div class="parsed-row"><span class="label">Error</span><div class="value">' + AS.escHTML(er.message) + '</div></div>' +
          (snip ? '<div class="parsed-row"><span class="label">Near</span><div class="value" style="font-family:\'JetBrains Mono\',monospace;white-space:pre-wrap;word-break:break-all;">' + AS.escHTML(snip) + '</div></div>' : '');
        return;
      }

      // Syntax OK.
      var wantSchema = useSchema && useSchema.checked && sch && sch.value.trim();
      if (!wantSchema) {
        output.dataset.value = 'Valid JSON. ' + describeValue(parsed.value);
        output.innerHTML =
          '<div style="margin-bottom:10px;"><span class="tech-badge tech-badge--ok">VALID JSON</span> <span class="tech-badge tech-badge--info">' +
          AS.escHTML(typeOf(parsed.value)) + '</span></div>' +
          '<div class="parsed-row"><span class="label">Result</span><div class="value">Syntax is well-formed. ' + AS.escHTML(describeValue(parsed.value)) + '</div></div>' +
          '<div class="parsed-row"><span class="label">Schema</span><div class="value">No schema checked. Enable "Validate against schema" to compare against a JSON Schema.</div></div>';
        return;
      }

      // Parse the schema itself.
      var schParsed = parseJSON(sch.value);
      if (!schParsed.ok) {
        var se = schParsed.error;
        output.dataset.value = 'Schema is not valid JSON: ' + se.message;
        output.innerHTML =
          '<div style="margin-bottom:10px;"><span class="tech-badge tech-badge--err">SCHEMA NOT JSON</span>' +
          (se.line != null ? ' <span class="tech-badge">line ' + se.line + '</span> <span class="tech-badge">col ' + se.col + '</span>' : '') + '</div>' +
          '<div class="parsed-row"><span class="label">Error</span><div class="value">The schema textarea is not valid JSON: ' + AS.escHTML(se.message) + '</div></div>';
        return;
      }

      var res = validateAgainstSchema(parsed.value, schParsed.value);
      if (res.schemaError) {
        output.dataset.value = 'Schema error: ' + res.schemaError;
        output.innerHTML =
          '<div style="margin-bottom:10px;"><span class="tech-badge tech-badge--err">SCHEMA ERROR</span></div>' +
          '<div class="parsed-row"><span class="label">Error</span><div class="value">' + AS.escHTML(res.schemaError) + '</div></div>';
        return;
      }

      if (res.errors.length === 0) {
        output.dataset.value = 'Valid against schema. ' + describeValue(parsed.value);
        output.innerHTML =
          '<div style="margin-bottom:10px;"><span class="tech-badge tech-badge--ok">VALID JSON</span> <span class="tech-badge tech-badge--ok">SCHEMA PASS</span></div>' +
          '<div class="parsed-row"><span class="label">Result</span><div class="value">The instance satisfies every supported schema keyword. ' + AS.escHTML(describeValue(parsed.value)) + '</div></div>';
        return;
      }

      var rows = res.errors.map(function (e) {
        var p = e.path === '' ? '(root)' : e.path;
        return '<div class="parsed-row"><span class="label" style="font-family:\'JetBrains Mono\',monospace;">' +
          AS.escHTML(p) + '</span><div class="value">' + AS.escHTML(e.message) + '</div></div>';
      }).join('');
      var summary = res.errors.map(function (e) {
        return (e.path === '' ? '(root)' : e.path) + ': ' + e.message;
      }).join('\n');
      output.dataset.value = summary;
      output.innerHTML =
        '<div style="margin-bottom:10px;"><span class="tech-badge tech-badge--ok">VALID JSON</span> <span class="tech-badge tech-badge--err">SCHEMA FAIL</span> <span class="tech-badge">' +
        res.errors.length + ' issue' + (res.errors.length === 1 ? '' : 's') + '</span></div>' + rows;
    }

    function describeValue(v) {
      var t = typeOf(v);
      if (t === 'object') return 'Root is an object with ' + Object.keys(v).length + ' key(s).';
      if (t === 'array') return 'Root is an array with ' + v.length + ' item(s).';
      return 'Root is a ' + t + '.';
    }

    inst.addEventListener('input', go);
    if (sch) sch.addEventListener('input', go);
    if (useSchema) useSchema.addEventListener('change', go);

    if (sample) sample.addEventListener('click', function () {
      inst.value = [
        '{',
        '  "id": "5f-a3",',
        '  "port": 70000,',
        '  "role": "admin",',
        '  "tags": ["a", "b", "c"]',
        '}'
      ].join('\n');
      if (sch) {
        sch.value = [
          '{',
          '  "type": "object",',
          '  "required": ["id", "port"],',
          '  "additionalProperties": false,',
          '  "properties": {',
          '    "id": { "type": "string", "pattern": "^[0-9a-f-]+$" },',
          '    "port": { "type": "integer", "minimum": 1, "maximum": 65535 },',
          '    "role": { "enum": ["user", "auditor"] },',
          '    "tags": { "type": "array", "items": { "type": "string" }, "maxItems": 2 }',
          '  }',
          '}'
        ].join('\n');
      }
      if (useSchema) useSchema.checked = true;
      go();
      inst.focus();
    });
    if (clearBtn) clearBtn.addEventListener('click', function () {
      inst.value = ''; if (sch) sch.value = ''; go(); inst.focus();
    });
    AS.bindCopy(copyBtn, summaryText);
    go();
  }

  // Expose pure logic for Node self-test and reuse.
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      parseJSON: parseJSON,
      validateAgainstSchema: validateAgainstSchema,
      typeOf: typeOf,
      deepEqual: deepEqual
    };
  }
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  }
})();
