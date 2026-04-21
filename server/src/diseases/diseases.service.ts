import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../config/prisma.service';
import { DiseasesRepository } from './diseases.repository';
import { EmbeddingService } from './embedding.service';
import { CreateDiseaseDto } from './dto/create-disease.dto';
import { UpdateDiseaseDto } from './dto/update-disease.dto';
import { DiseaseListQueryDto } from './dto/disease-list-query.dto';
import { diseaseSlug } from '../common/slugify';

/**
 * IZOH: Prisma client `Disease*` modellari uchun generate qilinmaganligi
 * sababli `prisma` chaqiruvlari `any` sifatida bypass qilinadi. Client
 * regenerate qilingandan keyin tiplar to'liq mos keladi.
 */

type Caller = { id: number; role: string } | null;
type DiseaseRow = {
  id: string;
  slug: string;
  status: string;
  nameUz: string;
  icd10: string;
  [k: string]: unknown;
};

/** Semantik qidiruv natijasi uchun engil tip */
type DiseaseListItem = {
  id: string;
  slug: string;
  nameUz: string;
  nameLat: string | null;
  icd10: string;
  severity?: string;
  blocks?: unknown[];
};

const ADMIN_ROLES = ['ADMIN', 'MEDICAL_EDITOR'];
const EDITOR_ROLES = ['EDITOR', 'MEDICAL_EDITOR', 'ADMIN'];

@Injectable()
export class DiseasesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly repo: DiseasesRepository,
    private readonly embeddingService: EmbeddingService,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private get p(): any {
    return this.prisma;
  }

  // ── List / search ─────────────────────────────────────────────────────────

  async findAll(query: DiseaseListQueryDto, caller: Caller) {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, 100);
    const offset = (page - 1) * limit;

    const requestedStatus = query.status;
    const isPrivileged = !!caller && ADMIN_ROLES.includes(caller.role);

    let statusClause: Record<string, unknown> = { status: 'PUBLISHED' };
    if (isPrivileged && requestedStatus) {
      statusClause = requestedStatus === 'ALL' ? {} : { status: requestedStatus };
    }

    const where: Record<string, unknown> = {
      ...statusClause,
      ...(query.icd
        ? {
            OR: [
              { icd10: { startsWith: query.icd, mode: 'insensitive' } },
              { icd11: { startsWith: query.icd, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(query.category ? { category: query.category } : {}),
      ...(query.audience ? { audienceLevels: { has: query.audience } } : {}),
    };

    const q = query.q?.trim();
    if (q) {
      // FTS via raw SQL — `searchVector` Prisma da `Unsupported("tsvector")`.
      type Row = { id: string };
      const statusFilter = isPrivileged
        ? requestedStatus === 'ALL' || !requestedStatus
          ? Prisma.sql``
          : Prisma.sql`AND d."status"::text = ${requestedStatus}`
        : Prisma.sql`AND d."status"::text = 'PUBLISHED'`;

      const icdFilter = query.icd
        ? Prisma.sql`AND (d."icd10" ILIKE ${query.icd + '%'} OR d."icd11" ILIKE ${query.icd + '%'})`
        : Prisma.sql``;
      const categoryFilter = query.category
        ? Prisma.sql`AND d."category" = ${query.category}`
        : Prisma.sql``;

      const rows = (await this.prisma.$queryRaw<Row[]>`
        SELECT d."id",
               ts_rank(d."searchVector", plainto_tsquery('simple', unaccent(${q}))) AS rank
          FROM "Disease" d
         WHERE d."searchVector" @@ plainto_tsquery('simple', unaccent(${q}))
           ${statusFilter}
           ${icdFilter}
           ${categoryFilter}
         ORDER BY rank DESC
         LIMIT ${limit}
        OFFSET ${offset};
      `) as Row[];

      const ids = rows.map((r) => r.id);
      if (ids.length === 0) {
        return { items: [], total: 0, page, limit };
      }

      const items = (await this.repo.findMany({ where: { id: { in: ids } } })) as DiseaseRow[];
      const orderMap = new Map(ids.map((id, i) => [id, i]));
      items.sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0));

      const totalRows = (await this.prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*)::bigint AS count
          FROM "Disease" d
         WHERE d."searchVector" @@ plainto_tsquery('simple', unaccent(${q}))
           ${statusFilter}
           ${icdFilter}
           ${categoryFilter};
      `) as Array<{ count: bigint }>;
      const total = Number(totalRows[0]?.count ?? 0);

      return { items, total, page, limit };
    }

    const [items, total] = await Promise.all([
      this.repo.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.repo.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  // ── Single by slug ────────────────────────────────────────────────────────

  async findBySlug(slug: string, level: 'L1' | 'L2' | 'L3' = 'L1', caller: Caller) {
    const disease = (await this.repo.findUnique({
      where: { slug },
      include: {
        blocks: {
          where: {
            ...(level === 'L1'
              ? { level: 'L1' }
              : level === 'L2'
                ? { level: { in: ['L1', 'L2'] } }
                : {}),
            ...(!caller || !ADMIN_ROLES.includes(caller.role) ? { status: 'PUBLISHED' } : {}),
          },
          orderBy: { orderIndex: 'asc' },
        },
        scientists: { orderBy: { orderIndex: 'asc' } },
        research: { orderBy: [{ isLandmark: 'desc' }, { year: 'desc' }] },
        genetics: true,
      },
    })) as DiseaseRow | null;

    if (!disease) {
      throw new NotFoundException('Kasallik topilmadi');
    }

    const isPrivileged = !!caller && ADMIN_ROLES.includes(caller.role);
    if (!isPrivileged && disease.status !== 'PUBLISHED') {
      throw new NotFoundException('Kasallik topilmadi');
    }
    return disease;
  }

  // ── ICD lookup ────────────────────────────────────────────────────────────

  async findByIcd(code: string) {
    const disease = (await this.repo.findFirst({
      where: { OR: [{ icd10: code }, { icd11: code }] },
      select: { id: true, slug: true, icd10: true },
    })) as { id: string; slug: string; icd10: string } | null;
    if (!disease) throw new NotFoundException('ICD kod topilmadi');
    return disease;
  }

  // ── Create ────────────────────────────────────────────────────────────────

  async create(dto: CreateDiseaseDto, caller: Caller) {
    this.ensureEditor(caller);

    const slug = diseaseSlug(dto.nameUz, dto.icd10) || `disease-${Date.now()}`;

    const existing = await this.repo.findFirst({
      where: { OR: [{ icd10: dto.icd10 }, { slug }] },
    });
    if (existing) {
      throw new ConflictException('Bunday ICD-10 yoki slug allaqachon mavjud');
    }

    const data = {
      slug,
      icd10: dto.icd10,
      icd11: dto.icd11,
      nameUz: dto.nameUz,
      nameRu: dto.nameRu,
      nameEn: dto.nameEn,
      nameLat: dto.nameLat,
      synonyms: dto.synonyms ?? [],
      category: dto.category,
      audienceLevels: dto.audienceLevels ?? [],
      severityLevels: dto.severityLevels ?? [],
      protocolSources: dto.protocolSources ?? [],
      status: dto.status ?? 'DRAFT',
      editorId: caller?.id ?? dto.editorId,
    };

    const created = await this.p.disease.create({ data });

    if (caller?.id) {
      await this.p.diseaseEditLog.create({
        data: {
          diseaseId: created.id,
          editorId: caller.id,
          editType: 'CREATE',
          diffJson: { after: dto } as unknown as Prisma.InputJsonValue,
        },
      });
    }

    return created;
  }

  // ── Update ────────────────────────────────────────────────────────────────

  async update(id: string, dto: UpdateDiseaseDto, caller: Caller) {
    this.ensureEditor(caller);

    const before = (await this.repo.findUnique({ where: { id } })) as DiseaseRow | null;
    if (!before) {
      throw new NotFoundException('Kasallik topilmadi');
    }

    const newSlug =
      dto.nameUz || dto.icd10
        ? diseaseSlug(dto.nameUz ?? before.nameUz, dto.icd10 ?? before.icd10)
        : undefined;

    const updateData: Record<string, unknown> = {
      ...(dto.icd10 !== undefined && { icd10: dto.icd10 }),
      ...(dto.icd11 !== undefined && { icd11: dto.icd11 }),
      ...(dto.nameUz !== undefined && { nameUz: dto.nameUz }),
      ...(dto.nameRu !== undefined && { nameRu: dto.nameRu }),
      ...(dto.nameEn !== undefined && { nameEn: dto.nameEn }),
      ...(dto.nameLat !== undefined && { nameLat: dto.nameLat }),
      ...(dto.synonyms !== undefined && { synonyms: dto.synonyms }),
      ...(dto.category !== undefined && { category: dto.category }),
      ...(dto.audienceLevels !== undefined && { audienceLevels: dto.audienceLevels }),
      ...(dto.severityLevels !== undefined && { severityLevels: dto.severityLevels }),
      ...(dto.protocolSources !== undefined && { protocolSources: dto.protocolSources }),
      ...(dto.status !== undefined && { status: dto.status }),
      ...(dto.editorId !== undefined && { editorId: dto.editorId }),
      ...(newSlug && newSlug !== before.slug && { slug: newSlug }),
    };

    const [updated] = await this.prisma.$transaction([
      this.p.disease.update({ where: { id }, data: updateData }),
      ...(caller?.id
        ? [
            this.p.diseaseEditLog.create({
              data: {
                diseaseId: id,
                editorId: caller.id,
                editType:
                  dto.status && dto.status !== before.status ? 'STATUS_CHANGE' : 'UPDATE',
                diffJson: {
                  before: this.pickDiff(before, Object.keys(dto)),
                  after: dto,
                } as unknown as Prisma.InputJsonValue,
              },
            }),
          ]
        : []),
    ]);

    return updated;
  }

  // ── Soft delete ───────────────────────────────────────────────────────────

  async remove(id: string, caller: Caller) {
    if (!caller || caller.role !== 'ADMIN') {
      throw new ForbiddenException('Faqat ADMIN kasallikni arxivlashi mumkin');
    }
    const before = (await this.repo.findUnique({ where: { id } })) as DiseaseRow | null;
    if (!before) throw new NotFoundException('Kasallik topilmadi');
    if (before.status === 'ARCHIVED') {
      throw new BadRequestException('Kasallik allaqachon arxivlangan');
    }

    const [archived] = await this.prisma.$transaction([
      this.p.disease.update({ where: { id }, data: { status: 'ARCHIVED' } }),
      this.p.diseaseEditLog.create({
        data: {
          diseaseId: id,
          editorId: caller.id,
          editType: 'DELETE',
          diffJson: { archived: true } as unknown as Prisma.InputJsonValue,
        },
      }),
    ]);
    return archived;
  }

  // ── Symptom bindings (used by DiseasesController /:slug/symptoms) ─────────

  async findSymptomsForSlug(slug: string, caller: Caller) {
    const disease = (await this.repo.findUnique({
      where: { slug },
      select: { id: true, status: true },
    })) as { id: string; status: string } | null;
    if (!disease) throw new NotFoundException('Kasallik topilmadi');

    const isPrivileged = !!caller && ADMIN_ROLES.includes(caller.role);
    if (!isPrivileged && disease.status !== 'PUBLISHED') {
      throw new NotFoundException('Kasallik topilmadi');
    }
    const links = (await this.p.diseaseSymptom.findMany({
      where: { diseaseId: disease.id },
      include: { symptom: true },
      orderBy: { weight: 'desc' },
    })) as Array<{
      symptom: unknown;
      weight: unknown;
      specificity: unknown;
      sensitivity: unknown;
      isRequired: boolean;
      isExcluding: boolean;
    }>;
    return links.map((ln) => ({
      symptom: ln.symptom,
      weight: ln.weight,
      specificity: ln.specificity,
      sensitivity: ln.sensitivity,
      isRequired: ln.isRequired,
      isExcluding: ln.isExcluding,
    }));
  }

  // ── Semantic search (pgvector) ────────────────────────────────────────────

  /**
   * Vektor (cosine) masofasi asosida semantik qidiruv.
   * embedding ustuni NULL bo'lgan kasalliklar inkor qilinadi.
   */
  async semanticSearch(query: string, limit = 10): Promise<DiseaseListItem[]> {
    const embedding = await this.embeddingService.embed(query);
    const vectorStr = `[${embedding.join(',')}]`;

    type RawRow = { id: string; distance: number };
    const results = (await this.prisma.$queryRaw<RawRow[]>`
      SELECT id, embedding <=> ${vectorStr}::vector AS distance
      FROM "Disease"
      WHERE embedding IS NOT NULL
      ORDER BY distance ASC
      LIMIT ${limit}
    `) as RawRow[];

    if (results.length === 0) return [];

    const ids = results.map((r) => r.id);
    const diseases = (await this.repo.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        slug: true,
        nameUz: true,
        nameLat: true,
        icd10: true,
        blocks: {
          select: { status: true, marker: true, publishedAt: true },
        },
      },
    })) as DiseaseListItem[];

    // Distance tartibini saqlash
    const orderMap = new Map(ids.map((id, i) => [id, i]));
    return ids
      .map((id) => diseases.find((d) => d.id === id))
      .filter((d): d is DiseaseListItem => d !== undefined)
      .sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0));
  }

  /**
   * Bitta kasallik uchun embedding'ni yangilaydi.
   * Admin/Editor ishga tushiradi (masalan, yangi kasallik qo'shilgandan keyin).
   */
  async indexDiseaseEmbedding(diseaseId: string): Promise<{ ok: boolean }> {
    const disease = (await this.repo.findUnique({
      where: { id: diseaseId },
      select: { nameUz: true, nameLat: true, synonyms: true },
    })) as { nameUz: string; nameLat: string | null; synonyms: string[] } | null;

    if (!disease) throw new NotFoundException('Kasallik topilmadi');

    const embedding = await this.embeddingService.embedDisease(disease);
    const vectorStr = `[${embedding.join(',')}]`;

    await this.prisma.$executeRaw`
      UPDATE "Disease" SET embedding = ${vectorStr}::vector WHERE id = ${diseaseId}
    `;

    return { ok: true };
  }

  // ── Metadata CRUD (scientists / research / genetics) ──────────────────────
  //
  // Bu metodlar PR-14 yangi modellari uchun admin CRUD operatsiyalarini ta'minlaydi.
  // Barcha mutation'lar EDITOR+ rolini talab qiladi. GET endpointlar public:
  // PUBLISHED bo'lmagan kasalliklar uchun yashirinadi (findBySlug pattern'i kabi).

  // ── Scientists ─────────────────────────────────────────────────────────────

  async listScientists(diseaseSlugOrId: string, caller: Caller) {
    const disease = await this.requireAccessibleDisease(diseaseSlugOrId, caller);
    return this.p.diseaseScientist.findMany({
      where: { diseaseId: disease.id },
      orderBy: { orderIndex: 'asc' },
    });
  }

  async createScientist(diseaseId: string, dto: Record<string, unknown>, caller: Caller) {
    this.ensureEditor(caller);
    await this.requireDiseaseExists(diseaseId);
    const created = await this.p.diseaseScientist.create({
      data: { ...dto, diseaseId, orderIndex: (dto.orderIndex as number | undefined) ?? 0 },
    });
    await this.writeMetaAuditLog(diseaseId, caller, 'CREATE', { scientist: created });
    return created;
  }

  async updateScientist(
    diseaseId: string,
    scientistId: string,
    dto: Record<string, unknown>,
    caller: Caller,
  ) {
    this.ensureEditor(caller);
    await this.requireScientistBelongsToDisease(diseaseId, scientistId);
    const updated = await this.p.diseaseScientist.update({
      where: { id: scientistId },
      data: dto,
    });
    await this.writeMetaAuditLog(diseaseId, caller, 'UPDATE', {
      scientistId,
      after: dto,
    });
    return updated;
  }

  async deleteScientist(diseaseId: string, scientistId: string, caller: Caller) {
    this.ensureEditor(caller);
    await this.requireScientistBelongsToDisease(diseaseId, scientistId);
    await this.p.diseaseScientist.delete({ where: { id: scientistId } });
    await this.writeMetaAuditLog(diseaseId, caller, 'DELETE', { scientistId });
    return { ok: true };
  }

  // ── Research ───────────────────────────────────────────────────────────────

  async listResearch(diseaseSlugOrId: string, caller: Caller) {
    const disease = await this.requireAccessibleDisease(diseaseSlugOrId, caller);
    return this.p.diseaseResearch.findMany({
      where: { diseaseId: disease.id },
      orderBy: [{ isLandmark: 'desc' }, { year: 'desc' }],
    });
  }

  async createResearch(diseaseId: string, dto: Record<string, unknown>, caller: Caller) {
    this.ensureEditor(caller);
    await this.requireDiseaseExists(diseaseId);

    // DOI unique per disease — tekshiramiz
    if (dto.doi) {
      const existing = await this.p.diseaseResearch.findUnique({
        where: { diseaseId_doi: { diseaseId, doi: dto.doi as string } },
      });
      if (existing) {
        throw new ConflictException('Bu DOI shu kasallik uchun allaqachon qo\'shilgan');
      }
    }

    const created = await this.p.diseaseResearch.create({
      data: {
        ...dto,
        diseaseId,
        evidenceLevel: (dto.evidenceLevel as string | undefined) ?? 'C',
        isLandmark: (dto.isLandmark as boolean | undefined) ?? false,
      },
    });
    await this.writeMetaAuditLog(diseaseId, caller, 'CREATE', { research: created });
    return created;
  }

  async updateResearch(
    diseaseId: string,
    researchId: string,
    dto: Record<string, unknown>,
    caller: Caller,
  ) {
    this.ensureEditor(caller);
    await this.requireResearchBelongsToDisease(diseaseId, researchId);
    const updated = await this.p.diseaseResearch.update({
      where: { id: researchId },
      data: dto,
    });
    await this.writeMetaAuditLog(diseaseId, caller, 'UPDATE', { researchId, after: dto });
    return updated;
  }

  async deleteResearch(diseaseId: string, researchId: string, caller: Caller) {
    this.ensureEditor(caller);
    await this.requireResearchBelongsToDisease(diseaseId, researchId);
    await this.p.diseaseResearch.delete({ where: { id: researchId } });
    await this.writeMetaAuditLog(diseaseId, caller, 'DELETE', { researchId });
    return { ok: true };
  }

  // ── Genetics ───────────────────────────────────────────────────────────────

  async listGenetics(diseaseSlugOrId: string, caller: Caller) {
    const disease = await this.requireAccessibleDisease(diseaseSlugOrId, caller);
    return this.p.diseaseGenetic.findMany({
      where: { diseaseId: disease.id },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createGenetic(diseaseId: string, dto: Record<string, unknown>, caller: Caller) {
    this.ensureEditor(caller);
    await this.requireDiseaseExists(diseaseId);
    const created = await this.p.diseaseGenetic.create({
      data: { ...dto, diseaseId },
    });
    await this.writeMetaAuditLog(diseaseId, caller, 'CREATE', { genetic: created });
    return created;
  }

  async updateGenetic(
    diseaseId: string,
    geneticId: string,
    dto: Record<string, unknown>,
    caller: Caller,
  ) {
    this.ensureEditor(caller);
    await this.requireGeneticBelongsToDisease(diseaseId, geneticId);
    const updated = await this.p.diseaseGenetic.update({
      where: { id: geneticId },
      data: dto,
    });
    await this.writeMetaAuditLog(diseaseId, caller, 'UPDATE', { geneticId, after: dto });
    return updated;
  }

  async deleteGenetic(diseaseId: string, geneticId: string, caller: Caller) {
    this.ensureEditor(caller);
    await this.requireGeneticBelongsToDisease(diseaseId, geneticId);
    await this.p.diseaseGenetic.delete({ where: { id: geneticId } });
    await this.writeMetaAuditLog(diseaseId, caller, 'DELETE', { geneticId });
    return { ok: true };
  }

  // ── Metadata helpers ───────────────────────────────────────────────────────

  private async requireDiseaseExists(id: string): Promise<void> {
    const exists = await this.repo.findUnique({ where: { id }, select: { id: true } });
    if (!exists) throw new NotFoundException('Kasallik topilmadi');
  }

  /** slug yoki id qabul qiladi; public uchun PUBLISHED emasni 404. */
  private async requireAccessibleDisease(
    slugOrId: string,
    caller: Caller,
  ): Promise<{ id: string; status: string }> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      slugOrId,
    );
    const where = isUuid ? { id: slugOrId } : { slug: slugOrId };
    const disease = (await this.repo.findUnique({
      where,
      select: { id: true, status: true },
    })) as { id: string; status: string } | null;
    if (!disease) throw new NotFoundException('Kasallik topilmadi');
    const isPrivileged = !!caller && ADMIN_ROLES.includes(caller.role);
    if (!isPrivileged && disease.status !== 'PUBLISHED') {
      throw new NotFoundException('Kasallik topilmadi');
    }
    return disease;
  }

  private async requireScientistBelongsToDisease(
    diseaseId: string,
    scientistId: string,
  ): Promise<void> {
    const row = await this.p.diseaseScientist.findUnique({
      where: { id: scientistId },
      select: { diseaseId: true },
    });
    if (!row) throw new NotFoundException('Olim topilmadi');
    if (row.diseaseId !== diseaseId) {
      throw new NotFoundException('Olim bu kasallikka tegishli emas');
    }
  }

  private async requireResearchBelongsToDisease(
    diseaseId: string,
    researchId: string,
  ): Promise<void> {
    const row = await this.p.diseaseResearch.findUnique({
      where: { id: researchId },
      select: { diseaseId: true },
    });
    if (!row) throw new NotFoundException('Tadqiqot topilmadi');
    if (row.diseaseId !== diseaseId) {
      throw new NotFoundException('Tadqiqot bu kasallikka tegishli emas');
    }
  }

  private async requireGeneticBelongsToDisease(
    diseaseId: string,
    geneticId: string,
  ): Promise<void> {
    const row = await this.p.diseaseGenetic.findUnique({
      where: { id: geneticId },
      select: { diseaseId: true },
    });
    if (!row) throw new NotFoundException('Genetik yozuv topilmadi');
    if (row.diseaseId !== diseaseId) {
      throw new NotFoundException('Yozuv bu kasallikka tegishli emas');
    }
  }

  private async writeMetaAuditLog(
    diseaseId: string,
    caller: Caller,
    editType: 'CREATE' | 'UPDATE' | 'DELETE',
    payload: Record<string, unknown>,
  ): Promise<void> {
    if (!caller?.id) return;
    await this.p.diseaseEditLog.create({
      data: {
        diseaseId,
        editorId: caller.id,
        editType,
        diffJson: payload as unknown as Prisma.InputJsonValue,
      },
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private ensureEditor(caller: Caller) {
    if (!caller || !EDITOR_ROLES.includes(caller.role)) {
      throw new ForbiddenException("Ruxsat yo'q — EDITOR/MEDICAL_EDITOR/ADMIN talab qilinadi");
    }
  }

  private pickDiff(obj: Record<string, unknown>, keys: string[]): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const k of keys) {
      if (k in obj) out[k] = obj[k];
    }
    return out;
  }
}
