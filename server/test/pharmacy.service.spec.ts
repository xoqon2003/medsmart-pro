import { Test, TestingModule } from '@nestjs/testing';
import { PharmacyService } from '../src/pharmacy/pharmacy.service';
import { PrismaService } from '../src/config/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockPrisma = {
  prescription: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  prescriptionItem: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  medicine: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
};

describe('PharmacyService', () => {
  let service: PharmacyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PharmacyService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<PharmacyService>(PharmacyService);
    jest.clearAllMocks();
  });

  describe('createPrescription', () => {
    it('yangi retsept yaratishi kerak', async () => {
      const data = {
        patientId: 1,
        doctorId: 2,
        diagnosis: 'ARVI',
        items: [{ medicineName: 'Paracetamol', dosage: '500mg', frequency: '3x kuniga', duration: '5 kun', quantity: 15 }],
      };

      mockPrisma.prescription.create.mockResolvedValue({
        id: 'rx-1',
        ...data,
        status: 'ACTIVE',
        items: data.items,
      });

      const result = await service.createPrescription(data);
      expect(result.id).toBe('rx-1');
      expect(mockPrisma.prescription.create).toHaveBeenCalled();
    });
  });

  describe('findPrescriptionById', () => {
    it('topilmagan retsept uchun xato qaytarishi kerak', async () => {
      mockPrisma.prescription.findUnique.mockResolvedValue(null);
      await expect(service.findPrescriptionById('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findMedicines', () => {
    it('dorilar ro\'yxatini qaytarishi kerak', async () => {
      mockPrisma.medicine.findMany.mockResolvedValue([
        { id: 'm-1', name: 'Paracetamol', category: 'PAINKILLER', price: 15000 },
      ]);
      mockPrisma.medicine.count.mockResolvedValue(1);

      const result = await service.findMedicines({ category: 'PAINKILLER' });
      expect(result.items.length).toBe(1);
      expect(result.total).toBe(1);
    });
  });

  describe('updateStock', () => {
    it('mavjud dori uchun zaxirani yangilashi kerak', async () => {
      mockPrisma.medicine.findUnique.mockResolvedValue({ id: 'm-1', name: 'Paracetamol' });
      mockPrisma.medicine.update.mockResolvedValue({ id: 'm-1', stockQuantity: 100, inStock: true });

      const result = await service.updateStock('m-1', 100);
      expect(result.stockQuantity).toBe(100);
      expect(result.inStock).toBe(true);
    });

    it('topilmagan dori uchun xato qaytarishi kerak', async () => {
      mockPrisma.medicine.findUnique.mockResolvedValue(null);
      await expect(service.updateStock('non-existent', 100)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getCategories', () => {
    it('kategoriyalar ro\'yxatini qaytarishi kerak', async () => {
      const categories = await service.getCategories();
      expect(categories.length).toBeGreaterThan(0);
      expect(categories.some(c => c.code === 'ANTIBIOTIC')).toBe(true);
    });
  });
});
