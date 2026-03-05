# Vendor / Third Party — External Software or Contracting

## 1. Vendor Intake and Qualification

Screen vendor eligibility and establish baseline qualification before any substantive information exchange begins. Collect vendor legal entity details, ownership structure, financial stability indicators, geographic footprint, and existing certifications. Perform conflict-of-interest screening and preliminary risk tier classification. Verify the vendor is not on any sanctions or exclusion lists. Establish the lawful basis for data collection under applicable privacy regulations.

**Regulatory Controls:**

1. **OCC 2023-17 Sections 30-35**: Pre-engagement due diligence requirements — verify vendor identity, assess concentration risk, determine if vendor is critical or significant.
2. **NIST CSF 2.0 GV.OC-05**: Supply chain risk identification at initial onboarding — document risk factors in the vendor risk register.
3. **GDPR Article 6 / CCPA**: Establish lawful basis before collecting any personal data from or about the vendor; document the legal basis in the processing activities register.

**Evidence Collection:**

- Completed vendor qualification form with legal entity name, DUNS number, jurisdiction of incorporation
- Risk tier pre-assessment worksheet (feeds into DMN_RiskTierClassification)
- Signed conflict-of-interest declaration from the requesting business unit
- Sanctions screening result (OFAC, EU consolidated list)
- Vendor financial stability indicators (credit rating, annual revenue, years in operation)
- Proof of insurance certificates (E&O, cyber liability)

**Data Points:** Legal entity name, tax ID, DUNS, ownership structure (UBO disclosure for >25% holders), primary contact, geographic presence, industry certifications held, number of employees, annual revenue range, existing client references in financial services.

---

## 2. Vendor Proposal

Vendor prepares and submits a formal commercial and technical proposal in response to the organization's requirements. The proposal must address functional requirements, technical architecture, SLA commitments, pricing model, implementation timeline, and support structure. Vendor should disclose financial stability information, sub-contractor dependencies, and data handling practices. This proposal triggers the parallel evaluation tracks (Security, Compliance, Technical Demo).

**Regulatory Controls:**

1. **OCC 2023-17 Section 40**: RFP/RFI requirements — vendor must demonstrate capability, financial stability, and willingness to comply with regulatory examination requirements.
2. **SOX Section 404**: Proposed financial controls and reporting capabilities must be documented in the proposal to ensure auditability of financial data flows.
3. **DORA Article 28**: ICT third-party provider must assert resilience capabilities, including recovery time objectives, availability targets, and incident notification commitments in the proposal.

**Evidence Collection:**

- Signed proposal document with commercial terms, technical specifications, and SLA commitments
- Vendor capability matrix mapping proposed features to stated requirements
- Financial stability disclosures (audited financials, credit references, or parent company guarantee if applicable)
- Sub-contractor dependency disclosure listing all fourth parties involved in service delivery
- Data handling and residency commitments (where data will be processed, stored, and backed up)
- Implementation timeline with milestones and resource commitments

**Data Points:** Proposed pricing model (subscription, perpetual, consumption-based), total cost of ownership (TCO) estimate over 3-5 years, SLA targets (uptime, response time, resolution time), proposed technology stack, integration approach, data residency locations, sub-processor list, key personnel assigned, reference customers in regulated industries.

---

## 3. Security Questionnaire

Vendor completes a standardized security questionnaire (HECVAT, SIG, or equivalent) covering information security program maturity, access controls, encryption practices, incident response capabilities, vulnerability management, and business continuity planning. Vendor provides supporting evidence including SOC 2 Type II reports, penetration test summaries, and vulnerability disclosure policies. This runs in parallel with Compliance Documentation and Technical Demonstration.

**Regulatory Controls:**

1. **OCC 2023-17 Sections 50-55**: Information security program assessment — evaluate vendor access controls, data handling procedures, encryption at rest and in transit, and incident response readiness.
2. **NIST CSF 2.0 PR.AA (Identity Management and Access Control)**: Assess vendor authentication mechanisms, privileged access management, MFA enforcement. **NIST PR.DS (Data Security)**: Evaluate encryption standards, key management, data classification practices. **NIST DE.CM (Continuous Monitoring)**: Assess vendor logging, monitoring, and alerting capabilities.
3. **ISO 27001 Annex A**: Map vendor controls to relevant Annex A domains — A.9 Access Control, A.10 Cryptography, A.12 Operations Security, A.16 Incident Management, A.17 Business Continuity.
4. **DORA Articles 9, 28**: ICT security requirements assessment — verify vendor incident reporting capability within 24-hour notification windows, test resilience measures.

**Evidence Collection:**

- Completed HECVAT or SIG security questionnaire with all sections addressed
- SOC 2 Type II report (current year) or SOC 1 if financial data processing
- Most recent penetration test executive summary (within 12 months)
- Vulnerability disclosure and patch management policy
- Business continuity and disaster recovery plan summary with RTO/RPO commitments
- Data encryption standards documentation (at rest, in transit, key management)
- Security incident history disclosure (breaches in past 3 years)

**Data Points:** Security certifications held (ISO 27001, SOC 2, PCI DSS, FedRAMP), encryption algorithms and key lengths, MFA enforcement percentage, mean time to patch critical vulnerabilities, incident response SLA, backup frequency and retention, DR test frequency, security awareness training completion rate.

---

## 4. Compliance Documentation

Vendor submits regulatory certifications, compliance attestations, and data protection documentation. This includes proof of regulatory compliance relevant to the services being provided, audit rights confirmation, Data Processing Agreement (DPA) terms, sub-processor disclosures, and data residency documentation. Vendor must demonstrate compliance posture across all applicable regulatory frameworks for the engagement scope.

**Regulatory Controls:**

1. **OCC 2023-17 Section 55**: Regulatory compliance certifications — vendor must confirm willingness to submit to regulatory examination, provide audit rights, and maintain compliance with applicable banking regulations.
2. **GDPR Article 28**: Data Processing Agreement requirements — vendor must provide draft or executed DPA covering processing purpose limitation, data minimization, security measures, sub-processor authorization, data subject rights support, breach notification obligations, and data return/deletion on termination. **CCPA**: Vendor must confirm service provider status and data handling restrictions.
3. **SOX**: External audit independence confirmation if vendor touches financial reporting data; financial controls attestation documenting how vendor safeguards data integrity in financial workflows.
4. **DORA Article 30**: Contractual arrangements documentation — vendor must disclose full sub-contracting chain, confirm exit strategy feasibility, and demonstrate ability to support regulatory reporting.
5. **NIST CSF 2.0 GV.SC-07**: Supplier compliance posture documentation — vendor provides evidence of supply chain risk management practices.

**Evidence Collection:**

- Regulatory certifications (ISO 27001 certificate, SOC 2 Type II report, PCI DSS AOC, FedRAMP authorization as applicable)
- Signed or draft Data Processing Agreement with all GDPR Article 28(3) provisions addressed
- Complete sub-processor list with names, locations, and services provided
- Audit rights confirmation letter allowing organization and regulators to examine vendor operations
- Data residency documentation confirming where data will be stored, processed, and backed up
- Privacy impact assessment or DPIA if high-risk processing is involved
- Regulatory examination history disclosure (any enforcement actions, consent orders, or material findings in past 5 years)

**Data Points:** Certifications held and expiry dates, DPA execution status, sub-processor count and jurisdictions, data residency countries, audit rights scope (on-site, remote, frequency), regulatory examination history, privacy officer contact details, data breach notification timeline commitment, data retention and deletion policies.

---

## 5. Technical Demonstration

Vendor conducts a structured technical demonstration of the proposed solution against predefined evaluation criteria. The demo must cover functional capabilities, integration points, security controls in action, performance under load, failover and recovery mechanisms, and administrative workflows. Evaluators score the demonstration using a standardized scorecard aligned with the requirements from the vendor proposal.

**Regulatory Controls:**

1. **OCC 2023-17 Section 40**: Technology capability validation — demonstration must verify that the vendor's solution meets the stated technical requirements and can operate within the organization's technology environment without introducing unacceptable risk.
2. **NIST CSF 2.0 PR.PS (Platform Security)**: Demonstrate secure configuration management, hardening practices, and change management controls during the live demonstration.
3. **DORA Article 9**: ICT resilience capabilities — vendor must demonstrate failover mechanisms, recovery procedures, and availability targets during the technical demonstration, including simulated failure scenarios where feasible.

**Evidence Collection:**

- Pre-defined demo script with evaluation criteria mapped to requirements
- Completed evaluation scorecard signed by all assessors (Technical Architecture, Security, Business)
- Architecture diagram reviewed and annotated during the demonstration
- Availability and recovery time objective (RTO/RPO) verification results from demonstrated failover
- Integration compatibility assessment documenting API standards, authentication methods, and data format compatibility
- Performance benchmark results (response times, throughput, concurrent user capacity)
- Screenshots or recording of key demo scenarios (with vendor consent)

**Data Points:** Demo completion percentage against script, evaluator scores by category (functionality, security, performance, usability, integration), identified gaps or limitations, questions raised and vendor responses, integration complexity assessment (low/medium/high), estimated customization effort, accessibility compliance status (WCAG 2.1 AA if applicable).

---

## 6. Vendor Contract Review

Vendor receives the draft contract from the organization's legal/contracting team and performs a thorough review of all terms, conditions, and obligations. The vendor reviews service level commitments, liability provisions, indemnification clauses, audit rights, data protection obligations, termination and exit provisions, intellectual property rights, and regulatory compliance requirements. Vendor provides redlined comments and negotiation positions on any terms requiring modification.

**Regulatory Controls:**

1. **OCC 2023-17 Sections 60-70**: Required contractual provisions that must be present and accepted — includes audit rights for the institution and its regulators, subcontracting restrictions and approval requirements, data ownership and return provisions, business continuity and disaster recovery commitments, termination rights (for cause and for convenience), confidentiality obligations, and regulatory compliance representations.
2. **SOX Section 302/404**: Audit rights and financial controls provisions must be explicitly stated in the contract — vendor must agree to provide access to financial records and cooperate with external auditors as needed.
3. **GDPR Article 28(3)**: Mandatory Data Processing Agreement provisions must be reviewed and confirmed — including processing only on documented instructions, confidentiality obligations, security measures, sub-processor management, data subject rights assistance, breach notification within 72 hours, and data deletion on termination. CCPA service provider contractual requirements.
4. **DORA Article 30**: Mandatory ICT contractual provisions — SLA definitions with measurable targets, availability guarantees, audit and access rights, exit strategy and transition assistance, incident notification within contractual timeframes, and sub-outsourcing governance.

**Evidence Collection:**

- Redlined contract document with vendor comments and negotiation positions
- Legal review checklist cross-referenced against OCC 2023-17 Section 60 required provisions (all provisions must be present or explicitly waived with justification)
- DPA review sign-off confirming all GDPR Article 28(3) requirements are addressed
- SLA schedule review confirming measurable targets with defined remedies for non-performance
- Insurance requirements confirmation (vendor confirms ability to maintain required coverage levels)
- Escalation matrix and governance structure for contract management

**Data Points:** Number of redlined clauses, categories of requested changes (commercial, legal, operational, technical), negotiation risk assessment (high/medium/low impact items), estimated time to resolution, vendor authorized negotiator identity and authority level.

---

## 7. Contract Execution

Vendor executes (counter-signs) the final negotiated contract, including the master services agreement, all schedules (SLA, DPA, SOW), and any side letters. The authorized signatory must be verified against the vendor's corporate authorization records. Execution must occur before any data processing, system access provisioning, or service delivery begins. The executed contract is the legal prerequisite for all subsequent onboarding activities.

**Regulatory Controls:**

1. **OCC 2023-17 Section 60**: Executed contract must contain all required provisions — no services may commence until the contract is fully executed with all mandatory OCC provisions present. The executed contract becomes part of the regulatory examination file.
2. **SOX Section 302**: Authorized signatory confirmation — verify the person signing has corporate authority to bind the vendor. Financial controls terms become legally binding upon execution.
3. **GDPR Article 28**: Executed DPA is a legal prerequisite before any personal data processing begins — the DPA must be in force before data flows are established. CCPA service provider agreement must be executed.
4. **DORA Article 30**: Fully executed ICT contract with all mandatory DORA provisions — contract must be registered in the ICT third-party provider register upon execution.
5. **SEC 17a-4**: Records retention — the executed contract must be stored in a compliant, tamper-evident repository with guaranteed retention period (typically 7+ years for financial services).

**Evidence Collection:**

- Fully executed contract (wet signature or qualified e-signature with timestamp and audit trail)
- Executed Data Processing Agreement as a separate schedule or standalone document
- Authorized signatory verification (corporate resolution, power of attorney, or certificate of authority)
- Contract reference number assigned and logged in the contract management system
- Insurance certificates confirmed as current and meeting contractual minimums
- Executed NDA if not already covered by the master agreement
- Board or committee approval documentation if the contract exceeds delegated authority thresholds

**Data Points:** Execution date, contract effective date, contract term (initial + renewal periods), total contract value, authorized signatories (both parties), contract reference number, DPA execution confirmation, insurance coverage verification date, repository location for original documents.

---

## 8. Vendor Onboarding

Vendor is formally onboarded into the organization's ecosystem. This includes provisioning system access on a least-privilege basis, establishing data flows per the DPA, adding the vendor to the third-party risk register and ICT provider inventory, configuring monitoring baselines, and completing knowledge transfer. Vendor completes onboarding checklist items including security awareness acknowledgment, acceptable use policy acceptance, and emergency contact registration.

**Regulatory Controls:**

1. **OCC 2023-17 Section 80**: Ongoing monitoring baseline established — vendor must be added to the third-party inventory with risk tier, criticality designation, and monitoring cadence assigned (references DMN_MonitoringCadenceAssignment). Concentration risk assessment updated.
2. **NIST CSF 2.0 PR.AA-05**: Vendor access provisioned on least-privilege principle — access scoped strictly to what is required by the contract. Multi-factor authentication enforced for all vendor access. Access reviews scheduled per the monitoring cadence.
3. **DORA Article 28**: Vendor added to the ICT third-party provider register with all mandatory fields populated (provider name, services, criticality, contract reference, risk assessment date).
4. **GDPR/CCPA**: Data flows documented in the Record of Processing Activities (ROPA). Processing activities register updated to reflect the new vendor relationship. DPA controls activated and verified (encryption, access controls, breach notification procedures tested).
5. **ISO 27001 A.15.1**: Information security in supplier relationships — vendor formally enrolled in the supplier management program with defined security requirements, communication channels, and review schedule.

**Evidence Collection:**

- Vendor entry in the third-party risk register with complete metadata
- Access provisioning record documenting specific systems, roles, and permissions granted (least-privilege verification)
- Updated data flow diagram showing vendor data ingress/egress points
- Supplier onboarding checklist signed off by Risk and Governance team
- Vendor security awareness acknowledgment and acceptable use policy acceptance
- Emergency contact and escalation path registration
- Monitoring baseline configuration (KRIs, thresholds, alert recipients)
- Initial performance baseline metrics captured

**Data Points:** Systems accessed (list), access level per system, data categories processed, data flow endpoints, monitoring cadence assigned, KRI thresholds configured, onboarding completion date, first scheduled review date, vendor relationship manager assigned, backup contact designated.

---

## 9. Deployment Support

Vendor actively supports the deployment and go-live of their product or service within the organization's environment. This includes executing the deployment runbook, configuring production environments, performing data migration (if applicable), conducting smoke testing, establishing configuration baselines, verifying rollback procedures, and providing on-call support during the stabilization period. Vendor must document all deployment activities and configuration changes for audit purposes.

**Regulatory Controls:**

1. **OCC 2023-17 Section 80**: Change management oversight for vendor-involved deployments — all deployment activities must follow the organization's change management process. Vendor changes are subject to the same approval and documentation requirements as internal changes.
2. **NIST CSF 2.0 PR.PS-04**: Audit logs generated during deployment — all configuration changes, access events, and deployment actions must be logged with timestamps, actor identification, and before/after state. Configuration baseline established post-deployment for drift detection.
3. **DORA Article 12**: ICT change management — vendor-supported changes must be covered under resilience testing requirements. Deployment must not compromise operational resilience. Rollback capability must be verified before go-live.
4. **ISO 27001 A.12.1.2**: Change management controls applied to vendor-assisted deployments — formal change request, impact assessment, approval, implementation, and post-implementation review.

**Evidence Collection:**

- Vendor-provided deployment runbook with step-by-step procedures
- Go-live sign-off record signed by Technical Assessment, Business Owner, and Vendor
- Configuration baseline snapshot captured immediately post-deployment
- Rollback plan confirmation — tested and verified before production deployment
- Deployment log artifact with timestamps, actions taken, personnel involved, and issues encountered
- Smoke test results confirming core functionality in production environment
- Data migration validation report (if applicable) confirming data integrity and completeness
- Post-deployment monitoring dashboard showing system health metrics

**Data Points:** Deployment date and duration, deployment method (blue-green, rolling, big-bang), environments deployed to, configuration items changed, data migration volume and validation result, smoke test pass/fail results, issues encountered and resolution, rollback test result, stabilization period duration, on-call support contact and schedule.

---

## 10. Close Request

Vendor confirms engagement completion and provides final deliverables for handoff to ongoing operations and monitoring. This includes archiving all security and compliance evidence, establishing vendor performance baselines for ongoing measurement, completing final documentation, confirming data handling obligations are met, and transitioning to the ongoing monitoring cadence. The vendor engagement moves from active onboarding to steady-state vendor management.

**Regulatory Controls:**

1. **OCC 2023-17 Section 80**: Transition to ongoing monitoring — vendor performance baseline must be documented and the monitoring cadence formally established (references DMN_MonitoringCadenceAssignment output). The vendor relationship transitions from onboarding oversight to continuous monitoring with defined KRIs, review frequency, and escalation thresholds.
2. **NIST CSF 2.0 GV.SC-09**: Supplier performance debrief — conduct a lessons-learned review of the onboarding process. Document what worked well, what required remediation, and process improvement recommendations for future vendor onboardings.
3. **GDPR/CCPA**: Confirm all data processing activities are within contracted scope. Verify no unauthorized residual data is retained by the vendor beyond what is contractually permitted. Processing activities register reflects accurate current state.
4. **SEC 17a-4**: Engagement records must be closed and archived in a compliant retention system with tamper-evident storage. All onboarding artifacts (contract, assessments, approvals, evidence) must be indexed and retrievable for regulatory examination. Complete audit trail from intake through deployment must be preserved.

**Evidence Collection:**

- Vendor closure confirmation signed by both parties acknowledging successful onboarding completion
- Performance baseline scorecard with initial KRI values and targets
- Data handling confirmation letter from vendor attesting compliance with DPA obligations
- Complete engagement summary filed to the audit record (includes all artifacts from intake through deployment)
- Transition to monitoring cadence documented with assigned reviewer, schedule, and escalation path
- Lessons learned document from the onboarding process
- Updated third-party risk register reflecting steady-state risk tier and monitoring assignment
- Contract governance handoff to the ongoing vendor management team

**Data Points:** Onboarding completion date, total onboarding duration (days), onboarding cost, initial vendor performance score, assigned monitoring cadence (quarterly, semi-annual, annual per DMN output), next scheduled review date, vendor relationship manager for ongoing management, open action items (if any) with owners and due dates, process improvement recommendations count.
