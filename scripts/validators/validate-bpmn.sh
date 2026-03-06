#!/bin/bash
# Validate all BPMN files in the SLA project
# Usage: ./validate-bpmn.sh [specific-file.bpmn]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== SLA Governance BPMN Validation ===${NC}"
echo ""

# Check if node_modules exists
if [ ! -d "$SCRIPT_DIR/node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    cd "$SCRIPT_DIR" && npm install
fi

PASSED=0
FAILED=0

validate_file() {
    local file="$1"
    local filename=$(basename "$file")
    local file_failed=0
    echo -e "${BLUE}Validating: $filename${NC}"

    # Run security scanner (first gate — blocks before any other validation)
    if node "$SCRIPT_DIR/security-scanner.js" "$file"; then
        true
    else
        file_failed=1
    fi

    # Run BPMN validator
    if node "$SCRIPT_DIR/bpmn-validator.js" "$file"; then
        true
    else
        file_failed=1
    fi

    # Run visual overlap checker (blocking gate)
    if node "$SCRIPT_DIR/visual-overlap-checker.js" "$file"; then
        true
    else
        file_failed=1
    fi

    # Flow direction checker
    if [ -f "$SCRIPT_DIR/flow-direction-checker.js" ]; then
      if node "$SCRIPT_DIR/flow-direction-checker.js" "$file"; then
        echo "  ✓ Flow direction check passed"
      else
        file_failed=1
        echo "  ✗ Flow direction check failed"
      fi
    fi

    # Run element checker
    if node "$SCRIPT_DIR/element-checker.js" "$(dirname "$file")"; then
        true
    else
        echo -e "${YELLOW}  Element checker warning for $filename${NC}"
    fi

    if [ "$file_failed" -eq 0 ]; then
        ((PASSED++))
    else
        ((FAILED++))
    fi

    echo ""
}

if [ -n "${1:-}" ]; then
    # Validate specific file
    validate_file "$1"
else
    # Validate all BPMN files in the project (excluding archive)
    while IFS= read -r -d '' file; do
        validate_file "$file"
    done < <(find "$PROJECT_DIR/framework/processes" "$PROJECT_DIR/customers" -name "*.bpmn" ! -path "*/archive/*" -print0 2>/dev/null)
fi

# Scan DMN files (security scanner only — skip BPMN-specific validators)
DMN_PASSED=0
DMN_FAILED=0
while IFS= read -r -d '' file; do
    local_filename=$(basename "$file")
    echo -e "${BLUE}Security scan: $local_filename${NC}"
    if node "$SCRIPT_DIR/security-scanner.js" "$file"; then
        ((DMN_PASSED++))
    else
        ((DMN_FAILED++))
    fi
    echo ""
done < <(find "$PROJECT_DIR/framework/decisions" "$PROJECT_DIR/customers" -name "*.dmn" -print0 2>/dev/null)

echo -e "${BLUE}=== Validation Summary ===${NC}"
echo -e "BPMN Passed: ${GREEN}$PASSED${NC}"
echo -e "BPMN Failed: ${RED}$FAILED${NC}"
if [ "$DMN_PASSED" -gt 0 ] || [ "$DMN_FAILED" -gt 0 ]; then
    echo -e "DMN  Passed: ${GREEN}$DMN_PASSED${NC}"
    echo -e "DMN  Failed: ${RED}$DMN_FAILED${NC}"
fi

TOTAL_FAILED=$((FAILED + DMN_FAILED))
if [ "$TOTAL_FAILED" -gt 0 ]; then
    exit 1
fi
