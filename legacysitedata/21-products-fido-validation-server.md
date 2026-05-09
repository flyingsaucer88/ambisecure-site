# AmbiSecure FIDO Validation Server (Legacy product page)

**URL:** https://ambisecure.ambimat.com/products/ambisecure-fido-validation-server/

> This page contains the same content as `/services/ambisecure-fido-validation-server/`. It serves the FIDO Validation Server product detail under the older `/products/` URL.

For the full content (Privacy / Scalability / Security / Convenience features, API key model, token billing, admin panel, etc.) see [20-services-fido-validation-server.md](20-services-fido-validation-server.md).

## Key facts

- **Title:** Ambisecure Fido Validation Server
- Solution enabling multi-factor authentication where the server manages users' keys and verifies signed transactions without holding the client's private key. Underlying protocols are governed by FIDO Alliance standards.
- API endpoint referenced: `https://api.ambisecure.ambimat.com/auth/login/start` (POST with `x-api-key` header).
- Subscription plans: **Basic, Plus, Pro** with monthly authentication tokens.
- Suspension response payload: `{ "error": "PAYMENT_REQUIRED", "status": 402 }`.
- Token exhaustion payload: `{ "error": "TOKENS_EXHAUSTED" }`.

---

© 2026 **Ambimat Electronics**. All rights reserved.
