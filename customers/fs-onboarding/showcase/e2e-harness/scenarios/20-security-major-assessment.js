/**
 * Scenario 20: Security Major Assessment — Crypto Custody Platform
 * High-risk vendor with Restricted data triggers Major security assessment path.
 * Tests: securityRoutingResult.assessmentLevel != "Baseline" → elevated security review
 */
const defaults = require('../fixtures/form-defaults');

module.exports = {
  id: 'S20',
  name: 'Security Major Assessment — Crypto Custody',
  description: 'Crypto custody platform handling restricted financial data. Major security assessment required.',
  expectedOutcome: 'Software Onboarded',
  vendors: ['CryptoSafe Custody'],
  startVars: { ...defaults, vendorName: 'CryptoSafe Custody', productName: 'Digital Asset Custody Suite',
    existingSolutionDisposition: 'NoMatch', ndaSigned: false, rfpNeeded: false,
    pathway: 'Buy', selectedPathway: 'Buy', riskTier: 'High', dataClassification: 'Restricted',
    hasAIComponent: false, hasAI: 'no', deploymentModel: 'hybrid',
    securityRequired: true, securityAssessmentLevel: 'Major',
    estimatedBudget: 2000000, criticality: 'critical',
    approvalDecision: 'Approved', finalDecision: 'Approved',
    applicableRegulations: 'SOX, SEC 17a-4, BCBS d577, NIST CSF 2.0',
    vendorId: 'VENDOR-CRYPTOSAFE', contractId: 'CONTRACT-CRYPTOSAFE', vendorToken: 'VENDOR-CRYPTOSAFE' },
  baseVars: { ...defaults, vendorName: 'CryptoSafe Custody', existingSolutionDisposition: 'NoMatch',
    ndaSigned: false, pathway: 'Buy', selectedPathway: 'Buy',
    riskTier: 'High', dataClassification: 'Restricted', securityAssessmentLevel: 'Major',
    approvalDecision: 'Approved', finalDecision: 'Approved',
    assessmentApproved: true, governanceApproved: true, contractApproved: true,
    vendorId: 'VENDOR-CRYPTOSAFE', contractId: 'CONTRACT-CRYPTOSAFE', vendorToken: 'VENDOR-CRYPTOSAFE' },
  taskOverrides: {},
};
