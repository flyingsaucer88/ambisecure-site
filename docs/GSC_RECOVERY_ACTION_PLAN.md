# GSC Recovery Action Plan — ambisecure.ambimat.com

> Picking this up cold? Start with **Status** then go to **Today** then **Tomorrow**. The full diagnostic transcript lives in the chat; this file is the action sheet.

## Status (as of 2026-05-25)

- **Indexed: 0 / Not indexed: 281** in GSC.
- **Root cause**: SEO-spam saturation. 251 of 258 URLs in Google's crawl pool are external Japanese-keyword-hack fingerprints (`/<8-10 digits>.htm` and `/<5 letters>/<l><6-8 digits>.html`). Only ~7 legitimate URLs are in Google's crawl pool; none are indexed. Domain reputation has been poisoned, not the site itself.
- **What's already in the repo** (commit `8984ca7`, **not yet pushed**):
  - `.htaccess` returns **410 Gone** for the two spam URL patterns. Regexes verified non-colliding with every real URL.
  - 301 redirect for the defunct `/products/smart-wallet-for-payments/` → `/products/tappable/`.
  - Removed misleading `"price":"0" + InStock` Offer block from all 18 Product schemas (was a structured-data lie Google demotes on).
- **What still needs to be done**: deploy, request indexing, build disavow file.
- **What NOT to do**: GSC → Removals → "Remove entire site". This was almost submitted; it suppresses the whole site for 6 months and is the opposite of what we want. Stay out of Removals entirely — the 410s do the job.

---

## Today (in order)

### 1. Deploy

```bash
git push origin main
```

Wait ~5 min for Hostinger auto-deploy to pick up the new `.htaccess`. Then verify:

```bash
curl -I https://ambisecure.ambimat.com/100180190.htm
curl -I https://ambisecure.ambimat.com/eusdh/c2784685.html
```

Both must return `HTTP/2 410`. If either still returns `404`, the deploy hasn't run — check the GitHub Actions tab.

Also re-verify legitimate URLs still work:

```bash
curl -I https://ambisecure.ambimat.com/
curl -I https://ambisecure.ambimat.com/products/iot-security-coprocessor/
```

Both should return `HTTP/2 200`.

### 2. Request indexing for 10 priority URLs

GSC → top bar **"Inspect any URL in ambisecure.ambimat.com"** → paste each URL → wait for inspection result → click **REQUEST INDEXING**. Limit is ~10/day, so this is one sitting.

**Updated priority list** (V2X surfaces added — TRAI consultation timing makes them load-bearing):

```
https://ambisecure.ambimat.com/
https://ambisecure.ambimat.com/industries/connected-mobility/
https://ambisecure.ambimat.com/solutions/v2x-security/
https://ambisecure.ambimat.com/technologies/v2x-pki/
https://ambisecure.ambimat.com/products/iot-security-coprocessor/
https://ambisecure.ambimat.com/products/
https://ambisecure.ambimat.com/solutions/
https://ambisecure.ambimat.com/products/javacard-applets/
https://ambisecure.ambimat.com/services/javacard-development/
https://ambisecure.ambimat.com/about/certifications/
```

Previous priority URLs (homepage was already in the list; the FIDO authenticator flagships drop to day 2 for the new submission cycle):

```
https://ambisecure.ambimat.com/products/onepass-card/
https://ambisecure.ambimat.com/about/
https://ambisecure.ambimat.com/blog/secure-iot-identity-with-applets/
```

### 3. Resubmit the sitemap

GSC → sidebar **Sitemaps**.

- If `sitemap.xml` is listed with an old "Last read" date: remove it and re-add it as `sitemap.xml` (just the filename, not the full URL).
- If it isn't listed: add `sitemap.xml`.

### 4. Validate the existing "Why not indexed" reasons

GSC → **Pages** → click the **"Not found (404)"** row → click **VALIDATE FIX**. Then do the same for **"Crawled — currently not indexed"**. Validation runs for ~28 days while Google re-crawls.

---

## Tomorrow

### 5. Build the disavow file

GSC → sidebar **Links**. Yesterday this said "Processing data, please check again in a day or so." Today it should show data.

Go to **External links → Top linking sites**. Three patterns to expect:

- **Legit** — `ambimat.com`, `esim.ambimat.com`, real industry references → keep.
- **Spam** — random-letter domains, foreign-language pharma/adult/hack sites, numeric-looking domains, sites with names like `free-tools-xxx` → these are disavow targets.
- **None** — if GSC shows very few external links at all, the 251 spam URLs in Google's crawl pool came from a different vector (likely a prior site compromise that briefly served those files, or an old sitemap). The 410s already in place will fully resolve that case; no disavow file needed.

If there are spam linking domains, build `disavow.txt`:

```
# AmbiSecure disavow — spam backlinks discovered via GSC Links report 2026-05-26
domain:spammysite1.tld
domain:spammysite2.tld
domain:spammysite3.tld
```

One `domain:` line per spam linking domain. Upload at:
<https://search.google.com/search-console/disavow-links-tool>

Pick the `ambisecure.ambimat.com` property when prompted.

---

## Week 1–2 monitoring

- **Daily**: GSC → Pages → check "Indexed" count. Expect first legit page (likely homepage) to index within 2–4 weeks *if* the disavow file has been submitted.
- **Daily**: check "Crawled — currently not indexed" count is dropping. The 251 spam URLs should start moving out of this bucket as Google re-crawls them and gets 410 responses.
- **Weekly**: check "Not found (404)" bucket — spam URL count should drop as Google honors the 410.

Spam URLs hit with 410 typically get de-indexed within 7–14 days of the next crawl, but Google's crawl cadence on a low-authority subdomain can be slow. Don't panic if movement is slow in the first week.

---

## Week 6 escalation (only if needed)

If after 6 weeks indexed is still 0 and Validate-Fix has completed without recovery:

1. GSC → **Security & Manual Actions** → check for any manual-action notice. None yet today, but worth re-checking.
2. File a reconsideration request describing the spam-saturation cleanup (410s shipped, disavow uploaded, dates).
3. Build external authority signals — at minimum, get the parent `ambimat.com` to link to this subdomain in its main nav with anchor text "AmbiSecure". A single high-quality inbound link from a legitimate parent domain is worth more than any technical change here.

---

## Reference

### What the 410 rules in .htaccess do

```apache
RewriteRule ^[0-9]{6,10}\.htm$ - [G,L]
RewriteRule ^[a-z]{5}/[a-z][0-9]{6,8}\.html$ - [G,L]
```

- `[G,L]` = return HTTP 410 Gone, stop processing further rules.
- Both regexes are anchored (`^...$`) and tight enough that no legitimate site URL matches. The 5-letter directory regex would have collided with `/about/`, `/tools/`, `/trust/` if it didn't also require a `/<l><6-8 digits>.html` filename — none of those dirs contain such a file.

410 is different from 404: 410 says **"permanently gone, never coming back, drop it from your index"**. Google de-indexes 410s faster than 404s. There's no legitimate concern with returning 410 here because these URLs never existed on the site.

### GSC URL Inspection vs Removals

| Tool | What it does | Use for our case? |
|---|---|---|
| **URL Inspection → Request Indexing** | Asks Google to crawl + consider indexing one URL | ✅ Yes — for the 10 priority URLs |
| **Removals → Temporarily remove URL** | Hides one URL or prefix from Search for ~6 months. Does NOT remove from index, just suppresses display | ❌ No — 410s do this permanently and properly |
| **Removals → Remove entire site** | Suppresses the entire hostname from Search for ~6 months | ❌❌❌ Catastrophic. Never click this. |
| **Disavow** | Tells Google to ignore inbound links from listed domains | ✅ Tomorrow — once Links report has data |

### Files changed in commit 8984ca7

- `.htaccess` — 410 rules + smart-wallet 301
- `products/{18 product pages}/index.html` — Offer block removed
- `docs/Chart.csv`, `docs/Chart-1.csv` — GSC time series (audit trail)
- `docs/Metadata.csv`, `docs/Metadata-1.csv` — GSC issue metadata
- `docs/Table.csv`, `docs/Table-1.csv` — the 218 + 40 URL lists from GSC export

### Commands you may want to re-run

```bash
# Verify spam URL pattern is killed
curl -I https://ambisecure.ambimat.com/100180190.htm  # expect 410

# Verify smart-wallet redirect works
curl -sI https://ambisecure.ambimat.com/products/smart-wallet-for-payments/  # expect 301 → /products/tappable/

# Verify legit URL still serves
curl -I https://ambisecure.ambimat.com/  # expect 200

# Re-run the full audit suite locally
bash tools/audit-all.sh

# Crawl all 266 sitemap URLs and verify all 200
curl -s https://ambisecure.ambimat.com/sitemap.xml | grep -oE '<loc>[^<]+</loc>' | sed -E 's|</?loc>||g' \
  | while read url; do echo "$(curl -s -o /dev/null -w '%{http_code}' -L --max-time 12 "$url") $url"; done
```

### Don't-do list

- ❌ Don't submit "Remove entire site" in GSC → Removals.
- ❌ Don't add per-URL Removals entries for the 251 spam URLs. The 410s do this correctly. Removals would be busywork that expires in 6 months.
- ❌ Don't add `noindex` to tag pages or tool pages reflexively. They're not the problem.
- ❌ Don't ship a `disavow.txt` based on guesses. Wait until you can see actual linking domains in GSC → Links.
- ❌ Don't add fabricated `lowPrice`/`highPrice` to the Product schemas to "fix" the missing Offer. The Offer was removed deliberately because we don't publish prices.

### Bottom line

The site is technically sound. The problem is reputation, not structure. The 410s plus disavow plus time are the actual fix.
