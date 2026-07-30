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
