#!/usr/bin/env python3
"""Generate a brand OG card (SVG + PNG) for a given page title.

Usage:
    python3 tools/gen-og-image.py \\
        --title "Phase 10 case studies" \\
        --subtitle "How AmbiSecure deployments are built" \\
        --eyebrow "AmbiSecure" \\
        --out assets/img/og/case-studies.png

The SVG is the canonical artefact (text is editable). The PNG is rendered
via `rsvg-convert` if available, otherwise via macOS `sips`. The script
falls back to writing only the SVG and prints a warning.

No external network calls. Safe to run offline / in CI.
"""
import argparse, os, shutil, subprocess, sys

SVG_TMPL = """<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3A3F40" />
      <stop offset="100%" stop-color="#1F2425" />
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)" />

  <!-- Brand band -->
  <rect x="0" y="0" width="12" height="630" fill="#E3222A" />
  <rect x="1180" y="618" width="20" height="12" fill="#0E8C9C" />

  <!-- Eyebrow -->
  <text x="80" y="120" fill="#0E8C9C"
        font-family="Source Sans 3, Helvetica, Arial, sans-serif"
        font-size="22" font-weight="600"
        letter-spacing="3.5"
        text-transform="uppercase">{eyebrow}</text>

  <!-- Title -->
  <foreignObject x="80" y="160" width="1040" height="280">
    <div xmlns="http://www.w3.org/1999/xhtml"
         style="font-family: 'Montserrat', sans-serif;
                font-size: 64px;
                font-weight: 700;
                line-height: 1.1;
                color: #FFFFFF;">{title}</div>
  </foreignObject>

  <!-- Subtitle -->
  <foreignObject x="80" y="460" width="1040" height="100">
    <div xmlns="http://www.w3.org/1999/xhtml"
         style="font-family: 'Source Sans 3', Helvetica, sans-serif;
                font-size: 26px;
                font-weight: 400;
                line-height: 1.35;
                color: #C9CFD0;">{subtitle}</div>
  </foreignObject>

  <!-- AS brand mark -->
  <g transform="translate(1040, 70)">
    <rect x="0" y="0" width="80" height="80" fill="#E3222A" rx="6" ry="6" />
    <text x="40" y="58" fill="#FFFFFF" text-anchor="middle"
          font-family="Montserrat, sans-serif" font-size="38" font-weight="700">AS</text>
  </g>
  <text x="1120" y="170" fill="#FFFFFF" text-anchor="end"
        font-family="Montserrat, sans-serif" font-size="20" font-weight="600">AmbiSecure</text>
  <text x="1120" y="195" fill="#888E90" text-anchor="end"
        font-family="JetBrains Mono, monospace" font-size="12">hardware-rooted security</text>
</svg>
"""

def render_png(svg_path, png_path):
    if shutil.which("rsvg-convert"):
        r = subprocess.run(
            ["rsvg-convert", "-w", "1200", "-h", "630", svg_path, "-o", png_path],
            capture_output=True,
        )
        return r.returncode == 0
    if shutil.which("sips"):
        # sips cannot do SVG -> PNG directly. Skip.
        return False
    return False

def xml_escape(s):
    return (s.replace("&", "&amp;")
             .replace("<", "&lt;")
             .replace(">", "&gt;")
             .replace('"', "&quot;"))

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--title", required=True)
    ap.add_argument("--subtitle", default="")
    ap.add_argument("--eyebrow", default="AmbiSecure")
    ap.add_argument("--out", required=True, help="Output path (.png or .svg).")
    args = ap.parse_args()

    out = args.out
    svg_path = out.rsplit(".", 1)[0] + ".svg"
    png_path = out.rsplit(".", 1)[0] + ".png"

    svg = SVG_TMPL.format(
        title=xml_escape(args.title),
        subtitle=xml_escape(args.subtitle),
        eyebrow=xml_escape(args.eyebrow),
    )
    os.makedirs(os.path.dirname(svg_path) or ".", exist_ok=True)
    with open(svg_path, "w") as f:
        f.write(svg)
    print(f"wrote {svg_path}")

    if out.endswith(".png"):
        if render_png(svg_path, png_path):
            print(f"wrote {png_path}")
        else:
            print(f"WARN: PNG render skipped (no rsvg-convert). SVG saved at {svg_path}.")
            sys.exit(0)

if __name__ == "__main__":
    main()
