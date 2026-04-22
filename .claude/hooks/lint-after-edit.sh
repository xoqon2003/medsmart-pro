#!/usr/bin/env bash
# PostToolUse hook — Edit/Write'dan keyin ESLint + Prettier
set -euo pipefail

TOOL_NAME="${CLAUDE_TOOL_NAME:-}"
FILE_PATH="${CLAUDE_TOOL_FILE_PATH:-}"

if [[ "$TOOL_NAME" != "Write" && "$TOOL_NAME" != "Edit" ]]; then
  exit 0
fi

# Faqat .ts/.tsx fayllar
if [[ "$FILE_PATH" =~ \.(ts|tsx)$ ]]; then
  if [[ "$FILE_PATH" =~ server/ ]]; then
    cd "$(dirname "$FILE_PATH")/.."
    pnpm --dir "$(git rev-parse --show-toplevel)/server" eslint --fix "$FILE_PATH" 2>&1 || true
  else
    pnpm --dir "$(git rev-parse --show-toplevel)" eslint --fix "$FILE_PATH" 2>&1 || true
  fi
fi

exit 0
