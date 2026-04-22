import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { TablesService } from './tables.service';

import { BadRequestException, ConflictException } from '@nestjs/common';

describe('TablesService', () => {
  let service: TablesService;
  let prismaService: {
    diningArea: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
    };
    table: {
      create: jest.Mock;
      createMany: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  beforeEach(async () => {
    prismaService = {
      diningArea: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      table: {
        create: jest.fn(),
        createMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      $transaction: jest.fn(),
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
        isActive: true,
        tables: [
          { id: 1, name: 'Mesa 1', isDeleted: false, isActive: true, diningAreaId: 1, orders: [] },
          { id: 2, name: 'Mesa 2', isDeleted: false, isActive: true, diningAreaId: 1, orders: [{ id: 10 }] },
        ],
      },
      {
        id: 2,
        name: 'Terraza',
        isActive: false,
        tables: [{ id: 3, name: 'Mesa 3', isDeleted: false, isActive: true, diningAreaId: 2, orders: [] }],
      },
    ];
    prismaService.diningArea.findMany.mockResolvedValue(diningAreas);

    const result = await service.findAllDiningAreas(7);

    expect(prismaService.diningArea.findMany).toHaveBeenCalledWith({
      select: {
        id: true,
        name: true,
        isActive: true,
        tables: {
          select: {
            id: true,
            name: true,
            isActive: true,
            diningAreaId: true,
            isDeleted: true,
            seats: true,
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
            isDeleted: false,
          },
          orderBy: { id: 'asc' },
        },
      },
      where: {
        restaurantId: 7,
        isDeleted: false,
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
          isActive: true,
          tablesCount: 2,
          availableCount: 1,
          occupiedCount: 1,
          tables: [
            { id: 1, name: 'Mesa 1', status: 'AVAILABLE', seats: undefined, diningAreaId: 1, isDeleted: false, isActive: true },
            { id: 2, name: 'Mesa 2', status: 'OCCUPIED', seats: undefined, diningAreaId: 1, isDeleted: false, isActive: true },
          ],
        },
        {
          id: 2,
          name: 'Terraza',
          isActive: false,
          tablesCount: 1,
          availableCount: 1,
          occupiedCount: 0,
          tables: [{ id: 3, name: 'Mesa 3', status: 'AVAILABLE', seats: undefined, diningAreaId: 2, isDeleted: false, isActive: true }],
        },
      ],
    });
  });

  describe('createDiningArea', () => {
    it('creates a dining area without tables when tables is not provided', async () => {
      const createdDiningArea = {
        id: 1,
        name: 'Salon Principal',
        restaurantId: 7,
        isActive: true,
      };

      prismaService.$transaction.mockImplementation(async (callback: any) =>
        callback({
          diningArea: { create: prismaService.diningArea.create },
          table: { createMany: prismaService.table.createMany },
        }),
      );
      prismaService.diningArea.create.mockResolvedValue(createdDiningArea);

      const result = await service.createDiningArea('Salon Principal', 7, true);

      expect(prismaService.$transaction).toHaveBeenCalled();
      expect(prismaService.diningArea.create).toHaveBeenCalledWith({
        data: {
          name: 'Salon Principal',
          restaurantId: 7,
          isActive: true,
        },
      });
      expect(prismaService.table.createMany).not.toHaveBeenCalled();
      expect(result).toEqual(createdDiningArea);
    });

    it('creates a dining area and tables using provided base name', async () => {
      const createdDiningArea = {
        id: 2,
        name: 'Terraza',
        restaurantId: 7,
        isActive: true,
      };

      prismaService.$transaction.mockImplementation(async (callback: any) =>
        callback({
          diningArea: { create: prismaService.diningArea.create },
          table: { createMany: prismaService.table.createMany },
        }),
      );
      prismaService.diningArea.create.mockResolvedValue(createdDiningArea);

      const result = await service.createDiningArea('Terraza', 7, true, 3, 'mesa');

      expect(prismaService.diningArea.create).toHaveBeenCalledWith({
        data: {
          name: 'Terraza',
          restaurantId: 7,
          isActive: true,
        },
      });
      expect(prismaService.table.createMany).toHaveBeenCalledWith({
        data: [
          {
            name: 'mesa #1',
            restaurantId: 7,
            diningAreaId: 2,
            isActive: true,
          },
          {
            name: 'mesa #2',
            restaurantId: 7,
            diningAreaId: 2,
            isActive: true,
          },
          {
            name: 'mesa #3',
            restaurantId: 7,
            diningAreaId: 2,
            isActive: true,
          },
        ],
      });
      expect(result).toEqual(createdDiningArea);
    });

    it('uses default base name when tableName is not provided', async () => {
      const createdDiningArea = {
        id: 3,
        name: 'Patio',
        restaurantId: 7,
        isActive: true,
      };

      prismaService.$transaction.mockImplementation(async (callback: any) =>
        callback({
          diningArea: { create: prismaService.diningArea.create },
          table: { createMany: prismaService.table.createMany },
        }),
      );
      prismaService.diningArea.create.mockResolvedValue(createdDiningArea);

      await service.createDiningArea('Patio', 7, true, 2);

      expect(prismaService.table.createMany).toHaveBeenCalledWith({
        data: [
          {
            name: 'table #1',
            restaurantId: 7,
            diningAreaId: 3,
            isActive: true,
          },
          {
            name: 'table #2',
            restaurantId: 7,
            diningAreaId: 3,
            isActive: true,
          },
        ],
      });
    });

    it('throws ConflictException on Prisma collision P2002', async () => {
      const error = new Error('Collision');
      (error as any).code = 'P2002';
      prismaService.$transaction.mockRejectedValue(error);

      await expect(service.createDiningArea('Terraza', 7)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('create', () => {
    it('throws BadRequestException if the dining area does not exist for the restaurant', async () => {
      prismaService.diningArea.findFirst.mockResolvedValue(null);

      await expect(service.create('Mesa VIP', 4, 999, 7)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('creates the table correctly', async () => {
      prismaService.diningArea.findFirst.mockResolvedValue({ id: 1, restaurantId: 7 });
      prismaService.table.create.mockResolvedValue({ id: 10, name: 'Mesa VIP' });

      const result = await service.create('Mesa VIP', 4, 1, 7, true);

      expect(prismaService.table.create).toHaveBeenCalledWith({
        data: {
          name: 'Mesa VIP',
          seats: 4,
          diningAreaId: 1,
          restaurantId: 7,
          isActive: true,
        },
      });
      expect(result).toEqual({ id: 10, name: 'Mesa VIP' });
    });

    it('throws ConflictException on Prisma collision P2002', async () => {
      prismaService.diningArea.findFirst.mockResolvedValue({ id: 1, restaurantId: 7 });
      
      const error = new Error('Collision');
      (error as any).code = 'P2002';
      prismaService.table.create.mockRejectedValue(error);

      await expect(service.create('Mesa VIP', 4, 1, 7)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('update', () => {
    const existingTable = {
      id: 10,
      name: 'Old Table',
      seats: 2,
      diningAreaId: 1,
      restaurantId: 7,
      isActive: true,
    };

    it('throws BadRequestException if the table does not exist', async () => {
      prismaService.table.findFirst.mockResolvedValue(null);

      await expect(service.update(10, 7)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws BadRequestException if attempting to change to a non-existent dining area', async () => {
      prismaService.table.findFirst.mockResolvedValue(existingTable);
      prismaService.diningArea.findUnique.mockResolvedValue(null);

      await expect(service.update(10, 7, 'Mesa 2', 4, 999)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('updates fields correctly', async () => {
      prismaService.table.findFirst.mockResolvedValue(existingTable);
      prismaService.table.update.mockResolvedValue({ ...existingTable, name: 'New Name' });

      const result = await service.update(10, 7, 'New Name', 6, undefined, false);

      expect(prismaService.table.update).toHaveBeenCalledWith({
        where: { id: 10 },
        data: {
          id: 10,
          name: 'New Name',
          seats: 6,
          diningAreaId: 1, // original
          isActive: false,
        },
      });
      expect(result.name).toEqual('New Name');
    });

    it('throws ConflictException on Prisma collision P2002', async () => {
      prismaService.table.findFirst.mockResolvedValue(existingTable);
      
      const error = new Error('Collision');
      (error as any).code = 'P2002';
      prismaService.table.update.mockRejectedValue(error);

      await expect(service.update(10, 7, 'Duplicate Name')).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('remove', () => {
    it('throws BadRequestException if the table does not exist', async () => {
      prismaService.table.findFirst.mockResolvedValue(null);

      await expect(service.remove(10, 7)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('soft deletes the table and renames it to prevent collisions', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-04-20T12:00:00Z').getTime());
      
      const existingTable = {
        id: 10,
        name: 'Mesa 1',
        restaurantId: 7,
      };

      prismaService.table.findFirst.mockResolvedValue(existingTable);

      await service.remove(10, 7);

      expect(prismaService.table.update).toHaveBeenCalledWith({
        where: { id: 10 },
        data: {
          isDeleted: true,
          isActive: false,
          name: expect.stringMatching(/^Mesa 1_deleted_1776/),
        },
      });

      jest.useRealTimers();
    });
  });
});
