#!/usr/bin/env python3
"""Fix v6-c8 BPMN model for Camunda 8 deployment.

Changes:
1. Add FEEL condition expressions to all XOR gateway conditional flows
2. Convert receive tasks to user tasks with mock forms
3. Convert service task (Notify Requester) to user task
4. Convert business rule task (Pathway Routing) to user task
5. Remove standalone intermediate catch timer (no incoming flow = invalid)
6. Remove message event definition from vendor start (make it plain start)
7. Set vendor process isExecutable="false" (only one executable process per deployment)
"""

import re
import os

BPMN_PATH = "customers/fs-onboarding/processes/camunda-sync/onboarding-to-be-ideal-state-v6-c8.bpmn"
FORMS_DIR = "customers/fs-onboarding/processes/camunda-sync"

def read_file(path):
    with open(path, 'r') as f:
        return f.read()

def write_file(path, content):
    with open(path, 'w') as f:
        f.write(content)

def fix_bpmn():
    content = read_file(BPMN_PATH)

    # =========================================================
    # 1. Add FEEL condition expressions to conditional flows
    # =========================================================
    # Map: flow_id -> (variable, value)
    # Enterprise top-level gateways
    conditions = {
        # GW_TriageDecision "Approved?"
        'Flow_v5_3': ('approved', '= true'),   # Yes -> Planning
        'Flow_v5_4': ('approved', '= false'),   # No -> Rejected

        # GW_BuyVsBuild "Do we Build?"
        'Flow_v5_6': ('buildPathway', '= false'),  # No (Buy) -> EvalDD
        'Flow_v5_7': ('buildPathway', '= true'),   # Yes (Build) -> merge

        # GW_VendorSelected "Vendor Selected?"
        'Flow_v5_9': ('vendorSelected', '= false'),  # No
        'Flow_v5_10': ('vendorSelected', '= true'),   # Yes

        # GW_EvalApproved "Evaluation Approved?"
        'Flow_v5_11': ('evalApproved', '= false'),  # No
        'Flow_v5_12': ('evalApproved', '= true'),   # Yes

        # GW_FinalDecision "Approved?"
        'Flow_v5_15': ('finalApproved', '= true'),   # Yes
        'Flow_v5_16': ('finalApproved', '= false'),   # No

        # SP1: GW_BypassProcess "Bypass formal process?"
        'Flow_SP1_Yes': ('bypassProcess', '= true'),
        'Flow_SP1_No': ('bypassProcess', '= false'),

        # SP2: GW_NeedsAssessment "Needs further assessment?"
        'Flow_SP2_Yes': ('needsAssessment', '= true'),
        'Flow_SP2_No': ('needsAssessment', '= false'),

        # SP4: GW_PathwayExec "Pathway Execution"
        'Flow_SP4_Buy': ('selectedPathway', '= "buy"'),    # No (Buy)
        'Flow_SP4_Build': ('selectedPathway', '= "build"'), # Yes (Build)

        # PDLC: PDLC_GW_TestResult "Tests Passed?"
        'Flow_PDLC_Yes': ('testsPassed', '= true'),
        'Flow_PDLC_No': ('testsPassed', '= false'),

        # Vendor: GW_VendorQualified "Vendor Qualified?"
        'Flow_V_QualYes': ('vendorQualified', '= true'),
        'Flow_V_QualNo': ('vendorQualified', '= false'),
    }

    for flow_id, (var, expr) in conditions.items():
        # Find the sequence flow and add conditionExpression if not present
        pattern = rf'(<bpmn:sequenceFlow id="{flow_id}"[^/]*)(/>|>)'
        match = re.search(pattern, content)
        if match:
            full_tag = match.group(0)
            # Check if it's self-closing or has children
            if full_tag.endswith('/>'):
                # Convert to open/close with condition
                replacement = match.group(1).rstrip() + '>\n      <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">' + expr + '</bpmn:conditionExpression>\n    </bpmn:sequenceFlow>'
                content = content.replace(full_tag, replacement)
            elif '</bpmn:sequenceFlow>' not in content[match.start():match.start()+500]:
                # Self-closing with >
                pass  # shouldn't happen

    # =========================================================
    # 2. Convert receive tasks to user tasks with mock forms
    # =========================================================

    # Receive_VendorResponse -> userTask with mock form
    content = content.replace(
        '<bpmn:receiveTask id="Receive_VendorResponse" name="Await Vendor&#10;Response">',
        '<bpmn:userTask id="Receive_VendorResponse" name="Await Vendor&#10;Response">'
    )
    content = content.replace('</bpmn:receiveTask>', '</bpmn:userTask>', 1)
    # Add form and assignment to Receive_VendorResponse
    old_ext_vendor_resp = '''<bpmn:extensionElements>
          <zeebe:properties>
            <zeebe:property name="topics" value="Sourcing" />
            <zeebe:property name="raci_r" value="Procurement" />
            <zeebe:property name="raci_a" value="Procurement" />
          </zeebe:properties>
        </bpmn:extensionElements>'''
    new_ext_vendor_resp = '''<bpmn:extensionElements>
      <zeebe:formDefinition formId="mock-await-vendor-response" />
      <zeebe:assignmentDefinition candidateGroups="procurement-lane" />
          <zeebe:properties>
            <zeebe:property name="topics" value="Sourcing" />
            <zeebe:property name="raci_r" value="Procurement" />
            <zeebe:property name="raci_a" value="Procurement" />
          </zeebe:properties>
        </bpmn:extensionElements>'''
    content = content.replace(old_ext_vendor_resp, new_ext_vendor_resp, 1)

    # Receive_SignedContract -> userTask with mock form
    content = content.replace(
        '<bpmn:receiveTask id="Receive_SignedContract" name="Await Signed&#10;Contract">',
        '<bpmn:userTask id="Receive_SignedContract" name="Await Signed&#10;Contract">'
    )
    content = content.replace('</bpmn:receiveTask>', '</bpmn:userTask>', 1)
    # Add extension elements (currently has none)
    old_receive_contract = '''<bpmn:userTask id="Receive_SignedContract" name="Await Signed&#10;Contract">
        <bpmn:incoming>Flow_SP4_5</bpmn:incoming>
        <bpmn:outgoing>Flow_SP4_6</bpmn:outgoing>
      </bpmn:userTask>'''
    new_receive_contract = '''<bpmn:userTask id="Receive_SignedContract" name="Await Signed&#10;Contract">
        <bpmn:extensionElements>
      <zeebe:formDefinition formId="mock-await-signed-contract" />
      <zeebe:assignmentDefinition candidateGroups="contracting-lane" />
        </bpmn:extensionElements>
        <bpmn:incoming>Flow_SP4_5</bpmn:incoming>
        <bpmn:outgoing>Flow_SP4_6</bpmn:outgoing>
      </bpmn:userTask>'''
    content = content.replace(old_receive_contract, new_receive_contract)

    # =========================================================
    # 3. Convert service task (Notify Requester) to user task
    # =========================================================
    content = content.replace(
        '<bpmn:serviceTask id="Activity_0zf4l0g" name="Notify Requester">',
        '<bpmn:userTask id="Activity_0zf4l0g" name="Notify Requester">'
    )
    content = content.replace('</bpmn:serviceTask>', '</bpmn:userTask>', 1)
    # Replace zeebe:taskDefinition with formDefinition
    content = content.replace(
        '<zeebe:taskDefinition type="notify-requester" />',
        '<zeebe:formDefinition formId="mock-notify-requester" />\n      <zeebe:assignmentDefinition candidateGroups="automation-lane" />'
    )

    # =========================================================
    # 4. Convert business rule task (Pathway Routing) to user task
    # =========================================================
    content = content.replace(
        '<bpmn:businessRuleTask id="Task_PathwayRouting" name="Pathway&#10;Routing">',
        '<bpmn:userTask id="Task_PathwayRouting" name="Pathway&#10;Routing">'
    )
    content = content.replace('</bpmn:businessRuleTask>', '</bpmn:userTask>', 1)
    # Replace zeebe:calledDecision with formDefinition
    content = content.replace(
        '<zeebe:calledDecision decisionId="OB_DMN_PathwayRouting" resultVariable="selectedPathway" />',
        '<zeebe:formDefinition formId="mock-pathway-routing" />\n      <zeebe:assignmentDefinition candidateGroups="governance-lane" />'
    )

    # =========================================================
    # 5. Remove standalone intermediate catch timer (SP1)
    # The Timer_TriageSLA has no incoming flow - it's disconnected
    # Remove timer, its flow, and the SLA escalation end event
    # =========================================================
    # Remove the timer element
    content = re.sub(
        r'\s*<bpmn:intermediateCatchEvent id="Timer_TriageSLA".*?</bpmn:intermediateCatchEvent>',
        '', content, flags=re.DOTALL
    )
    # Remove the SLA escalation end event
    content = re.sub(
        r'\s*<bpmn:endEvent id="End_TriageSLAEscalation".*?</bpmn:endEvent>',
        '', content, flags=re.DOTALL
    )
    # Remove the flow between them
    content = re.sub(
        r'\s*<bpmn:sequenceFlow id="Flow_SP1_SLA"[^/]*/>\n?',
        '\n', content
    )
    # Also need to handle if it has conditionExpression children
    content = re.sub(
        r'\s*<bpmn:sequenceFlow id="Flow_SP1_SLA".*?</bpmn:sequenceFlow>\n?',
        '\n', content, flags=re.DOTALL
    )

    # =========================================================
    # 6. Remove message event definition from vendor start event
    # Make it a plain start event so it can be started independently
    # =========================================================
    content = content.replace(
        '      <bpmn:messageEventDefinition id="MsgDef_VendorEngagement" />\n',
        ''
    )

    # =========================================================
    # 7. Set vendor process isExecutable="false"
    # Only one process can be executable per deployment
    # =========================================================
    content = content.replace(
        '<bpmn:process id="Process_Vendor" name="Vendor / Third Party" isExecutable="true">',
        '<bpmn:process id="Process_Vendor" name="Vendor / Third Party" isExecutable="false">'
    )

    # =========================================================
    # 8. Remove DI elements for deleted timer and end event
    # =========================================================
    content = re.sub(
        r'\s*<bpmndi:BPMNShape id="Timer_TriageSLA_di".*?</bpmndi:BPMNShape>',
        '', content, flags=re.DOTALL
    )
    content = re.sub(
        r'\s*<bpmndi:BPMNShape id="End_TriageSLAEscalation_di".*?</bpmndi:BPMNShape>',
        '', content, flags=re.DOTALL
    )
    content = re.sub(
        r'\s*<bpmndi:BPMNEdge id="Flow_SP1_SLA_di".*?</bpmndi:BPMNEdge>',
        '', content, flags=re.DOTALL
    )

    write_file(BPMN_PATH, content)
    print(f"Fixed BPMN: {BPMN_PATH}")


def create_mock_forms():
    """Create mock forms for converted tasks."""

    mock_forms = {
        "mock-await-vendor-response.form": {
            "id": "Form_MockAwaitVendorResponse",
            "title": "Await Vendor Response (Mock)",
            "fields": [
                {"type": "text", "text": "## Await Vendor Response\\n\\nThis is a mock task replacing the receive task. In production, this would wait for a message from the vendor. For testing, complete this form to simulate the vendor response."},
                {"type": "textfield", "key": "vendorResponseSummary", "label": "Vendor Response Summary", "required": True},
                {"type": "select", "key": "vendorSelected", "label": "Vendor Selected?", "required": True,
                 "values": [{"label": "Yes", "value": "true"}, {"label": "No", "value": "false"}]}
            ]
        },
        "mock-await-signed-contract.form": {
            "id": "Form_MockAwaitSignedContract",
            "title": "Await Signed Contract (Mock)",
            "fields": [
                {"type": "text", "text": "## Await Signed Contract\\n\\nThis is a mock task replacing the receive task. In production, this would wait for the vendor to return the signed contract. For testing, complete this form to simulate contract receipt."},
                {"type": "textfield", "key": "contractReference", "label": "Contract Reference Number", "required": True},
                {"type": "radio", "key": "contractSigned", "label": "Contract Signed?", "required": True,
                 "values": [{"label": "Yes", "value": "yes"}, {"label": "No", "value": "no"}]}
            ]
        },
        "mock-notify-requester.form": {
            "id": "Form_MockNotifyRequester",
            "title": "Notify Requester (Mock)",
            "fields": [
                {"type": "text", "text": "## Notify Requester\\n\\nThis is a mock task replacing the service task. In production, this would send an automated notification. For testing, review and confirm the notification."},
                {"type": "textarea", "key": "notificationMessage", "label": "Notification Message", "required": True},
                {"type": "radio", "key": "notificationSent", "label": "Notification Confirmed?", "required": True,
                 "values": [{"label": "Yes", "value": "yes"}, {"label": "No", "value": "no"}]}
            ]
        },
        "mock-pathway-routing.form": {
            "id": "Form_MockPathwayRouting",
            "title": "Pathway Routing (Mock)",
            "fields": [
                {"type": "text", "text": "## Pathway Routing\\n\\nThis is a mock task replacing the DMN business rule task (OB_DMN_PathwayRouting). In production, this would be automatically determined by the DMN decision table. For testing, select the pathway manually."},
                {"type": "select", "key": "selectedPathway", "label": "Selected Pathway", "required": True,
                 "values": [{"label": "Buy", "value": "buy"}, {"label": "Build", "value": "build"}]},
                {"type": "textarea", "key": "routingRationale", "label": "Routing Rationale"}
            ]
        }
    }

    for filename, form_def in mock_forms.items():
        form_json = build_form_json(form_def)
        path = os.path.join(FORMS_DIR, filename)
        write_file(path, form_json)
        print(f"Created mock form: {path}")


def build_form_json(form_def):
    """Build a Camunda 8 form JSON from a simplified definition."""
    import json

    components = []
    field_num = 1

    for field in form_def["fields"]:
        comp = {"id": f"Field_{field_num:03d}"}

        if field["type"] == "text":
            comp["type"] = "text"
            comp["text"] = field["text"]
        elif field["type"] == "textfield":
            comp["type"] = "textfield"
            comp["key"] = field["key"]
            comp["label"] = field["label"]
            if field.get("required"):
                comp["validate"] = {"required": True}
        elif field["type"] == "textarea":
            comp["type"] = "textarea"
            comp["key"] = field["key"]
            comp["label"] = field["label"]
            if field.get("required"):
                comp["validate"] = {"required": True}
        elif field["type"] == "select":
            comp["type"] = "select"
            comp["key"] = field["key"]
            comp["label"] = field["label"]
            comp["values"] = field["values"]
            if field.get("required"):
                comp["validate"] = {"required": True}
        elif field["type"] == "radio":
            comp["type"] = "radio"
            comp["key"] = field["key"]
            comp["label"] = field["label"]
            comp["values"] = field["values"]
            if field.get("required"):
                comp["validate"] = {"required": True}

        components.append(comp)
        field_num += 1

    form = {
        "executionPlatform": "Camunda Cloud",
        "executionPlatformVersion": "8.6.0",
        "exporter": {
            "name": "Camunda Modeler",
            "version": "5.28.0"
        },
        "schemaVersion": 16,
        "id": form_def["id"],
        "components": components,
        "type": "default"
    }

    return json.dumps(form, indent=2) + "\n"


if __name__ == "__main__":
    fix_bpmn()
    create_mock_forms()
    print("\nDone! Changes applied:")
    print("  - Added FEEL conditions to all XOR gateway flows")
    print("  - Converted receive tasks to user tasks with mock forms")
    print("  - Converted service task to user task with mock form")
    print("  - Converted business rule task to user task with mock form")
    print("  - Removed disconnected timer and SLA escalation")
    print("  - Removed message event from vendor start (plain start)")
    print("  - Set vendor process isExecutable=false")
