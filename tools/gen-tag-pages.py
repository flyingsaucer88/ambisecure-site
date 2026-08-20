#!/usr/bin/env python3
"""Generate dedicated blog tag pages from blogs.json.

Reusable, config-driven tag-page generator. Each entry in TAG_CONFIG produces
one /tags/<slug>/index.html listing every blog post in blogs.json whose tags
match (case-insensitive) any name in `match`. The shared site chrome (ecosystem
bar, navbar, breadcrumb, footer, scripts) mirrors the hand-maintained tag pages
so generated pages are visually identical.

Scoped on purpose: it only writes the slugs listed in TAG_CONFIG, so the 24
existing curated tag pages are left untouched. Add a new slug to TAG_CONFIG to
generate another tag page.

Individual tag archives emit <meta name="robots" content="noindex,follow">.
Categories (/blog/categories/) are the indexed taxonomy; tags are a navigation
aid over the same posts, so indexing both would put two thin, near-identical
listing sets in the index. "follow" keeps equity flowing to the posts, and
tools/regen-sitemap.py skips noindex pages, so these stay out of sitemap.xml
automatically. See docs/taxonomy-indexing-decision.md.

Usage:
    python3 tools/gen-tag-pages.py            # write pages
    python3 tools/gen-tag-pages.py --sitemap  # also print sitemap <url> lines
"""
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
BLOGS = ROOT / "assets" / "data" / "blogs.json"


def canonical_org():
    """The sitewide Organization node, read from the homepage.

    Every page carries this node: it drives the structured_data and
    entity_coverage components of the AI-readiness score (knowsAbout supplies
    the entity terms). Reading it from index.html rather than duplicating it
    here keeps a single source of truth.
    """
    import re as _re
    home = (ROOT / "index.html").read_text(encoding="utf-8")
    for b in _re.findall(r'<script type="application/ld\+json">\n(.*?)\n</script>',
                         home, _re.S):
        for n in json.loads(b).get("@graph", []):
            if n.get("@type") == "Organization":
                return n
    raise SystemExit("gen-tag-pages: no Organization node on the homepage")
ASSET_V = "32"
BASE = "https://ambisecure.ambimat.com"

# slug -> display name, tag names to match, intro/dek + meta description copy.
TAG_CONFIG = {
    "cyber-resilience-act": dict(
        name="Cyber Resilience Act",
        match=["Cyber Resilience Act"],
        intro="Articles covering the EU Cyber Resilience Act, connected-product security, vulnerability handling, and CRA-aligned security architecture.",
        og_alt="AmbiSecure Cyber Resilience Act index collecting engineering writing on digital-element products, 11 sep 2026 reporting.",
    ),
    "cra": dict(
        name="CRA",
        match=["CRA"],
        intro="Practical AmbiSecure articles on CRA readiness, secure-by-design architecture, and product lifecycle security.",
        og_alt="AmbiSecure CRA index collecting engineering writing on support periods, key rotation, updates.",
    ),
    "ambisec": dict(
        name="AmbiSEC",
        match=["AmbiSEC"],
        intro="Articles featuring AmbiSEC as a hardware-backed embedded security module for connected products, IoT, smart city systems, and device identity.",
        og_alt="AmbiSecure AmbiSEC index collecting engineering writing on hardware root of trust, anti-cloning device id.",
    ),
    "embedded-security": dict(
        name="Embedded Security",
        match=["Embedded Security"],
        intro="Guides and product-security articles on embedded trust, secure key storage, hardware-backed identity, and connected-device protection.",
        og_alt="AmbiSecure Embedded Security index collecting engineering writing on secure key storage, firmware identity.",
    ),
    "iot-security": dict(
        name="IoT Security",
        match=["IoT Security"],
        intro="Articles on securing connected devices, IoT infrastructure, smart city deployments, and lifecycle-ready device security.",
        og_alt="AmbiSecure IoT Security index collecting engineering writing on cra for connected hardware, smart-city hardware.",
    ),
    "secure-by-design": dict(
        name="Secure by Design",
        match=["Secure by Design"],
        intro="Articles on building security into connected products from architecture through deployment and maintenance.",
        og_alt="AmbiSecure Secure by Design index collecting engineering writing on cloned devices, key theft, insecure provisioning.",
    ),
    "secure-element": dict(
        name="Secure Element",
        # merge singular + plural variants — same concept, split only by spelling.
        match=["Secure Element", "Secure Elements"],
        intro="Technical articles on secure elements, protected key storage, smart cards, applets, and hardware-backed trust.",
        og_alt="AmbiSecure Secure Element index collecting engineering writing on key isolation, secure boot, obu / rsu hardware root.",
    ),
    "device-identity": dict(
        name="Device Identity",
        match=["Device Identity"],
        intro="Articles on cryptographic device identity, secure provisioning, trust anchors, and lifecycle identity for connected products.",
        og_alt="AmbiSecure Device Identity index collecting engineering writing on secure provisioning, trust anchors.",
    ),
}

ECOSYSTEM_BAR = (
    '<div class="ecosystem-bar"><div class="ecosystem-bar-inner"><span class="ecosystem-label">Ambimat Group</span>'
    '<a href="https://ambimat.com/" class="ext">Ambimat</a><a href="/" class="current">AmbiSecure</a>'
    '<a href="https://v2x.ambimat.com/" class="ext">V2X</a><a href="https://esim.ambimat.com/" class="ext">eSIM</a><a href="https://ambiautomation.ambimat.com/" class="ext">AmbiAutomation</a>'
    '<a href="/blog/">Engineering Blog</a><span class="spacer"></span><span class="meta">Ahmedabad &middot; India &middot; Est. 1982</span></div></div>'
)

NAVBAR = (
    '<header class="navbar"><a href="/" class="brand"><span class="brand-mark">AS</span><span class="brand-text">'
    '<span class="brand-line">Ambi<span class="accent">Secure</span></span><span class="brand-tag">Hardware-rooted security</span></span></a>'
    '<nav aria-label="Primary"><ul class="nav-links"><li><a href="/products/">Products</a></li><li><a href="/solutions/">Solutions</a></li>'
    '<li><a href="/technologies/">Technologies</a></li><li><a href="/services/">Services</a></li><li><a href="/industries/">Industries</a></li><li><a href="/resources/">Resources</a></li>'
    '<li><a href="/blog/" class="active">Blog</a></li><li><a href="/about/">About</a></li></ul></nav>'
    '<div class="nav-actions"><button type="button" class="nav-search as-search-trigger" aria-label="Open site search">'
    '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
    '<circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>'
    '<span class="nav-search-label">Search</span><kbd aria-hidden="true" class="nav-kbd-hint"></kbd></button>'
    '<a href="/contact/" class="nav-btn">Contact</a>'
    '<button class="hamburger" aria-label="Toggle navigation" aria-expanded="false"><span></span><span></span><span></span></button></div></header>'
)

FOOTER = (
    '<footer class="site-footer"><div class="footer-inner">\n'
    '  <div class="footer-grid">\n'
    '    <div class="footer-brand"><div class="brand"><span class="brand-mark">AS</span><span class="brand-text"><span class="brand-line">Ambi<span class="accent">Secure</span></span><span class="brand-tag">Hardware-rooted security</span></span></div><p>Hardware-rooted identity, FIDO authenticators, JavaCard applets, and IoT trust systems &mdash; engineered by the Ambimat Electronics team.</p><div class="footer-ecosystem">Part of the <a href="https://ambimat.com/">Ambimat Group</a> &middot; <a href="https://v2x.ambimat.com/">V2X</a> &middot; <a href="https://esim.ambimat.com/">eSIM</a> &middot; <a href="https://ambiautomation.ambimat.com/">AmbiAutomation</a></div></div>\n'
    '    <div><h3>Products</h3><ul><li><a href="/products/onepass-platform/">OnePass Platform</a></li><li><a href="/products/onepass-card/">OnePass Card</a></li><li><a href="/products/onepass-bio-card/">OnePass Bio Card</a></li><li><a href="/products/onepass-usb-key/">OnePass USB Key</a></li><li><a href="/products/iot-security-coprocessor/">IoT Security Co-Processor</a></li><li><a href="/solutions/v2x-security/">V2X / ITS Identity</a></li><li><a href="https://v2x.ambimat.com/">V2X and ITS</a></li><li><a href="/products/javacard-applets/">JavaCard Applets</a></li><li><a href="/products/">All products</a></li></ul></div><div><h3>By Industry</h3><ul><li><a href="/industries/government-and-defence/">Government</a></li><li><a href="/industries/enterprise-access/">Enterprise</a></li><li><a href="/industries/transportation/">Transit</a></li><li><a href="/industries/smart-cities/">Smart Cities</a></li><li><a href="/industries/connected-mobility/">Connected Mobility</a></li><li><a href="/industries/">All industries</a></li></ul></div>\n'
    '    <div><h3>Engage</h3><ul><li><a href="/engagement-models/">Engagement models</a></li><li><a href="/case-studies/">Case studies</a></li><li><a href="/brochures/">Brochures</a></li><li><a href="/services/">Services</a></li><li><a href="/faqs/">FAQs</a></li><li><a href="/videos/">Videos</a></li><li><a href="/blog/">Engineering blog</a></li></ul></div>\n'
    '    <div><h3>Company</h3><ul><li><a href="/about/">About</a></li><li><a href="/about/certifications/">Certifications</a></li><li><a href="/industries/">Industries</a></li><li><a href="/support/">Support</a></li><li><a href="/partners/">Partners</a></li><li><a href="/trust/">Trust</a></li><li><a href="/contact/">Contact</a></li></ul></div>\n'
    '    <div><h3>Contact</h3><ul><li>Ahmedabad, Gujarat 380015<br />India</li><li>India: <a href="tel:+917925501989" data-analytics-event="phone_click">+91 79255 01989</a></li><li><a href="https://wa.me/919727933488?text=Hello%20AmbiSecure%2C%20I%20would%20like%20to%20discuss%20a%20security%20project." data-analytics-event="whatsapp_click" rel="noopener" target="_blank">WhatsApp: +91 97279 33488</a></li><li>US: <a href="tel:+12153973819" data-analytics-event="phone_click">+1 215 397 3819</a></li><li><a href="mailto:support@ambimat.com" data-analytics-event="email_click">support@ambimat.com</a></li></ul></div>\n'
    '  </div>\n'
    '  <div class="footer-base"><span>&copy; 2026 Ambimat Electronics. All rights reserved.</span><span class="footer-privacy"> &middot; <a href="/privacy/">Privacy</a></span><div class="footer-social"><a href="https://in.linkedin.com/company/ambimat-electronics" aria-label="LinkedIn"><span aria-hidden="true">in</span></a><a href="https://x.com/ambimat" aria-label="Twitter"><span aria-hidden="true">tw</span></a><a href="https://www.facebook.com/AmbimatElec" aria-label="Facebook"><span aria-hidden="true">f</span></a></div></div>\n'
    '</div></footer>'
)

SCRIPTS = (
    f'<script src="/assets/js/nav.js?v={ASSET_V}" defer></script>\n'
    f'<script src="/assets/js/web-vitals.js?v={ASSET_V}" defer></script>\n'
    f'<script src="/assets/js/site-search.js?v={ASSET_V}" defer></script>\n'
    f'<script src="/assets/js/analytics-config.js?v={ASSET_V}" defer></script>\n'
    f'<script src="/assets/js/cookie-consent.js?v={ASSET_V}" defer></script>'
)


def esc(s):
    return s.replace("&", "&amp;").replace('"', "&quot;").replace("<", "&lt;").replace(">", "&gt;")


def trim(summary, limit=155):
    s = summary.strip()
    if len(s) <= limit:
        return s
    cut = s[:limit].rsplit(" ", 1)[0].rstrip(",.;: ")
    return cut + "&hellip;"


def badge(post):
    if "/archive/" in post["url"]:
        return "archive"
    if post.get("date", "") >= "2026-01-01":
        return "new"
    return "post"


def card(post):
    meta = " &middot; ".join(post.get("categories", [])[:2])
    return (
        f'<a href="{post["url"]}" class="card">'
        f'<div style="font-family:\'JetBrains Mono\',monospace;font-size:12px;color:var(--brand-grey);margin-bottom:6px;">{post["date"]} &middot; {badge(post)}</div>'
        f'<h3>{esc(post["title"])}</h3>'
        f'<p>{trim(post["summary"])}</p>'
        f'<div class="card-meta">Read article &rarr; <span style="opacity:0.55;font-size:11.5px;">{esc(meta)}</span></div></a>'
    )


def match_posts(entries, names):
    s = {n.lower() for n in names}
    out = [p for p in entries if any(t.lower() in s for t in p.get("tags", []))]
    return sorted(out, key=lambda p: p.get("date", ""), reverse=True)


def build_page(slug, conf, posts):
    name = conf["name"]
    intro = conf["intro"]
    url = f"{BASE}/tags/{slug}/"
    title = f'Posts tagged "{name}" &mdash; AmbiSecure'
    # attribute-safe variant: inner literal quotes break content="..." (keep &mdash; intact)
    title_attr = title.replace('"', "&quot;")
    cards = "\n      ".join(card(p) for p in posts)
    breadcrumb_json = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{BASE}/"},
                    {"@type": "ListItem", "position": 2, "name": "Blog", "item": f"{BASE}/blog/"},
                    {"@type": "ListItem", "position": 3, "name": "Tags", "item": f"{BASE}/tags/"},
                    {"@type": "ListItem", "position": 4, "name": name, "item": url},
                ],
            },
            {"@type": "CollectionPage", "name": f"Tag: {name}", "url": url},
            canonical_org(),
        ],
    }
    ld = json.dumps(breadcrumb_json, indent=1, ensure_ascii=False)
    count = len(posts)
    plural = "post" if count == 1 else "posts"
    # Per-tag featured card if one has been rendered, else the generic tag card.
    featured = ROOT / "assets" / "img" / "og" / "featured" / f"ambisecure-tags-{slug}-1200x630.png"
    if featured.is_file():
        og_image = f"{BASE}/assets/img/og/featured/ambisecure-tags-{slug}-1200x630.png"
    else:
        og_image = f"{BASE}/assets/img/og/tags.png"
    og_alt_attr = esc(conf.get("og_alt") or "AmbiSecure &mdash; Hardware-rooted security")
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>{title}</title>
<meta name="description" content="{esc(intro)}" />
<link rel="canonical" href="{url}" />
<meta name="robots" content="noindex,follow" />
<meta property="og:type" content="website" />
<meta property="og:title" content="{title_attr}" />
<meta property="og:description" content="{esc(intro)}" />
<meta property="og:url" content="{url}" />
<meta property="og:image" content="{og_image}" />
<meta property="og:image:type" content="image/png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="{og_alt_attr}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="{og_image}" />
<meta name="twitter:image:alt" content="{og_alt_attr}" />
<link rel="preload" href="/assets/fonts/montserrat.woff2" as="font" type="font/woff2" crossorigin />
<link rel="preload" href="/assets/fonts/source-sans-3.woff2" as="font" type="font/woff2" crossorigin />
<link rel="stylesheet" href="/assets/css/fonts.css?v={ASSET_V}" />
<link rel="stylesheet" href="/assets/css/main.css?v={ASSET_V}" />
<link rel="icon" type="image/png" sizes="32x32" href="/assets/img/favicon-32.png" />
<link rel="icon" type="image/png" sizes="64x64" href="/assets/img/favicon-64.png" />
<link rel="icon" type="image/png" sizes="192x192" href="/assets/img/favicon-192.png" />
<link rel="icon" type="image/png" sizes="512x512" href="/assets/img/favicon-512.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/assets/img/apple-touch-icon.png" />
<link rel="manifest" href="/site.webmanifest" />
<meta name="theme-color" content="#E3222A" />
<script type="application/ld+json">
{ld}
</script>
</head>
<body>
<a href="#main" class="skip-link">Skip to main content</a>
{ECOSYSTEM_BAR}
{NAVBAR}
<nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span class="sep">/</span><a href="/blog/">Blog</a><span class="sep">/</span><a href="/tags/">Tags</a><span class="sep">/</span><span class="current">{name}</span></nav>
<main id="main">

<section style="padding: 60px 80px 30px;">
  <div class="prose">
    <span class="eyebrow">Tag</span>
    <h1>Posts tagged "{name}"</h1>
    <p class="dek">{intro}</p>
    <p style="color:var(--brand-grey);font-size:14px;margin-top:-4px;">{count} {plural} carrying the <em>{name}</em> tag, newest first.</p>
    <div class="hero-cta-row" style="margin-top:20px;">
      <a href="/tags/" class="btn btn-outline">All tags</a>
      <a href="/blog/categories/" class="btn btn-outline">Browse by category</a>
      <a href="/search/" class="btn btn-outline">Search the blog</a>
    </div>
  </div>
</section>

<section>
  <div class="section-container">
    <h2>Tagged articles</h2>
    <div class="grid-3">
      {cards}
    </div>
  </div>
</section>

</main>

{FOOTER}
{SCRIPTS}
</body>
</html>
"""


def main():
    check = "--check" in sys.argv
    drift = []
    data = json.loads(BLOGS.read_text(encoding="utf-8"))
    entries = data["entries"]
    sitemap_lines = []
    for slug, conf in TAG_CONFIG.items():
        posts = match_posts(entries, conf["match"])
        if not posts:
            print(f"SKIP {slug}: no matching posts")
            continue
        page = build_page(slug, conf, posts)
        out_dir = ROOT / "tags" / slug
        target = out_dir / "index.html"
        if check:
            # Drift guard. This generator has silently reverted hand-edits
            # before (asset version, OG images, nav items). --check makes that
            # a build failure instead of a surprise on the next regen.
            current = target.read_text(encoding="utf-8") if target.is_file() else None
            if current != page:
                drift.append(slug)
            continue
        out_dir.mkdir(parents=True, exist_ok=True)
        target.write_text(page, encoding="utf-8")
        print(f"wrote tags/{slug}/index.html  ({len(posts)} posts)")
        sitemap_lines.append(
            f'  <url><loc>{BASE}/tags/{slug}/</loc><lastmod>2026-06-02</lastmod><changefreq>monthly</changefreq><priority>0.55</priority></url>'
        )
    if check:
        if drift:
            print(f"gen-tag-pages: DRIFT on {len(drift)} page(s): {', '.join(drift)}")
            print("The generator no longer reproduces the on-disk pages. Either the")
            print("pages were hand-edited, or the template is stale. Reconcile before")
            print("running this generator, or the hand-edits will be reverted.")
            return 1
        print(f"gen-tag-pages: no drift ({len(TAG_CONFIG)} generated pages match disk)")
        return 0

    if "--sitemap" in sys.argv:
        print("\n--- sitemap lines ---")
        print("\n".join(sitemap_lines))
    return 0


if __name__ == "__main__":
    sys.exit(main())
