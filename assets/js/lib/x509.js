(function (root) {
  'use strict';

  if (!root.AmbiSecureASN1) throw new Error('AmbiSecureX509 requires AmbiSecureASN1');
  var A = root.AmbiSecureASN1;

  function decodePEM(text) {
    var out = [];
    var re = /-----BEGIN ([A-Z0-9 ]+)-----([\s\S]*?)-----END \1-----/g;
    var m;
    while ((m = re.exec(text))) {
      var label = m[1].trim();
      var body = m[2].replace(/\s+/g, '');
      if (!body) continue;
      try {
        var der = base64Decode(body);
        out.push({ label: label, der: der });
      } catch (e) {
        throw new Error('Invalid base64 inside ' + label + ' block: ' + e.message);
      }
    }
    return out;
  }
  function encodePEM(der, label) {
    var b64 = base64Encode(der);
    var lines = [];
    for (var i = 0; i < b64.length; i += 64) lines.push(b64.substr(i, 64));
    return '-----BEGIN ' + label + '-----\n' + lines.join('\n') + '\n-----END ' + label + '-----\n';
  }

  function base64Decode(s) {
    s = String(s).replace(/[\s]/g, '');
    if (typeof atob === 'function') {
      var bin = atob(s);
      var out = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
      return out;
    }

    var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    var pad = (s.match(/=*$/)[0] || '').length;
    var len = (s.length / 4) * 3 - pad;
    var bytes = new Uint8Array(len), j = 0;
    for (var k = 0; k < s.length; k += 4) {
      var a = lookup.indexOf(s[k]), b = lookup.indexOf(s[k+1]), c = lookup.indexOf(s[k+2]), d = lookup.indexOf(s[k+3]);
      var w = (a << 18) | (b << 12) | ((c & 63) << 6) | (d & 63);
      if (j < len) bytes[j++] = (w >> 16) & 0xFF;
      if (j < len) bytes[j++] = (w >> 8) & 0xFF;
      if (j < len) bytes[j++] = w & 0xFF;
    }
    return bytes;
  }
  function base64Encode(bytes) {
    if (typeof btoa === 'function') {
      var bin = '';
      for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
      return btoa(bin);
    }
    var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    var out = '';
    for (var k = 0; k < bytes.length; k += 3) {
      var a = bytes[k], b = bytes[k+1] || 0, c = bytes[k+2] || 0;
      var w = (a << 16) | (b << 8) | c;
      out += lookup[(w >> 18) & 63] + lookup[(w >> 12) & 63];
      out += (k + 1 < bytes.length) ? lookup[(w >> 6) & 63] : '=';
      out += (k + 2 < bytes.length) ? lookup[w & 63] : '=';
    }
    return out;
  }

  function rdnToString(rdnSeq) {
    if (!rdnSeq || !rdnSeq.children) return '';
    var parts = [];
    for (var i = 0; i < rdnSeq.children.length; i++) {
      var rdn = rdnSeq.children[i];
      if (!rdn.children) continue;
      var atvParts = [];
      for (var j = 0; j < rdn.children.length; j++) {
        var atv = rdn.children[j];
        if (!atv.children || atv.children.length < 2) continue;
        var oid = A.decodeValue(atv.children[0]);
        var name = A.oidName(oid);
        var label = nameForRDN(name) || oid;
        var val = A.decodeValue(atv.children[1]);
        if (typeof val === 'string') atvParts.push(label + '=' + escapeRDN(val));
        else atvParts.push(label + '=#' + (atv.children[1].value ? A.bytesToHex(atv.children[1].value) : ''));
      }
      parts.push(atvParts.join('+'));
    }
    return parts.join(', ');
  }
  function nameForRDN(name) {
    if (!name) return null;
    var m = name.match(/\(([A-Z]+)\)/);
    return m ? m[1] : name.split(' ')[0];
  }
  function escapeRDN(s) { return String(s).replace(/([,+"\\<>;=#])/g, '\\$1'); }

  function decodeValidity(node) {
    if (!node || !node.children || node.children.length < 2) return null;
    return {
      notBefore: A.decodeValue(node.children[0]),
      notAfter: A.decodeValue(node.children[1])
    };
  }

  function decodeAlgId(node) {
    if (!node || !node.children || !node.children.length) return null;
    var oid = A.decodeValue(node.children[0]);
    var params = node.children[1] || null;
    var paramsHuman = null;
    if (params) {
      if (params.tagClass === 0 && params.tagNumber === 5) paramsHuman = '(NULL)';
      else if (params.tagClass === 0 && params.tagNumber === 6) {
        var p = A.decodeValue(params);
        paramsHuman = A.oidName(p) ? (A.oidName(p) + ' [' + p + ']') : p;
      } else if (params.value && params.value.length) {
        paramsHuman = '0x' + A.bytesToHex(params.value);
      }
    }
    return { oid: oid, name: A.oidName(oid), parameters: paramsHuman };
  }

  function decodeSPKI(node) {
    if (!node || !node.children || node.children.length < 2) return null;
    var alg = decodeAlgId(node.children[0]);
    var bsNode = node.children[1];
    var bs = A.decodeValue(bsNode);
    var info = { algorithm: alg, bitString: bs, sizeBits: bs ? bs.bytes.length * 8 - bs.unusedBits : null };
    if (alg && alg.oid === '1.2.840.113549.1.1.1' && bs && bs.bytes && bs.bytes.length) {
      try {
        var inner = A.parse(bs.bytes)[0];
        if (inner && inner.children && inner.children.length >= 2) {
          var nNode = inner.children[0];
          var modulus = nNode.value;

          if (modulus.length && modulus[0] === 0x00) modulus = modulus.subarray(1);
          info.rsa = {
            modulusBits: modulus.length * 8,
            modulusHexPreview: A.bytesToHex(modulus.subarray(0, 16)) + (modulus.length > 16 ? '…' : ''),
            exponent: A.decodeValue(inner.children[1])
          };
        }
      } catch (e) {  }
    }
    return info;
  }

  function decodeExtensions(extsNode) {

    if (!extsNode) return [];
    var seq = extsNode.children && extsNode.children[0] ? extsNode.children[0] : extsNode;
    if (!seq.children) return [];
    var out = [];
    for (var i = 0; i < seq.children.length; i++) {
      var ext = seq.children[i];
      if (!ext.children || ext.children.length < 2) continue;
      var oid = A.decodeValue(ext.children[0]);
      var idx = 1, critical = false;
      if (ext.children[1].tagClass === 0 && ext.children[1].tagNumber === 1) {
        critical = !!A.decodeValue(ext.children[1]);
        idx = 2;
      }
      var extnValue = ext.children[idx] ? ext.children[idx].value : null;
      var human = humaniseExtension(oid, extnValue);
      out.push({ oid: oid, name: A.oidName(oid), critical: critical, value: extnValue, human: human });
    }
    return out;
  }

  function humaniseExtension(oid, octets) {
    if (!octets) return null;
    try {
      var inner = A.parse(octets);
      var n = inner[0];
      if (!n) return null;
      switch (oid) {
        case '2.5.29.19': return humanBasicConstraints(n);
        case '2.5.29.15': return humanKeyUsage(n);
        case '2.5.29.17': return humanSAN(n);
        case '2.5.29.37': return humanExtKeyUsage(n);
        case '2.5.29.14': return 'subjectKeyIdentifier=' + A.bytesToHex(n.value || new Uint8Array(0), ':');
        case '2.5.29.35': return humanAuthorityKeyId(n);
        case '2.5.29.31': return humanCRLDP(n);
        case '1.3.6.1.5.5.7.1.1': return humanAIA(n);
        default: return null;
      }
    } catch (e) { return null; }
  }
  function humanBasicConstraints(n) {
    var ca = false, pathLen = null;
    if (n.children) {
      for (var i = 0; i < n.children.length; i++) {
        var c = n.children[i];
        if (c.tagClass === 0 && c.tagNumber === 1) ca = !!A.decodeValue(c);
        else if (c.tagClass === 0 && c.tagNumber === 2) pathLen = A.decodeValue(c);
      }
    }
    return 'CA=' + (ca ? 'TRUE' : 'FALSE') + (pathLen !== null ? ', pathLenConstraint=' + pathLen : '');
  }
  function humanKeyUsage(n) {
    var bs = A.decodeValue(n);
    if (!bs || !bs.bytes.length) return '';
    var flags = ['digitalSignature','nonRepudiation','keyEncipherment','dataEncipherment','keyAgreement','keyCertSign','cRLSign','encipherOnly','decipherOnly'];
    var out = [];
    for (var i = 0; i < flags.length; i++) {
      var byte = bs.bytes[Math.floor(i / 8)];
      var bit = 7 - (i % 8);
      if (byte === undefined) break;
      if (byte & (1 << bit)) out.push(flags[i]);
    }
    return out.join(', ');
  }
  function humanSAN(n) {
    if (!n.children) return '';
    var parts = [];
    for (var i = 0; i < n.children.length; i++) {
      var c = n.children[i];
      if (c.tagClass !== 2) continue;
      switch (c.tagNumber) {
        case 1: parts.push('email:' + bytesToString(c.value)); break;
        case 2: parts.push('DNS:' + bytesToString(c.value)); break;
        case 6: parts.push('URI:' + bytesToString(c.value)); break;
        case 7: parts.push('IP:' + ipBytesToString(c.value)); break;
        case 4: parts.push('dirName:' + rdnToString(c.children && c.children[0] ? c.children[0] : c)); break;
        default: parts.push('[' + c.tagNumber + ']');
      }
    }
    return parts.join(', ');
  }
  function ipBytesToString(b) {
    if (b.length === 4) return b[0]+'.'+b[1]+'.'+b[2]+'.'+b[3];
    if (b.length === 16) {
      var p = [];
      for (var i = 0; i < 16; i += 2) p.push(((b[i]<<8)|b[i+1]).toString(16));
      return p.join(':');
    }
    return A.bytesToHex(b, ':');
  }
  function humanExtKeyUsage(n) {
    if (!n.children) return '';
    var out = [];
    for (var i = 0; i < n.children.length; i++) {
      var oid = A.decodeValue(n.children[i]);
      out.push(A.oidName(oid) || oid);
    }
    return out.join(', ');
  }
  function humanAuthorityKeyId(n) {
    if (!n.children) return '';
    var parts = [];
    for (var i = 0; i < n.children.length; i++) {
      var c = n.children[i];
      if (c.tagClass === 2 && c.tagNumber === 0) parts.push('keyid=' + A.bytesToHex(c.value, ':'));
      else if (c.tagClass === 2 && c.tagNumber === 2) parts.push('serial=' + A.bytesToHex(c.value, ':'));
    }
    return parts.join(', ');
  }
  function humanCRLDP(n) {

    var uris = [];
    walkForType6(n, uris);
    return uris.map(function(u){return 'URI:' + u;}).join(', ');
  }
  function humanAIA(n) {
    if (!n.children) return '';
    var out = [];
    for (var i = 0; i < n.children.length; i++) {
      var ad = n.children[i];
      if (!ad.children || ad.children.length < 2) continue;
      var oid = A.decodeValue(ad.children[0]);
      var name = A.oidName(oid) || oid;
      var loc = ad.children[1];
      if (loc.tagClass === 2 && loc.tagNumber === 6) out.push(name + ': URI=' + bytesToString(loc.value));
    }
    return out.join('; ');
  }
  function walkForType6(node, acc) {
    if (!node) return;
    if (node.tagClass === 2 && node.tagNumber === 6) acc.push(bytesToString(node.value));
    if (node.children) for (var i = 0; i < node.children.length; i++) walkForType6(node.children[i], acc);
  }
  function bytesToString(v) {
    var s = '';
    for (var i = 0; i < v.length; i++) s += String.fromCharCode(v[i]);
    return s;
  }

  function parseCertificate(der) {
    var top = A.parse(der)[0];
    if (!top || !top.children) throw new Error('Not a SEQUENCE.');
    var tbs = top.children[0];
    var sigAlg = top.children[1];
    var sigValue = top.children[2];
    if (!tbs || !tbs.children) throw new Error('Missing tbsCertificate.');

    var idx = 0, version = 1;
    if (tbs.children[0].tagClass === 2 && tbs.children[0].tagNumber === 0) {
      var v = A.decodeValue(tbs.children[0].children ? tbs.children[0].children[0] : tbs.children[0]);
      version = (typeof v === 'number') ? (v + 1) : 1;
      idx = 1;
    }
    var serialNode = tbs.children[idx++];
    var sigAlgInner = tbs.children[idx++];
    var issuer = tbs.children[idx++];
    var validity = tbs.children[idx++];
    var subject = tbs.children[idx++];
    var spki = tbs.children[idx++];
    var extsNode = null;

    for (var k = idx; k < tbs.children.length; k++) {
      var c = tbs.children[k];
      if (c.tagClass === 2 && c.tagNumber === 3) extsNode = c;
    }

    return {
      version: version,
      serialNumberHex: A.bytesToHex(serialNode.value, ':'),
      signatureAlgorithm: decodeAlgId(sigAlg),
      issuer: rdnToString(issuer),
      validity: decodeValidity(validity),
      subject: rdnToString(subject),
      subjectPublicKeyInfo: decodeSPKI(spki),
      extensions: decodeExtensions(extsNode),
      signatureValuePreview: sigValue ? A.bytesToHex(sigValue.value.subarray(0, 16)) + (sigValue.value.length > 16 ? '…' : '') : null,
      raw: { tbs: tbs, top: top }
    };
  }

  function parseCSR(der) {
    var top = A.parse(der)[0];
    if (!top || !top.children) throw new Error('Not a SEQUENCE.');
    var info = top.children[0];
    var sigAlg = top.children[1];
    var sigValue = top.children[2];
    if (!info || !info.children) throw new Error('Missing CertificationRequestInfo.');
    var version = A.decodeValue(info.children[0]);
    var subject = info.children[1];
    var spki = info.children[2];
    var attrs = info.children[3];
    var extensions = [];
    if (attrs && attrs.children) {
      for (var i = 0; i < attrs.children.length; i++) {
        var attr = attrs.children[i];
        if (!attr.children || attr.children.length < 2) continue;
        var oid = A.decodeValue(attr.children[0]);
        if (oid === '1.2.840.113549.1.9.14' && attr.children[1].children && attr.children[1].children[0]) {
          extensions = decodeExtensions({ children: [ attr.children[1].children[0] ] });
        }
      }
    }
    return {
      version: (typeof version === 'number') ? version + 1 : version,
      subject: rdnToString(subject),
      subjectPublicKeyInfo: decodeSPKI(spki),
      signatureAlgorithm: decodeAlgId(sigAlg),
      extensions: extensions,
      signatureValuePreview: sigValue ? A.bytesToHex(sigValue.value.subarray(0, 16)) + (sigValue.value.length > 16 ? '…' : '') : null
    };
  }

  function fingerprint(der, algo) {
    if (!root.crypto || !root.crypto.subtle) return Promise.reject(new Error('Web Crypto unavailable.'));
    var algMap = { 'sha-1': 'SHA-1', 'sha-256': 'SHA-256', 'sha-384': 'SHA-384', 'sha-512': 'SHA-512' };
    var name = algMap[String(algo).toLowerCase()] || 'SHA-256';
    return root.crypto.subtle.digest(name, der).then(function (h) {
      return A.bytesToHex(new Uint8Array(h), ':');
    });
  }

  function autoDecode(input) {
    if (input instanceof Uint8Array) return [{ label: 'DER', der: input }];
    var s = String(input).trim();
    if (s.indexOf('-----BEGIN') !== -1) return decodePEM(s);

    if (/^[0-9a-f\s,;:_-]+$/i.test(s)) return [{ label: 'HEX', der: A.hexToBytes(s) }];

    return [{ label: 'BASE64', der: base64Decode(s) }];
  }

  root.AmbiSecureX509 = {
    decodePEM: decodePEM,
    encodePEM: encodePEM,
    base64Decode: base64Decode,
    base64Encode: base64Encode,
    parseCertificate: parseCertificate,
    parseCSR: parseCSR,
    decodeAlgId: decodeAlgId,
    decodeSPKI: decodeSPKI,
    decodeExtensions: decodeExtensions,
    decodeValidity: decodeValidity,
    rdnToString: rdnToString,
    fingerprint: fingerprint,
    autoDecode: autoDecode
  };
})(typeof window !== 'undefined' ? window : globalThis);
