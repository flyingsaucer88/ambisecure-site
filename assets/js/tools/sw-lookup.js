(function () {
  'use strict';

  var SW = [
    ['9000', 'Normal — no further qualification.', 'OK', 'iso'],
    ['61XX', 'Normal — bytes available; SW2 = number of bytes.', 'OK', 'iso'],
    ['6200', 'Warning — state of NV memory unchanged.', 'WARN', 'iso'],
    ['6281', 'Part of returned data may be corrupted.', 'WARN', 'iso'],
    ['6282', 'End of file/record reached before reading Le bytes.', 'WARN', 'iso'],
    ['6283', 'Selected file invalidated.', 'WARN', 'iso'],
    ['6285', 'File terminated.', 'WARN', 'iso'],
    ['6300', 'Warning — state of NV memory changed.', 'WARN', 'iso'],
    ['6381', 'File filled by last write.', 'WARN', 'iso'],
    ['6382', 'Unsuccessful comparison (verification failed).', 'WARN', 'iso'],
    ['63CX', 'PIN/CHV verification failed; X tries left.', 'WARN', 'iso'],
    ['6400', 'Execution error — state unchanged.', 'ERR', 'iso'],
    ['6500', 'Execution error — state may have changed.', 'ERR', 'iso'],
    ['6581', 'Memory failure.', 'ERR', 'iso'],
    ['6700', 'Wrong length (Le or Lc).', 'ERR', 'iso'],
    ['6800', 'Function in CLA not supported.', 'ERR', 'iso'],
    ['6881', 'Logical channel not supported.', 'ERR', 'iso'],
    ['6882', 'Secure messaging not supported.', 'ERR', 'iso'],
    ['6883', 'Last command of the chain expected.', 'ERR', 'iso'],
    ['6884', 'Command chaining not supported.', 'ERR', 'iso'],
    ['6900', 'Command not allowed.', 'ERR', 'iso'],
    ['6981', 'Command incompatible with file structure.', 'ERR', 'iso'],
    ['6982', 'Security status not satisfied.', 'ERR', 'iso'],
    ['6983', 'Authentication method blocked.', 'ERR', 'iso'],
    ['6984', 'Reference data invalidated.', 'ERR', 'iso'],
    ['6985', 'Conditions of use not satisfied.', 'ERR', 'iso'],
    ['6986', 'Command not allowed (no current EF).', 'ERR', 'iso'],
    ['6987', 'Expected secure messaging data objects missing.', 'ERR', 'iso'],
    ['6988', 'Incorrect secure messaging data objects.', 'ERR', 'iso'],
    ['6A00', 'Wrong parameter(s) P1-P2.', 'ERR', 'iso'],
    ['6A80', 'Incorrect parameters in data field.', 'ERR', 'iso'],
    ['6A81', 'Function not supported.', 'ERR', 'iso'],
    ['6A82', 'File not found.', 'ERR', 'iso'],
    ['6A83', 'Record not found.', 'ERR', 'iso'],
    ['6A84', 'Not enough memory space in the file.', 'ERR', 'iso'],
    ['6A85', 'Lc inconsistent with TLV structure.', 'ERR', 'iso'],
    ['6A86', 'Incorrect parameters P1-P2.', 'ERR', 'iso'],
    ['6A87', 'Lc inconsistent with P1-P2.', 'ERR', 'iso'],
    ['6A88', 'Referenced data not found.', 'ERR', 'iso'],
    ['6A89', 'File already exists.', 'ERR', 'iso'],
    ['6A8A', 'DF name already exists.', 'ERR', 'iso'],
    ['6B00', 'Wrong parameter(s) P1-P2 (out of range).', 'ERR', 'iso'],
    ['6CXX', 'Wrong length Le — exact length in SW2.', 'ERR', 'iso'],
    ['6D00', 'Instruction code not supported or invalid.', 'ERR', 'iso'],
    ['6E00', 'Class not supported.', 'ERR', 'iso'],
    ['6F00', 'No precise diagnosis.', 'ERR', 'iso'],

    ['9484', 'Algorithm not supported (GP).', 'ERR', 'gp'],
    ['9485', 'Invalid key check value (GP).', 'ERR', 'gp'],
    ['6310', 'More data available (GP).', 'WARN', 'gp'],

    ['9100', 'EMV: returning normally with proprietary data.', 'OK', 'emv'],

    ['6985', 'FIDO: condition of use not satisfied — usually user-presence not detected.', 'ERR', 'fido'],
    ['6F00', 'FIDO: no precise diagnosis (often a CTAP error from the authenticator).', 'ERR', 'fido']
  ];

  function init() {
    var input = AS.$('sw-input'), output = AS.$('sw-output');
    var clearBtn = AS.$('sw-clear');
    if (!input || !output) return;

    function rowFor(entry, query) {
      var hex = entry[0], desc = entry[1], tone = entry[2], src = entry[3];
      var toneClass = tone === 'OK' ? 'ok' : (tone === 'WARN' ? 'warn' : (tone === 'ERR' ? 'err' : 'info'));
      var sourceLabel = ({iso:'ISO 7816-4', gp:'GlobalPlatform', emv:'EMV', fido:'FIDO'}[src] || src.toUpperCase());
      return '<div class="parsed-row">' +
        '<span class="label">' + AS.escHTML(hex) + '</span>' +
        '<div><div class="value"><span class="tech-badge tech-badge--' + toneClass + '">' + tone + '</span> ' +
        '<span style="font-family:\'Source Sans 3\',sans-serif;font-size:14.5px;color:var(--ink);">' + AS.escHTML(desc) + '</span></div>' +
        '<span class="note">' + sourceLabel + '</span></div></div>';
    }

    function go() {
      var q = input.value.trim().toUpperCase().replace(/[^0-9A-FX]/g, function(c){

        return c;
      });
      var rawText = input.value.trim();
      var matches;
      if (rawText && /^[0-9A-Fa-fXx\s]+$/.test(rawText)) {
        var clean = rawText.replace(/[\s]/g, '').toUpperCase();
        if (clean.length === 2) {

          matches = SW.filter(function(e){ return e[0].substr(0,2) === clean; });
        } else if (clean.length === 4) {
          matches = SW.filter(function(e){
            if (e[0] === clean) return true;
            if (e[0].substr(2) === 'XX' && e[0].substr(0,2) === clean.substr(0,2)) return true;
            return false;
          });
        } else {
          matches = SW.filter(function(e){ return e[0].indexOf(clean) === 0; });
        }
      } else if (rawText) {
        var lc = rawText.toLowerCase();
        matches = SW.filter(function(e){ return e[1].toLowerCase().indexOf(lc) !== -1; });
      } else {
        AS.renderPlaceholder(output, 'Type a status word (e.g. 9000, 6A82, 63CX) or a phrase ("file not found").');
        return;
      }

      if (!matches.length) {
        output.innerHTML = '<div style="margin-bottom:10px;"><span class="tech-badge tech-badge--warn">NO MATCH</span></div>' +
          '<div class="parsed-row"><span class="label">Not in dictionary</span><div class="value">This SW isn&rsquo;t in our built-in list. It may be card-vendor-proprietary; check the card&rsquo;s reference manual.</div></div>';
        return;
      }
      var html = '<div style="margin-bottom:14px;"><span class="tech-badge tech-badge--info">' + matches.length + ' MATCH' + (matches.length === 1 ? '' : 'ES') + '</span></div>';
      html += matches.map(function(e){ return rowFor(e); }).join('');
      output.innerHTML = html;
    }

    input.addEventListener('input', go);
    if (clearBtn) clearBtn.addEventListener('click', function () { input.value=''; go(); input.focus(); });
    go();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
