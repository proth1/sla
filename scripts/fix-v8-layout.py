#!/usr/bin/env python3
"""
Fix v8-c8 BPMN visual layout regression.

Moves 4 top-level notification service tasks (SendTask_SP1-4Complete) inside
their respective sub-processes, restoring the clean v7 hierarchical layout.

Uses regex-based text manipulation (no lxml) per project rules.
"""

import re
import sys

FILE = "customers/fs-onboarding/processes/onboarding-to-be-ideal-state-v8-c8.bpmn"


def main():
    with open(FILE, "r") as f:
        content = f.read()

    original = content

    # =========================================================================
    # STEP 1: Remove 4 top-level SendTask definitions and 8 sequence flows
    # =========================================================================

    # Remove SendTask_SP4Complete (lines 12-21 area) - first element in process
    content = re.sub(
        r'    <bpmn:serviceTask id="SendTask_SP4Complete".*?</bpmn:serviceTask>\n',
        '', content, count=1, flags=re.DOTALL
    )

    # Remove SendTask_SP1Complete (lines 1044-1053 area)
    content = re.sub(
        r'    <bpmn:serviceTask id="SendTask_SP1Complete".*?</bpmn:serviceTask>\n',
        '', content, count=1, flags=re.DOTALL
    )

    # Remove SendTask_SP2Complete (lines 1070-1079 area)
    content = re.sub(
        r'    <bpmn:serviceTask id="SendTask_SP2Complete".*?</bpmn:serviceTask>\n',
        '', content, count=1, flags=re.DOTALL
    )

    # Remove SendTask_SP3Complete (lines 1086-1095 area)
    content = re.sub(
        r'    <bpmn:serviceTask id="SendTask_SP3Complete".*?</bpmn:serviceTask>\n',
        '', content, count=1, flags=re.DOTALL
    )

    # Remove 8 top-level sequence flows (the v8 notification flows)
    for flow_id in [
        "Flow_v8_SP1toNotify", "Flow_v8_NotifyToTriage",
        "Flow_v8_SP2toNotify", "Flow_v8_NotifyToBuyBuild",
        "Flow_v8_SP3toNotify", "Flow_v8_NotifyToVendorSel",
        "Flow_v8_SP4toNotify", "Flow_v8_NotifyToUAT",
    ]:
        content = re.sub(
            rf'    <bpmn:sequenceFlow id="{flow_id}"[^/]*/>\n',
            '', content, count=1
        )

    # =========================================================================
    # STEP 2: Add 4 direct flows (restore v7 connections)
    # =========================================================================

    # Insert after Flow_v5_1 definition
    direct_flows = (
        '    <bpmn:sequenceFlow id="Flow_v5_2" sourceRef="SP_RequestTriage" targetRef="GW_TriageDecision" />\n'
    )
    content = content.replace(
        '    <bpmn:sequenceFlow id="Flow_v5_1" sourceRef="Start_SoftwareNeed" targetRef="SP_RequestTriage" />\n',
        '    <bpmn:sequenceFlow id="Flow_v5_1" sourceRef="Start_SoftwareNeed" targetRef="SP_RequestTriage" />\n' + direct_flows
    )

    # Insert Flow_v5_5 near where SP2 flows were
    content = content.replace(
        '    <bpmn:sequenceFlow id="Flow_v5_6" name="No"',
        '    <bpmn:sequenceFlow id="Flow_v5_5" sourceRef="SP_PlanningRouting" targetRef="GW_BuyVsBuild" />\n    <bpmn:sequenceFlow id="Flow_v5_6" name="No"'
    )

    # Insert Flow_v5_8 near where SP3 flows were
    content = content.replace(
        '    <bpmn:sequenceFlow id="Flow_v5_9" name="No"',
        '    <bpmn:sequenceFlow id="Flow_v5_8" sourceRef="SP_EvalDD" targetRef="GW_VendorSelected" />\n    <bpmn:sequenceFlow id="Flow_v5_9" name="No"'
    )

    # Insert Flow_v5_13 near SP4
    content = content.replace(
        '    <bpmn:sequenceFlow id="Flow_1oux8e4"',
        '    <bpmn:sequenceFlow id="Flow_v5_13" sourceRef="SP_ContractBuild" targetRef="SP_UATGoLive" />\n    <bpmn:sequenceFlow id="Flow_1oux8e4"'
    )

    # =========================================================================
    # STEP 3: Update SP outgoing refs and GW/SP incoming refs
    # =========================================================================

    # SP_RequestTriage: outgoing Flow_v8_SP1toNotify -> Flow_v5_2
    content = content.replace(
        '<bpmn:outgoing>Flow_v8_SP1toNotify</bpmn:outgoing>',
        '<bpmn:outgoing>Flow_v5_2</bpmn:outgoing>'
    )

    # GW_TriageDecision: incoming Flow_v8_NotifyToTriage -> Flow_v5_2
    content = content.replace(
        '<bpmn:incoming>Flow_v8_NotifyToTriage</bpmn:incoming>',
        '<bpmn:incoming>Flow_v5_2</bpmn:incoming>'
    )

    # SP_PlanningRouting: outgoing Flow_v8_SP2toNotify -> Flow_v5_5
    content = content.replace(
        '<bpmn:outgoing>Flow_v8_SP2toNotify</bpmn:outgoing>',
        '<bpmn:outgoing>Flow_v5_5</bpmn:outgoing>'
    )

    # GW_BuyVsBuild: incoming Flow_v8_NotifyToBuyBuild -> Flow_v5_5
    content = content.replace(
        '<bpmn:incoming>Flow_v8_NotifyToBuyBuild</bpmn:incoming>',
        '<bpmn:incoming>Flow_v5_5</bpmn:incoming>'
    )

    # SP_EvalDD: outgoing Flow_v8_SP3toNotify -> Flow_v5_8
    content = content.replace(
        '<bpmn:outgoing>Flow_v8_SP3toNotify</bpmn:outgoing>',
        '<bpmn:outgoing>Flow_v5_8</bpmn:outgoing>'
    )

    # GW_VendorSelected: incoming Flow_v8_NotifyToVendorSel -> Flow_v5_8
    content = content.replace(
        '<bpmn:incoming>Flow_v8_NotifyToVendorSel</bpmn:incoming>',
        '<bpmn:incoming>Flow_v5_8</bpmn:incoming>'
    )

    # SP_ContractBuild: outgoing Flow_v8_SP4toNotify -> Flow_v5_13
    content = content.replace(
        '<bpmn:outgoing>Flow_v8_SP4toNotify</bpmn:outgoing>',
        '<bpmn:outgoing>Flow_v5_13</bpmn:outgoing>'
    )

    # SP_UATGoLive: incoming Flow_v8_NotifyToUAT -> Flow_v5_13
    content = content.replace(
        '<bpmn:incoming>Flow_v8_NotifyToUAT</bpmn:incoming>',
        '<bpmn:incoming>Flow_v5_13</bpmn:incoming>'
    )

    # =========================================================================
    # STEP 4: Insert SendTasks inside sub-processes (before end events)
    # =========================================================================

    # --- SP1: Redirect Flow_SP1_5 from InitialTriage→SP1_End to InitialTriage→SendTask ---
    # Change Flow_SP1_5 target
    content = content.replace(
        '<bpmn:sequenceFlow id="Flow_SP1_5" sourceRef="Task_InitialTriage" targetRef="SP1_End" />',
        '<bpmn:sequenceFlow id="Flow_SP1_5" sourceRef="Task_InitialTriage" targetRef="SendTask_SP1Complete" />'
    )
    # Change SP1_End incoming
    content = content.replace(
        '      <bpmn:endEvent id="SP1_End" name="Triage&#10;Complete">\n        <bpmn:incoming>Flow_SP1_5</bpmn:incoming>\n      </bpmn:endEvent>',
        '      <bpmn:serviceTask id="SendTask_SP1Complete" name="SP1&#10;Notification">\n'
        '        <bpmn:extensionElements>\n'
        '          <zeebe:taskDefinition type="status-notification" />\n'
        '          <zeebe:properties>\n'
        '            <zeebe:property name="phase" value="SP1_Complete" />\n'
        '          </zeebe:properties>\n'
        '        </bpmn:extensionElements>\n'
        '        <bpmn:incoming>Flow_SP1_5</bpmn:incoming>\n'
        '        <bpmn:outgoing>Flow_SP1_Notify</bpmn:outgoing>\n'
        '      </bpmn:serviceTask>\n'
        '      <bpmn:sequenceFlow id="Flow_SP1_Notify" sourceRef="SendTask_SP1Complete" targetRef="SP1_End" />\n'
        '      <bpmn:endEvent id="SP1_End" name="Triage&#10;Complete">\n'
        '        <bpmn:incoming>Flow_SP1_Notify</bpmn:incoming>\n'
        '      </bpmn:endEvent>'
    )

    # --- SP2: Redirect Flow_SP2_5 from PathwayRouting→SP2_End to PathwayRouting→SendTask ---
    content = content.replace(
        '<bpmn:sequenceFlow id="Flow_SP2_5" sourceRef="Task_PathwayRouting" targetRef="SP2_End" />',
        '<bpmn:sequenceFlow id="Flow_SP2_5" sourceRef="Task_PathwayRouting" targetRef="SendTask_SP2Complete" />'
    )
    content = content.replace(
        '      <bpmn:endEvent id="SP2_End">\n        <bpmn:incoming>Flow_SP2_5</bpmn:incoming>\n      </bpmn:endEvent>',
        '      <bpmn:serviceTask id="SendTask_SP2Complete" name="SP2&#10;Notification">\n'
        '        <bpmn:extensionElements>\n'
        '          <zeebe:taskDefinition type="status-notification" />\n'
        '          <zeebe:properties>\n'
        '            <zeebe:property name="phase" value="SP2_Complete" />\n'
        '          </zeebe:properties>\n'
        '        </bpmn:extensionElements>\n'
        '        <bpmn:incoming>Flow_SP2_5</bpmn:incoming>\n'
        '        <bpmn:outgoing>Flow_SP2_Notify</bpmn:outgoing>\n'
        '      </bpmn:serviceTask>\n'
        '      <bpmn:sequenceFlow id="Flow_SP2_Notify" sourceRef="SendTask_SP2Complete" targetRef="SP2_End" />\n'
        '      <bpmn:endEvent id="SP2_End">\n'
        '        <bpmn:incoming>Flow_SP2_Notify</bpmn:incoming>\n'
        '      </bpmn:endEvent>'
    )

    # --- SP3: Redirect Flow_SP3_5 from EvaluateVendorResponse→SP3_End ---
    content = content.replace(
        '<bpmn:sequenceFlow id="Flow_SP3_5" sourceRef="Task_EvaluateVendorResponse" targetRef="SP3_End" />',
        '<bpmn:sequenceFlow id="Flow_SP3_5" sourceRef="Task_EvaluateVendorResponse" targetRef="SendTask_SP3Complete" />'
    )
    content = content.replace(
        '      <bpmn:endEvent id="SP3_End">\n        <bpmn:incoming>Flow_SP3_5</bpmn:incoming>\n      </bpmn:endEvent>',
        '      <bpmn:serviceTask id="SendTask_SP3Complete" name="SP3&#10;Notification">\n'
        '        <bpmn:extensionElements>\n'
        '          <zeebe:taskDefinition type="status-notification" />\n'
        '          <zeebe:properties>\n'
        '            <zeebe:property name="phase" value="SP3_Complete" />\n'
        '          </zeebe:properties>\n'
        '        </bpmn:extensionElements>\n'
        '        <bpmn:incoming>Flow_SP3_5</bpmn:incoming>\n'
        '        <bpmn:outgoing>Flow_SP3_Notify</bpmn:outgoing>\n'
        '      </bpmn:serviceTask>\n'
        '      <bpmn:sequenceFlow id="Flow_SP3_Notify" sourceRef="SendTask_SP3Complete" targetRef="SP3_End" />\n'
        '      <bpmn:endEvent id="SP3_End">\n'
        '        <bpmn:incoming>Flow_SP3_Notify</bpmn:incoming>\n'
        '      </bpmn:endEvent>'
    )

    # --- SP4: Redirect Flow_1fshpro from GW_MergeExec→SP4_End ---
    content = content.replace(
        '<bpmn:sequenceFlow id="Flow_1fshpro" sourceRef="GW_MergeExec" targetRef="SP4_End" />',
        '<bpmn:sequenceFlow id="Flow_1fshpro" sourceRef="GW_MergeExec" targetRef="SendTask_SP4Complete" />'
    )
    content = content.replace(
        '      <bpmn:endEvent id="SP4_End">\n        <bpmn:incoming>Flow_1fshpro</bpmn:incoming>\n      </bpmn:endEvent>',
        '      <bpmn:serviceTask id="SendTask_SP4Complete" name="SP4&#10;Notification">\n'
        '        <bpmn:extensionElements>\n'
        '          <zeebe:taskDefinition type="status-notification" />\n'
        '          <zeebe:properties>\n'
        '            <zeebe:property name="phase" value="SP4_Complete" />\n'
        '          </zeebe:properties>\n'
        '        </bpmn:extensionElements>\n'
        '        <bpmn:incoming>Flow_1fshpro</bpmn:incoming>\n'
        '        <bpmn:outgoing>Flow_SP4_Notify</bpmn:outgoing>\n'
        '      </bpmn:serviceTask>\n'
        '      <bpmn:sequenceFlow id="Flow_SP4_Notify" sourceRef="SendTask_SP4Complete" targetRef="SP4_End" />\n'
        '      <bpmn:endEvent id="SP4_End">\n'
        '        <bpmn:incoming>Flow_SP4_Notify</bpmn:incoming>\n'
        '      </bpmn:endEvent>'
    )

    # =========================================================================
    # STEP 5: DI — Remove 4 SendTask shapes + 8 flow edges from main diagram
    # =========================================================================

    # Remove SendTask_SP4Complete shape (with label)
    content = re.sub(
        r'      <bpmndi:BPMNShape id="SendTask_SP4Complete_di".*?</bpmndi:BPMNShape>\n',
        '', content, count=1, flags=re.DOTALL
    )
    # Remove SendTask_SP1Complete shape
    content = re.sub(
        r'      <bpmndi:BPMNShape id="SendTask_SP1Complete_di".*?</bpmndi:BPMNShape>\n',
        '', content, count=1, flags=re.DOTALL
    )
    # Remove SendTask_SP2Complete shape
    content = re.sub(
        r'      <bpmndi:BPMNShape id="SendTask_SP2Complete_di".*?</bpmndi:BPMNShape>\n',
        '', content, count=1, flags=re.DOTALL
    )
    # Remove SendTask_SP3Complete shape
    content = re.sub(
        r'      <bpmndi:BPMNShape id="SendTask_SP3Complete_di".*?</bpmndi:BPMNShape>\n',
        '', content, count=1, flags=re.DOTALL
    )

    # Remove 8 flow edges from main diagram
    for flow_id in [
        "Flow_v8_SP4toNotify", "Flow_v8_NotifyToUAT",
        "Flow_v8_SP1toNotify", "Flow_v8_NotifyToTriage",
        "Flow_v8_SP2toNotify", "Flow_v8_NotifyToBuyBuild",
        "Flow_v8_SP3toNotify", "Flow_v8_NotifyToVendorSel",
    ]:
        content = re.sub(
            rf'      <bpmndi:BPMNEdge id="{flow_id}_di".*?</bpmndi:BPMNEdge>\n',
            '', content, count=1, flags=re.DOTALL
        )

    # =========================================================================
    # STEP 6: DI — Add 4 direct flow edges to main diagram
    # =========================================================================

    # Flow_v5_2: SP_RequestTriage(310+100=410) → GW_TriageDecision(465)
    flow_v5_2_di = (
        '      <bpmndi:BPMNEdge id="Flow_v5_2_di" bpmnElement="Flow_v5_2">\n'
        '        <di:waypoint x="410" y="190" />\n'
        '        <di:waypoint x="465" y="190" />\n'
        '      </bpmndi:BPMNEdge>\n'
    )
    # Insert after Flow_v5_1 edge
    content = content.replace(
        '      </bpmndi:BPMNEdge>\n      <bpmndi:BPMNEdge id="Flow_v5_3_di"',
        '      </bpmndi:BPMNEdge>\n' + flow_v5_2_di + '      <bpmndi:BPMNEdge id="Flow_v5_3_di"'
    )

    # Flow_v5_5: SP_PlanningRouting(730+100=830) → GW_BuyVsBuild(885)
    flow_v5_5_di = (
        '      <bpmndi:BPMNEdge id="Flow_v5_5_di" bpmnElement="Flow_v5_5">\n'
        '        <di:waypoint x="830" y="190" />\n'
        '        <di:waypoint x="885" y="190" />\n'
        '      </bpmndi:BPMNEdge>\n'
    )
    # Insert before Flow_v5_6 edge
    content = content.replace(
        '      <bpmndi:BPMNEdge id="Flow_v5_6_di"',
        flow_v5_5_di + '      <bpmndi:BPMNEdge id="Flow_v5_6_di"'
    )

    # Flow_v5_8: SP_EvalDD(990+100=1090) → GW_VendorSelected(1145)
    flow_v5_8_di = (
        '      <bpmndi:BPMNEdge id="Flow_v5_8_di" bpmnElement="Flow_v5_8">\n'
        '        <di:waypoint x="1090" y="190" />\n'
        '        <di:waypoint x="1145" y="190" />\n'
        '      </bpmndi:BPMNEdge>\n'
    )
    # Insert before Flow_v5_9 edge
    content = content.replace(
        '      <bpmndi:BPMNEdge id="Flow_v5_9_di"',
        flow_v5_8_di + '      <bpmndi:BPMNEdge id="Flow_v5_9_di"'
    )

    # Flow_v5_13: SP_ContractBuild(1520+100=1620) → SP_UATGoLive(1720)
    flow_v5_13_di = (
        '      <bpmndi:BPMNEdge id="Flow_v5_13_di" bpmnElement="Flow_v5_13">\n'
        '        <di:waypoint x="1620" y="190" />\n'
        '        <di:waypoint x="1720" y="190" />\n'
        '      </bpmndi:BPMNEdge>\n'
    )
    # Insert before Flow_v5_14 edge
    content = content.replace(
        '      <bpmndi:BPMNEdge id="Flow_v5_14_di"',
        flow_v5_13_di + '      <bpmndi:BPMNEdge id="Flow_v5_14_di"'
    )

    # =========================================================================
    # STEP 7: DI — Add SendTask shapes + shift end events in SP diagrams
    # =========================================================================

    # --- SP1: SendTask at x=1780,y=320; SP1_End shifts from x=1672→x=1942 ---
    # Shift SP1_End position
    content = content.replace(
        '      <bpmndi:BPMNShape id="SP1_End_di" bpmnElement="SP1_End">\n'
        '        <dc:Bounds x="1672" y="342" width="36" height="36" />\n'
        '        <bpmndi:BPMNLabel>\n'
        '          <dc:Bounds x="1666" y="386" width="48" height="27" />\n'
        '        </bpmndi:BPMNLabel>\n'
        '      </bpmndi:BPMNShape>',

        '      <bpmndi:BPMNShape id="SendTask_SP1Complete_di" bpmnElement="SendTask_SP1Complete">\n'
        '        <dc:Bounds x="1780" y="320" width="100" height="80" />\n'
        '      </bpmndi:BPMNShape>\n'
        '      <bpmndi:BPMNShape id="SP1_End_di" bpmnElement="SP1_End">\n'
        '        <dc:Bounds x="1942" y="342" width="36" height="36" />\n'
        '        <bpmndi:BPMNLabel>\n'
        '          <dc:Bounds x="1936" y="386" width="48" height="27" />\n'
        '        </bpmndi:BPMNLabel>\n'
        '      </bpmndi:BPMNShape>'
    )

    # Update Flow_SP1_5 waypoints: InitialTriage(1510+100=1610) → SendTask(1780)
    content = content.replace(
        '      <bpmndi:BPMNEdge id="Flow_SP1_5_di" bpmnElement="Flow_SP1_5">\n'
        '        <di:waypoint x="1610" y="360" />\n'
        '        <di:waypoint x="1672" y="360" />\n'
        '      </bpmndi:BPMNEdge>',

        '      <bpmndi:BPMNEdge id="Flow_SP1_5_di" bpmnElement="Flow_SP1_5">\n'
        '        <di:waypoint x="1610" y="360" />\n'
        '        <di:waypoint x="1780" y="360" />\n'
        '      </bpmndi:BPMNEdge>\n'
        '      <bpmndi:BPMNEdge id="Flow_SP1_Notify_di" bpmnElement="Flow_SP1_Notify">\n'
        '        <di:waypoint x="1880" y="360" />\n'
        '        <di:waypoint x="1942" y="360" />\n'
        '      </bpmndi:BPMNEdge>'
    )

    # --- SP2: SendTask at x=1062,y=100; SP2_End shifts from x=1062→x=1224 ---
    content = content.replace(
        '      <bpmndi:BPMNShape id="SP2_End_di" bpmnElement="SP2_End">\n'
        '        <dc:Bounds x="1062" y="122" width="36" height="36" />\n'
        '      </bpmndi:BPMNShape>',

        '      <bpmndi:BPMNShape id="SendTask_SP2Complete_di" bpmnElement="SendTask_SP2Complete">\n'
        '        <dc:Bounds x="1062" y="100" width="100" height="80" />\n'
        '      </bpmndi:BPMNShape>\n'
        '      <bpmndi:BPMNShape id="SP2_End_di" bpmnElement="SP2_End">\n'
        '        <dc:Bounds x="1224" y="122" width="36" height="36" />\n'
        '      </bpmndi:BPMNShape>'
    )

    # Update Flow_SP2_5 waypoints: PathwayRouting(913+100=1013) → SendTask(1062)
    content = content.replace(
        '      <bpmndi:BPMNEdge id="Flow_SP2_5_di" bpmnElement="Flow_SP2_5">\n'
        '        <di:waypoint x="1013" y="140" />\n'
        '        <di:waypoint x="1062" y="140" />\n'
        '      </bpmndi:BPMNEdge>',

        '      <bpmndi:BPMNEdge id="Flow_SP2_5_di" bpmnElement="Flow_SP2_5">\n'
        '        <di:waypoint x="1013" y="140" />\n'
        '        <di:waypoint x="1062" y="140" />\n'
        '      </bpmndi:BPMNEdge>\n'
        '      <bpmndi:BPMNEdge id="Flow_SP2_Notify_di" bpmnElement="Flow_SP2_Notify">\n'
        '        <di:waypoint x="1162" y="140" />\n'
        '        <di:waypoint x="1224" y="140" />\n'
        '      </bpmndi:BPMNEdge>'
    )

    # --- SP3: SendTask at x=1252,y=291; SP3_End shifts from x=1252→x=1414 ---
    content = content.replace(
        '      <bpmndi:BPMNShape id="SP3_End_di" bpmnElement="SP3_End">\n'
        '        <dc:Bounds x="1252" y="313" width="36" height="36" />\n'
        '      </bpmndi:BPMNShape>',

        '      <bpmndi:BPMNShape id="SendTask_SP3Complete_di" bpmnElement="SendTask_SP3Complete">\n'
        '        <dc:Bounds x="1252" y="291" width="100" height="80" />\n'
        '      </bpmndi:BPMNShape>\n'
        '      <bpmndi:BPMNShape id="SP3_End_di" bpmnElement="SP3_End">\n'
        '        <dc:Bounds x="1414" y="313" width="36" height="36" />\n'
        '      </bpmndi:BPMNShape>'
    )

    # Update Flow_SP3_5 waypoints: EvaluateVendorResponse(1097+100=1197) → SendTask(1252)
    content = content.replace(
        '      <bpmndi:BPMNEdge id="Flow_SP3_5_di" bpmnElement="Flow_SP3_5">\n'
        '        <di:waypoint x="1197" y="331" />\n'
        '        <di:waypoint x="1252" y="331" />\n'
        '      </bpmndi:BPMNEdge>',

        '      <bpmndi:BPMNEdge id="Flow_SP3_5_di" bpmnElement="Flow_SP3_5">\n'
        '        <di:waypoint x="1197" y="331" />\n'
        '        <di:waypoint x="1252" y="331" />\n'
        '      </bpmndi:BPMNEdge>\n'
        '      <bpmndi:BPMNEdge id="Flow_SP3_Notify_di" bpmnElement="Flow_SP3_Notify">\n'
        '        <di:waypoint x="1352" y="331" />\n'
        '        <di:waypoint x="1414" y="331" />\n'
        '      </bpmndi:BPMNEdge>'
    )

    # --- SP4: SendTask at x=1752,y=242; SP4_End shifts from x=1752→x=1914 ---
    content = content.replace(
        '      <bpmndi:BPMNShape id="SP4_End_shifted_di" bpmnElement="SP4_End">\n'
        '        <dc:Bounds x="1752" y="264" width="36" height="36" />\n'
        '      </bpmndi:BPMNShape>',

        '      <bpmndi:BPMNShape id="SendTask_SP4Complete_di" bpmnElement="SendTask_SP4Complete">\n'
        '        <dc:Bounds x="1752" y="242" width="100" height="80" />\n'
        '      </bpmndi:BPMNShape>\n'
        '      <bpmndi:BPMNShape id="SP4_End_shifted_di" bpmnElement="SP4_End">\n'
        '        <dc:Bounds x="1914" y="264" width="36" height="36" />\n'
        '      </bpmndi:BPMNShape>'
    )

    # Update Flow_1fshpro waypoints: GW_MergeExec(1650+50=1700) → SendTask(1752)
    content = content.replace(
        '      <bpmndi:BPMNEdge id="Flow_1fshpro_di" bpmnElement="Flow_1fshpro">\n'
        '        <di:waypoint x="1700" y="282" />\n'
        '        <di:waypoint x="1752" y="282" />\n'
        '      </bpmndi:BPMNEdge>',

        '      <bpmndi:BPMNEdge id="Flow_1fshpro_di" bpmnElement="Flow_1fshpro">\n'
        '        <di:waypoint x="1700" y="282" />\n'
        '        <di:waypoint x="1752" y="282" />\n'
        '      </bpmndi:BPMNEdge>\n'
        '      <bpmndi:BPMNEdge id="Flow_SP4_Notify_di" bpmnElement="Flow_SP4_Notify">\n'
        '        <di:waypoint x="1852" y="282" />\n'
        '        <di:waypoint x="1914" y="282" />\n'
        '      </bpmndi:BPMNEdge>'
    )

    # =========================================================================
    # VALIDATION
    # =========================================================================

    # Check no v8 flow references remain
    v8_refs = re.findall(r'Flow_v8_', content)
    if v8_refs:
        print(f"ERROR: {len(v8_refs)} stale Flow_v8_ references remain!")
        sys.exit(1)

    # Check all 4 SendTasks exist exactly once (inside sub-processes)
    for sp_num in [1, 2, 3, 4]:
        task_id = f"SendTask_SP{sp_num}Complete"
        count = content.count(f'id="{task_id}"')
        if count != 1:
            print(f"ERROR: {task_id} appears {count} times (expected 1)")
            sys.exit(1)

    # Check no duplicate DI IDs
    di_ids = re.findall(r'id="([^"]*_di)"', content)
    seen = set()
    dupes = set()
    for did in di_ids:
        if did in seen:
            dupes.add(did)
        seen.add(did)
    if dupes:
        print(f"ERROR: Duplicate DI IDs: {dupes}")
        sys.exit(1)

    # Check 4 new direct flows exist
    for flow_id in ["Flow_v5_2", "Flow_v5_5", "Flow_v5_8", "Flow_v5_13"]:
        if f'id="{flow_id}"' not in content:
            print(f"ERROR: Missing direct flow {flow_id}")
            sys.exit(1)

    # Check 4 internal notify flows exist
    for flow_id in ["Flow_SP1_Notify", "Flow_SP2_Notify", "Flow_SP3_Notify", "Flow_SP4_Notify"]:
        if f'id="{flow_id}"' not in content:
            print(f"ERROR: Missing internal notify flow {flow_id}")
            sys.exit(1)

    # Element count validation
    original_shapes = len(re.findall(r'bpmnElement=', original))
    new_shapes = len(re.findall(r'bpmnElement=', content))
    print(f"Original bpmnElement count: {original_shapes}")
    print(f"New bpmnElement count: {new_shapes}")

    with open(FILE, "w") as f:
        f.write(content)

    print("SUCCESS: v8 layout fix applied")
    print(f"File written: {FILE}")


if __name__ == "__main__":
    main()
