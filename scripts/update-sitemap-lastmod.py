#!/usr/bin/env python3
"""Rewrite <lastmod> on every <url> in sitemap.xml from git history.

WHAT "lastmod" MEANS HERE
-------------------------
The date of the most recent commit in which the page's *visible content*
changed — not merely the last commit that touched the file.

Using the raw last-commit date looked deterministic but was actively
misleading: sitewide sweeps (OG-image regeneration, absolutising
BreadcrumbList URLs, adding a robots meta) rewrite hundreds of files without
altering a word. Driving lastmod from those collapsed all 284 URLs onto two
dates, telling Google the entire site changed in 48 hours. That is a false
freshness signal, and a sitemap that cries wolf gets its lastmod ignored.

So each page is walked back through history until a commit is found whose
diff survives stripping JSON-LD, meta, link tags and comments — the same
definition of "editorial content" that scripts/check-last-reviewed.py uses to
decide whether a blog needs its last_reviewed bumped. The two must agree, so
the definition is imported rather than duplicated.

Deterministic across clones, and idempotent. Falls back to filesystem mtime
only for files git doesn't know about.
"""

import re
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from importlib import import_module
# "Did a reader see anything new?" — defined once, next to the pre-commit
# guard's stricter rule, so the two notions stay deliberate rather than drifting.
main_text = import_module('check-last-reviewed').main_text

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


def _blob(sha: str, rel: str) -> str | None:
    """File contents at a commit, or None if it did not exist there."""
    out = subprocess.run(['git', 'show', f'{sha}:{rel}'],
                         cwd=ROOT, capture_output=True, text=True)
    return out.stdout if out.returncode == 0 else None


def lastmod_for(path: Path) -> str:
    rel = path.relative_to(ROOT).as_posix()
    try:
        log = subprocess.check_output(
            ['git', 'log', '--format=%H %cs', '--', rel],
            cwd=ROOT, text=True, stderr=subprocess.DEVNULL).strip()
    except subprocess.CalledProcessError:
        log = ''

    if log:
        commits = [line.split(' ', 1) for line in log.splitlines()]
        for i, (sha, cdate) in enumerate(commits):
            body = _blob(sha, rel)
            if body is None:
                continue
            if i + 1 >= len(commits):
                return cdate                    # the commit that created it
            parent_body = _blob(commits[i + 1][0], rel)
            if parent_body is None:
                return cdate                    # file appeared in this commit
            if main_text(body) != main_text(parent_body):
                return cdate                    # newest real content change
        return commits[-1][1]                   # only ever metadata churn

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
