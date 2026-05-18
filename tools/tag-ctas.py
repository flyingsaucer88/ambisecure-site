#!/usr/bin/env python3
"""Apply `data-analytics-event="<verb>"` to meaningful CTAs across the site.

Phase 38 — analytics-signal layer expansion. The site already had a curated
CTA vocabulary (Talk to engineering, Request a pilot, etc.) but only 7 pages
carried the analytics attribute. This script walks every HTML file and adds
the attribute to anchors whose inner text matches a known CTA verb.

Idempotent: if the anchor already has `data-analytics-event=...`, it is
left alone. Safe to re-run after editorial changes.

Usage:
    python3 tools/tag-ctas.py                # apply, print summary
    python3 tools/tag-ctas.py --dry-run      # report what would change
"""

from __future__ import annotations

import argparse
import re
import sys
from collections import Counter
from pathlib import Path


# Map (lowercased exact inner-text) → analytics event name.
# Aligned with the event vocabulary in docs/MASTER_OPS §50.4.
VERB_TO_EVENT: dict[str, str] = {
    # contact_engineering — direct contact intent
    "talk to engineering": "contact_engineering",
    "talk to engineers": "contact_engineering",
    "talk to our security team": "contact_engineering",
    "talk to us": "contact_engineering",
    "start a conversation": "contact_engineering",
    "start the conversation": "contact_engineering",
    "start a partner conversation": "contact_engineering",
    "ask engineering": "contact_engineering",
    # request_demo — pilot / evaluation / artefact-request intent
    "request a pilot": "request_demo",
    "start a pilot": "request_demo",
    "request datasheet": "request_demo",
    "request a quote": "request_demo",
    "request engagement": "request_demo",
    "request integration brief": "request_demo",
    "request architecture brief": "request_demo",
    "request applet matrix": "request_demo",
    "request rsp brief": "request_demo",
    "request build": "request_demo",
    "request demo access": "request_demo",
    # service_interest — service-page / deployment-discussion intent
    "discuss your deployment": "service_interest",
    # download_brochure — brochure-pull intent (sets up Phase 39 form routing)
    "download brochure": "download_brochure",
}


# Match `<a ... >INNER</a>`. Inner can contain any non-< chars (HTML entities
# OK). We capture the attributes block + inner text so we can rebuild with the
# new attribute appended.
_ANCHOR_RE = re.compile(
    r'(<a\b)([^>]*?)(>)([^<]+)(</a>)',
    re.IGNORECASE | re.DOTALL,
)


REPO_ROOT = Path(__file__).resolve().parent.parent

# Trees that are not part of the deployed site or are vendored.
EXCLUDE_PREFIXES = (
    "dist/",
    "_internal/",
    "legacysitedata/",
    "node_modules/",
    "Logos/",
    ".git/",
    ".github/",
    ".claude/",
    ".lighthouseci/",
    "tools/",
    "scripts/",
)


def _excluded(rel: str) -> bool:
    return any(rel.startswith(p) for p in EXCLUDE_PREFIXES)


def _tag_html(html: str) -> tuple[str, Counter]:
    """Return (rewritten_html, counter_of_events_added)."""
    counter: Counter = Counter()

    def _sub(match: re.Match[str]) -> str:
        open_tag, attrs, gt, inner, close_tag = match.groups()
        # Already tagged → leave alone.
        if "data-analytics-event" in attrs:
            return match.group(0)
        key = inner.strip().lower()
        event = VERB_TO_EVENT.get(key)
        if event is None:
            return match.group(0)
        # Inject the attribute. Preserve existing whitespace.
        sep = "" if attrs.endswith(" ") or attrs == "" else " "
        new_attrs = f'{attrs}{sep}data-analytics-event="{event}"'
        counter[event] += 1
        return f"{open_tag}{new_attrs}{gt}{inner}{close_tag}"

    new_html = _ANCHOR_RE.sub(_sub, html)
    return new_html, counter


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--dry-run", action="store_true", help="Report changes without writing")
    args = ap.parse_args()

    total = Counter()
    files_changed = 0

    for path in sorted(REPO_ROOT.rglob("*.html")):
        rel = path.relative_to(REPO_ROOT).as_posix()
        if _excluded(rel):
            continue
        original = path.read_text(encoding="utf-8")
        rewritten, added = _tag_html(original)
        if not added:
            continue
        total.update(added)
        files_changed += 1
        if args.dry_run:
            print(f"  WOULD TAG  {rel}  +{sum(added.values())} events  ({dict(added)})")
        else:
            path.write_text(rewritten, encoding="utf-8")
            print(f"  tagged     {rel}  +{sum(added.values())} events  ({dict(added)})")

    print()
    print(f"Files {'that would be changed' if args.dry_run else 'changed'}: {files_changed}")
    print(f"Events {'that would be added' if args.dry_run else 'added'}: {sum(total.values())}")
    for event, count in sorted(total.items(), key=lambda x: -x[1]):
        print(f"  {event:<24}  {count}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
