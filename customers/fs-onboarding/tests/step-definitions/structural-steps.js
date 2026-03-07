/**
 * Step definitions for structural validation.
 */

const { Then } = require('@cucumber/cucumber');
const { expect } = require('chai');

/**
 * Check if an element has flows in the given direction by checking both
 * the element's own incoming/outgoing arrays AND the global flow index.
 * bpmn-moddle sometimes does not populate incoming/outgoing for elements
 * inside nested sub-processes, so we fall back to the flow index.
 */
function hasFlows(parser, elementId, direction) {
  const el = parser.getElementById(elementId);
  if (!el) return false;

  // Check element's own arrays first
  const flows = el[direction] || [];
  if (flows.length > 0) return true;

  // Fall back to flow index
  const allFlows = parser.getAllSequenceFlows();
  for (const flow of allFlows) {
    const sourceId = typeof flow.sourceRef === 'string' ? flow.sourceRef : flow.sourceRef?.id;
    const targetId = typeof flow.targetRef === 'string' ? flow.targetRef : flow.targetRef?.id;
    if (direction === 'incoming' && targetId === elementId) return true;
    if (direction === 'outgoing' && sourceId === elementId) return true;
  }
  return false;
}

/**
 * Recursively check that all tasks have the specified flow direction.
 */
function checkFlowsRecursive(parser, container, taskTypes, direction, errors) {
  const elements = container.flowElements || [];
  for (const el of elements) {
    if (taskTypes.includes(el.$type)) {
      if (!hasFlows(parser, el.id, direction)) {
        errors.push(`${el.$type} "${el.id}" (${el.name || 'unnamed'}) has no ${direction} flow`);
      }
    }
    if (el.$type === 'bpmn:SubProcess') {
      checkFlowsRecursive(parser, el, taskTypes, direction, errors);
    }
  }
}

/**
 * Check start/end events using both element arrays and flow index.
 */
function countFlowsForElement(parser, elementId, direction) {
  const el = parser.getElementById(elementId);
  if (!el) return 0;

  // Check element's own arrays first
  const flows = el[direction] || [];
  if (flows.length > 0) return flows.length;

  // Fall back to flow index
  const allFlows = parser.getAllSequenceFlows();
  let count = 0;
  for (const flow of allFlows) {
    const sourceId = typeof flow.sourceRef === 'string' ? flow.sourceRef : flow.sourceRef?.id;
    const targetId = typeof flow.targetRef === 'string' ? flow.targetRef : flow.targetRef?.id;
    if (direction === 'incoming' && targetId === elementId) count++;
    if (direction === 'outgoing' && sourceId === elementId) count++;
  }
  return count;
}

Then('every sequence flow has a sourceRef that matches an existing element', function () {
  const flows = this.parser.getAllSequenceFlows();
  const errors = [];
  for (const flow of flows) {
    const sourceId = typeof flow.sourceRef === 'string' ? flow.sourceRef : flow.sourceRef?.id;
    if (!sourceId || !this.parser.getElementById(sourceId)) {
      errors.push(`Flow ${flow.id}: sourceRef "${sourceId}" not found`);
    }
  }
  expect(errors, errors.join('\n')).to.be.empty;
});

Then('every sequence flow has a targetRef that matches an existing element', function () {
  const flows = this.parser.getAllSequenceFlows();
  const errors = [];
  for (const flow of flows) {
    const targetId = typeof flow.targetRef === 'string' ? flow.targetRef : flow.targetRef?.id;
    if (!targetId || !this.parser.getElementById(targetId)) {
      errors.push(`Flow ${flow.id}: targetRef "${targetId}" not found`);
    }
  }
  expect(errors, errors.join('\n')).to.be.empty;
});

Then('every task in process {string} has at least one incoming flow', function (processId) {
  const process = this.parser.getProcess(processId);
  expect(process, `Process ${processId} not found`).to.exist;
  const errors = [];
  const taskTypes = [
    'bpmn:UserTask', 'bpmn:ServiceTask', 'bpmn:BusinessRuleTask',
    'bpmn:ReceiveTask', 'bpmn:SendTask', 'bpmn:SubProcess'
  ];
  checkFlowsRecursive(this.parser, process, taskTypes, 'incoming', errors);
  expect(errors, errors.join('\n')).to.be.empty;
});

Then('every task in process {string} has at least one outgoing flow', function (processId) {
  const process = this.parser.getProcess(processId);
  expect(process, `Process ${processId} not found`).to.exist;
  const errors = [];
  const taskTypes = [
    'bpmn:UserTask', 'bpmn:ServiceTask', 'bpmn:BusinessRuleTask',
    'bpmn:ReceiveTask', 'bpmn:SendTask', 'bpmn:SubProcess'
  ];
  checkFlowsRecursive(this.parser, process, taskTypes, 'outgoing', errors);
  expect(errors, errors.join('\n')).to.be.empty;
});

Then('every start event has exactly {int} incoming flows', function (count) {
  const startEvents = this.parser.getElementsByType('bpmn:StartEvent');
  const errors = [];
  for (const se of startEvents) {
    const flowCount = countFlowsForElement(this.parser, se.id, 'incoming');
    if (flowCount !== count) {
      errors.push(`Start event "${se.id}" has ${flowCount} incoming flows, expected ${count}`);
    }
  }
  expect(errors, errors.join('\n')).to.be.empty;
});

Then('every end event has exactly {int} outgoing flows', function (count) {
  const endEvents = this.parser.getElementsByType('bpmn:EndEvent');
  const errors = [];
  for (const ee of endEvents) {
    const flowCount = countFlowsForElement(this.parser, ee.id, 'outgoing');
    if (flowCount !== count) {
      errors.push(`End event "${ee.id}" has ${flowCount} outgoing flows, expected ${count}`);
    }
  }
  expect(errors, errors.join('\n')).to.be.empty;
});

Then('every start event has exactly {int} outgoing flow', function (count) {
  const startEvents = this.parser.getElementsByType('bpmn:StartEvent');
  const errors = [];
  for (const se of startEvents) {
    const flowCount = countFlowsForElement(this.parser, se.id, 'outgoing');
    if (flowCount !== count) {
      errors.push(`Start event "${se.id}" has ${flowCount} outgoing flows, expected ${count}`);
    }
  }
  expect(errors, errors.join('\n')).to.be.empty;
});

Then('process {string} has exactly {int} top-level start event(s)', function (processId, count) {
  const starts = this.parser.getTopLevelElements(processId, 'bpmn:StartEvent');
  expect(starts.length, `Process ${processId} has ${starts.length} top-level start events`).to.equal(count);
});

Then('process {string} has at least {int} top-level end events', function (processId, minCount) {
  const ends = this.parser.getTopLevelElements(processId, 'bpmn:EndEvent');
  expect(ends.length, `Process ${processId} has ${ends.length} top-level end events`).to.be.at.least(minCount);
});

Then('process {string} has exactly {int} top-level end events', function (processId, count) {
  const ends = this.parser.getTopLevelElements(processId, 'bpmn:EndEvent');
  expect(ends.length, `Process ${processId} has ${ends.length} top-level end events`).to.equal(count);
});

Then('the BPMN definitions include the Zeebe namespace {string}', function (ns) {
  expect(this.parser.hasZeebeNamespace(), `Zeebe namespace ${ns} not found`).to.be.true;
});

Then('process {string} has isExecutable set to {string}', function (processId, value) {
  const process = this.parser.getProcess(processId);
  expect(process, `Process ${processId} not found`).to.exist;
  expect(String(process.isExecutable)).to.equal(value);
});

Then('process {string} contains exactly {int} collapsed sub-processes', function (processId, count) {
  const sps = this.parser.getTopLevelElements(processId, 'bpmn:SubProcess');
  expect(sps.length, `Found ${sps.length} top-level sub-processes`).to.equal(count);
});

Then('the collaboration has exactly {int} participants', function (count) {
  const collab = this.parser.getCollaboration();
  expect(collab, 'No collaboration found').to.exist;
  expect(collab.participants.length).to.equal(count);
});

Then('the collaboration has exactly {int} message flows', function (count) {
  const flows = this.parser.getAllMessageFlows();
  expect(flows.length, `Found ${flows.length} message flows`).to.equal(count);
});
