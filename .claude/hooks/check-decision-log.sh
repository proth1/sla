#!/bin/bash
# PostToolUse hook: Check if architectural decisions should be logged

MEMORY_DIR="$CLAUDE_PROJECT_DIR/.claude/memory-bank"
DECISION_LOG="$MEMORY_DIR/decisionLog.md"

ARCH_KEYWORDS="architecture|database|schema|migration|authentication|authorization|rbac|api-design|integration|deployment|infrastructure|security|performance|caching|queue|messaging|event-driven|governance|regulatory|compliance|bpmn|dmn|tprm|pdlc"

RECENT_FILES=$(find "$CLAUDE_PROJECT_DIR" -type f \( -name "*.bpmn" -o -name "*.dmn" -o -name "*.md" -o -name "*.yaml" -o -name "*.html" \) -mmin -2 2>/dev/null | grep -v node_modules | head -5)

if [ -z "$RECENT_FILES" ]; then
  exit 0
fi

for file in $RECENT_FILES; do
  if echo "$file" | grep -qiE "$ARCH_KEYWORDS"; then
    echo ""
    echo "<decision-log-reminder>"
    echo "Architectural file modified: $(basename "$file")"
    echo "Consider documenting significant decisions in: .claude/memory-bank/decisionLog.md"
    echo "Use format: ## YYYY-MM-DD: Decision Title"
    echo "</decision-log-reminder>"
    exit 0
  fi
done

for file in $RECENT_FILES; do
  if [ -f "$file" ] && [ $(wc -c < "$file") -lt 50000 ]; then
    if grep -qiE "(ADR|architecture decision|we decided to|chosen approach|trade-off|alternative.*considered)" "$file" 2>/dev/null; then
      echo ""
      echo "<decision-log-reminder>"
      echo "Decision-related content detected in: $(basename "$file")"
      echo "Consider documenting in: .claude/memory-bank/decisionLog.md"
      echo "</decision-log-reminder>"
      exit 0
    fi
  fi
done

exit 0
