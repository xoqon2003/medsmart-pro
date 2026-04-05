import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { LabTestStatus } from '@prisma/client';

@Injectable()
export class LaboratoryService {
  constructor(private prisma: PrismaService) {}

  // ─── Buyurtma yaratish ───────────────────────────────────────────────────

  async createOrder(data: {
    patientId: number;
    doctorId?: number;
    applicationId?: number;
    notes?: string;
    tests: { testCode: string; testName: string; category: string; price: number; normalRange?: string; unit?: string }[];
  }) {
    const totalPrice = data.tests.reduce((sum, t) => sum + t.price, 0);

    return this.prisma.labOrder.create({
      data: {
        patientId: data.patientId,
        doctorId: data.doctorId,
        applicationId: data.applicationId,
        notes: data.notes,
        totalPrice,
        tests: {
          create: data.tests.map(t => ({
            testCode: t.testCode,
            testName: t.testName,
            category: t.category,
            price: t.price,
            normalRange: t.normalRange,
            unit: t.unit,
          })),
        },
      },
      include: { tests: true, patient: { select: { id: true, fullName: true, phone: true } } },
    });
  }

  // ─── Buyurtmalar ro'yxati ───────────────────────────────────────────────

  async findOrders(filters?: { patientId?: number; status?: LabTestStatus; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const where: any = {};

    if (filters?.patientId) where.patientId = filters.patientId;
    if (filters?.status) where.status = filters.status;

    const [items, total] = await Promise.all([
      this.prisma.labOrder.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          tests: true,
          patient: { select: { id: true, fullName: true, phone: true } },
          doctor: { select: { id: true, fullName: true, specialty: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.labOrder.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  // ─── Bitta buyurtma ─────────────────────────────────────────────────────

  async findOrderById(id: string) {
    const order = await this.prisma.labOrder.findUnique({
      where: { id },
      include: {
        tests: true,
        patient: { select: { id: true, fullName: true, phone: true, birthDate: true, gender: true } },
        doctor: { select: { id: true, fullName: true, specialty: true } },
      },
    });
    if (!order) throw new NotFoundException('Laboratoriya buyurtmasi topilmadi');
    return order;
  }

  // ─── Namuna olish ───────────────────────────────────────────────────────

  async collectSample(orderId: string) {
    const order = await this.findOrderById(orderId);
    if (order.status !== 'PENDING') {
      throw new BadRequestException('Namuna faqat kutilayotgan buyurtmadan olinishi mumkin');
    }

    return this.prisma.labOrder.update({
      where: { id: orderId },
      data: {
        status: LabTestStatus.SAMPLE_COLLECTED,
        sampleDate: new Date(),
        tests: { updateMany: { where: {}, data: { status: LabTestStatus.SAMPLE_COLLECTED } } },
      },
      include: { tests: true },
    });
  }

  // ─── Tahlilni boshlash ──────────────────────────────────────────────────

  async startProcessing(orderId: string) {
    return this.prisma.labOrder.update({
      where: { id: orderId },
      data: {
        status: LabTestStatus.IN_PROGRESS,
        tests: { updateMany: { where: {}, data: { status: LabTestStatus.IN_PROGRESS } } },
      },
      include: { tests: true },
    });
  }

  // ─── Test natijasini kiritish ───────────────────────────────────────────

  async updateTestResult(testId: string, data: { result?: any; resultText?: string }) {
    const test = await this.prisma.labTest.findUnique({ where: { id: testId } });
    if (!test) throw new NotFoundException('Test topilmadi');

    const updated = await this.prisma.labTest.update({
      where: { id: testId },
      data: {
        result: data.result,
        resultText: data.resultText,
        status: LabTestStatus.COMPLETED,
        completedAt: new Date(),
      },
    });

    // Barcha testlar tugagan bo'lsa, orderni COMPLETED qilish
    const order = await this.prisma.labOrder.findUnique({
      where: { id: test.orderId },
      include: { tests: true },
    });

    if (order) {
      const allCompleted = order.tests.every(t => t.id === testId || t.status === 'COMPLETED');
      if (allCompleted) {
        await this.prisma.labOrder.update({
          where: { id: order.id },
          data: { status: LabTestStatus.COMPLETED, completedAt: new Date() },
        });
      }
    }

    return updated;
  }

  // ─── Buyurtmani bekor qilish ────────────────────────────────────────────

  async cancelOrder(orderId: string) {
    return this.prisma.labOrder.update({
      where: { id: orderId },
      data: {
        status: LabTestStatus.CANCELLED,
        tests: { updateMany: { where: {}, data: { status: LabTestStatus.CANCELLED } } },
      },
      include: { tests: true },
    });
  }

  // ─── Test kategoriyalari ────────────────────────────────────────────────

  async getCategories() {
    return [
      { code: 'BLOOD', name: 'Qon tahlili' },
      { code: 'URINE', name: 'Siydik tahlili' },
      { code: 'HORMONE', name: 'Gormon tahlili' },
      { code: 'BIOCHEMISTRY', name: 'Biokimyoviy tahlil' },
      { code: 'IMMUNOLOGY', name: 'Immunologik tahlil' },
      { code: 'MICROBIOLOGY', name: 'Mikrobiologik tahlil' },
      { code: 'COAGULATION', name: 'Koagulyatsiya' },
      { code: 'GENETICS', name: 'Genetik tahlil' },
    ];
  }
}
