#!/bin/bash
# Deploy SLA Showcase stack (Pages + API Worker + Auth Worker)
# Usage: bash scripts/deploy-showcase.sh [--skip-workers]
#
# Prerequisites:
#   - CLOUDFLARE_API_TOKEN set (or wrangler logged in)
#   - Wrangler secrets already configured (see wrangler.toml in each worker)
#
# Secrets setup (one-time, uses shell env vars from ~/.zshrc):
#   cd infrastructure/cloudflare-workers/sla-showcase-api
#   echo "$ZEEBE_CLIENT_ID" | npx wrangler secret put CAMUNDA_CLIENT_ID
#   echo "$ZEEBE_CLIENT_SECRET" | npx wrangler secret put CAMUNDA_CLIENT_SECRET
#   echo "$PROXY_SECRET" | npx wrangler secret put PROXY_SECRET
#
#   cd infrastructure/cloudflare-workers/sla-showcase-auth
#   echo "$PROXY_SECRET" | npx wrangler secret put PROXY_SECRET
#   echo "$SESSION_SECRET" | npx wrangler secret put SESSION_SECRET
#   echo "<api-worker-url>" | npx wrangler secret put API_WORKER_URL

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SKIP_WORKERS=false

if [[ "${1:-}" == "--skip-workers" ]]; then
  SKIP_WORKERS=true
fi

echo "=== SLA Showcase Deployment ==="
echo ""

# 1. Deploy Pages (static assets)
echo "[1/4] Deploying Pages..."
npx wrangler pages deploy "$REPO_ROOT/customers/fs-onboarding/showcase/public/" \
  --project-name=sla-showcase --branch=main 2>&1 | tail -3
echo "  Pages: OK"

if [[ "$SKIP_WORKERS" == "false" ]]; then
  # 2. Deploy API Worker
  echo "[2/4] Deploying API Worker..."
  cd "$REPO_ROOT/infrastructure/cloudflare-workers/sla-showcase-api"
  npx wrangler deploy 2>&1 | tail -3
  echo "  API Worker: OK"

  # 3. Deploy Auth Worker
  echo "[3/4] Deploying Auth Worker..."
  cd "$REPO_ROOT/infrastructure/cloudflare-workers/sla-showcase-auth"
  npx wrangler deploy 2>&1 | tail -3
  echo "  Auth Worker: OK"
else
  echo "[2/4] Skipping API Worker (--skip-workers)"
  echo "[3/4] Skipping Auth Worker (--skip-workers)"
fi

# 4. Smoke test
echo "[4/4] Running smoke tests..."
bash "$REPO_ROOT/scripts/smoke-test-showcase.sh"

echo ""
echo "=== Deployment Complete ==="
echo "URL: https://showcase.agentic-innovations.com"
