import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import type {
  AudienceMode,
  ClinicalTool as PrismaClinicalTool,
  Prisma,
  UserRole,
} from '@prisma/client';
import { PrismaService } from '../config/prisma.service';
import {
  ClinicalToolAdminDto,
  ClinicalToolDto,
} from './dto/clinical-tool.dto';
import type { ListToolsQueryDto } from './dto/list-tools-query.dto';
import type {
  ClinicOverrideDto,
  CreateClinicalToolDto,
  UpdateClinicalToolDto,
} from './dto/upsert-clinical-tool.dto';

/**
 * ClinicalToolsService — universal tool registry (GAP-05d).
 *
 * Responsibilities:
 *   1. Scope matching (category + icd10) mirroring the FE registry, with
 *      Uzbek slug aliases. Identical semantics to
 *      src/triage/triage-catalogue.service.ts `matchesScope`.
 *   2. Role / audience gating — visibility filter (SOFT) and run
 *      permission check (HARD). Layered:
 *        • `isActive` (global) AND NOT in clinic overrides (per-tenant).
 *        • `allowedAudiences` → if non-empty, caller's AudienceMode must
 *          intersect. Empty = visible to everyone authenticated.
 *        • `requiredRoles` → if non-empty, caller's UserRole must be in
 *          the list. Empty = runnable by anyone who can see it.
 *   3. Admin CRUD + clinic-level override endpoint.
 *
 * Trust boundary: `formulaKey` is a whitelisted identifier. Formulas live
 * in the FE repo; we never execute code from the DB.
 */
@Injectable()
export class ClinicalToolsService {
  private readonly logger = new Logger(ClinicalToolsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ── PUBLIC LISTING ────────────────────────────────────────────────────

  /**
   * List tools visible to the caller. Applies:
   *   • isActive filter (unless admin asks for `includeInactive`).
   *   • clinic-level override (if `clinicId` provided and in-map entry
   *     marks the tool inactive, it's hidden).
   *   • scope filter (category + icd10).
   *   • toolType filter.
   *   • allowedAudiences gate (if caller's role maps to an AudienceMode).
   */
  async listTools(
    query: ListToolsQueryDto,
    callerRole?: UserRole,
  ): Promise<ClinicalToolDto[]> {
    const isAdmin = isAdminRole(callerRole);
    const includeInactive = Boolean(query.includeInactive) && isAdmin;

    const tools = await this.prisma.clinicalTool.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: [{ priorityWeight: 'asc' }, { toolKey: 'asc' }],
    });

    const callerAudiences = callerRole ? audienceForRole(callerRole) : [];

    return tools
      .filter((t) => (query.toolType ? t.toolType === query.toolType : true))
      .filter((t) =>
        matchesScope(
          t.applicableCategories,
          t.applicableIcd10Prefixes,
          query.category,
          query.icd10,
        ),
      )
      .filter((t) => passesAudienceGate(t.allowedAudiences, callerAudiences))
      .filter((t) =>
        query.clinicId ? !isClinicDisabled(t.clinicOverridesJson, query.clinicId) : true,
      )
      .map(toPublicDto);
  }

  async getToolByKey(
    toolKey: string,
    callerRole?: UserRole,
    clinicId?: number,
  ): Promise<ClinicalToolDto> {
    const tool = await this.prisma.clinicalTool.findUnique({
      where: { toolKey },
    });
    if (!tool) throw new NotFoundException(`Tool not found: ${toolKey}`);
    if (!tool.isActive && !isAdminRole(callerRole)) {
      throw new NotFoundException(`Tool not found: ${toolKey}`);
    }
    if (clinicId && isClinicDisabled(tool.clinicOverridesJson, clinicId)) {
      throw new NotFoundException(`Tool not found: ${toolKey}`);
    }
    if (!passesAudienceGate(tool.allowedAudiences, audienceForRole(callerRole))) {
      throw new NotFoundException(`Tool not found: ${toolKey}`);
    }
    return toPublicDto(tool);
  }

  /**
   * HARD gate — called from the `POST /clinical-tools/:key/run` endpoint
   * (future PR) or any action that records a usage log. Throws 403 if
   * the caller lacks the required role.
   */
  async assertCanRun(
    toolKey: string,
    callerRole: UserRole,
    clinicId?: number,
  ): Promise<PrismaClinicalTool> {
    const tool = await this.prisma.clinicalTool.findUnique({
      where: { toolKey },
    });
    if (!tool || !tool.isActive) {
      throw new NotFoundException(`Tool not found: ${toolKey}`);
    }
    if (clinicId && isClinicDisabled(tool.clinicOverridesJson, clinicId)) {
      throw new ForbiddenException(
        `Tool "${toolKey}" is disabled for this clinic.`,
      );
    }
    if (
      tool.requiredRoles.length > 0
      && !tool.requiredRoles.includes(callerRole)
    ) {
      throw new ForbiddenException(
        `Role ${callerRole} is not authorised to run "${toolKey}".`,
      );
    }
    return tool;
  }

  // ── ADMIN CRUD ────────────────────────────────────────────────────────

  async adminList(): Promise<ClinicalToolAdminDto[]> {
    const tools = await this.prisma.clinicalTool.findMany({
      orderBy: [{ priorityWeight: 'asc' }, { toolKey: 'asc' }],
    });
    return tools.map(toAdminDto);
  }

  async adminGet(toolKey: string): Promise<ClinicalToolAdminDto> {
    const tool = await this.prisma.clinicalTool.findUnique({
      where: { toolKey },
    });
    if (!tool) throw new NotFoundException(`Tool not found: ${toolKey}`);
    return toAdminDto(tool);
  }

  async adminCreate(
    dto: CreateClinicalToolDto,
    userId: number,
  ): Promise<ClinicalToolAdminDto> {
    const existing = await this.prisma.clinicalTool.findUnique({
      where: { toolKey: dto.toolKey },
    });
    if (existing) {
      throw new BadRequestException(`Tool already exists: ${dto.toolKey}`);
    }
    this.assertDoseHasRoles(dto.toolType, dto.requiredRoles ?? []);

    const created = await this.prisma.clinicalTool.create({
      data: {
        toolKey: dto.toolKey,
        toolType: dto.toolType,
        nameKey: dto.nameKey,
        descriptionKey: dto.descriptionKey ?? null,
        source: dto.source,
        sourceUrl: dto.sourceUrl ?? null,
        evidenceLevel: dto.evidenceLevel ?? 'C',
        formulaKey: dto.formulaKey,
        inputsJson: dto.inputs as Prisma.InputJsonValue,
        outputSchemaJson:
          (dto.outputSchema as Prisma.InputJsonValue | undefined) ?? undefined,
        showFormulaForAudience: dto.showFormulaForAudience ?? null,
        applicableCategories: dto.applicableCategories ?? [],
        applicableIcd10Prefixes: dto.applicableIcd10Prefixes ?? [],
        allowedAudiences: dto.allowedAudiences ?? [],
        requiredRoles: dto.requiredRoles ?? [],
        regionFitness: dto.regionFitness ?? null,
        priorityWeight: dto.priorityWeight ?? 100,
        createdBy: userId,
        updatedBy: userId,
      },
    });
    this.logger.log(`[admin] created tool ${created.toolKey} by user#${userId}`);
    return toAdminDto(created);
  }

  async adminUpdate(
    toolKey: string,
    dto: UpdateClinicalToolDto,
    userId: number,
  ): Promise<ClinicalToolAdminDto> {
    const existing = await this.prisma.clinicalTool.findUnique({
      where: { toolKey },
    });
    if (!existing) throw new NotFoundException(`Tool not found: ${toolKey}`);

    // Deactivation requires a reason — enforced here rather than on the DTO so
    // "activate" PATCHes (isActive=true) don't need to send a dummy reason.
    const flippingOff = dto.isActive === false && existing.isActive;
    if (flippingOff && !dto.deactivationReason?.trim()) {
      throw new BadRequestException(
        'deactivationReason is required when deactivating a tool.',
      );
    }
    if (dto.requiredRoles) {
      this.assertDoseHasRoles(existing.toolType, dto.requiredRoles);
    }

    const data: Prisma.ClinicalToolUpdateInput = {
      updatedBy: userId,
    };
    if (dto.nameKey !== undefined) data.nameKey = dto.nameKey;
    if (dto.descriptionKey !== undefined) data.descriptionKey = dto.descriptionKey;
    if (dto.source !== undefined) data.source = dto.source;
    if (dto.sourceUrl !== undefined) data.sourceUrl = dto.sourceUrl;
    if (dto.evidenceLevel !== undefined) data.evidenceLevel = dto.evidenceLevel;
    if (dto.inputs !== undefined) data.inputsJson = dto.inputs as Prisma.InputJsonValue;
    if (dto.outputSchema !== undefined) {
      data.outputSchemaJson = dto.outputSchema as Prisma.InputJsonValue;
    }
    if (dto.showFormulaForAudience !== undefined) {
      data.showFormulaForAudience = dto.showFormulaForAudience;
    }
    if (dto.applicableCategories !== undefined) {
      data.applicableCategories = dto.applicableCategories;
    }
    if (dto.applicableIcd10Prefixes !== undefined) {
      data.applicableIcd10Prefixes = dto.applicableIcd10Prefixes;
    }
    if (dto.allowedAudiences !== undefined) {
      data.allowedAudiences = dto.allowedAudiences;
    }
    if (dto.requiredRoles !== undefined) data.requiredRoles = dto.requiredRoles;
    if (dto.regionFitness !== undefined) data.regionFitness = dto.regionFitness;
    if (dto.priorityWeight !== undefined) data.priorityWeight = dto.priorityWeight;

    if (dto.isActive !== undefined) {
      data.isActive = dto.isActive;
      if (flippingOff) {
        data.deactivationReason = dto.deactivationReason ?? null;
        data.deactivatedAt = new Date();
        data.deactivatedBy = userId;
      } else if (dto.isActive === true && !existing.isActive) {
        // Re-activation clears the deactivation audit.
        data.deactivationReason = null;
        data.deactivatedAt = null;
        data.deactivatedBy = null;
      }
    }

    const updated = await this.prisma.clinicalTool.update({
      where: { toolKey },
      data,
    });
    this.logger.log(
      `[admin] updated tool ${toolKey} by user#${userId} (isActive=${updated.isActive})`,
    );
    return toAdminDto(updated);
  }

  /**
   * Per-clinic activation override. System admins can target any clinic;
   * clinic admins are constrained to their own clinicId (enforced at the
   * controller via guards + the `callerClinicId` param here).
   */
  async setClinicOverride(
    toolKey: string,
    dto: ClinicOverrideDto,
    userId: number,
    callerRole: UserRole,
    callerClinicId?: number,
  ): Promise<ClinicalToolAdminDto> {
    if (callerRole !== 'ADMIN' && callerClinicId !== dto.clinicId) {
      throw new ForbiddenException(
        'Clinic admins may only override tools for their own clinic.',
      );
    }

    const existing = await this.prisma.clinicalTool.findUnique({
      where: { toolKey },
    });
    if (!existing) throw new NotFoundException(`Tool not found: ${toolKey}`);

    const overrides = normaliseClinicOverrides(existing.clinicOverridesJson);
    overrides[String(dto.clinicId)] = {
      isActive: dto.isActive,
      reason: dto.reason ?? null,
      updatedAt: new Date().toISOString(),
      updatedBy: userId,
    };

    const updated = await this.prisma.clinicalTool.update({
      where: { toolKey },
      data: {
        clinicOverridesJson: overrides as unknown as Prisma.InputJsonValue,
        updatedBy: userId,
      },
    });
    this.logger.log(
      `[admin] clinic#${dto.clinicId} override on ${toolKey}: isActive=${dto.isActive} by user#${userId}`,
    );
    return toAdminDto(updated);
  }

  // ── Private helpers ───────────────────────────────────────────────────

  /**
   * DOSE toolType MUST pin at least one clinical role. Otherwise a
   * medication dose tool could leak to PATIENT audience — a safety bug.
   */
  private assertDoseHasRoles(
    toolType: PrismaClinicalTool['toolType'],
    requiredRoles: UserRole[],
  ): void {
    if (toolType !== 'DOSE') return;
    const hasClinicalRole = requiredRoles.some((r) =>
      ['DOCTOR', 'SPECIALIST', 'NURSE'].includes(r),
    );
    if (!hasClinicalRole) {
      throw new BadRequestException(
        'DOSE tools must restrict requiredRoles to DOCTOR/SPECIALIST/NURSE.',
      );
    }
  }
}

// ─── Scope matching (parity with src/triage/triage-catalogue.service.ts) ────

/**
 * Uzbek slug aliases. Kept in sync with FE `CATEGORY_ALIASES` + the
 * triage-catalogue service. Drift here silently under/over-shows tools.
 */
const CATEGORY_ALIASES: Record<string, string[]> = {
  cardiology: ['cardiology', 'yurak-qon-tomir', 'yurak', 'kardiologiya'],
  neurology: ['neurology', 'nerv-tizimi', 'nevrologiya'],
  endocrinology: ['endocrinology', 'endokrin', 'endokrinologiya'],
  nephrology: ['nephrology', 'nefrologiya', 'buyrak'],
  pulmonology: ['pulmonology', 'nafas-yollari', 'pulmonologiya'],
  gastroenterology: ['gastroenterology', 'hazm', 'gastroenterologiya'],
  psychiatry: ['psychiatry', 'psixiatriya', 'ruhiy'],
  'primary-care': ['primary-care', 'umumiy-amaliyot', 'oilaviy-shifokor'],
  'internal-medicine': ['internal-medicine', 'terapiya', 'ichki-kasalliklar'],
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

// ─── Role ↔ audience mapping ────────────────────────────────────────────────

/**
 * Maps a UserRole → one or more AudienceMode values. Called to match the
 * caller against `allowedAudiences`. Kept as a plain function (not a
 * Map) so reading it from unit tests doesn't require bootstrapping Nest.
 */
export function audienceForRole(
  role: UserRole | undefined,
): AudienceMode[] {
  if (!role) return [];
  switch (role) {
    case 'PATIENT':
      return ['PATIENT'];
    case 'STUDENT':
      return ['STUDENT'];
    case 'NURSE':
      return ['NURSE', 'MIXED'];
    case 'DOCTOR':
      return ['DOCTOR', 'MIXED'];
    case 'SPECIALIST':
      return ['SPECIALIST', 'DOCTOR', 'MIXED'];
    case 'RADIOLOG':
      return ['DOCTOR', 'SPECIALIST', 'MIXED'];
    case 'ADMIN':
    case 'EDITOR':
    case 'MEDICAL_EDITOR':
      // Admin/editors see everything regardless of audience gate.
      return ['PATIENT', 'STUDENT', 'NURSE', 'DOCTOR', 'SPECIALIST', 'MIXED'];
    default:
      return [];
  }
}

/**
 * Soft audience gate. Empty `allowed` = visible to all authenticated
 * users; otherwise caller must match at least one allowed AudienceMode.
 * Unauthenticated callers pass only when `allowed` is empty (public tool).
 */
export function passesAudienceGate(
  allowed: AudienceMode[],
  callerAudiences: AudienceMode[],
): boolean {
  if (allowed.length === 0) return true;
  if (callerAudiences.length === 0) return false;
  return callerAudiences.some((a) => allowed.includes(a));
}

function isAdminRole(role: UserRole | undefined): boolean {
  return role === 'ADMIN' || role === 'MEDICAL_EDITOR' || role === 'EDITOR';
}

// ─── Clinic override helpers ────────────────────────────────────────────────

interface ClinicOverrideEntry {
  isActive: boolean;
  reason?: string | null;
  updatedAt?: string;
  updatedBy?: number;
}

function normaliseClinicOverrides(
  raw: Prisma.JsonValue | null,
): Record<string, ClinicOverrideEntry> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  return { ...(raw as unknown as Record<string, ClinicOverrideEntry>) };
}

export function isClinicDisabled(
  raw: Prisma.JsonValue | null,
  clinicId: number,
): boolean {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return false;
  const map = raw as unknown as Record<string, ClinicOverrideEntry>;
  const entry = map[String(clinicId)];
  return entry ? entry.isActive === false : false;
}

// ─── Row → DTO mappers ──────────────────────────────────────────────────────

function toPublicDto(row: PrismaClinicalTool): ClinicalToolDto {
  return {
    id: row.id,
    toolKey: row.toolKey,
    toolType: row.toolType,
    nameKey: row.nameKey,
    descriptionKey: row.descriptionKey,
    source: row.source,
    sourceUrl: row.sourceUrl,
    evidenceLevel: row.evidenceLevel,
    formulaKey: row.formulaKey,
    inputs: row.inputsJson as unknown as ClinicalToolDto['inputs'],
    outputSchema: row.outputSchemaJson as Record<string, unknown> | null,
    showFormulaForAudience: row.showFormulaForAudience,
    applicableCategories: row.applicableCategories,
    applicableIcd10Prefixes: row.applicableIcd10Prefixes,
    allowedAudiences: row.allowedAudiences,
    requiredRoles: row.requiredRoles,
    isActive: row.isActive,
    regionFitness: row.regionFitness,
    priorityWeight: row.priorityWeight,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function toAdminDto(row: PrismaClinicalTool): ClinicalToolAdminDto {
  return {
    ...toPublicDto(row),
    deactivationReason: row.deactivationReason,
    deactivatedAt: row.deactivatedAt,
    deactivatedBy: row.deactivatedBy,
    clinicOverrides: row.clinicOverridesJson as Record<string, unknown> | null,
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
  };
}
