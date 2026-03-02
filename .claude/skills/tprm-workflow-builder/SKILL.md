---
name: tprm-workflow-builder
description: Generate TPRM lifecycle BPMN process models from requirements
tools: Read, Write, Edit, Bash, Grep, Glob
user_invocable: true
---

# TPRM Workflow Builder

## Purpose
Generates BPMN 2.0 process models for Third-Party Risk Management workflows aligned with OCC 2023-17 guidance.

## TPRM Lifecycle Stages
1. **Planning**: Risk appetite, vendor strategy, sourcing plan
2. **Due Diligence**: Financial health, cyber risk, compliance review
3. **Contract Negotiation**: SLA terms, data protection, exit clauses
4. **Onboarding**: Access provisioning, training, initial monitoring
5. **Ongoing Monitoring**: Performance review, risk reassessment, audit
6. **Offboarding**: Data return, access revocation, knowledge transfer

## Usage
When invoked, this skill:
1. Reads relevant requirements from `docs/requirements/Financial Services Third-Party Risk Management*.docx`
2. Identifies the TPRM stage to model
3. Generates BPMN XML with proper swim lanes (Vendor Management, Procurement, Legal, InfoSec)
4. Adds OCC 2023-17 regulatory annotations
5. Includes DMN references (DMN_VendorTier, DMN_RiskClassification)
6. Saves to `processes/phase-{N}/`
7. Runs bpmn-validator

## Regulatory References
- OCC 2023-17: Third-Party Relationships
- FFIEC Outsourcing Technology Services
- DORA Article 28-30: ICT Third-Party Risk
