import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

describe('ProductsController', () => {
  let controller: ProductsController;
  let productsService: {
    create: jest.Mock;
    findAll: jest.Mock;
    findAllCategories: jest.Mock;
    remove: jest.Mock;
    update: jest.Mock;
  };

  beforeEach(async () => {
    productsService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findAllCategories: jest.fn(),
      remove: jest.fn(),
      update: jest.fn(),
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
    const body = {
      name: 'Hamburguesa',
      price: 12.5,
      categoryId: 3,
      description: null,
      isActive: true,
    };

    controller.create(request as never, body);

    expect(productsService.create).toHaveBeenCalledWith(
      'Hamburguesa',
      12.5,
      3,
      7,
      null,
      true,
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

  it('uses the authenticated restaurant when updating a product', () => {
    const request = {
      user: {
        restaurantId: 7,
      },
    };
    const body = {
      name: 'Hamburguesa doble',
      price: 14.5,
      categoryId: 4,
      description: 'Con tocineta',
      isActive: true,
    };

    controller.update(request as never, 9, body);

    expect(productsService.update).toHaveBeenCalledWith(
      9,
      7,
      'Hamburguesa doble',
      14.5,
      4,
      'Con tocineta',
      true,
    );
  });

  it('uses the authenticated restaurant when deleting a product logically', () => {
    const request = {
      user: {
        restaurantId: 7,
      },
    };

    controller.remove(request as never, 9);

    expect(productsService.remove).toHaveBeenCalledWith(9, 7);
  });
});
