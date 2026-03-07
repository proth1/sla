/**
 * Step definitions for happy path and rejection path validation.
 */

const { Then } = require('@cucumber/cucumber');
const { expect } = require('chai');

Then('a valid path exists through these elements in order:', function (dataTable) {
  const elementIds = dataTable.raw().map(row => row[0]);
  const result = this.parser.pathExists(elementIds);
  expect(
    result.valid,
    `No sequence flow connects "${result.from}" to "${result.to}"`
  ).to.be.true;
});

Then('a valid path exists within sub-process {string} through:', function (spId, dataTable) {
  const sp = this.parser.getSubProcess(spId);
  expect(sp, `Sub-process "${spId}" not found`).to.exist;
  const elementIds = dataTable.raw().map(row => row[0]);
  const result = this.parser.pathExists(elementIds);
  expect(
    result.valid,
    `Within sub-process "${spId}": no sequence flow connects "${result.from}" to "${result.to}"`
  ).to.be.true;
});

Then('the end event {string} has a name', function (eventId) {
  const event = this.parser.getElementById(eventId);
  expect(event, `End event "${eventId}" not found`).to.exist;
  expect(event.name, `End event "${eventId}" has no name`).to.exist;
  expect(event.name.trim().length, `End event "${eventId}" has an empty name`).to.be.greaterThan(0);
});

Then('the element {string} is reachable from {string}', function (targetId, sourceId) {
  const reachable = this.parser.isReachable(sourceId, targetId);
  expect(
    reachable,
    `Element "${targetId}" is NOT reachable from "${sourceId}" via sequence flows`
  ).to.be.true;
});

Then('the service task {string} has a zeebe:taskDefinition with type {string}', function (taskId, expectedType) {
  const actualType = this.parser.getTaskDefinitionType(taskId);
  expect(actualType, `Service task "${taskId}" has no zeebe:taskDefinition`).to.exist;
  expect(actualType, `Service task "${taskId}" has type "${actualType}", expected "${expectedType}"`).to.equal(expectedType);
});

Then('the user task {string} has candidateGroups {string}', function (taskId, expectedGroups) {
  const groups = this.parser.getCandidateGroups(taskId);
  expect(groups, `User task "${taskId}" has no candidateGroups`).to.exist;
  expect(groups, `User task "${taskId}" has candidateGroups "${groups}", expected "${expectedGroups}"`).to.equal(expectedGroups);
});
