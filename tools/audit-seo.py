#!/usr/bin/env python3
"""SEO + structural audit for the AmbiSecure static site.

Checks across the whole tree:
  - sitemap.xml is valid XML.
  - Every sitemap <loc> resolves to an on-disk page (no 404s in the sitemap).
  - Every on-disk index.html under top-level content folders is in the
    sitemap (no orphans).
  - Every <link rel="canonical"> URL matches the page's actual path.
  - Every internal href on every page resolves (file exists OR is a
    redirect source).
  - .htaccess passes the lint (chains, loops, duplicates).
  - .htaccess redirect targets resolve.

Exit code 0 = clean, 1 = issues.

    python3 tools/audit-seo.py
    python3 tools/audit-seo.py --warn-only
"""
import argparse, os, re, subprocess, sys
from collections import defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SITE = "https://ambisecure.ambimat.com"

# Top-level content roots whose pages must appear in the sitemap.
INDEXABLE_TOPS = {
    "about", "blog", "brochures", "case-studies", "contact",
    "engagement-models", "industries", "partners", "privacy",
    "products", "references", "resources", "search", "services",
    "solutions", "support", "tags", "technologies", "trust", "videos",
}

# Pages excluded from the orphan check (have legitimate reasons not to
# be sitemap-listed).
ORPHAN_EXEMPT = {
    "404.html",
}

def iter_html():
    for dirpath, _, files in os.walk(ROOT):
        if any(skip in dirpath for skip in ("/legacysitedata/", "/.git/", "/node_modules/", "/.lighthouseci/", "/dist/")):
            continue
        if "/assets/" in dirpath or dirpath.endswith("assets"):
            continue
        for name in files:
            if name.endswith(".html"):
                yield os.path.join(dirpath, name)

def rel(p): return os.path.relpath(p, ROOT)

def url_path_of(rel_path):
    """Map an on-disk relpath to a canonical URL path."""
    if rel_path == "index.html":
        return "/"
    if rel_path.endswith("/index.html"):
        return "/" + rel_path[:-len("index.html")]
    return "/" + rel_path

def resolves_disk(href, redirect_sources):
    if href in redirect_sources:
        return True
    if href == "/":
        return os.path.exists(os.path.join(ROOT, "index.html"))
    p = href[1:]
    if href.endswith("/"):
        return os.path.exists(os.path.join(ROOT, p, "index.html"))
    full = os.path.join(ROOT, p)
    return os.path.exists(full) or os.path.exists(full + "/index.html")

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--warn-only", action="store_true")
    ap.add_argument("--quiet", action="store_true")
    args = ap.parse_args()

    issues = []

    # ---- 1. Sitemap XML valid ----
    sitemap = os.path.join(ROOT, "sitemap.xml")
    r = subprocess.run(["xmllint", "--noout", sitemap], capture_output=True, text=True)
    if r.returncode != 0:
        issues.append(("sitemap-invalid", r.stderr.strip()))

    with open(sitemap) as f:
        sitemap_xml = f.read()
    sitemap_locs = re.findall(r"<loc>([^<]+)</loc>", sitemap_xml)
    sitemap_urls = set(sitemap_locs)

    # ---- 2. Every sitemap URL resolves on disk ----
    sitemap_bad = []
    for url in sitemap_locs:
        if not url.startswith(SITE):
            continue
        path = url[len(SITE):]
        target = os.path.join(ROOT, "index.html") if path == "/" else \
                 (os.path.join(ROOT, path.lstrip("/"), "index.html") if path.endswith("/")
                  else os.path.join(ROOT, path.lstrip("/")))
        if not os.path.exists(target):
            sitemap_bad.append(url)
    for url in sitemap_bad:
        issues.append(("sitemap-404", url))

    # ---- 3. Orphan check ----
    # Every <top>/.../index.html under an INDEXABLE_TOPS root should be in the sitemap.
    on_disk_pages = []
    for path in iter_html():
        r = rel(path)
        if r in ORPHAN_EXEMPT:
            continue
        top = r.split("/", 1)[0] if "/" in r else r
        # Only check top-level content folders + the homepage.
        if r == "index.html" or top in INDEXABLE_TOPS:
            on_disk_pages.append(r)
    for r in on_disk_pages:
        url = SITE + url_path_of(r)
        if url not in sitemap_urls:
            issues.append(("orphan", r))

    # ---- 4. Canonical mismatch ----
    CANON_RE = re.compile(r'<link rel="canonical" href="([^"]+)"', re.IGNORECASE)
    canonical_mismatches = []
    for path in iter_html():
        relp = rel(path)
        if relp == "404.html":
            continue
        with open(path) as f:
            html = f.read()
        m = CANON_RE.search(html)
        if not m:
            continue
        canon = m.group(1)
        expected = SITE + url_path_of(relp)
        if canon != expected:
            canonical_mismatches.append((relp, canon, expected))
    for relp, canon, expected in canonical_mismatches:
        issues.append(("canonical-mismatch", f"{relp}: {canon} (expected {expected})"))

    # ---- 5. .htaccess lint ----
    r = subprocess.run(
        ["python3", os.path.join(HERE, "lint-htaccess.py")],
        capture_output=True, text=True
    )
    if r.returncode != 0:
        issues.append(("htaccess-lint", r.stdout + r.stderr))

    # ---- 6. .htaccess targets resolve (where they're on-site paths) ----
    redirect_sources = set()
    redirect_target_bad = []
    REDIR_RE = re.compile(r"^\s*Redirect\s+301\s+(\S+)\s+(\S+)", re.MULTILINE)
    with open(os.path.join(ROOT, ".htaccess")) as f:
        ht = f.read()
    for src, dst in REDIR_RE.findall(ht):
        redirect_sources.add(src)
        if dst.startswith("http"):
            continue  # external redirect
        if not resolves_disk(dst, set()):
            redirect_target_bad.append((src, dst))
    for src, dst in redirect_target_bad:
        issues.append(("htaccess-target-404", f"{src} -> {dst}"))

    # ---- 7. Internal-href resolution across all pages ----
    HREF_RE = re.compile(r'href="(/[^"#?]*)"')
    broken_hrefs = defaultdict(set)
    for path in iter_html():
        relp = rel(path)
        with open(path) as f:
            html = f.read()
        for href in HREF_RE.findall(html):
            if href in redirect_sources:
                continue
            if not resolves_disk(href, redirect_sources):
                broken_hrefs[relp].add(href)
    for relp, hrefs in broken_hrefs.items():
        for h in sorted(hrefs):
            issues.append(("broken-href", f"{relp}: {h}"))

    # ---- Report ----
    by_kind = defaultdict(list)
    for k, v in issues:
        by_kind[k].append(v)

    print(f"audit-seo: {len(sitemap_locs)} sitemap URLs, {len(on_disk_pages)} indexable pages")
    print(f"  sitemap valid XML:      {'yes' if not by_kind['sitemap-invalid'] else 'NO'}")
    print(f"  sitemap entries 404:    {len(by_kind['sitemap-404'])}")
    print(f"  orphan pages (not in sitemap): {len(by_kind['orphan'])}")
    print(f"  canonical mismatches:   {len(by_kind['canonical-mismatch'])}")
    print(f"  .htaccess lint:         {'clean' if not by_kind['htaccess-lint'] else 'FAIL'}")
    print(f"  .htaccess 404 targets:  {len(by_kind['htaccess-target-404'])}")
    print(f"  pages with broken hrefs:{len({i.split(':')[0] for i in by_kind['broken-href']})}")
    print(f"  total broken hrefs:     {len(by_kind['broken-href'])}")

    if not args.quiet:
        def show(kind, label, limit=10):
            items = by_kind.get(kind, [])
            if not items:
                return
            print(f"\n{label}:")
            for x in items[:limit]:
                print(f"  - {x}")
            if len(items) > limit:
                print(f"  ... and {len(items) - limit} more")

        show("sitemap-invalid", "Sitemap invalid XML", 5)
        show("sitemap-404", "Sitemap entries that don't resolve")
        show("orphan", "Orphan pages (on disk, not in sitemap)")
        show("canonical-mismatch", "Canonical URL mismatches")
        show("htaccess-lint", "Htaccess lint failures", 5)
        show("htaccess-target-404", "Redirect targets that don't resolve")
        show("broken-href", "Broken internal hrefs", 15)

    if not issues:
        print("\nOK")
        sys.exit(0)
    print(f"\n{len(issues)} SEO/structural issues")
    sys.exit(0 if args.warn_only else 1)

if __name__ == "__main__":
    main()
