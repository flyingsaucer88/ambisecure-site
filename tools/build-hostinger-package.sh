#!/usr/bin/env bash
# Build dist/ambisecure-hostinger/ — the exact tree that should land in
# Hostinger public_html. Also produces dist/ambisecure-hostinger.zip.
#
# Usage:
#   bash tools/build-hostinger-package.sh
#
# The zip is gitignored. The dist/ folder is gitignored.
set -euo pipefail

cd "$(dirname "$0")/.."
REPO="$(pwd)"
OUT="${REPO}/dist/ambisecure-hostinger"
ZIP="${REPO}/dist/ambisecure-hostinger.zip"

echo "Building Hostinger package at ${OUT}"

# Clean slate.
rm -rf "${OUT}" "${ZIP}"
mkdir -p "${OUT}"

# rsync everything except source/repo/dev files. Trailing slash on src
# means "copy contents of repo into OUT", not "copy repo dir itself".
# Anchor source-only excludes to the root with a leading slash so
# `/tools/` does NOT also match `/resources/tools/` (which IS the
# public utility-tool surface and must ship).
rsync -a \
  --exclude='/.git/' \
  --exclude='/.github/' \
  --exclude='/.githooks/' \
  --exclude='/.lighthouseci/' \
  --exclude='/.claude/' \
  --exclude='/.gitignore' \
  --exclude='/.gitattributes' \
  --exclude='/docs/' \
  --exclude='/tools/' \
  --exclude='/scripts/' \
  --exclude='/legacysitedata/' \
  --exclude='/node_modules/' \
  --exclude='/dist/' \
  --exclude='/.lighthouserc.json' \
  --exclude='/package.json' \
  --exclude='/package-lock.json' \
  --exclude='.DS_Store' \
  --exclude='*.swp' \
  --exclude='*.pyc' \
  --exclude='__pycache__/' \
  --exclude='/README.md' \
  "${REPO}/" "${OUT}/"

# Drop the deployment README in beside index.html so the operator sees it
# without having to dig into a sub-directory.
cp "${REPO}/tools/hostinger-deployment-readme.txt" "${OUT}/DEPLOYMENT_README.txt"

# Sanity counts.
echo
echo "Package contents:"
printf "  HTML pages:   %s\n" "$(find "${OUT}" -name '*.html' | wc -l | tr -d ' ')"
printf "  JS files:     %s\n" "$(find "${OUT}/assets/js" -name '*.js' 2>/dev/null | wc -l | tr -d ' ')"
printf "  CSS files:    %s\n" "$(find "${OUT}/assets/css" -name '*.css' 2>/dev/null | wc -l | tr -d ' ')"
printf "  Images:       %s\n" "$(find "${OUT}/assets/img" -type f 2>/dev/null | wc -l | tr -d ' ')"
printf "  Fonts:        %s\n" "$(find "${OUT}/assets/fonts" -type f 2>/dev/null | wc -l | tr -d ' ')"
printf "  Videos:       %s\n" "$(find "${OUT}/assets/video" -type f 2>/dev/null | wc -l | tr -d ' ')"
printf "  Total size:   %s\n" "$(du -sh "${OUT}" | cut -f1)"

# Required files at the root.
echo
echo "Required-file check:"
for f in index.html 404.html sitemap.xml robots.txt .htaccess; do
    if [[ -f "${OUT}/${f}" ]]; then
        printf "  ✓ %s\n" "${f}"
    else
        printf "  ✗ MISSING: %s\n" "${f}"
        exit 1
    fi
done

# Build the zip from inside the package so the archive does NOT include
# the wrapping ambisecure-hostinger/ directory. Hostinger users can then
# extract directly into public_html.
echo
echo "Creating ${ZIP}"
( cd "${OUT}" && zip -rq "${ZIP}" . -x ".DS_Store" "*.DS_Store" )

printf "  Zip size:     %s\n" "$(du -sh "${ZIP}" | cut -f1)"
printf "  Zip entries:  %s\n" "$(unzip -l "${ZIP}" | tail -1 | awk '{print $2}')"

echo
echo "Done. Upload ${ZIP} to Hostinger File Manager and extract inside public_html."
