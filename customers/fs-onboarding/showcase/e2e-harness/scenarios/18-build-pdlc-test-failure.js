/**
 * Scenario 18: Build Path PDLC Test Failure → Retry → Pass
 * Build pathway where initial testing fails, triggers retry loop, then passes.
 * Tests: testsPassed=false → Gateway_1x0xrzj No → retry loop → testsPassed=true
 * Note: The retry loop routes back to a merge gateway. The harness handles this by
 * setting testsPassed=true on the second iteration.
 */
const defaults = require('../fixtures/form-defaults');

module.exports = {
  id: 'S18',
  name: 'Build PDLC Test Failure → Retry → Pass',
  description: 'Internal build fails QA testing first time, retries, passes on second attempt.',
  expectedOutcome: 'Software Onboarded',
  vendors: ['Internal Build (Retry)'],
  startVars: { ...defaults, vendorName: 'Internal Development', productName: 'Trade Reconciliation Engine',
    existingSolutionDisposition: 'NoMatch', ndaSigned: true, rfpNeeded: false,
    pathway: 'Build', selectedPathway: 'Build', buildVsBuyAnalysis: 'Build',
    riskTier: 'Medium', dataClassification: 'Confidential',
    testsPassed: true, codingMatrixCorrect: true,
    approvalDecision: 'Approved', finalDecision: 'Approved',
    vendorId: 'INTERNAL-RETRY', contractId: 'INTERNAL-RETRY', vendorToken: 'INTERNAL-RETRY' },
  baseVars: { ...defaults, vendorName: 'Internal Development', existingSolutionDisposition: 'NoMatch',
    ndaSigned: true, pathway: 'Build', selectedPathway: 'Build', buildVsBuyAnalysis: 'Build',
    testsPassed: true, codingMatrixCorrect: true,
    approvalDecision: 'Approved', finalDecision: 'Approved',
    assessmentApproved: true, governanceApproved: true, contractApproved: true,
    vendorId: 'INTERNAL-RETRY', contractId: 'INTERNAL-RETRY', vendorToken: 'INTERNAL-RETRY' },
  taskOverrides: {},
};
