import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { TriageService } from '../triage.service';

// ─── Minimal Prisma mock ──────────────────────────────────────────────────────

const mockSymptomMatchSession = {
  create: jest.fn(),
  findUnique: jest.fn(),
  update: jest.fn(),
  findMany: jest.fn(),
  count: jest.fn(),
};

const mockUserDiseaseNote = {
  upsert: jest.fn(),
};

const mockDisease = {
  findMany: jest.fn(),
  findUnique: jest.fn(),
};

const mockUser = {
  findUnique: jest.fn(),
};

const mockPrisma = {
  symptomMatchSession: mockSymptomMatchSession,
  userDiseaseNote: mockUserDiseaseNote,
  disease: mockDisease,
  user: mockUser,
  $transaction: jest.fn(async (cb: (tx: unknown) => Promise<unknown>) => cb(mockPrisma)),
};

const mockMessagesService = {
  sendMessage: jest.fn().mockResolvedValue({ id: 'msg-1' }),
};

const mockNotificationsService = {
  create: jest.fn().mockResolvedValue({ id: 1 }),
};

function buildService(): TriageService {
  const svc = new TriageService(
    mockPrisma as never,
    mockMessagesService as never,
    mockNotificationsService as never,
  );
  return svc;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('TriageService', () => {
  it('1. match() calls p.disease.findMany when no diseaseId given', async () => {
    mockDisease.findMany.mockResolvedValue([]);
    const svc = buildService();
    const result = await svc.match(1, { userSymptoms: [] });
    expect(mockDisease.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { status: 'PUBLISHED' } }),
    );
    expect(result).toEqual([]);
  });

  it('2. sendToDoctor: doctor role invalid → BadRequestException', async () => {
    const session = {
      id: 'sess-1',
      userId: 1,
      diseaseId: 'dis-1',
      matchScore: 0.5,
      matchedSymptoms: [],
      missingSymptoms: [],
      userAnswers: {},
      status: 'ACTIVE',
      createdAt: new Date(),
      disease: { slug: 'flu', icd10: 'J11', nameUz: 'Gripp', diseaseSymptoms: [] },
    };
    mockSymptomMatchSession.findUnique.mockResolvedValue(session);
    mockUser.findUnique.mockResolvedValue({ id: 42, role: 'PATIENT', fullName: 'John' });

    const svc = buildService();
    await expect(
      svc.sendToDoctor(1, 'sess-1', { doctorId: 42 }),
    ).rejects.toThrow(BadRequestException);
  });

  it('3. updateSession wrong owner → ForbiddenException', async () => {
    mockSymptomMatchSession.findUnique.mockResolvedValue({
      id: 'sess-1',
      userId: 99, // different user
      status: 'ACTIVE',
    });
    const svc = buildService();
    await expect(
      svc.updateSession(1, 'sess-1', { status: 'ARCHIVED' }),
    ).rejects.toThrow(ForbiddenException);
  });

  // ─── listDoctorInbox ──────────────────────────────────────────────────────

  it('5. listDoctorInbox: PATIENT role → ForbiddenException', async () => {
    const svc = buildService();
    await expect(
      svc.listDoctorInbox({ sub: 1, role: 'PATIENT' }, {}),
    ).rejects.toThrow(ForbiddenException);
  });

  it('6. listDoctorInbox: doctorId=me resolves to caller sub', async () => {
    mockSymptomMatchSession.findMany.mockResolvedValue([]);
    mockSymptomMatchSession.count.mockResolvedValue(0);
    const svc = buildService();
    const res = await svc.listDoctorInbox({ sub: 42, role: 'DOCTOR' }, {});
    expect(mockSymptomMatchSession.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { sentToDoctorId: 42, status: 'SENT_TO_DOCTOR' },
        orderBy: { updatedAt: 'desc' },
      }),
    );
    expect(res).toEqual({ items: [], total: 0, page: 1, limit: 20 });
  });

  it('7. listDoctorInbox: non-ADMIN requesting another doctor → ForbiddenException', async () => {
    const svc = buildService();
    await expect(
      svc.listDoctorInbox({ sub: 42, role: 'DOCTOR' }, { doctorId: '99' }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('8. listDoctorInbox: ADMIN may query any doctor id', async () => {
    mockSymptomMatchSession.findMany.mockResolvedValue([]);
    mockSymptomMatchSession.count.mockResolvedValue(0);
    const svc = buildService();
    await svc.listDoctorInbox({ sub: 1, role: 'ADMIN' }, { doctorId: '99' });
    expect(mockSymptomMatchSession.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { sentToDoctorId: 99, status: 'SENT_TO_DOCTOR' } }),
    );
  });

  it('9. listDoctorInbox: pagination page=2 limit=5 skips 5', async () => {
    mockSymptomMatchSession.findMany.mockResolvedValue([]);
    mockSymptomMatchSession.count.mockResolvedValue(12);
    const svc = buildService();
    const res = await svc.listDoctorInbox(
      { sub: 42, role: 'DOCTOR' },
      { page: 2, limit: 5 },
    );
    expect(mockSymptomMatchSession.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 5, take: 5 }),
    );
    expect(res).toEqual({ items: [], total: 12, page: 2, limit: 5 });
  });

  it('10. listDoctorInbox: maps matchScore Decimal → number and counts symptoms', async () => {
    mockSymptomMatchSession.findMany.mockResolvedValue([
      {
        id: 's1',
        userId: 7,
        matchScore: { toNumber: () => 0.83 },
        matchedSymptoms: ['a', 'b', 'c'],
        missingSymptoms: ['x'],
        status: 'SENT_TO_DOCTOR',
        createdAt: new Date('2026-04-20T09:00Z'),
        updatedAt: new Date('2026-04-20T10:00Z'),
        expiresAt: new Date('2026-04-27T09:00Z'),
        anonymousId: null,
        disease: { id: 'd1', slug: 'flu', icd10: 'J11', nameUz: 'Gripp', nameRu: null },
        user: { id: 7, fullName: 'Ali Valiyev' },
      },
    ]);
    mockSymptomMatchSession.count.mockResolvedValue(1);

    const svc = buildService();
    const res = await svc.listDoctorInbox({ sub: 42, role: 'DOCTOR' }, {});

    expect(res.items).toHaveLength(1);
    expect(res.items[0]).toMatchObject({
      id: 's1',
      matchScore: 0.83,
      matchedSymptomCount: 3,
      missingSymptomCount: 1,
      patient: { id: 7, displayName: 'Ali Valiyev' },
    });
  });

  it('11. listDoctorInbox: invalid doctorId string → BadRequestException', async () => {
    const svc = buildService();
    await expect(
      svc.listDoctorInbox({ sub: 1, role: 'DOCTOR' }, { doctorId: 'abc' }),
    ).rejects.toThrow(BadRequestException);
  });

  // ─── getSession doctor access ─────────────────────────────────────────────

  it('12. getSession: assigned doctor may read', async () => {
    const session = {
      id: 'sess-1',
      userId: 7,
      sentToDoctorId: 42,
      status: 'SENT_TO_DOCTOR',
      disease: { id: 'd1', slug: 'flu', icd10: 'J11', nameUz: 'Gripp' },
    };
    mockSymptomMatchSession.findUnique.mockResolvedValue(session);
    const svc = buildService();
    const res = await svc.getSession({ sub: 42, role: 'DOCTOR' }, 'sess-1');
    expect(res).toEqual(session);
  });

  it('13. getSession: other doctor → ForbiddenException', async () => {
    mockSymptomMatchSession.findUnique.mockResolvedValue({
      id: 'sess-1',
      userId: 7,
      sentToDoctorId: 42,
      status: 'SENT_TO_DOCTOR',
    });
    const svc = buildService();
    await expect(
      svc.getSession({ sub: 999, role: 'DOCTOR' }, 'sess-1'),
    ).rejects.toThrow(ForbiddenException);
  });

  it('4. saveNote calls userDiseaseNote.upsert', async () => {
    mockSymptomMatchSession.findUnique.mockResolvedValue({
      id: 'sess-1',
      userId: 1,
      diseaseId: 'dis-1',
      userAnswers: { FEVER: 'YES' },
    });
    mockUserDiseaseNote.upsert.mockResolvedValue({ id: 'note-1' });

    const svc = buildService();
    await svc.saveNote(1, 'sess-1', { noteMd: 'Test note' });

    expect(mockUserDiseaseNote.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId_diseaseId: { userId: 1, diseaseId: 'dis-1' } },
      }),
    );
  });
});
