# Blog: AmbiSecure FIDO Validation Server

**URL:** https://ambisecure.ambimat.com/implementing-fido2-authentication-a-complete-developer-guide-by-ambisecure/
**Date:** January 20, 2025
**Author:** Ambisecure Ambimat
**Category:** General
**Tags:** #Ambisecure, MFA, FIDO2, Cybersecurity, WebAuthn, Passwordless Authentication, Authentication Security

---

## Secure Authentication. Clear Billing. Full Control.

Passwords are one of the biggest security risks for modern businesses. Phishing attacks, leaked credentials, OTP fraud, and account takeovers cause financial loss and erode user trust.

AmbiSecure FIDO Validation Server is a FIDO-based passwordless authentication platform designed for enterprises that demand strong security, a seamless user experience, and fully controlled, transparent billing.

## How AmbiSecure FIDO Validation Server Is Used by Companies

AmbiSecure FIDO Validation Server is built as a B2B authentication service. Companies integrate it into their websites or applications, while end users experience secure, passwordless login without added complexity.

## Company Onboarding & Subscription

### 1. Company Creation
When a company subscribes to AmbiSecure FIDO Validation Server:
- A unique API Key is generated
- A subscription plan (Basic, Plus, or Pro) is selected
- Monthly authentication tokens are allocated
- Billing cycle start and end dates are defined

The service is fully billing-controlled from day one.

## API Key & Integration

### What Is the API Key?
The API key securely identifies which company is making authentication requests to AmbiSecure FIDO Validation Server.

### Who Receives the API Key?
- ✅ Company's developer or IT team
- ❌ Never shared with end users

### How the API Key Is Used
The API key is added to server-side code when calling AmbiSecure FIDO Validation Server authentication APIs.

```js
fetch("https://api.ambisecure.ambimat.com/auth/login/start", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "YOUR_COMPANY_API_KEY"
  },
  body: JSON.stringify({
    username: "user@example.com"
  })
});
```

> Security note: API keys must always be stored securely on the server and should never be exposed in frontend code or public files.

## End User Authentication Flow

Once integrated, end users authenticate using FIDO standards such as:
- Fingerprint
- Face ID
- Device or hardware security keys

> No passwords. No OTPs. No recovery risks.

## Token-Based Usage Model

- Each successful user login consumes 1 token
- Tokens represent real authentication usage
- Non-authentication actions do not consume tokens

This ensures companies pay only for actual login activity.

## Subscription Plans

Each subscription plan includes detailed features listed at: https://ambisecure.ambimat.com/8679-2/

## Token Exhaustion Handling

```json
{ "error": "TOKENS_EXHAUSTED" }
```
- Authentication requests are temporarily blocked
- Users cannot log in
- Access is restored immediately after tokens are added or the plan is upgraded

## Billing Lifecycle, Grace Period & Suspension

### Billing Cycle
Each subscription operates within a defined billing cycle with clear start and end dates.

### Grace Period
If payment is not completed by the billing end date, a grace period is applied to prevent immediate service disruption.

### Suspension
```json
{ "error": "PAYMENT_REQUIRED", "status": 402 }
```
- Login is blocked
- Authentication APIs are disabled
- Service resumes automatically after payment confirmation

> No manual intervention is required.

## Payment & Auto-Restore

After payment:
- Subscription status becomes ACTIVE
- Tokens are unlocked or reset
- A new billing cycle begins
- All authentication services resume automatically

## Client Admin Panel (Company Side)

Each company receives access to an Admin Panel where they can:
- View total, used, and remaining tokens
- Monitor billing start and end dates
- Track grace period status and alerts
- View and download invoices
- Upgrade subscription plans
- Complete payments
- Track authentication usage in real time

Everything is updated in real time, giving companies full operational visibility.

## Security & Business Benefits

### Why Use FIDO Authentication?
- No passwords stored or transmitted
- Resistant to phishing and credential theft
- Built on industry-approved FIDO standards

### Business Advantages
- Predictable, usage-based billing
- Automated access control
- Transparent invoicing
- Enterprise-ready scalability

## Why Companies Choose AmbiSecure FIDO Validation Server
- Passwordless user experience
- Enterprise-grade security
- Clear and fair billing model
- Automatic grace and suspension handling
- Easy integration with existing systems
