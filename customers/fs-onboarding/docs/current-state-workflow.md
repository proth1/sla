# Current State: High Level Software Acquisition Workflow

**Source**: Client process diagram (screenshot reference)

## 4 Phases

| # | Phase | Color Code |
|---|-------|------------|
| 1 | REQUEST/RENEW PHASE | Gray |
| 2 | DISCOVERY | Blue |
| 3 | ACQUIRE/DESIGN | Yellow |
| 4 | IMPLEMENT | Green |

## Process Steps (Sequential)

### Phase 1: Request/Renew
1. **Requestor** — initiates the process
2. **Intake Request Submitted** — via Jira SRR / ARCHER
3. **TGC Software Technology Asset Review Team (START)** — initial triage with 4 possible early-exit outcomes:
   - Solution Already Exists
   - Funding Not Confirmed
   - More Info needed
   - Recommended for Innovation
4. **TGC Engaged** — decision point
5. **Risk Elements Addressed?** — decision gateway
   - **Yes** → Executive Review Council Request Review
   - **No** → Standard Review Council Request Review
6. **Create the DART** (Decision and Risk Tracking document)

### Phase 2: Discovery
7. **Review Council Milestone 1: Request Review** — STOP/Decline gate
8. **Discovery & Exploration Phase**
9. **Review Council Milestone 2: Solution Evaluation Review** — STOP/Decline gate

### Phase 3: Acquire/Design
10. Fork:
    - **Acquire Phase (Buy)**
    - **Design & Build**
11. **Review Council Milestone 3: Approval to Buy/Build** — STOP/Decline gate

### Phase 4: Implement
12. **Architectural Review Board (ARB)**
13. **Architectural Runway to Production**

## Key Terminology Mapping

| Their Term | Our Term | Notes |
|------------|----------|-------|
| Requestor | Requester / Business Owner | Process initiator |
| TGC / START | Quarterback / Triage | Software Technology Asset Review Team |
| DART | Risk Assessment Package | Decision and Risk Tracking |
| Review Council | Prioritization Committee / Governance Board | 3 milestone reviews |
| Milestone 1 | Request Review | Go/no-go on intake |
| Milestone 2 | Solution Evaluation Review | Go/no-go on discovery |
| Milestone 3 | Approval to Buy/Build | Go/no-go on acquisition |
| Fast Path | Fast-Track tier | Bypass for low-risk requests |
| Discovery & Exploration | Due Diligence | Assessment and evaluation |
| Acquire Phase (Buy) | Buy pathway | Vendor procurement |
| Design & Build | Build pathway | Internal development |
| ARB | Architectural Review Board | Implementation gate |
| Jira SRR | Service Request Record | Intake tracking |
| ARCHER | Risk/GRC system | Governance tracking |
| Executive Review Council | Executive governance review | For high-risk items |
| Standard Review Council | Standard governance review | For standard-risk items |

## 3 Decline/STOP Gates

Each Review Council milestone can result in **Declined** (process terminates):
1. After Milestone 1 (Request Review)
2. After Milestone 2 (Solution Evaluation Review)
3. After Milestone 3 (Approval to Buy/Build)

## Fast Path

A bypass route ("Fast Path") runs from early in the process (post-triage) directly to later stages, skipping intermediate review milestones for low-risk/pre-approved requests.
