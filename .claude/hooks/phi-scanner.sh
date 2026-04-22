#!/usr/bin/env bash
# PreToolUse hook — PHI tekshiruvi Write/Edit'dan oldin
# CLAUDE.md qoidasi #6: Supabase prod'da PHI yo'q

set -euo pipefail

TOOL_INPUT="${CLAUDE_TOOL_INPUT:-}"
TOOL_NAME="${CLAUDE_TOOL_NAME:-}"

# Faqat Write/Edit'da ishlaydi
if [[ "$TOOL_NAME" != "Write" && "$TOOL_NAME" != "Edit" ]]; then
  exit 0
fi

# server/src ichidagi Supabase.* + PHI field kombinatsiyasi
if echo "$TOOL_INPUT" | grep -qE 'supabase\.(from|storage)'; then
  if echo "$TOOL_INPUT" | grep -qiE '(firstName|lastName|phone|dob|birthDate|passportId|medicalHistory|diagnosis|patient\.name)'; then
    echo "BLOCKED: PHI ma'lumotlari Supabase'ga yuborilmoqda. CLAUDE.md qoidasi #6 buzildi." >&2
    echo "Muqobil: O'zbekiston lokal PG instance'iga yo'naltiring." >&2
    exit 2
  fi
fi

exit 0
