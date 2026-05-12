(function () {
  'use strict';

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

  function decodeATQA(b) {
    if (b.length !== 2) throw new Error('ATQA is exactly 2 bytes.');
    var a0 = b[0], a1 = b[1];
    var bitFrameAnticoll = a0 & 0x1F;
    var uidSize = (a0 >> 6) & 0x03;
    var uidLabel = ['single (4 bytes)', 'double (7 bytes)', 'triple (10 bytes)', 'reserved'][uidSize];
    var html = '';
    html += row('ATQA byte 1', '0x' + a0.toString(16).toUpperCase().padStart(2,'0'),
      'UID size: ' + uidLabel + ' &middot; bit-frame anticoll: 0x' + bitFrameAnticoll.toString(16).toUpperCase());
    html += row('ATQA byte 2', '0x' + a1.toString(16).toUpperCase().padStart(2,'0'), 'Reserved / proprietary.');
    return html;
  }

  function decodeSAK(sak) {
    var html = '';
    var iso14443_4 = !!(sak & 0x20);
    var uidNotComplete = !!(sak & 0x04);
    var iso18092 = !!(sak & 0x40);
    html += row('SAK', '0x' + sak.toString(16).toUpperCase().padStart(2,'0'),
      (iso14443_4 ? 'ISO/IEC 14443-4 compliant (T=CL) &middot; ' : 'No 14443-4 &middot; ') +
      (iso18092 ? 'ISO 18092 (NFC-IP1) &middot; ' : '') +
      (uidNotComplete ? 'UID not complete — anti-coll loop continues' : 'UID complete'));
    if (sak === 0x00) html += '<div class="note">SAK 0x00: MIFARE Ultralight / NFC Forum Type 2 family.</div>';
    if (sak === 0x08) html += '<div class="note">SAK 0x08: MIFARE Classic 1K family.</div>';
    if (sak === 0x18) html += '<div class="note">SAK 0x18: MIFARE Classic 4K family.</div>';
    if (sak === 0x20) html += '<div class="note">SAK 0x20: ISO 14443-4 only (no MIFARE compatibility) — typical of DESFire EV2/EV3 in 14443-4-only mode.</div>';
    if (sak === 0x28) html += '<div class="note">SAK 0x28: DESFire EV1 / NXP smart-MX with MIFARE compatibility.</div>';
    return html;
  }

  function decodeIBlock(b) {
    if (b.length === 0) return '';
    var pcb = b[0];
    var html = '';
    var blockType = (pcb >> 6) & 0x03;
    var typeName;
    if ((pcb & 0xE2) === 0x02) typeName = 'I-block (information)';
    else if ((pcb & 0xE6) === 0xA2) typeName = 'R-block (receive-ready / NAK / ACK)';
    else if ((pcb & 0xC7) === 0xC2) typeName = 'S-block (supervisory: WTX / DESELECT)';
    else typeName = 'unknown PCB';
    html += row('PCB', '0x' + pcb.toString(16).toUpperCase().padStart(2,'0'), typeName);
    var hasCID = !!(pcb & 0x08);
    var hasNAD = !!(pcb & 0x04);
    var chained = !!(pcb & 0x10);
    var blockNum = pcb & 0x01;
    if (typeName.indexOf('I-block') === 0) {
      html += row('  Block number', String(blockNum));
      html += row('  Chaining', chained ? 'YES (more frames follow)' : 'NO (final frame)');
      html += row('  CID present', hasCID ? 'YES' : 'NO');
      html += row('  NAD present', hasNAD ? 'YES' : 'NO');
    }
    if (typeName.indexOf('R-block') === 0) {
      html += row('  R-block kind', (pcb & 0x10) ? 'NAK' : 'ACK');
      html += row('  Block number', String(blockNum));
    }
    if (typeName.indexOf('S-block') === 0) {
      html += row('  S-block kind', (pcb & 0x30) === 0x30 ? 'WTX (waiting time extension)' : 'DESELECT');
    }
    if (b.length > 1) html += row('  Payload', '<span class="mono">' + b.slice(1).map(function (x){return x.toString(16).toUpperCase().padStart(2,'0');}).join(' ') + '</span>');
    return html;
  }

  function init() {
    var sel = AS.$('isofr-type');
    var input = AS.$('isofr-input'), output = AS.$('isofr-output');
    var sample = AS.$('isofr-sample'), clearBtn = AS.$('isofr-clear');
    if (!input || !output) return;

    function go() {
      var raw = (input.value || '').trim();
      var kind = sel ? sel.value : 'auto';
      if (!raw) { AS.renderPlaceholder(output, 'Pick a frame type and paste the bytes.'); return; }
      try {
        var b = toBytes(raw);
        var html = '<div style="margin-bottom:14px;"><span class="tech-badge tech-badge--ok">14443 frame</span> <span class="tech-badge">' + b.length + ' bytes</span></div>';
        if (kind === 'reqa' || (kind === 'auto' && b.length === 1 && b[0] === 0x26)) {
          html += row('REQA', '0x26', 'Request command, Type A. PCD asks idle PICCs to respond with ATQA.');
        } else if (kind === 'wupa' || (kind === 'auto' && b.length === 1 && b[0] === 0x52)) {
          html += row('WUPA', '0x52', 'Wake-up-A. Like REQA but also wakes HALT-state PICCs.');
        } else if (kind === 'atqa' || (kind === 'auto' && b.length === 2)) {
          html += decodeATQA(b);
        } else if (kind === 'sak' || (kind === 'auto' && b.length === 1)) {
          html += decodeSAK(b[0]);
        } else if (kind === 'rats' || (kind === 'auto' && b.length === 2 && b[0] === 0xE0)) {
          html += row('RATS', '0xE0 ' + b[1].toString(16).toUpperCase().padStart(2,'0'),
            'Request for Answer To Select. Param byte: FSDI=' + ((b[1] >> 4) & 0x0F) + ' (max frame size), CID=' + (b[1] & 0x0F) + '.');
        } else if (kind === 'iblock' || kind === 'auto') {
          html += decodeIBlock(b);
        } else {
          throw new Error('Unsupported frame type or unrecognised bytes.');
        }
        output.innerHTML = html;
      } catch (e) { AS.renderError(output, e.message); }
    }
    input.addEventListener('input', go);
    if (sel) sel.addEventListener('change', go);
    if (sample) sample.addEventListener('click', function () { if (sel) sel.value = 'atqa'; input.value = '44 03'; go(); });
    if (clearBtn) clearBtn.addEventListener('click', function () { input.value=''; go(); input.focus(); });
    go();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
