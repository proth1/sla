# BPMN Testing Standards — SLA Governance Platform

All BPMN process models in the SLA Governance Platform MUST follow these testing standards. Because all models are documentation-only (`isExecutable="false"`), testing focuses on **structural validation** and **BDD scenario coverage** rather than runtime execution.

## CRITICAL Requirements

### Mandatory Test Coverage

Every BPMN governance process MUST have:
- [ ] **Happy path test scenario**: Primary governance flow from start event to successful end event
- [ ] **Pathway variant tests**: Separate scenarios for each applicable pathway (Fast-Track, Standard, Enhanced, Emergency)
- [ ] **Error handling test**: Boundary events, escalation flows, and rejection paths
- [ ] **Boundary condition tests**: Edge cases for DMN gateway decisions
- [ ] **Minimum 80% path coverage**: At least 80% of sequence flows included in at least one scenario
- [ ] **Visual validation passed**: No overlapping elements, labels within bounds
- [ ] **Swim lane connectivity**: All flow nodes assigned to exactly one lane

### Documentation-Only Model Constraint

SLA Governance Platform BPMN models are **not deployed to a Camunda engine**. They are governance documentation artifacts. This changes testing requirements:

- **No runtime execution testing** — Camunda Modeler opens and renders the file correctly
- **Structural validation** replaces engine deployment validation
- **Gherkin scenarios** describe the governance process in business language for stakeholder review
- **Path coverage** is calculated from the XML sequence flow graph, not from engine execution logs

## Structural Validation (Phase 1: Pre-Test Gate)

Run XML structure validation before generating test scenarios:

```bash
# Validate BPMN XML well-formedness and element connectivity
node scripts/validate-bpmn-structure.js processes/phase-1/needs-assessment.bpmn

# Check element ID naming convention compliance
node scripts/validate-bpmn-ids.js processes/phase-1/needs-assessment.bpmn

# Detect overlapping DI elements
node scripts/validate-bpmn-visual.js processes/phase-1/needs-assessment.bpmn
```

**Quality Gate**: MUST pass all three before proceeding to BDD scenario generation.

### Structural Validation Criteria

| Check | Rule | Failure Action |
|-------|------|----------------|
| XML well-formedness | File parses without error | Fix XML before proceeding |
| All flow refs valid | `sourceRef` and `targetRef` reference existing element IDs | Fix dangling references |
| Timer boundary outgoing | Every timer boundary has `<bpmn:outgoing>` | Add escalation flow |
| Error boundary outgoing | Every error boundary has `<bpmn:outgoing>` | Add compensation/escalation flow |
| Merge gateway rule | Merge gateways have exactly 1 outgoing flow | Refactor gateway |
| Lane assignment | Every flow node assigned to exactly one lane | Assign to correct lane |
| Documentation present | Every task and gateway has `<bpmn:documentation>` | Add documentation element |
| Phase transition events | Phase-end intermediate throw events present | Add milestone event |
| ID naming compliance | IDs follow `Task_P[0-6]_`, `Gateway_P[0-6]_` patterns | Rename non-compliant IDs |
| DMN references | BusinessRuleTask has `camunda:decisionRef` attribute | Add DMN reference |
| Timer ISO 8601 | Timer durations use valid ISO 8601 format (P5D, PT1H) | Fix duration format |

## Visual Validation (Phase 1.5)

Governance models are reviewed visually by stakeholders and auditors. Visual quality is a compliance requirement.

```bash
# Detect overlapping elements (static analysis — no browser required)
node scripts/validate-bpmn-visual.js processes/phase-1/needs-assessment.bpmn
```

**Visual Validation Criteria**:
- [ ] No overlapping elements (> 5% overlap threshold)
- [ ] Labels within viewport bounds (no off-canvas labels)
- [ ] No truncated labels (element wide enough for name)
- [ ] All sequence flows go left-to-right within a lane row
- [ ] Timer labels positioned to the RIGHT of boundary events
- [ ] Escalation end events within 80px of their boundary event
- [ ] Swim lane heights sufficient for content (no elements touching lane borders)
- [ ] Phase transition intermediate events visible at phase boundaries

## BDD Scenario Generation (Phase 2)

### Gherkin Scenario Patterns for Governance Workflows

#### Happy Path Pattern (Standard Pathway)

```gherkin
Feature: Phase 1 Needs Assessment — Standard Pathway
  As a Business Owner
  I want to complete the Needs Assessment phase
  So that the appropriate governance pathway is selected and resources allocated

  Background:
    Given a governance request ticket has been approved from Phase 0
    And the request is for a Standard pathway (medium risk, $100K-$500K)

  Scenario: Standard pathway — requirements gathered and pathway confirmed
    Given the Business Owner submits a completed requirements document
    When IT Architecture reviews and approves the technical feasibility
    And Vendor Management completes the initial vendor tier assessment
    And the DMN_RiskClassification returns "Medium"
    And the DMN_PathwaySelection returns "standard"
    Then the Needs Assessment phase is marked complete
    And the process transitions to Phase 2 Solution Design
    And the pathway confirmation is recorded in the governance register
```

#### Pathway Variant Pattern (Fast-Track)

```gherkin
  Scenario: Fast-Track pathway — abbreviated assessment to Phase 4
    Given the DMN_RiskClassification returns "Low"
    And the contract value is under $100K
    And no PII data is involved
    And the vendor is pre-approved
    When the DMN_PathwaySelection returns "fast-track"
    Then Phase 2 and Phase 3 are bypassed
    And the process routes directly to Phase 4 Implementation
    And Manager-level approval is required (not Director)
```

#### Emergency Pathway Pattern

```gherkin
  Scenario: Emergency pathway — CxO-sponsored urgent request
    Given a documented urgent business need with regulatory deadline
    And a CxO sponsor has submitted written justification
    When the DMN_PathwaySelection returns "emergency"
    Then the process routes to Phase 4 immediately (expedited)
    And parallel retroactive reviews are scheduled within 30 days
    And the SLA Governance Board receives an immediate notification
    And CxO approval is obtained before go-live
```

#### Escalation / Timer Pattern

```gherkin
  Scenario: SLA escalation — requirements not completed within 5 business days
    Given the Business Owner has been assigned the requirements gathering task
    When 5 business days elapse without task completion (Timer_P1_RequirementsSLA fires)
    Then a non-interrupting escalation is triggered
    And the Business Owner's manager receives an escalation notification
    And the main requirements task continues in parallel
    And if a further 3 business days elapse, a second escalation reaches Director level
```

#### Rejection / Error Pattern

```gherkin
  Scenario: Pathway blocked — Unacceptable AI risk classification
    Given an AI system is proposed with autonomous decision-making on individual financial outcomes
    When the DMN_AIRiskLevel returns "Unacceptable"
    Then the process routes to the rejection end event
    And a rejection notice is sent to the Business Owner and executive sponsor
    And the governance request is closed with reason "Prohibited AI use case — EU AI Act"
    And no further phases are initiated
```

#### DMN Gateway Boundary Condition Pattern

```gherkin
  Scenario: Boundary condition — risk score at Standard/Enhanced threshold
    Given a request with financial exposure of exactly $500,000
    And medium-sensitivity PII data (no special categories)
    When DMN_RiskClassification evaluates the request
    Then the output is "High" (boundary: >= $500K with PII = High)
    And DMN_PathwaySelection returns "enhanced"
    And Enhanced pathway approval chain is activated (VP/CxO + Board)
```

#### Parallel Review Pattern

```gherkin
  Scenario: Phase 2 parallel reviews — all three tracks complete
    Given the Phase 2 parallel gateway has split into three review tracks
    When IT Architecture completes the solution architecture review
    And Information Security completes the security assessment with rating "Medium"
    And Legal & Compliance completes the regulatory mapping
    Then all three parallel tracks converge at the join gateway
    And the Phase 2 approval gateway evaluates all three outcomes
    And if all three are "Approved" or "Conditional Approval", Phase 2 completes
```

## Coverage Metrics

### Minimum Coverage Requirements

| Element Type | Minimum Coverage | Rationale |
|--------------|-----------------|-----------|
| User Tasks | 100% | All manual governance steps must be tested |
| Business Rule Tasks (DMN) | 100% | All decision points must have test scenarios |
| Service Tasks | 100% | All automated steps must be covered |
| Exclusive Gateways | 90% | All decision branches must be exercised |
| Parallel Gateways | 100% | All parallel execution patterns must be validated |
| Timer Boundary Events | 80% | SLA escalation paths must be tested |
| Error Boundary Events | 90% | Exception paths must be validated |
| Intermediate Throw Events | 100% | Phase transition milestones must be covered |
| Start/End Events | 100% | All process entry/exit points must be covered |

### Coverage Calculation (Documentation Models)

Path coverage is calculated from the BPMN XML sequence flow graph:

```
Path Coverage = (Sequence Flows Included in At Least One Scenario / Total Sequence Flows) * 100
Element Coverage = (Elements Referenced in At Least One Scenario / Total Flow Nodes) * 100
```

**Quality Gate**: Path coverage MUST be >= 80%.

### Phase-Level Quality Gates

| Phase | Required Scenarios | Special Requirements |
|-------|-------------------|---------------------|
| Phase 0 | Happy path + rejection | Triage decision covered |
| Phase 1 | All 4 pathways + escalation | DMN_PathwaySelection all outputs tested |
| Phase 2 | Parallel reviews + security rejection | All three review track combinations |
| Phase 3 | Happy path + compliance gate failure | DMN_ComplianceGate pass and fail |
| Phase 4 | UAT pass + UAT fail + re-test | Go-live authorization and rejection |
| Phase 5 | SLA Green + SLA Amber + SLA Red | DMN_SLAThreshold all outputs |
| Phase 6 | Standard retirement + expedited | DMN_RetirementEligibility eligibility and blocker |

## Test Naming Conventions

### Feature Files

```
tests/features/[phase-id]/[process-name].feature
```

Examples:
- `tests/features/phase-1/needs-assessment.feature`
- `tests/features/phase-2/solution-design.feature`
- `tests/features/cross-cutting/exception-handling.feature`

### Scenario Names

```gherkin
Scenario: [Category] — [Pathway/Context] — [Outcome]
```

Categories:
- `Happy Path` — primary success flow
- `Pathway Variant` — alternate pathway (Fast-Track, Enhanced, Emergency)
- `Escalation` — timer or SLA escalation triggered
- `Rejection` — process ends in rejection or hold
- `Boundary Condition` — edge case at a DMN decision threshold
- `Error Handling` — exception, compensation, or error boundary event
- `Phase Gate` — Governance Board checkpoint

Examples:
- `Scenario: Happy Path — Standard Pathway — Needs Assessment complete`
- `Scenario: Pathway Variant — Fast-Track — bypasses Phase 2 and Phase 3`
- `Scenario: Boundary Condition — DMN_RiskClassification at High/Critical threshold`
- `Scenario: Escalation — Phase 2 architecture review exceeds 10-day SLA`
- `Scenario: Error Handling — DMN_ComplianceGate returns Fail, procurement blocked`

## Swim Lane Connectivity Checks

Every BPMN file must pass swim lane connectivity validation:

- [ ] Every `<bpmn:flowNodeRef>` in each lane references an element that exists in the process
- [ ] Every task, gateway, and event appears in exactly one lane's `<bpmn:flowNodeRef>` list
- [ ] Cross-lane sequence flows are valid (source and target in different lanes is intentional)
- [ ] Lane IDs match the 7 canonical IDs defined in `bpmn-modeling-standards.md`
- [ ] No orphaned lanes (lanes with no flow nodes assigned)

Connectivity check script:
```bash
node scripts/validate-bpmn-lanes.js processes/phase-1/needs-assessment.bpmn
```

## Quality Gates Summary

### Pre-Scenario Generation Gates
- [ ] BPMN XML passes well-formedness check
- [ ] All element ID naming conventions followed
- [ ] All timer and error boundary events have outgoing flows
- [ ] All tasks have `<bpmn:documentation>` elements
- [ ] All BusinessRuleTask elements have `camunda:decisionRef`
- [ ] Swim lane connectivity validated
- [ ] Visual overlap check passes

### Post-Scenario Generation Gates
- [ ] Minimum 80% path coverage achieved
- [ ] At least one happy path scenario per process
- [ ] All 4 pathway variants covered (Phase 1 processes)
- [ ] At least one escalation scenario (timer SLA)
- [ ] At least one rejection/error scenario
- [ ] All DMN gateways have at least one boundary condition scenario
- [ ] Feature file follows naming convention

### Regulatory Review Gates (Enhanced Pathway Processes)
- [ ] OCC 2023-17 requirements mapped to test scenarios (if applicable)
- [ ] SR 11-7 model validation steps covered in scenarios (if applicable)
- [ ] EU AI Act conformity assessment steps covered (if AI system)
- [ ] DORA contractual requirements validated in Phase 3 scenarios (if applicable)
- [ ] GDPR DPIA and DPA steps covered in scenarios (if personal data)
- [ ] Evidence collection steps present in scenarios

## Failure Severity Classification

| Severity | Definition | Action Required |
|----------|------------|-----------------|
| **Blocker** | Happy path scenario fails structural validation | MUST fix before process model is shared with stakeholders |
| **Critical** | Escalation or error handling paths missing | MUST fix before regulatory review |
| **Major** | DMN boundary condition not covered, path coverage < 80% | SHOULD fix before Governance Board review |
| **Minor** | Optional scenario gaps, annotation formatting | MAY defer; add to backlog |

## Test Maintenance

### Regenerate Scenarios When
- BPMN process structure changes (new tasks, gateways, or paths added)
- Pathway criteria change (DMN thresholds updated)
- New regulatory framework added
- Swim lane roles or responsibilities change
- Phase duration SLAs updated (timer duration changes)

### Deprecation
When a process model is superseded by a newer version:
- Move feature file to `tests/features/deprecated/`
- Note the superseding model in the feature file header
- Archive in `evidence/bpmn-tests/deprecated/`

## Related Files

- `bpmn-modeling-standards.md` — structural rules that tests validate against
- `sla-governance-domain.md` — domain knowledge for scenario authoring
- `regulatory-alignment.md` — regulatory coverage requirements for scenario generation

---

**Version**: 1.0.0
**Created**: 2026-03-01
**Platform**: SLA Governance Platform
**Adapted from**: rival/.claude/context/bpmn-testing.md v1.0.0
**Key difference from rival version**: No runtime execution — structural validation and BDD coverage only (documentation-only models)
