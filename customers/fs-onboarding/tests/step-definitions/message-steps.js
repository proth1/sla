/**
 * Step definitions for message and receive task validation.
 */

const { Then } = require('@cucumber/cucumber');
const { expect } = require('chai');

Then('the receive task {string} has a messageRef attribute', function (taskId) {
  const task = this.parser.getElementById(taskId);
  expect(task, `Receive task "${taskId}" not found`).to.exist;
  expect(task.$type).to.equal('bpmn:ReceiveTask');
  expect(
    task.messageRef,
    `Receive task "${taskId}" is missing messageRef — Camunda 8 requires a message reference for correlation`
  ).to.exist;
});

Then('the start event {string} has a messageEventDefinition', function (eventId) {
  const event = this.parser.getElementById(eventId);
  expect(event, `Start event "${eventId}" not found`).to.exist;
  const hasMsgDef = (event.eventDefinitions || []).some(
    ed => ed.$type === 'bpmn:MessageEventDefinition'
  );
  expect(hasMsgDef, `Start event "${eventId}" has no messageEventDefinition`).to.be.true;
});

Then('the message flow {string} has a sourceRef that matches an existing element', function (flowId) {
  const mf = this.parser.messageFlowIndex.get(flowId);
  expect(mf, `Message flow "${flowId}" not found`).to.exist;
  const sourceId = typeof mf.sourceRef === 'string' ? mf.sourceRef : mf.sourceRef?.id;
  const source = this.parser.getElementById(sourceId);
  expect(source, `Message flow "${flowId}" sourceRef "${sourceId}" not found`).to.exist;
});

Then('the message flow {string} has a targetRef that matches an existing element', function (flowId) {
  const mf = this.parser.messageFlowIndex.get(flowId);
  expect(mf, `Message flow "${flowId}" not found`).to.exist;
  const targetId = typeof mf.targetRef === 'string' ? mf.targetRef : mf.targetRef?.id;
  const target = this.parser.getElementById(targetId);
  expect(target, `Message flow "${flowId}" targetRef "${targetId}" not found`).to.exist;
});

Then('every message flow connects elements in different pools', function () {
  const messageFlows = this.parser.getAllMessageFlows();
  const errors = [];
  for (const mf of messageFlows) {
    const sourceId = typeof mf.sourceRef === 'string' ? mf.sourceRef : mf.sourceRef?.id;
    const targetId = typeof mf.targetRef === 'string' ? mf.targetRef : mf.targetRef?.id;

    const sourceInEnterprise = this.parser.isElementInProcess(sourceId, 'Process_Onboarding_v8');
    const sourceInVendor = this.parser.isElementInProcess(sourceId, 'Process_Vendor');
    const targetInEnterprise = this.parser.isElementInProcess(targetId, 'Process_Onboarding_v8');
    const targetInVendor = this.parser.isElementInProcess(targetId, 'Process_Vendor');

    if (sourceInEnterprise && targetInEnterprise) {
      errors.push(`Message flow "${mf.id}" connects two elements within Enterprise pool`);
    }
    if (sourceInVendor && targetInVendor) {
      errors.push(`Message flow "${mf.id}" connects two elements within Vendor pool`);
    }
  }
  expect(errors, errors.join('\n')).to.be.empty;
});

Then('every message flow has a name attribute', function () {
  const messageFlows = this.parser.getAllMessageFlows();
  const errors = [];
  for (const mf of messageFlows) {
    if (!mf.name) {
      errors.push(`Message flow "${mf.id}" has no name`);
    }
  }
  expect(errors, errors.join('\n')).to.be.empty;
});

Then('the message flow {string} has sourceRef in process {string}', function (flowId, processId) {
  const mf = this.parser.messageFlowIndex.get(flowId);
  expect(mf, `Message flow "${flowId}" not found`).to.exist;
  const sourceId = typeof mf.sourceRef === 'string' ? mf.sourceRef : mf.sourceRef?.id;
  const inProcess = this.parser.isElementInProcess(sourceId, processId);
  expect(inProcess, `Message flow "${flowId}" sourceRef "${sourceId}" is not in process "${processId}"`).to.be.true;
});

Then('the message flow {string} has targetRef in process {string}', function (flowId, processId) {
  const mf = this.parser.messageFlowIndex.get(flowId);
  expect(mf, `Message flow "${flowId}" not found`).to.exist;
  const targetId = typeof mf.targetRef === 'string' ? mf.targetRef : mf.targetRef?.id;
  const inProcess = this.parser.isElementInProcess(targetId, processId);
  expect(inProcess, `Message flow "${flowId}" targetRef "${targetId}" is not in process "${processId}"`).to.be.true;
});
