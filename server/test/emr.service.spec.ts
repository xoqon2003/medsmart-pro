import { Test, TestingModule } from '@nestjs/testing';
import { EmrService } from '../src/emr/emr.service';
import { PrismaService } from '../src/config/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockPrisma = {
  medicalRecord: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  allergy: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
  labOrder: {
    findMany: jest.fn(),
  },
  prescription: {
    findMany: jest.fn(),
  },
};

describe('EmrService', () => {
  let service: EmrService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmrService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<EmrService>(EmrService);
    jest.clearAllMocks();
  });

  describe('createRecord', () => {
    it('yangi kasallik tarixi yozuvi yaratishi kerak', async () => {
      const data = {
        patientId: 1,
        doctorId: 2,
        recordType: 'CONSULTATION',
        diagnosis: 'ARVI',
        symptoms: ['isitma', "yo'tal"],
        vitals: { temperature: 38.5, bloodPressure: '120/80' },
      };

      mockPrisma.medicalRecord.create.mockResolvedValue({ id: 'rec-1', ...data });

      const result = await service.createRecord(data);
      expect(result.id).toBe('rec-1');
      expect(result.recordType).toBe('CONSULTATION');
    });
  });

  describe('getPatientHistory', () => {
    it('bemor tarixini qaytarishi kerak', async () => {
      mockPrisma.medicalRecord.findMany.mockResolvedValue([
        { id: 'rec-1', recordType: 'CONSULTATION', diagnosis: 'ARVI' },
      ]);
      mockPrisma.medicalRecord.count.mockResolvedValue(1);

      const result = await service.getPatientHistory(1);
      expect(result.items.length).toBe(1);
      expect(result.total).toBe(1);
    });
  });

  describe('findRecordById', () => {
    it('topilmagan yozuv uchun xato qaytarishi kerak', async () => {
      mockPrisma.medicalRecord.findUnique.mockResolvedValue(null);
      await expect(service.findRecordById('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('allergies', () => {
    it('allergiya qo\'shishi kerak', async () => {
      mockPrisma.allergy.create.mockResolvedValue({
        id: 'allergy-1',
        patientId: 1,
        allergen: 'Penisilin',
        severity: 'SEVERE',
      });

      const result = await service.addAllergy({
        patientId: 1,
        allergen: 'Penisilin',
        severity: 'SEVERE',
      });
      expect(result.allergen).toBe('Penisilin');
    });

    it('topilmagan allergiyani o\'chirish xato qaytarishi kerak', async () => {
      mockPrisma.allergy.findUnique.mockResolvedValue(null);
      await expect(service.removeAllergy('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getPatientSummary', () => {
    it('bemor kartasini qaytarishi kerak', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1, fullName: 'Test Bemor' });
      mockPrisma.medicalRecord.findMany.mockResolvedValue([]);
      mockPrisma.allergy.findMany.mockResolvedValue([]);
      mockPrisma.labOrder.findMany.mockResolvedValue([]);
      mockPrisma.prescription.findMany.mockResolvedValue([]);

      const result = await service.getPatientSummary(1);
      expect(result.patient.fullName).toBe('Test Bemor');
      expect(result).toHaveProperty('allergies');
      expect(result).toHaveProperty('recentRecords');
      expect(result).toHaveProperty('activePrescriptions');
    });

    it('topilmagan bemor uchun xato qaytarishi kerak', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.medicalRecord.findMany.mockResolvedValue([]);
      mockPrisma.allergy.findMany.mockResolvedValue([]);
      mockPrisma.labOrder.findMany.mockResolvedValue([]);
      mockPrisma.prescription.findMany.mockResolvedValue([]);

      await expect(service.getPatientSummary(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('searchIcdCodes', () => {
    it('ICD kodlarini qidirishi kerak', async () => {
      const results = await service.searchIcdCodes('gipert');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].code).toBe('I10');
    });

    it('bo\'sh natija qaytarishi kerak', async () => {
      const results = await service.searchIcdCodes('nonexistent12345');
      expect(results.length).toBe(0);
    });
  });
});
