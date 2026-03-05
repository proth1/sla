# BPMN Ecosystem Critical Evaluation Report

**Date**: 2026-03-05
**Methodology**: 7 parallel expert agents (critical-thinking, opus) with non-overlapping scopes
**Scope**: 10 BPMN models, 8 DMN tables, 6 agent definitions, 5 validators, 3 rule files, 8 hooks
**Total Findings**: 96 (14 CRITICAL, 30 HIGH, 24 MEDIUM, 7 LOW, 21 informational/portability)

---

## Executive Summary

The SLA governance BPMN ecosystem has strong foundational artifacts (canonical rule files, JavaScript validators, actual BPMN/DMN files) but suffers from three systemic failures:

1. **Schema Drift**: The v4.0 rebuild updated canonical sources but left 10+ agent definitions referencing obsolete 7-phase/7-lane/14-DMN schema. These agents will reject valid artifacts and accept invalid ones.

2. **Aspirational Infrastructure**: The PR orchestrator, BDD test pipeline, and CDD evidence system describe capabilities that don't exist. Zero test files, phantom `pnpm` commands, and 5 referenced agents with no definitions create a facade of quality assurance.

3. **DRY Violations**: Every specification value (candidateGroups, DMN IDs, hit policies, phase names, lane counts) is independently embedded in 5-15 files instead of referencing a canonical source. This is the root cause of issues #1 and #2.

**Bottom line**: The BPMN models and DMN tables themselves are largely correct. The tooling ecosystem around them — agents, validators, hooks, and testing — has significant gaps that undermine confidence in artifact quality.

---

## 1. CRITICAL Findings (13 issues — must fix before next PR)

### 1.1 BPMN Spec Violation: Event Subprocess with Illegal Outgoing Flow
**Expert**: 1 | **Task**: #17
**File**: `processes/master/sla-governance-master.bpmn`
**Issue**: `SubProcess_Emergency` (`triggeredByEvent="true"`) has an outgoing sequence flow to `EndEvent_Terminated`. BPMN 2.0 section 10.2.1 forbids event sub-processes from having incoming or outgoing sequence flows. Camunda 7 would reject this at deployment.
**Fix**: Move the terminate end event INSIDE the event subprocess. Remove the outgoing sequence flow from the subprocess boundary.

### 1.2 Obsolete Agent Schema: bpmn-commit-agent
**Expert**: 3, 5 | **Tasks**: #34, #60
**File**: `.claude/agents/bpmn-commit-agent.md`
**Issue**: Contains 14 wrong DMN IDs (pre-migration names), 7 wrong candidateGroups, wrong phase numbering (0-6 instead of 1-8), wrong phase names. Pre-commit validation regex patterns would reject ALL valid files.
**Fix**: Replace all embedded spec values with references to canonical rule files.

### 1.3 Obsolete Agent Schema: architecture-reviewer
**Expert**: 3 | **Task**: #36
**File**: `.claude/agents/architecture-reviewer.md`
**Issue**: Says "7 swim lanes" (should be 9+1), lists 7 old candidateGroups, references "14-table inventory" (should be 8), phases "0-6" (should be 1-8). Architecture reviews will flag correct usage as violations.
**Fix**: Same as 1.2 — remove embedded values, reference canonical sources.

### 1.4 DRY Violation Root Cause
**Expert**: 3, 5 | **Tasks**: #38, #86
**Issue**: Specification values are independently embedded in 15+ files. The v4.0 schema rebuild proved this fails: canonical sources were updated but 10 agent files were not. Currently correct agents (bpmn-validator, governance-process-modeler) will drift on the next schema change.
**Fix**: Create a machine-readable spec file (`.claude/specs/sla-governance-spec.yaml`) as single source of truth. All agents reference it, never embed values.

### 1.5 Zero Test Artifacts
**Expert**: 4 | **Task**: #26
**Issue**: No `.feature`, `.test.*`, or `.spec.*` files exist anywhere in the repository. The `bpmn-tester` agent and PR orchestrator BDD pipeline are entirely aspirational. The evidence directory (`memory-bank/evidence/`) does not exist. Material gap under OCC 2023-17 Section 4.3.
**Fix**: Create initial structural BDD tests for at least the master model and Phase 1.

### 1.6 DMN-to-BPMN Variable Binding Never Validated
**Expert**: 4 | **Task**: #32
**Issue**: No validator checks that DMN output variable names match BPMN process variable consumption. Example: Phase 1 Quality Gate invokes `DMN_AutomationTierAssignment` expecting `riskTier` as input, but `riskTier` is produced by `DMN_RiskTierClassification` which is never invoked in Phase 1.
**Fix**: Create a binding validator that cross-references `camunda:resultVariable` in BPMN with DMN output column names.

### 1.7 element-checker.js Invocation Mismatch
**Expert**: 2 | **Task**: #12
**File**: `scripts/validators/validate-bpmn.sh` line ~66
**Issue**: `element-checker.js` receives a directory path instead of a file path, causing it to scan ALL files in the directory. Its failures are also non-blocking (warnings only).
**Fix**: Pass the specific file path; make element-checker failures blocking.

### 1.8 scriptTask Policy Contradiction
**Expert**: 2 | **Task**: #13
**Issue**: `security-scanner.js` flags `scriptTask` as CRITICAL RCE risk (exit 1), but `bpmn-validator.js` and `element-checker.js` both list ScriptTask in their SUPPORTED_ELEMENTS. Contradictory guidance.
**Fix**: Remove scriptTask from SUPPORTED_ELEMENTS in bpmn-validator.js and element-checker.js. The security scanner's position is correct for governance models.

### 1.9 PR Orchestrator Phantom Pipeline
**Expert**: 6 | **Task**: #53
**File**: `.claude/agents/pr-orchestrator.md` lines 73-191
**Issue**: Phases 0-1 reference `pnpm lint`, `pnpm build`, `pnpm test`, `pnpm typecheck` — this project has no root `package.json`, no build system, no test framework. Every command would fail immediately.
**Fix**: Remove Phases 0-1. Replace with Phase 0.5 that runs `bash scripts/validators/validate-bpmn.sh`.

### 1.10 Phantom Agent Subagent Types
**Expert**: 6 | **Task**: #55
**File**: `.claude/agents/pr-orchestrator.md` Phase 5
**Issue**: References `acceptance-criteria-tester`, `dependency-checker`, `performance-analyzer`, `preview-deployer`, `report-compiler` — none have agent definition files. The 9-agent review team can only spawn 4 agents. Also `cloudflare-publisher` and `pipeline-orchestrator` referenced as GitHub Actions replacements don't exist.
**Fix**: Create definitions for agents that should exist; remove references to agents that shouldn't.

### 1.11 SLA-XXX vs SLM-XXX Naming Chaos
**Expert**: 6 | **Task**: #59
**Issue**: CLAUDE.md says `SLA-XXX`, every agent definition says `SLM-XXX`, hooks partially accept both. A developer following CLAUDE.md creates branches that fail CDD validation and post-merge Jira transitions (which only match SLM).
**Fix**: Standardize on `SLM-XXX` (the actual Jira project key). Update CLAUDE.md, pre-edit-validation.sh error messages, full-sdlc.md, bpmn-tester.md.

### 1.12 DMN Hit Policy Contradictions
**Expert**: 5 | **Task**: #64
**Issue**: `dmn-decision-architect` agent says DMN-1 (RiskTier), DMN-2 (Pathway), DMN-6 (ChangeRisk) should be UNIQUE. Canonical rule file and actual DMN files all use FIRST. If the architect agent regenerates these tables, it would change semantic behavior.
**Fix**: Update dmn-decision-architect.md to match canonical hit policies.

### 1.13 10 Agents Reference Obsolete Schema
**Expert**: 5 | **Task**: #60
**Files**: architecture-reviewer.md, bpmn-commit-agent.md, critical-thinking.md, prd-generator.md, subagent-creator.md, regulatory-analysis.md, code-quality-reviewer.md, risk-assessment.md, test-coverage-analyzer.md, jira-manager.md
**Issue**: All reference 7-phase/7-lane/14-DMN schema. Canonical is 8-phase/9+1-lane/8-DMN.
**Fix**: Batch update all 10 files. Long-term: eliminate embedded values per fix 1.4.

---

## 2. HIGH Findings (28 issues — fix within next sprint)

| # | Task | Issue | Expert | File |
|---|------|-------|--------|------|
| 2.1 | #16 | No DMN structural validator — DMN files only get XXE scanning | 2 | scripts/validators/ |
| 2.2 | #18 | Security scanner doesn't short-circuit remaining validators | 2 | validate-bpmn.sh |
| 2.3 | #20 | bpmn-validator.js doesn't recurse into subprocesses | 2 | bpmn-validator.js |
| 2.4 | #21 | Gateway names violate mandatory "?" convention in master BPMN | 1 | sla-governance-master.bpmn |
| 2.5 | #22 | visual-overlap-checker.js regex may miss self-closing BPMNShape | 2 | visual-overlap-checker.js |
| 2.6 | #23 | Cross-cutting "event sub-processes" are NOT `triggeredByEvent="true"` | 1 | cross-cutting-event-subprocesses.bpmn |
| 2.7 | #25 | historyTimeToLive: validator says "P180D", all files use "180" (integer) | 1, 5 | bpmn-validator.md |
| 2.8 | #28 | Phase 3 model has 3 candidateGroups misalignments | 1 | phase-3 BPMN |
| 2.9 | #30 | Master model missing phase boundary pattern at every transition | 1 | sla-governance-master.bpmn |
| 2.10 | #40 | PR orchestrator BDD pipeline assumes nonexistent infrastructure | 4 | pr-orchestrator.md |
| 2.11 | #42/73 | Inter-pool gap: 2 agents say 30px, canon says 100px | 3, 5 | 2 agent files |
| 2.12 | #44 | Hit policy FIRST vs UNIQUE disagreement in canon | 3, 5 | governance-standards vs architect |
| 2.13 | #45 | architecture-reviewer has irrelevant tech patterns (Python/FastAPI) | 3 | architecture-reviewer.md |
| 2.14 | #46/67 | 64 lines of SLA-specific constants in bpmn-validator.js block reuse | 2, 7 | bpmn-validator.js |
| 2.15 | #48 | No reachability analysis for 3 terminal end events | 4 | — (missing capability) |
| 2.16 | #54 | No integration test for inter-phase connectivity | 4 | — (missing capability) |
| 2.17 | #62 | CDD evidence hook silently exits 0 when credentials missing | 6 | validate-cdd-evidence.sh |
| 2.18 | #65 | Pre-edit branch validation skipped in Claude hook context | 6 | pre-edit-validation.sh |
| 2.19 | #68 | bpmn-modeling-standards.md uses non-canonical DMN_ComplianceGate | 5 | bpmn-modeling-standards.md |
| 2.20 | #69 | No package-lock.json — non-deterministic validator installs | 6 | scripts/validators/ |
| 2.21 | #76 | historyTimeToLive format disagreement across docs | 5, 6 | bpmn-validator.md |
| 2.22 | #81 | CLAUDE.md references nonexistent `phase-1-needs-assessment` dir | 5, 6 | CLAUDE.md |
| 2.23 | #85 | No configuration schema — domain values scattered across files | 5 | — (missing artifact) |
| 2.24 | #91 | Swiss cheese validator pattern — aligned false negative holes | 4 (cross-cutting) | all validators |
| 2.25 | #63 | Rule files mix universal BPMN standards with SLA-specific governance | 7 | 3 rule files |
| 2.26 | #31 | flow-direction-checker loop detection is brittle (6 hardcoded labels) | 2 | flow-direction-checker.js |

---

## 3. MEDIUM Findings (22 issues — address in backlog)

| # | Task | Issue |
|---|------|-------|
| 3.1 | #24 | No merge gateway convention checks |
| 3.2 | #27 | No phase boundary pattern validator |
| 3.3 | #29 | Error messages lack file:line references |
| 3.4 | #33 | Redundant `isInterrupting="true"` on event subprocess start |
| 3.5 | #35 | Onboarding-only files use non-standard candidateGroups |
| 3.6 | #37 | Cross-cutting model missing parallel join gateway |
| 3.7 | #43 | DMN text annotation lists 14 old tables |
| 3.8 | #47/88 | governance-process-modeler contradicts conditionExpression rules |
| 3.9 | #49 | No agent validates DMN-to-BPMN binding |
| 3.10 | #51 | bpmn-specialist lacks team integration tools |
| 3.11 | #52/74 | element-checker ELEMENT_SUPPORT matrix has SLA branding |
| 3.12 | #57 | bpmn-tester and pr-orchestrator evidence paths disconnected |
| 3.13 | #58 | Pattern reusability assessment (informational) |
| 3.14 | #61 | Structural-only testing insufficient for financial services |
| 3.15 | #66 | DMN decision table completeness untested |
| 3.16 | #72 | Hook infrastructure hardcodes SLA/SLM Jira prefixes |
| 3.17 | #75 | Three PostToolUse Bash hooks fire on every command |
| 3.18 | #77 | full-sdlc.md uses SLA-XXX contradicting agents |
| 3.19 | #78 | Agent definitions 0% portable — embedded SLA domain knowledge |
| 3.20 | #79 | Cross-cutting event subprocesses are domain-specific |
| 3.21 | #80 | check-decision-log.sh uses fragile 2-minute mtime heuristic |
| 3.22 | #83 | PR orchestrator assumes Cucumber/Playwright |

---

## 4. LOW Findings (7 issues)

| # | Task | Issue |
|---|------|-------|
| 4.1 | #39 | Unpinned dependency versions in package.json |
| 4.2 | #41 | bpmn-validator.md claims element-checker accepts file path |
| 4.3 | #50 | No Camunda 8/Zeebe leakage (POSITIVE) |
| 4.4 | #56/70 | visual-overlap-checker.js + security-scanner.js 100% domain-independent |
| 4.5 | #71 | No requirements traceability matrix |
| 4.6 | #84 | CLAUDE_PROJECT_DIR env var undocumented |
| 4.7 | #87 | sdlc-orchestrator.md also has phantom pnpm commands |

---

## 5. Specification Consistency Matrix

| Spec Value | Rule Files | Validators | Agents | Actual Files | Status |
|-----------|-----------|-----------|--------|-------------|--------|
| candidateGroups (9+1) | CORRECT | CORRECT | 6 WRONG | CORRECT | **DRIFT** |
| DMN Table IDs (8) | CORRECT | CORRECT | 3 WRONG | CORRECT | **DRIFT** |
| DMN Hit Policies | CORRECT | Not checked | 1 WRONG | CORRECT | **DRIFT** |
| Phase Count (8) | CORRECT | N/A | 8 say "7" | CORRECT | **DRIFT** |
| Lane Count (9+1) | CORRECT | N/A | 5 say "7" | N/A | **DRIFT** |
| Inter-Pool Gap (100px) | CORRECT | N/A | 2 say 30px | Varies | **DRIFT** |
| Terminal End Events (3) | CORRECT | N/A | CORRECT | CORRECT | OK |
| Cross-Cutting SPs (5) | CORRECT | N/A | CORRECT | CORRECT | OK |
| historyTimeToLive (180 int) | CORRECT | N/A | 1 says "P180D" | CORRECT | **DRIFT** |
| Process ID | ESG-E2E-Master-v4.0 | N/A | CORRECT | Process_ESG_Master | **MISMATCH** |
| Jira Key Prefix | SLM-XXX (actual) | Accepts both | SLM-XXX | N/A | **INCONSISTENT** |

---

## 6. Validation Coverage Matrix

| Check Domain | security-scanner | bpmn-validator | visual-overlap | flow-direction | element-checker | Gap Level |
|---|---|---|---|---|---|---|
| XXE/injection | YES | - | - | - | - | Covered |
| XML structure | - | YES | - | - | YES | Covered |
| Element connectivity | - | TOP-LEVEL | - | - | - | **Partial** |
| candidateGroups | - | TOP-LEVEL | - | - | - | **Partial** |
| DMN references | - | TOP-LEVEL | - | - | - | **Partial** |
| Visual overlap | - | - | YES | - | - | Covered |
| Flow direction | - | - | - | YES | - | Covered |
| Subprocess recursion | - | **NO** | - | - | YES | **Gap** |
| Merge gateway rules | - | **NO** | - | - | - | **Gap** |
| Phase boundary pattern | - | **NO** | - | - | - | **Gap** |
| Gateway naming (?) | - | **NO** | - | - | - | **Gap** |
| Yes/No flow labels | - | **NO** | - | - | - | **Gap** |
| DMN schema/hit policy | - | **NO** | - | - | - | **Gap** |
| DMN-BPMN binding | - | **NO** | - | - | - | **Gap** |
| Regulatory annotations | - | **NO** | - | - | - | **Gap** |
| Terminal reachability | - | **NO** | - | - | - | **Gap** |

---

## 7. Single Source of Truth Architecture (Recommended)

### Current State (problematic)
```
Spec values embedded independently in:
├── .claude/rules/bpmn-governance-standards.md    (CANONICAL)
├── .claude/rules/bpmn-modeling-standards.md       (CANONICAL)
├── .claude/rules/bpmn-visual-clarity.md           (CANONICAL)
├── .claude/agents/bpmn-commit-agent.md            (STALE COPY)
├── .claude/agents/architecture-reviewer.md        (STALE COPY)
├── .claude/agents/critical-thinking.md            (STALE COPY)
├── .claude/agents/prd-generator.md                (STALE COPY)
├── .claude/agents/subagent-creator.md             (STALE COPY)
├── .claude/agents/regulatory-analysis.md          (STALE COPY)
├── .claude/agents/code-quality-reviewer.md        (STALE COPY)
├── .claude/agents/risk-assessment.md              (STALE COPY)
├── .claude/agents/test-coverage-analyzer.md       (STALE COPY)
├── .claude/agents/jira-manager.md                 (STALE COPY)
├── scripts/validators/bpmn-validator.js           (HARDCODED)
├── scripts/validators/element-checker.js          (HARDCODED)
└── CLAUDE.md                                      (PARTIAL)
```

### Target State (recommended)
```
.claude/specs/sla-governance-spec.yaml   ← SINGLE SOURCE OF TRUTH
    ↓ referenced by (never duplicated)
├── .claude/rules/bpmn-*.md              ← Human-readable elaboration
├── .claude/agents/*.md                  ← "See spec file for values"
├── scripts/validators/*.js              ← Load from config at runtime
└── CLAUDE.md                            ← Points to spec file
```

### Proposed spec file schema:
```yaml
# .claude/specs/sla-governance-spec.yaml
version: "4.0"
jiraProject: "SLM"

pools:
  - name: "Enterprise Governance"
    lanes:
      - { name: "Business", candidateGroups: "business-lane", line: 1 }
      - { name: "Governance", candidateGroups: "governance-lane", line: 2 }
      # ... all 8 lanes
  - name: "Vendor / Third Party"
    lanes:
      - { name: "Vendor Response", candidateGroups: "vendor-response", line: 1 }

phases:
  - { id: 1, name: "Initiation and Intake", subProcessId: "SP-Phase1-Intake", directory: "phase-1-intake", sla: "P2D" }
  # ... all 8 phases

dmn:
  - { id: "DMN_RiskTierClassification", name: "Risk Tier Classification", hitPolicy: "FIRST", phase: 2 }
  - { id: "DMN_PathwayRouting", name: "Pathway Routing", hitPolicy: "FIRST", phase: 1 }
  # ... all 8 tables

terminalEvents:
  - { id: "End_Retired", type: "graceful" }
  - { id: "End_Terminated", type: "emergency" }
  - { id: "End_Rejected", type: "governance" }

crossCutting:
  - { id: "SP-Cross-1", name: "SLA Monitoring & Breach Management" }
  # ... all 5

layout:
  interPoolGap: 100
  laneHeight: 125
  taskWidth: 100
  taskHeight: 80
  historyTimeToLive: 180
```

---

## 8. Portability Assessment

### Detailed Portability Classification Matrix

| Component | File | Domain-Independent % | SLA-Coupled Lines | Effort |
|-----------|------|---------------------|-------------------|--------|
| visual-overlap-checker.js | scripts/validators/ | **100%** | 0 | None |
| security-scanner.js | scripts/validators/ | **100%** | 0 | None |
| flow-direction-checker.js | scripts/validators/ | **100%** | 0 | None |
| element-checker.js | scripts/validators/ | **98%** | 3 (branding) | <1 hour |
| bpmn-validator.js | scripts/validators/ | **60%** | 64 (constants) | 1-2 days |
| validate-bpmn.sh | scripts/validators/ | **85%** | 3 (paths) | Low |
| bpmn-visual-clarity.md | .claude/rules/ | **80%** | ~40 (lane tables) | Medium |
| bpmn-modeling-standards.md | .claude/rules/ | **60%** | ~80 (marked SLA-SPECIFIC) | Medium |
| bpmn-governance-standards.md | .claude/rules/ | **0%** | Entire file | N/A (IS the config) |
| Hook scripts (7 files) | .claude/hooks/ | **70%** → **40% effective** | ~20 (Jira, URLs) | Low |
| Cross-cutting subprocesses | processes/cross-cutting/ | **30%** | Lane/DMN refs | High |
| settings.json | .claude/ | **95%** | 0 | None |

**Note**: Hook portability was downgraded from 70% to 40% effective because hooks invoke the PR orchestrator, which references 5 phantom agents and a non-existent build pipeline (Expert 6 cross-reference).

### Tier 1: Ready to Extract (zero SLA coupling)
| Component | File | Notes |
|-----------|------|-------|
| Security Scanner | security-scanner.js | Pure BPMN/DMN XXE/injection checks |
| Visual Overlap Checker | visual-overlap-checker.js | Pure BPMN DI geometry checks |
| Flow Direction Checker | flow-direction-checker.js | Pure BPMN sequence flow direction |

**Caveat** (Expert 7 cross-reference with Expert 4): "Ready for extraction" assumes functional correctness that has not been demonstrated through tests. The code is structurally portable but behaviorally unverified. A test foundation (Wave 4) is a prerequisite for responsible extraction.

### Tier 2: Needs Config Extraction (< 1 day effort)
| Component | File | SLA-Coupled Lines | Fix |
|-----------|------|-------------------|-----|
| BPMN Validator | bpmn-validator.js | 64 lines (candidateGroups, DMN IDs) | Move to governance-config.json |
| Orchestrator Shell | validate-bpmn.sh | Directory structure assumptions | Parameterize paths |
| Element Checker | element-checker.js | Tech-stack notes, branding | Config extraction |

### Tier 3: Domain-Specific (intentional coupling)
| Component | Notes |
|-----------|-------|
| Agent definitions | Embed SLA governance domain knowledge by design (0% portable) |
| Rule files (governance-standards) | 8-phase lifecycle is SLA-specific |
| Cross-cutting sub-processes | SLA monitoring, vulnerability remediation patterns |
| DMN decision tables | SLA governance decision logic |

### Universally Reusable BPMN Patterns
1. DMN-driven gateway routing
2. SLA timer boundary events
3. Phase boundary transition (completion → quality gate → approval → transition)
4. Error boundary with retry loop
5. Cross-pool message flow
6. Multi-instance parallel review

### Proposed Starter Kit Architecture
```
bpmn-governance-kit/
├── config/
│   ├── bpmn-governance.config.json     # Domain configuration
│   └── schema/
│       └── bpmn-governance.schema.json # JSON Schema for validation
├── validators/                          # 100% portable
│   ├── visual-overlap-checker.js
│   ├── security-scanner.js
│   ├── flow-direction-checker.js
│   ├── bpmn-validator.js               # Reads config for domain checks
│   ├── element-checker.js
│   ├── validate-bpmn.sh                # Reads config for paths
│   └── package.json
├── rules/
│   ├── universal/                       # BPMN best practices (any project)
│   │   ├── bpmn-element-standards.md
│   │   ├── bpmn-visual-layout.md
│   │   └── bpmn-security.md
│   └── domain/                          # Templates for org-specific config
│       ├── governance-lanes.md.template
│       ├── governance-phases.md.template
│       └── regulatory-framework.md.template
├── hooks/                               # Parameterized workflow hooks
├── templates/                           # Blank governance BPMN templates
├── examples/                            # SLA-specific as reference implementation
└── README.md
```

### Proposed Configuration Schema (`bpmn-governance.config.json`)
```json
{
  "project": {
    "name": "Enterprise Software Governance",
    "jiraPrefix": "SLM",
    "branchPattern": "^feature/SLM-[0-9]+-.*$"
  },
  "engine": {
    "platform": "camunda7",
    "historyTimeToLive": 180
  },
  "governance": {
    "pools": [
      {
        "id": "Enterprise Governance",
        "lanes": [
          {"name": "Business", "candidateGroup": "business-lane"},
          {"name": "Governance", "candidateGroup": "governance-lane"},
          {"name": "Contracting", "candidateGroup": "contracting-lane"},
          {"name": "Technical Assessment", "candidateGroup": "technical-assessment"},
          {"name": "AI Review", "candidateGroup": "ai-review"},
          {"name": "Compliance", "candidateGroup": "compliance-lane"},
          {"name": "Oversight", "candidateGroup": "oversight-lane"},
          {"name": "Automation", "candidateGroup": "automation-lane"}
        ]
      },
      {
        "id": "Vendor / Third Party",
        "lanes": [
          {"name": "Vendor Response", "candidateGroup": "vendor-response"}
        ]
      }
    ],
    "dmnTables": [
      {"id": "DMN_RiskTierClassification", "hitPolicy": "FIRST", "phase": 2},
      {"id": "DMN_PathwayRouting", "hitPolicy": "FIRST", "phase": 1},
      {"id": "DMN_GovernanceReviewRouting", "hitPolicy": "UNIQUE", "phase": 4},
      {"id": "DMN_AutomationTierAssignment", "hitPolicy": "UNIQUE"},
      {"id": "DMN_AgentConfidenceEscalation", "hitPolicy": "FIRST"},
      {"id": "DMN_ChangeRiskScoring", "hitPolicy": "FIRST", "phase": 8},
      {"id": "DMN_VulnerabilityRemediationRouting", "hitPolicy": "UNIQUE"},
      {"id": "DMN_MonitoringCadenceAssignment", "hitPolicy": "UNIQUE", "phase": 8}
    ],
    "terminalEndEvents": ["End_Retired", "End_Terminated", "End_Rejected"]
  },
  "validation": {
    "allowScriptTasks": false,
    "overlapThresholdPercent": 5,
    "loopFlowLabels": ["retry", "revise", "negotiate", "refine", "loop", "rework"]
  },
  "visual": {
    "laneHeight": 125,
    "interPoolGap": 100,
    "taskWidth": 100,
    "taskHeight": 80
  }
}
```

This config schema resolves the DRY root cause (Expert 3/5), eliminates schema drift (Expert 3), and enables portability (Expert 7) — the single highest-leverage structural change identified by the audit.

---

## 9. Remediation Backlog (Priority Order)

### Wave 1: Immediate (< 1 day, blocks further work)
| # | Action | Files | Effort |
|---|--------|-------|--------|
| W1.1 | Fix event subprocess outgoing flow in master BPMN | 1 file | 15 min |
| W1.2 | Standardize on SLM-XXX naming | 4 files | 15 min |
| W1.3 | Fix DMN hit policies in dmn-decision-architect | 1 file | 10 min |
| W1.4 | Fix historyTimeToLive docs (remove "P180D") | 1 file | 5 min |
| W1.5 | Fix CLAUDE.md directory reference | 1 file | 5 min |
| W1.6 | Fix element-checker invocation (file not dir) | 1 file | 10 min |
| W1.7 | Remove scriptTask from SUPPORTED_ELEMENTS | 2 files | 10 min |
| W1.8 | Commit package-lock.json | 1 file | 1 min |

### Wave 2: Schema Sync (1-2 days, eliminates drift)
| # | Action | Files | Effort |
|---|--------|-------|--------|
| W2.1 | Create sla-governance-spec.yaml | 1 new file | 2 hours |
| W2.2 | Update 10 agent files to reference spec | 10 files | 4 hours |
| W2.3 | Extract hardcoded constants from validators | 2 files | 2 hours |
| W2.4 | Fix PR orchestrator (remove phantom phases/agents) | 1 file | 1 hour |
| W2.5 | Fix architecture-reviewer (remove irrelevant patterns) | 1 file | 1 hour |
| W2.6 | Fix non-canonical DMN_ComplianceGate in standards | 1 file | 10 min |

### Wave 3: Validation Hardening (3-5 days)
| # | Action | Files | Effort |
|---|--------|-------|--------|
| W3.1 | Add subprocess recursion to bpmn-validator | 1 file | 4 hours |
| W3.2 | Create DMN structural validator | 1 new file | 1 day |
| W3.3 | Add merge gateway convention checks | 1 file | 2 hours |
| W3.4 | Add phase boundary pattern validator | 1 new file | 4 hours |
| W3.5 | Add gateway naming convention check | 1 file | 1 hour |
| W3.6 | Add security scanner short-circuit | 1 file | 30 min |
| W3.7 | Add file:line references to error messages | 4 files | 4 hours |
| W3.8 | Fix visual-overlap-checker regex | 1 file | 1 hour |

### Wave 4: Testing Foundation (1-2 weeks)
| # | Action | Files | Effort |
|---|--------|-------|--------|
| W4.1 | Create initial BDD structural tests for master model | New | 2 days |
| W4.2 | Create DMN-to-BPMN binding validator | New | 1 day |
| W4.3 | Create terminal state reachability checker | New | 1 day |
| W4.4 | Create inter-phase connectivity test | New | 1 day |
| W4.5 | Create evidence directory structure | New | 2 hours |
| W4.6 | Align bpmn-tester and pr-orchestrator evidence paths | 2 files | 2 hours |

### Wave 5: DX & Portability (ongoing)
| # | Action | Files | Effort |
|---|--------|-------|--------|
| W5.1 | Add warnings to silent-exit hooks | 2 files | 1 hour |
| W5.2 | Merge duplicate PR hooks | 2 files | 1 hour |
| W5.3 | Document environment dependencies | CLAUDE.md | 1 hour |
| W5.4 | Extract portable validators into standalone package | 3 files | 1 day |
| W5.5 | Split rule files (universal vs SLA-specific) | 3 files | 4 hours |
| W5.6 | Create governance-config.json for validator parameterization | 1 new file | 2 hours |

---

## 10. Cross-Expert Synthesis: Systemic Patterns

### Pattern A: Documentation-as-Implementation Bias
Multiple experts independently identified the same anti-pattern: agent definitions describe capabilities as if they exist when they don't. The PR orchestrator's 9-agent review team, the BDD test pipeline, and the CDD evidence system all describe sophisticated infrastructure that has never been implemented. This creates false confidence in artifact quality.

### Pattern B: Schema Migration Incompleteness
The v4.0 rebuild (7-phase → 8-phase, 7-lane → 9+1-lane, 14-DMN → 8-DMN) updated the canonical sources (rule files, validators, actual BPMN/DMN) but not the downstream consumers (agent definitions). The DRY violation root cause means this will recur on every future schema change unless addressed structurally.

### Pattern C: Swiss Cheese Validation
Each validator has coverage holes, and the holes align. An artifact can pass the entire pipeline while containing: incorrect DMN logic, broken variable bindings, unreachable terminal states, missing regulatory annotations, wrong candidateGroups inside subprocesses, and even scriptTask elements that one validator calls CRITICAL but another calls "supported."

### Pattern D: Naming Convention Entropy
The SLA/SLM naming chaos is a symptom of organic growth without a naming authority. The project name is "SLA" but the Jira project key is "SLM". Different files picked different conventions at different times. Hooks silently accept the wrong format or silently skip validation.

### Pattern E: Cross-Expert Convergence on Config Schema (CRITICAL)
Three independent analyses (Expert 3 agent architecture, Expert 5 rule consistency, Expert 7 portability) converged on the same root cause from different angles:
- **Expert 3**: Agents embed schema copies → drift after rebuild → 2 agents have completely wrong validation rules
- **Expert 5**: 12 specification contradictions across 15+ files → no single source of truth
- **Expert 7**: Domain values scattered across 7+ files → can't port without forking everything

The proposed `bpmn-governance.config.json` resolves ALL three simultaneously. This three-expert convergence provides L1 (Validated) confidence that the centralized config schema is the single highest-leverage structural change in the audit. The recommended remediation sequence:
1. **Test foundation** — verify current behavior before changing anything
2. **Centralized config schema** — resolves drift AND portability barriers
3. **Refactor agents** to read from config (fixes 10 obsolete agent schemas)
4. **Refactor validators/hooks** to read from config (fixes hardcoded constants)

---

## Appendix: Expert Attribution

| Expert | Scope | Findings | Key Contribution |
|--------|-------|----------|------------------|
| 1 - Spec Compliance | BPMN 2.0 / Camunda 7 | 11 | Event subprocess violation, pattern reusability |
| 2 - Validation Pipeline | 5 validators + orchestrator | 14 | Coverage matrix, false negative analysis |
| 3 - Agent Architecture | 6 agent definitions | 9 | Schema drift inventory, DRY root cause |
| 4 - Testing Methodology | Test coverage gaps | 9 | Zero-test-artifact finding, Swiss cheese pattern |
| 5 - Rule Consistency | Cross-reference all spec values | 8 | Consistency matrix, SSOT architecture |
| 6 - Developer Experience | Hooks, DX, naming | 12 | Fresh checkout map, phantom commands list |
| 7 - Portability | Reusability assessment | 4 | Tier classification, config schema proposal |

---

*Generated by 7-expert parallel critical evaluation | 2026-03-05*
