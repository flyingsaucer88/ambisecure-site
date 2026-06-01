#!/usr/bin/env python3
"""Build assets/data/search-index.json from every indexable HTML page on the site.

For each page we extract:
  u   url        canonical URL path (slash form)
  t   title      <title> minus the trailing " — AmbiSecure" / " | AmbiSecure" suffix
  d   desc       <meta name="description">
  l   label      human label inferred from URL prefix (Product / Service / Blog / ...)
  s   slug        machine slug for grouping (product / service / blog / ...)
  e   eyebrow    short category badge from <span class="eyebrow"> (FIDO, ASN.1, PIV, ...)
  k   keywords   canonical topic tags detected in title/desc/eyebrow/excerpt/url
                 (FIDO2, PIV, V2X, DESFire, PKI, eSIM, ...). Aids acronym search.
  x   excerpt    short human excerpt from the page hero <p class="dek"> (or first
                 <p> in <main>, falling back to the meta description), capped.

Exclusions (per the site-search requirements):
  * 404 / robots / utility pages          (SKIP_URLS)
  * dist / legacy / internal trees        (EXCL)
  * pages carrying <meta name="robots" content="...noindex...">
  * canonical duplicates                  (canonical URL + seen set)

We deliberately do NOT index full body text — keeps the index small and
privacy-safe (no full-text leaks of unpublished drafts). The excerpt is a
single short hero sentence already shown publicly on the page.
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
ROBOTS_RE = re.compile(r'<meta\s+name="robots"\s+content="([^"]*)"', re.I | re.S)
DEK_RE    = re.compile(r'<p[^>]*class="[^"]*\bdek\b[^"]*"[^>]*>(.*?)</p>', re.I | re.S)
MAIN_P_RE = re.compile(r'<main\b[^>]*>.*?<p[^>]*>(.*?)</p>', re.I | re.S)
MAIN_RE   = re.compile(r'<main\b[^>]*>(.*?)</main>', re.I | re.S)
SCRIPT_RE = re.compile(r'<(script|style)\b[^>]*>.*?</\1>', re.I | re.S)
TAG_STRIP = re.compile(r'<[^>]+>')

# Canonical topic tags → detection patterns (lower-cased, substring match against
# a normalised haystack of title + desc + eyebrow + excerpt + url). Order matters:
# longer/more-specific terms first so "FIDO2" wins over "FIDO".
KEY_TERMS = [
    ('FIDO2',          ['fido2', 'fido 2']),
    ('FIDO',           ['fido']),
    ('WebAuthn',       ['webauthn', 'web authn']),
    ('passkeys',       ['passkey']),
    ('CTAP2',          ['ctap2', 'ctap']),
    ('PIV',            ['piv']),
    ('SIMAuth',        ['simauth']),
    ('SMS OTP',        ['sms otp', 'otp sms', 'sms-otp', 'otp-sms', 'one-time password', 'one time password']),
    ('OTP',            ['otp', 'totp', 'hotp']),
    ('eUICC',          ['euicc']),
    ('eSIM',           ['esim', 'e-sim']),
    ('SM-DP+',         ['sm-dp', 'smdp', 'sm dp']),
    ('V2X',            ['v2x']),
    ('IEEE 1609.2',    ['ieee 1609', '1609.2', '1609-2', '1609 2']),
    ('ETSI TS 102 941',['102 941', '102-941', '102941']),
    ('ETSI TS 103 097',['103 097', '103-097', '103097']),
    ('ISO 21177',      ['21177']),
    ('DESFire',        ['desfire']),
    ('MIFARE',         ['mifare']),
    ('PKI',            ['pki', 'public key infrastructure']),
    ('X.509',          ['x.509', 'x509']),
    ('secure element', ['secure element', 'secure-element']),
    ('JavaCard',       ['javacard', 'java card']),
    ('attestation',    ['attestation']),
    ('GlobalPlatform', ['globalplatform', 'global platform', 'scp03', 'scp02']),
    ('NFC',            ['nfc', 'iso 14443', 'iso14443']),
    ('ASN.1',          ['asn.1', 'asn1']),
    ('HSM',            ['hsm', 'hardware security module']),
    ('TPM',            ['tpm', 'trusted platform module']),
    ('MFA',            ['mfa', 'multi-factor', 'multi factor', '2fa']),
    ('SAM',            ['secure access module', ' sam ', 'sam flow']),
    ('ePassport',      ['epassport', 'e-passport', 'icao 9303', 'icao9303']),
]


def decode_html(s):
    return html_lib.unescape(s).replace('—', '—').replace('–', '–').strip()


def infer_type(url):
    for prefix, label, slug in TYPE_TABLE:
        if url.startswith(prefix):
            return label, slug
    return 'Page', 'page'


def clean_text(raw):
    """Strip inline tags + collapse whitespace from an HTML fragment."""
    txt = TAG_STRIP.sub(' ', raw)
    txt = decode_html(txt)
    return re.sub(r'\s+', ' ', txt).strip()


def make_excerpt(src, desc):
    """Prefer the hero <p class="dek">, then the first <p> in <main>, then desc."""
    for rx in (DEK_RE, MAIN_P_RE):
        m = rx.search(src)
        if m:
            txt = clean_text(m.group(1))
            if len(txt) >= 30:
                if len(txt) > 200:
                    txt = txt[:198].rsplit(' ', 1)[0] + '…'
                return txt
    return desc


def main_text(src):
    """Lower-cased text of the <main> region only — excludes the global
    ecosystem bar / nav / footer chrome (which mention sister-brand names
    like SIMAuth on every page and would otherwise tag the whole site)."""
    m = MAIN_RE.search(src)
    region = m.group(1) if m else src
    region = SCRIPT_RE.sub(' ', region)
    region = TAG_STRIP.sub(' ', region)
    return decode_html(region).lower()


def detect_keywords(haystack, body):
    """Return canonical topic tags whose patterns appear in the page's
    metadata haystack or its <main> body text. Controlled vocabulary, so
    scanning the body is intentional (tags the topics a page discusses).

    De-duplicates the FIDO/FIDO2 overlap: if FIDO2 matched we still keep FIDO
    (a FIDO2 page is also a FIDO page), which is what searchers expect.
    """
    found = []
    for tag, pats in KEY_TERMS:
        for p in pats:
            if p in haystack or p in body:
                if tag not in found:
                    found.append(tag)
                break
    return found[:14]


def gather():
    pages = []
    seen = set()
    skipped_noindex = []
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
            # Explicitly exclude noindex pages (belt-and-braces on top of the
            # canonical-dedup that already drops most of them).
            rm = ROBOTS_RE.search(src)
            if rm and 'noindex' in rm.group(1).lower():
                skipped_noindex.append(url)
                continue
            seen.add(url)
            tm = TITLE_RE.search(src)
            dm = DESC_RE.search(src)
            em = EYEBROW_RE.search(src)
            title = decode_html(tm.group(1)) if tm else url
            # Strip the trailing " — AmbiSecure" / " | AmbiSecure" site suffix.
            title = re.sub(r'\s*[—\-|]\s*AmbiSecure\s*$', '', title).strip()
            desc  = decode_html(dm.group(1)) if dm else ''
            # Truncate description for index size
            if len(desc) > 220:
                desc = desc[:218].rsplit(' ', 1)[0] + '…'
            eyebrow = decode_html(em.group(1)).strip() if em else ''
            excerpt = make_excerpt(src, desc)
            label, slug = infer_type(url)
            haystack = ' '.join([title, desc, eyebrow, excerpt, url]).lower()
            keywords = detect_keywords(haystack, main_text(src))
            entry = {
                'u': url,
                't': title,
                'd': desc,
                'l': label,
                's': slug,
                'e': eyebrow,
            }
            if excerpt and excerpt != desc:
                entry['x'] = excerpt
            if keywords:
                entry['k'] = keywords
            pages.append(entry)
    return pages, skipped_noindex


def main():
    pages, skipped_noindex = gather()
    # Sort: products + services + technologies first, then alpha
    order = {'product': 1, 'service': 2, 'tech': 3, 'solution': 4, 'industry': 5,
             'tool': 6, 'ref': 7, 'timeline': 8, 'blog': 9, 'archive': 10,
             'case': 11, 'video': 12, 'brochure': 13}
    pages.sort(key=lambda p: (order.get(p['s'], 99), p['t'].lower()))
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump({'v': 2, 'count': len(pages), 'pages': pages}, f, ensure_ascii=False)
    print(f"wrote {OUT}: {len(pages)} pages, {os.path.getsize(OUT)} bytes")
    if skipped_noindex:
        print(f"excluded {len(skipped_noindex)} noindex page(s): " +
              ', '.join(sorted(skipped_noindex)))


if __name__ == '__main__':
    main()
