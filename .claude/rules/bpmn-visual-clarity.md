# BPMN Visual Clarity Rules (MANDATORY)

**THIS IS A MANDATORY RULE derived from human-readability requirements for multi-lane governance BPMN.**

These rules ensure BPMN diagrams are instantly understandable by humans viewing them in Camunda Modeler or any BPMN viewer.

---

## The Left-to-Right Within Lane Principle (CRITICAL)

**The #1 rule for human-readable multi-lane BPMN: Keep ALL sequence flows moving LEFT-TO-RIGHT within each swim lane.**

A person should be able to trace any flow path by moving their eyes **left-to-right** within a lane, and **top-to-bottom** when crossing lanes.

### No Backward Sequence Flows (MANDATORY)

**Every sequence flow MUST have its last waypoint X-coordinate >= its first waypoint X-coordinate**, except for explicit loop-back flows routed above the main path.

```
CORRECT: All flows move left to right
[Start] -> [Task A] -> [Gateway] -> [Task B] -> [Task C] -> [End]

WRONG: Backward flow (right to left)
[Task C] <- [Gateway] -> [Task A] -> [Start]
```

**Explicit loops** (named "Retry", "Revise", "Negotiate", "Refine") are the ONLY exception. They MUST:
1. Route ABOVE the main flow path
2. Target a merge gateway (not directly to a task)
3. Be visually distinct from forward flows

---

## Multi-Lane Layout (9+1 Governance Swim Lanes)

SLA governance models use 2 pools with 9+1 lanes. Each lane is 125px tall:

### Enterprise Governance Pool (8 lanes)

| Lane Name | Y-Start | Y-End | candidateGroups |
|-----------|---------|-------|-----------------|
| Business | 0 | 125 | `business-lane` |
| Governance | 125 | 250 | `governance-lane` |
| Contracting | 250 | 375 | `contracting-lane` |
| Technical Assessment | 375 | 500 | `technical-assessment` |
| AI Review | 500 | 625 | `ai-review` |
| Compliance | 625 | 750 | `compliance-lane` |
| Oversight | 750 | 875 | `oversight-lane` |
| Automation | 875 | 1000 | `automation-lane` |

### Vendor / Third Party Pool (1 lane)

| Lane Name | Y-Start | Y-End | candidateGroups |
|-----------|---------|-------|-----------------|
| Vendor Response | 1030 | 1155 | `vendor-response` |

(30px gap between pools)

### Element Positioning Within Lanes

Tasks should be centered vertically within their assigned lane:

| Lane | Task Y-Position | Gateway Y-Position | Event Y-Position |
|------|----------------|-------------------|-----------------|
| Business | 22 | 37 | 44 |
| Governance | 147 | 162 | 169 |
| Contracting | 272 | 287 | 294 |
| Technical Assessment | 397 | 412 | 419 |
| AI Review | 522 | 537 | 544 |
| Compliance | 647 | 662 | 669 |
| Oversight | 772 | 787 | 794 |
| Automation | 897 | 912 | 919 |
| Vendor Response | 1052 | 1067 | 1074 |

---

## Cross-Lane Routing Standard

When flows cross between lanes:

1. **Vertical segments between lanes**: Use vertical waypoints to cross lane boundaries
2. **Horizontal segments within lanes**: All horizontal flow stays within a single lane
3. **No diagonal crossing**: Never draw a diagonal line crossing 2+ lane boundaries

```
CORRECT cross-lane routing:
Lane A:  [Task A] --+
                    |  (vertical segment)
Lane B:             +-- [Task B]

WRONG cross-lane routing:
Lane A:  [Task A] ----\
                       \--- [Task B]  (diagonal across lanes)
Lane B:
```

---

## Standard X-Spacing

| Element Pair | X-Gap | Notes |
|-------------|-------|-------|
| Start Event -> First Task | 64px | Start x=150 -> Task x=250 |
| Task -> Gateway | 65px | Task end -> Gateway start |
| Gateway -> Task | 65px | Gateway end -> Task start |
| Task -> Task (short process) | 60px | Standard spacing |
| Task -> Task (long process) | 30px | Tighter for 10+ tasks |
| Gateway -> Gateway | 60-90px | Separate merge gateways |
| Last Task -> End Event | 52-62px | |
| Parallel branches | Aligned vertically | Same X for split tasks |

---

## Decision Gateway Pattern

When a gateway has Yes/No outcomes:

### Right: Yes continues, No branches

```
GOOD: Yes continues right on main line, No goes down
    [Gateway] --Yes--> [Yes Task] --> [Continue]
         |
         +--No--> [End Event or Alternative]
```

### Wrong: Both paths go in different Y-directions from main

```
BAD: Reader has to jump between Y-levels
              [Yes Task]   y=200
                  ^
    [Gateway] ----+-----> [Continue]  y=400
```

---

## Parallel Branch Layout

Parallel branches across lanes should align vertically:

```
                 +--> [IT Architecture: Technical Review]      Lane 3
                 |
    [Split] -----+--> [Info Security: Security Assessment]     Lane 6
                 |
                 +--> [Legal: Regulatory Review]               Lane 5
                 |
    [Join] <-----+----- All complete
```

**Spacing:** Each parallel task sits in its assigned lane. Split and join gateways sit in the coordinating lane.

---

## Revision Loop Pattern

Revision/retry loops should go ABOVE the current element within the lane:

```
Within a lane:
    y=lane_y-30   [Negotiate Terms] <----+
                       |                  | (Negotiate)
                       v                  |
    y=lane_y+40   [Merge] --> [Present] --> [Accepted?] --Yes--> [Execute]
                                                |
    y=lane_y+130                          [Reject End]
```

**Key rules:**
- Loop task ABOVE the main flow within the lane
- "Negotiate/Retry" path goes UP to loop task
- Loop task flows back to merge gateway
- Merge gateway is ON the main flow line
- "No/Reject" paths go DOWN

---

## Element Dimensions

| Element | Width | Height |
|---------|-------|--------|
| Task | 100 | 80 |
| Collapsed Sub-Process | 100 | 80 |
| Gateway | 50 | 50 |
| Event | 36 | 36 |

---

## Timer Label Positioning

Timer boundary event labels MUST be positioned to the RIGHT of the boundary event:

```xml
<!-- Timer at x=316, y=272 -->
<!-- Label at x=316+44=360, y=272+4=276 -->
<bpmndi:BPMNLabel>
  <dc:Bounds x="360" y="276" width="46" height="27" />
</bpmndi:BPMNLabel>
```

---

## Default/Bypass Flows Must Route Around Tasks (CRITICAL)

When a gateway has a default or "no action" flow that skips one or more tasks to reach a downstream merge gateway, that flow **MUST NOT** pass through any task box on the same Y-coordinate.

**Problem:** A straight horizontal flow from gateway to merge at the same Y as the main-line tasks will visually cut through task boxes, making the diagram confusing.

**Solution:** Route the bypass flow ABOVE the topmost task in the branch:

```
y=30        ─────────────────────────── (bypass/default flow)
            ↑                         ↓
y=75   [Gateway]                  [Merge Gateway]
            |                         ↑
y=100       +──→ [Task A] ───────────+
```

Rules:
1. Exit from the **top** of the gateway (y = gateway_y)
2. Route horizontally above all branch tasks (y = topmost_task_y - 30)
3. Enter the **top** of the merge gateway (y = merge_y)
4. Never route a flow through the interior of a task bounding box

---

## Flow Labels Must Not Overlap Task Text (CRITICAL)

Flow label positions must account for adjacent task bounding boxes. A flow label placed between a gateway and a task can visually merge with the task's own label text.

**Problem:** A label at y=82 on a flow entering a task at y=60 (height 80) appears to blend into the task text.

**Solution:** Position flow labels **above the flow line** with enough clearance from the target task's top edge:

```
Label Y ≤ target_task_y - 18
```

For horizontal flows into tasks:
- Place the label at least 18px above the task's top Y-coordinate
- Center the label horizontally between the source and target

---

## Collapsed Sub-Process Fan-Out Pattern

When a process has N independent parallel sub-processes, use this layout:

1. **Start event and parallel gateway** in the coordinating lane (e.g., Automation)
2. **One sub-process per lane** — distribute evenly, no lane has more than 2 elements (SP + End)
3. **Parallel gateway fan-out** — vertical lines from gateway up/down to each lane, then horizontal into the sub-process
4. **L-shaped routing** — vertical segment crosses lane boundaries, horizontal segment stays within the target lane

```
Lane 1:              [SP1] ──→ [End1]
                       ↑
Lane 2:              [SP2] ──→ [End2]
                       ↑
Lane 3:              [SP3] ──→ [End3]
                       ↑
Lane N:  [Start] → [+] → [SPN] ──→ [EndN]
```

Rules:
- Never put more than 1 sub-process in a single lane (prevents overcrowding)
- Never have a start event with multiple outgoing flows and no gateway (ambiguous — looks sequential)
- Empty lanes are wasted space — redistribute elements to fill all lanes

---

## Validation Checklist

Before saving any BPMN file:

1. [ ] **No backward flows** -- All sequence flows move left-to-right (except explicit loops)
2. [ ] **Tasks in correct lanes** -- Each task's Y-position falls within its assigned lane
3. [ ] **Cross-lane routing is vertical** -- No diagonal flows crossing 2+ lanes
4. [ ] **Loops go ABOVE** -- Revision/retry paths above main flow
5. [ ] **"No" exceptions go DOWN** -- Rejection/archive paths below
6. [ ] **Parallel branches align** -- Equal X for split tasks in different lanes
7. [ ] **Consistent spacing** -- 30-65px between elements
8. [ ] **Timer labels to the RIGHT** -- Not overlapping parent task
9. [ ] **Merge gateways on main line** -- All paths converge properly
10. [ ] **"Yes" paths continue right** -- Stay on the forward flow
11. [ ] **Default/bypass flows route around tasks** -- No flow cuts through a task bounding box
12. [ ] **Flow labels clear of task text** -- Label Y ≤ target_task_y - 18
13. [ ] **One sub-process per lane** -- No lane overcrowded with multiple SPs

---

## Why This Matters

**Human visual processing:**
- Eyes naturally scan left-to-right
- Backward flows break comprehension and require visual backtracking
- Vertical lane boundaries create natural groupings
- Consistent spacing enables pattern recognition

**The test:** Can someone unfamiliar with the process trace any path from start to end by following left-to-right flow? If not, refactor.

---

**Rule Version**: 1.1.0
**Created**: 2026-03-02 | **Updated**: 2026-03-03
**Source**: Adapted from ACMOS change management visual clarity standards for SLA multi-lane governance
