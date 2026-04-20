import { Test, TestingModule } from '@nestjs/testing';
import { DiseaseBlocksController } from '../disease-blocks.controller';
import { MarkersController } from '../markers.controller';
import { DiseaseBlocksService } from '../disease-blocks.service';
import { JwtGuard } from '../../auth/jwt.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { FeatureFlagGuard } from '../../common/feature-flag.guard';
import { CANONICAL_MARKERS } from '../../diseases/markers/markers';

describe('DiseaseBlocksController', () => {
  let controller: DiseaseBlocksController;
  let markers: MarkersController;
  let service: jest.Mocked<DiseaseBlocksService>;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [DiseaseBlocksController, MarkersController],
      providers: [
        {
          provide: DiseaseBlocksService,
          useValue: {
            listForDisease: jest.fn().mockResolvedValue([]),
            findByMarker: jest.fn().mockResolvedValue({ id: 'b1' }),
            create: jest.fn().mockResolvedValue({ id: 'b1' }),
            update: jest.fn().mockResolvedValue({ id: 'b1' }),
            remove: jest.fn().mockResolvedValue({ id: 'b1' }),
            attachReference: jest.fn().mockResolvedValue({ id: 'dr1' }),
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

    controller = moduleRef.get(DiseaseBlocksController);
    markers = moduleRef.get(MarkersController);
    service = moduleRef.get(DiseaseBlocksService) as unknown as jest.Mocked<DiseaseBlocksService>;
  });

  it('list', async () => {
    await controller.list('slug', {} as never, {} as never);
    expect(service.listForDisease).toHaveBeenCalledWith('slug', expect.any(Object), null);
  });

  it('create passes caller', async () => {
    await controller.create('slug', { marker: 'etiology', label: 'E', contentMd: 'x' } as never, {
      user: { sub: 3, role: 'EDITOR' },
    });
    expect(service.create).toHaveBeenCalledWith('slug', expect.any(Object), {
      id: 3,
      role: 'EDITOR',
    });
  });

  it('markers controller canonical ro\'yxatini qaytaradi', () => {
    const res = markers.list();
    expect(res.items).toEqual([...CANONICAL_MARKERS]);
  });
});
