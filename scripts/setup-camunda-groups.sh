#!/usr/bin/env bash
# setup-camunda-groups.sh — Provision Camunda 8 groups + demo persona memberships
# Usage:
#   bash scripts/setup-camunda-groups.sh           # Create groups + assign members
#   bash scripts/setup-camunda-groups.sh --verify   # List groups + members
#   bash scripts/setup-camunda-groups.sh --teardown  # Delete all managed groups
set -euo pipefail

CLUSTER_ID="${CAMUNDA_CLUSTER_ID:-425f10fa-c898-4b4b-b303-eac095286716}"
REGION="${CAMUNDA_REGION:-ric-1}"
BASE_URL="https://${REGION}.zeebe.camunda.io/${CLUSTER_ID}/v2"

# --- Token Management (reuses zbctl credentials) ---
get_token() {
  local cred_file="$HOME/.camunda/credentials"
  if [[ ! -f "$cred_file" ]]; then
    echo "ERROR: No ~/.camunda/credentials — run 'zbctl status' first" >&2
    exit 1
  fi

  local token expiry now
  token=$(grep -o 'accesstoken: .*' "$cred_file" | head -1 | awk '{print $2}')
  expiry=$(grep -o 'expiry: .*' "$cred_file" | head -1 | awk '{print $2}')
  now=$(date +%s)

  # Check if token is expired (compare epoch seconds)
  if [[ -n "$expiry" ]]; then
    local exp_epoch
    exp_epoch=$(date -j -f "%Y-%m-%dT%H:%M:%S" "${expiry%%.*}" +%s 2>/dev/null || echo 0)
    if (( exp_epoch > 0 && exp_epoch < now + 60 )); then
      echo "Token expired — refreshing via zbctl..." >&2
      /opt/homebrew/bin/zbctl status --address "${REGION}.zeebe.camunda.io:443/${CLUSTER_ID}" 2>/dev/null || true
      token=$(grep -o 'accesstoken: .*' "$cred_file" | head -1 | awk '{print $2}')
    fi
  fi

  if [[ -z "$token" ]]; then
    echo "ERROR: No access token in credentials file" >&2
    exit 1
  fi
  echo "$token"
}

# --- API Helper ---
camunda_api() {
  local method="$1" path="$2" body="${3:-}"
  local token
  token=$(get_token)
  local url="${BASE_URL}${path}"

  local args=(-s -w "\n%{http_code}" -X "$method" -H "Authorization: Bearer $token" -H "Content-Type: application/json")
  if [[ -n "$body" ]]; then
    args+=(-d "$body")
  fi

  local response http_code
  response=$(curl "${args[@]}" "$url")
  http_code=$(echo "$response" | tail -1)
  response=$(echo "$response" | sed '$d')

  echo "$http_code|$response"
}

# --- Group Definitions ---
GROUPS=(
  "business-lane|Business Lane"
  "governance-lane|Governance Lane"
  "contracting-lane|Contracting Lane"
  "technical-assessment|Technical Assessment"
  "ai-review|AI Review"
  "compliance-lane|Compliance Lane"
  "oversight-lane|Oversight Lane"
  "automation-lane|Automation Lane"
  "vendor-response|Vendor Response"
  "procurement-lane|Procurement Lane"
  "finance-lane|Finance Lane"
)

# --- Demo Personas: id|groups (comma-separated) ---
PERSONAS=(
  "paulroth@kpmg.com|business-lane,governance-lane,contracting-lane,technical-assessment,ai-review,compliance-lane,oversight-lane,automation-lane,vendor-response,procurement-lane,finance-lane"
  "sarah.chen|business-lane"
  "jennifer.martinez|governance-lane,oversight-lane"
  "marcus.johnson|technical-assessment,ai-review"
  "lisa.park|compliance-lane"
  "david.kim|contracting-lane,procurement-lane,finance-lane"
  "ahmed.saleh|automation-lane"
  "vendor.demo|vendor-response"
)

# --- Create Groups (idempotent) ---
create_groups() {
  echo "=== Creating Camunda 8 Groups ==="
  local created=0 skipped=0

  for entry in "${GROUPS[@]}"; do
    local id name
    id="${entry%%|*}"
    name="${entry#*|}"

    local result
    result=$(camunda_api POST "/groups" "{\"groupId\":\"$id\",\"name\":\"$name\"}")
    local code="${result%%|*}"

    if [[ "$code" == "201" ]]; then
      echo "  + Created: $id ($name)"
      ((created++))
    elif [[ "$code" == "409" ]]; then
      echo "  = Exists:  $id ($name)"
      ((skipped++))
    else
      echo "  ! Error $code creating $id: ${result#*|}"
    fi
  done
  echo "  Created: $created, Already existed: $skipped"
}

# --- Assign Personas to Groups ---
assign_personas() {
  echo ""
  echo "=== Assigning Demo Personas ==="
  local assigned=0

  for entry in "${PERSONAS[@]}"; do
    local username groups_csv
    username="${entry%%|*}"
    groups_csv="${entry#*|}"

    IFS=',' read -ra groups <<< "$groups_csv"
    for group in "${groups[@]}"; do
      local result
      result=$(camunda_api PUT "/groups/$group/users/$username" "")
      local code="${result%%|*}"

      if [[ "$code" == "204" || "$code" == "200" ]]; then
        ((assigned++))
      elif [[ "$code" == "409" || "$code" == "204" ]]; then
        : # already a member
      else
        echo "  ! Error $code adding $username to $group: ${result#*|}"
      fi
    done
    echo "  + $username -> ${groups_csv//,/, }"
  done
  echo "  Total assignments: $assigned"
}

# --- Verify Groups + Members ---
verify_groups() {
  echo "=== Verifying Camunda 8 Groups ==="
  for entry in "${GROUPS[@]}"; do
    local id name
    id="${entry%%|*}"
    name="${entry#*|}"

    local result
    result=$(camunda_api POST "/groups/$id/users/search" "{}")
    local code="${result%%|*}"
    local body="${result#*|}"

    if [[ "$code" == "200" ]]; then
      local count
      count=$(echo "$body" | python3 -c "import json,sys; d=json.load(sys.stdin); print(len(d.get('items',d.get('users',[]))))" 2>/dev/null || echo "?")
      echo "  $id ($name): $count members"
      # List members
      echo "$body" | python3 -c "
import json, sys
d = json.load(sys.stdin)
items = d.get('items', d.get('users', []))
for u in items:
    name = u.get('username', u.get('name', u.get('userId', '?')))
    print(f'    - {name}')
" 2>/dev/null || true
    else
      echo "  $id: ERROR $code"
    fi
  done
}

# --- Teardown ---
teardown_groups() {
  echo "=== Tearing Down Camunda 8 Groups ==="
  local deleted=0

  for entry in "${GROUPS[@]}"; do
    local id="${entry%%|*}"
    local result
    result=$(camunda_api DELETE "/groups/$id" "")
    local code="${result%%|*}"

    if [[ "$code" == "204" || "$code" == "200" ]]; then
      echo "  - Deleted: $id"
      ((deleted++))
    elif [[ "$code" == "404" ]]; then
      echo "  = Not found: $id"
    else
      echo "  ! Error $code deleting $id: ${result#*|}"
    fi
  done
  echo "  Deleted: $deleted"
}

# --- Main ---
case "${1:-}" in
  --verify)   verify_groups ;;
  --teardown) teardown_groups ;;
  *)
    create_groups
    assign_personas
    echo ""
    echo "Done. Run with --verify to confirm, or check Tasklist UI."
    ;;
esac
