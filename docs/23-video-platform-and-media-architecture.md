# 23. Video Platform & Media Architecture

**Date:** 2026-05-11
**Status:** Implemented and validated. 8 of 8 legacy video assets accounted for.

---

## 1. Inventory accounting

| Source asset | Phase 9 disposition | Where it lives now |
|--------------|---------------------|---------------------|
| `9TwKvC7cqOE` — Setup AmbiSecure card U2F / FIDO | Migrated as YouTube facade | `/videos/setup-ambisecure-card-desktop/` |
| `WfA_F03IOd8` — Setup on Facebook | Migrated | `/videos/setup-ambisecure-card-facebook/` |
| `bo9VA5AWuKQ` — Setup on Gmail | Migrated | `/videos/setup-ambisecure-card-gmail/` |
| `Iz_HOaLY3k4` — Phone setup on Facebook | Migrated | `/videos/setup-ambisecure-card-mobile-facebook/` |
| `gSd5Nu2V0z8` — Phone setup on Gmail | Migrated | `/videos/setup-ambisecure-card-mobile-gmail/` |
| `uInKs6D_t-U` — All use cases | Migrated | `/videos/ambisecure-card-use-cases/` |
| Self-hosted `bio.mp4` (BioKey loop, 879 KB) | Migrated as `/assets/video/biokey-loop.mp4`, served via `<video>` element | `/videos/biokey-product-loop/` |
| Self-hosted `ICE-Podcast-Episode-12...mp4` (161 MB) | **Documented as archived elsewhere.** Not hosted on production. | Original WP source preserved in `legacysitedata/videos/podcast/`. Listed in the "Archived elsewhere" section on `/videos/`. |

**Total:** 7 of 8 hosted on production. 1 (the 161 MB podcast) documented as archive-only.

Rationale for the podcast decision: 161 MB exceeds reasonable static-site bandwidth norms. Hosting it would inflate every visitor's potential transfer cost, slow the videos landing page, and add no incremental SEO value over the original WordPress URL (which already 410s for the WordPress chrome but the asset path is preserved per Phase 7 redirect strategy).

---

## 2. URL structure

```
/videos/                                       -- Landing, grouped by category
/videos/setup-ambisecure-card-desktop/         -- 6 YouTube tutorial pages
/videos/setup-ambisecure-card-facebook/
/videos/setup-ambisecure-card-gmail/
/videos/setup-ambisecure-card-mobile-facebook/
/videos/setup-ambisecure-card-mobile-gmail/
/videos/ambisecure-card-use-cases/
/videos/biokey-product-loop/                   -- 1 self-hosted MP4 page
```

Categories on the landing:

| Group | Members | What goes here |
|-------|---------|----------------|
| FIDO setup walkthroughs | 5 | Gmail / Facebook / desktop / mobile registration flows |
| Product demos | 2 | Use-case overview + BioKey loop |
| Archived elsewhere | 1 | Reference-only entries (podcast) |

---

## 3. YouTube facade implementation

`assets/js/video-facade.js` implements click-to-play. Markup contract:

```html
<div class="yt-facade" data-yt-id="9TwKvC7cqOE" data-title="Setup AmbiSecure card">
  <img class="yt-facade-poster" src="/assets/img/videos/9TwKvC7cqOE.webp" ... />
  <button class="yt-facade-play" aria-label="Play …">▶</button>
</div>
```

On click:

1. The `<button>` triggers facade activation.
2. Facade child nodes are removed.
3. An `<iframe src="https://www.youtube-nocookie.com/embed/<id>?autoplay=1&rel=0&modestbranding=1">` is appended.
4. Iframe is positioned absolute fill within the 16:9 aspect-ratio container.

Properties:

- **No YouTube network call until the button is clicked.** Idle pages cost zero YouTube bytes.
- **`youtube-nocookie.com` domain.** No persistent cookies set until the user actually engages.
- **`referrerpolicy="strict-origin-when-cross-origin"`** on the iframe.
- **`<img loading="lazy" decoding="async">`** on the poster.
- **Idempotent** — clicking twice does nothing on the second click (`facade.dataset.activated` guard).
- **Keyboard accessible** — native `<button>` semantics; Enter/Space activates.

---

## 4. Self-hosted video implementation

```html
<video class="video-self-hosted" controls preload="none"
       poster="/assets/img/videos/biokey-loop-poster.jpg"
       playsinline muted loop>
  <source src="/assets/video/biokey-loop.mp4" type="video/mp4" />
</video>
```

Properties:

- **`preload="none"`** — no network request until user clicks Play.
- **`poster`** — first-frame JPG so the card looks complete before activation.
- **`playsinline muted loop`** — iOS-friendly, accessibility-friendly (silent autoplay possible only when muted).
- **No autoplay attribute** on the videos landing — the user controls everything. The home-page embed uses the same markup.

---

## 5. VideoObject JSON-LD

Every per-video page includes a `VideoObject` schema with:

- `name` — the canonical title
- `description` — the page summary
- `thumbnailUrl` — absolute URL to the WebP/JPG poster
- `duration` — ISO 8601 (`PT1M15S`)
- `uploadDate` — approximate (within accuracy of the legacy site's metadata)
- `publisher` — AmbiSecure / Ambimat Electronics
- For YouTube videos: `embedUrl` (nocookie domain) + `contentUrl` (canonical YouTube watch URL)
- For self-hosted videos: `contentUrl` (the absolute `/assets/video/...` URL)

This is what Google Rich Results uses to surface the video in SERP and Google Video search.

---

## 6. CSP impact

CSP was extended to allow YouTube playback and YouTube thumbnails:

```diff
- img-src 'self' data:;
+ img-src 'self' data: https://i.ytimg.com;

  (frame-src was unset; now explicitly set)
+ frame-src https://www.youtube-nocookie.com https://www.youtube.com;

  (media-src was unset; now explicitly set)
+ media-src 'self';
```

The remaining directives are unchanged:

- `script-src 'self'` — still no remote scripts (the YouTube iframe is allowed via `frame-src`, but its scripts run in its own origin, which is correct).
- `connect-src 'self'` — unchanged. The facade does not fetch from YouTube; only the iframe (after click) talks to YouTube.

Validated by the manual smoke procedure documented in `docs/13` §17.9.

---

## 7. Lighthouse posture

| Concern | Mitigation |
|---------|------------|
| YouTube iframe cost | Click-to-play facade — zero cost until click. |
| Self-hosted video size | `preload="none"` + first-frame poster — zero bytes until Play. |
| Thumbnail size | WebP (~80-120 KB each). Lazy-loaded via `loading="lazy"`. |
| Layout shift | `padding-bottom: 56.25%` on `.yt-facade` and `aspect-ratio` baked into the markup keeps a stable 16:9 box before the iframe loads. |
| Render-blocking | None added. `video-facade.js` is `defer`'d like every other site script. |

Estimated effect on `/videos/` landing Lighthouse: Performance ≥95, same as the rest of the site.

---

## 8. Cross-linking

Per-video pages link to:

- 1-3 related products (e.g. the OnePass Card video links to `/products/onepass-card/` and `/products/tappable/` where appropriate).
- 1-3 related blog posts (modern engineering blog only — historical archive isn't cross-linked from videos to avoid sending visitors to deprecated walkthroughs).
- A CTA back to `/contact/`.
- A "← All AmbiSecure videos" link back to `/videos/`.

The home page surfaces 3 videos (2 YouTube + 1 self-hosted) with a "Browse all" CTA pointing at `/videos/`.

---

## 9. Mobile responsiveness

- `.video-grid` collapses to single-column at `max-width: 720px`.
- `.yt-facade-play` button shrinks from 64 px to 56 px at the same breakpoint.
- `.video-group-header h2` shrinks from 22 px to 19 px.
- All `<video>` and facade elements use `width: 100%` and the 16:9 padding hack so they don't overflow.
- `<video playsinline>` is set on the BioKey loop so iOS Safari does not force fullscreen.

---

## 10. Video sitemap considerations

A separate video sitemap (`<image:video>` or the Google video sitemap extension) was considered. **Not implemented** for two reasons:

1. The 7 hosted video URLs are already in the main `sitemap.xml`.
2. The Google `VideoObject` JSON-LD on each page is the primary discovery signal — a separate video sitemap is supplementary, not required.

If video traffic grows materially, adding `/sitemap-videos.xml` is a one-file addition.

---

## 11. Future media items (Phase 12 candidates)

- Automated thumbnail / poster generation per product family.
- Animated GIF previews on hover for the video cards (CSS `picture` with `srcset`).
- Self-hosted version of high-value YouTube tutorials (decouple from YouTube account dependency). Trade-off: ~5 MB per tutorial × 6 tutorials = ~30 MB of static-site bandwidth. Acceptable, but only worth doing once an analytics signal shows it matters.
- Subtitles / closed captions (WebVTT). Today's 6 YouTube videos have auto-generated captions on YouTube, which the iframe inherits. Self-hosted captions would need authored `.vtt` files.

---

## 12. File manifest

### Added

```
videos/index.html                                     (landing)
videos/setup-ambisecure-card-desktop/index.html
videos/setup-ambisecure-card-facebook/index.html
videos/setup-ambisecure-card-gmail/index.html
videos/setup-ambisecure-card-mobile-facebook/index.html
videos/setup-ambisecure-card-mobile-gmail/index.html
videos/ambisecure-card-use-cases/index.html
videos/biokey-product-loop/index.html
assets/video/biokey-loop.mp4                          (879 KB)
assets/img/videos/9TwKvC7cqOE.webp
assets/img/videos/Iz_HOaLY3k4.webp
assets/img/videos/WfA_F03IOd8.webp
assets/img/videos/bo9VA5AWuKQ.webp
assets/img/videos/gSd5Nu2V0z8.webp
assets/img/videos/uInKs6D_t-U.webp
assets/img/videos/biokey-loop-poster.jpg
assets/js/video-facade.js
docs/23-video-platform-and-media-architecture.md      (this file)
```

### Modified

```
.htaccess          -- CSP: +img-src ytimg.com, +frame-src youtube-nocookie.com, +media-src 'self'
sitemap.xml        -- +8 video URLs (212 -> 220)
assets/css/main.css -- +video grid, facade, pillars (~140 lines)
index.html         -- +pillars + videos teaser + 'where AmbiSecure fits' sections; +video-facade.js
assets/js/highlight-banner-config.js -- +videos banner entry
```
