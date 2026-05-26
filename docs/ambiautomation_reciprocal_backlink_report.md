# AmbiAutomation Reciprocal Backlink Report

> Phase-7 implementation report for the AmbiSecure → AmbiAutomation cross-linking work. Companion to `docs/ambiautomation_backlink_strategy_audit.md`. Ship state captured at commits `2b3160c` (sitewide + initial contextual) and the follow-up commit adding `/industries/enterprise-access/` plus this doc.

## 1. Backlinks added

### 1.1 Sitewide navigational (mirrors existing eSIM Initiative pattern)

| Surface | Files affected | Anchor |
|---|---|---|
| Top ecosystem-bar | 267 HTML pages | `AmbiAutomation` |
| Footer ecosystem block | 266 HTML pages | `AmbiAutomation` |

Both are editorial nav links — Google treats sitewide footer/nav links to sibling sites as expected for company-group structures. They are not "spam blocks" because:

- They sit inside the existing `ecosystem-bar` and `footer-ecosystem` patterns, not in a freshly invented block.
- The same pattern already exists for `eSIM Initiative` and was added by AmbiSecure long before this work.
- No keyword-stuffed anchor text; it's the brand name in nav context.

### 1.2 Contextual editorial placements

| Page | Section | Anchor text | Justification |
|---|---|---|---|
| `industries/smart-cities/index.html` | "A city-wide credential, in practice" — new closing paragraph | `building-automation platform at AmbiAutomation` | Smart-city deployments touch civic buildings (hospitals, civic centres) where access control and HVAC converge. |
| `industries/enterprise-access/index.html` | "What changes when the door is also the second factor" — new paragraph | `facility-automation team within the Ambimat group` | Large enterprises, hotels, hospitals, campuses have both workforce access and a building-operator control plane. |
| `solutions/smart-access-control/index.html` | "When the door is the second factor" — new paragraph | `sister team building VRV/VRF retrofit automation` | Commercial-RE access readers and BACnet/MODBUS controllers share networks. |
| `products/iot-security-coprocessor/index.html` | "Deployment models" — new "Building automation controllers" card | `Ambimat building-automation platform` | BACnet/MODBUS controllers benefit from the AmbiSEC Module's hardware-rooted device identity. |
| `about/index.html` | New "Ecosystem" section before Engagement — three sibling-platform cards | `AmbiAutomation` (card title) + URL | Direct sibling-platform positioning. |

Total contextual placements on body content: **5 pages** (one paragraph each, or one card in the case of the iot-security-coprocessor and About pages).

### 1.3 Structured-data placement

| Surface | Type |
|---|---|
| Homepage `Organization` JSON-LD | `sameAs[]` array extended to include `https://ambiautomation.ambimat.com/` |
| `llms.txt` | New "Ecosystem" section disambiguating the four Ambimat platforms |

The two previously-duplicate `sameAs` keys in the homepage Organization block were merged into a single valid 6-entry array.

## 2. Pages modified

| Path | Change kind |
|---|---|
| `index.html` | Organization `sameAs[]` merged + extended |
| `industries/smart-cities/index.html` | Contextual paragraph added |
| `industries/enterprise-access/index.html` | Contextual paragraph added |
| `solutions/smart-access-control/index.html` | Contextual paragraph added |
| `products/iot-security-coprocessor/index.html` | "Building automation controllers" deployment card added |
| `about/index.html` | New "Ecosystem" section with three sibling-platform cards |
| `llms.txt` | New "Ecosystem" section |
| 267 HTML files | Ecosystem-bar entry added |
| 266 HTML files | Footer-ecosystem entry added |

## 3. Anchor texts used

Contextual anchors (5 distinct):

1. `Ambimat building-automation platform`
2. `building-automation platform at AmbiAutomation`
3. `sister team building VRV/VRF retrofit automation`
4. `facility-automation team within the Ambimat group`
5. `AmbiAutomation` (About-page card title only — branded once on body content)

Navigational anchors:

- Top ecosystem-bar: `AmbiAutomation` (same convention as `eSIM Initiative` next to it)
- Footer ecosystem block: `AmbiAutomation` (same convention)

No exact-match keyword-stuffed anchors. No "best HVAC" / "cheap automation" / promotional copy.

## 4. Contextual rationale per placement

| Page | Why the link belongs there |
|---|---|
| Smart cities | Civic buildings inside a smart-city programme have an HVAC/BMS layer that's AmbiAutomation's domain. Not generic IoT — specifically civic-building infrastructure. |
| Enterprise access | Large offices, hotels, hospitals, education campuses have a *building-operator* control plane alongside *workforce* access. Same network; different teams own each side. |
| Smart access control | Access-control panels and BACnet/MODBUS controllers in commercial RE live on the same network and increasingly share an IT/OT trust plane. |
| IoT Security Co-Processor | The product's hardware-rooted device identity is genuinely useful for BACnet/MODBUS controllers — a true engineering integration story, not corporate cross-promotion. |
| About — Ecosystem | About-page positioning is the right place to enumerate the three sibling Ambimat platforms (Ambimat / eSIM / AmbiAutomation). |

## 5. Entity-association improvements

- Homepage `Organization.sameAs[]` now enumerates the full Ambimat property family. This is the canonical schema-level entity-graph signal for "these properties are part of the same organisation."
- About-page Ecosystem section uses card-based UI to enumerate the three sibling platforms, with each card linking to its respective domain.
- `llms.txt` Ecosystem block explicitly tells AI engines that AmbiSecure, eSIM Initiative, AmbiAutomation, and Ambimat Electronics are **distinct entities, not duplicate content** — head-off the AI-collapse risk where multiple sibling sites under the same parent get treated as one.

Hierarchy clarity (verified across all copy):

- "sibling platforms" / "sister team" / "part of the Ambimat Group"
- No "AmbiSecure's automation product"
- No "powered by AmbiAutomation"
- No mischaracterisation of AmbiAutomation as a security product

## 6. SEO safety review

| Check | Outcome |
|---|---|
| Broken outbound link | None — `curl -I https://ambiautomation.ambimat.com/` returns 200 |
| Excessive backlink density | None — sitewide nav uses single editorial entry mirroring the existing eSIM Initiative pattern; ≤1 contextual link per modified page |
| Duplicate anchor over-use | None — 5 distinct contextual anchor variations + 1 navigational anchor |
| Hierarchy confusion | None — all copy frames the relationship as siblings under the Ambimat Group |
| Irrelevant placement | None — all 5 contextual placements are on pages whose own subject matter touches buildings or commercial real estate |
| Mixed content | None — all outbound links HTTPS |
| `nofollow` mistakes | None — sibling-site editorial links are *intentionally* dofollow (per Google guidance for editorial cross-links to legitimate related properties) |
| Footer spam | None — single sibling-site entry in the existing ecosystem block |
| Keyword stuffing | None — descriptive anchors, no exact-match repetition |
| Sitewide outbound-link equity drain | Acknowledged but not actionable today — AmbiSecure is currently indexed=0 (see `docs/GSC_RECOVERY_ACTION_PLAN.md`); no equity to drain yet. Forward-looking ecosystem positioning. |

## 7. Hierarchy-confusion checks

| Risk | Check |
|---|---|
| "AmbiSecure owns AmbiAutomation" | All copy uses sibling / sister / within-the-group framing |
| "AmbiAutomation depends on AmbiSecure" | The cross-links flow *from* AmbiSecure *to* AmbiAutomation, but the copy never positions one as the dependency of the other |
| "AmbiAutomation is a security product" | Every contextual mention describes AmbiAutomation as building/HVAC/facility automation; no copy mischaracterises it as a security product |
| `Organization` schema parent confusion | `parentOrganization` still correctly points to Ambimat Electronics; `sameAs[]` enumerates siblings — semantically these are different relationships in schema.org and are correctly used |

## 8. Validation results

- `bash tools/audit-all.sh` → **ALL AUDITS PASSED** (xmllint, lint-htaccess, audit-content, audit-seo, audit-media, audit-freshness, audit-yoast, audit-circular, audit-spam-seo).
- JSON-LD: all 267 blocks parse; homepage Organization sameAs is a single valid 6-entry array.
- Outbound link to `https://ambiautomation.ambimat.com/` returns HTTP 200.
- Anchor diversity: 5 distinct contextual anchor texts + 1 navigational anchor.
- No broken outbound links; no console errors expected (purely content / nav additions, no JS or CSS changes).
- Mobile rendering unaffected — the ecosystem-bar and footer-ecosystem already had a horizontal-scroll layout for narrow viewports; adding one more sibling entry stays within that layout. The new About-page Ecosystem section uses the existing `.grid-3` responsive class.

## 9. Future recommendations

When AmbiSecure's GSC indexing recovers (see `docs/GSC_RECOVERY_ACTION_PLAN.md`):

- **Reciprocal direction**: Once AmbiSecure has authority to share, the AmbiAutomation side should add a parallel ecosystem-bar / footer / About-ecosystem section linking back. That's a change to do in the `ambiautomations-site` repo, not here.
- **Consider a single joint solution page**: `/solutions/secure-building-automation/` or `/solutions/hospital-it-ot-trust/` — a dedicated page targeting the genuine intersection (commercial-RE buildings combining access-control + BACnet/MODBUS device identity). Defer until AmbiSecure is indexing again; creating new pages while indexed=0 just dilutes crawl budget.
- **Periodic re-audit**: Anchor diversity drifts as new content gets added. Once a quarter, re-run a sed-style audit of the anchors used for `ambiautomation.ambimat.com` and rewrite any that have started homogenising to the brand name only.
- **Schema enhancement**: Consider adding a top-level `Organization` schema reference (via `@id`) to other key pages, with `parentOrganization` and `sameAs` inherited — but only if Google starts validating organisation-graph data more strictly. Today the single-source-of-truth on the homepage is sufficient.

## 10. Commit trail

- `2b3160c` — sitewide ecosystem-bar + footer + 3 contextual placements + About Ecosystem section + Organization sameAs merge + llms.txt
- (this commit) — `/industries/enterprise-access/` contextual paragraph + strategy audit doc + this reciprocal-backlink report doc
