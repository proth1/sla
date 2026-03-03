#!/bin/bash
# Pre-edit validation - blocks edits on main, checks branch naming
# PM Tool: Jira (SLA-XXX format)

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Unconditional branch check — runs regardless of arguments
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")

if [[ "$BRANCH" == "main" || "$BRANCH" == "master" ]]; then
    echo -e "${RED}BLOCKED: Cannot edit files on $BRANCH branch${NC}"
    echo -e "${YELLOW}Create a feature branch first:${NC}"
    echo "  1. Create Jira Issue (SLA-XXX) at https://agentic-sdlc.atlassian.net"
    echo "  2. git checkout -b feature/SLA-{id}-description"
    exit 1
fi

check_branch_merged() {
    local current_branch=$1

    # Main/master are always allowed
    if [[ "$current_branch" == "main" || "$current_branch" == "master" ]]; then
        return 0
    fi

    # Check if branch has commits not in main
    local unmerged_commits=$(git log main..$current_branch --oneline 2>/dev/null)

    if [[ -z "$unmerged_commits" ]]; then
        echo -e "${RED}BLOCKED: Branch '$current_branch' appears fully merged to main${NC}"
        echo -e "${YELLOW}This branch has no unique commits. Create a new feature branch.${NC}"
        return 1
    fi

    return 0
}

validate_sdlc_compliance() {
    local file_path=$1
    local operation=$2

    # Branch already checked above — validate naming convention
    # Accept both SLA-XXX and SLM-XXX for backward compatibility
    if [[ ! "$BRANCH" =~ ^feature/SL[AM]-[0-9]+-.*$ ]]; then
        echo -e "${RED}BLOCKED: Invalid branch name for $operation${NC}"
        echo -e "${RED}Current: $BRANCH${NC}"
        echo -e "${RED}Required: feature/SLA-<number>-description${NC}"
        echo ""
        echo "To fix:"
        echo "  1. Create Jira Issue (SLA-XXX) at https://agentic-sdlc.atlassian.net"
        echo "  2. git checkout main && git pull"
        echo "  3. git checkout -b feature/SLA-{id}-description"
        return 1
    fi

    # Check if branch is already merged
    check_branch_merged "$BRANCH" || return 1

    echo -e "${GREEN}Pre-edit validation passed${NC}"
    return 0
}

# Export function for use in other scripts
export -f validate_sdlc_compliance

# If called directly with arguments, run validation
if [[ $# -ge 2 ]]; then
    validate_sdlc_compliance "$1" "$2"
    exit $?
fi
