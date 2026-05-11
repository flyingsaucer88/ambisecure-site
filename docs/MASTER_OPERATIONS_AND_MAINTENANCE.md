# MASTER OPERATIONS AND MAINTENANCE — AmbiSecure site

**Owner:** AmbiSecure engineering
**Last updated:** 2026-05-11 (Phase 11 consolidation)

This is the single operational document for the AmbiSecure static site. It supersedes every per-phase document that used to live in `docs/`. Open items and future work live in [`OPEN_ITEMS_AND_FUTURE_BACKLOG.md`](OPEN_ITEMS_AND_FUTURE_BACKLOG.md).

If you are reading this for the first time, start at §1 (Platform) → §3 (Deployment) → §15 (Maintenance checklist).

---

## 1. Platform overview

| Property | Value |
|----------|-------|
| Architecture | Static HTML + vanilla CSS/JS. No build step. No backend. |
| Hosting | Hostinger LiteSpeed (production). |
| Domain | `https://ambisecure.ambimat.com/` |
| Ecosystem | Sub-property of Ambimat Electronics (`ambimat.com`); sister to `esim.ambimat.com`. |
| HTML pages on disk | ~290 |
| Sitemap canonical URLs | 305 |
| Practical utility tools | 54 |
| Searchable reference databases | 12 |
| Modern blog entries | 21 |
| Historical archive entries | 24 |
| Case studies | 3 |
| Brochures | 7 (1 landing + 6 platform overviews) |
| Videos | 8 (7 hosted + 1 archived elsewhere) |
| `Redirect 301` rules in `.htaccess` | 138 |
| `RedirectMatch 301` rules | 2 |
| Total Lighthouse target | ≥95 Performance / ≥95 Accessibility / 100 BP / 100 SEO |

### Tech stack

- HTML5, CSS3 with a single `assets/css/main.css` (~2.6k lines).
- Self-hosted fonts at `/assets/fonts/` (Montserrat, Source Sans 3, JetBrains Mono — Latin subsets, variable WOFF2). No Google Fonts dependency.
- Vanilla JS, defer-loaded. No framework, no bundler, no transpilation.
- JSON-LD for structured data on every page.
- `xmllint`, `cwebp`, `ffmpeg`, `sips` (macOS) for media asset chores.

### Brand tokens

```
--brand-red:    #E3222A
--brand-grey:   #616A6C
--brand-dark:   #3A3F40
--secure-cyan:  #0E8C9C
```

Fonts: Montserrat (display), Source Sans 3 (body), JetBrains Mono (code).

---

## 2. Top-level directory layout

```
/                       Production-served root
├── index.html          Homepage
├── 404.html            Custom 404
├── sitemap.xml         305 canonical URLs
├── .htaccess           Apache/LiteSpeed config (security headers, 138 redirects)
├── robots.txt
├── README.md
├── about/              About, team, certifications
├── products/           12 product pages
├── solutions/          15 solution pages
├── technologies/       12 technology overviews
├── industries/         5 industry verticals + index
├── resources/          Utility-tool surface (54 tools)
├── references/         12 searchable reference databases
├── services/           4 service overviews
├── partners/           Partner programme front door
├── trust/              Trust center, vulnerability disclosure
├── support/            Support landing
├── contact/            Contact form (static)
├── blog/               21 modern engineering posts
│   ├── categories/     19 category landings
│   ├── archive/        24 historical archive posts
│   └── page/2/         Pagination scaffold
├── case-studies/       1 landing + 3 anonymised studies (Phase 10)
├── brochures/          1 landing + 6 platform overviews (Phase 10)
├── engagement-models/  Engagement-model landing (Phase 10)
├── videos/             1 landing + 7 per-video pages (Phase 9)
├── tags/               1 landing + 74 per-tag pages (Phase 11)
├── search/             Client-side blog search (Phase 11)
├── privacy/            Analytics preferences (Phase 11)
├── assets/
│   ├── css/main.css    Single stylesheet
│   ├── css/fonts.css   @font-face for self-hosted fonts
│   ├── fonts/          Variable WOFF2 (montserrat, source-sans-3, jetbrains-mono)
│   ├── img/            All site imagery + OG images + tool icons + videos
│   ├── js/             nav.js, analytics.js, analytics-config.js,
│   │                   analytics-prefs.js, blog-pool.js, blog-search.js,
│   │                   blog-spotlight.js, highlight-banner.js,
│   │                   highlight-banner-config.js, video-facade.js,
│   │                   web-vitals.js, plus lib/ and tools/
│   ├── data/           blogs.json (source of truth), blog-search-index.json
│   └── video/          Self-hosted bio MP4 (879 KB)
├── tools/              Operator scripts:
│   ├── regen-blog-pool.py
│   ├── lint-htaccess.py
│   └── gen-og-image.py
├── legacysitedata/     Frozen scrape of the legacy WordPress site (gitignored MP4s)
├── docs/               THIS DOC + OPEN_ITEMS_AND_FUTURE_BACKLOG.md (only these two)
├── .lighthouserc.json  Lighthouse CI config
└── .github/workflows/  Lighthouse CI + htaccess-lint + sitemap-validate
```

---

## 3. Deployment

### 3.1 Local preview

```bash
python3 -m http.server 8080
# Visit http://localhost:8080/
```

That's the whole local-dev story. There is no other dev server needed.

### 3.2 Hostinger upload procedure

1. Connect via SFTP (Hostinger control panel exposes credentials).
2. Sync the entire repo *except* `docs/`, `legacysitedata/`, `.git/`, `tools/`, `node_modules/`, `.github/`, `.lighthouseci/` into `public_html/`.
3. Confirm `.htaccess` arrived correctly (Hostinger sometimes truncates if FTP timed out — re-upload that one file specifically if anything below the redirect block is missing).
4. Open the smoke-test checklist in §3.4.

A working `.htaccess` rsync exclude list:

```
--exclude=docs/
--exclude=legacysitedata/
--exclude=.git/
--exclude=.github/
--exclude=tools/
--exclude=.lighthouseci/
--exclude=node_modules/
--exclude=.DS_Store
--exclude='*.swp'
```

### 3.3 `.htaccess` posture

- HTTPS forced. HSTS set with 1-year max-age + includeSubDomains.
- CSP: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://i.ytimg.com; font-src 'self' data:; frame-src https://www.youtube-nocookie.com https://www.youtube.com; media-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self';`
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: a minimal set (camera, microphone, geolocation off).
- Custom 404 routed to `/404.html`.
- 138 plain `Redirect 301`s + 2 `RedirectMatch 301`s. Lint with `python3 tools/lint-htaccess.py` before every commit that touches redirects.

When the CSP needs extending (e.g. a new analytics provider): update the meta + `.htaccess` blocks together. The CSP only fires when served by Apache — local `python3 -m http.server` does not apply it.

### 3.4 Post-deploy smoke test (Hostinger)

In order, against the live origin:

1. `curl -I https://ambisecure.ambimat.com/` — 200, HSTS present, CSP present, no `X-Powered-By` leak.
2. `curl -I https://ambisecure.ambimat.com/products/onepass-card/` — 200.
3. `curl -I -L https://ambisecure.ambimat.com/learn/how-it-work` — 301 → 200 at `/blog/how-fido-authentication-works/`.
4. `curl -sS https://ambisecure.ambimat.com/sitemap.xml | xmllint --noout -` — clean.
5. Open `/` in a browser, DevTools Console — no JS errors. Banner rotates. Blog spotlight populates within ~1 second.
6. Open `/search/` — type a query — results appear within 200 ms of typing (after the index loads).
7. Open `/privacy/` — analytics-prefs widget renders, buttons toggle state, refresh preserves choice.

### 3.5 Rollback

The previous deploy is whatever the last commit on `main` was. To roll back: `git revert <bad-sha>` (or `git reset --hard <good-sha>` if not yet pushed), re-deploy. The site has no database; rollback is purely file-content.

---

## 4. Analytics operations

### 4.1 Architecture

Two-file module, plus the runtime API exposed to other scripts:

- `assets/js/analytics-config.js` — operator-controlled. Sets `provider: "none" | "plausible" | "ga4"`, plus per-provider config and DNT/opt-out flags.
- `assets/js/analytics.js` — loader. Reads the config, injects the provider snippet, exposes `AS_ANALYTICS.report(payload)` for in-process modules (e.g. Web Vitals).
- `assets/js/analytics-prefs.js` — the user-facing opt-out UI rendered on `/privacy/`.

Bootstrapped from `assets/js/nav.js` (loaded on every page).

### 4.2 Provider toggle

```js
// analytics-config.js
window.AS_ANALYTICS = {
  provider: "none",          // "none" | "plausible" | "ga4"
  respectDoNotTrack: true,
  optOutLocalStorageKey: "as-analytics-opt-out",
  plausible: { domain: "ambisecure.ambimat.com",
               scriptSrc: "https://plausible.io/js/script.js" },
  ga4:       { measurementId: "G-XXXXXXXX",
               anonymizeIp: true }
};
```

To enable analytics, flip `provider` to the desired value and reload.

### 4.3 Required CSP delta

| Provider | `script-src` addition | `connect-src` addition |
|----------|------------------------|--------------------------|
| Plausible | `https://plausible.io` | `https://plausible.io` |
| GA4 | `https://www.googletagmanager.com` | `https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com` |

Both deltas need to be applied in `.htaccess` AND in any `<meta http-equiv="Content-Security-Policy">` blocks before flipping the provider on.

### 4.4 Privacy controls

| Layer | Behaviour |
|-------|-----------|
| Default | `provider: "none"` — no analytics scripts load. |
| `respectDoNotTrack: true` | DNT browsers see no analytics regardless of provider. |
| `optOutLocalStorageKey` | If the user sets `localStorage["as-analytics-opt-out"] = "1"` (via the `/privacy/` UI), analytics + Web Vitals stay silent. |
| `/privacy/` | Renders the opt-out widget via `analytics-prefs.js`. |
| Footer link | Every page footer carries a "Privacy" link to `/privacy/`. |

### 4.5 Web Vitals beacon

`assets/js/web-vitals.js` collects LCP, CLS, INP (or FID fallback), TTFB via native PerformanceObserver. Reports through `AS_ANALYTICS.report()` — never directly. Honours the same DNT + opt-out checks as analytics. Loaded on every page via the same nav.js bootstrap as analytics.

When the operator turns analytics on, Web Vitals automatically reports through the active provider:

- Plausible: `plausible("WebVital", { props: { metric, value, path }})`.
- GA4: `gtag("event", metric, { value, page_path, metric_id })`.

---

## 5. Homepage workflow

`index.html` is hand-edited. It has three rotating surfaces driven by config files:

### 5.1 Banner system

Edit `assets/js/highlight-banner-config.js` only. Each entry has `id`, `enabled`, `eyebrow`, `title`, `body`, `accent` (red/cyan/dark), `primaryCta`, optional `secondaryCta`. First enabled entry with a matching time window wins. Reorder the array to change priority.

### 5.2 Blog spotlight

`assets/js/blog-spotlight.js` reads `assets/js/blog-pool.js` (auto-generated) and picks one entry per UTC day. The seed is deterministic per day; the same visitor sees the same post.

### 5.3 Static homepage sections

Phase 9 sections (Core pillars, Videos teaser, Where AmbiSecure Fits) and Phase 10 sections (Commercial surfaces) are hard-coded in `index.html`. To change them, edit the HTML.

---

## 6. Blog workflow

### 6.1 Source of truth

`assets/data/blogs.json` (Phase 11). Schema:

```json
{
  "version": 1,
  "generated": "2026-05-11",
  "entries": [
    { "title": "...", "url": "/blog/<slug>/", "date": "YYYY-MM-DD",
      "summary": "...", "categories": [...], "tags": [...],
      "type": "modern" | "archive" }
  ]
}
```

### 6.2 Adding or editing a post

1. Author the HTML at `/blog/<slug>/index.html`. Match the existing blog template (head meta, JSON-LD Article, breadcrumb, footer).
2. Add an entry to `assets/data/blogs.json` with title, url, date, summary, categories, tags, and `type: "modern"`.
3. Run `python3 tools/regen-blog-pool.py`. This regenerates:
   - `assets/js/blog-pool.js` (homepage daily spotlight)
   - `assets/data/blog-search-index.json` (client-side blog search)
4. Add a card in `blog/index.html` if the post should appear on page 1 (the latest-engineering grid).
5. Add a `<url>` line to `sitemap.xml`.
6. If any tags are new, regenerate `/tags/` via `/tmp/phase11/gen_pages.py` (or copy an existing per-tag page and reuse the pattern).
7. Run the QA checks in §15 before committing.

### 6.3 Categories vs tags

- **Categories** are coarse-grained editorial buckets ("FIDO", "Transit", "JavaCard"). The category landing pages live at `/blog/categories/<slug>/`.
- **Tags** are fine-grained, often-cross-cut topics ("AAGUID", "SCP03", "DESFire EV2"). Tag landings live at `/tags/<slug>/`.
- A post should have 1–3 categories and 2–6 tags. The blog search ranks tags equally with categories at scoring time.

---

## 7. Archive workflow

`/blog/archive/` is closed-set: 24 pre-2026 posts migrated from the legacy WordPress site. Editorial conventions for any future archive admission:

1. Source has to be authored on `ambisecure.ambimat.com` (or its legacy `ambimat.com/security/...` prefix). Ambimat-corporate and eSIM posts redirect externally — they are not migrated.
2. Posts older than 2026 carry a "Historical archive" eyebrow.
3. Each archive post links forward to its modern equivalent where one exists.
4. Archive posts are tagged `"type": "archive"` in `blogs.json`. They appear in spotlight rotation but with an `archive` badge.

---

## 8. Video workflow

### 8.1 Two delivery modes

- **YouTube** via the click-to-play facade at `assets/js/video-facade.js`. No YouTube network call on idle; iframe activates on click.
- **Self-hosted** via `<video preload="none">` + first-frame poster. The only self-hosted file today is `/assets/video/biokey-loop.mp4` (879 KB).

### 8.2 Adding a YouTube video

1. Create `/videos/<slug>/index.html` matching the existing per-video template. Include the facade markup:
   ```html
   <div class="yt-facade" data-yt-id="<ID>" data-title="...">
     <img class="yt-facade-poster" src="/assets/img/videos/<ID>.webp" />
     <button class="yt-facade-play" aria-label="Play">▶</button>
   </div>
   ```
2. Download the YouTube poster as WebP into `/assets/img/videos/<ID>.webp`.
3. Add `VideoObject` JSON-LD to the page.
4. Add a card on `/videos/index.html`.
5. Add a `<url>` line in `sitemap.xml`.
6. Update `assets/js/highlight-banner-config.js` if the video deserves a banner slot.

### 8.3 Adding a self-hosted video

Same as YouTube, except:
- Convert source to MP4 (H.264 baseline, AAC audio, ≤2 Mb/s, ≤2 MB if possible).
- Drop in `/assets/video/<slug>.mp4`.
- Extract poster frame with ffmpeg:
  ```bash
  ffmpeg -i input.mp4 -ss 1 -frames:v 1 -y assets/img/videos/<slug>-poster.jpg
  ```
- Per-video page uses `<video preload="none">`, not the facade.

### 8.4 Large source assets

Anything over 5 MB does not get committed. Source archives live under `legacysitedata/videos/` and are gitignored (see `.gitignore`). The 161 MB ICE podcast is the canonical example — it is documented on `/videos/` as "archived elsewhere" and not self-hosted.

---

## 9. SEO operations

### 9.1 Per-page essentials

Every page must carry:

- Unique `<title>` (≤60 chars target).
- Unique `<meta name="description">` (≤160 chars target).
- `<link rel="canonical">` to the absolute URL.
- OG meta (`og:type`, `og:title`, `og:description`, `og:url`, `og:image`).
- Twitter card meta.
- JSON-LD: BreadcrumbList at minimum. Article for blog posts. Product for product pages. CollectionPage for hubs.

### 9.2 Sitemap

`sitemap.xml` is hand-curated. Every page on disk that should be indexed needs a `<url>` entry. Audit periodically:

```bash
python3 /tmp/phase11/audit_sitemap.py   # report-only; lists URLs missing on disk
```

CI also validates sitemap XML via `.github/workflows/lighthouse.yml`.

### 9.3 Robots / indexability

`robots.txt` is permissive (allow all). Per-page `<meta name="robots">` overrides exist only on transient pages (none today).

---

## 10. Redirects workflow

### 10.1 Editing `.htaccess`

- Plain `Redirect 301 /old /new` for one-to-one mappings.
- `RedirectMatch 301 ^/regex$ /target` for the 2 regex cases (`/old-blog-prefix.*` patterns).
- After every edit, run `python3 tools/lint-htaccess.py`. The linter catches:
  - Duplicate sources.
  - Self-redirects (A → A).
  - Trailing-slash whiplash (A → A/ where A/ → A).
  - Chains (A → B → C — should collapse to A → C).
  - Loops (A → B → A).

### 10.2 When a target slug doesn't exist yet

Either author the target page, or change the redirect target to a live page. Do **not** redirect to a 404. CI sitemap-validate catches dangling sitemap entries, but it does not catch dangling redirect targets — those rely on human review.

### 10.3 Bulk legacy redirects

Most of the 138 `Redirect 301` rules cover the legacy WordPress URL scheme (`/learn/...`, `/security/...`, `/products/...?p=`). They are organised by source-prefix in `.htaccess`. Keep that ordering when adding new ones.

---

## 11. Image & media optimisation

### 11.1 Conventions

| Asset type | Format | Notes |
|------------|--------|-------|
| Hero/section illustration | SVG | Inline or `/assets/img/*.svg`. |
| Product photos | WebP + PNG fallback `<picture>` | Phase 8 baseline. |
| Video thumbnails | WebP (80–120 KB) | Lazy-loaded; preload="none" on actual videos. |
| OG cards | 1200×630 PNG | Brand template via `tools/gen-og-image.py`. SVG canonical; PNG rendered. |
| Favicons | SVG primary; PNG fallbacks under `/assets/img/`. |

### 11.2 Generating new images

- **OG cards**: `python3 tools/gen-og-image.py --title "..." --subtitle "..." --out assets/img/og/<name>.png`. If `rsvg-convert` is installed, PNG is rendered; otherwise SVG is saved and the operator runs the render step.
- **WebP from PNG**: `cwebp -q 85 in.png -o out.webp`. (Note: macOS `sips` cannot write WebP — `cwebp` is required.)
- **Video poster**: `ffmpeg -i in.mp4 -ss 1 -frames:v 1 -y poster.jpg`.

### 11.3 Periodic optimisation

Once per quarter, audit `/assets/img/` for:

- Any PNG > 200 KB without a WebP sibling — add WebP via cwebp.
- Any JPEG used as an OG image — replace with PNG (Twitter/Facebook prefer PNG/JPEG either way; PNG is the brand standard).
- Any unreferenced asset — delete (or move to `legacysitedata/`).

---

## 12. Lighthouse + CI

### 12.1 Local Lighthouse

```bash
npm install -g @lhci/cli
lhci autorun --config=.lighthouserc.json
```

The config exercises 8 representative pages (homepage, blog, product, case study, brochure, tool, search, privacy) and asserts:

- Performance ≥ 0.90
- Accessibility ≥ 0.95
- Best Practices ≥ 0.95
- SEO ≥ 0.95

### 12.2 GitHub Actions

`.github/workflows/lighthouse.yml` runs three jobs on every push to `main` and every PR:

1. `lighthouse` — full LHCI run.
2. `htaccess-lint` — `python3 tools/lint-htaccess.py`.
3. `sitemap-validate` — `xmllint --noout sitemap.xml` + URL-count sanity check.

CI is advisory, not blocking — `lhci autorun` runs with `continue-on-error: true` so a transient regression doesn't block a merge. Treat the LHCI report artifact as the source of truth.

### 12.3 Manual sanity checks

After every commit that touches the homepage, `index.html`, `main.css`, or a long-form blog post:

```bash
xmllint --noout sitemap.xml
python3 tools/lint-htaccess.py
python3 -m http.server 8080   # then open /, /blog/, /privacy/, /search/
```

---

## 13. Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Blog spotlight empty on homepage | `blog-pool.js` not loaded (script order) | Verify `<script src="/assets/js/blog-pool.js" defer></script>` precedes `blog-spotlight.js`. |
| Banner shows broken state | `highlight-banner-config.js` JSON error | `osascript -l JavaScript -e "var window={}; $(cat assets/js/highlight-banner-config.js)"` |
| Fonts swap from custom to system mid-load | `fonts.css` blocked by CSP / 404 | Check `font-src 'self'` in `.htaccess`; check `/assets/fonts/*.woff2` is uploaded. |
| Privacy preferences don't persist | localStorage blocked (incognito/strict cookie policy) | Expected. The widget renders but choices reset per session. |
| Web Vitals reports nothing | DNT on, or analytics provider is `"none"` | Both gate Web Vitals. Toggle the right one. |
| `/blog/<slug>/` shows old summary | `blogs.json` updated but `regen-blog-pool.py` not run | `python3 tools/regen-blog-pool.py`. |
| Sitemap URL doesn't 200 in CI | New page added without sitemap entry, or old entry not removed | `python3 /tmp/phase11/audit_sitemap.py` to spot stale entries. |
| YouTube facade button doesn't activate | `video-facade.js` not deferred properly | The script is small; in production it loads after the nav.js bootstrap. Ensure neither is async. |

---

## 14. Future engineer onboarding

A new engineer should be able to do all of the following within their first hour:

1. Clone the repo. Run `python3 -m http.server 8080`. Open `/`.
2. Edit `index.html`, save, refresh. See the change.
3. Add a blog post by appending to `assets/data/blogs.json`, running `tools/regen-blog-pool.py`, and authoring `/blog/<slug>/index.html`.
4. Edit a banner in `highlight-banner-config.js`. Refresh. See the change.
5. Run `python3 tools/lint-htaccess.py` and `xmllint --noout sitemap.xml`.

If they cannot, this doc is incomplete — fix it before adding more features.

---

## 15. Pre-commit maintenance checklist

Before every commit:

- [ ] `xmllint --noout sitemap.xml`
- [ ] `python3 tools/lint-htaccess.py` (if `.htaccess` changed)
- [ ] `python3 tools/regen-blog-pool.py` (if `blogs.json` changed)
- [ ] Visual sanity check of `/` in a browser (banner, spotlight, no console errors)
- [ ] Verify no new `https://fonts.googleapis.com` link slipped into a hand-edited page (we are fully self-hosted)
- [ ] Verify any new HTML page has the `/privacy/` footer link
- [ ] Verify any new HTML page loads `/assets/js/web-vitals.js`

### Quarterly review

- [ ] Audit `assets/img/` for un-WebP'd PNGs > 200 KB.
- [ ] Re-run `tools/lint-htaccess.py` against the full ruleset.
- [ ] Audit sitemap against on-disk pages (`/tmp/phase11/audit_sitemap.py` pattern).
- [ ] Review `OPEN_ITEMS_AND_FUTURE_BACKLOG.md` for items whose operational trigger has fired.

---

## 16. Subdomain split readiness

If a future split (e.g. `developer.ambimat.com` for /resources/ and /references/) becomes desirable:

- Internal links use **root-relative** paths (`/products/...`) almost everywhere. They will continue to work without rewriting if served from a single origin. For a split, rewrite to absolute URLs only on links that cross the split boundary.
- JSON-LD `@id` values use the absolute `https://ambisecure.ambimat.com/...` form. Those would need to be rewritten per split origin — search for `"item"` and `"@id"` values in JSON-LD blocks.
- Sitemap is per-origin. Each split origin gets its own `sitemap.xml`. Cross-reference via `<sitemapindex>` if multiple are deployed under one domain.
- `.htaccess` is per-origin. Each split origin needs its own redirect block.
- Analytics: each origin should configure its own `provider` value separately. Sharing one config across splits is fine if the analytics provider supports multiple domains.

No split is planned today. The architecture supports it without rewrites.
