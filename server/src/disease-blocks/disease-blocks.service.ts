import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../config/prisma.service';
import { CreateBlockDto } from './dto/create-block.dto';
import { UpdateBlockDto } from './dto/update-block.dto';
import { BlockListQueryDto } from './dto/block-list-query.dto';
import { AttachReferenceDto } from './dto/attach-reference.dto';
import { isCanonicalMarker } from '../diseases/markers/markers';

/**
 * IZOH: Prisma client `DiseaseBlock`/`DiseaseReference` uchun regenerate
 * qilinmagan — `any` bypass ishlatiladi.
 */

type Caller = { id: number; role: string } | null;
type BlockRow = {
  id: string;
  diseaseId: string;
  marker: string;
  status: string;
  audiencePriority: unknown;
  [k: string]: unknown;
};

const EDITOR_ROLES = ['EDITOR', 'MEDICAL_EDITOR', 'ADMIN'];
const ADMIN_ROLES = ['ADMIN', 'MEDICAL_EDITOR'];

@Injectable()
export class DiseaseBlocksService {
  constructor(private readonly prisma: PrismaService) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private get p(): any {
    return this.prisma;
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private async resolveDisease(slug: string) {
    const d = (await this.p.disease.findUnique({
      where: { slug },
      select: { id: true, status: true },
    })) as { id: string; status: string } | null;
    if (!d) throw new NotFoundException('Kasallik topilmadi');
    return d;
  }

  private ensureEditor(caller: Caller) {
    if (!caller || !EDITOR_ROLES.includes(caller.role)) {
      throw new ForbiddenException("Ruxsat yo'q — EDITOR/MEDICAL_EDITOR/ADMIN talab qilinadi");
    }
  }

  // ── Read ──────────────────────────────────────────────────────────────────

  async listForDisease(slug: string, query: BlockListQueryDto, caller: Caller) {
    const disease = await this.resolveDisease(slug);
    const isPrivileged = !!caller && ADMIN_ROLES.includes(caller.role);

    if (!isPrivileged && disease.status !== 'PUBLISHED') {
      throw new NotFoundException('Kasallik topilmadi');
    }

    const where: Record<string, unknown> = {
      diseaseId: disease.id,
      ...(query.level ? { level: query.level } : {}),
    };

    if (isPrivileged && query.status) {
      if (query.status !== 'ALL') {
        where.status = query.status;
      }
    } else {
      where.status = 'PUBLISHED';
    }

    const blocks = (await this.p.diseaseBlock.findMany({
      where,
      orderBy: [{ orderIndex: 'asc' }, { createdAt: 'asc' }],
    })) as BlockRow[];

    if (query.audience) {
      const key = query.audience.toLowerCase();
      return blocks.filter((b) => {
        if (!b.audiencePriority) return true;
        const ap = b.audiencePriority as Record<string, unknown>;
        return key in ap;
      });
    }

    return blocks;
  }

  async findByMarker(slug: string, marker: string, caller: Caller) {
    if (!isCanonicalMarker(marker)) {
      throw new UnprocessableEntityException(`Unknown marker: ${marker}`);
    }
    const disease = await this.resolveDisease(slug);
    const isPrivileged = !!caller && ADMIN_ROLES.includes(caller.role);
    if (!isPrivileged && disease.status !== 'PUBLISHED') {
      throw new NotFoundException('Kasallik topilmadi');
    }

    const block = (await this.p.diseaseBlock.findUnique({
      where: { diseaseId_marker: { diseaseId: disease.id, marker } },
    })) as BlockRow | null;
    if (!block) throw new NotFoundException('Blok topilmadi');
    if (!isPrivileged && block.status !== 'PUBLISHED') {
      throw new NotFoundException('Blok topilmadi');
    }
    return block;
  }

  // ── Create ────────────────────────────────────────────────────────────────

  async create(slug: string, dto: CreateBlockDto, caller: Caller) {
    this.ensureEditor(caller);

    if (!isCanonicalMarker(dto.marker)) {
      throw new UnprocessableEntityException(`Unknown marker: ${dto.marker}`);
    }

    const disease = await this.resolveDisease(slug);

    const existing = await this.p.diseaseBlock.findUnique({
      where: { diseaseId_marker: { diseaseId: disease.id, marker: dto.marker } },
    });
    if (existing) {
      throw new ConflictException(`Bu kasallik uchun "${dto.marker}" blok allaqachon mavjud`);
    }

    const [block] = await this.prisma.$transaction([
      this.p.diseaseBlock.create({
        data: {
          diseaseId: disease.id,
          marker: dto.marker,
          label: dto.label,
          level: dto.level ?? 'L1',
          orderIndex: dto.orderIndex ?? 0,
          audiencePriority: dto.audiencePriority ?? undefined,
          contentMd: dto.contentMd,
          contentJson: dto.contentJson ?? undefined,
          evidenceLevel: dto.evidenceLevel ?? 'C',
          status: dto.status ?? 'DRAFT',
          lastEditedBy: caller?.id,
          lastEditedAt: new Date(),
        },
      }),
      ...(caller?.id
        ? [
            this.p.diseaseEditLog.create({
              data: {
                diseaseId: disease.id,
                editorId: caller.id,
                editType: 'CREATE',
                diffJson: {
                  block: { marker: dto.marker, label: dto.label },
                } as unknown as Prisma.InputJsonValue,
              },
            }),
          ]
        : []),
    ]);

    return block;
  }

  // ── Update ────────────────────────────────────────────────────────────────

  async update(slug: string, id: string, dto: UpdateBlockDto, caller: Caller) {
    this.ensureEditor(caller);
    const disease = await this.resolveDisease(slug);

    const before = (await this.p.diseaseBlock.findUnique({
      where: { id },
    })) as BlockRow | null;
    if (!before || before.diseaseId !== disease.id) {
      throw new NotFoundException('Blok topilmadi');
    }

    if (dto.marker !== undefined && !isCanonicalMarker(dto.marker)) {
      throw new UnprocessableEntityException(`Unknown marker: ${dto.marker}`);
    }

    const updateData: Record<string, unknown> = {
      ...(dto.marker !== undefined && { marker: dto.marker }),
      ...(dto.label !== undefined && { label: dto.label }),
      ...(dto.level !== undefined && { level: dto.level }),
      ...(dto.orderIndex !== undefined && { orderIndex: dto.orderIndex }),
      ...(dto.audiencePriority !== undefined && { audiencePriority: dto.audiencePriority }),
      ...(dto.contentMd !== undefined && { contentMd: dto.contentMd }),
      ...(dto.contentJson !== undefined && { contentJson: dto.contentJson }),
      ...(dto.evidenceLevel !== undefined && { evidenceLevel: dto.evidenceLevel }),
      ...(dto.status !== undefined && { status: dto.status }),
      ...(caller?.id !== undefined && { lastEditedBy: caller.id }),
      lastEditedAt: new Date(),
    };

    const [updated] = await this.prisma.$transaction([
      this.p.diseaseBlock.update({ where: { id }, data: updateData }),
      ...(caller?.id
        ? [
            this.p.diseaseEditLog.create({
              data: {
                diseaseId: disease.id,
                blockId: id,
                editorId: caller.id,
                editType:
                  dto.status && dto.status !== before.status ? 'STATUS_CHANGE' : 'UPDATE',
                diffJson: {
                  before: { status: before.status, contentMd: before.contentMd ?? null },
                  after: dto,
                } as unknown as Prisma.InputJsonValue,
              },
            }),
          ]
        : []),
    ]);

    return updated;
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  async remove(slug: string, id: string, caller: Caller) {
    this.ensureEditor(caller);
    const disease = await this.resolveDisease(slug);
    const before = (await this.p.diseaseBlock.findUnique({
      where: { id },
    })) as BlockRow | null;
    if (!before || before.diseaseId !== disease.id) {
      throw new NotFoundException('Blok topilmadi');
    }

    const [deleted] = await this.prisma.$transaction([
      this.p.diseaseBlock.delete({ where: { id } }),
      ...(caller?.id
        ? [
            this.p.diseaseEditLog.create({
              data: {
                diseaseId: disease.id,
                blockId: id,
                editorId: caller.id,
                editType: 'DELETE',
                diffJson: { marker: before.marker } as unknown as Prisma.InputJsonValue,
              },
            }),
          ]
        : []),
    ]);
    return deleted;
  }

  // ── Reference attachment ──────────────────────────────────────────────────

  async attachReference(slug: string, blockId: string, dto: AttachReferenceDto, caller: Caller) {
    this.ensureEditor(caller);
    const disease = await this.resolveDisease(slug);

    const block = (await this.p.diseaseBlock.findUnique({
      where: { id: blockId },
    })) as BlockRow | null;
    if (!block || block.diseaseId !== disease.id) {
      throw new NotFoundException('Blok topilmadi');
    }

    const ref = await this.p.reference.findUnique({ where: { id: dto.referenceId } });
    if (!ref) throw new NotFoundException('Manba topilmadi');

    try {
      return await this.p.diseaseReference.create({
        data: {
          diseaseId: disease.id,
          referenceId: dto.referenceId,
          blockMarker: block.marker,
          note: dto.note,
        },
      });
    } catch (err: unknown) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        (err as { code?: string }).code === 'P2002'
      ) {
        throw new ConflictException("Bu manba allaqachon blokka bog'langan");
      }
      throw new BadRequestException("Manbani bog'lab bo'lmadi");
    }
  }
}
