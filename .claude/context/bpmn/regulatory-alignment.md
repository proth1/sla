# Regulatory Alignment for SLA Governance Platform

This file maps the 6 regulatory frameworks to process phases, defines BPMN annotation patterns, and specifies evidence requirements. Load this context when creating compliance-relevant process models or reviewing regulatory coverage.

## Framework Overview

| Framework | Regulator / Body | Geographic Scope | Primary Domain |
|-----------|-----------------|-----------------|----------------|
| OCC 2023-17 | OCC (U.S.) | United States | Third-Party Risk Management |
| SR 11-7 | Federal Reserve (U.S.) | United States | Model Risk Management |
| EU AI Act | European Parliament | European Union | Artificial Intelligence Systems |
| DORA | European Parliament | European Union | Digital Operational Resilience |
| SOX | SEC / PCAOB (U.S.) | United States | Financial Reporting Controls |
| GDPR | EU Data Protection Authorities | European Union + EEA | Personal Data Protection |

## OCC 2023-17 — Third-Party Risk Management

**Full Title**: OCC Bulletin 2023-17, Third-Party Relationships: Interagency Guidance on Risk Management
**Applies to**: Financial institutions subject to OCC supervision with third-party vendor relationships

### Phase Mapping

| Phase | OCC 2023-17 Requirement | Governance Activities |
|-------|------------------------|----------------------|
| Phase 1 | Initial Risk Assessment (§III.A) | Risk classification using DMN_RiskClassification; vendor tier assignment using DMN_VendorTier |
| Phase 2 | Due Diligence (§III.B) | Financial stability review, operational capability assessment, security questionnaire, sub-contractor review |
| Phase 3 | Contract Negotiation (§III.C) | Contractual protections: performance standards, audit rights, data ownership, termination/exit rights, business continuity requirements |
| Phase 5 | Ongoing Monitoring (§III.D) | SLA performance monitoring via DMN_SLAThreshold; periodic due diligence renewal; vendor risk re-assessment via DMN_AuditFrequency |
| Phase 6 | Exit Strategy (§III.E) | Data return/destruction, license termination, knowledge transfer, transition assistance requirements |

### BPMN Annotation Patterns

Reference OCC 2023-17 in task documentation elements using this pattern:

```xml
<bpmn:documentation>
  Vendor due diligence review covering financial stability, operational capability,
  and information security posture.
  @OCC2023-17:§III.B — Due Diligence
  Evidence: vendor-due-diligence-report.pdf, security-questionnaire-response.pdf
</bpmn:documentation>
```

For text annotations on gateways:

```xml
<bpmn:textAnnotation id="Annotation_OCC_DueDiligence">
  <bpmn:text>OCC 2023-17 §III.B: Due Diligence gate — all checklist items must be Green before procurement proceeds</bpmn:text>
</bpmn:textAnnotation>
```

### Evidence Requirements by Phase

| Phase | Required Evidence | Retention |
|-------|-----------------|-----------|
| Phase 1 | Initial risk assessment worksheet, vendor tier determination | 7 years |
| Phase 2 | Due diligence checklist, vendor financials summary, security questionnaire, sub-contractor list | 7 years |
| Phase 3 | Signed contract with OCC-required provisions checklist, audit rights confirmation | 7 years (from contract end) |
| Phase 5 | Quarterly performance reports, annual due diligence renewal, SLA breach logs | 7 years |
| Phase 6 | Data destruction certificate, exit plan documentation, transition completion record | 7 years |

## SR 11-7 — Model Risk Management

**Full Title**: Federal Reserve SR 11-7, Guidance on Model Risk Management
**Applies to**: Bank holding companies and state-chartered member banks using models for decision-making

### Phase Mapping

| Phase | SR 11-7 Requirement | Governance Activities |
|-------|---------------------|----------------------|
| Phase 1 | Model Inventory (§II) | DMN_AIRiskLevel determines if SR 11-7 applies; add to model inventory register |
| Phase 2 | Validation Design (§IV) | Independent validation plan design; validator identification (must be independent of model developers) |
| Phase 4 | Independent Validation (§IV.A-C) | Conceptual soundness review, ongoing monitoring setup, outcomes analysis methodology |
| Phase 5 | Ongoing Monitoring (§V) | Performance tracking against benchmarks, periodic model recalibration review, trigger-based re-validation |

### BPMN Annotation Pattern

```xml
<bpmn:documentation>
  Independent model validation by qualified validators separate from model development team.
  @SR11-7:§IV.A — Evaluating Conceptual Soundness
  @SR11-7:§IV.B — Ongoing Monitoring
  Evidence: model-validation-report.pdf, validator-independence-attestation.pdf
</bpmn:documentation>
```

### Trigger Condition

SR 11-7 requirements activate when `DMN_AIRiskLevel` returns `Limited` or `High` for a model-based system. The `Task_P1_AIRiskLevel` business rule task in Phase 1 gates whether SR 11-7 review tasks are added to subsequent phases.

### Evidence Requirements by Phase

| Phase | Required Evidence | Retention |
|-------|-----------------|-----------|
| Phase 1 | Model inventory registration form, SR 11-7 applicability determination | Life of model + 5 years |
| Phase 2 | Validation plan, validator independence attestation | Life of model + 5 years |
| Phase 4 | Validation report (conceptual soundness, process verification, outcomes analysis) | Life of model + 5 years |
| Phase 5 | Quarterly monitoring reports, trigger-based re-validation records | Life of model + 5 years |

## EU AI Act — Artificial Intelligence Systems

**Full Title**: Regulation (EU) 2024/1689 of the European Parliament and of the Council on Artificial Intelligence
**Applies to**: AI systems placed on EU market or affecting EU persons, regardless of where provider is based

### Risk Classification (DMN_AIRiskLevel Output Mapping)

| DMN Output | AI Act Risk Level | Governance Implication |
|-----------|-------------------|----------------------|
| `Minimal` | Minimal Risk | Standard governance pathway; no special AI Act obligations |
| `Limited` | Limited Risk | Transparency obligations; disclosure to users that they are interacting with AI |
| `High` | High Risk | Conformity assessment required; Enhanced pathway mandatory; technical documentation per Annex IV |
| `Unacceptable` | Prohibited | Cannot proceed — governance request blocked at Phase 1 |

### Phase Mapping

| Phase | EU AI Act Requirement | Governance Activities |
|-------|----------------------|----------------------|
| Phase 1 | Risk Classification (Arts. 6-7) | DMN_AIRiskLevel classification; if High → mandate Enhanced pathway |
| Phase 2 | Conformity Assessment Design (Art. 43) | Design conformity assessment plan; identify notified body if required; DPIA coordination |
| Phase 3 | Technical Documentation (Annex IV) | Produce AI system technical documentation; register in EU AI database if applicable |
| Phase 4 | Testing and Validation (Art. 9) | Accuracy, robustness, cybersecurity testing; human oversight mechanism validation |
| Phase 5 | Post-Market Monitoring (Art. 72) | Incident reporting to national supervisory authority; serious incident log; annual reporting |

### BPMN Annotation Pattern

```xml
<bpmn:documentation>
  Conformity assessment for high-risk AI system per EU AI Act requirements.
  @EUAIAct:Art43 — Conformity Assessment
  @EUAIAct:AnnexIV — Technical Documentation Requirements
  Evidence: conformity-assessment-report.pdf, technical-documentation-annex-iv.pdf
</bpmn:documentation>
```

### Evidence Requirements by Phase

| Phase | Required Evidence | Retention |
|-------|-----------------|-----------|
| Phase 1 | AI risk classification determination, prohibited use check | 10 years post-decommission |
| Phase 2 | Conformity assessment plan, notified body engagement record (if required) | 10 years post-decommission |
| Phase 3 | Technical documentation (Annex IV), EU AI database registration | 10 years post-decommission |
| Phase 4 | Testing results (accuracy, robustness, cybersecurity), human oversight validation | 10 years post-decommission |
| Phase 5 | Post-market monitoring logs, serious incident reports, annual monitoring report | 10 years post-decommission |

## DORA — Digital Operational Resilience Act

**Full Title**: Regulation (EU) 2022/2554 on Digital Operational Resilience for the Financial Sector
**Applies to**: Financial entities in EU including banks, investment firms, insurance, payment institutions

### Phase Mapping

| Phase | DORA Requirement | Governance Activities |
|-------|-----------------|----------------------|
| Phase 2 | ICT Risk Assessment (Art. 6) | Identify ICT dependencies, assess concentration risk, evaluate resilience capabilities |
| Phase 2 | Contractual Requirements Design (Art. 30) | Define mandatory contractual provisions: service levels, audit rights, data location, exit obligations |
| Phase 3 | Contractual Implementation (Art. 30) | Execute contracts with all mandatory DORA provisions; register in ICT third-party register |
| Phase 5 | Incident Reporting (Arts. 17-23) | ICT-related incident classification and reporting; major incident reports to competent authority |
| Phase 5 | Resilience Testing (Arts. 25-26) | Annual TLPT (Threat-Led Penetration Testing) for significant ICT third parties |

### BPMN Annotation Pattern

```xml
<bpmn:documentation>
  ICT third-party contractual requirements review per DORA mandatory provisions.
  @DORA:Art30 — Contractual Arrangements with ICT Third-Party Service Providers
  Evidence: dora-contractual-checklist.pdf, ict-third-party-register-entry.pdf
</bpmn:documentation>
```

### Key Decision Point

In Phase 5, `DMN_SLAThreshold` must be configured to capture DORA-classified incidents. When an ICT incident meets DORA major incident classification criteria (impacts >= 3 clients, or duration > 4 hours for payment services), the escalation flow triggers a regulatory reporting obligation.

### Evidence Requirements by Phase

| Phase | Required Evidence | Retention |
|-------|-----------------|-----------|
| Phase 2 | ICT risk assessment report, concentration risk analysis | 5 years |
| Phase 3 | Signed contract with DORA provisions checklist, ICT third-party register entry | 5 years (from contract end) |
| Phase 5 | ICT incident log, major incident reports (filed with authority), TLPT results | 5 years |

## SOX — Sarbanes-Oxley Act

**Full Title**: Sarbanes-Oxley Act of 2002, Sections 302 and 404 (Financial Controls)
**Applies to**: U.S. public companies; relevant to financial reporting systems and IT general controls (ITGCs)

### Phase Mapping

| Phase | SOX Requirement | Governance Activities |
|-------|----------------|----------------------|
| Phase 2 | Control Design Documentation | Document IT general controls (access management, change management, operations) covering the new solution |
| Phase 4 | Control Testing | Test ITGC effectiveness; document test results and remediation; external auditor coordination |
| Phase 5 | Control Monitoring | Continuous monitoring of ITGCs; quarterly self-assessment; annual attestation; deficiency remediation |

### BPMN Annotation Pattern

```xml
<bpmn:documentation>
  IT general controls design documentation for financial reporting system.
  @SOX:§404 — Management Assessment of Internal Controls
  @SOX:§302 — Corporate Responsibility for Financial Reports
  Evidence: itgc-design-documentation.pdf, control-matrix.xlsx
</bpmn:documentation>
```

### Scope Determination

SOX obligations apply when `DMN_DataClassification` returns `Restricted` and the solution is linked to financial reporting, or when the solution processes data used in SEC financial filings. This scoping decision must be captured in the Phase 1 requirements document.

### Evidence Requirements by Phase

| Phase | Required Evidence | Retention |
|-------|-----------------|-----------|
| Phase 2 | Control design documentation, control matrix | 7 years |
| Phase 4 | Control test results, deficiency log, remediation evidence | 7 years |
| Phase 5 | Annual control assessment, quarterly self-assessment records, auditor walkthrough records | 7 years |

## GDPR — General Data Protection Regulation

**Full Title**: Regulation (EU) 2016/679 on the Protection of Natural Persons with Regard to the Processing of Personal Data
**Applies to**: Any processing of EU/EEA resident personal data, regardless of processor location

### Phase Mapping

| Phase | GDPR Requirement | Governance Activities |
|-------|-----------------|----------------------|
| Phase 1 | Data Classification (Art. 4) | DMN_DataClassification determines if personal data is involved; identify special categories (Art. 9) |
| Phase 1 | Lawful Basis Assessment (Art. 6) | Identify and document lawful basis for processing (consent, legitimate interest, legal obligation, etc.) |
| Phase 2 | DPIA (Art. 35) | Data Protection Impact Assessment for high-risk processing (large-scale, special categories, systematic monitoring) |
| Phase 3 | DPA Execution (Art. 28) | Data Processing Agreement with vendor as data processor; international transfer safeguards (Art. 46) |
| Phase 5 | Data Subject Rights (Arts. 15-22) | Procedures for access, rectification, erasure, portability requests; breach notification procedures (Arts. 33-34) |
| Phase 6 | Data Deletion / Transfer Verification | Verify secure deletion or transfer of all personal data; document destruction certificates |

### BPMN Annotation Pattern

```xml
<bpmn:documentation>
  Data Protection Impact Assessment for high-risk personal data processing.
  @GDPR:Art35 — Data Protection Impact Assessment
  @GDPR:Art9 — Processing of Special Categories of Personal Data
  Evidence: dpia-report.pdf, dpo-opinion.pdf
</bpmn:documentation>
```

### DPIA Trigger Conditions

A DPIA is mandatory (Art. 35) when `DMN_DataClassification` returns `Restricted` and any of:
- Processing at large scale (> 10,000 data subjects or EU-wide reach)
- Systematic monitoring of publicly accessible areas
- Processing special categories (health, biometric, genetic, political opinions, etc.)
- Automated decision-making with significant effects on individuals

### Evidence Requirements by Phase

| Phase | Required Evidence | Retention |
|-------|-----------------|-----------|
| Phase 1 | Data mapping record, lawful basis documentation, RoPA entry | Duration of processing + 3 years |
| Phase 2 | DPIA report, DPO consultation record (if applicable) | Duration of processing + 3 years |
| Phase 3 | Signed DPA, international transfer mechanism documentation (SCCs, BCRs) | Duration of contract + 3 years |
| Phase 5 | Data subject request log and responses, breach notification records | 5 years |
| Phase 6 | Data deletion/transfer certificates, RoPA closure record | 5 years |

## Cross-Framework Evidence Matrix

The following matrix shows which evidence artifacts satisfy multiple frameworks simultaneously. Collect once, satisfy many.

| Evidence Artifact | OCC 2023-17 | SR 11-7 | EU AI Act | DORA | SOX | GDPR |
|------------------|:-----------:|:-------:|:---------:|:----:|:---:|:----:|
| Risk Assessment Report | P1 | — | P1 | P2 | — | — |
| Vendor Due Diligence Report | P2 | — | — | P2 | — | — |
| Security Assessment Report | P2 | — | P4 | P2 | P4 | P2 |
| Signed Contract (with provisions) | P3 | — | — | P3 | — | P3 (DPA) |
| Audit Rights Confirmation | P3 | — | — | P3 | — | P3 |
| Technical Documentation | — | P4 | P3 | — | P2 | — |
| Validation Report | — | P4 | P4 | — | — | — |
| Performance / SLA Reports | P5 | P5 | P5 | P5 | P5 | — |
| Annual Risk Re-Assessment | P5 | — | — | — | P5 | — |
| Incident Log | P5 | — | P5 | P5 | — | P5 |
| Data Destruction Certificate | P6 | — | — | — | — | P6 |
| Exit / Transition Record | P6 | — | — | P6 | — | P6 |

## Implementing Regulatory Annotations in BPMN

### Text Annotation Placement

Regulatory annotations should be placed **below** the task or gateway they annotate, connected by a vertical association line per the visual layout standards in `bpmn-modeling-standards.md`.

### Multi-Framework Task Documentation Template

When a task satisfies multiple regulatory requirements, document all frameworks:

```xml
<bpmn:userTask id="Task_P2_SecurityAssessment" name="Conduct Security&#10;Assessment">
  <bpmn:documentation>
    Information Security conducts comprehensive security assessment of proposed solution.
    Applies security risk rating and identifies required controls.

    Regulatory references:
    @OCC2023-17:§III.B — Due Diligence: Security review
    @DORA:Art6 — ICT Risk Assessment
    @GDPR:Art32 — Security of Processing
    @EUAIAct:Art9 — Risk Management System (if AI system)

    Inputs: solution architecture, data flow diagram, vendor security questionnaire
    Outputs: security risk rating (Low/Medium/High/Critical), required controls list
    DMN: DMN_SecurityClearance

    Evidence required:
    - security-questionnaire-completed.pdf
    - penetration-test-report.pdf (Enhanced pathway only)
    - security-risk-rating-approval.pdf
  </bpmn:documentation>
</bpmn:userTask>
```

---

**Version**: 1.0.0
**Created**: 2026-03-01
**Platform**: SLA Governance Platform
**Scope**: OCC 2023-17, SR 11-7, EU AI Act, DORA, SOX, GDPR regulatory alignment
