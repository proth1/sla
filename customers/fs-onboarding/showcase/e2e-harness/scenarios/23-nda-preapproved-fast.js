/**
 * Scenario 23: NDA Pre-Approved Fast Path — Existing Master Agreement
 * NDA not yet signed but modifications are pre-approved → fast NDA execution
 * Tests: ndaSigned=false → Execute NDA → noModifications=false → preApproved=true → merge to signed
 */
const defaults = require('../fixtures/form-defaults');

module.exports = {
  id: 'S23',
  name: 'NDA Pre-Approved Fast — Master Agreement',
  description: 'Vendor has existing master agreement. NDA modifications pre-approved, fast-tracked to signing.',
  expectedOutcome: 'Software Onboarded',
  vendors: ['MasterAgreement Corp'],
  startVars: { ...defaults, vendorName: 'MasterAgreement Corp', existingSolutionDisposition: 'NoMatch',
    ndaSigned: false, noModifications: false, preApproved: true, redLinesAccepted: true,
    ndaExecuted: true, rfpNeeded: false, pathway: 'Buy', selectedPathway: 'Buy',
    approvalDecision: 'Approved', finalDecision: 'Approved',
    vendorId: 'VENDOR-MASTER', contractId: 'CONTRACT-MASTER', vendorToken: 'VENDOR-MASTER' },
  baseVars: { ...defaults, vendorName: 'MasterAgreement Corp', existingSolutionDisposition: 'NoMatch',
    ndaSigned: false, noModifications: false, preApproved: true, ndaExecuted: true,
    pathway: 'Buy', selectedPathway: 'Buy',
    approvalDecision: 'Approved', finalDecision: 'Approved',
    assessmentApproved: true, governanceApproved: true, contractApproved: true,
    vendorId: 'VENDOR-MASTER', contractId: 'CONTRACT-MASTER', vendorToken: 'VENDOR-MASTER' },
  taskOverrides: {},
};
