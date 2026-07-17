# AmbiSecure — Resource and Blog featured-image inventory summary

**Date:** 2026-07-17

**Crawl sources:** live site `https://ambisecure.ambimat.com/` (robots.txt, sitemap.xml, rendered HTML,
canonical links, internal links) cross-checked against the static-site repo of record, verified in sync.

**Scope:** individual Resource and Blog pages that need a unique LinkedIn / Open Graph featured image.

---

## Totals

| Metric | Count |
|---|---:|
| Total URLs discovered (sitemap) | 318 |
| Total Resource pages (eligible) | 105 |
| Total Blog pages (eligible) | 60 |
| **Total eligible design pages** | **165** |
| Total excluded URLs | 154 |
| Total pages using resources.png | 83 |
| Total pages using blog.png | 37 |
| Total pages using other duplicate images | 45 |
| Total pages with no featured image | 0 |
| Pages retired (410 Gone) | 1 |
| Total redirects | 0 |
| Total canonical duplicates | 0 |
| Total broken pages (non-200) | 0 |

Every discovered URL returned HTTP 200, was self-canonical, and carried no `noindex`. No redirect chains,
no canonical duplicates, and no trailing-slash or tracking-parameter variants were found: the site emits
clean, consistently-slashed paths, and robots.txt disallows query-string variants outright.

### Verifying the reported estimates

The task reported ~84 pages on `resources.png` and ~59 on `blog.png`. The crawl **confirms 83 and 59** —
but the raw `blog.png` count is misleading, and the estimate missed a large block of duplication:

| Current image | Pages (site-wide) | In eligible set | Where the rest went |
|---|---:|---:|---|
| `resources.png` | 83 | 83 | all eligible |
| `blog.png` | 59 | 37 | 22 are category archives (excluded) |
| `blog-archive.png` | 25 | 24 | 1 is the archive listing page (excluded) |
| `references.png` | 19 | 19 | all eligible |
| `connected-mobility.png` | 3 | 2 | 1 is an industries page (out of scope) |
| `default.png` | 2 | 1 | 1 is out of scope |

**The duplication is materially worse than reported.** Beyond the 84/59 estimate, another **46 pages**
reuse a generic image: 24 legacy `blog-archive.png` articles and 19 `references.png` reference pages —
a whole engineering reference library sharing one picture — plus 3 one-off reuses. Conversely, only 37 of
the 59 `blog.png` pages are real articles; the other 22 are category archives that should not get artwork.

## Content-type distribution

| Page type | Count |
|---|---:|
| PARSER | 31 |
| ENGINEERING TOOL | 23 |
| REFERENCE DATABASE | 17 |
| SECURITY ANALYSIS | 12 |
| PROTOCOL REFERENCE | 11 |
| ARCHITECTURE ARTICLE | 11 |
| CALCULATOR | 10 |
| TECHNICAL EXPLAINER | 10 |
| COMPARISON | 8 |
| INDUSTRY ARTICLE | 8 |
| TECHNICAL ARTICLE | 6 |
| STANDARDS EXPLAINER | 6 |
| HOW-TO ARTICLE | 3 |
| THOUGHT LEADERSHIP | 2 |
| ARCHITECTURE GUIDE | 2 |
| PRODUCT EDUCATION | 2 |
| OTHER BLOG | 1 |
| DOWNLOADABLE RESOURCE | 1 |
| OTHER RESOURCE | 1 |

## Topic distribution

| Primary topic | Count |
|---|---:|
| Other | 25 |
| PKI | 13 |
| APDU | 12 |
| WebAuthn | 11 |
| Smart cards | 9 |
| V2X | 8 |
| BER-TLV | 8 |
| FIDO2 | 8 |
| Transit security | 8 |
| Secure Elements | 8 |
| JavaCard | 6 |
| NFC | 6 |
| IoT security | 6 |
| Government identity | 5 |
| Phishing-resistant authentication | 4 |
| SIM/eSIM | 4 |
| Hardware security keys | 3 |
| Passwordless authentication | 3 |
| Embedded security | 3 |
| Attestation | 2 |
| PIV | 2 |
| Passkeys | 2 |
| Enterprise access | 2 |
| Biometric authentication | 2 |
| ATR | 1 |
| Telecom authentication | 1 |
| Provisioning | 1 |
| Device identity | 1 |
| Certificate lifecycle | 1 |

## Design-priority distribution

| Priority | Count | Meaning |
|---|---:|---|
| P1 | 53 | Commercial relevance, buyer/product tie-in, strong LinkedIn and search value |
| P2 | 75 | Useful engineering reference, shareable technical content, supports expertise |
| P3 | 37 | Narrow utility, supporting reference, older article, consolidation candidate |

Priority 3 pages are retained in the design inventory as instructed — none were dropped automatically.

## Visual similarity groups

29 groups across 165 pages.

In a library of this shape, several groups necessarily exceed three members — 28 reference tables and 25
byte-level parsers are simply what AmbiSecure publishes. Rather than force artificial groups, every member
of an oversized group carries an explicit variation in its Visual Concept: a distinct dominant object, node
set, or flow, with the real byte fields or data values that page decodes. **Claude Design should treat any
group over three as a warning to check the variation, not as licence to repeat a composition.** The largest
groups are where repetitive artwork is most likely and deserve the closest review.

| Group | Pages | Repetition risk |
|---|---:|---|
| VSG-REFERENCE-TABLE | 28 | HIGH — verify each variation |
| VSG-BYTE-PARSER | 25 | HIGH — verify each variation |
| VSG-ENCODING-CONVERTER | 14 | HIGH — verify each variation |
| VSG-TIMELINE | 11 | HIGH — verify each variation |
| VSG-THREAT-LANDSCAPE | 10 | HIGH — verify each variation |
| VSG-COMPARISON-MATRIX | 10 | HIGH — verify each variation |
| VSG-FIDO-CEREMONY | 8 | Medium |
| VSG-CERT-STRUCTURE | 6 | Medium |
| VSG-CRYPTO-CALC | 6 | Medium |
| VSG-TRANSIT | 6 | Medium |
| VSG-SE-ARCHITECTURE | 6 | Medium |
| VSG-PKI-LIFECYCLE | 4 | Medium |
| VSG-ENTERPRISE-ACCESS | 4 | Medium |
| VSG-EPASSPORT | 3 | Low |
| VSG-JSON-WORKBENCH | 3 | Low |
| VSG-CHECKSUM-CALC | 3 | Low |
| VSG-SIM-ESIM | 3 | Low |
| VSG-BIOMETRIC-MATCH | 2 | Low |
| VSG-IOT-DEVICE | 2 | Low |
| VSG-V2X-NETWORK | 2 | Low |
| VSG-DIAGRAM-WORKBENCH | 1 | Low |
| VSG-CARD-LIFECYCLE | 1 | Low |
| VSG-CONTENT-HUB | 1 | Low |
| VSG-SECURE-CHANNEL | 1 | Low |
| VSG-SCRIPT-LINTER | 1 | Low |
| VSG-GOV-IDENTITY | 1 | Low |
| VSG-ENTROPY-PIPELINE | 1 | Low |
| VSG-APPLET-LIFECYCLE | 1 | Low |
| VSG-MARKUP-FORMATTER | 1 | Low |

## Exclusions

| Reason | Count |
|---|---:|
| Out of scope: not a Resource or Blog page | 71 |
| Tag archive | 32 |
| Out of scope (not Resource/Blog) — already in approved 27-image priority package | 26 |
| Category archive | 21 |
| Resource directory landing page with approved unique image (ambisecure-resources-1200x630.png) | 1 |
| Archive listing/directory page (not an article) | 1 |
| Pagination URL | 1 |
| Removed from site — body copy conflicted with AmbiSecure product positioning | 1 |

Notable exclusion calls:

- **The 27-image approved package** is excluded — those pages already have unique artwork assigned
  (`ambisecure-*-1200x630.png`). None of them is an individual Resource or Blog page.
- **`/resources/` is excluded** (it holds an approved unique image) but **`/blog/`, `/references/` and
  `/resources/timelines/` are INCLUDED** — the exclusion rule for directory landings is conditional on
  already having an approved unique image, and these three still reuse a generic one. They are briefed as
  hub pages, not articles.
- **`/blog/archive/` (the listing) is excluded**, but its **24 child articles are included** — they are
  real, indexable, self-canonical content, merely older.
- **32 tag archives, 21 category archives and 1 pagination page** are excluded per the rules and are
  recorded with reasons in the exclusions CSV.

## Ambiguous classifications

Recorded per-row in the `Notes` column; the recurring ones:

- **Hub pages briefed as hubs.** `/blog/`, `/references/` and `/resources/timelines/` are directory
  landings that qualify only because they lack approved artwork. Each is briefed with a set-spanning
  concept rather than a single-topic one. Confirm this is wanted before design spend.
- **Topic list gaps.** Several crypto-primitive tool pages (SHA hashing, ECC curves, CRC/LRC/checksum,
  bitwise calculators) have no accurate `Primary Topic` in the prescribed list and are typed `Other`. If
  this family matters, the taxonomy needs a "Cryptographic primitives" entry.
- **Batch-name vs. page reality.** Several pages filed under a parser family are in fact builders,
  calculators, linters or references (APDU Builder, SCP03 Helper, BER Length, APDU Script Validator,
  ISO 14443 / EMV tag references). They were classified on actual content, not path.
- **Dual-nature pages.** ECC Curve Reference and RSA Key Formats are reference tables *plus* live demo
  generators; briefed on the durable reference value with the generator subordinate.

## Pages needing human review

The crawl surfaced live content defects. These are page problems, not briefing problems, and several
should be fixed **before** artwork is commissioned for the affected page.

### Credibility and accuracy risks (fix first)

1. **`/references/aaguids/` publishes placeholder AAGUIDs for AmbiSecure products.** Two rows carry
   invented values (`f2b8b8b8-…` OnePass Card, `a1a1a1a1-…` OnePass USB Key) sitting alongside genuine
   Yubico/Apple/Google entries. Fake identifiers for your own products on a public engineering reference
   is a credibility risk. Register real values or remove the rows. Also affects the AAGUID Lookup tool.
2. **`/references/emv-tags/` Tag column is broken.** Every row renders its filter category (`AID`,
   `card-data`, `crypto`) where the hex EMV tag should be, so 4F, 50, 9F02, 9F26 never display, and 56
   anchor IDs collapse to 9 duplicates. The reference does not currently do its job.
3. **FIDO MDS Explorer badges every authenticator `BE=0` (device-bound)** — including Apple iCloud Keychain
   and Google Password Manager, which are syncable. The page teaches the exact passkey conflation the
   design rules forbid.
4. **Six archive articles claim FIDO2 is "phishing-proof"** (and one calls it "the only phishing-proof
   factor"). It is phishing-*resistant*, and PIV certificates also qualify. Blocked in every affected
   avoid list, but the body copy remains wrong.

### Copy that contradicts the page or the product line

5. **`/blog/archive/security-future-for-government`** states smart cards are "expensive and cumbersome to
   deploy" — directly against the OnePass Card and embedded PIV applet line.
6. **Three archive pages promise content they do not deliver.** `emv-certification-in-public-transport`
   and `public-transport-ticketing-part-2` are sold by their meta descriptions and internal links as
   AmbiSecure validator/SAM/model-comparison pieces but are regional surveys; `iot-security-challenges-
   part-2` promises mitigations (root of trust, signed firmware, attestation) that never appear. All three
   were briefed to actual body content, not the promised framing.
7. **Stale or wrong technical claims in legacy copy:** `fast-identity-online` says FIDO uses "public-key
   encryption" (FIDO signs, not encrypts) and names a dead SKU "AmbiSecure Key"; `emv-certification-in-
   public-transport` presents EMV 4.2 as current (2008); `public-transport-ticketing-part-3` describes
   T-money via "satellite location data" (garbled); `consumer-biometrics-and-privacy` says TEE where
   AmbiSecure ships an SE.

### Consolidation candidates (decide before spending on images)

8. **Three 2021 India cyber-attack retrospectives** (`cyber-attacks-in-india` parts 1-3) are thin and
   would serve better as one piece. Note part 1 has no number in its H1, so its image must stay unnumbered.
9. **Three public-transport-ticketing parts** split by geography, not theme.
10. **Tool overlaps:** `sw-lookup` vs `apdu-status-dict` (same corpus); `ber-length` vs `length-field`
    (duplicate encode halves); `base64-cert` vs `x509-viewer` + `pem-der`; `tlv-tree-viz` and
    `asn1-tree-explorer` self-describe as companions to their linear siblings; the three JSON tools
    (formatter/validator/bin-builder) sit off-core for a hardware-security brand.
11. **`iot-security-challenges` parts 1-2 plus `securing-iiot-infrastructure`** cover one subject.

### Lower-severity notes

12. `/references/` hub says "17 engineering references" but 18 are published — no count may appear in art.
13. `/references/apdu-status/`: 6985, 6A80 and 6D00 each appear twice (ISO + FIDO U2F rows), colliding IDs.
14. `resources/tools/iso7816-cla` uses zero-indexed bit names (`b3..b2`) while ISO/IEC 7816-4 numbers
    b1..b8; briefs follow the site for consistency, but the page may warrant alignment.
15. JSON Validator claims a draft 2020-12 subset while JSON Bin Builder describes Draft-07 — same engine.
16. Typo in `/resources/timelines/piv/`: "for OEM and OEM and embedded identity programmes".
17. Thin bodies (<800 chars) that would benefit from enrichment before promotion: `javacard-cap`,
    `desfire-status`, `desfire-key-settings`, `length-field`, `ndef-decoder`, `ats-parser`, `base64url`,
    `endian`, `byte-offset-calculator`.

## Deploy state — separate from this task, but blocking

The approved 27-image package is **committed in the repo but not live**. `/resources/` serves
`resources.png` while the repo expects `assets/img/og/featured/ambisecure-resources-1200x630.png`, and
that URL currently returns **404** in production. The 27 images will not appear in any LinkedIn preview
until the site deploys. Worth resolving before adding 166 more images to the same pipeline.

## Validation

| Check | Result |
|---|---|
| Every eligible page has one unique row | PASS (165 rows) |
| Every canonical URL unique | PASS (165/165) |
| Every page has a design headline | PASS (166/166, all <= 8 words, none end in a period) |
| Every page has a visual concept | PASS (166/166, all distinct) |
| Every page has unique alt text | PASS (165/165) |
| Every page has a URL-based export filename | PASS (165/165 unique) |
| No excluded page appears in design inputs | PASS (0 overlap on canonical URL) |
| No directory/category/pagination treated as an article | PASS (3 hubs included, each typed and noted as a hub) |
| No generic resources.png / blog.png assignment overlooked | PASS (all 83 + 59 accounted for; 22 category archives excluded with reason) |
| No empty placeholder values | PASS (only optional Secondary Topics / Notes may be blank) |
| No malformed CSV rows | PASS (all files re-parsed after write; field counts uniform) |
| All output files UTF-8 | PASS |
| URLs clickable and complete | PASS (absolute https URLs) |
| Totals reconcile with CSV row counts | PASS (105 + 60 = 165; 165 eligible + 154 excluded = 319, matching 318 live URLs + 1 retired) |

Alt text: 135 of 165 are under 160 characters; the rest run to 175 at most,
within the "approximately 160 where practical" allowance, kept where trimming would have cost
technical accuracy.

## Site changes applied (2026-07-17)

This inventory was regenerated after four repository changes. Everything else is preserved from the
validated run; only records whose page was removed or materially edited were touched.

**1. The approved 27-image package now deploys.** Root cause: the 27 PNGs were untracked in git, so
the deploy workflow's fresh checkout never contained them and `/assets/img/og/featured/*.png` 404'd,
while the matching metadata edits were likewise uncommitted. The pipeline itself was never broken —
`build-hostinger-package.sh` rsyncs the whole assets tree with no filter on `og/featured`. Committing
the package fixes it. **The images are still not live: the deploy workflow is `workflow_dispatch` and
has not been run.**

**2. Three engineering-reference defects fixed.** Invented AmbiSecure AAGUIDs removed; the EMV Tag
column now renders real hex (all 56 tags were missing from the data, not merely mis-mapped); the FIDO
MDS explorer no longer badges syncable Apple/Google passkeys as device-bound.

**3. Seven positioning conflicts resolved.** Six archive articles claiming FIDO2 is "phishing-proof"
were corrected in place rather than deleted — the defect was one sentence each and they carry 45
internal links between them. One page (`/blog/archive/security-future-for-government/`) was retired
at 410 Gone: its argument, not one line, conflicted with the product line.

**4. Inventory rebuilt.** 319 -> 318 live URLs; 166 -> 165 eligible design pages.

### Corrections to the previous run's own briefs

Verification against page source caught two errors in the generated briefs:

- **Record 100 (`mfa-in-government`)** — the note claimed the body asserts "FIDO2 is the only
  phishing-proof factor". It does not, and never did; the page correctly cites phishing-resistant MFA
  as the federal baseline. The note is corrected and no body change was made. This is a reminder that
  brief notes are model-generated commentary and are not evidence about a page.
- **Records 98 and 106** — notes described "phishing-proof" body copy that has since been corrected.
  Updated. Their avoid-list entries stand: they govern the artwork, which must still never carry the
  phrase.

## Output files

| File | Contents |
|---|---|
| `AmbiSecure-resource-blog-master-inventory.csv` | All 165 eligible pages, 44 columns |
| `AmbiSecure-resource-design-input.csv` | 105 Resource pages needing artwork |
| `AmbiSecure-blog-design-input.csv` | 60 Blog pages needing artwork |
| `AmbiSecure-resource-blog-exclusions.csv` | 154 excluded URLs with reasons |
| `AmbiSecure-resource-blog-summary.md` | This file |
| `AmbiSecure-Claude-Design-batch-input.md` | Human-readable design document, one section per page |
