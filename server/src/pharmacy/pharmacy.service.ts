import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';

@Injectable()
export class PharmacyService {
  constructor(private prisma: PrismaService) {}

  // ─── Retsept yaratish ───────────────────────────────────────────────────

  async createPrescription(data: {
    patientId: number;
    doctorId: number;
    applicationId?: number;
    diagnosis?: string;
    notes?: string;
    validUntil?: string;
    items: { medicineName: string; medicineId?: string; dosage: string; frequency: string; duration: string; quantity: number; instructions?: string }[];
  }) {
    return this.prisma.prescription.create({
      data: {
        patientId: data.patientId,
        doctorId: data.doctorId,
        applicationId: data.applicationId,
        diagnosis: data.diagnosis,
        notes: data.notes,
        validUntil: data.validUntil ? new Date(data.validUntil) : undefined,
        items: {
          create: data.items.map(item => ({
            medicineName: item.medicineName,
            medicineId: item.medicineId,
            dosage: item.dosage,
            frequency: item.frequency,
            duration: item.duration,
            quantity: item.quantity,
            instructions: item.instructions,
          })),
        },
      },
      include: {
        items: { include: { medicine: true } },
        patient: { select: { id: true, fullName: true, phone: true } },
        doctor: { select: { id: true, fullName: true, specialty: true } },
      },
    });
  }

  // ─── Retseptlar ro'yxati ────────────────────────────────────────────────

  async findPrescriptions(filters?: { patientId?: number; doctorId?: number; status?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const where: any = {};

    if (filters?.patientId) where.patientId = filters.patientId;
    if (filters?.doctorId) where.doctorId = filters.doctorId;
    if (filters?.status) where.status = filters.status;

    const [items, total] = await Promise.all([
      this.prisma.prescription.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          items: { include: { medicine: true } },
          patient: { select: { id: true, fullName: true } },
          doctor: { select: { id: true, fullName: true, specialty: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.prescription.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  // ─── Bitta retsept ──────────────────────────────────────────────────────

  async findPrescriptionById(id: string) {
    const rx = await this.prisma.prescription.findUnique({
      where: { id },
      include: {
        items: { include: { medicine: true } },
        patient: { select: { id: true, fullName: true, phone: true, birthDate: true } },
        doctor: { select: { id: true, fullName: true, specialty: true } },
      },
    });
    if (!rx) throw new NotFoundException('Retsept topilmadi');
    return rx;
  }

  // ─── Retseptni to'ldirish (dorixonadan berilganda) ──────────────────────

  async fillPrescriptionItem(itemId: string) {
    const item = await this.prisma.prescriptionItem.findUnique({ where: { id: itemId } });
    if (!item) throw new NotFoundException('Retsept bandi topilmadi');

    await this.prisma.prescriptionItem.update({
      where: { id: itemId },
      data: { isFilled: true },
    });

    // Barcha itemlar filled bo'lsa, statusni FILLED qilish
    const rx = await this.prisma.prescription.findUnique({
      where: { id: item.prescriptionId },
      include: { items: true },
    });

    if (rx) {
      const allFilled = rx.items.every(i => i.id === itemId || i.isFilled);
      const anyFilled = rx.items.some(i => i.isFilled) || true;

      await this.prisma.prescription.update({
        where: { id: rx.id },
        data: { status: allFilled ? 'FILLED' : 'PARTIALLY_FILLED' },
      });
    }

    return { message: "Dori berildi" };
  }

  // ─── Dorilar katalogi ───────────────────────────────────────────────────

  async findMedicines(filters?: { category?: string; query?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const where: any = { isActive: true };

    if (filters?.category) where.category = filters.category;
    if (filters?.query) {
      where.OR = [
        { name: { contains: filters.query, mode: 'insensitive' } },
        { genericName: { contains: filters.query, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.medicine.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.medicine.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  // ─── Dori qo'shish ─────────────────────────────────────────────────────

  async createMedicine(data: {
    name: string;
    nameRu?: string;
    genericName?: string;
    manufacturer?: string;
    category: string;
    form: string;
    dosage?: string;
    price: number;
    requiresRx?: boolean;
    description?: string;
  }) {
    return this.prisma.medicine.create({ data });
  }

  // ─── Dori tahrirlash ───────────────────────────────────────────────────

  async updateMedicine(id: string, data: any) {
    const medicine = await this.prisma.medicine.findUnique({ where: { id } });
    if (!medicine) throw new NotFoundException('Dori topilmadi');
    return this.prisma.medicine.update({ where: { id }, data });
  }

  // ─── Zaxira yangilash ──────────────────────────────────────────────────

  async updateStock(id: string, quantity: number) {
    const medicine = await this.prisma.medicine.findUnique({ where: { id } });
    if (!medicine) throw new NotFoundException('Dori topilmadi');

    return this.prisma.medicine.update({
      where: { id },
      data: {
        stockQuantity: quantity,
        inStock: quantity > 0,
      },
    });
  }

  // ─── Dori kategoriyalari ────────────────────────────────────────────────

  async getCategories() {
    return [
      { code: 'ANTIBIOTIC', name: 'Antibiotiklar' },
      { code: 'PAINKILLER', name: "Og'riq qoldiruvchi" },
      { code: 'VITAMIN', name: 'Vitaminlar' },
      { code: 'ANTIVIRAL', name: 'Antiviral' },
      { code: 'CARDIOVASCULAR', name: 'Yurak-qon tomir' },
      { code: 'GASTROINTESTINAL', name: 'Oshqozon-ichak' },
      { code: 'NEUROLOGICAL', name: 'Nevrologik' },
      { code: 'HORMONAL', name: 'Gormonlar' },
      { code: 'DERMATOLOGICAL', name: 'Dermatologik' },
      { code: 'OTHER', name: 'Boshqa' },
    ];
  }
}
