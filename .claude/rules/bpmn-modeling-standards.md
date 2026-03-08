# BPMN Modeling Standards (MANDATORY)

**THIS IS A MANDATORY RULE. Violations are unacceptable.**

## Timer Boundary Events

**Rule: Every Timer MUST Have an Outgoing Flow**

Timer boundary events without outgoing flows are **INVALID**.

```xml
<bpmn:boundaryEvent id="BoundaryEvent_SLA" name="2 Hour&#10;SLA"
    cancelActivity="false" attachedToRef="Task_Example">
  <bpmn:outgoing>Flow_ToEscalation</bpmn:outgoing>
  <bpmn:timerEventDefinition>
    <bpmn:timeDuration xsi:type="bpmn:tFormalExpression">PT2H</bpmn:timeDuration>
  </bpmn:timerEventDefinition>
</bpmn:boundaryEvent>
```

| Timer Type | `cancelActivity` | Use Case |
|------------|-----------------|----------|
| Non-interrupting | `false` | SLA tracking -- main process continues |
| Interrupting | `true` | Error conditions -- stops the task |

**Default**: Use `cancelActivity="false"` for SLA timers.

## Boundary Timers on Receive Tasks (Camunda 8 / Zeebe)

**Rule: Wrap receive tasks in an expanded sub-process when attaching boundary timers**

In Camunda 8 (Zeebe), boundary timer events on receive tasks require a sub-process wrapper. The receive task goes inside an expanded sub-process, and the boundary timers attach to the sub-process — not the receive task directly.

```xml
<!-- Sub-process wrapping the receive task -->
<bpmn:subProcess id="SP_AwaitResponse">
  <bpmn:incoming>Flow_In</bpmn:incoming>
  <bpmn:outgoing>Flow_Out</bpmn:outgoing>
  <bpmn:startEvent id="SP_Start">
    <bpmn:outgoing>Flow_ToReceive</bpmn:outgoing>
  </bpmn:startEvent>
  <bpmn:receiveTask id="Receive_Response" name="Await&#10;Response" messageRef="Message_Ref">
    <bpmn:incoming>Flow_ToReceive</bpmn:incoming>
    <bpmn:outgoing>Flow_ToEnd</bpmn:outgoing>
  </bpmn:receiveTask>
  <bpmn:endEvent id="SP_End">
    <bpmn:incoming>Flow_ToEnd</bpmn:incoming>
  </bpmn:endEvent>
  <bpmn:sequenceFlow id="Flow_ToReceive" sourceRef="SP_Start" targetRef="Receive_Response" />
  <bpmn:sequenceFlow id="Flow_ToEnd" sourceRef="Receive_Response" targetRef="SP_End" />
</bpmn:subProcess>

<!-- Timers attach to the SUB-PROCESS, not the receive task -->
<bpmn:boundaryEvent id="Timer_SLA" cancelActivity="false" attachedToRef="SP_AwaitResponse">
  <bpmn:outgoing>Flow_ToEscalation</bpmn:outgoing>
  <bpmn:timerEventDefinition>
    <bpmn:timeDuration xsi:type="bpmn:tFormalExpression">P5D</bpmn:timeDuration>
  </bpmn:timerEventDefinition>
</bpmn:boundaryEvent>
```

### Visual Layout

The expanded sub-process provides more room for boundary timers than a 100px-wide task:

```
[Expanded Sub-Process: 390x140px]
┌──────────────────────────────────────────┐
│ (Start) → [Receive Task: 100x80] → (End)│
└──────────────────────────────────────────┘
   ⏱D3        ⏱D7        ⏱D11       ⏱SLA
   │           │           │           │
   ↓           ↓           ↓           └→ [SLA Breach End]
 [Send D3]  [Send D7]   [Send D11]
   │           │           │
  (End)      (End)       (End)
```

**Spacing**: With a ~390px-wide sub-process, space timers at ~130px intervals along the bottom edge. Each timer drops straight down to its service task. SLA breach routes down-right via L-shape to an end event to the RIGHT of the sub-process.

**Why not attach directly?** Camunda Modeler enforces this pattern for Zeebe-targeted models. Direct boundary timers on receive tasks may cause deployment errors.

## Phase Transition Events

**Rule: Use Intermediate Throw Events for Phase Transitions**

Place milestone events before split gateways and after join gateways. Naming: `"Start {Phase}"` or `"{Phase} Complete"`.

```xml
<bpmn:intermediateThrowEvent id="Event_StartDueDiligence" name="Start&#10;Due Diligence">
  <bpmn:incoming>Flow_From</bpmn:incoming>
  <bpmn:outgoing>Flow_ToSplit</bpmn:outgoing>
</bpmn:intermediateThrowEvent>
```

## Phase Boundary Pattern (SLA-SPECIFIC)

**Rule: Every phase transition MUST follow this pattern:**

1. **Completion Gateway** -- All phase tasks done?
2. **Quality Gate** -- Compliance checks pass?
3. **Approval User Task** -- Appropriate authority signs off?
4. **Phase Transition Event** -- Signal next phase

```xml
<!-- 1. Completion check -->
<bpmn:exclusiveGateway id="Gateway_PhaseComplete" name="Phase Complete?">
  <bpmn:incoming>Flow_LastTask</bpmn:incoming>
  <bpmn:outgoing>Flow_Yes_ToQualityGate</bpmn:outgoing>
  <bpmn:outgoing>Flow_No_BackToTasks</bpmn:outgoing>
</bpmn:exclusiveGateway>

<!-- 2. Quality gate -->
<bpmn:businessRuleTask id="Task_QualityGate"
  name="Compliance Quality Gate"
  camunda:decisionRef="DMN_ComplianceGate"
  camunda:resultVariable="gateResult"
  camunda:mapDecisionResult="singleResult">
  <bpmn:incoming>Flow_Yes_ToQualityGate</bpmn:incoming>
  <bpmn:outgoing>Flow_ToApproval</bpmn:outgoing>
</bpmn:businessRuleTask>

<!-- 3. Approval -->
<bpmn:userTask id="Task_PhaseApproval"
  name="Phase Approval"
  camunda:candidateGroups="sla-governance-board">
  <bpmn:incoming>Flow_ToApproval</bpmn:incoming>
  <bpmn:outgoing>Flow_ToTransition</bpmn:outgoing>
</bpmn:userTask>

<!-- 4. Phase transition -->
<bpmn:intermediateThrowEvent id="Event_PhaseTransition" name="Phase&#10;Transition">
  <bpmn:incoming>Flow_ToTransition</bpmn:incoming>
  <bpmn:outgoing>Flow_ToNextPhase</bpmn:outgoing>
</bpmn:intermediateThrowEvent>
```

## DMN-First Design (SLA-SPECIFIC)

**Rule: Every XOR gateway with business logic MUST reference a DMN table**

Do NOT embed conditions in gateway expressions. Use business rule tasks referencing the 8 governance DMN tables.

```xml
<!-- CORRECT: DMN-driven routing -->
<bpmn:businessRuleTask id="Task_DecidePathway"
  name="Select Governance Pathway"
  camunda:decisionRef="DMN_PathwayRouting"
  camunda:resultVariable="selectedPathway"
  camunda:mapDecisionResult="singleResult" />

<!-- WRONG: Embedded condition -->
<bpmn:conditionExpression>${riskScore > 7 && vendorTier == 'critical'}</bpmn:conditionExpression>
```

## Merge Gateways

**Rules:**

1. Merge gateways have exactly **ONE unconditional outgoing flow**
2. Merge gateways have **NO name attribute**
3. Multiple flows to a task MUST go through a merge gateway first

```xml
<!-- CORRECT -->
<bpmn:exclusiveGateway id="gateway_merge">
  <bpmn:incoming>flow_a</bpmn:incoming>
  <bpmn:incoming>flow_b</bpmn:incoming>
  <bpmn:outgoing>flow_to_next</bpmn:outgoing>
</bpmn:exclusiveGateway>
```

**Key distinction**: Decision gateway = 1 in, multiple conditional out. Merge gateway = multiple in, 1 unconditional out.

## Conditional Flow Labels

**Rule: All Conditional Flows MUST Have Yes/No Labels**

```xml
<bpmn:sequenceFlow id="flow_yes" name="Yes" sourceRef="gateway" targetRef="task">
  <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">#{condition}</bpmn:conditionExpression>
</bpmn:sequenceFlow>
```

Label positioning: Horizontal flows -- above (y - 18). Vertical flows -- beside the segment.

## Regulatory Annotations (SLA-SPECIFIC)

**Rule: Every governance process MUST include text annotations for applicable regulations**

| Regulation | When Required | Phases |
|-----------|--------------|--------|
| OCC 2023-17 | Vendor management processes | 2, 3, 5 |
| SR 11-7 | Model risk / AI governance | 2 |
| SOX | Financial controls and approvals | 3 |
| GDPR / CCPA | Data processing, classification | 2 |
| EU AI Act | AI system governance | 2 |
| DORA | Digital operational resilience | 5 |

```xml
<bpmn:textAnnotation id="TextAnnotation_OCC">
  <bpmn:text>OCC 2023-17: Third-party risk management due diligence requirements</bpmn:text>
</bpmn:textAnnotation>
<bpmn:association id="Association_OCC"
  sourceRef="Task_VendorAssessment"
  targetRef="TextAnnotation_OCC" />
```

## SLA Escalation Pattern

| Task Type | SLA Duration | Escalation |
|-----------|-------------|------------|
| Business Rule Task | PT2H | End Event |
| User Task (Review) | P1D | End Event |
| User Task (Approval) | P2D | End Event |
| Sub-process (Assessment) | P5D | End Event |

Timer names: Use `&#10;` for line breaks (e.g., `"2 Hour&#10;SLA"`).

## Activity Element Types

**Rule: Use `<bpmn:userTask>` for all governance activities, NOT `<bpmn:callActivity>`.**

Call activities render with a thick double-line border and collapse marker in Camunda Modeler.
User tasks render as standard thin-bordered rectangles matching the reference models.

For documentation-only orchestration models, use userTask with candidateGroups:
```xml
<bpmn:userTask id="Task_PhaseX" name="Phase X: ..."
    camunda:candidateGroups="lane-group">
```

## XML Formatting Rules

1. **No XML comment blocks** -- Camunda Modeler strips them
2. **No redundant gateway names** when milestone events exist
3. **Omit default attributes** (`isInterrupting="true"`, etc.)
4. **Single-line namespace declarations** (Camunda Modeler format)
5. **No element-level comments** in process or DI sections

## Camunda Modeler Canonical Serialization

When BPMN files are saved through Camunda Modeler (Desktop or Web), the Modeler re-serializes the XML with its own conventions. **Accept these normalizations** — do not fight the Modeler's formatting:

| Convention | Modeler Behavior | Example |
|-----------|-----------------|---------|
| **Attribute order** | `name` before `default` | `name="Approved?" default="Flow_No"` |
| **Indentation** | Consistent depth per nesting level | Extension elements at 10 spaces inside tasks |
| **Entity encoding** | `&#38;` for ampersands, `&gt;` for greater-than in FEEL | `Q&#38;A` not `Q&amp;A`; `&gt;=` not `>=` in expressions |
| **Default attribute stripping** | Removes `cancelActivity="true"` from interrupting timers | Only `cancelActivity="false"` appears explicitly |
| **Trailing whitespace** | No space before `>` in self-closing tags | `targetRef="Task_X">` not `targetRef="Task_X" >` |
| **Element ordering** | Modeler's canonical order (may differ from hand-edited order) | Start events, flows, gateways, sub-processes reordered |
| **Internal SP edge grouping** | Edges for elements inside an expanded sub-process are placed INSIDE the parent `BPMNShape` block in the DI section, not at the end | SP_QAPhase edges appear right after SP_QAPhase shapes |
| **Exporter version** | Updated to match Modeler version | `exporterVersion="5.42.0"` |

### Timer Label Positioning (Modeler Convention)

When boundary timers are attached to the bottom edge of an expanded sub-process, the Modeler positions timer labels **below** the timer icon (y + 34), not beside it:

```xml
<!-- Timer at y=372, label at y=406 (below) -->
<bpmndi:BPMNShape id="Timer_Reminder_di" bpmnElement="Timer_Reminder">
  <dc:Bounds x="1992" y="372" width="36" height="36" />
  <bpmndi:BPMNLabel>
    <dc:Bounds x="2026" y="406" width="48" height="27" />
  </bpmndi:BPMNLabel>
</bpmndi:BPMNShape>
```

This differs from the earlier convention of labels beside timers (same y). Accept the Modeler's below-timer positioning.

### Multi-Outcome Gateway End Event Spread

When an XOR gateway routes to 3+ end events, space them with **~100px vertical gaps** to prevent label overlap:

```
y=182    [End: Approved]            (gateway y=275, offset -93)
y=282    [End: Approved Conditional] (gateway y=275, offset +7)
y=382    [End: Rejected]            (gateway y=275, offset +107)
y=480    [Task: Revise Brief]       (gateway y=275, offset +205, remediation path)
```

**Rule**: After manual Modeler edits, the resulting diff will show massive reordering/reformatting. This is expected. Focus PR review on **semantic changes** (new elements, rerouted flows, removed elements) not formatting noise.

## Visual Layout Standards

### Left-to-Right Within Lane Principle (CRITICAL)

Keep ALL sequence flows moving **LEFT-TO-RIGHT** within each swim lane.

```
y=lane    [Start] -> [Task] -> [Gateway] -> [Task] -> [End]
                        |
y=above        [Loop Task] (loops go above)
                        |
y=below        [Exception End] (rejections go below)
```

### Element Sizes

| Element | Width | Height |
|---------|-------|--------|
| Task | 140 | 80 |
| Collapsed Sub-Process | 140 | 80 |
| Gateway | 50 | 50 |
| Event | 36 | 36 |

### Flow Rules

1. **All flows go left-to-right** (no backward flows except explicit loops)
2. Parallel branches: 170-180px vertical spacing
3. Escalation events: 50px below boundary event
4. Timer labels: Position to the RIGHT (x + 44, y + 4)
5. Waypoints connect to element edges, not floating
6. Cross-lane flows use vertical segments at lane boundaries

## Collapsed Subprocesses

**Rule: Use collapsed subprocesses for parallel patterns and complex routing**

Every collapsed subprocess MUST have its own `BPMNDiagram` element with complete DI content.

```xml
<bpmndi:BPMNShape id="SubProcess_di" bpmnElement="SubProcess" isExpanded="false">
  <dc:Bounds x="240" y="178" width="140" height="80" />
</bpmndi:BPMNShape>

<!-- Separate diagram for internals -->
<bpmndi:BPMNDiagram id="BPMNDiagram_Sub">
  <bpmndi:BPMNPlane bpmnElement="SubProcess">
    <!-- Internal element shapes and edges -->
  </bpmndi:BPMNPlane>
</bpmndi:BPMNDiagram>
```

## Camunda Process Attributes

**Rule: Every process definition MUST include `camunda:historyTimeToLive`**

```xml
<bpmn:process id="Process_ESG_Master" name="Enterprise Software Governance"
    isExecutable="false" camunda:historyTimeToLive="180">
```

**Rule: DMN references SHOULD include `camunda:decisionRefBinding="latest"`**

```xml
<bpmn:businessRuleTask id="Task_RiskTier"
  name="Risk Tier Assignment"
  camunda:decisionRef="DMN_RiskTierClassification"
  camunda:decisionRefBinding="latest"
  camunda:resultVariable="riskTier"
  camunda:mapDecisionResult="singleResult" />
```

## Service Task Pattern

**Rule: Use `bpmn:serviceTask` with `camunda:type="external"` for Automation lane tasks**

Automation lane activities that represent automated processing (not human decisions) use external service tasks:

```xml
<bpmn:serviceTask id="Task_AutoScan" name="Automated Security Scan"
  camunda:type="external" camunda:topic="security-scan">
```

Use `bpmn:userTask` for all governance activities involving human judgment.

## Error Boundary Events

Error boundary events are always interrupting per BPMN 2.0 spec. Do NOT set `cancelActivity` on error boundaries — the default (`true`) is correct and mandatory.

```xml
<bpmn:boundaryEvent id="Boundary_Error" attachedToRef="SubProcess_Phase3">
  <bpmn:outgoing>Flow_ToErrorHandler</bpmn:outgoing>
  <bpmn:errorEventDefinition id="ErrorDef_1" />
</bpmn:boundaryEvent>
```

## Signal Events for Phase Transitions

Signal events enable cross-process communication for phase transitions and emergency cessation:

```xml
<bpmn:signal id="Signal_EmergencyCessation" name="EmergencyCessation" />

<bpmn:endEvent id="End_Terminated" name="Emergency&#10;Termination">
  <bpmn:signalEventDefinition signalRef="Signal_EmergencyCessation" />
</bpmn:endEvent>
```

## Message Flow Between Pools

Message flows connect the Enterprise Governance pool to the Vendor/Third Party pool:

```xml
<bpmn:messageFlow id="MsgFlow_RFP" name="RFP / Due Diligence Request"
  sourceRef="SP_Phase3_DueDiligence" targetRef="Participant_VendorThirdParty" />
```

Rules:
- Message flows cross pool boundaries only (never within a pool)
- Label message flows with the document/data being exchanged
- Use intermediate message events for synchronous vendor responses

## Terminate End Event

Terminate end events stop all active tokens in the current scope:

- **In a sub-process**: Terminates all parallel branches within that sub-process only
- **At top level**: Terminates the entire process instance

Use for emergency cessation patterns (compliance breach, security incident).

## Multi-Instance Tasks

For parallel reviews across multiple assessors (e.g., vendor reviews), use multi-instance:

```xml
<bpmn:userTask id="Task_ParallelReview" name="Assessor Review">
  <bpmn:multiInstanceLoopCharacteristics isSequential="false"
    camunda:collection="assessorList" camunda:elementVariable="assessor" />
</bpmn:userTask>
```

## DMN-First Clarification

Reading DMN output variables in `conditionExpression` is acceptable — the business logic lives in the DMN table, and the gateway simply routes based on the result:

```xml
<!-- ACCEPTABLE: Gateway reads DMN output variable -->
<bpmn:sequenceFlow id="Flow_HighRisk" name="High Risk">
  <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">${riskTier == 'High'}</bpmn:conditionExpression>
</bpmn:sequenceFlow>

<!-- WRONG: Business logic embedded directly -->
<bpmn:conditionExpression>${riskScore > 7 && vendorTier == 'critical'}</bpmn:conditionExpression>
```

## Gateway Naming Convention

**Rule: Decision gateways MUST use question-style names ending with "?"**

```xml
<!-- CORRECT: Question-style -->
<bpmn:exclusiveGateway id="GW_Approved" name="Approved ?" />
<bpmn:exclusiveGateway id="GW_BuildOrBuy" name="Do we Build ?" />

<!-- WRONG: Statement-style -->
<bpmn:exclusiveGateway id="GW_Decision" name="Triage Decision" />
<bpmn:exclusiveGateway id="GW_PathSelect" name="Buy vs. Build" />
```

**Merge gateways and parallel gateways MUST NOT have name attributes.** They serve structural purposes, not decision purposes. Naming them adds visual noise.

```xml
<!-- CORRECT -->
<bpmn:exclusiveGateway id="GW_Merge" />
<bpmn:parallelGateway id="GW_Split" />

<!-- WRONG -->
<bpmn:exclusiveGateway id="GW_Merge" name="Merge Paths" />
<bpmn:parallelGateway id="GW_Split" name="Parallel Evaluation" />
```

## Conditional Flow Label Convention

**Rule: All conditional sequence flows MUST use "Yes" / "No" labels**

Do NOT use action-specific labels like "Approve"/"Reject", "Build"/"Buy", or "Pass"/"Fail". These couple the label to the specific decision context, making the pattern inconsistent across the model.

```xml
<!-- CORRECT -->
<bpmn:sequenceFlow id="Flow_Yes" name="Yes" sourceRef="GW_Approved" targetRef="Task_Next">
  <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">${approved}</bpmn:conditionExpression>
</bpmn:sequenceFlow>
<bpmn:sequenceFlow id="Flow_No" name="No" sourceRef="GW_Approved" targetRef="End_Rejected">
  <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">${!approved}</bpmn:conditionExpression>
</bpmn:sequenceFlow>

<!-- WRONG -->
<bpmn:sequenceFlow id="Flow_Approve" name="Approve" ... />
<bpmn:sequenceFlow id="Flow_Reject" name="Reject" ... />
```

The gateway name provides the question context ("Approved?"), and the flows provide the answer ("Yes" / "No"). This creates a natural reading: "Approved? → Yes / No".

**Exception: Multi-value routing gateways** — When an XOR gateway routes to 3+ branches based on enumerated values (e.g., "Baseline" vs "Elevated or Major"), use descriptive value labels instead of "Yes"/"No". For multi-value labels, use `"or"` with `&#10;` line breaks — never use `"/"` as a separator:

```xml
<!-- CORRECT: "or" with line break -->
<bpmn:sequenceFlow id="Flow_Elevated" name="Elevated or&#10;Major" ... />

<!-- WRONG: "/" separator -->
<bpmn:sequenceFlow id="Flow_Elevated" name="Elevated/Major" ... />
```

**Why?** The "/" character is visually ambiguous — it can look like a path separator or abbreviation. "or" with a line break is unambiguous and fits within BPMN label bounding boxes.

## Cross-Lane Notification Pattern

**Rule: Before process end events, notify the initiating lane**

When a process starts in one lane (e.g., Requester) but the final activities occur in a different lane (e.g., Product Management), add a notification task back to the initiating lane before the end event. The end event should be placed in the initiating lane.

```xml
<!-- Pattern: Notify originator before closing -->
<bpmn:userTask id="Task_NotifyRequester" name="Notify&#10;Requester"
  camunda:candidateGroups="requester-lane">
  <bpmn:incoming>Flow_FromLastTask</bpmn:incoming>
  <bpmn:outgoing>Flow_ToEnd</bpmn:outgoing>
</bpmn:userTask>

<bpmn:endEvent id="End_Complete" name="Process&#10;Complete">
  <bpmn:incoming>Flow_ToEnd</bpmn:incoming>
</bpmn:endEvent>
```

This ensures:
1. The process initiator knows the outcome
2. The end event appears in the same lane as the start event (visual symmetry)
3. No silent completion in a lane the requester cannot see

## Regulatory Annotation Approach

**Preferred: Use `camunda:properties` extension elements instead of `bpmn:textAnnotation`**

Text annotations consume visual space in the diagram and can clutter multi-lane models. For regulatory references, embed them as Camunda properties on the relevant task:

```xml
<bpmn:userTask id="Task_VendorAssessment" name="Vendor Assessment">
  <bpmn:extensionElements>
    <camunda:properties>
      <camunda:property name="regulation" value="OCC 2023-17: Third-party risk management" />
      <camunda:property name="regulation2" value="DORA: Digital operational resilience" />
    </camunda:properties>
  </bpmn:extensionElements>
</bpmn:userTask>
```

This keeps regulatory traceability without adding 9+ text annotations and associations to the DI layer.

**Exception**: For master-level governance models (e.g., ESG-E2E-Master), text annotations are acceptable because they serve an educational/documentation purpose.

## Validation Checklist

**Visual Layout**

- [ ] All flows left-to-right within lanes (no backward flows)
- [ ] Cross-lane flows use vertical routing
- [ ] Task dimensions 140x80, parallel spacing 170-180px
- [ ] Timer labels to the RIGHT of boundary events

**Process Logic**

- [ ] All boundary events have `<bpmn:outgoing>`
- [ ] Non-interrupting timers: `cancelActivity="false"`
- [ ] Merge gateways: ONE unconditional outgoing, NO name
- [ ] Multiple flows to task go through merge gateway
- [ ] Conditional flows have Yes/No labels with BPMNLabel
- [ ] DMN-first: Business logic in DMN tables, not gateway conditions

**Governance**

- [ ] Phase boundary pattern: completion -> quality gate -> approval -> transition
- [ ] Regulatory annotations present (OCC 2023-17, SR 11-7, etc.)
- [ ] All candidateGroups from the 9+1 valid lane groups (business-lane, governance-lane, contracting-lane, technical-assessment, ai-review, compliance-lane, oversight-lane, automation-lane, vendor-response)
- [ ] All decisionRef from the 8 valid DMN table IDs (DMN_RiskTierClassification, DMN_PathwayRouting, DMN_GovernanceReviewRouting, DMN_AutomationTierAssignment, DMN_AgentConfidenceEscalation, DMN_ChangeRiskScoring, DMN_VulnerabilityRemediationRouting, DMN_MonitoringCadenceAssignment)

**XML Formatting**

- [ ] No comments in BPMN or DI sections
- [ ] No default attribute values
- [ ] Every collapsed subprocess has BPMNDiagram
- [ ] Exporter metadata present

---

**Version**: 1.1.0 | **Created**: 2026-03-02 | **Updated**: 2026-03-05
**Source**: Consolidated from SLA governance standards and ACMOS modeling best practices
