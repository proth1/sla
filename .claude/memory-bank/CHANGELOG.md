# Changelog

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
