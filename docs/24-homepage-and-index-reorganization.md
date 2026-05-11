# 24. Homepage / Index Reorganization

**Date:** 2026-05-11
**Status:** Implemented.

The home page evolved across 8 phases. Phase 9 gives it a cohesive editorial pass without redesigning.

---

## 1. Section order — before vs after

| # | Phase 8 | Phase 9 | Change |
|--:|---------|---------|--------|
| 1 | Hero | Hero | unchanged |
| 2 | "What we build" (capabilities) | **Core pillars** | **NEW** between hero and capabilities; 7 pillar cards (FIDO/WebAuthn, JavaCard, DESFire/Transit, PKI, Secure Elements, eSIM, OnePass). |
| 3 | Capabilities ("Six surfaces, one trust chain") | Capabilities | unchanged |
| 4 | Trust chain | Trust chain | unchanged |
| 5 | Solutions | Solutions | unchanged |
| 6 | Resources strip | Resources strip | unchanged |
| 7 | Start here band | Start here band | unchanged |
| 8 | Explore by use case | Explore by use case | unchanged |
| 9 | Why AmbiSecure | Why AmbiSecure | unchanged |
| 10 | Highlight banner | Highlight banner | banner config now includes a "Videos" entry |
| 11 | Blog spotlight (rotating) | Blog spotlight (rotating) | unchanged |
| 12 | (gap) | **Videos teaser** | **NEW** — 3 video cards + "Browse all" CTA. |
| 13 | Historical insight | Historical insight | now uses `alt` background for visual rhythm |
| 14 | (gap) | **Where AmbiSecure fits** | **NEW** — 5-step arch + 3 trust cards (Trust center, Certifications, Partners). |
| 15 | Bottom callout | Bottom callout | unchanged |

Net effect: 3 new sections inserted at strategic points in the existing flow. No section removed. The order tells a coherent story:

1. **What we do** (hero → pillars → capabilities → trust chain)
2. **What we ship** (solutions → resources → start here → use cases → why us)
3. **What we say** (banner → blog spotlight → videos → historical archive)
4. **How we deliver** (where AmbiSecure fits → callout)

---

## 2. Pillars section — design rationale

The 7 pillars are the spine of the AmbiSecure technical proposition. Each card links to the deepest authoritative page for that pillar (technology hub or product hub, not the solution page) because the visitor on a pillar card is technical-evaluation-stage, not commercial-comparison-stage.

| Pillar | Linked surface |
|--------|----------------|
| FIDO / WebAuthn | `/technologies/fido/` |
| JavaCard | `/technologies/javacard/` |
| DESFire / Transit | `/technologies/desfire/` |
| PKI / Certificates | `/products/digital-signature-token/` |
| Secure Elements | `/technologies/secure-elements/` |
| eSIM Security | `/products/esim-solution/` |
| OnePass Ecosystem | `/products/onepass-platform/` |

Visual: red left-border (default), shifts to cyan on hover. Compact card — 3-4 lines per pillar — so the row stays scannable.

---

## 3. Videos teaser — design rationale

The teaser surfaces 3 of the 7 hosted videos:

1. **AmbiSecure card — all use cases** (YouTube facade). The marquee product video.
2. **Set up the AmbiSecure card on Gmail** (YouTube facade). The most-used FIDO setup walkthrough.
3. **BioKey product loop** (self-hosted `<video>` with `preload="none"`). A short looped product hero.

The mix of click-to-play YouTube + self-hosted demonstrates both delivery modes without paying YouTube's bandwidth bill on initial render.

CTA: "All AmbiSecure videos →" to `/videos/`.

---

## 4. Where AmbiSecure fits — trust storytelling

This is the "customer trust layer" required by Phase 9, without inventing customer claims.

The 5-step architecture diagram uses the existing `.arch` component:

```
Silicon → Applet → Personalise → Form factor → Validate
```

Each step is one concrete capability AmbiSecure delivers, framed as part of one engineering team's work rather than as a multi-vendor RFP. The accent step (step 3, Personalise) is the bit most buyers underestimate — making it visually accented draws attention to the operational rigour.

Below the arch: 3 cards link to the trust surfaces:

- `/trust/` (vulnerability disclosure, security model)
- `/about/certifications/` (active certifications + targets + disclaimers)
- `/partners/` (partner programme front door)

The section's headline ("From wafer to user, in one stack") plus the supporting paragraph ("AmbiSecure is the layer between the silicon vendor and the application developer") positions AmbiSecure against the typical fragmented-procurement experience buyers know well.

---

## 5. Editorial discipline — what was *not* changed

| Decision | Why |
|----------|-----|
| Hero copy kept verbatim | Phase 1 copy is still on-brand and concise. |
| "What we build" / "Trust chain" / "Solutions" / "Why AmbiSecure" sections untouched | These were carefully tuned across phases 1-5; further edits would be churn. |
| Banner copy untouched (config-driven; editors rotate themselves) | The banner system is JSON-driven by design. New banner entries (e.g. for case studies) are added via `highlight-banner-config.js`, not the template. |
| Footer structure unchanged | The Phase 8 footer already lists Products / Engineering / Company / Contact columns. Engineering column now includes a "Videos" link added in the video-page-generator chrome but the home-page footer is unchanged. |

---

## 6. Maintainability

| Surface | How to edit |
|---------|-------------|
| Pillar list | Edit `index.html` — inline `<a class="pillar-card">` block. No JSON / no JS. |
| Pillar styling | `assets/css/main.css` `.pillars-grid` / `.pillar-card` blocks. |
| Banner | Edit `assets/js/highlight-banner-config.js`. |
| Blog spotlight | Auto-rotates daily via `assets/js/blog-spotlight.js`; data lives in `assets/js/blog-pool.js` (autogenerated). |
| Videos teaser | Hard-coded 3 cards in `index.html`. To change the surfaced 3, edit the home page. The video pages themselves are generated by `/tmp/gen-videos.py`. |
| Where AmbiSecure fits | Hard-coded in `index.html`. Architectural messaging; doesn't rotate. |

No new build step. No new framework. No new config file beyond what already exists.

---

## 7. Accessibility checks

| Check | Status |
|-------|--------|
| H1 unique on the home page | ✓ |
| Section landmarks (`aria-labelledby`) on every new section | ✓ (`pillars-heading`, `videos-heading`, `fit-heading`, `historical-heading`) |
| Pillar cards keyboard-focusable | ✓ (native `<a>`) |
| Video facade buttons keyboard-activatable | ✓ (native `<button>`, Enter/Space activates) |
| Poster `<img alt>` describes the linked video | ✓ |
| `prefers-reduced-motion` | ✓ (existing global rule clamps animations) |
| Color contrast on the new pillar / video / fit cards | ✓ (uses existing design-system tokens) |

---

## 8. Performance check

After Phase 9 the home page weight (uncompressed HTML) grew from ~26 KB to ~36 KB. Wire weight (gzip) ~7 KB. Within Lighthouse Performance ≥95 budget.

Image cost:

- 6 new WebP thumbnails referenced in the home page video teaser load lazily (only 2 thumbnails are above the fold on average viewports; the rest are below).
- Self-hosted bio video `preload="none"` — no network call until clicked.
- YouTube facade poster is the 80-120 KB WebP thumbnail, not the iframe.

JS cost:

- `+video-facade.js` (~1.5 KB minified). Already deferred.

---

## 9. SEO check

- `<title>`, `<meta description>`, canonical, OG, Twitter card, JSON-LD all preserved from Phase 8.
- New sections add no schema injection risk (only inline content + existing JSON-LD `Organization` / `WebSite` blocks unchanged).
- Internal link graph: home page now links to `/videos/`, `/trust/`, `/about/certifications/`, `/partners/`, all 7 pillar landings, and selected video pages. Crawl depth from `/` to any product/service/blog/video page is now ≤2 hops.

---

## 10. Test plan after each homepage edit

Before any future home-page commit:

1. `xmllint --noout sitemap.xml`
2. Open `/` in a browser, DevTools Console — confirm no JS errors.
3. Verify the rotating spotlight populates after ~1 second (deferred script).
4. Verify the banner shows (or the slot collapses if no banner is enabled).
5. Click the YouTube facade in the videos teaser — confirm the iframe replaces the poster.
6. Run Lighthouse manually against the home page; confirm Performance ≥95.

---

## 11. Future polish (rolls into docs/22 backlog)

- **Customer-story rotation** on the home page once Phase 10 ships case studies. Reuse the highlight-banner JSON pattern with a new mount point and a new config file.
- **Web Vitals beacon** once analytics is enabled — exposes Real User Monitoring data per home-page section.
- **Per-section OG images** (Phase 12) so home-page social previews are story-appropriate per share context.

All listed in `docs/22` §3 (future-phase backlog).
