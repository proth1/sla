/**
 * Scenario 3: Multi-Vendor Mini RFP — AI Trading Platform (3 vendors)
 * Tests the new SP_PerVendorEvaluation parallel MI subprocess.
 * Expected: Software Onboarded (after 3-vendor parallel evaluation)
 */
const defaults = require('../fixtures/form-defaults');

const vendorList = [
  { vendorName: 'NexusTech AI', vendorContactName: 'Alex Rivera', vendorContactEmail: 'alex.rivera@nexustech.ai' },
  { vendorName: 'AlphaSense', vendorContactName: 'Maria Santos', vendorContactEmail: 'msantos@alphasense.com' },
  { vendorName: 'Kensho Technologies', vendorContactName: 'James Wu', vendorContactEmail: 'jwu@kensho.com' },
];

module.exports = {
  id: 'S03',
  name: 'Multi-Vendor Mini RFP — AI Trading Platform',
  description: '3-vendor parallel evaluation via SP_PerVendorEvaluation MI subprocess. AI governance branch active.',
  expectedOutcome: 'Software Onboarded',
  vendors: vendorList.map(v => v.vendorName),

  startVars: {
    ...defaults,
    requestDescription: 'Request to evaluate AI-powered trading analytics platforms. Competitive bid across 3 vendors for real-time market signal detection and automated trade idea generation.',
    businessProblem: 'Quantitative trading desk lacks AI-driven signal detection. Manual analysis misses 40% of actionable patterns identified by competitor firms.',
    vendorName: 'NexusTech AI',
    productName: 'AI Trading Analytics Suite',
    existingSolutionDisposition: 'NoMatch',
    ndaSigned: false,
    rfpNeeded: true,
    miniRfpRequired: true,
    competitiveBid: 'yes',
    vendorList,
    pathway: 'Buy',
    selectedPathway: 'Buy',
    riskTier: 'High',
    dataClassification: 'Restricted',
    hasAIComponent: true,
    hasAI: 'yes',
    aiGovernanceRequired: true,
    deploymentModel: 'hybrid',
    estimatedBudget: 1200000,
    expectedUserCount: 35,
    criticality: 'critical',
    urgencyLevel: 'high',
    securityAssessmentLevel: 'Major',
    securityRequired: true,
    riskRequired: true,
    complianceRequired: true,
    privacyRequired: true,
    pocRequired: true,
    approvalDecision: 'Approved',
    finalDecision: 'Approved',
    applicableRegulations: 'EU AI Act, SR 11-7, SOX, OCC 2023-17, GDPR',
    intendedUseCases: '1. Real-time market signal detection\n2. Automated trade idea generation\n3. Portfolio risk modeling with explainable AI',
    vendorId: 'VENDOR-NEXUS',
    contractId: 'CONTRACT-NEXUS',
    vendorToken: 'VENDOR-NEXUS',
    // Mini RFP variables
    dealKillerFound: false,
    dealKillerDecision: 'Proceed',
    dealKillerResult: 'Proceed',
  },

  baseVars: {
    ...defaults,
    vendorName: 'NexusTech AI',
    existingSolutionDisposition: 'NoMatch',
    rfpNeeded: true,
    vendorList,
    pathway: 'Buy',
    selectedPathway: 'Buy',
    riskTier: 'High',
    dataClassification: 'Restricted',
    hasAIComponent: true,
    aiGovernanceRequired: true,
    securityAssessmentLevel: 'Major',
    pocRequired: true,
    approvalDecision: 'Approved',
    finalDecision: 'Approved',
    assessmentApproved: true,
    governanceApproved: true,
    contractApproved: true,
    vendorId: 'VENDOR-NEXUS',
    contractId: 'CONTRACT-NEXUS',
    vendorToken: 'VENDOR-NEXUS',
    dealKillerFound: false,
    dealKillerDecision: 'Proceed',
    dealKillerResult: 'Proceed',
    competitiveBid: 'yes',
    ndaSigned: false,
    ndaExecuted: true,
    noModifications: true,
  },

  taskOverrides: {
    'rfp-identify-vendors': { vendorList },
  },
};
