/* AmbiSecure shared lib — ASN.1 BER/DER parser
   Pure-vanilla. No dependencies. ES2015+.
   Exposes window.AmbiSecureASN1 with: parse(bytes), oidName(oid), oidToString(bytes), bytesToHex(b)
   All parsing is local. */
(function (root) {
  'use strict';

  /* ---- helpers ---- */
  function toBytes(input) {
    if (input instanceof Uint8Array) return input;
    if (Array.isArray(input)) return new Uint8Array(input);
    if (typeof input === 'string') return hexToBytes(input);
    throw new TypeError('asn1.parse expects Uint8Array, byte array, or hex string.');
  }
  function hexToBytes(hex) {
    var s = String(hex).replace(/0x/gi, '').replace(/[\s,;:_-]+/g, '').toLowerCase();
    if (s.length % 2 !== 0) throw new Error('Hex length must be even (got ' + s.length + ' nibbles).');
    if (!/^[0-9a-f]*$/.test(s)) throw new Error('Non-hex characters in input.');
    var out = new Uint8Array(s.length / 2);
    for (var i = 0; i < out.length; i++) out[i] = parseInt(s.substr(i * 2, 2), 16);
    return out;
  }
  function bytesToHex(b, sep) {
    sep = sep || '';
    var out = '';
    for (var i = 0; i < b.length; i++) {
      var x = b[i].toString(16).toUpperCase();
      if (x.length < 2) x = '0' + x;
      out += (i ? sep : '') + x;
    }
    return out;
  }
  function bytesEq(a, b) {
    if (a.length !== b.length) return false;
    for (var i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
  }

  /* ---- OID encoding ---- */
  function oidToString(bytes) {
    if (!bytes || !bytes.length) return '';
    var first = bytes[0];
    var parts = [Math.floor(first / 40), first % 40];
    var v = 0;
    for (var i = 1; i < bytes.length; i++) {
      v = (v * 128) + (bytes[i] & 0x7F);
      if (!(bytes[i] & 0x80)) { parts.push(v); v = 0; }
    }
    return parts.join('.');
  }

  /* ---- OID dictionary (subset useful for X.509) ---- */
  var OID = {
    /* RDN attribute types */
    '2.5.4.3':  'commonName (CN)',
    '2.5.4.6':  'countryName (C)',
    '2.5.4.7':  'localityName (L)',
    '2.5.4.8':  'stateOrProvinceName (ST)',
    '2.5.4.9':  'streetAddress',
    '2.5.4.10': 'organizationName (O)',
    '2.5.4.11': 'organizationalUnitName (OU)',
    '2.5.4.5':  'serialNumber',
    '2.5.4.12': 'title',
    '2.5.4.13': 'description',
    '2.5.4.15': 'businessCategory',
    '2.5.4.17': 'postalCode',
    '2.5.4.42': 'givenName',
    '2.5.4.4':  'surname',
    '2.5.4.46': 'dnQualifier',
    '0.9.2342.19200300.100.1.1':  'userId (UID)',
    '0.9.2342.19200300.100.1.25': 'domainComponent (DC)',
    '1.2.840.113549.1.9.1':       'emailAddress',
    /* Public key algorithms */
    '1.2.840.113549.1.1.1':  'rsaEncryption',
    '1.2.840.10045.2.1':     'ecPublicKey',
    '1.2.840.10040.4.1':     'dsa',
    '1.3.101.112':           'Ed25519',
    '1.3.101.113':           'Ed448',
    /* Signature algorithms */
    '1.2.840.113549.1.1.5':  'sha1WithRSAEncryption',
    '1.2.840.113549.1.1.11': 'sha256WithRSAEncryption',
    '1.2.840.113549.1.1.12': 'sha384WithRSAEncryption',
    '1.2.840.113549.1.1.13': 'sha512WithRSAEncryption',
    '1.2.840.113549.1.1.10': 'rsassa-pss',
    '1.2.840.10045.4.1':     'ecdsa-with-SHA1',
    '1.2.840.10045.4.3.2':   'ecdsa-with-SHA256',
    '1.2.840.10045.4.3.3':   'ecdsa-with-SHA384',
    '1.2.840.10045.4.3.4':   'ecdsa-with-SHA512',
    /* Named curves */
    '1.2.840.10045.3.1.7':   'P-256 (secp256r1, prime256v1)',
    '1.3.132.0.34':          'P-384 (secp384r1)',
    '1.3.132.0.35':          'P-521 (secp521r1)',
    '1.3.132.0.10':          'secp256k1',
    '1.3.36.3.3.2.8.1.1.7':  'brainpoolP256r1',
    '1.3.36.3.3.2.8.1.1.11': 'brainpoolP384r1',
    /* Hash */
    '1.3.14.3.2.26':         'sha1',
    '2.16.840.1.101.3.4.2.1':'sha256',
    '2.16.840.1.101.3.4.2.2':'sha384',
    '2.16.840.1.101.3.4.2.3':'sha512',
    /* X.509 extensions */
    '2.5.29.14': 'subjectKeyIdentifier',
    '2.5.29.15': 'keyUsage',
    '2.5.29.17': 'subjectAltName',
    '2.5.29.18': 'issuerAltName',
    '2.5.29.19': 'basicConstraints',
    '2.5.29.20': 'cRLNumber',
    '2.5.29.31': 'cRLDistributionPoints',
    '2.5.29.32': 'certificatePolicies',
    '2.5.29.35': 'authorityKeyIdentifier',
    '2.5.29.37': 'extKeyUsage',
    '1.3.6.1.5.5.7.1.1':  'authorityInfoAccess',
    '1.3.6.1.5.5.7.3.1':  'serverAuth (TLS Server)',
    '1.3.6.1.5.5.7.3.2':  'clientAuth (TLS Client)',
    '1.3.6.1.5.5.7.3.3':  'codeSigning',
    '1.3.6.1.5.5.7.3.4':  'emailProtection',
    '1.3.6.1.5.5.7.3.8':  'timeStamping',
    '1.3.6.1.5.5.7.3.9':  'OCSPSigning',
    '1.3.6.1.5.5.7.48.1': 'OCSP',
    '1.3.6.1.5.5.7.48.2': 'caIssuers',
    /* PKCS#7 / PKCS#12 */
    '1.2.840.113549.1.7.1':  'pkcs7-data',
    '1.2.840.113549.1.7.2':  'pkcs7-signedData',
    '1.2.840.113549.1.7.3':  'pkcs7-envelopedData',
    '1.2.840.113549.1.7.6':  'pkcs7-encryptedData',
    '1.2.840.113549.1.12.10.1.1': 'keyBag',
    '1.2.840.113549.1.12.10.1.2': 'pkcs8ShroudedKeyBag',
    '1.2.840.113549.1.12.10.1.3': 'certBag',
    '1.2.840.113549.1.12.10.1.5': 'crlBag',
    '1.2.840.113549.1.12.10.1.6': 'secretBag',
    '1.2.840.113549.1.9.20':      'friendlyName',
    '1.2.840.113549.1.9.21':      'localKeyID',
    '1.2.840.113549.1.9.22.1':    'x509Certificate',
    /* PBE */
    '1.2.840.113549.1.5.13':   'PBES2',
    '1.2.840.113549.1.5.12':   'PBKDF2',
    '1.2.840.113549.3.7':      'des-EDE3-CBC',
    '2.16.840.1.101.3.4.1.42': 'aes256-CBC',
    '2.16.840.1.101.3.4.1.2':  'aes128-CBC',
    '1.2.840.113549.1.12.1.3': 'pbeWithSHA1And3-KeyTripleDES-CBC',
    '1.2.840.113549.1.12.1.6': 'pbeWithSHA1And40BitRC2-CBC',
    /* CSR attrs */
    '1.2.840.113549.1.9.14':   'extensionRequest',
    '1.2.840.113549.1.9.7':    'challengePassword'
  };

  function oidName(oid) { return OID[oid] || null; }

  /* ---- tag class / type names ---- */
  var CLASS = ['Universal', 'Application', 'Context-specific', 'Private'];
  var UNIVERSAL = {
    1: 'BOOLEAN', 2: 'INTEGER', 3: 'BIT STRING', 4: 'OCTET STRING', 5: 'NULL',
    6: 'OBJECT IDENTIFIER', 7: 'ObjectDescriptor', 8: 'EXTERNAL', 9: 'REAL',
    10: 'ENUMERATED', 12: 'UTF8String', 16: 'SEQUENCE', 17: 'SET',
    18: 'NumericString', 19: 'PrintableString', 20: 'T61String', 22: 'IA5String',
    23: 'UTCTime', 24: 'GeneralizedTime', 26: 'VisibleString', 27: 'GeneralString',
    28: 'UniversalString', 30: 'BMPString'
  };

  /* ---- core parser ---- */
  function parse(input) {
    var bytes = toBytes(input);
    var stream = { b: bytes, i: 0 };
    var nodes = [];
    while (stream.i < bytes.length) nodes.push(readOne(stream));
    return nodes;
  }

  function readOne(s) {
    var start = s.i;
    if (s.i >= s.b.length) throw new Error('Truncated tag at offset ' + s.i + '.');
    var first = s.b[s.i++];
    var clazz = (first >> 6) & 0x03;
    var constructed = (first & 0x20) !== 0;
    var lower = first & 0x1F;
    var tagNum = lower;
    var tagBytes = [first];
    if (lower === 0x1F) {
      tagNum = 0;
      var more;
      do {
        if (s.i >= s.b.length) throw new Error('Truncated multi-byte tag.');
        more = s.b[s.i++];
        tagBytes.push(more);
        tagNum = (tagNum * 128) + (more & 0x7F);
      } while (more & 0x80);
    }
    /* length */
    if (s.i >= s.b.length) throw new Error('Truncated length at offset ' + s.i + '.');
    var l0 = s.b[s.i++];
    var len = 0, indef = false;
    if (l0 < 0x80) {
      len = l0;
    } else if (l0 === 0x80) {
      indef = true;
      throw new Error('Indefinite-length BER not supported.');
    } else {
      var n = l0 & 0x7F;
      if (n === 0 || n > 6) throw new Error('Invalid long-form length 0x' + l0.toString(16));
      if (s.i + n > s.b.length) throw new Error('Truncated long-form length.');
      for (var k = 0; k < n; k++) len = (len * 256) + s.b[s.i++];
    }
    if (s.i + len > s.b.length) throw new Error('Length ' + len + ' overruns buffer at offset ' + s.i + '.');
    var value = s.b.subarray(s.i, s.i + len);
    s.i += len;

    var node = {
      offset: start,
      length: s.i - start,
      headerLength: (s.i - start) - len,
      tagBytes: new Uint8Array(tagBytes),
      tagClass: clazz,
      tagClassName: CLASS[clazz],
      constructed: constructed,
      tagNumber: tagNum,
      typeName: clazz === 0 ? (UNIVERSAL[tagNum] || ('[UNIVERSAL ' + tagNum + ']')) : (clazz === 2 ? '[' + tagNum + ']' : (CLASS[clazz] + ' ' + tagNum)),
      contentLength: len,
      value: value,
      children: null
    };

    if (constructed && len > 0) {
      var inner = { b: value, i: 0 };
      var kids = [];
      while (inner.i < value.length) kids.push(readOne(inner));
      node.children = kids;
    }
    return node;
  }

  /* ---- value decoders for primitive types ---- */
  function decodeValue(node) {
    if (node.constructed) return null;
    if (node.tagClass !== 0) return null; // only universal types
    var v = node.value;
    switch (node.tagNumber) {
      case 1: return v.length ? v[0] !== 0 : false;
      case 2: return decodeInteger(v);
      case 3: return decodeBitString(v);
      case 4: return v;
      case 5: return null;
      case 6: return oidToString(v);
      case 12: case 19: case 18: case 22: case 26: case 27:
        return bytesToString(v);
      case 23: return decodeUTCTime(v);
      case 24: return decodeGeneralizedTime(v);
      case 30: return decodeBMPString(v);
      default: return null;
    }
  }
  function decodeInteger(v) {
    if (v.length <= 6) {
      var n = (v[0] & 0x80) ? -1 : 0;
      for (var i = 0; i < v.length; i++) n = (n * 256) + v[i];
      return n;
    }
    return '0x' + bytesToHex(v); // big int as hex
  }
  function decodeBitString(v) {
    if (!v.length) return { unusedBits: 0, bytes: new Uint8Array(0) };
    return { unusedBits: v[0], bytes: v.subarray(1) };
  }
  function bytesToString(v) {
    var s = '';
    for (var i = 0; i < v.length; i++) s += String.fromCharCode(v[i]);
    try { return decodeURIComponent(escape(s)); } catch (e) { return s; }
  }
  function decodeBMPString(v) {
    var s = '';
    for (var i = 0; i + 1 < v.length; i += 2) s += String.fromCharCode((v[i] << 8) | v[i + 1]);
    return s;
  }
  function decodeUTCTime(v) {
    var s = bytesToString(v);
    var m = s.match(/^(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})?Z$/);
    if (!m) return s;
    var yy = parseInt(m[1], 10);
    var year = yy < 50 ? 2000 + yy : 1900 + yy;
    return new Date(Date.UTC(year, parseInt(m[2],10)-1, +m[3], +m[4], +m[5], +(m[6]||0))).toISOString();
  }
  function decodeGeneralizedTime(v) {
    var s = bytesToString(v);
    var m = s.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})?(?:\.\d+)?Z$/);
    if (!m) return s;
    return new Date(Date.UTC(+m[1], +m[2]-1, +m[3], +m[4], +m[5], +(m[6]||0))).toISOString();
  }

  function findChild(node, tagClass, tagNumber) {
    if (!node.children) return null;
    for (var i = 0; i < node.children.length; i++) {
      var c = node.children[i];
      if (c.tagClass === tagClass && c.tagNumber === tagNumber) return c;
    }
    return null;
  }

  root.AmbiSecureASN1 = {
    parse: parse,
    decodeValue: decodeValue,
    oidToString: oidToString,
    oidName: oidName,
    findChild: findChild,
    bytesToHex: bytesToHex,
    hexToBytes: hexToBytes,
    bytesEq: bytesEq,
    OID: OID
  };
})(typeof window !== 'undefined' ? window : globalThis);
