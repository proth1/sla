# Stakeholder Discovery Notes — Software Onboarding

Source: 9 stakeholder sessions (Feb-Mar 2026)

---

## Stakeholders Interviewed

| Date | Stakeholder | Role | Focus Area |
|------|-------------|------|------------|
| 2026-02-10 | Business Analyst, Operations Manager, Business Lead, Strategy Lead, Advisor Business Representative | Cross-functional workshop | Third-party risk roles, audience/use case gaps, auto-approval, feedback tools |
| 2026-02-11 | Procurement Lead, Operations Director, Legal Director, Business Analyst, Accounting Manager, Process Consultant | Cross-functional workshop | Pain points, intake, transparency, solutions framework |
| 2026-02-11 | Senior Product Leader, TBC Manager (Process Owner), Transformation Lead, Documentation Specialist, Technical Lead | Discovery session | Acquisition 2.0, governance resistance, requirements volatility, review overlap |
| 2026-02-11 | Product Director, Process Manager, Governance Specialist, Implementation Lead | Vendor management deep dive | Governance, prioritization, AI urgency |
| 2026-02-17 | Finance Representative | Finance deep dive | Finance sign-off, procurement routing |
| 2026-02-12 | AI Security Lead, Security Director, Architecture Security Lead, AI Governance Lead, Vendor Risk Lead, Process Owner | AI governance & security deep dive | Multiple intake streams, secure by design, ownership gaps, time-bound risk acceptance |
| 2026-02-13 | Product Manager 1, Product Director | Product team deep dive | Vendor affinity model, 3-pathway categorization, DART process, feedback management, integration complexity |
| 2026-02-17 | Vendor Risk Lead, AI Governance Lead, Privacy SME, Business Representative, Consulting Lead | Vendor risk & AI governance | REA form, legal bottlenecks, committee proliferation, pathway differentiation |
| 2026-03-05 | Product Lead | Product interview | End-to-end process, intake, capacity |

---

## Current-State Process Summary

### Measured Performance

- **End-to-end duration**: 6-9 months
- **Contracting alone**: 2-3 months (per Process Manager)
- **Rapid risk assessment target**: 3 days (actual: often months)
- **Due diligence completion time**: reduced by 105% over five years (per Vendor Risk Lead)
- **AI governance queue**: 60+ items (per AI Governance Lead)
- **Legal capacity**: 2 partners handling all vendor contracts

### Acquisition 2.0 Initiative

Operational for ~1 year (per TBC Manager). Created to address late discovery of missing stakeholder engagement:
- Brings all required teams together at the beginning
- Ensures upfront information distribution to all teams
- Enables collective go/no-go at first tollgate
- Deeper engagement only after initial approval
- Acknowledged as time-consuming but necessary

### Entry Points (Fragmented)

| Channel | System | Owner | Notes |
|---------|--------|-------|-------|
| TBC Software Acquisition Intake | ServiceNow | TBC Core Team | Primary formal channel |
| Risk Evaluation Assessment (REA) | ~80 question form | Vendor Risk Lead | Collaborative (sourcing, legal, infosec, compliance, privacy); frequently completed incorrectly |
| AI Use Case Intake | Separate form | AI Product Manager | "I want to use AI to do xyz" |
| AI Governance Intake | Separate form | AI Governance Lead | May overlap with AI use case form; involves 3 separate committees |
| Rapid Risk Assessment | Power Apps | Risk Assessment Manager | Exception handling, not designed for onboarding |
| Email/Chat | Unstructured | Central feedback repo | Informal, no tracking |

**Pre-intake activity**: Process sometimes begins before formal intake (e.g., contractor-related questions). Suggestion to route to technology partner or EA role (Technical Lead).

### TBC Workflow (Current Formal Path)

1. Complete Problem Statement Template
2. Submit ServiceNow Intake Form
3. TBC Core Team creates Jira ticket
4. Core Team reviews in regular meetings
5. Approved requests transfer to Software Acquisition Board
6. Acquisition Chair determines review level
7. Confirmation email within 3 business days
8. DART (Discovery and Review Team) formation
9. Recurring DART meetings with requestor
10. Discovery phase (capabilities, features, research)

**Compliance note**: Not all requests follow this path (per Product Lead).

### Supporting Forms During DART

- Enterprise Architecture assessment
- Cybersecurity evaluation
- AI Governance (when applicable)

---

## Pain Points by Theme

### 1. Fragmented Intake (Maps to: SP1 Request & Triage)

| Pain Point | Reported By | Severity |
|------------|-------------|----------|
| 5+ entry points with no unified routing | Product Lead, Operations Director | Critical |
| RAF for third-party risk disconnected from technology onboarding | Operations Director | Critical |
| Business partners submit same information to multiple teams | Operations Director | Critical |
| Business partners often bypass sourcing, arriving with pre-selected vendors | Vendor Risk Lead | Critical |
| Technology teams especially prone to bypassing standard processes | Vendor Risk Lead | High |
| Multiple groups run independent programs at their own pace, seeking fastest path | AI Security Lead | Critical |
| Teams lack visibility into company strategy; unable to determine true priorities | AI Security Lead | High |
| Unclear if adding models to existing packages constitutes new use cases | AI Security Lead | High |
| AI requests require 2 separate forms at different stages | Product Lead | High |
| Rapid risk assessment used as onboarding workaround | Product Lead | High |
| Risk Assessment Form (RAF) frequently filled out incorrectly | Legal Director | High |
| ServiceNow form compliance is inconsistent | Product Lead | Medium |
| Email channel is unstructured with no tracking | Product Lead | Medium |
| Multiple business cases submitted on a single form | Legal Director | Medium |

**BPMN Implication**: SP1 must consolidate all channels into a single intake gateway with dynamic routing based on request type (standard, AI, exception).

### 2. Form Redundancy and Usability (Maps to: SP1-SP3)

| Pain Point | Reported By | Severity |
|------------|-------------|----------|
| REA form has ~80 questions; business partners frequently can't complete accurately | Vendor Risk Lead | Critical |
| Forms require multi-disciplinary expertise rarely possessed by one person | Business Analyst | Critical |
| Questions asked from writer's perspective, not user's | Business Analyst | High |
| Business case justification required multiple times | Product Lead | High |
| Multiple intake forms with overlapping questions | Product Lead | High |
| Many REA questions could be answered through proper sourcing events (data hosting, storage, transmission) | Vendor Risk Lead | High |
| Creating multiple business cases for different forms — no value-add from repetition | Technical Lead | High |
| One long static form creates bottleneck | Product Director | High |
| Unclear language creates interpretation issues across forms (risk, AI, architecture, cyber) | Business Analyst | High |
| Users unsure who to ask for help with forms | Business Analyst | High |
| Even experienced users struggle with forms | Legal Director | High |
| Users skip questions they don't understand, causing downstream delays | Legal Director | High |
| 75% form completion would be a significant improvement over current state | Legal Director | Medium |
| AI-related requests add complexity with evolving guidance | Legal Director | Medium |

**Stakeholder Preference**: Dynamic, adaptive intake where responses trigger follow-up questions only when needed (Product Director). Start with minimum viable fields, evolve over time (Process Manager). Plain language guidance, reference guides, and examples (Process Consultant, workshop consensus).

**BPMN Implication**: Forms should be progressive — SP1 captures minimum viable data, subsequent phases request only incremental information. Quality gates before routing should prevent incomplete submissions from reaching review teams.

### 3. Prioritization Gap (Maps to: SP2 Planning & Routing, Governance Topic #2)

| Pain Point | Reported By | Severity |
|------------|-------------|----------|
| No formal prioritization standard or formula | Process Manager | Critical |
| No clear force-ranking mechanism across the enterprise | Workshop consensus | Critical |
| Auto-approval for low-risk items not supported — all requests follow same heavyweight process | Operations Manager | High |
| Each requestor views their request as most important | Product Director, Procurement Lead | High |
| Competing initiatives across organization with no arbitration | Procurement Lead | High |
| Teams "horse trade" internally before involving Legal | Process Manager | High |
| Requestors unaware of their place in queue | Workshop consensus | High |
| No clear de-prioritization guidelines for exception cases | Product Lead | Medium |
| No centralized prioritization committee | Product Lead | Medium |

**Stakeholder Position**: Prioritization can be partially driven by scoring intake form responses (Governance Specialist). Must be explicitly owned by one team (Governance Specialist). Standards must be defined upfront (Process Manager). Need high-level prioritization guidance with support to set appropriate expectations (workshop).

**BPMN Implication**: DMN table OB-DMN-2 (Pathway Routing) should incorporate prioritization scoring. A formal prioritization task is needed in SP2 before pathway routing.

### 4. Process Visibility and Transparency (Maps to: Cross-cutting)

| Pain Point | Reported By | Severity |
|------------|-------------|----------|
| Requestors cannot see request status | Product Lead | Critical |
| No centralized tracking system | Product Lead | Critical |
| Limited visibility into other business units' workloads | Operations Director | Critical |
| Teams operate in silos with tunnel vision | Operations Director | High |
| Legal teams working on 50+ agreements simultaneously without visibility | Operations Director | High |
| Status inquiries require individual outreach | Product Lead | High |
| Delays often stem from incomplete information, not reviewer bottlenecks — but metrics don't reflect this | Process Consultant | High |

**Stakeholder Position**: Portfolio view would enable better work distribution and empathy for resource constraints (Operations Director). Digitized process with holistic queue visibility, metrics for underwater teams, and data to support hiring decisions (Process Consultant). SLA/KPI tracking must use nuanced alerts that accurately reflect root causes (workshop).

**BPMN Implication**: Automation lane tasks should emit status events at phase transitions. Notification tasks at phase boundaries support the cross-lane notification pattern. Decision logs with rationale needed for audit trail.

### 5. Finance Workflow Friction (Maps to: SP4 Contracting & Build, Governance Topic #3)

| Pain Point | Reported By | Severity |
|------------|-------------|----------|
| Cannot reroute coding matrix issues to FP&A — must email outside system | Finance Representative | High |
| Formal denial sends request back to beginning of process | Finance Representative | Critical |
| Cannot make minor cosmetic corrections (dates, alignment) independently | Finance Representative | High |
| Vendor partnership products require no funding but funding validation still required | Product Lead | Medium |

**BPMN Implication**: SP4 needs an internal rework loop for minor corrections (not full process restart). The "Vendor Partnership" pathway should bypass funding validation entirely.

### 6. Capacity and Resource Constraints (Maps to: Cross-cutting)

| Pain Point | Reported By | Severity |
|------------|-------------|----------|
| Exception requests create unanticipated product team workload | Product Lead | High |
| SME commitment challenges slow review periods | Product Lead | High |
| Rapid risk assessments consume capacity meant for standard onboarding | Product Lead | High |
| PI planning allocates capacity on roadmap; unplanned work disrupts velocity | Product Lead | Medium |

**Stakeholder Position**: Capacity Manager controls team priorities and can approve/deny unplanned requests. Accelerating overall onboarding would increase capacity for one-off cases (Product Lead).

### 7. Resource Bottlenecks and Legal Constraints (Maps to: SP4-SP5, Cross-cutting)

| Pain Point | Reported By | Severity |
|------------|-------------|----------|
| Only 2 legal partners handling all vendor contracts | Vendor Risk Lead | Critical |
| Contract lifecycle management system requested for 5-6 years without funding | Vendor Risk Lead | Critical |
| Architecture review group recently reduced | Vendor Risk Lead | High |
| Sourcing team must make quasi-legal decisions due to legal bottleneck | Vendor Risk Lead | High |
| Solutions often underutilized after purchase — multi-million dollar tools used for 1/3 of capabilities | Vendor Risk Lead | High |
| No clear ownership structure for managing solutions post-purchase | Vendor Risk Lead | High |
| FP&A process cumbersome and hard to navigate | Vendor Risk Lead | Medium |

**Stakeholder Position**: Process improvements alone may not solve resource issues (Vendor Risk Lead). Proposed: white-glove project management with dedicated resources to guide requests through gates and support infrequent users (once every 2-3 years).

**BPMN Implication**: Automation lane should include guided navigation / concierge service tasks. Post-onboarding utilization tracking (SP5 or post-onboarding process) needed.

### 8. Committee Proliferation and Sequential Reviews (Maps to: SP3 Evaluation & DD)

| Pain Point | Reported By | Severity |
|------------|-------------|----------|
| Same use case presented to multiple committees sequentially | Business Representative | Critical |
| Committee meetings can be 5+ weeks apart | Business Representative | Critical |
| AI process involves 3 separate committees | Business Representative | High |
| Some committee meetings have 30-40 invitees | Business Representative | High |
| Goal to "try to remove meetings" — reduce committee overhead through process consolidation | Operations Manager | High |
| 18+ committees/reviews identified across the onboarding lifecycle (see Committee Inventory below) | Workshop (2/10) | Critical |
| TBC business case asks questions already covered by financial review | Technical Lead | High |
| Architecture teams assessing financials (outside expertise) | Technical Lead | High |
| Financial teams assessing architecture (outside expertise) | Technical Lead | High |
| No standardized definition of a complete business case | Technical Lead | Medium |

**Stakeholder Position**: Need dynamic approval process — combine reviews or have cross-functional representation (Consulting Lead). Opportunity for concurrent reviews where appropriate (workshop consensus).

**BPMN Implication**: SP3 parallel fan-out pattern (already modeled) directly addresses this. The 5 parallel evaluation branches should replace sequential committee reviews. Cross-functional representation reduces committee count.

### 9. Ownership, Role Clarity, and Governance Resistance (Maps to: Cross-cutting)

| Pain Point | Reported By | Severity |
|------------|-------------|----------|
| Unclear who defines requirements vs. who evaluates/approves | Technical Lead | High |
| Some roles define requirements, others exist solely for approval/rejection | Technical Lead | High |
| New stakeholders frequently enter mid-process, forcing requirement updates | Technical Lead | High |
| Requirements treated as static when they should be dynamic | Technical Lead | High |
| Staffing constraints across teams pose challenges for governance changes | Discovery session | High |
| If even one team opts out of consolidated governance, the model fails | Discovery session | Critical |
| Teams may resist consolidating committees and standardized processes | Discovery session | High |

**Stakeholder Position**: Resistance is inevitable but must be documented to identify root causes and inform remediation (discovery session). Full buy-in essential. Align with ongoing financial transformation and Enterprise Program Management Office (TBC Manager).

**BPMN Implication**: RACI matrix (already documented in governance-topic-mapping.md) must be enforced at the process level. `camunda:candidateGroups` assignments should match RACI ownership, not ad-hoc committee membership.

### 10. AI Governance Complexity (Maps to: Governance Topic #8, SP3)

| Pain Point | Reported By | Severity |
|------------|-------------|----------|
| Overly restrictive AI addendum causes extended vendor negotiations | AI Governance Lead | Critical |
| External firms frequently push back on AI terms | AI Governance Lead | High |
| Different teams have varying risk acceptance thresholds for AI | Privacy SME | High |
| No consistent standard for what requires AI escalation | Privacy SME | High |
| Multiple tools submitted for same function — no alignment with AI strategy | AI Governance Lead | High |
| 60+ items in AI governance queue | AI Governance Lead | High |
| Need to communicate non-starter models/vendors early to prevent wasted effort | Business Representative | High |
| Business risk VP approval required for standard term deviations | Privacy SME | Medium |

**Stakeholder Position**: Working with outside firm to redefine AI stipulations (AI Governance Lead). Chief AI and Data Officer owns overall AI strategy — need alignment (AI Governance Lead). Enterprise Risk Management developing decision matrix for red/green light determinations (Vendor Risk Lead).

**BPMN Implication**: SP1 should include an early "deal-killer" check — a no-go vendor/model list integrated into intake classification (DMN-driven). AI governance review in SP3 needs pathway differentiation: predefined scenarios get streamlined approval, complex cases get full review.

### 11. Pathway Differentiation Complexity (Maps to: OB-DMN-2, Top-level routing)

| Pain Point | Reported By | Severity |
|------------|-------------|----------|
| Home Office vs. Regional Office vs. Independent Contractor vs. Employee vs. Partner Institution tools all require different approval paths | AI Governance Lead | High |
| Within each pathway, different use cases (POCs vs. production) need different treatment | AI Governance Lead | High |
| Single vendor relationship spanning 10+ business units — each with different requirements and approval paths | Business Lead | High |
| 1,200+ institutions requiring documentation and compliance tracking across pathways | Strategy Lead | High |
| Audience/use case gaps: independent contractors, employees, home office, institutions all have distinct onboarding needs | Advisor Business Representative | High |
| Staff changes drive vendor preference changes — creates churn | Consulting Lead | Medium |
| Need to make existing tools visible to prevent duplicate purchases | Consulting Lead | Medium |

**Stakeholder Position**: Will be a complicated matrix — automation in intake crucial (Consulting Lead). May start simple and evolve. Need management and maintenance plan for pathway rules.

**BPMN Implication**: OB-DMN-2 (Pathway Routing) needs significant expansion — inputs should include: tool category (Home Office/Regional/Contractor/Employee/Partner), use case type (POC/Production), and existing tool availability. This is the most complex DMN table change.

### 12. Security Baseline and "Secure by Design" Gap (Maps to: SP3 Evaluation & DD, Governance Topic #5)

| Pain Point | Reported By | Severity |
|------------|-------------|----------|
| No defined "secure by design" standard at the organization | Security Director | Critical |
| Teams don't know minimum security controls; enforcement is "fairly loose" | Architecture Security Lead | Critical |
| Only a fraction of systems covered by identity management | AI Security Lead | High |
| End-of-year compliance failures common; PII found in uncontrolled systems | AI Security Lead | High |
| Security tools also contain AI — circular dependency for approvals | AI Security Lead | High |
| AI technologies still in formation; no public standards for securing new tech | AI Security Lead | High |
| MCP technology didn't exist 18 months ago — new tech requires new baselines | AI Security Lead | Medium |

**Stakeholder Position**: Need control hierarchy — baseline controls (minimum), elevated risks above baseline, major risks require escalation (AI Governance Lead). Cyber team developing baseline standards. Mix of predefined and dynamic assessment needed.

**BPMN Implication**: SP3 `Task_SecurityAssessment` needs tiered security checklists driven by DMN risk classification. Baseline controls should be automated checks (Automation lane); elevated/major risks route to manual security review.

### 13. Time-Bound Risk Acceptance (Maps to: SP3-SP4, Cross-cutting)

| Pain Point | Reported By | Severity |
|------------|-------------|----------|
| Company wants product by Q2 but security controls not ready until Q3 | AI Security Lead | High |
| Need clear process for time-bound risk acceptance with mitigation plans | AI Security Lead | High |
| Insufficient discovery time — teams execute without understanding what they're walking into | AI Security Lead | Critical |

**Stakeholder Position**: Can accept risk temporarily with mitigation plan, but need formal process (AI Security Lead). Not conducive for a publicly traded company to accelerate without controls.

**BPMN Implication**: New pattern needed — conditional approval with time-bound boundary timer event. `Task_FinalApproval` (SP5) should support "Approved with Conditions" outcome that triggers a monitoring sub-process with expiration timer.

### 14. Technology/Application Ownership Gap (Maps to: Cross-cutting, Post-Onboarding)

| Pain Point | Reported By | Severity |
|------------|-------------|----------|
| No authoritative source for app/technology ownership | Security Director | Critical |
| Incomplete CMDB — unclear who owns support, requirements, lifecycle | Security Director | Critical |
| Requesting team often different from maintaining team | AI Security Lead | High |
| Requirements given to teams that can't implement them | AI Security Lead | High |
| Tech owner identification less rigorous than business owner identification | Vendor Risk Lead | High |
| Significant manual maintenance required for ownership tracking | Vendor Risk Lead | Medium |

**Stakeholder Position**: Third-party risk team identifies business owners (team of 6), but tech ownership tracking is weak. Separate governance document needed (Security Director).

**BPMN Implication**: SP5 `Task_OnboardSoftware` must include mandatory ownership assignment (business owner + technical owner). Post-onboarding process should validate ownership annually.

### 15. Process Maturity Paradox (Maps to: Strategic)

| Pain Point | Reported By | Severity |
|------------|-------------|----------|
| "Building a new process while formulating our process" — parallel process development | AI Security Lead | High |
| Multiple teams building processes simultaneously, all in formation | AI Security Lead | High |
| Misalignment of strategy at high level — corporate strategy decides resources but doesn't converge with cyber/AI strategy | AI Governance Lead | High |
| Control Tower capacity management 6 weeks in, rocky start | Process Owner | Medium |

**Key Quote** (AI Security Lead): *"We are in parallel building... You're looking at building a new process while we're actually formulating our process."*

**BPMN Implication**: Process model must be designed for iterative refinement — modular sub-processes that can be updated independently. Supports the phased implementation approach.

### 16. Rework and Trip Wires (Maps to: SP3-SP4)

| Pain Point | Reported By | Severity |
|------------|-------------|----------|
| AI, offshoring, and subcontracting requirements often create rework | Procurement Lead | Critical |
| Moving quickly without complete information causes revisiting "settled" issues | Procurement Lead | Critical |
| Business users don't understand requirements; approval teams say requestors don't know what they're asking for | Process Consultant | High |
| Information trickles through various processes instead of arriving complete upfront | Legal Director | High |

**Stakeholder Position**: Clear stage gates with defined requirements at each step (Process Consultant). Quality gates before routing to prevent incomplete submissions from reaching review teams. "Defense layer" before reaching SME reviewers (workshop consensus).

**BPMN Implication**: Quality gate pattern at phase boundaries (already in standards) must enforce minimum completeness before allowing phase transition. SP1 `Task_InitialTriage` should validate completeness, not just classify.

### 17. Documentation Burden (Maps to: SP1-SP5)

| Pain Point | Reported By | Severity |
|------------|-------------|----------|
| Significant documentation effort required throughout lifecycle, not just intake | Documentation Specialist | High |
| Includes coding matrices, summary documents — time-intensive for multiple teams | Documentation Specialist | High |

**BPMN Implication**: Automation lane service tasks should auto-generate documentation artifacts from structured form data rather than requiring manual creation.

### 18. Post-Onboarding Utilization (Maps to: Post-Onboarding / SP5)

| Pain Point | Reported By | Severity |
|------------|-------------|----------|
| Multi-million dollar tools used for only 1/3 of capabilities | Vendor Risk Lead | High |
| No clear ownership for managing solutions after purchase | Vendor Risk Lead | High |
| Lack of resources for proper implementation | Vendor Risk Lead | Medium |

**BPMN Implication**: `post-onboarding-summary.bpmn` should include utilization review tasks and ownership assignment. Maps to the existing post-onboarding process model.

### 19. Technology Enablement (Maps to: Automation Lane)

| Pain Point | Reported By | Severity |
|------------|-------------|----------|
| Need contract lifecycle management system | Legal Director | High |
| Technology solutions needed to offset staffing limitations | Legal Director | High |
| Long-standing funding challenges prevent tool acquisition | Legal Director | Medium |

**Stakeholder Preference**: End-to-end workflow platform with automated routing and notifications (workshop). AI-supported capabilities: pre-screening for completeness, summarization, intelligent assistance (workshop).

**BPMN Implication**: Automation lane tasks should include AI-assisted pre-screening at intake and automated routing based on DMN classification.

### 20. Risk Posture and AI Urgency (Maps to: Governance Topics #8 AI, Strategic)

| Pain Point | Reported By | Severity |
|------------|-------------|----------|
| AI tools perceived as taking too long to deliver | Product Director | Critical |
| Stakeholders planning for 2026+ want AI-first solutions | Product Director | Critical |
| Organization's risk posture toward AI is unclear | Process Manager | High |
| Risk and Legal teams have operated the same way for years | Product Director | High |
| "Crawl, walk, run" messaging rejected — clear target state needed | Product Director | High |

**Stakeholder Position**: AI should be treated as the first use case with planned expansion afterward (Product Director). Right stakeholders must be empowered to accelerate decisions (Process Manager). Workstreams should move in parallel even during RFP (Implementation Lead).

**BPMN Implication**: Fast-track pathway for AI tools with pre-approved risk posture. Parallel execution pattern in SP3 (already modeled) supports concurrent workstreams.

---

## Vendor Partnership Program

A distinct program that may require pathway differentiation in the BPMN model:

| Characteristic | Detail |
|----------------|--------|
| Model | External stakeholders as independent businesses |
| Technology | Stakeholders manage their own tech stacks |
| Vendor List | Curated with contractual relationships |
| Licensing | Direct between vendor and stakeholder |
| Revenue | Revenue sharing or negotiated discounts |
| Org Cost | No license costs, no development required |
| Ecosystem | Not closed — other tools allowed if compliant |

**BPMN Implication**: Vendor partnership products should route through a streamlined pathway that skips funding validation and reduces evaluation scope. Could map to the existing "Fast-Track" pathway concept in OB-DMN-2.

### Vendor Affinity Model (Critical — 3rd Pathway)

A fundamental business model distinction surfaced in the Product Team deep dive (2/13/26) that challenges the current Buy/Build binary:

| Pathway | Description | Org Investment | Risk Level | Expected Timeline |
|---------|-------------|---------------|------------|-------------------|
| **Buy** | Organization purchases licenses and provisions | High | Standard | 6-9 months |
| **Build** | Internal development (may include third-party processing) | High | Standard-High | 6-9 months |
| **Vendor Affinity** | Evaluate and approve only — advisors purchase directly | None/Low | Lower | ~1 month (advisor expectation) |

**Key characteristics** (Product Manager 1):
- Organization doesn't purchase or invest
- Products evaluated and approved for advisor use
- Advisors purchase directly from vendors
- Organization may influence configuration
- Compliance controls enforced
- Revenue share partnerships
- Lower risk, lower effort than Buy/Build

**Tensions**:
- Governance focused on limiting tool proliferation vs. business seeking expanded offerings
- Governance removed from client relationships — clients pressure business leadership
- Advisors expect one-month decisions, not 6-9 months
- Need clear guardrails: when can governance appropriately say no?

**BPMN Implication**: OB-DMN-2 (Pathway Routing) must support 3 pathways, not 2. The Vendor Affinity pathway should skip financial analysis, reduce evaluation scope in SP3, and streamline contracting in SP4. The top-level `GW_BuyOrBuild` gateway becomes `GW_Pathway` with 3 outputs.

### DART Process (Current Discovery Workflow)

Product team's description of the Discovery and Review Team process (Product Manager 1):

1. Submit high-level business case with problem statement and desired features
2. Receive approval for discovery
3. Form DART (Discovery and Review Team)
4. Self-manage stakeholder engagement (product managers "left to own devices")
5. Must reach out to multiple stakeholders independently
6. Submit various intake forms along the way
7. Uncertain stakeholder capacity and scheduling
8. Facilitate multiple conversations
9. Present final deck to governance

**Pain points**: No guidance on management, no designated leads per phase, no status updates or reminders, no clear next steps.

### Pre-Onboarding Feedback Layer

Product Manager 1 proposed a two-tier intake:

| Tier | Purpose | System |
|------|---------|--------|
| **Idea Collection** | Pre-software onboarding — centralized feedback, upvoting, data-driven prioritization | Existing feedback management platform |
| **Formal Onboarding** | Software onboarding process proper (SP1-SP5) | New unified intake |

Existing resources: Feedback management team, central platform with verbatim advisor feedback, relationship managers, client success team submissions.

**BPMN Implication**: A pre-SP1 "idea funnel" stage could feed the formal intake. Threshold-based escalation (e.g., N upvotes or strategic alignment score) triggers formal SP1 submission.

### Third-Party Risk Framework Roles (Feb 10 Workshop)

The organization uses a tripartite ownership model for third-party risk:

| Role | Responsibility | Current State |
|------|---------------|---------------|
| **Business Owner** | Owns the business relationship and use case justification | Reasonably well-identified |
| **Vendor Owner** | Manages vendor relationship lifecycle and contractual compliance | Identified by third-party risk team (team of 6) |
| **Product Owner** | Technical ownership — requirements, implementation, ongoing support | Weakly tracked; often different from requesting team |

**Key insight** (Business Lead): A single vendor may span 10+ business units, each requiring separate assessment paths but sharing vendor-level compliance artifacts. Current process treats each request independently with no vendor-level aggregation.

**Feedback Tools in Use**: Surveying platforms, pop-up feedback mechanisms, "send feedback" buttons across advisor tools. Existing feedback management team operates centrally. Digital whiteboarding used in discovery workshops.

**Timeline Context**: 4-week project timeline for initial process redesign, with phased implementation beyond.

### Integration as Hidden Cost

Product Director raised that some "buy" scenarios also require "build":
- Example: AI tool generating emails needs compliance capture integration
- Integration costs beyond initial purchase
- Requires additional governance for securing funds
- Not captured in current Buy/Build binary

**BPMN Implication**: SP4 `Task_DefineBuildReqs` should be triggered for Buy pathway when integration work is identified, not just for Build pathway.

---

## Committee & Review Inventory

18 committees/reviews identified across the software onboarding lifecycle. This is a primary driver of the 6-9 month cycle time.

### AI-Related Committees

| Committee | Cadence | Duration | Iterations | Members |
|-----------|---------|----------|------------|---------|
| AI Risk Working Group | Every 2 weeks | 1 hour | Multiple per solution | AI Product Manager, Process Manager, Data Lead, AI Governance Lead, Marketing Lead, Strategy Lead, Analytics Lead, Innovation Manager, Privacy Lead, Security Lead 1 & 2, Legal Lead |
| AI Cyber Review | Ad hoc | Multiple hours | Multiple per solution | Security Lead 1, Security Lead 2 |
| AI Risk Review | Ad hoc | Multiple hours | Multiple per solution | AI Governance Lead, Privacy Lead |
| AI Governance Committee | Monthly | 1 hour | Multiple per solution | Not specified |

### Core Governance Committees

| Committee | Cadence | Duration | Notes |
|-----------|---------|----------|-------|
| Technology Business Committee (TBC) | Not specified | Not specified | Committee Chair, Finance Lead |
| START Committee | Not specified | Not specified | Status unclear — possibly still operating; Program Manager 1, Operations Lead |
| Architecture Review Board — Intake | Weekly (Thursday) | 1 hour | Program Manager 1, Architecture Lead |
| Architecture Review Board — Main | Weekly (Thursday) | 1 hour | Board members not specified |
| DART Review | Not specified | Not specified | Core team assembled per solution: EA, Vendor Mgmt, Sourcing, Dev Experience, AI Governance, Cybersecurity |

### Risk & Security Reviews

| Review | Cadence | Duration | Members |
|--------|---------|----------|---------|
| Cybersecurity Review | Ad hoc | Multiple hours | Security Manager 1, Security Director, Security Lead 1 & 2, Security Architect, Compliance Manager |
| Risk Assessment Evaluation (RAE) | Not specified | Not specified | Risk Manager, Legal Manager, Procurement Lead; completed in risk management system |

### Vendor & Contract Reviews

| Review | Cadence | Duration | Members |
|--------|---------|----------|---------|
| Vendor Evaluation Criteria | Ad hoc | Multiple hours | Not specified |
| Product Demo Review | Ad hoc | Multiple hours | Procurement, Product, Tech, Business |
| Vendor Assessment Review | Ad hoc | Multiple hours | Procurement, Product, Tech, Business |
| Contract Review (Legal) | Ad hoc | Multiple hours | Sourcing Legal Lead, Privacy SME, Contract Manager |

### Additional Reviews

| Review | Cadence | Duration |
|--------|---------|----------|
| Finance Review | Ad hoc | Multiple hours |
| eComm Review | Ad hoc | Multiple hours |
| Additional Re-reviews (EA, Cyber, AI Gov) | Not specified | Not specified |

### Committee Statistics

- **Total committees/reviews**: 18
- **Weekly meetings**: 2 (Architecture Review Board intake + main)
- **Bi-weekly meetings**: 1 (AI Risk Working Group)
- **Monthly meetings**: 1 (AI Governance Committee)
- **Ad hoc meetings**: 9 committees
- **Multiple iterations required**: 5 committees (all AI-related + Cybersecurity)
- **1-hour meetings**: 3 committees
- **Multi-hour meetings**: 8 committees

**BPMN Implication**: The parallel fan-out pattern in SP3 directly addresses sequential committee reviews. The 5 parallel evaluation branches in the BPMN model should replace the current sequential committee gauntlet. Cross-functional representation in DART reviews can be preserved via multi-instance tasks with `camunda:collection="assessorList"`. Target: reduce 18 sequential touchpoints to 5 parallel evaluation streams with consolidated governance decision at SP4.

---

## AI Use Case Intake Form (Current State)

Current AI-specific intake is a Smartsheet form with 3 sections:

### Section 1: Solution Details
- Requested Date, Primary Business Owner (email), Business Unit (L1 dropdown)
- Solution Name, Vendor Name & ID (from risk management system)
- Use Case Description, Business Problem, Specific Use Cases, Prohibited Use Cases
- Use Case Audience (selection), START/TBC Process Completion (Yes/No)

### Section 2: Technical Details
- Request Type, AI Solution Function, AI Solution Type (all dropdowns)
- Website/Documentation Links
- Required uploads: Process Flow/Value Stream, Solution Design/Architecture, Model Card

### Section 3: Solution Status
- Three implementation phases tracked: POC, Pilot, Production
- Each with status field
- Note: Business Sponsors must alert Supervision Team before rolling out approved tools

**Key observations**:
- Mandatory notice: "Any new technology use case must also go through START/TBC process prior to software acquisition"
- Exception: "New AI capabilities within existing tools are not required to go through START/TBC process"
- Form is on Smartsheet (separate from ServiceNow intake), confirming the fragmented intake problem
- Requires Model Card upload — vendor should assist but frequently delayed

**BPMN Implication**: AI intake fields should be integrated into the unified intake form (GAP-1) as conditional sections triggered when request type = "AI Tool". The START/TBC bypass exception for existing tool AI capabilities maps to the auto-approval concept for low-risk items.

---

## Software Acquisition Intake Form (Current State)

The primary intake is the "Front Door" form with 8 required sections. A completed example (2/3/2026) for an AI meeting assistant provides a clear Vendor Affinity pathway case study.

### Required Sections

| Section | Content | Notes |
|---------|---------|-------|
| A) Problem/Need Title | Must match Front Door intake form title | Cross-reference requirement |
| B) Senior Leadership | Sponsor name + associated Domain | Establishes accountability |
| C) Problem Summary | Business problem + current remediation (FTE hours, manual process) | Includes C-1: Current state |
| D) Solution Capabilities | Features needed to remedy the problem | Technical requirements |
| E) Value Proposition | FTE hours saved, risk reduction, ROI | Quantitative justification |
| F) Business Impact | Impact on clients, organization, business partners, advisors, institutions, investors | Must address "if not resolved" scenario |
| G) Funding | Funding table + Program Management & Funding partner approval screenshot | Critical for pathway routing |
| H) Senior Leadership Approval | Approval email/screenshot from aligned Senior Leadership | Gate requirement |

### Vendor Affinity Example (AI Meeting Assistant)

Key data points from the completed example form:
- **Problem**: Transitioning advisors rely on AI meeting assistant; organization hasn't approved it yet. Business continuity risk.
- **Solution**: Pre-meeting prep, real-time transcription, AI note-taking, automated follow-up tasks, CRM sync
- **Funding**: "No direct integration with organizational systems. License cost will be paid directly by advisors through the vendor affinity model."
- **Revenue model**: Revenue share agreement with vendor creates direct financial benefit
- **Impact**: Advisor choice/flexibility, transitioning advisor continuity, expanded approved tool set

**Key insight**: This example perfectly illustrates the Vendor Affinity pathway — no org investment, advisor-direct licensing, revenue share, lower risk profile. The funding section explicitly calls out the vendor affinity model by name.

**BPMN Implication**: Section G (Funding) is the primary differentiator for pathway routing. When funding = "vendor affinity model" / "advisor-direct", OB-DMN-2 should route to the Vendor Affinity pathway, skipping financial analysis in SP3 and full negotiation in SP4.

---

## Stakeholder-Proposed Solutions Framework (Workshop Consensus)

| Solution Area | Key Elements |
|--------------|-------------|
| **1. Optimized Governance** | Plain language guidance, RACI matrices, simplified templates/SOPs, centralized portal, clear ownership |
| **2. Streamlined Intake** | Single intake, logic-tree dynamic questionnaires, quality gates before routing, automated routing, parallel processing, defense layer before reviewers |
| **3. Risk-Based Pathways** | Right-sized processes based on risk, parallel vs. sequential, smaller feedback loops, concurrent reviews |
| **4. Transparency & Traceability** | Visible ownership, decision logs with rationale, audit trail, SLA/KPI tracking with nuanced alerts, real-time dashboards |
| **5. Technology Enablement** | End-to-end workflow platform, automated routing/notifications, AI pre-screening/summarization/assistance, contract lifecycle management |

## Improvement Priorities (Stakeholder-Ranked)

From Product Lead, in priority order:

1. **Process Consolidation** — Unify multiple intake processes, consolidate redundant questions, create single entry point
2. **Form Optimization** — Make questions more intuitive, reduce bottlenecks from confusion, provide clearer guidance
3. **Review Period Reduction** — Allocate additional SME resources, address commitment challenges, streamline consultations
4. **Standardization** — Define minimum requirements by area, create clear acceptance criteria, establish standard timelines

**Implementation approach** (workshop consensus): Phased — short-term quick wins, progressive improvements, incremental changes. Urgent priority given significant organizational pain.

---

## Mapping to Existing BPMN Model

| Pain Point Theme | BPMN Sub-Process | DMN Table | Governance Topic |
|------------------|------------------|-----------|-----------------|
| Fragmented Intake | SP1: Request & Triage | — | #1 Intake |
| Form Redundancy & Usability | SP1-SP3 (progressive) | — | #1 Intake |
| Prioritization Gap | SP2: Planning & Routing | OB-DMN-2 | #2 Prioritization |
| Process Visibility | Cross-cutting (notifications) | — | All |
| Finance Friction | SP4: Contracting & Build | — | #3 Funding |
| Capacity Constraints | Cross-cutting (SLA monitoring) | OB-DMN-4 | All |
| Resource Bottlenecks | SP4-SP5, cross-cutting | — | #10 Commercial Counsel |
| Committee Proliferation | SP3: Evaluation & DD | — | All review topics |
| Ownership & Governance Resistance | Cross-cutting | — | All |
| AI Governance Complexity | SP3: Evaluation & DD | OB-DMN-3 | #8 AI Governance |
| Pathway Differentiation | Top-level routing | OB-DMN-2 | #2 Prioritization, #4 Sourcing |
| Security Baseline Gap | SP3: Evaluation & DD | OB-DMN-1 | #5 Cyber |
| Time-Bound Risk Acceptance | SP3-SP5 (conditional approval) | — | #5 Cyber, #7 Compliance |
| Ownership Gap | SP5, Post-onboarding | — | #11 TPRM |
| Process Maturity Paradox | Strategic (modular design) | — | All |
| Rework & Trip Wires | SP1-SP4 | — | All |
| Documentation Burden | SP1-SP5 | — | All |
| Post-Onboarding Utilization | Post-onboarding | — | #11 TPRM |
| AI Urgency | SP3 (fast-track) | OB-DMN-2, OB-DMN-3 | #8 AI Governance |
| Vendor Partnership | SP1 routing → fast-track | OB-DMN-2 | #4 Sourcing |

---

## Open Questions for Follow-Up

1. What are the minimum viable fields for the consolidated intake form? (Product Director committed to defining)
2. What scoring formula drives prioritization? (Governance Specialist to propose)
3. What is the organization's formal AI risk posture? (Process Manager flagged as undefined)
4. How should vendor partnership products be classified in the risk tier model?
5. What authority level can approve fast-track for pre-approved vendor partnership tools?
6. Finance Manager meeting (tentatively scheduled) — need to map FP&A handoff points
7. What does "secure by design" mean at this organization? (Security Director raised, no resolution)
8. What are baseline security controls / minimum expectations? (Architecture Security Lead — teams don't know)
9. Obtain REA form for review (action item from 2/17 vendor risk session)
10. Enterprise Risk Management decision matrix status? (VP leading effort per Vendor Risk Lead)
11. Control Tower capacity management — how does it interact with onboarding intake? (6 weeks in, rocky start)
12. CMDB completeness — authoritative source for app/technology ownership needed (Security Director)
13. AI Governance Lead to share streamlining materials and risk-based approach documentation

---

*Created: 2026-03-05 | Sources: 9 stakeholder sessions (2026-02-10 cross-functional workshop, 2026-02-11 workshop, 2026-02-11 discovery, 2026-02-11 vendor mgmt deep dive, 2026-02-12 AI governance & security, 2026-02-13 product team, 2026-02-17 finance, 2026-02-17 vendor risk & AI governance, 2026-03-05 product lead)*
