#!/usr/bin/env python3
"""
Lighthouse axe `heading-order` fix: footer column headings use <h4>, which on
pages whose body ends at <h2> creates an h2→h4 skip. Promote footer <h4> →
<h3> inside the <footer class="site-footer"> block only.
"""
import re
import sys
from pathlib import Path

FOOTER_BLOCK = re.compile(
    r'(<footer\b[^>]*class="[^"]*site-footer[^"]*"[^>]*>.*?</footer>)',
    re.DOTALL,
)
H4_OPEN = re.compile(r'<h4(\s[^>]*)?>')
H4_CLOSE = re.compile(r'</h4>')


def fix(html: str) -> tuple[str, int]:
    changed = [0]

    def rewrite_block(m: re.Match) -> str:
        block = m.group(1)
        new = H4_OPEN.sub(lambda om: f'<h3{om.group(1) or ""}>', block)
        new = H4_CLOSE.sub('</h3>', new)
        if new != block:
            changed[0] += new.count('<h3') - block.count('<h3')
        return new

    return FOOTER_BLOCK.sub(rewrite_block, html), changed[0]


def main():
    root = Path(__file__).resolve().parent.parent
    total_files = 0
    total_replacements = 0
    for path in root.rglob('*.html'):
        if any(part in {'node_modules', 'dist', '.git'} for part in path.parts):
            continue
        text = path.read_text(encoding='utf-8')
        new_text, n = fix(text)
        if n > 0:
            path.write_text(new_text, encoding='utf-8')
            total_files += 1
            total_replacements += n
    print(f'Footer <h4>→<h3>: {total_replacements} tags across {total_files} files')


if __name__ == '__main__':
    sys.exit(main())
