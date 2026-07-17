#!/usr/bin/env python3
"""Diagram archetypes for AmbiSecure featured OG cards.

Each archetype fills the right-hand pane (x>=636). They are deliberately
different compositions, not one layout with different headings: a byte parser
shows stacked inspector cards, a protocol flow shows nodes and arrows, a
reference shows a table, a device network shows a hub and spokes, and so on.
Page-specific content (real byte fields, real node labels, real table rows)
is supplied per page by the spec, so two pages sharing an archetype still show
different technical material.
"""
from og_featured_lib import (
    INK, RED, RED_TINT, GREY, WHITE, PANEL, PANEL_2, LINE, CYAN, MONO,
    panel, termcard, node, arrow, _esc,
)

PANE_X, PANE_Y = 636, 150
PANE_W, PANE_H = 500, 330
CX = PANE_X + PANE_W / 2


def _cap(x, y, text, anchor='middle', fill=None, size=10):
    return (f'<text x="{x}" y="{y}" fill="{fill or GREY}" font-family="{MONO}" font-size="{size}" '
            f'letter-spacing="1.1" text-anchor="{anchor}">{_esc(str(text).upper())}</text>')


def byte_parser(d):
    """Stacked inspector cards showing the fields this tool actually decodes."""
    rows = d.get('rows', [])[:4]
    o = termcard(660, 176, 268, 150, d.get('label', 'input'), rows[:3], accent_row=None)
    o += termcard(842, 306, 292, 158, d.get('label2', 'decoded'), rows[3:4] + d.get('rows2', [])[:3],
                  accent_row=0 if d.get('accent') else None)
    return o


def reference_table(d):
    """A lookup surface: key column plus named rows, drawn as a real table."""
    x, y, w = 664, 172, 468
    rows = d.get('rows', [])[:5]
    o = [panel(x, y, w, 40 + 34 * len(rows), WHITE, INK, 2)]
    o.append(f'<rect x="{x}" y="{y}" width="{w}" height="34" fill="{PANEL_2}" stroke="{INK}" stroke-width="2"/>')
    o.append(f'<text x="{x+16}" y="{y+22}" fill="{GREY}" font-family="{MONO}" font-size="10.5" letter-spacing="1.3">'
             f'{_esc(d.get("col1","KEY").upper())}</text>')
    o.append(f'<text x="{x+150}" y="{y+22}" fill="{GREY}" font-family="{MONO}" font-size="10.5" letter-spacing="1.3">'
             f'{_esc(d.get("col2","MEANING").upper())}</text>')
    ry = y + 34
    for i, (k, v) in enumerate(rows):
        if i % 2:
            o.append(f'<rect x="{x+2}" y="{ry}" width="{w-4}" height="34" fill="{PANEL}"/>')
        o.append(f'<line x1="{x}" y1="{ry}" x2="{x+w}" y2="{ry}" stroke="{LINE}" stroke-width="1"/>')
        o.append(f'<text x="{x+16}" y="{ry+22}" fill="{RED}" font-family="{MONO}" font-size="13" font-weight="700">{_esc(k)}</text>')
        o.append(f'<text x="{x+150}" y="{ry+22}" fill="{INK}" font-family="{MONO}" font-size="12">{_esc(v)}</text>')
        ry += 34
    return o


def protocol_flow(d):
    """Left-to-right ceremony. What stays in hardware is drawn sealed."""
    ns = d.get('nodes', [])[:3]
    o = []
    xs = [660, 838, 1016]
    ws = [104, 108, 116]
    for i, n in enumerate(ns):
        acc = n.get('accent', False)
        o += node(xs[i], 262, ws[i], 108, n.get('label', ''), n.get('sub'), accent=acc)
        if n.get('sealed'):
            o.append(f'<rect x="{xs[i]+12}" y="{290}" width="{ws[i]-24}" height="36" rx="3" fill="{RED_TINT}" '
                     f'stroke="{RED}" stroke-width="1.6"/>')
            o.append(f'<path d="M {xs[i]+ws[i]/2-5} 302 a 5 5 0 0 1 10 0 v 4 h -10 z" fill="none" stroke="{RED}" stroke-width="1.4"/>')
            o.append(f'<rect x="{xs[i]+ws[i]/2-6}" y="306" width="12" height="9" rx="1.5" fill="none" stroke="{RED}" stroke-width="1.4"/>')
            o.append(_cap(xs[i] + ws[i] / 2, 338, n.get('sealed'), fill=RED, size=7.5))
    for i in range(len(ns) - 1):
        o += arrow(xs[i] + ws[i] + 6, 316, xs[i + 1] - 6, d.get('labels', [None, None])[i] if d.get('labels') else None)
    return o


def device_network(d):
    """A hub with spokes: one root of trust, several attached devices."""
    o = [f'<circle cx="{CX}" cy="300" r="46" fill="{RED_TINT}" stroke="{RED}" stroke-width="2.4"/>']
    o.append(_cap(CX, 305, d.get('hub', 'root'), fill=RED, size=10))
    pts = [(720, 190), (1060, 190), (700, 410), (1080, 410)]
    for i, (x, y) in enumerate(pts[:len(d.get('spokes', [])[:4])]):
        lbl = d['spokes'][i]
        o.append(f'<line x1="{CX}" y1="300" x2="{x}" y2="{y}" stroke="{LINE}" stroke-width="1.6" stroke-dasharray="4 4"/>')
        o.append(panel(x - 46, y - 22, 92, 44, WHITE, INK, 2))
        o.append(_cap(x, y + 4, lbl, size=9.5))
    return o


def trust_chain(d):
    """Stacked certificate/authority tiers, signature flowing downward."""
    o = []
    tiers = d.get('tiers', [])[:4]
    y = 168
    for i, t in enumerate(tiers):
        w = 300 - i * 24
        x = CX - w / 2
        acc = (i == len(tiers) - 1)
        o.append(panel(x, y, w, 54, RED_TINT if acc else WHITE, RED if acc else INK, 2))
        o.append(f'<text x="{CX}" y="{y+33}" fill="{RED if acc else INK}" font-family="{MONO}" font-size="12" '
                 f'text-anchor="middle">{_esc(t)}</text>')
        if i < len(tiers) - 1:
            o.append(f'<line x1="{CX}" y1="{y+54}" x2="{CX}" y2="{y+74}" stroke="{INK}" stroke-width="2"/>')
            o.append(f'<path d="M {CX} {y+78} L {CX-4.5} {y+69} L {CX+4.5} {y+69} Z" fill="{INK}"/>')
            o.append(_cap(CX + 96, y + 74, 'signs', anchor='start', size=8.5))
        y += 78
    return o


def hardware_object(d):
    """The physical thing: card / key / module, with its real interfaces."""
    o = [f'<g transform="rotate(-6 {CX} 300)">']
    o.append(f'<rect x="{CX-172}" y="222" width="344" height="216" rx="12" fill="{PANEL}" stroke="{INK}" stroke-width="2.4"/>')
    # contact chip
    o.append(f'<rect x="{CX-134}" y="262" width="52" height="40" rx="4" fill="{PANEL_2}" stroke="{INK}" stroke-width="1.6"/>')
    for i in range(1, 3):
        o.append(f'<line x1="{CX-134}" y1="{262+i*13}" x2="{CX-82}" y2="{262+i*13}" stroke="{INK}" stroke-width="1"/>')
    o.append(f'<line x1="{CX-108}" y1="262" x2="{CX-108}" y2="302" stroke="{INK}" stroke-width="1"/>')
    # nfc arcs
    for r in (14, 22, 30):
        o.append(f'<path d="M {CX-58} {282-r*0.7} A {r} {r} 0 0 1 {CX-58} {282+r*0.7}" fill="none" '
                 f'stroke="{RED}" stroke-width="2.2"/>')
    o.append(f'<text x="{CX-134}" y="378" fill="{INK}" font-family="Montserrat" font-size="26" font-weight="700">'
             f'{_esc(d.get("name","OnePass"))}</text>')
    o.append(_cap(CX - 134, 400, d.get('sub', ''), anchor='start', size=9.5))
    o.append('</g>')
    return o


def comparison(d):
    """Two columns, verdict per row — a real contrast, not a list."""
    o = []
    x1, x2, y, w = 664, 912, 172, 220
    for i, (title, items, acc) in enumerate(d.get('cols', [])[:2]):
        x = x1 if i == 0 else x2
        o.append(panel(x, y, w, 250, RED_TINT if acc else WHITE, RED if acc else INK, 2))
        o.append(f'<rect x="{x}" y="{y}" width="{w}" height="34" fill="{PANEL_2}" stroke="{RED if acc else INK}" stroke-width="2"/>')
        o.append(_cap(x + w / 2, y + 22, title, size=10))
        iy = y + 62
        for it in items[:4]:
            o.append(f'<text x="{x+16}" y="{iy}" fill="{INK}" font-family="{MONO}" font-size="11">{_esc(it)}</text>')
            iy += 30
    return o


def lifecycle(d):
    """Ordered stages with real stage names."""
    o = []
    st = d.get('stages', [])[:4]
    x = 660
    for i, s in enumerate(st):
        acc = (i == len(st) - 1)
        o.append(panel(x, 262, 100, 76, RED_TINT if acc else WHITE, RED if acc else INK, 2))
        o.append(f'<text x="{x+50}" y="{292}" fill="{GREY}" font-family="{MONO}" font-size="9" text-anchor="middle">'
                 f'{i+1:02d}</text>')
        o.append(_cap(x + 50, 316, s, size=9))
        if i < len(st) - 1:
            o += arrow(x + 104, 300, x + 118)
        x += 122
    return o


def stack(d):
    """Layered architecture: hardware at the base, application on top."""
    o = []
    layers = d.get('layers', [])[:4]
    y = 180
    for i, l in enumerate(layers):
        base = (i == len(layers) - 1)
        o.append(panel(700, y, 400, 60, RED_TINT if base else WHITE, RED if base else INK, 2))
        o.append(f'<text x="{720}" y="{y+36}" fill="{RED if base else INK}" font-family="{MONO}" font-size="12">{_esc(l)}</text>')
        y += 72
    o.append(_cap(900, y + 6, d.get('foot', 'hardware root of trust'), size=9))
    return o


def topic_index(d):
    """Taxonomy pages: the topic itself plus what it collects."""
    o = [panel(664, 186, 468, 250, WHITE, INK, 2)]
    o.append(f'<rect x="664" y="186" width="468" height="40" fill="{PANEL_2}" stroke="{INK}" stroke-width="2"/>')
    o.append(f'<text x="684" y="212" fill="{GREY}" font-family="{MONO}" font-size="10.5" letter-spacing="1.4">'
             f'{_esc(d.get("kind","TOPIC").upper())}</text>')
    o.append(f'<text x="684" y="266" fill="{INK}" font-family="Montserrat" font-size="30" font-weight="700">'
             f'{_esc(d.get("topic",""))}</text>')
    o.append(f'<rect x="684" y="284" width="40" height="3" fill="{RED}"/>')
    cy = 318
    for it in d.get('items', [])[:3]:
        o.append(f'<rect x="684" y="{cy-13}" width="8" height="8" fill="{RED}"/>')
        o.append(f'<text x="704" y="{cy}" fill="{INK}" font-family="{MONO}" font-size="12">{_esc(it)}</text>')
        cy += 30
    if d.get('count'):
        o.append(_cap(1112, 416, d['count'], anchor='end', size=10))
    return o


def workbench(d):
    """Interactive tool: input pane above, computed output below."""
    o = termcard(664, 172, 468, 118, d.get('label', 'input'), d.get('rows', [])[:2])
    o.append(f'<line x1="{CX}" y1="296" x2="{CX}" y2="318" stroke="{INK}" stroke-width="2"/>')
    o.append(f'<path d="M {CX} 322 L {CX-4.5} 313 L {CX+4.5} 313 Z" fill="{INK}"/>')
    o += termcard(664, 330, 468, 130, d.get('label2', 'output'), d.get('rows2', [])[:3], accent_row=0)
    return o


ARCHETYPES = {
    'DATA PARSER': byte_parser,
    'REFERENCE': reference_table,
    'PROTOCOL FLOW': protocol_flow,
    'IDENTITY FLOW': protocol_flow,
    'DEVICE NETWORK': device_network,
    'TRUST CHAIN': trust_chain,
    'CERTIFICATE STRUCTURE': trust_chain,
    'HARDWARE CUTAWAY': hardware_object,
    'COMPARISON': comparison,
    'LIFECYCLE': lifecycle,
    'SYSTEM ARCHITECTURE': stack,
    'STANDARD STACK': stack,
    'TECHNICAL WORKBENCH': workbench,
    'CONCEPTUAL ILLUSTRATION': stack,
    'TOPIC INDEX': topic_index,
}


def card_reader_setup(d):
    """Desktop enrolment: card in a reader, wired to a browser window.

    Deliberately generic: the browser pane carries the account-security label
    supplied per page rather than a reproduced third-party interface.
    """
    o = []
    # card sitting in a reader
    o.append(f'<rect x="656" y="292" width="150" height="96" rx="8" fill="{PANEL}" stroke="{INK}" stroke-width="2.2"/>')
    o.append(f'<rect x="672" y="312" width="26" height="20" rx="2.5" fill="{PANEL_2}" stroke="{INK}" stroke-width="1.4"/>')
    o.append(f'<line x1="672" y1="322" x2="698" y2="322" stroke="{INK}" stroke-width="1"/>')
    o.append(f'<text x="672" y="360" fill="{INK}" font-family="Montserrat" font-size="13" font-weight="700">{_esc(d.get("card","OnePass Card"))}</text>')
    o.append(f'<rect x="648" y="388" width="166" height="22" rx="3" fill="{PANEL_2}" stroke="{INK}" stroke-width="2"/>')
    o.append(_cap(731, 403, d.get('reader', 'card reader'), size=9))
    o += arrow(822, 340, 866, d.get('link', 'ctap'))
    # browser window
    o.append(panel(874, 262, 258, 150, WHITE, INK, 2))
    o.append(f'<rect x="874" y="262" width="258" height="26" fill="{PANEL_2}" stroke="{INK}" stroke-width="2"/>')
    for i, cx in enumerate((10, 20, 30)):
        o.append(f'<circle cx="{874+cx}" cy="275" r="3.2" fill="{RED if i==0 else "#C9C6C0"}"/>')
    o.append(f'<text x="{874+48}" y="280" fill="{GREY}" font-family="{MONO}" font-size="10" letter-spacing="1.2">{_esc(d.get("pane","account security").upper())}</text>')
    ry = 312
    for row in d.get('rows', [])[:3]:
        o.append(f'<rect x="890" y="{ry-9}" width="7" height="7" fill="{RED}"/>')
        o.append(f'<text x="906" y="{ry}" fill="{INK}" font-family="{MONO}" font-size="11.5">{_esc(row)}</text>')
        ry += 26
    o.append(_cap(1003, 428, d.get('foot', 'webauthn registration'), size=9))
    return o


def phone_nfc_setup(d):
    """Mobile enrolment: card tapped to a phone, NFC arcs between them."""
    o = []
    # phone
    o.append(f'<rect x="890" y="212" width="150" height="240" rx="16" fill="{WHITE}" stroke="{INK}" stroke-width="2.4"/>')
    o.append(f'<rect x="906" y="240" width="118" height="184" rx="4" fill="{PANEL}" stroke="{LINE}" stroke-width="1.4"/>')
    o.append(f'<circle cx="965" cy="226" r="3" fill="{LINE}"/>')
    o.append(f'<text x="965" y="270" fill="{GREY}" font-family="{MONO}" font-size="9" letter-spacing="1.1" text-anchor="middle">{_esc(d.get("pane","account security").upper())}</text>')
    ry = 296
    for row in d.get('rows', [])[:3]:
        o.append(f'<rect x="918" y="{ry-8}" width="6" height="6" fill="{RED}"/>')
        o.append(f'<text x="932" y="{ry}" fill="{INK}" font-family="{MONO}" font-size="9.5">{_esc(row)}</text>')
        ry += 22
    o.append(f'<rect x="918" y="392" width="94" height="20" rx="3" fill="{RED_TINT}" stroke="{RED}" stroke-width="1.4"/>')
    o.append(_cap(965, 406, d.get('cta', 'tap card'), fill=RED, size=8))
    # NFC arcs from card to phone
    for r in (18, 28, 38):
        o.append(f'<path d="M 862 {332-r*0.62} A {r} {r} 0 0 1 862 {332+r*0.62}" fill="none" stroke="{RED}" stroke-width="2.2"/>')
    o.append(_cap(846, 400, 'nfc', fill=RED, size=9))
    # card
    o.append(f'<g transform="rotate(-8 752 332)">')
    o.append(f'<rect x="672" y="288" width="152" height="96" rx="8" fill="{PANEL}" stroke="{INK}" stroke-width="2.2"/>')
    o.append(f'<rect x="688" y="308" width="24" height="19" rx="2.5" fill="{PANEL_2}" stroke="{INK}" stroke-width="1.4"/>')
    o.append(f'<text x="688" y="358" fill="{INK}" font-family="Montserrat" font-size="12.5" font-weight="700">{_esc(d.get("card","OnePass Card"))}</text>')
    o.append('</g>')
    o.append(_cap(752, 412, d.get('foot', 'fido2 credential'), size=9))
    return o


ARCHETYPES['CARD READER SETUP'] = card_reader_setup
ARCHETYPES['PHONE NFC SETUP'] = phone_nfc_setup
