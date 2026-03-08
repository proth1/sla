---
description: Execute full SDLC process with Jira, CDD compliance, PR orchestration, and git worktrees
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, Task, TaskCreate, TaskUpdate, TaskList, TaskGet, TeamCreate, TeamDelete, SendMessage, EnterWorktree, AskUserQuestion
---

# Full SDLC Process — Jira + CDD + PR Orchestration + Git Worktrees

Execute the complete Agentic SDLC lifecycle for the given work item or feature request.

## Input

```
$ARGUMENTS
```

If no arguments provided, ask the user what feature or bug to work on.

## Phase 1: Work Item Management (jira-manager)

Use the `jira-manager` subagent (model: haiku) to:

1. **Create or find the Jira issue** (SLA-XXX) for this work
   - If `$ARGUMENTS` contains an SLA-XXX key, fetch it
   - If `$ARGUMENTS` is a description, create a new issue in the SLA project
2. **Extract requirements** from the Jira issue description and acceptance criteria
3. **Transition to In Progress** if not already

```
Task(
  subagent_type="jira-manager",
  model="haiku",
  prompt="<work item instructions>"
)
```

## Phase 2: CDD Compliance Analysis (cdd-methodology)

Use the `cdd-methodology` subagent (model: sonnet) to:

1. **Analyze compliance requirements** for the feature
2. **Identify regulatory frameworks** that apply
3. **Generate compliance checklist** with controls and evidence requirements
4. **Create a compliance plan** that integrates with the implementation

```
Task(
  subagent_type="cdd-methodology",
  model="sonnet",
  prompt="Analyze compliance requirements for SLA-XXX: <description>"
)
```

## Phase 3: Implementation (git worktree + sdlc-orchestrator)

### 3a. Create Git Worktree

Create an isolated worktree for the feature branch:

```bash
git worktree add ../sla-SLA-XXX -b feature/SLA-XXX-description
```

Then work exclusively in the worktree directory.

### 3b. SDLC Orchestration

Use the `sdlc-orchestrator` subagent (model: sonnet) to execute the 4-phase development workflow:

1. **Plan** — Design the implementation approach
2. **Implement** — Write the code changes
3. **Test** — Run tests and validate
4. **Review** — Self-review before PR

```
Task(
  subagent_type="sdlc-orchestrator",
  model="sonnet",
  prompt="Execute full 4-phase SDLC workflow for SLA-XXX in worktree at ../sla-SLA-XXX: <requirements>"
)
```

## Phase 4: Commit, Push & PR

After implementation is complete:

1. **Commit** with conventional message: `SLA-XXX: Description`
2. **Push** to origin remote: `git push -u origin feature/SLA-XXX-description`
3. **Create PR** via `gh pr create`:
   - Title: `SLA-XXX: Title`
   - Body: Summary of changes, test plan, compliance evidence
   - Base: `main`

## Phase 5: PR Review (pr-orchestrator)

Use the `pr-orchestrator` subagent (model: opus) to run comprehensive review:

```
Task(
  subagent_type="pr-orchestrator",
  model="opus",
  run_in_background=true,
  prompt="Run comprehensive PR review on PR #NNN. Post consolidated findings as a gh pr comment."
)
```

The pr-orchestrator spawns up to 9 specialized review agents:
- Code quality reviewer
- Security reviewer
- Architecture reviewer
- Test coverage analyzer
- Performance analyzer
- Dependency checker
- And more

## Phase 6: Address Findings & Merge

1. **Review PR findings** from the orchestrator
2. **Fix any CRITICAL or HIGH findings** identified
3. **Push fixes** and re-run review if needed
4. **Merge** when all checks pass

## Phase 7: Post-Merge (mandatory)

After merge, perform ALL post-merge updates per `.claude/rules/post-merge-updates.md`:
- CHANGELOG.md entry with CalVer version bump
- Update `.claude/memory-bank/` files
- Clean up worktree: `git worktree remove ../sla-SLA-XXX`
- Transition Jira issue to Done

## Rules

- **Every change needs a Jira issue** — never skip Phase 1
- **Always use worktrees** — never commit directly to main
- **Push immediately after commit** — per project rules
- **PR review is mandatory** — never merge without pr-orchestrator review
- **Post-merge updates are mandatory** — never skip Phase 7
- **CDD compliance is advisory** — use findings to inform implementation, don't block on it
- **Model routing**: jira-manager=haiku, cdd/sdlc=sonnet, pr-orchestrator=opus
