# S2-A1: BPMN/DMN Security Scan Report

**Agent**: S2-A1 (BPMN Security)
**Date**: 2026-03-04
**Scope**: All BPMN files in `processes/` and DMN files in `decisions/dmn/`
**Scanner**: Manual deep audit + review of `scripts/validators/security-scanner.js`

---

## Executive Summary

The SLA Governance Platform BPMN and DMN artifacts demonstrate a **strong security posture**. No CRITICAL or HIGH severity vulnerabilities were found. All active BPMN models are free of code execution vectors (no scriptTasks, no camunda:class, no delegateExpressions, no JUEL injection, no XXE). All processes are set to `isExecutable="false"` (documentation-only mode), which significantly reduces the attack surface.

Three LOW severity findings and two informational observations were identified, all related to defense-in-depth hardening rather than exploitable vulnerabilities.

**Security Score: 9.5/10** -- Excellent security posture for BPMN/DMN artifacts.

---

## Files Scanned

### Active BPMN Files (10)
- `/Users/proth/repos/sla/processes/master/sla-governance-master.bpmn`
- `/Users/proth/repos/sla/processes/phase-1-intake/initiation-and-intake.bpmn`
- `/Users/proth/repos/sla/processes/phase-2-planning/planning-and-risk-scoping.bpmn`
- `/Users/proth/repos/sla/processes/phase-3-due-diligence/due-diligence-and-swarm.bpmn`
- `/Users/proth/repos/sla/processes/phase-4-governance/governance-review-and-approval.bpmn`
- `/Users/proth/repos/sla/processes/phase-5-contracting/contracting-and-controls.bpmn`
- `/Users/proth/repos/sla/processes/phase-6-sdlc/sdlc-development-and-testing.bpmn`
- `/Users/proth/repos/sla/processes/phase-7-deployment/deployment-and-go-live.bpmn`
- `/Users/proth/repos/sla/processes/phase-8-operations/operations-monitoring-retirement.bpmn`
- `/Users/proth/repos/sla/processes/cross-cutting/cross-cutting-event-subprocesses.bpmn`

### Active DMN Files (8)
- `/Users/proth/repos/sla/decisions/dmn/DMN-1-risk-tier-classification.dmn`
- `/Users/proth/repos/sla/decisions/dmn/DMN-2-pathway-routing.dmn`
- `/Users/proth/repos/sla/decisions/dmn/DMN-3-governance-review-routing.dmn`
- `/Users/proth/repos/sla/decisions/dmn/DMN-4-automation-tier-assignment.dmn`
- `/Users/proth/repos/sla/decisions/dmn/DMN-5-agent-confidence-escalation.dmn`
- `/Users/proth/repos/sla/decisions/dmn/DMN-6-change-risk-scoring.dmn`
- `/Users/proth/repos/sla/decisions/dmn/DMN-7-vulnerability-remediation-routing.dmn`
- `/Users/proth/repos/sla/decisions/dmn/DMN-8-monitoring-cadence-assignment.dmn`

### Archive Files (16 BPMN, 16 DMN)
- All archive files under `processes/archive/` and `decisions/archive/` were also scanned for completeness.

---

## Threat Categories Scanned

| Threat Category | Status | Details |
|---|---|---|
| XXE (DOCTYPE/ENTITY) | CLEAR | No DOCTYPE or ENTITY declarations in any file |
| Script Tasks (RCE) | CLEAR | No `<bpmn:scriptTask>` elements found |
| Java Class Loading (camunda:class) | CLEAR | No `camunda:class` attributes found |
| Delegate Expressions | CLEAR | No `camunda:delegateExpression` attributes found |
| JUEL Injection (Runtime, exec, ProcessBuilder) | CLEAR | No dangerous JUEL patterns found |
| External Script References | CLEAR | No `deployment://` or `classpath://` references |
| CDATA Blocks | CLEAR | No CDATA sections in any BPMN or DMN file |
| Unsafe Deserialization | CLEAR | No `camunda:inputOutput` with serialized objects |
| Listener Injection | CLEAR | No execution or task listeners found |
| Connector Elements | CLEAR | No `<camunda:connector>` elements found |
| XI:Include | CLEAR | No `<xi:include>` directives found |
| Embedded Business Logic | CLEAR | All condition expressions read DMN output variables only |
| Executable Processes | CLEAR | All active processes set to `isExecutable="false"` |
| Missing Access Controls | CLEAR | All userTasks have `candidateGroups` attribute |
| Hardcoded Secrets | CLEAR | No passwords, API keys, or tokens in any file |
| DMN FEEL Injection | CLEAR | No `function()` or `invoke()` calls in DMN files |
| Namespace Manipulation | CLEAR | All XML namespaces are standard BPMN/DMN/Camunda |

---

## Findings

### [LOW] SECURITY: Missing historyTimeToLive on Vendor/Sub-Process Definitions

**File**: `/Users/proth/repos/sla/processes/master/sla-governance-master.bpmn`:450
**Agent**: S2-A1 (BPMN Security)
**Threat**: Configuration gap (data retention)
**Evidence**:
```xml
<bpmn:process id="Process_VendorResponse" name="Vendor / Third Party Response" isExecutable="false">
```

**Additional occurrences**:
- `/Users/proth/repos/sla/processes/phase-6-sdlc/sdlc-development-and-testing.bpmn`:247 — `Process_VendorPhase6`
- `/Users/proth/repos/sla/processes/phase-6-sdlc/sdlc-development-and-testing.bpmn`:269 — `SubProcess_6A_SprintLifecycle_Proc`
- `/Users/proth/repos/sla/processes/phase-6-sdlc/sdlc-development-and-testing.bpmn`:294 — `SubProcess_6B_DevPipeline_Proc`
- `/Users/proth/repos/sla/processes/phase-6-sdlc/sdlc-development-and-testing.bpmn`:334 — `SubProcess_6C_TestingPipeline_Proc`
- `/Users/proth/repos/sla/processes/phase-6-sdlc/sdlc-development-and-testing.bpmn`:384 — `SubProcess_6D_DevSecOps_Proc`
- `/Users/proth/repos/sla/processes/phase-6-sdlc/sdlc-development-and-testing.bpmn`:457 — `SubProcess_6E_ComplianceGates_Proc`
- `/Users/proth/repos/sla/processes/phase-6-sdlc/sdlc-development-and-testing.bpmn`:492 — `SubProcess_6F_SprintReview_Proc`

**Description**: 8 process definitions across 2 files are missing the `camunda:historyTimeToLive` attribute. While processes are currently `isExecutable="false"` (documentation-only), if these processes are ever deployed to a Camunda engine, missing `historyTimeToLive` causes history data to accumulate indefinitely, creating a data retention compliance risk (GDPR Article 5(1)(e), CCPA, SEC 17a-4).

**Risk**: If deployed to Camunda 7, process instance history would accumulate without cleanup, violating data minimization principles. LOW severity because processes are currently documentation-only.

**Recommendation**: Add `camunda:historyTimeToLive="180"` to all 8 process definitions for consistency with the other process definitions in the project.


### [LOW] SECURITY: DMN Decision Tables Expose Internal Scoring Thresholds

**File**: `/Users/proth/repos/sla/decisions/dmn/DMN-1-risk-tier-classification.dmn`:22-30
**Agent**: S2-A1 (BPMN Security)
**Threat**: Information disclosure
**Evidence**:
```xml
<!-- From DMN-1 comments -->
Any single score >= 9 triggers Unacceptable tier.
Weighted composite >= 7.0 triggers High; >= 4.0 triggers Limited; else Minimal.

<!-- From DMN-5 comments -->
High risk + any confidence below 80 -> Manual Takeover
Very low confidence (< 40) on any risk tier -> Manual Takeover
Limited risk + confidence >= 70 -> Autonomous Progression
Minimal risk + confidence >= 60 -> Autonomous Progression
```

**Additional occurrences**:
- `/Users/proth/repos/sla/decisions/dmn/DMN-5-agent-confidence-escalation.dmn`:80-171

**Description**: DMN decision table XML comments and rule descriptions expose exact numerical thresholds used for risk tier classification and agent confidence escalation routing. An attacker with access to these files could craft inputs that game the scoring system to achieve a desired risk tier classification (e.g., keeping all scores at 8 to avoid "Unacceptable" while still being high-risk, or manipulating agent confidence scores to exactly meet autonomous progression thresholds).

**Risk**: If an adversary (e.g., a vendor undergoing due diligence) gains read access to the DMN files, they could understand exactly which score combinations trigger which governance pathway, and tailor their submissions to achieve favorable routing. This is a social engineering/gaming risk, not a technical exploit. LOW severity because: (1) DMN files are not served publicly, (2) score inputs come from multiple independent assessors, and (3) the UNIQUE/FIRST hit policies ensure deterministic routing.

**Recommendation**: Consider removing exact threshold values from XML comments. The rule logic itself (inputEntry values) is inherently visible in DMN, but the explanatory comments amplify the information leakage. Alternatively, accept this as a design trade-off for maintainability.


### [LOW] SECURITY: Signal/Message Names Could Enable Cross-Process Spoofing

**File**: `/Users/proth/repos/sla/processes/master/sla-governance-master.bpmn`:4-5
**Agent**: S2-A1 (BPMN Security)
**Threat**: Signal/message injection (cross-process spoofing)
**Evidence**:
```xml
<bpmn:message id="Message_GovernancePortal" name="GovernancePortalSubmission" />
<bpmn:signal id="Signal_EmergencyCessation" name="EmergencyCessation" />
```

**Additional signal/message definitions across active files**:
- `Signal_Phase7Complete`, `Signal_Phase7Rollback` (phase-7)
- `Signal_Phase2Complete_P3`, `Signal_Phase3Complete` (phase-3)
- `Signal_Phase4Complete` (phase-4)
- `Message_VulnerabilityDetected`, `Message_IncidentDetected`, `Message_RegulatoryUpdate` (cross-cutting)

**Description**: Signal events in BPMN are broadcast to all process instances in the same engine. If these processes are ever deployed to a shared Camunda engine alongside other process applications, any process could emit `Signal_EmergencyCessation` and trigger emergency termination of all governance instances. Similarly, `Message_GovernancePortalSubmission` could be sent by any process that knows the message name.

**Risk**: In a multi-tenant Camunda deployment, an attacker with process deployment rights could deploy a malicious process that emits `Signal_EmergencyCessation` to terminate all governance instances, causing denial of service. LOW severity because: (1) processes are currently documentation-only (`isExecutable="false"`), (2) deployment to a shared engine would require separate access controls, and (3) this is a known BPMN engine architecture concern, not specific to this project.

**Recommendation**: When transitioning to executable deployment, implement signal/message name namespacing (e.g., `sla.governance.EmergencyCessation`) and restrict process deployment rights via Camunda authorization framework.

---

## Security Scanner Coverage Analysis

The existing `scripts/validators/security-scanner.js` provides solid coverage of the most critical BPMN/DMN threats.

### What the Scanner Covers Well
- XXE detection (DOCTYPE, ENTITY)
- Script task detection (RCE)
- JUEL injection patterns (Runtime, ProcessBuilder, ClassLoader, System.exit, Thread, java.lang, java.io)
- Java class loading (camunda:class, delegateExpression)
- External script references (deployment://, classpath://)
- CDATA executable content detection
- Listener expression injection
- Connector elements
- XI:Include directives
- Complex expression warnings
- DMN FEEL function/invoke detection

### Scanner Coverage Gaps (Not Currently Checked)

| Gap | Severity | Description |
|---|---|---|
| Missing candidateGroups | MEDIUM | userTasks without candidateGroups allow any authenticated user to claim the task |
| Missing historyTimeToLive | LOW | Process definitions without retention policy |
| isExecutable="true" check | LOW | Processes that could be accidentally deployed |
| Signal/message name validation | LOW | Predictable signal names that could be spoofed |
| Unbounded loops | LOW | Loops without termination conditions (DoS) |
| Embedded business logic | MEDIUM | conditionExpression with complex logic instead of DMN references |
| Process ID exposure | INFO | Process IDs revealing internal system architecture |

**Recommendation**: Consider adding the MEDIUM-severity checks (candidateGroups and embedded business logic) to the scanner for automated enforcement.

---

## Checkbox Verification Results

| Criteria | Status | Details |
|---|---|---|
| NO HARDCODED SECRETS | PASS | No credentials, API keys, or sensitive data in any BPMN/DMN file |
| NO XXE VECTORS | PASS | No DOCTYPE, ENTITY, SYSTEM, or PUBLIC declarations |
| NO CODE EXECUTION | PASS | No scriptTasks, camunda:class, delegateExpression, or JUEL injection |
| NO EXTERNAL REFERENCES | PASS | No deployment://, classpath://, or xi:include references |
| ACCESS CONTROLS PRESENT | PASS | All userTasks have candidateGroups from the valid 9+1 lane set |
| DMN-FIRST DESIGN | PASS | All condition expressions read DMN output variables; no embedded business logic |
| PROCESSES NON-EXECUTABLE | PASS | All active processes set to isExecutable="false" |
| NAMESPACE INTEGRITY | PASS | All XML namespaces are standard BPMN 2.0, DMN 1.3, and Camunda Platform 7 |

---

## Summary Counts

| Severity | Count |
|---|---|
| CRITICAL | 0 |
| HIGH | 0 |
| MEDIUM | 0 |
| LOW | 3 |
| INFO | 0 |
| **Total** | **3** |

---

## Risk Assessment

**Overall Risk**: LOW

The BPMN/DMN artifacts are well-secured. The three LOW findings are defense-in-depth improvements relevant only if/when processes transition from documentation-only to executable deployment. The current `isExecutable="false"` stance across all active processes provides an effective kill switch against runtime exploitation.

The existing `security-scanner.js` provides automated enforcement of the most critical checks and should be extended with candidateGroups and embedded-logic checks for comprehensive coverage.
