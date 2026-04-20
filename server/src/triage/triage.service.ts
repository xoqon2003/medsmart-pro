import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { MessagesService } from '../messages/messages.service';
import { NotificationsService } from '../notifications/notifications.service';
import { scoreMatch, AnswerValue, DiseaseSymptomRef } from './match-engine';
import { evaluateRedFlags, RedFlagRule } from './red-flag-rules';
import { buildQuestionnaireResponse } from '../common/fhir/questionnaire-response.builder';
import { MatchRequestDto } from './dto/match-request.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { SendToDoctorDto } from './dto/send-to-doctor.dto';
import { SaveNoteDto } from './dto/save-note.dto';
import { ListInboxQueryDto } from './dto/list-inbox-query.dto';

const DOCTOR_ROLES = ['DOCTOR', 'SPECIALIST', 'MEDICAL_EDITOR', 'ADMIN'] as const;

@Injectable()
export class TriageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly messagesService: MessagesService,
    private readonly notificationsService: NotificationsService,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private get p(): any {
    return this.prisma;
  }

  // ─── match ──────────────────────────────────────────────────────────────────

  async match(userId: number, dto: MatchRequestDto) {
    const userAnswers = new Map<string, AnswerValue>(
      dto.userSymptoms.map((s) => [s.code, s.answer as AnswerValue]),
    );

    if (dto.diseaseId) {
      return this._matchSingleDisease(userId, dto.diseaseId, userAnswers, dto);
    }

    // Scan all PUBLISHED diseases (limit 100)
    const diseases = await this.p.disease.findMany({
      where: { status: 'PUBLISHED' },
      select: {
        id: true,
        slug: true,
        icd10: true,
        diseaseSymptoms: {
          select: {
            weight: true,
            isRequired: true,
            isExcluding: true,
            symptom: {
              select: { code: true, isRedFlag: true, nameUz: true },
            },
          },
        },
      },
      take: 100,
    });

    type DsRow = {
      weight: number | { toNumber(): number };
      isRequired: boolean;
      isExcluding: boolean;
      symptom: { code: string; isRedFlag: boolean; nameUz: string };
    };

    const results = diseases.map((d: { id: string; slug: string; icd10: string; diseaseSymptoms: DsRow[] }) => {
      const refs: DiseaseSymptomRef[] = d.diseaseSymptoms.map((ds: DsRow) => ({
        code: ds.symptom.code,
        weight: typeof ds.weight === 'object' ? ds.weight.toNumber() : Number(ds.weight),
        isRequired: ds.isRequired,
        isExcluding: ds.isExcluding,
        isRedFlag: ds.symptom.isRedFlag,
      }));
      return scoreMatch(userAnswers, d.id, refs);
    });

    // Top-10 by score desc
    results.sort((a: { score: number }, b: { score: number }) => b.score - a.score);
    const top10 = results.slice(0, 10);

    // Red-flag baholash — foydalanuvchi YES deb belgilagan markerlar orqali
    const positiveMarkers = [...userAnswers.entries()]
      .filter(([, v]) => v === 'YES')
      .map(([k]) => k);
    const redFlags: RedFlagRule[] = evaluateRedFlags(positiveMarkers);

    // Create sessions for each top result
    const expiresAt = new Date(Date.now() + 7 * 24 * 3600_000);
    const sessions = await Promise.all(
      top10.map(async (result: ReturnType<typeof scoreMatch>) => {
        const session = await this.p.symptomMatchSession.create({
          data: {
            userId,
            diseaseId: result.diseaseId,
            matchScore: result.score,
            matchedSymptoms: result.matchedSymptoms,
            missingSymptoms: result.missingSymptoms,
            userAnswers: Object.fromEntries(userAnswers),
            status: 'ACTIVE',
            expiresAt,
          },
        });
        return {
          sessionId: session.id,
          diseaseId: result.diseaseId,
          score: result.score,
          matchedSymptoms: result.matchedSymptoms,
          missingSymptoms: result.missingSymptoms,
          redFlagHit: result.redFlagHit,
          excludingHit: result.excludingHit,
          redFlags,
          status: session.status,
          expiresAt: session.expiresAt,
        };
      }),
    );

    return sessions;
  }

  private async _matchSingleDisease(
    userId: number,
    diseaseId: string,
    userAnswers: Map<string, AnswerValue>,
    dto: MatchRequestDto,
  ) {
    const disease = await this.p.disease.findUnique({
      where: { id: diseaseId },
      select: {
        id: true,
        slug: true,
        icd10: true,
        diseaseSymptoms: {
          select: {
            weight: true,
            isRequired: true,
            isExcluding: true,
            symptom: {
              select: { code: true, isRedFlag: true, nameUz: true },
            },
          },
        },
      },
    });
    if (!disease) throw new NotFoundException('Kasallik topilmadi');

    type DsRow = {
      weight: number | { toNumber(): number };
      isRequired: boolean;
      isExcluding: boolean;
      symptom: { code: string; isRedFlag: boolean; nameUz: string };
    };

    const refs: DiseaseSymptomRef[] = disease.diseaseSymptoms.map((ds: DsRow) => ({
      code: ds.symptom.code,
      weight: typeof ds.weight === 'object' ? ds.weight.toNumber() : Number(ds.weight),
      isRequired: ds.isRequired,
      isExcluding: ds.isExcluding,
      isRedFlag: ds.symptom.isRedFlag,
    }));

    const result = scoreMatch(userAnswers, disease.id, refs);

    // Red-flag baholash — foydalanuvchi YES deb belgilagan markerlar orqali
    const positiveMarkers = [...userAnswers.entries()]
      .filter(([, v]) => v === 'YES')
      .map(([k]) => k);
    const redFlags: RedFlagRule[] = evaluateRedFlags(positiveMarkers);

    const expiresAt = new Date(Date.now() + 7 * 24 * 3600_000);

    const session = await this.p.symptomMatchSession.create({
      data: {
        userId,
        diseaseId: disease.id,
        matchScore: result.score,
        matchedSymptoms: result.matchedSymptoms,
        missingSymptoms: result.missingSymptoms,
        userAnswers: Object.fromEntries(userAnswers),
        status: 'ACTIVE',
        expiresAt,
      },
    });

    return {
      sessionId: session.id,
      diseaseId: result.diseaseId,
      score: result.score,
      matchedSymptoms: result.matchedSymptoms,
      missingSymptoms: result.missingSymptoms,
      redFlagHit: result.redFlagHit,
      excludingHit: result.excludingHit,
      redFlags,
      status: session.status,
      expiresAt: session.expiresAt,
    };
  }

  // ─── getSession ─────────────────────────────────────────────────────────────

  async getSession(
    caller: number | { sub: number; role: string },
    sessionId: string,
  ) {
    const callerId = typeof caller === 'number' ? caller : caller.sub;
    const callerRole = typeof caller === 'number' ? 'PATIENT' : caller.role;

    const session = await this.p.symptomMatchSession.findUnique({
      where: { id: sessionId },
      include: {
        disease: {
          select: { id: true, slug: true, icd10: true, nameUz: true },
        },
      },
    });
    if (!session) throw new NotFoundException('Sessiya topilmadi');

    const isOwner = session.userId === callerId;
    const isAssignedDoctor = session.sentToDoctorId === callerId;
    const isAdmin = callerRole === 'ADMIN';

    if (!isOwner && !isAssignedDoctor && !isAdmin) {
      throw new ForbiddenException('Ruxsat yo\'q');
    }
    return session;
  }

  // ─── listDoctorInbox ────────────────────────────────────────────────────────

  async listDoctorInbox(
    caller: { sub: number; role: string },
    query: ListInboxQueryDto,
  ) {
    if (!DOCTOR_ROLES.includes(caller.role as (typeof DOCTOR_ROLES)[number])) {
      throw new ForbiddenException('Faqat shifokorlar uchun');
    }

    // Resolve doctorId: "me" (default) → caller; numeric → must be ADMIN or self
    const rawDoctorId = query.doctorId ?? 'me';
    let targetDoctorId: number;
    if (rawDoctorId === 'me') {
      targetDoctorId = caller.sub;
    } else {
      const parsed = Number.parseInt(rawDoctorId, 10);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        throw new BadRequestException('doctorId noto\'g\'ri');
      }
      if (parsed !== caller.sub && caller.role !== 'ADMIN') {
        throw new ForbiddenException('Boshqa shifokor inbox\'ini ko\'rish uchun ADMIN kerak');
      }
      targetDoctorId = parsed;
    }

    const status = query.status ?? 'SENT_TO_DOCTOR';
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = { sentToDoctorId: targetDoctorId, status };

    const [total, rows] = await Promise.all([
      this.p.symptomMatchSession.count({ where }),
      this.p.symptomMatchSession.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          userId: true,
          matchScore: true,
          matchedSymptoms: true,
          missingSymptoms: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          expiresAt: true,
          disease: {
            select: { id: true, slug: true, icd10: true, nameUz: true, nameRu: true },
          },
          anonymousId: true,
          user: {
            select: { id: true, fullName: true },
          },
        },
      }),
    ]);

    type Row = {
      id: string;
      userId: number | null;
      matchScore: number | { toNumber(): number };
      matchedSymptoms: unknown;
      missingSymptoms: unknown;
      status: string;
      createdAt: Date;
      updatedAt: Date;
      expiresAt: Date | null;
      anonymousId: string | null;
      disease: { id: string; slug: string; icd10: string; nameUz: string; nameRu: string | null } | null;
      user: { id: number; fullName: string | null } | null;
    };

    const items = (rows as Row[]).map((r) => ({
      id: r.id,
      matchScore:
        typeof r.matchScore === 'object'
          ? (r.matchScore as { toNumber(): number }).toNumber()
          : Number(r.matchScore),
      status: r.status,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      expiresAt: r.expiresAt,
      disease: r.disease,
      patient: r.user
        ? { id: r.user.id, displayName: r.user.fullName ?? r.anonymousId ?? `#${r.user.id}` }
        : r.anonymousId
          ? { id: null, displayName: r.anonymousId }
          : null,
      matchedSymptomCount: Array.isArray(r.matchedSymptoms) ? r.matchedSymptoms.length : 0,
      missingSymptomCount: Array.isArray(r.missingSymptoms) ? r.missingSymptoms.length : 0,
    }));

    return { items, total, page, limit };
  }

  // ─── updateSession ───────────────────────────────────────────────────────────

  async updateSession(userId: number, sessionId: string, dto: UpdateSessionDto) {
    const session = await this.p.symptomMatchSession.findUnique({
      where: { id: sessionId },
    });
    if (!session) throw new NotFoundException('Sessiya topilmadi');
    if (session.userId !== userId) throw new ForbiddenException('Ruxsat yo\'q');

    // Build update payload — only include fields present in DTO
    const data: Record<string, unknown> = {};
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.userAnswers !== undefined) data.userAnswers = dto.userAnswers;

    return this.p.symptomMatchSession.update({
      where: { id: sessionId },
      data,
    });
  }

  // ─── sendToDoctor ────────────────────────────────────────────────────────────

  async sendToDoctor(userId: number, sessionId: string, dto: SendToDoctorDto) {
    const session = await this.p.symptomMatchSession.findUnique({
      where: { id: sessionId },
      include: {
        disease: {
          select: { id: true, slug: true, icd10: true, nameUz: true },
        },
      },
    });
    if (!session) throw new NotFoundException('Sessiya topilmadi');
    if (session.userId !== userId) throw new ForbiddenException('Ruxsat yo\'q');

    // Check doctor role
    const doctor = await this.prisma.user.findUnique({
      where: { id: dto.doctorId },
      select: { id: true, role: true, fullName: true },
    });
    if (!doctor) throw new NotFoundException('Shifokor topilmadi');
    const doctorRoles = ['DOCTOR', 'SPECIALIST', 'MEDICAL_EDITOR'];
    if (!doctorRoles.includes(doctor.role)) {
      throw new BadRequestException('Foydalanuvchi shifokor emas');
    }

    // Build FHIR payload
    type AnswerEntry = { code: string; nameUz?: string; answer: string };
    const rawAnswers = session.userAnswers as Record<string, string>;
    const dsSymptoms: Array<{ symptom: { code: string; nameUz: string } }> =
      (session.disease?.diseaseSymptoms as Array<{ symptom: { code: string; nameUz: string } }>) ?? [];

    const symptomAnswers: Array<{ code: string; nameUz: string; answer: string }> =
      Object.entries(rawAnswers).map(([code, answer]) => {
        const ds = dsSymptoms.find((d) => d.symptom.code === code);
        return { code, nameUz: ds?.symptom.nameUz ?? code, answer };
      });

    const matchedSymptoms: string[] = Array.isArray(session.matchedSymptoms)
      ? (session.matchedSymptoms as string[])
      : [];

    const fhir = buildQuestionnaireResponse({
      sessionId: session.id,
      userId: session.userId ?? null,
      diseaseSlug: session.disease?.slug ?? '',
      diseaseIcd10: session.disease?.icd10 ?? '',
      matchScore: typeof session.matchScore === 'object'
        ? (session.matchScore as { toNumber(): number }).toNumber()
        : Number(session.matchScore),
      matchedSymptoms,
      totalSymptoms: symptomAnswers.length,
      redFlagHit: false,
      excludingHit: false,
      symptomAnswers,
      authored: session.createdAt,
    });

    // $transaction: update session + send message + create notification
    await this.prisma.$transaction(async () => {
      await this.p.symptomMatchSession.update({
        where: { id: sessionId },
        data: { status: 'SENT_TO_DOCTOR', sentToDoctorId: dto.doctorId },
      });

      await this.messagesService.sendMessage(userId, {
        receiverId: dto.doctorId,
        content: JSON.stringify(fhir),
        messageType: 'TRIAGE_RESULT',
      });

      await this.notificationsService.create({
        userId: dto.doctorId,
        title: 'Yangi triage natijasi',
        message: `Bemor triage natijasini yubordi: ${session.disease?.nameUz ?? ''}`,
        type: 'TRIAGE',
      });
    });

    return { success: true, sessionId, doctorId: dto.doctorId };
  }

  // ─── saveNote ────────────────────────────────────────────────────────────────

  async saveNote(userId: number, sessionId: string, dto: SaveNoteDto) {
    const session = await this.p.symptomMatchSession.findUnique({
      where: { id: sessionId },
      select: { id: true, userId: true, diseaseId: true, userAnswers: true },
    });
    if (!session) throw new NotFoundException('Sessiya topilmadi');
    if (session.userId !== userId) throw new ForbiddenException('Ruxsat yo\'q');

    const diseaseId: string = session.diseaseId;

    // UserDiseaseNote has @@unique([userId, diseaseId]) — use upsert
    return this.p.userDiseaseNote.upsert({
      where: { userId_diseaseId: { userId, diseaseId } },
      update: {
        noteMd: dto.noteMd,
        symptomAnswers: session.userAnswers,
        updatedAt: new Date(),
      },
      create: {
        userId,
        diseaseId,
        noteMd: dto.noteMd,
        symptomAnswers: session.userAnswers,
      },
    });
  }
}
