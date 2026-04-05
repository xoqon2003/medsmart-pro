import { Test, TestingModule } from '@nestjs/testing';
import { LaboratoryService } from '../src/laboratory/laboratory.service';
import { PrismaService } from '../src/config/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockPrisma = {
  labOrder: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  labTest: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  bookingSlot: {
    deleteMany: jest.fn(),
  },
};

describe('LaboratoryService', () => {
  let service: LaboratoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LaboratoryService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<LaboratoryService>(LaboratoryService);
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('yangi buyurtma yaratishi kerak', async () => {
      const orderData = {
        patientId: 1,
        tests: [
          { testCode: 'CBC', testName: 'Umumiy qon tahlili', category: 'BLOOD', price: 50000 },
        ],
      };

      mockPrisma.labOrder.create.mockResolvedValue({
        id: 'uuid-1',
        ...orderData,
        totalPrice: 50000,
        status: 'PENDING',
      });

      const result = await service.createOrder(orderData);
      expect(result.totalPrice).toBe(50000);
      expect(mockPrisma.labOrder.create).toHaveBeenCalled();
    });
  });

  describe('findOrderById', () => {
    it('mavjud buyurtmani qaytarishi kerak', async () => {
      mockPrisma.labOrder.findUnique.mockResolvedValue({
        id: 'uuid-1',
        status: 'PENDING',
        tests: [],
      });

      const result = await service.findOrderById('uuid-1');
      expect(result.id).toBe('uuid-1');
    });

    it('topilmagan buyurtma uchun xato qaytarishi kerak', async () => {
      mockPrisma.labOrder.findUnique.mockResolvedValue(null);
      await expect(service.findOrderById('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getCategories', () => {
    it('kategoriyalar ro\'yxatini qaytarishi kerak', async () => {
      const categories = await service.getCategories();
      expect(categories.length).toBeGreaterThan(0);
      expect(categories[0]).toHaveProperty('code');
      expect(categories[0]).toHaveProperty('name');
    });
  });
});
