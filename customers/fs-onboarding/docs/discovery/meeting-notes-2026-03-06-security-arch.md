# Meeting Notes: Software Onboarding Process - Security Architecture Review

**Date**: 2026-03-06 (Meeting 2 of 4)
**Participants**: Security Architect, Consulting Team
**Focus**: Security review process, documentation requirements, integration challenges

---

## Key Findings

### Process Entry Points

- START process should identify where teams engage
- Third-party risk management initiates via Risk Assessment Evaluation (RAE)
- Team uses external security assessment tools
- Reviews external indicators to judge vendor security posture
- Typically occurs **after purchase decision is made**
- Focus on vendor purchase scenarios only (not internal builds)

### NDA Requirements (Critical Process Point)

- Only one initial vendor discussion before detailed engagement
- **NDA should be first step** after initial discussion
- Disagreement exists on NDA timing across organization
- Legal and security teams align on early NDA requirement
- Quote: "If people tell you otherwise, it'd be interesting to know... you'll find difference of opinion"

### Security Review Process Flow

1. NDA execution
2. RAE process initiation
3. Enterprise architect assignment
4. Architecture intake form completion
5. Security intake form completion

**Key Issue**: "Nothing directly points folks to intake forms... as soon as somebody hears about it, they're like 'oh, fill out our intake'"

### DART Team Formation Issues

- Security architect "suddenly appears on DART emails"
- Unclear how teams are formed
- No formal notification process
- Multiple intake forms discovered ad hoc

### SDLC Documentation Requirements

| Document | Path | When Required |
|----------|------|---------------|
| High Level Design (HLD) | Both paths | Always first |
| Platform Solution Specification (PSS) | Vendor path | SaaS/vendor solutions |
| System Design Document (SDD) | Internal path | Internal builds |

- SaaS platforms require **full documentation**
- Locally installed software receives less scrutiny
- Integration requirements drive documentation needs

### Major Pain Points

#### Resource Constraints
- "I need three of me right now" (specifically for AI reviews)
- Company growing rapidly, request volume increasing continuously
- Current process cannot scale

#### Multiple Vendor Contact Points (AI-Specific)
- Vendors contacted **3 times** for AI questions:
  1. Technology risk management team
  2. Cybersecurity team
  3. Third-party risk management team
- Creates redundancy and vendor frustration
- Teams discussing consolidation

#### Lack of Automation
- Zero automation in process
- All routing manual
- No workflow integration
- Dependency on individual knowledge
- Quote: "People don't know how to do this here... took 6 months to get anything done in ServiceNow at last company, just as bad if not worse here"

#### Prioritization
- "Whoever screams loudest" gets priority
- EVP support pushes other reviews down
- No SLA enforcement possible without process fixes
- Quote: "If you set up repercussion for SLA not achieved, what's the solution? ...There's no real effective prioritization"

#### Tool Proliferation
- Multiple security platforms with overlapping capabilities
- Each addresses specific control requirements
- Creates appearance of redundancy but actually addresses different security needs

### Process Bottlenecks

| Bottleneck | Impact |
|------------|--------|
| Legal — MSA and NDA delays | Critical |
| Security reviews — queue-dependent | High |
| Vendor information gathering | High |
| Meeting scheduling challenges | High |
| Competing review priorities | High |

### Implementation Reality

- API gateway purchased over a year ago, still not fully implemented
- Complex implementations require: multiple team coordination, development workflow changes, migration planning, extended timelines
- "Buying the thing is easy, it's implementing it that's not easy"

### Risk-Based Categories for Faster Processing

| Category | Acceleration Opportunity |
|----------|------------------------|
| Local software installation | Lower scrutiny |
| Platform-based solutions | Full documentation |
| Hybrid implementations | Case-by-case |
| Previously approved domains | Fast-track |
| Updates to existing platforms | Streamlined |
| Module additions to approved systems | Streamlined |

### Cultural/Organizational Challenges

- **Hiring gap**: "Hire people from big companies with systems in place for years... they come here, we need them to build it. We hire people with experience doing that with no concept how to build"
- **Technical debt cycle**: Can't improve due to lack of resources → buy tools to help → need resources to support new tools → half-implemented solutions → cycle continues
- **Change resistance**: Management must value enterprise-level solutions; individual influence limited

### Technology Context

- Third-party risk system available
- No GRC module in workflow platform
- Multiple disconnected systems
- New AI-specific capabilities emerging
- Needs: single system of record, end-to-end visibility, automated routing, consolidated reporting

---

## Mapping to BPMN Model

| Finding | Maps To | Gap Reference |
|---------|---------|---------------|
| NDA as first step after initial discussion | SP1 intake → SP3 evaluation gate | NEW: NDA gate before detailed evaluation |
| DART formation issues | SP2/SP3 team assignment | GAP-7 (Status Visibility) |
| SDLC documentation requirements (HLD/PSS/SDD) | SP3 evaluation, SP4 build path | Existing SP3 parallel branches |
| 3x vendor contact for AI | SP3 parallel fan-out consolidation | GAP-6 (AI Fast-Track) |
| Risk-based assessment categories | OB-DMN-1/OB-DMN-2 | GAP-12 (Security Baseline) |
| Zero automation | Cross-cutting | Platform implementation need |
| Tool proliferation | Cross-cutting integration | GAP-10 (Workload Dashboard) |
| "Whoever screams loudest" prioritization | SP2 routing | GAP-2 (Prioritization) |
| Post-purchase implementation complexity | SP5 UAT & Go-Live | Existing SP5 flow |

---

## Action Items

- [ ] Consulting team to use organizational laptops for system access
- [ ] Review security intake forms
- [ ] Map DART team formation process
- [ ] Document AI governance integration points
- [ ] Assess platform overlap and rationalization opportunities
