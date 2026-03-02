# Post-Merge Updates (MANDATORY)

**After every `gh pr merge`, Claude MUST perform ALL of the following:**

---

## Release Tracking

### 1. CHANGELOG.md
- Determine next CalVer version: read current head version, increment release number by 1
- Add entry: `## [YYYY.MM.release] - YYYY-MM-DD`
- Categorize changes: Added, Changed, Fixed, Security, Deprecated, Removed
- Summarize PR changes (use PR title, description, and commit messages)

### 2. .claude/memory-bank/.current-version
- Write the new CalVer version string (single line, no trailing newline)

### 3. .claude/memory-bank/platformState.md
- Update `**Current Version**` line
- Update `**Last Release**` date
- Increment `Total Releases` count
- Add row to `Recent Releases` table (keep last 7 entries)

### 4. .claude/memory-bank/activeContext.md
- Note the merged PR in session summary
- Update `Release Version` in Platform Stats table

---

## Cleanup

### 5. Remove worktree
- Run `git worktree list` to find the worktree for the merged feature branch
- Remove it: `git worktree remove ../sla-SLM-XXX`

### 6. Delete local feature branch
- `git branch -d feature/SLM-XXX-description`

### 7. Pull latest main
- `git pull origin main --no-rebase`

---

## Work Item

### 8. Transition Jira issue to Done
- Extract the Jira key (SLM-XXX) from the branch name or PR title
- Get available transitions: `curl -s -X GET "https://agentic-sdlc.atlassian.net/rest/api/3/issue/SLM-XXX/transitions" -H "Authorization: Basic $(echo -n "$JIRA_EMAIL:$JIRA_API_TOKEN" | base64)" -H "Content-Type: application/json"`
- Find the transition ID for "Done" (or "Closed")
- Execute transition
- If no Jira key is found, warn the user but do not skip other steps

---

## How It Works

A PostToolUse hook in `.claude/settings.json` fires after `gh pr merge`. The hook script (`.claude/hooks/post-merge-hook.sh`) emits a HOOK DIRECTIVE instructing Claude to perform all updates above.
