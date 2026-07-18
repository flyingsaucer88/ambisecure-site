# Live Verification

> **✅ POST-DEPLOYMENT LIVE VERIFICATION — 2026-07-18T09:19Z (14:49 IST). Verdict: PASS — live verified.**
>
> The five approved featured images are **deployed and live-verified**. Deployed commit `736e2e6`. All five page outputs reference the correct new assets, each live image is byte-identical (SHA-256 + MD5 + `cmp`) to the committed file, all required Open Graph / Twitter metadata is present and correct, no old cover is referenced (all five old `assets/img/og/<slug>.png` URLs now return **404 — removed as expected**), and the full live re-crawl of all 318 indexable pages passes with zero defects.
>
> - **Server / cache:** LiteSpeed (Hostinger), no CDN. Image `cache-control: public, max-age=2592000`; HTML `cache-control: public, max-age=300`. No unexpected redirects on any of the 5 pages or 5 images.
> - **Deployment identity:** the five live page HTML bodies are **byte-identical** to the HEAD (`736e2e6`) build. Live image assets `Last-Modified 2026-07-18T09:02Z`; live pages `Last-Modified 2026-07-18T09:04–09:06Z` — after commit `736e2e6` (2026-07-18T08:45Z). `HEAD` is contained in `origin/main` with no divergence.
> - **Previously-pending item now live:** the 291-page `twitter:image:alt` change (commit `9b9de48`) is **now deployed** — the 2026-07-18T09:19Z live crawl found `missing twitter:image:alt = 0/318`.
>
> | # | Page | Page HTTP | og:image = twitter:image (new) | Image HTTP | Dims | SHA-256 match | Byte-identical | Old ref absent | Old URL |
> |---|---|---|---|---|---|---|---|---|---|
> | 1 | /products/fido2-nano-sim-applet/ | 200 | ambisecure-products-fido2-nano-sim-applet-1200x630.png | 200 | 1200×630 | ✅ | ✅ | ✅ | 404 |
> | 2 | /products/iot-security-applets/ | 200 | ambisecure-products-iot-security-applets-1200x630.png | 200 | 1200×630 | ✅ | ✅ | ✅ | 404 |
> | 3 | /products/pkcs-signature-suite/ | 200 | ambisecure-products-pkcs-signature-suite-1200x630.png | 200 | 1200×630 | ✅ | ✅ | ✅ | 404 |
> | 4 | /products/secure-mail-suite/ | 200 | ambisecure-products-secure-mail-suite-1200x630.png | 200 | 1200×630 | ✅ | ✅ | ✅ | 404 |
> | 5 | /services/epassport-platform/ | 200 | ambisecure-services-epassport-platform-1200x630.png | 200 | 1200×630 | ✅ | ✅ | ✅ | 404 |
>
> **Live SHA-256 (= committed):**
> - fido2-nano-sim-applet: `a29ca03e240c4be4ef0ef06db4e0446d9adb5f1b6a4112c767282d5633a25a5c` (92841 B, MD5 `25dc076043ab19f55a11380f4e7526d6`)
> - iot-security-applets: `ee6b9f7057a87743c1da30f6dc974f0d524675afdfe18c564c0d24c9cf77fb34` (96691 B, MD5 `4f993f8577f21b9297cf7c80fa5e542a`)
> - pkcs-signature-suite: `dd7576e5885eb0c39a5c867092dbd7e83b5e0063cd8e36ad7ac5071336ab5150` (97258 B, MD5 `ee1ccbeedd01628c4ed16de02116984f`)
> - secure-mail-suite: `ed1d2de947c475e86fb3fd8d4f4fe2cf6c5707a3354beafac530326780d50e69` (96525 B, MD5 `5a52ebd7ce22c99f06957a80386a58db`)
> - epassport-platform: `a6e99064e09bd462da5af0e271b98b9cf6a7be4dd3b46e86e69daf873152cd4d` (90049 B, MD5 `9e01b1eb8c4e1a3f84556a7169cdc0b7`)
>
> **Full live re-crawl — 318 indexable pages (fresh, no-cache):** pages 200 = 318/318 · unexpected redirects = 0 · og:image 200 = 318/318 · missing images = 0 · broken images = 0 · content-length mismatch vs build = 0 · og≠twitter = 0 · missing og:image:alt = 0 · missing twitter:image:alt = 0 · duplicate og/twitter = 0 · wrong dimensions = 0 · non-production/non-HTTPS image = 0 · missing canonical = 0 · staging/localhost asset refs = 0.
>
> **High-risk content (live):** no own-brand FIDO certification claimed; FIDO L1 scoped to *customer-branded implementation* ("AmbiSecure does not hold a directly listed FIDO certification under its own brand"); EAL5+/EAL6+ scoped to secure-element/chip/silicon only; no product-level Common Criteria implied; no "FIDO Certified Level 1 — Targeted / in evaluation pipeline"; no "phishing-proof" (only "phishing-resistant"); 55/55 count claims match; 0 contradictions.
>
> **Local reruns:** `bash tools/build-hostinger-package.sh` → exit 0 · `bash tools/audit-all.sh` → ALL AUDITS PASSED (exit 0), 318 unique images · `git diff --check` → clean.
>
> **Historical sequence preserved:** (1) old off-brand image identified → (2) new design completed → (3) integrated locally → (4) deployed → (5) **live verified (this section)**. The prior local-only integration record below is retained unchanged.

---

> **UPDATE 2026-07-18 (5-image integration — local-only, superseded by the live verification above).** The 5 new images and page edits are **integrated locally and validated in the built output only**. They are **not pushed and not deployed**. State distinction:
>
> | Item | Live (deployed) | Local (working tree) | Status |
> |---|---|---|---|
> | 5 new featured images + page metadata | old dark-template images still live | new approved art wired in, built, verified | **Fixed locally — deployment required** |
> | 5 old dark-template images | still live | deleted from repo | Removed locally — deployment required |
> | 291-page `twitter:image:alt` (commit `9b9de48`) | still absent on non-original-27 pages | present | Still local-only — deployment required |
>
> No live re-crawl of the 5 pages was performed for the new images because they are not deployed; claiming live correctness would be inaccurate. Post-deployment, re-crawl the 5 URLs, confirm each image returns HTTP 200, compare live bytes to the committed source, and confirm the old `assets/img/og/*.png` images 404/are absent. The earlier live crawl below (deployed state) remains valid for the other 313 pages.

---


- **Crawl timestamp (UTC):** 2026-07-18T07:13Z – 07:31Z
- **Audited commit (working tree):** `c739bbf` + uncommitted audit corrections
- **Deployed version identifier:** live `/` `Last-Modified: Fri, 17 Jul 2026 10:10:32 GMT`, `ETag: "8584-6a59ff98-…"`, `server: LiteSpeed`, `platform: hostinger`. The deployed tree predates this audit's local corrections.
- **Method:** `curl` HEAD on every indexable page and every unique `og:image`; full GET + md5 on a 44-image sample; results in `scratchpad/live_results.json`. Network checks are kept **separate** from the deterministic local audits (they are not part of `tools/audit-all.sh`).

## Live HTTP checks

| Check | Result |
|---|---|
| Indexable pages HEAD | **318 / 318 return HTTP 200**, 0 unexpected redirects |
| `og:image` HEAD | **318 / 318 return HTTP 200** |
| Image `content-type` | `image/png` for all |
| Image `content-length` vs local build file size | **318 / 318 match** (0 mismatches) |
| md5 sample (27 approved + 7 old-style + 10 generated = 44) | **0 / 44 mismatches** — live bytes byte-identical to local build |

**Conclusion — deployment integrity:** what is live is byte-identical to the local build for images. The earlier CI/deploy question (missing Pillow) did not corrupt or omit any image; all 318 featured images are correctly deployed and reachable. The 27 approved images are confirmed identical across **package → source → build → live**.

## Representative page checks

- `/` (home) — 200; `og:image` = `…/featured/ambisecure-home-1200x630.png` (approved #01); alt matches delivery sheet.
- `/about/` — 200; **has** `twitter:image:alt` live (was among the original 27).
- `/products/onepass-card/` — 200; approved #03, byte-identical.
- `/about/certifications/` — 200; certification wording as audited (customer-branded FIDO L1; silicon-scoped EAL).

## Live vs local — status of the corrections

| Item | Live (deployed) | Local (this working tree) | Status |
|---|---|---|---|
| 318 featured images (bytes, dimensions, 200) | ✅ correct | ✅ correct | **Already correct on live** |
| `twitter:image:alt` on the original 27 pages | ✅ present | ✅ present | Already correct on live |
| `twitter:image:alt` on the other 291 pages | ❌ absent (verified live on `/resources/tools/imsi-decoder/`) | ✅ present | **Fixed locally — deployment required** |
| `tools/audit-og-images.py` hardening | n/a (build-time only) | ✅ applied | Not deployed (dev tooling) |
| 7 off-brand images | live & off-brand | unchanged (need new design) | **Live defect — awaiting Claude Design** |

## Caching / CDN limitations

- Hostinger/LiteSpeed sends `Cache-Control: public, max-age=300` (5-minute TTL). No CDN in front. After a deploy, live HTML self-expires within ~5 minutes; live re-verification of the `twitter:image:alt` change should be done ≥5 minutes post-deploy.
- No cache busting was needed for this read-only crawl; values above reflect the currently-deployed tree.

## What was NOT reported as fixed-on-live

The `twitter:image:alt` change is reported as **local only**, not live. No local change was represented as deployed. The 7 off-brand images remain a **live defect** pending new artwork.
