#!/usr/bin/env python3
"""Blog content-freshness audit.

Reads assets/data/blogs.json and flags:
  - Entries missing `last_reviewed` or `freshness`.
  - "current" entries older than 18 months by last_reviewed date.
  - "stale-review" entries that have NOT been confirmed by an operator
    refresh of last_reviewed within the last 24 months — but only as
    informational output, not a CI failure.

This audit is informational by default (exit 0 with a report). Use
--strict to make missing fields a hard failure.

    python3 tools/audit-freshness.py
    python3 tools/audit-freshness.py --strict
"""
import argparse, datetime, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SRC = os.path.join(ROOT, "assets/data/blogs.json")

CURRENT_REVIEW_WINDOW = 18 * 30   # 18 months in days
STALE_REVIEW_WINDOW = 24 * 30     # 24 months

def parse_date(s):
    try:
        return datetime.date.fromisoformat(s)
    except Exception:
        return None

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--strict", action="store_true",
                    help="Exit non-zero on missing metadata (not just stale).")
    args = ap.parse_args()

    with open(SRC) as f:
        data = json.load(f)
    entries = data["entries"]
    today = datetime.date.today()

    missing_meta = []
    overdue_current = []
    overdue_stale = []
    for e in entries:
        if "last_reviewed" not in e or "freshness" not in e:
            missing_meta.append(e["url"])
            continue
        lr = parse_date(e["last_reviewed"])
        if not lr:
            missing_meta.append(e["url"])
            continue
        age_days = (today - lr).days
        if e["freshness"] == "current" and age_days > CURRENT_REVIEW_WINDOW:
            overdue_current.append((e["url"], age_days))
        if e["freshness"] == "stale-review" and age_days > STALE_REVIEW_WINDOW:
            overdue_stale.append((e["url"], age_days))

    print(f"audit-freshness: {len(entries)} blog entries")
    print(f"  missing lifecycle metadata: {len(missing_meta)}")
    print(f"  current  & overdue review (>18 mo): {len(overdue_current)}")
    print(f"  archive & overdue review  (>24 mo): {len(overdue_stale)}")

    def show(label, items, fmt):
        if not items:
            return
        print(f"\n{label} (first 10):")
        for x in items[:10]:
            print("  - " + fmt(x))
        if len(items) > 10:
            print(f"  ... and {len(items) - 10} more")

    show("Missing lifecycle metadata", missing_meta, fmt=lambda x: x)
    show("Current posts overdue for review", overdue_current,
         fmt=lambda x: f"{x[0]} ({x[1]} days)")
    show("Archive posts overdue for review (informational only)", overdue_stale,
         fmt=lambda x: f"{x[0]} ({x[1]} days)")

    if missing_meta and args.strict:
        sys.exit(1)
    sys.exit(0)

if __name__ == "__main__":
    main()
