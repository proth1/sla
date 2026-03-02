---
name: bpmn-editing
description: BMS GSC BPMN layout standards and visual best practices. Use when creating or editing BPMN files (*.bpmn), fixing layout issues, or working with Camunda process diagrams. Ensures proper element positioning, escalation patterns, and visual clarity.
---

# BPMN Editing Skill

Apply consistent BPMN modeling patterns when editing process files. This skill ensures files are formatted correctly for Camunda Modeler compatibility and minimal diff noise.

## When to Use

Invoke this skill automatically when:
- Creating new BPMN files
- Editing existing `.bpmn` files
- Fixing layout or visual issues
- Reviewing BPMN file changes

## Core Patterns

### 1. No XML Comments

**Never add comments to BPMN XML.** Camunda Modeler strips them on save, creating unnecessary diffs.

```xml
<!-- WRONG -->
<!-- ========== PHASE 1 ========== -->
<!-- Start Event -->
<bpmn:startEvent id="StartEvent_1" name="Start">

<!-- CORRECT -->
<bpmn:startEvent id="StartEvent_1" name="Start">
```

This includes:
- Section divider comments (`<!-- ===== SECTION ===== -->`)
- Element label comments (`<!-- Start Event -->`)
- BPMNDI section comments (`<!-- Flow Edges: Main Flow -->`)

### 2. Omit Default Attribute Values

Don't include attributes set to their default values:

| Attribute | Default | Omit When |
|-----------|---------|-----------|
| `isInterrupting` | `true` | Event sub-process start events |
| `cancelActivity` | `true` | Interrupting boundary events |

```xml
<!-- WRONG: Explicit default -->
<bpmn:startEvent id="Start_1" isInterrupting="true">

<!-- CORRECT: Omit default -->
<bpmn:startEvent id="Start_1">
```

**Exception**: Always explicitly set `cancelActivity="false"` for non-interrupting timers.

### 3. Single-Line Namespace Declarations

Let Camunda Modeler format the definitions element. Don't manually format with multi-line namespaces:

```xml
<!-- WRONG: Multi-line -->
<bpmn:definitions xmlns:bpmn="..."
                  xmlns:bpmndi="..."
                  id="Definitions_1">

<!-- CORRECT: Single-line (Camunda output) -->
<bpmn:definitions xmlns:bpmn="..." xmlns:bpmndi="..." id="Definitions_1" exporter="Camunda Modeler" exporterVersion="5.42.0">
```

### 4. Consistent Element Sizing

| Element | Width | Height |
|---------|-------|--------|
| Task | 100 | 80 |
| Gateway | 50 | 50 |
| Event | 36 | 36 |
| Collapsed Sub-Process | 100 | 80 |

### 5. Timer Boundary Event Pattern

Timer boundary events MUST have outgoing flows. Position labels to the RIGHT:

```xml
<!-- Label at x+44, y+4 from boundary event -->
<bpmndi:BPMNLabel>
  <dc:Bounds x="360" y="276" width="46" height="27" />
</bpmndi:BPMNLabel>
```

### 6. Parallel Branch Spacing

Use 170-180px vertical spacing between parallel branches for visual clarity.

### 7. Escalation Event Positioning

Position escalation end events 50px below the triggering boundary event.

### 8. Collapsed Subprocess for Parallel Execution

Encapsulate parallel split/join patterns in **collapsed subprocesses** to keep the main flow clean:

```xml
<!-- Main flow stays linear -->
Start → Task A → [Collapsed Subprocess] → Task B → End

<!-- Inside subprocess: horizontal parallel layout -->
Start → Split Gateway → Task1 → Task2 → Task3 → Join Gateway → End
```

**Horizontal layout within subprocess** (NOT vertical):
- Split flows go UP, across to tasks
- Task flows go DOWN, across to join
- Tasks spaced ~110px horizontally

### 9. No Redundant Gateway Names

Parallel gateways should NOT have names when the context is clear:

```xml
<!-- WRONG: Redundant name -->
<bpmn:parallelGateway id="Gateway_Fork" name="Deploy to All Platforms">

<!-- CORRECT: No name needed -->
<bpmn:parallelGateway id="Gateway_Fork">
```

## Quick Reference

| Rule | Check |
|------|-------|
| No comments | `grep -c '<!--' file.bpmn` should be 0 |
| No `isInterrupting="true"` | `grep 'isInterrupting="true"' file.bpmn` should be empty |
| Single-line definitions | First `<bpmn:definitions` on one line |
| Timer has outgoing | Every `boundaryEvent` with timer has `<bpmn:outgoing>` |
| No gateway names | Parallel gateways should not have `name=` attribute |
| Subprocess has BPMNDiagram | Collapsed subprocesses need separate `<bpmndi:BPMNDiagram>` |

## Governance Requirement

All governance BPMN models MUST include regulatory annotation text annotations (OCC 2023-17, SR 11-7, etc.) as applicable.

## Related Rules

Full standards documented in:
- `.claude/context/bpmn/bpmn-modeling-standards.md` (comprehensive rule set)

## Version

Patterns derived from `campaign-lifecycle.bpmn` and `launch-campaign.bpmn` corrections (2026-01-08).
