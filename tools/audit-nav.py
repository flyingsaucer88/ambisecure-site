#!/usr/bin/env python3
"""Audit the primary site navigation for the Services item and section integrity.

The header nav is hard-coded (inline) into every page rather than generated from
a shared partial, so a menu item can silently go missing or drift on a subset of
pages. Services was originally absent from the header on every page even though a
full /services/ section exists; this audit locks in the fix and prevents any
nav item from disappearing on a subset of pages.

For every page that ships the primary nav (``<nav aria-label="Primary">``) it
verifies:

  * the full expected top-level menu is present, in order:
    Products, Solutions, Technologies, Services, Industries, Resources, Blog, About
  * Services appears exactly once and resolves to /services/
  * on /services/ and every /services/.../ page, Services is the active item
    (class="active") and no other top-level item is marked active

The same <ul class="nav-links"> is the desktop bar and the mobile drawer (the
hamburger toggles .open), so a single presence check covers both breakpoints.

    python3 tools/audit-nav.py     # report problems, exit 1 if any

Wired into tools/audit-all.sh.
"""
import glob, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

EXPECTED = ['/products/', '/solutions/', '/technologies/', '/services/',
            '/industries/', '/resources/', '/blog/', '/about/']
LABELS = {'/products/': 'Products', '/solutions/': 'Solutions',
          '/technologies/': 'Technologies', '/services/': 'Services',
          '/industries/': 'Industries', '/resources/': 'Resources',
          '/blog/': 'Blog', '/about/': 'About'}

NAV_RE = re.compile(r'<nav aria-label="Primary">.*?</nav>', re.S)
LI_RE = re.compile(r'<li><a href="(/[a-z-]*/?)"((?: class="active")?)>([^<]+)</a></li>')


def pages():
    for p in glob.glob(os.path.join(ROOT, '**/index.html'), recursive=True):
        rel = os.path.relpath(p, ROOT)
        if rel.startswith(('dist/', 'legacysitedata/')):
            continue
        yield rel, p


def main():
    problems = []
    checked = 0
    for rel, path in pages():
        html = open(path, encoding='utf-8').read()
        m = NAV_RE.search(html)
        if not m:
            # Pages without the primary nav are non-content stubs (e.g. the
            # /products/iot-security-chipset/ redirect stub). Nothing to check.
            continue
        checked += 1
        nav = m.group(0)
        items = LI_RE.findall(nav)
        order = [href for href, _active, _label in items]

        # 1. full expected menu present, in order
        if order != EXPECTED:
            problems.append(f'{rel}: nav order {order} != expected {EXPECTED}')
            continue

        # 2. Services exactly once, correct label
        svc = [(h, a, l) for h, a, l in items if h == '/services/']
        if len(svc) != 1:
            problems.append(f'{rel}: expected exactly one Services item, found {len(svc)}')
            continue
        if svc[0][2] != 'Services':
            problems.append(f'{rel}: Services label is {svc[0][2]!r}')

        # 3. active-state on /services/ pages
        is_services = rel == 'services/index.html' or rel.startswith('services/')
        active = [h for h, a, l in items if a]
        if is_services:
            if active != ['/services/']:
                problems.append(f'{rel}: /services/ page active items {active} != ["/services/"]')
        else:
            if '/services/' in active:
                problems.append(f'{rel}: non-services page wrongly marks Services active')

    if problems:
        print(f'=== nav audit === {checked} pages with primary nav')
        for p in problems:
            print(f'  FAIL  {p}')
        print(f'audit-nav: {len(problems)} problem(s)')
        return 1
    print(f'=== nav audit === {checked} pages with primary nav')
    print(f'  ok  Services present once and resolving to /services/ on every page')
    print(f'  ok  full 8-item menu in order on every page; active-state correct on /services/ pages')
    return 0


if __name__ == '__main__':
    sys.exit(main())
