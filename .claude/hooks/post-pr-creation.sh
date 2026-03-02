#!/bin/bash
# Post-PR Creation - Jira workflow (SLM project)
# Validates PR was created correctly and reminds about approval requirements

set -e

hook_input=$(cat)
command=$(echo "$hook_input" | jq -r '.tool_input.command // ""' 2>/dev/null || echo "")
if [[ ! "$command" =~ "gh pr create" ]]; then
  exit 0
fi

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Running Post-PR Creation Validation...${NC}"

get_current_pr() {
    if command -v gh &> /dev/null; then
        gh pr view --json number -q '.number' 2>/dev/null
    fi
}

get_issue_number() {
    local branch=$(git branch --show-current)
    if [[ "$branch" =~ ^feature/SLM-([0-9]+) ]]; then
        echo "SLM-${BASH_REMATCH[1]}"
    fi
}

main() {
    local pr_number=$(get_current_pr)
    local issue_number=$(get_issue_number)

    if [ -n "$issue_number" ]; then
        echo -e "${GREEN}Work Item: $issue_number${NC}"
    fi

    if [ -n "$pr_number" ]; then
        echo -e "${GREEN}PR #$pr_number created successfully${NC}"
        echo ""
        echo -e "${YELLOW}MANDATORY: Wait for human approval before merge${NC}"
        echo -e "${YELLOW}Review checklist:${NC}"
        echo "  - BPMN/DMN model quality and standards compliance"
        echo "  - Test coverage and passing validation"
        echo "  - Regulatory alignment annotations"
        echo "  - Documentation updates"
        echo ""
        echo -e "${BLUE}View PR:${NC} gh pr view $pr_number --web"
    else
        echo -e "${YELLOW}Note: Could not detect PR number (gh CLI may not be available)${NC}"
    fi
}

main "$@"
