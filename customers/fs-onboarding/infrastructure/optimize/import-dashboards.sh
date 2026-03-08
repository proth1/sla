#!/usr/bin/env bash
# import-dashboards.sh — Import dashboard and report definitions into an Optimize collection
#
# Usage:
#   export ZEEBE_CLIENT_ID=... ZEEBE_CLIENT_SECRET=...
#   bash import-dashboards.sh <COLLECTION_ID> [DEFINITIONS_DIR]
#
# Prerequisites:
#   - Target collection must exist in Optimize
#   - Process_Onboarding_v8 must be deployed and indexed
#   - Collection data sources must include the process definition
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COLLECTION_ID="${1:?Usage: import-dashboards.sh <COLLECTION_ID> [DEFINITIONS_DIR]}"
DEFINITIONS_DIR="${2:-${SCRIPT_DIR}/definitions}"

# Authenticate
source "${SCRIPT_DIR}/optimize-auth.sh"

if [[ ! -d "${DEFINITIONS_DIR}" ]]; then
    echo "ERROR: Definitions directory not found: ${DEFINITIONS_DIR}" >&2
    exit 1
fi

# Merge reports and dashboards into a single import payload
echo ""
echo "=== Preparing Import Payload ==="

IMPORT_PAYLOAD=$(python3 -c "
import json, os, sys

definitions_dir = '${DEFINITIONS_DIR}'
entities = []

# Load reports
reports_file = os.path.join(definitions_dir, 'reports.json')
if os.path.exists(reports_file):
    with open(reports_file) as f:
        reports = json.load(f)
        entities.extend(reports)
        print(f'Loaded {len(reports)} report definitions', file=sys.stderr)

# Load dashboards
dashboards_file = os.path.join(definitions_dir, 'dashboards.json')
if os.path.exists(dashboards_file):
    with open(dashboards_file) as f:
        dashboards = json.load(f)
        entities.extend(dashboards)
        print(f'Loaded {len(dashboards)} dashboard definitions', file=sys.stderr)

if not entities:
    print('ERROR: No entity definitions found to import', file=sys.stderr)
    sys.exit(1)

print(json.dumps(entities))
")

echo ""
echo "=== Importing into Collection ${COLLECTION_ID} ==="

RESPONSE=$(curl --silent --fail-with-body \
    --request POST \
    --header "Authorization: Bearer ${OPTIMIZE_TOKEN}" \
    --header "Content-Type: application/json" \
    --header "Accept: application/json" \
    --data "${IMPORT_PAYLOAD}" \
    "${OPTIMIZE_BASE_URL}/api/public/import?collectionId=${COLLECTION_ID}")

echo "Import response:"
echo "${RESPONSE}" | python3 -m json.tool

echo ""
echo "=== Import Complete ==="
