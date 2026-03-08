#!/usr/bin/env node

/**
 * BPMN Diagonal Flow Fixer
 *
 * Finds sequence flows that use diagonal waypoints (crossing swim lanes at angles)
 * and replaces them with orthogonal (right-angle) routing.
 *
 * Usage: node fix-diagonal-flows.js <bpmn-file> [--dry-run]
 */

import fs from 'fs';
import path from 'path';

// Minimum angle threshold (degrees) to consider a segment "diagonal"
// Segments close to horizontal (0/180) or vertical (90/270) are OK
const DIAGONAL_THRESHOLD_DEG = 15;

/**
 * Parse all BPMNEdge waypoints from the DI section
 */
function parseEdges(xml) {
  const edges = [];
  // Match BPMNEdge elements with their waypoints
  const edgeRegex = /<bpmndi:BPMNEdge\s+id="([^"]*)"[^>]*bpmnElement="([^"]*)"[^>]*>([\s\S]*?)<\/bpmndi:BPMNEdge>/g;

  let match;
  while ((match = edgeRegex.exec(xml)) !== null) {
    const edgeId = match[1];
    const bpmnElement = match[2];
    const content = match[3];

    // Extract waypoints
    const wpRegex = /<di:waypoint\s+x="([^"]*?)"\s+y="([^"]*?)"\s*\/>/g;
    const waypoints = [];
    let wpMatch;
    while ((wpMatch = wpRegex.exec(content)) !== null) {
      waypoints.push({
        x: parseFloat(wpMatch[1]),
        y: parseFloat(wpMatch[2])
      });
    }

    // Extract label bounds if present
    const labelMatch = content.match(/<bpmndi:BPMNLabel>([\s\S]*?)<\/bpmndi:BPMNLabel>/);
    let labelBounds = null;
    if (labelMatch) {
      const boundsMatch = labelMatch[1].match(/<dc:Bounds\s+x="([^"]*?)"\s+y="([^"]*?)"\s+width="([^"]*?)"\s+height="([^"]*?)"\s*\/>/);
      if (boundsMatch) {
        labelBounds = {
          x: parseFloat(boundsMatch[1]),
          y: parseFloat(boundsMatch[2]),
          width: parseFloat(boundsMatch[3]),
          height: parseFloat(boundsMatch[4])
        };
      }
    }

    edges.push({ edgeId, bpmnElement, waypoints, labelBounds });
  }

  return edges;
}

/**
 * Parse all BPMNShape bounds (for element positions and lane boundaries)
 */
function parseShapes(xml) {
  const shapes = {};
  const shapeRegex = /<bpmndi:BPMNShape\s+id="([^"]*)"[^>]*bpmnElement="([^"]*)"[^>]*>([\s\S]*?)<\/bpmndi:BPMNShape>/g;

  let match;
  while ((match = shapeRegex.exec(xml)) !== null) {
    const shapeId = match[1];
    const bpmnElement = match[2];
    const content = match[3];

    const boundsMatch = content.match(/<dc:Bounds\s+x="([^"]*?)"\s+y="([^"]*?)"\s+width="([^"]*?)"\s+height="([^"]*?)"\s*\/>/);
    if (boundsMatch) {
      shapes[bpmnElement] = {
        shapeId,
        x: parseFloat(boundsMatch[1]),
        y: parseFloat(boundsMatch[2]),
        width: parseFloat(boundsMatch[3]),
        height: parseFloat(boundsMatch[4])
      };
    }
  }

  return shapes;
}

/**
 * Parse lane boundaries from the process definition
 */
function parseLanes(xml, shapes) {
  const lanes = [];
  // Find lane elements and their shapes
  const laneRegex = /<bpmn:lane\s+id="([^"]*)"[^>]*name="([^"]*)"[^>]*>/g;

  let match;
  while ((match = laneRegex.exec(xml)) !== null) {
    const laneId = match[1];
    const laneName = match[2];
    const shape = shapes[laneId];
    if (shape) {
      lanes.push({
        id: laneId,
        name: laneName,
        y: shape.y,
        height: shape.height,
        yCenter: shape.y + shape.height / 2
      });
    }
  }

  // Sort lanes by Y position (top to bottom)
  lanes.sort((a, b) => a.y - b.y);
  return lanes;
}

/**
 * Check if a segment between two points is diagonal
 */
function isDiagonal(p1, p2) {
  const dx = Math.abs(p2.x - p1.x);
  const dy = Math.abs(p2.y - p1.y);

  // If both dx and dy are significant, it's diagonal
  if (dx < 5 || dy < 5) return false; // Nearly horizontal or vertical

  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  return angle > DIAGONAL_THRESHOLD_DEG && angle < (90 - DIAGONAL_THRESHOLD_DEG);
}

/**
 * Convert a diagonal segment to orthogonal routing
 * Uses midpoint routing: go horizontal first, then vertical, then horizontal
 */
function makeOrthogonal(p1, p2) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;

  // Determine routing strategy based on primary direction
  if (Math.abs(dx) >= Math.abs(dy)) {
    // Primarily horizontal flow - route: horizontal → vertical → horizontal
    const midX = Math.round(p1.x + dx / 2);
    return [
      p1,
      { x: midX, y: p1.y },
      { x: midX, y: p2.y },
      p2
    ];
  } else {
    // Primarily vertical flow - route: vertical → horizontal → vertical
    const midY = Math.round(p1.y + dy / 2);
    return [
      p1,
      { x: p1.x, y: midY },
      { x: p2.x, y: midY },
      p2
    ];
  }
}

/**
 * Fix all diagonal segments in a set of waypoints
 */
function fixWaypoints(waypoints) {
  if (waypoints.length < 2) return { waypoints, changed: false };

  let changed = false;
  const newWaypoints = [waypoints[0]];

  for (let i = 1; i < waypoints.length; i++) {
    const prev = newWaypoints[newWaypoints.length - 1];
    const curr = waypoints[i];

    if (isDiagonal(prev, curr)) {
      changed = true;
      const orthogonal = makeOrthogonal(prev, curr);
      // Add intermediate points (skip the first which is prev)
      for (let j = 1; j < orthogonal.length; j++) {
        newWaypoints.push(orthogonal[j]);
      }
    } else {
      newWaypoints.push(curr);
    }
  }

  // Remove redundant waypoints (collinear points)
  const cleaned = cleanWaypoints(newWaypoints);

  return { waypoints: cleaned, changed };
}

/**
 * Remove collinear waypoints
 */
function cleanWaypoints(points) {
  if (points.length <= 2) return points;

  const result = [points[0]];
  for (let i = 1; i < points.length - 1; i++) {
    const prev = result[result.length - 1];
    const curr = points[i];
    const next = points[i + 1];

    // Check if curr is collinear with prev and next
    const isHorizontal = Math.abs(prev.y - curr.y) < 1 && Math.abs(curr.y - next.y) < 1;
    const isVertical = Math.abs(prev.x - curr.x) < 1 && Math.abs(curr.x - next.x) < 1;

    if (!isHorizontal && !isVertical) {
      result.push(curr);
    }
  }
  result.push(points[points.length - 1]);

  return result;
}

/**
 * Generate waypoint XML string
 */
function waypointsToXml(waypoints, indent = '        ') {
  return waypoints.map(wp =>
    `${indent}<di:waypoint x="${wp.x}" y="${wp.y}" />`
  ).join('\n');
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Main processing function
 */
function processFile(filePath, dryRun = false) {
  const xml = fs.readFileSync(filePath, 'utf-8');
  const fileName = path.basename(filePath);

  console.log(`\n=== Processing: ${fileName} ===`);

  const edges = parseEdges(xml);
  const shapes = parseShapes(xml);

  console.log(`  Found ${edges.length} edges, ${Object.keys(shapes).length} shapes`);

  let modifiedXml = xml;
  let fixCount = 0;
  const fixes = [];

  for (const edge of edges) {
    if (edge.waypoints.length < 2) continue;

    // Check for diagonal segments
    let hasDiagonal = false;
    for (let i = 1; i < edge.waypoints.length; i++) {
      if (isDiagonal(edge.waypoints[i - 1], edge.waypoints[i])) {
        hasDiagonal = true;
        break;
      }
    }

    if (!hasDiagonal) continue;

    const { waypoints: newWaypoints, changed } = fixWaypoints(edge.waypoints);

    if (changed) {
      fixCount++;
      fixes.push({
        edge: edge.bpmnElement,
        oldPoints: edge.waypoints.length,
        newPoints: newWaypoints.length
      });

      if (!dryRun) {
        // Replace the edge content in XML
        const edgePattern = new RegExp(
          `(<bpmndi:BPMNEdge\\s+id="${escapeRegex(edge.edgeId)}"[^>]*>)([\\s\\S]*?)(<\\/bpmndi:BPMNEdge>)`,
        );

        const wpXml = waypointsToXml(newWaypoints);
        let labelXml = '';
        if (edge.labelBounds) {
          labelXml = `\n        <bpmndi:BPMNLabel>\n          <dc:Bounds x="${edge.labelBounds.x}" y="${edge.labelBounds.y}" width="${edge.labelBounds.width}" height="${edge.labelBounds.height}" />\n        </bpmndi:BPMNLabel>`;
        }

        modifiedXml = modifiedXml.replace(edgePattern, `$1\n${wpXml}${labelXml}\n      $3`);
      }
    }
  }

  console.log(`  Diagonal flows found: ${fixCount}`);
  fixes.forEach(f => {
    console.log(`    - ${f.edge}: ${f.oldPoints} pts → ${f.newPoints} pts`);
  });

  if (!dryRun && fixCount > 0) {
    try {
      fs.writeFileSync(filePath + '.bak', xml, 'utf-8');
      fs.writeFileSync(filePath, modifiedXml, 'utf-8');
    } catch (err) {
      console.error(`  ✗ Failed to write file: ${err.message}`);
      process.exit(1);
    }
    console.log(`  ✅ File updated with ${fixCount} fixes (backup: ${path.basename(filePath)}.bak)`);
  } else if (dryRun && fixCount > 0) {
    console.log(`  [DRY RUN] Would fix ${fixCount} diagonal flows`);
  } else {
    console.log(`  ✓ No diagonal flows to fix`);
  }

  return fixCount;
}

// Main
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const files = args.filter(a => !a.startsWith('--'));

if (files.length === 0) {
  console.log('Usage: node fix-diagonal-flows.js <bpmn-file(s)> [--dry-run]');
  process.exit(1);
}

let totalFixes = 0;
for (const file of files) {
  if (!fs.existsSync(file)) {
    console.error(`File not found: ${file}`);
    continue;
  }
  totalFixes += processFile(file, dryRun);
}

console.log(`\n=== Summary: ${totalFixes} diagonal flows fixed across ${files.length} file(s) ===`);
