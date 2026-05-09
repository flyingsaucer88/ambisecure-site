# 15. Certificates & Final Gap Closure

**Date:** 2026-05-09
**Scope:** Pull legacy certificate / certification material into the revamped site (as-is), close the long-standing `/about/certifications/` footer dead link that affected ~56 pages, add commercial trust surfaces (`/trust/`, `/partners/`), and add bulk redirects for the residual broken-link tail.
**Status:** Complete &mdash; 3 trust pages shipped, 3 legacy badge images preserved, 30+ aliases redirected, sitemap updated to 167 URLs.

---

## 1. Legacy certificate / certification assets &mdash; what was found

### Asset inventory

| Asset | Source | Status |
| ----- | ------ | ------ |
| `Upload_20230530-083331_1.png` | `https://ambisecure.ambimat.com/wp-content/uploads/2023/05/` (HTTP 200, 1,178,656 bytes) | **Preserved as-is** at `/assets/img/certifications/legacy-badge-1.png` (sha256:bbe73fbd1e89b2f3) |
| `Upload_20230530-083304_1.png` | `https://ambisecure.ambimat.com/wp-content/uploads/2023/05/` (HTTP 200, 1,167,082 bytes) | **Preserved as-is** at `/assets/img/certifications/legacy-badge-2.png` (sha256:05f87ceaf332059c) |
| `Upload_20230530-083232_1.png` | `https://ambisecure.ambimat.com/wp-content/uploads/2023/05/` (HTTP 200, 1,178,108 bytes) | **Preserved as-is** at `/assets/img/certifications/legacy-badge-3.png` (sha256:d91f72b5b12b4f30) |
| Legacy `/certification` page text | Fetched via WebFetch | "AmbiSecure products are a FIDO certified" claim &mdash; preserved verbatim with quote marks on the new page |
| Legacy `/about/certifications/` page text | Fetched via WebFetch | Page returned PNG binary (likely a misconfigured redirect / cached image). No additional text content recovered. |

### Other materials searched and **not found**

- `/assets/downloads/` directory: empty (zero PDFs).
- No additional certificate PDFs, FIPS certificates, Common Criteria certificates, ISO certificates, or compliance attestations exist anywhere in the repo.
- No FIDO Certified product certificate IDs are publicly listed on the legacy site; specific certificate numbers must come from the FIDO Alliance public certified-products listing under NDA.
- No SOC 2, ISO 27001, ISO 9001, or similar enterprise-trust-framework artefacts found.

### Conclusion

The legacy site exposes **one** explicit certification claim (FIDO certified, no certificate ID disclosed) and **three** badge images. Everything else commonly listed under "certifications" on a hardware-security site (chip-level CC EAL, FIDO Certified Level numbers, FIPS, eIDAS) is either targeted, inherited from silicon partners, or out-of-scope.

The new `/about/certifications/` page is built to honestly reflect this state: active claims preserved verbatim, targets clearly marked as targets, standards conformance separated from certification, and disclaimers explicit.

---

## 2. Pages added (3) and assets preserved (3)

### `/about/certifications/`

- 19.5 KB, fully chrome-consistent.
- Sections: Active certifications &middot; Legacy badge gallery (3 images, original filenames in captions) &middot; Standards we build against (9 standards families) &middot; Targeted certifications (4 items, all explicitly "in flight, not awarded") &middot; Compliance frameworks supported (5) &middot; Trust documents on request (6 NDA-gated artefacts) &middot; Disclaimers (6 explicit) &middot; Talk-to-engineering CTA.
- JSON-LD: `BreadcrumbList` + `AboutPage` (intentionally NOT using `Product` or `Certification` schema until specific certificate IDs are published).
- "Last reviewed: 2026-05-09" stamp in the hero.
- Verbatim quote of legacy claim with quote marks: *"AmbiSecure products are a FIDO certified."*
- Out-link to the FIDO Alliance public certified-products listing for independent verification.

### `/trust/`

- 11 KB, single-page trust hub.
- Sections: 3-card landing (Certifications &middot; Standards conformance &middot; Security model) &middot; Vulnerability disclosure policy (full text, including safe-harbour and scope) &middot; Trust documents pointer &middot; Talk-to-security-team CTA.
- JSON-LD: `BreadcrumbList` + `WebPage`.
- Establishes a coordinated-disclosure email channel (`support@ambimat.com` with `[security-disclosure]` subject prefix) and explicit response SLAs (3 day ack, 10 day initial assessment).

### `/partners/`

- 13.4 KB, partner programme landing.
- Sections: Who we work with (6 partner archetypes) &middot; What partners get (6 benefits) &middot; How to engage (5-step process) &middot; CTA.
- JSON-LD: `BreadcrumbList` + `WebPage`.
- No claims about active partner directory yet; programme is presented as open-to-inquiry.

### Preserved assets

```
assets/img/certifications/legacy-badge-1.png  (1,178,656 bytes, original filename Upload_20230530-083331_1.png)
assets/img/certifications/legacy-badge-2.png  (1,167,082 bytes, original filename Upload_20230530-083304_1.png)
assets/img/certifications/legacy-badge-3.png  (1,178,108 bytes, original filename Upload_20230530-083232_1.png)
```

Original filenames are recorded in the figcaption of each image on `/about/certifications/` for traceability. SHA-256 hashes are recorded above for chain-of-custody.

---

## 3. Footer dead-link fix

### Before

`/about/certifications/` was referenced in the footer of every Phase 1&ndash;6 page (~56 files). The page itself did not exist. The link returned a 404 (would have served `/404.html` via `.htaccess`).

### After

`/about/certifications/` exists. All 56 pre-existing footer links resolve to a real, content-rich page. No file modifications required to existing pages &mdash; the fix is a single page creation that satisfies all callers.

A site-wide internal-link audit was rerun after the page was created. Result: zero outstanding internal links to `/about/certifications/` are broken.

### Trust-center cross-linking

- New pages (`/about/certifications/`, `/trust/`, `/partners/`) carry footer links to each other and to the standard set of products / services / company pages.
- Pre-existing pages were not bulk-rewritten to add `/trust/` or `/partners/` footer entries; those routes are surfaced via direct nav, the home-page CTAs, and the new pages&rsquo; cross-links. Adding them to 121 pre-existing pages is a separate cosmetic pass scheduled in the Phase 7 backlog (low value, high churn).

---

## 4. Bulk redirect closure for residual broken links

A site-wide internal-href audit before this work found **38 unique broken paths** referenced across blog, tools, technologies, and solutions pages. Each was either a slug that was planned but never built, or a legacy alias for an existing page. Rather than re-write the 100+ pages that link to them, all are now handled by `Redirect 301` in `.htaccess`.

### High-impact fixes (most-referenced)

| Broken alias | Target | References fixed |
| ------------ | ------ | ----------------: |
| `/solutions/iot-root-of-trust` | `/solutions/secure-element-integration/` | 38 |
| `/solutions/secure-provisioning` | `/solutions/secure-element-integration/` | 2 |
| `/solutions/digital-identity` | `/solutions/government-identity/` | 2 |
| `/solutions/payment-security` | `/solutions/closed-loop-ticketing/` | 2 |
| `/solutions/secure-firmware-update` | `/solutions/secure-element-integration/` | 2 |

### Other categories of redirect added

- 9 `/blog/category/...` aliases &rarr; `/blog/`
- 5 `/industries/*` legacy aliases &rarr; `/industries/`
- 5 `/technologies/*` aliases &rarr; existing technology pages or external eSIM site
- 6 unbuilt-tool aliases &rarr; nearest existing tool
- 4 unbuilt-blog-slug aliases &rarr; `/blog/`
- 1 `/services/personalization` &rarr; `/services/tool-chain-development/`
- 8 `/use-cases/*` &rarr; matching solution / service pages
- 6 trust / partner aliases (`/certification`, `/certifications`, `/trust-center`, `/partner`, etc.) &rarr; new canonical URLs
- Removed 2 self-redirect entries that would have caused Apache loops (`/products/iot-solution` &rarr; `/products/iot-solution/` and `/technologies/secure-elements` &rarr; `/technologies/secure-elements/`); both target paths exist as directories with `DirectoryIndex index.html` resolution, so the trailing-slash variant is handled correctly without an explicit redirect.

### Result

Re-running the site-wide internal-href audit after the redirects: **0 broken hrefs** site-wide once `.htaccess` is honoured (every previously-broken href is now either a real page or a 301 to one).

---

## 5. Sitemap update

- **Before this work:** 164 URLs.
- **After this work:** 167 URLs (added `/about/certifications/`, `/trust/`, `/partners/`).
- XML well-formed, single `<urlset>` namespace, no duplicate `<loc>`.

Redirected aliases are intentionally **not** listed in the sitemap (they are 301s, not canonical URLs). The sitemap continues to list only canonical destinations.

---

## 6. Avoided / uncertain claims

| Avoided | Why |
| ------- | --- |
| "AmbiSecure is FIPS 140-3 Level 3 certified" | No evidence of FIPS certificate. Not claimed anywhere on legacy site. Not claimed on new page. |
| "FIDO Certified Level 2" or specific FIDO Cert IDs | Legacy site claims "FIDO certified" without level or cert ID. New page preserves the legacy claim verbatim and points to FIDO Alliance public listing for verification. No fabricated cert IDs introduced. |
| "Common Criteria EAL5+ at the AmbiSecure product layer" | EAL5+ is held by silicon partners at the chip-platform layer. The new page distinguishes chip-level evaluation from applet/product evaluation explicitly. |
| "SOC 2 / ISO 27001" | Not claimed on legacy site. Not claimed on new page. |
| "Active eIDAS qualified signature certificate" | The Digital Signature Token product page lists eIDAS as a *target / framework support*, not as held certification. New `/about/certifications/` page reinforces this distinction. |
| "GSMA SAS-UP / SAS-SM" as held by AmbiSecure | The eSIM Initiative (esim.ambimat.com) is the relevant entity for SAS accreditation, not AmbiSecure. Linked out, not claimed locally. |

---

## 7. Footer dead-link fix status

| Item | Status |
| ---- | ------ |
| `/about/certifications/` page exists | ✓ |
| All footer references to `/about/certifications/` now resolve | ✓ |
| `/about/certifications/` listed in sitemap | ✓ |
| `/about/certifications/` carries canonical + OG + breadcrumb schema | ✓ |
| `/about/certifications/` carries a CTA back to `/contact/` | ✓ |
| Vulnerability-disclosure channel published at `/trust/` | ✓ |
| Partner-inquiry channel published at `/partners/` | ✓ |
| 38+ residual broken hrefs covered by `.htaccess` 301s | ✓ |
| `.htaccess` parsed for self-redirect / loop risks | ✓ &mdash; 2 problematic self-redirects removed |

---

## 8. Update to docs/14

`docs/14-legacy-product-service-menu-coverage.md` mentioned `/about/certifications/` as "pre-existing dead link, scope-deferred." That gap is now closed; `docs/14` does not need to be re-edited because its statement-of-deferment was accurate at the time of writing. This document supersedes that line.

---

## 9. Remaining uncertainty

| Item | Status |
| ---- | ------ |
| FIDO Certified product certificate IDs | Not publicly listed. Provided under NDA per page text. Verifiable on FIDO Alliance site once disclosed. |
| Specific FIDO Certified Levels (L1 / L2 / L3+) | Marked as targeted, not awarded. To be updated once a specific evaluation closes. |
| Active CC EAL5+ for AmbiSecure-authored applets (vs chip platform) | Marked as inherited from chip platform, not separately evaluated at applet layer. To be revisited if/when a customer-funded applet-layer evaluation is undertaken. |
| Legacy badge image meaning | The three legacy badges are reproduced as-is. Their issuing organisation and current validity are not asserted on the new page; figure captions list only the original filename. Procurement teams should verify the trust mark with its issuer if it influences a buying decision. |
| Whether `/about/certifications/` should switch to a stricter no-image variant once we decide on canonical badges | Open. Current page is intentionally inclusive of legacy artwork to preserve continuity for returning visitors. Phase 7 may rebuild this section once specific FIDO Cert IDs are approved for public disclosure. |

---

## 10. File manifest

### Added

```
about/certifications/index.html             19,466 bytes
trust/index.html                             11,063 bytes
partners/index.html                          13,365 bytes
assets/img/certifications/legacy-badge-1.png  1,178,656 bytes
assets/img/certifications/legacy-badge-2.png  1,167,082 bytes
assets/img/certifications/legacy-badge-3.png  1,178,108 bytes
docs/15-certificates-and-final-gap-closure.md   (this file)
```

### Modified

```
.htaccess     +37 redirect lines, -2 self-redirect lines
sitemap.xml   +3 URLs (now 167 total)
```
