import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ProductsService', () => {
  let service: ProductsService;
  let prismaService: {
    category: {
      findUnique: jest.Mock;
      findMany: jest.Mock;
    };
    product: {
      create: jest.Mock;
      count: jest.Mock;
      findMany: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  beforeEach(async () => {
    prismaService = {
      category: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
      product: {
        create: jest.fn(),
        count: jest.fn(),
        findMany: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates a product when the category exists', async () => {
    const createdProduct = { id: 1, name: 'Hamburguesa' };
    prismaService.category.findUnique.mockResolvedValue({ id: 3 });
    prismaService.product.create.mockResolvedValue(createdProduct);

    const result = await service.create('Hamburguesa', 12.5, 3, 7);

    expect(prismaService.category.findUnique).toHaveBeenCalledWith({
      where: {
        id: 3,
      },
    });
    expect(prismaService.product.create).toHaveBeenCalledWith({
      data: {
        name: 'Hamburguesa',
        price: 12.5,
        categoryId: 3,
        restaurantId: 7,
      },
    });
    expect(result).toEqual(createdProduct);
  });

  it('returns active categories that are not deleted', async () => {
    const categories = [
      { id: 1, name: 'Bebidas', isActive: true, isDleted: false },
      { id: 2, name: 'Postres', isActive: true, isDleted: false },
    ];
    prismaService.category.findMany.mockResolvedValue(categories);

    const result = await service.findAllCategories();

    expect(prismaService.category.findMany).toHaveBeenCalledWith({
      where: {
        isActive: true,
        isDleted: false,
      },
      orderBy: { id: 'asc' },
    });
    expect(result).toEqual(categories);
  });

  it('rejects product creation when category does not exist', async () => {
    prismaService.category.findUnique.mockResolvedValue(null);

    await expect(service.create('Hamburguesa', 12.5, 3, 7)).rejects.toThrow(
      BadRequestException,
    );

    expect(prismaService.product.create).not.toHaveBeenCalled();
  });

  it('returns a paginated response with defaults', async () => {
    const products = [{ id: 1 }, { id: 2 }];
    prismaService.$transaction.mockResolvedValue([2, products]);

    const result = await service.findAll({ page: 1, items: 100 }, 7);

    expect(prismaService.product.count).toHaveBeenCalledWith({
      where: { restaurantId: 7 },
    });
    expect(prismaService.product.findMany).toHaveBeenCalledWith({
      where: { restaurantId: 7 },
      skip: 0,
      take: 100,
      orderBy: { id: 'asc' },
    });
    expect(prismaService.$transaction).toHaveBeenCalledWith([
      prismaService.product.count.mock.results[0].value,
      prismaService.product.findMany.mock.results[0].value,
    ]);
    expect(result).toEqual({
      products,
      total: 2,
      page: 1,
      page_size: 100,
    });
  });
});
