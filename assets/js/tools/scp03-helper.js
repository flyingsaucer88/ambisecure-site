(function () {
  'use strict';

  // ---- hex helpers (pure) -------------------------------------------------
  function hexToBytes(s) {
    var clean = String(s == null ? '' : s).replace(/0x/gi, '').replace(/[\s,:;_-]+/g, '');
    if (clean.length === 0) return new Uint8Array(0);
    if (clean.length % 2 !== 0) throw new Error('Hex must have an even number of digits.');
    if (!/^[0-9a-fA-F]*$/.test(clean)) throw new Error('Hex contains non-hex characters.');
    var u8 = new Uint8Array(clean.length / 2);
    for (var i = 0; i < u8.length; i++) u8[i] = parseInt(clean.substr(i * 2, 2), 16);
    return u8;
  }

  function bytesToHex(u8) {
    var s = '';
    for (var i = 0; i < u8.length; i++) s += (u8[i] < 16 ? '0' : '') + u8[i].toString(16);
    return s.toUpperCase();
  }

  function bytesToHexSpaced(u8) {
    return bytesToHex(u8).replace(/(..)(?=.)/g, '$1 ');
  }

  function concat(arrays) {
    var total = 0, i;
    for (i = 0; i < arrays.length; i++) total += arrays[i].length;
    var out = new Uint8Array(total), off = 0;
    for (i = 0; i < arrays.length; i++) { out.set(arrays[i], off); off += arrays[i].length; }
    return out;
  }

  function xorBlock(a, b) {
    var out = new Uint8Array(a.length);
    for (var i = 0; i < a.length; i++) out[i] = a[i] ^ b[i];
    return out;
  }

  // Left-shift a 16-byte block by one bit (used in CMAC subkey generation).
  function leftShift1(block) {
    var out = new Uint8Array(block.length);
    var carry = 0;
    for (var i = block.length - 1; i >= 0; i--) {
      var b = block[i];
      out[i] = ((b << 1) & 0xff) | carry;
      carry = (b & 0x80) ? 1 : 0;
    }
    return out;
  }

  // ---- AES-CMAC (RFC 4493 generalised to AES-128/192/256) ----------------
  // Encrypt a single 16-byte block with AES in ECB-equivalent form, built on
  // crypto.subtle AES-CBC with a zero IV (CBC of one block with IV=0 == ECB).
  async function aesEncryptBlock(cryptoKey, block) {
    var zeroIV = new Uint8Array(16);
    var ct = await crypto.subtle.encrypt({ name: 'AES-CBC', iv: zeroIV }, cryptoKey, block);
    // AES-CBC adds PKCS#7 padding (one extra block); we only want the first 16 bytes.
    return new Uint8Array(ct).slice(0, 16);
  }

  async function importCbcKey(keyBytes) {
    return crypto.subtle.importKey('raw', keyBytes, { name: 'AES-CBC' }, false, ['encrypt']);
  }

  // RB constant for the 128-bit block size.
  var RB = 0x87;

  async function cmacSubkeys(cryptoKey) {
    var L = await aesEncryptBlock(cryptoKey, new Uint8Array(16));
    var K1 = leftShift1(L);
    if (L[0] & 0x80) K1[15] ^= RB;
    var K2 = leftShift1(K1);
    if (K1[0] & 0x80) K2[15] ^= RB;
    return { K1: K1, K2: K2 };
  }

  // Full AES-CMAC over a message, returning the 16-byte tag.
  async function aesCmac(keyBytes, message) {
    var cryptoKey = await importCbcKey(keyBytes);
    var subs = await cmacSubkeys(cryptoKey);
    var msg = message || new Uint8Array(0);
    var n = Math.ceil(msg.length / 16);
    var lastComplete;
    if (n === 0) { n = 1; lastComplete = false; }
    else lastComplete = (msg.length % 16) === 0;

    var lastBlock;
    if (lastComplete) {
      lastBlock = xorBlock(msg.slice((n - 1) * 16, n * 16), subs.K1);
    } else {
      var rem = msg.slice((n - 1) * 16);
      var padded = new Uint8Array(16);
      padded.set(rem, 0);
      padded[rem.length] = 0x80;
      lastBlock = xorBlock(padded, subs.K2);
    }

    var x = new Uint8Array(16);
    for (var i = 0; i < n - 1; i++) {
      var blk = msg.slice(i * 16, (i + 1) * 16);
      x = await aesEncryptBlock(cryptoKey, xorBlock(x, blk));
    }
    return aesEncryptBlock(cryptoKey, xorBlock(x, lastBlock));
  }

  // ---- SCP03 KDF (NIST SP 800-108 counter mode, CMAC as PRF) -------------
  // GlobalPlatform Amendment D, Annex D.2.
  // Data input per iteration i:
  //   Label(11 bytes of 0x00) || derivationConstant(1) || 0x00(separator)
  //     || L(2 bytes, output length in BITS) || i(1 byte counter) || context
  // Repeated with incrementing counter until enough bytes are produced.
  async function scp03Kdf(keyBytes, derivationConstant, context, outBits) {
    var outBytes = outBits / 8;
    var label = new Uint8Array(11); // SCP03 label is eleven zero bytes
    var Lbe = new Uint8Array([(outBits >>> 8) & 0xff, outBits & 0xff]);
    var blocks = [];
    var produced = 0;
    var counter = 1;
    while (produced < outBytes) {
      var fixed = concat([
        label,
        new Uint8Array([derivationConstant & 0xff]),
        new Uint8Array([0x00]),
        Lbe,
        new Uint8Array([counter & 0xff]),
        context
      ]);
      var blk = await aesCmac(keyBytes, fixed);
      blocks.push(blk);
      produced += blk.length;
      counter++;
    }
    return concat(blocks).slice(0, outBytes);
  }

  // Derivation constants per Amendment D.
  var DC = {
    cardCrypto: 0x00,
    hostCrypto: 0x01,
    sEnc: 0x04,
    sMac: 0x06,
    sRmac: 0x07
  };

  // Compute every SCP03 value from static keys + challenges.
  async function deriveAll(kEnc, kMac, hostChallenge, cardChallenge) {
    var context = concat([hostChallenge, cardChallenge]);
    var keyBits = kEnc.length * 8;

    var sEnc = await scp03Kdf(kEnc, DC.sEnc, context, keyBits);
    var sMac = await scp03Kdf(kMac, DC.sMac, context, keyBits);
    var sRmac = await scp03Kdf(kMac, DC.sRmac, context, keyBits);

    // Cryptograms are 64-bit (8-byte) outputs derived under S-MAC.
    var cardCrypto = await scp03Kdf(sMac, DC.cardCrypto, context, 64);
    var hostCrypto = await scp03Kdf(sMac, DC.hostCrypto, context, 64);

    return {
      context: context,
      sEnc: sEnc, sMac: sMac, sRmac: sRmac,
      cardCryptogram: cardCrypto, hostCryptogram: hostCrypto
    };
  }

  function validKeyLen(n) { return n === 16 || n === 24 || n === 32; }

  // ---- DOM init -----------------------------------------------------------
  function row(label, valueHTML, note) {
    return '<div class="parsed-row"><span class="label">' + AS.escHTML(label) + '</span>' +
      '<div><div class="value" style="font-family:\'JetBrains Mono\',monospace;word-break:break-all;">' + valueHTML + '</div>' +
      (note ? '<span class="note">' + note + '</span>' : '') + '</div></div>';
  }

  function init() {
    var encInput = AS.$('scp-enc'), macInput = AS.$('scp-mac');
    var hostInput = AS.$('scp-host'), cardInput = AS.$('scp-card');
    var output = AS.$('scp-output');
    var sample = AS.$('scp-sample'), clearBtn = AS.$('scp-clear'), copyBtn = AS.$('scp-copy');
    if (!encInput || !macInput || !hostInput || !cardInput || !output) return;

    function lastResult() { return output.dataset.value || ''; }

    async function go() {
      output.dataset.value = '';
      var encRaw = encInput.value.trim(), macRaw = macInput.value.trim();
      var hostRaw = hostInput.value.trim(), cardRaw = cardInput.value.trim();
      if (!encRaw && !macRaw && !hostRaw && !cardRaw) {
        AS.renderPlaceholder(output, 'Enter static keys and challenges, or load the sample-format values.');
        return;
      }
      if (!(typeof crypto !== 'undefined' && crypto.subtle)) {
        AS.renderError(output, 'Web Crypto (crypto.subtle) is not available in this browser context. AES-CMAC cannot run, so no values are shown rather than emitting fake output.');
        return;
      }
      try {
        var kEnc = hexToBytes(encRaw), kMac = hexToBytes(macRaw);
        var host = hexToBytes(hostRaw), card = hexToBytes(cardRaw);
        if (!validKeyLen(kEnc.length)) throw new Error('K-ENC must be 16, 24, or 32 bytes (AES-128/192/256).');
        if (!validKeyLen(kMac.length)) throw new Error('K-MAC must be 16, 24, or 32 bytes (AES-128/192/256).');
        if (kEnc.length !== kMac.length) throw new Error('K-ENC and K-MAC must be the same length in SCP03.');
        if (host.length !== 8) throw new Error('Host challenge must be exactly 8 bytes (16 hex digits).');
        if (card.length !== 8) throw new Error('Card challenge must be exactly 8 bytes (16 hex digits).');

        var r = await deriveAll(kEnc, kMac, host, card);

        var copyText =
          'context (host||card): ' + bytesToHex(r.context) + '\n' +
          'S-ENC: ' + bytesToHex(r.sEnc) + '\n' +
          'S-MAC: ' + bytesToHex(r.sMac) + '\n' +
          'S-RMAC: ' + bytesToHex(r.sRmac) + '\n' +
          'card cryptogram: ' + bytesToHex(r.cardCryptogram) + '\n' +
          'host cryptogram: ' + bytesToHex(r.hostCryptogram);
        output.dataset.value = copyText;

        var html = '<div style="margin-bottom:14px;">' +
          '<span class="tech-badge tech-badge--warn">EDUCATIONAL AID — NOT A CERTIFIED IMPLEMENTATION</span> ' +
          '<span class="tech-badge tech-badge--info">AES-CMAC / SP 800-108</span> ' +
          '<span class="tech-badge">AES-' + (kEnc.length * 8) + '</span></div>';

        html += '<h3 style="margin:6px 0 8px;font-size:14px;">Derivation context</h3>';
        html += row('context = host||card', bytesToHexSpaced(r.context), 'Concatenation of the host challenge and the card challenge.');

        html += '<h3 style="margin:18px 0 8px;font-size:14px;">Session keys</h3>';
        html += row('S-ENC (const 0x04)', bytesToHexSpaced(r.sEnc), 'Session command-encryption key.');
        html += row('S-MAC (const 0x06)', bytesToHexSpaced(r.sMac), 'Session command-MAC key.');
        html += row('S-RMAC (const 0x07)', bytesToHexSpaced(r.sRmac), 'Session response-MAC key.');

        html += '<h3 style="margin:18px 0 8px;font-size:14px;">Cryptograms (8 bytes each, derived under S-MAC)</h3>';
        html += row('Card cryptogram (const 0x00)', bytesToHexSpaced(r.cardCryptogram), 'The card returns this in INITIALIZE UPDATE; the host compares it.');
        html += row('Host cryptogram (const 0x01)', bytesToHexSpaced(r.hostCryptogram), 'The host sends this in EXTERNAL AUTHENTICATE.');

        html += '<div class="note" style="margin-top:16px;padding:12px 16px;background:rgba(199,122,0,0.08);border-left:3px solid var(--secure-amber);border-radius:3px;">' +
          '<strong>Disclaimer:</strong> this is an educational developer aid that reproduces the SCP03 AES-CMAC key-derivation maths in your browser. It is <em>not</em> a certified GlobalPlatform secure-channel implementation, performs no key wrapping, channel state, or sequence-counter handling, and must never be used for production key management. Use pseudo-random or test keys only.</div>';

        output.innerHTML = html;
      } catch (e) {
        AS.renderError(output, e.message);
      }
    }

    encInput.addEventListener('input', go);
    macInput.addEventListener('input', go);
    hostInput.addEventListener('input', go);
    cardInput.addEventListener('input', go);

    if (sample) sample.addEventListener('click', function () {
      // Short, made-up SAMPLE-FORMAT values — not real keys.
      encInput.value = '404142434445464748494A4B4C4D4E4F';
      macInput.value = '505152535455565758595A5B5C5D5E5F';
      hostInput.value = '0102030405060708';
      cardInput.value = 'A1B2C3D4E5F60718';
      go();
    });
    if (clearBtn) clearBtn.addEventListener('click', function () {
      encInput.value = ''; macInput.value = ''; hostInput.value = ''; cardInput.value = '';
      go(); encInput.focus();
    });
    AS.bindCopy(copyBtn, lastResult);
    go();
  }

  // Expose pure logic for Node self-test / isolated reuse.
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      hexToBytes: hexToBytes, bytesToHex: bytesToHex,
      leftShift1: leftShift1, xorBlock: xorBlock, concat: concat,
      aesCmac: aesCmac, scp03Kdf: scp03Kdf, deriveAll: deriveAll,
      validKeyLen: validKeyLen, DC: DC
    };
  }
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  }
})();
