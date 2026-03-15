/**
 * Scenario 7: Needs Guidance → Withdrawn — Blockchain Experiment
 * Requester gets quarterback guidance but decides not to proceed.
 * Expected: Request Withdrawn
 */
const defaults = require('../fixtures/form-defaults');

module.exports = {
  id: 'S07',
  name: 'Needs Guidance → Withdrawn — Blockchain Experiment',
  description: 'Requester unsure about blockchain platform. Gets quarterback guidance, decides to withdraw.',
  expectedOutcome: 'Request Withdrawn',
  vendors: ['ChainForge Labs'],

  startVars: {
    ...defaults,
    requestDescription: 'Exploring blockchain-based trade settlement platform. Not sure if this fits within existing risk appetite or regulatory framework.',
    businessProblem: 'Investigating T+0 settlement using distributed ledger. Experimental — may not proceed.',
    vendorName: 'ChainForge Labs',
    productName: 'ChainForge Settlement Protocol',
    existingSolutionDisposition: 'NeedsGuidance',
    pursueRequest: false, // After guidance, requester withdraws
    estimatedBudget: 2000000,
    criticality: 'low',
    riskTier: 'High',
    dataClassification: 'Restricted',
    hasAIComponent: false,
  },

  baseVars: {
    ...defaults,
    existingSolutionDisposition: 'NeedsGuidance',
    pursueRequest: false,
    vendorName: 'ChainForge Labs',
  },

  taskOverrides: {},
};
