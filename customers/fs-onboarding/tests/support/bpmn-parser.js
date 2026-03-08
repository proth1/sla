/**
 * BPMN Parser — Loads and indexes a BPMN 2.0 XML file using bpmn-moddle.
 *
 * Provides lookup methods for elements, flows, gateways, sub-processes,
 * forms, timers, and message flows used by the step definitions.
 *
 * Note: bpmn-moddle returns zeebe extension element $type values in
 * lowercase (e.g., "zeebe:formDefinition" not "zeebe:FormDefinition").
 * All comparisons use case-insensitive matching for extension elements.
 */

const BpmnModdle = require('bpmn-moddle');
const fs = require('fs');
const path = require('path');

/**
 * Case-insensitive extension element type comparison.
 */
function extTypeEquals(ext, typeName) {
  return ext.$type && ext.$type.toLowerCase() === typeName.toLowerCase();
}

class BpmnParser {
  constructor() {
    this.moddle = new BpmnModdle();
    this.definitions = null;
    this.elementIndex = new Map();   // id -> element
    this.processIndex = new Map();   // processId -> process element
    this.subProcessIndex = new Map(); // spId -> subProcess element
    this.flowIndex = new Map();      // flowId -> sequenceFlow element
    this.messageFlowIndex = new Map(); // flowId -> messageFlow element
    this.collaboration = null;
    this.rawXml = '';
    this.diagrams = [];
  }

  /**
   * Load and parse a BPMN file. Call this before any lookups.
   */
  async load(filePath) {
    this.rawXml = fs.readFileSync(filePath, 'utf-8');
    const { rootElement } = await this.moddle.fromXML(this.rawXml);
    this.definitions = rootElement;

    // Index collaboration
    if (this.definitions.rootElements) {
      for (const el of this.definitions.rootElements) {
        if (el.$type === 'bpmn:Collaboration') {
          this.collaboration = el;
        }
        if (el.$type === 'bpmn:Process') {
          this.processIndex.set(el.id, el);
          this._indexElements(el, null);
        }
      }
    }

    // Index message flows from collaboration (do this after processes)
    if (this.collaboration && this.collaboration.messageFlows) {
      for (const mf of this.collaboration.messageFlows) {
        this.messageFlowIndex.set(mf.id, mf);
        this.elementIndex.set(mf.id, mf);
      }
    }

    // Index diagrams
    if (this.definitions.diagrams) {
      this.diagrams = this.definitions.diagrams;
    }

    return this;
  }

  /**
   * Recursively index all elements within a process or sub-process.
   */
  _indexElements(container, parentSubProcess) {
    const elements = container.flowElements || [];
    for (const el of elements) {
      this.elementIndex.set(el.id, el);

      if (el.$type === 'bpmn:SequenceFlow') {
        this.flowIndex.set(el.id, el);
      }

      if (el.$type === 'bpmn:SubProcess') {
        this.subProcessIndex.set(el.id, el);
        this._indexElements(el, el);
      }

      // Index boundary events
      if (el.boundaryEventRefs) {
        for (const be of el.boundaryEventRefs) {
          this.elementIndex.set(be.id, be);
        }
      }
    }

    // Handle boundary events attached to elements in the container
    if (container.flowElements) {
      for (const el of container.flowElements) {
        if (el.$type === 'bpmn:BoundaryEvent') {
          this.elementIndex.set(el.id, el);
        }
      }
    }
  }

  getElementById(id) {
    return this.elementIndex.get(id);
  }

  getProcess(processId) {
    return this.processIndex.get(processId);
  }

  getSubProcess(spId) {
    return this.subProcessIndex.get(spId);
  }

  getElementsByType(type) {
    const results = [];
    for (const [, el] of this.elementIndex) {
      if (el.$type === type) {
        results.push(el);
      }
    }
    return results;
  }

  getChildElementsByType(container, type) {
    const results = [];
    const elements = container.flowElements || [];
    for (const el of elements) {
      if (el.$type === type) {
        results.push(el);
      }
    }
    return results;
  }

  getTopLevelElements(processId, type) {
    const process = this.processIndex.get(processId);
    if (!process) return [];
    const results = [];
    const elements = process.flowElements || [];
    for (const el of elements) {
      if (el.$type === type) {
        results.push(el);
      }
    }
    return results;
  }

  getAllSequenceFlows() {
    return Array.from(this.flowIndex.values());
  }

  getAllMessageFlows() {
    if (!this.collaboration || !this.collaboration.messageFlows) return [];
    return this.collaboration.messageFlows;
  }

  getCollaboration() {
    return this.collaboration;
  }

  getDiagrams() {
    return this.diagrams;
  }

  isElementInProcess(elementId, processId) {
    const process = this.processIndex.get(processId);
    if (!process) return false;
    return this._containsElement(process, elementId);
  }

  _containsElement(container, elementId) {
    const elements = container.flowElements || [];
    for (const el of elements) {
      if (el.id === elementId) return true;
      if (el.$type === 'bpmn:SubProcess' && this._containsElement(el, elementId)) {
        return true;
      }
    }
    return false;
  }

  pathExists(elementIds) {
    for (let i = 0; i < elementIds.length - 1; i++) {
      const fromId = elementIds[i];
      const toId = elementIds[i + 1];
      if (!this._flowExistsBetween(fromId, toId)) {
        return { valid: false, from: fromId, to: toId };
      }
    }
    return { valid: true };
  }

  _flowExistsBetween(fromId, toId) {
    for (const [, flow] of this.flowIndex) {
      const sourceId = typeof flow.sourceRef === 'string' ? flow.sourceRef : flow.sourceRef?.id;
      const targetId = typeof flow.targetRef === 'string' ? flow.targetRef : flow.targetRef?.id;
      if (sourceId === fromId && targetId === toId) {
        return true;
      }
    }
    return false;
  }

  isReachable(fromId, toId) {
    const visited = new Set();
    const queue = [fromId];
    while (queue.length > 0) {
      const current = queue.shift();
      if (current === toId) return true;
      if (visited.has(current)) continue;
      visited.add(current);

      for (const [, flow] of this.flowIndex) {
        const sourceId = typeof flow.sourceRef === 'string' ? flow.sourceRef : flow.sourceRef?.id;
        const targetId = typeof flow.targetRef === 'string' ? flow.targetRef : flow.targetRef?.id;
        if (sourceId === current && !visited.has(targetId)) {
          queue.push(targetId);
        }
      }
    }
    return false;
  }

  getConditionExpression(flowId) {
    const flow = this.flowIndex.get(flowId);
    if (!flow || !flow.conditionExpression) return null;
    return flow.conditionExpression.body || flow.conditionExpression.text || null;
  }

  getAllConditionExpressions() {
    const results = [];
    for (const [id, flow] of this.flowIndex) {
      if (flow.conditionExpression) {
        const body = flow.conditionExpression.body || flow.conditionExpression.text || '';
        results.push({ flowId: id, expression: body });
      }
    }
    return results;
  }

  /**
   * Get all formIds referenced by zeebe:formDefinition.
   * bpmn-moddle returns $type as "zeebe:formDefinition" (lowercase).
   */
  getAllFormIds() {
    const formIds = [];
    for (const [, el] of this.elementIndex) {
      if (el.extensionElements) {
        for (const ext of el.extensionElements.values || []) {
          if (extTypeEquals(ext, 'zeebe:FormDefinition') && ext.formId) {
            formIds.push({ elementId: el.id, formId: ext.formId });
          }
        }
      }
    }
    return formIds;
  }

  /**
   * Get the candidateGroups from a user task's zeebe:assignmentDefinition.
   */
  getCandidateGroups(taskId) {
    const el = this.elementIndex.get(taskId);
    if (!el || !el.extensionElements) return null;
    for (const ext of el.extensionElements.values || []) {
      if (extTypeEquals(ext, 'zeebe:AssignmentDefinition') && ext.candidateGroups) {
        return ext.candidateGroups;
      }
    }
    return null;
  }

  /**
   * Get zeebe:taskDefinition type from a service task.
   */
  getTaskDefinitionType(taskId) {
    const el = this.elementIndex.get(taskId);
    if (!el || !el.extensionElements) return null;
    for (const ext of el.extensionElements.values || []) {
      if (extTypeEquals(ext, 'zeebe:TaskDefinition') && ext.type) {
        return ext.type;
      }
    }
    return null;
  }

  getTimerDuration(eventId) {
    const el = this.elementIndex.get(eventId);
    if (!el || !el.eventDefinitions) return null;
    for (const ed of el.eventDefinitions) {
      if (ed.$type === 'bpmn:TimerEventDefinition') {
        if (ed.timeDuration) {
          return ed.timeDuration.body || ed.timeDuration.text || null;
        }
      }
    }
    return null;
  }

  hasZeebeNamespace() {
    return this.rawXml.includes('http://camunda.org/schema/zeebe/1.0');
  }

  getDiagramForElement(elementId) {
    for (const diagram of this.diagrams) {
      if (diagram.plane && diagram.plane.bpmnElement) {
        const planeRef = typeof diagram.plane.bpmnElement === 'string'
          ? diagram.plane.bpmnElement
          : diagram.plane.bpmnElement.id;
        if (planeRef === elementId) {
          return diagram;
        }
      }
    }
    return null;
  }

  getAllShapeIds() {
    const regex = /BPMNShape\s+id="([^"]+)"/g;
    const ids = [];
    let match;
    while ((match = regex.exec(this.rawXml)) !== null) {
      ids.push(match[1]);
    }
    return ids;
  }

  isSubProcessCollapsedInDiagram(spId, diagramId) {
    const regex = new RegExp(
      `BPMNShape[^>]*bpmnElement="${spId}"[^>]*isExpanded="false"`,
      's'
    );
    return regex.test(this.rawXml);
  }
}

module.exports = BpmnParser;
