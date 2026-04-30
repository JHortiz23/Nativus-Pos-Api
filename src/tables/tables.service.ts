import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { OrderStatus } from '../generated/prisma';
import { PrismaService } from '../prisma/prisma.service';
import { TableStatusDto } from './dto/dining-area-response.dto';

@Injectable()
export class TablesService {
  constructor(private readonly prisma: PrismaService) { }
  // ** List all dining areas with their tables and summary ** //
  async findAllDiningAreas(restaurantId: number) {
    const diningAreas = await this.prisma.diningArea.findMany({
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
                  notIn: [OrderStatus.CANCELED, OrderStatus.CLOSED],
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
        restaurantId,
        isDeleted: false,
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
        isActive: diningArea.isActive,
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

  // ** Create Dining Area with Tables ** //
  async createDiningArea(
    name: string,
    restaurantId: number,
    isActive?: boolean,
    tables?: number,
    tableName?: string,
  ) {
    const tablesToCreate = tables ?? 0;
    const normalizedTableName = tableName?.trim() ? tableName.trim() : 'table';

    try {
      return await this.prisma.$transaction(async (tx) => {
        const diningArea = await tx.diningArea.create({
          data: {
            name,
            restaurantId,
            isActive: isActive ?? true,
          },
        });

        if (tablesToCreate > 0) {
          const tablesData = Array.from({ length: tablesToCreate }, (_, index) => ({
            name: `${normalizedTableName} #${index + 1}`,
            restaurantId,
            diningAreaId: diningArea.id,
            isActive: true,
          }));

          await tx.table.createMany({
            data: tablesData,
          });
        }

        return diningArea;
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('A dining area with this name already exists in this restaurant');
      }

      throw error;
    }
  }

  // ** Delete Dining Area (Soft Delete) ** //
  async removeDiningArea(id: number, restaurantId: number) {
    const diningArea = await this.prisma.diningArea.findFirst({
      where: {
        id,
        restaurantId,
      },
    });

    if (!diningArea) {
      throw new BadRequestException(
        'Dining area does not exist for the authenticated restaurant',
      );
    }

    return this.prisma.diningArea.update({
      where: {
        id,
      },
      data: {
        isDeleted: true,
        isActive: false,
        name: `${diningArea.name}_deleted_${Date.now()}`,
      },
    });
  }

  // ** Update Dining Area ** //
  async updateDiningArea(
    id: number,
    restaurantId: number,
    name?: string,
    isActive?: boolean,
  ) {

    const diningArea = await this.prisma.diningArea.findFirst({
      where: {
        id,
        restaurantId,
      },
    });

    if (!diningArea) {
      throw new BadRequestException('Dining area does not exist for the authenticated restaurant');
    }

    try {
      return await this.prisma.diningArea.update({
        where: {
          id,
        },
        data: {
          name: name ?? diningArea.name,
          isActive: isActive ?? diningArea.isActive,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('A dining area with this name already exists in this restaurant');
      }
      throw error;
    }
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

  // ** Delete Table (Soft Delete) ** //
  async remove(id: number, restaurantId: number) {
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

    return this.prisma.table.update({
      where: {
        id,
      },
      data: {
        isDeleted: true,
        isActive: false,
        name: `${table.name}_deleted_${Date.now()}`,
      },
    });
  }
}
