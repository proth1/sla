# Changelog

## [2026.03.86] - 2026-03-08

### Added
- SP-Cross-6: Resilience Testing cross-cutting subprocess for DORA Article 26 — annual timer trigger, 4 testing phases (planning, pen testing, scenario, recovery), DMN-driven severity classification, boundary timer SLAs, board reporting (PR #107)
- Evidence infrastructure design doc: WORM storage architecture with S3 Object Lock, 3-tier retention (7Y regulatory, 3Y operational, 1Y transient), SEC 17a-4/SOX/OCC 2023-17/GDPR/DORA compliance mapping (PR #106)
- DMN-15: Evidence Retention Routing — 18 rules, FIRST hit policy, routes evidence to retention tiers by type/regime/classification (PR #106)
- DMN-17: DPIA Trigger Assessment — 20 rules, FIRST hit policy, GDPR Articles 35-36 compliance for data protection impact assessment triggers (PR #105)
- DPIA assessment Camunda 8 form — 6 groups, 26 fields for GDPR DPIA documentation (PR #105)
- DMN-16: DORA Contractual Provisions — 16 rules, FIRST hit policy, DORA Article 28/30 contractual clause routing by service criticality and data classification (PR #103)
- ICT Register Entry Camunda 8 form — 5 groups, 22 fields for DORA Article 28 mandatory ICT third-party register (PR #103)
- TPRM Quarterly Board Report Camunda 8 form — 7 groups, 32 fields for OCC 2023-17 vendor risk reporting (PR #104)
- MRM Monthly Board Report Camunda 8 form — 7 groups, 30 fields for SR 11-7 model risk reporting (PR #104)

## [2026.03.81] - 2026-03-08

### Changed
- Presentation consolidation: Add Mini RFP Self-Service Pre-Screening (SP0) slide to main presentation (now 42 slides), update roadmap with Day-30 completion status (PR #102)
- Remove all KPMG branding: CSS variables `--kpmg-*` → `--brand-*`, logos, auth worker allowed domains, PPTX generators, transformation scripts (PR #102)
- Regenerate `Software-Onboarding-Transformation.pptx` (53 slides, KPMG-free), fix KPMG text in `30-day-readout.pptx` (PR #102)

### Removed
- Delete superseded `Software-Onboarding-Transformation-KPMG.pptx` and `reference/index.html` (PR #102)
- Remove `kpmg.com` from all 3 auth worker allowed domains (presentation, showcase, onboarding) (PR #102)

## [2026.03.80] - 2026-03-08

### Changed
- Committee voting: Add `candidateUsers="=lockedRosterEmails"` to Q&A Submit Question task so roster members can see/claim it in Tasklist (PR #101)

## [2026.03.79] - 2026-03-08

### Added
- DMN-10: Incident Severity Classification for SP-Cross-3 incident response — 20 rules, FIRST hit policy, DORA Article 19 compliance (PR #96)
- DMN-11: Jurisdictional Routing for Phase 1 intake — 16 rules covering EU/UK/US/APAC cross-border data flows, GDPR Articles 44-49 (PR #98)
- DMN-12: Contract Renewal Routing for Phase 8 operations — 20 rules for AutoRenew/NegotiateTerms/CompetitiveBid/Terminate decisions, OCC 2023-17 (PR #99)
- DMN-14: Data Residency Routing for Phase 2/3 — 16 rules covering Restricted/Confidential/Internal/Public data across jurisdictions (PR #100)

### Changed
- DMN-7: Enhanced with `exploitInTheWild` boolean input (CISA KEV catalog) — 16 new exploit-true rules with 50% compressed SLAs, hit policy changed UNIQUE→FIRST (PR #95)
- DMN-8: Enhanced with `annualContractValue` double input — 5 new high-value vendor override rules for OCC 2023-17 proportional monitoring, hit policy changed UNIQUE→FIRST (PR #97)

## [2026.03.73] - 2026-03-08

### Fixed
- Fix Mini RFP screen flashing caused by poll loop re-rendering same task every 2.5s (PR #83)
- Renumber Mini RFP wizard steps from 1,2,2.5,3,4,5,6,7 to sequential 1-8 (PR #83)

## [2026.03.72] - 2026-03-08

### Security
- Timing-safe secret comparisons (double-HMAC) in API Worker, Auth Worker, and Pages guard (PR #82)
- API error message sanitization: generic client responses, Camunda details logged server-side (PR #82)
- Fetch timeouts via AbortController on all Camunda API calls (5s token, 15s upstream) (PR #82)
- CORS headers restricted to showcase.agentic-innovations.com (PR #82)
- CSP headers on Pages responses (PR #82)
- HSTS, X-Frame-Options, Referrer-Policy on proxied auth worker responses (PR #82)
- Input validation on all task/form ID path parameters (PR #82)
- Query parameter encoding for processDefinitionKey (PR #82)

### Added
- Health check endpoint: GET /api/health validates Camunda connectivity (PR #82)
- Deployment script: scripts/deploy-showcase.sh (PR #82)
- Smoke test script: scripts/smoke-test-showcase.sh (PR #82)

## [2026.03.71] - 2026-03-08

### Fixed
- Add HMAC-SHA256 signature verification to `/webhook/jira` endpoint with timing-safe comparison and length check (PR #80)
- Consolidate ~63 lines of duplicated persona UI code from index.html and dashboard.html into personas.js (PR #80)
- Eliminate dual persona data sources — delete personas-data.json, server.js parses from personas.js (PR #80)

## [2026.03.70] - 2026-03-08

### Fixed
- Document correct env var names for Camunda Wrangler secrets (PR #81)
- `CAMUNDA_CLIENT_ID` secret must be set from `$ZEEBE_CLIENT_ID`, not `$CAMUNDA_CLIENT_ID`

## [2026.03.69] - 2026-03-08

### Added
- Deploy SLA Showcase to Cloudflare behind OTP auth at showcase.agentic-innovations.com (PR #79)
- Three-component architecture: Pages (static), API Worker (Camunda 8 proxy), Auth Worker (Descope OTP)
- All 23 Express API routes ported to Cloudflare Worker with OAuth2 client credentials
- Demo personas (7 roles) with role-based task filtering across all showcase UIs
- Shared Camunda auth module (camunda-auth.js) for OAuth2 token management
- Jira webhook integration for syncing process lifecycle events

## [2026.03.68] - 2026-03-08

### Changed
- Refactored 10 BPMN governance models: task widening to 140px, removed dead code, standards updates (PR #3)

## [2026.03.67] - 2026-03-08

### Added
- Mini RFP standalone BPMN with v9 vendor DD elements merged (PR #61)

## [2026.03.66] - 2026-03-08

### Fixed
- Auth worker session persistence: SLA_SESSION HMAC cookie (8h TTL), Set-Cookie header fix (PR #5)

### Added
- Executive savings slide added to main presentation (PR #5)

## [2026.03.65] - 2026-03-08

### Added
- Hierarchical onboarding v5 BPMN model — reference model for collapsed sub-process patterns (PR #36)

## [2026.03.64] - 2026-03-08

### Changed
- Foundation reconciliation: README, AGENT-GUIDE, stale 7-phase agent refs updated to 8-phase (PR #18)

## [2026.03.63] - 2026-03-08

### Fixed
- SVG XML parse error in 30-day mindmap: wrapped `<script>` in CDATA section (PR #78)

### Changed
- Renamed sherpa-30day.html to quarterback-30day.html (URL: /quarterback-30day)
- Comprehensive responsive design for 30-day plan presentation: 3 breakpoints (1100px, 767px, 480px)

## [2026.03.62] - 2026-03-08

### Changed
- Renamed all "Sherpa" references to "Quarterback" across UI, toolkit, generator script, PPTX (PR #77)

## [2026.03.61] - 2026-03-08

### Added
- 30-day process improvement presentations: dark-themed HTML, KPMG readout HTML, PowerPoint versions, mind maps (PR #76)

## [2026.03.60] - 2026-03-08

### Added
- Mini RFP Concierge Dashboard (`concierge.html`) — process owner monitoring for SP0 pipeline with 5 KPI cards, sortable active RFP table, classification validation queue with claim/complete, SLA timeline visualization (D3/7/11/14), step distribution bar, 10s auto-refresh (PR #75)

### Changed
- Navigation: added Concierge link to index.html, mini-rfp.html, and dashboard.html headers

## [2026.03.59] - 2026-03-08

### Fixed
- v11 onboarding BPMN: added missing BPMNEdge for TechArch connection flow (PR #74)

## [2026.03.58] - 2026-03-08

### Changed
- v11 onboarding BPMN: SP3 port with split tasks, FEEL conditions, TechArch fix (PR #72)

## [2026.03.57] - 2026-03-07

### Added
- Mini RFP Launcher wizard UI (`mini-rfp.html`) — standalone 9-step requester wizard for self-service vendor pre-screening (SP0) with Camunda 8 JSON form rendering, deal-killer alerts, vendor waiting screen, scoring, and SP0-to-SP1 data transfer
- Mini RFP auto-fill defaults (`defaults-mini-rfp.js`) — synthetic demo data for all wizard form fields
- 6 Mini RFP API endpoints in `server.js`: start, status, active list, vendor-token, vendor-response (message correlation), and SP0-to-SP1 transfer with variable mapping

### Changed
- Task Worker UI (`index.html`): added navigation links to Mini RFP launcher and Dashboard in header

### Security
- XSS protection: `escapeHtml()` applied to all dynamic content (toast messages, form labels, variable display, error messages)
- Input validation: `isValidKey()` on all Mini RFP API path parameters
- Vendor token generation uses `crypto.randomBytes()` instead of predictable timestamps

## [2026.03.56] - 2026-03-07

### Changed
- v10 onboarding BPMN: Buy/Build descriptive labels on SP4 pathway gateway (was Yes/No), new merge gateway (`Gateway_0m1ca2l`) separating coding-loop convergence from pathway merge, Modeler re-serialization (PR #70)

## [2026.03.55] - 2026-03-07

### Changed
- Committee voting BPMN: new merge gateway (`Gateway_091ha3q`) separating QA phase/timer convergence from QA bypass merge, DI coordinate shifts for remediation loop elements (PR #69)
- Add `.gitignore` entry for `.playwright-mcp/` (removed console logs with cluster IDs per reviewer finding)

## [2026.03.54] - 2026-03-07

### Added
- v10 onboarding BPMN model (`onboarding-to-be-ideal-state-v10-c8.bpmn`) — new iteration based on v8
- Mini RFP pre-screen BPMN process (`mini-rfp-pre-screen.bpmn`)
- Jira sync test BPMN process (`jira-sync-test.bpmn`)
- Jira sync module for showcase: worker (`jira-sync.js`), config, status UI
- 6 SVG renders of v8 sub-processes for presentation embedding (PDLC, SP1-SP5)
- `deploy-and-migrate.sh` utility for Camunda 8 Cloud deployments with token refresh and instance migration

### Changed
- v8 BPMN: Camunda Modeler re-serialization (cosmetic normalization)
- Showcase `server.js` enhancements
- Flow direction checker validator improvements (message flow exclusion, sub-process loop detection)
- BPMN rules updates: hierarchical subprocess and visual clarity refinements
- Memory bank and platform state updates

## [2026.03.53] - 2026-03-07

### Changed
- Accept Camunda Modeler canonical re-serialization of committee-voting-process.bpmn: entity encoding (`&#38;`), default attribute stripping, DI element reordering, SP edge grouping, timer label repositioning, end event vertical spread (PR #67)
- Codify 4 new Modeler normalization patterns in `bpmn-modeling-standards.md`: entity encoding, default attribute stripping, internal SP edge grouping, timer labels below timers, multi-outcome end event spread

## [2026.03.52] - 2026-03-07

### Added
- Committee Governance Assurance subsystem: reusable callable process (`Process_CommitteeVoting`) with configurable voting methods (unanimous, majority, super_majority, veto, weighted, single_reviewer), Q&A phase, multi-instance voting, condition reconciliation, remediation loops with max iteration guard, and 3-tier timer escalation (PR #66)
- Test driver process (`Process_CommitteeVoting_TestDriver`) with DMN/Manual mode toggle for 14 test permutations
- DMN-10 decision table (`OB_DMN_CommitteeVotingRules`) — FIRST hit policy, 3 inputs (riskTier, governancePhase, contractValueBand), 11 outputs, 8 rules
- 8 Camunda 8 JSON forms for committee voting workflow (config, brief review, Q&A, voting, reconciliation, remediation, summary)
- Showcase form defaults (`defaults-committee-voting.js`) for test automation

### Fixed
- FEEL null safety in multi-instance completion condition (`earlyTermination` variable guard)
- Form ID mismatch: aligned form `id` fields with BPMN `formId` references (kebab-case)
- Missing `sequenceFlow` element for `Flow_AutoEscalate_EndEscalated`

## [2026.03.51] - 2026-03-07

### Fixed
- Dashboard process ID mismatch: `Process_Onboarding_v7` → `Process_Onboarding_v8` in both instance search calls, fixing 0 instances displayed (PR #65)

### Added
- Instance drill-down slide-out panel: click any instance row to see metadata, pending/completed tasks, assignee info, and Operate link
- Task reassignment modal: assign tasks to specific users or return to candidate group pool
- Server endpoints: `POST /api/tasks/:id/reassign` and `POST /api/tasks/:id/unassign`
- Reassign icons (pencil) in pending task queue for quick access
- Input validation on reassign endpoint (type check, trim, length limit)

### Security
- Escape single quotes in onclick handler attributes to prevent XSS via Camunda usernames

## [2026.03.50] - 2026-03-07

### Fixed
- Showcase server processId updated from `Process_Onboarding_v7` to `Process_Onboarding_v8` (PR #64)
- Added `ZEEBE_CLIENT_ID`/`ZEEBE_CLIENT_SECRET` env var fallback for credential flexibility

### Added
- zbctl-managed token mode: server reads bearer token from `~/.camunda/credentials` when no client credentials are set, auto-refreshes via zbctl on expiry

## [2026.03.49] - 2026-03-07

### Changed
- SP3 parallel fan-out layout widened from ~80px to ~120px branch spacing for improved readability (PR #63)
- Flow label "Elevated/Major" → "Elevated or Major" (multi-line, no "/" separator)
- Pattern C in hierarchical subprocess rules updated: 9 branches, ~120px spacing, branch sub-routing pattern
- Added multi-value flow label convention to modeling standards: use "or" with line breaks, not "/"

## [2026.03.48] - 2026-03-07

### Changed
- SP3 (Evaluation & Due Diligence): Replace parallel gateway with inclusive gateway for conditional team activation (PR #62)
- Split monolithic "Risk, Compliance, and Legal" task into 4 independent tasks: Risk Assessment, Compliance Review, Privacy Assessment, Legal Review
- Add FEEL condition expressions on all 9 inclusive gateway branches based on DART Formation output
- Reassign Task_InitialTriage from governance-lane to business-lane for Onboarding Facilitator (Quarterback/Sherpa) role
- Reposition SP3 DI layout for 9-branch fan-out with ~80px vertical spacing

## [2026.03.47] - 2026-03-07

### Changed
- Reduced presentation from 67 to 41 slides (PR #60)
- Removed 13 section divider slides, merged 11 governance topic pairs into two-column layouts
- Consolidated 4 DMN slides into 2 (Risk Tier + SLA Breach, Pathway + Priority)
- Updated all navigation indices (nav-links, Agenda, slide counter)

### Added
- `scripts/reduce-presentation.py` — deterministic presentation transform script

## [2026.03.46] - 2026-03-07

### Fixed
- Enterprise pool expanded from 290px to 390px for SP0 abandonment path spacing (PR #58)
- Vendor pool and all elements shifted +100px to maintain inter-pool gap
- Removed invalid zeebe:subscription from message start event definitions
- Timer label repositioned to avoid SP0 overlap

## [2026.03.45] - 2026-03-07

### Added
- Vendor pool Mini RFP message path: Start_MiniRFPVendor, Task_VendorMiniRFP, End_MiniRFPVendorComplete (PR #56)
- 2 message flows (MsgFlow_MiniRFPRequest, MsgFlow_MiniRFPResponse) with vendorToken correlation
- 2 message definitions (Message_MiniRFPRequest, Message_MiniRFPResponse)
- P20D interrupting boundary timer on SP0_MiniRFP (Timer_SP0_Abandon)
- Concierge cancel review task (Task_ConciergeCancel, governance-lane)
- End_SP0_Abandoned end event for abandoned Mini RFPs

## [2026.03.44] - 2026-03-07

### Added
- SP0 internal BPMN: 6 user tasks (Steps 1-5 + Classification Validation), 2 business rule tasks (Deal-Killer Pre-Screen, Question Selection), gateway routing (PR #55)
- Deal-killer rejection path with End_DealKillerFail end event

### Fixed
- PRD v1.1.0: 3 HIGH findings (budgetRange enum, Cat 4 trigger, Cat 9 trigger) + 3 MEDIUM findings (form count, question count, default weights)

## [2026.03.43] - 2026-03-07

### Added
- SP0 Mini RFP sub-process inserted into v8-c8 top-level BPMN (PR #54)
- GW_MiniRFP gateway, SP0_MiniRFP collapsed sub-process, merge gateway
- Yes/No bypass routing with pool expansion (+340px)

## [2026.03.42] - 2026-03-07

### Added
- 10 vendor category forms for Mini RFP question bank (PR #53)
- 167 questions across 10 categories with weighted scoring and evidence uploads

## [2026.03.41] - 2026-03-07

### Added
- 6 Mini RFP wizard forms: Steps 1-5 + Classification Validation (PR #52)
- OB-DMN-8 Question Selection, OB-DMN-9 Team Engagement, question bank schema (PR #51)

## [2026.03.39] - 2026-03-07

### Added
- Mini RFP PRD v1.1.0: 37 findings, weighted scoring, question bank schema (PR #50)
- 7 Jira epics (SLA-6 through SLA-13) + 35 stories

## [2026.03.38] - 2026-03-07

### Fixed
- Add merge gateway (`Gateway_0dh1j1i`) so Forced Update path routes through Buy vs Build decision instead of skipping to EvalDD (PR #49)
- Reroute `Flow_v5_5` (Planning → merge GW) and `Flow_v7_RT_Forced` (Request Type → merge GW) for correct convergence (PR #49)

### Changed
- DI layout repositioned for cleaner visual flow after Camunda Modeler v5.42.0 re-save (PR #49)
- Modeler canonical re-serialization: attribute order, indentation, entity encoding normalization (PR #49)
- Codify merge gateway for alternative routing paths in `bpmn-hierarchical-subprocess.md`
- Codify Camunda Modeler canonical serialization conventions in `bpmn-modeling-standards.md`

## [2026.03.37] - 2026-03-06

### Fixed
- Move 4 notification service tasks (`SendTask_SP1-4Complete`) from top-level orchestrator into their respective sub-processes (SP1-SP4) (PR #48)
- Restore 4 direct flows (`Flow_v5_2/5/8/13`) connecting sub-processes to downstream gateways, matching v7 layout (PR #48)

### Added
- Migration script `scripts/fix-v8-layout.py` for reproducible BPMN layout transformations (PR #48)

## [2026.03.36] - 2026-03-07

### Added
- Build summary document: complete artifact inventory (BPMN v1-v8, 48 forms, 3 DMNs, 2 web apps) (PR #47)
- FS-Onboarding PRD: 15-section product requirements document with web app specs, integration requirements, architecture, NFRs, and 24-gap status tracker (PR #47)
- BDD test suite: 10 Cucumber.js features + 9 step definitions for structural BPMN validation (PR #47)
- Camunda Optimize infrastructure: dashboard setup guide, export/import scripts, API reference (PR #47)
- Draft OneTrust stakeholder communication email (PR #47)

### Security
- Fixed command injection vulnerability in `export-report-data.sh` — pass JSON via stdin instead of shell interpolation (PR #47)

## [2026.03.35] - 2026-03-07

### Fixed
- PDLC_GW_TestResult gateway: added `default="Flow_PDLC_No"` and `conditionExpression` on Yes flow (PR #45)
- GW_RequestType 3-way gateway: added `default="Flow_v7_RT_Defined"` for unexpected requestType values (PR #45)
- 15 JUEL-to-FEEL expression conversions (`${var == 'val'}` → `=var = "val"`) for Camunda 8 compatibility (PR #45)
- 9 exclusive gateways missing `default` attribute for Zeebe deployment (PR #45)
- 9 conditional "Yes" flows missing `conditionExpression` elements (PR #45)
- 3 receive tasks and message event definitions missing `messageRef` attributes (PR #45)
- Broken outgoing flow reference on Task_ContractDeviation (`Flow_SP4_DeviationToCode` → `Flow_SP4_DeviationToGW`) (PR #45)

### Added
- 3 BPMN message definitions with Zeebe correlation subscriptions (VendorEngagement, VendorResponse, SignedContract) (PR #45)

## [2026.03.34] - 2026-03-06

### Added
- v8-c8 BPMN model with 6 enhancements: completeness gate, deal-killer pre-screen, OB-DMN-6 security routing, finance rework loop, 3-way approval, status notifications (PR #44)
- OB-DMN-7 deal-killer pre-screen DMN table (FIRST hit policy, 5 rules) (PR #44)
- 2 new Camunda 8 forms: sp1-completeness-gate, sp1-deal-killer-check (PR #44)
- 9 new presentation slides (53→62): System Landscape, Quantified Pain, Concierge Model, Simultaneous Engagement, 3 Request Types, DMN-5/6, Staffing, Measurement Dashboard (PR #44)
- Implementation roadmap document with 30/60/90/120-day phased plan and 7 critical challenges (PR #44)

### Changed
- Gap analysis expanded from 16 to 24 gaps with 10-perspective synthesis (PR #44)
- GAP-12 (Security Baseline) elevated from P2 to P1 (PR #44)
- Presentation enriched with v3 quotes and evidence across all 11 domain topics (PR #44)

## [2026.03.33] - 2026-03-06

### Fixed
- Enable pathway routing gap: GW_PathwayExec in SP4 now 3-way (Buy/Build/Enable) with ComplianceReview → EnableContractExec path (PR #43)
- 4 orphaned forms wired to BPMN tasks: sp4-compliance-review-enable, sp4-contract-deviation, sp4-coding-correction, sp5-condition-verification (PR #43)
- Stale flow reference: Task_ContractDeviation outgoing corrected to Flow_SP4_DeviationToCode (PR #43)
- SP5 flow target mismatch: Flow_SP5_5 corrected to target Task_AssignOwnership (PR #43)

### Added
- SP4 Buy path: ContractDeviation and CodingCorrection tasks after FinalizeContract (PR #43)
- SP5: ConditionVerification task between FinalApproval and OnboardSoftware (PR #43)

## [2026.03.32] - 2026-03-06

### Added
- v7-c8 BPMN model with discovery enhancements: NDA gate, request classification, compliance review, condition verification (PR #41)
- 5 discovery meeting notes: architecture, product, security/architecture, TPRM, vendor management (PR #41)
- 3 new DMN tables: OB-DMN-2 pathway routing, OB-DMN-5 prioritization scoring, OB-DMN-6 security assessment routing (PR #41)
- 7 new Camunda 8 forms for discovery-driven process enhancements (PR #41)
- 15 showcase screenshots documenting Camunda 8 deployment (PR #41)
- Showcase dashboard and instance seeding script (PR #41)

### Fixed
- FEEL expressions: proper variable references replacing bare `= true`/`= false` across all gateways (PR #41)
- 33 form schema updates to latest version (PR #41)

## [2026.03.31] - 2026-03-06

### Changed
- Rebranded presentation from SLA Platform to KPMG visual identity (colors, typography, layout) (PR #42)
- Added `kpmg.com` to auth worker allowed email domains (PR #42)
- Disabled KV namespace binding in wrangler.toml until namespace created (PR #42)

### Added
- 22 BPMN process diagram PNG images for presentation slides (PR #42)
- KPMG-branded PPTX export and Python generator script (PR #42)
- v3 roadmap reference presentation materials (PR #42)

## [2026.03.30] - 2026-03-06

### Changed
- Redesigned onboarding presentation: 28 slides → 32 slides with business-focused narrative, as-is/to-be framing, stakeholder quotes (PR #39)
- Auth worker authorization: replaced `agentic-innovations.com` with `kpmg.com` domain (PR #39)

### Added
- 7 BPMN SVG/PNG images rendered from v5 hierarchical model (top-level, SP1-SP5, PDLC) (PR #39)
- DMN decision table visuals (OB-DMN-1, OB-DMN-2, OB-DMN-4) as styled HTML tables in presentation (PR #39)
- Discovery documentation: stakeholder interviews (30+ stakeholders), gap analysis (16 gaps), OneTrust integration (PR #39)
- v2-roadmap presentation variant with PPTX generator script (PR #39)
- Showcase app for live BPMN/form demonstration (PR #39)
- fix-c8-for-deploy.py script for Camunda 8 deployment preparation (PR #39)
- 42 Camunda form schema version syncs (PR #39)

## [2026.03.29] - 2026-03-06

### Changed
- Monorepo restructure: separated strategic IP (`framework/`) from customer engagement (`customers/fs-onboarding/`) using `git mv` for history preservation (PR #38)
- Presentation rebuild: 51 mixed slides → 33 onboarding-only slides with build script for deterministic assembly (PR #38)
- CDD evidence hook: fixed SLM→SLA project key mismatch, skip validation when Jira issue not found (PR #38)

### Added
- 39 Camunda JSON forms for onboarding sub-processes (SP1-SP5, vendor, PDLC) (PR #38)
- Onboarding auth worker (`infrastructure/cloudflare-workers/sla-onboarding-auth/`) for `onboarding.agentic-innovations.com` (PR #38)
- Build script (`scripts/build-onboarding-presentation.py`) for deterministic HTML presentation assembly (PR #38)
- Strategic archive (`framework/docs/presentations/strategic-esg-framework.html`) preserving original 8-phase slides (PR #38)

## [2026.03.28] - 2026-03-05

### Added
- Claude Code command: `/review-model` slash command (`.claude/commands/review-model.md`) for reviewing manual BPMN model changes against project standards (PR #37)
- 7-step workflow: diff identification, element parsing, user intent capture, standards evaluation, validation, pattern codification, summary report
- Supports `--diff-only` and `--no-codify` flags

## [2026.03.27] - 2026-03-05

### Added
- BPMN rules: Hierarchical sub-process modeling standards (`bpmn-hierarchical-subprocess.md`) — 18 patterns extracted from user's v5 onboarding reference model (PR #35)
- Patterns include: top-level orchestrator design (no swim lanes), collapsed sub-process conventions, bypass flow routing, merge gateway pattern, two-channel message flow routing, parallel fan-out layout, two-path execution, loop-back pattern, nested sub-processes, timer patterns, BPMNDiagram ID uniqueness
- Enterprise pool height 290px, inter-pool gap 120px, two message flow channels (y=430 outbound, y=470 inbound)

## [2026.03.26] - 2026-03-05

### Fixed
- Onboarding BPMN: Fix vendor sequencing (swap DD task order, insert receive tasks with P5D/P7D SLA timers) using text-based edits on correct v4 base (PR #25)
- Onboarding BPMN: Remove invalid `camunda:candidateGroups` from `receiveTask` elements (PR #25)
- Onboarding BPMN: Reposition SLA breach end events within pool boundaries, fix 4px timer flows to 44px (PR #25)

### Added
- BPMN rules: Gateway naming convention (question-style), conditional flow labels (Yes/No), cross-lane notification pattern, regulatory annotation approach (PR #25)
- BPMN rules: Lane ordering convention, minimum lane heights per content density (PR #25)
- Lessons learned: BPMN file editing safety (never use lxml round-trip, verify base file, element count checks) (PR #25)

## [2026.03.25] - 2026-03-05

### Fixed
- Phase 6 BPMN: Remove illegal outgoing flow from EndEvent_QualityGateRejected (BPMN 2.0 violation), replace with proper XOR merge loop pattern (PR #30)
- Phase 1 BPMN: Add missing phase boundary pattern (quality gate, approval, transition event) after routing assignment (PR #32)
- Phase 2 BPMN: Replace `isAIInitiative` boolean condition with `aiComplexityScore >= 3` (DMN-first compliance), add phase boundary pattern (PR #32)
- Master BPMN: Remove unsupported escalationEventDefinition from end event, add dual start event annotation (PR #32)
- Phase 3/7/8 BPMN: Fix 4 flow label overlaps by repositioning label Y-coordinates (PR #32)
- CDD evidence hook: Replace fragile grep+awk YAML parsing with python3 regex (PR #31)

### Security
- Auth worker: Add SLA_SESSION HMAC-signed cookie (8h TTL) checked before Descope JWT to prevent re-authentication on page reload (PR #33)
- Auth worker: Add KV-based per-email rate limiting for /auth/verify-otp (5 attempts/10min) (PR #33)
- Auth worker: Document Cloudflare Rate Limiting Rule for /auth/send-otp (PR #33)

### Added
- Auth worker: tsconfig.json and @cloudflare/workers-types for type checking (PR #33)

## [2026.03.21] - 2026-03-04

### Fixed
- Onboarding v3 BPMN: 5 visual layout fixes — End_EvalRejected and End_VendorNotSelected repositioned into correct lanes, 40px gap added between Enterprise and Vendor pools, 2 backward sequence flows eliminated (Flow_R_ToTriage, Flow_PM_SelYes) by repositioning elements left-to-right
- Pool/lane widths expanded from 3400 to 4270 to accommodate repositioned elements
- Restored 9 text annotations and associations dropped during lxml serialization

## [2026.03.20] - 2026-03-04

### Changed
- Onboarding v3 BPMN: merged 3-pool structure into 2 pools (Software Onboarding + Vendor)
- Software Requester pool merged as swim lane into Software Onboarding pool per stakeholder feedback
- Cross-pool message flow replaced with cross-lane sequence flow (Flow_R_ToTriage)
- Removed requester pool annotations (Entry Criteria, Knowledge Management)
- Fixed 2 visual overlaps (Triage/PrelimAnalysis annotations, ParallelEval/TechArchReview)

## [2026.03.19] - 2026-03-04

### Added
- Comprehensive task documentation for all 28 remaining user tasks across Software Requester (4), Product Management (20), and PDLC sub-process (4) pools
- Combined with v2026.03.18, all 38 user tasks in onboarding ideal state v2 now have full regulatory controls, evidence collection, and data point documentation
- Regulatory frameworks referenced: OCC 2023-17 (29 refs), NIST CSF 2.0 (25), SOX (22), GDPR (14), DORA (14), ISO 27001 (4), SEC 17a-4 (2)

## [2026.03.18] - 2026-03-04

### Added
- Onboarding ideal state v2 BPMN with detailed vendor task documentation
- 10 vendor lane user tasks enriched with bpmn:documentation summaries and camunda:property comments
- Regulatory control mappings (OCC 2023-17, GDPR, SOX, DORA, NIST CSF 2.0, ISO 27001, SEC 17a-4) per task
- Evidence collection requirements and data point specifications for each vendor lifecycle stage

## [2026.03.17] - 2026-03-04

### Added
- Onboarding-only customer project: first customer-specific engagement in mono-repo
- 4 OB-specific DMN tables (OB-DMN-1 risk tier, OB-DMN-2 pathway routing, OB-DMN-3 governance routing, OB-DMN-4 SLA breach escalation)
- 7 BPMN process models: 5 phase models (Intake → Contracting), orchestrator (25-day SLA), post-onboarding summary
- 22-slide HTML presentation with D3 charts for cycle time and automation targets
- OB_ namespace prefix pattern for customer-specific Camunda deployments

## [2026.03.16] - 2026-03-04

### Fixed
- 4 CRITICAL: Unhandled promise rejections in bpmn-validator.js and element-checker.js, suppressed stderr in validate-bpmn.sh, shell strictness (set -euo pipefail)
- 6 HIGH: File I/O error handling in security-scanner.js and fix-diagonal-flows.js, glob safety in check-decision-log.sh, unchecked git pull in load-memory-bank-light.sh, pipefail in hook scripts
- 2 HIGH BPMN: DMN-first violation in Phase 4 governance review, missing phase boundary pattern in Phase 7

### Changed
- Added `camunda:decisionRefBinding="latest"` to all 7 business rule tasks across 5 BPMN files
- Replaced wrong Zeebe/SLA automation attribute checks with Camunda 7 attributes (camunda:type, camunda:class)
- Labeled backward flows with "Loop:" prefix for visual clarity compliance
- Fixed 8 flow label y-positions in cross-cutting subprocesses to avoid task text overlap
- Moved Phase 6 timer label to the right of boundary event
- Derive Descope project ID from env binding instead of hardcoding in auth worker
- Rewrite logout cookie clearing to use headers.append() per RFC 6265

### Security
- Added security headers (X-Content-Type-Options, X-Frame-Options, CSP, HSTS, Referrer-Policy) to login and unauthorized pages
- Clear PENDING_EMAIL cookie on logout with Secure/HttpOnly flags
- Integrated flow-direction-checker.js into validation pipeline

### Removed
- Dead `rebuildEdgeXml` function from fix-diagonal-flows.js
- Extra `docs/presentations/prd.html` build artifact

## [2026.03.15] - 2026-03-04

### Fixed
- Phase 8 Operations BPMN layout: expanded Automation lane (160→200px), Enterprise Governance pool (930→970px)
- Start event flow simplified from 4-waypoint up-and-over routing to 2-waypoint straight horizontal
- Vendor pool and all vendor elements shifted +40px to maintain 30px inter-pool gap
- Annotation and message flow waypoints adjusted for new pool positions

## [2026.03.14] - 2026-03-04

### Added
- Competitive positioning slide: SLA vs ServiceNow GRC vs OneTrust vs ProcessUnity comparison matrix
- BPMN notation guide slide: events, gateways, activities, and structural element legend
- Persona value anchors for 6 under-served personas on relevant phase slides
- Key insight annotations below all 5 D3 charts
- Structured CTA slide with CRO/CTO/CCO decision requests, ROI projections, deployment timeline

### Changed
- All automation percentages labeled "Automation Target" with Horizon 3 design-state footnotes
- Slide count 35 → 37 with full navigation renumbering
- DMN table details slide updated with FIRST hit policies for DMN-1, DMN-2, DMN-6

## [2026.03.13] - 2026-03-04

### Fixed
- DMN-1, DMN-2, DMN-6: Changed hit policy from UNIQUE to FIRST to resolve coverage gaps and overlapping rules in multi-dimensional input spaces
- DMN-1: Added catch-all rule-17 defaulting to "Limited" risk tier for unclassified input combinations
- DMN-2: Added catch-all rule-13 defaulting to "Hybrid" pathway for unclassified routing scenarios
- DMN-6: Added catch-all rule-13 defaulting to "Normal-Medium" change type requiring CAB review

### Added
- REQ-DMN-002 governance metadata (version, effective date, approving authority, review cycle, regulatory basis) to all 8 DMN tables
- Updated bpmn-governance-standards.md hit policy reference table

## [2026.03.12] - 2026-03-04

### Changed
- Converted presentation navigation from display:none/active toggle to scroll-snap vertical scrolling (matching kmflow style)
- Hero subtitle: increased font-weight 300→700, opacity 0.9→1.0, font-size 1.5rem→1.75rem for visibility
- Replaced bottom-center dot navigation with right-side slide indicator dots
- Keyboard navigation: ArrowUp/ArrowDown + PageUp/PageDown + Home/End

### Fixed
- IntersectionObserver root set to scroll container so D3 charts render on scroll
- Scroll event handler throttled via requestAnimationFrame

## [2026.03.11] - 2026-03-04

### Fixed
- Phase 2 Planning: compact layout — gateways moved from Automation to Technical lane, pool 1000px → 930px, max vertical jump 875px → 465px
- Phase 5 Contracting: compact layout — pool 1450px → 930px, split/join gateways to Contracting lane, max jump 1115px → 260px, candidateGroups corrected
- Phase 6 SDLC: compact layout — pool 1125px → 860px, SLA escalation end events positioned horizontally
- Phase 7 Deployment: compact layout — backward flows fixed, rejection loops routed above
- Phase 8 Operations: compact layout — pool 1290px → 790px, removed duplicate flow, emergency path simplified

### Added
- BPMN SVG renders for all 8 phases + master + cross-cutting
- Camunda Modeler screenshots for all phases
- BPMN/Camunda7 reference guides and requirement docs
- Validator scripts (fix-diagonal-flows, flow-direction-checker)
- Deployment security rules and full-sdlc command

### Removed
- Superseded .docx requirement files
- Onboarding-only backup file (.bpmn.original)

## [2026.03.10] - 2026-03-04

### Added
- Phase 0.5 (Content-Aware Security Validation) in `pr-orchestrator.md` — conditional BPMN/DMN validation and security-sensitive file scanning
- Security scanner runs as first gate when PR touches `.bpmn` or `.dmn` files
- Hardcoded secret and open redirect detection for auth worker, `_worker.js`, and presentation files
- 4 new quality gate conditions in pr-orchestrator pipeline

## [2026.03.9] - 2026-03-04

### Added
- `security-scanner.js` validator detecting XXE injection, ScriptTask RCE, JUEL expression injection, Java class loading, external script references, CDATA executable patterns, DMN FEEL injection
- Security scanner integrated as first blocking gate in `validate-bpmn.sh` with DMN scan pass

### Fixed
- Open redirect in auth worker — `sanitizeRedirect()` applied to 3 form/query param locations
- Hardcoded `PROXY_SECRET` removed from `_worker.js` and `wrangler.toml` (now Wrangler secrets)

### Security
- D3 pinned to jsDelivr 7.9.0 with SRI integrity hash

## [2026.03.8] - 2026-03-04

### Fixed
- Cross-cutting BPMN: lane ordering corrected from 1,3,2,4,5 to sequential 1,2,3,4,5 (swapped SP2/SP3 lane assignments and DI positions)
- Cross-cutting BPMN: expanded pool height (660→690) and Automation lane (105→135) for start event label clearance
- Operations BPMN: `MsgFlow_VendorRetireNotice` targetRef changed from `Task_8R3_VendorNotification` (inside collapsed SubProcess_8R) to `SubProcess_8R` — resolves Camunda "not yet drawn" warning
- Operations BPMN: removed 11 invalid lane `flowNodeRef` entries referencing internal subprocess tasks
- Operations BPMN: fixed message flow DI waypoints with L-shaped routing to SubProcess_8R

## [2026.03.7] - 2026-03-03

### Changed
- Cross-cutting BPMN redesign: redistributed 5 sub-processes across 5 lanes (1 SP per lane) — fixes overcrowded Business lane and empty Automation lane
- Added parallel gateway for explicit fork semantics replacing 5 implicit start event flows
- Start event and SP5 (Continuous Improvement) moved to Automation lane (system-triggered)
- SP3 (Incident Response) moved to Governance lane; SP4 (Regulatory Change) moved to Compliance lane

### Fixed
- NoAction default flow in SP1 now routes above task bounding boxes instead of cutting through 50% Warning task
- 50% Warning flow label repositioned above task clearance zone to prevent text overlap

### Added
- 3 new visual clarity rules in `bpmn-visual-clarity.md` v1.1.0: default/bypass flow routing, flow label clearance, collapsed sub-process fan-out pattern
- 3 new validation checklist items (items 11-13)

## [2026.03.6] - 2026-03-03

### Fixed
- All 5 BPMN agents updated from obsolete 7-phase/7-lane/14-DMN to current 8-phase/9+1-lane/8-DMN schema
- All 4 BPMN context files completely rewritten for current schema
- 4 skills fixed (bpmn-editing, bpmn-cicd, tprm-workflow-builder, context-bpmn)
- bpmn-validator.js: 9+1 candidateGroups, camunda-bpmn-moddle parsing, DMN cross-reference validation
- visual-overlap-checker.js: per-BPMNDiagram scoping eliminates cross-diagram false positives
- validate-bpmn.sh: integrate element-checker, exclude archive, overlap as blocking gate
- pre-edit-validation.sh: branch protection now functional
- validate-cdd-evidence.sh: curl timeout prevents hook hangs
- Phase-3 BPMN: 10 invalid candidateGroups fixed to canonical 9+1 names
- Master BPMN: 4 DMN refs corrected to canonical IDs, 4 non-canonical businessRuleTasks converted
- Visual overlaps fixed in Phase-1, Phase-8, and Cross-cutting models

### Added
- 7 BPMN 2.0 pattern rules: error boundary, signal events, message flow, terminate end, service task, multi-instance, DMN-first clarification
- Phase-scoped regulatory annotation guidance in bpmn-governance-standards.md
- Vendor pool usage guidance

## [2026.03.5] - 2026-03-03

### Fixed
- Phase 2 Planning BPMN layout: moved all split/join gateways to Automation lane, replaced diagonal cross-lane flows with L-shaped vertical routing, fixed overlapping risk tier lines, standardized Automation lane to 125px
- Restored `camunda:candidateGroups` on all 9+1 lane definitions (inadvertently dropped during layout rewrite)

## [2026.03.4] - 2026-03-03

### Added
- 10 BPMN SVG renderings in `docs/presentations/images/` (master + 8 phases + cross-cutting)
- `_worker.js` for Cloudflare Pages proxy secret validation

### Changed
- Replaced all 10 `{{PLACEHOLDER}}` tokens in presentation with actual SVG paths
- Fixed slide counter from 33 to 32 (actual count)

## [2026.03.3] - 2026-03-03

### Added
- 8 new DMN 1.3 decision tables (DMN-1 through DMN-8) per BPMN Conversion Prompt spec
- 8 BPMN phase models (Phase 1-8) with 2-pool/9-lane schema, DMN-first routing, timer SLAs
- 5 cross-cutting event sub-processes (SLA Monitoring, Vulnerability Remediation, Incident Response, Regulatory Change, Continuous Improvement)
- Master orchestrator BPMN (8 sequential collapsed sub-processes, 3 end events)
- Phase 6 SDLC with 6 nested sub-processes (Sprint, Dev, Test, DevSecOps, Compliance Gates, Review)
- Phase 8 Operations with looping monitoring cycle, change management, and decommission paths
- PRD updated for 8-phase/8-DMN/2-pool schema

### Changed
- Migrated from 7-phase/14-DMN/7-lane schema to 8-phase/8-DMN/2-pool-9+1-lane schema
- Archived 15 legacy DMN tables to `decisions/archive/`
- Archived legacy BPMN models to `processes/archive/`
- Updated presentation template for 8-phase architecture
- Updated BPMN modeling standards, governance standards, visual clarity rules for new schema
- Aligned candidateGroups across all phases to 8-lane naming convention

## [2026.03.2] - 2026-03-02

### Changed
- Redesigned master orchestrator BPMN with correct phase numbering (0-6), retirement phase, and parallel split/merge gateway for Build vs Buy pathway
- Fixed DI shape dimensions from 160x80 to standard 100x80 across all master activities
- Added Activity Element Types rule to BPMN modeling standards and editing skill

## [2026.03.1] - 2026-03-02

### Added
- 15 DMN 1.3 decision tables across phases 1-6 (AI routing, risk tier, vendor selection, buy-vs-build, funding, observability, TPRM monitoring, and more)
- 10 BPMN 2.0 process models (master orchestrator + phases 0-6) with Camunda 7 compatibility, 7 swim lanes, DMN business rule references, SLA timer events, and regulatory annotations
- 34-slide HTML presentation with inline SVG process diagrams, 6 D3.js visualizations, and deterministic build system
- PRD (markdown + branded HTML) with 15-section structure covering executive summary, personas, features, regulatory requirements, architecture, and success metrics
- Deterministic build script (`scripts/build-presentation.sh`) computing metrics from codebase
- Enterprise Software Governance Master spec document (markdown + docx)
- Reference sample BPMN models from upstream sources
- Secure Cloudflare deployment with OTP auth worker protecting presentation
