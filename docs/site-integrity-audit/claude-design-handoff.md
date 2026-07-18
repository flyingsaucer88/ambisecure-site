# Claude Design Handoff — pages needing new/redesigned featured images

> **✅ STATUS 2026-07-18T09:19Z: ALL 5 REQUESTED IMAGES COMPLETED, INTEGRATED, DEPLOYED, AND LIVE-VERIFIED.** Delivered in `docs/Shared design link.zip → ambisecure-featured-images-new/final/`, validated, wired into their pages, committed as `736e2e6`, pushed, and deployed via Deploy to Hostinger. Post-deployment verification confirms all five live pages reference the correct new images (byte-identical live↔committed by SHA-256/MD5/`cmp`), the five old covers now return 404, and the full 318-page live re-crawl passes. See the **Completed** section immediately below and [live-verification.md](live-verification.md). The original open-queue entries are retained further down for full traceability.

## Completed — deployed and live-verified (2026-07-18T09:19Z)

| # | Page | Final filename | Repo destination | Previous image | Validation | Local integration | Deploy |
|---|---|---|---|---|---|---|---|
| 1 | [/products/fido2-nano-sim-applet/](https://ambisecure.ambimat.com/products/fido2-nano-sim-applet/) | `ambisecure-products-fido2-nano-sim-applet-1200x630.png` | `assets/img/og/featured/` | `assets/img/og/fido2-nano-sim-applet.png` (deleted) | 1200×630 PNG, opaque, unique md5, byte-identical to package | ✅ og/twitter + secure_url + alt updated | ❌ pending |
| 2 | [/products/iot-security-applets/](https://ambisecure.ambimat.com/products/iot-security-applets/) | `ambisecure-products-iot-security-applets-1200x630.png` | `assets/img/og/featured/` | `assets/img/og/iot-security-applets.png` (deleted) | 1200×630 PNG, opaque, unique md5 | ✅ | ❌ pending |
| 3 | [/products/pkcs-signature-suite/](https://ambisecure.ambimat.com/products/pkcs-signature-suite/) | `ambisecure-products-pkcs-signature-suite-1200x630.png` | `assets/img/og/featured/` | `assets/img/og/pkcs-signature-suite.png` (deleted) | 1200×630 PNG, opaque, unique md5 | ✅ | ❌ pending |
| 4 | [/products/secure-mail-suite/](https://ambisecure.ambimat.com/products/secure-mail-suite/) | `ambisecure-products-secure-mail-suite-1200x630.png` | `assets/img/og/featured/` | `assets/img/og/secure-mail-suite.png` (deleted) | 1200×630 PNG, opaque, unique md5 | ✅ | ❌ pending |
| 5 | [/services/epassport-platform/](https://ambisecure.ambimat.com/services/epassport-platform/) | `ambisecure-services-epassport-platform-1200x630.png` | `assets/img/og/featured/` | `assets/img/og/epassport-platform.png` (deleted) | 1200×630 PNG, opaque, unique md5; no national emblem/seal | ✅ | ❌ pending |

Final alt text applied (identical in `og:image:alt` and `twitter:image:alt`):
1. "AmbiSecure FIDO2 nano-card applet holding a hardware-backed credential inside a 4FF secure element, signing a WebAuthn assertion."
2. "AmbiSecure IoT security applets — provisioning, attestation, mTLS, signed update and key rotation — co-resident on one CC EAL6+ secure element."
3. "AmbiSecure PKCS Signature Suite — a hardware token with PKCS#11 middleware signing across Acrobat, Office, Mozilla, OpenSC and Windows BaseCSP."
4. "AmbiSecure Secure Mail Suite — white-label S/MIME email and PDF/PKCS#7 document signing backed by a hardware secure element."
5. "AmbiSecure ePassport platform engineering — an ICAO 9303 pipeline spanning enrolment, personalisation and CSCA/DSC PKI."

The five pages were removed from `NON_FEATURED_ALLOWED` in `tools/audit-og-images.py`; the two utility exceptions (`/blog/page/2/`, `/search/`) are retained.

**Review note (non-blocking):** on image #1 the small "WebAuthn verified" checkmark sits close to its label. Design review pre-cleared this as acceptable at thumbnail size; text is not clipped, correctly spelled, and legible. Not a defect.

---

## Original open-queue entries (historical — now resolved)

These pages carried a valid but **off-brand (older dark title-card)** OG image and had **no approved or brand-consistent alternative in the repo**. They needed new featured art in the approved AmbiSecure system. **No artwork was generated for this audit** (per task rules).

**Shared spec for all entries below**
- **Dimensions:** 1200×630 PNG (the confirmed AmbiSecure OG standard)
- **Reference style to follow:** the 27 approved images in `docs/AmbiSecure LinkedIn image brief.zip`, and specifically the product/service frames (`02-products/*`, `07-services/*`). Design system bundle: `_ds/ambimat-design-system-*` inside the same ZIP.
- **Must include:** off-white grid canvas; top-left mono kicker; short red rule + bold Montserrat headline (left, in safe area); one-line grey dek; right-side thin-line schematic diagram pane with selective red accents; AmbiSecure flame+wordmark lockup bottom-left; red triangular corner wedge bottom-right.
- **Must avoid:** dark/charcoal backgrounds, serif headlines, left vertical bars, photography or stock imagery, government seals/logos, customer or payment-network logos, invented metrics/customers.
- **Suggested filename convention:** `ambisecure-<path-slug>-1200x630.png`, installed to `assets/img/og/featured/` (matches the 284 generated + 27 approved).
- **On delivery:** update the page's `og:image`, `og:image:secure_url`, `twitter:image` to the new `/assets/img/og/featured/…` path; keep `og:image:alt` == `twitter:image:alt`; remove the old file from `assets/img/og/`; then remove the page's entry from `NON_FEATURED_ALLOWED` in `tools/audit-og-images.py`.

---

### 1. FIDO2 Nano-Card Applet
- **URL:** https://ambisecure.ambimat.com/products/fido2-nano-sim-applet/
- **Page type:** Product
- **Summary:** FIDO2 / CTAP2 applet on a CC EAL6+ secure element in 4FF nano-card and solderable MFF2 packages; ECC P-256; ISO/IEC 7816 contact + 14443 contactless.
- **On-image title (suggested):** "FIDO2 Credential in a Nano-Card"
- **Diagram elements:** 4FF nano-card / MFF2 module → secure element holding a FIDO2 private key → signed assertion to relying party. No password path.
- **Proposed alt:** "AmbiSecure FIDO2 nano-card applet holding a hardware-backed credential inside a 4FF secure element, signing a WebAuthn assertion."
- **Suggested filename:** `ambisecure-products-fido2-nano-sim-applet-1200x630.png`

### 2. IoT Security Applets
- **URL:** https://ambisecure.ambimat.com/products/iot-security-applets/
- **Page type:** Product
- **Summary:** JavaCard applets for IoT device identity — provisioning, attestation, signed firmware update, mutual-TLS credential storage, key rotation — on a CC EAL6+ secure element.
- **On-image title (suggested):** "Five Applets for Device Identity"
- **Diagram elements:** secure element with five labelled applet slots (provisioning, attestation, mTLS, signed update, key rotation) isolated from the application MCU.
- **Proposed alt:** "AmbiSecure IoT security applets — provisioning, attestation, mTLS, signed update and key rotation — co-resident on one CC EAL6+ secure element."
- **Suggested filename:** `ambisecure-products-iot-security-applets-1200x630.png`

### 3. PKCS Signature Suite
- **URL:** https://ambisecure.ambimat.com/products/pkcs-signature-suite/
- **Page type:** Product
- **Summary:** Hardware signature token plus PKCS#11 / PKCS#15 middleware; cross-platform (Acrobat, Office, Mozilla, OpenSC, Windows BaseCSP).
- **On-image title (suggested):** "One Token, Every Signing Stack"
- **Diagram elements:** USB token (secure element) → PKCS#11 layer → Windows / macOS / Linux / Mozilla middleware endpoints.
- **Proposed alt:** "AmbiSecure PKCS Signature Suite — a hardware token with PKCS#11 middleware signing across Acrobat, Office, Mozilla, OpenSC and Windows BaseCSP."
- **Suggested filename:** `ambisecure-products-pkcs-signature-suite-1200x630.png`

### 4. Secure Mail Suite
- **URL:** https://ambisecure.ambimat.com/products/secure-mail-suite/
- **Page type:** Product
- **Summary:** White-label platform for S/MIME email signing/encryption and PDF/PKCS#7 document signing; hardware-backed via smart card, PIV, or PKCS#11 token.
- **On-image title (suggested):** "Signed Mail, Rooted in Hardware"
- **Diagram elements:** email + PDF document → S/MIME / PKCS#7 signing → key held in smart card / PIV / token secure element.
- **Proposed alt:** "AmbiSecure Secure Mail Suite — white-label S/MIME email and PDF/PKCS#7 document signing backed by a hardware secure element."
- **Suggested filename:** `ambisecure-products-secure-mail-suite-1200x630.png`

### 5. ePassport Platform Engineering
- **URL:** https://ambisecure.ambimat.com/services/epassport-platform/
- **Page type:** Service
- **Summary:** End-to-end ICAO 9303-aligned ePassport platform engineering — backend, frontend, PKI (CSCA / DSC / PKD), enrolment, personalisation.
- **On-image title (suggested):** "ePassport, End to End"
- **Diagram elements:** enrolment → personalisation → CSCA/DSC PKI trust chain → PKD; ICAO 9303 alignment. No national emblems or seals.
- **Proposed alt:** "AmbiSecure ePassport platform engineering — an ICAO 9303 pipeline spanning enrolment, personalisation and CSCA/DSC PKI."
- **Suggested filename:** `ambisecure-services-epassport-platform-1200x630.png`

---

## Lower priority (utility/pagination — optional)

These two are documented category/utility images, not content pages. Redesign only if brand consistency on social previews of utility pages is wanted.

- `/blog/page/2/` — `assets/img/og/blog.png` (blog pagination branding)
- `/search/` — `assets/img/og/search.png` (site search)
