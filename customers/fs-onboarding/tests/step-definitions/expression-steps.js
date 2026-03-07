/**
 * Step definitions for FEEL expression validation.
 */

const { Then } = require('@cucumber/cucumber');
const { expect } = require('chai');

Then('no condition expression uses JUEL syntax {string}', function (pattern) {
  const expressions = this.parser.getAllConditionExpressions();
  const juelExpressions = expressions.filter(e =>
    e.expression.includes('${') || e.expression.includes('#{')
  );
  const details = juelExpressions.map(e =>
    `  Flow "${e.flowId}": ${e.expression}`
  ).join('\n');
  expect(
    juelExpressions,
    `Found ${juelExpressions.length} JUEL expressions (must use FEEL for Camunda 8):\n${details}`
  ).to.be.empty;
});

Then('every condition expression starts with {string}', function (prefix) {
  const expressions = this.parser.getAllConditionExpressions();
  const nonFeel = expressions.filter(e => !e.expression.trimStart().startsWith(prefix));
  const details = nonFeel.map(e =>
    `  Flow "${e.flowId}": "${e.expression}" does not start with "${prefix}"`
  ).join('\n');
  expect(
    nonFeel,
    `Found ${nonFeel.length} non-FEEL expressions:\n${details}`
  ).to.be.empty;
});

Then('the sequence flow {string} has a FEEL condition expression', function (flowId) {
  const expr = this.parser.getConditionExpression(flowId);
  expect(expr, `Flow "${flowId}" has no condition expression`).to.exist;
  expect(
    expr.trimStart().startsWith('='),
    `Flow "${flowId}" expression "${expr}" does not use FEEL syntax (must start with "=")`
  ).to.be.true;
});

Then('the sequence flow {string} exists', function (flowId) {
  const flow = this.parser.flowIndex.get(flowId);
  expect(flow, `Sequence flow "${flowId}" not found`).to.exist;
});
