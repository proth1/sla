# Governance Topic Mapping — Software Onboarding Lifecycle

Reference model: `processes/Onboarding-only/onboarding-to-be-ideal-state-v5.bpmn`

---

## Overview

This document maps 11 governance topics to the tasks, roles, and regulatory hooks within the software onboarding lifecycle. Each topic spans multiple sub-processes and swim lanes; this mapping provides traceability from business intent to process activity.

---

## 1. Intake

**Definition**: Initial request capture, portfolio review, and solution discovery. Covers the activities required to formally receive, validate, and triage a software request before any evaluation begins.

**Responsible Roles** (`candidateGroups`):
- `business-lane` — submits and owns the request
- `governance-lane` — performs initial triage and intake validation

**Process Touchpoints**:

| Task ID | Task Name | Sub-Process |
|---------|-----------|-------------|
| Task_ReviewExisting | Review Existing Portfolio | SP1: Request and Triage |
| Task_LeverageExisting | Leverage Existing Solution | SP1: Request and Triage |
| Task_GatherDocs | Gather Requirements Docs | SP1: Request and Triage |
| Task_SubmitRequest | Submit Formal Request | SP1: Request and Triage |
| Task_InitialTriage | Perform Initial Triage | SP1: Request and Triage |
| Task_CloseRequest | Close and Notify Requester | SP5: UAT and Go-Live |

**Key Evidence**:
- Software request form
- Portfolio inventory lookup result
- Initial triage assessment record
- Closure notification

**Regulatory Hooks**:
- OCC 2023-17 — third-party software inventory management
- NIST CSF 2.0 ID.AM — asset management and discovery

**Decision Gates**:
- `GW_ExistingSolution` — Does an existing solution satisfy the need? (SP1: routes to leverage vs. gather)
- `GW_Triage` — Does the request pass triage? (SP1: routes to planning or denial)

---

## 2. Prioritization

**Definition**: Backlog ranking, pathway selection, and resource allocation. Determines where a validated request falls in the organizational roadmap and which governance pathway applies.

**Responsible Roles** (`candidateGroups`):
- `governance-lane` — owns prioritization and pathway routing decisions

**Process Touchpoints**:

| Task ID | Task Name | Sub-Process |
|---------|-----------|-------------|
| Task_PrelimAnalysis | Preliminary Business Analysis | SP2: Planning and Routing |
| Task_Backlog | Add to Product Backlog | SP2: Planning and Routing |
| Task_PathwayRouting | Pathway Routing Decision | SP2: Planning and Routing |

**Key Evidence**:
- Preliminary business case
- Backlog entry with priority ranking
- Pathway selection record (Buy / Build / both)

**Regulatory Hooks**:
- SOX 302/404 — resource authorization and management control documentation

**Decision Gates**:
- `GW_NeedsFullEval` — Does the request require full evaluation? (SP2: routes to backlog vs. direct routing)
- `GW_BuyOrBuild` — Buy, Build, or both? (top-level: routes to Evaluation & DD or Contracting & Build)

---

## 3. Funding

**Definition**: Financial analysis, budget authorization, and total cost of ownership / return on investment assessment. Establishes fiscal justification before commitments are made.

**Responsible Roles** (`candidateGroups`):
- `finance-lane` — performs financial analysis (TCO, ROI, NPV)
- `business-lane` — provides business case and financial inputs
- `governance-lane` — authorizes budget and approves financial analysis

**Process Touchpoints**:

| Task ID | Task Name | Sub-Process |
|---------|-----------|-------------|
| Task_GatherDocs | Gather Requirements Docs | SP1: Request and Triage |
| Task_PrelimAnalysis | Preliminary Business Analysis | SP2: Planning and Routing |
| Task_FinancialAnalysis | Financial and TCO Analysis | SP3: Evaluation and DD |
| Task_NegotiateContract | Negotiate Contract Terms | SP4: Contracting and Build |

**Key Evidence**:
- Budget authorization memo
- TCO / ROI model
- Cost-benefit analysis
- Contract financial terms

**Regulatory Hooks**:
- SOX 302/404 — financial control and management certification
- OCC 2023-17 Section 40 — cost and financial viability assessment for third-party arrangements

**Decision Gates**:
- `GW_EvalApproved` — Does the evaluation (including financial analysis) pass? (top-level)

---

## 4. Sourcing

**Definition**: Vendor landscape assessment, vendor selection, and procurement execution. Covers the identification, engagement, and selection of external software providers.

**Responsible Roles** (`candidateGroups`):
- `procurement-lane` — responsible for vendor landscape assessment and due diligence
- `governance-lane` — accountable for sourcing decisions
- `compliance-lane` — consulted on vendor eligibility and regulatory fit
- `vendor-response` — external vendor submits proposals and responds to due diligence

**Process Touchpoints**:

| Task ID | Task Name | Sub-Process |
|---------|-----------|-------------|
| Task_FinancialAnalysis | Financial and TCO Analysis | SP3: Evaluation and DD |
| Task_AssessVendorLandscape | Assess Vendor Landscape | SP3: Evaluation and DD |
| Task_VendorDueDiligence | Vendor Due Diligence | SP3: Evaluation and DD |
| Receive_VendorResponse | Await Vendor Response | SP3: Evaluation and DD |
| Task_EvaluateVendorResponse | Evaluate Vendor Response | SP3: Evaluation and DD |
| Task_RefineRequirements | Refine Requirements | SP4: Contracting and Build |
| Task_VendorIntake | Vendor Intake and NDA | Vendor Pool |
| Task_VendorProposal | Prepare Vendor Proposal | Vendor Pool |

**Key Evidence**:
- Vendor shortlist
- Due diligence questionnaire responses
- Vendor evaluation scorecard
- Vendor selection decision record

**Regulatory Hooks**:
- OCC 2023-17 Section 35 — due diligence requirements for third-party selection
- DORA Article 28 — pre-contractual assessment of ICT third-party service providers

**Decision Gates**:
- `GW_EvalApproved` — Did the vendor pass evaluation? (top-level)
- `GW_BuyOrBuild` — Is this a vendor (buy) engagement? (top-level)

---

## 5. Cyber (Cybersecurity)

**Definition**: Security assessment, vulnerability management, and security architecture review. Ensures software meets organizational security standards before and during deployment.

**Responsible Roles** (`candidateGroups`):
- `technical-assessment` — performs security assessments and architecture reviews
- `automation-lane` — executes automated security scanning

**Process Touchpoints**:

| Task ID | Task Name | Sub-Process |
|---------|-----------|-------------|
| Task_TechArchReview | Technical Architecture Review | SP3: Evaluation and DD |
| Task_SecurityAssessment | Security Assessment | SP3: Evaluation and DD |
| Task_PerformPoC | Perform Proof of Concept | SP4: Contracting and Build |
| Task_TechRiskEval | Technical Risk Evaluation | SP4: Contracting and Build |
| Task_DefineBuildReqs | Define Build Requirements | SP4: Contracting and Build |
| PDLC_Development | Development | SP4: SP_PDLC (nested) |
| PDLC_Testing | Testing and QA | SP4: SP_PDLC (nested) |
| Task_OnboardSoftware | Onboard and Configure Software | SP5: UAT and Go-Live |
| Task_VendorSecurityReview | Vendor Security Review | Vendor Pool |

**Key Evidence**:
- Security assessment report
- Penetration test results
- Vulnerability scan output
- Security architecture sign-off
- SDLC security test results

**Regulatory Hooks**:
- NIST CSF 2.0 — identify, protect, detect, respond, recover functions
- ISO 27001 — information security management controls
- DORA Articles 9–11 — ICT security requirements and resilience testing

**Decision Gates**:
- `GW_EvalApproved` — Did security assessment pass? (top-level)
- PDLC `GW_TestsPassed` — Did security / QA tests pass? (SP4 nested)

---

## 6. EA (Enterprise Architecture)

**Definition**: Architecture review, integration planning, and technology standards compliance. Ensures the software fits the enterprise technology landscape and integration patterns.

**Responsible Roles** (`candidateGroups`):
- `technical-assessment` — accountable for architecture review and standards compliance

**Process Touchpoints**:

| Task ID | Task Name | Sub-Process |
|---------|-----------|-------------|
| Task_TechArchReview | Technical Architecture Review | SP3: Evaluation and DD |
| Task_PerformPoC | Perform Proof of Concept | SP4: Contracting and Build |
| Task_TechRiskEval | Technical Risk Evaluation | SP4: Contracting and Build |
| Task_DefineBuildReqs | Define Build Requirements | SP4: Contracting and Build |
| PDLC_ArchReview | Architecture Review | SP4: SP_PDLC (nested) |
| PDLC_Development | Development | SP4: SP_PDLC (nested) |
| PDLC_Integration | Integration Testing | SP4: SP_PDLC (nested) |
| Task_VendorTechDemo | Vendor Technical Demonstration | Vendor Pool |
| Task_VendorDeploySupport | Vendor Deployment Support | Vendor Pool |

**Key Evidence**:
- Architecture review decision
- Integration design document
- Technology standards compliance checklist
- PoC results and architecture fit assessment

**Regulatory Hooks**:
- DORA Article 9 — ICT resilience and architecture standards
- NIST CSF 2.0 PR.PS — platform security and architecture

**Decision Gates**:
- `GW_EvalApproved` — Did architecture review pass? (top-level)
- PDLC `GW_TestsPassed` — Did integration testing pass? (SP4 nested)

---

## 7. Compliance

**Definition**: Regulatory compliance review, legal assessment, and data protection obligations. Verifies the software arrangement satisfies all applicable regulatory requirements.

**Responsible Roles** (`candidateGroups`):
- `compliance-lane` — responsible and accountable for compliance review
- `oversight-lane` — provides independent compliance assurance

**Process Touchpoints**:

| Task ID | Task Name | Sub-Process |
|---------|-----------|-------------|
| Task_InitialTriage | Perform Initial Triage | SP1: Request and Triage |
| Task_RiskCompliance | Risk, Compliance, and Legal Review | SP3: Evaluation and DD |
| Task_VendorDueDiligence | Vendor Due Diligence | SP3: Evaluation and DD |
| Task_RefineRequirements | Refine Requirements | SP4: Contracting and Build |
| PDLC_Testing | Testing and QA | SP4: SP_PDLC (nested) |
| PDLC_Integration | Integration Testing | SP4: SP_PDLC (nested) |
| Task_PerformUAT | Perform User Acceptance Testing | SP5: UAT and Go-Live |
| Task_FinalApproval | Obtain Final Approval | SP5: UAT and Go-Live |
| Task_VendorComplianceReview | Vendor Compliance Review | Vendor Pool |

**Key Evidence**:
- Compliance assessment report
- Legal review sign-off
- Regulatory gap analysis
- Final compliance approval record

**Regulatory Hooks**:
- GDPR / CCPA — data processing and privacy compliance
- SOX — internal controls and financial reporting compliance
- DORA — digital operational resilience compliance
- OCC 2023-17 — third-party compliance obligations

**Decision Gates**:
- `GW_Triage` — Does the request pass initial compliance check? (SP1)
- `GW_EvalApproved` — Did compliance review pass? (top-level)
- `GW_FinalApproved` — Did final compliance approval pass? (SP5)

---

## 8. AI Governance

**Definition**: AI and ML risk classification, model validation, and bias assessment. Applies when the software being onboarded includes AI/ML components requiring additional governance.

**Responsible Roles** (`candidateGroups`):
- `ai-review` — responsible and accountable for AI governance review
- `technical-assessment` — consulted on technical AI implementation
- `compliance-lane` — consulted on regulatory obligations for AI systems

**Process Touchpoints**:

| Task ID | Task Name | Sub-Process |
|---------|-----------|-------------|
| Task_AIGovernanceReview | AI Governance Review | SP3: Evaluation and DD |

**Key Evidence**:
- AI risk classification (SR 11-7 / EU AI Act tier)
- Model validation report
- Bias and fairness assessment
- AI system documentation (intended use, training data, model card)

**Regulatory Hooks**:
- SR 11-7 — model risk management for AI/ML models
- EU AI Act — risk-based classification and conformity assessment
- NIST AI RMF — AI risk management framework
- OCC 2023-17 — third-party AI system oversight

**Decision Gates**:
- `GW_EvalApproved` — Did AI governance review pass? (top-level: AI Governance feeds into overall evaluation approval)

---

## 9. Privacy

**Definition**: Data protection impact assessment (DPIA), data classification, and cross-border data transfer compliance. Ensures personal data is handled lawfully throughout the software lifecycle.

**Responsible Roles** (`candidateGroups`):
- `compliance-lane` — responsible and accountable for privacy review

**Process Touchpoints**:

| Task ID | Task Name | Sub-Process |
|---------|-----------|-------------|
| Task_GatherDocs | Gather Requirements Docs | SP1: Request and Triage |
| Task_PrelimAnalysis | Preliminary Business Analysis | SP2: Planning and Routing |
| Task_RiskCompliance | Risk, Compliance, and Legal Review | SP3: Evaluation and DD |
| Task_RefineRequirements | Refine Requirements | SP4: Contracting and Build |
| Task_PerformPoC | Perform Proof of Concept | SP4: Contracting and Build |
| Task_DefineBuildReqs | Define Build Requirements | SP4: Contracting and Build |

**Key Evidence**:
- Data Protection Impact Assessment (DPIA)
- Data flow diagram and classification
- Data processing agreement (DPA)
- Cross-border transfer mechanism (SCCs, adequacy decision)

**Regulatory Hooks**:
- GDPR Articles 25/28/35/44–49 — privacy by design, processor contracts, DPIA, cross-border transfers
- CCPA — California consumer privacy rights and business obligations

**Decision Gates**:
- `GW_EvalApproved` — Did privacy review pass? (top-level: feeds into overall evaluation)

---

## 10. Commercial Counsel

**Definition**: Contract negotiation, legal terms review, and execution of vendor agreements. Covers the legal and commercial activities required to establish a binding vendor relationship.

**Responsible Roles** (`candidateGroups`):
- `contracting-lane` — responsible and accountable for contract negotiation and execution
- `vendor-response` — external vendor reviews and executes contracts

**Process Touchpoints**:

| Task ID | Task Name | Sub-Process |
|---------|-----------|-------------|
| Task_NegotiateContract | Negotiate Contract Terms | SP4: Contracting and Build |
| Task_FinalizeContract | Finalize and Execute Contract | SP4: Contracting and Build |
| Task_VendorContractReview | Vendor Contract Review | Vendor Pool |
| Task_VendorContractSign | Vendor Contract Execution | Vendor Pool |

**Key Evidence**:
- Negotiated contract draft
- Legal review sign-off
- Executed master services agreement (MSA) / SLA
- Contract register entry

**Regulatory Hooks**:
- OCC 2023-17 Section 60 — contractual provisions required for third-party arrangements
- DORA Article 30 — mandatory contractual requirements for ICT third-party service providers

**Decision Gates**:
- `GW_ContractSigned` — Was the contract successfully executed? (SP4: routes to build/deploy or re-negotiation)

---

## 11. TPRM (Third-Party Risk Management)

**Definition**: Vendor lifecycle management, ongoing monitoring, and concentration risk assessment. Ensures third-party relationships are assessed, governed, and monitored throughout the software lifecycle.

**Responsible Roles** (`candidateGroups`):
- `governance-lane` — responsible and accountable for TPRM program
- `compliance-lane` — consulted on regulatory TPRM obligations
- `oversight-lane` — provides independent TPRM assurance

**Process Touchpoints**:

| Task ID | Task Name | Sub-Process |
|---------|-----------|-------------|
| Task_InitialTriage | Perform Initial Triage | SP1: Request and Triage |
| Task_RiskCompliance | Risk, Compliance, and Legal Review | SP3: Evaluation and DD |
| Task_AssessVendorLandscape | Assess Vendor Landscape | SP3: Evaluation and DD |
| Task_VendorDueDiligence | Vendor Due Diligence | SP3: Evaluation and DD |
| Task_EvaluateVendorResponse | Evaluate Vendor Response | SP3: Evaluation and DD |
| Task_TechRiskEval | Technical Risk Evaluation | SP4: Contracting and Build |
| Task_NegotiateContract | Negotiate Contract Terms | SP4: Contracting and Build |
| Task_FinalizeContract | Finalize and Execute Contract | SP4: Contracting and Build |
| Task_FinalApproval | Obtain Final Approval | SP5: UAT and Go-Live |
| Task_OnboardSoftware | Onboard and Configure Software | SP5: UAT and Go-Live |
| Task_VendorIntake | Vendor Intake and NDA | Vendor Pool |
| Task_VendorOnboarding | Vendor System Onboarding | Vendor Pool |
| Task_VendorCloseRequest | Vendor Close and Confirm | Vendor Pool |

**Key Evidence**:
- Third-party risk assessment (TPRA)
- Vendor risk tier classification
- Concentration risk analysis
- Ongoing monitoring plan
- Vendor register entry

**Regulatory Hooks**:
- OCC 2023-17 (all sections) — comprehensive third-party risk management lifecycle
- DORA Article 28 — ICT third-party risk management framework
- NIST CSF 2.0 GV.SC — supply chain risk management governance

**Decision Gates**:
- `GW_Triage` — Does the vendor/request pass initial TPRM screening? (SP1)
- `GW_EvalApproved` — Did TPRM assessment pass? (top-level)
- `GW_FinalApproved` — Did final TPRM sign-off pass? (SP5)

---

## RACI Matrix

| Topic | Business | Governance | **Finance** | Procurement | Contracting | Tech Assessment | AI Review | Compliance | Oversight | Automation | Vendor |
|-------|----------|------------|-------------|-------------|-------------|----------------|-----------|------------|-----------|------------|--------|
| Intake | R/A | C | C | | | | | C | | | |
| Prioritization | C | R/A | C | | | C | | | | | |
| Funding | | C | **R/A** | C | | | | | I | | |
| Sourcing | | A | | R | | C | | C | I | | R |
| Cyber | | C | | | | R/A | | C | | | C |
| EA | | C | | | | R/A | | | | | C |
| Compliance | | C | | | | | | R/A | C | | C |
| AI Governance | | I | | | | C | R/A | C | | | |
| Privacy | C | C | | | | | | R/A | | | |
| Comm. Counsel | | C | C | | R/A | | | C | I | | R |
| TPRM | | R/A | | C | C | C | | C | C | C | C |

**R** = Responsible (does the work) | **A** = Accountable (owns the outcome) | **C** = Consulted (input required) | **I** = Informed (kept up to date)

> **Note**: `finance-lane` was split from `governance-lane` in v5.1 to provide functional separation for financial analysis activities (Task_FinancialAnalysis). Task_RefineRequirements and Task_DefineBuildReqs were reassigned from `governance-lane` to `business-lane`.

### Task-Level RACI Detail

| Task ID | R | A | C | I |
|---------|---|---|---|---|
| Task_ReviewExisting | Business | Business | Governance | |
| Task_LeverageExisting | Business | Business | Governance | |
| Task_GatherDocs | Business | Business | Finance, Privacy | |
| Task_SubmitRequest | Business | Business | Governance | |
| Task_InitialTriage | Governance | Governance | Compliance, TPRM | Business |
| Task_PrelimAnalysis | Governance | Governance | Finance, Privacy | Business |
| Task_Backlog | Governance | Governance | Business | |
| Task_PathwayRouting | Governance | Governance | Business, Technical Assessment | |
| Task_TechArchReview | Technical Assessment | Technical Assessment | Governance | |
| Task_SecurityAssessment | Technical Assessment | Technical Assessment | Compliance | |
| Task_RiskCompliance | Compliance | Compliance | Governance, Privacy | |
| Task_FinancialAnalysis | Finance | Finance | Governance, Procurement | |
| Task_AssessVendorLandscape | Procurement | Procurement | Governance | Oversight |
| Task_AIGovernanceReview | AI Review | AI Review | Technical Assessment, Compliance | Governance |
| Task_VendorDueDiligence | Procurement | Governance | Compliance | Oversight |
| Receive_VendorResponse | Procurement | Procurement | | |
| Task_EvaluateVendorResponse | Procurement | Governance | Technical Assessment | |
| Task_RefineRequirements | Business | Governance | Technical Assessment, Compliance | |
| Task_PerformPoC | Technical Assessment | Technical Assessment | Business, Compliance | |
| Task_TechRiskEval | Technical Assessment | Technical Assessment | Governance, Compliance | |
| Task_NegotiateContract | Contracting | Contracting | Finance, Governance | Oversight |
| Task_FinalizeContract | Contracting | Contracting | Governance, Compliance | Oversight |
| Task_DefineBuildReqs | Business | Business | Technical Assessment, Privacy | Governance |
| PDLC_ArchReview | Technical Assessment | Technical Assessment | Governance | |
| PDLC_Development | Technical Assessment | Technical Assessment | Business | |
| PDLC_Testing | Technical Assessment | Technical Assessment | Compliance | |
| PDLC_Integration | Technical Assessment | Technical Assessment | Compliance | |
| Task_PerformUAT | Business | Business | Compliance | Governance |
| Task_FinalApproval | Oversight | Oversight | Governance, Compliance | Business |
| Task_OnboardSoftware | Automation | Automation | Technical Assessment | Governance |
| Activity_0zf4l0g | Automation | Governance | | Business |
| Task_CloseRequest | Governance | Governance | Business | Oversight |

---

## Coverage Summary by Sub-Process

| Sub-Process | Topics Covered | Primary Topics |
|-------------|---------------|----------------|
| SP1: Request and Triage | 4 | Intake, Compliance, TPRM, Privacy |
| SP2: Planning and Routing | 3 | Prioritization, Funding, Privacy |
| SP3: Evaluation and DD | 8 | Cyber, EA, Compliance, Sourcing, TPRM, Funding, Privacy, AI Governance |
| SP4: Contracting and Build | 7 | EA, Cyber, Compliance, Privacy, Sourcing, Commercial Counsel, TPRM |
| SP5: UAT and Go-Live | 4 | Compliance, TPRM, Cyber, Intake |
| Vendor Pool | 6 | Sourcing, TPRM, Cyber, Compliance, EA, Commercial Counsel |

### Topic Density Heat Map (by Sub-Process)

| Topic | SP1 | SP2 | SP3 | SP4 | SP5 | Vendor |
|-------|-----|-----|-----|-----|-----|--------|
| Intake | ++ | | | | + | |
| Prioritization | | ++ | | | | |
| Funding | + | + | + | + | | |
| Sourcing | | | ++ | + | | ++ |
| Cyber | | | ++ | ++ | + | + |
| EA | | | ++ | ++ | | + |
| Compliance | + | | ++ | + | ++ | + |
| AI Governance | | | ++ | | | |
| Privacy | + | + | + | ++ | | |
| Commercial Counsel | | | | ++ | | ++ |
| TPRM | + | | ++ | ++ | + | ++ |

`++` = primary touchpoint (2+ tasks) | `+` = secondary touchpoint (1 task)

---

*Updated: 2026-03-05 | Source: onboarding-to-be-ideal-state-v5.bpmn | Changes: finance-lane split, task-level RACI, 3 candidateGroup reassignments*
