#!/usr/bin/env python3
"""Add RACI properties and update candidateGroups in onboarding v5 BPMN."""

import re
import sys

BPMN_FILE = "processes/Onboarding-only/onboarding-to-be-ideal-state-v5.bpmn"

# --- Part 1: candidateGroup reassignments ---
CANDIDATE_GROUP_CHANGES = {
    'Task_FinancialAnalysis': 'finance-lane',
    'Task_RefineRequirements': 'business-lane',
    'Task_DefineBuildReqs': 'business-lane',
}

# --- Part 2: RACI per task ---
# Format: task_id -> (R, A, C, I) where C and I can be empty string
RACI_MAP = {
    # SP1
    'Task_ReviewExisting':       ('Business', 'Business', 'Governance', ''),
    'Task_LeverageExisting':     ('Business', 'Business', 'Governance', ''),
    'Task_GatherDocs':           ('Business', 'Business', 'Finance, Privacy', ''),
    'Task_SubmitRequest':        ('Business', 'Business', 'Governance', ''),
    'Task_InitialTriage':        ('Governance', 'Governance', 'Compliance, TPRM', 'Business'),
    # SP2
    'Task_PrelimAnalysis':       ('Governance', 'Governance', 'Finance, Privacy', 'Business'),
    'Task_Backlog':              ('Governance', 'Governance', 'Business', ''),
    'Task_PathwayRouting':       ('Governance', 'Governance', 'Business, Technical Assessment', ''),
    # SP3
    'Task_TechArchReview':       ('Technical Assessment', 'Technical Assessment', 'Governance', ''),
    'Task_SecurityAssessment':   ('Technical Assessment', 'Technical Assessment', 'Compliance', ''),
    'Task_RiskCompliance':       ('Compliance', 'Compliance', 'Governance, Privacy', ''),
    'Task_FinancialAnalysis':    ('Finance', 'Finance', 'Governance, Procurement', ''),
    'Task_AssessVendorLandscape':('Procurement', 'Procurement', 'Governance', 'Oversight'),
    'Task_AIGovernanceReview':   ('AI Review', 'AI Review', 'Technical Assessment, Compliance', 'Governance'),
    'Task_VendorDueDiligence':   ('Procurement', 'Governance', 'Compliance', 'Oversight'),
    'Receive_VendorResponse':    ('Procurement', 'Procurement', '', ''),
    'Task_EvaluateVendorResponse':('Procurement', 'Governance', 'Technical Assessment', ''),
    # SP4 Buy path
    'Task_RefineRequirements':   ('Business', 'Governance', 'Technical Assessment, Compliance', ''),
    'Task_PerformPoC':           ('Technical Assessment', 'Technical Assessment', 'Business, Compliance', ''),
    'Task_TechRiskEval':         ('Technical Assessment', 'Technical Assessment', 'Governance, Compliance', ''),
    'Task_NegotiateContract':    ('Contracting', 'Contracting', 'Finance, Governance', 'Oversight'),
    'Task_FinalizeContract':     ('Contracting', 'Contracting', 'Governance, Compliance', 'Oversight'),
    # SP4 Build path
    'Task_DefineBuildReqs':      ('Business', 'Business', 'Technical Assessment, Privacy', 'Governance'),
    'PDLC_ArchReview':           ('Technical Assessment', 'Technical Assessment', 'Governance', ''),
    'PDLC_Development':          ('Technical Assessment', 'Technical Assessment', 'Business', ''),
    'PDLC_Testing':              ('Technical Assessment', 'Technical Assessment', 'Compliance', ''),
    'PDLC_Integration':          ('Technical Assessment', 'Technical Assessment', 'Compliance', ''),
    # SP5
    'Task_PerformUAT':           ('Business', 'Business', 'Compliance', 'Governance'),
    'Task_FinalApproval':        ('Oversight', 'Oversight', 'Governance, Compliance', 'Business'),
    'Task_OnboardSoftware':      ('Automation', 'Automation', 'Technical Assessment', 'Governance'),
    'Activity_0zf4l0g':          ('Automation', 'Governance', '', 'Business'),
    'Task_CloseRequest':         ('Governance', 'Governance', 'Business', 'Oversight'),
    # Vendor pool
    'Task_VendorIntake':         ('Vendor', 'Vendor', 'Procurement', ''),
    'Task_VendorProposal':       ('Vendor', 'Vendor', 'Procurement', ''),
    'Task_VendorSecurityReview': ('Vendor', 'Vendor', 'Technical Assessment', ''),
    'Task_VendorComplianceReview':('Vendor', 'Vendor', 'Compliance', ''),
    'Task_VendorTechDemo':       ('Vendor', 'Vendor', 'Technical Assessment', ''),
    'Task_VendorContractReview': ('Vendor', 'Vendor', 'Contracting', ''),
    'Task_VendorContractSign':   ('Vendor', 'Vendor', 'Contracting', ''),
    'Task_VendorOnboarding':     ('Vendor', 'Vendor', 'Procurement', ''),
    'Task_VendorDeploySupport':  ('Vendor', 'Vendor', 'Technical Assessment', ''),
    'Task_VendorCloseRequest':   ('Vendor', 'Vendor', 'Procurement', ''),
}


def main():
    with open(BPMN_FILE, 'r', encoding='utf-8') as f:
        content = f.read()

    original_lines = content.count('\n')

    # Step 1: Update candidateGroups
    for task_id, new_group in CANDIDATE_GROUP_CHANGES.items():
        # Match the task declaration line with its current candidateGroups
        pattern = rf'(id="{task_id}"[^>]*camunda:candidateGroups=")[^"]*(")'
        match = re.search(pattern, content)
        if match:
            old = match.group(0)
            new = match.group(1) + new_group + match.group(2)
            content = content.replace(old, new, 1)
            print(f"  candidateGroups: {task_id} -> {new_group}")
        else:
            print(f"  WARNING: Could not find candidateGroups for {task_id}")

    # Step 2: Add RACI properties to each task
    added = 0
    skipped = 0
    for task_id, (r, a, c, i) in RACI_MAP.items():
        # Check if RACI already exists for this task
        if f'id="{task_id}"' not in content:
            print(f"  WARNING: Task {task_id} not found in BPMN")
            skipped += 1
            continue

        # Build RACI property lines
        raci_lines = []
        raci_lines.append(f'            <camunda:property name="raci_r" value="{r}" />')
        raci_lines.append(f'            <camunda:property name="raci_a" value="{a}" />')
        if c:
            raci_lines.append(f'            <camunda:property name="raci_c" value="{c}" />')
        if i:
            raci_lines.append(f'            <camunda:property name="raci_i" value="{i}" />')
        raci_block = '\n'.join(raci_lines)

        # Find the task's camunda:properties block and add RACI before </camunda:properties>
        # Strategy: find the task element, then find its </camunda:properties> closing tag
        # We need to find the right </camunda:properties> that belongs to this task

        # For nested tasks (PDLC_*), indentation is deeper
        is_nested = task_id.startswith('PDLC_')

        # Find the task declaration
        task_pattern = rf'id="{task_id}"'
        task_match = re.search(task_pattern, content)
        if not task_match:
            continue

        task_pos = task_match.start()

        # Find the next </camunda:properties> after this task
        props_close = '</camunda:properties>'
        props_pos = content.find(props_close, task_pos)
        if props_pos == -1:
            print(f"  WARNING: No </camunda:properties> found for {task_id}")
            skipped += 1
            continue

        # Check if raci_r already exists between task_pos and props_pos
        segment = content[task_pos:props_pos]
        if 'raci_r' in segment:
            print(f"  SKIP: {task_id} already has RACI properties")
            skipped += 1
            continue

        # Adjust indentation for nested PDLC tasks
        if is_nested:
            raci_block = raci_block.replace('            <camunda:', '              <camunda:')

        # Insert RACI lines before </camunda:properties>
        insert_point = props_pos
        content = content[:insert_point] + raci_block + '\n' + content[insert_point:]
        added += 1

    # Verify
    raci_count = content.count('name="raci_r"')
    print(f"\n  Results: {added} tasks updated, {skipped} skipped")
    print(f"  Total raci_r properties: {raci_count}")
    print(f"  Original lines: {original_lines}, New lines: {content.count(chr(10))}")

    with open(BPMN_FILE, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"  Written to {BPMN_FILE}")
    return 0


if __name__ == '__main__':
    sys.exit(main())
