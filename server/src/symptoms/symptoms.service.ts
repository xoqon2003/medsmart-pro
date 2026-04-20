import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../config/prisma.service';
import { CreateSymptomDto } from './dto/create-symptom.dto';
import { UpdateSymptomDto } from './dto/update-symptom.dto';
import { SymptomListQueryDto } from './dto/symptom-list-query.dto';

/**
 * IZOH: Prisma client `Symptom` uchun regenerate qilinmagan — `any` bypass.
 */

type Caller = { id: number; role: string } | null;
const EDITOR_ROLES = ['EDITOR', 'MEDICAL_EDITOR', 'ADMIN'];

@Injectable()
export class SymptomsService {
  constructor(private readonly prisma: PrismaService) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private get p(): any {
    return this.prisma;
  }

  async findAll(query: SymptomListQueryDto) {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, 100);
    const offset = (page - 1) * limit;

    const where: Record<string, unknown> = {
      ...(query.category ? { category: query.category } : {}),
      ...(query.bodyZone ? { bodyZone: query.bodyZone } : {}),
    };

    const q = query.q?.trim();
    if (q) {
      type Row = { id: string };
      const categoryFilter = query.category
        ? Prisma.sql`AND s."category" = ${query.category}`
        : Prisma.sql``;
      const bodyZoneFilter = query.bodyZone
        ? Prisma.sql`AND s."bodyZone" = ${query.bodyZone}`
        : Prisma.sql``;

      const rows = (await this.prisma.$queryRaw<Row[]>`
        SELECT s."id",
               ts_rank(s."searchVector", plainto_tsquery('simple', unaccent(${q}))) AS rank
          FROM "Symptom" s
         WHERE s."searchVector" @@ plainto_tsquery('simple', unaccent(${q}))
           ${categoryFilter}
           ${bodyZoneFilter}
         ORDER BY rank DESC
         LIMIT ${limit}
        OFFSET ${offset};
      `) as Row[];
      const ids = rows.map((r) => r.id);
      if (!ids.length) return { items: [], total: 0, page, limit };

      const items = (await this.p.symptom.findMany({ where: { id: { in: ids } } })) as Array<{
        id: string;
      }>;
      const orderMap = new Map(ids.map((id, i) => [id, i]));
      items.sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0));

      const totalRows = (await this.prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*)::bigint AS count
          FROM "Symptom" s
         WHERE s."searchVector" @@ plainto_tsquery('simple', unaccent(${q}))
           ${categoryFilter}
           ${bodyZoneFilter};
      `) as Array<{ count: bigint }>;
      return { items, total: Number(totalRows[0]?.count ?? 0), page, limit };
    }

    const [items, total] = await Promise.all([
      this.p.symptom.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.p.symptom.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async findOne(id: string) {
    const symptom = await this.p.symptom.findUnique({ where: { id } });
    if (!symptom) throw new NotFoundException('Simptom topilmadi');
    return symptom;
  }

  async create(dto: CreateSymptomDto, caller: Caller) {
    this.ensureEditor(caller);

    const existing = await this.p.symptom.findUnique({ where: { code: dto.code } });
    if (existing) throw new ConflictException('Bunday simptom kodi mavjud');

    return this.p.symptom.create({
      data: {
        code: dto.code,
        nameUz: dto.nameUz,
        nameRu: dto.nameRu,
        nameEn: dto.nameEn,
        nameLat: dto.nameLat,
        category: dto.category,
        bodyZone: dto.bodyZone,
        severity: dto.severity ?? 'MILD',
        synonyms: dto.synonyms ?? [],
        isRedFlag: dto.isRedFlag ?? false,
      },
    });
  }

  async update(id: string, dto: UpdateSymptomDto, caller: Caller) {
    this.ensureEditor(caller);

    const existing = await this.p.symptom.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Simptom topilmadi');

    return this.p.symptom.update({
      where: { id },
      data: {
        ...(dto.code !== undefined && { code: dto.code }),
        ...(dto.nameUz !== undefined && { nameUz: dto.nameUz }),
        ...(dto.nameRu !== undefined && { nameRu: dto.nameRu }),
        ...(dto.nameEn !== undefined && { nameEn: dto.nameEn }),
        ...(dto.nameLat !== undefined && { nameLat: dto.nameLat }),
        ...(dto.category !== undefined && { category: dto.category }),
        ...(dto.bodyZone !== undefined && { bodyZone: dto.bodyZone }),
        ...(dto.severity !== undefined && { severity: dto.severity }),
        ...(dto.synonyms !== undefined && { synonyms: dto.synonyms }),
        ...(dto.isRedFlag !== undefined && { isRedFlag: dto.isRedFlag }),
      },
    });
  }

  async remove(id: string, caller: Caller) {
    if (!caller || caller.role !== 'ADMIN') {
      throw new ForbiddenException('Faqat ADMIN simptomni o\'chirishi mumkin');
    }
    const existing = await this.p.symptom.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Simptom topilmadi');
    return this.p.symptom.delete({ where: { id } });
  }

  private ensureEditor(caller: Caller) {
    if (!caller || !EDITOR_ROLES.includes(caller.role)) {
      throw new ForbiddenException("Ruxsat yo'q — EDITOR/MEDICAL_EDITOR/ADMIN talab qilinadi");
    }
  }
}
