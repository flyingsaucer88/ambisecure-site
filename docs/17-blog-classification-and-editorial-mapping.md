# 17. Blog Classification & Editorial Mapping

**Date:** 2026-05-11
**Source:** `/legacysitedata/` — 47 legacy blog posts (b01–b47).
**Status:** Complete — every legacy blog classified into one of three editorial ecosystems.

---

## Classification rule

Each legacy blog is assigned to exactly one editorial property:

- **AmbiSecure** (`ambisecure.ambimat.com`): security / FIDO / smart-card / MFA / identity / transit / biometric-security / IoT-security
- **Ambimat** (`ambimat.com`): corporate / electronics / general IoT / hardware-startup / cold-chain / smart-city / industry-general
- **eSIM Initiative** (`esim.ambimat.com`): telecom / SIM / cellular / LPWAN / 5G-telecom-security

Behaviour:

- **AmbiSecure** → migrated to `/blog/archive/<slug>/` with "Historical archive" framing, "Originally published" date, and forward-link to current modern coverage where it exists.
- **Ambimat** → 301 redirect from legacy URL to `https://ambimat.com/`.
- **eSIM** → 301 redirect from legacy URL to `https://esim.ambimat.com/`.

---

## Full classification table

| # | Blog Title | Legacy URL | Date | Assigned property | Primary topic | Secondary topic | Migration status | Notes |
|---|------------|------------|------|-------------------|----------------|------------------|------------------|-------|
| b01 | AmbiSecure FIDO Validation Server | `/implementing-fido2-authentication-a-complete-developer-guide-by-ambisecure/` | 2025-01-20 | AmbiSecure | FIDO | WebAuthn | **modern-exists** | Redirects to `/blog/implementing-fido2-developer-guide/` (modern Phase 4 article). |
| b02 | Why use Multi-factor Authentication (MFA)? | `/why-use-multi-factor-authentication-mfa/` | 2021-08-23 | AmbiSecure | MFA | Cybersecurity | **modern-exists** | Redirects to `/blog/why-use-multi-factor-authentication/` (modern Phase 4 article). |
| b03 | Top 3 Benefits of MFA | `/top-3-benefits-of-multi-factor-authentication/` | 2021-08-20 | AmbiSecure | MFA | Cybersecurity | **modern-exists** | Redirects to `/blog/top-3-benefits-of-mfa/` (modern Phase 4 article). |
| b04 | Common Misconceptions about 2FA | `/common-misconceptions-about-two-factor-authentication/` | 2021-08-19 | AmbiSecure | MFA | Cybersecurity | archive | `/blog/archive/common-misconceptions-about-2fa/` |
| b05 | SSO vs MFA | `/single-sign-on-vs-multi-factor-authentication/` | 2021-08-19 | AmbiSecure | MFA | Identity | archive | `/blog/archive/single-sign-on-vs-mfa/` |
| b06 | MFA in Government | `/multi-factor-authentication-in-government-sector/` | 2021-08-19 | AmbiSecure | MFA | Government Identity | archive | `/blog/archive/mfa-in-government/` |
| b07 | Cyber Attacks in India – Part 3 | `/cyber-attacks-in-india-part-3/` | 2021-08-05 | AmbiSecure | Cyber Threats | – | archive | `/blog/archive/cyber-attacks-in-india-part-3/` |
| b08 | Cyber Attacks in India – Part 2 | `/cyber-attacks-in-india-part-2/` | 2021-07-28 | AmbiSecure | Cyber Threats | – | archive | `/blog/archive/cyber-attacks-in-india-part-2/` |
| b09 | Cyber Attacks in India | `/cyber-attacks-in-india/` | 2021-07-28 | AmbiSecure | Cyber Threats | – | archive | `/blog/archive/cyber-attacks-in-india-part-1/` |
| b10 | Enterprise Security Threats | `/enterprise-security-threats/` | 2021-07-06 | AmbiSecure | Cyber Threats | Enterprise MFA | archive | `/blog/archive/enterprise-security-threats/` |
| b11 | What is Passwordless | `/what-is-passwordless-authentication/` | 2021-06-01 | AmbiSecure | Passwordless | FIDO | archive | Cross-links to modern `/blog/designing-enterprise-passwordless-systems/`. |
| b12 | Is Passwordless the Future | `/is-passwordless-the-future/` | 2021-06-01 | AmbiSecure | Passwordless | – | archive | Cross-links to modern designing-enterprise-passwordless-systems. |
| b13 | SMS OTP Disadvantages | `/sms-based-otp-authentication-and-its-disadvantages/` | 2021-06-01 | AmbiSecure | MFA | Cyber Threats | archive | Cross-links to modern `/blog/passkeys-vs-traditional-mfa/`. |
| b14 | Security future for Government | `/taking-security-future-for-government/` | 2021-03-25 | AmbiSecure | Government Identity | MFA | archive | `/blog/archive/security-future-for-government/` |
| b15 | Semiconductor Shortage | `/the-great-semiconductor-shortage/` | 2021-03-18 | **Ambimat** | Industry | – | redirected | → https://ambimat.com/ |
| b16 | MQTT-SN | `/mqtt-sn-lowering-the-cost-of-iot-at-scale/` | 2021-03-11 | **Ambimat** | IoT | – | redirected | → https://ambimat.com/ |
| b17 | E-passport How | `/e-passport-and-how-will-chip-based-e-passports-work/` | 2021-01-28 | AmbiSecure | Smart Cards | Government Identity, ePassport | archive | `/blog/archive/how-chip-based-epassports-work/` |
| b18 | E-passport Application | `/e-passport-and-its-application/` | 2021-01-28 | AmbiSecure | Smart Cards | Government Identity, ePassport | archive | `/blog/archive/epassport-applications/` |
| b19 | UWB Rise | `/rise-of-uwb-and-the-impact-on-different-industry-verticals/` | 2021-01-28 | **Ambimat** | UWB | – | redirected | → https://ambimat.com/ |
| b20 | Cold Chain Podcast | `/cold-chain-logistics-podcast/` | 2021-01-27 | **Ambimat** | Cold Chain | – | redirected | → https://ambimat.com/ |
| b21 | Intro to Java Card | `/an-introduction-to-java-card-technology/` | 2020-12-15 | AmbiSecure | JavaCard | Smart Cards | archive | Cross-links to modern `/blog/apdu-from-first-principles/`. |
| b22 | Fast Identity Online (FIDO) | `/fast-identity-online-fido/` | 2020-12-15 | AmbiSecure | FIDO | Passwordless | archive | Cross-links to modern `/blog/implementing-fido2-developer-guide/`. |
| b23 | Cold Chain Logistics | `/cold-chain-logistics/` | 2020-11-13 | **Ambimat** | Cold Chain | – | redirected | → https://ambimat.com/ |
| b24 | Cold Chain IoT | `/cold-chain-logistics-solutions-benefits/` | 2020-11-13 | **Ambimat** | Cold Chain | – | redirected | → https://ambimat.com/ |
| b25 | Cold Chain Vaccine | `/cold-chain-logistics-effective-vaccine-management/` | 2020-11-03 | **Ambimat** | Cold Chain | – | redirected | → https://ambimat.com/ |
| b26 | Ultra-Wideband | `/what-is-ultra-wideband-and-how-does-it-work/` | 2020-10-19 | **Ambimat** | UWB | – | redirected | → https://ambimat.com/ |
| b27 | EMV Public Transport | `/contactless-emv-payments-in-public-transportation/` | 2020-08-28 | AmbiSecure | Transit | Smart Cards | archive | Cross-links to modern `/blog/why-sams-matter-in-closed-loop-transit/`. |
| b28 | 5G and IoT | `/5g-and-iot-the-future-of-5g-communications/` | 2020-08-19 | **Ambimat** | 5G | IoT | redirected | → https://ambimat.com/ |
| b29 | Zoom Fatigue | `/zoom-fatigue-how-to-make-video-calls-less-tiring/` | 2020-07-30 | **Ambimat** | Workplace | – | redirected | → https://ambimat.com/ |
| b30 | Workplace Biometrics | `/workplace-security-how-biometrics-is-the-key-to-the-new-normal/` | 2020-07-30 | AmbiSecure | Biometrics | Enterprise MFA | archive | `/blog/archive/workplace-biometrics/` |
| b31 | How secure is 5G | `/how-secure-is-5g-really/` | 2020-07-30 | **eSIM** | Telecom Security | 5G | redirected | → https://esim.ambimat.com/ |
| b32 | Consumer Biometrics Privacy | `/consumer-biometrics-in-the-data-privacy-age/` | 2020-06-29 | AmbiSecure | Biometrics | Privacy | archive | `/blog/archive/consumer-biometrics-and-privacy/` |
| b33 | Securing IIoT | `/securing-your-iiot-infrastructure/` | 2020-06-08 | AmbiSecure | IoT Security | – | archive | `/blog/archive/securing-iiot-infrastructure/` |
| b34 | UV-C Sanitization | `/uvc-based-sanitization-devices-really-effective-against-covid-19/` | 2020-06-01 | **Ambimat** | Health | – | redirected | → https://ambimat.com/ |
| b35 | Public Transport Ticketing 3 | `/public-transport-ticketing-system-part-3/` | 2020-05-26 | AmbiSecure | Transit | – | archive | Cross-links to modern `/blog/why-sams-matter-in-closed-loop-transit/`. |
| b36 | Public Transport Ticketing 2 | `/public-transport-ticketing-2/` | 2020-05-18 | AmbiSecure | Transit | – | archive | `/blog/archive/public-transport-ticketing-part-2/` |
| b37 | Public Transport Ticketing 1 | `/public-transport-ticketing-system-part-1/` | 2020-05-12 | AmbiSecure | Transit | – | archive | `/blog/archive/public-transport-ticketing-part-1/` |
| b38 | City Street Lighting | `/the-transformation-of-city-street-lighting/` | 2020-05-04 | **Ambimat** | Smart City | – | redirected | → https://ambimat.com/ |
| b39 | IoT Security 2 | `/challenges-to-iot-security-2/` | 2020-04-27 | AmbiSecure | IoT Security | – | archive | `/blog/archive/iot-security-challenges-part-2/` |
| b40 | IoT Security 1 | `/challenges-to-iot-security-1/` | 2020-04-20 | AmbiSecure | IoT Security | – | archive | `/blog/archive/iot-security-challenges-part-1/` |
| b41 | Non-Cellular WAN | `/non-cellular-network-based-wide-area-networks-1/` | 2020-04-16 | **eSIM** | LPWAN | – | redirected | → https://esim.ambimat.com/ |
| b42 | Cellular WAN | `/cellular-network-based-wide-area-networks/` | 2020-04-13 | **eSIM** | Cellular | – | redirected | → https://esim.ambimat.com/ |
| b43 | LPWAN | `/what-is-lpwan-and-types-of-lpwan-network/` | 2020-04-09 | **eSIM** | LPWAN | – | redirected | → https://esim.ambimat.com/ |
| b44 | IoT Security 1 (alt URL) | `/challenges-to-iot-security/` | 2020-04-03 | AmbiSecure | IoT Security | – | duplicate-redirect | Same content as b40; redirect → `/blog/archive/iot-security-challenges-part-1/`. |
| b45 | Hardware Startup 1 | `/the-story-of-yet-another-framework-propeller-2/` | 2017-08-08 | **Ambimat** | Hardware Startup | – | redirected | → https://ambimat.com/ |
| b46 | Hardware Startup 2 | `/a-hardware-start-up-part-2-ideationconceptualization/` | 2017-06-06 | **Ambimat** | Hardware Startup | – | redirected | → https://ambimat.com/ |
| b47 | Hardware Startup 3 | `/a-hardware-start-up-part-3-proof-of-concept-poc/` | 2017-05-30 | **Ambimat** | Hardware Startup | – | redirected | → https://ambimat.com/ |

---

## Totals by ecosystem

| Property | Count | Disposition |
|----------|------:|-------------|
| AmbiSecure | 28 | 3 → modern (existed in Phase 4); 24 → archive; 1 → duplicate-redirect (b44). |
| Ambimat | 15 | All → 301 redirect to `https://ambimat.com/`. |
| eSIM Initiative | 4 | All → 301 redirect to `https://esim.ambimat.com/`. |
| **Total** | **47** | Zero information loss; every legacy URL resolves. |

---

## Modern blog inventory (canonical AmbiSecure surface)

| Slug | Title | Date | Categories |
|------|-------|------|------------|
| `implementing-fido2-developer-guide` | Implementing FIDO2 Authentication — A Complete Developer Guide | 2026-01-20 | FIDO, WebAuthn, Passwordless |
| `designing-enterprise-passwordless-systems` | Designing Enterprise Passwordless Systems | 2026-01-15 | Passwordless, Enterprise MFA, FIDO |
| `passkeys-vs-traditional-mfa` | Passkeys vs Traditional MFA | 2026-01-10 | FIDO, Passwordless, MFA |
| `platform-vs-roaming-authenticators` | Platform vs Roaming Authenticators | 2026-01-05 | FIDO, WebAuthn |
| `understanding-webauthn-attestation-objects` | Understanding WebAuthn Attestation Objects | 2025-12-28 | FIDO, WebAuthn, Cryptography |
| `why-hardware-backed-identity-matters` | Why Hardware-Backed Identity Matters | 2025-12-20 | FIDO, Smart Cards, Identity |
| `apdu-from-first-principles` | APDU From First Principles | 2025-12-12 | JavaCard, Smart Cards |
| `desfire-ev1-vs-ev2-vs-ev3` | DESFire EV1 vs EV2 vs EV3 | 2025-12-05 | DESFire, Transit, Smart Cards |
| `designing-low-latency-secure-transit-validators` | Designing Low-Latency Secure Transit Validators | 2025-11-28 | Transit, DESFire, Offline Authentication |
| `why-sams-matter-in-closed-loop-transit` | Why SAMs Matter in Closed-Loop Transit | 2025-11-20 | Transit, Smart Cards, Offline Authentication |
| `top-3-benefits-of-mfa` | Top 3 Benefits of MFA | 2025-11-15 | MFA, Cybersecurity |
| `why-use-multi-factor-authentication` | Why Use Multi-Factor Authentication | 2025-11-10 | MFA, Cybersecurity |

12 modern posts. Each is reachable from:
- `/blog/` (newest-first listing)
- `/blog/categories/<slug>/` (one entry per category it belongs to)
- The homepage daily-rotation spotlight (when JS is enabled)

---

## Category inventory

19 categories total, each rendered as a real `/blog/categories/<slug>/` page mixing modern + archive entries newest-first:

Biometrics · Cryptography · Cyber Threats · Cybersecurity · DESFire · Enterprise MFA · ePassport · FIDO · Government Identity · Identity · IoT Security · JavaCard · MFA · Offline Authentication · Passwordless · Privacy · Smart Cards · Transit · WebAuthn

---

## Editorial governance going forward

| Decision | Rule |
|----------|------|
| A new blog about MFA / FIDO / WebAuthn / smart cards / IoT security / transit / identity | Belongs on `ambisecure.ambimat.com/blog/`. |
| A new blog about cold-chain / hardware-startup / industrial IoT / UWB / industry analysis | Belongs on `ambimat.com/`. |
| A new blog about eSIM RSP / SIM-OTA / cellular / LPWAN / telecom-security | Belongs on `esim.ambimat.com/`. |
| Cross-property thematic content | Author once on the most-aligned property; the other two link to it. Never republish in two places — Google sees that as duplicate content. |
| Reclassifying a legacy post | Update this document and adjust the 301 in `.htaccess`. The classification table is authoritative. |
