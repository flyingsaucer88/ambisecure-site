# AI-readiness: what we optimise, and what we deliberately leave

**Date:** 2026-07-30
**Status:** Applied
**Measured with:** `python3 tools/ai-readiness.py`
**Related:** [taxonomy-indexing-decision.md](taxonomy-indexing-decision.md)

Two categories of open finding will keep reappearing on this domain. Both are
deliberate. This records why, so a later pass does not "fix" them and make the
site worse.

---

## 1. FAQPage on the remaining 103 pages — closed, not pending

103 of 285 sitemap pages carry no `FAQPage`. Each is worth up to 20 points, so
closing all of them would add roughly **+7 to the domain average**. We are not
going to, and the finding should be treated as closed rather than open.

### What we did do

FAQ was added where the questions genuinely recur:

| Set | Pages | Why it qualified |
|---|---|---|
| `/resources/tools/*` | 76 | Users of a parser ask the same things: what the format is, why their input fails, what the tool does *not* do, and whether their bytes are uploaded. |
| `/references/*` | 19 | Lookup pages attract "what does this value mean", "which spec version", "what is not covered". |
| `/blog/*`, `/blog/archive/*`, `/blog/categories/*` | 60+ | Subject-matter questions with real answers in the post. |
| Video, industries, about, support | 12 | Setup and scope questions we are asked directly. |

Every FAQ page carries **5 questions**, because the sub-score is
`int(20 × questions / 5)` — a 3-question page scores 12/20, not 20/20.

### What we did not do, and why

The remaining 103 are mostly **product, solution and service pages**. A product
page's real questions are commercial — pricing, lead time, certification status,
volume — and they are either answered in the body copy already or belong in a
conversation with the customer. Manufacturing five Q&A pairs per page to reach a
score would mean:

- writing questions nobody asks, which is the definition of thin content;
- asserting specifics (lead times, certification scope) that vary per customer
  and would become wrong without anyone noticing;
- risking a Google FAQPage policy problem, since the guidelines expect
  genuinely useful Q&A rather than restated marketing copy.

**A domain average of ~83 built from real structure is worth more than ~90 built
from 500 manufactured questions.** If a specific page later accumulates real,
repeated customer questions, add them then — five at a time, and only real ones.

### If you are looking at this because the average dropped

Check `tools/ai-readiness.py --check` first. A drop is far more likely to be a
regression in something already working (a lost Organization node, an H1 shortened
below 3 words, a description trimmed under 80 characters) than these 103 pages.

---

## 2. `structured_data` capped at 17/25 on 102 pages — a scorer limit, not debt

102 pages score exactly 17 on `structured_data` and cannot go higher without
lying. The component awards:

```
Organization      +8
BreadcrumbList    +5
Article / TechArticle / BlogPosting   +8
>=3 distinct @types                   +4
```

A correctly typed product page has `Organization` + `BreadcrumbList` + `Product`
= 8 + 5 + 4 = **17**. The missing 8 is the Article bonus, and the only way to
claim it is to declare a product page an Article.

**Do not do this.** Schema.org types are supposed to describe the page. Typing
`Product`, `Service`, `CollectionPage` or `VideoObject` pages as `Article`:

- misrepresents the page to every consumer of the markup, not just this scorer;
- risks a Google structured-data manual action, which costs far more than 8
  points per page;
- is invisible in the score, so nobody would notice it was wrong.

The 17 is **a ceiling imposed by the scorer's rule set, not technical debt.**

### Where TechArticle *was* added

Only where the page genuinely is a technical article: `/resources/*`,
`/references/*` and `/technologies/*` pages carrying **≥400 words of body
content**. That bar was applied twice — 47 pages in the first pass, 42 more once
FAQ content pushed them over 400 — and was never lowered to capture more pages.

If you are tempted to relax it, note that the bar is what makes the claim true.
A 200-word tool page with an `Article` node is a false statement about the page.

---

## Sub-scores that are effectively finished

| Component | State | Guard |
|---|---|---|
| `entity_coverage` | 15.00/15 on every page | Organization node with 74 `knowsAbout` terms, propagated from `index.html` |
| `answer_shape` | 10.00/10 on every page | `--check` fails on H1 < 3 words or description < 80 chars |
| `headings` | 14.93/15 | every page has a question-form H2 |

These are held by `tools/ai-readiness.py --check`, which runs in
`tools/audit-all.sh`. Anything that regresses them fails the build rather than
showing up in a crawl two weeks later.

`content_depth` (8.43/15) is the one component with real headroom left, and it is
the one to be most careful with: it is a step function at 400 / 800 / 1500 words,
so prose added below a boundary scores nothing. Only add words that a reader
wants; if a page has nothing more to say, leave it.
