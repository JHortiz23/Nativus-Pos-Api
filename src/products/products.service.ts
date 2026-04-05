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
        isDleted: false,
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
    const where = { restaurantId };

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
    name?: string,
    price?: number,
    categoryId?: number,
    description?: string | null,
    isActive?: boolean,
  ) {
    // Check if the product exists
    const product = await this.prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!product) {
      throw new BadRequestException('Product does not exist');
    }

    // Check if the category exists
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
    
    // Update the product with the new values, or keep the old values if not provided
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

}
