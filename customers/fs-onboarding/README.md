# Financial Services — Software Onboarding

Customer engagement implementing a 5-phase vendor onboarding lifecycle adapted from the ESG framework.

## Scope

5 sub-processes covering vendor intake through go-live:

| Phase | Sub-Process | SLA |
|-------|-------------|-----|
| SP1 | Request & Triage | 1-2 days |
| SP2 | Planning & Routing | 2-3 days |
| SP3 | Evaluation & Due Diligence | 5-8 days |
| SP4 | Contracting & Build | 5-7 days |
| SP5 | UAT & Go-Live | 2-3 days |

## Architecture

- **3 Pools**: Software Requester, Product Management, Vendor/Third Party
- **38 Tasks** across pools
- **4 DMN tables**: Risk Tier, Pathway Routing, Governance Routing, Onboarding SLA
- **11 Governance Topics**: Intake, Prioritization, Funding, Sourcing, Cyber, EA, Compliance, AI Governance, Privacy, Commercial Counsel, TPRM

## Key Artifacts

- `processes/onboarding-to-be-ideal-state-v5.bpmn` — Active reference model (hierarchical)
- `processes/dmn/` — 4 customer-specific DMN tables
- `processes/forms/` — 39 Camunda forms
- `docs/governance-topic-mapping.md` — Topic-to-task mapping with RACI

## Presentation

The live presentation is deployed at `docs/presentations/index.html` (root level, Cloudflare Pages).
