#!/usr/bin/env python3
"""Fix vendor pool message flow sequencing in onboarding BPMN.

Corrects two cross-pool interaction problems:
1. DD: Enterprise evaluates vendor response before sending DD request
2. Contract: Enterprise finalizes contract before vendor reviews/signs it

Fix: Swap task order, insert receive tasks (wait points) with SLA timers.
"""

filepath = 'processes/Onboarding-only/onboarding-to-be-ideal-state-v4.bpmn'

with open(filepath, 'r') as f:
    content = f.read()

import re
before_count = len(re.findall(r'bpmnElement=', content))
print(f"Before: {before_count} bpmnElement references")

# ============================================================
# PART 1: PROCESS XML CHANGES
# ============================================================

# 1. Message flow targets
content = content.replace(
    'id="MsgFlow_VendorResponse" name="Vendor Response" sourceRef="Task_VendorProposal" targetRef="Task_EvaluateVendorResponse"',
    'id="MsgFlow_VendorResponse" name="Vendor Response" sourceRef="Task_VendorProposal" targetRef="Receive_VendorResponse"'
)
content = content.replace(
    'id="MsgFlow_SignedContract" name="Signed Contract" sourceRef="Task_VendorContractSign" targetRef="Task_FinalizeContract"',
    'id="MsgFlow_SignedContract" name="Signed Contract" sourceRef="Task_VendorContractSign" targetRef="Receive_SignedContract"'
)

# 2. Lane_Procurement - add new flowNodeRefs
content = content.replace(
    '        <bpmn:flowNodeRef>Task_FinalizeContract</bpmn:flowNodeRef>\n      </bpmn:lane>',
    '        <bpmn:flowNodeRef>Task_FinalizeContract</bpmn:flowNodeRef>\n'
    '        <bpmn:flowNodeRef>Receive_VendorResponse</bpmn:flowNodeRef>\n'
    '        <bpmn:flowNodeRef>Timer_VendorResponseSLA</bpmn:flowNodeRef>\n'
    '        <bpmn:flowNodeRef>End_VendorResponseSLABreach</bpmn:flowNodeRef>\n'
    '        <bpmn:flowNodeRef>Receive_SignedContract</bpmn:flowNodeRef>\n'
    '        <bpmn:flowNodeRef>Timer_ContractSLA</bpmn:flowNodeRef>\n'
    '        <bpmn:flowNodeRef>End_ContractSLABreach</bpmn:flowNodeRef>\n'
    '      </bpmn:lane>'
)

# 3. Task_EvaluateVendorResponse - change incoming/outgoing
content = content.replace(
    '<bpmn:incoming>Flow_PM7</bpmn:incoming>\n      <bpmn:outgoing>Flow_PM8</bpmn:outgoing>\n    </bpmn:userTask>\n    <bpmn:userTask id="Task_VendorDueDiligence"',
    '<bpmn:incoming>Flow_PM8b</bpmn:incoming>\n      <bpmn:outgoing>Flow_PM9</bpmn:outgoing>\n    </bpmn:userTask>\n    <bpmn:userTask id="Task_VendorDueDiligence"'
)

# 4. Task_VendorDueDiligence - change incoming/outgoing
content = content.replace(
    '<bpmn:incoming>Flow_PM8</bpmn:incoming>\n      <bpmn:outgoing>Flow_PM9</bpmn:outgoing>\n    </bpmn:userTask>\n    <bpmn:endEvent id="End_EvalRejected"',
    '<bpmn:incoming>Flow_PM7</bpmn:incoming>\n      <bpmn:outgoing>Flow_PM8</bpmn:outgoing>\n    </bpmn:userTask>\n    <bpmn:endEvent id="End_EvalRejected"'
)

# 5. Task_FinalizeContract - change incoming
content = content.replace(
    '<bpmn:incoming>Flow_PM13</bpmn:incoming>\n      <bpmn:outgoing>Flow_PM_BuyExecMerge</bpmn:outgoing>',
    '<bpmn:incoming>Flow_PM13b</bpmn:incoming>\n      <bpmn:outgoing>Flow_PM_BuyExecMerge</bpmn:outgoing>'
)

# 6. Sequence flows
content = content.replace(
    'id="Flow_PM7" sourceRef="GW_ParallelJoin" targetRef="Task_EvaluateVendorResponse"',
    'id="Flow_PM7" sourceRef="GW_ParallelJoin" targetRef="Task_VendorDueDiligence"'
)
content = content.replace(
    'id="Flow_PM8" sourceRef="Task_EvaluateVendorResponse" targetRef="Task_VendorDueDiligence"',
    'id="Flow_PM8" sourceRef="Task_VendorDueDiligence" targetRef="Receive_VendorResponse"'
)
content = content.replace(
    'id="Flow_PM9" sourceRef="Task_VendorDueDiligence" targetRef="GW_VendorSelected"',
    'id="Flow_PM9" sourceRef="Task_EvaluateVendorResponse" targetRef="GW_VendorSelected"'
)
content = content.replace(
    'id="Flow_PM13" sourceRef="Task_NegotiateContract" targetRef="Task_FinalizeContract"',
    'id="Flow_PM13" sourceRef="Task_NegotiateContract" targetRef="Receive_SignedContract"'
)

# 7. Insert new DD process elements after Flow_PM9
new_dd = (
    '    <bpmn:sequenceFlow id="Flow_PM8b" sourceRef="Receive_VendorResponse" targetRef="Task_EvaluateVendorResponse" />\n'
    '    <bpmn:sequenceFlow id="Flow_VendorResponseEsc" sourceRef="Timer_VendorResponseSLA" targetRef="End_VendorResponseSLABreach" />\n'
    '    <bpmn:receiveTask id="Receive_VendorResponse" name="Await Vendor&#10;Response" camunda:candidateGroups="procurement-lane">\n'
    '      <bpmn:documentation>Wait point for vendor proposal/response. Blocks until the vendor submits their proposal via the MsgFlow_VendorResponse message flow. A non-interrupting 5-day SLA timer monitors response timeliness.</bpmn:documentation>\n'
    '      <bpmn:incoming>Flow_PM8</bpmn:incoming>\n'
    '      <bpmn:outgoing>Flow_PM8b</bpmn:outgoing>\n'
    '    </bpmn:receiveTask>\n'
    '    <bpmn:boundaryEvent id="Timer_VendorResponseSLA" name="5 Day&#10;SLA" cancelActivity="false" attachedToRef="Receive_VendorResponse">\n'
    '      <bpmn:outgoing>Flow_VendorResponseEsc</bpmn:outgoing>\n'
    '      <bpmn:timerEventDefinition id="TimerDef_VendorResponse">\n'
    '        <bpmn:timeDuration xsi:type="bpmn:tFormalExpression">P5D</bpmn:timeDuration>\n'
    '      </bpmn:timerEventDefinition>\n'
    '    </bpmn:boundaryEvent>\n'
    '    <bpmn:endEvent id="End_VendorResponseSLABreach" name="Vendor Response&#10;SLA Breach">\n'
    '      <bpmn:incoming>Flow_VendorResponseEsc</bpmn:incoming>\n'
    '    </bpmn:endEvent>\n'
)
content = content.replace(
    'id="Flow_PM9" sourceRef="Task_EvaluateVendorResponse" targetRef="GW_VendorSelected" />\n    <bpmn:sequenceFlow id="Flow_PM_SelYes"',
    'id="Flow_PM9" sourceRef="Task_EvaluateVendorResponse" targetRef="GW_VendorSelected" />\n' + new_dd + '    <bpmn:sequenceFlow id="Flow_PM_SelYes"'
)

# 8. Insert new contract elements after Flow_PM13
new_contract = (
    '    <bpmn:sequenceFlow id="Flow_PM13b" sourceRef="Receive_SignedContract" targetRef="Task_FinalizeContract" />\n'
    '    <bpmn:sequenceFlow id="Flow_ContractEsc" sourceRef="Timer_ContractSLA" targetRef="End_ContractSLABreach" />\n'
    '    <bpmn:receiveTask id="Receive_SignedContract" name="Await Signed&#10;Contract" camunda:candidateGroups="contracting-lane">\n'
    '      <bpmn:documentation>Wait point for vendor-signed contract. Blocks until the vendor returns the executed contract via the MsgFlow_SignedContract message flow. A non-interrupting 7-day SLA timer monitors execution timeliness.</bpmn:documentation>\n'
    '      <bpmn:incoming>Flow_PM13</bpmn:incoming>\n'
    '      <bpmn:outgoing>Flow_PM13b</bpmn:outgoing>\n'
    '    </bpmn:receiveTask>\n'
    '    <bpmn:boundaryEvent id="Timer_ContractSLA" name="7 Day&#10;SLA" cancelActivity="false" attachedToRef="Receive_SignedContract">\n'
    '      <bpmn:outgoing>Flow_ContractEsc</bpmn:outgoing>\n'
    '      <bpmn:timerEventDefinition id="TimerDef_ContractSLA">\n'
    '        <bpmn:timeDuration xsi:type="bpmn:tFormalExpression">P7D</bpmn:timeDuration>\n'
    '      </bpmn:timerEventDefinition>\n'
    '    </bpmn:boundaryEvent>\n'
    '    <bpmn:endEvent id="End_ContractSLABreach" name="Contract&#10;SLA Breach">\n'
    '      <bpmn:incoming>Flow_ContractEsc</bpmn:incoming>\n'
    '    </bpmn:endEvent>\n'
)
content = content.replace(
    'id="Flow_PM13" sourceRef="Task_NegotiateContract" targetRef="Receive_SignedContract" />\n    <bpmn:sequenceFlow id="Flow_PM_BuyExecMerge"',
    'id="Flow_PM13" sourceRef="Task_NegotiateContract" targetRef="Receive_SignedContract" />\n' + new_contract + '    <bpmn:sequenceFlow id="Flow_PM_BuyExecMerge"'
)

# ============================================================
# PART 2: DI SHAPES
# ============================================================

# Swap VendorDueDiligence (2560→2400) and EvaluateVendorResponse (2400→2720)
content = content.replace(
    'id="Task_EvaluateVendorResponse_di" bpmnElement="Task_EvaluateVendorResponse">\n        <dc:Bounds x="2400" y="920"',
    'id="Task_EvaluateVendorResponse_di" bpmnElement="Task_EvaluateVendorResponse">\n        <dc:Bounds x="2720" y="920"'
)
content = content.replace(
    'id="Task_VendorDueDiligence_di" bpmnElement="Task_VendorDueDiligence">\n        <dc:Bounds x="2560" y="920"',
    'id="Task_VendorDueDiligence_di" bpmnElement="Task_VendorDueDiligence">\n        <dc:Bounds x="2400" y="920"'
)

# +160px shifts
for old, new in [
    # GW_VendorSelected
    ('id="GW_VendorSelected_di" bpmnElement="GW_VendorSelected" isMarkerVisible="true">\n        <dc:Bounds x="2715" y="935" width="50" height="50" />\n        <bpmndi:BPMNLabel>\n          <dc:Bounds x="2774.5" y="946" width="49" height="27"',
     'id="GW_VendorSelected_di" bpmnElement="GW_VendorSelected" isMarkerVisible="true">\n        <dc:Bounds x="2875" y="935" width="50" height="50" />\n        <bpmndi:BPMNLabel>\n          <dc:Bounds x="2934.5" y="946" width="49" height="27"'),
    # End_VendorNotSelected
    ('id="End_VendorNotSelected_di" bpmnElement="End_VendorNotSelected">\n        <dc:Bounds x="2722" y="995" width="36" height="36" />\n        <bpmndi:BPMNLabel>\n          <dc:Bounds x="2760" y="996" width="80" height="27"',
     'id="End_VendorNotSelected_di" bpmnElement="End_VendorNotSelected">\n        <dc:Bounds x="2882" y="995" width="36" height="36" />\n        <bpmndi:BPMNLabel>\n          <dc:Bounds x="2920" y="996" width="80" height="27"'),
    # Task_RefineRequirements
    ('id="Task_RefineRequirements_di" bpmnElement="Task_RefineRequirements">\n        <dc:Bounds x="2830" y="620"',
     'id="Task_RefineRequirements_di" bpmnElement="Task_RefineRequirements">\n        <dc:Bounds x="2990" y="620"'),
    # Task_PerformPoC
    ('id="Task_PerformPoC_di" bpmnElement="Task_PerformPoC">\n        <dc:Bounds x="2990" y="620"',
     'id="Task_PerformPoC_di" bpmnElement="Task_PerformPoC">\n        <dc:Bounds x="3150" y="620"'),
    # Task_TechRiskEval
    ('id="Task_TechRiskEval_di" bpmnElement="Task_TechRiskEval">\n        <dc:Bounds x="3150" y="620"',
     'id="Task_TechRiskEval_di" bpmnElement="Task_TechRiskEval">\n        <dc:Bounds x="3310" y="620"'),
    # GW_EvalApproved
    ('id="GW_EvalApproved_di" bpmnElement="GW_EvalApproved" isMarkerVisible="true">\n        <dc:Bounds x="3305" y="635" width="50" height="50" />\n        <bpmndi:BPMNLabel>\n          <dc:Bounds x="3303" y="597.5" width="54" height="27"',
     'id="GW_EvalApproved_di" bpmnElement="GW_EvalApproved" isMarkerVisible="true">\n        <dc:Bounds x="3465" y="635" width="50" height="50" />\n        <bpmndi:BPMNLabel>\n          <dc:Bounds x="3463" y="597.5" width="54" height="27"'),
    # End_EvalRejected
    ('id="End_EvalRejected_di" bpmnElement="End_EvalRejected">\n        <dc:Bounds x="3312" y="845" width="36" height="36" />\n        <bpmndi:BPMNLabel>\n          <dc:Bounds x="3295" y="885" width="70" height="27"',
     'id="End_EvalRejected_di" bpmnElement="End_EvalRejected">\n        <dc:Bounds x="3472" y="845" width="36" height="36" />\n        <bpmndi:BPMNLabel>\n          <dc:Bounds x="3455" y="885" width="70" height="27"'),
    # GW_PathwayExec
    ('id="GW_PathwayExec_di" bpmnElement="GW_PathwayExec" isMarkerVisible="true">\n        <dc:Bounds x="3420" y="635" width="50" height="50" />\n        <bpmndi:BPMNLabel>\n          <dc:Bounds x="3405" y="598" width="80" height="27"',
     'id="GW_PathwayExec_di" bpmnElement="GW_PathwayExec" isMarkerVisible="true">\n        <dc:Bounds x="3580" y="635" width="50" height="50" />\n        <bpmndi:BPMNLabel>\n          <dc:Bounds x="3565" y="598" width="80" height="27"'),
    # SP_PDLC
    ('id="SP_PDLC_di" bpmnElement="SP_PDLC" isExpanded="false">\n        <dc:Bounds x="3525" y="620"',
     'id="SP_PDLC_di" bpmnElement="SP_PDLC" isExpanded="false">\n        <dc:Bounds x="3685" y="620"'),
    # Task_NegotiateContract
    ('id="Task_NegotiateContract_di" bpmnElement="Task_NegotiateContract">\n        <dc:Bounds x="3525" y="920"',
     'id="Task_NegotiateContract_di" bpmnElement="Task_NegotiateContract">\n        <dc:Bounds x="3685" y="920"'),
]:
    content = content.replace(old, new)

# +320px shifts
for old, new in [
    # Task_FinalizeContract
    ('id="Task_FinalizeContract_di" bpmnElement="Task_FinalizeContract">\n        <dc:Bounds x="3685" y="920"',
     'id="Task_FinalizeContract_di" bpmnElement="Task_FinalizeContract">\n        <dc:Bounds x="4005" y="920"'),
    # GW_MergeExec
    ('id="GW_MergeExec_di" bpmnElement="GW_MergeExec" isMarkerVisible="true">\n        <dc:Bounds x="3710" y="635"',
     'id="GW_MergeExec_di" bpmnElement="GW_MergeExec" isMarkerVisible="true">\n        <dc:Bounds x="4030" y="635"'),
    # Task_PerformUAT
    ('id="Task_PerformUAT_di" bpmnElement="Task_PerformUAT">\n        <dc:Bounds x="3820" y="620"',
     'id="Task_PerformUAT_di" bpmnElement="Task_PerformUAT">\n        <dc:Bounds x="4140" y="620"'),
    # Task_FinalApproval
    ('id="Task_FinalApproval_di" bpmnElement="Task_FinalApproval">\n        <dc:Bounds x="3970" y="620"',
     'id="Task_FinalApproval_di" bpmnElement="Task_FinalApproval">\n        <dc:Bounds x="4290" y="620"'),
    # GW_FinalDecision
    ('id="GW_FinalDecision_di" bpmnElement="GW_FinalDecision" isMarkerVisible="true">\n        <dc:Bounds x="4100" y="485" width="50" height="50" />\n        <bpmndi:BPMNLabel>\n          <dc:Bounds x="4036" y="503" width="54" height="14"',
     'id="GW_FinalDecision_di" bpmnElement="GW_FinalDecision" isMarkerVisible="true">\n        <dc:Bounds x="4420" y="485" width="50" height="50" />\n        <bpmndi:BPMNLabel>\n          <dc:Bounds x="4356" y="503" width="54" height="14"'),
    # Task_OnboardSoftware
    ('id="Task_OnboardSoftware_di" bpmnElement="Task_OnboardSoftware">\n        <dc:Bounds x="4205" y="620"',
     'id="Task_OnboardSoftware_di" bpmnElement="Task_OnboardSoftware">\n        <dc:Bounds x="4525" y="620"'),
    # Task_CloseRequest
    ('id="Task_CloseRequest_di" bpmnElement="Task_CloseRequest">\n        <dc:Bounds x="4205" y="770"',
     'id="Task_CloseRequest_di" bpmnElement="Task_CloseRequest">\n        <dc:Bounds x="4525" y="770"'),
    # End_SoftwareOnboarded
    ('id="End_SoftwareOnboarded_di" bpmnElement="End_SoftwareOnboarded">\n        <dc:Bounds x="4357" y="792" width="36" height="36" />\n        <bpmndi:BPMNLabel>\n          <dc:Bounds x="4341" y="835" width="68" height="27"',
     'id="End_SoftwareOnboarded_di" bpmnElement="End_SoftwareOnboarded">\n        <dc:Bounds x="4677" y="792" width="36" height="36" />\n        <bpmndi:BPMNLabel>\n          <dc:Bounds x="4661" y="835" width="68" height="27"'),
    # End_FinalRejected
    ('id="End_FinalRejected_di" bpmnElement="End_FinalRejected">\n        <dc:Bounds x="4227" y="432" width="36" height="36" />\n        <bpmndi:BPMNLabel>\n          <dc:Bounds x="4215" y="475" width="60" height="27"',
     'id="End_FinalRejected_di" bpmnElement="End_FinalRejected">\n        <dc:Bounds x="4547" y="432" width="36" height="36" />\n        <bpmndi:BPMNLabel>\n          <dc:Bounds x="4535" y="475" width="60" height="27"'),
]:
    content = content.replace(old, new)

# Pool/lane widths +320
content = content.replace(
    'id="Participant_ProductMgmt_di" bpmnElement="Participant_ProductMgmt" isHorizontal="true">\n        <dc:Bounds x="160" y="80" width="4270" height="960"',
    'id="Participant_ProductMgmt_di" bpmnElement="Participant_ProductMgmt" isHorizontal="true">\n        <dc:Bounds x="160" y="80" width="4590" height="960"'
)
content = content.replace(
    'id="Lane_Procurement_di" bpmnElement="Lane_Procurement" isHorizontal="true">\n        <dc:Bounds x="190" y="880" width="4240" height="160"',
    'id="Lane_Procurement_di" bpmnElement="Lane_Procurement" isHorizontal="true">\n        <dc:Bounds x="190" y="880" width="4560" height="160"'
)
content = content.replace(
    'id="Lane_ProductMgmt_di" bpmnElement="Lane_ProductMgmt" isHorizontal="true">\n        <dc:Bounds x="190" y="360" width="4240" height="520"',
    'id="Lane_ProductMgmt_di" bpmnElement="Lane_ProductMgmt" isHorizontal="true">\n        <dc:Bounds x="190" y="360" width="4560" height="520"'
)
content = content.replace(
    'id="Lane_Requester_di" bpmnElement="Lane_Requester" isHorizontal="true">\n        <dc:Bounds x="190" y="80" width="4240" height="280"',
    'id="Lane_Requester_di" bpmnElement="Lane_Requester" isHorizontal="true">\n        <dc:Bounds x="190" y="80" width="4560" height="280"'
)
content = content.replace(
    'id="Participant_Vendor_di" bpmnElement="Participant_Vendor" isHorizontal="true">\n        <dc:Bounds x="160" y="1140" width="4270" height="350"',
    'id="Participant_Vendor_di" bpmnElement="Participant_Vendor" isHorizontal="true">\n        <dc:Bounds x="160" y="1140" width="4590" height="350"'
)

# ============================================================
# PART 3: DI EDGES
# ============================================================

# Flow_PM7, Flow_PM8: no change needed (VendorDD center=2450 matches old EvalVR center)

# Flow_PM9: EvalVR→GW_VendorSelected
content = content.replace(
    'id="Flow_PM9_di" bpmnElement="Flow_PM9">\n        <di:waypoint x="2660" y="960" />\n        <di:waypoint x="2715" y="960"',
    'id="Flow_PM9_di" bpmnElement="Flow_PM9">\n        <di:waypoint x="2820" y="960" />\n        <di:waypoint x="2875" y="960"'
)

# Flow_PM_SelYes: GW_VendorSelected→RefineReqs (+160)
content = content.replace(
    'id="Flow_PM_SelYes_di" bpmnElement="Flow_PM_SelYes">\n        <di:waypoint x="2740" y="935" />\n        <di:waypoint x="2740" y="660" />\n        <di:waypoint x="2830" y="660" />\n        <bpmndi:BPMNLabel>\n          <dc:Bounds x="2749" y="800"',
    'id="Flow_PM_SelYes_di" bpmnElement="Flow_PM_SelYes">\n        <di:waypoint x="2900" y="935" />\n        <di:waypoint x="2900" y="660" />\n        <di:waypoint x="2990" y="660" />\n        <bpmndi:BPMNLabel>\n          <dc:Bounds x="2909" y="800"'
)

# Flow_PM_SelNo: GW_VendorSelected→End_VendorNotSelected (+160)
content = content.replace(
    'id="Flow_PM_SelNo_di" bpmnElement="Flow_PM_SelNo">\n        <di:waypoint x="2740" y="985" />\n        <di:waypoint x="2740" y="995" />\n        <bpmndi:BPMNLabel>\n          <dc:Bounds x="2748" y="988"',
    'id="Flow_PM_SelNo_di" bpmnElement="Flow_PM_SelNo">\n        <di:waypoint x="2900" y="985" />\n        <di:waypoint x="2900" y="995" />\n        <bpmndi:BPMNLabel>\n          <dc:Bounds x="2908" y="988"'
)

# Flow_PM10: RefineReqs→PerformPoC (+160)
content = content.replace(
    'id="Flow_PM10_di" bpmnElement="Flow_PM10">\n        <di:waypoint x="2930" y="660" />\n        <di:waypoint x="2990" y="660"',
    'id="Flow_PM10_di" bpmnElement="Flow_PM10">\n        <di:waypoint x="3090" y="660" />\n        <di:waypoint x="3150" y="660"'
)

# Flow_PM11: PerformPoC→TechRiskEval (+160)
content = content.replace(
    'id="Flow_PM11_di" bpmnElement="Flow_PM11">\n        <di:waypoint x="3090" y="660" />\n        <di:waypoint x="3150" y="660"',
    'id="Flow_PM11_di" bpmnElement="Flow_PM11">\n        <di:waypoint x="3250" y="660" />\n        <di:waypoint x="3310" y="660"'
)

# Flow_PM12: TechRiskEval→GW_EvalApproved (+160)
content = content.replace(
    'id="Flow_PM12_di" bpmnElement="Flow_PM12">\n        <di:waypoint x="3250" y="660" />\n        <di:waypoint x="3305" y="660"',
    'id="Flow_PM12_di" bpmnElement="Flow_PM12">\n        <di:waypoint x="3410" y="660" />\n        <di:waypoint x="3465" y="660"'
)

# Flow_PM_EvalYes (+160)
content = content.replace(
    'id="Flow_PM_EvalYes_di" bpmnElement="Flow_PM_EvalYes">\n        <di:waypoint x="3355" y="660" />\n        <di:waypoint x="3420" y="660" />\n        <bpmndi:BPMNLabel>\n          <dc:Bounds x="3375" y="642"',
    'id="Flow_PM_EvalYes_di" bpmnElement="Flow_PM_EvalYes">\n        <di:waypoint x="3515" y="660" />\n        <di:waypoint x="3580" y="660" />\n        <bpmndi:BPMNLabel>\n          <dc:Bounds x="3535" y="642"'
)

# Flow_PM_EvalNo (+160)
content = content.replace(
    'id="Flow_PM_EvalNo_di" bpmnElement="Flow_PM_EvalNo">\n        <di:waypoint x="3330" y="685" />\n        <di:waypoint x="3330" y="845" />\n        <bpmndi:BPMNLabel>\n          <dc:Bounds x="3339" y="790"',
    'id="Flow_PM_EvalNo_di" bpmnElement="Flow_PM_EvalNo">\n        <di:waypoint x="3490" y="685" />\n        <di:waypoint x="3490" y="845" />\n        <bpmndi:BPMNLabel>\n          <dc:Bounds x="3499" y="790"'
)

# Flow_PM_ToBuyExec (+160)
content = content.replace(
    'id="Flow_PM_ToBuyExec_di" bpmnElement="Flow_PM_ToBuyExec">\n        <di:waypoint x="3445" y="685" />\n        <di:waypoint x="3445" y="960" />\n        <di:waypoint x="3525" y="960" />\n        <bpmndi:BPMNLabel>\n          <dc:Bounds x="3455" y="820"',
    'id="Flow_PM_ToBuyExec_di" bpmnElement="Flow_PM_ToBuyExec">\n        <di:waypoint x="3605" y="685" />\n        <di:waypoint x="3605" y="960" />\n        <di:waypoint x="3685" y="960" />\n        <bpmndi:BPMNLabel>\n          <dc:Bounds x="3615" y="820"'
)

# Flow_PM_ToBuildExec (+160)
content = content.replace(
    'id="Flow_PM_ToBuildExec_di" bpmnElement="Flow_PM_ToBuildExec">\n        <di:waypoint x="3470" y="660" />\n        <di:waypoint x="3525" y="660" />\n        <bpmndi:BPMNLabel>\n          <dc:Bounds x="3487" y="631"',
    'id="Flow_PM_ToBuildExec_di" bpmnElement="Flow_PM_ToBuildExec">\n        <di:waypoint x="3630" y="660" />\n        <di:waypoint x="3685" y="660" />\n        <bpmndi:BPMNLabel>\n          <dc:Bounds x="3647" y="631"'
)

# Flow_PM13: NegotiateContract→Receive (+160 for both points)
content = content.replace(
    'id="Flow_PM13_di" bpmnElement="Flow_PM13">\n        <di:waypoint x="3625" y="960" />\n        <di:waypoint x="3685" y="960"',
    'id="Flow_PM13_di" bpmnElement="Flow_PM13">\n        <di:waypoint x="3785" y="960" />\n        <di:waypoint x="3845" y="960"'
)

# Flow_PM_BuyExecMerge: FinalizeContract→GW_MergeExec (+320)
content = content.replace(
    'id="Flow_PM_BuyExecMerge_di" bpmnElement="Flow_PM_BuyExecMerge">\n        <di:waypoint x="3735" y="920" />\n        <di:waypoint x="3735" y="685"',
    'id="Flow_PM_BuyExecMerge_di" bpmnElement="Flow_PM_BuyExecMerge">\n        <di:waypoint x="4055" y="920" />\n        <di:waypoint x="4055" y="685"'
)

# Flow_PM_BuildExecMerge: SP_PDLC→GW_MergeExec
content = content.replace(
    'id="Flow_PM_BuildExecMerge_di" bpmnElement="Flow_PM_BuildExecMerge">\n        <di:waypoint x="3625" y="660" />\n        <di:waypoint x="3710" y="660"',
    'id="Flow_PM_BuildExecMerge_di" bpmnElement="Flow_PM_BuildExecMerge">\n        <di:waypoint x="3785" y="660" />\n        <di:waypoint x="4030" y="660"'
)

# Flow_PM14 (+320)
content = content.replace(
    'id="Flow_PM14_di" bpmnElement="Flow_PM14">\n        <di:waypoint x="3760" y="660" />\n        <di:waypoint x="3820" y="660"',
    'id="Flow_PM14_di" bpmnElement="Flow_PM14">\n        <di:waypoint x="4080" y="660" />\n        <di:waypoint x="4140" y="660"'
)

# Flow_PM15 (+320)
content = content.replace(
    'id="Flow_PM15_di" bpmnElement="Flow_PM15">\n        <di:waypoint x="3920" y="660" />\n        <di:waypoint x="3970" y="660"',
    'id="Flow_PM15_di" bpmnElement="Flow_PM15">\n        <di:waypoint x="4240" y="660" />\n        <di:waypoint x="4290" y="660"'
)

# Flow_PM16 (+320)
content = content.replace(
    'id="Flow_PM16_di" bpmnElement="Flow_PM16">\n        <di:waypoint x="4070" y="660" />\n        <di:waypoint x="4125" y="660" />\n        <di:waypoint x="4125" y="535"',
    'id="Flow_PM16_di" bpmnElement="Flow_PM16">\n        <di:waypoint x="4390" y="660" />\n        <di:waypoint x="4445" y="660" />\n        <di:waypoint x="4445" y="535"'
)

# Flow_PM_FinalYes (+320)
content = content.replace(
    'id="Flow_PM_FinalYes_di" bpmnElement="Flow_PM_FinalYes">\n        <di:waypoint x="4125" y="535" />\n        <di:waypoint x="4125" y="660" />\n        <di:waypoint x="4205" y="660" />\n        <bpmndi:BPMNLabel>\n          <dc:Bounds x="4133" y="595"',
    'id="Flow_PM_FinalYes_di" bpmnElement="Flow_PM_FinalYes">\n        <di:waypoint x="4445" y="535" />\n        <di:waypoint x="4445" y="660" />\n        <di:waypoint x="4525" y="660" />\n        <bpmndi:BPMNLabel>\n          <dc:Bounds x="4453" y="595"'
)

# Flow_PM_FinalNo (+320)
content = content.replace(
    'id="Flow_PM_FinalNo_di" bpmnElement="Flow_PM_FinalNo">\n        <di:waypoint x="4125" y="485" />\n        <di:waypoint x="4125" y="450" />\n        <di:waypoint x="4227" y="450" />\n        <bpmndi:BPMNLabel>\n          <dc:Bounds x="4133" y="458"',
    'id="Flow_PM_FinalNo_di" bpmnElement="Flow_PM_FinalNo">\n        <di:waypoint x="4445" y="485" />\n        <di:waypoint x="4445" y="450" />\n        <di:waypoint x="4547" y="450" />\n        <bpmndi:BPMNLabel>\n          <dc:Bounds x="4453" y="458"'
)

# Flow_PM17 (+320)
content = content.replace(
    'id="Flow_PM17_di" bpmnElement="Flow_PM17">\n        <di:waypoint x="4255" y="700" />\n        <di:waypoint x="4255" y="770"',
    'id="Flow_PM17_di" bpmnElement="Flow_PM17">\n        <di:waypoint x="4575" y="700" />\n        <di:waypoint x="4575" y="770"'
)

# Flow_PM_End (+320)
content = content.replace(
    'id="Flow_PM_End_di" bpmnElement="Flow_PM_End">\n        <di:waypoint x="4305" y="810" />\n        <di:waypoint x="4357" y="810"',
    'id="Flow_PM_End_di" bpmnElement="Flow_PM_End">\n        <di:waypoint x="4625" y="810" />\n        <di:waypoint x="4677" y="810"'
)

# Message flows
# MsgFlow_DDRequest: VendorDD moved to x=2400, center=2450
content = content.replace(
    'id="MsgFlow_DDRequest_di" bpmnElement="MsgFlow_DDRequest">\n        <di:waypoint x="2610" y="1000" />\n        <di:waypoint x="2610" y="1090"',
    'id="MsgFlow_DDRequest_di" bpmnElement="MsgFlow_DDRequest">\n        <di:waypoint x="2450" y="1000" />\n        <di:waypoint x="2450" y="1090"'
)

# MsgFlow_VendorResponse: target is now Receive at x=2560, center=2610
content = content.replace(
    'id="MsgFlow_VendorResponse_di" bpmnElement="MsgFlow_VendorResponse">\n        <di:waypoint x="620" y="1330" />\n        <di:waypoint x="620" y="1090" />\n        <di:waypoint x="2450" y="1090" />\n        <di:waypoint x="2450" y="1000"',
    'id="MsgFlow_VendorResponse_di" bpmnElement="MsgFlow_VendorResponse">\n        <di:waypoint x="620" y="1330" />\n        <di:waypoint x="620" y="1090" />\n        <di:waypoint x="2610" y="1090" />\n        <di:waypoint x="2610" y="920"'
)

# MsgFlow_ContractDraft: NegotiateContract moved to x=3685, center=3735
content = content.replace(
    'id="MsgFlow_ContractDraft_di" bpmnElement="MsgFlow_ContractDraft">\n        <di:waypoint x="3575" y="1000" />\n        <di:waypoint x="3575" y="1090"',
    'id="MsgFlow_ContractDraft_di" bpmnElement="MsgFlow_ContractDraft">\n        <di:waypoint x="3735" y="1000" />\n        <di:waypoint x="3735" y="1090"'
)

# MsgFlow_SignedContract: target is now Receive at x=3845, center=3895
content = content.replace(
    'id="MsgFlow_SignedContract_di" bpmnElement="MsgFlow_SignedContract">\n        <di:waypoint x="1300" y="1330" />\n        <di:waypoint x="1300" y="1090" />\n        <di:waypoint x="3735" y="1090" />\n        <di:waypoint x="3735" y="1000"',
    'id="MsgFlow_SignedContract_di" bpmnElement="MsgFlow_SignedContract">\n        <di:waypoint x="1300" y="1330" />\n        <di:waypoint x="1300" y="1090" />\n        <di:waypoint x="3895" y="1090" />\n        <di:waypoint x="3895" y="920"'
)

# ============================================================
# PART 4: INSERT NEW DI SHAPES AND EDGES
# ============================================================

new_di = (
    '      <bpmndi:BPMNShape id="Receive_VendorResponse_di" bpmnElement="Receive_VendorResponse">\n'
    '        <dc:Bounds x="2560" y="920" width="100" height="80" />\n'
    '      </bpmndi:BPMNShape>\n'
    '      <bpmndi:BPMNShape id="Timer_VendorResponseSLA_di" bpmnElement="Timer_VendorResponseSLA">\n'
    '        <dc:Bounds x="2592" y="982" width="36" height="36" />\n'
    '        <bpmndi:BPMNLabel>\n'
    '          <dc:Bounds x="2625" y="1016" width="29" height="27" />\n'
    '        </bpmndi:BPMNLabel>\n'
    '      </bpmndi:BPMNShape>\n'
    '      <bpmndi:BPMNShape id="End_VendorResponseSLABreach_di" bpmnElement="End_VendorResponseSLABreach">\n'
    '        <dc:Bounds x="2655" y="990" width="36" height="36" />\n'
    '        <bpmndi:BPMNLabel>\n'
    '          <dc:Bounds x="2623" y="1028" width="100" height="27" />\n'
    '        </bpmndi:BPMNLabel>\n'
    '      </bpmndi:BPMNShape>\n'
    '      <bpmndi:BPMNShape id="Receive_SignedContract_di" bpmnElement="Receive_SignedContract">\n'
    '        <dc:Bounds x="3845" y="920" width="100" height="80" />\n'
    '      </bpmndi:BPMNShape>\n'
    '      <bpmndi:BPMNShape id="Timer_ContractSLA_di" bpmnElement="Timer_ContractSLA">\n'
    '        <dc:Bounds x="3877" y="982" width="36" height="36" />\n'
    '        <bpmndi:BPMNLabel>\n'
    '          <dc:Bounds x="3910" y="1016" width="29" height="27" />\n'
    '        </bpmndi:BPMNLabel>\n'
    '      </bpmndi:BPMNShape>\n'
    '      <bpmndi:BPMNShape id="End_ContractSLABreach_di" bpmnElement="End_ContractSLABreach">\n'
    '        <dc:Bounds x="3940" y="990" width="36" height="36" />\n'
    '        <bpmndi:BPMNLabel>\n'
    '          <dc:Bounds x="3924" y="1028" width="68" height="27" />\n'
    '        </bpmndi:BPMNLabel>\n'
    '      </bpmndi:BPMNShape>\n'
    '      <bpmndi:BPMNEdge id="Flow_PM8b_di" bpmnElement="Flow_PM8b">\n'
    '        <di:waypoint x="2660" y="960" />\n'
    '        <di:waypoint x="2720" y="960" />\n'
    '      </bpmndi:BPMNEdge>\n'
    '      <bpmndi:BPMNEdge id="Flow_VendorResponseEsc_di" bpmnElement="Flow_VendorResponseEsc">\n'
    '        <di:waypoint x="2628" y="1000" />\n'
    '        <di:waypoint x="2655" y="1008" />\n'
    '      </bpmndi:BPMNEdge>\n'
    '      <bpmndi:BPMNEdge id="Flow_PM13b_di" bpmnElement="Flow_PM13b">\n'
    '        <di:waypoint x="3945" y="960" />\n'
    '        <di:waypoint x="4005" y="960" />\n'
    '      </bpmndi:BPMNEdge>\n'
    '      <bpmndi:BPMNEdge id="Flow_ContractEsc_di" bpmnElement="Flow_ContractEsc">\n'
    '        <di:waypoint x="3913" y="1000" />\n'
    '        <di:waypoint x="3940" y="1008" />\n'
    '      </bpmndi:BPMNEdge>\n'
)

content = content.replace(
    '    </bpmndi:BPMNPlane>\n  </bpmndi:BPMNDiagram>\n  <bpmndi:BPMNDiagram id="BPMNDiagram_PDLC">',
    new_di + '    </bpmndi:BPMNPlane>\n  </bpmndi:BPMNDiagram>\n  <bpmndi:BPMNDiagram id="BPMNDiagram_PDLC">'
)

# ============================================================
# VERIFICATION
# ============================================================

after_count = len(re.findall(r'bpmnElement=', content))
print(f"After: {after_count} bpmnElement references")
print(f"Delta: +{after_count - before_count} (expected +10: 2 receive + 2 timer + 2 end + 4 flows)")

# Verify key patterns exist
checks = [
    ('Receive_VendorResponse', 'receiveTask'),
    ('Receive_SignedContract', 'receiveTask'),
    ('Timer_VendorResponseSLA', 'boundaryEvent'),
    ('Timer_ContractSLA', 'boundaryEvent'),
    ('End_VendorResponseSLABreach', 'endEvent'),
    ('End_ContractSLABreach', 'endEvent'),
    ('Flow_PM8b', 'sequenceFlow'),
    ('Flow_PM13b', 'sequenceFlow'),
    ('Flow_VendorResponseEsc', 'sequenceFlow'),
    ('Flow_ContractEsc', 'sequenceFlow'),
]
for elem_id, elem_type in checks:
    if f'id="{elem_id}"' in content:
        print(f"  OK: {elem_id} ({elem_type})")
    else:
        print(f"  MISSING: {elem_id} ({elem_type})")

# Verify flow sequence
flow_checks = [
    ('Flow_PM7', 'GW_ParallelJoin', 'Task_VendorDueDiligence'),
    ('Flow_PM8', 'Task_VendorDueDiligence', 'Receive_VendorResponse'),
    ('Flow_PM8b', 'Receive_VendorResponse', 'Task_EvaluateVendorResponse'),
    ('Flow_PM9', 'Task_EvaluateVendorResponse', 'GW_VendorSelected'),
    ('Flow_PM13', 'Task_NegotiateContract', 'Receive_SignedContract'),
    ('Flow_PM13b', 'Receive_SignedContract', 'Task_FinalizeContract'),
    ('MsgFlow_VendorResponse', 'Task_VendorProposal', 'Receive_VendorResponse'),
    ('MsgFlow_SignedContract', 'Task_VendorContractSign', 'Receive_SignedContract'),
]
print("\nFlow verification:")
for flow_id, src, tgt in flow_checks:
    pattern = f'id="{flow_id}".*sourceRef="{src}".*targetRef="{tgt}"'
    if re.search(pattern, content):
        print(f"  OK: {flow_id}: {src} -> {tgt}")
    else:
        print(f"  FAIL: {flow_id}: expected {src} -> {tgt}")

with open(filepath, 'w') as f:
    f.write(content)

print("\nFile updated successfully.")
