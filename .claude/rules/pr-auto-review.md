# PR Auto-Review (MANDATORY)

**Every PR created via Claude Code MUST be reviewed by pr-orchestrator before proceeding.**

## How It Works

1. A PostToolUse hook in `.claude/settings.json` with `matcher: "Bash"` fires on every Bash tool use
2. The hook script (`.claude/hooks/pr-created-hook.sh`) checks if the command contains `gh pr create` and exits early if not
3. On match, it outputs a HOOK DIRECTIVE via `hookSpecificOutput.additionalContext`
4. You MUST invoke the pr-orchestrator subagent immediately upon seeing the directive

## Required Action

When you see `HOOK DIRECTIVE: PR #NNN created`, invoke:

```
Task(
  subagent_type="pr-orchestrator",
  model="opus",
  run_in_background=true,
  prompt="Run comprehensive PR review on PR #NNN in the current project directory. Post consolidated findings as a gh pr comment on PR #NNN."
)
```

## Rules

- **Do NOT skip** the pr-orchestrator invocation — it is mandatory
- **Run in background** so you can continue other work while the review runs
- **Post findings to the PR** as a `gh pr comment` (the orchestrator handles this)
- If the hook fires but you cannot determine the PR number, ask the user
- This applies to ALL PRs, regardless of size or content type
