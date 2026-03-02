---
name: bpmn-cicd
version: 1.0.0
created: 2025-12-21
updated: 2025-12-21
description: Hybrid CI/CD patterns for BPMN process deployment combining fast JavaScript validation gates with AI-powered intelligent analysis and testing. Use when deploying BPMN processes through CI/CD pipelines with quality gates, automated testing, and deployment verification.
---

# BPMN CI/CD Skill

> **NOTE**: Phases 4-7 (deploy to Camunda) are deferred — no Camunda instance exists yet. Focus on Phases 1-3 (validate, test, visual check).

## Overview

Comprehensive CI/CD patterns for BPMN process deployment using a hybrid approach that combines:
- **Fast JavaScript gates** for deterministic validation (zero cost, milliseconds)
- **AI-powered analysis** for intelligent pattern recognition and failure diagnosis (cost-optimized)
- **Cucumber testing** for reliable test execution (deterministic assertions)
- **Automated deployment** with verification and rollback capabilities (deferred until Camunda available)

**When to use**: Implementing or updating CI/CD pipelines for BPMN processes, ensuring quality gates, automating deployment, or troubleshooting pipeline failures.

---

## Quick Reference

### Pipeline Phases
1. **Fast Validation** (JavaScript) - XML schema, element support
2. **AI Analysis** (SubAgent) - Best practices, pattern recognition
3. **Test Generation** (AI) - Comprehensive BDD scenarios
4. **Test Execution** (Cucumber) - Deterministic assertions [DEFERRED - requires Camunda]
5. **Deployment** (Script) - Reliable Camunda deployment [DEFERRED - no Camunda instance]
6. **Verification** (AI) - Intelligent smoke testing [DEFERRED - no Camunda instance]

### Active Phases (1-3 only)

Focus CI/CD work on:
- **Phase 1**: Fast XML validation gates
- **Phase 1.5**: Visual validation (overlap, label bounds)
- **Phase 2**: AI best practice analysis
- **Phase 3**: BDD test scenario generation

### Key Principle: Right Tool for the Job
- **JavaScript**: Fast, deterministic, zero cost → Validation gates
- **AI (SubAgent)**: Intelligent, context-aware → Analysis, test generation, failure diagnosis
- **Cucumber**: Reliable, auditable → Test execution
- **Shell Script**: Predictable, idempotent → Deployment

---

## CI/CD Pipeline Architecture

> **IMPORTANT**: This project uses Claude Code-based CI/CD. **GitHub Actions is PROHIBITED.**

### Complete Workflow (Claude Code Skills & Commands)

The BPMN CI/CD pipeline is invoked via Claude Code commands and skills:

```bash
# Full pipeline - validate, test, and deploy
/deploy-bpmn staging

# Test only (no deployment)
/test-bpmn loan-approval-process

# Check pipeline status
/pipeline-status
```

### Pipeline Execution Flow

When you run `/deploy-bpmn staging`, Claude Code executes these phases:

```
Phase 1: Fast Validation (JavaScript - $0, <100ms)
  ├── node bpmn-validator.js [file.bpmn]
  └── node element-checker.js [file.bpmn]

Phase 1.5: Visual Validation (JavaScript + Playwright - $0)
  ├── node visual-overlap-checker.js [file.bpmn]
  └── Playwright renders and validates layout

Phase 2: AI Best Practice Analysis (sonnet - ~$0.02)
  └── bpmn-validator SubAgent analyzes patterns

Phase 3: Test Generation (sonnet - ~$0.05)
  └── bpmn-tester SubAgent generates BDD scenarios

Phase 4: Test Execution (Cucumber - $0) [DEFERRED]
  ├── Deploys BPMN to local Camunda
  └── Runs Cucumber tests

Phase 5: Failure Analysis (if needed) (sonnet - ~$0.03) [DEFERRED]
  └── bpmn-tester SubAgent analyzes root cause

Phase 6: Deployment (Shell Script - $0) [DEFERRED]
  └── .claude/scripts/pipeline/deploy-bpmn.sh

Phase 7: Verification (sonnet - ~$0.02) [DEFERRED]
  └── cicd-pipeline SubAgent verifies deployment health
```

### Invoking Individual Phases

```bash
# Phase 1: Fast validation only
node scripts/bpmn-interpreter/tests/support/bpmn-validator.js processes/loan-approval.bpmn
node scripts/bpmn-interpreter/tests/support/element-checker.js processes/loan-approval.bpmn

# Phase 1.5: Visual validation
node scripts/bpmn-interpreter/tests/support/visual-overlap-checker.js processes/loan-approval.bpmn

# Phase 2: AI analysis
> Use the bpmn-validator subagent to analyze best practices for processes/loan-approval.bpmn

# Phase 3: Test generation (no execution until Camunda is available)
/test-bpmn loan-approval --generate

# Phase 6: Deployment [DEFERRED]
/deploy-bpmn staging

# Phase 7: Verification [DEFERRED]
> Use the cicd-pipeline subagent to verify deployment health for staging
```

### Full Pipeline via cicd-pipeline SubAgent

For complex orchestration:
```
> Use the cicd-pipeline subagent to run the full BPMN deployment pipeline for processes/loan-approval.bpmn to staging environment
```

### Environment Targets

| Command | Environment | Verification |
|---------|-------------|--------------|
| `/deploy-bpmn local` | Local Docker Camunda (8080) | Immediate [DEFERRED] |
| `/deploy-bpmn staging` | GKE staging namespace | Smoke test [DEFERRED] |
| `/deploy-bpmn production` | GKE prod namespace | Full verification [DEFERRED] |

---

## Hybrid Architecture Pattern

### Phase Breakdown

| Phase | Tool | Speed | Cost | Deterministic | Status |
|-------|------|-------|------|---------------|--------|
| **1. XML Validation** | JavaScript | <100ms | $0 | Yes | Active |
| **1.5 Static Overlap** | JavaScript | <100ms | $0 | Yes | Active |
| **1.5 Visual Validation** | Playwright | 3-8s | $0 | Yes | Active |
| **2. Element Check** | JavaScript | <50ms | $0 | Yes | Active |
| **3. Best Practice Analysis** | AI (sonnet) | 2-5s | ~$0.02 | No | Active |
| **4. Test Generation** | AI (sonnet) | 5-10s | ~$0.05 | No | Active (gen only) |
| **5. Test Execution** | Cucumber | 30-60s | $0 | Yes | Deferred |
| **6. Failure Analysis** | AI (sonnet/opus) | 3-8s | ~$0.03 | No | Deferred |
| **7. Deployment** | Shell Script | 5-10s | $0 | Yes | Deferred |
| **8. Verification** | AI (sonnet) | 2-5s | ~$0.02 | No | Deferred |

**Total Cost per Active Pipeline Run**: ~$0.07 (Phases 1-3 only)

---

## Quality Gates

### Gate 1: Fast Validation (MANDATORY)
**Tool**: JavaScript validators
**Criteria**:
- [ ] XML schema valid
- [ ] All elements supported
- [ ] No syntax errors
- [ ] Process ID unique
**On Failure**: STOP pipeline, report errors, no AI cost incurred

### Gate 1.5: Visual Validation (MANDATORY)
**Tool**: JavaScript (static) + Playwright (rendered)
**Criteria**:
- [ ] No overlapping elements (>5% threshold)
- [ ] Labels within viewport bounds
- [ ] No truncated labels
- [ ] All flows have valid source/target
**On Failure**: STOP pipeline, generate visual report with screenshots

### Gate 2: Best Practice (RECOMMENDED)
**Tool**: bpmn-validator SubAgent
**Criteria**:
- [ ] No anti-patterns detected
- [ ] Error handling present
- [ ] Naming conventions followed
- [ ] Documentation exists
**On Failure**: WARNING, allow continuation with approval

### Gate 3: Test Coverage (MANDATORY when Camunda available)
**Tool**: bpmn-tester SubAgent
**Criteria**:
- [ ] Path coverage >= 80%
- [ ] Happy path scenario exists
- [ ] Error scenarios exist
- [ ] Boundary tests exist
**On Failure**: STOP pipeline, require additional tests

### Gate 4: Test Pass Rate (MANDATORY when Camunda available)
**Tool**: Cucumber execution
**Criteria**:
- [ ] All smoke tests pass
- [ ] Happy path tests pass
- [ ] Critical error tests pass
- [ ] No blocking failures
**On Failure**: STOP pipeline, trigger AI analysis, require fixes

### Gate 5: Deployment Verification (MANDATORY when Camunda available)
**Tool**: Smoke test + AI verification
**Criteria**:
- [ ] Process definitions deployed
- [ ] Process instances startable
- [ ] No deployment errors
- [ ] Health checks pass
**On Failure**: ROLLBACK deployment, incident notification

---

## Model Routing for Cost Optimization

### Fast Gates (JavaScript - $0)
```bash
# Always run these first
node scripts/bpmn-interpreter/tests/support/bpmn-validator.js [file.bpmn]
node scripts/bpmn-interpreter/tests/support/element-checker.js [file.bpmn]
```

### AI Analysis (Model-Routed)
```bash
# Use haiku for simple checks
claude --model haiku "> Parse BPMN and extract process ID"

# Use sonnet for standard analysis
claude --model sonnet "> Use bpmn-validator to analyze best practices"

# Use opus for complex reasoning (rare)
claude --model opus "> Analyze security implications of this multi-tenant BPMN process"
```

### Cost Breakdown (100 pipeline runs/month, active phases only)
| Phase | Runs | Model | Cost/Run | Total |
|-------|------|-------|----------|-------|
| Fast Gates | 100 | JavaScript | $0 | $0 |
| Best Practice | 100 | sonnet | $0.02 | $2 |
| Test Generation | 100 | sonnet | $0.05 | $5 |
| **TOTAL** | - | - | - | **$7/month** |

---

## Deployment Patterns (For Future Camunda Integration)

### Pattern 1: Blue-Green Deployment
```bash
# Deploy to green environment
./deploy-bpmn.sh --target green --version v2.0.0

# Smoke test green
claude "> Verify BPMN deployment health on green environment"

# Route traffic to green
kubectl set image deployment/process-engine engine=process-engine:v2.0.0
```

### Pattern 2: Canary Deployment
```bash
# Deploy to 10% of instances
./deploy-bpmn.sh --canary 10 --version v2.0.0

# Monitor metrics
claude "> Use cicd-pipeline to monitor canary deployment metrics for 10 minutes"
```

---

## Rollback Procedures (For Future Camunda Integration)

### Automatic Rollback Triggers
- Smoke test failure
- Health check failure
- Error rate spike (> 5%)
- Response time degradation (> 50%)

### Rollback Script
```bash
#!/bin/bash
# .claude/scripts/pipeline/rollback-bpmn.sh

# Get previous deployment version
PREVIOUS_VERSION=$(curl -s "$CAMUNDA_URL/engine-rest/deployment" \
  -H "Authorization: Bearer $API_KEY" \
  | jq -r '.[1].name')

# Delete current deployment
CURRENT_ID=$(curl -s "$CAMUNDA_URL/engine-rest/deployment" \
  -H "Authorization: Bearer $API_KEY" \
  | jq -r '.[0].id')

curl -X DELETE "$CAMUNDA_URL/engine-rest/deployment/$CURRENT_ID?cascade=true" \
  -H "Authorization: Bearer $API_KEY"

# Redeploy previous version
./deploy-bpmn.sh --version "$PREVIOUS_VERSION"

# Verify rollback
claude "> Verify BPMN deployment health after rollback to $PREVIOUS_VERSION"
```

---

## Evidence Collection (CDD Compliance)

### Required Evidence per Deployment
1. **Pre-Deployment**:
   - BPMN validation report (JavaScript + AI)
   - Test coverage report
   - Test execution results
   - Security scan results

2. **Deployment**:
   - Deployment timestamp
   - Deployed BPMN files (SHA256 hashes)
   - Deployment ID from Camunda
   - Environment (staging/production)

3. **Post-Deployment**:
   - Smoke test results
   - Health check results
   - AI verification report
   - Rollback plan

### Evidence Storage Structure
```
.claude/memory-bank/evidence/deployments/
  └── [deployment-id]/
      ├── pre-deployment/
      │   ├── validation-report.md
      │   ├── test-coverage.md
      │   ├── test-results.json
      │   └── security-scan.md
      ├── deployment/
      │   ├── deployment-manifest.json
      │   ├── bpmn-files-deployed.txt
      │   └── camunda-deployment-response.json
      └── post-deployment/
          ├── smoke-test-results.md
          ├── health-check.md
          ├── ai-verification.md
          └── rollback-plan.md
```

---

## Troubleshooting Guide

### Issue: Fast Validation Fails
**Symptoms**: XML schema error, element not supported
**Diagnosis**: JavaScript validator reports error
**Fix**:
1. Review validator output
2. Fix BPMN file syntax/elements
3. Re-run validation

### Issue: Test Coverage < 80%
**Symptoms**: Coverage report shows gaps
**Diagnosis**: AI identifies untested paths
**Fix**:
1. Review coverage report
2. Add missing test scenarios
3. Regenerate tests with `/test-bpmn --generate`

### Issue: Tests Fail in CI/CD
**Symptoms**: Cucumber tests fail
**Diagnosis**: AI failure analysis identifies root cause
**Fix**:
1. Run `/test-bpmn [process] --analyze`
2. Review AI-generated fix suggestions
3. Apply fixes to BPMN or worker code
4. Re-run tests

---

## Related SubAgents

- **bpmn-validator**: BPMN validation and best practices
- **bpmn-tester**: Test generation and failure analysis
- **cicd-pipeline**: CI/CD orchestration and deployment (deferred)
- **evidence-collection**: CDD compliance evidence generation

## Related Commands

- **/test-bpmn**: User-friendly test invocation
- **/deploy-bpmn**: Deploy BPMN to Camunda (deferred)
- **/pipeline-status**: Check CI/CD pipeline status
- **/rollback**: Rollback failed deployment (deferred)

## Related Rules

- **bpmn-testing.md**: BPMN testing standards
- **model-routing.md**: AI model selection for cost optimization

---

## Success Metrics

- **Pipeline Speed**: < 2 minutes (with parallel execution)
- **Cost per Run**: < $0.10 (Phases 1-3, with model-routing)
- **Test Coverage**: > 80% average (scenario generation)
- **Deployment Success Rate**: > 95% (when Camunda available)
- **Rollback Rate**: < 5% (when Camunda available)
- **Evidence Generation**: 100% (CDD compliance)

---

**Skill Version**: 1.0.0
**Created**: 2025-12-21
**Platform**: SLA Governance Platform
