# Meeting Notes: Software Onboarding Process - Product Team Deep Dive

**Date**: 2026-03-05 (Meeting 4 of 4)
**Participants**: Product Manager, Consulting Team
**Focus**: Intake processes, funding models, capacity management, 3-pathway model

---

## Key Findings

### AI Governance Committee Structure

| Committee | Function | Issue |
|-----------|----------|-------|
| **Working Committee** | Meets regularly to review cases | Somewhat redundant with TBC process |
| **Decision Committee** | Ratifies and votes on decisions as a group | Sequential after Working Committee |

### Multiple Intake Forms (Layered)

Forms submitted at **different stages**, not just initial intake:
- **Initial idea intake**: ServiceNow START
- **Team capacity requests**: EA and Cyber intake forms during DART formation — "to delegate who on their team should be aligned"
- **Governance forms**: Various per-team requirements
- **Compliance reviews**: Downstream forms

Quote: "You submit a formal intake request so they have trackability... to delegate who on their team should be aligned"

**Challenges**: New product managers don't know contacts, must submit multiple forms, dependent on team capacity availability.

### Informal Intake Channels

- Email requests (unstructured)
- Feedback platform monitoring: social media, communication platforms, "send feedback" submissions, advisor tool approval requests
- All informal requests **eventually flow through formal process**: "Somebody does that on their behalf"

### Three Distinct Pathways (Product Manager's Framework)

| Pathway | Funding | Development | License | Key Characteristic |
|---------|---------|-------------|---------|-------------------|
| **Buy** | Org-funded | None | Org purchases | Traditional procurement |
| **Build** | Org-funded | Internal dev | N/A | Resource intensive, custom |
| **Enable** | No org cost | None | Advisor purchases | Vendor Affinity Program |

### Vendor Affinity Program (Enable Pathway) — Detail

- Treats advisors as **independent businesses**
- Curated vendor list with organizational approval
- Revenue sharing or negotiated discounts
- Advisors purchase "organizational version" of tools
- Quote: "You can use anything you'd like so long as it doesn't conflict with policies"
- Examples: core tools (phones, conferencing) at advisor discretion; specialized tools (CRM) from recommended list
- **Not a closed ecosystem**

### Process Redundancy / Funding Disconnect

- "There's redundancy on what all these intake forms are... they're all describing what is the business case"
- **Vendor Affinity tools require no funding** but funding validation still required by process
- Must repeatedly explain no organizational investment — creates unnecessary friction
- Opportunity: consolidate intake forms to satisfy different groups' requirements in one pass

### Communication Noise ("Toil and Turmoil")

Impact of requesters not understanding process + no visibility:
- Multiple inquiries to different people
- **Exponential noise effect** on teams
- Solutions: clear time expectations, status tracking, centralized Q&A, automated updates

### Capacity Management

- PI planning allocates capacity to roadmap items
- Exception requests aren't anticipated — product teams must pivot
- Capacity Manager "has the authority to tell people no"
- When priorities shift: new work paused, in-flight slows, velocity decreases
- Quote: "Instead of saying... it's going to take me 3 more months... it would be... I can work on that in probably a couple more weeks"

### The Acceleration Hypothesis

Quote: "If the general pace of onboarding technology is accelerated, then we could theoretically handle these one-off cases with more capacity"

Core insight: fixing the standard path frees capacity for exceptions.

### Product Manager's Primary Improvement Goals

1. Consolidate intake processes and questions
2. Make intake more intuitive
3. Reduce bottlenecks from form confusion
4. Provide sufficient detail to SMEs
5. Minimize review periods
6. Standardize minimum requirements
7. Reduce dependency on individual consultations
8. Enable self-service where possible

**Biggest challenge**: "Organizing these meetings... it's hard to get time on people's calendars"

---

## Mapping to BPMN Model

| Finding | Maps To | Gap Reference |
|---------|---------|---------------|
| 3-pathway model (Buy/Build/Enable) | OB-DMN-2, top-level routing | GAP-11 (3-Pathway, rename "Vendor Affinity" to "Enable") |
| Enable pathway skips funding validation | SP4 conditional branches | GAP-5 (VPP Fast-Track) |
| Layered intake forms at different stages | SP1-SP3 progressive forms | GAP-3 (Progressive Forms) |
| AI Working + Decision committee redundancy | SP3/SP4 governance gates | GAP pain point #8 (Committee Proliferation) |
| Communication noise / status invisibility | Cross-cutting notifications | GAP-7 (Status Visibility) |
| Capacity management / PI planning | SP2 prioritization | GAP-2 (Prioritization) |
| Acceleration hypothesis | SLA timers, overall model | Validates process improvement ROI |
| Informal channels → formal process | SP1 unified intake | GAP-1 (Unified Intake) |
| Self-service / standardized requirements | SP1 pre-intake | GAP-15 (Idea Funnel) |

---

## Action Items

- [ ] Product Manager to share additional resources
- [ ] Follow-up on specific intake forms
- [ ] Document three-pathway model in OB-DMN-2
- [ ] Explore intake consolidation opportunities
