#!/usr/bin/env node
/**
 * rebuild-onboarding-bpmn.js
 *
 * Reads the original monolithic Onboarding BPMN and rewrites it as a
 * 3-level collapsed hierarchy:
 *
 *   Level 0 — Main Canvas: 8 collapsed phase SPs + gateways + event SPs
 *   Level 1 — Phase Internals: sub-phase SPs (separate BPMNDiagram per phase)
 *   Level 2 — Sub-Phase Internals: individual tasks (separate BPMNDiagram)
 *
 * The script is IDEMPOTENT — it reads from the original source backup
 * and writes the generated output.
 *
 * Usage: node scripts/rebuild-onboarding-bpmn.js [--source path]
 */
import { readFileSync, writeFileSync, existsSync, copyFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT = resolve(__dirname, '../processes/Onboarding-only/Enterprise_Intake_to_Retirement_Camunda7.bpmn');
const BACKUP = OUTPUT + '.original';

// On first run, back up the original. On re-runs, read from backup.
if (!existsSync(BACKUP)) {
  copyFileSync(OUTPUT, BACKUP);
  console.log(`Backed up original to ${BACKUP}`);
}
const xml = readFileSync(BACKUP, 'utf8');

// ──────────────────────────────────────────────────────────────────────────────
// 1. XML EXTRACTION HELPERS
// ──────────────────────────────────────────────────────────────────────────────

function extractSubProcess(id) {
  const openPattern = new RegExp(`<bpmn:subProcess\\s+id="${id}"[^>]*>`, 's');
  const openMatch = xml.match(openPattern);
  if (!openMatch) return null;
  const startIdx = openMatch.index;
  let depth = 1;
  let idx = startIdx + openMatch[0].length;
  while (depth > 0 && idx < xml.length) {
    const nextOpen = xml.indexOf('<bpmn:subProcess', idx);
    const nextClose = xml.indexOf('</bpmn:subProcess>', idx);
    if (nextClose === -1) break;
    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth++;
      idx = nextOpen + 16;
    } else {
      depth--;
      if (depth === 0) return xml.substring(startIdx, nextClose + '</bpmn:subProcess>'.length);
      idx = nextClose + '</bpmn:subProcess>'.length;
    }
  }
  return null;
}

function extractBoundaryTimers() {
  const timers = [];
  const re = /<bpmn:boundaryEvent\s+id="([^"]+)"[^>]*attachedToRef="([^"]+)"[^]*?<\/bpmn:boundaryEvent>/g;
  let m;
  while ((m = re.exec(xml)) !== null) {
    timers.push({ id: m[1], attachedTo: m[2], xml: m[0] });
  }
  return timers;
}

function extractElementsFromBlock(block) {
  const elements = [];
  const re = /<bpmn:(startEvent|endEvent|userTask|serviceTask|businessRuleTask|sendTask|task|exclusiveGateway|parallelGateway|inclusiveGateway)\s+id="([^"]+)"/g;
  let m;
  while ((m = re.exec(block)) !== null) {
    elements.push({ type: m[1], id: m[2] });
  }
  return elements;
}

function extractFlowsFromBlock(block) {
  const flows = [];
  const re = /<bpmn:sequenceFlow\s+id="([^"]+)"\s+sourceRef="([^"]+)"\s+targetRef="([^"]+)"/g;
  let m;
  while ((m = re.exec(block)) !== null) {
    flows.push({ id: m[1], source: m[2], target: m[3] });
  }
  return flows;
}

// ──────────────────────────────────────────────────────────────────────────────
// 2. GATHER SOURCE DATA
// ──────────────────────────────────────────────────────────────────────────────

const allBoundaryTimers = extractBoundaryTimers();
const timersByAttachedTo = {};
for (const t of allBoundaryTimers) {
  if (!timersByAttachedTo[t.attachedTo]) timersByAttachedTo[t.attachedTo] = [];
  timersByAttachedTo[t.attachedTo].push(t);
}

const subProcessBlocks = {};
const allSPIds = [
  'SP_1_1', 'SP_1_2', 'SP_1_3',
  'SP_2_1', 'SP_2_2', 'SP_2_3', 'SP_2_4', 'SP_2_5',
  'SP_3_1', 'SP_3_2', 'SP_3_3', 'SP_3_4', 'SP_3_5',
];
for (const spId of allSPIds) {
  const block = extractSubProcess(spId);
  if (block) subProcessBlocks[spId] = block;
}

const EVENT_SPS = ['EvSP_SLA', 'EvSP_Vuln', 'EvSP_Inc', 'EvSP_Reg', 'EvSP_CI', 'EvSP_SC'];
const eventSPBlocks = {};
for (const espId of EVENT_SPS) {
  const block = extractSubProcess(espId);
  if (block) eventSPBlocks[espId] = block;
}

// ──────────────────────────────────────────────────────────────────────────────
// 3. PHASE DEFINITIONS
// ──────────────────────────────────────────────────────────────────────────────

const PHASES = [
  { id: 'SP_Phase1', name: 'Phase 1: Initiation &amp; Intake', doc: 'SLA: 1-2 days | Request capture, risk triage, business case', sla: 'P2D', subPhases: ['SP_1_1', 'SP_1_2', 'SP_1_3'], phase: '1', slaHours: '48' },
  { id: 'SP_Phase2', name: 'Phase 2: Assessment &amp; Due Diligence', doc: 'SLA: 5-10 days | Parallel assessments + convergence', sla: 'P10D', subPhases: ['SP_2_1', 'SP_2_2', 'SP_2_3', 'SP_2_4', 'SP_2_5'], phase: '2', slaHours: '240' },
  { id: 'SP_Phase3', name: 'Phase 3: Provisioning &amp; Onboarding', doc: 'SLA: 5-15 days | Parallel provisioning + kickoff', sla: 'P15D', subPhases: ['SP_3_1', 'SP_3_2', 'SP_3_3', 'SP_3_4', 'SP_3_5'], phase: '3', slaHours: '360' },
  { id: 'SP_Phase4', name: 'Phase 4: Architecture &amp; Design', doc: 'SLA: 10-15d | ARB gate', sla: 'P15D', subPhases: [], phase: '4', slaHours: '360' },
  { id: 'SP_Phase5', name: 'Phase 5: Development &amp; Build', doc: 'Sprint-based | 9 AI agent roles', sla: 'P30D', subPhases: [], phase: '5', slaHours: '720' },
  { id: 'SP_Phase6', name: 'Phase 6: Testing &amp; Validation', doc: 'SLA: 5-15d | AI-augmented', sla: 'P15D', subPhases: [], phase: '6', slaHours: '360' },
  { id: 'SP_Phase7', name: 'Phase 7: Deployment &amp; Release', doc: 'SLA: 2-5d | DMN-DT-009', sla: 'P5D', subPhases: [], phase: '7', slaHours: '120' },
  { id: 'SP_Phase8', name: 'Phase 8: Operations &amp; Retirement', doc: 'Ongoing | 6-phase retirement', sla: 'P365D', subPhases: [], phase: '8', slaHours: '8760' },
];

// ──────────────────────────────────────────────────────────────────────────────
// 4. BUILD OUTPUT XML
// ──────────────────────────────────────────────────────────────────────────────

let out = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions
  xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:camunda="http://camunda.org/schema/1.0/bpmn"
  id="Definitions_IntakeToRetirement"
  targetNamespace="http://bpmn.io/schema/bpmn"
  exporter="Camunda Modeler"
  exporterVersion="5.25.0">

  <bpmn:message id="Msg_IntakeRequest" name="Message_IntakeRequest" />
  <bpmn:message id="Msg_VendorQuestionnaire" name="Message_VendorQuestionnaireResponse" />
  <bpmn:message id="Msg_EnvironmentReady" name="Message_EnvironmentReady" />
  <bpmn:message id="Msg_GateDecision" name="Message_GateDecisionNotification" />
  <bpmn:message id="Msg_RegulatoryChange" name="Message_RegulatoryChange" />
  <bpmn:message id="Msg_ValidationReturn" name="Message_ValidationReturn" />
  <bpmn:signal id="Signal_CriticalVuln" name="Signal_CriticalVulnerabilityDiscovered" />
  <bpmn:signal id="Signal_Incident" name="Signal_SecurityOperationalIncident" />
  <bpmn:signal id="Signal_SLABreach" name="Signal_SLABreachEscalation" />

  <bpmn:collaboration id="Collaboration_IntakeToRetirement">
    <bpmn:documentation>Enterprise Software Intake to Retirement Lifecycle — Camunda 7 Platform Compatible.
123 tasks | 24 sub-processes | 13 gateways | 29 SLA timers | 9 DMN bindings | 6 event sub-processes.
3-level collapsed hierarchy: Phase → Sub-Phase → Tasks.</bpmn:documentation>
    <bpmn:participant id="Pool_Governance" name="Governance Pool (Enterprise Governance Board)" processRef="Process_Governance" />
    <bpmn:participant id="Pool_Requestor" name="Requestor Pool (Business Units)" processRef="Process_Requestor" />
    <bpmn:participant id="Pool_Technical" name="Technical Pool (Architecture / Security / Dev)" processRef="Process_Technical" />
    <bpmn:participant id="Pool_Vendor" name="Vendor Pool (Third-Party Vendors)" processRef="Process_Vendor" />
    <bpmn:participant id="Pool_Operations" name="Operations Pool (IT Ops / SRE)" processRef="Process_Operations" />
    <bpmn:participant id="Pool_AI" name="AI Platform Pool (AI Agents &amp; DMN Engine)" processRef="Process_AI" />
    <bpmn:messageFlow id="MF_001" sourceRef="SP_Phase1" targetRef="Pool_Requestor" name="Intake Notification" />
    <bpmn:messageFlow id="MF_002" sourceRef="SP_Phase1" targetRef="Pool_AI" name="AI Classification" />
    <bpmn:messageFlow id="MF_003" sourceRef="SP_Phase2" targetRef="Pool_Vendor" name="Vendor Questionnaire" />
    <bpmn:messageFlow id="MF_004" sourceRef="SP_Phase3" targetRef="Pool_Operations" name="Environment Request" />
    <bpmn:messageFlow id="MF_005" sourceRef="SP_Phase3" targetRef="Pool_Technical" name="Toolchain Setup" />
  </bpmn:collaboration>

`;

// ──────────────────────────────────────────────────────────────────────────────
// MAIN PROCESS
// ──────────────────────────────────────────────────────────────────────────────

out += `  <bpmn:process id="Process_Governance" name="Enterprise Software Intake to Retirement" isExecutable="true" camunda:historyTimeToLive="180" camunda:versionTag="1.0.0">

    <bpmn:dataStoreReference id="DS_KB001" name="KB-001: Data Classification Schema" />
    <bpmn:dataStoreReference id="DS_KB002" name="KB-002: Technology Radar" />
    <bpmn:dataStoreReference id="DS_KB003" name="KB-003: Regulatory Registry" />
    <bpmn:dataStoreReference id="DS_KB004" name="KB-004: Reference Architecture" />
    <bpmn:dataStoreReference id="DS_KB005" name="KB-005: Vendor Risk Intelligence" />
    <bpmn:dataStoreReference id="DS_KB006" name="KB-006: Security Controls Catalog" />
    <bpmn:dataStoreReference id="DS_KB007" name="KB-007: Historical Initiatives" />
    <bpmn:dataStoreReference id="DS_KB008" name="KB-008: AI Model Registry" />
    <bpmn:dataStoreReference id="DS_KB009" name="KB-009: SLA Baselines" />
    <bpmn:dataStoreReference id="DS_KB010" name="KB-010: Compliance-as-Code" />

    <bpmn:startEvent id="StartEvent_Intake" name="New Software&#10;Initiative Request">
      <bpmn:outgoing>Flow_Start_Ph1</bpmn:outgoing>
      <bpmn:messageEventDefinition id="MsgEvtDef_Intake" messageRef="Msg_IntakeRequest" />
    </bpmn:startEvent>

`;

// Phase sub-processes
for (const phase of PHASES) {
  out += generatePhaseSubProcess(phase);
}

// Phase SLA boundary timers + escalation end events
for (const phase of PHASES) {
  out += `    <bpmn:boundaryEvent id="Tmr_${phase.id}" name="SLA Breach" cancelActivity="false" attachedToRef="${phase.id}">
      <bpmn:outgoing>Flow_Tmr_${phase.id}</bpmn:outgoing>
      <bpmn:extensionElements>
        <camunda:executionListener delegateExpression="\${slaBreachDelegate}" event="start" />
      </bpmn:extensionElements>
      <bpmn:timerEventDefinition id="TD_Tmr_${phase.id}">
        <bpmn:timeDuration xsi:type="bpmn:tFormalExpression">${phase.sla}</bpmn:timeDuration>
      </bpmn:timerEventDefinition>
    </bpmn:boundaryEvent>
    <bpmn:endEvent id="Esc_${phase.id}" name="SLA&#10;Escalation">
      <bpmn:incoming>Flow_Tmr_${phase.id}</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_Tmr_${phase.id}" sourceRef="Tmr_${phase.id}" targetRef="Esc_${phase.id}" />
`;
}

// Inter-phase gateways
out += `
    <bpmn:exclusiveGateway id="GW_P1_Exit" name="Initiation Gate" default="Flow_GW1_Ph2">
      <bpmn:incoming>Flow_Ph1_GW1</bpmn:incoming>
      <bpmn:outgoing>Flow_GW1_Ph2</bpmn:outgoing>
      <bpmn:outgoing>Flow_GW1_Deferred</bpmn:outgoing>
      <bpmn:outgoing>Flow_GW1_Rejected</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:exclusiveGateway id="GW_P2_Exit" name="Phase 2 Gate" default="Flow_GW2_Ph3">
      <bpmn:incoming>Flow_Ph2_GW2</bpmn:incoming>
      <bpmn:outgoing>Flow_GW2_Ph3</bpmn:outgoing>
      <bpmn:outgoing>Flow_GW2_Remediate</bpmn:outgoing>
      <bpmn:outgoing>Flow_GW2_Rejected</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:exclusiveGateway id="GW_P3_Exit" name="Phase 3 Gate" default="Flow_GW3_Ph4">
      <bpmn:incoming>Flow_Ph3_GW3</bpmn:incoming>
      <bpmn:outgoing>Flow_GW3_Ph4</bpmn:outgoing>
      <bpmn:outgoing>Flow_GW3_Rework</bpmn:outgoing>
      <bpmn:outgoing>Flow_GW3_Escalate</bpmn:outgoing>
    </bpmn:exclusiveGateway>

    <bpmn:endEvent id="End_Deferred" name="Deferred&#10;to Backlog" />
    <bpmn:endEvent id="End_Rejected" name="Rejected&#10;&amp; Archived" />
    <bpmn:endEvent id="End_Retired" name="Fully&#10;Decommissioned" />

`;

// Sequence flows
out += `    <bpmn:sequenceFlow id="Flow_Start_Ph1" sourceRef="StartEvent_Intake" targetRef="SP_Phase1" />
    <bpmn:sequenceFlow id="Flow_Ph1_GW1" sourceRef="SP_Phase1" targetRef="GW_P1_Exit" />
    <bpmn:sequenceFlow id="Flow_GW1_Ph2" name="Approved" sourceRef="GW_P1_Exit" targetRef="SP_Phase2" />
    <bpmn:sequenceFlow id="Flow_GW1_Deferred" name="Deferred" sourceRef="GW_P1_Exit" targetRef="End_Deferred">
      <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">#{gateDecision=="Defer"}</bpmn:conditionExpression>
    </bpmn:sequenceFlow>
    <bpmn:sequenceFlow id="Flow_GW1_Rejected" name="Rejected" sourceRef="GW_P1_Exit" targetRef="End_Rejected">
      <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">#{gateDecision=="Reject"}</bpmn:conditionExpression>
    </bpmn:sequenceFlow>
    <bpmn:sequenceFlow id="Flow_Ph2_GW2" sourceRef="SP_Phase2" targetRef="GW_P2_Exit" />
    <bpmn:sequenceFlow id="Flow_GW2_Ph3" name="Approved" sourceRef="GW_P2_Exit" targetRef="SP_Phase3" />
    <bpmn:sequenceFlow id="Flow_GW2_Remediate" name="Remediate" sourceRef="GW_P2_Exit" targetRef="SP_Phase2">
      <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">#{gateDecision=="Remediate"}</bpmn:conditionExpression>
    </bpmn:sequenceFlow>
    <bpmn:sequenceFlow id="Flow_GW2_Rejected" name="Rejected" sourceRef="GW_P2_Exit" targetRef="End_Rejected">
      <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">#{gateDecision=="Reject"}</bpmn:conditionExpression>
    </bpmn:sequenceFlow>
    <bpmn:sequenceFlow id="Flow_Ph3_GW3" sourceRef="SP_Phase3" targetRef="GW_P3_Exit" />
    <bpmn:sequenceFlow id="Flow_GW3_Ph4" name="All Met" sourceRef="GW_P3_Exit" targetRef="SP_Phase4" />
    <bpmn:sequenceFlow id="Flow_GW3_Rework" name="Outstanding" sourceRef="GW_P3_Exit" targetRef="SP_Phase3">
      <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">#{gateDecision=="Remediate"}</bpmn:conditionExpression>
    </bpmn:sequenceFlow>
    <bpmn:sequenceFlow id="Flow_GW3_Escalate" name="Critical" sourceRef="GW_P3_Exit" targetRef="SP_Phase2">
      <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">#{gateDecision=="Escalate"}</bpmn:conditionExpression>
    </bpmn:sequenceFlow>
    <bpmn:sequenceFlow id="Flow_Ph4_Ph5" sourceRef="SP_Phase4" targetRef="SP_Phase5" />
    <bpmn:sequenceFlow id="Flow_Ph5_Ph6" sourceRef="SP_Phase5" targetRef="SP_Phase6" />
    <bpmn:sequenceFlow id="Flow_Ph6_Ph7" sourceRef="SP_Phase6" targetRef="SP_Phase7" />
    <bpmn:sequenceFlow id="Flow_Ph7_Ph8" sourceRef="SP_Phase7" targetRef="SP_Phase8" />
    <bpmn:sequenceFlow id="Flow_Ph8_End" sourceRef="SP_Phase8" targetRef="End_Retired" />
`;

// Event sub-processes
for (const espId of EVENT_SPS) {
  if (eventSPBlocks[espId]) {
    out += `\n    ${eventSPBlocks[espId]}\n`;
  }
}

out += `
  </bpmn:process>

  <bpmn:process id="Process_Requestor" name="Requestor" isExecutable="false" camunda:historyTimeToLive="180" />
  <bpmn:process id="Process_Technical" name="Technical" isExecutable="false" camunda:historyTimeToLive="180" />
  <bpmn:process id="Process_Vendor" name="Vendor" isExecutable="false" camunda:historyTimeToLive="180" />
  <bpmn:process id="Process_Operations" name="Operations" isExecutable="false" camunda:historyTimeToLive="180" />
  <bpmn:process id="Process_AI" name="AI Platform" isExecutable="false" camunda:historyTimeToLive="180" />

`;

// ──────────────────────────────────────────────────────────────────────────────
// 5. DI — LEVEL 0: MAIN CANVAS
// ──────────────────────────────────────────────────────────────────────────────

// Layout constants
const GOV_POOL_W = 2600;
const GOV_POOL_H = 460;
const EXT_POOL_H = 40;
const POOL_GAP = 20;
const PH_Y = 60;   // Phase row Y inside governance pool
const PH_W = 100;
const PH_H = 80;

// Phase X positions — generous spacing: 3 gated phases + 5 sequential
function phX(i) {
  // Phases 0-2 need room for gateways between them
  // Phase 0 starts at x=220
  const positions = [220, 480, 740, 980, 1150, 1320, 1490, 1660];
  return positions[i];
}

const GW_W = 50, GW_H = 50;
const EVT_W = 36, EVT_H = 36;

out += `  <bpmndi:BPMNDiagram id="BPMNDiagram_Main">
    <bpmndi:BPMNPlane id="BPMNPlane_Main" bpmnElement="Collaboration_IntakeToRetirement">
`;

// Governance pool
out += shape('Pool_Governance', 150, 0, GOV_POOL_W, GOV_POOL_H, true);

// External pools (collapsed, below governance)
let extPoolY = GOV_POOL_H + POOL_GAP;
const extPools = [
  ['Pool_Requestor', 'Requestor Pool'],
  ['Pool_Technical', 'Technical Pool'],
  ['Pool_Vendor', 'Vendor Pool'],
  ['Pool_Operations', 'Operations Pool'],
  ['Pool_AI', 'AI Platform Pool'],
];
for (const [id] of extPools) {
  out += shape(id, 150, extPoolY, GOV_POOL_W, EXT_POOL_H, true);
  extPoolY += EXT_POOL_H + 8;
}

// Start event
out += shape('StartEvent_Intake', 170, PH_Y + 22, EVT_W, EVT_H);

// Phase SPs (collapsed)
for (let i = 0; i < 8; i++) {
  out += shape(PHASES[i].id, phX(i), PH_Y, PH_W, PH_H, false, false);
}

// SLA boundary timers (attached bottom-right of each phase SP)
for (let i = 0; i < 8; i++) {
  const tmrX = phX(i) + PH_W - 18;
  const tmrY = PH_Y + PH_H - 18;
  out += shape(`Tmr_${PHASES[i].id}`, tmrX, tmrY, EVT_W, EVT_H);
  // Escalation end event below timer
  const escX = tmrX;
  const escY = tmrY + 50;
  out += shape(`Esc_${PHASES[i].id}`, escX, escY, EVT_W, EVT_H);
  out += edge(`Flow_Tmr_${PHASES[i].id}`, tmrX + 18, tmrY + EVT_H, escX + 18, escY);
}

// Inter-phase gateways (between phases 1-2, 2-3, 3-4)
const gw1X = phX(0) + PH_W + 40;
const gw2X = phX(1) + PH_W + 40;
const gw3X = phX(2) + PH_W + 40;
const gwY = PH_Y + 15;

out += shape('GW_P1_Exit', gw1X, gwY, GW_W, GW_H);
out += shape('GW_P2_Exit', gw2X, gwY, GW_W, GW_H);
out += shape('GW_P3_Exit', gw3X, gwY, GW_W, GW_H);

// End events
const endDeferredX = gw1X + 7;
const endDeferredY = PH_Y + 160;
const endRejectedX = gw1X + 80;
const endRejectedY = PH_Y + 230;
const endRetiredX = phX(7) + PH_W + 50;
const endRetiredY = PH_Y + 22;

out += shape('End_Deferred', endDeferredX, endDeferredY, EVT_W, EVT_H);
out += shape('End_Rejected', endRejectedX, endRejectedY, EVT_W, EVT_H);
out += shape('End_Retired', endRetiredX, endRetiredY, EVT_W, EVT_H);

// Event sub-processes (collapsed, row at bottom of governance pool)
const evspY = GOV_POOL_H - 110;
let evspX = 220;
for (const espId of EVENT_SPS) {
  out += shape(espId, evspX, evspY, 120, 80, false, false);
  evspX += 150;
}

// ── Edges ──

// Start → Phase 1
out += edge('Flow_Start_Ph1', 170 + EVT_W, PH_Y + 40, phX(0), PH_Y + 40);

// Phase 1 → GW1
out += edge('Flow_Ph1_GW1', phX(0) + PH_W, PH_Y + 40, gw1X, gwY + 25);

// GW1 → Phase 2
out += edge('Flow_GW1_Ph2', gw1X + GW_W, gwY + 25, phX(1), PH_Y + 40);

// GW1 → Deferred (down)
out += edge('Flow_GW1_Deferred', gw1X + 25, gwY + GW_H, endDeferredX + 18, endDeferredY);

// GW1 → Rejected (down-right)
out += waypoints('Flow_GW1_Rejected', [
  [gw1X + 25, gwY + GW_H],
  [gw1X + 25, endRejectedY + 18],
  [endRejectedX, endRejectedY + 18],
]);

// Phase 2 → GW2
out += edge('Flow_Ph2_GW2', phX(1) + PH_W, PH_Y + 40, gw2X, gwY + 25);

// GW2 → Phase 3
out += edge('Flow_GW2_Ph3', gw2X + GW_W, gwY + 25, phX(2), PH_Y + 40);

// GW2 → Remediate loop (above main flow, back to Phase 2)
out += waypoints('Flow_GW2_Remediate', [
  [gw2X + 25, gwY],
  [gw2X + 25, PH_Y - 20],
  [phX(1) + 50, PH_Y - 20],
  [phX(1) + 50, PH_Y],
]);

// GW2 → Rejected
out += waypoints('Flow_GW2_Rejected', [
  [gw2X + 25, gwY + GW_H],
  [gw2X + 25, endRejectedY + 18],
  [endRejectedX + EVT_W, endRejectedY + 18],
]);

// Phase 3 → GW3
out += edge('Flow_Ph3_GW3', phX(2) + PH_W, PH_Y + 40, gw3X, gwY + 25);

// GW3 → Phase 4
out += edge('Flow_GW3_Ph4', gw3X + GW_W, gwY + 25, phX(3), PH_Y + 40);

// GW3 → Rework loop (above, back to Phase 3)
out += waypoints('Flow_GW3_Rework', [
  [gw3X + 25, gwY],
  [gw3X + 25, PH_Y - 20],
  [phX(2) + 50, PH_Y - 20],
  [phX(2) + 50, PH_Y],
]);

// GW3 → Escalate (back to Phase 2, routed below)
out += waypoints('Flow_GW3_Escalate', [
  [gw3X + 25, gwY + GW_H],
  [gw3X + 25, PH_Y + PH_H + 30],
  [phX(1) + 50, PH_Y + PH_H + 30],
  [phX(1) + 50, PH_Y + PH_H],
]);

// Sequential phases 4→5→6→7→8→End
out += edge('Flow_Ph4_Ph5', phX(3) + PH_W, PH_Y + 40, phX(4), PH_Y + 40);
out += edge('Flow_Ph5_Ph6', phX(4) + PH_W, PH_Y + 40, phX(5), PH_Y + 40);
out += edge('Flow_Ph6_Ph7', phX(5) + PH_W, PH_Y + 40, phX(6), PH_Y + 40);
out += edge('Flow_Ph7_Ph8', phX(6) + PH_W, PH_Y + 40, phX(7), PH_Y + 40);
out += edge('Flow_Ph8_End', phX(7) + PH_W, PH_Y + 40, endRetiredX, endRetiredY + 18);

// Message flows to external pools
const msgFlows = [
  { id: 'MF_001', srcPhase: 0, tgtPool: 0 },
  { id: 'MF_002', srcPhase: 0, tgtPool: 4 },
  { id: 'MF_003', srcPhase: 1, tgtPool: 2 },
  { id: 'MF_004', srcPhase: 2, tgtPool: 3 },
  { id: 'MF_005', srcPhase: 2, tgtPool: 1 },
];
for (const mf of msgFlows) {
  const srcX = phX(mf.srcPhase) + 30 + mf.tgtPool * 10;
  const srcY = PH_Y + PH_H;
  const tgtY = GOV_POOL_H + POOL_GAP + mf.tgtPool * (EXT_POOL_H + 8);
  out += edge(mf.id, srcX, srcY, srcX, tgtY);
}

out += `    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>

`;

// ──────────────────────────────────────────────────────────────────────────────
// 6. DI — LEVEL 1: PHASE INTERNAL DIAGRAMS
// ──────────────────────────────────────────────────────────────────────────────

for (const phase of PHASES) {
  out += generatePhaseDI(phase);
}

// ──────────────────────────────────────────────────────────────────────────────
// 7. DI — LEVEL 2: SUB-PHASE INTERNAL DIAGRAMS
// ──────────────────────────────────────────────────────────────────────────────

for (const spId of allSPIds) {
  out += generateSubPhaseDI(spId);
}

// ──────────────────────────────────────────────────────────────────────────────
// 8. DI — EVENT SUB-PROCESS DIAGRAMS
// ──────────────────────────────────────────────────────────────────────────────

for (const espId of EVENT_SPS) {
  out += generateEventSPDI(espId);
}

out += `</bpmn:definitions>\n`;

writeFileSync(OUTPUT, out, 'utf8');
console.log(`Written: ${OUTPUT}`);
console.log(`Lines: ${out.split('\n').length}`);
console.log(`Tasks: ${(out.match(/<bpmn:(userTask|serviceTask|businessRuleTask|sendTask|task) /g) || []).length}`);
console.log(`BPMNDiagrams: ${(out.match(/<bpmndi:BPMNDiagram /g) || []).length}`);

// Check for unresolved DI references
const diRefs = [...out.matchAll(/bpmnElement="([^"]+)"/g)].map(m => m[1]);
const processIds = [...out.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
const processIdSet = new Set(processIds);
const unresolved = diRefs.filter(ref => !processIdSet.has(ref));
if (unresolved.length > 0) {
  console.error(`UNRESOLVED DI REFERENCES (${unresolved.length}):`);
  for (const ref of [...new Set(unresolved)]) {
    console.error(`  - ${ref}`);
  }
} else {
  console.log('All DI references resolved OK');
}

// ══════════════════════════════════════════════════════════════════════════════
// GENERATION FUNCTIONS
// ══════════════════════════════════════════════════════════════════════════════

function generatePhaseSubProcess(phase) {
  const pId = phase.id;
  const incoming = getPhaseIncoming(phase);
  const outgoing = getPhaseOutgoing(phase);

  let s = `    <bpmn:subProcess id="${pId}" name="${phase.name}">
      <bpmn:documentation>${phase.doc}</bpmn:documentation>
      <bpmn:extensionElements>
        <camunda:properties>
          <camunda:property name="phase" value="${phase.phase}" />
          <camunda:property name="sla_standard_hours" value="${phase.slaHours}" />
        </camunda:properties>
      </bpmn:extensionElements>
`;
  for (const i of incoming) s += `      <bpmn:incoming>${i}</bpmn:incoming>\n`;
  for (const o of outgoing) s += `      <bpmn:outgoing>${o}</bpmn:outgoing>\n`;

  if (phase.subPhases.length > 0) {
    s += buildPhaseInternals(phase);
  } else {
    s += buildPlaceholderInternals(pId);
  }

  s += `    </bpmn:subProcess>\n\n`;
  return s;
}

function buildPlaceholderInternals(pId) {
  const safeName = pId.replace('SP_', '').replace(/_/g, ' ');
  return `      <bpmn:startEvent id="${pId}_Start" name="Start">
        <bpmn:outgoing>Flow_${pId}_s</bpmn:outgoing>
      </bpmn:startEvent>
      <bpmn:userTask id="${pId}_Task" name="${safeName} Activities" camunda:candidateGroups="governance-lane">
        <bpmn:incoming>Flow_${pId}_s</bpmn:incoming>
        <bpmn:outgoing>Flow_${pId}_e</bpmn:outgoing>
      </bpmn:userTask>
      <bpmn:endEvent id="${pId}_End" name="Complete">
        <bpmn:incoming>Flow_${pId}_e</bpmn:incoming>
      </bpmn:endEvent>
      <bpmn:sequenceFlow id="Flow_${pId}_s" sourceRef="${pId}_Start" targetRef="${pId}_Task" />
      <bpmn:sequenceFlow id="Flow_${pId}_e" sourceRef="${pId}_Task" targetRef="${pId}_End" />
`;
}

function buildPhaseInternals(phase) {
  const pId = phase.id;
  let s = '';

  // Start + End events
  s += `      <bpmn:startEvent id="${pId}_Start" name="Start">\n`;
  s += `        <bpmn:outgoing>Flow_${pId}_s0</bpmn:outgoing>\n`;
  s += `      </bpmn:startEvent>\n`;

  // Collapsed sub-phase SPs (preserve original task content)
  for (const spId of phase.subPhases) {
    if (subProcessBlocks[spId]) {
      s += `      ${subProcessBlocks[spId]}\n`;
    }
  }

  // Sub-phase SLA boundary timers + escalation end events (inside phase)
  for (const spId of phase.subPhases) {
    const timers = timersByAttachedTo[spId] || [];
    for (const t of timers) {
      s += `      ${t.xml}\n`;
    }
    if (timers.length > 0) {
      s += `      <bpmn:endEvent id="Esc_${spId}" name="SLA&#10;Escalation">\n`;
      for (const t of timers) s += `        <bpmn:incoming>Flow_Esc_${t.id}</bpmn:incoming>\n`;
      s += `      </bpmn:endEvent>\n`;
      for (const t of timers) {
        s += `      <bpmn:sequenceFlow id="Flow_Esc_${t.id}" sourceRef="${t.id}" targetRef="Esc_${spId}" />\n`;
      }
    }
  }

  // Phase-specific internal flow routing
  if (pId === 'SP_Phase1') {
    s += buildPhase1Routing(pId);
  } else if (pId === 'SP_Phase2') {
    s += buildPhase2Routing(pId);
  } else if (pId === 'SP_Phase3') {
    s += buildPhase3Routing(pId);
  }

  return s;
}

function buildPhase1Routing(pId) {
  let s = '';
  // GW_1_1 after SP_1_1, GW_1_2 after SP_1_2, merge before end
  s += `      <bpmn:exclusiveGateway id="${pId}_GW1" name="Validation?" default="Flow_${pId}_g1ok">
        <bpmn:incoming>Flow_${pId}_sp11</bpmn:incoming>
        <bpmn:outgoing>Flow_${pId}_g1ok</bpmn:outgoing>
        <bpmn:outgoing>Flow_${pId}_g1loop</bpmn:outgoing>
      </bpmn:exclusiveGateway>
      <bpmn:exclusiveGateway id="${pId}_GW2" name="Risk Tier?" default="Flow_${pId}_g2std">
        <bpmn:incoming>Flow_${pId}_sp12</bpmn:incoming>
        <bpmn:outgoing>Flow_${pId}_g2std</bpmn:outgoing>
        <bpmn:outgoing>Flow_${pId}_g2exp</bpmn:outgoing>
      </bpmn:exclusiveGateway>
      <bpmn:exclusiveGateway id="${pId}_Merge">
        <bpmn:incoming>Flow_${pId}_sp13</bpmn:incoming>
        <bpmn:incoming>Flow_${pId}_g2exp</bpmn:incoming>
        <bpmn:outgoing>Flow_${pId}_end</bpmn:outgoing>
      </bpmn:exclusiveGateway>
      <bpmn:endEvent id="${pId}_End" name="Phase Complete">
        <bpmn:incoming>Flow_${pId}_end</bpmn:incoming>
      </bpmn:endEvent>
`;
  // Flows
  s += `      <bpmn:sequenceFlow id="Flow_${pId}_s0" sourceRef="${pId}_Start" targetRef="SP_1_1" />
      <bpmn:sequenceFlow id="Flow_${pId}_sp11" sourceRef="SP_1_1" targetRef="${pId}_GW1" />
      <bpmn:sequenceFlow id="Flow_${pId}_g1ok" name="Complete" sourceRef="${pId}_GW1" targetRef="SP_1_2" />
      <bpmn:sequenceFlow id="Flow_${pId}_g1loop" name="Incomplete" sourceRef="${pId}_GW1" targetRef="SP_1_1">
        <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">#{validationStatus=="incomplete"}</bpmn:conditionExpression>
      </bpmn:sequenceFlow>
      <bpmn:sequenceFlow id="Flow_${pId}_sp12" sourceRef="SP_1_2" targetRef="${pId}_GW2" />
      <bpmn:sequenceFlow id="Flow_${pId}_g2std" name="Standard" sourceRef="${pId}_GW2" targetRef="SP_1_3" />
      <bpmn:sequenceFlow id="Flow_${pId}_g2exp" name="Express" sourceRef="${pId}_GW2" targetRef="${pId}_Merge">
        <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">#{confirmedRiskTier=="Low"}</bpmn:conditionExpression>
      </bpmn:sequenceFlow>
      <bpmn:sequenceFlow id="Flow_${pId}_sp13" sourceRef="SP_1_3" targetRef="${pId}_Merge" />
      <bpmn:sequenceFlow id="Flow_${pId}_end" sourceRef="${pId}_Merge" targetRef="${pId}_End" />
`;
  return s;
}

function buildPhase2Routing(pId) {
  let s = '';
  s += `      <bpmn:parallelGateway id="${pId}_Split">
        <bpmn:incoming>Flow_${pId}_s0</bpmn:incoming>
        <bpmn:outgoing>Flow_${pId}_s21</bpmn:outgoing>
        <bpmn:outgoing>Flow_${pId}_s22</bpmn:outgoing>
        <bpmn:outgoing>Flow_${pId}_sgv</bpmn:outgoing>
        <bpmn:outgoing>Flow_${pId}_s24</bpmn:outgoing>
      </bpmn:parallelGateway>
      <bpmn:inclusiveGateway id="${pId}_Vendor" name="Vendor?" default="Flow_${pId}_novend">
        <bpmn:incoming>Flow_${pId}_sgv</bpmn:incoming>
        <bpmn:outgoing>Flow_${pId}_s23</bpmn:outgoing>
        <bpmn:outgoing>Flow_${pId}_novend</bpmn:outgoing>
      </bpmn:inclusiveGateway>
      <bpmn:parallelGateway id="${pId}_Join">
        <bpmn:incoming>Flow_${pId}_j21</bpmn:incoming>
        <bpmn:incoming>Flow_${pId}_j22</bpmn:incoming>
        <bpmn:incoming>Flow_${pId}_j23</bpmn:incoming>
        <bpmn:incoming>Flow_${pId}_j24</bpmn:incoming>
        <bpmn:incoming>Flow_${pId}_novend</bpmn:incoming>
        <bpmn:outgoing>Flow_${pId}_j25</bpmn:outgoing>
      </bpmn:parallelGateway>
      <bpmn:endEvent id="${pId}_End" name="Phase Complete">
        <bpmn:incoming>Flow_${pId}_e25</bpmn:incoming>
      </bpmn:endEvent>
`;
  s += `      <bpmn:sequenceFlow id="Flow_${pId}_s0" sourceRef="${pId}_Start" targetRef="${pId}_Split" />
      <bpmn:sequenceFlow id="Flow_${pId}_s21" sourceRef="${pId}_Split" targetRef="SP_2_1" />
      <bpmn:sequenceFlow id="Flow_${pId}_s22" sourceRef="${pId}_Split" targetRef="SP_2_2" />
      <bpmn:sequenceFlow id="Flow_${pId}_sgv" sourceRef="${pId}_Split" targetRef="${pId}_Vendor" />
      <bpmn:sequenceFlow id="Flow_${pId}_s24" sourceRef="${pId}_Split" targetRef="SP_2_4" />
      <bpmn:sequenceFlow id="Flow_${pId}_s23" name="Vendor" sourceRef="${pId}_Vendor" targetRef="SP_2_3">
        <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">#{vendorInvolved==true}</bpmn:conditionExpression>
      </bpmn:sequenceFlow>
      <bpmn:sequenceFlow id="Flow_${pId}_novend" name="No Vendor" sourceRef="${pId}_Vendor" targetRef="${pId}_Join" />
      <bpmn:sequenceFlow id="Flow_${pId}_j21" sourceRef="SP_2_1" targetRef="${pId}_Join" />
      <bpmn:sequenceFlow id="Flow_${pId}_j22" sourceRef="SP_2_2" targetRef="${pId}_Join" />
      <bpmn:sequenceFlow id="Flow_${pId}_j23" sourceRef="SP_2_3" targetRef="${pId}_Join" />
      <bpmn:sequenceFlow id="Flow_${pId}_j24" sourceRef="SP_2_4" targetRef="${pId}_Join" />
      <bpmn:sequenceFlow id="Flow_${pId}_j25" sourceRef="${pId}_Join" targetRef="SP_2_5" />
      <bpmn:sequenceFlow id="Flow_${pId}_e25" sourceRef="SP_2_5" targetRef="${pId}_End" />
`;
  return s;
}

function buildPhase3Routing(pId) {
  let s = '';
  s += `      <bpmn:parallelGateway id="${pId}_Split">
        <bpmn:incoming>Flow_${pId}_s0</bpmn:incoming>
        <bpmn:outgoing>Flow_${pId}_s31</bpmn:outgoing>
        <bpmn:outgoing>Flow_${pId}_s32</bpmn:outgoing>
        <bpmn:outgoing>Flow_${pId}_s33</bpmn:outgoing>
        <bpmn:outgoing>Flow_${pId}_s34</bpmn:outgoing>
      </bpmn:parallelGateway>
      <bpmn:parallelGateway id="${pId}_Join">
        <bpmn:incoming>Flow_${pId}_j31</bpmn:incoming>
        <bpmn:incoming>Flow_${pId}_j32</bpmn:incoming>
        <bpmn:incoming>Flow_${pId}_j33</bpmn:incoming>
        <bpmn:incoming>Flow_${pId}_j34</bpmn:incoming>
        <bpmn:outgoing>Flow_${pId}_j35</bpmn:outgoing>
      </bpmn:parallelGateway>
      <bpmn:endEvent id="${pId}_End" name="Phase Complete">
        <bpmn:incoming>Flow_${pId}_e35</bpmn:incoming>
      </bpmn:endEvent>
`;
  s += `      <bpmn:sequenceFlow id="Flow_${pId}_s0" sourceRef="${pId}_Start" targetRef="${pId}_Split" />
      <bpmn:sequenceFlow id="Flow_${pId}_s31" sourceRef="${pId}_Split" targetRef="SP_3_1" />
      <bpmn:sequenceFlow id="Flow_${pId}_s32" sourceRef="${pId}_Split" targetRef="SP_3_2" />
      <bpmn:sequenceFlow id="Flow_${pId}_s33" sourceRef="${pId}_Split" targetRef="SP_3_3" />
      <bpmn:sequenceFlow id="Flow_${pId}_s34" sourceRef="${pId}_Split" targetRef="SP_3_4" />
      <bpmn:sequenceFlow id="Flow_${pId}_j31" sourceRef="SP_3_1" targetRef="${pId}_Join" />
      <bpmn:sequenceFlow id="Flow_${pId}_j32" sourceRef="SP_3_2" targetRef="${pId}_Join" />
      <bpmn:sequenceFlow id="Flow_${pId}_j33" sourceRef="SP_3_3" targetRef="${pId}_Join" />
      <bpmn:sequenceFlow id="Flow_${pId}_j34" sourceRef="SP_3_4" targetRef="${pId}_Join" />
      <bpmn:sequenceFlow id="Flow_${pId}_j35" sourceRef="${pId}_Join" targetRef="SP_3_5" />
      <bpmn:sequenceFlow id="Flow_${pId}_e35" sourceRef="SP_3_5" targetRef="${pId}_End" />
`;
  return s;
}

function getPhaseIncoming(phase) {
  const i = PHASES.indexOf(phase);
  if (i === 0) return ['Flow_Start_Ph1'];
  if (i === 1) return ['Flow_GW1_Ph2', 'Flow_GW2_Remediate', 'Flow_GW3_Escalate'];
  if (i === 2) return ['Flow_GW2_Ph3', 'Flow_GW3_Rework'];
  if (i === 3) return ['Flow_GW3_Ph4'];
  return [`Flow_Ph${i}_Ph${i + 1}`];
}

function getPhaseOutgoing(phase) {
  const i = PHASES.indexOf(phase);
  if (i === 0) return ['Flow_Ph1_GW1'];
  if (i === 1) return ['Flow_Ph2_GW2'];
  if (i === 2) return ['Flow_Ph3_GW3'];
  if (i === 7) return ['Flow_Ph8_End'];
  return [`Flow_Ph${i + 1}_Ph${i + 2}`];
}

// ──────────────────────────────────────────────────────────────────────────────
// LEVEL 1 DI — Phase Internal Diagrams
// ──────────────────────────────────────────────────────────────────────────────

function generatePhaseDI(phase) {
  const pId = phase.id;
  let di = `  <bpmndi:BPMNDiagram id="BPMNDiagram_${pId}">
    <bpmndi:BPMNPlane id="BPMNPlane_${pId}" bpmnElement="${pId}">\n`;

  const y = 120;  // main row Y
  let x = 80;

  // Start event
  di += shape(`${pId}_Start`, x, y + 22, 36, 36);
  x += 80;

  if (pId === 'SP_Phase1') {
    // Start → SP_1_1 → GW1 → SP_1_2 → GW2 → SP_1_3 → Merge → End
    di += shape('SP_1_1', x, y, 100, 80, false, false);
    x += 150;
    di += shape(`${pId}_GW1`, x, y + 15, 50, 50);
    const gw1 = x;
    x += 100;
    di += shape('SP_1_2', x, y, 100, 80, false, false);
    x += 150;
    di += shape(`${pId}_GW2`, x, y + 15, 50, 50);
    const gw2 = x;
    x += 100;
    di += shape('SP_1_3', x, y, 100, 80, false, false);
    x += 150;
    di += shape(`${pId}_Merge`, x, y + 15, 50, 50);
    const mg = x;
    x += 80;
    di += shape(`${pId}_End`, x, y + 22, 36, 36);

    di += edge(`Flow_${pId}_s0`, 116, y + 40, 160, y + 40);
    di += edge(`Flow_${pId}_sp11`, 260, y + 40, gw1, y + 40);
    di += edge(`Flow_${pId}_g1ok`, gw1 + 50, y + 40, gw1 + 100, y + 40);
    di += waypoints(`Flow_${pId}_g1loop`, [[gw1 + 25, y + 15], [gw1 + 25, y - 30], [210, y - 30], [210, y]]);
    di += edge(`Flow_${pId}_sp12`, gw1 + 200, y + 40, gw2, y + 40);
    di += edge(`Flow_${pId}_g2std`, gw2 + 50, y + 40, gw2 + 100, y + 40);
    di += waypoints(`Flow_${pId}_g2exp`, [[gw2 + 25, y + 65], [gw2 + 25, y + 110], [mg + 25, y + 110], [mg + 25, y + 65]]);
    di += edge(`Flow_${pId}_sp13`, gw2 + 200, y + 40, mg, y + 40);
    di += edge(`Flow_${pId}_end`, mg + 50, y + 40, x, y + 40);

  } else if (pId === 'SP_Phase2') {
    // Start → Split → [4 branches] → Join → SP_2_5 → End
    di += shape(`${pId}_Split`, x, y + 15, 50, 50);
    const sp = x;
    x += 100;
    const branchY = [y - 140, y - 50, y + 40, y + 130];
    di += shape('SP_2_1', x, branchY[0], 100, 80, false, false);
    di += shape('SP_2_2', x, branchY[1], 100, 80, false, false);
    di += shape(`${pId}_Vendor`, x, branchY[2] + 15, 50, 50);
    di += shape('SP_2_4', x, branchY[3], 100, 80, false, false);
    const vendSPx = x + 100;
    di += shape('SP_2_3', vendSPx, branchY[2], 100, 80, false, false);
    const joinX = vendSPx + 140;
    di += shape(`${pId}_Join`, joinX, y + 15, 50, 50);
    const sp25x = joinX + 80;
    di += shape('SP_2_5', sp25x, y, 100, 80, false, false);
    const endX = sp25x + 140;
    di += shape(`${pId}_End`, endX, y + 22, 36, 36);

    di += edge(`Flow_${pId}_s0`, 116, y + 40, sp, y + 40);
    for (let b = 0; b < 4; b++) {
      const flowIds = [`Flow_${pId}_s21`, `Flow_${pId}_s22`, `Flow_${pId}_sgv`, `Flow_${pId}_s24`];
      const tgts = [branchY[0] + 40, branchY[1] + 40, branchY[2] + 40, branchY[3] + 40];
      di += waypoints(flowIds[b], [[sp + 50, y + 40], [sp + 70, tgts[b]], [x, tgts[b]]]);
    }
    di += edge(`Flow_${pId}_s23`, x + 50, branchY[2] + 40, vendSPx, branchY[2] + 40);
    di += waypoints(`Flow_${pId}_novend`, [[x + 25, branchY[2] + 65], [x + 25, branchY[2] + 100], [joinX + 25, branchY[2] + 100], [joinX + 25, y + 65]]);

    const joinSrcs = [x + 100, x + 100, vendSPx + 100, x + 100];
    const joinSrcYs = [branchY[0] + 40, branchY[1] + 40, branchY[2] + 40, branchY[3] + 40];
    const joinFlowIds = [`Flow_${pId}_j21`, `Flow_${pId}_j22`, `Flow_${pId}_j23`, `Flow_${pId}_j24`];
    for (let b = 0; b < 4; b++) {
      di += waypoints(joinFlowIds[b], [[joinSrcs[b], joinSrcYs[b]], [joinX - 10, joinSrcYs[b]], [joinX - 10, y + 40], [joinX, y + 40]]);
    }
    di += edge(`Flow_${pId}_j25`, joinX + 50, y + 40, sp25x, y + 40);
    di += edge(`Flow_${pId}_e25`, sp25x + 100, y + 40, endX, y + 40);

  } else if (pId === 'SP_Phase3') {
    // Start → Split → [4 parallel] → Join → SP_3_5 → End
    di += shape(`${pId}_Split`, x, y + 15, 50, 50);
    const sp = x;
    x += 100;
    const branchY = [y - 120, y - 40, y + 40, y + 120];
    for (let b = 0; b < 4; b++) {
      di += shape(`SP_3_${b + 1}`, x, branchY[b], 100, 80, false, false);
    }
    const joinX = x + 140;
    di += shape(`${pId}_Join`, joinX, y + 15, 50, 50);
    const sp35x = joinX + 80;
    di += shape('SP_3_5', sp35x, y, 100, 80, false, false);
    const endX = sp35x + 140;
    di += shape(`${pId}_End`, endX, y + 22, 36, 36);

    di += edge(`Flow_${pId}_s0`, 116, y + 40, sp, y + 40);
    for (let b = 0; b < 4; b++) {
      di += waypoints(`Flow_${pId}_s3${b + 1}`, [[sp + 50, y + 40], [sp + 70, branchY[b] + 40], [x, branchY[b] + 40]]);
      di += waypoints(`Flow_${pId}_j3${b + 1}`, [[x + 100, branchY[b] + 40], [joinX - 10, branchY[b] + 40], [joinX - 10, y + 40], [joinX, y + 40]]);
    }
    di += edge(`Flow_${pId}_j35`, joinX + 50, y + 40, sp35x, y + 40);
    di += edge(`Flow_${pId}_e35`, sp35x + 100, y + 40, endX, y + 40);

  } else {
    // Placeholder: Start → Task → End
    di += shape(`${pId}_Task`, x, y, 160, 80);
    x += 200;
    di += shape(`${pId}_End`, x, y + 22, 36, 36);
    di += edge(`Flow_${pId}_s`, 116, y + 40, 160, y + 40);
    di += edge(`Flow_${pId}_e`, 320, y + 40, x, y + 40);
  }

  di += `    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>\n\n`;
  return di;
}

// ──────────────────────────────────────────────────────────────────────────────
// LEVEL 2 DI — Sub-Phase Internal Diagrams
// ──────────────────────────────────────────────────────────────────────────────

function generateSubPhaseDI(spId) {
  const block = subProcessBlocks[spId];
  if (!block) return '';

  const elements = extractElementsFromBlock(block);
  const flows = extractFlowsFromBlock(block);

  let di = `  <bpmndi:BPMNDiagram id="BPMNDiagram_${spId}">
    <bpmndi:BPMNPlane id="BPMNPlane_${spId}" bpmnElement="${spId}">\n`;

  const y = 80;
  // Build position map
  const posMap = {};
  let x = 80;
  for (const el of elements) {
    const w = (el.type === 'startEvent' || el.type === 'endEvent') ? 36
      : (el.type.includes('Gateway')) ? 50
      : 160;
    const h = (el.type === 'startEvent' || el.type === 'endEvent') ? 36
      : (el.type.includes('Gateway')) ? 50
      : 80;
    const elY = el.type === 'startEvent' || el.type === 'endEvent' ? y + 22
      : el.type.includes('Gateway') ? y + 15
      : y;
    posMap[el.id] = { x, y: elY, w, h };
    di += shape(el.id, x, elY, w, h);
    x += w + 50;
  }

  // Edges
  for (const flow of flows) {
    const src = posMap[flow.source];
    const tgt = posMap[flow.target];
    if (src && tgt) {
      if (tgt.x >= src.x) {
        di += edge(flow.id, src.x + src.w, src.y + src.h / 2, tgt.x, tgt.y + tgt.h / 2);
      } else {
        // Loop-back
        di += waypoints(flow.id, [
          [src.x + src.w / 2, src.y],
          [src.x + src.w / 2, y - 30],
          [tgt.x + tgt.w / 2, y - 30],
          [tgt.x + tgt.w / 2, tgt.y],
        ]);
      }
    }
  }

  di += `    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>\n\n`;
  return di;
}

// ──────────────────────────────────────────────────────────────────────────────
// EVENT SUB-PROCESS DI
// ──────────────────────────────────────────────────────────────────────────────

function generateEventSPDI(espId) {
  const block = eventSPBlocks[espId];
  if (!block) return '';

  const elements = extractElementsFromBlock(block);
  const flows = extractFlowsFromBlock(block);

  let di = `  <bpmndi:BPMNDiagram id="BPMNDiagram_${espId}">
    <bpmndi:BPMNPlane id="BPMNPlane_${espId}" bpmnElement="${espId}">\n`;

  const y = 80;
  const posMap = {};
  let x = 80;
  for (const el of elements) {
    const w = (el.type === 'startEvent' || el.type === 'endEvent') ? 36
      : el.type.includes('Gateway') ? 50
      : 120;
    const h = (el.type === 'startEvent' || el.type === 'endEvent') ? 36
      : el.type.includes('Gateway') ? 50
      : 80;
    const elY = (el.type === 'startEvent' || el.type === 'endEvent') ? y + 22
      : el.type.includes('Gateway') ? y + 15
      : y;
    posMap[el.id] = { x, y: elY, w, h };
    di += shape(el.id, x, elY, w, h);
    x += w + 40;
  }

  for (const flow of flows) {
    const src = posMap[flow.source];
    const tgt = posMap[flow.target];
    if (src && tgt) {
      di += edge(flow.id, src.x + src.w, src.y + src.h / 2, tgt.x, tgt.y + tgt.h / 2);
    }
  }

  di += `    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>\n\n`;
  return di;
}

// ──────────────────────────────────────────────────────────────────────────────
// DI PRIMITIVES
// ──────────────────────────────────────────────────────────────────────────────

function shape(id, x, y, w, h, isHorizontal = false, isExpanded) {
  let attrs = `bpmnElement="${id}"`;
  if (isHorizontal) attrs += ' isHorizontal="true"';
  if (isExpanded === false) attrs += ' isExpanded="false"';
  return `      <bpmndi:BPMNShape id="${id}_di" ${attrs}>
        <dc:Bounds x="${Math.round(x)}" y="${Math.round(y)}" width="${w}" height="${h}" />
      </bpmndi:BPMNShape>\n`;
}

function edge(id, x1, y1, x2, y2) {
  return `      <bpmndi:BPMNEdge id="${id}_di" bpmnElement="${id}">
        <di:waypoint x="${Math.round(x1)}" y="${Math.round(y1)}" />
        <di:waypoint x="${Math.round(x2)}" y="${Math.round(y2)}" />
      </bpmndi:BPMNEdge>\n`;
}

function waypoints(id, pts) {
  let s = `      <bpmndi:BPMNEdge id="${id}_di" bpmnElement="${id}">\n`;
  for (const [x, y] of pts) {
    s += `        <di:waypoint x="${Math.round(x)}" y="${Math.round(y)}" />\n`;
  }
  s += `      </bpmndi:BPMNEdge>\n`;
  return s;
}
