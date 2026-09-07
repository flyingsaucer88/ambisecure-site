#!/usr/bin/env python3
"""AmbiSEC product-claim guard: RF technology is not an AmbiSEC feature.

OWNER DECISION (2026-09-07), which this encodes:

  * AmbiSEC is part of the governed Ambimat product set, estate-wide.
  * BLE is NOT an AmbiSEC product feature. Neither is Bluetooth, Thread, Wi-Fi,
    LoRa, sub-GHz, cellular, V2X or NFC. AmbiSEC does not supply a radio,
    a stack or a communications interface merely because it can secure a system
    that uses one.
  * Correct positioning: AmbiSEC is the security boundary; the RF/communications
    subsystem is separate; the security function stays independent of the radio.

WHAT THIS IS NOT
This is deliberately not a keyword ban. Naming a radio technology on an AmbiSEC
page is legitimate and often necessary -- to contrast threat models, to describe
what the *host* ships, or to state the boundary itself. A blunt gate here would
force technically worse copy, which is a real cost and not a safety gain.

THE TEST APPLIED, from the owner:
  "Would a technically competent reader reasonably believe this page says
   AmbiSEC itself provides or implements this RF technology?"

So a finding needs THREE things in ONE surface: AmbiSEC named, a radio
technology named, and a possessive/provisioning construction tying them --
"AmbiSEC ... BLE stack", "AmbiSEC provides Wi-Fi", "AmbiSEC's LoRa interface".
An attributing construction -- "host", "MCU", "external", "selected by",
"independent of", "separate" -- clears it, because that is the boundary being
stated correctly rather than blurred.

SURFACES are block-level units of rendered output: heading, paragraph, list item,
table ROW, details/summary, figcaption, SVG title/desc, one meta/OG attribute,
one JSON-LD string value. Table splitting is at ROW level on purpose: a product
named in a <th> with the claim in the adjacent <td> is one surface, and cell-level
splitting misses it. (That failure mode was found by the v2x-site session by
injecting into a real built page rather than by reading code.)

KNOWN LIMIT -- READ THIS BEFORE TRUSTING A GREEN RUN.

This guard catches protocol-as-feature by VOCABULARY. Both rules require a NAMED radio
technology: rule 1 needs one coupled to a provisioning noun, rule 2 needs three families in a
surface. It is therefore structurally blind to protocol-as-feature by FRAMING -- a
communications function attributed to a domain without naming any technology:

    "AmbiSEC Module is a dual-domain co-processor. The MCU domain runs the application --
     firmware, radios, sensor acquisition."

That says the module contains the MCU and therefore the radios, and it passes cleanly, because
"radios" and "MCU domain" are not radio technologies. Widening the rules to fire on bare words
like "connectivity", "radios" or "MCU domain" would flag most of this site's legitimate
architecture prose, so the limit is deliberate rather than a defect to fix here.

Consequence: a green run means no NAMED technology is attributed to AmbiSEC. It does NOT mean
the architecture is framed correctly. That needs a human sweep -- the v2x-site session found
one such page on its property and this one had six such surfaces, none of which either guard
saw. When reviewing AmbiSEC copy, read for "does an unqualified domain sound like part of the
product?" separately from running this.

Usage:  python3 tools/audit-ambisec-claims.py [--strict] [PATH...]
        python3 tools/audit-ambisec-claims.py --selftest
"""
from __future__ import annotations
import html, json, re, sys
from pathlib import Path

PRODUCT = re.compile(r"\bAmbi\s*-?\s*SEC\b", re.I)

RF = re.compile(
    r"\bBLE\b|\bBTLE\b|blue\s*-?\s*tooth|\bThread\b|\bWi-?Fi\b|\bLoRa(?:WAN)?\b"
    r"|\bsub-?GHz\b|\bcellular\b|\bNFC\b|\bV2X\b|\bZigbee\b|\bUWB\b", re.I)

# An RF technology presented AS A COMPONENT: the term sits next to a provisioning noun.
# This is the shape that makes a reader believe AmbiSEC supplies the radio.
# NOTE: "module" is deliberately ABSENT. "AmbiSEC Module" is the product's actual name, so
# including it made every mention of the product by name trip whenever a radio term appeared
# in the same sentence -- 7 false positives on this site, all of them correct copy.
# V2X is included here but NOT as a bare term: it only counts when adjacent to a provisioning
# noun. On this site V2X is overwhelmingly a DOMAIN noun -- "V2X PKI", "V2X certificate
# management", "V2X OBU / RSU integrations" -- and treating it like BLE produced noise. But
# "AmbiSEC provides a C-V2X radio interface" is a genuine feature claim and the owner names V2X
# explicitly, so the adjacency requirement is what makes it safe to include. Found as a MISS
# (not a false positive) when the v2x-site session's AmbiOBU case prompted a re-test.
RF_AS_COMPONENT = re.compile(
    r"(?:\bBLE\b|\bBTLE\b|blue\s*-?\s*tooth|\bThread\b|\bWi-?Fi\b|\bLoRa(?:WAN)?\b|"
    r"\bsub-?GHz\b|\bcellular\b|\bNFC\b|\bZigbee\b|\bUWB\b|\bV2X\b)"
    r"[\s/&;,-]{0,20}(?:\w+[\s/&;,-]{0,3}){0,3}?"
    r"\b(?:stacks?|radios?|interfaces?|transceivers?|modems?|connectivity|link|chipsets?)\b"
    r"|\b(?:stacks?|radios?|interfaces?|transceivers?|modems?|connectivity)\b[\s/&;,-]{0,20}"
    r"(?:\bBLE\b|blue\s*-?\s*tooth|\bThread\b|\bWi-?Fi\b|\bLoRa\b|\bsub-?GHz\b|\bNFC\b)",
    re.I)

# AmbiSEC as the grammatical provider.
PROVIDES = re.compile(
    r"\bAmbi\s*-?\s*SEC\b[^.;]{0,60}?\b(?:provides?|supplies|offers?|includes?|features?|"
    r"integrates?|implements?|ships?\s+with|comes?\s+with|with\s+integrated|embeds?)\b"
    r"|\bAmbi\s*-?\s*SEC(?:'s|\u2019s)\b", re.I)

# Explicit negations and disclaimers. A surface that says AmbiSEC does NOT do something is
# the opposite of a false feature claim, and this site uses that form deliberately and often.
NEGATED = re.compile(
    r"\bdoes\s+not\b|\bdo\s+not\b|\bis\s+not\b|\bare\s+not\b|\bnot\s+(?:a|yet|the)\b"
    r"|\bnever\b|\bno\s+claim\b|\bnot\s+claim(?:ed)?\b|\brather\s+than\b", re.I)

# Constructions that place the radio OUTSIDE AmbiSEC. Any one clears a surface.
#
# These are PHRASES, not bare nouns. An earlier draft cleared on words like "product" or
# "system", which let "AmbiSEC provides Bluetooth connectivity for your product" pass -- the
# noun appeared, but as the beneficiary of the claim rather than the owner of the radio.
# An OWNER must precede the thing owned: "host radio" and "MCU domain" attribute;
# "radio stack" on its own does not, because that IS the prohibited construction.
ATTRIBUTED = re.compile(
    r"\b(?:host|MCU|microcontroller|application|external|system)\s+"
    r"(?:domain|side|subsystem|layer|processor|firmware|stack|interface|radio|radios|communications?)"
    r"|\bindependent(?:ly)?\s+of\b|\bregardless\s+of\b|\birrespective\s+of\b"
    r"|\bseparate\s+(?:security\s+)?boundary\b|\bsecurity\s+boundary\b"
    r"|\bnever\s+has\s+to\b"
    r"|\b(?:selected|chosen|picked)\s+(?:by|for)\b|\bapplication-selected\b"
    r"|\b(?:whichever|whatever)\s+\w+\s+(?:radio|technology|the\s+product)"
    r"|\bthe\s+product\s+(?:ships|uses|selects)\b"
    r"|\bnot\s+the\s+same\s+as\b",
    re.I)

# Distinct RF technologies, for the laundry-list rule.
RF_TERMS = [r"\bBLE\b", r"blue\s*-?\s*tooth", r"\bThread\b", r"\bWi-?Fi\b",
            r"\bLoRa(?:WAN)?\b", r"\bsub-?GHz\b", r"\bcellular\b", r"\bNFC\b",
            r"\bZigbee\b", r"\bUWB\b"]
LAUNDRY_MIN = 3

BLOCK = re.compile(
    r"<(h[1-6]|p|li|tr|title|summary|figcaption|dt|dd|desc|blockquote|caption)\b[^>]*>"
    r"(.*?)</\1>", re.S | re.I)
ATTR = re.compile(r'(?:content|alt|aria-label)="([^"]{0,600})"')

EXCLUDE = {".git", "legacysitedata", "dist", "docs", "reports", "_internal",
           "node_modules", "__pycache__", "videos"}


def text_of(fragment: str) -> str:
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", fragment))).strip()



# How close a component claim must sit to the product name to count as ITS claim.
OWNERSHIP_WINDOW = 80
# Possessive / locative constructions that attach a preceding claim to the product.
OWNED_BY_PRODUCT = re.compile(
    r"\b(?:in|of|inside|within|on|from)\s+(?:the\s+)?Ambi\s*-?\s*SEC\b|\bAmbi\s*-?\s*SEC(?:'s|\u2019s)",
    re.I)


def owns_the_claim(text: str) -> bool:
    """Does AmbiSEC own the radio claim in this surface, or is it merely named nearby?

    Same-surface co-occurrence is NOT ownership. A sentence like

        "AmbiOBU carries a C-V2X development radio, a 4G LTE module and the AmbiSEC
         secure element for signed messages."

    names a governed product beside radios that belong to a SIBLING product. Flagging it
    would be the beneficiary-vs-owner error pointed the other way -- and extending the
    provisioning-noun list can never fix it, because the list will always have a gap.
    So the test is positional: the claim must fall in the window FOLLOWING the product
    name, or precede it under a possessive/locative preposition ("the BLE stack in AmbiSEC").

    Raised by the v2x-site session from its own guard's false positives.
    """
    for m in PRODUCT.finditer(text):
        after = text[m.end():m.end() + OWNERSHIP_WINDOW]
        if RF_AS_COMPONENT.search(after):
            return True
        before = text[max(0, m.start() - OWNERSHIP_WINDOW):m.end()]
        if RF_AS_COMPONENT.search(before) and OWNED_BY_PRODUCT.search(before):
            return True
    return False


def surfaces(doc: str):
    """Yield (kind, text). JSON-LD string values are surfaces in their own right."""
    for m in BLOCK.finditer(doc):
        yield m.group(1).lower(), text_of(m.group(2))
    for m in ATTR.finditer(doc):
        yield "attr", html.unescape(m.group(1))
    for m in re.finditer(r'<script[^>]+application/ld\+json[^>]*>(.*?)</script>',
                         doc, re.S | re.I):
        try:
            data = json.loads(m.group(1))
        except ValueError:
            continue
        stack = [data]
        while stack:
            node = stack.pop()
            if isinstance(node, dict):
                stack.extend(node.values())
            elif isinstance(node, list):
                stack.extend(node)
            elif isinstance(node, str) and len(node) < 2000:
                yield "json-ld", node


def findings(doc: str):
    """Two rules, both surface-scoped.

    1. AmbiSEC named in a surface that presents a radio AS A COMPONENT, where the surface
       neither attributes the radio elsewhere nor negates the claim.
    2. A laundry list -- three or more distinct RF technologies in one surface, anywhere in
       a document that names AmbiSEC. The owner ruled that protocol lists on an AmbiSEC page
       are mis-positioning even when attributed, and the diagram label that triggered this
       work sat in an <svg><desc> that named no product itself.
    """
    doc_names_product = bool(PRODUCT.search(doc))
    for kind, text in surfaces(doc):
        if NEGATED.search(text):
            continue
        distinct = sum(1 for t in RF_TERMS if re.search(t, text, re.I))
        if doc_names_product and distinct >= LAUNDRY_MIN:
            yield kind, f"[{distinct} RF technologies listed] " + text[:220]
            continue
        if not owns_the_claim(text):
            continue
        if ATTRIBUTED.search(text):
            continue                      # boundary stated correctly
        yield kind, text[:240]


def scan(paths, strict):
    files = fails = 0
    for raw in paths:
        p = Path(raw)
        candidates = ([f for f in sorted(p.rglob("*.html"))
                       if not set(f.parts) & EXCLUDE] if p.is_dir() else [p])
        for f in candidates:
            files += 1
            for kind, text in findings(f.read_text("utf-8", errors="replace")):
                fails += 1
                print(f"FAIL  AmbiSEC presented as providing an RF technology  [{kind}]\n"
                      f"      {f}\n      {text}")
    print(f"\naudit-ambisec-claims: {files} file(s), {fails} finding(s)")
    return 1 if fails else 0


def selftest():
    def F(doc):
        return list(findings(doc))

    # --- must FAIL: AmbiSEC credited with the radio -------------------------------------
    assert F("<table><tr><th>AmbiSEC</th><td>BLE connectivity stack</td></tr></table>"), \
        "the owner's required failing fixture (th/td row) was not caught"
    assert F("<p>AmbiSEC provides Bluetooth connectivity for your product.</p>")
    assert F("<li>AmbiSEC's Wi-Fi interface handles premises networking.</li>")
    assert F("<h3>AmbiSEC &mdash; LoRa radio stack</h3>")
    assert F('<meta name="description" content="AmbiSEC with integrated NFC and BLE stacks">')
    assert F('<script type="application/ld+json">{"a":"AmbiSEC includes a Thread radio"}</script>')

    # --- must PASS: the boundary stated correctly ---------------------------------------
    ok = [
        # the owner's required passing fixture
        "<table><tr><th>Host radio</th><td>Application-selected RF interface</td></tr>"
        "<tr><th>Security</th><td>AmbiSEC</td></tr></table>",
        # the owner's boundary sentence, verbatim
        "<p>The host communications subsystem may use the RF technology selected for the "
        "application; AmbiSEC provides the separate security boundary.</p>",
        "<p>AmbiSEC provides a hardware security boundary for systems using RF "
        "communications, independent of the underlying radio technology.</p>",
        "<p>The MCU side handles every radio you ship. AmbiSEC never has to.</p>",
        # threat-model contrast: real explanatory value, no attribution to AmbiSEC
        "<p>A LoRa packet crossing five untrusted relays is not the same as a Wi-Fi packet "
        "on a customer network. AmbiSEC supports all three patterns.</p>",
        # radio named, AmbiSEC absent -> not this guard's business
        "<p>Radios live in the MCU domain.</p>",
        # AmbiSEC named, no radio
        "<p>AmbiSEC holds keys that outlive the firmware.</p>",
    ]
    for doc in ok:
        assert not F(doc), f"false positive on: {doc[:90]}"

    # V2X: a component claim must FAIL, a domain noun must PASS. The adjacency requirement
    # is the whole difference, and the disclaimer form is cleared by NEGATED before it.
    assert F("<p>AmbiSEC provides a C-V2X radio interface.</p>"), "V2X component claim missed"
    assert F("<p>AmbiSEC with an integrated V2X stack.</p>"), "V2X stack claim missed"
    assert not F("<p>JavaCard applets for FIDO, PIV and custom V2X certificate management.</p>")
    assert not F("<li>the secure-element platform for V2X OBU / RSU integrations.</li>")
    assert not F("<li>AmbiSecure does not currently ship an ISO 26262 / ASPICE-certified V2X "
                 "stack. Certification of the integrated AmbiSEC Module is a target.</li>")
    assert F("<p>The BLE stack in AmbiSEC handles pairing.</p>"), \
        "a claim preceding the product under a possessive preposition must FAIL"

    # co-occurrence is not ownership IN EITHER DIRECTION: radios owned by a sibling product,
    # AmbiSEC merely named alongside. Raised by the v2x-site session from its own guard.
    assert not F("<p>AmbiOBU carries a 3GPP Release 14 C-V2X development radio, a SIMCom "
                 "A7672-series 4G LTE module and the AmbiSEC secure element for signed "
                 "messages.</p>"), "sibling product's radio must not be attributed to AmbiSEC"

    # laundry list: caught even when attributed, and even when the surface names no product
    assert F('<p>AmbiSEC secures it.</p><desc>The MCU domain runs application firmware, '
             'BLE / Wi-Fi / LoRa / Sub-GHz radios, and sensor acquisition.</desc>'), \
        "attributed protocol laundry list on an AmbiSEC page must still fail"
    # two technologies contrasting threat models is NOT a laundry list
    assert not F("<p>AmbiSEC: a LoRa packet crossing five untrusted relays is not the same "
                 "as a Wi-Fi packet on a customer network.</p>"), "threat-model contrast"
    # explicit disclaimers must never be flagged -- this site uses them deliberately
    assert not F("<p>AmbiSecure does not currently ship an ISO 26262 / ASPICE-certified V2X "
                 "stack. Certification of the integrated AmbiSEC Module is a target.</p>")
    assert not F("<li>What AmbiSecure does not do: operate the V2X PKI, ship turnkey OBUs or "
                 "RSUs, or claim certification of the integrated AmbiSEC Module product.</li>")
    # the product's own NAME must not trip it
    assert not F("<li>IoT Security Co-Processor (AmbiSEC Module) — the secure-element silicon "
                 "platform for V2X OBU / RSU integrations.</li>")
    assert not F("<p>AmbiSEC Module embeds a secure-element die; JavaCard applets for FIDO, "
                 "PIV, OpenPGP, and custom V2X certificate management.</p>")

    # cell-level splitting would miss the required fixture; prove row-level is what runs
    kinds = {k for k, _ in F("<table><tr><th>AmbiSEC</th><td>BLE connectivity stack</td></tr></table>")}
    assert kinds == {"tr"}, f"expected a row-level surface, got {kinds}"

    print("selftest: all assertions passed")
    return 0


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if a != "--strict"]
    if "--selftest" in args:
        sys.exit(selftest())
    sys.exit(scan(args or ["."], "--strict" in sys.argv))
