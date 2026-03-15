/**
 * Scenario 17: SP2 Prioritization Committee Rejection
 * Committee rejects at SP2 prioritization stage → Event_09y2vf5
 * Tests: assessmentApproved=false in SP2 (different from SP3 assessment rejection)
 */
const defaults = require('../fixtures/form-defaults');

module.exports = {
  id: 'S17',
  name: 'SP2 Prioritization Committee Rejection',
  description: 'Prioritization committee determines request is not strategically aligned. Rejected at SP2.',
  expectedOutcome: 'Prioritization Committee Not Approved',
  vendors: ['LowPriority Tools'],
  startVars: { ...defaults, vendorName: 'LowPriority Tools', existingSolutionDisposition: 'NoMatch',
    ndaSigned: true, rfpNeeded: false, pathway: 'Buy', selectedPathway: 'Buy',
    assessmentApproved: false,
    memberVote: { decision: 'REJECTED', comments: 'Not strategically aligned.', conditions: [] },
    tallyResult: { approved: 0, rejected: 3, conditions: 0, abstain: 0, total: 3 },
    committeeDecision: 'Rejected',
    vendorId: 'VENDOR-LOWPRI', contractId: 'CONTRACT-LOWPRI', vendorToken: 'VENDOR-LOWPRI' },
  baseVars: { ...defaults, vendorName: 'LowPriority Tools', existingSolutionDisposition: 'NoMatch',
    ndaSigned: true, pathway: 'Buy', selectedPathway: 'Buy', assessmentApproved: false,
    memberVote: { decision: 'REJECTED', comments: 'Not strategically aligned.', conditions: [] },
    tallyResult: { approved: 0, rejected: 3, conditions: 0, abstain: 0, total: 3 },
    committeeDecision: 'Rejected',
    vendorId: 'VENDOR-LOWPRI', contractId: 'CONTRACT-LOWPRI', vendorToken: 'VENDOR-LOWPRI' },
  taskOverrides: {},
};
