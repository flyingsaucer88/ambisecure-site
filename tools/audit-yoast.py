#!/usr/bin/env python3
"""Yoast-style SEO / readability audit for the AmbiSecure site.

Per-page signals:
  - word_count     : text words inside <main> (strips head/nav/header/footer/script/style).
  - title_len      : characters in <title>.
  - desc_len       : characters in <meta name="description">.
  - h1_count       : number of <h1>s in body.
  - h2_count       : number of <h2>s.
  - heading_skips  : H1->H3 / H2->H4 / H1 missing.
  - long_paras     : count of paragraphs > 80 words.
  - max_para       : longest paragraph word count.
  - internal_links : <a href="/..."> count.
  - external_links : <a href="http..."> count (informational only).
  - passive_hits   : rough passive-voice heuristic (warnings only).
  - reading_min    : word_count / 220 minutes.

Phase 14 readability signals (warnings only — never hard failures):
  - avg_sent_len   : average words per sentence.
  - long_sents    : sentences > 28 words.
  - max_sent      : longest sentence (words).
  - heading_density: words per heading (lower = more scannable).
  - top_repeats   : top-3 most-frequent 3-grams in body (for diction repetition).

Phase 14 FAQ schema validation:
  - FAQPage entries must have non-empty Question.name and Answer.text.
  - No duplicate questions per page.

Per-page-type bands ("blog" includes /blog/<slug>/ posts, NOT the archive):

  Type            word_min  word_max  desc_min  desc_max  title_min  title_max
  blog            1200      2200      110       170       30         70
  blog-archive    300       2500      100       170       25         80   (lighter — archive)
  case-study      900       2000      110       170       30         70
  brochure        300       800       110       170       30         70
  product         200       900       100       170       25         70
  service         200       900       100       170       25         70
  solution        200       900       100       170       25         70
  technology      200       1300      100       170       25         70
  reference       100       2000      100       170       25         80
  tool            100       2000      90        170       25         80
  industry        120       800       100       170       25         70
  hub             100       2000      80        170       20         80

Hub = /xxx/ landings (sections), case-studies index, brochures index, etc.

Exit code:
  0 — clean (no per-page hard failures)
  1 — at least one hard failure (with --strict)

Default: report-only (exit 0). Use --strict to gate CI.

    python3 tools/audit-yoast.py
    python3 tools/audit-yoast.py --strict
    python3 tools/audit-yoast.py --only blog
"""
import argparse, json, os, re, sys
from collections import Counter, defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

# ---- Per-type bands ------------------------------------------------------
BANDS = {
    # Long-form posts target 1400-1900 words (Phase 13). Some short posts
    # (FAQ-style, "Why use MFA") are deliberately tight; floor at 300.
    "blog":         dict(word=(300, 2200),  desc=(110, 170), title=(30, 70)),
    "blog-archive": dict(word=(300, 2500),  desc=(100, 170), title=(25, 80)),
    "case-study":   dict(word=(900, 2000),  desc=(110, 170), title=(30, 70)),
    "brochure":     dict(word=(300, 800),   desc=(110, 170), title=(30, 70)),
    "product":      dict(word=(200, 900),   desc=(100, 170), title=(25, 70)),
    "service":      dict(word=(200, 900),   desc=(100, 170), title=(25, 70)),
    "solution":     dict(word=(200, 1100),  desc=(100, 170), title=(25, 70)),
    "technology":   dict(word=(200, 1300),  desc=(100, 170), title=(25, 70)),
    # Reference + tool pages are JS-driven UI shells; static body is intentionally small.
    "reference":    dict(word=(20, 2000),   desc=(100, 170), title=(25, 80)),
    "tool":         dict(word=(20, 2000),   desc=(80, 170),  title=(25, 80)),
    "industry":     dict(word=(120, 800),   desc=(100, 170), title=(25, 70)),
    # Tag + category landings are auto-generated card grids; floor reflects
    # the description + headline + a handful of cards.
    "tag":          dict(word=(30, 600),    desc=(80, 170),  title=(20, 80)),
    "category":     dict(word=(30, 600),    desc=(80, 170),  title=(20, 80)),
    "hub":          dict(word=(100, 2000),  desc=(80, 170),  title=(20, 80)),
    "other":        dict(word=(50, 3000),   desc=(80, 170),  title=(20, 80)),
}

# ---- Page-type classifier ------------------------------------------------
def classify(rel_path):
    if rel_path == "index.html":
        return "hub"
    parts = rel_path.split("/")
    top = parts[0]
    if top == "blog":
        if len(parts) >= 3 and parts[1] == "archive":
            return "blog-archive"
        if len(parts) >= 3 and parts[1] == "categories":
            return "category"
        if len(parts) >= 3 and parts[1] == "page":
            return "hub"
        if len(parts) >= 3:
            return "blog"
        return "hub"
    if top == "tags":
        return "tag" if len(parts) >= 3 else "hub"
    if top == "case-studies":
        return "case-study" if len(parts) >= 3 else "hub"
    if top == "brochures":
        return "brochure" if len(parts) >= 3 else "hub"
    if top == "products":
        return "product" if len(parts) >= 3 else "hub"
    if top == "services":
        return "service" if len(parts) >= 3 else "hub"
    if top == "solutions":
        return "solution" if len(parts) >= 3 else "hub"
    if top == "technologies":
        return "technology" if len(parts) >= 3 else "hub"
    if top == "industries":
        return "industry" if len(parts) >= 3 else "hub"
    if top == "references":
        return "reference" if len(parts) >= 3 else "hub"
    if top == "resources":
        return "tool" if len(parts) >= 3 else "hub"
    if top in ("videos", "engagement-models", "search", "privacy",
               "trust", "partners", "support", "contact", "about"):
        return "hub"
    return "other"

# ---- Strippers -----------------------------------------------------------
HEAD_RE = re.compile(r"<head[^>]*>.*?</head>", re.DOTALL | re.IGNORECASE)
# Strip only the top-of-page navbar header. Page-internal `<header class="tool-header">`
# blocks are kept because they carry the page's H1.
HEADER_NAVBAR_RE = re.compile(
    r'<header class="navbar"[^>]*>.*?</header>', re.DOTALL | re.IGNORECASE
)
NAV_RE = re.compile(r"<nav[^>]*>.*?</nav>", re.DOTALL | re.IGNORECASE)
FOOTER_RE = re.compile(r"<footer[^>]*>.*?</footer>", re.DOTALL | re.IGNORECASE)
SCRIPT_RE = re.compile(r"<script[^>]*>.*?</script>", re.DOTALL | re.IGNORECASE)
STYLE_RE = re.compile(r"<style[^>]*>.*?</style>", re.DOTALL | re.IGNORECASE)
ECOSYS_RE = re.compile(r'<div class="ecosystem-bar"[^>]*>.*?</div>\s*</div>', re.DOTALL | re.IGNORECASE)
TAG_RE = re.compile(r"<[^>]+>", re.DOTALL)
ATTR_PASSIVE_RE = re.compile(r"\b(is|are|was|were|been|being|be|am)\s+\w+(ed|en)\b", re.IGNORECASE)

H_RE = re.compile(r"<h([1-6])[^>]*>(.*?)</h\1>", re.DOTALL | re.IGNORECASE)
P_RE = re.compile(r"<p[^>]*>(.*?)</p>", re.DOTALL | re.IGNORECASE)
LI_RE = re.compile(r"<li[^>]*>(.*?)</li>", re.DOTALL | re.IGNORECASE)
A_RE = re.compile(r'<a\s+[^>]*href="([^"]+)"[^>]*>(.*?)</a>', re.DOTALL | re.IGNORECASE)
TITLE_RE = re.compile(r"<title>([^<]+)</title>", re.IGNORECASE)
DESC_RE = re.compile(r'<meta name="description" content="([^"]+)"', re.IGNORECASE)

def main_text(html):
    h = HEAD_RE.sub("", html)
    h = HEADER_NAVBAR_RE.sub("", h)
    h = NAV_RE.sub("", h)
    h = FOOTER_RE.sub("", h)
    h = SCRIPT_RE.sub("", h)
    h = STYLE_RE.sub("", h)
    h = ECOSYS_RE.sub("", h)
    return h

def text_words(html_fragment):
    text = TAG_RE.sub(" ", html_fragment)
    text = re.sub(r"\s+", " ", text).strip()
    return text.split() if text else []

def sentences(words):
    """Split a flat word stream into sentences by terminal punctuation.
    Rough but deterministic. Treats . ! ? as terminators."""
    out = []
    current = []
    for w in words:
        current.append(w)
        if w.endswith((".", "!", "?")) and len(w) > 1:
            out.append(current)
            current = []
    if current:
        out.append(current)
    return out

STOP_3GRAM_WORDS = set("the a an and or but of to in for on with at by is are was were be been being it its this that these those as if then so not no".split())

def top_repeats(words, n=3, top=3):
    """Return top-N most-frequent n-grams that aren't dominated by stop words."""
    clean = [re.sub(r"[^a-z0-9]", "", w.lower()) for w in words]
    clean = [w for w in clean if w]
    grams = []
    for i in range(len(clean) - n + 1):
        gram = clean[i:i+n]
        if sum(1 for g in gram if g in STOP_3GRAM_WORDS) >= 2:
            continue
        grams.append(" ".join(gram))
    counts = Counter(grams)
    return counts.most_common(top)

# ---- FAQPage schema extraction + validation -----------------------------
JSONLD_RE = re.compile(r'<script type="application/ld\+json">\s*(\{.*?\})\s*</script>', re.DOTALL | re.IGNORECASE)

def faq_schema_issues(html):
    """Return list of issues with FAQPage schema on the page (if present)."""
    issues = []
    for m in JSONLD_RE.finditer(html):
        try:
            d = json.loads(m.group(1))
        except Exception:
            continue
        graph = d.get("@graph", [d])
        for node in graph:
            if not isinstance(node, dict):
                continue
            if node.get("@type") != "FAQPage":
                continue
            entities = node.get("mainEntity", [])
            if not entities:
                issues.append("FAQPage with empty mainEntity")
                continue
            seen_qs = set()
            for q in entities:
                if not isinstance(q, dict):
                    issues.append("FAQ entry not an object")
                    continue
                name = (q.get("name") or "").strip()
                ans = q.get("acceptedAnswer", {})
                ans_text = (ans.get("text") if isinstance(ans, dict) else "" or "").strip()
                if not name:
                    issues.append("FAQ entry missing question text")
                if not ans_text:
                    issues.append(f"FAQ '{name[:50]}' missing answer text")
                if name in seen_qs:
                    issues.append(f"duplicate FAQ question: {name[:50]}")
                seen_qs.add(name)
    return issues

# ---- Per-page audit ------------------------------------------------------
def audit_page(path):
    rel = os.path.relpath(path, ROOT)
    with open(path) as f:
        html = f.read()
    body = main_text(html)
    words = text_words(body)
    wc = len(words)

    title_m = TITLE_RE.search(html)
    title = title_m.group(1).strip() if title_m else ""
    desc_m = DESC_RE.search(html)
    desc = desc_m.group(1).strip() if desc_m else ""

    headings = [(int(h[0]), TAG_RE.sub("", h[1]).strip()) for h in H_RE.findall(body)]
    h1_count = sum(1 for lvl, _ in headings if lvl == 1)
    h2_count = sum(1 for lvl, _ in headings if lvl == 2)

    # Heading hierarchy: detect skips (e.g., H1 then H3).
    skips = []
    prev = None
    for lvl, _ in headings:
        if prev is not None and lvl > prev + 1:
            skips.append((prev, lvl))
        prev = lvl

    para_words = [len(text_words(p)) for p in P_RE.findall(body)]
    long_paras = sum(1 for n in para_words if n > 80)
    max_para = max(para_words) if para_words else 0

    int_links = 0
    ext_links = 0
    for href, anchor in A_RE.findall(body):
        if href.startswith("/"):
            int_links += 1
        elif href.startswith("http") and "ambisecure.ambimat.com" not in href:
            ext_links += 1

    passive_hits = len(ATTR_PASSIVE_RE.findall(" ".join(words)))
    reading_min = round(wc / 220, 1)

    sents = sentences(words)
    sent_lens = [len(s) for s in sents]
    avg_sent_len = round(sum(sent_lens) / len(sent_lens), 1) if sent_lens else 0
    long_sents = sum(1 for n in sent_lens if n > 28)
    max_sent = max(sent_lens) if sent_lens else 0

    n_headings = len(headings)
    heading_density = round(wc / n_headings, 1) if n_headings else wc

    repeats = top_repeats(words)
    faq_issues = faq_schema_issues(html)

    return {
        "path": rel,
        "type": classify(rel),
        "word_count": wc,
        "title": title,
        "title_len": len(title),
        "desc_len": len(desc),
        "h1": h1_count,
        "h2": h2_count,
        "heading_skips": skips,
        "long_paras": long_paras,
        "max_para": max_para,
        "internal_links": int_links,
        "external_links": ext_links,
        "passive_hits": passive_hits,
        "reading_min": reading_min,
        "avg_sent_len": avg_sent_len,
        "long_sents": long_sents,
        "max_sent": max_sent,
        "heading_density": heading_density,
        "top_repeats": repeats,
        "faq_issues": faq_issues,
    }

# ---- Scoring -------------------------------------------------------------
def score(row):
    """Return (issues, warnings) lists."""
    issues = []
    warnings = []
    bands = BANDS.get(row["type"], BANDS["other"])
    wlo, whi = bands["word"]
    if row["word_count"] < wlo:
        issues.append(f"word count {row['word_count']} below {wlo}")
    if row["word_count"] > whi:
        issues.append(f"word count {row['word_count']} above {whi}")
    dlo, dhi = bands["desc"]
    if row["desc_len"] < dlo:
        warnings.append(f"meta description {row['desc_len']}c (target ≥{dlo}c)")
    if row["desc_len"] > dhi:
        warnings.append(f"meta description {row['desc_len']}c (target ≤{dhi}c)")
    tlo, thi = bands["title"]
    if row["title_len"] < tlo:
        warnings.append(f"title {row['title_len']}c (target ≥{tlo}c)")
    if row["title_len"] > thi:
        warnings.append(f"title {row['title_len']}c (target ≤{thi}c)")
    if row["h1"] != 1:
        if row["type"] in ("hub", "blog", "case-study", "brochure", "product", "service",
                           "solution", "technology", "industry", "reference", "tool",
                           "blog-archive"):
            issues.append(f"H1 count = {row['h1']} (expected 1)")
    if row["h2"] < 1 and row["type"] in ("blog", "case-study", "blog-archive"):
        warnings.append(f"H2 count = 0")
    if row["heading_skips"]:
        warnings.append(f"heading-level skips: {row['heading_skips']}")
    if row["long_paras"] > 0 and row["type"] in ("blog", "case-study"):
        warnings.append(f"{row['long_paras']} paragraph(s) > 80 words (max {row['max_para']})")
    if row["internal_links"] < 3 and row["type"] in ("blog", "case-study", "brochure"):
        warnings.append(f"only {row['internal_links']} internal link(s)")

    # Phase 14 readability warnings (never hard failures — technical content
    # is allowed to be technical; goal is operator visibility).
    if row["type"] in ("blog", "case-study"):
        if row["avg_sent_len"] > 24:
            warnings.append(f"avg sentence length {row['avg_sent_len']} words (target ≤24)")
        if row["long_sents"] > 8:
            warnings.append(f"{row['long_sents']} sentence(s) > 28 words (max {row['max_sent']})")
        if row["heading_density"] > 350:
            warnings.append(f"heading density {row['heading_density']} words/heading (target ≤350)")

    # FAQ schema validity is a hard issue when present — broken FAQ schema is
    # worse than no FAQ schema.
    for fi in row["faq_issues"]:
        issues.append(f"FAQ schema: {fi}")

    return issues, warnings

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--strict", action="store_true", help="Exit non-zero on issues.")
    ap.add_argument("--only", help="Restrict to one page-type.")
    ap.add_argument("--top", type=int, default=20, help="Top-N over-budget pages.")
    ap.add_argument("--verbose", "-v", action="store_true", help="Show every warning, not just issues.")
    args = ap.parse_args()

    # Per-path exemptions — these pages are intentionally outside the bands.
    EXEMPT = {"404.html"}

    rows = []
    for dirpath, _, files in os.walk(ROOT):
        if any(s in dirpath for s in ("/legacysitedata/", "/.git/", "/node_modules/",
                                       "/.lighthouseci/", "/assets/")):
            continue
        for name in files:
            if not name.endswith(".html"):
                continue
            path = os.path.join(dirpath, name)
            rel = os.path.relpath(path, ROOT)
            if rel in EXEMPT:
                continue
            rows.append(audit_page(path))
    if args.only:
        rows = [r for r in rows if r["type"] == args.only]

    by_type = defaultdict(list)
    for r in rows:
        by_type[r["type"]].append(r)

    total_issues = 0
    total_warnings = 0
    flagged = []

    for r in rows:
        iss, warn = score(r)
        total_issues += len(iss)
        total_warnings += len(warn)
        if iss or warn:
            flagged.append((r, iss, warn))

    # Header
    print(f"audit-yoast: {len(rows)} pages")
    for t in sorted(by_type):
        ws = [r["word_count"] for r in by_type[t]]
        if ws:
            print(f"  {t:<14} n={len(ws):>3}  words: avg={sum(ws)//len(ws):>4}  max={max(ws):>4}  min={min(ws):>4}")
    print(f"  issues:   {total_issues}")
    print(f"  warnings: {total_warnings}")

    # Top-N over-budget by word count
    sorted_over = sorted(
        [(r, score(r)[0]) for r in rows],
        key=lambda x: x[0]["word_count"], reverse=True
    )
    print(f"\nTop {args.top} pages by word count:")
    for r, iss in sorted_over[:args.top]:
        flag = "  !" if iss else "   "
        print(f"{flag} {r['word_count']:>5}  {r['type']:<14}  {r['path']}")

    if args.verbose or args.strict:
        print(f"\nDetailed flagged pages:")
        for r, iss, warn in flagged:
            if not (iss or (args.verbose and warn)):
                continue
            print(f"\n  {r['path']}  [{r['type']}, {r['word_count']}w, {r['title_len']}t, {r['desc_len']}d]")
            if args.verbose:
                print(f"    avg sent={r['avg_sent_len']}w  long sents={r['long_sents']}  "
                      f"heading density={r['heading_density']}w/h  reading={r['reading_min']}min")
                if r.get("top_repeats"):
                    rep = ", ".join(f"{g} ({n})" for g, n in r["top_repeats"])
                    print(f"    top 3-grams: {rep}")
            for i in iss:
                print(f"    ! {i}")
            if args.verbose:
                for w in warn:
                    print(f"    . {w}")

    # FAQ schema summary (informational — issues are already in flagged list)
    faq_pages = [r for r in rows if r.get("faq_issues") is not None
                 and any('"@type": "FAQPage"' in open(os.path.join(ROOT, r["path"])).read()
                         for _ in [0])]
    # Cheaper: just count those whose audit_page found FAQ content (issues empty means clean FAQ)
    faq_present = []
    for r in rows:
        path = os.path.join(ROOT, r["path"])
        try:
            with open(path) as f:
                if '"@type": "FAQPage"' in f.read():
                    faq_present.append(r["path"])
        except OSError:
            continue
    if faq_present:
        print(f"\nFAQPage schema present on {len(faq_present)} page(s)")
        for p in faq_present[:5]:
            print(f"  - {p}")
        if len(faq_present) > 5:
            print(f"  ... and {len(faq_present)-5} more")

    if args.strict and total_issues > 0:
        sys.exit(1)
    sys.exit(0)

if __name__ == "__main__":
    main()
