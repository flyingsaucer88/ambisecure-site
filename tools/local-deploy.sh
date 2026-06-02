#!/usr/bin/env bash
###############################################################################
# tools/local-deploy.sh — local emulation of the GitHub Actions deploy flow.
#
# Builds the exact production artifact that CI would build and ships, runs the
# same audit gate CI runs, writes an auditable manifest, and verifies the
# artifact. It does NOT upload by default.
#
#   bash tools/local-deploy.sh             # build + audit + package + verify
#   bash tools/local-deploy.sh --upload    # ...then run the explicit uploader
#   bash tools/local-deploy.sh --help
#
# Mirrors .github/workflows/deploy.yml:
#   build-hostinger-package.sh  ->  audit-all.sh (hard gate)  ->  FTPS upload
# plus the sitemap URL-count sanity check from .github/workflows/lighthouse.yml.
#
# Upload is intentionally a separate, explicit, credential-gated step
# (tools/upload-hostinger.sh). The default run never touches production.
###############################################################################
set -euo pipefail

SCRIPT_VERSION="1.0.0"
cd "$(dirname "$0")/.."
REPO="$(pwd)"
OUT="${REPO}/dist/ambisecure-hostinger"
ZIP="${REPO}/dist/ambisecure-hostinger.zip"
MANIFEST="${REPO}/dist/DEPLOY_MANIFEST.json"
AUDIT_LOG="${REPO}/dist/.audit-output.log"

DO_UPLOAD=0
for arg in "$@"; do
    case "$arg" in
        --upload) DO_UPLOAD=1 ;;
        -h|--help)
            sed -n '3,18p' "$0" | sed 's/^# \{0,1\}//'
            exit 0 ;;
        *) echo "Unknown argument: $arg" >&2; exit 2 ;;
    esac
done

# ----- pretty stage headers -------------------------------------------------
stage() { printf '\n\033[1;36m==> %s\033[0m\n' "$*"; }
ok()    { printf '   \033[32m✓\033[0m %s\n' "$*"; }
warn()  { printf '   \033[33m!\033[0m %s\n' "$*"; }
die()   { printf '\n\033[31mFAILED:\033[0m %s\n' "$*" >&2; exit 1; }

# ----- 1. git state ---------------------------------------------------------
stage "1/6  Git state"
BRANCH="$(git rev-parse --abbrev-ref HEAD)"
COMMIT="$(git rev-parse HEAD)"
COMMIT_SHORT="$(git rev-parse --short HEAD)"
if [[ -n "$(git status --porcelain)" ]]; then
    TREE_STATE="dirty"
    warn "Working tree is DIRTY — uncommitted changes are included in the build."
else
    TREE_STATE="clean"
    ok "Working tree clean."
fi
echo "   branch:  ${BRANCH}"
echo "   commit:  ${COMMIT_SHORT} (${COMMIT})"
echo "   tree:    ${TREE_STATE}"

# ----- 2. audit gate (mirror of audit-all.sh in CI) -------------------------
stage "2/6  Audits (hard gate — same suite CI runs)"
mkdir -p "${REPO}/dist"
AUDIT_RESULT="pass"
AUDIT_FAILURES=""
if bash tools/audit-all.sh 2>&1 | tee "${AUDIT_LOG}"; then
    ok "audit-all.sh: ALL AUDITS PASSED"
else
    AUDIT_RESULT="fail"
    AUDIT_FAILURES="$(grep -E '^FAIL: ' "${AUDIT_LOG}" | sed 's/^FAIL: //' | paste -sd ',' - || true)"
    die "audit-all.sh reported failures (${AUDIT_FAILURES:-see log}). Fix them before deploying."
fi

# sitemap URL-count sanity (mirrors lighthouse.yml 'sitemap-validate' job)
SITEMAP_URLS="$(grep -c '<loc>' sitemap.xml || echo 0)"
if [[ "${SITEMAP_URLS}" -ge 200 ]]; then
    ok "sitemap.xml URL count: ${SITEMAP_URLS} (>= 200)"
else
    die "sitemap.xml has only ${SITEMAP_URLS} URLs (< 200 sanity floor)."
fi

# ----- 3. build the deployable tree + zip (build-hostinger-package.sh) ------
stage "3/6  Build production package"
bash tools/build-hostinger-package.sh >/dev/null
[[ -d "${OUT}" ]] || die "build did not produce ${OUT}"
[[ -f "${ZIP}" ]] || die "build did not produce ${ZIP}"
FILE_COUNT="$(find "${OUT}" -type f | wc -l | tr -d ' ')"
ZIP_BYTES="$(wc -c < "${ZIP}" | tr -d ' ')"
ZIP_HUMAN="$(du -h "${ZIP}" | cut -f1)"
ok "Built ${OUT} (${FILE_COUNT} files)"
ok "Zipped ${ZIP} (${ZIP_HUMAN})"

# ----- 4. verify the artifact -----------------------------------------------
stage "4/6  Verify artifact"
ZIP_NAMES="$(unzip -Z1 "${ZIP}")"

# 4a. required production files present in the zip
REQUIRED=(index.html sitemap.xml robots.txt .htaccess 404.html)
for f in "${REQUIRED[@]}"; do
    if grep -qxF "${f}" <<<"${ZIP_NAMES}"; then
        ok "present: ${f}"
    else
        die "required file missing from artifact: ${f}"
    fi
done

# 4b. forbidden repo internals must NOT be in the zip.
#     Anchored to top-level dirs so resources/tools/ (a real shipped surface)
#     is not mistaken for the source tools/ directory.
FORBIDDEN_RE='^(\.git/|\.github/|\.githooks/|\.claude/|\.lighthouseci/|node_modules/|tools/|scripts/|docs/|legacysitedata/|_internal/|Logos/|\.deploy\.env|deploy\.example\.env|Makefile|package(-lock)?\.json|\.lighthouserc\.json)|(^|/)(__pycache__/|\.DS_Store$|[^/]*\.pyc$|[^/]*\.swp$)'
if BAD="$(grep -E "${FORBIDDEN_RE}" <<<"${ZIP_NAMES}" || true)"; [[ -n "${BAD}" ]]; then
    echo "${BAD}" | sed 's/^/      offending: /'
    die "artifact contains forbidden repo internals (see above)."
fi
ok "no repo internals (.git, .github, tools/, docs/, node_modules, caches, …) in artifact"

# ----- 5. write manifest (beside the zip, NOT shipped to production) --------
stage "5/6  Write manifest"
TIMESTAMP="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
cat > "${MANIFEST}" <<JSON
{
  "artifact": "dist/ambisecure-hostinger.zip",
  "artifact_dir": "dist/ambisecure-hostinger",
  "built_at_utc": "${TIMESTAMP}",
  "script_version": "${SCRIPT_VERSION}",
  "git": {
    "branch": "${BRANCH}",
    "commit": "${COMMIT}",
    "commit_short": "${COMMIT_SHORT}",
    "working_tree": "${TREE_STATE}"
  },
  "files": ${FILE_COUNT},
  "zip_bytes": ${ZIP_BYTES},
  "sitemap_url_count": ${SITEMAP_URLS},
  "audits": {
    "suite": "tools/audit-all.sh",
    "result": "${AUDIT_RESULT}",
    "failures": "${AUDIT_FAILURES}"
  },
  "verified": {
    "required_files_present": true,
    "no_repo_internals": true
  }
}
JSON
ok "Manifest: ${MANIFEST}"
cat "${MANIFEST}" | sed 's/^/   /'

# ----- 6. done / optional upload --------------------------------------------
stage "6/6  Summary"
echo "   Artifact (zip):    ${ZIP}  (${ZIP_HUMAN})"
echo "   Artifact (folder): ${OUT}/  (${FILE_COUNT} files)"
echo "   Manifest:          ${MANIFEST}"
echo "   Branch / commit:   ${BRANCH} @ ${COMMIT_SHORT} (${TREE_STATE})"
echo

if [[ "${DO_UPLOAD}" -eq 1 ]]; then
    warn "Build complete. Handing off to the explicit uploader…"
    exec bash tools/upload-hostinger.sh "${OUT}"
else
    ok "BUILD ONLY — production was NOT touched."
    echo
    echo "   Next steps:"
    echo "     • Manual (hPanel):  upload ${ZIP##*/} via File Manager, extract inside public_html"
    echo "     • Scripted upload:  bash tools/upload-hostinger.sh            (needs .deploy.env)"
    echo "     • Dry-run upload:   bash tools/upload-hostinger.sh --dry-run"
fi
