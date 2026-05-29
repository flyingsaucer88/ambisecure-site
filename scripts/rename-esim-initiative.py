#!/usr/bin/env python3
# Rename every public-facing occurrence of the phrase
#   {e/E}{s/S}{i/I}{m/M} + whitespace + {i/I}nitiative
# to "SIMAuth" across source files. The phrase is written here in
# character-class form deliberately so this script does not self-mutate
# when run against its own source — the regex below is the canonical
# definition, not this comment.
#
# What this does NOT touch:
# - The subdomain `esim.ambimat.com` (URL surface — out of scope per spec).
# - The product folder `products/esim-solution/` or any other "esim"
#   usage that is not the matched phrase.
# - Directories under .git, dist, build, node_modules, _internal,
#   legacysitedata, .next. Also skips its own source file (see below).
#
# Idempotent: re-running on a clean tree produces zero changes.

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

EXCLUDE_TOP_DIRS = {
    '.git', '.github', '.githooks', '.lighthouseci', '.claude',
    'dist', 'build', '.next', 'node_modules',
    '_internal', 'legacysitedata', 'Logos',
}

INCLUDE_SUFFIXES = {
    '.html', '.md', '.xml', '.txt', '.json', '.js', '.css', '.py',
}

# Match e/E s/S i/I m/M + any whitespace (incl. NBSP) + i/I nitiative.
# \s in Python regex matches Unicode whitespace including NBSP. Preceded
# by a non-word boundary so we don't catch e.g. "esim_initiative" embedded
# in an identifier — slug variants were already searched and confirmed
# absent in this repo.
PHRASE_RE = re.compile(r'(?<![A-Za-z0-9_-])[eE][sS][iI][mM]\s+[iI]nitiative')

REPLACEMENT = 'SIMAuth'

# Skip our own source file. The canonical regex spelling above contains
# the matched phrase by construction; without this guard the script would
# self-mutate when run on the repo it lives in.
SELF = Path(__file__).resolve()


def iter_targets():
    for p in ROOT.rglob('*'):
        if not p.is_file():
            continue
        if p.resolve() == SELF:
            continue
        parts = p.relative_to(ROOT).parts
        if parts and parts[0] in EXCLUDE_TOP_DIRS:
            continue
        if p.suffix.lower() not in INCLUDE_SUFFIXES:
            continue
        yield p


def main():
    files_changed = 0
    total_replacements = 0
    per_file = []

    for path in iter_targets():
        try:
            text = path.read_text(encoding='utf-8')
        except (UnicodeDecodeError, OSError) as e:
            print(f'  SKIP (read error): {path.relative_to(ROOT)} — {e}',
                  file=sys.stderr)
            continue
        new_text, n = PHRASE_RE.subn(REPLACEMENT, text)
        if n:
            path.write_text(new_text, encoding='utf-8')
            files_changed += 1
            total_replacements += n
            per_file.append((path.relative_to(ROOT).as_posix(), n))

    per_file.sort(key=lambda x: (-x[1], x[0]))
    print(f'Files changed:       {files_changed}')
    print(f'Total replacements:  {total_replacements}')
    print()
    print('Top 25 files by replacement count:')
    for rel, n in per_file[:25]:
        print(f'  {n:4d}  {rel}')
    if len(per_file) > 25:
        print(f'  ... and {len(per_file) - 25} more files')


if __name__ == '__main__':
    main()
