/**
 * Scenario 6: Partial Match Exception — Tableau Upgrade
 * Existing partial match → pursue exception → full onboarding.
 * Expected: Software Onboarded
 */
const defaults = require('../fixtures/form-defaults');

module.exports = {
  id: 'S06',
  name: 'Partial Match Exception — Tableau Upgrade',
  description: 'Existing Tableau is partial match. Requester pursues exception path for enterprise upgrade.',
  expectedOutcome: 'Software Onboarded',
  vendors: ['Tableau Software'],

  startVars: {
    ...defaults,
    requestDescription: 'Existing Tableau Server is a partial match — it handles 60% of our viz needs but lacks embedded analytics and real-time streaming. Requesting Tableau Cloud upgrade with advanced modules.',
    businessProblem: 'Current Tableau Server lacks embedded analytics for client-facing dashboards and real-time streaming for trading floor displays.',
    vendorName: 'Tableau Software',
    productName: 'Tableau Cloud Enterprise',
    existingSolutionDisposition: 'Partial',
    existingSolutionName: 'Tableau Server',
    existingSolutionVersion: '2023.3',
    existingUtilizationRate: 62,
    pursueRequest: true,
    ndaSigned: true,
    rfpNeeded: false,
    pathway: 'Buy',
    selectedPathway: 'Buy',
    riskTier: 'Medium',
    dataClassification: 'Confidential',
    estimatedBudget: 280000,
    criticality: 'medium',
    approvalDecision: 'Approved',
    finalDecision: 'Approved',
    vendorId: 'VENDOR-TABLEAU',
    contractId: 'CONTRACT-TABLEAU',
    vendorToken: 'VENDOR-TABLEAU',
  },

  baseVars: {
    ...defaults,
    existingSolutionDisposition: 'Partial',
    pursueRequest: true,
    ndaSigned: true,
    pathway: 'Buy',
    selectedPathway: 'Buy',
    approvalDecision: 'Approved',
    finalDecision: 'Approved',
    assessmentApproved: true,
    governanceApproved: true,
    contractApproved: true,
    vendorId: 'VENDOR-TABLEAU',
    contractId: 'CONTRACT-TABLEAU',
    vendorToken: 'VENDOR-TABLEAU',
  },

  taskOverrides: {},
};
