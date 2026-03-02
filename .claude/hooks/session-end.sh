#!/bin/bash
# SessionEnd hook: Capture session state for next session
# Note: This can't access conversation context, only filesystem/git state

MEMORY_DIR="$CLAUDE_PROJECT_DIR/.claude/memory-bank"
STATE_FILE="$MEMORY_DIR/.session-state.json"

# Ensure memory-bank directory exists
mkdir -p "$MEMORY_DIR"

# Capture current state
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
BRANCH=$(git -C "$CLAUDE_PROJECT_DIR" branch --show-current 2>/dev/null || echo "unknown")
STATUS=$(git -C "$CLAUDE_PROJECT_DIR" status --porcelain 2>/dev/null | head -10)
LAST_COMMIT=$(git -C "$CLAUDE_PROJECT_DIR" log -1 --format="%h %s" 2>/dev/null || echo "unknown")

# Check if activeContext.md has uncommitted changes
ACTIVE_CONTEXT="$MEMORY_DIR/activeContext.md"
CONTEXT_UPDATED="false"
if [ -f "$ACTIVE_CONTEXT" ]; then
  if git -C "$CLAUDE_PROJECT_DIR" diff --name-only "$ACTIVE_CONTEXT" 2>/dev/null | grep -q "activeContext.md"; then
    CONTEXT_UPDATED="true"
  elif git -C "$CLAUDE_PROJECT_DIR" diff --cached --name-only "$ACTIVE_CONTEXT" 2>/dev/null | grep -q "activeContext.md"; then
    CONTEXT_UPDATED="true"
  else
    if [ "$(uname)" = "Darwin" ]; then
      FILE_MOD=$(stat -f %m "$ACTIVE_CONTEXT" 2>/dev/null || echo 0)
    else
      FILE_MOD=$(stat -c %Y "$ACTIVE_CONTEXT" 2>/dev/null || echo 0)
    fi
    NOW=$(date +%s)
    DIFF=$((NOW - FILE_MOD))
    if [ "$DIFF" -lt 1800 ]; then
      CONTEXT_UPDATED="true"
    fi
  fi
fi

# Write state file
cat > "$STATE_FILE" << EOF
{
  "lastSessionEnd": "$TIMESTAMP",
  "branch": "$BRANCH",
  "lastCommit": "$LAST_COMMIT",
  "hadUncommittedChanges": $([ -n "$STATUS" ] && echo "true" || echo "false"),
  "activeContextUpdated": $CONTEXT_UPDATED
}
EOF

# If activeContext wasn't updated, append a warning marker
if [ "$CONTEXT_UPDATED" = "false" ] && [ -f "$ACTIVE_CONTEXT" ]; then
  if grep -q "SESSION END WARNING" "$ACTIVE_CONTEXT" 2>/dev/null; then
    if [ "$(uname)" = "Darwin" ]; then
      sed -i '' '/## SESSION END WARNING/,$d' "$ACTIVE_CONTEXT" 2>/dev/null || true
      sed -i '' '/^---$/{ N; /^$/d; }' "$ACTIVE_CONTEXT" 2>/dev/null || true
    else
      sed -i '/## SESSION END WARNING/,$d' "$ACTIVE_CONTEXT" 2>/dev/null || true
    fi
  fi

  cat >> "$ACTIVE_CONTEXT" << EOF

---

## SESSION END WARNING (Auto-generated)

**Session ended**: $TIMESTAMP
**activeContext.md was NOT updated** before session ended.

The previous Claude may not have documented:
- What was accomplished
- Current blockers
- Recommended next steps

Please review git log and recent changes to reconstruct context.

EOF
fi

# Auto-archive evidence files older than 30 days
EVIDENCE_DIR="$MEMORY_DIR/evidence"
ARCHIVE_DIR="$MEMORY_DIR/archive"
if [ -d "$EVIDENCE_DIR" ]; then
  EVIDENCE_COUNT=$(find "$EVIDENCE_DIR" -type f 2>/dev/null | wc -l | tr -d ' ')
  if [ "$EVIDENCE_COUNT" -gt 50 ]; then
    ARCHIVE_MONTH=$(date +"%Y-%m")
    ARCHIVE_PATH="$ARCHIVE_DIR/$ARCHIVE_MONTH"
    mkdir -p "$ARCHIVE_PATH"
    find "$EVIDENCE_DIR" -type f -mtime +30 -print0 2>/dev/null | while IFS= read -r -d '' file; do
      rel_path="${file#$EVIDENCE_DIR/}"
      dest_dir="$ARCHIVE_PATH/$(dirname "$rel_path")"
      mkdir -p "$dest_dir" 2>/dev/null
      mv "$file" "$dest_dir/" 2>/dev/null
    done
    find "$EVIDENCE_DIR" -type d -empty -delete 2>/dev/null || true
  fi
fi

exit 0
