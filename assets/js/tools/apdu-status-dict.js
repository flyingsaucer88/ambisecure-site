(function () {
  'use strict';

  var SW = [
    {hex:'9000', tone:'ok',  desc:'Normal — no further qualification.', src:'iso'},
    {hex:'61XX', tone:'ok',  desc:'Bytes available; SW2 = number of bytes.', src:'iso'},
    {hex:'9100', tone:'ok',  desc:'EMV: returning normally with proprietary data.', src:'emv'},

    {hex:'6200', tone:'warn',desc:'State of non-volatile memory unchanged.', src:'iso'},
    {hex:'6281', tone:'warn',desc:'Part of returned data may be corrupted.', src:'iso'},
    {hex:'6282', tone:'warn',desc:'End of file/record reached before reading Le bytes.', src:'iso'},
    {hex:'6283', tone:'warn',desc:'Selected file invalidated.', src:'iso'},
    {hex:'6285', tone:'warn',desc:'File terminated.', src:'iso'},
    {hex:'6300', tone:'warn',desc:'State of non-volatile memory changed.', src:'iso'},
    {hex:'6381', tone:'warn',desc:'File filled by last write.', src:'iso'},
    {hex:'6382', tone:'warn',desc:'Unsuccessful comparison (verification failed).', src:'iso'},
    {hex:'63CX', tone:'warn',desc:'PIN/CHV verification failed; X retries remaining.', src:'iso'},
    {hex:'6310', tone:'warn',desc:'More data available (GP).', src:'gp'},

    {hex:'6400', tone:'err', desc:'Execution error — state unchanged.', src:'iso'},
    {hex:'6500', tone:'err', desc:'Execution error — state may have changed.', src:'iso'},
    {hex:'6581', tone:'err', desc:'Memory failure.', src:'iso'},
    {hex:'6700', tone:'err', desc:'Wrong length (Le or Lc).', src:'iso'},
    {hex:'6800', tone:'err', desc:'Function in CLA not supported.', src:'iso'},
    {hex:'6881', tone:'err', desc:'Logical channel not supported.', src:'iso'},
    {hex:'6882', tone:'err', desc:'Secure messaging not supported.', src:'iso'},
    {hex:'6883', tone:'err', desc:'Last command of the chain expected.', src:'iso'},
    {hex:'6884', tone:'err', desc:'Command chaining not supported.', src:'iso'},
    {hex:'6900', tone:'err', desc:'Command not allowed.', src:'iso'},
    {hex:'6981', tone:'err', desc:'Command incompatible with file structure.', src:'iso'},
    {hex:'6982', tone:'err', desc:'Security status not satisfied.', src:'iso'},
    {hex:'6983', tone:'err', desc:'Authentication method blocked.', src:'iso'},
    {hex:'6984', tone:'err', desc:'Reference data invalidated.', src:'iso'},
    {hex:'6985', tone:'err', desc:'Conditions of use not satisfied. (FIDO: user presence not detected.)', src:'iso'},
    {hex:'6986', tone:'err', desc:'Command not allowed (no current EF).', src:'iso'},
    {hex:'6987', tone:'err', desc:'Expected secure messaging data objects missing.', src:'iso'},
    {hex:'6988', tone:'err', desc:'Incorrect secure messaging data objects.', src:'iso'},
    {hex:'6A00', tone:'err', desc:'Wrong parameter(s) P1-P2.', src:'iso'},
    {hex:'6A80', tone:'err', desc:'Incorrect parameters in data field.', src:'iso'},
    {hex:'6A81', tone:'err', desc:'Function not supported.', src:'iso'},
    {hex:'6A82', tone:'err', desc:'File not found.', src:'iso'},
    {hex:'6A83', tone:'err', desc:'Record not found.', src:'iso'},
    {hex:'6A84', tone:'err', desc:'Not enough memory space in the file.', src:'iso'},
    {hex:'6A85', tone:'err', desc:'Lc inconsistent with TLV structure.', src:'iso'},
    {hex:'6A86', tone:'err', desc:'Incorrect parameters P1-P2.', src:'iso'},
    {hex:'6A87', tone:'err', desc:'Lc inconsistent with P1-P2.', src:'iso'},
    {hex:'6A88', tone:'err', desc:'Referenced data not found.', src:'iso'},
    {hex:'6A89', tone:'err', desc:'File already exists.', src:'iso'},
    {hex:'6A8A', tone:'err', desc:'DF name already exists.', src:'iso'},
    {hex:'6B00', tone:'err', desc:'Wrong parameter(s) P1-P2 (out of range).', src:'iso'},
    {hex:'6CXX', tone:'err', desc:'Wrong length Le — exact length in SW2.', src:'iso'},
    {hex:'6D00', tone:'err', desc:'Instruction code not supported or invalid.', src:'iso'},
    {hex:'6E00', tone:'err', desc:'Class not supported.', src:'iso'},
    {hex:'6F00', tone:'err', desc:'No precise diagnosis. (FIDO: often a CTAP error.)', src:'iso'},
    {hex:'9484', tone:'err', desc:'Algorithm not supported.', src:'gp'},
    {hex:'9485', tone:'err', desc:'Invalid key check value.', src:'gp'}
  ];

  function init() {
    var search = AS.$('asd-search'), filter = AS.$('asd-filter'), table = AS.$('asd-table');
    if (!table) return;

    function render() {
      var q = (search.value || '').trim().toLowerCase();
      var src = filter.value;
      var out = SW.filter(function (e) {
        if (src !== 'all' && e.src !== src) return false;
        if (!q) return true;
        return e.hex.toLowerCase().indexOf(q) !== -1 || e.desc.toLowerCase().indexOf(q) !== -1;
      });
      var html = '<div style="margin-bottom:14px;"><span class="tech-badge tech-badge--info">' + out.length + ' OF ' + SW.length + '</span></div>';
      html += '<table style="width:100%;border-collapse:collapse;font-size:14px;">';
      html += '<thead><tr style="background:var(--brand-soft);font-family:\'Montserrat\',sans-serif;font-size:11.5px;letter-spacing:0.5px;text-transform:uppercase;color:var(--brand-dark);"><th style="padding:10px;text-align:left;width:90px;">SW1 SW2</th><th style="padding:10px;text-align:left;width:80px;">Tone</th><th style="padding:10px;text-align:left;">Description</th><th style="padding:10px;text-align:left;width:140px;">Source</th></tr></thead><tbody>';
      out.forEach(function (e) {
        html += '<tr style="border-bottom:1px solid var(--line);">' +
          '<td style="padding:10px;font-family:\'JetBrains Mono\',monospace;color:var(--ink);">' + e.hex + '</td>' +
          '<td style="padding:10px;"><span class="tech-badge tech-badge--' + e.tone + '">' + e.tone.toUpperCase() + '</span></td>' +
          '<td style="padding:10px;font-family:\'Source Sans 3\',sans-serif;line-height:1.55;color:var(--brand-dark);">' + AS.escHTML(e.desc) + '</td>' +
          '<td style="padding:10px;color:var(--muted);font-size:13px;font-family:\'Montserrat\',sans-serif;">' + ({iso:'ISO 7816-4',gp:'GlobalPlatform',emv:'EMV',fido:'FIDO'}[e.src] || e.src) + '</td></tr>';
      });
      html += '</tbody></table>';
      table.innerHTML = html;
    }
    search.addEventListener('input', render);
    filter.addEventListener('change', render);
    render();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
