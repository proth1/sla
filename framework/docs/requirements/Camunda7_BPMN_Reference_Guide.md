# Enterprise Software Intake to Retirement — Camunda 7 BPMN Model Reference Guide

## Camunda 7 Platform Compatibility

**File:** `Enterprise_Intake_to_Retirement_Camunda7.bpmn`  
**Standard:** BPMN 2.0 with Camunda 7 Extensions (`xmlns:camunda="http://camunda.org/schema/1.0/bpmn"`)  
**Camunda Modeler Version Target:** 5.25.0+  
**Process Engine:** Camunda 7 Platform (Open Source / Enterprise)  
**Primary Process:** `Process_Governance` — `isExecutable="true"`, `camunda:historyTimeToLive="180"`  

---

## Camunda 7 Extensions Applied

This model includes **200 Camunda namespace attributes** across all elements. Here's what was added for Camunda 7 compatibility:

### Process-Level Extensions
| Extension | Where Applied | Purpose |
|---|---|---|
| `camunda:historyTimeToLive="180"` | All 6 processes | Required by Camunda 7 — history cleanup after 180 days |
| `camunda:versionTag="1.0.0"` | Main process | Process versioning for deployment management |
| `isExecutable="true"` | `Process_Governance` | Marks as deployable to Camunda engine |

### Task-Level Extensions
| Extension | Task Type | Purpose |
|---|---|---|
| `camunda:candidateGroups` | All userTasks | Role-based task assignment in Camunda Tasklist (e.g., `role_governance_analyst`) |
| `camunda:formKey` | All userTasks | Embedded form references for Camunda Tasklist (e.g., `embedded:app:forms/risk-review.html`) |
| `camunda:delegateExpression` | All serviceTasks, sendTasks | Java delegate binding (e.g., `${aiRiskScoringDelegate}`) |
| `camunda:decisionRef` | All businessRuleTasks | DMN table binding by deployment name (e.g., `DMN_DT_001_RiskTier`) |
| `camunda:mapDecisionResult` | All businessRuleTasks | Set to `singleResult` for DMN result mapping |
| `camunda:resultVariable` | All businessRuleTasks | Process variable to store DMN output (e.g., `riskTierResult`) |

### Timer Extensions
| Extension | Where Applied | Purpose |
|---|---|---|
| `xsi:type="bpmn:tFormalExpression"` | All timer durations and cycles | Required by Camunda 7 for timer parsing |
| `camunda:executionListener` | All SLA boundary timers | Fires delegate on timer trigger (e.g., `${slaBreachDelegate}`) |

### Gateway Extensions
| Extension | Where Applied | Purpose |
|---|---|---|
| `default` attribute | All XOR gateways | Camunda 7 requires default flow on exclusive gateways |
| `xsi:type="bpmn:tFormalExpression"` | All conditional flows | Condition expressions use Camunda JUEL (e.g., `#{confirmedRiskTier == "Low"}`) |

### Custom Metadata
| Extension | Where Applied | Purpose |
|---|---|---|
| `camunda:properties` | All sub-processes and tasks | Custom properties: `phase`, `sla_standard_hours`, `sla_standard_days`, `activity_id`, `actor`, `knowledge_base`, `platform`, `dmn_table`, `hit_policy`, `blind_spot` |

---

## Model Statistics

| Element | Count |
|---|---|
| Processes (Pools) | 6 |
| Sub-Processes | 24 |
| Tasks (user + service + send + business rule + manual) | 123 |
| Gateways (XOR + AND + OR) | 13 |
| Timer Boundary Events (SLA monitors) | 29 |
| Sequence Flows | 197 |
| Top-Level Message Definitions | 6 |
| Top-Level Signal Definitions | 3 |
| Data Store References | 10 |
| Camunda Namespace Attributes | 200 |
| Cross-Cutting Event Sub-Processes | 6 |
| DMN Decision Table Bindings | 9 |

---

## Deployment Instructions for Camunda 7

### Step 1: Open in Camunda Modeler
Open the `.bpmn` file in **Camunda Modeler 5.x**. All sub-processes expand with full task hierarchies, timer events, and Camunda properties panels populate correctly.

### Step 2: Create DMN Tables
Deploy the following DMN decision tables (referenced via `camunda:decisionRef`):

| Decision Ref ID | DMN Table | Hit Policy |
|---|---|---|
| `DMN_DT_001_RiskTier` | Risk Tier Classification | Priority (P) |
| `DMN_DT_002_Pathway` | Governance Pathway Determination | Unique (U) |
| `DMN_DT_003_GateDecision` | Governance Gate Decision | Priority (P) |
| `DMN_DT_004_TechApproval` | Technology Approval Decision | Unique (U) |
| `DMN_DT_005_SecurityControls` | Security Controls Mapping | Collect (C+) |
| `DMN_DT_006_VendorRisk` | Vendor Risk Classification | Priority (P) |
| `DMN_DT_007_RegulatoryMap` | Regulatory Applicability Mapping | Collect (C+) |
| `DMN_DT_008_AgentLevel` | AI Agent Automation Level | Unique (U) |
| `DMN_DT_009_DeployStrategy` | Deployment Strategy Selection | Unique (U) |

### Step 3: Implement Java Delegates
The following delegate expressions need Java/Spring implementations:

**AI Agent Delegates:**
- `${aiIntakeAgentDelegate}` — NLP-based intake classification
- `${aiDuplicateDetectionDelegate}` — Semantic similarity detection
- `${aiRiskScoringDelegate}` — 6-dimension risk scoring
- `${aiComplianceFlagDelegate}` — Regulatory trigger flagging
- `${aiArchitectureAgentDelegate}` — Architecture compatibility scoring
- `${aiSecurityAgentDelegate}` — Automated threat model generation

**System Delegates:**
- `${intakeValidationDelegate}` — Schema validation
- `${initiativeIdGeneratorDelegate}` — ID generator (INI-YYYY-NNNN)
- `${grcRepositoryDelegate}` — GRC platform integration
- `${pathwayAssignmentDelegate}` — Pathway variable assignment
- `${scopeMatrixGeneratorDelegate}` — Scope matrix generation
- `${onboardingChecklistDelegate}` — Checklist auto-generation
- `${iacProvisioningDelegate}` — Terraform/Pulumi execution
- `${k8sProvisioningDelegate}` — Kubernetes namespace provisioning
- `${securityMonitoringDelegate}` — SIEM agent deployment
- `${environmentHealthCheckDelegate}` — Automated smoke tests
- `${integrationTestDelegate}` — Integration connectivity tests
- `${regulatoryUpdateDelegate}` — KB-003 update automation
- `${metricsCollectionDelegate}` — Process metrics aggregation
- `${statusGatherDelegate}` — Cross-instance status collection
- `${statusReportDelegate}` — Report generation

**Notification Delegates:**
- `${notificationEngineDelegate}` — Email/Slack/Teams via TP-012
- `${slaWarningDelegate}` — 50% SLA warning handler
- `${slaAlertDelegate}` — 75% SLA alert handler
- `${slaCriticalDelegate}` — 90% SLA critical handler
- `${slaBreachDelegate}` — 100% SLA breach handler + RCA trigger

### Step 4: Configure Candidate Groups
Create the following groups in Camunda Identity Service (or connect to LDAP/AD):

`role_requestor`, `role_governance_analyst`, `role_sr_governance_lead`, `role_governance_board`, `role_portfolio_manager`, `role_finance_analyst`, `role_enterprise_architect`, `role_integration_architect`, `role_cloud_engineer`, `role_finops_analyst`, `role_security_architect`, `role_security_analyst`, `role_security_engineer`, `role_data_privacy_officer`, `role_ai_ethics_officer`, `role_tprm_analyst`, `role_compliance_analyst`, `role_legal`, `role_procurement`, `role_procurement_manager`, `role_vendor_contact`, `role_devops_engineer`, `role_sre`, `role_iam_admin`, `role_network_engineer`, `role_data_engineer`, `role_data_steward`, `role_integration_engineer`, `role_ai_platform_team`, `role_ai_agent`, `role_resource_manager`, `role_project_manager`, `role_tech_lead`, `role_all_stakeholders`

### Step 5: Deploy
```bash
# Deploy via Camunda REST API
curl -X POST http://localhost:8080/engine-rest/deployment/create \
  -F "deployment-name=IntakeToRetirement_v1.0.0" \
  -F "enable-duplicate-filtering=true" \
  -F "deploy-changed-only=true" \
  -F "data=@Enterprise_Intake_to_Retirement_Camunda7.bpmn"
```

### Step 6: Start Process Instance
```bash
# Start via message correlation (Camunda 7 pattern)
curl -X POST http://localhost:8080/engine-rest/message \
  -H "Content-Type: application/json" \
  -d '{
    "messageName": "Message_IntakeRequest",
    "processVariables": {
      "initiativeName": {"value": "New CRM Platform", "type": "String"},
      "businessUnit": {"value": "Sales", "type": "String"},
      "estimatedBudget": {"value": 250000, "type": "Long"},
      "requestorEmail": {"value": "john.doe@company.com", "type": "String"}
    }
  }'
```

---

## Process Variable Reference

Key process variables used across the model:

| Variable | Type | Set By | Used By |
|---|---|---|---|
| `validationStatus` | String | SP-1.1 | GW-1.1 conditions |
| `riskTierResult` | Object | DMN-DT-001 | GW-1.2, all downstream |
| `riskTierResult.confidence` | Integer | DMN-DT-001 | GW_Confidence gateway |
| `confirmedRiskTier` | String | SP-1.2 | GW-1.2 Express routing |
| `pathwayResult` | Object | DMN-DT-002 | Phase 2 scope |
| `governancePathway` | String | SP-1.2 | SLA multiplier |
| `gateDecisionResult` | Object | DMN-DT-003 | GW-1.3 routing |
| `vendorInvolved` | Boolean | SP-1.2/SP-2.5 | GW-2.2, GW-3.2 |
| `techApprovalResult` | Object | DMN-DT-004 | SP-2.1 flow |
| `securityControlsResult` | Object | DMN-DT-005 | SP-3.1 provisioning |
| `vendorTierResult` | Object | DMN-DT-006 | SP-2.3 scope |
| `regulatoryMapResult` | Object | DMN-DT-007 | SP-2.4 mapping |
| `agentLevelResult` | Object | DMN-DT-008 | SP-3.2 config |
| `phase2GateResult` | Object | DMN-DT-003 | GW-2.4 routing |
| `phase3GateResult` | Object | DMN-DT-003 | GW-3.4 routing |
| `slaPercentage` | Integer | Timer events | SLA escalation routing |

---

## Blind Spots Addressed (8 Items)

Same as previous model — all blind spot tasks are tagged with `camunda:property name="blind_spot" value="true"` for easy identification in Camunda Cockpit:

1. **Stakeholder Communication Event Sub-Process** — weekly automated reporting
2. **Vendor Exit Strategy Validation** (T-2.3.3.3)
3. **Cross-Border Data Transfer Assessment** (T-2.4.3.3)
4. **DR/Backup Configuration Validation** (T-3.1.3.3)
5. **Privileged Access Review & JIT** (T-3.3.3.2)
6. **Data Lineage & Catalog Registration** (T-3.4.3.2)
7. **Risk Register Handoff** (T-3.5.3.3)
8. **AI Confidence Threshold Gateway** (GW_Confidence in SP-1.2)
