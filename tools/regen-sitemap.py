#!/usr/bin/env python3
"""Regenerate sitemap.xml from on-disk index.html pages.

Strategy:
  - Walk the repo. For every `index.html` whose folder is not in the EXCLUDE
    list, derive the canonical URL.
  - Read the existing sitemap.xml. Preserve per-URL <changefreq> and
    <priority> values where they exist. Apply per-section defaults
    otherwise.
  - Write the new sitemap.xml.

Default: dry-run; prints the diff.

  python3 tools/regen-sitemap.py            # dry-run
  python3 tools/regen-sitemap.py --apply    # rewrite sitemap.xml

The output passes `xmllint --noout` and matches the section priority
posture used through Phase 11.
"""
import argparse, os, re, sys
from xml.sax.saxutils import escape

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SITE = "https://ambisecure.ambimat.com"

# Folders whose pages should NOT appear in the public sitemap.
EXCLUDE_TOPLEVEL = {".git", ".github", ".githooks", ".lighthouseci",
                    "assets", "docs", "legacysitedata", "node_modules",
                    "scripts", "tools", "dist"}

# Per-URL-prefix priority + changefreq defaults.
DEFAULTS = [
    ("/", "weekly", "1.0"),  # homepage
    ("/products/", "monthly", "0.9"),
    ("/services/", "monthly", "0.9"),
    ("/solutions/", "monthly", "0.85"),
    ("/technologies/", "monthly", "0.85"),
    ("/industries/", "monthly", "0.85"),
    ("/case-studies/", "monthly", "0.85"),
    ("/brochures/", "monthly", "0.85"),
    ("/engagement-models/", "monthly", "0.85"),
    ("/videos/", "monthly", "0.8"),
    ("/about/", "monthly", "0.8"),
    ("/trust/", "monthly", "0.8"),
    ("/partners/", "monthly", "0.8"),
    ("/support/", "monthly", "0.7"),
    ("/contact/", "monthly", "0.8"),
    ("/privacy/", "yearly", "0.5"),
    ("/search/", "monthly", "0.7"),
    ("/resources/tools/", "monthly", "0.75"),
    ("/resources/", "monthly", "0.85"),
    ("/references/", "monthly", "0.85"),
    ("/blog/categories/", "monthly", "0.65"),
    ("/blog/archive/", "monthly", "0.7"),
    ("/blog/page/", "monthly", "0.7"),
    ("/blog/", "monthly", "0.9"),
    ("/tags/", "monthly", "0.55"),
]

def defaults_for(url):
    path = url[len(SITE):]
    for prefix, freq, prio in DEFAULTS:
        if path.startswith(prefix):
            return freq, prio
    return "monthly", "0.7"

def walk_pages():
    urls = []
    for dirpath, dirs, files in os.walk(ROOT):
        # Prune excluded toplevel dirs.
        rel = os.path.relpath(dirpath, ROOT)
        parts = rel.split(os.sep) if rel != "." else []
        if parts and parts[0] in EXCLUDE_TOPLEVEL:
            dirs[:] = []
            continue
        for name in files:
            if name != "index.html":
                continue
            page_rel = os.path.relpath(os.path.join(dirpath, name), ROOT)
            if page_rel == "index.html":
                url = SITE + "/"
            else:
                url = SITE + "/" + os.path.dirname(page_rel) + "/"
            urls.append(url)
    # Also include the bare /index.html homepage if no recursion picked it up.
    home = SITE + "/"
    if home not in urls and os.path.exists(os.path.join(ROOT, "index.html")):
        urls.append(home)
    return sorted(set(urls))

def parse_existing(path):
    """Return {url: (changefreq, priority)} from the current sitemap."""
    cur = {}
    if not os.path.exists(path):
        return cur
    with open(path) as f:
        txt = f.read()
    for m in re.finditer(r"<url>(.*?)</url>", txt, re.DOTALL):
        block = m.group(1)
        loc = re.search(r"<loc>([^<]+)</loc>", block)
        if not loc:
            continue
        freq = re.search(r"<changefreq>([^<]+)</changefreq>", block)
        prio = re.search(r"<priority>([^<]+)</priority>", block)
        cur[loc.group(1)] = (
            freq.group(1) if freq else None,
            prio.group(1) if prio else None,
        )
    return cur

def render(urls, existing):
    out = ['<?xml version="1.0" encoding="UTF-8"?>',
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap-0.9">']
    for url in urls:
        cur_freq, cur_prio = existing.get(url, (None, None))
        d_freq, d_prio = defaults_for(url)
        freq = cur_freq or d_freq
        prio = cur_prio or d_prio
        out.append(f'  <url><loc>{escape(url)}</loc><changefreq>{freq}</changefreq><priority>{prio}</priority></url>')
    out.append('</urlset>')
    out.append('')
    return "\n".join(out)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true", help="Write sitemap.xml.")
    args = ap.parse_args()

    urls = walk_pages()
    existing = parse_existing(os.path.join(ROOT, "sitemap.xml"))
    existing_set = set(existing)
    new_set = set(urls)

    added = sorted(new_set - existing_set)
    removed = sorted(existing_set - new_set)

    print(f"regen-sitemap: {len(urls)} pages on disk, {len(existing)} URLs in current sitemap")
    if added:
        print(f"\nWould ADD {len(added)} URL(s):")
        for u in added[:30]:
            print(f"  + {u}")
        if len(added) > 30:
            print(f"  ... and {len(added)-30} more")
    if removed:
        print(f"\nWould REMOVE {len(removed)} URL(s) (page deleted on disk):")
        for u in removed[:30]:
            print(f"  - {u}")
        if len(removed) > 30:
            print(f"  ... and {len(removed)-30} more")
    if not added and not removed:
        print("\nNo drift. Sitemap is in sync with disk.")

    if args.apply:
        sitemap = render(urls, existing)
        with open(os.path.join(ROOT, "sitemap.xml"), "w") as f:
            f.write(sitemap)
        print(f"\nWrote sitemap.xml ({len(urls)} URLs)")
        return 0

    print("\nDry run. Use --apply to rewrite sitemap.xml.")
    return 0

if __name__ == "__main__":
    sys.exit(main())
