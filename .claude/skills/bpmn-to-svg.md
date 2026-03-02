---
name: bpmn-to-svg
description: Render BPMN process models to SVG using bpmn-js for embedding in presentations (project)
---

# BPMN to SVG Renderer

Renders BPMN process models using bpmn-js library and exports as SVG for embedding in HTML presentations. Use when you need to display actual BPMN diagrams with proper notation in presentations or documentation.

## Trigger

Use this skill when:
- User asks to render a BPMN file for a presentation
- User wants to export a BPMN diagram as SVG
- User needs to embed a BPMN process model in HTML
- User wants proper BPMN 2.0 notation (not hand-drawn diagrams)

## Usage

```
/bpmn-to-svg <bpmn-file-path> [output-path]
```

## Arguments

- `bpmn-file-path`: Path to the .bpmn file to render (required)
- `output-path`: Where to save the SVG (optional, defaults to `docs/images/<filename>.svg`)

## Process

1. **Read the BPMN file** from the specified path
2. **Navigate Playwright** to `.claude/scripts/bpmn-to-svg.html`
3. **Call `renderAndExport(bpmnXml)`** with the BPMN XML content
4. **Extract the SVG** from the JSON response
5. **Save to output path** (creates directories if needed)
6. **Return the SVG path** for embedding

## Implementation

### Step 1: Load the bpmn-js renderer

```javascript
// Navigate to the renderer HTML (file:// protocol)
await mcp__playwright__browser_navigate({
  url: 'file:///path/to/.claude/scripts/bpmn-to-svg.html'
});
```

### Step 2: Read BPMN and render

```javascript
// Read BPMN file content
const bpmnXml = await Bash('cat /path/to/process.bpmn');

// Call the renderer function via Playwright evaluate
const result = await mcp__playwright__browser_evaluate({
  function: `async () => await window.renderAndExport(\`${bpmnXml}\`)`
});
```

### Step 3: Extract and save SVG

```javascript
// Result contains { success: true, svg: "<?xml..." }
// Extract SVG string and save to file
const svg = result.svg;
await Write({ file_path: outputPath, content: svg });
```

## Example

```bash
# Render the SLA governance process
/bpmn-to-svg processes/phase-0/sla-intake.bpmn

# Output: SVG saved to docs/images/sla-intake.svg
```

## Embedding in HTML Presentations

After generating the SVG, embed it in the HTML presentation:

```html
<!-- Simple image embed -->
<img src="images/sla-intake.svg"
     alt="SLA Intake BPMN Process"
     style="width: 100%; height: auto; min-width: 800px;">

<!-- In a scrollable container -->
<div style="background: #f8fafc; border-radius: 12px; padding: 1rem; overflow-x: auto;">
    <img src="images/sla-intake.svg" alt="BPMN Process">
</div>

<!-- In a modal popup -->
<div id="bpmn-modal" style="display: none; position: fixed; ...">
    <img src="images/sla-intake.svg" alt="BPMN Process">
</div>
```

## Output Quality

The bpmn-js renderer produces high-quality SVG with proper BPMN 2.0 notation:

| Element | Visual |
|---------|--------|
| Service Task | Gear icons |
| User Task | Person icon |
| Exclusive Gateway | Diamond with X |
| Timer Boundary Event | Clock icon with duration |
| Escalation End Event | Arrow symbol |
| Sequence Flow | Arrows with arrowheads |
| Labels | Task names, conditions |

## Dependencies

- **bpmn-js** v17.11.1 (loaded from unpkg CDN in renderer HTML)
- **Playwright MCP** for browser automation
- **File system access** for reading BPMN and writing SVG

## Related Files

| File | Purpose |
|------|---------|
| `.claude/scripts/bpmn-to-svg.html` | bpmn-js renderer page |
| `docs/images/*.svg` | Generated SVG output directory |

## Notes

- SVG files are typically 50-100KB depending on process complexity
- The renderer automatically fits the diagram to viewport
- All BPMN elements render with proper icons and styling
- Works with any valid BPMN 2.0 XML file (Camunda Modeler compatible)
- No runtime JavaScript dependencies in the output SVG
