/**
 * Step definitions for gateway validation.
 */

const { Then } = require('@cucumber/cucumber');
const { expect } = require('chai');

Then('the exclusive gateway {string} has either a default flow or all outgoing flows have conditions', function (gatewayId) {
  const gw = this.parser.getElementById(gatewayId);
  expect(gw, `Gateway "${gatewayId}" not found`).to.exist;
  expect(gw.$type).to.equal('bpmn:ExclusiveGateway');

  const outgoing = gw.outgoing || [];
  // Skip merge gateways (1 or fewer outgoing)
  if (outgoing.length <= 1) return;

  // Check for default flow
  if (gw.default) return;

  // Otherwise, all outgoing flows must have conditions
  const flowsWithoutCondition = [];
  for (const outRef of outgoing) {
    const flowId = typeof outRef === 'string' ? outRef : outRef.id;
    const flow = this.parser.flowIndex.get(flowId);
    if (flow && !flow.conditionExpression) {
      flowsWithoutCondition.push(flowId);
    }
  }

  expect(
    flowsWithoutCondition,
    `Gateway "${gatewayId}" has no default flow and these outgoing flows lack conditions: ${flowsWithoutCondition.join(', ')}`
  ).to.be.empty;
});

Then('the exclusive gateway {string} has exactly {int} outgoing flow(s)', function (gatewayId, count) {
  const gw = this.parser.getElementById(gatewayId);
  expect(gw, `Gateway "${gatewayId}" not found`).to.exist;
  const outgoing = gw.outgoing || [];
  expect(outgoing.length, `Gateway "${gatewayId}" has ${outgoing.length} outgoing flows`).to.equal(count);
});

Then('the exclusive gateway {string} has no name attribute', function (gatewayId) {
  const gw = this.parser.getElementById(gatewayId);
  expect(gw, `Gateway "${gatewayId}" not found`).to.exist;
  expect(gw.name, `Merge gateway "${gatewayId}" should have no name but has "${gw.name}"`).to.not.exist;
});

Then('the parallel gateway {string} has exactly {int} outgoing flows', function (gatewayId, count) {
  const gw = this.parser.getElementById(gatewayId);
  expect(gw, `Gateway "${gatewayId}" not found`).to.exist;
  const outgoing = gw.outgoing || [];
  expect(outgoing.length, `Parallel gateway "${gatewayId}" has ${outgoing.length} outgoing flows`).to.equal(count);
});

Then('the parallel gateway {string} has exactly {int} incoming flows', function (gatewayId, count) {
  const gw = this.parser.getElementById(gatewayId);
  expect(gw, `Gateway "${gatewayId}" not found`).to.exist;
  const incoming = gw.incoming || [];
  expect(incoming.length, `Parallel gateway "${gatewayId}" has ${incoming.length} incoming flows`).to.equal(count);
});

Then('every named exclusive gateway has a name ending with {string}', function (suffix) {
  const gateways = this.parser.getElementsByType('bpmn:ExclusiveGateway');
  const errors = [];
  for (const gw of gateways) {
    if (!gw.name) continue; // Skip merge gateways (no name)
    // Normalize name by removing line breaks
    const normalizedName = gw.name.replace(/\n/g, ' ').trim();
    if (!normalizedName.endsWith(suffix)) {
      errors.push(`Gateway "${gw.id}" name "${normalizedName}" does not end with "${suffix}"`);
    }
  }
  expect(errors, errors.join('\n')).to.be.empty;
});

Then('the parallel gateway {string} has outgoing flows to:', function (gatewayId, dataTable) {
  const gw = this.parser.getElementById(gatewayId);
  expect(gw, `Gateway "${gatewayId}" not found`).to.exist;
  const expectedTargets = dataTable.raw().map(row => row[0]);
  const outgoing = gw.outgoing || [];

  const actualTargets = [];
  for (const outRef of outgoing) {
    const flowId = typeof outRef === 'string' ? outRef : outRef.id;
    const flow = this.parser.flowIndex.get(flowId);
    if (flow) {
      const targetId = typeof flow.targetRef === 'string' ? flow.targetRef : flow.targetRef?.id;
      actualTargets.push(targetId);
    }
  }

  for (const expected of expectedTargets) {
    expect(
      actualTargets,
      `Gateway "${gatewayId}" does not have an outgoing flow to "${expected}". Actual targets: ${actualTargets.join(', ')}`
    ).to.include(expected);
  }
});

Then('the parallel gateway {string} has incoming flows from:', function (gatewayId, dataTable) {
  const gw = this.parser.getElementById(gatewayId);
  expect(gw, `Gateway "${gatewayId}" not found`).to.exist;
  const expectedSources = dataTable.raw().map(row => row[0]);
  const incoming = gw.incoming || [];

  const actualSources = [];
  for (const inRef of incoming) {
    const flowId = typeof inRef === 'string' ? inRef : inRef.id;
    const flow = this.parser.flowIndex.get(flowId);
    if (flow) {
      const sourceId = typeof flow.sourceRef === 'string' ? flow.sourceRef : flow.sourceRef?.id;
      actualSources.push(sourceId);
    }
  }

  for (const expected of expectedSources) {
    expect(
      actualSources,
      `Gateway "${gatewayId}" does not have an incoming flow from "${expected}". Actual sources: ${actualSources.join(', ')}`
    ).to.include(expected);
  }
});
