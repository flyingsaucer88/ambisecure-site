#!/usr/bin/env python3
"""Sitewide contact-path tracking + callable phone numbers.

Batch 1 of the SEO plan. Three deterministic, idempotent transforms across
every shipped HTML file:

  1. `contact_engineering` -> `contact_cta_click`
     The old name sat on 82 ordinary "/contact/" navigation links and one submit
     button, so it was being read as an enquiry signal when it only ever meant
     "someone clicked a link". `generate_lead` (fired by the thank-you page)
     is now the only conversion. The old name is retired rather than reused so
     historical data keeps a single stable meaning.

  2. Footer telephone numbers become real `tel:` links.
     They were plain text on 314 pages, so nobody could tap to call and no
     interaction could be measured.

  3. `mailto:` links get `data-analytics-event="email_click"`.
     323 of them carried no tracking at all.

  4. The footer contact column gains the authorised WhatsApp number.
     India already produces measured impressions and WhatsApp is a primary B2B
     channel there. It is a secondary contact interaction, never a lead.

All three are secondary interaction signals. None of them is a conversion.

    python3 tools/apply-contact-tracking.py           # apply
    python3 tools/apply-contact-tracking.py --check   # fail if work remains
"""
import argparse
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent

SKIP_DIRS = {
    ".git", ".github", ".githooks", ".claude", ".lighthouseci", ".leads",
    "dist", "legacysitedata", "_internal", "tools", "docs", "scripts",
    "node_modules", "Logos", "reports",
}

PHONES = [
    # (visible text, E.164 href)
    ("+91 79255 01989", "+917925501989"),
    ("+1 215 397 3819", "+12153973819"),
]

# Authorised AmbiSecure WhatsApp Business number (+91 97279 33488), supplied by
# the operator. Kept as a single constant so it is never re-typed by hand.
WHATSAPP_URL = "https://wa.me/919727933488"
WHATSAPP_TEXT = "Hello%20AmbiSecure%2C%20I%20would%20like%20to%20discuss%20a%20security%20project."
WHATSAPP_LI = (
    '<li><a href="' + WHATSAPP_URL + '?text=' + WHATSAPP_TEXT + '"'
    ' data-analytics-event="whatsapp_click" rel="noopener"'
    ' target="_blank">WhatsApp: +91 97279 33488</a></li>'
)


def transform(text: str) -> tuple[str, dict]:
    counts = {"event_rename": 0, "tel": 0, "mailto": 0, "whatsapp": 0}

    # 1. Retire the misleading event name.
    text, n = re.subn(
        r'data-analytics-event="contact_engineering"',
        'data-analytics-event="contact_cta_click"',
        text,
    )
    counts["event_rename"] = n

    # 2. Footer phone numbers -> tel: links. Anchored to the <li> so we only
    #    touch the contact block and never a number appearing in prose.
    for visible, e164 in PHONES:
        pattern = re.compile(
            r"<li>(India|US): " + re.escape(visible) + r"</li>"
        )

        def repl(m: re.Match) -> str:
            return (
                f"<li>{m.group(1)}: "
                f'<a href="tel:{e164}" data-analytics-event="phone_click">'
                f"{visible}</a></li>"
            )

        text, n = pattern.subn(repl, text)
        counts["tel"] += n

    # 3. mailto links without tracking. Only adds the attribute; never
    #    rewrites an anchor that already carries one.
    def add_mailto(m: re.Match) -> str:
        tag = m.group(0)
        if "data-analytics-event" in tag:
            return tag
        counts["mailto"] += 1
        return tag[:-1] + ' data-analytics-event="email_click">'

    text = re.sub(r'<a\s+href="mailto:[^"]*"[^>]*>', add_mailto, text)

    # 4. WhatsApp in the footer contact column, immediately after the India
    #    number. Anchored to that <li> so it only lands in the contact block,
    #    and skipped when already present so the pass stays idempotent.
    if "wa.me/919727933488" not in text:
        india_li = (
            '<li>India: <a href="tel:+917925501989" '
            'data-analytics-event="phone_click">+91 79255 01989</a></li>'
        )
        if india_li in text:
            text = text.replace(india_li, india_li + WHATSAPP_LI)
            counts["whatsapp"] = text.count("wa.me/919727933488")

    return text, counts


def iter_html():
    for p in ROOT.rglob("*.html"):
        # Match only the TOP-LEVEL directory. Matching any path component would
        # also skip resources/tools/ (76 real pages) because its second segment
        # is literally "tools".
        rel = p.relative_to(ROOT)
        if rel.parts and rel.parts[0] in SKIP_DIRS:
            continue
        yield p


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true",
                    help="exit 1 if any file would change (drift guard)")
    args = ap.parse_args()

    changed, totals = [], {"event_rename": 0, "tel": 0, "mailto": 0, "whatsapp": 0}

    for path in iter_html():
        original = path.read_text(encoding="utf-8")
        updated, counts = transform(original)
        if updated != original:
            changed.append(path.relative_to(ROOT))
            for k, v in counts.items():
                totals[k] += v
            if not args.check:
                path.write_text(updated, encoding="utf-8")

    label = "would change" if args.check else "changed"
    print(f"=== contact tracking === {len(changed)} file(s) {label}")
    print(f"  contact_engineering -> contact_cta_click : {totals['event_rename']}")
    print(f"  phone numbers linked as tel:             : {totals['tel']}")
    print(f"  mailto links tagged email_click          : {totals['mailto']}")
    print(f"  WhatsApp added to footer contact column  : {totals['whatsapp']}")

    if args.check and changed:
        for c in changed[:20]:
            print(f"    {c}")
        if len(changed) > 20:
            print(f"    ... and {len(changed) - 20} more")
        print("  FAIL: run tools/apply-contact-tracking.py")
        return 1

    print("  ok")
    return 0


if __name__ == "__main__":
    sys.exit(main())
