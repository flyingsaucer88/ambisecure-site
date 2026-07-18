# Changes Made

> **✅ UPDATE 2026-07-18T09:19Z — DEPLOYED AND LIVE-VERIFIED.** The 5-image change set below was committed as `736e2e6`, pushed to `origin/main`, and deployed via **Deploy to Hostinger**. Post-deployment verification (fresh no-cache crawl) confirms: all 5 live pages reference the correct new images; each live image is byte-identical (SHA-256 + MD5 + `cmp`) to the committed file; all 5 old `assets/img/og/<slug>.png` covers return 404; the 291-page `twitter:image:alt` fix (`9b9de48`) is live; the full 318-page live re-crawl passes with zero defects. No source changes were required by verification. Full evidence in [live-verification.md](live-verification.md) and [site-integrity-results.json](site-integrity-results.json).
>
> **UPDATE 2026-07-18 (5-image integration) — second change set (separate commit).**
>
> **Added (5 assets):** `assets/img/og/featured/ambisecure-products-fido2-nano-sim-applet-1200x630.png`, `…-products-iot-security-applets-…`, `…-products-pkcs-signature-suite-…`, `…-products-secure-mail-suite-…`, `…-services-epassport-platform-1200x630.png` — the approved Claude Design images from `docs/Shared design link.zip`, copied byte-identically.
>
> **Deleted (5 old off-brand assets):** `assets/img/og/{fido2-nano-sim-applet,iot-security-applets,pkcs-signature-suite,secure-mail-suite,epassport-platform}.png`.
>
> **Edited (5 pages):** `products/fido2-nano-sim-applet/`, `products/iot-security-applets/`, `products/pkcs-signature-suite/`, `products/secure-mail-suite/`, `services/epassport-platform/` `index.html` — repointed `og:image` + `twitter:image` to the new `/assets/img/og/featured/…` URL, added `og:image:secure_url` (approved-27 convention), and replaced `og:image:alt` + `twitter:image:alt` with the final vetted alt text. No visible-hero change (the OG image is social-only; the on-page hero is a separate product SVG). No JSON-LD `image` field exists on these pages.
>
> **Edited (audit script):** `tools/audit-og-images.py` — removed the 5 pages from `NON_FEATURED_ALLOWED`, keeping only the 2 documented utility exceptions (`blog.png`, `search.png`). The five pages are now subject to normal featured-image checks (negative-tested).
>
> **Docs updated:** all files in `docs/site-integrity-audit/` (this file, executive summary, brand review, handoff, live verification, inventory CSV, results JSON).
>
> Why: fulfils the approved handoff; brings all content pages onto the featured-art brand system; removes now-unnecessary audit exceptions. `dist/` gitignored; the two prior commits (`c739bbf`, `9b9de48`) are untouched. Full original change log below.

---


One focused change set. No deployment config, secrets, domains, FTPS, analytics, Lighthouse CI, or page content/claims were altered. `dist/` is gitignored and not committed.

## 1. `twitter:image:alt` added to 291 source pages

**Files:** 291 `**/index.html` source pages (all indexable pages that had `og:image:alt` + `twitter:image` but no `twitter:image:alt`).

**What:** inserted one line immediately after the existing `twitter:image` tag:
```html
<meta name="twitter:image:alt" content="…verbatim copy of this page's og:image:alt…" />
```

**Why:** the 27 approved pages already carried `twitter:image:alt`; the other 291 did not, leaving an og/twitter alt-consistency gap and weaker accessibility on X/Twitter shared cards. The fix **mirrors the existing, already-vetted `og:image:alt` string verbatim** (same HTML-escaping), so it introduces **no new claim or wording** — purely a consistency/accessibility correction. This is the "adding accurate alt text" correction permitted by the task.

**Evidence it's safe/mechanical:** each diff is a single added line equal to the page's own `og:image:alt`. Example (`resources/tools/imsi-decoder/index.html`):
```
+<meta name="twitter:image:alt" content="IMSI digits divided into MCC, MNC and MSIN with a movable operator boundary, showing how AmbiSecure&#x27;s local decoder identifies a home PLMN." />
```

**Verification:** after rebuild, independent inventory reports `twitter_image_alt` gap = **0** (was 291); full `tools/audit-all.sh` passes.

**Live status:** applied locally only. Live pages outside the original 27 still lack the tag until deploy. **Deployment required.**

## 2. `tools/audit-og-images.py` — regression hardening

**Two checks added (both negative-tested — they fire on a deliberately broken build):**

- **`twitter:image:alt` consistency:** fails if a page has `twitter:image` + `og:image:alt` but is missing `twitter:image:alt`, or if the two alt strings differ. Prevents change #1 from silently regressing.
- **Off-brand `og:image` guard:** fails if an indexable page's `og:image` is not under `assets/img/og/featured/` (nor a real video thumbnail) and not in a new, explicitly documented `NON_FEATURED_ALLOWED` allowlist. Catches any **new** page shipping with an old-template / generic image.

**`NON_FEATURED_ALLOWED`** lists the 7 known exceptions (2 utility/category images + 5 legacy product/service pages pending Claude Design redesign, cross-referenced to `claude-design-handoff.md`). This surfaces the known debt without breaking the build; entries are to be removed as each page moves onto the featured-art system.

**Why here:** `audit-og-images.py` already audits the built tree for OG coverage/dimensions/duplicates and runs inside `tools/audit-all.sh` (the deploy gate). Extending it keeps regression protection in the existing safety net with no new dependency (Pillow already declared in `tools/requirements-audit.txt`).

## Not changed (deliberately)

- **The 7 off-brand images** — cannot be corrected without generating artwork (prohibited). Routed to `claude-design-handoff.md`.
- **Certification / EAL / count / company wording** — audited and already consistent; no edit warranted.
- **Product URL slugs** (`*-nano-sim-applet`) — legacy identifiers; changing them risks link breakage for no user-facing benefit (see `contradictions-report.md` I-1).
- **The 3 untracked `docs/` files** from prior work — preserved, not touched, not committed.
