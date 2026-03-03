# BPMN Governance Standards (MANDATORY)

## Pool and Lane Conventions

All governance BPMN models MUST use these 2 pools with 9+1 lanes:

### Enterprise Governance Pool

| Lane | candidateGroups | RACI Role | Three Lines of Defense |
|------|----------------|-----------|----------------------|
| Business Lane | `business-lane` | Business Owner (1st Line) | 1st |
| Governance Lane | `governance-lane` | Risk & Governance (2nd Line) | 2nd |
| Contracting Lane | `contracting-lane` | Legal (1st/2nd Line) | 1st/2nd |
| Technical Assessment Lane | `technical-assessment` | Cybersecurity (2nd Line) | 2nd |
| AI Review Lane | `ai-review` | AI Governance (2nd Line) | 2nd |
| Compliance Lane | `compliance-lane` | Compliance (2nd Line) | 2nd |
| Oversight Lane | `oversight-lane` | Internal Audit (3rd Line) | 3rd |
| Automation Lane | `automation-lane` | Service Provider / BPM Engine (1st Line) | 1st |

### Vendor / Third Party Pool

| Lane | candidateGroups | RACI Role | Three Lines of Defense |
|------|----------------|-----------|----------------------|
| Vendor Response Lane | `vendor-response` | External Vendor | N/A |

## 8-Phase Sequential Flow

| Phase | Sub-Process ID | SLA (Standard) | Automation |
|-------|---------------|-----------------|------------|
| 1. Initiation and Intake | SP-Phase1-Intake | 1-2 days | 75% |
| 2. Planning and Risk Scoping | SP-Phase2-Planning | 3-5 days | 60% |
| 3. Due Diligence and Swarm Evaluation | SP-Phase3-DueDiligence | 5-8 days | 70% |
| 4. Governance Review and Approval | SP-Phase4-GovernanceReview | 3-5 days | 40% |
| 5. Contracting and Controls | SP-Phase5-Contracting | 5-7 days | 50% |
| 6. SDLC Development and Testing | SP-Phase6-SDLC | 10-15 days | 55% |
| 7. Deployment and Go-Live | SP-Phase7-Deployment | 2-3 days | 60% |
| 8. Operations and Retirement | SP-Phase8-Operations | Ongoing | 65% |

## 3 Terminal End Events

- **End_Retired** — Graceful wind-down via decommission (Phase 8R)
- **End_Terminated** — Emergency cessation (compliance breach, security incident)
- **End_Rejected** — Governance rejection at Phase 2 (Unacceptable Risk) or Phase 4

## XOR Gateway Decision Points

| Location | Gateway Name | Routing |
|----------|-------------|---------|
| After Phase 2 | Risk Tier Decision | Unacceptable → End_Rejected; High/Limited/Minimal → Phase 3 |
| After Phase 4 | Governance Decision | Approved → Phase 5; Approved w/ Conditions → Phase 5; Rejected → End_Rejected |
| After Phase 7 | Deployment Decision | Approved → Phase 8; Rejected → Loop to Phase 6 |
| Phase 8 | Monitoring Outcome | Continue → Loop; Change → Sub-Process 8C; Retire → Sub-Process 8R |

## Regulatory Text Annotations

Every BPMN model MUST include text annotations for applicable regulations:
- **OCC 2023-17**: Third-party risk management guidance
- **SR 11-7**: Model risk management (for AI governance processes)
- **SOX**: Financial controls and audit requirements
- **GDPR/CCPA**: Data protection and privacy
- **EU AI Act**: AI system risk classification
- **DORA**: Digital operational resilience (EU financial services)
- **NIST CSF 2.0**: Cybersecurity framework
- **ISO 27001**: Information security management
- **SEC 17a-4**: Records retention
- **BCBS d577**: Operational resilience
- **FS AI RMF**: Financial services AI risk management

## 8 DMN Decision Tables

Business Rule Tasks MUST reference one of these 8 DMN tables:

| ID | Name | Hit Policy | Used In |
|----|------|-----------|---------|
| DMN_RiskTierClassification | Risk Tier Classification | UNIQUE | Phase 2 (Activity 2.3) |
| DMN_PathwayRouting | Pathway Routing | UNIQUE | Phase 1 (Activity 1.6) |
| DMN_GovernanceReviewRouting | Governance Review Routing | UNIQUE | Phase 4 (Activity 4.2) |
| DMN_AutomationTierAssignment | Automation Tier Assignment | UNIQUE | Cross-cutting |
| DMN_AgentConfidenceEscalation | Agent Confidence Escalation | FIRST | Cross-cutting |
| DMN_ChangeRiskScoring | Change Risk Scoring | UNIQUE | Phase 8 (Activity 8C.1) |
| DMN_VulnerabilityRemediationRouting | Vulnerability Remediation Routing | UNIQUE | Cross-cutting (SP-Cross-2) |
| DMN_MonitoringCadenceAssignment | Monitoring Cadence Assignment | UNIQUE | Phase 8 (Activity 8.1) |

```xml
<bpmn:businessRuleTask id="Task_RiskTier"
  name="Risk Tier Assignment"
  camunda:decisionRef="DMN_RiskTierClassification"
  camunda:resultVariable="riskTier"
  camunda:mapDecisionResult="singleResult" />
```

## SLA Timer Patterns

Use ISO 8601 duration boundary timer events:
```xml
<bpmn:boundaryEvent id="Timer_PhaseSLA" cancelActivity="false"
    attachedToRef="SP_Phase1_Intake">
  <bpmn:outgoing>Flow_ToEscalation</bpmn:outgoing>
  <bpmn:timerEventDefinition>
    <bpmn:timeDuration>P2D</bpmn:timeDuration>
  </bpmn:timerEventDefinition>
</bpmn:boundaryEvent>
```

## Phase Boundary Pattern

Each phase transition MUST pass through:
1. Completion gateway (all phase tasks done?)
2. Quality gate (compliance checks pass?)
3. Approval user task (appropriate authority signs off?)
4. Phase transition event (signal next phase)

## 5 Cross-Cutting Event Sub-Processes

| ID | Name | Trigger |
|----|------|---------|
| SP-Cross-1 | SLA Monitoring & Breach Management | Timer events on every phase |
| SP-Cross-2 | Vulnerability Remediation Lifecycle | Security finding detected |
| SP-Cross-3 | Incident Response | Security alert from monitoring |
| SP-Cross-4 | Regulatory Change Management | Regulatory horizon scanning |
| SP-Cross-5 | Continuous Improvement & Process Mining | Continuous + quarterly timer |
