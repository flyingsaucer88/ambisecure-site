// IEEE 1609.2 / ETSI TS 103 097 COER-subset decoder.
// Client-side only. No network. No telemetry.
//
// Decodes the certificate structures named in the IEEE 1609.2 schema:
//   Certificate, ToBeSignedCertificate, IssuerIdentifier, CertificateId,
//   ValidityPeriod, Duration, VerificationKeyIndicator, PublicVerificationKey,
//   EccP256CurvePoint, EccP384CurvePoint, Signature (ECDSA variants).
//
// Designed to FAIL GRACEFULLY: every decode step is try/catch wrapped, and a
// partial tree is returned with a clear "unable to decode beyond this point"
// node when the byte stream goes off-spec.
//
// This is a SUBSET decoder. It does not attempt to decode every optional V2X
// extension (GeographicRegion, SequenceOfPsidSsp permission encodings, etc.).
// When a present OPTIONAL is not handled it is flagged as
// "field present, opaque" and parsing continues if possible.
//
// References: IEEE 1609.2-2022 clauses 6.4 / 6.5, ETSI TS 103 097.

(function (root) {
  'use strict';

  // ---------- byte stream reader ----------
  function Reader(bytes) {
    this.b = bytes;
    this.p = 0;
  }
  Reader.prototype.remaining = function () { return this.b.length - this.p; };
  Reader.prototype.peek = function () {
    if (this.p >= this.b.length) throw new Error('EOF at byte ' + this.p);
    return this.b[this.p];
  };
  Reader.prototype.u8 = function () {
    if (this.p >= this.b.length) throw new Error('Short read u8 at ' + this.p);
    return this.b[this.p++];
  };
  Reader.prototype.u16 = function () {
    if (this.p + 2 > this.b.length) throw new Error('Short read u16 at ' + this.p);
    var v = (this.b[this.p] << 8) | this.b[this.p + 1];
    this.p += 2;
    return v >>> 0;
  };
  Reader.prototype.u32 = function () {
    if (this.p + 4 > this.b.length) throw new Error('Short read u32 at ' + this.p);
    var v = (this.b[this.p] * 0x1000000) + (this.b[this.p + 1] << 16) +
            (this.b[this.p + 2] << 8) + this.b[this.p + 3];
    this.p += 4;
    return v >>> 0;
  };
  Reader.prototype.u64Hex = function () {
    // Returns the 8 bytes as hex; JS Number cannot hold 64 bits safely.
    if (this.p + 8 > this.b.length) throw new Error('Short read u64 at ' + this.p);
    var s = '';
    for (var i = 0; i < 8; i++) s += this.b[this.p + i].toString(16).padStart(2, '0');
    this.p += 8;
    return s.toUpperCase();
  };
  Reader.prototype.bytes = function (n) {
    if (this.p + n > this.b.length) throw new Error('Short read ' + n + ' bytes at ' + this.p);
    var out = this.b.subarray(this.p, this.p + n);
    this.p += n;
    return out;
  };

  // COER length determinant: short form 0..127, long form 1xxxxxxx = byte count.
  Reader.prototype.length = function () {
    var first = this.u8();
    if ((first & 0x80) === 0) return first;
    var n = first & 0x7f;
    if (n === 0) throw new Error('Indefinite length not permitted in COER at ' + (this.p - 1));
    if (n > 4) throw new Error('Length determinant > 32 bits not supported at ' + (this.p - 1));
    var v = 0;
    for (var i = 0; i < n; i++) v = (v * 256) + this.u8();
    return v;
  };

  // COER preamble bits for SEQUENCE with N OPTIONALs (and an extension marker).
  // Returns { ext: bool, opt: [bool * count] }.
  // `extensible` adds the high extension-presence bit.
  Reader.prototype.preamble = function (count, extensible) {
    var bits = count + (extensible ? 1 : 0);
    var bytes = Math.ceil(bits / 8);
    var raw = [];
    for (var i = 0; i < bytes; i++) raw.push(this.u8());
    // Bits read MSB-first across the bytes.
    var out = [];
    for (var k = 0; k < bits; k++) {
      var byteIdx = (k >> 3);
      var bitIdx = 7 - (k & 7);
      out.push((raw[byteIdx] >> bitIdx) & 1);
    }
    var ext = extensible ? !!out[0] : false;
    var opt = extensible ? out.slice(1) : out;
    return { ext: ext, opt: opt };
  };

  function toHex(bytes) {
    var s = '';
    for (var i = 0; i < bytes.length; i++) s += bytes[i].toString(16).padStart(2, '0');
    return s.toUpperCase();
  }

  // ---------- input format detection + normalisation ----------
  function inputToBytes(text) {
    var t = String(text || '').trim();
    if (!t) throw new Error('Empty input.');
    // PEM-style: strip BEGIN/END lines + whitespace, then base64.
    if (/-----BEGIN /.test(t)) {
      t = t.replace(/-----BEGIN [^-]+-----/g, '')
           .replace(/-----END [^-]+-----/g, '')
           .replace(/\s+/g, '');
      return base64ToBytes(t, 'PEM');
    }
    // Hex: all whitespace + 0x prefixes stripped, even count.
    var hex = t.replace(/0x/gi, '').replace(/\s+/g, '');
    if (/^[0-9a-fA-F]+$/.test(hex)) {
      if (hex.length % 2 !== 0) throw new Error('Hex has odd length.');
      return hexToBytes(hex, 'Hex');
    }
    // Otherwise try base64.
    var b64 = t.replace(/\s+/g, '');
    if (/^[A-Za-z0-9+/=_-]+$/.test(b64)) return base64ToBytes(b64, 'Base64');
    throw new Error('Input is neither hex nor base64.');
  }

  function hexToBytes(hex) {
    var out = new Uint8Array(hex.length / 2);
    for (var i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
    return out;
  }

  function base64ToBytes(s) {
    // accept urlsafe
    s = s.replace(/-/g, '+').replace(/_/g, '/');
    var pad = s.length % 4;
    if (pad) s += '===='.substring(pad);
    var bin = atob(s);
    var out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  function detectFormat(text) {
    var t = String(text || '').trim();
    if (/-----BEGIN /.test(t)) return 'PEM (base64)';
    var hex = t.replace(/0x/gi, '').replace(/\s+/g, '');
    if (/^[0-9a-fA-F]+$/.test(hex) && hex.length % 2 === 0) return 'Hex';
    var b64 = t.replace(/\s+/g, '');
    if (/^[A-Za-z0-9+/=_-]+$/.test(b64)) return 'Base64';
    return 'Unknown';
  }

  // ---------- IEEE 1609.2 type decoders ----------
  //
  // Each decoder returns a tree node:
  //   { name, value, ref, children?, error?, raw? }
  // The reader is mutated as decoding proceeds. On error, decoders throw;
  // the top-level decodeCertificate() catches and converts to an error node.

  function node(name, value, ref, children) {
    return { name: name, value: value, ref: ref, children: children || null };
  }

  // CertificateType ENUMERATED { explicit (0), implicit (1) }
  function decodeCertificateType(r) {
    var v = r.u8();
    var label = v === 0 ? 'explicit' : v === 1 ? 'implicit' : ('UNKNOWN (' + v + ')');
    return node('type', label, 'IEEE 1609.2 §6.4.6 CertificateType');
  }

  // IssuerIdentifier ::= CHOICE { sha256AndDigest HashedId8, self HashAlgorithm, sha384AndDigest HashedId8 }
  function decodeIssuerIdentifier(r) {
    var tag = r.u8();
    var n = node('issuer', null, 'IEEE 1609.2 §6.4.7 IssuerIdentifier', []);
    if (tag === 0x00) {
      // sha256AndDigest HashedId8 (8 bytes)
      var h = r.u64Hex();
      n.value = 'sha256AndDigest';
      n.children.push(node('HashedId8', h, 'last 8 bytes of SHA-256 of issuer cert'));
    } else if (tag === 0x01) {
      // self HashAlgorithm ENUMERATED { sha256 (0), reserved (1), sha384 (2) }
      var ha = r.u8();
      var haLabel = ha === 0 ? 'sha256' : ha === 2 ? 'sha384' : ('UNKNOWN (' + ha + ')');
      n.value = 'self (self-signed)';
      n.children.push(node('hashAlgorithm', haLabel, 'IEEE 1609.2 §6.3.10 HashAlgorithm'));
    } else if (tag === 0x02) {
      var h2 = r.u64Hex();
      n.value = 'sha384AndDigest';
      n.children.push(node('HashedId8', h2, 'last 8 bytes of SHA-384 of issuer cert'));
    } else {
      throw new Error('Unknown IssuerIdentifier CHOICE selector 0x' + tag.toString(16));
    }
    return n;
  }

  // CertificateId ::= CHOICE { linkageData LinkageData, name Hostname,
  //                            binaryId OCTET STRING(SIZE(1..64)), none NULL,
  //                            ... }
  function decodeCertificateId(r) {
    var tag = r.u8();
    var n = node('id', null, 'IEEE 1609.2 §6.4.8 CertificateId', []);
    if (tag === 0x00) {
      // linkageData LinkageData ::= SEQUENCE { iCert, linkage-value, group-linkage-value OPTIONAL }
      // For brevity: read iCert (Uint16), linkage-value (9 bytes OCTET STRING fixed), skip optional.
      // Modelled simply: read 2 + 9 = 11 bytes for the base structure, plus preamble.
      var pre = r.preamble(1, false);
      var iCert = r.u16();
      var lv = r.bytes(9);
      n.value = 'linkageData';
      n.children.push(node('iCert', '0x' + iCert.toString(16).padStart(4, '0'),
        'Uint16 group counter'));
      n.children.push(node('linkage-value', toHex(lv),
        '9-byte LinkageValue (IEEE 1609.2 §6.5.7)'));
      if (pre.opt[0]) {
        // group-linkage-value present — skip with annotation
        n.children.push(node('group-linkage-value', '(present — opaque in this view)',
          'IEEE 1609.2 §6.5.4 GroupLinkageValue'));
        // We cannot safely continue without consuming the bytes; throw so the caller can stop cleanly.
        throw new Error('group-linkage-value not decoded in this build');
      }
    } else if (tag === 0x01) {
      // name Hostname ::= UTF8String(SIZE(0..32))
      var L = r.length();
      var nameBytes = r.bytes(L);
      var nameStr = utf8Decode(nameBytes);
      n.value = 'name';
      n.children.push(node('Hostname', nameStr, 'UTF8String, max 32 octets'));
    } else if (tag === 0x02) {
      var bL = r.length();
      var bin = r.bytes(bL);
      n.value = 'binaryId';
      n.children.push(node('OCTET STRING', toHex(bin), 'binaryId, 1..64 octets'));
    } else if (tag === 0x03) {
      n.value = 'none';
      n.children.push(node('NULL', '(empty)', 'IEEE 1609.2 §6.4.8'));
    } else {
      throw new Error('Unknown CertificateId CHOICE selector 0x' + tag.toString(16));
    }
    return n;
  }

  function utf8Decode(bytes) {
    try {
      return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    } catch (e) {
      return '<invalid UTF-8>';
    }
  }

  // ValidityPeriod ::= SEQUENCE { start Time32, duration Duration }
  function decodeValidityPeriod(r) {
    var start = r.u32();
    var dur = decodeDuration(r);
    var n = node('validityPeriod', null, 'IEEE 1609.2 §6.4.9 ValidityPeriod', []);
    // Time32 is seconds since 2004-01-01T00:00:00 UTC per IEEE 1609.2.
    var EPOCH = Date.UTC(2004, 0, 1, 0, 0, 0) / 1000;
    var startDate;
    try {
      startDate = new Date((EPOCH + start) * 1000).toISOString().replace('.000', '');
    } catch (e) {
      startDate = '<invalid Time32>';
    }
    n.children.push(node('start', startDate + ' UTC',
      'Time32 seconds since 2004-01-01T00:00:00 UTC (' + start + ')'));
    n.children.push(dur);
    return n;
  }

  // Duration ::= CHOICE { microseconds .. years } each Uint16.
  var DURATION_UNITS = ['microseconds', 'milliseconds', 'seconds', 'minutes',
                        'hours', 'sixtyHours', 'years'];
  function decodeDuration(r) {
    var tag = r.u8();
    var v = r.u16();
    var unit = DURATION_UNITS[tag] || ('UNKNOWN (' + tag + ')');
    return node('duration', v + ' ' + unit, 'IEEE 1609.2 §6.4.10 Duration');
  }

  // EccP256CurvePoint ::= CHOICE { x-only(0), fill(1), compressed-y-0(2),
  //                                 compressed-y-1(3), uncompressedP256(4) }
  function decodeEccP256CurvePoint(r) {
    var tag = r.u8();
    var n = node('EccP256CurvePoint', null, 'IEEE 1609.2 §6.3.20', []);
    if (tag === 0x00) {
      var x = r.bytes(32);
      n.value = 'x-only';
      n.children.push(node('x', toHex(x), '32-byte coordinate'));
    } else if (tag === 0x01) {
      n.value = 'fill (point at infinity)';
    } else if (tag === 0x02 || tag === 0x03) {
      var xc = r.bytes(32);
      n.value = tag === 0x02 ? 'compressed-y-0' : 'compressed-y-1';
      n.children.push(node('x', toHex(xc), 'compressed point'));
    } else if (tag === 0x04) {
      var ux = r.bytes(32);
      var uy = r.bytes(32);
      n.value = 'uncompressedP256';
      n.children.push(node('x', toHex(ux), '32-byte x-coordinate'));
      n.children.push(node('y', toHex(uy), '32-byte y-coordinate'));
    } else {
      throw new Error('Unknown EccP256CurvePoint CHOICE 0x' + tag.toString(16));
    }
    return n;
  }

  // EccP384CurvePoint mirrors EccP256 with 48-byte coordinates.
  function decodeEccP384CurvePoint(r) {
    var tag = r.u8();
    var n = node('EccP384CurvePoint', null, 'IEEE 1609.2 §6.3.21', []);
    if (tag === 0x00) {
      n.value = 'x-only';
      n.children.push(node('x', toHex(r.bytes(48)), '48-byte coordinate'));
    } else if (tag === 0x01) {
      n.value = 'fill';
    } else if (tag === 0x02 || tag === 0x03) {
      n.value = tag === 0x02 ? 'compressed-y-0' : 'compressed-y-1';
      n.children.push(node('x', toHex(r.bytes(48)), 'compressed point'));
    } else if (tag === 0x04) {
      n.value = 'uncompressedP384';
      n.children.push(node('x', toHex(r.bytes(48)), '48-byte x'));
      n.children.push(node('y', toHex(r.bytes(48)), '48-byte y'));
    } else {
      throw new Error('Unknown EccP384CurvePoint CHOICE 0x' + tag.toString(16));
    }
    return n;
  }

  // PublicVerificationKey ::= CHOICE {
  //   ecdsaNistP256 EccP256CurvePoint,
  //   ecdsaBrainpoolP256r1 EccP256CurvePoint,
  //   ecdsaNistP384 EccP384CurvePoint,
  //   ecdsaBrainpoolP384r1 EccP384CurvePoint
  // }
  var PUB_KEY_SCHEMES = ['ecdsaNistP256', 'ecdsaBrainpoolP256r1',
                         'ecdsaNistP384', 'ecdsaBrainpoolP384r1'];
  function decodePublicVerificationKey(r) {
    var tag = r.u8();
    var label = PUB_KEY_SCHEMES[tag] || ('UNKNOWN (' + tag + ')');
    var pt;
    if (tag === 0x00 || tag === 0x01) pt = decodeEccP256CurvePoint(r);
    else if (tag === 0x02 || tag === 0x03) pt = decodeEccP384CurvePoint(r);
    else throw new Error('Unknown PublicVerificationKey CHOICE 0x' + tag.toString(16));
    var n = node('verificationKey', label, 'IEEE 1609.2 §6.3.22 PublicVerificationKey', [pt]);
    return n;
  }

  // VerificationKeyIndicator ::= CHOICE {
  //   verificationKey PublicVerificationKey,
  //   reconstructionValue EccP256CurvePoint
  // }
  function decodeVerificationKeyIndicator(r) {
    var tag = r.u8();
    var n = node('verifyKeyIndicator', null,
      'IEEE 1609.2 §6.4.41 VerificationKeyIndicator', []);
    if (tag === 0x00) {
      n.value = 'verificationKey';
      n.children.push(decodePublicVerificationKey(r));
    } else if (tag === 0x01) {
      n.value = 'reconstructionValue (implicit cert)';
      n.children.push(decodeEccP256CurvePoint(r));
    } else {
      throw new Error('Unknown VerificationKeyIndicator CHOICE 0x' + tag.toString(16));
    }
    return n;
  }

  // Signature ::= CHOICE {
  //   ecdsaNistP256Signature EcdsaP256Signature,
  //   ecdsaBrainpoolP256r1Signature EcdsaP256Signature,
  //   ecdsaNistP384Signature EcdsaP384Signature,
  //   ecdsaBrainpoolP384r1Signature EcdsaP384Signature
  // }
  // EcdsaP256Signature ::= SEQUENCE { rSig EccP256CurvePoint, sSig OCTET STRING(SIZE(32)) }
  // EcdsaP384Signature ::= SEQUENCE { rSig EccP384CurvePoint, sSig OCTET STRING(SIZE(48)) }
  var SIG_SCHEMES = ['ecdsaNistP256Signature', 'ecdsaBrainpoolP256r1Signature',
                     'ecdsaNistP384Signature', 'ecdsaBrainpoolP384r1Signature'];
  function decodeSignature(r) {
    var tag = r.u8();
    var label = SIG_SCHEMES[tag] || ('UNKNOWN (' + tag + ')');
    var n = node('signature', label, 'IEEE 1609.2 §6.3.28 Signature', []);
    if (tag === 0x00 || tag === 0x01) {
      var rPt = decodeEccP256CurvePoint(r);
      rPt.name = 'rSig';
      var s = r.bytes(32);
      n.children.push(rPt);
      n.children.push(node('sSig', toHex(s), '32-byte scalar'));
    } else if (tag === 0x02 || tag === 0x03) {
      var rPt3 = decodeEccP384CurvePoint(r);
      rPt3.name = 'rSig';
      var s3 = r.bytes(48);
      n.children.push(rPt3);
      n.children.push(node('sSig', toHex(s3), '48-byte scalar'));
    } else {
      throw new Error('Unknown Signature CHOICE 0x' + tag.toString(16));
    }
    return n;
  }

  // ToBeSignedCertificate ::= SEQUENCE { 7 OPTIONALs + extension marker }
  // For pragmatic decoding: read preamble, then mandatory fields, then for
  // each OPTIONAL flagged present add an opaque-but-named child and stop.
  function decodeToBeSignedCertificate(r) {
    var pre = r.preamble(7, true);
    var n = node('toBeSigned', null,
      'IEEE 1609.2 §6.4.8 ToBeSignedCertificate', []);
    n.children.push(node('preamble',
      '0b' + pre.opt.join(''),
      'OPTIONALs[7] + extension presence bit (' + (pre.ext ? 'set' : 'clear') + ')'));
    n.children.push(decodeCertificateId(r));
    n.children.push(node('cracaId', toHex(r.bytes(3)),
      'HashedId3 — Certificate Revocation Authorization CA identifier'));
    n.children.push(node('crlSeries', r.u16().toString(),
      'Uint16 — CRL stream identifier (§6.4.13)'));
    n.children.push(decodeValidityPeriod(r));

    var OPT_NAMES = ['region', 'assuranceLevel', 'appPermissions',
                     'certIssuePermissions', 'certRequestPermissions',
                     'canRequestRollover', 'encryptionKey'];
    var OPT_REFS = [
      'IEEE 1609.2 §6.4.17 GeographicRegion',
      'IEEE 1609.2 §6.4.38 SubjectAssurance',
      'IEEE 1609.2 §6.4.28 SequenceOfPsidSsp',
      'IEEE 1609.2 §6.4.29 SequenceOfPsidGroupPermissions',
      'IEEE 1609.2 §6.4.29 SequenceOfPsidGroupPermissions',
      'IEEE 1609.2 §6.4.8 (canRequestRollover)',
      'IEEE 1609.2 §6.4.42 PublicEncryptionKey'
    ];
    var anyOpt = false;
    for (var i = 0; i < 7; i++) {
      if (pre.opt[i]) {
        anyOpt = true;
        n.children.push(node(OPT_NAMES[i], '(present — opaque in this view)',
          OPT_REFS[i]));
      }
    }
    if (anyOpt) {
      n.children.push(node('decoder note',
        'OPTIONAL fields present in this certificate are flagged but not byte-decoded in this build. The verifyKeyIndicator field is therefore not reachable from this input.',
        '(parser scope)'));
      throw new Error('Cannot continue past unrecognised OPTIONAL bytes.');
    }
    if (pre.ext) {
      n.children.push(node('extension data',
        '(extension addition flagged — opaque in this view)',
        'COER extensible SEQUENCE'));
      throw new Error('Cannot continue past extension addition bytes.');
    }
    n.children.push(decodeVerificationKeyIndicator(r));
    return n;
  }

  // Certificate ::= SEQUENCE { version, type, issuer, toBeSigned, signature OPTIONAL }
  function decodeCertificate(bytes) {
    var r = new Reader(bytes);
    var top = {
      ok: false,
      bytesRead: 0,
      bytesTotal: bytes.length,
      tree: [],
      error: null
    };
    try {
      // CertificateBase has 1 OPTIONAL (signature) and is extensible.
      var pre = r.preamble(1, true);
      top.tree.push(node('preamble',
        '0b' + pre.opt.join(''),
        '1 OPTIONAL (signature) + extension presence (' +
        (pre.ext ? 'set' : 'clear') + ')'));

      var version = r.u8();
      top.tree.push(node('version', String(version),
        'Uint8 — IEEE 1609.2 currently uses 3'));
      if (version !== 3) {
        top.tree.push(node('warning', 'version != 3', 'expected current 1609.2 baseline'));
      }
      top.tree.push(decodeCertificateType(r));
      top.tree.push(decodeIssuerIdentifier(r));
      top.tree.push(decodeToBeSignedCertificate(r));
      if (pre.opt[0]) {
        top.tree.push(decodeSignature(r));
      } else {
        top.tree.push(node('signature', '(absent)',
          'signature OPTIONAL omitted — typical for self-signed root in raw transport'));
      }
      top.bytesRead = r.p;
      top.ok = (r.p === bytes.length);
      if (!top.ok) {
        top.tree.push(node('trailing bytes',
          (bytes.length - r.p) + ' byte(s) after the decoded structure',
          'May indicate a longer-than-CertificateBase wrapper or junk'));
      }
    } catch (e) {
      top.error = String(e && e.message ? e.message : e);
      top.bytesRead = r.p;
      top.tree.push(node('decoder stopped',
        'Unable to decode beyond byte offset ' + r.p +
        ' of ' + bytes.length + '. Reason: ' + top.error,
        'COER parse halted'));
    }
    return top;
  }

  // ---------- HashedId8 helper (for chain validator) ----------
  // HashedId8 = last 8 bytes of SHA-256(canonical-COER-encoding of issuer cert).
  // We delegate the SHA-256 to WebCrypto.subtle.
  function hashedId8(bytes) {
    if (!crypto || !crypto.subtle) {
      return Promise.reject(new Error('WebCrypto unavailable'));
    }
    return crypto.subtle.digest('SHA-256', bytes).then(function (buf) {
      var u = new Uint8Array(buf);
      var s = '';
      for (var i = u.length - 8; i < u.length; i++) {
        s += u[i].toString(16).padStart(2, '0');
      }
      return s.toUpperCase();
    });
  }

  // ---------- exports ----------
  root.IEEE1609 = {
    inputToBytes: inputToBytes,
    detectFormat: detectFormat,
    toHex: toHex,
    decodeCertificate: decodeCertificate,
    hashedId8: hashedId8
  };
})(window);
