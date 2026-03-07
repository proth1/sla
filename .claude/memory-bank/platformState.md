# Platform State

**Current Version**: 2026.03.35
**Last Release**: 2026-03-07
**Total Releases**: 35

## Artifact Counts

| Artifact | Count |
|----------|-------|
| DMN Decision Tables | 8 |
| BPMN Process Models | 10 |
| Cross-Cutting Sub-Processes | 5 |
| Presentation Slides | 32 |
| BPMN SVG Diagrams | 17 |
| Regulatory Frameworks | 13 |
| Pools | 2 |
| Swim Lanes | 9+1 |
| Governance Phases | 8 |

## Deployment

| Target | URL | Status |
|--------|-----|--------|
| Auth Worker | sla-presentation-auth.proth1.workers.dev | Deployed |
| Pages | sla-presentation.pages.dev | Deployed |
| Public | sla.agentic-innovations.com | OTP-protected |
| Onboarding Auth | sla-onboarding-auth.proth1.workers.dev | Deployed |
| Onboarding Pages | sla-onboarding.pages.dev | Deployed |
| Onboarding Public | onboarding.agentic-innovations.com | OTP-protected (kpmg.com) |

## Recent Releases

| Version | Date | PR | Summary |
|---------|------|----|---------|
| 2026.03.35 | 2026-03-07 | #45 | Camunda 8 deployment compatibility: JUEL→FEEL, gateway defaults, message refs |
| 2026.03.34 | 2026-03-06 | #44 | v8 BPMN (6 enhancements), 24-gap analysis, 62-slide presentation, implementation roadmap |
| 2026.03.33 | 2026-03-06 | #43 | Fix Enable pathway routing, wire 4 orphaned forms, SP4/SP5 flow fixes |
| 2026.03.32 | 2026-03-06 | #41 | v7-c8 BPMN discovery enhancements, 5 meeting notes, 3 DMN tables, showcase |
| 2026.03.31 | 2026-03-06 | #42 | KPMG presentation rebrand, 22 BPMN images, PPTX export, auth domain update |
| 2026.03.30 | 2026-03-06 | #39 | 32-slide presentation redesign, 7 BPMN SVGs, discovery docs, kpmg.com auth, showcase app |
| 2026.03.29 | 2026-03-06 | #38 | Monorepo restructure, 33-slide onboarding presentation, 39 forms, onboarding auth worker |
| 2026.03.28 | 2026-03-05 | #37 | Add /review-model slash command for BPMN change review |
| 2026.03.27 | 2026-03-05 | #35 | Codify hierarchical sub-process BPMN modeling patterns from v5 reference model |
| 2026.03.26 | 2026-03-05 | #25 | Onboarding v4: vendor sequencing fix, receive tasks with SLA timers, modeling rules |
| 2026.03.25 | 2026-03-05 | #33 | Auth worker: SLA_SESSION HMAC cookie (8h), OTP verify rate limiting |
| 2026.03.24 | 2026-03-05 | #32 | BPMN governance patterns: phase boundaries (P1/P2), escalation fix, label overlaps |
| 2026.03.23 | 2026-03-05 | #31 | CDD evidence hook: replace grep+awk YAML parsing with python3 |
| 2026.03.22 | 2026-03-05 | #30 | Phase 6: fix HIGH severity end event illegal outgoing flow |
| 2026.03.21 | 2026-03-04 | #34 | Onboarding v3: fix 5 visual layout issues (backward flows, lane positioning, pool gap) |
| 2026.03.20 | 2026-03-04 | #29 | Onboarding v3: merge requester pool into software onboarding pool as swim lane |
| 2026.03.19 | 2026-03-04 | #28 | All-pool task documentation: 28 tasks across Requester, Product Mgmt, PDLC pools |
| 2026.03.18 | 2026-03-04 | #27 | Vendor task documentation v2: 10 tasks with regulatory controls and evidence requirements |
| 2026.03.17 | 2026-03-04 | #26 | Onboarding-only customer project: 4 DMN tables, 7 BPMNs, 22-slide presentation |
| 2026.03.16 | 2026-03-04 | #22,#23,#24 | Code audit fixes: 33 findings across validators, BPMN governance, infra security |
| 2026.03.15 | 2026-03-04 | #21 | Phase 8 Operations BPMN layout fix: expanded Automation lane, fixed start event routing |
| 2026.03.14 | 2026-03-04 | #20 | Presentation upgrades: CTA rewrite, competitive positioning, BPMN legend, persona anchors |
| 2026.03.13 | 2026-03-04 | #19 | DMN quality fixes: UNIQUE→FIRST for DMN-1/2/6, catch-all defaults, governance metadata |
| 2026.03.12 | 2026-03-04 | #17 | Fix hero subtitle visibility + scroll-snap navigation conversion |
| 2026.03.11 | 2026-03-04 | #16 | Layout rewrite: compact phases 2, 5-8 BPMN + project artifacts |
| 2026.03.10 | 2026-03-04 | #15 | Integrate security scanner into pr-orchestrator Phase 0.5 |
| 2026.03.9 | 2026-03-04 | #14 | Security scanning & hardening for BPMN/DMN pipeline |
