---
name: sla-presentation
description: Generate and update the SLA Governance master HTML presentation with brand-compliant styling
tools: Read, Write, Edit, Bash
user_invocable: true
---

# SLA Presentation Skill

## Brand System

| Token | Value | Usage |
|-------|-------|-------|
| `--sla-navy` | `#0F1E3C` | Hero backgrounds, dark sections |
| `--sla-deep-blue` | `#1A3A6B` | Nav bar, slide headers |
| `--sla-blue` | `#2563EB` | Primary accent, links |
| `--sla-gold` | `#D97706` | Phase markers, governance badges |
| `--sla-emerald` | `#059669` | Fast-Track pathway, compliance pass |
| `--sla-rose` | `#DC2626` | Risk indicators, alerts |

## Fonts
- Headings: Open Sans Condensed (Google Fonts)
- Body: Open Sans (Google Fonts)

## Template
The master presentation lives at `docs/presentations/index.html`.
Do NOT regenerate it from scratch — edit the existing template.

## D3.js Visualizations
6 D3 visualizations are embedded:
1. Phase flow diagram (7-phase horizontal flow)
2. Cycle time bar chart (before/after comparison)
3. Pathway decision tree (4 pathways)
4. Risk radar chart (6 risk dimensions)
5. Regulatory force graph (frameworks ↔ phases)
6. Implementation Gantt chart

## Slide Structure (30 slides in 8 sections)
1. Executive Framing (4): Hero, TOC, Problem, Vision
2. Value Proposition (3): Before/After, Cycle Time, Stakes
3. 7-Phase BPMN Workflow (9): Overview + Phase 0-6 + Swim Lanes
4. Decision Intelligence (5): DMN Overview, Pathways, Risk Radar, Agent Decisions
5. Software Registry (3): Asset Hub, Data Model, Timeline
6. Regulatory Alignment (3): Matrix, Deep Dives, Evidence Chain
7. Implementation Roadmap (2): Gantt, Metrics
8. Close (1): Final hero
