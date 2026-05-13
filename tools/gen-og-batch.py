#!/usr/bin/env python3
"""Generate one OG card per declared section in tools/og-templates.json.

Outputs:
  assets/img/og/<section>.svg    canonical artefact
  assets/img/og/<section>.png    rendered via `rsvg-convert` (if installed)

Then optionally walks all HTML pages and rewrites
<meta property="og:image" content="..."> so each page points at the OG
matching its URL prefix.

Usage:
    python3 tools/gen-og-batch.py                # generate images only
    python3 tools/gen-og-batch.py --wire          # generate + rewrite meta tags
    python3 tools/gen-og-batch.py --section blog  # one section only
"""
import argparse, json, os, re, shutil, subprocess, sys
from xml.sax.saxutils import escape

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OG_DIR = os.path.join(ROOT, "assets/img/og")
SITE = "https://ambisecure.ambimat.com"

TEMPLATE = """<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3A3F40" />
      <stop offset="100%" stop-color="#1F2425" />
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)" />
  <rect x="0" y="0" width="12" height="630" fill="#E3222A" />
  <rect x="1180" y="618" width="20" height="12" fill="#0E8C9C" />

  <text x="80" y="125" fill="#0E8C9C"
        font-family="Source Sans 3, Helvetica, Arial, sans-serif"
        font-size="22" font-weight="600"
        letter-spacing="3.5">{eyebrow_upper}</text>

{title_block}

  <text x="80" y="{subtitle_y}" fill="#C9CFD0"
        font-family="Source Sans 3, Helvetica, sans-serif"
        font-size="24" font-weight="400">{subtitle_line1}</text>
  <text x="80" y="{subtitle_y2}" fill="#C9CFD0"
        font-family="Source Sans 3, Helvetica, sans-serif"
        font-size="24" font-weight="400">{subtitle_line2}</text>

  <g transform="translate(1040, 70)">
    <rect x="0" y="0" width="80" height="80" fill="#E3222A" rx="6" ry="6" />
    <text x="40" y="58" fill="#FFFFFF" text-anchor="middle"
          font-family="Montserrat, sans-serif" font-size="38" font-weight="700">AS</text>
  </g>
  <text x="1120" y="170" fill="#FFFFFF" text-anchor="end"
        font-family="Montserrat, sans-serif" font-size="20" font-weight="600">AmbiSecure</text>
  <text x="1120" y="195" fill="#888E90" text-anchor="end"
        font-family="JetBrains Mono, monospace" font-size="12">hardware-rooted security</text>

  <text x="80" y="600" fill="#888E90"
        font-family="JetBrains Mono, monospace" font-size="12">ambisecure.ambimat.com</text>
</svg>
"""

def wrap_title(title, max_chars_per_line=28, max_lines=3):
    """Greedy word-wrap that keeps lines under max_chars_per_line."""
    words = title.split()
    lines = []
    cur = ""
    for w in words:
        if not cur:
            cur = w
            continue
        if len(cur) + 1 + len(w) <= max_chars_per_line:
            cur += " " + w
        else:
            lines.append(cur)
            cur = w
        if len(lines) == max_lines:
            break
    if cur and len(lines) < max_lines:
        lines.append(cur)
    return lines[:max_lines]

def wrap_subtitle(text, max_chars=70):
    """Two-line subtitle wrap."""
    words = text.split()
    line1, line2 = "", ""
    for w in words:
        if not line1:
            line1 = w
        elif len(line1) + 1 + len(w) <= max_chars:
            line1 += " " + w
        elif not line2:
            line2 = w
        elif len(line2) + 1 + len(w) <= max_chars:
            line2 += " " + w
        else:
            break
    return line1, line2

def render_title_block(title):
    lines = wrap_title(title, max_chars_per_line=28, max_lines=3)
    # Font sizes adjust based on line count.
    size = 72 if len(lines) == 1 else (64 if len(lines) == 2 else 56)
    line_height = int(size * 1.1)
    start_y = 230 if len(lines) <= 2 else 215
    out = []
    for i, line in enumerate(lines):
        y = start_y + i * line_height
        out.append(
            f'  <text x="80" y="{y}" fill="#FFFFFF" '
            f'font-family="Montserrat, sans-serif" '
            f'font-size="{size}" font-weight="700">{escape(line)}</text>'
        )
    return "\n".join(out), start_y + len(lines) * line_height

def make_svg(eyebrow, title, subtitle):
    title_block, after_title_y = render_title_block(title)
    subtitle_y = max(after_title_y + 30, 480)
    line1, line2 = wrap_subtitle(subtitle)
    return TEMPLATE.format(
        eyebrow_upper=escape(eyebrow.upper()),
        title_block=title_block,
        subtitle_y=subtitle_y,
        subtitle_y2=subtitle_y + 32,
        subtitle_line1=escape(line1),
        subtitle_line2=escape(line2),
    )

def render_png(svg_path, png_path):
    """Try rsvg-convert; fall back to qlmanage+sips; finally give up.
    SVG is always written and is accepted by all modern social platforms;
    PNG is a belt-and-braces fallback for older crawlers."""
    if shutil.which("rsvg-convert"):
        r = subprocess.run(
            ["rsvg-convert", "-w", "1200", "-h", "630", svg_path, "-o", png_path],
            capture_output=True,
        )
        if r.returncode == 0 and os.path.exists(png_path):
            return True
    if shutil.which("qlmanage") and shutil.which("sips"):
        # qlmanage produces SOURCE.png (1200x1200); sips crops to 1200x630.
        out_dir = os.path.dirname(png_path)
        intermediate = os.path.join(out_dir, os.path.basename(svg_path) + ".png")
        r = subprocess.run(
            ["qlmanage", "-t", "-s", "1200", "-o", out_dir, svg_path],
            capture_output=True,
        )
        if r.returncode == 0 and os.path.exists(intermediate):
            r2 = subprocess.run(
                ["sips", "-c", "630", "1200", intermediate, "--out", png_path],
                capture_output=True,
            )
            try:
                os.remove(intermediate)
            except OSError:
                pass
            return r2.returncode == 0 and os.path.exists(png_path)
    return False

def url_to_section(url, templates):
    for t in templates:
        if t["section"] == "default":
            continue
        if url.startswith(t["match"]):
            return t["section"]
    return "default"

def rewrite_meta_tags(templates):
    """Walk every HTML file. For each, decide the section from the URL
    and rewrite `<meta property="og:image" content="..."> ` to point at the
    section-specific PNG. Video pages already have their own og:image
    (poster); leave those alone."""
    section_pages = 0
    untouched = 0

    META_RE = re.compile(
        r'(<meta property="og:image" content=")(https://ambisecure\.ambimat\.com[^"]*)("\s*/?>)'
    )
    TW_RE = re.compile(
        r'(<meta name="twitter:image" content=")(https://ambisecure\.ambimat\.com[^"]*)("\s*/?>)'
    )

    for dirpath, _, files in os.walk(ROOT):
        if "/legacysitedata/" in dirpath or "/.git/" in dirpath or "/node_modules/" in dirpath:
            continue
        if "/assets/" in dirpath:
            continue
        for name in files:
            if not name.endswith(".html"):
                continue
            path = os.path.join(dirpath, name)
            with open(path) as f:
                html = f.read()

            m = re.search(r'<link rel="canonical" href="(https://ambisecure\.ambimat\.com[^"]+)"', html)
            if not m:
                untouched += 1
                continue
            canonical = m.group(1)
            url_path = canonical[len(SITE):]

            # Per-video pages already use a video-specific og:image; preserve.
            current_og_match = META_RE.search(html)
            if not current_og_match:
                untouched += 1
                continue
            current_og = current_og_match.group(2)
            if "/assets/img/videos/" in current_og:
                untouched += 1
                continue

            section = url_to_section(url_path, templates)
            # Prefer .png (broadest social-platform support) if it exists, else .svg.
            png_path = os.path.join(OG_DIR, section + ".png")
            ext = "png" if os.path.exists(png_path) else "svg"
            new_og = f"{SITE}/assets/img/og/{section}.{ext}"
            if current_og == new_og:
                untouched += 1
                continue
            new_html = META_RE.sub(r"\g<1>" + new_og + r"\g<3>", html, count=1)
            # Keep twitter:image in lockstep with og:image so card previews match.
            new_html = TW_RE.sub(r"\g<1>" + new_og + r"\g<3>", new_html, count=1)
            with open(path, "w") as f:
                f.write(new_html)
            section_pages += 1

    return section_pages, untouched

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--wire", action="store_true", help="Rewrite og:image meta tags across all HTML pages.")
    ap.add_argument("--section", help="Only generate this section's OG card.")
    args = ap.parse_args()

    with open(os.path.join(HERE, "og-templates.json")) as f:
        cfg = json.load(f)
    templates = cfg["templates"]

    os.makedirs(OG_DIR, exist_ok=True)
    rendered = []
    for t in templates:
        if args.section and t["section"] != args.section:
            continue
        svg_path = os.path.join(OG_DIR, t["section"] + ".svg")
        png_path = os.path.join(OG_DIR, t["section"] + ".png")
        svg = make_svg(t["eyebrow"], t["title"], t["subtitle"])
        with open(svg_path, "w") as f:
            f.write(svg)
        rendered_png = render_png(svg_path, png_path)
        rendered.append((t["section"], rendered_png))

    print(f"Generated {len(rendered)} OG cards:")
    for sec, png_ok in rendered:
        status = "SVG+PNG" if png_ok else "SVG only"
        print(f"  {status:10s}  {sec}")

    if args.wire:
        changed, skipped = rewrite_meta_tags(templates)
        print(f"\nWired og:image meta tags:")
        print(f"  {changed} pages updated")
        print(f"  {skipped} pages skipped (video-specific or already correct)")

if __name__ == "__main__":
    main()
