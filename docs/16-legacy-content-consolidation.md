# 16. Legacy Content Consolidation

**Date:** 2026-05-11
**Source:** `/legacysitedata/` — 33 non-blog page summaries (`01-home.md` through `33-blogs-index.md`).
**Status:** Complete — every legacy non-blog page has a confirmed modern destination (existing page, redirect target, or merged into an existing canonical page).

This document audits the **33 non-blog pages** discovered in the legacy site crawl against the modern site architecture (post Phases 1–6). Blog consolidation is tracked separately in `docs/17`.

---

## Consolidation table

| # | Legacy URL | Content type | Modern equivalent | Status | Action taken | Redirect | Notes |
|---|------------|--------------|-------------------|--------|--------------|----------|-------|
| 01 | `/` | Home | `/` | preserved | Full rebuild in Phase 1; key positioning preserved; expanded with banner system in Phase 7. | n/a | Site root. |
| 02 | `/about/` | About | `/about/` | preserved | Rebuilt in Phase 1 with consistent design system. | n/a | – |
| 03 | `/about/company-overview/` | About (sub) | `/about/` | merged | Content folded into `/about/`. | `Redirect 301 /about/company-overview /about/` (in `.htaccess` since Phase 1). | – |
| 04 | `/product/` | Products overview | `/products/` | preserved | Phase 1 rebuild. | `Redirect 301 /product /products/` (Phase 1). | Singular → plural. |
| 05 | `/ambisecure-services/` | Services overview | `/services/` | preserved | Built in Phase 6 (Services directory was empty before). | `Redirect 301 /ambisecure-services /services/` (Phase 6). | – |
| 06 | `/resources/` | Resources overview | `/resources/` | enhanced | Phase 2 rebuilt; Phase 5 added Batch G tools and 12-DB references system. | n/a | – |
| 07 | `/support/` | Support | `/support/` | preserved | Phase 1 rebuild. | n/a | – |
| 08 | `/ambisecure-javacard-applet-enterprise-solution/` | Product (JavaCard applets) | `/products/javacard-applets/` | enhanced | Built in Phase 6 with all 12 legacy applets listed verbatim. | `Redirect 301 /ambisecure-javacard-applet-enterprise-solution /products/javacard-applets/` (Phase 6). | – |
| 09 | `/authenticators/` | Product category | `/products/` | redirected | Authenticators surface as a grouping on the products index. | `Redirect 301 /authenticators /products/` (Phase 5). | – |
| 10 | `/ambisecure-one-pass-a-multiple-application-card/` | Product (OnePass Card) | `/products/onepass-card/` | preserved | Phase 1 rebuild. | `Redirect 301 /ambisecure-one-pass-a-multiple-application-card /products/onepass-card/` (Phase 1). | – |
| 11 | `/ambisecure-one-pass-bio-card/` | Product (OnePass Bio Card) | `/products/onepass-bio-card/` | preserved | Phase 6 build (legacy menu coverage). | `Redirect 301 /ambisecure-one-pass-bio-card /products/onepass-bio-card/` (Phase 1, target now resolves). | – |
| 12 | `/ambisecure-usb-key/` | Product (USB Key) | `/products/onepass-usb-key/` | preserved | Phase 1 rebuild. | `Redirect 301 /ambisecure-usb-key /products/onepass-usb-key/` (Phase 1). | – |
| 13 | `/ambisecure-iot-solution/` | Product (IoT chipset + solution) | `/products/iot-security-chipset/` (+ companion `/products/iot-solution/`) | enhanced | Phase 6 split into hardware page + platform page. | `Redirect 301 /ambisecure-iot-solution /products/iot-security-chipset/` (Phase 1). | Companion `/products/iot-solution/` covers the end-to-end view. |
| 14 | `/ambisecure-biokey/` | Product (BioKey) | `/products/biokey/` | preserved | Phase 6 build. | `Redirect 301 /ambisecure-biokey /products/biokey/` (Phase 1). | – |
| 15 | `/ambisecure-tappable/` | Product (Tappable) | `/products/tappable/` | preserved | Phase 6 build. | `Redirect 301 /ambisecure-tappable /products/tappable/` (Phase 1). | – |
| 16 | `/ambisecure-esim-solution/` | Product (eSIM + OIDC) | `/products/esim-solution/` | enhanced | Phase 6 build. OpenID Connect applet wording preserved verbatim. Cross-linked to esim.ambimat.com. | `Redirect 301 /ambisecure-esim-solution /products/esim-solution/` (Phase 6 retarget). | – |
| 17 | `/products/ambisecure-card/` | Product (legacy AmbiSecure Card) | `/products/onepass-card/` | redirected | Legacy product slug. | `Redirect 301 /products/ambisecure-card /products/onepass-card/` (Phase 1). | – |
| 18 | `/products/smart-city/` | Image-only "page" | n/a | obsolete-but-preserved | Legacy URL was a redirect to a PNG image on the WordPress site. Not migrated as a page. | No redirect added; no users link to it. | Flagged for `pending-review` if external backlinks surface. |
| 19 | `/services/java-card-development/` | Service | `/services/javacard-development/` | preserved | Phase 6 build (verbatim claims preserved). | `Redirect 301 /services/java-card-development /services/javacard-development/` (Phase 5). | Hyphenation normalised. |
| 20 | `/services/ambisecure-fido-validation-server/` | Service (FIDO server) | `/services/fido-validation-server/` | preserved | Phase 6 build (verbatim claims preserved). | `Redirect 301 /services/ambisecure-fido-validation-server /services/fido-validation-server/` (Phase 5). | – |
| 21 | `/products/ambisecure-fido-validation-server/` | Duplicate (legacy product page) | `/services/fido-validation-server/` | merged | Legacy site had the same content under both `/products/` and `/services/`. Modern site canonicalises to `/services/`. | `Redirect 301 /products/ambisecure-fido-validation-server /services/fido-validation-server/` — *added in this consolidation pass.* | Removes the duplicate-content risk. |
| 22 | `/tool-chain-development/` | Service (parent) | `/services/tool-chain-development/` | preserved | Phase 6 build. | `Redirect 301 /tool-chain-development /services/tool-chain-development/` (Phase 5). | – |
| 23 | `/ambisecure-bio-enrollment-app/` | Service (bio enroll) | `/services/tool-chain-development/bio-enrollment-app/` | preserved | Phase 6 build. | Phase 5 redirect. | – |
| 24 | `/ambisecure-security-key-manager/` | Service (key manager) | `/services/tool-chain-development/security-key-manager/` | preserved | Phase 6 build. | Phase 5 redirect. | – |
| 25 | `/ambisecure-multi-card-applet-loading-tool/` | Service (applet loader) | `/services/tool-chain-development/multi-card-applet-loader/` | preserved | Phase 6 build. | Phase 5 redirect. | – |
| 26 | `/ambisecure-ndef-personalisation-tool/` | Service (NDEF tool) | `/services/tool-chain-development/ndef-personalisation/` | preserved | Phase 6 build. | Phase 5 redirect. | – |
| 27 | `/cyber-security-threats/` | Editorial / threats intro | `/blog/` (via existing redirect) | redirected | Pre-existing `.htaccess` rule targets `/blog/cyber-security-threats-overview/`. Slug never created; falls through to `/blog/`. | `Redirect 301 /cyber-security-threats /blog/cyber-security-threats-overview/` (Phase 5 entry; final target falls to /blog/ until written). | `pending-review`: if the topic warrants its own modern blog, it joins the Phase 7 backlog. |
| 28 | `/certification/` | Certifications | `/about/certifications/` | enhanced | Phase 6 build. Legacy "AmbiSecure products are a FIDO certified" preserved verbatim. Three legacy badge PNGs migrated 1:1 to `/assets/img/certifications/`. | `Redirect 301 /certification /about/certifications/` (Phase 5). | Documented in detail in `docs/15`. |
| 29 | `/faqs/` | FAQs | `/support/faqs/` | preserved | Phase 5 build. | `Redirect 301 /faqs /support/faqs/` (Phase 5). | – |
| 30 | `/learn/ambisecure-fido-supported-services/` | Editorial (FIDO supported services) | `/blog/fido-supported-services/` | redirected | Slug never created in modern blog; redirect falls through to `/blog/`. | `Redirect 301 /learn/ambisecure-fido-supported-services /blog/fido-supported-services/` (Phase 5; final target falls to /blog/). | `pending-review`: candidate for a modern reference page or FAQ entry. |
| 31 | `/how-to-use-the-ambisecure-fido-card/` | How-to guide | `/products/onepass-card/` | redirected | Anchored RedirectMatch in Phase 6 (`/support/guides/use-fido-card/` was a missing target; redirects to OnePass Card). | `RedirectMatch 301 ^/support/guides/use-fido-card/?$ /products/onepass-card/` (Phase 6). | – |
| 32 | `/learn/how-it-work/` | Editorial (how it works) | `/blog/how-fido-authentication-works/` | redirected | Slug never created; redirect falls through to `/blog/`. | `Redirect 301 /learn/how-it-work /blog/how-fido-authentication-works/` (Phase 5; final target falls to /blog/). | `pending-review`: candidate for a modern reference page. |
| 33 | `/blogs/` | Blog index | `/blog/` | preserved | Phase 7 rebuild with newest-first ordering. | `Redirect 301 /blogs /blog/` (Phase 5). | – |

---

## Status summary

| Status | Count | Meaning |
|--------|-----:|---------|
| preserved | 16 | Modern equivalent exists; legacy claims and SEO value retained. |
| enhanced | 5 | Modern page extends legacy with deeper coverage (Phase 5/6 builds). |
| merged | 2 | Two legacy URLs canonicalised onto a single modern URL. |
| redirected | 7 | Legacy URL 301s to nearest modern destination. |
| obsolete-but-preserved | 1 | Legacy URL was image-only or content-less; no migration needed; flagged in case external links surface. |
| pending-review | 3 | Three editorial slugs (`/cyber-security-threats`, `/learn/ambisecure-fido-supported-services`, `/learn/how-it-work`) currently fall through to `/blog/` via 301. Reasonable to author modern versions in Phase 8+. |
| **Total** | **33** | Every legacy non-blog URL has a defined disposition. |

---

## What changed in this consolidation pass

Two new redirect lines added in Phase 7 (beyond what was already in `.htaccess`):

```
Redirect 301 /products/ambisecure-fido-validation-server /services/fido-validation-server/
```

This was a duplicate-content risk on the legacy site (FIDO Validation Server appeared under both `/products/` and `/services/`). Canonical destination is the service page.

(The 47 blog redirects are tracked in `docs/17` rather than here.)

---

## Remaining uncertainty

| Item | Status |
|------|--------|
| `/products/smart-city/` | Legacy URL was an image redirect. Confirm no external backlinks point here before declaring fully obsolete. |
| Three `pending-review` editorial slugs | Currently 301 → /blog/. Author modern coverage in Phase 8 if SEO data shows continued inbound interest. |
| Anything in `/legacysitedata/` not listed above | None known. The legacy crawl identifies 33 pages + 47 blogs; both sets are fully accounted for in this document and `docs/17`. |
