# Regulatory Alignment for SLA Governance Platform

This file maps the 11 regulatory frameworks to the 8-phase governance lifecycle, defines BPMN annotation patterns, and specifies evidence requirements. Load this context when creating compliance-relevant process models or reviewing regulatory coverage.

## Framework Overview

| Framework | Regulator / Body | Geographic Scope | Primary Domain |
|-----------|-----------------|-----------------|----------------|
| OCC 2023-17 | OCC (U.S.) | United States | Third-Party Risk Management |
| SR 11-7 | Federal Reserve (U.S.) | United States | Model Risk Management |
| SOX | SEC / PCAOB (U.S.) | United States | Financial Reporting Controls |
| GDPR/CCPA | EU DPAs / California AG | European Union + California | Personal Data Protection |
| EU AI Act | European Parliament | European Union | Artificial Intelligence Systems |
| DORA | European Parliament | European Union | Digital Operational Resilience |
| NIST CSF 2.0 | NIST (U.S.) | United States (broadly adopted) | Cybersecurity Framework |
| ISO 27001 | ISO/IEC | Global | Information Security Management |
| SEC 17a-4 | SEC (U.S.) | United States | Records Retention |
| BCBS d577 | Basel Committee | Global (G20 jurisdictions) | Operational Resilience |
| FS AI RMF | Financial Stability Board | Global (financial sector) | Financial Services AI Risk |

## OCC 2023-17 — Third-Party Risk Management

**Full Title**: OCC Bulletin 2023-17, Third-Party Relationships: Interagency Guidance on Risk Management
**Applies to**: Financial institutions subject to OCC supervision with third-party vendor relationships

### Phase Mapping

| Phase | OCC 2023-17 Requirement | Governance Activities |
|-------|------------------------|----------------------|
| Phase 2 | Initial Risk Assessment (§III.A) | Risk tier classification using DMN_RiskTierClassification; pathway determination using DMN_PathwayRouting |
| Phase 3 | Due Diligence (§III.B) | Financial stability review, operational capability assessment, security questionnaire, sub-contractor review via swarm evaluation |
| Phase 5 | Contract Negotiation (§III.C) | Contractual protections: performance standards, audit rights, data ownership, termination/exit rights, business continuity |
| Phase 8 | Ongoing Monitoring (§III.D) | SLA performance monitoring via DMN_MonitoringCadenceAssignment; periodic due diligence renewal; vendor risk re-assessment |
| Phase 8 (8R) | Exit Strategy (§III.E) | Data return/destruction, license termination, knowledge transfer, transition assistance |

### BPMN Annotation Pattern

```xml
<bpmn:textAnnotation id="Annotation_OCC_DueDiligence">
  <bpmn:text>OCC 2023-17 §III.B: Due Diligence — financial stability, operational capability, and security posture must be assessed before contracting proceeds</bpmn:text>
</bpmn:textAnnotation>
<bpmn:association id="Association_OCC_DueDiligence"
  sourceRef="Task_3_1_VendorDueDiligence"
  targetRef="Annotation_OCC_DueDiligence" />
```

### Evidence Requirements by Phase

| Phase | Required Evidence | Retention |
|-------|-----------------|-----------|
| Phase 2 | Initial risk assessment worksheet, risk tier determination | 7 years |
| Phase 3 | Due diligence checklist, vendor financials summary, security questionnaire, sub-contractor list | 7 years |
| Phase 5 | Signed contract with OCC-required provisions checklist, audit rights confirmation | 7 years (from contract end) |
| Phase 8 | Quarterly performance reports, annual due diligence renewal, SLA breach logs | 7 years |
| Phase 8 (8R) | Data destruction certificate, exit plan documentation, transition completion record | 7 years |

## SR 11-7 — Model Risk Management

**Full Title**: Federal Reserve SR 11-7, Guidance on Model Risk Management
**Applies to**: Bank holding companies and state-chartered member banks using models for decision-making

### Phase Mapping

| Phase | SR 11-7 Requirement | Governance Activities |
|-------|---------------------|----------------------|
| Phase 2 | Model Inventory (§II) | DMN_RiskTierClassification determines if SR 11-7 applies; add to model inventory register |
| Phase 3 | Validation Design (§IV) | AI Review lane: independent validation plan design; validator identification (must be independent of model developers) |
| Phase 4 | Independent Validation (§IV.A-C) | Governance Review consolidates: conceptual soundness review, ongoing monitoring setup, outcomes analysis methodology |
| Phase 8 | Ongoing Monitoring (§V) | Performance tracking against benchmarks; periodic model recalibration review; trigger-based re-validation per DMN_MonitoringCadenceAssignment |

### BPMN Annotation Pattern

```xml
<bpmn:textAnnotation id="Annotation_SR117_Validation">
  <bpmn:text>SR 11-7 §IV.A-C: Independent model validation — validators must be independent of model developers; covers conceptual soundness, process verification, and outcomes analysis</bpmn:text>
</bpmn:textAnnotation>
```

### Trigger Condition

SR 11-7 requirements activate when `DMN_RiskTierClassification` returns `Limited` or `High` for a model-based system with AI/ML components. The Phase 2 risk tier classification gates whether SR 11-7 review tasks are included in Phase 3 (AI Review lane) and Phase 4.

### Evidence Requirements by Phase

| Phase | Required Evidence | Retention |
|-------|-----------------|-----------|
| Phase 2 | Model inventory registration form, SR 11-7 applicability determination | Life of model + 5 years |
| Phase 3 | Validation plan, validator independence attestation, AI review findings | Life of model + 5 years |
| Phase 4 | Validation report (conceptual soundness, process verification, outcomes analysis) | Life of model + 5 years |
| Phase 8 | Quarterly monitoring reports, trigger-based re-validation records | Life of model + 5 years |

## EU AI Act — Artificial Intelligence Systems

**Full Title**: Regulation (EU) 2024/1689 of the European Parliament and of the Council on Artificial Intelligence
**Applies to**: AI systems placed on EU market or affecting EU persons, regardless of where provider is based

### Risk Classification (DMN_RiskTierClassification Output for AI Systems)

| DMN Output | AI Act Risk Level | Governance Implication |
|-----------|-------------------|----------------------|
| `Minimal` | Minimal Risk | Standard pathway; no special AI Act obligations |
| `Limited` | Limited Risk | Transparency obligations; disclosure to users interacting with AI |
| `High` | High Risk | Conformity assessment required; technical documentation per Annex IV |
| `Unacceptable` | Prohibited | Cannot proceed — routes to End_Rejected at Phase 2 gateway |

### Phase Mapping

| Phase | EU AI Act Requirement | Governance Activities |
|-------|----------------------|----------------------|
| Phase 2 | Risk Classification (Arts. 6-7) | DMN_RiskTierClassification for AI systems; if Unacceptable → End_Rejected; if High → enhanced pathway |
| Phase 3 | Conformity Assessment Design (Art. 43) | AI Review lane: conformity assessment plan; identify notified body if required; technical documentation scope |
| Phase 4 | Technical Documentation (Annex IV) | Governance Review consolidates AI conformity findings; EU AI database registration if applicable |
| Phase 6 | Testing and Validation (Art. 9) | Accuracy, robustness, cybersecurity testing; human oversight mechanism validation |
| Phase 8 | Post-Market Monitoring (Art. 72) | Incident reporting to national supervisory authority; serious incident log; annual reporting |

### BPMN Annotation Pattern

```xml
<bpmn:textAnnotation id="Annotation_EUAIAct_Conformity">
  <bpmn:text>EU AI Act Art. 43 + Annex IV: Conformity assessment and technical documentation required for high-risk AI systems — must complete before Phase 6 SDLC proceeds</bpmn:text>
</bpmn:textAnnotation>
```

### Evidence Requirements by Phase

| Phase | Required Evidence | Retention |
|-------|-----------------|-----------|
| Phase 2 | AI risk classification determination, prohibited use check | 10 years post-decommission |
| Phase 3 | Conformity assessment plan, notified body engagement record (if required) | 10 years post-decommission |
| Phase 4 | Technical documentation (Annex IV), EU AI database registration | 10 years post-decommission |
| Phase 6 | Testing results (accuracy, robustness, cybersecurity), human oversight validation | 10 years post-decommission |
| Phase 8 | Post-market monitoring logs, serious incident reports, annual monitoring report | 10 years post-decommission |

## DORA — Digital Operational Resilience Act

**Full Title**: Regulation (EU) 2022/2554 on Digital Operational Resilience for the Financial Sector
**Applies to**: Financial entities in EU including banks, investment firms, insurance, payment institutions

### Phase Mapping

| Phase | DORA Requirement | Governance Activities |
|-------|-----------------|----------------------|
| Phase 3 | ICT Risk Assessment (Art. 6) | Technical Assessment lane: identify ICT dependencies, assess concentration risk, evaluate resilience capabilities |
| Phase 5 | Contractual Requirements (Art. 30) | Contracting lane: execute contracts with all mandatory DORA provisions; register in ICT third-party register |
| Phase 8 | Incident Reporting (Arts. 17-23) | ICT-related incident classification and reporting; major incident reports to competent authority |
| Phase 8 | Resilience Testing (Arts. 25-26) | Annual TLPT (Threat-Led Penetration Testing) for significant ICT third parties |

### BPMN Annotation Pattern

```xml
<bpmn:textAnnotation id="Annotation_DORA_Contractual">
  <bpmn:text>DORA Art. 30: ICT third-party contractual arrangements — mandatory provisions include service levels, audit rights, data location, exit obligations, and business continuity</bpmn:text>
</bpmn:textAnnotation>
```

### Key Decision Point

In Phase 8, `DMN_MonitoringCadenceAssignment` must account for DORA-classified ICT incidents. When an incident meets DORA major incident criteria (impacts >= 3 clients, or duration > 4 hours for payment services), the escalation flow triggers a regulatory reporting obligation.

### Evidence Requirements by Phase

| Phase | Required Evidence | Retention |
|-------|-----------------|-----------|
| Phase 3 | ICT risk assessment report, concentration risk analysis | 5 years |
| Phase 5 | Signed contract with DORA provisions checklist, ICT third-party register entry | 5 years (from contract end) |
| Phase 8 | ICT incident log, major incident reports (filed with authority), TLPT results | 5 years |

## SOX — Sarbanes-Oxley Act

**Full Title**: Sarbanes-Oxley Act of 2002, Sections 302 and 404 (Financial Controls)
**Applies to**: U.S. public companies; relevant to financial reporting systems and IT general controls (ITGCs)

### Phase Mapping

| Phase | SOX Requirement | Governance Activities |
|-------|----------------|----------------------|
| Phase 5 | Control Design Documentation | Contracting lane: document IT general controls (access management, change management, operations) covering the solution |
| Phase 6 | Control Testing | SDLC testing validates ITGC effectiveness; test results and remediation documented; external auditor coordination |
| Phase 8 | Control Monitoring | Continuous ITGC monitoring; quarterly self-assessment; annual attestation; deficiency remediation |

### BPMN Annotation Pattern

```xml
<bpmn:textAnnotation id="Annotation_SOX_Controls">
  <bpmn:text>SOX §404: IT general controls design documentation required for financial reporting systems — access, change management, and operations controls must be documented in Phase 5 before SDLC proceeds</bpmn:text>
</bpmn:textAnnotation>
```

### Scope Determination

SOX obligations apply when the solution processes data used in SEC financial filings or is linked to financial reporting. This scoping decision is established in the Phase 2 risk scoping exercise and flows through Phases 5, 6, and 8.

### Evidence Requirements by Phase

| Phase | Required Evidence | Retention |
|-------|-----------------|-----------|
| Phase 5 | Control design documentation, control matrix | 7 years |
| Phase 6 | Control test results, deficiency log, remediation evidence | 7 years |
| Phase 8 | Annual control assessment, quarterly self-assessment records, auditor walkthrough records | 7 years |

## GDPR / CCPA — Personal Data Protection

**Full Titles**:
- GDPR: Regulation (EU) 2016/679 on the Protection of Natural Persons with Regard to the Processing of Personal Data
- CCPA: California Consumer Privacy Act (Cal. Civ. Code §§ 1798.100 et seq.)
**Applies to**: Any processing of EU/EEA resident personal data (GDPR) or California resident personal data (CCPA), regardless of processor location

### Phase Mapping

| Phase | GDPR/CCPA Requirement | Governance Activities |
|-------|----------------------|----------------------|
| Phase 2 | Data Classification + DPIA (GDPR Arts. 4, 35) | Risk scoping identifies personal data scope; DPIA trigger assessment; DPO consultation where required |
| Phase 5 | DPA Execution (GDPR Art. 28; CCPA §1798.100) | Contracting lane: Data Processing Agreement with vendor; international transfer safeguards (GDPR Art. 46) |
| Phase 8 | Data Subject Rights + Breach (GDPR Arts. 15-22, 33-34) | Procedures for access, rectification, erasure, portability requests; breach notification |
| Phase 8 (8R) | Data Deletion / Transfer Verification | Verify secure deletion or transfer of all personal data; document destruction certificates; RoPA closure |

### BPMN Annotation Pattern

```xml
<bpmn:textAnnotation id="Annotation_GDPR_DPIA">
  <bpmn:text>GDPR Art. 35: Data Protection Impact Assessment required for high-risk processing — large-scale PII, special categories, or systematic monitoring triggers mandatory DPIA in Phase 2</bpmn:text>
</bpmn:textAnnotation>
```

### DPIA Trigger Conditions

A DPIA is mandatory (GDPR Art. 35) when processing involves:
- Large scale (> 10,000 data subjects or EU-wide reach)
- Systematic monitoring of publicly accessible areas
- Special categories (health, biometric, genetic, political opinions, etc.)
- Automated decision-making with significant effects on individuals

### Evidence Requirements by Phase

| Phase | Required Evidence | Retention |
|-------|-----------------|-----------|
| Phase 2 | Data mapping record, lawful basis documentation, RoPA entry, DPIA report | Duration of processing + 3 years |
| Phase 5 | Signed DPA, international transfer mechanism documentation (SCCs, BCRs) | Duration of contract + 3 years |
| Phase 8 | Data subject request log and responses, breach notification records | 5 years |
| Phase 8 (8R) | Data deletion/transfer certificates, RoPA closure record | 5 years |

## NIST CSF 2.0 — Cybersecurity Framework

**Full Title**: NIST Cybersecurity Framework 2.0
**Applies to**: U.S. organizations (widely adopted globally) managing cybersecurity risk

### Phase Mapping

| Phase | NIST CSF 2.0 Function | Governance Activities |
|-------|----------------------|----------------------|
| Phase 3 | Identify (ID) + Protect (PR) | Technical Assessment lane: asset identification, vendor cybersecurity posture, control gap analysis |
| Phase 7 | Protect (PR) + Detect (DE) | Deployment security validation, monitoring capability verification, detection control activation |
| Phase 8 | Detect (DE) + Respond (RS) + Recover (RC) | Continuous monitoring, incident detection, response plan testing, recovery capability validation |

### BPMN Annotation Pattern

```xml
<bpmn:textAnnotation id="Annotation_NIST_CSF">
  <bpmn:text>NIST CSF 2.0 (Identify/Protect): Vendor cybersecurity posture assessment covers asset identification, supply chain risk, and protective control gaps during Phase 3 due diligence</bpmn:text>
</bpmn:textAnnotation>
```

### Evidence Requirements by Phase

| Phase | Required Evidence | Retention |
|-------|-----------------|-----------|
| Phase 3 | Vendor cybersecurity assessment, control gap analysis | 3 years |
| Phase 7 | Deployment security checklist, monitoring activation record | 3 years |
| Phase 8 | Continuous monitoring reports, incident response test records | 3 years |

## ISO 27001 — Information Security Management

**Full Title**: ISO/IEC 27001:2022, Information Security Management Systems
**Applies to**: Organizations seeking ISMS certification; widely required in procurement due diligence

### Phase Mapping

| Phase | ISO 27001 Control | Governance Activities |
|-------|------------------|----------------------|
| Phase 3 | Annex A.5 (Supplier relationships) | Technical Assessment: verify vendor ISO 27001 certification or equivalent; supplier security assessment |
| Phase 6 | Annex A.8 (Technological controls) | SDLC: secure coding practices, security testing, change management controls |
| Phase 8 | Annex A.5.35 (Independent review) | Periodic independent review of information security; audit trail maintenance |

### BPMN Annotation Pattern

```xml
<bpmn:textAnnotation id="Annotation_ISO27001">
  <bpmn:text>ISO 27001:2022 Annex A.5 (Supplier Relationships): Vendor ISMS certification verification required as part of Phase 3 due diligence swarm</bpmn:text>
</bpmn:textAnnotation>
```

### Evidence Requirements by Phase

| Phase | Required Evidence | Retention |
|-------|-----------------|-----------|
| Phase 3 | Vendor ISO 27001 certificate or equivalent assessment | 3 years |
| Phase 6 | SDLC security test results, secure coding review | 3 years |
| Phase 8 | Independent security review records, ISMS audit reports | 3 years |

## SEC 17a-4 — Records Retention

**Full Title**: SEC Rule 17a-4, Records to Be Preserved by Certain Exchange Members, Brokers and Dealers
**Applies to**: SEC-registered broker-dealers and investment advisers

### Phase Mapping

| Phase | SEC 17a-4 Requirement | Governance Activities |
|-------|----------------------|----------------------|
| Phase 5 | Records preservation design | Contracting lane: ensure contractual provisions for WORM-compliant records retention; define retention schedules |
| Phase 8 | Ongoing records preservation | Verify records retained per schedules; immutable audit trails; inspection readiness |

### BPMN Annotation Pattern

```xml
<bpmn:textAnnotation id="Annotation_SEC17a4">
  <bpmn:text>SEC Rule 17a-4: Records preservation — contracts and communications must be retained in WORM-compliant format for minimum 6 years; first 2 years immediately accessible</bpmn:text>
</bpmn:textAnnotation>
```

### Evidence Requirements by Phase

| Phase | Required Evidence | Retention |
|-------|-----------------|-----------|
| Phase 5 | Records retention schedule, WORM storage confirmation | Minimum 6 years |
| Phase 8 | Records preservation audit log, inspection readiness attestation | Minimum 6 years |

## BCBS d577 — Operational Resilience

**Full Title**: Basel Committee on Banking Supervision, Principles for Operational Resilience (BCBS d577)
**Applies to**: Internationally active banks; widely adopted by domestic regulators

### Phase Mapping

| Phase | BCBS d577 Principle | Governance Activities |
|-------|---------------------|----------------------|
| Phase 3 | Principle 4 (Third-party dependencies) | Map critical service dependencies; assess concentration risk; evaluate substitutability during swarm evaluation |
| Phase 8 | Principle 5 + 6 (Incident management + Resilience testing) | Operational resilience testing; incident response capability validation; recovery time objective verification |

### BPMN Annotation Pattern

```xml
<bpmn:textAnnotation id="Annotation_BCBS_d577">
  <bpmn:text>BCBS d577 Principle 4: Third-party dependency mapping — critical service concentration risk and substitutability must be assessed during Phase 3 due diligence</bpmn:text>
</bpmn:textAnnotation>
```

### Evidence Requirements by Phase

| Phase | Required Evidence | Retention |
|-------|-----------------|-----------|
| Phase 3 | Dependency mapping, concentration risk analysis, substitutability assessment | 5 years |
| Phase 8 | Operational resilience test results, recovery time objective validation | 5 years |

## FS AI RMF — Financial Services AI Risk Management Framework

**Full Title**: Financial Stability Board, Framework for Financial Services Firms' Governance of Artificial Intelligence
**Applies to**: Financial services firms globally deploying AI systems for material decisions

### Phase Mapping

| Phase | FS AI RMF Requirement | Governance Activities |
|-------|----------------------|----------------------|
| Phase 2 | Governance framework (Pillar 1) | AI inventory registration; risk appetite statement for AI; governance accountability assignment |
| Phase 3 | Risk management (Pillar 2) | AI Review lane: AI-specific risk assessment; model dependency mapping; third-party AI risk evaluation |
| Phase 4 | Accountability (Pillar 3) | Governance Review: human oversight mechanism design; model explainability requirements; challenge process |

### BPMN Annotation Pattern

```xml
<bpmn:textAnnotation id="Annotation_FSAI_RMF">
  <bpmn:text>FS AI RMF Pillar 2: AI risk management — model dependency mapping and third-party AI component risk evaluation are part of the Phase 3 swarm evaluation</bpmn:text>
</bpmn:textAnnotation>
```

### Evidence Requirements by Phase

| Phase | Required Evidence | Retention |
|-------|-----------------|-----------|
| Phase 2 | AI inventory registration, risk appetite statement | Life of model + 5 years |
| Phase 3 | AI risk assessment, third-party AI dependency map | Life of model + 5 years |
| Phase 4 | Human oversight design document, explainability methodology | Life of model + 5 years |

## Cross-Framework Evidence Matrix

The following matrix shows which evidence artifacts satisfy multiple frameworks simultaneously. Collect once, satisfy many.

| Evidence Artifact | OCC 2023-17 | SR 11-7 | SOX | GDPR/CCPA | EU AI Act | DORA | NIST CSF | ISO 27001 | SEC 17a-4 | BCBS d577 | FS AI RMF |
|------------------|:-----------:|:-------:|:---:|:---------:|:---------:|:----:|:--------:|:---------:|:---------:|:---------:|:---------:|
| Risk Assessment Report | P2 | P2 | — | P2 | P2 | P3 | P3 | — | — | P3 | P2 |
| Vendor Due Diligence Report | P3 | — | — | — | — | P3 | P3 | P3 | — | P3 | P3 |
| Security Assessment Report | P3 | — | P6 | P2 | P6 | P3 | P3 | P3 | — | — | — |
| Signed Contract (with provisions) | P5 | — | — | P5 (DPA) | — | P5 | — | — | P5 | — | — |
| Audit Rights Confirmation | P5 | — | — | P5 | — | P5 | — | — | — | — | — |
| Technical Documentation | — | P3 | P5 | — | P4 | — | — | P6 | — | — | — |
| Validation Report | — | P4 | — | — | P6 | — | — | — | — | — | P4 |
| Performance / SLA Reports | P8 | P8 | P8 | — | P8 | P8 | P8 | P8 | — | P8 | — |
| Annual Risk Re-Assessment | P8 | — | P8 | — | — | — | — | P8 | — | — | — |
| Incident Log | P8 | — | — | P8 | P8 | P8 | P8 | — | P8 | P8 | — |
| Data Destruction Certificate | P8 (8R) | — | — | P8 (8R) | — | — | — | — | — | — | — |
| Exit / Transition Record | P8 (8R) | — | — | P8 (8R) | — | P8 (8R) | — | — | — | — | — |

## Implementing Regulatory Annotations in BPMN

### Text Annotation Placement

Regulatory annotations should be placed **below** the task or gateway they annotate, connected by an association line. Placement follows the visual layout standards in `bpmn-modeling-standards.md`.

### Phase-Level Regulatory Coverage Checklist

| Phase | Mandatory Frameworks | Conditional Frameworks |
|-------|---------------------|----------------------|
| Phase 2 | OCC 2023-17, FS AI RMF | SR 11-7 (if AI), GDPR/CCPA (if PII), EU AI Act (if AI), NIST CSF 2.0 |
| Phase 3 | OCC 2023-17, NIST CSF 2.0, BCBS d577 | SR 11-7 (if AI), DORA (if ICT), EU AI Act (if AI), ISO 27001, FS AI RMF |
| Phase 4 | SR 11-7 (if AI), EU AI Act (if AI) | FS AI RMF (if AI) |
| Phase 5 | OCC 2023-17, DORA (if ICT) | SOX (if financial reporting), GDPR/CCPA (if PII), SEC 17a-4 (if broker-dealer) |
| Phase 6 | — | SOX (if financial reporting), EU AI Act (if AI), ISO 27001, NIST CSF 2.0 |
| Phase 7 | NIST CSF 2.0 | — |
| Phase 8 | OCC 2023-17, NIST CSF 2.0 | DORA (if ICT), SR 11-7 (if AI), GDPR/CCPA (if PII), EU AI Act (if AI), SOX (if financial reporting), ISO 27001, SEC 17a-4 (if broker-dealer), BCBS d577, FS AI RMF |

### Multi-Framework Task Documentation Template

When a task satisfies multiple regulatory requirements, document all applicable frameworks in the text annotation:

```xml
<bpmn:textAnnotation id="Annotation_Phase3_MultiFramework">
  <bpmn:text>Phase 3 Due Diligence Swarm:
OCC 2023-17 §III.B — Vendor due diligence
DORA Art. 6 — ICT risk assessment
NIST CSF 2.0 (Identify) — Asset and dependency mapping
BCBS d577 Principle 4 — Third-party concentration risk
ISO 27001 Annex A.5 — Supplier security verification</bpmn:text>
</bpmn:textAnnotation>
```

---

**Version**: 2.0.0
**Created**: 2026-03-01
**Updated**: 2026-03-03
**Platform**: SLA Governance Platform
**Changes in v2.0**: Complete rewrite for 8-phase schema. Removed Phase 0 and old P0-P6 phase references. Expanded from 6 to 11 regulatory frameworks: added NIST CSF 2.0, ISO 27001, SEC 17a-4, BCBS d577, FS AI RMF. Remapped all phase references to Phases 1-8. Updated evidence matrix to 11 frameworks and 8-phase structure. Removed references to retired DMN IDs (DMN_SLAThreshold, DMN_DataClassification, DMN_SecurityClearance). Aligned DMN references to 8 canonical table IDs. Added Phase 8 (8R) retirement evidence rows.
