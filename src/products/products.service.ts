import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetProductsQueryDto } from './dto/get-products-query.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(
    name: string,
    price: number,
    categoryId: number,
    restaurantId: number,
  ) {
    const category = await this.prisma.category.findFirst({
      where: {
        id: categoryId,
        restaurantId,
      },
    });

    if (!category) {
      throw new BadRequestException(
        'Category does not belong to the authenticated restaurant',
      );
    }

    return this.prisma.product.create({
      data: { name, price, categoryId, restaurantId },
    });
  }

  async findAll(query: GetProductsQueryDto, restaurantId: number) {
    const page = query.page ?? 1;
    const pageSize = query.items ?? 100;
    const skip = (page - 1) * pageSize;
    const where = { restaurantId };

    const [total, products] = await this.prisma.$transaction([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { id: 'asc' },
      }),
    ]);

    return {
      products,
      total,
      page,
      page_size: pageSize,
    };
  }
}
