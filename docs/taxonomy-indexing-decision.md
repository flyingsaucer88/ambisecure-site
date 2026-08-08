# Taxonomy indexing decision — categories indexed, tag archives noindexed

**Date:** 2026-07-30
**Status:** Applied
**Scope:** `/tags/*`, `/blog/categories/*`, `sitemap.xml`, `tools/gen-tag-pages.py`

## Decision

Blog **categories are the indexed taxonomy. Individual tag archives are not.**

- `/blog/categories/` and each `/blog/categories/<slug>/` — **indexed**, in the sitemap, unchanged.
- `/tags/` (the hub) — **indexed**, kept in the sitemap, and given a substantive intro
  explaining how the two taxonomies differ and when to use each.
- All 29 `/tags/<slug>/` archives — **`<meta name="robots" content="noindex,follow">`**
  and removed from `sitemap.xml`.

Sitemap went from 314 to 285 URLs. No page was deleted and no URL was redirected;
every tag archive still resolves, still renders, and is still linked from `/tags/`.

## Why

The site ran two parallel taxonomies over the same ~40 blog posts: 19 categories and
29 tags. Both render the same posts as the same card list. That is the actual cause of
the thin-listing problem, not the tag pages individually being badly written.

Categories are the better taxonomy to keep indexed:

- They are the primary filing structure — one post, one category — so a category page
  is a coherent reading list rather than an arbitrary intersection.
- They are already the more developed set (enriched in `c4c263a8`), and they co-list
  modern and archive posts, which tag pages do not.
- They are what the blog's own navigation and footer point at.

Tag archives are 3–10 links plus a two-line dek. They have no realistic ranking power
of their own, they compete with the category page covering the same posts, and 29 of
them were dragging the site-wide AI-readiness average down while contributing nothing
that the category pages and site search do not already cover.

`noindex,**follow**` is deliberate: crawlers still traverse tag pages and pass equity
through to the posts. The pages remain fully useful as human navigation — this removes
them from the index, not from the site.

## Why not the alternative

Writing a unique intro for each of 29 tag archives would have produced 29 more pages
whose main content is still a link list already published elsewhere. That raises each
page's score without fixing the duplication between the two taxonomies. Given a choice
between making the thin pages slightly less thin and removing a redundant index
surface, the second is the better trade for a site this size.

## Consequences

- **12 under-linked findings resolve automatically** — `/tags/{aaguid,attestation,
  biometrics,cyber-security,desfire,enterprise,epassport,fido,government-identity,
  javacard,mfa,passkeys}/` are no longer indexable, so inbound-link count no longer
  applies to them.

### How this shows up in the AI-readiness average — read this before quoting a number

The tracker is **sitemap-driven**: the pages it crawls are the pages listed in
`sitemap.xml`, so its denominator is the sitemap URL count. Removing the 29 tag
archives from the sitemap therefore makes them **invisible to the metric** rather
than scoring them as noindexed.

Those 29 pages were scoring about 20 each. Taking them out of the denominator alone
moves the average without any page improving:

```
314 pages @ 41.3 average
  − 29 pages @ ~20            (tag archives leave the sitemap)
= 285 pages @ ~43.5 average   →  +2.2 of "lift" that is purely arithmetic
```

Both effects are legitimate — removing redundant thin pages from the index is the
point of the decision, and a metric that no longer counts them is reporting the site
we actually publish. But roughly **+2.2 of any average improvement measured after
this change is denominator movement, not quality**. Do not attribute the whole gain
to content work in a report or a client update; state the two separately.
- **Expect a one-off drop in indexed page count** in Search Console as the 29 archives
  age out. This is intended; it is not a deindexing incident.
- **Do not re-add tag URLs to the sitemap.** `tools/regen-sitemap.py` already skips any
  page carrying a `noindex` robots meta, so a plain regen keeps this correct.
- **`tools/gen-tag-pages.py` emits the robots meta itself**, so regenerating the eight
  config-driven tag pages preserves the decision.

## Reversing it

Delete the `<meta name="robots" content="noindex,follow" />` line from the tag pages
and from the template in `tools/gen-tag-pages.py`, then run
`python3 tools/regen-sitemap.py --apply`. The URLs return to the sitemap on the next
crawl. Nothing else needs to change.

## Note on `tools/gen-tag-pages.py`

While applying this, the generator was found to be **stale against the pages on disk** —
running it reverted the asset cache-bust version (v32 → v31), per-tag featured OG images,
the `Services` nav item added in `b0dfb20e`, the `Tagged articles` heading, and two
footer/nav details. It has been resynced so that regenerating now reproduces the on-disk
pages exactly, plus the intended robots meta. Verify with:

```
python3 tools/gen-tag-pages.py && git diff --stat -- tags/
```

which should report no changes on a clean tree.

---

# Re-confirmation — 2026-08-08 GSC "Excluded by 'noindex' tag" (27 URLs)

Google reported 27 of these 29 tag archives as **Excluded by 'noindex' tag**, all
crawled 2026-08-02. **That report is this decision working as designed, not a defect.**
The two archives not yet listed (`/tags/device-identity/`, `/tags/javacard/`) carry the
same robots meta and will appear in a later export.

Re-audited before confirming. Policy 1 (keep tag archives noindex) is retained because:

- **No tag page has any unique prose.** All 29 are a heading plus a card list; the
  "word counts" below are almost entirely shared nav/footer chrome.
- **Three clusters have byte-identical post sets** — `aaguid` ≡ `attestation`, and
  `cra` ≡ `cyber-resilience-act` ≡ `device-identity`. Indexing those would put
  literally interchangeable pages into the index.
- **15 of 29 tags duplicate a same-topic `/blog/categories/<slug>/` page** that is
  already indexed, already enriched, and already the target of site navigation.
- **13 of 27 list fewer than four posts**; the smallest list two.

No tag qualifies for Policy 2. Making any of them indexable would add archive bloat
competing with the category page covering the same posts.

## Verified consistency

| Check | Result |
|---|---|
| All 27 reported pages carry `noindex,follow` | 27/27 |
| Any tag archive present in `sitemap.xml` | 0 |
| `/tags/` hub — indexable, in sitemap, own intro copy | yes (the one `/tags/*` entry) |
| Tag archives blocked in `robots.txt` | no — deliberately crawlable so `follow` passes equity |
| Self-referencing canonical on every tag archive | 29/29 |
| Live HTTP status of all 27 | 200 |

## Per-tag record

| Tag | Articles | Unique content | Search value | Sitemap? | Current robots | Recommendation |
|---|---:|---|---|---|---|---|
| `/tags/cyber-security/` | 9 | List only, no intro prose (365w incl. chrome) | Duplicated by indexable `/blog/categories/cybersecurity/` | No | `noindex,follow` | Keep noindex |
| `/tags/mfa/` | 9 | List only, no intro prose (338w incl. chrome) | Duplicated by indexable `/blog/categories/mfa/` | No | `noindex,follow` | Keep noindex |
| `/tags/fido/` | 8 | List only, no intro prose (274w incl. chrome) | Duplicated by indexable `/blog/categories/fido/` | No | `noindex,follow` | Keep noindex |
| `/tags/transit/` | 8 | List only, no intro prose (292w incl. chrome) | Duplicated by indexable `/blog/categories/transit/` | No | `noindex,follow` | Keep noindex |
| `/tags/secure-element/` | 7 | List only, no intro prose (320w incl. chrome) | Narrow facet, 7 posts | No | `noindex,follow` | Keep noindex |
| `/tags/smart-cards/` | 6 | List only, no intro prose (254w incl. chrome) | Duplicated by indexable `/blog/categories/smart-cards/` | No | `noindex,follow` | Keep noindex |
| `/tags/cra/` | 5 | List only, no intro prose (234w incl. chrome) | Identical post set to `/tags/cyber-resilience-act/` | No | `noindex,follow` | Keep noindex *(consolidation candidate)* |
| `/tags/cyber-resilience-act/` | 5 | List only, no intro prose (241w incl. chrome) | Identical post set to `/tags/cra/` | No | `noindex,follow` | Keep noindex *(consolidation candidate)* |
| `/tags/passwordless/` | 5 | List only, no intro prose (179w incl. chrome) | Duplicated by indexable `/blog/categories/passwordless/` | No | `noindex,follow` | Keep noindex |
| `/tags/embedded-security/` | 4 | List only, no intro prose (191w incl. chrome) | Narrow facet, 4 posts | No | `noindex,follow` | Keep noindex |
| `/tags/enterprise/` | 4 | List only, no intro prose (153w incl. chrome) | Narrow facet, 4 posts | No | `noindex,follow` | Keep noindex |
| `/tags/government-identity/` | 4 | List only, no intro prose (162w incl. chrome) | Narrow facet, 4 posts | No | `noindex,follow` | Keep noindex |
| `/tags/aaguid/` | 3 | List only, no intro prose (98w incl. chrome) | Identical post set to `/tags/attestation/` | No | `noindex,follow` | Keep noindex *(consolidation candidate)* |
| `/tags/ambisec/` | 3 | List only, no intro prose (139w incl. chrome) | Thin — 3 posts | No | `noindex,follow` | Keep noindex |
| `/tags/attestation/` | 3 | List only, no intro prose (98w incl. chrome) | Identical post set to `/tags/aaguid/` | No | `noindex,follow` | Keep noindex *(consolidation candidate)* |
| `/tags/biometrics/` | 3 | List only, no intro prose (120w incl. chrome) | Duplicated by indexable `/blog/categories/biometrics/` | No | `noindex,follow` | Keep noindex |
| `/tags/desfire/` | 3 | List only, no intro prose (97w incl. chrome) | Duplicated by indexable `/blog/categories/desfire/` | No | `noindex,follow` | Keep noindex |
| `/tags/epassport/` | 3 | List only, no intro prose (115w incl. chrome) | Duplicated by indexable `/blog/categories/epassport/` | No | `noindex,follow` | Keep noindex |
| `/tags/hardware/` | 3 | List only, no intro prose (95w incl. chrome) | Thin — 3 posts | No | `noindex,follow` | Keep noindex |
| `/tags/iot-security/` | 3 | List only, no intro prose (142w incl. chrome) | Duplicated by indexable `/blog/categories/iot-security/` | No | `noindex,follow` | Keep noindex |
| `/tags/recovery/` | 3 | List only, no intro prose (95w incl. chrome) | Thin — 3 posts | No | `noindex,follow` | Keep noindex |
| `/tags/sam/` | 3 | List only, no intro prose (96w incl. chrome) | Thin — 3 posts | No | `noindex,follow` | Keep noindex |
| `/tags/secure-by-design/` | 3 | List only, no intro prose (141w incl. chrome) | Thin — 3 posts | No | `noindex,follow` | Keep noindex |
| `/tags/webauthn/` | 3 | List only, no intro prose (88w incl. chrome) | Duplicated by indexable `/blog/categories/webauthn/` | No | `noindex,follow` | Keep noindex |
| `/tags/passkeys/` | 2 | List only, no intro prose (60w incl. chrome) | Thin — 2 posts | No | `noindex,follow` | Keep noindex |
| `/tags/pki/` | 2 | List only, no intro prose (58w incl. chrome) | Thin — 2 posts | No | `noindex,follow` | Keep noindex |
| `/tags/privacy/` | 2 | List only, no intro prose (69w incl. chrome) | Duplicated by indexable `/blog/categories/privacy/` | No | `noindex,follow` | Keep noindex |

**Consolidation candidates** are recorded, not actioned. All five are already `noindex`,
so they cost nothing in the index; merging them means editing the tag vocabulary in
`assets/data/blogs.json` and regenerating, which is a content-taxonomy change with no
GSC issue behind it. Fold it into the next content pass.

## GSC handling

Do **not** click *Validate Fix* on this issue. There is nothing to fix; validation would
fail and the report would return. Expect these 27 to remain listed indefinitely — that is
the correct steady state for an intentionally noindexed archive.
