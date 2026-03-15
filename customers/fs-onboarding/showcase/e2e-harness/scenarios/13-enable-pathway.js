/**
 * Scenario 13: Enable Pathway — Low-Code Platform Configuration
 * selectedPathway="Enable" routes through the Enable compliance review path in SP4.
 * Tests: the third pathway option (not Build, not Buy)
 */
const defaults = require('../fixtures/form-defaults');

module.exports = {
  id: 'S13',
  name: 'Enable Pathway — Low-Code Platform Config',
  description: 'Low-code platform configuration (Enable pathway). Skips PDLC and full contracting.',
  expectedOutcome: 'Software Onboarded',
  vendors: ['Appian Corp'],
  startVars: { ...defaults, vendorName: 'Appian Corp', productName: 'Appian Low-Code Platform',
    existingSolutionDisposition: 'NoMatch', pathway: 'Buy', selectedPathway: 'Enable',
    ndaSigned: true, rfpNeeded: false, riskTier: 'Low', dataClassification: 'Internal',
    estimatedBudget: 75000, criticality: 'medium', approvalDecision: 'Approved', finalDecision: 'Approved',
    vendorId: 'VENDOR-APPIAN', contractId: 'CONTRACT-APPIAN', vendorToken: 'VENDOR-APPIAN' },
  baseVars: { ...defaults, vendorName: 'Appian Corp', selectedPathway: 'Enable', pathway: 'Buy',
    existingSolutionDisposition: 'NoMatch', ndaSigned: true, riskTier: 'Low', dataClassification: 'Internal',
    approvalDecision: 'Approved', finalDecision: 'Approved', assessmentApproved: true,
    governanceApproved: true, contractApproved: true,
    vendorId: 'VENDOR-APPIAN', contractId: 'CONTRACT-APPIAN', vendorToken: 'VENDOR-APPIAN' },
  taskOverrides: {},
};
