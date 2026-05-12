(function (root) {
  'use strict';

  function CBORError(msg) { this.name = 'CBORError'; this.message = msg; }
  CBORError.prototype = Object.create(Error.prototype);

  function decode(bytes) {
    if (!(bytes instanceof Uint8Array)) bytes = new Uint8Array(bytes);
    var idx = 0;
    var view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

    function readUint(ai) {
      if (ai < 24) return ai;
      if (ai === 24) { var v = bytes[idx]; idx += 1; return v; }
      if (ai === 25) { var v = view.getUint16(idx); idx += 2; return v; }
      if (ai === 26) { var v = view.getUint32(idx); idx += 4; return v; }
      if (ai === 27) {

        var hi = view.getUint32(idx);
        var lo = view.getUint32(idx + 4);
        idx += 8;
        if (hi > 0x1fffff) throw new CBORError('64-bit integer exceeds safe JS number range.');
        return hi * 0x100000000 + lo;
      }
      throw new CBORError('Reserved additional-info value: ' + ai);
    }

    function readBytes(n) {
      if (idx + n > bytes.length) throw new CBORError('Unexpected end of CBOR input.');
      var out = bytes.subarray(idx, idx + n);
      idx += n;
      return out;
    }

    function readFloat(ai) {
      if (ai === 25) {

        var u = view.getUint16(idx); idx += 2;
        var sign = (u & 0x8000) ? -1 : 1;
        var exp = (u & 0x7C00) >> 10;
        var mant = u & 0x03FF;
        var v;
        if (exp === 0) v = sign * Math.pow(2, -14) * (mant / 1024);
        else if (exp === 0x1F) v = mant ? NaN : sign * Infinity;
        else v = sign * Math.pow(2, exp - 15) * (1 + mant / 1024);
        return v;
      }
      if (ai === 26) { var v = view.getFloat32(idx); idx += 4; return v; }
      if (ai === 27) { var v = view.getFloat64(idx); idx += 8; return v; }
      throw new CBORError('Bad float additional-info: ' + ai);
    }

    function readItem() {
      if (idx >= bytes.length) throw new CBORError('Unexpected end of CBOR input.');
      var ib = bytes[idx]; idx += 1;
      var mt = ib >> 5;
      var ai = ib & 0x1F;

      if (ai === 31 && (mt === 2 || mt === 3 || mt === 4 || mt === 5 || mt === 7)) {
        if (mt === 7) return { type: 'break' };
        if (mt === 2 || mt === 3) {
          var pieces = [];
          while (true) {
            var p = readItem();
            if (p && p.type === 'break') break;
            pieces.push(p);
          }
          if (mt === 2) {
            var total = pieces.reduce(function (a, b) { return a + b.value.length; }, 0);
            var out = new Uint8Array(total); var off = 0;
            pieces.forEach(function (p) { out.set(p.value, off); off += p.value.length; });
            return { type: 'bytes', value: out };
          }
          return { type: 'text', value: pieces.map(function (p) { return p.value; }).join('') };
        }
        if (mt === 4) {
          var arr = [];
          while (true) { var item = readItem(); if (item && item.type === 'break') break; arr.push(item); }
          return { type: 'array', value: arr };
        }
        if (mt === 5) {
          var pairs = [];
          while (true) {
            var k = readItem(); if (k && k.type === 'break') break;
            var v = readItem();
            pairs.push([k, v]);
          }
          return { type: 'map', value: pairs };
        }
      }

      switch (mt) {
        case 0: return { type: 'uint', value: readUint(ai) };
        case 1: return { type: 'nint', value: -1 - readUint(ai) };
        case 2: return { type: 'bytes', value: readBytes(readUint(ai)).slice() };
        case 3: {
          var n = readUint(ai);
          var b = readBytes(n);
          var s;
          if (typeof TextDecoder !== 'undefined') s = new TextDecoder('utf-8', { fatal: false }).decode(b);
          else s = String.fromCharCode.apply(null, b);
          return { type: 'text', value: s };
        }
        case 4: {
          var n = readUint(ai);
          var arr = [];
          for (var i = 0; i < n; i++) arr.push(readItem());
          return { type: 'array', value: arr };
        }
        case 5: {
          var n = readUint(ai);
          var pairs = [];
          for (var i = 0; i < n; i++) {
            var k = readItem(); var v = readItem();
            pairs.push([k, v]);
          }
          return { type: 'map', value: pairs };
        }
        case 6: {
          var tag = readUint(ai);
          var inner = readItem();
          return { type: 'tag', tag: tag, value: inner };
        }
        case 7: {
          if (ai < 20) return { type: 'simple', value: ai };
          if (ai === 20) return { type: 'bool', value: false };
          if (ai === 21) return { type: 'bool', value: true };
          if (ai === 22) return { type: 'null', value: null };
          if (ai === 23) return { type: 'undef', value: undefined };
          if (ai === 24) { var s = bytes[idx]; idx += 1; return { type: 'simple', value: s }; }
          if (ai === 25 || ai === 26 || ai === 27) return { type: 'float', value: readFloat(ai) };
          if (ai === 31) return { type: 'break' };
          throw new CBORError('Reserved major-7 ai: ' + ai);
        }
      }
      throw new CBORError('Unsupported major type: ' + mt);
    }

    var item = readItem();
    return { item: item, consumed: idx, remaining: bytes.length - idx };
  }

  function bytesToHex(b) {
    var s = '';
    for (var i = 0; i < b.length; i++) s += (b[i] < 16 ? '0' : '') + b[i].toString(16);
    return s;
  }

  function stringify(item, indent) {
    indent = indent || 0;
    var pad = '';
    for (var i = 0; i < indent; i++) pad += '  ';
    var npad = pad + '  ';
    if (!item) return 'null';
    switch (item.type) {
      case 'uint': case 'nint': return String(item.value);
      case 'float': return String(item.value);
      case 'bool': return item.value ? 'true' : 'false';
      case 'null': return 'null';
      case 'undef': return 'undefined';
      case 'simple': return 'simple(' + item.value + ')';
      case 'bytes': return 'h\'' + bytesToHex(item.value) + '\'';
      case 'text': return JSON.stringify(item.value);
      case 'tag': return 'tag(' + item.tag + ', ' + stringify(item.value, indent) + ')';
      case 'array':
        if (item.value.length === 0) return '[]';
        return '[\n' + item.value.map(function (v) { return npad + stringify(v, indent + 1); }).join(',\n') + '\n' + pad + ']';
      case 'map':
        if (item.value.length === 0) return '{}';
        return '{\n' + item.value.map(function (kv) {
          return npad + stringify(kv[0], indent + 1) + ': ' + stringify(kv[1], indent + 1);
        }).join(',\n') + '\n' + pad + '}';
      case 'break': return '<break>';
      default: return '<unknown>';
    }
  }

  function findInMap(mapItem, key) {
    if (!mapItem || mapItem.type !== 'map') return null;
    for (var i = 0; i < mapItem.value.length; i++) {
      var k = mapItem.value[i][0];
      if ((k.type === 'uint' || k.type === 'nint') && k.value === key) return mapItem.value[i][1];
      if (k.type === 'text' && k.value === key) return mapItem.value[i][1];
    }
    return null;
  }

  root.AmbiSecureCBOR = {
    decode: decode,
    stringify: stringify,
    findInMap: findInMap,
    bytesToHex: bytesToHex
  };
})(typeof window !== 'undefined' ? window : globalThis);
