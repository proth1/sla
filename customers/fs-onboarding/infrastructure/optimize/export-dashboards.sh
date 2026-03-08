#!/usr/bin/env bash
# export-dashboards.sh — Export all dashboards and reports from an Optimize collection
#
# Usage:
#   export ZEEBE_CLIENT_ID=... ZEEBE_CLIENT_SECRET=...
#   bash export-dashboards.sh [COLLECTION_ID]
#
# Exports dashboard and report definitions to definitions/ directory for version control.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEFINITIONS_DIR="${SCRIPT_DIR}/definitions"

# Authenticate
source "${SCRIPT_DIR}/optimize-auth.sh"

COLLECTION_ID="${1:-}"

mkdir -p "${DEFINITIONS_DIR}"

# --- Export Reports ---
echo ""
echo "=== Listing Reports ==="

if [[ -n "${COLLECTION_ID}" ]]; then
    REPORTS_RESPONSE=$(curl --silent --fail-with-body \
        --header "Authorization: Bearer ${OPTIMIZE_TOKEN}" \
        --header "Accept: application/json" \
        -G --data-urlencode "collectionId=${COLLECTION_ID}" \
        "${OPTIMIZE_BASE_URL}/api/public/report")
else
    echo "No collection ID provided. Listing all accessible reports..." >&2
    REPORTS_RESPONSE="[]"
fi

REPORT_IDS=$(echo "${REPORTS_RESPONSE}" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for item in data:
    print(item['id'])
" 2>/dev/null || true)

REPORT_COUNT=$(echo "${REPORT_IDS}" | grep -c . 2>/dev/null || echo "0")
echo "Found ${REPORT_COUNT} reports"

if [[ "${REPORT_COUNT}" -gt 0 ]]; then
    # Build JSON array of report IDs
    REPORT_IDS_JSON=$(echo "${REPORT_IDS}" | python3 -c "
import sys, json
ids = [line.strip() for line in sys.stdin if line.strip()]
print(json.dumps(ids))
")

    echo "Exporting report definitions..."
    curl --silent --fail-with-body \
        --request POST \
        --header "Authorization: Bearer ${OPTIMIZE_TOKEN}" \
        --header "Content-Type: application/json" \
        --header "Accept: application/json" \
        --data "${REPORT_IDS_JSON}" \
        "${OPTIMIZE_BASE_URL}/api/public/export/report/definition/json" \
        | python3 -m json.tool > "${DEFINITIONS_DIR}/reports.json"

    echo "  -> Saved to definitions/reports.json"
fi

# --- Export Dashboards ---
echo ""
echo "=== Listing Dashboards ==="

if [[ -n "${COLLECTION_ID}" ]]; then
    DASHBOARDS_RESPONSE=$(curl --silent --fail-with-body \
        --header "Authorization: Bearer ${OPTIMIZE_TOKEN}" \
        --header "Accept: application/json" \
        -G --data-urlencode "collectionId=${COLLECTION_ID}" \
        "${OPTIMIZE_BASE_URL}/api/public/dashboard")
else
    echo "No collection ID provided." >&2
    DASHBOARDS_RESPONSE="[]"
fi

DASHBOARD_IDS=$(echo "${DASHBOARDS_RESPONSE}" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for item in data:
    print(item['id'])
" 2>/dev/null || true)

DASHBOARD_COUNT=$(echo "${DASHBOARD_IDS}" | grep -c . 2>/dev/null || echo "0")
echo "Found ${DASHBOARD_COUNT} dashboards"

if [[ "${DASHBOARD_COUNT}" -gt 0 ]]; then
    DASHBOARD_IDS_JSON=$(echo "${DASHBOARD_IDS}" | python3 -c "
import sys, json
ids = [line.strip() for line in sys.stdin if line.strip()]
print(json.dumps(ids))
")

    echo "Exporting dashboard definitions..."
    curl --silent --fail-with-body \
        --request POST \
        --header "Authorization: Bearer ${OPTIMIZE_TOKEN}" \
        --header "Content-Type: application/json" \
        --header "Accept: application/json" \
        --data "${DASHBOARD_IDS_JSON}" \
        "${OPTIMIZE_BASE_URL}/api/public/export/dashboard/definition/json" \
        | python3 -m json.tool > "${DEFINITIONS_DIR}/dashboards.json"

    echo "  -> Saved to definitions/dashboards.json"
fi

echo ""
echo "=== Export Complete ==="
echo "Definitions saved to: ${DEFINITIONS_DIR}/"
ls -la "${DEFINITIONS_DIR}/"
