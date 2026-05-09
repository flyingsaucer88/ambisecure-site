/* AmbiSecure — CMAC length calculator.
   Helper for engineers wiring SCP03, EMV CDA, DESFire EV2/3 secure messaging.
   Computes: number of CMAC blocks, padded length, output truncation. */
(function () {
  'use strict';

  var BLOCK = { 'AES-128': 16, 'AES-192': 16, 'AES-256': 16, 'TDES (3DES)': 8 };

  function row(label, value, note) {
    return '<div class="parsed-row"><span class="label">' + label + '</span>' +
      '<div><div class="value">' + value + '</div>' +
      (note ? '<span class="note">' + note + '</span>' : '') + '</div></div>';
  }

  function init() {
    var inputLen = AS.$('cmac-len'), inputCipher = AS.$('cmac-cipher'), inputTrunc = AS.$('cmac-trunc');
    var output = AS.$('cmac-output'), sample = AS.$('cmac-sample'), clearBtn = AS.$('cmac-clear');
    if (!inputLen || !output) return;

    function go() {
      var len = parseInt(inputLen.value, 10);
      var cipher = inputCipher ? inputCipher.value : 'AES-128';
      var trunc = inputTrunc ? parseInt(inputTrunc.value, 10) : 16;
      if (Number.isNaN(len) || len < 0) {
        AS.renderPlaceholder(output, 'Enter a non-negative input length in bytes.');
        return;
      }
      try {
        var blockSize = BLOCK[cipher];
        if (!blockSize) throw new Error('Unsupported cipher.');

        var lastBlockLen = len === 0 ? 0 : (len % blockSize);
        var isFullLast = (len > 0 && lastBlockLen === 0);
        var isPaddedLast = !isFullLast;
        var paddedLen = isPaddedLast ? (len - lastBlockLen) + blockSize : len;
        var blocks = paddedLen / blockSize;
        if (len === 0) { paddedLen = blockSize; blocks = 1; }

        var html = '<div style="margin-bottom:14px;"><span class="tech-badge tech-badge--ok">CMAC ' + cipher + '</span></div>';
        html += row('Input length', len + ' bytes');
        html += row('Block size', blockSize + ' bytes', 'Underlying block cipher block.');
        html += row('Last-block status',
          isFullLast ? 'Final block is full → uses subkey K1.' :
          'Final block is padded with 0x80 || 0x00 ... → uses subkey K2.',
          'CMAC selects between two subkeys (NIST SP 800-38B §6.2) based on whether the message length is a multiple of the block size.');
        html += row('Padded length', paddedLen + ' bytes');
        html += row('Number of CMAC blocks', String(blocks),
          'Total CBC-MAC iterations under the chosen cipher.');

        var fullOut = blockSize;
        var truncOut = Math.min(trunc, fullOut);
        html += row('Full CMAC output', fullOut + ' bytes', 'Native cipher block-size output.');
        html += row('Truncated output', truncOut + ' bytes',
          'CMAC outputs are commonly truncated. SCP03 uses 8-byte C-MAC for command MAC; DESFire EV2/3 truncates to 8 bytes for CMAC over data; EMV CDA / dynamic auth uses 4-8 byte chunks.');

        // Useful presets cheatsheet
        html += '<div class="note" style="margin-top:14px; padding:10px 14px; background:var(--brand-soft); border-radius:4px;">' +
          '<strong>Common deployment truncations</strong><br/>' +
          'SCP03 C-MAC / R-MAC: 8 bytes &middot; ' +
          'DESFire EV2 secure messaging: 8 bytes &middot; ' +
          'EMV CDA / dynamic data signature: full block &middot; ' +
          'NIST SP 800-38B recommendation: ≥ 64 bits / 8 bytes.</div>';

        output.innerHTML = html;
      } catch (e) { AS.renderError(output, e.message); }
    }
    inputLen.addEventListener('input', go);
    if (inputCipher) inputCipher.addEventListener('change', go);
    if (inputTrunc) inputTrunc.addEventListener('input', go);
    if (sample) sample.addEventListener('click', function () {
      inputLen.value = '24';
      if (inputCipher) inputCipher.value = 'AES-128';
      if (inputTrunc) inputTrunc.value = '8';
      go();
    });
    if (clearBtn) clearBtn.addEventListener('click', function () {
      inputLen.value = '';
      if (inputTrunc) inputTrunc.value = '16';
      go(); inputLen.focus();
    });
    go();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
