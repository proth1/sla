# SLA — Enterprise Software Governance

An 8-phase governance framework for financial services organizations managing software assets across Build, Buy, Hybrid, and Fast-Track pathways. Produces BPMN 2.0 process models and DMN 1.3 decision tables for Camunda Platform 7.

## What This Is

- **BPMN process models** defining the end-to-end governance lifecycle (Intake through Operations & Retirement)
- **DMN decision tables** driving deterministic governance routing (risk classification, pathway selection, automation tiers)
- **Regulatory traceability** to OCC 2023-17, SR 11-7, SOX, GDPR/CCPA, EU AI Act, DORA, and NIST CSF 2.0

## What This Is Not

This is not a SaaS application. There is no API, frontend, or database. It is a governance artifact repository — BPMN/DMN XML plus supporting documentation.

## Repository Structure

```
processes/
  master/              Level 0 master orchestrator BPMN
  phase-{1..8}-*/      BPMN models for 8 governance phases
  cross-cutting/       5 cross-cutting event sub-processes
decisions/
  dmn/                 8 DMN 1.3 decision tables (DMN-1 through DMN-8)
docs/
  prd/                 Product Requirements Document
  presentations/       HTML presentation (OTP-protected at sla.agentic-innovations.com)
  requirements/        Source requirement documents
scripts/
  validators/          JavaScript BPMN/DMN validators
infrastructure/
  cloudflare-workers/  Auth worker for presentation access control
.claude/
  agents/              21 Claude Code subagent definitions
  rules/               Mandatory modeling and workflow rules
```

## Prerequisites

- **Node.js** (v18+) — for BPMN validators
- **Camunda Modeler** — for viewing/editing BPMN and DMN files

## Quick Start

```bash
# Install validator dependencies
cd scripts/validators && npm install && cd ../..

# Validate all BPMN files
bash scripts/validators/validate-bpmn.sh

# Validate a single file
bash scripts/validators/validate-bpmn.sh processes/phase-1-intake/initiation-and-intake.bpmn
```

## Governance Framework

| Phase | Name | SLA (Standard) |
|-------|------|----------------|
| 1 | Initiation and Intake | 1-2 days |
| 2 | Planning and Risk Scoping | 3-5 days |
| 3 | Due Diligence and Swarm Evaluation | 5-8 days |
| 4 | Governance Review and Approval | 3-5 days |
| 5 | Contracting and Controls | 5-7 days |
| 6 | SDLC Development and Testing | 10-15 days |
| 7 | Deployment and Go-Live | 2-3 days |
| 8 | Operations and Retirement | Ongoing |

## AI-Assisted Development

This project uses [Claude Code](https://claude.ai/code) with 21 specialized subagents for modeling, validation, review, and deployment. See [CLAUDE.md](CLAUDE.md) for development workflow and conventions.

## Presentation

The governance framework presentation is available at [sla.agentic-innovations.com](https://sla.agentic-innovations.com) (OTP-protected access).
