/**
 * Scenario 12: NDA Redline Rejection — Vendor Refuses Standard Terms
 * NDA path: ndaSigned=false → Execute NDA → modifications=true → not pre-approved →
 * early legal review → redLinesAccepted=false → Event_1fimixu (Red Lines Not Accepted)
 * Tests: full NDA negotiation failure path
 */
const defaults = require('../fixtures/form-defaults');

module.exports = {
  id: 'S12',
  name: 'NDA Redline Rejection — Vendor Refuses Terms',
  description: 'Vendor demands non-standard NDA terms. Legal rejects red lines. NDA subprocess ends with rejection.',
  expectedOutcome: 'Software Onboarded',
  vendors: ['HardBargain Corp'],
  startVars: { ...defaults, vendorName: 'HardBargain Corp', existingSolutionDisposition: 'NoMatch',
    ndaSigned: false, noModifications: false, preApproved: false, redLinesAccepted: false,
    ndaExecuted: false },
  baseVars: { ...defaults, vendorName: 'HardBargain Corp', existingSolutionDisposition: 'NoMatch',
    ndaSigned: false, noModifications: false, preApproved: false, redLinesAccepted: false,
    ndaExecuted: false },
  taskOverrides: {},
};
