# Hostinger Auto-Deploy via GitHub Actions — Playbook

A reusable, repo-agnostic guide to wiring any GitHub repo to a Hostinger shared-hosting site so that every push to `main` ships to `public_html` automatically. Distilled from the AmbiSecure rollout (Phase 39) — every gotcha below was hit at least once and cost time. Following this playbook end-to-end on a new repo should take ~20 minutes.

---

## 1. What this gives you

- **Push-to-deploy**: `git push origin main` → GitHub Actions runs → FTPS upload to `public_html` → site is live in 1–2 min (after the first deploy).
- **Diff-only uploads**: only changed files are sent after the first sync (via a state file persisted on the FTP server).
- **Optional safety gate**: audits / linters / tests run before the upload — a failing audit means nothing ships.
- **Manual escape hatch**: a "Run workflow" button in the GitHub Actions UI for when you want to redeploy without pushing.
- **Concurrency control**: a new push mid-deploy cancels the old one — only the latest `main` matters.

Works on **any Hostinger plan** (Premium, Business, Cloud) because it uses FTPS, which all plans support. Business+ plans also offer SSH; see §10 for the upgrade path.

---

## 2. Prerequisites

- A GitHub repo that builds a deployable tree (static site, or any framework with a build step that produces an output directory).
- A Hostinger website pointing to the domain you want to deploy to.
- Access to **hPanel** (Hostinger's control panel) for that website.
- Repository **Admin** permission on GitHub (you need it to add Secrets and run Actions).

---

## 3. Step-by-step setup

### Step 1 — Create a dedicated FTP account in hPanel

**Why dedicated?** Never use the site-wide FTP user for CI. A scoped account means a leaked CI password can only touch one site's `public_html`, and you get a clear audit trail of automation-vs-human deploys.

1. hPanel → **Websites** → pick the site → **Files** → **FTP Accounts**.
2. **Create FTP Account**:
   - **FTP Username**: pick a label like `githubdeploy`. Hostinger prepends your account ID, so the full username becomes `u#######.githubdeploy` (write this down).
   - **FTP Password**: generate a strong password and save it in your password manager. You will NOT be able to view it again — only reset.
   - **Directory**: scope it to that domain's `public_html`, e.g. `/home/u#######/domains/<your-domain>/public_html`. **This is the most important field** — get it wrong and the account can read the whole hosting account.
3. Save. Verify the new account appears in the list with the correct directory scope.

> **Gotcha**: hPanel sometimes shows a different site's FTP modal if you have multiple sites. Confirm the domain in the breadcrumb before clicking Create.

### Step 2 — Get the FTP server address (DNS gotcha)

Hostinger's hPanel shows an "FTP Hostname" like `ftp.<your-domain>` — but **that subdomain often doesn't actually resolve in public DNS**. It's a UI label, not a real record. Always verify before trusting it.

```bash
dig +short ftp.<your-domain>
# If empty → NXDOMAIN, the subdomain isn't real. Fall through to the next command.

dig +short <your-domain>
# This gives you the shared server IP, e.g. 193.203.185.149
```

**Use the raw IP** (e.g. `193.203.185.149`) as the FTP server address in the next step. The FTPS cert won't match either the IP or your domain anyway (see §4), so picking the "prettier" hostname buys you nothing and may break the deploy.

### Step 3 — Add GitHub Secrets

GitHub repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.

Add three secrets (exact names matter — the workflow file references them):

| Name | Value |
|------|-------|
| `HOSTINGER_FTP_SERVER` | Raw IP from Step 2 (e.g. `193.203.185.149`) |
| `HOSTINGER_FTP_USERNAME` | Full username from Step 1 (e.g. `u#######.githubdeploy`) |
| `HOSTINGER_FTP_PASSWORD` | Password from Step 1 |

Once saved, GitHub will never show you the values again — only allow update or delete. That's fine; the workflow reads them via `${{ secrets.NAME }}`.

### Step 4 — Add the workflow file

Create `.github/workflows/deploy.yml` in your repo. Use the template in §5 below as a starting point, then customise:

- **Build step**: replace `bash tools/build-hostinger-package.sh` with whatever produces your deployable tree (e.g. `npm ci && npm run build`, `hugo`, `bundle exec jekyll build`).
- **`local-dir`**: point at the output directory (e.g. `./dist/`, `./public/`, `./_site/`). **Must end with a trailing slash** — the action treats `./dist/` as "copy the contents of dist" but `./dist` as "copy the dist folder itself", which nests everything one level too deep.
- **Audit/test step**: optional but recommended. Delete it if you don't have one.

### Step 5 — Commit, push, and watch the first deploy

```bash
git add .github/workflows/deploy.yml
git commit -m "Add auto-deploy workflow: GitHub Actions → Hostinger FTPS"
git push origin main
```

Open GitHub → **Actions** tab. You should see a "Deploy to Hostinger" run start within seconds.

**The first deploy takes 10–15+ minutes** because it's a full sequential upload of every file in your output tree. This is normal. Subsequent deploys finish in 1–2 minutes (diff-only via the state file).

When it succeeds:

```bash
curl -sI https://<your-domain>/ | head -3
# HTTP/2 200 (or HTTP/1.1 200 OK) means the site responds.
```

Spot-check a recently changed page in a browser to confirm the new build is live.

---

## 4. Critical config you cannot skip

These four settings caused real failures during the AmbiSecure rollout. Bake them into every workflow.

### `security: loose`

Hostinger's shared FTPS servers present a wildcard cert for `*.hstgr.io` — issued by Sectigo, perfectly valid, but **doesn't match your domain or the raw IP you connect to**. The default cert-verification mode rejects the handshake.

`security: loose` keeps TLS encryption on (the channel is still encrypted) but skips the **hostname-to-cert binding check**. This is the standard pattern for any shared-hosting FTPS; the alternative (a domain-matched cert) requires a dedicated IP, which is a Business+ plan upgrade.

Without it: `Error: client is missing required "host" property` or TLS handshake fails outright.

### `timeout-minutes: 30`

Job-level timeout. The default 360 min is too generous (a runaway burns CI minutes); 15 min isn't enough for the first deploy. **30 is the sweet spot** — covers a worst-case first deploy of a few thousand files over sequential FTPS, while still aborting any run that's clearly hung.

After the first deploy, real run time drops to 1–2 min because of the state file (next bullet). You can leave the timeout at 30; it's a ceiling, not a fixed cost.

### `state-name: .github-deploy-state.json`

The FTP-Deploy-Action writes a JSON manifest of file hashes to this path **on the FTP server itself** after each successful run. On the next run it downloads the manifest, computes a diff against the current build, and uploads only changed files.

Without it: every deploy is a full re-upload, every deploy hits the 15+ min timeout risk. With it: deploy #2 onwards is near-instant.

> **Gotcha**: if you ever want a forced full re-upload (e.g. after a botched deploy), SSH/FTP in and delete `.github-deploy-state.json` from `public_html`. Or change the `state-name` value to a different filename for one run.

### `concurrency.group: deploy-<branch>` + `cancel-in-progress: true`

If two commits land on `main` in quick succession, you don't want two deploys racing to upload to the same FTP account — they'll corrupt the state file and possibly leave the site in a half-uploaded state.

The concurrency block ensures: only one deploy can run at a time per branch, and a newer push cancels any in-flight deploy. Only the latest commit on `main` matters.

---

## 5. Workflow file template

Drop this into `.github/workflows/deploy.yml` and adjust the marked spots.

```yaml
name: Deploy to Hostinger

# Triggers:
#   - push to main → continuous deployment
#   - workflow_dispatch → manual "Run workflow" button in the Actions UI
on:
  push:
    branches: [main]
    paths-ignore:
      # Don't waste CI minutes on doc-only commits.
      - 'docs/**'
      - '.claude/**'
      - 'README.md'
      - '**/*.md'
  workflow_dispatch:

# If a new push lands while a deploy is in flight, cancel the old one.
concurrency:
  group: deploy-main
  cancel-in-progress: true

jobs:
  deploy:
    name: Build and deploy to Hostinger public_html
    runs-on: ubuntu-latest
    timeout-minutes: 30
    permissions:
      contents: read

    steps:
      - name: Checkout repo
        uses: actions/checkout@v4

      # ---- ADJUST: install whatever your build/audit needs that
      #              ubuntu-latest doesn't ship by default. ----
      # Example: xmllint for sitemap validation, ImageMagick, etc.
      # - name: Install dependencies
      #   run: sudo apt-get update && sudo apt-get install -y libxml2-utils

      # ---- ADJUST: your build command. Output dir referenced below. ----
      - name: Build deployable tree
        run: bash tools/build-hostinger-package.sh
        # Other examples:
        #   run: npm ci && npm run build
        #   run: hugo --minify
        #   run: bundle exec jekyll build

      # ---- OPTIONAL: pre-deploy safety gate. Delete this step if you
      #               don't have audits/tests/linters. ----
      - name: Run site audits (safety net)
        run: bash tools/audit-all.sh

      - name: Deploy via FTPS
        uses: SamKirkland/FTP-Deploy-Action@v4.3.5
        with:
          server: ${{ secrets.HOSTINGER_FTP_SERVER }}
          username: ${{ secrets.HOSTINGER_FTP_USERNAME }}
          password: ${{ secrets.HOSTINGER_FTP_PASSWORD }}
          protocol: ftps
          port: 21
          # Hostinger's FTPS presents a *.hstgr.io shared cert that
          # doesn't match our domain/IP. TLS still encrypts the channel;
          # we skip only the hostname-cert binding check.
          security: loose
          # ---- ADJUST: path to your build output. MUST end with "/". ----
          local-dir: ./dist/ambisecure-hostinger/
          # The scoped FTP account lands inside public_html, so we
          # mirror to its home directory.
          server-dir: ./
          # Persists on the FTP server; enables diff-only deploys after #1.
          state-name: .github-deploy-state.json
          timeout: 60000  # 60s per command — Hostinger FTP can be sluggish
          log-level: standard
          exclude: |
            **/.DS_Store
            **/.git*

      - name: Success summary
        if: success()
        run: |
          echo "::notice title=Deploy succeeded::Mirrored to public_html via FTPS"
          echo "Verify: curl -sI https://<your-domain>/ | head -3"
```

---

## 6. Failure modes you will probably hit

Every one of these bit us during the AmbiSecure rollout. Fixes are short.

### 6.1 `xmllint: command not found` (or any missing CLI in CI)

**Symptom**: build step fails because a tool you rely on locally (xmllint, ImageMagick, ffmpeg, etc.) isn't on `ubuntu-latest`.

**Cause**: macOS ships hundreds of utilities via Xcode CLI tools that Ubuntu doesn't include by default.

**Fix**: add an install step before the step that needs them. For xmllint:

```yaml
- name: Install audit dependencies
  run: sudo apt-get update && sudo apt-get install -y libxml2-utils
```

For Node tooling: `actions/setup-node@v4`. For Python: `actions/setup-python@v5`. For anything else: a one-line `apt-get install`.

### 6.2 `ENOTFOUND ftp.<your-domain>`

**Symptom**: deploy fails immediately during the FTP connect step with `getaddrinfo ENOTFOUND ftp.example.com`.

**Cause**: hPanel labels the server as `ftp.<your-domain>` in the UI, but the DNS record was never published. NXDOMAIN.

**Fix**: see §3 step 2 — switch the `HOSTINGER_FTP_SERVER` secret value to the **raw IP** of your shared server. Get it from `dig +short <your-domain>`.

### 6.3 TLS handshake fails / cert verification error

**Symptom**: "self-signed certificate", "hostname doesn't match", or similar TLS error during connect.

**Cause**: Hostinger's shared FTPS presents `*.hstgr.io`, which doesn't match your domain or IP.

**Fix**: add `security: loose` to the FTP-Deploy-Action config. Already in the §5 template.

### 6.4 Job timeout mid-upload

**Symptom**: deploy gets killed at the 15-minute mark while still uploading, somewhere deep in your file tree.

**Cause**: first deploy is a full sequential upload of every file. Hostinger shared FTPS isn't fast (~1–2 files/sec under load), and a few thousand files take >15 min.

**Fix**: `timeout-minutes: 30` at the job level. Subsequent deploys leverage the state file and complete in <2 min — the 30-min ceiling is just first-deploy headroom.

> **Tip**: if even 30 min isn't enough on a huge tree, bump to 45 or 60 — but first check whether your build is shipping things it shouldn't (vendor dirs, node_modules, source maps, raw photo masters). Most "huge trees" are actually misconfigured excludes.

### 6.5 Authentication failed

**Symptom**: `530 Login authentication failed` or similar.

**Cause**: password in GH Secret doesn't match the FTP account, or the FTP account got locked / deleted.

**Fix**: hPanel → FTP Accounts → reset the password for the `githubdeploy` user → update `HOSTINGER_FTP_PASSWORD` in GitHub Secrets. Re-run the workflow.

### 6.6 Permission denied writing files

**Symptom**: FTP responds with `550 Permission denied` on upload.

**Cause**: rare — usually the FTP account's scoped directory is set to a path it can't actually write to (e.g. typo in the path, or directory doesn't exist).

**Fix**: hPanel → FTP Accounts → edit → confirm Directory is exactly `/home/u#######/domains/<your-domain>/public_html` and that path exists in **File Manager**.

### 6.7 Build succeeds locally but fails in CI

**Symptom**: works on your Mac, fails on `ubuntu-latest`.

**Causes & fixes**:
- Case-sensitive filesystem on Linux vs case-insensitive on macOS → fix filename casing.
- Missing executable bit on shell scripts → `git update-index --chmod=+x tools/<script>.sh`.
- Missing system dep → see 6.1.
- Different node/python version → pin via `setup-node` / `setup-python` action.

---

## 7. Operator workflow (after setup is done)

### Normal release cycle

1. Make changes, commit, `git push origin main`.
2. Open the **Actions** tab. Wait ~2 min (after first deploy).
3. ✓ green → site is live. ✗ red → click into the run, read the failing step's log.

### Manual deploy (no code changes)

Actions tab → **Deploy to Hostinger** workflow → **Run workflow** dropdown → **Run workflow** button.

Useful when:
- The deploy state file got corrupted and you want to redeploy from a known commit.
- You want to roll back: `git revert <bad-commit>`, push, deploy runs automatically. Or `git reset --hard <good-commit>` + force-push (only if you know what you're doing; force-push to `main` is a careful operation).

### Pause auto-deploy temporarily

Two options:
- **Quick**: Actions tab → workflow → ⋯ menu → **Disable workflow**. Re-enable the same way.
- **Code-level**: comment out the `branches: [main]` line under `on.push`. Only the manual button works while it's commented out.

### Trigger a deploy without changing site code

Push a no-op commit excluded from your `paths-ignore` list:

```bash
git commit --allow-empty -m "trigger deploy"
git push origin main
```

Or use the manual workflow_dispatch button (cleaner — no commit noise).

---

## 8. Customising for a new repo

What changes per repo, what stays:

| Element | Changes? | Notes |
|---------|----------|-------|
| Workflow YAML structure | No | Copy the §5 template as-is |
| `branches: [main]` | Maybe | Change if your default branch is `master` / `production` / etc. |
| `paths-ignore` | Yes | Adjust to your repo's docs/internal-only paths |
| Build step | **Yes** | Replace with your repo's build command and output dir |
| Audit step | Yes | Keep, replace, or delete |
| `local-dir` | **Yes** | Path to your build output. **Must end with `/`** |
| `server-dir: ./` | No | Keep — the scoped FTP account is rooted at `public_html` |
| `security: loose` | No | Always required for Hostinger shared |
| `state-name` | No | Keep this filename for consistency across repos |
| GH Secrets (3 of them) | **Yes** | One set per repo — they're repo-scoped, not org-scoped |
| FTP account in hPanel | **Yes** | One per site — never share a CI FTP account across repos |

---

## 9. Quick checklist for a new repo (copy-paste)

```
[ ] hPanel: created dedicated `githubdeploy` FTP account scoped to public_html
[ ] hPanel: saved username (u#######.githubdeploy) and password in password manager
[ ] Terminal: ran `dig +short <domain>` to get raw IP
[ ] GitHub Secrets: added HOSTINGER_FTP_SERVER (raw IP)
[ ] GitHub Secrets: added HOSTINGER_FTP_USERNAME
[ ] GitHub Secrets: added HOSTINGER_FTP_PASSWORD
[ ] Repo: added .github/workflows/deploy.yml (from §5 template)
[ ] Repo: customised build step and local-dir for this project
[ ] Repo: verified output dir actually gets produced locally first
[ ] Repo: pushed → Actions tab shows green ✓
[ ] Browser: curl -sI https://<domain>/ returns 200
[ ] Browser: spot-checked a changed page — new content is live
```

---

## 10. Upgrade path: SSH/SFTP

When you outgrow FTPS (Hostinger Business plan or higher), switch to SSH-based deploy. Benefits: faster (parallel transfers via rsync), more reliable, real auth via deploy key not password, and the connection doesn't depend on the FTPS cert quirks.

High-level sketch (full rewrite out of scope for this playbook):

1. hPanel → SSH Access → enable SSH and note host/port/username.
2. Generate a CI-only ED25519 keypair: `ssh-keygen -t ed25519 -f ./hostinger-deploy -C "github-actions-deploy"`.
3. Add the **public** key to Hostinger's `~/.ssh/authorized_keys` via SSH or File Manager.
4. Add the **private** key as a GitHub Secret (e.g. `HOSTINGER_SSH_KEY`).
5. Replace the FTP-Deploy-Action step with a rsync-over-SSH step (e.g. `easingthemes/ssh-deploy@v5` or a hand-written `rsync -avz --delete -e "ssh -i ..." ./dist/ user@host:/path/`).

You can keep the FTPS workflow as a fallback (rename to `deploy-ftps.yml`, set its trigger to `workflow_dispatch` only) in case SSH ever has an outage.

---

## 11. Things that look like fixes but are wrong

- ❌ **Adding `--no-verify-cert` to a custom FTP step.** Use `security: loose` on the FTP-Deploy-Action instead — it's the same idea but built-in and audited.
- ❌ **Sticking with `ftp.<your-domain>` as the server because hPanel shows it.** It's a UI label, often NXDOMAIN. Always verify with `dig`.
- ❌ **Disabling audits to make the deploy pass.** If audits fail, fix the audit failure — the audit exists to catch the kind of broken commit that shouldn't ship. Bypassing turns CI into a rubber stamp.
- ❌ **Using `--force` / `clear-state: true` after every failure.** Forces a full re-upload every time, defeating the diff-only optimisation. Only do this once if the state file is corrupted, then go back to default.
- ❌ **Storing the FTP password in the workflow file.** Even private repos leak through forks, screenshots, and pair-programming sessions. Always via GitHub Secrets.
- ❌ **Using your personal site-wide FTP account for CI.** A leaked CI password should only blast-radius one site, not your whole hosting account.

---

## 12. Why this playbook exists

The first AmbiSecure deploy took three failed attempts (xmllint missing → DNS NXDOMAIN → TLS cert mismatch → first-deploy timeout) before producing a green run. Each failure mode was googleable, but the combination — Hostinger + GitHub Actions + FTPS + sequential debugging — wasted hours that didn't need to be wasted. This file is the post-mortem turned into a runbook so the second, third, and fourth repos take ~20 minutes total instead of an afternoon each.
