/* AmbiSecure — NDEF Record decoder (NFC Forum Type 4 friendly).
   Walks an NDEF message into individual records and decodes the well-known types:
   URI (T 'U'), Text (T 'T'), Smart Poster (T 'Sp'), Android AAR (TNF 4). */
(function () {
  'use strict';

  var URI_PREFIXES = [
    '', 'http://www.', 'https://www.', 'http://', 'https://',
    'tel:', 'mailto:', 'ftp://anonymous:anonymous@', 'ftp://ftp.',
    'ftps://', 'sftp://', 'smb://', 'nfs://', 'ftp://', 'dav://',
    'news:', 'telnet://', 'imap:', 'rtsp://', 'urn:', 'pop:',
    'sip:', 'sips:', 'tftp:', 'btspp://', 'btl2cap://', 'btgoep://',
    'tcpobex://', 'irdaobex://', 'file://', 'urn:epc:id:',
    'urn:epc:tag:', 'urn:epc:pat:', 'urn:epc:raw:', 'urn:epc:',
    'urn:nfc:'
  ];

  function clean(hex) { return String(hex).replace(/0x/gi,'').replace(/[\s,;:_-]+/g,'').toLowerCase(); }
  function toBytes(hex) {
    var s = clean(hex);
    if (s.length % 2 !== 0) throw new Error('Hex length must be even.');
    if (!/^[0-9a-f]*$/.test(s)) throw new Error('Non-hex characters.');
    var b = []; for (var i = 0; i < s.length; i += 2) b.push(parseInt(s.substr(i, 2), 16));
    return b;
  }
  function asAscii(b) {
    var s = ''; for (var i = 0; i < b.length; i++) s += (b[i] >= 0x20 && b[i] <= 0x7E) ? String.fromCharCode(b[i]) : '·';
    return s;
  }
  function pad(b) { var x = b.toString(16).toUpperCase(); return x.length < 2 ? '0' + x : x; }

  var TNF_NAMES = ['Empty (0x00)','NFC Well-Known (0x01)','MIME (0x02)','Absolute URI (0x03)','External (0x04)','Unknown (0x05)','Unchanged (0x06)','Reserved (0x07)'];

  function parseNDEF(bytes) {
    var i = 0;
    var records = [];
    var idx = 0;
    while (i < bytes.length) {
      if (i >= bytes.length) break;
      var hdr = bytes[i++];
      var MB = !!(hdr & 0x80), ME = !!(hdr & 0x40), CF = !!(hdr & 0x20),
          SR = !!(hdr & 0x10), IL = !!(hdr & 0x08), TNF = hdr & 0x07;
      if (i >= bytes.length) throw new Error('Truncated TYPE_LENGTH at offset ' + i);
      var typeLen = bytes[i++];
      var payloadLen;
      if (SR) {
        if (i >= bytes.length) throw new Error('Truncated PAYLOAD_LENGTH (SR) at offset ' + i);
        payloadLen = bytes[i++];
      } else {
        if (i + 3 >= bytes.length) throw new Error('Truncated PAYLOAD_LENGTH (long) at offset ' + i);
        payloadLen = (bytes[i] << 24) | (bytes[i+1] << 16) | (bytes[i+2] << 8) | bytes[i+3]; i += 4;
      }
      var idLen = 0;
      if (IL) {
        if (i >= bytes.length) throw new Error('Truncated ID_LENGTH at offset ' + i);
        idLen = bytes[i++];
      }
      if (i + typeLen + idLen + payloadLen > bytes.length) throw new Error('Record at offset ' + (i-1) + ' overruns buffer.');
      var typeBytes = bytes.slice(i, i + typeLen); i += typeLen;
      var idBytes = bytes.slice(i, i + idLen); i += idLen;
      var payload = bytes.slice(i, i + payloadLen); i += payloadLen;
      records.push({
        idx: idx++, MB: MB, ME: ME, CF: CF, SR: SR, IL: IL, TNF: TNF,
        type: typeBytes, id: idBytes, payload: payload
      });
      if (ME) break;
    }
    return records;
  }

  function humanise(rec) {
    var typeStr = String.fromCharCode.apply(null, rec.type);
    if (rec.TNF === 0x01) {
      if (typeStr === 'U' && rec.payload.length) {
        var prefIdx = rec.payload[0];
        var rest = rec.payload.slice(1).map(function(b){return String.fromCharCode(b);}).join('');
        var pref = URI_PREFIXES[prefIdx] || ('[?prefix=0x' + pad(prefIdx) + ']');
        return { kind: 'URI', value: pref + rest };
      }
      if (typeStr === 'T' && rec.payload.length) {
        var statusByte = rec.payload[0];
        var langLen = statusByte & 0x3F;
        var utf16 = !!(statusByte & 0x80);
        var lang = rec.payload.slice(1, 1 + langLen).map(function(b){return String.fromCharCode(b);}).join('');
        var textBytes = rec.payload.slice(1 + langLen);
        var text;
        if (utf16) {
          text = '';
          for (var k = 0; k + 1 < textBytes.length; k += 2) text += String.fromCharCode((textBytes[k] << 8) | textBytes[k+1]);
        } else {
          text = new TextDecoder('utf-8', {fatal: false}).decode(new Uint8Array(textBytes));
        }
        return { kind: 'Text', value: '[' + lang + '] ' + text };
      }
      if (typeStr === 'Sp') return { kind: 'Smart Poster', value: '(nested NDEF; expand below)' };
    }
    if (rec.TNF === 0x02) return { kind: 'MIME · ' + typeStr, value: asAscii(rec.payload) };
    if (rec.TNF === 0x03) return { kind: 'Absolute URI', value: typeStr };
    if (rec.TNF === 0x04) return { kind: 'External · ' + typeStr, value: asAscii(rec.payload) };
    return { kind: 'TNF ' + rec.TNF, value: rec.payload.map(pad).join(' ') };
  }

  function init() {
    var input = AS.$('nd-input'), output = AS.$('nd-output');
    var sample = AS.$('nd-sample'), clearBtn = AS.$('nd-clear');
    if (!input || !output) return;

    function go() {
      var raw = (input.value || '').trim();
      if (!raw) { AS.renderPlaceholder(output, 'Paste an NDEF message in hex.'); return; }
      try {
        var bytes = toBytes(raw);
        var recs = parseNDEF(bytes);
        var html = '<div style="margin-bottom:14px;"><span class="tech-badge tech-badge--ok">NDEF</span> <span class="tech-badge">' + recs.length + ' record' + (recs.length === 1 ? '' : 's') + '</span> <span class="tech-badge">' + bytes.length + ' bytes</span></div>';
        recs.forEach(function (r) {
          var h = humanise(r);
          html += '<div style="border:1px solid var(--line); border-radius:4px; padding:14px 16px; margin-bottom:10px;">';
          html += '<div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:8px;">';
          html += '<span class="tech-badge tech-badge--info">#' + r.idx + '</span>';
          if (r.MB) html += '<span class="tech-badge">MB</span>';
          if (r.ME) html += '<span class="tech-badge">ME</span>';
          if (r.SR) html += '<span class="tech-badge">SR</span>';
          if (r.CF) html += '<span class="tech-badge tech-badge--warn">CF · chunk</span>';
          html += '<span class="tech-badge tech-badge--ok">' + AS.escHTML(h.kind) + '</span>';
          html += '</div>';
          html += '<div style="font-family:\'Source Sans 3\',sans-serif; font-size:14.5px; color:var(--ink); word-break:break-all;">' + AS.escHTML(h.value) + '</div>';
          html += '<div style="font-family:\'JetBrains Mono\',monospace; font-size:11.5px; color:var(--muted); margin-top:6px;">TNF=' + r.TNF + ' · type="' + AS.escHTML(String.fromCharCode.apply(null, r.type)) + '" · ' + r.payload.length + ' B payload</div>';
          html += '</div>';
        });
        output.innerHTML = html;
      } catch (e) { AS.renderError(output, e.message); }
    }
    input.addEventListener('input', go);
    if (sample) sample.addEventListener('click', function () {
      // sample: SR, MB+ME, TNF=01 (well-known), TYPE='U', payload= prefix 0x04 + "ambisecure.ambimat.com"
      input.value = 'D1 01 17 55 04 61 6D 62 69 73 65 63 75 72 65 2E 61 6D 62 69 6D 61 74 2E 63 6F 6D';
      go();
    });
    if (clearBtn) clearBtn.addEventListener('click', function () { input.value=''; go(); input.focus(); });
    go();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
