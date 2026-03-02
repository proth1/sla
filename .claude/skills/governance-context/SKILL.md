---
name: governance-context
description: Load SLA governance domain rules including phase definitions, swim lanes, and regulatory requirements
user_invocable: true
---

# Governance Context Skill

Load the SLA governance domain rules on demand. This is the lightweight alternative to `/context-full` — use it when you need governance-specific rules for a focused task without loading the full project context.

## When to Use

Invoke this skill when:
- Designing or reviewing a BPMN process that touches governance phases
- Assigning tasks to swim lanes and needing to verify ownership
- Adding regulatory annotations to a process model
- Evaluating whether a proposed change violates domain constraints
- Writing or reviewing SLA-related logic without needing the full session context

## Implementation

When this skill is invoked, read each file and extract the actionable rules for the current task:

### Step 1: Governance Domain Rules

Read `.claude/context/bpmn/sla-governance-domain.md` for:
- SLA governance phase definitions and boundaries
- Swim lane ownership (who owns what in each phase)
- Allowed and prohibited transitions between phases
- Domain-specific entity definitions and terminology

### Step 2: BPMN Governance Standards

Read `.claude/rules/bpmn-governance-standards.md` for:
- Mandatory elements in governance process models
- Required regulatory annotation patterns
- Naming conventions for governance artifacts
- Compliance checkpoints that must appear in every model

### Step 3: Domain Identity Rules

Read `.claude/rules/sla-domain-identity.md` for:
- The authoritative identity of this project and its scope
- Boundaries between SLA governance and adjacent domains
- What is explicitly out of scope
- Terminology that must be used consistently

## Output Format

After reading all files, output the rules relevant to the current task:

```markdown
## Governance Context — Loaded Rules

### Applicable Governance Phases
- Phase N — [Name]: [one-line description of scope]
  - Owner: [swim lane]
  - Entry condition: [what triggers this phase]
  - Exit condition: [what completes this phase]

### Swim Lane Assignments
- [Lane name]: Responsible for [tasks]
- ...

### Regulatory Requirements in Scope
- [Standard] — [What it requires in this context]
- ...

### Constraints for This Task
- [Constraint 1]
- [Constraint 2]

### Key Terminology
- [Term]: [Definition as used in this domain]
```

Only include sections that are relevant to what the user is working on. Skip empty sections rather than listing placeholders.

## Related Skills

- `/context-full` — Full project context including current status and decision log
- `/bpmn-editing` — BPMN layout and formatting standards
- `/memory` — Search memory-bank for past governance decisions
