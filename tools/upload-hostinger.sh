#!/usr/bin/env bash
###############################################################################
# tools/upload-hostinger.sh — explicit, credential-gated upload to Hostinger.
#
# This is the ONLY script that touches production. It is never run by default;
# tools/local-deploy.sh only invokes it when you pass --upload, and even then
# it asks for confirmation.
#
#   bash tools/upload-hostinger.sh                 # upload dist/ambisecure-hostinger/
#   bash tools/upload-hostinger.sh --dry-run       # show what WOULD change, upload nothing
#   bash tools/upload-hostinger.sh --yes           # skip the interactive confirmation
#   bash tools/upload-hostinger.sh <dir>           # upload a specific built directory
#
# Credentials come from .deploy.env (gitignored). Copy deploy.example.env to
# .deploy.env and fill it in. The script refuses to run without it.
#
# Safety:
#   • Additive/overwrite ONLY by default — remote files are never deleted.
#   • Delete/sync mode requires BOTH DEPLOY_ALLOW_DELETE=true and --delete.
#   • Mirrors the unzipped build directory (not the zip) so paths land 1:1.
###############################################################################
set -euo pipefail

cd "$(dirname "$0")/.."
REPO="$(pwd)"
ENV_FILE="${REPO}/.deploy.env"
DEFAULT_DIR="${REPO}/dist/ambisecure-hostinger"

DRY_RUN=0
ASSUME_YES=0
WANT_DELETE=0
LOCAL_DIR=""
for arg in "$@"; do
    case "$arg" in
        --dry-run) DRY_RUN=1 ;;
        --yes|-y)  ASSUME_YES=1 ;;
        --delete)  WANT_DELETE=1 ;;
        -h|--help) sed -n '3,21p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
        --*)       echo "Unknown flag: $arg" >&2; exit 2 ;;
        *)         LOCAL_DIR="$arg" ;;
    esac
done

die() { printf '\n\033[31mUPLOAD ABORTED:\033[0m %s\n' "$*" >&2; exit 1; }
ok()  { printf '   \033[32m✓\033[0m %s\n' "$*"; }

# ----- credentials ----------------------------------------------------------
[[ -f "${ENV_FILE}" ]] || die "missing ${ENV_FILE}. Copy deploy.example.env to .deploy.env and fill it in."
# shellcheck disable=SC1090
set -a; source "${ENV_FILE}"; set +a

: "${DEPLOY_PROTOCOL:=ftps}"
: "${DEPLOY_PORT:=}"
: "${DEPLOY_REMOTE_DIR:=./}"
: "${DEPLOY_FTPS_VERIFY:=false}"
: "${DEPLOY_ALLOW_DELETE:=false}"
: "${DEPLOY_SSH_KEY:=}"
[[ -z "${DEPLOY_PORT}" ]] && { [[ "${DEPLOY_PROTOCOL}" == "sftp" ]] && DEPLOY_PORT=65002 || DEPLOY_PORT=21; }

missing=()
for v in DEPLOY_HOST DEPLOY_USER; do [[ -n "${!v:-}" ]] || missing+=("$v"); done
# password required unless sftp + key auth
if [[ "${DEPLOY_PROTOCOL}" == "sftp" && -n "${DEPLOY_SSH_KEY}" ]]; then :; else
    [[ -n "${DEPLOY_PASS:-}" ]] || missing+=("DEPLOY_PASS")
fi
[[ ${#missing[@]} -eq 0 ]] || die "missing required vars in .deploy.env: ${missing[*]}"

# ----- engine ---------------------------------------------------------------
command -v lftp >/dev/null || die "lftp is required for scripted upload but is not installed.
   Install it:   brew install lftp        (macOS)
                 sudo apt-get install lftp (Debian/Ubuntu)
   Or upload manually: hPanel → File Manager → public_html → upload the zip → Extract.
   See docs/LOCAL_DEPLOYMENT.md."

# ----- resolve + verify local artifact --------------------------------------
LOCAL_DIR="${LOCAL_DIR:-${DEPLOY_LOCAL_DIR:-${DEFAULT_DIR}}}"
[[ -d "${LOCAL_DIR}" ]] || die "build directory not found: ${LOCAL_DIR}
   Run 'bash tools/local-deploy.sh' first to build the artifact."
[[ -f "${LOCAL_DIR}/index.html" ]] || die "${LOCAL_DIR} has no index.html — is it really the built site?"
if [[ ! -f "${REPO}/dist/DEPLOY_MANIFEST.json" ]]; then
    die "no dist/DEPLOY_MANIFEST.json — build via tools/local-deploy.sh so the upload is auditable."
fi

FILE_COUNT="$(find "${LOCAL_DIR}" -type f | wc -l | tr -d ' ')"
DIR_SIZE="$(du -sh "${LOCAL_DIR}" | cut -f1)"
BRANCH="$(git rev-parse --abbrev-ref HEAD)"
COMMIT_SHORT="$(git rev-parse --short HEAD)"
TREE_STATE="clean"; [[ -n "$(git status --porcelain)" ]] && TREE_STATE="dirty"

# ----- delete-mode gate -----------------------------------------------------
DELETE_FLAG=""
DELETE_NOTE="additive/overwrite only (remote files never deleted)"
if [[ "${WANT_DELETE}" -eq 1 ]]; then
    [[ "${DEPLOY_ALLOW_DELETE}" == "true" ]] || die "--delete requires DEPLOY_ALLOW_DELETE=true in .deploy.env (it is not). Refusing to delete remote files."
    DELETE_FLAG="--delete"
    DELETE_NOTE="SYNC/DELETE MODE — remote files absent locally WILL be removed"
fi

# ----- pre-upload summary + confirmation ------------------------------------
echo
echo "──────────────────────────────────────────────────────────────"
echo "  Hostinger upload — review before continuing"
echo "──────────────────────────────────────────────────────────────"
printf "  protocol/host : %s  ->  %s:%s\n" "${DEPLOY_PROTOCOL}" "${DEPLOY_HOST}" "${DEPLOY_PORT}"
printf "  remote dir    : %s\n" "${DEPLOY_REMOTE_DIR}"
printf "  local dir     : %s\n" "${LOCAL_DIR}"
printf "  files / size  : %s files, %s\n" "${FILE_COUNT}" "${DIR_SIZE}"
printf "  branch/commit : %s @ %s (%s)\n" "${BRANCH}" "${COMMIT_SHORT}" "${TREE_STATE}"
printf "  mode          : %s\n" "${DELETE_NOTE}"
printf "  dry-run       : %s\n" "$([[ ${DRY_RUN} -eq 1 ]] && echo yes || echo no)"
echo "──────────────────────────────────────────────────────────────"

if [[ "${DRY_RUN}" -eq 0 && "${ASSUME_YES}" -eq 0 ]]; then
    if [[ ! -t 0 && ! -e /dev/tty ]]; then
        die "not a TTY and --yes not given; refusing to upload non-interactively."
    fi
    printf "  Type 'yes' to upload to PRODUCTION: "
    read -r reply < /dev/tty
    [[ "${reply}" == "yes" ]] || die "confirmation not given (got '${reply}')."
fi

# ----- build the lftp program -----------------------------------------------
DRY_FLAG=""; [[ "${DRY_RUN}" -eq 1 ]] && DRY_FLAG="--dry-run --verbose"
MIRROR="mirror -R ${DRY_FLAG} ${DELETE_FLAG} --only-newer --no-perms --parallel=1 \
  --exclude-glob .DS_Store --exclude-glob .git* \
  \"${LOCAL_DIR}/\" \"${DEPLOY_REMOTE_DIR}\""

case "${DEPLOY_PROTOCOL}" in
  ftps)
    LFTP_PROG="set ftp:ssl-force true
set ftp:ssl-protect-data true
set ssl:verify-certificate ${DEPLOY_FTPS_VERIFY}
set net:timeout 60
set net:max-retries 2
set net:reconnect-interval-base 5
open -u \"${DEPLOY_USER}\",\"${DEPLOY_PASS}\" -p ${DEPLOY_PORT} ftp://${DEPLOY_HOST}
${MIRROR}
bye" ;;
  sftp)
    if [[ -n "${DEPLOY_SSH_KEY}" ]]; then
        CONNECT="set sftp:connect-program \"ssh -a -x -i ${DEPLOY_SSH_KEY} -p ${DEPLOY_PORT} -o StrictHostKeyChecking=accept-new\""
        OPEN="open -u \"${DEPLOY_USER}\" sftp://${DEPLOY_HOST}"
    else
        CONNECT="set sftp:connect-program \"ssh -a -x -p ${DEPLOY_PORT} -o StrictHostKeyChecking=accept-new\""
        OPEN="open -u \"${DEPLOY_USER}\",\"${DEPLOY_PASS}\" sftp://${DEPLOY_HOST}"
    fi
    LFTP_PROG="set net:timeout 60
set sftp:auto-confirm yes
${CONNECT}
${OPEN}
${MIRROR}
bye" ;;
  *) die "unsupported DEPLOY_PROTOCOL='${DEPLOY_PROTOCOL}' (use ftps or sftp)." ;;
esac

echo
[[ "${DRY_RUN}" -eq 1 ]] && echo "Running DRY-RUN (no files will be written)…" || echo "Uploading…"
# lftp reads the program from stdin, so the password never appears in argv/ps.
printf '%s\n' "${LFTP_PROG}" | lftp || die "lftp upload failed (see output above)."

echo
if [[ "${DRY_RUN}" -eq 1 ]]; then
    ok "Dry-run complete — nothing was uploaded."
else
    ok "Upload complete."
    echo "   Verify:  curl -sI https://ambisecure.ambimat.com/ | head -3"
fi
