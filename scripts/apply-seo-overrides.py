#!/usr/bin/env python3
"""Apply the OVERRIDES + DESCRIPTION_ONLY maps from _seo_overrides.py to
the corresponding HTML pages. Idempotent — re-running after a successful
pass produces no further changes.

Validation:
- Title must contain only the literal text between <title>...</title>.
- Meta description must replace ONLY the content="..." of the first
  <meta name="description"> tag, leaving other attributes intact.

Run:
    python3 scripts/apply-seo-overrides.py
"""

import html
import re
import sys
from pathlib import Path

# Make _seo_overrides importable when run from anywhere
sys.path.insert(0, str(Path(__file__).resolve().parent))
from _seo_overrides import OVERRIDES, DESCRIPTION_ONLY  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent

TITLE_RE = re.compile(r'(<title[^>]*>)(.*?)(</title>)', re.DOTALL | re.IGNORECASE)
# Backreference the opening quote of content so apostrophes (Cloudflare's,
# don't) don't terminate the match early.
META_DESC_RE = re.compile(
    r'(<meta\s+(?:[^>]*?\s+)?name=["\']description["\'][^>]*?content=)(["\'])((?:(?!\2).)*)(\2)',
    re.IGNORECASE | re.DOTALL,
)


def apply_to_file(rel: str, new_title: str | None, new_desc: str | None) -> dict:
    path = ROOT / rel
    if not path.is_file():
        return {'file': rel, 'status': 'missing'}
    text = path.read_text(encoding='utf-8')
    original = text
    notes = []

    if new_title is not None:
        # Replace only the FIRST <title>...</title> (the head one).
        new_title_html = html.escape(new_title, quote=False)
        # html.escape encodes &, <, >. The site uses raw '&' in titles
        # (e.g. "FIDO & JavaCard"); we want to preserve the source's
        # &amp; encoding. Pre-escape the literal & in our string.
        new_title_encoded = new_title.replace('&amp;', '&').replace('&', '&amp;')

        def _sub_title(m, _used=[False]):
            if _used[0]:
                return m.group(0)
            _used[0] = True
            return f'{m.group(1)}{new_title_encoded}{m.group(3)}'
        new_text = TITLE_RE.sub(_sub_title, text, count=1)
        if new_text == text:
            notes.append('title:no-match')
        else:
            text = new_text

    if new_desc is not None:
        desc_encoded = new_desc.replace('&amp;', '&').replace('&', '&amp;')
        # New groups: (1)prefix (2)open-quote (3)content (4)close-quote
        new_text, n = META_DESC_RE.subn(
            lambda m: f'{m.group(1)}{m.group(2)}{desc_encoded}{m.group(4)}',
            text, count=1)
        if n == 0:
            notes.append('description:no-match')
        else:
            text = new_text

    if text != original:
        path.write_text(text, encoding='utf-8')
        return {'file': rel, 'status': 'updated', 'notes': notes}
    return {'file': rel, 'status': 'unchanged', 'notes': notes}


def main():
    results = []
    # Pages with title override (and optionally an inline description override)
    for rel, spec in OVERRIDES.items():
        r = apply_to_file(rel, spec.get('title'), spec.get('description'))
        results.append(r)

    # Pages with description-only override
    for rel, desc in DESCRIPTION_ONLY.items():
        # Don't double-apply if a description was also in OVERRIDES
        if rel in OVERRIDES and 'description' in OVERRIDES[rel]:
            continue
        r = apply_to_file(rel, None, desc)
        results.append(r)

    updated = [r for r in results if r['status'] == 'updated']
    unchanged = [r for r in results if r['status'] == 'unchanged']
    missing = [r for r in results if r['status'] == 'missing']
    issues = [r for r in results if r['notes']]

    print(f'Updated:   {len(updated)}')
    print(f'Unchanged: {len(unchanged)}')
    if missing:
        print(f'Missing:   {len(missing)}')
        for r in missing:
            print(f'  - {r["file"]}')
    if issues:
        print(f'Notes:')
        for r in issues:
            print(f'  - {r["file"]}: {r["notes"]}')


if __name__ == '__main__':
    main()
