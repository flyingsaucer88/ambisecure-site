#!/usr/bin/env python3
"""Lint the site's .htaccess for redirect hygiene.

Checks:
  - Duplicate redirect sources.
  - Redirect chains (A -> B where B is itself a redirect source).
  - Redirect loops (A -> B -> ... -> A).
  - Self-redirects (A -> A).
  - Trailing-slash whiplash (A -> A/ where A/ -> A).

Exit code 0 = clean, 1 = issues found.

    python3 tools/lint-htaccess.py
"""
import os, re, sys
from collections import defaultdict, Counter

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
HT_PATH = os.path.join(ROOT, ".htaccess")

REDIRECT_RE = re.compile(r"^\s*Redirect\s+301\s+(\S+)\s+(\S+)\s*$")
REDIRECT_MATCH_RE = re.compile(r"^\s*RedirectMatch\s+301\s+(\S+)\s+(\S+)\s*$")

def main():
    if not os.path.exists(HT_PATH):
        print(f"FAIL: {HT_PATH} not found.")
        sys.exit(1)

    redirects = []
    rmatches = []
    with open(HT_PATH) as f:
        for n, line in enumerate(f, 1):
            if line.lstrip().startswith("#"):
                continue
            m = REDIRECT_RE.match(line)
            if m:
                redirects.append((n, m.group(1), m.group(2)))
                continue
            m = REDIRECT_MATCH_RE.match(line)
            if m:
                rmatches.append((n, m.group(1), m.group(2)))

    issues = []

    # Duplicate sources (plain Redirect 301 only)
    src_counts = Counter(src for _, src, _ in redirects)
    for src, count in src_counts.items():
        if count > 1:
            lines = [str(n) for n, s, _ in redirects if s == src]
            issues.append(f"duplicate source {src!r} on lines {', '.join(lines)}")

    # Source -> destination map
    src_to_dst = {src: dst for _, src, dst in redirects}

    # Self-redirects
    for n, src, dst in redirects:
        if src == dst:
            issues.append(f"line {n}: self-redirect {src!r} -> {dst!r}")

    # Chains and loops
    def follow(start):
        seen = [start]
        cur = start
        while cur in src_to_dst:
            nxt = src_to_dst[cur]
            if nxt in seen:
                return ("loop", seen + [nxt])
            seen.append(nxt)
            if len(seen) > 8:
                return ("toolong", seen)
            cur = nxt
        return ("ok", seen)

    for n, src, dst in redirects:
        kind, path = follow(src)
        if kind == "loop":
            issues.append(f"line {n}: loop {' -> '.join(path)}")
        elif kind == "toolong":
            issues.append(f"line {n}: chain too long ({len(path)} hops) starting at {src}")
        elif len(path) > 2:
            issues.append(f"line {n}: chain {' -> '.join(path)}")

    # Trailing-slash whiplash
    for src, dst in src_to_dst.items():
        if dst.rstrip("/") == src.rstrip("/") and dst != src:
            issues.append(f"trailing-slash whiplash: {src} <-> {dst}")

    # Summary
    print(f".htaccess linted:")
    print(f"  Redirect 301      entries: {len(redirects)}")
    print(f"  RedirectMatch 301 entries: {len(rmatches)}")
    print(f"  unique sources:           {len(src_counts)}")

    if issues:
        print(f"\n{len(issues)} issue(s):")
        for i in issues:
            print(f"  ! {i}")
        sys.exit(1)
    print(f"\nOK")
    sys.exit(0)

if __name__ == "__main__":
    main()
