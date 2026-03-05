# BPMN Hierarchical Sub-Process Modeling (MANDATORY)

**THIS IS A MANDATORY RULE. Violations are unacceptable.**

This standard governs the creation of hierarchical BPMN models using collapsed sub-processes. It was derived from the v5 Onboarding reference model and applies to ALL hierarchical BPMN models in this project.

**Reference model**: `processes/Onboarding-only/onboarding-to-be-ideal-state-v5.bpmn`

---

## Scope and Precedence

This file applies to **hierarchical models** (models using collapsed sub-processes). For **flat multi-lane governance models** (e.g., the 8-phase ESG master), use `bpmn-visual-clarity.md` and `bpmn-governance-standards.md` instead.

Where this file specifies **tighter spacing or smaller gaps** than the flat-model standards, those values apply ONLY within hierarchical model contexts:
- Internal sub-process diagrams (no lanes → tighter layout)
- Top-level orchestrator (collapsed SPs → more compact)

If both files apply to the same element, the flat-model standard takes precedence for elements shared with non-hierarchical contexts (e.g., vendor pool layout).

---

## When to Use Hierarchical Models

Use collapsed sub-processes when a flat model exceeds **15 tasks** or spans **3+ swim lanes**. The hierarchy reduces cognitive overload by showing "what happens when" at the top level, with "who does what" inside each expandable sub-process.

---

## Top-Level Orchestrator Design

### No Swim Lanes at Top Level

The orchestrator shows phases and decisions — NOT role assignments. Remove all `<bpmn:laneSet>` from the top-level process. Role assignment happens INSIDE sub-processes via `camunda:candidateGroups`.

```xml
<!-- CORRECT: No lanes at top level -->
<bpmn:process id="Process_Onboarding_v5" name="Product Management — Software Onboarding (Hierarchical)"
    isExecutable="false" camunda:historyTimeToLive="180">
  <!-- Sub-processes, gateways, events — no laneSet -->
</bpmn:process>
```

### Top-Level Elements

The orchestrator contains ONLY:
- **1 Start Event**
- **N Collapsed Sub-Processes** (one per logical phase)
- **Decision Gateways** between sub-processes (go/no-go gates)
- **Rejection End Events** (one per gateway that can reject)
- **1 Success End Event**
- **Sequence Flows** connecting them left-to-right

NO user tasks, service tasks, or business rule tasks at the top level. ALL work happens inside sub-processes.

### Enterprise Pool Dimensions

```
Pool: x=160, y=80, width=1800, height=290
```

- **Height 290px** — compact orchestrator with space for rejection end events below the main flow
- Main flow Y-center: **y=190** (events at y=172, gateways at y=165, SPs at y=150)
- Rejection end events: **y=262** (below main flow, within pool bounds)
- Pool boundary bottom: y=80+290 = **y=370**

### Collapsed Sub-Process Dimensions

All collapsed sub-processes are **100x80px** — same as standard tasks:

```xml
<bpmndi:BPMNShape id="SP_RequestTriage_di" bpmnElement="SP_RequestTriage" isExpanded="false">
  <dc:Bounds x="290" y="150" width="100" height="80" />
</bpmndi:BPMNShape>
```

### Sub-Process Naming Convention

Use `&#10;` line breaks to keep names compact within the 100x80 collapsed box:

```xml
<bpmn:subProcess id="SP_RequestTriage" name="Request&#10;and Triage">
```

Pattern: `{Action}&#10;{and/or} {Object}` — two lines, each 8-12 characters.

### Top-Level Spacing

| Element Pair | X-Gap |
|-------------|-------|
| Start Event → First SP | 54px (x=256 → x=310) |
| SP → Gateway | 55px (SP end → GW start) |
| Gateway → SP | 55px (GW end → SP start) |
| SP → SP (via gateway) | ~55px each segment |
| Gateway → Gateway | 70-90px (e.g., GW_EvalApproved → merge) |
| Gateway → End Event | 57px |
| Last SP → Gateway | 95px |

---

## Gateway-to-Rejection Pattern

When a decision gateway can reject, the "No" path routes DOWN then RIGHT to a rejection end event:

```
y=190    [SP] → [Gateway] ──Yes──→ [Next SP]
                    │
                    │ No (vertical down)
                    │
y=262               └──────→ [End: Rejected]
```

### Routing Rules

1. Exit from the **bottom** of the gateway (y = gateway_y + 50)
2. Drop **vertically** to y=280 (rejection row)
3. Turn **horizontally right** to the end event
4. End event offset **42-62px right** of the gateway center

```xml
<!-- Example: Gateway rejection L-shape -->
<bpmndi:BPMNEdge id="Flow_v5_4_di" bpmnElement="Flow_v5_4">
  <di:waypoint x="470" y="215" />   <!-- gateway bottom -->
  <di:waypoint x="470" y="280" />   <!-- vertical drop -->
  <di:waypoint x="512" y="280" />   <!-- horizontal to end event -->
</bpmndi:BPMNEdge>
```

### End Event Naming

Use descriptive, outcome-focused names — NOT technical gateway labels:

| CORRECT | WRONG |
|---------|-------|
| `Request&#10;Denied` | `Final&#10;Rejected` |
| `Evaluation&#10;Failed` | `Eval&#10;Rejected` |
| `Vendor&#10;Not Selected` | `Vendor&#10;Rejected` |
| `Software&#10;Onboarded` | `Process&#10;Complete` |

---

## Bypass Flow Pattern (Build Path Routing)

When a gateway sends a flow that SKIPS multiple elements to reach a downstream sub-process, route the bypass ABOVE the main flow:

```
y=120    ─────────────────────────── (bypass "Yes/Build" flow)
         ↑                         ↓
y=190    [GW_BuyVsBuild] ──No──→ [SP_EvalDD] → ... → [SP_ContractBuild]
```

### Routing Rules

1. Exit from the **top** of the gateway (y = gateway_y)
2. Route horizontally **above** all skipped elements (y=120)
3. Enter the **top** of the target **merge gateway** (not directly into the SP)
4. Label positioned centered on the horizontal segment

```xml
<!-- Build path bypass: up, across, down to merge gateway -->
<bpmndi:BPMNEdge id="Flow_v5_7_di" bpmnElement="Flow_v5_7">
  <di:waypoint x="750" y="165" />    <!-- gateway top -->
  <di:waypoint x="750" y="120" />    <!-- up to bypass level -->
  <di:waypoint x="1270" y="120" />   <!-- horizontal across -->
  <di:waypoint x="1270" y="165" />   <!-- down to merge gateway -->
</bpmndi:BPMNEdge>
```

### Merge Gateway Before Sub-Process

When multiple paths converge before entering a sub-process, use a **merge gateway** at the top level. The bypass flow and the normal flow both target the merge gateway, which has a single outgoing flow to the sub-process:

```
y=120    ─────────── Yes (Build bypass) ───────────┐
         ↑                                         ↓
y=190    [GW_BuyVsBuild] ──No──→ ... → [GW_EvalApproved] ──Yes──→ [Merge GW] → [SP_ContractBuild]
```

```xml
<bpmn:exclusiveGateway id="Gateway_0gh936r">
  <bpmn:incoming>Flow_v5_12</bpmn:incoming>   <!-- Eval Approved: Yes -->
  <bpmn:incoming>Flow_v5_7</bpmn:incoming>    <!-- Build bypass -->
  <bpmn:outgoing>Flow_1oux8e4</bpmn:outgoing> <!-- to SP_ContractBuild -->
</bpmn:exclusiveGateway>
```

The merge gateway has **NO name** (structural purpose only) and sits at the same Y as the main flow.

---

## Vendor Pool at Top Level

The Vendor pool is EXPANDED (not collapsed) at the top level, showing all vendor tasks. This preserves cross-organizational boundary visibility essential for governance.

### Vendor Pool Dimensions

```
Pool: x=160, y=490, width=1800, height=360
```

- **Inter-pool gap**: 120px (Enterprise bottom y=370 → Vendor top y=490). This exceeds the 100px minimum from `bpmn-visual-clarity.md` and provides ample room for message flow labels in both routing channels.
- Vendor main flow Y-center: **y=630** (tasks at y=590, events at y=612, gateways at y=605)
- Vendor parallel branches: **100px vertical spacing** (y=530, 630, 730)
- Vendor rejection end events: **y=730** (below main flow)

### Message Flow Routing Through Inter-Pool Gap

4-waypoint L-shape through the gap between pools. Use **two horizontal routing channels** in the gap to prevent message flows from crossing:

```
Enterprise pool (bottom at y=370):
   [SP element] ──┐ (exit from bottom, y = SP_y + 80 = 230)
                   │ (vertical down into gap)
y=430 ────────────├─── Enterprise→Vendor channel ────┐
y=470 ────────────│─── Vendor→Enterprise channel ──┐ │
                   │                                │ │
Vendor pool (top at y=490):                         │ │
                   │              ┌─────────────────┘ │
                   │              │    ┌──────────────┘
                   │         [Vendor Task]
```

**Channel convention**:
- **y=430**: Enterprise-to-Vendor flows (requests going OUT — DDRequest, ContractDraft)
- **y=470**: Vendor-to-Enterprise flows (responses coming IN — VendorResponse, SignedContract)

This separation prevents message flow lines from crossing each other in the inter-pool gap.

```xml
<!-- Enterprise → Vendor message flow (y=430 channel) -->
<bpmndi:BPMNEdge id="MsgFlow_DDRequest_di" bpmnElement="MsgFlow_DDRequest">
  <di:waypoint x="860" y="230" />    <!-- SP bottom edge -->
  <di:waypoint x="860" y="430" />    <!-- down to outbound channel -->
  <di:waypoint x="240" y="430" />    <!-- horizontal in gap -->
  <di:waypoint x="240" y="612" />    <!-- down to vendor element -->
</bpmndi:BPMNEdge>

<!-- Vendor → Enterprise message flow (y=470 channel) -->
<bpmndi:BPMNEdge id="MsgFlow_VendorResponse_di" bpmnElement="MsgFlow_VendorResponse">
  <di:waypoint x="620" y="590" />    <!-- vendor task top edge -->
  <di:waypoint x="620" y="470" />    <!-- up to inbound channel -->
  <di:waypoint x="900" y="470" />    <!-- horizontal in gap -->
  <di:waypoint x="900" y="230" />    <!-- up to SP bottom edge -->
</bpmndi:BPMNEdge>
```

### Message Flows Connect to Sub-Process Boundaries

At the top level, message flows connect to the COLLAPSED sub-process shape (not to internal tasks). The sub-process acts as the message endpoint:

```xml
<bpmn:messageFlow id="MsgFlow_DDRequest" sourceRef="SP_EvalDD" targetRef="Start_VendorEngagement" />
```

---

## Internal Sub-Process Diagram Conventions

### Separate BPMNDiagram Per Sub-Process

Every collapsed sub-process MUST have its own `<bpmndi:BPMNDiagram>` with a `<bpmndi:BPMNPlane>` referencing the sub-process element:

```xml
<bpmndi:BPMNDiagram id="BPMNDiagram_SP1">
  <bpmndi:BPMNPlane id="BPMNPlane_SP1" bpmnElement="SP_RequestTriage">
    <!-- All internal shapes and edges -->
  </bpmndi:BPMNPlane>
</bpmndi:BPMNDiagram>
```

### Independent Coordinate Spaces

Each internal diagram uses its OWN coordinate space starting near x=150-180. Coordinates are NOT relative to the top-level diagram.

- Internal start events: **x=180**, y varies by diagram
- Elements progress left-to-right from x=180

### Internal Start/End Events

- **Start events**: No name attribute (bare `<bpmn:startEvent id="SP1_Start">`)
- **End events**: Named only when the outcome is meaningful (e.g., "Triage Complete", "Software Leveraged")
- **SLA escalation end events**: Named with SLA context (e.g., "Triage SLA&#10;Escalation")

### Internal Element Spacing

Internal sub-process diagrams use tighter spacing than flat multi-lane models (which use 60-65px per `bpmn-visual-clarity.md`). This is appropriate because internal diagrams have no lane boundaries to cross.

| Element Pair | Gap |
|-------------|-----|
| Task → Task | **60px** (task end x+100 → next task x) |
| Start → First Task | **54px** (event x+36 → task x) |
| Last Task → End Event | **62px** (task x+100 → event x) |
| Gateway → Task | **55px** |
| Task → Gateway | **55px** |

---

## Internal Layout Patterns

### Pattern A: Two-Level Branching (SP1 — Request & Triage)

When a gateway creates a bypass vs. main processing path:

```
y=200    [Start] → [Review] → [GW Bypass?] ──Yes──→ [Leverage] → [End_Leveraged]
                                    │
                                    │ No (drops down)
                                    │
y=360                               └──→ [Gather] → [Submit] → [Triage] → [End]
                                                                    │timer
y=460                                                           [SLA Breach End]
```

- **Bypass path** stays on the UPPER Y-level (forward flow)
- **Main processing path** drops to a LOWER Y-level (~160px below)
- Timer boundary events attach to the last task on the lower path
- SLA escalation end events positioned BELOW the timer (~100px)
- Vertical gap between levels: **160px**

### Pattern B: Bypass Below Main Flow (SP2 — Planning & Routing)

When a gateway's "No" path skips a task to reach a merge gateway:

```
y=140    [Start] → [Prelim] → [GW Needs?] ──Yes──→ [Backlog] → [Merge] → [Routing] → [End]
                                    │                             ↑
y=220                               └─────── No ─────────────────┘
                                    (routes UNDER main flow)
```

- "No" bypass exits from gateway **bottom**, routes horizontally below tasks, enters merge gateway **bottom**
- Vertical drop: ~80px below main flow
- Merge gateway has NO name (structural purpose only)

```xml
<!-- Bypass routes under: down, across, back up -->
<bpmndi:BPMNEdge id="Flow_SP2_No_di" bpmnElement="Flow_SP2_No">
  <di:waypoint x="416" y="165" />   <!-- gateway bottom -->
  <di:waypoint x="416" y="220" />   <!-- down -->
  <di:waypoint x="674" y="220" />   <!-- horizontal under -->
  <di:waypoint x="674" y="165" />   <!-- back up to merge -->
</bpmndi:BPMNEdge>
```

### Pattern C: Parallel Fan-Out (SP3 — Evaluation & DD)

5 parallel branches spread vertically from a center split gateway:

```
y=80     [Tech Arch Review]          → ↘
y=183    [Security Assessment]       → →
y=291    [Risk, Compliance, Legal]   → → [Join] → [Vendor DD] → [Await] → [Evaluate] → [End]
y=399    [Financial Analysis]        → ↗              │timer
y=500    [Assess Vendor Landscape]   → ↗           [SLA Breach]
          ↑                            ↑
     [Split GW at y=306]        [Join GW at y=306]
```

Rules:
- Split and join gateways centered vertically among branches (y=306 for 5 branches spanning y=80-540)
- **~100-110px vertical spacing** between branches (tighter than the 170-180px used in flat multi-lane models, because internal diagrams have no lane structure)
- Branches fan both UP and DOWN from center
- L-shaped routing: vertical from gateway → horizontal into task
- Post-join flow continues on the center Y-level

### Pattern D: Two-Path Execution (SP4 — Contracting & Build)

Buy vs. Build pathways at two Y-levels:

```
y=282    [Start] → [GW Pathway] ──No(Buy)──→ [Refine] → [PoC] → [TechRisk] → [Negotiate] → [Await] → [Finalize] → [Merge] → [End]
                        │                                                                        │timer      ↑
                        │ Yes(Build)                                                         [SLA Breach]    │
                        │                                                                                    │
y=470                   └──→ [Define Build Reqs] → [SP_PDLC (collapsed)] ────────────────────────────────────┘
```

Rules:
- **Buy path**: continues RIGHT on the UPPER Y-level (y=282) — this is the DEFAULT/primary path
- **Build path**: drops DOWN to lower Y-level (y=470, ~188px below)
- Build merge: long horizontal flow at y=470 then vertical UP to merge gateway
- SP_PDLC is a **nested collapsed sub-process** (sub-process within sub-process), 100x80px
- Merge gateway has NO name

### Pattern E: Linear Sequential (SP5 — UAT & Go-Live)

Simple left-to-right flow with consistent spacing:

```
y=200    [Start] → [UAT] → [Approval] → [Onboard] → [Notify] → [Close] → [End]
```

- All elements on single Y-level
- 60px gap between tasks
- sendTask used for "Notify Requester" (not userTask)
- Start at x=180, End at x=1072

---

## Timer + SLA Breach Pattern Inside Sub-Processes

Two timer patterns are used inside sub-processes:

### Pattern 1: Boundary Timer (Preferred for Receive Tasks)

Boundary timers attach to tasks that wait for external responses (receive tasks, long-running user tasks):

```xml
<!-- Boundary timer on receive task -->
<bpmn:boundaryEvent id="Timer_VendorResponseSLA" name="5 Day&#10;SLA"
    cancelActivity="false" attachedToRef="Receive_VendorResponse">
  <bpmn:outgoing>Flow_SP3_SLA</bpmn:outgoing>
  <bpmn:timerEventDefinition>
    <bpmn:timeDuration xsi:type="bpmn:tFormalExpression">P5D</bpmn:timeDuration>
  </bpmn:timerEventDefinition>
</bpmn:boundaryEvent>
```

### Pattern 2: Standalone Intermediate Catch Timer

For SLA timers that monitor a task but are not structurally attached (e.g., when the timer tracks the overall sub-process rather than a single task), use an intermediate catch event positioned visually below the monitored task:

```xml
<bpmn:intermediateCatchEvent id="Timer_TriageSLA" name="2 Day&#10;SLA">
  <bpmn:outgoing>Flow_SP1_SLA</bpmn:outgoing>
  <bpmn:timerEventDefinition>
    <bpmn:timeDuration xsi:type="bpmn:tFormalExpression">P2D</bpmn:timeDuration>
  </bpmn:timerEventDefinition>
</bpmn:intermediateCatchEvent>
```

### Visual Layout

- Timer: positioned at bottom-right of parent task
- SLA breach end event: **below and to the right** of the timer
- Flow: L-shaped (vertical down from timer, horizontal right to end event)
- Timer label: **to the right** of the timer icon, below

```xml
<!-- Timer → SLA Breach L-shape -->
<bpmndi:BPMNEdge id="Flow_SP3_SLA_di" bpmnElement="Flow_SP3_SLA">
  <di:waypoint x="916" y="389" />    <!-- timer bottom -->
  <di:waypoint x="916" y="440" />    <!-- vertical drop -->
  <di:waypoint x="1009" y="440" />   <!-- horizontal to end -->
</bpmndi:BPMNEdge>
```

---

## Nested Sub-Processes (Sub-Process within Sub-Process)

When a sub-process contains another collapsed sub-process (e.g., SP_PDLC inside SP_ContractBuild):

1. The nested SP is defined INLINE within the parent SP's `<bpmn:subProcess>` element
2. The nested SP has its own `<bpmndi:BPMNDiagram>` at the file level
3. The nested SP's DI shape uses `isExpanded="false"`
4. The nested SP is 100x80px (same as tasks)

```xml
<!-- In parent SP's process definition -->
<bpmn:subProcess id="SP_ContractBuild" name="Contracting&#10;and Build">
  <!-- ... other elements ... -->
  <bpmn:subProcess id="SP_PDLC" name="Product Development&#10;Life Cycle">
    <!-- SP_PDLC internal elements -->
  </bpmn:subProcess>
</bpmn:subProcess>

<!-- In DI section: shape in parent's diagram -->
<bpmndi:BPMNDiagram id="BPMNDiagram_SP4">
  <bpmndi:BPMNPlane bpmnElement="SP_ContractBuild">
    <bpmndi:BPMNShape id="SP_PDLC_di" bpmnElement="SP_PDLC" isExpanded="false">
      <dc:Bounds x="530" y="430" width="100" height="80" />
    </bpmndi:BPMNShape>
  </bpmndi:BPMNPlane>
</bpmndi:BPMNDiagram>

<!-- Separate diagram for nested SP internals -->
<bpmndi:BPMNDiagram id="BPMNDiagram_PDLC">
  <bpmndi:BPMNPlane bpmnElement="SP_PDLC">
    <!-- PDLC internal shapes -->
  </bpmndi:BPMNPlane>
</bpmndi:BPMNDiagram>
```

---

## Loop-Back Pattern Inside Sub-Processes

When a gateway sends a "No/Retry" flow back to an earlier element (e.g., PDLC test failure):

```
y=120    ←──────────────── No ──────────────────┐
         ↓                                      ↑
y=200    [ArchReview] → [Merge] → [Dev] → [Test] → [GW Tests?] ──Yes──→ [Integration] → [End]
```

Rules:
- Loop flows route ABOVE the main flow (y=120, above main at y=200)
- Exit from **top** of gateway, go LEFT, enter **top** of merge gateway
- Loop target is always a MERGE GATEWAY (not directly into a task)
- 4 waypoints: up, left, left, down

```xml
<bpmndi:BPMNEdge id="Flow_PDLC_No_di" bpmnElement="Flow_PDLC_No">
  <di:waypoint x="870" y="175" />   <!-- gateway top -->
  <di:waypoint x="870" y="120" />   <!-- up -->
  <di:waypoint x="450" y="120" />   <!-- left (above main flow) -->
  <di:waypoint x="450" y="175" />   <!-- down to merge gateway -->
</bpmndi:BPMNEdge>
```

---

## BPMNDiagram ID Uniqueness (CRITICAL)

Every `<bpmndi:BPMNShape>` `id` attribute MUST be globally unique across ALL diagrams in the file. The convention is `{elementId}_di`.

When a file has N BPMNDiagrams, each shape ID appears in EXACTLY ONE diagram — the diagram whose `bpmnElement` matches the shape's parent process/sub-process.

### Common Error

If a generator script extracts the "main diagram" from a source file, it may accidentally extract ALL shapes (including those belonging to sub-process internals), creating duplicate `_di` IDs. Always verify:

```bash
# Check for duplicate shape IDs
grep -o 'id="[^"]*_di"' file.bpmn | sort | uniq -d
# Should return EMPTY
```

---

## Conditional Flow Labels in Hierarchical Context

At the top level, gateway "Yes"/"No" labels follow the standard convention:
- **"Yes" continues** the main forward flow (right)
- **"No" branches** to rejection (down) or alternative path

For the "Do we Build?" gateway:
- **"Yes" = Build** (drops down to Build sub-process path)
- **"No" = Buy** (continues right to Evaluation & DD)

This may seem counterintuitive, but it preserves the convention that "Yes" answers the gateway question affirmatively.

---

## File Structure Order

The BPMN file should be organized in this order:

1. `<bpmn:collaboration>` — participants and message flows
2. `<bpmn:process id="Process_Enterprise">` — enterprise top-level
   - Start event, end events
   - Gateways
   - Sub-processes (each containing internal elements inline)
   - Top-level sequence flows
3. `<bpmn:process id="Process_Vendor">` — vendor process
4. `<bpmndi:BPMNDiagram id="BPMNDiagram_Main">` — top-level orchestrator DI
5. `<bpmndi:BPMNDiagram id="BPMNDiagram_SP1">` — SP1 internal DI
6. `<bpmndi:BPMNDiagram id="BPMNDiagram_SP2">` — SP2 internal DI
7. ... (one per sub-process, in order)
8. `<bpmndi:BPMNDiagram id="BPMNDiagram_PDLC">` — nested SP diagrams last

---

## Validation Checklist

Before saving any hierarchical BPMN file:

### Top-Level Orchestrator
- [ ] No laneSet at top level
- [ ] All sub-processes have `isExpanded="false"` in DI
- [ ] Each sub-process has its own BPMNDiagram
- [ ] Enterprise pool height ~290px (compact orchestrator)
- [ ] Rejection end events at y=262 (below main flow)
- [ ] Bypass flows route ABOVE main flow
- [ ] "No" rejection flows use L-shape (down then right)

### Internal Diagrams
- [ ] Independent coordinate spaces (start at x=180)
- [ ] 60px gap between tasks
- [ ] Parallel branches: ~100px vertical spacing
- [ ] Loop-back flows route ABOVE main flow
- [ ] Timer + SLA breach: L-shape routing
- [ ] Internal start events have NO name
- [ ] Merge gateways have NO name

### Inter-Pool and Message Flows
- [ ] Inter-pool gap ≥ 120px (Enterprise bottom to Vendor top)
- [ ] Enterprise→Vendor message flows route at y=430 (upper channel)
- [ ] Vendor→Enterprise message flows route at y=470 (lower channel)
- [ ] No message flow lines cross each other in the gap
- [ ] Merge gateways used where multiple paths converge before a SP

### Structural Integrity
- [ ] Zero duplicate `_di` IDs across all diagrams
- [ ] Every collapsed SP has exactly one BPMNDiagram
- [ ] Message flows reference SP IDs (not internal task IDs) at top level
- [ ] Vendor pool expanded with full task visibility
- [ ] All documentation and camunda:properties preserved on tasks

---

**Version**: 1.1.0 | **Created**: 2026-03-05 | **Updated**: 2026-03-05
**Source**: Extracted from user's manual Camunda Modeler edits to onboarding-to-be-ideal-state-v5.bpmn
