#!/usr/bin/env python3
"""Guard against the external tracker's duplicate_intent finding.

The tracker fires a HIGH finding when two pages on the same domain satisfy

    jaccard(tokens(title + " " + h1)) >= 0.80

where tokens() is the set of lowercase \\w+ runs. Two video pages tripped this
in July 2026 because their title and H1 differed only by the service name,
even though their body copy was substantially different — the check never
reads the body, so rewriting prose cannot clear it. Only the title and H1 can.

A second finding fires when a single page's title and H1 have *too little* in
common (jaccard < 0.20), so differentiating a title must not be taken so far
that the H1 stops matching it.

    python3 tools/audit-duplicate-intent.py           # fail on any pair >= 0.80
    python3 tools/audit-duplicate-intent.py --top 20  # show the closest pairs
"""
import argparse
import html
import itertools
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SITE = "https://ambisecure.ambimat.com"
DUP_THRESHOLD = 0.80
DIVERGE_THRESHOLD = 0.20

tokens = lambda s: set(re.findall(r"\w+", s.lower()))


def jaccard(a, b):
    return len(a & b) / len(a | b) if a | b else 0.0


def pages():
    sm = (ROOT / "sitemap.xml").read_text()
    out = {}
    for loc in re.findall(r"<loc>([^<]+)</loc>", sm):
        rel = loc[len(SITE):].lstrip("/")
        p = ROOT / (rel + "index.html")
        if not p.is_file():
            continue
        t = p.read_text(encoding="utf-8", errors="replace")
        mt = re.search(r"<title>(.*?)</title>", t, re.S)
        mh = re.search(r"<h1[^>]*>(.*?)</h1>", t, re.S)
        if not (mt and mh):
            continue
        clean = lambda m: html.unescape(re.sub(r"<[^>]+>", "", m.group(1))).strip()
        out[loc[len(SITE):] or "/"] = (clean(mt), clean(mh))
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--top", type=int, default=5)
    ap.add_argument("--strict", action="store_true",
                    help="also fail on H1/title divergence (report-only by default)")
    a = ap.parse_args()

    ps = pages()
    scored = sorted(
        ((jaccard(tokens(" ".join(v1)), tokens(" ".join(v2))), k1, k2)
         for (k1, v1), (k2, v2) in itertools.combinations(ps.items(), 2)),
        reverse=True)

    dupes = [s for s in scored if s[0] >= DUP_THRESHOLD]
    diverged = [(jaccard(tokens(t), tokens(h)), u)
                for u, (t, h) in ps.items()
                if jaccard(tokens(t), tokens(h)) < DIVERGE_THRESHOLD]

    print(f"=== duplicate-intent audit === {len(ps)} sitemap pages compared")
    print(f"  closest {a.top} title+H1 pairs:")
    for v, x, y in scored[:a.top]:
        print(f"    {v:.3f}  {x}  <->  {y}")

    ok = True
    if dupes:
        ok = False
        print(f"\n  FAIL: {len(dupes)} pair(s) at or above {DUP_THRESHOLD}:")
        for v, x, y in dupes:
            print(f"    {v:.3f}  {x}  <->  {y}")
        print("  Differentiate the <title> and <h1>; body copy does not count.")
    if diverged:
        # Report-only unless --strict. These are pre-existing editorial H1s
        # ("Problems we know how to solve.") that read as deliberate voice
        # rather than as defects, so fixing them is an editorial decision.
        label = "FAIL" if a.strict else "WARN"
        if a.strict:
            ok = False
        print(f"\n  {label}: {len(diverged)} page(s) whose H1 and title share < {DIVERGE_THRESHOLD}")
        print("        (the tracker's separate 'H1 and title diverge' finding)")
        for v, u in diverged[:8]:
            print(f"    {v:.3f}  {u}")
        if len(diverged) > 8:
            print(f"    ... and {len(diverged)-8} more; run --top 0 for the list")

    if ok:
        print(f"\n  ok  no pair >= {DUP_THRESHOLD} (duplicate_intent clear)")
        return 0
    return 1


if __name__ == "__main__":
    sys.exit(main())
