# Gap Analysis — Current State vs. BPMN Model

Derived from 14 stakeholder sessions (Feb-Mar 2026) plus 10-perspective analysis mapped against `onboarding-to-be-ideal-state-v7-c8.bpmn`.

---

## Summary

The v7-c8 BPMN model addresses most structural needs including unified intake, prioritization scoring, 3-pathway routing, and ownership assignment. The remaining gaps focus on **process orchestration roles**, **parallel engagement**, **contract automation**, **OneTrust integration**, **distributed pod governance**, **AI questionnaire consolidation**, **async governance decisions**, **security baseline controls**, and **measurement infrastructure**.

---

## Gap Detail

### GAP-1: Unified Intake Gateway (SP1)

**Status**: Implemented in v7-c8 (Task_ClassifyRequest + GW_RequestType)

**Current Model**: SP1 starts with `Task_ReviewExisting` → gateway → gather/leverage split.

**Stakeholder Need**: Single entry point that absorbs 5+ channels (ServiceNow, AI forms, Power Apps, email) and routes dynamically.

**Proposed Change**:
- Add a `Task_ClassifyRequest` before `GW_ExistingSolution` that determines request type (Standard, AI, Exception, Vendor Partnership)
- Route AI requests to include `Task_AIGovernanceReview` (SP3) automatically
- Route exception requests to rapid risk assessment (new event sub-process or SP variant)
- Update OB-DMN-2 to include request type as an input for pathway routing

**Effort**: Medium (new task + DMN input column + form changes)

---

### GAP-2: Formal Prioritization Scoring (SP2)

**Status**: Implemented in v7-c8 (OB-DMN-5 Prioritization Scoring)

**Current Model**: SP2 has `Task_PrelimAnalysis` → `GW_NeedsFullEval` → `Task_Backlog` → `Task_PathwayRouting`.

**Stakeholder Need**: Quantitative scoring formula to rank requests objectively. Currently teams "horse trade."

**Proposed Change**:
- Add a `bpmn:businessRuleTask` referencing a new **OB-DMN-5: Request Prioritization Scoring** DMN table
- Inputs: business impact, strategic alignment, urgency, risk tier, capacity availability
- Output: priority score (P1/P2/P3) and recommended sequencing
- Place between `Task_Backlog` and `Task_PathwayRouting`
- Governance lane owns this task (per Governance Specialist)

**Effort**: Medium (new DMN table + task + form)

---

### GAP-3: Progressive Form Strategy (SP1-SP3)

**Current Model**: Forms exist per-task but each is standalone with potential for redundant questions.

**Stakeholder Need**: Dynamic intake — ask only what's needed at each stage, no repeated questions.

**Proposed Change**:
- **SP1 form**: Minimum viable fields only (request type, business owner, problem statement, urgency)
- **SP2 form**: Incremental fields (funding source if applicable, strategic alignment, technical requirements)
- **SP3 forms**: Domain-specific only (security questionnaire, architecture checklist, AI governance)
- Implement via Camunda form field visibility conditions or progressive disclosure
- Document the "question inventory" to ensure no question appears in more than one form

**Effort**: Low-Medium (form refactoring, no BPMN structural changes)

---

### GAP-4: Finance Rework Loop (SP4)

**Current Model**: SP4 has linear flow through contracting with a merge gateway for Buy/Build paths. No internal correction loop.

**Stakeholder Need**: Ability to reroute coding matrix issues to FP&A without restarting the entire process. Minor cosmetic corrections without formal denial.

**Proposed Change**:
- Add an exclusive gateway after `Task_FinalizeContract`: "Coding Matrix Correct?"
- "No" path routes to a new `Task_CorrectionRequest` (finance-lane) that loops back to `Task_FinalizeContract` merge gateway
- "Yes" continues to SP5
- Pattern: same as PDLC `GW_TestsPassed` retry loop in bpmn-hierarchical-subprocess.md Pattern D

**Effort**: Low (new gateway + task + loop flow within SP4)

---

### GAP-5: Vendor Partnership Fast-Track Pathway

**Status**: Subsumed by GAP-11 Enable pathway in v7-c8

**Current Model**: Top-level `GW_BuyOrBuild` routes Buy → SP3 or Build → SP4. No differentiation for pre-approved vendor partnership products.

**Stakeholder Need**: Vendor partnership products (no org cost, no development, pre-approved vendors) should skip funding validation and reduce evaluation scope.

**Proposed Change**:
- Add an input to OB-DMN-2 (Pathway Routing): `vendorPartnershipProgram` (boolean)
- New pathway output: "Fast-Track (VPP)" that skips financial analysis in SP3 and negotiation in SP4
- At the top level, add a gateway after SP1: "Vendor Partnership?" that routes to a streamlined SP3 variant or bypasses directly to SP4 (contract execution only)
- Alternative: handle within SP3/SP4 via conditional gateways rather than top-level routing

**Effort**: Medium-High (DMN change + new pathway variant + conditional tasks)

---

### GAP-6: AI Fast-Track Pathway

**Current Model**: AI governance review exists in SP3 as one of 5 parallel evaluation branches. No special fast-track for AI-first tools.

**Stakeholder Need**: AI tools taking too long. Stakeholders want clear target state and timeline. AI should be first use case with planned expansion.

**Proposed Change**:
- Add an AI-specific pathway in OB-DMN-2 that triggers when request type = "AI Tool"
- This pathway: runs AI Governance Review in parallel with Security Assessment only (skip financial, vendor landscape, legal unless triggered)
- Pre-defined AI risk posture reduces decision latency at `GW_EvalApproved`
- Add SLA timer specific to AI pathway (target: 2 weeks end-to-end vs. 6-9 months)

**Effort**: High (new pathway, DMN changes, conditional SP3 branches, new SLA targets)

---

### GAP-7: Status Visibility / Notification Events

**Current Model**: Cross-lane notification exists at SP5 close (`Task_CloseRequest`). No mid-process status notifications.

**Stakeholder Need**: Requestors cannot see status. No centralized tracking.

**Proposed Change**:
- Add `bpmn:sendTask` at each phase transition (between sub-processes) in the Automation lane
- Each send task emits a status notification to the requestor
- Template: "Your request [ID] has moved to [Phase Name]. Expected completion: [SLA date]."
- This maps to the cross-lane notification pattern in bpmn-modeling-standards.md

**Effort**: Low (send tasks at existing phase boundaries, no structural changes)

---

### GAP-8: Exception Routing to Rapid Risk Assessment

**Current Model**: No explicit exception handling pathway. All requests follow the same 5-phase flow.

**Stakeholder Need**: Exception requests (office-specific technology permissions, one-off tools) create "mini version of full onboarding" workload. Should be identified and routed separately.

**Proposed Change**:
- In SP1, after `Task_ClassifyRequest` (GAP-1), add a gateway: "Exception Request?"
- "Yes" routes to a new collapsed sub-process: `SP_RapidRiskAssessment` (simplified 3-day assessment)
- This SP contains: risk assessor routing, abbreviated evaluation, approval/denial
- "No" continues to standard flow
- Exception SP has its own SLA timer (P3D) with escalation

**Effort**: Medium (new sub-process, new gateway in SP1 or top-level)

---

### GAP-9: Completeness Quality Gate at Intake (SP1)

**Current Model**: SP1 `Task_InitialTriage` classifies the request but does not enforce minimum completeness.

**Stakeholder Need**: Incomplete submissions cascade through the process, causing rework when AI/offshoring/subcontracting requirements surface late. Reviewers report requestors "don't know what they're asking for." Workshop consensus: need a "defense layer" before reaching SME review teams.

**Proposed Change**:
- Add a `bpmn:businessRuleTask` after `Task_SubmitRequest`: "Completeness Check" referencing a new DMN table or form validation logic
- Inputs: required fields populated, problem statement quality score, risk flags identified
- Outcomes: Complete (proceed to triage), Incomplete (route back to requestor with guidance)
- Include AI-assisted pre-screening for completeness (Automation lane service task)

**Effort**: Low-Medium (new task + validation rules + guidance content)

---

### GAP-10: Workload Visibility Dashboard (Cross-cutting)

**Current Model**: No visibility into team workload, queue depth, or resource constraints across business units.

**Stakeholder Need**: Legal working 50+ agreements with no visibility. Teams in silos. Need portfolio view for work distribution, metrics for underwater teams, data for hiring decisions (Operations Director, Process Consultant).

**Proposed Change**:
- Not a BPMN structural change — this is a **Camunda Cockpit/Optimize** capability
- Process model should emit the right data: task assignment counts, phase duration metrics, queue depth per lane
- Add `camunda:properties` for KPI tracking on key tasks (review tasks, approval tasks)
- Document as a platform requirement for Camunda 8 migration

**Effort**: Low (BPMN metadata additions) + Platform dependency (Camunda Optimize)

---

### GAP-11: 3-Pathway Routing — Buy / Build / Enable (Top-level)

**Status**: Implemented in v7-c8 (Buy/Build/Enable routing + OB-DMN-2)

**Current Model**: Top-level `GW_BuyOrBuild` is a binary gateway (Buy → SP3, Build → SP4).

**Stakeholder Need**: A third pathway — "Enable" (Vendor Affinity Program) — where the organization evaluates and approves tools that advisors purchase directly. No org investment, no development, lower risk, advisor expectation of ~1 month turnaround. Current 2-way gateway doesn't accommodate this (Product Manager 1, 2/13; confirmed Product Manager, 3/5).

**Pathway Details** (per Product Manager, 3/5):
- Treats advisors as independent businesses
- Curated vendor list with organizational approval
- Revenue sharing or negotiated discounts
- Advisors purchase "organizational version" of tools
- Not a closed ecosystem — "You can use anything you'd like so long as it doesn't conflict with policies"
- Process currently forces funding validation on Enable pathway, creating unnecessary friction

**Proposed Change**:
- Rename `GW_BuyOrBuild` to `GW_Pathway` with 3 outputs: Buy, Build, Enable
- OB-DMN-2 (Pathway Routing) adds `Enable` output with inputs: org investment (none), advisor-direct purchase (true), vendor partnership program (true)
- Enable path: SP3 with reduced scope (skip financial analysis, skip vendor landscape assessment) → SP4 streamlined (compliance review + contract execution only, skip negotiation/funding) → SP5
- SLA target for Enable: P30D (30 days end-to-end)

**Effort**: High (gateway restructure + DMN expansion + conditional SP3/SP4 branches)

---

### GAP-12: Security Baseline Controls Definition (SP3)

**Current Model**: SP3 `Task_SecurityAssessment` is a single parallel branch with no tiered assessment.

**Stakeholder Need**: No defined "secure by design" standard. Teams don't know minimum controls. Enforcement "fairly loose." Need control hierarchy: baseline (minimum), elevated, major (Security Director, Architecture Security Lead, 2/12).

**Proposed Change**:
- Add a `bpmn:businessRuleTask` before `Task_SecurityAssessment`: "Determine Security Assessment Level"
- DMN-driven: inputs = risk tier + data classification + AI component (boolean)
- Outputs: Baseline (automated checks only), Elevated (automated + manual review), Major (full security assessment + pen test)
- Baseline checks run as `bpmn:serviceTask` in Automation lane
- Only Elevated/Major route to manual `Task_SecurityAssessment`

**Note**: Elevated to P1 — all 10 analysis perspectives converge on security staffing as the binding constraint. OB-DMN-6 exists in v7-c8 but is not wired into SP3.

**Effort**: Medium (new DMN table or extend OB-DMN-1, new service task, conditional routing in SP3)

---

### GAP-13: Time-Bound Conditional Approval (SP5)

**Current Model**: SP5 `Task_FinalApproval` has binary outcome (Approved / Rejected).

**Stakeholder Need**: Company may want product by Q2 but security controls not ready until Q3. Need formal process for time-bound risk acceptance with mitigation plan (AI Security Lead, 2/12).

**Proposed Change**:
- `GW_FinalApproved` adds third output: "Approved with Conditions"
- Routes to `Task_OnboardSoftware` but ALSO spawns a monitoring sub-process with boundary timer event
- Timer set to condition expiration date (e.g., P90D)
- On timer expiry: escalation task to verify conditions have been met
- If conditions not met: triggers termination end event

**Effort**: Medium (new gateway output + monitoring sub-process + timer)

---

### GAP-14: Mandatory Ownership Assignment (SP5 / Post-Onboarding)

**Status**: Implemented in v7-c8 (Task_AssignOwnership)

**Current Model**: SP5 `Task_OnboardSoftware` provisions the software but does not formally assign ownership.

**Stakeholder Need**: No authoritative source for app/technology ownership. Incomplete CMDB. Requesting team often different from maintaining team. Requirements given to teams that can't implement them (Security Director, AI Security Lead, 2/12).

**Proposed Change**:
- Add `Task_AssignOwnership` after `Task_OnboardSoftware` in SP5
- Required fields: Business Owner, Technical Owner, Support Owner
- Feeds CMDB or asset register
- Post-onboarding process (`post-onboarding-summary.bpmn`) adds annual ownership validation task

**Effort**: Low (new task + form fields)

---

### GAP-15: Pre-Onboarding Idea Funnel (Pre-SP1)

**Current Model**: Process starts at SP1 `Task_ReviewExisting`. No structured pre-intake.

**Stakeholder Need**: Two-tier intake — idea collection (centralized feedback, upvoting, data-driven prioritization) before formal onboarding (Product Manager 1, 2/13). Existing feedback management team and platform already capture advisor verbatim.

**Proposed Change**:
- New top-level collapsed sub-process BEFORE SP1: `SP_IdeaFunnel`
- Contains: feedback submission, upvoting/deduplication, threshold check (N upvotes or strategic alignment score)
- Gateway: "Meets threshold?" → Yes: routes to SP1 formal intake → No: stays in backlog
- Integrates with existing feedback management platform

**Effort**: Medium (new sub-process + integration point)

---

### GAP-16: Deal-Killer / No-Go Pre-Screen (SP1)

**Current Model**: No early-exit for requests that will obviously be rejected.

**Stakeholder Need**: Communicate non-starter models/vendors early to prevent wasted effort. Certain AI models are "complete no-gos" (Business Representative, 2/17). Enterprise Risk Management developing red/green light decision matrix (Vendor Risk Lead).

**Proposed Change**:
- In SP1, after intake classification: `bpmn:businessRuleTask` "Deal-Killer Check"
- DMN-driven: inputs = vendor name, AI model name, data residency requirements
- Outputs: Proceed, Blocked (with reason)
- Blocked → immediate rejection end event with explanation to requestor
- Maintains a managed no-go list (updateable without process change)

**Effort**: Low-Medium (new DMN table + task + rejection flow)

---

### GAP-17: NDA Gate (SP3 / Pre-Evaluation)

**Status**: Partially implemented in v7-c8 (Task_ExecuteNDA for Defined Need path)

**Current Model**: No mandatory NDA step before detailed vendor evaluation begins.

**Stakeholder Need**: Mandatory NDA execution before sharing detailed evaluation criteria or proprietary requirements with vendors. Security Architect and Legal alignment — NDA must be in place before any substantive vendor engagement. Current process sometimes shares evaluation details before NDA is signed.

**Proposed Change**:
- Add `Task_ExecuteNDA` as a gateway condition before SP3 evaluation tasks begin
- For Buy/Enable paths: NDA required before vendor receives evaluation questionnaires
- For Build path: NDA required before sharing detailed requirements with external development partners
- DMN-driven: determine NDA type (standard, mutual, custom) based on data classification and vendor tier
- Block SP3 parallel evaluation start until NDA status = "Executed"

**Effort**: Low (task exists for Defined Need path; extend to all paths with gateway condition)

---

### GAP-18: Concierge / Quarterback Role (Cross-cutting)

**Current Model**: No single point of accountability for end-to-end process orchestration. Requests pass between lanes without a consistent owner.

**Stakeholder Need**: E2E process orchestration modeled on Architecture's Governance Facilitator role. Pre-screens artifacts for completeness, removes incomplete items from review queues, manages follow-ups with requestors and SMEs, serves as single point of contact for status inquiries. "We have a governance facilitator who pre-screens everything. If he didn't, the whole thing falls apart" — Architecture Lead.

**Proposed Change**:
- Define a `concierge` candidateGroup (or extend `governance-lane`)
- Add `Task_ConciergeReview` at phase transitions (between SP1→SP2, SP2→SP3, SP3→SP4)
- Concierge validates completeness, resolves blockers, manages SLA escalations
- Concierge owns the status notification tasks (GAP-7)
- Model as a cross-cutting responsibility rather than a new lane

**Effort**: Medium (role definition + tasks at phase boundaries + process ownership model)

---

### GAP-19: Simultaneous Engagement (SP3)

**Current Model**: SP3 parallel gateway fans out to 5 evaluation branches, but DART (due diligence assessment review team) formation and engagement is sequential in practice.

**Stakeholder Need**: Replace sequential DART formation with parallel engagement of all major stakeholders from day one. "Simultaneous engagement of all the major players that have a vote" — Architecture Lead. Current sequential approach means a single delayed reviewer blocks the entire evaluation.

**Proposed Change**:
- Restructure SP3 to enforce true parallel execution from process start, not just model structure
- Add `Task_FormDART` before the parallel gateway that identifies all required reviewers upfront
- Set individual reviewer SLA timers (P3D per reviewer) rather than one SP-level timer
- Non-response after SLA: auto-escalate to reviewer's manager, proceed with available assessments
- Add `Task_ConsolidateFindings` after join gateway that reconciles conflicting assessments

**Effort**: Medium (SP3 restructure + individual SLA timers + escalation logic)

---

### GAP-20: Contract Automation (SP4)

**Current Model**: SP4 contracting is modeled as sequential user tasks with manual document handling. No automation for standard contract terms or deviation tracking.

**Stakeholder Need**: 2 people negotiating 30+ contracts per month. Contract deviation tracking, automated standard-terms review, and template-based drafting needed. "That team desperately needs automation" — TPRM Lead.

**Proposed Change**:
- Add `bpmn:serviceTask` "Auto-Generate Contract Draft" in Automation lane that pre-populates standard terms from templates
- Add `Task_DeviationReview` that flags non-standard terms for legal review (only deviations, not full contract)
- DMN-driven: `OB-DMN-7: Contract Complexity Routing` — standard terms auto-approved, custom terms route to legal
- Track deviation metrics for continuous improvement (which clauses most frequently modified)
- Integrate with CLM (Contract Lifecycle Management) platform if available

**Effort**: High (service task + DMN table + CLM integration + template management)

---

### GAP-21: OneTrust Integration (SP3 / Cross-cutting)

**Current Model**: Risk assessment and vendor due diligence tasks are modeled as standalone Camunda user tasks with manual data entry.

**Stakeholder Need**: Assessment Automation + TPRM module + deviation tracking integration with Camunda 8 via Zeebe service tasks. OneTrust already in use for risk assessments; need bidirectional integration rather than duplicate data entry. Source: TPRM Lead + discovery doc.

**Proposed Change**:
- Replace manual assessment tasks with Zeebe service task → OneTrust API pattern:
  1. Service task creates assessment in OneTrust Assessment Automation
  2. Human completes assessment in OneTrust UI (receive task waits for webhook/callback)
  3. Service task retrieves results via `GET /api/assessment/v2/assessments/{id}/export`
- Wire OneTrust risk scores into OB-DMN-1 (Risk Classification) and OB-DMN-6 (Security Assessment Level)
- Vendor due diligence: OneTrust TPRM module manages questionnaires, results feed SP3 evaluation
- See `customers/fs-onboarding/docs/discovery/onetrust-integration.md` for API details

**Effort**: High (Zeebe connector development + OneTrust API integration + webhook infrastructure)

---

### GAP-22: Distributed Pod Model (Cross-cutting)

**Current Model**: Centralized lane-based governance where all requests flow through the same review queues regardless of domain.

**Stakeholder Need**: Domain-specific pods (Cyber, Architecture, Legal, AI, TPRM) controlling their own prioritization and cadence. Central team ensures consistency and resolves cross-pod conflicts. "Each pod should own their piece of the process" — Vendor Mgmt Lead.

**Proposed Change**:
- Model pod-based routing in SP3: after DART formation (GAP-19), route to domain-specific pod queues
- Each pod has independent SLA timers and escalation paths
- Central governance lane retains authority for cross-pod decisions and final approval
- DMN-driven pod assignment based on request type, risk tier, and data classification
- Pods report completion independently; join gateway waits for all required pods

**Effort**: Medium-High (pod routing logic + independent SLA management + coordination model)

---

### GAP-23: AI Questionnaire Consolidation (SP3)

**Current Model**: AI governance review in SP3 uses a single evaluation branch, but in practice 3+ additional AI-specific questionnaires have been introduced outside the modeled process.

**Stakeholder Need**: 3 additional AI-specific questionnaires "snuck up" on the team. Need to merge into a single consolidated dataset rather than asking vendors to complete overlapping questionnaires. Source: TPRM Lead.

**Proposed Change**:
- Audit existing AI questionnaires (identify overlap, unique fields, regulatory requirements)
- Create consolidated `Form_AIGovernanceAssessment` that covers all requirements in one submission
- Map consolidated fields to regulatory requirements (EU AI Act, SR 11-7, FS AI RMF)
- Wire consolidated form into SP3 AI Review branch via `zeebe:formDefinition`
- Deprecate redundant questionnaires with migration path for in-flight assessments

**Effort**: Medium (questionnaire audit + form consolidation + regulatory mapping)

---

### GAP-24: Async Governance Decisions (SP5)

**Current Model**: Business Council approval in SP5 requires synchronous quorum at scheduled meetings. Meeting cadence creates bottleneck.

**Stakeholder Need**: Business Council quorum fix — email voting with 48-hour SLA, non-response treated as abstention. Prevents single absentee from blocking approval. Source: Vendor Mgmt Lead.

**Proposed Change**:
- Replace `Task_BusinessCouncilApproval` with a multi-instance user task (one per council member)
- Add boundary timer (P2D) for 48-hour voting window
- DMN-driven quorum calculation: minimum N of M votes required based on risk tier
- Non-response after timer: auto-record as abstention
- If quorum met: proceed with majority decision
- If quorum not met: escalate to executive sponsor for override decision

**Effort**: Medium (multi-instance task + timer + quorum logic + escalation path)

---

## Priority Matrix

| Gap | Business Impact | BPMN Complexity | Stakeholder Urgency | Recommended Priority |
|-----|----------------|-----------------|---------------------|---------------------|
| GAP-1 Unified Intake | High | Medium | Critical | P1 (implemented v7) |
| GAP-2 Prioritization | High | Medium | Critical | P1 (implemented v7) |
| GAP-7 Status Visibility | High | Low | Critical | P1 |
| GAP-9 Completeness Gate | High | Low | Critical | P1 |
| GAP-11 3-Pathway Routing | High | High | Critical | P1 (implemented v7) |
| GAP-12 Security Baseline | High | Medium | Critical | P1 (binding constraint) |
| GAP-16 Deal-Killer Pre-Screen | High | Low-Medium | High | P1 (quick win) |
| GAP-17 NDA Gate | High | Low | High | P1 (partially in v7) |
| GAP-18 Concierge/Quarterback | High | Medium | Critical | P1 (linchpin role) |
| GAP-19 Simultaneous Engagement | High | Medium | Critical | P1 (Architecture Lead) |
| GAP-20 Contract Automation | High | High | Critical | P1 (capacity crisis) |
| GAP-23 AI Questionnaire | High | Medium | High | P1 (quick consolidation win) |
| GAP-3 Progressive Forms | Medium | Low | High | P2 |
| GAP-4 Finance Rework | Medium | Low | High | P2 |
| GAP-6 AI Fast-Track | High | High | Critical | P2 (needs risk posture decision first) |
| GAP-10 Workload Dashboard | High | Low (metadata) | High | P2 (platform dependency) |
| GAP-13 Time-Bound Approval | Medium | Medium | High | P2 |
| GAP-14 Ownership Assignment | High | Low | High | P2 (implemented v7) |
| GAP-21 OneTrust Integration | High | High | High | P2 (needs module licensing clarity) |
| GAP-22 Distributed Pod Model | Medium | Medium-High | Medium | P2 (organizational change) |
| GAP-24 Async Governance | Medium | Medium | High | P2 (process change, low tech) |
| GAP-5 VPP Fast-Track | Medium | Medium-High | Medium | P3 (subsumed by GAP-11) |
| GAP-8 Exception Routing | Medium | Medium | Medium | P3 |
| GAP-15 Idea Funnel | Medium | Medium | Medium | P3 (needs existing platform eval) |

---

## Dependencies

```
GAP-15 (Idea Funnel) ──→ GAP-1 (Unified Intake) ──→ GAP-16 (Deal-Killer) ──→ GAP-9 (Completeness Gate) ──→ GAP-3 (Progressive Forms)
                                                  └──→ GAP-8 (Exception Routing)
GAP-11 (3-Pathway) ──→ subsumes GAP-5 (VPP Fast-Track)
                    └──→ GAP-6 (AI Fast-Track) ──→ Requires org AI risk posture decision (external dependency)
GAP-12 (Security Baseline) ──→ Requires baseline controls definition (external: Architecture Security Lead)
GAP-13 (Time-Bound Approval) ──→ GAP-12 (needs risk categorization to define condition types)
GAP-14 (Ownership Assignment) ──→ standalone (no blockers, quick win)
GAP-10 (Workload Dashboard) ──→ Requires Camunda Optimize / C8 migration (platform dependency)
GAP-17 (NDA Gate) ──→ GAP-1 (needs request classification to determine NDA type)
GAP-18 (Concierge) ──→ GAP-9 (Completeness Gate) + GAP-7 (Status Visibility) — concierge owns both
GAP-19 (Simultaneous Engagement) ──→ GAP-18 (concierge coordinates DART formation)
GAP-20 (Contract Automation) ──→ standalone (no process blockers, but needs CLM platform evaluation)
GAP-21 (OneTrust Integration) ──→ GAP-12 (Security Baseline) — OneTrust risk scores feed security assessment routing
                               └──→ Requires OneTrust module licensing decisions (external: TPRM Lead)
GAP-22 (Distributed Pod Model) ──→ GAP-19 (Simultaneous Engagement) + GAP-18 (Concierge role for cross-pod coordination)
GAP-23 (AI Questionnaire) ──→ GAP-6 (AI Fast-Track) — consolidated form is prerequisite for AI pathway
GAP-24 (Async Governance) ──→ standalone (process change, no technology dependency)
```

---

## Cross-Cutting Themes (10-Perspective Analysis)

Five themes emerged from analyzing the gap inventory across 10 analytical perspectives (bottleneck analysis, stakeholder pain points, regulatory compliance, automation potential, organizational readiness, data flow integrity, SLA achievability, risk management coverage, technology integration, and process maturity).

### 1. Security Staffing Is the Binding Constraint

Every optimization initiative ultimately bottlenecks at security review capacity. GAP-12 (tiered assessment) is the highest-leverage single change because it reduces the volume of requests requiring manual security review by routing low-risk items through automated baseline checks. Without this, faster intake (GAP-1) and parallel engagement (GAP-19) simply move the queue from one bottleneck to another.

### 2. The Governance Facilitator Role Is the Linchpin

Architecture's existing Governance Facilitator role (GAP-18) is the most successful process pattern observed across all stakeholder sessions. This role pre-screens artifacts, removes incomplete items, and serves as single point of contact. Scaling this pattern to the full onboarding process — as a "Concierge" or "Quarterback" — would address GAP-7 (visibility), GAP-9 (completeness), and the coordination failures that cause most delays.

### 3. Proportionality Is Missing Everywhere

The current process applies the same rigor to a no-cost vendor affinity tool as to a $2M platform build. GAP-11 (3-pathway routing), GAP-12 (tiered security), GAP-17 (NDA gating), and GAP-20 (contract complexity routing) all address the same root cause: lack of proportional effort based on risk and investment level.

### 4. Measurement Is the Prerequisite for Everything

Multiple gaps (GAP-10, GAP-7, GAP-20) cannot be addressed without baseline metrics. You cannot prove the process improved if you never measured how long it takes today. ServiceNow data exists but is not being mined. Establishing measurement infrastructure in the first 30 days (before any technology changes) is critical.

### 5. Ownership Gaps Cause Process Failures

Requests stall not because of process design flaws but because no one owns the end-to-end outcome (GAP-18), no one owns the technology asset after onboarding (GAP-14), and no one owns the security baseline definition (GAP-12). Every structural process change must include explicit ownership assignment.

---

*Created: 2026-03-06 | Sources: 14 stakeholder sessions + committee inventory + intake forms analysis + 10-perspective analysis | Next review: After OneTrust module licensing decision*
