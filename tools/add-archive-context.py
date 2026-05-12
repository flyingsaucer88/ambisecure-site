#!/usr/bin/env python3
"""Insert a per-post 'Where this stands in 2026' context block into each archive post.

The block sits inside the same prose container as the existing earlier-piece
italic disclaimer, just before the closing of that section. It adds:
  - a 2026 perspective on the post's topic
  - forward-links to the current cornerstone / timeline / product page

No body content is rewritten.
"""
import os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ARCHIVE = os.path.join(ROOT, 'blog', 'archive')

CONTEXT = {
    'sms-otp-disadvantages': (
        'OTP / SMS in 2026',
        'NIST SP 800-63-4 has finalised the removal of SMS for AAL2+, and OMB M-22-09 mandates phishing-resistant MFA across U.S. federal civilian executive-branch agencies. SMS OTP now survives only as a recovery method on consumer services. See the <a href="/resources/timelines/otp-sms/">OTP / SMS evolution timeline</a>.',
    ),
    'what-is-passwordless-authentication': (
        'Passwordless in 2026',
        'FIDO2 + passkeys have become the production answer. <a href="/technologies/passkeys/">Passkeys</a> are multi-device and synced, and our <a href="/services/fido-validation-server/">FIDO Validation Server</a> handles the verification side. The <a href="/resources/timelines/webauthn-passkey/">WebAuthn / passkey timeline</a> walks the full path.',
    ),
    'is-passwordless-the-future': (
        'Passwordless in 2026',
        'Yes &mdash; and the production answer arrived. FIDO2 hardware keys and synced passkeys are widely deployed; relying-party policy controls which factor counts for AAL3. <a href="/blog/passkeys-vs-traditional-mfa/">Passkeys vs traditional MFA</a> is the current view.',
    ),
    'fast-identity-online': (
        'FIDO in 2026',
        'FIDO 1.0 evolved into FIDO2 + WebAuthn, then into passkeys. <a href="/resources/timelines/fido/">FIDO evolution timeline</a> and <a href="/blog/why-hardware-backed-identity-matters/">why hardware-backed identity matters</a> trace the current state.',
    ),
    'common-misconceptions-about-2fa': (
        '2FA in 2026',
        'The misconception this post addressed has largely been resolved: enterprises now distinguish phishing-resistant MFA (FIDO2, PIV) from possession-only MFA (SMS, push). See <a href="/blog/why-use-multi-factor-authentication/">Why use MFA</a> and <a href="/blog/top-3-benefits-of-mfa/">Top 3 benefits of MFA</a> for the modern framing.',
    ),
    'single-sign-on-vs-mfa': (
        'SSO + MFA in 2026',
        'The two are no longer alternatives. SSO carries identity; MFA carries proof; relying-party policy decides which factor combinations satisfy AAL2 / AAL3. <a href="/solutions/passwordless-enterprise/">Passwordless enterprise</a> assumes both.',
    ),
    'mfa-in-government': (
        'Government MFA in 2026',
        'OMB M-22-09 and NIST SP 800-63-4 have made phishing-resistant MFA the federal baseline. PIV remains, FIDO2 is accepted alongside, and SIM-resident PIV applets ship for telecom-integrated identity. See <a href="/resources/timelines/piv/">PIV timeline</a> and <a href="/solutions/government-identity/">government identity solution</a>.',
    ),
    'security-future-for-government': (
        'Government identity in 2026',
        'The "future" this post anticipated is the present. Phishing-resistant MFA is mandated; FIDO and PIV coexist; ePassport platforms integrate end-to-end. <a href="/solutions/government-identity/">Government identity</a> and the <a href="/services/epassport-platform/">ePassport platform</a> are the current product surface.',
    ),
    'workplace-biometrics': (
        'Workplace biometrics in 2026',
        'Match-on-card and match-on-device are the production patterns; raw biometric data does not leave the secure element. <a href="/products/onepass-bio-card/">OnePass Bio Card</a> and <a href="/products/biokey/">BioKey</a> ship this architecture today.',
    ),
    'consumer-biometrics-and-privacy': (
        'Consumer biometrics in 2026',
        'GDPR / DPDP-era privacy expectations have hardened around on-device matching. The architectural answer &mdash; never ship biometric templates off the secure element &mdash; is now the default. <a href="/blog/secure-element-vs-tpm-vs-hsm/">Secure element vs TPM vs HSM</a> goes deeper.',
    ),
    'enterprise-security-threats': (
        'Enterprise threats in 2026',
        'The attack-surface picture has only expanded &mdash; supply-chain attacks, deepfake-driven social engineering, and credential theft remain dominant. Phishing-resistant MFA, attested authenticators, and hardware-rooted keys are the structural mitigations. <a href="/blog/why-hardware-backed-identity-matters/">Why hardware-backed identity matters</a>.',
    ),
    'cyber-attacks-in-india-part-1': (
        'Cyber landscape in 2026',
        'CERT-In incident-reporting mandates (2022 directions, 2025 amendments) and the Digital Personal Data Protection Act have raised the baseline. The core technical answer &mdash; hardware-rooted credentials, signed firmware, attested attestation &mdash; is unchanged.',
    ),
    'cyber-attacks-in-india-part-2': (
        'Cyber landscape in 2026',
        'Most of the attack classes documented here are now mitigated by phishing-resistant MFA and signed firmware. The architectural primitive &mdash; tamper-resistant key custody &mdash; remains the durable answer. See <a href="/technologies/secure-elements/">Secure Elements</a>.',
    ),
    'cyber-attacks-in-india-part-3': (
        'Cyber landscape in 2026',
        'Many of the breach patterns covered here have been re-cast in the AI-assisted social-engineering era. The hardware-rooted answer &mdash; attested keys, on-device biometric, signed firmware &mdash; still holds.',
    ),
    'iot-security-challenges-part-1': (
        'IoT identity in 2026',
        'IoT-grade secure elements have shipped at scale; attestation is the default identity primitive. <a href="/products/iot-security-chipset/">IoT Security Chipset</a> and <a href="/blog/secure-iot-identity-with-applets/">Secure IoT identity with applets</a> document the production architecture. EU CRA baselines now apply.',
    ),
    'iot-security-challenges-part-2': (
        'IoT identity in 2026',
        'EU Cyber Resilience Act and U.S. cyber-trust-mark labelling have made IoT security a regulatory requirement, not just a best practice. The secure-element-anchored answer is the durable one &mdash; <a href="/resources/timelines/secure-elements/">secure-element timeline</a>.',
    ),
    'securing-iiot-infrastructure': (
        'Industrial IoT in 2026',
        'Industrial IoT now ships with hardware-rooted identity and signed firmware as table stakes &mdash; not bolted on later. <a href="/products/iot-solution/">IoT Solution</a> documents the end-to-end production architecture.',
    ),
    'introduction-to-java-card': (
        'JavaCard in 2026',
        'JavaCard 3.x + GlobalPlatform 2.3.1 (SCP03) is the modern baseline. Multi-applet co-residency (FIDO + PIV + OpenPGP + biometric variants) ships today. <a href="/resources/timelines/smart-cards/">Smart-card timeline</a> and <a href="/products/javacard-applets/">JavaCard applet matrix</a>.',
    ),
    'public-transport-ticketing-part-1': (
        'Transit ticketing in 2026',
        'DESFire EV2 / EV3 with SAM-backed offline trust is the dominant transit pattern. Card emulation on phone (HCE) is supplementary, not a replacement. <a href="/solutions/closed-loop-ticketing/">Closed-loop ticketing</a> documents the current architecture.',
    ),
    'public-transport-ticketing-part-2': (
        'Transit ticketing in 2026',
        'Account-based ticketing has matured but the offline-validator floor &mdash; SAM-backed DESFire &mdash; is still where most volume sits. <a href="/blog/why-sams-matter-in-closed-loop-transit/">Why SAMs matter</a> goes deeper.',
    ),
    'public-transport-ticketing-part-3': (
        'Transit ticketing in 2026',
        'Open-loop EMV contactless has been adopted in most major networks. DESFire and EMV now coexist on the same validator. <a href="/blog/transit-validators-offline-trust-architecture/">Transit validators offline-trust architecture</a> covers the current pattern.',
    ),
    'emv-certification-in-public-transport': (
        'EMV transit in 2026',
        'EMV Contactless Transit Specification has matured; most major networks accept open-loop EMV alongside their closed-loop DESFire systems. The certification questions in this post are still relevant; the technology answers are clearer now.',
    ),
    'how-chip-based-epassports-work': (
        'ePassports in 2026',
        'PACE has fully replaced BAC; Logical Data Structure 2 enables on-chip travel records; ICAO Digital Travel Credentials are entering production pilots. <a href="/resources/timelines/epassport/">ePassport timeline</a> and <a href="/services/epassport-platform/">ePassport platform</a>.',
    ),
    'epassport-applications': (
        'ePassports in 2026',
        'Beyond travel, the same ICAO 9303 chip architecture now powers national-ID, voter-ID, and driver-licence programmes. Sovereign personalisation lines and CSCA / DSC / PKD pipelines are standard parts of the platform stack.',
    ),
}

# Pattern: insert after the italic earlier-piece disclaimer paragraph
DISCLAIMER_RE = re.compile(
    r'(<p style="margin-top:18px;font-size:13\.5px;color:var\(--brand-grey\);font-style:italic;line-height:1\.7;">'
    r'This is an earlier piece from the AmbiSecure engineering archive\. '
    r'Where the field has moved on, the link above points to current coverage of the same topic\.'
    r'</p>)'
)

CONTEXT_TEMPLATE = (
    '\n    <aside class="archive-update" style="margin-top:22px;padding:16px 20px;border-left:3px solid var(--brand-red);background:#FCEEEE;border-radius:0 6px 6px 0;">'
    '<strong style="font-family:\'Montserrat\',sans-serif;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:var(--brand-red);display:block;margin-bottom:6px;">{label}</strong>'
    '<span style="font-size:14.5px;color:var(--ink);line-height:1.65;">{body}</span>'
    '</aside>'
)

def main():
    updated = 0
    for slug in sorted(os.listdir(ARCHIVE)):
        path = os.path.join(ARCHIVE, slug, 'index.html')
        if not os.path.isfile(path): continue
        if slug not in CONTEXT: continue
        if 'archive-update' in open(path).read(): continue
        label, body = CONTEXT[slug]
        block = CONTEXT_TEMPLATE.format(label=label, body=body)
        with open(path) as f:
            html = f.read()
        new = DISCLAIMER_RE.sub(r'\1' + block, html, count=1)
        if new == html:
            print(f"miss  {slug}: disclaimer paragraph not found")
            continue
        with open(path, 'w') as f:
            f.write(new)
        updated += 1
        print(f"OK    {slug}")
    print(f"\nupdated={updated}")

if __name__ == '__main__':
    main()
