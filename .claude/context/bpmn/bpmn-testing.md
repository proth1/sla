# BPMN Testing Standards — SLA Governance Platform

All BPMN process models in the SLA Governance Platform MUST follow these testing standards. Because all models are documentation-only (`isExecutable="false"`), testing focuses on **structural validation** and **BDD scenario coverage** rather than runtime execution.

## CRITICAL Requirements

### Mandatory Test Coverage

Every BPMN governance process MUST have:
- [ ] **Happy path test scenario**: Primary governance flow from start event to successful end event
- [ ] **Pathway variant tests**: Separate scenarios for each applicable pathway (Fast-Track, Build, Buy, Hybrid)
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
# Validate BPMN XML well-formedness, element connectivity, and Camunda-specific attributes
node scripts/validators/bpmn-validator.js processes/phase-1-intake/initiation-and-intake.bpmn

# Detect overlapping DI elements (static analysis — no browser required)
node scripts/validators/visual-overlap-checker.js processes/phase-1-intake/initiation-and-intake.bpmn

# Check for additional element-level concerns (connectivity, lane assignment)
node scripts/validators/element-checker.js processes/phase-1-intake/initiation-and-intake.bpmn
```

All three validators are located in `scripts/validators/`. Run `npm install` in that directory before use.

**Quality Gate**: MUST pass all validators before proceeding to BDD scenario generation.

### Structural Validation Criteria

| Check | Rule | Failure Action |
|-------|------|----------------|
| XML well-formedness | File parses without error | Fix XML before proceeding |
| All flow refs valid | `sourceRef` and `targetRef` reference existing element IDs | Fix dangling references |
| Timer boundary outgoing | Every timer boundary has `<bpmn:outgoing>` | Add escalation flow |
| Error boundary outgoing | Every error boundary has `<bpmn:outgoing>` | Add compensation/escalation flow |
| Merge gateway rule | Merge gateways have exactly 1 outgoing, no name attribute | Refactor gateway |
| Lane assignment | Every flow node assigned to exactly one lane | Assign to correct lane |
| Phase transition events | Phase-end intermediate throw events present | Add milestone event |
| ID naming compliance | IDs follow `Task_[Phase]_[N]_[Action]`, `Gateway_[Phase]_[Decision]` patterns | Rename non-compliant IDs |
| DMN references | BusinessRuleTask has `camunda:decisionRef` from the 8 canonical IDs | Add or correct DMN reference |
| DMN binding | BusinessRuleTask has `camunda:decisionRefBinding="latest"` | Add binding attribute |
| candidateGroups | userTask has `camunda:candidateGroups` from the 9 valid values | Add or correct lane group |
| Timer ISO 8601 | Timer durations use valid ISO 8601 format (P2D, P8D, PT2H) | Fix duration format |
| No backward flows | All sequence flow waypoints move left-to-right within lanes | Reroute backward flows |
| Terminal end events | End events use End_Retired, End_Terminated, or End_Rejected IDs | Rename end events |

## Visual Validation (Phase 1.5)

Governance models are reviewed visually by stakeholders and auditors. Visual quality is a compliance requirement.

```bash
# Detect overlapping elements (static analysis — no browser required)
node scripts/validators/visual-overlap-checker.js processes/phase-3-due-diligence/due-diligence-and-swarm.bpmn
```

**Visual Validation Criteria**:
- [ ] No overlapping elements (> 5% overlap threshold)
- [ ] Labels within viewport bounds (no off-canvas labels)
- [ ] No truncated labels (element wide enough for name)
- [ ] All sequence flows go left-to-right within a lane row (no backward flows)
- [ ] Timer labels positioned to the RIGHT of boundary events (x + 44, y + 4)
- [ ] Escalation end events within 80px of their boundary event
- [ ] Swim lane heights sufficient for content (no elements touching lane borders)
- [ ] Phase transition intermediate events visible at phase boundaries
- [ ] Parallel branches have 170-180px vertical spacing
- [ ] Cross-lane flows use vertical segments (no diagonal lines across lanes)

## BDD Scenario Generation (Phase 2)

### Gherkin Scenario Patterns for Governance Workflows

#### Happy Path Pattern (Buy Pathway)

```gherkin
Feature: Phase 1 Initiation and Intake — Buy Pathway
  As a Business Owner
  I want to complete the Initiation and Intake phase
  So that the appropriate governance pathway is selected and resources allocated

  Background:
    Given a governance need has been identified for a third-party SaaS procurement
    And an executive sponsor has been assigned

  Scenario: Buy pathway — intake complete, pathway confirmed
    Given the Business Owner submits a completed governance request
    When the Automation lane processes the intake triage
    And the DMN_PathwayRouting returns "Buy"
    And the DMN_RiskTierClassification returns "High"
    Then the Initiation and Intake phase is marked complete
    And the process transitions to Phase 2 Planning and Risk Scoping
    And the pathway selection "Buy" is recorded in the governance register
```

#### Pathway Variant Pattern (Fast-Track)

```gherkin
  Scenario: Fast-Track pathway — abbreviated assessment
    Given the DMN_RiskTierClassification returns "Minimal"
    And the contract value is below the Fast-Track threshold
    And no PII data is involved
    And the vendor is pre-approved
    When the DMN_PathwayRouting returns "Fast-Track"
    Then the process routes through abbreviated due diligence
    And the Governance Review in Phase 4 is expedited
    And manager-level approval authority applies (not Director)
```

#### Build Pathway Pattern

```gherkin
  Scenario: Build pathway — internal development governance
    Given the DMN_PathwayRouting returns "Build"
    When Phase 3 due diligence executes
    Then the Vendor Response pool has no active tasks
    And the Technical Assessment lane leads the internal architecture review
    And SDLC Phase 6 applies internal development controls
```

#### Rejection Pattern (Unacceptable Risk)

```gherkin
  Scenario: Unacceptable risk — governance request rejected at Phase 2
    Given a governance request has completed Phase 1
    When the DMN_RiskTierClassification returns "Unacceptable"
    Then the Phase 2 Risk Tier Decision gateway routes to End_Rejected
    And a rejection notice is sent to the Business Owner and executive sponsor
    And the governance request is closed with reason "Unacceptable Risk Tier"
    And no further phases are initiated
```

#### Escalation / Timer Pattern

```gherkin
  Scenario: SLA escalation — Phase 3 due diligence exceeds 8-day SLA
    Given the Phase 3 due diligence sub-process is in progress
    When 8 business days elapse without completion (Timer_Phase3_ReviewSLA fires)
    Then a non-interrupting escalation is triggered
    And the Governance lane receives an escalation notification
    And the main due diligence process continues in parallel
    And DMN_AgentConfidenceEscalation is evaluated to determine escalation authority level
```

#### Governance Rejection Pattern (Phase 4)

```gherkin
  Scenario: Governance rejection at Phase 4
    Given Phase 3 due diligence is complete with High-risk findings
    When the DMN_GovernanceReviewRouting returns "Rejected"
    Then the Governance Decision gateway routes to End_Rejected
    And a formal rejection record is created in the governance register
    And the Oversight lane receives notification for audit trail
```

#### Deployment Loop Pattern (Phase 7)

```gherkin
  Scenario: Deployment rejected — loops back to Phase 6
    Given Phase 6 SDLC testing is complete
    When the deployment approval in Phase 7 is denied
    Then the Deployment Decision gateway routes back to Phase 6
    And SDLC remediation tasks are initiated
    And a change risk scoring using DMN_ChangeRiskScoring determines re-test scope
```

#### Operations Retirement Pattern (Phase 8)

```gherkin
  Scenario: Graceful retirement — End_Retired
    Given the solution has been in operations for the contract duration
    And a replacement solution has been approved
    When the Phase 8 Monitoring Outcome gateway evaluates "Retire"
    Then Sub-Process 8R (Retirement) is initiated
    And data migration, license termination, and vendor offboarding tasks execute
    And the process terminates at End_Retired
    And data destruction certificates are archived
```

#### DMN Gateway Boundary Condition Pattern

```gherkin
  Scenario: Boundary condition — risk tier at High/Unacceptable threshold
    Given a governance request with AI system components affecting EU persons
    When DMN_RiskTierClassification evaluates the request
    Then the output is "High" (AI system with EU scope below Unacceptable threshold)
    And DMN_PathwayRouting returns "Buy" with enhanced due diligence
    And the AI Review lane is activated in Phase 3
    And SR 11-7 and EU AI Act review tracks are added
```

#### Parallel Swarm Pattern (Phase 3)

```gherkin
  Scenario: Phase 3 parallel swarm — all assessment tracks complete
    Given the Phase 3 due diligence parallel gateway has split into assessment tracks
    When Technical Assessment completes the security assessment with rating "Medium"
    And AI Review completes the AI risk evaluation
    And Compliance completes the regulatory mapping
    And the Vendor Response pool has submitted all required documentation
    Then all parallel tracks converge at the swarm join gateway
    And the Phase 3 completion gateway evaluates all outcomes
    And if all tracks return acceptable findings, Phase 3 transitions to Phase 4
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
| Phase 1 | Happy path + all 4 pathways + rejection | DMN_PathwayRouting all outputs tested |
| Phase 2 | Risk tiers + Unacceptable rejection | DMN_RiskTierClassification all outputs |
| Phase 3 | Parallel swarm + escalation | All assessment track combinations |
| Phase 4 | Approved + Conditionally Approved + Rejected | DMN_GovernanceReviewRouting all outputs |
| Phase 5 | Happy path + DORA contractual checklist failure | Contracting lane full coverage |
| Phase 6 | UAT pass + UAT fail + re-test | SDLC loop back coverage |
| Phase 7 | Approved → Phase 8 + Rejected → loop to Phase 6 | Deployment Decision gateway both paths |
| Phase 8 | SLA monitoring + change routing + retirement | DMN_MonitoringCadenceAssignment + DMN_ChangeRiskScoring + all 3 terminal end events |

## Test Naming Conventions

### Feature Files

```
tests/features/phase-{N}-{name}/{process-name}.feature
```

Examples:
- `tests/features/phase-1-intake/initiation-and-intake.feature`
- `tests/features/phase-3-due-diligence/due-diligence-and-swarm.feature`
- `tests/features/phase-8-operations/operations-monitoring-retirement.feature`
- `tests/features/cross-cutting/sla-monitoring-breach.feature`

### Scenario Names

```gherkin
Scenario: [Category] — [Pathway/Context] — [Outcome]
```

Categories:
- `Happy Path` — primary success flow
- `Pathway Variant` — alternate pathway (Fast-Track, Build, Buy, Hybrid)
- `Escalation` — timer or SLA escalation triggered
- `Rejection` — process ends in End_Rejected
- `Termination` — process ends in End_Terminated
- `Retirement` — process ends in End_Retired
- `Boundary Condition` — edge case at a DMN decision threshold
- `Error Handling` — exception, compensation, or error boundary event
- `Phase Gate` — Governance Board checkpoint

Examples:
- `Scenario: Happy Path — Buy Pathway — Intake to Operations complete`
- `Scenario: Pathway Variant — Fast-Track — abbreviated Phase 3 and Phase 4`
- `Scenario: Boundary Condition — DMN_RiskTierClassification at High/Unacceptable threshold`
- `Scenario: Escalation — Phase 3 due diligence exceeds 8-day SLA`
- `Scenario: Rejection — DMN_GovernanceReviewRouting returns Rejected at Phase 4`
- `Scenario: Retirement — Phase 8 graceful wind-down via Sub-Process 8R`

## Swim Lane Connectivity Checks

Every BPMN file must pass swim lane connectivity validation using `scripts/validators/element-checker.js`:

- [ ] Every `<bpmn:flowNodeRef>` in each lane references an element that exists in the process
- [ ] Every task, gateway, and event appears in exactly one lane's `<bpmn:flowNodeRef>` list
- [ ] Cross-lane sequence flows are valid (source and target in different lanes is intentional)
- [ ] candidateGroups values match one of the 9 canonical values:
  - `business-lane`, `governance-lane`, `contracting-lane`, `technical-assessment`
  - `ai-review`, `compliance-lane`, `oversight-lane`, `automation-lane`, `vendor-response`
- [ ] No orphaned lanes (lanes with no flow nodes assigned)
- [ ] Vendor Response pool lane only contains vendor-side tasks

## Quality Gates Summary

### Pre-Scenario Generation Gates
- [ ] BPMN XML passes well-formedness check (`scripts/validators/bpmn-validator.js`)
- [ ] No overlapping elements (`scripts/validators/visual-overlap-checker.js`)
- [ ] Element connectivity validated (`scripts/validators/element-checker.js`)
- [ ] All timer and error boundary events have outgoing flows
- [ ] All BusinessRuleTask elements have `camunda:decisionRef` (8 canonical IDs only)
- [ ] All userTask elements have `camunda:candidateGroups` (9 canonical values only)
- [ ] Swim lane connectivity validated
- [ ] No backward sequence flows within lanes
- [ ] All 3 terminal end events use canonical IDs (End_Retired, End_Terminated, End_Rejected)

### Post-Scenario Generation Gates
- [ ] Minimum 80% path coverage achieved
- [ ] At least one happy path scenario per process
- [ ] All 4 pathway variants covered (Phase 1 processes): Fast-Track, Build, Buy, Hybrid
- [ ] At least one escalation scenario (timer SLA)
- [ ] At least one rejection scenario (End_Rejected path)
- [ ] All DMN gateways have at least one boundary condition scenario
- [ ] Feature file follows naming convention

### Regulatory Review Gates (All Governance Processes)
- [ ] OCC 2023-17 requirements mapped to test scenarios (Phase 2, 3, 5, 8)
- [ ] SR 11-7 model validation steps covered in scenarios (if AI system)
- [ ] EU AI Act conformity assessment steps covered (if AI system)
- [ ] DORA contractual requirements validated in Phase 5 scenarios (if ICT provider)
- [ ] GDPR DPIA steps covered in Phase 2 scenarios (if personal data)
- [ ] NIST CSF 2.0 coverage in Phase 3 and Phase 7 scenarios
- [ ] Evidence collection steps present in scenarios

## Failure Severity Classification

| Severity | Definition | Action Required |
|----------|------------|-----------------|
| **Blocker** | Happy path scenario fails structural validation | MUST fix before process model is shared with stakeholders |
| **Critical** | Escalation or error handling paths missing; terminal end event missing | MUST fix before regulatory review |
| **Major** | DMN boundary condition not covered; path coverage < 80%; invalid candidateGroups or decisionRef | SHOULD fix before Governance Board review |
| **Minor** | Optional scenario gaps, annotation formatting | MAY defer; add to backlog |

## Test Maintenance

### Regenerate Scenarios When
- BPMN process structure changes (new tasks, gateways, or paths added)
- Pathway criteria change (DMN thresholds updated)
- New regulatory framework added
- Swim lane roles or candidateGroups change
- Phase duration SLAs updated (timer duration changes)
- A new terminal end event is added

### Deprecation
When a process model is superseded by a newer version:
- Move feature file to `tests/features/deprecated/`
- Note the superseding model in the feature file header
- Archive in `evidence/bpmn-tests/deprecated/`

## Related Files

- `bpmn-modeling-standards.md` — structural rules that tests validate against
- `sla-governance-domain.md` — domain knowledge for scenario authoring (8-phase lifecycle, 9+1 lanes, 8 DMN tables)
- `regulatory-alignment.md` — regulatory coverage requirements for scenario generation (11 frameworks)

---

**Version**: 2.0.0
**Created**: 2026-03-01
**Updated**: 2026-03-03
**Platform**: SLA Governance Platform
**Changes in v2.0**: Updated for 8-phase schema (Phases 1-8). Fixed all script paths: validate-bpmn-structure.js → scripts/validators/bpmn-validator.js; validate-bpmn-visual.js → scripts/validators/visual-overlap-checker.js; removed validate-bpmn-ids.js and validate-bpmn-lanes.js references (replaced by element-checker.js). Removed Phase 0. Updated quality gates table to 8 phases. Updated pathway variants from Fast-Track/Standard/Enhanced/Emergency to Fast-Track/Build/Buy/Hybrid. Updated lane connectivity checks to 9+1 canonical candidateGroups. Updated DMN references to 8 canonical table IDs. Added terminal end event validation (End_Retired, End_Terminated, End_Rejected). Updated scenario examples for 8-phase structure.
