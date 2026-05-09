/* AmbiSecure — EMV tag dictionary explorer.
   Filterable directory of EMV (book 3 + 4 + 7-816) tags. Pasted hex tags
   are looked up; partial substring matches search names. */
(function () {
  'use strict';

  var TAGS = [
    { tag: '4F',   name: 'Application Identifier (AID) — card', src: 'EMV', notes: 'AID of the application present on the card.' },
    { tag: '50',   name: 'Application Label', src: 'EMV', notes: 'Mnemonic for the cardholder.' },
    { tag: '57',   name: 'Track 2 Equivalent Data', src: 'EMV', notes: 'Maps to mag stripe track 2 — PAN, expiry, service code.' },
    { tag: '5A',   name: 'Application PAN', src: 'EMV', notes: 'Primary Account Number, BCD-coded.' },
    { tag: '5F20', name: 'Cardholder Name', src: 'EMV' },
    { tag: '5F24', name: 'Application Expiration Date', src: 'EMV', notes: 'YYMMDD.' },
    { tag: '5F25', name: 'Application Effective Date', src: 'EMV' },
    { tag: '5F28', name: 'Issuer Country Code', src: 'EMV' },
    { tag: '5F2A', name: 'Transaction Currency Code', src: 'EMV' },
    { tag: '5F2D', name: 'Language Preference', src: 'EMV' },
    { tag: '5F30', name: 'Service Code', src: 'EMV' },
    { tag: '5F34', name: 'Application PAN Sequence Number', src: 'EMV' },
    { tag: '6F',   name: 'File Control Information (FCI) Template', src: 'EMV', notes: 'Returned in SELECT response.' },
    { tag: '70',   name: 'Application Elementary File (AEF) Data Template', src: 'EMV' },
    { tag: '71',   name: 'Issuer Script Template 1', src: 'EMV' },
    { tag: '72',   name: 'Issuer Script Template 2', src: 'EMV' },
    { tag: '73',   name: 'Directory Discretionary Template', src: 'EMV' },
    { tag: '77',   name: 'Response Message Template Format 2', src: 'EMV', notes: 'GENERATE AC response.' },
    { tag: '80',   name: 'Response Message Template Format 1', src: 'EMV' },
    { tag: '82',   name: 'Application Interchange Profile (AIP)', src: 'EMV', notes: '2 bytes: SDA, DDA, cardholder verif, terminal risk, issuer auth, CDA support.' },
    { tag: '83',   name: 'Command Template', src: 'EMV' },
    { tag: '84',   name: 'Dedicated File (DF) Name', src: 'EMV' },
    { tag: '86',   name: 'Issuer Script Command', src: 'EMV' },
    { tag: '87',   name: 'Application Priority Indicator', src: 'EMV' },
    { tag: '88',   name: 'Short File Identifier (SFI)', src: 'EMV' },
    { tag: '8A',   name: 'Authorisation Response Code', src: 'EMV' },
    { tag: '8C',   name: 'Card Risk Management DOL 1 (CDOL1)', src: 'EMV' },
    { tag: '8D',   name: 'Card Risk Management DOL 2 (CDOL2)', src: 'EMV' },
    { tag: '8E',   name: 'Cardholder Verification Method (CVM) List', src: 'EMV' },
    { tag: '8F',   name: 'Certification Authority Public Key Index', src: 'EMV' },
    { tag: '90',   name: 'Issuer Public Key Certificate', src: 'EMV' },
    { tag: '91',   name: 'Issuer Authentication Data', src: 'EMV' },
    { tag: '92',   name: 'Issuer Public Key Remainder', src: 'EMV' },
    { tag: '93',   name: 'Signed Static Application Data', src: 'EMV' },
    { tag: '94',   name: 'Application File Locator (AFL)', src: 'EMV' },
    { tag: '95',   name: 'Terminal Verification Results (TVR)', src: 'EMV' },
    { tag: '97',   name: 'Transaction Certificate DOL (TDOL)', src: 'EMV' },
    { tag: '98',   name: 'Transaction Certificate (TC) Hash', src: 'EMV' },
    { tag: '9A',   name: 'Transaction Date', src: 'EMV', notes: 'YYMMDD.' },
    { tag: '9B',   name: 'Transaction Status Information', src: 'EMV' },
    { tag: '9C',   name: 'Transaction Type', src: 'EMV', notes: '00=Goods/Services, 01=Cash, 09=Cashback, 20=Refund.' },
    { tag: '9D',   name: 'Directory Definition File (DDF) Name', src: 'EMV' },
    { tag: '9F02', name: 'Amount, Authorised (Numeric)', src: 'EMV' },
    { tag: '9F03', name: 'Amount, Other (Numeric)', src: 'EMV' },
    { tag: '9F05', name: 'Application Discretionary Data', src: 'EMV' },
    { tag: '9F07', name: 'Application Usage Control', src: 'EMV' },
    { tag: '9F08', name: 'Application Version Number — card', src: 'EMV' },
    { tag: '9F09', name: 'Application Version Number — terminal', src: 'EMV' },
    { tag: '9F0D', name: 'Issuer Action Code — Default', src: 'EMV' },
    { tag: '9F0E', name: 'Issuer Action Code — Denial', src: 'EMV' },
    { tag: '9F0F', name: 'Issuer Action Code — Online', src: 'EMV' },
    { tag: '9F10', name: 'Issuer Application Data (IAD)', src: 'EMV' },
    { tag: '9F11', name: 'Issuer Code Table Index', src: 'EMV' },
    { tag: '9F12', name: 'Application Preferred Name', src: 'EMV' },
    { tag: '9F1A', name: 'Terminal Country Code', src: 'EMV' },
    { tag: '9F1F', name: 'Track 1 Discretionary Data', src: 'EMV' },
    { tag: '9F20', name: 'Track 2 Discretionary Data', src: 'EMV' },
    { tag: '9F21', name: 'Transaction Time', src: 'EMV', notes: 'HHMMSS.' },
    { tag: '9F26', name: 'Application Cryptogram (ARQC/TC/AAC)', src: 'EMV', notes: 'The headline 8-byte cryptogram from GENERATE AC.' },
    { tag: '9F27', name: 'Cryptogram Information Data (CID)', src: 'EMV', notes: '0x80 ARQC, 0x40 TC, 0x00 AAC.' },
    { tag: '9F32', name: 'Issuer Public Key Exponent', src: 'EMV' },
    { tag: '9F33', name: 'Terminal Capabilities', src: 'EMV' },
    { tag: '9F34', name: 'CVM Results', src: 'EMV' },
    { tag: '9F35', name: 'Terminal Type', src: 'EMV' },
    { tag: '9F36', name: 'Application Transaction Counter (ATC)', src: 'EMV' },
    { tag: '9F37', name: 'Unpredictable Number', src: 'EMV' },
    { tag: '9F38', name: 'Processing Options Data Object List (PDOL)', src: 'EMV' },
    { tag: '9F40', name: 'Additional Terminal Capabilities', src: 'EMV' },
    { tag: '9F41', name: 'Transaction Sequence Counter', src: 'EMV' },
    { tag: '9F42', name: 'Application Currency Code', src: 'EMV' },
    { tag: '9F44', name: 'Application Currency Exponent', src: 'EMV' },
    { tag: '9F46', name: 'ICC Public Key Certificate', src: 'EMV' },
    { tag: '9F47', name: 'ICC Public Key Exponent', src: 'EMV' },
    { tag: '9F48', name: 'ICC Public Key Remainder', src: 'EMV' },
    { tag: '9F4A', name: 'Static Data Authentication Tag List', src: 'EMV' },
    { tag: '9F4B', name: 'Signed Dynamic Application Data', src: 'EMV' },
    { tag: '9F4C', name: 'ICC Dynamic Number', src: 'EMV' },
    { tag: '9F4E', name: 'Merchant Name and Location', src: 'EMV' },
    { tag: '9F66', name: 'Terminal Transaction Qualifiers (TTQ)', src: 'EMV ContactlessQVSDC' },
    { tag: '9F6E', name: 'Form Factor Indicator (Visa) / Third Party Data (MC)', src: 'EMV Contactless' },
    { tag: 'A5',   name: 'File Control Information (FCI) Proprietary Template', src: 'EMV' },
    { tag: 'BF0C', name: 'FCI Issuer Discretionary Data', src: 'EMV' }
  ];

  function init() {
    var input = AS.$('emv-input'), out = AS.$('emv-output');
    if (!input || !out) return;

    function render(filter) {
      filter = (filter || '').toLowerCase();
      var rows = TAGS.filter(function (t) {
        if (!filter) return true;
        return t.tag.toLowerCase().indexOf(filter) === 0
          || t.name.toLowerCase().indexOf(filter) !== -1
          || (t.notes || '').toLowerCase().indexOf(filter) !== -1;
      });
      if (rows.length === 0) {
        out.innerHTML = '<div class="placeholder">No EMV tags match.</div>';
        return;
      }
      out.innerHTML = '<div style="margin-bottom:14px;"><span class="tech-badge tech-badge--ok">' + rows.length + ' tag' + (rows.length === 1 ? '' : 's') + '</span></div>' +
        '<table style="width:100%; border-collapse:collapse; font-family:Source Sans 3,sans-serif; font-size:13px;">' +
        '<thead><tr style="background:var(--brand-soft);">' +
        '<th style="text-align:left;padding:8px 10px;font-family:JetBrains Mono,monospace;font-size:11.5px;letter-spacing:0.4px;width:80px;">Tag</th>' +
        '<th style="text-align:left;padding:8px 10px;font-family:Montserrat,sans-serif;font-size:11px;letter-spacing:0.4px;text-transform:uppercase;">Name</th>' +
        '<th style="text-align:left;padding:8px 10px;font-family:Montserrat,sans-serif;font-size:11px;letter-spacing:0.4px;text-transform:uppercase;">Notes</th>' +
        '</tr></thead><tbody>' +
        rows.map(function (t) {
          return '<tr style="border-bottom:1px dashed var(--line);">' +
            '<td style="padding:8px 10px;font-family:JetBrains Mono,monospace;font-weight:600;color:var(--brand-red-dark);">' + t.tag + '</td>' +
            '<td style="padding:8px 10px;color:var(--ink);">' + AS.escHTML(t.name) + '</td>' +
            '<td style="padding:8px 10px;color:var(--brand-grey);font-size:12.5px;">' + AS.escHTML(t.notes || '') + '</td>' +
            '</tr>';
        }).join('') + '</tbody></table>';
    }

    input.addEventListener('input', function () { render(input.value); });
    render('');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
