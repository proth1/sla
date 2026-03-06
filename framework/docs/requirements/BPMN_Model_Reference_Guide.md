# Enterprise Software Intake to Retirement — BPMN Process Model Reference Guide

## Model Overview

**File:** `Enterprise_Software_Intake_to_Retirement_BPMN.bpmn`  
**Standard:** BPMN 2.0 (OMG) — importable into Camunda Modeler, Bizagi, Signavio, IBM BPM, Appian, and other BPMN 2.0-compliant tools  
**Process ID:** PRC-E2E-001  
**Process Owner:** Enterprise Architecture Governance Board  

### Model Statistics

| Element Type | Count |
|---|---|
| Processes (Pools) | 6 |
| Sub-Processes (expanded + collapsed) | 24 |
| Tasks (user, service, send, business rule) | 123 |
| Gateways (XOR, AND, OR) | 13 |
| Timer Boundary Events (SLA monitors) | 26 |
| Data Store References (Knowledge Bases) | 10 |
| Sequence Flows | 197 |
| Cross-Pool Message Flows | 12 |
| Cross-Cutting Event Sub-Processes | 6 |
| DMN Decision Tables Referenced | 9 |

---

## Import Instructions

1. **Camunda Modeler (recommended):** File → Open → select `.bpmn` file. All sub-processes, gateways, and timer events render natively.
2. **Bizagi Modeler:** Import → BPMN 2.0 XML → select file. May require manual layout adjustment.
3. **Signavio / SAP:** Import → BPMN 2.0 → upload. Diagram coordinates included.
4. **IBM BAW / Appian:** Import as BPMN 2.0 process definition.

---

## Process Architecture

### Pools (Organizational Participants)

| Pool | Role | Key Responsibilities |
|---|---|---|
| Requestor Pool | Business Units | Idea submission, business justification, UAT sign-off |
| Governance Pool | Enterprise Governance Board | Approval gates, risk classification, compliance oversight (hosts primary flow) |
| Technical Pool | Architecture / Security / Dev | Solution design, integration review, threat modeling, build/test/deploy |
| Vendor Pool | Third-Party Vendors | Vendor assessment, contract negotiation, SLA management |
| Operations Pool | IT Operations / SRE | Provisioning, monitoring, incident response, retirement |
| AI Platform Pool | AI Agents & DMN Engine | 9 AI agents + DMN engine executing all decision tables |

### Phase Structure

| Phase | Process ID | Sub-Processes | SLA Target (Standard) | Model Detail |
|---|---|---|---|---|
| 1: Initiation & Idea Intake | PRC-PH1-001 | SP-1.1, SP-1.2, SP-1.3 | 3–5 days | Fully expanded |
| 2: Assessment & Classification | PRC-PH2-001 | SP-2.1, SP-2.2, SP-2.3, SP-2.4, SP-2.5 | 5–10 days | Fully expanded |
| 3: Onboarding & Provisioning | PRC-PH3-001 | SP-3.1, SP-3.2, SP-3.3, SP-3.4, SP-3.5 | 10–20 days | Fully expanded |
| 4: Architecture & Design | PRC-PH4-001 | SP-4.1 through SP-4.5 | 10–15 days | Collapsed |
| 5: Development & Build | PRC-PH5-001 | SP-5.1 through SP-5.5 | Variable (Sprint) | Collapsed |
| 6: Testing & Validation | PRC-PH6-001 | SP-6.1 through SP-6.5 | 5–15 days | Collapsed |
| 7: Deployment & Release | PRC-PH7-001 | SP-7.1 through SP-7.4 | 2–5 days | Collapsed |
| 8: Operations → Retirement | PRC-PH8-001 | SP-8.1 through SP-8.5 | Ongoing | Collapsed |

---

## SLA Timer Architecture

Every sub-process has non-interrupting timer boundary events configured at progressive thresholds per the document's escalation framework:

| Threshold | Action | Notification Target |
|---|---|---|
| 50% of SLA | Warning — dashboard turns yellow | Activity owner |
| 75% of SLA | Alert — escalate to manager | Activity owner + manager |
| 90% of SLA | Critical alert — mandatory status update | Governance lead + management |
| 100% of SLA | Formal breach — RCA initiated within 24 hours | Governance Board + all stakeholders |

Timer durations are specified in ISO 8601 format (e.g., `PT4H` = 4 hours, `P2DT12H` = 2.5 days, `P5D` = 5 days) and are set relative to each sub-process's SLA target for Standard-risk initiatives.

---

## DMN Decision Tables in the Model

| DMN ID | Decision Name | Hit Policy | Used In | BPMN Element Type |
|---|---|---|---|---|
| DMN-DT-001 | Risk Tier Classification | Priority (P) | SP-1.2, SP-2.5 | businessRuleTask |
| DMN-DT-002 | Governance Pathway Determination | Unique (U) | SP-1.2 | businessRuleTask |
| DMN-DT-003 | Governance Gate Decision | Priority (P) | SP-1.3, SP-2.5, SP-3.5, all gates | businessRuleTask |
| DMN-DT-004 | Technology Approval Decision | Unique (U) | SP-2.1 | businessRuleTask |
| DMN-DT-005 | Security Controls Mapping | Collect (C+) | SP-2.2 | businessRuleTask |
| DMN-DT-006 | Vendor Risk Classification | Priority (P) | SP-2.3 | businessRuleTask |
| DMN-DT-007 | Regulatory Applicability Mapping | Collect (C+) | SP-2.4 | businessRuleTask |
| DMN-DT-008 | AI Agent Automation Level | Unique (U) | SP-3.2 | businessRuleTask |
| DMN-DT-009 | Deployment Strategy Selection | Unique (U) | Phase 7 | Referenced in documentation |

---

## Cross-Cutting Event Sub-Processes

| Event Sub-Process | Trigger Type | SLA | Scope |
|---|---|---|---|
| SLA Breach Management | Timer (Non-Interrupting) | Response within 2 hours | All activities |
| Vulnerability Remediation | Signal (Interrupting) | Critical: 4h / High: 24h | All phases |
| Incident Response | Signal (Interrupting) | Sev 1: 15 min | All phases |
| Regulatory Change Management | Message (Non-Interrupting) | Assessment within 5 days | All phases |
| Continuous Improvement | Timer (Non-Interrupting, monthly) | Cadence-dependent | All phases |
| **Stakeholder Communication** *(blind spot)* | Timer (Non-Interrupting, weekly) | Weekly cadence | All phases |

---

## Blind Spots Identified and Addressed

The following gaps were identified in the source document and added to the BPMN model as additional tasks and sub-processes:

### 1. Stakeholder Communication Event Sub-Process (EventSP_StakeholderComm)
**Gap:** No formal mechanism for consistent stakeholder status reporting across the lifecycle.  
**Added:** Weekly timer-triggered event sub-process that gathers status from all active sub-processes, auto-generates a status report with SLA dashboard, and distributes to stakeholders by role.

### 2. Vendor Exit Strategy Validation (T-2.3.3.3)
**Gap:** Contract review covers terms but doesn't explicitly validate exit strategy and data portability.  
**Added:** Task in SP-2.3 that validates vendor exit strategy, data portability plan, and transition SLAs before vendor is onboarded.

### 3. Cross-Border Data Transfer Assessment (T-2.4.3.3)
**Gap:** Regulatory mapping identifies applicable regulations but doesn't specifically address cross-border data transfer complexities.  
**Added:** Task in SP-2.4 assessing adequacy decisions, Standard Contractual Clauses (SCCs), Binding Corporate Rules (BCRs), and data localization mandates.

### 4. DR/Backup Configuration Validation (T-3.1.3.3)
**Gap:** Environment provisioning validates security controls and health but doesn't explicitly validate disaster recovery configuration.  
**Added:** Task in SP-3.1 validating DR configuration, backup schedules, RTO/RPO targets, and failover procedures.

### 5. Privileged Access Review & JIT Configuration (T-3.3.3.2)
**Gap:** Access provisioning covers RBAC and MFA but doesn't explicitly address privileged access management and Just-In-Time elevation.  
**Added:** Task in SP-3.3 reviewing all privileged/admin access grants and configuring JIT access policies with PAM tool integration.

### 6. Data Lineage & Catalog Registration (T-3.4.3.2)
**Gap:** Data environment setup provisions databases and governance controls but doesn't register new data assets in the enterprise data catalog.  
**Added:** Task in SP-3.4 for enterprise data catalog registration with lineage documentation, quality rules, and stewardship assignments.

### 7. Risk Register Handoff & Acceptance (T-3.5.3.3)
**Gap:** Kickoff meeting reviews scope and risks but no formal handoff of the risk register from governance to the project team.  
**Added:** Task in SP-3.5 for formal risk register handoff with explicit acknowledgment of open risks, mitigations, and residual risk acceptance.

### 8. AI Confidence Threshold Gateway (GW_Confidence)
**Gap:** The document describes the confidence escalation rule textually but doesn't model it as an explicit gateway.  
**Added:** Exclusive gateway in SP-1.2 that routes based on AI confidence score ≥ 85% (proceed) vs. < 85% (escalate to Sr. Governance Lead).

---

## Gateway Reference

| Gateway ID | Type | Location | Routing Logic |
|---|---|---|---|
| GW-1.1 | Exclusive (XOR) | After SP-1.1 | Complete → SP-1.2 · Incomplete → loop back · Duplicate → merge |
| GW-1.2 | Exclusive (XOR) | After SP-1.2 | Low → Express to Phase 2 · Medium/High/Critical → SP-1.3 |
| GW-1.3 | Exclusive (XOR) | After SP-1.3 | Approved → Phase 2 · Conditional → loop · Deferred → backlog · Rejected → archive |
| GW-Confidence | Exclusive (XOR) | Within SP-1.2 | AI confidence ≥ 85% → proceed · < 85% → escalate |
| GW-2.1 | Parallel (AND) | Phase 2 entry | Split → SP-2.1, SP-2.2, GW-2.2, SP-2.4 |
| GW-2.2 | Inclusive (OR) | Vendor check | Vendor involved → SP-2.3 · No vendor → skip to join |
| GW-2.3 | Parallel (AND) | Before SP-2.5 | Join all assessment tracks |
| GW-2.4 | Exclusive (XOR) | After SP-2.5 | Approved → Phase 3 · Remediate → loop · Reject → archive |
| GW-3.1 | Parallel (AND) | Phase 3 entry | Split → SP-3.1, SP-3.2, SP-3.3, SP-3.4 |
| GW-3.2 | Inclusive (OR) | Within SP-3.3 | Vendor access → provision · No vendor → skip |
| GW-3.3 | Parallel (AND) | Before SP-3.5 | Join all provisioning tracks |
| GW-3.4 | Exclusive (XOR) | Phase 3 exit | All met → Phase 4 · Outstanding → loop · Critical → escalate |

---

## Data Architecture

### Knowledge Base Data Stores (KB-001 through KB-010)

All 10 knowledge bases from the source document are modeled as BPMN Data Store References, with documentation linking each to the specific sub-processes and DMN tables that consume them.

### Data Objects

| Data Object | Created By | Consumed By |
|---|---|---|
| Initiative Record (INI-YYYY-NNNN) | SP-1.1 | All subsequent phases |
| Consolidated Risk Assessment Report | SP-2.5 | Phase 2 gate, Phase 3 planning |
| Onboarding Plan with Resource Allocation | SP-2.5 / SP-3.5 | Phase 3 execution, Phase 4 entry |
| Assessment Scope Matrix | SP-1.2 | Phase 2 assessment scope |

---

## End-to-End Cycle Time Targets

| Risk Pathway | Phase 1 | Phase 2 | Phase 3 | Total Intake-to-Onboard |
|---|---|---|---|---|
| Express (Low Risk) | 1–2 days | 2–3 days | 5–8 days | **8–15 days** |
| Standard | 3–5 days | 5–10 days | 10–20 days | **29–45 days** |
| Enhanced (High) | 3–5 days | 7–12 days | 12–22 days | **32–49 days** |
| Full (Critical) | 5–7 days | 10–15 days | 15–25 days | **40–60 days** |
| Industry Baseline | 15–25 days | 30–45 days | 30–40 days | **90–120 days** |
