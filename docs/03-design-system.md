# 03 · Design System

Inherits the Ambimat brand palette and typography established by the eSIM property — but gives **AmbiSecure its own identity** through accent colour, motif, and density.

## Brand colours (inherited from Ambimat group)

| Token | Hex | Use |
|---|---|---|
| `--brand-red` | `#E3222A` | Primary accent (logo mark, key CTAs, hover states, key dividers). Use sparingly. |
| `--brand-red-dark` | `#B81A21` | Hover/pressed states. |
| `--brand-dark` | `#3A3F40` | Headings on light, dark surfaces (callout, ecosystem bar). |
| `--brand-grey` | `#616A6C` | Body copy, muted UI. |
| `--brand-soft` | `#F4F5F6` | Section alts, code backgrounds, chips. |
| `--ink` | `#1A1D1E` | True ink for highest-contrast headings. |
| `--bg` | `#FFFFFF` | Default page background. |

## AmbiSecure-specific tokens (additions, not replacements)

These give AmbiSecure a **subtle technical-security character** distinct from the eSIM site, without breaking ecosystem consistency.

| Token | Hex | Use |
|---|---|---|
| `--secure-cyan` | `#0E8C9C` | Technical highlight — used **only** in code/technical UI: status pills (`OK`, `0x9000`), tool result badges, API/protocol callouts. Never in marketing CTAs (those stay red). |
| `--secure-cyan-soft` | `#E6F4F6` | Background for "verified/decoded" technical info. |
| `--secure-amber` | `#C77A00` | Reserved for caution/parser-warning states inside tools. |
| `--code-bg` | `#14161A` | Dark code blocks (matches eSIM site). |
| `--code-fg` | `#E6E6EA` | Code foreground. |
| `--code-key` | `#FF8A8A` | Code highlight (keys, protocol names). |

**Differentiation rule:** the eSIM site is red-only on white. AmbiSecure adds cyan **only inside technical surfaces** (utility tools, code blocks, parsed-output badges). Marketing surfaces (hero, CTAs, cards) stay red-on-white identical to the eSIM site so the family looks unified.

## Typography (inherited)

| Family | Use | Weights |
|---|---|---|
| **Montserrat** | All headings, nav, buttons, eyebrows, stat numbers | 400, 500, 600, 700 |
| **Source Sans 3** | Body copy, paragraphs, form fields | 400, 500, 600, 700 |
| **JetBrains Mono** | Code, hex strings, APDUs, status words, technical IDs | 400, 500 |

```html
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Source+Sans+3:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### Type scale (matches eSIM site, preserved for consistency)

| Element | Size | Line | Weight | Tracking |
|---|---|---|---|---|
| `h1.hero-title` | 48px | 1.08 | 700 | -0.8px |
| `h1.prose` | 38px | 1.18 | 700 | -0.6px |
| `h2.section-title` | 34px | 1.20 | 700 | -0.5px |
| `h2.prose` | 26px | 1.30 | 700 | -0.3px |
| `h3` | 18-19px | 1.30 | 700 | 0 |
| Body | 16.5px | 1.65-1.85 | 400 | 0 |
| Eyebrow | 11.5px | — | 700 | 2.6px (uppercase) |
| Mono | 13.5-14.5px | 1.55 | 400-500 | 0 |

## Spacing & grid

- Section padding: `100px 80px` desktop, scales down in responsive breakpoints
- Max content widths: `1280px` (sections), `1320px` (hero/nav), `820px` (prose), `1000px` (narrow)
- Card padding: `28-32px`
- Grid lines: `60px × 60px` in hero background, `1px solid #e5e5e5`
- Border radius: `4px` buttons, `6px` cards, `4px` inputs

## Visual motifs

Three patterns reused across the site:

1. **45-degree red stripe pattern** at low opacity (used in hero `::before`, callouts, feature visuals) — inherited from eSIM site.
2. **60×60 grid lines** with radial red gradient at top-right of hero — inherited from eSIM site.
3. **AmbiSecure-only: dot/hex pattern** in product hero for differentiation. CSS:
   ```css
   background-image: radial-gradient(circle at 1px 1px, rgba(58,63,64,0.10) 1px, transparent 0);
   background-size: 14px 14px;
   ```
   Used as a subtle backdrop on product detail pages and the "secure architecture" diagram section. Communicates "discrete components / silicon" without being a literal lock icon.

## Components (re-used unchanged from eSIM site)

`.ecosystem-bar`, `.navbar`, `.btn` (primary/dark/outline/ghost), `.section`, `.eyebrow`, `.section-title`, `.section-line`, `.grid-2/3/4`, `.card`, `.card-soft`, `.card-icon`, `.feature-row`, `.stat-row`, `.arch` / `.arch-node` / `.arch-arrow`, `.callout`, `.bullet-list`, `.prose`, `.faq`, `.chip`, `.blog-card`, `.form-grid`.

## AmbiSecure-specific components (new)

| Component | Purpose | Class |
|---|---|---|
| Technical badge | Status words, hex chips inside parsed output | `.tech-badge`, `.tech-badge--ok`, `.tech-badge--warn`, `.tech-badge--err` |
| Parsed field row | Tool output rows with label · value · note | `.parsed-row` |
| Tool shell | Standard layout for utility tools (input box + output panel + reference) | `.tool-shell`, `.tool-input`, `.tool-output`, `.tool-reference` |
| Hex input | Monospaced input with byte grouping | `.hex-input` |
| Spec table | Dense product spec table | `.spec-table` |
| Trust diagram | Horizontal trust-chain visual | `.trust-chain` |
| Tag pill | Filter pills on resources/blog | `.pill`, `.pill--active` |

All defined in [`/assets/css/main.css`](../assets/css/main.css) (cards/layout) and [`/assets/css/tools.css`](../assets/css/tools.css) (tool shell + parsed output).

## Motion strategy

Restraint is the brief. Used:

- Card hover: `translateY(-4px)` over 250ms + `0 18px 40px rgba(58,63,64,.08)` shadow + 36px red top-bar grow
- Button hover: `translateY(-1px)` + soft red shadow on primary
- Nav active state: red 2px underline transition
- Smooth scroll on anchors
- `prefers-reduced-motion: reduce` honored — disables transforms, keeps colour changes

**Not used:** scroll-triggered reveals, hero-text typewriter, particle backgrounds, cursor effects. These were ruled out as they violate the "engineering-first, not marketing" tone.

## Accessibility

- All colour combos meet WCAG AA on body and AAA on headings (red on white at 16px+ is AA-compliant for non-text and large text; we never rely on red alone for state — always pair with icon or label).
- Focus ring: `2px solid var(--brand-red)` with `2px` offset on every interactive element.
- Skip-to-content link as first focusable element.
- All images have `alt`; decorative SVG marked `aria-hidden="true"`.
- Form labels are `<label for>` linked, never just placeholders.
- Tool inputs use `aria-describedby` to bind to error/help text.

## Dark mode

Out of scope for Phase 1. Footer/ecosystem bar is dark, but pages are light-only — matches the eSIM site and ambimat.com. Reserved as a Phase 3 enhancement.
