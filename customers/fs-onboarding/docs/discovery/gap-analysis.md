# Gap Analysis — Current State vs. BPMN Model

Derived from 9 stakeholder sessions (Feb-Mar 2026) mapped against `onboarding-to-be-ideal-state-v5.bpmn`.

---

## Summary

The v5 BPMN model addresses most structural needs. The primary gaps are in **intake consolidation**, **form usability**, **prioritization formalization**, **completeness quality gates**, **3-pathway routing** (Buy/Build/Vendor Affinity), **security baseline definition**, **time-bound risk acceptance**, **ownership tracking**, and **pre-onboarding idea funnel**.

---

## Gap Detail

### GAP-1: Unified Intake Gateway (SP1)

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

## Priority Matrix

| Gap | Business Impact | BPMN Complexity | Stakeholder Urgency | Recommended Priority |
|-----|----------------|-----------------|---------------------|---------------------|
| GAP-1 Unified Intake | High | Medium | Critical | P1 |
| GAP-2 Prioritization | High | Medium | Critical | P1 |
| GAP-7 Status Visibility | High | Low | Critical | P1 |
| GAP-9 Completeness Gate | High | Low | Critical | P1 |
| GAP-11 3-Pathway Routing | High | High | Critical | P1 (fundamental model change) |
| GAP-16 Deal-Killer Pre-Screen | High | Low-Medium | High | P1 (quick win) |
| GAP-3 Progressive Forms | Medium | Low | High | P2 |
| GAP-4 Finance Rework | Medium | Low | High | P2 |
| GAP-6 AI Fast-Track | High | High | Critical | P2 (needs risk posture decision first) |
| GAP-10 Workload Dashboard | High | Low (metadata) | High | P2 (platform dependency) |
| GAP-12 Security Baseline | High | Medium | High | P2 (needs baseline definition) |
| GAP-13 Time-Bound Approval | Medium | Medium | High | P2 |
| GAP-14 Ownership Assignment | High | Low | High | P2 (quick win) |
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
```

---

*Created: 2026-03-05 | Sources: 9 stakeholder sessions + committee inventory + intake forms analysis | Next review: After Finance Manager interview*
