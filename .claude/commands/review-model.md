# /review-model — Review Manual BPMN Model Changes

Review manual changes to a BPMN model, evaluate against standards, and optionally codify new patterns.

**Usage**: `/review-model <file-or-path> [--diff-only] [--no-codify]`

## Arguments

- `<file-or-path>` — Path to the BPMN file (relative to repo root)
- `--diff-only` — Show diff analysis only, skip codification
- `--no-codify` — Evaluate against standards but skip rules-update step

## Instructions

You are reviewing manual changes the user made to a BPMN model in Camunda Modeler. Your goal is to understand what changed, why, and whether it should become a standard pattern.

### Step 1: Identify the Change

Run `git diff` on the specified file (check both staged and unstaged):

```bash
git diff -- "$ARGUMENTS"
git diff --cached -- "$ARGUMENTS"
```

If no diff exists, check if the file is untracked (`git status -- "$ARGUMENTS"`). If there's truly no change detected, use AskUserQuestion to ask: "I don't see any uncommitted changes to this file. Can you describe what you changed, or did you mean a different file?"

### Step 2: Parse the Diff

Analyze the diff and extract a structured summary:

- **Added elements**: New tasks, gateways, events, flows, annotations
- **Removed elements**: Deleted elements and why they might have been removed
- **Modified elements**: Changed attributes (names, positions, conditions, candidateGroups)
- **Layout changes**: Coordinate shifts, spacing adjustments, re-routing of flows
- **Structural changes**: New lanes, reordered sequences, added timers, changed pool dimensions

Present this summary to the user in a clear table or list.

### Step 3: Ask the User WHY

Use AskUserQuestion to understand the intent behind the change:

"I can see the following changes: [brief summary]. Two questions:
1. What problem did this change solve? (e.g., visual overlap, incorrect routing, missing pattern)
2. Should this become a standard pattern for future models?"

Do NOT skip this step. The user's reasoning is the most valuable input.

### Step 4: Evaluate Against Standards

Read and check the change against ALL of these rules files:

- `.claude/rules/bpmn-modeling-standards.md`
- `.claude/rules/bpmn-visual-clarity.md`
- `.claude/rules/bpmn-governance-standards.md`
- `.claude/rules/bpmn-hierarchical-subprocess.md`

Classify each aspect of the change as one of:

| Classification | Meaning |
|---------------|---------|
| **Conforming** | Follows an existing rule exactly |
| **Extending** | Adds a pattern not currently covered but consistent with existing rules |
| **Contradicting** | Conflicts with an existing rule (requires discussion) |

If contradicting, highlight the specific rule and ask the user whether the rule should be updated or the change reverted.

### Step 5: Run Validators

```bash
bash scripts/validators/validate-bpmn.sh "$ARGUMENTS"
```

Report any validation errors or warnings. If validation fails, flag it prominently.

### Step 6: Propose Codification

**Skip this step if `--diff-only` or `--no-codify` was specified.**

If the change introduces a reusable pattern (the user indicated "yes" in Step 3, or the pattern is clearly general-purpose):

1. Identify which rules file the pattern belongs in
2. Draft the proposed rule text (matching the style and formatting of existing rules)
3. Show the proposed text to the user with AskUserQuestion: "Here's the proposed addition to `[rules-file]`. Should I add this? [proposed text]"
4. **Only write the rule if the user approves** — never auto-write
5. If approved, append to the appropriate `.claude/rules/bpmn-*.md` file
6. Also add an entry to `.claude/memory-bank/lessonsLearned.md` with context

### Step 7: Report

Provide a final summary:

```
## Review Summary

**File**: [path]
**Elements changed**: [count added / modified / removed]

### Standards Compliance
- Conforming: [list]
- Extending: [list]
- Contradicting: [list]

### Validation
- Result: [PASS/FAIL]
- Issues: [if any]

### Codification
- [What was codified, or "Skipped" / "User declined"]
```
