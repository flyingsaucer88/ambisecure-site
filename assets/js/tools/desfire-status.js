/* AmbiSecure — DESFire status decoder. Looks up DESFire response status bytes. */
(function () {
  'use strict';

  /* DESFire status word dictionary — public, well-documented in the
     NXP application notes and ISO/IEC 14443-4 framing.
     This is a reference table, not exploit material. */
  var SW = [
    {hex:'00', name:'OPERATION_OK', tone:'ok', desc:'Successful operation.'},
    {hex:'0C', name:'NO_CHANGES', tone:'ok', desc:'No changes done to backup files; transaction does not need committing.'},
    {hex:'0E', name:'OUT_OF_EEPROM_ERROR', tone:'err', desc:'Insufficient NV memory to complete the command.'},
    {hex:'1C', name:'ILLEGAL_COMMAND_CODE', tone:'err', desc:'Command code not supported.'},
    {hex:'1E', name:'INTEGRITY_ERROR', tone:'err', desc:'CRC or MAC does not match data; possible memory error or wire tampering.'},
    {hex:'40', name:'NO_SUCH_KEY', tone:'err', desc:'Invalid key number specified.'},
    {hex:'7E', name:'LENGTH_ERROR', tone:'err', desc:'Length of command string invalid.'},
    {hex:'9D', name:'PERMISSION_DENIED', tone:'err', desc:'Current configuration / status does not allow the requested command.'},
    {hex:'9E', name:'PARAMETER_ERROR', tone:'err', desc:'Value of the parameter(s) invalid.'},
    {hex:'A0', name:'APPLICATION_NOT_FOUND', tone:'err', desc:'Requested AID not found on PICC.'},
    {hex:'A1', name:'APPL_INTEGRITY_ERROR', tone:'err', desc:'Unrecoverable error within application — application will be disabled.'},
    {hex:'AE', name:'AUTHENTICATION_ERROR', tone:'err', desc:'Current authentication status does not allow the requested command.'},
    {hex:'AF', name:'ADDITIONAL_FRAME', tone:'info', desc:'Additional data frame is to be sent / received (chained response).'},
    {hex:'BE', name:'BOUNDARY_ERROR', tone:'err', desc:'Attempted to read/write data outside file/record limits.'},
    {hex:'C1', name:'PICC_INTEGRITY_ERROR', tone:'err', desc:'Unrecoverable error within PICC — PICC will be disabled.'},
    {hex:'CA', name:'COMMAND_ABORTED', tone:'warn', desc:'Previous command was not fully completed; not all frames were requested or provided.'},
    {hex:'CD', name:'PICC_DISABLED_ERROR', tone:'err', desc:'PICC was disabled by an unrecoverable error.'},
    {hex:'CE', name:'COUNT_ERROR', tone:'err', desc:'Number of applications limit reached, or another counter limit hit.'},
    {hex:'DE', name:'DUPLICATE_ERROR', tone:'err', desc:'Creation of file/application failed because file/application with same number already exists.'},
    {hex:'EE', name:'EEPROM_ERROR', tone:'err', desc:'Could not complete NV-write operation due to loss of power; internal backup/rollback mechanism activated.'},
    {hex:'F0', name:'FILE_NOT_FOUND', tone:'err', desc:'Specified file number does not exist.'},
    {hex:'F1', name:'FILE_INTEGRITY_ERROR', tone:'err', desc:'Unrecoverable error within file — file will be disabled.'}
  ];

  function init() {
    var input = AS.$('ds-input'), output = AS.$('ds-output'), filter = AS.$('ds-filter'), clearBtn = AS.$('ds-clear');
    if (!output) return;

    function rowFor(e) {
      return '<div class="parsed-row">' +
        '<span class="label">0x' + e.hex + '</span>' +
        '<div><div class="value"><span class="tech-badge tech-badge--' + e.tone + '">' + e.tone.toUpperCase() + '</span> ' +
        '<strong style="font-family:\'Montserrat\',sans-serif; color:var(--ink);">' + e.name + '</strong></div>' +
        '<span class="note">' + AS.escHTML(e.desc) + '</span></div></div>';
    }

    function go() {
      var raw = (input.value || '').trim().toLowerCase();
      var src = filter ? filter.value : 'all';
      var matches;
      if (!raw) {
        matches = SW;
      } else if (/^[0-9a-f]{1,2}$/.test(raw)) {
        var key = raw.length === 1 ? '0' + raw : raw;
        matches = SW.filter(function(e){ return e.hex.toLowerCase().indexOf(key) === 0; });
      } else {
        matches = SW.filter(function(e){ return (e.name + ' ' + e.desc).toLowerCase().indexOf(raw) !== -1; });
      }
      if (!matches.length) {
        output.innerHTML = '<div style="margin-bottom:10px;"><span class="tech-badge tech-badge--warn">NO MATCH</span></div><div class="parsed-row"><span class="label">Not found</span><div class="value">No DESFire status with that hex / phrase.</div></div>';
        return;
      }
      var html = '<div style="margin-bottom:14px;"><span class="tech-badge tech-badge--info">' + matches.length + ' OF ' + SW.length + '</span></div>';
      html += matches.map(rowFor).join('');
      output.innerHTML = html;
    }
    if (input) input.addEventListener('input', go);
    if (clearBtn) clearBtn.addEventListener('click', function () { if (input) input.value=''; go(); if (input) input.focus(); });
    go();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
