# Intelligent Model Routing Rules

**CRITICAL**: Apply these rules to EVERY Task tool invocation to optimize cost while maintaining quality.

## Model Selection Matrix (Claude 4.6 Generation)

| Model | Cost | Use For |
|-------|------|---------|
| `haiku` | $0.80/$4 MTok | Simple lookups, file searches, quick answers |
| `sonnet` | $3/$15 MTok | Code writing, refactoring, planning, standard reviews |
| `opus` | $15/$75 MTok | System-wide architecture, security audits, novel reasoning |

## Routing Decision Tree

```
Is this a simple lookup/search/list?
  YES → haiku
  NO ↓

Is this code writing < 400 lines, bounded refactoring, or standard planning?
  YES → sonnet
  NO ↓

Is this system-wide architecture, security audit, or novel complex reasoning?
  YES → opus
  NO → sonnet (default)
```

## Route to HAIKU

Use `model: "haiku"` for:

- **Simple questions**: "What is X?", "Where is Y?", "List N things"
- **File operations**: Finding files, searching code, reading configs
- **Quick lookups**: Git status, package versions, environment info
- **Formatting**: Code formatting, simple text transformations
- **Exploration**: Codebase exploration with `subagent_type=Explore`

Pattern indicators:
- Query starts with: what, who, when, where, which, list, show, find
- Query length < 15 words
- Task is read-only (no code generation)

## Route to SONNET

Use `model: "sonnet"` for:

- **Code writing**: Functions, classes, components (up to 400 lines)
- **Bounded refactoring**: Clear scope, single module or component
- **Explanations**: How does X work? Compare A vs B
- **Debugging**: Find and fix specific bugs
- **Standard reviews**: Code review, PR description writing
- **Planning**: Implementation plans with clear scope
- **Single-component security review**: Reviewing one file or module for issues
- **Configuration**: Setup tasks, integration work
- **Documentation**: Writing docs, comments, READMEs

Pattern indicators:
- Query asks to "write", "implement", "create", "refactor" something specific
- Query asks to "explain", "compare", "debug", "plan"
- Moderate complexity, well-defined scope
- Code changes limited to a single module or 2-3 files

## Route to OPUS

Use `model: "opus"` for:

- **System-wide architecture**: Cross-service design, infrastructure decisions
- **Security audits**: Full system vulnerability analysis, compliance reviews
- **Complex reasoning**: Multi-step analysis, trade-off evaluation across domains
- **Large cross-cutting refactoring**: Changes spanning many modules
- **Critical production decisions**: High-risk changes, production impacts
- **Novel problems**: No clear pattern, requires deep thinking

Pattern indicators:
- Query contains: architecture, security audit, comprehensive, entire system
- Query explicitly mentions cross-cutting or system-wide scope
- Query length > 50 words with multiple requirements
- Task affects multiple systems or has compliance implications

## SubAgent Model Recommendations

| SubAgent Type | Default Model | Override When |
|---------------|---------------|---------------|
| `Explore` | haiku | Never (already fast) |
| `general-purpose` | sonnet | System-wide multi-step → opus |
| `code-quality-reviewer` | sonnet | Standard |
| `security-reviewer` | opus | Keep opus (critical) |
| `architecture-reviewer` | opus | Keep opus (critical) |
| `test-coverage-analyzer` | sonnet | Standard |
| `critical-thinking` | opus | Keep opus (reasoning) |
| `Plan` | sonnet | System-wide architecture → opus |
| `jira-manager` | haiku | Simple CRUD operations |
| `meridian-reporter` | sonnet | Standard (read-only reporting) |

## Cost Impact

Choosing the right model saves significant cost:

| Scenario | All Opus | With Routing | Savings |
|----------|----------|--------------|---------|
| 100 queries/day | $10/day | $3-4/day | 60-70% |
| Monthly | $300 | $90-120 | $180-210 |
| Annual | $3,650 | $1,100-1,450 | $2,200-2,550 |

## Examples

Simple (→ haiku):
- "Find all TypeScript files in src/"
- "What version of Node is installed?"
- "Show the git diff"
- "List the exports from this module"

Medium (→ sonnet):
- "Write a function to validate email addresses"
- "Explain how the authentication flow works"
- "Fix the TypeScript error in this component"
- "Create a PR description for these changes"
- "Refactor this service to use dependency injection"
- "Plan the implementation of this feature"
- "Review this controller for security issues"

Complex (→ opus):
- "Design the database schema for multi-tenancy"
- "Perform a full security audit of the OAuth implementation"
- "Refactor the entire API layer to use a cleaner architecture"
- "Analyze the trade-offs between these three approaches"

## Implementation

When invoking Task tool, always include model parameter:

```
Task(
  subagent_type="Explore",
  model="haiku",  ← ALWAYS SPECIFY
  prompt="Find files..."
)
```

Default to sonnet if uncertain, escalate to opus only for genuinely complex tasks.
