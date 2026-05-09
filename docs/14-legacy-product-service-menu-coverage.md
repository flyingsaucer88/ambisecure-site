# 14. Legacy Product & Service Menu Coverage Audit

**Date:** 2026-05-09
**Scope:** Verify zero information loss for every Product and Services menu item from the legacy AmbiSecure WordPress site (`https://ambisecure.ambimat.com/`).
**Status:** Complete &mdash; 16 new pages shipped, 11 redirects added/refined, sitemap & navigation updated.

---

## 1. Coverage table

| Legacy Menu Item | Legacy URL | Legacy Category | New URL | Status | Action Taken | Redirect Needed | Notes |
| ---------------- | ---------- | --------------- | ------- | ------ | ------------ | --------------- | ----- |
| AmbiSecure One Pass &mdash; A Multiple Application Card | `/ambisecure-one-pass-a-multiple-application-card` | Product / Authenticators | `/products/onepass-card/` | Already covered | None | Yes (existing) | Phase 1 page |
| AmbiSecure One Pass Bio card | `/ambisecure-one-pass-bio-card` (inferred) | Product / Authenticators | `/products/onepass-bio-card/` | **Newly created** | New full product page | Yes (existing redirect, target now resolves) | 14.9 KB; biometric FIDO2 card, match-on-card |
| AmbiSecure One Pass USB key | `/ambisecure-usb-key` | Product / Authenticators | `/products/onepass-usb-key/` | Already covered | None | Yes (existing) | Phase 1 page |
| AmbiSecure &mdash; IoT security chipset | `/ambisecure-iot-solution` | Product / IoT solution | `/products/iot-security-chipset/` | **Newly created** | New full product page | Yes (existing redirect, target now resolves) | 14.8 KB; SE chip, Set/Get Master Key, attestation |
| AmbiSecure BioKey | `/ambisecure-biokey` | Product / Authenticators | `/products/biokey/` | **Newly created** | New full product page | Yes (existing redirect, target now resolves) | 13.0 KB; biometric USB key, match-on-device |
| AmbiSecure Tappable | `/ambisecure-tappable` | Product / Authenticators / Mobile solution | `/products/tappable/` | **Newly created** | New full product page | Yes (existing redirect, target now resolves) | 12.6 KB; NFC-only, mobile-first |
| Digital Signature Token | `/ambisecure-digital-signature-token` | Product / Authenticators | `/products/digital-signature-token/` | **Newly created** | New full product page | Yes (existing redirect, target now resolves) | 13.1 KB; PKCS#11, eIDAS-compatible |
| JavaCard Applet Enterprise Solution | `/ambisecure-javacard-applet-enterprise-solution/` | Product / Applets | `/products/javacard-applets/` | **Newly created** | New full product page covering all 12 legacy applets | Yes (existing redirect, target now resolves) | 13.8 KB; FIDO, PIV, OpenPGP, Door, X.509, NDEF, OIDC, SCP02, FIDO-Bio, PIV-Bio, Secure Storage, IoT |
| IoT Solution | `/ambisecure-iot-solution/` | Product / IoT solution | `/products/iot-solution/` | **Newly created** | New end-to-end IoT platform page (chipset + key manager + operator FIDO MFA) | Added (`/iot` &rarr; `/products/iot-solution/`) | 14.2 KB; complements the chipset page |
| eSIM Solution | `/ambisecure-esim-solution/` | Product / Mobile solution | `/products/esim-solution/` | **Newly created** | New eSIM platform page (SGP.22 + SGP.32 + OIDC applet); deep technical docs link out to `esim.ambimat.com` | **Repointed** (`/ambisecure-esim-solution` &rarr; `/products/esim-solution/`, was &rarr; `https://esim.ambimat.com/`) | 13.2 KB; preserves OpenID Connect content from legacy page |
| Java Card Applet Development | `/services/java-card-development/` | Service | `/services/javacard-development/` | **Newly created** | New full service page (full development cycle, JCOP 3.1, deliverables) | Yes (existing) | 14.8 KB; preserves JavaCard 3.0 / GP 2.3 / JCOP 3.1 / NIST SP 800-73 / FIDO2 CTAP wording |
| Fido validation server demo | (no canonical URL) | Service | `/services/fido-validation-server/` | **Newly created** | Folded into the FIDO Validation Server page; added redirect | Added (`/fido-validation-server-demo` &rarr; `/services/fido-validation-server/`) | Demo is reachable via the page&rsquo;s primary CTA |
| AmbiSecure FIDO Validation server | `/services/ambisecure-fido-validation-server/` | Service | `/services/fido-validation-server/` | **Newly created** | New full service page (JS API + REST + transparent billing) | Yes (existing) | 14.8 KB; preserves passwordless / origin-bound / per-website key wording |
| Tool chain development | `/tool-chain-development` | Service | `/services/tool-chain-development/` | **Newly created** | New parent service page | Yes (existing) | 13.0 KB; landing for the four sub-tools |
| AmbiSecure Bio Enrollment App | `/ambisecure-bio-enrollment-app` | Service / Tool chain | `/services/tool-chain-development/bio-enrollment-app/` | **Newly created** | New full sub-service page | Yes (existing) | 13.2 KB; match-on-card workflow, ISO 19794-2 |
| AmbiSecure Security key manager | `/ambisecure-security-key-manager` | Service / Tool chain | `/services/tool-chain-development/security-key-manager/` | **Newly created** | New full sub-service page | Yes (existing) | 13.0 KB; preserves Set/Get Master Key, Generate Key Pair, Sign data, proprietary extensions wording |
| AmbiSecure Multi Card Applet Loading Tool | `/ambisecure-multi-card-applet-loading-tool` | Service / Tool chain | `/services/tool-chain-development/multi-card-applet-loader/` | **Newly created** | New full sub-service page | Yes (existing + alias) | 13.2 KB; SCP03 + GP 2.3.1 |
| AmbiSecure NDEF Personalisation Tool | `/ambisecure-ndef-personalisation-tool` | Service / Tool chain | `/services/tool-chain-development/ndef-personalisation/` | **Newly created** | New full sub-service page | Yes (existing) | 12.9 KB; URL / vCard / custom NDEF, NFC Forum Type 4 |
| Applets (category) | `/applets` (inferred) | Product menu category | `/products/javacard-applets/` | Newly redirected | Added redirect | Added | Top-level taxonomy now resolves |
| Authenticators (category) | `/authenticators` | Product menu category | `/products/` | Already covered | None | Yes (existing) | Top-level taxonomy resolved at index |
| Mobile solution (category) | `/mobile-solution` (inferred) | Product menu category | `/products/tappable/` | Newly redirected | Added redirect | Added | Most-likely match in our catalogue |

---

## 2. Files added (16 new pages)

### Products (8 pages)

```
products/onepass-bio-card/index.html
products/iot-security-chipset/index.html
products/biokey/index.html
products/tappable/index.html
products/digital-signature-token/index.html
products/javacard-applets/index.html
products/iot-solution/index.html
products/esim-solution/index.html
```

### Services (8 pages)

```
services/index.html
services/javacard-development/index.html
services/fido-validation-server/index.html
services/tool-chain-development/index.html
services/tool-chain-development/bio-enrollment-app/index.html
services/tool-chain-development/security-key-manager/index.html
services/tool-chain-development/multi-card-applet-loader/index.html
services/tool-chain-development/ndef-personalisation/index.html
```

Each page carries: H1, SEO title, meta description, canonical URL, OpenGraph tags, JSON-LD BreadcrumbList, JSON-LD Product or Service schema, hero, why / features grid, specifications table, lifecycle / engagement architecture, related-content cards, and a callout CTA. Average page weight: ~13.4 KB.

---

## 3. Files modified

| File | Change |
| ---- | ------ |
| `.htaccess` | Repointed `/ambisecure-esim-solution` to `/products/esim-solution/`; added `/applets`, `/iot`, `/mobile-solution`, `/products/iot-solution`, `/products/javacard-applet-enterprise-solution`, `/services/tool-chain-development/multi-card-applet-loading-tool`, `/java-card-applet-development`, `/fido-validation-server-demo` redirects |
| `sitemap.xml` | Added 16 new Phase 6 URLs (now 164 total, up from 148) |
| `products/index.html` | Promoted IoT Solution and eSIM Solution into the IoT &amp; Applets grid (4 cards instead of 2); reworded the JavaCard applet card to mention 12 applets |

---

## 4. Redirects added (11 new/refined)

**New redirects:**
1. `/applets` &rarr; `/products/javacard-applets/`
2. `/iot` &rarr; `/products/iot-solution/`
3. `/mobile-solution` &rarr; `/products/tappable/`
4. `/products/iot-solution` &rarr; `/products/iot-solution/` (trailing-slash hygiene)
5. `/products/javacard-applet-enterprise-solution` &rarr; `/products/javacard-applets/`
6. `/authenticators/` &rarr; `/products/` (paired with existing `/authenticators`)
7. `/services/tool-chain-development/multi-card-applet-loading-tool` &rarr; `/services/tool-chain-development/multi-card-applet-loader/`
8. `/java-card-applet-development` &rarr; `/services/javacard-development/`
9. `/fido-validation-server-demo` &rarr; `/services/fido-validation-server/`

**Refined redirects:**
10. `/ambisecure-esim-solution` &rarr; `/products/esim-solution/` *(was &rarr; `https://esim.ambimat.com/`; the deep eSIM technical site is still linked from the new page&rsquo;s hero, callout, and related cards)*

**Already-correct redirects verified:**
11. `/ambisecure-one-pass-a-multiple-application-card`, `/ambisecure-one-pass-bio-card`, `/ambisecure-usb-key`, `/products/ambisecure-security-key`, `/products/ambisecure-card`, `/ambisecure-iot-solution`, `/ambisecure-biokey`, `/ambisecure-tappable`, `/ambisecure-digital-signature-token`, `/ambisecure-javacard-applet-enterprise-solution`, `/services/java-card-development`, `/services/ambisecure-fido-validation-server`, `/tool-chain-development`, `/ambisecure-bio-enrollment-app`, `/ambisecure-security-key-manager`, `/ambisecure-multi-card-applet-loading-tool`, `/ambisecure-ndef-personalisation-tool` &mdash; all targets now resolve.

---

## 5. Navigation updates

| Surface | Change |
| ------- | ------ |
| Top nav (all pages) | Unchanged. Top nav stays compact at 7 entries (Products, Solutions, Technologies, Industries, Resources, Blog, About). Services are surfaced one click in via the Products page. |
| `/products/` index | Now lists 6 authenticators + 4 IoT/applet platform tiles + a 3-card services strip, covering every legacy Product menu item. |
| `/services/` index | Newly created. Lists 3 core services + 4 tool-chain components. Replaces the previously-empty `/services/` directory. |
| Product page footers | New pages carry a Services column in the footer (replaces the old Develop column). Existing pages still surface /products/ (which now links to /services/) and /resources/. |
| Internal links | Each new page cross-links into related products, services, solutions, technologies, references, and tools. |

---

## 6. Sitemap update

- **Before:** 148 URLs.
- **After:** 164 URLs (16 new entries, all under `/products/...` or `/services/...`).
- **Validity:** XML well-formed, single `<urlset>` namespace, no duplicate `<loc>` for any newly-added URL.

---

## 7. SEO / schema updates

Every new page carries:

- Canonical `<link>` matching its absolute URL.
- `og:type = "product"` for product pages, `"website"` for service pages.
- `og:title`, `og:description`, `og:url`.
- JSON-LD `BreadcrumbList` linking back to `/`, `/products/` or `/services/`, and the page itself.
- JSON-LD `Product` schema with brand, category, and an offers stub for product pages.
- JSON-LD `Service` schema with provider for service pages.
- `<title>` / `<meta description>` calibrated for buyer-side search intent (form-factor + standard combinations).

Existing canonical and OG patterns from Phase 1&ndash;5 are preserved verbatim. No competing canonical tags introduced.

---

## 8. Content migration rules &mdash; how legacy claims were preserved

| Legacy claim | Preserved at | Form |
| ------------ | ------------ | ---- |
| "FIDO Alliance certified" hardware authentication | `/products/javacard-applets/` (FIDO applet card) | "FIDO Alliance certified hardware authentication" verbatim |
| PIV "NIST Compliant solution" with Windows / Linux / macOS interoperability | `/products/javacard-applets/` (PIV applet card) | "NIST SP 800-73 compliant. Interoperable with Windows, Linux, and macOS PIV stacks" |
| Door Access via card tapping | `/products/javacard-applets/` (Door Access card) | "Physical access control via card tap on electrical door readers" |
| Certificate Storage (PEM/PFX) | `/products/javacard-applets/` (Certificate Storage card) | "Secure storage of PEM or PFX certificates inside the secure element" |
| OpenPGP key-based file encryption | `/products/javacard-applets/` (OpenPGP card) | "RFC 4880 / OpenPGP card spec. PGP signing, decryption, and authentication keys" |
| Business Card NDEF via NFC | `/products/javacard-applets/`, `/services/.../ndef-personalisation/` | "Contact information exchange via NFC tap" |
| OpenID Connect end-user identity verification | `/products/javacard-applets/`, `/products/esim-solution/` | "End-user identity verification and profile retrieval. REST-like flows" / verbatim from legacy eSIM page |
| Set/Get Master Key, Generate Key Pair, Sign data, proprietary extensions | `/products/iot-security-chipset/`, `/products/iot-solution/`, `/services/.../security-key-manager/` | All three pages preserve the exact "Set/Get Master Key, Generate Key Pair, Sign data" wording with proprietary-extension note |
| FIDO Biometric / PIV Biometric | `/products/javacard-applets/`, `/products/onepass-bio-card/`, `/products/biokey/` | Biometric variants surfaced as both applet cards and standalone hardware products |
| Secure Storage 200+ records with biometric authorisation | `/products/javacard-applets/` (Secure Storage card) | "Text storage for 200+ records with biometric authorisation" verbatim |
| JavaCard 3.0 / GlobalPlatform 2.3 / JCOP 3.1 | `/services/javacard-development/` | Verbatim in the standards list |
| NIST SP 800-73-3 PART 1-4 | `/services/javacard-development/` | "NIST SP 800-73-3 PIV (parts 1-4)" |
| FIDO U2F / FIDO2 CTAP / W3C WebAuthN | `/services/javacard-development/` | Verbatim |
| Eclipse + JCOP Tools / JavaCardOS / Oracle Java Card Development Kit | `/services/javacard-development/` | Verbatim toolchain trio |
| RSA, ECC, AES, DES/3DES, SHA-2, HMAC, ECDSA | `/services/javacard-development/` | Verbatim |
| Loyalty / ID / club cards / FIDO Web Authentication applets | `/services/javacard-development/` | Verbatim use cases |
| FIDO-based passwordless authentication platform &mdash; strong security, seamless UX, transparent billing | `/services/fido-validation-server/` | Verbatim |
| Server manages user&rsquo;s key; verifies signed transactions; never holds private key | `/services/fido-validation-server/` | Verbatim |
| Cryptographic keys unique at every website | `/services/fido-validation-server/` | Verbatim |
| Fingerprint, face recognition, hardware security keys, biometric authentication via built-in device tools | `/services/fido-validation-server/` | Verbatim |
| Simple JavaScript API supporting leading browsers and platforms | `/services/fido-validation-server/` | Verbatim |
| API Key + REST endpoints (e.g. `/auth/login/start`) | `/services/fido-validation-server/` | Verbatim with code-formatted endpoint |

No legacy technical claim was dropped silently. Where legacy wording overlapped with marketing fluff, the technical substance was kept and the surrounding sentence tightened.

---

## 9. QA performed

1. All 16 new pages exist on disk under their canonical paths.
2. All `<title>`, `<meta description>`, `<link rel="canonical">`, OG tags, and JSON-LD blocks present and consistent with the site-wide pattern.
3. Each new page&rsquo;s breadcrumb matches its filesystem path.
4. Each new page links into at least three sibling pages (related-content cards).
5. `sitemap.xml` validated as well-formed XML with 164 `<url>` entries.
6. `.htaccess` parsed for redirect duplicates &mdash; the only intentional double-line is `/authenticators` (existing) plus `/authenticators/` (new, trailing-slash variant).
7. `.htaccess` `/ambisecure-esim-solution` retargeted to local page; the page still links out to `https://esim.ambimat.com/` from hero, specs, and CTA.
8. `/products/` index visually balances the IoT &amp; Applets grid by adding two new cards alongside the existing two.
9. `/services/` index now resolves with a real page (was empty directory).
10. No new external-script imports introduced; CSP unchanged.

---

## 10. Remaining uncertainty

| Item | Status |
| ---- | ------ |
| Whether the legacy site had additional unlisted product/service URLs not in the screenshots | **Low risk.** All five mandatory legacy URLs were fetched and folded in. The product index now matches every item in the prompt. If a future leg-spelunking exercise turns up an extra legacy slug, an additional `Redirect 301` line is the only fix needed. |
| Brochure PDFs for OnePass Bio Card, BioKey, Tappable, IoT Chipset, Digital Signature Token, JavaCard Applets, IoT Solution, eSIM Solution | **Pending.** Buttons currently link to `/contact/` rather than to PDFs. Adding `/assets/downloads/*.pdf` is a separate art / marketing task &mdash; flagged for future sprint. |
| eSIM Solution depth | **Intentional shallowness.** The new `/products/esim-solution/` page is a positioning page with verified legacy claims and explicit out-links to `https://esim.ambimat.com/` for the deep RSP / SM-DP+ technical material. This avoids duplicating the eSIM Initiative site. |
| Open IoT chipset BOM details | **Hidden.** Concrete chip vendor names are intentionally not published until a customer is under NDA. The pages describe behaviour and certification target; specific silicon partners are disclosed during engagement. |
| FIDO Biometric Component certification | **Targeted, not claimed.** Pages state "certification path" / "target", never "certified", consistent with site-wide certification claim hygiene from Phase 5. |

---

## 11. Final commit

After review, this work is committed under the message:

```
Restore legacy product and service menu coverage
```

That commit will surface in the project log as the Phase 6 deliverable.
