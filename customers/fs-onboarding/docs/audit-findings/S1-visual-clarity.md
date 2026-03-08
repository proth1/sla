# S1-A3 Visual Clarity Audit

**Agent**: S1-A3 (Visual Clarity)
**Date**: 2026-03-04
**Scope**: All active BPMN files in `processes/` (excluding `processes/archive/`)
**Files audited**: 10 BPMN files
**Standard**: `.claude/rules/bpmn-visual-clarity.md`

---

## Files Audited

| File | Shapes | Edges | Status |
|------|--------|-------|--------|
| `processes/master/sla-governance-master.bpmn` | 76 | 55 | Issues found |
| `processes/phase-1-intake/initiation-and-intake.bpmn` | 23 | 11 | Clean |
| `processes/phase-2-planning/planning-and-risk-scoping.bpmn` | 36 | 30 | Issues found |
| `processes/phase-3-due-diligence/due-diligence-and-swarm.bpmn` | 58 | 43 | Issues found |
| `processes/phase-4-governance/governance-review-and-approval.bpmn` | 43 | 29 | Issues found |
| `processes/cross-cutting/cross-cutting-event-subprocesses.bpmn` | 87 | 79 | Issues found |
| `processes/phase-5-contracting/contracting-and-controls.bpmn` | 38 | 24 | Issues found |
| `processes/phase-6-sdlc/sdlc-development-and-testing.bpmn` | 43 | 26 | Issues found |
| `processes/phase-7-deployment/deployment-and-go-live.bpmn` | 29 | 16 | Issues found |
| `processes/phase-8-operations/operations-monitoring-retirement.bpmn` | 67 | 56 | Issues found |

---

## Findings

---

### [HIGH] VISUAL: Backward Sequence Flow — Master Monitoring Continue Loop

**File**: `processes/master/sla-governance-master.bpmn`
**Agent**: S1-A3 (Visual Clarity)
**Rule**: Left-to-Right Flow (No Backward Sequence Flows)
**Evidence**:
- Flow ID: `Flow_Monitor_Continue` ("Continue Operations")
- Source: `Gateway_Monitoring` at x=2185, y=947
- Target: `SP_Phase8_Operations` at x=2010, y=942
- Waypoints: `(2210,947) → (2210,930) → (2060,930) → (2060,942)`
- Backward distance: **150px**
**Description**: The "Continue Operations" loop from the monitoring gateway back to the Phase 8 subprocess flows right-to-left. The gateway (x=2185) is positioned to the right of its target (x=2010), making the loop appear as a backward flow. The flow is not named with a standard loop keyword ("Retry", "Revise", etc.) that would mark it as an intentional loop.
**Risk**: Violates left-to-right readability principle. A reviewer scanning the diagram left-to-right will encounter an unlabeled backward arc, breaking visual comprehension of the monitoring cycle.
**Recommendation**: Either (a) rename the flow to include a loop keyword (e.g., "Loop: Continue Monitoring") so the backward routing is intentional and recognizable, or (b) restructure the layout to route the loop above the main path using a standard loop-back pattern.

---

### [HIGH] VISUAL: Backward Sequence Flow — SDLC Quality Gate Rejected Loop

**File**: `processes/phase-6-sdlc/sdlc-development-and-testing.bpmn`
**Agent**: S1-A3 (Visual Clarity)
**Rule**: Left-to-Right Flow (No Backward Sequence Flows)
**Evidence**:
- Flow ID: `Flow_QGRejected_Merge`
- Source: `EndEvent_QualityGateRejected` at x=1757, y=204
- Target: `Gateway_QualityGate_Merge` at x=1515, y=87
- Waypoints: `(1775,204) → (1775,160) → (1540,160) → (1540,137)`
- Backward distance: **235px**
**Description**: An end event (`EndEvent_QualityGateRejected`) routes backward to a merge gateway (`Gateway_QualityGate_Merge`). Connecting an end event as a source is architecturally unusual — end events should terminate flow, not feed back into process gateways. The 235px backward routing compounds the visual confusion.
**Risk**: High readability and semantic confusion. The diagram implies the quality gate rejection terminates the process and then re-enters it, which contradicts BPMN semantics. Readers will misinterpret the flow.
**Recommendation**: Replace the end event with an intermediate event or boundary event for the quality gate rejection path. Route the rejection loop above the main path targeting the appropriate task for re-work initiation.

---

### [HIGH] VISUAL: Long Backward Loop Flows — Phase 8 Operations

**File**: `processes/phase-8-operations/operations-monitoring-retirement.bpmn`
**Agent**: S1-A3 (Visual Clarity)
**Rule**: Left-to-Right Flow (No Backward Sequence Flows)
**Evidence**:
- Flow 1: `Flow_Outcome_Continue` ("Continue Operations")
  - Source: `Gateway_MonitoringOutcome` at x=1525
  - Target: `Gateway_ContinueMerge` at x=295
  - Waypoints: `(1550,872) → (1550,830) → (320,830) → (320,872)`
  - Backward distance: **1230px**
- Flow 2: `Flow_8C_LoopBack`
  - Source: `SubProcess_8C` at x=1660
  - Target: `Gateway_ContinueMerge` at x=295
  - Waypoints: `(1710,857) → (1710,830) → (320,830) → (320,872)`
  - Backward distance: **1390px**
**Description**: Two sequence flows span the entire width of the diagram (1230px and 1390px) in the reverse direction. Both loop back to `Gateway_ContinueMerge` at the start of the monitoring area. The flows route horizontally above the main swimlane content at y=830, creating a long visual scar across the diagram. `Flow_8C_LoopBack` has no name, making its purpose opaque.
**Risk**: The 1230–1390px backward arcs severely disrupt left-to-right reading. Viewers must visually track lines spanning most of the diagram width. The unnamed `Flow_8C_LoopBack` provides no context for why Phase 8C returns to the merge gateway.
**Recommendation**: (a) Name `Flow_8C_LoopBack` to clarify intent (e.g., "Return to Monitoring"). (b) Consider restructuring Phase 8 to use a sub-process or event-driven continuation rather than a long backward arc. (c) If loops must remain, they should route clearly above the main path at a consistent y-offset with labeled waypoints.

---

### [MEDIUM] VISUAL: Timer Label Positioned Left of Boundary Event — Phase 6

**File**: `processes/phase-6-sdlc/sdlc-development-and-testing.bpmn`
**Agent**: S1-A3 (Visual Clarity)
**Rule**: Timer Label Positioning (label x >= event x + 44)
**Evidence**:
- Element: `BoundaryEvent_Phase6_Timer` ("15 Day Phase SLA")
- Event bounds: x=422, y=134, w=36, h=36
- Label bounds: x=416, y=173, w=65, h=27
- Expected minimum label x: 422 + 44 = **466**
- Actual label x: **416** (6px to the LEFT of the event, 50px left of the standard position)
**Description**: The timer label for the 15-day Phase SLA boundary event is positioned to the left of the event shape rather than to the right. Per the visual clarity standard, timer labels must be positioned to the right of boundary events (x + ~44px) to avoid overlapping with the parent task and to maintain consistent label placement.
**Risk**: The label overlaps with the parent task area to the left, making both the timer label and any adjacent task label harder to read.
**Recommendation**: Move label to x=466, y=176 (event_x + 44, event_y + 42) to place it clearly to the right.

---

### [MEDIUM] VISUAL: Flow Labels Overlapping Target Task Text — Master

**File**: `processes/master/sla-governance-master.bpmn`
**Agent**: S1-A3 (Visual Clarity)
**Rule**: Flow Labels Must Not Overlap Task Text (label y <= target_task_y - 18)
**Evidence**:
- Flow `Flow_Gov_Approved` ("Approved"): label y=214, target task y-range [207, 257] — label y is within task bounds
- Flow `Flow_Monitor_Retire` ("Retire"): label y=954, target task y-range [954, 990] — label y is at task top edge
**Description**: Two flow labels are positioned at or within the bounding box of their target tasks. The "Approved" label sits 7px below the target task top edge; the "Retire" label is exactly at the task top edge. Both will visually merge with the task's own label text when rendered.
**Risk**: Overlapping text reduces readability for governance reviewers tracing approval and retirement paths.
**Recommendation**: Raise each label by at least 20px above the target task top edge. For "Approved": label y <= 189. For "Retire": label y <= 936.

---

### [MEDIUM] VISUAL: Flow Labels Overlapping Target Task Text — Phase 2

**File**: `processes/phase-2-planning/planning-and-risk-scoping.bpmn`
**Agent**: S1-A3 (Visual Clarity)
**Rule**: Flow Labels Must Not Overlap Task Text
**Evidence**:
- Flow `Flow_YesAI_SplitAI` ("Yes"): label y=414, target task y-range [407, 457] — label 7px inside task top
**Description**: The "Yes" routing label on the AI pathway split sits inside the target task's bounding box, visually blending with the task label.
**Risk**: Ambiguity for reviewers on AI governance pathway routing.
**Recommendation**: Move label y to <= 389 (target_y - 18).

---

### [MEDIUM] VISUAL: Flow Labels Overlapping Target Task Text — Phase 3

**File**: `processes/phase-3-due-diligence/due-diligence-and-swarm.bpmn`
**Agent**: S1-A3 (Visual Clarity)
**Rule**: Flow Labels Must Not Overlap Task Text
**Evidence**:
- Flow `Flow_AICheck_Yes` ("Yes"): label y=591, target task y-range [569, 649] — label 22px inside task top
- Flow `Flow_NoBuildPath` ("No (Buy)"): label y=984, target task y-range [977, 1027] — label 7px inside task top
**Description**: Both routing labels for AI check and build/buy pathway routing sit inside their respective target task bounding boxes.
**Risk**: Confuses pathway routing labels (Yes/No, Buy) with task names during review.
**Recommendation**: Move `Flow_AICheck_Yes` label y to <= 551. Move `Flow_NoBuildPath` label y to <= 959.

---

### [MEDIUM] VISUAL: Flow Labels Overlapping Target Task Text — Phase 4

**File**: `processes/phase-4-governance/governance-review-and-approval.bpmn`
**Agent**: S1-A3 (Visual Clarity)
**Rule**: Flow Labels Must Not Overlap Task Text
**Evidence**:
- Flow `Flow_AICheck_Skip` ("No"): label y=1229, target task y-range [1222, 1272] — label 7px inside task top
**Description**: The "No" routing label for the AI check bypass sits inside the target task bounding box.
**Risk**: Ambiguity on whether AI review is included in the governance pathway.
**Recommendation**: Move label y to <= 1204.

---

### [MEDIUM] VISUAL: Flow Labels Overlapping Target Task Text — Cross-Cutting (8 instances)

**File**: `processes/cross-cutting/cross-cutting-event-subprocesses.bpmn`
**Agent**: S1-A3 (Visual Clarity)
**Rule**: Flow Labels Must Not Overlap Task Text
**Evidence**:
- `Flow_SP2_TierCritical` ("Critical"): label y=82, target y-range [60, 140]
- `Flow_SP2_TierHigh` ("High"): label y=252, target y-range [250, 330]
- `Flow_SP2_TierMedium` ("Medium"): label y=442, target y-range [440, 520]
- `Flow_SP2_TierLow` ("Low"): label y=562, target y-range [560, 640]
- `Flow_SP3_P1` ("P1 Critical"): label y=82, target y-range [60, 140]
- `Flow_SP3_P2` ("P2 High"): label y=252, target y-range [250, 330]
- `Flow_SP3_P3` ("P3 Medium"): label y=442, target y-range [440, 520]
- `Flow_SP3_P4` ("P4 Low"): label y=562, target y-range [560, 640]
**Description**: All 8 tier/severity routing labels in the SP2 (Vulnerability Remediation) and SP3 (Incident Response) inner diagrams are positioned inside the target task bounding boxes. The tier routing fan-out pattern results in labels sitting at the task top edges for all severity levels.
**Risk**: All severity routing labels for both sub-processes are unreadable in isolation. This affects the core routing logic visualization for vulnerability and incident triage.
**Recommendation**: For each routing label, move label y to at least 18px above the target task top edge:
- Critical/P1 labels: y <= 42
- High/P2 labels: y <= 232
- Medium/P3 labels: y <= 422
- Low/P4 labels: y <= 542

---

### [MEDIUM] VISUAL: Flow Labels Overlapping Target Task Text — Phase 6, 7, 8

**File**: `processes/phase-6-sdlc/sdlc-development-and-testing.bpmn`, `processes/phase-7-deployment/deployment-and-go-live.bpmn`, `processes/phase-8-operations/operations-monitoring-retirement.bpmn`
**Agent**: S1-A3 (Visual Clarity)
**Rule**: Flow Labels Must Not Overlap Task Text
**Evidence**:
- Phase 6 `Flow_QGRejected` ("No"): label y=204, target y-range [204, 240] — at exact top edge
- Phase 7 `Flow_Health_Pass` ("Yes"): label y=809, target y-range [787, 867] — 22px inside task top
- Phase 8 `Flow_Outcome_Change` ("Change Required"): label y=873, target y-range [857, 937] — 16px inside task top
- Phase 8 `Flow_EmgNo_Skip` ("No"): label y=952, target y-range [952, 988] — at exact top edge
**Description**: Four additional flow labels across three phase files are positioned at or inside their target task bounding boxes.
**Risk**: Routing decision labels for quality gate, health check, change management, and emergency paths are all visually merged with task label text.
**Recommendation**:
- Phase 6 `Flow_QGRejected`: move label y to <= 186
- Phase 7 `Flow_Health_Pass`: move label y to <= 769
- Phase 8 `Flow_Outcome_Change`: move label y to <= 839
- Phase 8 `Flow_EmgNo_Skip`: move label y to <= 934

---

### [LOW] VISUAL: Annotation Association Lines Route Backward — Multiple Files

**Files**: `processes/phase-2-planning/planning-and-risk-scoping.bpmn`, `processes/phase-4-governance/governance-review-and-approval.bpmn`, `processes/phase-5-contracting/contracting-and-controls.bpmn`, `processes/phase-6-sdlc/sdlc-development-and-testing.bpmn`, `processes/phase-7-deployment/deployment-and-go-live.bpmn`
**Agent**: S1-A3 (Visual Clarity)
**Rule**: Left-to-Right Flow
**Evidence**:
- Phase 2 `Assoc_OCC`: 550 → 410 (140px backward, process task → annotation below)
- Phase 2 `Assoc_SR117`: 1230 → 850 (380px backward, task → annotation below)
- Phase 4 `Assoc_SOX`: 790 → 550 (240px backward, task → annotation below)
- Phase 5 `Assoc_OCC`: 590 → 550 (40px backward, task → annotation below)
- Phase 6 `Assoc_OCC_DORA`: 880 → 475 (405px backward, task → annotation)
- Phase 6 `Assoc_SOX_Compliance`: 1180 → 1045 (135px backward, task → annotation)
- Phase 7 `Assoc_NIST`: 1230 → 1150 (80px backward, task → annotation)
**Description**: Regulatory annotation association lines (BPMN `<association>` elements, not sequence flows) connect process tasks to regulatory text annotations positioned below the main flow. Because annotations are placed in a text annotation band at the bottom of the diagram and referenced tasks are at various x-positions, the association lines run diagonally backwards. These are not sequence flows and do not affect process routing — however, the visual effect of backward-pointing dashed lines can confuse viewers unfamiliar with BPMN annotation conventions.
**Risk**: Low impact on process logic. Minor visual confusion for non-BPMN-expert reviewers who may interpret the backward dashed lines as reverse sequence flows.
**Recommendation**: Reposition regulatory text annotations to be directly below or to the right of their referenced tasks where feasible. For annotations that span multiple tasks (e.g., SR 11-7 annotating multiple AI review tasks), a single centrally-placed annotation with a forward-pointing association is preferable.

---

### [LOW] VISUAL: Cross-Cutting Outer Diagram — Participant Overlaps Lanes (Expected Pattern)

**File**: `processes/cross-cutting/cross-cutting-event-subprocesses.bpmn`
**Agent**: S1-A3 (Visual Clarity)
**Rule**: Element Overlap
**Evidence**:
- `Participant_EnterpriseGovernance` (x=155, y=47, w=620, h=690) overlaps all 5 contained lanes
- 29 participant-lane overlaps detected in outer diagram
**Description**: The participant pool shape overlaps all its contained lane shapes in the outer diagram's BPMNDiagram. This is the standard BPMN 2.0 rendering behavior — participants are containers for lanes, and the BPMN DI specification expects the participant bounds to encompass all its lanes. This is NOT a true visual overlap issue.
**Risk**: None. This is correct BPMN structure.
**Recommendation**: No action needed. Flag noted for completeness; automated overlap detectors should exclude participant-lane containment relationships.

---

### [INFO] VISUAL: Element Dimensions — All Files Compliant

**Files**: All 10 active BPMN files
**Agent**: S1-A3 (Visual Clarity)
**Rule**: Element Dimensions (tasks 100x80, gateways 50x50, events 36x36)
**Evidence**: No dimension violations found across all 476 shapes audited.
**Description**: All task, gateway, and event elements across all 10 BPMN files conform to the standard dimensions.
**Risk**: None.
**Recommendation**: No action needed.

---

### [INFO] VISUAL: Phase 1 — Fully Compliant

**File**: `processes/phase-1-intake/initiation-and-intake.bpmn`
**Agent**: S1-A3 (Visual Clarity)
**Rule**: All visual clarity rules
**Evidence**: No backward sequence flows, no dimension violations, no label overlaps detected.
**Description**: Phase 1 (Initiation and Intake) passes all automated visual clarity checks.
**Risk**: None.
**Recommendation**: No action needed.

---

## Summary

### Counts by Severity

| Severity | Count | Description |
|----------|-------|-------------|
| HIGH | 3 | Backward sequence flows affecting process readability |
| MEDIUM | 8 | Flow label overlaps with target task text (19 individual label instances) |
| LOW | 2 | Backward annotation associations, non-issue participant overlap |
| INFO | 2 | Compliant items noted |

### Files with No Issues

- `processes/phase-1-intake/initiation-and-intake.bpmn` — fully clean

### Files with Issues

| File | HIGH | MEDIUM | LOW |
|------|------|--------|-----|
| `processes/master/sla-governance-master.bpmn` | 1 | 1 | 0 |
| `processes/phase-2-planning/planning-and-risk-scoping.bpmn` | 0 | 1 | 1 |
| `processes/phase-3-due-diligence/due-diligence-and-swarm.bpmn` | 0 | 1 | 0 |
| `processes/phase-4-governance/governance-review-and-approval.bpmn` | 0 | 1 | 1 |
| `processes/cross-cutting/cross-cutting-event-subprocesses.bpmn` | 0 | 1 | 1 |
| `processes/phase-5-contracting/contracting-and-controls.bpmn` | 0 | 0 | 1 |
| `processes/phase-6-sdlc/sdlc-development-and-testing.bpmn` | 1 | 2 | 1 |
| `processes/phase-7-deployment/deployment-and-go-live.bpmn` | 0 | 1 | 1 |
| `processes/phase-8-operations/operations-monitoring-retirement.bpmn` | 1 | 1 | 0 |

### Key Findings Summary

1. **3 backward sequence flows** — in master orchestrator (monitoring loop), Phase 6 SDLC (quality gate rejection loop), and Phase 8 Operations (two long loop-backs spanning 1230–1390px). These are the most significant readability issues.

2. **19 flow label overlaps** across 9 files — all routing decision labels ("Yes", "No", "Approved", tier names) are positioned at or inside target task bounding boxes. The cross-cutting sub-processes have the highest concentration (8 instances).

3. **1 timer label misposition** — Phase 6 timer label is left of its boundary event (should be right).

4. **All element dimensions are correct** — no size violations across all 476 shapes.

5. **Annotation backward associations** are a cosmetic concern only, not process logic issues.
