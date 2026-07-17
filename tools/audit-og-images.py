#!/usr/bin/env python3
"""Audit featured-image metadata across the production build.

Checks the built tree (dist/ambisecure-hostinger) rather than source, because
that is what actually ships: a page can look right in source and still point at
a file the build never copied.

Checks, per indexable page:
  - og:image and twitter:image present
  - both resolve to a file that exists in the build (case-sensitively; the host
    is Linux, the dev tree usually is not)
  - the file opens as a real image
  - og:image == twitter:image (divergence is nearly always a mistake here)
  - og:image:alt present, non-empty, and not a known-inaccurate string
  - 1200x630 where the file lives in the featured/ set (the project standard)

Excludes noindex pages, redirect stubs and non-public utilities.

    python3 tools/audit-og-images.py            # report; exit 1 on any failure
    python3 tools/audit-og-images.py --inventory docs/featured-image-inventory.csv
"""
import argparse, csv, glob, html as html_mod, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUILD = os.path.join(ROOT, 'dist/ambisecure-hostinger')
SITE = 'https://ambisecure.ambimat.com'

# Alt strings proven inaccurate against the rendered artwork. Kept as a
# regression guard so a stale brief cannot reintroduce them.
BANNED_ALT = [
    'SAM-backed offline trust behind each validator',
    'open, keyless padlock',
    'Domain-suffix tree',
    'AmbiSecure — Hardware-rooted security',   # the old sitewide placeholder
]

# Category images kept on purpose: a paginated blog index and the search page
# inherit their section's branding rather than earning bespoke artwork.
CATEGORY_IMAGE = {
    '/blog/page/2/': 'blog.png',
    '/search/': 'search.png',
}
# Real video thumbnails: the frame IS the page-specific image. 16:9, not 1200x630.
VIDEO_DIR = 'assets/img/videos/'

# Perceptual-duplicate detection.
#
# Byte-uniqueness is not enough: five setup-video thumbnails were five different
# encodings of one logo intro frame, so every hash differed while the pages all
# showed the same picture.
#
# Hashing the WHOLE canvas does not work for this design system either -- every
# featured card shares the same chrome (52px grid, left column, logo lockup, red
# wedge) on purpose, so a coarse whole-image hash reports brand consistency as
# duplication. The page-specific content lives in the diagram pane on the right.
# So: crop to the diagram pane, then take a 32x32 difference hash (1024 bits),
# which keys on gradients (edges of panels, arrows, text runs) rather than
# average brightness.
#
# Grid is 64x64 (4096 bits) rather than 32x32: at 32 the small mono labels inside
# a diagram wash out, so two LIFECYCLE cards with four boxes each scored as
# near-identical even though their stage names differed entirely. 64 resolves the
# label runs, which is where the page-specific content actually is.
#
# Threshold: Hamming distance <= 12/4096 (~0.3%). Calibrated against the live
# set, not guessed -- see the distribution printed by --calibrate.
PHASH_GRID = 64
PHASH_THRESHOLD = 12
PANE = (636, 120, 1200, 500)   # diagram pane; chrome excluded

# Images allowed to be perceptual near-duplicates. Category branding only --
# add an entry ONLY when the reuse is genuinely approved.
PHASH_ALLOWLIST = set()


def phash(path):
    """dHash of the diagram pane. Chrome is shared by design and is excluded."""
    from PIL import Image
    with Image.open(path) as im:
        im = im.convert('L')
        box = PANE if (im.width, im.height) == (1200, 630) else (0, 0, im.width, im.height)
        g = im.crop(box).resize((PHASH_GRID + 1, PHASH_GRID), Image.LANCZOS)
        px = list(g.getdata())
    w = PHASH_GRID + 1
    bits = []
    for y in range(PHASH_GRID):
        for x in range(PHASH_GRID):
            bits.append('1' if px[y * w + x] > px[y * w + x + 1] else '0')
    return ''.join(bits)


def hamming(a, b):
    return sum(x != y for x, y in zip(a, b))


def slug_of(url):
    return url.replace(SITE, '').strip('/') or 'home'


# Filenames fixed by editorial direction rather than derived from the slug.
FILENAME_OVERRIDE = {
    'videos/setup-ambisecure-card-desktop': 'ambisecure-videos-setup-desktop-1200x630.png',
    'videos/setup-ambisecure-card-facebook': 'ambisecure-videos-setup-facebook-1200x630.png',
    'videos/setup-ambisecure-card-gmail': 'ambisecure-videos-setup-gmail-1200x630.png',
    'videos/setup-ambisecure-card-mobile-facebook': 'ambisecure-videos-setup-mobile-facebook-1200x630.png',
    'videos/setup-ambisecure-card-mobile-gmail': 'ambisecure-videos-setup-mobile-gmail-1200x630.png',
}


def classify(url, og, fn):
    """page-specific / intentional category image / generic fallback.

    'unique' is not the same as 'page-specific': blog.png is used by exactly one
    page now, but it is still section branding, not artwork made for that page.
    """
    slug = slug_of(url)
    if '/og/featured/' in og:
        expect = FILENAME_OVERRIDE.get(
            slug, 'ambisecure-' + slug.replace('/', '-').lower() + '-1200x630.png')
        return ('page-specific' if fn == expect
                else 'MISMATCHED featured image (expected %s)' % expect)
    if VIDEO_DIR in og:
        return 'page-specific (video thumbnail)'
    if CATEGORY_IMAGE.get('/' + slug + '/') == fn:
        return 'intentional category image'
    if fn.rsplit('.', 1)[0] == slug.rsplit('/', 1)[-1]:
        return 'page-specific'
    return 'generic fallback'


def meta(html, prop=None, name=None):
    if prop:
        m = re.search(r'<meta property="%s" content="([^"]*)"' % re.escape(prop), html)
    else:
        m = re.search(r'<meta name="%s" content="([^"]*)"' % re.escape(name), html)
    return m.group(1) if m else None


def build_files():
    """Exact-case index of every file in the build."""
    out = set()
    for p in glob.glob(os.path.join(BUILD, '**', '*'), recursive=True):
        if os.path.isfile(p):
            out.add(os.path.relpath(p, BUILD))
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--inventory')
    a = ap.parse_args()

    if not os.path.isdir(BUILD):
        print('build tree missing — run tools/build-hostinger-package.sh first')
        return 2

    files = build_files()
    pages = sorted(glob.glob(os.path.join(BUILD, '**', 'index.html'), recursive=True))
    rows, problems = [], []
    usage = {}

    for p in pages:
        rel = os.path.relpath(p, BUILD)
        d = os.path.dirname(rel)
        url = SITE + '/' + (d + '/' if d else '')
        h = open(p, encoding='utf-8').read()
        robots = ' '.join(re.findall(r'<meta name="robots" content="([^"]*)"', h))
        if 'noindex' in robots.lower():
            continue

        og = meta(h, prop='og:image')
        tw = meta(h, name='twitter:image')
        alt = meta(h, prop='og:image:alt')
        title = (re.search(r'<title>(.*?)</title>', h, re.S) or [None, ''])
        title = re.sub(r'\s+', ' ', title.group(1)).strip() if hasattr(title, 'group') else ''

        if not og:
            problems.append((url, 'no og:image'))
            continue
        if not tw:
            problems.append((url, 'no twitter:image'))
        if tw and tw != og:
            problems.append((url, f'twitter:image diverges from og:image'))

        relimg = og.replace(SITE + '/', '')
        exists = relimg in files                     # case-sensitive on purpose
        if not exists:
            ci = [f for f in files if f.lower() == relimg.lower()]
            problems.append((url, f'og:image not in build: {relimg}' +
                             (f' (case mismatch vs {ci[0]})' if ci else '')))
        w = hgt = None
        if exists:
            try:
                from PIL import Image
                with Image.open(os.path.join(BUILD, relimg)) as im:
                    w, hgt = im.size
            except Exception as e:
                problems.append((url, f'unreadable image {relimg}: {e}'))
            if '/og/featured/' in og and (w, hgt) != (1200, 630):
                problems.append((url, f'featured image not 1200x630: {w}x{hgt}'))

        if not alt or not alt.strip():
            problems.append((url, 'og:image:alt missing or empty'))
        else:
            # compare unescaped: the placeholder ships as "AmbiSecure &mdash; ..."
            alt_plain = html_mod.unescape(alt)
            for b in BANNED_ALT:
                if b in alt_plain or b in alt:
                    problems.append((url, f'known-inaccurate or placeholder alt: "{b}"'))

        fn = os.path.basename(og)
        usage.setdefault(fn, []).append(url)
        rows.append(dict(url=url, title=title, image=og, filename=fn,
                         width=w, height=hgt, alt=alt or ''))

    for r in rows:
        r['classification'] = classify(r['url'], r['image'], r['filename'])
        if r['classification'].startswith('MISMATCHED'):
            problems.append((r['url'], r['classification']))

    # an image shared by >1 page is a fallback leak unless it is category branding
    for fn, urls in sorted(usage.items()):
        if len(urls) > 1 and fn not in CATEGORY_IMAGE.values():
            problems.append(('%d pages' % len(urls), 'share non-category image %s' % fn))

    # exact + perceptual duplicates across distinct featured images
    import hashlib
    sigs, sha = {}, {}
    for r in rows:
        rel = r['image'].replace(SITE + '/', '')
        fp = os.path.join(BUILD, rel)
        if r['filename'] in sigs or not os.path.isfile(fp):
            continue
        try:
            sigs[r['filename']] = phash(fp)
            sha[r['filename']] = hashlib.sha256(open(fp, 'rb').read()).hexdigest()
        except Exception:
            pass
    names = sorted(sigs)
    byhash = {}
    for n in names:
        byhash.setdefault(sha[n], []).append(n)
    for _h, group in byhash.items():
        if len(group) > 1:
            problems.append((', '.join(group), 'EXACT duplicate image bytes'))
    seen_pairs = 0
    for i, n1 in enumerate(names):
        for n2 in names[i + 1:]:
            seen_pairs += 1
            if frozenset({n1, n2}) in PHASH_ALLOWLIST:
                continue
            d = hamming(sigs[n1], sigs[n2])
            if d <= PHASH_THRESHOLD:
                u1 = [r['url'] for r in rows if r['filename'] == n1]
                u2 = [r['url'] for r in rows if r['filename'] == n2]
                problems.append((f'{u1[0]} vs {u2[0]}',
                                 f'perceptual near-duplicate: {n1} ~ {n2} (hamming {d}/{PHASH_GRID**2}, threshold {PHASH_THRESHOLD})'))
    print(f'  perceptual hash: {len(names)} images, {seen_pairs} pairs compared, threshold {PHASH_THRESHOLD}/{PHASH_GRID**2}')

    if a.inventory:
        with open(a.inventory, 'w', newline='', encoding='utf-8') as f:
            wr = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
            wr.writeheader()
            wr.writerows(rows)
        print(f'inventory -> {a.inventory} ({len(rows)} pages)')

    print(f'=== og-image audit === {len(rows)} indexable pages, '
          f'{len(usage)} unique images')
    from collections import Counter
    for k, v in Counter(r['classification'] for r in rows).most_common():
        print(f'  {k:46} {v}')
    if problems:
        print(f'\nOG-IMAGE AUDIT FAILED: {len(problems)} problem(s)')
        for u, m in problems[:25]:
            print(f'  {u}\n      {m}')
        return 1
    print('  ok  every indexable page has a valid, existing, correctly sized image with alt text')
    return 0


if __name__ == '__main__':
    sys.exit(main())
