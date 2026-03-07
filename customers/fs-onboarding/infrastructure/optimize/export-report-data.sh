#!/usr/bin/env bash
# export-report-data.sh — Export report result data from Optimize (paginated)
#
# Usage:
#   export ZEEBE_CLIENT_ID=... ZEEBE_CLIENT_SECRET=...
#   bash export-report-data.sh <REPORT_ID> [OUTPUT_FILE] [LIMIT]
#
# Exports raw report data with automatic pagination.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPORT_ID="${1:?Usage: export-report-data.sh <REPORT_ID> [OUTPUT_FILE] [LIMIT]}"
OUTPUT_FILE="${2:-${SCRIPT_DIR}/data/report-${REPORT_ID}.json}"
LIMIT="${3:-100}"
PAGINATION_TIMEOUT=120

# Authenticate
source "${SCRIPT_DIR}/optimize-auth.sh"

mkdir -p "$(dirname "${OUTPUT_FILE}")"

echo ""
echo "=== Exporting Report ${REPORT_ID} ==="

# First page
RESPONSE=$(curl --silent --fail-with-body \
    --header "Authorization: Bearer ${OPTIMIZE_TOKEN}" \
    --header "Accept: application/json" \
    "${OPTIMIZE_BASE_URL}/api/public/export/report/${REPORT_ID}/result/json?limit=${LIMIT}&paginationTimeout=${PAGINATION_TIMEOUT}")

TOTAL=$(echo "${RESPONSE}" | python3 -c "import sys, json; print(json.load(sys.stdin).get('totalNumberOfRecords', 0))")
SEARCH_ID=$(echo "${RESPONSE}" | python3 -c "import sys, json; print(json.load(sys.stdin).get('searchRequestId', ''))")
IN_RESPONSE=$(echo "${RESPONSE}" | python3 -c "import sys, json; print(json.load(sys.stdin).get('numberOfRecordsInResponse', 0))")

echo "Total records: ${TOTAL}"
echo "First page: ${IN_RESPONSE} records"

# Collect all data
ALL_DATA=$(echo "${RESPONSE}" | python3 -c "import sys, json; print(json.dumps(json.load(sys.stdin).get('data', [])))")
COLLECTED="${IN_RESPONSE}"

# Paginate
while [[ "${COLLECTED}" -lt "${TOTAL}" && -n "${SEARCH_ID}" ]]; do
    echo "Fetching page (${COLLECTED}/${TOTAL})..."

    RESPONSE=$(curl --silent --fail-with-body \
        --header "Authorization: Bearer ${OPTIMIZE_TOKEN}" \
        --header "Accept: application/json" \
        "${OPTIMIZE_BASE_URL}/api/public/export/report/${REPORT_ID}/result/json?limit=${LIMIT}&paginationTimeout=${PAGINATION_TIMEOUT}&searchRequestId=${SEARCH_ID}")

    PAGE_COUNT=$(echo "${RESPONSE}" | python3 -c "import sys, json; print(json.load(sys.stdin).get('numberOfRecordsInResponse', 0))")
    SEARCH_ID=$(echo "${RESPONSE}" | python3 -c "import sys, json; print(json.load(sys.stdin).get('searchRequestId', ''))")

    PAGE_DATA=$(echo "${RESPONSE}" | python3 -c "import sys, json; print(json.dumps(json.load(sys.stdin).get('data', [])))")

    # Merge arrays
    ALL_DATA=$(python3 -c "
import json, sys
existing = json.loads('${ALL_DATA}')
new = json.loads(sys.stdin.read())
existing.extend(new)
print(json.dumps(existing))
" <<< "${PAGE_DATA}")

    COLLECTED=$((COLLECTED + PAGE_COUNT))

    if [[ "${PAGE_COUNT}" -eq 0 ]]; then
        break
    fi
done

echo "${ALL_DATA}" | python3 -m json.tool > "${OUTPUT_FILE}"

echo ""
echo "=== Export Complete ==="
echo "Exported ${COLLECTED} records to ${OUTPUT_FILE}"
