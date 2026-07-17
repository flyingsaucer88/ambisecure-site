#!/usr/bin/env python3
"""Audit (and optionally fix) stated item counts against what a page renders.

Several listing pages state a count in prose: "9 posts carrying the MFA tag",
"17 engineering references". Those numbers were typed by hand and drift the
moment a post is added or retired -- e.g. retiring one archive post silently
falsified both /tags/mfa/ and /tags/government-identity/.

The rendered listing is the source of truth here: whatever cards the page
actually ships is, by definition, what the visitor counts. This derives the
number from those cards and compares it with the prose.

    python3 tools/audit-counts.py          # report drift, exit 1 if any
    python3 tools/audit-counts.py --fix    # rewrite the prose to the true count

Wired into tools/audit-all.sh so the mismatch cannot come back unnoticed.
"""
import argparse, glob, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def main_of(html):
    m = re.search(r'<main[^>]*>(.*?)</main>', html, re.S)
    return m.group(1) if m else html


def plural(n, word='post'):
    return f'{n} {word}' if n == 1 else f'{n} {word}s'


def checks():
    """(label, path, true_count, pattern, replacement_builder)"""
    out = []

    # 1. curated tag pages: "<p class="dek">N post(s) carrying the <em>Name</em> tag, newest first.</p>"
    for p in sorted(glob.glob(os.path.join(ROOT, 'tags/*/index.html'))):
        h = open(p, encoding='utf-8').read()
        m = re.search(r'<p class="dek">(\d+)\s+(post|posts)\s+carrying the <em>([^<]+)</em> tag, newest first\.</p>', h)
        if not m:
            continue
        true = len(re.findall(r'<a href="[^"]*"[^>]*class="card"', main_of(h)))
        out.append(dict(label=f'/tags/{os.path.basename(os.path.dirname(p))}/', path=p,
                        stated=int(m.group(1)), true=true, span=m.span(),
                        new=f'<p class="dek">{plural(true)} carrying the <em>{m.group(3)}</em> tag, newest first.</p>',
                        source='rendered <a class="card"> entries on the tag page'))

    # 2. /tags/ index cards: "<h3>Name</h3><p>N post(s)</p>"
    p = os.path.join(ROOT, 'tags/index.html')
    h = open(p, encoding='utf-8').read()
    for m in re.finditer(r'href="/tags/([a-z0-9-]+)/"[^>]*class="tag-card"[^>]*>\s*<h3>([^<]*)</h3><p>(\d+)\s+(post|posts)</p>', h):
        slug = m.group(1)
        tp = os.path.join(ROOT, f'tags/{slug}/index.html')
        if not os.path.isfile(tp):
            continue
        true = len(re.findall(r'<a href="[^"]*"[^>]*class="card"', main_of(open(tp, encoding='utf-8').read())))
        out.append(dict(label=f'/tags/ card -> {slug}', path=p, stated=int(m.group(3)), true=true,
                        span=m.span(3, ) if False else (m.start(3), m.end(4)),
                        new=plural(true), source=f'rendered cards on /tags/{slug}/'))

    # 3. /references/ dek: "<p class="dek">N engineering references"
    p = os.path.join(ROOT, 'references/index.html')
    h = open(p, encoding='utf-8').read()
    m = re.search(r'(<p class="dek">)(\d+)(\s+engineering references)', h)
    if m:
        true = len(set(re.findall(r'href="(/references/[a-z0-9-]+/)"', main_of(h))))
        out.append(dict(label='/references/', path=p, stated=int(m.group(2)), true=true,
                        span=(m.start(2), m.end(2)), new=str(true),
                        source='unique /references/<slug>/ links rendered on the hub'))
    return out


def apply_fix(rows):
    """Rewrite by path, right-to-left, so spans stay valid."""
    byfile = {}
    for r in rows:
        byfile.setdefault(r['path'], []).append(r)
    n = 0
    for path, rs in byfile.items():
        h = open(path, encoding='utf-8').read()
        for r in sorted(rs, key=lambda x: -x['span'][0]):
            h = h[:r['span'][0]] + r['new'] + h[r['span'][1]:]
            n += 1
        open(path, 'w', encoding='utf-8').write(h)
    return n


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--fix', action='store_true')
    a = ap.parse_args()

    rows = checks()
    drift = [r for r in rows if r['stated'] != r['true']]
    print(f'=== stated-count audit === {len(rows)} count claims checked')
    for r in drift:
        print(f"  DRIFT  {r['label']:34} states {r['stated']:>3}  renders {r['true']:>3}   ({r['source']})")
    if not drift:
        print('  ok  every stated count matches its rendered listing')
        sys.exit(0)
    if a.fix:
        n = apply_fix(drift)
        print(f'\nfixed {n} count claim(s)')
        left = [r for r in checks() if r['stated'] != r['true']]
        print('remaining drift:', len(left))
        sys.exit(1 if left else 0)
    print(f'\nCOUNT AUDIT FAILED: {len(drift)} stated count(s) disagree with the rendered listing')
    print('run: python3 tools/audit-counts.py --fix')
    sys.exit(1)
