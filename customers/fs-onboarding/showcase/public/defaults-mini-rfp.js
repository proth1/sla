/* Mini RFP Launcher — Auto-fill defaults (DEMO / SHOWCASE — not for production use)
   Matches the defaults.js pattern for the main onboarding Task Worker. */
const DEFAULTS_MINI_RFP = {
  // Step 1: Understand the Need
  technologyType: "SaaS",
  primaryUseCase: "Enterprise analytics and reporting consolidation platform to replace 4+ fragmented reporting tools across Global Markets desks. Acme Analytics Platform provides unified cross-asset reporting for trade surveillance, P&L attribution, and regulatory reporting across equities, fixed income, and derivatives.",
  rfpUrgency: "high",
  budgetRange: "100k_500k",
  hasAI: "yes",
  businessCriticality: "significant",
  costCenter: "CC-4410-GMT",

  // Step 2: Vendor Context
  knownVendor: "yes",
  vendorName: "Acme Corp",
  competitiveBid: "no",
  existingRelationship: "no",
  deploymentModel: "cloud",
  dataClassification: "confidential",
  regulatoryScope: "OCC_2023_17,SOX,GDPR",
  dataTypes: "Financial,PII",
  existingAssessments: "SOC2_TypeII",
  vendorHeadquarters: "United States",
  vendorWebsite: "https://acme-analytics.example.com",

  // Step 2.5: Classification Validation (Concierge)
  classificationValidated: "confirmed",
  regulatoryScopeValidated: "confirmed",
  classificationNotes: "Classification confirmed as Confidential based on financial data processing and PII handling. Regulatory scope includes OCC 2023-17 (third-party risk), SOX (financial controls), and GDPR (EU PII). No adjustment needed.",

  // Step 3: Deal-Killer Results
  dealKillerAcknowledged: "yes",
  proceedAfterDealKiller: "yes",
  vendorConcentrationAck: "yes",
  hasExecutiveSponsor: "yes",
  budgetAuthorized: "yes",

  // Step 4: Question Preview
  questionPreviewConfirmed: "yes",
  additionalCategories: "",

  // Step 5: Send to Vendor
  vendorContactName: "Jane Smith",
  vendorContactEmail: "jane.smith@acme-demo.example.com",
  vendorContactTitle: "VP of Sales Engineering",
  responseDeadline: "14",
  deliveryMethod: "portal",
  includeCoverLetter: "yes",
  shareEvaluationCriteria: "yes",
  specialInstructions: "",

  // Step 6: Collect Responses
  responseAction: "accept",
  collectionNotes: "Vendor response received within deadline. All 7 selected categories completed with narrative responses and supporting documentation.",

  // Step 7: Review & Score
  securityScore: "4",
  productScore: "4",
  pricingScore: "3",
  tprmScore: "4",
  privacyScore: "3",
  integrationScore: "4",
  aiScore: "5",
  companyScore: "4",
  implementationScore: "3",
  resilienceScore: "4",
  overallRecommendation: "proceed",
  scoringNotes: "Strong security posture (SOC 2 Type II, ISO 27001). AI capabilities well-documented with model cards and bias testing. Pricing competitive for the feature set. Integration APIs well-documented with sandbox environment. Recommend proceeding to full onboarding.",

  // Transfer fields
  transferConfirmed: "yes",
};
