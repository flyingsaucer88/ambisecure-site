# 04 · SEO & Redirect Strategy

## Goals

1. **Preserve all current rankings** — no orphaned URLs, every old URL has a 301.
2. **Preserve all backlinks** — incoming links to brochure PDFs, blog posts, and product pages all redirect.
3. **Improve crawl/discovery** — flat URL hierarchy, clean canonical tags, proper sitemap and `robots.txt`.
4. **Add structured data** — `Organization`, `Product`, `BreadcrumbList`, `Article`, `FAQPage`, `SoftwareApplication` (for tools).

## Redirect map (301)

Maintain in `/.htaccess` (LiteSpeed) or via Hostinger redirect rules. Source-of-truth list (also embedded in `docs/01-audit-and-content-inventory.md`):

```
/about/                                                                     →  /about/
/about/company-overview/                                                    →  /about/#overview
/product/                                                                   →  /products/
/authenticators/                                                            →  /products/#authenticators
/ambisecure-services/                                                       →  /services/
/ambisecure-one-pass-a-multiple-application-card/                           →  /products/onepass-card/
/ambisecure-one-pass-bio-card/                                              →  /products/onepass-bio-card/
/ambisecure-usb-key/                                                        →  /products/onepass-usb-key/
/ambisecure-iot-solution/                                                   →  /products/iot-security-chipset/
/ambisecure-biokey/                                                         →  /products/biokey/
/ambisecure-tappable/                                                       →  /products/tappable/
/ambisecure-digital-signature-token/                                        →  /products/digital-signature-token/
/ambisecure-javacard-applet-enterprise-solution/                            →  /products/javacard-applets/
/ambisecure-esim-solution/                                                  →  https://esim.ambimat.com/
/products/ambisecure-security-key/                                          →  /products/onepass-usb-key/
/products/ambisecure-card/                                                  →  /products/onepass-card/
/services/java-card-development/                                            →  /services/javacard-development/
/services/ambisecure-fido-validation-server/                                →  /services/fido-validation-server/
/tool-chain-development/                                                    →  /services/tool-chain-development/
/ambisecure-bio-enrollment-app/                                             →  /services/tool-chain-development/bio-enrollment-app/
/ambisecure-security-key-manager/                                           →  /services/tool-chain-development/security-key-manager/
/ambisecure-multi-card-applet-loading-tool/                                 →  /services/tool-chain-development/multi-card-applet-loader/
/ambisecure-ndef-personalisation-tool/                                      →  /services/tool-chain-development/ndef-personalisation/
/cyber-security-threats/                                                    →  /blog/cyber-security-threats-overview/
/certification/                                                             →  /about/certifications/
/faqs/                                                                      →  /support/faqs/
/learn/ambisecure-fido-supported-services/                                  →  /blog/fido-supported-services/
/learn/how-it-work/                                                         →  /blog/how-fido-authentication-works/
/how-to-use-the-ambisecure-fido-card/                                       →  /support/guides/use-fido-card/
/blogs/                                                                     →  /blog/
/implementing-fido2-authentication-a-complete-developer-guide-by-ambisecure/ →  /blog/implementing-fido2-developer-guide/
/why-use-multi-factor-authentication-mfa/                                   →  /blog/why-use-multi-factor-authentication/
/top-3-benefits-of-multi-factor-authentication/                             →  /blog/top-3-benefits-of-mfa/
/wp-content/uploads/2023/09/Brochure-3.pdf                                  →  /assets/downloads/onepass-usb-key.pdf
/wp-content/uploads/2023/09/Brochure-4.pdf                                  →  /assets/downloads/onepass-card.pdf
/wp-content/uploads/2023/09/Brochure-5.pdf                                  →  /assets/downloads/onepass-bio-card.pdf
```

`.htaccess` snippet provided in [`/.htaccess`](../.htaccess) — uses `Redirect 301` lines for one-shot maps and `RedirectMatch` where there's a slug pattern.

## Canonical strategy

- Every page emits `<link rel="canonical" href="https://ambisecure.ambimat.com/...">` — absolute URL, trailing slash matches the directory-style URLs.
- Pagination on `/blog/` uses `rel="next"` / `rel="prev"`.
- Cross-property pages (eSIM detail) link with `rel="canonical"` pointing to `esim.ambimat.com` so AmbiSecure stub pages don't compete.

## Schema markup (JSON-LD)

Embedded inline at the bottom of each page in a `<script type="application/ld+json">` block.

| Page type | Schema |
|---|---|
| Site-wide (in `<head>` of every page) | `Organization` + `WebSite` with `SearchAction` |
| Home | + `BreadcrumbList` |
| Product detail | `Product` + `Offer` (price on request) + `BreadcrumbList` |
| Service detail | `Service` + `BreadcrumbList` |
| Blog post | `Article` + `BreadcrumbList` |
| Blog index | `Blog` |
| Tool / utility page | `SoftwareApplication` (applicationCategory: `DeveloperApplication`, offers: `Offer` with `price: "0"`) |
| FAQ page | `FAQPage` |
| About / Certifications | `Organization` extended with `award` / `hasCredential` |

## Sitemap

`/sitemap.xml` — XML sitemap, auto-generated at build (or hand-maintained). Submitted to Google Search Console and Bing Webmaster Tools.
Tool pages get priority 0.6 (high refresh-utility but secondary), product pages 0.9, home 1.0, blog posts 0.7, services 0.8.

`/sitemap-index.xml` — wraps `sitemap.xml` and (later) `sitemap-blog.xml` once blog grows past ~50 posts.

## robots.txt

```
User-agent: *
Allow: /
Disallow: /assets/raw/
Disallow: /search?
Sitemap: https://ambisecure.ambimat.com/sitemap.xml
```

No `Disallow: /` — we want indexing. We do block search-result URLs and any raw-asset folder used for working files.

## Open Graph & Twitter cards

Every page emits:
- `og:type` (website / product / article)
- `og:title`, `og:description`, `og:url`, `og:image` (absolute)
- `og:site_name` = "AmbiSecure"
- `twitter:card` = `summary_large_image`
- `twitter:title`, `twitter:description`, `twitter:image`

OG image strategy: each section (Products / Tools / Blog) has a templated OG image in `/assets/og/` (1200×630). For Phase 1 we ship one default and can per-page later.

## Technical SEO

- Pre-rendered static HTML — no client-side render delay.
- Inline critical CSS in `<head>` for above-the-fold (hero + nav). Defer the rest.
- `loading="lazy"` on all images below the fold; `width`/`height` declared.
- WebP/AVIF for product hero images, with PNG fallback via `<picture>`.
- HTTP/2, HSTS, `upgrade-insecure-requests` (already on Hostinger).
- CSP: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none';` — same as eSIM site.
- No render-blocking JS — every utility tool is `defer`ed and runs only on its own page.

## Lighthouse target

Performance ≥ 95 · Accessibility ≥ 95 · Best Practices ≥ 100 · SEO ≥ 100 — feasible because the site is static HTML, ~one Google Fonts request, no analytics in Phase 1, no SPA bundle.

## Analytics

Phase 1: defer. Phase 2: add **Plausible** (`plausible.io`, lightweight, no cookies, GDPR-friendly). Avoid GA4 to keep CSP tight and Lighthouse high. Optionally add a small server-log-based dashboard via Hostinger's built-ins.
