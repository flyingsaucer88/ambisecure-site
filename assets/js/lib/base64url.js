(function (root) {
  'use strict';

  function decode(input) {
    if (input == null) throw new Error('No input.');
    var s = String(input).trim().replace(/[\s\r\n]+/g, '');
    s = s.replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    var raw;
    try { raw = atob(s); }
    catch (e) { throw new Error('Not valid base64url.'); }
    var out = new Uint8Array(raw.length);
    for (var i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
    return out;
  }

  function encode(bytes) {
    if (!(bytes instanceof Uint8Array)) bytes = new Uint8Array(bytes);
    var s = '';
    for (var i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
    var b64 = btoa(s);
    return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }

  function looksLikeBase64Url(s) {
    if (typeof s !== 'string') return false;
    return /^[A-Za-z0-9_\-]+={0,2}$/.test(s.trim());
  }

  function bytesToHex(b) {
    var s = '';
    for (var i = 0; i < b.length; i++) s += (b[i] < 16 ? '0' : '') + b[i].toString(16);
    return s;
  }

  function hexToBytes(h) {
    var s = String(h).replace(/0x/gi, '').replace(/[\s,;:_-]+/g, '');
    if (s.length % 2 !== 0) throw new Error('Hex length must be even.');
    if (!/^[0-9a-fA-F]*$/.test(s)) throw new Error('Non-hex characters.');
    var out = new Uint8Array(s.length / 2);
    for (var i = 0; i < out.length; i++) out[i] = parseInt(s.substr(i * 2, 2), 16);
    return out;
  }

  root.AmbiSecureB64URL = {
    decode: decode,
    encode: encode,
    looksLikeBase64Url: looksLikeBase64Url,
    bytesToHex: bytesToHex,
    hexToBytes: hexToBytes
  };
})(typeof window !== 'undefined' ? window : globalThis);
