# Implementation Roadmap — FS-Onboarding Process Optimization

## Executive Summary

The current vendor onboarding process takes 6-9 months end-to-end. Competitor benchmarks indicate 60-90 days is achievable for standard pathways. This roadmap provides a phased 30/60/90/120-day plan to close the gap identified in 14 stakeholder sessions and the 10-perspective analysis documented in `gap-analysis.md`.

**Critical constraint**: The first 30 days must deliver improvements with **no new technology**. The organization has change fatigue, and technology introductions without process clarity will fail. Process changes first, automation second.

**Target outcomes**:
- Enable pathway: 30 days end-to-end (from 6-9 months)
- Buy pathway: 16-20 weeks initially (from 6-9 months), with path to 60-90 days
- Build pathway: Proportional to SDLC scope (no artificial process overhead)

---

## Prerequisites

### Step Zero: Executive Sponsorship

This plan is dead without an executive sponsor who has authority across Business, IT, Legal, Compliance, and Vendor Management. The sponsor must:
- Authorize the process owner role (GAP-18)
- Mandate parallel committee engagement as policy (GAP-19)
- Own the "no-go list" publication (GAP-16)
- Resolve organizational conflicts when pods disagree (GAP-22)

**Recommended sponsor level**: SVP or CTO with dotted-line authority over all participating functions.

### Transition Rule: In-Flight vs. New Requests

- **335 in-flight items** continue on the current process to completion
- **New requests only** enter the optimized process
- No migration of in-flight items — the cost of context-switching exceeds the benefit
- In-flight items provide baseline measurement data (how long did they actually take?)

---

## Days 1-30: CONSOLIDATE (No Technology)

**Theme**: Fix what you can with policy, people, and paper. Establish measurement. Build credibility before asking for technology investment.

### Priority Actions

| # | Action | Owner | GAP Ref | Success Metric |
|---|--------|-------|---------|----------------|
| 1 | **Name an E2E process owner ("Quarterback")** — Single accountable person for every request from intake to go-live. Model on Architecture's Governance Facilitator. | Executive Sponsor | GAP-18 | Role filled, RACI published |
| 2 | **Publish the no-go list** — Curated list of blocked vendors, AI models, and data residency configurations. Distribute to all intake channels. | Enterprise Risk Mgmt + Security | GAP-16 | List published, intake teams trained |
| 3 | **Declare parallel committee engagement as policy** — Executive mandate that all review committees (DART members) engage simultaneously, not sequentially. No more "wait for security before starting legal." | Executive Sponsor | GAP-19 | Policy memo issued, meeting cadence updated |
| 4 | **Paper-based tiered security pre-screen** — One-page decision tree: if request meets criteria A/B/C, route to automated baseline only. Criteria defined by Architecture Security Lead. | Security Director | GAP-12 | Decision tree published, pilot with 5 requests |
| 5 | **Baseline ServiceNow data** — Extract cycle time, queue time, and throughput metrics from existing ServiceNow tickets. Establish current-state measurements before any changes. | Process Owner | GAP-10 | Baseline report with median/P90 cycle times per phase |
| 6 | **AI backlog triage blitz** — Dedicated 2-day effort to classify all pending AI requests using the published no-go list and tiered security pre-screen. Clear the backlog of obviously blocked or fast-trackable items. | AI Governance Lead | GAP-23, GAP-6 | Backlog reduced by 40%+, clear disposition for each item |

### Deferred to Days 31-60

The following items were considered for Days 1-30 but require technology enablement or organizational changes that cannot be completed in 30 days:

1. Camunda 8 form deployment (needs environment setup)
2. OneTrust API integration (needs module licensing decision)
3. OB-DMN-5 deployment (needs Zeebe runtime)
4. Contract template automation (needs CLM evaluation)
5. Consolidated AI questionnaire form (needs questionnaire audit)
6. Email-based async voting system (needs technical implementation)
7. ServiceNow-to-Camunda intake bridge (needs integration development)
8. Formal SLA timer deployment (needs Camunda 8 runtime)
9. Pod-based routing automation (needs organizational design)
10. CMDB integration for ownership tracking (needs API development)
11. Status notification automation (needs Camunda 8 runtime)
12. Progressive form deployment (needs form field audit completion)

---

## Days 31-60: AUTOMATE QUICK WINS

**Theme**: Deploy the v7-c8 BPMN model with Camunda 8. Automate the process changes proven in Days 1-30. Start closing technology gaps.

### Deferred Process Items (from Days 1-30)

| # | Action | Owner | GAP Ref | Success Metric |
|---|--------|-------|---------|----------------|
| 1 | **Deploy v7-c8 BPMN to Camunda 8** — Enable pathway routing, 3-pathway gateway, prioritization scoring all go live. | Platform Team | GAP-1, 2, 11 | Model deployed, first request processed |
| 2 | **Deploy OB-DMN-5 prioritization scoring** — Replace "horse trading" with quantitative ranking. | Governance Lane | GAP-2 | DMN deployed, scores visible in Tasklist |
| 3 | **Wire OB-DMN-6 into SP3** — Connect existing security assessment level DMN to evaluation routing. | Security + Platform | GAP-12 | Baseline requests auto-routed to automated checks |
| 4 | **Deploy consolidated AI questionnaire** — Single form replacing 3+ overlapping questionnaires. | AI Governance | GAP-23 | One form in production, old forms deprecated |
| 5 | **Implement async voting for Business Council** — Email-based 48-hour voting with auto-abstention. | Process Owner | GAP-24 | First approval completed via async vote |
| 6 | **Deploy status notification send tasks** — Automated requestor notifications at phase transitions. | Automation Lane | GAP-7 | Requestors receive status updates automatically |
| 7 | **Extend NDA gate to all pathways** — Task_ExecuteNDA required before SP3 for Buy and Enable paths. | Legal + Process Owner | GAP-17 | NDA compliance rate = 100% for new requests |
| 8 | **Deploy progressive intake forms** — SP1 minimum fields, SP2 incremental, SP3 domain-specific. | Platform Team | GAP-3 | No duplicate questions across forms |

### Technology Enablement

| # | Action | Owner | GAP Ref | Success Metric |
|---|--------|-------|---------|----------------|
| 9 | **Camunda 8 Optimize dashboard** — Cycle time, queue depth, throughput per lane. | Platform Team | GAP-10 | Dashboard live with real-time data |
| 10 | **ServiceNow intake bridge** — API integration to route ServiceNow tickets into Camunda process. | Integration Team | GAP-1 | ServiceNow tickets auto-create process instances |
| 11 | **OneTrust module licensing decision** — Determine which modules (Assessment Automation, TPRM, Deviation Tracking) to license. | TPRM Lead (Shane) | GAP-21 | Decision documented, procurement initiated |
| 12 | **Contract template library** — Catalog standard terms, identify top 10 deviation patterns. | Legal + Contracting | GAP-20 | Template library published, deviation patterns documented |
| 13 | **CMDB ownership fields** — Add Business Owner, Technical Owner, Support Owner fields to asset register. | IT Operations | GAP-14 | Fields available, populated for new onboardings |

### Research

| # | Action | Owner | GAP Ref | Success Metric |
|---|--------|-------|---------|----------------|
| 14 | **CLM platform evaluation** — Assess contract lifecycle management platforms for GAP-20 automation. | Contracting + Procurement | GAP-20 | Shortlist of 2-3 platforms with POC plan |

---

## Days 61-90: OPTIMIZE

**Theme**: Refine based on 60 days of data. Implement the structural changes that require organizational coordination. Launch the Enable pathway as a fully automated fast-track.

| # | Action | Owner | GAP Ref | Success Metric |
|---|--------|-------|---------|----------------|
| 1 | **Finance rework loop in SP4** — Coding matrix correction without full process restart. | Finance + Process Owner | GAP-4 | Rework cycle time < 2 days (vs. full restart) |
| 2 | **Time-bound conditional approval** — "Approved with Conditions" pathway with monitoring timer. | Governance + Compliance | GAP-13 | First conditional approval processed with auto-escalation |
| 3 | **AI fast-track pathway** — Dedicated pathway for AI tools: AI Review + Security only, 2-week target. | AI Governance + Security | GAP-6 | AI pathway deployed, first request completed in < 3 weeks |
| 4 | **Enable pathway live** — Full end-to-end Enable pathway operational with 30-day SLA enforcement. | Process Owner | GAP-11 | Enable requests completing in < 30 days |
| 5 | **OneTrust integration (Phase 1)** — Assessment Automation module connected to SP3 via Zeebe service tasks. | Integration Team + TPRM | GAP-21 | Assessments created/retrieved via API, no duplicate data entry |
| 6 | **Exception routing rapid assessment** — SP_RapidRiskAssessment sub-process for office-specific exceptions. | Risk + Process Owner | GAP-8 | Exception requests resolved in < 3 days |
| 7 | **Contract auto-generation** — Service task pre-populates standard terms from template library. | Contracting + Platform | GAP-20 | Standard contracts generated in < 1 hour (vs. 3-5 days) |
| 8 | **Completeness quality gate** — AI-assisted pre-screening rejects incomplete submissions at intake. | Automation Lane + Process Owner | GAP-9 | Incomplete submission rate drops 50% |

---

## Days 91-120: SCALE

**Theme**: Extend optimizations across the portfolio. Formalize roles and governance. Measure everything.

| # | Action | Owner | GAP Ref | Success Metric |
|---|--------|-------|---------|----------------|
| 1 | **Measurement dashboard v2** — Compare Day 1 baseline to Day 120 actuals. Publish to leadership. | Process Owner | GAP-10 | Dashboard with trend lines, published monthly |
| 2 | **Vendor feedback integration** — Vendor-side process satisfaction survey at SP5 completion. | Vendor Mgmt | Cross-cutting | Survey deployed, feedback loop to process improvement |
| 3 | **Formalize Concierge role** — Job description, KPIs, reporting structure for E2E process owner. | Executive Sponsor + HR | GAP-18 | Role formalized, headcount approved |
| 4 | **Distributed pod pilot** — Cyber and Architecture pods operate independently with central coordination. | Governance + Pod Leads | GAP-22 | 2 pods operational, SLA compliance maintained |
| 5 | **OneTrust integration (Phase 2)** — TPRM module for vendor due diligence, deviation tracking. | Integration Team + TPRM | GAP-21 | Vendor DD managed in OneTrust, results feed Camunda |
| 6 | **Pre-onboarding idea funnel pilot** — Connect existing feedback platform to intake process. | Product Management | GAP-15 | Ideas with N+ upvotes auto-generate intake requests |
| 7 | **Process mining baseline** — Camunda Optimize process mining on 120 days of data. Identify actual vs. modeled paths. | Process Owner + Platform | Cross-cutting | Process mining report with conformance analysis |

---

## Critical Challenges

| # | Challenge | Risk | Mitigation |
|---|-----------|------|------------|
| 1 | **Executive sponsor not secured** | Fatal — plan cannot execute without cross-functional authority | Escalate immediately; present cost of inaction (6-9 month cycle time vs. competitor 60-90 days) |
| 2 | **Security team capacity** | High — security review is the binding constraint; faster intake without more security capacity moves the bottleneck | GAP-12 tiered assessment is the #1 priority; automate baseline checks to reduce manual review volume by 40-60% |
| 3 | **Change fatigue** | High — teams have seen multiple improvement initiatives; "wait and see" attitude | Days 1-30 deliberately avoids technology; demonstrate value with policy changes first |
| 4 | **335 in-flight items** | Medium — dual-process operation during transition creates confusion | Hard cutoff: new requests only on new process; in-flight items complete on current process |
| 5 | **OneTrust licensing uncertainty** | Medium — integration timeline depends on procurement decisions | Days 31-60 focuses on licensing decision; technical integration in Days 61-90 |
| 6 | **Organizational resistance to Concierge role** | Medium — lanes may resist central coordination as "bureaucracy" | Frame as enabler (removes blockers) not gatekeeper; model on Architecture's proven Governance Facilitator |
| 7 | **Measurement infrastructure gaps** | Medium — cannot prove improvement without baseline data | Day 1-30 priority: baseline ServiceNow data before any process changes |

---

## Honest Timeline Assessment

### Bottom-Up Task Time (Enable Pathway)

| Phase | Task Time | Queue Time (Current) | Queue Time (Target) |
|-------|-----------|---------------------|-------------------|
| Intake + Classification | 1 day | 5-10 days | 1 day |
| Planning + Routing | 2 days | 5-15 days | 2 days |
| Evaluation (reduced scope) | 5 days | 10-20 days | 5 days |
| Contracting (streamlined) | 3 days | 10-30 days | 3 days |
| UAT + Go-Live | 2 days | 5-10 days | 2 days |
| **Total** | **~13 days** | **35-85 days** | **~13 days** |

The gap between task time and elapsed time is almost entirely **queue time** — requests sitting in inboxes waiting for the next reviewer. Eliminating queue time (through parallel engagement, concierge follow-up, and SLA enforcement) is the highest-leverage intervention.

### Realistic Expectations

- **Enable pathway (30 days)**: Achievable in 8-12 weeks IF queue time is eliminated through parallel engagement (GAP-19) and concierge coordination (GAP-18). The 30-day target is task-time feasible but requires organizational discipline.
- **Buy pathway (16-20 weeks)**: Realistic initial target. Full security review, legal negotiation, and contracting cannot be compressed below this without accepting risk. Path to 60-90 days requires tiered security (GAP-12) and contract automation (GAP-20).
- **Build pathway**: Timeline is dominated by SDLC scope, not process overhead. Focus on removing process overhead from the non-SDLC phases.

### What "Done" Looks Like at Day 120

The process is not "fixed" at Day 120. It is **measurable, owned, and continuously improving**. The foundation — tiered assessment, parallel engagement, proportional rigor, single ownership — enables ongoing optimization. The 60-90 day competitor benchmark is a 6-12 month target, not a 120-day target.

---

## Measurement Dashboard

| Metric | Baseline (Day 1) | Day 30 Target | Day 60 Target | Day 120 Target |
|--------|-------------------|---------------|---------------|----------------|
| E2E cycle time (Enable) | 6-9 months | N/A (not yet live) | 45 days | 30 days |
| E2E cycle time (Buy) | 6-9 months | Measured | 20 weeks | 16 weeks |
| Intake-to-triage time | Unknown | Measured | 3 days | 1 day |
| Queue time (% of total) | Unknown | Measured | < 50% | < 30% |
| Incomplete submission rate | Unknown | Measured | -25% | -50% |
| Security review backlog | Unknown | Measured | -20% | -40% |
| Requests blocked at no-go list | 0 | 5+ per month | Tracked | Tracked |
| Parallel engagement rate | 0% (sequential) | Policy issued | 50% | 80% |
| Status visibility (requestor) | None | Manual updates | Automated | Automated + dashboard |
| Contract generation time | 3-5 days | Measured | 2 days | < 1 day (standard) |
| AI request cycle time | 6-9 months | Backlog triaged | 6 weeks | 3 weeks |
| Process owner coverage | 0% | 100% (role filled) | 100% | 100% (formalized) |

---

*Created: 2026-03-06 | Source: 14 stakeholder sessions, 10-perspective analysis, gap-analysis.md (24 gaps) | Owner: Process Optimization Team*
