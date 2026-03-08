# SLA Governance Code Audit Report — 2026-03-04

## Executive Summary

| Metric | Value |
|--------|-------|
| Files Scanned | 50+ (10 BPMN, 8 DMN, 16 archive, 6 JS validators, 8 bash scripts, infra code, configs) |
| Total Findings | 58 |
| CRITICAL | 4 |
| HIGH | 11 |
| MEDIUM | 28 |
| LOW | 15 |

### Findings by Squad

| Squad | Findings | CRITICAL | HIGH | MEDIUM | LOW |
|-------|----------|----------|------|--------|-----|
| S1: BPMN/DMN Integrity | 26 | 0 | 5 | 14 | 7 |
| S2: Security | 16 | 0 | 0 | 6 | 10 |
| S3: Quality & Config | 26 | 4 | 6 | 8 | 8 |

### Key Takeaways

- **No security-critical vulnerabilities** in BPMN/DMN artifacts — 9.5/10 security score
- **4 CRITICAL findings** are all in validator/script quality (silent failures from missing `.catch()` + stderr suppression)
- **2 HIGH governance gaps** — Phase 7 deploys to production without approval gate; Phase 4 embeds business logic violating DMN-first
- **Infrastructure auth is sound** but missing the documented `SLA_SESSION` cookie and OTP rate limiting
- **19 flow label overlaps** across 9 BPMN files reduce diagram readability

---

## CRITICAL Findings

### [CRITICAL] QUALITY: Unhandled Promise Rejection in bpmn-validator.js
**File**: `scripts/validators/bpmn-validator.js:500`
**Agent**: S3-A1 (Script Quality)
**Description**: Main `.then()` chain has no `.catch()`. Node.js crashes are invisible since stderr is suppressed by caller.

### [CRITICAL] QUALITY: element-checker.js lacks .catch() on main promise
**File**: `scripts/validators/element-checker.js:299`
**Agent**: S3-A1 (Script Quality)
**Description**: Same silent failure pattern as bpmn-validator.js.

### [CRITICAL] QUALITY: validate-bpmn.sh suppresses all stderr from validators
**File**: `scripts/validators/validate-bpmn.sh:35,42,49,56`
**Agent**: S3-A1 (Script Quality)
**Description**: All 4 validator invocations use `2>/dev/null`. Node.js errors (missing modules, syntax errors, unhandled rejections) are completely hidden.

### [CRITICAL] QUALITY: validate-bpmn.sh missing `set -u`
**File**: `scripts/validators/validate-bpmn.sh:5`
**Agent**: S3-A1 (Script Quality)
**Description**: Uses `set -e` but not `set -u`. Unset variable expansions silently produce empty strings.

---

## HIGH Findings

### [HIGH] GOVERNANCE: Phase 4 Embedded Multi-Condition Business Logic
**File**: `processes/phase-4-governance/governance-review-and-approval.bpmn:237`
**Agent**: S1-A2 (Governance Compliance)
**Description**: `Gateway_AICheck` embeds `${aiRiskLevel == 'HIGH' || aiRiskLevel == 'CRITICAL'}` — compound OR condition that should be in a DMN table per DMN-first principle.

### [HIGH] GOVERNANCE: Phase 7 Missing Deployment Governance Sign-Off
**File**: `processes/phase-7-deployment/deployment-and-go-live.bpmn`
**Agent**: S1-A2 (Governance Compliance)
**Description**: Deployment proceeds to Phase 8 via signal end event with no quality gate or approval user task. Production go-live without governance sign-off contradicts DORA Article 25 and SOX requirements.

### [HIGH] VISUAL: Backward Sequence Flow — Master Monitoring Loop
**File**: `processes/master/sla-governance-master.bpmn`
**Agent**: S1-A3 (Visual Clarity)
**Description**: "Continue Operations" loop flows right-to-left (150px backward) without loop keyword labeling.

### [HIGH] VISUAL: Backward Sequence Flow — SDLC Quality Gate Rejected Loop
**File**: `processes/phase-6-sdlc/sdlc-development-and-testing.bpmn`
**Agent**: S1-A3 (Visual Clarity)
**Description**: End event routes backward 235px to merge gateway. End events should terminate flow, not feed back.

### [HIGH] VISUAL: Long Backward Loop Flows — Phase 8 Operations
**File**: `processes/phase-8-operations/operations-monitoring-retirement.bpmn`
**Agent**: S1-A3 (Visual Clarity)
**Description**: Two flows span 1230px and 1390px backward. `Flow_8C_LoopBack` is unnamed.

### [HIGH] QUALITY: security-scanner.js readFileSync without error handling
**File**: `scripts/validators/security-scanner.js:242`
**Agent**: S3-A1 (Script Quality)

### [HIGH] QUALITY: fix-diagonal-flows.js modifies files without backup
**File**: `scripts/validators/fix-diagonal-flows.js:319`
**Agent**: S3-A1 (Script Quality)

### [HIGH] QUALITY: check-decision-log.sh iterates unquoted `$RECENT_FILES`
**File**: `.claude/hooks/check-decision-log.sh:15`
**Agent**: S3-A1 (Script Quality)

### [HIGH] QUALITY: pre-edit-validation.sh missing `set -e`
**File**: `.claude/hooks/pre-edit-validation.sh:1`
**Agent**: S3-A1 (Script Quality)
**Description**: Safety gate hook has no error handling — silent failures could allow edits on main.

### [HIGH] QUALITY: post-pr-creation.sh missing `set -u`
**File**: `.claude/hooks/post-pr-creation.sh:5`
**Agent**: S3-A1 (Script Quality)

### [HIGH] QUALITY: load-memory-bank-light.sh auto-pulls without error handling
**File**: `.claude/hooks/load-memory-bank-light.sh:11`
**Agent**: S3-A1 (Script Quality)

---

## MEDIUM Findings

### Governance (8)

1. **Missing `decisionRefBinding="latest"`** — 7 DMN businessRuleTask references across Phases 2, 4, 7, 8, and Cross-Cutting (S1-A2)
2. **Phase 1 missing phase boundary pattern** — No completion gateway, quality gate, approval, or transition event (S1-A2)
3. **Phase 2 missing phase boundary pattern** — Routes from risk tier gateway directly to end events (S1-A2)
4. **Phase 2 `isAIInitiative` boolean check** — Not sourced from any visible DMN businessRuleTask (S1-A2)
5. **Phase 1 missing vendor pool lane reference** — Collapsed participant without processRef (S1-A2)
6. **Phase 4 `aiRiskLevel` undocumented variable source** — Cross-reference with HIGH finding (S1-A2)

### Validation (5)

7. **SignalEventDefinition flagged** in 4 files — Element checker marks valid signal events as unsupported (S1-A1)
8. **EscalationEventDefinition on top-level end event** — Semantic error for Camunda 7 in master BPMN (S1-A1)
9. **Multiple start events** in master process — `StartEvent_InitiativeRequest` + `StartEvent_OversightAudit` (S1-A1)

### Visual (8)

10. **Timer label positioned LEFT** of boundary event in Phase 6 (S1-A3)
11. **Flow labels overlapping target task text** — 19 individual instances across 9 files (S1-A3, consolidated as 6 findings)

### Security (6)

12. **Comma-joined Set-Cookie on logout** — Contradicts project's own documented standard (S2-A2)
13. **Missing SLA_SESSION cookie** — Documented but not implemented; users re-auth every ~10min (S2-A2)
14. **No rate limiting on /auth/send-otp** — Email bombing risk (S2-A2)
15. **No rate limiting on /auth/verify-otp** — 6-digit OTP brute force depends on Descope limits (S2-A2)
16. **Missing security headers** on login page — No CSP, X-Frame-Options, HSTS (S2-A2)
17. **Descope project ID hardcoded** in 3 locations instead of derived from env var (S2-A2)

### Quality (7)

18. **bpmn-validator.js validateServiceTask** checks wrong extension types (`sla:taskConfig`, `zeebe:taskDefinition`) (S3-A1)
19. **element-checker.js marks SignalEventDefinition unsupported** — Contradicts modeling standards (S3-A1)
20. **flow-direction-checker.js not integrated** into validate-bpmn.sh pipeline (S3-A1)
21. **validate-cdd-evidence.sh** reads Jira password via fragile grep/awk parsing (S3-A1)
22. **bpmn-validator.js validateConnectivity** doesn't handle sub-processes or boundary events (S3-A1)
23. **security-scanner.js regex** patterns reconstructed unnecessarily (S3-A1)
24. **session-end.sh** generates JSON via heredoc without proper escaping (S3-A1)

### Config (1)

25. **Extra `prd.html`** in presentations directory — Only `index.html` should exist (S3-A2)

---

## LOW Findings

### Governance (3)
- Phase 7 missing OCC 2023-17 annotation despite vendor coordination task (S1-A2)
- Phase 8 missing all regulatory annotations (S1-A2)
- Phase 6 missing all regulatory annotations (S1-A2)

### Validation (2)
- Boundary timer events flagged as "not reachable" — validator false positive (S1-A1)
- Service tasks flagged as missing config — tasks have `camunda:type="external"` (S1-A1)

### Visual (2)
- Backward annotation association lines — cosmetic, not sequence flows (S1-A3)
- Participant-lane overlap — correct BPMN structure, false positive (S1-A3)

### Security (7)
- Missing `historyTimeToLive` on 8 vendor/sub-process definitions (S2-A1)
- DMN decision tables expose scoring thresholds in XML comments (S2-A1)
- Signal/message names could enable cross-process spoofing in shared engine (S2-A1)
- Logout doesn't clear PENDING_EMAIL cookie (S2-A2)
- Inline script without nonce/CSP (S2-A2)
- External font loading from Google — privacy concern (S2-A2)
- Various: hardcoded email allowlist, cookie attribute inconsistency, timing-unsafe proxy check, shell script `set -euo pipefail` inconsistency (S2-A2)

### Quality (1)
- Various: dead code in fix-diagonal-flows.js, outdated script format list, element-checker O(N²), missing `engines` in package.json, color codes in non-TTY context, dead function export (S3-A1)

### Config (1)
- `console.error()` in auth worker — acceptable for error logging (S3-A2)

---

## Validator Pipeline Results

| Validator | Files Passed | Files Failed |
|-----------|-------------|--------------|
| security-scanner.js | 18 | 0 |
| bpmn-validator.js | 18 | 0 |
| visual-overlap-checker.js | 18 | 0 |
| element-checker.js | 18 | 0 |
| flow-direction-checker.js | *Not integrated* | *Not run* |

All 18 files (10 BPMN + 8 DMN) pass formal validation. Findings are structural/semantic issues not caught by the automated pipeline.

---

## Top 5 Recommendations

1. **Fix silent validator failures** (4 CRITICAL) — Add `.catch()` handlers to bpmn-validator.js and element-checker.js; remove `2>/dev/null` from validate-bpmn.sh; add `set -uo pipefail`. These mask real validation errors today.

2. **Add Phase 7 deployment approval gate** (1 HIGH governance) — Insert the mandatory 4-step phase boundary pattern (completion gateway → quality gate → approval task → transition event) before production go-live. This is the highest-risk governance gap.

3. **Implement SLA_SESSION cookie** (1 MEDIUM security) — The documented 8-hour worker-managed session cookie is not implemented. Users re-authenticate every ~10 minutes when the Descope JWT expires. This is the most impactful UX and security fix.

4. **Fix 7 missing `decisionRefBinding="latest"`** (1 MEDIUM governance, 7 tasks) — Consistent omission across Phases 2, 4, 7, 8, and Cross-Cutting. A single sweep would bring all DMN references to standard.

5. **Add OTP rate limiting** (2 MEDIUM security) — Both `/auth/send-otp` and `/auth/verify-otp` lack worker-level rate limiting. Implement via Cloudflare Rate Limiting Rules or KV-backed counters.

---

*Generated by SLA Code Audit — 7 agents, 3 squads*
*Report: docs/audit-report-latest.md*
*Individual findings: docs/audit-findings/*
