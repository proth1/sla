/**
 * Scenario 4: Build Path — Internal Risk Engine
 * Internal build pathway, no vendor, PDLC subprocess.
 * Expected: Software Onboarded (via Build path)
 */
const defaults = require('../fixtures/form-defaults');

module.exports = {
  id: 'S04',
  name: 'Build Path — Internal Risk Engine',
  description: 'Internal build pathway through PDLC subprocess. No external vendor.',
  expectedOutcome: 'Software Onboarded',
  vendors: ['Internal Build'],

  startVars: {
    ...defaults,
    requestDescription: 'Request to build an internal real-time risk aggregation engine. No external vendor — this is an internal development project using existing team capacity.',
    businessProblem: 'Firm lacks real-time cross-asset risk aggregation. Current batch process runs overnight, leaving 8-hour blind spot during Asian trading hours.',
    vendorName: 'Internal Development',
    productName: 'Real-Time Risk Aggregation Engine',
    existingSolutionDisposition: 'NoMatch',
    ndaSigned: true, // no NDA needed for internal
    rfpNeeded: false,
    pathway: 'Build',
    selectedPathway: 'Build',
    buildVsBuyAnalysis: 'Build',
    capabilityReuseScore: 3,
    organizationalCapacity: 8,
    riskTier: 'Medium',
    dataClassification: 'Confidential',
    hasAIComponent: false,
    hasAI: 'no',
    deploymentModel: 'on-premise',
    estimatedBudget: 600000,
    expectedUserCount: 25,
    criticality: 'high',
    urgencyLevel: 'medium',
    securityAssessmentLevel: 'Baseline',
    aiGovernanceRequired: false,
    testsPassed: true,
    codingMatrixCorrect: true,
    approvalDecision: 'Approved',
    finalDecision: 'Approved',
    intendedUseCases: '1. Real-time cross-asset risk aggregation\n2. Intraday VaR computation\n3. Regulatory capital adequacy monitoring',
    integrationRequirements: 'Internal OMS, risk data warehouse, Bloomberg terminal API',
    applicableRegulations: 'SOX, BCBS d577, NIST CSF 2.0',
    vendorId: 'INTERNAL-BUILD',
    contractId: 'INTERNAL-BUILD',
    vendorToken: 'INTERNAL-BUILD',
  },

  baseVars: {
    ...defaults,
    vendorName: 'Internal Development',
    existingSolutionDisposition: 'NoMatch',
    ndaSigned: true,
    pathway: 'Build',
    selectedPathway: 'Build',
    buildVsBuyAnalysis: 'Build',
    securityAssessmentLevel: 'Baseline',
    aiGovernanceRequired: false,
    testsPassed: true,
    codingMatrixCorrect: true,
    approvalDecision: 'Approved',
    finalDecision: 'Approved',
    assessmentApproved: true,
    governanceApproved: true,
    contractApproved: true,
    vendorId: 'INTERNAL-BUILD',
    contractId: 'INTERNAL-BUILD',
    vendorToken: 'INTERNAL-BUILD',
  },

  taskOverrides: {},
};
