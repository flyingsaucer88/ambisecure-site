#!/usr/bin/env python3
"""Shared chrome + diagram archetypes for AmbiSecure featured OG cards.

The design system here is not invented: it is measured from the approved
27-image package in assets/img/og/featured/ (palette sampled from the PNGs,
52px grid, red rule at 64,206, wedge (1050,630)->(1200,480), type scale from
pixel bboxes). The logo lockup is the approved rendered lockup, reused as a
bitmap rather than redrawn -- it is pixel-identical across all 27.

Canvas is always 1200x630. Text is rendered with the repo's own brand fonts
(assets/fonts/*.woff2), instantiated to static weights at build time.
"""
import re
from xml.sax.saxutils import escape

W, H = 1200, 630

# --- palette, sampled from the approved package -------------------------
BG = '#FDFCFA'
GRID = '#EFECE6'
RED = '#E3222A'
RED_TINT = '#FDF6F5'
INK = '#16181C'
GREY = '#81807C'
PANEL = '#F3F1ED'
PANEL_2 = '#EDECE8'
WHITE = '#FFFFFF'
LINE = '#D8D5D0'
CYAN = '#0E8C9C'

GRID_STEP = 52
MONO = 'JetBrains Mono'
SANS = 'Source Sans 3'
DISPLAY = 'Montserrat'

# --- layout, measured ---------------------------------------------------
X0 = 64
EYEBROW_BASELINE = 75
RULE_Y = 206
TITLE_TOP = 240          # cap-top of first line
TITLE_SIZE = 52
TITLE_LEAD = 51
SUB_SIZE = 20
SUB_LEAD = 28
DIAGRAM_X = 636          # right pane starts here
DIAGRAM_W = W - DIAGRAM_X - 64


def _esc(s):
    return escape(str(s))


def wrap(text, max_chars):
    """Greedy wrap; the design uses at most 3 title lines."""
    words, lines, cur = str(text).split(), [], ''
    for w in words:
        t = (cur + ' ' + w).strip()
        if len(t) <= max_chars or not cur:
            cur = t
        else:
            lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def fit(text, max_chars, max_lines):
    """Fit prose into max_lines without ever cutting mid-sentence.

    Prefer whole sentences; if even the first sentence is too long, trim on a
    word boundary and mark the elision. A subtitle that ends "...so an" reads as
    a bug, which is what happens if you just slice the wrap.
    """
    text = str(text).strip()
    lines = wrap(text, max_chars)
    if len(lines) <= max_lines:
        return lines
    # try progressively fewer sentences
    parts = re.split(r'(?<=[.!?])\s+', text)
    for n in range(len(parts), 0, -1):
        cand = ' '.join(parts[:n]).strip()
        ls = wrap(cand, max_chars)
        if len(ls) <= max_lines:
            return ls
    # First sentence still too long. Prefer a clause boundary so the line ends on
    # a complete thought; only fall back to a word cut if there is no clause.
    first = parts[0].rstrip('.')
    clauses = [first[:m.start()] for m in re.finditer(r'[,;:\u2014\u2013]', first)]
    for cand in sorted(clauses, key=len, reverse=True):
        cand = cand.strip()
        ls = wrap(cand + '.', max_chars)
        if len(ls) <= max_lines and len(cand.split()) >= 4:
            return wrap(cand + '.', max_chars)
    words = first.split()
    while words:
        cand = ' '.join(words).rstrip(' ,;:') + '\u2026'
        ls = wrap(cand, max_chars)
        if len(ls) <= max_lines:
            return ls
        words.pop()
    return lines[:max_lines]


def grid():
    p = []
    for x in range(0, W + 1, GRID_STEP):
        p.append(f'<line x1="{x}" y1="0" x2="{x}" y2="{H}" stroke="{GRID}" stroke-width="1"/>')
    for y in range(0, H + 1, GRID_STEP):
        p.append(f'<line x1="0" y1="{y}" x2="{W}" y2="{y}" stroke="{GRID}" stroke-width="1"/>')
    return ''.join(p)


def wedge():
    return f'<path d="M 1050 {H} L {W} 480 L {W} {H} Z" fill="{RED}"/>'


def chrome(eyebrow, title, subtitle, logo_href):
    """Left column: eyebrow, red rule, title, subtitle, logo lockup."""
    o = [f'<rect width="{W}" height="{H}" fill="{BG}"/>', grid(), wedge()]
    o.append(
        f'<text x="{X0}" y="{EYEBROW_BASELINE}" fill="{GREY}" font-family="{MONO}" '
        f'font-size="15" font-weight="400" letter-spacing="3.2">{_esc(eyebrow.upper())}</text>')
    o.append(f'<rect x="{X0}" y="{RULE_Y}" width="52" height="4" fill="{RED}"/>')

    tl = fit(title, 22, 3)
    size = TITLE_SIZE if len(tl) <= 2 else 44
    lead = TITLE_LEAD if len(tl) <= 2 else 46
    for i, ln in enumerate(tl):
        y = TITLE_TOP + int(size * 0.72) + i * lead
        o.append(f'<text x="{X0}" y="{y}" fill="{INK}" font-family="{DISPLAY}" '
                 f'font-size="{size}" font-weight="700" letter-spacing="-0.6">{_esc(ln)}</text>')

    sub_top = TITLE_TOP + len(tl) * lead + 28
    for i, ln in enumerate(fit(subtitle, 46, 2)):
        o.append(f'<text x="{X0}" y="{sub_top + i * SUB_LEAD}" fill="{GREY}" font-family="{SANS}" '
                 f'font-size="{SUB_SIZE}" font-weight="400">{_esc(ln)}</text>')

    # approved lockup, reused as-is
    o.append(f'<image x="62" y="530" width="185" height="49" href="{logo_href}"/>')
    return o


def svg(body):
    return (f'<?xml version="1.0" encoding="UTF-8"?>\n'
            f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" '
            f'width="{W}" height="{H}" viewBox="0 0 {W} {H}">{"".join(body)}</svg>')


# --- reusable primitives -------------------------------------------------
def panel(x, y, w, h, fill=WHITE, stroke=INK, sw=2, r=2):
    return (f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}" '
            f'stroke="{stroke}" stroke-width="{sw}"/>')


def termcard(x, y, w, h, label, rows, accent_row=None):
    """A terminal/inspector card: titlebar with dots, mono body rows."""
    o = [panel(x, y, w, h, WHITE, INK, 2)]
    o.append(f'<rect x="{x}" y="{y}" width="{w}" height="26" fill="{PANEL_2}" stroke="{INK}" stroke-width="2"/>')
    for i, cx in enumerate((10, 20, 30)):
        c = RED if i == 0 else '#C9C6C0'
        o.append(f'<circle cx="{x+cx}" cy="{y+13}" r="3.2" fill="{c}"/>')
    o.append(f'<text x="{x+48}" y="{y+18}" fill="{GREY}" font-family="{MONO}" font-size="10.5" '
             f'letter-spacing="1.4">{_esc(label.upper())}</text>')
    ty = y + 48
    for i, row in enumerate(rows):
        fill = RED if (accent_row is not None and i == accent_row) else INK
        o.append(f'<text x="{x+14}" y="{ty}" fill="{fill}" font-family="{MONO}" font-size="12.5">{_esc(row)}</text>')
        ty += 21
    return o


def node(x, y, w, h, label, sub=None, accent=False):
    o = [panel(x, y, w, h, RED_TINT if accent else WHITE, INK, 2)]
    o.append(f'<text x="{x+w/2}" y="{y+h+16}" fill="{GREY}" font-family="{MONO}" font-size="10" '
             f'letter-spacing="1.1" text-anchor="middle">{_esc(label.upper())}</text>')
    if sub:
        o.append(f'<text x="{x+w/2}" y="{y+h/2+4}" fill="{RED if accent else INK}" font-family="{MONO}" '
                 f'font-size="11" text-anchor="middle">{_esc(sub)}</text>')
    return o


def arrow(x1, y, x2, label=None, dashed=False):
    d = ' stroke-dasharray="4 4"' if dashed else ''
    o = [f'<line x1="{x1}" y1="{y}" x2="{x2-8}" y2="{y}" stroke="{INK}" stroke-width="2"{d}/>',
         f'<path d="M {x2} {y} L {x2-9} {y-4.5} L {x2-9} {y+4.5} Z" fill="{INK}"/>']
    if label:
        o.append(f'<text x="{(x1+x2)/2}" y="{y-13}" fill="{RED}" font-family="{MONO}" font-size="8.5" '
                 f'letter-spacing="0.8" text-anchor="middle">{_esc(label.upper())}</text>')
    return o
