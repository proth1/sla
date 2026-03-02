# BPMN Governance Standards (MANDATORY)

## Swim Lane Conventions

All governance BPMN models MUST use these 7 standard swim lanes:

| Lane | candidateGroups | When to Use |
|------|----------------|-------------|
| Governance Board | `sla-governance-board` | Policy decisions, final approvals, escalations |
| Business Owner | `business-owner` | Requirements, sponsorship, UAT sign-off |
| IT Architecture | `it-architecture` | Technical design review, integration assessment |
| Procurement | `procurement` | Vendor selection, RFP, contract management |
| Legal & Compliance | `legal-compliance` | Regulatory review, contract terms, compliance gates |
| Information Security | `information-security` | Security assessment, data classification, pen testing |
| Vendor Management | `vendor-management` | Vendor onboarding, performance monitoring, SLA tracking |

## Regulatory Text Annotations

Every BPMN model MUST include text annotations for applicable regulations:
- **OCC 2023-17**: Third-party risk management guidance
- **SR 11-7**: Model risk management (for AI governance processes)
- **SOX**: Financial controls and audit requirements
- **GDPR/CCPA**: Data protection and privacy
- **EU AI Act**: AI system risk classification
- **DORA**: Digital operational resilience (EU financial services)

## DMN References

Business Rule Tasks MUST reference DMN tables using:
```xml
<bpmn:businessRuleTask id="Task_DecidePathway"
  name="Select Governance Pathway"
  camunda:decisionRef="DMN_PathwaySelection"
  camunda:resultVariable="selectedPathway"
  camunda:mapDecisionResult="singleResult" />
```

## SLA Timer Patterns

Use ISO 8601 duration boundary timer events:
```xml
<bpmn:boundaryEvent id="Timer_ReviewSLA" attachedToRef="Task_SecurityReview">
  <bpmn:timerEventDefinition>
    <bpmn:timeDuration>P5D</bpmn:timeDuration>
  </bpmn:timerEventDefinition>
</bpmn:boundaryEvent>
```

## Compliance Boundary Events

Model compliance gates as conditional boundary events that halt process flow when compliance checks fail.

## Phase Boundary Pattern

Each phase transition MUST pass through:
1. Completion gateway (all phase tasks done?)
2. Quality gate (compliance checks pass?)
3. Approval user task (appropriate authority signs off?)
4. Phase transition event (signal next phase)
