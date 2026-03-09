#!/usr/bin/env python3
"""
Reduce presentation from 67 slides to ~41 by:
1. Removing 13 section divider slides
2. Merging 11 governance topic pairs (Current State + Recommendations) into single two-col slides
3. Consolidating 4 DMN slides into 2
4. Renumbering all slides and updating navigation references
"""
import re
import sys

INPUT = OUTPUT = 'docs/presentations/index.html'

with open(INPUT, 'r') as f:
    html = f.read()

print(f"Starting slide count: {len(re.findall(r'data-slide=', html))}")

# ─── Helper: extract a slide block ────────────────────────────────────────
def extract_slide_block(html, slide_num):
    """Extract the full HTML block for a given data-slide number, including any preceding comment."""
    marker = f'data-slide="{slide_num}"'
    idx = html.find(marker)
    if idx == -1:
        return None, -1, -1

    # Find the opening <div of this slide
    div_start = html.rfind('<div ', max(0, idx - 200), idx)
    if div_start == -1:
        return None, -1, -1

    # Back up to include preceding comment block
    block_start = div_start
    before = html[:div_start].rstrip()
    if before.endswith('-->'):
        comment_start = before.rfind('<!-- ==')
        if comment_start >= 0 and div_start - comment_start < 500:
            block_start = comment_start

    # Find closing </div> of the slide (track div nesting)
    depth = 0
    i = div_start
    while i < len(html):
        if html[i:i+4] == '<div':
            depth += 1
        elif html[i:i+6] == '</div>':
            depth -= 1
            if depth == 0:
                block_end = i + 6
                # Include trailing newlines
                while block_end < len(html) and html[block_end] in '\r\n':
                    block_end += 1
                return html[block_start:block_end], block_start, block_end
        i += 1
    return None, -1, -1


def extract_slide_content(html, slide_num):
    """Extract just the content between the outer slide div tags."""
    block, _, _ = extract_slide_block(html, slide_num)
    if block is None:
        return None
    # Find first > after data-slide
    start = block.find('>') + 1
    end = block.rfind('</div>')
    return block[start:end]


# ─── 1. Remove 13 section divider slides ──────────────────────────────────
SECTION_DIVIDERS = [6, 11, 14, 17, 20, 23, 26, 29, 32, 35, 38, 41, 44]

for slide_num in sorted(SECTION_DIVIDERS, reverse=True):
    block, start, end = extract_slide_block(html, slide_num)
    if block and 'slide-section' in block:
        html = html[:start] + html[end:]
        print(f"  Removed section divider slide {slide_num}")
    else:
        print(f"  WARNING: Slide {slide_num} not found or not a section divider")

print(f"After removing dividers: {len(re.findall(r'data-slide=', html))}")

# ─── 2. Merge 11 governance topic pairs ───────────────────────────────────
# After removing dividers, the original slide numbers still exist in data-slide attrs
# Topic pairs: (current_state_slide, recommendations_slide, topic_name)
TOPIC_PAIRS = [
    (12, 13, "Intake"),
    (15, 16, "Prioritization"),
    (18, 19, "Funding / Finance"),
    (21, 22, "Sourcing"),
    (24, 25, "Cybersecurity"),
    (27, 28, "Enterprise Architecture"),
    (30, 31, "Compliance"),
    (33, 34, "AI Governance"),
    (36, 37, "Privacy"),
    (39, 40, "Commercial Counsel"),
    (42, 43, "Third-Party Risk Management"),
]

def extract_findings(content):
    """Extract finding divs from content (excluding finding-grid wrapper)."""
    findings = re.findall(r'<div class="finding(?: positive)?">(.*?)</div>', content, re.DOTALL)
    return findings

def extract_raci(content):
    """Extract RACI line from content."""
    match = re.search(r'<p class="small muted"><strong>RACI</strong>.*?</p>', content, re.DOTALL)
    return match.group(0) if match else ''

def extract_quote(content):
    """Extract quote block from content."""
    match = re.search(r'<div class="quote-block">.*?</div>', content, re.DOTALL)
    return match.group(0) if match else ''

def extract_rec_cards(content):
    """Extract recommendation cards as full inner HTML."""
    # Match from <div class="rec-card"> through its content (h4, p, impact div)
    # The rec-card contains <h4>, <p>, and <div class="impact"> children
    cards = re.findall(r'<div class="rec-card">(<h4>.*?</div>)</div>', content, re.DOTALL)
    if not cards:
        # Fallback: match to the next closing </div>
        cards = re.findall(r'<div class="rec-card">(.*?)</div>', content, re.DOTALL)
    return cards

def extract_roadmap_items(content):
    """Extract roadmap phase items as (label, items_html) tuples."""
    phases = re.findall(r'<div class="roadmap-phase (d\d+)"><h4>(\d+ Days)</h4><ul>(.*?)</ul></div>', content, re.DOTALL)
    return phases

def build_merged_slide(topic_name, current_content, recs_content):
    """Build a merged two-column slide from current state and recommendations content."""
    findings = extract_findings(current_content)
    raci = extract_raci(current_content)
    quote = extract_quote(current_content)
    rec_cards = extract_rec_cards(recs_content)
    roadmap = extract_roadmap_items(recs_content)

    # Build condensed findings (max 4, shortened)
    findings_html = ''
    for f in findings[:4]:
        findings_html += f'      <div class="finding" style="padding:6px 8px;font-size:0.68rem;line-height:1.4;">{f}</div>\n'

    # Build condensed rec cards (max 4)
    recs_html = ''
    for c in rec_cards[:4]:
        # Condense: extract h4 and first sentence of p
        h4_match = re.search(r'<h4>(.*?)</h4>', c)
        p_match = re.search(r'<p>(.*?)</p>', c, re.DOTALL)
        impact_match = re.search(r'<div class="impact">(.*?)</div>', c, re.DOTALL)
        h4 = h4_match.group(1) if h4_match else ''
        p_text = p_match.group(1) if p_match else ''
        # Truncate p to ~80 chars
        if len(p_text) > 100:
            p_text = p_text[:97] + '...'
        impact = impact_match.group(0) if impact_match else ''
        recs_html += f'      <div class="rec-card" style="padding:8px 10px;"><h4 style="font-size:0.78rem;">{h4}</h4><p style="font-size:0.65rem;">{p_text}</p>{impact}</div>\n'

    # Build compact roadmap badges
    roadmap_html = ''
    if roadmap:
        roadmap_html = '<div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap;">'
        for cls, label, items in roadmap:
            # Extract first li text
            first_li = re.search(r'<li>(.*?)</li>', items)
            summary = first_li.group(1) if first_li else ''
            if len(summary) > 40:
                summary = summary[:37] + '...'
            color_map = {'d30': 'var(--brand-emerald)', 'd60': 'var(--brand-medium-blue)', 'd90': 'var(--brand-gold)', 'd120': 'var(--brand-amber)'}
            color = color_map.get(cls, 'var(--brand-medium-gray)')
            roadmap_html += f'<span style="background:{color};color:white;font-size:0.58rem;padding:2px 8px;border-radius:10px;white-space:nowrap;">{label}</span>'
        roadmap_html += '</div>'

    # RACI as compact line
    raci_html = ''
    if raci:
        raci_html = f'<div style="font-size:0.62rem;color:var(--brand-medium-gray);margin-top:4px;">{raci}</div>'

    slide = f'''<div class="slide" data-slide="PLACEHOLDER">
  <h2 style="border-left:4px solid var(--brand-blue);padding-left:12px;">{topic_name}</h2>
  <div class="two-col" style="gap:20px;align-items:start;">
    <div>
      <h3 style="font-size:1rem;color:var(--brand-rose);margin-top:0;">Current State</h3>
      <div class="finding-grid" style="grid-template-columns:1fr;gap:6px;">
{findings_html}      </div>
      {raci_html}
    </div>
    <div>
      <h3 style="font-size:1rem;color:var(--brand-emerald);margin-top:0;">Recommendations</h3>
      <div class="rec-grid" style="grid-template-columns:1fr;gap:6px;">
{recs_html}      </div>
      {roadmap_html}
    </div>
  </div>
  <div class="slide-footer"><span>Confidential</span><span>{topic_name}</span></div>
</div>'''
    return slide


# Process each topic pair (reverse order to preserve positions)
for current_slide, recs_slide, topic in reversed(TOPIC_PAIRS):
    current_block, cs_start, cs_end = extract_slide_block(html, current_slide)
    recs_block, rs_start, rs_end = extract_slide_block(html, recs_slide)

    if current_block is None or recs_block is None:
        print(f"  WARNING: Could not find slides {current_slide}/{recs_slide} for {topic}")
        continue

    current_content = current_block
    recs_content = recs_block
    merged = build_merged_slide(topic, current_content, recs_content)

    # Replace both slides with the merged one
    # recs_slide comes after current_slide, so remove recs first
    html = html[:rs_start] + html[rs_end:]
    # Now re-find current_slide position (it hasn't moved)
    _, cs_start2, cs_end2 = extract_slide_block(html, current_slide)
    html = html[:cs_start2] + merged + '\n\n' + html[cs_end2:]
    print(f"  Merged {topic} (slides {current_slide}+{recs_slide})")

print(f"After merging topics: {len(re.findall(r'data-slide=', html))}")

# ─── 3. Consolidate 4 DMN slides into 2 ──────────────────────────────────
# Slide 56 (Risk Tier) + Slide 58 (SLA Breach) → merged slide A
# Slide 57 (Pathway/Governance) + Slide 59 (Prioritization/Security) → merged slide B
# Note: slides 57 and 59 are already two-column, so we combine them differently

# DMN Slide A: Risk Tier + SLA Breach
dmn56_block, d56_start, d56_end = extract_slide_block(html, 56)
dmn58_block, d58_start, d58_end = extract_slide_block(html, 58)

if dmn56_block and dmn58_block:
    # Extract the table from slide 56 (Risk Tier)
    risk_tier_table = re.search(r'(<table class="dmn-table">.*?</table>)', dmn56_block, re.DOTALL)
    # Extract the table from slide 58 (SLA Breach)
    sla_breach_table = re.search(r'(<table class="dmn-table">.*?</table>)', dmn58_block, re.DOTALL)

    if risk_tier_table and sla_breach_table:
        merged_dmn_a = f'''<div class="slide" data-slide="PLACEHOLDER">
  <h2>DMN Decision Tables: Risk Tier &amp; SLA Breach Escalation</h2>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
    <div>
      <div class="dmn-header">
        <h4>OB-DMN-1: Risk Tier Classification</h4>
        <span class="dmn-badge">UNIQUE</span>
        <span class="dmn-badge" style="background:var(--brand-medium-blue);">Phase 2</span>
      </div>
      <p style="font-size:0.68rem;color:var(--brand-medium-gray);margin-bottom:4px;">5 risk dimensions (1-10) assign one of 4 tiers. Unacceptable terminates immediately.</p>
      {risk_tier_table.group(1)}
    </div>
    <div>
      <div class="dmn-header">
        <h4>OB-DMN-4: SLA Breach Escalation</h4>
        <span class="dmn-badge">FIRST</span>
        <span class="dmn-badge" style="background:var(--brand-medium-blue);">Cross-Cutting</span>
      </div>
      <p style="font-size:0.68rem;color:var(--brand-medium-gray);margin-bottom:4px;">4-level escalation ladder triggered by SLA timer boundary events.</p>
      {sla_breach_table.group(1)}
    </div>
  </div>
  <div class="slide-footer"><span>Confidential</span><span>OB-DMN-1 and OB-DMN-4</span></div>
</div>'''

        # Remove slide 58 first (comes after 56)
        html = html[:d58_start] + html[d58_end:]
        # Re-find and replace slide 56
        _, d56_start2, d56_end2 = extract_slide_block(html, 56)
        html = html[:d56_start2] + merged_dmn_a + '\n\n' + html[d56_end2:]
        print("  Merged DMN slides 56+58 (Risk Tier + SLA Breach)")

# DMN Slide B: Pathway/Governance (57) + Prioritization/Security (59) are already two-col each
# Merge them into a single slide with 4 smaller tables
dmn57_block, d57_start, d57_end = extract_slide_block(html, 57)
dmn59_block, d59_start, d59_end = extract_slide_block(html, 59)

if dmn57_block and dmn59_block:
    # Slides 57 and 59 already have 2-column grids with two tables each
    # Extract the inner grid content from each
    grid57 = re.search(r'<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">(.*?)</div>\s*<div class="slide-footer">', dmn57_block, re.DOTALL)
    grid59 = re.search(r'<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">(.*?)</div>\s*<div class="slide-footer">', dmn59_block, re.DOTALL)

    if grid57 and grid59:
        merged_dmn_b = f'''<div class="slide" data-slide="PLACEHOLDER">
  <h2>DMN Decision Tables: Pathway, Governance, Prioritization, Security</h2>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
    {grid57.group(1)}
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px;">
    {grid59.group(1)}
  </div>
  <div class="slide-footer"><span>Confidential</span><span>OB-DMN-2, 3, 5, 6</span></div>
</div>'''

        # Remove slide 59 first
        html = html[:d59_start] + html[d59_end:]
        # Re-find and replace slide 57
        _, d57_start2, d57_end2 = extract_slide_block(html, 57)
        html = html[:d57_start2] + merged_dmn_b + '\n\n' + html[d57_end2:]
        print("  Merged DMN slides 57+59 (Pathway/Gov + Priority/Security)")

print(f"After DMN consolidation: {len(re.findall(r'data-slide=', html))}")

# ─── 4. Renumber all data-slide attributes ────────────────────────────────
slide_count = 0
def renumber_slide(match):
    global slide_count
    result = f'data-slide="{slide_count}"'
    slide_count += 1
    return result

html = re.sub(r'data-slide="[^"]*"', renumber_slide, html)
print(f"Renumbered {slide_count} slides (0 to {slide_count-1})")

# ─── 5. Update slide counter ─────────────────────────────────────────────
html = re.sub(r'1 / \d+', f'1 / {slide_count}', html)

# ─── 6. Helper to find slide index by content ────────────────────────────
def find_slide_by_content(html, text):
    """Find the data-slide number for a slide containing the given text."""
    idx = html.find(text)
    if idx == -1:
        return None
    before = html[:idx]
    matches = list(re.finditer(r'data-slide="(\d+)"', before))
    if matches:
        return int(matches[-1].group(1))
    return None

# ─── 7. Update nav-links ─────────────────────────────────────────────────
# Use h2 tags to find actual slides (not agenda links)
idx_intake = find_slide_by_content(html, 'padding-left:12px;">Intake</h2>')
idx_prioritization = find_slide_by_content(html, 'padding-left:12px;">Prioritization</h2>')
idx_finance = find_slide_by_content(html, 'padding-left:12px;">Funding / Finance</h2>')
idx_sourcing = find_slide_by_content(html, 'padding-left:12px;">Sourcing</h2>')
idx_cyber = find_slide_by_content(html, 'padding-left:12px;">Cybersecurity</h2>')
idx_ea = find_slide_by_content(html, 'padding-left:12px;">Enterprise Architecture</h2>')
idx_compliance = find_slide_by_content(html, 'padding-left:12px;">Compliance</h2>')
idx_aigov = find_slide_by_content(html, 'padding-left:12px;">AI Governance</h2>')
idx_privacy = find_slide_by_content(html, 'padding-left:12px;">Privacy</h2>')
idx_legal = find_slide_by_content(html, 'padding-left:12px;">Commercial Counsel</h2>')
idx_tprm = find_slide_by_content(html, 'padding-left:12px;">Third-Party Risk Management</h2>')
idx_process = find_slide_by_content(html, '>End-to-End Process Orchestrator</h2>')
idx_raci = find_slide_by_content(html, '>RACI Matrix by Governance Topic</h2>')
idx_dmn = find_slide_by_content(html, '>DMN Decision Tables: Risk Tier')
idx_roadmap = find_slide_by_content(html, '>Implementation Roadmap:')
idx_bottleneck = find_slide_by_content(html, '>Onboarding Bottleneck Analysis')
idx_staffing = find_slide_by_content(html, '>Staffing and Resource Model</h2>')
idx_measurement = find_slide_by_content(html, '>Measurement Dashboard: Day')

print(f"\nNav indices:")
print(f"  Roadmap={idx_roadmap}, Intake={idx_intake}, Prioritization={idx_prioritization}")
print(f"  Finance={idx_finance}, Sourcing={idx_sourcing}, Cyber={idx_cyber}")
print(f"  EA={idx_ea}, Compliance={idx_compliance}, AI Gov={idx_aigov}")
print(f"  Privacy={idx_privacy}, Legal={idx_legal}, TPRM={idx_tprm}")
print(f"  Process={idx_process}, RACI={idx_raci}, DMN={idx_dmn}")
print(f"  Bottleneck={idx_bottleneck}, Staffing={idx_staffing}, Measurement={idx_measurement}")

# Replace nav-links block
nav_start = html.find('<div class="nav-links">')
nav_end = html.find('</div>', nav_start) + len('</div>')
new_nav = f'''<div class="nav-links">
    <a onclick="goToSlide(0)">Home</a>
    <a onclick="goToSlide(2)">Executive Summary</a>
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
    <a onclick="goToSlide({idx_process or 21})">Process</a>
    <a onclick="goToSlide({idx_raci or 30})">RACI</a>
    <a onclick="goToSlide({idx_dmn or 32})">DMN</a>
  </div>'''
html = html[:nav_start] + new_nav + html[nav_end:]

# ─── 8. Update Agenda slide goToSlide() indices ──────────────────────────
# Use extract_slide_block to precisely find the agenda slide boundaries
agenda_block, agenda_start, agenda_block_end = extract_slide_block(html, 1)
if agenda_block and agenda_start > 0:

    new_agenda = f'''<div class="slide" data-slide="1">
  <h2>Agenda</h2>
  <div class="two-col">
    <div>
      <h3>Executive Overview</h3>
      <ul>
        <li><a href="#" onclick="goToSlide(2);return false;">Executive Summary</a></li>
        <li><a href="#" onclick="goToSlide(3);return false;">End-to-End Workflow and Pain Points</a></li>
        <li><a href="#" onclick="goToSlide(4);return false;">System Landscape and Integration Gaps</a></li>
        <li><a href="#" onclick="goToSlide(5);return false;">Quantified Pain: By the Numbers</a></li>
        <li><a href="#" onclick="goToSlide(6);return false;">Cross-Cutting Operating Models</a> (slides 6-8)</li>
        <li><a href="#" onclick="goToSlide({idx_roadmap or 9});return false;">High-Level Roadmap (30/60/90/120)</a></li>
      </ul>
      <h3>Governance Domain Deep Dives</h3>
      <p class="small muted">Each domain: Current State + Recommendations (merged)</p>
      <ul>
        <li><a href="#" onclick="goToSlide({idx_intake or 10});return false;">Intake</a></li>
        <li><a href="#" onclick="goToSlide({idx_prioritization or 11});return false;">Prioritization</a></li>
        <li><a href="#" onclick="goToSlide({idx_finance or 12});return false;">Funding / Finance</a></li>
        <li><a href="#" onclick="goToSlide({idx_sourcing or 13});return false;">Sourcing</a></li>
        <li><a href="#" onclick="goToSlide({idx_cyber or 14});return false;">Cybersecurity</a></li>
        <li><a href="#" onclick="goToSlide({idx_ea or 15});return false;">Enterprise Architecture</a></li>
      </ul>
    </div>
    <div>
      <h3 style="visibility:hidden;">.</h3>
      <ul style="margin-top:2rem;">
        <li><a href="#" onclick="goToSlide({idx_compliance or 16});return false;">Compliance</a></li>
        <li><a href="#" onclick="goToSlide({idx_aigov or 17});return false;">AI Governance</a></li>
        <li><a href="#" onclick="goToSlide({idx_privacy or 18});return false;">Privacy</a></li>
        <li><a href="#" onclick="goToSlide({idx_legal or 19});return false;">Commercial Counsel</a></li>
        <li><a href="#" onclick="goToSlide({idx_tprm or 20});return false;">Third-Party Risk Management</a></li>
      </ul>
      <h3>Future State Process Design</h3>
      <ul>
        <li><a href="#" onclick="goToSlide({idx_process or 21});return false;">Process Story &amp; Forms</a> (slides {idx_process or 21}-{(idx_raci or 30) - 1})</li>
        <li><a href="#" onclick="goToSlide({idx_raci or 30});return false;">RACI Matrix</a></li>
        <li><a href="#" onclick="goToSlide({idx_dmn or 32});return false;">DMN Decision Tables</a></li>
        <li><a href="#" onclick="goToSlide({idx_bottleneck or 34});return false;">Bottleneck Analysis</a></li>
        <li><a href="#" onclick="goToSlide({idx_staffing or 35});return false;">Staffing and Resource Model</a></li>
        <li><a href="#" onclick="goToSlide({idx_measurement or 36});return false;">Measurement Dashboard</a></li>
      </ul>
    </div>
  </div>
  <div class="slide-footer"><span>Confidential</span><span>March 2026</span></div>
</div>'''

    html = html[:agenda_start] + new_agenda + html[agenda_block_end:]
    print("  Updated Agenda slide")

# Write output
with open(OUTPUT, 'w') as f:
    f.write(html)

print(f"\nDone! Written to {OUTPUT}")
print(f"Total slides: {slide_count}")
