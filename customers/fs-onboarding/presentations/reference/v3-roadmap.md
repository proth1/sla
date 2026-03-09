# v3-Roadmap: Software Onboarding Transformation

**Version**: 3.0 | **Date**: 2026-03-06
**Source**: v2-roadmap + 5 deep-dive sessions (Mar 5-6, 2026) with Product, Architecture, TPRM, Security Architecture, and Vendor Management
**Total Discovery**: 14 stakeholder sessions, 35+ interviews, 16 gaps (updated), 6 new enhancement themes

---

## What Changed Since v2

v2 was built on the original 9 sessions (Feb 2026). The 5 additional deep-dives surfaced:

| New Insight | Source | Impact |
|-------------|--------|--------|
| Governance Facilitator as concierge model | Architecture Lead | New cross-cutting recommendation |
| Simultaneous engagement (not sequential DART) | Architecture Lead | Restructures SP2/SP3 approach |
| Distributed pod model for domain teams | Vendor Mgmt Lead | New organizational design recommendation |
| 3 request types (Defined Need, Forced Updates, Speculative) | Vendor Mgmt Lead | Expands intake routing beyond Buy/Build/Enable |
| Enable (Vendor Affinity) pathway with full detail | Product Manager | Refines GAP-11 3-pathway model |
| Contract negotiation crisis (2 people, 30+/month) | TPRM Lead | Elevates contract automation to P1 |
| System landscape mapped (ServiceNow, Ariba, OneTrust, Oracle) | TPRM Lead | New integration architecture slide |
| RAE 28-29 days actual vs 14-day target | TPRM Lead | Quantifies intake bottleneck |
| DD: 830 questions, 75 days internal (down from 144) | TPRM Lead | Calibrates SLA targets |
| Security as primary 2-week SLA driver | Architecture Lead | Focuses Day 30 on security capacity |
| NDA as mandatory first step (disputed across org) | Security Architect | New process gate in SP1 |
| AI questionnaire proliferation (3 extra forms "snuck up") | TPRM Lead | Strengthens AI consolidation case |
| 335 assessments/year, team of 8 | TPRM Lead | Staffing model data |
| Competitor benchmark: 60-90 days E2E | TPRM Lead | External benchmark for targets |
| "Whoever screams loudest" prioritization | Security Architect | Validates GAP-2 urgency |
| Tool decay: locked forms, passwords unknown | Vendor Mgmt Lead | Validates GAP-3 urgency |
| Shift-left / mini-RFP endorsed enthusiastically | TPRM Lead | Validates GAP-15/16 approach |
| OneTrust integration opportunity | TPRM Lead + discovery doc | New integration architecture |

---

## v3 Presentation Structure (Proposed: 48 slides)

### New Slides (vs. v2's 39)

| # | New Slide | Rationale |
|---|-----------|-----------|
| 2a | **System Landscape & Integration Gaps** | Maps ServiceNow, Ariba, OneTrust, Oracle, Confluence/Catfox, JIRA -- shows data silos and manual handoffs. Critical context missing from v2. |
| 2b | **Quantified Pain: By the Numbers** | Hard metrics from TPRM/Architecture: 335 assessments/yr, 28-day RAE (2x target), 75-day DD, 2-person contract team handling 30+/month, 2-week security SLA, competitor 60-90 day benchmark. Replaces anecdotal evidence with data. |
| 3a | **Process Quarterback / Concierge Model** | Architecture's Governance Facilitator role as template for E2E orchestration. Pre-screening, artifact quality gates, follow-up management. This was the strongest "what good looks like" signal across all interviews. |
| 3b | **Simultaneous Engagement Model** | Replace sequential DART formation with parallel engagement of all review streams. Architecture Lead's explicit recommendation. Directly addresses the "present the same thing over and over" problem. |
| 3c | **Distributed Pod Model** | Vendor Mgmt Lead's vision: domain-specific pods controlling their own prioritization, meeting cadence, and workflow speed. Central team ensures consistency. |
| 5a | **Intake: 3 Request Types** | Defined Need with Vendor Selected / Forced Updates (re-evaluation) / Speculative-Exploratory. v2 only distinguished Buy/Build. This changes intake routing logic. |
| 11a | **TPRM: OneTrust Integration Architecture** | How OneTrust Assessment Automation and TPRM module integrate with Camunda 8 at SP3 evaluation and vendor DD touchpoints. Zeebe service task pattern. |
| 11b | **TPRM: Contract Automation Priority** | Dedicated slide for the "dumpster fire" -- 2 people negotiating 30+ contracts/month. Contract deviation tracking, OneTrust control gap documentation, automation roadmap. |
| 38a | **Staffing & Resource Model** | Cross-functional staffing gaps with data: Risk/DD (8 for 335/yr), Legal (2 for 30+/mo), Architecture (2-3, recently reduced), Vendor Mgmt (1 part-time). Required to justify automation investment. |

---

## Enhanced Topic Content

### Topic 1: Intake (Slides 5-7)

**v2 content**: Unified intake, completeness gate, deal-killer pre-screen, progressive forms.

**v3 additions**:
- **3 request types routing**: Defined Need (standard path), Forced Updates (re-evaluation path -- existing vendor, product change, EOL, new AI capabilities), Speculative/Exploratory (idea funnel, not designed for current process). Update OB-DMN-2 to accept `requestType` as input.
- **NDA gate**: After initial triage, before detailed evaluation. Security Architect and Legal align on early NDA. Add `Task_NDAExecution` as gateway between SP1 and SP3.
- **Informal channel absorption**: Email, feedback platform monitoring, "send feedback" submissions, advisor tool approval requests -- all must route through unified intake. Document the informal-to-formal handoff.
- **Tool decay evidence**: Financial business case form shows 2024 in 2026, form locked with unknown password, owner left org. Use as concrete justification for form modernization.
- **Layered forms insight**: Forms submitted at different stages (idea intake via START, capacity requests via EA/Cyber forms, governance forms, compliance forms). Progressive form strategy must account for stage-specific fields, not just topic-specific.

**Updated roadmap**:
- Day 30: Add NDA timing decision, map 3 request types, document informal channels
- Day 60: Deploy unified form with request type routing, NDA gate active
- Day 90: Progressive forms with stage awareness, informal channel redirect complete
- Day 120: Measure: form completion %, request type distribution, NDA cycle time

### Topic 2: Prioritization (Slides 8-10)

**v2 content**: Scoring formula, OB-DMN-5, queue position visibility.

**v3 additions**:
- **"Whoever screams loudest" quote** (Security Architect): No effective prioritization exists. EVP support pushes reviews down. Validates urgency of formal scoring.
- **Capacity management / PI planning interaction** (Product Manager): Exception requests displace roadmap work. Capacity Manager has authority to say no. Scoring must account for capacity impact.
- **Acceleration hypothesis** (Product Manager): "If the general pace of onboarding is accelerated, then we could theoretically handle one-off cases with more capacity." Core insight: fixing standard path frees capacity for exceptions. Use as executive messaging.
- **Business Council quorum issues** (Vendor Mgmt): Monthly meetings, 2-3 of 8-10 members attend. Evolved to email voting. Recommend async decision model with SLA timers.

**Updated roadmap**:
- Day 30: Add capacity impact to scoring formula, document Business Council quorum fix, draft async decision rules
- Day 60: Async voting deployed for routine decisions, queue position visible
- Day 90: Capacity-aware routing (route around constrained teams), acceleration metrics baseline
- Day 120: Measure: queue wait time, capacity utilization, Business Council decision cycle time

### Topic 3: Funding / Finance (Slides 11-13)

**v2 content**: Progressive financial fields, FP&A routing, finance rework loop.

**v3 additions**:
- **Enable pathway skips funding validation** (Product Manager): Vendor Affinity tools require no org funding but process still requires funding validation. Creates unnecessary friction. Must explicitly bypass financial analysis for Enable path.
- **Coding matrix correction loop**: Already in v2 (GAP-4), now reinforced by Architecture's JIRA-based artifact approval pattern.

**Updated roadmap**: Minimal changes -- add Enable pathway bypass at Day 90.

### Topic 4: Sourcing / Evaluation (Slides 14-16)

**v2 content**: 18 committees mapped to 5 streams, parallel evaluation, vendor DD.

**v3 additions**:
- **ARB + SDRB artifact framework** (Architecture Lead): HLD required for ALL acquisitions (pre-contract). Then either SD/SYDD (single domain) or PSS (cross-enterprise, most AI products). Document artifact requirements per pathway.
- **Governance Facilitator model** (Architecture Lead): Pre-screens all designs, removes incomplete artifacts from agenda, captures action items, runs ARB and SDRB. "If any artifact is not in good order, remove it from the agenda." Template for E2E concierge.
- **Simultaneous engagement** (Architecture Lead): "When a request comes in... simultaneous engagement of all the major players that have a vote." Eliminates sequential bottlenecks. Architecture explicitly disagrees with TBC's proposed sequential model.
- **Catfox/Confluence approval automation** (Architecture Lead): Approval system already automated via Catfox plugin. Integration point for Camunda.
- **DART formation burden** (Architecture Lead + Security Architect): Requester independently contacts each team, submits separate intake requests, no visibility into sequence or timing. "It's completely on the onus of the requester." Concierge model eliminates this.
- **Domain-based auto-assignment** (Architecture Lead): 4 EA leaders oversee domains. Tickets assigned to domain leader, who assigns architect by bandwidth. Automate this in OB-DMN-2.

**Updated roadmap**:
- Day 30: Document ARB/SDRB/TBC scope boundaries, define simultaneous engagement rules, draft concierge role description
- Day 60: Pilot simultaneous engagement on new requests, Catfox integration assessment, domain-based auto-assignment rules in OB-DMN-2
- Day 90: 5 parallel streams operational with concierge orchestration, artifact quality gate (Governance Facilitator model)
- Day 120: Measure: DART formation time (target: automated), evaluation cycle time, requester satisfaction

### Topic 5: Cybersecurity (Slides 17-19)

**v2 content**: 3-tier control hierarchy, tiered assessment, conditional approval.

**v3 additions**:
- **"Security is our biggest bottleneck"** (Architecture Lead): Understaffed security architecture team. "Enterprise architecture would be able to get our SLA way down" without security constraints. Escalated to leadership.
- **"I need three of me"** (Security Architect): Specifically for AI reviews. Company growing rapidly, cannot scale current process.
- **Risk-based acceleration categories** (Security Architect): Local software (lower scrutiny), platform-based (full documentation), previously approved domains (fast-track), updates to existing platforms (streamlined), module additions (streamlined). Map these to DMN assessment routing.
- **NDA timing disagreement**: Security and Legal align on early NDA. Others disagree. Resolution needed at Day 30 executive alignment.
- **Multiple vendor contacts for AI** (Security Architect): Vendors contacted 3x (technology risk, cybersecurity, TPRM). Teams discussing consolidation. Strengthens AI governance consolidation case.
- **Zero automation**: All routing manual, no workflow integration, dependency on individual knowledge.
- **Technical debt cycle** (Security Architect): "Can't improve due to lack of resources, buy tools to help, need resources to support new tools, half-implemented solutions, cycle continues."

**Updated roadmap**:
- Day 30: Define risk-based assessment categories (6 types from Security Architect), resolve NDA timing with executive decision, map security capacity constraints
- Day 60: Automated baseline checks for low-risk categories, tiered assessment DMN deployed, NDA gate active
- Day 90: Security team only handles Elevated/Major assessments, AI vendor contact consolidated to single stream
- Day 120: Measure: security review cycle time by tier, baseline automation rate, AI review queue depth

### Topic 6: Enterprise Architecture (Slides 20-22)

**v2 content**: Buy-path checklist, integration governance, parallel review.

**v3 additions**:
- **ARB 2-week SLA, SDRB same-day** (Architecture Lead): Well-prepared teams get faster reviews. First-time presentations and new capabilities are slower. Use preparation quality as SLA input.
- **AI tools already in use** (Architecture Lead): Cursor AI for diagram generation, custom AI agent for pattern conformance scanning. Validate and integrate these into the process model.
- **Domain-based funding model** (Architecture Lead): Architects funded by domains. Under-funding = capacity bottleneck. "If they want us to pursue all of that work, they need to fund us appropriately." Recommend resource model visibility.
- **Cross-enterprise items need special handling** (Architecture Lead): Items that span multiple domains don't fit the domain-assignment model cleanly.

**Updated roadmap**:
- Day 30: Document ARB/SDRB SLAs, assess AI tools for integration, map domain-based assignment rules
- Day 60: AI-assisted pre-screening pilot (pattern conformance), domain auto-assignment in OB-DMN-2
- Day 90: ARB preparation quality gate (reject incomplete artifacts), SDRB fast-track for pre-approved patterns
- Day 120: Measure: ARB cycle time, preparation rejection rate, AI pre-screening accuracy

### Topic 7: Compliance (Slides 23-25)

**v2 content**: Phase-boundary gates, 3-tier review structure, regulatory traceability.

**v3 additions**:
- **OneTrust as compliance evidence platform** (TPRM Lead): Assessment evidence automatically captured. Control gaps documented in OneTrust. Regulatory alignment for OCC 2023-17, NIST CSF 2.0, DORA, SOX.
- **Contract deviation tracking** (TPRM Lead): Deviations recorded in OneTrust, risk acceptance or remediation plans documented. Currently manual and not reportable.

**Updated roadmap**:
- Day 60: OneTrust compliance evidence mapping
- Day 90: Automated compliance audit trail via OneTrust integration
- Day 120: Regulatory traceability dashboard with OneTrust data feed

### Topic 8: AI Governance (Slides 26-28)

**v2 content**: AI risk posture, no-go list, fast-track, committee consolidation.

**v3 additions**:
- **Working Committee + Decision Committee redundancy** (Product Manager): "Somewhat redundant with TBC process." Two sequential committees where one would suffice.
- **3x vendor contact** (Security Architect): Technology risk, cybersecurity, and TPRM each independently contact vendors for AI questions. Creates redundancy and vendor frustration.
- **AI questionnaire proliferation** (TPRM Lead): 3 additional AI-specific questionnaires "snuck up." "I have no idea why they're there." Working with AI security team to merge into single dataset.
- **EU AI Act / regulatory acceleration**: AI regulatory landscape "ever-changing, different every other day." Need standardization framework that absorbs regulatory change without process overhaul.

**Updated roadmap**:
- Day 30: Merge 3 AI questionnaires into single dataset (TPRM Lead already in progress), map Working + Decision Committee to single stream, inventory all AI vendor contact points
- Day 60: Single AI questionnaire deployed, AI committee consolidation communicated, single vendor contact point defined
- Day 90: AI fast-track pathway piloted with consolidated review, EU AI Act mapping to DMN tables
- Day 120: Measure: AI review cycle time (target 2 weeks), vendor contact reduction (3x to 1x), AI questionnaire completion rate

### Topic 9: Privacy (Slides 29-31)

**v2 content**: Data classification, privacy-by-design, cross-border assessment.

**v3 additions**:
- **Privacy SME involvement documented** (stakeholder interviews): Privacy already participates in vendor risk sessions. Integration point with OneTrust privacy module.
- No major structural changes from new transcripts.

### Topic 10: Commercial Counsel (Slides 32-34)

**v2 content**: Contract lifecycle, negotiation bottleneck, standard templates.

**v3 additions**:
- **Contract negotiation up to 1.5 years** (TPRM Lead): Specifically for security exhibits. Extreme outlier that demonstrates the crisis.
- **"Dumpster fire #1"** (TPRM Lead): 2 people negotiating 30+ contracts monthly. 4 years unsustainable. No reportable format for contract deviations. Unknown compliance status for older contracts. "That team desperately needs automation."
- **Sourcing reality** (TPRM Lead): "Our sourcing department doesn't source, they manage contract lifecycle." Reframe the function.

**Updated roadmap**:
- Day 30: Quantify contract backlog, map deviation tracking requirements, define automation criteria
- Day 60: Contract template standardization, OneTrust deviation tracking pilot
- Day 90: Automated contract review for standard terms, deviation reporting operational
- Day 120: Measure: contract cycle time, deviation tracking coverage, manual review reduction

### Topic 11: TPRM (Slides 35-37)

**v2 content**: Risk assessment lifecycle, tiered DD, vendor monitoring.

**v3 additions**:
- **Full system landscape** (TPRM Lead): ServiceNow (START intake) -> Ariba (registration, NDAs, contracts) -> OneTrust (risk assessments, tracking, control gaps) -> Oracle (AP). API connections between Ariba and Oracle. Manual PDF transfers between others.
- **RAE process detail** (TPRM Lead): 80-question internal questionnaire assigns inherent risk tier, determines DD level. Actual: 28-29 days (2x the 14-day target).
- **Due diligence detail** (TPRM Lead): 830-question vendor questionnaire with skip logic. Vendor completion avg 30 days. Internal review 75 days (down from 144 in 2019).
- **Ownership structure** (TPRM Lead): Business Owner (executes agreement) vs Vendor Owner (manages relationship). Dual ownership model needs clear accountability.
- **Shift-left strategy endorsed** (TPRM Lead): Mini-RFP tools for business users, standard questions available upfront, risk-based self-service. "That's a fantastic idea that should be in the slides."
- **OneTrust integration** (discovery doc): Zeebe service tasks for assessment creation/retrieval, receive tasks for vendor questionnaire completion, process variable mapping for risk scores.
- **Competitor benchmark** (TPRM Lead): Less mature competitors achieving 60-90 days E2E. Sets external reference point.

**Updated roadmap**:
- Day 30: Map OneTrust API integration points, define shift-left question inventory, baseline RAE and DD metrics
- Day 60: OneTrust-Camunda integration design, shift-left mini-RFP pilot, RAE target path to 14 days
- Day 90: OneTrust assessment automation live in SP3, DD skip logic optimized, vendor portal for questionnaire submission
- Day 120: Measure: RAE cycle time (target 14 days), DD cycle time, OneTrust automation rate, shift-left adoption

---

## New Cross-Cutting Slides

### Slide 2a: System Landscape & Integration Gaps

**Content**:

| System | Function | Integration Status |
|--------|----------|-------------------|
| ServiceNow | START process intake | Entry point, no downstream integration |
| Ariba | Registration, NDAs, contracts | API to Oracle only |
| OneTrust | Risk assessments, tracking, control gaps | Standalone, manual PDF exports |
| Oracle | Accounts payable | API from Ariba |
| Confluence + Catfox | Architecture approvals | Plugin-based, no workflow integration |
| JIRA | Architecture ticket tracking | Per-team, no cross-functional view |
| Camunda 8 (target) | E2E process orchestration | Not yet deployed |

Visual: Integration map showing current manual handoffs (red dashed lines) vs. target automated flows (green solid lines).

### Slide 2b: Quantified Pain -- By the Numbers

| Metric | Value | Context |
|--------|-------|---------|
| Annual assessments | 335 | 8-person DD team |
| RAE target | 14 days | Actual: 28-29 days (2x) |
| DD internal review | 75 days | Down from 144 days (2019) |
| Contract negotiation team | 2 people | Handling 30+ contracts/month |
| Security exhibit negotiations | Up to 1.5 years | Extreme outlier |
| Business Council quorum | 2-3 of 8-10 | Monthly meetings, email voting workaround |
| Competitor E2E benchmark | 60-90 days | Less mature processes |
| Committees | 18 | Mapped to 5 proposed streams |
| Intake channels | 5+ | ServiceNow, AI forms, Power Apps, email, feedback platform |
| Request volume (9 months) | Available from ServiceNow | Not yet analyzed |

### Slide 3a: Process Quarterback / Concierge Model

Based on Architecture's Governance Facilitator:

**What they do today (Architecture only)**:
- Pre-screen all design artifacts
- Remove incomplete items from agenda
- Capture action items, manage follow-ups
- Run ARB and SDRB
- JIRA integration for tracking

**Proposed E2E extension**:
- Single point of contact for requesters (eliminates 5-6 team self-navigation)
- Automated DART formation (replaces requester burden)
- Quality gates at each phase boundary (reject incomplete before wasting SME time)
- Status visibility and proactive notifications
- Cross-functional escalation authority

Quote: "Exactly like what we're talking about for the quarterback from a broader end-to-end" -- Consulting Team

### Slide 3b: Simultaneous Engagement Model

**Current state (sequential)**:
```
TBC approval -> Requester contacts Architecture -> wait ->
Requester contacts Security -> wait ->
Requester contacts Compliance -> wait -> ...
```
Timeline: Weeks to months. Dependent on requester initiative.

**Target state (simultaneous)**:
```
TBC approval -> Concierge triggers parallel:
  Architecture + Security + Compliance + AI Gov + Legal
All streams receive request data simultaneously.
First stream done doesn't block others.
```
Timeline: Bounded by slowest stream SLA. No requester burden.

Quote: "I disagree with that because that makes us a bottleneck... there should be simultaneous engagement of all the major players that have a vote" -- Architecture Lead

### Slide 3c: Distributed Pod Model

Vendor Management Lead's organizational design:

| Pod | Controls | Central Team Ensures |
|-----|----------|---------------------|
| Cybersecurity Pod | Prioritization, meeting frequency, review speed | Consistent SLA framework |
| Architecture Pod | Technical review cadence, domain assignment | Artifact standards |
| Legal/Contracts Pod | Contract template usage, negotiation approach | Risk appetite alignment |
| AI Governance Pod | AI risk posture, review depth | Regulatory compliance |
| TPRM Pod | Assessment methodology, vendor scoring | Cross-pod visibility |

Benefits: Domain-specific prioritization, flexible cadence, faster decisions, reduced resource competition.

### Slide 5a: 3 Request Types

| Type | Description | Process Path | Frequency |
|------|-------------|-------------|-----------|
| **Defined Need** | Business owner knows requirements, has vendor selected | Standard 5-phase | Most common |
| **Forced Update** | Existing vendor, product changes (on-prem to SaaS, EOL, new AI capabilities) | Re-evaluation path (skip intake, start at SP3) | Growing |
| **Speculative / Exploratory** | Advisory support, no sponsorship, generating interest | Idea funnel (pre-SP1), NOT standard process | Frequent, currently clogs pipeline |

Current process treats all three identically. v3 routes them differently.

### Slide 11a: OneTrust Integration Architecture

```
Camunda 8 (SP3 parallel split)
  -> Zeebe Service Task: Create OneTrust Assessment
  -> OneTrust: Assessor completes risk questionnaire (RAE)
  -> Zeebe Service Task: Retrieve Assessment Results
  -> Process variables: riskScore, riskTier, complianceFindings[]
  -> DMN routing continues based on assessment output
```

Integration points:
1. SP3 Risk Assessment (OneTrust Assessment Automation)
2. SP3 Vendor Due Diligence (OneTrust TPRM module)
3. SP4 Contract deviation tracking (OneTrust control gaps)

Auth: OAuth2 (client_id/secret), tenant-specific hostname.

### Slide 11b: Contract Automation Priority

The crisis:
- 2 people handling 30+ contracts/month
- Manual review, 4 years unsustainable
- No reportable format for contract deviations
- Unknown compliance status for older contracts
- Negotiation up to 1.5 years for security exhibits

Solution path:
- Day 30: Contract template standardization, deviation criteria definition
- Day 60: OneTrust deviation tracking pilot, automated standard-terms review
- Day 90: Contract review automation for routine agreements
- Day 120: Full deviation reporting, compliance status for legacy contracts

### Slide 38a: Staffing & Resource Model

| Function | Current Staffing | Workload | Gap |
|----------|-----------------|----------|-----|
| Risk/DD team | 8 people | 335 assessments/year | At capacity -- doubled output while cutting timeline |
| Legal/Contracts | 2 people | 30+ contracts/month | Critical -- "dumpster fire" |
| Architecture | 2-3 people | Recently reduced | Funding-constrained by domains |
| Security Architecture | ~1 person for AI | "Need three of me" | Cannot scale for AI review volume |
| Vendor Management | 6 total, 2 at 50% onboarding | Full process facilitation | No formal allocation |
| Technology Vendor Mgmt | 1 person part-time | Full START process | Inadequate for scope |

Key quote: "If we want this to really click... I can't have the architect review group being a critical portion with only two people" -- TPRM Lead

---

## Updated Master Roadmap (30/60/90/120 Days)

### Day 30: Foundation & Alignment

**Process Design**:
- Map all intake fields across 5+ channels and deduplicate
- Define 3 request types (Defined Need, Forced Updates, Speculative) and routing rules
- Document NDA timing decision (Security + Legal vs. others)
- Map 18 committees to 5 parallel streams with scope boundaries
- Draft concierge/quarterback role description (based on Architecture Facilitator model)
- Define simultaneous engagement rules (who gets notified, what data they receive)
- Draft deal-killer no-go list (AI models, vendor blockers)

**Standards & Scoring**:
- Prioritization scoring formula with capacity impact weighting
- 3-tier security control hierarchy (Baseline/Elevated/Major)
- 6 risk-based assessment categories (local install, platform, hybrid, pre-approved, update, module addition)
- Vendor Affinity/Enable pathway criteria
- Business Council async decision rules

**Data & Integration**:
- Baseline RAE metrics (28-29 days actual vs 14-day target)
- Baseline DD metrics (75 days internal, 30 days vendor)
- Quantify contract backlog
- Map OneTrust API integration points
- Assess Catfox/Confluence integration potential
- Request ServiceNow data (9 months of volume, categorization, timelines)

**Organizational**:
- Present discovery findings + v3 roadmap to executive sponsors
- Resolve NDA timing with executive decision
- Confirm committee consolidation approach
- Assign owners to every Day 60 deliverable with named accountability
- Begin AI questionnaire merger (TPRM Lead already in progress)

**Deliverable**: Executive readout with data-backed recommendations, updated gap priority matrix, named owners for all Day 60 items.

### Day 60: Quick Wins & First Deployments

**Process Deployments**:
- Unified intake form with request type routing (3 types)
- Completeness quality gate at intake (GAP-9)
- Deal-killer pre-screen active (GAP-16)
- NDA gate between SP1 and SP3
- Status notifications at phase boundaries (GAP-7)
- Prioritization scoring deployed in SP2 (OB-DMN-5)
- Queue position visible to requestors
- Async voting for routine Business Council decisions

**AI Governance**:
- Single AI questionnaire deployed (merged from 3+)
- AI committee consolidation communicated
- Single vendor contact point for AI reviews defined

**Integration**:
- OneTrust-Camunda integration design complete
- Contract template standardization
- OneTrust deviation tracking pilot

**Organizational**:
- Pilot simultaneous engagement on new requests
- Concierge role staffed or assigned
- Domain-based auto-assignment rules drafted (OB-DMN-2)

**Deliverable**: First measurable cycle time reduction. Unified intake live. Completeness gate catching incomplete submissions before they reach SME teams.

### Day 90: Parallel Operations & Automation

**Process Deployments**:
- 3-pathway routing live: Buy / Build / Enable (GAP-11)
- OB-DMN-2 updated with Enable pathway + request type + domain routing
- 5 parallel evaluation streams fully operational with SLA timers
- Concierge orchestration active (automated DART formation)
- Finance rework loop in SP4 (GAP-4)
- Enable pathway financial bypass active
- Tiered security assessment in SP3 (Baseline automated, Elevated/Major manual)
- AI fast-track pathway piloted
- Conditional approval with monitoring in SP5 (GAP-13)

**Integration**:
- OneTrust assessment automation live in SP3
- DD skip logic optimized (830-question questionnaire)
- Automated baseline security checks (service tasks)
- AI-assisted pre-screening pilot (pattern conformance from Architecture)

**Organizational**:
- Distributed pod model structure defined
- Capacity-aware routing (route around constrained teams)
- Informal intake channels fully redirected to unified entry

**Deliverable**: Parallel evaluation dramatically reducing sequential bottlenecks. Enable pathway processing Vendor Affinity requests in target 30 days. Security team only handling Elevated/Major assessments.

### Day 120: Full Operation & Measurement

**Process Deployments**:
- Exception routing to rapid risk assessment (GAP-8)
- Pre-onboarding idea funnel for speculative requests (GAP-15)
- Workload visibility dashboard (Camunda Optimize)
- Ownership assignment mandatory at onboarding (GAP-14)
- Progressive form strategy with stage awareness (GAP-3)
- Contract review automation for standard terms
- Full deviation reporting with compliance status

**Measurement Dashboard**:

| Metric | Baseline (Current) | Day 120 Target |
|--------|-------------------|----------------|
| E2E cycle time (standard) | 6-9 months | 60-90 days |
| E2E cycle time (Enable) | Same as standard | 30 days |
| E2E cycle time (AI fast-track) | Same as standard | 14 days |
| RAE completion | 28-29 days | 14 days |
| DD internal review | 75 days | 30 days |
| Security review (Baseline) | 2 weeks | Same-day (automated) |
| Form completion rate | Unknown | 90%+ first-pass |
| Intake rejection (deal-killer) | 0% (no pre-screen) | Measured |
| Contract cycle time | Varies (up to 1.5yr) | 90 days standard |
| Business Council decision | Monthly + email | 48-hour async SLA |
| Requester satisfaction | Unmeasured | NPS baseline established |
| Queue transparency | None | Real-time dashboard |

**Organizational**:
- Distributed pod model operational
- Annual ownership validation process active
- Executive reporting on backlog health, capacity, and throughput
- Before/after metrics documented for executive review

**Deliverable**: Full operational model with data-driven proof of improvement. Competitor-benchmarked cycle times. Resource model justified by throughput data.

---

## Gap Priority Matrix (Updated for v3)

| Gap | v2 Priority | v3 Priority | Change Reason |
|-----|------------|------------|---------------|
| GAP-1 Unified Intake | P1 | P1 | Reinforced by 3 request types, informal channels |
| GAP-2 Prioritization | P1 | P1 | Reinforced by "whoever screams loudest," capacity mgmt |
| GAP-7 Status Visibility | P1 | P1 | Reinforced by DART formation burden |
| GAP-9 Completeness Gate | P1 | P1 | Reinforced by Architecture Facilitator pre-screening |
| GAP-11 3-Pathway | P1 | P1 | Enable pathway fully detailed by Product Manager |
| GAP-16 Deal-Killer | P1 | P1 | Reinforced by Security Architect risk categories |
| GAP-3 Progressive Forms | P2 | P2 | Now includes stage-awareness (layered forms insight) |
| GAP-4 Finance Rework | P2 | P2 | Unchanged |
| GAP-6 AI Fast-Track | P2 | P1-P2 | Elevated: AI questionnaire merger already in progress |
| GAP-10 Workload Dashboard | P2 | P2 | Reinforced by staffing data |
| GAP-12 Security Baseline | P2 | P1-P2 | Elevated: 6 risk categories defined by Security Architect |
| GAP-13 Time-Bound Approval | P2 | P2 | Unchanged |
| GAP-14 Ownership | P2 | P2 | Reinforced by dual ownership model (Business/Vendor Owner) |
| GAP-5 VPP Fast-Track | P3 | Merged | Subsumed into GAP-11 Enable pathway |
| GAP-8 Exception Routing | P3 | P3 | Reinforced by 3 request types (Speculative path) |
| GAP-15 Idea Funnel | P3 | P3 | Reinforced by Speculative request type |

### New Gaps (v3)

| Gap | Description | Priority | Source |
|-----|-------------|----------|--------|
| GAP-17 | NDA Gate (mandatory NDA before detailed evaluation) | P1 | Security Architect |
| GAP-18 | Concierge/Quarterback Role (E2E process orchestration) | P1 | Architecture Lead |
| GAP-19 | Simultaneous Engagement (parallel DART, not sequential) | P1 | Architecture Lead |
| GAP-20 | Contract Automation (2 people, 30+/month crisis) | P1 | TPRM Lead |
| GAP-21 | OneTrust Integration (assessment + TPRM + deviation tracking) | P2 | TPRM Lead |
| GAP-22 | Distributed Pod Model (domain-specific pods) | P2 | Vendor Mgmt Lead |
| GAP-23 | AI Questionnaire Consolidation (3 extra forms to 1) | P1 | TPRM Lead |
| GAP-24 | Async Governance Decisions (Business Council quorum fix) | P2 | Vendor Mgmt Lead |

---

## Implementation Notes

### Presentation Build

The v3 HTML presentation should:
1. Use the same brand template as the current `docs/presentations/index.html`
2. Add 9 new slides (48 total vs v2's 39)
3. Update all 11 topic sections with new evidence and quotes
4. Include the quantified metrics slide early (slide 2b) for executive impact
5. Update the master roadmap (slide 3) with v3 content
6. Update the TOC nav and slide counter

### Key Quotes to Feature

| Quote | Source | Slide |
|-------|--------|-------|
| "Security is our biggest bottleneck" | Architecture Lead | Cyber |
| "I need three of me right now" | Security Architect | Cyber |
| "That team desperately needs automation" | TPRM Lead | Commercial Counsel |
| "I can understand 100% why requesters are frustrated" | Architecture Lead | Sourcing |
| "Whoever screams loudest gets priority" | Security Architect | Prioritization |
| "That's a fantastic idea that should be in the slides" | TPRM Lead | TPRM (shift-left) |
| "Somebody needs to be empowered to say I own this" | TPRM Lead | Cross-cutting |
| "The process never solved the step of requester who's never been through onboarding" | Vendor Mgmt Lead | Intake |
| "If any artifact is not in good order, remove it from the agenda" | Architecture Lead | Sourcing |
| "Simultaneous engagement of all the major players that have a vote" | Architecture Lead | Sourcing |

---

*v3-roadmap.md | Created: 2026-03-06 | Sources: v2-roadmap + 5 deep-dive sessions (Mar 5-6)*
