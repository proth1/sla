#!/usr/bin/env python3
"""
Fix vendor sequencing in onboarding v4 BPMN.

This script uses TEXT-BASED replacements (not XML parsing) to avoid
dropping elements like lxml/ElementTree did in the previous attempt.

Changes:
1. Due Diligence: Swap EvaluateVendorResponse/VendorDueDiligence order,
   insert Receive_VendorResponse with boundary timer
2. Contract: Insert Receive_SignedContract with boundary timer
   between NegotiateContract and FinalizeContract
3. Shift downstream DI elements right to make room
4. Expand pool/lane widths
"""

import re
import sys

BPMN_FILE = "processes/Onboarding-only/onboarding-to-be-ideal-state-v4.bpmn"

def main():
    with open(BPMN_FILE, "r") as f:
        content = f.read()

    original_count = content.count('bpmnElement=')
    print(f"Original bpmnElement count: {original_count}")

    # =========================================================
    # PART 1: Process XML changes
    # =========================================================

    # --- 1a. Rewire sequence flows for DD swap ---

    # Flow_PM7: ParallelJoin -> was EvaluateVendorResponse, now VendorDueDiligence
    content = content.replace(
        'sourceRef="GW_ParallelJoin" targetRef="Task_EvaluateVendorResponse" />',
        'sourceRef="GW_ParallelJoin" targetRef="Task_VendorDueDiligence" />'
    )

    # Flow_PM8: was EvaluateVendorResponse->VendorDueDiligence, now VendorDueDiligence->Receive_VendorResponse
    content = content.replace(
        'sourceRef="Task_EvaluateVendorResponse" targetRef="Task_VendorDueDiligence" />',
        'sourceRef="Task_VendorDueDiligence" targetRef="Receive_VendorResponse" />'
    )

    # Flow_PM9: was VendorDueDiligence->GW_VendorSelected, now EvaluateVendorResponse->GW_VendorSelected
    content = content.replace(
        'sourceRef="Task_VendorDueDiligence" targetRef="GW_VendorSelected" />',
        'sourceRef="Task_EvaluateVendorResponse" targetRef="GW_VendorSelected" />'
    )

    # Task_EvaluateVendorResponse: change incoming/outgoing
    content = content.replace(
        '<bpmn:incoming>Flow_PM7</bpmn:incoming>\n      <bpmn:outgoing>Flow_PM8</bpmn:outgoing>\n    </bpmn:userTask>\n    <bpmn:userTask id="Task_VendorDueDiligence"',
        '<bpmn:incoming>Flow_PM8b</bpmn:incoming>\n      <bpmn:outgoing>Flow_PM9</bpmn:outgoing>\n    </bpmn:userTask>\n    <bpmn:userTask id="Task_VendorDueDiligence"'
    )

    # Task_VendorDueDiligence: change incoming/outgoing
    content = content.replace(
        '<bpmn:incoming>Flow_PM8</bpmn:incoming>\n      <bpmn:outgoing>Flow_PM9</bpmn:outgoing>\n    </bpmn:userTask>\n    <bpmn:userTask id="Task_DefineBuildReqs"',
        '<bpmn:incoming>Flow_PM7</bpmn:incoming>\n      <bpmn:outgoing>Flow_PM8</bpmn:outgoing>\n    </bpmn:userTask>\n    <bpmn:userTask id="Task_DefineBuildReqs"'
    )

    # --- 1b. Add new Flow_PM8b and Receive_VendorResponse ---

    # Insert after Flow_PM9 line
    content = content.replace(
        '<bpmn:sequenceFlow id="Flow_PM9" sourceRef="Task_EvaluateVendorResponse" targetRef="GW_VendorSelected" />',
        '<bpmn:sequenceFlow id="Flow_PM9" sourceRef="Task_EvaluateVendorResponse" targetRef="GW_VendorSelected" />\n    <bpmn:sequenceFlow id="Flow_PM8b" sourceRef="Receive_VendorResponse" targetRef="Task_EvaluateVendorResponse" />'
    )

    # Insert Receive_VendorResponse task, timer, end event, and timer flow
    # Insert before the Timer_TriageSLA boundary event
    receive_vendor_xml = '''    <bpmn:receiveTask id="Receive_VendorResponse" name="Await Vendor&#10;Response" camunda:candidateGroups="procurement-lane">
      <bpmn:incoming>Flow_PM8</bpmn:incoming>
      <bpmn:outgoing>Flow_PM8b</bpmn:outgoing>
    </bpmn:receiveTask>
    <bpmn:boundaryEvent id="Timer_VendorResponseSLA" name="5 Day&#10;SLA" cancelActivity="false" attachedToRef="Receive_VendorResponse">
      <bpmn:outgoing>Flow_VendorResponseSLA</bpmn:outgoing>
      <bpmn:timerEventDefinition id="TimerDef_VendorResponse">
        <bpmn:timeDuration xsi:type="bpmn:tFormalExpression">P5D</bpmn:timeDuration>
      </bpmn:timerEventDefinition>
    </bpmn:boundaryEvent>
    <bpmn:endEvent id="End_VendorResponseSLABreach" name="Vendor Response&#10;SLA Breach">
      <bpmn:incoming>Flow_VendorResponseSLA</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_VendorResponseSLA" sourceRef="Timer_VendorResponseSLA" targetRef="End_VendorResponseSLABreach" />
'''
    content = content.replace(
        '    <bpmn:boundaryEvent id="Timer_TriageSLA"',
        receive_vendor_xml + '    <bpmn:boundaryEvent id="Timer_TriageSLA"'
    )

    # --- 1c. Contract sequence: insert Receive_SignedContract ---

    # Flow_PM13: change target from FinalizeContract to Receive_SignedContract
    content = content.replace(
        '<bpmn:sequenceFlow id="Flow_PM13" sourceRef="Task_NegotiateContract" targetRef="Task_FinalizeContract" />',
        '<bpmn:sequenceFlow id="Flow_PM13" sourceRef="Task_NegotiateContract" targetRef="Receive_SignedContract" />\n    <bpmn:sequenceFlow id="Flow_PM13b" sourceRef="Receive_SignedContract" targetRef="Task_FinalizeContract" />'
    )

    # Task_FinalizeContract: change incoming from Flow_PM13 to Flow_PM13b
    content = content.replace(
        '<bpmn:incoming>Flow_PM13</bpmn:incoming>\n      <bpmn:outgoing>Flow_PM_BuyExecMerge</bpmn:outgoing>',
        '<bpmn:incoming>Flow_PM13b</bpmn:incoming>\n      <bpmn:outgoing>Flow_PM_BuyExecMerge</bpmn:outgoing>'
    )

    # Insert Receive_SignedContract, timer, end event before Timer_TriageSLA
    receive_contract_xml = '''    <bpmn:receiveTask id="Receive_SignedContract" name="Await Signed&#10;Contract" camunda:candidateGroups="procurement-lane">
      <bpmn:incoming>Flow_PM13</bpmn:incoming>
      <bpmn:outgoing>Flow_PM13b</bpmn:outgoing>
    </bpmn:receiveTask>
    <bpmn:boundaryEvent id="Timer_ContractSLA" name="7 Day&#10;SLA" cancelActivity="false" attachedToRef="Receive_SignedContract">
      <bpmn:outgoing>Flow_ContractSLA</bpmn:outgoing>
      <bpmn:timerEventDefinition id="TimerDef_ContractSLA">
        <bpmn:timeDuration xsi:type="bpmn:tFormalExpression">P7D</bpmn:timeDuration>
      </bpmn:timerEventDefinition>
    </bpmn:boundaryEvent>
    <bpmn:endEvent id="End_ContractSLABreach" name="Contract&#10;SLA Breach">
      <bpmn:incoming>Flow_ContractSLA</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_ContractSLA" sourceRef="Timer_ContractSLA" targetRef="End_ContractSLABreach" />
'''
    content = content.replace(
        '    <bpmn:boundaryEvent id="Timer_TriageSLA"',
        receive_contract_xml + '    <bpmn:boundaryEvent id="Timer_TriageSLA"'
    )

    # --- 1d. Update message flow targets ---

    # MsgFlow_VendorResponse: target was Task_EvaluateVendorResponse, now Receive_VendorResponse
    content = content.replace(
        'sourceRef="Task_VendorProposal" targetRef="Task_EvaluateVendorResponse"',
        'sourceRef="Task_VendorProposal" targetRef="Receive_VendorResponse"'
    )

    # MsgFlow_SignedContract: target was Task_FinalizeContract, now Receive_SignedContract
    content = content.replace(
        'sourceRef="Task_VendorContractSign" targetRef="Task_FinalizeContract"',
        'sourceRef="Task_VendorContractSign" targetRef="Receive_SignedContract"'
    )

    # --- 1e. Add to Lane_Procurement flowNodeRef ---
    content = content.replace(
        '<bpmn:flowNodeRef>End_VendorNotSelected</bpmn:flowNodeRef>\n      </bpmn:lane>',
        '<bpmn:flowNodeRef>End_VendorNotSelected</bpmn:flowNodeRef>\n        <bpmn:flowNodeRef>Receive_VendorResponse</bpmn:flowNodeRef>\n        <bpmn:flowNodeRef>End_VendorResponseSLABreach</bpmn:flowNodeRef>\n        <bpmn:flowNodeRef>Timer_VendorResponseSLA</bpmn:flowNodeRef>\n        <bpmn:flowNodeRef>Receive_SignedContract</bpmn:flowNodeRef>\n        <bpmn:flowNodeRef>End_ContractSLABreach</bpmn:flowNodeRef>\n        <bpmn:flowNodeRef>Timer_ContractSLA</bpmn:flowNodeRef>\n      </bpmn:lane>'
    )

    # =========================================================
    # PART 2: DI Layout changes
    # =========================================================

    # Strategy:
    # - Swap EvaluateVendorResponse (x=2400) and VendorDueDiligence (x=2560) positions
    # - Insert Receive_VendorResponse at x=2560 (old VDD position)
    # - EvaluateVendorResponse moves to x=2720
    # - Everything at original x >= 2700 shifts right by 160px
    # - Insert Receive_SignedContract at x=3895 (after NegotiateContract at 3735)
    # - Everything at original x >= 3735 shifts right by additional 160px (total +320)
    # - Expand pool/lane widths by 320px

    # --- 2a. Swap task DI positions ---
    # VendorDueDiligence: 2560 -> 2400
    content = content.replace(
        '<bpmndi:BPMNShape id="Task_VendorDueDiligence_di" bpmnElement="Task_VendorDueDiligence">\n        <dc:Bounds x="2560" y="990" width="100" height="80" />',
        '<bpmndi:BPMNShape id="Task_VendorDueDiligence_di" bpmnElement="Task_VendorDueDiligence">\n        <dc:Bounds x="2400" y="990" width="100" height="80" />'
    )
    # EvaluateVendorResponse: 2400 -> 2720
    content = content.replace(
        '<bpmndi:BPMNShape id="Task_EvaluateVendorResponse_di" bpmnElement="Task_EvaluateVendorResponse">\n        <dc:Bounds x="2400" y="990" width="100" height="80" />',
        '<bpmndi:BPMNShape id="Task_EvaluateVendorResponse_di" bpmnElement="Task_EvaluateVendorResponse">\n        <dc:Bounds x="2720" y="990" width="100" height="80" />'
    )

    # --- 2b. Shift shapes with original x >= 2700 by +160, and >= 3735 by +320 ---
    # Elements to shift (original positions):
    shifts = {
        # Procurement lane elements
        'GW_VendorSelected': (2715, 1005, 'gw', 160),      # -> 2875
        'End_VendorNotSelected': (2842, 1012, 'event', 160), # -> 3002
        'Task_NegotiateContract': (3575, 990, 'task', 160),  # -> 3735
        'Task_FinalizeContract': (3735, 990, 'task', 320),   # -> 4055
        # PM lane elements
        'Task_RefineRequirements': (2830, 690, 'task', 160), # -> 2990
        'Task_PerformPoC': (2990, 690, 'task', 160),         # -> 3150
        'Task_TechRiskEval': (3150, 690, 'task', 160),       # -> 3310
        'GW_EvalApproved': (3305, 705, 'gw', 160),           # -> 3465
        'End_EvalRejected': (3402, 802, 'event', 160),       # -> 3562
        'GW_PathwayExec': (3470, 705, 'gw', 160),            # -> 3630
        'SP_PDLC': (3575, 690, 'task', 160),                 # -> 3735
        'GW_MergeExec': (3760, 705, 'gw', 320),              # -> 4080
        'Task_PerformUAT': (3870, 690, 'task', 320),         # -> 4190
        'Task_FinalApproval': (4020, 690, 'task', 320),      # -> 4340
        'GW_FinalDecision': (4155, 705, 'gw', 320),          # -> 4475
        'Task_OnboardSoftware': (4255, 690, 'task', 320),    # -> 4575
        'End_FinalRejected': (4287, 802, 'event', 320),      # -> 4607
        'Task_CloseRequest': (4430, 690, 'task', 320),       # -> 4750
        'Activity_0zf4l0g': (4550, 230, 'task', 320),        # -> 4870 (Notify Requester)
        'End_SoftwareOnboarded': (4702, 252, 'event', 320),  # -> 5022
    }

    for elem_id, (orig_x, orig_y, elem_type, shift) in shifts.items():
        new_x = orig_x + shift
        # Handle the DI shape id naming (some have _di suffix on bpmnElement value)
        old_bounds = f'x="{orig_x}" y="{orig_y}"'
        new_bounds = f'x="{new_x}" y="{orig_y}"'

        # For shapes, find the specific bpmnElement context to avoid false matches
        if elem_id == 'Activity_0zf4l0g':
            # Special: DI id is Activity_18drofz_di, bpmnElement is Activity_0zf4l0g
            pattern = f'bpmnElement="{elem_id}">\n        <dc:Bounds {old_bounds}'
            replacement = f'bpmnElement="{elem_id}">\n        <dc:Bounds {new_bounds}'
        else:
            pattern = f'bpmnElement="{elem_id}"'
            # Find and replace the bounds on the next line after the bpmnElement
            # We need a more targeted approach
            pattern = f'bpmnElement="{elem_id}"'

        # Use regex to find the shape and shift its bounds
        shape_pattern = re.compile(
            rf'(bpmnElement="{re.escape(elem_id)}"[^>]*>\s*<dc:Bounds )x="{orig_x}"',
            re.DOTALL
        )
        content = shape_pattern.sub(rf'\1x="{new_x}"', content)

    # Also shift labels associated with shifted gateways/events
    label_shifts = [
        # GW_VendorSelected label
        ('2685.5', '976', str(2685.5 + 160), '976'),
        # End_VendorNotSelected label
        ('2828', '1056', str(2828 + 160), '1056'),
        # GW_EvalApproved label
        ('3303', '667.5', str(3303 + 160), '667.5'),
        # End_EvalRejected label
        ('3394', '842', str(3394 + 160), '842'),
        # GW_PathwayExec label
        ('3471', '668', str(3471 + 160), '668'),
        # GW_FinalDecision label
        ('4153', '681', str(4153 + 320), '681'),
        # End_FinalRejected label
        ('4285', '845', str(4285 + 320), '845'),
        # End_SoftwareOnboarded label
        ('4692', '295', str(4692 + 320), '295'),
    ]
    for old_x, old_y, new_x, new_y in label_shifts:
        content = content.replace(
            f'x="{old_x}" y="{new_y}"',
            f'x="{new_x}" y="{new_y}"'
        )

    # --- 2c. Shift sequence flow edges ---
    # Each edge has waypoints that need updating.
    # Rather than trying to be surgical, replace entire edge blocks.

    # Flow_PM7: ParallelJoin(2295,730) -> VendorDueDiligence(2400,990)
    content = content.replace(
        '''      <bpmndi:BPMNEdge id="Flow_PM7_di" bpmnElement="Flow_PM7">
        <di:waypoint x="2345" y="730" />
        <di:waypoint x="2450" y="730" />
        <di:waypoint x="2450" y="990" />
      </bpmndi:BPMNEdge>''',
        '''      <bpmndi:BPMNEdge id="Flow_PM7_di" bpmnElement="Flow_PM7">
        <di:waypoint x="2345" y="730" />
        <di:waypoint x="2450" y="730" />
        <di:waypoint x="2450" y="990" />
      </bpmndi:BPMNEdge>'''
    )
    # Actually Flow_PM7 waypoints are fine - they still go to x=2400-2450 area (VDD now at 2400)

    # Flow_PM8: VendorDueDiligence(2400) -> Receive_VendorResponse(2560)
    content = content.replace(
        '''      <bpmndi:BPMNEdge id="Flow_PM8_di" bpmnElement="Flow_PM8">
        <di:waypoint x="2500" y="1030" />
        <di:waypoint x="2560" y="1030" />
      </bpmndi:BPMNEdge>''',
        '''      <bpmndi:BPMNEdge id="Flow_PM8_di" bpmnElement="Flow_PM8">
        <di:waypoint x="2500" y="1030" />
        <di:waypoint x="2560" y="1030" />
      </bpmndi:BPMNEdge>'''
    )
    # Flow_PM8 waypoints are also fine (VDD at 2400, right edge 2500 -> Receive at 2560)

    # Flow_PM9: EvaluateVendorResponse(2720) -> GW_VendorSelected(2875)
    content = content.replace(
        '''      <bpmndi:BPMNEdge id="Flow_PM9_di" bpmnElement="Flow_PM9">
        <di:waypoint x="2660" y="1030" />
        <di:waypoint x="2715" y="1030" />
      </bpmndi:BPMNEdge>''',
        '''      <bpmndi:BPMNEdge id="Flow_PM9_di" bpmnElement="Flow_PM9">
        <di:waypoint x="2820" y="1030" />
        <di:waypoint x="2875" y="1030" />
      </bpmndi:BPMNEdge>'''
    )

    # Flow_PM_SelYes: GW_VendorSelected(2875) -> Task_RefineRequirements(2990)
    content = content.replace(
        '''      <bpmndi:BPMNEdge id="Flow_PM_SelYes_di" bpmnElement="Flow_PM_SelYes">
        <di:waypoint x="2740" y="1005" />
        <di:waypoint x="2740" y="730" />
        <di:waypoint x="2830" y="730" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2746" y="865" width="18" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>''',
        '''      <bpmndi:BPMNEdge id="Flow_PM_SelYes_di" bpmnElement="Flow_PM_SelYes">
        <di:waypoint x="2900" y="1005" />
        <di:waypoint x="2900" y="730" />
        <di:waypoint x="2990" y="730" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2906" y="865" width="18" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>'''
    )

    # Flow_PM_SelNo: GW_VendorSelected(2875) -> End_VendorNotSelected(3002)
    content = content.replace(
        '''      <bpmndi:BPMNEdge id="Flow_PM_SelNo_di" bpmnElement="Flow_PM_SelNo">
        <di:waypoint x="2765" y="1030" />
        <di:waypoint x="2842" y="1030" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2796" y="1012" width="15" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>''',
        '''      <bpmndi:BPMNEdge id="Flow_PM_SelNo_di" bpmnElement="Flow_PM_SelNo">
        <di:waypoint x="2925" y="1030" />
        <di:waypoint x="3002" y="1030" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2956" y="1012" width="15" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>'''
    )

    # Flow_PM10: RefineRequirements(2990) -> PerformPoC(3150)
    content = content.replace(
        '''      <bpmndi:BPMNEdge id="Flow_PM10_di" bpmnElement="Flow_PM10">
        <di:waypoint x="2930" y="730" />
        <di:waypoint x="2990" y="730" />
      </bpmndi:BPMNEdge>''',
        '''      <bpmndi:BPMNEdge id="Flow_PM10_di" bpmnElement="Flow_PM10">
        <di:waypoint x="3090" y="730" />
        <di:waypoint x="3150" y="730" />
      </bpmndi:BPMNEdge>'''
    )

    # Flow_PM11: PerformPoC(3150) -> TechRiskEval(3310)
    content = content.replace(
        '''      <bpmndi:BPMNEdge id="Flow_PM11_di" bpmnElement="Flow_PM11">
        <di:waypoint x="3090" y="730" />
        <di:waypoint x="3150" y="730" />
      </bpmndi:BPMNEdge>''',
        '''      <bpmndi:BPMNEdge id="Flow_PM11_di" bpmnElement="Flow_PM11">
        <di:waypoint x="3250" y="730" />
        <di:waypoint x="3310" y="730" />
      </bpmndi:BPMNEdge>'''
    )

    # Flow_PM12: TechRiskEval(3310) -> GW_EvalApproved(3465)
    content = content.replace(
        '''      <bpmndi:BPMNEdge id="Flow_PM12_di" bpmnElement="Flow_PM12">
        <di:waypoint x="3250" y="730" />
        <di:waypoint x="3305" y="730" />
      </bpmndi:BPMNEdge>''',
        '''      <bpmndi:BPMNEdge id="Flow_PM12_di" bpmnElement="Flow_PM12">
        <di:waypoint x="3410" y="730" />
        <di:waypoint x="3465" y="730" />
      </bpmndi:BPMNEdge>'''
    )

    # Flow_PM_EvalYes: GW_EvalApproved(3465) -> GW_PathwayExec(3630)
    content = content.replace(
        '''      <bpmndi:BPMNEdge id="Flow_PM_EvalYes_di" bpmnElement="Flow_PM_EvalYes">
        <di:waypoint x="3355" y="730" />
        <di:waypoint x="3470" y="730" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="3404" y="712" width="18" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>''',
        '''      <bpmndi:BPMNEdge id="Flow_PM_EvalYes_di" bpmnElement="Flow_PM_EvalYes">
        <di:waypoint x="3515" y="730" />
        <di:waypoint x="3630" y="730" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="3564" y="712" width="18" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>'''
    )

    # Flow_PM_EvalNo: GW_EvalApproved(3465) -> End_EvalRejected(3562)
    content = content.replace(
        '''      <bpmndi:BPMNEdge id="Flow_PM_EvalNo_di" bpmnElement="Flow_PM_EvalNo">
        <di:waypoint x="3330" y="755" />
        <di:waypoint x="3330" y="820" />
        <di:waypoint x="3402" y="820" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="3338" y="785" width="15" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>''',
        '''      <bpmndi:BPMNEdge id="Flow_PM_EvalNo_di" bpmnElement="Flow_PM_EvalNo">
        <di:waypoint x="3490" y="755" />
        <di:waypoint x="3490" y="820" />
        <di:waypoint x="3562" y="820" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="3498" y="785" width="15" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>'''
    )

    # Flow_PM_ToBuyExec: GW_PathwayExec(3630) -> NegotiateContract(3735)
    content = content.replace(
        '''      <bpmndi:BPMNEdge id="Flow_PM_ToBuyExec_di" bpmnElement="Flow_PM_ToBuyExec">
        <di:waypoint x="3495" y="755" />
        <di:waypoint x="3495" y="1030" />
        <di:waypoint x="3575" y="1030" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="3506" y="890" width="19" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>''',
        '''      <bpmndi:BPMNEdge id="Flow_PM_ToBuyExec_di" bpmnElement="Flow_PM_ToBuyExec">
        <di:waypoint x="3655" y="755" />
        <di:waypoint x="3655" y="1030" />
        <di:waypoint x="3735" y="1030" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="3666" y="890" width="19" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>'''
    )

    # Flow_PM_ToBuildExec: GW_PathwayExec(3630) -> SP_PDLC(3735)
    content = content.replace(
        '''      <bpmndi:BPMNEdge id="Flow_PM_ToBuildExec_di" bpmnElement="Flow_PM_ToBuildExec">
        <di:waypoint x="3520" y="730" />
        <di:waypoint x="3575" y="730" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="3537" y="701" width="25" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>''',
        '''      <bpmndi:BPMNEdge id="Flow_PM_ToBuildExec_di" bpmnElement="Flow_PM_ToBuildExec">
        <di:waypoint x="3680" y="730" />
        <di:waypoint x="3735" y="730" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="3697" y="701" width="25" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>'''
    )

    # Flow_PM13: NegotiateContract(3735) -> Receive_SignedContract(3895)
    content = content.replace(
        '''      <bpmndi:BPMNEdge id="Flow_PM13_di" bpmnElement="Flow_PM13">
        <di:waypoint x="3675" y="1030" />
        <di:waypoint x="3735" y="1030" />
      </bpmndi:BPMNEdge>''',
        '''      <bpmndi:BPMNEdge id="Flow_PM13_di" bpmnElement="Flow_PM13">
        <di:waypoint x="3835" y="1030" />
        <di:waypoint x="3895" y="1030" />
      </bpmndi:BPMNEdge>'''
    )

    # Flow_PM_BuyExecMerge: FinalizeContract(4055) -> GW_MergeExec(4080)
    content = content.replace(
        '''      <bpmndi:BPMNEdge id="Flow_PM_BuyExecMerge_di" bpmnElement="Flow_PM_BuyExecMerge">
        <di:waypoint x="3785" y="990" />
        <di:waypoint x="3785" y="755" />
      </bpmndi:BPMNEdge>''',
        '''      <bpmndi:BPMNEdge id="Flow_PM_BuyExecMerge_di" bpmnElement="Flow_PM_BuyExecMerge">
        <di:waypoint x="4105" y="990" />
        <di:waypoint x="4105" y="755" />
      </bpmndi:BPMNEdge>'''
    )

    # Flow_PM_BuildExecMerge: SP_PDLC(3735) -> GW_MergeExec(4080)
    content = content.replace(
        '''      <bpmndi:BPMNEdge id="Flow_PM_BuildExecMerge_di" bpmnElement="Flow_PM_BuildExecMerge">
        <di:waypoint x="3675" y="730" />
        <di:waypoint x="3760" y="730" />
      </bpmndi:BPMNEdge>''',
        '''      <bpmndi:BPMNEdge id="Flow_PM_BuildExecMerge_di" bpmnElement="Flow_PM_BuildExecMerge">
        <di:waypoint x="3835" y="730" />
        <di:waypoint x="4080" y="730" />
      </bpmndi:BPMNEdge>'''
    )

    # Flow_PM14: GW_MergeExec(4080) -> PerformUAT(4190)
    content = content.replace(
        '''      <bpmndi:BPMNEdge id="Flow_PM14_di" bpmnElement="Flow_PM14">
        <di:waypoint x="3810" y="730" />
        <di:waypoint x="3870" y="730" />
      </bpmndi:BPMNEdge>''',
        '''      <bpmndi:BPMNEdge id="Flow_PM14_di" bpmnElement="Flow_PM14">
        <di:waypoint x="4130" y="730" />
        <di:waypoint x="4190" y="730" />
      </bpmndi:BPMNEdge>'''
    )

    # Flow_PM15: PerformUAT(4190) -> FinalApproval(4340)
    content = content.replace(
        '''      <bpmndi:BPMNEdge id="Flow_PM15_di" bpmnElement="Flow_PM15">
        <di:waypoint x="3970" y="730" />
        <di:waypoint x="4020" y="730" />
      </bpmndi:BPMNEdge>''',
        '''      <bpmndi:BPMNEdge id="Flow_PM15_di" bpmnElement="Flow_PM15">
        <di:waypoint x="4290" y="730" />
        <di:waypoint x="4340" y="730" />
      </bpmndi:BPMNEdge>'''
    )

    # Flow_PM16: FinalApproval(4340) -> GW_FinalDecision(4475)
    content = content.replace(
        '''      <bpmndi:BPMNEdge id="Flow_PM16_di" bpmnElement="Flow_PM16">
        <di:waypoint x="4120" y="730" />
        <di:waypoint x="4155" y="730" />
      </bpmndi:BPMNEdge>''',
        '''      <bpmndi:BPMNEdge id="Flow_PM16_di" bpmnElement="Flow_PM16">
        <di:waypoint x="4440" y="730" />
        <di:waypoint x="4475" y="730" />
      </bpmndi:BPMNEdge>'''
    )

    # Flow_PM_FinalYes: GW_FinalDecision(4475) -> OnboardSoftware(4575)
    content = content.replace(
        '''      <bpmndi:BPMNEdge id="Flow_PM_FinalYes_di" bpmnElement="Flow_PM_FinalYes">
        <di:waypoint x="4205" y="730" />
        <di:waypoint x="4255" y="730" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="4223" y="705" width="18" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>''',
        '''      <bpmndi:BPMNEdge id="Flow_PM_FinalYes_di" bpmnElement="Flow_PM_FinalYes">
        <di:waypoint x="4525" y="730" />
        <di:waypoint x="4575" y="730" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="4543" y="705" width="18" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>'''
    )

    # Flow_PM_FinalNo: GW_FinalDecision(4475) -> End_FinalRejected(4607)
    content = content.replace(
        '''      <bpmndi:BPMNEdge id="Flow_PM_FinalNo_di" bpmnElement="Flow_PM_FinalNo">
        <di:waypoint x="4180" y="755" />
        <di:waypoint x="4180" y="820" />
        <di:waypoint x="4287" y="820" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="4190" y="828" width="15" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>''',
        '''      <bpmndi:BPMNEdge id="Flow_PM_FinalNo_di" bpmnElement="Flow_PM_FinalNo">
        <di:waypoint x="4500" y="755" />
        <di:waypoint x="4500" y="820" />
        <di:waypoint x="4607" y="820" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="4510" y="828" width="15" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>'''
    )

    # Flow_PM17: OnboardSoftware(4575) -> CloseRequest(4750)
    content = content.replace(
        '''      <bpmndi:BPMNEdge id="Flow_PM17_di" bpmnElement="Flow_PM17">
        <di:waypoint x="4355" y="730" />
        <di:waypoint x="4430" y="730" />
      </bpmndi:BPMNEdge>''',
        '''      <bpmndi:BPMNEdge id="Flow_PM17_di" bpmnElement="Flow_PM17">
        <di:waypoint x="4675" y="730" />
        <di:waypoint x="4750" y="730" />
      </bpmndi:BPMNEdge>'''
    )

    # Flow_PM_End: CloseRequest(4750) -> Activity_0zf4l0g(4870)
    content = content.replace(
        '''      <bpmndi:BPMNEdge id="Flow_PM_End_di" bpmnElement="Flow_PM_End">
        <di:waypoint x="4530" y="730" />
        <di:waypoint x="4600" y="730" />
        <di:waypoint x="4600" y="310" />
      </bpmndi:BPMNEdge>''',
        '''      <bpmndi:BPMNEdge id="Flow_PM_End_di" bpmnElement="Flow_PM_End">
        <di:waypoint x="4850" y="730" />
        <di:waypoint x="4920" y="730" />
        <di:waypoint x="4920" y="310" />
      </bpmndi:BPMNEdge>'''
    )

    # Flow_0033t8v: Activity_0zf4l0g(4870) -> End_SoftwareOnboarded(5022)
    content = content.replace(
        '''      <bpmndi:BPMNEdge id="Flow_0033t8v_di" bpmnElement="Flow_0033t8v">
        <di:waypoint x="4650" y="270" />
        <di:waypoint x="4702" y="270" />
      </bpmndi:BPMNEdge>''',
        '''      <bpmndi:BPMNEdge id="Flow_0033t8v_di" bpmnElement="Flow_0033t8v">
        <di:waypoint x="4970" y="270" />
        <di:waypoint x="5022" y="270" />
      </bpmndi:BPMNEdge>'''
    )

    # --- 2d. Update message flow edges ---

    # MsgFlow_DDRequest: VendorDueDiligence(2400) -> down to vendor pool
    # Original: x=2610 (from VDD at 2560). New VDD at 2400, so exit from bottom at x=2450
    content = content.replace(
        '''      <bpmndi:BPMNEdge id="MsgFlow_DDRequest_di" bpmnElement="MsgFlow_DDRequest">
        <di:waypoint x="2610" y="1070" />
        <di:waypoint x="2610" y="1200" />
        <di:waypoint x="240" y="1200" />
        <di:waypoint x="240" y="1472" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1391" y="1168" width="69" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>''',
        '''      <bpmndi:BPMNEdge id="MsgFlow_DDRequest_di" bpmnElement="MsgFlow_DDRequest">
        <di:waypoint x="2450" y="1070" />
        <di:waypoint x="2450" y="1200" />
        <di:waypoint x="240" y="1200" />
        <di:waypoint x="240" y="1472" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1311" y="1168" width="69" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>'''
    )

    # MsgFlow_VendorResponse: VendorProposal(620) -> Receive_VendorResponse(2560)
    content = content.replace(
        '''      <bpmndi:BPMNEdge id="MsgFlow_VendorResponse_di" bpmnElement="MsgFlow_VendorResponse">
        <di:waypoint x="620" y="1450" />
        <di:waypoint x="620" y="1150" />
        <di:waypoint x="2450" y="1150" />
        <di:waypoint x="2450" y="1070" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1491" y="1131" width="88" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>''',
        '''      <bpmndi:BPMNEdge id="MsgFlow_VendorResponse_di" bpmnElement="MsgFlow_VendorResponse">
        <di:waypoint x="620" y="1450" />
        <di:waypoint x="620" y="1150" />
        <di:waypoint x="2610" y="1150" />
        <di:waypoint x="2610" y="1070" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1571" y="1131" width="88" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>'''
    )

    # MsgFlow_ContractDraft: NegotiateContract(3735) -> VendorContractReview
    content = content.replace(
        '''      <bpmndi:BPMNEdge id="MsgFlow_ContractDraft_di" bpmnElement="MsgFlow_ContractDraft">
        <di:waypoint x="3625" y="1070" />
        <di:waypoint x="3625" y="1240" />
        <di:waypoint x="1140" y="1240" />
        <di:waypoint x="1140" y="1450" />''',
        '''      <bpmndi:BPMNEdge id="MsgFlow_ContractDraft_di" bpmnElement="MsgFlow_ContractDraft">
        <di:waypoint x="3785" y="1070" />
        <di:waypoint x="3785" y="1240" />
        <di:waypoint x="1140" y="1240" />
        <di:waypoint x="1140" y="1450" />'''
    )

    # MsgFlow_SignedContract: VendorContractSign(1300) -> Receive_SignedContract(3895)
    content = content.replace(
        '''      <bpmndi:BPMNEdge id="MsgFlow_SignedContract_di" bpmnElement="MsgFlow_SignedContract">
        <di:waypoint x="1300" y="1450" />
        <di:waypoint x="1300" y="1270" />
        <di:waypoint x="3785" y="1270" />
        <di:waypoint x="3785" y="1070" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2503" y="1251" width="79" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>''',
        '''      <bpmndi:BPMNEdge id="MsgFlow_SignedContract_di" bpmnElement="MsgFlow_SignedContract">
        <di:waypoint x="1300" y="1450" />
        <di:waypoint x="1300" y="1270" />
        <di:waypoint x="3945" y="1270" />
        <di:waypoint x="3945" y="1070" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2583" y="1251" width="79" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>'''
    )

    # --- 2e. Add new DI shapes and edges ---

    # Insert new shapes before the Vendor pool participant shape
    new_shapes = '''      <bpmndi:BPMNShape id="Receive_VendorResponse_di" bpmnElement="Receive_VendorResponse">
        <dc:Bounds x="2560" y="990" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Timer_VendorResponseSLA_di" bpmnElement="Timer_VendorResponseSLA">
        <dc:Bounds x="2592" y="1052" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2636" y="1056" width="29" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_VendorResponseSLABreach_di" bpmnElement="End_VendorResponseSLABreach">
        <dc:Bounds x="2592" y="1092" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2569" y="1128" width="82" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Receive_SignedContract_di" bpmnElement="Receive_SignedContract">
        <dc:Bounds x="3895" y="990" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Timer_ContractSLA_di" bpmnElement="Timer_ContractSLA">
        <dc:Bounds x="3927" y="1052" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="3971" y="1056" width="29" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_ContractSLABreach_di" bpmnElement="End_ContractSLABreach">
        <dc:Bounds x="3927" y="1092" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="3912" y="1128" width="66" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
'''

    # Insert new edges
    new_edges = '''      <bpmndi:BPMNEdge id="Flow_PM8b_di" bpmnElement="Flow_PM8b">
        <di:waypoint x="2660" y="1030" />
        <di:waypoint x="2720" y="1030" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_VendorResponseSLA_di" bpmnElement="Flow_VendorResponseSLA">
        <di:waypoint x="2610" y="1088" />
        <di:waypoint x="2610" y="1092" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_PM13b_di" bpmnElement="Flow_PM13b">
        <di:waypoint x="3995" y="1030" />
        <di:waypoint x="4055" y="1030" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_ContractSLA_di" bpmnElement="Flow_ContractSLA">
        <di:waypoint x="3945" y="1088" />
        <di:waypoint x="3945" y="1092" />
      </bpmndi:BPMNEdge>
'''

    # Insert before the closing </bpmndi:BPMNPlane> of the main diagram
    content = content.replace(
        '    </bpmndi:BPMNPlane>\n  </bpmndi:BPMNDiagram>\n  <bpmndi:BPMNDiagram id="BPMNDiagram_PDLC">',
        new_shapes + new_edges + '    </bpmndi:BPMNPlane>\n  </bpmndi:BPMNDiagram>\n  <bpmndi:BPMNDiagram id="BPMNDiagram_PDLC">'
    )

    # --- 2f. Expand pool and lane widths by 320px ---
    # Pool: 4620 -> 4940
    content = content.replace(
        'x="160" y="80" width="4620" height="1041"',
        'x="160" y="80" width="4940" height="1041"'
    )
    # Lanes: 4590 -> 4910
    content = content.replace(
        'width="4590" height="171"',
        'width="4910" height="171"'
    )
    content = content.replace(
        'width="4590" height="520"',
        'width="4910" height="520"'
    )
    content = content.replace(
        'width="4590" height="350"',
        'width="4910" height="350"'
    )
    # Vendor pool: 4620 -> 4940
    content = content.replace(
        'x="160" y="1310" width="4620" height="420"',
        'x="160" y="1310" width="4940" height="420"'
    )

    # =========================================================
    # PART 3: Verify
    # =========================================================

    new_count = content.count('bpmnElement=')
    print(f"New bpmnElement count: {new_count}")
    print(f"Delta: +{new_count - original_count}")

    # Check critical elements
    for elem in ['Activity_0zf4l0g', 'Flow_0033t8v', 'Receive_VendorResponse',
                 'Timer_VendorResponseSLA', 'End_VendorResponseSLABreach',
                 'Receive_SignedContract', 'Timer_ContractSLA', 'End_ContractSLABreach']:
        if elem in content:
            print(f"  {elem}: PRESENT")
        else:
            print(f"  {elem}: MISSING *** ERROR ***")

    with open(BPMN_FILE, "w") as f:
        f.write(content)

    print(f"\nFile written: {BPMN_FILE}")

if __name__ == "__main__":
    main()
