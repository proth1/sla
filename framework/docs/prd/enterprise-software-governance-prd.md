# Enterprise Software Governance Platform
## Product Requirements Document

| Property | Value |
|----------|-------|
| **Document Type** | Product Requirements Document (PRD) |
| **Classification** | Internal / Confidential |
| **Version** | 1.0 |
| **Date** | March 2026 |
| **Framework Version** | 2.0 — Comprehensive End-to-End Lifecycle |
| **Governance Owner** | Enterprise Architecture / Technology Governance |
| **Approval Authority** | Technology Governance Council / Risk Governance Council |
| **Source Specification** | Enterprise_Software_Governance_Master.md v2.0 |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Vision](#2-product-vision)
3. [Target Personas](#3-target-personas)
4. [Problem Statement](#4-problem-statement)
5. [Feature Requirements by Phase](#5-feature-requirements-by-phase)
6. [Decision Model Requirements](#6-decision-model-requirements)
7. [Agent Framework Requirements](#7-agent-framework-requirements)
8. [Regulatory Requirements](#8-regulatory-requirements)
9. [Non-Functional Requirements](#9-non-functional-requirements)
10. [Architecture](#10-architecture)
11. [Data Model](#11-data-model)
12. [Integration Requirements](#12-integration-requirements)
13. [Success Metrics](#13-success-metrics)
14. [Implementation Roadmap](#14-implementation-roadmap)
15. [Risks and Mitigations](#15-risks-and-mitigations)

---

## 1. Executive Summary

### 1.1 Framework Purpose

The Enterprise Software Governance Platform is an end-to-end lifecycle governance framework designed for financial services institutions regulated under OCC, Federal Reserve, FDIC, FINRA, or SEC jurisdiction. The platform governs every instance in which an institution acquires, builds, enables, or renews software — from idea inception through post-deployment monitoring and retirement.

The platform integrates four domain disciplines into a single, orchestrated BPMN workflow:

- **TPRM (Third-Party Risk Management):** Full six-stage vendor lifecycle per OCC Bulletin 2023-17, with proportionate due diligence, ongoing monitoring, and termination management calibrated to vendor risk tier.
- **AI Governance (Model Risk Management):** SR 11-7-aligned architecture for all AI-enabled components, including concurrent risk classification at intake, independent validation pathways, model inventory governance, and mandatory observability telemetry.
- **PDLC (Product Development Life Cycle):** Engineering-led build pathway with risk-gated milestones, observability designed from Day 1, and SR 11-7 AI Governance checklist enforcement.
- **SLA Management:** ISO 8601 timer events, real-time queue visibility, escalation rules, and bottleneck detection across all phases.

### 1.2 Key Outcomes

The platform SHALL deliver the following outcomes to the institution:

- **Cycle time compression:** Standard-risk software onboarding from industry average of 90-120 days to a best-practice target of 29-45 days (68-75% reduction).
- **Automation:** Approximately 60% average automation across all phases, rising to 75%+ for intake, routing, and monitoring tasks.
- **Capability reuse:** Target 30%+ of intake requests resolved via registry-detected reuse or redirect before portfolio entry.
- **Compliance assurance:** Zero control gaps at regulatory examination; 100% decision provenance logging.
- **Audit readiness:** Complete decision event log retrievable within 24 hours for any specified request ID or date range.

### 1.3 Target Audience

This PRD is addressed to:
- Technology Governance Council
- Enterprise Architecture function
- Product Management and Portfolio Governance teams
- Third-Party Risk Management function
- AI/Model Risk Governance function
- Compliance and Internal Audit functions

---

## 2. Product Vision

### 2.1 Core Design Philosophy

> Deterministic-first, AI-augmented. Every material routing and approval decision is governed by explicit, auditable rules (DMN). Agents and AI accelerate intake, enrichment, classification, and generation — but never make unmonitored, unexplained decisions that affect business or regulatory outcomes. All activities — human, automated, or agent-enabled — are orchestrated and observable within a single BPMN workflow.

The platform MUST embody three foundational principles:

1. **Deterministic knowledge capture** that front-loads information harvesting to compress downstream cycle times. The system SHALL collect all information required by downstream phases at the earliest possible lifecycle stage.
2. **Automation-first design** that identifies every opportunity for AI-driven acceleration across the lifecycle. Automation SHALL be evidence-driven: a task becomes eligible for automation only after it has been executed manually at least 10 times with consistent, documented outcomes.
3. **Governance-by-design** that ensures no control gaps exist between TPRM, AI governance, legal, risk, compliance, security, and regulatory obligations.

### 2.2 BPMN-First Architecture Mandate

Every phase of the framework SHALL map to an executable BPMN sub-process. Every decision gate SHALL map to a DMN Business Rules Task. Every task SHALL be observable, time-bound, and measurable. Every role SHALL map to a BPMN swim lane. The framework is designed for direct translation into Camunda Platform 7 executable BPMN.

### 2.3 Task Type Classification

Every task within the BPMN workflow SHALL be explicitly classified as one of three types:

| Designation | Definition | Governance Requirement |
|---|---|---|
| **A (Automated)** | Fully automated execution with no human intervention. Inputs and outputs are deterministic. | DMN rules govern logic. All inputs/outputs logged to decision audit trail. SLA timers enforced. |
| **DA (Deterministic Agent-Enabled)** | Agent executes using deterministic knowledge bases and DMN rules. Outputs are reproducible. Decision provenance is logged. | Agent outputs must be deterministic and reproducible. Knowledge base version logged. Decision provenance captured. |
| **H (Human-in-the-Loop)** | Human judgment required. May be informed by agent analysis, but the human makes the decision and is accountable. | Human reviewer role logged (not personal identity). Override rationale captured (minimum 50 characters). SLA clock enforced. |

---

## 3. Target Personas

*Source: Spec Section 4*

### 3.1 Business Requestor

**Role:** Identifies capability gap; submits and monitors requests.
**Decision Authority:** Submits requests; no approval authority.
**Task Type:** H (Human-in-the-Loop).
**BPMN Lane:** Requestor.
**Core Needs:** Self-service intake portal with real-time status visibility; guided elicitation that enforces completeness without requiring governance expertise; SLA clock visibility.
**Pain Points:** Unclear process; requests lost in email; no visibility into approval status; repeated requests for the same information.

### 3.2 Product Owner

**Role:** Quarterbacks each request from intake through delivery; validates PRD completeness; coordinates SME reviews; manages backlog.
**Decision Authority:** Information gating; backlog entry approval.
**Task Type:** H.
**BPMN Lane:** Product Management.
**Core Needs:** Centralized view of all in-flight requests; automated PRD generation as starting point; deduplication alerts; portfolio sequencing tools.
**Pain Points:** Manual PRD drafting from scratch; duplicate requests; inability to see cross-portfolio dependencies.

### 3.3 Enterprise Architect

**Role:** Evaluates technical fit, integration dependencies, platform alignment, HLDD quality, and architecture standards adherence; approves PoC scope; signs off on build integration.
**Decision Authority:** Technical acceptance; PoC gate sign-off.
**Task Type:** H.
**BPMN Lane:** Technology.
**Core Needs:** Integration dependency map from CMDB; standardized HLDD template; PoC evaluation rubric; SLA for review turnaround.
**Pain Points:** Ad hoc review requests without context; no visibility into downstream integration impacts; repeat reviews due to incomplete initial submissions.

### 3.4 Procurement Lead

**Role:** Owns vendor sourcing strategy; constructs and issues RFP; manages sourcing event and vendor evaluation; negotiates commercial terms.
**Decision Authority:** RFP release; vendor selection recommendation.
**Task Type:** H.
**BPMN Lane:** Procurement and TPRM.
**Core Needs:** Legal Knowledge Graph for RFP clause assembly; vendor tier assignment from DMN; contract template matching; TPRM coordination.
**Pain Points:** Manual clause selection; legal review bottlenecks; incomplete vendor evidence at contracting stage.

### 3.5 Third-Party Risk Manager

**Role:** Conducts vendor risk tiering; maintains Vendor Register; coordinates due diligence program; executes Risk Assessment Evaluation; manages ongoing monitoring and incident escalations.
**Decision Authority:** Vendor risk tier assignment; RAE approval.
**Task Type:** H / DA.
**BPMN Lane:** Procurement and TPRM.
**Core Needs:** Automated vendor risk tiering via DMN-06; Trust Center integration for evidence ingestion; continuous monitoring dashboard; AI agent swarm for evidence analysis.
**Pain Points:** Manual SOC 2 review (35-60 min/report); evidence collection delays; no continuous monitoring between annual reviews.

### 3.6 AI / Model Risk Governance Lead

**Role:** Classifies AI risk at intake; maintains Model Risk Inventory; validates AI models per SR 11-7; approves AI Governance checklist; defines observability and drift monitoring requirements.
**Decision Authority:** Model inventory entry; AI use approval; escalation to executive sponsor.
**Task Type:** H / DA.
**BPMN Lane:** Risk and Compliance.
**Core Needs:** Automated AI risk tier classification via DMN-09; model card pre-population from intake data; drift monitoring dashboard; independent validation workflow.
**Pain Points:** AI deployments discovered post-facto; inconsistent model documentation; no systematic drift monitoring.

### 3.7 Cybersecurity Lead

**Role:** Evaluates security posture, data classification, access model, encryption, pen test results, and incident history; reviews vendor SBOMs; approves security-related RAE elements.
**Decision Authority:** Security clearance; RAE security sign-off.
**Task Type:** H.
**BPMN Lane:** Technology.
**Core Needs:** Automated external attack surface scanning; SBOM integration with NVD; security rating feed integration (BitSight, SecurityScorecard); standardized security checklist.
**Pain Points:** Point-in-time assessments insufficient; Nth-party visibility gaps; manual pen test result review.

### 3.8 Legal Counsel

**Role:** Reviews and approves MSA, DPAs, IP clauses, liability caps, and regulatory compliance provisions; accesses Legal Knowledge Graph for clause selection; approves final contracts.
**Decision Authority:** Contract approval; legal sign-off.
**Task Type:** H.
**BPMN Lane:** Procurement and TPRM.
**Core Needs:** Legal Knowledge Graph with versioned clause library; AI-assisted redline review; mandatory clause validation against regulatory requirements; precedent outcome access.
**Pain Points:** Vendor redlines with non-negotiable gap detection done manually; no systematic clause version tracking; ad hoc regulatory clause lookup.

### 3.9 Finance Controller

**Role:** Confirms budget availability; validates Total Cost of Ownership model; integrates contract financials into FP&A; approves funding confirmation for final contracting.
**Decision Authority:** Funding confirmation.
**Task Type:** H.
**BPMN Lane:** Risk and Compliance.
**Core Needs:** DMN-08 funding gate integration; TCO model template; budget year tracking; FP&A integration for contract financials.
**Pain Points:** Last-minute budget confirmation requests; incomplete TCO models; no advance visibility into pipeline funding requirements.

### 3.10 Portfolio Governance Council

**Role:** Cross-functional governance body making Go/No-Go, Buy vs. Build, and portfolio sequencing decisions.
**Decision Authority:** Go/No-Go; Buy/Build; budget release authority.
**Task Type:** H.
**BPMN Lane:** Governance.
**Core Needs:** Consolidated portfolio view with DMN-04 and DMN-05 pre-computed recommendations; human override logging; bi-weekly cadence with ad hoc escalation path.
**Pain Points:** Incomplete submissions requiring re-review; no portfolio-wide dependency visibility; override rationale not captured for audit.

### 3.11 Internal Audit

**Role:** Periodically reviews TPRM program, AI governance, and decision audit logs for SR 11-7 and OCC compliance; provides independent assurance to Board and regulators.
**Decision Authority:** Audit findings and control gap reporting.
**Task Type:** H.
**BPMN Lane:** Audit.
**Core Needs:** Read-only access to WORM decision audit log; pre-built regulatory exam package; control framework coverage reports; AI model inventory with validation evidence.
**Pain Points:** Manual evidence collection for regulatory exams; inconsistent decision documentation; AI deployments not systematically inventoried.

---

## 4. Problem Statement

### 4.1 Root Cause Analysis

Financial services institutions face a compounding governance failure driven by four root causes:

**Fragmented Process Architecture:** Software acquisition and development are managed through disconnected processes — TPRM in one silo, AI governance in another, procurement in a third, with no single orchestrating workflow. This fragmentation produces handoff failures, duplicate reviews, and governance gaps at the seams between functions.

**Reactive, Serial Information Collection:** Information required in later phases (contracting, due diligence, compliance validation) is only requested after earlier phases complete. This serial dependency chain — rather than parallel, front-loaded collection — is the primary driver of 90-120 day cycle times.

**Informal Decision Logic:** Material governance decisions (pathway routing, risk tier assignment, vendor selection, Go/No-Go) are made through informal email reviews, committee judgment without documented criteria, and ad hoc spreadsheet scoring. This produces inconsistent outcomes, unexplainable decisions, and regulatory defensibility gaps.

**Duplicate Spend and Shadow IT:** Without a continuously-maintained Software Asset Registry, institutions routinely procure capabilities they already own, fail to surface reuse opportunities, and discover shadow IT only after regulatory examination.

### 4.2 Quantified Impact

| Problem | Current State | Target State |
|---|---|---|
| End-to-end cycle time (standard risk) | 90-120 days industry average | 29-45 days (68-75% reduction) |
| Manual governance decision logic | Informal, inconsistent | 15 formalized DMN tables, 100% rule coverage |
| AI model inventory coverage | Partial, ad hoc | 100% SR 11-7 tiered, monitored |
| Duplicate procurement rate | 20-30% estimated | <5% with registry-driven reuse gate |
| Regulatory exam preparation | 5-10 days manual assembly | 24-hour automated retrieval |
| Shadow IT detection | Reactive (audit-discovered) | Continuous SSO/spend detection |

### 4.3 Scope of Applicability

The platform governs every instance of software acquisition or development including:
- Net-new software acquisitions from commercial vendors (SaaS, PaaS, licensed software)
- Internal software development initiatives (new capabilities, platforms, significant enhancements)
- AI and machine learning model acquisitions and deployments (subject to SR 11-7 / NIST AI RMF)
- Open-source software adoption in production environments
- Significant upgrades or contract renewals where the risk profile materially changes
- Shadow IT identified through continuous Software Asset Management scanning

**Exclusions:** Minor software updates and patches governed by Change Management; emergency break-fix activities governed by Incident Management; hardware procurement.

---

## 5. Feature Requirements by Phase

### 5.1 Phase 0: Software Asset Intelligence

*See BPMN reference: `processes/phase-0-asset-intelligence/`*

#### 5.1.1 Software Registry

**REQ-P0-001:** The system SHALL maintain a continuously-updated Software Registry as the single authoritative source of all software assets.

**REQ-P0-002:** The Software Registry SHALL federate data from the following sources:
- Configuration Management Database (CMDB): all deployed applications and services with version, owner, business unit, integration dependencies, data classification, environment, and operational status
- Software Asset Management (SAM) Tool: license entitlements, actual seat utilization, renewal dates, contract values, compliance status, and vendor contact records
- Internal source code repositories (GitHub Enterprise / Bitbucket / Azure DevOps): automated scanning for internally built libraries, microservices, APIs, SDKs, and in-flight builds
- SaaS spend analytics and SSO integration: cross-referenced with expense management and card spend to detect shadow IT
- Active Vendor Contract Repository: all current MSAs, SaaS agreements, professional services contracts, and addenda
- In-flight development backlog (Jira / Azure DevOps): all initiatives currently approved, in development, or in procurement
- Retired and Decommissioned Asset Register: intentionally retired tools with decommission rationale
- Open-Source Registry: all open-source components approved for enterprise use

**REQ-P0-003:** The Software Registry SHALL expose a real-time API to the Phase 1 Intake Bot and Phase 2 Routing Engine. Every intake query SHALL include an automated Software Registry lookup before human review begins. (Task Type: A)

**REQ-P0-004:** The system SHALL perform automated nightly reconciliation across all data sources with delta alerting for new, changed, or expired assets. (Task Type: A)

**REQ-P0-005:** The system SHALL enforce registry refresh SLAs: any change to a production system SHALL be reflected in the registry within 24 hours; new contract entries within 48 hours of signature.

**REQ-P0-006:** The system SHALL implement license utilization alerting: any software asset with utilization below 40% of licensed seats SHALL generate a reuse recommendation workflow. (Task Type: DA)

**REQ-P0-007:** The system SHALL implement shadow IT triage: SSO-identified applications not registered in the procurement system SHALL trigger an automated intake workflow. (Task Type: A)

**REQ-P0-008:** The system SHALL collect SBOMs (SPDX / CycloneDX format) for all internally built assets, stored in the registry and linked to NVD scanning. (Task Type: A)

**REQ-P0-009:** The Software Asset Manager SHALL conduct a quarterly reconciliation audit of registry records against vendor invoices and CMDB configuration items. (Task Type: H)

#### 5.1.2 Registry-to-Intake Query Interface

**REQ-P0-010:** When a requestor begins an intake session, the system SHALL automatically execute a semantic search against the Software Registry using the capability description. Results SHALL be returned in four categories:
- **Exact match (>90% similarity):** Requestor redirected to ITSM service catalog. No further intake required. (Task Type: A)
- **Partial capability match (70-90% similarity):** Product Owner notified; structured reuse assessment scheduled within 5 business days. (Task Type: H)
- **In-flight backlog match:** Requestor offered option to merge with existing initiative or proceed as separate with documented rationale. (Task Type: H)
- **Retired/decommissioned match:** Decommission rationale surfaced and included in intake record. (Task Type: DA)

---

### 5.2 Phase 1: Conversational AI Intake

*See BPMN reference: `processes/phase-1-needs-assessment/intake-risk-classification.bpmn`*

#### 5.2.1 Conversational Intake Bot

**REQ-P1-001:** The system SHALL implement a structured conversational AI intake mechanism — not a static form. The bot SHALL enforce completeness through progressive elicitation, validate each response, and branch question logic based on prior answers. (Task Type: A with DA enrichment)

**REQ-P1-002:** The Intake Bot SHALL implement the following design standards:
- Guided progressive disclosure: one targeted question at a time, branching based on previous responses
- Context-aware personalization: the bot SHALL know the requestor's business unit, existing entitlements from the Software Registry, and open backlog initiatives
- Completeness enforcement: submission SHALL only be possible when all pathway-specific required fields have been validated
- Scoring transparency: the bot SHALL display the requestor's preliminary risk score and pathway routing as it develops
- Session persistence: conversational state SHALL be saved; sessions SHALL be paused and resumed
- Immutable conversation log: every exchange SHALL be written to an append-only event store with timestamp, session ID, and requestor role

**REQ-P1-003:** The Intake Bot SHALL collect structured intake fields across nine domains:

| Domain | Fields Collected |
|---|---|
| Business Context | Problem statement; affected user population; impacted business process; annual transaction volume; SLA expectations; urgency driver |
| Capability Definition | Natural language feature description; capability category; sub-domain classification |
| Value Quantification | Estimated annual business value; strategic alignment score; ROI timeframe |
| Data and Privacy | Data classification; data residency; retention obligations; third-party data sharing; applicable privacy regulations |
| AI / Automation Flags | AI-enabled (Y/N); model type; training data source; inference frequency; human-in-the-loop provisions; output type |
| Integration Requirements | Systems requiring integration; API protocols; SSO/IAM requirements; data volumes and latency; network segmentation |
| Regulatory and Compliance | Applicable regulations; specific control requirements; auditability and record retention; cross-border regulatory flags |
| Resource and Timeline | Desired go-live date; business event drivers; internal resource availability; budget range |
| Vendor Context (Buy) | Known vendor preference; incumbent relationships; open-source consideration; prior vendor performance data |

#### 5.2.2 Mandatory Capability Reuse Gate (DMN-15)

**REQ-P1-004:** The system SHALL implement a Mandatory Capability Reuse Gate that fires automatically after the Intake Bot has collected sufficient capability definition data. This gate SHALL execute before any downstream design or build activity proceeds. (Task Type: DA)

**REQ-P1-005:** The Capability Reuse Gate SHALL execute the following sequence:
- Step 1: Registry Query using capability description, category, sub-domain, and integration requirements with semantic similarity scoring (Task Type: A)
- Step 2: Reuse Potential Test for matches scoring above 70%, evaluating functional requirements, integration compatibility, license availability, and security posture (Task Type: DA)
- Step 3: Decision Rationale Logging with full provenance (registry version, query timestamp, agent version, knowledge base version) (Task Type: A)

**REQ-P1-006:** The system SHALL apply DMN-15 to govern the reuse decision. See Section 6 for the full DMN-15 specification.

#### 5.2.3 Concurrent Five-Dimension Risk Classification

**REQ-P1-007:** The system SHALL implement a concurrent, automated risk assessment engine that classifies each request across five dimensions simultaneously during intake. (Task Type: A with DA enrichment for complex classifications)

**REQ-P1-008:** The five classification dimensions SHALL be:
- **Dimension 1 — Model Risk Tier (SR 11-7 / NIST AI RMF):** Tier 1 (High): model outputs materially influence credit underwriting, regulatory capital, fraud decisioning, or consumer-facing compliance decisions; Tier 2 (Moderate): material operational impact, not directly embedded in regulated financial decisions; Tier 3 (Low): automation/productivity tools with no model risk exposure
- **Dimension 2 — Data Privacy and Residency Risk:** PII/NPI handling triggers GDPR/CCPA/GLB compliance review, mandatory DPA, data residency verification, and deletion/portability provisions
- **Dimension 3 — Cybersecurity Risk Score:** Composite score across external connectivity, authentication model, data sensitivity, network segmentation, and incident response obligations
- **Dimension 4 — Operational and Concentration Risk:** Critical activity designation per OCC definition; concentration risk assessment per BCBS d577
- **Dimension 5 — Regulatory Classification:** Automated tagging of applicable regulatory frameworks based on business function, data types, AI flags, and distribution channel

**REQ-P1-009:** Early compliance validation SHALL fire during Phase 1 as DA tasks:
- Regulatory applicability scan against Regulatory Requirements Knowledge Base
- Data classification validation against the Data Governance Knowledge Base
- AI risk tier assignment per DMN-09
- Compliance governance notification when regulatory flags are raised (structured notification, not email)

#### 5.2.4 PRD Auto-Generation Pipeline

**REQ-P1-010:** Upon completion of intake, reuse gate, and risk classification, the system SHALL automatically generate a structured Product Requirements Document. (Task Type: A with DA enrichment)

**REQ-P1-011:** The auto-generated PRD SHALL include:
- Cover: request ID; date; requestor business unit; pathway assignment; preliminary risk scores; Product Owner assigned
- Problem Statement and Opportunity Definition
- Functional Requirements (from capability definition and integration fields)
- Non-Functional Requirements (performance SLAs, availability, security classification, data residency, DR objectives)
- Regulatory Requirements (auto-populated from regulatory classification output with specific regulation and clause citations)
- AI Governance Requirements (if AI-enabled: model card template pre-populated; observability requirements; drift monitoring cadence; human-in-the-loop specification)
- Capability Reuse Assessment Summary (DMN-15 output with decision rationale)
- Preliminary Acceptance Criteria (AI-generated, reviewed and approved by Product Owner)

#### 5.2.5 Backlog Automation

**REQ-P1-012:** Upon Product Owner approval of the PRD, the system SHALL automatically push artifacts to the designated development project management tool. (Task Type: A)

**REQ-P1-013:** The backlog automation SHALL create:
- Parent Epic mapped to the full PRD with bi-directional document link; tagged with risk tier, regulatory flags, and TPRM status
- Feature Stories: one per functional requirement, formatted as user stories with acceptance criteria in Gherkin format
- Technical Notes and Dependency Flags pre-populated from architecture and integration fields
- Story Point Estimates: AI-generated rough sizing (S/M/L/XL) based on historical comparables — subject to Engineering refinement
- Git Repository Linkage: feature branch naming convention applied; initial branch created; branch protection rules applied

---

### 5.3 Phase 2: AI Routing Engine

*See BPMN reference: `processes/phase-2-routing/`*

**REQ-P2-001:** The system SHALL implement a three-tier routing architecture that applies tiers in sequence, stopping at the first tier producing a high-confidence result:
- **Tier 1 — Deterministic DMN Rules (A):** DMN-01 fires against structured fields; if a rule matches with unambiguous inputs, the result is applied immediately and logged with the rule ID
- **Tier 2 — Deterministic Agent-Enabled Semantic Classification (DA):** Applied when structured fields alone are insufficient; agent reasoning trace captured and stored; agent uses deterministic knowledge bases only
- **Tier 3 — Human Review Escalation (H):** Any case where neither Tier 1 nor Tier 2 produces confidence ≥85% is escalated to the Product Owner with candidate routes and confidence scores

**REQ-P2-002:** The Routing Engine SHALL compute a composite score across five weighted dimensions:

| Dimension | Weight | Inputs |
|---|---|---|
| Strategic Value | 25% | Business value quantification; strategic alignment; user population; SLA criticality |
| Risk Score | 30% | AI risk tier; data classification; cybersecurity score; regulatory flags; concentration risk |
| Complexity Score | 20% | Integration count; data domain breadth; build vs. buy complexity estimate |
| Portfolio Fit | 15% | Current backlog capacity; resource availability; strategic theme alignment; duplicate probability |
| Urgency | 10% | Go-live date delta; regulatory or contractual deadline; business event driver |

**REQ-P2-003:** Upon pathway assignment, the system SHALL start the SLA clock for the assigned pathway. The pathway assignment, composite score, confidence level, and DMN rule ID or agent reasoning trace SHALL be logged to the decision audit trail.

**REQ-P2-004:** The system SHALL support four pathways:

| Pathway | Trigger | Typical Cycle Time |
|---|---|---|
| Fast-Track | Internal use; no AI; pre-approved vendor or existing license; low risk | 1-5 business days |
| Build | Net-new internal development; no viable commercial solution | 8-26 weeks |
| Buy | Commercial solution identified; vendor not yet contracted | 6-16 weeks |
| Hybrid | Buy commercial core; build proprietary extension | 10-20 weeks |

---

### 5.4 Phase 3: Product Management Review

*See BPMN reference: `processes/phase-3-product-review/`*

**REQ-P3-001:** The Product Owner SHALL review the AI-generated PRD for accuracy and completeness; validate business context, functional requirements, and acceptance criteria. (Task Type: H with DA support)

**REQ-P3-002:** The system SHALL apply DMN-02 (Information Completeness Gate) to govern whether the request proceeds to portfolio or returns for enrichment. All conditions must be satisfied for Proceed to fire. (Task Type: A)

**REQ-P3-003:** The system SHALL apply DMN-03 (Duplicate, Merge, and Reuse Decision) after automated Software Registry and backlog scan. (Task Type: A for scoring; H for reuse assessment meetings)

**REQ-P3-004:** The system SHALL implement structured loop-back to requestor via the conversational bot for any identified gaps. All communication SHALL flow through the workflow system — not email.

**REQ-P3-005:** The Product Owner SHALL confirm the preliminary pathway assignment from Phase 2 or escalate for re-routing with documented rationale (minimum 50 characters).

---

### 5.5 Phase 4: Portfolio Governance

*See BPMN reference: `processes/phase-4-portfolio-governance/`*

**REQ-P4-001:** The Portfolio Governance Council SHALL operate as a standing, cross-functional governance body with a recommended bi-weekly cadence for standard requests and an ad hoc path for urgent or high-score requests.

**REQ-P4-002:** The system SHALL apply DMN-04 (Go/No-Go Viability) with PRIORITY hit policy, where a single veto condition overrides all positive signals. The Council retains full human override authority, which SHALL be logged with reviewer role and rationale (minimum 50 characters).

**REQ-P4-003:** The system SHALL apply DMN-05 (Buy vs. Build Analysis) to all requests that receive a GO decision, evaluated across five dimensions: market solution availability, 5-year TCO comparison, IP differentiation, build complexity, and strategic fit.

**REQ-P4-004:** All Portfolio Council decisions SHALL be captured in the decision audit log with: decision type, DMN rule applied or override rationale, reviewer role (not personal identity), composite score at time of decision, and timestamp.

---

### 5.6 Phase 5A: PDLC Build Pathway

*See BPMN reference: `processes/phase-5a-pdlc-build/`*

**REQ-P5A-001:** The Build pathway SHALL execute the following sequence of activities:

| Step | Activity | Task Type | Owner |
|---|---|---|---|
| 1 | Technology Plan Integration: integrate build into roadmap; assign to sprint; create Git branch from Epic ID | A / H | Program Management |
| 2 | Initial Risk Evaluation: high-level review; integration dependencies mapped in CMDB; InfoSec preliminary assessment | H / DA | Enterprise Architect, AI/Model Risk Governance |
| 3 | Initial Requirements Definition and Estimates: refine PRD; convert sizing to story points; identify technical dependencies | H | Product Owner, Engineering |
| 4 | High Level Design Document (HLDD): system context diagram; data flow with classification overlays; API contracts; security controls; auth design; observability design | H | Enterprise Architect |
| 5 | Observability and Audit Telemetry Design: define structured event logging schema; specify audit trail fields; define drift monitoring metrics; specify data retention | H / DA | Enterprise Architect, AI/Model Risk Governance |
| 6 | Proof of Concept (PoC): standardized evaluation rubric; Architecture sign-off; CyberSec sign-off if data-sensitive. DMN-10 gate. | H | Enterprise Architect, Cybersecurity Lead |
| 7 | Requirement Refinement: update PRD and stories with PoC learnings; refine acceptance criteria; log new risks to register | H | Product Owner |
| 8 | Technology and Risk Evaluation Gate (DMN-11): multi-domain evaluation; AI Governance Checklist required for AI-enabled builds | H / DA | Enterprise Architect, AI/Model Risk Governance, Compliance |
| 9 | User Acceptance Testing (UAT) / Pilot (DMN-12): structured UAT with representative users; metrics against acceptance criteria; edge case testing | H | Business Requestor, Product Owner |
| 10 | Go-to-Market: release plan; operations runbook; observability dashboard activated; on-call escalation established; incident response plan linked | H / A | Product Owner, Program Management |

**REQ-P5A-002:** The AI Governance Checklist SHALL be required for all Tier 1 and Tier 2 AI models prior to production deployment. The checklist SHALL include:
- Model Card Completion: purpose; intended use cases; out-of-scope uses (explicitly documented); training data provenance; evaluation metrics; known limitations; bias assessment; recommended human oversight level
- Independent Validation (Tier 1 required; Tier 2 recommended): validation team independent from development; conceptual soundness evaluation; data quality assessment; benchmarking; sensitivity analysis; back-testing
- Explainability Provisions: SHAP or LIME feature attribution for Tier 1 decisions with regulatory or consumer-facing implications; human-readable reason codes for FCRA/Regulation B decisions
- Bias and Fairness Testing: disparate impact analysis across protected-class-correlated cohorts; 80% rule applied; multiple fairness metrics; ongoing monitoring schedule
- Drift Monitoring Design: input distribution monitoring (KS, PSI); output distribution monitoring; concept drift detection; automated retraining triggers; manual review escalation
- Human-in-the-Loop Provisions: Tier 1: all material decisions reviewed by qualified human before execution or within same business day; Tier 2: exception-based with defined escalation triggers
- Model Risk Inventory Entry: all Tier 1 and Tier 2 models entered with owner role, validation date, next review date, regulatory classification, deployment date, and observability dashboard link
- Executive Sponsor Sign-off (Tier 1 required): senior executive sponsor sign-off logged in audit trail
- Third-Party AI Model Obligations (Buy pathway): vendor must provide equivalent Model Card; SR 11-7 compliance attestation; validation evidence; bias testing results; 30-day advance notice for material model changes

---

### 5.7 Phase 5B: TPRM Buy Pathway

*See BPMN reference: `processes/phase-5b-tprm-procurement/`*

#### Stage 1: Vendor Risk Tiering (DMN-06)

**REQ-P5B-001:** The system SHALL classify all vendors into one of four risk tiers using DMN-06. Initial tiering SHALL be automated; overrides SHALL require human sign-off with rationale. (Task Type: A for initial tiering; H for override)

| Tier | Description | TPRM Intensity |
|---|---|---|
| Tier 1 — Critical | Critical activity; high data sensitivity (PII/NPI); or high concentration risk | Full lifecycle; exec sponsor approval; quarterly monitoring; onsite audit |
| Tier 2 — Elevated | Non-critical but high data sensitivity (PII); low concentration | Enhanced DD; annual monitoring; SOC 2 Type II required |
| Tier 3 — Standard | Moderate data sensitivity; low concentration | Standard DD; annual review; SOC 2 Type II or equivalent |
| Tier 4 — Low | Low / public data; no concentration risk | Abbreviated DD; biennial review; attestation-based |

#### Stage 2: Due Diligence

**REQ-P5B-002:** Due diligence execution SHALL be proportionate to vendor risk tier. Tier 1 (Critical) receives full financial, operational, security, BCP, regulatory, AI, fourth-party, and data privacy assessment. Tier 4 (Low) receives attestation-based assessment only. (Task Type: H with DA support)

**REQ-P5B-003:** The system SHALL integrate with vendor Trust Centers (Vanta, TrustCloud, Drata) via API to auto-ingest SOC 2 reports, penetration test results, and compliance attestations at intake. (Task Type: A)

**REQ-P5B-004:** The system SHALL deploy an AI Agent Swarm for evidence evaluation consisting of three specialized agents:
- **Investigator Agent:** parses SOC 2 reports, penetration tests, and financial statements to extract evidence for each policy requirement (< 2 minutes per report)
- **Compliance Agent:** cross-references findings against client standards and regulatory benchmarks (< 5 minutes)
- **Checker Agent:** validates reasoning of Investigator; logs agreements; escalates disagreements with full context for human review

#### Stage 3: RFP Construction via Legal Knowledge Graph

**REQ-P5B-005:** The system SHALL implement a Legal Knowledge Graph as a deterministic knowledge base governing all clause selection for RFP and MSA construction. (Task Type: DA for clause assembly; H for Legal Counsel review and approval)

**REQ-P5B-006:** The Legal Knowledge Graph SHALL contain:
- Graph nodes: legal clauses (versioned); regulatory requirements (cited); contract types; data domains; vendor risk scenarios; precedent outcomes
- Graph edges: required_by (regulation); applicable_when (context); supersedes (version); conflicts_with (mutual exclusivity); recommended_for (best practice)

**REQ-P5B-007:** Context-driven clause selection inputs SHALL include: vendor risk tier, acquisition type, data sensitivity, regulatory flags, AI enablement, and jurisdiction. Conflicting clause combinations SHALL be flagged for Legal Counsel review.

**REQ-P5B-008:** All auto-generated clauses SHALL be reviewed and approved by Legal Counsel before RFP issuance.

#### Stage 4: Sourcing Event and Vendor Selection (DMN-07)

**REQ-P5B-009:** Vendor selection SHALL be governed by DMN-07 evaluating: vendor response count, pilot outcome, RAE findings, and AI governance status. (Task Type: H for evaluation; A for DMN gate)

#### Stage 4 Continued: Contracting and Funding (DMN-08)

**REQ-P5B-010:** Funding confirmation SHALL be governed by DMN-08 evaluating: Finance engagement, budget availability, FP&A completion, and budget year. (Task Type: H for negotiation; DA for contract redline review; A for funding gate)

#### Stage 5: Vendor Onboarding and Enablement

**REQ-P5B-011:** Vendor onboarding SHALL include:
- Vendor Registration in procurement system, CMDB, and TPRM Vendor Register with risk tier, relationship owner role, monitoring cadence, and renewal date (Task Type: A)
- Least-privilege access provisioning; vendor accounts in IAM; Privileged Access Management for Tier 1 vendors (Task Type: A)
- Integration testing in non-production environment with Enterprise Architect and Cybersecurity Lead sign-off (Task Type: H)
- SBOM collection from vendor stored in Software Registry and linked to NVD scanning (Task Type: A)
- Onboarding Checklist sign-off: TPRM, CyberSec, Legal, and Business Relationship Owner sign before production access (Task Type: H)
- SLA baseline: performance metrics baselined in first 30 days; monitoring dashboard activated (Task Type: A)

#### Stage 6: Ongoing Monitoring (DMN-14)

**REQ-P5B-012:** The system SHALL implement ongoing vendor monitoring per DMN-14 monitoring schedule:

| Activity | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|---|---|---|---|---|
| SLA / Performance review | Monthly | Quarterly | Semi-annual | Annual |
| Security re-assessment | Quarterly scan + annual detailed | Semi-annual scan + annual | Annual questionnaire | Biennial attestation |
| Financial stability | Quarterly credit watch + earnings | Semi-annual review | Annual review | Trigger-based only |
| BCP/DR test participation | Annual: institution observes vendor DR | Biennial: doc review | Annual doc review | N/A |
| Regulatory compliance | Quarterly attestation + annual audit | Annual attestation | Annual attestation | Biennial attestation |
| Incident/breach notification | Real-time; ≤72 hours contractual | Real-time; 72-hour obligation | Real-time; 72-hour obligation | Real-time; 72-hour obligation |
| Sub-contractor change | 30-day advance notice; approval required | 60-day advance notice | Annual disclosure | N/A |
| AI model change | 30-day notice; independent re-validation | 60-day notice; internal review | Annual disclosure | N/A |

**REQ-P5B-013:** The system SHALL implement continuous automated risk triggers including: OFAC screening, adverse news monitoring, dark web scanning, and financial stability monitoring. (Task Type: A for Tier 1-2; quarterly for Tier 3-4)

**REQ-P5B-014:** Termination management SHALL include:
- Planned termination: transition plan initiated 180 days before contract end; data return/deletion enforced per MSA; all vendor access deprovisioned within 24 hours; CMDB and Registry updated
- Unplanned termination: BCP activated; pre-qualified alternative vendor list consulted; 90-day minimum transition assistance per MSA
- Post-termination verification: data deletion certificate obtained; TPRM Register archived with lessons learned; Internal Audit notified for Tier 1/2
- Concentration risk re-assessment following Tier 1 termination

---

### 5.8 Phase 6: Post-Deployment Observability

*See BPMN reference: `processes/phase-6-observability/`*

**REQ-P6-001:** The system SHALL implement mandatory observability designed in Phase 5A and activated at Go-to-Market. Observability requirements are mandatory per SR 11-7, SEC Cybersecurity Disclosure Rule (2023), FINRA Rule 4511, and SEC Rule 17a-4.

**REQ-P6-002:** Every AI-assisted, agent-enabled, or automated decision SHALL generate an immutable event record written to an append-only audit log containing:
- decision_id (UUID): globally unique identifier
- request_id: correlation to originating intake request
- process_phase: enumerated value (Phase 0-6)
- decision_type: DMN_RULE | AGENT_CLASSIFICATION | HUMAN_OVERRIDE | AUTOMATED_TRIGGER
- rule_id or model_version: specific DMN rule ID or AI model version and build hash
- knowledge_base_version: version of deterministic knowledge base used by agent (if applicable)
- input_hash (SHA-256): cryptographic hash of full input payload for tamper detection
- output: decision outcome (pathway, score, routing, approval, rejection, escalation)
- confidence_score: for agent-based decisions (0-100%); N/A for deterministic DMN
- human_reviewer_role: if human override — reviewer role (not identity); rationale (min 50 characters)
- timestamp_utc (ISO 8601): millisecond resolution
- session_id: intake session correlation for multi-step chains

**REQ-P6-003:** Data retention SHALL comply with: regulated financial decisions: 7 years minimum (FINRA 4511; SEC 17a-4); operational decisions: 3 years minimum, 7 years if subject to regulatory examination. All logs SHALL use WORM-compliant storage.

**REQ-P6-004:** The system SHALL implement AI model monitoring per SR 11-7 requirements:

| Metric | Method | Frequency | Alert Threshold | Escalation |
|---|---|---|---|---|
| Input distribution drift | KS test; PSI | Weekly | PSI > 0.20 or KS p < 0.05 | Product Owner + AI/MRM Governance; model review within 10 days |
| Output distribution drift | Pathway distribution monitoring; rolling 30-day | Weekly | >15% shift in distribution | AI/MRM Governance; investigation within 5 days |
| Bias / fairness metrics | Disparate impact ratio across protected-class-correlated cohorts | Quarterly | Ratio outside 0.80-1.25 | AI/MRM Governance + Compliance; corrective action within 30 days |
| GenAI / LLM hallucination | Random sample review of AI-generated content | Monthly (5% sample) | >5% factual error rate | Product Owner; AI/MRM Governance; model re-evaluation |
| Model accuracy | Back-testing against validated outcomes | Quarterly | >10% degradation from baseline | Independent validation triggered; model use restricted |

**REQ-P6-005:** Reporting cadences SHALL include:
- Internal Audit: read-only access to decision event log via structured query; periodic audit of AI governance controls; findings to Audit Committee (H)
- MRM Committee: monthly dashboard of Tier 1/2 AI model performance, drift metrics, and pending validations (DA)
- Board / Risk Committee: aggregate model risk exposure, significant findings, and TPRM program health reported quarterly per SR 11-7 (H)
- Regulatory exam package: pre-built report template assembles all decision events for specified request ID or date range formatted for examiner access within 24 hours (A)

---

### 5.9 Retirement / Asset Wind-Down

**REQ-RET-001:** The system SHALL support graceful retirement of software assets through a decommission sub-process triggered from the production monitoring loop.

**REQ-RET-002:** The retirement sub-process SHALL include:
- Decommission plan: data migration plan; dependency unwinding schedule; stakeholder notification workflow; knowledge capture initiation (5-10 days; H / A)
- Knowledge capture: extract and archive all institutional knowledge, decision rationale, and lessons learned before retirement (2-3 days; H / DA)
- Data archival: archive or securely destroy all data per retention policies and regulatory requirements; obtain deletion certificates from vendors (1-2 days; A / H)
- Access deprovisioning: revoke all physical and logical access within 24 hours of retirement decision (A)
- Registry update: CMDB and Software Registry updated to reflect retired status with decommission rationale (A)
- Audit notification: Internal Audit notified for all Tier 1 and Tier 2 vendor retirements (A)

**REQ-RET-003:** Decommission rationale SHALL be staged into the Software Registry by the Knowledge Staging Agent and surfaced in future intake sessions for similar capabilities.

---

## 6. Decision Model Requirements

*Source: Spec Section 16*

All fifteen DMN decision tables SHALL be implemented as Business Rules Tasks in Camunda Platform 7. Each SHALL be independently versioned, audited, and governed. DMN rule IDs SHALL be logged with every decision event.

### 6.1 DMN Table Catalog

| DMN ID | Decision Name | Phase | Hit Policy | Purpose |
|---|---|---|---|---|
| DMN-01 | AI Routing and Pathway Assignment | 2 | UNIQUE | Assigns governance pathway based on channel, existing solution, AI tier, composite score, and vendor status |
| DMN-02 | Information Completeness Gate | 3 | ANY | Gates proceed vs. return based on completeness of value quantification, data classification, integration list, regulatory flags, and PO approval |
| DMN-03 | Duplicate, Merge, and Reuse Decision | 3 | UNIQUE | Resolves registry match and backlog match into close/reuse assessment/merge offer/proceed |
| DMN-04 | Go/No-Go Viability | 4 | PRIORITY | Portfolio Council gate with veto conditions for regulatory risk, budget absence, and low strategic score |
| DMN-05 | Buy vs. Build Analysis | 4 | UNIQUE | Five-dimension analysis producing Buy/Build/Hybrid/Defer recommendation |
| DMN-06 | Vendor Risk Tier Assignment | 5B | PRIORITY | Classifies vendor into Tier 1-4 based on criticality, data sensitivity, concentration, financial stability, and regulatory exposure |
| DMN-07 | Vendor Selection and RAE Gate | 5B | UNIQUE | Governs proceed/conditional/restart/no-go based on vendor response count, pilot outcome, RAE findings, and AI governance status |
| DMN-08 | Funding Confirmation Gate | 5B | UNIQUE | Governs funded/deferred/no funding/escalate based on Finance engagement, budget availability, FP&A completion, and budget year |
| DMN-09 | AI Risk Tier Classification | 1 | PRIORITY | Classifies AI model into Tier 1/2/3 based on decision materiality, credit/capital impact, model complexity, and data sensitivity |
| DMN-10 | Proof of Concept Gate | 5A | UNIQUE | Gates PoC completion based on rubric score, Architecture sign-off, and CyberSec sign-off |
| DMN-11 | Technology and Risk Evaluation Gate | 5A | ANY | Multi-domain gate: completeness, AI Gov checklist, Architecture, CyberSec, Compliance |
| DMN-12 | Observability Tier Assignment | 5A | PRIORITY | Assigns log schema tier, retention period, monitoring cadence, and alert configuration based on AI risk tier, regulatory classification, and decision materiality |
| DMN-13 | Fast-Track Eligibility | 2 | UNIQUE | Determines fast-track vs. standard based on internal channel, AI flag, production flag, sensitivity, and vendor pre-approval status |
| DMN-14 | TPRM Monitoring Frequency | 5B→Ongoing | UNIQUE | Assigns monitoring cadence per activity based on vendor risk tier, contract value, service criticality, and prior outcomes |
| DMN-15 | Capability Reuse Gate | 1 | UNIQUE | Governs reuse-redirect/reuse assessment/evaluate expansion/proceed/surface rationale based on registry match score, functional fit, license availability |

### 6.2 DMN Governance Requirements

**REQ-DMN-001:** All DMN tables SHALL be maintained in `.dmn` files within the `decisions/` directory, organized by phase.

**REQ-DMN-002:** Each DMN table SHALL include a version header, last-updated date, regulatory references, and approving authority.

**REQ-DMN-003:** DMN tables SHALL be updated within 60 days of any material regulatory guidance change that affects their input conditions or output actions.

**REQ-DMN-004:** All DMN rule invocations SHALL be logged to the decision audit trail with: DMN ID, version, rule number matched, input values, output value, and timestamp.

**REQ-DMN-005:** Human overrides of DMN decisions SHALL be logged with: overriding role (not personal identity), rationale (minimum 50 characters), timestamp, and original DMN output.

---

## 7. Agent Framework Requirements

*Source: Spec Section 17*

### 7.1 Agent Governance Principles

**REQ-AGT-001:** Agents SHALL be permitted within the workflow only when all four conditions are met:
1. Outputs are deterministic and reproducible given the same inputs and knowledge base version
2. They use deterministic knowledge bases
3. Decision provenance is logged
4. They follow DMN rules

**REQ-AGT-002:** Non-deterministic outputs (temperature-based LLM generation) SHALL be permitted only for human-reviewed drafts, never for routing, classification, or approval decisions.

**REQ-AGT-003:** Each agent SHALL be bound to a specific, versioned deterministic knowledge base. The knowledge base version SHALL be logged with every agent invocation.

**REQ-AGT-004:** Full provenance chain SHALL be logged for every agent invocation: input data hash, knowledge base version, agent version, DMN rule applied, output, and confidence score.

**REQ-AGT-005:** Any agent output below confidence threshold (≥85%) SHALL trigger automatic escalation to the appropriate human role.

### 7.2 Agent Inventory

| Agent | Phase(s) | Knowledge Base | DMN Governed By | Human Escalation Trigger |
|---|---|---|---|---|
| Intake Bot | Phase 1 | Software Registry; Regulatory KB; Data Governance KB | DMN-09, DMN-15 | Ambiguous capability; unresolvable field validation |
| Routing Engine | Phase 2 | Software Registry; Historical routing outcomes | DMN-01, DMN-13 | Confidence < 85% |
| Compliance Analysis Agent | Phase 1, 3 | Regulatory Requirements KB; Data Governance KB | DMN-02 | Novel regulatory scenario; cross-border ambiguity |
| Legal Clause Assembly Agent | Phase 5B | Legal Knowledge Graph | Graph traversal rules | Conflicting clauses; novel contract type |
| Contract Redline Agent | Phase 5B | Legal Knowledge Graph; Precedent outcomes | Institutional standards rules | Non-standard deviation > threshold |
| Knowledge Staging Agent | All phases | All knowledge bases (write access) | Validation rules per KB schema | Schema validation failure |
| Monitoring and Alerting Agent | Phase 6 | Performance baselines; drift thresholds | DMN-12, DMN-14 | Alert threshold breach |

### 7.3 Agent-Specific Requirements

**REQ-AGT-006:** The Intake Bot SHALL implement session persistence and resume capability. Conversation state SHALL be preserved for minimum 30 days.

**REQ-AGT-007:** The Knowledge Staging Agent SHALL operate continuously across all phases and SHALL replace what would otherwise be email, spreadsheet updates, or ad hoc follow-up meetings with structured knowledge flows.

**REQ-AGT-008:** The AI Agent Swarm (Investigator, Compliance, Checker) SHALL process evidence at the following SLAs: < 2 minutes per SOC 2 report; < 5 minutes per compliance cross-reference cycle; < 5 minutes per checker validation cycle.

**REQ-AGT-009:** Agent disagreements between Investigator and Checker SHALL be escalated immediately to the relevant human role with full context and a structured resolution SLA of 2 business days.

---

## 8. Regulatory Requirements

*Source: Spec Appendix A and throughout*

### 8.1 Regulatory Framework Matrix

| Regulation / Guidance | Issuer | Phases | Key Requirements |
|---|---|---|---|
| OCC Bulletin 2023-17 | OCC / Fed / FDIC | Phase 5B (all stages); Phase 6 | Five-stage TPRM lifecycle; risk-tiered DD; critical activity designation; sub-contractor oversight; ongoing monitoring; termination planning |
| SR 11-7 MRM | Fed / OCC | Phase 1 (AI risk); Phase 5A (AI Gov); Phase 6 | Model risk inventory; independent validation; documentation; performance monitoring; drift detection; Board-level reporting |
| NIST AI RMF 1.0 | NIST | Phase 1; Phase 5A | GOVERN, MAP, MEASURE, MANAGE functions; bias/fairness; transparency; accountability; trustworthiness |
| SEC Cybersecurity Disclosure Rule | SEC | Phase 2; Phase 5B; Phase 6 | Material incident disclosure; annual cybersecurity risk management; third-party risk as material factor |
| FINRA Rules 3110 / 4511 | FINRA | Phase 6 | Supervision of technology; books and records; 3-year minimum retention; 6-year for financial records |
| SEC Rule 17a-4 | SEC | Phase 6 | WORM-compliant storage; 7-year retention for broker-dealer records; regulatory access within 24 hours |
| BCBS d577 | BIS | Phase 5B | Concentration risk; supervisory cooperation; termination/BCP planning; sub-contractor chain oversight |
| NIST SP 1800-5 | NIST | Phase 0 | ITAM for financial services; continuous discovery; license compliance; vulnerability integration |
| ISO/IEC 19770 | ISO | Phase 0 | SAM standards; software identification; license management; entitlement management |
| ISO/IEC 27001:2022 | ISO | Phase 5A; 5B; 6 | ISMS requirements; supplier security; access control; audit logging; cryptographic controls |
| EU AI Act | EU | Phase 1; Phase 5A | High-risk AI registration; fundamental rights assessment; technical documentation; transparency |
| GDPR / CCPA / GLB | EU / CA / US Fed | Phase 1; Phase 5B | Lawful basis; DPA requirements; data subject rights; cross-border transfer; breach notification |
| FCRA / Regulation B | CFPB / Fed | Phase 5A (Tier 1) | Adverse action notices; disparate impact prohibition; explainability for credit-adjacent AI |

### 8.2 Regulatory Compliance Requirements

**REQ-REG-001:** The system SHALL implement three-level governance gap analysis:
- **Level 1 — Framework Coverage:** Every regulatory framework SHALL be mapped to the control taxonomy. Unmapped control objectives SHALL be flagged as gaps.
- **Level 2 — Lifecycle Coverage:** Every control SHALL be mapped to at least one lifecycle phase. Controls not tested or monitored in any phase SHALL be flagged as implementation gaps.
- **Level 3 — Evidence Coverage:** Every control mapped to a lifecycle phase SHALL have at least one defined evidence source and collection mechanism. Controls without evidence collection SHALL be flagged as observability gaps.

**REQ-REG-002:** Control Framework Alignment SHALL include NIST CSF 2.0, ISO 27001, DORA, and FS AI RMF mapped to all applicable lifecycle phases.

**REQ-REG-003:** The system SHALL support generation of a pre-built regulatory exam package for OCC, FINRA, and SEC examinations. The package SHALL be assembable within 24 hours for any specified request ID or date range.

**REQ-REG-004:** Breach notification obligations SHALL be enforced per vendor risk tier. All tiers require real-time notification; Tier 1-4 all require ≤72 hours contractual notification obligations.

---

## 9. Non-Functional Requirements

### 9.1 Audit Trail

**REQ-NFR-001:** The system SHALL maintain an immutable, WORM-compliant decision audit log for all decisions (DMN, agent, human). Log entries SHALL be append-only and tamper-evident (SHA-256 input hashing).

**REQ-NFR-002:** Audit log retention SHALL comply with:
- Regulated financial decisions: 7 years minimum (FINRA Rule 4511; SEC Rule 17a-4)
- Operational decisions: 3 years minimum; 7 years if subject to regulatory examination

**REQ-NFR-003:** The audit log SHALL be accessible to Internal Audit via read-only structured query interface. No direct database access SHALL be permitted.

**REQ-NFR-004:** Human overrides SHALL capture: reviewer role (not personal identity); override rationale (minimum 50 characters); original system recommendation; timestamp.

### 9.2 SLA Enforcement

**REQ-NFR-005:** The system SHALL implement ISO 8601 timer events as BPMN boundary timer events attached to all user tasks and approval tasks.

**REQ-NFR-006:** SLA escalation rules SHALL be:
- SLA breach warning (80% elapsed): automated notification to task owner and their manager role (A)
- SLA breach (100% elapsed): escalation to next governance level; request flagged in portfolio dashboard (A)
- Chronic SLA breach (3+ consecutive): process improvement review triggered; bottleneck analysis report auto-generated (DA)

**REQ-NFR-007:** Key SLA targets:

| KPI / SLA | Target |
|---|---|
| Intake-to-routing completion | ≤ 2 business days |
| Completeness rate at first submission | ≥ 85% |
| Duplicate/reuse detection rate | ≥ 30% resolved via Registry before portfolio entry |
| Go/No-Go decision cycle | ≤ 5 business days |
| Buy pathway: RFP-to-vendor-selection | ≤ 30 days (Tier 3-4); ≤ 60 days (Tier 1-2) |
| TPRM due diligence completion | 100% tiered and DD-completed before contract |
| AI Gov checklist completion | 100% Tier 1/2 with approved checklist before production |
| Vendor monitoring SLA adherence | ≥ 95% on schedule per DMN-14 |
| Regulatory audit readiness | Full log retrievable within 24 hours |
| AI model performance within bounds | 100% Tier 1/2 within drift thresholds |
| Shadow IT detection-to-triage | ≤ 5 business days |
| Fast-track cycle time | ≤ 5 business days |

### 9.3 Scalability

**REQ-NFR-008:** The system SHALL support institutional-scale operation with 10,000+ software assets in the Software Registry without performance degradation.

**REQ-NFR-009:** The Software Registry query interface SHALL return semantic search results within 5 seconds for any intake session.

**REQ-NFR-010:** The AI Agent Swarm SHALL process vendor evidence in parallel, completing a full Tier 1 evidence evaluation within 4 hours of evidence package submission.

### 9.4 Deterministic Output

**REQ-NFR-011:** Running the same DMN decision table with the same inputs SHALL produce identical outputs regardless of when the evaluation occurs (assuming the same DMN table version).

**REQ-NFR-012:** Agent outputs that feed into DMN decisions SHALL be reproducible: the same input data hash, knowledge base version, and agent version SHALL produce the same output.

**REQ-NFR-013:** Every AI-generated artifact (PRD, story, clause selection) SHALL be clearly distinguished from human-validated content in the system of record. AI-generated content SHALL require explicit human approval before governing any downstream action.

### 9.5 Observability and Queue Visibility

**REQ-NFR-014:** All requestors, approvers, and reviewers SHALL have real-time visibility into:
- Request status, pipeline position, and pending actions via a shared portal with visible SLA clocks
- Portfolio Governance Council queue depth, average wait time, and upcoming review cycle dates
- Procurement pipeline: RFP status, vendor evaluation progress, and contracting milestones
- Build pipeline: sprint assignments, PoC status, gate outcomes, and release readiness

**REQ-NFR-015:** The Monitoring and Alerting Agent SHALL continuously analyze process execution data to identify:
- Tasks with average completion time exceeding SLA by >50%
- Queue depth anomalies (>2 standard deviations from rolling 30-day average)
- Role-based bottlenecks: roles consistently appearing as the longest-duration step in the critical path
- Seasonal or cyclical patterns that predict future bottlenecks

---

## 10. Architecture

*Source: Spec Sections 6, 16, 17, 18*

### 10.1 BPMN 2.0 Process Architecture

**REQ-ARCH-001:** The framework SHALL be implemented as BPMN 2.0 compliant process models executable on Camunda Platform 7, using the `camunda:` namespace, `candidateGroups`, and `historyTimeToLive` configurations.

**REQ-ARCH-002:** The master BPMN workflow SHALL organize all phases as sub-processes within a single master process, with explicit SLA timers, DMN Business Rules Tasks at every decision gate, and RACI accountability at every node.

**REQ-ARCH-003:** Phase structure SHALL follow the seven-phase architecture:

| Phase | Description | BPMN File |
|---|---|---|
| Phase 0 | Continuous Software Asset Intelligence (perpetual background) | `processes/phase-0-asset-intelligence/` |
| Phase 1 | Conversational AI Intake and Concurrent Risk Classification | `processes/phase-1-needs-assessment/intake-risk-classification.bpmn` |
| Phase 2 | AI Routing Engine and Pathway Assignment | `processes/phase-2-routing/` |
| Phase 3 | Product Management Review, Enrichment, and Portfolio Governance | `processes/phase-3-product-review/` |
| Phase 4 | Portfolio Prioritization, Go/No-Go, and Strategic Alignment | `processes/phase-4-portfolio-governance/` |
| Phase 5A | Product Development Life Cycle (Build Pathway) | `processes/phase-5a-pdlc-build/` |
| Phase 5B | Full TPRM-Integrated Procurement (Buy Pathway) | `processes/phase-5b-tprm-procurement/` |
| Phase 6 | Post-Deployment Observability and Audit Governance | `processes/phase-6-observability/` |

### 10.2 Swim Lane Architecture

**REQ-ARCH-004:** All governance BPMN models SHALL use the following seven standard swim lanes:

| Lane | candidateGroups | Phases |
|---|---|---|
| Governance Board | `sla-governance-board` | 4 |
| Business Owner | `business-owner` | 1, 3, 4 |
| IT Architecture | `it-architecture` | 5A |
| Procurement | `procurement` | 5B |
| Legal & Compliance | `legal-compliance` | 5B |
| Information Security | `information-security` | 5A, 5B |
| Vendor Management | `vendor-management` | 5B, 6 |

### 10.3 DMN Architecture

**REQ-ARCH-005:** All DMN files SHALL reside in the `decisions/` directory organized by phase:
- `decisions/phase-1/`: DMN-09, DMN-15
- `decisions/phase-2/`: DMN-01, DMN-13
- `decisions/phase-3/`: DMN-02, DMN-03
- `decisions/phase-4/`: DMN-04, DMN-05
- `decisions/phase-5a/`: DMN-10, DMN-11, DMN-12
- `decisions/phase-5b/`: DMN-06, DMN-07, DMN-08, DMN-14
- `decisions/cross-cutting/`: Shared reference tables

**REQ-ARCH-006:** Business Rule Tasks in BPMN SHALL reference DMN tables using the Camunda `camunda:decisionRef` attribute with `camunda:resultVariable` and `camunda:mapDecisionResult` configured.

### 10.4 Knowledge Architecture

**REQ-ARCH-007:** The system SHALL maintain seven deterministic knowledge bases:

| Knowledge Base | Content | Update Mechanism | Governance |
|---|---|---|---|
| Software Registry | All software assets: purchased, built, contracted, in-flight, retired | Automated nightly reconciliation (A); manual corrections (H) | Software Asset Manager owns; quarterly audit |
| Regulatory Requirements KB | All applicable regulations, clauses, citations, and control requirements by domain and jurisdiction | Agent monitors regulatory feeds (DA); Compliance validates (H) | Compliance Governance owns; 60-day update SLA on material changes |
| Data Governance KB | Data classification rules, residency requirements, retention obligations, privacy regulation mappings | Structured updates via validation workflow (H) | Data Governance function owns; annual review |
| Legal Knowledge Graph | Legal clauses (versioned), contract types, regulatory mappings, precedent outcomes | Agent ingests modifications (DA); Legal Counsel approves (H) | Legal Counsel owns; annual full review |
| AI Governance KB | Model cards, validation evidence, bias testing results, drift thresholds, monitoring configurations | Knowledge Staging Agent captures (DA); AI/MRM Governance validates (H) | AI/Model Risk Governance owns; per-model lifecycle |
| Decision Audit Log | All decision events with full provenance | Automated append-only write (A) | WORM storage; Internal Audit has read access; 7-year retention |
| Vendor Intelligence KB | Vendor risk assessments, due diligence results, monitoring outcomes, incident history, termination rationale | Agent captures monitoring data (DA); TPRM validates (H) | Third-Party Risk Manager owns; per-vendor lifecycle |

---

## 11. Data Model

*Source: Spec Sections 7-15, 20*

### 11.1 Software Registry Entities

**Software Asset**
- asset_id (UUID, primary key)
- asset_name, asset_type (SaaS | PaaS | licensed | internal | open-source)
- vendor_id (FK to Vendor), business_unit, primary_owner_role
- data_classification (public | internal | confidential | restricted | regulated)
- environment (production | non-production | retired)
- operational_status, deployment_date, retirement_date
- license_entitlements, seat_utilization, renewal_date, contract_value
- cmdb_ci_id, itsm_service_id, sbom_reference
- reuse_recommendation_flag, utilization_threshold_alert
- registration_timestamp, last_updated_timestamp

**Intake Request**
- request_id (UUID, primary key)
- requestor_role, business_unit, pathway_assigned
- composite_score, risk_tier, ai_risk_tier
- registry_match_score, registry_match_type, reuse_decision
- prd_document_id, jira_epic_id, git_branch_reference
- sla_clock_start, sla_clock_status, current_phase
- status (draft | submitted | routing | review | approved | rejected | deferred | complete)
- created_timestamp, last_updated_timestamp

**Decision Event (Audit Log)**
- decision_id (UUID, immutable primary key)
- request_id (FK to Intake Request)
- process_phase, decision_type (DMN_RULE | AGENT_CLASSIFICATION | HUMAN_OVERRIDE | AUTOMATED_TRIGGER)
- rule_id_or_model_version, knowledge_base_version
- input_hash (SHA-256)
- output, confidence_score (nullable for deterministic DMN)
- human_reviewer_role (nullable), override_rationale (nullable, min 50 chars)
- timestamp_utc (ISO 8601, millisecond resolution)
- session_id

### 11.2 Vendor Profile Entities

**Vendor**
- vendor_id (UUID, primary key)
- vendor_name, vendor_type, primary_contact_role
- risk_tier (Tier 1 | Tier 2 | Tier 3 | Tier 4)
- critical_activity_flag, data_sensitivity_level
- concentration_risk_flag, financial_stability_rating
- regulatory_exposure_level
- onboarding_date, last_assessment_date, next_assessment_date
- monitoring_cadence_sla, contract_renewal_date
- trust_center_url, sbom_reference, nda_executed_flag
- active_incidents_count, open_findings_count

**Risk Assessment Evaluation (RAE)**
- rae_id (UUID, primary key)
- vendor_id (FK), request_id (FK)
- assessment_date, assessment_type (initial | annual | triggered | termination)
- assessor_role
- security_score, financial_score, operational_score, regulatory_score, ai_score
- composite_rae_score, risk_tier_recommendation
- critical_findings_count, moderate_findings_count, minor_findings_count
- approval_status, approved_by_role, approval_timestamp

### 11.3 AI Model Inventory Entities

**AI Model**
- model_id (UUID, primary key)
- model_name, model_type, model_version
- vendor_id (FK, nullable for internally built)
- risk_tier (Tier 1 | Tier 2 | Tier 3)
- deployment_date, next_validation_date, last_validation_date
- validation_team_independent_flag
- model_card_document_id, observability_dashboard_url
- drift_monitoring_active_flag, bias_testing_last_date
- executive_sponsor_signoff_flag, executive_sponsor_role
- regulatory_classification, sr_11_7_tier
- owner_role, active_status

---

## 12. Integration Requirements

*Source: Spec Sections 7.7, 12.2, 15, 16.1*

### 12.1 Project Management and Development Tooling

**REQ-INT-001:** The system SHALL integrate bidirectionally with Jira and Azure DevOps for:
- Parent Epic creation mapped to approved PRDs
- Feature Story creation (one per functional requirement, Gherkin acceptance criteria)
- Story point estimation pre-population
- Status synchronization (request status visible in both systems)
- Git branch creation and protection rule application

**REQ-INT-002:** The system SHALL integrate with Git source code repositories (GitHub Enterprise, Bitbucket, Azure DevOps) for:
- Feature branch creation from Epic ID upon PRD approval
- SBOM generation trigger for internally built assets
- Dependency graph analysis and NVD vulnerability linkage

### 12.2 Trust Centers

**REQ-INT-003:** The system SHALL integrate via API with vendor Trust Centers including Vanta, TrustCloud, and Drata to:
- Auto-ingest SOC 2 reports, penetration test results, financial statements, insurance certificates, and compliance attestations at intake trigger
- Identify missing evidence items and auto-send targeted requests to vendors
- Enable self-service due diligence: prospective buyers access SOC 2 reports and certifications instantly after automated NDA execution

### 12.3 CMDB and ITSM

**REQ-INT-004:** The system SHALL maintain bidirectional integration with the institution's Configuration Management Database (CMDB) to:
- Pull all deployed application and service configuration items into the Software Registry
- Push new asset registrations and status changes within 24 hours
- Trigger intake workflows for CMDB changes indicating shadow IT

**REQ-INT-005:** The system SHALL integrate with the ITSM service catalog to:
- Redirect intake sessions that match registry assets (>90% similarity) to self-service fulfillment
- Create service requests for fast-track pathway fulfillments
- Update ticket status based on governance workflow milestones

### 12.4 Software Asset Management (SAM)

**REQ-INT-006:** The system SHALL integrate with SAM tooling to ingest license entitlements, actual seat utilization, renewal dates, contract values, compliance status, and vendor contact records into the Software Registry.

### 12.5 SSO and Spend Analytics

**REQ-INT-007:** The system SHALL integrate with SSO/identity provider logs and expense management / card spend analytics to detect applications used by employees that are not registered in the procurement system, triggering automated intake workflows for shadow IT triage.

### 12.6 Security Monitoring Platforms

**REQ-INT-008:** The system SHALL integrate with cybersecurity ratings platforms (BitSight, SecurityScorecard) for:
- Real-time external attack surface scoring for vendors during due diligence and ongoing monitoring
- Automated alert triggers when vendor security posture deteriorates below threshold

### 12.9 GRC / IRM Platform

**REQ-INT-009:** The system SHALL serve as the orchestration layer above the institution's GRC/IRM platform (e.g., ProcessUnity, OneTrust, Aravo), which houses the vendor inventory and risk tiers. The BPMN engine SHALL drive workflow steps; the GRC platform SHALL serve as the system of record for vendor profiles and risk assessments.

---

## 13. Success Metrics

*Source: Spec Sections 25-27*

### 13.1 Cycle Time Metrics

| Metric | Baseline | Target | Measurement |
|---|---|---|---|
| End-to-end lifecycle (standard risk) | 90-120 days industry average | 29-45 days | Calendar days from intake submission to production cutover |
| End-to-end lifecycle (high risk) | 90-120 days | 46-74 days | Calendar days from intake submission to production cutover |
| End-to-end lifecycle (minimal risk) | 90-120 days | 13.5-23 days | Calendar days from intake submission to production cutover |
| Intake-to-routing | 3-5 days (manual) | ≤ 2 business days | Time from intake bot session start to DMN-01 pathway assignment |
| Go/No-Go decision cycle | 7-14 days | ≤ 5 business days | Calendar time from portfolio submission to Council decision |
| RFP-to-vendor-selection (Tier 3-4) | 45-90 days | ≤ 30 days | Calendar time from RFP issuance to selection recommendation |
| Fast-track fulfillment | 5-10 days | ≤ 5 business days | Intake to ITSM fulfillment for fast-track pathway |

### 13.2 Cycle Time Compression Waterfall

| Optimization Layer | Before (Days) | After (Days) | Reduction |
|---|---|---|---|
| Baseline (Industry Average) | 90-120 | 90-120 | — |
| + BPMN Workflow Automation | 90-120 | 65-85 | 25-35 days |
| + Front-Loaded Knowledge Capture | 65-85 | 50-65 | 15-20 days |
| + AI Agent Swarm Due Diligence | 50-65 | 40-55 | 8-12 days |
| + Risk-Tiered Governance Routing | 40-55 | 35-50 | 3-5 days |
| + In-Sprint Compliance / Policy-as-Code | 35-50 | 29-45 | 3-5 days (rework avoided) |
| **TOTAL OPTIMIZED** | **90-120** | **29-45** | **68-75% reduction** |

### 13.3 Automation Metrics

| Metric | Target | Measurement |
|---|---|---|
| Overall automation utilization | > 60% average across phases | Automated task count / total task count per initiative |
| Phase 1 (Intake) automation | 75% | Automated and DA tasks / total Phase 1 tasks |
| Phase 6 (Monitoring) automation | 65% | Automated monitoring events / total monitoring events |
| First-pass approval rate | > 80% | Approved on first submission / total submissions at each gate |
| Evidence collection timeliness | > 70% front-loaded by Phase 2 close | Evidence items received by Phase 2 / total required items |

### 13.4 Reuse and Registry Metrics

| Metric | Target | Measurement |
|---|---|---|
| Capability reuse rate | ≥ 30% | Intakes closed via DMN-03/DMN-15 before portfolio entry / total intakes |
| Registry freshness | 100% production assets current within 24 hours | Registry last-updated vs. CMDB change timestamp |
| Shadow IT detection-to-triage | ≤ 5 business days | SSO/spend detection timestamp to DMN triage completion |
| License utilization improvement | ≥ 40% alert threshold active | % of SaaS assets above 40% utilization threshold |

### 13.5 Compliance and Audit Metrics

| Metric | Target | Measurement |
|---|---|---|
| TPRM due diligence completion | 100% | Audit of vendor onboarding records; zero exceptions |
| AI Gov checklist completion | 100% Tier 1/2 | Audit of model inventory against deployed AI assets |
| Vendor monitoring SLA adherence | ≥ 95% on schedule | TPRM monitoring schedule completion rate per DMN-14 |
| Regulatory audit readiness | Full log retrievable within 24 hours | Periodic internal audit drill |
| Decision provenance logging | 100% | Every DMN, agent, and human decision with full provenance in audit log |
| AI model drift compliance | 100% Tier 1/2 within thresholds | Automated monitoring; monthly MRM Committee review |
| Control gap coverage | Zero gaps at examination | Three-level gap analysis: framework, lifecycle, evidence coverage |

---

## 14. Implementation Roadmap

*Source: Spec Section 26*

### 14.1 Three-Horizon Maturity Model

#### Horizon 1: Foundational (Months 1-6) — Governance Infrastructure

**Objective:** Establish the governance infrastructure and manual DMN application before automation is layered on top.

**Deliverables:**
- Establish Software Registry as single source of truth: integrate CMDB, SAM, and Vendor Contract Repository; begin nightly reconciliation
- Deploy standardized intake with mandatory field enforcement; assign Product Owner to every request; establish Portfolio Governance Council cadence
- Implement TPRM Vendor Register; assign risk tiers to all existing vendor relationships; initiate due diligence gap remediation for Tier 1 vendors
- Document and ratify all fifteen DMN decision tables; implement as documented decision criteria (manual DMN application at Horizon 1)
- Establish decision audit log (basic ITSM record acceptable); define retention standards and access controls
- Define AI Governance Checklist; establish Model Risk Inventory; assess all current AI deployments against SR 11-7 tiers
- Map all knowledge bases; identify knowledge generation points; begin structured knowledge capture

**Success Criteria:** All existing vendors tiered; all current AI models in MRM inventory; Software Registry seeded; DMN tables approved by governance.

#### Horizon 2: Structured Automation (Months 7-18) — Process Digitization

**Objective:** Deploy automated tooling and BPMN process engine execution for core workflow phases.

**Deliverables:**
- Deploy conversational AI intake bot with completeness enforcement; integrate Software Registry query and Capability Reuse Gate (DMN-15) into bot session
- Implement DMN-01 through DMN-05 and DMN-15 in BPMN process engine (Camunda Platform 7); automate routing and scoring
- Automate PRD generation from structured intake data; deploy Jira/ADO integration for Epic and Story push; establish Git branch automation
- Implement Legal Knowledge Graph Phase 1: RFP clause library for top 5 acquisition scenarios
- Deploy immutable decision audit log in WORM-compliant storage; implement automated retention enforcement
- Implement DMN-06 through DMN-08 for Buy pathway automation; automate TPRM monitoring schedule triggers
- Deploy Knowledge Staging Agent for Phases 1-4; replace identified email-based handoffs with structured knowledge flows
- Implement SLA monitoring, queue visibility dashboards, and basic escalation timers

**Success Criteria:** All new requests through automated intake; composite scoring automated; PRD auto-generation live; WORM audit log operational; Buy pathway DMNs automated.

#### Horizon 3: Intelligent Optimization (Months 19-36) — Full Framework Realization

**Objective:** Complete the intelligent automation layer and achieve full framework operation.

**Deliverables:**
- Full Legal Knowledge Graph deployment: complete clause library covering all acquisition types, regulatory domains, and jurisdictions; AI-assisted redline review
- Shadow IT continuous detection: SSO and expense management integration for real-time identification and automated intake trigger
- AI model performance observability: full drift monitoring, bias detection, and hallucination monitoring dashboards for all Tier 1 and Tier 2 models
- Automated regulatory reporting package: pre-built exam package generation for OCC, FINRA, and SEC; 24-hour retrieval SLA met with automated tooling
- Predictive portfolio management: demand forecasting for technology requests; resource prediction; proactive vendor renewal management
- Fourth-party risk monitoring: automated monitoring of critical vendor sub-contractors via news, sanctions, and financial stability feeds
- Full Knowledge Staging Agent deployment across all phases; all knowledge bases continuously updated; zero email-based handoffs in governed workflow
- Bottleneck-driven automation: automated identification and implementation of automation opportunities based on process telemetry data

**Success Criteria:** 68-75% cycle time reduction achieved; ≥30% reuse rate; 100% decision provenance; 24-hour regulatory exam retrieval; all Tier 1/2 AI models with active drift monitoring.

### 14.2 Automation Eligibility Criteria

A task is eligible for automation when evidence demonstrates:
- The task has been executed manually at least 10 times with consistent, documented outcomes
- The task's decision logic can be expressed as deterministic rules (DMN) or deterministic agent operations
- Automation would reduce the task's cycle time by >50% or eliminate a documented bottleneck
- The task's outputs can be validated against historical outcomes with >95% accuracy
- The compliance and audit trail requirements can be maintained in the automated mode

---

## 15. Risks and Mitigations

### 15.1 Change Management Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Stakeholder resistance to formalized DMN governance replacing informal decision-making | High | High | Executive sponsorship from Technology and Risk leadership jointly required before framework activation; training investment for Product Owners, Procurement Leads, and TPRM managers in DMN logic and SR 11-7 compliance |
| Requestors bypassing formal intake to use informal channels ("shadow governance") | High | High | Measure adoption rate of intake portal vs. informal channels; Council refuses to review any request not entered through formal intake; executive mandate required |
| Product Owner capacity insufficient to manage increased governance throughput | Medium | High | Portfolio Governance Council cadence established and resourced before Horizon 1 launch; capacity planning metrics tracked from Day 1 |
| Cross-functional governance body (Council) lacking decision-making quorum | Medium | Medium | Define quorum requirements in Council charter; establish proxy voting rules; standing meeting slot protected with executive sponsorship |

### 15.2 Technology Adoption Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| CMDB data quality insufficient to seed reliable Software Registry | High | High | Registry seeding audit in Horizon 1; Software Asset Manager reconciles CMDB vs. vendor invoices before nightly reconciliation automation activated |
| AI agent outputs non-deterministic or inconsistent | Medium | High | Agents bound to specific versioned knowledge bases; confidence threshold (≥85%) required before agent output used in decision; human escalation mandatory below threshold |
| Trust Center APIs unavailable or returning incomplete data for vendor due diligence | Medium | Medium | Fallback to manual evidence request workflow maintained; Trust Center connectivity monitored; SLA breach alerts when evidence collection delayed |
| Legal Knowledge Graph clause conflicts creating RFP quality issues | Low | High | All auto-assembled clauses reviewed and approved by Legal Counsel before RFP issuance; conflict detection logic required as gate before Legal review |

### 15.3 Regulatory Change Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Material regulatory guidance change requiring DMN table updates | Medium | High | 60-day update SLA on material changes; Compliance Governance owns regulatory KB with change monitoring; quarterly DMN table review required |
| EU AI Act high-risk AI classification changes affecting intake routing | Medium | Medium | AI risk classification DMN-09 reviewed in each quarterly DMN audit; Compliance Governance tracks EU AI Act implementation guidance |
| OCC examination finding governance gaps requiring emergency process changes | Low | Critical | Three-level gap analysis (framework, lifecycle, evidence coverage) performed quarterly; Internal Audit independent assurance program active from Horizon 1 |
| WORM storage technology change affecting audit log compliance | Low | High | Audit log architecture reviewed at each technology renewal; SEC Rule 17a-4 compliance tested in annual internal audit drill |

### 15.4 Data Quality Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Software Registry semantic matching producing false positives leading to incorrect reuse redirects | Medium | Medium | >90% similarity threshold for automatic redirect; 70-90% requires human Product Owner review; requestors can override with documented rationale |
| Composite risk scoring model producing systematically incorrect pathway assignments | Low | High | Routing confidence threshold (≥85%) required for automated assignment; all Tier 2 routing reviewed by humans; scoring model back-tested quarterly against actual outcomes |
| Knowledge base becoming stale or inconsistent across phases | Medium | Medium | Knowledge Staging Agent validation rules enforce schema consistency; Software Asset Manager quarterly audit; Compliance Governance 60-day update SLA for regulatory changes |

---

## Appendix A: BPMN File Reference

| Process Model | File Path | Phase |
|---|---|---|
| Intake and Risk Classification | `processes/phase-1-needs-assessment/intake-risk-classification.bpmn` | 1 |
| AI Routing Engine | `processes/phase-2-routing/` | 2 |
| Product Management Review | `processes/phase-3-product-review/` | 3 |
| Portfolio Governance | `processes/phase-4-portfolio-governance/` | 4 |
| PDLC Build Pathway | `processes/phase-5a-pdlc-build/` | 5A |
| TPRM Buy Pathway | `processes/phase-5b-tprm-procurement/` | 5B |
| Observability and Audit | `processes/phase-6-observability/` | 6 |

## Appendix B: DMN File Reference

| DMN Table | File Path |
|---|---|
| DMN-09: AI Risk Tier Classification | `decisions/phase-1/dmn-09-ai-risk-tier-classification.dmn` |
| DMN-15: Capability Reuse Gate | `decisions/phase-1/dmn-15-capability-reuse-gate.dmn` |
| DMN-01: AI Routing and Pathway Assignment | `decisions/phase-2/dmn-01-ai-routing-pathway-assignment.dmn` |
| DMN-13: Fast-Track Eligibility | `decisions/phase-2/dmn-13-fast-track-eligibility.dmn` |
| DMN-02: Information Completeness Gate | `decisions/phase-3/dmn-02-information-completeness-gate.dmn` |
| DMN-03: Duplicate Merge and Reuse Decision | `decisions/phase-3/dmn-03-duplicate-merge-reuse-decision.dmn` |
| DMN-04: Go/No-Go Viability | `decisions/phase-4/dmn-04-go-no-go-viability.dmn` |
| DMN-05: Buy vs. Build Analysis | `decisions/phase-4/dmn-05-buy-vs-build-analysis.dmn` |
| DMN-10: Proof of Concept Gate | `decisions/phase-5a/dmn-10-proof-of-concept-gate.dmn` |
| DMN-11: Technology and Risk Evaluation Gate | `decisions/phase-5a/dmn-11-technology-risk-evaluation-gate.dmn` |
| DMN-12: Observability Tier Assignment | `decisions/phase-5a/dmn-12-observability-tier-assignment.dmn` |
| DMN-06: Vendor Risk Tier Assignment | `decisions/phase-5b/dmn-06-vendor-risk-tier-assignment.dmn` |
| DMN-07: Vendor Selection and RAE Gate | `decisions/phase-5b/dmn-07-vendor-selection-rae-gate.dmn` |
| DMN-08: Funding Confirmation Gate | `decisions/phase-5b/dmn-08-funding-confirmation-gate.dmn` |
| DMN-14: TPRM Monitoring Frequency | `decisions/phase-5b/dmn-14-tprm-monitoring-frequency.dmn` |

## Appendix C: Glossary

| Term | Definition |
|---|---|
| A (Automated) | Task type: fully automated execution with no human intervention; deterministic inputs and outputs |
| BCBS d577 | Basel Committee on Banking Supervision consultative document on third-party risk concentration |
| BPMN 2.0 | Business Process Model and Notation — OMG standard for executable process modeling |
| CMDB | Configuration Management Database: the authoritative record of all IT assets and their relationships |
| Critical Activity | Per OCC guidance, any activity that if disrupted would significantly impact the institution's ability to provide services, comply with regulations, or maintain financial stability |
| DA (Deterministic Agent-Enabled) | Task type: agent executes using deterministic knowledge bases and DMN rules; outputs reproducible; decision provenance logged |
| DMN | Decision Model and Notation: OMG standard for representing business decision logic in tabular form |
| DORA | Digital Operational Resilience Act — EU regulation mandating ICT risk management for financial institutions |
| FS AI RMF | Financial Services AI Risk Management Framework — 230 control objectives for AI in financial services |
| H (Human-in-the-Loop) | Task type: human judgment required; human is accountable; may be informed by agent analysis |
| HLDD | High Level Design Document: architecture artifact describing system context, data flows, integration points, security controls, and observability design |
| Knowledge Staging Agent | Automated agent that captures validated knowledge outputs from each phase and stages them into deterministic knowledge bases |
| Legal Knowledge Graph (LKG) | Graph database of legal clauses, regulatory requirements, contract types, and their semantic relationships for context-driven clause selection |
| Model Card | Structured document describing an AI model's purpose, training data, metrics, limitations, and bias assessment per SR 11-7 standards |
| MRM | Model Risk Management: governance discipline for identifying, assessing, and mitigating risks from quantitative models, governed by SR 11-7 |
| NVD | National Vulnerability Database: NIST-maintained database of security vulnerabilities linked to SBOM components |
| PDLC | Product Development Life Cycle: internal build pathway governance framework |
| PRD | Product Requirements Document: structured artifact defining functional, non-functional, regulatory, and AI governance requirements |
| PSI | Population Stability Index: statistical measure of distribution shift used for AI model input drift monitoring |
| RAE | Risk Assessment Evaluation: formal vendor risk assessment during TPRM due diligence |
| SBOM | Software Bill of Materials: machine-readable record of all software components and dependencies |
| Software Registry | The institution's authoritative, continuously-updated catalog of all software assets |
| SR 11-7 | Federal Reserve Supervisory Letter 11-7 (2011): primary regulatory guidance for Model Risk Management |
| TPRM | Third-Party Risk Management: governance program for vendor/supplier risk throughout the relationship lifecycle |
| Vendor Risk Tier | Classification (Tier 1-4) assigned to each vendor based on criticality, data sensitivity, concentration risk, and regulatory exposure |
| WORM Storage | Write Once, Read Many: storage architecture where records cannot be modified after initial write, satisfying regulatory preservation requirements |

---

*Document version: 1.0 | March 2026 | Enterprise Software Governance Platform PRD*
*Source specification: Enterprise_Software_Governance_Master.md v2.0*
