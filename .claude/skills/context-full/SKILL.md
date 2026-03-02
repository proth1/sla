---
name: context-full
description: Load complete SLA Governance project context including domain knowledge, regulatory frameworks, and modeling standards
user_invocable: true
---

# Context Full Skill

Load the complete SLA Governance Platform project context in one pass. Use this when starting a new session, picking up complex work, or when full situational awareness is needed before making architectural or modeling decisions.

## When to Use

Invoke this skill when:
- Starting a new session on the SLA Governance Platform
- Resuming work after a break and needing full orientation
- About to make decisions that touch multiple domains (BPMN, regulatory, architecture)
- Onboarding to a part of the codebase not recently worked on

## Implementation

When this skill is invoked, read each file in order and produce a structured summary:

### Step 1: Project Overview

Read `CLAUDE.md` for the project overview, tech stack, key conventions, and top-level goals.

### Step 2: Domain Knowledge

Read `.claude/context/bpmn/sla-governance-domain.md` for:
- SLA governance phase definitions
- Swim lane assignments and ownership
- Domain-specific terminology and constraints

### Step 3: Regulatory Frameworks

Read `.claude/context/bpmn/regulatory-alignment.md` for:
- Applicable regulatory standards (OCC 2023-17, SR 11-7, etc.)
- Compliance requirements that must appear in BPMN models
- Annotation and evidence obligations

### Step 4: Modeling Standards

Read `.claude/context/bpmn/bpmn-modeling-standards.md` for BPMN layout and formatting rules.

> Note: If this file does not yet exist, fall back to `.claude/skills/bpmn-editing/SKILL.md` for modeling standards.

### Step 5: Current Status

Read `.claude/memory-bank/activeContext.md` for:
- What was last worked on
- In-flight decisions or open questions
- Current sprint or milestone focus

### Step 6: Architectural Decisions

Read `.claude/memory-bank/decisionLog.md` for:
- Key technical decisions and their rationale
- Constraints imposed by past choices
- Alternatives that were considered and rejected

## Output Format

After reading all files, produce a structured summary:

```markdown
## SLA Governance — Loaded Context

### Project Overview
[2-3 sentence summary from CLAUDE.md]

### Domain
- Governance phases: [list]
- Key swim lanes: [list]
- Critical constraints: [list]

### Regulatory Requirements
- Applicable standards: [OCC, SR, etc.]
- Required annotations: [list]

### Modeling Standards
- Key formatting rules in effect
- Any active exceptions or overrides

### Current Status (activeContext.md)
- Last worked on: [topic]
- Open questions: [list]
- Next steps: [list]

### Recent Decisions (decisionLog.md)
- [Date] [Decision summary] — Rationale: [one line]
- (up to 5 most recent)
```

## Related Skills

- `/governance-context` — Load only governance domain rules (faster, narrower)
- `/memory` — Search memory-bank for a specific topic
- `/bpmn-editing` — BPMN layout and formatting standards
