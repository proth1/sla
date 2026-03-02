#!/usr/bin/env node
/**
 * BPMN Task Shape Widener
 *
 * Widens all task shapes (userTask, businessRuleTask) from 100x80 to 140x80
 * and adjusts connected waypoints in Phase 5 and Phase 6 BPMN models.
 *
 * Pre-corrections:
 *   Phase 5: Shift Task_TechDebtAssessment x +40 to avoid overlap
 *   Phase 6: Expand participant/lane widths +40 for rightmost task clearance
 *
 * Usage: node widen-tasks-140.js [--dry-run]
 */

import fs from 'fs';
import path from 'path';

const OLD_W = 100;
const NEW_W = 140;
const dryRun = process.argv.includes('--dry-run');

const TARGET_FILES = [
  'processes/phase-5-operations/post-deployment-observability.bpmn',
  'processes/phase-6-retirement/retirement-management.bpmn'
];

/** Extract task element IDs (userTask and businessRuleTask) from process XML */
function parseTaskIds(xml) {
  const ids = new Set();
  const re = /<bpmn:(?:userTask|businessRuleTask)\s+id="([^"]+)"/g;
  let m;
  while ((m = re.exec(xml)) !== null) ids.add(m[1]);
  return ids;
}

/** Parse BPMNShape bounds for elements in the given ID set */
function parseShapeBounds(xml, ids) {
  const shapes = {};
  const re = /<bpmndi:BPMNShape[^>]*bpmnElement="([^"]*)"[^>]*>[\s\S]*?<dc:Bounds\s+x="([^"]*?)"\s+y="([^"]*?)"\s+width="([^"]*?)"\s+height="([^"]*?)"\s*\/>/g;
  let m;
  while ((m = re.exec(xml)) !== null) {
    if (ids.has(m[1])) {
      shapes[m[1]] = {
        x: parseFloat(m[2]),
        y: parseFloat(m[3]),
        width: parseFloat(m[4]),
        height: parseFloat(m[5])
      };
    }
  }
  return shapes;
}

/** Replace a bounds attribute value within a specific BPMNShape context */
function replaceShapeBounds(xml, bpmnElement, attr, oldVal, newVal) {
  const re = new RegExp(
    `(bpmnElement="${bpmnElement}"[^>]*>[\\s\\S]*?<dc:Bounds[^/]*${attr}=")${oldVal}(")`
  );
  return xml.replace(re, (match, before, after) => before + newVal + after);
}

/** Replace a waypoint x value within a specific BPMNEdge context */
function replaceEdgeWaypoint(xml, edgeElement, oldX, oldY, newX) {
  const re = new RegExp(
    `(bpmnElement="${edgeElement}"[\\s\\S]*?)<di:waypoint x="${oldX}" y="${oldY}" \\/>`
  );
  return xml.replace(re, (match, before) => `${before}<di:waypoint x="${newX}" y="${oldY}" />`);
}

/** Apply file-specific pre-corrections before widening */
function applyPreCorrections(xml, fileName) {
  const log = [];

  if (fileName.includes('post-deployment-observability')) {
    // Shift Task_TechDebtAssessment x: 3275→3315 (20px gap from ArchitecturalDriftReview after widening)
    xml = replaceShapeBounds(xml, 'Task_TechDebtAssessment', 'x', '3275', '3315');
    // Flow entering left edge: 3275→3315
    xml = replaceEdgeWaypoint(xml, 'Flow_ArchDriftToTechDebt', '3275', '449', '3315');
    // Flow exiting right edge: 3375→3415
    xml = replaceEdgeWaypoint(xml, 'Flow_TechDebtToExecDash', '3375', '449', '3415');
    log.push('Phase 5: Shifted Task_TechDebtAssessment x: 3275→3315');
  }

  if (fileName.includes('retirement-management')) {
    // Expand participant width: 3500→3540
    xml = replaceShapeBounds(xml, 'Participant_RetirementMgmt', 'width', '3500', '3540');
    log.push('Phase 6: Expanded participant width: 3500→3540');

    // Expand all 7 lane widths: 3470→3510
    for (const lane of ['Lane_GB', 'Lane_BO', 'Lane_ITA', 'Lane_Proc', 'Lane_LC', 'Lane_IS', 'Lane_VM']) {
      xml = replaceShapeBounds(xml, lane, 'width', '3470', '3510');
    }
    log.push('Phase 6: Expanded 7 lane widths: 3470→3510');
  }

  return { xml, log };
}

function processFile(filePath) {
  let xml = fs.readFileSync(filePath, 'utf-8');
  const fileName = path.basename(filePath);
  console.log(`\n=== ${fileName} ===`);

  // 1. Parse task IDs
  const taskIds = parseTaskIds(xml);
  console.log(`  Task elements: ${taskIds.size}`);

  // 2. Pre-corrections
  const pre = applyPreCorrections(xml, fileName);
  xml = pre.xml;
  pre.log.forEach(msg => console.log(`  Pre: ${msg}`));

  // 3. Parse shapes (after pre-corrections)
  const shapes = parseShapeBounds(xml, taskIds);

  // 4. Build coordinate maps: oldRight→newRight, oldCenter→newCenter
  const rightMap = {};
  const centerMap = {};
  let eligible = 0;

  for (const [id, s] of Object.entries(shapes)) {
    if (s.width !== OLD_W) {
      console.log(`  SKIP ${id}: width=${s.width}`);
      continue;
    }
    eligible++;
    rightMap[s.x + OLD_W] = s.x + NEW_W;
    centerMap[s.x + OLD_W / 2] = s.x + NEW_W / 2;
  }
  console.log(`  Eligible tasks: ${eligible}`);
  console.log(`  Right-edge mappings: ${Object.keys(rightMap).length} (unique x values)`);
  console.log(`  Center mappings: ${Object.keys(centerMap).length} (unique x values)`);

  // 5. Widen all eligible task shapes
  let widened = 0;
  for (const id of taskIds) {
    const s = shapes[id];
    if (!s || s.width !== OLD_W) continue;
    const re = new RegExp(
      `(bpmnElement="${id}"[^>]*>[\\s\\S]*?<dc:Bounds[^/]*width=")${OLD_W}("\\s+height="${Math.round(s.height)}")`
    );
    if (re.test(xml)) {
      xml = xml.replace(re, (m, before, after) => before + NEW_W + after);
      widened++;
    }
  }
  console.log(`  Shapes widened: ${widened}`);

  // 6. Adjust waypoints
  let wpRight = 0;
  let wpCenter = 0;
  xml = xml.replace(
    /<di:waypoint x="(\d+(?:\.\d+)?)" y="(\d+(?:\.\d+)?)" \/>/g,
    (match, xStr, yStr) => {
      const x = parseFloat(xStr);
      if (rightMap[x] !== undefined) {
        wpRight++;
        return `<di:waypoint x="${rightMap[x]}" y="${yStr}" />`;
      }
      if (centerMap[x] !== undefined) {
        wpCenter++;
        return `<di:waypoint x="${centerMap[x]}" y="${yStr}" />`;
      }
      return match;
    }
  );
  console.log(`  Waypoints adjusted: ${wpRight} right-edge, ${wpCenter} center (${wpRight + wpCenter} total)`);

  // 7. Write
  if (!dryRun) {
    fs.writeFileSync(filePath, xml, 'utf-8');
    console.log(`  File written.`);
  } else {
    console.log(`  [DRY RUN - no changes written]`);
  }

  return { widened, waypoints: wpRight + wpCenter };
}

// --- Main ---
console.log(`BPMN Task Widener: ${OLD_W}x80 → ${NEW_W}x80${dryRun ? ' [DRY RUN]' : ''}\n`);

let totalW = 0;
let totalWP = 0;

for (const rel of TARGET_FILES) {
  const abs = path.resolve(rel);
  if (!fs.existsSync(abs)) {
    console.error(`Not found: ${abs}`);
    continue;
  }
  const r = processFile(abs);
  totalW += r.widened;
  totalWP += r.waypoints;
}

console.log(`\n=== Summary: ${totalW} shapes widened, ${totalWP} waypoints adjusted ===`);
if (dryRun) console.log('No files were modified (dry run).');
