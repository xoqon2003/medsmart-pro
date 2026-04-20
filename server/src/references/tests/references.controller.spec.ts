import { Test, TestingModule } from '@nestjs/testing';
import { ReferencesController } from '../references.controller';
import { ReferencesService } from '../references.service';
import { JwtGuard } from '../../auth/jwt.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { FeatureFlagGuard } from '../../common/feature-flag.guard';

describe('ReferencesController', () => {
  let controller: ReferencesController;
  let service: jest.Mocked<ReferencesService>;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [ReferencesController],
      providers: [
        {
          provide: ReferencesService,
          useValue: {
            findAll: jest.fn().mockResolvedValue({ items: [], total: 0, page: 1, limit: 20 }),
            findOne: jest.fn().mockResolvedValue({ id: 'r1' }),
            create: jest.fn().mockResolvedValue({ id: 'r1' }),
            update: jest.fn().mockResolvedValue({ id: 'r1' }),
            remove: jest.fn().mockResolvedValue({ id: 'r1' }),
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

    controller = moduleRef.get(ReferencesController);
    service = moduleRef.get(ReferencesService) as unknown as jest.Mocked<ReferencesService>;
  });

  it('list', async () => {
    await controller.list({} as never);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('create passes caller', async () => {
    await controller.create({ type: 'URL', citation: 'foo' } as never, {
      user: { sub: 5, role: 'EDITOR' },
    });
    expect(service.create).toHaveBeenCalledWith(expect.any(Object), { id: 5, role: 'EDITOR' });
  });

  it('remove passes caller', async () => {
    await controller.remove('r1', { user: { sub: 5, role: 'EDITOR' } });
    expect(service.remove).toHaveBeenCalledWith('r1', { id: 5, role: 'EDITOR' });
  });
});
