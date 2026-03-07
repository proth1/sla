/**
 * Step definitions for timer and SLA validation.
 */

const { Then } = require('@cucumber/cucumber');
const { expect } = require('chai');

Then('the boundary event {string} is attached to {string}', function (eventId, taskId) {
  const event = this.parser.getElementById(eventId);
  expect(event, `Boundary event "${eventId}" not found`).to.exist;
  const attachedToId = typeof event.attachedToRef === 'string'
    ? event.attachedToRef
    : event.attachedToRef?.id;
  expect(
    attachedToId,
    `Boundary event "${eventId}" attachedToRef is "${attachedToId}", expected "${taskId}"`
  ).to.equal(taskId);
});

Then('the boundary event {string} has cancelActivity set to {string}', function (eventId, value) {
  const event = this.parser.getElementById(eventId);
  expect(event, `Boundary event "${eventId}" not found`).to.exist;
  expect(
    String(event.cancelActivity),
    `Boundary event "${eventId}" cancelActivity is "${event.cancelActivity}", expected "${value}"`
  ).to.equal(value);
});

Then('the timer event {string} has duration {string}', function (eventId, expectedDuration) {
  const duration = this.parser.getTimerDuration(eventId);
  expect(duration, `Timer event "${eventId}" has no duration`).to.exist;
  expect(
    duration,
    `Timer "${eventId}" duration is "${duration}", expected "${expectedDuration}"`
  ).to.equal(expectedDuration);
});

Then('the boundary event {string} has at least {int} outgoing flow(s)', function (eventId, minCount) {
  const event = this.parser.getElementById(eventId);
  expect(event, `Boundary event "${eventId}" not found`).to.exist;
  const outgoing = event.outgoing || [];
  expect(
    outgoing.length,
    `Boundary event "${eventId}" has ${outgoing.length} outgoing flows, expected at least ${minCount}`
  ).to.be.at.least(minCount);
});

Then('the intermediate catch event {string} has at least {int} outgoing flow(s)', function (eventId, minCount) {
  const event = this.parser.getElementById(eventId);
  expect(event, `Intermediate catch event "${eventId}" not found`).to.exist;
  const outgoing = event.outgoing || [];
  expect(
    outgoing.length,
    `Intermediate catch event "${eventId}" has ${outgoing.length} outgoing flows, expected at least ${minCount}`
  ).to.be.at.least(minCount);
});

Then('every timer duration matches the pattern {string}', function (pattern) {
  // Collect all timer events
  const timerTypes = ['bpmn:BoundaryEvent', 'bpmn:IntermediateCatchEvent'];
  const errors = [];
  const iso8601 = /^P(\d+[YMWD])*(T(\d+[HMS])+)?$/;

  for (const [, el] of this.parser.elementIndex) {
    if (!timerTypes.includes(el.$type)) continue;
    const eventDefs = el.eventDefinitions || [];
    for (const ed of eventDefs) {
      if (ed.$type === 'bpmn:TimerEventDefinition' && ed.timeDuration) {
        const duration = ed.timeDuration.body || ed.timeDuration.text || '';
        if (!iso8601.test(duration)) {
          errors.push(`Timer "${el.id}" has invalid ISO 8601 duration: "${duration}"`);
        }
      }
    }
  }
  expect(errors, errors.join('\n')).to.be.empty;
});
