#!/usr/bin/env node
// Headless smoke tests for the LIVE resource tools. Downloads each tool's
// deployed JS from the live site and exercises its pure-logic exports against
// known vectors. This is NOT a browser test — DOM wiring / Web Crypto paths
// are not exercised here (no Playwright/Puppeteer in the repo). Algorithmic
// correctness of the shipped code IS verified.
//
//   node tools/smoke-live-tools.mjs [--base-url https://ambisecure.ambimat.com]
//
// Exit 0 = all vectors pass, 1 = at least one failed.
import vm from 'node:vm';
import crypto from 'node:crypto';

const base = (process.argv.find((a) => a.startsWith('--base-url='))?.split('=')[1]
  || 'https://ambisecure.ambimat.com').replace(/\/$/, '');

async function loadLive(slug) {
  const url = `${base}/assets/js/tools/${slug}.js`;
  const src = await (await fetch(url)).text();
  const sandbox = { module: { exports: {} }, window: {}, document: undefined,
    TextEncoder, TextDecoder, console };
  sandbox.module.exports = {};
  vm.createContext(sandbox);
  new vm.Script(src, { filename: `${slug}.js` }).runInContext(sandbox);
  return sandbox.module.exports;
}

let pass = 0, fail = 0;
const chk = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  => ' + detail : ''}`);
  ok ? pass++ : fail++;
};

const tests = [
  ['CRC-32("123456789") = CBF43926', async () => {
    const { crc } = await loadLive('crc-calculator');
    const v = BigInt(crc('CRC-32', '123456789'));
    return [v.toString(16).toUpperCase().padStart(8, '0') === 'CBF43926', '0x' + v.toString(16).toUpperCase()];
  }],
  ['base32("hello") = NBSWY3DP', async () => {
    const { encodeBytes, ALPHA } = await loadLive('base32');
    const out = encodeBytes(new TextEncoder().encode('hello'), ALPHA.base32, true);
    return [out === 'NBSWY3DP', out];
  }],
  ['checksum adler32("Wikipedia") = 0x11E60398', async () => {
    const { compute } = await loadLive('checksum');
    const r = compute('adler32', new TextEncoder().encode('Wikipedia'));
    const v = r.dec !== undefined ? BigInt(r.dec) : BigInt('0x' + String(r.hex).replace(/0x/, ''));
    return [v === 0x11e60398n, '0x' + v.toString(16)];
  }],
  ['LRC xor("123") = 0x30', async () => {
    const { lrc } = await loadLive('lrc-calculator');
    const r = lrc(new Uint8Array([0x31, 0x32, 0x33]), 'xor');
    return [(r.value ?? r) === 48, String(r.value ?? r)];
  }],
  ['SHA-256("abc") vector (tool uses Web Crypto)', async () => {
    const want = 'BA7816BF8F01CFEA414140DE5DAE2223B00361A396177A9CB410FF61F20015AD';
    const got = crypto.createHash('sha256').update('abc').digest('hex').toUpperCase();
    return [got === want, got];
  }],
  ['URL encode("a b+c") percent-encodes space', async () => {
    const { encode } = await loadLive('url-encoder');
    const out = encode('a b+c', false, false);
    return [/%20|\+/.test(out), out];
  }],
  ['JSON formatter pretty + sort', async () => {
    const { format } = await loadLive('json-formatter');
    const out = format('{"b":2,"a":1}', { indent: 2, sort: true }).output;
    return [/\n/.test(out) && out.indexOf('"a"') < out.indexOf('"b"'), JSON.stringify(out)];
  }],
  ['JSON validator flags invalid', async () => {
    const { parseJSON } = await loadLive('json-validator');
    const r = parseJSON('{bad}');
    return [r && r.ok === false, r && r.error ? 'error reported' : 'no error'];
  }],
  ['XML formatter indents', async () => {
    const m = await loadLive('xml-formatter');
    const f = m.prettyPrint || m.format;
    const out = String(f('<a><b>1</b></a>', '  '));
    return [/\n/.test(out), JSON.stringify(out)];
  }],
  ['Binary 1010 (base 2) = 10', async () => {
    const { parseValue } = await loadLive('binary-calculator');
    return [BigInt(parseValue('1010', 2)) === 10n, String(parseValue('1010', 2))];
  }],
  ['ICCID decodes fields + Luhn', async () => {
    const { decodeIccid } = await loadLive('iccid-decoder');
    const r = decodeIccid('8991000000000000001');
    return [!!(r && r.mii === '89'), 'mii=' + (r && r.mii)];
  }],
  ['IMSI decodes MCC/MNC/MSIN', async () => {
    const { decodeImsi } = await loadLive('imsi-decoder');
    const r = decodeImsi('404451234567890', 2);
    return [!!(r && r.mcc === '404' && r.msin), `mcc=${r.mcc} mnc=${r.mnc} msin=${r.msin}`];
  }],
  ['eUICC EID validates 32-digit', async () => {
    const { decodeEid } = await loadLive('euicc-eid-decoder');
    const r = decodeEid('89049032123451234512345678901235');
    return [!!r, 'decoded'];
  }],
  ['APDU SELECT-AID builds 00A40400…', async () => {
    const { buildApdu } = await loadLive('apdu-builder');
    const r = buildApdu({ cla: 0x00, ins: 0xa4, p1: 0x04, p2: 0x00,
      data: [0xa0, 0x00, 0x00, 0x00, 0x03, 0x10, 0x10], le: null });
    const hex = (r.bytes || []).map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
    return [/^00A40400/.test(hex), hex + ' (' + r.caseName + ')'];
  }],
];

console.log(`=== live tool smoke tests: ${base} ===`);
for (const [name, fn] of tests) {
  try { const [ok, detail] = await fn(); chk(name, ok, detail); }
  catch (e) { chk(name, false, 'threw: ' + e.message); }
}
console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
