/**
 * Common step definitions — Background steps and shared assertions.
 */

const { Given, Then } = require('@cucumber/cucumber');
const { expect } = require('chai');

// --- Background steps ---

Given('the BPMN file {string} is loaded', async function (filename) {
  await this.loadBpmn(filename);
});

Given('the forms directory {string} is scanned', function (formsDirRelative) {
  this.scanForms(formsDirRelative);
});
