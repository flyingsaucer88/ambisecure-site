#!/usr/bin/env python3
"""Audit the URLs in a Google Search Console "Crawled - currently not indexed"
export against the repo, the sitemap, robots.txt and the .htaccess redirect /
410 rules, then classify each URL into a remediation action.

This is a STATIC, repo-local audit. It does not hit the network — it predicts
what the live server *should* return from the committed .htaccess and the files
on disk, so it can be run offline and in CI. (Use tools/verify-live-resources.py
or curl for live confirmation.)

Input
  A GSC CSV with a header row and a `URL` column (the "Table.csv" inside the
  GSC coverage-export zip). Other columns (Last crawled, Status) are optional.

For every affected URL it determines:
  - normalized path (protocol/host stripped, index.html + trailing-slash folded)
  - predicted server disposition: 200 (file on disk) / 301 (.htaccess redirect)
           / 410 (.htaccess spam-killer pattern) / 404 (nothing matches)
  - repo file it maps to (if any)
  - for 200 pages: <title>, meta description, first <h1>, canonical, robots
           meta (noindex?), <main> word count, count of internal links that
           point AT the page (inbound links — orphan / weak-linking signal)
  - sitemap.xml membership
  - conflicts: in sitemap but redirected / 410 / 404 / noindex; canonical that
           points to a different URL; duplicate title or meta description shared
           with another affected page.

It then assigns one action per URL:
  A_IMPROVE      keep indexable, but the 200 page is thin / weakly linked
  B_CANONICAL    duplicate / near-duplicate; fold via canonical
  C_REDIRECT     already (or should be) 301'd to a stronger URL
  D_NOINDEX      useful to users, not for search; add noindex + drop from sitemap
  E_GONE         410 / 404 legacy cruft; correct that it is not indexed
  OK_INDEXABLE   healthy 200 page, in sitemap, not thin, has inbound links
  NOT_FOUND      URL not in repo and not matched by any rule (investigate)

Outputs a Markdown report (default reports/gsc-crawled-not-indexed-audit.md)
and, with --json, a machine-readable JSON sidecar.

Usage
  python3 tools/audit-gsc-crawled-not-indexed.py \
      docs/audits/gsc/crawled-not-indexed-2026-06-12.csv
  python3 tools/audit-gsc-crawled-not-indexed.py CSV --md reports/x.md --json reports/x.json
  python3 tools/audit-gsc-crawled-not-indexed.py CSV --thin-words 250
"""
import argparse, csv, json, os, re, sys
from collections import defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
HOST = "ambisecure.ambimat.com"

# ---- HTML extraction (mirrors tools/audit-yoast.py conventions) ----------
HEAD_RE   = re.compile(r"<head[^>]*>.*?</head>", re.DOTALL | re.IGNORECASE)
NAVBAR_RE = re.compile(r'<header class="navbar"[^>]*>.*?</header>', re.DOTALL | re.IGNORECASE)
NAV_RE    = re.compile(r"<nav[^>]*>.*?</nav>", re.DOTALL | re.IGNORECASE)
FOOTER_RE = re.compile(r"<footer[^>]*>.*?</footer>", re.DOTALL | re.IGNORECASE)
SCRIPT_RE = re.compile(r"<script[^>]*>.*?</script>", re.DOTALL | re.IGNORECASE)
STYLE_RE  = re.compile(r"<style[^>]*>.*?</style>", re.DOTALL | re.IGNORECASE)
TAG_RE    = re.compile(r"<[^>]+>", re.DOTALL)

TITLE_RE  = re.compile(r"<title>([^<]*)</title>", re.IGNORECASE)
DESC_RE   = re.compile(r'<meta\s+name="description"\s+content="([^"]*)"', re.IGNORECASE)
CANON_RE  = re.compile(r'<link\s+rel="canonical"\s+href="([^"]*)"', re.IGNORECASE)
H1_RE     = re.compile(r"<h1[^>]*>(.*?)</h1>", re.DOTALL | re.IGNORECASE)
ROBOTS_RE = re.compile(r'<meta\s+name="robots"\s+content="([^"]*)"', re.IGNORECASE)
HREF_RE   = re.compile(r'href="([^"]+)"', re.IGNORECASE)


def strip_body(html):
    for rx in (HEAD_RE, NAVBAR_RE, NAV_RE, FOOTER_RE, SCRIPT_RE, STYLE_RE):
        html = rx.sub("", html)
    return html


def text_of(fragment):
    t = TAG_RE.sub(" ", fragment)
    return re.sub(r"\s+", " ", t).strip()


def word_count(html):
    body = strip_body(html)
    txt = text_of(body)
    return len(txt.split()) if txt else 0


# ---- URL normalization ---------------------------------------------------
def normalize(url):
    """Return (scheme, path) with path folded to a canonical directory form:
    strips host, drops a trailing index.html, ensures one leading slash, and
    normalizes the trailing slash for directory-style URLs (keeps file
    extensions like .htm/.html/.xml as-is)."""
    scheme = "http" if url.startswith("http://") else "https"
    p = re.sub(r"^https?://[^/]+", "", url.strip())
    p = p.split("#", 1)[0].split("?", 1)[0]
    if not p:
        p = "/"
    if not p.startswith("/"):
        p = "/" + p
    # fold /path/index.html -> /path/
    p = re.sub(r"/index\.html$", "/", p)
    return scheme, p


def repo_file_for(path):
    """Map a normalized path to a repo file, or None."""
    rel = path.lstrip("/")
    if path.endswith("/") or path == "/":
        cand = os.path.join(ROOT, rel, "index.html")
        return cand if os.path.isfile(cand) else None
    # explicit file (e.g. *.htm, *.xml) or extensionless
    cand = os.path.join(ROOT, rel)
    if os.path.isfile(cand):
        return cand
    cand2 = os.path.join(ROOT, rel, "index.html")
    return cand2 if os.path.isfile(cand2) else None


# ---- .htaccess rule model ------------------------------------------------
def load_htaccess_rules():
    """Parse the committed .htaccess into:
       gone_patterns: [compiled regex] matched against the path *without*
                      leading slash (the RewriteRule [G] spam killers)
       redirects:     [(src_path, dst)] from `Redirect 301 src dst` (prefix match)
    """
    gone, redirects = [], []
    path = os.path.join(ROOT, ".htaccess")
    if not os.path.isfile(path):
        return gone, redirects
    for line in open(path, encoding="utf-8", errors="replace"):
        s = line.strip()
        if s.startswith("#") or not s:
            continue
        m = re.match(r"RewriteRule\s+(\S+)\s+(\S+)\s+\[([^\]]*)\]", s)
        if m:
            pat, _sub, flags = m.groups()
            fl = flags.upper()
            if "G" in re.split(r"[,\s]", fl):  # [G] or [G,L] => 410
                try:
                    gone.append(re.compile("^" + pat.lstrip("^")))
                except re.error:
                    pass
            continue
        m = re.match(r"Redirect\s+301\s+(\S+)\s+(\S+)", s, re.IGNORECASE)
        if m:
            redirects.append((m.group(1), m.group(2)))
    return gone, redirects


def predict_disposition(path, gone, redirects):
    """Predict what the server returns for `path` from disk + .htaccess.
    Returns (code, detail). Order mirrors .htaccess: spam-kill 410 first,
    then on-disk 200, then Redirect-301 prefix match, else 404."""
    rel = path.lstrip("/")
    for rx in gone:
        if rx.match(rel):
            return 410, f"htaccess [G] pattern {rx.pattern}"
    if repo_file_for(path):
        return 200, "file on disk"
    for src, dst in redirects:
        # Apache Redirect is a path-prefix match.
        if path == src or path.startswith(src.rstrip("/") + "/") or path == src + "/":
            return 301, f"301 -> {dst}"
    return 404, "no file, no rule"


# ---- sitemap -------------------------------------------------------------
def load_sitemap_paths():
    paths = set()
    sm = os.path.join(ROOT, "sitemap.xml")
    if not os.path.isfile(sm):
        return paths
    for loc in re.findall(r"<loc>([^<]+)</loc>", open(sm, encoding="utf-8").read()):
        _s, p = normalize(loc)
        paths.add(p)
    return paths


# ---- inbound internal links (orphan / weak-link detection) ---------------
def build_inbound_index():
    """Scan every .html file in the repo and count, for each target path,
    how many *other* pages link to it. Returns dict path -> inbound count."""
    inbound = defaultdict(set)
    skip_dirs = {".git", "node_modules", "dist", "legacysitedata", "_internal"}
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in skip_dirs]
        for fn in filenames:
            if not fn.endswith(".html"):
                continue
            fp = os.path.join(dirpath, fn)
            src_rel = "/" + os.path.relpath(fp, ROOT)
            _s, src_path = normalize(src_rel)
            try:
                html = open(fp, encoding="utf-8", errors="replace").read()
            except OSError:
                continue
            body = strip_body(html)  # ignore boilerplate nav/footer links
            for href in HREF_RE.findall(body):
                if href.startswith(("http://", "https://", "#", "mailto:", "tel:")):
                    continue
                _s2, tgt = normalize(href if href.startswith("/") else "/" + href)
                if tgt != src_path:
                    inbound[tgt].add(src_path)
    return {k: len(v) for k, v in inbound.items()}


# ---- per-page facts ------------------------------------------------------
def page_facts(fp):
    html = open(fp, encoding="utf-8", errors="replace").read()
    title = TITLE_RE.search(html).group(1).strip() if TITLE_RE.search(html) else ""
    desc = DESC_RE.search(html).group(1).strip() if DESC_RE.search(html) else ""
    canon = CANON_RE.search(html).group(1).strip() if CANON_RE.search(html) else ""
    robots = ROBOTS_RE.search(html).group(1).strip().lower() if ROBOTS_RE.search(html) else ""
    h1m = H1_RE.search(strip_body(html))
    h1 = text_of(h1m.group(1)) if h1m else ""
    h1_count = len(H1_RE.findall(strip_body(html)))
    return {
        "title": title, "desc": desc, "canonical": canon,
        "robots": robots, "noindex": "noindex" in robots,
        "h1": h1, "h1_count": h1_count, "words": word_count(html),
    }


def classify(rec, thin_words):
    code = rec["disposition"]
    if code == 410:
        return "E_GONE", "410 Gone (legacy spam-kill pattern) — correctly de-indexed"
    if code == 404:
        return "NOT_FOUND", "no file and no .htaccess rule — investigate"
    if code == 301:
        return "C_REDIRECT", rec["disposition_detail"]
    # 200
    f = rec.get("facts") or {}
    if f.get("noindex"):
        if rec["in_sitemap"]:
            return "D_NOINDEX", "noindex page still listed in sitemap — drop from sitemap"
        return "D_NOINDEX", "noindex (intentional, already out of sitemap)"
    # canonical pointing elsewhere => consolidation target
    canon = f.get("canonical", "")
    if canon:
        _s, cpath = normalize(canon)
        if cpath != rec["path"]:
            return "B_CANONICAL", f"canonical points to {cpath} (folds into another URL)"
    thin = f.get("words", 0) < thin_words
    weak = rec["inbound"] < 3
    if thin and weak:
        return "A_IMPROVE", f"thin ({f.get('words')}w) AND weakly linked ({rec['inbound']} inbound)"
    if thin:
        return "A_IMPROVE", f"thin content ({f.get('words')}w)"
    if weak:
        return "A_IMPROVE", f"weak internal linking ({rec['inbound']} inbound)"
    return "OK_INDEXABLE", f"healthy 200 ({f.get('words')}w, {rec['inbound']} inbound) — likely a crawl-budget/authority delay"


SECTION_OF = [
    (re.compile(r"^/blog/.+/$"), "blog post"),
    (re.compile(r"^/blog/?$|^/tags/|^/blog/page/"), "blog/tag/archive"),
    (re.compile(r"^/resources/tools/"), "resource/tool"),
    (re.compile(r"^/resources/"), "resource/tool"),
    (re.compile(r"^/solutions/"), "solution/product"),
    (re.compile(r"^/products/"), "solution/product"),
    (re.compile(r"^/services/"), "solution/product"),
    (re.compile(r"^/industries/"), "solution/product"),
    (re.compile(r"^/technologies/"), "solution/product"),
    (re.compile(r"^/(privacy|trust|support|contact|about|faqs|partners|engagement-models)"), "legal/utility/about"),
    (re.compile(r"\.htm$|\.html$"), "legacy .htm/.html cruft"),
]


def section_of(path):
    for rx, name in SECTION_OF:
        if rx.search(path):
            return name
    if path == "/":
        return "legal/utility/about"
    return "other"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("csv", help="GSC 'Crawled - currently not indexed' Table.csv")
    ap.add_argument("--md", default=os.path.join(ROOT, "reports", "gsc-crawled-not-indexed-audit.md"))
    ap.add_argument("--json", default="")
    ap.add_argument("--thin-words", type=int, default=250,
                    help="word count below which a 200 page is flagged thin (default 250)")
    args = ap.parse_args()

    rows = []
    with open(args.csv, newline="", encoding="utf-8-sig") as fh:
        for r in csv.DictReader(fh):
            url = (r.get("URL") or r.get("url") or "").strip()
            if url:
                rows.append((url, r.get("Last crawled", ""), r.get("Status", "")))

    gone, redirects = load_htaccess_rules()
    sitemap = load_sitemap_paths()
    inbound = build_inbound_index()

    records = []
    for url, last_crawled, status in rows:
        scheme, path = normalize(url)
        code, detail = predict_disposition(path, gone, redirects)
        fp = repo_file_for(path) if code == 200 else None
        rec = {
            "url": url, "scheme": scheme, "path": path,
            "last_crawled": last_crawled, "gsc_status": status,
            "disposition": code, "disposition_detail": detail,
            "repo_file": ("/" + os.path.relpath(fp, ROOT)) if fp else None,
            "in_sitemap": path in sitemap,
            "inbound": inbound.get(path, 0),
            "facts": page_facts(fp) if fp else None,
            "http_only_dup": scheme == "http",
        }
        action, reason = classify(rec, args.thin_words)
        rec["action"], rec["reason"] = action, reason
        rec["section"] = section_of(path)
        records.append(rec)

    # duplicate title / description across the *200* affected pages
    by_title, by_desc = defaultdict(list), defaultdict(list)
    for r in records:
        if r["facts"]:
            if r["facts"]["title"]:
                by_title[r["facts"]["title"]].append(r["path"])
            if r["facts"]["desc"]:
                by_desc[r["facts"]["desc"]].append(r["path"])
    dup_titles = {k: v for k, v in by_title.items() if len(v) > 1}
    dup_descs = {k: v for k, v in by_desc.items() if len(v) > 1}

    # conflicts
    conflicts = []
    for r in records:
        if r["in_sitemap"] and r["disposition"] in (301, 410, 404):
            conflicts.append(f"{r['path']} is in sitemap but predicted {r['disposition']}")
        if r["facts"] and r["facts"]["noindex"] and r["in_sitemap"]:
            conflicts.append(f"{r['path']} is noindex but in sitemap")
        if r["facts"] and r["facts"]["h1_count"] != 1:
            conflicts.append(f"{r['path']} has {r['facts']['h1_count']} <h1> tags")

    # ---- write report ----
    counts = defaultdict(int)
    for r in records:
        counts[r["action"]] += 1
    sec_counts = defaultdict(int)
    for r in records:
        sec_counts[r["section"]] += 1

    L = []
    A = L.append
    A("# GSC “Crawled – currently not indexed” — static remediation audit\n")
    A(f"Source CSV: `{os.path.relpath(args.csv, ROOT)}`  ")
    A(f"Affected URLs: **{len(records)}**  ")
    A(f"Thin-content threshold: <{args.thin_words} words  ")
    A("Disposition is *predicted* from committed `.htaccess` + files on disk (offline).\n")

    A("## Action summary\n")
    A("| Action | Count | Meaning |")
    A("|---|---:|---|")
    meanings = {
        "A_IMPROVE": "Keep indexable; improve content / internal links",
        "B_CANONICAL": "Consolidate via canonical",
        "C_REDIRECT": "301 redirect (already or should be)",
        "D_NOINDEX": "Noindex + drop from sitemap",
        "E_GONE": "410/404 legacy cruft — correctly not indexed",
        "OK_INDEXABLE": "Healthy 200; crawl-budget/authority delay",
        "NOT_FOUND": "No file, no rule — investigate",
    }
    for k in ["OK_INDEXABLE", "A_IMPROVE", "B_CANONICAL", "C_REDIRECT", "D_NOINDEX", "E_GONE", "NOT_FOUND"]:
        if counts.get(k):
            A(f"| {k} | {counts[k]} | {meanings[k]} |")
    A("")

    A("## By section\n")
    A("| Section | Count |")
    A("|---|---:|")
    for s, n in sorted(sec_counts.items(), key=lambda x: -x[1]):
        A(f"| {s} | {n} |")
    A("")

    A("## Predicted server disposition\n")
    disp = defaultdict(int)
    for r in records:
        disp[r["disposition"]] += 1
    A("| HTTP | Count |")
    A("|---:|---:|")
    for c in sorted(disp):
        A(f"| {c} | {disp[c]} |")
    A("")

    if conflicts:
        A("## ⚠️ Conflicts (sitemap / noindex / h1)\n")
        for c in sorted(set(conflicts)):
            A(f"- {c}")
        A("")
    else:
        A("## Conflicts\n\nNone detected (no sitemap URL redirects/410s/404s/noindexes; every 200 page has exactly one `<h1>`).\n")

    if dup_titles or dup_descs:
        A("## Duplicate metadata among affected pages\n")
        for t, ps in dup_titles.items():
            A(f"- **title** `{t}` shared by: {', '.join(ps)}")
        for d, ps in dup_descs.items():
            A(f"- **description** shared by: {', '.join(ps)}")
        A("")
    else:
        A("## Duplicate metadata among affected pages\n\nNone among the affected 200 pages.\n")

    # detail tables: real 200 pages first (actionable), then the rest compact
    A("## Real (200) pages — the actionable set\n")
    A("| Path | Action | Words | Inbound | Title len | Desc len | In sitemap | Reason |")
    A("|---|---|---:|---:|---:|---:|:--:|---|")
    for r in sorted([x for x in records if x["disposition"] == 200], key=lambda x: x["path"]):
        f = r["facts"]
        A(f"| `{r['path']}` | {r['action']} | {f['words']} | {r['inbound']} | "
          f"{len(f['title'])} | {len(f['desc'])} | {'yes' if r['in_sitemap'] else 'no'} | {r['reason']} |")
    A("")

    A("## Redirected / 410 / 404 URLs (no action needed unless noted)\n")
    A("| Path | HTTP | Detail |")
    A("|---|---:|---|")
    for r in sorted([x for x in records if x["disposition"] != 200], key=lambda x: (x["disposition"], x["path"])):
        A(f"| `{r['path']}` | {r['disposition']} | {r['disposition_detail']} |")
    A("")

    os.makedirs(os.path.dirname(args.md), exist_ok=True)
    open(args.md, "w", encoding="utf-8").write("\n".join(L) + "\n")
    print(f"wrote {os.path.relpath(args.md, ROOT)}  ({len(records)} URLs)")

    if args.json:
        os.makedirs(os.path.dirname(args.json), exist_ok=True)
        json.dump({
            "source_csv": os.path.relpath(args.csv, ROOT),
            "affected": len(records),
            "action_counts": dict(counts),
            "section_counts": dict(sec_counts),
            "disposition_counts": {str(k): v for k, v in disp.items()},
            "conflicts": sorted(set(conflicts)),
            "duplicate_titles": dup_titles,
            "duplicate_descriptions": dup_descs,
            "records": records,
        }, open(args.json, "w", encoding="utf-8"), indent=2)
        print(f"wrote {os.path.relpath(args.json, ROOT)}")

    # console summary
    print("\nAction counts:", dict(counts))
    print("Disposition:", {str(k): v for k, v in disp.items()})
    if conflicts:
        print(f"CONFLICTS: {len(set(conflicts))}")


if __name__ == "__main__":
    main()
