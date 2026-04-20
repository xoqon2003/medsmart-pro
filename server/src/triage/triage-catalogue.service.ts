import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import type { RedFlagRule as PrismaRedFlagRule } from '@prisma/client';
import { PrismaService } from '../config/prisma.service';
import { RedFlagRuleDto } from './dto/red-flag-rule.dto';
import type { CatalogueQueryDto } from './dto/catalogue-query.dto';

/**
 * TriageCatalogueService (GAP-04c).
 *
 * Server-side registry for red-flag rules. Calculators and other clinical
 * tools moved to `src/clinical-tools/` in GAP-05d — this service is now
 * narrowly scoped to triage rule evaluation.
 *
 * Scoping semantics mirror the frontend registry (`applicableCategories`
 * + `applicableIcd10Prefixes` with AND semantics when set; empty = open).
 * A rule with NO scope is GLOBAL (e.g. suspected-stroke).
 *
 * Filtering is in-memory (~20 rules today); when the catalogue grows
 * past ~500 rows we'll push the filter into SQL with `ANY` on the
 * `applicable*` arrays.
 */
@Injectable()
export class TriageCatalogueService {
  private readonly logger = new Logger(TriageCatalogueService.name);

  constructor(private readonly prisma: PrismaService) {}

  async listRules(query: CatalogueQueryDto): Promise<RedFlagRuleDto[]> {
    const rules = await this.prisma.redFlagRule.findMany({
      where: { isActive: true },
      orderBy: [{ severity: 'asc' }, { ruleKey: 'asc' }],
    });
    return rules
      .filter((r) =>
        matchesScope(
          r.applicableCategories,
          r.applicableIcd10Prefixes,
          query.category,
          query.icd10,
        ),
      )
      .map(toRuleDto);
  }

  async getRuleByKey(ruleKey: string): Promise<RedFlagRuleDto> {
    const rule = await this.prisma.redFlagRule.findUnique({
      where: { ruleKey },
    });
    if (!rule || !rule.isActive) {
      throw new NotFoundException(`Rule not found: ${ruleKey}`);
    }
    return toRuleDto(rule);
  }
}

// ─── Scope matching (parity with FE red-flag-engine.ts) ─────────────────────

/**
 * Uzbek slug aliases — kept in sync with FE `CATEGORY_ALIASES` and the
 * clinical-tools service. Drift here silently under/over-shows rules.
 */
const CATEGORY_ALIASES: Record<string, string[]> = {
  cardiology: ['cardiology', 'yurak-qon-tomir', 'yurak', 'kardiologiya'],
  neurology: ['neurology', 'nerv-tizimi', 'nevrologiya'],
  endocrinology: ['endocrinology', 'endokrin', 'endokrinologiya'],
  nephrology: ['nephrology', 'nefrologiya', 'buyrak'],
  pulmonology: ['pulmonology', 'nafas-yollari', 'pulmonologiya'],
  gastroenterology: ['gastroenterology', 'hazm', 'gastroenterologiya'],
};

function matchesCategory(
  applicable: string[],
  category: string | undefined,
): boolean {
  if (applicable.length === 0) return true;
  if (!category) return false;
  const cat = category.toLowerCase();
  return applicable.some((raw) => {
    const key = raw.toLowerCase();
    if (key === cat) return true;
    const pool = CATEGORY_ALIASES[key];
    return pool ? pool.includes(cat) : false;
  });
}

function matchesIcd10(prefixes: string[], icd10: string | undefined): boolean {
  if (prefixes.length === 0) return true;
  if (!icd10) return false;
  const code = icd10.toLowerCase().replace(/^icd10:/, '').trim();
  return prefixes.some((p) => code.startsWith(p.toLowerCase()));
}

export function matchesScope(
  categories: string[],
  icd10Prefixes: string[],
  category: string | undefined,
  icd10: string | undefined,
): boolean {
  return (
    matchesCategory(categories, category) && matchesIcd10(icd10Prefixes, icd10)
  );
}

// ─── Row → DTO mapper ───────────────────────────────────────────────────────

function toRuleDto(row: PrismaRedFlagRule): RedFlagRuleDto {
  return {
    id: row.id,
    ruleKey: row.ruleKey,
    nameKey: row.nameKey,
    actionKey: row.actionKey,
    severity: row.severity,
    applicableCategories: row.applicableCategories,
    applicableIcd10Prefixes: row.applicableIcd10Prefixes,
    // conditionJson is stored as Prisma.JsonValue; the FE contract guarantees
    // it conforms to `RuleCondition`. Validation happens at the write
    // boundary (admin API, separate PR).
    condition: row.conditionJson as unknown as RedFlagRuleDto['condition'],
    sourceCitation: row.sourceCitation,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
