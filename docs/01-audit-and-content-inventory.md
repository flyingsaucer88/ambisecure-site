# 01 · Audit & Content Inventory

Source-of-truth crawl of the three Ambimat properties used as inputs to this redesign.
Captures everything before any redesign decisions — supports the **zero information loss** rule.

---

## Stack detection

| Property | Stack | Hosting | Notes |
|---|---|---|---|
| ambimat.com | WordPress + WooCommerce, PHP 7.4, Apache | (parent) | Heritage corporate site. Rich nav, multi-product. |
| ambisecure.ambimat.com (current) | WordPress, PHP 8.1, LiteSpeed | Hostinger | The site we are replacing. |
| esim.ambimat.com (modern Ambimat property) | **Static HTML + vanilla CSS/JS**, Google Fonts (Montserrat / Source Sans 3 / JetBrains Mono), strict CSP | Hostinger | Reference design. Proves Hostinger-friendly static stack works for premium engineering tone. |

**Decision:** match the eSIM property's stack — static HTML, vanilla CSS, vanilla JS, Google Fonts, Hostinger-deployable. Ops parity, zero build server, excellent Lighthouse, fully friendly to interactive utility tools (TLV/APDU/ATR parsers ship as standalone HTML+JS pages — no SPA needed).

---

## Existing AmbiSecure content inventory

### Pages

| Old URL | Type | Status | New URL |
|---|---|---|---|
| `/` | Home | Migrate, redesign | `/` |
| `/about/` | About | Migrate | `/about/` |
| `/about/company-overview/` | About sub | Merge into `/about/` | `/about/#overview` |
| `/product/` | Product index | Migrate, restructure | `/products/` |
| `/authenticators/` | Product category | Merge under `/products/` | `/products/#authenticators` |
| `/ambisecure-services/` | Services index | Migrate | `/services/` |
| `/resources/` | Resources hub | **Repurpose entirely** (no longer blog dump — now utility tools) | `/resources/` |
| `/support/` | Support | Migrate | `/support/` |
| `/cyber-security-threats/` | Editorial | Convert to blog post | `/blog/cyber-security-threats-overview/` |
| `/certification/` | Trust page | Migrate | `/about/certifications/` |
| `/faqs/` | FAQs | Migrate, expand | `/support/faqs/` |
| `/learn/ambisecure-fido-supported-services/` | Educational | Move to blog/resources | `/blog/fido-supported-services/` |
| `/how-to-use-the-ambisecure-fido-card/` | How-to | Move to support docs | `/support/guides/use-fido-card/` |
| `/learn/how-it-work/` | Explainer | Move to blog | `/blog/how-fido-authentication-works/` |
| `/blogs/` | Blog index | Migrate, restructure | `/blog/` |
| `/contact/` (implied) | Contact | New dedicated page | `/contact/` |
| `/tool-chain-development/` | Service | Migrate | `/services/tool-chain-development/` |

### Products (each gets a dedicated landing page)

| Old URL | Product | New URL |
|---|---|---|
| `/ambisecure-one-pass-a-multiple-application-card/` | OnePass Card (FIDO2) | `/products/onepass-card/` |
| `/ambisecure-one-pass-bio-card/` | OnePass Bio Card (biometric FIDO2) | `/products/onepass-bio-card/` |
| `/ambisecure-usb-key/` | OnePass USB Key | `/products/onepass-usb-key/` |
| `/products/ambisecure-security-key/` | (alias of USB Key) | redirect → `/products/onepass-usb-key/` |
| `/products/ambisecure-card/` | (alias of OnePass Card) | redirect → `/products/onepass-card/` |
| `/ambisecure-iot-solution/` | IoT Security Chipset | `/products/iot-security-chipset/` |
| `/ambisecure-biokey/` | BioKey | `/products/biokey/` |
| `/ambisecure-tappable/` | Tappable (NFC) | `/products/tappable/` |
| `/ambisecure-digital-signature-token/` | Digital Signature Token | `/products/digital-signature-token/` |
| `/ambisecure-esim-solution/` | Mobile/eSIM Solution | redirect → `https://esim.ambimat.com/` |
| `/ambisecure-javacard-applet-enterprise-solution/` | JavaCard Applet (Enterprise) | `/products/javacard-applets/` |

### Services

| Old URL | Service | New URL |
|---|---|---|
| `/services/java-card-development/` | JavaCard Applet Development | `/services/javacard-development/` |
| `/services/ambisecure-fido-validation-server/` | FIDO Validation Server | `/services/fido-validation-server/` |
| `/tool-chain-development/` | Tool Chain Development | `/services/tool-chain-development/` |
| `/ambisecure-bio-enrollment-app/` | Bio Enrollment App | `/services/tool-chain-development/bio-enrollment-app/` |
| `/ambisecure-security-key-manager/` | Security Key Manager | `/services/tool-chain-development/security-key-manager/` |
| `/ambisecure-multi-card-applet-loading-tool/` | Multi-Card Applet Loading Tool | `/services/tool-chain-development/multi-card-applet-loader/` |
| `/ambisecure-ndef-personalisation-tool/` | NDEF Personalisation Tool | `/services/tool-chain-development/ndef-personalisation/` |

### Existing blog posts (preserve, migrate slugs)

| Old URL | New URL |
|---|---|
| `/implementing-fido2-authentication-a-complete-developer-guide-by-ambisecure/` | `/blog/implementing-fido2-developer-guide/` |
| `/why-use-multi-factor-authentication-mfa/` | `/blog/why-use-multi-factor-authentication/` |
| `/top-3-benefits-of-multi-factor-authentication/` | `/blog/top-3-benefits-of-mfa/` |

### External / ecosystem links to preserve

| Target | Reason |
|---|---|
| `https://ambimat.com/` | Parent ecosystem |
| `https://ambimat.com/for-developer/blogs/` | Engineering blog |
| `https://ambimat.com/fast-identity-online-fido/` | FIDO context |
| `https://esim.ambimat.com/` | eSIM Initiative |
| `https://fido.ambimat.com/`, `https://fido2.ambimat.com/angular/login` | FIDO demo server |

### Brand assets / downloads to preserve

| Asset | Old URL |
|---|---|
| OnePass USB Key brochure | `/wp-content/uploads/2023/09/Brochure-3.pdf` |
| OnePass Card brochure | `/wp-content/uploads/2023/09/Brochure-4.pdf` |
| OnePass Bio Card brochure | `/wp-content/uploads/2023/09/Brochure-5.pdf` |

> Migration step: rehost under `/assets/downloads/onepass-usb-key.pdf` etc., **and** keep `/wp-content/uploads/...` as 301 redirects so external backlinks survive.

### Contact info (verbatim, preserve)

- **Registered Office:** 1005 & 1006, 10th Floor, Shivalik Shilp-II, Keshavbaug Party Plot, Nr. Chandresh Baug, Vastrapur, Ahmedabad, Gujarat — 380015, India
- **Works:** "LAXMI", B/h St. Xavier's School, Nr. Central Automobiles, Mirzapur Road, Mirzapur, Ahmedabad — 380001, India
- **Local inquiry:** +91 79255 01989
- **Global inquiry:** +1 215 397 3819
- **Email:** support@ambimat.com
- Facebook: `https://www.facebook.com/Ambimat-Electronics-213415895353632/`
- Twitter: `https://twitter.com/ambimat`
- LinkedIn: `https://www.linkedin.com/company/ambimat-electronics`

### Taglines & positioning (verbatim, preserve)

- "AmbiSecure — Authentication without compromise"
- "Secure your enterprise against tomorrow's threats, today."
- "Protect users, applications and data with AmbiSecure's Solutions."
- Differentiators: Cost Effective · Single Point of Contact · Fast Turn Around Time · One-Stop Solution · Vendor Relationships Across Segments
- Mission: "To safeguard our highly connected world against cybercrime to create a safer and more secure work and personal environment"
- Vision: "To solve the IoT security problem"

### Industries served (preserve, expand)

Medical Devices · Smart Watches · Smart Homes · Robotics · Security · Music / Consumer Electronics · Hospitality · Utility · Retail · Enterprise · Government · Telecom · Payments · Identity

### Technology tags surfaced on the existing site

FIDO2 · FIDO U2F · PIV · OpenPGP · MFA · JavaCard · Smart Cards · USB tokens · Biometrics · NFC · eSIM · Bluetooth · GSM · IoT security · Hardware-based authentication · PCB design · Firmware · FCC certification

---

## Zero-loss checklist

- [x] Every existing page mapped to a new URL or marked redirect
- [x] Every product mapped to a dedicated landing page
- [x] Every service mapped to a dedicated landing page
- [x] All known blog posts preserved with slug rewrites
- [x] All brochure PDFs flagged for rehost + redirect
- [x] All taglines, mission, vision recorded verbatim
- [x] All contact info recorded verbatim
- [x] All ecosystem links preserved
