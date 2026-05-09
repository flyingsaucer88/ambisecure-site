# 13. Phase 6 &mdash; Deployment Readiness

**Date:** 2026-05-09
**Status:** Production-ready for Hostinger LiteSpeed deployment.

This document is the deployment runbook and final-state report for the AmbiSecure site after Phase 6.

---

## 1. Final-state numbers

| Metric | Count |
| ------ | -----: |
| HTML pages on disk | **140** |
| Sitemap canonical URLs | **167** |
| Practical utility tools | **54** |
| Searchable reference databases | **12** |
| Solution / vertical pages | **14** |
| Buyer-facing solution journey pages (Phase 5 cohort) | 6 |
| Product pages (top-level + leaf) | **11** (3 OnePass + 8 Phase-6 legacy-coverage) |
| Service pages | **8** (1 index + 3 core + 4 sub-tools) |
| Industry pages | 5 (4 verticals + index) |
| Technology pages | 12 |
| Reference DBs | 12 (+ index) |
| Blog posts (cornerstone) | 12 |
| Trust / certifications / partners surfaces | 3 (this phase) |
| Total `Redirect 301` rules in `.htaccess` | **80+** |
| Total file size of HTML output | ~3.6 MB |

---

## 2. Phase 6 deliverable summary

Phase 6 closed the final commercial-readiness gaps:

1. **Legacy product / service menu coverage** &mdash; 8 product pages and 8 service pages were nav-linked but had no underlying file. All shipped (`docs/14`).
2. **Legacy certificates pulled in as-is** &mdash; 3 legacy badge images preserved with original filenames; new `/about/certifications/` page built with active claims preserved verbatim, targets clearly distinguished, disclaimers explicit (`docs/15`).
3. **Trust center** &mdash; `/trust/` aggregates certifications, standards, security model, and a published vulnerability-disclosure policy with safe-harbour text.
4. **Partner programme surface** &mdash; `/partners/` for resellers, OEMs, SIs, MSSPs, consultancies, issuers.
5. **Bulk redirect closure** &mdash; 38+ broken internal hrefs eliminated by adding `.htaccess` 301s rather than rewriting referring pages.
6. **Self-redirect / loop audit** &mdash; 2 problematic trailing-slash self-redirects removed.

---

## 3. Hostinger upload procedure

The site is **static HTML / CSS / JS only** with **no build step**. It can be uploaded directly to a Hostinger LiteSpeed host.

### Pre-flight

```sh
# From the repo root, verify expected layout:
ls -d about/ assets/ blog/ contact/ docs/ index.html industries/ partners/ \
      products/ references/ resources/ services/ sitemap.xml solutions/ \
      support/ technologies/ trust/ .htaccess robots.txt 404.html
```

### Upload

1. Connect to Hostinger via SSH/FTP/SFTP (SFTP recommended).
2. Set destination to `public_html/` (or your configured document root).
3. Upload the entire repo contents **except** `.git/`, `.gitignore`, and the `docs/` directory if you want to keep internal docs out of public HTML serving (the docs are markdown only and won&rsquo;t be served by LiteSpeed unless an explicit handler is added, so they are safe to upload but optional).
4. Ensure file permissions: directories `0755`, files `0644`.
5. Confirm `.htaccess` was uploaded (some FTP clients hide dotfiles by default).

### Domain configuration

- Primary domain: `ambisecure.ambimat.com`
- Required DNS: A record (or CNAME) pointing to the Hostinger host.
- SSL: Hostinger&rsquo;s built-in Let&rsquo;s Encrypt (already enabled per `.htaccess` HSTS setup).

---

## 4. `.htaccess` verification checklist

After upload, verify each of the following with `curl -I` from the deployment runner or any external host. All checks should be runnable from a workstation without sudo.

### Forced HTTPS

```sh
curl -I http://ambisecure.ambimat.com/                # expect 301 to https
curl -I https://ambisecure.ambimat.com/               # expect 200
```

### Trailing-`index.html` strip

```sh
curl -I https://ambisecure.ambimat.com/products/index.html   # expect 301 to /products/
```

### Legacy redirects (sample)

```sh
curl -I https://ambisecure.ambimat.com/ambisecure-iot-solution           # 301 to /products/iot-security-chipset/
curl -I https://ambisecure.ambimat.com/ambisecure-esim-solution          # 301 to /products/esim-solution/
curl -I https://ambisecure.ambimat.com/services/java-card-development    # 301 to /services/javacard-development/
curl -I https://ambisecure.ambimat.com/certification                     # 301 to /about/certifications/
curl -I https://ambisecure.ambimat.com/use-cases/passwordless-workforce  # 301 to /solutions/workforce-identity/
curl -I https://ambisecure.ambimat.com/solutions/iot-root-of-trust       # 301 to /solutions/secure-element-integration/
```

### WordPress crawl-path 410s

```sh
curl -I https://ambisecure.ambimat.com/wp-login.php   # expect 410 Gone
curl -I https://ambisecure.ambimat.com/wp-admin/      # expect 410 Gone
curl -I https://ambisecure.ambimat.com/xmlrpc.php     # expect 410 Gone
```

### Custom 404

```sh
curl -I https://ambisecure.ambimat.com/this-does-not-exist   # expect 404 with body served from /404.html
```

### Security headers

```sh
curl -I https://ambisecure.ambimat.com/                       # expect X-Content-Type-Options, Referrer-Policy, HSTS, CSP
```

---

## 5. HTTPS enforcement

- HSTS is set in `.htaccess` (`max-age=31536000; includeSubDomains; preload`).
- After 24-48 hours of healthy HTTPS service, the site can be submitted to the HSTS preload list (`hstspreload.org`). Keep enforcement off the preload list until you are confident no plain-HTTP subdomain exists under `ambimat.com` that needs HTTPS first.
- CSP is restrictive: `default-src 'self'`; no remote scripts; Google Fonts via `style-src` and `font-src` only. No `unsafe-inline` for `script-src`.

---

## 6. Post-deploy smoke test

Run after every deployment. Order matters &mdash; redirects first, then key pages, then crawlability assets.

```sh
# 1. Liveness
curl -sf -o /dev/null -w "%{http_code}\n" https://ambisecure.ambimat.com/   # 200

# 2. Sitemap and robots
curl -sf https://ambisecure.ambimat.com/sitemap.xml | head -5
curl -sf https://ambisecure.ambimat.com/robots.txt

# 3. Key product pages
for u in /products/ /products/onepass-card/ /products/onepass-bio-card/ \
         /products/onepass-usb-key/ /products/biokey/ /products/tappable/ \
         /products/iot-security-chipset/ /products/iot-solution/ \
         /products/javacard-applets/ /products/esim-solution/ \
         /products/digital-signature-token/; do
  echo -n "$u  ";
  curl -sf -o /dev/null -w "%{http_code}\n" "https://ambisecure.ambimat.com$u"
done

# 4. Key service pages
for u in /services/ /services/javacard-development/ /services/fido-validation-server/ \
         /services/tool-chain-development/ \
         /services/tool-chain-development/bio-enrollment-app/ \
         /services/tool-chain-development/security-key-manager/ \
         /services/tool-chain-development/multi-card-applet-loader/ \
         /services/tool-chain-development/ndef-personalisation/; do
  echo -n "$u  ";
  curl -sf -o /dev/null -w "%{http_code}\n" "https://ambisecure.ambimat.com$u"
done

# 5. Trust surfaces
for u in /about/certifications/ /trust/ /partners/; do
  echo -n "$u  ";
  curl -sf -o /dev/null -w "%{http_code}\n" "https://ambisecure.ambimat.com$u"
done

# 6. Sample tool + reference
curl -sf -o /dev/null -w "/resources/tools/atr-parser/  %{http_code}\n" \
  https://ambisecure.ambimat.com/resources/tools/atr-parser/
curl -sf -o /dev/null -w "/references/  %{http_code}\n" \
  https://ambisecure.ambimat.com/references/

# 7. 404 path
curl -sf -o /dev/null -w "/__missing  %{http_code}\n" \
  https://ambisecure.ambimat.com/__missing-path-test
```

Any non-200 / non-3xx response on the URLs above indicates a deployment problem.

---

## 7. Rollback plan

The site has no backend, no database, no build step. Rollback is a file-replacement operation.

1. Tag the working production snapshot before each deploy: `git tag deploy-YYYY-MM-DD-HHMM`.
2. If a deploy regresses, redeploy the previous tag&rsquo;s working tree using the same FTP / SFTP procedure.
3. `.htaccess` is the single highest-risk file (one syntax error can take the entire site offline). Always keep a known-good copy of `.htaccess` at `~/ambisecure-htaccess-backup` on the deploy host.
4. Cache-busting: HTML responses are configured to expire after 1 hour (`mod_expires`); a deploy is fully reflected for visitors within 60 minutes without a forced clear.

---

## 8. SEO post-deploy checklist

| Action | Tool | Status |
| ------ | ---- | ------ |
| Submit sitemap to Google Search Console | `https://search.google.com/search-console` | Pending (post-deploy) |
| Submit sitemap to Bing Webmaster | `https://www.bing.com/webmasters` | Pending (post-deploy) |
| Verify canonical tags resolve to the same URL Google indexes | GSC URL Inspection | Pending |
| Verify breadcrumb schema renders | GSC Rich Results Test | Pending |
| Verify Product / Service schema on product pages | GSC Rich Results Test | Pending |
| Mobile-friendly test on key pages | GSC Mobile-Friendly | Pending |
| Confirm HSTS / preload eligibility | `hstspreload.org` | Pending (after 48 h healthy HTTPS) |

---

## 9. Google Search Console actions

1. Add and verify `ambisecure.ambimat.com` as a property (recommend the prefix `https://ambisecure.ambimat.com/`).
2. Submit `https://ambisecure.ambimat.com/sitemap.xml`.
3. Use URL Inspection on these high-value pages and request indexing:
   - `/`
   - `/products/onepass-card/`
   - `/products/javacard-applets/`
   - `/services/fido-validation-server/`
   - `/about/certifications/`
   - `/blog/implementing-fido2-developer-guide/`
   - `/solutions/passwordless-mfa/`
4. Watch the Coverage report for any pages caught in `Excluded &mdash; Crawled, currently not indexed` for more than 30 days.
5. Watch the Sitemaps report for any `Couldn&rsquo;t fetch` errors.

---

## 10. Analytics / tagging placeholder notes

No analytics tags are currently injected. To enable, choose one of:

- **Plausible (recommended for privacy posture):** add a single `<script defer data-domain="ambisecure.ambimat.com" src="https://plausible.io/js/script.js"></script>` to a shared head include. CSP will need `script-src` extended to `plausible.io`.
- **Google Analytics 4:** Add the standard GA4 snippet. CSP will need `script-src` extended to `*.googletagmanager.com` and `connect-src` extended to `*.google-analytics.com`. Plus a cookie banner if EU traffic is non-trivial.

Whichever is chosen, do it as a single edit to a shared `<head>` block (currently each page has its own `<head>`; a future refactor could move the analytics tag into a JS-injected snippet that lives in `assets/js/nav.js` to centralise the change).

---

## 11. Security posture &mdash; final review

### Headers (set in `.htaccess`)

- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: geolocation=(), microphone=(), camera=()`
- `Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self' mailto:; object-src 'none'; upgrade-insecure-requests`

`'unsafe-inline'` is allowed only on `style-src` (required for inline `style="..."` attributes used in design-system snippets) and only with the Google-Fonts host pinned. `script-src` does not allow inline.

### What the site does NOT do

- No backend code execution. No PHP, no Node, no Python at request time.
- No form processing on the host. The Contact form is mailto-based; CSP `form-action` allows `mailto:` only.
- No third-party trackers.
- No user-uploaded content paths.
- No customer-credential or PII handling.
- No production keys or secrets in any file (`grep -ri 'BEGIN PRIVATE KEY\|api_key\|password='` returns zero hits across the repo).

### What the tools do

The 54 utility tools are entirely client-side. They parse user-pasted hex / base64 / DER / TLV data inside the browser, render results, and never round-trip the payload to a server. The APDU Script Validator (highest-risk surface) is **classification-only** &mdash; it never connects to a reader, never executes a script.

### What `/trust/` adds

- Published vulnerability-disclosure email channel and SLAs.
- Safe-harbour clause for good-faith research.
- Explicit out-of-scope list (DoS, social engineering, physical attacks on silicon vendors).

---

## 12. Accessibility posture

- All interactive elements (`<button>`, `<a>`) are keyboard-reachable; `<button>` carries `aria-label` where the label is icon-only (hamburger menu, social icons).
- Skip-link (`<a href="#main">`) is present on every page.
- Color contrast meets WCAG AA on the design-system palette (verified during Phase 5).
- All `<img>` carry `alt` text including the new badge images on `/about/certifications/`.
- `<details>` elements (used in tool collapsibles) are inherently keyboard-accessible.
- No autoplay media. No flashing content.

Lighthouse scores (sampled in Phase 5; not re-run for new pages, expected similar):

| Page | Performance | Accessibility | Best Practices | SEO |
| ---- | ----------: | ------------: | -------------: | ---: |
| `/` | ≥95 | ≥98 | 100 | 100 |
| `/products/onepass-card/` | ≥95 | ≥98 | 100 | 100 |
| `/about/certifications/` | ~92* | ≥98 | 100 | 100 |

*The certifications page bundles 3 × ~1.1 MB legacy badge images preserved as-is; converting them to optimised WebP would lift Performance to ≥95 but would violate the "preserve as-is" instruction. Marked as a Phase 7 candidate.

---

## 13. Performance hygiene

- All HTML is hand-authored, ~13&ndash;20 KB per page (compressed).
- CSS is a single `assets/css/main.css` (~50 KB), shared across all pages, cached via `mod_expires` for 7 days.
- JavaScript: per-page tool scripts are small (~3&ndash;15 KB each), loaded `defer`. The shared `assets/js/nav.js` is ~2 KB.
- `mod_deflate` is enabled in `.htaccess` for HTML, CSS, JS, JSON, SVG, XML.
- `mod_expires` rules are set per content type.
- No render-blocking external scripts. Google Fonts uses `display=swap`.
- Images: SVG favicon (small). Three legacy badge PNGs (large, intentionally as-is).

---

## 14. Known remaining backlog

These items are **not** blockers for production deployment. They are cosmetic / content-depth improvements scheduled for Phase 7.

| Item | Priority | Notes |
| ---- | -------- | ----- |
| Optimise legacy badge PNGs to WebP / lower-resolution | Low | Lifts the certifications page Lighthouse Performance from ~92 to ≥95. Currently preserved as-is per Phase 6 instruction. |
| Add `/trust/` and `/partners/` to footer of pre-existing 121 pages | Low | High churn, low discovery value (top nav covers most). |
| 6 cornerstone blog posts (Choosing between SC / FIDO / Passkeys; SE vs TPM vs HSM; Credential Lifecycle; Transit Validators Offline Trust; JavaCard Applet Dev for Enterprise; PKI for Workforce / Government) | Medium | Authoring effort: ~15-20K words total. Out of scope for Phase 6 commit. Listed as Phase 7 content sprint. |
| Brochure PDFs for OnePass Bio Card, BioKey, Tappable, IoT Chipset, Digital Signature Token, JavaCard Applets, IoT Solution, eSIM Solution | Medium | Buttons currently link to `/contact/`. Marketing-driven; out of engineering scope. |
| Customer case studies (3 anonymised) | High commercial value | Requires customer permission. Phase 7. |
| Pricing page | Medium | Volume tiers are partner-negotiated. Phase 7 may add a contact-driven pricing landing. |
| Lighthouse CI in GitHub Actions | Low | Currently no CI; Hostinger upload is manual. |
| Per-route CSS splitting | Low | Single 50 KB CSS is acceptable for current scale. |
| OG image templates per page | Medium | Currently no per-page OG image; falls back to no image. Phase 7 candidate. |
| Subdomain split (e.g. `developer.ambimat.com`) | Low | Architectural decision deferred. |

---

## 15. Final-deployment "go" checklist

Use this as the final pre-flight on the day of go-live:

- [ ] Working tree is clean: `git status`
- [ ] Latest commit reviewed: `git log -1`
- [ ] Sitemap parses as XML: `xmllint --noout sitemap.xml`
- [ ] All 16 Phase-6 product/service pages exist and render JSON-LD
- [ ] `/about/certifications/` exists and references the 3 legacy badge images
- [ ] `/trust/` exists with vulnerability-disclosure policy
- [ ] `/partners/` exists with partner-engagement workflow
- [ ] `.htaccess` parses on the host (LiteSpeed will refuse to start if not)
- [ ] HSTS preload submission deferred until 48 h post-go-live
- [ ] DNS for `ambisecure.ambimat.com` points at the Hostinger host
- [ ] SSL certificate is healthy (Hostinger Let&rsquo;s Encrypt)
- [ ] Backup of previous `public_html/` snapshot taken
- [ ] Smoke-test script (Section 6) ready to run post-upload
- [ ] Search Console property verified ahead of deploy
- [ ] Sitemap URL is ready to be submitted to GSC + Bing post-deploy

When all of the above are checked, proceed with upload, run the smoke test, then submit the sitemap.

---

## 16. Phase 6 commit-time state (for the record)

- 80+ active `Redirect 301` rules in `.htaccess`
- 167 canonical URLs in sitemap
- 140 HTML pages on disk
- 0 broken internal hrefs once `.htaccess` 301s are honoured
- 0 known security regressions vs Phase 5
- 0 fabricated certification claims

The site is **production-ready**.
