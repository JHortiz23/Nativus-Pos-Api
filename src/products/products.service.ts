import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
    constructor(private prisma: PrismaService) { }

    create(name: string, price: number) {
        return this.prisma.product.create({
            data: { name, price },
        });
    }

    findAll() {
        return this.prisma.product.findMany();
    }
}