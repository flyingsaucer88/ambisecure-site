# AmbiSecure — site source

Static HTML / vanilla CSS / vanilla JS site. Hostinger-deployable.
Matches the eSIM property's stack (Google Fonts + LiteSpeed + .htaccess).
No build step.

## Repo layout

```
/                         site root — every directory has an index.html
├── docs/                 strategy & architecture (8 markdown docs)
├── assets/
│   ├── css/main.css      core design system (everything but tools)
│   ├── css/tools.css     utility-tool shell, parsed-output, hex-input
│   ├── js/nav.js         mobile nav + active-section marker
│   ├── js/tools/         per-tool JS (atr-parser.js, apdu-parser.js, ...)
│   ├── img/              logos, OG, hero illustrations
│   └── downloads/        product brochures (PDFs)
├── products/             product index + each product its own dir
├── solutions/            buyer-shaped problem pages
├── technologies/         engineer-shaped topic pages
├── industries/           vertical pages
├── resources/            UTILITY TOOLS ONLY (no editorial)
│   └── tools/<slug>/     each tool: index.html + JS at /assets/js/tools/<slug>.js
├── blog/                 editorial — each post in its own dir
├── about/                about / mission / vision / certifications
├── support/              FAQs, guides, datasheets
├── contact/              contact form + addresses
├── 404.html              custom 404
├── robots.txt
├── sitemap.xml
└── .htaccess             redirects + security headers
```

## Design system

- Brand: red `#E3222A`, dark grey `#3A3F40`, soft `#F4F5F6`.
- AmbiSecure-only accent: `--secure-cyan: #0E8C9C` — used **only** on technical surfaces (utility tools, code blocks, parsed-output badges). Marketing surfaces stay red on white.
- Type: Montserrat (headings) · Source Sans 3 (body) · JetBrains Mono (code/hex).
- Components in `assets/css/main.css`: ecosystem bar, navbar, hero, sections, cards, callouts, prose, FAQ, blog cards, spec table, trust chain, breadcrumb, form grid, footer.
- Tools components in `assets/css/tools.css`: tool-shell, hex-input, parsed-row, tech-badge, tlv-tree.

## Adding a new page

Each page is self-contained (no SSR, no build, no template engine). Easiest is to copy a comparable page (e.g., `solutions/index.html`) and edit. Keep:
- Ecosystem bar markup — first thing in `<body>`
- `.navbar` markup — second
- `<main id="main">`
- `.site-footer` — last
- All Google Fonts / CSS / JS link paths
- The page-specific JSON-LD `BreadcrumbList`

## Adding a new utility tool

1. Create `/resources/tools/<slug>/index.html` (copy `atr-parser/index.html` and edit).
2. Create `/assets/js/tools/<slug>.js` (copy `atr-parser.js` shape).
3. Add it to the resources index page (`/resources/index.html`) with a real link instead of `href="#"`.
4. Add it to `/sitemap.xml`.
5. Update the footer's "Develop" column on every page that links it.

Rules:
- All parsing must be local. No `fetch()` to a server with user input.
- Add a `Sample` button.
- Reference panel at the bottom: spec link, related blog post, related technology, related tool.
- JSON-LD `SoftwareApplication` with `applicationCategory: "DeveloperApplication"`.

## Adding a new blog post

1. Create `/blog/<slug>/index.html` (copy `blog/why-use-multi-factor-authentication/index.html` and edit).
2. Add the card to `/blog/index.html`.
3. Add the URL to `/sitemap.xml`.
4. Update related posts in any cluster siblings.

## Deploy

Static — every directory has an `index.html`. Push the whole tree (excluding `docs/` if you want) to Hostinger via SFTP or Git deploy. `.htaccess` works on LiteSpeed.

## Local preview

```
cd /path/to/ambisecure-site
python3 -m http.server 8080
# open http://localhost:8080/
```

(Or any other static server; no special routing needed.)

## Strategy docs

The 8 docs in `/docs/` cover all 20 deliverables of the original brief:

| # | Doc | Covers |
|---|---|---|
| 01 | `01-audit-and-content-inventory.md` | Audit, content inventory, redirect map |
| 02 | `02-information-architecture.md` | IA, navigation, internal linking |
| 03 | `03-design-system.md` | Design system, typography, colour, motion |
| 04 | `04-seo-and-redirect-strategy.md` | SEO migration, redirects, canonical, schema |
| 05 | `05-blog-editorial-strategy.md` | 35-post blog plan, clusters, pillars |
| 06 | `06-resources-tools-architecture.md` | 50+ utility tool catalogue |
| 07 | `07-product-spotlight-and-subdomains.md` | Subdomain strategy, product spotlights |
| 08 | `08-implementation-roadmap.md` | Phased rollout |
