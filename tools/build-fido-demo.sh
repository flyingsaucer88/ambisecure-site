#!/usr/bin/env bash
# Build dist/fido-demo/ — a deployment-ready FIDO Validation Server demo bundle.
#
# Produces two artefacts inside dist/fido-demo/:
#   frontend/      static UI shell (safe to upload to Hostinger public_html under
#                  a subdirectory or to demo.ambisecure.ambimat.com)
#   backend.tar.gz Node.js validation-server source, no .env, no node_modules,
#                  ready to deploy on a runtime origin (Hostinger VPS, Render,
#                  Fly.io, Cloud Run). NOT to be uploaded to Hostinger shared.
#   DEPLOYMENT.md  operator notes — env vars, CORS, no-source-leak checklist.
#
# Source repo (private, NOT shipped to ambisecure.ambimat.com public_html):
#   /Users/neelshah/Documents/git_repo/FIDO_latest
#
# Usage:
#   bash tools/build-fido-demo.sh

set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
SRC="${FIDO_SRC:-/Users/neelshah/Documents/git_repo/FIDO_latest}"
OUT="${REPO}/dist/fido-demo"

if [[ ! -d "${SRC}" ]]; then
    echo "FIDO source not found at ${SRC}; set FIDO_SRC=/path/to/FIDO_latest" >&2
    exit 1
fi

echo "Building FIDO demo bundle at ${OUT}"

# ── clean
rm -rf "${OUT}"
mkdir -p "${OUT}/frontend" "${OUT}"

# ── 1. STATIC FRONTEND (Hostinger-uploadable, no Node required)
#
# We deliberately ship ONLY public/index.html + public/index.js +
# public/style.css. The admin/ and sap/ directories carry tenant-management
# UIs that should never be reachable on a public demo URL.
rsync -a \
  --exclude='.DS_Store' \
  --exclude='admin/' \
  --exclude='sap/' \
  "${SRC}/public/" "${OUT}/frontend/"

# Light-touch sanity: ensure no admin / SAP / internal URLs are referenced
# from the static shell.
if grep -RIli --include='*.html' --include='*.js' -E '/admin/|/sap/|/internal/' "${OUT}/frontend" >/dev/null; then
    echo "WARN: admin / sap / internal references found in frontend — review:"
    grep -RIl --include='*.html' --include='*.js' -E '/admin/|/sap/|/internal/' "${OUT}/frontend" || true
fi

# ── 2. BACKEND TAR.GZ (operator deploys to runtime origin)
#
# Exclude node_modules and any .env-shaped files. The operator must supply
# their own .env on the target runtime.
TMP="$(mktemp -d)"
rsync -a \
  --exclude='.git/' \
  --exclude='.DS_Store' \
  --exclude='node_modules/' \
  --exclude='*.env' \
  --exclude='.env*' \
  --exclude='db/' \
  "${SRC}/" "${TMP}/fido-backend/"

# Drop a .env.example next to backend for operator clarity
cat > "${TMP}/fido-backend/.env.example" <<'ENVEOF'
# AmbiSecure FIDO Validation Server — operator-supplied environment
# DO NOT commit this file. Copy to .env on the runtime origin and fill values.

# AWS / DynamoDB
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
DYNAMO_TABLE_WEBAUTHN=WebAuthnUsers

# Session
SESSION_SECRET=  # generate with: openssl rand -hex 32

# WebAuthn relying-party identity (must match the public demo origin)
RP_ID=fido.ambisecure.ambimat.com
RP_NAME=AmbiSecure FIDO Demo
EXPECTED_ORIGIN=https://fido.ambisecure.ambimat.com

# CORS — the AmbiSecure marketing site origin
ALLOWED_ORIGINS=https://ambisecure.ambimat.com,https://pink-swallow-251796.hostingersite.com

# Optional: API key issuance for tenant-scoped REST clients
API_KEY_SALT=
ENVEOF

( cd "${TMP}" && tar -czf "${OUT}/backend.tar.gz" --exclude='.DS_Store' fido-backend )
rm -rf "${TMP}"

# ── 3. DEPLOYMENT.md
cat > "${OUT}/DEPLOYMENT.md" <<'MDEOF'
# AmbiSecure FIDO Validation Server — demo deployment

This bundle ships the demo at one of two recommended URLs:

- `https://fido.ambisecure.ambimat.com/`  (preferred — matches the "Request demo" CTA on the marketing site)
- `https://demo.ambisecure.ambimat.com/fido/`  (alternative if `fido` subdomain is constrained)

## What is in this bundle

```
dist/fido-demo/
├── frontend/            Static UI shell. Upload to Hostinger or any static host.
├── backend.tar.gz       Node.js Validation Server. Deploys to a runtime origin.
└── DEPLOYMENT.md        (this file)
```

The `frontend/` is **safe to upload to Hostinger shared hosting** under a subfolder
or a dedicated subdomain. It contains only the public-facing login / dashboard
UI; the `admin/` and `sap/` tenant-management routes have been stripped at build
time.

The `backend.tar.gz` is **not Hostinger-shared compatible** — it needs Node 20+
plus DynamoDB. Deploy it to one of:

- Hostinger VPS (any tier with Node 20+)
- Render (Web Service, Node runtime)
- Fly.io (`fly launch` on the unpacked directory)
- Google Cloud Run, AWS App Runner, or any container runtime

## Two-origin recommended architecture

```
   ambisecure.ambimat.com           fido.ambisecure.ambimat.com
   ┌────────────────────┐           ┌──────────────────────────┐
   │ Marketing site     │  ──CORS─▶ │ FIDO Validation Server   │
   │ (Hostinger shared) │           │ (VPS / Render / Fly)     │
   │  + frontend/ at    │           │  Node 20 + Express +     │
   │  /demo/            │           │  SimpleWebAuthn          │
   └────────────────────┘           └──────────────────────────┘
                                              │
                                              ▼
                                       DynamoDB (WebAuthnUsers table)
```

## Deploy steps (Hostinger VPS path)

```sh
# 1. Upload backend.tar.gz to your VPS
scp dist/fido-demo/backend.tar.gz user@vps.ambimat.com:/srv/

# 2. On the VPS:
ssh user@vps.ambimat.com
cd /srv && tar -xzf backend.tar.gz && cd fido-backend
cp .env.example .env && nano .env       # fill in real values
npm install --omit=dev
NODE_ENV=production node src/server.js  # or use pm2 / systemd

# 3. Reverse-proxy fido.ambisecure.ambimat.com → :3001 via nginx
#    (TLS cert from Let's Encrypt; HSTS on)

# 4. Upload frontend/ to a static origin OR serve it from the same VPS as
#    static files behind nginx
```

## Deploy steps (Render path)

1. Create a private GitHub repo, push the unpacked `fido-backend/` contents.
2. Render → New → Web Service → connect that repo → runtime Node, build
   `npm install`, start `node src/server.js`.
3. Add the env vars from `.env.example` in Render's dashboard.
4. Set the custom domain `fido.ambisecure.ambimat.com`.
5. Configure DNS at the Ambimat registrar: `CNAME fido → <render-app>.onrender.com`.

## No-source-leak checklist

Before flipping the demo on, verify on the deployed origin:

```sh
# These MUST all return 404 or 403 (no directory listing, no source served)
curl -i https://fido.ambisecure.ambimat.com/.git/                # → 404 / 403
curl -i https://fido.ambisecure.ambimat.com/.env                 # → 404 / 403
curl -i https://fido.ambisecure.ambimat.com/package.json         # → 404 / 403
curl -i https://fido.ambisecure.ambimat.com/src/                 # → 404 / 403
curl -i https://fido.ambisecure.ambimat.com/db.js                # → 404 / 403
curl -i https://fido.ambisecure.ambimat.com/admin/dashboard.html # → 404 / 403
curl -i https://fido.ambisecure.ambimat.com/sap/companies.html   # → 404 / 403

# Sanity: the registration begin endpoint should return JSON 200 for a POST
# and 405 / 404 for a GET (no debug stack traces in any case).
curl -i https://fido.ambisecure.ambimat.com/register
```

If any of those expose source / config / admin routes, do **not** announce the
demo; pull the deployment and fix the routing / static-file config first.

## Security posture

- `express.static('./public/')` MUST point at the trimmed `frontend/` directory
  (admin + sap removed) — not the raw `FIDO_latest/public/`.
- `SESSION_SECRET` MUST be random per environment; the in-source `secret123`
  literal is for local dev only and must be overridden via env.
- DynamoDB IAM credentials should be a least-privilege role with `GetItem` and
  `PutItem` on the `WebAuthnUsers` table only.
- Run behind TLS (cert from Let's Encrypt). HSTS on. WebAuthn refuses to operate
  on http:// origins other than `localhost`.
- Rate-limit `/register` and `/login` at the reverse proxy; the demo is
  intentionally open to anyone with the URL.
- Source maps are NOT shipped in the static frontend (`public/index.js` is
  hand-written, no build step).

## Rolling back the demo

If the demo needs to be pulled:

1. Update the "Request demo" CTA on the marketing site to point at the contact
   form: `services/fido-validation-server/index.html` → swap
   `https://fido.ambisecure.ambimat.com/` for `/contact/`.
2. Stop the backend service (Render → suspend; VPS → systemctl stop).
3. Optional: keep the static `frontend/` shell up; it will show the UI but every
   `/register` / `/login` POST will fail. Decide whether that is acceptable.

## Operator decisions still required

- Hosting shape (VPS vs. managed PaaS).
- DynamoDB region + table-name policy (per-environment, per-tenant naming).
- Whether the admin / sap routes (stripped here) should be exposed on a
  separate, IP-allowlisted hostname.
- Rate-limit thresholds.
- Audit-log retention policy.
MDEOF

# ── 4. SANITY OUTPUT
echo
echo "Bundle contents:"
printf "  Frontend HTML:   %s\n" "$(find "${OUT}/frontend" -name '*.html' | wc -l | tr -d ' ')"
printf "  Frontend JS:     %s\n" "$(find "${OUT}/frontend" -name '*.js' | wc -l | tr -d ' ')"
printf "  Frontend CSS:    %s\n" "$(find "${OUT}/frontend" -name '*.css' | wc -l | tr -d ' ')"
printf "  Backend tar:     %s\n" "$(du -h "${OUT}/backend.tar.gz" | cut -f1)"
printf "  Total dir size:  %s\n" "$(du -sh "${OUT}" | cut -f1)"

echo
echo "Done. Review ${OUT}/DEPLOYMENT.md for the next steps."
