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

Do NOT embed conditions in gateway expressions. Use business rule tasks referencing the 14 governance DMN tables.

```xml
<!-- CORRECT: DMN-driven routing -->
<bpmn:businessRuleTask id="Task_DecidePathway"
  name="Select Governance Pathway"
  camunda:decisionRef="DMN_PathwaySelection"
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
| Task | 100 | 80 |
| Collapsed Sub-Process | 100 | 80 |
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
  <dc:Bounds x="240" y="178" width="100" height="80" />
</bpmndi:BPMNShape>

<!-- Separate diagram for internals -->
<bpmndi:BPMNDiagram id="BPMNDiagram_Sub">
  <bpmndi:BPMNPlane bpmnElement="SubProcess">
    <!-- Internal element shapes and edges -->
  </bpmndi:BPMNPlane>
</bpmndi:BPMNDiagram>
```

## Validation Checklist

**Visual Layout**

- [ ] All flows left-to-right within lanes (no backward flows)
- [ ] Cross-lane flows use vertical routing
- [ ] Task dimensions 100x80, parallel spacing 170-180px
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
- [ ] All candidateGroups from the 7 valid SLA groups
- [ ] All decisionRef from the 14 valid DMN table IDs

**XML Formatting**

- [ ] No comments in BPMN or DI sections
- [ ] No default attribute values
- [ ] Every collapsed subprocess has BPMNDiagram
- [ ] Exporter metadata present

---

**Version**: 1.0.0 | **Created**: 2026-03-02
**Source**: Consolidated from SLA governance standards and ACMOS modeling best practices
