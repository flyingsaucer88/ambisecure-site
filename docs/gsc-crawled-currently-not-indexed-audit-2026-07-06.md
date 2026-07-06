# GSC "Crawled – currently not indexed" — remediation audit

> **Addendum — 2026-07-06 (verification pass, claude-seo tool).** A re-audit before deploy
> found that three redirect-alias bugs in `.htaccess` were **shadowing real, indexable,
> in-sitemap pages** (mod_alias `Redirect` is prefix-based, so an alias for a slug that now
> has its own `index.html` 301s the real page away). Fixed by removing the stale aliases:
>
> | URL | Was (live/committed) | `.htaccess` alias removed | Now |
> |---|---|---|---|
> | `/faqs/` | 301 → `/support/` (yet in sitemap, self-canonical, nav-linked, 2374w) | `Redirect 301 /faqs /support/` | 200 real page |
> | `/resources/tools/scp03-helper/` | committed alias would 301 → `cmac-length` on deploy | `…/scp03-helper …/cmac-length/` | 200 real page |
> | `/resources/tools/iccid-decoder/` | live 301 → `/resources/` (yet in sitemap, 1284w) | `…/iccid-decoder /resources/` | 200 real page |
> | `/resources/tools/euicc-eid-decoder/` | committed alias would 301 → `/resources/` on deploy | `…/euicc-eid-decoder /resources/` | 200 real page |
>
> Root cause: these were "referenced but not yet built" placeholder aliases from Phase 6;
> the tools were later built but the aliases were never removed. The intentional `noindex`
> "page moved" stub `/products/iot-security-chipset/` is correctly left in place (it is not in
> the sitemap). Bare `/faqs` now normalises to `/faqs/` via DirectorySlash like every other
> directory. All audits still pass; sitemap drift = 0 (319/319). This corrects the previous
> pass, which added `/faqs/` to the sitemap without noticing the live redirect that shadowed it.

- **Property:** `https://ambisecure.ambimat.com/`
- **GSC issue:** Page indexing → *Crawled – currently not indexed*
- **Export:** `docs/ambisecure.ambimat.com-Coverage-Validation-2026-07-06.zip` (Table.csv, 71 URLs)
- **Prior validation:** Failed (4 URLs failed, 67 pending)
- **Date:** 2026-07-06
- **Stack:** static HTML site, no build step; `.htaccess` (LiteSpeed) handles redirects/410; Hostinger deploy via `tools/`.

## Executive summary

The site was already **technically correct** before this pass — every canonical page returns 200,
the duplicate Java Card URL already 301s to canonical, legacy `.htm` junk already returns 410, http→https
already 301s, and the sitemap already excludes all junk. The "Crawled – currently not indexed" state is
therefore **overwhelmingly an authority / crawl-budget / patience signal**, not a technical defect.

Of the 71 affected URLs:

| Bucket | Count | Correct end state | Action |
|---|---:|---|---|
| Legacy `.htm` / spam `.html` cruft | 57 | 410 Gone, not in sitemap, not linked | None — correct that they are unindexed. 410 tells Google to drop them. |
| 301 redirects (`/services/java-card-development/`, `/cyber-security-threats/`) | 2 | 301 → canonical | None — already correct; will reclassify out of this bucket. |
| Healthy 200 canonical pages | 12 | Indexable, in sitemap | Strengthen internal links + content depth + freshness. |

The genuine, fixable weaknesses were: (a) `/references/desfire-commands/` was thin (267 crawlable words)
and weakly linked (3 inbound); (b) the homepage did not link into `/references/` at all; (c) `/faqs/`
(2374 words, indexable) was missing from the sitemap. All three are fixed in this pass.

## The 4 failed URLs

| URL | Live status | Canonical | Root cause | Fix applied |
|---|---|---|---|---|
| `https://ambisecure.ambimat.com/` | 200 | self ✓ | Healthy (932 main-words, 319 inbound). Authority/crawl-budget delay. | Added `/references/` link to footer Develop column (was the only major section unlinked from home). |
| `/references/desfire-commands/` | 200 | self ✓ | **Thin** (267 words; table is JS-rendered from inline `AS_REF`) + **weakly linked** (3 inbound). | Added a real "Command classes" prose section (267→522 words). Added 4 reciprocal inbound links (3 DESFire tools + DESFire blog). |
| `/services/javacard-development/` | 200 | self ✓ | Healthy (483 words, 26 inbound). Authority/crawl-budget delay. | None needed — already well-linked. Freshness bump via lastmod. |
| `/services/java-card-development/` | **301** → `/services/javacard-development/` | n/a (redirect) | **Not a page** — this is the hyphenated duplicate variant. It already 301s to the established canonical. It will *never* be "indexed" as itself; GSC should reclassify it as *Page with redirect*. | None — the required fix (301 + canonical + sitemap has only the canonical) was already in place. See "Java Card canonical decision" below. |

## Java Card canonical decision (task 4)

GSC lists both `/services/javacard-development/` and `/services/java-card-development/`.

**Chosen canonical: `/services/javacard-development/` (no hyphen).** This is the repo's long-established
convention — used by the on-disk page, the sitemap, all 44 internal links, and multiple `.htaccess`
redirects. The hyphenated variant already 301s to it (`.htaccess:124`), the canonical page self-references
correctly, and only the no-hyphen URL is in the sitemap.

The brief suggested the hyphenated form "is likely" preferred, but flipping canonical would mean rewriting
44 internal links + several redirects + the sitemap and inverting a live 301 — a large, risky migration
against an already-correct setup, with no SEO upside (the string "javacard" vs "java-card" is not a ranking
factor here). **Decision: keep `javacard-development` canonical; leave the existing 301 as-is.** Verified
live: `/services/java-card-development/` → `301` → `/services/javacard-development/` (clean, no double-slash).

## Live technical verification (pre-fix baseline, Googlebot UA)

| URL | HTTP | Notes |
|---|---|---|
| `/` | 200 | canonical self, robots index,follow |
| `/references/desfire-commands/` | 200 | canonical self |
| `/services/javacard-development/` | 200 | canonical self |
| `/services/java-card-development/` | 301 → `/services/javacard-development/` | clean redirect |
| `/sitemap.xml` | 200 | application/xml |
| `/robots.txt` | 200 | references sitemap; disallows only `/_internal/`, WP probes, `?query` |
| `http://…/solutions/` | 301 → https | http→https enforced |
| `/153225028.htm` (legacy) | 410 | `.htaccess` `^[0-9]{6,10}\.htm$` |
| `/fhclr/w2919333.html` (spam) | 410 | `.htaccess` `^[a-z]{5}/[a-z][0-9]{6,8}\.html$` |

No `noindex`, no blocking `X-Robots-Tag`, no robots.txt blocks on real pages. No `http://` or `.htm` URLs in the sitemap.

## The 67 pending URLs (from Table.csv)

- **57** are legacy numeric `.htm` (e.g. `153225028.htm`) or spam-shaped `xxxxx/yNNNNNN.html` paths from a
  prior tenant of this subdomain. All return **410 Gone**, are **not in the sitemap**, and are **not linked**.
  "Crawled – currently not indexed" is the *desired* state for these; 410 is the strongest drop signal.
  **Leave alone / monitor** — they will age out of the report.
- **10** are healthy 200 pages (`/about/`, `/about/certifications/`, `/products/`, `/products/*`,
  `/solutions/`, `/blog/secure-iot-identity-with-applets/`) — all in sitemap, single H1, correct canonical.
  Same authority/crawl-budget delay as the failed set.
- `http://…/solutions/` — the http variant; 301s to https. Correct.
- `/cyber-security-threats/` — 301s to `/blog/cyber-security-threats-overview/`. Correct.

## Fixes applied this pass

1. **`/references/desfire-commands/`** — added a "Command classes" prose section (Security & auth, PICC &
   application mgmt, File mgmt, Data manipulation, ISO 7816-4 wrapped) with a practical "when you'd use this"
   paragraph. Crawlable word count 267 → 522. Real, accurate, unique technical content — no filler.
2. **Reciprocal internal links to desfire-commands** (was 3 inbound) added from:
   `resources/tools/desfire-status/`, `resources/tools/desfire-file-settings/`,
   `resources/tools/desfire-access-rights/`, and `blog/desfire-ev1-vs-ev2-vs-ev3/` (inline + related-reading).
3. **Homepage → `/references/`** — added "Reference library" to the footer Develop column (references hub
   previously had zero links from the homepage).
4. **Sitemap** — added `/faqs/` (2374 words, indexable, was missing). Confirmed the noindex/redirect stub
   `/products/iot-security-chipset/` is correctly excluded.
5. **`tools/regen-sitemap.py`** — hardened to skip `<meta robots noindex>` pages so future regenerations can
   never re-introduce redirect stubs into the sitemap.
6. **`assets/data/search-index.json`** — rebuilt after content changes (audit gate requirement).
7. **`sitemap.xml` `<lastmod>`** — refreshed for changed pages via `scripts/update-sitemap-lastmod.py`
   (git-commit-date derived) to give Google a fresh recrawl signal.

## Audit results

`bash tools/audit-all.sh` → **ALL AUDITS PASSED** (xmllint, lint-htaccess, audit-content, audit-seo,
audit-media, audit-freshness --strict, audit-yoast --strict, audit-circular, audit-spam-seo, audit-search).
`python3 tools/regen-sitemap.py` → **no drift** (319 pages on disk = 319 URLs in sitemap).

## GSC next steps (after live deploy is verified)

1. **Do NOT click "Start New Validation" yet** — only after the live site serves the new content (see live
   verification section in the run report).
2. Resubmit `https://ambisecure.ambimat.com/sitemap.xml` in GSC → Sitemaps (forces a fresh read; harmless).
3. URL-Inspect + "Request indexing" for the 3 real canonical URLs:
   `/`, `/references/desfire-commands/`, `/services/javacard-development/`
   (NOT `/services/java-card-development/` — it 301s; requesting indexing on a redirect is pointless).
4. Then click **Start New Validation** on the "Crawled – currently not indexed" issue. It will pass for the
   410 legacy URLs (correctly gone) and for the redirect; the 200 pages depend on re-crawl + authority.
5. Leave the legacy `.htm`/spam URLs alone — they are correctly 410 and will drop out over time.
