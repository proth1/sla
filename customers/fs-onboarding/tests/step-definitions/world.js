/**
 * Cucumber World — shared state across step definitions.
 *
 * Loads the BPMN parser and forms directory once per scenario via the
 * Background step, making parsed data available to all step definitions.
 */

const { setWorldConstructor } = require('@cucumber/cucumber');
const BpmnParser = require('../support/bpmn-parser');
const path = require('path');
const fs = require('fs');

class BpmnWorld {
  constructor() {
    this.parser = new BpmnParser();
    this.bpmnLoaded = false;
    this.formFiles = [];
    this.formsDir = '';
  }

  async loadBpmn(filename) {
    if (this.bpmnLoaded) return;
    const bpmnPath = path.resolve(__dirname, '../../processes', filename);
    if (!fs.existsSync(bpmnPath)) {
      throw new Error(`BPMN file not found: ${bpmnPath}`);
    }
    await this.parser.load(bpmnPath);
    this.bpmnLoaded = true;
  }

  scanForms(formsDirRelative) {
    this.formsDir = path.resolve(__dirname, '../../processes', formsDirRelative);
    if (!fs.existsSync(this.formsDir)) {
      throw new Error(`Forms directory not found: ${this.formsDir}`);
    }
    this.formFiles = fs.readdirSync(this.formsDir)
      .filter(f => f.endsWith('.form'))
      .map(f => f.replace('.form', ''));
  }
}

setWorldConstructor(BpmnWorld);
