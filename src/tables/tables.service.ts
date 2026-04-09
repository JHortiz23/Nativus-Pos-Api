import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TablesService {
  constructor(private readonly prisma: PrismaService) {}

  findAllDiningAreas(restaurantId: number) {
    return this.prisma.diningArea.findMany({
      select: {
        id: true,
        name: true,
        isActive: true,
      },
      where: {
        restaurantId,
        isActive: true,
      },
      orderBy: { id: 'asc' },
    });
  }
}
