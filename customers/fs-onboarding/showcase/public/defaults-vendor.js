/* Vendor Portal — Auto-fill defaults (DEMO / SHOWCASE — not for production use)
   Used by vendor-portal.html "Auto-Fill (Demo)" button for live demos. */
const VENDOR_DEFAULTS = {
  // Security Review
  iso27001Certified: 'yes',
  soc2Type2Available: 'yes',
  pciDssCompliant: 'no',
  encryptionAtRest: 'AES-256-GCM with AWS KMS-managed keys',
  encryptionInTransit: 'TLS 1.3 (minimum TLS 1.2)',
  mfaEnforcementPercentage: '100%',
  privilegedAccessManagement: 'yes',
  accessReviewFrequency: 'Quarterly',
  lastPenTestDate: '2025-11-15',
  penTestExecutiveSummary: 'Annual penetration test conducted by NCC Group. No critical findings. 3 medium-severity findings remediated within 30 days. Full report available under NDA.',
  meanTimeToPatchCritical: '24 hours for critical, 72 hours for high',
  vulnerabilityDisclosurePolicy: 'yes',
  bcpDrPlan: 'yes',
  rtoCommitment: '4 hours',
  rpoCommitment: '1 hour (RPO near-zero with synchronous replication)',
  drTestFrequency: 'Semi-annual with documented results',
  securityBreachesPast3Years: 'no',
  breachDetails: '',
  incidentResponseSla: '15 minutes to acknowledge, 1 hour to initial response, 4 hours to containment',

  // Product Proposal
  productOverview: 'Acme Analytics Platform is a unified cross-asset reporting solution for financial services. It provides real-time trade surveillance, P&L attribution, and regulatory reporting across equities, fixed income, and derivatives. Built on a modern cloud-native architecture with sub-second query performance across 10B+ records.',
  pricingModel: 'Annual SaaS subscription based on number of users and data volume tiers. Enterprise tier: $180K/year for up to 500 users and 5TB data. Volume discounts available for multi-year commitments.',
  customerReferences: '1. JPMorgan Chase — Global Markets Analytics (3 years, 2000+ users)\n2. Goldman Sachs — Regulatory Reporting Platform (2 years)\n3. Deutsche Bank — Cross-Asset P&L Attribution (4 years, expanded 3x)',
  competitiveDifferentiators: '1. Only platform with real-time cross-asset correlation analysis\n2. Pre-built regulatory report templates for 40+ jurisdictions\n3. Sub-second query performance on trillion-row datasets\n4. SOC 2 Type II and ISO 27001 certified since 2020',

  // Compliance Review
  regulatoryCompliance: 'SOC 2 Type II (annual), ISO 27001:2022, ISO 27701 (privacy), GDPR compliant, CCPA compliant, FedRAMP Moderate (in progress), CSA STAR Level 2',
  dataProtectionOfficer: 'yes',
  gdprCompliant: 'yes',
  auditHistory: 'No material findings in last 3 annual SOC 2 audits. ISO 27001 surveillance audit passed Q3 2025 with zero non-conformities. GDPR Article 30 records of processing maintained and reviewed quarterly.',

  // Technical Demo
  architectureOverview: 'Microservices architecture on AWS (us-east-1, eu-west-1). Kubernetes-orchestrated with Istio service mesh. Event-driven data pipeline using Apache Kafka. PostgreSQL for transactional data, ClickHouse for analytics. GraphQL API gateway with REST fallback.',
  integrationCapabilities: 'REST API (OpenAPI 3.0 spec), GraphQL API, SFTP for batch data, Kafka for streaming integration, SSO via SAML 2.0/OIDC, SCIM 2.0 for user provisioning. Pre-built connectors for Bloomberg, Reuters, FIX protocol, and major OMS/EMS platforms.',
  scalabilityMetrics: 'Current production: 15,000 concurrent users, 2M queries/day, 50TB total data. Horizontal auto-scaling to 5x baseline within 5 minutes. P99 latency: 200ms for dashboard queries, 50ms for API calls.',

  // Company Profile
  companyName: 'Acme Analytics Inc.',
  yearFounded: '2018',
  employeeCount: '450',
  annualRevenue: '$85M ARR (2025)',
  primaryContact: 'Jane Smith',
  primaryContactEmail: 'jane.smith@acme-analytics.example.com',

  // Contract Terms
  standardSlaCommitment: '99.95% monthly uptime (measured via synthetic monitoring, excludes scheduled maintenance windows)',
  liabilityCapPercentage: '100% of annual fees for direct damages; $5M aggregate cap for data breach events',
  terminationNotice: '90 days written notice; immediate termination for material breach with 30-day cure period',
  dataReturnPolicy: 'Full data export in industry-standard formats (CSV, Parquet, JSON) within 30 days of termination. Certified data destruction within 90 days per NIST SP 800-88.',

  // Implementation Plan
  implementationTimeline: '12 weeks standard, 8 weeks accelerated for enterprises with dedicated resources',
  resourceRequirements: 'Client side: 1 project manager, 2 technical leads, 1 data engineer (part-time). Acme side: dedicated implementation team of 4.',
  trainingPlan: 'Phase 1 (Week 8-10): Admin training for IT team. Phase 2 (Week 10-12): End-user training with role-based modules. Ongoing: Monthly office hours, self-paced learning portal, certification program.',
  changeManagement: 'Acme provides change management toolkit including stakeholder mapping, communication templates, adoption metrics dashboard, and executive briefing materials. Dedicated CSM assigned post-go-live.',

  // Deployment Support
  deploymentModel: 'saas',
  supportTiers: 'Standard: 8x5 email/chat, 4hr response for P1. Premium: 24x7 phone/chat, 1hr response for P1, named support engineer. Enterprise: Dedicated TAM, quarterly business reviews, custom SLA.',
  monitoringCapabilities: 'Real-time health dashboard, automated anomaly detection, proactive alerting via PagerDuty/Slack/email. Customer-facing status page (status.acme-analytics.example.com). Monthly uptime and performance reports.',

  // Contract Readiness
  authorizedSignatory: 'Michael Chen',
  signatoryTitle: 'Chief Revenue Officer',
  insuranceCoverage: 'yes',
  contractReady: 'yes',

  // Closure Readiness
  exitPlanDefined: 'yes',
  dataDestructionProcess: 'Upon termination: (1) Full data export provided within 30 days in client-specified format. (2) All client data purged from production within 60 days. (3) Backup data destroyed within 90 days. (4) Certificate of destruction issued per NIST SP 800-88 Rev 1.',
  transitionSupport: 'yes',
  closureNotes: 'Acme provides 90-day transition support period at no additional cost, including data migration assistance to successor platform and parallel-run support.',
};
