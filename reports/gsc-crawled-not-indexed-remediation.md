# Remediation — Google Search Console “Crawled – currently not indexed”

**Property:** ambisecure.ambimat.com (static site, manual Hostinger deploy)
**Source of truth:** `docs/audits/gsc/crawled-not-indexed-2026-06-12.csv`
(GSC *Coverage validation* export, issue = “Crawled - currently not indexed”,
validation started 2026‑06‑02, failed 2026‑06‑06).
**Branch:** `fix/gsc-crawled-not-indexed` — not pushed, not deployed.
**Audit tool:** `tools/audit-gsc-crawled-not-indexed.py` (offline, predicts server
disposition from committed `.htaccess` + files on disk).

> **Honest framing.** This work removes the *avoidable technical and
> content‑quality reasons* a page would be crawled but not indexed. It does
> **not** guarantee indexing — Google decides that at its own discretion and on
> its own schedule. For a young/low‑authority domain, technically‑sound pages
> can sit in “crawled – currently not indexed” purely as a crawl‑budget /
> authority latency, with no defect to fix.

---

## 1. Headline finding

**The site was already in good technical shape for this issue.** Of the 149
affected URLs, 138 (≈93 %) are *already* handled correctly on the live server —
the GSC report is largely **stale**, listing URLs as last crawled in 2024–2025,
before the current `.htaccess` rules were deployed.

| What | Count | Live status (verified by `curl`) | Verdict |
|---|---:|---|---|
| Legacy spam/old‑CMS cruft (`/<digits>.htm`, `/<5letters>/<x><digits>.html`) | 136 | **410 Gone** (`.htaccess` spam‑killer) | Correct — *should not* be indexed |
| Renamed duplicate `/services/java-card-development/` | 1 | **301** → `/services/javacard-development/` | Correct |
| Moved `/cyber-security-threats/` | 1 | **301** → `/blog/cyber-security-threats-overview/` | Correct |
| `http://…/solutions/` (protocol duplicate) | 1 | **301** → `https://…/solutions/` | Correct |
| Real, live pages returning **200** | 10 unique | **200** | The actual review target |

The **only genuine defect** found in the live 200 pages: the **`/solutions/`
hub had just 1 editorial (in‑body) inbound link** — anomalously weak for a
top‑level hub with 16 sub‑pages. That is the one thing this change fixes in the
content layer.

The sitemap was **already clean**: 316 URLs, **zero** redirected / 410 / 404 /
noindex entries, and every affected real page present. No sitemap cleanup was
required (see §6 for why I deliberately did **not** regenerate it).

---

## 2. Affected URLs — counts

- **Total rows in CSV:** 149 (148 unique paths; `/solutions/` appears twice as
  the `http://` and `https://` variants).

### Before — by URL type (as reported by GSC)

| Type | Count |
|---|---:|
| Legacy `.htm` / `.html` cruft | 136 |
| Solution / product / service pages | 8 |
| Legal / utility / about pages | 3 (incl. homepage `/`) |
| Blog post | 1 |
| Other (`http://` protocol dup of `/solutions/`) | 1 |
| **Total** | **149** |

### After — by remediation action

| Action | Count | Notes |
|---|---:|---|
| **OK_INDEXABLE** (healthy 200, kept indexable) | 11 records / 10 pages | No content defect; `/solutions/` linking strengthened |
| **C_REDIRECT** (301 — already live) | 2 | `java-card-development`, `cyber-security-threats` |
| **E_GONE** (410 — already live, correctly de‑indexed) | 136 | Legacy cruft |
| **A_IMPROVE** remaining | 0 | (was 1 — `/solutions/` — now resolved) |
| **B_CANONICAL / D_NOINDEX / E_DELETE / NOT_FOUND** | 0 | None needed |

---

## 3. Per‑URL decisions

### A. Improve and keep indexable — 1 page (resolved)
- **`/solutions/`** — 442 words, healthy metadata/canonical/H1, but only **1**
  editorial inbound link. **Action taken:** added 3 contextual in‑body links
  from sibling hubs (`/products/`, `/technologies/`, `/industries/`). Editorial
  inbound 1 → **4**. Now classifies `OK_INDEXABLE`.

### Healthy 200 pages — kept as‑is (10 pages, no rewrite)
Per the “no broad content rewrites without evidence” rule, these were **not**
modified — each has adequate depth, unique title/description/H1, a correct
self‑canonical, exactly one `<h1>`, sitemap membership, and reasonable inbound
links. Their non‑indexing is most consistent with crawl‑budget / authority
latency, not a fixable defect:

| Page | Words | Editorial inbound |
|---|---:|---:|
| `/` (homepage) | 2040 | 317 |
| `/products/iot-security-coprocessor/` | 2888 | 36 |
| `/products/onepass-card/` | 492 | 36 |
| `/services/javacard-development/` | 483 | 26 |
| `/products/javacard-applets/` | 491 | 21 |
| `/about/certifications/` | 1115 | 8 |
| `/blog/secure-iot-identity-with-applets/` | 1488 | 5 |
| `/products/` | 784 | 5 |
| `/about/` | 652 | 3 |

### C. Redirect — 2 pages (already live, no change)
- `/services/java-card-development/` → `/services/javacard-development/` (301)
- `/cyber-security-threats/` → `/blog/cyber-security-threats-overview/` (301)

### E. Gone — 136 URLs (already live, no change)
Legacy old‑CMS / SEO‑spam cruft returning **410 Gone** via the existing
`.htaccess` spam‑killer patterns. 410 is the correct, intended signal; these
will drop out of the report as Google re‑crawls them.

### D / delete / canonicalize / not‑found — 0
No page needed noindexing, deletion, or new canonicalization, and **every**
affected URL mapped to a known file or rule (0 NOT_FOUND).

---

## 4. Files changed

| File | Change |
|---|---|
| `tools/audit-gsc-crawled-not-indexed.py` | **New.** Offline GSC‑CSV → repo/sitemap/.htaccess audit + classifier |
| `reports/gsc-crawled-not-indexed-audit.md` / `.json` | **New.** Machine + human audit output |
| `reports/gsc-crawled-not-indexed-remediation.md` | **New.** This report |
| `docs/audits/gsc/crawled-not-indexed-2026-06-12.csv` (+ metadata) | **New.** Committed copy of the GSC export for reproducibility |
| `products/index.html` | +1 contextual link → `/solutions/` |
| `technologies/index.html` | +1 contextual link → `/solutions/` |
| `industries/index.html` | +1 contextual link → `/solutions/` |
| `assets/data/search-index.json` | Regenerated (`tools/build-search-index.py`) to stay in sync |

- Pages improved: **1** (`/solutions/`, via internal linking).
- Pages noindexed: **0**.
- Pages removed from sitemap: **0**.
- Redirects added: **0** (the 2 needed redirects already exist and are live).
- Pages deleted: **0**.

---

## 5. Internal‑linking improvement (detail)

`/solutions/` is a primary hub but was reachable editorially only from the
homepage (boilerplate nav/breadcrumb links are discounted by search engines).
Added natural in‑body links from the three sibling hubs:

- `products/index.html` — “…Not sure which product fits your deployment? Browse
  **solutions by use case**.”
- `technologies/index.html` — “…To see how these technologies combine into
  deployments, browse **solutions by use case**.”
- `industries/index.html` — “…each mapped to specific **solutions by use case**.”

Result: `/solutions/` editorial inbound links **1 → 4**.

---

## 6. Sitemap & robots — deliberately unchanged

- `sitemap.xml` was **left untouched**. It already contains only canonical,
  indexable URLs (316 locs, **0** redirected / 410 / 404 / noindex entries) and
  includes every affected real page.
- I ran `tools/regen-sitemap.py --apply` as a check and **reverted it**: the
  regenerator *adds* `/products/iot-security-chipset/`, which is a
  `noindex,follow` redirect stub (it 301/meta‑refreshes to
  `iot-security-coprocessor`). Regenerating would therefore **introduce** a
  noindex page into the sitemap — the opposite of the goal. The hand‑maintained
  sitemap is cleaner.
- `robots.txt` already points to `https://ambisecure.ambimat.com/sitemap.xml`
  and was not changed.

**Recommendation (not done here, to keep the diff scoped):** teach
`tools/regen-sitemap.py` to skip pages carrying `meta robots noindex` so a
future regenerate cannot re‑introduce the stub.

---

## 7. Exact commands run

```bash
# Inspect the GSC export
unzip -o ~/Downloads/ambisecure.ambimat.com-Coverage-Validation-2026-06-12.zip

# Live disposition spot‑checks (curl -I style)
curl -sI https://ambisecure.ambimat.com/153225028.htm                 # 410
curl -sI https://ambisecure.ambimat.com/services/java-card-development/ # 301
curl -sI https://ambisecure.ambimat.com/cyber-security-threats/         # 301
curl -sI https://ambisecure.ambimat.com/solutions/                      # 200

# New audit (offline, repo-local)
python3 tools/audit-gsc-crawled-not-indexed.py \
  docs/audits/gsc/crawled-not-indexed-2026-06-12.csv \
  --json reports/gsc-crawled-not-indexed-audit.json --thin-words 250

# After the 3 link edits
python3 tools/build-search-index.py        # keep search index in sync
bash tools/audit-all.sh                     # full SEO/content/sitemap/spam/search gate
```

## 8. Final audit results

- `tools/audit-gsc-crawled-not-indexed.py` → 0 A_IMPROVE, 0 conflicts,
  0 NOT_FOUND; 11 OK_INDEXABLE / 2 redirect / 136 gone.
- `bash tools/audit-all.sh` → **ALL AUDITS PASSED**
  (xmllint sitemap, lint‑htaccess, content, seo, media, freshness `--strict`,
  yoast `--strict`, circular‑links, spam‑seo, search).
- `git diff --stat` (excluding new files): 4 files, 4 insertions, 4 deletions.

---

## 9. Remaining manual steps for you (Google Search Console)

These are **manual** because the site deploys by hand and indexing is Google’s call:

1. **Deploy to live** — `make deploy-build` (re‑runs the audit gate, writes
   `dist/ambisecure-hostinger.zip`), then upload the ZIP via Hostinger hPanel.
   *(No deploy was performed by this task.)*
2. **Confirm live** — re‑check a few URLs after deploy: `/solutions/` (200),
   `/products/`, `/technologies/`, `/industries/` (the 3 edited hubs render the
   new “solutions by use case” link).
3. **Request validation again** in GSC for “Crawled – currently not indexed”
   **only after** the live site is confirmed updated. Most of the bucket
   (the 136 `.htm` cruft) should validate as it re‑crawls them to 410.
4. **URL Inspection** on a sample of the real pages (`/solutions/`, `/about/`,
   `/products/javacard-applets/`) → *Request indexing* to nudge re‑crawl.
5. **Expect partial, gradual movement.** The 410 cruft may first reappear under
   “Not found (410/404)” before disappearing — that is normal and correct. The
   real 200 pages may still take time, or remain “crawled – currently not
   indexed,” because **indexing is not guaranteed**. Re‑pull the GSC export in
   2–4 weeks and re‑run `tools/audit-gsc-crawled-not-indexed.py` to track drift.

---

## 10. Residual risks / notes

- **Indexing is discretionary.** No change here forces Google to index the
  healthy 200 pages; they may remain in the bucket on authority grounds alone.
- **Report staleness.** The bulk of the issue reflects pre‑fix crawls; the
  underlying technical causes for those URLs are already resolved live.
- **`regen-sitemap.py` noindex gap** (see §6) — latent; left for a follow‑up so
  this change stays minimal.
- **`/products/iot-security-chipset/`** is a live 200 `noindex` redirect stub
  (not in the CSV, not in the sitemap) — out of scope, flagged for awareness.
