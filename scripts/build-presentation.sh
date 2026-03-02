#!/usr/bin/env bash
# Build script for SLA Governance Presentation
# Replaces {{PLACEHOLDER}} tokens in the template with computed values
# Must be idempotent: running twice produces identical output
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TEMPLATE="${REPO_ROOT}/docs/presentations/index.html"

if [[ ! -f "$TEMPLATE" ]]; then
  echo "ERROR: Template not found at ${TEMPLATE}" >&2
  exit 1
fi

# Compute metrics from the codebase
TOTAL_DMN=$(find "${REPO_ROOT}/decisions" -name '*.dmn' -not -path '*/reference/*' 2>/dev/null | wc -l | tr -d ' ')
TOTAL_BPMN=$(find "${REPO_ROOT}/processes" -name '*.bpmn' -not -path '*/reference/*' 2>/dev/null | wc -l | tr -d ' ')
BUILD_DATE=$(date '+%Y-%m-%d')
VERSION_FILE="${REPO_ROOT}/.claude/memory-bank/.current-version"
if [[ -f "$VERSION_FILE" ]]; then
  VERSION=$(cat "$VERSION_FILE" | tr -d '[:space:]')
else
  VERSION="2025.06.1"
fi

# Static values from the spec
TOTAL_PHASES=7
CYCLE_TIME_BEFORE="90-120"
CYCLE_TIME_AFTER="29-45"
REDUCTION_PERCENT="68-75%"
REGULATORY_FRAMEWORKS=13
SWIM_LANES=7
AUTOMATION_PERCENT="~60%"

# Perform sed replacements (in-place)
sed -i '' \
  -e "s|{{TOTAL_DMN_TABLES}}|${TOTAL_DMN}|g" \
  -e "s|{{TOTAL_BPMN_MODELS}}|${TOTAL_BPMN}|g" \
  -e "s|{{BUILD_DATE}}|${BUILD_DATE}|g" \
  -e "s|{{VERSION}}|${VERSION}|g" \
  -e "s|{{TOTAL_PHASES}}|${TOTAL_PHASES}|g" \
  -e "s|{{CYCLE_TIME_BEFORE}}|${CYCLE_TIME_BEFORE}|g" \
  -e "s|{{CYCLE_TIME_AFTER}}|${CYCLE_TIME_AFTER}|g" \
  -e "s|{{REDUCTION_PERCENT}}|${REDUCTION_PERCENT}|g" \
  -e "s|{{REGULATORY_FRAMEWORKS}}|${REGULATORY_FRAMEWORKS}|g" \
  -e "s|{{SWIM_LANES}}|${SWIM_LANES}|g" \
  -e "s|{{AUTOMATION_PERCENT}}|${AUTOMATION_PERCENT}|g" \
  "$TEMPLATE"

# Copy PRD HTML into presentations dir for Cloudflare deployment
PRD_SRC="${REPO_ROOT}/docs/prd/enterprise-software-governance-prd.html"
PRD_DEST="${REPO_ROOT}/docs/presentations/prd.html"
if [[ -f "$PRD_SRC" ]]; then
  cp "$PRD_SRC" "$PRD_DEST"
  echo "  PRD copied to presentations dir"
fi

echo "Build complete."
echo "  DMN tables: ${TOTAL_DMN}"
echo "  BPMN models: ${TOTAL_BPMN}"
echo "  Version: ${VERSION}"
echo "  Date: ${BUILD_DATE}"
echo "  Output: ${TEMPLATE}"
