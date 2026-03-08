/**
 * Step definitions for sub-process validation.
 */

const { Then } = require('@cucumber/cucumber');
const { expect } = require('chai');

Then('the sub-process {string} has a dedicated BPMNDiagram element', function (spId) {
  const diagram = this.parser.getDiagramForElement(spId);
  expect(
    diagram,
    `Sub-process "${spId}" has no dedicated BPMNDiagram (required for collapsed sub-process rendering)`
  ).to.exist;
});

Then('the sub-process {string} contains exactly {int} start event(s)', function (spId, count) {
  const sp = this.parser.getSubProcess(spId);
  expect(sp, `Sub-process "${spId}" not found`).to.exist;
  const starts = this.parser.getChildElementsByType(sp, 'bpmn:StartEvent');
  expect(starts.length, `Sub-process "${spId}" has ${starts.length} start events`).to.equal(count);
});

Then('the sub-process {string} contains at least {int} end event(s)', function (spId, minCount) {
  const sp = this.parser.getSubProcess(spId);
  expect(sp, `Sub-process "${spId}" not found`).to.exist;
  const ends = this.parser.getChildElementsByType(sp, 'bpmn:EndEvent');
  expect(ends.length, `Sub-process "${spId}" has ${ends.length} end events`).to.be.at.least(minCount);
});

Then('the sub-process {string} contains exactly {int} end event(s)', function (spId, count) {
  const sp = this.parser.getSubProcess(spId);
  expect(sp, `Sub-process "${spId}" not found`).to.exist;
  const ends = this.parser.getChildElementsByType(sp, 'bpmn:EndEvent');
  expect(ends.length, `Sub-process "${spId}" has ${ends.length} end events`).to.equal(count);
});

Then('every sub-process shape in {string} has isExpanded set to {string}', function (diagramId, value) {
  // Check the 5 main sub-processes
  const subProcessIds = [
    'SP_RequestTriage', 'SP_PlanningRouting', 'SP_EvalDD',
    'SP_ContractBuild', 'SP_UATGoLive'
  ];
  const errors = [];
  for (const spId of subProcessIds) {
    const isCollapsed = this.parser.isSubProcessCollapsedInDiagram(spId, diagramId);
    if (value === 'false' && !isCollapsed) {
      errors.push(`Sub-process "${spId}" is not collapsed (isExpanded="false") in ${diagramId}`);
    }
  }
  expect(errors, errors.join('\n')).to.be.empty;
});

Then('there are no duplicate BPMNShape id attributes in the entire file', function () {
  const ids = this.parser.getAllShapeIds();
  const seen = new Set();
  const duplicates = [];
  for (const id of ids) {
    if (seen.has(id)) {
      duplicates.push(id);
    }
    seen.add(id);
  }
  expect(
    duplicates,
    `Duplicate BPMNShape IDs found: ${duplicates.join(', ')}`
  ).to.be.empty;
});

Then('the sub-process {string} is defined inside sub-process {string}', function (childId, parentId) {
  const parent = this.parser.getSubProcess(parentId);
  expect(parent, `Parent sub-process "${parentId}" not found`).to.exist;
  const elements = parent.flowElements || [];
  const found = elements.some(el => el.id === childId && el.$type === 'bpmn:SubProcess');
  expect(found, `Sub-process "${childId}" is not a direct child of "${parentId}"`).to.be.true;
});
