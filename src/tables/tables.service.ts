import { Injectable } from '@nestjs/common';
import { OrderStatus } from '../generated/prisma';
import { PrismaService } from '../prisma/prisma.service';
import { TableStatusDto } from './dto/dining-area-response.dto';

@Injectable()
export class TablesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllDiningAreas(restaurantId: number) {
    const diningAreas = await this.prisma.diningArea.findMany({
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
          seats: null,
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
}
