#!/usr/bin/env node
/**
 * Renders each sub-process diagram from a hierarchical BPMN file
 * using bpmn-js in a headless browser (puppeteer via Chrome).
 */
const puppeteer = require('/opt/homebrew/lib/node_modules/puppeteer/node_modules/puppeteer-core');
const fs = require('fs');
const path = require('path');

const BPMN_FILE = path.resolve(__dirname, '../customers/fs-onboarding/processes/onboarding-to-be-ideal-state-v16-c8.bpmn');
const OUT_DIR = path.resolve(__dirname, '../docs/presentations/bpmn-images');

const DIAGRAMS = [
  // Top-level orchestrator (null id = default/main diagram)
  { id: null, name: 'v16-orchestrator' },
  // Phase sub-processes
  { id: 'SP_RequestTriage', name: 'v16-sp1-refine-request' },
  { id: 'Activity_0j7ifzh', name: 'v16-sp0-mini-rfp' },
  { id: 'Activity_0mpg74s', name: 'v16-sp1-execute-nda' },
  { id: 'SP_PlanningRouting', name: 'v16-sp2-planning-routing' },
  { id: 'SP_EvalDD', name: 'v16-sp3-vendor-evaluation' },
  { id: 'Activity_0tfteab', name: 'v16-sp3-vendor-sourcing' },
  { id: 'Activity_19ph1cx', name: 'v16-sp4-risk-assessment-contracting' },
  { id: 'Activity_1hbbnkw', name: 'v16-pdlc' },
  { id: 'SP_UATGoLive', name: 'v16-sp5-uat-golive' },
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
    console.log(`Rendering ${diagram.id || 'main'} → ${diagram.name}.png`);

    // Navigate into the sub-process (or stay at root for orchestrator) and fit viewport
    const rendered = await page.evaluate(async (spId) => {
      const viewer = window._viewer;
      const canvas = viewer.get('canvas');

      if (spId === null) {
        // Main/orchestrator diagram — reset to default root
        const roots = canvas.getRootElements();
        const mainRoot = roots.find(r => r.id.includes('Collaboration') || r.id.includes('Process'))
          || roots[0];
        canvas.setRootElement(mainRoot);
      } else {
        const elementRegistry = viewer.get('elementRegistry');
        const element = elementRegistry.get(spId);
        if (!element) return { success: false, error: `Element ${spId} not found` };

        try {
          canvas.setRootElement(canvas.findRoot(spId + '_plane') || canvas.findRoot(spId));
        } catch (e) {
          const roots = canvas.getRootElements();
          const spRoot = roots.find(r => r.id === spId || r.id === spId + '_plane' ||
            (r.businessObject && r.businessObject.id === spId));
          if (spRoot) {
            canvas.setRootElement(spRoot);
          } else {
            return { success: false, error: `No root for ${spId}. Roots: ${roots.map(r => r.id).join(', ')}` };
          }
        }
      }

      canvas.zoom('fit-viewport');

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
