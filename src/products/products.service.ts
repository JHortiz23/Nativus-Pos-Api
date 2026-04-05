import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetProductsQueryDto } from './dto/get-products-query.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) { }

  findAllCategories() {
    return this.prisma.category.findMany({
      where: {
        isActive: true,
        isDeleted: false,
      },
      orderBy: { id: 'asc' },
    });
  }

  async create(
    name: string,
    price: number,
    categoryId: number,
    restaurantId: number,
    description?: string | null,
    isActive?: boolean,
  ) {
    const category = await this.prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!category) {
      throw new BadRequestException('Category does not exist');
    }

    return this.prisma.product.create({
      data: {
        name,
        price,
        categoryId,
        restaurantId,
        description: description ?? null,
        isActive: isActive ?? true,
      },
    });
  }

  async findAll(query: GetProductsQueryDto, restaurantId: number) {
    const page = query.page ?? 1;
    const pageSize = query.items ?? 100;
    const skip = (page - 1) * pageSize;
    const where = {
      restaurantId,
      isDeleted: false,
    };

    const [total, products] = await this.prisma.$transaction([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { id: 'asc' },
        include: {
          category: {
            select: {
              name: true,
            },
          },
        },
      }),
    ]);

    return {
      products,
      total,
      page,
      page_size: pageSize,
    };
  }

  //Update product
  async update(
    id: number,
    restaurantId: number,
    name?: string,
    price?: number,
    categoryId?: number,
    description?: string | null,
    isActive?: boolean,
  ) {
    const product = await this.prisma.product.findFirst({
      where: {
        id,
        restaurantId,
      },
    });

    if (!product) {
      throw new BadRequestException(
        'Product does not exist for the authenticated restaurant',
      );
    }

    if (categoryId) {
      const category = await this.prisma.category.findUnique({
        where: {
          id: categoryId,
        },
      });

      if (!category) {
        throw new BadRequestException('Category does not exist');
      }
    }

    return this.prisma.product.update({
      where: {
        id,
      },
      data: {
        name: name ?? product.name,
        price: price ?? product.price,
        categoryId: categoryId ?? product.categoryId,
        description: description ?? product.description,
        isActive: isActive ?? product.isActive,
      },
    });

  }

  async remove(id: number, restaurantId: number) {
    const product = await this.prisma.product.findFirst({
      where: {
        id,
        restaurantId,
      },
    });

    if (!product) {
      throw new BadRequestException(
        'Product does not exist for the authenticated restaurant',
      );
    }

    return this.prisma.product.update({
      where: {
        id,
      },
      data: {
        isDeleted: true,
        isActive: false,
      },
    });
  }

}
