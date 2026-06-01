#!/usr/bin/env bash
# Run every Phase 12 audit in one go. Mirror of the CI workflow.
# Exit 0 = everything clean; exit 1 = at least one audit failed.

set -uo pipefail
cd "$(dirname "$0")/.."

fail=0
run() {
    local name=$1; shift
    echo
    echo "===== $name ====="
    if ! "$@"; then
        echo "FAIL: $name"
        fail=1
    fi
}

run "xmllint sitemap"   xmllint --noout sitemap.xml
run "lint-htaccess"     python3 tools/lint-htaccess.py
run "audit-content"     python3 tools/audit-content.py
run "audit-seo"         python3 tools/audit-seo.py
run "audit-media"       python3 tools/audit-media.py
run "audit-freshness"   python3 tools/audit-freshness.py --strict
run "audit-yoast"       python3 tools/audit-yoast.py --strict
run "audit-circular"    python3 tools/audit-circular-links.py --hard-only
run "audit-spam-seo"    python3 tools/audit-spam-seo.py
run "audit-search"      python3 tools/audit-search.py

echo
if [ "$fail" -eq 0 ]; then
    echo "ALL AUDITS PASSED"
else
    echo "ONE OR MORE AUDITS FAILED — see above"
fi
exit "$fail"
