(function () {
  'use strict';

  // Static reference table. "wc" = Web Crypto status:
  //   'std'   -> mandated by the W3C Web Crypto spec (P-256/384/521)
  //   'newer' -> Secure Curves, only in newer browsers (Ed25519/X25519) — probed at runtime
  //   'no'    -> not exposed via Web Crypto at all
  var CURVES = [
    { name: 'P-192', aliases: 'secp192r1, prime192v1', bits: 192, sec: 96, use: 'Legacy TLS / smart cards (deprecated)', family: 'NIST prime', wc: 'no', wcKind: '', legacy: true },
    { name: 'P-224', aliases: 'secp224r1', bits: 224, sec: 112, use: 'Constrained / legacy signing', family: 'NIST prime', wc: 'no', wcKind: '', legacy: true },
    { name: 'P-256', aliases: 'secp256r1, prime256v1', bits: 256, sec: 128, use: 'TLS, FIDO/COSE, signing + key agreement', family: 'NIST prime', wc: 'std', wcKind: 'pcurve', legacy: false },
    { name: 'P-384', aliases: 'secp384r1', bits: 384, sec: 192, use: 'TLS, high-assurance signing', family: 'NIST prime', wc: 'std', wcKind: 'pcurve', legacy: false },
    { name: 'P-521', aliases: 'secp521r1', bits: 521, sec: 256, use: 'High-assurance signing / key agreement', family: 'NIST prime', wc: 'std', wcKind: 'pcurve', legacy: false },
    { name: 'secp256k1', aliases: 'Koblitz', bits: 256, sec: 128, use: 'Bitcoin / Ethereum signatures', family: 'Special', wc: 'no', wcKind: '', legacy: false },
    { name: 'brainpoolP256r1', aliases: 'BP-256', bits: 256, sec: 128, use: 'EU / government TLS + signing', family: 'Brainpool', wc: 'no', wcKind: '', legacy: false },
    { name: 'brainpoolP384r1', aliases: 'BP-384', bits: 384, sec: 192, use: 'EU / government signing', family: 'Brainpool', wc: 'no', wcKind: '', legacy: false },
    { name: 'brainpoolP512r1', aliases: 'BP-512', bits: 512, sec: 256, use: 'EU / government high assurance', family: 'Brainpool', wc: 'no', wcKind: '', legacy: false },
    { name: 'Ed25519', aliases: 'EdDSA, Curve25519', bits: 256, sec: 128, use: 'Signing — SSH, FIDO2, TLS certs', family: 'Edwards', wc: 'newer', wcKind: 'eddsa', legacy: false },
    { name: 'Ed448', aliases: 'EdDSA, Curve448', bits: 448, sec: 224, use: 'Signing — high security margin', family: 'Edwards', wc: 'no', wcKind: '', legacy: false },
    { name: 'X25519', aliases: 'Curve25519 (Montgomery)', bits: 256, sec: 128, use: 'Key agreement — TLS 1.3 handshake', family: 'Montgomery', wc: 'newer', wcKind: 'ecdh-modern', legacy: false },
    { name: 'X448', aliases: 'Curve448 (Montgomery)', bits: 448, sec: 224, use: 'Key agreement — high security margin', family: 'Montgomery', wc: 'no', wcKind: '', legacy: false }
  ];

  // Probe whether a "newer" curve is actually available in this browser.
  // Returns a Promise<boolean>. Never throws.
  function probeNewerCurve(name) {
    if (typeof crypto === 'undefined' || !crypto.subtle) return Promise.resolve(false);
    var algo = (name === 'Ed25519') ? { name: 'Ed25519' } : { name: 'X25519' };
    var usages = (name === 'Ed25519') ? ['sign', 'verify'] : ['deriveBits'];
    try {
      return crypto.subtle.generateKey(algo, true, usages)
        .then(function () { return true; })
        .catch(function () { return false; });
    } catch (e) { return Promise.resolve(false); }
  }

  function effectiveWc(c, newerOk) {
    if (c.wc === 'std') return 'yes';
    if (c.wc === 'newer') return newerOk[c.name] ? 'yes' : 'unknown';
    return 'no';
  }

  function badgeFor(c, newerOk) {
    var st = effectiveWc(c, newerOk);
    if (st === 'yes') return '<span class="tech-badge tech-badge--ok">Web Crypto</span>';
    if (st === 'unknown') return '<span class="tech-badge tech-badge--warn">Newer browsers</span>';
    return '<span class="tech-badge">Reference only</span>';
  }

  function rowMatches(c, q) {
    if (!q) return true;
    var hay = (c.name + ' ' + c.aliases + ' ' + c.use + ' ' + c.family).toLowerCase();
    return hay.indexOf(q) !== -1;
  }

  function renderTable(container, opts, newerOk) {
    var q = (opts.filter || '').trim().toLowerCase();
    var onlySupported = !!opts.onlySupported;
    var rows = '';
    var shown = 0;
    for (var i = 0; i < CURVES.length; i++) {
      var c = CURVES[i];
      if (!rowMatches(c, q)) continue;
      if (onlySupported && effectiveWc(c, newerOk) === 'no') continue;
      shown++;
      var nameCell = AS.escHTML(c.name);
      if (c.legacy) nameCell += ' <span class="tech-badge tech-badge--err">legacy</span>';
      rows +=
        '<div class="parsed-row" style="grid-template-columns:160px 1fr;">' +
          '<span class="label">' + nameCell + '</span>' +
          '<div class="value" style="font-family:\'Source Sans 3\',sans-serif;">' +
            '<div style="margin-bottom:6px;">' + badgeFor(c, newerOk) +
              ' <span class="tech-badge tech-badge--info">' + c.bits + '-bit</span>' +
              ' <span class="tech-badge">~' + c.sec + '-bit security</span>' +
              ' <span class="tech-badge">' + AS.escHTML(c.family) + '</span></div>' +
            '<div style="color:var(--brand-grey);font-size:13px;"><strong>Aliases:</strong> ' + AS.escHTML(c.aliases) + '</div>' +
            '<div style="color:var(--brand-grey);font-size:13px;"><strong>Use:</strong> ' + AS.escHTML(c.use) + '</div>' +
          '</div>' +
        '</div>';
    }
    if (!shown) { AS.renderPlaceholder(container, 'No curves match that filter.'); return; }
    container.innerHTML = rows;
  }

  function bytesToHex(u8) {
    var s = '';
    for (var i = 0; i < u8.length; i++) s += u8[i].toString(16).padStart(2, '0');
    return s.replace(/(..)(?=.)/g, '$1 ');
  }

  function curveByName(name) {
    for (var i = 0; i < CURVES.length; i++) if (CURVES[i].name === name) return CURVES[i];
    return null;
  }

  // Generate a demo key pair for a Web-Crypto-supported curve.
  // Resolves to { jwk, rawHex|null } or rejects with a clear Error.
  function generateDemo(name) {
    if (typeof crypto === 'undefined' || !crypto.subtle) {
      return Promise.reject(new Error('This browser does not expose the Web Crypto subtle API.'));
    }
    var c = curveByName(name);
    if (!c) return Promise.reject(new Error('Unknown curve "' + name + '".'));
    if (c.wc === 'no') {
      return Promise.reject(new Error(name + ' is reference only — it is not available via Web Crypto in any browser. Use a dedicated library.'));
    }
    var algo, usages;
    if (c.wcKind === 'pcurve') { algo = { name: 'ECDSA', namedCurve: name }; usages = ['sign', 'verify']; }
    else if (c.wcKind === 'eddsa') { algo = { name: 'Ed25519' }; usages = ['sign', 'verify']; }
    else if (c.wcKind === 'ecdh-modern') { algo = { name: 'X25519' }; usages = ['deriveBits']; }
    else return Promise.reject(new Error(name + ' is not supported for key generation here.'));

    return crypto.subtle.generateKey(algo, true, usages).then(function (pair) {
      var pub = pair.publicKey;
      var jwkP = crypto.subtle.exportKey('jwk', pub);
      var rawP = (c.wcKind === 'pcurve')
        ? crypto.subtle.exportKey('raw', pub).then(function (buf) { return bytesToHex(new Uint8Array(buf)); }).catch(function () { return null; })
        : Promise.resolve(null);
      return Promise.all([jwkP, rawP]).then(function (r) {
        return { jwk: r[0], rawHex: r[1] };
      });
    }).catch(function (e) {
      throw new Error('Could not generate a ' + name + ' key in this browser: ' + (e && e.message ? e.message : 'unsupported') + '.');
    });
  }

  function renderKey(container, name, res) {
    var jwkStr = JSON.stringify(res.jwk, null, 2);
    var html =
      '<div style="margin-bottom:10px;"><span class="tech-badge tech-badge--ok">' + AS.escHTML(name) + '</span> ' +
      '<span class="tech-badge tech-badge--info">PUBLIC KEY</span> <span class="tech-badge">demo only</span></div>' +
      '<div class="parsed-row"><span class="label">Public JWK</span><div class="value">' +
        '<pre style="white-space:pre-wrap;word-break:break-all;font-family:\'JetBrains Mono\',monospace;font-size:13px;line-height:1.6;margin:0;">' +
        AS.escHTML(jwkStr) + '</pre></div></div>';
    if (res.rawHex) {
      html += '<div class="parsed-row"><span class="label">Raw point (04‖X‖Y)</span><div class="value" style="font-family:\'JetBrains Mono\',monospace;word-break:break-all;">' +
        AS.escHTML(res.rawHex) + '</div></div>';
    } else {
      html += '<div class="parsed-row"><span class="label">Raw point</span><div class="value note">Raw export is shown for the NIST P-curves; modern Edwards/Montgomery keys are exported as JWK only here.</div></div>';
    }
    container.innerHTML = html;
    container.dataset.value = res.rawHex ? (jwkStr + '\n\nRaw: ' + res.rawHex.replace(/ /g, '')) : jwkStr;
  }

  function init() {
    var table = AS.$('ecc-table'), filter = AS.$('ecc-filter');
    var btnSupported = AS.$('ecc-supported'), btnAll = AS.$('ecc-all');
    var curveSel = AS.$('ecc-curve'), keyOut = AS.$('ecc-key');
    var genBtn = AS.$('ecc-gen'), copyBtn = AS.$('ecc-copy');
    if (!table) return;

    var state = { filter: '', onlySupported: false };
    var newerOk = {}; // name -> bool, filled in by probes

    function draw() { renderTable(table, state, newerOk); }
    draw();

    // Probe the modern curves once, then redraw so the badges are accurate.
    Promise.all([probeNewerCurve('Ed25519'), probeNewerCurve('X25519')]).then(function (r) {
      newerOk['Ed25519'] = r[0];
      newerOk['X25519'] = r[1];
      draw();
    });

    if (filter) filter.addEventListener('input', function () { state.filter = filter.value; draw(); });
    if (btnSupported) btnSupported.addEventListener('click', function () { state.onlySupported = true; draw(); });
    if (btnAll) btnAll.addEventListener('click', function () { state.onlySupported = false; draw(); });

    function doGen() {
      var name = curveSel.value;
      keyOut.dataset.value = '';
      AS.renderPlaceholder(keyOut, 'Generating a ' + name + ' key pair…');
      generateDemo(name).then(function (res) {
        renderKey(keyOut, name, res);
      }).catch(function (e) {
        AS.renderError(keyOut, e.message);
      });
    }

    if (genBtn) genBtn.addEventListener('click', doGen);
    AS.bindCopy(copyBtn, function () { return keyOut.dataset.value || ''; });
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CURVES: CURVES, effectiveWc: effectiveWc, rowMatches: rowMatches, curveByName: curveByName };
  }
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  }
})();
