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

## Multi-Lane Layout (7 Governance Swim Lanes)

SLA governance models use 7 swim lanes. Each lane is 160px tall:

| Lane | Y-Start | Y-End | candidateGroups |
|------|---------|-------|-----------------|
| Governance Board | 0 | 160 | `sla-governance-board` |
| Business Owner | 160 | 320 | `business-owner` |
| IT Architecture | 320 | 480 | `it-architecture` |
| Procurement | 480 | 640 | `procurement` |
| Legal & Compliance | 640 | 800 | `legal-compliance` |
| Information Security | 800 | 960 | `information-security` |
| Vendor Management | 960 | 1120 | `vendor-management` |

### Element Positioning Within Lanes

Tasks should be centered vertically within their assigned lane:

| Lane | Task Y-Position | Gateway Y-Position | Event Y-Position |
|------|----------------|-------------------|-----------------|
| Governance Board | 40 | 55 | 62 |
| Business Owner | 200 | 215 | 222 |
| IT Architecture | 360 | 375 | 382 |
| Procurement | 520 | 535 | 542 |
| Legal & Compliance | 680 | 695 | 702 |
| Information Security | 840 | 855 | 862 |
| Vendor Management | 1000 | 1015 | 1022 |

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

---

## Why This Matters

**Human visual processing:**
- Eyes naturally scan left-to-right
- Backward flows break comprehension and require visual backtracking
- Vertical lane boundaries create natural groupings
- Consistent spacing enables pattern recognition

**The test:** Can someone unfamiliar with the process trace any path from start to end by following left-to-right flow? If not, refactor.

---

**Rule Version**: 1.0.0
**Created**: 2026-03-02
**Source**: Adapted from ACMOS change management visual clarity standards for SLA multi-lane governance
