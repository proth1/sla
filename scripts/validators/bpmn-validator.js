#!/usr/bin/env node

/**
 * BPMN Validator - Validates BPMN 2.0 XML files for SLA Governance Platform
 *
 * Usage: node bpmn-validator.js <bpmn-file>
 *
 * Validates:
 * - XML schema compliance
 * - BPMN 2.0 specification compliance
 * - SLA Governance Platform element support
 * - Service task configurations
 * - Swim-lane candidateGroup assignments
 */

import fs from 'fs/promises';
import path from 'path';
import BpmnModdle from 'bpmn-moddle';
import camundaModdle from 'camunda-bpmn-moddle/resources/camunda.json' with { type: 'json' };

const moddle = new BpmnModdle({ camunda: camundaModdle });

// Elements supported by SLA Governance Platform
const SUPPORTED_ELEMENTS = [
  'bpmn:Process',
  'bpmn:StartEvent',
  'bpmn:EndEvent',
  'bpmn:Task',
  'bpmn:ServiceTask',
  'bpmn:UserTask',
  'bpmn:ScriptTask',
  'bpmn:SendTask',
  'bpmn:ReceiveTask',
  'bpmn:ManualTask',
  'bpmn:BusinessRuleTask',
  'bpmn:ExclusiveGateway',
  'bpmn:ParallelGateway',
  'bpmn:InclusiveGateway',
  'bpmn:EventBasedGateway',
  'bpmn:SequenceFlow',
  'bpmn:SubProcess',
  'bpmn:CallActivity',
  'bpmn:BoundaryEvent',
  'bpmn:IntermediateCatchEvent',
  'bpmn:IntermediateThrowEvent'
];

// Event definitions with limited support
const PARTIALLY_SUPPORTED_EVENTS = [
  'bpmn:TimerEventDefinition', // Supported via Cloud Scheduler
  'bpmn:MessageEventDefinition', // Supported via Pub/Sub
  'bpmn:ErrorEventDefinition'
];

// Event definitions NOT supported
const UNSUPPORTED_EVENTS = [
  'bpmn:EscalationEventDefinition',
  'bpmn:CompensateEventDefinition',
  'bpmn:ConditionalEventDefinition',
  'bpmn:LinkEventDefinition'
];

// Valid SLA Governance Platform swim-lane candidateGroups (9+1 lanes)
const VALID_CANDIDATE_GROUPS = [
  'business-lane',
  'governance-lane',
  'contracting-lane',
  'technical-assessment',
  'ai-review',
  'compliance-lane',
  'oversight-lane',
  'automation-lane',
  'vendor-response'
];

// Valid DMN decision table IDs (8 canonical tables)
const VALID_DMN_IDS = [
  'DMN_RiskTierClassification',
  'DMN_PathwayRouting',
  'DMN_GovernanceReviewRouting',
  'DMN_AutomationTierAssignment',
  'DMN_AgentConfidenceEscalation',
  'DMN_ChangeRiskScoring',
  'DMN_VulnerabilityRemediationRouting',
  'DMN_MonitoringCadenceAssignment'
];

class ValidationResult {
  constructor() {
    this.valid = true;
    this.errors = [];
    this.warnings = [];
    this.info = [];
  }

  addError(message, element = null) {
    this.valid = false;
    this.errors.push({ message, element });
  }

  addWarning(message, element = null) {
    this.warnings.push({ message, element });
  }

  addInfo(message) {
    this.info.push(message);
  }

  print() {
    console.log('\n=== BPMN Validation Results ===\n');

    if (this.info.length > 0) {
      console.log('INFO:');
      this.info.forEach(msg => console.log(`  ℹ ${msg}`));
      console.log('');
    }

    if (this.errors.length > 0) {
      console.log('ERRORS:');
      this.errors.forEach(err => {
        const loc = err.element ? ` (${err.element})` : '';
        console.log(`  ✗ ${err.message}${loc}`);
      });
      console.log('');
    }

    if (this.warnings.length > 0) {
      console.log('WARNINGS:');
      this.warnings.forEach(warn => {
        const loc = warn.element ? ` (${warn.element})` : '';
        console.log(`  ⚠ ${warn.message}${loc}`);
      });
      console.log('');
    }

    if (this.valid) {
      console.log('✓ Validation PASSED\n');
    } else {
      console.log('✗ Validation FAILED\n');
    }

    return this.valid;
  }
}

async function validateBpmn(filePath) {
  const result = new ValidationResult();
  const absolutePath = path.resolve(filePath);

  // Check file exists
  try {
    await fs.access(absolutePath);
  } catch (e) {
    result.addError(`File not found: ${absolutePath}`);
    return result;
  }

  // Read file
  let bpmnXml;
  try {
    bpmnXml = await fs.readFile(absolutePath, 'utf8');
    result.addInfo(`File: ${absolutePath}`);
    result.addInfo(`Size: ${bpmnXml.length} bytes`);
  } catch (e) {
    result.addError(`Failed to read file: ${e.message}`);
    return result;
  }

  // Parse BPMN XML
  let definitions;
  try {
    const { rootElement } = await moddle.fromXML(bpmnXml);
    definitions = rootElement;
    result.addInfo('XML parsing: OK');
  } catch (e) {
    result.addError(`XML parsing failed: ${e.message}`);
    return result;
  }

  // Find processes
  const processes = definitions.rootElements?.filter(e => e.$type === 'bpmn:Process') || [];
  if (processes.length === 0) {
    result.addError('No process definition found');
    return result;
  }

  result.addInfo(`Processes found: ${processes.length}`);

  // Validate each process
  for (const process of processes) {
    validateProcess(process, result);
  }

  return result;
}

function validateProcess(process, result) {
  result.addInfo(`Validating process: ${process.id}`);

  // Accept both isExecutable="true" (runtime) and isExecutable="false" (docs-only models)
  if (process.isExecutable === false) {
    result.addInfo(`Process ${process.id} is a docs-only model (isExecutable="false") - skipping runtime-specific checks`);
  }

  const elements = process.flowElements || [];

  // Check for start event
  const startEvents = elements.filter(e => e.$type === 'bpmn:StartEvent');
  if (startEvents.length === 0) {
    result.addError('Process must have at least one start event', process.id);
  } else if (startEvents.length > 1) {
    result.addWarning('Multiple start events found - only one will be used', process.id);
  }

  // Check for end event
  const endEvents = elements.filter(e => e.$type === 'bpmn:EndEvent');
  if (endEvents.length === 0) {
    result.addWarning('Process has no end event - may not complete properly', process.id);
  }

  // Validate all elements
  for (const element of elements) {
    validateElement(element, result);
  }

  // Validate sequence flows
  const sequenceFlows = elements.filter(e => e.$type === 'bpmn:SequenceFlow');
  for (const flow of sequenceFlows) {
    if (!flow.sourceRef) {
      result.addError(`Sequence flow missing source: ${flow.id}`, flow.id);
    }
    if (!flow.targetRef) {
      result.addError(`Sequence flow missing target: ${flow.id}`, flow.id);
    }
  }

  // Check connectivity
  validateConnectivity(elements, result);

  // Validate swim-lane candidateGroups if laneSets exist
  const laneSets = process.laneSets || [];
  if (laneSets.length > 0) {
    validateSwimLanes(process, elements, result);
  }

  // Validate DMN decision references
  validateDmnReferences(process, elements, result);

  // Validate boundary events have outgoing flows
  validateBoundaryEvents(elements, result);
}

/**
 * Validate SLA Governance Platform swim-lane candidateGroup assignments.
 * User tasks must use one of the 9+1 valid governance groups.
 */
function validateSwimLanes(process, elements, result) {
  result.addInfo(`Validating swim-lane candidateGroups for process: ${process.id}`);

  const userTasks = elements.filter(e => e.$type === 'bpmn:UserTask');

  for (const task of userTasks) {
    // camunda-bpmn-moddle parses camunda:candidateGroups as a string attribute
    const candidateGroupsAttr = task.candidateGroups || task.$attrs?.['camunda:candidateGroups'] || '';
    const candidateGroups = typeof candidateGroupsAttr === 'string'
      ? candidateGroupsAttr.split(',').map(g => g.trim()).filter(Boolean)
      : [];

    if (candidateGroups.length === 0) {
      result.addWarning(
        `UserTask has no candidateGroups - assign to one of: ${VALID_CANDIDATE_GROUPS.join(', ')}`,
        task.id
      );
      continue;
    }

    for (const group of candidateGroups) {
      if (!VALID_CANDIDATE_GROUPS.includes(group)) {
        result.addError(
          `candidateGroup "${group}" is not a recognized SLA Governance group. Valid groups: ${VALID_CANDIDATE_GROUPS.join(', ')}`,
          task.id
        );
      }
    }
  }
}

/**
 * Validate DMN decision references against the 8 canonical table IDs.
 */
function validateDmnReferences(process, elements, result) {
  const businessRuleTasks = elements.filter(e => e.$type === 'bpmn:BusinessRuleTask');

  for (const task of businessRuleTasks) {
    const decisionRef = task.decisionRef || task.$attrs?.['camunda:decisionRef'] || '';

    if (!decisionRef) {
      result.addWarning(
        `BusinessRuleTask has no camunda:decisionRef - should reference a DMN table`,
        task.id
      );
      continue;
    }

    if (!VALID_DMN_IDS.includes(decisionRef)) {
      result.addError(
        `decisionRef "${decisionRef}" is not a canonical DMN table ID. Valid IDs: ${VALID_DMN_IDS.join(', ')}`,
        task.id
      );
    }
  }
}

/**
 * Validate that all boundary events have outgoing flows.
 */
function validateBoundaryEvents(elements, result) {
  const boundaryEvents = elements.filter(e => e.$type === 'bpmn:BoundaryEvent');

  for (const event of boundaryEvents) {
    const outgoing = event.outgoing || [];
    if (outgoing.length === 0) {
      result.addError(
        `BoundaryEvent has no outgoing flow - timer/error boundaries must connect to an escalation target`,
        event.id
      );
    }
  }
}

function validateElement(element, result) {
  const type = element.$type;

  // Check if element type is supported
  if (!SUPPORTED_ELEMENTS.includes(type)) {
    result.addWarning(`Unsupported element type: ${type}`, element.id);
  }

  // Check event definitions
  if (element.eventDefinitions) {
    for (const eventDef of element.eventDefinitions) {
      const defType = eventDef.$type;

      if (UNSUPPORTED_EVENTS.includes(defType)) {
        result.addWarning(
          `Unsupported event definition: ${defType}. Consider using message or timer events instead.`,
          element.id
        );
      } else if (PARTIALLY_SUPPORTED_EVENTS.includes(defType)) {
        result.addInfo(`Event definition ${defType} is supported with specific configuration`);

        // Validate timer configuration
        if (defType === 'bpmn:TimerEventDefinition') {
          validateTimerEvent(eventDef, element, result);
        }
      }
    }
  }

  // Validate service tasks
  if (type === 'bpmn:ServiceTask') {
    validateServiceTask(element, result);
  }

  // Validate gateways
  if (type.includes('Gateway')) {
    validateGateway(element, result);
  }

  // Validate script tasks
  if (type === 'bpmn:ScriptTask') {
    validateScriptTask(element, result);
  }
}

function validateServiceTask(task, result) {
  // Check for Camunda 7 external task or delegate configuration
  const hasConfig =
    task.$attrs?.['camunda:type'] ||
    task.$attrs?.['camunda:class'] ||
    task.$attrs?.['camunda:delegateExpression'] ||
    task.$attrs?.['camunda:expression'] ||
    task.$attrs?.['camunda:topic'] ||
    task.extensionElements?.values?.some(
      ext => ext.$type === 'camunda:connector'
    );

  if (!hasConfig) {
    result.addWarning(
      'Service task has no Camunda 7 configuration (camunda:type, camunda:class, or camunda:topic) - will need runtime configuration',
      task.id
    );
  }
}

function validateGateway(gateway, result) {
  const incoming = gateway.incoming || [];
  const outgoing = gateway.outgoing || [];

  if (gateway.$type === 'bpmn:ExclusiveGateway') {
    // XOR gateway should have conditions on outgoing flows (except default)
    const flowsWithoutCondition = outgoing.filter(
      flow => !flow.conditionExpression && flow.id !== gateway.default?.id
    );

    if (flowsWithoutCondition.length > 0 && outgoing.length > 1) {
      result.addWarning(
        'Exclusive gateway has flows without conditions - may cause unexpected behavior',
        gateway.id
      );
    }
  }

  if (gateway.$type === 'bpmn:ParallelGateway') {
    // Parallel join should have multiple incoming flows
    if (incoming.length < 2 && outgoing.length <= 1) {
      result.addInfo('Parallel gateway with single path - may be unnecessary');
    }
  }
}

function validateScriptTask(task, result) {
  if (!task.script && !task.scriptFormat) {
    result.addWarning('Script task has no script defined', task.id);
  }

  if (task.scriptFormat && !['javascript', 'python', 'groovy'].includes(task.scriptFormat)) {
    result.addWarning(`Script format '${task.scriptFormat}' may not be supported`, task.id);
  }
}

function validateTimerEvent(eventDef, element, result) {
  const hasDefinition =
    eventDef.timeDuration ||
    eventDef.timeDate ||
    eventDef.timeCycle;

  if (!hasDefinition) {
    result.addWarning('Timer event has no duration, date, or cycle defined', element.id);
  }
}

function validateConnectivity(elements, result) {
  // Build a simple graph and check for unreachable elements
  const nodes = new Set();
  const edges = new Map();

  for (const element of elements) {
    if (element.$type !== 'bpmn:SequenceFlow') {
      nodes.add(element.id);
      edges.set(element.id, []);
    }
  }

  for (const element of elements) {
    if (element.$type === 'bpmn:SequenceFlow') {
      const sourceId = element.sourceRef?.id;
      const targetId = element.targetRef?.id;
      if (sourceId && edges.has(sourceId)) {
        edges.get(sourceId).push(targetId);
      }
    }
  }

  // Find start events
  const startEvents = elements
    .filter(e => e.$type === 'bpmn:StartEvent')
    .map(e => e.id);

  // BFS from start events
  const reachable = new Set();
  const queue = [...startEvents];

  while (queue.length > 0) {
    const current = queue.shift();
    if (reachable.has(current)) continue;
    reachable.add(current);

    const neighbors = edges.get(current) || [];
    for (const neighbor of neighbors) {
      if (!reachable.has(neighbor)) {
        queue.push(neighbor);
      }
    }
  }

  // Check for unreachable nodes
  for (const nodeId of nodes) {
    if (!reachable.has(nodeId)) {
      const element = elements.find(e => e.id === nodeId);
      if (element && element.$type !== 'bpmn:StartEvent' && element.$type !== 'bpmn:BoundaryEvent') {
        result.addWarning(`Element is not reachable from start event`, nodeId);
      }
    }
  }
}

// Main execution
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('Usage: node bpmn-validator.js <bpmn-file>');
  process.exit(1);
}

const filePath = args[0];
validateBpmn(filePath).then(result => {
  const passed = result.print();
  process.exit(passed ? 0 : 1);
}).catch(err => { console.error(err.message); process.exit(1); });
