#!/usr/bin/env python3
"""
Transform the presentation to align with v8-c8 BPMN model:
1. Remove Camunda references (technology-neutral)
2. Replace BPMN section (slides 44-48) with process-story slides
3. Replace SP1/SP2 labels with actual sub-process names
4. Add forms story
5. Renumber all slides
"""
import re
import sys

INPUT = 'docs/presentations/index.html'
OUTPUT = 'docs/presentations/index.html'

with open(INPUT, 'r') as f:
    html = f.read()

# ─── 1. Remove Camunda references ──────────────────────────────────────
html = html.replace(
    '<td><strong>Camunda 8</strong> (target)</td><td>E2E process orchestration</td><td style="color:var(--brand-emerald);font-weight:600;">Target platform</td>',
    '<td><strong>Process Orchestration Engine</strong> (target)</td><td>E2E process orchestration</td><td style="color:var(--brand-emerald);font-weight:600;">Target platform</td>'
)
html = html.replace(
    'Camunda 8 orchestrates across all systems via API integration.',
    'Process orchestration engine coordinates across all systems via API integration.'
)

# ─── 2. Replace journey rail SP labels ──────────────────────────────────
SP_LABELS = {
    '<div class="jp-label">SP1</div>': '<div class="jp-label">Triage</div>',
    '<div class="jp-label">SP2</div>': '<div class="jp-label">Planning</div>',
    '<div class="jp-label">SP3</div>': '<div class="jp-label">Eval &amp; DD</div>',
    '<div class="jp-label">SP4</div>': '<div class="jp-label">Contract</div>',
    '<div class="jp-label">SP5</div>': '<div class="jp-label">Go-Live</div>',
}
for old, new in SP_LABELS.items():
    html = html.replace(old, new)

# ─── 3. Replace heatmap headers ──────────────────────────────────────────
html = html.replace(
    '<th>SP1<br><span style="font-weight:400;font-size:0.65rem;">Request and Triage</span></th>',
    '<th>Request<br><span style="font-weight:400;font-size:0.65rem;">and Triage</span></th>'
)
html = html.replace(
    '<th>SP2<br><span style="font-weight:400;font-size:0.65rem;">Planning and Routing</span></th>',
    '<th>Planning<br><span style="font-weight:400;font-size:0.65rem;">and Routing</span></th>'
)
html = html.replace(
    '<th>SP3<br><span style="font-weight:400;font-size:0.65rem;">Evaluation and DD</span></th>',
    '<th>Evaluation<br><span style="font-weight:400;font-size:0.65rem;">and Due Diligence</span></th>'
)
html = html.replace(
    '<th>SP4<br><span style="font-weight:400;font-size:0.65rem;">Contracting and Build</span></th>',
    '<th>Contracting<br><span style="font-weight:400;font-size:0.65rem;">and Build</span></th>'
)
html = html.replace(
    '<th>SP5<br><span style="font-weight:400;font-size:0.65rem;">UAT and Go-Live</span></th>',
    '<th>UAT<br><span style="font-weight:400;font-size:0.65rem;">and Go-Live</span></th>'
)

# ─── 4. Replace E2E flow SP labels ───────────────────────────────────────
html = html.replace('<h5>SP1: Request and Triage</h5>', '<h5>Request and Triage</h5>')
html = html.replace('<h5>SP2: Planning and Routing</h5>', '<h5>Planning and Routing</h5>')
html = html.replace('<h5>SP3: Evaluation and DD</h5>', '<h5>Evaluation and Due Diligence</h5>')
html = html.replace('<h5>SP4: Contracting and Build</h5>', '<h5>Contracting and Build</h5>')
html = html.replace('<h5>SP5: UAT and Go-Live</h5>', '<h5>UAT and Go-Live</h5>')

# ─── 5. Replace BPMN section (slides 44-48) with process story ──────────

# Find the section divider for "Process Models" (slide 44) through end of slide 48
section_start_marker = '<!-- SLIDE 38: Process Models & Decision Framework (Section) -->'
section_end_marker = '<!-- SLIDE 40: RACI Matrix -->'

start_idx = html.find(section_start_marker)
end_idx = html.find(section_end_marker)

if start_idx == -1 or end_idx == -1:
    # Try alternative markers
    section_start_marker = '<!-- ============================================================ -->\n<!-- SLIDE 38: Process Models'
    start_idx = html.find(section_start_marker)
    if start_idx == -1:
        # Find by data-slide="44"
        start_idx = html.find('<div class="slide slide-section" data-slide="44">')
        if start_idx > 0:
            # Back up to the comment before it
            prev_comment = html.rfind('<!-- ===', 0, start_idx)
            if prev_comment > 0:
                start_idx = prev_comment

    section_end_marker = '<!-- SLIDE 40: RACI Matrix'
    end_idx = html.find(section_end_marker)
    if end_idx == -1:
        # Find by data-slide="49"
        end_idx = html.find('<div class="slide" data-slide="49">')
        if end_idx > 0:
            prev_comment = html.rfind('<!-- ===', 0, end_idx)
            if prev_comment > 0:
                end_idx = prev_comment

if start_idx == -1 or end_idx == -1:
    print(f"ERROR: Could not find BPMN section boundaries. start={start_idx}, end={end_idx}")
    sys.exit(1)

print(f"Replacing BPMN section from char {start_idx} to {end_idx}")

# New process story slides (replacing slides 44-48 with 44-53)
NEW_PROCESS_SECTION = '''<!-- ============================================================ -->
<!-- SECTION: Future State Process Design -->
<!-- ============================================================ -->
<div class="slide slide-section" data-slide="44">
  <h2>Future State Process Design</h2>
  <p style="color:rgba(255,255,255,0.85);font-size:1rem;max-width:700px;margin-top:1rem;">A 5-phase hierarchical process model with 64 structured forms, 6 DMN decision tables, and parallel evaluation streams &mdash; reducing onboarding from 75 days to 20.</p>
  <div class="slide-footer"><span>Confidential</span><span>March 2026</span></div>
</div>

<!-- ============================================================ -->
<!-- SLIDE: End-to-End Orchestrator -->
<!-- ============================================================ -->
<div class="slide" data-slide="45">
  <h2>End-to-End Process Orchestrator</h2>
  <p style="font-size:0.82rem;color:var(--brand-medium-gray);">Hierarchical 5-phase model with collapsed sub-processes, 5 decision gateways, vendor pool with message flows, NDA gate, and 3 request type routing (Defined Need, Forced Update, Speculative).</p>
  <div style="background:white;border-radius:8px;padding:12px;box-shadow:0 2px 8px rgba(0,51,141,0.08);margin:0.5rem 0;overflow-x:auto;">
    <img src="bpmn-images/v8-orchestrator.png" alt="End-to-End Orchestrator" style="display:block;max-width:100%;height:auto;margin:0 auto;">
  </div>
  <div style="display:flex;gap:12px;margin-top:0.5rem;">
    <div style="flex:1;background:var(--brand-light-gray);border-radius:6px;padding:8px 12px;font-size:0.72rem;border-left:3px solid var(--brand-emerald);"><strong>64 Forms</strong> across 5 phases + vendor pool capture every data point, decision, and approval</div>
    <div style="flex:1;background:var(--brand-light-gray);border-radius:6px;padding:8px 12px;font-size:0.72rem;border-left:3px solid var(--brand-gold);"><strong>6 DMN Tables</strong> automate routing: risk tier, pathway, governance, prioritization, security, SLA escalation</div>
    <div style="flex:1;background:var(--brand-light-gray);border-radius:6px;padding:8px 12px;font-size:0.72rem;border-left:3px solid var(--brand-light-blue);"><strong>20-Day Target</strong> end-to-end cycle time (down from 75 days) through parallel evaluation and automated gates</div>
  </div>
  <div class="slide-footer"><span>Confidential</span><span>E2E Orchestrator</span></div>
</div>

<!-- ============================================================ -->
<!-- SLIDE: Request and Triage -->
<!-- ============================================================ -->
<div class="slide" data-slide="46">
  <h2>Request and Triage</h2>
  <p style="font-size:0.82rem;color:var(--brand-medium-gray);">The front door to onboarding. Requesters describe their need, existing solutions are checked for reuse, documentation is gathered, and requests are triaged, classified, and routed.</p>
  <div class="two-col" style="gap:16px;">
    <div>
      <div style="background:white;border-radius:8px;padding:8px;box-shadow:0 2px 8px rgba(0,51,141,0.08);overflow-x:auto;">
        <img src="bpmn-images/v8-sp1-request-triage.png" alt="Request and Triage" style="display:block;max-width:100%;height:auto;">
      </div>
      <div style="display:flex;gap:8px;margin-top:8px;">
        <span style="background:var(--brand-emerald);color:white;font-size:0.68rem;font-weight:700;padding:3px 10px;border-radius:12px;">2-Day SLA</span>
        <span style="background:var(--brand-medium-blue);color:white;font-size:0.65rem;padding:2px 8px;border-radius:10px;">DMN: Deal-Killer Pre-Screen</span>
      </div>
    </div>
    <div>
      <h3 style="font-size:0.95rem;margin-top:0;">Key Decisions</h3>
      <ul style="font-size:0.78rem;">
        <li><strong>Bypass Gate:</strong> Can an existing solution fulfill the need?</li>
        <li><strong>Completeness Gate:</strong> Automated validation before classification</li>
        <li><strong>Request Type:</strong> Defined Need &rarr; NDA &rarr; Planning | Forced Update &rarr; Fast-track | Speculative &rarr; Idea Funnel</li>
      </ul>
      <h3 style="font-size:0.95rem;">Forms &amp; Data Collected</h3>
      <div style="background:linear-gradient(135deg,#f0f4ff,#e8f0fe);border-left:4px solid var(--brand-gold);border-radius:8px;padding:10px 14px;">
        <div style="font-size:1.2rem;font-weight:700;color:var(--brand-blue);font-family:var(--font-heading);">8 Forms</div>
        <ul style="font-size:0.72rem;color:var(--brand-medium-gray);margin-left:1rem;margin-bottom:0;">
          <li><strong>Review Existing</strong> &mdash; catalog search, reuse decision, cost avoidance</li>
          <li><strong>Gather Documentation</strong> &mdash; business case, data classification, budget authorization</li>
          <li><strong>Completeness Gate</strong> &mdash; 6 automated validation checkpoints</li>
          <li><strong>Initial Triage</strong> &mdash; strategic alignment score, risk indicators, duplicate detection</li>
          <li><strong>Classify Request</strong> &mdash; type determination driving downstream routing</li>
        </ul>
      </div>
    </div>
  </div>
  <div class="slide-footer"><span>Confidential</span><span>Request and Triage</span></div>
</div>

<!-- ============================================================ -->
<!-- SLIDE: Planning and Routing -->
<!-- ============================================================ -->
<div class="slide" data-slide="47">
  <h2>Planning and Routing</h2>
  <p style="font-size:0.82rem;color:var(--brand-medium-gray);">Validated requests are analyzed for strategic fit, scored for priority, and routed to Buy, Build, or Enable pathways via DMN decision tables.</p>
  <div class="two-col" style="gap:16px;">
    <div>
      <div style="background:white;border-radius:8px;padding:8px;box-shadow:0 2px 8px rgba(0,51,141,0.08);overflow-x:auto;">
        <img src="bpmn-images/v8-sp2-planning-routing.png" alt="Planning and Routing" style="display:block;max-width:100%;height:auto;">
      </div>
      <div style="display:flex;gap:8px;margin-top:8px;">
        <span style="background:var(--brand-emerald);color:white;font-size:0.68rem;font-weight:700;padding:3px 10px;border-radius:12px;">3-Day SLA</span>
        <span style="background:var(--brand-medium-blue);color:white;font-size:0.65rem;padding:2px 8px;border-radius:10px;">DMN: Prioritization Scoring</span>
        <span style="background:var(--brand-medium-blue);color:white;font-size:0.65rem;padding:2px 8px;border-radius:10px;">DMN: Pathway Routing</span>
      </div>
    </div>
    <div>
      <h3 style="font-size:0.95rem;margin-top:0;">Key Decisions</h3>
      <ul style="font-size:0.78rem;">
        <li><strong>Needs Backlog?</strong> Does the request need full backlog prioritization or can it proceed directly?</li>
        <li><strong>Pathway Routing (DMN):</strong> Automated Buy / Build / Enable pathway assignment based on risk tier, complexity, and strategic alignment</li>
        <li><strong>Priority Scoring (DMN):</strong> Composite score driving resource allocation</li>
      </ul>
      <h3 style="font-size:0.95rem;">Forms &amp; Data Collected</h3>
      <div style="background:linear-gradient(135deg,#f0f4ff,#e8f0fe);border-left:4px solid var(--brand-gold);border-radius:8px;padding:10px 14px;">
        <div style="font-size:1.2rem;font-weight:700;color:var(--brand-blue);font-family:var(--font-heading);">2 Forms</div>
        <ul style="font-size:0.72rem;color:var(--brand-medium-gray);margin-left:1rem;margin-bottom:0;">
          <li><strong>Preliminary Analysis</strong> &mdash; business impact, risk appetite alignment, DPIA screening, capacity impact score, vendor affinity check</li>
          <li><strong>Backlog Prioritization</strong> &mdash; strategic value, urgency, resource availability, priority tier assignment</li>
        </ul>
      </div>
    </div>
  </div>
  <div class="slide-footer"><span>Confidential</span><span>Planning and Routing</span></div>
</div>

<!-- ============================================================ -->
<!-- SLIDE: Evaluation and Due Diligence -->
<!-- ============================================================ -->
<div class="slide" data-slide="48">
  <h2>Evaluation and Due Diligence</h2>
  <p style="font-size:0.82rem;color:var(--brand-medium-gray);">The most complex phase. Five parallel assessment streams evaluate simultaneously &mdash; eliminating the sequential bottleneck that currently takes 75 days.</p>
  <div style="background:white;border-radius:8px;padding:8px;box-shadow:0 2px 8px rgba(0,51,141,0.08);overflow-x:auto;margin-bottom:8px;">
    <img src="bpmn-images/v8-sp3-evaluation-dd.png" alt="Evaluation and Due Diligence" style="display:block;max-width:100%;height:auto;">
  </div>
  <div style="display:flex;gap:8px;margin-bottom:8px;">
    <span style="background:var(--brand-emerald);color:white;font-size:0.68rem;font-weight:700;padding:3px 10px;border-radius:12px;">5-Day SLA</span>
    <span style="background:var(--brand-medium-blue);color:white;font-size:0.65rem;padding:2px 8px;border-radius:10px;">5 Parallel Streams</span>
    <span style="background:var(--brand-gold);color:white;font-size:0.65rem;padding:2px 8px;border-radius:10px;">Shift-Left: All assessments simultaneous</span>
  </div>
  <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;">
    <div class="card" style="padding:10px;"><h4 style="font-size:0.72rem;">Tech Architecture</h4><p style="font-size:0.65rem;">Scalability, integration, enterprise standards</p></div>
    <div class="card" style="padding:10px;border-left-color:var(--brand-rose);"><h4 style="font-size:0.72rem;">Security</h4><p style="font-size:0.65rem;">Encryption, MFA, pen testing, SOC 2, incident response</p></div>
    <div class="card" style="padding:10px;border-left-color:var(--brand-amber);"><h4 style="font-size:0.72rem;">Risk &amp; Compliance</h4><p style="font-size:0.65rem;">GDPR, OCC 2023-17, DORA, data residency</p></div>
    <div class="card gold" style="padding:10px;"><h4 style="font-size:0.72rem;">Financial</h4><p style="font-size:0.65rem;">TCO, ROI, budget authorization, funding source</p></div>
    <div class="card emerald" style="padding:10px;"><h4 style="font-size:0.72rem;">Vendor Landscape</h4><p style="font-size:0.65rem;">Market research, shortlist, viability scoring</p></div>
  </div>
  <div class="slide-footer"><span>Confidential</span><span>Evaluation and Due Diligence</span></div>
</div>

<!-- ============================================================ -->
<!-- SLIDE: Evaluation Forms Deep Dive -->
<!-- ============================================================ -->
<div class="slide" data-slide="49">
  <h2>Evaluation: Forms and Data Architecture</h2>
  <p style="font-size:0.82rem;color:var(--brand-medium-gray);">The heaviest data collection phase: 8 structured forms capture 147+ fields across security, risk, financial, vendor, and AI governance dimensions.</p>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">
    <div style="background:linear-gradient(135deg,#f0f4ff,#e8f0fe);border-left:4px solid var(--brand-rose);border-radius:8px;padding:10px 12px;">
      <h4 style="font-size:0.78rem;color:var(--brand-rose);margin-bottom:4px;">Security Assessment</h4>
      <p style="font-size:0.68rem;color:var(--brand-medium-gray);margin:0;">25 fields across 6 groups</p>
      <ul style="font-size:0.65rem;color:var(--brand-medium-gray);margin:4px 0 0 14px;">
        <li>Security tier classification (6 levels)</li>
        <li>Encryption at rest/transit, key management</li>
        <li>Vulnerability scan results, pen test dates</li>
        <li>Breach history, incident response SLA</li>
        <li>SOC 2 Type II, ISO 27001 certifications</li>
      </ul>
    </div>
    <div style="background:linear-gradient(135deg,#f0f4ff,#e8f0fe);border-left:4px solid var(--brand-blue);border-radius:8px;padding:10px 12px;">
      <h4 style="font-size:0.78rem;color:var(--brand-blue);margin-bottom:4px;">Tech Architecture Review</h4>
      <p style="font-size:0.68rem;color:var(--brand-medium-gray);margin:0;">18 fields</p>
      <ul style="font-size:0.65rem;color:var(--brand-medium-gray);margin:4px 0 0 14px;">
        <li>Architecture pattern, deployment model</li>
        <li>Integration points, API compatibility</li>
        <li>Scalability and performance ratings</li>
        <li>Tech debt and maintainability assessment</li>
      </ul>
    </div>
    <div style="background:linear-gradient(135deg,#f0f4ff,#e8f0fe);border-left:4px solid var(--brand-amber);border-radius:8px;padding:10px 12px;">
      <h4 style="font-size:0.78rem;color:var(--brand-amber);margin-bottom:4px;">Risk, Compliance &amp; Legal</h4>
      <p style="font-size:0.68rem;color:var(--brand-medium-gray);margin:0;">15 fields</p>
      <ul style="font-size:0.65rem;color:var(--brand-medium-gray);margin:4px 0 0 14px;">
        <li>Regulatory exposure assessment</li>
        <li>Data residency, cross-border transfer</li>
        <li>Consent management, DPIA results</li>
        <li>OCC 2023-17 / DORA alignment</li>
      </ul>
    </div>
    <div style="background:linear-gradient(135deg,#f0f4ff,#e8f0fe);border-left:4px solid var(--brand-gold);border-radius:8px;padding:10px 12px;">
      <h4 style="font-size:0.78rem;color:var(--brand-gold);margin-bottom:4px;">Financial Analysis</h4>
      <p style="font-size:0.68rem;color:var(--brand-medium-gray);margin:0;">16 fields</p>
      <ul style="font-size:0.65rem;color:var(--brand-medium-gray);margin:4px 0 0 14px;">
        <li>Total cost of ownership model</li>
        <li>ROI projection, payback period</li>
        <li>Budget authorization chain</li>
        <li>Funding source identification</li>
      </ul>
    </div>
    <div style="background:linear-gradient(135deg,#f0f4ff,#e8f0fe);border-left:4px solid var(--brand-emerald);border-radius:8px;padding:10px 12px;">
      <h4 style="font-size:0.78rem;color:var(--brand-emerald);margin-bottom:4px;">AI Governance Review</h4>
      <p style="font-size:0.68rem;color:var(--brand-medium-gray);margin:0;">32 fields &mdash; largest single form</p>
      <ul style="font-size:0.65rem;color:var(--brand-medium-gray);margin:4px 0 0 14px;">
        <li>EU AI Act risk classification</li>
        <li>Model transparency, explainability</li>
        <li>Bias testing, fairness metrics</li>
        <li>SR 11-7 model risk alignment</li>
      </ul>
    </div>
    <div style="background:linear-gradient(135deg,#f0f4ff,#e8f0fe);border-left:4px solid var(--brand-light-blue);border-radius:8px;padding:10px 12px;">
      <h4 style="font-size:0.78rem;color:var(--brand-light-blue);margin-bottom:4px;">Vendor Due Diligence</h4>
      <p style="font-size:0.68rem;color:var(--brand-medium-gray);margin:0;">18 fields + vendor landscape (11 fields)</p>
      <ul style="font-size:0.65rem;color:var(--brand-medium-gray);margin:4px 0 0 14px;">
        <li>Financial stability, operational resilience</li>
        <li>Fourth-party risk, subcontractor disclosure</li>
        <li>Market positioning, viability scoring</li>
        <li>Weighted evaluation matrix</li>
      </ul>
    </div>
  </div>
  <div class="slide-footer"><span>Confidential</span><span>Evaluation Forms</span></div>
</div>

<!-- ============================================================ -->
<!-- SLIDE: Contracting and Build -->
<!-- ============================================================ -->
<div class="slide" data-slide="50">
  <h2>Contracting and Build</h2>
  <p style="font-size:0.82rem;color:var(--brand-medium-gray);">Two pathways converge here. <strong>Buy:</strong> refine requirements, proof of concept, contract negotiation. <strong>Build:</strong> define requirements, then the full Product Development Life Cycle (PDLC).</p>
  <div class="two-col" style="gap:16px;">
    <div>
      <div style="background:white;border-radius:8px;padding:8px;box-shadow:0 2px 8px rgba(0,51,141,0.08);overflow-x:auto;">
        <img src="bpmn-images/v8-sp4-contracting-build.png" alt="Contracting and Build" style="display:block;max-width:100%;height:auto;">
      </div>
      <div style="display:flex;gap:8px;margin-top:8px;">
        <span style="background:var(--brand-emerald);color:white;font-size:0.68rem;font-weight:700;padding:3px 10px;border-radius:12px;">7-Day SLA</span>
        <span style="background:var(--brand-medium-blue);color:white;font-size:0.65rem;padding:2px 8px;border-radius:10px;">Buy vs Build Pathways</span>
      </div>
    </div>
    <div>
      <h3 style="font-size:0.95rem;margin-top:0;">Buy Path Forms</h3>
      <div style="background:linear-gradient(135deg,#f0f4ff,#e8f0fe);border-left:4px solid var(--brand-blue);border-radius:8px;padding:10px 14px;margin-bottom:8px;">
        <div style="font-size:1rem;font-weight:700;color:var(--brand-blue);font-family:var(--font-heading);">5 Forms</div>
        <ul style="font-size:0.68rem;color:var(--brand-medium-gray);margin:4px 0 0 14px;">
          <li><strong>Refine Requirements</strong> &mdash; final spec from evaluation insights</li>
          <li><strong>Proof of Concept</strong> &mdash; structured PoC with pass/fail criteria</li>
          <li><strong>Negotiate Contract</strong> &mdash; OCC 2023-17, DORA Art. 30, GDPR Art. 28 provisions</li>
          <li><strong>Finalize Contract</strong> &mdash; internal approvals, term verification</li>
        </ul>
      </div>
      <h3 style="font-size:0.95rem;">Build Path Forms</h3>
      <div style="background:linear-gradient(135deg,#f0f4ff,#e8f0fe);border-left:4px solid var(--brand-emerald);border-radius:8px;padding:10px 14px;">
        <div style="font-size:1rem;font-weight:700;color:var(--brand-emerald);font-family:var(--font-heading);">5 Forms (PDLC)</div>
        <ul style="font-size:0.68rem;color:var(--brand-medium-gray);margin:4px 0 0 14px;">
          <li><strong>Define Build Requirements</strong> &mdash; functional specs, architecture constraints</li>
          <li><strong>Architecture Review</strong> &mdash; enterprise standards validation</li>
          <li><strong>Development</strong> &mdash; secure coding, CI/CD pipeline tracking</li>
          <li><strong>Testing &amp; Integration</strong> &mdash; test coverage, defect resolution, deployment</li>
        </ul>
      </div>
    </div>
  </div>
  <div class="slide-footer"><span>Confidential</span><span>Contracting and Build</span></div>
</div>

<!-- ============================================================ -->
<!-- SLIDE: UAT and Go-Live -->
<!-- ============================================================ -->
<div class="slide" data-slide="51">
  <h2>UAT and Go-Live</h2>
  <p style="font-size:0.82rem;color:var(--brand-medium-gray);">The finish line. User acceptance testing validates the solution, final approval confirms governance compliance, software is onboarded, ownership is assigned, and the request is formally closed.</p>
  <div class="two-col" style="gap:16px;">
    <div>
      <div style="background:white;border-radius:8px;padding:8px;box-shadow:0 2px 8px rgba(0,51,141,0.08);overflow-x:auto;">
        <img src="bpmn-images/v8-sp5-uat-golive.png" alt="UAT and Go-Live" style="display:block;max-width:100%;height:auto;">
      </div>
      <div style="display:flex;gap:8px;margin-top:8px;">
        <span style="background:var(--brand-emerald);color:white;font-size:0.68rem;font-weight:700;padding:3px 10px;border-radius:12px;">3-Day SLA</span>
        <span style="background:var(--brand-gold);color:white;font-size:0.65rem;padding:2px 8px;border-radius:10px;">Final Governance Gate</span>
      </div>
    </div>
    <div>
      <h3 style="font-size:0.95rem;margin-top:0;">Key Activities</h3>
      <ul style="font-size:0.78rem;">
        <li><strong>Pilot / UAT:</strong> Structured testing with pass/fail criteria, defect tracking, user satisfaction scoring</li>
        <li><strong>Final Approval:</strong> Third line of defense governance sign-off based on complete evidence package</li>
        <li><strong>Condition Verification:</strong> For conditional approvals, verify all conditions met before onboarding</li>
        <li><strong>Dual Ownership:</strong> Business Owner + Vendor Owner assigned at completion</li>
      </ul>
      <h3 style="font-size:0.95rem;">Forms &amp; Data Collected</h3>
      <div style="background:linear-gradient(135deg,#f0f4ff,#e8f0fe);border-left:4px solid var(--brand-gold);border-radius:8px;padding:10px 14px;">
        <div style="font-size:1.2rem;font-weight:700;color:var(--brand-blue);font-family:var(--font-heading);">6 Forms</div>
        <ul style="font-size:0.72rem;color:var(--brand-medium-gray);margin-left:1rem;margin-bottom:0;">
          <li><strong>Perform UAT</strong> &mdash; test scenarios, pass/fail rates, critical defects, user satisfaction (1-10)</li>
          <li><strong>Final Approval</strong> &mdash; governance sign-off, risk acceptance, audit evidence</li>
          <li><strong>Onboard Software</strong> &mdash; catalog entry, access provisioning, monitoring setup</li>
          <li><strong>Assign Ownership</strong> &mdash; Business Owner + Vendor Owner designation</li>
          <li><strong>Close Request</strong> &mdash; lessons learned, satisfaction survey, archive</li>
        </ul>
      </div>
    </div>
  </div>
  <div class="slide-footer"><span>Confidential</span><span>UAT and Go-Live</span></div>
</div>

<!-- ============================================================ -->
<!-- SLIDE: Vendor Pool Journey -->
<!-- ============================================================ -->
<div class="slide" data-slide="52">
  <h2>Vendor Pool: The External Partner Journey</h2>
  <p style="font-size:0.82rem;color:var(--brand-medium-gray);">Running in parallel with the enterprise process, vendors follow their own structured journey. 10 tasks span intake through deployment support, with message flows synchronizing handoffs at key milestones.</p>
  <div class="process-flow" style="margin:0.5rem 0;">
    <div style="width:24px;height:24px;border-radius:50%;background:var(--brand-emerald);border:2px solid #007a4d;flex-shrink:0;"></div>
    <span class="pf-arrow">&#9654;</span>
    <div class="pf-phase" style="min-width:95px;padding:8px;"><h5 style="font-size:0.62rem;">Vendor Intake</h5><div class="pf-tasks" style="font-size:0.55rem;">Qualification, sanctions screening</div></div>
    <span class="pf-arrow">&#9654;</span>
    <div class="pf-phase" style="min-width:95px;padding:8px;"><h5 style="font-size:0.62rem;">Proposal</h5><div class="pf-tasks" style="font-size:0.55rem;">Commercial &amp; technical response</div></div>
    <span class="pf-arrow">&#9654;</span>
    <div class="pf-phase" style="min-width:95px;padding:8px;"><h5 style="font-size:0.62rem;">Tech Demo</h5><div class="pf-tasks" style="font-size:0.55rem;">Structured evaluation</div></div>
    <span class="pf-arrow">&#9654;</span>
    <div class="pf-phase" style="min-width:95px;padding:8px;"><h5 style="font-size:0.62rem;">Security &amp; Compliance</h5><div class="pf-tasks" style="font-size:0.55rem;">Questionnaire + certifications</div></div>
    <span class="pf-arrow">&#9654;</span>
    <div class="pf-phase" style="min-width:95px;padding:8px;"><h5 style="font-size:0.62rem;">Contract</h5><div class="pf-tasks" style="font-size:0.55rem;">Review, negotiate, sign</div></div>
    <span class="pf-arrow">&#9654;</span>
    <div class="pf-phase" style="min-width:95px;padding:8px;"><h5 style="font-size:0.62rem;">Deploy &amp; Close</h5><div class="pf-tasks" style="font-size:0.55rem;">Onboarding, support, close</div></div>
    <span class="pf-arrow">&#9654;</span>
    <div style="width:24px;height:24px;border-radius:50%;background:var(--brand-rose);border:3px solid #8b1a1a;flex-shrink:0;"></div>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:8px;">
    <div style="background:linear-gradient(135deg,#f0f4ff,#e8f0fe);border-left:4px solid var(--brand-gold);border-radius:8px;padding:10px 14px;">
      <div style="font-size:1.2rem;font-weight:700;color:var(--brand-blue);font-family:var(--font-heading);">10 Vendor Forms</div>
      <ul style="font-size:0.68rem;color:var(--brand-medium-gray);margin:4px 0 0 14px;">
        <li><strong>Vendor Intake</strong> &mdash; legal entity, tax ID, ownership, sanctions screening, insurance</li>
        <li><strong>Security Questionnaire</strong> &mdash; SOC 2, pen testing, encryption, incident response</li>
        <li><strong>Compliance Documentation</strong> &mdash; regulatory certifications, DPA, sub-processor disclosures</li>
        <li><strong>Contract Execution</strong> &mdash; MSA, schedules, authorized signatory verification</li>
      </ul>
    </div>
    <div>
      <h3 style="font-size:0.95rem;margin-top:0;">Message Flow Handoffs</h3>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <div class="card" style="padding:8px;"><h4 style="font-size:0.7rem;">&#8594; Due Diligence Request</h4><p style="font-size:0.6rem;">Enterprise sends RFP/assessment requirements to vendor</p></div>
        <div class="card gold" style="padding:8px;"><h4 style="font-size:0.7rem;">&#8592; Vendor Response</h4><p style="font-size:0.6rem;">Vendor submits proposal and completed questionnaires</p></div>
        <div class="card emerald" style="padding:8px;"><h4 style="font-size:0.7rem;">&#8594; Contract Draft</h4><p style="font-size:0.6rem;">Enterprise sends negotiated contract for vendor review</p></div>
        <div class="card light-blue" style="padding:8px;"><h4 style="font-size:0.7rem;">&#8592; Signed Contract</h4><p style="font-size:0.6rem;">Vendor returns executed contract with authorized signature</p></div>
      </div>
    </div>
  </div>
  <div class="slide-footer"><span>Confidential</span><span>Vendor Pool</span></div>
</div>

<!-- ============================================================ -->
<!-- SLIDE: E2E Process Summary with Forms -->
<!-- ============================================================ -->
<div class="slide" data-slide="53">
  <h2>End-to-End Process Flow</h2>
  <p style="font-size:0.82rem;color:var(--brand-medium-gray);">5-phase hierarchical process model with 6 DMN decision tables, 3 request type routing, Buy/Build/Enable pathways, and parallel evaluation streams.</p>
  <div class="process-flow">
    <div style="width:28px;height:28px;border-radius:50%;background:var(--brand-emerald);border:2px solid #007a4d;flex-shrink:0;"></div>
    <span class="pf-arrow">&#9654;</span>
    <div class="pf-phase">
      <h5>Request and Triage</h5>
      <div class="pf-tasks">Review Existing, Gather Docs, Submit, Completeness Gate, Classify, Triage</div>
      <div class="pf-sla">SLA: 2 Days &bull; 8 Forms</div>
    </div>
    <span class="pf-arrow">&#9654;</span>
    <div class="pf-gateway"><span>?</span></div>
    <span class="pf-arrow">&#9654;</span>
    <div class="pf-phase" style="position:relative;">
      <h5>Planning and Routing</h5>
      <div class="pf-tasks">Preliminary Analysis, Backlog Priority, DMN Pathway Routing</div>
      <div class="pf-sla">SLA: 3 Days &bull; 2 Forms</div>
      <div class="pf-reject">Unacceptable Risk &#10005;</div>
    </div>
    <span class="pf-arrow">&#9654;</span>
    <div class="pf-gateway"><span>?</span></div>
    <span class="pf-arrow">&#9654;</span>
    <div class="pf-phase">
      <h5>Evaluation and Due Diligence</h5>
      <div class="pf-tasks">5 Parallel Streams: Tech, Security, Risk, Financial, Vendor + AI Gov Review</div>
      <div class="pf-sla">SLA: 5 Days &bull; 8 Forms</div>
    </div>
    <span class="pf-arrow">&#9654;</span>
    <div class="pf-gateway"><span>?</span></div>
    <span class="pf-arrow">&#9654;</span>
    <div class="pf-phase" style="position:relative;">
      <h5>Contracting and Build</h5>
      <div class="pf-tasks">Buy: Negotiate, PoC, Finalize | Build: Reqs, PDLC</div>
      <div class="pf-sla">SLA: 7 Days &bull; 10 Forms</div>
      <div class="pf-reject">Eval Failed &#10005;</div>
    </div>
    <span class="pf-arrow">&#9654;</span>
    <div class="pf-phase">
      <h5>UAT and Go-Live</h5>
      <div class="pf-tasks">UAT, Final Approval, Onboard, Assign Ownership, Close</div>
      <div class="pf-sla">SLA: 3 Days &bull; 6 Forms</div>
    </div>
    <span class="pf-arrow">&#9654;</span>
    <div style="width:28px;height:28px;border-radius:50%;background:var(--brand-rose);border:3px solid #8b1a1a;flex-shrink:0;display:flex;align-items:center;justify-content:center;">
      <div style="width:16px;height:16px;border-radius:50%;background:var(--brand-rose);border:2px solid white;"></div>
    </div>
  </div>
  <div class="card-grid" style="grid-template-columns:repeat(4,1fr);margin-top:1rem;">
    <div class="card">
      <h4>64 Structured Forms</h4>
      <p>Every data point, decision, and approval captured in structured fields &mdash; no email attachments, no PDFs, no manual handoffs</p>
    </div>
    <div class="card gold">
      <h4>6 DMN Decision Tables</h4>
      <p>Risk Tier, Pathway Routing, Governance Routing, Prioritization, Security Assessment, SLA Escalation</p>
    </div>
    <div class="card emerald">
      <h4>3 Pathways + 3 Request Types</h4>
      <p>Buy / Build / Enable pathways. Defined Need, Forced Update, Speculative routing</p>
    </div>
    <div class="card light-blue">
      <h4>20-Day E2E Target</h4>
      <p>Down from 75 days through parallel evaluation, automated gates, and DMN-driven routing</p>
    </div>
  </div>
  <div class="slide-footer"><span>Confidential</span><span>E2E Process Summary</span></div>
</div>

'''

html = html[:start_idx] + NEW_PROCESS_SECTION + html[end_idx:]

# ─── 6. Renumber all data-slide attributes ────────────────────────────────
# Find all data-slide= and renumber sequentially
slide_pattern = re.compile(r'data-slide="(\d+)"')
slide_count = 0

def renumber_slide(match):
    global slide_count
    result = f'data-slide="{slide_count}"'
    slide_count += 1
    return result

html = slide_pattern.sub(renumber_slide, html)
print(f"Renumbered {slide_count} slides (0 to {slide_count-1})")

# ─── 7. Update navigation bar goToSlide() indices ─────────────────────────
# Need to find the nav bar and update all goToSlide references
# First, let's find where key slides end up after renumbering
# We need to search for slide content to map new indices

def find_slide_index(content, search_text):
    """Find the data-slide number for a slide containing the given text."""
    idx = content.find(search_text)
    if idx == -1:
        return None
    # Look backwards for data-slide="N"
    before = content[:idx]
    match = re.search(r'data-slide="(\d+)"', before[-500:] if len(before) > 500 else before)
    if match:
        # Find the LAST match
        matches = list(re.finditer(r'data-slide="(\d+)"', before))
        if matches:
            return int(matches[-1].group(1))
    return None

# Find key slide indices
idx_home = 0
idx_exec = find_slide_index(html, 'Executive Summary')
idx_roadmap = find_slide_index(html, 'Implementation Roadmap')
idx_intake = find_slide_index(html, '>Intake: Current State')
if idx_intake is None:
    idx_intake = find_slide_index(html, '>Intake</h2>')
idx_prioritization = find_slide_index(html, '>Prioritization')
idx_finance = find_slide_index(html, '>Funding')
idx_sourcing = find_slide_index(html, '>Sourcing')
idx_cyber = find_slide_index(html, '>Cybersecurity')
idx_ea = find_slide_index(html, '>Enterprise Architecture')
idx_compliance = find_slide_index(html, '>Compliance')
idx_aigov = find_slide_index(html, '>AI Governance')
idx_privacy = find_slide_index(html, '>Privacy')
idx_legal = find_slide_index(html, '>Commercial Counsel')
idx_tprm = find_slide_index(html, '>Third-Party Risk')
idx_bpmn = find_slide_index(html, 'Future State Process Design')
idx_raci = find_slide_index(html, 'RACI Matrix')
idx_dmn = find_slide_index(html, 'DMN Decision Tables')

print(f"Nav indices: Home={idx_home}, Exec={idx_exec}, Roadmap={idx_roadmap}")
print(f"  Intake={idx_intake}, Prioritization={idx_prioritization}, Finance={idx_finance}")
print(f"  Sourcing={idx_sourcing}, Cyber={idx_cyber}, EA={idx_ea}")
print(f"  Compliance={idx_compliance}, AI Gov={idx_aigov}, Privacy={idx_privacy}")
print(f"  Legal={idx_legal}, TPRM={idx_tprm}")
print(f"  BPMN={idx_bpmn}, RACI={idx_raci}, DMN={idx_dmn}")

# Update nav bar - find and replace the nav-links section
nav_start = html.find('<div class="nav-links">')
nav_end = html.find('</div>', nav_start) + len('</div>')
old_nav = html[nav_start:nav_end]

# Build new nav content
new_nav = f'''<div class="nav-links">
    <a onclick="goToSlide(0)">Home</a>
    <a onclick="goToSlide({idx_exec})">Executive Summary</a>
    <a onclick="goToSlide({idx_roadmap or 9})">Roadmap</a>
    <a onclick="goToSlide({idx_intake or 10})">Intake</a>
    <a onclick="goToSlide({idx_prioritization or 11})">Prioritization</a>
    <a onclick="goToSlide({idx_finance or 12})">Finance</a>
    <a onclick="goToSlide({idx_sourcing or 13})">Sourcing</a>
    <a onclick="goToSlide({idx_cyber or 14})">Cyber</a>
    <a onclick="goToSlide({idx_ea or 15})">EA</a>
    <a onclick="goToSlide({idx_compliance or 16})">Compliance</a>
    <a onclick="goToSlide({idx_aigov or 17})">AI Gov</a>
    <a onclick="goToSlide({idx_privacy or 18})">Privacy</a>
    <a onclick="goToSlide({idx_legal or 19})">Legal</a>
    <a onclick="goToSlide({idx_tprm or 20})">TPRM</a>
    <a onclick="goToSlide({idx_bpmn or 44})">Process</a>
    <a onclick="goToSlide({idx_raci or 54})">RACI</a>
    <a onclick="goToSlide({idx_dmn or 56})">DMN</a>
  </div>'''

html = html[:nav_start] + new_nav + html[nav_end:]

# ─── 8. Update slide counter ──────────────────────────────────────────────
html = re.sub(r'1 / \d+', f'1 / {slide_count}', html)

# ─── 9. Update Interactive Explorer SP references ──────────────────────────
# In topicData JS, replace "SP1: Request and Triage" etc. with just the phase name
html = html.replace('"SP1: Request and Triage"', '"Request and Triage"')
html = html.replace('"SP2: Planning and Routing"', '"Planning and Routing"')
html = html.replace('"SP3: Evaluation and DD"', '"Evaluation and Due Diligence"')
html = html.replace('"SP4: Contracting and Build"', '"Contracting and Build"')
html = html.replace('"SP5: UAT and Go-Live"', '"UAT and Go-Live"')

# ─── 10. Update hero slide badge count ─────────────────────────────────────
# Add forms badge if not present
if '64 Structured Forms' not in html:
    html = html.replace(
        '<span style="opacity:0.7;font-size:0.85rem;">5 Collapsed Sub-Processes',
        '<span style="opacity:0.7;font-size:0.85rem;">64 Structured Forms &bull; 5 Collapsed Sub-Processes'
    )

# Write output
with open(OUTPUT, 'w') as f:
    f.write(html)

print(f"\nDone! Written to {OUTPUT}")
print(f"Total slides: {slide_count}")
