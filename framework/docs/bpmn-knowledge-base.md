# SLA Governance BPMN Knowledge Base

> Complete reference for all knowledge, rules, agents, skills, validators, hooks, memory, and conventions used to create and edit BPMN 2.0 process models in the SLA Enterprise Software Governance project.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Mandatory Rules (3 files)](#2-mandatory-rules)
3. [Specialized SubAgents (5 agents)](#3-specialized-subagents)
4. [Skills & Commands (10 skills)](#4-skills--commands)
5. [Context Files (4 files)](#5-context-files)
6. [Validation Scripts (5 scripts)](#6-validation-scripts)
7. [Hooks & Automation (8 hooks)](#7-hooks--automation)
8. [Memory Bank (6 files)](#8-memory-bank)
9. [CLAUDE.md Project Instructions](#9-claudemd-project-instructions)
10. [User Global Rules](#10-user-global-rules)
11. [Domain Model Reference](#11-domain-model-reference)
12. [Active Process Models (10 files)](#12-active-process-models)
13. [SVG Rendering Pipeline](#13-svg-rendering-pipeline)
14. [Deployment Pipeline](#14-deployment-pipeline)
15. [Complete File Inventory](#15-complete-file-inventory)

---

## 1. Architecture Overview

```
User Request
    |
    v
+------------------+     +-------------------------+
| CLAUDE.md        |---->| Mandatory Rules (3)     |
| (project config) |     | - bpmn-governance-std   |
+------------------+     | - bpmn-modeling-std     |
                          | - bpmn-visual-clarity   |
                          +-------------------------+
                                    |
                    +---------------+---------------+
                    |               |               |
                    v               v               v
          +-----------+   +-----------+   +-----------+
          | SubAgents |   |  Skills   |   | Validators|
          | (5 BPMN)  |   | (10 total)|   | (5 scripts|
          +-----------+   +-----------+   +-----------+
                    |               |               |
                    v               v               v
          +------------------------------------------------+
          |            BPMN 2.0 XML Output                 |
          |  (Camunda Platform 7 compatible)                |
          +------------------------------------------------+
                    |               |
                    v               v
          +-----------+   +------------------+
          | SVG Render|   | Cloudflare Pages |
          | (bpmn-js) |   | (OTP-protected)  |
          +-----------+   +------------------+
```

### Knowledge Loading Order

1. **Always loaded**: `CLAUDE.md` + all `.claude/rules/*.md` (injected into every conversation)
2. **On demand**: `/context:bpmn` loads 4 context files for deep modeling work
3. **On demand**: `/context:governance` loads domain + regulatory mapping
4. **On demand**: `/context:full` loads everything
5. **Automatic**: `bpmn-editing` skill triggers on any `.bpmn` file edit
6. **Automatic**: Hooks fire on git operations and file edits

---

## 2. Mandatory Rules

Three rule files are injected into **every** Claude Code conversation. They form the non-negotiable standard.

### 2.1 BPMN Governance Standards

**File**: `.claude/rules/bpmn-governance-standards.md` (5.5 KB)

Defines the **what** — the governance domain model that every BPMN file must encode.

| Section | Content |
|---------|---------|
| Pool & Lane Conventions | 2 pools, 9+1 lanes with `candidateGroups` mapping |
| 8-Phase Sequential Flow | Phase names, sub-process IDs, SLA durations, automation % |
| 3 Terminal End Events | End_Retired, End_Terminated, End_Rejected |
| XOR Gateway Decision Points | 4 key routing gateways with decision logic |
| Regulatory Text Annotations | 11 regulatory frameworks that must appear as annotations |
| 8 DMN Decision Tables | Table IDs, names, hit policies, usage locations |
| SLA Timer Patterns | ISO 8601 boundary timer event XML patterns |
| Phase Boundary Pattern | 4-step transition: completion > quality gate > approval > transition |
| 5 Cross-Cutting Sub-Processes | SLA Monitoring, Vulnerability, Incident, Regulatory, Improvement |

**Lane Names** (industry best practice — no "Lane" suffix):

| Lane Name | candidateGroups | Line of Defense |
|-----------|----------------|-----------------|
| Business | `business-lane` | 1st |
| Governance | `governance-lane` | 2nd |
| Contracting | `contracting-lane` | 1st/2nd |
| Technical Assessment | `technical-assessment` | 2nd |
| AI Review | `ai-review` | 2nd |
| Compliance | `compliance-lane` | 2nd |
| Oversight | `oversight-lane` | 3rd |
| Automation | `automation-lane` | 1st |
| Vendor Response | `vendor-response` | N/A |

### 2.2 BPMN Modeling Standards

**File**: `.claude/rules/bpmn-modeling-standards.md` (9.4 KB)

Defines the **how** — XML patterns, element types, and structural requirements.

| Section | Key Rules |
|---------|-----------|
| Timer Boundary Events | Every timer MUST have `<bpmn:outgoing>`. Default: `cancelActivity="false"` |
| Phase Transition Events | Use `<bpmn:intermediateThrowEvent>` with `"Start {Phase}"` / `"{Phase} Complete"` naming |
| Phase Boundary Pattern | completion gateway > quality gate (DMN) > approval (userTask) > transition event |
| DMN-First Design | Every XOR gateway with business logic MUST reference a DMN table — no embedded conditions |
| Merge Gateways | Exactly ONE unconditional outgoing, NO name attribute |
| Conditional Flow Labels | All conditional flows MUST have Yes/No labels with `<bpmndi:BPMNLabel>` |
| Regulatory Annotations | Text annotations + `<bpmn:association>` for applicable regulations per phase |
| SLA Escalation Pattern | Duration table: BusinessRuleTask=PT2H, UserTask(Review)=P1D, UserTask(Approval)=P2D, SubProcess=P5D |
| Activity Element Types | Use `<bpmn:userTask>` not `<bpmn:callActivity>` for governance activities |
| XML Formatting | No comments, no redundant defaults, single-line namespaces, Camunda Modeler format |
| Visual Layout | Left-to-right within lanes, tasks 100x80, gateways 50x50, events 36x36 |
| Collapsed Subprocesses | Each MUST have its own `<bpmndi:BPMNDiagram>` element |
| Validation Checklist | 14-point checklist covering visual, process logic, governance, and XML formatting |

### 2.3 BPMN Visual Clarity

**File**: `.claude/rules/bpmn-visual-clarity.md` (7.3 KB)

Defines the **look** — pixel-perfect positioning for human readability.

| Section | Key Rules |
|---------|-----------|
| Left-to-Right Principle | ALL sequence flows left-to-right. Only explicit loops (Retry/Revise) go backward |
| Multi-Lane Layout | 9+1 lanes, each 125px tall, with exact Y-coordinate table |
| Element Positioning | Task/Gateway/Event Y-positions per lane (centered vertically) |
| Cross-Lane Routing | Vertical segments between lanes, horizontal within. NO diagonal crossing 2+ lanes |
| Standard X-Spacing | Start>Task=64px, Task>Gateway=65px, Gateway>Task=65px, Task>End=52-62px |
| Decision Gateway Pattern | Yes continues right, No branches down |
| Parallel Branch Layout | Align vertically across lanes, split/join in coordinating lane |
| Revision Loop Pattern | Loops go ABOVE main flow, target merge gateway, not task directly |
| Timer Labels | Position to RIGHT: x+44, y+4 from boundary event |
| 10-Point Validation | No backward flows, correct lanes, vertical cross-lane, loops above, consistent spacing |

**Lane Y-Coordinates** (from pool top at y=0):

| Lane | Y-Start | Y-End | Task Y | Gateway Y | Event Y |
|------|---------|-------|--------|-----------|---------|
| Business | 0 | 125 | 22 | 37 | 44 |
| Governance | 125 | 250 | 147 | 162 | 169 |
| Contracting | 250 | 375 | 272 | 287 | 294 |
| Technical Assessment | 375 | 500 | 397 | 412 | 419 |
| AI Review | 500 | 625 | 522 | 537 | 544 |
| Compliance | 625 | 750 | 647 | 662 | 669 |
| Oversight | 750 | 875 | 772 | 787 | 794 |
| Automation | 875 | 1000 | 897 | 912 | 919 |
| Vendor Response | 1030 | 1155 | 1052 | 1067 | 1074 |

---

## 3. Specialized SubAgents

Five purpose-built agents handle different stages of the BPMN lifecycle.

### 3.1 governance-process-modeler

**File**: `.claude/agents/governance-process-modeler.md` (18 KB)
**Tools**: Read, Write, Edit, Bash, Grep, Glob
**Role**: Primary BPMN generation agent

Responsible for creating new BPMN process models from scratch. Encodes the full 8-phase governance lifecycle, 4 pathways, 9+1 swim lane accountability model, and all Camunda Platform 7 requirements.

**Key capabilities**:
- Generate complete BPMN 2.0 XML with process logic + DI layout
- Apply DMN-first design (references 8 DMN tables)
- Encode phase boundary patterns (completion > quality gate > approval > transition)
- Place regulatory annotations per phase
- Support all 4 governance pathways (Fast-Track, Standard, Enhanced, Emergency)

**When to use**: Creating a new phase model, rebuilding from scratch, generating a new cross-cutting sub-process.

### 3.2 bpmn-specialist

**File**: `.claude/agents/bpmn-specialist.md` (13 KB)
**Tools**: Read, Write, Edit, Bash, Grep, Glob
**Role**: BPMN repair, layout optimization, visual quality

Handles editing existing BPMN files — fixing layout issues, optimizing visual clarity, detecting backward flows, and ensuring Camunda 7 compatibility.

**Key capabilities**:
- Backward flow detection and auto-repair
- Layout optimization within swim lanes
- Collapse subprocess support
- Timer boundary event positioning
- Cross-lane routing enforcement

**When to use**: Fixing visual issues, repositioning elements, repairing broken flows, optimizing layout after Camunda Modeler edits.

### 3.3 bpmn-validator

**File**: `.claude/agents/bpmn-validator.md` (17 KB)
**Tools**: Read, Write, Bash, Grep, Glob
**Role**: Comprehensive BPMN validation

Validates BPMN files against 17+ validation patterns covering Camunda 7 compatibility, visual quality, SLA governance best practices, and structural integrity.

**Key capabilities**:
- BPMN 2.0 syntax validation
- Camunda 7 vs Camunda 8 compatibility checking (flag Zeebe, Operate elements)
- 17 validation patterns (timer events, phase boundaries, flow direction, overlap, candidateGroups)
- DMN table ID cross-reference validation
- Regulatory annotation verification
- Visual overlap detection

**When to use**: Before committing BPMN files, as part of PR review, after any DI-section edits.

### 3.4 bpmn-tester

**File**: `.claude/agents/bpmn-tester.md` (11 KB)
**Tools**: Read, Write, Bash, Grep, Glob
**Role**: BDD test generation and structural validation

Generates Gherkin feature files from BPMN analysis and performs structural-only validation without requiring a running Camunda engine.

**Key capabilities**:
- AI-powered Gherkin feature file generation
- Path coverage analysis (happy path, error, boundary conditions)
- Element completeness verification (flows connected, groups assigned, DMN refs valid)
- Test coverage gap detection
- 80% minimum path coverage requirement

**When to use**: Before PR creation, after model changes, when validating structural integrity.

### 3.5 dmn-decision-architect

**File**: `.claude/agents/dmn-decision-architect.md` (25 KB)
**Tools**: Read, Write, Edit, Bash, Grep, Glob
**Role**: DMN 1.3 decision table creation and maintenance

Creates and maintains all DMN decision tables that encode governance logic. Produces Camunda 7-compatible DMN XML with correct hit policies and FEEL expressions.

**Key capabilities**:
- DMN 1.3 XML generation with Camunda 7 namespace
- 8 active decision tables (DMN-1 through DMN-8)
- Hit policy enforcement (UNIQUE, FIRST, COLLECT)
- FEEL expression validation
- Complete rule coverage for all input combinations

**When to use**: Creating new DMN tables, editing business rules, validating DMN-BPMN integration.

### Agent Model Routing

| Agent | Recommended Model | Cost |
|-------|-------------------|------|
| governance-process-modeler | sonnet | $3/$15 MTok |
| bpmn-specialist | sonnet | $3/$15 MTok |
| bpmn-validator | sonnet | $3/$15 MTok |
| bpmn-tester | sonnet | $3/$15 MTok |
| dmn-decision-architect | sonnet | $3/$15 MTok |

---

## 4. Skills & Commands

Ten skills provide specialized capabilities invokable via `/skill-name` or triggered automatically.

### BPMN-Specific Skills

| Skill | File | Trigger | Purpose |
|-------|------|---------|---------|
| `bpmn-editing` | `.claude/skills/bpmn-editing/SKILL.md` | Auto on `.bpmn` edit | Layout standards, XML formatting, element sizing, Camunda Modeler compatibility |
| `bpmn-to-svg` | `.claude/skills/bpmn-to-svg/SKILL.md` | `/bpmn-to-svg` | Render BPMN to SVG via bpmn-js for presentation embedding |
| `bpmn-cicd` | `.claude/skills/bpmn-cicd/SKILL.md` | Pipeline invocation | CI/CD patterns: validate > test > visual check > deploy (Phases 4-7 deferred) |
| `tprm-workflow-builder` | `.claude/skills/tprm-workflow-builder/SKILL.md` | `/tprm-workflow-builder` | Generate TPRM lifecycle BPMN from requirements (OCC 2023-17 aligned) |
| `requirements-ingest` | `.claude/skills/requirements-ingest/SKILL.md` | `/requirements-ingest` | Parse docs/requirements/ into actionable BPMN/DMN specifications |
| `test-bpmn` | `.claude/commands/test-bpmn.md` | `/test-bpmn` | Generate BDD tests for BPMN processes |

### Context Loading Skills

| Skill | File | Trigger | Loads |
|-------|------|---------|-------|
| `context-bpmn` | `.claude/skills/context-bpmn/SKILL.md` | `/context:bpmn` | 4 BPMN context files + patterns library |
| `governance-context` | `.claude/skills/governance-context/SKILL.md` | `/context:governance` | Domain rules + regulatory mapping |
| `context-full` | `.claude/skills/context-full/SKILL.md` | `/context:full` | Everything (all context + memory + rules) |
| `memory-search` | `.claude/skills/memory-search/SKILL.md` | `/memory-search` | Search across memory-bank files |

### Supporting Skills

| Skill | File | Trigger | Purpose |
|-------|------|---------|---------|
| `sla-presentation` | `.claude/skills/sla-presentation/SKILL.md` | `/sla-presentation` | Generate/update HTML presentation with BPMN SVGs |
| `full-sdlc` | `.claude/commands/full-sdlc.md` | `/full-sdlc` | Full SDLC orchestration (Jira > branch > model > validate > PR) |

---

## 5. Context Files

Four deep-reference documents loaded via `/context:bpmn`.

### 5.1 SLA Governance Domain

**File**: `.claude/context/bpmn/sla-governance-domain.md` (24 KB)

Authoritative domain reference covering:
- 8-phase lifecycle (triggers, durations, outputs, responsible lanes)
- 4 pathways (Fast-Track, Standard, Enhanced, Emergency) with routing criteria
- 9+1 swim lanes with candidateGroups, RACI roles, line of defense mapping
- 8 DMN decision table inventory with input/output specifications
- 5 cross-cutting event sub-processes
- 3 terminal end events with trigger conditions

### 5.2 BPMN Modeling Standards (Context)

**File**: `.claude/context/bpmn/bpmn-modeling-standards.md` (14 KB)

Extended modeling reference covering:
- Element sizing and spacing conventions
- Naming patterns for IDs, names, and labels
- XML namespace requirements
- Camunda Platform 7 specific extensions
- Visual layout grid system

### 5.3 Regulatory Alignment

**File**: `.claude/context/bpmn/regulatory-alignment.md` (17 KB)

Maps every regulatory framework to specific BPMN elements:
- OCC 2023-17 (Third-Party Risk) — Phases 2, 3, 5
- SR 11-7 (Model Risk) — Phase 2 (AI governance)
- SOX (Financial Controls) — Phase 3
- GDPR/CCPA (Data Protection) — Phase 2
- EU AI Act (AI Risk Classification) — Phase 2
- DORA (Digital Resilience) — Phase 5
- NIST CSF 2.0, ISO 27001, SEC 17a-4, BCBS d577, FS AI RMF

### 5.4 BPMN Testing

**File**: `.claude/context/bpmn/bpmn-testing.md` (15 KB)

BDD test generation workflow:
- Gherkin feature file templates
- Structural validation patterns
- Path coverage analysis methodology
- Test coverage metrics and thresholds (80% minimum)
- Test naming conventions

---

## 6. Validation Scripts

Five JavaScript/Bash scripts provide deterministic, zero-cost validation.

### 6.1 Master Orchestrator

**File**: `scripts/validators/validate-bpmn.sh`
**Usage**: `bash scripts/validators/validate-bpmn.sh [optional-file.bpmn]`

Runs all validators in sequence. Without arguments, validates every `.bpmn` file in `processes/`. Reports pass/fail/warning counts.

### 6.2 BPMN Structural Validator

**File**: `scripts/validators/bpmn-validator.js`
**Usage**: `node scripts/validators/bpmn-validator.js <file.bpmn>`
**Dependencies**: `bpmn-moddle`, `moddle-xml`, `min-dash`, `saxen`

Validates:
- XML well-formedness and BPMN 2.0 schema compliance
- Camunda 7 namespace and extension compatibility
- Timer boundary events have outgoing flows
- All sequence flows have valid source/target
- Gateway incoming/outgoing counts
- candidateGroups from valid set
- DMN table references from valid set
- `isExecutable` and `historyTimeToLive` configuration
- Element reachability from start events

### 6.3 Visual Overlap Checker

**File**: `scripts/validators/visual-overlap-checker.js`
**Usage**: `node scripts/validators/visual-overlap-checker.js <file.bpmn>`

Static analysis of BPMNDiagram DI section:
- Detects overlapping `dc:Bounds` (elements occupying same visual space)
- Checks label-to-element overlap
- Reports element IDs and coordinates of violations
- No rendering required (pure XML geometry)

### 6.4 Element Checker

**File**: `scripts/validators/element-checker.js`
**Usage**: `node scripts/validators/element-checker.js <file.bpmn>`

Validates element structure completeness:
- Every referenced `bpmnElement` has a corresponding `BPMNShape`/`BPMNEdge`
- No orphaned DI elements without process references
- Lane membership consistency

### 6.5 Diagonal Flow Fixer

**File**: `scripts/validators/fix-diagonal-flows.js`
**Usage**: `node scripts/validators/fix-diagonal-flows.js [--dry-run] <file.bpmn>`

Detects and auto-fixes backward/diagonal sequence flows:
- Identifies flows where last waypoint X < first waypoint X (backward)
- Identifies diagonal flows crossing 2+ lane boundaries
- `--dry-run` mode reports without modifying
- Fix mode rewrites waypoints to use vertical-then-horizontal routing

### NPM Dependencies

```
scripts/validators/node_modules/
  bpmn-moddle    — BPMN 2.0 XML parser and metamodel
  moddle-xml     — XML serialization for moddle
  min-dash       — Utility functions
  saxen          — SAX-based XML parser
```

Install: `cd scripts/validators && npm install`

---

## 7. Hooks & Automation

Eight hook scripts fire automatically at different lifecycle points. Configured in `.claude/settings.json`.

### Hook Configuration

```json
{
  "hooks": {
    "SessionStart": ["load-memory-bank-light.sh"],
    "PreToolUse (Write|Edit)": ["pre-edit-validation.sh"],
    "PreToolUse (Bash)": ["validate-cdd-evidence.sh"],
    "PostToolUse (Bash)": [
      "pr-created-hook.sh",
      "post-pr-creation.sh",
      "post-merge-hook.sh"
    ],
    "PostToolUse (Write|Edit)": ["check-decision-log.sh"],
    "SessionEnd": ["session-end.sh"]
  }
}
```

### Hook Details

| Hook | Trigger | Purpose | BPMN Impact |
|------|---------|---------|-------------|
| `load-memory-bank-light.sh` | Session start | Loads activeContext.md and platformState.md | Provides current model inventory |
| `pre-edit-validation.sh` | Before Write/Edit | Blocks edits on main branch | Enforces feature branch workflow for BPMN |
| `validate-cdd-evidence.sh` | Before Bash | Validates CDD compliance evidence | Ensures BPMN changes have traceability |
| `pr-created-hook.sh` | After `gh pr create` | Emits directive to invoke pr-orchestrator | Triggers 9-agent review including BPMN validation |
| `post-pr-creation.sh` | After `gh pr create` | Additional PR creation automation | Augments PR metadata |
| `post-merge-hook.sh` | After `gh pr merge` | Triggers CHANGELOG, Jira, cleanup | Updates version tracking after BPMN merges |
| `check-decision-log.sh` | After Write/Edit | Prompts decision log update | Captures BPMN architecture decisions |
| `session-end.sh` | Session end | Persists session state | Saves BPMN work-in-progress context |

---

## 8. Memory Bank

Six files maintain cross-session state. Located in `.claude/memory-bank/`.

| File | Purpose | Update Trigger |
|------|---------|----------------|
| `activeContext.md` | Current session state, last completed work, next steps | Session start (read), progress, session end (write) |
| `platformState.md` | Version, artifact counts, deployment URLs, release history | After PR merges, stat changes |
| `CHANGELOG.md` | CalVer release notes (YYYY.MM.release) | After every `gh pr merge` |
| `decisionLog.md` | Architecture and technical decisions | When BPMN/DMN design choices are made |
| `lessonsLearned.md` | Incidents, mistakes, successes | After debugging sessions |
| `patterns.md` | Established BPMN patterns library | When new patterns are validated |

### User Auto-Memory

**File**: `/Users/proth/.claude/projects/-Users-proth-repos-sla/memory/MEMORY.md`

Persists across all conversations. Key BPMN entries:
- Schema: 8 phases, 2 pools, 9+1 lanes, 8 DMN tables
- candidateGroups mapping
- SVG rendering command with `PUPPETEER_EXECUTABLE_PATH`
- Deployment patterns and verification commands
- Presentation slide count and update procedures

---

## 9. CLAUDE.md Project Instructions

**File**: `CLAUDE.md` (project root)

Core instructions injected into every conversation:

| Section | BPMN-Relevant Content |
|---------|----------------------|
| Project Identity | BPMN 2.0 + DMN 1.3 governance framework, not application code |
| Repository Layout | `processes/master/`, `processes/phase-{1..8}-*/`, `processes/cross-cutting/`, `decisions/dmn/` |
| Validation Command | `bash scripts/validators/validate-bpmn.sh` |
| BPMN Constraints | Camunda 7 target, `camunda:` namespace, candidateGroups, historyTimeToLive, 2 pools, 9+1 lanes, 8 phases, 4 pathways, 3 end events, DMN-first, 8 DMN tables, 5 cross-cutting, regulatory annotations, SLA timers, phase transitions |
| CI/CD | No GitHub Actions — use Claude Code subagents: bpmn-validator, bpmn-tester, pipeline-orchestrator |
| Context Loading | `/context:bpmn`, `/context:governance`, `/context:full` |
| Workflow | Jira issue > branch > model > validate > PR > auto-review > merge |

---

## 10. User Global Rules

**File**: `/Users/proth/.claude/CLAUDE.md`

| Rule | BPMN Impact |
|------|-------------|
| "Verify no overlapping elements before completing edits" | Must run visual-overlap-checker after DI edits |
| "Prefer expanding container dimensions over cramming" | Expand lane/pool height rather than compress elements |
| "Validate the file opens correctly in native editor" | Must verify in Camunda Modeler |
| "Use visual validation tools when available" | Must use `validate-bpmn-visual.js` |
| "Follow established patterns from reference models" | Use existing phase models as templates |
| "Before removing code, articulate why it exists" | Explain purpose before deleting BPMN elements |
| "If corrected twice, stop and rethink entirely" | Switch approach after repeated BPMN edit failures |

---

## 11. Domain Model Reference

### 8-Phase Governance Lifecycle

| Phase | Name | Sub-Process ID | SLA (Standard) | Automation |
|-------|------|----------------|-----------------|------------|
| 1 | Initiation and Intake | SP-Phase1-Intake | 1-2 days | 75% |
| 2 | Planning and Risk Scoping | SP-Phase2-Planning | 3-5 days | 60% |
| 3 | Due Diligence and Swarm | SP-Phase3-DueDiligence | 5-8 days | 70% |
| 4 | Governance Review and Approval | SP-Phase4-GovernanceReview | 3-5 days | 40% |
| 5 | Contracting and Controls | SP-Phase5-Contracting | 5-7 days | 50% |
| 6 | SDLC Development and Testing | SP-Phase6-SDLC | 10-15 days | 55% |
| 7 | Deployment and Go-Live | SP-Phase7-Deployment | 2-3 days | 60% |
| 8 | Operations and Retirement | SP-Phase8-Operations | Ongoing | 65% |

### 4 Governance Pathways

| Pathway | Trigger | Characteristics |
|---------|---------|-----------------|
| Fast-Track | Minimal risk, pre-approved vendor | Abbreviated due diligence, auto-approval |
| Standard | Limited/High risk, new vendor | Full 8-phase lifecycle |
| Enhanced | High risk, critical vendor | Extended due diligence, committee review |
| Emergency | Critical security/compliance | Expedited with post-hoc governance |

### 8 DMN Decision Tables

| ID | Table Name | Hit Policy | Used In |
|----|-----------|-----------|---------|
| DMN-1 | DMN_RiskTierClassification | UNIQUE | Phase 2 (Activity 2.3) |
| DMN-2 | DMN_PathwayRouting | UNIQUE | Phase 1 (Activity 1.6) |
| DMN-3 | DMN_GovernanceReviewRouting | UNIQUE | Phase 4 (Activity 4.2) |
| DMN-4 | DMN_AutomationTierAssignment | UNIQUE | Cross-cutting |
| DMN-5 | DMN_AgentConfidenceEscalation | FIRST | Cross-cutting |
| DMN-6 | DMN_ChangeRiskScoring | UNIQUE | Phase 8 (Activity 8C.1) |
| DMN-7 | DMN_VulnerabilityRemediationRouting | UNIQUE | Cross-cutting (SP-Cross-2) |
| DMN-8 | DMN_MonitoringCadenceAssignment | UNIQUE | Phase 8 (Activity 8.1) |

### 5 Cross-Cutting Event Sub-Processes

| ID | Name | Trigger |
|----|------|---------|
| SP-Cross-1 | SLA Monitoring & Breach Management | Timer events on every phase |
| SP-Cross-2 | Vulnerability Remediation Lifecycle | Security finding detected |
| SP-Cross-3 | Incident Response | Security alert from monitoring |
| SP-Cross-4 | Regulatory Change Management | Regulatory horizon scanning |
| SP-Cross-5 | Continuous Improvement & Process Mining | Continuous + quarterly timer |

### 3 Terminal End Events

| Event | Trigger | Phase |
|-------|---------|-------|
| End_Retired | Graceful wind-down via decommission | Phase 8R |
| End_Terminated | Emergency cessation (compliance breach, security incident) | Any |
| End_Rejected | Governance rejection | Phase 2 (Unacceptable Risk) or Phase 4 |

### 11 Regulatory Frameworks

OCC 2023-17, SR 11-7, SOX, GDPR/CCPA, EU AI Act, DORA, NIST CSF 2.0, ISO 27001, SEC 17a-4, BCBS d577, FS AI RMF

---

## 12. Active Process Models

10 BPMN files currently in production:

| Model | File | Elements | Complexity |
|-------|------|----------|-----------|
| Master Orchestrator | `processes/master/sla-governance-master.bpmn` | 8 phases as collapsed sub-processes | High |
| Phase 1: Intake | `processes/phase-1-intake/initiation-and-intake.bpmn` | 6 activities, 1 timer, 1 DMN | Low |
| Phase 2: Planning | `processes/phase-2-planning/planning-and-risk-scoping.bpmn` | 6 activities, regulatory annotations | Medium |
| Phase 3: Due Diligence | `processes/phase-3-due-diligence/due-diligence-and-swarm.bpmn` | Parallel swarm evaluation, vendor lane | High |
| Phase 4: Governance | `processes/phase-4-governance/governance-review-and-approval.bpmn` | 4-pathway routing, committee review | High |
| Phase 5: Contracting | `processes/phase-5-contracting/contracting-and-controls.bpmn` | Contract execution, vendor negotiation | Medium |
| Phase 6: SDLC | `processes/phase-6-sdlc/sdlc-development-and-testing.bpmn` | 8 collapsed sub-processes, sprint lifecycle | Very High |
| Phase 7: Deployment | `processes/phase-7-deployment/deployment-and-go-live.bpmn` | Readiness assessment, progressive deploy | Medium |
| Phase 8: Operations | `processes/phase-8-operations/operations-monitoring-retirement.bpmn` | Monitoring loop, change management, retirement | High |
| Cross-Cutting | `processes/cross-cutting/cross-cutting-event-subprocesses.bpmn` | 5 event sub-processes | High |

---

## 13. SVG Rendering Pipeline

### Tool

[bpmn-to-image](https://github.com/bpmn-io/bpmn-to-image) — uses bpmn-js (Puppeteer + Chrome) to render BPMN to SVG.

### Command

```bash
PUPPETEER_EXECUTABLE_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
npx bpmn-to-image \
  "processes/phase-1-intake/initiation-and-intake.bpmn:docs/presentations/images/phase-1-initiation-and-intake.svg" \
  --min-dimensions=1200x800 --no-footer
```

### Output

10 SVG files in `docs/presentations/images/`:

```
phase-1-initiation-and-intake.svg
phase-2-planning-and-risk-scoping.svg
phase-3-due-diligence-and-swarm.svg
phase-4-governance-review-and-approval.svg
phase-5-contracting-and-controls.svg
phase-6-sdlc-development-and-testing.svg
phase-7-deployment-and-go-live.svg
phase-8-operations-monitoring-retirement.svg
cross-cutting-event-subprocesses.svg
sla-governance-master.svg
```

### Presentation Integration

SVGs are embedded in `docs/presentations/index.html` via `<object>` or `<img>` tags on dedicated diagram slides (slides 17-26).

---

## 14. Deployment Pipeline

### Sequence

```
1. Validate     bash scripts/validators/validate-bpmn.sh
2. Render SVGs  PUPPETEER_EXECUTABLE_PATH=... npx bpmn-to-image ...
3. Deploy       npx wrangler pages deploy docs/presentations/ --project-name=sla-presentation --branch=main
4. Verify       curl -s https://sla-presentation.pages.dev/ -H "X-SLA-Auth-Proxy: ..." --compressed | wc -c
5. Cache purge  curl -X POST .../purge_cache -d '{"purge_everything":true}'
```

### Protection

- All access via `sla.agentic-innovations.com` (OTP-protected)
- Direct Pages URLs blocked by `_worker.js` (validates proxy secret)
- Auth Worker validates SLA_SESSION cookie (8h TTL) or Descope JWT

---

## 15. Complete File Inventory

### Rules (3 files, 22 KB total)

```
.claude/rules/bpmn-governance-standards.md     5.5 KB
.claude/rules/bpmn-modeling-standards.md       9.4 KB
.claude/rules/bpmn-visual-clarity.md           7.3 KB
```

### Agents (5 files, 84 KB total)

```
.claude/agents/governance-process-modeler.md  18.2 KB
.claude/agents/dmn-decision-architect.md      24.9 KB
.claude/agents/bpmn-validator.md              16.7 KB
.claude/agents/bpmn-specialist.md             13.0 KB
.claude/agents/bpmn-tester.md                 10.9 KB
```

### Skills (10 files)

```
.claude/skills/bpmn-editing/SKILL.md
.claude/skills/bpmn-to-svg/SKILL.md
.claude/skills/bpmn-cicd/SKILL.md
.claude/skills/tprm-workflow-builder/SKILL.md
.claude/skills/requirements-ingest/SKILL.md
.claude/skills/context-bpmn/SKILL.md
.claude/skills/governance-context/SKILL.md
.claude/skills/context-full/SKILL.md
.claude/skills/memory-search/SKILL.md
.claude/skills/sla-presentation/SKILL.md
```

### Commands (2 files)

```
.claude/commands/test-bpmn.md
.claude/commands/full-sdlc.md
```

### Context (4 files, 70 KB total)

```
.claude/context/bpmn/sla-governance-domain.md       24.1 KB
.claude/context/bpmn/regulatory-alignment.md         17.3 KB
.claude/context/bpmn/bpmn-testing.md                 15.2 KB
.claude/context/bpmn/bpmn-modeling-standards.md      13.7 KB
```

### Validators (5 scripts)

```
scripts/validators/validate-bpmn.sh
scripts/validators/bpmn-validator.js
scripts/validators/visual-overlap-checker.js
scripts/validators/element-checker.js
scripts/validators/fix-diagonal-flows.js
```

### Hooks (8 scripts)

```
.claude/hooks/load-memory-bank-light.sh
.claude/hooks/pre-edit-validation.sh
.claude/hooks/validate-cdd-evidence.sh
.claude/hooks/pr-created-hook.sh
.claude/hooks/post-pr-creation.sh
.claude/hooks/post-merge-hook.sh
.claude/hooks/check-decision-log.sh
.claude/hooks/session-end.sh
```

### Memory Bank (6 files)

```
.claude/memory-bank/activeContext.md
.claude/memory-bank/platformState.md
.claude/memory-bank/CHANGELOG.md
.claude/memory-bank/decisionLog.md
.claude/memory-bank/lessonsLearned.md
.claude/memory-bank/patterns.md
```

### Active BPMN Models (10 files)

```
processes/master/sla-governance-master.bpmn
processes/phase-1-intake/initiation-and-intake.bpmn
processes/phase-2-planning/planning-and-risk-scoping.bpmn
processes/phase-3-due-diligence/due-diligence-and-swarm.bpmn
processes/phase-4-governance/governance-review-and-approval.bpmn
processes/phase-5-contracting/contracting-and-controls.bpmn
processes/phase-6-sdlc/sdlc-development-and-testing.bpmn
processes/phase-7-deployment/deployment-and-go-live.bpmn
processes/phase-8-operations/operations-monitoring-retirement.bpmn
processes/cross-cutting/cross-cutting-event-subprocesses.bpmn
```

### Active DMN Tables (8 files)

```
decisions/dmn/DMN-1-risk-tier-classification.dmn
decisions/dmn/DMN-2-pathway-routing.dmn
decisions/dmn/DMN-3-governance-review-routing.dmn
decisions/dmn/DMN-4-automation-tier-assignment.dmn
decisions/dmn/DMN-5-agent-confidence-escalation.dmn
decisions/dmn/DMN-6-change-risk-scoring.dmn
decisions/dmn/DMN-7-vulnerability-remediation-routing.dmn
decisions/dmn/DMN-8-monitoring-cadence-assignment.dmn
```

### Configuration

```
.claude/settings.json                          (hooks config)
CLAUDE.md                                      (project instructions)
/Users/proth/.claude/CLAUDE.md                 (user global rules)
/Users/proth/.claude/projects/.../memory/MEMORY.md  (user auto-memory)
```

---

## Summary Statistics

| Category | Count | Total Size |
|----------|-------|-----------|
| Mandatory Rules | 3 | 22 KB |
| Specialized Agents | 5 | 84 KB |
| Skills & Commands | 12 | ~36 KB |
| Context Documents | 4 | 70 KB |
| Validation Scripts | 5 | ~14 KB |
| Hook Scripts | 8 | ~14 KB |
| Memory Bank Files | 6 | ~5 KB |
| Active BPMN Models | 10 | varies |
| Active DMN Tables | 8 | varies |
| **Total Knowledge Assets** | **61 files** | **~245 KB** |

---

*Generated 2026-03-03 | SLA Enterprise Software Governance v2026.03.4*
