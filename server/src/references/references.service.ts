import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { CreateReferenceDto } from './dto/create-reference.dto';
import { UpdateReferenceDto } from './dto/update-reference.dto';
import { ReferenceListQueryDto } from './dto/reference-list-query.dto';

/**
 * IZOH: Prisma client `Reference`/`DiseaseReference` uchun regenerate
 * qilinmagan — `any` bypass ishlatiladi.
 */

type Caller = { id: number; role: string } | null;
const EDITOR_ROLES = ['EDITOR', 'MEDICAL_EDITOR', 'ADMIN'];

@Injectable()
export class ReferencesService {
  constructor(private readonly prisma: PrismaService) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private get p(): any {
    return this.prisma;
  }

  async findAll(query: ReferenceListQueryDto) {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, 100);
    const offset = (page - 1) * limit;

    const where: Record<string, unknown> = {
      ...(query.type ? { type: query.type } : {}),
      ...(query.q
        ? {
            OR: [
              { citation: { contains: query.q, mode: 'insensitive' } },
              { doi: { contains: query.q, mode: 'insensitive' } },
              { pubmedId: { contains: query.q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.p.reference.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.p.reference.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async findOne(id: string) {
    const ref = await this.p.reference.findUnique({ where: { id } });
    if (!ref) throw new NotFoundException('Manba topilmadi');
    return ref;
  }

  async create(dto: CreateReferenceDto, caller: Caller) {
    this.ensureEditor(caller);
    if (dto.doi) {
      const existing = await this.p.reference.findUnique({ where: { doi: dto.doi } });
      if (existing) throw new ConflictException('Bunday DOI allaqachon mavjud');
    }
    return this.p.reference.create({
      data: {
        type: dto.type,
        citation: dto.citation,
        url: dto.url,
        doi: dto.doi,
        pubmedId: dto.pubmedId,
        whoCode: dto.whoCode,
        publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : undefined,
        evidenceLevel: dto.evidenceLevel ?? 'C',
      },
    });
  }

  async update(id: string, dto: UpdateReferenceDto, caller: Caller) {
    this.ensureEditor(caller);
    const existing = await this.p.reference.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Manba topilmadi');
    return this.p.reference.update({
      where: { id },
      data: {
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.citation !== undefined && { citation: dto.citation }),
        ...(dto.url !== undefined && { url: dto.url }),
        ...(dto.doi !== undefined && { doi: dto.doi }),
        ...(dto.pubmedId !== undefined && { pubmedId: dto.pubmedId }),
        ...(dto.whoCode !== undefined && { whoCode: dto.whoCode }),
        ...(dto.publishedAt !== undefined && { publishedAt: new Date(dto.publishedAt) }),
        ...(dto.evidenceLevel !== undefined && { evidenceLevel: dto.evidenceLevel }),
      },
    });
  }

  async remove(id: string, caller: Caller) {
    this.ensureEditor(caller);
    const existing = await this.p.reference.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Manba topilmadi');

    const usageCount = (await this.p.diseaseReference.count({
      where: { referenceId: id },
    })) as number;
    if (usageCount > 0) {
      throw new ConflictException(`Reference is in use by ${usageCount} block(s)`);
    }
    return this.p.reference.delete({ where: { id } });
  }

  private ensureEditor(caller: Caller) {
    if (!caller || !EDITOR_ROLES.includes(caller.role)) {
      throw new ForbiddenException("Ruxsat yo'q — EDITOR/MEDICAL_EDITOR/ADMIN talab qilinadi");
    }
  }
}
