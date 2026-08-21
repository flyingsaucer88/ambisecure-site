#!/usr/bin/env python3
"""Rewrite relative BreadcrumbList item URLs to canonical absolute HTTPS URLs.

WHY
---
Google's breadcrumb structured-data guidance expects `item` to be a URL that
identifies the page. Relative values such as "/" or "/blog/" are ambiguous
outside the document that carries them, and several validators drop the
affected list element entirely. The site's own convention is already absolute
everywhere else in the graph (canonicals, @id values, ItemList entries), so the
relative ones are an inconsistency rather than a deliberate choice.

SCOPE — deliberately narrow
---------------------------
Only string `item` values that begin with "/" are touched, and only inside
`application/ld+json` <script> blocks. Verified before writing this tool:
every such value on the site lives inside a BreadcrumbList, none use the
object form, and none point off-site. Nothing else in the JSON graph is
reformatted, reordered or re-serialised — the edit is textual, so hierarchy,
names, ordering and all unrelated schema survive byte-for-byte.

Idempotent: after one pass no relative values remain, so a second run is a
guaranteed no-op. That property is asserted by tools/audit-all.sh.

    python3 tools/fix-breadcrumb-urls.py [--check]

--check exits 1 if any relative item URL remains (for CI / audits).
"""
import pathlib
import re
import sys

BASE = 'https://ambisecure.ambimat.com'
SKIP = {'dist', 'node_modules', 'legacysitedata', '_internal', 'docs', '.git'}

SCRIPT_RE = re.compile(
    r'(<script[^>]*application/ld\+json[^>]*>)(.*?)(</script>)', re.S | re.I)
# Only a site-absolute path: starts with a single "/", never "//" (protocol
# relative) and never a full URL.
ITEM_RE = re.compile(r'("item"\s*:\s*")(/(?!/)[^"]*)(")')


def fix_text(html: str) -> tuple[str, int]:
    total = 0

    def fix_block(m: re.Match) -> str:
        nonlocal total
        body, n = ITEM_RE.subn(lambda i: i.group(1) + BASE + i.group(2) + i.group(3),
                               m.group(2))
        total += n
        return m.group(1) + body + m.group(3)

    return SCRIPT_RE.sub(fix_block, html), total


def main() -> int:
    check = '--check' in sys.argv
    root = pathlib.Path(__file__).resolve().parent.parent
    files = changed = items = 0

    for path in sorted(root.rglob('*.html')):
        if SKIP & set(path.relative_to(root).parts):
            continue
        original = path.read_text(encoding='utf-8')
        fixed, n = fix_text(original)
        if n:
            files += 1
            items += n
            if not check:
                path.write_text(fixed, encoding='utf-8')
                changed += 1

    if check:
        if items:
            print(f'FAIL: {items} relative BreadcrumbList item URL(s) '
                  f'across {files} file(s)')
            return 1
        print('ok  every BreadcrumbList item URL is absolute')
        return 0

    print(f'fix-breadcrumb-urls: {items} item URL(s) absolutised '
          f'across {changed} file(s)')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
