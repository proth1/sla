const CV_DEFAULTS = {
  // Test driver config
  configMode: "Manual Mode",
  riskTier: "High",
  governancePhase: "SP5_FinalApproval",
  contractValueBand: "Over1M",
  votingMethod: "super_majority",
  committeeMembers: "governance-lane,compliance-lane,oversight-lane",
  quorumThreshold: 3,
  vetoCapableMembers: "oversight-lane",
  qaEnabled: true,
  qaPeriodDuration: "P2D",
  reminderDuration: "P1D",
  escalationDuration: "P3D",
  deadlineDuration: "P7D",
  maxRemediationLoops: 2,
  authorityMode: "Simple",
  enforceSeparationOfDuties: true,
  requireDualApproval: false,
  requestSummary: "Onboard Acme Analytics Platform — enterprise analytics and reporting consolidation tool for Global Markets Technology. Replaces 4 fragmented reporting systems, addresses OCC MRA 2025-GM-004. High risk due to AI/ML components, cloud SaaS with Confidential data classification, and $1.2M estimated contract value.",
  requestTrackingNumber: "REQ-2026-0247",
  pathway: "Buy",

  // Review brief
  executiveSummary: "Acme Analytics Platform has completed SP3 Evaluation with satisfactory results across all 9 assessment lanes. Security assessment identified 2 medium-severity findings (TLS 1.2 fallback configuration, API rate limiting gaps) — both remediated by vendor with evidence provided. AI governance review confirmed the ML anomaly detection module classifies as Limited Risk under EU AI Act Article 6. Compliance review cleared all cross-border data transfer requirements via Standard Contractual Clauses. Recommend approval with standard monitoring conditions.",
  recommendation: "Approve with standard post-deployment monitoring conditions: (1) 90-day enhanced security monitoring via Splunk integration, (2) quarterly AI model performance review per SR 11-7, (3) annual SOC 2 Type II recertification requirement, (4) data residency audit within 60 days of go-live.",
  keyRisks: "1. AI/ML model drift risk — anomaly detection algorithms may degrade without retraining (mitigated by quarterly review cadence)\n2. Vendor concentration — Acme Corp becomes sole analytics provider for Global Markets (mitigated by contractual data portability clause)\n3. Cross-border data transfer — EU counterparty data flows to US-hosted platform (mitigated by SCCs and Binding Corporate Rules)\n4. Integration complexity — 8 system integrations required (mitigated by phased rollout plan with independent validation gates)",
  mitigatingFactors: "Acme Corp has 12-year operating history, SOC 2 Type II certified (3 consecutive years), no regulatory enforcement actions. Contractual protections include: 99.95% SLA with financial penalties, 90-day termination for convenience, full data export in open formats, escrow agreement for source code. Insurance coverage: $10M cyber liability, $5M E&O.",
  briefComplete: true,

  // Submit question
  questionCategory: "Technical",
  questionText: "Has the vendor provided evidence of penetration testing results for the API endpoints that will integrate with our Bloomberg B-PIPE and Fidessa OMS feeds? Specifically concerned about authentication bypass risks on the real-time data ingestion layer.",
  questionPriority: "High",

  // Answer question
  answerText: "Yes. Acme Corp provided their annual penetration test report (conducted by NCC Group, dated January 2026) covering all REST API endpoints including the real-time data ingestion layer. Key findings: (1) No critical or high-severity findings on API authentication; (2) One medium finding on rate limiting was remediated in v3.2.1 patch (February 2026); (3) OAuth 2.0 + mTLS enforced on all data ingestion endpoints; (4) API gateway implements request signing per HMAC-SHA256. Full report attached to evidence package as Exhibit C-4.",
  briefUpdated: true,

  // Cast vote
  vote: "Approve with Conditions",
  conditions: "1. Vendor must complete SOC 2 Type II bridge letter covering the period between last audit (September 2025) and go-live date\n2. Real-time data ingestion endpoints must pass firm-conducted penetration test (InfoSec team) before production data flows are enabled\n3. AI model risk assessment per SR 11-7 must be filed with Model Risk Management team within 30 days of deployment",
  rationale: "The evidence package demonstrates adequate due diligence across all required assessment domains. Acme Analytics Platform meets functional requirements and the vendor has demonstrated willingness to remediate identified security findings. The conditions address the temporal gap in SOC 2 coverage and ensure our independent security validation before production deployment. AI governance conditions align with existing SR 11-7 obligations.",
  dissentingOpinion: "",
  authorityLevel: "Senior Director, Technology Governance",

  // Reconcile conditions
  allSubmittedConditions: "Voter 1 (Governance): SOC 2 bridge letter + firm pen test before production\nVoter 2 (Compliance): Data residency audit within 60 days, quarterly GDPR compliance attestation\nVoter 3 (Oversight): SR 11-7 filing within 30 days, enhanced monitoring for 90 days post-deployment",
  consolidatedConditions: "1. SOC 2 Type II bridge letter covering September 2025 to go-live date (pre-deployment gate)\n2. Firm-conducted penetration test on data ingestion endpoints (pre-deployment gate)\n3. SR 11-7 model risk assessment filed within 30 days of deployment\n4. Data residency audit within 60 days of go-live\n5. 90-day enhanced security monitoring via Splunk\n6. Quarterly GDPR compliance attestation for first year",
  reconciliationRationale: "Consolidated 3 sets of conditions from governance, compliance, and oversight voters. No conflicts identified — conditions are complementary. Organized into pre-deployment gates (items 1-2) and post-deployment obligations (items 3-6) to provide clear implementation sequencing. All conditions are measurable and time-bound.",
  allConditionsAddressed: true,

  // Remediation revise
  committeeDecision: "Approve with Conditions — Remediation Required",
  previousConditions: "Veto exercised by Oversight: Insufficient evidence of disaster recovery testing for the real-time data ingestion pipeline. OCC 2023-17 Section III.C requires documented business continuity provisions for critical third-party services.",
  revisedExecutiveSummary: "REVISED: Acme Analytics Platform evidence brief updated to include disaster recovery documentation. Vendor provided: (1) DR test results from Q4 2025 tabletop exercise showing 4-hour RTO and 1-hour RPO for data ingestion services; (2) Runbook for failover to secondary US-East region; (3) Commitment letter for semi-annual DR testing with firm observation rights. These additions address OCC 2023-17 Section III.C business continuity requirements.",
  changesDescription: "Added Section 7 (Business Continuity and Disaster Recovery) to evidence brief. Incorporated vendor DR test results, failover architecture diagrams, and RTO/RPO specifications. Updated risk matrix to reflect reduced business continuity risk from High to Medium based on evidence provided.",
  addressedConcerns: "Oversight veto concern (insufficient DR evidence) addressed by: (1) Obtaining vendor DR test report with quantified RTO/RPO metrics; (2) Securing contractual commitment for semi-annual DR testing with firm observation; (3) Adding DR validation as a pre-deployment gate in implementation plan. The evidence now satisfies OCC 2023-17 Section III.C requirements for critical third-party business continuity provisions.",
  remediationLoopCount: 1,
  readyForReVote: true,

  // Vote summary
  approveCount: 2,
  rejectCount: 0,
  conditionalCount: 1,
  abstainCount: 0,
  recusalCount: 0,
  vetoExercised: false,
  votingCompletedDate: "2026-03-07T14:30:00Z"
};

if (typeof module !== 'undefined') module.exports = { CV_DEFAULTS };
