# 02 · Information Architecture

## Top-level navigation (final)

```
Home
Products       ← hardware + software product catalogue
Solutions      ← problem-shaped: passwordless, IoT root-of-trust, secure provisioning, eSIM
Technologies   ← education-shaped: JavaCard, Secure Element, FIDO, NFC/DESFire, PKI, eSIM
Industries     ← vertical-shaped: BFSI, Government, Telecom, Healthcare, IoT/Industrial, Retail
Resources      ← UTILITY TOOLS ONLY (ATR/APDU/TLV/ASN.1/CRC parsers, encoders, references)
Blog           ← editorial — separate from Resources by mandate
About
Contact
```

Plus a sticky **Ecosystem bar** above the main nav linking: Ambimat · AmbiSecure (current) · eSIM · Blog. Same bar pattern used on esim.ambimat.com — keeps the family visually consistent.

## Why this structure (vs. the current site)

| Problem with current site | Fix |
|---|---|
| Resources section mixed blogs + cyber threat editorial + how-to + FAQ — discoverability poor | Resources is now **utility tools only**. Editorial is in **Blog**. How-tos and FAQs are in **Support**. |
| Products tree had inconsistent depth (`/product/`, `/authenticators/`, `/products/...`, top-level product slugs) | Single canonical `/products/` index, every product is `/products/<slug>/` — flat, predictable. |
| Solutions and Technologies were collapsed into Product copy | Promoted to first-class sections. **Solutions** = "why" (buyer-shaped). **Technologies** = "how" (engineer-shaped). Same product mentioned in both with different framing. |
| Industries page was missing | Added — important for SEO and for buyer self-identification. |
| About hidden behind a sub-page | Single rich `/about/` with anchors for overview, mission, certifications, leadership. |

## Per-section sitemap

### Products (`/products/`)
```
/products/                               # index, grouped: Authenticators · Smart Cards · IoT · Tools
/products/onepass-card/
/products/onepass-bio-card/
/products/onepass-usb-key/
/products/biokey/
/products/tappable/
/products/digital-signature-token/
/products/iot-security-chipset/
/products/javacard-applets/
```

### Services (`/services/`)
```
/services/                               # index
/services/javacard-development/
/services/fido-validation-server/
/services/tool-chain-development/        # parent
/services/tool-chain-development/bio-enrollment-app/
/services/tool-chain-development/security-key-manager/
/services/tool-chain-development/multi-card-applet-loader/
/services/tool-chain-development/ndef-personalisation/
```

### Solutions (`/solutions/`) — buyer/problem-shaped
```
/solutions/
/solutions/passwordless-mfa/
/solutions/iot-root-of-trust/
/solutions/secure-provisioning/
/solutions/digital-identity/
/solutions/payment-security/
/solutions/secure-firmware-update/
```

### Technologies (`/technologies/`) — engineer/topic-shaped
```
/technologies/
/technologies/javacard/
/technologies/secure-elements/
/technologies/fido/
/technologies/pki/
/technologies/nfc-desfire/
/technologies/esim/                       # links out to esim.ambimat.com for deep
/technologies/apdu/
/technologies/cryptography/
```

### Industries (`/industries/`)
```
/industries/
/industries/banking-and-payments/
/industries/government-and-defence/
/industries/telecom/
/industries/healthcare/
/industries/iot-and-industrial/
/industries/retail-and-hospitality/
```

### Resources (`/resources/`) — utilities only, no editorial
See `docs/06-resources-tools-architecture.md` for the full tool tree.

### Blog (`/blog/`)
```
/blog/                                    # index
/blog/category/<category-slug>/
/blog/<post-slug>/
```

### Support (`/support/`)
```
/support/
/support/faqs/
/support/guides/
/support/guides/use-fido-card/
/support/datasheets/
```

### About (`/about/`)
```
/about/                                   # overview, mission, vision, story
/about/certifications/
/about/leadership/                        # placeholder
/about/careers/                           # link out to ambimat.com careers
```

### Contact (`/contact/`)
Single page with form, addresses, both phone numbers, email, social.

## Internal linking principles

1. **Every product page** links to: 1 Solution, 2-3 Technologies, 1 Industry, 2-3 related Blog posts, the relevant Service.
2. **Every Technology page** links to: every Product that uses it, every Solution that depends on it, the strongest blog cluster post (cornerstone).
3. **Every Solution page** links to: the products that solve it, related Industries, related Blog cluster.
4. **Every Blog post** links to: at least 1 Product or Service, at least 1 Technology page, 2-3 sibling Blog posts.
5. **Resources tools** stay editorially clean — they may link upward to a relevant Technology page only (e.g., the APDU parser links to `/technologies/apdu/`). No marketing links inside tools.

## Sticky cross-property linking

Every page has the **Ecosystem bar** at top with:
- Ambimat (parent) → ambimat.com
- AmbiSecure (current, highlighted)
- eSIM Initiative → esim.ambimat.com
- Blog → /blog/

Footer additionally surfaces "Part of the Ambimat Group" with logos and short descriptions. Mirrors the eSIM site's pattern so the three properties feel like one family.

## Breadcrumbs

Every non-root page renders a JSON-LD `BreadcrumbList` and a visible breadcrumb strip. Format:
`Home › Products › OnePass Card`
