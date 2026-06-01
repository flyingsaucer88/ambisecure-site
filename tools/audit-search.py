#!/usr/bin/env python3
"""Validate the static site-search + discovery-assistant subsystem.

Read-only. Exit 0 = clean, exit 1 = at least one check failed.

Checks (site-search requirements, Phases 1–3):
  1.  search-index.json is present and valid JSON with the expected shape
  2.  the committed index is in sync with tools/build-search-index.py
      (i.e. nobody edited pages without regenerating the index)
  3.  key pages appear in the index
  4.  NO noindex page appears in the index
  5.  /search/ page exists and carries the search input + suggestion chips
  6.  the navbar header search trigger exists site-wide
  7.  sitemap.xml is well-formed XML
  8.  the search JS fetches a cache-busted (versioned) index URL
  9.  the three search analytics events are wired in the search JS
  10. Phase 2 assistant: intent map + curated links resolve to real indexed
      pages, and the "no AI answers" disclaimer is present
  11. Phase 3: AI assistant is DISABLED by default and no AI provider SDK /
      API key / endpoint is bundled in shipped JS

Run:
    python3 tools/audit-search.py
"""
import importlib.util
import json
import os
import re
import sys
import xml.etree.ElementTree as ET

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INDEX = os.path.join(ROOT, 'assets', 'data', 'search-index.json')

errors = []
def fail(msg): errors.append(msg)
def ok(msg): print(f"  ok  {msg}")

# Pages that must always be discoverable through search.
KEY_PAGES = [
    '/products/',
    '/products/onepass-platform/',
    '/technologies/v2x-pki/',
    '/solutions/v2x-security/',
    '/solutions/device-identity-at-scale/',
    '/references/ieee-1609-2/',
    '/references/etsi-ts-102-941/',
    '/references/etsi-ts-103-097/',
    '/references/iso-21177/',
    '/references/desfire/',
]

# Suggestion terms that must be present as chips on /search/.
SUGGEST_TERMS = [
    'SIMAuth', 'SMS OTP', 'FIDO', 'FIDO2', 'PIV', 'secure element',
    'eUICC', 'eSIM', 'V2X', 'IEEE 1609.2', 'ETSI TS 102 941',
    'ETSI TS 103 097', 'ISO 21177', 'DESFire', 'PKI',
]

ANALYTICS_EVENTS = ['search_submitted', 'search_result_clicked', 'search_no_results']

# AI-provider fingerprints that must NOT appear in shipped client JS.
AI_FINGERPRINTS = [
    'api.openai.com', 'openai.com/v1', 'api.anthropic.com',
    'generativelanguage.googleapis.com', 'api.cohere',
    'sk-ant-', 'sk-proj-', 'sk-or-', 'AIzaSy',
    'anthropic-version', 'OpenAI(', 'new OpenAI', 'Anthropic(',
]


def load_builder():
    path = os.path.join(ROOT, 'tools', 'build-search-index.py')
    spec = importlib.util.spec_from_file_location('build_search_index', path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def check_index():
    if not os.path.exists(INDEX):
        fail('search-index.json missing — run tools/build-search-index.py')
        return None
    try:
        with open(INDEX, encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        fail(f'search-index.json is not valid JSON: {e}')
        return None
    if not isinstance(data, dict) or 'pages' not in data or 'count' not in data:
        fail('search-index.json missing expected keys (v / count / pages)')
        return None
    pages = data['pages']
    if data['count'] != len(pages):
        fail(f"index count {data['count']} != actual pages {len(pages)}")
    required_fields = {'u', 't', 'l', 's'}
    for p in pages:
        missing = required_fields - set(p)
        if missing:
            fail(f"index entry {p.get('u','?')} missing fields {missing}")
            break
    ok(f"index valid JSON: {len(pages)} pages, {os.path.getsize(INDEX)} bytes")
    return data


def check_freshness(builder, data):
    """The committed index must match a fresh build (read-only comparison)."""
    pages, skipped = builder.gather()
    order = {'product': 1, 'service': 2, 'tech': 3, 'solution': 4, 'industry': 5,
             'tool': 6, 'ref': 7, 'timeline': 8, 'blog': 9, 'archive': 10,
             'case': 11, 'video': 12, 'brochure': 13}
    pages.sort(key=lambda p: (order.get(p['s'], 99), p['t'].lower()))
    fresh = {'v': 2, 'count': len(pages), 'pages': pages}
    if json.dumps(fresh, ensure_ascii=False, sort_keys=True) != \
       json.dumps(data, ensure_ascii=False, sort_keys=True):
        fail('committed search-index.json is STALE — re-run '
             'python3 tools/build-search-index.py and commit the result')
    else:
        ok('index is in sync with build-search-index.py')
    return skipped


def check_key_pages(data):
    urls = {p['u'] for p in data['pages']}
    missing = [u for u in KEY_PAGES if u not in urls]
    if missing:
        fail(f"key pages missing from index: {missing}")
    else:
        ok(f"all {len(KEY_PAGES)} key pages present in index")


def check_no_noindex(data):
    """No indexed URL may resolve to a page carrying robots:noindex."""
    robots_re = re.compile(r'<meta\s+name="robots"\s+content="([^"]*)"', re.I)
    offenders = []
    for p in data['pages']:
        u = p['u']
        rel = u.strip('/')
        candidate = os.path.join(ROOT, rel, 'index.html') if rel else os.path.join(ROOT, 'index.html')
        if not os.path.exists(candidate):
            continue
        src = open(candidate, encoding='utf-8', errors='replace').read()
        m = robots_re.search(src)
        if m and 'noindex' in m.group(1).lower():
            offenders.append(u)
    if offenders:
        fail(f"noindex pages present in search index: {offenders}")
    else:
        ok('no noindex pages appear in the index')


def check_search_page():
    path = os.path.join(ROOT, 'search', 'index.html')
    if not os.path.exists(path):
        fail('/search/ page (search/index.html) is missing')
        return
    src = open(path, encoding='utf-8').read()
    if 'data-sitewide-search' not in src:
        fail('/search/ page missing the search input (data-sitewide-search)')
    if 'sitewide-search-page.js' not in src:
        fail('/search/ page missing sitewide-search-page.js')
    # suggestion chips
    missing = [t for t in SUGGEST_TERMS
               if f'data-search-suggest="{t}"' not in src]
    if missing:
        fail(f"/search/ page missing suggestion chips for: {missing}")
    else:
        ok(f"/search/ exists with input + all {len(SUGGEST_TERMS)} suggestion chips")


def check_header_search():
    """Every shipped HTML page should carry the navbar search trigger."""
    missing = []
    total = 0
    skip = ('/dist/', '/legacysitedata/', '/_internal/', '/node_modules/', '/.git/')
    for dirpath, dirs, files in os.walk(ROOT):
        rel = '/' + os.path.relpath(dirpath, ROOT).replace('\\', '/') + '/'
        if any(s in rel for s in skip):
            dirs[:] = []
            continue
        for fn in files:
            if fn != 'index.html' and not (fn.endswith('.html') and dirpath == ROOT):
                continue
            if fn == '404.html':
                continue
            src = open(os.path.join(dirpath, fn), encoding='utf-8', errors='replace').read()
            # noindex pages are outside the public search surface (e.g. canonical
            # redirect stubs); they don't need the trigger.
            rm = re.search(r'<meta\s+name="robots"\s+content="([^"]*)"', src, re.I)
            if rm and 'noindex' in rm.group(1).lower():
                continue
            total += 1
            if 'as-search-trigger' not in src:
                missing.append(os.path.relpath(os.path.join(dirpath, fn), ROOT))
    if missing:
        fail(f"{len(missing)} page(s) missing the header search trigger: {missing[:5]}")
    else:
        ok(f"header search trigger present on all {total} pages")


def check_sitemap():
    path = os.path.join(ROOT, 'sitemap.xml')
    try:
        ET.parse(path)
        ok('sitemap.xml is well-formed XML')
    except Exception as e:
        fail(f'sitemap.xml is not well-formed: {e}')


def check_cache_bust_and_events():
    for js in ('site-search.js', 'sitewide-search-page.js'):
        path = os.path.join(ROOT, 'assets', 'js', js)
        src = open(path, encoding='utf-8').read()
        if not re.search(r"search-index\.json\?v=\d+", src):
            fail(f'{js} fetches the index without a ?v= cache-bust')
        else:
            ok(f'{js} fetches a cache-busted index URL')
        missing = [e for e in ANALYTICS_EVENTS if e not in src]
        if missing:
            fail(f'{js} missing analytics events: {missing}')
        else:
            ok(f'{js} wires search analytics events')


ASSISTANT_DISCLAIMER = ('This assistant searches AmbiSecure content and suggests '
                        'relevant pages. It does not generate AI answers.')


def check_assistant(data):
    """Phase 2: the non-AI 'Ask AmbiSecure' assistant must link only to real,
    crawlable indexed pages, carry the 'no AI answers' disclaimer, and ship its
    static crawlable fallback."""
    urls = {p['u'] for p in data['pages']}
    on_disk = lambda u: os.path.exists(
        os.path.join(ROOT, u.strip('/'), 'index.html')) or u in urls

    js_path = os.path.join(ROOT, 'assets', 'js', 'ask-ambisecure.js')
    if not os.path.exists(js_path):
        fail('assets/js/ask-ambisecure.js is missing')
        return
    js = open(js_path, encoding='utf-8').read()
    if 'I found relevant AmbiSecure resources' not in js:
        fail("assistant JS missing the curated-results lead phrase")
    # Page paths referenced in the JS (site pages, not /assets/ or anchors).
    js_paths = set(re.findall(r"'(/[a-z0-9][a-z0-9/-]*/)'", js))
    js_paths = {u for u in js_paths if not u.startswith('/assets/')}
    bad = sorted(u for u in js_paths if u not in urls)
    if bad:
        fail(f"assistant JS links to pages not in the index: {bad}")
    else:
        ok(f"assistant intent map: all {len(js_paths)} links resolve to indexed pages")

    sp = os.path.join(ROOT, 'search', 'index.html')
    src = open(sp, encoding='utf-8').read()
    if 'ask-ambisecure.js' not in src:
        fail('/search/ page does not load ask-ambisecure.js')
    if ASSISTANT_DISCLAIMER not in src:
        fail('/search/ page missing the required "does not generate AI answers" disclaimer')
    else:
        ok('assistant disclaimer present ("does not generate AI answers")')
    if 'data-ask-assistant' not in src:
        fail('/search/ page missing the assistant container (data-ask-assistant)')
    # Static fallback links inside the data-ask-topics block must be real pages.
    m = re.search(r'data-ask-topics.*?</div>\s*</div>\s*</div>', src, re.S)
    block = m.group(0) if m else src
    topic_links = re.findall(r'href="(/[a-z0-9][a-z0-9/-]*/)"', block)
    broken = sorted({u for u in topic_links if not on_disk(u)})
    if broken:
        fail(f"static 'Browse by topic' links not found on disk: {broken}")
    else:
        ok(f"assistant static fallback: all {len(set(topic_links))} topic links are real pages")


def check_no_ai_bundled():
    """No shipped client JS may reference an AI provider SDK, endpoint, or key.
    The discovery assistant is non-AI by design (Phases 1–2); Phase 3 keeps AI
    disabled by default. This guards against accidental introduction."""
    js_dir = os.path.join(ROOT, 'assets', 'js')
    offenders = []
    for dirpath, _dirs, files in os.walk(js_dir):
        for fn in files:
            if not fn.endswith('.js'):
                continue
            src = open(os.path.join(dirpath, fn), encoding='utf-8', errors='replace').read()
            for fp in AI_FINGERPRINTS:
                if fp in src:
                    offenders.append(f'{fn}: "{fp}"')
    if offenders:
        fail(f'AI provider reference(s) found in shipped JS: {offenders}')
    else:
        ok('no AI provider SDK / endpoint / key bundled in shipped JS')


def main():
    print('=== search subsystem audit ===')
    builder = load_builder()
    data = check_index()
    if data is None:
        print('\nFAILED:\n  - ' + '\n  - '.join(errors))
        return 1
    check_freshness(builder, data)
    check_key_pages(data)
    check_no_noindex(data)
    check_search_page()
    check_header_search()
    check_sitemap()
    check_cache_bust_and_events()
    check_assistant(data)
    check_no_ai_bundled()

    print()
    if errors:
        print('SEARCH AUDIT FAILED:')
        for e in errors:
            print(f'  - {e}')
        return 1
    print('SEARCH AUDIT PASSED')
    return 0


if __name__ == '__main__':
    sys.exit(main())
