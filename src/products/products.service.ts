import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetProductsQueryDto } from './dto/get-products-query.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  create(name: string, price: number) {
    return this.prisma.product.create({
      data: { name, price },
    });
  }

  async findAll(query: GetProductsQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.items ?? 100;
    const skip = (page - 1) * pageSize;

    const [total, products] = await this.prisma.$transaction([
      this.prisma.product.count(),
      this.prisma.product.findMany({
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
