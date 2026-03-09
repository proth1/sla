# Evidence Infrastructure Design: WORM Storage with 7-Year Retention

**SLA-72** | Version 1.0.0 | 2026-03-09

## 1. Purpose

This document defines the evidence storage architecture for the SLA Enterprise Software Governance framework. Financial services organizations operating under SEC 17a-4, SOX, OCC 2023-17, GDPR, and DORA must retain governance evidence in tamper-proof storage with defined retention periods and retrieval SLAs.

## 2. Evidence Types

### 2.1 Governance Decisions

Records of committee votes, approval records, rejection rationale, and conditional approval terms generated during Phase 4 (Governance Review and Approval). Includes quorum verification, individual vote records with timestamps, and the DMN output variables that informed routing (DMN-3: GovernanceReviewRouting).

**Source processes**: SP-Phase4-GovernanceReview, committee-voting-process.bpmn
**Regulatory drivers**: OCC 2023-17 (third-party governance), SOX (financial controls)

### 2.2 Compliance Attestations

Regulatory certifications, audit reports, control assessments, and compliance sign-offs. Includes SOC 2 Type II reports, ISO 27001 certificates, penetration test executive summaries, and regulatory examination responses.

**Source processes**: SP-Phase3-DueDiligence (parallel evaluation branches), SP-Cross-4 (Regulatory Change Management)
**Regulatory drivers**: SEC 17a-4 (records retention), DORA (digital operational resilience), NIST CSF 2.0

### 2.3 Audit Trails

Process execution logs from Camunda 8 Operate, task completion records from Tasklist, SLA metrics (breach counts, cycle times), and phase transition timestamps. Includes DMN decision audit trails capturing input variables and output results for all 15 DMN tables.

**Source processes**: All 8 phases, SP-Cross-1 (SLA Monitoring & Breach Management), SP-Cross-5 (Continuous Improvement)
**Regulatory drivers**: OCC 2023-17 (audit trail requirements), SOX (internal controls documentation)

### 2.4 Risk Assessments

Due diligence findings from the 9-branch parallel evaluation in Phase 3, vulnerability scan results, penetration test reports, AI model risk assessments (SR 11-7), and ongoing monitoring results from Phase 8.

**Source processes**: SP-Phase3-DueDiligence, SP-Cross-2 (Vulnerability Remediation), SP-Phase8-Operations
**Regulatory drivers**: SR 11-7 (model risk), OCC 2023-17 (risk assessment), EU AI Act (AI system classification)

### 2.5 Contractual Records

Signed vendor agreements, contract amendments, SLA definitions, NDA/DPA documents, and termination notices. Includes the full negotiation history and version chain for each contract.

**Source processes**: SP-Phase5-Contracting, vendor pool message flows
**Regulatory drivers**: OCC 2023-17 (contract provisions), DORA (ICT third-party contracts), SEC 17a-4

## 3. Retention Tiers

| Tier | Duration | ISO 8601 | Use Cases | Storage Class | Deletion Policy |
|------|----------|----------|-----------|---------------|-----------------|
| Regulatory (Tier 1) | 7 years | P7Y | SEC 17a-4 records, SOX evidence, OCC 2023-17 governance records, signed contracts, governance decisions | WORM / Object Lock (Compliance mode) | Automated after retention + 90-day grace period; legal hold overrides |
| Operational (Tier 2) | 3 years | P3Y | Process execution logs, SLA metrics, routine risk assessments, internal compliance reviews | Standard immutable (Governance mode) | Automated after retention; bulk purge quarterly |
| Transient (Tier 3) | 1 year | P1Y | Draft documents, working papers, interim analysis, sandbox test results | Standard with lifecycle policy | Automated after retention; no grace period |

### 3.1 Retention Decision Flow

Evidence retention tier assignment is driven by DMN-15 (Evidence Retention Routing), which evaluates three inputs:
1. **Evidence type** (GovernanceDecision, ComplianceAttestation, AuditTrail, RiskAssessment, ContractualRecord)
2. **Regulatory regime** (US, EU, UK, APAC)
3. **Data classification** (Public, Internal, Confidential, Restricted)

The DMN table outputs the retention tier, duration, storage requirements, and additional controls. This ensures consistent, auditable retention assignment across all evidence types.

## 4. Storage Requirements

### 4.1 Immutability

| Tier | Immutability Mode | Lock Type | Override |
|------|-------------------|-----------|----------|
| Tier 1 | WORM (Compliance mode) | Object-level retention lock | Cannot be shortened by any user, including root; legal hold extends indefinitely |
| Tier 2 | Governance mode | Bucket-level default retention | Administrators can shorten with dual-approval workflow |
| Tier 3 | Lifecycle policy | No explicit lock | Standard deletion after expiry |

**SEC 17a-4 compliance** requires that Tier 1 records cannot be altered or deleted during the retention period, even by administrators. This mandates Compliance mode (not Governance mode) for regulatory evidence.

### 4.2 Indexing and Search

| Requirement | Specification |
|-------------|---------------|
| Metadata schema | Evidence ID, type, source process instance, phase, timestamp, regulatory tags, data classification, retention tier, hash (SHA-256) |
| Full-text search | Metadata fields only (not document content, to avoid PII exposure in search indices) |
| Query patterns | By process instance ID, by evidence type, by date range, by regulatory tag, by retention tier |
| Index storage | Separate from evidence store; index is mutable and rebuilable from evidence metadata |

### 4.3 Retrieval SLAs

| Tier | Retrieval SLA | Access Pattern | Justification |
|------|---------------|----------------|---------------|
| Tier 1 (Regulatory) | < 5 seconds | Hot storage; immediate access for regulatory examinations | Examiners expect real-time document retrieval during on-site reviews |
| Tier 2 (Operational) | < 5 seconds | Hot storage; frequent access for operational reporting | Operational dashboards and SLA reports need sub-second queries |
| Tier 3 (Transient) | < 30 seconds | Warm storage; infrequent access | Working papers rarely accessed after initial review period |

### 4.4 Encryption

| Layer | Standard | Key Management |
|-------|----------|----------------|
| At rest | AES-256 | Cloud KMS with automatic key rotation (90-day cycle) |
| In transit | TLS 1.3 | Certificate pinning for service-to-service communication |
| Field-level (Tier 1 only) | AES-256-GCM | Separate key per evidence type; keys stored in HSM |

### 4.5 Access Control

| Role | Tier 1 | Tier 2 | Tier 3 |
|------|--------|--------|--------|
| Governance Board (`governance-lane`) | Read | Read/Write | Read/Write |
| Compliance (`compliance-lane`) | Read | Read | Read |
| Internal Audit (`oversight-lane`) | Read | Read | Read |
| Business (`business-lane`) | None | Read (own process instances) | Read/Write (own) |
| Automation (`automation-lane`) | Write (append-only) | Write (append-only) | Write |
| External Auditor (time-limited) | Read (scoped to examination period) | Read (scoped) | None |

All access operations are logged to an immutable audit trail (separate from the evidence store itself).

## 5. Integration Points

### 5.1 Phase Boundary Approval Records

Every phase transition in the 8-phase governance lifecycle generates evidence through the mandatory phase boundary pattern (completion gateway, quality gate, approval task, phase transition event). The evidence hook captures:
- Approval user task completion (approver identity, timestamp, decision)
- Quality gate DMN evaluation (input variables, output result, table version)
- Phase transition event (signal name, process instance state)

**Integration**: Camunda 8 task completion webhook triggers evidence capture service task in SP-Cross-1.

### 5.2 DMN Decision Audit Trails

All 15 DMN decision tables generate audit records on every evaluation:

| DMN Table | Evidence Type | Retention Tier |
|-----------|---------------|----------------|
| DMN-1: Risk Tier Classification | RiskAssessment | Regulatory-7Y |
| DMN-2: Pathway Routing | AuditTrail | Operational-3Y |
| DMN-3: Governance Review Routing | GovernanceDecision | Regulatory-7Y |
| DMN-4: Automation Tier Assignment | AuditTrail | Operational-3Y |
| DMN-5: Agent Confidence Escalation | AuditTrail | Operational-3Y |
| DMN-6: Change Risk Scoring | RiskAssessment | Regulatory-7Y |
| DMN-7: Vulnerability Remediation Routing | RiskAssessment | Regulatory-7Y |
| DMN-8: Monitoring Cadence Assignment | AuditTrail | Operational-3Y |
| DMN-9: Incident Severity Classification | RiskAssessment | Regulatory-7Y |
| DMN-10: Incident Severity Classification | RiskAssessment | Regulatory-7Y |
| DMN-11: Jurisdictional Routing | ComplianceAttestation | Regulatory-7Y |
| DMN-12: Contract Renewal Routing | ContractualRecord | Regulatory-7Y |
| DMN-13: Data Residency Routing | ComplianceAttestation | Regulatory-7Y |
| DMN-14: Data Residency Routing | ComplianceAttestation | Regulatory-7Y |
| DMN-15: Evidence Retention Routing | AuditTrail | Operational-3Y |

**Integration**: Camunda 8 decision evaluation history API exports decision instances; batch job runs nightly.

### 5.3 Cross-Cutting Subprocess Evidence

| Subprocess | Evidence Generated | Frequency |
|------------|-------------------|-----------|
| SP-Cross-1: SLA Monitoring | Breach reports, escalation records, SLA metric snapshots | Per breach event + monthly summary |
| SP-Cross-2: Vulnerability Remediation | Scan results, remediation plans, closure evidence | Per vulnerability + quarterly rollup |
| SP-Cross-3: Incident Response | Incident reports, root cause analysis, post-mortem records | Per incident |
| SP-Cross-4: Regulatory Change | Impact assessments, compliance gap analyses, remediation plans | Per regulatory change |
| SP-Cross-5: Continuous Improvement | Process mining reports, optimization recommendations, KPI trends | Quarterly |

### 5.4 CDD Evidence Hooks

The Compliance-Driven Development methodology embedded in `.claude/rules/` generates evidence at development time:
- BPMN validation results (from `scripts/validators/`)
- PR review findings (from `pr-orchestrator` subagent)
- Decision log entries (from `.claude/memory-bank/decisionLog.md`)

These are classified as Transient (Tier 3) evidence unless they document a governance decision, in which case they escalate to Tier 1.

## 6. Architecture Options

### 6.1 Comparison Matrix

| Criterion | Option A: AWS S3 Object Lock | Option B: Azure Immutable Blob | Option C: NetApp StorageGRID |
|-----------|-------------------------------|--------------------------------|------------------------------|
| **WORM compliance** | SEC 17a-4 certified (Cohasset Associates assessed) | SEC 17a-4 compliant (time-based + legal hold) | SEC 17a-4 certified (hardware-enforced) |
| **Retention modes** | Governance + Compliance | Time-based + Legal hold | Object-level WORM lock |
| **Minimum retention** | 1 day | 1 day | 1 day |
| **Maximum retention** | Unlimited | Unlimited | Unlimited |
| **Retrieval latency** | < 100ms (S3 Standard) | < 100ms (Hot tier) | < 50ms (local appliance) |
| **Cost (1 PB/year)** | ~$23,000/month (Standard) | ~$18,000/month (Hot) | ~$50,000/month (including hardware amortization) |
| **Encryption at rest** | AES-256 (SSE-S3/SSE-KMS) | AES-256 (Microsoft-managed or CMK) | AES-256 (node-level + object-level) |
| **Encryption in transit** | TLS 1.2/1.3 | TLS 1.2/1.3 | TLS 1.2/1.3 |
| **Access audit** | CloudTrail (S3 data events) | Azure Monitor + Storage Analytics | Audit log (syslog/SNMP) |
| **Geo-redundancy** | Cross-region replication | GRS/GZRS | Multi-site replication |
| **Integration effort** | Low (SDK/API, IAM policies) | Low (SDK/API, RBAC) | Medium (appliance deployment, network configuration) |
| **Camunda 8 integration** | Native (Zeebe exporters to S3) | Via Azure Functions | Custom connector required |
| **Multi-tenancy** | Bucket-level isolation + IAM | Container-level isolation + RBAC | Tenant-level isolation |
| **Data residency** | Region-locked buckets | Region-locked storage accounts | On-premises (full control) |
| **Disaster recovery** | Cross-region replication + versioning | GRS with failover | Multi-site active-active |
| **Vendor lock-in risk** | Medium (S3 API is de facto standard) | Medium (Azure-specific features) | Low (on-premises, portable) |

### 6.2 Recommendation: Option A -- AWS S3 Object Lock (Compliance Mode)

**Rationale:**

1. **SEC 17a-4 certification**: Cohasset Associates has independently assessed S3 Object Lock Compliance mode for SEC 17a-4(f), SEC Rule 18a-6(e), and CFTC Rule 1.31(c)-(d). This provides examiners with a recognized compliance assessment.

2. **Camunda 8 integration**: Camunda 8 Cloud runs on AWS. The Zeebe Elasticsearch exporter can feed decision history and process instance data directly to S3 via Lambda functions, minimizing cross-cloud data transfer latency and cost.

3. **Cost efficiency**: At the projected evidence volume (estimated 50-200 GB/year for a mid-size financial institution), S3 Standard costs are negligible (~$1-5/month). Even at scale, S3 Intelligent-Tiering automatically optimizes cost for Tier 2/3 evidence that becomes infrequently accessed.

4. **Operational maturity**: CloudTrail provides comprehensive access auditing. S3 Inventory provides compliance reporting. S3 Batch Operations enable bulk retention management. These are table-stakes for financial services operations teams.

5. **Multi-region data residency**: S3 bucket policies can enforce data residency requirements identified by DMN-14 (Data Residency Routing), ensuring EU evidence stays in `eu-west-1`/`eu-central-1` and US evidence stays in `us-east-1`/`us-west-2`.

**When to reconsider Option B (Azure)**: If the customer's primary cloud is Azure and Camunda 8 Self-Managed runs on AKS. Cross-cloud evidence transfer adds latency and egress cost.

**When to reconsider Option C (StorageGRID)**: If the customer has strict on-premises requirements (e.g., certain APAC jurisdictions under PIPL) or already operates NetApp infrastructure.

## 7. Implementation Architecture (AWS S3)

### 7.1 Bucket Structure

```
sla-evidence-{environment}-{region}/
  regulatory/           # Tier 1: Object Lock Compliance mode, P7Y retention
    governance-decisions/
    compliance-attestations/
    contractual-records/
    risk-assessments/    # Restricted/Confidential only
  operational/           # Tier 2: Object Lock Governance mode, P3Y retention
    audit-trails/
    process-logs/
    sla-metrics/
    risk-assessments/    # Internal/Public only
  transient/             # Tier 3: Lifecycle policy, P1Y expiration
    working-papers/
    draft-documents/
    cdd-evidence/
```

### 7.2 Object Naming Convention

```
{tier}/{evidence-type}/{year}/{month}/{process-instance-id}/{evidence-id}.{ext}
```

Example:
```
regulatory/governance-decisions/2026/03/pi-abc123/ev-vote-record-2026-03-09T14-30-00Z.json
```

### 7.3 Evidence Metadata Schema

```json
{
  "evidenceId": "ev-vote-record-2026-03-09T14-30-00Z",
  "evidenceType": "GovernanceDecision",
  "processInstanceId": "pi-abc123",
  "processDefinitionKey": "Process_Onboarding_v8",
  "phase": "Phase4-GovernanceReview",
  "timestamp": "2026-03-09T14:30:00Z",
  "regulatoryTags": ["OCC-2023-17", "SOX"],
  "dataClassification": "Confidential",
  "retentionTier": "Regulatory-7Y",
  "retentionExpiry": "2033-03-09T14:30:00Z",
  "contentHash": "sha256:a1b2c3d4...",
  "sourceSystem": "camunda-8-tasklist",
  "createdBy": "automation-lane"
}
```

### 7.4 Evidence Capture Flow

```
[Camunda 8 Process Event]
    → [Zeebe Exporter / Tasklist Webhook]
    → [Evidence Capture Lambda]
    → [DMN-15 Evaluation (retention routing)]
    → [S3 PutObject with Object Lock retention]
    → [DynamoDB metadata index update]
    → [CloudWatch metric (evidence-captured)]
```

## 8. Security Controls

### 8.1 Defense in Depth

| Layer | Control | Implementation |
|-------|---------|----------------|
| Network | VPC endpoint for S3 | No internet traversal for evidence writes |
| Identity | IAM roles with condition keys | `s3:PutObject` only from evidence capture Lambda |
| Encryption | SSE-KMS with CMK | Per-region KMS key, automatic 90-day rotation |
| Integrity | SHA-256 content hash | Computed at capture, verified at retrieval |
| Audit | CloudTrail data events | All S3 operations logged to separate audit bucket |
| Monitoring | CloudWatch alarms | Alert on unauthorized access attempts, retention policy changes |
| Legal hold | S3 Object Lock legal hold | Applied via compliance team workflow; overrides retention expiry |

### 8.2 Key Management

- **KMS key per region** (supports data residency requirements from DMN-14)
- **Key policy**: Only evidence capture Lambda and authorized retrieval roles can use the key
- **Key rotation**: Automatic 90-day rotation; old key versions retained for decryption
- **HSM-backed**: For Tier 1 evidence, use AWS CloudHSM-backed KMS keys

## 9. Compliance Mapping

| Regulation | Requirement | How Addressed |
|------------|-------------|---------------|
| SEC 17a-4(f) | Non-rewritable, non-erasable storage for 6 years (first 2 years immediately accessible) | S3 Object Lock Compliance mode with P7Y retention; S3 Standard (hot) for full period |
| SOX Section 802 | Retention of audit workpapers for 7 years | Tier 1 retention covers SOX evidence |
| OCC 2023-17 | Documentation of third-party risk management activities | All TPRM evidence captured across phases 2, 3, 5, 8 |
| GDPR Article 5(1)(e) | Storage limitation; data not kept longer than necessary | Automated lifecycle deletion after retention expiry |
| GDPR Article 17 | Right to erasure | Legal basis override for regulatory retention; PII minimization in evidence |
| DORA Article 11 | ICT-related incident evidence | SP-Cross-3 evidence captured with Tier 1 retention |
| SR 11-7 | Model risk documentation | AI governance evidence from Phase 3 AI Review branch |
| NIST CSF 2.0 | Audit log integrity | SHA-256 hashing + WORM storage ensures log integrity |

## 10. Operational Procedures

### 10.1 Evidence Retrieval for Regulatory Examination

1. Examiner submits evidence request (scoped by date range, evidence type, process instance)
2. Compliance team creates time-limited IAM role with read-only access to requested scope
3. Evidence portal generates pre-signed URLs (1-hour expiry) for requested documents
4. All retrieval operations logged to audit trail
5. IAM role automatically expires at end of examination period

### 10.2 Legal Hold Process

1. Legal counsel issues hold notice (litigation, regulatory investigation)
2. Compliance team applies S3 Object Lock legal hold to affected evidence
3. Legal hold overrides retention expiry (evidence cannot be deleted while hold is active)
4. Hold is removed only by legal counsel authorization with dual-approval
5. After hold removal, normal retention policy resumes

### 10.3 Retention Expiry and Deletion

1. Daily batch job identifies evidence past retention expiry (retention date + 90-day grace for Tier 1)
2. Deletion candidate list generated and stored for 30-day review period
3. Compliance team reviews and approves deletion batch
4. S3 lifecycle policy executes deletion
5. Deletion confirmation logged to audit trail with evidence metadata (not content)

## 11. Capacity Planning

| Metric | Year 1 | Year 3 | Year 7 |
|--------|--------|--------|--------|
| Evidence volume (cumulative) | 50-200 GB | 200-800 GB | 500 GB - 2 TB |
| Evidence objects (cumulative) | 50,000-200,000 | 200,000-800,000 | 500,000 - 2,000,000 |
| Monthly storage cost (S3 Standard) | $1-5 | $5-20 | $12-50 |
| Monthly retrieval cost (estimate) | $1-3 | $2-5 | $3-8 |
| Index size (DynamoDB) | < 1 GB | 2-5 GB | 5-15 GB |

Cost projections assume a mid-size financial institution processing 200-500 governance lifecycle instances per year.

## 12. Open Questions

1. **OneTrust integration**: If OneTrust TPRM module manages vendor assessments, should evidence be stored in OneTrust's native evidence vault or replicated to S3? Dual-storage increases cost but reduces vendor lock-in.
2. **Camunda 8 Cloud data export**: What is the retention period for Operate/Tasklist data in Camunda 8 SaaS? May need supplementary export jobs if Camunda retention is shorter than 7 years.
3. **Cross-border evidence**: For multi-jurisdictional operations, should evidence be replicated across regions or stored in a single region with cross-border access controls?
4. **Evidence format standardization**: Should all evidence be normalized to a standard format (e.g., JSON-LD with schema.org vocabulary) or stored in native format with metadata overlay?

---

**Approving Authority**: Governance Review Board
**Review Cycle**: Annual
**Next Review**: 2027-03-09
