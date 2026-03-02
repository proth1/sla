# Session Lifecycle & Memory

## Session Start

1. Read `activeContext.md` — check "Last Session Summary" and "Recommended Next Steps"
2. Read `platformState.md` for current state

## Session End (on "session end" / "wrap up")

Update `activeContext.md` with: completed work, in-progress state, next steps, blockers.
Add significant decisions to `decisionLog.md`.

## Memory Update Triggers

| File | Update When |
|------|-------------|
| `activeContext.md` | Session start (read), progress, session end (handoff) |
| `decisionLog.md` | Technical/architecture decisions |
| `lessonsLearned.md` | Incidents, mistakes, successes |
| `platformState.md` | Session start (read), stats change |
| `CHANGELOG.md` | PR merged to main (CalVer: `YYYY.MM.release`) |

## Evidence

Archive when >50 files. Retention: 30 days active, then `memory-bank/archive/YYYY-MM/`.
