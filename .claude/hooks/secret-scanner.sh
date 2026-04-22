#!/usr/bin/env bash
# PreToolUse hook — Write'dan oldin secret skan
set -euo pipefail

TOOL_INPUT="${CLAUDE_TOOL_INPUT:-}"
TOOL_NAME="${CLAUDE_TOOL_NAME:-}"

if [[ "$TOOL_NAME" != "Write" && "$TOOL_NAME" != "Edit" ]]; then
  exit 0
fi

# Umumiy secret pattern'lar
PATTERNS=(
  'sk-[a-zA-Z0-9]{20,}'
  'SUPABASE_SERVICE_ROLE_KEY\s*=\s*["'"'"']?ey'
  'JWT_SECRET\s*=\s*["'"'"']?[A-Za-z0-9+/]{20,}'
  'TELEGRAM_BOT_TOKEN\s*=\s*["'"'"']?[0-9]+:[A-Za-z0-9_-]+'
  'xoxb-[0-9A-Za-z-]+'
  'ghp_[A-Za-z0-9]{36}'
  'AKIA[0-9A-Z]{16}'
)

for p in "${PATTERNS[@]}"; do
  if echo "$TOOL_INPUT" | grep -qE "$p"; then
    echo "BLOCKED: Secret aniqlandi (pattern: $p). Faylga yozish to'xtatildi." >&2
    echo "env faylga ko'chiring va .gitignore'ga qo'shing." >&2
    exit 2
  fi
done

exit 0
