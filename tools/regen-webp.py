#!/usr/bin/env python3
"""Auto-generate WebP siblings for PNGs > 200 KB.

Pairs with audit-media: every PNG over 200 KB needs a .webp sibling so
LiteSpeed/browsers can serve the smaller asset when supported.

  python3 tools/regen-webp.py                # dry-run report
  python3 tools/regen-webp.py --apply        # generate missing WebPs
  python3 tools/regen-webp.py --apply --force # regenerate every WebP

Deterministic. Requires `cwebp` on PATH (Hostinger does not need it; this
runs locally / in CI only).
"""
import argparse, os, shutil, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
THRESHOLD = 200 * 1024  # 200 KB
QUALITY = 85

def list_targets(force):
    targets = []
    for dirpath, _, files in os.walk(os.path.join(ROOT, "assets/img")):
        for name in files:
            if not name.endswith(".png"):
                continue
            p = os.path.join(dirpath, name)
            size = os.path.getsize(p)
            if size <= THRESHOLD:
                continue
            webp = p[:-4] + ".webp"
            if force or not os.path.exists(webp):
                targets.append((p, webp, size))
    return targets

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true", help="Generate missing WebPs.")
    ap.add_argument("--force", action="store_true", help="Regenerate every WebP.")
    args = ap.parse_args()

    if not shutil.which("cwebp"):
        print("ERROR: `cwebp` not on PATH. Install libwebp (macOS: brew install webp).")
        return 1

    targets = list_targets(args.force)
    if not targets:
        print("regen-webp: nothing to do — all PNGs > 200 KB already have WebP siblings.")
        return 0

    print(f"regen-webp: {len(targets)} PNG(s) {'to regenerate' if args.force else 'missing WebP'}")
    for p, webp, size in targets:
        rel = os.path.relpath(p, ROOT)
        print(f"  {size//1024:>5} KB  {rel}")

    if not args.apply:
        print("\nDry run. Use --apply to generate.")
        return 0

    failed = 0
    for p, webp, _ in targets:
        r = subprocess.run(["cwebp", "-quiet", "-q", str(QUALITY), p, "-o", webp],
                           capture_output=True, text=True)
        if r.returncode != 0:
            print(f"FAIL: {p} → {r.stderr.strip()}")
            failed += 1
        else:
            print(f"  -> {os.path.relpath(webp, ROOT)} ({os.path.getsize(webp)//1024} KB)")
    return 1 if failed else 0

if __name__ == "__main__":
    sys.exit(main())
