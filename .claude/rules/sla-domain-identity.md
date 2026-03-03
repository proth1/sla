# SLA Domain Identity (MANDATORY)

## What This Project IS

SLA is an **Enterprise Software Governance** framework for financial services organizations. It provides a structured 8-phase lifecycle (Intake → Planning → Due Diligence → Governance Review → Contracting → SDLC → Deployment → Operations & Retirement) for managing software assets across Build, Buy, Hybrid, and Fast-Track pathways.

## Core Domains

| Domain | Focus |
|--------|-------|
| **TPRM** | Third-Party Risk Management — vendor assessment, onboarding, monitoring |
| **AI Governance** | AI model lifecycle — risk classification, validation, monitoring |
| **PDLC** | Product Development Lifecycle — build vs buy, implementation |
| **SLA Management** | Service Level Agreements — tracking, enforcement, reporting |

## Technical Identity

- **Artifact Type**: BPMN 2.0 process models + DMN 1.3 decision tables
- **Target Engine**: Camunda Platform 7 (docs-only mode, no runtime yet)
- **Methodology**: Compliance-Driven Development (CDD)
- **PM Tool**: Jira (SLA project at agentic-sdlc.atlassian.net)
- **VCS**: GitHub (proth1/sla)

## What This Project Is NOT

- NOT a SaaS application (no API, no frontend, no database)
- NOT a Camunda 8 project (no Zeebe, no Operate, no Tasklist)
- NOT a code repository (BPMN/DMN XML + governance documentation)
- NOT using GitHub Actions (Claude Code skills only)

## Decision-First Approach

DMN decision tables drive governance routing. Every gateway decision in BPMN should reference a DMN table rather than embedding business logic in gateway conditions.
