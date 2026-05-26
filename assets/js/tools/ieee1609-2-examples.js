// Synthetic IEEE 1609.2 certificate examples for the AmbiSecure parser tool.
//
// THESE ARE NOT REAL CERTIFICATES. They are hand-encoded synthetic byte
// sequences designed to round-trip cleanly through the AmbiSecure decoder.
// No real V2X deployment certificate is reproduced here. The key material,
// HashedId8 values, and signature scalars are all synthetic constants.
//
// Each example uses the COER subset our decoder supports:
//   - top-level preamble: 1 OPTIONAL (signature) + extension marker
//   - ToBeSigned with no OPTIONAL fields and no extension addition
//   - explicit certificate type
//   - ecdsaNistP256 verification key / signature
//
// Byte layout for the self-signed root, annotated:
//   40                            -- top preamble: ext=0, sig=present
//   03                            -- version 3
//   00                            -- type = explicit
//   01 00                         -- issuer = self / sha256
//   00                            -- ToBeSigned preamble (no OPTIONALs)
//   01 18 <24 ASCII>              -- id = name "AmbiSecure V2X Test Root"
//   00 00 00                      -- cracaId
//   00 00                         -- crlSeries
//   2A 00 8A 00                   -- start = 2026-05-01T00:00:00 UTC (Time32)
//   06 00 14                      -- duration = 20 years
//   00 00 04 <32x> <32y>          -- verifyKeyIndicator/PVK/uncompressedP256
//   00 00 <32r> <32s>             -- signature/ecdsaNistP256/rSig x-only + sSig

(function (root) {
  'use strict';

  // "AmbiSecure V2X Test Root"
  var ROOT_NAME_HEX =
    '416d6269536563757265205632582054657374526f6f74'.replace(/52006f6f74$/, '52 6f 6f 74'.replace(/ /g, ''));
  // The line above is over-cautious; use the direct hex:
  ROOT_NAME_HEX = '416d6269536563757265205632582054657374526f6f74'; // 23 chars
  // Wait — "AmbiSecure V2X Test Root" = 24 characters. Let me count properly.
  // A m b i S e c u r e _ V 2 X _ T e s t _ R o o t = 24 chars
  ROOT_NAME_HEX =
    '41' + // A
    '6d' + // m
    '62' + // b
    '69' + // i
    '53' + // S
    '65' + // e
    '63' + // c
    '75' + // u
    '72' + // r
    '65' + // e
    '20' + // space
    '56' + // V
    '32' + // 2
    '58' + // X
    '20' + // space
    '54' + // T
    '65' + // e
    '73' + // s
    '74' + // t
    '20' + // space
    '52' + // R
    '6f' + // o
    '6f' + // o
    '74';  // t

  function rep(byteHex, count) {
    var s = '';
    for (var i = 0; i < count; i++) s += byteHex;
    return s;
  }

  function seq(from, count) {
    var s = '';
    for (var i = 0; i < count; i++) s += ((from + i) & 0xff).toString(16).padStart(2, '0');
    return s;
  }

  // Self-signed root.
  var ROOT_X = seq(0x01, 32);
  var ROOT_Y = seq(0x21, 32);
  var ROOT_R = rep('f1', 32);
  var ROOT_S = rep('f2', 32);

  var ROOT_HEX =
    '40' +                            // top preamble: ext=0, signature present
    '03' +                            // version 3
    '00' +                            // type = explicit
    '01' + '00' +                     // issuer = self / sha256
    '00' +                            // ToBeSigned preamble (no OPTIONALs)
    '01' + '18' + ROOT_NAME_HEX +     // id = name, length 24
    '000000' +                        // cracaId
    '0000' +                          // crlSeries
    '2a008a00' +                      // start Time32 (2026-05-01 UTC)
    '06' + '0014' +                   // duration = 20 years
    '00' + '00' + '04' +              // verifyKeyIndicator / PVK / uncompressedP256
    ROOT_X + ROOT_Y +                 // ecdsaNistP256 key
    '00' + '00' +                     // signature / ecdsaNistP256Signature / rSig x-only
    ROOT_R + ROOT_S;                  // r and s

  // Enrolment Credential (long-lived, issued by the root).
  var EC_BIN_ID = '4543' + 'deadbeef' + '0001';   // "EC" + arbitrary
  var EC_HASHED_ID8 = '5d99b1a23f4c8e0e';         // synthetic — DOES NOT match the root above
  var EC_X = seq(0x40, 32);
  var EC_Y = seq(0x60, 32);
  var EC_R = rep('a1', 32);
  var EC_S = rep('a2', 32);
  var EC_HEX =
    '40' +
    '03' +
    '00' +
    '00' + EC_HASHED_ID8 +            // issuer = sha256AndDigest
    '00' +
    '02' + '08' + EC_BIN_ID +         // id = binaryId, length 8
    'a1b2c3' +                        // cracaId
    '0001' +                          // crlSeries
    '2a008a00' +                      // start
    '06' + '0005' +                   // duration = 5 years
    '00' + '00' + '04' + EC_X + EC_Y +
    '00' + '00' + EC_R + EC_S;

  // Pseudonymous Certificate (short-lived, issued by the AA).
  // PC uses linkageData CertificateId; linkageData SEQUENCE has 1 OPTIONAL
  // (group-linkage-value) — we emit preamble 0x00 (no optional present).
  // SEQUENCE body: iCert Uint16 + linkage-value 9-byte OCTET STRING fixed.
  var PC_LINKAGE_VALUE = '11223344556677889a';   // 9 bytes
  var PC_HASHED_ID8 = '7a3c92f10b8d4ee2';
  var PC_X = seq(0x80, 32);
  var PC_Y = seq(0xa0, 32);
  var PC_R = rep('b1', 32);
  var PC_S = rep('b2', 32);
  var PC_HEX =
    '40' +
    '03' +
    '00' +
    '00' + PC_HASHED_ID8 +
    '00' +
    '00' +                            // CertificateId CHOICE = linkageData
    '00' +                            // linkageData SEQUENCE preamble (no optional)
    '0042' +                          // iCert = 0x0042
    PC_LINKAGE_VALUE +                // linkage-value (9 bytes)
    '000000' +
    '0010' +                          // crlSeries
    '2a008c80' +                      // start
    '03' + '000a' +                   // duration = 10 minutes
    '00' + '00' + '04' + PC_X + PC_Y +
    '00' + '00' + PC_R + PC_S;

  function spaced(hex) {
    return hex.replace(/(.{2})/g, '$1 ').trim();
  }

  function pem(hex, label) {
    // Convert hex to base64 + wrap.
    var bin = '';
    for (var i = 0; i < hex.length; i += 2) {
      bin += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    var b64 = btoa(bin);
    var wrapped = b64.match(/.{1,64}/g).join('\n');
    return '-----BEGIN ' + label + '-----\n' + wrapped + '\n-----END ' + label + '-----';
  }

  root.IEEE1609Examples = {
    'self-signed-root': {
      label: 'Self-signed V2X Root CA',
      summary: 'A self-issued root certificate using sha256 self-reference, 20-year validity, ECDSA-P256 key.',
      hex: spaced(ROOT_HEX),
      pem: pem(ROOT_HEX, 'IEEE 1609.2 CERTIFICATE')
    },
    'enrolment-credential': {
      label: 'Enrolment Credential (EC)',
      summary: 'Long-lived enrolment credential issued under the root above (synthetic HashedId8 — mismatch is intentional).',
      hex: spaced(EC_HEX),
      pem: pem(EC_HEX, 'IEEE 1609.2 CERTIFICATE')
    },
    'pseudonymous-certificate': {
      label: 'Pseudonymous Certificate (PC)',
      summary: 'Short-lived PC using linkageData CertificateId. 10-minute validity, ECDSA-P256 signature.',
      hex: spaced(PC_HEX),
      pem: pem(PC_HEX, 'IEEE 1609.2 CERTIFICATE')
    },
    'malformed': {
      label: 'Malformed (truncated)',
      summary: 'A deliberately truncated root certificate. Demonstrates graceful partial decoding.',
      hex: spaced(ROOT_HEX.substring(0, 80)),
      pem: null
    }
  };
})(window);
