# AmbiSecure Legacy Site — Video Inventory

**Source site:** https://ambisecure.ambimat.com
**Crawl date:** 2026-05-11
**Scope:** All video, video-tutorial, and downloadable video assets found on the legacy WordPress site (pages, posts, products, sitemap, REST media API, JS bundles).
**Local archive root:** `legacysitedata/videos/`

---

## Discovery Method

1. Pulled the full `sitemap.xml` index (7 child sitemaps) and built a list of 274 unique pages + 16 blog posts.
2. Downloaded every page's HTML and grep'd for: `<video>`, `<source>`, `<iframe>`, `youtube.com/embed`, `youtu.be`, `vimeo.com`, `player.vimeo.com`, `wistia`, `dailymotion`, and `.mp4 / .webm / .mov / .m3u8 / .avi / .mkv / .m4v / .ogg / .ogv` file extensions.
3. Downloaded all internal JS bundles (24 files) and searched them for hardcoded video URLs — none found beyond what was in HTML (Owl Carousel plugin handles YT/Vimeo IDs via data attributes already counted).
4. Queried the WordPress REST API: `wp-json/wp/v2/media?media_type=video&per_page=100` (header `x-wp-total: 2` — confirms exhaustive coverage of uploaded video files).
5. Crawled `wp-content/uploads/` references for `.mp4 / .webm / .mov / .m3u8 / .avi / .mkv` — only the 2 known files exist.

**Result:** 8 unique videos (6 YouTube + 2 self-hosted MP4). No Vimeo, Wistia, Dailymotion, HLS, lazy-loaded, or hidden video assets present on the legacy site.

---

## Inventory

### 1. YouTube — AmbiSecure Setup Tutorials (Ambimat Electronics channel)

| # | YouTube ID | Title | Source Page(s) | Original URL | Local Path | Format | Resolution | Duration | Size | Status |
|---|------------|-------|----------------|--------------|------------|--------|------------|----------|------|--------|
| 1 | `9TwKvC7cqOE` | How To Setup AmbiSecure Security card \| U2F \| FIDO | `/learn/how-it-work/`, `/ambisecure-card/` | https://www.youtube.com/watch?v=9TwKvC7cqOE | `videos/youtube/9TwKvC7cqOE__How_To_Setup_AmbiSecure_Security_card_U2F_FIDO.mp4` | MP4 (H.264 + Opus) | 1920×1080 | 1m 15s | 5.04 MB | Downloaded |
| 2 | `Iz_HOaLY3k4` | How To Setup AmbiSecure Security card on your phone on Facebook | `/learn/how-it-work/` | https://www.youtube.com/watch?v=Iz_HOaLY3k4 | `videos/youtube/Iz_HOaLY3k4__How_To_Setup_AmbiSecure_Security_card_on_your_phone_on_Facebook.mp4` | MP4 (H.264 + Opus) | 1280×720 | 24s | 1.25 MB | Downloaded |
| 3 | `WfA_F03IOd8` | How To Setup AmbiSecure Security card in Facebook \| U2F \| FIDO | `/learn/how-it-work/`, `/ambisecure-card/` | https://www.youtube.com/watch?v=WfA_F03IOd8 | `videos/youtube/WfA_F03IOd8__How_To_Setup_AmbiSecure_Security_card_in_Facebook_U2F_FIDO.mp4` | MP4 (H.264 + Opus) | 1920×1080 | 1m 08s | 3.82 MB | Downloaded |
| 4 | `bo9VA5AWuKQ` | How To Setup AmbiSecure Security card in Gmail \| U2F \| FIDO | `/learn/how-it-work/`, `/ambisecure-card/` | https://www.youtube.com/watch?v=bo9VA5AWuKQ | `videos/youtube/bo9VA5AWuKQ__How_To_Setup_AmbiSecure_Security_card_in_Gmail_U2F_FIDO.mp4` | MP4 (H.264 + Opus) | 1920×1080 | 1m 21s | 3.63 MB | Downloaded |
| 5 | `gSd5Nu2V0z8` | How To Setup AmbiSecure Security card on your phone in Gmail | `/learn/how-it-work/` | https://www.youtube.com/watch?v=gSd5Nu2V0z8 | `videos/youtube/gSd5Nu2V0z8__How_To_Setup_AmbiSecure_Security_card_on_your_phone_in_Gmail.mp4` | MP4 (H.264 + Opus) | 1280×720 | 1m 15s | 2.66 MB | Downloaded |
| 6 | `uInKs6D_t-U` | AmbiSecure Card - All Use Cases | `/metal-one-pass-card-page/`, `/ambisecure-one-pass-a-multiple-application-card/` | https://www.youtube.com/watch?v=uInKs6D_t-U | `videos/youtube/uInKs6D_t-U__AmbiSecure_Card_-_All_Use_Cases.mp4` | MP4 (H.264 + Opus) | 1920×1080 | 1m 27s | 7.72 MB | Downloaded |

Each YouTube download is accompanied by sidecar metadata: `.info.json` (full YouTube metadata), `.description` (video description), `.webp` (thumbnail).

### 2. Self-hosted MP4 — Product Demo

| # | Title | Source Page | Original URL | Local Path | Format | Resolution | Duration | Size | Status |
|---|-------|-------------|--------------|------------|--------|------------|----------|------|--------|
| 7 | bio (AmbiSecure BioKey demo loop) | `/ambisecure-biokey/` | https://ambisecure.ambimat.com/wp-content/uploads/2025/12/bio.mp4 | `videos/self-hosted/bio.mp4` | MP4 (H.264) | 1600×1282 | 5s | 0.84 MB | Downloaded |

### 3. Self-hosted MP4 — Podcast / Long-form Tutorial

| # | Title | Source Page | Original URL | Local Path | Format | Resolution | Duration | Size | Status |
|---|-------|-------------|--------------|------------|--------|------------|----------|------|--------|
| 8 | ICE Podcast Episode 12 — Tracking & Tracing of Critical Parameters (Durgesh Shah) | `/cold-chain-logistics-podcast/` | https://ambisecure.ambimat.com/wp-content/uploads/2021/01/ICE-Podcast-Episode-12-Tracking-Tracing-of-Critical-Parameters-Durgesh-Shah_1080p.mp4 | `videos/podcast/ICE-Podcast-Episode-12-Tracking-Tracing-of-Critical-Parameters-Durgesh-Shah_1080p.mp4` | MP4 (H.264 + AAC) | 1920×1080 | 14m 19s | 161.23 MB | Downloaded |

---

## Validation

All 8 files probed with `ffprobe` — every file has a valid container, decodable video stream (H.264), reported duration, and reported bitrate. No corrupt/truncated downloads.

SHA-256 hashes (dedup-checked, all unique):

```
691ee9f94961641896547b5b86559c83c3d150a71ff279ec1541873db115102f  youtube/9TwKvC7cqOE__How_To_Setup_AmbiSecure_Security_card_U2F_FIDO.mp4
d649d426bcdd56485b8414f622c51a7100cc7d80b6e59036fb339efae1f8d253  youtube/Iz_HOaLY3k4__How_To_Setup_AmbiSecure_Security_card_on_your_phone_on_Facebook.mp4
d5992f56a3f0ffc67b8aa2d5e7df4cac188793423e299a21894ab6f56cd077f7  youtube/WfA_F03IOd8__How_To_Setup_AmbiSecure_Security_card_in_Facebook_U2F_FIDO.mp4
7fae7eb4f249d9e2b31c8e58702dec70a43411e8f59f46d77d65da5ccef82c12  youtube/bo9VA5AWuKQ__How_To_Setup_AmbiSecure_Security_card_in_Gmail_U2F_FIDO.mp4
f3dc9fef26b1d85a7a5b5ec61a31aca7215037ea65760014ea5e97ecb58f328f  youtube/gSd5Nu2V0z8__How_To_Setup_AmbiSecure_Security_card_on_your_phone_in_Gmail.mp4
c08bdd35f4ff532d79ce881263340a9aa77d3a9949f6564013c83294379382da  youtube/uInKs6D_t-U__AmbiSecure_Card_-_All_Use_Cases.mp4
f86e8d6c989da38832c84cef61853b20b1881e8f4360491709748a7a7f5db7a1  self-hosted/bio.mp4
a6a95a21100944439b81b42afa339ed7a201efe64b382ff4d8434d04b03e3a7e  podcast/ICE-Podcast-Episode-12-Tracking-Tracing-of-Critical-Parameters-Durgesh-Shah_1080p.mp4
```

---

## Summary

| Metric | Value |
|--------|-------|
| Total videos found | **8** |
| Total videos downloaded | **8** |
| Failed downloads | **0** |
| Duplicates skipped | **0** (all unique by SHA-256) |
| Total storage consumed | **186.18 MB** (195,228,670 bytes) — videos only; sidecar JSON/webp adds ~1.3 MB |

### Categorized by topic
| Topic | Count | Videos |
|-------|-------|--------|
| FIDO / U2F / Passkey setup tutorials (Gmail, Facebook, desktop, mobile) | 5 | #1–#5 |
| Product overview / use-case demo (AmbiSecure Card) | 1 | #6 |
| Biometric / BioKey product loop | 1 | #7 |
| IoT / Cold-chain podcast (Durgesh Shah) | 1 | #8 |

### Categorized by source type
| Source | Count |
|--------|-------|
| YouTube (embedded `<iframe>`) | 6 |
| Self-hosted `wp-content/uploads/*.mp4` | 2 |
| Vimeo / Wistia / Dailymotion / HLS / lazy-loaded / dynamic JS | 0 |

### Categorized by product / keyword coverage
- **FIDO2 / FIDO / U2F / Passkeys:** #1, #3, #4, #2, #5 (5 videos)
- **Smartcards / AmbiSecure Card (PIV / DESFire / Java Card hardware):** #6, #1, #3, #4
- **Biometrics / BioKey / fingerprint:** #7
- **NFC / hardware authentication card use cases:** #6
- **IoT / cold-chain sensors:** #8
- **Secure Elements / eSIM / PKI:** No dedicated tutorial videos found on the legacy site.

---

## Notes

- The site uses an Owl Carousel plugin to render YouTube embeds — confirmed that the carousel's only video source is the YouTube embed URL exposed in each `<iframe>`, so no hidden video IDs are present in JS state.
- `wp-content/uploads/` directory listing is disabled (HTTP 403/redirect on directory paths), but the WP REST `media?media_type=video` endpoint enumerates *all* uploaded video attachments — only 2 exist (`x-wp-total: 2`).
- Crawl excluded the `/wp-admin/` area, image sitemaps, and non-video MIME types as required.
- No PDFs, ZIPs, images, JS/CSS, or HTML pages were downloaded into the videos directory (HTML/JS were fetched only to `/tmp/ambi_crawl/` for analysis and are not retained under `legacysitedata/`).
