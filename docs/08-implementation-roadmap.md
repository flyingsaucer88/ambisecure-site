# 08 · Implementation Roadmap

Phased plan from this scaffold to a fully launched, fully-populated site.

## Phase 1 — foundation (THIS SESSION, shipped in this commit)

**Goal:** ship a static-site foundation matching the eSIM property's stack, with the design system, IA, SEO, and a representative slice of every section. From here every subsequent page is a copy-paste-and-customise.

Deliverables — all in this repo:

- [x] All 8 strategy docs in `/docs/`
- [x] Shared CSS (`/assets/css/main.css`, derived from eSIM site, with AmbiSecure technical extensions)
- [x] Tools CSS (`/assets/css/tools.css`)
- [x] Shared nav / mobile menu JS (`/assets/js/nav.js`)
- [x] Home page (`/index.html`)
- [x] About page (`/about/index.html`)
- [x] Products index (`/products/index.html`)
- [x] One sample product detail page (`/products/onepass-card/index.html`)
- [x] Solutions index (`/solutions/index.html`)
- [x] Technologies index (`/technologies/index.html`)
- [x] Industries index (`/industries/index.html`)
- [x] Resources hub (`/resources/index.html`)
- [x] Three working utility tools — ATR parser, APDU parser, TLV parser
- [x] Blog index (`/blog/index.html`)
- [x] Three blog posts — the existing 3 migrated
- [x] Contact (`/contact/index.html`)
- [x] Support (`/support/index.html`)
- [x] `robots.txt`
- [x] `sitemap.xml`
- [x] `.htaccess` redirect map (uses `Redirect 301`/`RedirectMatch` for LiteSpeed/Apache)
- [x] `README.md` for repo onboarding
- [x] `404.html` (custom)

## Phase 2 — fill out the product, services, and solutions tree (1-2 weeks of build effort)

- [ ] Product detail pages: `/products/onepass-bio-card/`, `/products/onepass-usb-key/`, `/products/biokey/`, `/products/tappable/`, `/products/digital-signature-token/`, `/products/iot-security-chipset/`, `/products/javacard-applets/`
- [ ] Services: `/services/`, `/services/javacard-development/`, `/services/fido-validation-server/`, `/services/tool-chain-development/` + 4 sub-tool pages
- [ ] Solutions: 6 detail pages — passwordless-mfa, iot-root-of-trust, secure-provisioning, digital-identity, payment-security, secure-firmware-update
- [ ] Technologies: 8 detail pages — javacard, secure-elements, fido, pki, nfc-desfire, esim (stub linking out), apdu, cryptography
- [ ] Industries: 6 detail pages
- [ ] Resources: **47 tool placeholder pages** (URL space reserved, SEO indexable, "coming soon" with email-me CTA + working sample for the category leader)
- [ ] Blog: the 8 cornerstone pillar posts
- [ ] About: `/about/certifications/`, `/about/leadership/` (placeholder)
- [ ] Support: `/support/faqs/`, `/support/guides/`, `/support/datasheets/`
- [ ] OG image templates (1200×630) per section
- [ ] Image assets — at minimum 1 hero photo per Tier-1 product (placeholder line-art SVG ships in Phase 1)
- [ ] Plausible analytics integration

## Phase 3 — content depth & tool completion (4-6 weeks)

- [ ] Fill out the remaining 47 utility tools, leading with the high-traffic ones (sw-lookup, hex-bytes, json-format, base64, sha-hash, cbor-parser).
- [ ] Build out blog cluster supporting posts (target 1-2 posts/week).
- [ ] Customer case studies (anonymized at first if needed).
- [ ] Datasheets (PDFs) for every Tier-1/2 product.
- [ ] Integrations / partners page.
- [ ] Newsletter sign-up + first issue.
- [ ] Service worker → tools section becomes a PWA (offline).

## Phase 4 — subdomain ladder (3-6 months out)

- [ ] Promote `fido.ambimat.com` from demo to full product portal.
- [ ] Stand up `onepass.ambimat.com`.
- [ ] Stand up `docs.ambimat.com`.
- [ ] Stand up `applets.ambimat.com` once JavaCard applet content reaches critical mass.
- [ ] Cross-link, canonicalize where appropriate.

## Maintenance cadence

- Weekly: 1-2 blog posts during Phase 3, 0-1 in steady state.
- Monthly: tool additions, blog post updates, sitemap regen, broken-link scan.
- Quarterly: pillar post refresh; product detail review; certifications page update.
- On product launch: dedicated landing page + blog post + tool (where applicable) + datasheet.

## Hosting & deployment

- Hostinger static hosting (existing). Push via SFTP or Hostinger Git deploys.
- LiteSpeed handles `.htaccess` 301s natively.
- HTTPS already on; HSTS already on.
- No build step required for Phase 1-2. If we add a Markdown→HTML pipeline for blog in Phase 3, run it locally and ship the rendered HTML.

## What's intentionally NOT here

To avoid the "marketing-site bloat" trap:

- No bespoke CMS. Blog is HTML files in `/blog/<slug>/index.html`. Adding a post = adding a file. Search reach matters more than authoring ergonomics until volume is >100 posts.
- No newsletter platform integrated until Phase 3 (link out to Mailchimp/Buttondown/etc. when ready).
- No live chat in Phase 1 — contact form + email + phones is enough.
- No JS framework. Period.
- No A/B testing infra in Phase 1 — launch first, optimise once we have traffic.
