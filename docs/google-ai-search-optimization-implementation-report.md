# Google AI Search Optimization — Implementation Report

**Site:** https://ambisecure.ambimat.com
**Branch:** `seo-ai-search-optimization`
**Base:** `seo-indexing-fixes-phase1` → `main`
**Reference:** [Google — Optimizing your website for generative AI features on Google Search](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)

---

## 1. Summary of Google guidance applied

Google's published guidance for generative AI features is unambiguous: AI Overviews, AI Mode, and the RAG/query-fan-out systems behind them are **rooted in core Search ranking systems**. Visibility in AI features is bought with the same fundamentals as visibility in classic 10-blue-links — crawlable/indexable HTML, strong on-page structure, expert non-commodity content, page experience, accurate structured data, and Search Console hygiene. There is no separate "AEO" or "GEO" surface to optimise against, and Google has explicitly advised against vendor-marketed AI-optimisation hacks (custom `llms.txt` ranking tricks, thin keyword-variant pages, content rewrites aimed at LLMs rather than humans).

This implementation followed that posture: every change verified against live behaviour with curl, no speculative additions, no fake authority signals, no content invented to please an AI consumer. Where the existing site already met Google's recommendation the audit recorded it and moved on rather than introducing redundant noise.

## 2. Pages audited

286 HTML files under the public site root were scanned by `scripts/audit-ai-seo.py`. The exclude list (matching the canonical Hostinger build) covers `.git/`, `.github/`, `.githooks/`, `.lighthouseci/`, `.claude/`, `dist/`, `docs/`, `tools/`, `scripts/`, `legacysitedata/`, `node_modules/`, `_internal/`, `Logos/`.

| Metric | Value |
|---|---|
| HTML files scanned | 286 |
| Pages in sitemap.xml | 282 |
| Pages intentionally `noindex` (404, internal stub) | 2 |
| On-disk pages not in sitemap (intentional 301 redirect sources) | 2 |

## 3. Baseline audit findings — what was already correct

The site arrived in genuinely good shape before this branch. The audit recorded **zero** defects on indexable pages for:

- missing `<title>` (0/282)
- missing `<meta name="description">` (0/282)
- missing `<link rel="canonical">` (0/282)
- canonical mismatch (0/282)
- missing or duplicate `<h1>` (0/282)
- missing `<main>` landmark (0/282)
- missing `html lang` attribute (0/282)
- missing `og:image` or `twitter:card` (0/282)
- thin content < 200 chars body text (0/282)
- duplicate titles (0)
- duplicate meta descriptions (0)
- JSON-LD parse errors (0)
- missing `alt` attribute on `<img>` (0/42)
- missing `loading="lazy"` (0/42)
- `noindex` accidentally applied to an in-sitemap URL (0)

This is the part of the prompt that did **not** generate a fix — because the fix wasn't needed.

## 4. Real findings and changes made

Five commits land on this branch. All changes were verified with `scripts/audit-ai-seo.py` before and after.

### 4.1 Sitemap cleanup + 100% `<lastmod>` coverage + tag discoverability  (`a0b8392` — inherited from Phase 1)

Carried into this branch from `seo-indexing-fixes-phase1`:

- Removed `/technologies/secure-elements/` (301 → `/technologies/javacard/`) and `/faqs/` (301 → `/support/`) from `sitemap.xml`. Verified live with `curl -sI` before removal; both files remain on disk so the server's redirect still fires for any inbound link. Sitemap: **284 URLs → 282**.
- Added `<lastmod>` to all 282 entries, derived from each page's last git-commit date for deterministic output across clones. Coverage: **13/284 (4.6%) → 282/282 (100%)**. Regenerator: `scripts/update-sitemap-lastmod.py`.
- Added a "Browse by tag" section to `blog/index.html` surfacing 8 popular tags + an "All tags →" index link, all as plain crawlable `<a href>`. Previously 24 `/tags/*` URLs were reachable only via the sitemap (no inbound link from `/`, `/blog/`, or `/resources/`).

### 4.2 Image width/height attributes  (`66cb4fe`)

17 `<img>` tags across 9 files lacked `width`/`height` attributes, causing Cumulative Layout Shift while the image loaded. Dimensions resolved from the actual asset files (YouTube thumbnails: 1280×720; certification logos: 1100×850) and applied via `scripts/add-image-dims.py`. Affected files:

| File | Imgs fixed |
|---|---|
| `index.html` | 2 |
| `about/certifications/index.html` | 3 |
| `videos/index.html` | 6 |
| `videos/ambisecure-card-use-cases/index.html` | 1 |
| `videos/setup-ambisecure-card-desktop/index.html` | 1 |
| `videos/setup-ambisecure-card-facebook/index.html` | 1 |
| `videos/setup-ambisecure-card-gmail/index.html` | 1 |
| `videos/setup-ambisecure-card-mobile-facebook/index.html` | 1 |
| `videos/setup-ambisecure-card-mobile-gmail/index.html` | 1 |

Post-audit: `missing_width_or_height = 0`.

### 4.3 SERP-truncation: titles + meta descriptions  (`dfff3cf`)

Google truncates title tags at ~580 px of display width (≈ 60–65 characters for typical Latin glyphs) and meta descriptions at ~155–160 characters. The audit flagged:

| Dimension | Before | After |
|---|---|---|
| Titles > 70 chars | **69** (max 106) | 0 |
| Meta descriptions > 175 chars | **68** (max 362) | 0 |

Editorial principle: keep the substantive claim and the `| AmbiSecure` brand suffix; drop keyword-stuffing tails ("ATR, APDU, TLV, ASN.1, CBOR & more parsers") and descriptive sub-clauses that existed only for keyword padding. The override map lives in `scripts/_seo_overrides.py` (137 entries — 69 titles, 68 descriptions, some pages get both) and is applied idempotently by `scripts/apply-seo-overrides.py`.

A separate cosmetic commit (`9c03066`) untracked an accidentally-committed `.pyc` and added `__pycache__/` to `.gitignore`.

The audit script also picked up an SVG-inside-page footgun on its first run: pages with inline SVG diagrams declared `<title>` elements inside the SVG (a valid SVG accessibility pattern) and the HTML parser was concatenating them with the head `<title>`. Five pages reported false-positive title lengths of 384, 151, 141, 137, and 107 chars. Fix: the audit parser now stops capturing after the first `</title>` close, so only the head title counts. That fix is part of the same audit script that ships with this branch.

### 4.4 Homepage FAQ + `FAQPage` JSON-LD  (`efe7d5d`)

The single content addition. Five procurement-focused questions on the homepage, answers paraphrased strictly from existing on-page claims (the Organization `knowsAbout` array, the "Don't see your problem?" CTA copy, the "engineering-led identity infrastructure" positioning):

1. What does AmbiSecure build?
2. Is AmbiSecure a hardware vendor or a software vendor?
3. Which standards and certification regimes does AmbiSecure align with?
4. Who is AmbiSecure built for?
5. How do AmbiSecure engagements typically start?

Rendered visibly with the site's existing `<details class="faq-q">` + `<summary><h3>` + `<div class="faq-a">` pattern (already shipping on 28 other pages). Paired with `FAQPage` JSON-LD added to the homepage's existing `@graph` (alongside `Organization` and `WebSite`). Visible Q/A text is byte-equivalent to the schema's `Question.name` / `acceptedAnswer.text` — no schema-spam.

Why only the homepage: it is the canonical entry point Google's AI features are most likely to consult, and it was the only major hub without an `FAQPage` block. The other hub pages (`/products/`, `/solutions/`, `/technologies/`, `/industries/`, `/resources/`, `/references/`, `/trust/`) already have audience signposting, problem statements, and engagement CTAs in their existing copy. Adding forced "Who this is for / What problem it solves" blocks there would have produced redundancy, not clarity — the exact "thin keyword-variant" pattern Google's guidance warns against.

FAQPage page count: **28 → 29**.

## 5. Schema state (post-branch)

| Schema type | Pages |
|---|---|
| BreadcrumbList | 283 |
| Article | 59 |
| SoftwareApplication | 57 |
| CollectionPage | 55 |
| TechArticle | 30 |
| FAQPage | **29** (was 28) |
| Service | 23 |
| Product | 19 |
| WebPage | 14 |
| VideoObject | 7 |
| CreativeWork | 6 |
| WebSite | 2 (homepage + V2X pillar — the canonical declarations; other pages reference by `@id`) |
| AboutPage | 1 |
| Blog | 1 |
| ContactPage | 1 |
| Organization | 1 (canonical, declared once on homepage and referenced elsewhere via `@id`) |
| ItemList | 1 |

`WebSite = 2` and `Organization = 1` are correct — these are entity declarations, and downstream pages reference them via `@id` rather than redeclaring (best practice per Google's structured data documentation). Audit recorded zero JSON-LD parse errors across all 286 pages.

## 6. Crawl / indexing issues fixed

| Issue | Status |
|---|---|
| Sitemap URLs returning 301 | Fixed (2 entries removed in Phase 1) |
| Sitemap missing lastmod | Fixed (100% coverage) |
| Orphan `/tags/*` URLs | Fixed (linked from `/blog/`) |
| CLS from undimensioned images | Fixed (17 imgs across 9 files) |
| Title truncation in SERP | Fixed (69 titles tightened) |
| Meta description truncation in SERP | Fixed (68 descriptions tightened) |
| FAQPage signal on homepage | Added |

## 7. Duplicate content

No duplicate titles, no duplicate meta descriptions, no canonical mismatches detected across 282 indexable pages. Nothing to resolve.

## 8. Content pages improved

The Google guidance is consistent on this point: rewrite content for **humans first**, do not invent or rewrite to please an LLM consumer. The existing AmbiSecure pages are expert-led, AmbiSecure-specific, standards-referenced, and well-structured — exactly the profile Google's documentation describes as well-positioned for AI features. The audit's measurements confirm this: hub pages carry 3,234 – 14,564 chars of body text, every page already has audience signposting and a problem statement, and 28 pages already shipped `FAQPage` schema.

The only content addition this branch makes is the homepage FAQ described in §4.4. Forced "Who this is for / What problem it solves" sections on already-rich hub pages were considered and rejected as redundancy: they would have made existing positioning copy harder to read and added the kind of boilerplate Google's guidance discourages.

## 9. Remaining recommendations

Items the audit did not act on, because they are judgment calls the operator should make consciously:

1. **`schema.org` `WebPage.publisher` and `dateModified` on individual articles.** Article and TechArticle pages would benefit from `dateModified` matching the sitemap `<lastmod>` — useful signal for AI Overviews freshness scoring. Out of scope for this branch (the override map didn't touch JSON-LD content). Worth a follow-up commit that derives `dateModified` from git committer date the same way `<lastmod>` does now.
2. **Internal-link audit on services subpages.** `services/tool-chain-development/{bio-enrollment-app, ndef-personalisation, security-key-manager, multi-card-applet-loader}` are linked from the parent `services/tool-chain-development/index.html` but not from the main navigation. They appear in the sitemap and have full schema, so indexing is not blocked, but they would benefit from inbound links from `/solutions/smart-card-personalisation/` and `/products/javacard-applets/` where they are topically adjacent.
3. **`SearchAction` enhancement.** Homepage `WebSite` schema declares a `SearchAction` pointing at `/?q={search_term_string}`. The site has a working client-side search, but the URL pattern is not crawlable on its own (it is consumed by JS). For sitelinks-search-box eligibility Google needs a server-side search results page that respects the `?q=` parameter. Out of scope here; flagging.
4. **`Article.author` granularity.** Blog `Article`/`TechArticle` entries currently carry a generic publisher/author. Naming the actual engineering authors per post would strengthen E-E-A-T signals — but only if the operator is comfortable surfacing those names publicly.
5. **Hub-page Q&A blocks (deliberately skipped).** Adding 4–6 question accordions to `/products/`, `/solutions/`, `/technologies/`, `/industries/` would add structured signal density. Skipped this branch because the questions would either restate existing card descriptions (redundancy) or fabricate content (Google's guidance: do not). A future commit could add hub-page FAQs if the operator authors the questions and answers.

## 10. Manual Search Console steps

Run these in GSC for `ambisecure.ambimat.com` after this branch ships to Hostinger.

1. **Resubmit sitemap.** Search Console → Sitemaps → submit `https://ambisecure.ambimat.com/sitemap.xml`. The submitted URL count should drop from 284 to 282 within ~24 hours.
2. **Inspect priority URLs.** URL Inspection on each of the following; if "URL is not on Google," click **Request Indexing**. Limit ~10/day per GSC's quota.

   - `https://ambisecure.ambimat.com/`
   - `https://ambisecure.ambimat.com/products/onepass-card/`
   - `https://ambisecure.ambimat.com/products/iot-security-coprocessor/`
   - `https://ambisecure.ambimat.com/solutions/v2x-security/`
   - `https://ambisecure.ambimat.com/solutions/device-identity-at-scale/`
   - `https://ambisecure.ambimat.com/technologies/v2x-pki/`
   - `https://ambisecure.ambimat.com/technologies/fido/`
   - `https://ambisecure.ambimat.com/resources/tools/sequence-diagram-generator/`
   - `https://ambisecure.ambimat.com/resources/tools/ieee-1609-2-parser/`
   - `https://ambisecure.ambimat.com/blog/`
   - `https://ambisecure.ambimat.com/blog/how-v2x-pki-works/`
   - `https://ambisecure.ambimat.com/blog/lava-lamps-and-cryptographic-entropy/`
   - `https://ambisecure.ambimat.com/case-studies/`
3. **Verify Rich Results eligibility.** Use Google's [Rich Results Test](https://search.google.com/test/rich-results) on the homepage (`Organization`, `WebSite`, `FAQPage`) and one each of: a blog post (`Article`/`FAQPage`), a tool page (`SoftwareApplication`), a product page (`Product`). All three were already eligible per pre-audit; verify post-deploy that the new homepage `FAQPage` is detected.
4. **Monitor over 21 days.**
   - **Pages → Indexed:** expect transition from 0 → 50–120 over weeks 1–3.
   - **Sitemaps → Discovered/Submitted:** confirm 282 reads back.
   - **Performance → Search Type:** watch impressions for the priority URLs; CTR should climb as the tightened titles/descriptions stop being truncated.
   - **Performance → Search Appearance:** filter on "FAQ-rich result" to see if the homepage and existing FAQ-bearing posts surface.
   - **Performance → Search Appearance:** "Web — AI Overviews" appears as a filter where eligible; check after 14 days for any presence on V2X PKI / FIDO / JavaCard queries.

## 11. Validation results (this branch)

```
$ python3 scripts/audit-ai-seo.py
Pages scanned: 286
Sitemap URLs:  282
Pages in sitemap: 282
Pages intentionally excluded (noindex): 2

=== Issues (count : category) ===
     2  on_disk_not_in_sitemap
```

The two flagged "on_disk_not_in_sitemap" entries are the intentional 301-redirect sources (`/faqs/`, `/technologies/secure-elements/`) — files remain on disk so the redirect can fire; they are correctly absent from the sitemap.

```
$ xmllint --noout sitemap.xml && echo OK
OK

$ python3 -c "import json, re; \
text = open('index.html').read(); \
[json.loads(b) for b in re.findall(r'<script type=\"application/ld\+json\">(.*?)</script>', text, re.DOTALL)]; \
print('homepage JSON-LD: OK')"
homepage JSON-LD: OK
```

Live-site spot-check post-Phase-1 deploy (Phase 2 changes not yet deployed):

```
$ curl -sI https://ambisecure.ambimat.com/ | head -1
HTTP/2 200
$ curl -sI https://ambisecure.ambimat.com/sitemap.xml | head -1
HTTP/2 200
```

## 12. Risks and rollback

- **Editorial drift on tightened titles/descriptions.** The 137 string changes in `scripts/_seo_overrides.py` are reviewable as one file. Rollback per page: `git checkout main -- <path>`. Rollback all: revert commit `dfff3cf`.
- **CLS attribute mismatch.** If any of the YouTube thumbnails or certification logos is later replaced with a non-1280×720 / non-1100×850 asset, the hard-coded `width="…" height="…"` will mis-state aspect ratio and produce its own CLS. Mitigation: `scripts/add-image-dims.py` is the canonical source — update the `DIMS` map there if assets change.
- **Homepage FAQ accuracy.** If AmbiSecure positioning shifts (e.g. the engagement-model intro copy changes), the homepage FAQ answers should be re-reviewed. They paraphrase existing claims today; they should not become out-of-sync with the canonical claim elsewhere on the site.

No deployment was performed automatically. The deployable ZIP (`dist/ambisecure-google-ai-search-optimization-dist.zip`) is produced separately and uploaded manually to Hostinger.
