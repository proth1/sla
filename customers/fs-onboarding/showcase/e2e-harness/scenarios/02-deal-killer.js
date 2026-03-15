/**
 * Scenario 2: Deal Killer — SanctionedCorp Analytics
 * Vendor triggers DMN-7 deal killer, process terminated early.
 * Expected: Deal Killed (end at SP1 deal killer gateway)
 */
const defaults = require('../fixtures/form-defaults');

module.exports = {
  id: 'S02',
  name: 'Deal Killer — SanctionedCorp Analytics',
  description: 'Vendor on sanctions list triggers deal-killer pre-screen. Process killed in SP1.',
  expectedOutcome: 'Deal Killed',
  vendors: ['SanctionedCorp Analytics'],

  startVars: {
    ...defaults,
    requestDescription: 'Request to evaluate SanctionedCorp Analytics for trade surveillance. Their AI-powered monitoring claims 95% detection rate.',
    businessProblem: 'Need better trade surveillance to meet SEC/FINRA requirements.',
    vendorName: 'SanctionedCorp Analytics',
    productName: 'SanctionedCorp TradeSurv Pro',
    existingSolutionDisposition: 'NoMatch',
    ndaSigned: true,
    rfpNeeded: false,
    pathway: 'Buy',
    selectedPathway: 'Buy',
    riskTier: 'High',
    dataClassification: 'Restricted',
    hasAIComponent: true,
    hasAI: 'yes',
    deploymentModel: 'cloud-saas',
    estimatedBudget: 800000,
    criticality: 'high',
    // DMN-7 will evaluate and produce dealKillerResult
    // The process should kill at the deal-killer gateway
    dealKillerResult: 'Blocked',
    dealKillerFound: true,
    dealKillerDecision: 'Kill',
    complianceBlocker: true,
    vendorSanctionsStatus: 'BLOCKED',
  },

  baseVars: {
    ...defaults,
    vendorName: 'SanctionedCorp Analytics',
    existingSolutionDisposition: 'NoMatch',
    ndaSigned: true,
    dealKillerResult: 'Blocked',
    dealKillerFound: true,
    dealKillerDecision: 'Kill',
    complianceBlocker: true,
  },

  taskOverrides: {},
};
