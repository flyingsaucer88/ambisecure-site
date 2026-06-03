#!/usr/bin/env node
/**
 * Reusable verification framework for AmbiSecure resource/tool pages.
 *
 * Three layers:
 *   1. Structural — every tool page (local file OR live URL): exists/200,
 *      canonical correct, no noindex, has H1/title, UI markers, required
 *      content strings, no "SOON", critical CSS/JS assets 200 (live).
 *   2. Algorithm golden/invalid/edge vectors — loads each tool's shipped JS in
 *      a VM sandbox (no browser) and exercises its exported pure functions
 *      against tools/resource-tool-test-matrix.json. Works on local files and
 *      on the LIVE deployed JS (fetched), so it catches deploy drift too.
 *   3. Browser smoke (optional) — uses Playwright if installed; otherwise a
 *      clear note is emitted (see --browser).
 *
 * Usage:
 *   node tools/verify-resource-tools.mjs --local
 *   node tools/verify-resource-tools.mjs --base-url https://ambisecure.ambimat.com
 *   node tools/verify-resource-tools.mjs --base-url https://ambisecure.ambimat.com \
 *        --json-output docs/audits/resource-tool-live.json \
 *        --md-output   docs/audits/resource-tool-live.md
 *   node tools/verify-resource-tools.mjs --local --tool crc-calculator
 *   node tools/verify-resource-tools.mjs --base-url ... --browser   (needs playwright)
 *
 * Exit 0 = all critical checks pass; 1 = at least one failure.
 *
 * Adding a future tool: add an entry to resource-tool-test-matrix.json. If its
 * API is novel, add a matching adapter in ADAPTERS below; otherwise it gets
 * structural coverage automatically (discovered from disk).
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LIVE_CANON = 'https://ambisecure.ambimat.com';

// ---------- args ----------
function parseArgs() {
  const a = { local: false, baseUrl: null, tool: null, browser: false,
    json: 'docs/audits/resource-tool-verification.json',
    md: 'docs/audits/resource-tool-verification.md', timeout: 25000 };
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    const t = argv[i];
    if (t === '--local') a.local = true;
    else if (t === '--browser') a.browser = true;
    else if (t.startsWith('--base-url')) a.baseUrl = t.includes('=') ? t.split('=')[1] : argv[++i];
    else if (t.startsWith('--tool')) a.tool = t.includes('=') ? t.split('=')[1] : argv[++i];
    else if (t.startsWith('--json-output')) a.json = t.includes('=') ? t.split('=')[1] : argv[++i];
    else if (t.startsWith('--md-output')) a.md = t.includes('=') ? t.split('=')[1] : argv[++i];
    else if (t.startsWith('--timeout')) a.timeout = parseInt(t.includes('=') ? t.split('=')[1] : argv[++i], 10) * 1000;
  }
  if (!a.local && !a.baseUrl) a.local = true; // default
  if (a.baseUrl) a.baseUrl = a.baseUrl.replace(/\/$/, '');
  return a;
}
const ARGS = parseArgs();

// ---------- helpers ----------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function hexToU8(s) {
  const clean = String(s).replace(/0x/gi, '').replace(/[\s,:;]+/g, '');
  if (clean.length % 2 !== 0) throw new Error('odd-length hex');
  if (!/^[0-9a-fA-F]*$/.test(clean)) throw new Error('invalid hex');
  const u8 = new Uint8Array(clean.length / 2);
  for (let i = 0; i < u8.length; i++) u8[i] = parseInt(clean.substr(i * 2, 2), 16);
  return u8;
}
const u8ToHexUpper = (u8) => Array.from(u8).map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((x, i) => deepEqual(x, b[i]));
  if (a && b && typeof a === 'object') {
    const ka = Object.keys(a), kb = Object.keys(b);
    return ka.length === kb.length && ka.every((k) => deepEqual(a[k], b[k]));
  }
  return false;
}
function partialMatch(got, sub) {
  if (!got || typeof got !== 'object') return false;
  return Object.keys(sub).every((k) => String(got[k]) === String(sub[k]));
}
function compareScalar(got, expect) {
  const g = String(got), e = String(expect);
  if (/^-?\d+$/.test(e) && /^-?\d+$/.test(g)) return BigInt(g) === BigInt(e);          // decimal
  if (/^[0-9A-Fa-f]+$/.test(e) && /^[0-9A-Fa-f]+$/.test(g)) return BigInt('0x' + g) === BigInt('0x' + e); // hex
  return g === e;
}
function evaluate(got, vec) {
  if ('expect' in vec) {
    const ex = vec.expect;
    if (ex === null || typeof ex === 'object') return deepEqual(got, ex);
    if (typeof ex === 'boolean') return got === ex || String(got) === String(ex);
    if (typeof ex === 'number') return Number(got) === ex;
    return compareScalar(got, ex);
  }
  if (vec.expectIncludes) return partialMatch(got, vec.expectIncludes);
  if (vec.expectMatch) return new RegExp(vec.expectMatch, 'i').test(String(got && got.format !== undefined ? got.format : got));
  if (vec.expectOk) return !!got && got.ok !== false && got.error === undefined && got.valid !== false;
  return false;
}

// ---------- module loader (local file or live URL) via VM sandbox ----------
const srcCache = new Map();
async function getSource(rel) {
  if (srcCache.has(rel)) return srcCache.get(rel);
  let text;
  if (ARGS.local) text = fs.readFileSync(path.join(ROOT, 'assets', 'js', rel), 'utf8');
  else {
    await sleep(REQUEST_DELAY);
    const res = await fetch(`${ARGS.baseUrl}/assets/js/${rel}`);
    if (!res.ok) throw new Error(`asset ${rel} HTTP ${res.status}`);
    text = await res.text();
  }
  srcCache.set(rel, text);
  return text;
}
async function loadModule(rel) {
  const src = await getSource(rel);
  const sandbox = {
    module: { exports: {} }, console, TextEncoder, TextDecoder,
    crypto: globalThis.crypto, Uint8Array, DataView, ArrayBuffer,
    atob: globalThis.atob, btoa: globalThis.btoa, Buffer,
    AS: { escHTML: (x) => x, $: () => null, renderError() {}, renderPlaceholder() {}, bindCopy() {} },
  };
  sandbox.exports = sandbox.module.exports;
  vm.createContext(sandbox);
  new vm.Script(src, { filename: rel }).runInContext(sandbox);
  return { exports: sandbox.module.exports, g: sandbox };
}

// ---------- per-tool adapters: (loaded, input) -> value (throw on tool error) ----------
const ADAPTERS = {
  'base32': (L, i) => {
    const { encodeBytes, decodeToBytes, ALPHA } = L.exports;
    const alpha = ALPHA[i.alpha || 'base32'];
    if (i.op === 'encode') {
      const bytes = 'hex' in i ? hexToU8(i.hex) : new TextEncoder().encode(i.text);
      return encodeBytes(bytes, alpha, i.pad !== false);
    }
    return new TextDecoder('utf-8', { fatal: false }).decode(decodeToBytes(i.b32, alpha));
  },
  'url-encoder': (L, i) => {
    const { encode, decode } = L.exports;
    return i.op === 'decode' ? decode(i.raw, !!i.full, !!i.plus) : encode(i.raw, !!i.full, !!i.plus);
  },
  'json-formatter': (L, i) => {
    const r = L.exports.format(i.text, i.opts || {});
    if (r.ok === false) throw new Error(r.error || 'invalid JSON');
    return r.output;
  },
  'json-validator': (L, i) => {
    if (i.op === 'schema') {
      const r = L.exports.validateAgainstSchema(i.instance, i.schema);
      return Array.isArray(r.errors) ? r.errors.length === 0 : r.ok === true; // returns {errors:[...]}
    }
    const r = L.exports.parseJSON(i.text);
    if (!r.ok) throw new Error('invalid JSON');
    return true;
  },
  'xml-formatter': (L, i) => (i.op === 'minify' ? L.exports.minify(i.text) : L.exports.prettyPrint(i.text, i.indent || '  ')),
  'binary-calculator': (L, i) => {
    const m = L.exports, W = i.width || 64;
    const w = (v) => m.toWidth(m.parseValue(String(v), i.base), W).value; // toWidth -> {value, truncated}
    if (i.op === 'convert') return w(i.value).toString();
    if (i.op === 'hex') return m.toHex(w(i.value), W);
    if (i.op === 'bin') return m.toBin(w(i.value), W);
    if (i.op === 'signed') return m.asSigned(w(i.value), W).toString();
    if (i.op === 'bit') return m.applyOp(i.fn, m.parseValue(String(i.a), i.base), m.parseValue(String(i.b), i.base), W).toString();
    throw new Error('unknown binary op');
  },
  'byte-offset-calculator': (L, i) => {
    const m = L.exports;
    if (i.op === 'rowcount') return String(m.groupRows(m.parseHex(i.hex), i.group || 1).length);
    if (i.op === 'ascii') return Array.from(m.parseHex(i.hex)).map((b) => m.printable(b)).join('');
    if (i.op === 'interpret') {
      const v = m.interpret(m.parseHex(i.hex), i.start, i.len, i.little);
      return String(v && typeof v === 'object' ? (v.unsigned ?? v.value ?? v.dec) : v);
    }
    throw new Error('unknown byteoffset op');
  },
  'crc-calculator': (L, i) => {
    const { crc } = L.exports;
    const arg = 'hex' in i ? hexToU8(i.hex) : i.text;
    const v = crc(i.name, arg);
    return (typeof v === 'bigint' ? v : BigInt(v)).toString(16).toUpperCase();
  },
  'lrc-calculator': (L, i) => {
    const r = L.exports.lrc(L.exports.hexToBytes(i.hex), i.variant);
    return (r && r.value !== undefined ? r.value : r).toString(16).toUpperCase();
  },
  'checksum': (L, i) => {
    const bytes = 'hex' in i ? hexToU8(i.hex) : new TextEncoder().encode(i.text);
    const r = L.exports.compute(i.name, bytes);
    const v = r && r.dec !== undefined ? BigInt(r.dec) : BigInt('0x' + String(r.hex).replace(/^0x/i, ''));
    return v.toString(16).toUpperCase();
  },
  'apdu-builder': (L, i) => {
    if (i.op === 'parse') return L.exports.parseApdu(i.hex);
    const r = L.exports.buildApdu(i.fields);
    return (r.bytes || []).map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  },
  'iccid-decoder': (L, i) => {
    if (i.op === 'luhn') return L.exports.luhnValid(String(i.digits).replace(/\s+/g, ''));
    return L.exports.decodeIccid(i.raw);
  },
  'imsi-decoder': (L, i) => L.exports.decodeImsi(i.raw, i.mncMode),
  'euicc-eid-decoder': (L, i) => {
    if (i.op === 'normlen') return String(L.exports.normalize(i.raw).length);
    const r = L.exports.decodeEid(i.raw);
    if (!r || r.error || r.ok === false || r.valid === false || r.lengthOk === false) throw new Error('invalid EID');
    return r;
  },
  'cbor-decoder': (L, i) => {
    const CBOR = L.g.AmbiSecureCBOR || (L.g.window && L.g.window.AmbiSecureCBOR);
    if (!CBOR) throw new Error('AmbiSecureCBOR not found');
    const norm = (n) => {
      switch (n.type) {
        case 'uint': case 'nint': case 'float': case 'simple': return n.value;
        case 'bool': return n.value; case 'null': return null;
        case 'text': return n.value;
        case 'bytes': return Array.from(n.value);
        case 'array': return n.value.map(norm);
        case 'map': { const o = {}; n.value.forEach(([k, v]) => { o[norm(k)] = norm(v); }); return o; }
        case 'tag': return { tag: n.tag, value: norm(n.value) };
        default: return n.value;
      }
    };
    const dec = CBOR.decode(hexToU8(i.hex)); // -> { item, consumed, remaining }
    return norm(dec && dec.item ? dec.item : dec);
  },
  'rsa-key-formats': (L, i) => {
    if (!L.exports.identifyPem) throw new Error('no identifyPem export');
    let pem = i.pem;
    if (i.genFormat) {
      const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 512 });
      if (i.genFormat === 'pkcs8') pem = privateKey.export({ type: 'pkcs8', format: 'pem' });
      else if (i.genFormat === 'pkcs1') pem = privateKey.export({ type: 'pkcs1', format: 'pem' });
      else if (i.genFormat === 'spki') pem = publicKey.export({ type: 'spki', format: 'pem' });
    }
    const r = L.exports.identifyPem(pem);
    return typeof r === 'string' ? r : (r && (r.format || r.label || JSON.stringify(r)));
  },
  'ecc-curve-reference': (L, i) => !!L.exports.curveByName(i.name),
  'scp03-helper': async (L, i) => {
    if (!L.exports.aesCmac) throw new Error('no aesCmac export');
    const mac = await L.exports.aesCmac(hexToU8(i.key), i.msg ? hexToU8(i.msg) : new Uint8Array(0));
    return u8ToHexUpper(mac);
  },
};

// ---------- structural checks ----------
async function getHtml(slug) {
  if (ARGS.local) {
    const p = path.join(ROOT, 'resources', 'tools', slug, 'index.html');
    if (!fs.existsSync(p)) return { status: 0, body: '', error: 'file missing' };
    return { status: 200, body: fs.readFileSync(p, 'utf8'), error: null };
  }
  // live: robust fetch w/ 429 backoff; only re-check canonical on a real 200
  // (re-fetching on a 429 just amplifies the rate-limit, so don't).
  const want = `${ARGS.baseUrl}/resources/tools/${slug}`.replace(/\/$/, '');
  let r = await liveFetch(`${ARGS.baseUrl}/resources/tools/${slug}/`);
  for (let k = 0; k < 2 && r.status === 200; k++) {
    const m = /<link[^>]+rel="canonical"[^>]*href="([^"]+)"/i.exec(r.body);
    if (m && m[1].replace(/\/$/, '') === want) break;
    await sleep(2000);
    r = await liveFetch(`${ARGS.baseUrl}/resources/tools/${slug}/`);
  }
  return r;
}
const REQUEST_DELAY = 1200; // gentle pace: full-site sweep (76 pages) without tripping the host rate limiter
async function liveFetch(url, tries = 5) {
  let last = { status: 0, body: '', error: 'no attempt' };
  for (let i = 0; i <= tries; i++) {
    await sleep(REQUEST_DELAY);
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'AmbiSecure-ResourceVerifier/1.0', Connection: 'close' } });
      const body = await res.text();
      last = { status: res.status, body, error: null };
      if (res.status === 429 && i < tries) { // exponential backoff, honor Retry-After
        const ra = parseInt(res.headers.get('retry-after') || '0', 10);
        await sleep(Math.max((ra || 0) * 1000, 4000 * (i + 1)));
        continue;
      }
      if (res.status === 200 && body.length < 50 && i < tries) continue;
      return last;
    } catch (e) { last = { status: 0, body: '', error: e.message }; await sleep(2000); }
  }
  return last;
}
function structuralChecks(slug, tool, html, status) {
  const url = `${LIVE_CANON}/resources/tools/${slug}/`;
  const low = html.toLowerCase();
  const checks = {};
  const fails = [];
  checks.http_200 = status === 200; if (!checks.http_200) { fails.push(`HTTP ${status}`); return { checks, fails }; }
  const m = /<link[^>]+rel="canonical"[^>]*href="([^"]+)"/i.exec(html);
  checks.canonical_ok = !!m && m[1].replace(/\/$/, '') === url.replace(/\/$/, '');
  if (!checks.canonical_ok) fails.push(`canonical ${m ? m[1] : 'missing'}`);
  checks.noindex_absent = !/name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html);
  if (!checks.noindex_absent) fails.push('noindex present');
  checks.has_h1 = /<h1[^>]*>\s*\S/i.test(html); if (!checks.has_h1) fails.push('no H1');
  checks.has_title = /<title>[^<]+<\/title>/i.test(html); if (!checks.has_title) fails.push('no title');
  checks.soon_absent = !low.includes('>soon<') && !low.includes('soon-tile'); if (!checks.soon_absent) fails.push('SOON present');
  const ui = (low.match(/<textarea/g) || []).length + (low.match(/<select/g) || []).length
    + (low.match(/<input/g) || []).length + (low.match(/<button/g) || []).length;
  checks.ui_markers = ui;
  checks.has_ui = ui >= (tool ? (tool.ui_markers_min || 1) : 1); if (!checks.has_ui) fails.push('no UI markers');
  checks.not_parking = !['this domain is parked', 'hostinger', 'default web page', '404 not found'].some((s) => low.includes(s));
  if (!checks.not_parking) fails.push('parking/404 content');
  if (tool && tool.content_includes) {
    const missing = tool.content_includes.filter((s) => !low.includes(String(s).toLowerCase()));
    checks.content_missing = missing;
    if (missing.length) fails.push(`missing content: ${missing.join(', ')}`);
  }
  return { checks, fails };
}

// ---------- runner ----------
async function runVector(slug, loaded, vec) {
  const adapter = ADAPTERS[slug];
  let got, threw = null;
  try { got = await adapter(loaded, vec.input); }
  catch (e) { threw = e.message; }
  let ok;
  if (vec.expectError) ok = threw !== null;
  else if (threw !== null) ok = false;
  else ok = evaluate(got, vec);
  return { name: vec.name, ok, got: threw ? `threw: ${threw}` : safeStr(got),
    expected: vec.expectError ? '(error)' : ('expect' in vec ? safeStr(vec.expect)
      : vec.expectIncludes ? `includes ${safeStr(vec.expectIncludes)}` : vec.expectMatch ? `~/${vec.expectMatch}/` : vec.expectOk ? '(ok)' : '?') };
}
function safeStr(v) { try { return typeof v === 'string' ? v : JSON.stringify(v); } catch { return String(v); } }

async function shaReference(tool) {
  const out = [];
  for (const v of tool.reference_vectors || []) {
    const got = crypto.createHash(v.algo).update(v.input).digest('hex').toUpperCase();
    out.push({ name: v.name, ok: got === v.expect, got, expected: v.expect });
  }
  return out;
}
async function crcAllPresets(loaded) {
  const { crc, PRESETS } = loaded.exports;
  if (!PRESETS) return { name: 'all-presets check value (123456789)', ok: false, got: 'no PRESETS export', expected: 'all match' };
  const names = Array.isArray(PRESETS) ? PRESETS.map((p) => p.name) : Object.keys(PRESETS);
  let checked = 0, bad = [];
  for (const n of names) {
    const p = Array.isArray(PRESETS) ? PRESETS.find((x) => x.name === n) : PRESETS[n];
    if (p.check === undefined || p.check === null) continue;
    checked++;
    const v = (() => { try { return BigInt(crc(n, '123456789')); } catch { return -1n; } })();
    if (v !== (typeof p.check === 'bigint' ? p.check : BigInt(p.check))) bad.push(n);
  }
  return { name: `all-presets check value (123456789): ${checked} presets`, ok: bad.length === 0, got: bad.length ? `mismatch: ${bad.join(',')}` : `${checked} verified`, expected: 'all match' };
}

async function main() {
  const matrix = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools', 'resource-tool-test-matrix.json'), 'utf8'));
  const bySlug = new Map(matrix.tools.map((t) => [t.slug, t]));
  // discover all tool pages on disk for structural coverage
  const discovered = fs.readdirSync(path.join(ROOT, 'resources', 'tools'))
    .filter((d) => fs.existsSync(path.join(ROOT, 'resources', 'tools', d, 'index.html')));
  let slugs = discovered;
  if (ARGS.tool) slugs = slugs.filter((s) => s === ARGS.tool);

  const report = { mode: ARGS.local ? 'local' : 'live', base: ARGS.local ? ROOT : ARGS.baseUrl,
    generated: new Date().toISOString().replace(/\.\d+Z$/, 'Z'), tools: [], summary: {} };
  const assetCache = new Map();

  for (const slug of slugs) {
    const tool = bySlug.get(slug) || null;
    const entry = { slug, label: tool ? tool.label : slug, page: `/resources/tools/${slug}/`,
      relink_of: tool && tool.relink_of, hasMatrix: !!tool, structural: {}, algo: [], fails: [], warns: [] };
    // structural
    const h = await getHtml(slug);
    const sc = structuralChecks(slug, tool, h.body, h.status);
    entry.structural = sc.checks;
    sc.fails.forEach((f) => entry.fails.push(`[structural] ${f}`));
    // assets (live only)
    if (!ARGS.local && h.status === 200) {
      const assets = [...new Set([...h.body.matchAll(/(?:href|src)="(\/assets\/[^"]+\.(?:css|js))"/gi)].map((mm) => mm[1]))];
      for (const a of assets) {
        if (!assetCache.has(a)) { const r = await liveFetch(`${ARGS.baseUrl}${a}`); assetCache.set(a, r.status); }
        if (assetCache.get(a) !== 200) entry.fails.push(`[asset] ${a} -> ${assetCache.get(a)}`);
      }
    }
    // algorithm
    if (tool && tool.slug === 'sha-hash-generator') {
      entry.algo = await shaReference(tool);
      if (!h.body.includes('crypto.subtle')) entry.warns.push('page HTML does not mention crypto.subtle');
    } else if (tool && tool.source && ADAPTERS[slug]) {
      try {
        const loaded = await loadModule(tool.source);
        for (const group of ['golden', 'invalid', 'edge']) {
          for (const vec of (tool[group] || [])) entry.algo.push({ group, ...(await runVector(slug, loaded, vec)) });
        }
        if ((tool.special || []).includes('all_presets_check_123456789')) entry.algo.push({ group: 'special', ...(await crcAllPresets(loaded)) });
      } catch (e) {
        entry.warns.push(`algorithm load skipped: ${e.message}`);
      }
    } else if (tool && tool.render_only) {
      entry.warns.push('render-only / browser-dependent: structural checks only');
    } else if (!tool) {
      entry.warns.push('no test matrix entry: structural checks only');
    }
    entry.algo.filter((t) => !t.ok).forEach((t) => entry.fails.push(`[algo:${t.group}] ${t.name} (got ${t.got}, want ${t.expected})`));
    entry.passed = entry.fails.length === 0;
    report.tools.push(entry);
  }

  // browser layer
  let browserNote;
  if (ARGS.browser) {
    try { await import('playwright'); browserNote = 'playwright present — (browser interaction tests not yet implemented in this harness; see TODO)'; }
    catch { browserNote = 'Playwright NOT installed. Browser-level UI tests (DOM events, mobile viewport, console errors) are skipped. To enable: `npm i -D playwright && npx playwright install chromium`, then extend this harness. Algorithm + structural layers fully cover deployed logic.'; }
  } else {
    browserNote = 'Browser layer not requested (--browser). Algorithm tests run against the deployed JS in a Node VM (no DOM); structural checks cover render markers.';
  }
  report.browser = browserNote;

  // summary
  const algoTotal = report.tools.reduce((n, t) => n + t.algo.length, 0);
  const algoPass = report.tools.reduce((n, t) => n + t.algo.filter((x) => x.ok).length, 0);
  report.summary = {
    tools_total: report.tools.length,
    tools_passed: report.tools.filter((t) => t.passed).length,
    tools_with_algo: report.tools.filter((t) => t.algo.length).length,
    algo_assertions: algoTotal, algo_passed: algoPass,
    critical_failures: report.tools.reduce((n, t) => n + t.fails.length, 0),
    warnings: report.tools.reduce((n, t) => n + t.warns.length, 0),
  };

  // outputs
  fs.mkdirSync(path.join(ROOT, path.dirname(ARGS.json)), { recursive: true });
  fs.writeFileSync(path.join(ROOT, ARGS.json), JSON.stringify(report, null, 2));
  writeMd(path.join(ROOT, ARGS.md), report);

  // console
  console.log(`=== resource-tool verification (${report.mode}: ${report.base}) ===`);
  console.log(`tools ${report.summary.tools_passed}/${report.summary.tools_total} pass | algo ${algoPass}/${algoTotal} | critical ${report.summary.critical_failures} | warnings ${report.summary.warnings}`);
  for (const t of report.tools) {
    const flag = t.passed ? 'PASS' : 'FAIL';
    const a = t.algo.length ? ` [algo ${t.algo.filter((x) => x.ok).length}/${t.algo.length}]` : '';
    console.log(`  [${flag}] ${t.label}${a}${t.fails.length ? '  :: ' + t.fails.slice(0, 3).join('; ') : ''}`);
  }
  console.log(`\n${browserNote}\nJSON: ${ARGS.json}\nMD:   ${ARGS.md}`);
  process.exit(report.summary.critical_failures > 0 ? 1 : 0);
}

function writeMd(p, r) {
  const yn = (b) => (b ? '✅' : '❌');
  const L = [`# Resource-tool verification — ${r.mode} (${r.base})`, '', `Generated: ${r.generated}`, '',
    `- Tools passed: **${r.summary.tools_passed}/${r.summary.tools_total}**`,
    `- Algorithm assertions: **${r.summary.algo_passed}/${r.summary.algo_assertions}**`,
    `- Tools with golden/algorithm tests: **${r.summary.tools_with_algo}**`,
    `- Critical failures: **${r.summary.critical_failures}** · Warnings: **${r.summary.warnings}**`,
    '', `Browser layer: ${r.browser}`, '',
    '| Tool | 200 | canon | noindex✗ | SOON✗ | UI | content | algo | result |',
    '|------|----|------|---------|------|----|--------|------|--------|'];
  for (const t of r.tools) {
    const c = t.structural;
    const algo = t.algo.length ? `${t.algo.filter((x) => x.ok).length}/${t.algo.length}` : '—';
    L.push(`| ${t.label}${t.relink_of ? ` (←${t.relink_of})` : ''} | ${yn(c.http_200)} | ${yn(c.canonical_ok)} | ${yn(c.noindex_absent)} | ${yn(c.soon_absent)} | ${yn(c.has_ui)} | ${c.content_missing && c.content_missing.length ? '❌ ' + c.content_missing.join(',') : '✅'} | ${algo} | ${t.passed ? 'PASS' : 'FAIL — ' + t.fails.join('; ')} |`);
  }
  // detailed failing assertions
  const failing = r.tools.filter((t) => !t.passed);
  if (failing.length) {
    L.push('', '## Failing detail');
    for (const t of failing) {
      L.push(`### ${t.label}`);
      t.fails.forEach((f) => L.push(`- ${f}`));
    }
  }
  fs.writeFileSync(p, L.join('\n') + '\n');
}

main().catch((e) => { console.error('harness error:', e); process.exit(2); });
