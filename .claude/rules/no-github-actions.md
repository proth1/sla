# No GitHub Actions (MANDATORY)

**NEVER create `.github/workflows/*.yml` files.** This project uses Claude Code skills for CI/CD.

| Need | Use |
|------|-----|
| Validate BPMN | `bpmn-validator` subagent |
| Test BPMN | `bpmn-tester` subagent |
| Full pipeline | `pipeline-orchestrator` subagent |
| Deploy presentation | `cloudflare-publisher` subagent |

The `.github/workflows/` directory must not exist.
