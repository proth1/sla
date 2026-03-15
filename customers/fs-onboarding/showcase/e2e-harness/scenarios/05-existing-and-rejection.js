/**
 * Scenario 5A: Existing Solution FullMatch — Salesforce CRM
 * Existing solution found, leverage it immediately.
 * Expected: Software Leveraged (early exit from SP1)
 *
 * Scenario 5B: Assessment Rejection — CloudVault Storage
 * Goes through full path but fails at SP3 assessment approval.
 * Expected: Assessment Not Approved
 */
const defaults = require('../fixtures/form-defaults');

const scenario5A = {
  id: 'S05a',
  name: 'Existing Solution FullMatch — Salesforce CRM',
  description: 'Request matches existing Salesforce license. Process exits early with "Software Leveraged".',
  expectedOutcome: 'Software Leveraged',
  vendors: ['Salesforce Inc'],

  startVars: {
    ...defaults,
    requestDescription: 'Request for CRM solution for client relationship management. Our existing Salesforce Enterprise license fully covers this need.',
    businessProblem: 'Need CRM for client relationship management in the wealth advisory division.',
    vendorName: 'Salesforce Inc',
    productName: 'Salesforce Sales Cloud',
    existingSolutionDisposition: 'FullMatch',
    existingSolutionName: 'Salesforce Enterprise',
    existingSolutionVersion: '2024.1',
    existingLicenseStatus: 'Active — 500 enterprise licenses, 320 in use',
    existingUtilizationRate: 64,
    estimatedBudget: 0,
    criticality: 'low',
  },

  baseVars: {
    ...defaults,
    existingSolutionDisposition: 'FullMatch',
    vendorName: 'Salesforce Inc',
  },

  taskOverrides: {},
};

const scenario5B = {
  id: 'S05b',
  name: 'Assessment Rejection — CloudVault Storage',
  description: 'Vendor fails security assessment in SP3. Process terminated at assessment approval gateway.',
  expectedOutcome: 'Assessment Not Approved',
  vendors: ['CloudVault Storage'],

  startVars: {
    ...defaults,
    requestDescription: 'Request to onboard CloudVault for encrypted document storage. Requires FIPS 140-2 Level 3 certification.',
    businessProblem: 'Legal department needs encrypted document vault for M&A deal rooms with air-gapped key management.',
    vendorName: 'CloudVault Storage',
    productName: 'CloudVault Enterprise Vault',
    existingSolutionDisposition: 'NoMatch',
    ndaSigned: false,
    rfpNeeded: false,
    pathway: 'Buy',
    selectedPathway: 'Buy',
    riskTier: 'High',
    dataClassification: 'Restricted',
    hasAIComponent: false,
    hasAI: 'no',
    deploymentModel: 'hybrid',
    estimatedBudget: 350000,
    expectedUserCount: 40,
    criticality: 'high',
    securityAssessmentLevel: 'Major',
    securityRequired: true,
    // Fails at assessment approval
    assessmentApproved: false,
    vendorId: 'VENDOR-CLOUDVAULT',
    contractId: 'CONTRACT-CLOUDVAULT',
    vendorToken: 'VENDOR-CLOUDVAULT',
    applicableRegulations: 'SOX, GDPR, SEC 17a-4',
  },

  baseVars: {
    ...defaults,
    vendorName: 'CloudVault Storage',
    existingSolutionDisposition: 'NoMatch',
    pathway: 'Buy',
    selectedPathway: 'Buy',
    riskTier: 'High',
    dataClassification: 'Restricted',
    securityAssessmentLevel: 'Major',
    assessmentApproved: false,
    vendorId: 'VENDOR-CLOUDVAULT',
    contractId: 'CONTRACT-CLOUDVAULT',
    vendorToken: 'VENDOR-CLOUDVAULT',
  },

  taskOverrides: {},
};

module.exports = { scenario5A, scenario5B };
