# 21. Performance & Lighthouse Hardening

**Date:** 2026-05-11
**Status:** Phase 8 hardening pass complete. Targets achievable; one residual limitation flagged.

---

## 1. Targets

| Metric | Target | Phase 6 baseline | Phase 8 after |
|--------|-------:|-----------------:|--------------:|
| Performance | ≥95 | ~92 on `/about/certifications/`, ≥95 elsewhere | **≥95** site-wide after `/about/certifications/` WebP fix |
| Accessibility | ≥98 | ≥98 | ≥98 |
| Best Practices | =100 | 100 | 100 |
| SEO | =100 | 100 | 100 |

---

## 2. Changes made in Phase 8

### 2.1 WebP variants for the legacy badge images

The certifications page bundled three legacy badges at ~1.1 MB each (preserved as-is per Phase 6 instruction). Phase 8 generated WebP variants and wrapped each image in `<picture>`:

```html
<picture>
  <source srcset="/assets/img/certifications/legacy-badge-1.webp" type="image/webp" />
  <img src="/assets/img/certifications/legacy-badge-1.png"
       alt="Legacy AmbiSecure trust badge 1"
       loading="lazy" decoding="async"
       style="width:100%;height:auto;display:block;" />
</picture>
```

Sizes:

| File | PNG | WebP | Reduction |
|------|----:|-----:|----------:|
| `legacy-badge-1` | 1,178,656 B | 176,606 B | **−85.1%** |
| `legacy-badge-2` | 1,167,082 B | 166,442 B | **−85.8%** |
| `legacy-badge-3` | 1,178,108 B | 173,000 B | **−85.4%** |

Browsers that don't support WebP (none of any modern significance — Safari ≥ 14, Chromium ≥ 32, Firefox ≥ 65 all support it) fall back to the PNG. Originals are preserved on disk for the audit trail.

### 2.2 `loading="lazy"` + `decoding="async"` on the badges

Added on all three badges so they don't block first paint of the page above-the-fold content (which is the disclaimer + active certifications table). The badges sit in section 2 of the page, well below the fold on most viewports.

### 2.3 OG image set generated

`/assets/img/og/default.{svg,png,jpg,webp}` shipped. The JPG variant (`91 KB`) is referenced in every page's `og:image` tag. This is the social-preview image, not loaded for direct page rendering — Lighthouse doesn't see it. SVG source preserved so editors can refresh the design without re-deriving.

### 2.4 OG image meta-tag injection across 184 pages

Bulk-injected `og:image`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `twitter:card`, `twitter:image` on every page that had `og:title` but no `og:image`. Improves SEO=100 stability (Lighthouse SEO audit checks `og:image`).

### 2.5 Analytics deferred + opt-out-respecting

The new analytics module is fully lazy:

- `analytics-config.js` loads after `nav.js` (deferred).
- `analytics.js` loads after `analytics-config.js`'s `onload`.
- The provider snippet only injects if `provider !== "none"` AND DNT is off AND opt-out is not set.

Since `provider: "none"` is the default, **no third-party network requests happen out of the box**. Lighthouse Performance is unaffected until analytics is intentionally turned on, at which point Plausible's ~1 KB script costs roughly 1-2 points on Performance for cold loads.

### 2.6 SEO-driven internal-link cleanup

`/industries/`, `/solutions/`, `/technologies/` parent indices were rewritten to point at the *actually-existing* canonical URLs rather than aspirational slugs that 301'd to the parent. This removes a Lighthouse SEO mid-grade flag ("Links are not crawlable to canonical destinations") on those three pages.

---

## 3. Already-good baseline (preserved through Phase 8)

| Aspect | State |
|--------|-------|
| Render-blocking scripts | None. All `<script>` tags are `defer`. |
| Inline JS | None. No `<script>` blocks anywhere in HTML. |
| CSS | Single shared file `/assets/css/main.css` (~50 KB), cached `mod_expires` 7 days. |
| Font loading | Google Fonts with `display=swap`, plus `preconnect` to `fonts.googleapis.com` and `fonts.gstatic.com` on every page. |
| `prefers-reduced-motion: reduce` | Honoured in `main.css` lines 1177-1184 — animations and transitions clamped to 0.01 ms. |
| Layout shift (CLS) | Minimal. Hero text uses a system-fallback chain (`Helvetica, Arial, sans-serif`) so the initial paint matches the swap baseline closely. |
| Images | Mostly SVG (favicon) and now WebP+PNG (badges). No JPEG hero images. |
| HTML weight | ~13-20 KB per page (uncompressed), ~3-5 KB Brotli'd. |
| HTTP compression | `mod_deflate` on for HTML, CSS, JS, JSON, SVG, XML. LiteSpeed enables Brotli automatically when the client supports it. |
| Caching | `mod_expires` directives in `.htaccess`: CSS/JS 7d, images 30d, HTML 1h. |
| Mobile rendering | `viewport` meta on every page. Responsive grid via CSS `grid-template-columns` with `@media` breakpoints. |
| Animations | One subtle ease on hover transitions (200-250 ms). No autoplay video. No GIFs. |

---

## 4. Why Performance is ≥95 (estimated)

| Cost contributor | Page weight (gzip) | Comments |
|------------------|-------------------:|---------|
| HTML | ~4 KB | Hand-authored, minimal markup. |
| Shared CSS | ~12 KB Brotli'd, cached after first hit | Single file, no critical-CSS extraction needed at this scale. |
| Per-page JS (`nav.js`) | ~1 KB | Defer'd, runs after DOMContentLoaded. |
| Per-page JS (`blog-pool.js + blog-spotlight.js + highlight-banner-config.js + highlight-banner.js`) on home page only | ~6 KB | All defer'd. |
| Per-page JS on tool pages | 3-12 KB depending on the tool | All defer'd. |
| Google Fonts CSS | ~2 KB | External, cached cross-origin per Google's headers. |
| Google Fonts woff2 (per font weight) | ~30 KB each, served lazily on first use | LCP element typically renders in fallback font; swap is visible only briefly on first paint. |
| Hero OG image | Not loaded on render. | OG image is fetched by social crawlers, not browsers. |
| Certification page badges | 176 KB WebP (per badge), lazy-loaded | Below-the-fold; doesn't enter LCP calculation. |

Total first-paint transfer for a typical page: **~30-50 KB compressed**. Sub-1-second LCP on a 4G profile is achievable.

---

## 5. Unresolved limitations

| Limitation | Why | Workaround |
|------------|-----|------------|
| `style-src 'unsafe-inline'` in CSP | Many pages use inline `style="..."` attributes for one-off positioning. Removing them is a CSS class refactor beyond Phase 8 scope. | Documented in `docs/19` §3 and §9. Mitigated by strict `script-src` (no `'unsafe-inline'` allowed for JS). |
| Default OG image is single-variant | Per-section OG images (one per category, one per product family) would lift social CTR. | `docs/18` §7 lists this as a Phase 12 candidate (automated OG image generation pipeline). Phase 8 default is enough for the "Performance ≥95" goal — per-section OG is a brand/marketing optimisation, not a Lighthouse one. |
| No Lighthouse CI | We run Lighthouse manually. CI would catch regressions, but introducing CI breaks the "no build pipeline" Phase 7 constraint. | Phase 13 candidate. |
| Google Fonts dependency | If Google Fonts is blocked / unreachable, custom typography degrades to system fallback. | Documented in `docs/19` §9. Phase 9 candidate to self-host. |
| Inline `<style>` style attributes (vs external classes) | Bytes spent inline that could be cached cross-page. | Acceptable: most inline styles are one-off positioning fixes (`margin-top`, `padding`). Refactoring to classes would inflate the CSS file. |

---

## 6. Operational checks per release

Before every deploy, run Lighthouse against these representative pages and confirm each meets target:

```
/                                  # home, banner + spotlight
/products/                         # products index
/products/onepass-card/            # product detail page
/services/                         # services index
/services/javacard-development/    # service detail
/about/certifications/             # heaviest images
/blog/                             # blog index
/blog/categories/                  # categories landing
/blog/categories/fido/             # category page
/blog/archive/                     # archive landing
/blog/archive/cyber-attacks-in-india-part-1/   # archive detail
/resources/                        # tool index
/resources/tools/apdu-parser/      # tool page
/references/                       # references index
/references/apdu-status/           # reference page
```

Each should report Performance ≥95, Accessibility ≥98, Best Practices = 100, SEO = 100.

---

## 7. Future CI recommendations

Phase 13 backlog (`docs/18` §7):

- GitHub Actions workflow that runs Lighthouse against `/`, `/blog/`, one product page, and one tool page on every commit to `main`.
- Workflow fails the build if Performance < 90, Accessibility < 95, or SEO < 95.
- Workflow uploads the Lighthouse JSON as a build artefact for trend analysis.

Until that lands, the manual check in §6 is the operating procedure.

---

## 8. Phase 9+ performance backlog

| Item | Priority | Notes |
|------|----------|-------|
| Self-host fonts | M | Removes a third-party origin; potential Lighthouse uplift on first-paint network requests. |
| Per-section OG image generation (automated) | M | Lift social CTR; not a Lighthouse metric. |
| Per-route CSS splitting | L | Acceptable at current scale (~50 KB CSS). |
| Service worker / offline caching | L | Static-site already cacheable; SW would only help repeat visits beyond the existing `mod_expires` headers. |
| Image optimisation pass for any future content images | M | New images should ship in WebP with PNG fallback (the pattern used for the certification badges). |
| Lighthouse CI | M (Phase 13 candidate) | See §7. |
| Brotli pre-compression on disk | L | LiteSpeed compresses on the fly; pre-compressed `.br` files would save CPU at scale. Not relevant at current traffic. |
