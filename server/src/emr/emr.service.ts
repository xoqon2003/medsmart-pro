import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';

@Injectable()
export class EmrService {
  constructor(private prisma: PrismaService) {}

  // ─── Kasallik tarixi yozuvi yaratish ────────────────────────────────────

  async createRecord(data: {
    patientId: number;
    doctorId: number;
    applicationId?: number;
    recordType: string;
    icdCode?: string;
    diagnosis?: string;
    symptoms?: string[];
    findings?: string;
    treatment?: string;
    notes?: string;
    vitals?: any;
    attachments?: string[];
    isConfidential?: boolean;
  }) {
    return this.prisma.medicalRecord.create({
      data: {
        patientId: data.patientId,
        doctorId: data.doctorId,
        applicationId: data.applicationId,
        recordType: data.recordType,
        icdCode: data.icdCode,
        diagnosis: data.diagnosis,
        symptoms: data.symptoms || [],
        findings: data.findings,
        treatment: data.treatment,
        notes: data.notes,
        vitals: data.vitals,
        attachments: data.attachments || [],
        isConfidential: data.isConfidential || false,
      },
      include: {
        patient: { select: { id: true, fullName: true, phone: true, birthDate: true, gender: true } },
        doctor: { select: { id: true, fullName: true, specialty: true } },
      },
    });
  }

  // ─── Bemor kasallik tarixi ──────────────────────────────────────────────

  async getPatientHistory(patientId: number, filters?: { recordType?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const where: any = { patientId };

    if (filters?.recordType) where.recordType = filters.recordType;

    const [items, total] = await Promise.all([
      this.prisma.medicalRecord.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          doctor: { select: { id: true, fullName: true, specialty: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.medicalRecord.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  // ─── Bitta yozuv ────────────────────────────────────────────────────────

  async findRecordById(id: string) {
    const record = await this.prisma.medicalRecord.findUnique({
      where: { id },
      include: {
        patient: { select: { id: true, fullName: true, phone: true, birthDate: true, gender: true, chronicDiseases: true } },
        doctor: { select: { id: true, fullName: true, specialty: true } },
      },
    });
    if (!record) throw new NotFoundException('Kasallik tarixi yozuvi topilmadi');
    return record;
  }

  // ─── Yozuvni tahrirlash ─────────────────────────────────────────────────

  async updateRecord(id: string, data: any) {
    const record = await this.prisma.medicalRecord.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Yozuv topilmadi');

    return this.prisma.medicalRecord.update({
      where: { id },
      data,
      include: {
        patient: { select: { id: true, fullName: true } },
        doctor: { select: { id: true, fullName: true, specialty: true } },
      },
    });
  }

  // ─── Allergiyalar ───────────────────────────────────────────────────────

  async getPatientAllergies(patientId: number) {
    return this.prisma.allergy.findMany({
      where: { patientId },
      orderBy: { reportedAt: 'desc' },
    });
  }

  async addAllergy(data: {
    patientId: number;
    allergen: string;
    severity: string;
    reaction?: string;
    notes?: string;
  }) {
    return this.prisma.allergy.create({ data });
  }

  async removeAllergy(id: string) {
    const allergy = await this.prisma.allergy.findUnique({ where: { id } });
    if (!allergy) throw new NotFoundException('Allergiya yozuvi topilmadi');
    await this.prisma.allergy.delete({ where: { id } });
    return { message: "Allergiya o'chirildi" };
  }

  // ─── Bemor to'liq sog'liq kartasi ──────────────────────────────────────

  async getPatientSummary(patientId: number) {
    const [patient, records, allergies, labOrders, prescriptions] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: patientId },
        select: { id: true, fullName: true, phone: true, birthDate: true, gender: true, chronicDiseases: true },
      }),
      this.prisma.medicalRecord.findMany({
        where: { patientId },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { doctor: { select: { fullName: true, specialty: true } } },
      }),
      this.prisma.allergy.findMany({ where: { patientId } }),
      this.prisma.labOrder.findMany({
        where: { patientId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { tests: true },
      }),
      this.prisma.prescription.findMany({
        where: { patientId, status: 'ACTIVE' },
        include: { items: true, doctor: { select: { fullName: true } } },
      }),
    ]);

    if (!patient) throw new NotFoundException('Bemor topilmadi');

    return {
      patient,
      allergies,
      recentRecords: records,
      recentLabOrders: labOrders,
      activePrescriptions: prescriptions,
    };
  }

  // ─── ICD-10 kodlari (asosiy) ───────────────────────────────────────────

  async searchIcdCodes(query: string) {
    const codes = [
      { code: 'J06.9', name: "O'tkir yuqori nafas yo'llari infektsiyasi" },
      { code: 'J18.9', name: 'Pnevmoniya' },
      { code: 'I10', name: 'Gipertenziya (yuqori qon bosimi)' },
      { code: 'E11', name: 'Tip 2 qandli diabet' },
      { code: 'K29.7', name: 'Gastrit' },
      { code: 'M54.5', name: "Bel og'rig'i" },
      { code: 'N39.0', name: "Siydik yo'llari infektsiyasi" },
      { code: 'J45', name: 'Bronxial astma' },
      { code: 'K80', name: "O't tosh kasalligi" },
      { code: 'I25.1', name: 'Aterosklerotik yurak kasalligi' },
      { code: 'G43', name: 'Migren' },
      { code: 'L30.9', name: 'Dermatit' },
      { code: 'B34.9', name: 'Virus infektsiyasi' },
      { code: 'R50.9', name: 'Isitma' },
      { code: 'R10.4', name: "Qorin og'rig'i" },
    ];

    const q = query.toLowerCase();
    return codes.filter(c => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q));
  }
}
