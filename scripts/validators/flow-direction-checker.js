#!/usr/bin/env node

/**
 * Flow Direction Checker - Detects backward sequence flows in BPMN DI
 *
 * Usage: node flow-direction-checker.js <bpmn-file>
 *
 * Validates:
 * - All sequence flows move left-to-right (last waypoint X >= first waypoint X)
 * - Explicit loop-back flows (named Retry/Revise/Negotiate/Refine) are excluded
 *
 * Part of SLA Governance BPMN validation pipeline.
 */

import fs from 'fs';
import path from 'path';

// Loop-back flow names that are acceptable as backward flows
const LOOP_LABELS = ['retry', 'revise', 'negotiate', 'refine', 'loop', 'rework'];

function extractEdgesFromXml(xml) {
  const edges = [];

  const edgeRegex = /<bpmndi:BPMNEdge[^>]*id="([^"]*)"[^>]*bpmnElement="([^"]*)"[^>]*>([\s\S]*?)<\/bpmndi:BPMNEdge>/g;
  let match;

  while ((match = edgeRegex.exec(xml)) !== null) {
    const edgeId = match[1];
    const bpmnElementId = match[2];
    const edgeContent = match[3];

    // Extract waypoints
    const waypointRegex = /<di:waypoint\s+x="([^"]+)"\s+y="([^"]+)"\s*\/>/g;
    const waypoints = [];
    let wpMatch;
    while ((wpMatch = waypointRegex.exec(edgeContent)) !== null) {
      waypoints.push({
        x: parseFloat(wpMatch[1]),
        y: parseFloat(wpMatch[2])
      });
    }

    if (waypoints.length >= 2) {
      // Get flow name from process definition
      const nameMatch = xml.match(new RegExp(`<bpmn:sequenceFlow[^>]*id="${bpmnElementId}"[^>]*name="([^"]*)"`, 'i'));
      const name = nameMatch ? nameMatch[1].replace(/&#10;/g, ' ') : '';

      edges.push({
        id: bpmnElementId,
        diId: edgeId,
        name,
        waypoints
      });
    }
  }

  return edges;
}

function checkFlowDirection(edges, result) {
  let backwardCount = 0;

  for (const edge of edges) {
    const first = edge.waypoints[0];
    const last = edge.waypoints[edge.waypoints.length - 1];

    if (last.x < first.x - 5) { // 5px tolerance
      // Check if this is a named loop-back flow
      const isLoop = LOOP_LABELS.some(label =>
        edge.name.toLowerCase().includes(label)
      );

      if (isLoop) {
        result.info.push(`Loop-back flow accepted: "${edge.name}" (${edge.id})`);
      } else {
        backwardCount++;
        result.errors.push({
          message: `Backward flow detected: ${edge.id}${edge.name ? ` ("${edge.name}")` : ''} — X goes from ${first.x} to ${last.x}`,
          element: edge.id
        });
      }
    }
  }

  return backwardCount;
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node flow-direction-checker.js <bpmn-file>');
    process.exit(1);
  }

  const filePath = args[0];

  if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found: ${filePath}`);
    process.exit(1);
  }

  const xml = fs.readFileSync(path.resolve(filePath), 'utf-8');

  const result = {
    valid: true,
    errors: [],
    info: []
  };

  const edges = extractEdgesFromXml(xml);
  result.info.push(`Found ${edges.length} sequence flow edge(s)`);

  const backwardCount = checkFlowDirection(edges, result);

  if (backwardCount > 0) {
    result.valid = false;
  }

  // Print results
  console.log('\n=== Flow Direction Check Results ===\n');

  if (result.info.length > 0) {
    result.info.forEach(msg => console.log(`  i ${msg}`));
    console.log('');
  }

  if (result.errors.length > 0) {
    console.log('ERRORS:');
    result.errors.forEach(err => console.log(`  x ${err.message}`));
    console.log('');
  }

  if (result.valid) {
    console.log('OK: All flows move left-to-right\n');
  } else {
    console.log(`FAILED: ${backwardCount} backward flow(s) detected\n`);
  }

  process.exit(result.valid ? 0 : 1);
}

main();
