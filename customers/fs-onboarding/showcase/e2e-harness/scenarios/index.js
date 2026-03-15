/**
 * All 10 scenarios for the E2E test harness.
 */
const s05 = require('./05-existing-and-rejection');

module.exports = [
  require('./01-happy-path-buy'),
  require('./02-deal-killer'),
  require('./03-multi-vendor-rfp'),
  require('./04-build-path'),
  s05.scenario5A,
  s05.scenario5B,
  require('./06-partial-match-exception'),
  require('./07-needs-guidance-withdrawn'),
  require('./08-conditional-approval'),
  require('./09-10vendor-competitive'),
  require('./10-governance-rejected'),
];
