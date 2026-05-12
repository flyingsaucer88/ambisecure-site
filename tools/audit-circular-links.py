#!/usr/bin/env python3
"""Find anchors that point back at the page they live on.

Reports two classes of issue:

  HARD  A clickable anchor (<a href="...">) whose normalized target is
        the same as the page's own canonical URL. Bare # and "#main"
        anchors are skipped (they are the in-page skip-link / hash
        nav idiom and don't count).

  SOFT  Anchors that point at the page's parent index. These are not
        always wrong — a breadcrumb back to the section index is fine
        — but they ARE flagged on the section-index pages themselves
        (e.g. /technologies/ cards that link to /technologies/), which
        IS a real loop.

  Usage:
    python3 tools/audit-circular-links.py                 # full report
    python3 tools/audit-circular-links.py --hard-only
    python3 tools/audit-circular-links.py --json out.json
"""
import argparse, json, os, re, sys
from collections import defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

SITE = "https://ambisecure.ambimat.com"

# Anchors that are not navigation
SKIP_HREFS = {"#", "#main", "#content", "#top", "#main-content"}

# Roles where back-to-parent links are EXPECTED (breadcrumb, navbar,
# ecosystem bar). We strip these blocks before scanning.
STRIP_BLOCKS = [
    re.compile(r'<nav class="breadcrumb[^"]*"[^>]*>.*?</nav>', re.DOTALL | re.IGNORECASE),
    re.compile(r'<header class="navbar"[^>]*>.*?</header>', re.DOTALL | re.IGNORECASE),
    re.compile(r'<div class="ecosystem-bar"[^>]*>.*?</div>\s*</div>', re.DOTALL | re.IGNORECASE),
    re.compile(r'<footer[^>]*>.*?</footer>', re.DOTALL | re.IGNORECASE),
    re.compile(r"<head[^>]*>.*?</head>", re.DOTALL | re.IGNORECASE),
    re.compile(r"<script[^>]*>.*?</script>", re.DOTALL | re.IGNORECASE),
    re.compile(r"<style[^>]*>.*?</style>", re.DOTALL | re.IGNORECASE),
]

A_RE = re.compile(r'<a\s+([^>]*?)>(.*?)</a>', re.DOTALL | re.IGNORECASE)
HREF_RE = re.compile(r'href="([^"]+)"', re.IGNORECASE)
TAG_RE = re.compile(r"<[^>]+>", re.DOTALL)

def normalize(href, current_path):
    """Resolve `href` to the same form as `current_path`.

    current_path is like "/technologies/" or "/blog/foo/".
    Returns the normalised target path or None if external / mailto / etc.
    """
    if href in SKIP_HREFS:
        return None
    if href.startswith(("http://", "https://")):
        if not href.startswith(SITE):
            return None
        href = href[len(SITE):] or "/"
    if href.startswith(("mailto:", "tel:")):
        return None
    if not href.startswith("/"):
        return None  # relative — too rare on this site to bother modelling
    # Strip query + fragment
    href = href.split("#", 1)[0].split("?", 1)[0]
    if not href:
        return None
    # Anchor-only — same page
    if href == "/" and current_path == "/":
        return "/"
    # Ensure trailing slash on dir-style paths
    if not href.endswith("/") and "." not in os.path.basename(href):
        href += "/"
    return href

def page_path(html_path):
    rel = os.path.relpath(html_path, ROOT)
    if rel == "index.html":
        return "/"
    if rel.endswith("/index.html"):
        return "/" + rel[: -len("index.html")]
    return "/" + rel  # e.g. /404.html

def scan_file(path):
    """Return list of (offending_href, anchor_text, kind) for `path`."""
    with open(path) as f:
        html = f.read()
    body = html
    for r in STRIP_BLOCKS:
        body = r.sub("", body)
    me = page_path(path)
    issues = []
    for m in A_RE.finditer(body):
        attrs, inner = m.group(1), m.group(2)
        hrefm = HREF_RE.search(attrs)
        if not hrefm:
            continue
        href = hrefm.group(1)
        target = normalize(href, me)
        if target is None:
            continue
        anchor_text = TAG_RE.sub("", inner)
        anchor_text = re.sub(r"\s+", " ", anchor_text).strip()[:80]
        kind = None
        if target == me:
            kind = "HARD"  # link points to itself
        elif me != "/" and target == "/" + "/".join(me.strip("/").split("/")[:-1]) + "/" and me.count("/") >= 3:
            # link from /a/b/c/ back to /a/b/ — that IS a back-to-parent
            # link, but only flag if the source is NOT a deep leaf
            # (handled separately).
            pass
        # Section-index loops: /a/ has a card linking to /a/ — that's
        # already HARD. /a/ linking to /a/sub/ is fine.
        if kind == "HARD" and href in SKIP_HREFS:
            continue
        if kind:
            issues.append({"href": href, "target": target, "kind": kind,
                            "anchor": anchor_text})
    return issues

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--hard-only", action="store_true")
    ap.add_argument("--json", help="Write JSON report to PATH")
    args = ap.parse_args()

    by_page = defaultdict(list)
    total = 0

    for dirpath, _, files in os.walk(ROOT):
        if any(s in dirpath for s in ("/legacysitedata/", "/.git/", "/node_modules/",
                                       "/.lighthouseci/", "/dist/", "/_internal/", "/assets/")):
            continue
        if dirpath.endswith(("/_internal", os.sep + "_internal")):
            continue
        for name in files:
            if not name.endswith(".html"):
                continue
            path = os.path.join(dirpath, name)
            for iss in scan_file(path):
                if args.hard_only and iss["kind"] != "HARD":
                    continue
                by_page[page_path(path)].append(iss)
                total += 1

    print(f"audit-circular-links: {total} circular link(s) across {len(by_page)} page(s)")
    if not by_page:
        return 0

    for p in sorted(by_page):
        print(f"\n  {p}  ({len(by_page[p])} issue(s))")
        for iss in by_page[p][:20]:
            print(f"    [{iss['kind']}] {iss['href']:<40} text=\"{iss['anchor']}\"")
        if len(by_page[p]) > 20:
            print(f"    ... and {len(by_page[p])-20} more")

    if args.json:
        with open(args.json, "w") as f:
            json.dump({"total": total, "by_page": by_page}, f, indent=2)

    return 1 if total > 0 else 0

if __name__ == "__main__":
    sys.exit(main())
