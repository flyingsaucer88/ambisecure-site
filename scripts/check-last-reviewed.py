#!/usr/bin/env python3
"""Pre-commit guard: when a blog HTML file is modified, ensure the matching
`last_reviewed` date in `assets/data/blogs.json` was bumped in the same commit.

Modes:
  --check    Operate on the staged index (default in pre-commit).
  --all      Audit every blog entry against its on-disk HTML mtime (advisory).

Behaviour:
  Modern blog entries  → FAIL if HTML staged but last_reviewed not updated.
  Archive blog entries → WARN only (historical posts are allowed to drift).

Exit:
  0 — clean (or only warnings)
  1 — at least one modern blog needs its last_reviewed bumped
"""
import argparse, json, os, subprocess, sys
from datetime import date

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
BLOGS_JSON = os.path.join(ROOT, "assets/data/blogs.json")

def staged_files():
    out = subprocess.run(["git", "diff", "--cached", "--name-only"],
                         cwd=ROOT, capture_output=True, text=True, check=True)
    return [l.strip() for l in out.stdout.splitlines() if l.strip()]

def blog_url_for(path):
    """Convert a path like 'blog/foo/index.html' to '/blog/foo/'."""
    if not path.endswith("index.html"):
        return None
    if not (path.startswith("blog/") or path.startswith("blog/archive/")):
        return None
    return "/" + path[: -len("index.html")]

def load_blogs():
    with open(BLOGS_JSON) as f:
        return json.load(f)["entries"]

def staged_blogs_json_contents():
    """Return the staged blogs.json contents (so we know what last_reviewed
    would be after this commit), or fall back to the working tree copy."""
    out = subprocess.run(["git", "show", ":assets/data/blogs.json"],
                         cwd=ROOT, capture_output=True, text=True)
    if out.returncode == 0 and out.stdout.strip():
        return json.loads(out.stdout)["entries"]
    return load_blogs()

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true",
                    help="Pre-commit mode: inspect staged changes.")
    ap.add_argument("--all", action="store_true",
                    help="Advisory mode: report stale entries across the repo.")
    args = ap.parse_args()
    if not (args.check or args.all):
        args.check = True

    today = date.today().isoformat()
    entries = staged_blogs_json_contents() if args.check else load_blogs()
    by_url = {e["url"]: e for e in entries}

    if args.check:
        staged = staged_files()
        modified_blogs = [p for p in staged if blog_url_for(p)]
        if not modified_blogs:
            print("check-last-reviewed: no blog HTML staged — nothing to verify.")
            return 0

        fails = []
        warns = []
        for path in modified_blogs:
            url = blog_url_for(path)
            entry = by_url.get(url)
            if not entry:
                warns.append(f"{path}: no matching blogs.json entry (orphan HTML?)")
                continue
            last_rev = entry.get("last_reviewed")
            is_modern = entry.get("type", "modern") == "modern"
            # Acceptable: last_reviewed == today's date OR the staged
            # blogs.json itself was updated.
            blogs_json_staged = "assets/data/blogs.json" in staged
            if last_rev == today:
                continue
            if blogs_json_staged and last_rev:
                # Bumped to a date >= today is fine; bumped to a non-today
                # date is suspicious but allowed (operator may have set it
                # forward intentionally).
                continue
            msg = (f"{path}: last_reviewed={last_rev!r} for {url} "
                   f"(today={today}). Bump it in assets/data/blogs.json.")
            (fails if is_modern else warns).append(msg)

        for w in warns:
            print(f"WARN: {w}")
        for f in fails:
            print(f"FAIL: {f}")

        if fails:
            print()
            print("Hint: edit assets/data/blogs.json and set last_reviewed "
                  f"to {today} for each modern blog you've modified,")
            print("then re-stage. Run `python3 tools/regen-blog-pool.py` after.")
            return 1
        return 0

    # --all mode: list every modern blog whose last_reviewed is older than
    # the HTML's git-tracked mtime. Advisory only.
    for entry in entries:
        if entry.get("type", "modern") != "modern":
            continue
        url = entry["url"]
        path = os.path.join(ROOT, url.strip("/"), "index.html")
        if not os.path.exists(path):
            continue
        # Use git log for the HTML's most recent commit date.
        out = subprocess.run(
            ["git", "log", "-1", "--format=%cs", "--", os.path.relpath(path, ROOT)],
            cwd=ROOT, capture_output=True, text=True)
        last_commit = out.stdout.strip()
        last_rev = entry.get("last_reviewed", "")
        if last_commit and last_rev and last_commit > last_rev:
            print(f"STALE: {url}  last_reviewed={last_rev}  html last commit={last_commit}")
    return 0

if __name__ == "__main__":
    sys.exit(main())
