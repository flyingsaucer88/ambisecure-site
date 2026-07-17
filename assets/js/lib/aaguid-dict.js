(function (root) {
  'use strict';

  // Credential classification, per entry:
  //
  //   form: 'security-key'  discrete roaming authenticator (USB/NFC), keys in its own element
  //         'platform'      authenticator built into the host OS/device
  //
  //   cred: 'device-bound'  the credential cannot leave the authenticator that made it
  //         'synced'        a multi-device credential the provider may back up / sync
  //         'unclassified'  no documented basis to classify — say so rather than guess
  //
  // `cred` records the provider's DOCUMENTED behaviour for the model. It is not a
  // substitute for the real thing: Backup Eligible (BE) and Backup State (BS) are
  // flags in authenticatorData and are only known from an actual registration. A
  // relying party must read them there, per WebAuthn L3 5.8.1 — never infer them
  // from an AAGUID, and never from a vendor name.
  var DICT = {

    'cb69481e-8ff7-4039-93ec-0a2729a154a8': { vendor: 'Yubico', model: 'YubiKey 5 Series', usb: true, nfc: true, form: 'security-key', cred: 'device-bound' },
    'ee882879-721c-4913-9775-3dfcce97072a': { vendor: 'Yubico', model: 'YubiKey 5 Series with NFC', usb: true, nfc: true, form: 'security-key', cred: 'device-bound' },
    'fa2b99dc-9e39-4257-8f92-4a30d23c4118': { vendor: 'Yubico', model: 'YubiKey 5 NFC', usb: true, nfc: true, form: 'security-key', cred: 'device-bound' },
    '2fc0579f-8113-47ea-b116-bb5a8db9202a': { vendor: 'Yubico', model: 'YubiKey 5 Series with USB-C', usb: true, nfc: false, form: 'security-key', cred: 'device-bound' },
    '6d44ba9b-f6ec-2e49-b930-0c8fe920cb73': { vendor: 'Yubico', model: 'Security Key NFC by Yubico', usb: true, nfc: true, form: 'security-key', cred: 'device-bound' },
    '149a2021-8ef6-4133-96b8-81f8d5b7f1f5': { vendor: 'Yubico', model: 'Security Key by Yubico', usb: true, nfc: false, form: 'security-key', cred: 'device-bound' },
    'b92c3f9a-c014-4056-887f-140a2501163b': { vendor: 'Yubico', model: 'Security Key by Yubico', usb: true, nfc: false, form: 'security-key', cred: 'device-bound' },
    'c1f9a0bc-1dd2-404a-b27f-8e29047a43fd': { vendor: 'Yubico', model: 'YubiKey FIPS', usb: true, nfc: false, form: 'security-key', cred: 'device-bound' },

    '42b4fb4a-2866-43b2-9bf7-6c6669c2e5d3': { vendor: 'Google', model: 'Titan Security Key v2', usb: true, nfc: true, form: 'security-key', cred: 'device-bound' },

    // Windows Hello credentials are bound to the machine's TPM. Passkeys synced via
    // a Microsoft account are a separate, later surface and are not these AAGUIDs.
    '08987058-cadc-4b81-b6e1-30de50dcbe96': { vendor: 'Microsoft', model: 'Windows Hello (TPM-bound)', usb: false, nfc: false, form: 'platform', cred: 'device-bound' },
    '6028b017-b1d4-4c02-b4b3-afcdafc96bb2': { vendor: 'Microsoft', model: 'Windows Hello hardware authenticator', usb: false, nfc: false, form: 'platform', cred: 'device-bound' },
    '9ddd1817-af5a-4672-a2b9-3e3dd95000a9': { vendor: 'Microsoft', model: 'Windows Hello software authenticator', usb: false, nfc: false, form: 'platform', cred: 'device-bound' },

    // iCloud Keychain and Google Password Manager issue multi-device credentials:
    // they sync across the user's devices and register BE=1. Labelling these
    // device-bound is the single most consequential error this directory can make.
    'dd4ec289-e01d-41c9-bb89-70fa845d4bf2': { vendor: 'Apple', model: 'iCloud Keychain (Managed)', usb: false, nfc: false, form: 'platform', cred: 'synced' },
    'fbfc3007-154e-4ecc-8c0b-6e020557d7bd': { vendor: 'Apple', model: 'iCloud Keychain', usb: false, nfc: false, form: 'platform', cred: 'synced' },
    'ea9b8d66-4d01-1d21-3ce4-b6b48cb575d4': { vendor: 'Google', model: 'Google Password Manager', usb: false, nfc: false, form: 'platform', cred: 'synced' },

    '833b721a-ff5f-4d00-bb2e-bdda3ec01e29': { vendor: 'Feitian', model: 'ePass FIDO USB-A', usb: true, nfc: false, form: 'security-key', cred: 'device-bound' },
    'ee041bce-25e5-4cdb-8f86-897fd6418464': { vendor: 'Feitian', model: 'ePass FIDO NFC', usb: false, nfc: true, form: 'security-key', cred: 'device-bound' },
    '12ded745-4bed-47d4-abaa-e713f51d6393': { vendor: 'Feitian', model: 'AllinPass FIDO2', usb: true, nfc: true, form: 'security-key', cred: 'device-bound' },

    '8876631b-d4a0-427f-5773-0ec71c9e0279': { vendor: 'SoloKeys', model: 'Solo (Hacker)', usb: true, nfc: false, form: 'security-key', cred: 'device-bound' },
    '8c97a730-3f7b-41a6-87d6-1e9b62bda6f0': { vendor: 'SoloKeys', model: 'Somu', usb: true, nfc: false, form: 'security-key', cred: 'device-bound' },

    'd61d3b87-3e7c-4aea-9c50-441c371903ad': { vendor: 'Nitrokey', model: 'Nitrokey FIDO2', usb: true, nfc: false, form: 'security-key', cred: 'device-bound' },

    'ab32f0c6-2239-afbb-c470-d2ef4e254db7': { vendor: 'Token2', model: 'Token2 T2F2', usb: true, nfc: true, form: 'security-key', cred: 'device-bound' },

    '0eb05afb-c0e8-4e3f-a5dc-f0fd3b6d5d52': { vendor: 'OnlyKey', model: 'OnlyKey', usb: true, nfc: false, form: 'security-key', cred: 'device-bound' }

    // AmbiSecure AAGUIDs are assigned per FIDO certification and are not listed
    // here until the registered value is published in the FIDO MDS. Do not add a
    // sample, placeholder or provisional value: this dictionary is consumed by the
    // public AAGUID lookup and MDS explorer, and an invented identifier there reads
    // as fact.
  };

  function format(bytes) {
    if (!bytes || bytes.length !== 16) return null;
    function h(b) { return (b < 16 ? '0' : '') + b.toString(16); }
    var s = '';
    for (var i = 0; i < 16; i++) s += h(bytes[i]);
    return s.substr(0, 8) + '-' + s.substr(8, 4) + '-' + s.substr(12, 4) + '-' + s.substr(16, 4) + '-' + s.substr(20, 12);
  }
  function lookup(aaguid) {
    if (!aaguid) return null;
    var key = String(aaguid).toLowerCase().replace(/[^0-9a-f]/g, '');
    if (key.length !== 32) return null;
    var canon = key.substr(0, 8) + '-' + key.substr(8, 4) + '-' + key.substr(12, 4) + '-' + key.substr(16, 4) + '-' + key.substr(20, 12);
    return DICT[canon] || null;
  }
  function isZero(bytes) {
    if (!bytes) return false;
    for (var i = 0; i < bytes.length; i++) if (bytes[i] !== 0) return false;
    return true;
  }
  function entries() {
    var out = [];
    Object.keys(DICT).forEach(function (k) {
      var e = DICT[k];
      out.push({
        aaguid: k, vendor: e.vendor, model: e.model, usb: e.usb, nfc: e.nfc,
        // Fall back to 'unclassified' rather than guessing when an entry
        // carries no documented classification.
        form: e.form || 'unclassified',
        cred: e.cred || 'unclassified'
      });
    });
    out.sort(function (a, b) { return a.vendor.localeCompare(b.vendor) || a.model.localeCompare(b.model); });
    return out;
  }

  // Presentation mapping for the credential class. Kept next to the data so the
  // explorer and the lookup tool cannot drift apart.
  var CRED_LABEL = {
    'device-bound': { label: 'Device-bound', cls: 'tech-badge--ok', title: 'Documented as non-syncable: the credential stays on this authenticator. Confirm with the BE flag in authenticatorData.' },
    'synced': { label: 'Synced', cls: 'tech-badge--info', title: 'Documented as a multi-device credential the provider may sync or back up. Expect BE=1 in authenticatorData.' },
    'unclassified': { label: 'Unclassified', cls: 'tech-badge--muted', title: 'No documented basis to classify this model. Read the BE and BS flags from authenticatorData.' }
  };
  var FORM_LABEL = {
    'security-key': 'Security key',
    'platform': 'Platform',
    'unclassified': 'Unclassified'
  };
  function credBadge(cred) { return CRED_LABEL[cred] || CRED_LABEL.unclassified; }
  function formLabel(form) { return FORM_LABEL[form] || FORM_LABEL.unclassified; }

  root.AmbiSecureAAGUID = {
    lookup: lookup, format: format, isZero: isZero, entries: entries,
    credBadge: credBadge, formLabel: formLabel
  };
})(typeof window !== 'undefined' ? window : globalThis);
