# Meeting Notes: Software Onboarding Process - Architecture Team Deep Dive

**Date**: 2026-03-05
**Participants**: Architecture Lead, Consulting Team
**Focus**: Governance structure validation, committee overlap, engagement timing, concierge model, operational excellence

---

## Key Findings

### Architecture Governance Structure

| Board | Function | Scope |
|-------|----------|-------|
| **ARB** (Architecture Review Board) | Reviews high-level designs | Pre-contract, all acquisitions |
| **SDRB** (System Design Review Board) | Reviews low-level designs | Post-contract, final check before production |

- All software acquisitions must go through central governance
- Approval system automated via **Catfox plugin in Confluence**

### Artifact Framework

| Artifact | When | Path | Scope |
|----------|------|------|-------|
| **HLD** (High Level Design) | Prior to contract signing | Required for ALL acquisitions | How product integrates if approved |
| **SD/SYDD** (System Design) | Post-contract | Single domain usage | Updates existing system documentation |
| **PSS** (Platform Specification) | Post-contract | Cross-enterprise products | Most AI products require this path |

Quote: "HLD is applicable across the board. Then you either do the SD/SYDD route for more local product usage or PSS for enterprise usage"

### Process Performance / SLAs

| Process | Commitment | Notes |
|---------|-----------|-------|
| **ARB** | 2-week approval | Present → Start workflow → Reviews by security, EA leaders, distinguished architects |
| **SDRB** | Same-day if no issues | Final check before production; requires pre-approvals from security, observability, integration boards |

**Factors affecting speed:**

| Faster | Slower |
|--------|--------|
| Well-prepared teams | Brand new applications |
| Smaller changes | First-time presentations |
| Lower risk, localized impact | Brand new capabilities requiring sidebar conversations |

### Operational Excellence — Governance Facilitator Role

Architecture has a dedicated **Governance Facilitator** (reports to Architecture Lead, background as data architect):
- Pre-screens all designs
- Removes incomplete artifacts from agenda
- Captures action items, manages follow-ups
- Runs ARB and SDRB
- Quote: "If any artifact is not in good order, remove it from the agenda... we do all of that pre-screening to avoid wasting anybody's time"

Consulting Team recognized this role as: "Exactly like what we're talking about for the quarterback from a broader end-to-end"

**JIRA Integration**: Every design has corresponding JIRA ticket; facilitator documents notes and action items; approvers ask questions in tickets; artifacts must be updated before workflow approval.

### Major Pain Points

#### 1. Multiple Committee Problem
- "We have two different software acquisition boards that have to be engaged... people have to review at ARB, then they got to go to TBC, then they got to go to AI governance. It's painful."
- Redundant presentations, same questions asked multiple times
- Lack of transparency into prior assessments
- Architecture team gets "hands slapped" for asking already-answered questions
- "Each area needs a **defined scope**... architecture questions should be asked by architects, not by people that are not architects in another forum"
- "I can understand 100% why requesters are frustrated. They present the same thing over and over and over again and it's because they do"

#### 2. DART Team Formation Issues
- TBC sends requester list of required engagements
- Requester must independently contact each team and submit separate intake requests (procurement, security, architecture)
- No visibility into engagement sequence, timing, or who engaged first/second/third
- Requester might wait weeks between engagements
- "It's completely on the onus of the requester to engage and form this team... that's a **poor experience**"
- "It's on you, we'll move as quickly as you want us to move" mentality

#### 3. Engagement Timing and Bottlenecks
- TBC owner proposes architecture engagement first — **Architecture disagrees**
- "I disagree with that because that makes us a bottleneck... there should be **simultaneous engagement** of all the major players that have a vote"
- "We might have an architect aligned to an area but they don't have bandwidth for three weeks"

#### 4. Security Team as Primary Bottleneck
- **"Security is our biggest bottleneck... They are the reason our SLA takes two weeks"**
- Understaffed security architecture team
- Lack of domain expertise
- Critical to process but creating delays
- Escalated to leadership
- "Enterprise architecture would be able to get our SLA way down" without security constraints

### Resource and Capacity Analysis

**Architecture team**: "We're pretty dang efficient... We are staffed for what we're paid for"
- Architects funded by domains: "If they want us to pursue all of that work, they need to fund us appropriately"
- No capacity issues per se, but funding constraints
- Domains sometimes don't fund enough architecture support

**Domain-based assignment model**:
- 4 EA leaders oversee multiple domains
- Tickets assigned to domain leader → leader assigns to appropriate architect based on bandwidth
- Cross-enterprise items need special handling
- "If it's from servicing and support, it goes to Uma. If it's from Tech Foundational, it goes to Zeth"

### Innovation and AI Tool Usage

| Tool | Usage |
|------|-------|
| **Cursor AI** | Diagram generation by architects |
| **Custom AI Agent** | Scans design documents for pattern conformance |

- "We're trying to use AI to help expedite these reviews"
- AI agent reduces manual review burden
- Built by internal team member

### Proposed Solutions

#### 1. Simultaneous Engagement Model
"When a request comes in... simultaneous engagement of all the major players that have a vote"
- Eliminates sequential bottlenecks, clear SLA accountability, parallel processing

#### 2. Concierge Experience
"Some sort of concierge experience where we're just kind of handing them off and guiding them through"

#### 3. Domain-Based Auto-Assignment
Automated routing based on requesting domain → EA leader → architect by bandwidth

#### 4. Process Consolidation
- Define clear scope for each review area
- Eliminate duplicative touchpoints
- Increase transparency into prior assessments

### Consulting Team Observations

- "I like how you're running your shop" — architecture has most robust documentation of anyone interviewed
- Governance Facilitator role is the model for the broader end-to-end "quarterback"
- Major friction comes from external touchpoints, not internal process

---

## Mapping to BPMN Model

| Finding | Maps To | Gap Reference |
|---------|---------|---------------|
| ARB + TBC + AI Governance sequential path | SP3 parallel fan-out | GAP #8 — **Architecture Lead's simultaneous engagement validates SP3 model** |
| Governance Facilitator role | Automation lane orchestration | Model for end-to-end process quarterback / concierge |
| HLD before contract, SD/PSS after | SP3 → SP4 artifact flow | Existing SP3/SP4 boundary |
| DART formation burden on requester | SP2 team assignment | GAP-7, NEW: Automated DART formation |
| Security as primary bottleneck (2-week SLA driver) | SP3 security assessment branch | GAP-12 (Security Baseline) — tiered assessment reduces load |
| Domain-based auto-assignment | Automation lane routing | OB-DMN-2 routing enhancement |
| AI agent for pattern conformance | Automation lane service task | Existing automation lane pattern |
| Catfox/Confluence approval | Integration architecture | Platform integration point |
| JIRA ticket per design | Cross-cutting tracking | GAP-10 (Workload Dashboard) |
| ARB 2-week SLA, SDRB same-day | SLA timer calibration | Timer boundary events on SP3 branches |

---

## Action Items

- [ ] Create 30-60-90-120 day timeline and recommendations
- [ ] Pre-validation meeting with architecture team
- [ ] Focus on security team capacity as tangential improvement
- [ ] Final readout on Friday
- [ ] Consolidate TBC, ARB, and AI governance touchpoints
- [ ] Define clear scope boundaries for each review area
- [ ] Develop concierge model for requester support
