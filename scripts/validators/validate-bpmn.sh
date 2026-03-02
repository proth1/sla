#!/bin/bash
# Validate all BPMN files in the SLA project
# Usage: ./validate-bpmn.sh [specific-file.bpmn]

set -e

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
WARNINGS=0

validate_file() {
    local file="$1"
    local filename=$(basename "$file")
    echo -e "${BLUE}Validating: $filename${NC}"

    # Run BPMN validator
    if node "$SCRIPT_DIR/bpmn-validator.js" "$file" 2>/dev/null; then
        ((PASSED++))
    else
        ((FAILED++))
    fi

    # Run visual overlap checker
    if node "$SCRIPT_DIR/visual-overlap-checker.js" "$file" 2>/dev/null; then
        true
    else
        ((WARNINGS++))
    fi

    echo ""
}

if [ -n "$1" ]; then
    # Validate specific file
    validate_file "$1"
else
    # Validate all BPMN files in the project
    while IFS= read -r -d '' file; do
        validate_file "$file"
    done < <(find "$PROJECT_DIR/processes" -name "*.bpmn" -print0 2>/dev/null)
fi

echo -e "${BLUE}=== Validation Summary ===${NC}"
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo -e "Warnings: ${YELLOW}$WARNINGS${NC}"

if [ "$FAILED" -gt 0 ]; then
    exit 1
fi
