/**
 * All 25 scenarios for comprehensive E2E process testing.
 * Covers every gateway permutation, pathway, and end event.
 */
const s05 = require('./05-existing-and-rejection');

module.exports = [
  // ── Core pathways (original 11) ─────────────────────────────
  require('./01-happy-path-buy'),           // S01: Full E2E buy, baseline security
  require('./02-deal-killer'),              // S02: SP1 deal killer (DMN)
  require('./03-multi-vendor-rfp'),         // S03: 3-vendor parallel MI + Mini RFP
  require('./04-build-path'),               // S04: Build pathway + PDLC
  s05.scenario5A,                           // S05a: FullMatch early exit
  s05.scenario5B,                           // S05b: Assessment rejection (SP3)
  require('./06-partial-match-exception'),  // S06: Partial match → exception
  require('./07-needs-guidance-withdrawn'), // S07: NeedsGuidance → withdrawn
  require('./08-conditional-approval'),     // S08: Conditional approval + verify
  require('./09-10vendor-competitive'),     // S09: 10-vendor MI stress test
  require('./10-governance-rejected'),      // S10: Governance committee rejection

  // ── Expanded coverage (14 new) ──────────────────────────────
  require('./11-triage-rejection'),          // S11: Triage rejection (earliest exit)
  require('./12-nda-redline-rejected'),      // S12: NDA redline rejection path
  require('./13-enable-pathway'),            // S13: Enable pathway (3rd option)
  require('./14-vendor-not-selected'),       // S14: Vendor scoring failure
  require('./15-contract-not-approved'),     // S15: Contract rejection (late stage)
  require('./16-final-approval-rejected'),   // S16: Final CIO rejection (latest failure)
  require('./17-sp2-committee-rejected'),    // S17: SP2 committee rejection
  require('./18-build-pdlc-test-failure'),   // S18: Build PDLC retry loop
  require('./19-poc-required'),              // S19: PoC required path
  require('./20-security-major-assessment'), // S20: Major security assessment
  require('./21-mini-rfp-deal-killed'),      // S21: Mini RFP deal killer
  require('./22-sp5-approval-rejected'),     // S22: SP5 committee rejection
  require('./23-nda-preapproved-fast'),      // S23: NDA pre-approved fast path
  require('./24-ai-governance-full'),        // S24: Full AI governance + all branches
];
