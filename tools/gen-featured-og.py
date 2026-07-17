#!/usr/bin/env python3
"""Render AmbiSecure featured OG cards (1200x630) from a spec file.

    python3 tools/gen-featured-og.py --specs docs/featured-image-specs.json \
        --out assets/img/og/featured [--only slug] [--limit N]

Design system is measured from the approved 27-image package; see
og_featured_lib.py. Brand fonts come from assets/fonts/*.woff2, instantiated
to static weights into a scratch dir (fontconfig picks them up), so rendering
does not depend on system-installed fonts.

Renderer: cairosvg if importable, else rsvg-convert, else inkscape.
"""
import argparse, base64, json, os, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)

import og_featured_lib as L
from og_featured_art import ARCHETYPES

LOCKUP = os.path.join(HERE, 'assets', 'og-logo-lockup.png')


def logo_href():
    p = LOCKUP if os.path.isfile(LOCKUP) else os.path.join(ROOT, 'tools/assets/og-logo-lockup.png')
    with open(p, 'rb') as f:
        return 'data:image/png;base64,' + base64.b64encode(f.read()).decode()


def build_svg(spec, href):
    body = L.chrome(spec['eyebrow'], spec['title'], spec['subtitle'], href)
    fn = ARCHETYPES.get(spec.get('archetype', ''), None)
    if fn is None:
        raise SystemExit(f"unknown archetype {spec.get('archetype')!r} for {spec['filename']}")
    body += fn(spec.get('art', {}))
    return L.svg(body)


def render(svg_text, out_png, env):
    with tempfile.NamedTemporaryFile('w', suffix='.svg', delete=False) as f:
        f.write(svg_text)
        tmp = f.name
    try:
        try:
            import cairosvg
            cairosvg.svg2png(url=tmp, write_to=out_png, output_width=1200, output_height=630)
            return 'cairosvg'
        except ImportError:
            pass
        for cmd in (['rsvg-convert', '-w', '1200', '-h', '630', '-o', out_png, tmp],
                    ['inkscape', '--export-type=png', f'--export-filename={out_png}', '-w', '1200', '-h', '630', tmp]):
            r = subprocess.run(cmd, env=env, capture_output=True)
            if r.returncode == 0 and os.path.isfile(out_png):
                return cmd[0]
        raise SystemExit('no working SVG renderer (tried cairosvg, rsvg-convert, inkscape)')
    finally:
        os.unlink(tmp)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--specs', default='docs/featured-image-specs.json')
    ap.add_argument('--out', default='assets/img/og/featured')
    ap.add_argument('--only')
    ap.add_argument('--limit', type=int)
    ap.add_argument('--fontconf', default=os.environ.get('FONTCONFIG_FILE', ''))
    a = ap.parse_args()

    specs = json.load(open(a.specs, encoding='utf-8'))
    if a.only:
        specs = [s for s in specs if a.only in s['filename']]
    if a.limit:
        specs = specs[:a.limit]
    os.makedirs(a.out, exist_ok=True)
    env = dict(os.environ)
    if a.fontconf:
        env['FONTCONFIG_FILE'] = a.fontconf
    href = logo_href()

    seen, n = set(), 0
    for s in specs:
        if s['filename'] in seen:
            raise SystemExit(f'duplicate filename: {s["filename"]}')
        seen.add(s['filename'])
        out = os.path.join(a.out, s['filename'])
        render(build_svg(s, href), out, env)
        n += 1
        if n % 25 == 0:
            print(f'  rendered {n}/{len(specs)}')
    print(f'rendered {n} cards -> {a.out}')


if __name__ == '__main__':
    main()
