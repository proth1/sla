/**
 * Scenario 8: Conditional Approval — Palantir Foundry
 * Committee approves with conditions, conditions verified, then approved.
 * Expected: Software Onboarded (via conditional → verify conditions → approved)
 */
const defaults = require('../fixtures/form-defaults');

module.exports = {
  id: 'S08',
  name: 'Conditional Approval — Palantir Foundry',
  description: 'Committee approves with conditions (data residency + audit logging). Conditions verified, final approval.',
  expectedOutcome: 'Software Onboarded',
  vendors: ['Palantir Technologies'],

  startVars: {
    ...defaults,
    requestDescription: 'Request to onboard Palantir Foundry for enterprise data integration and analytics. High-value engagement requiring committee governance review.',
    businessProblem: 'Need unified data ontology platform to break down silos across 12 business units. Current ETL pipeline has 72-hour latency.',
    vendorName: 'Palantir Technologies',
    productName: 'Palantir Foundry',
    existingSolutionDisposition: 'NoMatch',
    ndaSigned: false,
    rfpNeeded: false,
    pathway: 'Buy',
    selectedPathway: 'Buy',
    riskTier: 'High',
    dataClassification: 'Restricted',
    hasAIComponent: true,
    hasAI: 'yes',
    aiGovernanceRequired: true,
    deploymentModel: 'hybrid',
    estimatedBudget: 3500000,
    expectedUserCount: 200,
    criticality: 'critical',
    securityAssessmentLevel: 'Major',
    approvalDecision: 'Conditional',
    finalDecision: 'Approved',
    conditionsConflict: false,
    vendorId: 'VENDOR-PALANTIR',
    contractId: 'CONTRACT-PALANTIR',
    vendorToken: 'VENDOR-PALANTIR',
    memberVote: {
      decision: 'APPROVED_WITH_CONDITIONS',
      comments: 'Approved subject to: (1) US-only data residency, (2) SOC2 audit logging enabled',
      conditions: ['US-only data residency', 'SOC2 audit logging'],
    },
    tallyResult: { approved: 1, rejected: 0, conditions: 2, abstain: 0, total: 3 },
    applicableRegulations: 'EU AI Act, SR 11-7, SOX, OCC 2023-17, GDPR, DORA',
  },

  baseVars: {
    ...defaults,
    vendorName: 'Palantir Technologies',
    existingSolutionDisposition: 'NoMatch',
    pathway: 'Buy',
    selectedPathway: 'Buy',
    riskTier: 'High',
    dataClassification: 'Restricted',
    hasAIComponent: true,
    aiGovernanceRequired: true,
    securityAssessmentLevel: 'Major',
    approvalDecision: 'Conditional',
    finalDecision: 'Approved',
    assessmentApproved: true,
    governanceApproved: true,
    contractApproved: true,
    conditionsConflict: false,
    vendorId: 'VENDOR-PALANTIR',
    contractId: 'CONTRACT-PALANTIR',
    vendorToken: 'VENDOR-PALANTIR',
  },

  taskOverrides: {},
};
