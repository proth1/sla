/**
 * Scenario 1: Happy Path Buy — Snowflake Data Cloud
 * Single vendor, full E2E buy pathway through all 5 phases.
 * Expected: Software Onboarded
 */
const defaults = require('../fixtures/form-defaults');

module.exports = {
  id: 'S01',
  name: 'Happy Path Buy — Snowflake Data Cloud',
  description: 'Single vendor buy pathway through all phases, committee approved, baseline security.',
  expectedOutcome: 'Software Onboarded',
  vendors: ['Snowflake Inc'],

  startVars: {
    ...defaults,
    requestDescription: 'Request to onboard Snowflake Data Cloud for enterprise data warehousing. The Global Markets Technology division needs a scalable cloud data platform to consolidate 4 separate data silos into a unified lakehouse architecture.',
    businessProblem: 'Global Markets Technology operates 4 disparate data warehouses costing $1.2M annually in maintenance. Need unified cloud-native platform with auto-scaling for peak trading periods.',
    vendorName: 'Snowflake Inc',
    productName: 'Snowflake Data Cloud',
    existingSolutionDisposition: 'NoMatch',
    ndaSigned: false,
    rfpNeeded: false,
    pathway: 'Buy',
    selectedPathway: 'Buy',
    riskTier: 'Medium',
    dataClassification: 'Confidential',
    hasAIComponent: false,
    hasAI: 'no',
    deploymentModel: 'cloud-saas',
    estimatedBudget: 450000,
    expectedUserCount: 175,
    criticality: 'high',
    urgencyLevel: 'high',
    securityAssessmentLevel: 'Baseline',
    aiGovernanceRequired: false,
    approvalDecision: 'Approved',
    finalDecision: 'Approved',
    vendorId: 'VENDOR-SNOWFLAKE',
    contractId: 'CONTRACT-SNOWFLAKE',
    vendorToken: 'VENDOR-SNOWFLAKE',
    intendedUseCases: '1. Consolidated cross-asset P&L reporting\n2. Real-time trade surveillance dashboards\n3. Regulatory reporting automation',
    integrationRequirements: 'Bloomberg B-PIPE, Refinitiv Eikon, internal OMS via REST API',
    applicableRegulations: 'SOX, OCC 2023-17, GDPR',
  },

  baseVars: {
    ...defaults,
    vendorName: 'Snowflake Inc',
    existingSolutionDisposition: 'NoMatch',
    pathway: 'Buy',
    selectedPathway: 'Buy',
    riskTier: 'Medium',
    dataClassification: 'Confidential',
    securityAssessmentLevel: 'Baseline',
    approvalDecision: 'Approved',
    finalDecision: 'Approved',
    assessmentApproved: true,
    governanceApproved: true,
    contractApproved: true,
    vendorId: 'VENDOR-SNOWFLAKE',
    contractId: 'CONTRACT-SNOWFLAKE',
    vendorToken: 'VENDOR-SNOWFLAKE',
  },

  taskOverrides: {},
};
