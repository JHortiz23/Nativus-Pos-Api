import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

describe('ProductsController', () => {
  let controller: ProductsController;
  let productsService: {
    create: jest.Mock;
    findAll: jest.Mock;
    findAllCategories: jest.Mock;
  };

  beforeEach(async () => {
    productsService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findAllCategories: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: productsService,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('uses the authenticated restaurant when creating a product', () => {
    const request = {
      user: {
        restaurantId: 7,
      },
    };
    const body = { name: 'Hamburguesa', price: 12.5, categoryId: 3 };

    controller.create(request as never, body);

    expect(productsService.create).toHaveBeenCalledWith(
      'Hamburguesa',
      12.5,
      3,
      7,
    );
  });

  it('delegates category listing to the service', () => {
    controller.findAllCategories();

    expect(productsService.findAllCategories).toHaveBeenCalled();
  });

  it('delegates pagination params to the service', () => {
    const request = {
      user: {
        restaurantId: 7,
      },
    };
    const query = { page: 2, items: 25 };

    controller.findAll(request as never, query);

    expect(productsService.findAll).toHaveBeenCalledWith(query, 7);
  });
});
