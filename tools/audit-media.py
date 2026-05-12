#!/usr/bin/env python3
"""Media governance audit for the AmbiSecure static site.

Walks /assets/img/ and /assets/video/ and reports:
  - PNG > 200 KB that does not have a sibling .webp (size-trim candidates).
  - Referenced media files that don't exist on disk.
  - Unreferenced media files larger than 50 KB (potential dead weight).
  - Images larger than 1.5 MB (oversize anywhere).
  - Video files larger than 5 MB (oversize anywhere).

Exit code 0 = clean, 1 = issues. CI-friendly.

    python3 tools/audit-media.py
    python3 tools/audit-media.py --warn-only
"""
import argparse, os, re, sys
from collections import defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
IMG_ROOT = os.path.join(ROOT, "assets/img")
VID_ROOT = os.path.join(ROOT, "assets/video")
FONT_ROOT = os.path.join(ROOT, "assets/fonts")

LIMIT_PNG_WEBP_HINT = 200 * 1024
LIMIT_IMAGE_OVERSIZE = 1500 * 1024
LIMIT_VIDEO_OVERSIZE = 5 * 1024 * 1024
LIMIT_UNREFERENCED_NOISE = 50 * 1024

def iter_assets():
    for root in (IMG_ROOT, VID_ROOT):
        if not os.path.exists(root):
            continue
        for dirpath, _, files in os.walk(root):
            for name in files:
                yield os.path.join(dirpath, name)

def rel(p): return os.path.relpath(p, ROOT)

def iter_html():
    for dirpath, _, files in os.walk(ROOT):
        if any(s in dirpath for s in ("/legacysitedata/", "/.git/", "/node_modules/", "/.lighthouseci/", "/dist/", "/_internal/", "/.claude/", "/Logos/")):
            continue
        if dirpath.endswith(("/_internal", os.sep + "_internal", "/.claude", os.sep + ".claude")):
            continue
        for name in files:
            if name.endswith((".html", ".css", ".js", ".json")):
                yield os.path.join(dirpath, name)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--warn-only", action="store_true")
    args = ap.parse_args()

    # Index assets.
    assets = {}
    for path in iter_assets():
        try:
            assets[path] = os.path.getsize(path)
        except OSError:
            pass

    # Build the asset reference set from every HTML/CSS/JS/JSON file.
    REF_RE = re.compile(r"/assets/(?:img|video|fonts)/[^\"')\s]+")
    referenced = set()
    for path in iter_html():
        with open(path, errors="ignore") as f:
            for m in REF_RE.finditer(f.read()):
                referenced.add(m.group(0))

    # Resolve referenced paths to on-disk.
    def to_disk(ref):
        return os.path.join(ROOT, ref.lstrip("/"))

    # ---- Reports ----
    missing_refs = sorted(r for r in referenced if not os.path.exists(to_disk(r)))
    pngs = [p for p in assets if p.endswith(".png")]
    webps = set(p[:-len(".png")] + ".webp" for p in pngs if os.path.exists(p[:-len(".png")] + ".webp"))
    png_no_webp = [p for p in pngs
                   if assets[p] > LIMIT_PNG_WEBP_HINT
                   and (p[:-len(".png")] + ".webp") not in webps]

    image_oversize = [p for p in assets
                      if any(p.endswith(ext) for ext in (".png", ".jpg", ".jpeg", ".gif", ".webp"))
                      and assets[p] > LIMIT_IMAGE_OVERSIZE]
    video_oversize = [p for p in assets if p.endswith((".mp4", ".webm", ".mov")) and assets[p] > LIMIT_VIDEO_OVERSIZE]

    unreferenced = []
    for p in assets:
        size = assets[p]
        # Compute the URL path for this asset.
        ref = "/" + os.path.relpath(p, ROOT)
        # Asset is referenced if its full ref appears anywhere we scanned.
        if ref in referenced:
            continue
        # PNG with a WebP sibling that's referenced is fine — the PNG is the fallback.
        if p.endswith(".png"):
            sibling_webp = "/" + os.path.relpath(p[:-len(".png")] + ".webp", ROOT)
            if sibling_webp in referenced:
                continue
        # Fonts: the @font-face URL is relative; allow if filename appears anywhere.
        if "/assets/fonts/" in p:
            filename = os.path.basename(p)
            found = False
            for r in referenced:
                if r.endswith(filename):
                    found = True
                    break
            if found:
                continue
        if size > LIMIT_UNREFERENCED_NOISE:
            unreferenced.append((p, size))

    # ---- Print ----
    total_issues = (
        len(missing_refs) + len(png_no_webp) + len(image_oversize) +
        len(video_oversize) + len(unreferenced)
    )
    print(f"audit-media: {len(assets)} media assets, {len(referenced)} references")
    print(f"  referenced but missing on disk:    {len(missing_refs)}")
    print(f"  PNG > 200 KB without .webp sibling:{len(png_no_webp)}")
    print(f"  images > 1.5 MB:                   {len(image_oversize)}")
    print(f"  videos > 5 MB:                     {len(video_oversize)}")
    print(f"  unreferenced assets > 50 KB:       {len(unreferenced)}")

    def show(label, items, fmt=lambda x: rel(x)):
        if not items:
            return
        print(f"\n{label} (first 10):")
        for x in items[:10]:
            print(f"  - {fmt(x)}")
        if len(items) > 10:
            print(f"  ... and {len(items) - 10} more")

    show("Referenced media missing on disk", missing_refs, fmt=lambda x: x)
    show("PNG > 200 KB without .webp", png_no_webp)
    show("Images > 1.5 MB", image_oversize)
    show("Videos > 5 MB", video_oversize)
    if unreferenced:
        print("\nUnreferenced assets > 50 KB (first 10):")
        for p, s in sorted(unreferenced, key=lambda x: -x[1])[:10]:
            print(f"  - {rel(p)}  ({s // 1024} KB)")
        if len(unreferenced) > 10:
            print(f"  ... and {len(unreferenced) - 10} more")

    if total_issues == 0:
        print("\nOK")
        sys.exit(0)
    print(f"\n{total_issues} media issues")
    sys.exit(0 if args.warn_only else 1)

if __name__ == "__main__":
    main()
