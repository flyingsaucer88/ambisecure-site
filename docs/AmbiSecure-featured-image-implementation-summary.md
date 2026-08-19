# AmbiSecure Featured-Image Implementation — Summary

**Date:** 2026-07-17
**Source package:** `docs/AmbiSecure LinkedIn image brief.zip`
**Report CSV:** `docs/AmbiSecure-featured-image-implementation-report.csv`
**Status:** Source + build artifact complete and verified. **Live deploy and LinkedIn verification outstanding.**

---

## Platform reality (affects how the brief maps)

This site is **static HTML in git** — no WordPress, no CMS, no database, no media library, no SEO plugin.
Verified: no `package.json`, `wp-config.php`, `composer.json`, or any SSG config. Every page hardcodes its own
`<head>` metadata.

Brief sections were mapped as follows:

| Brief expects | Reality here | Mapping used |
|---|---|---|
| Media library upload | No media system | Files committed to `assets/img/og/featured/` |
| Featured image field | No such field | `og:image` **is** the featured image |
| Media/attachment ID | No media DB | `N/A` — asset URL is the identifier |
| Database backup | No database | **git** is the rollback path (working tree was clean at start) |
| SEO plugin config | No plugin | Metadata written directly into each page's `<head>` |
| Cache clearing / CDN purge | No CDN; `Cache-Control: public, max-age=300` | 5-min TTL self-expires; deploy rewrites files |

No plugin, framework, or metadata library was introduced.

---

## Numbers

| Metric | Count |
|---|---|
| Total pages supplied | 27 |
| Pages successfully updated (source) | **27** |
| Images installed | **27** (byte-identical to ZIP originals) |
| Alt-text fields added | **54** (27 × `og:image:alt` + 27 × `twitter:image:alt`) |
| Open Graph images updated | **27** |
| X/Twitter images updated | **27** |
| LinkedIn previews verified | **0 — cannot be run from this environment** |
| Redirected / corrected URLs | **0** — all 27 resolved 200 directly |
| Missing pages | **0** |
| Missing images | **0** |
| Metadata conflicts found | **0** (every page had exactly one `og:image`) |
| Pages requiring manual review | **27** (LinkedIn preview only) |

## Pre-flight validation (all passed)

- 27 images in ZIP, 27 rows in CSV, **1:1 match both directions**.
- All 27 images **exactly 1200 × 630 PNG** (verified via PIL, not metadata claims).
- **0 duplicate filenames**, **0 duplicate image content** (md5).
- All 27 URLs exist locally **and** returned live HTTP 200 — no redirects, no ambiguity.
- Installed files verified **byte-identical** (`cmp`) to ZIP originals — no crop, rename, resize, or re-encode.

## What changed per page

Exactly one block per page, inserted after `og:url`, plus the Twitter pair:

```html
<meta property="og:image" content="https://ambisecure.ambimat.com/assets/img/og/featured/<file>.png" />
<meta property="og:image:secure_url" content="…same…" />
<meta property="og:image:type" content="image/png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="<exact CSV alt text>" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="…same…" />
<meta name="twitter:image:alt" content="<exact CSV alt text>" />
```

**Before:** all 27 pages pointed at generic category fallbacks — `products.png` shared by 6 product pages,
`industries.png` by 5, `solutions.png` by 4, `technologies.png` by 2, `default.png` on the homepage.
`og:image:secure_url` and `twitter:image:alt` were absent sitewide; `og:image:alt` was generic or missing.

**After:** **27 unique images across 27 pages — zero cross-assignment, zero shared fallback.**

## Verified

- 27/27: single `og:image`, matches CSV row, absolute HTTPS, `secure_url` matches, `image/png`, 1200×630,
  `og:image:alt` and `twitter:image:alt` both **byte-equal to the CSV alt text**, `summary_large_image`.
- 27/27: `canonical == og:url`, unchanged from before.
- **Scope:** exactly 27 HTML files modified; `git diff --name-only` confirms **no page outside the delivery sheet was touched**.
- Diff confirms **only image metadata changed** — titles, descriptions, `og:url`, `og:site_name`, canonical,
  body content, nav, structured data all untouched.
- `tools/audit-all.sh` → **ALL AUDITS PASSED**.
- Build artifact: 27 featured images present, all 1200×630; homepage `og:image` correct in built HTML.

## Deviation from the brief (approved)

**Brief §3/§17 say "do not remove old media."** The rollout orphaned `assets/img/og/industries.{png,webp,svg}`
(all 5 pages using `industries.png` were in the approved 27), and the repo's `audit-all.sh` — a **hard gate in the
deploy workflow** — fails on unreferenced assets >50 KB. That created a deadlock: verification needs deploy,
deploy needs the audit to pass, the audit needs the orphan gone.

Resolved by explicit user approval: the 3 files were removed. This is git, not a CMS media library, so the
deletion is fully reversible and §3's rollback intent is preserved.

**Restore command:**
```
git checkout 6a63f30 -- assets/img/og/industries.png assets/img/og/industries.webp assets/img/og/industries.svg
```

No other old media was removed. `products.png`, `solutions.png`, `technologies.png`, `default.png`, etc. all remain
in place (still referenced by non-approved pages).

## Outstanding — cannot be completed from this environment

1. **Deploy.** `gh` is unauthenticated here and deploy is a manual `workflow_dispatch`.
   Run: **Actions → Deploy to Hostinger → Run workflow → `main`**.
   Until then the 27 image URLs will 404 live and page source will still show old fallbacks.
2. **LinkedIn Post Inspector (§15).** Requires an authenticated browser session. Must be run manually
   at <https://www.linkedin.com/post-inspector/> for each of the 27 canonical URLs, **after** deploy.
3. **Live page-source verification (§13).** Re-runnable once deployed; the checks are scripted and green
   against the built artifact.

Per §18/§20, no row is marked plain **Complete** — all 27 are **Complete with note**, because public rendered
metadata cannot be verified until deploy.

## Unrelated issue found (not fixed — needs your decision)

`reports/` is **not excluded** by `tools/build-hostinger-package.sh`, so internal audit documents are published
publicly. Confirmed live:

- `https://ambisecure.ambimat.com/reports/gsc-crawled-not-indexed-audit.md` → **HTTP 200**
- `https://ambisecure.ambimat.com/reports/gsc-crawled-not-indexed-remediation.md` → **HTTP 200**

Pre-existing, unrelated to this work, and out of scope. Fix would be adding `--exclude='/reports/'` to the build
script. **Not done** — awaiting your approval. (This report was written to `docs/`, which *is* excluded.)

## Acceptance checklist

| §20 item | Status |
|---|---|
| All 27 ZIP images inspected | ✅ |
| Every image has a CSV mapping | ✅ |
| Every approved page has the correct image | ✅ (source + artifact) |
| Every image has the supplied alt text | ✅ byte-equal to CSV |
| Every page outputs correct `og:image` | ✅ (source + artifact) |
| Every page outputs `og:image:alt` | ✅ |
| Absolute HTTPS image URL | ✅ |
| Every social image 1200 × 630 | ✅ verified on actual files |
| Correct canonical URL | ✅ unchanged, `== og:url` |
| No generic fallback overriding page image | ✅ 27 unique images |
| No old-domain/staging/localhost URL | ✅ |
| No incorrect image on another page | ✅ zero cross-assignment |
| Public page source verified | ⏳ **pending deploy** |
| Caches cleared | ⏳ **pending deploy** (5-min TTL, no CDN) |
| LinkedIn previews refreshed | ⏳ **pending — manual** |
| Implementation report complete | ✅ |
| Rollback path available | ✅ git; nothing committed yet |
