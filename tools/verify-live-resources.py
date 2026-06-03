#!/usr/bin/env python3
"""Verify the LIVE AmbiSecure site against repo/build expectations for the
resource tools. Read-only HTTP checks — never deploys or modifies production.

Checks (see the implementation prompt for the full spec):
  A. Live availability of each tool page (status, canonical, noindex, H1,
     body content, tool UI markers, no "SOON").
  B. Resources hub links every tool, no SOON, descriptions present, no broken
     same-origin links.
  C. sitemap.xml has every tool URL; robots.txt doesn't block /resources/.
  D. Same-origin critical CSS/JS assets on each page return 200.

NOTE on URLs: the deployed tool pages live at /resources/tools/<slug>/ (the
repo's established pattern), NOT /resources/<slug>/. Two tools were resolved
by relinking to pre-existing equivalents rather than building duplicates:
  - "CAP File Inspector" -> /resources/tools/javacard-cap/
  - "CBOR Parser"        -> /resources/tools/cbor-decoder/

    python3 tools/verify-live-resources.py \
        --base-url https://ambisecure.ambimat.com \
        --timeout 20 \
        --json-output docs/audits/live-resource-verification.json \
        --md-output docs/audits/live-resource-verification.md

Exit code 0 = all critical checks pass, 1 = at least one critical failure.
"""
import argparse
import json
import os
import re
import ssl
import sys
import time
import urllib.request
import urllib.error
from datetime import datetime, timezone

UA = "AmbiSecure-LiveVerifier/1.0 (+verification; read-only)"
# The host throttles rapid sequential requests, substituting a short body that
# resolves to /resources/. A small inter-request delay avoids tripping it.
REQUEST_DELAY = 0.4

# label = how the tool is presented; slug = actual deployed path segment under
# /resources/tools/<slug>/; relink_of = original SOON name if this is a relink.
TOOLS = [
    {"label": "APDU Builder",            "slug": "apdu-builder"},
    {"label": "CAP File Inspector",      "slug": "javacard-cap",    "relink_of": "cap-file-inspector"},
    {"label": "SCP03 Helper",            "slug": "scp03-helper"},
    {"label": "Base32",                  "slug": "base32"},
    {"label": "URL Encoder",             "slug": "url-encoder"},
    {"label": "CRC Calculator",          "slug": "crc-calculator"},
    {"label": "LRC Calculator",          "slug": "lrc-calculator"},
    {"label": "Checksum",                "slug": "checksum"},
    {"label": "SHA Hash Generator",      "slug": "sha-hash-generator"},
    {"label": "RSA Key Formats",         "slug": "rsa-key-formats"},
    {"label": "ECC Curve Reference",     "slug": "ecc-curve-reference"},
    {"label": "ICCID Decoder",           "slug": "iccid-decoder"},
    {"label": "IMSI Decoder",            "slug": "imsi-decoder"},
    {"label": "eUICC EID Decoder",       "slug": "euicc-eid-decoder"},
    {"label": "JSON Formatter",          "slug": "json-formatter"},
    {"label": "JSON Validator",          "slug": "json-validator"},
    {"label": "CBOR Parser",             "slug": "cbor-decoder",    "relink_of": "cbor-parser"},
    {"label": "XML Formatter",           "slug": "xml-formatter"},
    {"label": "Binary Calculator",       "slug": "binary-calculator"},
    {"label": "Byte-offset Calculator",  "slug": "byte-offset-calculator"},
]

CANON_RE = re.compile(r'<link[^>]+rel=["\']canonical["\'][^>]*href=["\']([^"\']+)["\']', re.I)
NOINDEX_RE = re.compile(r'<meta[^>]+name=["\']robots["\'][^>]*content=["\']([^"\']*)["\']', re.I)
H1_RE = re.compile(r'<h1[^>]*>(.*?)</h1>', re.I | re.S)
TITLE_RE = re.compile(r'<title>([^<]+)</title>', re.I)
MAIN_RE = re.compile(r'<main\b[^>]*>(.*?)</main>', re.I | re.S)
TAG_RE = re.compile(r'<[^>]+>')
HREF_RE = re.compile(r'href=["\'](/[^"\'#?]*)["\']')
ASSET_RE = re.compile(r'(?:href|src)=["\'](/assets/[^"\']+\.(?:css|js))["\']', re.I)
SCRIPT_BLOCK_RE = re.compile(r'<script\b[^>]*>.*?</script>', re.I | re.S)
STYLE_BLOCK_RE = re.compile(r'<style\b[^>]*>.*?</style>', re.I | re.S)


def make_opener():
    ctx = ssl.create_default_context()
    return urllib.request.build_opener(urllib.request.HTTPSHandler(context=ctx))


OPENER = make_opener()


def fetch(url, timeout, method="GET", retries=2):
    """Return dict(status, final_url, body, error). Follows redirects.

    Always reads the FULL response body and sends Connection: close — a
    previous version did partial reads (max_bytes) on a reused keep-alive
    connection, which left unread bytes that corrupted the next request's
    response. We also retry transient empty/failed reads (the host throttles
    rapid sequential requests, which otherwise looked like broken pages)."""
    last = {"status": 0, "final_url": url, "body": "", "error": "no attempt"}
    for attempt in range(retries + 1):
        time.sleep(REQUEST_DELAY)
        req = urllib.request.Request(
            url, headers={"User-Agent": UA, "Connection": "close"}, method=method)
        try:
            with OPENER.open(req, timeout=timeout) as resp:
                raw = resp.read()  # full read — never partial
                body = raw.decode("utf-8", errors="replace") if method == "GET" else ""
                last = {"status": resp.status, "final_url": resp.geturl(),
                        "body": body, "error": None}
                # A 200 with an empty body is almost always transient throttling.
                if resp.status == 200 and method == "GET" and len(body) < 50 and attempt < retries:
                    continue
                return last
        except urllib.error.HTTPError as e:
            return {"status": e.code, "final_url": url, "body": "", "error": f"HTTP {e.code}"}
        except Exception as e:  # noqa: BLE001
            last = {"status": 0, "final_url": url, "body": "", "error": str(e)}
    return last


def text_of(html_fragment):
    no_s = SCRIPT_BLOCK_RE.sub(" ", html_fragment)
    no_s = STYLE_BLOCK_RE.sub(" ", no_s)
    return re.sub(r"\s+", " ", TAG_RE.sub(" ", no_s)).strip()


def check_page(base, tool, timeout, asset_cache):
    path = f"/resources/tools/{tool['slug']}/"
    url = base + path
    r = fetch(url, timeout)
    # Throttle mitigation: a correctly-deployed page always carries its own
    # canonical. If we got a substitute body (canonical missing or pointing
    # elsewhere), re-fetch a few times before trusting it.
    for _ in range(3):
        m = CANON_RE.search(r["body"])
        if r["status"] == 200 and m and m.group(1).rstrip("/") == url.rstrip("/"):
            break
        time.sleep(1.5)
        r = fetch(url, timeout, retries=1)
    res = {
        "label": tool["label"], "slug": tool["slug"], "url": url,
        "relink_of": tool.get("relink_of"),
        "status": r["status"], "final_url": r["final_url"],
        "checks": {}, "critical_fail": [], "warn": [],
    }
    c = res["checks"]
    html = r["body"]

    # status 200
    c["http_200"] = (r["status"] == 200)
    if not c["http_200"]:
        res["critical_fail"].append(f"HTTP {r['status']}")
        return res

    # no unexpected redirect away from canonical path
    c["no_offsite_redirect"] = r["final_url"].rstrip("/") == url.rstrip("/")
    if not c["no_offsite_redirect"]:
        res["warn"].append(f"redirected to {r['final_url']}")

    # not Hostinger/default/404 content
    low = html.lower()
    c["not_parking_page"] = not any(s in low for s in (
        "this domain is parked", "hostinger", "index of /", "default web page",
        "apache2 debian default", "page not found", "404 not found"))
    if not c["not_parking_page"]:
        res["critical_fail"].append("looks like parking/default/404 content")

    # canonical correct
    m = CANON_RE.search(html)
    canon = m.group(1) if m else None
    c["canonical"] = canon
    c["canonical_ok"] = (canon is not None and canon.rstrip("/") == url.rstrip("/"))
    if not c["canonical_ok"]:
        res["critical_fail"].append(f"canonical mismatch: {canon}")

    # noindex absent
    m = NOINDEX_RE.search(html)
    c["noindex_absent"] = not (m and "noindex" in m.group(1).lower())
    if not c["noindex_absent"]:
        res["critical_fail"].append("page carries noindex")

    # H1 + title
    m = H1_RE.search(html)
    h1 = text_of(m.group(1)) if m else ""
    c["h1"] = h1
    c["has_h1"] = bool(h1)
    if not c["has_h1"]:
        res["critical_fail"].append("missing H1")
    m = TITLE_RE.search(html)
    c["title"] = m.group(1).strip() if m else ""
    c["has_title"] = bool(c["title"])
    if not c["has_title"]:
        res["critical_fail"].append("missing <title>")

    # useful body content (word count inside <main>)
    mm = MAIN_RE.search(html)
    body_words = len(text_of(mm.group(1)).split()) if mm else len(text_of(html).split())
    c["main_word_count"] = body_words
    # Genuinely broken/empty pages have <40 words. JS-driven shell tools
    # (e.g. relinked javacard-cap / cbor-decoder) are intentionally lean and
    # pass the repo's own audits, so only flag near-empty pages as critical.
    c["has_body_content"] = body_words >= 40
    if not c["has_body_content"]:
        res["critical_fail"].append(f"near-empty body ({body_words} words)")
    elif body_words < 250:
        res["warn"].append(f"lean content ({body_words} words) — JS-shell tool")

    # tool UI markers
    markers = {
        "textarea": html.lower().count("<textarea"),
        "select": html.lower().count("<select"),
        "input": html.lower().count("<input"),
        "button": html.lower().count("<button"),
    }
    c["ui_markers"] = markers
    c["has_tool_ui"] = (markers["textarea"] + markers["select"] + markers["input"] + markers["button"]) > 0
    if not c["has_tool_ui"]:
        res["critical_fail"].append("no interactive tool UI markers")

    # SOON absent on the page itself
    c["soon_absent"] = ">soon<" not in low and "soon-tile" not in low
    if not c["soon_absent"]:
        res["critical_fail"].append('page still shows "SOON"')

    # assets on this page
    assets = sorted(set(ASSET_RE.findall(html)))
    bad_assets = []
    for a in assets:
        if a not in asset_cache:
            ar = fetch(base + a, timeout, method="GET")
            asset_cache[a] = ar["status"]
        if asset_cache[a] != 200:
            bad_assets.append(f"{a} -> {asset_cache[a]}")
    c["assets_checked"] = len(assets)
    c["bad_assets"] = bad_assets
    c["assets_ok"] = not bad_assets
    if bad_assets:
        res["critical_fail"].append(f"{len(bad_assets)} asset(s) not 200")

    res["passed"] = not res["critical_fail"]
    return res


def check_hub(base, timeout):
    url = base + "/resources/"
    r = fetch(url, timeout)
    out = {"url": url, "status": r["status"], "critical_fail": [], "warn": [], "checks": {}}
    if r["status"] != 200:
        out["critical_fail"].append(f"resources hub HTTP {r['status']}")
        return out
    html = r["body"]
    # all 20 tool target paths linked
    missing = []
    for t in TOOLS:
        path = f"/resources/tools/{t['slug']}/"
        if f'href="{path}"' not in html and f"href='{path}'" not in html:
            missing.append(t["label"])
    out["checks"]["all_tools_linked"] = not missing
    out["checks"]["missing_links"] = missing
    if missing:
        out["critical_fail"].append(f"hub missing links: {missing}")
    # no SOON
    low = html.lower()
    out["checks"]["soon_absent"] = ">soon<" not in low and "soon-tile" not in low
    if not out["checks"]["soon_absent"]:
        out["critical_fail"].append("hub still shows SOON cards")
    # broken same-origin links (dedupe; HEAD/GET)
    links = sorted(set(HREF_RE.findall(html)))
    broken = []
    for h in links:
        rr = fetch(base + h, timeout, method="GET")
        if rr["status"] not in (200, 301, 302):
            broken.append(f"{h} -> {rr['status']}")
    out["checks"]["links_checked"] = len(links)
    out["checks"]["broken_links"] = broken
    if broken:
        out["critical_fail"].append(f"{len(broken)} broken hub link(s)")
    out["passed"] = not out["critical_fail"]
    return out


def check_sitemap(base, timeout):
    url = base + "/sitemap.xml"
    r = fetch(url, timeout)
    out = {"url": url, "status": r["status"], "critical_fail": [], "warn": [], "checks": {}}
    if r["status"] != 200:
        out["critical_fail"].append(f"sitemap HTTP {r['status']}")
        return out
    locs = re.findall(r"<loc>([^<]+)</loc>", r["body"])
    out["checks"]["loc_count"] = len(locs)
    locset = set(locs)
    missing = []
    for t in TOOLS:
        u = base + f"/resources/tools/{t['slug']}/"
        if u not in locset:
            missing.append(t["label"])
    out["checks"]["all_tools_in_sitemap"] = not missing
    out["checks"]["missing_from_sitemap"] = missing
    if missing:
        out["critical_fail"].append(f"sitemap missing: {missing}")
    bad = [u for u in locs if not re.match(r"^https://[^/]+/", u)]
    out["checks"]["non_absolute_locs"] = bad
    if bad:
        out["critical_fail"].append(f"{len(bad)} non-absolute sitemap loc(s)")
    out["passed"] = not out["critical_fail"]
    return out


def check_robots(base, timeout):
    url = base + "/robots.txt"
    r = fetch(url, timeout)
    out = {"url": url, "status": r["status"], "critical_fail": [], "warn": [], "checks": {}}
    if r["status"] != 200:
        out["warn"].append(f"robots.txt HTTP {r['status']}")
        return out
    body = r["body"]
    blocks_resources = bool(re.search(r"(?im)^\s*Disallow:\s*/resources", body))
    blocks_all = bool(re.search(r"(?im)^\s*Disallow:\s*/\s*$", body))
    out["checks"]["blocks_resources"] = blocks_resources
    out["checks"]["blocks_entire_site"] = blocks_all
    if blocks_resources:
        out["critical_fail"].append("robots.txt blocks /resources")
    if blocks_all:
        out["critical_fail"].append("robots.txt Disallow: / blocks whole site")
    out["passed"] = not out["critical_fail"]
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--base-url", default="https://ambisecure.ambimat.com")
    ap.add_argument("--timeout", type=int, default=20)
    ap.add_argument("--json-output", default="docs/audits/live-resource-verification.json")
    ap.add_argument("--md-output", default="docs/audits/live-resource-verification.md")
    args = ap.parse_args()
    base = args.base_url.rstrip("/")

    asset_cache = {}
    pages = [check_page(base, t, args.timeout, asset_cache) for t in TOOLS]
    hub = check_hub(base, args.timeout)
    sm = check_sitemap(base, args.timeout)
    robots = check_robots(base, args.timeout)

    crit = sum(len(p["critical_fail"]) for p in pages) + len(hub["critical_fail"]) \
        + len(sm["critical_fail"]) + len(robots["critical_fail"])
    warns = sum(len(p["warn"]) for p in pages) + len(hub["warn"]) + len(sm["warn"]) + len(robots["warn"])
    pages_pass = sum(1 for p in pages if p.get("passed"))

    report = {
        "base_url": base,
        "generated_utc": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "summary": {
            "pages_total": len(pages), "pages_passed": pages_pass,
            "critical_failures": crit, "warnings": warns,
            "hub_pass": hub.get("passed", False), "sitemap_pass": sm.get("passed", False),
            "robots_pass": robots.get("passed", False),
        },
        "pages": pages, "hub": hub, "sitemap": sm, "robots": robots,
    }

    # JSON
    os.makedirs(os.path.dirname(args.json_output), exist_ok=True)
    with open(args.json_output, "w") as f:
        json.dump(report, f, indent=2)

    # Markdown
    def yn(b):
        return "✅" if b else "❌"
    lines = [
        f"# Live resource verification — {base}", "",
        f"Generated: {report['generated_utc']}", "",
        f"- Pages passed: **{pages_pass}/{len(pages)}**",
        f"- Critical failures: **{crit}**",
        f"- Warnings: **{warns}**",
        f"- Hub: {yn(hub.get('passed'))} · Sitemap: {yn(sm.get('passed'))} · robots.txt: {yn(robots.get('passed'))}",
        "",
        "| Tool | URL | 200 | canon | noindex✗ | SOON✗ | UI | words | assets | notes |",
        "|------|-----|----|------|---------|------|----|------|-------|-------|",
    ]
    for p in pages:
        c = p["checks"]
        note = ""
        if p.get("relink_of"):
            note = f"relink of {p['relink_of']}"
        if p["critical_fail"]:
            note = (note + "; " if note else "") + "; ".join(p["critical_fail"])
        lines.append(
            f"| {p['label']} | {p['url'].replace(base,'')} | {yn(c.get('http_200'))} | "
            f"{yn(c.get('canonical_ok'))} | {yn(c.get('noindex_absent'))} | {yn(c.get('soon_absent'))} | "
            f"{yn(c.get('has_tool_ui'))} | {c.get('main_word_count','-')} | "
            f"{yn(c.get('assets_ok'))} | {note} |")
    lines += ["", "## Hub", f"- linked all tools: {yn(hub['checks'].get('all_tools_linked'))} "
              f"(missing: {hub['checks'].get('missing_links')})",
              f"- SOON absent: {yn(hub['checks'].get('soon_absent'))}",
              f"- links checked: {hub['checks'].get('links_checked')}, broken: {hub['checks'].get('broken_links')}",
              "", "## Sitemap",
              f"- locs: {sm['checks'].get('loc_count')}, all tools present: {yn(sm['checks'].get('all_tools_in_sitemap'))} "
              f"(missing: {sm['checks'].get('missing_from_sitemap')})",
              "", "## robots.txt",
              f"- blocks /resources: {robots['checks'].get('blocks_resources')}, "
              f"blocks site: {robots['checks'].get('blocks_entire_site')}"]
    with open(args.md_output, "w") as f:
        f.write("\n".join(lines) + "\n")

    # Console
    print(f"=== Live verification: {base} ===")
    print(f"Pages passed: {pages_pass}/{len(pages)} | critical failures: {crit} | warnings: {warns}")
    for p in pages:
        flag = "PASS" if p.get("passed") else "FAIL"
        extra = (" :: " + "; ".join(p["critical_fail"])) if p["critical_fail"] else ""
        rl = f" (relink of {p['relink_of']})" if p.get("relink_of") else ""
        print(f"  [{flag}] {p['label']}{rl} -> {p['status']} {p['url'].replace(base,'')}{extra}")
    print(f"  [{'PASS' if hub.get('passed') else 'FAIL'}] resources hub")
    print(f"  [{'PASS' if sm.get('passed') else 'FAIL'}] sitemap.xml")
    print(f"  [{'PASS' if robots.get('passed') else 'FAIL'}] robots.txt")
    print(f"JSON: {args.json_output}\nMD:   {args.md_output}")

    return 1 if crit > 0 else 0


if __name__ == "__main__":
    sys.exit(main())
