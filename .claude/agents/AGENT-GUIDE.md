# Agent Selection Guide

Quick reference for choosing the right Claude Code subagent.

## Decision Flowchart

```
What are you doing?
│
├─ Creating/editing BPMN?
│  ├─ New process model ──────────→ governance-process-modeler
│  ├─ Fix layout/visual issues ──→ bpmn-specialist
│  └─ Convert BPMN to SVG ───────→ bpmn-to-svg (skill)
│
├─ Creating DMN tables? ──────────→ dmn-decision-architect
│
├─ Validating files?
│  ├─ BPMN structural/visual ────→ bpmn-validator
│  └─ BDD test generation ──────→ bpmn-tester
│
├─ Code review / PR?
│  ├─ Full PR review ────────────→ pr-orchestrator
│  ├─ Code quality only ─────────→ code-quality-reviewer
│  ├─ Architecture review ───────→ architecture-reviewer
│  ├─ Security review ──────────→ security-reviewer
│  └─ Test coverage ─────────────→ test-coverage-analyzer
│
├─ Regulatory / compliance?
│  ├─ Regulatory analysis ───────→ regulatory-analysis
│  ├─ Risk assessment ──────────→ risk-assessment
│  ├─ AI governance ─────────────→ ai-governance-advisor
│  └─ CDD methodology ──────────→ cdd-methodology
│
├─ Complex analysis? ─────────────→ critical-thinking
│
├─ Infrastructure / deploy?
│  └─ Presentation deploy ───────→ cloudflare-publisher (skill)
│
├─ Jira work items? ──────────────→ jira-manager
│
├─ Writing a PRD? ────────────────→ prd-generator
│
├─ Creating new agents? ──────────→ subagent-creator
│
├─ Git workflow? ─────────────────→ git-workflow-guardian
│
├─ Committing BPMN files? ────────→ bpmn-commit-agent
│
└─ Full SDLC pipeline? ──────────→ sdlc-orchestrator
```

## Agents by Function

### Modeling (create/edit artifacts)
| Agent | Purpose |
|-------|---------|
| `governance-process-modeler` | Create BPMN process models for governance phases |
| `bpmn-specialist` | Repair layout, fix visual issues, optimize positioning |
| `dmn-decision-architect` | Create DMN 1.3 decision tables |

### Validation (check artifacts)
| Agent | Purpose |
|-------|---------|
| `bpmn-validator` | Structural and visual BPMN validation |
| `bpmn-tester` | BDD test generation for BPMN processes |
| `bpmn-commit-agent` | Validate, commit, and create PRs for BPMN/DMN files |

### Review (analyze quality)
| Agent | Purpose |
|-------|---------|
| `pr-orchestrator` | Full 9-agent coordinated PR review |
| `code-quality-reviewer` | Code standards and best practices |
| `architecture-reviewer` | System design and structural integrity |
| `security-reviewer` | Security vulnerability analysis |
| `test-coverage-analyzer` | Test coverage and quality analysis |
| `critical-thinking` | Rigorous analytical reasoning |

### Governance & Compliance
| Agent | Purpose |
|-------|---------|
| `regulatory-analysis` | Regulatory framework analysis (OCC, DORA, SOX, etc.) |
| `risk-assessment` | Enterprise risk assessment and scoring |
| `ai-governance-advisor` | EU AI Act, ISO 42001, SR 11-7 compliance |
| `cdd-methodology` | Compliance-Driven Development lifecycle |

### Platform Operations
| Agent | Purpose |
|-------|---------|
| `jira-manager` | Jira work item CRUD via CLI/REST |
| `prd-generator` | Product Requirements Document creation |
| `subagent-creator` | Create and validate new subagents |
| `sdlc-orchestrator` | Full 4-phase SDLC workflow execution |
| `git-workflow-guardian` | Git branching and workflow enforcement |

## Model Routing

When spawning agents, always specify the model parameter per the routing rules:
- **haiku**: Exploration, file searches, simple lookups
- **sonnet**: Code writing, standard reviews, planning
- **opus**: Architecture, security audits, complex reasoning
