# OneTrust Integration — Software Onboarding Lifecycle

## Overview

OneTrust provides API-accessible risk assessment and questionnaire capabilities that can integrate with the Camunda 8 onboarding process at key evaluation and compliance touchpoints. This document captures the OneTrust API surface and maps it to specific process integration points.

---

## Integration Points in the Onboarding Process

### Integration Point 1: SP3 — Evaluation and Due Diligence (Risk Assessment Intake)

**Where**: After the parallel evaluation split gateway, specifically:
- `Task_RiskCompliance` — Risk, Compliance, and Legal
- `Task_SecurityAssessment` — Security Assessment
- `Task_VendorDueDiligence` — Vendor Due Diligence

**How**: Use OneTrust Assessment Automation to manage the risk evaluation questionnaire. Instead of (or in addition to) Camunda forms for these tasks, the assessments are created and completed in OneTrust, then the results are pulled back into the Camunda process via API.

**Pattern**: Camunda service task creates the OneTrust assessment → human completes it in OneTrust → Camunda intermediate catch event or polling service task retrieves results via `GET /api/assessment/v2/assessments/{assessmentId}/export`.

**Data Flow**:
```
Camunda (SP3 parallel split)
  → Service Task: Create OneTrust Assessment (POST /api/assessment/v2/assessments)
  → OneTrust: Assessor completes risk questionnaire
  → Service Task: Poll/Retrieve Assessment Results (GET /api/assessment/v2/assessments/{id}/export)
  → Process variables: riskScore, riskTier, complianceFindings[]
  → Gateway routing continues based on assessment output
```

**Relevant OneTrust APIs**:
- `POST /api/assessment/v2/assessments` — Create assessment from template
- `GET /api/assessment/v2/assessments/{assessmentId}/export` — Retrieve completed assessment with all responses and risk scores

### Integration Point 2: SP3 — Vendor Due Diligence (Third-Party Risk)

**Where**: `Task_VendorDueDiligence` and the vendor pool tasks (`Task_VendorSecurityReview`, `Task_VendorComplianceReview`)

**How**: OneTrust Third-Party Risk Management (TPRM) module manages the vendor questionnaire lifecycle. The vendor receives and completes questionnaires through the OneTrust portal. Results feed back into Camunda for the `Task_EvaluateVendorResponse` decision.

**Data Flow**:
```
Camunda (Task_VendorDueDiligence)
  → Service Task: Create Vendor Assessment in OneTrust
  → OneTrust: Vendor completes security/compliance questionnaires
  → OneTrust: Internal reviewers score responses
  → Service Task: Retrieve vendor risk profile
  → Process variables: vendorRiskTier, securityScore, complianceScore
  → Feeds into Task_EvaluateVendorResponse
```

**Relevant OneTrust APIs**:
- `POST /api/risk/v3/risks` — Create risk entries from assessment findings
- `GET /api/risk/v2/risks/{riskId}` — Retrieve calculated risk with severity, owner, mitigations

---

## OneTrust API Reference

### Authentication

- **Method**: OAuth2 (client_id / client_secret)
- **Base URL**: `https://{tenant}.my.onetrust.com`
- **Tenant-specific**: Each customer has their own hostname

### Core Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/assessment/v2/assessments/{id}/export` | GET | Export full assessment (questions, responses, risk scores) |
| `/api/template/v2/templates/{id}/export` | GET | Export assessment template (question definitions, skip logic, scoring config) |
| `/api/risk/v3/risks` | POST | Create a risk entry |
| `/api/risk/v2/risks/{id}` | GET | Retrieve risk details (severity, owner, mitigations, linked assessments) |

### Assessment Export Payload

Typical data returned from assessment export:
- Assessment ID and metadata
- Template used
- Question text and answer values
- Scoring results
- Risk classification
- Respondent and approver details

### Template Export Payload

Template structure includes:
- Question definitions
- Conditional/skip logic rules
- Scoring configuration

### Limitations

1. Some APIs require specific OneTrust modules to be licensed (Assessment Automation, TPRM, IT Risk Management)
2. Bulk export requires pagination/batching
3. Some risk scoring logic may only exist in the OneTrust platform UI
4. API permissions determine which assessments are accessible

---

## Camunda 8 Integration Architecture

### Option A: Zeebe Service Tasks (Recommended)

Use Zeebe job workers to call OneTrust APIs. This keeps the integration within the BPMN engine.

```
[User Task: Initiate Assessment]
  → [Service Task: Create OneTrust Assessment]
      zeebe:taskDefinition type="onetrust-create-assessment"
  → [Receive Task: Await Assessment Completion]
      (webhook callback or polling worker)
  → [Service Task: Retrieve Assessment Results]
      zeebe:taskDefinition type="onetrust-get-assessment"
  → [Business Rule Task: Route Based on Risk Score]
      zeebe:calledDecision decisionId="DMN_RiskTierClassification"
```

### Option B: External Orchestration

OneTrust webhook notifies an integration layer (e.g., middleware) which completes the Camunda receive task via Zeebe API.

### Credential Management

- OneTrust OAuth2 credentials stored as Camunda secrets (not in BPMN)
- Tenant URL configured as process variable or environment variable
- Token refresh handled by the job worker

---

## Process Variable Mapping

| OneTrust Field | Camunda Variable | Used By |
|---------------|-----------------|---------|
| Assessment risk score | `riskScore` | DMN_RiskTierClassification |
| Assessment risk tier | `vendorRiskTier` | Gateway routing in SP3 |
| Security score | `securityAssessmentScore` | Task_EvaluateVendorResponse |
| Compliance findings | `complianceFindings` | Task_RiskCompliance |
| Assessment status | `assessmentStatus` | Receive task correlation |
| Assessment ID | `onetrustAssessmentId` | Cross-reference for audit |

---

## Regulatory Alignment

OneTrust integration strengthens compliance evidence for:
- **OCC 2023-17**: Automated third-party risk assessment with audit trail
- **NIST CSF 2.0 ID.RA**: Structured risk assessment methodology
- **DORA Article 28**: ICT third-party risk register maintained in OneTrust
- **SOX Section 404**: Assessment evidence automatically captured and linked to process instance

---

## Next Steps

1. Confirm which OneTrust modules are licensed (Assessment Automation, TPRM, or both)
2. Obtain API credentials and tenant URL
3. Design Zeebe job workers for OneTrust integration
4. Determine webhook vs. polling for assessment completion notification
5. Map OneTrust assessment templates to existing Camunda form fields
6. Update v6-c8 BPMN to include OneTrust service tasks at integration points
