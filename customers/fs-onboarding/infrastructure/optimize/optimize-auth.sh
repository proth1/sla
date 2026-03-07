#!/usr/bin/env bash
# optimize-auth.sh — Obtain a Bearer token for Camunda Optimize API (SaaS)
#
# Usage:
#   source optimize-auth.sh
#   # Sets OPTIMIZE_TOKEN, OPTIMIZE_BASE_URL environment variables
#
# Required environment variables:
#   ZEEBE_CLIENT_ID     — API client ID (from Camunda Console)
#   ZEEBE_CLIENT_SECRET — API client secret
#
# Optional:
#   CAMUNDA_CLUSTER_ID  — Override cluster ID (default: 425f10fa-c898-4b4b-b303-eac095286716)
#   CAMUNDA_REGION      — Override region (default: ric-1)
set -euo pipefail

CAMUNDA_CLUSTER_ID="${CAMUNDA_CLUSTER_ID:-425f10fa-c898-4b4b-b303-eac095286716}"
CAMUNDA_REGION="${CAMUNDA_REGION:-ric-1}"
OPTIMIZE_BASE_URL="https://${CAMUNDA_REGION}.optimize.camunda.io/${CAMUNDA_CLUSTER_ID}"
AUTH_SERVER_URL="https://login.cloud.camunda.io/oauth/token"

if [[ -z "${ZEEBE_CLIENT_ID:-}" || -z "${ZEEBE_CLIENT_SECRET:-}" ]]; then
    echo "ERROR: ZEEBE_CLIENT_ID and ZEEBE_CLIENT_SECRET must be set." >&2
    echo "" >&2
    echo "To create API credentials:" >&2
    echo "  1. Go to Camunda Console > Organization > API > Create new credentials" >&2
    echo "  2. Grant 'Optimize' scope" >&2
    echo "  3. Export ZEEBE_CLIENT_ID and ZEEBE_CLIENT_SECRET" >&2
    return 1 2>/dev/null || exit 1
fi

echo "Requesting Optimize API token..." >&2

TOKEN_RESPONSE=$(curl --silent --request POST "${AUTH_SERVER_URL}" \
    --header 'Content-Type: application/x-www-form-urlencoded' \
    --data-urlencode 'grant_type=client_credentials' \
    --data-urlencode 'audience=optimize.camunda.io' \
    --data-urlencode "client_id=${ZEEBE_CLIENT_ID}" \
    --data-urlencode "client_secret=${ZEEBE_CLIENT_SECRET}")

OPTIMIZE_TOKEN=$(echo "${TOKEN_RESPONSE}" | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null)

if [[ -z "${OPTIMIZE_TOKEN}" ]]; then
    echo "ERROR: Failed to obtain Optimize token." >&2
    echo "Response: ${TOKEN_RESPONSE}" >&2
    return 1 2>/dev/null || exit 1
fi

EXPIRES_IN=$(echo "${TOKEN_RESPONSE}" | python3 -c "import sys, json; print(json.load(sys.stdin).get('expires_in', 300))" 2>/dev/null)

export OPTIMIZE_TOKEN
export OPTIMIZE_BASE_URL

echo "Optimize token obtained (expires in ${EXPIRES_IN}s)" >&2
echo "Base URL: ${OPTIMIZE_BASE_URL}" >&2
