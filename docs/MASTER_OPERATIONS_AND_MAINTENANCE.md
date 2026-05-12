# MASTER OPERATIONS AND MAINTENANCE — AmbiSecure site

**Owner:** AmbiSecure engineering
**Last updated:** 2026-05-12 (Phase 24 — flagship hero crest, real-logo favicons, 5-min HTML TTL, OG+twitter:image coverage at 263/263)

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
| HTML pages on disk | ~303 |
| Sitemap canonical URLs | 253 |
| Practical utility tools | 54 |
| Searchable reference databases | 12 |
| Modern blog entries | 26 (+5 Phase 16 cornerstones) |
| Engineering archive entries | 24 |
| Case studies | 3 |
| Brochures | 7 (1 landing + 6 platform overviews) |
| Videos | 8 (7 hosted + 1 archived elsewhere) |
| Products | 17 (12 core + 5 Phase 15: FIDO2 nano SIM, PIV nano SIM, Secure Mail Suite, PKCS Signature Suite, IoT Security Applets) |
| Services | 4 (JavaCard development, FIDO validation server, tool-chain development, ePassport platform engineering) |
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
│   ├── archive/        24 engineering archive posts
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

### 5.1 Banner system — rotating carousel (Phase 22)

Edit `assets/js/highlight-banner-config.js` only. Each entry has `id`, `enabled`, `eyebrow`, `title`, `body`, `accent` (`red` / `cyan` / `dark`), `primaryCta`, optional `secondaryCta`, optional `startsAt` / `endsAt` (ISO timestamps).

`highlight-banner.js` (Phase 22) renders **every enabled, in-window entry as a carousel slide**, not just the first one:

- Auto-advances every 8 seconds.
- Pauses on hover, focus-within, or when the tab is hidden (`visibilitychange`).
- Prev / next buttons + per-slot dot indicators when there are 2+ slides.
- Respects `prefers-reduced-motion`: auto-advance is disabled, manual controls remain.
- Static fallback markup inside `.hp-banner-slot` is shown if JS is disabled (first slide only). The JS overwrites the slot on init.

To prioritise a slide, move it earlier in the `AS_HOMEPAGE_BANNERS` array. To take a slide out of rotation without deleting it, set `enabled: false`. To time-box a campaign, use `startsAt` and `endsAt`.

### 5.2 Blog spotlight

`assets/js/blog-spotlight.js` reads `assets/js/blog-pool.js` (auto-generated) and picks one entry per UTC day. The seed is deterministic per day; the same visitor sees the same post.

### 5.3 Static homepage sections

The homepage carries fifteen hand-edited sections in a deliberate order (see §30 for the full hierarchy). Phase 9 sections (Core pillars, Videos teaser, Where AmbiSecure Fits) and Phase 10 sections (Commercial surfaces) are hard-coded. The Phase 22 About strip (Who / What / Who-helps / How) sits immediately below the hero. To change any of them, edit the HTML.

The original Phase 5 "Start here" panel and the Phase 13 "A decade of engineering writing" archive teaser were retired in Phase 22 — both overlapped with existing surfaces ("Solutions" + "Where AmbiSecure ships today" cover the buyer entry-points; the engineering archive is still one click away from the blog landing and the nav).

### 5.4 Ecosystem map (Phase 15)

Between "Solutions" and "Resources" the homepage carries an "Ecosystem map" section &mdash; eight cards giving multi-axis navigation into the site:

- By product → `/products/`
- By service → `/services/`
- By solution → `/solutions/`
- By technology → `/technologies/`
- By industry → `/industries/`
- By reference → `/references/`
- By tool → `/resources/`
- By article → `/blog/`

Plus a short featured-strip-row to case studies, brochures, engagement models, videos, and certifications. The section&rsquo;s purpose: anyone landing on the homepage can reach any major surface in one click. Keep the counts in the card descriptions in sync with the actual on-disk counts when new content is added.

The "Explore by use case" featured strip below is the tactical view &mdash; specific high-intent destinations (FIDO2 on a nano SIM, PIV on a nano SIM, ePassport, etc.). Update this strip when adding a high-value product or service.

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
2. Posts older than 2026 carry a "Engineering archive" eyebrow.
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

## 9b. FIDO Validation Server integration (Phase 15)

The marketing surface at `/services/fido-validation-server/` documents the FIDO Validation Server as a multi-tenant SaaS. The actual implementation lives at `~/Documents/git_repo/FIDO_latest/` (separate Node.js / Express / DynamoDB project) and is NOT bundled into this static site &mdash; the site only ships the explanatory page.

What the page says (and what the implementation backs):

Phase 16 additions to the same page:

- **Trust-chain visual** &mdash; five-step diagram (authenticator → browser → validation server → relying party) showing where the server sits in the FIDO ceremony.
- **Attestation trust-chain visual** &mdash; authenticator key → attestation key → attestation CA → MDS BLOB → tenant policy. Shows what the server walks on every accepted credential.
- **Enterprise onboarding** &mdash; four-step canonical sequence (scoping → tenant provisioning → integration → production cutover) plus a standards-interoperability and existing-IdP-integration note. The validation server is a managed engagement; this section makes the onboarding shape explicit without promising self-serve sandbox availability.

Original Phase 15 content:

- **Multi-tenant** &mdash; every credential, challenge, audit record scoped to a tenant identifier. Cross-tenant queries refused at persistence layer.
- **API key per environment** &mdash; separate keys for dev / staging / production. Hashed at rest; cleartext shown once at issuance.
- **Per-tenant policy** &mdash; allowed AAGUIDs, required UV, required attestation conveyance.
- **Six REST endpoints** &mdash; `/register/begin`, `/register/finish`, `/login/begin`, `/login/finish`, `/credentials/:userId`, `DELETE /credentials/:credentialId`.
- **Three deployment shapes** &mdash; hosted SaaS, operator-hosted (same container in operator&rsquo;s cloud), hybrid (operator runs the data plane, AmbiSecure runs the MDS pipeline + usage metering).
- **Attestation formats** &mdash; Packed, FIDO-U2F, TPM, Android-Key, Android-SafetyNet, Apple Anonymous, None.

When updating this page, do NOT publish implementation-specific details that would expose attack surface: AWS region choices, database table names, internal admin endpoints, session-cookie names, secret rotation cadence, internal modules. Keep it architectural.

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

- **OG cards (per-section + per-product, Phase 12 + Phase 16)**: `python3 tools/gen-og-batch.py --wire`. Reads `tools/og-templates.json`, generates an SVG + PNG for every declared section, then walks every HTML page and rewrites `<meta property="og:image">` to point at the matching card. First-match-wins in template order, so put narrow prefixes (e.g. `/products/fido2-nano-sim-applet/`) BEFORE broader ones (e.g. `/products/`). Re-run any time a section's eyebrow/title/subtitle changes. After generating new PNGs, also run `cwebp -q 85 <png> -o <webp>` so the audit-media WebP-sibling check passes. Phase 16 added seven per-page OG cards (the six new product/service pages from Phase 15 plus the FIDO Validation Server).
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

`.github/workflows/lighthouse.yml` runs nine jobs on every push to `main` and every PR:

1. `lighthouse` — full LHCI run. Phase 17 dropped `continue-on-error`, so the thresholds in `.lighthouserc.json` (Performance ≥0.90, A11y/BP/SEO ≥0.95) now block.
2. `htaccess-lint` — `python3 tools/lint-htaccess.py`.
3. `sitemap-validate` — `xmllint --noout sitemap.xml` + URL-count sanity check.
4. `audit-content` — `python3 tools/audit-content.py` (titles, descriptions, OG, schema, alts).
5. `audit-seo` — `python3 tools/audit-seo.py` (sitemap, canonical, orphans, hrefs, htaccess targets).
6. `audit-media` — `python3 tools/audit-media.py` (oversize, missing-WebP, dead-weight, missing references).
7. `audit-freshness` — `python3 tools/audit-freshness.py --strict` (blog `last_reviewed` / `freshness` metadata).
8. `audit-yoast` — `python3 tools/audit-yoast.py --strict` (per-page-type word-count bands, title / desc lengths, H1 uniqueness, heading hierarchy, paragraph length, internal-link count, FAQPage schema validity, Phase 14 readability metrics: avg sentence length, long-sentence count, heading density, top repeated 3-grams).
9. `audit-circular` — `python3 tools/audit-circular-links.py --hard-only` (Phase 18). Fails CI if any clickable anchor's target normalises to the same canonical URL as the page it lives on (excluding navbar, breadcrumb, ecosystem bar, footer — those are expected to back-link).

Treat audits 2–9 as blocking.

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

---

## 17. Navigation integrity (Phase 18)

Every clickable anchor on the site must take the user **somewhere new**. Self-referencing cards, dead-end placeholders, and "Learn more →" links that reload the current page are explicitly forbidden — they damage trust and SEO equally.

### 17.1 Hard rules

- **No `href="#"` placeholders.** If a card is announcing future content, use `<div class="card soon-tile">` or `<div class="resource-card soon-tile">`. The `.soon-tile` modifier removes hover-lift so the tile is visually non-interactive.
- **No card on `/X/` whose href is `/X/`.** Section-index pages list children; if a child page does not exist yet, link to the closest meaningful sibling (sister property, related blog, related product) — never back to the section itself.
- **No "Learn more" anchors on a page whose target normalises to the same canonical URL.** The `audit-circular-links.py` audit excludes the navbar, breadcrumb, ecosystem bar, and footer (those are expected to back-link); anywhere else, a self-link is a bug.

### 17.2 The audit

```bash
python3 tools/audit-circular-links.py             # full report
python3 tools/audit-circular-links.py --hard-only # CI gate (Phase 18)
```

Wired into `tools/audit-all.sh` and the CI workflow as the 9th audit job.

### 17.3 Where placeholders are acceptable

- `javascript:window.print()` on brochure pages — the "Print → PDF" anchor is the intentional UX (no binary PDFs in the repo per the closed-decisions list).
- `<a href="#main" class="skip-link">` — the accessibility skip-link. The audit ignores `#`, `#main`, `#content`, `#top`, `#main-content`.

### 17.4 Brand markup (cross-page consistency)

All 254 production pages carry an identical navbar and footer brand block:

```html
<a href="/" class="brand">
  <span class="brand-mark">AS</span>
  <span class="brand-text">
    <span class="brand-line">Ambi<span class="accent">Secure</span></span>
    <span class="brand-tag">Hardware-rooted security</span>
  </span>
</a>
```

The brand mark uses the `--brand-red: #E3222A` token; the accent on "Secure" uses the same. The Ambimat ecosystem bar at the very top of each page lists the sister properties (`ambimat.com`, `esim.ambimat.com`, `/blog/`) — keep these in sync if Ambimat group identity changes.

### 17.5 Brand assets (Phase 23 — official logo)

The **single canonical AmbiSecure logo** is the user-provided crest in `Logos/` (96×96 source, with internal "AMBI SECURE" wordmark). It is installed at three URLs:

- `assets/img/ambisecure-logo.webp` — **5.2 KB, used by `.brand-mark` CSS for the navbar + footer on every page.** Webp for size; modern browsers all support it.
- `assets/img/ambisecure-logo.png` — 12 KB PNG, identical artwork, used as the `Organization.logo` URL in Schema.org JSON-LD on the homepage. Raster + universally fetchable for Google Knowledge Graph.
- `assets/img/og/ambisecure-logo-og.jpg` — 512×512 JPG variant for OG/social-share contexts that want the badge specifically (rather than the 1200×630 default OG card).

The crest carries its own internal wordmark, so `.brand-text` (the adjacent "Ambi**Secure** / Hardware-rooted security" markup) is **hidden site-wide via `display: none`** to avoid duplication. Do not re-enable it; if textual fallback is needed, the logo image's `alt="AmbiSecure"` does the job. The Phase 19/21 placeholder marks (`logo-mark-icon.svg`, `logo.svg`, the old `logo-mark.*` family) were retired in Phase 23 — do not re-introduce them.

- `assets/img/favicon.svg` — 64×64 circular crest aligned with the AmbiSecure logo. Used as the browser tab icon and for OG fallbacks where a section card does not exist.
- `assets/img/favicon-32.png`, `assets/img/favicon-64.png`, `assets/img/apple-touch-icon.png` — raster fallbacks. The apple-touch-icon ships on every page via the `<link rel="apple-touch-icon">`.
- `assets/img/hero-secure-element.svg` — ISO/IEC 7816 contact-pad illustration on the homepage hero (Phase 19, replaces the CSS-only `hero-visual` schematic).
- `assets/img/product-*.svg` and `assets/img/service-*.svg` — per-product / per-service hero illustrations (Phase 19). Each `<div class="feature-visual feature-visual-img">` wraps one of these SVGs.
- `assets/img/certifications/cert-*.png|.webp` — conformance-mark badges on `/about/certifications/` (Phase 19; renamed from the previous `legacy-badge-*` filenames).
- `assets/img/og/*.svg + *.png + *.webp` — per-section + per-product OG cards (Phase 12 + 15 + 16). All 1200×630. Regenerate via `python3 tools/gen-og-batch.py --wire` if any section title/eyebrow/subtitle changes in `tools/og-templates.json`.

### 17.6 Cross-property visual identity (Ambimat group)

The AmbiSecure site sits between `ambimat.com` (parent corporate site) and `esim.ambimat.com` (sister property). All three share:

- The red `#E3222A` brand accent
- A circular brand crest in the navbar mark slot
- The ecosystem bar at the top of every page linking sister properties

When updating the navbar or the ecosystem bar, keep parity with the sister sites; don't introduce visual treatments that wouldn't read as "Ambimat-group".

---

## 18. Tile/grid governance (Phase 21 update)

The site has one **global tile rule**: a row of clickable tiles never exceeds **four** per row, and if the final row is incomplete it is **centred**.

### 18.1 Mechanics

Phase 21 made centred-last-row the **default** for `.grid-N` — no opt-in modifier required:

- `.grid-2`, `.grid-3`, `.grid-4` are **flex-wrap** containers with `justify-content: center` and `align-items: stretch`. Each child gets `flex: 1 1 calc((100% - (N-1)*gap) / N)` with a matching `max-width`. Full rows look identical to the previous CSS-Grid layout; orphans in the last row sit centred automatically.
- `.is-centered` is retained as a no-op alias for back-compat — any HTML still carrying it renders the same way as without it.
- `.pillars-grid` (homepage "Seven domains") is hard-capped at 4 per row via the same flex-wrap pattern with `min-width: 220px` floor and mobile fallback to 2-up then 1-up.
- `.fido-grid` and `.ref-grid-landing` are now flex-wrap, capped at 4 and 3 per row respectively. Previously they used CSS-Grid `auto-fit` which let them stretch to 5+ columns on very wide viewports.
- `.resource-grid` (only used on `/resources/`) is flex-wrap, capped at 3 per row, defined inline in that page's `<style>` block.

### 18.2 Authoring rule

Pick the grid that matches the natural column count of your content (2 / 3 / 4). The centred-last-row behaviour applies automatically — no class to remember:

| Item count | `.grid-3` shape | `.grid-4` shape |
|------------|----------------|----------------|
| 5 | 3 + 2 centred | not recommended (use grid-3) |
| 6 | 3 + 3 | not recommended (use grid-3) |
| 7 | 3 + 3 + 1 centred | 4 + 3 centred |
| 8 | 3 + 3 + 2 centred | 4 + 4 |
| 9 | 3 + 3 + 3 | 4 + 4 + 1 centred (use grid-3 instead) |
| 10 | 3 + 3 + 3 + 1 centred | 4 + 4 + 2 centred |

For 7 or 10 items, prefer `.grid-4` (gives 4+3 or 4+4+2 — fewer rows, balanced last row). For 5, 8, or 9 items prefer `.grid-3`. The `.pillars-grid` 7-card homepage row is the canonical 4+3 example.

### 18.3 Audit

There is no separate CI audit for grid balance — the rule is enforced by code review against this section. Verify visually after adding content. The `audit-circular-links` audit catches the related class of bugs (cards that link nowhere).

### 18.4 What changed from Phase 19

Phase 19 introduced `.is-centered` as an opt-in modifier applied only to flagged grids (9 pages). Phase 21 made the centred-last-row behaviour the default for every `.grid-N` site-wide, so authoring a new grid no longer requires remembering the modifier. The previous CSS-Grid columns were also replaced with flex-wrap so a child width is enforced per item rather than per track — this is what makes the last-row centring work without JS.

---

## 19. Placeholder governance (Phase 19)

A "placeholder" is anywhere we ship a visible-but-empty box, generic stock illustration, or non-representative artwork. The site's policy is:

- **Hero / feature visuals on product, service, and homepage** — must use a purpose-drawn SVG illustration (the `assets/img/product-*.svg`, `assets/img/service-*.svg`, `assets/img/hero-*.svg` family).
- **"Coming soon" tiles** — use `.soon-tile` (Phase 18) so the tile is visually present but non-clickable. See §17.1.
- **Tool empty-states** — the inline `<div class="placeholder">Paste …</div>` pattern inside `.tool-output` is acceptable; it is the canonical empty state for `resources/tools/*`, not a layout placeholder.

The current placeholder inventory is **zero** for hero / feature visuals; all 22 product/service hero blocks ship with named SVG illustrations (Phase 19 wave).

---

## 20. Standards evolution timelines (Phase 19)

`/resources/timelines/` hosts seven chronological timelines:

| Slug | Topic |
|------|-------|
| `fido` | FIDO 1.0 → passkeys |
| `piv` | FIPS 201 → derived credentials |
| `epassport` | BAC → PACE-CAM |
| `otp-sms` | S/Key → SMS deprecation |
| `smart-cards` | Moreno patent → multi-applet SEs |
| `webauthn-passkey` | CredMan API → synced passkeys |
| `secure-elements` | SIM → IoT trust chip |

### 20.1 Regenerate

```bash
python3 tools/build_timelines.py
```

Each timeline page renders from the `TIMELINES` data structure in `tools/build_timelines.py` — one chronological list of `(year, head, body, refs)` tuples per topic, plus a `related` list of cross-links. The script also rebuilds the `/resources/timelines/` index page. Add a new timeline by appending to the list and re-running the script.

### 20.2 Visual treatment

The `.timeline` / `.timeline-entry` CSS lives in `assets/css/main.css` (Phase 19). A single red-to-grey vertical line runs down the left edge with year+title pairs on the right. No JS — pure CSS.

---

## 21. Production JS hardening (Phase 19)

All 68 `assets/js/**/*.js` files are passed through `tools/harden-js.py` before they ship. The hardener:

- strips line and block comments (including licence comments)
- removes `console.log/debug/info/warn/error/trace/table` statements
- removes `// TODO / FIXME / XXX / HACK` lines
- collapses 3+ blank lines down to 1

It does **not** mangle identifiers, rename functions, or alter logic. The source-of-truth is git history — to debug or extend a tool, `git log -p assets/js/<tool>.js` shows the un-stripped version. Running `python3 tools/harden-js.py` is idempotent (a second run produces no diff).

The hardener is **not** wired into the build script. It ran once as part of Phase 19 and the stripped output is committed. When adding a new JS file or making non-trivial edits to an existing one, run `python3 tools/harden-js.py` before committing so the shipped surface remains free of comments and console statements.

---

## 22. Site-wide search (Phase 20)

A modal search overlay is wired into the navbar of every page via the `as-search-trigger` button (look for the icon labelled "Search ⌘K" next to "Contact").

### 22.1 How it works

- `assets/data/search-index.json` — flat JSON listing every indexable page with title, description, type, URL. Regenerate with `python3 tools/build-search-index.py`.
- `assets/js/site-search.js` — modal UI, ranked filtering, keyboard navigation (↑ / ↓ / Enter / Esc).
- Opens on `Cmd/Ctrl+K`, a bare `/` keypress outside text inputs, or a click on any element with class `as-search-trigger`.
- Reads `?q=` from the URL on page load — used by the WebSite `SearchAction` JSON-LD on the homepage so Google can wire its sitelinks search box.
- The index loads lazily (fetched on first open). 73 KB JSON, served same-origin only.

### 22.2 Regenerate after content changes

```bash
python3 tools/build-search-index.py
python3 tools/build-llms-full.py    # rebuild the LLM-friendly mirror at the same time
```

Both scripts walk every `*.html` and `*/index.html` and derive title / description / type from the file's `<title>` and `<meta name="description">`. If you add a new top-level URL prefix, extend the `TYPE_TABLE` in `tools/build-search-index.py`.

### 22.3 What the search does NOT do

- No full-text body indexing. Title + meta description only — keeps the index under 80 KB and the privacy posture clean (no draft body content leaked).
- No external service. Pure same-origin fetch + in-browser filtering.
- No autocomplete persistence. Each open is a fresh query.

---

## 23. Cookie consent + analytics governance (Phase 20)

The site uses a **consent-on-load** model. Analytics is opt-in; no tracking script loads until the visitor accepts.

### 23.1 Flow

1. `assets/js/nav.js` loads only `analytics-config.js` (defines `window.AS_ANALYTICS`).
2. `assets/js/cookie-consent.js` reads `localStorage["as-consent"]`:
   - `granted` → loads `analytics.js`, which dispatches to the configured provider.
   - `denied` → sets `as-analytics-opt-out=1`, never loads `analytics.js`.
   - unset and DNT off → renders the banner.
   - unset and DNT on → treated as implicit decline.
3. The banner is dismissed by either button. Preference persists in localStorage.

### 23.2 Re-opening the banner

`/privacy/` has a "Re-open the consent banner" button that calls `AS_CONSENT.reset()`. Visitors can also clear `localStorage` and refresh.

### 23.3 When the operator turns analytics on

1. Set `provider` in `assets/js/analytics-config.js` (`"plausible"` or `"ga4"`).
2. For Plausible: confirm `plausible.domain` matches the production hostname.
3. For GA4: replace `G-XXXXXXXXXX` with the real measurement ID.
4. No CSP delta needed for Plausible (the script is `'self'`-allowlisted via inline injection); for GA4, add `https://www.googletagmanager.com` to `script-src` and `https://www.google-analytics.com` to `connect-src` in `.htaccess`.
5. Visitors who previously accepted will start emitting events immediately; previously-declined visitors stay opted out.

### 23.4 What we never collect

- No advertising cookies, no marketing pixels, no cross-site profiling.
- No PII collection (no email, no name, no IP-derived identity).
- No keystroke logging on tool inputs (the /resources/tools/ surface is purely client-side).
- No session replay.

---

## 24. AI-engine discoverability (Phase 20)

Two new top-level files advertise the site to LLM crawlers under the [llmstxt.org](https://llmstxt.org) convention:

- `/llms.txt` — short hand-curated overview (products, services, technologies, timelines, references, contact). Hand-edited; bump when a new product/service surface ships.
- `/llms-full.txt` — full indexable-page list with summaries, grouped by type. Generated by `tools/build-llms-full.py` from the same search index.

Both files are listed in `robots.txt`. They are NOT indexed in the HTML sitemap (sitemap stays a list of HTML pages only).

Additional AI-friendly hooks:

- Homepage JSON-LD now includes a `WebSite` schema with a `SearchAction` pointing at `https://ambisecure.ambimat.com/?q={search_term_string}`. The `?q=` param is read by `site-search.js` on load and pre-fills the modal.
- Every reference page carries `TechArticle` JSON-LD (existing).
- Every product page carries `Product`/`Service` JSON-LD (existing).
- Standards-evolution timelines under `/resources/timelines/` carry `CollectionPage` + `ItemList` JSON-LD with chronological positions.

### 24.1 Regenerate llms-full.txt after content changes

```bash
python3 tools/build-search-index.py
python3 tools/build-llms-full.py
```

### 24.2 What we don't do

- No keyword-stuffing.
- No AI-bait pages. The same pages users see are what crawlers see.
- No cloaking, no UA-sniffing, no AI-only content.

---

## 25. FIDO Validation Server demo deployment (Phase 20)

The "Request demo" CTA on `/services/fido-validation-server/` points at `https://fido.ambisecure.ambimat.com/`. The runtime there is **not** Hostinger-shared-compatible — it needs Node 20+ + DynamoDB.

### 25.1 Bundle build

```bash
bash tools/build-fido-demo.sh
```

Produces `dist/fido-demo/`:

```
frontend/        Static UI shell (Hostinger-uploadable). admin/ + sap/ stripped.
backend.tar.gz   Node.js validation server source, no .env, no node_modules.
DEPLOYMENT.md    Operator notes — env vars, CORS, no-source-leak checklist.
```

The bundle is **gitignored** (`dist/` is) and never lands in `ambisecure.ambimat.com` public_html.

### 25.2 Two-origin architecture

```
   ambisecure.ambimat.com           fido.ambisecure.ambimat.com
   marketing site (Hostinger)  ←CORS→  validation server runtime (VPS / Render / Fly)
```

The `frontend/` shell can be uploaded to `fido.ambisecure.ambimat.com` as the static face of the demo, with the Node.js backend reverse-proxied behind it. See `dist/fido-demo/DEPLOYMENT.md` for the full operator playbook including env-var schema, CORS allow-list, and the curl-based no-source-leak smoke test.

### 25.3 No-source-leak guardrails on the live demo

Before flipping the demo on, run the curl checklist in `dist/fido-demo/DEPLOYMENT.md`. The deployment is considered safe to announce only when:

- `/.git/`, `/.env`, `/package.json`, `/src/`, `/db.js`, `/admin/`, `/sap/` all return 404 / 403.
- No stack traces leak on any handler (all routes wrap errors).
- `SESSION_SECRET` is set from env, not the in-source `secret123` literal.
- TLS is enforced (HSTS on, http→https redirect at the proxy).

### 25.4 Rolling back

If the demo needs to be pulled, swap the CTA href in `services/fido-validation-server/index.html` from `https://fido.ambisecure.ambimat.com/` back to `/contact/`, push, and stop the backend service. The bundle is reusable for re-deployment.

---

## 26. In-page TOC + freshness dashboard (Phase 20)

### 26.1 Blog TOC

Modern cornerstone blog posts (≥4 H2/H3 headings) get a fixed-position table of contents on viewports ≥ 1180 px. Implementation:

- `assets/js/blog-toc.js` — scans the post for headings, slugifies IDs if missing, builds the `<aside class="blog-toc">`. Uses an IntersectionObserver to highlight the current section.
- `assets/css/main.css` — `.blog-toc` + `.blog-toc-item` styles. Mobile hides the TOC entirely.
- Wired into 26 modern posts in `/blog/` via `<script src="/assets/js/blog-toc.js" defer></script>` next to web-vitals.

### 26.2 Operator freshness dashboard

`/_internal/freshness.html` is an operator-only HTML view of overdue blog posts. Regenerate:

```bash
python3 tools/render-freshness-page.py
```

Reads `assets/data/blogs.json` directly; groups posts into "modern overdue" (current + >18 months) and "archive overdue" (archive + >24 months). The `_internal/` directory is:

- excluded from sitemap.xml
- disallowed in robots.txt
- deny-all'd via `_internal/.htaccess`
- excluded from the Hostinger package build
- noindex'd via `X-Robots-Tag` header

Operator runs it locally or pulls it from `dist/` when reviewing freshness. **Not** intended to be reachable from the public site.

### 26.3 Quarterly cadence

Run the dashboard every quarter (or after a batch of blog reviews). Each row links straight to the post; refresh the content, bump `last_reviewed` in `assets/data/blogs.json`, commit. The pre-commit hook in `.githooks/pre-commit` enforces the `last_reviewed` bump on any touched blog file.

---

## 27. CSP posture (Phase 20)

The Content-Security-Policy in `.htaccess` was tightened in Phase 20:

| Directive | Before | After |
|-----------|--------|-------|
| `style-src` | `'self' 'unsafe-inline' https://fonts.googleapis.com` | `'self' 'unsafe-inline'` |
| `font-src`  | `'self' https://fonts.gstatic.com` | `'self'` |

Fonts are fully self-hosted (`assets/fonts/*.woff2`); the Google Fonts allow-list was defensive but unused. The `'unsafe-inline'` on `style-src` remains until residual inline `style=` attributes are class-extracted (tracked in OPEN_ITEMS).

---

## 28. FIDO demo handling — current posture (Phase 21)

The runtime at `fido.ambisecure.ambimat.com` is **not** live yet. Phase 21 wired both "Request demo" CTAs on `/services/fido-validation-server/` to a dedicated interstitial at `/services/fido-validation-server/demo/` instead of the unresolvable subdomain.

### 28.1 What the interstitial does

- Frames the demo as "provisioning in progress" rather than broken.
- Explains what reviewers will see (registration + authentication ceremony, attestation verification, per-tenant policy).
- Offers a structured mailto with subject `FIDO Validation Server — demo access request` and a pre-filled body capturing tenant scope, target authenticators, and integration stack.
- Surfaces the read-now reading list: service page, FIDO timeline, WebAuthn timeline, cornerstone blog posts, COSE algorithms reference.

### 28.2 When the live runtime ships

Swap the two `<a href="/services/fido-validation-server/demo/">` references on `/services/fido-validation-server/index.html` back to `https://fido.ambisecure.ambimat.com/` (or whatever production hostname the operator picks), and either keep the interstitial as a public access-request surface or 301 it to `/services/fido-validation-server/`.

### 28.3 Why interstitial-first

A broken DNS / 404 / "this site can't be reached" page from the unresolvable subdomain reads as abandoned. A controlled interstitial reads as deliberate. Per the Phase 21 brief: "The experience must feel: intentional, enterprise-grade, controlled."

---

## 29. Site-wide search redesign (Phase 21)

The Phase 20 search modal worked functionally but read as generic. Phase 21 redesigned it as a command-palette overlay with these properties:

- **Single-card surface** — title, one-line description, URL, and a forward chevron per row. No badge column; the group label carries the type signal instead.
- **Grouped results** — results bucket into Products / Services / Solutions / Technologies / Industries / Timelines / References / Tools / Blog / Archive / etc. Group order matches a fixed taxonomy (see `GROUPS` in `assets/js/site-search.js`).
- **Match highlighting** — query tokens render with `<mark>` highlight on title and description.
- **Refined chrome** — blurred backdrop (`backdrop-filter: blur(6px)`), entrance animation (`as-rise` cubic-bezier), rounded `border-radius: 14px`, soft `box-shadow`, monospace kbd hints in the footer.
- **Same shortcuts** — `⌘K` / `Ctrl+K` toggles, bare `/` opens, `↑` / `↓` / `Enter` / `Esc` for keyboard nav. Hover and active states share styling so mouse and keyboard feel symmetric.
- **Same data source** — still reads `/assets/data/search-index.json` (262 pages, 73 KB). No index regeneration is needed when the UI changes.

### 29.1 What to edit

- `assets/js/site-search.js` — controller, ranking, grouping.
- `assets/css/main.css` `/* PHASE 21 — SITE-WIDE SEARCH (command-palette) */` block — visual styling.

If a new top-level URL prefix is introduced, extend `TYPE_TABLE` in `tools/build-search-index.py` and `GROUPS` in `site-search.js` to give it a group label and a position in the ordering.

### 29.2 Why not just keep the Phase 20 design

The Phase 20 version stacked type-coloured badges next to titles, which read as cluttered when many results were of the same type (e.g. searching "fido" returns 8 products + 4 services + 6 blogs and the badge column became visually noisy). Phase 21 collapses the badge into the group header — one label per group, not per row. That mirrors the Stripe-docs / Linear / Vercel patterns the brief called out.

## 30. Homepage hierarchy (Phase 22)

Phase 22 fixed the homepage's commercial clarity problem: visitors had to scroll past four sections before they could answer *who AmbiSecure is*, *what AmbiSecure builds*, *who AmbiSecure helps*, and *how AmbiSecure helps*. The new ordering surfaces all four answers in the first two sections, then layers in capability proof, navigation, and conversion paths.

### 30.1 The canonical order

| # | Section | Purpose | Lives at |
|---|---------|---------|----------|
| 1 | Hero | Tagline + value prop + primary CTAs | `<section class="hero">` |
| 2 | About strip (Phase 22) | **Who / What / Who-helps / How** in four compact cards | `<section aria-labelledby="who-heading">` |
| 3 | Highlight banner | Rotating carousel of featured campaigns | `<section aria-labelledby="banner-heading">` (slot driven by `highlight-banner-config.js`) |
| 4 | Core pillars | Seven engineering domains | `<section aria-labelledby="pillars-heading">` |
| 5 | Six surfaces | Capability proof — what we ship | `<section aria-labelledby="capabilities-heading">` |
| 6 | Trust chain | Architectural depth — silicon → application | `<section aria-labelledby="trust-heading">` |
| 7 | Solutions | Problem-shaped views | `<section aria-labelledby="solutions-heading">` |
| 8 | Ecosystem map | Eight-way navigation | `<section aria-labelledby="ecosystem-heading">` |
| 9 | Resources toolbox | Free utility tools | `<section aria-labelledby="resources-heading">` |
| 10 | Where AmbiSecure ships today | Industries / use-case strip | `<section aria-labelledby="explore-heading">` |
| 11 | Why AmbiSecure | 40+ year credibility paragraph | `<section aria-labelledby="why-heading">` |
| 12 | Featured technical reads | Blog spotlight (rotates daily) | `<section aria-labelledby="blog-heading">` |
| 13 | Videos | Three video teaser | `<section aria-labelledby="videos-heading">` |
| 14 | From wafer to user | Architecture flow + trust/cert/partner cards | `<section aria-labelledby="fit-heading">` |
| 15 | Three places to go | Case studies / brochures / engagement models | `<section aria-labelledby="commercial-heading">` |
| 16 | Contact callout | "Talk to engineers, not BDRs" | trailing `<section>` |

### 30.2 About strip content rules

The About strip carries four cards in a fixed order — **Who / What / Who-helps / How** — and **no other order is acceptable**. The cards answer the four questions a visitor wants resolved within the first viewport. If a card body becomes outdated (new geography served, new offering category, new engagement shape), edit the `<p>` text in place; do not add a fifth card. The grid relies on the four-card width — additions break the layout under 1080px.

CSS class: `.who-grid > .who-card`. Lives in `assets/css/main.css` under the `/* PHASE 22 — HOMEPAGE ABOUT STRIP */` block.

### 30.3 Reduction conventions

When the homepage runs over 16 sections again, the rule is the same as Phase 22: prefer **reorder** + **trim duplicate** over add. If two sections lead to the same destination (e.g. the dropped "Start here" + "Solutions" both fed `/solutions/`), keep the one with the deeper content. The nav and footer already provide multi-axis discovery; the homepage is not a sitemap.

### 30.4 Where the About strip is NOT

Note that the long-form "Why AmbiSecure" section at slot 11 carries the credibility paragraph (40+ years, in-house JavaCard/FIDO/personalisation expertise, vendor relationships). The Phase 22 About strip at slot 2 is the **short-form** orientation surface — purposely four short cards, not paragraphs. Keep both. They serve different reading depths.

---

## 31. Keyra references (Phase 22)

**Status: zero references.** Site-wide grep on 2026-05-12 confirmed no occurrences of `Keyra` / `keyra` / `KEYRA` in any HTML, JS, CSS, JSON, Markdown, or XML file under the project root (excluding `.git/`, `dist/`, `legacysitedata/`, `node_modules/`). The Phase 22 brief asked for Keyra removal; nothing existed to remove. The verification step is recorded here so future operators do not re-litigate.

If Keyra references appear in future content drafts, **do not commit them**. AmbiSecure positioning is the security business unit of Ambimat Electronics; Keyra is a separate project and does not belong on this site.
## 32. Favicon governance (Phase 24)

The favicon set is generated from the same `Logos/ambisecure_logo_og.jpg` (512×512) source as the main brand. Every page links four raster sizes plus the SVG:

| File | Size | Source | Purpose |
|---|---|---|---|
| `assets/img/favicon.svg` | vector | hand-coded | Browser tabs that prefer SVG. Simplified to red A + white circle (no internal wordmark — illegible at 16/32 px). |
| `assets/img/favicon-32.png` | 32×32 | `sips -Z 32 Logos/ambisecure_logo_og.jpg` | Standard browser tab. |
| `assets/img/favicon-64.png` | 64×64 | same | High-DPI tab + bookmarks bar. |
| `assets/img/favicon-192.png` | 192×192 | same | Android home-screen + PWA manifest. |
| `assets/img/favicon-512.png` | 512×512 | same | PWA install splash + Android adaptive icon. |
| `assets/img/apple-touch-icon.png` | 180×180 | same | iOS home-screen. |

All five raster sizes are referenced in the `<head>` of every HTML page via the favicon block:

```html
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml" />
<link rel="icon" type="image/png" sizes="32x32" href="/assets/img/favicon-32.png" />
<link rel="icon" type="image/png" sizes="64x64" href="/assets/img/favicon-64.png" />
<link rel="icon" type="image/png" sizes="192x192" href="/assets/img/favicon-192.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/assets/img/apple-touch-icon.png" />
```

To regenerate after a logo change:

```bash
sips -s format png Logos/ambisecure_logo_og.jpg --out /tmp/master.png
for sz in 32 64 192 512; do
  sips -Z $sz /tmp/master.png -s format png --out assets/img/favicon-$sz.png
done
sips -Z 180 /tmp/master.png -s format png --out assets/img/apple-touch-icon.png
```

`sips` writes JPEG bytes into `.png` files unless you go through a PNG intermediate — always convert to `/tmp/master.png` first.

---

## 33. Cache TTL strategy (Phase 24)

`.htaccess` `<IfModule mod_expires.c>` block:

| Type | TTL | Why |
|---|---|---|
| `text/html` | **5 minutes** (Phase 24) | Short during active iteration so re-deploys appear quickly. Bump back to 1 hour once homepage + section pages stabilise. |
| `text/css` | 7 days | Hand-edited cache-bust `?v=N` on all CSS references defeats stale CSS regardless of this TTL (see §34). |
| `application/javascript` | 7 days | Same `?v=N` cache-bust applies. |
| `image/svg+xml`, `image/webp`, `image/png`, `image/jpeg` | 30 days | Images rarely change; aggressive cache helps perf. |
| `application/pdf` | 30 days | Brochures rarely change. |

When you change the HTML TTL, edit `.htaccess` line ~227 and re-upload.

### 34. Cache-bust convention (Phase 22+)

Every reference to a CSS or JS file site-wide carries a `?v=<N>` query string. The Phase 24 version is `23`. Bump it whenever you publish a meaningful CSS or JS change that browsers must refetch. The sweep script is open-coded; the canonical pattern is `/assets/css/main.css?v=23` and `/assets/js/<file>.js?v=23` across all HTML files.

To bump, run the sweep at `tools/` / inline Python (no dedicated CLI yet); search for `?v=23` and replace with `?v=24`. The next deploy then forces every browser to refetch.

---

## 35. Hero crest as flagship visual (Phase 24)

The homepage hero's right-side visual is the **official AmbiSecure crest** from `assets/img/og/ambisecure-logo-og.jpg` (512×512), rendered at `max-width: 520px` via `.hero-crest`. This is intentionally the brand badge itself, not an abstract illustration:

- The crest carries its own internal "AMBI SECURE" wordmark at this size, so the brand is unmistakable.
- The three orbiting icons (smart-home / lock / industrial) communicate the three audience verticals (consumer / enterprise IT / industrial-IoT).
- The previous `hero-secure-element.svg` is no longer the hero visual but remains available for future product-specific heroes.

Companion hero specs (`.hero`, `.hero-title`, `.hero-desc`, `.hero-creds`):

- `min-height: 92vh` (was 86vh in Phase 22; was 78vh originally)
- `padding: 110px 80px 140px` desktop
- `.hero-title` 62px, line-height 1.05, letter-spacing -1.4px
- `.hero-desc` 19px, max-width 640px
- `.hero-creds` strip — 7 domains (FIDO · PIV · PKI · JavaCard · Secure Elements · ePassport · IoT Security), uppercase, red bullet, separated from the description by a 1px top border
- Mobile (`max-width: 880px`): title 40px, crest `max-width: 320px`, padding `60px 24px 90px`
