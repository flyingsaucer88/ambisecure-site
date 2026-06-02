#!/usr/bin/env python3
"""Spam / SEO-injection / cloaking audit for the AmbiSecure static site.

This is a defensive integrity scan, not an exploit-test. It walks every
HTML, JS, CSS, JSON, XML, TXT and .htaccess file in the deployable tree
and looks for fingerprints of:

  - Japanese-keyword-hack / pharma / casino / payday spam payloads
  - Obfuscated JS (eval / atob / unescape / fromCharCode / hex blobs)
  - PHP / shell signatures (site is static; any hit = compromise)
  - Hidden text spam (display:none / visibility:hidden / off-screen / 1px)
  - Cloaking surfaces (User-Agent branching, Googlebot conditionals)
  - Meta-refresh redirects outside the one known legacy stub
  - Sitemap / robots.txt poisoning (non-canonical hosts, foreign locs)
  - Stray dangerous files (.php, .bak, .old, .sql, .zip, .env...)
  - Author-enumeration / WP probe surfaces accidentally present
  - llms.txt / llms-full.txt drift toward spammy content

Skipped paths (mirror the build-package excludes):
  /.git, /dist, /legacysitedata, /_internal, /tools, /docs, /scripts,
  /node_modules, /.github, /.githooks, /.claude

Exit 0 = clean, 1 = potential indicator found, 2 = scan error.

    python3 tools/audit-spam-seo.py
    python3 tools/audit-spam-seo.py --strict   # also flag soft warnings
    python3 tools/audit-spam-seo.py --quiet
"""
import argparse
import os
import re
import sys
from collections import defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

# Directories that are NEVER shipped to Hostinger — anything inside is
# allowed to contain dev artifacts, archive scans, vendor strings, etc.
SKIP_DIRS = {
    ".git", ".github", ".githooks", ".claude", ".lighthouseci",
    "dist", "legacysitedata", "_internal", "tools", "docs", "scripts",
    "node_modules", "vendor", "Logos",
}

# Extensions we will scan for spam fingerprints.
SCAN_EXT = {".html", ".htm", ".js", ".css", ".json", ".xml", ".txt", ".webmanifest"}

# Files (relative to root) that are scanned even though their extension
# isn't in SCAN_EXT.
EXTRA_FILES = {".htaccess", "robots.txt", "sitemap.xml", "llms.txt", "llms-full.txt"}

# Known-good extensions/files at root that may contain otherwise-suspicious
# substrings legitimately. Maps relpath -> set of pattern names to ignore.
ALLOWLIST = {
    # Editorial: 2018 ATM-skimming incident reference uses the word "hacked".
    "blog/archive/cyber-attacks-in-india-part-1/index.html": {"hacked-by"},
    # The .htaccess INTENTIONALLY contains wp- patterns to 410-block probes.
    ".htaccess": {"wp-admin", "wp-login", "wp-content", "wp-includes", "xmlrpc",
                  "japanese-keyword-hack-comment", "eval-doc-string",
                  "base64-doc-string"},
    # robots.txt INTENTIONALLY disallows wp- probe paths for crawler hygiene.
    "robots.txt": {"wp-admin", "wp-login", "wp-content", "wp-includes", "xmlrpc"},
    # One legitimate meta-refresh stub for /products/iot-security-chipset/.
    "products/iot-security-chipset/index.html": {"meta-refresh"},
    # 404 page may name spam topics in copy.
    "404.html": {"japanese", "pharma"},
}

# Hard indicators — finding ANY of these in a shipped file is a fail.
HARD_PATTERNS = [
    # name, regex, severity
    ("japanese-kanji-spam",       re.compile(r"[぀-ヿ一-鿿]{3,}"), "hard"),
    ("pharma-keyword",            re.compile(r"\b(viagra|cialis|levitra|tadalafil|sildenafil)\b", re.I), "hard"),
    ("casino-keyword",            re.compile(r"\b(casino|baccarat|roulette|slot[\s-]?machine|pachinko)\b", re.I), "hard"),
    ("payday-keyword",            re.compile(r"\b(payday[\s-]?loan|payday[\s-]?lender|fast[\s-]?cash[\s-]?loan)\b", re.I), "hard"),
    ("hacked-by",                 re.compile(r"\bhacked[\s-]?by\b", re.I), "hard"),
    ("php-open-tag",              re.compile(r"<\?php\b|<\?=|\?>\s*$"), "hard"),
    ("php-shell-signature",       re.compile(r"\b(c99shell|r57shell|wso\s?shell|b374k|FilesMan|Indoxploit)\b", re.I), "hard"),
    ("eval-base64",               re.compile(r"eval\s*\(\s*(atob|base64_decode|gzinflate)", re.I), "hard"),
    ("eval-fromcharcode",         re.compile(r"eval\s*\(\s*String\.fromCharCode", re.I), "hard"),
    ("preg-replace-e",            re.compile(r"preg_replace\s*\(\s*['\"][^'\"]*['\"][a-z]*e['\"a-z]*\s*,", re.I), "hard"),
    ("hex-blob-payload",          re.compile(r"(?:\\x[0-9a-fA-F]{2}){12,}"), "hard"),
    ("base64-blob-payload",       re.compile(r"['\"][A-Za-z0-9+/]{200,}={0,2}['\"]"), "hard"),
    ("googlebot-cloaking",        re.compile(r"(?i)\b(if\s*\(|when)\s*[^\)]*user[-_]?agent[^\)]*googlebot", re.I), "hard"),
    ("ua-branch-php",             re.compile(r"\$_SERVER\[\s*['\"]HTTP_USER_AGENT['\"]", re.I), "hard"),
    ("meta-refresh",              re.compile(r'<meta\s+http-equiv=["\']?refresh', re.I), "soft"),
    ("hidden-text-displaynone",   re.compile(r'style\s*=\s*"[^"]*display\s*:\s*none[^"]*"[^>]*>\s*[A-Za-z0-9].{30,}', re.I), "soft"),
    ("hidden-text-visibility",    re.compile(r'style\s*=\s*"[^"]*visibility\s*:\s*hidden[^"]*"[^>]*>\s*[A-Za-z0-9].{30,}', re.I), "soft"),
    ("offscreen-spam",            re.compile(r'style\s*=\s*"[^"]*(?:text-indent\s*:\s*-9\d{3}|left\s*:\s*-9\d{3})[^"]*"', re.I), "soft"),
    ("doc-write-script-src",      re.compile(r"document\.write\s*\(\s*['\"]<script", re.I), "hard"),
    # Probe surfaces — if any of these appear in the shipped tree as
    # actual file paths/contents, something is wrong. (.htaccess names
    # them on purpose and is exempt above.)
    ("wp-admin",                  re.compile(r"\bwp-admin\b", re.I), "soft"),
    ("wp-login",                  re.compile(r"\bwp-login\.php\b", re.I), "soft"),
    ("wp-content",                re.compile(r"\bwp-content\b", re.I), "soft"),
    ("wp-includes",               re.compile(r"\bwp-includes\b", re.I), "soft"),
    ("xmlrpc",                    re.compile(r"\bxmlrpc\.php\b", re.I), "soft"),
]

# Filename patterns that must NOT exist in the shipped tree.
FORBIDDEN_FILES = re.compile(
    r"\.(php[0-9s]?|phtml|phar|asp|aspx|jsp|cgi|pl|bak|old|orig|swp|swo|sql|sqlite|sqlite3|db|env|ini|log|sh|pem|key|crt|p12|pfx|map)$",
    re.IGNORECASE,
)

# Known-safe root files that match a forbidden extension but are never shipped
# (build-hostinger-package.sh excludes them) and contain no secrets. The real
# .deploy.env is gitignored and never present in a clean tree.
FORBIDDEN_EXEMPT = {"deploy.example.env"}

# Sitemap must contain only ambisecure.ambimat.com or pre-approved peer
# hosts (Ambimat parent, eSIM cousin). Anything else is poisoning.
ALLOWED_SITEMAP_HOSTS = {
    "ambisecure.ambimat.com",
    # Phase 7 redirects point at these external siblings, but they are
    # NOT supposed to appear inside sitemap.xml. Listed here only so a
    # future deliberate inclusion can be added.
}


def iter_targets():
    """Yield (relpath, abspath) for every file we want to scan."""
    for dirpath, dirs, files in os.walk(ROOT):
        # Prune skip dirs in-place.
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for name in files:
            if name == ".DS_Store":
                continue
            abspath = os.path.join(dirpath, name)
            relpath = os.path.relpath(abspath, ROOT)
            _, ext = os.path.splitext(name)
            if ext.lower() in SCAN_EXT or relpath in EXTRA_FILES or name in EXTRA_FILES:
                yield relpath, abspath


def scan_file(relpath, abspath, strict):
    """Return list of (severity, pattern_name, snippet) hits."""
    hits = []
    allow = ALLOWLIST.get(relpath, set())
    try:
        with open(abspath, "r", encoding="utf-8", errors="replace") as f:
            content = f.read()
    except OSError as e:
        return [("error", "read-failed", str(e))]

    for name, rx, severity in HARD_PATTERNS:
        if name in allow:
            continue
        if severity == "soft" and not strict:
            # In default mode we still report soft hits, but they don't
            # cause non-zero exit. Strict mode upgrades them to hard.
            pass
        m = rx.search(content)
        if m:
            start = max(0, m.start() - 30)
            end = min(len(content), m.end() + 30)
            snippet = content[start:end].replace("\n", " ").strip()
            if len(snippet) > 160:
                snippet = snippet[:160] + "..."
            hits.append((severity, name, snippet))
    return hits


def scan_filenames():
    """Walk the shipped tree for forbidden file extensions."""
    bad = []
    for dirpath, dirs, files in os.walk(ROOT):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for name in files:
            if FORBIDDEN_FILES.search(name):
                rel = os.path.relpath(os.path.join(dirpath, name), ROOT)
                if rel in FORBIDDEN_EXEMPT:
                    continue
                bad.append(rel)
    return bad


def scan_sitemap():
    """Sitemap-poisoning check: foreign hosts, ?-query URLs, suspicious slugs."""
    issues = []
    path = os.path.join(ROOT, "sitemap.xml")
    if not os.path.exists(path):
        return [("sitemap-missing", path)]
    with open(path, "r", encoding="utf-8") as f:
        xml = f.read()
    locs = re.findall(r"<loc>([^<]+)</loc>", xml)
    for url in locs:
        m = re.match(r"https?://([^/]+)(/.*)?$", url)
        if not m:
            issues.append(("sitemap-malformed-loc", url))
            continue
        host = m.group(1)
        path_part = m.group(2) or "/"
        if host not in ALLOWED_SITEMAP_HOSTS:
            issues.append(("sitemap-foreign-host", f"{host} :: {url}"))
        if "?" in path_part:
            issues.append(("sitemap-query-string", url))
        # CJK / Cyrillic / Arabic chars in URL path = almost always spam.
        if re.search(r"[぀-ヿ一-鿿Ѐ-ӿ؀-ۿ]", path_part):
            issues.append(("sitemap-non-latin-slug", url))
    return issues


def scan_robots():
    """robots.txt sanity — no Disallow: / on production, sitemap is correct."""
    issues = []
    path = os.path.join(ROOT, "robots.txt")
    if not os.path.exists(path):
        return [("robots-missing", path)]
    with open(path, "r", encoding="utf-8") as f:
        body = f.read()
    if re.search(r"^\s*Disallow:\s*/\s*$", body, re.M):
        issues.append(("robots-disallow-all", "Disallow: / would deindex the site"))
    if "ambisecure.ambimat.com/sitemap.xml" not in body:
        issues.append(("robots-sitemap-missing", "Sitemap: line absent or non-canonical"))
    return issues


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--strict", action="store_true",
                    help="Treat soft warnings (meta-refresh, hidden-text-ish) as hard fails.")
    ap.add_argument("--quiet", action="store_true",
                    help="Suppress per-file details; print summary only.")
    args = ap.parse_args()

    hard_hits = defaultdict(list)  # relpath -> [(name, snippet), ...]
    soft_hits = defaultdict(list)

    n_scanned = 0
    for relpath, abspath in iter_targets():
        n_scanned += 1
        for severity, name, snippet in scan_file(relpath, abspath, args.strict):
            if severity == "hard" or (severity == "soft" and args.strict):
                hard_hits[relpath].append((name, snippet))
            elif severity == "soft":
                soft_hits[relpath].append((name, snippet))
            elif severity == "error":
                hard_hits[relpath].append((name, snippet))

    forbidden = scan_filenames()
    sitemap_issues = scan_sitemap()
    robots_issues = scan_robots()

    print(f"audit-spam-seo: scanned {n_scanned} files across the shipped tree")
    print(f"  hard pattern hits:        {sum(len(v) for v in hard_hits.values())}")
    print(f"  soft pattern hits:        {sum(len(v) for v in soft_hits.values())}")
    print(f"  forbidden filenames:      {len(forbidden)}")
    print(f"  sitemap issues:           {len(sitemap_issues)}")
    print(f"  robots issues:            {len(robots_issues)}")

    if not args.quiet:
        if hard_hits:
            print("\nHARD HITS (potential compromise indicators):")
            for relpath, hits in sorted(hard_hits.items()):
                for name, snippet in hits:
                    print(f"  ! {relpath} :: {name}")
                    print(f"      … {snippet}")
        if soft_hits:
            print("\nSOFT HITS (review; not auto-fail unless --strict):")
            for relpath, hits in sorted(soft_hits.items()):
                for name, snippet in hits:
                    print(f"  ~ {relpath} :: {name}")
                    print(f"      … {snippet}")
        if forbidden:
            print("\nFORBIDDEN FILE EXTENSIONS in shipped tree:")
            for r in forbidden:
                print(f"  ! {r}")
        if sitemap_issues:
            print("\nSITEMAP ISSUES:")
            for k, v in sitemap_issues:
                print(f"  ! {k}: {v}")
        if robots_issues:
            print("\nROBOTS.TXT ISSUES:")
            for k, v in robots_issues:
                print(f"  ! {k}: {v}")

    fail = bool(hard_hits) or bool(forbidden) or bool(sitemap_issues) or bool(robots_issues)
    if not fail:
        print("\nOK — no spam / cloaking / injection indicators found")
        sys.exit(0)
    print(f"\nFAIL — review hits above")
    sys.exit(1)


if __name__ == "__main__":
    main()
