# Enterprise Software Governance Framework

Strategic IP: the 8-phase ESG methodology for financial services software lifecycle management.

## Contents

- `processes/` — BPMN 2.0 process models organized by phase (master, phase-1 through phase-8, cross-cutting)
- `decisions/` — 8 DMN 1.3 decision tables (risk tier, pathway routing, governance review, etc.)
- `docs/` — PRD, requirements, knowledge base, archived strategic presentation

## 8-Phase Lifecycle

1. Initiation & Intake
2. Planning & Risk Scoping
3. Due Diligence & Swarm Evaluation
4. Governance Review & Approval
5. Contracting & Controls
6. SDLC Development & Testing
7. Deployment & Go-Live
8. Operations & Retirement

## Architecture

- **Target Engine**: Camunda Platform 7
- **2 Pools**: Enterprise Governance (8 lanes) + Vendor/Third Party
- **4 Pathways**: Fast-Track, Build, Buy, Hybrid
- **3 End Events**: End_Retired, End_Terminated, End_Rejected

This framework is the reference architecture. Customer implementations adapt subsets of these phases for specific engagement scopes.
