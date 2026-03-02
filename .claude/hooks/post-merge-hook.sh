#!/bin/bash
# PostToolUse Hook: PR Merged → Auto-trigger CHANGELOG + memory updates

set -euo pipefail

hook_input=$(cat)
command=$(echo "$hook_input" | jq -r '.tool_input.command // ""' 2>/dev/null || echo "")

if [[ ! "$command" =~ "gh pr merge" ]]; then
  exit 0
fi

exit_code=$(echo "$hook_input" | jq -r '.tool_response.exit_code // 1' 2>/dev/null || echo "1")
if [[ "$exit_code" != "0" ]]; then
  exit 0
fi

pr_number=""
if [[ "$command" =~ gh[[:space:]]+pr[[:space:]]+merge[[:space:]]+#?([0-9]+) ]]; then
  pr_number="${BASH_REMATCH[1]}"
fi

if [[ -z "$pr_number" ]]; then
  stdout=$(echo "$hook_input" | jq -r '.tool_response.stdout // ""' 2>/dev/null || echo "")
  if [[ "$stdout" =~ pull/([0-9]+) ]]; then
    pr_number="${BASH_REMATCH[1]}"
  fi
fi

log_file="${HOME}/.claude/merge-hook-events.log"
{
  echo "---"
  echo "Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"
  echo "Command: $command"
  echo "PR Number: ${pr_number:-unknown}"
  echo "Exit Code: $exit_code"
} >> "$log_file" 2>/dev/null || true

branch_name=""
if [[ "$command" =~ --head[[:space:]]+([^[:space:]]+) ]]; then
  branch_name="${BASH_REMATCH[1]}"
fi

jira_key=""
if [[ "$branch_name" =~ (SLM-[0-9]+) ]]; then
  jira_key="${BASH_REMATCH[1]}"
fi

if [[ -n "$pr_number" ]]; then
  instruction="HOOK DIRECTIVE: PR #${pr_number} merged. You MUST now perform ALL post-merge updates per .claude/rules/post-merge-updates.md:

RELEASE TRACKING:
1. Read the current CHANGELOG.md head version to determine the next CalVer version (increment the release number by 1).
2. Add a new CHANGELOG.md entry with the PR's changes (use git log and PR details to summarize).
3. Update .claude/memory-bank/.current-version with the new version.
4. Update .claude/memory-bank/platformState.md — version, last release date, total releases count, and recent releases table.
5. Update .claude/memory-bank/activeContext.md — note the merge in session summary.

CLEANUP:
6. Run 'git worktree list' and remove any worktree for the merged branch.
7. Run 'git branch -d <branch>' to delete the local feature branch if it still exists.
8. Pull latest main: 'git pull origin main --no-rebase'.

WORK ITEM:
9. Transition the Jira issue${jira_key:+ (${jira_key})} to Done. Use: curl -X POST with transition ID. First GET /rest/api/3/issue/SLM-XXX/transitions to find the 'Done' transition ID, then POST it.
10. If no Jira key is obvious, extract it from the PR title or branch name (format: SLM-XXX).

ALL steps are MANDATORY after every PR merge."
else
  instruction="HOOK DIRECTIVE: A PR was just merged. You MUST now perform ALL post-merge updates per .claude/rules/post-merge-updates.md:
1. Determine the PR number from recent git history or command context.
2. Read the current CHANGELOG.md head version and increment CalVer release number by 1.
3. Add a new CHANGELOG.md entry, update .current-version, platformState.md, and activeContext.md.
4. Run 'git worktree list' and remove any worktree for the merged branch. Delete the local feature branch.
5. Pull latest main: 'git pull origin main --no-rebase'.
6. Transition the corresponding Jira issue (SLM-XXX from branch/PR title) to Done via REST API.
ALL steps are MANDATORY after every PR merge."
fi

jq -n --arg ctx "$instruction" '{
  hookSpecificOutput: {
    hookEventName: "PostToolUse",
    additionalContext: $ctx
  }
}'

exit 0
