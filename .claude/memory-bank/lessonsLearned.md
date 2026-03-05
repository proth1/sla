# Lessons Learned

## BPMN File Editing Safety (2026-03-05)

### Never Use Python XML Parse/Serialize on BPMN Files

**Problem**: Python's `lxml` and `ElementTree` libraries silently drop elements during round-trip parse/serialize. In the onboarding v4 fix, `lxml` dropped `Activity_0zf4l0g` and `Flow_0033t8v` — elements the user had manually added in Camunda Modeler.

**Root cause**: XML serializers may strip empty elements, reorder attributes, or drop elements with namespace edge cases. BPMN files are especially vulnerable because they contain two sections (process XML + DI/layout XML) that reference each other.

**Solution**: Use targeted string edits (Claude's `Edit` tool with exact `old_string` → `new_string` replacements). This preserves all existing content and only changes what's explicitly targeted.

### Always Verify the Correct Base File

**Problem**: The fix script operated on `processes/Onboarding-only/` (a stale copy) instead of the user's authoritative `processes/onboarding-to-be-ideal-state-v4.bpmn` (root). The stale copy was missing the user's manual Camunda Modeler changes.

**Solution**: Before any automated edit:
1. Identify which file is authoritative (check modification timestamps, ask the user)
2. Copy authoritative → working copy
3. Apply edits to the working copy
4. Verify element count before and after

### Element Count Verification After Automated Edits

After any automated BPMN edit, verify:
```bash
# Count before
grep -c 'bpmnElement=' before.bpmn
# Count after
grep -c 'bpmnElement=' after.bpmn
# Should match or differ only by intentional additions/removals
```

If the count decreases unexpectedly, the edit dropped elements — revert and investigate.
