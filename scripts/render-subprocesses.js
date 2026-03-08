#!/usr/bin/env node
/**
 * Renders each sub-process diagram from a hierarchical BPMN file
 * using bpmn-js in a headless browser (puppeteer via Chrome).
 */
const puppeteer = require('/opt/homebrew/lib/node_modules/puppeteer/node_modules/puppeteer-core');
const fs = require('fs');
const path = require('path');

const BPMN_FILE = path.resolve(__dirname, '../customers/fs-onboarding/processes/onboarding-to-be-ideal-state-v8-c8.bpmn');
const OUT_DIR = path.resolve(__dirname, '../docs/presentations/bpmn-images');

const DIAGRAMS = [
  { id: 'SP_RequestTriage', name: 'v8-sp1-request-triage' },
  { id: 'SP_PlanningRouting', name: 'v8-sp2-planning-routing' },
  { id: 'SP_EvalDD', name: 'v8-sp3-evaluation-dd' },
  { id: 'SP_ContractBuild', name: 'v8-sp4-contracting-build' },
  { id: 'SP_UATGoLive', name: 'v8-sp5-uat-golive' },
  { id: 'SP_PDLC', name: 'v8-pdlc' },
];

const BPMN_JS_CDN = 'https://unpkg.com/bpmn-js@18.6.1/dist/bpmn-navigated-viewer.production.min.js';

(async () => {
  const xml = fs.readFileSync(BPMN_FILE, 'utf8');

  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 2400, height: 1200 });

  // Load a minimal HTML page with bpmn-js
  await page.setContent(`<!DOCTYPE html>
<html><head><style>
  html, body { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: white; }
  #canvas { width: 100%; height: 100%; }
</style></head>
<body><div id="canvas"></div>
<script src="${BPMN_JS_CDN}"></script>
</body></html>`, { waitUntil: 'networkidle0' });

  // Import the BPMN XML
  const importResult = await page.evaluate(async (xmlStr) => {
    const viewer = new BpmnJS({ container: '#canvas' });
    window._viewer = viewer;
    try {
      await viewer.importXML(xmlStr);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }, xml);

  if (!importResult.success) {
    console.error('Failed to import BPMN:', importResult.error);
    await browser.close();
    process.exit(1);
  }

  console.log('BPMN imported successfully');

  for (const diagram of DIAGRAMS) {
    console.log(`Rendering ${diagram.id} → ${diagram.name}.png`);

    // Navigate into the sub-process and fit viewport
    const rendered = await page.evaluate(async (spId) => {
      const viewer = window._viewer;
      const canvas = viewer.get('canvas');
      const elementRegistry = viewer.get('elementRegistry');

      // Find the sub-process element
      const element = elementRegistry.get(spId);
      if (!element) return { success: false, error: `Element ${spId} not found` };

      // Open the sub-process (drill down into it)
      try {
        canvas.setRootElement(canvas.findRoot(spId + '_plane') || canvas.findRoot(spId));
      } catch (e) {
        // Try alternative: find the root element for this sub-process
        const roots = canvas.getRootElements();
        const spRoot = roots.find(r => r.id === spId || r.id === spId + '_plane' ||
          (r.businessObject && r.businessObject.id === spId));
        if (spRoot) {
          canvas.setRootElement(spRoot);
        } else {
          return { success: false, error: `No root for ${spId}. Roots: ${roots.map(r => r.id).join(', ')}` };
        }
      }

      canvas.zoom('fit-viewport');

      // Get the viewbox for proper sizing
      const viewbox = canvas.viewbox();
      return {
        success: true,
        viewbox: {
          x: viewbox.x,
          y: viewbox.y,
          width: viewbox.width,
          height: viewbox.height,
          outerWidth: viewbox.outer.width,
          outerHeight: viewbox.outer.height
        }
      };
    }, diagram.id);

    if (!rendered.success) {
      console.error(`  Failed: ${rendered.error}`);
      continue;
    }

    // Wait for rendering to settle
    await new Promise(r => setTimeout(r, 500));

    // Export as SVG, then convert to PNG via canvas
    const svgStr = await page.evaluate(async () => {
      const viewer = window._viewer;
      const result = await viewer.saveSVG();
      return result.svg;
    });

    // Write SVG first
    const svgPath = path.join(OUT_DIR, `${diagram.name}.svg`);
    fs.writeFileSync(svgPath, svgStr);

    // Take screenshot as PNG
    const pngPath = path.join(OUT_DIR, `${diagram.name}.png`);
    await page.screenshot({ path: pngPath, fullPage: false });

    console.log(`  ✓ ${pngPath}`);
  }

  await browser.close();
  console.log('\nDone!');
})();
