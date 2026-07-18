# AmbiSecure — Site-Integrity Audit — Executive Summary

> **✅ UPDATE 2026-07-18T09:19Z — DEPLOYED AND LIVE-VERIFIED. Verdict: Pass — live verified.** The 5 pages previously flagged as off-brand have been migrated to approved Claude Design featured art (second package `docs/Shared design link.zip → ambisecure-featured-images-new/final/`), pushed (deployed commit `736e2e6`), and confirmed on production:
> - **Approved Claude Design images: 32** (27 original + 5 new), all byte-identical to their packages and correctly mapped.
> - **Off-brand content pages: 0** (was 5). Old dark-template images deleted from `assets/img/og/`; all five old `assets/img/og/<slug>.png` URLs now return **404** on live.
> - **Utility/pagination exceptions still documented: 2** (`/blog/page/2/`, `/search/`).
> - 318/318 valid featured images; 0 missing; 0 broken; 0 incorrect mappings; 0 shared; all audits pass; built output independently verified; audit negative-tested.
> - **Live verified:** fresh no-cache re-crawl of all 318 indexable pages — 318/318 pages HTTP 200, 318/318 og:image 200, 0 redirects, 0 metadata failures, 0 dimension failures, 0 missing `og:image:alt`/`twitter:image:alt`. The five new live images are byte-identical (SHA-256 + MD5 + `cmp`) to the committed files. The 291-page `twitter:image:alt` fix (commit `9b9de48`) is **now live** (0/318 missing). See [live-verification.md](live-verification.md) for full hashes and per-page evidence.
> - **Verdict: Pass — live verified.** (Prior local-only note about the FIDO2 "WebAuthn verified" checkmark spacing remains design-cleared, non-blocking.) The original audit narrative below is retained for history.

---


- **Live site:** https://ambisecure.ambimat.com/
- **Crawl (UTC):** 2026-07-18T07:30Z (live HTTP/image checks); local build re-crawled from `dist/ambisecure-hostinger/`
- **Audited commit:** `c739bbf` (working tree with corrections applied on top)
- **Approved reference set:** `docs/AmbiSecure LinkedIn image brief.zip` — 27 Claude Design featured images, delivery sheet mapping each to one page
- **Reference format (confirmed from the package, not assumed):** 1200×630 PNG

## Verdict

**Pass with minor issues.** Every eligible page has a valid, correctly-sized, live-reachable featured image; the 27 approved images are all present, byte-identical, and mapped to the correct pages; no internal contradictions were found on the high-risk topics (certifications, EAL/Common Criteria, counts, company info). Two things keep it from a clean pass: **7 pages still carry an older off-brand OG image** (5 real content pages need new Claude Design work; images cannot be fabricated), and a **consistency fix (twitter:image:alt on 291 pages) is applied locally but not yet deployed.**

## Coverage numbers

| Metric | Count |
|---|---|
| Indexable pages audited | **318** |
| Non-indexable excluded (documented) | 1 (`/products/iot-security-chipset/` — noindex redirect stub → `/products/iot-security-coprocessor/`) |
| Pages with a valid featured image | **318 / 318** |
| Pages missing `og:image` | 0 |
| Pages missing `twitter:image` | 0 |
| Broken image URLs (live, non-200) | **0 / 318** |
| Image dimension failures (featured set ≠ 1200×630) | 0 |
| Pages sharing an image unintentionally | 0 (318 unique images) |
| Technically invalid / corrupt images | 0 |

## Brand consistency vs the 27 approved images

| Classification | Count |
|---|---|
| **Approved reference image** (byte-identical to package, correctly mapped) | **27** |
| **Brand-consistent** generated featured art (same design system) | **284** |
| **Inconsistent — old dark template** (needs replacement) | **7** |
| — of which real content pages needing new Claude Design work | **5** |
| — of which utility/pagination pages (`/blog/page/2/`, `/search/`) | 2 |
| Pages needing new Claude Design work | **5** (see `claude-design-handoff.md`) |

All 27 approved images verified byte-identical across **package → repo source → build → live** (md5). Mapping to pages is 27/27 correct against the delivery sheet.

## Content integrity

| Metric | Count |
|---|---|
| Contradictions found | **0 material** |
| Contradictions fixed | 0 (none required) |
| Contradictions requiring human review | **0** |
| Highest-risk topics checked & found consistent | Certifications (FIDO L1 customer-branded), Common Criteria / EAL5+/EAL6+ (silicon-scoped, product-level explicitly disclaimed), reference count (18=18=18), tag counts (23 pages, 0 drift), company info (© 2026 Ambimat Electronics; est. 1982; AmbiSecure since 2017), phishing-resistant (no "phishing-proof"), banned FIDO "Targeted/in evaluation pipeline" string (absent) |

The known historical issues named in the brief were re-verified on the current build and are **already resolved** (references 17→18, phishing-proof→phishing-resistant, certification wording aligned by commit `9050bda`/`c282273`).

## Local changes made

1. **`twitter:image:alt` added to 291 pages** — mirrors the already-approved `og:image:alt` verbatim (no new claim). Closes an og/twitter alt-consistency gap; improves shared-card accessibility.
2. **`tools/audit-og-images.py` hardened** — added a `twitter:image:alt` consistency check and an off-brand `og:image` guard (with a documented allowlist for the 7 known exceptions), so both classes of defect are caught on every future build. Negative-tested: both checks fire.

## Live issues remaining / deployment

- **Deployment required: YES** — the 291-page `twitter:image:alt` fix is in the working tree only; live pages that were not among the original 27 still lack it. Images themselves are already correct live (byte-identical), so no image redeploy is needed for correctness — only the HTML metadata update.
- **5 content pages** need new brand-consistent featured art before they match the approved system. These are handed off, not fabricated.

See the companion reports in this folder for full evidence.
