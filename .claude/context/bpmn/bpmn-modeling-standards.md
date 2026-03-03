# BPMN Modeling Standards (MANDATORY)

**THIS IS A MANDATORY RULE. Violations are unacceptable.**

These standards ensure consistent, non-executable (documentation-only), and maintainable BPMN process models across the SLA Governance Platform. All models target **Camunda Platform 7** and are `isExecutable="false"` — they are governance documentation artifacts, not deployed workflows.

## SLA-Specific Conventions

### Process Identity

| Attribute | Value |
|-----------|-------|
| Process ID | `ESG-E2E-Master-v4.0` |
| Target Engine | Camunda Platform 7 |
| Executable | `false` (documentation-only) |
| History TTL | `camunda:historyTimeToLive="180"` |
| Pool count | 2 (Enterprise Governance + Vendor/Third Party) |
| Lane count | 9+1 |

### Phase Boundary Patterns

The 8-phase governance lifecycle uses intermediate throw events as phase transition markers. Every phase transition MUST be represented as a named intermediate throw event following this 4-step pattern:

1. Completion gateway (all phase tasks done?)
2. Quality gate — BusinessRuleTask referencing applicable DMN
3. Approval user task (appropriate authority signs off)
4. Phase transition intermediate throw event

```xml
<bpmn:intermediateThrowEvent id="Event_Phase1_Complete" name="Initiation and Intake&#10;Complete">
  <bpmn:incoming>Flow_ToPhase1Complete</bpmn:incoming>
  <bpmn:outgoing>Flow_ToPhase2Start</bpmn:outgoing>
</bpmn:intermediateThrowEvent>
```

Phase transition naming convention:
- `"{Phase Name}&#10;Complete"` for phase-end events
- `"{Phase Name}&#10;Initiated"` or `"Start&#10;{Phase Name}"` for phase-entry events

### Governance Swim Lane Conventions

All SLA governance processes use exactly these 9+1 swim lanes. Use these candidateGroups values consistently:

#### Enterprise Governance Pool (8 lanes)

| Lane Name | candidateGroups | RACI Role | Three Lines |
|-----------|----------------|-----------|-------------|
| Business | `business-lane` | Business Owner (1st Line) | 1st |
| Governance | `governance-lane` | Risk & Governance (2nd Line) | 2nd |
| Contracting | `contracting-lane` | Legal (1st/2nd Line) | 1st/2nd |
| Technical Assessment | `technical-assessment` | Cybersecurity (2nd Line) | 2nd |
| AI Review | `ai-review` | AI Governance (2nd Line) | 2nd |
| Compliance | `compliance-lane` | Compliance (2nd Line) | 2nd |
| Oversight | `oversight-lane` | Internal Audit (3rd Line) | 3rd |
| Automation | `automation-lane` | Service Provider / BPM Engine (1st Line) | 1st |

#### Vendor / Third Party Pool (1 lane)

| Lane Name | candidateGroups |
|-----------|----------------|
| Vendor Response | `vendor-response` |

Not every process uses all lanes. Include only the lanes relevant to the phase(s) modeled.

### Element ID Naming Convention

| Element Type | Pattern | Example |
|-------------|---------|---------|
| Task (User) | `Task_[Phase]_[N]_[Action]` | `Task_1_1_InitiativeRequest` |
| Task (Business Rule) | `Task_[Phase]_[N]_[DMNRef]` | `Task_2_3_RiskTierClassification` |
| Task (Service) | `Service_[Phase]_[N]_[Action]` | `Service_3_1_AutomatedScan` |
| Gateway (Exclusive) | `Gateway_[Phase]_[Decision]` | `Gateway_2_RiskTierDecision` |
| Gateway (Parallel Split) | `Gateway_[Phase]_[Purpose]Split` | `Gateway_3_AssessmentSplit` |
| Gateway (Parallel Join) | `Gateway_[Phase]_[Purpose]Join` | `Gateway_3_AssessmentJoin` |
| Gateway (Merge) | `Gateway_[Phase]_[Purpose]Merge` | `Gateway_3_AssessmentMerge` |
| Start Event | `Event_Phase[N]_Start` | `Event_Phase1_Start` |
| End Event (Terminal) | `End_Retired` / `End_Terminated` / `End_Rejected` | `End_Rejected` |
| Phase Transition | `Event_Phase[N]_Complete` | `Event_Phase2_Complete` |
| Timer Boundary | `Timer_Phase[N]_[Task]SLA` | `Timer_Phase3_ReviewSLA` |
| Error Boundary | `Error_Phase[N]_[Condition]` | `Error_Phase4_EscalationNeeded` |
| Intermediate Throw | `Event_Phase[N]_[Milestone]` | `Event_Phase3_DueDiligenceComplete` |
| Lane | `Lane_[RoleName]` | `Lane_Business` |
| Sub-Process | `SP-Phase[N]-[Name]` or `SP-Cross-[N]` | `SP-Phase3-DueDiligence` |
| Sequence Flow | `Flow_[Source]_To_[Target]` | `Flow_Task_2_3_To_Gateway` |
| Annotation | `Annotation_[Subject]` | `Annotation_OCC2023_17` |

### DMN BusinessRuleTask References

Business rule tasks that invoke DMN decision tables follow this pattern. Use `camunda:decisionRefBinding="latest"` and `camunda:mapDecisionResult="singleResult"`:

```xml
<bpmn:businessRuleTask id="Task_2_3_RiskTierClassification"
    name="Risk Tier&#10;Classification"
    camunda:decisionRef="DMN_RiskTierClassification"
    camunda:decisionRefBinding="latest"
    camunda:resultVariable="riskTier"
    camunda:mapDecisionResult="singleResult">
  <bpmn:incoming>Flow_ToRiskTier</bpmn:incoming>
  <bpmn:outgoing>Flow_FromRiskTier</bpmn:outgoing>
</bpmn:businessRuleTask>
```

All 8 canonical DMN table IDs are documented in `sla-governance-domain.md`. BusinessRuleTask names should reference the decision in plain English; the `camunda:decisionRef` carries the technical ID.

**Valid DMN table IDs** (use only these 8):
- `DMN_RiskTierClassification`
- `DMN_PathwayRouting`
- `DMN_GovernanceReviewRouting`
- `DMN_AutomationTierAssignment`
- `DMN_AgentConfidenceEscalation`
- `DMN_ChangeRiskScoring`
- `DMN_VulnerabilityRemediationRouting`
- `DMN_MonitoringCadenceAssignment`

### User Task Lane Assignment

Every governance task MUST specify `camunda:candidateGroups` matching one of the 9 valid candidateGroups values:

```xml
<bpmn:userTask id="Task_4_1_GovernanceReview"
    name="Governance&#10;Review"
    camunda:candidateGroups="governance-lane">
  <bpmn:incoming>Flow_ToGovernanceReview</bpmn:incoming>
  <bpmn:outgoing>Flow_FromGovernanceReview</bpmn:outgoing>
</bpmn:userTask>
```

**Valid candidateGroups values**: `business-lane`, `governance-lane`, `contracting-lane`, `technical-assessment`, `ai-review`, `compliance-lane`, `oversight-lane`, `automation-lane`, `vendor-response`

### SLA Timer Boundary Events with ISO 8601 Durations

SLA timers use ISO 8601 duration notation. Standard durations per phase:

| Phase | Standard SLA | ISO 8601 |
|-------|-------------|----------|
| Phase 1: Initiation and Intake | 2 days | `P2D` |
| Phase 2: Planning and Risk Scoping | 5 days | `P5D` |
| Phase 3: Due Diligence | 8 days | `P8D` |
| Phase 4: Governance Review | 5 days | `P5D` |
| Phase 5: Contracting | 7 days | `P7D` |
| Phase 6: SDLC | 15 days | `P15D` |
| Phase 7: Deployment | 3 days | `P3D` |
| Phase 8: Operations (review tasks) | Business Rule Task: 2 hours | `PT2H` |

Task-level SLA durations per task type:

| Task Type | SLA Duration | ISO 8601 |
|-----------|-------------|----------|
| Business Rule Task | 2 hours | `PT2H` |
| User Task (Review) | 1 day | `P1D` |
| User Task (Approval) | 2 days | `P2D` |
| Sub-process (Assessment) | 5 days | `P5D` |

Timer pattern (non-interrupting for SLA escalation):

```xml
<bpmn:boundaryEvent id="Timer_Phase3_ReviewSLA"
    name="8-Day&#10;SLA"
    cancelActivity="false"
    attachedToRef="SP-Phase3-DueDiligence">
  <bpmn:outgoing>Flow_Timer_Phase3_ToEscalate</bpmn:outgoing>
  <bpmn:timerEventDefinition>
    <bpmn:timeDuration xsi:type="bpmn:tFormalExpression">P8D</bpmn:timeDuration>
  </bpmn:timerEventDefinition>
</bpmn:boundaryEvent>

<bpmn:endEvent id="Event_Phase3_ReviewEscalated" name="Review&#10;Escalated">
  <bpmn:incoming>Flow_Timer_Phase3_ToEscalate</bpmn:incoming>
</bpmn:endEvent>

<bpmn:sequenceFlow id="Flow_Timer_Phase3_ToEscalate"
    sourceRef="Timer_Phase3_ReviewSLA" targetRef="Event_Phase3_ReviewEscalated" />
```

## Timer Boundary Events

### Rule: Every Timer MUST Have an Outgoing Flow

Timer boundary events without outgoing flows are **INVALID**. A timer that triggers but does nothing is a modeling error.

```xml
<!-- WRONG: Timer with no outgoing flow (does nothing) -->
<bpmn:boundaryEvent id="Timer_Phase1_SLA" name="2-Day SLA"
    cancelActivity="false" attachedToRef="Task_1_1_InitiativeRequest">
  <bpmn:timerEventDefinition>
    <bpmn:timeDuration>P2D</bpmn:timeDuration>
  </bpmn:timerEventDefinition>
</bpmn:boundaryEvent>

<!-- CORRECT: Timer connects to escalation end event -->
<bpmn:boundaryEvent id="Timer_Phase1_SLA" name="2-Day&#10;SLA"
    cancelActivity="false" attachedToRef="Task_1_1_InitiativeRequest">
  <bpmn:outgoing>Flow_Timer_Phase1_ToEscalate</bpmn:outgoing>
  <bpmn:timerEventDefinition>
    <bpmn:timeDuration xsi:type="bpmn:tFormalExpression">P2D</bpmn:timeDuration>
  </bpmn:timerEventDefinition>
</bpmn:boundaryEvent>
```

### Non-Interrupting vs Interrupting Timers

| Timer Type | `cancelActivity` | Use Case |
|------------|-----------------|----------|
| Non-interrupting | `false` | SLA tracking — main process continues |
| Interrupting | `true` | Error conditions — stops the task |

**Default**: Use non-interrupting (`cancelActivity="false"`) for governance SLA timers.

## Milestone Events

### Rule: Use Intermediate Throw Events for Phase Transitions

Mark phase boundaries with named intermediate throw events. Place milestone events before split gateways and after join gateways. Naming: `"Start {Phase}"` or `"{Phase} Complete"`.

```xml
<bpmn:intermediateThrowEvent id="Event_Phase2_Complete" name="Planning and Risk&#10;Scoping Complete">
  <bpmn:incoming>Flow_FromPhase2Approval</bpmn:incoming>
  <bpmn:outgoing>Flow_ToPhase3Start</bpmn:outgoing>
</bpmn:intermediateThrowEvent>
```

### Rule: Milestone Events Around Parallel Gateways

When governance requires parallel assessments (e.g., Technical Assessment + AI Review + Compliance in Phase 3), place milestone events bookending the parallel split/join.

## Merge Gateways

### Rule: Merge Gateways Have ONE Unconditional Outgoing Flow and NO Name

A merge gateway receiving multiple incoming flows MUST have exactly **ONE unconditional outgoing flow** and MUST NOT have a name attribute.

```xml
<!-- CORRECT: Unnamed merge gateway with single outgoing flow -->
<bpmn:exclusiveGateway id="Gateway_3_AssessmentMerge">
  <bpmn:incoming>Flow_TechAssessmentComplete</bpmn:incoming>
  <bpmn:incoming>Flow_AIReviewComplete</bpmn:incoming>
  <bpmn:incoming>Flow_ComplianceComplete</bpmn:incoming>
  <bpmn:outgoing>Flow_ToGovernanceReview</bpmn:outgoing>
</bpmn:exclusiveGateway>

<bpmn:sequenceFlow id="Flow_ToGovernanceReview"
    sourceRef="Gateway_3_AssessmentMerge" targetRef="Event_Phase3_Complete" />
```

**Key distinction**: Decision gateway = 1 in, multiple conditional out. Merge gateway = multiple in, 1 unconditional out.

## Conditional Flow Labels

All conditional flows MUST have Yes/No labels with `<bpmn:conditionExpression>`:

```xml
<bpmn:sequenceFlow id="Flow_RiskUnacceptable" name="Unacceptable"
    sourceRef="Gateway_2_RiskTierDecision" targetRef="End_Rejected">
  <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">#{riskTier == 'Unacceptable'}</bpmn:conditionExpression>
</bpmn:sequenceFlow>
```

Label positioning: Horizontal flows — above (y - 18). Vertical flows — beside the segment.

## Regulatory Text Annotations

Every governance process MUST include text annotations for applicable regulations. Associate annotations with the relevant tasks using `<bpmn:association>`:

```xml
<bpmn:textAnnotation id="Annotation_OCC2023_17">
  <bpmn:text>OCC 2023-17: Third-party risk management due diligence requirements</bpmn:text>
</bpmn:textAnnotation>
<bpmn:association id="Association_OCC2023_17"
  sourceRef="Task_3_1_VendorDueDiligence"
  targetRef="Annotation_OCC2023_17" />
```

Applicable frameworks per phase:

| Framework | When Required | Phases |
|-----------|--------------|--------|
| OCC 2023-17 | Vendor management processes | 2, 3, 5 |
| SR 11-7 | Model risk / AI governance | 2, 3, 4 |
| SOX | Financial controls and approvals | 5, 6 |
| GDPR/CCPA | Data processing, classification | 2, 5, 8 |
| EU AI Act | AI system governance | 2, 3, 4 |
| DORA | Digital operational resilience | 5, 8 |
| NIST CSF 2.0 | Cybersecurity framework | 3, 7, 8 |
| ISO 27001 | Information security management | 3, 6, 8 |
| SEC 17a-4 | Records retention | 5, 8 |
| BCBS d577 | Operational resilience | 3, 8 |
| FS AI RMF | Financial services AI risk | 2, 3, 4 |

## Activity Element Types

**Rule: Use `<bpmn:userTask>` for all governance activities, NOT `<bpmn:callActivity>`.**

Call activities render with a thick double-line border and collapse marker in Camunda Modeler.
User tasks render as standard thin-bordered rectangles matching the reference models.

For documentation-only orchestration models, use userTask with candidateGroups:

```xml
<bpmn:userTask id="Task_Phase1_Intake"
    name="Phase 1: Initiation&#10;and Intake"
    camunda:candidateGroups="business-lane">
  <bpmn:incoming>Flow_ToIntake</bpmn:incoming>
  <bpmn:outgoing>Flow_FromIntake</bpmn:outgoing>
</bpmn:userTask>
```

## XML Formatting Rules

### Rule: No XML Comment Blocks

Do NOT use `<!-- ... -->` section dividers or element labels. Let element names and IDs self-document.

### Rule: No Redundant Gateway Names

When a milestone intermediate throw event exists adjacent to a gateway, do NOT name the gateway. The milestone event carries the semantic label.

### Rule: Omit Default Attribute Values

Do not include `isInterrupting="true"` (default) on start events. Do explicitly include `cancelActivity="false"` for non-interrupting boundary events.

### Rule: Single-Line Namespace Declarations

Match Camunda Modeler output format — single-line `<bpmn:definitions>` with all namespaces:

```xml
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xmlns:camunda="http://camunda.org/schema/1.0/bpmn" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" id="Definitions_ESGMaster" targetNamespace="http://sla.governance/bpmn" exporter="Camunda Modeler" exporterVersion="5.42.0" camunda:historyTimeToLive="180">
```

**Target namespace**: `http://sla.governance/bpmn` (consistent across all SLA processes)

### Rule: No Element-Level Comments

No XML comments inside `<bpmn:process>` or `<bpmndi:BPMNDiagram>` sections.

## Visual Layout Standards

### Element Dimensions

| Element | Width | Height |
|---------|-------|--------|
| Task (User, Service, Business Rule) | 100 | 80 |
| Collapsed Sub-Process | 100 | 80 |
| Gateway | 50 | 50 |
| Event (Start, End, Intermediate) | 36 | 36 |

### Lane Heights

Each of the 9+1 lanes is 125px tall. Standard positioning within lanes:

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

### Timer Label Positioning

Timer boundary event labels MUST be positioned to the **RIGHT** of the boundary event.

**Formula**: Label x = Boundary event x + 44, Label y = Boundary event y + 4

```xml
<!-- Timer at x=316, y=272 -->
<!-- Label at x=360, y=276 -->
<bpmndi:BPMNLabel>
  <dc:Bounds x="360" y="276" width="46" height="27" />
</bpmndi:BPMNLabel>
```

### Parallel Branch Vertical Spacing

Maintain **170-180px vertical spacing** between parallel branches for label clarity and timer event room.

### All Sequence Flows MUST Go Left-to-Right

NEVER create backward (right-to-left) sequence flows within a lane row. Explicit loops (named "Retry", "Revise", "Negotiate") route ABOVE the main flow and MUST target a merge gateway.

### Waypoint Rules

Waypoints MUST connect to element edges (right edge of source at center-y, left edge of target at center-y).

## Collapsed Subprocesses

Every collapsed subprocess MUST have its own `BPMNDiagram` element with complete DI content:

```xml
<bpmndi:BPMNShape id="SP_Phase3_di" bpmnElement="SP-Phase3-DueDiligence" isExpanded="false">
  <dc:Bounds x="240" y="397" width="100" height="80" />
</bpmndi:BPMNShape>

<!-- Separate diagram for internals -->
<bpmndi:BPMNDiagram id="BPMNDiagram_Phase3">
  <bpmndi:BPMNPlane bpmnElement="SP-Phase3-DueDiligence">
    <!-- Internal element shapes and edges -->
  </bpmndi:BPMNPlane>
</bpmndi:BPMNDiagram>
```

## Validation Checklist

Before saving any BPMN file, verify:

**Visual Layout**
- [ ] All flows left-to-right within lanes (no backward flows)
- [ ] Cross-lane flows use vertical routing (no diagonals)
- [ ] Task dimensions 100x80, parallel spacing 170-180px
- [ ] Timer labels to the RIGHT of boundary events (x + 44, y + 4)
- [ ] No overlapping elements (> 5% overlap threshold)

**Process Logic**
- [ ] All boundary events have `<bpmn:outgoing>`
- [ ] Non-interrupting timers: `cancelActivity="false"`
- [ ] Merge gateways: ONE unconditional outgoing, NO name attribute
- [ ] Multiple flows to a task go through a merge gateway
- [ ] Conditional flows have labels with `<bpmn:conditionExpression>`
- [ ] Phase boundary pattern: completion → quality gate → approval → transition

**Governance**
- [ ] All candidateGroups from the 9 valid values (business-lane, governance-lane, contracting-lane, technical-assessment, ai-review, compliance-lane, oversight-lane, automation-lane, vendor-response)
- [ ] All decisionRef from the 8 valid DMN table IDs (DMN_RiskTierClassification, DMN_PathwayRouting, DMN_GovernanceReviewRouting, DMN_AutomationTierAssignment, DMN_AgentConfidenceEscalation, DMN_ChangeRiskScoring, DMN_VulnerabilityRemediationRouting, DMN_MonitoringCadenceAssignment)
- [ ] Regulatory annotations present for applicable frameworks
- [ ] `camunda:decisionRefBinding="latest"` on all BusinessRuleTask elements
- [ ] `camunda:historyTimeToLive="180"` on process definition

**XML Formatting**
- [ ] No comments in BPMN or DI sections
- [ ] No default attribute values
- [ ] Every collapsed subprocess has its own BPMNDiagram
- [ ] Exporter metadata present (exporter="Camunda Modeler")
- [ ] Target namespace is `http://sla.governance/bpmn`
- [ ] Element IDs follow naming patterns above

---

**Rule Version**: 2.0.0
**Created**: 2026-03-01
**Updated**: 2026-03-03
**Platform**: SLA Governance Platform
**Target Engine**: Camunda Platform 7 (documentation-only, isExecutable="false")
**Changes in v2.0**: Updated for 8-phase schema (Phases 1-8). Replaced 7 lanes with 9+1 lanes and current candidateGroups. Updated targetNamespace to http://sla.governance/bpmn. Removed bpmn:documentation mandate (not enforced). Added camunda:historyTimeToLive and camunda:decisionRefBinding="latest". Replaced old DMN IDs with 8 canonical IDs. Removed Phase 0. Updated element ID patterns and lane positioning table.
