import { NotFoundException } from '@nestjs/common';
import {
  TriageCatalogueService,
  matchesScope,
} from '../triage-catalogue.service';

/**
 * Unit tests for TriageCatalogueService — mirrors the scoping invariants
 * established in `src/app/lib/red-flag-engine.spec.ts`. Both layers MUST
 * agree on scope semantics; drift here would silently under-show or
 * over-show catalogue entries in production.
 *
 * Clinical tool tests moved to
 * `src/clinical-tools/tests/clinical-tools.service.spec.ts` (GAP-05d).
 */

// ─── Prisma mock ─────────────────────────────────────────────────────────────

const mockRedFlagRule = {
  findMany: jest.fn(),
  findUnique: jest.fn(),
};
const mockPrisma = {
  redFlagRule: mockRedFlagRule,
};

function buildService(): TriageCatalogueService {
  return new TriageCatalogueService(mockPrisma as never);
}

beforeEach(() => jest.clearAllMocks());

// ─── Fixtures ────────────────────────────────────────────────────────────────

const now = new Date('2026-04-18T00:00:00Z');

const globalStrokeRule = {
  id: 'uuid-1',
  ruleKey: 'rule.suspected-stroke',
  nameKey: 'redflag.suspectedStroke',
  actionKey: 'emergency.critical.action',
  severity: 'CRITICAL' as const,
  applicableCategories: [],
  applicableIcd10Prefixes: [],
  conditionJson: { kind: 'symptom', code: 'focal-weakness' },
  sourceCitation: null,
  isActive: true,
  createdAt: now,
  updatedAt: now,
};

const afRule = {
  id: 'uuid-2',
  ruleKey: 'rule.unstable-af',
  nameKey: 'redflag.unstableAf',
  actionKey: 'emergency.critical.action',
  severity: 'CRITICAL' as const,
  applicableCategories: [],
  applicableIcd10Prefixes: ['I48'],
  conditionJson: { kind: 'symptom', code: 'palpitations-rapid' },
  sourceCitation: 'ESC 2020',
  isActive: true,
  createdAt: now,
  updatedAt: now,
};

const hypertensionRule = {
  id: 'uuid-3',
  ruleKey: 'rule.hypertensive-crisis',
  nameKey: 'redflag.hypertensiveCrisis',
  actionKey: 'emergency.critical.action',
  severity: 'CRITICAL' as const,
  applicableCategories: ['cardiology'],
  applicableIcd10Prefixes: [],
  conditionJson: { kind: 'symptom', code: 'bp-sbp-180' },
  sourceCitation: null,
  isActive: true,
  createdAt: now,
  updatedAt: now,
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('matchesScope — helper parity with frontend red-flag-engine.ts', () => {
  it('returns true when both scope arrays are empty (GLOBAL)', () => {
    expect(matchesScope([], [], undefined, undefined)).toBe(true);
    expect(matchesScope([], [], 'cardiology', 'I48')).toBe(true);
  });

  it('ICD prefix matches sub-codes (I48, I48.1, I48.2)', () => {
    expect(matchesScope([], ['I48'], undefined, 'I48')).toBe(true);
    expect(matchesScope([], ['I48'], undefined, 'I48.2')).toBe(true);
    expect(matchesScope([], ['I48'], undefined, 'I10')).toBe(false);
  });

  it('honours the "ICD10:" namespace prefix', () => {
    expect(matchesScope([], ['I48'], undefined, 'ICD10:I48.0')).toBe(true);
  });

  it('is case-insensitive on category and ICD', () => {
    expect(matchesScope(['cardiology'], [], 'CARDIOLOGY', undefined)).toBe(true);
    expect(matchesScope([], ['I48'], undefined, 'i48')).toBe(true);
  });

  it('accepts Uzbek slug aliases for categories', () => {
    expect(matchesScope(['cardiology'], [], 'yurak-qon-tomir', undefined)).toBe(
      true,
    );
    expect(matchesScope(['endocrinology'], [], 'endokrin', undefined)).toBe(
      true,
    );
  });

  it('AND semantics — both filters must match when both set', () => {
    expect(
      matchesScope(['cardiology'], ['I48'], 'yurak-qon-tomir', 'I48.0'),
    ).toBe(true);
    expect(matchesScope(['cardiology'], ['I48'], 'cardiology', 'I10')).toBe(
      false,
    );
    expect(matchesScope(['cardiology'], ['I48'], 'endokrin', 'I48')).toBe(false);
  });
});

describe('TriageCatalogueService.listRules()', () => {
  it('HTN card (category=cardiology, icd10=I10) returns HTN + global, NOT AF', async () => {
    mockRedFlagRule.findMany.mockResolvedValue([
      globalStrokeRule,
      afRule,
      hypertensionRule,
    ]);
    const svc = buildService();
    const rules = await svc.listRules({
      category: 'yurak-qon-tomir',
      icd10: 'I10',
    });
    const keys = rules.map((r) => r.ruleKey);
    expect(keys).toContain('rule.suspected-stroke');
    expect(keys).toContain('rule.hypertensive-crisis');
    expect(keys).not.toContain('rule.unstable-af');
  });

  it('AF card (I48) pulls in BOTH AF-specific and global rules', async () => {
    mockRedFlagRule.findMany.mockResolvedValue([
      globalStrokeRule,
      afRule,
      hypertensionRule,
    ]);
    const svc = buildService();
    const rules = await svc.listRules({
      category: 'yurak-qon-tomir',
      icd10: 'I48',
    });
    const keys = rules.map((r) => r.ruleKey);
    expect(keys).toEqual(
      expect.arrayContaining([
        'rule.suspected-stroke',
        'rule.unstable-af',
        'rule.hypertensive-crisis',
      ]),
    );
  });

  it('unscoped call still returns GLOBAL rules only', async () => {
    mockRedFlagRule.findMany.mockResolvedValue([
      globalStrokeRule,
      afRule,
      hypertensionRule,
    ]);
    const svc = buildService();
    const rules = await svc.listRules({});
    expect(rules.map((r) => r.ruleKey)).toEqual(['rule.suspected-stroke']);
  });

  it('queries only active rules', async () => {
    mockRedFlagRule.findMany.mockResolvedValue([]);
    const svc = buildService();
    await svc.listRules({});
    expect(mockRedFlagRule.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { isActive: true } }),
    );
  });
});

describe('TriageCatalogueService.getRuleByKey()', () => {
  it('returns the mapped DTO when the rule exists and is active', async () => {
    mockRedFlagRule.findUnique.mockResolvedValue(afRule);
    const svc = buildService();
    const dto = await svc.getRuleByKey('rule.unstable-af');
    expect(dto.ruleKey).toBe('rule.unstable-af');
    expect(dto.condition).toEqual({
      kind: 'symptom',
      code: 'palpitations-rapid',
    });
  });

  it('throws 404 when the rule is missing', async () => {
    mockRedFlagRule.findUnique.mockResolvedValue(null);
    const svc = buildService();
    await expect(svc.getRuleByKey('rule.nope')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('throws 404 when the rule is soft-disabled', async () => {
    mockRedFlagRule.findUnique.mockResolvedValue({ ...afRule, isActive: false });
    const svc = buildService();
    await expect(svc.getRuleByKey('rule.unstable-af')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
