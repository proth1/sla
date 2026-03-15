/**
 * Scenario 16: Final Approval Rejected — CIO Overrule
 * Everything passes through all phases but CIO final approval committee rejects.
 * Tests: finalDecision="Rejected" → End_FinalRejected (latest possible failure)
 */
const defaults = require('../fixtures/form-defaults');

module.exports = {
  id: 'S16',
  name: 'Final Approval Rejected — CIO Overrule',
  description: 'Process completes all phases successfully but CIO committee rejects at final approval gate.',
  expectedOutcome: 'Request Not Approved',
  vendors: ['AlmostMadeIt Systems'],
  startVars: { ...defaults, vendorName: 'AlmostMadeIt Systems', existingSolutionDisposition: 'NoMatch',
    ndaSigned: true, rfpNeeded: false, pathway: 'Buy', selectedPathway: 'Buy',
    assessmentApproved: true, governanceApproved: true, contractApproved: true,
    approvalDecision: 'Approved', finalDecision: 'Rejected',
    vendorId: 'VENDOR-ALMOST', contractId: 'CONTRACT-ALMOST', vendorToken: 'VENDOR-ALMOST' },
  baseVars: { ...defaults, vendorName: 'AlmostMadeIt Systems', existingSolutionDisposition: 'NoMatch',
    ndaSigned: true, pathway: 'Buy', selectedPathway: 'Buy',
    assessmentApproved: true, governanceApproved: true, contractApproved: true,
    approvalDecision: 'Approved', finalDecision: 'Rejected',
    vendorId: 'VENDOR-ALMOST', contractId: 'CONTRACT-ALMOST', vendorToken: 'VENDOR-ALMOST' },
  taskOverrides: {},
};
