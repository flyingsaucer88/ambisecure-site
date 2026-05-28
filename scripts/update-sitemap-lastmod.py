#!/usr/bin/env python3
"""Rewrite <lastmod> on every <url> in sitemap.xml using each page's last
git-commit date (deterministic across clones). Falls back to filesystem
mtime only for files git doesn't know about. Idempotent."""

import re
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITEMAP = ROOT / 'sitemap.xml'
HOST = 'https://ambisecure.ambimat.com'


def loc_to_path(loc: str) -> Path | None:
    rel = loc[len(HOST):].lstrip('/')
    candidates = [rel + 'index.html' if loc.endswith('/') else rel,
                  rel.rstrip('/') + '.html']
    for c in candidates:
        p = ROOT / c
        if p.is_file():
            return p
    return None


def lastmod_for(path: Path) -> str:
    rel = path.relative_to(ROOT).as_posix()
    try:
        out = subprocess.check_output(
            ['git', 'log', '-1', '--format=%cI', '--', rel],
            cwd=ROOT, text=True, stderr=subprocess.DEVNULL).strip()
        if out:
            return out.split('T')[0]
    except subprocess.CalledProcessError:
        pass
    ts = datetime.fromtimestamp(path.stat().st_mtime, tz=timezone.utc)
    return ts.strftime('%Y-%m-%d')


def rewrite_url_line(line: str) -> tuple[str, bool]:
    """Returns (new_line, changed). Leaves non-<url> lines untouched."""
    m = re.search(r'<loc>(' + re.escape(HOST) + r'[^<]*)</loc>', line)
    if not m:
        return line, False
    path = loc_to_path(m.group(1))
    if path is None:
        return line, False
    date = lastmod_for(path)
    new_lm = f'<lastmod>{date}</lastmod>'
    if '<lastmod>' in line:
        new_line = re.sub(r'<lastmod>[^<]*</lastmod>', new_lm, line)
    else:
        # Insert after </loc>
        new_line = line.replace('</loc>', '</loc>' + new_lm, 1)
    return new_line, new_line != line


def main() -> int:
    text = SITEMAP.read_text()
    out_lines, changed = [], 0
    for line in text.splitlines(keepends=True):
        new_line, did = rewrite_url_line(line)
        out_lines.append(new_line)
        if did:
            changed += 1
    new_text = ''.join(out_lines)
    SITEMAP.write_text(new_text)

    total_urls = new_text.count('<loc>')
    total_lastmod = new_text.count('<lastmod>')
    print(f'sitemap.xml: {total_urls} URLs, {total_lastmod} lastmod ({changed} lines updated)')
    if total_urls != total_lastmod:
        print(f'ERROR: lastmod coverage incomplete ({total_lastmod}/{total_urls})', file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())
