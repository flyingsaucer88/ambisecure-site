# 07 · Product Spotlight & Subdomain Strategy

## Product spotlight ranking

Three tiers based on commercial momentum, technical depth, and audience size.

### Tier 1 — flagship, deserve their own subdomain eventually

| Product | Why subdomain | Suggested host |
|---|---|---|
| **OnePass Card / OnePass Bio Card** (FIDO2 smart card) | Highest commercial momentum, multiple SKUs, certifications, B2B procurement docs, customer portal needs | `onepass.ambimat.com` |
| **FIDO Validation Server** | Backend product, has its own demo (`fido.ambimat.com` / `fido2.ambimat.com`) — already on a subdomain. Deserves a dedicated docs/portal site too | Promote `fido.ambimat.com` to a full product site (currently demo-only) |
| **eSIM / eUICC Initiative** | Already on `esim.ambimat.com` — keep, deepen | `esim.ambimat.com` (existing) |
| **JavaCard Applet Development service** | Distinct buyer (ODMs, SE issuers) and very technical content surface area; would benefit from its own dev portal with sample apps, build guides, and a download index | Future: `applets.ambimat.com` |

### Tier 2 — strong landing page on AmbiSecure (current site), promote later

| Product | Treatment |
|---|---|
| OnePass USB Key | Dedicated landing page + spec sheet + brochure |
| BioKey | Dedicated landing page |
| Tappable (NFC) | Dedicated landing page |
| Digital Signature Token | Dedicated landing page |
| IoT Security Chipset | Dedicated landing page + cross-link to IoT Solutions page |

### Tier 3 — supporting tools, single landing page each under Services

| Tool | URL |
|---|---|
| Bio Enrollment App | `/services/tool-chain-development/bio-enrollment-app/` |
| Security Key Manager | `/services/tool-chain-development/security-key-manager/` |
| Multi-Card Applet Loading Tool | `/services/tool-chain-development/multi-card-applet-loader/` |
| NDEF Personalisation Tool | `/services/tool-chain-development/ndef-personalisation/` |

These don't need separate subdomains; they live under the Tool Chain Development service umbrella.

## Subdomain strategy (recommended progression)

Today:
```
ambimat.com               (parent corporate)
ambisecure.ambimat.com    (security business unit — this redesign)
esim.ambimat.com          (eSIM Initiative)
fido.ambimat.com          (FIDO demo server)
fido2.ambimat.com         (FIDO2 demo backend)
```

Recommended next 12-18 months:
```
ambimat.com
ambisecure.ambimat.com    ← redesigned (this project)
esim.ambimat.com
fido.ambimat.com          ← upgrade from demo to full product portal (docs + demo)
onepass.ambimat.com       ← new: dedicated OnePass family product site (Tier 1 graduation)
docs.ambimat.com          ← new: developer documentation portal (cross-product)
applets.ambimat.com       ← new (Phase 4+): JavaCard applet developer portal
```

### Migration safety

- All current subdomain content stays addressable.
- The redesigned AmbiSecure site keeps `/products/onepass-card/` etc. live even after `onepass.ambimat.com` launches; the OnePass subdomain is **additive** (richer product portal, downloads, channel partners) and the AmbiSecure pages canonicalize to the subdomain when it launches.
- We use cross-property `rel="canonical"` carefully — once `onepass.ambimat.com/card/` is the canonical, the AmbiSecure landing page redirects (or stays as a stub linking out, depending on SEO performance).

## Documentation portal (`docs.ambimat.com`)

Recommended structure once it exists:
```
docs.ambimat.com/
├── /onepass/             (OnePass Card / Bio / USB integration docs)
├── /fido-validation/     (FIDO Validation Server API + deployment)
├── /javacard-applets/    (sample applets, build guides, GP loader docs)
├── /esim/                (eSIM/eUICC integration — likely linking to esim.ambimat.com or merging)
└── /tools/               (canonical home for tool-chain CLI utilities)
```

Same design system as AmbiSecure. Kept separate from the marketing site so docs cadence (frequent, technical, version-tagged) doesn't pollute the marketing IA.

## Why this ladder

- Keeps the **AmbiSecure marketing site lean** and discoverable — every Tier 1 product gets a deep destination once it has the volume to justify it.
- Avoids the trap of stuffing 8 product portals into a single domain (today's situation, which inflated nav and hurt conversion).
- Mirrors how the eSIM Initiative already broke off into its own subdomain — proven pattern.
- Each subdomain can have its own design refinements, downloads, partner portal, customer login, without polluting the parent.

## What stays on AmbiSecure

Even after the subdomain ladder fills out, AmbiSecure remains the:
- **Brand & narrative hub** (Why AmbiSecure, certifications, mission)
- **Product catalogue & comparison surface** (one place to compare across families)
- **Resources / utility tools** suite (the dev-mindshare play)
- **Blog** (editorial across all clusters)
- **Sales entry point** (Contact, RFQ, partnership enquiries)

So AmbiSecure becomes the **front door** to the security ecosystem, with subdomains as the deep technical / commercial portals.
