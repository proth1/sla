# Self-Sufficiency (MANDATORY)

**NEVER ask the user to run commands you can run yourself.** Use your tools.

## Before Escalating

1. Try the command directly (Bash tool)
2. If not found, search common paths: `/opt/homebrew/bin/`, `/Applications/*.app/Contents/Resources/bin/`
3. Try alternative approaches
4. Only escalate when action genuinely requires human intervention

## macOS Tool Paths

| Tool | Path |
|------|------|
| Homebrew | `/opt/homebrew/bin/brew` |
| wrangler | `npx wrangler` or `~/.npm-global/bin/wrangler` |
| jira CLI | `/opt/homebrew/bin/jira` |

## After Changes

Always verify changes took effect (curl for API, screenshots for UI, logs for backend).
