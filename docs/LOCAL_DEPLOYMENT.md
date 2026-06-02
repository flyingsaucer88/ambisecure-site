# Local Deployment (no GitHub Actions minutes)

This repo can build and ship the AmbiSecure static site **entirely from your
local terminal**, reproducing what `.github/workflows/deploy.yml` does in CI —
without spending GitHub Actions minutes on the FTP upload.

- **Build is the default.** `tools/local-deploy.sh` builds, audits, packages,
  and verifies the artifact. It **never** uploads.
- **Upload is separate and explicit.** `tools/upload-hostinger.sh` is the only
  script that touches production. It refuses to run without credentials, shows
  a summary, and asks you to type `yes`.

---

## What CI does, and how this mirrors it

`.github/workflows/deploy.yml` (the deploy job):

| CI step | Local equivalent |
|---|---|
| `bash tools/build-hostinger-package.sh` | run inside `local-deploy.sh` (stage 3) |
| `bash tools/audit-all.sh` (hard gate) | run inside `local-deploy.sh` (stage 2) |
| FTPS upload via `SamKirkland/FTP-Deploy-Action` | `tools/upload-hostinger.sh` (lftp, FTPS, opt-in) |

`.github/workflows/lighthouse.yml` also runs the audit suite plus a sitemap
URL-count check and Lighthouse. `audit-all.sh` already includes the strict
audits (`audit-yoast --strict`, `audit-freshness --strict`, `audit-circular
--hard-only`, content/seo/media/spam/search), and `local-deploy.sh` adds the
sitemap URL-count check. **Lighthouse is not run locally by default** (it needs
Chrome); run it separately if you want it — see "Compare local vs live" below.

---

## Prerequisites

- `bash`, `git`, `rsync`, `zip`, `unzip`, `python3`, `xmllint` (libxml2-utils) — used by build + audits.
- For **scripted upload**: [`lftp`](https://lftp.yar.ru/) — `brew install lftp` (macOS) or `sudo apt-get install lftp` (Debian/Ubuntu).
- `.deploy.env` with your Hostinger credentials (see below). Not needed for build-only.

---

## Build the artifact (safe default)

```bash
bash tools/local-deploy.sh
# or:  make deploy-build
```

This:
1. Prints branch, commit SHA, and whether the working tree is clean/dirty.
2. Runs the full audit gate (`tools/audit-all.sh`) + sitemap URL-count check. **Stops on any failure.**
3. Builds `dist/ambisecure-hostinger/` and `dist/ambisecure-hostinger.zip`.
4. Verifies the zip **contains** `index.html`, `sitemap.xml`, `robots.txt`, `.htaccess`, `404.html`.
5. Verifies the zip **excludes** repo internals (`.git`, `.github`, `tools/`, `docs/`, `node_modules/`, caches, `Makefile`, `*.env`, …).
6. Writes `dist/DEPLOY_MANIFEST.json` (timestamp, branch, commit, script version, file count, zip size, audit result, tree state).

**Artifacts produced** (all under the gitignored `dist/`):
- `dist/ambisecure-hostinger/` — unzipped tree; upload its **contents** into `public_html`.
- `dist/ambisecure-hostinger.zip` — same tree, files at top level (no wrapper).
- `dist/DEPLOY_MANIFEST.json` — audit record (kept beside the zip; **not** uploaded).

---

## Option 1 — Manual upload via Hostinger hPanel (always works)

No credentials or `lftp` needed; bypasses any FTP/runner issues.

1. **hPanel → Files → File Manager → `public_html`**.
2. Upload `dist/ambisecure-hostinger.zip`.
3. Right-click → **Extract** (files land directly in `public_html`; no wrapper folder).
4. Verify: `curl -sI https://ambisecure.ambimat.com/ | head -3` → `HTTP/2 200`.

---

## Option 2 — Scripted upload (SFTP/FTPS via lftp)

### Configure (once)

```bash
cp deploy.example.env .deploy.env     # .deploy.env is gitignored
$EDITOR .deploy.env
```

Required variables:

| Variable | Meaning |
|---|---|
| `DEPLOY_PROTOCOL` | `ftps` (matches CI, port 21) or `sftp` (Hostinger SSH, usually port 65002) |
| `DEPLOY_HOST` | Server IP. Get it: `dig +short ambisecure.ambimat.com` (currently `193.203.185.149`). The `ftp.<domain>` label often won't resolve — use the IP. |
| `DEPLOY_PORT` | Blank = 21 (ftps) / 65002 (sftp) |
| `DEPLOY_USER` | Full FTP/SSH username (e.g. `u1234567.githubdeploy`) |
| `DEPLOY_PASS` | Account password (or set `DEPLOY_SSH_KEY` instead, sftp only) |
| `DEPLOY_SSH_KEY` | Optional private-key path for sftp key auth |
| `DEPLOY_REMOTE_DIR` | `./` — the deploy account is scoped to `public_html` |
| `DEPLOY_FTPS_VERIFY` | `false` = skip cert-hostname check (Hostinger shared `*.hstgr.io` cert; same as CI `security: loose`) |
| `DEPLOY_ALLOW_DELETE` | `false` — must be `true` **and** you must pass `--delete` to ever remove remote files |

The Hostinger FTP credentials are the same ones stored as the GitHub Actions
secrets `HOSTINGER_FTP_SERVER` / `HOSTINGER_FTP_USERNAME` / `HOSTINGER_FTP_PASSWORD`
(hPanel → Files → FTP Accounts to view/reset).

### Dry-run first (uploads nothing)

```bash
bash tools/upload-hostinger.sh --dry-run     # or: make deploy-dry-run
```

### Real upload

```bash
bash tools/upload-hostinger.sh               # asks you to type 'yes'
# or build + upload in one go:
bash tools/local-deploy.sh --upload          # or: make deploy-upload
# non-interactive (e.g. cron): bash tools/upload-hostinger.sh --yes
```

Default mode is **additive/overwrite only** (`mirror -R --only-newer`); remote
files are never deleted. Verify after: `curl -sI https://ambisecure.ambimat.com/ | head -3`.

---

## Safety model

- Build and upload are **separate scripts**; the default command never uploads.
- The uploader **refuses** to run without `.deploy.env` and the required variables.
- It requires the artifact to have been built by `local-deploy.sh` (checks for `dist/DEPLOY_MANIFEST.json`) and that the dir has an `index.html`.
- It prints host/port/dir, file count, size, branch+commit, and mode, then requires an explicit `yes` (skippable only with `--yes`).
- **No remote deletes** unless `DEPLOY_ALLOW_DELETE=true` **and** `--delete` are both given.
- Credentials live only in `.deploy.env` (gitignored). Passwords are passed to `lftp` over stdin, so they don't appear in `ps`.

---

## Rollback

The site is static, so rollback = re-deploy a previous good state:

```bash
git stash            # park any working changes
git checkout <good-commit>
bash tools/local-deploy.sh           # rebuild that commit's artifact
bash tools/upload-hostinger.sh       # re-upload (additive overwrite)
git checkout -        # return to your branch
git stash pop
```

Because the default upload is additive/overwrite, re-uploading an older build
overwrites changed files in place. (Files added by a newer deploy and removed in
the older one are **not** deleted unless you opt into `--delete` — clean those
via hPanel File Manager if needed.)

---

## Compare local artifact vs live site

```bash
# Live page header / status:
curl -sI https://ambisecure.ambimat.com/ | head -3

# Spot-check a file matches what you built:
diff <(curl -s https://ambisecure.ambimat.com/sitemap.xml) dist/ambisecure-hostinger/sitemap.xml

# Run Lighthouse the way CI does (needs Node + Chrome):
lhci autorun --config=.lighthouserc.json
```

---

## Common failure cases

| Symptom | Cause / fix |
|---|---|
| `audit-all.sh` fails in stage 2 | A real audit regression. Read the `===== name =====` / `FAIL:` lines; fix the content. The build is intentionally blocked. |
| `required file missing from artifact` | A core file (e.g. `robots.txt`) didn't build — check the source tree. |
| `artifact contains forbidden repo internals` | The build leaked something; check the `--exclude` list in `tools/build-hostinger-package.sh`. |
| `lftp is required … not installed` | `brew install lftp`, or use the hPanel manual upload (Option 1). |
| `Timeout (control socket)` on FTPS | The server IP didn't answer for *this* client. Confirm `dig +short ambisecure.ambimat.com` matches `DEPLOY_HOST`; Hostinger sometimes blocks datacenter IPs (works from home, not from CI runners). Retry, or use hPanel. |
| `530 Login authentication failed` | Wrong `DEPLOY_USER`/`DEPLOY_PASS`; reset in hPanel → FTP Accounts and update `.deploy.env`. |
| TLS / cert error on FTPS | Keep `DEPLOY_FTPS_VERIFY=false` (Hostinger shared cert won't match the IP). |
| `--delete` refused | By design — set `DEPLOY_ALLOW_DELETE=true` only if you truly want a destructive mirror. |

---

## Files

| Path | Role |
|---|---|
| `tools/local-deploy.sh` | Orchestrator: git state → audits → build → verify → manifest. Build-only by default; `--upload` hands off to the uploader. |
| `tools/upload-hostinger.sh` | Explicit, credential-gated upload (FTPS/SFTP via lftp). Dry-run, confirmation, no-delete default. |
| `tools/build-hostinger-package.sh` | Produces `dist/ambisecure-hostinger/` + `.zip` (unchanged contract; now also excludes `Makefile`/`*.env`). |
| `tools/audit-all.sh` | The audit gate (same suite CI runs). |
| `deploy.example.env` | Template — copy to `.deploy.env`. |
| `Makefile` | `make deploy-build` / `deploy-dry-run` / `deploy-upload` / `audit`. |
