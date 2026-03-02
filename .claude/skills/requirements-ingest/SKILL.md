---
name: requirements-ingest
description: Analyze and ingest requirements from docs/requirements/ documents into actionable BPMN/DMN specifications
user_invocable: true
---

# Requirements Ingest Skill

Analyze requirements documents in `docs/requirements/` and produce structured analysis plans for converting them into BPMN process models and DMN decision tables. This skill handles the workflow orchestration; actual document parsing requires external tooling (see note below).

## When to Use

Invoke this skill when:
- New requirements documents have been added to `docs/requirements/`
- Starting a modeling effort from source materials
- Triaging which documents contain process-relevant content vs. policy background
- Planning a sprint around a set of requirement artifacts

## Implementation

When this skill is invoked:

### Step 1: Inventory Documents

List all files in `docs/requirements/`:

```bash
ls -la docs/requirements/
```

For each file, record:
- Filename and extension (`.docx`, `.pptx`, `.pdf`)
- File size (indicator of content density)
- Last modified date (indicator of recency/relevance)

### Step 2: Classify Each Document

Apply this classification heuristic based on filename and extension:

| Pattern | Likely Content | Analysis Approach |
|---------|---------------|-------------------|
| `*Governance*` | Policy, phase definitions, roles | Extract phases, swim lanes, decision points |
| `*PDLC*` | Process/lifecycle stages | Map to BPMN pools and sequence flows |
| `*Risk*` | Controls, thresholds, escalation | Extract DMN decision tables, boundary events |
| `*AI*` or `*Policy*` | Regulatory constraints | Extract annotation requirements, compliance gates |
| `*.pptx` | Slide deck — likely summary | Use for phase overviews; cross-ref with `.docx` |
| `*.docx` | Detailed specification | Primary source for BPMN/DMN modeling |

### Step 3: Produce Analysis Plan

Output a structured plan for each document:

```markdown
## Requirements Ingest Plan

### Document Inventory

| File | Size | Type | Priority |
|------|------|------|----------|
| [filename] | [size] | [docx/pptx] | [High/Med/Low] |

### Per-Document Analysis

#### [Document 1 filename]
- **Classification**: [Policy / Process / Risk / Regulatory]
- **Expected artifacts**: [BPMN pools / DMN tables / annotation requirements]
- **Key questions to answer**:
  - [Question extracted from filename/context]
- **Dependencies**: [Other docs that should be read first or alongside]
- **Suggested approach**: [Summarize → Extract entities → Map to BPMN elements]

#### [Document 2 filename]
...

### Recommended Sequencing

1. Read [doc A] first — establishes phase definitions everything else references
2. Read [doc B] — adds regulatory constraints to overlay on phase model
3. Read [doc C] — provides decision logic for DMN tables
...

### Modeling Deliverables

Based on document inventory, expect to produce:
- [ ] BPMN process model for [phase/workflow]
- [ ] DMN decision table for [decision point]
- [ ] Regulatory annotation set for [standard]
```

## Known Documents (as of initial setup)

The following documents were present at skill creation time:

| File | Classification |
|------|---------------|
| `Enterprise_Software_Governance_v2.docx` | Governance policy — baseline version |
| `Enterprise_Software_Governance_v3.docx` | Governance policy — current version; diff against v2 for changes |
| `Financial Services Third-Party Risk Management-2.docx` | TPRM process — v2 |
| `Financial Services Third-Party Risk Management-3.docx` | TPRM process — v3 |
| `Governance and PDLC v1.pptx` | Lifecycle overview — use for phase structure and swim lane identification |
| `White Paper- Establishing a Centralized AI Governance Program PR1.docx` | Regulatory/policy — AI governance constraints |

**Version pairs**: Read v3 as primary; diff against v2 to identify what changed and why.

## Tooling Note

Direct reading of `.docx` and `.pptx` files requires external conversion tools. If available:

```bash
# Convert .docx to readable text (requires pandoc)
pandoc docs/requirements/[file].docx -t plain -o /tmp/[file].txt

# Convert .pptx to readable text (requires LibreOffice or python-pptx)
libreoffice --headless --convert-to txt docs/requirements/[file].pptx --outdir /tmp/
```

If conversion tools are not available, this skill still produces the inventory and analysis plan. Document reading should then be done manually or via a document-capable tool before modeling begins.

## Related Skills

- `/governance-context` — Load domain rules before starting to model extracted requirements
- `/context-full` — Full project context if starting from scratch
- `/bpmn-editing` — Standards to apply when building models from extracted requirements
- `/memory` — Check if similar requirements have been ingested previously
