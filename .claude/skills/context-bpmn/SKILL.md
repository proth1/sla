---
name: context-bpmn
description: Load BPMN modeling context including standards, patterns, and governance domain
tools: Read, Grep, Glob
user_invocable: true
---

# BPMN Context Loader

Loads BPMN-specific context for process modeling work.

## What Gets Loaded

1. `.claude/context/bpmn/sla-governance-domain.md` — Phases, pathways, swim lanes, DMN inventory
2. `.claude/context/bpmn/bpmn-modeling-standards.md` — Layout and visual standards
3. `.claude/context/bpmn/regulatory-alignment.md` — Regulatory framework mapping
4. `.claude/memory-bank/patterns.md` — Established BPMN patterns

## Quick Reference

### BPMN Testing Workflow
1. **Fast Validation**: `node scripts/validators/bpmn-validator.js [file]`
2. **Visual Check**: `node scripts/validators/visual-overlap-checker.js [file]`
3. **Flow Direction**: `node scripts/validators/flow-direction-checker.js [file]`
4. **Full Pipeline**: `bash scripts/validators/validate-bpmn.sh [file]`
5. **Generate Tests**: `/test-bpmn [process] --generate`

### Commands
- `/test-bpmn [process]` - Generate BDD tests

### Coverage Requirements
- 80% minimum path coverage
- Happy path + error handling + boundary tests required

## When to Use

- Before creating or editing BPMN files
- When reviewing BPMN models
- When generating BDD test scenarios for BPMN
- When mapping process steps to regulatory requirements

## Invocation

User says: `/context:bpmn`
