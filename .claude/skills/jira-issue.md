---
name: jira-issue
description: Create and manage Jira issues for the SLM project
user-invocable: true
trigger: /jira-issue, /issue, /jira
tools: Bash, Read
---

# Jira Issue Management Skill

Create and manage Jira issues in the SLM project at agentic-sdlc.atlassian.net.

## Quick Commands

```bash
# Create with type
/issue create story "[Auth] Implement SSO"
/issue create task "Update Node to v22"
/issue create bug "[API] 500 error on /users"
/issue create epic "[Q1] Platform reliability"

# View issue
/issue view SLM-123
/issue SLM-123

# List issues
/issue list
/issue list --mine
/issue list --bugs
/issue list --stories

# Update status
/issue start SLM-123
/issue done SLM-123

# Comment
/issue comment SLM-123 "Progress update..."
```

## Usage

This skill wraps the `jira-manager` subagent. When invoked, delegate to:

```typescript
Task({
  subagent_type: "jira-manager",
  model: "haiku",
  prompt: `[User's request about Jira issues]`
});
```

## Integration with Workflow

### After Creating an Issue

```markdown
## Issue Created

**Issue**: SLM-XXX
**Type**: Story
**Title**: [Auth] Implement SSO login
**URL**: https://agentic-sdlc.atlassian.net/browse/SLM-XXX

**Next Steps:**
1. `git worktree add ../sla-SLM-XXX feature/SLM-XXX-implement-sso -b feature/SLM-XXX-implement-sso`
2. Implement the feature
3. `gh pr create --title "SLM-XXX: Implement SSO" --body "Resolves: SLM-XXX"`
```

### Automatic Status Flow
1. Issue created → Backlog
2. `/issue start SLM-XXX` → In Progress
3. PR created with "Resolves: SLM-XXX" → In Review
4. PR merged → Done

---

**Skill Version**: 1.0.0
**Replaces**: github-issue.md
