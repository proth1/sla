#!/usr/bin/env python3
"""Migrate BPMN from Camunda 7 to Camunda 8 (Zeebe).

Transforms:
- camunda: namespace → zeebe: extension elements
- candidateGroups → zeebe:assignmentDefinition
- formKey → zeebe:formDefinition with formId
- decisionRef → zeebe:calledDecision
- camunda:properties → zeebe:properties
- historyTimeToLive → removed
- isExecutable=false → true
"""

import re
import sys
from pathlib import Path

# Form ID mapping: task ID → form filename (without .form extension)
FORM_MAP = {
    "Task_ReviewExisting": "sp1-review-existing",
    "Task_LeverageExisting": "sp1-leverage-existing",
    "Task_GatherDocs": "sp1-gather-documentation",
    "Task_SubmitRequest": "sp1-submit-request",
    "Task_InitialTriage": "sp1-initial-triage",
    "Task_PrelimAnalysis": "sp2-preliminary-analysis",
    "Task_Backlog": "sp2-backlog-prioritization",
    "Task_TechArchReview": "sp3-tech-arch-review",
    "Task_SecurityAssessment": "sp3-security-assessment",
    "Task_RiskCompliance": "sp3-risk-compliance",
    "Task_FinancialAnalysis": "sp3-financial-analysis",
    "Task_AssessVendorLandscape": "sp3-assess-vendor-landscape",
    "Task_VendorDueDiligence": "sp3-vendor-due-diligence",
    "Task_EvaluateVendorResponse": "sp3-evaluate-vendor-response",
    "Task_AIGovernanceReview": "sp3-ai-governance-review",
    "Task_RefineRequirements": "sp4-refine-requirements",
    "Task_PerformPoC": "sp4-perform-poc",
    "Task_TechRiskEval": "sp4-tech-risk-eval",
    "Task_NegotiateContract": "sp4-negotiate-contract",
    "Task_FinalizeContract": "sp4-finalize-contract",
    "Task_DefineBuildReqs": "sp4-define-build-reqs",
    "PDLC_ArchReview": "pdlc-arch-review",
    "PDLC_Development": "pdlc-development",
    "PDLC_Testing": "pdlc-testing",
    "PDLC_Integration": "pdlc-integration",
    "Task_PerformUAT": "sp5-perform-uat",
    "Task_FinalApproval": "sp5-final-approval",
    "Task_OnboardSoftware": "sp5-onboard-software",
    "Task_CloseRequest": "sp5-close-request",
    "Task_VendorIntake": "vendor-intake",
    "Task_VendorProposal": "vendor-proposal",
    "Task_VendorContractReview": "vendor-contract-review",
    "Task_VendorContractSign": "vendor-contract-sign",
    "Task_VendorOnboarding": "vendor-onboarding",
    "Task_VendorDeploySupport": "vendor-deploy-support",
    "Task_VendorCloseRequest": "vendor-close-request",
    "Task_VendorTechDemo": "vendor-tech-demo",
    "Task_VendorSecurityReview": "vendor-security-review",
    "Task_VendorComplianceReview": "vendor-compliance-review",
}


def migrate(src: str) -> str:
    xml = Path(src).read_text(encoding="utf-8")

    # 1. Add zeebe namespace to definitions
    xml = xml.replace(
        'xmlns:camunda="http://camunda.org/schema/1.0/bpmn"',
        'xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" xmlns:camunda="http://camunda.org/schema/1.0/bpmn"',
    )

    # 2. Replace exporter version
    xml = re.sub(
        r'exporter="Camunda Modeler" exporterVersion="[^"]*"',
        'exporter="Camunda Modeler" exporterVersion="5.28.0"',
        xml,
    )

    # 3. Set isExecutable="true" on all processes
    xml = xml.replace('isExecutable="false"', 'isExecutable="true"')

    # 4. Remove camunda:historyTimeToLive from process elements
    xml = re.sub(r'\s*camunda:historyTimeToLive="[^"]*"', '', xml)

    # 5. Transform userTask elements: extract candidateGroups and formKey,
    #    replace with zeebe extensions
    def transform_user_task(match):
        full = match.group(0)
        task_id_m = re.search(r'id="([^"]*)"', full)
        task_id = task_id_m.group(1) if task_id_m else None

        # Extract candidateGroups
        cg_m = re.search(r'camunda:candidateGroups="([^"]*)"', full)
        candidate_groups = cg_m.group(1) if cg_m else None

        # Extract formKey
        fk_m = re.search(r'camunda:formKey="([^"]*)"', full)

        # Remove camunda attributes from the opening tag
        full = re.sub(r'\s*camunda:candidateGroups="[^"]*"', '', full)
        full = re.sub(r'\s*camunda:formKey="[^"]*"', '', full)

        # Build zeebe extension elements
        zeebe_elements = []

        # Form definition — use our form map
        form_id = FORM_MAP.get(task_id)
        if form_id:
            zeebe_elements.append(
                f'      <zeebe:formDefinition formId="{form_id}" />'
            )

        # Assignment definition
        if candidate_groups:
            zeebe_elements.append(
                f'      <zeebe:assignmentDefinition candidateGroups="{candidate_groups}" />'
            )

        if zeebe_elements:
            zeebe_block = "\n".join(zeebe_elements)
            # Check if extensionElements already exist
            if "<bpmn:extensionElements>" in full:
                # Insert zeebe elements at the start of existing extensionElements
                full = full.replace(
                    "<bpmn:extensionElements>",
                    "<bpmn:extensionElements>\n" + zeebe_block,
                )
            else:
                # Find the closing > of the userTask opening tag or the first child
                # Insert extensionElements before the first child element
                full = re.sub(
                    r'(>)\s*\n(\s*<bpmn:documentation)',
                    r'>\n      <bpmn:extensionElements>\n' + zeebe_block +
                    r'\n      </bpmn:extensionElements>\n\2',
                    full,
                )
                if "<bpmn:extensionElements>" not in full:
                    # Fallback: insert before first <bpmn: child
                    full = re.sub(
                        r'(>)\s*\n(\s*<bpmn:incoming)',
                        r'>\n      <bpmn:extensionElements>\n' + zeebe_block +
                        r'\n      </bpmn:extensionElements>\n\2',
                        full,
                    )

        return full

    # Match each userTask block (opening tag through closing tag)
    xml = re.sub(
        r'<bpmn:userTask[^>]*>.*?</bpmn:userTask>',
        transform_user_task,
        xml,
        flags=re.DOTALL,
    )

    # 6. Transform businessRuleTask elements (DMN references)
    def transform_brt(match):
        full = match.group(0)
        task_id_m = re.search(r'id="([^"]*)"', full)

        # Extract camunda DMN attributes
        dr_m = re.search(r'camunda:decisionRef="([^"]*)"', full)
        rv_m = re.search(r'camunda:resultVariable="([^"]*)"', full)

        decision_id = dr_m.group(1) if dr_m else None
        result_var = rv_m.group(1) if rv_m else None

        # Remove camunda attributes
        full = re.sub(r'\s*camunda:decisionRef="[^"]*"', '', full)
        full = re.sub(r'\s*camunda:decisionRefBinding="[^"]*"', '', full)
        full = re.sub(r'\s*camunda:resultVariable="[^"]*"', '', full)
        full = re.sub(r'\s*camunda:mapDecisionResult="[^"]*"', '', full)

        # Build zeebe extension
        if decision_id:
            zeebe = f'      <zeebe:calledDecision decisionId="{decision_id}" resultVariable="{result_var or "decisionResult"}" />'
            if "<bpmn:extensionElements>" in full:
                full = full.replace(
                    "<bpmn:extensionElements>",
                    "<bpmn:extensionElements>\n" + zeebe,
                )
            else:
                full = re.sub(
                    r'(>)\s*\n(\s*<bpmn:)',
                    r'>\n      <bpmn:extensionElements>\n' + zeebe +
                    r'\n      </bpmn:extensionElements>\n\2',
                    full,
                    count=1,
                )

        return full

    xml = re.sub(
        r'<bpmn:businessRuleTask[^>]*>.*?</bpmn:businessRuleTask>',
        transform_brt,
        xml,
        flags=re.DOTALL,
    )

    # 7. Transform sendTask to serviceTask with zeebe:taskDefinition
    xml = re.sub(
        r'<bpmn:sendTask\b',
        '<bpmn:serviceTask',
        xml,
    )
    xml = re.sub(
        r'</bpmn:sendTask>',
        '</bpmn:serviceTask>',
        xml,
    )
    # Add zeebe:taskDefinition to the converted sendTask (Activity_0zf4l0g)
    xml = xml.replace(
        '<bpmn:serviceTask id="Activity_0zf4l0g" name="Notify Requester">',
        '<bpmn:serviceTask id="Activity_0zf4l0g" name="Notify Requester">'
    )
    # Insert zeebe task definition
    if 'id="Activity_0zf4l0g"' in xml:
        xml = re.sub(
            r'(<bpmn:serviceTask id="Activity_0zf4l0g" name="Notify Requester">)\s*\n(\s*<bpmn:extensionElements>)',
            r'\1\n\2\n      <zeebe:taskDefinition type="notify-requester" />',
            xml,
        )

    # 8. Transform camunda:properties to zeebe:properties
    xml = xml.replace('<camunda:properties>', '<zeebe:properties>')
    xml = xml.replace('</camunda:properties>', '</zeebe:properties>')
    xml = xml.replace('<camunda:property ', '<zeebe:property ')

    # 10. Update process names
    xml = xml.replace(
        'Product Management — Software Onboarding (Hierarchical)',
        'Product Management — Software Onboarding (Camunda 8)',
    )

    return xml


if __name__ == "__main__":
    src = sys.argv[1] if len(sys.argv) > 1 else "processes/Onboarding-only/onboarding-to-be-ideal-state-v5.bpmn"
    dst = sys.argv[2] if len(sys.argv) > 2 else "processes/Onboarding-only/onboarding-to-be-ideal-state-v6-c8.bpmn"

    result = migrate(src)
    Path(dst).write_text(result, encoding="utf-8")
    print(f"Migrated {src} → {dst}")

    # Verify key transformations
    checks = [
        ('xmlns:zeebe', 'Zeebe namespace'),
        ('zeebe:formDefinition', 'Form definitions'),
        ('zeebe:assignmentDefinition', 'Assignment definitions'),
        ('zeebe:calledDecision', 'Called decisions'),
        ('zeebe:properties', 'Properties migration'),
        ('isExecutable="true"', 'Executable flag'),
    ]
    for pattern, label in checks:
        count = result.count(pattern)
        status = "OK" if count > 0 else "MISSING"
        print(f"  {status}: {label} ({count} occurrences)")

    # Check no residual camunda attributes on tasks
    residual = len(re.findall(r'camunda:candidateGroups', result))
    print(f"  {'WARN' if residual > 0 else 'OK'}: Residual camunda:candidateGroups ({residual})")
    residual_fk = len(re.findall(r'camunda:formKey', result))
    print(f"  {'WARN' if residual_fk > 0 else 'OK'}: Residual camunda:formKey ({residual_fk})")
    residual_dr = len(re.findall(r'camunda:decisionRef', result))
    print(f"  {'WARN' if residual_dr > 0 else 'OK'}: Residual camunda:decisionRef ({residual_dr})")
