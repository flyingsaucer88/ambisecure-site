(function () {
  'use strict';

  // Normalise a candidate EID: strip whitespace and common separators.
  function normalize(s) {
    return String(s == null ? '' : s).replace(/[\s\-_.:]+/g, '');
  }

  // Luhn (mod-10) check over an all-digit string. The EID is 32 digits where
  // the final 2 are check digits computed with Luhn over the first 30 (GSMA
  // SGP.02 §2.2.2 / ITU-T E.118 style). We compute the expected check value and
  // compare. Returns { valid, expected, given }.
  function luhnCheck32(digits30) {
    // Append "00" and run Luhn; the remainder gives the two check digits such
    // that the full 32-digit number is Luhn-valid.
    var base = digits30 + '00';
    var sum = 0;
    var len = base.length;
    // Luhn doubling: rightmost digit is position 1 (not doubled).
    for (var i = 0; i < len; i++) {
      var d = base.charCodeAt(len - 1 - i) - 48;
      if (i % 2 === 1) { // every second from the right gets doubled
        d *= 2;
        if (d > 9) d -= 9;
      }
      sum += d;
    }
    var mod = sum % 10;
    var check = (10 - mod) % 10;
    // Two check digits: spec uses a 2-digit check; the standard construction is
    // that the 32-digit value passes a Luhn check. The 2-digit check is the
    // value that makes the whole string Luhn-valid: a leading '0' plus the
    // single Luhn digit.
    var checkStr = '0' + String(check);
    return { check: checkStr, single: String(check) };
  }

  // Validate that a full 32-digit string passes the Luhn check over itself.
  function luhnValid(digits32) {
    var sum = 0;
    var len = digits32.length;
    for (var i = 0; i < len; i++) {
      var d = digits32.charCodeAt(len - 1 - i) - 48;
      if (i % 2 === 1) {
        d *= 2;
        if (d > 9) d -= 9;
      }
      sum += d;
    }
    return sum % 10 === 0;
  }

  // Decode an EID. Returns a structured object; throws on malformed input.
  function decodeEid(raw) {
    var eid = normalize(raw);
    if (eid.length === 0) throw new Error('Enter a 32-digit EID.');
    if (!/^[0-9]+$/.test(eid)) throw new Error('An EID is 32 decimal digits — non-digit characters found.');
    if (eid.length !== 32) {
      throw new Error('An EID must be exactly 32 digits — got ' + eid.length + '.');
    }

    var mii = eid.slice(0, 2);            // Major Industry Identifier
    var version = eid.slice(2, 5);        // EID version / format
    var eumId = eid.slice(5, 13);         // EUM (manufacturer) identifier per SGP.29 / GSMA OID registry
    var custom = eid.slice(13, 18);       // EUM-specific (issuer/profile/site)
    var serial = eid.slice(18, 30);       // EUM-assigned serial number
    var checkDigits = eid.slice(30, 32);  // 2 check digits

    var first30 = eid.slice(0, 30);
    var computed = luhnCheck32(first30);
    var fullValid = luhnValid(eid);

    return {
      eid: eid,
      grouped: eid.replace(/(.{4})/g, '$1 ').trim(),
      fields: {
        mii: mii,
        version: version,
        eumId: eumId,
        custom: custom,
        serial: serial,
        checkDigits: checkDigits
      },
      miiOk: mii === '89',
      checkValid: fullValid,
      expectedCheck: computed.check
    };
  }

  function row(label, value, mono) {
    return '<div class="parsed-row"><span class="label">' + AS.escHTML(label) +
      '</span><div class="value"' + (mono ? ' style="font-family:\'JetBrains Mono\',monospace;"' : '') +
      '>' + AS.escHTML(value) + '</div></div>';
  }

  function render(output, r) {
    var f = r.fields;
    var badges = '<div style="margin-bottom:12px;">';
    badges += '<span class="tech-badge tech-badge--ok">32 DIGITS</span> ';
    badges += r.miiOk
      ? '<span class="tech-badge tech-badge--ok">MII 89 (telecom)</span> '
      : '<span class="tech-badge tech-badge--warn">MII ' + AS.escHTML(f.mii) + ' (expected 89)</span> ';
    badges += r.checkValid
      ? '<span class="tech-badge tech-badge--ok">Luhn OK</span>'
      : '<span class="tech-badge tech-badge--err">Luhn FAIL</span>';
    badges += '</div>';

    var grouped = '<pre style="white-space:pre-wrap;word-break:break-all;font-family:\'JetBrains Mono\',monospace;font-size:14px;line-height:1.6;margin-bottom:12px;">' +
      AS.escHTML(r.grouped) + '</pre>';

    var fieldsHtml =
      row('MII (digits 1–2)', f.mii + (r.miiOk ? '  — telecommunications, per ITU-T E.118' : '  — unexpected (telecom EIDs use 89)'), true) +
      row('Version (3–5)', f.version + '  — EID format/version field', true) +
      row('EUM ID (6–13)', f.eumId + '  — eUICC manufacturer (issuer-specific allocation)', true) +
      row('EUM custom (14–18)', f.custom + '  — issuer-specific (not publicly specified)', true) +
      row('Serial (19–30)', f.serial + '  — EUM-assigned, issuer-specific (not publicly specified)', true) +
      row('Check digits (31–32)', f.checkDigits, true);

    var checkNote = r.checkValid
      ? row('Check status', 'Valid — the full 32-digit value passes the Luhn (mod-10) check.')
      : row('Check status', 'Invalid — expected trailing check "' + r.expectedCheck + '" for the first 30 digits to satisfy Luhn.');

    output.dataset.value = r.eid + '\nMII=' + f.mii + ' version=' + f.version +
      ' eum=' + f.eumId + ' custom=' + f.custom + ' serial=' + f.serial +
      ' check=' + f.checkDigits + ' luhn=' + (r.checkValid ? 'OK' : 'FAIL');

    output.innerHTML = badges + grouped + fieldsHtml + checkNote;
  }

  function init() {
    var input = AS.$('eid-input'), output = AS.$('eid-output');
    var sample = AS.$('eid-sample'), clearBtn = AS.$('eid-clear'), copyBtn = AS.$('eid-copy');
    if (!input || !output) return;

    function go() {
      output.dataset.value = '';
      var raw = input.value;
      if (!raw.trim()) { AS.renderPlaceholder(output, 'Paste a 32-digit EID to decode.'); return; }
      try {
        render(output, decodeEid(raw));
      } catch (e) {
        AS.renderError(output, e.message);
      }
    }

    input.addEventListener('input', go);
    if (sample) sample.addEventListener('click', function () {
      // Dummy example EID (not a real device). MII 89, version 049, then a
      // valid Luhn check is computed below so the demo validates cleanly.
      var first30 = '89' + '049' + '03200' + '0000' + '00000000' + '0123';
      // Pad/trim defensively to 30, then append the correct 2-digit check.
      first30 = (first30 + '000000000000000000000000000000').slice(0, 30);
      var sum = 0, base = first30 + '00', len = base.length;
      for (var i = 0; i < len; i++) {
        var d = base.charCodeAt(len - 1 - i) - 48;
        if (i % 2 === 1) { d *= 2; if (d > 9) d -= 9; }
        sum += d;
      }
      var check = (10 - (sum % 10)) % 10;
      input.value = first30 + '0' + String(check);
      go();
    });
    if (clearBtn) clearBtn.addEventListener('click', function () { input.value = ''; go(); input.focus(); });
    AS.bindCopy(copyBtn, function () { return output.dataset.value || ''; });
    go();
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { decodeEid: decodeEid, luhnValid: luhnValid, normalize: normalize };
  }
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  }
})();
