/**
 * Base form field defaults shared across all scenarios.
 * Scenario-specific overrides are in each scenario file.
 */
module.exports = {
  // ── Intake form fields ──────────────────────────────────────
  submitterName: 'Paul Roth',
  submitterTitle: 'VP, Global Markets Technology',
  submitterCertification: true,
  executiveSponsorName: 'Sarah Chen',
  executiveSponsorEmail: 'sarah.chen@firmgmt.com',
  businessUnit: 'Global Markets Technology',
  costCenter: 'CC-4410-GMT',
  urgencyLevel: 'medium',
  criticality: 'medium',
  estimatedBudget: 150000,
  expectedUserCount: 50,
  deploymentModel: 'cloud-saas',

  // ── Routing variables (all gateways) ────────────────────────
  existingSolutionDisposition: 'NoMatch',
  pursueRequest: true,
  ndaSigned: false,
  ndaExecuted: true,
  noModifications: true,
  preApproved: false,
  redLinesAccepted: true,
  rfpNeeded: false,
  rfpCompleted: false,
  miniRfpRequired: false,
  continueWithRequest: true,
  continueWorkingRequest: true,
  vendorSelected: true,
  pathway: 'Buy',
  selectedPathway: 'Buy',
  assessmentApproved: true,
  contractApproved: true,
  governanceApproved: true,
  approved: true,
  finalDecision: 'Approved',
  approvalDecision: 'Approved',
  completenessDecision: 'Complete',
  earlyTermination: false,
  dealKillerResult: 'Proceed',
  dealKillerFound: false,
  dealKillerDecision: 'Proceed',
  needsAssessment: true,

  // ── SP3 inclusive gateway conditions ─────────────────────────
  securityRequired: true,
  securityAssessmentLevel: 'Baseline',
  techArchRequired: true,
  aiGovernanceRequired: false,
  riskRequired: true,
  complianceRequired: true,
  privacyRequired: true,
  additionalReviewRequired: false,

  // ── SP4 gateways ────────────────────────────────────────────
  pocRequired: false,
  testsPassed: true,
  codingMatrixCorrect: true,

  // ── Committee voting ────────────────────────────────────────
  conditionsConflict: false,
  vendors: [{ name: 'Default Vendor Corp' }],
  lockedRoster: [{ email: 'reviewer@firm.com', name: 'Reviewer', role: 'CTO' }],
  remediationLoopCount: 0,
  votingConfig: {
    reminderDuration: 'P1D', deadlineDuration: 'P3D',
    maxRemediationLoops: 3, escalationDuration: 'P5D',
    qaEnabled: false, qaPeriodDuration: 'P2D',
  },
  memberVote: { decision: 'APPROVED', comments: 'Auto-approved by E2E harness', conditions: [] },
  tallyResult: { approved: 3, rejected: 0, conditions: 0, abstain: 0, total: 3 },
  committeeDecision: 'Approved',
  conditionalCount: 0,
  hasConflictingConditions: false,

  // ── Phase-level SLA timer config (v18) ──────────────────────
  slaConfig: {
    sp1:  { reminderDuration: 'PT12H', escalationDuration: 'P1D',  deadlineDuration: 'P2D' },
    sp2:  { reminderDuration: 'P2D',   escalationDuration: 'P3D',  deadlineDuration: 'P5D' },
    spVS: { reminderDuration: 'P3D',   escalationDuration: 'P5D',  deadlineDuration: 'P7D' },
    sp3:  { reminderDuration: 'P4D',   escalationDuration: 'P6D',  deadlineDuration: 'P8D' },
    sp4:  { reminderDuration: 'P3D',   escalationDuration: 'P5D',  deadlineDuration: 'P7D' },
    sp5:  { reminderDuration: 'P1D',   escalationDuration: 'P2D',  deadlineDuration: 'P3D' },
  },

  // ── Message correlation keys ────────────────────────────────
  vendorId: 'VENDOR-E2E-001',
  vendorResponseReceived: true,
  contractId: 'CONTRACT-E2E-001',
  signedContract: true,
  vendorToken: 'VENDOR-E2E-001',

  // ── DMN inputs ──────────────────────────────────────────────
  riskTier: 'Medium',
  dataClassification: 'Internal',
  hasAIComponent: false,
  capabilityReuseScore: 2,
  buildVsBuyAnalysis: 'Buy',
  organizationalCapacity: 6,
  strategicAlignment: 7,
  timeToValueScore: 8,
  isExistingVendorRelationship: false,
  requestType: 'defined-need',
  isVendorPartnership: false,
  businessImpact: 7,
  urgency: 6,
  capacityAvailability: 7,

  // ── DMN-7 Deal Killer inputs ────────────────────────────────
  aiModelName: 'N/A',
  dataResidencyRequirement: 'Any',
  complianceBlocker: false,

  // ── DMN-8 Question Selection inputs ─────────────────────────
  technologyType: 'SaaS',
  existingRelationship: 'no',
  businessCriticality: 'standard',
  budgetRange: '100k_500k',

  // ── Form-specific fields ────────────────────────────────────
  triageDecision: 'proceed',
  triageRationale: 'Request proceeds based on clear business need.',
  assignedPriority: 'P2',
  assignedAnalyst: 'Jennifer Martinez',
  businessProblem: 'Business unit needs modern analytics platform.',
  pathwayPreference: 'buy',
  intendedUseCases: 'Data analytics and reporting.',
  hasAI: 'no',
  dataTypes: 'Internal business data.',
  applicableRegulations: 'SOX, OCC 2023-17',
  integrationRequirements: 'REST API integration with existing systems.',
  requestDescription: 'Request to onboard vendor software solution.',
  resourceAvailability: 'Team has allocated resources.',
  preliminaryRiskIndicators: 'Standard risk profile.',
  duplicateDetectionResults: 'No duplicates found.',
  concentrationRiskAssessment: 'No concentration risk.',
};
