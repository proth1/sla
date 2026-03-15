/**
 * Scenario 24: Full AI Governance — LLM Risk Management Platform
 * AI governance branch active in SP3 with all parallel assessments.
 * Tests: aiGovernanceRequired=true, securityAssessmentLevel="Major", all SP3 branches active
 */
const defaults = require('../fixtures/form-defaults');

module.exports = {
  id: 'S24',
  name: 'Full AI Governance — LLM Risk Management',
  description: 'AI/ML platform requiring full AI governance review, major security, and all compliance branches.',
  expectedOutcome: 'Software Onboarded',
  vendors: ['OpenAI Enterprise'],
  startVars: { ...defaults, vendorName: 'OpenAI Enterprise', productName: 'GPT Enterprise Platform',
    existingSolutionDisposition: 'NoMatch', ndaSigned: false, rfpNeeded: false,
    pathway: 'Buy', selectedPathway: 'Buy', riskTier: 'High', dataClassification: 'Restricted',
    hasAIComponent: true, hasAI: 'yes', aiGovernanceRequired: true,
    securityRequired: true, securityAssessmentLevel: 'Major',
    riskRequired: true, complianceRequired: true, privacyRequired: true,
    deploymentModel: 'cloud-saas', estimatedBudget: 5000000, criticality: 'critical',
    approvalDecision: 'Approved', finalDecision: 'Approved',
    applicableRegulations: 'EU AI Act, SR 11-7, SOX, OCC 2023-17, GDPR, DORA, NIST CSF 2.0',
    vendorId: 'VENDOR-OPENAI', contractId: 'CONTRACT-OPENAI', vendorToken: 'VENDOR-OPENAI' },
  baseVars: { ...defaults, vendorName: 'OpenAI Enterprise', existingSolutionDisposition: 'NoMatch',
    ndaSigned: false, pathway: 'Buy', selectedPathway: 'Buy',
    riskTier: 'High', dataClassification: 'Restricted',
    hasAIComponent: true, hasAI: 'yes', aiGovernanceRequired: true,
    securityAssessmentLevel: 'Major',
    approvalDecision: 'Approved', finalDecision: 'Approved',
    assessmentApproved: true, governanceApproved: true, contractApproved: true,
    vendorId: 'VENDOR-OPENAI', contractId: 'CONTRACT-OPENAI', vendorToken: 'VENDOR-OPENAI' },
  taskOverrides: {},
};
