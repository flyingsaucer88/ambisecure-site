#!/usr/bin/env python3
"""Render an operator-facing freshness dashboard at /_internal/freshness.html.

Reads assets/data/blogs.json directly and groups overdue posts by tier.
The page lives at /_internal/ (already noindexed and gated in .htaccess via
the robots Disallow / lacking sitemap reference). Regenerate quarterly or
after a bulk review pass.
"""
import os, json, datetime

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SRC = os.path.join(ROOT, 'assets', 'data', 'blogs.json')
OUT = os.path.join(ROOT, '_internal', 'freshness.html')

CURRENT_REVIEW_WINDOW = 18 * 30   # 18 months
STALE_REVIEW_WINDOW = 24 * 30     # 24 months

def parse_date(s):
    try: return datetime.date.fromisoformat(s)
    except Exception: return None

def classify(entries, today):
    modern_overdue, archive_overdue, missing = [], [], []
    for e in entries:
        lr = parse_date(e.get('last_reviewed'))
        if not lr or 'freshness' not in e:
            missing.append({'url': e.get('url', '?'), 'reason': 'missing last_reviewed/freshness'})
            continue
        days = (today - lr).days
        fresh = e.get('freshness')
        if fresh == 'current' and days > CURRENT_REVIEW_WINDOW:
            modern_overdue.append({'url': e['url'], 'last_reviewed': e['last_reviewed'], 'days': days})
        elif fresh in ('archive', 'stale-review') and days > STALE_REVIEW_WINDOW:
            archive_overdue.append({'url': e['url'], 'last_reviewed': e['last_reviewed'], 'days': days})
    modern_overdue.sort(key=lambda r: -r['days'])
    archive_overdue.sort(key=lambda r: -r['days'])
    return modern_overdue, archive_overdue, missing

def row(r):
    return (f'<tr><td><a href="{r["url"]}" target="_blank" rel="noopener">{r["url"]}</a></td>'
            f'<td>{r["last_reviewed"]}</td><td class="num">{r["days"]}</td></tr>')

def missing_row(r):
    return f'<tr><td><a href="{r["url"]}" target="_blank" rel="noopener">{r["url"]}</a></td><td colspan="2">{r["reason"]}</td></tr>'

TEMPLATE = """<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="robots" content="noindex, nofollow" />
<title>Internal · Blog freshness dashboard</title>
<style>
  body {{ font-family: 'Source Sans 3', sans-serif; color: #3A3F40; margin: 32px 40px; max-width: 1100px; }}
  h1 {{ font-family: 'Montserrat', sans-serif; font-size: 28px; margin: 0 0 6px; }}
  .meta {{ color: #616A6C; font-size: 13.5px; margin-bottom: 24px; }}
  h2 {{ font-family: 'Montserrat', sans-serif; font-size: 18px; margin: 28px 0 10px; }}
  table {{ width: 100%; border-collapse: collapse; margin-bottom: 28px; }}
  th, td {{ padding: 8px 10px; text-align: left; font-size: 14px; border-bottom: 1px solid #E1E3E4; }}
  th {{ background: #F4F5F6; font-family: 'Montserrat', sans-serif; font-size: 12px; letter-spacing: 0.6px; text-transform: uppercase; color: #616A6C; }}
  td.num {{ text-align: right; font-family: 'JetBrains Mono', monospace; }}
  td.ok {{ text-align: center; color: #0A5562; padding: 20px; font-style: italic; }}
  a {{ color: #E3222A; text-decoration: none; }}
  a:hover {{ text-decoration: underline; }}
  .pill {{ display: inline-block; background: #FCEEEE; color: #E3222A; font-family: 'JetBrains Mono', monospace; font-size: 11px; padding: 2px 8px; border-radius: 3px; letter-spacing: 0.4px; margin-right: 6px; }}
  .note {{ background: #FFF7E5; border-left: 3px solid #C49A4F; padding: 12px 16px; border-radius: 0 6px 6px 0; font-size: 13.5px; line-height: 1.6; margin: 18px 0; }}
</style>
</head>
<body>
<h1>Blog freshness dashboard</h1>
<p class="meta">Internal review surface. Rendered {today} by <code>tools/render-freshness-page.py</code>. <strong>{total}</strong> posts indexed · <span class="pill">{modern_count} modern overdue</span> <span class="pill">{archive_count} archive overdue</span> <span class="pill">{missing_count} missing metadata</span></p>

<div class="note">
<strong>How to use this page.</strong> Each row is a post whose <code>last_reviewed</code> stamp is older than the policy threshold (18 months for <em>current</em> posts, 24 months for <em>archive</em> / <em>stale-review</em> posts). Re-review, update <code>last_reviewed</code> in <code>assets/data/blogs.json</code>, and commit. The pre-commit hook will refuse a touched-blog commit without that bump.
</div>

<h2>Modern posts overdue ({modern_count})</h2>
<table>
  <thead><tr><th>URL</th><th>Last reviewed</th><th>Days</th></tr></thead>
  <tbody>
{rows_modern}
  </tbody>
</table>

<h2>Archive posts overdue ({archive_count})</h2>
<table>
  <thead><tr><th>URL</th><th>Last reviewed</th><th>Days</th></tr></thead>
  <tbody>
{rows_archive}
  </tbody>
</table>

{missing_section}

<p class="meta">Regenerate: <code>python3 tools/render-freshness-page.py</code></p>
</body>
</html>
"""

def main():
    with open(SRC) as f:
        data = json.load(f)
    entries = data['entries']
    today = datetime.date.today()
    modern, archive, missing = classify(entries, today)
    rows_modern  = '\n'.join(row(r) for r in modern) or '<tr><td colspan="3" class="ok">No modern posts overdue. ✓</td></tr>'
    rows_archive = '\n'.join(row(r) for r in archive) or '<tr><td colspan="3" class="ok">No archive posts overdue. ✓</td></tr>'
    if missing:
        missing_rows = '\n'.join(missing_row(r) for r in missing)
        missing_section = (
            '<h2>Missing metadata (' + str(len(missing)) + ')</h2>'
            '<table><thead><tr><th>URL</th><th colspan="2">Reason</th></tr></thead><tbody>' +
            missing_rows + '</tbody></table>'
        )
    else:
        missing_section = ''
    html = TEMPLATE.format(
        today=today.isoformat(),
        total=len(entries),
        modern_count=len(modern),
        archive_count=len(archive),
        missing_count=len(missing),
        rows_modern=rows_modern,
        rows_archive=rows_archive,
        missing_section=missing_section,
    )
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f"wrote {OUT}: modern overdue={len(modern)} archive overdue={len(archive)} missing={len(missing)}")

if __name__ == '__main__':
    main()
