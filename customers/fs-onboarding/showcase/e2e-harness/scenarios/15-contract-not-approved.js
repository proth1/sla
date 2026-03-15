/**
 * Scenario 15: Contract Not Approved — Legal Blocks Deal
 * Passes through SP3 and SP4 contracting but contractApproved=false → Event_1mg05vs
 * Tests: late-stage contract rejection
 */
const defaults = require('../fixtures/form-defaults');

module.exports = {
  id: 'S15',
  name: 'Contract Not Approved — Legal Blocks Deal',
  description: 'Vendor passes all assessments but legal cannot approve contract terms. Late-stage failure.',
  expectedOutcome: 'Contract Not Approved',
  vendors: ['ToxicTerms Inc'],
  startVars: { ...defaults, vendorName: 'ToxicTerms Inc', existingSolutionDisposition: 'NoMatch',
    ndaSigned: true, rfpNeeded: false, pathway: 'Buy', selectedPathway: 'Buy',
    assessmentApproved: true, governanceApproved: true, contractApproved: false,
    vendorId: 'VENDOR-TOXIC', contractId: 'CONTRACT-TOXIC', vendorToken: 'VENDOR-TOXIC' },
  baseVars: { ...defaults, vendorName: 'ToxicTerms Inc', existingSolutionDisposition: 'NoMatch',
    ndaSigned: true, pathway: 'Buy', selectedPathway: 'Buy',
    assessmentApproved: true, governanceApproved: true, contractApproved: false,
    vendorId: 'VENDOR-TOXIC', contractId: 'CONTRACT-TOXIC', vendorToken: 'VENDOR-TOXIC' },
  taskOverrides: {},
};
