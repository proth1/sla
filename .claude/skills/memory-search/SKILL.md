---
name: memory-search
description: Search across all memory-bank files for relevant context. Use when you need to find specific decisions, patterns, lessons, or evidence.
command: /memory
args: query
---

# Memory Search Skill

Search across the memory-bank for relevant context, decisions, patterns, and lessons learned.

## Usage

```
/memory <search query>
```

## Examples

- `/memory authentication` - Find all references to authentication
- `/memory SLM-548` - Find all references to a specific work item
- `/memory OCC 2023-17` - Find decisions/patterns related to OCC guidance
- `/memory race condition` - Find lessons about race conditions

## Search Scope

This skill searches across:

1. **activeContext.md** - Current session state and recent work
2. **decisionLog.md** - Technical decisions with rationale
3. **patterns.md** - Reusable solutions and best practices
4. **lessonsLearned.md** - Mistakes and insights to avoid
5. **projectContext.md** - Overall project state
6. **evidence/** - CDD evidence, test results, security scans

## Implementation

When this skill is invoked, search the memory-bank directory for the query:

```bash
# Search command (uses grep for content search)
grep -r -i -l "$QUERY" .claude/memory-bank/ 2>/dev/null | head -20
```

Then read the relevant sections from matching files and summarize findings.

## Output Format

Present findings organized by source:

```markdown
## Memory Search Results: "<query>"

### Decisions (decisionLog.md)
- [Date] Decision about X - Rationale: Y

### Patterns (patterns.md)
- Pattern #N: Related pattern description

### Lessons (lessonsLearned.md)
- Lesson about X - Prevention: Y

### Evidence
- [File] Relevant evidence summary
```

## When to Use

- Before implementing something that might have been done before
- When encountering an error that might be a known issue
- To find the rationale behind an existing implementation
- To check if a pattern already exists for a use case
