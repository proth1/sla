---
description: Run a comprehensive read-only audit of all BPMN, DMN, infrastructure, and script artifacts
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, Agent, TaskCreate, TaskUpdate, TaskList, TaskGet, TeamCreate, TeamDelete, SendMessage, AskUserQuestion
---

# Code Audit — SLA Governance Repository

Run a comprehensive, read-only audit of all BPMN/DMN process models, infrastructure code, and validator scripts. Spawns 7 parallel agents across 3 squads. Reports findings only — does NOT fix anything.

## Input

```
$ARGUMENTS
```

Flags:
- `--squad=N` — Run only squad N (1, 2, or 3)
- `--severity=LEVEL` — Only report findings at LEVEL or above (CRITICAL, HIGH, MEDIUM, LOW)
- `--skip-validators` — Skip running validate-bpmn.sh (use cached results)

## Rules (MANDATORY)

- **Do NOT create GitHub issues or Jira tickets**
- **Do NOT fix anything or modify source files**
- **Do NOT commit changes**
- **Report findings ONLY**
- **Save report to `docs/audit-report-latest.md`**
- **Save individual findings to `docs/audit-findings/`**

## Execution

### Phase 1: Setup

1. Create the output directory:
   ```bash
   mkdir -p docs/audit-findings
   ```

2. Create the `code-audit` team:
   ```
   TeamCreate(team_name="code-audit", description="SLA Governance Code Audit")
   ```

3. Create 8 tasks (7 agent tasks + 1 compilation task):

   **Squad 1 — BPMN/DMN Integrity:**

   | Task | Subject | Description |
   |------|---------|-------------|
   | T1 | BPMN Validator Pipeline | Run `bash scripts/validators/validate-bpmn.sh` on all BPMN and DMN files. Parse results. Report pass/fail per file with error details. Save to `docs/audit-findings/S1-bpmn-validator.md` |
   | T2 | Governance Compliance Audit | Audit all BPMN files for: 9+1 lane assignments (correct candidateGroups), 8 DMN table references (correct decisionRef IDs), phase boundary patterns (completion gateway -> quality gate -> approval -> transition), regulatory text annotations, 3 terminal end events (End_Retired, End_Terminated, End_Rejected), 5 cross-cutting sub-processes, Camunda attributes (historyTimeToLive, decisionRefBinding). Save to `docs/audit-findings/S1-governance-compliance.md` |
   | T3 | Visual Clarity Audit | Audit all BPMN files for: left-to-right flow direction (no backward sequence flows), cross-lane routing (vertical segments, no diagonals), element spacing (30-65px gaps), timer label positioning (to the RIGHT), bypass flow routing (around tasks, not through), loop patterns (above main flow), element dimensions (tasks 100x80, gateways 50x50, events 36x36), flow labels not overlapping task text. Save to `docs/audit-findings/S1-visual-clarity.md` |

   **Squad 2 — Security:**

   | Task | Subject | Description |
   |------|---------|-------------|
   | T4 | BPMN/DMN Security Scan | Deep security scan of all BPMN and DMN XML files for: XXE attacks (DOCTYPE, ENTITY declarations), scriptTask elements (RCE risk), camunda:class attributes (Java class loading), JUEL injection (camunda:expression with Runtime/exec), external script references, CDATA blocks with executable content, unsafe deserialization patterns, input/output variable injection. Goes beyond the existing JS scanner. Save to `docs/audit-findings/S2-bpmn-security.md` |
   | T5 | Infrastructure Security Review | Review Cloudflare worker auth code (`infrastructure/cloudflare-workers/sla-presentation-auth/`): session handling (SLA_SESSION HMAC, DS/DSR cookies), CORS configuration, proxy secret validation in `_worker.js`, secrets management (no hardcoded secrets), wrangler.toml configuration, OTP flow security, JWT validation, allowed email/domain enforcement. Also check `docs/presentations/_worker.js`. Save to `docs/audit-findings/S2-infra-security.md` |

   **Squad 3 — Quality & Configuration:**

   | Task | Subject | Description |
   |------|---------|-------------|
   | T6 | Script Quality Review | Audit all JS validators in `scripts/validators/` and bash scripts in `.claude/hooks/`: error handling patterns, edge cases, input validation, dependency versions (package.json), code quality, potential bugs, missing error paths, inconsistent exit codes. Save to `docs/audit-findings/S3-script-quality.md` |
   | T7 | Configuration Integrity Check | Check: package.json versions and dependencies, .gitignore coverage (no secrets committed), wrangler.toml settings, hook configs in `.claude/settings.json`, no committed secrets/tokens/passwords (scan all files), no hardcoded localhost references, no console.log in production code, CLAUDE.md consistency with actual repo structure. Save to `docs/audit-findings/S3-config-integrity.md` |

   **Compilation:**

   | Task | Subject | Description |
   |------|---------|-------------|
   | T8 | Compile Audit Report | Blocked by T1-T7. Read all 7 findings files from `docs/audit-findings/`. Compile into `docs/audit-report-latest.md` with executive summary, severity counts, and top 5 recommendations. |

   Set T8 as blocked by T1 through T7.

### Phase 2: Spawn Agents

Spawn all 7 agents in parallel. Each agent joins the `code-audit` team.

**Squad 1 agents:**

```
Agent(
  name="bpmn-validator",
  subagent_type="general-purpose",
  model="sonnet",
  team_name="code-audit",
  prompt="You are agent S1-A1 (BPMN Validator) on the code-audit team.

YOUR TASK: Run the BPMN/DMN validation pipeline and report findings.

STEPS:
1. Claim your task from TaskList
2. Run: bash scripts/validators/validate-bpmn.sh
3. If that fails, run individual validators on each BPMN/DMN file:
   - node scripts/validators/bpmn-validator.js <file>
   - node scripts/validators/visual-overlap-checker.js <file>
   - node scripts/validators/element-checker.js <file>
4. Parse all output — categorize as CRITICAL/HIGH/MEDIUM/LOW
5. Write findings to docs/audit-findings/S1-bpmn-validator.md

OUTPUT FORMAT for each finding:
### [SEVERITY] VALIDATION: Title
**File**: path/to/file:line
**Agent**: S1-A1 (BPMN Validator)
**Validator**: which validator caught it
**Evidence**: error message or relevant XML
**Description**: What's wrong
**Risk**: Impact if unfixed
**Recommendation**: How to fix

End with a summary: total files scanned, passed, failed, findings by severity.

RULES: Do NOT fix anything. Report only. Mark your task completed when done."
)
```

```
Agent(
  name="governance-compliance",
  subagent_type="general-purpose",
  model="sonnet",
  team_name="code-audit",
  prompt="You are agent S1-A2 (Governance Compliance) on the code-audit team.

YOUR TASK: Audit all BPMN files for governance standard compliance.

Read all .claude/rules/bpmn-governance-standards.md and .claude/rules/bpmn-modeling-standards.md first.

CHECK EACH BPMN FILE FOR:
1. Lane assignments — all tasks use one of the 9+1 valid candidateGroups: business-lane, governance-lane, contracting-lane, technical-assessment, ai-review, compliance-lane, oversight-lane, automation-lane, vendor-response
2. DMN references — all businessRuleTask decisionRef values are one of: DMN_RiskTierClassification, DMN_PathwayRouting, DMN_GovernanceReviewRouting, DMN_AutomationTierAssignment, DMN_AgentConfidenceEscalation, DMN_ChangeRiskScoring, DMN_VulnerabilityRemediationRouting, DMN_MonitoringCadenceAssignment
3. Phase boundary pattern — completion gateway -> quality gate -> approval task -> phase transition event
4. Regulatory annotations — OCC 2023-17, SR 11-7, SOX, GDPR/CCPA, EU AI Act, DORA as applicable
5. Terminal end events — End_Retired, End_Terminated, End_Rejected must exist
6. Cross-cutting sub-processes — SP-Cross-1 through SP-Cross-5
7. Camunda attributes — historyTimeToLive on process, decisionRefBinding='latest' on DMN refs
8. Timer boundary events — all must have outgoing flows, SLA timers use cancelActivity='false'
9. Merge gateways — one unconditional outgoing, no name attribute
10. DMN-first — no embedded business logic in conditionExpression (only DMN output variable reads)

Write findings to docs/audit-findings/S1-governance-compliance.md using the standard format.

RULES: Do NOT fix anything. Report only. Mark your task completed when done."
)
```

```
Agent(
  name="visual-clarity",
  subagent_type="general-purpose",
  model="sonnet",
  team_name="code-audit",
  prompt="You are agent S1-A3 (Visual Clarity) on the code-audit team.

YOUR TASK: Audit all BPMN files for visual layout compliance.

Read .claude/rules/bpmn-visual-clarity.md first for the full standard.

CHECK EACH BPMN FILE FOR:
1. Left-to-right flow — every sequence flow's last waypoint X >= first waypoint X (except explicit loops)
2. Cross-lane routing — vertical segments between lanes, no diagonal flows crossing 2+ lanes
3. Element spacing — 30-65px gaps between elements
4. Timer label positioning — labels to the RIGHT of boundary events (x+44, y+4)
5. Bypass flow routing — default/skip flows route ABOVE tasks, not through them
6. Loop patterns — revision/retry loops go ABOVE main flow, target merge gateways
7. Element dimensions — tasks 100x80, gateways 50x50, events 36x36
8. Flow labels — label Y <= target_task_y - 18 (no overlap with task text)
9. Tasks in correct lanes — Y-position falls within assigned lane boundaries
10. Parallel branch alignment — equal X for split tasks in different lanes

Parse the bpmndi:BPMNShape and bpmndi:BPMNEdge elements to check coordinates.

Write findings to docs/audit-findings/S1-visual-clarity.md using the standard format.

RULES: Do NOT fix anything. Report only. Mark your task completed when done."
)
```

**Squad 2 agents:**

```
Agent(
  name="bpmn-security",
  subagent_type="security-reviewer",
  model="opus",
  team_name="code-audit",
  prompt="You are agent S2-A1 (BPMN Security) on the code-audit team.

YOUR TASK: Deep security scan of all BPMN and DMN XML files.

SCAN FOR:
1. XXE attacks — <!DOCTYPE, <!ENTITY, SYSTEM, PUBLIC declarations
2. scriptTask elements — Remote Code Execution risk (CRITICAL)
3. camunda:class attributes — Java class loading (CRITICAL)
4. JUEL injection — camunda:expression containing Runtime, exec, ProcessBuilder, getClass
5. External script references — camunda:resource pointing to external files
6. CDATA blocks — executable content hidden in CDATA sections
7. Unsafe deserialization — camunda:inputOutput with serialized Java objects
8. Input/output variable injection — process variables used in unsafe contexts
9. Signal/message injection — signal/message names that could be spoofed
10. Unbounded loops — loops without termination conditions (DoS risk)
11. Missing access controls — tasks without candidateGroups (unauthorized access)
12. External entity references in DMN — FEEL expressions with system calls

Scan ALL files in framework/processes/, framework/decisions/dmn/, and customers/fs-onboarding/processes/ directories.

Write findings to docs/audit-findings/S2-bpmn-security.md using the standard format with CRITICAL/HIGH/MEDIUM/LOW severity.

RULES: Do NOT fix anything. Report only. Mark your task completed when done."
)
```

```
Agent(
  name="infra-security",
  subagent_type="security-reviewer",
  model="opus",
  team_name="code-audit",
  prompt="You are agent S2-A2 (Infrastructure Security) on the code-audit team.

YOUR TASK: Security review of all infrastructure and deployment code.

REVIEW THESE FILES:
- infrastructure/cloudflare-workers/sla-presentation-auth/src/index.ts
- infrastructure/cloudflare-workers/sla-presentation-auth/wrangler.toml
- docs/presentations/_worker.js
- scripts/validators/*.js
- .claude/hooks/*.sh
- .claude/settings.json

CHECK FOR:
1. Session handling — SLA_SESSION HMAC signing, cookie attributes (Secure, HttpOnly, SameSite)
2. CORS configuration — overly permissive origins
3. Proxy secret validation — _worker.js properly validates X-SLA-Auth-Proxy header
4. Secrets management — no hardcoded API keys, tokens, passwords in source
5. OTP flow — rate limiting, timing attacks, brute force protection
6. JWT validation — proper algorithm verification, expiry checks, issuer validation
7. Email/domain allowlist — enforcement cannot be bypassed
8. Input sanitization — XSS in login page HTML, header injection
9. Cookie security — proper clearing on logout, no comma-joined Set-Cookie
10. Error handling — no sensitive info in error responses
11. Wrangler config — no secrets in wrangler.toml, proper environment separation
12. Hook scripts — no command injection in shell scripts

Write findings to docs/audit-findings/S2-infra-security.md using the standard format with CRITICAL/HIGH/MEDIUM/LOW severity.

RULES: Do NOT fix anything. Report only. Mark your task completed when done."
)
```

**Squad 3 agents:**

```
Agent(
  name="script-quality",
  subagent_type="code-quality-reviewer",
  model="sonnet",
  team_name="code-audit",
  prompt="You are agent S3-A1 (Script Quality) on the code-audit team.

YOUR TASK: Code quality review of all JavaScript validators and bash scripts.

REVIEW THESE DIRECTORIES:
- scripts/validators/*.js
- scripts/validators/*.sh
- .claude/hooks/*.sh

CHECK FOR:
1. Error handling — uncaught exceptions, missing try/catch, unhandled promise rejections
2. Edge cases — empty files, malformed XML, missing files, permission errors
3. Input validation — unsanitized file paths, command injection in bash scripts
4. Exit codes — consistent use (0=success, non-zero=failure)
5. Dependencies — outdated packages in package.json, known vulnerabilities
6. Code quality — unused variables, dead code, inconsistent naming
7. Bash best practices — quoting variables, set -e/set -u, shellcheck issues
8. Node.js best practices — proper async/await, stream handling, memory leaks
9. Logging — appropriate log levels, no sensitive data in logs
10. Testing — missing test coverage for validators

Write findings to docs/audit-findings/S3-script-quality.md using the standard format.

RULES: Do NOT fix anything. Report only. Mark your task completed when done."
)
```

```
Agent(
  name="config-integrity",
  subagent_type="general-purpose",
  model="haiku",
  team_name="code-audit",
  prompt="You are agent S3-A2 (Config Integrity) on the code-audit team.

YOUR TASK: Verify configuration file integrity across the repository.

CHECK:
1. package.json — valid JSON, dependency versions, no wildcards, scripts defined
2. .gitignore — covers node_modules, .env, *.log, dist/, .wrangler/, credentials
3. Secrets scan — grep all files for patterns: password, secret, token, api_key, private_key (case insensitive). Report any hardcoded values.
4. wrangler.toml — account_id present, no secrets in config, proper route configuration
5. .claude/settings.json — hook configurations valid, file paths exist
6. CLAUDE.md consistency — file paths mentioned in CLAUDE.md actually exist in the repo
7. No localhost references — grep for localhost, 127.0.0.1, 0.0.0.0 in non-test files
8. No debug logging — grep for console.log in production JS files (validators are OK)
9. File permissions — no world-writable files, no executable scripts missing shebang
10. Repository hygiene — no large binary files, no duplicate files, no orphaned configs

Write findings to docs/audit-findings/S3-config-integrity.md using the standard format.

RULES: Do NOT fix anything. Report only. Mark your task completed when done."
)
```

### Phase 3: Monitor & Compile

1. Wait for all 7 agents to complete their tasks
2. When T1-T7 are all completed, claim T8 and compile the report

**Compilation steps:**

1. Read all 7 findings files from `docs/audit-findings/`
2. Count findings by severity across all files
3. Count findings by squad
4. Identify the top 5 highest-impact recommendations
5. Write the compiled report to `docs/audit-report-latest.md`

**Report format:**

```markdown
# SLA Governance Code Audit Report — YYYY-MM-DD

## Executive Summary

| Metric | Value |
|--------|-------|
| Files Scanned | X |
| Total Findings | X |
| CRITICAL | X |
| HIGH | X |
| MEDIUM | X |
| LOW | X |

### Findings by Squad

| Squad | Findings | CRITICAL | HIGH | MEDIUM | LOW |
|-------|----------|----------|------|--------|-----|
| S1: BPMN/DMN Integrity | X | X | X | X | X |
| S2: Security | X | X | X | X | X |
| S3: Quality & Config | X | X | X | X | X |

## CRITICAL Findings

[All CRITICAL findings from all agents, sorted by squad]

## HIGH Findings

[All HIGH findings]

## MEDIUM Findings

[All MEDIUM findings]

## LOW Findings

[All LOW findings]

## Validator Pipeline Results

| Validator | Files Passed | Files Failed |
|-----------|-------------|--------------|
| bpmn-validator.js | X | X |
| visual-overlap-checker.js | X | X |
| element-checker.js | X | X |
| security-scanner.js | X | X |

## Top 5 Recommendations

1. [Highest impact action]
2. ...
3. ...
4. ...
5. [Fifth highest impact action]

---
*Generated by SLA Code Audit — 7 agents, 3 squads*
*Report: docs/audit-report-latest.md*
*Individual findings: docs/audit-findings/*
```

### Phase 4: Cleanup

1. Send shutdown requests to all 7 agents
2. Delete the `code-audit` team: `TeamDelete()`
3. Report final summary to the user with finding counts and report location

## Agent Summary

| ID | Agent | Squad | Type | Model | Output File |
|----|-------|-------|------|-------|-------------|
| S1-A1 | bpmn-validator | Integrity | general-purpose | sonnet | S1-bpmn-validator.md |
| S1-A2 | governance-compliance | Integrity | general-purpose | sonnet | S1-governance-compliance.md |
| S1-A3 | visual-clarity | Integrity | general-purpose | sonnet | S1-visual-clarity.md |
| S2-A1 | bpmn-security | Security | security-reviewer | opus | S2-bpmn-security.md |
| S2-A2 | infra-security | Security | security-reviewer | opus | S2-infra-security.md |
| S3-A1 | script-quality | Quality | code-quality-reviewer | sonnet | S3-script-quality.md |
| S3-A2 | config-integrity | Config | general-purpose | haiku | S3-config-integrity.md |

## Cost Estimate

| Component | Model | Est. Tokens | Est. Cost |
|-----------|-------|-------------|-----------|
| 3x sonnet agents | sonnet | ~50K each | ~$0.75 |
| 2x opus agents | opus | ~30K each | ~$2.25 |
| 1x sonnet agent | sonnet | ~40K | ~$0.30 |
| 1x haiku agent | haiku | ~20K | ~$0.02 |
| Compilation | parent | ~30K | ~$0.50 |
| **Total** | | | **~$3.80** |

---
**Command Version**: 1.0.0
**Created**: 2026-03-12
**Platform**: SLA - Enterprise Software Governance
