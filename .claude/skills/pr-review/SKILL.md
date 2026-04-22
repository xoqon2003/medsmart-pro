---
name: pr-review
description: MedSmart-Pro PR review — code-reviewer + security-auditor + phi-guardian subagent'larini ketma-ket chaqirib, birlashgan verdikt chiqaradi. Har PR merge oldidan ishga tushiring.
---

# PR review workflow

1. **Diff olish**: `git diff main...HEAD --stat` + fayl ro'yxati.
2. **Subagent'lar paralelda**:
   - `code-reviewer` — CLAUDE.md qoidalari, TS strict, performance.
   - `security-auditor` — OWASP Top 10, secret skan.
   - `phi-guardian` — Supabase + PHI oqimi.
3. **Birlashgan verdikt**:
   - BLOCKER (deploy to'xtatiladi) birining BLOCKER'i bilan.
   - WARNING jam.
   - Commit message format tekshiruvi (`<type>(<scope>): <msg>`).
4. **Output**: `PR-REVIEW-<PR>.md` fayl + inline comment format.

## Ishga tushirish

```
Claude, PR-42'ni pr-review skill orqali tekshir.
```

## Output template

```markdown
# PR #<n> Review — <title>

## Verdict: APPROVE | CHANGES_REQUESTED | BLOCK

## code-reviewer
<summary + blockers + warnings>

## security-auditor
<OWASP findings>

## phi-guardian
<PHI verdict>

## Birlashgan BLOCKER
- [file:line] <issue>

## Next steps
- <action>
```
