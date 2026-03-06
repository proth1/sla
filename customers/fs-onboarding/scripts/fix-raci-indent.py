#!/usr/bin/env python3
"""Fix indentation of RACI properties in onboarding v5 BPMN.

The initial insertion placed RACI lines at the position of </camunda:properties>,
inheriting its preceding whitespace. This script normalizes the indentation to match
sibling <camunda:property> elements in the same block.
"""

import re

BPMN_FILE = "processes/Onboarding-only/onboarding-to-be-ideal-state-v5.bpmn"

with open(BPMN_FILE, 'r') as f:
    lines = f.readlines()

fixed = []
i = 0
fixes = 0
while i < len(lines):
    line = lines[i]

    # Find RACI property lines with wrong indentation
    if 'name="raci_' in line:
        # Find the correct indentation by looking at the previous non-RACI property line
        # Walk backward to find a sibling camunda:property (topics or comments)
        ref_indent = None
        for j in range(len(fixed) - 1, max(len(fixed) - 10, -1), -1):
            prev = fixed[j]
            if 'name="topics"' in prev or 'name="comments"' in prev or 'name="regulation' in prev:
                ref_indent = len(prev) - len(prev.lstrip())
                break

        if ref_indent is not None:
            stripped = line.lstrip()
            current_indent = len(line) - len(line.lstrip())
            if current_indent != ref_indent:
                line = ' ' * ref_indent + stripped
                fixes += 1

    # Also fix the </camunda:properties> that lost its indentation after RACI insertion
    if '</camunda:properties>' in line:
        stripped = line.lstrip()
        current_indent = len(line) - len(line.lstrip())
        # It should be 2 spaces less than its child elements
        # Find the nearest preceding camunda:property to determine child indent
        for j in range(len(fixed) - 1, max(len(fixed) - 10, -1), -1):
            prev = fixed[j]
            if 'camunda:property' in prev:
                child_indent = len(prev) - len(prev.lstrip())
                expected_indent = child_indent - 2
                if expected_indent > 0 and current_indent != expected_indent:
                    line = ' ' * expected_indent + stripped
                    fixes += 1
                break

    fixed.append(line)
    i += 1

with open(BPMN_FILE, 'w') as f:
    f.writelines(fixed)

print(f"Fixed {fixes} indentation issues")
