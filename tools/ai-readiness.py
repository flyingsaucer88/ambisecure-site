#!/usr/bin/env python3
"""ai-readiness.py — one tool for measuring and raising the AI-readiness score.

Converged from two independent implementations that had started to drift:
  * scripts/ai_readiness_boost.py (esim-website) — the mutation pass, and the
    scorer mirror that matches the tracker's ai_readiness.py exactly.
  * tools/score-ai-readiness.py (this repo) — the measurement/reporting half.

The boost scorer is the authoritative one and is kept verbatim below. The
older tools/score-ai-readiness.py disagreed with it in two ways, both of which
made it under-report:

  * word count — it counted only <main> minus <nav>. The tracker counts the
    whole document minus <script>/<style>. On /resources/tools/aaguid-lookup/
    that is 348 words, not 168.
  * headings/answer_shape — it modelled these instead of scoring them. The
    real rules are h1-present + h2-count-band + question-heading, and
    desc>=80 + h1>=3-words + question-heading.

SCORING (mirrors seo_tracker/ai_readiness.py)
  structured_data 25  Organization +8, BreadcrumbList +5, Article-ish +8,
                      >=3 distinct @types +4
  faq             20  int(20 * questions / 5), questions capped at 5
  headings        15  h1 present +5, >=3 h2 +6 (>=1 h2 +3), question heading +4
  content_depth   15  400 -> 6, 800 -> 10, 1500 -> 15   (whole-document words)
  entity_coverage 15  len(Organization.knowsAbout) + len(keywords):
                      >=4 -> 6, >=10 -> 10, >=20 -> 15
  answer_shape    10  meta description >=80 chars +4, h1 >=3 words +3,
                      question heading +3

USAGE
    python3 tools/ai-readiness.py                     # domain summary
    python3 tools/ai-readiness.py --per-page          # worst pages first
    python3 tools/ai-readiness.py --page /tags/       # one page, itemised
    python3 tools/ai-readiness.py --check             # guards, exit 1 on fail
    python3 tools/ai-readiness.py --config c.json --dry-run   # mutation preview
    python3 tools/ai-readiness.py --config c.json --apply     # mutate

Point it at another domain with --config (see CONFIGS below) and --root.
"""
from __future__ import annotations

import argparse
import html as htmllib
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent

MARKER = "<!-- ai-readiness:schema -->"
ARTICLE_TYPES = {"Article", "BlogPosting", "NewsArticle", "TechArticle"}
_QHEAD = re.compile(
    r"^(what|how|why|when|where|who|which|can|does|do|is|are|should)\b", re.I)
DROP = object()

# ---------------------------------------------------------------- configs --
# discovery: "sitemap" walks sitemap.xml (directory-index sites);
#            "glob" walks the listed glob patterns (flat-file sites).
CONFIGS = {
    "ambisecure": {
        "root": str(ROOT),
        "base_url": "https://ambisecure.ambimat.com/",
        "discovery": "sitemap",
        "canonical_org_from": "index.html",   # single source of truth
        "article_type_default": "TechArticle",
        "article_type": {},
        "breadcrumb": {},
        "h2_rename": {},
        "exclude": ["404.html"],
    },
    "esim": {
        "root": "/Users/neelshah/Documents/git_repo/esim-website",
        "base_url": "https://esim.ambimat.com/",
        "discovery": "glob",
        "globs": ["*.html", "blogs/*.html", "case-studies/*.html"],
        "canonical_org_from": None,
        "article_type_default": "TechArticle",
        "article_type": {},
        "breadcrumb": {},
        "h2_rename": {},
        "exclude": ["404.html"],
    },
}


# ---------------------------------------------------------------- helpers --
def _first(pat, html, default=""):
    m = re.search(pat, html, re.S | re.I)
    return re.sub(r"\s+", " ", m.group(1)).strip() if m else default


def _text(s):
    return htmllib.unescape(re.sub(r"<[^>]+>", "", s)).strip()


# ------------------------------------------- scorer mirror (authoritative) --
def _ingest(node, p):
    if isinstance(node, dict):
        raw = node.get("@type")
        for ty in ((raw,) if isinstance(raw, str) else tuple(raw or ())):
            if not isinstance(ty, str):
                continue
            p["types"].append(ty)
            if ty == "FAQPage":
                me = node.get("mainEntity")
                p["faq"] += sum(1 for q in me if isinstance(q, dict)) if isinstance(me, list) else 0
            elif ty in ARTICLE_TYPES:
                p["article"] = True
            elif ty == "BreadcrumbList":
                p["breadcrumb"] = True
            elif ty == "Organization":
                p["org"] = True
                ka = node.get("knowsAbout")
                p["knows"] += len(ka) if isinstance(ka, list) else 0
        kw = node.get("keywords")
        if isinstance(kw, str):
            p["keywords"] += len([x for x in kw.split(",") if x.strip()])
        elif isinstance(kw, list):
            p["keywords"] += len(kw)
        for v in node.values():
            _ingest(v, p)
    elif isinstance(node, list):
        for x in node:
            _ingest(x, p)


def extract(html):
    p = {"types": [], "faq": 0, "knows": 0, "keywords": 0,
         "article": False, "org": False, "breadcrumb": False}
    for m in re.finditer(r'<script type="application/ld\+json">(.*?)</script>', html, re.S):
        try:
            _ingest(json.loads(m.group(1)), p)
        except json.JSONDecodeError:
            pass
    p["h1"] = _text(_first(r"<h1[^>]*>(.*?)</h1>", html))
    p["h2"] = [re.sub(r"\s+", " ", _text(x))
               for x in re.findall(r"<h2[^>]*>(.*?)</h2>", html, re.S)]
    p["title"] = _text(_first(r"<title>(.*?)</title>", html))
    p["desc"] = _first(r'<meta name="description" content="(.*?)"', html)
    # Whole document minus script/style — this is what the tracker counts.
    body = re.sub(r"<(script|style)\b[^>]*>.*?</\1>", " ", html, flags=re.S | re.I)
    p["wc"] = len(re.findall(r"\w+", re.sub(r"<[^>]+>", " ", body)))
    return p


def score(p):
    sd = min((8 if p["org"] else 0) + (5 if p["breadcrumb"] else 0) +
             (8 if p["article"] else 0) + (4 if len(set(p["types"])) >= 3 else 0), 25)
    faq = 20 if p["faq"] >= 5 else int(20 * p["faq"] / 5)
    n = len(p["h2"])
    qh = any(_QHEAD.match(h) for h in p["h2"])
    hd = min((5 if p["h1"] else 0) + (6 if n >= 3 else 3 if n >= 1 else 0) +
             (4 if qh else 0), 15)
    wc = p["wc"]
    dep = 15 if wc >= 1500 else 10 if wc >= 800 else 6 if wc >= 400 else 0
    e = p["knows"] + p["keywords"]
    ent = 15 if e >= 20 else 10 if e >= 10 else 6 if e >= 4 else 0
    ans = min((4 if p["desc"] and len(p["desc"]) >= 80 else 0) +
              (3 if p["h1"] and len(p["h1"].split()) >= 3 else 0) +
              (3 if qh else 0), 10)
    sub = {"sd": sd, "faq": faq, "hd": hd, "dep": dep, "ent": ent, "ans": ans}
    return sum(sub.values()), sub


# ---------------------------------------------------------------- mutation --
def refify_orgs(obj, canonical_id, strip_faq):
    if isinstance(obj, dict):
        t = obj.get("@type")
        if t == "Organization":
            return {"@id": obj.get("@id") or canonical_id}
        if t == "FAQPage" and strip_faq:
            return DROP
        out = {}
        for k, v in obj.items():
            nv = refify_orgs(v, canonical_id, strip_faq)
            if nv is not DROP:
                out[k] = nv
        return out
    if isinstance(obj, list):
        return [x for x in (refify_orgs(v, canonical_id, strip_faq) for v in obj)
                if x is not DROP]
    return obj


def is_trivial(data):
    if isinstance(data, dict):
        keys = set(data.keys()) - {"@context"}
        return keys <= {"@id"} or ("@graph" in keys and not data.get("@graph"))
    return isinstance(data, list) and not data


def page_has_article(html):
    return any(ty in ARTICLE_TYPES for m in re.finditer(
        r'<script type="application/ld\+json">(.*?)</script>', html, re.S)
        for ty in re.findall(r'"@type"\s*:\s*"([^"]+)"', m.group(1)))


def visible_faq(html):
    """Read visible Q&A so schema and page stay in parity.

    This site has accumulated four FAQ markups (bare <details>, details.faq-q
    with a nested <h3>, div.faq-item, and loose <h3>/<p> pairs), so the parser
    is deliberately permissive: any <details> block, plus any div.faq-item.
    Returns None when nothing is found.

    Coverage is NOT assumed to be complete — see faq_is_rebuildable(), which
    is what actually authorises rebuilding the FAQPage node. Parsing more than
    the schema knows about is fine; parsing less must never cause a rewrite.
    """
    pairs = []
    for d in re.finditer(r"<details\b[^>]*>(.*?)</details>", html, re.S):
        blk = d.group(1)
        ms = re.search(r"<summary\b[^>]*>(.*?)</summary>", blk, re.S)
        if not ms:
            continue
        rest = blk[ms.end():]
        mp = re.search(r"<p\b[^>]*>(.*?)</p>", rest, re.S)
        if not mp:
            continue
        pairs.append((_text(ms.group(1)), _text(mp.group(1))))
    for d in re.finditer(
            r'<div class="faq-item"[^>]*>\s*<h3[^>]*>(.*?)</h3>\s*<p[^>]*>(.*?)</p>',
            html, re.S):
        pairs.append((_text(d.group(1)), _text(d.group(2))))
    return pairs or None


def schema_questions(html):
    out = []
    for m in re.finditer(r'<script type="application/ld\+json">(.*?)</script>', html, re.S):
        try:
            d = json.loads(m.group(1))
        except json.JSONDecodeError:
            continue
        for n in d.get("@graph", [d]):
            if isinstance(n, dict) and n.get("@type") == "FAQPage":
                for e in n.get("mainEntity", []):
                    if isinstance(e, dict) and e.get("name"):
                        out.append(e["name"])
    return out


def faq_is_rebuildable(html, faq):
    """Only rebuild FAQPage from the page when doing so loses nothing.

    Without this gate a parser miss silently deletes questions: on
    /products/iot-security-coprocessor/ the permissive parser still finds only
    2 of 5, and rebuilding from that would drop the other 3 from the schema.
    """
    if not faq:
        return False
    have = {q for q, _ in faq}
    return all(q in have for q in schema_questions(html))


def dumps_block(data, indent="  "):
    body = json.dumps(data, ensure_ascii=False, indent=2).replace("\n", "\n" + indent)
    return (f'{indent}<script type="application/ld+json">\n'
            f'{indent}{body}\n{indent}</script>')


def canonical_org(cfg):
    """Canonical Organization node: from config, or read from a source page."""
    if cfg.get("canonical_org"):
        return cfg["canonical_org"]
    src = cfg.get("canonical_org_from")
    if not src:
        raise SystemExit("config needs canonical_org or canonical_org_from")
    html = (Path(cfg["root"]) / src).read_text(encoding="utf-8")
    for m in re.finditer(r'<script type="application/ld\+json">(.*?)</script>', html, re.S):
        for n in json.loads(m.group(1)).get("@graph", []):
            if n.get("@type") == "Organization" and n.get("knowsAbout"):
                return n
    raise SystemExit(f"no Organization with knowsAbout in {src}")


def transform(rel, html, cfg):
    canonical = canonical_org(cfg)
    cid = canonical.get("@id", cfg["base_url"] + "#org")
    base = cfg["base_url"]
    url = base + ("" if rel in ("index.html", "") else rel)

    html = re.sub(r'[ \t]*' + re.escape(MARKER) +
                  r'\s*<script type="application/ld\+json">.*?</script>\n?',
                  "", html, flags=re.S)

    faq = visible_faq(html)
    strip_faq = faq_is_rebuildable(html, faq)
    if faq and not strip_faq:
        # Page has visible FAQ we cannot fully parse. Leave the existing
        # FAQPage node alone rather than rebuilding it from a partial read.
        faq = None

    def block_repl(m):
        indent = m.group(1)
        try:
            data = json.loads(m.group(2))
        except json.JSONDecodeError:
            return m.group(0)
        new = refify_orgs(data, cid, strip_faq)
        if new is DROP or is_trivial(new):
            return ""
        return dumps_block(new, indent)

    html = re.sub(r'([ \t]*)<script type="application/ld\+json">(.*?)</script>',
                  block_repl, html, flags=re.S)

    nodes = [dict(canonical)]
    if not page_has_article(html):
        atype = cfg["article_type"].get(rel, cfg["article_type_default"])
        nodes.append({
            "@type": atype, "@id": f"{url}#article",
            "headline": _text(_first(r"<h1[^>]*>(.*?)</h1>", html))
            or _first(r"<title>(.*?)</title>", html),
            "name": _first(r"<title>(.*?)</title>", html),
            "description": _first(r'<meta name="description" content="(.*?)"', html),
            "url": url, "inLanguage": "en",
            "isPartOf": {"@id": base + "#website"},
            "author": {"@id": cid}, "publisher": {"@id": cid},
            "mainEntityOfPage": url,
        })
    if rel in cfg.get("breadcrumb", {}):
        nodes.append({
            "@type": "BreadcrumbList", "@id": f"{url}#breadcrumbs",
            "itemListElement": [
                {"@type": "ListItem", "position": i + 1, "name": b["name"], "item": b["item"]}
                for i, b in enumerate(cfg["breadcrumb"][rel])]})
    if faq:
        nodes.append({
            "@type": "FAQPage", "@id": f"{url}#faq",
            "mainEntity": [
                {"@type": "Question", "name": q,
                 "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faq]})

    block = f"  {MARKER}\n" + dumps_block(
        {"@context": "https://schema.org", "@graph": nodes}, "  ")
    html = html.replace("</head>", f"{block}\n</head>", 1)

    if rel in cfg.get("h2_rename", {}):
        old, new = cfg["h2_rename"][rel]
        if old in html:
            html = html.replace(old, new, 1)
        else:
            print(f"  WARN h2_rename anchor not found in {rel}: {old!r}", file=sys.stderr)
    return html


# ---------------------------------------------------------------- discovery --
def iter_pages(cfg):
    root = Path(cfg["root"])
    if cfg.get("discovery") == "sitemap":
        sm = (root / "sitemap.xml").read_text()
        host = cfg["base_url"].rstrip("/")
        for loc in re.findall(r"<loc>([^<]+)</loc>", sm):
            rel = loc[len(host):].lstrip("/") + "index.html"
            f = root / rel
            if f.is_file() and rel not in cfg.get("exclude", []):
                yield (loc[len(host):] or "/"), f
    else:
        for pat in cfg.get("globs", ["*.html"]):
            for f in sorted(root.glob(pat)):
                rel = f.relative_to(root).as_posix()
                if rel not in cfg.get("exclude", []):
                    yield rel, f


# ------------------------------------------------------------------ guards --
def run_checks(rows):
    """Structural guards that the score alone will not catch."""
    fails = []

    short_h1 = [(u, p["h1"]) for u, p, _, _ in rows
                if p["h1"] and len(p["h1"].split()) < 3]
    if short_h1:
        fails.append(("h1 under 3 words (costs 3 answer_shape each)", short_h1))

    no_h1 = [(u, "") for u, p, _, _ in rows if not p["h1"]]
    if no_h1:
        fails.append(("no h1 at all (costs 5 headings + 3 answer_shape)", no_h1))

    # Authoritative visibility test: does the question text actually appear in
    # the rendered HTML? Counting markup elements gives false alarms, because
    # the site uses four different FAQ markups.
    parity = []
    for u, _, _, f in rows:
        html = f.read_text(encoding="utf-8")
        body = re.sub(r"(?s)<script.*?</script>", " ", html)
        missing = [q for q in schema_questions(html)
                   if q not in body and htmllib.escape(q, quote=False) not in body]
        if missing:
            parity.append((u, f"{len(missing)} question(s) not on page, "
                              f"e.g. {missing[0][:60]!r}"))
    if parity:
        fails.append(("FAQPage schema not visible on page "
                      "(Google FAQPage policy violation)", parity))

    short_desc = [(u, f"{len(p['desc'])} chars") for u, p, _, _ in rows
                  if len(p["desc"]) < 80]
    if short_desc:
        fails.append(("meta description under 80 chars (costs 4 answer_shape)",
                      short_desc))
    return fails


# ------------------------------------------------------------------- driver --
def load_cfg(a):
    if a.config and Path(a.config).is_file():
        cfg = json.loads(Path(a.config).read_text())
    else:
        cfg = dict(CONFIGS[a.config or "ambisecure"])
    if a.root:
        cfg["root"] = a.root
    cfg.setdefault("article_type", {})
    cfg.setdefault("breadcrumb", {})
    cfg.setdefault("h2_rename", {})
    return cfg


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--config", help="named config (%s) or path to JSON"
                    % ", ".join(CONFIGS))
    ap.add_argument("--root")
    ap.add_argument("--per-page", action="store_true")
    ap.add_argument("--page")
    ap.add_argument("--limit", type=int, default=25)
    ap.add_argument("--check", action="store_true", help="run guards; exit 1 on fail")
    ap.add_argument("--dry-run", action="store_true", help="preview mutation")
    ap.add_argument("--apply", action="store_true", help="write mutation")
    a = ap.parse_args()
    cfg = load_cfg(a)

    rows = []
    for url, f in iter_pages(cfg):
        html = f.read_text(encoding="utf-8")
        p = extract(html)
        tot, sub = score(p)
        rows.append((url, p, (tot, sub), f))
    if not rows:
        sys.exit("no pages found")

    if a.page:
        for url, p, (tot, sub), _ in rows:
            if url.rstrip("/") == a.page.rstrip("/"):
                print(f"{url}   TOTAL {tot}")
                for k, v in sub.items():
                    print(f"  {k:4} {v}")
                print(f"  words {p['wc']} | h1 {len(p['h1'].split())}w | "
                      f"h2 {len(p['h2'])} | faq {p['faq']} | desc {len(p['desc'])}")
                return 0
        sys.exit(f"no such page: {a.page}")

    if a.dry_run or a.apply:
        print(f"{'PAGE':50s} {'BEFORE':>6} -> {'AFTER':>5}   sd/faq/hd/dep/ent/ans")
        tb = ta = 0
        for url, p, (tot, _), f in rows:
            html = f.read_text(encoding="utf-8")
            rel = f.relative_to(Path(cfg["root"])).as_posix()
            new = transform(rel, html, cfg)
            aft, s = score(extract(new))
            tb += tot; ta += aft
            if a.apply and new != html:
                f.write_text(new, encoding="utf-8")
            print(f"{url:50s} {tot:6d} -> {aft:5d}   "
                  f"{s['sd']}/{s['faq']}/{s['hd']}/{s['dep']}/{s['ent']}/{s['ans']}")
        n = len(rows)
        print(f"\navg {tb/n:.1f} -> {ta/n:.1f}   n={n}"
              + ("   (APPLIED)" if a.apply else "   (dry run)"))
        return 0

    if a.check:
        fails = run_checks(rows)
        print(f"=== ai-readiness guards === {len(rows)} pages")
        if not fails:
            print("  ok  no structural issues")
            return 0
        for label, items in fails:
            print(f"\n  FAIL: {len(items)} page(s) — {label}")
            for u, d in items[:10]:
                print(f"    {u}  {d}")
            if len(items) > 10:
                print(f"    ... and {len(items)-10} more")
        return 1

    avg = lambda k: sum(s[k] for _, _, (_, s) in [(u, p, t) for u, p, t, _ in rows]) / len(rows)
    tot_avg = sum(t for _, _, (t, _), _ in rows) / len(rows)
    print(f"pages scored: {len(rows)}")
    print(f"DOMAIN AVERAGE: {tot_avg:.1f}\n")
    print("  component        avg    cap")
    for k, cap, name in (("sd", 25, "structured"), ("faq", 20, "faq"),
                         ("hd", 15, "headings"), ("dep", 15, "depth"),
                         ("ent", 15, "entity"), ("ans", 10, "answer")):
        print(f"  {name:14} {avg(k):6.2f}  /{cap}")
    print(f"\npages under 40: {sum(1 for _, _, (t, _), _ in rows if t < 40)}")
    print(f"pages under 60: {sum(1 for _, _, (t, _), _ in rows if t < 60)}")
    print(f"pages 70+:      {sum(1 for _, _, (t, _), _ in rows if t >= 70)}")
    print(f"pages 80+:      {sum(1 for _, _, (t, _), _ in rows if t >= 80)}")

    if a.per_page:
        print("\nworst pages:")
        for url, p, (t, s), _ in sorted(rows, key=lambda r: r[2][0])[:a.limit]:
            print(f"  {t:3d}  sd{s['sd']:2d} faq{s['faq']:2d} hd{s['hd']:2d} "
                  f"dep{s['dep']:2d} ent{s['ent']:2d} ans{s['ans']:2d}  "
                  f"w={p['wc']:5d}  {url}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
