# Active Context

## Last Session Summary

**Date**: 2026-03-06
**Branch**: main
**Release Version**: 2026.03.37

### Completed — Fix v8-c8 Visual Layout Regression (PR #48)
- Moved 4 notification service tasks from top-level orchestrator into sub-processes SP1-SP4
- Restored direct flows (Flow_v5_2/5/8/13) matching v7 clean layout
- Created migration script `scripts/fix-v8-layout.py` for reproducibility
- Proper SDLC: worktree → feature branch → PR → pr-orchestrator review → merge

### Identified Issues
- Jira API token auth failing — `$JIRA_EMAIL` was `proth1@rival.io` in runtime (stale session), `.zshrc` has correct `proth1@gmail.com` but auth still fails — token may need regeneration
- Need deterministic SDLC workflow script to enforce: Jira → worktree → branch → validate → commit → push → PR → review

## Platform Stats

| Metric | Value |
|--------|-------|
| Release Version | 2026.03.36 |
| Total PRs Merged | 47 |
| BPMN Models | v4, v5, v6-c8, v7-c8, v8-c8 + orchestrator + 5 phase models |
| DMN Tables | OB-DMN-1 through OB-DMN-7 |
| Camunda 8 Forms | 48 |
| Presentation Slides | 62 |
| Camunda Cloud Deployments | v2 (Process_Onboarding_v8 + Process_Vendor) |

## Recommended Next Steps

1. Step through user tasks in Tasklist (tasks need candidateGroup claiming)
2. Upload updated v8-c8 BPMN to Web Modeler (sync is Modeler→GitHub only)
3. Generate v8 BPMN images for presentation slides
4. Wire OB-DMN-6 into SP3 security assessment routing (GAP-12)
5. Deploy status notification send tasks at phase transitions (GAP-7)
