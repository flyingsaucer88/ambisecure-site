/* AmbiSecure — JavaCard CAP file structure explorer.
   The CAP file is a ZIP / JAR containing a fixed set of *.cap component
   files (Header, Directory, Applet, Import, ConstantPool, Class, Method,
   StaticField, RefLocation, Export, Descriptor, Debug). This tool decodes
   the magic bytes and component shape inside a single component file or
   the listing of components in a CAP package. */
(function () {
  'use strict';

  var COMPONENTS = {
    1:  { name: 'Header',        order: 1, mandatory: true,  notes: 'CAP file magic, version, package AID.' },
    2:  { name: 'Directory',     order: 2, mandatory: true,  notes: 'Pointers to all components.' },
    3:  { name: 'Applet',        order: 3, mandatory: false, notes: 'Applet AIDs and entry points.' },
    4:  { name: 'Import',        order: 4, mandatory: true,  notes: 'List of imported packages with their AIDs.' },
    5:  { name: 'ConstantPool',  order: 5, mandatory: true,  notes: 'Field/method references.' },
    6:  { name: 'Class',         order: 6, mandatory: true,  notes: 'Class hierarchy and metadata.' },
    7:  { name: 'Method',        order: 7, mandatory: true,  notes: 'Bytecode for methods.' },
    8:  { name: 'StaticField',   order: 8, mandatory: true,  notes: 'Static field metadata and initial values.' },
    9:  { name: 'ReferenceLocation', order: 9, mandatory: true, notes: 'Locations in Method.cap that reference items needing relocation.' },
    10: { name: 'Export',        order: 10, mandatory: false, notes: 'Public class/interface/method offsets — required for shareable interfaces.' },
    11: { name: 'Descriptor',    order: 11, mandatory: true, notes: 'Class/method descriptor data — needed for verifier.' },
    12: { name: 'Debug',         order: 12, mandatory: false, notes: 'Debug info — typically stripped from production CAPs.' }
  };

  function clean(hex) { return String(hex).replace(/0x/gi,'').replace(/[\s,;:_-]+/g,'').toLowerCase(); }
  function toBytes(hex) {
    var s = clean(hex);
    if (!/^[0-9a-f]*$/.test(s)) throw new Error('Non-hex characters.');
    if (s.length % 2 !== 0) throw new Error('Hex length must be even.');
    var b = []; for (var i = 0; i < s.length; i += 2) b.push(parseInt(s.substr(i, 2), 16));
    return b;
  }

  function row(label, value, note) {
    return '<div class="parsed-row"><span class="label">' + label + '</span>' +
      '<div><div class="value">' + value + '</div>' +
      (note ? '<span class="note">' + note + '</span>' : '') + '</div></div>';
  }

  function decodeAID(bytes) {
    return bytes.map(function (x) { return x.toString(16).toUpperCase().padStart(2, '0'); }).join(':');
  }

  function decodeHeader(b) {
    if (b.length < 12) throw new Error('Header.cap minimum is 12 bytes.');
    if (b[0] !== 0x01) throw new Error('Header tag should be 0x01 (got 0x' + b[0].toString(16) + ').');
    var size = (b[1] << 8) | b[2];
    var magic = (b[3] << 24) | (b[4] << 16) | (b[5] << 8) | b[6];
    if (magic >>> 0 !== 0xDECAFFED) throw new Error('Magic mismatch — expected 0xDECAFFED.');
    var minor = b[7], major = b[8];
    var flags = b[9];
    var pkgAidLen = b[10];
    var pkgAid = b.slice(11, 11 + pkgAidLen);
    var html = '';
    html += row('Component', 'Header (1)', 'Per JCVM 3.x §6.3.');
    html += row('Component size', size + ' bytes', 'u2 BE.');
    html += row('Magic', '0xDECAFFED', 'JCVM CAP magic.');
    html += row('Version', major + '.' + minor, 'u1 major . u1 minor.');
    html += row('Flags', '0x' + flags.toString(16).toUpperCase().padStart(2, '0'),
      ((flags & 0x01) ? 'ACC_INT (uses int) · ' : '') +
      ((flags & 0x02) ? 'ACC_EXPORT (has Export.cap) · ' : '') +
      ((flags & 0x04) ? 'ACC_APPLET (has Applet.cap)' : ''));
    html += row('Package AID length', pkgAidLen + '');
    html += row('Package AID', '<span class="mono">' + decodeAID(pkgAid) + '</span>');
    return html;
  }

  function listComponents() {
    var html = '<table style="width:100%; border-collapse:collapse; font-family:Source Sans 3,sans-serif; font-size:13px;">' +
      '<thead><tr style="background:var(--brand-soft);">' +
      '<th style="text-align:left;padding:8px 10px;font-family:Montserrat,sans-serif;font-size:11px;letter-spacing:0.4px;text-transform:uppercase;">Tag</th>' +
      '<th style="text-align:left;padding:8px 10px;font-family:Montserrat,sans-serif;font-size:11px;letter-spacing:0.4px;text-transform:uppercase;">Component</th>' +
      '<th style="text-align:left;padding:8px 10px;font-family:Montserrat,sans-serif;font-size:11px;letter-spacing:0.4px;text-transform:uppercase;">Mandatory</th>' +
      '<th style="text-align:left;padding:8px 10px;font-family:Montserrat,sans-serif;font-size:11px;letter-spacing:0.4px;text-transform:uppercase;">Notes</th>' +
      '</tr></thead><tbody>';
    Object.keys(COMPONENTS).forEach(function (k) {
      var c = COMPONENTS[k];
      html += '<tr style="border-bottom:1px dashed var(--line);">' +
        '<td style="padding:8px 10px;font-family:JetBrains Mono,monospace;color:var(--brand-red-dark);font-weight:600;">0x' + parseInt(k).toString(16).toUpperCase().padStart(2, '0') + '</td>' +
        '<td style="padding:8px 10px;color:var(--ink);font-weight:600;">' + c.name + '.cap</td>' +
        '<td style="padding:8px 10px;color:' + (c.mandatory ? 'var(--brand-red-dark)' : 'var(--brand-grey)') + ';">' + (c.mandatory ? 'YES' : 'optional') + '</td>' +
        '<td style="padding:8px 10px;color:var(--brand-grey);font-size:12.5px;">' + AS.escHTML(c.notes) + '</td>' +
        '</tr>';
    });
    return html + '</tbody></table>';
  }

  function init() {
    var input = AS.$('jcc-input'), output = AS.$('jcc-output');
    var browse = AS.$('jcc-browse');
    var sample = AS.$('jcc-sample'), clearBtn = AS.$('jcc-clear');
    if (!input || !output) return;

    function go() {
      var raw = (input.value || '').trim();
      if (!raw) { AS.renderPlaceholder(output, 'Paste hex bytes from a Header.cap (or any component starting with its tag byte). The browse table below lists all 12 component types.'); return; }
      try {
        var b = toBytes(raw);
        if (b.length === 0) throw new Error('Empty input.');
        var tag = b[0];
        var ci = COMPONENTS[tag];
        if (!ci) throw new Error('Unknown component tag 0x' + tag.toString(16).toUpperCase() + '.');
        var html = '<div style="margin-bottom:14px;"><span class="tech-badge tech-badge--ok">' + ci.name + '.cap</span> <span class="tech-badge">' + b.length + ' bytes</span></div>';
        if (tag === 0x01) {
          html += decodeHeader(b);
        } else {
          html += row('Component', ci.name + ' (' + tag + ')', ci.notes);
          if (b.length >= 3) {
            var size = (b[1] << 8) | b[2];
            html += row('Component size', size + ' bytes', 'u2 BE following the tag byte.');
            html += row('Body preview', '<span class="mono">' + b.slice(3, Math.min(35, b.length)).map(function (x) { return x.toString(16).toUpperCase().padStart(2, '0'); }).join(' ') + (b.length > 35 ? ' …' : '') + '</span>');
          }
        }
        output.innerHTML = html;
      } catch (e) { AS.renderError(output, e.message); }
    }
    input.addEventListener('input', go);
    if (sample) sample.addEventListener('click', function () {
      // Header.cap with magic, version 3.0, flags 0x06, package AID of length 8
      input.value = '01 00 14 DE CA FF ED 00 03 06 08 A0 00 00 00 62 03 01 0C 01';
      go();
    });
    if (clearBtn) clearBtn.addEventListener('click', function () { input.value=''; go(); input.focus(); });
    if (browse) browse.innerHTML = listComponents();
    go();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
