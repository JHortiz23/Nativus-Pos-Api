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
      findFirst: jest.Mock;
      findMany: jest.Mock;
      update: jest.Mock;
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
        findFirst: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
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
    const createdProduct = {
      id: 1,
      name: 'Hamburguesa',
      description: 'Pan brioche, carne angus y queso cheddar',
      isActive: false,
    };
    prismaService.category.findUnique.mockResolvedValue({ id: 3 });
    prismaService.product.create.mockResolvedValue(createdProduct);

    const result = await service.create(
      'Hamburguesa',
      12.5,
      3,
      7,
      'Pan brioche, carne angus y queso cheddar',
      false,
    );

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
        description: 'Pan brioche, carne angus y queso cheddar',
        isActive: false,
      },
    });
    expect(result).toEqual(createdProduct);
  });

  it('defaults description to null and isActive to true', async () => {
    const createdProduct = {
      id: 1,
      name: 'Hamburguesa',
      description: null,
      isActive: true,
    };
    prismaService.category.findUnique.mockResolvedValue({ id: 3 });
    prismaService.product.create.mockResolvedValue(createdProduct);

    const result = await service.create('Hamburguesa', 12.5, 3, 7);

    expect(prismaService.product.create).toHaveBeenCalledWith({
      data: {
        name: 'Hamburguesa',
        price: 12.5,
        categoryId: 3,
        restaurantId: 7,
        description: null,
        isActive: true,
      },
    });
    expect(result).toEqual(createdProduct);
  });

  it('returns active categories that are not deleted', async () => {
    const categories = [
      { id: 1, name: 'Bebidas', isActive: true, isDeleted: false },
      { id: 2, name: 'Postres', isActive: true, isDeleted: false },
    ];
    prismaService.category.findMany.mockResolvedValue(categories);

    const result = await service.findAllCategories();

    expect(prismaService.category.findMany).toHaveBeenCalledWith({
      where: {
        isActive: true,
        isDeleted: false,
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
    const products = [
      { id: 1, category: { name: 'Bebidas' } },
      { id: 2, category: { name: 'Postres' } },
    ];
    prismaService.$transaction.mockResolvedValue([2, products]);

    const result = await service.findAll({ page: 1, items: 100 }, 7);

    expect(prismaService.product.count).toHaveBeenCalledWith({
      where: { restaurantId: 7, isDeleted: false },
    });
    expect(prismaService.product.findMany).toHaveBeenCalledWith({
      where: { restaurantId: 7, isDeleted: false },
      skip: 0,
      take: 100,
      orderBy: { id: 'asc' },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
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

  it('updates a product only when it belongs to the authenticated restaurant', async () => {
    const existingProduct = {
      id: 9,
      name: 'Hamburguesa',
      price: 12.5,
      categoryId: 3,
      description: 'Clasica',
      isActive: true,
      restaurantId: 7,
    };
    const updatedProduct = {
      ...existingProduct,
      name: 'Hamburguesa doble',
      price: 14.5,
    };

    prismaService.product.findFirst.mockResolvedValue(existingProduct);
    prismaService.product.update.mockResolvedValue(updatedProduct);

    const result = await service.update(
      9,
      7,
      'Hamburguesa doble',
      14.5,
      undefined,
      undefined,
      undefined,
    );

    expect(prismaService.product.findFirst).toHaveBeenCalledWith({
      where: {
        id: 9,
        restaurantId: 7,
      },
    });
    expect(prismaService.product.update).toHaveBeenCalledWith({
      where: {
        id: 9,
      },
      data: {
        name: 'Hamburguesa doble',
        price: 14.5,
        categoryId: 3,
        description: 'Clasica',
        isActive: true,
      },
    });
    expect(result).toEqual(updatedProduct);
  });

  it('rejects product update when the product does not belong to the authenticated restaurant', async () => {
    prismaService.product.findFirst.mockResolvedValue(null);

    await expect(service.update(9, 7)).rejects.toThrow(BadRequestException);

    expect(prismaService.product.findFirst).toHaveBeenCalledWith({
      where: {
        id: 9,
        restaurantId: 7,
      },
    });
    expect(prismaService.product.update).not.toHaveBeenCalled();
  });
});
