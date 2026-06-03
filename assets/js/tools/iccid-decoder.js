(function () {
  'use strict';

  // Small static map of ITU-T E.164 country/dialing codes commonly seen
  // in the country-code segment of an ICCID. Not exhaustive.
  var CC_MAP = {
    '1': 'US / Canada (NANP)',
    '7': 'Russia / Kazakhstan',
    '20': 'Egypt',
    '27': 'South Africa',
    '31': 'Netherlands',
    '33': 'France',
    '34': 'Spain',
    '39': 'Italy',
    '44': 'United Kingdom',
    '49': 'Germany',
    '52': 'Mexico',
    '55': 'Brazil',
    '61': 'Australia',
    '62': 'Indonesia',
    '65': 'Singapore',
    '81': 'Japan',
    '82': 'South Korea',
    '86': 'China',
    '91': 'India',
    '971': 'United Arab Emirates'
  };

  // Luhn (mod-10) check. Accepts the full digit string INCLUDING its
  // trailing check digit. Returns true when the string is self-consistent.
  function luhnValid(digits) {
    var s = String(digits).replace(/\D/g, '');
    if (s.length < 2) return false;
    var sum = 0, alt = false;
    for (var i = s.length - 1; i >= 0; i--) {
      var d = s.charCodeAt(i) - 48;
      if (alt) { d *= 2; if (d > 9) d -= 9; }
      sum += d;
      alt = !alt;
    }
    return sum % 10 === 0;
  }

  // Compute the Luhn check digit for a body (digits WITHOUT a check digit).
  function luhnCheckDigit(body) {
    var s = String(body).replace(/\D/g, '');
    var sum = 0, alt = true; // position to the left of the (future) check digit doubles first
    for (var i = s.length - 1; i >= 0; i--) {
      var d = s.charCodeAt(i) - 48;
      if (alt) { d *= 2; if (d > 9) d -= 9; }
      sum += d;
      alt = !alt;
    }
    return (10 - (sum % 10)) % 10;
  }

  // Resolve the country code by greedy 3-1 digit matching against CC_MAP.
  function resolveCountry(afterMii) {
    for (var len = 3; len >= 1; len--) {
      var cand = afterMii.slice(0, len);
      if (cand.length === len && CC_MAP.hasOwnProperty(cand)) {
        return { code: cand, name: CC_MAP[cand], length: len };
      }
    }
    // Unknown: fall back to first digit as a best-effort 1-digit slice.
    return { code: afterMii.slice(0, 1), name: 'unknown', length: 1 };
  }

  // Decode an ICCID string. Returns a structured object; throws on bad input.
  function decodeIccid(raw) {
    var digits = String(raw == null ? '' : raw).replace(/[\s\-_.]+/g, '');
    if (digits === '') throw new Error('Enter an ICCID (digits only, spaces and dashes are fine).');
    if (!/^[0-9]+$/.test(digits)) throw new Error('ICCID must contain digits only after removing spaces and dashes.');
    if (digits.length < 18 || digits.length > 20) {
      throw new Error('ICCID length is ' + digits.length + ' digits. Expected 18 to 20 (typically 19 or 20).');
    }

    var mii = digits.slice(0, 2);
    var miiIsTelecom = mii === '89';

    var afterMii = digits.slice(2);
    var country = resolveCountry(afterMii);
    var cc = country.code;
    var ccLen = country.length;

    // Remaining body after MII + country code = issuer identifier + account + (check).
    var rest = afterMii.slice(ccLen);

    // The trailing digit MAY be a Luhn check digit. We treat the last digit
    // as the candidate check digit and validate the whole string against it.
    var checkDigit = digits.slice(-1);
    var body = digits.slice(0, -1);
    var expected = luhnCheckDigit(body);
    var luhnOk = luhnValid(digits);

    // Issuer Identifier Number (IIN): MII + CC + issuer id. ITU-T E.118 does
    // not fix a single split for the issuer/account boundary across all
    // operators, so we report a conventional view: issuer = the next few
    // digits, account = remainder before the check digit. We expose the raw
    // segment so the user can apply their operator's known split.
    var bodyAfterCc = body.slice(2 + ccLen); // issuer + account (excludes MII, CC, and trailing check digit)

    return {
      input: raw,
      digits: digits,
      length: digits.length,
      mii: mii,
      miiIsTelecom: miiIsTelecom,
      countryCode: cc,
      countryName: country.name,
      countryDigits: ccLen,
      issuerAndAccount: bodyAfterCc,
      checkDigit: checkDigit,
      expectedCheckDigit: String(expected),
      luhnValid: luhnOk
    };
  }

  // ----- DUMMY (non-real) example ICCIDs, built programmatically -----
  // 89 (telecom) + 91 (India) + body, with a correct trailing Luhn digit.
  function buildSample() {
    var body = '89' + '91' + '0123456789012345'; // 20-digit MII+CC+body, last digit becomes check
    var trunk = body.slice(0, 19); // 19-digit trunk; append computed check -> 20 digits
    return trunk + String(luhnCheckDigit(trunk));
  }

  function badge(cls, text) {
    return '<span class="tech-badge ' + cls + '">' + AS.escHTML(text) + '</span>';
  }

  function row(label, value) {
    return '<div class="parsed-row"><span class="label">' + AS.escHTML(label) +
      '</span><div class="value" style="font-family:\'JetBrains Mono\',monospace;">' + AS.escHTML(value) + '</div></div>';
  }

  function init() {
    var input = AS.$('iccid-input'), output = AS.$('iccid-output');
    var sample = AS.$('iccid-sample'), clearBtn = AS.$('iccid-clear'), copyBtn = AS.$('iccid-copy');
    if (!input || !output) return;

    function lastResult() { return output.dataset.value || ''; }

    function go() {
      output.dataset.value = '';
      var raw = input.value;
      if (!raw.trim()) { AS.renderPlaceholder(output, 'Paste an ICCID to decode its E.118 fields.'); return; }
      var r;
      try { r = decodeIccid(raw); }
      catch (e) { AS.renderError(output, e.message); return; }

      var miiBadge = r.miiIsTelecom
        ? badge('tech-badge--ok', 'MII 89 — Telecom')
        : badge('tech-badge--warn', 'MII ' + r.mii + ' — not telecom (89 expected)');

      var luhnBadge = r.luhnValid
        ? badge('tech-badge--ok', 'Luhn OK')
        : badge('tech-badge--err', 'Luhn FAIL');

      var ccBadge = r.countryName === 'unknown'
        ? badge('tech-badge--warn', 'Country ' + r.countryCode + ' — unknown')
        : badge('tech-badge--info', 'Country ' + r.countryCode);

      var lenBadge = badge('tech-badge', r.length + ' digits');

      var plain = 'ICCID ' + r.digits +
        ' | MII=' + r.mii +
        ' | CC=' + r.countryCode + ' (' + r.countryName + ')' +
        ' | issuer+account=' + r.issuerAndAccount +
        ' | check=' + r.checkDigit + ' (expected ' + r.expectedCheckDigit + ')' +
        ' | Luhn=' + (r.luhnValid ? 'pass' : 'fail');
      output.dataset.value = plain;

      var luhnNote = r.luhnValid
        ? 'The trailing digit matches the Luhn checksum over the preceding digits.'
        : 'The trailing digit does not match. Expected check digit ' + r.expectedCheckDigit +
          '. Note: not every operator prints a Luhn-protected ICCID, and an 18/19-digit value may omit the check digit.';

      output.innerHTML =
        '<div style="margin-bottom:10px;">' + miiBadge + ' ' + ccBadge + ' ' + luhnBadge + ' ' + lenBadge + '</div>' +
        row('Normalized', r.digits) +
        row('MII (digits 1–2)', r.mii + (r.miiIsTelecom ? '  (telecommunications)' : '  (non-telecom)')) +
        row('Country code', r.countryCode + '  (' + r.countryName + ', ' + r.countryDigits + '-digit)') +
        row('Issuer + account', r.issuerAndAccount) +
        row('Check digit (last)', r.checkDigit) +
        row('Expected (Luhn)', r.expectedCheckDigit) +
        '<div class="parsed-row"><span class="label">Checksum</span><div class="value">' + AS.escHTML(luhnNote) + '</div></div>';
    }

    input.addEventListener('input', go);
    if (sample) sample.addEventListener('click', function () {
      input.value = buildSample();
      go();
    });
    if (clearBtn) clearBtn.addEventListener('click', function () { input.value = ''; go(); input.focus(); });
    AS.bindCopy(copyBtn, lastResult);
    go();
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { decodeIccid: decodeIccid, luhnValid: luhnValid, luhnCheckDigit: luhnCheckDigit, CC_MAP: CC_MAP };
  }
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  }
})();
