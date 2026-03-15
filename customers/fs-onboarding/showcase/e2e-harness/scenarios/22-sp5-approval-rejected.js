/**
 * Scenario 22: SP5 Approval Rejected — UAT Fails at Committee
 * Process completes UAT but approval committee rejects → End_SP5_Rejected
 * Tests: approvalDecision="Rejected" in SP5 (different from conditional or approved)
 */
const defaults = require('../fixtures/form-defaults');

module.exports = {
  id: 'S22',
  name: 'SP5 Approval Rejected — UAT Committee Rejects',
  description: 'Software passes UAT but approval committee identifies unresolvable production risks.',
  expectedOutcome: 'Approval Rejected',
  vendors: ['RiskyDeploy Platform'],
  startVars: { ...defaults, vendorName: 'RiskyDeploy Platform', existingSolutionDisposition: 'NoMatch',
    ndaSigned: true, rfpNeeded: false, pathway: 'Buy', selectedPathway: 'Buy',
    assessmentApproved: true, governanceApproved: true, contractApproved: true,
    approvalDecision: 'Rejected', finalDecision: 'Rejected',
    memberVote: { decision: 'REJECTED', comments: 'Unresolvable production stability risks.', conditions: [] },
    tallyResult: { approved: 0, rejected: 3, conditions: 0, abstain: 0, total: 3 },
    committeeDecision: 'Rejected',
    vendorId: 'VENDOR-RISKY', contractId: 'CONTRACT-RISKY', vendorToken: 'VENDOR-RISKY' },
  baseVars: { ...defaults, vendorName: 'RiskyDeploy Platform', existingSolutionDisposition: 'NoMatch',
    ndaSigned: true, pathway: 'Buy', selectedPathway: 'Buy',
    assessmentApproved: true, governanceApproved: true, contractApproved: true,
    approvalDecision: 'Rejected', finalDecision: 'Rejected',
    memberVote: { decision: 'REJECTED', comments: 'Unresolvable production stability risks.', conditions: [] },
    tallyResult: { approved: 0, rejected: 3, conditions: 0, abstain: 0, total: 3 },
    committeeDecision: 'Rejected',
    vendorId: 'VENDOR-RISKY', contractId: 'CONTRACT-RISKY', vendorToken: 'VENDOR-RISKY' },
  taskOverrides: {},
};
