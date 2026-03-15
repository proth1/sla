/**
 * Scenario 10: Governance Rejected — Shadow IT Discovery
 * Process gets all the way to SP4 governance review but committee rejects.
 * Expected: Governance Rejected
 */
const defaults = require('../fixtures/form-defaults');

module.exports = {
  id: 'S10',
  name: 'Governance Rejected — Shadow IT Discovery',
  description: 'Unauthorized SaaS tool discovered in use. Committee rejects due to unresolvable compliance gaps.',
  expectedOutcome: 'Governance Rejected',
  vendors: ['QuickDeploy SaaS'],

  startVars: {
    ...defaults,
    requestDescription: 'Regularization request for QuickDeploy SaaS tool found in use by 3 business units without approval. Contains PII data of 12,000 clients.',
    businessProblem: 'Shadow IT discovery: QuickDeploy SaaS is processing client PII without data processing agreement, SOC2 certification, or regulatory approval.',
    vendorName: 'QuickDeploy SaaS',
    productName: 'QuickDeploy Enterprise',
    existingSolutionDisposition: 'NoMatch',
    ndaSigned: false,
    rfpNeeded: false,
    pathway: 'Buy',
    selectedPathway: 'Buy',
    riskTier: 'High',
    dataClassification: 'Restricted',
    hasAIComponent: false,
    hasAI: 'no',
    deploymentModel: 'cloud-saas',
    estimatedBudget: 95000,
    expectedUserCount: 150,
    criticality: 'critical',
    urgencyLevel: 'critical',
    securityAssessmentLevel: 'Major',
    // Passes assessment but fails governance
    assessmentApproved: true,
    governanceApproved: false,
    finalDecision: 'Rejected',
    approvalDecision: 'Rejected',
    vendorId: 'VENDOR-QUICKDEPLOY',
    contractId: 'CONTRACT-QUICKDEPLOY',
    vendorToken: 'VENDOR-QUICKDEPLOY',
    memberVote: { decision: 'REJECTED', comments: 'Vendor lacks SOC2, GDPR DPA. Unresolvable compliance gap.', conditions: [] },
    tallyResult: { approved: 0, rejected: 3, conditions: 0, abstain: 0, total: 3 },
    committeeDecision: 'Rejected',
    applicableRegulations: 'GDPR, CCPA, SOX, OCC 2023-17',
  },

  baseVars: {
    ...defaults,
    vendorName: 'QuickDeploy SaaS',
    existingSolutionDisposition: 'NoMatch',
    pathway: 'Buy',
    selectedPathway: 'Buy',
    riskTier: 'High',
    dataClassification: 'Restricted',
    securityAssessmentLevel: 'Major',
    assessmentApproved: true,
    governanceApproved: false,
    approvalDecision: 'Rejected',
    finalDecision: 'Rejected',
    committeeDecision: 'Rejected',
    memberVote: { decision: 'REJECTED', comments: 'Vendor lacks SOC2, GDPR DPA.', conditions: [] },
    tallyResult: { approved: 0, rejected: 3, conditions: 0, abstain: 0, total: 3 },
    vendorId: 'VENDOR-QUICKDEPLOY',
    contractId: 'CONTRACT-QUICKDEPLOY',
    vendorToken: 'VENDOR-QUICKDEPLOY',
  },

  taskOverrides: {},
};
