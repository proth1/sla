# Meeting Notes: Software Onboarding Process - Third-Party Risk Management Deep Dive

**Date**: 2026-03-06 (Meeting 3 of 4)
**Participants**: Risk Management Lead, Consulting Team
**Focus**: Third-party risk management role, current state, pain points, improvement opportunities

---

## Key Findings

### System Landscape

| System | Function |
|--------|----------|
| ServiceNow | START process initial intake |
| Ariba | Registration/contracting, NDAs, vendor registration, contract workspace |
| OneTrust | Risk assessments, tracking, control gap documentation |
| Oracle | Accounts payable |

- API connections exist between Ariba and Oracle (shared inventory/systems of record)
- Data lives in 4+ separate systems with manual transfers via PDF exports

### Process Flow

1. **Initial Intake**: Idea submitted through START → initial gate → blessing to explore
2. **Sourcing Engagement**: NDA required → vendor registration in AP system → preliminary due diligence (sanctions, legitimacy)
3. **Risk Assessment (RAE)**: 80-question internal stakeholder questionnaire → assigns inherent risk tier → determines DD level
4. **Due Diligence**: 830-question vendor questionnaire (with skip logic) → avg 30 days vendor completion → internal review 75 days (down from 144)
5. **Contract Negotiation**: Manual process entirely → contract workspace in Ariba → parallel with DD
6. **Risk Documentation**: Contract deviations recorded in OneTrust → control gaps documented → risk acceptance or remediation plans

### Ownership Structure

| Role | Responsibility |
|------|---------------|
| **Business Owner** | Responsible for executing agreement |
| **Vendor Owner** | Manages vendor relationship |

### Process Metrics

| Metric | Target | Actual | Trend |
|--------|--------|--------|-------|
| RAE Completion | 14 days | 28-29 days | 2x target |
| Vendor Questionnaire | 42 days | 30 days | Better than target |
| Due Diligence (internal) | — | 75 days | Down from 144 days (2019) |
| Contract Negotiation | — | Varies drastically | Up to 1.5 years for security exhibits |
| Assessments/year | — | 335 completed | Output doubled while reducing timeline |
| Competitor benchmark | — | 60-90 days E2E | Less mature processes |

### Major Pain Points ("Dumpster Fires")

#### 1. Contract Risk Management — "Dumpster Fire #1"
- **2 people** negotiating **30+ contracts monthly**
- Manual review process, 4 years unsustainable
- No reportable format for contract deviations
- Unknown compliance status for older contracts
- Quote: "That team desperately needs automation... The firm needs them to be automated"

#### 2. Process Ownership Vacuum
- START process created 2 years ago
- Technology management team assigned "half a person"
- Inadequate communication channels, no clear accountability
- Quote: "Somebody needs to be empowered at the firm to say I own this... we will not allow you to do it any other way"

#### 3. Resource and Staffing Crisis

| Function | Staffing | Workload |
|----------|----------|----------|
| Risk/DD team | 8 people | 335 assessments/year |
| Legal/contracts | 2 people | 30+ contracts/month |
| Architecture | 2-3 people | Recently reduced |
| Technology vendor mgmt | 1 person part-time | Full process facilitation |

- Architecture diagram took **9 months** due to understaffing
- Configuration changes delayed despite existing documentation

#### 4. Fragmented Communication
- Data breach notification triggered **4 different people** contacting vendor
- Same questions asked multiple times, no clear ownership
- Quote: "We're all doing the same thing to try to be helpful... no one was truly saying I own this"

### Multiple Questionnaire Problem

| Questionnaire | Questions | Audience | Status |
|---------------|-----------|----------|--------|
| RAE | 80 | Internal stakeholder | Active |
| Due Diligence | 830 (skip logic) | Vendor-facing | Active |
| AI-Specific | 3 additional questionnaires | Various | "Snuck up" — being consolidated |

- Quote: "I have no idea why they're there... they just snuck up and I'm really annoyed that they're even in existence"
- Working with AI security team to merge into single dataset

### Proposed Solutions

#### 1. Dedicated Ownership and Resources
- 1 person for workflow management
- 2-3 dedicated project managers
- 1 strategic owner with authority
- Quote: "Someone needs to stand up... be empowered to do it and then be resourced"

#### 2. Product Ownership Framework
- Product ownership structure exists but not maintained
- No accountability or expansion
- Need: "Having somebody up front that can say... I already got four of those things. I don't need a fifth one"

#### 3. Shift-Left Strategy (Enthusiastically Endorsed)
- Mini-RFP tools for business users
- Standard questions available upfront
- Risk-based self-service options
- Quote: "That's a fantastic idea that should be in the slides"

#### 4. Automation Priority
- Contract review automation (critical)
- Workflow management
- Integrated reporting
- Standardized templates

### Key Quotes

- **Sourcing reality**: "Our sourcing department doesn't source, they manage contract lifecycle"
- **AI complexity**: "It's an ever-changing world that's different every other day... there needs to be some type of standardization"
- **Resource reality**: "If we want this to really click... I can't have the architect review group being a critical portion with only two people"
- **Executive pressure**: "My EVP in technology thinks [vendor] sounds like a good idea. Let's get them on board in two days"

---

## Mapping to BPMN Model

| Finding | Maps To | Gap Reference |
|---------|---------|---------------|
| RAE 80-question form → risk tier assignment | SP1/SP2 intake + OB-DMN-1 | GAP-1 (Unified Intake), GAP-9 (Completeness Gate) |
| 830-question DD with skip logic | SP3 parallel evaluation | Existing SP3 architecture |
| Contract negotiation bottleneck (2 people, 30+/month) | SP4 Contracting | GAP-4 (Finance Rework), NEW: Contract automation |
| 4 people contacting vendor on breach | Cross-cutting incident response | SP-Cross-3 pattern |
| Product ownership gap | SP5 post-onboarding | GAP-14 (Ownership Assignment) |
| Shift-left / mini-RFP | SP1 pre-intake | GAP-15 (Idea Funnel), NEW: Self-service RFP |
| AI questionnaire proliferation | SP3 AI review branch | GAP-6 (AI Fast-Track) |
| 335 assessments/year, 75-day avg | Capacity planning | GAP-10 (Workload Dashboard) |
| Competitor benchmark 60-90 days | SLA targets | SLA timer calibration |
| OneTrust for risk tracking | Integration architecture | OneTrust integration doc |

---

## Action Items

- [ ] Monday follow-up to review recommendations
- [ ] Current state baseline documentation
- [ ] Define realistic timeline expectations
- [ ] Prioritize automation opportunities (contract review first)
- [ ] Clarify ownership structure
