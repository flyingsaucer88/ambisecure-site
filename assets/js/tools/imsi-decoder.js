(function () {
  'use strict';

  // Small, deliberately partial MCC -> country map. NOT a full operator (MNC) table.
  var MCC_NAMES = {
    '202': 'Greece', '208': 'France', '214': 'Spain', '222': 'Italy',
    '226': 'Romania', '230': 'Czech Republic', '234': 'United Kingdom',
    '235': 'United Kingdom', '238': 'Denmark', '240': 'Sweden',
    '242': 'Norway', '244': 'Finland', '262': 'Germany', '268': 'Portugal',
    '272': 'Ireland', '286': 'Turkey', '310': 'United States',
    '311': 'United States', '312': 'United States', '313': 'United States',
    '314': 'United States', '315': 'United States', '316': 'United States',
    '404': 'India', '405': 'India', '406': 'India', '425': 'Israel',
    '440': 'Japan', '441': 'Japan', '450': 'South Korea', '454': 'Hong Kong',
    '460': 'China', '466': 'Taiwan', '505': 'Australia', '510': 'Indonesia',
    '525': 'Singapore', '655': 'South Africa', '724': 'Brazil'
  };

  // 3-digit MNC is the norm in NANP regions (MCC 310-316) and a few others.
  // Elsewhere 2-digit MNC is common. This is a heuristic only.
  var THREE_DIGIT_MNC_MCC = {
    '310': true, '311': true, '312': true, '313': true, '314': true,
    '315': true, '316': true, '302': true, '344': true, '348': true,
    '365': true, '376': true, '405': true
  };

  function onlyDigits(s) {
    return String(s == null ? '' : s).replace(/[\s-]+/g, '');
  }

  // Core decoder. mncMode is 'auto' | '2' | '3'. Pure logic, no DOM.
  function decodeImsi(raw, mncMode) {
    var s = onlyDigits(raw);
    if (s === '') throw new Error('Enter an IMSI (digits only).');
    if (!/^[0-9]+$/.test(s)) throw new Error('IMSI must contain digits 0-9 only.');
    if (s.length > 15) throw new Error('IMSI is too long: ' + s.length + ' digits (maximum is 15).');
    if (s.length < 6) throw new Error('IMSI is too short: ' + s.length + ' digits (need at least MCC + a partial MNC).');

    var mcc = s.slice(0, 3);

    var mncLen;
    if (mncMode === '2') mncLen = 2;
    else if (mncMode === '3') mncLen = 3;
    else mncLen = THREE_DIGIT_MNC_MCC[mcc] ? 3 : 2; // auto heuristic

    var mnc = s.slice(3, 3 + mncLen);
    var msin = s.slice(3 + mncLen);

    var notes = [];
    if (s.length !== 15) {
      notes.push('Length is ' + s.length + ' digits; a complete IMSI is normally 15 digits (MSIN may be shorter in some networks).');
    }
    if (mnc.length < mncLen) {
      notes.push('Not enough digits for a ' + mncLen + '-digit MNC — the MNC shown is truncated.');
    }
    if (mncMode === 'auto') {
      notes.push('MNC length was guessed (' + mncLen + ' digits) from the MCC. MNC length is region-dependent; set it manually with the selector if you know it.');
    }

    return {
      input: s,
      mcc: mcc,
      mnc: mnc,
      msin: msin,
      mncLength: mncLen,
      country: MCC_NAMES[mcc] || null,
      notes: notes
    };
  }

  function init() {
    var input = AS.$('imsi-input'), output = AS.$('imsi-output');
    var mncSel = AS.$('imsi-mnc'), sample = AS.$('imsi-sample'), clearBtn = AS.$('imsi-clear'), copyBtn = AS.$('imsi-copy');
    if (!input || !output) return;

    function lastResult() { return output.dataset.value || ''; }

    function go() {
      output.dataset.value = '';
      var raw = input.value;
      if (!raw.trim()) { AS.renderPlaceholder(output, 'Enter an IMSI to split into MCC / MNC / MSIN.'); return; }
      try {
        var r = decodeImsi(raw, mncSel.value);
        var countryLabel = r.country ? r.country : 'not in built-in map';
        var copyText = 'MCC=' + r.mcc + ' MNC=' + r.mnc + ' MSIN=' + r.msin +
          ' (country: ' + countryLabel + ')';
        output.dataset.value = copyText;

        var html = '<div style="margin-bottom:10px;">' +
          '<span class="tech-badge tech-badge--ok">IMSI ' + r.input.length + ' digits</span> ' +
          '<span class="tech-badge tech-badge--info">MNC ' + r.mncLength + '-digit</span></div>';

        html += '<div class="parsed-row"><span class="label">MCC</span><div class="value" style="font-family:\'JetBrains Mono\',monospace;">' +
          AS.escHTML(r.mcc) + '</div></div>';
        html += '<div class="parsed-row"><span class="label">Country</span><div class="value">' +
          AS.escHTML(r.country ? r.country : 'Not in this tool’s small MCC map') + '</div></div>';
        html += '<div class="parsed-row"><span class="label">MNC</span><div class="value" style="font-family:\'JetBrains Mono\',monospace;">' +
          AS.escHTML(r.mnc || '(none)') + '</div></div>';
        html += '<div class="parsed-row"><span class="label">Operator</span><div class="value">Not resolved &mdash; MNC&rarr;operator lookup is out of scope (see notes below).</div></div>';
        html += '<div class="parsed-row"><span class="label">MSIN</span><div class="value" style="font-family:\'JetBrains Mono\',monospace;word-break:break-all;">' +
          AS.escHTML(r.msin || '(none)') + '</div></div>';

        if (r.notes.length) {
          var items = '';
          for (var i = 0; i < r.notes.length; i++) {
            items += '<li>' + AS.escHTML(r.notes[i]) + '</li>';
          }
          html += '<div style="margin-top:12px;"><span class="tech-badge tech-badge--warn">NOTES</span>' +
            '<ul style="margin:8px 0 0;padding-left:20px;font-size:13.5px;line-height:1.6;">' + items + '</ul></div>';
        }

        output.innerHTML = html;
      } catch (e) {
        AS.renderError(output, e.message);
      }
    }

    input.addEventListener('input', go);
    mncSel.addEventListener('change', go);
    if (sample) sample.addEventListener('click', function () {
      // Dummy IMSI: MCC 404 (India), 2-digit MNC, fabricated MSIN. Not a real subscriber.
      mncSel.value = 'auto';
      input.value = '404451234567890';
      go();
    });
    if (clearBtn) clearBtn.addEventListener('click', function () { input.value = ''; go(); input.focus(); });
    AS.bindCopy(copyBtn, lastResult);
    go();
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { decodeImsi: decodeImsi, MCC_NAMES: MCC_NAMES };
  }
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  }
})();
