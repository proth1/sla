# Product Requirements Document: Self-Service Mini RFP

## Document Control

| Field | Value |
|-------|-------|
| Version | 1.1.0 |
| Date | 2026-03-07 |
| Status | Revised Draft |
| Owner | Process Optimization Team |
| Jira Epic | SLA-6 |
| Parent PRD | [fs-onboarding-prd.md](fs-onboarding-prd.md) |

---

## 1. Executive Summary

The Self-Service Mini RFP flips the onboarding model: **collect vendor data BEFORE intake, not after.**

Today, business requesters submit intake forms with limited information, then wait 6-9 months while 7+ downstream governance teams independently and sequentially request information from vendors. Requesters feel their submissions "disappear." Vendors receive overlapping, redundant questionnaires. Bad requests consume 3+ months of organizational resources before anyone identifies a deal-killer.

The Mini RFP introduces **SP0** -- a new optional sub-process that executes before SP1 (Request & Triage). Through a 9-step guided wizard, the requester generates a tailored vendor questionnaire, sends it to one or more vendors, collects structured responses, and transfers all data into the onboarding request. The requester arrives at the intake gate armed with comprehensive vendor data, knowing which governance teams will engage and what timeline to expect.

### Key Value Proposition

| Metric | Current State | With Mini RFP |
|--------|--------------|---------------|
| E2E cycle time | 6-9 months | 30-90 days (target) |
| Intake form completeness | ~40% of fields populated | 90%+ pre-populated from vendor responses |
| Fail-fast rate | 0% (no pre-screening) | 30% of requests killed before consuming downstream resources |
| Redundant questionnaires sent to vendors | 4+ overlapping forms | 1 tailored Mini RFP per vendor |
| Requester visibility into process | None until triage | Full: which teams engage, estimated timeline, approval gates |

### What the Mini RFP Produces

1. **Pre-populated intake request** -- SP1 form fields filled from vendor responses, eliminating redundant data entry
2. **Stakeholder engagement map** -- which governance lanes will engage and why, based on vendor response data
3. **Timeline expectations** -- estimated days per phase based on risk tier, pathway, and team engagement
4. **Fail-fast decisions** -- blocked vendors, prohibited technologies, and budget misalignment identified before formal submission
5. **Vendor comparison** (competitive bid) -- side-by-side scoring across 10 assessment categories

---

## 2. Problem Statement

14 stakeholder sessions and the [intake form field mapping](../../../framework/docs/requirements/intake-form-field-mapping.md) analysis revealed five structural problems that the Mini RFP addresses:

### 2.1 Sequential Independent Information Requests

Seven governance teams (cybersecurity, enterprise architecture, legal/privacy, compliance, TPRM, AI governance, finance) each independently request information from vendors after the intake form is submitted. These requests happen sequentially, not in parallel, because each team waits for "their turn" in the process.

**Impact**: A single vendor engagement generates 4+ separate questionnaires (AI Vendor Questionnaire, AI Risk Assessment/RAE, SECARC, EA Intake) plus ad-hoc email requests from legal, compliance, and TPRM.

### 2.2 Redundant Fields Across Forms

The field mapping analysis identified **111 fields across 4 forms with 33 redundant or partially redundant fields** (17 exact duplicates, 8 same-concept-different-depth, 8 same-concept-different-audience). Business problem description is asked 5 times. Urgency is asked 3 times. Contact information is collected on every form independently.

**Impact**: Vendor fatigue, inconsistent answers across forms, and requester frustration at answering the same questions repeatedly.

### 2.3 Requesters Have No Tools to Prepare

There is no mechanism for a requester to understand what information governance teams will need, which teams will engage, or what the timeline will look like -- until after they submit and wait. The current intake forms capture the requester's view but not the vendor's capabilities.

**Impact**: Incomplete submissions (GAP-9), repeated information requests, and requesters who feel the process is opaque and unpredictable.

### 2.4 Vendors Receive Overlapping Questionnaires

Vendors receive separate questionnaires from security, AI governance, compliance, and procurement -- often covering the same ground (data handling, certifications, incident response, access controls). There is no consolidated vendor questionnaire that spans all governance domains.

**Impact**: Vendor relationship damage, delayed responses, and inconsistent vendor data across governance reviews.

### 2.5 No Fail-Fast Mechanism

Bad requests (blocked vendors, prohibited technologies, budget misalignment, data sovereignty violations) are not identified until they have consumed 3+ months of organizational resources. The deal-killer check (GAP-16) exists in SP1 but only fires after formal submission.

**Impact**: Wasted governance team capacity on requests that will inevitably be rejected. Security team capacity -- the binding constraint identified in stakeholder sessions -- is consumed by requests that could have been killed at the door.

---

## 3. Target Personas

### 3.1 Requester (Primary User)

Business analyst, advisor, or technology lead driving the software need. Uses the Mini RFP wizard to understand governance requirements, generate a vendor questionnaire, and prepare a complete intake submission.

**Goals**:
- Understand what information is needed before submitting
- Know which governance teams will engage and why
- Get a realistic timeline expectation upfront
- Avoid "submit and disappear" experience
- Compare vendors when multiple options exist

**Interaction**: Completes 9 wizard steps (Steps 1-5 before vendor engagement, Steps 6-9 after vendor response).

### 3.2 Vendor (Respondent)

External software or service provider completing the Mini RFP questionnaire. Receives a single, tailored questionnaire covering all governance domains relevant to the engagement.

**Goals**:
- Answer questions once (not 4+ times across separate forms)
- Understand what is being assessed and why
- Complete the questionnaire within a reasonable timeframe
- Know the status of their submission

**Interaction**: Receives a portal link or email with the dynamically assembled questionnaire. Completes and submits structured responses.

### 3.3 Concierge (Oversight)

Process owner (per GAP-18) monitoring Mini RFP progress. Intervenes when vendors miss deadlines, requesters stall, or deal-killers are identified.

**Goals**:
- Monitor active Mini RFPs across the portfolio
- Identify stalled requests before they age out
- Ensure fail-fast decisions are communicated clearly
- Track conversion rate from Mini RFP to formal intake

**Interaction**: Dashboard view of active Mini RFPs, deadline alerts, and escalation triggers.

### 3.4 Governance Reviewer (Consumer)

Downstream SME (security, legal, compliance, AI governance, architecture) who benefits from pre-collected vendor data. Does not directly interact with SP0 but receives enriched process variables when SP1 begins.

**Goals**:
- Receive complete, structured vendor data at the start of their review
- Avoid sending redundant questionnaires to vendors
- Focus review time on analysis, not information gathering

**Interaction**: None during SP0. Benefits from pre-populated form fields and process variables when their SP3/SP4 tasks activate.

---

## 4. Process Architecture -- SP0 (Self-Service Mini RFP)

### 4.1 Position in Onboarding Lifecycle

SP0 is a new collapsed sub-process that executes **before** SP1 (Request & Triage). It is **optional** -- a gateway `GW_MiniRFP` ("Self-Service RFP?") at the top level allows the process to start with or without it, maintaining backward compatibility with direct SP1 intake.

```
[Start] --> [GW_MiniRFP?] --Yes--> [SP0: Mini RFP] --> [SP1: Request & Triage] --> ...
                 |
                 +--No--> [SP1: Request & Triage] --> ...
```

**BPMN pattern**: Follows `bpmn-hierarchical-subprocess.md` -- collapsed sub-process at top level (100x80px), own `BPMNDiagram` with independent coordinate space, no top-level lanes.

### 4.2 Wizard Flow (9 Steps + Classification Validation)

SP0 contains 9 sequential steps (plus Step 2.5 classification validation) organized into 3 phases.

**Descriptive step labels** (v1.1): Each step uses a human-readable label instead of "Step N" for better UX. Labels shown in progress bar: "Understand the Need" → "Vendor Context" → "Classification Check" → "Deal-Killer Screen" → "Question Preview" → "Send to Vendor" → "Collect Responses" → "Review & Score" → "Transfer to Intake" → "What Happens Next".

| Phase | Steps | Actor | Duration Target |
|-------|-------|-------|-----------------|
| **Preparation** (requester-driven) | 1-5 | Requester | 1-3 days |
| **Collection** (vendor-driven) | 6 | Vendor | 5-10 business days |
| **Evaluation** (requester-driven) | 7-9 | Requester + DMN | 1-2 days |

#### Step 1: Understand Your Need

**Purpose**: Capture the requester's context to drive dynamic question selection.

| Field | Key | Type | Required | Description |
|-------|-----|------|----------|-------------|
| Technology Type | `technologyType` | select | Yes | SaaS Platform, On-Premise Software, API/Integration, AI/ML Platform, Infrastructure, Data Platform, Other |
| Primary Use Case | `primaryUseCase` | textarea | Yes | What business problem does this solve? |
| Urgency | `rfpUrgency` | select | Yes | Critical, High, Standard, Exploratory |
| Budget Range | `budgetRange` | select | Yes | Under $25K, $25K-$100K, $100K-$500K, Over $500K, Unknown |
| AI Involvement | `hasAI` | radio | Yes | Yes, No, Unsure |
| Business Criticality | `businessCriticality` | select | Yes | Mission-Critical, Significant, Standard, Exploratory |
| Cost Center | `costCenter` | textfield | Yes | Cost center code for budget validation |

> **v1.1 note**: `businessCriticality` is distinct from `rfpUrgency`. Urgency reflects timeline pressure; criticality reflects organizational impact. OB-DMN-8 R13 (Operational Resilience) uses `businessCriticality`, not `rfpUrgency`.

**Outcome**: Context variables set for OB-DMN-8 (Question Selection).

#### Step 2: Vendor Context

**Purpose**: Capture vendor relationship and deployment context to further refine the questionnaire.

| Field | Key | Type | Required | Description |
|-------|-----|------|----------|-------------|
| Known Vendor | `knownVendor` | radio | Yes | Do you have a specific vendor in mind? |
| Vendor Name | `vendorName` | textfield | Conditional | If known vendor = Yes |
| Competitive Bid | `competitiveBid` | radio | Yes | Will you evaluate multiple vendors? |
| Existing Relationship | `existingRelationship` | radio | Yes | Does the organization already use this vendor? |
| Deployment Model | `deploymentModel` | select | Yes | Cloud (SaaS), On-Premise, Hybrid, Unknown |
| Data Classification | `dataClassification` | select | Yes | Public, Internal, Confidential, Restricted |
| Regulatory Scope | `regulatoryScope` | checklist | Yes | GDPR, CCPA, HIPAA, SOX, EU AI Act, DORA, OCC 2023-17, None Known |
| Data Types Processed | `dataTypes` | checklist | Yes | PII, PHI, Financial, Public, IP, Other Regulated |
| Existing Assessments | `existingAssessments` | checklist | No | SIG Lite, SOC 2 Type II, ISO 27001, PCI DSS, HITRUST, None |

> **v1.1 note**: If vendor has existing SIG Lite, SOC 2 Type II, or ISO 27001, OB-DMN-8 auto-maps relevant categories and pre-populates/skips duplicate questions. This reduces vendor fatigue by accepting industry-standard assessments.

**Outcome**: Full context for OB-DMN-8 question selection and OB-DMN-9 team engagement routing.

#### Step 2.5: Classification Validation (v1.1)

**Purpose**: Lightweight Concierge review of data classification and regulatory scope BEFORE OB-DMN-8 fires. Mitigates the risk of requester misclassification driving incorrect question selection.

**Actor**: Concierge (`governance-lane`)

| Field | Key | Type | Required | Description |
|-------|-----|------|----------|-------------|
| Data Classification Review | `classificationValidated` | radio | Yes | Concierge confirms or corrects requester's data classification |
| Corrected Classification | `correctedClassification` | select | Conditional | If Concierge overrides requester selection |
| Regulatory Scope Review | `regulatoryScopeValidated` | radio | Yes | Concierge confirms or corrects regulatory scope |
| Validation Notes | `classificationNotes` | textarea | No | Concierge rationale for any corrections |

**Outcome**: Validated `dataClassification` and `regulatoryScope` feed into OB-DMN-8. All SP0-sourced fields tagged with `dataProvenance: "vendor-reported"` or `dataProvenance: "requester-reported"` to distinguish from verified data in SP3.

> **Dependency**: Requires GAP-18 Concierge role staffed. Fallback: any `governance-lane` member as interim Concierge. See Section 4.6.

#### Step 3: Deal-Killer Screening

**Purpose**: Fail-fast before investing vendor time in questionnaire completion.

**Automated checks** (service task calling OB-DMN-7 Deal Killer Pre-Screen):
- Blocked vendor list match
- Prohibited technology/AI model match
- Data residency non-compliance
- Active budget freeze for the cost center (requires `costCenter` from Step 1)
- OFAC/sanctions screening (`vendorSanctionsStatus`) — OCC 2023-17 requirement

**Manual confirmations** (requester attestation):

| Field | Key | Type | Required | Description |
|-------|-----|------|----------|-------------|
| Vendor Concentration | `vendorConcentrationAck` | radio | Yes | "This vendor already provides 3+ services. Acknowledged?" |
| Executive Sponsor | `hasExecutiveSponsor` | radio | Yes | "An executive sponsor has been identified for this request" |
| Budget Authorization | `budgetAuthorized` | radio | Yes | "Preliminary budget authorization obtained or not required" |

**Outcome**: `dealKillerResult` = "Blocked" terminates SP0 with `End_Blocked`. "Proceed" continues to Step 4.

#### Step 4: Mini RFP Preview

**Purpose**: Show the dynamically assembled questionnaire before sending to vendor(s). Allow requester to add or remove question categories.

**Inputs**: OB-DMN-8 output (activated categories and tiers).

**Interaction**:
- Read-only preview of all selected questions organized by category
- Toggle switches to add/remove optional categories
- Question count summary (e.g., "62 questions across 7 categories")
- Estimated vendor completion time based on question count

**Outcome**: Final `selectedCategories` and `selectedQuestions` arrays locked for vendor distribution.

#### Step 5: Send to Vendor(s)

**Purpose**: Capture vendor contact information and distribute the questionnaire.

| Field | Key | Type | Required | Description |
|-------|-----|------|----------|-------------|
| Vendor Contact Name | `vendorContactName` | textfield | Yes | Primary vendor respondent |
| Vendor Contact Email | `vendorContactEmail` | textfield | Yes | Email for questionnaire delivery |
| Response Deadline | `responseDeadline` | textfield | Yes | Business days (default: 10) |
| Delivery Method | `deliveryMethod` | select | Yes | Portal Link, Email with Attachment |
| Additional Vendors | `additionalVendors` | dynamic list | No | For competitive bid: name + email per vendor |
| Include Cover Letter | `includeCoverLetter` | radio | Yes (default: Yes) | Auto-generated cover letter framing the engagement |
| Share Evaluation Criteria | `shareEvaluationCriteria` | radio | Yes (default: Yes) | Include category weights and scoring approach with vendor |

**Cover letter** (auto-generated): One-page framing the engagement as a partnership invitation. Includes: engagement overview, evaluation criteria summary, timeline, single POC contact. Template-driven (see Section 11.4).

**Response deadline validation**: Minimum P14D (14 calendar days / ~10 business days). Form enforces `responseDeadline >= 14`. Shorter deadlines require Concierge override.

**For competitive bid**: Multi-instance sub-process creates parallel vendor engagements, each with a unique portal link and identical questionnaire.

**Outcome**: Vendor(s) notified. Timer boundary event starts (non-interrupting, configurable deadline). Process moves to Step 6.

#### Step 6: Collect Vendor Responses

**Purpose**: Track vendor response progress and handle deadline management.

**BPMN pattern**: Receive task (`Receive_VendorRFPResponse`) with boundary timer event.

**Automation** (3-touch reminder cadence — research-validated optimal pattern):
- **Day 2-3**: Confirm receipt reminder (send task, non-interrupting timer)
- **Day 7**: Mid-point status check (send task, non-interrupting timer)
- **Day 10-11**: Final reminder with deadline warning (send task, non-interrupting timer)
- **Deadline expiration**: Escalate to Concierge, offer requester option to extend or proceed with partial data

**BPMN pattern**: Three non-interrupting boundary timer events on `Receive_VendorRFPResponse`, each with a send task target. Timers use ISO 8601 durations relative to vendor notification: `P3D`, `P7D`, `P11D`.

**Partial submission handling**: Vendor can save progress and return. Each category tracks completion percentage independently.

**Outcome**: `vendorResponses` collection populated with structured response data per vendor.

#### Step 7: Review & Compare

**Purpose**: Requester reviews vendor responses and identifies flags.

**Single vendor view**:
- Category-by-category response summary with weighted scores
- Deal-killer flags highlighted (missing certifications, pricing misalignment, sovereignty violations)
- Governance engagement preview (which teams will engage based on responses)
- Data provenance indicators: responses tagged `dataProvenance: "vendor-reported"` displayed with visual distinction from verified data

**Competitive bid view** (side-by-side comparison):
- Category-level scoring (0-100 per category) with configurable weights (see Section 6.6)
- Overall weighted score across all active categories
- Flag comparison (which vendors pass/fail which categories)
- Requester selects winning vendor

**Blind scoring** (v1.1): When `blindScoringEnabled` = true (configurable per engagement), Step 7 supports independent scoring before group discussion. Each reviewer scores without seeing other reviewers' scores. Scores revealed simultaneously after all reviewers submit.

**Scoring approach**: Each question uses a 1-5 rubric (see Section 6.7 for schema). Category score = weighted average of question scores within category. Overall score = weighted average of category scores per Section 6.6 weights.

**Outcome**: `selectedVendor` set (competitive bid) or confirmed (single vendor). `rfpFlags` collection populated. `vendorComparisonScores` with per-category weighted scores.

#### Step 8: Transfer to Intake

**Purpose**: Map Mini RFP data to SP1 intake form fields, pre-populating process variables.

**Automated mapping** (service task): See Section 10 for complete field-level mapping.

**Requester review**:
- Preview of pre-populated SP1 intake form
- Ability to edit/override any transferred values
- Confirmation that data is accurate and complete

**Outcome**: All SP1/SP2/SP3 process variables pre-populated. `rfpDataTransferred` = true.

#### Step 9: Expectation Setting

**Purpose**: Tell the requester what happens next.

**DMN-driven output** (OB-DMN-9 Team Engagement Routing):

| Information | Source | Example |
|-------------|--------|---------|
| Governance lanes that will engage | OB-DMN-9 output | "Security, Compliance, AI Governance, Contracting" |
| Estimated timeline per phase | OB-DMN-4 (SLA Assignment) + lane count | "SP3: 8-12 days (4 parallel reviews)" |
| Approval gates to expect | Pathway + risk tier | "Governance Review (SP3 gate), Final Approval (SP5 gate)" |
| Key contacts | Lane candidateGroups | "Security: technical-assessment team" |

**Outcome**: Requester has full visibility into what comes next. SP0 completes. Flow continues to SP1.

### 4.3 SP0 SLA Targets

| Metric | Target | Timer |
|--------|--------|-------|
| Steps 1-5 (requester preparation) | 3 business days | Non-interrupting boundary timer on SP0 |
| Step 6 (vendor response) | 10 business days (configurable) | Non-interrupting boundary timer on receive task |
| Steps 7-9 (evaluation + transfer) | 2 business days | Non-interrupting boundary timer |
| **Total SP0** | **15 business days** | Escalation to Concierge at 80% elapsed |

### 4.4 SP0 Abandonment and Cleanup (v1.1)

SP0 requires an abandonment mechanism for requests that stall mid-flight.

**Interrupting boundary timer**: `P20D` (20 calendar days) on SP0 collapsed sub-process. Fires if SP0 has not completed within 20 days of initiation.

**Abandonment flow**:
1. Timer fires → Concierge notification user task ("SP0 has stalled — review and decide")
2. Concierge reviews status, contacts requester
3. Concierge decides: **Resume** (extend timer P10D) or **Cancel** (terminate SP0)
4. Cancel → `End_Abandoned` end event with cleanup service task (archive partial data, notify vendor if applicable)

**Concierge-initiated cancellation**: User task in SP0 allows Concierge to cancel at any time (e.g., requester leaves organization, project deprioritized). Routes to same `End_Abandoned` with cleanup.

**End events in SP0**:
- `End_Completed` — all 9 steps done, transfer to SP1
- `End_Blocked` — deal-killer identified in Step 3
- `End_Abandoned` — timeout or Concierge cancellation

### 4.5 GW_MiniRFP Routing Logic (v1.1)

The `GW_MiniRFP` gateway is **DMN-driven**, not a simple yes/no user decision.

**Routing rules** (evaluated by lightweight DMN or gateway conditions reading OB-DMN-2 output):

| Condition | SP0 Required? | Rationale |
|-----------|--------------|-----------|
| Buy pathway AND `budgetRange` > $25K | **Mandatory** | Significant vendor investment requires structured evaluation |
| Buy pathway AND `budgetRange` <= $25K | Optional | Low-value purchases may proceed directly to SP1 |
| Enable pathway | Optional | Affinity tools have lower risk; requester chooses |
| Build pathway | Skip | No vendor questionnaire needed for internal builds |
| Existing vendor renewal | Optional | Relationship already established; skip if low-risk |
| Pre-approved vendor catalog match | **Skip** | Vendor already vetted; fast-track to SP1 |

### 4.6 Concierge Role Dependency (v1.1)

SP0 Phase 2 deployment requires the **GAP-18 Concierge role** staffed.

**Hard gate**: SP0 cannot be activated in production until at least one Concierge is assigned.

**Fallback**: Any `governance-lane` member serves as interim Concierge with reduced SLA expectations (review within 2 business days instead of 1).

**Concierge responsibilities in SP0**:
- Step 2.5: Classification validation
- Abandonment review (Section 4.4)
- Deadline override approvals
- SP0 portfolio monitoring (active requests, stalled requests, conversion rates)

### 4.7 Vendor Pool Interaction (v1.1)

SP0 introduces a **separate Mini RFP message start event** in the vendor pool. Do NOT reuse `Start_VendorEngagement` from SP3.

**Message flow pattern**:
- Enterprise pool → Vendor pool: `MsgFlow_MiniRFPRequest` (Step 5 → vendor message start)
- Vendor pool → Enterprise pool: `MsgFlow_MiniRFPResponse` (vendor completion → receive task in SP0)

**Vendor pool elements** (Mini RFP path):
- `Start_VendorMiniRFP` — message start event
- `Task_VendorCompleteRFP` — user task (vendor fills questionnaire)
- `End_VendorRFPSubmitted` — end event

### 4.8 Pool Expansion ADR (v1.1)

**Decision**: Inserting SP0 before SP1 requires expanding the Enterprise pool width by +260px and shifting all downstream elements rightward.

**Rationale**: SP0 (100px) + GW_MiniRFP (50px) + spacing (110px) = 260px additional width needed at the left side of the orchestrator.

**Implementation**: Phase 2 scope. Automated script shifts all `dc:Bounds` x-coordinates for elements after the start event. Vendor pool width expanded proportionally.

---

## 5. Question Bank Taxonomy (10 Categories)

Each category has 3 tiers (basic/standard/full) with questions selected dynamically by OB-DMN-8. The question bank is stored as JSON to allow updates without BPMN changes.

### 5.1 Category Overview

| # | Category | Always Active | Conditional Trigger | Est. Questions |
|---|----------|--------------|---------------------|----------------|
| 1 | Company & Financial Stability | Yes (basic) | Skip if existing vendor relationship | 8-15 |
| 2 | Product/Solution Capabilities | Yes | Full if AI/ML platform | 10-20 |
| 3 | Security & Compliance | Yes (basic) | Full if SaaS + confidential/restricted data | 15-25 |
| 4 | Data Privacy & Protection | No | Triggered by PII/PHI/Financial data types | 10-15 |
| 5 | Integration & Architecture | Yes (basic) | Full if on-prem or hybrid deployment | 8-12 |
| 6 | Implementation & Support | Yes (basic) | Standard always | 8-12 |
| 7 | Pricing & Commercial | Yes | Always standard+ | 10-15 |
| 8 | Third-Party Risk (OCC 2023-17) | No | Triggered by regulated industry scope | 10-15 |
| 9 | Operational Resilience | No | Triggered by mission-critical operations | 8-12 |
| 10 | AI Governance | No | Triggered by hasAI = yes | 12-18 |

**Total question bank**: ~100-160 questions. A typical Mini RFP selects 40-80 based on context.

### 5.2 Category 1: Company & Financial Stability

**Governance topics served**: Sourcing, TPRM, Funding

**Tier: Basic** (always active unless existing relationship)

| # | Question | Response Type | Consumers |
|---|----------|--------------|-----------|
| C1.1 | Legal entity name and jurisdiction of incorporation | textfield | PROC, LEG, COMP |
| C1.2 | Year established | number | PROC, GOV |
| C1.3 | Number of employees | select (ranges) | PROC, GOV |
| C1.4 | Annual revenue range | select (ranges) | FIN, PROC |
| C1.5 | Primary business description | textarea | GOV, PROC, EA |
| C1.6 | Parent company / ultimate beneficial owner | textfield | COMP, AUDIT |
| C1.7 | Key customers in financial services | textarea | PROC, GOV |
| C1.8 | Insurance coverage (E&O, cyber liability) | radio + textfield | PROC, LEG |

**Tier: Standard** (adds financial depth)

| # | Question | Response Type | Consumers |
|---|----------|--------------|-----------|
| C1.9 | Most recent audited financial statements available | radio | FIN, AUDIT |
| C1.10 | Any material litigation, regulatory actions, or sanctions in past 5 years | radio + textarea | LEG, COMP, AUDIT |
| C1.11 | Ownership changes or M&A activity in past 2 years | radio + textarea | GOV, PROC |

**Tier: Full** (adds concentration risk)

| # | Question | Response Type | Consumers |
|---|----------|--------------|-----------|
| C1.12 | Revenue concentration -- % from top 3 clients | select (ranges) | FIN, GOV |
| C1.13 | Subcontractors or fourth-party dependencies for service delivery | radio + textarea | PROC, CYBER, COMP |
| C1.14 | Business continuity plan summary | textarea | OPS, CYBER |
| C1.15 | Geographic presence and service delivery locations | textarea | COMP, PRIV |

### 5.3 Category 2: Product/Solution Capabilities

**Governance topics served**: EA, Intake, Prioritization

**Tier: Basic** (always active)

| # | Question | Response Type | Consumers |
|---|----------|--------------|-----------|
| C2.1 | Product/solution name and version | textfield | EA, GOV |
| C2.2 | Product description and key capabilities | textarea | EA, GOV, BUS |
| C2.3 | Technology stack (languages, frameworks, databases) | textarea | EA, CYBER |
| C2.4 | Deployment options (SaaS, on-prem, hybrid) | checklist | EA, CYBER, OPS |
| C2.5 | Current customer count and industry verticals | textfield | PROC, GOV |
| C2.6 | Product roadmap -- major features planned next 12 months | textarea | EA, BUS |
| C2.7 | SLA commitments (uptime, response time) | textarea | OPS, GOV |
| C2.8 | Licensing model (per-user, per-transaction, enterprise) | select | FIN, PROC |
| C2.9 | Supported browsers/platforms | textarea | EA, OPS |
| C2.10 | Mobile support | radio + textarea | EA, BUS |

**Tier: Standard** (adds depth for complex platforms)

| # | Question | Response Type | Consumers |
|---|----------|--------------|-----------|
| C2.11 | Multi-tenancy architecture | select | EA, CYBER |
| C2.12 | Customization/configuration capabilities | textarea | EA, BUS |
| C2.13 | API availability and documentation | radio + textarea | EA, OPS |
| C2.14 | Data export/portability capabilities | textarea | EA, COMP |
| C2.15 | Sandbox/test environment availability | radio | EA, CYBER |

**Tier: Full** (AI/ML platform-specific)

| # | Question | Response Type | Consumers |
|---|----------|--------------|-----------|
| C2.16 | AI/ML model types supported | checklist | AI, EA |
| C2.17 | Model training infrastructure | textarea | AI, EA, CYBER |
| C2.18 | Model lifecycle management capabilities | textarea | AI, EA, OPS |
| C2.19 | Explainability tools (SHAP, LIME, model cards) | checklist | AI, COMP, AUDIT |
| C2.20 | Human-in-the-loop oversight support | radio + textarea | AI, GOV, COMP |

### 5.4 Category 3: Security & Compliance

**Governance topics served**: Cyber, Compliance, TPRM

**Tier: Basic** (always active)

| # | Question | Response Type | Consumers |
|---|----------|--------------|-----------|
| C3.1 | ISO 27001 certification status and expiry | radio + textfield | CYBER, AUDIT, COMP |
| C3.2 | SOC 2 Type II report available | radio | CYBER, AUDIT, COMP |
| C3.3 | Encryption at rest -- algorithm and key length | textfield | CYBER |
| C3.4 | Encryption in transit -- protocol | textfield | CYBER |
| C3.5 | MFA enforcement percentage | textfield | CYBER |
| C3.6 | Incident response SLA | textfield | CYBER, GOV, OPS |
| C3.7 | Security breaches in past 3 years | radio + textarea | CYBER, COMP, AUDIT |
| C3.8 | Vulnerability disclosure policy | radio | CYBER |

**Tier: Standard** (adds for SaaS + internal data)

| # | Question | Response Type | Consumers |
|---|----------|--------------|-----------|
| C3.9 | Privileged access management | radio + textarea | CYBER |
| C3.10 | Access review frequency | textfield | CYBER, COMP |
| C3.11 | Last penetration test date and executive summary | textfield + textarea | CYBER, AUDIT |
| C3.12 | Mean time to patch critical vulnerabilities | textfield | CYBER, OPS |
| C3.13 | BCP/DR plan | radio | OPS, CYBER |
| C3.14 | RTO and RPO commitments | textfield + textfield | OPS, CYBER |
| C3.15 | DR test frequency | textfield | OPS, CYBER |
| C3.16 | SSO/SAML/OIDC integration support | checklist | CYBER, EA |
| C3.17 | PCI DSS compliance | radio | CYBER, COMP |

**Tier: Full** (SaaS + confidential/restricted data)

| # | Question | Response Type | Consumers |
|---|----------|--------------|-----------|
| C3.18 | Data center locations and certifications | textarea | CYBER, COMP, PRIV |
| C3.19 | Security Operations Center (SOC) -- 24/7 monitoring | radio + textarea | CYBER, OPS |
| C3.20 | Third-party security audit frequency | textfield | CYBER, AUDIT |
| C3.21 | Supply chain security controls | textarea | CYBER, COMP |
| C3.22 | FedRAMP or equivalent government certification | radio | CYBER, COMP |
| C3.23 | Adversarial attack evaluation (model inversion, prompt injection) | textarea | CYBER, AI |
| C3.24 | Model drift and data poisoning detection controls | textarea | CYBER, AI |
| C3.25 | Network segmentation and micro-segmentation | textarea | CYBER, EA |

### 5.5 Category 4: Data Privacy & Protection

**Governance topics served**: Privacy, Compliance

**Triggered by**: `dataClassification` in [PII, PHI, Financial] or `dataTypes` includes PII/PHI/Financial

| # | Question | Response Type | Consumers |
|---|----------|--------------|-----------|
| C4.1 | Data processing locations (countries) | textarea | PRIV, COMP |
| C4.2 | Cross-border data transfer mechanisms (SCCs, adequacy decisions) | textarea | PRIV, LEG |
| C4.3 | Data retention policy and configurable retention periods | textarea | PRIV, COMP |
| C4.4 | Data subject rights support (access, deletion, portability) | checklist | PRIV, COMP |
| C4.5 | Sub-processors list and notification process for changes | radio + textarea | PRIV, COMP, PROC |
| C4.6 | Data Protection Impact Assessment (DPIA) conducted | radio | PRIV, COMP |
| C4.7 | Privacy by design and by default practices | textarea | PRIV, COMP |
| C4.8 | Customer data used for model training | radio | PRIV, AI, LEG |
| C4.9 | Opt-out mechanism for training data usage | radio + textarea | PRIV, LEG |
| C4.10 | Data lineage and provenance tracking | radio + textarea | PRIV, AI, AUDIT |
| C4.11 | Privacy-enhancing technologies (federated learning, differential privacy) | checklist | PRIV, AI, CYBER |
| C4.12 | Data classification and sensitivity labeling support | radio + textarea | PRIV, CYBER |
| C4.13 | Breach notification timeline and process | textarea | PRIV, CYBER, LEG |
| C4.14 | Data anonymization/pseudonymization capabilities | radio + textarea | PRIV, AI |
| C4.15 | Cookie and tracking consent management | radio | PRIV, COMP |
| C4.16 | For each processing activity, classify vendor role: data controller, data processor, or joint controller per GDPR Art. 26-28 | select + textarea | PRIV, LEG, COMP |

### 5.6 Category 5: Integration & Architecture

**Governance topics served**: EA, Cyber

**Tier: Basic** (always active)

| # | Question | Response Type | Consumers |
|---|----------|--------------|-----------|
| C5.1 | API types available (REST, GraphQL, SOAP, gRPC) | checklist | EA, OPS |
| C5.2 | Authentication methods for API access | checklist | EA, CYBER |
| C5.3 | Webhook/event notification support | radio | EA, OPS |
| C5.4 | Data import/export formats (CSV, JSON, XML, Parquet) | checklist | EA |
| C5.5 | Pre-built integrations with common enterprise tools | textarea | EA, BUS |
| C5.6 | Rate limiting and throttling policies | textarea | EA, OPS |
| C5.7 | API versioning and deprecation policy | textarea | EA |
| C5.8 | SDK availability (languages/platforms) | textarea | EA |

**Tier: Full** (on-prem or hybrid deployment)

| # | Question | Response Type | Consumers |
|---|----------|--------------|-----------|
| C5.9 | Infrastructure requirements (CPU, memory, storage) | textarea | EA, OPS |
| C5.10 | Network requirements (ports, protocols, bandwidth) | textarea | EA, CYBER |
| C5.11 | Database requirements and supported databases | textarea | EA |
| C5.12 | Container/orchestration support (Docker, Kubernetes) | checklist | EA, OPS |

### 5.7 Category 6: Implementation & Support

**Governance topics served**: EA, Intake

**Standard tier** (always active)

| # | Question | Response Type | Consumers |
|---|----------|--------------|-----------|
| C6.1 | Typical implementation timeline | textfield | BUS, GOV, EA |
| C6.2 | Implementation methodology | textarea | EA, BUS |
| C6.3 | Training options (on-site, virtual, self-paced) | checklist | BUS |
| C6.4 | Support tiers and SLAs (response time, resolution time) | textarea | OPS, BUS |
| C6.5 | Support channels (phone, email, chat, portal) | checklist | OPS, BUS |
| C6.6 | Dedicated account manager/CSM | radio | BUS, PROC |
| C6.7 | Knowledge base and documentation quality | select | BUS, EA |
| C6.8 | Escalation process for critical issues | textarea | OPS, GOV |
| C6.9 | Release frequency and change management process | textarea | EA, OPS |
| C6.10 | Migration/upgrade path and backward compatibility | textarea | EA, OPS |
| C6.11 | Professional services availability and rates | radio + textarea | FIN, BUS |
| C6.12 | User community and ecosystem | textarea | BUS |

### 5.8 Category 7: Pricing & Commercial

**Governance topics served**: Funding, Commercial Counsel

**Standard tier** (always active)

| # | Question | Response Type | Consumers |
|---|----------|--------------|-----------|
| C7.1 | Pricing model (per user, per transaction, flat fee, consumption) | select | FIN, PROC |
| C7.2 | Base price for estimated usage | textfield | FIN, PROC |
| C7.3 | Implementation/onboarding fees | textfield | FIN |
| C7.4 | Annual maintenance/support fees | textfield | FIN |
| C7.5 | Volume discount tiers | textarea | FIN, PROC |
| C7.6 | Contract term options (monthly, annual, multi-year) | checklist | LEG, FIN |
| C7.7 | Auto-renewal and termination terms | textarea | LEG |
| C7.8 | Price escalation caps | textarea | FIN, LEG |
| C7.9 | Payment terms | textarea | FIN |
| C7.10 | Total cost of ownership estimate (3-year) | textarea | FIN, GOV |
| C7.11 | Hidden costs (data egress, overage charges, premium features) | textarea | FIN, PROC |
| C7.12 | Proof of concept/pilot pricing | textarea | FIN, BUS |
| C7.13 | Exit costs and data extraction fees | textarea | FIN, LEG |
| C7.14 | Reference pricing from comparable financial services clients | textarea | FIN, PROC |
| C7.15 | Contract value threshold for executive approval | select (ranges) | GOV, AUDIT |

### 5.9 Category 8: Third-Party Risk (OCC 2023-17)

**Governance topics served**: TPRM, Compliance

**Triggered by**: `regulatoryScope` includes OCC 2023-17, or `dataClassification` in [Confidential, Restricted]

| # | Question | Response Type | Consumers |
|---|----------|--------------|-----------|
| C8.1 | Formal third-party risk management program | radio + textarea | GOV, COMP |
| C8.2 | Risk assessment methodology | textarea | GOV, COMP |
| C8.3 | Subcontractor/fourth-party oversight program | radio + textarea | GOV, COMP, PROC |
| C8.4 | Regulatory examination history (past 3 years) | textarea | COMP, AUDIT |
| C8.5 | Consent to audit rights | radio | AUDIT, LEG |
| C8.6 | Notification requirements for material changes | textarea | GOV, LEG |
| C8.7 | Contingency planning for vendor failure/exit | textarea | GOV, OPS |
| C8.8 | Key person dependencies and succession planning | textarea | GOV, PROC |
| C8.9 | Geographic risk factors (sanctions, political stability) | textarea | COMP, GOV |
| C8.10 | Concentration risk -- services provided to other clients in same industry | textarea | GOV, COMP |
| C8.11 | Right to terminate without penalty for regulatory non-compliance | radio | LEG, COMP |
| C8.12 | Data return and destruction obligations upon termination | textarea | PRIV, LEG, CYBER |
| C8.13 | Compliance with OCC 2023-17 third-party risk management guidance | radio + textarea | COMP, GOV |
| C8.14 | Independent audit reports (SOC 1, SOC 2, ISAE 3402) | checklist | AUDIT, COMP |
| C8.15 | Remediation tracking for identified risk findings | radio + textarea | GOV, COMP |
| C8.16 | DORA Information Register data: service description, data types, criticality assessment, recovery objectives (RTS Article 30) | textarea | COMP, GOV, OPS |
| C8.17 | Exit strategy: detailed transition plan, data migration approach, timeline, alternative providers identified | textarea | GOV, LEG, OPS |
| C8.18 | DORA incident reporting: can vendor meet 4-hour initial notification, 72-hour intermediate report, 1-month final report timelines? | radio + textarea | COMP, CYBER, GOV |
| C8.19 | Threat-Led Penetration Testing (TLPT): has vendor undergone TLPT per DORA Art. 26? Scope and results summary | radio + textarea | CYBER, COMP, AUDIT |

### 5.10 Category 9: Operational Resilience

**Governance topics served**: Cyber, EA, TPRM

**Triggered by**: `criticality` in [critical, significant] or `technologyType` = "Infrastructure"

| # | Question | Response Type | Consumers |
|---|----------|--------------|-----------|
| C9.1 | Uptime SLA and historical uptime (past 12 months) | textfield + textfield | OPS, GOV |
| C9.2 | Redundancy and failover architecture | textarea | EA, CYBER, OPS |
| C9.3 | Geographic redundancy (multi-region/multi-AZ) | radio + textarea | EA, OPS |
| C9.4 | Disaster recovery RTO/RPO by service tier | textarea | OPS, CYBER |
| C9.5 | Last DR test date and results summary | textfield + textarea | OPS, AUDIT |
| C9.6 | Incident management process (ITIL or equivalent) | textarea | OPS, GOV |
| C9.7 | Status page and real-time monitoring availability | radio + textfield | OPS, BUS |
| C9.8 | Capacity planning and auto-scaling capabilities | textarea | EA, OPS |
| C9.9 | Dependency mapping (critical upstream/downstream services) | textarea | EA, OPS, CYBER |
| C9.10 | Planned maintenance windows and notification process | textarea | OPS, BUS |
| C9.11 | DORA compliance (if EU-regulated) | radio + textarea | COMP, OPS |
| C9.12 | Maximum tolerable downtime per month | textfield | OPS, GOV |

### 5.11 Category 10: AI Governance

**Governance topics served**: AI Governance, Compliance, Privacy

**Triggered by**: `hasAI` = "yes"

| # | Question | Response Type | Consumers |
|---|----------|--------------|-----------|
| C10.1 | AI/ML models used (names, versions, types) | textarea | AI, CYBER, EA |
| C10.2 | Model manages own models or uses third-party APIs | select | AI, CYBER, EA |
| C10.3 | AI governance policies documentation | radio + textarea | AI, COMP, GOV |
| C10.4 | Designated AI risk management owner/team | radio + textarea | AI, GOV, AUDIT |
| C10.5 | Model versioning, audit trails, and change logs | radio + textarea | AI, AUDIT, COMP |
| C10.6 | Ethical review and bias mitigation mechanisms | radio + textarea | AI, COMP, PRIV |
| C10.7 | Fairness, bias, and drift monitoring metrics | radio + textarea | AI, COMP, PRIV |
| C10.8 | AI performance metrics tracked over time | radio + textarea | AI, GOV, OPS |
| C10.9 | Explainability tools available | checklist | AI, COMP, AUDIT |
| C10.10 | Customer data used for model training + opt-out | radio + textarea | AI, PRIV, LEG |
| C10.11 | Adversarial attack evaluation (model inversion, prompt injection) | textarea | AI, CYBER |
| C10.12 | Model drift and poisoning detection controls | textarea | AI, CYBER |
| C10.13 | Continuous monitoring and alerting for AI systems | radio + textarea | AI, OPS, CYBER |
| C10.14 | Rollback and fail-safe mechanisms | radio + textarea | AI, CYBER, OPS |
| C10.15 | Incident response protocol specific to AI failures | textarea | AI, CYBER, GOV |
| C10.16 | MCP (Model Context Protocol) support and management | radio + textarea | AI, EA, CYBER |
| C10.17 | EU AI Act risk classification (if applicable) | select + textarea | AI, COMP |
| C10.18 | Human-in-the-loop oversight capabilities | radio + textarea | AI, GOV, COMP |
| C10.19 | EU AI Act conformity assessment status (for high-risk AI systems per Annex III) | select + textarea | AI, COMP, AUDIT |
| C10.20 | EU AI Database registration status (Art. 71) | radio + textfield | AI, COMP |
| C10.21 | Model risk tier classification for institution's SR 11-7 model inventory | select + textarea | AI, GOV, AUDIT |

> **v1.1 note**: C10.19-C10.20 address EU AI Act conformity gaps. C10.21 addresses SR 11-7 model inventory requirements. Questions C10.11 and C10.12 overlap with C3.23 and C3.24; the Cat 10 versions focus on AI-specific attack vectors while Cat 3 covers general security. Both are retained — Cat 3 is always active, Cat 10 only when `hasAI` = "yes".

> **FS-ISAC GenAI alignment** (v1.1): Cat 10 questions map to FS-ISAC's 5 GenAI risk domains: (1) Model Risk, (2) Data Risk, (3) Operational Risk, (4) Third-Party Risk, (5) Compliance Risk. Each question includes `fsIsacDomain` metadata in the question bank JSON.

### 5.12 Question Bank Summary

| Category | Basic | Standard | Full | Total | Weight |
|----------|-------|----------|------|-------|--------|
| 1. Company & Financial Stability | 8 | 3 | 4 | 15 | 0% (context only) |
| 2. Product/Solution Capabilities | 10 | 5 | 5 | 20 | 20% |
| 3. Security & Compliance | 8 | 9 | 8 | 25 | 25% |
| 4. Data Privacy & Protection | -- | -- | 16 | 16 | 10% |
| 5. Integration & Architecture | 8 | -- | 4 | 12 | 10% |
| 6. Implementation & Support | -- | 12 | -- | 12 | 0% (context only) |
| 7. Pricing & Commercial | -- | 15 | -- | 15 | 15% |
| 8. Third-Party Risk (OCC 2023-17) | -- | -- | 19 | 19 | 15% |
| 9. Operational Resilience | -- | -- | 12 | 12 | 0% (context only) |
| 10. AI Governance | -- | -- | 21 | 21 | 5% |
| **Total** | **34** | **44** | **89** | **167** | **100%** |

> **v1.1 changes**: +1 question (C4.16), +4 questions (C8.16-C8.19), +3 questions (C10.19-C10.21). Total: 167 (was 159). Weights are defaults — configurable per engagement via OB-DMN-8 output (see Section 6.6).

### 5.13 Question Tier Thresholds (v1.1)

Research-validated completion rate data (Survicate n=267K, 2024) informs tier sizing:

| Tier | Target Questions | Completion Rate | Use Case |
|------|-----------------|-----------------|----------|
| Minimal | 12-15 | 89% | Enable pathway, sub-$25K, pre-approved vendor |
| Basic | 20-30 | 73% | Standard Buy, low-risk |
| Standard | 40-60 | 58% | Buy >$25K, regulated |
| Full | 60+ | 42% | High-risk, AI, critical infrastructure |

**Micro-RFP variant** (v1.1): For Enable pathway or sub-$25K engagements, OB-DMN-8 outputs a "minimal" tier selecting 12-15 highest-priority questions across 3-4 categories. This addresses the vendor fatigue risk (61+ questions in v1.0 minimum scenario).

**Typical Mini RFP size by scenario**:

| Scenario | Categories Active | Est. Questions |
|----------|------------------|----------------|
| Low-risk SaaS tool, public data | 1(B), 2(B), 3(B), 5(B), 6(S), 7(S) | ~61 |
| AI platform, confidential data, regulated | 1(B), 2(F), 3(F), 4, 5(B), 6(S), 7(S), 8, 10 | ~135 |
| On-prem infrastructure, mission-critical | 1(S), 2(S), 3(S), 5(F), 6(S), 7(S), 9 | ~83 |
| Existing vendor, new SaaS product, PII | 2(B), 3(S), 4, 5(B), 6(S), 7(S) | ~69 |

---

## 6. Dynamic Question Selection -- OB-DMN-8

### 6.1 Decision Table Specification

| Attribute | Value |
|-----------|-------|
| ID | `OB_DMN_QuestionSelection` |
| Name | OB-DMN-8: Mini RFP Question Selection |
| Hit Policy | COLLECT (multiple rules can fire) |
| Namespace | `http://camunda.org/schema/1.0/dmn` |

### 6.2 Inputs

| Input | Variable | Type | Values |
|-------|----------|------|--------|
| Technology Type | `technologyType` | string | SaaS, OnPrem, API, AI_ML, Infrastructure, DataPlatform, Other |
| Deployment Model | `deploymentModel` | string | cloud, on-premise, hybrid, unknown |
| Data Classification | `dataClassification` | string | public, internal, confidential, restricted |
| AI Involvement | `hasAI` | string | yes, no, unsure |
| Existing Vendor Relationship | `existingRelationship` | string | yes, no |
| Regulatory Scope | `regulatoryScope` | list(string) | GDPR, CCPA, HIPAA, SOX, EU_AI_Act, DORA, OCC_2023_17, None |
| Data Types | `dataTypes` | list(string) | PII, PHI, Financial, Public, IP, OtherRegulated |
| Business Criticality | `businessCriticality` | string | mission-critical, significant, standard, exploratory |
| RFP Urgency | `rfpUrgency` | string | critical, high, standard, exploratory |
| Budget Range | `budgetRange` | string | under_25k, 25k_100k, 100k_500k, over_500k, unknown |
| Existing Assessments | `existingAssessments` | list(string) | SIG_Lite, SOC2_TypeII, ISO_27001, PCI_DSS, HITRUST, None |

### 6.3 Outputs

| Output | Variable | Type | Description |
|--------|----------|------|-------------|
| Category ID | `categoryId` | integer | 1-10 |
| Category Name | `categoryName` | string | Human-readable name |
| Tier | `tier` | string | basic, standard, full |
| Required | `required` | boolean | Can requester remove this category? |

### 6.4 Key Rules

| Rule | Condition | Category | Tier | Required |
|------|-----------|----------|------|----------|
| R1 | `existingRelationship` = "no" | 1 (Company) | basic | yes |
| R2 | `existingRelationship` = "yes" | 1 (Company) | -- | skip |
| R3 | Always | 2 (Product) | basic | yes |
| R4 | `technologyType` = "AI_ML" | 2 (Product) | full | yes |
| R5 | Always | 3 (Security) | basic | yes |
| R6 | `deploymentModel` = "cloud" AND `dataClassification` in ["confidential","restricted"] | 3 (Security) | full | yes |
| R7 | `dataTypes` contains any of ["PII","PHI","Financial"] | 4 (Privacy) | full | yes |
| R8 | Always | 5 (Integration) | basic | yes |
| R9 | `deploymentModel` in ["on-premise","hybrid"] | 5 (Integration) | full | yes |
| R10 | Always | 6 (Implementation) | standard | yes |
| R11 | Always | 7 (Pricing) | standard | yes |
| R12 | `regulatoryScope` contains "OCC_2023_17" OR `dataClassification` in ["confidential","restricted"] | 8 (TPRM) | full | no |
| R13 | `businessCriticality` in ["mission-critical","significant"] OR `technologyType` = "Infrastructure" | 9 (Resilience) | full | no |
| R14 | `hasAI` = "yes" | 10 (AI Gov) | full | yes |
| R15 | `hasAI` = "unsure" AND `technologyType` = "AI_ML" | 10 (AI Gov) | full | yes |
| R16 | `budgetRange` = "under_25k" | ALL active | **minimal** | no |
| R17 | `existingAssessments` contains "SOC2_TypeII" | 3 (Security) | reduce: skip C3.1-C3.2, C3.9-C3.15 | no |
| R18 | `existingAssessments` contains "ISO_27001" | 3 (Security) | reduce: skip C3.1, C3.16, C3.18-C3.20 | no |
| R19 | `existingAssessments` contains "SIG_Lite" | 1,3,4,8 (Company, Security, Privacy, TPRM) | reduce: skip overlapping SIG Lite domains | no |

> **v1.1 note**: R16 enables the "micro-RFP" variant — 12-15 questions for low-value engagements. R17-R19 reduce questionnaire length when vendors have existing assessments, avoiding redundant questions already answered in industry-standard formats.

### 6.5 Compatibility with Existing DMN Tables

OB-DMN-8 shares input variables with existing tables:

| Variable | Also Used By | Consistency |
|----------|-------------|-------------|
| `hasAI` | SP1 forms, OB-DMN-1 (risk tier) | Direct -- same values |
| `dataClassification` | OB-DMN-1 (risk tier), SP1 forms | Direct -- same enum |
| `deploymentModel` | SP1 `sp1-gather-documentation.form` | Direct -- same values |
| `regulatoryScope` | SP1 `applicableRegulations` | Mapped -- SP1 uses `applicableRegulations`, SP0 uses `regulatoryScope`; transfer maps them |

### 6.6 Weighted Scoring Framework (v1.1)

Category weights determine the overall vendor score. Defaults are set by OB-DMN-8 output and adjustable per engagement in Step 4 (Preview).

| Category | Default Weight | Rationale |
|----------|---------------|-----------|
| 2. Product/Solution | 20% | Core capability fit |
| 3. Security | 25% | Highest risk domain for FS |
| 4. Privacy | 10% | Data protection compliance |
| 5. Integration | 10% | Technical fit |
| 7. Pricing | 15% | Commercial viability |
| 8. TPRM | 15% | Regulatory compliance (OCC 2023-17) |
| 10. AI Governance | 5% | Emerging risk domain |
| 1, 6, 9 | 0% | Context-only categories (not scored) |

**Scoring formula**: `overallScore = SUM(categoryWeight[i] * categoryScore[i])` where `categoryScore[i]` = average of question-level 1-5 rubric scores within category, normalized to 0-100.

**Weight adjustment rules**:
- If category is inactive (not selected by OB-DMN-8), its weight redistributes proportionally to active categories
- Requester can adjust weights ±10% per category in Step 4 (Concierge override for larger adjustments)
- Weight configuration stored as `categoryWeights` process variable for audit trail

### 6.7 Question Bank JSON Schema (v1.1)

Each question in the bank follows this schema, enabling rubric scoring, framework traceability, and evidence uploads:

```json
{
  "id": "C3.1",
  "category": 3,
  "tier": "basic",
  "text": "ISO 27001 certification status and expiry",
  "responseType": "scale",
  "responseOptions": ["Not certified", "In progress", "Certified (expired)", "Certified (current)", "Certified + surveillance audit current"],
  "rubric": {
    "1": "No ISO 27001 certification and no plans to pursue",
    "2": "ISO 27001 in progress but not yet certified",
    "3": "ISO 27001 certified but expired within past 12 months",
    "4": "ISO 27001 certified and current",
    "5": "ISO 27001 certified with current surveillance audit and SOA"
  },
  "evidenceUpload": true,
  "evidenceDescription": "Upload ISO 27001 certificate and Statement of Applicability",
  "consumers": ["CYBER", "AUDIT", "COMP"],
  "frameworkMappings": {
    "sig": "A.1",
    "nist": "ID.GV-1",
    "occ": "III.C.1",
    "iso27001": "4.1-4.4"
  },
  "fsIsacDomain": null,
  "dataProvenance": "vendor-reported",
  "required": true,
  "conditionalOn": null
}
```

**Key schema fields** (v1.1 additions):
- `responseType`: `"scale"` | `"narrative"` | `"boolean"` | `"select"` | `"checklist"` — replaces v1.0 yes/no-heavy approach with differentiated response types
- `rubric`: 1-5 scoring definition per question — enables consistent evaluation
- `evidenceUpload`: boolean — vendor can attach SOC 2 reports, ISO certs, pen test summaries for Cat 3, 4, 8
- `frameworkMappings`: maps to SIG domains, NIST controls, OCC sections — enables regulatory traceability
- `fsIsacDomain`: FS-ISAC GenAI risk domain (Cat 10 only) — 1=Model Risk, 2=Data Risk, 3=Operational Risk, 4=Third-Party Risk, 5=Compliance Risk
- `dataProvenance`: always `"vendor-reported"` for SP0-sourced data; SP3 reviewers see visual distinction from verified data

### 6.8 Question Bank Governance (v1.1)

| Responsibility | Owner | Cadence |
|---------------|-------|---------|
| Question content updates | Category SME (per consumer codes) | Quarterly |
| Rubric calibration | Governance lane + category SME | Semi-annual |
| Framework mapping updates | Compliance lane | On regulatory change (SP-Cross-4) |
| Weight default adjustments | Process owner (Concierge) | Annual review |
| New category proposals | Any governance lane | Ad-hoc, approved by governance board |

---

## 7. Team Engagement Routing -- OB-DMN-9

### 7.1 Decision Table Specification

| Attribute | Value |
|-----------|-------|
| ID | `OB_DMN_TeamEngagementRouting` |
| Name | OB-DMN-9: Team Engagement Routing |
| Hit Policy | COLLECT (multiple rules can fire) |
| Namespace | `http://camunda.org/schema/1.0/dmn` |

### 7.2 Inputs

These inputs come from vendor Mini RFP responses (Step 7 data):

| Input | Variable | Type | Source |
|-------|----------|------|--------|
| SOC 2 Type II Available | `vendor.soc2Type2Available` | string | C3.2 |
| Data Classification | `dataClassification` | string | Step 2 (requester) |
| AI Involvement | `hasAI` | string | Step 1 (requester) |
| Cross-Border Data Transfer | `vendor.crossBorderTransfer` | boolean | Derived from C4.1 |
| Contract Value Range | `budgetRange` | string | Step 1 (requester) |
| Deployment Model | `deploymentModel` | string | Step 2 (requester) |
| Data Types | `dataTypes` | list(string) | Step 2 (requester) |
| Regulatory Scope | `regulatoryScope` | list(string) | Step 2 (requester) |
| ISO 27001 Certified | `vendor.iso27001Certified` | string | C3.1 |
| Vendor Certification Gaps | `vendor.certificationGapCount` | integer | Derived from C3 responses |

### 7.3 Outputs

| Output | Variable | Type | Description |
|--------|----------|------|-------------|
| Lane | `engagedLane` | string | candidateGroups value |
| Engagement Level | `engagementLevel` | string | standard, enhanced, full |
| Estimated Days | `estimatedDays` | integer | Expected review duration |
| Reason | `engagementReason` | string | Why this lane engages |

### 7.4 Key Rules

| Rule | Condition | Lane | Level | Est. Days | Reason |
|------|-----------|------|-------|-----------|--------|
| R1 | Always | `governance-lane` | standard | 2 | All requests require governance triage |
| R2 | `vendor.soc2Type2Available` = "no" AND `dataClassification` in ["confidential","restricted"] | `technical-assessment` | enhanced | 8 | Missing SOC 2 + sensitive data requires enhanced security review |
| R3 | `vendor.soc2Type2Available` = "yes" AND `dataClassification` = "internal" | `technical-assessment` | standard | 3 | Standard security review |
| R4 | `hasAI` = "yes" | `ai-review` | full | 5 | AI system requires AI governance review |
| R5 | `vendor.crossBorderTransfer` = true | `compliance-lane` | enhanced | 5 | Cross-border data requires compliance + privacy review |
| R6 | `dataTypes` contains any of ["PII","PHI"] | `compliance-lane` | standard | 3 | Personal data requires compliance review |
| R7 | `budgetRange` = "500k+" | `contracting-lane` | full | 7 | High-value contract requires full contracting review |
| R8 | `budgetRange` = "500k+" | `oversight-lane` | standard | 3 | High-value contract requires oversight |
| R9 | `regulatoryScope` contains "OCC_2023_17" | `governance-lane` | enhanced | 5 | TPRM-regulated engagement requires enhanced governance |
| R10 | `vendor.certificationGapCount` > 3 | `technical-assessment` | full | 10 | Multiple certification gaps require full security assessment |
| R11 | `deploymentModel` = "on-premise" | `technical-assessment` | enhanced | 5 | On-prem requires enhanced architecture review |
| R12 | `regulatoryScope` contains "EU_AI_Act" AND `hasAI` = "yes" | `compliance-lane` | full | 5 | EU AI Act compliance review |

### 7.5 Output Aggregation

When multiple rules fire for the same lane, the highest engagement level and longest estimated days take precedence. The Step 9 display aggregates:

```
Governance lanes engaged: 4 of 8
  - Governance (enhanced) — 5 days — TPRM-regulated engagement
  - Technical Assessment (full) — 10 days — Multiple certification gaps
  - AI Review (full) — 5 days — AI system governance
  - Compliance (enhanced) — 5 days — Cross-border data transfer

Estimated SP3 duration: 10 days (parallel engagement, longest lane governs)
Estimated total timeline: 30-45 days (Buy pathway, high-risk tier)
```

---

## 8. Fail-Fast Logic (3 Stages)

### 8.1 Stage 1: Pre-RFP (Step 3)

Hard blocks that terminate SP0 before investing vendor time.

| Check | Source | Trigger | Outcome |
|-------|--------|---------|---------|
| Blocked vendor list | OB-DMN-7 | `vendorName` matches blocked list | `End_Blocked` -- "Vendor is on the internal blocked vendor list" |
| Prohibited AI model | OB-DMN-7 | `aiModelName` matches prohibited list | `End_Blocked` -- "AI model is on the prohibited model list" |
| Data residency violation | OB-DMN-7 | `dataResidencyRequirement` = "Non-Compliant" | `End_Blocked` -- "Data residency requirement cannot be satisfied" |
| Budget freeze | Service task | Cost center under active freeze | `End_Blocked` -- "Budget freeze active for this cost center" |
| OFAC/sanctions match | OB-DMN-7 | `vendorSanctionsStatus` = "Blocked" | `End_Blocked` -- "Vendor appears on OFAC sanctions list (OCC 2023-17)" |
| Compliance blocker | OB-DMN-7 | `complianceBlocker` = true | `End_Blocked` -- "Compliance blocker identified" |

### 8.2 Stage 2: During Review (Step 7)

Warning flags surfaced on the comparison view. These do not block progression but require requester acknowledgment.

| Check | Source | Trigger | Flag |
|-------|--------|---------|------|
| Missing required certifications | C3.1, C3.2 | No SOC 2 + no ISO 27001 + confidential data | "Vendor lacks baseline security certifications for this data classification" |
| Pricing misalignment | C7.2, C7.10 | Vendor pricing > 2x budget range | "Vendor pricing significantly exceeds stated budget" |
| Geographic sovereignty | C4.1, C3.18 | Data residency in non-approved jurisdiction + restricted data | "Data residency may violate sovereignty requirements" |
| AI governance gaps | C10.3, C10.4 | No AI governance program + AI platform | "Vendor has no formal AI governance program" |
| Breach history | C3.7 | Breach in past 12 months | "Recent security breach -- requires enhanced security review" |
| Fourth-party risk | C8.3 | No fourth-party oversight + critical service | "No fourth-party oversight for critical service dependency" |

### 8.3 Stage 3: Post-Review Advisory (Step 9)

Advisory recommendations when systemic issues are detected.

| Check | Source | Trigger | Advisory |
|-------|--------|---------|----------|
| All vendors fail same category | Competitive bid comparison | All evaluated vendors score < 30% in any category | "No vendor meets requirements for [category]. Consider Build pathway or expanded vendor search." |
| Sole viable source | Competitive bid comparison | Only 1 of 3+ vendors passes minimum thresholds | "Single viable vendor identified. Consider sole-source risk mitigation." |
| Timeline mismatch | OB-DMN-9 output | Estimated timeline > 2x requester urgency expectation | "Estimated timeline significantly exceeds urgency level. Discuss with Concierge." |

---

## 9. Competitive Bid Workflow

### 9.1 Activation

Triggered when `competitiveBid` = "yes" in Step 2. Minimum 2 vendors, recommended 3.

### 9.2 BPMN Pattern (Dual-Engine)

Multi-instance sub-process with `vendorList` collection variable. Both C7 and C8 patterns shown:

**Camunda 7 (base authoring)**:
```xml
<bpmn:subProcess id="SP0_VendorCollection" name="Collect&#10;Vendor Response">
  <bpmn:multiInstanceLoopCharacteristics isSequential="false"
    camunda:collection="vendorList" camunda:elementVariable="currentVendor" />
  <!-- Send questionnaire, await response, track deadline per vendor -->
</bpmn:subProcess>
```

**Camunda 8 / Zeebe (generated via migrate-c7-to-c8.py)**:
```xml
<bpmn:subProcess id="SP0_VendorCollection" name="Collect&#10;Vendor Response">
  <bpmn:multiInstanceLoopCharacteristics isSequential="false">
    <bpmn:extensionElements>
      <zeebe:loopCharacteristics inputCollection="=vendorList" inputElement="currentVendor" />
    </bpmn:extensionElements>
  </bpmn:multiInstanceLoopCharacteristics>
  <!-- Send questionnaire, await response, track deadline per vendor -->
</bpmn:subProcess>
```

### 9.2.1 Receive Task Message Definition (v1.1)

The receive task for vendor responses requires a message definition with correlation key:

**Camunda 7**:
```xml
<bpmn:message id="Message_VendorRFPResponse" name="VendorRFPResponse" />

<bpmn:receiveTask id="Receive_VendorRFPResponse" name="Await&#10;Vendor Response"
  messageRef="Message_VendorRFPResponse">
  <bpmn:extensionElements>
    <camunda:correlationKey>${vendorToken}</camunda:correlationKey>
  </bpmn:extensionElements>
</bpmn:receiveTask>
```

**Camunda 8 / Zeebe**:
```xml
<bpmn:message id="Message_VendorRFPResponse" name="VendorRFPResponse" />

<bpmn:receiveTask id="Receive_VendorRFPResponse" name="Await&#10;Vendor Response"
  messageRef="Message_VendorRFPResponse">
  <bpmn:extensionElements>
    <zeebe:subscription correlationKey="=vendorToken" />
  </bpmn:extensionElements>
</bpmn:receiveTask>
```

`vendorToken` is a unique token generated per vendor in Step 5 and included in the vendor portal link.

### 9.3 Flow

1. Step 5 creates `vendorList` collection with contact details per vendor
2. Multi-instance sub-process distributes identical questionnaires via unique portal links
3. Each vendor responds independently with configurable deadline (default: 10 business days)
4. Responses collected in parallel; partial submissions tracked per vendor
5. Step 7 displays side-by-side comparison with category-level scoring

### 9.4 Scoring Model

Category-level scoring (0-100) based on response completeness and deal-killer flags:

| Score Range | Label | Color |
|-------------|-------|-------|
| 80-100 | Strong | Green |
| 60-79 | Adequate | Yellow |
| 40-59 | Gaps Identified | Orange |
| 0-39 | Significant Concerns | Red |

**Overall score**: Weighted average across active categories. Weights configurable per engagement (default: equal weighting).

### 9.5 Vendor Selection

Requester selects winning vendor in Step 7. Selected vendor's responses transfer to intake (Step 8). Non-selected vendor data retained for audit trail but not transferred to process variables.

---

## 10. Intake Transfer Mapping

### 10.1 SP0 to SP1 Field Mapping

Fields from Mini RFP wizard steps that map directly to `sp1-gather-documentation.form` fields:

| SP0 Source | SP0 Variable | SP1 Target Field | SP1 Key | Notes |
|------------|-------------|------------------|---------|-------|
| Step 1 | `primaryUseCase` | Business Problem Description | `businessProblem` | Direct |
| Step 1 | `rfpUrgency` | Urgency | `urgencyLevel` | Direct (same enum values) |
| Step 1 | `budgetRange` | Estimated Annual Budget | `estimatedBudget` | Direct (same enum values) |
| Step 1 | `hasAI` | AI/ML Involvement | `hasAI` | Direct |
| Step 2 | `deploymentModel` | Deployment Model Preference | `deploymentModel` | Direct (same enum values) |
| Step 2 | `dataClassification` | -- | `dataClassification` | New SP1 variable (not in current form) |
| Step 2 | `regulatoryScope` | Applicable Regulations | `applicableRegulations` | Map: `regulatoryScope` array to `applicableRegulations` checklist |
| Step 1 | `technologyType` | -- | `technologyType` | New SP1 variable |
| Step 2 | `vendorName` | -- | `vendorName` | New SP1 variable |

### 10.2 SP0 to SP1 Organizational Fields

| SP0 Source | SP0 Variable | SP1 Target Field | SP1 Key | Notes |
|------------|-------------|------------------|---------|-------|
| Step 1 | `primaryUseCase` | Intended Use Cases | `intendedUseCases` | Copied to both fields |
| Step 3 | `hasExecutiveSponsor` | -- | `hasExecutiveSponsor` | New SP1 variable |

### 10.3 Vendor Response to SP3 Form Fields

Fields from vendor Mini RFP responses that map to downstream SP3 vendor forms:

| Vendor Response | Category.Question | SP3 Target Form | SP3 Key | Notes |
|----------------|-------------------|-----------------|---------|-------|
| C3.1 | Security: ISO 27001 | vendor-security-review.form | `iso27001Certified` | Direct |
| C3.2 | Security: SOC 2 | vendor-security-review.form | `soc2Type2Available` | Direct |
| C3.3 | Security: Encryption at rest | vendor-security-review.form | `encryptionAtRest` | Direct |
| C3.4 | Security: Encryption in transit | vendor-security-review.form | `encryptionInTransit` | Direct |
| C3.5 | Security: MFA | vendor-security-review.form | `mfaEnforcementPercentage` | Direct |
| C3.6 | Security: Incident SLA | vendor-security-review.form | `incidentResponseSla` | Direct |
| C3.7 | Security: Breaches | vendor-security-review.form | `securityBreachesPast3Years` | Direct |
| C3.8 | Security: Vuln disclosure | vendor-security-review.form | `vulnerabilityDisclosurePolicy` | Direct |
| C3.9 | Security: PAM | vendor-security-review.form | `privilegedAccessManagement` | Direct |
| C3.10 | Security: Access review | vendor-security-review.form | `accessReviewFrequency` | Direct |
| C3.11 | Security: Pen test | vendor-security-review.form | `lastPenTestDate`, `penTestExecutiveSummary` | Split to 2 fields |
| C3.12 | Security: MTTR | vendor-security-review.form | `meanTimeToPatchCritical` | Direct |
| C3.13 | Security: BCP/DR | vendor-security-review.form | `bcpDrPlan` | Direct |
| C3.14 | Security: RTO/RPO | vendor-security-review.form | `rtoCommitment`, `rpoCommitment` | Split to 2 fields |
| C3.15 | Security: DR test | vendor-security-review.form | `drTestFrequency` | Direct |
| C3.17 | Security: PCI DSS | vendor-security-review.form | `pciDssCompliant` | Direct |

### 10.4 Data Provenance Tagging (v1.1)

All SP0-sourced fields carry `dataProvenance` metadata to distinguish verified from unverified data:

| Source | Provenance Tag | Visual Indicator |
|--------|---------------|-----------------|
| Requester (Steps 1-2) | `requester-reported` | Blue badge |
| Concierge validation (Step 2.5) | `concierge-validated` | Green badge |
| Vendor response (Step 6) | `vendor-reported` | Orange badge |
| SP3 reviewer verification | `verified` | Green checkmark |

**SP3 verification checklist**: When SP3 tasks activate for a request with `rfpCompleted` = true, reviewers see a mandatory verification checklist task. Each pre-populated field shows its provenance tag. Reviewers must confirm or correct vendor-reported data before completing their review.

**Data freshness validation** (v1.1): At SP1 entry, if SP0 data is older than 30 days (based on `sp0CompletionDate`), a warning is displayed and Concierge is notified for a freshness review.

### 10.5 New Process Variables (SP0 Creates)

Variables created by SP0 that do not map to existing forms but enrich downstream routing:

| Variable | Type | Source | Used By |
|----------|------|--------|---------|
| `rfpCompleted` | boolean | SP0 completion | SP1 routing (skip redundant data collection) |
| `rfpDataTransferred` | boolean | Step 8 | SP1 forms (show "pre-populated from Mini RFP" badge) |
| `selectedCategories` | list(integer) | Step 4 | Audit trail |
| `vendorResponses` | object | Step 6 | SP3 vendor evaluation tasks |
| `rfpFlags` | list(object) | Step 7 | SP3 reviewer visibility |
| `engagedLanes` | list(object) | Step 9 (OB-DMN-9) | SP1 triage, SP3 parallel engagement |
| `estimatedTimeline` | object | Step 9 | SP1 requester communication |
| `competitiveBidResult` | object | Step 7 | SP3 evaluation, SP4 contracting |
| `dealKillerScreenResult` | string | Step 3 | Audit trail |
| `vendorComparisonScores` | object | Step 7 | SP3 evaluation dashboard |

### 10.6 Mapping Coverage

| Target | Total Fields | Pre-Populated from SP0 | Coverage |
|--------|-------------|----------------------|----------|
| sp1-gather-documentation.form | 15 fields | 9 | 60% |
| sp1-submit-request.form | ~10 fields | 5 | 50% |
| vendor-security-review.form | 17 fields | 17 | 100% |
| SP3 evaluation variables | ~20 variables | 15 | 75% |
| **Total unique SP1/SP3 fields** | **~62** | **~46** | **74%** |

---

## 11. Form Specifications

### 11.1 Requester Wizard Forms (9 Forms)

| Form ID | Step | Label | Key Fields | Est. Fields |
|---------|------|-------|-----------|-------------|
| `rfp-step1-understand-need` | 1 | Understand the Need | technologyType, primaryUseCase, rfpUrgency, budgetRange, hasAI, businessCriticality, costCenter | 7 |
| `rfp-step2-vendor-context` | 2 | Vendor Context | knownVendor, vendorName, competitiveBid, existingRelationship, deploymentModel, dataClassification, regulatoryScope, dataTypes, existingAssessments | 9 |
| `rfp-step2b-classification-validation` | 2.5 | Classification Check | classificationValidated, correctedClassification, regulatoryScopeValidated, classificationNotes | 4 |
| `rfp-step3-deal-killer` | 3 | Deal-Killer Screen | vendorConcentrationAck, hasExecutiveSponsor, budgetAuthorized + automated results (incl. OFAC) | 3 + display |
| `rfp-step4-preview` | 4 | Question Preview | Category toggles, question count, category weights, estimated completion time | Display + toggles |
| `rfp-step5-send-vendor` | 5 | Send to Vendor | vendorContactName, vendorContactEmail, responseDeadline (≥P14D), deliveryMethod, additionalVendors, includeCoverLetter, shareEvaluationCriteria | 7+ |
| `rfp-step6-collect` | 6 | Collect Responses | Status display, reminder history, partial response indicators | Display only |
| `rfp-step7-review` | 7 | Review & Score | Weighted category scores, blind scoring toggle, flag acknowledgments, vendor selection (competitive) | Display + 3 |
| `rfp-step8-transfer` | 8 | Transfer to Intake | Pre-populated intake preview with provenance badges, override fields | Display + edit |
| `rfp-step9-expectations` | 9 | What Happens Next | Engaged lanes, timeline, approval gates, progress bar (Step X of 9) | Display only |

### 11.2 Vendor Questionnaire Forms (10 Forms)

| Form ID | Category | Tier Variants | Est. Fields |
|---------|----------|--------------|-------------|
| `rfp-cat-company` | 1. Company & Financial Stability | basic (8), standard (11), full (15) | 8-15 |
| `rfp-cat-product` | 2. Product/Solution Capabilities | basic (10), standard (15), full (20) | 10-20 |
| `rfp-cat-security` | 3. Security & Compliance | basic (8), standard (17), full (25) | 8-25 |
| `rfp-cat-privacy` | 4. Data Privacy & Protection | full only (16) | 16 (+evidence upload) |
| `rfp-cat-integration` | 5. Integration & Architecture | basic (8), full (12) | 8-12 |
| `rfp-cat-implementation` | 6. Implementation & Support | standard only (12) | 12 |
| `rfp-cat-pricing` | 7. Pricing & Commercial | standard only (15) | 15 |
| `rfp-cat-tprm` | 8. Third-Party Risk | full only (19) | 19 (+evidence upload) |
| `rfp-cat-resilience` | 9. Operational Resilience | full only (12) | 12 |
| `rfp-cat-ai` | 10. AI Governance | full only (21) | 21 |

**Total: 20 new Camunda 8 JSON forms** (10 wizard + 10 vendor category)

### 11.3 Form Design Principles

1. **Progressive disclosure**: Vendor sees only activated categories at the assigned tier
2. **Conditional fields**: Follow-up questions appear only when trigger conditions met (e.g., breach details only if breaches = "yes")
3. **Save and resume**: Vendor can save partial progress and return via portal link
4. **Consistent patterns**: Radio for yes/no, select for enums, textarea for explanations, checklist for multi-select -- matching existing `vendor-security-review.form` patterns
5. **No duplicate questions**: Each question appears in exactly one category form. Cross-category references use process variables, not re-asking.

### 11.4 Vendor Communication Template (v1.1)

Auto-generated cover letter sent with questionnaire (Step 5). Template-driven, not LLM-generated:

**Structure**:
1. **Header**: Organization name, engagement reference, date
2. **Partnership framing**: "We are evaluating solutions for [primaryUseCase] and invite you to participate..."
3. **Scope summary**: Active categories, estimated question count, expected completion time
4. **Evaluation criteria**: Category weights (if `shareEvaluationCriteria` = true)
5. **Timeline**: Response deadline, key milestones
6. **Single POC**: Requester name and email
7. **Instructions**: Portal link / attachment instructions, save-and-resume guidance

### 11.5 Vendor UX Requirements (v1.1)

| Requirement | Implementation | Priority |
|-------------|---------------|----------|
| Save and resume | Camunda Tasklist native capability; document as NFR | P1 |
| Progress bar with completion % | Camunda 8 form `expression` field: "Step X of 9" / "Section X of N" | P1 |
| Descriptive step labels | Labels per Section 4.2 (not "Step 1, Step 2...") | P1 |
| Multi-stakeholder delegation | Vendor delegates sections to different team members | P3 (Phase 5) |
| Continuous monitoring hook | Post-SP0: if vendor proceeds to SP3+, trigger continuous monitoring setup (SecurityScorecard/BitSight) | P3 (Phase 3+ integration) |

---

## 12. Non-Functional Requirements

### 12.1 Performance

| Metric | Target |
|--------|--------|
| Wizard step load time | < 1 second |
| DMN question selection (OB-DMN-8) | < 500ms |
| Vendor questionnaire rendering | < 2 seconds (largest category) |
| Transfer to intake (Step 8) | < 3 seconds |

### 12.2 Security

| Requirement | Implementation |
|-------------|---------------|
| Vendor portal links | Unique token per vendor, expires after deadline + 7 days |
| Vendor data isolation | Vendor sees only their questionnaire; no cross-vendor data |
| Response encryption | TLS 1.2+ in transit; AES-256 at rest |
| Access control | Requester sees only their own Mini RFPs |
| Audit trail | All actions logged with user, timestamp, and IP |

### 12.3 Extensibility

| Requirement | Implementation |
|-------------|---------------|
| Question bank updates | JSON-based question definitions; no BPMN changes for new questions |
| New categories | Add category JSON + DMN rule; no BPMN structural changes |
| Tier adjustments | Update DMN rules only |
| Multi-language support | Question text externalized for future i18n (Phase 5+) |

### 12.4 Accessibility

| Requirement | Standard |
|-------------|----------|
| WCAG compliance | 2.1 AA minimum |
| Keyboard navigation | Full wizard and vendor forms navigable by keyboard |
| Screen reader | All form fields labeled with ARIA attributes |

---

## 13. Success Metrics

### 13.1 Primary Metrics

| Metric | Baseline | Target | Measurement |
|--------|----------|--------|-------------|
| Time-to-triage (with SP0) | Unknown (no pre-screening) | 60% faster than without SP0 | Compare SP0→SP1 vs. direct SP1 cohorts |
| Intake form completeness | ~40% of fields populated at submission | 90%+ fields pre-populated | Count non-empty fields at SP1 entry |
| Fail-fast rate | 0% pre-intake rejection | 30% of requests killed in SP0 | `End_Blocked` count / total SP0 starts |
| Redundant questionnaires per vendor | 4+ | 1 (Mini RFP) + 0 ad-hoc | Count vendor-facing form sends per request |
| Requester satisfaction (NPS) | Not measured | > 50 | Post-SP0 survey |

### 13.2 Secondary Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Vendor response turnaround | < 10 business days (80th percentile) | Deadline compliance rate |
| SP0 completion rate | > 70% of started SP0s complete all 9 steps | SP0 starts vs. SP0 completions |
| SP0 abandonment analysis | Identify which step has highest drop-off | Step-level completion funnel |
| Competitive bid usage | 30% of SP0s use competitive bid | `competitiveBid` = "yes" rate |
| Governance reviewer time saved | 40% reduction in information gathering time | SP3 task duration comparison |
| Deal-killer accuracy | < 5% false positive rate (blocked requests that should have proceeded) | Manual review of `End_Blocked` decisions quarterly |

### 13.3 Measurement Infrastructure

- **Camunda Operate**: Process instance tracking, step-level timing
- **Camunda Optimize**: Funnel analysis, heatmaps, bottleneck identification
- **Process Owner Dashboard**: Real-time SP0 metrics (extend existing dashboard)

---

## 14. Implementation Phases

| Phase | Scope | Dependencies | Est. Effort |
|-------|-------|-------------|-------------|
| **Phase 1** | PRD + Question Bank design (this document) | None | Complete |
| **Phase 2** | Core BPMN (SP0 sub-process) + wizard forms (Steps 1-5) + OB-DMN-8 | Phase 1 | BPMN: 2-3 days, Forms: 3-4 days, DMN: 1 day |
| **Phase 3** | Vendor response collection + comparison (Steps 6-7) + scoring | Phase 2, Vendor portal (basic) | Forms: 3-4 days, Portal: 5-7 days |
| **Phase 4** | Intake transfer + expectation setting (Steps 8-9) + OB-DMN-9 | Phase 3 | Mapping: 2 days, DMN: 1 day, Forms: 1-2 days |
| **Phase 5** | Competitive bid multi-instance + vendor portal integration | Phase 4, Vendor portal (full) | BPMN: 2-3 days, Portal: 5-7 days |

### Phase 2 Details (Next Implementation)

**BPMN deliverables**:
- Add `GW_MiniRFP` gateway to top-level orchestrator (before SP1)
- Create `SP0_MiniRFP` collapsed sub-process with internal diagram
- Steps 1-5 as user tasks with Camunda 8 JSON forms
- Step 3 includes service task calling OB-DMN-7

**DMN deliverables**:
- OB-DMN-8 decision table (question selection, COLLECT hit policy)
- Question bank JSON file (all 159 questions with metadata)

**Form deliverables**:
- `rfp-step1-understand-need.form` through `rfp-step5-send-vendor.form`
- 10 vendor category forms (`rfp-cat-*.form`)

---

## 15. Risks and Mitigations

| # | Risk | Severity | Mitigation | v1.1 Status |
|---|------|----------|------------|-------------|
| 1 | Requester adoption -- SP0 is optional and requesters may skip it | High | DMN-driven routing makes SP0 mandatory for Buy >$25K (Section 4.5); demonstrate time savings with early adopters; Concierge encourages use | Addressed |
| 2 | Question bank maintenance -- questions become outdated as regulations evolve | Medium | JSON-based question bank with version control; quarterly review cadence (Section 6.8); framework mappings enable regulatory change tracking | Addressed |
| 3 | Vendor portal not available for Phase 2 | Medium | Phase 2 uses email-based questionnaire delivery (PDF/spreadsheet export); portal integration in Phase 5 | Unchanged |
| 4 | OB-DMN-8 rule complexity -- many input combinations | Medium | Start with simplified rules covering 80% of scenarios; iterate based on actual Mini RFP usage data | Unchanged |
| 5 | False positive deal-killers -- good requests blocked prematurely | Medium | All deal-killer blocks require Concierge review before final termination; appeal process documented; OFAC screening added | Addressed |
| 6 | Vendor fatigue with long questionnaires | High | Micro-RFP variant (12-15 Qs) for low-value; existing assessment acceptance (SOC2/ISO/SIG); tier thresholds research-validated (Section 5.13); evidence uploads reduce narrative burden | Addressed |
| 7 | Competitive bid adds complexity before value is proven | Low | Phase 5 delivery -- single vendor flow proven first; competitive bid added only after core SP0 validated | Unchanged |
| 8 | Requester misclassification drives incorrect question selection | High | Step 2.5 Concierge classification validation (Section 4.2); data provenance tagging (Section 10.4) | NEW v1.1 |
| 9 | SP0 stall/abandonment without cleanup | High | P20D interrupting boundary timer; Concierge cancellation task; End_Abandoned with cleanup (Section 4.4) | NEW v1.1 |
| 10 | False sense of data completeness from vendor self-reporting | Medium | Data provenance tagging (Section 10.4); SP3 mandatory verification checklist; visual distinction between vendor-reported and verified data | NEW v1.1 |
| 11 | Concierge role not staffed for SP0 launch | Medium | Hard gate requiring Concierge before SP0 activation; governance-lane fallback (Section 4.6) | NEW v1.1 |

---

## Appendix A: Regulatory Traceability

| Regulation | Mini RFP Coverage | Questions | v1.1 Additions |
|-----------|------------------|-----------|----------------|
| OCC 2023-17 | Category 8 (full TPRM), Categories 1/3/7 (vendor stability, security, pricing) | C1.*, C3.*, C7.*, C8.* | C8.16-C8.19 (DORA register, exit strategy), OFAC screening in OB-DMN-7 |
| SR 11-7 | Category 10 (AI model risk management) | C10.* | C10.21 (model inventory classification) |
| EU AI Act | Category 10 (AI risk classification, transparency) | C10.3, C10.6, C10.9, C10.17, C10.18 | C10.19 (conformity assessment), C10.20 (EU AI Database) |
| GDPR/CCPA | Category 4 (data privacy and protection) | C4.* | C4.16 (controller/processor classification) |
| DORA | Categories 3/8/9 (security, TPRM, operational resilience) | C3.13-C3.15, C8.*, C9.* | C8.16 (information register), C8.18 (incident timelines), C8.19 (TLPT) |
| SOX | Categories 1/7 (financial stability, pricing controls) | C1.9, C1.10, C7.* | -- |
| NIST CSF 2.0 | Categories 3/5/9 (security, architecture, resilience) | C3.*, C5.*, C9.* | Framework mappings in question bank JSON |
| ISO 27001 | Category 3 (security controls) | C3.1, C3.3-C3.25 | -- |
| FS-ISAC GenAI | Category 10 (AI governance) | C10.* | `fsIsacDomain` mapping on all Cat 10 questions |

---

## Appendix B: Governance Topic Coverage

Cross-reference with [governance-topic-mapping.md](../governance-topic-mapping.md):

| Topic | Mini RFP Categories | Coverage Level |
|-------|-------------------|----------------|
| 1. Intake | Steps 1-2 (requester context) | Full -- replaces SP1 data collection |
| 2. Prioritization | Step 1 (urgency, budget), Step 9 (timeline) | Partial -- informs but doesn't replace SP2 |
| 3. Funding | Category 7 (pricing), Step 1 (budget) | Full -- vendor pricing collected upfront |
| 4. Sourcing | Categories 1/2 (company, product), Step 7 (comparison) | Full -- vendor evaluation pre-done |
| 5. Cyber | Category 3 (security) | Full -- maps 1:1 to vendor-security-review.form |
| 6. EA | Categories 2/5 (product, integration) | Substantial -- architecture context collected |
| 7. Compliance | Categories 3/4/8 (security, privacy, TPRM) | Substantial -- regulatory gaps identified |
| 8. AI Governance | Category 10 (AI governance) | Full -- comprehensive AI assessment |
| 9. Privacy | Category 4 (data privacy) | Full -- DPIA-informing data collected |
| 10. Commercial Counsel | Category 7 (pricing/commercial) | Partial -- commercial terms, not contract drafting |
| 11. TPRM | Categories 1/3/8 (company, security, TPRM) | Full -- OCC 2023-17 compliant |

---

## Appendix C: Referenced Documents

| Document | Path | Relevance |
|----------|------|-----------|
| FS-Onboarding PRD | [fs-onboarding-prd.md](fs-onboarding-prd.md) | Parent PRD, process architecture |
| Governance Topic Mapping | [governance-topic-mapping.md](../governance-topic-mapping.md) | RACI, topic-to-task mapping |
| Intake Form Field Mapping | [intake-form-field-mapping.md](../../../framework/docs/requirements/intake-form-field-mapping.md) | Field redundancy analysis, role consumption |
| Gap Analysis | [gap-analysis.md](../discovery/gap-analysis.md) | GAP-3, GAP-9, GAP-16 addressed by SP0 |
| OneTrust Integration | [onetrust-integration.md](../discovery/onetrust-integration.md) | Future integration for Category 8 |
| OB-DMN-7 Deal Killer | [OB-DMN-7-deal-killer-prescreen.dmn](../../processes/OB-DMN-7-deal-killer-prescreen.dmn) | Step 3 automated screening |

---

*Created: 2026-03-06 | Updated: 2026-03-07 (v1.1) | Source: Stakeholder interviews, intake form field mapping analysis, RFP best practices research, 4-agent critical thinking review (strategic, regulatory, architecture, risk), 3-agent industry research (procurement, UX, technology) | Format reference: fs-onboarding-prd.md*
