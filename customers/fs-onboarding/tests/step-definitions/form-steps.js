/**
 * Step definitions for form reference validation.
 */

const { Then } = require('@cucumber/cucumber');
const { expect } = require('chai');

Then('every formId in the BPMN matches a file named {string} in the forms directory', function (pattern) {
  const formRefs = this.parser.getAllFormIds();
  const errors = [];
  for (const ref of formRefs) {
    if (!this.formFiles.includes(ref.formId)) {
      errors.push(`Task "${ref.elementId}" references formId "${ref.formId}" but "${ref.formId}.form" not found in ${this.formsDir}`);
    }
  }
  expect(errors, errors.join('\n')).to.be.empty;
});

Then('every .form file in the forms directory is referenced by at least one user task', function () {
  const formRefs = this.parser.getAllFormIds();
  const referencedFormIds = new Set(formRefs.map(r => r.formId));
  const orphans = this.formFiles.filter(f => !referencedFormIds.has(f));
  expect(
    orphans,
    `Orphan form files (not referenced by any task): ${orphans.join(', ')}`
  ).to.be.empty;
});

Then('the form file {string} exists in the forms directory', function (filename) {
  const formId = filename.replace('.form', '');
  expect(
    this.formFiles.includes(formId),
    `Form file "${filename}" not found in ${this.formsDir}. Available: ${this.formFiles.join(', ')}`
  ).to.be.true;
});
