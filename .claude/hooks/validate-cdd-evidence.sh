#!/usr/bin/env bash
# PreToolUse hook: Triggered before `gh pr merge`
# Validates that CDD evidence exists for the linked Jira issue
# For SLA project, checks Jira issue comments for evidence markers

set -euo pipefail

# Read hook input from stdin
hook_input=$(cat)
command=$(echo "$hook_input" | jq -r '.tool_input.command // ""' 2>/dev/null || echo "")

# Only process gh pr merge commands
if [[ ! "$command" =~ "gh pr merge" ]]; then
  exit 0
fi

PROJECT_DIR="$CLAUDE_PROJECT_DIR"
REPO="proth1/sla"

# Extract Jira issue key from branch name
# Branches use SLM- prefix but Jira project key is SLA
BRANCH=$(git -C "${PROJECT_DIR}" rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")
JIRA_KEY=""
ISSUE_NUM=""
if [[ "${BRANCH}" =~ ^feature/SLM-([0-9]+) ]]; then
    ISSUE_NUM="${BASH_REMATCH[1]}"
    JIRA_KEY="SLA-${ISSUE_NUM}"
fi

# If no Jira key found, skip validation (might be a hotfix branch)
if [[ -z "${JIRA_KEY}" ]]; then
    exit 0
fi

# Resolve Jira credentials: prefer ~/.jira.d/config.yml (agentic-sdlc),
# fall back to env vars
JIRA_CONFIG="$HOME/.jira.d/config.yml"
if [[ -f "${JIRA_CONFIG}" ]] && command -v python3 &>/dev/null; then
    read -r CFG_URL CFG_USER CFG_PASS < <(python3 -c "
import re, sys
cfg = open('${JIRA_CONFIG}').read()
def val(key):
    m = re.search(r'^' + key + r':\s*(.+)', cfg, re.M)
    return m.group(1).strip() if m else ''
print(val('endpoint'), val('user'), val('password'))
" 2>/dev/null || echo "")
    if [[ -n "${CFG_URL}" && -n "${CFG_USER}" && -n "${CFG_PASS}" ]]; then
        JIRA_URL="${CFG_URL}"
        JIRA_AUTH="${CFG_USER}:${CFG_PASS}"
    fi
fi

# Fall back to env vars if config not available
if [[ -z "${JIRA_AUTH:-}" ]]; then
    if [[ -z "${JIRA_EMAIL:-}" || -z "${JIRA_API_TOKEN:-}" ]]; then
        exit 0
    fi
    JIRA_URL="${JIRA_URL:-https://agentic-sdlc.atlassian.net}"
    JIRA_AUTH="${JIRA_EMAIL}:${JIRA_API_TOKEN}"
fi

# Fetch Jira issue comments and look for CDD evidence markers
COMMENTS=$(curl -s --max-time 8 -u "${JIRA_AUTH}" \
  "${JIRA_URL}/rest/api/3/issue/${JIRA_KEY}/comment" 2>/dev/null | \
  jq -r '.comments[].body.content[]?.content[]?.text // empty' 2>/dev/null || echo "")

if [[ -z "${COMMENTS}" ]]; then
    cat <<EOF
{
  "decision": "block",
  "reason": "MERGE BLOCKED: No comments found on Jira issue ${JIRA_KEY}. CDD requires evidence (validation results, test coverage, regulatory review) posted as issue comments before merge.\n\nPost CDD evidence to ${JIRA_KEY} at ${JIRA_URL}/browse/${JIRA_KEY}."
}
EOF
    exit 0
fi

# Check for CDD evidence markers in comments
if ! echo "${COMMENTS}" | grep -qi "CDD Evidence\|evidence\|validation\|test results"; then
    cat <<EOF
{
  "decision": "block",
  "reason": "MERGE BLOCKED: Missing CDD evidence on Jira issue ${JIRA_KEY}. Post validation results as a CDD Evidence comment on the issue before merging."
}
EOF
    exit 0
fi

# Evidence found — allow merge
cat <<EOF
{
  "hookSpecificOutput": {
    "additionalContext": "CDD evidence validation PASSED for issue ${JIRA_KEY}. Evidence comments found on the Jira issue."
  }
}
EOF
