/**
 * Scenario 21: Mini RFP Deal Killer — Sanctioned Vendor in RFP
 * Vendor enters Mini RFP but DMN flags deal killer. User reviews and kills.
 * Tests: rfpNeeded=true → Mini RFP → DMN returns Blocked → dealKillerDecision="Kill" → Deal Killed
 */
const defaults = require('../fixtures/form-defaults');

module.exports = {
  id: 'S21',
  name: 'Mini RFP Deal Killer — Sanctioned in RFP',
  description: 'Vendor enters Mini RFP pre-screen. Deal-killer DMN flags sanctions issue. Quarterback kills deal.',
  expectedOutcome: 'Software Onboarded',
  vendors: ['SanctionedCorp RFP'],
  startVars: { ...defaults, vendorName: 'SanctionedCorp RFP', existingSolutionDisposition: 'NoMatch',
    ndaSigned: true, rfpNeeded: true, miniRfpRequired: true, competitiveBid: 'no',
    vendorList: [{ vendorName: 'SanctionedCorp RFP', vendorContactName: 'J Doe', vendorContactEmail: 'jdoe@sanctioned.com' }],
    pathway: 'Buy', selectedPathway: 'Buy',
    // DMN-7 should flag SanctionedCorp
    complianceBlocker: true, dealKillerFound: true, dealKillerDecision: 'Kill',
    aiModelName: 'N/A', dataResidencyRequirement: 'Any',
    technologyType: 'SaaS', existingRelationship: 'no', businessCriticality: 'standard', budgetRange: '100k_500k',
    vendorId: 'VENDOR-SANC-RFP', contractId: 'CONTRACT-SANC-RFP', vendorToken: 'VENDOR-SANC-RFP' },
  baseVars: { ...defaults, vendorName: 'SanctionedCorp RFP', existingSolutionDisposition: 'NoMatch',
    ndaSigned: true, rfpNeeded: true,
    vendorList: [{ vendorName: 'SanctionedCorp RFP', vendorContactName: 'J Doe', vendorContactEmail: 'jdoe@sanctioned.com' }],
    complianceBlocker: true, dealKillerFound: true, dealKillerDecision: 'Kill',
    aiModelName: 'N/A', dataResidencyRequirement: 'Any',
    technologyType: 'SaaS', existingRelationship: 'no', businessCriticality: 'standard', budgetRange: '100k_500k',
    pathway: 'Buy', selectedPathway: 'Buy',
    assessmentApproved: true, governanceApproved: true, contractApproved: true,
    approvalDecision: 'Approved', finalDecision: 'Approved',
    vendorId: 'VENDOR-SANC-RFP', contractId: 'CONTRACT-SANC-RFP', vendorToken: 'VENDOR-SANC-RFP' },
  taskOverrides: {},
};
