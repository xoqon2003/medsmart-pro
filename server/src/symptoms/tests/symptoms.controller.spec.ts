import { Test, TestingModule } from '@nestjs/testing';
import { SymptomsController } from '../symptoms.controller';
import { SymptomsService } from '../symptoms.service';
import { JwtGuard } from '../../auth/jwt.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { FeatureFlagGuard } from '../../common/feature-flag.guard';

describe('SymptomsController', () => {
  let controller: SymptomsController;
  let service: jest.Mocked<SymptomsService>;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [SymptomsController],
      providers: [
        {
          provide: SymptomsService,
          useValue: {
            findAll: jest.fn().mockResolvedValue({ items: [], total: 0, page: 1, limit: 20 }),
            findOne: jest.fn().mockResolvedValue({ id: 's1' }),
            create: jest.fn().mockResolvedValue({ id: 's1' }),
            update: jest.fn().mockResolvedValue({ id: 's1' }),
            remove: jest.fn().mockResolvedValue({ id: 's1' }),
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

    controller = moduleRef.get(SymptomsController);
    service = moduleRef.get(SymptomsService) as unknown as jest.Mocked<SymptomsService>;
  });

  it('list → service.findAll', async () => {
    await controller.list({} as never);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('one → service.findOne', async () => {
    await controller.one('s1');
    expect(service.findOne).toHaveBeenCalledWith('s1');
  });

  it('create passes caller', async () => {
    await controller.create(
      { code: 'X', nameUz: 'x', category: 'c' } as never,
      { user: { sub: 2, role: 'EDITOR' } },
    );
    expect(service.create).toHaveBeenCalledWith(expect.any(Object), { id: 2, role: 'EDITOR' });
  });
});
