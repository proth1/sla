# Changelog

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
