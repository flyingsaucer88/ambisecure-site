(function () {
  'use strict';

  var FILE_TYPES = {
    0x00: { name: 'Standard Data File', kind: 'std' },
    0x01: { name: 'Backup Data File',  kind: 'std' },
    0x02: { name: 'Value File',        kind: 'value' },
    0x03: { name: 'Linear Record File', kind: 'record' },
    0x04: { name: 'Cyclic Record File', kind: 'record' },
    0x05: { name: 'Transaction MAC File', kind: 'tmac' }
  };

  var COMM = {
    0x00: 'Plain communication',
    0x01: 'Plain communication with MAC (CMACed)',
    0x03: 'Fully enciphered communication'
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

  function decodeAccessRights(ar) {

    function nib(name, val) {
      if (val === 0xE) return name + '=Free access';
      if (val === 0xF) return name + '=Denied';
      return name + '=Key #' + val;
    }
    var read = (ar >> 12) & 0xF;
    var write = (ar >> 8) & 0xF;
    var rw = (ar >> 4) & 0xF;
    var chg = ar & 0xF;
    return [nib('Read', read), nib('Write', write), nib('R/W', rw), nib('ChgAR', chg)].join(' &middot; ');
  }

  function le(b, off, n) {
    var v = 0;
    for (var i = 0; i < n; i++) v |= (b[off + i] << (8 * i));
    return v >>> 0;
  }

  function init() {
    var input = AS.$('dfs-input'), output = AS.$('dfs-output');
    var sample = AS.$('dfs-sample'), clearBtn = AS.$('dfs-clear');
    if (!input || !output) return;

    function go() {
      var raw = (input.value || '').trim();
      if (!raw) { AS.renderPlaceholder(output, 'Paste GetFileSettings response (hex). Starts with the 1-byte file type.'); return; }
      try {
        var b = toBytes(raw);
        if (b.length < 4) throw new Error('Too short — minimum is type(1) + comm(1) + accessRights(2) = 4 bytes.');

        var type = b[0];
        var typeInfo = FILE_TYPES[type] || { name: 'Unknown (0x' + type.toString(16) + ')', kind: 'unknown' };
        var comm = b[1];
        var ar = (b[2] << 8) | b[3];

        var html = '<div style="margin-bottom:14px;"><span class="tech-badge tech-badge--ok">DESFire file settings</span> <span class="tech-badge">' + b.length + ' bytes</span></div>';
        html += row('File type', '0x' + type.toString(16).toUpperCase().padStart(2, '0'), typeInfo.name);
        html += row('Comm settings', '0x' + comm.toString(16).toUpperCase().padStart(2, '0'), COMM[comm] || 'Reserved.');
        html += row('Access rights', '0x' + ar.toString(16).toUpperCase().padStart(4, '0'), decodeAccessRights(ar));

        var i = 4;
        if (typeInfo.kind === 'std') {
          if (b.length < i + 3) throw new Error('Std/Backup file requires file size (3 bytes LE).');
          var size = le(b, i, 3); i += 3;
          html += row('File size', size + ' bytes', 'LE 3-byte field for Standard / Backup files.');
        } else if (typeInfo.kind === 'value') {
          if (b.length < i + 13) throw new Error('Value file requires lower(4) + upper(4) + limited-credit(4) + flag(1).');
          var lo = le(b, i, 4); i += 4;
          var hi = le(b, i, 4); i += 4;
          var lim = le(b, i, 4); i += 4;
          var flag = b[i]; i += 1;
          html += row('Lower limit', lo + '');
          html += row('Upper limit', hi + '');
          html += row('Limited credit', lim + ' (4 bytes LE)');
          html += row('Limited-credit flag', '0x' + flag.toString(16).toUpperCase(), (flag & 1) ? 'Limited-credit operation enabled.' : 'Limited-credit disabled.');
        } else if (typeInfo.kind === 'record') {
          if (b.length < i + 9) throw new Error('Record file requires record size(3) + max records(3) + current records(3).');
          var rsz = le(b, i, 3); i += 3;
          var rmax = le(b, i, 3); i += 3;
          var rcur = le(b, i, 3); i += 3;
          html += row('Record size', rsz + ' bytes');
          html += row('Max records', rmax + '');
          html += row('Current records', rcur + '');
        } else if (typeInfo.kind === 'tmac') {
          html += row('TMAC file', 'Transaction MAC file — counts and MACs each transaction.', 'See <a href="/resources/tools/tmac-visualizer/">Transaction MAC visualizer</a>.');
        }

        html += '<div class="note" style="margin-top:14px; padding:10px 14px; background:var(--secure-cyan-soft); border-left:3px solid var(--secure-cyan); border-radius:3px;">' +
          '<strong>Spec:</strong> NXP DESFire EV1/EV2/EV3 GetFileSettings (0xF5) response. EV2/EV3 may include additional bytes for additional access rights or TMAC linkage.</div>';

        output.innerHTML = html;
      } catch (e) { AS.renderError(output, e.message); }
    }
    input.addEventListener('input', go);
    if (sample) sample.addEventListener('click', function () {

      input.value = '00 03 E0 12 80 00 00';
      go();
    });
    if (clearBtn) clearBtn.addEventListener('click', function () { input.value=''; go(); input.focus(); });
    go();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
