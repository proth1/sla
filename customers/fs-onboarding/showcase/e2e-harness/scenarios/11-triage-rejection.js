/**
 * Scenario 11: Triage Rejection — Duplicate Request
 * Process killed at SP1 triage: continueWorkingRequest=false → End_Rejected
 * Tests: earliest possible rejection (after Describe & Screen)
 */
const defaults = require('../fixtures/form-defaults');

module.exports = {
  id: 'S11',
  name: 'Triage Rejection — Duplicate Request',
  description: 'Triage analyst identifies duplicate request. Process rejected immediately after screening.',
  expectedOutcome: 'Request Not Approved',
  vendors: ['Duplicate Vendor'],
  startVars: { ...defaults, requestDescription: 'Duplicate request — same system already under review in SLA-87.', vendorName: 'Duplicate Vendor', continueWorkingRequest: false, existingSolutionDisposition: 'NoMatch' },
  baseVars: { ...defaults, continueWorkingRequest: false, existingSolutionDisposition: 'NoMatch' },
  taskOverrides: {},
};
