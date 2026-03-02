# BPMN Modeling Standards (MANDATORY)

**THIS IS A MANDATORY RULE. Violations are unacceptable.**

These standards ensure consistent, non-executable (documentation-only), and maintainable BPMN process models across the SLA Governance Platform. All models target **Camunda 7** and are `isExecutable="false"` — they are governance documentation artifacts, not deployed workflows.

## SLA-Specific Conventions

### Phase Boundary Patterns

The 7-phase governance lifecycle (Phase 0–6) uses intermediate throw events as phase transition markers. Every phase transition MUST be represented as a named intermediate throw event:

```xml
<bpmn:intermediateThrowEvent id="Event_P0_Complete" name="Idea Inception&#10;Complete">
  <bpmn:incoming>Flow_ToP0Complete</bpmn:incoming>
  <bpmn:outgoing>Flow_ToP1Start</bpmn:outgoing>
</bpmn:intermediateThrowEvent>
```

Phase transition naming convention:
- `"Phase {N} Complete"` or `"{Phase Name}&#10;Complete"` for phase-end events
- `"Phase {N} Start"` or `"{Phase Name}&#10;Initiated"` for phase-entry events

### Governance Swim Lane Conventions

All SLA governance processes use exactly these 7 swim lanes (use these IDs and names consistently):

| Lane ID | Lane Name | Primary Responsibility |
|---------|-----------|----------------------|
| `Lane_SLAGovernanceBoard` | SLA Governance Board | Final approvals, exception authority, policy ownership |
| `Lane_BusinessOwner` | Business Owner | Requirements, UAT, go-live sign-off |
| `Lane_ITArchitecture` | IT Architecture | Solution design, integration, technical review |
| `Lane_Procurement` | Procurement | RFP management, vendor selection, contract administration |
| `Lane_LegalCompliance` | Legal & Compliance | Contract review, regulatory mapping, compliance gates |
| `Lane_InformationSecurity` | Information Security | Security assessment, data classification, risk review |
| `Lane_VendorManagement` | Vendor Management | Vendor onboarding, performance monitoring, SLA enforcement |

Not every process uses all 7 lanes. Include only the lanes relevant to the phase(s) modeled.

### Element ID Naming Convention

| Element Type | Pattern | Example |
|-------------|---------|---------|
| Task (User) | `Task_P[0-6]_[Action]` | `Task_P1_GatherRequirements` |
| Task (Business Rule) | `Task_P[0-6]_[DMNRef]` | `Task_P1_PathwaySelection` |
| Task (Service) | `Service_P[0-6]_[Action]` | `Service_P2_SecurityScan` |
| Gateway (Exclusive) | `Gateway_P[0-6]_[Decision]` | `Gateway_P1_PathwayDecision` |
| Gateway (Parallel) | `Gateway_P[0-6]_[Purpose]` | `Gateway_P2_ParallelReviews` |
| Gateway (Merge) | `Gateway_P[0-6]_[Purpose]Merge` | `Gateway_P2_ReviewsMerge` |
| Start Event | `Event_P[0-6]_Start` | `Event_P1_Start` |
| End Event | `Event_P[0-6]_[Outcome]` | `Event_P1_PathwaySelected` |
| Phase Transition | `Event_P[0-6]_Complete` | `Event_P1_Complete` |
| Timer Boundary | `Timer_P[0-6]_[SLA]` | `Timer_P2_ReviewSLA` |
| Error Boundary | `Error_P[0-6]_[Condition]` | `Error_P3_EscalationNeeded` |
| Intermediate Throw | `Event_P[0-6]_[Milestone]` | `Event_P3_ContractSigned` |
| Lane | `Lane_[RoleName]` | `Lane_BusinessOwner` |
| Subprocess | `Sub_P[0-6]_[Name]` | `Sub_P3_ContractNegotiation` |
| Sequence Flow | `Flow_[Source]_To_[Target]` | `Flow_P1_GatherReqs_To_Gateway` |
| Annotation | `Annotation_[Subject]` | `Annotation_OCC2023_17` |

### DMN BusinessRuleTask References

Business rule tasks that invoke DMN decision tables follow this pattern:

```xml
<bpmn:businessRuleTask id="Task_P1_PathwaySelection"
    name="Determine Governance&#10;Pathway"
    camunda:decisionRef="DMN_PathwaySelection"
    camunda:decisionRefBinding="latest"
    camunda:resultVariable="selectedPathway">
  <bpmn:documentation>
    Invokes DMN_PathwaySelection decision table.
    Inputs: riskScore, requestedAmount, dataClassification, vendorType
    Output: selectedPathway ("fast-track" | "standard" | "enhanced" | "emergency")
  </bpmn:documentation>
  <bpmn:incoming>Flow_ToPathwaySelection</bpmn:incoming>
  <bpmn:outgoing>Flow_FromPathwaySelection</bpmn:outgoing>
</bpmn:businessRuleTask>
```

All 14 DMN tables are documented in `sla-governance-domain.md`. BusinessRuleTask names should reference the decision in plain English; the `camunda:decisionRef` carries the technical ID.

### SLA Timer Boundary Events with ISO 8601 Durations

SLA timers use ISO 8601 duration notation. Standard durations per phase:

| Phase | Task Type | SLA Duration | ISO 8601 |
|-------|-----------|--------------|----------|
| Phase 0 | User Task (intake) | 2 business days | `P2D` |
| Phase 1 | User Task (requirements) | 5 business days | `P5D` |
| Phase 1 | Business Rule Task | 1 hour | `PT1H` |
| Phase 2 | User Task (design review) | 10 business days | `P10D` |
| Phase 2 | Parallel reviews | 15 business days | `P15D` |
| Phase 3 | User Task (contract review) | 30 business days | `P30D` |
| Phase 4 | User Task (UAT) | 15 business days | `P15D` |
| Phase 5 | Monitoring cycle | 90 days | `P90D` |
| Phase 6 | Retirement review | 10 business days | `P10D` |

Timer pattern (non-interrupting for SLA escalation):

```xml
<bpmn:boundaryEvent id="Timer_P2_ReviewSLA"
    name="15-Day Review&#10;SLA"
    cancelActivity="false"
    attachedToRef="Task_P2_ArchitectureReview">
  <bpmn:outgoing>Flow_Timer_P2_ToEscalate</bpmn:outgoing>
  <bpmn:timerEventDefinition>
    <bpmn:timeDuration xsi:type="bpmn:tFormalExpression">P15D</bpmn:timeDuration>
  </bpmn:timerEventDefinition>
</bpmn:boundaryEvent>

<bpmn:endEvent id="Event_P2_ReviewEscalated" name="Review&#10;Escalated">
  <bpmn:incoming>Flow_Timer_P2_ToEscalate</bpmn:incoming>
</bpmn:endEvent>

<bpmn:sequenceFlow id="Flow_Timer_P2_ToEscalate"
    sourceRef="Timer_P2_ReviewSLA" targetRef="Event_P2_ReviewEscalated" />
```

## Timer Boundary Events

### Rule: Every Timer MUST Have an Outgoing Flow

Timer boundary events without outgoing flows are **INVALID**. A timer that triggers but does nothing is a modeling error.

```xml
<!-- WRONG: Timer with no outgoing flow (does nothing) -->
<bpmn:boundaryEvent id="Timer_P1_SLA" name="5-Day SLA"
    cancelActivity="false" attachedToRef="Task_P1_GatherRequirements">
  <bpmn:timerEventDefinition>
    <bpmn:timeDuration>P5D</bpmn:timeDuration>
  </bpmn:timerEventDefinition>
</bpmn:boundaryEvent>

<!-- CORRECT: Timer connects to escalation end event -->
<bpmn:boundaryEvent id="Timer_P1_SLA" name="5-Day&#10;SLA"
    cancelActivity="false" attachedToRef="Task_P1_GatherRequirements">
  <bpmn:outgoing>Flow_Timer_P1_ToEscalate</bpmn:outgoing>
  <bpmn:timerEventDefinition>
    <bpmn:timeDuration xsi:type="bpmn:tFormalExpression">P5D</bpmn:timeDuration>
  </bpmn:timerEventDefinition>
</bpmn:boundaryEvent>
```

### Non-Interrupting vs Interrupting Timers

| Timer Type | `cancelActivity` | Use Case |
|------------|------------------|----------|
| Non-interrupting | `false` | SLA escalation — main process continues |
| Interrupting | `true` | Hard deadline — stops the task |

**Default**: Use non-interrupting (`cancelActivity="false"`) for governance SLA timers.

## Milestone Events

### Rule: Use Intermediate Throw Events for Phase Transitions

Mark phase boundaries with named intermediate throw events. This is especially important in the SLA Governance Platform because phases can span weeks and monitoring requires clear transition points.

```xml
<bpmn:intermediateThrowEvent id="Event_P1_Complete" name="Needs Assessment&#10;Complete">
  <bpmn:incoming>Flow_FromPathwayDecision</bpmn:incoming>
  <bpmn:outgoing>Flow_ToP2</bpmn:outgoing>
</bpmn:intermediateThrowEvent>
```

### Rule: Milestone Events Around Parallel Gateways

When governance requires parallel reviews (e.g., Security + Legal + Architecture in Phase 2), place milestone events bookending the parallel split/join.

## Merge Gateways

### Rule: Merge Gateways Have ONE Unconditional Outgoing Flow

A merge gateway receiving multiple incoming flows MUST have exactly **ONE unconditional outgoing flow**.

```xml
<!-- CORRECT: Pathway merge after optional TOM Alignment -->
<bpmn:exclusiveGateway id="Gateway_P1_PathwayMerge">
  <bpmn:incoming>Flow_FastTrackPath</bpmn:incoming>
  <bpmn:incoming>Flow_StandardPath</bpmn:incoming>
  <bpmn:outgoing>Flow_ToNeedsComplete</bpmn:outgoing>
</bpmn:exclusiveGateway>

<bpmn:sequenceFlow id="Flow_ToNeedsComplete"
    sourceRef="Gateway_P1_PathwayMerge" targetRef="Event_P1_Complete" />
```

## XML Formatting Rules

### Rule: No XML Comment Blocks

Do NOT use `<!-- ... -->` section dividers. Let element names and IDs self-document.

### Rule: No Redundant Gateway Names

When a milestone intermediate throw event exists adjacent to a gateway, do NOT name the gateway. The milestone event carries the semantic label.

### Rule: Omit Default Attribute Values

Do not include `isInterrupting="true"` (default) on start events. Do explicitly include `cancelActivity="false"` for non-interrupting boundary events.

### Rule: Single-Line Namespace Declarations

Match Camunda Modeler output format — single-line `<bpmn:definitions>` with all namespaces:

```xml
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xmlns:camunda="http://camunda.org/schema/1.0/bpmn" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" id="Definitions_[ProcessName]" targetNamespace="http://sla-governance.example.com/bpmn" exporter="Camunda Modeler" exporterVersion="5.42.0">
```

**Target namespace**: `http://sla-governance.example.com/bpmn` (consistent across all SLA processes)

### Rule: No Element-Level Comments

Elements are self-documenting via `id`, `name`, and `<bpmn:documentation>` child elements.

### Rule: All Tasks MUST Have `<bpmn:documentation>`

Governance models serve as process documentation. Every task, gateway, and event MUST include a documentation element explaining its governance purpose, inputs, outputs, and regulatory reference where applicable.

```xml
<bpmn:userTask id="Task_P2_SecurityAssessment" name="Conduct Security&#10;Assessment">
  <bpmn:documentation>
    Information Security reviews the proposed solution against ISO 27001 controls and
    data classification requirements. Produces security risk rating and required controls list.
    Regulatory reference: OCC 2023-17 §III.D (Due Diligence), GDPR Art. 32 (Security of Processing).
    Inputs: solution architecture document, data flow diagram, vendor security questionnaire
    Outputs: security risk rating (Low/Medium/High/Critical), required controls checklist
    SLA: 10 business days (Timer_P2_SecuritySLA)
  </bpmn:documentation>
  <bpmn:incoming>Flow_ToSecurityAssessment</bpmn:incoming>
  <bpmn:outgoing>Flow_FromSecurityAssessment</bpmn:outgoing>
</bpmn:userTask>
```

## Validation Checklist

Before saving any BPMN file, verify:

1. [ ] All timer boundary events have `<bpmn:outgoing>` element
2. [ ] All error boundary events have `<bpmn:outgoing>` element
3. [ ] All outgoing flows connect to valid targets
4. [ ] Non-interrupting timers use `cancelActivity="false"`
5. [ ] No XML comment blocks (section dividers or element labels)
6. [ ] No redundant names on gateways when milestone events exist
7. [ ] All tasks, gateways, and events have `<bpmn:documentation>` elements
8. [ ] Merge gateways have exactly ONE unconditional outgoing flow
9. [ ] Element IDs follow the `Task_P[0-6]_[Action]` naming pattern
10. [ ] Timer durations use ISO 8601 format (P5D, PT1H, P30D, etc.)
11. [ ] Swim lane IDs match the 7 canonical lane IDs
12. [ ] Target namespace is `http://sla-governance.example.com/bpmn`
13. [ ] No default attribute values (omit `isInterrupting="true"`)
14. [ ] Single-line namespace declarations
15. [ ] No comments in BPMNDI section
16. [ ] Parallel branches have 170-180px vertical spacing
17. [ ] Escalation events positioned ~58px right of boundary event center
18. [ ] DI container children grouped immediately after container shape
19. [ ] Phase transition intermediate throw events present at phase boundaries
20. [ ] BusinessRuleTask elements reference `camunda:decisionRef` with DMN table ID

## Visual Layout Standards

### Rule: Consistent Element Sizes

| Element Type | Width | Height |
|--------------|-------|--------|
| Task (User, Service, Business Rule) | 100 | 80 |
| Collapsed Sub-Process | 100 | 80 |
| Gateway | 50 | 50 |
| Event (Start, End, Intermediate) | 36 | 36 |

### Rule: Swim Lane Height Sizing

| Lane Content Density | Lane Height |
|---------------------|-------------|
| Single task row | 160 |
| Two task rows | 230 |
| Three task rows with timers | 300 |

### Rule: Timer Label Positioning

Timer boundary event labels MUST be positioned to the **RIGHT** of the boundary event.

**Formula**: Label x = Boundary event x + 44, Label y = Boundary event y + 4

### Rule: Parallel Branch Vertical Spacing

Maintain **170-180px vertical spacing** between parallel branches for label clarity and timer event room.

### Rule: Escalation Event Positioning

Position escalation end events **50-60px below** the boundary event, **~58px right** of boundary event center-x.

### Rule: All Sequence Flows MUST Go Left-to-Right

NEVER create backwards (right-to-left) sequence flows within a lane row.

### Rule: Sequence Flow Waypoints

Waypoints MUST connect to element edges (right edge of source, left edge of target at center-y).

---

**Rule Version**: 1.0.0
**Created**: 2026-03-01
**Platform**: SLA Governance Platform
**Target Engine**: Camunda 7 (documentation-only, isExecutable="false")
**Adapted from**: rival/.claude/context/bpmn/bpmn-modeling-standards.md v1.9.0
