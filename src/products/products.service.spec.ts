import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ProductsService', () => {
  let service: ProductsService;
  let prismaService: {
    product: {
      create: jest.Mock;
      count: jest.Mock;
      findMany: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  beforeEach(async () => {
    prismaService = {
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

  it('returns a paginated response with defaults', async () => {
    const products = [{ id: 1 }, { id: 2 }];
    prismaService.$transaction.mockResolvedValue([2, products]);

    const result = await service.findAll({ page: 1, items: 100 });

    expect(prismaService.product.count).toHaveBeenCalled();
    expect(prismaService.product.findMany).toHaveBeenCalledWith({
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
