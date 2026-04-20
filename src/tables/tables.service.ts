import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { OrderStatus } from '../generated/prisma';
import { PrismaService } from '../prisma/prisma.service';
import { TableStatusDto } from './dto/dining-area-response.dto';

@Injectable()
export class TablesService {
  constructor(private readonly prisma: PrismaService) { }

  async findAllDiningAreas(restaurantId: number) {
    const diningAreas = await this.prisma.diningArea.findMany({
      select: {
        id: true,
        name: true,
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
                  notIn: [OrderStatus.CANCELED, OrderStatus.CLOSED],
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
        restaurantId,
        isActive: true,
      },
      orderBy: { id: 'asc' },
    });

    const mappedDiningAreas = diningAreas.map((diningArea) => {
      const tables = diningArea.tables.map((table) => {
        const status =
          table.orders.length > 0
            ? TableStatusDto.OCCUPIED
            : TableStatusDto.AVAILABLE;

        return {
          id: table.id,
          name: table.name,
          status,
          seats: table.seats,
          diningAreaId: table.diningAreaId,
          isActive: table.isActive,
          isDeleted: table.isDeleted,
        };
      });

      const occupiedCount = tables.filter(
        (table) => table.status === TableStatusDto.OCCUPIED,
      ).length;
      const tablesCount = tables.length;

      return {
        id: diningArea.id,
        name: diningArea.name,
        tablesCount,
        availableCount: tablesCount - occupiedCount,
        occupiedCount,
        tables,
      };
    });

    const totalTables = mappedDiningAreas.reduce(
      (total, diningArea) => total + diningArea.tablesCount,
      0,
    );
    const occupiedTables = mappedDiningAreas.reduce(
      (total, diningArea) => total + diningArea.occupiedCount,
      0,
    );

    return {
      summary: {
        totalTables,
        availableTables: totalTables - occupiedTables,
        occupiedTables,
      },
      diningAreas: mappedDiningAreas,
    };
  }

  // ** Create Table ** //
  async create(
    name: string,
    seats: number,
    diningAreaId: number,
    restaurantId: number,
    isActive?: boolean,
  ) {
    const diningArea = await this.prisma.diningArea.findFirst({
      where: {
        id: diningAreaId,
        restaurantId,
      },
    });

    if (!diningArea) {
      throw new BadRequestException('Dining area does not exist');
    }

    try {
      return await this.prisma.table.create({
        data: {
          name,
          seats,
          diningAreaId,
          restaurantId,
          isActive: isActive ?? true,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('A table with this name already exists in this dining area');
      }
      throw error;
    }
  }

  // ** Update Table ** //
  async update(
    id: number,
    restaurantId: number,
    name?: string,
    seats?: number,
    diningAreaId?: number,
    isActive?: boolean,
  ) {
    const table = await this.prisma.table.findFirst({
      where: {
        id,
        restaurantId,
      },
    });

    if (!table) {
      throw new BadRequestException(
        'Table does not exist for the authenticated restaurant',
      );
    }

    if (diningAreaId) {
      const diningArea = await this.prisma.diningArea.findUnique({
        where: {
          id: diningAreaId,
          restaurantId: restaurantId,
        },
      });

      if (!diningArea) {
        throw new BadRequestException('Dining area does not exist for the authenticated restaurant');
      }
    }
    try {
      return await this.prisma.table.update({
        where: {
          id,
        },
        data: {
          id: id,
          name: name ?? table.name,
          seats: seats ?? table.seats,
          diningAreaId: diningAreaId ?? table.diningAreaId,
          isActive: isActive ?? table.isActive,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('A table with this name already exists in this dining area');
      }
      throw error;
    }

  }
}
