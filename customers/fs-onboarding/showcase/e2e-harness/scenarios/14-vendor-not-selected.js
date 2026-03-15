/**
 * Scenario 14: Vendor Not Selected — Failed Scoring
 * Vendor passes DD but fails vendor selection scoring → End_VendorNotSelected
 * Tests: vendorSelected=false path after SP3
 */
const defaults = require('../fixtures/form-defaults');

module.exports = {
  id: 'S14',
  name: 'Vendor Not Selected — Failed Scoring',
  description: 'Vendor passes due diligence but fails competitive scoring. Not selected for contracting.',
  expectedOutcome: 'Vendor Not Approved',
  vendors: ['WeakScore Analytics'],
  startVars: { ...defaults, vendorName: 'WeakScore Analytics', existingSolutionDisposition: 'NoMatch',
    ndaSigned: true, rfpNeeded: false, pathway: 'Buy', selectedPathway: 'Buy',
    vendorSelected: false, assessmentApproved: true,
    vendorId: 'VENDOR-WEAKSCORE', contractId: 'CONTRACT-WEAKSCORE', vendorToken: 'VENDOR-WEAKSCORE' },
  baseVars: { ...defaults, vendorName: 'WeakScore Analytics', existingSolutionDisposition: 'NoMatch',
    ndaSigned: true, pathway: 'Buy', selectedPathway: 'Buy', vendorSelected: false,
    assessmentApproved: true, governanceApproved: true,
    vendorId: 'VENDOR-WEAKSCORE', contractId: 'CONTRACT-WEAKSCORE', vendorToken: 'VENDOR-WEAKSCORE' },
  taskOverrides: {},
};
