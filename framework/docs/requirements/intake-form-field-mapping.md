# Intake Form Field-to-Role Mapping

> **Purpose**: Map every field across all four intake/questionnaire forms to the governance roles that produce and consume the data, enabling optimization of questions asked at the right time to the right people.

---

## Overview

Four intake/questionnaire forms are used across the software onboarding lifecycle:

| # | Form | Fields | Phase | System of Record |
|---|------|--------|-------|------------------|
| 1 | AI Vendor Questionnaire | 30 | SP1 (Intake) / SP3 (DD) | TBD (vendor-facing) |
| 2 | AI Risk Questionnaire (RAE) | 46 | SP3 (Evaluation & DD) | OneTrust |
| 3 | Cybersecurity Intake (SECARC) | 8 | SP3 (Evaluation & DD) | TBD |
| 4 | Enterprise Architecture Intake | 16 | SP2 (Planning) / SP3 (DD) | Aha!/ServiceNow |

### Role Legend

| Abbrev | Role | Scope | Three Lines |
|--------|------|-------|-------------|
| BUS | Business / Product | Business owner, requester, product management | 1st |
| GOV | Governance / Program Office | Risk & governance oversight, triage | 2nd |
| FIN | Finance | TCO, ROI, budget authorization | 1st |
| PROC | Procurement / Sourcing | Vendor selection, landscape assessment | 1st |
| LEG | Legal / Contracting | Commercial counsel, contract negotiation | 1st/2nd |
| EA | Enterprise Architecture | Architecture review, integration, tech standards | 2nd |
| CYBER | Cybersecurity | Security assessment, pen testing, SECARC | 2nd |
| AI | AI Governance / Model Risk | AI risk classification, model validation, bias | 2nd |
| COMP | Compliance | Regulatory compliance (SOX, DORA, OCC) | 2nd |
| PRIV | Privacy | Data protection, GDPR/CCPA, DPIA | 2nd |
| AUDIT | Oversight / Audit | Independent assurance, 3rd line | 3rd |
| OPS | Automation / Ops | Deployment, configuration, monitoring | 1st |
| VENDOR | Vendor (External) | External vendor providing responses | N/A |

---

## Form 1: AI Vendor Questionnaire

**Source**: `docs/forms/vendor-intake-form.html` (internal), `docs/forms/vendor-questionnaire.html` (vendor-facing)
**Completed by**: Business requester (internal version) or Vendor representative (vendor-facing version)
**System**: TBD (vendor-facing portal)

### Section 0: Requestor Identification

| # | Field/Question | Req | Producer | Consumers | Phase | System |
|---|----------------|-----|----------|-----------|-------|--------|
| 1.1 | Persona selection (Business / IT / Procurement / Vendor) | * | BUS, VENDOR | GOV | SP1 | TBD |
| 1.2 | Company / Vendor Name | * | BUS, VENDOR | GOV, PROC, LEG, COMP | SP1 | TBD |

### Section 1: Request Basics

| # | Field/Question | Req | Producer | Consumers | Phase | System |
|---|----------------|-----|----------|-----------|-------|--------|
| 1.3 | What business problem does this software solve? | * | BUS | GOV, EA, PROC, FIN | SP1 | TBD |
| 1.4 | Urgency (Critical / High / Standard / Exploratory) | * | BUS | GOV, PROC | SP1 | TBD |
| 1.5 | Is this Buy, Build, or unsure? | * | BUS | GOV, EA, PROC | SP1 | TBD |
| 1.6 | Estimated annual budget | | BUS | FIN, GOV, PROC, LEG | SP1 | TBD |
| 1.7 | Does this software involve AI, ML, or LLMs? | * | BUS, VENDOR | AI, GOV, CYBER, COMP | SP1 | TBD |
| 1.8 | What data will this software process? (PII, PHI, Financial/SOX, Public, IP, Other regulated) | * | BUS, VENDOR | PRIV, COMP, CYBER, AI, LEG | SP1 | TBD |

### Section 2: Governance & Oversight

| # | Field/Question | Req | Producer | Consumers | Phase | System |
|---|----------------|-----|----------|-----------|-------|--------|
| 1.9 | Does the platform manage its own models or use third-party model APIs? | * | VENDOR | AI, CYBER, EA | SP3 | TBD |
| 1.10 | Which models are used? (follow-up if own/both) | * | VENDOR | AI, CYBER, EA | SP3 | TBD |
| 1.11 | Is there clear documentation of AI governance policies? | * | VENDOR | AI, COMP, GOV | SP3 | TBD |
| 1.12 | Is there a designated owner or team for AI risk management? | * | VENDOR | AI, GOV, AUDIT | SP3 | TBD |
| 1.13 | Are model versioning, audit trails, and change logs supported? | * | VENDOR | AI, AUDIT, COMP | SP3 | TBD |
| 1.14 | Does the platform enforce role-based access control (RBAC)? | * | VENDOR | CYBER, EA, COMP | SP3 | TBD |
| 1.15 | Are there mechanisms for ethical review or bias mitigation? | * | VENDOR | AI, COMP, PRIV | SP3 | TBD |
| 1.16 | Which regulations apply to this engagement? (GDPR, CCPA, HIPAA, SOX, EU AI Act, DORA, OCC 2023-17, Other) | * | BUS, VENDOR | COMP, PRIV, LEG, AI, GOV | SP1 | TBD |
| 1.17 | What are the intended use cases? | * | BUS, VENDOR | AI, GOV, COMP, EA, CYBER | SP1 | TBD |
| 1.18 | How critical is this software to business operations? (Critical / Significant / Moderate / Low) | * | BUS | GOV, COMP, OPS | SP1 | TBD |

### Section 3: Risk, Data & Performance

| # | Field/Question | Req | Producer | Consumers | Phase | System |
|---|----------------|-----|----------|-----------|-------|--------|
| 1.19 | Can the platform track data lineage and provenance? | * | VENDOR | PRIV, COMP, AI, AUDIT | SP3 | TBD |
| 1.20 | Is customer data used to train models? | * | VENDOR | PRIV, AI, LEG, COMP | SP3 | TBD |
| 1.21 | Is there an opt-out mechanism? (follow-up if yes to training) | * | VENDOR | PRIV, LEG, COMP | SP3 | TBD |
| 1.22 | Are AI performance metrics tracked over time? | * | VENDOR | AI, GOV, OPS | SP3 | TBD |
| 1.23 | Does the platform support explainability tools? (SHAP, LIME, model cards) | | VENDOR | AI, COMP, AUDIT | SP3 | TBD |
| 1.24 | Are fairness, bias, and drift metrics available? | * | VENDOR | AI, COMP, PRIV | SP3 | TBD |
| 1.25 | Does the platform support continuous monitoring and alerting? | * | VENDOR | OPS, CYBER, GOV | SP3 | TBD |
| 1.26 | Have potential harms or unintended consequences been identified? | * | BUS, VENDOR | AI, COMP, GOV, PRIV | SP3 | TBD |

### Section 4: Technical & Security

| # | Field/Question | Req | Producer | Consumers | Phase | System |
|---|----------------|-----|----------|-----------|-------|--------|
| 1.27 | Does the platform support full model lifecycle management? | * | VENDOR | AI, EA, OPS | SP3 | TBD |
| 1.28 | Are rollback or fail-safe mechanisms available? | * | VENDOR | CYBER, EA, OPS | SP3 | TBD |
| 1.29 | Is there an incident response protocol? | * | VENDOR | CYBER, GOV, OPS, COMP | SP3 | TBD |
| 1.30 | Notification timeline and key contacts (follow-up) | * | VENDOR | CYBER, GOV, LEG | SP3 | TBD |
| 1.31 | Model Security: Evaluated for adversarial attacks or model inversion? | * | VENDOR | CYBER, AI | SP3 | TBD |
| 1.32 | Model Security: Controls for model drift or poisoning detection? | * | VENDOR | CYBER, AI | SP3 | TBD |
| 1.33 | Model Security: How is prompt injection addressed? | * | VENDOR | CYBER, AI | SP3 | TBD |
| 1.34 | Does the platform support MCP (Model Context Protocol)? | | VENDOR | EA, CYBER, AI | SP3 | TBD |
| 1.35 | How is MCP managed? (follow-up) | | VENDOR | EA, CYBER | SP3 | TBD |
| 1.36 | Does the platform integrate with external identity and policy systems? (SSO, SAML, OIDC, SCIM) | * | VENDOR | EA, CYBER, OPS | SP3 | TBD |
| 1.37 | Can the platform demonstrate audit readiness? (SOC 2, ISO 27001, FedRAMP, PCI DSS) | * | VENDOR | AUDIT, COMP, CYBER | SP3 | TBD |
| 1.38 | List certifications and their expiry dates (follow-up) | | VENDOR | AUDIT, COMP, CYBER | SP3 | TBD |
| 1.39 | Are there tools for human-in-the-loop oversight? | * | VENDOR | AI, GOV, COMP | SP3 | TBD |
| 1.40 | Does the platform support privacy-enhancing technologies? (federated learning, differential privacy) | | VENDOR | PRIV, AI, CYBER | SP3 | TBD |

### Section 5: Other Considerations (paper form additions)

| # | Field/Question | Req | Producer | Consumers | Phase | System |
|---|----------------|-----|----------|-----------|-------|--------|
| 1.41 | Does it support contextual metadata tagging (domain, sensitivity)? | | VENDOR | EA, PRIV, AI | SP3 | TBD |
| 1.42 | Are potential harms, misuse scenarios, or unintended consequences identified? | * | VENDOR | AI, COMP, GOV | SP3 | TBD |
| 1.43 | Is there a way to classify model criticality or impact levels? | | VENDOR | AI, GOV | SP3 | TBD |
| 1.44 | Can the platform simulate edge cases or adversarial scenarios? | | VENDOR | CYBER, AI | SP3 | TBD |
| 1.45 | Can models be retrained or fine-tuned based on feedback or new data? | | VENDOR | AI, EA | SP3 | TBD |
| 1.46 | Are updates to models governed and communicated across stakeholders? | * | VENDOR | AI, GOV, OPS | SP3 | TBD |
| 1.47 | What specific models are being leveraged? | * | VENDOR | AI, CYBER, EA | SP3 | TBD |
| 1.48 | Are transparency and accountability features available for external stakeholders? | | VENDOR | AUDIT, COMP, GOV | SP3 | TBD |

**Form 1 Total: 48 fields** (including follow-ups and paper-form additions)

---

## Form 2: AI Risk Questionnaire (RAE / OneTrust)

**Source**: Screenshots of OneTrust questionnaire (rows 3–46)
**Completed by**: Business requester (initial) + Vendor (technical responses)
**System**: OneTrust (confirmed)

| # | Field/Question | Req | Producer | Consumers | Phase | System |
|---|----------------|-----|----------|-----------|-------|--------|
| 2.1 | Questionnaire Submitter | * | BUS | GOV | SP1 | OneTrust |
| 2.2 | Solution Intended Purpose | * | BUS | GOV, AI, EA, COMP | SP1 | OneTrust |
| 2.3 | If "Other", please describe | | BUS | GOV, AI | SP1 | OneTrust |
| 2.4 | Heightened Risk Factor(s) | * | BUS, GOV | AI, COMP, PRIV | SP2 | OneTrust |
| 2.5 | What are the sources of data? | * | BUS, VENDOR | PRIV, AI, COMP | SP3 | OneTrust |
| 2.6 | Data Sources Description | * | BUS, VENDOR | PRIV, AI, COMP | SP3 | OneTrust |
| 2.7 | What types of input data does this solution use? | * | BUS, VENDOR | PRIV, AI, COMP, CYBER | SP3 | OneTrust |
| 2.8 | If "Other", please describe | | BUS, VENDOR | PRIV, AI | SP3 | OneTrust |
| 2.9 | How is the data acquired? | * | BUS, VENDOR | PRIV, COMP, LEG | SP3 | OneTrust |
| 2.10 | What is the data classification and sensitivity of the input or training data? | * | BUS, VENDOR | PRIV, CYBER, COMP, AI | SP3 | OneTrust |
| 2.11 | Does this solution utilize policies regarding safety, privacy, and cybersecurity? | * | VENDOR | PRIV, CYBER, COMP, AI | SP3 | OneTrust |
| 2.12 | Please describe what exceptions are needed | * | BUS, VENDOR | COMP, PRIV, CYBER | SP3 | OneTrust |
| 2.13 | Indicate whether the output of the AI system can be reviewed or audited for accuracy and fairness | * | VENDOR | AI, AUDIT, COMP | SP3 | OneTrust |
| 2.14 | During evaluation, did you experience any inaccuracies or inconsistencies in the AI system's output? | * | BUS | AI, GOV | SP3 | OneTrust |
| 2.15 | If yes, please describe the inaccuracies or inconsistencies | | BUS | AI, GOV | SP3 | OneTrust |
| 2.16 | Does the tool have a built-in mechanism to verify the accuracy, completeness, and suitability of the output? | * | VENDOR | AI, GOV, COMP | SP3 | OneTrust |
| 2.17 | If yes, please describe | | VENDOR | AI, GOV | SP3 | OneTrust |
| 2.18 | What are the monitoring plans in place to ensure the AI solution provides accurate responses and is not experiencing data or model drift? | * | VENDOR | AI, OPS, GOV | SP3 | OneTrust |
| 2.19 | Please describe the inputs/data the AI solution needs to generate results, harmful or otherwise | * | VENDOR | AI, CYBER, PRIV | SP3 | OneTrust |
| 2.20 | Can users alter the AI solution in a way that produces results that do not align with the intended purpose? | * | VENDOR | AI, CYBER, COMP | SP3 | OneTrust |
| 2.21 | If yes, please describe | | VENDOR | AI, CYBER | SP3 | OneTrust |
| 2.22 | Are there user access or entitlement controls? | * | VENDOR | CYBER, EA, COMP | SP3 | OneTrust |
| 2.23 | If yes, please describe | | VENDOR | CYBER, EA | SP3 | OneTrust |
| 2.24 | Are there other controls that can achieve the same outcomes if this AI use case fails? | * | BUS, VENDOR | AI, GOV, OPS | SP3 | OneTrust |
| 2.25 | If yes, please describe | | BUS, VENDOR | AI, GOV | SP3 | OneTrust |
| 2.26 | What are the testing and monitoring plans to ensure this AI use case performs as expected? | * | VENDOR | AI, CYBER, OPS | SP3 | OneTrust |
| 2.27 | How does the vendor describe the AI solution's ability to adapt to new data or changing conditions? | * | VENDOR | AI, EA, OPS | SP3 | OneTrust |
| 2.28 | Has the vendor provided clear documentation that explains how the AI system/model generates its outputs/results? | * | VENDOR | AI, AUDIT, COMP | SP3 | OneTrust |
| 2.29 | Has the vendor provided clear documentation that explains what steps the AI system guidelines follow to be consistent with applicable laws or regulations? | * | VENDOR | COMP, LEG, AI | SP3 | OneTrust |
| 2.30 | Has the vendor provided documentation on the data source to train the AI model? | * | VENDOR | AI, PRIV, COMP | SP3 | OneTrust |
| 2.31 | Questionnaire - Governance and improve the AI model? | * | VENDOR | AI, GOV | SP3 | OneTrust |
| 2.32 | How does the vendor ensure diversity in the data used to train the AI solution, and what measures are in place to continuously assess and improve this over time? | * | VENDOR | AI, PRIV, COMP | SP3 | OneTrust |
| 2.33 | Please describe how the AI solution addresses ethical considerations or concerns relating to the AI solution, and what considerations are the business exploring or assessing for AI evolution, and what efforts are underway to address these? | * | BUS, VENDOR | AI, COMP, GOV, PRIV | SP3 | OneTrust |
| 2.34 | Does the current contract provide sufficient protection for the company's confidential information to prevent unauthorized use? | * | LEG, VENDOR | LEG, COMP, PRIV | SP4 | OneTrust |
| 2.35 | If yes, please describe | | LEG | COMP, PRIV | SP4 | OneTrust |
| 2.36 | Does the vendor contract contain data protection provisions to safeguard all data in cloud-based AI solutions, including provisions related to data sharing or transfer and information security requirements? | * | LEG, VENDOR | LEG, PRIV, CYBER, COMP | SP4 | OneTrust |
| 2.37 | If yes, please describe | | LEG | PRIV, CYBER | SP4 | OneTrust |
| 2.38 | Please provide any additional details about the AI use case that may not have been covered in the previous questions | | BUS, VENDOR | AI, GOV | SP3 | OneTrust |
| 2.39 | Status of Production (Not Started, In Development, Done) | * | BUS | GOV, OPS | SP3 | OneTrust |

**Form 2 Total: 39 fields** (some rows not individually visible in screenshots; count based on visible rows 3–46 with header/blank rows excluded)

---

## Form 3: Cybersecurity Intake (SECARC)

**Source**: Screenshot (rows 108–115)
**Completed by**: Business requester or IT/Technical lead
**System**: TBD (Jira-integrated ticketing)

| # | Field/Question | Req | Producer | Consumers | Phase | System |
|---|----------------|-----|----------|-----------|-------|--------|
| 3.1 | Type of request | * | BUS, EA | CYBER, GOV | SP2 | TBD |
| 3.2 | IAM/SECARC Team (single select from long list of security teams) | * | CYBER | CYBER | SP3 | TBD |
| 3.3 | Request (please explain your request) | * | BUS, EA | CYBER, GOV | SP3 | TBD |
| 3.4 | Requested due date | * | BUS | CYBER, GOV | SP2 | TBD |
| 3.5 | File Upload | | BUS, EA, VENDOR | CYBER | SP3 | TBD |
| 3.6 | Point of contact | * | BUS | CYBER, GOV | SP2 | TBD |
| 3.7 | Team / Project (what team, project, product, or vendor is this request related to?) | * | BUS | CYBER, EA, GOV, PROC | SP2 | TBD |
| 3.8 | Related Jira Story / Feature | | BUS, EA | CYBER, GOV, OPS | SP2 | TBD |

**Form 3 Total: 8 fields**

---

## Form 4: Enterprise Architecture Intake

**Source**: Screenshot (rows 23–38)
**Completed by**: Business requester
**System**: Aha!/ServiceNow (likely)

| # | Field/Question | Req | Producer | Consumers | Phase | System |
|---|----------------|-----|----------|-----------|-------|--------|
| 4.1 | Request type (portfolio) | * | BUS | EA, GOV | SP1 | Aha! |
| 4.2 | Title of request | * | BUS | EA, GOV, PROC | SP1 | Aha! |
| 4.3 | Provide a description of your request | * | BUS | EA, GOV, PROC, AI | SP1 | Aha! |
| 4.4 | Is this request driving any regulatory / compliance / security work? If yes, provide details, otherwise enter "unknown" or "N/A" | * | BUS | COMP, CYBER, GOV, EA | SP1 | Aha! |
| 4.5 | What is the urgency of your request | * | BUS | EA, GOV | SP1 | Aha! |
| 4.6 | Estimated delivery team effort | * | BUS | EA, FIN, GOV | SP2 | Aha! |
| 4.7 | Email | * | BUS | EA | SP1 | Aha! |
| 4.8 | Executive sponsor email | * | BUS | EA, GOV | SP1 | Aha! |
| 4.9 | Enter Aha! Intake ID | | BUS | EA, GOV | SP1 | Aha! |
| 4.10 | What's the business problem | * | BUS | EA, GOV, PROC, FIN | SP1 | Aha! |
| 4.11 | Request category | * | BUS | EA, GOV | SP1 | Aha! |
| 4.12 | (Request category) Tech Domain | * | BUS | EA | SP1 | Aha! |
| 4.13 | Who is the solution architect you have been working with | * | BUS | EA | SP2 | Aha! |
| 4.14 | Who is the data architect you have been working with | | BUS | EA | SP2 | Aha! |
| 4.15 | Who is the platform architect you have been working with | | BUS | EA | SP2 | Aha! |
| 4.16 | Provide archerID or CMDB link | * | BUS | EA, CYBER, COMP | SP2 | Aha! |

**Form 4 Total: 16 fields**

---

## Cross-Form Redundancy Analysis

### Direct Overlaps

Fields asking the same or substantially similar questions across multiple forms:

| Data Point | Form 1 | Form 2 | Form 3 | Form 4 | Recommendation |
|------------|--------|--------|--------|--------|----------------|
| **Business problem / purpose** | 1.3 | 2.2 | 3.3 | 4.3, 4.10 | Capture once in SP1; propagate to all downstream forms |
| **Vendor/company name** | 1.2 | — | — | — | Single source in SP1 intake |
| **Data types processed** | 1.8 | 2.7, 2.10 | — | — | Form 1 captures high-level; Form 2 digs deeper. Keep Form 2 detail, pre-populate from Form 1 |
| **Data sources / acquisition** | — | 2.5, 2.6, 2.9 | — | — | Unique to RAE; no redundancy |
| **AI involvement indicator** | 1.7 | 2.2 (implied) | — | — | Form 1 explicit toggle routes to RAE; redundant ask |
| **Regulatory applicability** | 1.16 | 2.11, 2.29 | — | 4.4 | Form 1 checkbox list → auto-populate compliance context for Forms 2 and 4 |
| **Urgency** | 1.4 | — | 3.4 | 4.5 | Three forms ask urgency independently; consolidate to SP1, carry forward |
| **Intended use cases** | 1.17 | 2.2 | — | 4.3 | Overlap: purpose + use cases asked 3 times |
| **Criticality / impact** | 1.18 | — | — | — | Only Form 1; should propagate to SECARC and EA |
| **Governance / AI policies** | 1.11, 1.12 | 2.28, 2.29 | — | — | Form 1 asks yes/no; Form 2 asks for documentation. Sequential: Form 1 screens, Form 2 details |
| **Model identification** | 1.10, 1.47 | — | — | — | Asked twice within Form 1 (digital + paper versions); consolidate |
| **Access controls / RBAC** | 1.14 | 2.22, 2.23 | — | — | Form 1 yes/no/partial; Form 2 asks for detail. Pre-populate |
| **Bias / fairness** | 1.15, 1.24 | 2.32, 2.33 | — | — | Covered in both forms from different angles |
| **Monitoring / drift** | 1.22, 1.25 | 2.18, 2.26 | — | — | Form 1 screens capability; Form 2 requests plan detail |
| **Harms / unintended consequences** | 1.26, 1.42 | 2.19, 2.20 | — | — | Both forms cover this; Form 2 more detailed |
| **Contact / submitter** | 1.1 | 2.1 | 3.6 | 4.7, 4.8 | Every form collects submitter info independently |
| **Team / project context** | — | — | 3.7 | 4.2 | Cross-referenced by Jira or Aha! ID |

### Redundancy Count

| Overlap Type | Field Pairs | Impact |
|-------------|-------------|--------|
| Exact duplicate question | 6 | Vendor/requester fatigue; inconsistent answers |
| Same concept, different depth | 8 | Acceptable if sequential (screen → detail) |
| Same concept, different audience | 3 | Acceptable if routed correctly |
| **Total redundant or partially redundant** | **17** | |

---

## Role Consumption Matrix

For each role, which fields from which forms they need, and at which phase.

### BUS — Business / Product

| Phase | Form 1 | Form 2 | Form 3 | Form 4 |
|-------|--------|--------|--------|--------|
| SP1 | **Produces**: 1.1–1.8, 1.16–1.18 | **Produces**: 2.1–2.3 | — | **Produces**: 4.1–4.12 |
| SP2 | — | 2.4 | **Produces**: 3.1, 3.3–3.8 | 4.6, 4.13–4.16 |
| SP3 | 1.26 | 2.14–2.15, 2.24–2.25, 2.33, 2.38 | — | — |

### GOV — Governance / Program Office

| Phase | Form 1 | Form 2 | Form 3 | Form 4 |
|-------|--------|--------|--------|--------|
| SP1 | **Consumes**: 1.1–1.8, 1.16–1.18 | 2.1–2.3 | — | 4.1–4.5 |
| SP2 | — | 2.4 | 3.1, 3.4, 3.6–3.8 | 4.6 |
| SP3 | 1.11–1.12, 1.17–1.18, 1.25–1.26, 1.29, 1.39, 1.46 | 2.14, 2.16, 2.18, 2.24, 2.28, 2.31, 2.33, 2.38, 2.39 | — | — |

### FIN — Finance

| Phase | Form 1 | Form 2 | Form 3 | Form 4 |
|-------|--------|--------|--------|--------|
| SP1 | **Consumes**: 1.3, 1.6 | — | — | 4.10 |
| SP2 | — | — | — | 4.6 |

### PROC — Procurement / Sourcing

| Phase | Form 1 | Form 2 | Form 3 | Form 4 |
|-------|--------|--------|--------|--------|
| SP1 | **Consumes**: 1.2–1.5, 1.6, 1.16 | — | — | 4.2–4.3 |
| SP3 | — | — | 3.7 | — |

### LEG — Legal / Contracting

| Phase | Form 1 | Form 2 | Form 3 | Form 4 |
|-------|--------|--------|--------|--------|
| SP1 | **Consumes**: 1.2, 1.6, 1.8, 1.16 | — | — | — |
| SP3 | 1.20–1.21, 1.30 | 2.9, 2.29 | — | — |
| SP4 | — | **Produces**: 2.34–2.37 | — | — |

### EA — Enterprise Architecture

| Phase | Form 1 | Form 2 | Form 3 | Form 4 |
|-------|--------|--------|--------|--------|
| SP1 | **Consumes**: 1.3, 1.5, 1.7 | — | — | **Primary consumer**: 4.1–4.16 |
| SP2 | — | — | 3.1, 3.7–3.8 | 4.6, 4.12–4.16 |
| SP3 | 1.9–1.10, 1.14, 1.27–1.28, 1.34–1.36, 1.41, 1.45, 1.47 | 2.22–2.23, 2.27 | 3.5 | — |

### CYBER — Cybersecurity

| Phase | Form 1 | Form 2 | Form 3 | Form 4 |
|-------|--------|--------|--------|--------|
| SP1 | **Consumes**: 1.7–1.8 | — | — | 4.4 |
| SP2 | — | — | **Primary consumer**: 3.1–3.8 | 4.16 |
| SP3 | 1.9, 1.14, 1.25, 1.28–1.33, 1.36–1.38, 1.40, 1.44 | 2.7, 2.10–2.12, 2.19–2.23, 2.26, 2.36 | — | — |

### AI — AI Governance / Model Risk

| Phase | Form 1 | Form 2 | Form 3 | Form 4 |
|-------|--------|--------|--------|--------|
| SP1 | **Consumes**: 1.7, 1.17 | 2.2–2.4 | — | 4.3 |
| SP3 | **Primary consumer**: 1.9–1.13, 1.15, 1.17, 1.19–1.24, 1.26–1.27, 1.31–1.34, 1.39–1.43, 1.45–1.48 | **Primary consumer**: 2.5–2.10, 2.13–2.21, 2.24, 2.26–2.33, 2.38 | — | — |

### COMP — Compliance

| Phase | Form 1 | Form 2 | Form 3 | Form 4 |
|-------|--------|--------|--------|--------|
| SP1 | **Consumes**: 1.2, 1.7–1.8, 1.16–1.18 | — | — | 4.4 |
| SP3 | 1.11, 1.13–1.16, 1.19–1.21, 1.24–1.26, 1.29, 1.37–1.39, 1.48 | 2.7, 2.10–2.13, 2.16, 2.20, 2.22, 2.24, 2.28–2.30, 2.32–2.33 | — | — |
| SP4 | — | 2.34–2.37 | — | — |

### PRIV — Privacy

| Phase | Form 1 | Form 2 | Form 3 | Form 4 |
|-------|--------|--------|--------|--------|
| SP1 | **Consumes**: 1.8, 1.16 | — | — | — |
| SP3 | 1.15, 1.19–1.21, 1.24, 1.26, 1.40–1.41 | **Heavy consumer**: 2.4–2.12, 2.19, 2.30, 2.32–2.33 | — | — |
| SP4 | — | 2.34–2.37 | — | — |

### AUDIT — Oversight / Audit

| Phase | Form 1 | Form 2 | Form 3 | Form 4 |
|-------|--------|--------|--------|--------|
| SP3 | **Consumes**: 1.12–1.13, 1.19, 1.23, 1.37–1.38, 1.48 | 2.13, 2.28 | — | — |

### OPS — Automation / Ops

| Phase | Form 1 | Form 2 | Form 3 | Form 4 |
|-------|--------|--------|--------|--------|
| SP3 | **Consumes**: 1.22, 1.25, 1.27–1.28, 1.36, 1.46 | 2.18, 2.24, 2.26–2.27, 2.39 | 3.8 | — |

### VENDOR — Vendor (External)

| Phase | Form 1 | Form 2 | Form 3 | Form 4 |
|-------|--------|--------|--------|--------|
| SP1 | **Produces** (vendor version): 1.2, 1.3, 1.7–1.8 | — | — | — |
| SP3 | **Produces**: 1.9–1.15, 1.19–1.25, 1.27–1.40, 1.41–1.48 | **Produces**: 2.5–2.13, 2.16–2.21, 2.22–2.30, 2.32 | 3.5 | — |
| SP4 | — | 2.34, 2.36 | — | — |

---

## Optimization Opportunities

### 1. Consolidate Common Intake Fields (SP1)

**Problem**: Business problem, urgency, contact info, and regulatory applicability are asked independently in Forms 1, 3, and 4.

**Recommendation**: Create a **unified SP1 intake record** that captures these once:
- Business problem / purpose
- Urgency
- Requestor contact + executive sponsor
- Buy / Build / Hybrid
- AI involvement flag
- Data types (PII, PHI, Financial, IP)
- Applicable regulations (checkbox)
- Criticality level
- Budget estimate

This unified record pre-populates all downstream forms, eliminating ~17 redundant fields.

### 2. Sequential Screening Pattern (Form 1 → Form 2)

**Problem**: Form 1 and Form 2 both ask about AI governance, data usage, bias, monitoring, and model documentation — but at different depths.

**Recommendation**: Use Form 1 as a **screening gate** (yes/no/partial toggles) and Form 2 as the **detailed assessment**. Pre-populate Form 2 with Form 1 answers so the vendor or business user only fills in the delta.

| Form 1 (Screen) | Form 2 (Detail) | Data Flow |
|-----------------|-----------------|-----------|
| 1.11 AI governance docs? (Y/N) | 2.28 Has vendor provided documentation? | Auto-populate if "Yes" |
| 1.14 RBAC? (Y/N) | 2.22–2.23 Access controls? | Pre-fill response |
| 1.20 Customer data for training? | 2.30 Vendor documentation on data source? | Conditional routing |
| 1.22 Performance metrics tracked? | 2.18 Monitoring plans? | Link answers |
| 1.26 Harms identified? | 2.19–2.20 Inputs that generate harmful results? | Expand on Form 1 flag |

### 3. Phase-Aligned Form Timing

**Current state**: All four forms are somewhat independent and may be triggered ad-hoc.

**Recommended timing**:

| Phase | Form | Trigger |
|-------|------|---------|
| SP1 (Request & Triage) | Unified Intake (merged from Forms 1 basics, 3, 4) | Business submits request |
| SP2 (Planning & Routing) | EA Intake (Form 4 detail) | Request passes triage |
| SP3 (Evaluation & DD) | Vendor Questionnaire (Form 1 full) | Vendor engagement begins |
| SP3 (Evaluation & DD) | AI Risk Assessment (Form 2) | AI flag = Yes |
| SP3 (Evaluation & DD) | SECARC (Form 3) | Security review triggered |
| SP4 (Contracting) | Contract provisions (Form 2, Q34-37) | Contract negotiation |

### 4. Auto-Routing by AI Flag

**Current state**: Form 1 field 1.7 ("Does this involve AI?") triggers additional questions within the same form.

**Recommendation**: Use this flag as a **DMN routing decision** (DMN_PathwayRouting) to:
- If Yes → Route Form 2 (RAE/OneTrust) to AI Governance team
- If No → Skip Form 2 entirely
- If Unsure → Route to Technical Assessment for determination before Form 2

### 5. System of Record Consolidation

**Problem**: Data lives in 3+ systems (TBD portal, OneTrust, Aha!, Jira).

**Recommendation**: Establish clear data ownership:

| Data Domain | System of Record | Forms Feeding It |
|-------------|-----------------|------------------|
| Risk & AI assessment | OneTrust | Form 2 |
| Architecture & portfolio | Aha!/ServiceNow | Form 4 |
| Security requests | Jira (SECARC board) | Form 3 |
| Vendor due diligence | TBD (future GRC platform) | Form 1 |
| Unified intake | Camunda / orchestrator | All forms (SP1 record) |

### 6. Missing Data Gaps

| Gap | Description | Recommendation |
|-----|-------------|----------------|
| **No financial assessment fields** | No form captures TCO, ROI, or NPV inputs | Add financial section to SP2 or create Form 5 for FIN role |
| **No contract-specific intake** | Legal/contracting has no dedicated intake form | LEG consumes Form 2 contract questions (Q34-37) but has no form for their own requirements |
| **No ongoing monitoring intake** | SP5 (Operations) has no form for periodic re-assessment | Create lightweight re-certification form for annual/quarterly reviews |
| **Vendor concentration risk** | No form captures portfolio-level vendor concentration data | Add to SP1 intake: "Does this vendor already provide N+ services?" |
| **DPIA trigger** | Privacy team has no dedicated intake form | Form 1 data types (1.8) + Form 2 data classification (2.10) should auto-trigger DPIA workflow |

---

## Field Count Summary

| Form | Total Fields | Produces (Vendor) | Produces (Internal) | Unique Fields | Redundant Fields |
|------|-------------|-------------------|--------------------|--------------|-----------------|
| Form 1: Vendor Questionnaire | 48 | 38 | 10 | 31 | 17 |
| Form 2: AI Risk (RAE) | 39 | 22 | 17 | 32 | 7 |
| Form 3: SECARC | 8 | 1 | 7 | 5 | 3 |
| Form 4: EA Intake | 16 | 0 | 16 | 10 | 6 |
| **Total** | **111** | **61** | **50** | **78** | **33** |

An optimized intake process could reduce the total field count from 111 to ~78 unique fields by eliminating redundant questions and pre-populating from upstream answers.

---

*Created: 2026-03-05 | Source: Form screenshots, `docs/forms/vendor-intake-form.html`, `docs/forms/vendor-questionnaire.html` | Cross-referenced: `docs/governance-topic-mapping.md`*
