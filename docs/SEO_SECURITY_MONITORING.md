# SEO Security Monitoring & Recovery Playbook

This is the operator checklist for keeping `ambisecure.ambimat.com` clean
of SEO spam, search-index poisoning, and the slow drift that opens the
door to Japanese-keyword-hack / pharma-hack / cloaking attacks.

The site is **fully static** (HTML + CSS + JS + images), deployed to
Hostinger LiteSpeed. There is no database, no admin login, no PHP. That
shrinks the attack surface dramatically — but the search-reputation
attack surface (off-site spam backlinks, scraper farms, GSC anomalies)
is the same as any other domain and must be monitored.

This playbook covers four phases:

1. **Weekly hygiene** — 10-minute review every Monday
2. **Anomaly response** — what to do when GSC flags something weird
3. **Compromise recovery** — if the worst happens (uploads, injections)
4. **Long-term defensive posture** — what's already in place and why

---

## 1. Weekly hygiene (10 minutes)

Run from the repo root:

```bash
bash tools/audit-all.sh
```

This runs every gating audit, including the new `audit-spam-seo.py`. A
clean exit = no spam fingerprints, no forbidden files, no sitemap
poisoning, no cloaking surfaces.

Then in **Google Search Console** (one operator, Monday morning):

| Tab | What to look for | Bad sign |
| --- | --- | --- |
| Performance → Queries | Top 100 queries | Foreign-language queries you can't explain (Japanese, Russian, Arabic), pharma/casino/loan terms, brand-impersonation |
| Performance → Pages | Top 100 pages | URL patterns you don't recognise — `/eusdh/c2784685.html`, `/100180190.htm`, `/category/zzz`, anything with `?` |
| Coverage → Indexed | Page count drift | Sudden +50/+100/+500 pages indexed since last week |
| Coverage → Not indexed | "Crawled — currently not indexed" | New spam-shaped URLs appearing here means scrapers are pointing inbound links at fake paths |
| Security → Manual actions | Any entry at all | Anything here is an immediate page-1 emergency |
| Security → Security issues | Any entry at all | "Hacked: Content injection" / "Hacked: Code injection" / "Cloaking" — escalate to §3 immediately |
| Sitemaps | All submitted sitemaps | Status "Couldn't fetch" or unexpected discovered URLs |

If everything is clean, you are done in 10 minutes.

Also worth a once-over (monthly):

- **Bing Webmaster Tools** — Bing surfaces some spam categories Google
  buries; check Site Explorer for unexpected inbound links.
- **`site:ambisecure.ambimat.com` on Google** — should return only
  pages you recognise. A page of foreign-language results = poisoning.
- **`site:ambisecure.ambimat.com .htm` on Google** — should return
  approximately zero results; any `.htm` (single trailing `m`) result
  is a Japanese-keyword-hack fingerprint.

---

## 2. Anomaly response

### 2a. A spam URL is showing in GSC "Pages" as 200 OK

This should never happen — every spam-shaped path returns 410 via
[.htaccess](../.htaccess) lines 34-35 (numeric `.htm`) and lines 80-90
(5-letter doorway pattern). If it does:

1. Curl the URL with the live host: `curl -I https://ambisecure.ambimat.com/<the-url>`
2. Confirm status is `410 Gone`. If it's `200` or `302`, the deployed
   `.htaccess` is out of sync with the repo. Re-run the deploy:
   `bash tools/build-hostinger-package.sh` and push.
3. Once 410 is confirmed at the edge, **do NOT** request URL removal
   in GSC for spam patterns — Google takes 14–30 days to drop a 410'd
   URL, and submitting individual removals is busywork. Wait it out.
4. If the URL pattern is new and not yet covered by the regexes in
   `.htaccess`, add a new `RewriteRule … [G,L]` line and redeploy.
   Tighten the regex so no real URL could match.

### 2b. Sudden foreign-language queries / impressions

1. In GSC, click the foreign query → "Pages" tab to see which URL is
   ranking for it.
2. If the URL is a real page on the site: someone has built a backlink
   farm pointing at us with foreign anchor text. This is **not a
   compromise** — it's off-site spam. Action: do nothing in the short
   term (Google ignores spam-anchor signal); if it persists past 60
   days, file a **GSC Disavow** for the inbound spam domains.
3. If the URL is one of the 410'd patterns: ignore. The 410 will
   eventually win.
4. If the URL is a real page AND the foreign content seems to be
   served from it: this is a cloaking compromise. Jump to §3.

### 2c. Indexed-page count jumped by N

Use the audit:

```bash
python3 tools/audit-seo.py
```

It compares sitemap (truth) against on-disk pages (truth) against
internal hrefs. If both are clean, the index spike is off-site (spam
scrapers re-publishing your content) and you can ignore it — Google
will eventually de-rank scraped duplicates if your canonicals are
correct (they are; the audit verifies this).

If the audit flags **orphan pages** (on disk but not in sitemap),
inspect each one. A legitimately-added page that someone forgot to
sitemap is benign; anything else is suspicious — escalate to §3.

### 2d. Unknown URL in GSC "Discovered — currently not indexed"

Google sometimes discovers URLs from inbound spam links. If the URL is
NOT on the site and NOT in the sitemap, no action is needed — Google
will not index a 410'd URL. Verify it 410s with curl and move on.

---

## 3. Compromise recovery

If you find evidence of compromise — injected pages, foreign content
on a real page, a `.php` file in the tree, an unfamiliar redirect —
follow this sequence in order. Do not skip steps.

### Step 1 — Snapshot

```bash
# Capture the current state for forensics before fixing anything.
mkdir -p /tmp/ambisecure-incident-$(date +%Y%m%d)
cp -a . /tmp/ambisecure-incident-$(date +%Y%m%d)/repo
# Also pull the live deployment via FTP/SSH from Hostinger so you can
# diff repo vs. live; live is what Google sees.
```

### Step 2 — Identify scope

```bash
python3 tools/audit-spam-seo.py --strict
```

Re-run after each removal. The audit lists every hit; resolve from the
top down. The `forbidden filenames` section is the most damning — any
hit there means an actual injected file exists. `.htaccess` should
also be diff'd against `git log` to catch added cloaking rules.

### Step 3 — Remove

For each hit:

- **Injected file** → `git rm` it locally, redeploy clean.
- **Injected HTML block in a real page** → revert the page from the
  last known-good commit (use `git log -p path/to/page.html`).
- **Modified `.htaccess`** → revert from git, redeploy.
- **Modified `sitemap.xml`** → re-run `python3 tools/regen-sitemap.py`.

### Step 4 — Hostinger-side cleanup

Repo-side cleanup is necessary but not sufficient. Also:

1. Rotate Hostinger account password + FTP credentials.
2. In Hostinger File Manager, manually verify the `public_html` tree
   matches the deployed zip — no extra files.
3. Check Hostinger's "Access logs" for anomalous IPs in the upload
   window if you can isolate when the injection happened.

### Step 5 — Search Console recovery

Only after the live site is clean:

1. GSC → URL Inspection → for each spam URL, "Request indexing" of
   the now-410 response so Google revisits it sooner.
2. GSC → Sitemaps → resubmit `sitemap.xml`.
3. GSC → Security & Manual Actions → "Request review" with a short
   description of (a) what was found, (b) how it was removed, (c)
   what's preventing recurrence (this hardening pass).
4. Cache invalidation: Hostinger LiteSpeed caches HTML; if you have
   LiteSpeed Cache panel access, purge it. Otherwise, the 5-minute
   HTML TTL in `.htaccess` (line 250) will roll the cache over.

### Step 6 — Post-incident

- Note the indicator that caught the compromise (which audit, which
  GSC tab) and add a pattern for it to `audit-spam-seo.py` if it
  wasn't caught automatically.
- File the incident under `docs/` with date + scope + root cause.

---

## 4. Long-term defensive posture (what's already in place)

| Layer | Mechanism | File |
| --- | --- | --- |
| Transport | HTTPS forced, HSTS preloaded 1 year | [.htaccess](../.htaccess) |
| Framing | `X-Frame-Options: DENY` + CSP `frame-ancestors 'none'` | [.htaccess](../.htaccess) |
| MIME-sniff | `X-Content-Type-Options: nosniff` | [.htaccess](../.htaccess) |
| Permissions-Policy | geolocation/mic/camera/payment/usb/topics/FLoC denied | [.htaccess](../.htaccess) |
| CSP | self + GA4 + YouTube only; no `unsafe-eval`; `object-src 'none'` | [.htaccess](../.htaccess) |
| Spam URL fingerprints | 410 Gone for `\d{6,10}.htm` and `[a-z]{5}/[a-z]\d{6,8}.html` | [.htaccess](../.htaccess) |
| WP probe surface | 410 Gone for wp-admin / wp-content / wp-includes / wp-json / xmlrpc | [.htaccess](../.htaccess) |
| Dotfile exposure | 403 Forbidden for `/.git/`, `/.env`, etc. (except `/.well-known/`) | [.htaccess](../.htaccess) |
| Source-control / dev artifacts | 403 for `node_modules`, `vendor`, `package*.json`, lockfiles, `.idea`, `.vscode` | [.htaccess](../.htaccess) |
| Backups / source maps | 403 for `.bak`, `.old`, `.orig`, `.swp`, `.sql`, `.map`, `.tar.gz` | [.htaccess](../.htaccess) |
| Script execution | 403 for `.php*`, `.phtml`, `.phar`, `.cgi`, `.pl`, `.py`, `.asp*`, `.jsp*` | [.htaccess](../.htaccess) |
| Query-string injection | 403 for SQLi / XSS / RFI / traversal payloads + `?author=N` | [.htaccess](../.htaccess) |
| Crawler hygiene | `robots.txt` disallows wp- probe paths and `*?` query URLs | [robots.txt](../robots.txt) |
| Audit gating | `audit-spam-seo.py` runs in `audit-all.sh` (CI on PR) | [tools/audit-all.sh](../tools/audit-all.sh) |
| Canonical integrity | Every page's `<link rel="canonical">` is checked by `audit-seo.py` | [tools/audit-seo.py](../tools/audit-seo.py) |
| Redirect hygiene | `lint-htaccess.py` catches chains, loops, duplicates | [tools/lint-htaccess.py](../tools/lint-htaccess.py) |
| Operator dashboards | `/_internal/` is `Require all denied` + `X-Robots-Tag: noindex` | [_internal/.htaccess](../_internal/.htaccess) |

### Things specifically NOT in place (by design)

- **No WAF**. Hostinger shared hosting doesn't expose one and the
  static-site posture means there's nothing to exploit. The
  query-string filters in `.htaccess` cover the same patterns at
  ~0% performance cost.
- **No malware scanner**. Static files don't execute; scanning is
  redundant. `audit-spam-seo.py` is the equivalent for content drift.
- **No image-based monitoring** (CloudFlare, Sucuri). The audit
  pipeline + GSC weekly review covers the same ground at no cost.

---

## Quick-reference commands

```bash
# Full audit (run before every deploy + weekly)
bash tools/audit-all.sh

# Just the spam/cloaking/injection scan (fast, ~1 sec)
python3 tools/audit-spam-seo.py

# Strict mode — fail on soft hits too (meta-refresh, hidden text)
python3 tools/audit-spam-seo.py --strict

# Verify .htaccess parses + redirects are loop-free
python3 tools/lint-htaccess.py

# Verify sitemap matches on-disk truth
python3 tools/audit-seo.py

# Verify the live site echoes the repo
curl -sI https://ambisecure.ambimat.com/.env       # expect 403
curl -sI https://ambisecure.ambimat.com/wp-admin/  # expect 410
curl -sI https://ambisecure.ambimat.com/100180190.htm  # expect 410
curl -sI https://ambisecure.ambimat.com/eusdh/c2784685.html  # expect 410
```

---

Last reviewed: 2026-05-25 (Phase 40 — defensive hardening pass).
