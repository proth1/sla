#!/usr/bin/env node

/**
 * Element Checker - Verifies all BPMN elements are supported by SLA Governance Platform
 *
 * Usage: node element-checker.js <directory>
 *
 * Scans all .bpmn files in the directory and reports:
 * - Element usage statistics
 * - Unsupported elements
 * - Configuration requirements
 */

import fs from 'fs/promises';
import path from 'path';
import BpmnModdle from 'bpmn-moddle';

const moddle = new BpmnModdle();

// Complete element support matrix for SLA Governance Platform
const ELEMENT_SUPPORT = {
  // Flow Elements
  'bpmn:StartEvent': { supported: true, notes: 'Standard start event' },
  'bpmn:EndEvent': { supported: true, notes: 'Standard end event' },
  'bpmn:Task': { supported: true, notes: 'Generic task' },
  'bpmn:ServiceTask': { supported: true, notes: 'HTTP connector or Cloud Run' },
  'bpmn:UserTask': { supported: true, notes: 'With form support' },
  'bpmn:ScriptTask': { supported: true, notes: 'JavaScript or Python' },
  'bpmn:SendTask': { supported: true, notes: 'Via Pub/Sub' },
  'bpmn:ReceiveTask': { supported: true, notes: 'Via Pub/Sub subscription' },
  'bpmn:ManualTask': { supported: true, notes: 'Human acknowledgment' },
  'bpmn:BusinessRuleTask': { supported: true, notes: 'DMN integration' },

  // Gateways
  'bpmn:ExclusiveGateway': { supported: true, notes: 'XOR split/join' },
  'bpmn:ParallelGateway': { supported: true, notes: 'AND split/join' },
  'bpmn:InclusiveGateway': { supported: true, notes: 'OR split/join' },
  'bpmn:EventBasedGateway': { supported: true, notes: 'Event-driven routing' },
  'bpmn:ComplexGateway': { supported: false, notes: 'Use inclusive gateway instead' },

  // Sub-processes
  'bpmn:SubProcess': { supported: true, notes: 'Embedded or event' },
  'bpmn:CallActivity': { supported: true, notes: 'Call external process' },
  'bpmn:Transaction': { supported: false, notes: 'Use subprocess with compensation' },
  'bpmn:AdHocSubProcess': { supported: false, notes: 'Not supported' },

  // Events
  'bpmn:IntermediateCatchEvent': { supported: true, notes: 'With timer/message' },
  'bpmn:IntermediateThrowEvent': { supported: true, notes: 'With message/none' },
  'bpmn:BoundaryEvent': { supported: true, notes: 'With timer/error/message' },

  // Event Definitions
  'bpmn:TimerEventDefinition': { supported: true, notes: 'Via Cloud Scheduler' },
  'bpmn:MessageEventDefinition': { supported: true, notes: 'Via Pub/Sub' },
  'bpmn:ErrorEventDefinition': { supported: true, notes: 'Error handling' },
  'bpmn:SignalEventDefinition': { supported: false, notes: 'Use message events' },
  'bpmn:EscalationEventDefinition': { supported: false, notes: 'Use message events' },
  'bpmn:CompensateEventDefinition': { supported: false, notes: 'Handle in error boundary' },
  'bpmn:ConditionalEventDefinition': { supported: false, notes: 'Use exclusive gateway' },
  'bpmn:LinkEventDefinition': { supported: false, notes: 'Use sequence flows' },
  'bpmn:TerminateEventDefinition': { supported: true, notes: 'Process termination' },
  'bpmn:CancelEventDefinition': { supported: false, notes: 'Use terminate event' },

  // Artifacts
  'bpmn:TextAnnotation': { supported: true, notes: 'Documentation only' },
  'bpmn:Group': { supported: true, notes: 'Visual grouping only' },
  'bpmn:DataObjectReference': { supported: true, notes: 'Variable reference' },
  'bpmn:DataStoreReference': { supported: true, notes: 'External data reference' },

  // Connections
  'bpmn:SequenceFlow': { supported: true, notes: 'Standard flow' },
  'bpmn:MessageFlow': { supported: true, notes: 'Between pools' },
  'bpmn:Association': { supported: true, notes: 'Documentation link' },
  'bpmn:DataInputAssociation': { supported: true, notes: 'Input mapping' },
  'bpmn:DataOutputAssociation': { supported: true, notes: 'Output mapping' },

  // Containers
  'bpmn:Process': { supported: true, notes: 'Root process' },
  'bpmn:Participant': { supported: true, notes: 'Pool/lane' },
  'bpmn:Lane': { supported: true, notes: 'Organizational lane' },
  'bpmn:LaneSet': { supported: true, notes: 'Lane container' }
};

class ElementReport {
  constructor() {
    this.files = [];
    this.elements = new Map();
    this.unsupported = new Map();
    this.configRequired = [];
  }

  addFile(filePath) {
    this.files.push(filePath);
  }

  addElement(type, elementId, filePath) {
    if (!this.elements.has(type)) {
      this.elements.set(type, []);
    }
    this.elements.get(type).push({ id: elementId, file: filePath });
  }

  addUnsupported(type, elementId, filePath, alternative) {
    if (!this.unsupported.has(type)) {
      this.unsupported.set(type, []);
    }
    this.unsupported.get(type).push({ id: elementId, file: filePath, alternative });
  }

  addConfigRequired(elementId, filePath, configType) {
    this.configRequired.push({ id: elementId, file: filePath, configType });
  }

  print() {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║          SLA GOVERNANCE PLATFORM - ELEMENT REPORT              ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    // Files scanned
    console.log(`📁 Files Scanned: ${this.files.length}`);
    this.files.forEach(f => console.log(`   - ${path.basename(f)}`));
    console.log('');

    // Element statistics
    console.log('📊 Element Usage Statistics:');
    console.log('─'.repeat(60));

    const sortedElements = [...this.elements.entries()].sort(
      (a, b) => b[1].length - a[1].length
    );

    for (const [type, instances] of sortedElements) {
      const support = ELEMENT_SUPPORT[type];
      const status = support?.supported ? '✓' : support ? '✗' : '?';
      const notes = support?.notes || 'Unknown';
      console.log(`   ${status} ${type.replace('bpmn:', '')}: ${instances.length} (${notes})`);
    }
    console.log('');

    // Unsupported elements
    if (this.unsupported.size > 0) {
      console.log('⚠️  Unsupported Elements Found:');
      console.log('─'.repeat(60));

      for (const [type, instances] of this.unsupported) {
        console.log(`\n   ${type.replace('bpmn:', '')}:`);
        for (const { id, file, alternative } of instances) {
          console.log(`     - ${id} in ${path.basename(file)}`);
          if (alternative) {
            console.log(`       ↳ Alternative: ${alternative}`);
          }
        }
      }
      console.log('');
    } else {
      console.log('✅ All elements are supported!\n');
    }

    // Configuration required
    if (this.configRequired.length > 0) {
      console.log('⚙️  Configuration Required:');
      console.log('─'.repeat(60));

      for (const { id, file, configType } of this.configRequired) {
        console.log(`   - ${id} (${configType}) in ${path.basename(file)}`);
      }
      console.log('');
    }

    // Summary
    console.log('═'.repeat(60));
    const totalElements = [...this.elements.values()].reduce((sum, arr) => sum + arr.length, 0);
    const totalUnsupported = [...this.unsupported.values()].reduce((sum, arr) => sum + arr.length, 0);

    console.log(`Total Elements: ${totalElements}`);
    console.log(`Supported: ${totalElements - totalUnsupported}`);
    console.log(`Unsupported: ${totalUnsupported}`);
    console.log(`Config Required: ${this.configRequired.length}`);
    console.log('═'.repeat(60) + '\n');

    return totalUnsupported === 0;
  }
}

async function scanDirectory(dirPath) {
  const report = new ElementReport();
  const absolutePath = path.resolve(dirPath);

  // Find all .bpmn files - accept docs-only (isExecutable="false") models as well
  const files = await fs.readdir(absolutePath);
  const bpmnFiles = files.filter(f => f.endsWith('.bpmn'));

  if (bpmnFiles.length === 0) {
    console.log(`No .bpmn files found in ${absolutePath}`);
    return report;
  }

  for (const file of bpmnFiles) {
    const filePath = path.join(absolutePath, file);
    report.addFile(filePath);

    try {
      const bpmnXml = await fs.readFile(filePath, 'utf8');
      const { rootElement } = await moddle.fromXML(bpmnXml);
      await scanDefinitions(rootElement, filePath, report);
    } catch (e) {
      console.error(`Error parsing ${file}: ${e.message}`);
    }
  }

  return report;
}

async function scanDefinitions(definitions, filePath, report) {
  const processes = definitions.rootElements?.filter(e => e.$type === 'bpmn:Process') || [];

  for (const process of processes) {
    await scanProcess(process, filePath, report);
  }
}

async function scanProcess(process, filePath, report) {
  const elements = process.flowElements || [];

  for (const element of elements) {
    scanElement(element, filePath, report);
  }

  // Also scan artifacts
  const artifacts = process.artifacts || [];
  for (const artifact of artifacts) {
    scanElement(artifact, filePath, report);
  }

  // Scan lane sets
  const laneSets = process.laneSets || [];
  for (const laneSet of laneSets) {
    scanElement(laneSet, filePath, report);
    for (const lane of laneSet.lanes || []) {
      scanElement(lane, filePath, report);
    }
  }
}

function scanElement(element, filePath, report) {
  const type = element.$type;

  // Record element usage
  report.addElement(type, element.id, filePath);

  // Check support status
  const support = ELEMENT_SUPPORT[type];
  if (support && !support.supported) {
    report.addUnsupported(type, element.id, filePath, support.notes);
  } else if (!support) {
    report.addUnsupported(type, element.id, filePath, 'Unknown element type');
  }

  // Check for event definitions
  if (element.eventDefinitions) {
    for (const eventDef of element.eventDefinitions) {
      scanElement(eventDef, filePath, report);
    }
  }

  // Check for configuration requirements
  if (type === 'bpmn:ServiceTask') {
    const hasConfig = element.extensionElements?.values?.some(
      ext => ext.$type === 'sla:taskConfig' || ext.$type === 'zeebe:taskDefinition'
    );
    if (!hasConfig) {
      report.addConfigRequired(element.id, filePath, 'Service endpoint');
    }
  }

  if (type === 'bpmn:TimerEventDefinition') {
    const hasTimerDef = element.timeDuration || element.timeDate || element.timeCycle;
    if (!hasTimerDef) {
      report.addConfigRequired(element.id, filePath, 'Timer definition');
    }
  }

  // Recursively scan subprocesses
  if (element.flowElements) {
    for (const subElement of element.flowElements) {
      scanElement(subElement, filePath, report);
    }
  }
}

// Main execution
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('Usage: node element-checker.js <directory>');
  process.exit(1);
}

const dirPath = args[0];
scanDirectory(dirPath).then(report => {
  const passed = report.print();
  process.exit(passed ? 0 : 1);
});
