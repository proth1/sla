#!/usr/bin/env bash
# deploy-and-migrate.sh — Deploy BPMN/DMN/Forms to Camunda 8 and migrate running instances
#
# Usage:
#   bash scripts/deploy-and-migrate.sh <bpmn-file> [instance-key]
#
# Examples:
#   # Deploy only (no migration):
#   bash scripts/deploy-and-migrate.sh customers/fs-onboarding/processes/committee-voting-process.bpmn
#
#   # Deploy and migrate a specific instance:
#   bash scripts/deploy-and-migrate.sh customers/fs-onboarding/processes/committee-voting-process.bpmn 2251799814088265
#
# Environment:
#   ZEEBE_CLIENT_ID / ZEEBE_CLIENT_SECRET — OAuth client credentials (required if zbctl token expired)
#   CAMUNDA_CLUSTER_ID — defaults to 425f10fa-c898-4b4b-b303-eac095286716
#   CAMUNDA_REGION — defaults to ric-1

set -euo pipefail

CLUSTER_ID="${CAMUNDA_CLUSTER_ID:-425f10fa-c898-4b4b-b303-eac095286716}"
REGION="${CAMUNDA_REGION:-ric-1}"
BASE_URL="https://${REGION}.zeebe.camunda.io/${CLUSTER_ID}"
AUTH_URL="https://login.cloud.camunda.io/oauth/token"
CRED_FILE="$HOME/.camunda/credentials"

BPMN_FILE="${1:?Usage: deploy-and-migrate.sh <bpmn-file> [instance-key]}"
INSTANCE_KEY="${2:-}"

# --- Token Management ---
get_token() {
  # Try cached zbctl token first
  if [ -f "$CRED_FILE" ]; then
    local token expiry now
    token=$(awk '/accesstoken:/{print $2}' "$CRED_FILE")
    expiry=$(echo "$token" | cut -d. -f2 | base64 -d 2>/dev/null | python3 -c "import sys,json; print(json.load(sys.stdin).get('exp',0))" 2>/dev/null || echo 0)
    now=$(date +%s)
    if [ "$((expiry - now))" -gt 60 ]; then
      echo "$token"
      return
    fi
  fi

  # Try refreshing via zbctl
  if command -v zbctl &>/dev/null; then
    zbctl status --address "${REGION}.zeebe.camunda.io:443" 2>/dev/null || true
    if [ -f "$CRED_FILE" ]; then
      local token expiry now
      token=$(awk '/accesstoken:/{print $2}' "$CRED_FILE")
      expiry=$(echo "$token" | cut -d. -f2 | base64 -d 2>/dev/null | python3 -c "import sys,json; print(json.load(sys.stdin).get('exp',0))" 2>/dev/null || echo 0)
      now=$(date +%s)
      if [ "$((expiry - now))" -gt 60 ]; then
        echo "$token"
        return
      fi
    fi
  fi

  # Fall back to OAuth client credentials flow
  if [ -z "${ZEEBE_CLIENT_ID:-}" ] || [ -z "${ZEEBE_CLIENT_SECRET:-}" ]; then
    echo "ERROR: Token expired and no ZEEBE_CLIENT_ID/ZEEBE_CLIENT_SECRET set" >&2
    echo "Set these env vars or refresh zbctl: zbctl status --address ${REGION}.zeebe.camunda.io:443" >&2
    exit 1
  fi

  local response
  response=$(curl -s -X POST "$AUTH_URL" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "grant_type=client_credentials&client_id=${ZEEBE_CLIENT_ID}&client_secret=${ZEEBE_CLIENT_SECRET}&audience=zeebe.camunda.io")

  echo "$response" | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])"
}

# --- Deploy ---
echo "=== Deploying: $BPMN_FILE ==="
TOKEN=$(get_token)

DEPLOY_RESPONSE=$(curl -s -X POST "${BASE_URL}/v2/deployments" \
  -H "Authorization: Bearer $TOKEN" \
  -F "resources=@${BPMN_FILE}")

echo "$DEPLOY_RESPONSE" | python3 -c "
import sys, json
d = json.load(sys.stdin)
if 'deploymentKey' not in d:
    print('DEPLOY FAILED:', json.dumps(d, indent=2))
    sys.exit(1)
print('Deployment key:', d['deploymentKey'])
for item in d.get('deployments', []):
    if 'processDefinition' in item:
        pd = item['processDefinition']
        print(f'  Process: {pd[\"bpmnProcessId\"]} v{pd[\"version\"]} (key: {pd[\"processDefinitionKey\"]})')
    elif 'decisionRequirements' in item:
        dr = item['decisionRequirements']
        print(f'  Decision: {dr[\"dmnDecisionRequirementsId\"]} v{dr[\"version\"]}')
    elif 'form' in item:
        f = item['form']
        print(f'  Form: {f[\"formId\"]} v{f[\"version\"]}')
"

# Extract new process definition key
NEW_KEY=$(echo "$DEPLOY_RESPONSE" | python3 -c "
import sys, json
d = json.load(sys.stdin)
for item in d.get('deployments', []):
    if 'processDefinition' in item:
        print(item['processDefinition']['processDefinitionKey'])
        break
" 2>/dev/null)

# --- Migrate (if instance key provided) ---
if [ -n "$INSTANCE_KEY" ] && [ -n "$NEW_KEY" ]; then
  echo ""
  echo "=== Migrating instance $INSTANCE_KEY → process key $NEW_KEY ==="

  MIGRATE_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/v2/process-instances/${INSTANCE_KEY}/migration" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"targetProcessDefinitionKey\": \"${NEW_KEY}\", \"mappingInstructions\": []}")

  HTTP_CODE=$(echo "$MIGRATE_RESPONSE" | tail -1)
  BODY=$(echo "$MIGRATE_RESPONSE" | sed '$d')

  if [ "$HTTP_CODE" = "204" ] || [ "$HTTP_CODE" = "200" ]; then
    echo "Migration successful (HTTP $HTTP_CODE)"
  else
    echo "Migration failed (HTTP $HTTP_CODE): $BODY"
    exit 1
  fi
elif [ -n "$INSTANCE_KEY" ] && [ -z "$NEW_KEY" ]; then
  echo "WARNING: Could not extract new process definition key — skipping migration"
  exit 1
fi

echo ""
echo "=== Done ==="
