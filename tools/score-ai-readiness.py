#!/usr/bin/env python3
"""Local reimplementation of the external tracker's ai_readiness scorer.

Lets us measure the six sub-scores before a crawl instead of after. The
component rules that were supplied to us are implemented exactly:

  structured_data  cap 25   Organization +8, BreadcrumbList +5,
                            Article/TechArticle/BlogPosting +8,
                            >=3 distinct @types +4
  faq              cap 20   int(20 * question_count / 5), count capped at 5
  entity_coverage  cap 15   n = len(Organization.knowsAbout) + len(page "keywords")
                            n>=4 -> 6, n>=10 -> 10, n>=20 -> 15
  content_depth    cap 15   step function on word count: 400 -> 6, 800 -> 10,
                            1500 -> 15
  headings         cap 15   MODELLED (see below)
  answer_shape     cap 10   MODELLED (see below)

headings and answer_shape were not supplied in full. They are modelled from the
two anchors we were given:
  * the index pages scored headings 8 / answer 7 before any change;
  * renaming one H2 to question form is worth +4 headings and +3 answer_shape,
    where a heading qualifies under
        ^(what|how|why|when|where|who|which|can|does|do|is|are|should)\\b
  * answer_shape additionally needs meta_description >= 80 chars (worth 4).
Treat those two columns as estimates; the other four are exact.

Usage:
    python3 tools/score-ai-readiness.py            # domain summary
    python3 tools/score-ai-readiness.py --per-page # every page, worst first
    python3 tools/score-ai-readiness.py --page /tags/
"""
import argparse
import html
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SITE = "https://ambisecure.ambimat.com"
Q_RE = re.compile(r"^(what|how|why|when|where|who|which|can|does|do|is|are|should)\b", re.I)
ARTICLE_TYPES = {"Article", "TechArticle", "BlogPosting"}


def sitemap_pages():
    sm = (ROOT / "sitemap.xml").read_text()
    out = []
    for loc in re.findall(r"<loc>([^<]+)</loc>", sm):
        rel = loc[len(SITE):].lstrip("/")
        p = ROOT / (rel + "index.html")
        if p.is_file():
            out.append((loc[len(SITE):] or "/", p))
    return out


def strip_scripts(t):
    return re.sub(r"(?s)<(script|style)\b.*?</\1>", " ", t)


def visible_text(t):
    m = re.search(r"<main id=\"main\">(.*?)</main>", t, re.S)
    s = m.group(1) if m else t
    s = strip_scripts(s)
    s = re.sub(r"(?s)<nav\b.*?</nav>", " ", s)
    s = re.sub(r"<[^>]+>", " ", s)
    return html.unescape(re.sub(r"\s+", " ", s)).strip()


def analyse(path):
    t = path.read_text(encoding="utf-8", errors="replace")

    types, kw_n, faq_q, org_terms = set(), 0, 0, 0
    for b in re.findall(r'<script type="application/ld\+json">(.*?)</script>', t, re.S):
        try:
            d = json.loads(b)
        except Exception:
            continue
        for n in d.get("@graph", [d]):
            ty = n.get("@type")
            if isinstance(ty, str):
                types.add(ty)
            if ty == "FAQPage":
                faq_q = max(faq_q, len(n.get("mainEntity", [])))
            if ty == "Organization" and n.get("knowsAbout"):
                org_terms = max(org_terms, len(n["knowsAbout"]))
            k = n.get("keywords")
            if isinstance(k, list):
                kw_n += len(k)
            elif isinstance(k, str) and k.strip():
                kw_n += len([x for x in k.split(",") if x.strip()])

    # structured_data
    sd = 0
    if "Organization" in types:
        sd += 8
    if "BreadcrumbList" in types:
        sd += 5
    if types & ARTICLE_TYPES:
        sd += 8
    if len(types) >= 3:
        sd += 4
    sd = min(sd, 25)

    # faq
    faq = min(int(20 * min(faq_q, 5) / 5), 20)

    # entity_coverage
    n_ent = org_terms + kw_n
    ent = 15 if n_ent >= 20 else 10 if n_ent >= 10 else 6 if n_ent >= 4 else 0

    # content_depth
    words = len(visible_text(t).split())
    depth = 15 if words >= 1500 else 10 if words >= 800 else 6 if words >= 400 else 0

    # headings / answer_shape (modelled)
    body = strip_scripts(t)
    h2s = [html.unescape(re.sub(r"<[^>]+>", "", x)).strip()
           for x in re.findall(r"<h2[^>]*>(.*?)</h2>", body, re.S)]
    h3s = [html.unescape(re.sub(r"<[^>]+>", "", x)).strip()
           for x in re.findall(r"<h3[^>]*>(.*?)</h3>", body, re.S)]
    q_h2 = sum(1 for h in h2s if Q_RE.match(h))
    q_h3 = sum(1 for h in h3s if Q_RE.match(h))
    heads = 8 + (4 if q_h2 else 0) + (3 if q_h2 >= 3 else 0)
    heads = min(heads, 15)

    md = re.search(r'<meta name="description" content="([^"]*)"', t)
    md_len = len(html.unescape(md.group(1))) if md else 0
    ans = 3 + (4 if md_len >= 80 else 0) + (3 if (q_h2 or q_h3) else 0)
    ans = min(ans, 10)

    total = sd + faq + ent + depth + heads + ans
    return dict(total=total, structured=sd, faq=faq, entity=ent, depth=depth,
                headings=heads, answer=ans, words=words, faq_q=faq_q,
                q_h2=q_h2, md_len=md_len, types=len(types), ent_n=n_ent)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--per-page", action="store_true")
    ap.add_argument("--page")
    ap.add_argument("--limit", type=int, default=25)
    a = ap.parse_args()

    rows = [(u, analyse(p)) for u, p in sitemap_pages()]
    if not rows:
        sys.exit("no pages")

    if a.page:
        for u, r in rows:
            if u.rstrip("/") == a.page.rstrip("/"):
                print(f"{u}\n" + "\n".join(f"  {k:10} {v}" for k, v in r.items()))
                return 0
        sys.exit(f"no such page: {a.page}")

    avg = lambda k: sum(r[k] for _, r in rows) / len(rows)
    print(f"pages scored (sitemap): {len(rows)}")
    print(f"DOMAIN AVERAGE: {avg('total'):.1f}\n")
    print("  component        avg    cap")
    for k, cap in (("structured", 25), ("faq", 20), ("headings", 15),
                   ("depth", 15), ("entity", 15), ("answer", 10)):
        print(f"  {k:14} {avg(k):6.2f}  /{cap}")
    under = [(u, r) for u, r in rows if r["total"] < 40]
    print(f"\npages under 40: {len(under)}")
    print(f"pages under 60: {sum(1 for _, r in rows if r['total'] < 60)}")
    print(f"pages 70+:      {sum(1 for _, r in rows if r['total'] >= 70)}")

    if a.per_page:
        print("\nworst pages:")
        for u, r in sorted(rows, key=lambda x: x[1]["total"])[:a.limit]:
            print(f"  {r['total']:3d}  sd{r['structured']:2d} faq{r['faq']:2d} "
                  f"hd{r['headings']:2d} dp{r['depth']:2d} en{r['entity']:2d} "
                  f"an{r['answer']:2d}  w={r['words']:5d}  {u}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
