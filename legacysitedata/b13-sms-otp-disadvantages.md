# Blog: SMS-based OTP Authentication and Its Disadvantages

**URL:** https://ambisecure.ambimat.com/sms-based-otp-authentication-and-its-disadvantages/
**Date:** June 1, 2021
**Author:** Ambisecure Ambimat
**Category:** General
**Tags:** IoT security, #Ambisecure, multi-factor authentication

---

Dear Readers,

The blog of this week is about the Limitations of SMS-based OTP Authentication. Through this blog, we aim to make our readers aware of the common two-factor authentication (2FA) techniques used in India and the security risks associated with SMS-based OTP Authentication.

## Multi-Factor Authentication

A simple password doesn't cut it for most systems. MFA grants access only after presenting at least two pieces of evidence:
- **Knowledge Factor** — Something you know (password, PIN, answer)
- **Possession Factor** — Something you have (token, card, mobile device)
- **Inherence Factor** — Something you are (biometric data)

MFA-enabled accounts require a second code generated through an alternative medium in addition to a traditional password.

## SMS-based OTP Authentication and Its Disadvantages

Smartphones give us access to numerous services online — banking, shopping, social media, etc. This rise in connectivity gave rise to data theft. To overcome breaches, many providers introduced SMS-based OTP authentication. The concept is to enter an OTP received on your mobile to verify credentials. But SMS-based OTP authentication can also be compromised.

### Disadvantages of SMS based OTP Authentication

1. **Low level of security for a Second Factor Authentication Method** — SMS OTP is more like a two-step verification because you simply receive a message on your phone. Messages can be intercepted and copied by malware.
2. **Unsecure to Open Networks** — Open or unsecured networks are the lurking ground for hackers (Man-In-The-Middle). Uploading malicious software becomes easy.
3. **Unencrypted Messages** — SMS OTP is plain text passing through channels with weak security. SIM swap attacks let hackers obtain new SIMs and receive OTPs.
4. **Privacy and Security of Message not Guaranteed** — Most network operators cannot provide proper security measures.

## Why is SMS-based 2FA still so popular?

- Original assumptions about cellular network/handset security no longer hold; specialized Trojans hijack mobile phones.
- OTP requires reliable cell signal and battery life.
- Occasional SMS delivery failures.
- 3rd-party messaging providers often incur per-text charges.

## Going beyond SMS authentication

FIDO2 is a standard that uses public-key cryptography to protect from phishing — the only phishing-proof factor available. AmbiSecure key and card combine hardware-based authentication and public key cryptography. AmbiSecure helps organizations accelerate to a password-less future via FIDO2 protocol. The key/card requires no battery or network connectivity.

## About Ambimat Electronics

Close to 4 decades of design experience. Solutions include AmbiPay, AmbiPower, AmbiCon, AmbiSecure, AmbiSense, AmbiAutomation across smartwatches, smart homes, medical, robotics, retail, pubs/brewery, and security.

## References
- https://fossbytes.com/heard-blue-screen-of-death-there-are-black-red-green-white-purple-gray-yellow-brown-also/
- https://blog.securedtouch.com/digital-officers-guide-multifactor-authentication
