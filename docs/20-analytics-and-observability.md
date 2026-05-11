# 20. Analytics & Observability

**Date:** 2026-05-11
**Status:** Module shipped, disabled by default. Two providers supported. CSP deltas documented.

---

## 1. Architecture

Two-file module, no build step, no backend:

```
assets/js/analytics-config.js   -- editor-controlled config (provider, IDs)
assets/js/analytics.js          -- loader (reads config, injects provider snippet)
```

Bootstrapped from `assets/js/nav.js`, which already runs on every page. Adding the bootstrap there means new pages get analytics automatically with no template touch.

```js
// nav.js
(function loadAnalytics() {
  var configScript = document.createElement('script');
  configScript.src = '/assets/js/analytics-config.js';
  configScript.defer = true;
  configScript.onload = function () {
    var loader = document.createElement('script');
    loader.src = '/assets/js/analytics.js';
    loader.defer = true;
    document.head.appendChild(loader);
  };
  document.head.appendChild(configScript);
})();
```

This runs **after** `nav.js` evaluates (which is itself `defer`'d), so analytics is fully out of the critical path.

---

## 2. Provider toggle

`analytics-config.js`:

```js
window.AS_ANALYTICS = {
  provider: "none",  // "none" | "plausible" | "ga4"

  plausible: {
    domain: "ambisecure.ambimat.com",
    scriptSrc: "https://plausible.io/js/script.js"
  },
  ga4: {
    measurementId: "G-XXXXXXXXXX",
    anonymizeIp: true
  },

  respectDoNotTrack: true,
  optOutLocalStorageKey: "as-analytics-opt-out"
};
```

Edit this file to enable analytics. **No template, no other file, needs to change.**

---

## 3. Recommended provider: Plausible

| Reason | Detail |
|--------|--------|
| Privacy posture | No cookies, no PII, GDPR-compliant in EU. Most jurisdictions do not require a banner. |
| Footprint | ~1 KB script, single connection to `plausible.io`. |
| CSP delta | Minimal (one origin in `script-src` + `connect-src`). |
| Cost / control | Self-hostable option exists (`https://plausible.io/docs/self-hosting`) if data residency is a concern. |
| Lighthouse impact | Negligible. Plausible loads after `DOMContentLoaded` via `defer`. |

GA4 is supported as a fallback for organisations standardised on Google's analytics stack.

---

## 4. CSP delta — Plausible

Current CSP in `.htaccess`:

```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self' mailto:; object-src 'none'; upgrade-insecure-requests
```

When enabling Plausible, replace with:

```
Content-Security-Policy: default-src 'self'; script-src 'self' https://plausible.io; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' https://plausible.io; frame-ancestors 'none'; base-uri 'self'; form-action 'self' mailto:; object-src 'none'; upgrade-insecure-requests
```

Two changes:

1. `script-src 'self'` → `script-src 'self' https://plausible.io`
2. `connect-src 'self'` → `connect-src 'self' https://plausible.io`

If you choose the extension `script.outbound-links.file-downloads.js`, the same two changes apply (same origin).

Smoke-test after the change:

```sh
curl -sIo /dev/null -w "%{http_code}\n" https://ambisecure.ambimat.com/
# Then open browser DevTools -> Network tab and verify:
#   - GET https://plausible.io/js/script.js   200
#   - POST https://plausible.io/api/event     202
# Then DevTools -> Console: no CSP violations.
```

---

## 5. CSP delta — GA4

When enabling GA4, replace with:

```
Content-Security-Policy: default-src 'self'; script-src 'self' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://*.google-analytics.com https://*.googletagmanager.com; connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self' mailto:; object-src 'none'; upgrade-insecure-requests
```

Three changes:

1. `script-src 'self'` → `script-src 'self' https://www.googletagmanager.com`
2. `img-src 'self' data:` → `img-src 'self' data: https://*.google-analytics.com https://*.googletagmanager.com`
3. `connect-src 'self'` → `connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com`

GA4 issues image-pixel beacons in addition to fetch beacons, hence the `img-src` change.

> **Cookies + GDPR.** GA4 sets first-party cookies. If your visitor base is materially EU/UK, a cookie banner is recommended. AmbiSecure does not currently ship a banner; the visitor-side opt-out flag (`localStorage["as-analytics-opt-out"] = "1"`) is the minimum opt-out path.

---

## 6. Privacy controls implemented

| Control | Status |
|---------|--------|
| Provider off by default | ✓ (`provider: "none"`) |
| Do-Not-Track respected | ✓ (`respectDoNotTrack: true`) |
| Per-visitor opt-out via localStorage | ✓ (`localStorage["as-analytics-opt-out"] = "1"`) |
| IP anonymisation for GA4 | ✓ (`anonymize_ip: true`) |
| No third-party cookies on Plausible path | ✓ (Plausible is cookie-free) |
| Vulnerability-disclosure channel | ✓ (published at `/trust/`) |

---

## 7. Event-tracking opportunities

Once analytics is enabled, the following events would be useful to track for commercial conversion analysis. None require additional pages — they are JS hooks attached to existing buttons.

| Event | Where to fire | Useful for |
|-------|---------------|-----------|
| `cta_contact_click` | `<a href="/contact/">` clicks across the site (`addEventListener` on the document, delegated). | Conversion-funnel reporting per page surface. |
| `cta_pilot_request` | Specifically the "Request a pilot" buttons on product pages. | Highest-intent CTA tracking. |
| `cta_partner_inquiry` | The "Start a partner conversation" button on `/partners/`. | Partner-pipeline tracking. |
| `download_brochure` | Outbound clicks to `/assets/downloads/*.pdf` (when brochures ship). | Asset-engagement tracking. |
| `tool_used` | Tool-page `runs > 0` (counter inside the tool JS, then a single Plausible custom event per session). | Tool-utility insight without per-keystroke tracking. |
| `blog_archive_view` | Per archive-page view, as a custom event so modern vs archive consumption is comparable. | Archive ROI signal. |
| `category_filter_click` | `<a href="/blog/categories/X/">` clicks. | Topical interest tracking. |

Plausible custom events:

```js
if (window.plausible) {
  window.plausible("CTA Contact Click", { props: { surface: "footer" } });
}
```

GA4 custom events:

```js
if (window.gtag) {
  window.gtag("event", "cta_contact_click", { surface: "footer" });
}
```

These hooks are **not** wired up in Phase 8 — they belong in Phase 9 once analytics is enabled. The hook surface is uniform across both providers, so the per-event code is the same line.

---

## 8. Observability (server-side)

Out of scope for Phase 8 (we have no backend). Server-side log access is provided by Hostinger's control panel for:

- access logs (request count, status codes, referer)
- error logs (404s and 500s)

Recommended periodic checks:

- Weekly: 404 rate. If a non-trivial set of 404s share a path pattern, add a `Redirect 301` to `.htaccess`.
- Monthly: bandwidth + request totals (capacity planning).
- After a deploy: error-log diff (catches any LiteSpeed `.htaccess` parse error or misconfigured MIME type).

---

## 9. Future observability backlog

| Item | Priority | Notes |
|------|----------|-------|
| Server-side log shipping (Hostinger → ELK / Loki / Plausible) | M | Useful for SOC-style review once site traffic is non-trivial. Hostinger does not natively ship logs; would need a cron + scp / rsync to a log host. |
| Real-user-monitoring (RUM) for Core Web Vitals | M | Lighthouse-style metrics from the real visitor population. Web Vitals JS (~1.5 KB) can ship into the analytics module. |
| Uptime monitoring | H | Free options: StatusCake, UptimeRobot. Single HTTPS check on `/` every 5 min. |
| Email alerting on cert expiry | H | Hostinger auto-renews Let's Encrypt, but external alerting is still useful. |
| Search Console + Bing Webmaster onboarding | H | Already documented in `docs/13` §9. |
| Lighthouse-CI in GitHub Actions | M | Phase 13 candidate (`docs/18`). |

None implemented in Phase 8. Listed for Phase 9+.

---

## 10. Operating the analytics module

| Task | Steps |
|------|-------|
| Turn analytics on (Plausible) | 1. Edit `assets/js/analytics-config.js`, set `provider: "plausible"`. 2. Update `.htaccess` CSP per §4. 3. Upload both files. 4. Run smoke test. |
| Turn analytics on (GA4) | 1. Edit `assets/js/analytics-config.js`, set `provider: "ga4"` and the `measurementId`. 2. Update `.htaccess` CSP per §5. 3. Upload both files. 4. Run smoke test. |
| Turn analytics off | 1. Edit `assets/js/analytics-config.js`, set `provider: "none"`. 2. Optionally revert CSP. 3. Upload. |
| Swap providers | Same as turn-on for the new provider; CSP change is part of the swap. |
| Add a custom event | Page-specific JS (or a delegated listener in `nav.js`) calls `window.plausible(...)` or `window.gtag(...)` after analytics has loaded. |
| Document the opt-out for visitors | When analytics ships on, add a short paragraph to `/trust/` (or a new `/privacy/` page) explaining how to set the localStorage flag. |
