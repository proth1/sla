# Meeting Notes: Software Onboarding Process Review

**Date**: 2026-03-06 (Meeting 1 of 4)
**Participants**: Vendor Management Lead, Consulting Team
**Focus**: Process ownership, workflow challenges, proposed solutions

---

## Key Findings

### Organizational Structure

- Vendor management sits within **technology organization**
- Separate from enterprise procurement function
- Separate from third-party risk management (policy/standards)
- **Third-party risk**: 2nd line of defense, creates policies and standards
- **Vendor management**: Executes technology vendor management
- Team of **6 people**, 2 dedicated 50%+ to onboarding process
- Staffing borrowed from other responsibilities without formal allocation

### Two Involvement Points

1. **Post-contract execution** — performance management
2. **Front-end facilitation** — inherited responsibility (previously housed in architecture team)

### Process Evolution

- Previously housed in architecture team (architecture only addressed their specific process)
- Expanded to include multiple teams/functions
- Current "START" process serves as **umbrella over existing processes** — does not integrate underlying team processes
- ServiceNow central intake implemented **~9 months ago** (previously email, various tools)
- Creates awareness across teams, prevents work on unapproved initiatives

### Three Request Types Identified

| Type | Description | Process Fit |
|------|-------------|-------------|
| **Defined Need with Vendor Selected** | Business owner knows requirements, already evaluated vendors, comes with specific solution | Standard path |
| **Forced Updates** | Existing vendor relationship, product changes require re-evaluation (on-prem to SaaS, EOL, new AI capabilities) | Re-evaluation path |
| **Speculative/Exploratory** | Advisory support requests, no formal sponsorship, generating interest | Process NOT designed for this |

### Major Pain Points

#### Disconnected Processes
- START is umbrella over multiple independent processes
- Each team uses different tools: **JIRA, Confluence, OneTrust, Oracle, Ariba**
- No connection between systems
- Manual coordination required

#### Requester Burden
- First-time requesters struggle with complexity
- Multiple approvals required sequentially
- Unclear on remaining steps
- Must self-manage DART engagement
- Responsible for facilitating **5-6 team interactions**

#### Governance Bottlenecks
- Business Council meets **monthly**
- Often lack quorum (**2-3 of 8-10 members**)
- Evolved to **email voting** system
- Executive facilitates manual voting process
- Significant administrative burden

#### Tool Decay
- Financial business case form outdated (shows 2024 in 2026)
- Form locked, **password unknown** (owner left organization)
- Finance wants form retained but doesn't administer
- Forms downloaded, completed offline, uploaded to shared folder
- Manual email notifications for process steps

### Proposed Solutions

#### 1. Distributed Pod Model (Vendor Mgmt Lead's Vision)
- Dedicated pods for each functional area (e.g., cybersecurity pod)
- Each pod controls: prioritization, meeting frequency, workflow speed
- Central team ensures consistency
- Removes resource competition
- Benefits: domain-specific prioritization, flexible meeting schedules, faster decisions

#### 2. Early Gates and Visibility
- Move critical reviewers to front of process
- Enable early "no" decisions (save 90% of work)
- Visual progress tracking (gamification)
- Show all requirements upfront
- Enable parallel work vs. sequential
- Quote: "If cyber team familiar with technology that will never be approved, say no immediately"

#### 3. Self-Service RFP Capability
- Empower requesters with mini-RFP tools
- Codify RFP knowledge into system
- Collect competitive information early
- Prevents single-vendor selection, maintains competitive pricing leverage

#### 4. Process Ownership Clarity
- Requesters must understand they own their process
- Cannot be hands-off after submission
- Subject matter experts in their domain
- Key part of building business case

### Technology Context

- Organization owns **enterprise BPM platform** (purchased for compensation processes)
- Multi-year implementation (not fully complete)
- Potential for broader application to onboarding

### Key Quotes

- Vendor Mgmt Lead describes role as **"Sherpa"**: guides through process, knows the path, not expert in all domains, cannot speak for other teams, facilitates vs. owns
- "The process never solved the step of requester who's never been through onboarding having to work with 5-6 teams through independent processes"

### Data Available

- ServiceNow data: **9 months** of request volumes, categorization, timeline analysis

---

## Mapping to BPMN Model

| Finding | Maps To | Gap Reference |
|---------|---------|---------------|
| 3 request types (not just buy/build) | OB-DMN-2 Pathway Routing | GAP-11 (expand to 3+ pathways) |
| Forced Updates pathway | Top-level routing | NEW: Re-evaluation pathway |
| Speculative/Exploratory requests | Pre-SP1 | GAP-15 (Idea Funnel) |
| Disconnected tools | Cross-cutting integration | GAP-10 (Workload Dashboard) |
| Requester burden / 5-6 teams | SP1-SP5 orchestration | GAP-7 (Status Visibility) |
| Business Council quorum issues | SP3/SP4 governance gate | GAP-2 (Prioritization) |
| Early "no" decisions | SP1 pre-screen | GAP-16 (Deal-Killer) |
| Pod model | Lane-level autonomy | Architectural alignment with swim lane model |
| Self-service RFP | SP3 evaluation | NEW: RFP generation capability |
| BPM platform exists | Implementation | Platform opportunity for Camunda deployment |
| Tool decay (locked forms) | SP1-SP3 forms | GAP-3 (Progressive Forms) |

---

## Action Items

- [ ] Vendor management team to provide request statistics (from ServiceNow, 9 months)
- [ ] Document current tool landscape (JIRA, Confluence, OneTrust, Oracle, Ariba, ServiceNow)
- [ ] Explore existing BPM platform capabilities for onboarding use
- [ ] Define pod model structure
- [ ] Create early-gate decision criteria
