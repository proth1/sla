# SLA Governance Domain Knowledge

This file is the authoritative domain reference for the SLA Governance Platform. It must be loaded whenever creating or editing governance process models, DMN decision tables, or regulatory mapping artifacts.

## 7-Phase Governance Lifecycle

### Phase 0: Idea Inception
**Trigger**: Business need, regulatory requirement, or technology opportunity identified
**Purpose**: Capture and triage the initial governance request before committing assessment resources
**Key Activities**:
- Submit governance request via standard intake form
- Draft preliminary business case and expected value
- Assign executive sponsor
- Perform initial triage to determine if a full governance review is required
- Route to appropriate pathway for detailed assessment (or reject/defer)
**Outputs**: Governance request ticket (GRT), initial risk profile, executive sponsor assignment
**Duration**: 1–5 business days
**Swim Lanes**: Business Owner, SLA Governance Board (triage role)
**Phase-Start Event**: `Event_P0_Start` — "Governance Request&#10;Received"
**Phase-End Event**: `Event_P0_Complete` — "Idea Inception&#10;Complete"
**Timer SLA**: 2 business days for initial triage (ISO: `P2D`)

### Phase 1: Needs Assessment
**Trigger**: Approved governance request ticket from Phase 0
**Purpose**: Define requirements precisely, classify risk, and select the appropriate governance pathway
**Key Activities**:
- Detailed requirements gathering and stakeholder analysis
- Risk classification using DMN_RiskClassification (outputs Low/Medium/High/Critical)
- Pathway determination using DMN_PathwaySelection (outputs fast-track/standard/enhanced/emergency)
- Data classification using DMN_DataClassification (outputs Public/Internal/Confidential/Restricted)
- AI system inventory check using DMN_AIRiskLevel if applicable
- Vendor type assessment using DMN_VendorTier
- Requirements document creation and sign-off
**Outputs**: Requirements document, risk classification, selected governance pathway, data classification, vendor tier
**Duration**: 5–15 business days (Standard pathway); 1–3 days (Fast-Track/Emergency)
**Swim Lanes**: Business Owner, IT Architecture, Vendor Management
**Phase-Start Event**: `Event_P1_Start` — "Needs Assessment&#10;Initiated"
**Phase-End Event**: `Event_P1_Complete` — "Needs Assessment&#10;Complete"
**Timer SLA**: 5 business days for requirements sign-off (ISO: `P5D`)
**Key Gateway**: `Gateway_P1_PathwayDecision` — routes to Phase 2 (Standard/Enhanced) or Phase 4 (Fast-Track/Emergency)

### Phase 2: Solution Design
**Trigger**: Pathway selected and needs documented (Phase 1 complete)
**Purpose**: Design the technical solution, evaluate vendors, and map compliance requirements before procurement
**Key Activities**:
- Solution architecture design and IT Architecture review
- Vendor evaluation using DMN_VendorTier scoring
- Security assessment using DMN_SecurityClearance
- Data classification refinement and DPIA initiation (GDPR)
- AI risk assessment using DMN_AIRiskLevel (if AI components present)
- Conformity assessment design (EU AI Act, if applicable)
- Regulatory compliance mapping (OCC 2023-17, SR 11-7, DORA, SOX controls)
- Legal review of proposed solution structure
- Parallel reviews: Architecture + Security + Legal/Compliance (parallel gateway pattern)
**Outputs**: Solution architecture document, vendor shortlist, security risk rating, compliance requirements matrix, DPIA draft
**Duration**: 10–30 business days
**Swim Lanes**: IT Architecture, Information Security, Legal & Compliance
**Phase-Start Event**: `Event_P2_Start` — "Solution Design&#10;Initiated"
**Phase-End Event**: `Event_P2_Complete` — "Solution Design&#10;Approved"
**Timer SLA**: 10 business days per parallel review track (ISO: `P10D`); 15 days overall (ISO: `P15D`)
**Key Pattern**: Parallel gateway for simultaneous Architecture, Security, and Legal reviews

### Phase 3: Procurement & Build
**Trigger**: Solution design approved (Phase 2 complete)
**Purpose**: Execute procurement, negotiate contracts, and build/configure the solution
**Key Activities**:
- RFP issuance and vendor response management
- Budget approval using DMN_BudgetApproval
- Compliance gate check using DMN_ComplianceGate (go/no-go for procurement)
- Contract negotiation (legal review, data processing agreement, SLA terms)
- Legal sign-off and regulatory clause validation
- Solution development, configuration, or integration
- Internal testing and code review
- Security penetration testing (Enhanced pathway)
**Outputs**: Signed contract, data processing agreement (DPA), configured solution, test results, compliance gate record
**Duration**: 30–90 business days (Standard); 60–180 days (Enhanced)
**Swim Lanes**: Procurement, Legal & Compliance, SLA Governance Board (budget/compliance approval)
**Phase-Start Event**: `Event_P3_Start` — "Procurement&#10;Initiated"
**Phase-End Event**: `Event_P3_Complete` — "Build Ready&#10;for Implementation"
**Timer SLA**: 30 business days for contract negotiation (ISO: `P30D`)
**Key Gateway**: `Gateway_P3_ComplianceGate` — compliance gate must pass before build proceeds

### Phase 4: Implementation
**Trigger**: Build complete, compliance gate passed (Phase 3 complete) OR Fast-Track/Emergency pathway entry
**Purpose**: Test, deploy, train, and launch the solution into production
**Key Activities**:
- User acceptance testing (UAT) — business owner led
- Deployment planning and change management review
- Security validation in pre-production
- Training delivery to end users and administrators
- Go-live execution with rollback plan
- Post-go-live support period (hypercare)
- Go-live sign-off by Business Owner
**Outputs**: UAT sign-off document, deployment record, training completion records, go-live report, hypercare closure
**Duration**: 10–30 business days (Standard); 2–5 days (Emergency)
**Swim Lanes**: Business Owner, IT Architecture, Vendor Management
**Phase-Start Event**: `Event_P4_Start` — "Implementation&#10;Initiated"
**Phase-End Event**: `Event_P4_Complete` — "Solution&#10;Live"
**Timer SLA**: 15 business days for UAT completion (ISO: `P15D`)

### Phase 5: Operations
**Trigger**: Solution live in production (Phase 4 complete)
**Purpose**: Govern the solution throughout its operational life — monitoring, SLA enforcement, audit, continuous improvement
**Key Activities**:
- Continuous performance monitoring and SLA threshold tracking using DMN_SLAThreshold
- Incident management and escalation
- Vendor performance reviews (quarterly default, more frequent for Enhanced)
- Periodic governance audit using DMN_AuditFrequency
- Annual risk re-assessment and pathway re-classification
- Regulatory reporting and evidence collection
- Change management for solution updates (re-enters Phase 2 or Phase 4 for significant changes)
- Ongoing model risk monitoring (SR 11-7 if applicable)
- Post-market AI monitoring (EU AI Act if applicable)
**Outputs**: SLA performance reports, audit reports, vendor scorecards, incident logs, risk re-assessment records
**Duration**: Ongoing (no fixed end)
**Swim Lanes**: Vendor Management, Information Security, SLA Governance Board
**Phase-Start Event**: `Event_P5_Start` — "Operations&#10;Commenced"
**Timer SLA**: 90-day audit cycle (ISO: `P90D`); annual risk re-assessment (ISO: `P1Y`)
**Key DMN**: DMN_SLAThreshold (triggers escalation), DMN_AuditFrequency (sets review cadence)

### Phase 6: Retirement
**Trigger**: End-of-life identified, replacement solution approved, or contract termination
**Purpose**: Decommission the solution safely with data migration, license termination, and vendor offboarding
**Key Activities**:
- Retirement eligibility assessment using DMN_RetirementEligibility
- Retirement plan creation and Governance Board approval
- Data migration planning and execution
- User communication and training on replacement
- Regulatory data retention verification (GDPR, SOX)
- License and contract termination management
- Vendor offboarding
- Decommissioning and infrastructure cleanup
- Knowledge transfer and documentation archival
**Outputs**: Retirement plan, data migration confirmation, license termination records, knowledge transfer document, decommission report
**Duration**: 15–60 business days
**Swim Lanes**: IT Architecture, Information Security, Business Owner
**Phase-Start Event**: `Event_P6_Start` — "Retirement&#10;Initiated"
**Phase-End Event**: `Event_P6_Complete` — "Solution&#10;Decommissioned"
**Timer SLA**: 10 business days for retirement plan approval (ISO: `P10D`)

## 4 Governance Pathways

### Fast-Track (Green / Emerald)
**Target**: Low-risk, commercial off-the-shelf (COTS) tools, internal productivity solutions
**Eligibility Criteria**:
- Risk classification: Low
- Contract value: < $100K
- No PII or sensitive data processing
- Existing or pre-approved vendor
- No regulatory-specific compliance requirements
**Phase Sequence**: 0 → 1 → 4 → 5 (Phases 2, 3, 6 skipped or abbreviated)
**Approval Authority**: Manager level
**Total SLA Target**: 10 business days from intake to go-live
**Escalation Trigger**: Any criterion breach during Phase 1 assessment → auto-route to Standard

### Standard (Blue)
**Target**: Medium-risk solutions, typical SaaS procurement, most common pathway
**Eligibility Criteria**:
- Risk classification: Medium
- Contract value: $100K–$500K (or < $100K with PII)
- Limited PII processing with appropriate controls
- Known vendor type (established market category)
- Standard regulatory compliance (no specialized frameworks)
**Phase Sequence**: 0 → 1 → 2 → 3 → 4 → 5 → 6 (full lifecycle)
**Approval Authority**: Director level
**Total SLA Target**: 60 business days from intake to go-live
**Escalation Trigger**: Any High/Critical risk finding during Phase 2 → auto-route to Enhanced

### Enhanced (Gold)
**Target**: High-risk solutions, AI systems, critical infrastructure, regulated activities
**Eligibility Criteria**:
- Risk classification: High or Critical
- Contract value: > $500K (or any value with PHI, financial controls, AI)
- PII/PHI processing with complex data flows
- Regulated activity (model risk, AI Act compliance, DORA scope)
- New or unproven vendor
- Multi-year strategic dependency
**Phase Sequence**: 0 → 1 → 2 → 3 → 4 → 5 → 6 (full lifecycle with enhanced controls)
**Approval Authority**: VP/CxO level + SLA Governance Board vote
**Total SLA Target**: 120 business days from intake to go-live
**Additional Requirements**: Independent security assessment, Governance Board checkpoint at each phase gate

### Emergency (Rose / Red)
**Target**: Urgent business needs, regulatory mandates with immediate deadlines, security incident response
**Eligibility Criteria**:
- Documented urgent business need (regulatory deadline, security incident, system failure)
- CxO sponsor with documented justification
- Expedited risk assessment confirms no Critical findings blocking immediate action
**Phase Sequence**: 0 → 1 → 4 → 5 (expedited with parallel reviews during Phase 4; retroactive Phase 2/3 within 30 days)
**Approval Authority**: CxO with retroactive SLA Governance Board review (within 5 business days of go-live)
**Total SLA Target**: 5 business days to go-live
**Post-Go-Live Obligation**: Full Standard/Enhanced review must complete within 30 days of go-live

## 7 Swim Lane Roles and Responsibilities

### Lane_SLAGovernanceBoard — SLA Governance Board
**Role**: Cross-functional body with final approval authority and policy ownership
**Responsibilities**:
- Final approval on Enhanced pathway phase gates
- Exception authority for pathway overrides
- Policy creation and maintenance
- Annual program review
- Escalation resolution when cross-functional deadlock occurs
**Decision Tasks**: Phase gate approvals, exception requests, retirement plan sign-off
**Typical Participants**: CTO, CISO, CLO, CFO representative, Business Unit leads

### Lane_BusinessOwner — Business Owner
**Role**: Accountable business stakeholder who owns the solution outcome
**Responsibilities**:
- Requirements definition and sign-off
- UAT execution and go-live sign-off
- Ongoing performance monitoring from business perspective
- Retirement decision initiation
**Decision Tasks**: Requirements approval, UAT sign-off, go-live authorization, retirement initiation

### Lane_ITArchitecture — IT Architecture
**Role**: Technical authority for solution design and integration
**Responsibilities**:
- Solution architecture design and review
- Integration assessment
- Technical risk identification
- Deployment planning and execution
- Decommissioning planning
**Decision Tasks**: Architecture approval, deployment sign-off, technical retirement plan

### Lane_Procurement — Procurement
**Role**: Commercial and contract management authority
**Responsibilities**:
- RFP management and vendor selection process
- Contract administration
- Budget tracking and approval routing
- Vendor performance metrics
**Decision Tasks**: RFP sign-off, vendor selection recommendation, contract execution

### Lane_LegalCompliance — Legal & Compliance
**Role**: Regulatory compliance and legal risk authority
**Responsibilities**:
- Contract legal review
- Regulatory compliance mapping per applicable frameworks
- Data processing agreement negotiation
- Compliance gate assessment
- Legal hold and data retention oversight
**Decision Tasks**: Contract legal approval, DPA execution, compliance gate go/no-go

### Lane_InformationSecurity — Information Security
**Role**: Security risk authority and data protection oversight
**Responsibilities**:
- Security risk assessment
- Penetration testing oversight (Enhanced pathway)
- Data classification verification
- Ongoing security monitoring
- Incident response coordination
- Security review for retirement (data destruction verification)
**Decision Tasks**: Security clearance approval, data classification sign-off, security retirement verification

### Lane_VendorManagement — Vendor Management
**Role**: Third-party relationship and performance management
**Responsibilities**:
- Vendor onboarding and due diligence coordination
- SLA performance monitoring and reporting
- Escalation management with vendors
- Vendor offboarding
- Third-party risk register maintenance
**Decision Tasks**: Vendor due diligence approval, SLA breach escalation, vendor offboarding confirmation

## 14 DMN Decision Table Inventory

| DMN ID | Decision Name | Phase(s) | Inputs | Output(s) |
|--------|--------------|----------|--------|-----------|
| `DMN_PathwaySelection` | Governance Pathway Selection | P1 | riskScore, requestedAmount, dataClassification, vendorType, urgency | selectedPathway: fast-track/standard/enhanced/emergency |
| `DMN_RiskClassification` | Request Risk Classification | P1 | financialExposure, dataClassification, vendorMaturity, regulatoryScope, operationalCriticality | riskLevel: Low/Medium/High/Critical |
| `DMN_DataClassification` | Data Classification | P1, P2 | personalDataPresent, sensitiveCategories, regulatedData, crossBorder | dataClass: Public/Internal/Confidential/Restricted |
| `DMN_VendorTier` | Vendor Tier Assignment | P1, P2 | vendorRevenue, yearsOperating, certifications, regulatoryHistory, marketShare | vendorTier: Tier1/Tier2/Tier3/Tier4 |
| `DMN_AIRiskLevel` | AI System Risk Level | P1, P2 | useCase, autonomyLevel, humanOversight, affectedPopulation, regulatedDomain | aiRiskLevel: Minimal/Limited/High/Unacceptable |
| `DMN_SecurityClearance` | Security Assessment Clearance | P2 | securityRating, openVulnerabilities, complianceCertifications, dataExposure | securityClearance: Approved/ConditionalApproval/Rejected; requiredControls: list |
| `DMN_BudgetApproval` | Budget Approval Authority | P3 | requestedAmount, pathway, budgetCategory | approvalAuthority: Manager/Director/VP/Board; budgetApproved: boolean |
| `DMN_ComplianceGate` | Procurement Compliance Gate | P3 | regulatoryFrameworks, contractTermsPresent, dpaExecuted, securityApproved | complianceGate: Pass/Hold/Fail; blockers: list |
| `DMN_SLAThreshold` | SLA Breach Threshold | P5 | availabilityActual, responseTimeActual, errorRateActual, mttrActual | slaStatus: Green/Amber/Red; escalationRequired: boolean |
| `DMN_AuditFrequency` | Audit Review Frequency | P5 | riskLevel, pathway, regulatoryScope, previousAuditFindings | auditFrequency: Monthly/Quarterly/SemiAnnual/Annual; nextAuditDate: date |
| `DMN_RetirementEligibility` | Retirement Eligibility | P6 | contractEndDate, replacementApproved, dataRetentionMet, regulatoryHoldActive | eligible: boolean; blockers: list; retirementPathway: Standard/Expedited |
| `DMN_EscalationAuthority` | Escalation Approval Authority | Cross-cutting | escalationType, pathwayType, financialImpact | approvalAuthority: Manager/Director/VP/CxO/Board; slaHours: integer |
| `DMN_ExceptionApproval` | Exception Request Authority | Cross-cutting | exceptionType, riskLevel, pathway, requestedVariance | authorityLevel: Manager/Director/VP/Board; requiredJustification: string |
| `DMN_ChangeClassification` | Change Request Classification | P5 | changeScope, riskImpact, regulatoryImpact, costImpact | changeClass: Minor/Standard/Major/Emergency; reEntersPhase: integer |

## Regulatory Frameworks

### OCC 2023-17 — Third-Party Risk Management
**Scope**: All third-party vendor relationships for financial institutions
**Key Requirements**: Risk assessment before engagement, due diligence during selection, contractual protections, ongoing monitoring, exit strategy planning
**Phase Mapping**: P1 (risk assessment), P2 (due diligence), P3 (contract requirements), P5 (ongoing monitoring), P6 (exit strategy)
**BPMN Annotation Pattern**: `@OCC2023-17:§{section}` in task documentation

### SR 11-7 — Model Risk Management
**Scope**: All models used for decision-making including AI/ML, statistical, and financial models
**Key Requirements**: Model inventory, conceptual soundness validation, independent validation, ongoing monitoring, documentation standards
**Phase Mapping**: P1 (model inventory), P2 (validation design), P4 (independent validation), P5 (ongoing monitoring)
**BPMN Annotation Pattern**: `@SR11-7:§{section}` in task documentation
**Triggers DMN**: DMN_AIRiskLevel determines if SR 11-7 applies

### EU AI Act — Artificial Intelligence Systems Regulation
**Scope**: AI systems placed on EU market or affecting EU persons
**Key Requirements**: Risk classification (minimal/limited/high/unacceptable risk), conformity assessment for high-risk systems, technical documentation, transparency obligations, post-market monitoring
**Phase Mapping**: P1 (AI risk classification via DMN_AIRiskLevel), P2 (conformity assessment design), P3 (technical documentation), P4 (testing and validation), P5 (post-market monitoring)
**BPMN Annotation Pattern**: `@EUAIAct:Art{article}` in task documentation
**Triggers DMN**: DMN_AIRiskLevel (Unacceptable → blocked; High → Enhanced pathway mandatory)

### DORA — Digital Operational Resilience Act
**Scope**: ICT risk management for financial entities in EU
**Key Requirements**: ICT risk framework, third-party ICT provider management, contractual requirements, incident reporting, digital operational resilience testing
**Phase Mapping**: P2 (ICT risk assessment, contractual requirements), P3 (contractual requirements), P5 (incident reporting, resilience testing)
**BPMN Annotation Pattern**: `@DORA:Art{article}` in task documentation

### SOX — Sarbanes-Oxley Act (Financial Controls)
**Scope**: Financial reporting controls and IT general controls for public companies
**Key Requirements**: Control design documentation, independent testing, management assessment, auditor attestation
**Phase Mapping**: P2 (control design documentation), P4 (control testing), P5 (control monitoring, evidence collection)
**BPMN Annotation Pattern**: `@SOX:§{section}` in task documentation

### GDPR — General Data Protection Regulation
**Scope**: Processing of personal data of EU data subjects
**Key Requirements**: Lawful basis for processing, data minimization, DPIA for high-risk processing, data processing agreement (DPA), data subject rights procedures, breach notification
**Phase Mapping**: P1 (data classification, lawful basis assessment), P2 (DPIA), P3 (DPA execution), P5 (data subject rights, breach procedures), P6 (data deletion/transfer verification)
**BPMN Annotation Pattern**: `@GDPR:Art{article}` in task documentation
**Triggers DMN**: DMN_DataClassification (Restricted → GDPR enhanced controls required)

## Cross-Phase Integration Points

### Phase Gate Approvals (SLA Governance Board Checkpoints)
- **After Phase 1**: Pathway confirmation and resource allocation (Enhanced pathway only — Governance Board vote)
- **After Phase 2**: Design approval and compliance readiness (Enhanced pathway)
- **After Phase 3**: Contract and build sign-off (Enhanced pathway — Board vote before go-live)
- **After Phase 4**: Go-live authorization (all pathways — Business Owner sign-off; Enhanced — Board record)
- **Annual (Phase 5)**: Annual risk re-assessment and program review (all Active solutions)

### Change Re-Entry Points
Solutions in Phase 5 Operations re-enter the governance lifecycle when changes are classified:
- **Minor change** (DMN_ChangeClassification → Minor): Phase 4 only (change testing and deployment)
- **Standard change**: Phase 2 review → Phase 4 implementation
- **Major change**: Full Phase 2 + Phase 3 + Phase 4 (treated as new Standard procurement)
- **Emergency change**: Emergency pathway — Phase 4 with retroactive Phase 2 review

### Escalation Patterns
Escalation events appear on user tasks throughout all phases. Standard escalation chain:

1. **SLA timer fires** (non-interrupting boundary event) → Notification to assignee manager
2. **2x SLA timer fires** → Escalation to Director level + Governance Board notification
3. **Exception Request** → DMN_ExceptionApproval determines authority level
4. **Cross-functional deadlock** → SLA Governance Board arbitration (Emergency session if needed)

Timer IDs follow the pattern `Timer_P[0-6]_[TaskName]SLA`. End events receiving escalation flows are named `Event_P[0-6]_[TaskName]Escalated`.

## Element ID Quick Reference

| Element Type | Pattern | Example |
|-------------|---------|---------|
| Task (User) | `Task_P[0-6]_[Action]` | `Task_P1_GatherRequirements` |
| Task (Business Rule) | `Task_P[0-6]_[DMNRef]` | `Task_P1_PathwaySelection` |
| Task (Service) | `Service_P[0-6]_[Action]` | `Service_P2_SecurityScan` |
| Gateway (Decision) | `Gateway_P[0-6]_[Decision]` | `Gateway_P1_PathwayDecision` |
| Gateway (Parallel Split) | `Gateway_P[0-6]_[Purpose]Split` | `Gateway_P2_ReviewsSplit` |
| Gateway (Parallel Join) | `Gateway_P[0-6]_[Purpose]Join` | `Gateway_P2_ReviewsJoin` |
| Gateway (Merge) | `Gateway_P[0-6]_[Purpose]Merge` | `Gateway_P2_ReviewsMerge` |
| Start Event | `Event_P[0-6]_Start` | `Event_P1_Start` |
| End Event | `Event_P[0-6]_[Outcome]` | `Event_P1_PathwaySelected` |
| Phase Transition | `Event_P[0-6]_Complete` | `Event_P1_Complete` |
| Timer Boundary | `Timer_P[0-6]_[Task]SLA` | `Timer_P2_ReviewSLA` |
| Error Boundary | `Error_P[0-6]_[Condition]` | `Error_P3_EscalationNeeded` |
| Escalation End | `Event_P[0-6]_[Task]Escalated` | `Event_P2_ReviewEscalated` |
| Lane | `Lane_[RoleName]` | `Lane_BusinessOwner` |
| Subprocess | `Sub_P[0-6]_[Name]` | `Sub_P3_ContractNegotiation` |
| Sequence Flow | `Flow_[SourceID]_To_[TargetID]` | `Flow_Task_P1_GatherReqs_To_GW` |
| Annotation | `Annotation_[Subject]` | `Annotation_OCC2023_17` |

---

**Version**: 2.0.0
**Created**: 2026-03-01
**Platform**: SLA Governance Platform
**Updated from**: `/Users/proth/repos/sla/.claude/context/bpmn/sla-governance-domain.md` v1.0
**Changes in v2.0**: Expanded pathway descriptions (Fast-Track threshold $100K per spec), added full DMN inventory (14 tables), added cross-phase integration points, added escalation patterns, added detailed regulatory framework phase mappings, aligned swim lane IDs with modeling standards
