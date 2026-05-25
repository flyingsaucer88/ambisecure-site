#!/usr/bin/env python3
"""Content metadata audit for the AmbiSecure static site.

Walks every HTML page (excluding legacysitedata/) and reports:
  - Duplicate <title>s
  - Duplicate <meta description>s
  - Missing canonical
  - Missing OG image
  - Missing OG description
  - Missing JSON-LD (no <script type="application/ld+json">)
  - Missing BreadcrumbList in JSON-LD graph
  - Blog posts (under /blog/<slug>/) without an Article JSON-LD
  - Long-form pages without an H1
  - <img> tags missing alt attributes

Exit code 0 = clean, 1 = issues found (non-zero in CI fails the build).

    python3 tools/audit-content.py
    python3 tools/audit-content.py --quiet         # summary line only
    python3 tools/audit-content.py --warn-only     # exit 0 even with issues
"""
import argparse, json, os, re, sys
from collections import defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

# Per-page exemptions. Each key is a relative path; value is the set of
# checks that are intentionally not enforced for that page.
EXEMPT = {
    "404.html": {"canonical", "og_image", "og_description", "jsonld", "breadcrumb"},
    "index.html": {"breadcrumb"},  # homepage has no breadcrumb trail
}

# What HTML files to scan
def iter_html():
    for dirpath, _, files in os.walk(ROOT):
        if any(s in dirpath for s in ("/legacysitedata/", "/.git/", "/node_modules/",
                                       "/.lighthouseci/", "/dist/", "/_internal/")):
            continue
        if dirpath.endswith(("/_internal", os.sep + "_internal")):
            continue
        if dirpath.endswith("assets") or "/assets/" in dirpath:
            continue
        for name in files:
            if name.endswith(".html"):
                yield os.path.join(dirpath, name)

def rel(path):
    return os.path.relpath(path, ROOT)

# ---- Per-file extractors ----
TITLE_RE = re.compile(r"<title>([^<]+)</title>", re.IGNORECASE)
DESC_RE = re.compile(r'<meta name="description" content="([^"]+)"', re.IGNORECASE)
CANON_RE = re.compile(r'<link rel="canonical" href="([^"]+)"', re.IGNORECASE)
OG_IMG_RE = re.compile(r'<meta property="og:image" content="([^"]+)"', re.IGNORECASE)
OG_DESC_RE = re.compile(r'<meta property="og:description" content="([^"]+)"', re.IGNORECASE)
LD_RE = re.compile(r'<script type="application/ld\+json">\s*(.*?)\s*</script>', re.DOTALL)
H1_RE = re.compile(r"<h1[^>]*>", re.IGNORECASE)
IMG_RE = re.compile(r"<img\b([^>]*)>", re.IGNORECASE)
ALT_RE = re.compile(r'\balt=("[^"]*"|\'[^\']*\')', re.IGNORECASE)

# ---- Audit ----
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--quiet", action="store_true")
    ap.add_argument("--warn-only", action="store_true")
    args = ap.parse_args()

    titles = defaultdict(list)
    descs = defaultdict(list)
    no_canonical = []
    no_og_image = []
    no_og_desc = []
    no_jsonld = []
    no_breadcrumb = []
    blog_no_article = []
    no_h1 = []
    missing_alts = []
    total = 0

    META_REFRESH_RE = re.compile(r'<meta\s+http-equiv="refresh"', re.IGNORECASE)
    REDIRECT_EXEMPT = {"canonical", "og_image", "og_description", "jsonld", "breadcrumb"}

    for path in iter_html():
        total += 1
        with open(path) as f:
            html = f.read()
        relpath = rel(path)
        exempt = set(EXEMPT.get(relpath, set()))
        if META_REFRESH_RE.search(html):
            exempt |= REDIRECT_EXEMPT

        m = TITLE_RE.search(html)
        if m: titles[m.group(1).strip()].append(relpath)
        m = DESC_RE.search(html)
        if m: descs[m.group(1).strip()].append(relpath)
        if "canonical" not in exempt and not CANON_RE.search(html):
            no_canonical.append(relpath)
        if "og_image" not in exempt and not OG_IMG_RE.search(html):
            no_og_image.append(relpath)
        if "og_description" not in exempt and not OG_DESC_RE.search(html):
            no_og_desc.append(relpath)

        ld_blocks = LD_RE.findall(html)
        if not ld_blocks:
            if "jsonld" not in exempt:
                no_jsonld.append(relpath)
        else:
            has_breadcrumb = False
            has_article = False
            for block in ld_blocks:
                try:
                    parsed = json.loads(block)
                except Exception:
                    continue
                items = parsed.get("@graph", [parsed]) if isinstance(parsed, dict) else []
                for it in items:
                    t = it.get("@type") if isinstance(it, dict) else None
                    if t == "BreadcrumbList":
                        has_breadcrumb = True
                    if t == "Article":
                        has_article = True
            if not has_breadcrumb and "breadcrumb" not in exempt:
                no_breadcrumb.append(relpath)
            # Blog cornerstone / archive / regular post pages.
            if "/blog/" in relpath and not relpath.endswith("blog/index.html"):
                last = os.path.basename(os.path.dirname(relpath))
                # Skip category landings, archive landing, page/2.
                if last not in ("blog", "categories", "archive", "2") and not has_article:
                    blog_no_article.append(relpath)

        if not H1_RE.search(html):
            no_h1.append(relpath)

        # Image alt audit
        for m in IMG_RE.finditer(html):
            attrs = m.group(1)
            am = ALT_RE.search(attrs)
            if not am:
                missing_alts.append((relpath, "no-alt"))
            else:
                val = am.group(1).strip("\"'")
                # Allow empty alt only when the image is decorative (data-decorative).
                if not val and "data-decorative" not in attrs and 'role="presentation"' not in attrs:
                    missing_alts.append((relpath, "empty-alt"))

    dup_titles = {t: p for t, p in titles.items() if len(p) > 1}
    dup_descs = {d: p for d, p in descs.items() if len(p) > 1}

    issues = (
        sum(len(v) for v in dup_titles.values()) +
        sum(len(v) for v in dup_descs.values()) +
        len(no_canonical) + len(no_og_image) + len(no_og_desc) +
        len(no_jsonld) + len(no_breadcrumb) + len(blog_no_article) +
        len(no_h1) + len(missing_alts)
    )

    print(f"audit-content: {total} HTML pages scanned")
    print(f"  duplicate <title>s:           {len(dup_titles)} groups")
    print(f"  duplicate <meta description>s:{len(dup_descs)} groups")
    print(f"  missing canonical:            {len(no_canonical)}")
    print(f"  missing og:image:             {len(no_og_image)}")
    print(f"  missing og:description:       {len(no_og_desc)}")
    print(f"  missing JSON-LD:              {len(no_jsonld)}")
    print(f"  missing BreadcrumbList:       {len(no_breadcrumb)}")
    print(f"  blog posts w/o Article LD:    {len(blog_no_article)}")
    print(f"  missing <h1>:                 {len(no_h1)}")
    print(f"  <img> missing alt:            {len(missing_alts)}")

    if args.quiet:
        if args.warn_only or issues == 0:
            sys.exit(0)
        sys.exit(1)

    def print_group(label, items, limit=8):
        if not items:
            return
        print(f"\n{label}:")
        for x in items[:limit]:
            print(f"  - {x}")
        if len(items) > limit:
            print(f"  ... and {len(items) - limit} more")

    if dup_titles:
        print("\nDuplicate <title>s:")
        for t, paths in list(dup_titles.items())[:6]:
            print(f"  - “{t}” ({len(paths)} pages)")
            for p in paths[:3]:
                print(f"      {p}")
            if len(paths) > 3:
                print(f"      ... and {len(paths) - 3} more")
    if dup_descs:
        print("\nDuplicate <meta description>s:")
        for d, paths in list(dup_descs.items())[:6]:
            print(f"  - “{d[:80]}…” ({len(paths)} pages)")
            for p in paths[:3]:
                print(f"      {p}")
            if len(paths) > 3:
                print(f"      ... and {len(paths) - 3} more")

    print_group("Missing canonical", no_canonical)
    print_group("Missing og:image", no_og_image)
    print_group("Missing og:description", no_og_desc)
    print_group("Missing JSON-LD", no_jsonld)
    print_group("Missing BreadcrumbList JSON-LD", no_breadcrumb)
    print_group("Blog posts without Article JSON-LD", blog_no_article)
    print_group("Missing <h1>", no_h1)
    if missing_alts:
        print(f"\n<img> alt issues (first 10):")
        for path, kind in missing_alts[:10]:
            print(f"  - {path} ({kind})")
        if len(missing_alts) > 10:
            print(f"  ... and {len(missing_alts) - 10} more")

    if issues == 0:
        print("\nOK — no issues found.")
        sys.exit(0)
    print(f"\n{issues} issues across the site.")
    sys.exit(0 if args.warn_only else 1)

if __name__ == "__main__":
    main()
