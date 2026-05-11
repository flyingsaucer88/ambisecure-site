# MASTER OPERATIONS AND MAINTENANCE — AmbiSecure site

**Owner:** AmbiSecure engineering
**Last updated:** 2026-05-11 (Phase 14 — SEO audit close-out: FAQ schema, link suggester, readability metrics, pre-commit hook)

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
│   ├── regen-blog-pool.py     Regenerate blog-pool.js + blog-search-index.json
│   ├── lint-htaccess.py       Chains / loops / duplicates / self-redirects
│   ├── gen-og-image.py        Single OG card (manual one-off)
│   ├── gen-og-batch.py        Per-section OG generator + meta-tag wiring
│   ├── og-templates.json      Per-section OG template config
│   ├── audit-content.py       Titles / descriptions / OG / schema / H1 / alts
│   ├── audit-seo.py           Sitemap / canonical / orphan / href / htaccess
│   ├── audit-media.py         Oversize / missing-WebP / dead-weight
│   ├── audit-freshness.py     Blog last_reviewed / freshness audit
│   ├── audit-yoast.py         Yoast-style SEO + readability audit + FAQ schema check
│   ├── suggest-internal-links.py  Under-linked-blog suggester (Phase 14)
│   └── audit-all.sh           Run every audit in one go
├── scripts/            Pre-commit guardrails (Phase 14)
│   └── check-last-reviewed.py  Bumps `last_reviewed` when blog HTML is edited
├── .githooks/          Opt-in git hooks (Phase 14, `git config core.hooksPath .githooks`)
│   └── pre-commit             Runs lint-htaccess + check-last-reviewed + blog-pool sanity
├── legacysitedata/     Frozen scrape of the legacy WordPress site (gitignored MP4s)
├── docs/               THIS DOC + OPEN_ITEMS_AND_FUTURE_BACKLOG.md (only these two)
├── .lighthouserc.json  Lighthouse CI config
└── .github/workflows/  Lighthouse CI + 7 audit jobs
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
--exclude=.githooks/
--exclude=scripts/
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

Phase 12 enhancements:

- **Page-group derivation**: every reported metric carries a `pageGroup` derived from `window.location.pathname` (`home`, `blog-post`, `case-study`, `product`, `tool`, etc.). Use it to aggregate vitals per content type in the analytics provider.
- **Batched flush**: metrics buffer through the page lifecycle and flush once on `pagehide` / `visibilitychange:hidden`. Avoids per-metric round trips.
- **Debug mode**: set `localStorage["as-vitals-debug"] = "1"` *or* append `?as_vitals_debug=1` to any URL. Prints `console.table()` of the buffered metrics on flush and does **not** forward them to the provider — safe to leave on during development.
- **Public API**: `window.AS_VITALS.mark(name, value)` lets page-specific code record a custom metric (e.g. tool-completion time) that flows through the same opt-out / DNT pipeline.

When the operator turns analytics on, Web Vitals automatically reports through the active provider:

- Plausible: `plausible("WebVital", { props: { metric, value, path, pageGroup }})`.
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
2. Add an entry to `assets/data/blogs.json` with title, url, date, summary, categories, tags, `type: "modern"`, `last_reviewed: "<date>"`, `freshness: "current" | "evergreen"`.
3. Run `python3 tools/regen-blog-pool.py`. This regenerates:
   - `assets/js/blog-pool.js` (homepage daily spotlight)
   - `assets/data/blog-search-index.json` (client-side blog search)
4. Add a card in `blog/index.html` if the post should appear on page 1 (the latest-engineering grid).
5. Add a `<url>` line to `sitemap.xml`.
6. If any tags are new, regenerate `/tags/` via the Phase 11 generator pattern (or copy an existing per-tag page and reuse).
7. Run `bash tools/audit-all.sh` before committing.

### 6.3 Editorial bands (Phase 13)

Word-count targets by page type, enforced by `audit-yoast`. Hard limits below cause CI to fail.

| Page type     | Min words | Max words |
|---------------|----------:|----------:|
| blog          | 300       | 2200      |
| blog-archive  | 300       | 2500      |
| case-study    | 900       | 2000      |
| brochure      | 300       | 800       |
| product       | 200       | 900       |
| service       | 200       | 900       |
| solution      | 200       | 1100      |
| technology    | 200       | 1300      |
| industry      | 120       | 800       |
| tag           | 30        | 600       |
| category      | 30        | 600       |
| reference     | 20        | 2000      |
| tool          | 20        | 2000      |
| hub           | 100       | 2000      |

Title bands: 30–70 chars for blog/case-study/brochure; 25–70 for product/service/solution/technology; 20–80 for hub/tag/category. Description bands: 110–170 chars for content pages; 80–170 for hubs.

Editorial rule on blog length: aim for 1400–1900 words on cornerstone posts. Above 2000, audit. The cornerstone passes the audit only when its content density justifies the length — no filler, no repeated explanations, no "future of security" preambles.

### 6.4 Tag taxonomy

Phase 13 consolidated 74 fine-grained tags into 23 broader topic clusters. Tag editing rule: when a new post would create a singleton tag, prefer extending an existing tag instead. If a new cluster genuinely deserves to exist, it needs at least 2 posts on day one — otherwise it's noise.

### 6.5 Lifecycle metadata (Phase 12)

Each entry in `blogs.json` carries:

- `last_reviewed`: ISO date. When an operator confirms the post is still accurate, bump this date.
- `freshness`:
  - `"evergreen"` — protocol primers (APDU, FIDO basics, SE vs TPM vs HSM, cornerstones).
  - `"current"` — modern engineering posts. Audited as overdue if last reviewed >18 months ago.
  - `"stale-review"` — archive content (pre-2026). Reviewed informationally only; no CI failure for age.

The `audit-freshness` check fails CI if any entry is missing these fields. It does not fail on age — that's intentional, operator-side judgment.

### 6.6 FAQPage structured data (Phase 14)

12 high-intent modern blogs carry FAQPage JSON-LD embedded in the article's existing `@graph`:

- All five comparison cornerstones (`passkeys-vs-traditional-mfa`, `smart-cards-vs-fido-tokens-vs-passkeys`, `secure-element-vs-tpm-vs-hsm`, `platform-vs-roaming-authenticators`, `desfire-ev1-vs-ev2-vs-ev3`).
- The high-intent explainers (`why-hardware-backed-identity-matters`, `how-fido-authentication-works`, `why-use-multi-factor-authentication`, `top-3-benefits-of-mfa`).
- Deep-dive technicals (`credential-lifecycle-management`, `understanding-webauthn-attestation-objects`, `javacard-applet-development-enterprise-identity`).

Rules:

- 2–4 Q&A pairs per post; answers paraphrase real article content. No fabricated answers, no keyword stuffing.
- No visible FAQ blocks. The H2 sections already answer the questions; the schema just helps Google parse them.
- `audit-yoast` validates FAQPage entries: non-empty `name` + `acceptedAnswer.text`, no duplicate questions per page.
- To add FAQ schema to another post, inject the JSON-LD into the existing `<script type="application/ld+json">` `@graph` array — see any of the 12 listed posts for the canonical shape.

### 6.7 Internal-link maintenance (Phase 14)

`tools/suggest-internal-links.py` reports under-linked modern blogs:

```bash
python3 tools/suggest-internal-links.py                                  # console report
python3 tools/suggest-internal-links.py --threshold 6                    # raise the bar
python3 tools/suggest-internal-links.py --json tools/reports/internal-link-suggestions.json
```

For each modern post the tool reports current internal link count, priority (high < 3 links, medium < threshold, low otherwise), and concrete target URLs based on keyword matches and category/tag overlap. The tool only suggests — operators decide which links to apply inline.

### 6.8 Pre-commit hook (Phase 14)

Opt-in. Enable once per clone:

```bash
git config core.hooksPath .githooks
```

`.githooks/pre-commit` runs:

1. `python3 scripts/check-last-reviewed.py --check` — fails the commit if a modern blog HTML is staged without bumping its `last_reviewed` in `assets/data/blogs.json`. Archive posts warn only.
2. `python3 tools/lint-htaccess.py` — chains/loops/duplicates.
3. Sanity: if `blogs.json` is staged but `blog-pool.js` is not, prints a warning telling the operator to run `tools/regen-blog-pool.py`.

The full `audit-all.sh` suite is too slow (~6s) for every commit; it stays in CI. The hook covers the cheap, high-value checks only.

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

- **OG cards (per-section, Phase 12)**: `python3 tools/gen-og-batch.py --wire`. Reads `tools/og-templates.json`, generates an SVG + PNG for every declared section, then walks every HTML page and rewrites `<meta property="og:image">` to point at the section-matching card. Re-run any time a section's eyebrow/title/subtitle changes.
- **Single OG card**: `python3 tools/gen-og-image.py --title "..." --subtitle "..." --out assets/img/og/<name>.png` (for one-off custom cards).
- **WebP from PNG**: `cwebp -q 85 in.png -o out.webp`. (Note: macOS `sips` cannot write WebP — `cwebp` is required.)
- **Video poster**: `ffmpeg -i in.mp4 -ss 1 -frames:v 1 -y poster.jpg`.

PNG rendering of SVG OG cards falls back as: `rsvg-convert` → `qlmanage + sips` (1200×1200 then crop to 1200×630). If neither is available, only SVG is written and the operator runs the render step manually.

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

`.github/workflows/lighthouse.yml` runs eight jobs on every push to `main` and every PR:

1. `lighthouse` — full LHCI run (advisory, `continue-on-error: true`).
2. `htaccess-lint` — `python3 tools/lint-htaccess.py`.
3. `sitemap-validate` — `xmllint --noout sitemap.xml` + URL-count sanity check.
4. `audit-content` — `python3 tools/audit-content.py` (titles, descriptions, OG, schema, alts).
5. `audit-seo` — `python3 tools/audit-seo.py` (sitemap, canonical, orphans, hrefs, htaccess targets).
6. `audit-media` — `python3 tools/audit-media.py` (oversize, missing-WebP, dead-weight, missing references).
7. `audit-freshness` — `python3 tools/audit-freshness.py --strict` (blog `last_reviewed` / `freshness` metadata).
8. `audit-yoast` — `python3 tools/audit-yoast.py --strict` (per-page-type word-count bands, title / desc lengths, H1 uniqueness, heading hierarchy, paragraph length, internal-link count, FAQPage schema validity, Phase 14 readability metrics: avg sentence length, long-sentence count, heading density, top repeated 3-grams).

Treat audits 2–8 as blocking and Lighthouse as advisory.

### 12.3 Local one-shot audit

```bash
bash tools/audit-all.sh
```

Runs every audit in one go (mirror of the CI suite). Exit 0 = clean.

### 12.4 Manual sanity checks

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

- [ ] `bash tools/audit-all.sh` — single command that runs every audit. Exit 0 = clean.
- [ ] `python3 tools/regen-blog-pool.py` (if `blogs.json` changed)
- [ ] `python3 tools/gen-og-batch.py --wire` (if a section's eyebrow/title/subtitle changed)
- [ ] If a blog HTML changed, bump its `last_reviewed` in `assets/data/blogs.json` (the `.githooks/pre-commit` hook enforces this once enabled).
- [ ] `python3 tools/suggest-internal-links.py` — review high-priority under-linked posts and add inline links where natural.
- [ ] Visual sanity check of `/` in a browser (banner, spotlight, no console errors)
- [ ] Verify no new `https://fonts.googleapis.com` link slipped into a hand-edited page (we are fully self-hosted)
- [ ] Verify any new HTML page has the `/privacy/` footer link
- [ ] Verify any new HTML page loads `/assets/js/web-vitals.js`

### Quarterly review

- [ ] Run `bash tools/audit-all.sh` and resolve every reported issue.
- [ ] Bump `last_reviewed` on `current` blog entries you've spot-checked.
- [ ] Review `OPEN_ITEMS_AND_FUTURE_BACKLOG.md` for items whose operational trigger has fired.
- [ ] Inspect `audit-freshness` output for archive posts that should be retired or refreshed.

---

## 16. Subdomain split readiness

If a future split (e.g. `developer.ambimat.com` for /resources/ and /references/) becomes desirable:

- Internal links use **root-relative** paths (`/products/...`) almost everywhere. They will continue to work without rewriting if served from a single origin. For a split, rewrite to absolute URLs only on links that cross the split boundary.
- JSON-LD `@id` values use the absolute `https://ambisecure.ambimat.com/...` form. Those would need to be rewritten per split origin — search for `"item"` and `"@id"` values in JSON-LD blocks.
- Sitemap is per-origin. Each split origin gets its own `sitemap.xml`. Cross-reference via `<sitemapindex>` if multiple are deployed under one domain.
- `.htaccess` is per-origin. Each split origin needs its own redirect block.
- Analytics: each origin should configure its own `provider` value separately. Sharing one config across splits is fine if the analytics provider supports multiple domains.

No split is planned today. The architecture supports it without rewrites.
