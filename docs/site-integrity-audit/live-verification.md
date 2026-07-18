# Live Verification

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
