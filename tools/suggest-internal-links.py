#!/usr/bin/env python3
"""Internal-link suggester for under-linked modern blog posts.

Scans every modern blog HTML page, counts the internal links already present in
the article body, and proposes new link targets based on:

  - shared category / tag with another modern blog post
  - keyword hits against the canonical product / service / solution /
    technology / reference / tool URL set
  - the post is not already linking to that target
  - the target is not the post itself, an archive variant, or a redirected URL

Output:
  - human-readable report on stdout
  - JSON report at tools/reports/internal-link-suggestions.json (optional)

Deterministic. Reads only the on-disk repo. No external APIs, no ML.

    python3 tools/suggest-internal-links.py
    python3 tools/suggest-internal-links.py --threshold 6
    python3 tools/suggest-internal-links.py --json tools/reports/internal-link-suggestions.json
"""
import argparse, json, os, re, sys
from collections import defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

A_HREF_RE = re.compile(r'<a\s+[^>]*href="(/[^"#]*?)"', re.IGNORECASE)
ARTICLE_RE = re.compile(r"<article[^>]*>(.*?)</article>", re.DOTALL | re.IGNORECASE)
MAIN_RE = re.compile(r"<main[^>]*>(.*?)</main>", re.DOTALL | re.IGNORECASE)
TITLE_RE = re.compile(r"<title>([^<]+)</title>", re.IGNORECASE)
HEADING_RE = re.compile(r"<h[1-3][^>]*>(.*?)</h[1-3]>", re.DOTALL | re.IGNORECASE)
TAG_RE = re.compile(r"<[^>]+>", re.DOTALL)

DEFAULT_THRESHOLD = 5  # warn when a post has fewer internal links than this

# Heuristic keyword → canonical-URL map. The keyword is matched against the
# post body (case-insensitive). The URL is the canonical recommendation.
KEYWORD_TARGETS = {
    # Products
    "OnePass Card":               "/products/onepass-card/",
    "OnePass Platform":           "/products/onepass-platform/",
    "OnePass USB":                "/products/onepass-usb-key/",
    "OnePass Bio":                "/products/onepass-bio-card/",
    "BioKey":                     "/products/biokey/",
    "JavaCard Applet":            "/products/javacard-applets/",
    "IoT Security Chipset":       "/products/iot-security-chipset/",
    # Services
    "FIDO validation server":     "/services/fido-validation-server/",
    "JavaCard development":       "/services/javacard-development/",
    "tool chain":                 "/services/tool-chain-development/",
    # Solutions
    "passwordless enterprise":    "/solutions/passwordless-enterprise/",
    "phishing-resistant":         "/solutions/phishing-resistant-authentication/",
    "government identity":        "/solutions/government-identity/",
    "workforce identity":         "/solutions/workforce-identity/",
    "closed-loop transit":        "/solutions/closed-loop-ticketing/",
    "smart-card personalization": "/solutions/smart-card-personalization/",
    "offline authentication":     "/solutions/offline-authentication/",
    "secure validator":           "/solutions/secure-validator-platforms/",
    # Technologies
    "WebAuthn":                   "/technologies/webauthn/",
    "FIDO2":                      "/technologies/fido2/",
    "CTAP2":                      "/technologies/ctap2/",
    "passkey":                    "/technologies/passkeys/",
    "attestation":                "/technologies/attestation/",
    "JavaCard":                   "/technologies/javacard/",
    "DESFire":                    "/technologies/desfire/",
    "SAM":                        "/technologies/sam/",
    "secure element":             "/technologies/secure-elements/",
    "card reader":                "/technologies/card-reader-sam-flow/",
    # References
    "AAGUID":                     "/references/aaguids/",
    "APDU":                       "/references/apdu-status/",
    "ASN.1":                      "/references/asn1/",
    "ISO 7816":                   "/references/iso7816/",
    "COSE":                       "/references/webauthn-cose/",
    "X.509":                      "/references/x509-extensions/",
    "GlobalPlatform":             "/references/globalplatform/",
    "EMV":                        "/references/emv-tags/",
    "NFC":                        "/references/nfc/",
    "CAP file":                   "/references/javacard-cap/",
    # Tool surface (one entry — the rest are discoverable via /resources/)
    "attestation decoder":        "/resources/tools/attestation-decoder/",
}

def load_blogs():
    with open(os.path.join(ROOT, "assets/data/blogs.json")) as f:
        return json.load(f)["entries"]

def load_redirects():
    """Return the set of source paths that .htaccess redirects (so we never
    suggest linking to a redirected URL)."""
    redirects = set()
    htaccess = os.path.join(ROOT, ".htaccess")
    if not os.path.exists(htaccess):
        return redirects
    with open(htaccess) as f:
        for line in f:
            line = line.strip()
            if line.startswith("Redirect 301 "):
                parts = line.split()
                if len(parts) >= 3:
                    redirects.add(parts[2])
    return redirects

def article_body(html):
    m = ARTICLE_RE.search(html) or MAIN_RE.search(html)
    return m.group(1) if m else html

def existing_links(body):
    return set(A_HREF_RE.findall(body))

def text_only(body):
    text = TAG_RE.sub(" ", body)
    return re.sub(r"\s+", " ", text).strip()

def keyword_suggestions(text, existing, self_url, redirects):
    out = []
    low = text.lower()
    for kw, url in KEYWORD_TARGETS.items():
        if url == self_url or url in existing or url in redirects:
            continue
        # Word-bounded match (case-insensitive), so "SAM" doesn't match inside
        # "names" and "FIDO" doesn't match inside "fidonet".
        pat = r"\b" + re.escape(kw.lower()) + r"\b"
        if re.search(pat, low):
            out.append((url, f"mentions '{kw}'"))
    return out

def overlap_suggestions(entry, blogs, existing, redirects):
    """Suggest other modern blogs that share at least one category or tag."""
    out = []
    self_cats = set(entry.get("categories", []))
    self_tags = set(entry.get("tags", []))
    for other in blogs:
        if other["url"] == entry["url"]:
            continue
        if other.get("type") != "modern":
            continue
        if other["url"] in existing or other["url"] in redirects:
            continue
        cat_overlap = self_cats & set(other.get("categories", []))
        tag_overlap = self_tags & set(other.get("tags", []))
        if not (cat_overlap or tag_overlap):
            continue
        reason_bits = []
        if cat_overlap:
            reason_bits.append("category " + "/".join(sorted(cat_overlap)))
        if tag_overlap:
            reason_bits.append("tag " + "/".join(sorted(tag_overlap)))
        out.append((other["url"], "; ".join(reason_bits), len(cat_overlap) + len(tag_overlap)))
    out.sort(key=lambda r: -r[2])
    return [(u, r) for u, r, _ in out[:5]]

def priority(current_count, threshold):
    if current_count <= 2:
        return "high"
    if current_count < threshold:
        return "medium"
    return "low"

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--threshold", type=int, default=DEFAULT_THRESHOLD,
                    help=f"Minimum internal links per modern blog (default {DEFAULT_THRESHOLD})")
    ap.add_argument("--json", metavar="PATH", help="Also write JSON report to PATH")
    ap.add_argument("--include-archive", action="store_true",
                    help="Also scan historical /blog/archive/ posts")
    args = ap.parse_args()

    blogs = load_blogs()
    redirects = load_redirects()

    rows = []
    for entry in blogs:
        url = entry["url"]
        if entry.get("type") != "modern" and not args.include_archive:
            continue
        rel = url.strip("/")
        path = os.path.join(ROOT, rel, "index.html")
        if not os.path.exists(path):
            continue
        with open(path) as f:
            html = f.read()
        body = article_body(html)
        existing = existing_links(body)
        text = text_only(body)

        suggestions = []
        for u, r in keyword_suggestions(text, existing, url, redirects):
            suggestions.append({"target": u, "reason": r})
        for u, r in overlap_suggestions(entry, blogs, existing, redirects):
            suggestions.append({"target": u, "reason": r})

        # Drop duplicate targets (keyword + overlap can overlap).
        seen = set()
        deduped = []
        for s in suggestions:
            if s["target"] in seen:
                continue
            seen.add(s["target"])
            deduped.append(s)

        rows.append({
            "path": url,
            "title": entry.get("title", ""),
            "type": entry.get("type", "modern"),
            "current_internal_links": len(existing),
            "priority": priority(len(existing), args.threshold),
            "suggestions": deduped,
        })

    rows.sort(key=lambda r: (r["priority"] != "high", r["priority"] != "medium",
                              r["current_internal_links"]))

    # Console report
    print(f"suggest-internal-links: scanned {len(rows)} modern blog post(s)")
    print(f"  threshold: {args.threshold} internal links")
    high = sum(1 for r in rows if r["priority"] == "high")
    med  = sum(1 for r in rows if r["priority"] == "medium")
    print(f"  high priority: {high}   medium: {med}   low: {len(rows) - high - med}")
    print()
    for r in rows:
        if r["priority"] == "low" and not args.json:
            continue
        print(f"[{r['priority'].upper():<6}] {r['path']}   ({r['current_internal_links']} link(s))")
        print(f"        {r['title']}")
        for s in r["suggestions"][:8]:
            print(f"          → {s['target']}  ({s['reason']})")
        print()

    if args.json:
        out_path = args.json
        os.makedirs(os.path.dirname(out_path), exist_ok=True)
        with open(out_path, "w") as f:
            json.dump({
                "threshold": args.threshold,
                "rows": rows,
            }, f, indent=2)
        print(f"JSON report: {out_path}")

if __name__ == "__main__":
    main()
