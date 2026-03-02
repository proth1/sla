#!/bin/bash
# PostToolUse Hook: PR Created → Auto-trigger pr-orchestrator

set -euo pipefail

hook_input=$(cat)
command=$(echo "$hook_input" | jq -r '.tool_input.command // ""' 2>/dev/null || echo "")

if [[ ! "$command" =~ "gh pr create" ]]; then
  exit 0
fi

exit_code=$(echo "$hook_input" | jq -r '.tool_response.exit_code // 1' 2>/dev/null || echo "1")
if [[ "$exit_code" != "0" ]]; then
  exit 0
fi

stdout=$(echo "$hook_input" | jq -r '.tool_response.stdout // ""' 2>/dev/null || echo "")

pr_url=""
pr_number=""
if [[ "$stdout" =~ (https://github.com/[^[:space:]]+/pull/([0-9]+)) ]]; then
  pr_url="${BASH_REMATCH[1]}"
  pr_number="${BASH_REMATCH[2]}"
fi

log_file="${HOME}/.claude/pr-hook-events.log"
{
  echo "---"
  echo "Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"
  echo "Command: $command"
  echo "PR URL: ${pr_url:-unknown}"
  echo "PR Number: ${pr_number:-unknown}"
  echo "Exit Code: $exit_code"
} >> "$log_file" 2>/dev/null || true

if [[ -n "$pr_number" ]]; then
  instruction="HOOK DIRECTIVE: PR #${pr_number} created at ${pr_url}. You MUST now invoke the pr-orchestrator subagent in the background. Use: Task(subagent_type='pr-orchestrator', model='opus', run_in_background=true, prompt='Run comprehensive PR review on PR #${pr_number} in the current project directory. Post consolidated findings as a gh pr comment on PR #${pr_number}.'). This is mandatory per .claude/rules/pr-auto-review.md."
else
  instruction="HOOK DIRECTIVE: A PR was just created. You MUST now invoke the pr-orchestrator subagent in the background. Extract the PR number from the command output and use: Task(subagent_type='pr-orchestrator', model='opus', run_in_background=true, prompt='Run comprehensive PR review on the PR. Post consolidated findings as a gh pr comment.'). This is mandatory per .claude/rules/pr-auto-review.md."
fi

jq -n --arg ctx "$instruction" '{
  hookSpecificOutput: {
    hookEventName: "PostToolUse",
    additionalContext: $ctx
  }
}'

exit 0
