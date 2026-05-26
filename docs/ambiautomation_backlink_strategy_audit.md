# AmbiAutomation Backlink Strategy Audit

> Phase-1 audit ahead of contextual reciprocal-backlink work between AmbiSecure (`ambisecure.ambimat.com`) and AmbiAutomation (`ambiautomation.ambimat.com`). Both are Ambimat Group companies; this audit identifies where AmbiSecure can naturally reference AmbiAutomation without diluting AmbiSecure's security/identity topical authority.

## 1. Existing AmbiAutomation references on AmbiSecure (pre-work baseline)

Before the cross-linking work, AmbiAutomation appeared on AmbiSecure only inside three archived blog posts (`blog/archive/cyber-attacks-in-india-part-*`, etc.). It was not in the navigation, footer ecosystem, schema, llms.txt, or any product/solution/industry page.

The parallel pattern that already existed was the **eSIM Initiative** sister-site cross-linking:

- Top ecosystem-bar: `eSIM Initiative` link.
- Footer ecosystem block: `Part of the Ambimat Group · eSIM Initiative`.
- Topic-page mentions where eSIM/eUICC content overlaps (FIDO2 nano-card applet, PIV nano-card applet, eSIM solution product page).

The right pattern for AmbiAutomation is to mirror this — sitewide ecosystem-bar + footer entry, plus contextual mentions only where the topic legitimately overlaps.

## 2. What AmbiAutomation actually is (avoiding misframing)

AmbiAutomation is **not** "industrial automation" or "industrial IoT" in the general sense. The live site (`ambiautomation.ambimat.com`) positions it specifically as:

- **Retrofit automation for existing VRV / VRF HVAC systems**
- On-site server speaking BACnet IP and MODBUS RTU
- Mobile and web operator app for centralised facility control
- Energy optimisation and analytics
- Integration and field services

Target industries explicitly named on the site:

- Offices and commercial real estate
- Hotels and hospitality
- Hospitals and healthcare
- Education campuses
- Light industrial / multi-zone buildings

**The honest framing**: AmbiAutomation is a **building-automation platform for commercial real estate**, not a general "industrial automation" product. Any cross-link copy that calls it "industrial IoT" or "factory automation" is inaccurate and will look corporate-boilerplate to a careful reader.

## 3. Pages SUITABLE for contextual backlinks

Audit found genuine topical overlap on these AmbiSecure surfaces:

| Page | Reason for natural fit | Anchor used |
|---|---|---|
| Homepage top ecosystem-bar | Existing sibling-site nav pattern (parallel to eSIM Initiative). | `AmbiAutomation` (branded nav anchor) |
| Footer ecosystem (all pages) | Existing "Part of Ambimat Group" pattern. | `AmbiAutomation` (branded footer anchor) |
| `/about/` | Company / ecosystem positioning. New dedicated Ecosystem section with three sibling-platform cards. | `AmbiAutomation` (card title) |
| `/industries/smart-cities/` | Smart-city deployments touch buildings (hospitals, civic centres) where HVAC + access converge. | `building-automation platform at AmbiAutomation` |
| `/industries/enterprise-access/` | Large enterprises, hotels, hospitals, campuses have a building-operator control plane alongside workforce access. | `facility-automation team within the Ambimat group` |
| `/solutions/smart-access-control/` | Commercial-RE access control is on the same network as the building's BACnet/MODBUS layer. | `sister team building VRV/VRF retrofit automation` |
| `/products/iot-security-coprocessor/` | The new "Building automation controllers" deployment card is a real fit — BACnet/MODBUS controllers benefit from hardware-rooted device identity. | `Ambimat building-automation platform` |
| `llms.txt` | Disambiguation block for AI engines so they don't collapse the four Ambimat platforms as duplicate content. | (no anchor; URLs only) |
| Homepage `Organization.sameAs[]` | Schema-level entity association. | (sameAs URL, no anchor) |

Total contextual mentions on body content: **5 pages**. Sitewide nav contributes the rest.

## 4. Pages NOT SUITABLE for backlinks

These pages exist on AmbiSecure but have no genuine AmbiAutomation overlap. Adding HVAC mentions here would be off-topic and damage AmbiSecure's topical authority on identity/security:

- **All FIDO authenticator product pages** (`/products/onepass-card/`, `/products/onepass-bio-card/`, `/products/onepass-usb-key/`, `/products/biokey/`, `/products/tappable/`) — these are about user-borne credentials, not building infrastructure.
- **PIV product pages** (`/products/piv-*`) — government/workforce identity, no HVAC overlap.
- **ePassport pages** (`/services/epassport-platform/`, blog posts about ePassport) — border/identity domain.
- **Digital signature / PKCS pages** — document signing, no automation overlap.
- **Transit / ticketing pages** (`/solutions/transit-ticketing/`, `/solutions/closed-loop-ticketing/`, `/industries/transportation/`) — DESFire/SAM transit, no HVAC overlap.
- **Tool and reference pages** (`/resources/tools/*`, `/references/*`) — utility surfaces. Adding cross-links here would be the classic "footer-spam" pattern.
- **Tag and category pages** (`/tags/*`, `/blog/categories/*`) — template card grids.
- **Search page** (`/search/`) — UI hub, no editorial content surface.
- **Most blog posts** — only mention if a post genuinely discusses building/facility deployment scenarios.

## 5. Backlink density risks

| Risk | Mitigation |
|---|---|
| Sitewide outbound link concentration | One sitewide nav entry + one sitewide footer entry. Mirrors existing eSIM Initiative pattern; not a *new* sitewide pattern. |
| Repetitive exact-match anchors | 5 distinct anchor variants used across contextual placements; navigational nav/footer uses branded anchor consistently (Google handles editorial nav anchors fine). |
| Over-linking on a single page | At most one contextual link per modified page (the sitewide nav + footer are separate). |
| Hierarchy confusion | All copy uses *sibling* / *sister team* / *within the Ambimat group* language. Nothing implies AmbiSecure owns or depends on AmbiAutomation, or vice versa. |
| Topical-authority dilution | No HVAC / building-automation mentions on identity-only surfaces. Cross-links restricted to pages whose own content already touches buildings or commercial real estate. |
| Footer spam pattern | The footer ecosystem block lists three entities (`Ambimat Group · eSIM Initiative · AmbiAutomation`) — same shape as the eSIM Initiative pattern that already existed. Not a sudden new pattern. |
| Outbound-link equity drain | AmbiSecure is currently indexed=0 in GSC (see `docs/GSC_RECOVERY_ACTION_PLAN.md`) — there is no equity to drain right now. The ecosystem positioning is forward-looking. Once AmbiSecure recovers, equity will flow to AmbiAutomation naturally and proportionately. |

## 6. Topical relevance opportunities (used)

For each placement, the *underlying topical claim* is verifiable, not corporate-boilerplate:

- **Smart cities**: Civic buildings (hospitals, civic centres) genuinely have both an access-control layer (AmbiSecure's domain) and an HVAC/BMS layer (AmbiAutomation's domain). True.
- **Enterprise access**: Hotels, hospitals, education campuses, multi-floor offices have both workforce access and building-operator control. True.
- **Smart access control**: Commercial real estate combines RFID/FIDO access readers and BACnet/MODBUS controllers on the same network. True.
- **IoT Security Co-Processor**: BACnet/MODBUS controllers in healthcare/hospitality/campus networks are a real deployment target for hardware-rooted device identity. True.
- **About — Ecosystem section**: The three platforms genuinely share an engineering team. True.

## 7. Anchor-text strategy

Five distinct contextual anchor texts to avoid over-optimization:

1. `Ambimat building-automation platform` — descriptive + parent brand
2. `building-automation platform at AmbiAutomation` — descriptive + child brand
3. `sister team building VRV/VRF retrofit automation` — fully descriptive, no brand
4. `facility-automation team within the Ambimat group` — descriptive + parent brand
5. `AmbiAutomation` — branded (used in About card title, sitewide nav, sitewide footer)

No keyword-stuffed anchors. No exact-match-everywhere pattern. No "best HVAC company" style anchors.

## 8. Entity-association strategy

- **Schema**: Homepage `Organization.sameAs[]` now enumerates `ambimat.com`, `esim.ambimat.com`, `ambiautomation.ambimat.com`, plus social profiles. Two previously-duplicate `sameAs` keys were merged into one valid array.
- **About page**: New dedicated **Ecosystem** section above Engagement, with three sibling-platform cards (Ambimat / eSIM / AmbiAutomation) — explicit "three sibling platforms share the same engineering team" framing.
- **llms.txt**: New Ecosystem section explicitly disambiguates the four platforms so LLM crawlers (and AI engines following the llms.txt convention) treat them as distinct entities, not duplicate content.

Hierarchy framing throughout:

- "sibling platforms"
- "sister team"
- "part of the Ambimat Group"
- "Ambimat engineering ecosystem"

Never:

- "AmbiSecure's automation product" (implies ownership)
- "powered by AmbiAutomation" (implies dependency)
- "AmbiAutomation security platform" (mischaracterises the sister product)

## 9. Conclusion

The cross-link work shipped in commit `2b3160c` is sparse, contextual, anchor-diversified, hierarchy-clear, and limited to surfaces with genuine topical overlap. It strengthens Ambimat-Group entity association without damaging AmbiSecure's identity-and-security topical focus.

See `docs/ambiautomation_reciprocal_backlink_report.md` for the line-by-line shipping report.
