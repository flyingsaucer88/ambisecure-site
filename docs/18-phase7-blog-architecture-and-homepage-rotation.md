# 18. Phase 7 — Blog Architecture & Homepage Rotation

**Date:** 2026-05-11
**Status:** Implemented end-to-end. Production-ready.
**Companions:** `docs/16-legacy-content-consolidation.md`, `docs/17-blog-classification-and-editorial-mapping.md`.

This document describes the blog architecture and the homepage editorial-rotation system added in Phase 7, and the future backlog the design leaves room for.

---

## 1. What Phase 7 delivers

| Deliverable | Where |
|-------------|-------|
| Full legacy content consolidation (33 non-blog pages + 47 blog posts) | `/legacysitedata/` → `docs/16` + `docs/17` |
| Editorial classification (AmbiSecure / Ambimat / eSIM) for every legacy blog | `docs/17` |
| Scalable blog architecture: archive landing, per-archive pages, categories landing, per-category pages | `/blog/archive/`, `/blog/archive/<slug>/`, `/blog/categories/`, `/blog/categories/<cat>/` |
| 24 historical archive pages (AmbiSecure-classified legacy blogs, "originally published" framed) | `/blog/archive/<slug>/` |
| 19 category landing pages (mix modern + archive newest-first) | `/blog/categories/<cat>/` |
| 47 legacy blog URLs preserved via 301 redirects | `.htaccess` |
| Homepage daily-rotating blog spotlight (3 featured + 1 historical) | JS on `/` |
| Homepage banner / highlight system (JSON-defined, editable in one file) | JS + config on `/` |
| Newest-first modern blog index | `/blog/` rebuilt |

---

## 2. Blog architecture

### URL structure

```
/blog/                                  -- Modern blog index, newest-first
/blog/<slug>/                           -- 12 canonical modern posts
/blog/archive/                          -- Historical archive landing
/blog/archive/<slug>/                   -- 24 preserved historical posts
/blog/categories/                       -- Categories landing
/blog/categories/<cat-slug>/            -- 19 category pages (mixes modern + archive)
```

### Categories

Cross-cut topics common to modern + archive. Each category page lists every entry in that category, newest first, with a clear ARCHIVE badge on historical items.

| Category | Modern count | Archive count |
|----------|-------------:|--------------:|
| FIDO | 6 | 2 |
| WebAuthn | 3 | 0 |
| Passwordless | 3 | 4 |
| MFA | 3 | 6 |
| Smart Cards | 2 | 4 |
| JavaCard | 2 | 1 |
| Transit | 3 | 4 |
| DESFire | 2 | 0 |
| Offline Authentication | 2 | 0 |
| Enterprise MFA | 1 | 2 |
| Biometrics | 0 | 2 |
| IoT Security | 0 | 3 |
| Cyber Threats | 0 | 4 |
| Government Identity | 0 | 4 |
| ePassport | 0 | 2 |
| Identity | 1 | 1 |
| Cybersecurity | 2 | 0 |
| Cryptography | 1 | 0 |
| Privacy | 0 | 1 |

(Counts based on the classification in `docs/17`.)

### Historical framing rules

Every page under `/blog/archive/` carries:

- A prominent **HISTORICAL ARCHIVE** badge (amber) with the original publication date.
- An "Archive" eyebrow above the H1 (not "Engineering blog").
- A static disclaimer in the dek explaining that the article is preserved as-of the original date.
- A "Looking for the current take?" call-out where a related modern article exists (cross-link to it).
- Category chips that link forward to the modern category page (so visitors find the current writing on the same topic).

The chrome distinction (amber archive band vs. the standard red AmbiSecure band) is intentional and visible at-a-glance. Search engines see a clean `<title>` of the form `<Title> (Archive 2021) — AmbiSecure Blog` plus an `Article` JSON-LD with `"articleSection": "Historical archive"`.

### Newest-first ordering

- `/blog/` lists the 12 modern posts in date-descending order.
- `/blog/archive/` lists 24 archive posts in date-descending order.
- `/blog/categories/<cat>/` lists everything in that category, modern + archive, in date-descending order. Visitors naturally see modern first and historical after.

This satisfies the "newer/recently relevant blogs appear first; older/historical blogs move deeper" requirement without per-page pagination logic.

### Why no `/blog/page/2/` pagination yet

12 modern + 24 archive = 36 total entries, distributed across three index pages (`/blog/`, `/blog/archive/`, 19 category pages). None of those individual indexes exceeds 12 entries that I want above the fold. Numeric pagination (`/blog/page/2/`) becomes worth implementing when an index exceeds ~24 entries; until then it would add complexity without UX benefit.

When the next 12+ modern posts ship (Phase 8 content sprint planned), pagination will be added to `/blog/` only. The archive and category pages will keep listing everything because they are reference surfaces.

---

## 3. Homepage rotation systems

### A. Daily blog spotlight

**Data source:** `/assets/js/blog-pool.js` — generated from the classification table. Defines `window.AS_BLOG_POOL`: 36 entries (12 modern + 24 archive), each with `{title, url, date, summary, categories, type}`.

**Renderer:** `/assets/js/blog-spotlight.js`.

**Algorithm:**

```js
const utcMidnight = Date.UTC(year, month, day);   // resets at 00:00 UTC daily
const seed = Math.floor(utcMidnight / 86400000);  // integer day since epoch
// Linear-congruential picker — deterministic per seed, distinct picks per day.
```

**Mount points:** any `<div>` with class `hp-spotlight-featured`, `hp-spotlight-modern`, or `hp-spotlight-archive`. The home page currently uses `hp-spotlight-featured` (3 mixed-era cards) and `hp-spotlight-archive` (1 historical card).

**Properties:**

- Same content shown to every visitor for a full UTC day, then rotates at 00:00 UTC.
- Zero network calls; zero `localStorage`; zero `fetch`.
- CSP-safe: same-origin scripts only.
- Graceful degradation: static fallback cards live in the HTML; JS replaces them on load. With JS disabled the visitor still sees three valid blog entries.

### B. Highlight banner / featured-card system

**Data source:** `/assets/js/highlight-banner-config.js` — defines `window.AS_HOMEPAGE_BANNERS`: an ordered array of banner entries.

**Renderer:** `/assets/js/highlight-banner.js`.

**Banner shape:**

```js
{
  id:           "string",
  enabled:      true,
  eyebrow:      "FEATURED · OnePass platform",
  title:        "Hardware-rooted identity, ready for procurement.",
  body:         "Short body copy.",
  accent:       "red" | "cyan" | "dark",
  primaryCta:   { label: "Explore OnePass", url: "/products/onepass-platform/" },
  secondaryCta: { label: "Talk to engineering", url: "/contact/" }, // optional
  startsAt:     "2026-01-01T00:00:00Z",   // optional activation
  endsAt:       "2026-12-31T23:59:59Z"    // optional expiry
}
```

**Pick rule:** first entry where `enabled === true` and the current time is within the optional `startsAt..endsAt` window. Reorder the array to change priority. If no banner is active, the slot is hidden (no empty space).

**Mount point:** any `<div>` with class `hp-banner-slot`. The home page has one.

**How editors rotate banners:**

1. Open `/assets/js/highlight-banner-config.js`.
2. Add a new entry at the top of the array, or flip an `enabled` flag, or change `startsAt`/`endsAt`.
3. Save, upload via FTP/SFTP, refresh.

No backend, no CMS, no build step. Static-site native.

### C. Why JS-based and not server-side

- The site is static HTML on Hostinger LiteSpeed. No PHP, no Node, no SSR.
- Pre-generating one homepage per day per visitor would be wasteful.
- A daily deterministic seed gives the same content to every visitor on a given UTC day, so the experience is consistent for shared screenshots and external link previews.
- CSP `script-src 'self'` is preserved — no remote scripts, no inline scripts.

---

## 4. SEO & content governance

### Canonicals

- Each modern blog post is its own canonical URL at `/blog/<slug>/`.
- Each archive post is its own canonical URL at `/blog/archive/<slug>/`.
- Legacy URLs 301 to the canonical destination. No competing canonical chain.
- Categories landing and per-category pages are `CollectionPage` schema, not duplicates of the blog index.

### Duplicate-content avoidance

- Modern + archive entries with the same topic are **separate canonical URLs**. Where a modern equivalent exists, the archive page links to it via a "Looking for the current take?" callout; the modern article does not back-link unless adding context.
- The three legacy URLs that already had modern replacements (`b01`, `b02`, `b03`) 301 straight to the modern slug — no archive page created for those.
- One legacy slug (`b44 challenges-to-iot-security`) had the same content as another (`b40`); only one archive page exists, and `b44` 301s to the same destination.

### Internal linking topology

| From | To |
|------|-----|
| `/blog/` | All 12 modern posts; categories landing; archive landing; CTAs to products / services. |
| `/blog/<slug>/` (each modern post) | Cross-links to related tools, references, products, and other blog posts (built in Phase 4). |
| `/blog/archive/<slug>/` (each archive post) | Cross-links to its modern equivalent where one exists; categories chips; 3 related archive cards; "Open archive" callout. |
| `/blog/categories/<cat>/` | Lists every entry in that category, newest first. |
| Home page | Spotlight + archive spotlight + banner all link into the blog graph. |
| Footer of every page | Engineering Blog · Browse by topic · Historical archive. |

### Keyword cannibalisation

The largest cannibalisation risk was MFA — multiple legacy posts and 2 modern posts. The classification table pinpoints which modern post each historical entry forward-links to, so search-result clustering converges on the modern canonical.

---

## 5. QA performed

- `xmllint --noout sitemap.xml` — passes; 212 URLs after Phase 7 (167 + 45 new).
- 24 archive pages + 19 category pages all carry: `<title>`, `<meta description>`, `<link rel="canonical">`, OG tags, `BreadcrumbList` + page-type JSON-LD.
- All 47 legacy blog URLs covered in `.htaccess` (Phase 7 block, plus 3 already from Phase 5).
- Apache `.htaccess` self-redirect / loop audit passed (no Redirect that would loop on its own target).
- Site-wide internal-link audit (post-Phase 7): no new broken hrefs.
- JS files (blog-pool.js, blog-spotlight.js, highlight-banner-config.js, highlight-banner.js) lint-clean via `node --check`.
- No new external dependencies; CSP unchanged.
- Mobile responsiveness: archive landing, category pages, and homepage spotlight all use the existing `.grid-3` responsive grid. Banner uses `flex-wrap: wrap`. No new CSS classes introduced.

---

## 6. Files changed in Phase 7

### Added (45 pages + 4 JS assets + 3 docs)

```
blog/index.html                                            (rebuilt)
blog/archive/index.html
blog/archive/{24 slugs}/index.html
blog/categories/index.html
blog/categories/{19 slugs}/index.html
assets/js/blog-pool.js
assets/js/blog-spotlight.js
assets/js/highlight-banner.js
assets/js/highlight-banner-config.js
docs/16-legacy-content-consolidation.md
docs/17-blog-classification-and-editorial-mapping.md
docs/18-phase7-blog-architecture-and-homepage-rotation.md
```

### Modified (3)

```
index.html               -- banner slot + spotlight section + archive spotlight + 4 new script tags
.htaccess                -- +47 blog-URL Redirect 301 rules + 1 new product-canonical redirect
sitemap.xml              -- +45 URLs (167 → 212)
```

### Not modified

- All product, service, solution, technology, industry, reference, and tool pages — unchanged.
- All Phase 1–6 redirect rules — preserved.
- CSS — no new classes needed; existing design system absorbed everything.
- Security headers — CSP unchanged.

---

## 7. Backlog — preserved for future phases

### Phase 8 (suggested scope)

- **Security review of new JS surfaces.** Static lint passes. A formal security review of `blog-pool.js`, `blog-spotlight.js`, `highlight-banner-config.js`, and `highlight-banner.js` for XSS hygiene during dynamic rendering. (All four use `textContent`-style escape helpers internally; recommend formalising a `dom-purify`-style review.)
- **Analytics integration.** Plausible (recommended) or GA4 inserted via a single `<head>` snippet. Update CSP `script-src` accordingly.
- **Production hosting validation.** Push Phase 7 to Hostinger staging; run the smoke-test script from `docs/13` §6; submit updated `sitemap.xml` to Google Search Console + Bing.

### Phase 9 (suggested scope)

- **OG image generation system.** Phase 6 noted no per-page OG images. Suggested: 1200×630 templates per product family + per blog category, rendered once at design time and stored under `/assets/img/og/`.
- **Media optimisation.** The three legacy certification badges are ~1.1 MB each (preserved as-is in Phase 6). Convert to WebP at design time and serve via `<picture>` with PNG fallback.
- **Lighthouse CI.** GitHub Actions workflow that runs Lighthouse against `/`, `/blog/`, and one product page on every commit. Fail the build if Performance < 90 or Accessibility < 95.

### Phase 10 (suggested scope)

- **Customer case studies (3 anonymised).** Highest commercial-conversion value identified in `docs/13` §14. Format: problem → architecture diagram → AmbiSecure components used → measurable outcome → quote.
- **Customer stories on the home page.** New `.hp-stories` mount surfaced via the same JSON-driven config approach as `highlight-banner-config.js`.
- **Optional documentation split.** If the documentation footprint grows past ~80 pages, consider a `developer.ambimat.com` subdomain split (flagged in Phase 6 backlog).

### Phase 11+ (long horizon)

- **Per-category pagination.** Once any category exceeds 24 entries.
- **Tag system separate from categories.** Currently `_parsed.tags` from the legacy markdown is captured but not rendered. If a single post needs to surface under more lightweight tags than the formal category set, a `/blog/tags/<tag>/` surface can be added without touching the category architecture.
- **Search.** The references system has a JS-side search. The blog could share that pattern — `assets/js/blog-search.js` reading the same `blog-pool.js` data — but only when the corpus exceeds ~50 entries.

None of the above is implemented in Phase 7. All are documented here so the architecture's growth path is visible at handoff.

---

## 8. Editorial governance

Going forward, the editorial workflow is:

1. **New AmbiSecure-themed blog** → write at `/blog/<slug>/index.html` using the modern blog template.
2. **Add to `MODERN_POSTS` in `/tmp/gen-phase7.py`** (or re-run a `gen-phase8.py` that subsumes it) so the spotlight pool and category pages pick it up.
3. **Update `assets/js/blog-pool.js`** by re-running the generator. Spotlight rotates automatically the next UTC day.
4. **Editorial banner** → edit `/assets/js/highlight-banner-config.js` in place. No regeneration needed.
5. **Cross-property content** → if Ambimat or eSIM is the better owner, write on that property and link from AmbiSecure rather than re-publishing.

The classification table in `docs/17` is the editorial constitution. Reclassifications go through that document plus a corresponding `.htaccess` change.
