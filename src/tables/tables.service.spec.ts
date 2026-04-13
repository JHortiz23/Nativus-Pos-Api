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
      {
        id: 1,
        name: 'Salon principal',
        tables: [
          { id: 1, name: 'Mesa 1', orders: [] },
          { id: 2, name: 'Mesa 2', orders: [{ id: 10 }] },
        ],
      },
      {
        id: 2,
        name: 'Terraza',
        tables: [{ id: 3, name: 'Mesa 3', orders: [] }],
      },
    ];
    prismaService.diningArea.findMany.mockResolvedValue(diningAreas);

    const result = await service.findAllDiningAreas(7);

    expect(prismaService.diningArea.findMany).toHaveBeenCalledWith({
      select: {
        id: true,
        name: true,
        tables: {
          select: {
            id: true,
            name: true,
            orders: {
              select: {
                id: true,
              },
              where: {
                status: {
                  notIn: ['CANCELED', 'CLOSED'],
                },
              },
              take: 1,
            },
          },
          where: {
            isActive: true,
          },
          orderBy: { id: 'asc' },
        },
      },
      where: {
        restaurantId: 7,
        isActive: true,
      },
      orderBy: { id: 'asc' },
    });
    expect(result).toEqual({
      summary: {
        totalTables: 3,
        availableTables: 2,
        occupiedTables: 1,
      },
      diningAreas: [
        {
          id: 1,
          name: 'Salon principal',
          tablesCount: 2,
          availableCount: 1,
          occupiedCount: 1,
          tables: [
            { id: 1, name: 'Mesa 1', status: 'AVAILABLE', seats: null },
            { id: 2, name: 'Mesa 2', status: 'OCCUPIED', seats: null },
          ],
        },
        {
          id: 2,
          name: 'Terraza',
          tablesCount: 1,
          availableCount: 1,
          occupiedCount: 0,
          tables: [{ id: 3, name: 'Mesa 3', status: 'AVAILABLE', seats: null }],
        },
      ],
    });
  });
});
