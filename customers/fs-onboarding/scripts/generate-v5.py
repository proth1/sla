#!/usr/bin/env python3
"""
Generate onboarding-to-be-ideal-state-v5.bpmn from v4.
Reads v4, extracts all task elements, assembles into hierarchical v5 with 5 collapsed sub-processes.
"""

import re
import sys

V4_PATH = "/Users/proth/repos/sla/processes/Onboarding-only/onboarding-to-be-ideal-state-v4.bpmn"
V5_PATH = "/Users/proth/repos/sla/processes/Onboarding-only/onboarding-to-be-ideal-state-v5.bpmn"


def extract_element(v4_text, element_id):
    """Extract complete XML element by id using line-by-line parsing."""
    lines = v4_text.split('\n')
    result = []
    collecting = False
    tag_name = None
    depth = 0

    for line in lines:
        if f'id="{element_id}"' in line and not collecting:
            collecting = True
            m = re.match(r'\s*<([\w:]+)', line)
            tag_name = m.group(1) if m else None
            depth = 1
            result.append(line)
            # self-closing tag
            if '/>' in line:
                break
            # single-line open+close
            if tag_name and f'</{tag_name}>' in line:
                break
            continue

        if collecting:
            result.append(line)
            if tag_name:
                open_pattern = re.compile(rf'<{re.escape(tag_name)}[\s>]')
                close_pattern = f'</{tag_name}>'
                for m2 in open_pattern.finditer(line):
                    start = m2.start()
                    # Check if it's self-closing
                    end = line.find('>', start)
                    if end >= 0 and line[end-1] != '/':
                        depth += 1
                if close_pattern in line:
                    depth -= 1
                    if depth <= 0:
                        break

    return '\n'.join(result)


def strip_flows(xml_block):
    """Remove <bpmn:incoming> and <bpmn:outgoing> elements from an XML block."""
    xml_block = re.sub(r'\s*<bpmn:incoming>[^<]*</bpmn:incoming>', '', xml_block)
    xml_block = re.sub(r'\s*<bpmn:outgoing>[^<]*</bpmn:outgoing>', '', xml_block)
    return xml_block


def add_flows(xml_block, incoming=None, outgoing=None):
    """Add incoming/outgoing flow references before the closing tag of the element."""
    incoming = incoming or []
    outgoing = outgoing or []

    flow_lines = []
    for f in incoming:
        flow_lines.append(f'      <bpmn:incoming>{f}</bpmn:incoming>')
    for f in outgoing:
        flow_lines.append(f'      <bpmn:outgoing>{f}</bpmn:outgoing>')

    if not flow_lines:
        return xml_block

    flow_str = '\n'.join(flow_lines)

    # Find the closing tag of the root element
    # Get the tag name from the first line
    m = re.match(r'\s*<([\w:]+)', xml_block)
    if not m:
        return xml_block
    tag_name = m.group(1)
    close_tag = f'</{tag_name}>'

    # Insert before closing tag
    idx = xml_block.rfind(close_tag)
    if idx >= 0:
        xml_block = xml_block[:idx] + flow_str + '\n    ' + xml_block[idx:]
    return xml_block


def reindent(xml_block, extra_indent='  '):
    """Add extra indentation to every line of the block."""
    lines = xml_block.split('\n')
    return '\n'.join(extra_indent + line if line.strip() else line for line in lines)


def extract_vendor_process(v4_text):
    """Extract the entire vendor process block."""
    lines = v4_text.split('\n')
    result = []
    collecting = False
    depth = 0

    for line in lines:
        if 'id="Process_Vendor"' in line and not collecting:
            collecting = True
            depth = 1
            result.append(line)
            continue

        if collecting:
            result.append(line)
            if '<bpmn:process' in line and 'id=' in line:
                depth += 1
            if '</bpmn:process>' in line:
                depth -= 1
                if depth <= 0:
                    break

    return '\n'.join(result)


def extract_pdlc_diagram(v4_text):
    """Extract the PDLC BPMNDiagram block from v4."""
    lines = v4_text.split('\n')
    result = []
    collecting = False
    depth = 0

    for line in lines:
        if 'bpmnElement="SP_PDLC"' in line and '<bpmndi:BPMNPlane' in line:
            # Find the parent BPMNDiagram
            # look back
            collecting = True
            depth = 1
            # Find the BPMNDiagram opening above this line
            # We'll collect from BPMNDiagram containing this plane
            result = [line]
            continue

        if collecting:
            result.append(line)
            if '</bpmndi:BPMNDiagram>' in line:
                depth -= 1
                if depth <= 0:
                    break

    return '\n'.join(result)


def build_v5(v4_text):
    """Build the complete v5 BPMN XML."""

    # -------------------------------------------------------------------------
    # Extract task elements from v4 (stripping flows, ready to re-add)
    # -------------------------------------------------------------------------
    def get_task(eid, incoming=None, outgoing=None):
        block = extract_element(v4_text, eid)
        block = strip_flows(block)
        block = add_flows(block, incoming, outgoing)
        return block

    # -------------------------------------------------------------------------
    # SP1 internal elements
    # -------------------------------------------------------------------------
    sp1_task_review = get_task('Task_ReviewExisting',
                               incoming=['Flow_SP1_1'], outgoing=['Flow_SP1_2'])
    sp1_task_gather = get_task('Task_GatherDocs',
                               incoming=['Flow_SP1_No'], outgoing=['Flow_SP1_3'])
    sp1_task_submit = get_task('Task_SubmitRequest',
                               incoming=['Flow_SP1_3'], outgoing=['Flow_SP1_4'])
    sp1_task_triage = get_task('Task_InitialTriage',
                               incoming=['Flow_SP1_4'], outgoing=['Flow_SP1_5'])
    sp1_task_leverage = get_task('Task_LeverageExisting',
                                 incoming=['Flow_SP1_Yes'], outgoing=['Flow_SP1_EndLev'])

    # Timer boundary - attachedToRef stays the same
    sp1_timer_triage = extract_element(v4_text, 'Timer_TriageSLA')
    sp1_timer_triage = strip_flows(sp1_timer_triage)
    sp1_timer_triage = add_flows(sp1_timer_triage, outgoing=['Flow_SP1_SLA'])

    # -------------------------------------------------------------------------
    # SP2 internal elements
    # -------------------------------------------------------------------------
    sp2_task_prelim = get_task('Task_PrelimAnalysis',
                               incoming=['Flow_SP2_1'], outgoing=['Flow_SP2_2'])
    sp2_task_backlog = get_task('Task_Backlog',
                                incoming=['Flow_SP2_Yes'], outgoing=['Flow_SP2_3'])
    sp2_task_pathway = get_task('Task_PathwayRouting',
                                incoming=['Flow_SP2_4'], outgoing=['Flow_SP2_5'])

    # -------------------------------------------------------------------------
    # SP3 internal elements
    # -------------------------------------------------------------------------
    sp3_task_tech = get_task('Task_TechArchReview',
                             incoming=['Flow_SP3_P1'], outgoing=['Flow_SP3_P1J'])
    sp3_task_sec = get_task('Task_SecurityAssessment',
                            incoming=['Flow_SP3_P2'], outgoing=['Flow_SP3_P2J'])
    sp3_task_risk = get_task('Task_RiskCompliance',
                             incoming=['Flow_SP3_P3'], outgoing=['Flow_SP3_P3J'])
    sp3_task_fin = get_task('Task_FinancialAnalysis',
                            incoming=['Flow_SP3_P4'], outgoing=['Flow_SP3_P4J'])
    sp3_task_vendor_landscape = get_task('Task_AssessVendorLandscape',
                                         incoming=['Flow_SP3_P5'], outgoing=['Flow_SP3_P5J'])
    sp3_task_dd = get_task('Task_VendorDueDiligence',
                           incoming=['Flow_SP3_2'], outgoing=['Flow_SP3_3'])
    sp3_recv_vendor = get_task('Receive_VendorResponse',
                               incoming=['Flow_SP3_3'], outgoing=['Flow_SP3_4'])
    sp3_task_eval = get_task('Task_EvaluateVendorResponse',
                             incoming=['Flow_SP3_4'], outgoing=['Flow_SP3_5'])

    sp3_timer_vendor = extract_element(v4_text, 'Timer_VendorResponseSLA')
    sp3_timer_vendor = strip_flows(sp3_timer_vendor)
    sp3_timer_vendor = add_flows(sp3_timer_vendor, outgoing=['Flow_SP3_SLA'])

    # -------------------------------------------------------------------------
    # SP4 internal elements
    # -------------------------------------------------------------------------
    sp4_task_refine = get_task('Task_RefineRequirements',
                               incoming=['Flow_SP4_Buy'], outgoing=['Flow_SP4_2'])
    sp4_task_poc = get_task('Task_PerformPoC',
                            incoming=['Flow_SP4_2'], outgoing=['Flow_SP4_3'])
    sp4_task_tech_risk = get_task('Task_TechRiskEval',
                                  incoming=['Flow_SP4_3'], outgoing=['Flow_SP4_4'])
    sp4_task_negotiate = get_task('Task_NegotiateContract',
                                  incoming=['Flow_SP4_4'], outgoing=['Flow_SP4_5'])
    sp4_recv_signed = get_task('Receive_SignedContract',
                               incoming=['Flow_SP4_5'], outgoing=['Flow_SP4_6'])
    sp4_task_finalize = get_task('Task_FinalizeContract',
                                 incoming=['Flow_SP4_6'], outgoing=['Flow_SP4_BuyMerge'])
    sp4_task_build_reqs = get_task('Task_DefineBuildReqs',
                                   incoming=['Flow_SP4_Build'], outgoing=['Flow_SP4_7'])

    sp4_timer_contract = extract_element(v4_text, 'Timer_ContractSLA')
    sp4_timer_contract = strip_flows(sp4_timer_contract)
    sp4_timer_contract = add_flows(sp4_timer_contract, outgoing=['Flow_SP4_SLA'])

    # SP_PDLC sub-process (nested inside SP4) - extract from v4
    sp_pdlc_block = extract_element(v4_text, 'SP_PDLC')
    sp_pdlc_block = strip_flows(sp_pdlc_block)
    sp_pdlc_block = add_flows(sp_pdlc_block, incoming=['Flow_SP4_7'], outgoing=['Flow_SP4_BuildMerge'])

    # -------------------------------------------------------------------------
    # SP5 internal elements
    # -------------------------------------------------------------------------
    sp5_task_uat = get_task('Task_PerformUAT',
                            incoming=['Flow_SP5_1'], outgoing=['Flow_SP5_2'])
    sp5_task_approval = get_task('Task_FinalApproval',
                                 incoming=['Flow_SP5_2'], outgoing=['Flow_SP5_3'])
    sp5_task_onboard = get_task('Task_OnboardSoftware',
                                incoming=['Flow_SP5_3'], outgoing=['Flow_SP5_4'])
    sp5_task_notify = get_task('Activity_0zf4l0g',
                               incoming=['Flow_SP5_4'], outgoing=['Flow_SP5_5'])
    sp5_task_close = get_task('Task_CloseRequest',
                              incoming=['Flow_SP5_5'], outgoing=['Flow_SP5_6'])

    # -------------------------------------------------------------------------
    # Vendor process (unchanged)
    # -------------------------------------------------------------------------
    vendor_process = extract_vendor_process(v4_text)

    # -------------------------------------------------------------------------
    # Build the XML
    # -------------------------------------------------------------------------

    xml = '''<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xmlns:camunda="http://camunda.org/schema/1.0/bpmn" id="Definitions_IdealState_v5" targetNamespace="http://sla.governance/bpmn/onboarding" exporter="Camunda Modeler" exporterVersion="5.42.0">
  <bpmn:collaboration id="Collaboration_IdealState_v5">
    <bpmn:participant id="Participant_Enterprise" name="Software Onboarding" processRef="Process_Onboarding_v5" />
    <bpmn:participant id="Participant_Vendor" name="Vendor / Third Party — External Software or Contracting" processRef="Process_Vendor" />
    <bpmn:messageFlow id="MsgFlow_DDRequest" name="Due Diligence Request" sourceRef="SP_EvalDD" targetRef="Start_VendorEngagement" />
    <bpmn:messageFlow id="MsgFlow_VendorResponse" name="Vendor Response" sourceRef="Task_VendorProposal" targetRef="SP_EvalDD" />
    <bpmn:messageFlow id="MsgFlow_ContractDraft" name="Contract Draft" sourceRef="SP_ContractBuild" targetRef="Task_VendorContractReview" />
    <bpmn:messageFlow id="MsgFlow_SignedContract" name="Signed Contract" sourceRef="Task_VendorContractSign" targetRef="SP_ContractBuild" />
  </bpmn:collaboration>
  <bpmn:process id="Process_Onboarding_v5" name="Product Management — Software Onboarding (Hierarchical)" isExecutable="false" camunda:historyTimeToLive="180">
    <bpmn:startEvent id="Start_SoftwareNeed" name="Software need&#10;defined">
      <bpmn:outgoing>Flow_v5_1</bpmn:outgoing>
    </bpmn:startEvent>

    <bpmn:subProcess id="SP_RequestTriage" name="SP1: Request&#10;and Triage">
      <bpmn:incoming>Flow_v5_1</bpmn:incoming>
      <bpmn:outgoing>Flow_v5_2</bpmn:outgoing>
      <bpmn:startEvent id="SP1_Start">
        <bpmn:outgoing>Flow_SP1_1</bpmn:outgoing>
      </bpmn:startEvent>
'''

    xml += reindent(sp1_task_review, '      ') + '\n'

    xml += '''      <bpmn:exclusiveGateway id="GW_BypassProcess" name="Bypass formal&#10;process?">
        <bpmn:incoming>Flow_SP1_2</bpmn:incoming>
        <bpmn:outgoing>Flow_SP1_Yes</bpmn:outgoing>
        <bpmn:outgoing>Flow_SP1_No</bpmn:outgoing>
      </bpmn:exclusiveGateway>
'''

    xml += reindent(sp1_task_leverage, '      ') + '\n'
    xml += '''      <bpmn:endEvent id="End_Leveraged" name="Software&#10;Leveraged">
        <bpmn:incoming>Flow_SP1_EndLev</bpmn:incoming>
      </bpmn:endEvent>
'''

    xml += reindent(sp1_task_gather, '      ') + '\n'
    xml += reindent(sp1_task_submit, '      ') + '\n'
    xml += reindent(sp1_task_triage, '      ') + '\n'
    xml += reindent(sp1_timer_triage, '      ') + '\n'

    xml += '''      <bpmn:endEvent id="End_TriageSLAEscalation" name="Triage SLA&#10;Escalation">
        <bpmn:incoming>Flow_SP1_SLA</bpmn:incoming>
      </bpmn:endEvent>
      <bpmn:endEvent id="SP1_End" name="Triage&#10;Complete">
        <bpmn:incoming>Flow_SP1_5</bpmn:incoming>
      </bpmn:endEvent>
      <bpmn:sequenceFlow id="Flow_SP1_1" sourceRef="SP1_Start" targetRef="Task_ReviewExisting" />
      <bpmn:sequenceFlow id="Flow_SP1_2" sourceRef="Task_ReviewExisting" targetRef="GW_BypassProcess" />
      <bpmn:sequenceFlow id="Flow_SP1_Yes" name="Yes" sourceRef="GW_BypassProcess" targetRef="Task_LeverageExisting" />
      <bpmn:sequenceFlow id="Flow_SP1_No" name="No" sourceRef="GW_BypassProcess" targetRef="Task_GatherDocs" />
      <bpmn:sequenceFlow id="Flow_SP1_EndLev" sourceRef="Task_LeverageExisting" targetRef="End_Leveraged" />
      <bpmn:sequenceFlow id="Flow_SP1_3" sourceRef="Task_GatherDocs" targetRef="Task_SubmitRequest" />
      <bpmn:sequenceFlow id="Flow_SP1_4" sourceRef="Task_SubmitRequest" targetRef="Task_InitialTriage" />
      <bpmn:sequenceFlow id="Flow_SP1_5" sourceRef="Task_InitialTriage" targetRef="SP1_End" />
      <bpmn:sequenceFlow id="Flow_SP1_SLA" sourceRef="Timer_TriageSLA" targetRef="End_TriageSLAEscalation" />
    </bpmn:subProcess>

    <bpmn:exclusiveGateway id="GW_TriageDecision" name="Approved ?">
      <bpmn:incoming>Flow_v5_2</bpmn:incoming>
      <bpmn:outgoing>Flow_v5_3</bpmn:outgoing>
      <bpmn:outgoing>Flow_v5_4</bpmn:outgoing>
    </bpmn:exclusiveGateway>

    <bpmn:subProcess id="SP_PlanningRouting" name="SP2: Planning&#10;and Routing">
      <bpmn:incoming>Flow_v5_3</bpmn:incoming>
      <bpmn:outgoing>Flow_v5_5</bpmn:outgoing>
      <bpmn:startEvent id="SP2_Start">
        <bpmn:outgoing>Flow_SP2_1</bpmn:outgoing>
      </bpmn:startEvent>
'''

    xml += reindent(sp2_task_prelim, '      ') + '\n'

    xml += '''      <bpmn:exclusiveGateway id="GW_NeedsAssessment" name="Needs further&#10;assessment?">
        <bpmn:incoming>Flow_SP2_2</bpmn:incoming>
        <bpmn:outgoing>Flow_SP2_Yes</bpmn:outgoing>
        <bpmn:outgoing>Flow_SP2_No</bpmn:outgoing>
      </bpmn:exclusiveGateway>
'''

    xml += reindent(sp2_task_backlog, '      ') + '\n'

    xml += '''      <bpmn:exclusiveGateway id="GW_MergeBacklog">
        <bpmn:incoming>Flow_SP2_No</bpmn:incoming>
        <bpmn:incoming>Flow_SP2_3</bpmn:incoming>
        <bpmn:outgoing>Flow_SP2_4</bpmn:outgoing>
      </bpmn:exclusiveGateway>
'''

    xml += reindent(sp2_task_pathway, '      ') + '\n'

    xml += '''      <bpmn:endEvent id="SP2_End">
        <bpmn:incoming>Flow_SP2_5</bpmn:incoming>
      </bpmn:endEvent>
      <bpmn:sequenceFlow id="Flow_SP2_1" sourceRef="SP2_Start" targetRef="Task_PrelimAnalysis" />
      <bpmn:sequenceFlow id="Flow_SP2_2" sourceRef="Task_PrelimAnalysis" targetRef="GW_NeedsAssessment" />
      <bpmn:sequenceFlow id="Flow_SP2_Yes" name="Yes" sourceRef="GW_NeedsAssessment" targetRef="Task_Backlog" />
      <bpmn:sequenceFlow id="Flow_SP2_No" name="No" sourceRef="GW_NeedsAssessment" targetRef="GW_MergeBacklog" />
      <bpmn:sequenceFlow id="Flow_SP2_3" sourceRef="Task_Backlog" targetRef="GW_MergeBacklog" />
      <bpmn:sequenceFlow id="Flow_SP2_4" sourceRef="GW_MergeBacklog" targetRef="Task_PathwayRouting" />
      <bpmn:sequenceFlow id="Flow_SP2_5" sourceRef="Task_PathwayRouting" targetRef="SP2_End" />
    </bpmn:subProcess>

    <bpmn:exclusiveGateway id="GW_BuyVsBuild" name="Do we Build ?">
      <bpmn:incoming>Flow_v5_5</bpmn:incoming>
      <bpmn:outgoing>Flow_v5_6</bpmn:outgoing>
      <bpmn:outgoing>Flow_v5_7</bpmn:outgoing>
    </bpmn:exclusiveGateway>

    <bpmn:subProcess id="SP_EvalDD" name="SP3: Evaluation&#10;and Due Diligence">
      <bpmn:incoming>Flow_v5_6</bpmn:incoming>
      <bpmn:outgoing>Flow_v5_8</bpmn:outgoing>
      <bpmn:startEvent id="SP3_Start">
        <bpmn:outgoing>Flow_SP3_1</bpmn:outgoing>
      </bpmn:startEvent>
      <bpmn:parallelGateway id="GW_ParallelSplit">
        <bpmn:incoming>Flow_SP3_1</bpmn:incoming>
        <bpmn:outgoing>Flow_SP3_P1</bpmn:outgoing>
        <bpmn:outgoing>Flow_SP3_P2</bpmn:outgoing>
        <bpmn:outgoing>Flow_SP3_P3</bpmn:outgoing>
        <bpmn:outgoing>Flow_SP3_P4</bpmn:outgoing>
        <bpmn:outgoing>Flow_SP3_P5</bpmn:outgoing>
      </bpmn:parallelGateway>
'''

    xml += reindent(sp3_task_tech, '      ') + '\n'
    xml += reindent(sp3_task_sec, '      ') + '\n'
    xml += reindent(sp3_task_risk, '      ') + '\n'
    xml += reindent(sp3_task_fin, '      ') + '\n'
    xml += reindent(sp3_task_vendor_landscape, '      ') + '\n'

    xml += '''      <bpmn:parallelGateway id="GW_ParallelJoin">
        <bpmn:incoming>Flow_SP3_P1J</bpmn:incoming>
        <bpmn:incoming>Flow_SP3_P2J</bpmn:incoming>
        <bpmn:incoming>Flow_SP3_P3J</bpmn:incoming>
        <bpmn:incoming>Flow_SP3_P4J</bpmn:incoming>
        <bpmn:incoming>Flow_SP3_P5J</bpmn:incoming>
        <bpmn:outgoing>Flow_SP3_2</bpmn:outgoing>
      </bpmn:parallelGateway>
'''

    xml += reindent(sp3_task_dd, '      ') + '\n'
    xml += reindent(sp3_recv_vendor, '      ') + '\n'
    xml += reindent(sp3_timer_vendor, '      ') + '\n'

    xml += '''      <bpmn:endEvent id="End_VendorResponseSLABreach" name="Vendor Response&#10;SLA Breach">
        <bpmn:incoming>Flow_SP3_SLA</bpmn:incoming>
      </bpmn:endEvent>
'''

    xml += reindent(sp3_task_eval, '      ') + '\n'

    xml += '''      <bpmn:endEvent id="SP3_End">
        <bpmn:incoming>Flow_SP3_5</bpmn:incoming>
      </bpmn:endEvent>
      <bpmn:sequenceFlow id="Flow_SP3_1" sourceRef="SP3_Start" targetRef="GW_ParallelSplit" />
      <bpmn:sequenceFlow id="Flow_SP3_P1" sourceRef="GW_ParallelSplit" targetRef="Task_TechArchReview" />
      <bpmn:sequenceFlow id="Flow_SP3_P2" sourceRef="GW_ParallelSplit" targetRef="Task_SecurityAssessment" />
      <bpmn:sequenceFlow id="Flow_SP3_P3" sourceRef="GW_ParallelSplit" targetRef="Task_RiskCompliance" />
      <bpmn:sequenceFlow id="Flow_SP3_P4" sourceRef="GW_ParallelSplit" targetRef="Task_FinancialAnalysis" />
      <bpmn:sequenceFlow id="Flow_SP3_P5" sourceRef="GW_ParallelSplit" targetRef="Task_AssessVendorLandscape" />
      <bpmn:sequenceFlow id="Flow_SP3_P1J" sourceRef="Task_TechArchReview" targetRef="GW_ParallelJoin" />
      <bpmn:sequenceFlow id="Flow_SP3_P2J" sourceRef="Task_SecurityAssessment" targetRef="GW_ParallelJoin" />
      <bpmn:sequenceFlow id="Flow_SP3_P3J" sourceRef="Task_RiskCompliance" targetRef="GW_ParallelJoin" />
      <bpmn:sequenceFlow id="Flow_SP3_P4J" sourceRef="Task_FinancialAnalysis" targetRef="GW_ParallelJoin" />
      <bpmn:sequenceFlow id="Flow_SP3_P5J" sourceRef="Task_AssessVendorLandscape" targetRef="GW_ParallelJoin" />
      <bpmn:sequenceFlow id="Flow_SP3_2" sourceRef="GW_ParallelJoin" targetRef="Task_VendorDueDiligence" />
      <bpmn:sequenceFlow id="Flow_SP3_3" sourceRef="Task_VendorDueDiligence" targetRef="Receive_VendorResponse" />
      <bpmn:sequenceFlow id="Flow_SP3_4" sourceRef="Receive_VendorResponse" targetRef="Task_EvaluateVendorResponse" />
      <bpmn:sequenceFlow id="Flow_SP3_5" sourceRef="Task_EvaluateVendorResponse" targetRef="SP3_End" />
      <bpmn:sequenceFlow id="Flow_SP3_SLA" sourceRef="Timer_VendorResponseSLA" targetRef="End_VendorResponseSLABreach" />
    </bpmn:subProcess>

    <bpmn:exclusiveGateway id="GW_VendorSelected" name="Vendor&#10;Selected?">
      <bpmn:incoming>Flow_v5_8</bpmn:incoming>
      <bpmn:outgoing>Flow_v5_9</bpmn:outgoing>
      <bpmn:outgoing>Flow_v5_10</bpmn:outgoing>
    </bpmn:exclusiveGateway>

    <bpmn:exclusiveGateway id="GW_EvalApproved" name="Evaluation&#10;Approved?">
      <bpmn:incoming>Flow_v5_10</bpmn:incoming>
      <bpmn:outgoing>Flow_v5_11</bpmn:outgoing>
      <bpmn:outgoing>Flow_v5_12</bpmn:outgoing>
    </bpmn:exclusiveGateway>

    <bpmn:subProcess id="SP_ContractBuild" name="SP4: Contracting&#10;and Build">
      <bpmn:incoming>Flow_v5_7</bpmn:incoming>
      <bpmn:incoming>Flow_v5_12</bpmn:incoming>
      <bpmn:outgoing>Flow_v5_13</bpmn:outgoing>
      <bpmn:startEvent id="SP4_Start">
        <bpmn:outgoing>Flow_SP4_1</bpmn:outgoing>
      </bpmn:startEvent>
      <bpmn:exclusiveGateway id="GW_PathwayExec" name="Pathway&#10;Execution">
        <bpmn:incoming>Flow_SP4_1</bpmn:incoming>
        <bpmn:outgoing>Flow_SP4_Buy</bpmn:outgoing>
        <bpmn:outgoing>Flow_SP4_Build</bpmn:outgoing>
      </bpmn:exclusiveGateway>
'''

    xml += reindent(sp4_task_refine, '      ') + '\n'
    xml += reindent(sp4_task_poc, '      ') + '\n'
    xml += reindent(sp4_task_tech_risk, '      ') + '\n'
    xml += reindent(sp4_task_negotiate, '      ') + '\n'
    xml += reindent(sp4_recv_signed, '      ') + '\n'
    xml += reindent(sp4_timer_contract, '      ') + '\n'

    xml += '''      <bpmn:endEvent id="End_ContractSLABreach" name="Contract&#10;SLA Breach">
        <bpmn:incoming>Flow_SP4_SLA</bpmn:incoming>
      </bpmn:endEvent>
'''

    xml += reindent(sp4_task_finalize, '      ') + '\n'
    xml += reindent(sp4_task_build_reqs, '      ') + '\n'
    xml += reindent(sp_pdlc_block, '      ') + '\n'

    xml += '''      <bpmn:exclusiveGateway id="GW_MergeExec">
        <bpmn:incoming>Flow_SP4_BuyMerge</bpmn:incoming>
        <bpmn:incoming>Flow_SP4_BuildMerge</bpmn:incoming>
        <bpmn:outgoing>Flow_SP4_8</bpmn:outgoing>
      </bpmn:exclusiveGateway>
      <bpmn:endEvent id="SP4_End">
        <bpmn:incoming>Flow_SP4_8</bpmn:incoming>
      </bpmn:endEvent>
      <bpmn:sequenceFlow id="Flow_SP4_1" sourceRef="SP4_Start" targetRef="GW_PathwayExec" />
      <bpmn:sequenceFlow id="Flow_SP4_Buy" name="No" sourceRef="GW_PathwayExec" targetRef="Task_RefineRequirements" />
      <bpmn:sequenceFlow id="Flow_SP4_Build" name="Yes" sourceRef="GW_PathwayExec" targetRef="Task_DefineBuildReqs" />
      <bpmn:sequenceFlow id="Flow_SP4_2" sourceRef="Task_RefineRequirements" targetRef="Task_PerformPoC" />
      <bpmn:sequenceFlow id="Flow_SP4_3" sourceRef="Task_PerformPoC" targetRef="Task_TechRiskEval" />
      <bpmn:sequenceFlow id="Flow_SP4_4" sourceRef="Task_TechRiskEval" targetRef="Task_NegotiateContract" />
      <bpmn:sequenceFlow id="Flow_SP4_5" sourceRef="Task_NegotiateContract" targetRef="Receive_SignedContract" />
      <bpmn:sequenceFlow id="Flow_SP4_6" sourceRef="Receive_SignedContract" targetRef="Task_FinalizeContract" />
      <bpmn:sequenceFlow id="Flow_SP4_BuyMerge" sourceRef="Task_FinalizeContract" targetRef="GW_MergeExec" />
      <bpmn:sequenceFlow id="Flow_SP4_7" sourceRef="Task_DefineBuildReqs" targetRef="SP_PDLC" />
      <bpmn:sequenceFlow id="Flow_SP4_BuildMerge" sourceRef="SP_PDLC" targetRef="GW_MergeExec" />
      <bpmn:sequenceFlow id="Flow_SP4_8" sourceRef="GW_MergeExec" targetRef="SP4_End" />
      <bpmn:sequenceFlow id="Flow_SP4_SLA" sourceRef="Timer_ContractSLA" targetRef="End_ContractSLABreach" />
    </bpmn:subProcess>

    <bpmn:subProcess id="SP_UATGoLive" name="SP5: UAT&#10;and Go-Live">
      <bpmn:incoming>Flow_v5_13</bpmn:incoming>
      <bpmn:outgoing>Flow_v5_14</bpmn:outgoing>
      <bpmn:startEvent id="SP5_Start">
        <bpmn:outgoing>Flow_SP5_1</bpmn:outgoing>
      </bpmn:startEvent>
'''

    xml += reindent(sp5_task_uat, '      ') + '\n'
    xml += reindent(sp5_task_approval, '      ') + '\n'
    xml += reindent(sp5_task_onboard, '      ') + '\n'
    xml += reindent(sp5_task_notify, '      ') + '\n'
    xml += reindent(sp5_task_close, '      ') + '\n'

    xml += '''      <bpmn:endEvent id="SP5_End">
        <bpmn:incoming>Flow_SP5_6</bpmn:incoming>
      </bpmn:endEvent>
      <bpmn:sequenceFlow id="Flow_SP5_1" sourceRef="SP5_Start" targetRef="Task_PerformUAT" />
      <bpmn:sequenceFlow id="Flow_SP5_2" sourceRef="Task_PerformUAT" targetRef="Task_FinalApproval" />
      <bpmn:sequenceFlow id="Flow_SP5_3" sourceRef="Task_FinalApproval" targetRef="Task_OnboardSoftware" />
      <bpmn:sequenceFlow id="Flow_SP5_4" sourceRef="Task_OnboardSoftware" targetRef="Activity_0zf4l0g" />
      <bpmn:sequenceFlow id="Flow_SP5_5" sourceRef="Activity_0zf4l0g" targetRef="Task_CloseRequest" />
      <bpmn:sequenceFlow id="Flow_SP5_6" sourceRef="Task_CloseRequest" targetRef="SP5_End" />
    </bpmn:subProcess>

    <bpmn:exclusiveGateway id="GW_FinalDecision" name="Approved?">
      <bpmn:incoming>Flow_v5_14</bpmn:incoming>
      <bpmn:outgoing>Flow_v5_15</bpmn:outgoing>
      <bpmn:outgoing>Flow_v5_16</bpmn:outgoing>
    </bpmn:exclusiveGateway>

    <bpmn:endEvent id="End_SoftwareOnboarded" name="Software&#10;Onboarded">
      <bpmn:incoming>Flow_v5_15</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:endEvent id="End_Rejected" name="Request&#10;Rejected">
      <bpmn:incoming>Flow_v5_4</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:endEvent id="End_VendorNotSelected" name="Vendor&#10;Not Selected">
      <bpmn:incoming>Flow_v5_9</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:endEvent id="End_EvalRejected" name="Evaluation&#10;Failed">
      <bpmn:incoming>Flow_v5_11</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:endEvent id="End_FinalRejected" name="Request&#10;Denied">
      <bpmn:incoming>Flow_v5_16</bpmn:incoming>
    </bpmn:endEvent>

    <bpmn:sequenceFlow id="Flow_v5_1" sourceRef="Start_SoftwareNeed" targetRef="SP_RequestTriage" />
    <bpmn:sequenceFlow id="Flow_v5_2" sourceRef="SP_RequestTriage" targetRef="GW_TriageDecision" />
    <bpmn:sequenceFlow id="Flow_v5_3" name="Yes" sourceRef="GW_TriageDecision" targetRef="SP_PlanningRouting" />
    <bpmn:sequenceFlow id="Flow_v5_4" name="No" sourceRef="GW_TriageDecision" targetRef="End_Rejected" />
    <bpmn:sequenceFlow id="Flow_v5_5" sourceRef="SP_PlanningRouting" targetRef="GW_BuyVsBuild" />
    <bpmn:sequenceFlow id="Flow_v5_6" name="No" sourceRef="GW_BuyVsBuild" targetRef="SP_EvalDD" />
    <bpmn:sequenceFlow id="Flow_v5_7" name="Yes" sourceRef="GW_BuyVsBuild" targetRef="SP_ContractBuild" />
    <bpmn:sequenceFlow id="Flow_v5_8" sourceRef="SP_EvalDD" targetRef="GW_VendorSelected" />
    <bpmn:sequenceFlow id="Flow_v5_9" name="No" sourceRef="GW_VendorSelected" targetRef="End_VendorNotSelected" />
    <bpmn:sequenceFlow id="Flow_v5_10" name="Yes" sourceRef="GW_VendorSelected" targetRef="GW_EvalApproved" />
    <bpmn:sequenceFlow id="Flow_v5_11" name="No" sourceRef="GW_EvalApproved" targetRef="End_EvalRejected" />
    <bpmn:sequenceFlow id="Flow_v5_12" name="Yes" sourceRef="GW_EvalApproved" targetRef="SP_ContractBuild" />
    <bpmn:sequenceFlow id="Flow_v5_13" sourceRef="SP_ContractBuild" targetRef="SP_UATGoLive" />
    <bpmn:sequenceFlow id="Flow_v5_14" sourceRef="SP_UATGoLive" targetRef="GW_FinalDecision" />
    <bpmn:sequenceFlow id="Flow_v5_15" name="Yes" sourceRef="GW_FinalDecision" targetRef="End_SoftwareOnboarded" />
    <bpmn:sequenceFlow id="Flow_v5_16" name="No" sourceRef="GW_FinalDecision" targetRef="End_FinalRejected" />
  </bpmn:process>
'''

    xml += '  ' + vendor_process + '\n'

    # -------------------------------------------------------------------------
    # DI Section
    # -------------------------------------------------------------------------
    xml += '''  <bpmndi:BPMNDiagram id="BPMNDiagram_Main">
    <bpmndi:BPMNPlane id="BPMNPlane_Main" bpmnElement="Collaboration_IdealState_v5">
      <bpmndi:BPMNShape id="Participant_Enterprise_di" bpmnElement="Participant_Enterprise" isHorizontal="true">
        <dc:Bounds x="160" y="60" width="1800" height="280" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Start_SoftwareNeed_di" bpmnElement="Start_SoftwareNeed">
        <dc:Bounds x="200" y="102" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="183" y="145" width="73" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="SP_RequestTriage_di" bpmnElement="SP_RequestTriage" isExpanded="false">
        <dc:Bounds x="290" y="80" width="100" height="80" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="296" y="104" width="88" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="GW_TriageDecision_di" bpmnElement="GW_TriageDecision" isMarkerVisible="true">
        <dc:Bounds x="445" y="95" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="442" y="73" width="57" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="SP_PlanningRouting_di" bpmnElement="SP_PlanningRouting" isExpanded="false">
        <dc:Bounds x="550" y="80" width="100" height="80" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="556" y="104" width="88" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="GW_BuyVsBuild_di" bpmnElement="GW_BuyVsBuild" isMarkerVisible="true">
        <dc:Bounds x="705" y="95" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="697" y="73" width="68" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="SP_EvalDD_di" bpmnElement="SP_EvalDD" isExpanded="false">
        <dc:Bounds x="810" y="80" width="100" height="80" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="816" y="104" width="88" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="GW_VendorSelected_di" bpmnElement="GW_VendorSelected" isMarkerVisible="true">
        <dc:Bounds x="965" y="95" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="957" y="73" width="68" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="GW_EvalApproved_di" bpmnElement="GW_EvalApproved" isMarkerVisible="true">
        <dc:Bounds x="1070" y="95" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1057" y="73" width="77" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="SP_ContractBuild_di" bpmnElement="SP_ContractBuild" isExpanded="false">
        <dc:Bounds x="1175" y="80" width="100" height="80" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1181" y="104" width="88" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="SP_UATGoLive_di" bpmnElement="SP_UATGoLive" isExpanded="false">
        <dc:Bounds x="1330" y="80" width="100" height="80" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1336" y="104" width="88" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="GW_FinalDecision_di" bpmnElement="GW_FinalDecision" isMarkerVisible="true">
        <dc:Bounds x="1485" y="95" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1482" y="73" width="57" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_SoftwareOnboarded_di" bpmnElement="End_SoftwareOnboarded">
        <dc:Bounds x="1590" y="102" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1573" y="145" width="73" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_Rejected_di" bpmnElement="End_Rejected">
        <dc:Bounds x="462" y="240" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="449" y="283" width="63" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_VendorNotSelected_di" bpmnElement="End_VendorNotSelected">
        <dc:Bounds x="982" y="240" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="963" y="283" width="75" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_EvalRejected_di" bpmnElement="End_EvalRejected">
        <dc:Bounds x="1087" y="240" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1068" y="283" width="75" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_FinalRejected_di" bpmnElement="End_FinalRejected">
        <dc:Bounds x="1502" y="240" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1489" y="283" width="63" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Participant_Vendor_di" bpmnElement="Participant_Vendor" isHorizontal="true">
        <dc:Bounds x="160" y="420" width="1800" height="360" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Start_VendorEngagement_di" bpmnElement="Start_VendorEngagement">
        <dc:Bounds x="222" y="542" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="200" y="585" width="81" height="40" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_VendorIntake_di" bpmnElement="Task_VendorIntake">
        <dc:Bounds x="310" y="520" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="GW_VendorQualified_di" bpmnElement="GW_VendorQualified" isMarkerVisible="true">
        <dc:Bounds x="465" y="535" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="457" y="513" width="68" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_VendorProposal_di" bpmnElement="Task_VendorProposal">
        <dc:Bounds x="570" y="520" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="GW_VendorParSplit_di" bpmnElement="GW_VendorParSplit">
        <dc:Bounds x="725" y="535" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_VendorSecurityReview_di" bpmnElement="Task_VendorSecurityReview">
        <dc:Bounds x="830" y="460" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_VendorComplianceReview_di" bpmnElement="Task_VendorComplianceReview">
        <dc:Bounds x="830" y="560" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_VendorTechDemo_di" bpmnElement="Task_VendorTechDemo">
        <dc:Bounds x="830" y="660" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="GW_VendorParJoin_di" bpmnElement="GW_VendorParJoin">
        <dc:Bounds x="985" y="535" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_VendorContractReview_di" bpmnElement="Task_VendorContractReview">
        <dc:Bounds x="1090" y="520" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_VendorContractSign_di" bpmnElement="Task_VendorContractSign">
        <dc:Bounds x="1250" y="520" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_VendorOnboarding_di" bpmnElement="Task_VendorOnboarding">
        <dc:Bounds x="1410" y="520" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_VendorDeploySupport_di" bpmnElement="Task_VendorDeploySupport">
        <dc:Bounds x="1570" y="520" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_VendorCloseRequest_di" bpmnElement="Task_VendorCloseRequest">
        <dc:Bounds x="1730" y="520" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_VendorComplete_di" bpmnElement="End_VendorComplete">
        <dc:Bounds x="1882" y="542" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1860" y="585" width="81" height="40" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_VendorDisqualified_di" bpmnElement="End_VendorDisqualified">
        <dc:Bounds x="482" y="660" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="460" y="703" width="81" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_v5_1_di" bpmnElement="Flow_v5_1">
        <di:waypoint x="236" y="120" />
        <di:waypoint x="290" y="120" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_v5_2_di" bpmnElement="Flow_v5_2">
        <di:waypoint x="390" y="120" />
        <di:waypoint x="445" y="120" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_v5_3_di" bpmnElement="Flow_v5_3">
        <di:waypoint x="495" y="120" />
        <di:waypoint x="550" y="120" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="514" y="103" width="18" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_v5_4_di" bpmnElement="Flow_v5_4">
        <di:waypoint x="470" y="145" />
        <di:waypoint x="470" y="240" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="478" y="185" width="15" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_v5_5_di" bpmnElement="Flow_v5_5">
        <di:waypoint x="650" y="120" />
        <di:waypoint x="705" y="120" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_v5_6_di" bpmnElement="Flow_v5_6">
        <di:waypoint x="755" y="120" />
        <di:waypoint x="810" y="120" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="774" y="103" width="15" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_v5_7_di" bpmnElement="Flow_v5_7">
        <di:waypoint x="730" y="95" />
        <di:waypoint x="730" y="50" />
        <di:waypoint x="1225" y="50" />
        <di:waypoint x="1225" y="80" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="966" y="33" width="18" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_v5_8_di" bpmnElement="Flow_v5_8">
        <di:waypoint x="910" y="120" />
        <di:waypoint x="965" y="120" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_v5_9_di" bpmnElement="Flow_v5_9">
        <di:waypoint x="990" y="145" />
        <di:waypoint x="990" y="240" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="998" y="185" width="15" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_v5_10_di" bpmnElement="Flow_v5_10">
        <di:waypoint x="1015" y="120" />
        <di:waypoint x="1070" y="120" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1034" y="103" width="18" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_v5_11_di" bpmnElement="Flow_v5_11">
        <di:waypoint x="1095" y="145" />
        <di:waypoint x="1095" y="240" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1103" y="185" width="15" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_v5_12_di" bpmnElement="Flow_v5_12">
        <di:waypoint x="1120" y="120" />
        <di:waypoint x="1175" y="120" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1139" y="103" width="18" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_v5_13_di" bpmnElement="Flow_v5_13">
        <di:waypoint x="1275" y="120" />
        <di:waypoint x="1330" y="120" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_v5_14_di" bpmnElement="Flow_v5_14">
        <di:waypoint x="1430" y="120" />
        <di:waypoint x="1485" y="120" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_v5_15_di" bpmnElement="Flow_v5_15">
        <di:waypoint x="1535" y="120" />
        <di:waypoint x="1590" y="120" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1554" y="103" width="18" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_v5_16_di" bpmnElement="Flow_v5_16">
        <di:waypoint x="1510" y="145" />
        <di:waypoint x="1510" y="240" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1518" y="185" width="15" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="MsgFlow_DDRequest_di" bpmnElement="MsgFlow_DDRequest">
        <di:waypoint x="860" y="160" />
        <di:waypoint x="860" y="350" />
        <di:waypoint x="240" y="350" />
        <di:waypoint x="240" y="542" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="490" y="333" width="110" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="MsgFlow_VendorResponse_di" bpmnElement="MsgFlow_VendorResponse">
        <di:waypoint x="620" y="520" />
        <di:waypoint x="620" y="350" />
        <di:waypoint x="860" y="350" />
        <di:waypoint x="860" y="160" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="700" y="333" width="84" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="MsgFlow_ContractDraft_di" bpmnElement="MsgFlow_ContractDraft">
        <di:waypoint x="1225" y="160" />
        <di:waypoint x="1225" y="350" />
        <di:waypoint x="1140" y="350" />
        <di:waypoint x="1140" y="520" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1143" y="333" width="74" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="MsgFlow_SignedContract_di" bpmnElement="MsgFlow_SignedContract">
        <di:waypoint x="1300" y="520" />
        <di:waypoint x="1300" y="350" />
        <di:waypoint x="1225" y="350" />
        <di:waypoint x="1225" y="160" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1220" y="333" width="84" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_V1_di" bpmnElement="Flow_V1">
        <di:waypoint x="258" y="560" />
        <di:waypoint x="310" y="560" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_V2_di" bpmnElement="Flow_V2">
        <di:waypoint x="410" y="560" />
        <di:waypoint x="465" y="560" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_V_QualYes_di" bpmnElement="Flow_V_QualYes">
        <di:waypoint x="515" y="560" />
        <di:waypoint x="570" y="560" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="534" y="543" width="18" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_V_QualNo_di" bpmnElement="Flow_V_QualNo">
        <di:waypoint x="490" y="585" />
        <di:waypoint x="490" y="660" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="498" y="620" width="15" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_V3_di" bpmnElement="Flow_V3">
        <di:waypoint x="670" y="560" />
        <di:waypoint x="725" y="560" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_V_VP1_di" bpmnElement="Flow_V_VP1">
        <di:waypoint x="750" y="535" />
        <di:waypoint x="750" y="500" />
        <di:waypoint x="830" y="500" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_V_VP2_di" bpmnElement="Flow_V_VP2">
        <di:waypoint x="775" y="560" />
        <di:waypoint x="830" y="560" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_V_VP3_di" bpmnElement="Flow_V_VP3">
        <di:waypoint x="750" y="585" />
        <di:waypoint x="750" y="700" />
        <di:waypoint x="830" y="700" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_V_VP1J_di" bpmnElement="Flow_V_VP1J">
        <di:waypoint x="930" y="500" />
        <di:waypoint x="1010" y="500" />
        <di:waypoint x="1010" y="535" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_V_VP2J_di" bpmnElement="Flow_V_VP2J">
        <di:waypoint x="930" y="600" />
        <di:waypoint x="985" y="600" />
        <di:waypoint x="985" y="560" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_V_VP3J_di" bpmnElement="Flow_V_VP3J">
        <di:waypoint x="930" y="700" />
        <di:waypoint x="1010" y="700" />
        <di:waypoint x="1010" y="585" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_V4_di" bpmnElement="Flow_V4">
        <di:waypoint x="1035" y="560" />
        <di:waypoint x="1090" y="560" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_V5_di" bpmnElement="Flow_V5">
        <di:waypoint x="1190" y="560" />
        <di:waypoint x="1250" y="560" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_V6_di" bpmnElement="Flow_V6">
        <di:waypoint x="1350" y="560" />
        <di:waypoint x="1410" y="560" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_V7_di" bpmnElement="Flow_V7">
        <di:waypoint x="1510" y="560" />
        <di:waypoint x="1570" y="560" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_V8_di" bpmnElement="Flow_V8">
        <di:waypoint x="1670" y="560" />
        <di:waypoint x="1730" y="560" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_V_End_di" bpmnElement="Flow_V_End">
        <di:waypoint x="1830" y="560" />
        <di:waypoint x="1882" y="560" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
'''

    # SP1 diagram
    xml += '''  <bpmndi:BPMNDiagram id="BPMNDiagram_SP1">
    <bpmndi:BPMNPlane id="BPMNPlane_SP1" bpmnElement="SP_RequestTriage">
      <bpmndi:BPMNShape id="SP1_Start_di" bpmnElement="SP1_Start">
        <dc:Bounds x="180" y="182" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_ReviewExisting_di" bpmnElement="Task_ReviewExisting">
        <dc:Bounds x="270" y="160" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="GW_BypassProcess_di" bpmnElement="GW_BypassProcess" isMarkerVisible="true">
        <dc:Bounds x="425" y="175" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="407" y="145" width="87" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_LeverageExisting_di" bpmnElement="Task_LeverageExisting">
        <dc:Bounds x="530" y="80" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_Leveraged_di" bpmnElement="End_Leveraged">
        <dc:Bounds x="692" y="102" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="675" y="145" width="73" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_GatherDocs_di" bpmnElement="Task_GatherDocs">
        <dc:Bounds x="530" y="260" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_SubmitRequest_di" bpmnElement="Task_SubmitRequest">
        <dc:Bounds x="690" y="260" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_InitialTriage_di" bpmnElement="Task_InitialTriage">
        <dc:Bounds x="850" y="160" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Timer_TriageSLA_di" bpmnElement="Timer_TriageSLA">
        <dc:Bounds x="882" y="222" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="926" y="226" width="46" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_TriageSLAEscalation_di" bpmnElement="End_TriageSLAEscalation">
        <dc:Bounds x="932" y="282" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="910" y="325" width="81" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="SP1_End_di" bpmnElement="SP1_End">
        <dc:Bounds x="1012" y="182" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="995" y="225" width="73" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_SP1_1_di" bpmnElement="Flow_SP1_1">
        <di:waypoint x="216" y="200" />
        <di:waypoint x="270" y="200" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_SP1_2_di" bpmnElement="Flow_SP1_2">
        <di:waypoint x="370" y="200" />
        <di:waypoint x="425" y="200" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_SP1_Yes_di" bpmnElement="Flow_SP1_Yes">
        <di:waypoint x="450" y="175" />
        <di:waypoint x="450" y="120" />
        <di:waypoint x="530" y="120" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="458" y="140" width="18" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_SP1_No_di" bpmnElement="Flow_SP1_No">
        <di:waypoint x="450" y="225" />
        <di:waypoint x="450" y="300" />
        <di:waypoint x="530" y="300" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="458" y="255" width="15" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_SP1_EndLev_di" bpmnElement="Flow_SP1_EndLev">
        <di:waypoint x="630" y="120" />
        <di:waypoint x="692" y="120" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_SP1_3_di" bpmnElement="Flow_SP1_3">
        <di:waypoint x="630" y="300" />
        <di:waypoint x="690" y="300" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_SP1_4_di" bpmnElement="Flow_SP1_4">
        <di:waypoint x="790" y="300" />
        <di:waypoint x="900" y="300" />
        <di:waypoint x="900" y="240" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_SP1_5_di" bpmnElement="Flow_SP1_5">
        <di:waypoint x="950" y="200" />
        <di:waypoint x="1012" y="200" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_SP1_SLA_di" bpmnElement="Flow_SP1_SLA">
        <di:waypoint x="900" y="258" />
        <di:waypoint x="900" y="300" />
        <di:waypoint x="932" y="300" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
'''

    # SP2 diagram
    xml += '''  <bpmndi:BPMNDiagram id="BPMNDiagram_SP2">
    <bpmndi:BPMNPlane id="BPMNPlane_SP2" bpmnElement="SP_PlanningRouting">
      <bpmndi:BPMNShape id="SP2_Start_di" bpmnElement="SP2_Start">
        <dc:Bounds x="180" y="182" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_PrelimAnalysis_di" bpmnElement="Task_PrelimAnalysis">
        <dc:Bounds x="270" y="160" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="GW_NeedsAssessment_di" bpmnElement="GW_NeedsAssessment" isMarkerVisible="true">
        <dc:Bounds x="425" y="175" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="407" y="145" width="88" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Backlog_di" bpmnElement="Task_Backlog">
        <dc:Bounds x="425" y="310" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="GW_MergeBacklog_di" bpmnElement="GW_MergeBacklog" isMarkerVisible="true">
        <dc:Bounds x="575" y="175" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_PathwayRouting_di" bpmnElement="Task_PathwayRouting">
        <dc:Bounds x="680" y="160" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="SP2_End_di" bpmnElement="SP2_End">
        <dc:Bounds x="842" y="182" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_SP2_1_di" bpmnElement="Flow_SP2_1">
        <di:waypoint x="216" y="200" />
        <di:waypoint x="270" y="200" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_SP2_2_di" bpmnElement="Flow_SP2_2">
        <di:waypoint x="370" y="200" />
        <di:waypoint x="425" y="200" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_SP2_Yes_di" bpmnElement="Flow_SP2_Yes">
        <di:waypoint x="450" y="225" />
        <di:waypoint x="450" y="310" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="458" y="260" width="18" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_SP2_No_di" bpmnElement="Flow_SP2_No">
        <di:waypoint x="475" y="200" />
        <di:waypoint x="575" y="200" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="512" y="183" width="15" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_SP2_3_di" bpmnElement="Flow_SP2_3">
        <di:waypoint x="525" y="350" />
        <di:waypoint x="600" y="350" />
        <di:waypoint x="600" y="225" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_SP2_4_di" bpmnElement="Flow_SP2_4">
        <di:waypoint x="625" y="200" />
        <di:waypoint x="680" y="200" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_SP2_5_di" bpmnElement="Flow_SP2_5">
        <di:waypoint x="780" y="200" />
        <di:waypoint x="842" y="200" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
'''

    # SP3 diagram
    xml += '''  <bpmndi:BPMNDiagram id="BPMNDiagram_SP3">
    <bpmndi:BPMNPlane id="BPMNPlane_SP3" bpmnElement="SP_EvalDD">
      <bpmndi:BPMNShape id="SP3_Start_di" bpmnElement="SP3_Start">
        <dc:Bounds x="180" y="342" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="GW_ParallelSplit_di" bpmnElement="GW_ParallelSplit">
        <dc:Bounds x="270" y="317" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_TechArchReview_di" bpmnElement="Task_TechArchReview">
        <dc:Bounds x="380" y="80" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_SecurityAssessment_di" bpmnElement="Task_SecurityAssessment">
        <dc:Bounds x="380" y="200" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_RiskCompliance_di" bpmnElement="Task_RiskCompliance">
        <dc:Bounds x="380" y="300" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_FinancialAnalysis_di" bpmnElement="Task_FinancialAnalysis">
        <dc:Bounds x="380" y="400" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_AssessVendorLandscape_di" bpmnElement="Task_AssessVendorLandscape">
        <dc:Bounds x="380" y="500" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="GW_ParallelJoin_di" bpmnElement="GW_ParallelJoin">
        <dc:Bounds x="540" y="317" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_VendorDueDiligence_di" bpmnElement="Task_VendorDueDiligence">
        <dc:Bounds x="650" y="300" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Receive_VendorResponse_di" bpmnElement="Receive_VendorResponse">
        <dc:Bounds x="810" y="300" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Timer_VendorResponseSLA_di" bpmnElement="Timer_VendorResponseSLA">
        <dc:Bounds x="842" y="362" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="886" y="366" width="46" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_VendorResponseSLABreach_di" bpmnElement="End_VendorResponseSLABreach">
        <dc:Bounds x="892" y="422" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="870" y="465" width="81" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_EvaluateVendorResponse_di" bpmnElement="Task_EvaluateVendorResponse">
        <dc:Bounds x="970" y="300" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="SP3_End_di" bpmnElement="SP3_End">
        <dc:Bounds x="1132" y="322" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_SP3_1_di" bpmnElement="Flow_SP3_1">
        <di:waypoint x="216" y="360" />
        <di:waypoint x="270" y="360" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_SP3_P1_di" bpmnElement="Flow_SP3_P1">
        <di:waypoint x="295" y="317" />
        <di:waypoint x="295" y="120" />
        <di:waypoint x="380" y="120" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_SP3_P2_di" bpmnElement="Flow_SP3_P2">
        <di:waypoint x="295" y="317" />
        <di:waypoint x="295" y="240" />
        <di:waypoint x="380" y="240" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_SP3_P3_di" bpmnElement="Flow_SP3_P3">
        <di:waypoint x="320" y="342" />
        <di:waypoint x="380" y="342" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_SP3_P4_di" bpmnElement="Flow_SP3_P4">
        <di:waypoint x="295" y="367" />
        <di:waypoint x="295" y="440" />
        <di:waypoint x="380" y="440" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_SP3_P5_di" bpmnElement="Flow_SP3_P5">
        <di:waypoint x="295" y="367" />
        <di:waypoint x="295" y="540" />
        <di:waypoint x="380" y="540" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_SP3_P1J_di" bpmnElement="Flow_SP3_P1J">
        <di:waypoint x="480" y="120" />
        <di:waypoint x="565" y="120" />
        <di:waypoint x="565" y="317" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_SP3_P2J_di" bpmnElement="Flow_SP3_P2J">
        <di:waypoint x="480" y="240" />
        <di:waypoint x="565" y="240" />
        <di:waypoint x="565" y="317" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_SP3_P3J_di" bpmnElement="Flow_SP3_P3J">
        <di:waypoint x="480" y="342" />
        <di:waypoint x="540" y="342" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_SP3_P4J_di" bpmnElement="Flow_SP3_P4J">
        <di:waypoint x="480" y="440" />
        <di:waypoint x="565" y="440" />
        <di:waypoint x="565" y="367" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_SP3_P5J_di" bpmnElement="Flow_SP3_P5J">
        <di:waypoint x="480" y="540" />
        <di:waypoint x="565" y="540" />
        <di:waypoint x="565" y="367" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_SP3_2_di" bpmnElement="Flow_SP3_2">
        <di:waypoint x="590" y="342" />
        <di:waypoint x="650" y="342" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_SP3_3_di" bpmnElement="Flow_SP3_3">
        <di:waypoint x="750" y="340" />
        <di:waypoint x="810" y="340" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_SP3_4_di" bpmnElement="Flow_SP3_4">
        <di:waypoint x="910" y="340" />
        <di:waypoint x="970" y="340" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_SP3_5_di" bpmnElement="Flow_SP3_5">
        <di:waypoint x="1070" y="340" />
        <di:waypoint x="1132" y="340" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_SP3_SLA_di" bpmnElement="Flow_SP3_SLA">
        <di:waypoint x="860" y="398" />
        <di:waypoint x="860" y="440" />
        <di:waypoint x="892" y="440" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
'''

    # SP4 diagram
    xml += '''  <bpmndi:BPMNDiagram id="BPMNDiagram_SP4">
    <bpmndi:BPMNPlane id="BPMNPlane_SP4" bpmnElement="SP_ContractBuild">
      <bpmndi:BPMNShape id="SP4_Start_di" bpmnElement="SP4_Start">
        <dc:Bounds x="180" y="282" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="GW_PathwayExec_di" bpmnElement="GW_PathwayExec" isMarkerVisible="true">
        <dc:Bounds x="270" y="257" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="262" y="227" width="68" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_RefineRequirements_di" bpmnElement="Task_RefineRequirements">
        <dc:Bounds x="380" y="120" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_PerformPoC_di" bpmnElement="Task_PerformPoC">
        <dc:Bounds x="540" y="120" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_TechRiskEval_di" bpmnElement="Task_TechRiskEval">
        <dc:Bounds x="700" y="120" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_NegotiateContract_di" bpmnElement="Task_NegotiateContract">
        <dc:Bounds x="860" y="120" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Receive_SignedContract_di" bpmnElement="Receive_SignedContract">
        <dc:Bounds x="1020" y="120" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Timer_ContractSLA_di" bpmnElement="Timer_ContractSLA">
        <dc:Bounds x="1052" y="182" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1096" y="186" width="46" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_ContractSLABreach_di" bpmnElement="End_ContractSLABreach">
        <dc:Bounds x="1102" y="242" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1080" y="285" width="81" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_FinalizeContract_di" bpmnElement="Task_FinalizeContract">
        <dc:Bounds x="1180" y="120" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_DefineBuildReqs_di" bpmnElement="Task_DefineBuildReqs">
        <dc:Bounds x="380" y="380" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="SP_PDLC_di" bpmnElement="SP_PDLC" isExpanded="false">
        <dc:Bounds x="540" y="380" width="100" height="80" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="546" y="404" width="88" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="GW_MergeExec_di" bpmnElement="GW_MergeExec" isMarkerVisible="true">
        <dc:Bounds x="1340" y="257" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="SP4_End_di" bpmnElement="SP4_End">
        <dc:Bounds x="1452" y="282" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_SP4_1_di" bpmnElement="Flow_SP4_1">
        <di:waypoint x="216" y="300" />
        <di:waypoint x="270" y="300" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_SP4_Buy_di" bpmnElement="Flow_SP4_Buy">
        <di:waypoint x="295" y="257" />
        <di:waypoint x="295" y="160" />
        <di:waypoint x="380" y="160" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="303" y="200" width="15" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_SP4_Build_di" bpmnElement="Flow_SP4_Build">
        <di:waypoint x="295" y="307" />
        <di:waypoint x="295" y="420" />
        <di:waypoint x="380" y="420" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="303" y="355" width="18" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_SP4_2_di" bpmnElement="Flow_SP4_2">
        <di:waypoint x="480" y="160" />
        <di:waypoint x="540" y="160" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_SP4_3_di" bpmnElement="Flow_SP4_3">
        <di:waypoint x="640" y="160" />
        <di:waypoint x="700" y="160" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_SP4_4_di" bpmnElement="Flow_SP4_4">
        <di:waypoint x="800" y="160" />
        <di:waypoint x="860" y="160" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_SP4_5_di" bpmnElement="Flow_SP4_5">
        <di:waypoint x="960" y="160" />
        <di:waypoint x="1020" y="160" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_SP4_6_di" bpmnElement="Flow_SP4_6">
        <di:waypoint x="1120" y="160" />
        <di:waypoint x="1180" y="160" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_SP4_BuyMerge_di" bpmnElement="Flow_SP4_BuyMerge">
        <di:waypoint x="1280" y="160" />
        <di:waypoint x="1365" y="160" />
        <di:waypoint x="1365" y="257" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_SP4_7_di" bpmnElement="Flow_SP4_7">
        <di:waypoint x="480" y="420" />
        <di:waypoint x="540" y="420" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_SP4_BuildMerge_di" bpmnElement="Flow_SP4_BuildMerge">
        <di:waypoint x="640" y="420" />
        <di:waypoint x="1365" y="420" />
        <di:waypoint x="1365" y="307" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_SP4_8_di" bpmnElement="Flow_SP4_8">
        <di:waypoint x="1390" y="282" />
        <di:waypoint x="1452" y="300" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_SP4_SLA_di" bpmnElement="Flow_SP4_SLA">
        <di:waypoint x="1070" y="218" />
        <di:waypoint x="1070" y="260" />
        <di:waypoint x="1102" y="260" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
'''

    # SP5 diagram
    xml += '''  <bpmndi:BPMNDiagram id="BPMNDiagram_SP5">
    <bpmndi:BPMNPlane id="BPMNPlane_SP5" bpmnElement="SP_UATGoLive">
      <bpmndi:BPMNShape id="SP5_Start_di" bpmnElement="SP5_Start">
        <dc:Bounds x="180" y="182" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_PerformUAT_di" bpmnElement="Task_PerformUAT">
        <dc:Bounds x="270" y="160" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_FinalApproval_di" bpmnElement="Task_FinalApproval">
        <dc:Bounds x="430" y="160" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_OnboardSoftware_di" bpmnElement="Task_OnboardSoftware">
        <dc:Bounds x="590" y="160" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_0zf4l0g_di" bpmnElement="Activity_0zf4l0g">
        <dc:Bounds x="750" y="160" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_CloseRequest_di" bpmnElement="Task_CloseRequest">
        <dc:Bounds x="910" y="160" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="SP5_End_di" bpmnElement="SP5_End">
        <dc:Bounds x="1072" y="182" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_SP5_1_di" bpmnElement="Flow_SP5_1">
        <di:waypoint x="216" y="200" />
        <di:waypoint x="270" y="200" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_SP5_2_di" bpmnElement="Flow_SP5_2">
        <di:waypoint x="370" y="200" />
        <di:waypoint x="430" y="200" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_SP5_3_di" bpmnElement="Flow_SP5_3">
        <di:waypoint x="530" y="200" />
        <di:waypoint x="590" y="200" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_SP5_4_di" bpmnElement="Flow_SP5_4">
        <di:waypoint x="690" y="200" />
        <di:waypoint x="750" y="200" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_SP5_5_di" bpmnElement="Flow_SP5_5">
        <di:waypoint x="850" y="200" />
        <di:waypoint x="910" y="200" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_SP5_6_di" bpmnElement="Flow_SP5_6">
        <di:waypoint x="1010" y="200" />
        <di:waypoint x="1072" y="200" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
'''

    # PDLC diagram - extract from v4 and include
    # Extract the PDLC BPMNDiagram from v4
    lines = v4_text.split('\n')
    pdlc_diag_lines = []
    in_diag = False
    diag_depth = 0

    for i, line in enumerate(lines):
        if not in_diag and '<bpmndi:BPMNDiagram' in line:
            # Look ahead to check if this diagram contains the PDLC plane
            # Collect candidate
            candidate = [line]
            j = i + 1
            found_pdlc = False
            depth = 1
            while j < len(lines) and depth > 0:
                candidate.append(lines[j])
                if '<bpmndi:BPMNDiagram' in lines[j]:
                    depth += 1
                if '</bpmndi:BPMNDiagram>' in lines[j]:
                    depth -= 1
                if 'bpmnElement="SP_PDLC"' in lines[j]:
                    found_pdlc = True
                j += 1
            if found_pdlc:
                pdlc_diag_lines = candidate
                break

    if pdlc_diag_lines:
        xml += '  ' + '\n  '.join(pdlc_diag_lines) + '\n'

    xml += '</bpmn:definitions>\n'
    return xml


def main():
    print(f"Reading v4 from {V4_PATH}...")
    with open(V4_PATH, 'r', encoding='utf-8') as f:
        v4_text = f.read()

    print("Building v5...")
    v5_xml = build_v5(v4_text)

    print(f"Writing v5 to {V5_PATH}...")
    with open(V5_PATH, 'w', encoding='utf-8') as f:
        f.write(v5_xml)

    # Verification
    print("\nVerification:")
    import subprocess
    result = subprocess.run(['wc', '-l', V5_PATH], capture_output=True, text=True)
    print(f"  Lines: {result.stdout.strip()}")

    # Count key elements
    with open(V5_PATH, 'r') as f:
        v5_content = f.read()

    counts = {
        'bpmnElement=': v5_content.count('bpmnElement='),
        'bpmn:subProcess': v5_content.count('<bpmn:subProcess'),
        'bpmn:userTask': v5_content.count('<bpmn:userTask'),
        'bpmn:sequenceFlow': v5_content.count('<bpmn:sequenceFlow'),
        'bpmn:startEvent': v5_content.count('<bpmn:startEvent'),
        'bpmn:endEvent': v5_content.count('<bpmn:endEvent'),
        'bpmn:exclusiveGateway': v5_content.count('<bpmn:exclusiveGateway'),
        'bpmn:parallelGateway': v5_content.count('<bpmn:parallelGateway'),
        'BPMNDiagram': v5_content.count('<bpmndi:BPMNDiagram'),
    }
    for k, v in counts.items():
        print(f"  {k}: {v}")

    # Check all original task IDs are present
    task_ids = [
        'Task_ReviewExisting', 'Task_GatherDocs', 'Task_SubmitRequest', 'Task_InitialTriage',
        'Task_LeverageExisting', 'Task_PrelimAnalysis', 'Task_Backlog', 'Task_PathwayRouting',
        'Task_TechArchReview', 'Task_SecurityAssessment', 'Task_RiskCompliance',
        'Task_FinancialAnalysis', 'Task_AssessVendorLandscape', 'Task_VendorDueDiligence',
        'Receive_VendorResponse', 'Task_EvaluateVendorResponse',
        'Task_RefineRequirements', 'Task_PerformPoC', 'Task_TechRiskEval',
        'Task_NegotiateContract', 'Receive_SignedContract', 'Task_FinalizeContract',
        'Task_DefineBuildReqs', 'Task_PerformUAT', 'Task_FinalApproval',
        'Task_OnboardSoftware', 'Activity_0zf4l0g', 'Task_CloseRequest',
    ]
    missing = [tid for tid in task_ids if f'id="{tid}"' not in v5_content]
    if missing:
        print(f"\nMISSING TASK IDs: {missing}")
    else:
        print(f"\nAll {len(task_ids)} task IDs present.")

    print("\nDone.")


if __name__ == '__main__':
    main()
