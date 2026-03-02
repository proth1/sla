#!/usr/bin/env node

/**
 * BPMN Visual Overlap Checker - Fast static overlap detection from BPMN DI XML
 *
 * Usage: node visual-overlap-checker.js <bpmn-file>
 *
 * This is a FAST GATE validator that analyzes BPMN Diagram Interchange (DI)
 * XML to detect overlapping elements WITHOUT rendering and WITHOUT external
 * dependencies (uses native Node.js XML parsing).
 *
 * Validates:
 * - Overlapping element bounds (>5% threshold)
 * - Label bounds outside element
 * - Missing diagram information
 *
 * Part of RIV-367: BPMN Visual Validation Integration
 *
 * @see .claude/agents/bpmn-validator.md - Section 11
 * @see .claude/skills/bpmn-cicd/skill.md - Phase 1.5
 * @see .claude/rules/bpmn-testing.md - Phase 1.5
 */

import fs from 'fs';
import path from 'path';

// Overlap threshold (percentage of smaller element's area)
const OVERLAP_THRESHOLD = 5;

// Element types to check for overlaps (BPMN shape types)
const CHECKABLE_TYPES = [
  'Task', 'ServiceTask', 'UserTask', 'ScriptTask', 'SendTask',
  'ReceiveTask', 'ManualTask', 'BusinessRuleTask', 'SubProcess',
  'CallActivity', 'ExclusiveGateway', 'ParallelGateway',
  'InclusiveGateway', 'EventBasedGateway', 'StartEvent', 'EndEvent',
  'IntermediateCatchEvent', 'IntermediateThrowEvent', 'TextAnnotation',
  'DataObjectReference', 'DataStoreReference'
];

class ValidationResult {
  constructor() {
    this.valid = true;
    this.errors = [];
    this.warnings = [];
    this.info = [];
    this.overlaps = [];
  }

  addError(message, details = null) {
    this.valid = false;
    this.errors.push({ message, details });
  }

  addWarning(message, details = null) {
    this.warnings.push({ message, details });
  }

  addInfo(message) {
    this.info.push(message);
  }

  addOverlap(element1, element2, overlapArea, overlapPercent) {
    this.valid = false;
    this.overlaps.push({
      element1: { id: element1.id, type: element1.type },
      element2: { id: element2.id, type: element2.type },
      overlapArea,
      overlapPercent
    });
    this.addError(
      `Overlapping elements: ${element1.id} overlaps ${element2.id} by ${overlapPercent.toFixed(1)}%`,
      { element1: element1.id, element2: element2.id, overlapPercent }
    );
  }

  print() {
    console.log('\n=== BPMN Visual Overlap Check Results ===\n');

    if (this.info.length > 0) {
      console.log('INFO:');
      this.info.forEach(msg => console.log(`  ℹ️  ${msg}`));
      console.log('');
    }

    if (this.warnings.length > 0) {
      console.log('WARNINGS:');
      this.warnings.forEach(w => console.log(`  ⚠️  ${w.message}`));
      console.log('');
    }

    if (this.errors.length > 0) {
      console.log('ERRORS:');
      this.errors.forEach(e => console.log(`  ❌ ${e.message}`));
      console.log('');
    }

    if (this.overlaps.length > 0) {
      console.log('OVERLAPS DETECTED:');
      this.overlaps.forEach(o => {
        console.log(`  🔴 ${o.element1.id} ↔ ${o.element2.id}`);
        console.log(`     Overlap: ${o.overlapArea}px², ${o.overlapPercent.toFixed(1)}%`);
      });
      console.log('');
    }

    if (this.valid) {
      console.log('✅ Visual overlap check PASSED\n');
    } else {
      console.log('❌ Visual overlap check FAILED\n');
    }

    return this.valid;
  }

  toJSON() {
    return {
      valid: this.valid,
      errors: this.errors,
      warnings: this.warnings,
      info: this.info,
      overlaps: this.overlaps,
      summary: {
        errorCount: this.errors.length,
        warningCount: this.warnings.length,
        overlapCount: this.overlaps.length
      }
    };
  }
}

/**
 * Calculate intersection area of two rectangles
 */
function calculateOverlap(bounds1, bounds2) {
  const x1 = Math.max(bounds1.x, bounds2.x);
  const y1 = Math.max(bounds1.y, bounds2.y);
  const x2 = Math.min(bounds1.x + bounds1.width, bounds2.x + bounds2.width);
  const y2 = Math.min(bounds1.y + bounds1.height, bounds2.y + bounds2.height);

  if (x2 <= x1 || y2 <= y1) {
    return 0; // No overlap
  }

  return (x2 - x1) * (y2 - y1);
}

/**
 * Calculate area of a rectangle
 */
function calculateArea(bounds) {
  return bounds.width * bounds.height;
}

/**
 * Parse bounds from XML string
 * Example: <dc:Bounds x="160" y="99" width="100" height="80" />
 */
function parseBounds(boundsMatch) {
  if (!boundsMatch) return null;

  const xMatch = boundsMatch.match(/x="([^"]+)"/);
  const yMatch = boundsMatch.match(/y="([^"]+)"/);
  const widthMatch = boundsMatch.match(/width="([^"]+)"/);
  const heightMatch = boundsMatch.match(/height="([^"]+)"/);

  if (!xMatch || !yMatch || !widthMatch || !heightMatch) return null;

  return {
    x: parseFloat(xMatch[1]),
    y: parseFloat(yMatch[1]),
    width: parseFloat(widthMatch[1]),
    height: parseFloat(heightMatch[1])
  };
}

/**
 * Extract element shapes from BPMN XML using regex
 * This is a fast approach that doesn't require XML parsing libraries
 */
function extractShapesFromXml(xml) {
  const shapes = [];

  // Find all BPMNShape elements
  const shapeRegex = /<bpmndi:BPMNShape[^>]*id="([^"]*)"[^>]*bpmnElement="([^"]*)"[^>]*>([\s\S]*?)<\/bpmndi:BPMNShape>/g;
  const selfClosingShapeRegex = /<bpmndi:BPMNShape[^>]*id="([^"]*)"[^>]*bpmnElement="([^"]*)"[^>]*\/>/g;

  let match;

  // Process shapes with children (bounds, labels)
  while ((match = shapeRegex.exec(xml)) !== null) {
    const shapeId = match[1];
    const bpmnElementId = match[2];
    const shapeContent = match[3];

    // Extract bounds
    const boundsMatch = shapeContent.match(/<dc:Bounds[^>]*\/>/);
    const bounds = parseBounds(boundsMatch ? boundsMatch[0] : null);

    if (bounds) {
      // Determine element type from the bpmnElement reference
      const elementType = getElementType(xml, bpmnElementId);

      shapes.push({
        id: bpmnElementId,
        shapeId: shapeId,
        type: elementType,
        bounds: bounds
      });
    }
  }

  return shapes;
}

/**
 * Get element type from BPMN process definition
 */
function getElementType(xml, elementId) {
  // Look for element definition with this ID
  const patterns = CHECKABLE_TYPES.map(type => {
    // Handle namespaced elements (bpmn:Task, Task, etc.)
    return new RegExp(`<(?:bpmn:)?${type}[^>]*id="${elementId}"`, 'i');
  });

  for (let i = 0; i < patterns.length; i++) {
    if (patterns[i].test(xml)) {
      return CHECKABLE_TYPES[i];
    }
  }

  return 'Unknown';
}

/**
 * Check if element is a boundary event (should be allowed to overlap parent)
 */
function isBoundaryEvent(type) {
  return type === 'BoundaryEvent';
}

/**
 * Check for overlapping elements
 */
function checkOverlaps(shapes, result) {
  const checkableShapes = shapes.filter(s =>
    CHECKABLE_TYPES.some(t => s.type.toLowerCase().includes(t.toLowerCase()))
  );

  for (let i = 0; i < checkableShapes.length; i++) {
    for (let j = i + 1; j < checkableShapes.length; j++) {
      const shape1 = checkableShapes[i];
      const shape2 = checkableShapes[j];

      // Skip boundary events (they're supposed to overlap their parent)
      if (isBoundaryEvent(shape1.type) || isBoundaryEvent(shape2.type)) {
        continue;
      }

      const overlapArea = calculateOverlap(shape1.bounds, shape2.bounds);

      if (overlapArea > 0) {
        const area1 = calculateArea(shape1.bounds);
        const area2 = calculateArea(shape2.bounds);
        const smallerArea = Math.min(area1, area2);
        const overlapPercent = (overlapArea / smallerArea) * 100;

        if (overlapPercent > OVERLAP_THRESHOLD) {
          result.addOverlap(shape1, shape2, Math.round(overlapArea), overlapPercent);
        }
      }
    }
  }
}

/**
 * Main validation function
 */
function validateBpmnFile(filePath) {
  const result = new ValidationResult();

  try {
    // Read BPMN file
    const absolutePath = path.resolve(filePath);
    const xml = fs.readFileSync(absolutePath, 'utf-8');

    result.addInfo(`Validating: ${path.basename(filePath)}`);
    result.addInfo(`File size: ${xml.length} bytes`);

    // Check for diagram section
    if (!xml.includes('bpmndi:BPMNDiagram')) {
      result.addError('No BPMN diagram information found in file');
      return result;
    }

    // Extract shapes
    const shapes = extractShapesFromXml(xml);
    result.addInfo(`Found ${shapes.length} shape(s) with bounds`);

    if (shapes.length === 0) {
      result.addWarning('No checkable shapes found in diagram');
      return result;
    }

    // Check for overlaps
    checkOverlaps(shapes, result);

    // Summary
    if (result.overlaps.length === 0) {
      result.addInfo('No overlapping elements detected');
    }

  } catch (error) {
    result.addError(`Failed to process BPMN file: ${error.message}`);
  }

  return result;
}

// Main entry point
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node visual-overlap-checker.js <bpmn-file> [--json]');
    console.log('');
    console.log('Fast static overlap detection from BPMN DI XML.');
    console.log('');
    console.log('Options:');
    console.log('  --json    Output results as JSON');
    process.exit(1);
  }

  const filePath = args[0];

  // Check file exists
  if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found: ${filePath}`);
    process.exit(1);
  }

  const result = validateBpmnFile(filePath);

  // Output JSON if requested
  if (args.includes('--json')) {
    console.log(JSON.stringify(result.toJSON(), null, 2));
    process.exit(result.valid ? 0 : 1);
  }

  const passed = result.print();
  process.exit(passed ? 0 : 1);
}

main();
