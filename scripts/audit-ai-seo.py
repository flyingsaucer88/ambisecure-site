#!/usr/bin/env python3
"""Site-wide SEO audit aligned with Google's "Optimizing your website for
generative AI features on Google Search" guidance. Emits a JSON report
and a markdown summary. Purely read-only; never modifies the repo.

Run:
    python3 scripts/audit-ai-seo.py            # prints summary
    python3 scripts/audit-ai-seo.py --json     # prints full JSON to stdout
"""

import json
import re
import sys
from collections import Counter, defaultdict
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
HOST = 'https://ambisecure.ambimat.com'

# Top-level-only excludes. We anchor at the first path part so
# /tools/ (build scripts) is excluded but /resources/tools/ (public
# surface) is NOT — same pattern as tools/build-hostinger-package.sh.
EXCLUDE_TOP_DIRS = {'.git', '.github', '.githooks', '.lighthouseci', '.claude',
                    'dist', 'docs', 'tools', 'scripts', 'legacysitedata',
                    'node_modules', '_internal', 'Logos'}


def html_files() -> list[Path]:
    out = []
    for p in ROOT.rglob('*.html'):
        parts = p.relative_to(ROOT).parts
        if parts and parts[0] in EXCLUDE_TOP_DIRS:
            continue
        out.append(p)
    return sorted(out)


class PageParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.title_parts = []
        self.in_title = False
        self.title_done = False  # only capture the first <title> (head); skip SVG <title>
        self.in_script = False
        self.canonical = None
        self.meta_description = None
        self.meta_robots = None
        self.og_url = None
        self.og_title = None
        self.og_image = None
        self.twitter_card = None
        self.html_lang = None
        self.h1_count = 0
        self.h2_count = 0
        self.imgs = []  # list of (src, alt, has_width, has_height, has_loading)
        self.internal_anchors = []  # list of href
        self.external_anchors = []
        self.has_main = False
        self.has_breadcrumb_nav = False
        self.has_footer = False
        self.json_ld_blocks = []
        self._current_script_text = []
        self._current_script_is_ldjson = False
        self.faq_visible_count = 0  # rough heuristic: <summary>/<details>
        self.has_details = False
        self.in_h1 = False
        self._h1_text = []
        self.h1_text = ''
        self.body_text_len = 0
        self._in_body = False
        self._in_skip_for_text = 0  # within <script>/<style>
        self._lang_set_on_html = False

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'html':
            self.html_lang = a.get('lang')
        elif tag == 'title' and not self.title_done:
            self.in_title = True
        elif tag == 'link' and a.get('rel') == 'canonical':
            self.canonical = a.get('href')
        elif tag == 'meta':
            name = (a.get('name') or '').lower()
            prop = (a.get('property') or '').lower()
            content = a.get('content') or ''
            if name == 'description':
                self.meta_description = content
            elif name == 'robots':
                self.meta_robots = content
            elif name == 'twitter:card':
                self.twitter_card = content
            elif prop == 'og:url':
                self.og_url = content
            elif prop == 'og:title':
                self.og_title = content
            elif prop == 'og:image':
                self.og_image = content
        elif tag == 'h1':
            self.h1_count += 1
            self.in_h1 = True
        elif tag == 'h2':
            self.h2_count += 1
        elif tag == 'img':
            src = a.get('src', '')
            alt = a.get('alt')  # None if attribute missing
            self.imgs.append({
                'src': src,
                'alt_present': 'alt' in a,
                'alt_text': alt or '',
                'has_width': 'width' in a,
                'has_height': 'height' in a,
                'has_loading': 'loading' in a,
            })
        elif tag == 'a':
            href = a.get('href', '')
            if not href:
                return
            if href.startswith('#') or href.startswith('mailto:') or href.startswith('tel:'):
                return
            if href.startswith('http://') or href.startswith('https://'):
                if HOST in href:
                    self.internal_anchors.append(href)
                else:
                    self.external_anchors.append(href)
            elif href.startswith('/'):
                self.internal_anchors.append(href)
        elif tag == 'main':
            self.has_main = True
        elif tag == 'nav':
            if dict(attrs).get('class', '') and 'breadcrumb' in dict(attrs).get('class', ''):
                self.has_breadcrumb_nav = True
            if dict(attrs).get('aria-label', '').lower() == 'breadcrumb':
                self.has_breadcrumb_nav = True
        elif tag == 'footer':
            self.has_footer = True
        elif tag == 'details':
            self.has_details = True
            self.faq_visible_count += 1
        elif tag == 'script':
            if dict(attrs).get('type') == 'application/ld+json':
                self._current_script_is_ldjson = True
                self._current_script_text = []
            self._in_skip_for_text += 1
        elif tag == 'style':
            self._in_skip_for_text += 1
        elif tag == 'body':
            self._in_body = True

    def handle_endtag(self, tag):
        if tag == 'title':
            if self.in_title:
                self.title_done = True
            self.in_title = False
        elif tag == 'h1':
            self.in_h1 = False
            self.h1_text = ''.join(self._h1_text).strip()
        elif tag == 'script':
            if self._current_script_is_ldjson:
                self.json_ld_blocks.append(''.join(self._current_script_text))
                self._current_script_is_ldjson = False
            self._in_skip_for_text = max(0, self._in_skip_for_text - 1)
        elif tag == 'style':
            self._in_skip_for_text = max(0, self._in_skip_for_text - 1)
        elif tag == 'body':
            self._in_body = False

    def handle_data(self, data):
        if self.in_title:
            self.title_parts.append(data)
        if self._current_script_is_ldjson:
            self._current_script_text.append(data)
        if self.in_h1:
            self._h1_text.append(data)
        if self._in_body and self._in_skip_for_text == 0:
            self.body_text_len += len(data.strip())


def parse_json_ld_types(blocks: list[str]) -> tuple[list[str], list[str]]:
    """Return (types_found, errors)."""
    types, errors = [], []
    for raw in blocks:
        try:
            data = json.loads(raw)
        except json.JSONDecodeError as e:
            errors.append(f'JSON parse error: {e.msg}')
            continue
        for node in (data.get('@graph') if isinstance(data, dict) and '@graph' in data else
                     (data if isinstance(data, list) else [data])):
            if isinstance(node, dict) and '@type' in node:
                t = node['@type']
                if isinstance(t, list):
                    types.extend(t)
                else:
                    types.append(t)
    return types, errors


def url_for(path: Path) -> str:
    rel = path.relative_to(ROOT).as_posix()
    if rel == 'index.html':
        return HOST + '/'
    if rel.endswith('/index.html'):
        return HOST + '/' + rel[:-len('index.html')]
    return HOST + '/' + rel


def is_in_sitemap(url: str, sitemap_locs: set[str]) -> bool:
    return url in sitemap_locs


def audit() -> dict:
    sitemap_text = (ROOT / 'sitemap.xml').read_text()
    sitemap_locs = set(re.findall(r'<loc>([^<]+)</loc>', sitemap_text))

    findings = {
        'sitemap_url_count': len(sitemap_locs),
        'pages_scanned': 0,
        'pages_in_sitemap': 0,
        'pages_excluded_intentional': [],
        'issues': defaultdict(list),
        'schema_types_per_page': defaultdict(list),
        'global_schema_type_counts': Counter(),
        'images': {
            'total': 0,
            'missing_alt_attr': [],
            'empty_alt': [],
            'missing_width_or_height': [],
            'missing_loading_lazy_below_fold_guess': [],
        },
        'titles': Counter(),
        'descriptions': Counter(),
        'pages_by_path': {},
    }

    pages = html_files()
    for path in pages:
        rel = path.relative_to(ROOT).as_posix()
        url = url_for(path)
        parser = PageParser()
        try:
            parser.feed(path.read_text(encoding='utf-8', errors='replace'))
        except Exception as e:
            findings['issues']['parse_error'].append({'file': rel, 'error': str(e)})
            continue

        findings['pages_scanned'] += 1
        in_sm = is_in_sitemap(url, sitemap_locs)
        if in_sm:
            findings['pages_in_sitemap'] += 1

        page = {
            'url': url,
            'in_sitemap': in_sm,
            'title': ''.join(parser.title_parts).strip(),
            'canonical': parser.canonical,
            'meta_description': parser.meta_description,
            'meta_robots': parser.meta_robots,
            'og_url': parser.og_url,
            'og_title': parser.og_title,
            'og_image': parser.og_image,
            'twitter_card': parser.twitter_card,
            'html_lang': parser.html_lang,
            'h1_count': parser.h1_count,
            'h2_count': parser.h2_count,
            'h1_text': parser.h1_text,
            'has_main': parser.has_main,
            'has_breadcrumb_nav': parser.has_breadcrumb_nav,
            'has_footer': parser.has_footer,
            'image_count': len(parser.imgs),
            'internal_link_count': len(parser.internal_anchors),
            'json_ld_block_count': len(parser.json_ld_blocks),
            'body_text_len': parser.body_text_len,
            'faq_visible_count': parser.faq_visible_count,
        }

        # Schema audit
        types, schema_errors = parse_json_ld_types(parser.json_ld_blocks)
        page['schema_types'] = types
        for t in types:
            findings['global_schema_type_counts'][t] += 1
        findings['schema_types_per_page'][rel] = types
        for err in schema_errors:
            findings['issues']['schema_invalid_json'].append({'file': rel, 'error': err})

        # noindex check
        if parser.meta_robots and 'noindex' in parser.meta_robots.lower():
            if in_sm:
                findings['issues']['noindex_but_in_sitemap'].append({'file': rel, 'robots': parser.meta_robots})
            else:
                findings['pages_excluded_intentional'].append(rel)

        # Required-tag checks (only for in-sitemap pages)
        if in_sm:
            if not page['title']:
                findings['issues']['missing_title'].append(rel)
            elif len(page['title']) > 70:
                findings['issues']['title_too_long'].append({'file': rel, 'length': len(page['title'])})
            if not page['meta_description']:
                findings['issues']['missing_meta_description'].append(rel)
            elif len(page['meta_description']) > 175:
                findings['issues']['meta_description_too_long'].append({'file': rel, 'length': len(page['meta_description'])})
            elif len(page['meta_description']) < 50:
                findings['issues']['meta_description_too_short'].append({'file': rel, 'length': len(page['meta_description'])})
            if not page['canonical']:
                findings['issues']['missing_canonical'].append(rel)
            elif page['canonical'].rstrip('/') != url.rstrip('/'):
                findings['issues']['canonical_mismatch'].append({'file': rel, 'expected': url, 'found': page['canonical']})
            if page['h1_count'] == 0:
                findings['issues']['missing_h1'].append(rel)
            elif page['h1_count'] > 1:
                findings['issues']['multiple_h1'].append({'file': rel, 'count': page['h1_count']})
            if not page['has_main']:
                findings['issues']['missing_main_landmark'].append(rel)
            if not page['html_lang']:
                findings['issues']['missing_html_lang'].append(rel)
            if not page['og_image']:
                findings['issues']['missing_og_image'].append(rel)
            if not page['twitter_card']:
                findings['issues']['missing_twitter_card'].append(rel)
            if page['body_text_len'] < 200:
                findings['issues']['thin_content_lt_200_chars'].append({'file': rel, 'len': page['body_text_len']})

        # Image audit (all pages)
        for img in parser.imgs:
            findings['images']['total'] += 1
            if not img['alt_present']:
                findings['images']['missing_alt_attr'].append({'file': rel, 'src': img['src']})
            elif img['alt_text'] == '':
                # Empty alt is valid for decorative images. Flag only if filename
                # suggests meaningful content (not "spacer", "bg-", etc.)
                fn = img['src'].lower()
                if not any(tok in fn for tok in ('spacer', 'bg-', 'decor', 'pixel', 'transparent')):
                    findings['images']['empty_alt'].append({'file': rel, 'src': img['src']})
            if not img['has_width'] or not img['has_height']:
                findings['images']['missing_width_or_height'].append({'file': rel, 'src': img['src']})
            if not img['has_loading']:
                # Loading=lazy is recommended below the fold. We can't know
                # the fold programmatically; we flag every img without it
                # and let the user decide.
                findings['images']['missing_loading_lazy_below_fold_guess'].append({'file': rel, 'src': img['src']})

        # Title/desc duplicate tracking (sitemap pages only)
        if in_sm:
            if page['title']:
                findings['titles'][page['title']] += 1
            if page['meta_description']:
                findings['descriptions'][page['meta_description']] += 1

        findings['pages_by_path'][rel] = page

    # Duplicate detection
    findings['duplicate_titles'] = {t: c for t, c in findings['titles'].items() if c > 1}
    findings['duplicate_descriptions'] = {d: c for d, c in findings['descriptions'].items() if c > 1}

    # Sitemap URLs whose page is not present on disk
    on_disk_urls = {url_for(p) for p in pages}
    findings['issues']['sitemap_url_missing_on_disk'] = sorted(sitemap_locs - on_disk_urls)
    # On-disk pages NOT in sitemap (excluding intentional noindex pages)
    intentional = {url_for(ROOT / r) for r in findings['pages_excluded_intentional']}
    findings['issues']['on_disk_not_in_sitemap'] = sorted(on_disk_urls - sitemap_locs - intentional)

    # Drop empty issue buckets
    findings['issues'] = {k: v for k, v in findings['issues'].items() if v}
    return findings


def print_summary(f: dict) -> None:
    print(f"=== AI-SEO audit summary ===")
    print(f"Pages scanned: {f['pages_scanned']}")
    print(f"Sitemap URLs:  {f['sitemap_url_count']}")
    print(f"Pages in sitemap: {f['pages_in_sitemap']}")
    print(f"Pages intentionally excluded (noindex): {len(f['pages_excluded_intentional'])}")
    print()
    print(f"=== Schema types (global, count of pages carrying type) ===")
    for t, c in sorted(f['global_schema_type_counts'].items(), key=lambda x: -x[1]):
        print(f"  {c:4d}  {t}")
    print()
    print(f"=== Issues (count : category) ===")
    if not f['issues']:
        print("  (none)")
    else:
        for k, v in sorted(f['issues'].items(), key=lambda x: -len(x[1])):
            print(f"  {len(v):4d}  {k}")
    print()
    print(f"=== Images ===")
    img = f['images']
    print(f"  total images:                       {img['total']}")
    print(f"  missing alt attribute:              {len(img['missing_alt_attr'])}")
    print(f"  empty alt (non-decorative guess):   {len(img['empty_alt'])}")
    print(f"  missing width or height:            {len(img['missing_width_or_height'])}")
    print(f"  missing loading=lazy:               {len(img['missing_loading_lazy_below_fold_guess'])}")
    print()
    if f['duplicate_titles']:
        print(f"=== Duplicate titles ({len(f['duplicate_titles'])}) ===")
        for t, c in sorted(f['duplicate_titles'].items(), key=lambda x: -x[1])[:10]:
            print(f"  x{c}  {t[:100]}")
        print()
    if f['duplicate_descriptions']:
        print(f"=== Duplicate descriptions ({len(f['duplicate_descriptions'])}) ===")
        for d, c in sorted(f['duplicate_descriptions'].items(), key=lambda x: -x[1])[:10]:
            print(f"  x{c}  {d[:100]}")


def main() -> int:
    f = audit()
    if '--json' in sys.argv:
        # Convert sets / counters for JSON
        f['global_schema_type_counts'] = dict(f['global_schema_type_counts'])
        f['titles'] = dict(f['titles'])
        f['descriptions'] = dict(f['descriptions'])
        f['schema_types_per_page'] = dict(f['schema_types_per_page'])
        print(json.dumps(f, indent=2, default=str))
    else:
        print_summary(f)
    return 0


if __name__ == '__main__':
    sys.exit(main())
