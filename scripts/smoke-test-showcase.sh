#!/bin/bash
# Post-deploy smoke tests for SLA Showcase
# Usage: bash scripts/smoke-test-showcase.sh
#
# Tests:
#   1. Auth Worker serves login page (200)
#   2. Pages redirect to auth domain without proxy header (302)
#   3. API Worker rejects requests without proxy secret (401)
#   4. Health check endpoint returns OK (if PROXY_SECRET is set)

set -euo pipefail

AUTH_URL="https://showcase.agentic-innovations.com"
PAGES_URL="https://sla-showcase.pages.dev"
PASS=0
FAIL=0

check() {
  local name="$1" expected="$2" actual="$3"
  if [[ "$actual" == *"$expected"* ]]; then
    echo "  ✓ $name"
    PASS=$((PASS + 1))
  else
    echo "  ✗ $name (expected: $expected, got: $actual)"
    FAIL=$((FAIL + 1))
  fi
}

echo "  Smoke tests for $AUTH_URL"
echo ""

# 1. Auth login page
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$AUTH_URL/auth/login" 2>/dev/null || echo "000")
check "Auth login page responds" "200" "$STATUS"

# 2. Pages redirect without proxy header
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -L --max-redirs 0 "$PAGES_URL/" 2>/dev/null || echo "000")
check "Pages redirects without proxy header" "302" "$STATUS"

# 3. API rejects without proxy secret
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$AUTH_URL/api/personas" 2>/dev/null || echo "000")
check "Unauthenticated API request rejected" "401" "$STATUS"

# 4. Health check (requires auth — skip if no session)
if [[ -n "${PROXY_SECRET:-}" ]]; then
  HEALTH=$(curl -s "$AUTH_URL/api/health" -H "X-SLA-API-Proxy: $PROXY_SECRET" 2>/dev/null || echo "{}")
  if echo "$HEALTH" | grep -q '"status":"ok"'; then
    check "Health check (Camunda connected)" "ok" "ok"
  else
    check "Health check (Camunda connected)" "ok" "$(echo "$HEALTH" | head -c 100)"
  fi
else
  echo "  - Health check skipped (PROXY_SECRET not set)"
fi

echo ""
echo "  Results: $PASS passed, $FAIL failed"

if [[ $FAIL -gt 0 ]]; then
  exit 1
fi
