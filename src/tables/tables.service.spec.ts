import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { TablesService } from './tables.service';

describe('TablesService', () => {
  let service: TablesService;
  let prismaService: {
    diningArea: {
      findMany: jest.Mock;
    };
  };

  beforeEach(async () => {
    prismaService = {
      diningArea: {
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TablesService,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
      ],
    }).compile();

    service = module.get<TablesService>(TablesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns active dining areas for the authenticated restaurant', async () => {
    const diningAreas = [
      { id: 1, name: 'Salon principal', isActive: true },
      { id: 2, name: 'Terraza', isActive: true },
    ];
    prismaService.diningArea.findMany.mockResolvedValue(diningAreas);

    const result = await service.findAllDiningAreas(7);

    expect(prismaService.diningArea.findMany).toHaveBeenCalledWith({
      select: {
        id: true,
        name: true,
        isActive: true,
      },
      where: {
        restaurantId: 7,
        isActive: true,
      },
      orderBy: { id: 'asc' },
    });
    expect(result).toEqual(diningAreas);
  });
});
