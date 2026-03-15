/**
 * Scenario 19: PoC Required — Enterprise Search Platform
 * Buy pathway where proof of concept is required before contracting.
 * Tests: pocRequired=true → Activity_1b9jfde (Perform PoC) path
 */
const defaults = require('../fixtures/form-defaults');

module.exports = {
  id: 'S19',
  name: 'PoC Required — Enterprise Search Platform',
  description: 'Complex enterprise search requires proof of concept before full procurement commitment.',
  expectedOutcome: 'Software Onboarded',
  vendors: ['Elastic NV'],
  startVars: { ...defaults, vendorName: 'Elastic NV', productName: 'Elasticsearch Enterprise',
    existingSolutionDisposition: 'NoMatch', ndaSigned: true, rfpNeeded: false,
    pathway: 'Buy', selectedPathway: 'Buy', riskTier: 'Medium', dataClassification: 'Confidential',
    pocRequired: true, estimatedBudget: 500000, criticality: 'high',
    approvalDecision: 'Approved', finalDecision: 'Approved',
    vendorId: 'VENDOR-ELASTIC', contractId: 'CONTRACT-ELASTIC', vendorToken: 'VENDOR-ELASTIC' },
  baseVars: { ...defaults, vendorName: 'Elastic NV', existingSolutionDisposition: 'NoMatch',
    ndaSigned: true, pathway: 'Buy', selectedPathway: 'Buy',
    pocRequired: true, approvalDecision: 'Approved', finalDecision: 'Approved',
    assessmentApproved: true, governanceApproved: true, contractApproved: true,
    vendorId: 'VENDOR-ELASTIC', contractId: 'CONTRACT-ELASTIC', vendorToken: 'VENDOR-ELASTIC' },
  taskOverrides: {},
};
