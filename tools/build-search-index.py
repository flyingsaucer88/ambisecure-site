#!/usr/bin/env python3
"""Build assets/data/search-index.json from every indexable HTML page on the site.

For each page we extract:
  url        canonical URL path (slash form)
  title      <title> minus the trailing " — AmbiSecure" suffix
  desc       <meta name="description">
  type       inferred from URL prefix (product / service / blog / ...)
  tag        short category badge (FIDO, ASN.1, PIV, etc.)

We deliberately do NOT index body text — keeps the index <120 KB and
privacy-safe (no full-text leaks of unpublished drafts).
"""
import os, re, json, html as html_lib

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT  = os.path.join(ROOT, 'assets', 'data', 'search-index.json')

EXCL = ('/dist/', '/legacysitedata/', '/node_modules/', '/.git/', '/_internal/')

# Page-type inference + display labels keyed by URL prefix
TYPE_TABLE = [
    ('/products/',                   'Product',     'product'),
    ('/services/',                   'Service',     'service'),
    ('/technologies/',               'Technology',  'tech'),
    ('/solutions/',                  'Solution',    'solution'),
    ('/industries/',                 'Industry',    'industry'),
    ('/case-studies/',               'Case study',  'case'),
    ('/blog/archive/',               'Archive',     'archive'),
    ('/blog/categories/',            'Category',    'category'),
    ('/blog/',                       'Blog',        'blog'),
    ('/tags/',                       'Tag',         'tag'),
    ('/references/',                 'Reference',   'ref'),
    ('/resources/timelines/',        'Timeline',    'timeline'),
    ('/resources/tools/',            'Tool',        'tool'),
    ('/resources/webauthn/',         'Reference',   'ref'),
    ('/resources/',                  'Resources',   'res'),
    ('/videos/',                     'Video',       'video'),
    ('/brochures/',                  'Brochure',    'brochure'),
    ('/engagement-models/',          'Engagement',  'engage'),
    ('/about/',                      'About',       'about'),
    ('/support/',                    'Support',     'support'),
    ('/contact/',                    'Contact',     'contact'),
    ('/partners/',                   'Partners',    'partners'),
    ('/trust/',                      'Trust',       'trust'),
    ('/privacy/',                    'Privacy',     'privacy'),
]

# Patterns we should NOT include — paginated dupes, internal-only, etc.
SKIP_URLS = re.compile(r'^/(404|robots)\.html$')

TITLE_RE  = re.compile(r'<title>([^<]+)</title>', re.S)
DESC_RE   = re.compile(r'<meta\s+name="description"\s+content="([^"]*)"', re.S)
CANON_RE  = re.compile(r'<link\s+rel="canonical"\s+href="([^"]+)"')
EYEBROW_RE = re.compile(r'<span class="eyebrow">([^<]+)</span>', re.S)

def decode_html(s):
    return html_lib.unescape(s).replace('—', '—').replace('–', '–').strip()

def infer_type(url):
    for prefix, label, slug in TYPE_TABLE:
        if url.startswith(prefix):
            return label, slug
    return 'Page', 'page'

def gather():
    pages = []
    seen = set()
    for dirpath, dirs, files in os.walk(ROOT):
        rel = '/' + os.path.relpath(dirpath, ROOT).replace('\\', '/')
        if any(s in rel + '/' for s in EXCL):
            dirs[:] = []
            continue
        for fn in files:
            if fn != 'index.html' and not (fn.endswith('.html') and dirpath == ROOT):
                continue
            full = os.path.join(dirpath, fn)
            with open(full, encoding='utf-8') as f:
                src = f.read()
            # Prefer canonical URL when present
            m = CANON_RE.search(src)
            if m:
                url = m.group(1)
                url = url.replace('https://ambisecure.ambimat.com', '') or '/'
            else:
                # derive from file path
                if fn == 'index.html':
                    url = '/' + os.path.relpath(dirpath, ROOT).replace('\\', '/') + '/'
                    url = url.replace('/./', '/').replace('//', '/')
                else:
                    url = '/' + fn
            if SKIP_URLS.match(url): continue
            if url in seen: continue
            seen.add(url)
            tm = TITLE_RE.search(src)
            dm = DESC_RE.search(src)
            em = EYEBROW_RE.search(src)
            title = decode_html(tm.group(1)) if tm else url
            # Strip the " — AmbiSecure" suffix
            title = re.sub(r'\s*[—-]\s*AmbiSecure.*$', '', title).strip()
            desc  = decode_html(dm.group(1)) if dm else ''
            # Truncate description for index size
            if len(desc) > 220:
                desc = desc[:218].rsplit(' ', 1)[0] + '…'
            eyebrow = decode_html(em.group(1)).strip() if em else ''
            label, slug = infer_type(url)
            pages.append({
                'u': url,
                't': title,
                'd': desc,
                'l': label,
                's': slug,
                'e': eyebrow,
            })
    return pages

def main():
    pages = gather()
    # Sort: products + services + technologies first, then alpha
    order = {'product': 1, 'service': 2, 'tech': 3, 'solution': 4, 'industry': 5,
             'tool': 6, 'ref': 7, 'timeline': 8, 'blog': 9, 'archive': 10,
             'case': 11, 'video': 12, 'brochure': 13}
    pages.sort(key=lambda p: (order.get(p['s'], 99), p['t'].lower()))
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump({'v': 1, 'count': len(pages), 'pages': pages}, f, ensure_ascii=False)
    print(f"wrote {OUT}: {len(pages)} pages, {os.path.getsize(OUT)} bytes")

if __name__ == '__main__':
    main()
