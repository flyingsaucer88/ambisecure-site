# Search & Discovery Assistant — Architecture & Roadmap

> **Status:** Phases 1 and 2 are live. Phase 3 (AI/RAG) is **documented only and
> disabled by default**. No AI provider SDK, endpoint, or API key exists in this
> repository, and none may be added without satisfying the controls in this
> document.

This document describes the AmbiSecure site-discovery system across three
phases, the data sources it may and may not use, and the privacy, security,
cost, and correctness controls that any future AI phase must satisfy *before*
it can ship.

---

## Phase 1 — Static site search (live)

A fully client-side search over a build-time index. No backend, no third-party
search service, nothing leaves the visitor's browser beyond a one-time fetch of
the static index.

**Components**

| Piece | Path |
| --- | --- |
| Index builder | `tools/build-search-index.py` |
| Static index | `assets/data/search-index.json` (schema `v2`) |
| Search page | `search/index.html` (`/search/`) |
| ⌘K / Ctrl-K overlay | `assets/js/site-search.js` |
| `/search/` page logic | `assets/js/sitewide-search-page.js` |
| Validation | `tools/audit-search.py` (wired into `tools/audit-all.sh`) |

**Index fields** (compact keys to keep the payload small):
`u` url · `t` title · `d` description · `l` type label · `s` type slug ·
`e` eyebrow · `k` keyword tags · `x` excerpt.

**What is indexed / excluded**
- Indexed: every canonical, indexable `index.html` across products, services,
  technologies, solutions, industries, case studies, references, resources,
  tools, timelines, blog, archive, categories, tags, videos, brochures,
  engagement models, company, support, partners, trust, privacy.
- Excluded: `404`/`robots`, `dist/`, `legacysitedata/`, `_internal/`,
  `node_modules/`, canonical duplicates, and any page carrying
  `<meta name="robots" content="…noindex…">`.

**Properties**
- Cache-busted index fetch (`search-index.json?v=NN`) aligned with site asset
  versioning, so a release bump re-fetches a fresh index.
- Acronym/synonym expansion and prefix matching at query time.
- Privacy-first analytics (`search_submitted`, `search_result_clicked`,
  `search_no_results`) via `window.ASTrack` — **only** an event name and a
  coarse numeric value are emitted; the query string and destination URL are
  never sent.

---

## Phase 2 — "Ask AmbiSecure" non-AI discovery assistant (live)

A conversational-looking interface that **does not generate answers**. It maps a
natural-language question to curated *intent groups* and to the static search
index, then replies with links to real, crawlable AmbiSecure pages.

**Components**

| Piece | Path |
| --- | --- |
| Assistant logic | `assets/js/ask-ambisecure.js` |
| UI + static fallback | `search/index.html` (`[data-ask-assistant]`) |
| Config flag | `assets/js/assistant-config.js` |

**Intent groups**
FIDO / passkeys / validation server · secure element / AmbiSEC / hardware root
of trust · SIMAuth / SMS-OTP replacement / telco · V2X / IEEE 1609.2 / ETSI TS
102 941 / ETSI TS 103 097 / ISO 21177 · DESFire / ticketing / closed-loop
payments · eSIM / eUICC / SM-DP+ · PKI / certificates / signing.

**Guarantees**
- Every recommendation is a real, crawlable internal page (validated against the
  index by `tools/audit-search.py`).
- A persistent, always-visible **"Browse by topic"** block renders the same
  curated links as plain HTML, so navigation works with JavaScript disabled —
  content is never hidden inside a JS-only chat.
- A standing UI disclaimer: *"This assistant searches AmbiSecure content and
  suggests relevant pages. It does not generate AI answers."*
- No model, no API, no network beyond the cached static index.

---

## Phase 3 — Future AI / RAG retrieval (planned, **disabled by default**)

A future, optional retrieval-augmented mode that answers questions in prose
**grounded only in AmbiSecure indexed content**, with citations. It is **not
implemented**. This section is the contract any implementation must meet.

### Proposed architecture (placeholder only)

```
visitor question
      │
      ▼
[ retrieval ]  ──► query the AmbiSecure content index ONLY
      │            (Phase-1 index, optionally chunked/embedded offline)
      ▼
[ grounding ] ──► assemble passages + their source URLs
      │
      ▼
[ generation ] ─► model answers STRICTLY from retrieved passages,
      │            must emit inline citations to source pages
      ▼
[ guardrail ] ──► reject/abstain if answer is not supported by sources
      │
      ▼
answer + "Sources:" list of crawlable AmbiSecure URLs
```

No provider is selected here, and no keys/SDKs are committed. Any model call
would run server-side (never expose a key to the browser).

### Data sources — allowed
- The AmbiSecure static search index (`assets/data/search-index.json`).
- AmbiSecure public page content / excerpts already shipped on the site.
- Optionally an **offline-built** embedding index derived solely from the above.

### Data sources — excluded
- The open web / general model "world knowledge" as an answer source.
- Unpublished drafts, `_internal/`, `legacysitedata/`, `dist/`.
- Any `noindex` page.
- Visitor PII, prior queries, or any cross-site profile.

### Privacy requirements
- No PII collected or stored; respect Do-Not-Track and the existing analytics
  opt-out (`as-analytics-opt-out`), consistent with the rest of the site.
- Queries must not be logged with identifiers; no third-party analytics of
  query content (today only event markers + numeric values are emitted).
- Any model call is server-side; the browser never holds a provider key.

### Security requirements
- No API keys, tokens, or provider SDKs in client code or the repo. Secrets live
  only in server-side env/secret storage.
- Preserve the existing CSP (`script-src 'self' …`, `connect-src 'self' …`):
  no new third-party script or connect origins without an explicit CSP review.
- Prompt-injection hardening: retrieved page content is data, not instructions.
- Rate-limit and authenticate the retrieval endpoint; never proxy arbitrary
  model calls from the public client.

### Cost controls
- AI is **off by default** (`ENABLE_AI_ASSISTANT=false`).
- Cache answers for identical queries; cap tokens/context per request.
- Prefer the zero-cost Phase-1/2 path; AI is an enhancement, not a dependency.
- Hard request ceilings + budget alerting before any production enablement.

### Hallucination controls
- Answer **only** from retrieved AmbiSecure passages; abstain when unsupported
  ("I couldn't find that on AmbiSecure — here are related pages.").
- No fabricated URLs: every linked page must exist in the index (same invariant
  `tools/audit-search.py` already enforces for Phase 2).
- Show confidence / source coverage; degrade to plain search on low confidence.

### Citation / linking requirements
- Every answer cites the specific AmbiSecure source pages it used.
- Citations are real, crawlable internal links (no off-site or invented URLs).
- The answer must remain useful with links alone (parity with the Phase-2
  "I found relevant AmbiSecure resources:" behaviour).

---

## Configuration

| Mechanism | Value | Notes |
| --- | --- | --- |
| `assets/js/assistant-config.js` → `enableAI` | `false` | Runtime flag (static site source of truth). |
| `ENABLE_AI_ASSISTANT` (`docs/search-assistant.env.example`) | `false` | Build-time mirror for a future pipeline. |

Flipping `enableAI` to `true` does **not** enable AI — there is no AI code path.
It only reserves the future hook. Enabling AI requires implementing the
architecture above **and** satisfying every control in this document.

## Enforcement

`tools/audit-search.py` (run by `tools/audit-all.sh`, CI, and the optional
pre-commit hook) fails the build if:
- the AI flag is not `false` by default,
- any AI provider SDK / endpoint / API-key fingerprint appears in shipped JS,
- any assistant/search link points to a page not in the index,
- the Phase-2 "no AI answers" disclaimer is missing, or
- the Phase-1 search index is stale, invalid, or includes a `noindex` page.
