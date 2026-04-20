import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  ClinicalToolsService,
  audienceForRole,
  isClinicDisabled,
  matchesScope,
  passesAudienceGate,
} from '../clinical-tools.service';

/**
 * Unit tests for ClinicalToolsService (GAP-05d).
 *
 * Covers:
 *   • scope matching parity with the triage catalogue
 *   • audience gate (soft) + required-role gate (hard)
 *   • admin CRUD happy paths + deactivation-reason enforcement
 *   • per-clinic override isolation (clinic admin can only touch own id)
 *   • DOSE toolType safety invariant (must pin clinical role)
 */

// ─── Prisma mock ─────────────────────────────────────────────────────────────

const mockTool = {
  findMany: jest.fn(),
  findUnique: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
};
const mockPrisma = { clinicalTool: mockTool };

function buildService(): ClinicalToolsService {
  return new ClinicalToolsService(mockPrisma as never);
}

beforeEach(() => jest.clearAllMocks());

// ─── Fixtures ────────────────────────────────────────────────────────────────

const now = new Date('2026-04-18T00:00:00Z');

const baseTool = {
  id: 'tool-1',
  toolKey: 'chads-vasc',
  toolType: 'SCORE' as const,
  nameKey: 'calc.chadsVasc.name',
  descriptionKey: null,
  source: 'ESC 2020',
  sourceUrl: null,
  evidenceLevel: 'A' as const,
  formulaKey: 'chads-vasc',
  inputsJson: [{ id: 'age', type: 'number' }],
  outputSchemaJson: null,
  showFormulaForAudience: 'L2',
  applicableCategories: ['cardiology'],
  applicableIcd10Prefixes: ['I48'],
  allowedAudiences: [],
  requiredRoles: [],
  isActive: true,
  deactivationReason: null,
  deactivatedAt: null,
  deactivatedBy: null,
  clinicOverridesJson: null,
  regionFitness: 'HIGH',
  priorityWeight: 10,
  createdAt: now,
  updatedAt: now,
  createdBy: null,
  updatedBy: null,
};

const phq9 = {
  ...baseTool,
  id: 'tool-2',
  toolKey: 'phq-9',
  toolType: 'QUESTIONNAIRE' as const,
  formulaKey: 'phq-9',
  applicableCategories: ['psychiatry'],
  applicableIcd10Prefixes: ['F32'],
  allowedAudiences: ['PATIENT', 'DOCTOR', 'NURSE'],
  requiredRoles: [],
};

const doseTool = {
  ...baseTool,
  id: 'tool-3',
  toolKey: 'warfarin-dose',
  toolType: 'DOSE' as const,
  formulaKey: 'warfarin-dose',
  allowedAudiences: ['DOCTOR'],
  requiredRoles: ['DOCTOR', 'SPECIALIST'],
};

// ─── Scope tests ─────────────────────────────────────────────────────────────

describe('matchesScope', () => {
  it('empty scope = open to everyone', () => {
    expect(matchesScope([], [], undefined, undefined)).toBe(true);
  });
  it('ICD prefix matches sub-codes', () => {
    expect(matchesScope([], ['I48'], undefined, 'I48.0')).toBe(true);
    expect(matchesScope([], ['I48'], undefined, 'I10')).toBe(false);
  });
  it('psychiatry alias maps to ruhiy slug', () => {
    expect(matchesScope(['psychiatry'], [], 'ruhiy', undefined)).toBe(true);
  });
});

// ─── Audience gate tests ─────────────────────────────────────────────────────

describe('audienceForRole + passesAudienceGate', () => {
  it('empty allowed = pass for any caller', () => {
    expect(passesAudienceGate([], [])).toBe(true);
    expect(passesAudienceGate([], ['DOCTOR'])).toBe(true);
  });

  it('DOCTOR caller matches DOCTOR- and MIXED-allowed tools', () => {
    expect(passesAudienceGate(['DOCTOR'], audienceForRole('DOCTOR'))).toBe(true);
    expect(passesAudienceGate(['MIXED'], audienceForRole('DOCTOR'))).toBe(true);
  });

  it('PATIENT caller blocked from DOCTOR-only tools', () => {
    expect(passesAudienceGate(['DOCTOR'], audienceForRole('PATIENT'))).toBe(false);
  });

  it('SPECIALIST inherits DOCTOR + MIXED access', () => {
    expect(passesAudienceGate(['DOCTOR'], audienceForRole('SPECIALIST'))).toBe(true);
    expect(passesAudienceGate(['MIXED'], audienceForRole('SPECIALIST'))).toBe(true);
  });

  it('ADMIN + MEDICAL_EDITOR bypass audience filter (see everything)', () => {
    expect(passesAudienceGate(['DOCTOR'], audienceForRole('ADMIN'))).toBe(true);
    expect(passesAudienceGate(['PATIENT'], audienceForRole('MEDICAL_EDITOR'))).toBe(true);
  });
});

// ─── listTools ───────────────────────────────────────────────────────────────

describe('ClinicalToolsService.listTools()', () => {
  // Unscoped variants for tests that don't care about category/icd10 filtering.
  const globalScore = {
    ...baseTool,
    applicableCategories: [],
    applicableIcd10Prefixes: [],
  };
  const globalDose = {
    ...doseTool,
    applicableCategories: [],
    applicableIcd10Prefixes: [],
  };
  const globalPhq9 = {
    ...phq9,
    applicableCategories: [],
    applicableIcd10Prefixes: [],
  };

  it('PATIENT caller never sees DOCTOR-only tools (audience gate)', async () => {
    mockTool.findMany.mockResolvedValue([globalScore, globalDose]);
    const svc = buildService();
    const tools = await svc.listTools({}, 'PATIENT');
    const keys = tools.map((t) => t.toolKey);
    expect(keys).toContain('chads-vasc');
    expect(keys).not.toContain('warfarin-dose');
  });

  it('DOCTOR caller sees scoped tools matching category + icd10', async () => {
    mockTool.findMany.mockResolvedValue([baseTool, phq9]);
    const svc = buildService();
    const tools = await svc.listTools(
      { category: 'yurak-qon-tomir', icd10: 'I48' },
      'DOCTOR',
    );
    expect(tools.map((t) => t.toolKey)).toEqual(['chads-vasc']);
  });

  it('filters by toolType when provided', async () => {
    mockTool.findMany.mockResolvedValue([globalScore, globalPhq9]);
    const svc = buildService();
    const tools = await svc.listTools(
      { toolType: 'QUESTIONNAIRE' },
      'DOCTOR',
    );
    expect(tools.map((t) => t.toolKey)).toEqual(['phq-9']);
  });

  it('hides inactive tools from non-admins', async () => {
    mockTool.findMany.mockResolvedValue([]);
    const svc = buildService();
    await svc.listTools({ includeInactive: true }, 'DOCTOR');
    // Non-admin `includeInactive` is silently ignored → still `isActive: true`.
    expect(mockTool.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { isActive: true } }),
    );
  });

  it('admin with includeInactive gets unfiltered query', async () => {
    mockTool.findMany.mockResolvedValue([]);
    const svc = buildService();
    await svc.listTools({ includeInactive: true }, 'ADMIN');
    expect(mockTool.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: {} }),
    );
  });

  it('honours per-clinic override (hides tool disabled for clinic#7)', async () => {
    const disabled = {
      ...baseTool,
      applicableCategories: [],
      applicableIcd10Prefixes: [],
      clinicOverridesJson: { '7': { isActive: false, reason: 'not licensed' } },
    };
    mockTool.findMany.mockResolvedValue([disabled]);
    const svc = buildService();
    const forC7 = await svc.listTools({ clinicId: 7 }, 'DOCTOR');
    const forC8 = await svc.listTools({ clinicId: 8 }, 'DOCTOR');
    expect(forC7.map((t) => t.toolKey)).toEqual([]);
    expect(forC8.map((t) => t.toolKey)).toEqual(['chads-vasc']);
  });
});

// ─── assertCanRun ────────────────────────────────────────────────────────────

describe('ClinicalToolsService.assertCanRun()', () => {
  it('NURSE cannot run a DOCTOR-gated DOSE tool (403)', async () => {
    mockTool.findUnique.mockResolvedValue(doseTool);
    const svc = buildService();
    await expect(svc.assertCanRun('warfarin-dose', 'NURSE')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('DOCTOR can run a DOCTOR-gated DOSE tool', async () => {
    mockTool.findUnique.mockResolvedValue(doseTool);
    const svc = buildService();
    const tool = await svc.assertCanRun('warfarin-dose', 'DOCTOR');
    expect(tool.toolKey).toBe('warfarin-dose');
  });

  it('clinic-disabled tool is 403 even for the right role', async () => {
    mockTool.findUnique.mockResolvedValue({
      ...doseTool,
      clinicOverridesJson: { '9': { isActive: false } },
    });
    const svc = buildService();
    await expect(
      svc.assertCanRun('warfarin-dose', 'DOCTOR', 9),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('missing tool throws 404', async () => {
    mockTool.findUnique.mockResolvedValue(null);
    const svc = buildService();
    await expect(svc.assertCanRun('nope', 'DOCTOR')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});

// ─── Admin CRUD ──────────────────────────────────────────────────────────────

describe('ClinicalToolsService.adminUpdate()', () => {
  it('requires deactivationReason when flipping isActive=false', async () => {
    mockTool.findUnique.mockResolvedValue(baseTool);
    const svc = buildService();
    await expect(
      svc.adminUpdate('chads-vasc', { isActive: false }, 42),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('stamps deactivatedBy + deactivatedAt on deactivation', async () => {
    mockTool.findUnique.mockResolvedValue(baseTool);
    mockTool.update.mockResolvedValue({
      ...baseTool,
      isActive: false,
      deactivationReason: 'not used in UZ',
      deactivatedAt: now,
      deactivatedBy: 42,
    });
    const svc = buildService();
    await svc.adminUpdate(
      'chads-vasc',
      { isActive: false, deactivationReason: 'not used in UZ' },
      42,
    );
    expect(mockTool.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          isActive: false,
          deactivationReason: 'not used in UZ',
          deactivatedBy: 42,
          updatedBy: 42,
        }),
      }),
    );
  });

  it('re-activation clears deactivation audit fields', async () => {
    mockTool.findUnique.mockResolvedValue({ ...baseTool, isActive: false });
    mockTool.update.mockResolvedValue({ ...baseTool, isActive: true });
    const svc = buildService();
    await svc.adminUpdate('chads-vasc', { isActive: true }, 42);
    expect(mockTool.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          isActive: true,
          deactivationReason: null,
          deactivatedAt: null,
          deactivatedBy: null,
        }),
      }),
    );
  });
});

describe('ClinicalToolsService.adminCreate() — DOSE safety', () => {
  it('rejects DOSE tool without clinical role gating', async () => {
    mockTool.findUnique.mockResolvedValue(null);
    const svc = buildService();
    await expect(
      svc.adminCreate(
        {
          toolKey: 'foo-dose',
          toolType: 'DOSE',
          nameKey: 'x',
          source: 'x',
          formulaKey: 'foo-dose',
          inputs: [],
          requiredRoles: ['PATIENT'],
        },
        1,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('accepts DOSE tool with DOCTOR in requiredRoles', async () => {
    mockTool.findUnique.mockResolvedValue(null);
    mockTool.create.mockResolvedValue({ ...doseTool, toolKey: 'foo-dose' });
    const svc = buildService();
    const created = await svc.adminCreate(
      {
        toolKey: 'foo-dose',
        toolType: 'DOSE',
        nameKey: 'x',
        source: 'x',
        formulaKey: 'foo-dose',
        inputs: [],
        requiredRoles: ['DOCTOR'],
      },
      1,
    );
    expect(created.toolKey).toBe('foo-dose');
  });
});

describe('ClinicalToolsService.setClinicOverride()', () => {
  it('clinic admin (DOCTOR) cannot override for another clinic', async () => {
    const svc = buildService();
    await expect(
      svc.setClinicOverride(
        'chads-vasc',
        { clinicId: 9, isActive: false },
        42,
        'DOCTOR',
        7, // caller's own clinic
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('clinic admin CAN override for their own clinic', async () => {
    mockTool.findUnique.mockResolvedValue(baseTool);
    mockTool.update.mockResolvedValue({
      ...baseTool,
      clinicOverridesJson: { '7': { isActive: false } },
    });
    const svc = buildService();
    await svc.setClinicOverride(
      'chads-vasc',
      { clinicId: 7, isActive: false, reason: 'local formulary' },
      42,
      'DOCTOR',
      7,
    );
    expect(mockTool.update).toHaveBeenCalled();
  });

  it('system admin can target any clinic', async () => {
    mockTool.findUnique.mockResolvedValue(baseTool);
    mockTool.update.mockResolvedValue(baseTool);
    const svc = buildService();
    await svc.setClinicOverride(
      'chads-vasc',
      { clinicId: 99, isActive: false },
      1,
      'ADMIN',
      undefined,
    );
    expect(mockTool.update).toHaveBeenCalled();
  });
});

describe('isClinicDisabled helper', () => {
  it('returns false for null / non-object overrides', () => {
    expect(isClinicDisabled(null, 7)).toBe(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(isClinicDisabled([] as any, 7)).toBe(false);
  });
  it('returns true when a matching entry has isActive=false', () => {
    expect(isClinicDisabled({ '7': { isActive: false } }, 7)).toBe(true);
  });
  it('returns false when a matching entry has isActive=true', () => {
    expect(isClinicDisabled({ '7': { isActive: true } }, 7)).toBe(false);
  });
});
