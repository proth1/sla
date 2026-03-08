# SLA Governance Domain Knowledge

This file is the authoritative domain reference for the SLA Governance Platform. It must be loaded whenever creating or editing governance process models, DMN decision tables, or regulatory mapping artifacts.

## 8-Phase Governance Lifecycle

| Phase | Name | Sub-Process ID | SLA (Standard) | Automation |
|-------|------|---------------|----------------|------------|
| 1 | Initiation and Intake | SP-Phase1-Intake | 1–2 days | 75% |
| 2 | Planning and Risk Scoping | SP-Phase2-Planning | 3–5 days | 60% |
| 3 | Due Diligence and Swarm Evaluation | SP-Phase3-DueDiligence | 5–8 days | 70% |
| 4 | Governance Review and Approval | SP-Phase4-GovernanceReview | 3–5 days | 40% |
| 5 | Contracting and Controls | SP-Phase5-Contracting | 5–7 days | 50% |
| 6 | SDLC Development and Testing | SP-Phase6-SDLC | 10–15 days | 55% |
| 7 | Deployment and Go-Live | SP-Phase7-Deployment | 2–3 days | 60% |
| 8 | Operations and Retirement | SP-Phase8-Operations | Ongoing | 65% |

### Phase 1: Initiation and Intake
**Trigger**: Business need, regulatory requirement, or technology opportunity identified
**Purpose**: Capture the governance request, triage it, and route it to the appropriate governance pathway
**Key Activities**:
- Submit governance request via standard intake form
- Draft preliminary business case and expected value
- Assign executive sponsor
- Perform initial intake triage (determine if full governance review is required)
- Route to governance pathway using DMN_PathwayRouting (Fast-Track, Build, Buy, Hybrid)
**Outputs**: Governance request ticket, initial risk profile, executive sponsor assignment, selected pathway
**Sub-Process ID**: SP-Phase1-Intake
**Phase-Start Event**: `Event_Phase1_Start` — "Governance Request&#10;Received"
**Phase-End Event**: `Event_Phase1_Complete` — "Initiation and Intake&#10;Complete"
**Timer SLA**: ISO `P2D` (2-day standard SLA)
**Key DMN**: DMN_PathwayRouting (Phase 1, Activity 1.6)

### Phase 2: Planning and Risk Scoping
**Trigger**: Pathway selected from Phase 1
**Purpose**: Define requirements precisely, classify risk tier, and scope the governance effort
**Key Activities**:
- Detailed requirements gathering and stakeholder analysis
- Risk tier classification using DMN_RiskTierClassification (outputs: Minimal/Limited/High/Unacceptable)
- Pathway validation and resource allocation
- Data classification and privacy impact scope
- Regulatory framework mapping for applicable frameworks
**Outputs**: Risk tier classification, requirements scope document, regulatory applicability matrix
**Sub-Process ID**: SP-Phase2-Planning
**Phase-Start Event**: `Event_Phase2_Start` — "Planning&#10;Initiated"
**Phase-End Event**: `Event_Phase2_Complete` — "Planning and Risk&#10;Scoping Complete"
**Timer SLA**: ISO `P5D` (5-day standard SLA)
**Key DMN**: DMN_RiskTierClassification (Phase 2, Activity 2.3)
**Key Gateway**: After Phase 2 — Risk Tier Decision: Unacceptable → End_Rejected; High/Limited/Minimal → Phase 3

### Phase 3: Due Diligence and Swarm Evaluation
**Trigger**: Risk tier approved from Phase 2 (not Unacceptable)
**Purpose**: Conduct parallel due diligence assessments across all governance lanes simultaneously
**Key Activities**:
- Vendor financial stability and operational capability assessment
- Information security assessment and vulnerability scan
- AI risk evaluation (SR 11-7, EU AI Act applicability)
- Regulatory compliance mapping per applicable frameworks
- Parallel swarm evaluation across Technical Assessment, AI Review, and Compliance lanes
- Automation tier assignment using DMN_AutomationTierAssignment
**Outputs**: Due diligence report, security risk rating, AI risk classification, compliance requirements matrix
**Sub-Process ID**: SP-Phase3-DueDiligence
**Phase-Start Event**: `Event_Phase3_Start` — "Due Diligence&#10;Initiated"
**Phase-End Event**: `Event_Phase3_Complete` — "Due Diligence&#10;Complete"
**Timer SLA**: ISO `P8D` (8-day standard SLA)
**Key Pattern**: Parallel gateway for simultaneous assessments across all assessment lanes

### Phase 4: Governance Review and Approval
**Trigger**: Due diligence complete from Phase 3
**Purpose**: Consolidate assessment findings and obtain formal governance approval
**Key Activities**:
- Governance review routing using DMN_GovernanceReviewRouting
- Consolidated risk assessment review by Governance lane
- Compliance review sign-off
- Oversight and audit review (3rd Line of Defense)
- Formal governance approval or rejection
**Outputs**: Governance decision (Approved / Approved with Conditions / Rejected), governance record
**Sub-Process ID**: SP-Phase4-GovernanceReview
**Phase-Start Event**: `Event_Phase4_Start` — "Governance Review&#10;Initiated"
**Phase-End Event**: `Event_Phase4_Complete` — "Governance Review&#10;Complete"
**Timer SLA**: ISO `P5D` (5-day standard SLA)
**Key DMN**: DMN_GovernanceReviewRouting (Phase 4, Activity 4.2)
**Key Gateway**: Governance Decision: Approved → Phase 5; Approved w/ Conditions → Phase 5; Rejected → End_Rejected

### Phase 5: Contracting and Controls
**Trigger**: Governance approval from Phase 4
**Purpose**: Execute contracts, establish controls, and formalize vendor relationship
**Key Activities**:
- Contract negotiation (legal review, data processing agreement, SLA terms)
- DORA contractual requirements validation
- Legal sign-off and regulatory clause validation
- Control framework establishment (SOX ITGC design where applicable)
- DPA execution (GDPR Art. 28 where applicable)
- Vendor onboarding to monitoring framework
**Outputs**: Signed contract, data processing agreement, controls matrix, vendor onboarding record
**Sub-Process ID**: SP-Phase5-Contracting
**Phase-Start Event**: `Event_Phase5_Start` — "Contracting&#10;Initiated"
**Phase-End Event**: `Event_Phase5_Complete` — "Contracting and&#10;Controls Complete"
**Timer SLA**: ISO `P7D` (7-day standard SLA)

### Phase 6: SDLC Development and Testing
**Trigger**: Contracting complete from Phase 5
**Purpose**: Build or configure the solution and validate through structured testing
**Key Activities**:
- Solution development, configuration, or integration
- Internal testing and code review
- Security penetration testing
- User acceptance testing (UAT) — Business Owner led
- Compliance testing against regulatory requirements
- Performance and resilience testing (DORA TLPT where applicable)
**Outputs**: Tested solution artifact, UAT sign-off, security test results, compliance test evidence
**Sub-Process ID**: SP-Phase6-SDLC
**Phase-Start Event**: `Event_Phase6_Start` — "SDLC&#10;Initiated"
**Phase-End Event**: `Event_Phase6_Complete` — "SDLC Development&#10;and Testing Complete"
**Timer SLA**: ISO `P15D` (15-day standard SLA)

### Phase 7: Deployment and Go-Live
**Trigger**: SDLC testing complete from Phase 6
**Purpose**: Deploy the solution to production and execute go-live with monitoring
**Key Activities**:
- Deployment planning and change management review
- Security validation in pre-production
- Go-live execution with rollback plan
- Post-go-live hypercare monitoring
- Go-live sign-off by Business Owner
- Deployment approval or rejection
**Outputs**: Deployment record, go-live report, hypercare closure, operational handover
**Sub-Process ID**: SP-Phase7-Deployment
**Phase-Start Event**: `Event_Phase7_Start` — "Deployment&#10;Initiated"
**Phase-End Event**: `Event_Phase7_Complete` — "Deployment and&#10;Go-Live Complete"
**Timer SLA**: ISO `P3D` (3-day standard SLA)
**Key Gateway**: Deployment Decision: Approved → Phase 8; Rejected → Loop back to Phase 6

### Phase 8: Operations and Retirement
**Trigger**: Solution live in production from Phase 7
**Purpose**: Govern the solution throughout its operational life — monitoring, SLA enforcement, change management, and eventual retirement
**Key Activities**:
- Continuous performance monitoring using DMN_MonitoringCadenceAssignment
- SLA threshold monitoring and enforcement
- Change risk scoring using DMN_ChangeRiskScoring (for solution changes)
- Incident management and escalation
- Vendor performance reviews
- Annual risk re-assessment and pathway re-classification
- Regulatory reporting and evidence collection
- Retirement eligibility assessment and execution
- Data migration, license termination, vendor offboarding (Sub-Process 8R: Retire)
**Outputs**: SLA performance reports, audit reports, vendor scorecards, incident logs, retirement records
**Sub-Process ID**: SP-Phase8-Operations
**Phase-Start Event**: `Event_Phase8_Start` — "Operations&#10;Commenced"
**Timer SLA**: Ongoing (monitoring cadence per DMN_MonitoringCadenceAssignment)
**Key DMN**: DMN_MonitoringCadenceAssignment (Phase 8, Activity 8.1); DMN_ChangeRiskScoring (Phase 8, Activity 8C.1)
**Key Gateway**: Monitoring Outcome: Continue → Loop; Change → Sub-Process 8C; Retire → Sub-Process 8R

## 3 Terminal End Events

| End Event ID | Name | Trigger |
|-------------|------|---------|
| `End_Retired` | Graceful Retirement | Graceful wind-down via decommission (Phase 8, Sub-Process 8R) |
| `End_Terminated` | Emergency Termination | Emergency cessation due to compliance breach or security incident |
| `End_Rejected` | Governance Rejection | Governance rejection at Phase 2 (Unacceptable Risk) or Phase 4 |

## 4 Governance Pathways

### Fast-Track
**Target**: Low-risk, pre-approved, commercial off-the-shelf tools or internal productivity solutions
**Characteristics**: Abbreviated review cycle; abbreviated due diligence; manager-level approval
**Phase Sequence**: 1 → 2 → (abbreviated 3/4) → 5 → 6 → 7 → 8
**Escalation Trigger**: Any unacceptable risk finding → auto-routes to full pathway

### Build
**Target**: Internal development initiatives where the organization builds the solution
**Characteristics**: Full SDLC governance; PDLC controls; internal team as vendor
**Phase Sequence**: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 (full lifecycle, internal build controls)

### Buy
**Target**: Standard procurement of third-party SaaS, COTS, or managed services
**Characteristics**: Full TPRM controls; vendor due diligence; OCC 2023-17 compliance
**Phase Sequence**: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 (full lifecycle, vendor controls)

### Hybrid
**Target**: Solutions combining internal build with third-party components
**Characteristics**: Combines Build and Buy controls; most complex governance path
**Phase Sequence**: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 (full lifecycle, combined controls)

## 9+1 Swim Lane Roles and Responsibilities

### Enterprise Governance Pool (8 lanes)

| Lane Name | candidateGroups | RACI Role | Three Lines of Defense |
|-----------|----------------|-----------|----------------------|
| Business | `business-lane` | Business Owner (1st Line) | 1st |
| Governance | `governance-lane` | Risk & Governance (2nd Line) | 2nd |
| Contracting | `contracting-lane` | Legal (1st/2nd Line) | 1st/2nd |
| Technical Assessment | `technical-assessment` | Cybersecurity (2nd Line) | 2nd |
| AI Review | `ai-review` | AI Governance (2nd Line) | 2nd |
| Compliance | `compliance-lane` | Compliance (2nd Line) | 2nd |
| Oversight | `oversight-lane` | Internal Audit (3rd Line) | 3rd |
| Automation | `automation-lane` | Service Provider / BPM Engine (1st Line) | 1st |

### Vendor / Third Party Pool (1 lane)

| Lane Name | candidateGroups | RACI Role | Three Lines of Defense |
|-----------|----------------|-----------|----------------------|
| Vendor Response | `vendor-response` | External Vendor | N/A |

### Lane Responsibilities

**Business** (`business-lane`): Requirements definition, UAT, go-live sign-off, operational monitoring from business perspective, retirement decision initiation

**Governance** (`governance-lane`): Cross-functional risk consolidation, governance review approval, phase gate authorization, exception authority, policy ownership

**Contracting** (`contracting-lane`): Contract negotiation, legal review, DPA execution, regulatory clause validation, legal hold and data retention

**Technical Assessment** (`technical-assessment`): Solution architecture review, integration assessment, security assessment, technical risk identification, deployment planning

**AI Review** (`ai-review`): AI model inventory, SR 11-7 applicability, EU AI Act risk classification, conformity assessment, post-market monitoring

**Compliance** (`compliance-lane`): Regulatory compliance mapping, compliance gate assessment, evidence collection, reporting to regulatory authorities

**Oversight** (`oversight-lane`): Internal audit, independent control testing, audit trail review, 3rd Line of Defense validation

**Automation** (`automation-lane`): BPM engine orchestration, automated data collection, DMN execution, SLA monitoring automation, workflow routing

**Vendor Response** (`vendor-response`): Vendor questionnaire responses, due diligence artifact submission, contractual commitments, SLA performance reporting

## 8 DMN Decision Table Inventory

| DMN ID | Decision Name | Hit Policy | Phase(s) | Inputs | Output(s) |
|--------|--------------|-----------|----------|--------|-----------|
| `DMN_RiskTierClassification` | Risk Tier Classification | UNIQUE | Phase 2 (Activity 2.3) | financialExposure, dataClassification, vendorMaturity, regulatoryScope, operationalCriticality | riskTier: Minimal/Limited/High/Unacceptable |
| `DMN_PathwayRouting` | Pathway Routing | UNIQUE | Phase 1 (Activity 1.6) | riskTier, contractValue, dataClassification, vendorType, buildVsBuy | selectedPathway: Fast-Track/Build/Buy/Hybrid |
| `DMN_GovernanceReviewRouting` | Governance Review Routing | UNIQUE | Phase 4 (Activity 4.2) | riskTier, selectedPathway, dueDiligenceOutcome, aiRiskLevel | governanceDecision: Approved/ApprovedWithConditions/Rejected; approvalAuthority |
| `DMN_AutomationTierAssignment` | Automation Tier Assignment | UNIQUE | Cross-cutting | processComplexity, dataVolume, riskTier, regulatoryScope | automationTier: Tier1/Tier2/Tier3; automationLevel: % |
| `DMN_AgentConfidenceEscalation` | Agent Confidence Escalation | FIRST | Cross-cutting | agentConfidenceScore, taskType, riskTier | escalationRequired: boolean; escalationLevel: Manager/Director/VP/Board |
| `DMN_ChangeRiskScoring` | Change Risk Scoring | UNIQUE | Phase 8 (Activity 8C.1) | changeScope, regulatoryImpact, financialImpact, operationalImpact | changeRiskScore: Low/Medium/High/Critical; reEntersPhase: integer |
| `DMN_VulnerabilityRemediationRouting` | Vulnerability Remediation Routing | UNIQUE | Cross-cutting (SP-Cross-2) | cvssScore, exploitability, dataExposure, regulatoryScope | remediationPriority: Critical/High/Medium/Low; remediationSLA: duration |
| `DMN_MonitoringCadenceAssignment` | Monitoring Cadence Assignment | UNIQUE | Phase 8 (Activity 8.1) | riskTier, selectedPathway, regulatoryScope, previousIncidents | monitoringCadence: Daily/Weekly/Monthly/Quarterly; reviewFrequency |

### DMN BusinessRuleTask Reference Pattern

```xml
<bpmn:businessRuleTask id="Task_RiskTier"
  name="Risk Tier Assignment"
  camunda:decisionRef="DMN_RiskTierClassification"
  camunda:decisionRefBinding="latest"
  camunda:resultVariable="riskTier"
  camunda:mapDecisionResult="singleResult" />
```

## 5 Cross-Cutting Event Sub-Processes

| ID | Name | Trigger | Primary Lane |
|----|------|---------|-------------|
| SP-Cross-1 | SLA Monitoring and Breach Management | Timer events on every phase | Automation |
| SP-Cross-2 | Vulnerability Remediation Lifecycle | Security finding detected | Technical Assessment |
| SP-Cross-3 | Incident Response | Security alert from monitoring | Technical Assessment |
| SP-Cross-4 | Regulatory Change Management | Regulatory horizon scanning | Compliance |
| SP-Cross-5 | Continuous Improvement and Process Mining | Continuous + quarterly timer | Governance |

Cross-cutting sub-processes execute as event sub-processes that can interrupt or run in parallel with any phase.

## 11 Regulatory Frameworks

| Framework | Regulator | Scope | Primary Phases |
|-----------|-----------|-------|---------------|
| OCC 2023-17 | OCC (U.S.) | Third-party risk management | 2, 3, 5 |
| SR 11-7 | Federal Reserve (U.S.) | Model risk management | 2, 3, 4 |
| SOX | SEC / PCAOB (U.S.) | Financial reporting controls | 5, 6 |
| GDPR/CCPA | EU DPAs / California | Personal data protection | 2, 5, 8 |
| EU AI Act | European Parliament | AI system governance | 2, 3, 4 |
| DORA | European Parliament | Digital operational resilience | 5, 8 |
| NIST CSF 2.0 | NIST (U.S.) | Cybersecurity framework | 3, 7, 8 |
| ISO 27001 | ISO/IEC | Information security management | 3, 6, 8 |
| SEC 17a-4 | SEC (U.S.) | Records retention | 5, 8 |
| BCBS d577 | Basel Committee | Operational resilience | 3, 8 |
| FS AI RMF | Financial Stability Board | Financial services AI risk | 2, 3, 4 |

## Cross-Phase Integration Points

### Phase Gate Decisions (Governance Lane Checkpoints)

| Gate | After Phase | Decision Point | Authority |
|------|-------------|---------------|-----------|
| Risk Tier Gate | Phase 2 | Unacceptable Risk → End_Rejected; All others → Phase 3 | Governance Lane |
| Governance Approval Gate | Phase 4 | Approved/Conditionally Approved → Phase 5; Rejected → End_Rejected | Governance Lane + Oversight |
| Deployment Gate | Phase 7 | Approved → Phase 8; Rejected → Loop to Phase 6 | Business + Governance |
| Monitoring Outcome | Phase 8 | Continue → Loop; Change → Sub-Process 8C; Retire → Sub-Process 8R | Automation (DMN-driven) |

### Phase Boundary Pattern (Mandatory)

Each phase transition MUST pass through:
1. Completion gateway (all phase tasks done?)
2. Quality gate (compliance checks pass?) — BusinessRuleTask referencing applicable DMN
3. Approval user task (appropriate authority signs off?) — candidateGroups per lane
4. Phase transition event (intermediate throw event signaling next phase)

### Change Re-Entry Points

Solutions in Phase 8 Operations re-enter the governance lifecycle when changes are scored:
- **Low risk** (DMN_ChangeRiskScoring → Low): Phase 8 internal change sub-process only
- **Medium risk**: Re-enters Phase 6 (SDLC re-testing) → Phase 7 → back to Phase 8
- **High risk**: Re-enters Phase 4 (Governance Review) → Phase 5 → Phase 6 → Phase 7 → Phase 8
- **Critical risk**: Treated as new intake → re-enters Phase 1

### Escalation Patterns

Escalation events appear on user tasks throughout all phases. Standard escalation chain:

1. **SLA timer fires** (non-interrupting boundary event) → Notification to assignee
2. **DMN_AgentConfidenceEscalation evaluates** → Routes to appropriate authority level
3. **Exception escalation** → Governance Lane arbitration
4. **Emergency cessation** → End_Terminated

Timer IDs follow the pattern `Timer_Phase[1-8]_[TaskName]SLA`. End events receiving escalation flows use descriptive names such as `Event_Phase[1-8]_[TaskName]Escalated`.

## Element ID Quick Reference

| Element Type | Pattern | Example |
|-------------|---------|---------|
| Task (User) | `Task_[Phase]_[N]_[Action]` | `Task_1_1_InitiativeRequest` |
| Task (Business Rule) | `Task_[Phase]_[N]_[DMNRef]` | `Task_2_3_RiskTierClassification` |
| Task (Service) | `Service_[Phase]_[N]_[Action]` | `Service_3_1_AutomatedScan` |
| Gateway (Decision) | `Gateway_[Phase]_[Decision]` | `Gateway_2_RiskTierDecision` |
| Gateway (Parallel Split) | `Gateway_[Phase]_[Purpose]Split` | `Gateway_3_AssessmentSplit` |
| Gateway (Parallel Join) | `Gateway_[Phase]_[Purpose]Join` | `Gateway_3_AssessmentJoin` |
| Gateway (Merge) | `Gateway_[Phase]_[Purpose]Merge` | `Gateway_3_AssessmentMerge` |
| Start Event | `Event_Phase[N]_Start` | `Event_Phase1_Start` |
| End Event (Terminal) | `End_Retired` / `End_Terminated` / `End_Rejected` | `End_Rejected` |
| Phase Transition | `Event_Phase[N]_Complete` | `Event_Phase2_Complete` |
| Timer Boundary | `Timer_Phase[N]_[Task]SLA` | `Timer_Phase3_ReviewSLA` |
| Error Boundary | `Error_Phase[N]_[Condition]` | `Error_Phase4_EscalationNeeded` |
| Escalation End | `Event_Phase[N]_[Task]Escalated` | `Event_Phase2_ReviewEscalated` |
| Lane | `Lane_[RoleName]` | `Lane_Business` |
| Sub-Process | `SP-Phase[N]-[Name]` or `SP-Cross-[N]` | `SP-Phase3-DueDiligence` |
| Sequence Flow | `Flow_[SourceID]_To_[TargetID]` | `Flow_Task_2_3_To_GW` |
| Annotation | `Annotation_[Subject]` | `Annotation_OCC2023_17` |

## Process Identity

| Attribute | Value |
|-----------|-------|
| Process ID | `ESG-E2E-Master-v4.0` |
| Target Engine | Camunda Platform 7 (documentation-only, `isExecutable="false"`) |
| Master file | `framework/processes/master/sla-governance-master.bpmn` |
| Phase files | `framework/processes/phase-{1..8}-*/` |
| Cross-cutting | `framework/processes/cross-cutting/` |
| DMN tables | `framework/decisions/dmn/` |
| Customer (onboarding) | `customers/fs-onboarding/processes/` |
| Pool count | 2 (Enterprise Governance + Vendor/Third Party) |
| Lane count | 9+1 (8 Enterprise + 1 Vendor) |

---

**Version**: 3.0.0
**Created**: 2026-03-01
**Updated**: 2026-03-03
**Platform**: SLA Governance Platform
**Changes in v3.0**: Complete rewrite for 8-phase schema (Phases 1-8). Removed Phase 0 and old 7-phase structure. Updated from 7 lanes to 9+1 lanes with current candidateGroups. Replaced 14 old DMN table IDs with 8 canonical DMN table IDs. Added 5 cross-cutting event sub-processes. Added 4 pathways (Fast-Track, Build, Buy, Hybrid). Added 3 terminal end events. Updated process ID to ESG-E2E-Master-v4.0. Added 11 regulatory frameworks.
