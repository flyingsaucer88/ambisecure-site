#!/usr/bin/env python3
"""Add width/height attributes to <img> tags that are missing them, so the
browser can reserve layout space and avoid CLS. Idempotent — only touches
tags whose src matches a known dimension and that don't already have
width/height. Run from the repo root."""

import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# Dimensions resolved from the actual asset files:
#   - YouTube thumbnails captured at 1280x720
#   - Certification logos exported at 1100x850
DIMS = {
    '/assets/img/certifications/cert-fido.png': (1100, 850),
    '/assets/img/certifications/cert-eal5.png': (1100, 850),
    '/assets/img/certifications/cert-globalplatform.png': (1100, 850),
    '/assets/img/videos/uInKs6D_t-U.webp': (1280, 720),
    '/assets/img/videos/bo9VA5AWuKQ.webp': (1280, 720),
    '/assets/img/videos/9TwKvC7cqOE.webp': (1280, 720),
    '/assets/img/videos/WfA_F03IOd8.webp': (1280, 720),
    '/assets/img/videos/Iz_HOaLY3k4.webp': (1280, 720),
    '/assets/img/videos/gSd5Nu2V0z8.webp': (1280, 720),
}


def has_attr(tag: str, name: str) -> bool:
    return re.search(rf'\b{name}\s*=', tag) is not None


def add_dims_to_tag(tag: str, w: int, h: int) -> str:
    if has_attr(tag, 'width') and has_attr(tag, 'height'):
        return tag
    new_attrs = ''
    if not has_attr(tag, 'width'):
        new_attrs += f' width="{w}"'
    if not has_attr(tag, 'height'):
        new_attrs += f' height="{h}"'
    # Insert before the closing /> or >
    if tag.rstrip().endswith('/>'):
        return tag[:-2].rstrip() + new_attrs + ' />'
    return tag[:-1].rstrip() + new_attrs + '>'


def fix_file(path: Path) -> int:
    text = path.read_text()
    changed = 0

    def rewrite(m: re.Match) -> str:
        nonlocal changed
        tag = m.group(0)
        src_m = re.search(r'\bsrc\s*=\s*"([^"]+)"', tag)
        if not src_m:
            return tag
        src = src_m.group(1)
        if src not in DIMS:
            return tag
        if has_attr(tag, 'width') and has_attr(tag, 'height'):
            return tag
        w, h = DIMS[src]
        new = add_dims_to_tag(tag, w, h)
        if new != tag:
            changed += 1
        return new

    new_text = re.sub(r'<img\b[^>]*>', rewrite, text)
    if changed:
        path.write_text(new_text)
    return changed


def main():
    # Find every HTML page that references any of the target srcs.
    targets = set()
    for src in DIMS:
        result = subprocess.run(
            ['git', 'grep', '-l', src], cwd=ROOT, capture_output=True, text=True)
        for line in result.stdout.splitlines():
            if line.endswith('.html') and not line.startswith('dist/'):
                targets.add(ROOT / line)

    total = 0
    for path in sorted(targets):
        n = fix_file(path)
        if n:
            print(f'  +{n}  {path.relative_to(ROOT)}')
            total += n
    print(f'Updated {total} <img> tag(s) across {len(targets)} file(s).')


if __name__ == '__main__':
    main()
