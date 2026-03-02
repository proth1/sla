# Changelog

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
