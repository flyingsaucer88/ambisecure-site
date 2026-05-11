# 19. Phase 8 — Security Review

**Date:** 2026-05-11
**Scope:** Full production-grade security audit of HTML, CSS, JS, redirects, assets, and operational surfaces.
**Status:** All findings either clean, mitigated, or documented as "by-design".

---

## 1. Vulnerabilities checked

| Class | Method | Result |
|------|--------|--------|
| Cross-site scripting (XSS) via `innerHTML` | Grep + flow-trace every `innerHTML` call site in `assets/js/`. Trace every user-controlled variable (`input.value`, query parameters) to its render site and check it passes through an escape helper. | **No exposure.** Every `innerHTML` call site renders content built from numeric-validated input or hard-coded labels. The two new Phase 7 renderers (`blog-spotlight.js`, `highlight-banner.js`) escape every interpolated string via per-file `escapeHTML` / `esc` helpers. Tool parsers (54 files) accept hex / base64 / DER input, validate it, then render structured output composed of `parseInt`, `toString(16)`, and hard-coded labels — no raw input ever reaches `innerHTML`. |
| Dangerous JS (`eval`, `new Function`, `document.write`, string-form `setTimeout`/`setInterval`) | Grep across all JS. | **None found.** |
| Inline event handlers (`onclick="..."` etc.) | Grep across all HTML. | **None found.** |
| Mixed content (`http://` in HTML) | Grep across all HTML. | **None found.** |
| `target="_blank"` without `rel="noopener"` | Grep across all HTML. | **None found.** Every external `<a>` carries the existing project's noopener pattern via the `.ext` class plus `rel` attribute or there are no `target="_blank"` outbound links. |
| Open redirect / parameter-driven `location.href` | Grep across all JS. | **None found.** |
| Secrets / API keys / private keys committed | Grep across HTML / JS / CSS / MD for `BEGIN PRIVATE KEY`, `api_key`, `secret_key`, `password`, `access_token`, `aws_secret`. | **None found.** All hits are legitimate page content discussing the *concept* of passwords / API keys (not exposed values). |
| Backup / editor / temp files (`*.bak`, `*~`, `.swp`, `.DS_Store`) | Find across the repo. | **None found.** |
| Sensitive files (`.env*`, `*.key`, `id_rsa*`, `credentials*`) | Find across the repo. | **None found.** |
| Hidden admin / debug endpoints | Find on `/admin`, `/debug`, `/.well-known/` paths. | **None found.** |
| Schema injection / malformed JSON-LD | Validate every `application/ld+json` block as JSON. | **All 185 pages have parseable JSON-LD blocks** (verified in Phase 7 QA, re-verified here). |
| Redirect chains (Redirect 301 → Redirect 301) | Parse `.htaccess` and walk every destination. | **No chains.** 138 Redirect 301 rules, all single-hop. |
| Self-redirect loop risk (Redirect 301 X → X/) | Audit Phase 6 — two such rules were removed in `docs/15`. Re-verified post-Phase 7. | **None.** Anchored RedirectMatch is used where trailing-slash hygiene is needed. |
| Orphan pages (pages with no inbound internal links) | Compute graph of internal links vs filesystem. | **Zero** orphan content pages after Phase 8 fix to `/industries/`, `/solutions/`, `/technologies/` parent indices. Only `/404.html` is unreferenced (expected — it's served by Apache on error). |
| External script dependencies | Grep all `<script src="">` tags. | **None.** Every `<script>` source is same-origin under `/assets/js/`. Google Fonts is `<link rel="stylesheet">` only, never `<script>`. |
| External-domain `<img src>` / `<source>` | Grep all image-loading attributes. | **None.** All images are `/assets/img/...` (same-origin). |
| `robots.txt` / `sitemap.xml` integrity | Parse XML, inspect text. | Both valid. `robots.txt` allows everything except `/assets/raw/` (which doesn't exist). Sitemap is well-formed, 212 URLs after Phase 7, 212 after Phase 8 (unchanged). |

---

## 2. Findings & fixes

| # | Finding | Severity | Action |
|---|---------|----------|--------|
| 1 | 5 content pages (`/industries/enterprise-access/`, `/industries/smart-cities/`, `/industries/transportation/`, `/solutions/offline-authentication/`, `/technologies/ctap2/`) had no inbound internal links because the parent index pages used aspirational slugs that 301'd back to the parent. | Low (UX + SEO; not a security issue) | Rewrote parent indices to point at the actual canonical URLs. |
| 2 | The `<picture>` tag was not used for the 3 legacy badge PNGs at `/about/certifications/`, costing ~3.5 MB of unnecessary PNG payload on a single page. | Low (perf, not security) | Generated WebP variants and wrapped each `<img>` in `<picture>` with the WebP `<source>` first. 85% size reduction per badge. |
| 3 | 185 of 186 HTML pages had no `og:image` meta tag, causing default social-preview behaviour from each platform (often Facebook's grey placeholder). | Low (brand surface, not security) | Built a brand OG image set (`/assets/img/og/default.{svg,png,jpg,webp}`), then bulk-injected `og:image`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `twitter:card`, `twitter:image` meta tags into every page that has `og:title` and lacks `og:image`. |
| 4 | Analytics integration was not wired. | Low (operational, not security) | Built provider-agnostic analytics module (`assets/js/analytics.js` + `assets/js/analytics-config.js`) that defaults to `provider: "none"`. Bootstraps via `nav.js` (already on every page). Respects `Do-Not-Track` and a per-visitor opt-out flag. See `docs/20` for CSP delta required to enable. |

No **High** or **Medium** security findings were uncovered in this audit.

---

## 3. CSP compatibility review

Current `.htaccess` policy (unchanged from Phase 6):

```
Content-Security-Policy: default-src 'self';
                         script-src 'self';
                         style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
                         font-src 'self' https://fonts.gstatic.com;
                         img-src 'self' data:;
                         connect-src 'self';
                         frame-ancestors 'none';
                         base-uri 'self';
                         form-action 'self' mailto:;
                         object-src 'none';
                         upgrade-insecure-requests
```

### What is allowed today

| Directive | Allowed | Rationale |
|-----------|---------|-----------|
| `script-src 'self'` | Same-origin scripts only. | All 25+ JS files live under `/assets/js/`. No remote scripts. |
| `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com` | Same-origin + Google Fonts CSS + inline `style="..."` attributes. | Inline styles are pervasive in the design system; removing `'unsafe-inline'` would require a CSS refactor beyond Phase 8 scope. |
| `font-src 'self' https://fonts.gstatic.com` | Same-origin + Google Fonts woff2 hosts. | Required for Montserrat, Source Sans 3, JetBrains Mono. |
| `img-src 'self' data:` | Same-origin + data URIs. | Same-origin images, plus the favicon path-of-least-resistance using data URI fallback. |
| `connect-src 'self'` | Same-origin XHR / fetch. | No cross-origin fetch in the entire codebase. |
| `frame-ancestors 'none'` | Site cannot be framed. | Click-jacking protection. |
| `form-action 'self' mailto:` | Forms post to same-origin or `mailto:`. | The Contact form uses mailto. No backend form processing exists. |
| `object-src 'none'` | No `<object>`/`<embed>` allowed. | No legitimate use case. |

### What is **not** allowed (would require CSP delta)

- **Inline `<script>` blocks** — would need `script-src 'self' 'unsafe-inline'` or a CSP nonce. We do not use inline scripts.
- **GA4 / Google Tag Manager** — would need `script-src 'self' https://www.googletagmanager.com; connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com;`
- **Plausible Analytics** — would need `script-src 'self' https://plausible.io; connect-src 'self' https://plausible.io;`

Both deltas are documented in `docs/20`. The analytics module ships disabled (`provider: "none"`) so the current CSP is correct as-shipped.

---

## 4. Third-party dependency review

| Dependency | Reach | Risk profile |
|------------|-------|--------------|
| Google Fonts CSS (`fonts.googleapis.com/css2`) | `<link rel="stylesheet">` on every page. | Google-controlled; serves CSS only. CSP `style-src` pins it. If Google Fonts is unreachable, browsers fall back to system serif/sans via our `Helvetica, Arial, sans-serif` fallback chain — no broken layout. |
| Google Fonts woff2 (`fonts.gstatic.com`) | Font requests triggered by the above CSS. | Same controls; same fallback. |
| (Optional, **not shipped**) Plausible (`plausible.io/js/script.js`) | Only if `provider: "plausible"` is set. | Privacy-conscious; no cookies by default; GDPR-friendly. CSP delta documented. |
| (Optional, **not shipped**) GA4 (`googletagmanager.com/gtag/js`) | Only if `provider: "ga4"` is set. | Cookie-bearing; GDPR / cookie-banner considerations. CSP delta documented. |

No npm dependencies. No CDN-hosted JS libraries. No bundler. No build pipeline.

---

## 5. Redirect safety review

| Item | Status |
|------|--------|
| Total `Redirect 301` rules | 138 |
| Total `RedirectMatch 301` rules | 5 |
| Open redirect targets (i.e. redirecting to a user-controlled URL) | None — every target is hard-coded in `.htaccess`. |
| Redirect chains (A → B → C) | None — every destination resolves to a real page or to a domain we control (`ambimat.com`, `esim.ambimat.com`). |
| Self-redirect loops | None — verified post-Phase 7 fix. |
| Redirects to external user-controlled domains | None. External redirect targets are limited to `https://ambimat.com/` and `https://esim.ambimat.com/`, both Ambimat-owned. |
| Force-HTTPS rule | Present (`RewriteCond %{HTTPS} !=on; RewriteRule ^(.*)$ https://%{HTTP_HOST}/$1 [R=301,L]`). |
| HSTS header | Present with `max-age=31536000; includeSubDomains; preload`. |
| WordPress crawl path 410s | Present (`/wp-login.php`, `/wp-admin/...`, `/xmlrpc.php`). |

---

## 6. Analytics privacy review

The analytics module (`assets/js/analytics.js`) is **off by default** and respects:

1. `window.AS_ANALYTICS.provider === "none"` → no third-party tag loads.
2. `navigator.doNotTrack === "1"` (when `respectDoNotTrack: true`) → no third-party tag loads.
3. `localStorage["as-analytics-opt-out"] === "1"` → no third-party tag loads.

When enabled:

- **Plausible** is cookie-free by default, anonymises IP at the edge, and is operated under GDPR-friendly Czech / EU data protection. No banner is legally required in most jurisdictions if no PII is collected.
- **GA4** sets cookies and may require a cookie banner depending on jurisdiction. The module sets `anonymize_ip: true` by default.

Per-visitor opt-out helper (for the privacy page if added later):

```js
// To stop the analytics tag loading on this browser
localStorage.setItem("as-analytics-opt-out", "1");

// To re-enable
localStorage.removeItem("as-analytics-opt-out");
```

---

## 7. XSS hygiene — JS rendering audit summary

| File | Pattern | Audit |
|------|---------|-------|
| `assets/js/highlight-banner.js` | builds `html` from `pick.eyebrow`, `pick.title`, `pick.body`, `pick.primaryCta.label`, `pick.primaryCta.url`, `pick.secondaryCta?.label`, `pick.secondaryCta?.url`. Renders via `s.innerHTML = html`. | Each interpolation is wrapped in the file's `esc()` helper. Strings come from `highlight-banner-config.js`, an editor-controlled file. Confirmed safe even if the file were ever populated from a hypothetical CMS — escapeHTML is unconditional. |
| `assets/js/blog-spotlight.js` | builds `html` from `p.url`, `p.title`, `p.date`, `p.summary`, `p.categories[]`. Renders via `n.innerHTML = html`. | Each interpolation passes through `escapeHTML(...)`. Data source is `blog-pool.js`, an autogenerated trusted file. |
| `assets/js/analytics.js` | does not render HTML. Appends `<script>` to `<head>` with a URL configured in `analytics-config.js`. | URL is editor-controlled, not user-controlled. `injectScript` sets `src` via property assignment (not concatenation), so even a hostile URL string would not break out of the `src` attribute. |
| Tool parsers (`assets/js/tools/*.js`) | Each accepts hex / base64 / DER input. Validates via `^[0-9a-f]+$` (or equivalent). Parses to numbers. Renders structured output composed of `parseInt`, `toString(16)`, and hard-coded label strings. | User string never reaches `innerHTML` un-validated. The validator-failure path always renders a fixed error string via the shared `AS.renderError`. Spot-checked with a Python flow trace across all 54 tool files (`/tmp/inject-og-image.py`-style approach for variable flow): no raw-input variables reach `innerHTML` concatenation. |

---

## 8. Production hardening checklist (final)

- [x] HTTPS forced via `.htaccess` `RewriteRule`
- [x] HSTS header present, `max-age=31536000; includeSubDomains; preload`
- [x] CSP restrictive (`default-src 'self'`)
- [x] X-Content-Type-Options: nosniff
- [x] Referrer-Policy: strict-origin-when-cross-origin
- [x] Permissions-Policy: geolocation=(), microphone=(), camera=()
- [x] No inline `<script>` blocks
- [x] No inline event handlers
- [x] No `eval`, `new Function`, `document.write`
- [x] No external script sources
- [x] No mixed content
- [x] No secrets in commits
- [x] No backup / editor / temp files
- [x] No open-redirect surfaces
- [x] No redirect chains
- [x] No self-redirect loops
- [x] No orphan content pages (only `/404.html` unlinked, expected)
- [x] Custom 404 page served on missing routes
- [x] Sitemap valid XML
- [x] robots.txt valid
- [x] Analytics off by default; opt-out and DNT respected
- [x] Vulnerability disclosure channel published at `/trust/`

---

## 9. Residual risks

| Risk | Reasoning | Mitigation |
|------|-----------|------------|
| `style-src 'unsafe-inline'` | Inline `style="..."` attributes are used throughout the design system for one-off positioning. Removing them would require a large CSS refactor. | Acceptable: there is no inline `<script>` and CSS injection is far less exploitable than JS injection. Mitigations: `script-src` does not allow `'unsafe-inline'`; `object-src 'none'`; `frame-ancestors 'none'`. |
| Google Fonts dependency | If `fonts.googleapis.com` or `fonts.gstatic.com` is blocked / down, custom fonts won't load. | System font fallback chain (`Helvetica, Arial, sans-serif`) keeps the layout readable. No functional break. Future option: self-host fonts under `/assets/fonts/` and remove the external dependency. |
| Analytics opt-out is per-browser | Once enabled, a user opting out on browser A is not opted out on browser B. | Standard expectation for client-side analytics. Per-jurisdiction cookie banner (Phase 9+ if jurisdiction warrants) would consolidate consent. |
| No subresource integrity (SRI) on Google Fonts CSS link | Currently `<link href="https://fonts.googleapis.com/css2?...">` has no `integrity` attribute. | Google Fonts CSS rotates with the woff2 URLs, so SRI on the CSS link is not practical. Phase 9 candidate: self-host fonts and use SRI on those, or accept the residual risk since CSP `style-src` constrains what the loaded CSS can do. |
| Per-visitor opt-out UI | The opt-out exists at the localStorage level but there's no user-facing button. | Document the opt-out at `/trust/#analytics` when analytics is enabled. Phase 9+. |

None of the above is blocking for production.

---

## 10. Phase 9+ security backlog

| Item | Priority |
|------|----------|
| Add a user-facing analytics opt-out toggle on `/trust/` once analytics is enabled. | M (only relevant after analytics flipped on) |
| Self-host fonts and remove Google Fonts dependency. | L (eliminates a third-party origin, but small benefit) |
| Stricter CSP without `'unsafe-inline'` in `style-src` (requires CSS class refactor). | L (architectural, not exploit-driven) |
| SRI on any self-hosted assets shipped under a vendored path. | M (when bigger libraries are vendored — currently nothing fits) |
| Periodic crawl of `legacysitedata/` content vs. live site to detect content drift in archive pages. | L |
| Automated CI lint of `.htaccess` for chain / loop regressions. | M (Phase 13 candidate) |
