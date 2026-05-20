#!/usr/bin/env python3
"""
Lighthouse axe `label-content-name-mismatch` fix:

1) Footer social icons have visible text "in" / "tw" / "fb" but aria-label
   "LinkedIn" / "Twitter" / "Facebook" (Facebook doesn't even contain "fb"
   as a substring, so axe flags it). Wrap visible text in
   <span aria-hidden="true">..</span> so the accessible name calculation
   ignores it and only the aria-label counts.

2) Nav search button has visible text "Search ⌘K" and aria-label
   "Open site search". "⌘K" isn't in the aria-label. Mark the <kbd>
   as aria-hidden so it's excluded from the visible-text check.
"""
import re
import sys
from pathlib import Path

# <a href="..." aria-label="LinkedIn">in</a>  →  wrap visible text
SOCIAL_LINK = re.compile(
    r'(<a\s+href="[^"]+"\s+aria-label="(?:LinkedIn|Twitter|Facebook)">)([a-z]{2})(</a>)'
)

# <kbd>⌘K</kbd> inside the nav-search trigger
NAV_KBD = re.compile(r'(<button[^>]*as-search-trigger[^>]*>.*?)<kbd>(⌘K)</kbd>')


def fix(html: str) -> tuple[str, int]:
    n = 0
    new = SOCIAL_LINK.sub(
        lambda m: f'{m.group(1)}<span aria-hidden="true">{m.group(2)}</span>{m.group(3)}',
        html,
    )
    n += len(SOCIAL_LINK.findall(html))

    def kbd_sub(m):
        nonlocal n
        n += 1
        return f'{m.group(1)}<kbd aria-hidden="true">{m.group(2)}</kbd>'

    new = NAV_KBD.sub(kbd_sub, new)
    return new, n


def main():
    root = Path(__file__).resolve().parent.parent
    total_files = 0
    total = 0
    for path in root.rglob('*.html'):
        if any(part in {'node_modules', 'dist', '.git'} for part in path.parts):
            continue
        text = path.read_text(encoding='utf-8')
        new_text, n = fix(text)
        if n > 0 and new_text != text:
            path.write_text(new_text, encoding='utf-8')
            total_files += 1
            total += n
    print(f'Label-mismatch fixes: {total} edits across {total_files} files')


if __name__ == '__main__':
    sys.exit(main())
