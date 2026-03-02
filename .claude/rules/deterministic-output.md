# Deterministic Output (MANDATORY)

Any skill or agent that produces HTML output **MUST** use a fixed template file with `{{PLACEHOLDER}}` variables filled by a shell script. The LLM **MUST NOT** generate HTML/CSS layout from scratch.

## Rules

1. **Template Required**: Every HTML report/presentation must have a `.html` template file checked into the repo with `{{PLACEHOLDER}}` tokens for dynamic data.
2. **Script Required**: A shell script (`.sh`) must read data, compute values, and `sed`-replace placeholders into the template. The LLM invokes the script, not the template.
3. **Brand Specs in CSS**: Colors, fonts, spacing, and layout must be embedded as CSS in the template file.
4. **No Prose-Driven Styling**: Agent/skill markdown files must NOT contain CSS token tables or layout instructions.
5. **Deterministic Output**: Running the same script twice with the same data must produce **identical** HTML.

## Existing Templates

| Report | Template |
|--------|----------|
| Master Presentation | `docs/presentations/index.html` |
