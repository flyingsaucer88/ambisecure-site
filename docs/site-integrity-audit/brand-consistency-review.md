# Brand-Consistency Review

Method: extracted every indexable page's `og:image` from the **built** tree, hashed each image (md5) against the 27 approved package files, verified dimensions/format with Pillow, and visually inspected representative images plus all off-brand candidates via contact sheets (`scratchpad/sheet_approved_gen.png`, `scratchpad/sheet_oldstyle.png`). Perceptual de-duplication was cross-checked against the repo's own dHash audit (`tools/audit-og-images.py`, 50k+ pairs, threshold 12/4096).

## Derived design system (from the 27 approved images)

| Attribute | Observed system |
|---|---|
| Canvas / aspect | 1200×630 PNG, 1.905:1 (LinkedIn/OG standard), ~80–115 KB |
| Background | Off-white (#F…) with a faint square grid |
| Kicker | Small letter-spaced mono label, top-left (e.g. `PLATFORM · HARDWARE-ROOTED IDENTITY`, `BLOG CATEGORY`, `TECHNICAL ARTICLE`) |
| Accent | Short red horizontal rule above the headline; solid red triangular wedge in the bottom-right corner |
| Headline | Large bold Montserrat-style sans, 2–3 lines, upper-left quadrant, inside a safe area |
| Dek | One/two lines of grey supporting text under the headline |
| Diagram pane | Right ~40% of the canvas: schematic nodes/boxes/arrows with selective red accents (chip, key, card, cloud, PKI, flow) — this is where page-specific content lives |
| Logo lockup | AmbiSecure flame mark + "Ambi" (black) "Secure" (red) wordmark, bottom-left |
| Typography | Montserrat (headline) + Source Sans (dek) + JetBrains Mono (kicker/labels) — matches `_ds/` bundle in the package |
| Iconography | Thin-line, single-weight, red-accented; no photography, no stock imagery |
| Legibility | Headline readable at thumbnail size; strong contrast on off-white |

## Classification of every featured image (318 indexable pages)

| Class | Count | Notes |
|---|---|---|
| **Approved reference image** | 27 | Byte-identical (md5) to the package; mapped to the exact delivery-sheet page; alt matches delivery sheet |
| **Brand-consistent** (generated featured art) | 284 | Same design system as the 27 — verified visually on samples (blog archive, category, references, tags, timelines, about/certifications) and technically (1200×630 PNG, unique, on `/og/featured/`) |
| **Inconsistent — replacement needed** | 7 | Older dark template (see below) |

No page below "Brand-consistent" other than the 7 old-template images. **0 exact-duplicate** and **0 perceptual-duplicate** groups across the 318 (independently and via the repo's dHash audit). **0 shared images** — every page has a unique file.

## The 7 inconsistent images — exact reasons

All 7 use the **older "dark title-card" template**, which violates the approved system on every major axis:

- **Background:** dark charcoal gradient — approved system is off-white with a grid.
- **Layout:** left vertical red bar + centred serif headline — approved system has a top-left red rule, corner wedge, and left-aligned Montserrat.
- **Typography:** white serif (Times-like) headline — approved system is bold Montserrat sans.
- **Missing brand furniture:** no AmbiSecure flame/wordmark lockup, no mono kicker, no diagram pane, no corner wedge.
- **Weight:** 365–383 KB vs 80–115 KB for the approved/generated art (heavy gradient render).

| Page | Image file | Disposition |
|---|---|---|
| `/products/fido2-nano-sim-applet/` | `assets/img/og/fido2-nano-sim-applet.png` | **Content page → new Claude Design work** |
| `/products/iot-security-applets/` | `assets/img/og/iot-security-applets.png` | **Content page → new Claude Design work** |
| `/products/pkcs-signature-suite/` | `assets/img/og/pkcs-signature-suite.png` | **Content page → new Claude Design work** |
| `/products/secure-mail-suite/` | `assets/img/og/secure-mail-suite.png` | **Content page → new Claude Design work** |
| `/services/epassport-platform/` | `assets/img/og/epassport-platform.png` | **Content page → new Claude Design work** |
| `/blog/page/2/` | `assets/img/og/blog.png` | Pagination branding (utility) — low priority; documented category image |
| `/search/` | `assets/img/og/search.png` | Utility page — low priority; documented category image |

These are technically valid (1200×630 PNG, live 200) — the issue is **brand style only**. No approved or brand-consistent alternative exists in the repo for the 5 content pages, so they are routed to `claude-design-handoff.md`. **Per the task rules, no replacement artwork was generated.**

## Approved-image mapping results (27/27 correct)

Every delivery-sheet page uses the exact intended file (filename match) and byte-identical bytes (md5). Alt text on each of the 27 matches the delivery sheet. Full per-page evidence in `page-image-inventory.csv` (`is_approved`, `approved_file`, `mapping_ok` columns) and `site-integrity-results.json`.
