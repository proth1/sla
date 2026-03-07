# Product Requirements Document: FS-Onboarding Platform

## Document Control

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Date | 2026-03-06 |
| Status | Draft |
| Owner | Process Optimization Team |
| Jira Epic | SLA-43 through SLA-47 |

---

## 1. Executive Summary

The Financial Services Software Onboarding Platform automates the 5-phase vendor and software onboarding lifecycle on Camunda 8 Cloud. It replaces a manual, sequential process that currently takes **6-9 months** with a proportional, DMN-driven workflow targeting **30-90 days** depending on pathway complexity.

### What's Built

- **BPMN process model** (v8-c8): 5 phases, 3 pathways (Buy/Build/Enable), hierarchical collapsed sub-processes, deployed to Camunda 8 Cloud
- **48 Camunda 8 JSON forms**: Complete task coverage across all 5 sub-processes, vendor pool, PDLC, and governance gates
- **3 DMN decision tables**: Risk tier classification, governance routing, SLA assignment
- **Task Worker UI**: Web application for starting instances and completing tasks with dynamic form rendering
- **Process Owner Dashboard**: Real-time KPIs, instance tracking, task queue with SLA aging
- **BDD test suite**: 10 Cucumber.js features validating structural integrity
- **Discovery documentation**: 14 stakeholder sessions, 24-gap analysis, 30/60/90/120-day roadmap

### What's Planned

- Integration with OneTrust (TPRM, Assessment Automation)
- ServiceNow intake bridge
- Contract lifecycle automation (CLM integration)
- Vendor-facing portal for external task completion
- Production deployment with SSO/OIDC authentication

**Full artifact inventory**: See [build-summary.md](../build-summary.md)

---

## 2. Product Vision

**Proportional governance at the speed of business.**

Every software request receives governance rigor proportional to its risk, investment, and organizational impact. A no-cost vendor affinity tool completes in 30 days. A $2M platform build receives full due diligence. The process adapts automatically through DMN-driven routing -- not manual escalation or one-size-fits-all checklists.

### Design Principles

1. **DMN-first**: Business logic lives in decision tables, not gateway conditions. Process behavior changes by updating DMN rules, not BPMN structure.
2. **Proportional rigor**: 3 pathways (Buy/Build/Enable) with tiered assessment levels. Low-risk requests skip unnecessary gates.
3. **Parallel by default**: All review committees engage simultaneously. No sequential handoffs unless there's a dependency.
4. **Ownership at every stage**: Every request has a named process owner (Concierge) from intake to retirement.
5. **Measure everything**: Cycle time, queue time, throughput, and SLA compliance tracked from day one.

---

## 3. Target Personas

### Requester (Business User)

The person initiating a software request. May be a business analyst, advisor, or technology lead. Needs simple intake, clear status visibility, and predictable timelines.

**Pain points**: "I submit a request and it disappears for 6 months." No centralized tracking. Repeated questions across review stages.

### Process Owner / Concierge

Single point of accountability for end-to-end request lifecycle. Pre-screens submissions for completeness, coordinates reviewers, manages escalations. Modeled on the Architecture team's proven Governance Facilitator role.

**Pain points**: No formal role exists today. Coordination happens ad hoc. No visibility into cross-team workload.

### Governance Reviewer (SME)

Domain expert in security, legal, compliance, architecture, or AI governance. Completes evaluation tasks within their specialty. Needs only the information relevant to their review.

**Pain points**: Receives incomplete submissions. Overlapping questionnaires (especially AI). Sequential engagement creates artificial urgency when their turn finally arrives.

### Vendor (External)

Third-party software or service provider responding to due diligence requests, submitting proposals, completing security questionnaires, and executing contracts.

**Pain points**: No visibility into internal process status. Multiple disconnected questionnaires. Unclear expectations.

### Executive Sponsor

Senior leader (SVP/CTO) with cross-functional authority. Owns process outcomes, resolves organizational conflicts, authorizes the Concierge role.

**Pain points**: No data to justify process investment. Cannot measure improvement. Anecdotal evidence of 6-9 month cycles without hard metrics.

---

## 4. Problem Statement

14 stakeholder sessions with 30+ participants (Feb-Mar 2026) revealed five cross-cutting themes that explain why the current process takes 6-9 months:

1. **Security staffing is the binding constraint**: Every optimization initiative bottlenecks at security review capacity. Faster intake without tiered assessment just moves the queue.

2. **No single process owner**: Requests pass between teams without accountability. The Architecture team's Governance Facilitator role is the only successful model observed.

3. **Proportionality is missing**: The same rigor applies to a no-cost tool as to a $2M build. No mechanism to reduce scope for low-risk requests.

4. **No measurement infrastructure**: Cannot prove improvement without baselines. ServiceNow data exists but is not mined.

5. **Ownership gaps cause failures**: No one owns the end-to-end outcome, the technology asset post-onboarding, or the security baseline definition.

**Full analysis**: See [stakeholder-interviews.md](../discovery/stakeholder-interviews.md)

---

## 5. Current State

The platform has been built across Jira items SLA-43 through SLA-47. The complete artifact inventory is documented in [build-summary.md](../build-summary.md).

### Deployment Status

| Component | Status | Environment |
|-----------|--------|-------------|
| BPMN model (v8-c8) | Deployed | Camunda 8 Cloud (sla-onboarding-dev) |
| 48 JSON forms | Deployed | Camunda 8 Cloud |
| 3 DMN tables | Deployed | Camunda 8 Cloud |
| Task Worker UI | Functional | localhost:3847 (demo) |
| Process Owner Dashboard | Functional | localhost:3847/dashboard.html (demo) |
| BDD test suite | Passing | Local execution |
| Presentation | Deployed | Cloudflare Pages + Descope OTP |

### Key Metrics (Current Capability)

- **Process instances**: 10 seeded demo instances across all 5 phases
- **Form coverage**: 100% of user tasks have linked JSON forms
- **Pathway support**: Buy, Build, Enable routing via OB-DMN-2
- **GAPs addressed**: 10 of 24 implemented or partially implemented in v7-c8

---

## 6. Process Requirements (24 Gaps)

The gap analysis identified 24 specific requirements organized by priority. For full details including proposed BPMN changes, effort estimates, and dependency chains, see [gap-analysis.md](../discovery/gap-analysis.md).

### Priority Summary

| Priority | Count | Gaps |
|----------|-------|------|
| P1 (Critical) | 12 | GAP-1, 2, 7, 9, 11, 12, 16, 17, 18, 19, 20, 23 |
| P2 (High) | 9 | GAP-3, 4, 6, 10, 13, 14, 21, 22, 24 |
| P3 (Deferred) | 3 | GAP-5, 8, 15 |

### Key Dependencies

```
GAP-18 (Concierge) ──> GAP-9 (Completeness) + GAP-7 (Visibility)
GAP-19 (Parallel Engagement) ──> GAP-18 (Concierge coordinates DART)
GAP-12 (Security Baseline) ──> GAP-21 (OneTrust feeds risk scores)
GAP-11 (3-Pathway) ──> subsumes GAP-5 (VPP Fast-Track)
GAP-23 (AI Questionnaire) ──> GAP-6 (AI Fast-Track prerequisite)
```

Full dependency graph: See [gap-analysis.md, Dependencies section](../discovery/gap-analysis.md#dependencies)

---

## 7. Implementation Phases

The 30/60/90/120-day roadmap is fully documented in [implementation-roadmap.md](../discovery/implementation-roadmap.md). Key milestones:

| Phase | Days | Theme | Key Deliverables |
|-------|------|-------|-----------------|
| Consolidate | 1-30 | No technology | Process owner named, no-go list published, parallel engagement policy, baseline metrics |
| Automate | 31-60 | Quick wins | v7-c8 deployed to production, OB-DMN-5/6 live, async voting, status notifications |
| Optimize | 61-90 | Structural changes | Enable pathway live (30-day SLA), AI fast-track, OneTrust Phase 1, contract auto-generation |
| Scale | 91-120 | Portfolio-wide | Measurement dashboard v2, distributed pod pilot, idea funnel, process mining |

**Critical constraint**: Days 1-30 require zero technology changes. The organization has change fatigue; process credibility must precede technology investment.

---

## 8. Web Application Requirements

### 8.1 Task Worker UI -- Current and Planned

**Current State** (localhost demo):
- Single-user demo with hardcoded "showcase-user" assignment
- Start instances, claim/complete tasks, dynamic form rendering
- Auto-fill defaults, phase tracking sidebar, process resume
- No authentication, no multi-user support

**Planned Enhancements**:

| Requirement | Priority | Description |
|-------------|----------|-------------|
| User authentication | P1 | SSO/OIDC integration with organizational identity provider |
| Role-based task filtering | P1 | Show only tasks matching user's candidateGroups |
| Multi-user concurrent access | P1 | Multiple users claiming/completing tasks simultaneously |
| Named task assignment | P1 | Assign tasks to specific users (not just "showcase-user") |
| Form validation | P2 | Client-side validation before task completion |
| Process history view | P2 | Completed tasks with timestamps and outcomes |
| Mobile-responsive layout | P2 | Task completion from mobile devices |
| ServiceNow cross-reference | P3 | Link intake source ticket to process instance |

### 8.2 Process Owner Dashboard -- Current and Planned

**Current State** (localhost demo):
- 5 KPI cards: active instances, completed, avg cycle time, SLA breaches, task backlog
- Phase distribution visualization
- Sortable instance table with status indicators
- Lane-grouped task queue with SLA aging (green/yellow/red)
- Activity log, 10-second auto-refresh

**Planned Enhancements**:

| Requirement | Priority | Description |
|-------------|----------|-------------|
| SLA breach alerting | P1 | Email/Slack notifications when tasks exceed SLA thresholds |
| Trend charts | P1 | Cycle time trends, throughput per week, SLA compliance over time |
| Export to CSV/PDF | P2 | Executive reporting capability |
| Camunda Optimize embed | P2 | Embedded Optimize reports for deep analytics |
| Portfolio view | P2 | Aggregate metrics across multiple process definitions |
| KPI drill-down | P2 | Click KPI card to see filtered instance list |
| Configurable refresh | P3 | User-selectable refresh interval |

### 8.3 Vendor Portal (New Application)

A vendor-facing web application for external task completion.

| Requirement | Priority | Description |
|-------------|----------|-------------|
| Scoped vendor access | P1 | Vendor sees only their assigned tasks; no internal governance data visible |
| Form rendering | P1 | Render 10 existing vendor forms (vendor-*.form) |
| Document upload | P1 | Attach documents to vendor tasks (proposals, security responses, contracts) |
| Status tracking | P2 | Vendor can see their request's current phase |
| Notification preferences | P3 | Email notifications for new tasks and deadlines |

### 8.4 Shared Infrastructure

| Requirement | Priority | Description |
|-------------|----------|-------------|
| Cloud deployment | P1 | Containerized deployment (Docker) to cloud hosting |
| API gateway | P1 | Reverse proxy with rate limiting, CORS, request logging |
| Session management | P1 | Secure session handling with OIDC tokens |
| Environment config | P1 | Separate dev/staging/prod with environment-specific secrets |
| Health checks | P2 | Liveness/readiness probes for container orchestration |
| Structured logging | P2 | JSON logging with correlation IDs tied to process instance keys |

---

## 9. Decision Model Requirements

### Deployed DMN Tables

| ID | Name | Hit Policy | Used In |
|----|------|-----------|---------|
| OB-DMN-1 | Risk Tier Classification | FIRST | SP2 (pathway input) |
| OB-DMN-3 | Governance Review Routing | UNIQUE | SP3 (evaluation scope) |
| OB-DMN-4 | Onboarding SLA Assignment | UNIQUE | Cross-cutting (timer durations) |

### Planned DMN Tables

| ID | Name | Hit Policy | GAP Ref | Status |
|----|------|-----------|---------|--------|
| OB-DMN-5 | Request Prioritization Scoring | FIRST | GAP-2 | Referenced in v7-c8 BPMN, table not yet created |
| OB-DMN-6 | Security Assessment Level | UNIQUE | GAP-12 | Exists in v7-c8 BPMN, not wired into SP3 routing |
| OB-DMN-7 | Deal Killer Pre-Screen | FIRST | GAP-16 | Created — SP1 deal-killer check + SP0 Step 3 |
| OB-DMN-8 | Mini RFP Question Selection | COLLECT | Mini RFP PRD | Planned — SP0 dynamic questionnaire assembly |
| OB-DMN-9 | Team Engagement Routing | COLLECT | Mini RFP PRD | Planned — SP0 Step 9 engagement prediction |
| OB-DMN-10 | Contract Complexity Routing | UNIQUE | GAP-20 | Not yet created (renumbered from OB-DMN-7) |

### DMN Design Principles

- All DMN tables use FEEL expressions (Camunda 8 requirement)
- Input variables sourced from process variables set by upstream forms
- Output variables consumed by downstream exclusive gateways
- Hit policies chosen to guarantee deterministic single-result output

---

## 10. Integration Requirements

### 10.1 OneTrust (TPRM + Assessment Automation)

**Status**: API patterns documented, pending module licensing decision (Shane, TPRM Lead)

**Integration Points**:
1. **SP3 Risk Assessment**: Service task creates OneTrust assessment, receive task awaits completion, service task retrieves results
2. **SP3 Vendor Due Diligence**: OneTrust TPRM manages vendor questionnaires, results feed evaluation gateway

**Pattern**: Zeebe service task (external) with dedicated job workers

**APIs**: `POST /api/assessment/v2/assessments`, `GET /api/assessment/v2/assessments/{id}/export`, `POST /api/risk/v3/risks`

**Dependencies**: OneTrust module licensing decision, OAuth2 credentials, tenant hostname

**Full specification**: See [onetrust-integration.md](../discovery/onetrust-integration.md)

### 10.2 ServiceNow (Intake Bridge)

**Status**: Planned (Days 31-60)

**Purpose**: Route ServiceNow tickets into Camunda process instances automatically. ServiceNow is the primary request channel; manual re-entry into Camunda creates duplicate data.

**Integration Pattern**:
- ServiceNow business rule triggers on ticket creation with category = "Software Onboarding"
- REST callout to Camunda Zeebe API: `POST /v2/process-instances` with ticket variables
- Correlation: ServiceNow ticket number stored as process variable for bidirectional linking
- Status sync: Camunda send tasks update ServiceNow ticket state at phase transitions

### 10.3 Contract Lifecycle Management (CLM)

**Status**: Planned (Days 61-90, CLM platform evaluation in Days 31-60)

**Purpose**: Auto-generate contract drafts from templates, track deviations from standard terms, reduce the 3-5 day contract generation cycle to < 1 hour for standard contracts.

**Integration Pattern**:
- Service task calls CLM API to generate draft from template + process variables
- Deviation review task flags non-standard terms for legal review
- OB-DMN-7 routes: standard terms auto-approved, custom terms require legal

### 10.4 CMDB (Ownership Registry)

**Status**: Planned (Days 31-60)

**Purpose**: Populate Business Owner, Technical Owner, and Support Owner in the asset register at SP5 completion (GAP-14).

**Integration Pattern**:
- Service task writes ownership data to CMDB API after `Task_AssignOwnership`
- Annual validation: post-onboarding process queries CMDB for ownership review

---

## 11. Architecture

### Current State

```
Browser (localhost)
  |
  +-- Task Worker UI (index.html)
  +-- Process Owner Dashboard (dashboard.html)
  |
  v
Express.js Gateway (server.js, port 3847)
  |
  +-- OAuth2 Token Cache
  |
  +----> Zeebe REST API (ric-1.zeebe.camunda.io)
  |        - Start instances
  |        - Deploy resources
  |
  +----> Tasklist REST API (ric-1.tasklist.camunda.io)
           - Search/claim/complete tasks
           - Retrieve forms and variables
```

### Target State

```
Users (SSO/OIDC)
  |
  v
API Gateway / Reverse Proxy (cloud-hosted)
  |
  +-- Task Worker UI ──────────> OIDC Provider
  +-- Process Owner Dashboard       |
  +-- Vendor Portal                 |
  |                                 v
  v                          Identity Service
Express.js API (containerized)
  |
  +----> Zeebe REST API (Camunda 8 Cloud)
  +----> Tasklist REST API
  +----> OneTrust API (TPRM + Assessment)
  +----> ServiceNow API (Intake Bridge)
  +----> CLM API (Contract Generation)
  +----> CMDB API (Ownership Registry)
  |
  +----> Camunda Optimize (Analytics)
```

### Camunda 8 Cloud Topology

| Component | Endpoint |
|-----------|----------|
| Zeebe Gateway | `ric-1.zeebe.camunda.io:443` |
| Tasklist | `ric-1.tasklist.camunda.io` |
| Operate | `ric-1.operate.camunda.io` |
| Optimize | `ric-1.optimize.camunda.io` |
| Web Modeler | `modeler.camunda.io` |
| OAuth | `login.cloud.camunda.io/oauth/token` |

---

## 12. Non-Functional Requirements

### Performance

| Metric | Target |
|--------|--------|
| Task Worker page load | < 2 seconds |
| Dashboard refresh cycle | < 3 seconds (10s interval) |
| API response time (p95) | < 500ms for task operations |
| Concurrent users | 50+ simultaneous task workers |
| Process instances | 1000+ active instances |

### Security

| Requirement | Implementation |
|-------------|---------------|
| Authentication | SSO/OIDC with organizational identity provider |
| Authorization | Role-based access via candidateGroups mapping |
| Vendor isolation | Separate portal with scoped API access; no internal data exposure |
| Data in transit | TLS 1.2+ for all API calls |
| Credential management | Camunda secrets for integration credentials; no plaintext in BPMN |
| Audit trail | All task completions logged with user, timestamp, and form data |

### Availability

| Metric | Target |
|--------|--------|
| Uptime (business hours) | 99.5% |
| Camunda 8 Cloud SLA | Per Camunda Cloud agreement |
| Planned maintenance window | Weekends, off-hours |

### Data Retention

| Data Type | Retention |
|-----------|-----------|
| Process instance history | 180 days (camunda:historyTimeToLive) |
| Completed task data | 180 days |
| Audit logs | 7 years (regulatory: SEC 17a-4, SOX) |
| Form submissions | 180 days in Camunda, archived to document store |

---

## 13. Success Metrics

The measurement dashboard tracks progress from baseline (Day 1) through Day 120. Full dashboard specification in [implementation-roadmap.md, Measurement Dashboard](../discovery/implementation-roadmap.md#measurement-dashboard).

### Key Targets

| Metric | Baseline | Day 30 | Day 60 | Day 120 |
|--------|----------|--------|--------|---------|
| E2E cycle time (Enable) | 6-9 months | N/A | 45 days | 30 days |
| E2E cycle time (Buy) | 6-9 months | Measured | 20 weeks | 16 weeks |
| Intake-to-triage time | Unknown | Measured | 3 days | 1 day |
| Queue time (% of total) | Unknown | Measured | < 50% | < 30% |
| Incomplete submission rate | Unknown | Measured | -25% | -50% |
| Security review backlog | Unknown | Measured | -20% | -40% |
| Parallel engagement rate | 0% | Policy issued | 50% | 80% |
| Contract generation time | 3-5 days | Measured | 2 days | < 1 day |
| AI request cycle time | 6-9 months | Triaged | 6 weeks | 3 weeks |

---

## 14. Risks and Mitigations

7 critical challenges identified from stakeholder analysis. Full detail in [implementation-roadmap.md, Critical Challenges](../discovery/implementation-roadmap.md#critical-challenges).

| # | Risk | Severity | Mitigation |
|---|------|----------|------------|
| 1 | Executive sponsor not secured | Fatal | Escalate with cost-of-inaction analysis (6-9mo vs. 60-90 day benchmark) |
| 2 | Security team capacity | High | GAP-12 tiered assessment reduces manual review volume by 40-60% |
| 3 | Change fatigue | High | Days 1-30 deliberately avoids technology; prove value with policy first |
| 4 | 335 in-flight items | Medium | Hard cutoff: new requests only on new process |
| 5 | OneTrust licensing uncertainty | Medium | Decision in Days 31-60; technical integration in Days 61-90 |
| 6 | Resistance to Concierge role | Medium | Frame as enabler (removes blockers), not gatekeeper |
| 7 | Measurement infrastructure gaps | Medium | Baseline ServiceNow data before any process changes |

---

## 15. Gap Status Tracker

Complete status of all 24 gaps from the [gap analysis](../discovery/gap-analysis.md).

| ID | Name | Priority | Status | Target Phase | Artifact |
|----|------|----------|--------|-------------|----------|
| GAP-1 | Unified Intake Gateway | P1 | Implemented | v7-c8 | sp1-classify-request.form |
| GAP-2 | Prioritization Scoring | P1 | Implemented | v7-c8 | sp2-backlog-prioritization.form, OB-DMN-5 (planned) |
| GAP-3 | Progressive Form Strategy | P2 | Planned | Days 31-60 | Form field audit needed |
| GAP-4 | Finance Rework Loop | P2 | Implemented | v7-c8 | sp4-coding-correction.form |
| GAP-5 | VPP Fast-Track | P3 | Subsumed | -- | By GAP-11 Enable pathway |
| GAP-6 | AI Fast-Track Pathway | P2 | Planned | Days 61-90 | Needs org AI risk posture decision |
| GAP-7 | Status Visibility | P1 | Planned | Days 31-60 | Send tasks at phase boundaries |
| GAP-8 | Exception Routing | P3 | Planned | Days 61-90 | SP_RapidRiskAssessment |
| GAP-9 | Completeness Quality Gate | P1 | Implemented | v7-c8 | sp1-completeness-gate.form |
| GAP-10 | Workload Dashboard | P2 | In Progress | Days 31-60 | Optimize dashboard setup scripts |
| GAP-11 | 3-Pathway Routing | P1 | Implemented | v7-c8 | OB-DMN-2, Buy/Build/Enable gateway |
| GAP-12 | Security Baseline Controls | P1 | Planned | Days 31-60 | OB-DMN-6 exists, not wired into SP3 |
| GAP-13 | Time-Bound Conditional Approval | P2 | Implemented | v7-c8 | sp5-condition-verification.form |
| GAP-14 | Ownership Assignment | P2 | Implemented | v7-c8 | sp5-assign-ownership.form |
| GAP-15 | Pre-Onboarding Idea Funnel | P3 | Deferred | Days 91-120 | Needs existing platform evaluation |
| GAP-16 | Deal-Killer Pre-Screen | P1 | Implemented | v7-c8 | sp1-deal-killer-check.form |
| GAP-17 | NDA Gate | P1 | Partial | Days 31-60 | nda-gate.form (Defined Need path only) |
| GAP-18 | Concierge / Quarterback | P1 | Planned | Days 1-30 | Organizational role definition |
| GAP-19 | Simultaneous Engagement | P1 | Planned | Days 1-30 | Policy mandate + SP3 restructure |
| GAP-20 | Contract Automation | P1 | Partial | Days 61-90 | sp4-contract-deviation.form, OB-DMN-7 planned |
| GAP-21 | OneTrust Integration | P2 | Planned | Days 61-90 | API patterns in onetrust-integration.md |
| GAP-22 | Distributed Pod Model | P2 | Planned | Days 91-120 | Organizational change |
| GAP-23 | AI Questionnaire Consolidation | P1 | Planned | Days 31-60 | Questionnaire audit needed |
| GAP-24 | Async Governance Decisions | P2 | Planned | Days 31-60 | Multi-instance voting + timer |

---

## Appendix: Referenced Documents

| Document | Path | Content |
|----------|------|---------|
| Build Summary | [build-summary.md](../build-summary.md) | Complete artifact inventory |
| Gap Analysis | [gap-analysis.md](../discovery/gap-analysis.md) | 24 gaps, priority matrix, dependencies |
| Implementation Roadmap | [implementation-roadmap.md](../discovery/implementation-roadmap.md) | 30/60/90/120-day plan |
| Stakeholder Interviews | [stakeholder-interviews.md](../discovery/stakeholder-interviews.md) | 14 sessions, pain points |
| OneTrust Integration | [onetrust-integration.md](../discovery/onetrust-integration.md) | API patterns, integration points |
| Governance Topic Mapping | [governance-topic-mapping.md](../governance-topic-mapping.md) | 11 topics, RACI assignments |
| ESG Framework PRD | [enterprise-software-governance-prd.md](../../../../framework/docs/prd/enterprise-software-governance-prd.md) | Parent framework PRD |

---

*Created: 2026-03-06 | Source: SLA-43 through SLA-47 | Format reference: framework/docs/prd/enterprise-software-governance-prd.md*
