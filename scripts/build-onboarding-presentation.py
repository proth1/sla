#!/usr/bin/env python3
"""
Build the onboarding-only presentation by extracting slides from two sources:
  1. Strategic archive: framework/docs/presentations/strategic-esg-framework.html
  2. Onboarding reference: customers/fs-onboarding/presentations/reference/index.html

Outputs: docs/presentations/index.html (33 slides, 0-32)
"""
import re
import os

PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

STRATEGIC = os.path.join(PROJECT_DIR, "framework/docs/presentations/strategic-esg-framework.html")
ONBOARDING = os.path.join(PROJECT_DIR, "customers/fs-onboarding/presentations/reference/index.html")
PARTIAL = os.path.join(PROJECT_DIR, "docs/presentations/index.html")
OUTPUT = os.path.join(PROJECT_DIR, "docs/presentations/index.html")

def read_file(path):
    with open(path, 'r') as f:
        return f.read()

def extract_slides(html):
    """Extract slides as dict keyed by data-slide number."""
    # Split by slide divs. Each slide starts with <div class="slide... data-slide="N">
    # and ends just before the next slide or </main>
    slides = {}
    # Find all slide start positions
    pattern = re.compile(r'<div\s+class="slide[^"]*"\s+(?:style="[^"]*"\s+)?data-slide="(\d+)"', re.DOTALL)
    matches = list(pattern.finditer(html))

    for i, match in enumerate(matches):
        slide_num = int(match.group(1))
        start = match.start()
        # End is either start of next slide, or </main>, or end of file
        if i + 1 < len(matches):
            end = matches[i + 1].start()
        else:
            # Find </main> after this slide
            main_end = html.find('</main>', start)
            if main_end > 0:
                end = main_end
            else:
                # Find next <script> or </div> that closes the container
                end = len(html)

        slide_html = html[start:end].rstrip()
        # Remove trailing whitespace/newlines
        slides[slide_num] = slide_html

    return slides

def renumber_slide(html, new_num):
    """Change data-slide="X" to data-slide="new_num" in the slide HTML."""
    return re.sub(r'data-slide="\d+"', f'data-slide="{new_num}"', html, count=1)

def fix_footer(html, footer_text="Software Onboarding Governance"):
    """Standardize footer text."""
    html = html.replace("Enterprise Software Governance", footer_text)
    html = html.replace("Onboarding Acceleration Framework", footer_text)
    return html

def main():
    strategic_html = read_file(STRATEGIC)
    onboarding_html = read_file(ONBOARDING)
    partial_html = read_file(PARTIAL)

    strategic_slides = extract_slides(strategic_html)
    onboarding_slides = extract_slides(onboarding_html)

    # Slide mapping: new_num -> (source, original_slide_num)
    # s = strategic, o = onboarding, p = partial (already written)
    slide_map = [
        ('p', 0),    # 0: Hero
        ('p', 1),    # 1: Agenda
        ('o', 2),    # 2: Problem Statement
        ('o', 3),    # 3: Onboarding Vision
        ('o', 4),    # 4: 5-Phase Journey
        ('o', 5),    # 5: Phase 1
        ('o', 6),    # 6: Phase 2
        ('o', 7),    # 7: Phase 3
        ('o', 8),    # 8: Phase 4
        ('o', 9),    # 9: Phase 5
        ('o', 10),   # 10: Post-Onboarding
        ('s', 23),   # 11: RACI Matrix
        ('s', 37),   # 12: Governance Topic Heat Map
        ('s', 38),   # 13: Topic Journey: Intake
        ('s', 39),   # 14: Topic Journey: Prioritization
        ('s', 40),   # 15: Topic Journey: Funding
        ('s', 41),   # 16: Topic Journey: Sourcing
        ('s', 42),   # 17: Topic Journey: Cyber
        ('s', 43),   # 18: Topic Journey: EA
        ('s', 44),   # 19: Topic Journey: Compliance
        ('s', 45),   # 20: Topic Journey: AI Governance
        ('s', 46),   # 21: Topic Journey: Privacy
        ('s', 47),   # 22: Topic Journey: Commercial Counsel
        ('s', 48),   # 23: Topic Journey: TPRM
        ('s', 49),   # 24: Interactive Explorer
        ('o', 11),   # 25: DMN Framework
        ('o', 20),   # 26: Regulatory Alignment
        ('o', 21),   # 27: Cycle Time (D3)
        ('o', 22),   # 28: Automation Targets (D3)
        ('o', 15),   # 29: SLA Breach Escalation
        ('o', 16),   # 30: Lane Architecture
        ('o', 19),   # 31: Dependencies & Integrations
        ('o', 23),   # 32: CTA
    ]

    partial_slides = extract_slides(partial_html)

    # Additional CSS needed (heatmap, journey-rail, topic-pill, escalation-step)
    extra_css = """
/* Heatmap */
.heatmap-wrap { overflow-x: auto; }
.heatmap { border-collapse: collapse; width: 100%; font-size: 0.72rem; }
.heatmap th { background: var(--sla-deep-blue); color: white; padding: 7px 8px; text-align: center; font-weight: 600; white-space: nowrap; }
.heatmap th.topic-col { text-align: left; min-width: 130px; }
.heatmap td { padding: 0; height: 36px; position: relative; border: 1px solid #e2e8f0; }
.hm-cell { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; cursor: default; position: relative; }
.hm-cell.active { background: var(--sla-deep-blue); color: white; font-weight: 700; font-size: 0.9rem; }
.hm-cell.secondary { background: #93a5c0; color: white; font-weight: 600; font-size: 0.85rem; }
.hm-cell.empty { background: #f8fafc; }
.hm-cell .hm-tip { display: none; position: absolute; bottom: calc(100% + 6px); left: 50%; transform: translateX(-50%); background: var(--sla-navy); color: white; padding: 6px 10px; border-radius: 4px; font-size: 0.7rem; z-index: 200; box-shadow: 0 2px 8px rgba(0,0,0,0.3); line-height: 1.5; max-width: 280px; white-space: normal; }
.hm-cell .hm-tip::after { content: ''; position: absolute; top: 100%; left: 50%; transform: translateX(-50%); border: 5px solid transparent; border-top-color: var(--sla-navy); }
.hm-cell.active:hover .hm-tip { display: block; }
.heatmap td.topic-label { background: #f1f5f9; padding: 4px 10px; font-weight: 600; color: var(--sla-navy); font-size: 0.75rem; }
.hm-legend { display: flex; gap: 16px; align-items: center; margin-top: 8px; font-size: 0.72rem; color: var(--sla-gray); }
.hm-legend-box { width: 14px; height: 14px; border-radius: 2px; display: inline-block; margin-right: 4px; vertical-align: middle; }

/* Journey Rail */
.journey-rail { display: flex; gap: 6px; margin: 10px 0; align-items: stretch; }
.journey-phase { flex: 1; border-radius: 6px; padding: 8px; min-height: 90px; display: flex; flex-direction: column; }
.journey-phase.active { background: var(--sla-deep-blue); color: white; }
.journey-phase.inactive { background: #e8edf2; color: #94a3b8; }
.journey-phase .jp-label { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 4px; }
.journey-phase.active .jp-label { color: var(--sla-teal); }
.journey-phase.inactive .jp-label { color: #94a3b8; }
.journey-phase .jp-tasks { font-size: 0.62rem; line-height: 1.4; margin: 0; padding: 0; list-style: none; }
.journey-phase.active .jp-tasks li::before { content: '\203A '; color: var(--sla-gold); }
.journey-footer { margin-top: 8px; background: #f1f5f9; border-radius: 4px; padding: 8px 12px; display: flex; gap: 20px; flex-wrap: wrap; font-size: 0.7rem; }
.journey-footer-block { display: flex; flex-direction: column; gap: 2px; }
.journey-footer-block strong { color: var(--sla-navy); font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.3px; }
.journey-footer-block span { color: var(--sla-gray); }

/* Topic Explorer Pills */
.topic-pill { background:#e8edf2; border:none; border-radius:20px; padding:6px 14px; font-size:0.75rem; font-family:'Open Sans',sans-serif; cursor:pointer; color:#1e293b; transition:all 0.2s; font-weight:600; }
.topic-pill:hover { background:var(--sla-deep-blue); color:white; }
.topic-pill.active { background:var(--sla-deep-blue); color:white; }
.topic-phase-block { background:white; border-left:3px solid var(--sla-deep-blue); border-radius:3px; padding:6px 10px; font-size:0.72rem; }
.topic-phase-block strong { color:var(--sla-teal); display:block; margin-bottom:2px; font-size:0.68rem; text-transform:uppercase; letter-spacing:0.3px; }
.topic-phase-block ul { margin:0; padding-left:12px; color:var(--sla-gray); line-height:1.5; }
"""

    # Build the output file
    # Start with head section from partial (up to and including </style>)
    head_end = partial_html.find('</style>')
    head_section = partial_html[:head_end]

    # Add extra CSS before closing </style>
    head_section += extra_css + "\n</style>\n</head>\n<body>\n"

    # Navigation bar from partial
    nav_section = """
<!-- Navigation Bar -->
<div class="nav-bar">
  <span class="title">Software Onboarding Governance</span>
  <div class="nav-links">
    <a onclick="goToSlide(0)">Home</a>
    <a onclick="goToSlide(2)">Problem</a>
    <a onclick="goToSlide(4)">Phases</a>
    <a onclick="goToSlide(7)">Due Diligence</a>
    <a onclick="goToSlide(11)">RACI</a>
    <a onclick="goToSlide(12)">Heat Map</a>
    <a onclick="goToSlide(24)">Explorer</a>
    <a onclick="goToSlide(25)">DMN</a>
    <a onclick="goToSlide(32)">Next Steps</a>
  </div>
</div>

<!-- Slide Indicator (right-side dots) -->
<div class="slide-indicator" id="slideIndicator"></div>
<div class="slide-counter" id="slideCounter">1 / 33</div>

<main class="slides-container" id="slidesContainer">
"""

    # Assemble slides
    slides_html = []
    for new_num, (source, orig_num) in enumerate(slide_map):
        if source == 'p':
            slide = partial_slides.get(orig_num, '')
        elif source == 's':
            slide = strategic_slides.get(orig_num, '')
        elif source == 'o':
            slide = onboarding_slides.get(orig_num, '')
        else:
            slide = ''

        if not slide:
            print(f"WARNING: Missing slide source={source} orig={orig_num} -> new={new_num}")
            continue

        # Renumber
        slide = renumber_slide(slide, new_num)
        # Fix footer
        slide = fix_footer(slide)
        # Remove inline <style> blocks (we moved them to head) - for heatmap/journey slides
        slide = re.sub(r'<style>.*?</style>', '', slide, flags=re.DOTALL)
        slides_html.append(slide)

    # JavaScript section
    js_section = """
</main>

<!-- ============================================================ -->
<!-- JavaScript: Navigation + D3 Visualizations -->
<!-- ============================================================ -->
<script>
// Scroll-snap navigation
const slidesContainer = document.getElementById('slidesContainer');
const slides = document.querySelectorAll('.slide');
const totalSlides = slides.length;
const slideIndicator = document.getElementById('slideIndicator');

// Create right-side dot indicators
slides.forEach((slide, index) => {
  const dot = document.createElement('div');
  dot.className = 'slide-dot';
  dot.addEventListener('click', () => {
    slide.scrollIntoView({ behavior: 'smooth' });
  });
  slideIndicator.appendChild(dot);
});

// Track active slide on scroll
let currentSlide = 0;
const updateActiveDot = () => {
  const scrollPosition = slidesContainer.scrollTop;
  const windowHeight = window.innerHeight;
  let activeIndex = 0;
  slides.forEach((slide, index) => {
    if (scrollPosition >= slide.offsetTop - windowHeight / 2) {
      activeIndex = index;
    }
  });
  currentSlide = activeIndex;
  document.querySelectorAll('.slide-dot').forEach((dot, index) => {
    dot.classList.toggle('active', index === activeIndex);
  });
  document.getElementById('slideCounter').textContent = (activeIndex + 1) + ' / ' + totalSlides;
};

let scrollTicking = false;
slidesContainer.addEventListener('scroll', () => {
  if (!scrollTicking) {
    requestAnimationFrame(() => { updateActiveDot(); scrollTicking = false; });
    scrollTicking = true;
  }
});
updateActiveDot();

// goToSlide for nav-bar and TOC links
function goToSlide(n) {
  if (n < 0 || n >= totalSlides) return;
  slides[n].scrollIntoView({ behavior: 'smooth' });
}

// Keyboard navigation
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
    e.preventDefault();
    slidesContainer.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
  }
  if (e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'PageUp') {
    e.preventDefault();
    slidesContainer.scrollBy({ top: -window.innerHeight, behavior: 'smooth' });
  }
  if (e.key === 'Home') { e.preventDefault(); goToSlide(0); }
  if (e.key === 'End') { e.preventDefault(); goToSlide(totalSlides - 1); }
});

// D3 Visualizations with IntersectionObserver
const chartObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !entry.target.dataset.rendered) {
      entry.target.dataset.rendered = 'true';
      const chartId = entry.target.id;
      if (chartId === 'chartOnboardingCycleTime') renderOnboardingCycleTimeChart();
      if (chartId === 'chartOnboardingAutomation') renderOnboardingAutomationChart();
    }
  });
}, { root: slidesContainer, threshold: 0.3 });

document.querySelectorAll('.chart-container[id]').forEach(el => chartObserver.observe(el));

// Onboarding Cycle Time Chart (5 phases)
function renderOnboardingCycleTimeChart() {
  const container = d3.select('#chartOnboardingCycleTime');
  const width = container.node().clientWidth - 40;
  const height = 280;
  const svg = container.append('svg').attr('width', width).attr('height', height);

  const data = [
    { phase: 'Phase 1', baseline: 2, target: 1 },
    { phase: 'Phase 2', baseline: 5, target: 3 },
    { phase: 'Phase 3', baseline: 8, target: 5 },
    { phase: 'Phase 4', baseline: 10, target: 5 },
    { phase: 'Phase 5', baseline: 7, target: 5 }
  ];

  const phases = data.map(d => d.phase);
  const x0 = d3.scaleBand().domain(phases).range([60, width - 20]).padding(0.35);
  const x1 = d3.scaleBand().domain(['baseline', 'target']).range([0, x0.bandwidth()]).padding(0.05);
  const y = d3.scaleLinear().domain([0, 12]).range([height - 30, 10]);

  const groups = svg.selectAll('.group').data(data).enter().append('g')
    .attr('transform', d => `translate(${x0(d.phase)},0)`);

  groups.append('rect')
    .attr('x', x1('baseline')).attr('y', d => y(d.baseline))
    .attr('width', x1.bandwidth()).attr('height', d => height - 30 - y(d.baseline))
    .attr('fill', '#CBD5E1').attr('rx', 3);

  groups.append('rect')
    .attr('x', x1('target')).attr('y', d => y(d.target))
    .attr('width', x1.bandwidth()).attr('height', d => height - 30 - y(d.target))
    .attr('fill', '#059669').attr('rx', 3);

  groups.append('text')
    .attr('x', x1('baseline') + x1.bandwidth() / 2).attr('y', d => y(d.baseline) - 4)
    .attr('text-anchor', 'middle').attr('font-size', '11px').attr('fill', '#64748B')
    .text(d => d.baseline + 'd');

  groups.append('text')
    .attr('x', x1('target') + x1.bandwidth() / 2).attr('y', d => y(d.target) - 4)
    .attr('text-anchor', 'middle').attr('font-size', '11px').attr('font-weight', '600').attr('fill', '#059669')
    .text(d => d.target + 'd');

  svg.append('g').attr('transform', `translate(0,${height - 30})`).call(d3.axisBottom(x0)).selectAll('text').attr('font-size', '11px');
  svg.append('g').attr('transform', 'translate(55,0)').call(d3.axisLeft(y).ticks(6).tickFormat(d => d + 'd')).selectAll('text').attr('font-size', '10px');

  const legend = svg.append('g').attr('transform', `translate(${width - 200}, 12)`);
  legend.append('rect').attr('width', 12).attr('height', 12).attr('fill', '#CBD5E1').attr('rx', 2);
  legend.append('text').attr('x', 16).attr('y', 10).text('Current Baseline').attr('font-size', '11px').attr('fill', '#64748B');
  legend.append('rect').attr('x', 120).attr('width', 12).attr('height', 12).attr('fill', '#059669').attr('rx', 2);
  legend.append('text').attr('x', 136).attr('y', 10).text('Target').attr('font-size', '11px').attr('fill', '#059669');
}

// Onboarding Automation Chart (5 phases horizontal)
function renderOnboardingAutomationChart() {
  const container = d3.select('#chartOnboardingAutomation');
  const width = container.node().clientWidth - 40;
  const height = 280;
  const svg = container.append('svg').attr('width', width).attr('height', height);

  const data = [
    { phase: 'Phase 1: Intake', value: 75, color: '#059669' },
    { phase: 'Phase 2: Planning', value: 60, color: '#2563EB' },
    { phase: 'Phase 3: Due Diligence', value: 70, color: '#059669' },
    { phase: 'Phase 4: Governance', value: 40, color: '#D97706' },
    { phase: 'Phase 5: Contracting', value: 50, color: '#0891b2' }
  ];

  const margin = { left: 175, right: 60, top: 15, bottom: 25 };
  const x = d3.scaleLinear().domain([0, 100]).range([margin.left, width - margin.right]);
  const y = d3.scaleBand().domain(data.map(d => d.phase)).range([margin.top, height - margin.bottom]).padding(0.3);

  svg.selectAll('.bar-bg').data(data).enter().append('rect')
    .attr('x', margin.left).attr('y', d => y(d.phase))
    .attr('width', x(100) - margin.left).attr('height', y.bandwidth())
    .attr('fill', '#F1F5F9').attr('rx', 3);

  svg.selectAll('.bar').data(data).enter().append('rect')
    .attr('x', margin.left).attr('y', d => y(d.phase))
    .attr('width', d => x(d.value) - margin.left).attr('height', y.bandwidth())
    .attr('fill', d => d.color).attr('rx', 3).attr('opacity', 0.85);

  svg.selectAll('.val').data(data).enter().append('text')
    .attr('x', d => x(d.value) + 6).attr('y', d => y(d.phase) + y.bandwidth() / 2 + 4)
    .attr('font-size', '12px').attr('font-weight', '600').attr('fill', d => d.color)
    .text(d => d.value + '%');

  svg.selectAll('.label').data(data).enter().append('text')
    .attr('x', margin.left - 8).attr('y', d => y(d.phase) + y.bandwidth() / 2 + 4)
    .attr('text-anchor', 'end').attr('font-size', '11px').attr('fill', '#1E293B')
    .text(d => d.phase);

  svg.append('g').attr('transform', `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(5).tickFormat(d => d + '%')).selectAll('text').attr('font-size', '10px');
}
</script>
</body>
</html>
"""

    # Write output
    output = head_section + nav_section
    for slide in slides_html:
        output += "\n" + slide + "\n"
    output += js_section

    with open(OUTPUT, 'w') as f:
        f.write(output)

    print(f"Built {len(slides_html)} slides -> {OUTPUT}")
    print(f"File size: {len(output)} bytes, {output.count(chr(10))} lines")

if __name__ == '__main__':
    main()
