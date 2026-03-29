import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

describe('ProductsController', () => {
  let controller: ProductsController;
  let productsService: { create: jest.Mock; findAll: jest.Mock };

  beforeEach(async () => {
    productsService = {
      create: jest.fn(),
      findAll: jest.fn(),
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

  it('delegates pagination params to the service', () => {
    const query = { page: 2, items: 25 };

    controller.findAll(query);

    expect(productsService.findAll).toHaveBeenCalledWith(query);
  });
});
