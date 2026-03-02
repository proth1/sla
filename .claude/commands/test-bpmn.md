# Test BPMN

Generate BDD test scenarios and run structural validation for BPMN process definitions using AI-powered analysis.

## Instructions

### Step 1: Preview Mode (MANDATORY unless --yes flag)

**Before running tests, show the user a preview of what will happen:**

1. **Gather preview information**:
   - Locate BPMN file in `processes/` directory
   - Check for existing test files
   - Estimate test scope based on BPMN complexity

2. **Display preview to user**:

   ```
   +-------------------------------------------------------------+
   | TEST BPMN - Preview                                          |
   +-------------------------------------------------------------+
   | Process:  retirement-management                              |
   | File:     processes/phase-6-retirement/retirement-mgmt.bpmn  |
   | Modified: 2 hours ago                                        |
   |                                                              |
   | Test Plan:                                                   |
   |   1. Fast validation (JavaScript) .............. ~100ms, $0  |
   |   2. Visual validation (overlap + flow dir) .... ~200ms, $0  |
   |   3. Generate BDD scenarios (sonnet) ........... ~30s, ~$0.03|
   |                                                              |
   | Estimated:                                                   |
   |   * Total time: ~1 minute                                    |
   |   * API cost: ~$0.03                                         |
   |   * Test scenarios: ~10-15 (based on process complexity)     |
   |                                                              |
   | Output:                                                      |
   |   * tests/features/generated/<process>.feature               |
   +-------------------------------------------------------------+
   ```

3. **Ask for confirmation** using AskUserQuestion:
   - If user confirms: proceed to Step 2
   - If user declines: abort with message "Test run cancelled"
   - If `--yes` flag provided: skip confirmation, proceed directly
   - If `--dry-run` flag provided: show preview only, do not run tests

### Step 2: Fast Validation (JavaScript)

Run the fast JavaScript validators first:

```bash
# Full validation pipeline
bash scripts/validators/validate-bpmn.sh <file.bpmn>

# Or individual validators
node scripts/validators/bpmn-validator.js <file.bpmn>
node scripts/validators/visual-overlap-checker.js <file.bpmn>
node scripts/validators/element-checker.js <file.bpmn>
```

If fast validation fails with ERRORs, report them and stop (unless `--force` flag).

### Step 3: Visual Validation

Check for visual quality issues:
- Overlapping elements
- Backward sequence flows (right-to-left)
- Label positioning issues
- Cross-lane routing problems

### Step 4: Invoke bpmn-tester SubAgent

```
> Use the bpmn-tester subagent to generate structural BDD test scenarios for [process-name]
```

The SubAgent will:
- Analyze BPMN process structure
- Generate comprehensive Gherkin scenarios (structural validation only)
- Report coverage metrics
- Store results

### Step 5: Report Results

Report test results including:
- Validation results (pass/fail per validator)
- Visual quality issues
- Coverage metrics (% of paths tested)
- Generated scenario count
- Evidence location

## Arguments

- `[process-name]` - Required: BPMN process file name or process definition key
  - Can be filename: `retirement-management.bpmn`
  - Can be process key: `retirement-management`
  - Can be path: `processes/phase-6-retirement/retirement-management.bpmn`

## Flags

- `--generate` - Only generate tests, don't run validation first
- `--coverage` - Generate coverage report only
- `--yes` or `-y` - Skip confirmation prompt (for automation)
- `--dry-run` - Show preview only, do not run tests
- `--force` - Continue even if fast validation has errors

## Usage

```
/test-bpmn retirement-management                    # Validate + generate (with preview)
/test-bpmn retirement-management --generate         # Generate tests only (with preview)
/test-bpmn retirement-management --coverage         # Coverage report
/test-bpmn needs-assessment --yes                   # Skip confirmation
/test-bpmn needs-assessment --dry-run               # Preview only
```

## Workflow

### 1. Validate Only

```
/test-bpmn [process] --dry-run
```

Shows validation preview without running tests.

### 2. Generate Tests

```
/test-bpmn [process] --generate
```

- Reads BPMN file from `processes/`
- Analyzes process structure and paths
- Generates Gherkin scenarios in `tests/features/generated/[process].feature`
- Reports coverage metrics

### 3. Full Workflow (Default)

```
/test-bpmn [process]
```

Executes all phases:

1. Fast validation (JavaScript validators)
2. Visual validation (overlap + flow direction)
3. Test generation (AI structural analysis)
4. Evidence generation

## Test Output Structure

```
tests/features/generated/
  +-- [process-name].feature              # Generated Gherkin scenarios
  +-- [process-name]-coverage.md          # Coverage report
```

## Expected Output

### Success Example

```markdown
## BPMN Test Results: retirement-management

### Fast Validation
- bpmn-validator.js: PASS (0 errors, 2 warnings)
- visual-overlap-checker.js: PASS (0 overlaps)
- element-checker.js: PASS

### Visual Validation
- Backward flows: 0 detected
- Cross-lane routing: OK
- Label positioning: 1 warning (timer label overlap)

### Test Generation
- BPMN File: processes/phase-6-retirement/retirement-management.bpmn
- Paths Identified: 12
- Scenarios Generated: 10
- Coverage: 83%

### Coverage Report
- User Tasks: 4/4 (100%)
- Business Rule Tasks: 2/2 (100%)
- Gateways: 5/6 (83%)
- Events: 8/8 (100%)

### Evidence
- Generated Tests: tests/features/generated/retirement-management.feature
```

## Model Routing

- **Fast validation**: JavaScript (no API cost)
- **Test generation**: sonnet ($3/MTok)
- **Complex analysis**: opus ($15/MTok) -- rare

**Cost per test run**: ~$0.03-0.05 with model-routing

## Quality Gates

**Before Test Generation**:
- [ ] BPMN file passes XML schema validation
- [ ] No critical best practice violations
- [ ] No backward sequence flows
- [ ] No overlapping elements

**After Test Generation**:
- [ ] Minimum 80% path coverage in generated tests
- [ ] Happy path scenarios generated
- [ ] Error handling scenarios generated
- [ ] Phase boundary patterns tested

## Troubleshooting

### Issue: "BPMN file not found"
**Solution**: Ensure BPMN file exists in `processes/phase-*/`

### Issue: "Backward flows detected"
**Solution**: Use `bpmn-specialist` agent to fix layout before testing

### Issue: "Test generation coverage < 80%"
**Solution**: Review BPMN for untested paths, consider adding boundary tests

## Related Commands

- **/bpmn-to-svg**: Render BPMN to SVG for presentations

## Related SubAgents

- **bpmn-tester**: Test generation and analysis (invoked by this command)
- **bpmn-validator**: BPMN validation and best practices
- **bpmn-specialist**: BPMN creation, repair, and layout optimization

## Related Skills

- **bpmn-cicd**: CI/CD patterns for BPMN deployment
- **bpmn-editing**: BPMN layout and visual standards

---

**Command Version**: 1.0.0
**Created**: 2026-03-02
**Platform**: SLA - Enterprise Software Governance
