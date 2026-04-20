import { Test, TestingModule } from '@nestjs/testing';
import { DiseasesController } from '../diseases.controller';
import { DiseasesService } from '../diseases.service';
import { JwtGuard } from '../../auth/jwt.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { FeatureFlagGuard } from '../../common/feature-flag.guard';

describe('DiseasesController', () => {
  let controller: DiseasesController;
  let service: jest.Mocked<DiseasesService>;

  beforeEach(async () => {
    process.env.APP_FEATURE_DISEASE_KB = 'true';
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [DiseasesController],
      providers: [
        {
          provide: DiseasesService,
          useValue: {
            findAll: jest.fn().mockResolvedValue({ items: [], total: 0, page: 1, limit: 20 }),
            findBySlug: jest.fn().mockResolvedValue({ id: 'd1' }),
            findSymptomsForSlug: jest.fn().mockResolvedValue([]),
            create: jest.fn().mockResolvedValue({ id: 'd1' }),
            update: jest.fn().mockResolvedValue({ id: 'd1' }),
            remove: jest.fn().mockResolvedValue({ id: 'd1', status: 'ARCHIVED' }),
            semanticSearch: jest.fn().mockResolvedValue([]),
            indexDiseaseEmbedding: jest.fn().mockResolvedValue({ ok: true }),
          },
        },
      ],
    })
      .overrideGuard(JwtGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(FeatureFlagGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = moduleRef.get(DiseasesController);
    service = moduleRef.get(DiseasesService) as unknown as jest.Mocked<DiseasesService>;
  });

  it('GET list service.findAll ni chaqiradi', async () => {
    const result = await controller.list({} as never, {} as never);
    expect(result.items).toEqual([]);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('POST yaratadi — caller id va rol o\'tkaziladi', async () => {
    await controller.create({ icd10: 'I10', nameUz: 'Foo', category: 'x' } as never, {
      user: { sub: 7, role: 'EDITOR' },
    });
    expect(service.create).toHaveBeenCalledWith(
      expect.any(Object),
      { id: 7, role: 'EDITOR' },
    );
  });

  it('PATCH update chaqiradi', async () => {
    await controller.update('d1', { nameUz: 'Yangi' } as never, { user: { sub: 1, role: 'ADMIN' } });
    expect(service.update).toHaveBeenCalledWith('d1', expect.any(Object), { id: 1, role: 'ADMIN' });
  });

  it('DELETE soft delete chaqiradi', async () => {
    await controller.remove('d1', { user: { sub: 1, role: 'ADMIN' } });
    expect(service.remove).toHaveBeenCalledWith('d1', { id: 1, role: 'ADMIN' });
  });

  it('GET semantic-search service.semanticSearch ni chaqiradi', async () => {
    const result = await controller.semanticSearch('gipertoniya', '5');
    expect(result).toEqual([]);
    expect(service.semanticSearch).toHaveBeenCalledWith('gipertoniya', 5);
  });

  it('GET semantic-search limit default 10 ishlatadi', async () => {
    await controller.semanticSearch('diabet');
    expect(service.semanticSearch).toHaveBeenCalledWith('diabet', 10);
  });

  it('POST :id/index-embedding service.indexDiseaseEmbedding ni chaqiradi', async () => {
    const result = await controller.indexEmbedding('d1');
    expect(result).toEqual({ ok: true });
    expect(service.indexDiseaseEmbedding).toHaveBeenCalledWith('d1');
  });
});
