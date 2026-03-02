#!/bin/bash
# Ultra-light session start hook for SLA Governance Platform
# Outputs ~15 lines instead of ~400. Use /context:* skills for detailed context.

MEMORY_DIR="$CLAUDE_PROJECT_DIR/.claude/memory-bank"

# Auto-pull latest from origin (silent, non-blocking)
BRANCH=$(git -C "$CLAUDE_PROJECT_DIR" branch --show-current 2>/dev/null || echo "unknown")
PULL_STATUS=""
if [ "$BRANCH" = "main" ]; then
  PULL_RESULT=$(git -C "$CLAUDE_PROJECT_DIR" pull --no-rebase 2>&1)
  if echo "$PULL_RESULT" | grep -q "Already up to date"; then
    PULL_STATUS="up to date"
  elif echo "$PULL_RESULT" | grep -q "Updating"; then
    PULL_STATUS="pulled new changes"
  else
    PULL_STATUS="pull skipped"
  fi
fi

# Last session summary
LAST_SESSION=""
if [ -f "$MEMORY_DIR/activeContext.md" ]; then
  SESSION_DATE=$(grep "Session Date" "$MEMORY_DIR/activeContext.md" | head -1 | cut -d':' -f2 | tr -d ' *')
  STATUS=$(grep "^\*\*Status" "$MEMORY_DIR/activeContext.md" | head -1 | cut -d':' -f2 | tr -d ' *')
  WORK_ITEM=$(grep "Work Item" "$MEMORY_DIR/activeContext.md" | head -1 | cut -d':' -f2- | tr -d '*')
  LAST_SESSION="Last: $SESSION_DATE | $STATUS | $WORK_ITEM"
fi

# Output minimal context
echo "<session-context>"
echo "Branch: $BRANCH$([ -n "$PULL_STATUS" ] && echo " | Git: $PULL_STATUS")"
[ -n "$LAST_SESSION" ] && echo "$LAST_SESSION"
echo ""
echo "Load context with: /context:bpmn /context:governance /context:full"
echo "</session-context>"

exit 0
