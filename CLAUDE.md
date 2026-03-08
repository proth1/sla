# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

SLA (Software Lifecycle Automation) is an **Enterprise Software Governance** framework for financial services. It produces BPMN 2.0 process models and DMN 1.3 decision tables — not application source code. There is no API, frontend, or database.

**Domains**: TPRM (vendor lifecycle), AI Governance (model risk), PDLC (build vs buy), SLA Management (tracking & enforcement).

## Repository Layout

### Strategic Framework (IP)
- `framework/processes/master/` — Level 0 master orchestrator BPMN
- `framework/processes/phase-{1..8}-*/` — BPMN models by governance phase
- `framework/processes/cross-cutting/` — 5 cross-cutting event sub-processes
- `framework/decisions/dmn/` — 8 DMN 1.3 decision tables (DMN-1 through DMN-8)
- `framework/docs/` — PRD, requirements, knowledge base, archived strategic presentation

### Customer Implementations
- `customers/fs-onboarding/` — Financial services vendor onboarding (5-phase)
  - `processes/` — Active BPMN models, DMN tables, Camunda forms
  - `docs/` — Governance topic mapping, audit findings, vendor tasks
  - `scripts/` — Customer-specific transformation scripts

### Shared Infrastructure
- `docs/presentations/index.html` — Live onboarding presentation (Cloudflare Pages deploy target)
- `scripts/validators/` — JavaScript BPMN validators
- `infrastructure/cloudflare-workers/sla-presentation-auth/` — Cloudflare Worker for OTP-protected presentation

## Commands

### Validate BPMN files
```bash
# All files
bash scripts/validators/validate-bpmn.sh

# Single file (customer model)
bash scripts/validators/validate-bpmn.sh customers/fs-onboarding/processes/onboarding-to-be-ideal-state-v5.bpmn

# Framework model
bash scripts/validators/validate-bpmn.sh framework/processes/master/sla-governance-master.bpmn

# Individual validators (require npm install in scripts/validators/ first)
node scripts/validators/bpmn-validator.js <file.bpmn>
node scripts/validators/visual-overlap-checker.js <file.bpmn>
node scripts/validators/element-checker.js <file.bpmn>
```

### Deploy presentation auth worker
```bash
cd infrastructure/cloudflare-workers/sla-presentation-auth
npx wrangler deploy
```

## Workflow

1. Create a Jira issue (SLM-XXX) at https://agentic-sdlc.atlassian.net
2. Branch from main: `feature/SLM-{id}-description`
3. Commit format: `SLM-XXX: Description`
4. PR via `gh pr create` — triggers automatic `pr-orchestrator` review (PostToolUse hook)
5. After merge — PostToolUse hook triggers CHANGELOG, Jira transition, and cleanup

**Never commit directly to main.** A PreToolUse hook blocks Write/Edit on main.

## BPMN Modeling Constraints

- **Target engine**: Camunda 8 / Zeebe (use `zeebe:` namespace, `zeebe:assignmentDefinition`, `zeebe:formDefinition`)
- **Legacy engine**: Camunda Platform 7 models exist in v5 and earlier (use `camunda:` namespace)
- **Process ID**: `ESG-E2E-Master-v4.0` (Enterprise Software Governance)
- **2 pools**: Enterprise Governance (8 lanes) + Vendor/Third Party (1 lane)
- **9+1 lanes**: Business, Governance, Contracting, Technical Assessment, AI Review, Compliance, Oversight, Automation + Vendor Response
- **8 phases**: Intake → Planning → Due Diligence → Governance Review → Contracting → SDLC → Deployment → Operations
- **4 pathways**: Fast-Track, Build, Buy, Hybrid
- **3 end events**: End_Retired, End_Terminated, End_Rejected
- **DMN-first**: Every XOR gateway with business logic must reference a DMN table, not embed conditions
- **8 DMN tables**: RiskTierClassification, PathwayRouting, GovernanceReviewRouting, AutomationTierAssignment, AgentConfidenceEscalation, ChangeRiskScoring, VulnerabilityRemediationRouting, MonitoringCadenceAssignment
- **5 cross-cutting sub-processes**: SLA Monitoring, Vulnerability Remediation, Incident Response, Regulatory Change, Continuous Improvement
- **Regulatory annotations**: OCC 2023-17, SR 11-7, SOX, GDPR/CCPA, EU AI Act, DORA, NIST CSF 2.0, ISO 27001
- **SLA timers**: ISO 8601 boundary timer events on review/approval tasks
- **Phase transitions**: Must pass through completion gateway → quality gate → approval task → phase transition event

## CI/CD

GitHub Actions are **prohibited**. Use Claude Code subagents instead:
- `bpmn-validator` — validate BPMN/DMN files
- `bpmn-tester` — BDD test generation
- `cloudflare-publisher` — deploy presentation
- `pipeline-orchestrator` — full pipeline

## Context Loading

Use `/context:bpmn` for BPMN modeling standards, `/context:governance` for domain rules, `/context:full` for everything.

## Hooks Architecture

Hooks in `.claude/settings.json` enforce workflow automatically:
- **SessionStart**: Loads memory-bank context
- **PreToolUse (Write|Edit)**: Blocks edits on main branch
- **PostToolUse (Bash)**: Detects `gh pr create` / `gh pr merge` and triggers PR review or post-merge updates
- **PostToolUse (Write|Edit)**: Checks if decision log needs updating
- **SessionEnd**: Persists session state

## Versioning

CalVer: `YYYY.MM.release`. CHANGELOG at `.claude/memory-bank/CHANGELOG.md`.
