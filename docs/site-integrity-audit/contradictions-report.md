# Internal-Contradictions Report

**Result: 0 material contradictions. 0 corrections required. 0 items requiring a human factual ruling.**

Every claim was checked against the source hierarchy in the task (explicit rulings → supplied materials → repo evidence → repeated site statements). The known historical issues named in the brief were re-verified on the **current** build and are already resolved. Two informational (non-defect) observations are recorded at the end.

Method: greps across all 319 source pages (excluding `dist/`), independent recomputation of every stated count from the rendered listings, and a full read of the highest-risk page (`about/certifications/`).

## High-risk topics checked and found consistent

### Certifications & security claims — CONSISTENT

| Ruling | Live/source state | Evidence |
|---|---|---|
| AmbiSecure must not claim its own FIDO certification | `about/certifications/` states verbatim: "AmbiSecure does not hold a directly listed FIDO certification under its own brand." FIDO L1 is listed only as a **customer-branded** implementation. | `about/certifications/index.html:78–84` |
| Banned "FIDO Certified Level 1 — Targeted / in evaluation pipeline" must not remain public | **Absent** from every file (source + build + docs). | grep, 0 hits |
| Customer-brand certification allowed when supported | FIDO L1 presented as "certified through a customer implementation … held under that customer's brand." Three conformance-mark figures labelled "customer-branded." | `about/certifications/index.html:70–127` |
| Don't conflate brand / customer product / chip / target | Page separates **Active** (FIDO L1 customer-branded), **Standards we build against** (conformance ≠ cert), **Targets — not yet awarded**, **Compliance frameworks supported**. | `about/certifications/index.html:62–193` |
| Common Criteria must distinguish brand vs AmbiSEC module vs 3rd-party chip | Every EAL claim is scoped to **silicon/secure element** ("CC EAL6+ silicon", "…from a partner vendor", "at the chip level"). Product-level CC explicitly disclaimed. | `products/*`, `industries/connected-mobility/index.html:158–159`, `about/certifications/index.html:169` |
| Approved EAL positioning (min EAL5+, newer EAL6+) | Stated verbatim: "…evaluated to EAL5+ or EAL6+… AmbiSEC module and current hardware platforms use a minimum assurance level of EAL5+, and newer products use or are moving to EAL6+ silicon… does not mean the complete AmbiSecure-branded product is independently Common Criteria certified." | `about/certifications/index.html:169` |
| Don't claim AmbiSecure itself holds EAL5+/EAL6+ | No such claim found. Product spec rows say "Customer implementation certified to FIDO L1; CC EAL6+ chip" and "Certification target". | grep across `products/*` |
| "phishing-proof" prohibited | **Absent.** Copy uses "phishing-resistant" throughout. | grep, 0 hits (fixed in commit `c282273`) |

**Certificate details on record (from the repo):** FIDO L1 conformance figures reference `assets/img/certifications/cert-fido-onepass-{card,usb-key,server}.{webp,png}`, each captioned as customer-branded and stated to be independently verifiable at fidoalliance.org. No certificate IDs are published on the site (page says "supplied on request, then independently verifiable") — consistent with the ruling, no fabrication.

### Numbers & counts — CONSISTENT (independently recomputed)

| Claim | Stated | Actual (recomputed from rendered listing) | Status |
|---|---|---|---|
| Engineering references | **18** | 18 linked slugs = 18 `/references/*/` dirs | ✅ (historical 17-vs-18 resolved) |
| Tag-page post counts | per page | 23 tag pages checked, **0 drift** | ✅ |
| `/tags/` index card counts | per card | match rendered tag pages | ✅ (`audit-counts.py`) |
| Copyright year | © 2026 | uniform across **318/318** pages | ✅ |

### Company information — CONSISTENT

- Entity: **Ambimat Electronics** (parent); **AmbiSecure** is "the security business unit of Ambimat Electronics." No AmbiSecure/AmbiMat confusion.
- Founding/heritage: **1982** (Ambimat, "shipping electronics since 1982", "established 1982", Ahmedabad) and **2017** (AmbiSecure "identity systems since 2017"). Other years found are unrelated: `2001` = Singapore EZ-Link card in a blog article; `2004` = IEEE 1609.2 epoch in a V2X code sample. **No founding-date contradiction.**
- Contact: US `+1 215 397 3819` and India `+91 79255 01989` — same numbers in display vs `tel:` formatting. Emails all `@ambimat.com` (`support@` primary; `security@`, `ambisecure@` for distinct purposes). Consistent.

### Metadata vs body — CONSISTENT

- 25 pages have an editorial H1 that differs in wording from the SEO `<title>` (e.g. title "Engineering Blog — AmbiSecure" / H1 "Practical, code-first writing on hardware-rooted security"). Each is **topically aligned**; this is a deliberate, consistent voice pattern, not a contradiction.
- Archive meta descriptions spot-checked accurately summarise their article bodies (historical "meta promises content not in body" issue not reproduced).

### Terminology — CONSISTENT

`passwordless`, `passkeys`, `FIDO2`, `U2F`, `WebAuthn`, `MFA`, `secure element`, `AmbiSEC`, `OnePass`, `BioKey` used consistently and with correct distinctions. No conflated meanings found.

## Informational observations (not defects, no change made)

| # | Observation | Why not a defect |
|---|---|---|
| I-1 | Product URL slugs `products/fido2-nano-sim-applet/` and `products/piv-nano-sim-applet/` use "nano-sim", while the user-facing product name is consistently "FIDO2/PIV **Nano-Card** Applet" (23 references each). | The slug is a stable technical identifier never shown as a product name; no page presents two names to the user. Changing slugs would break links/redirects — out of scope and higher-risk than the (nil) benefit. Flagged for awareness only. |
| I-2 | `industries/index.html:52` — "Six verticals where AmbiSecure has built, certified, and deployed". | "certified" here is a general verb about vertical work (consistent with customer-branded certified deployments), not a specific false certification claim. Defensible; left as-is. |

No item rose to the threshold of a factual conflict requiring a human ruling.
