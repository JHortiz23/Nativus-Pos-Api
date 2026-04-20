import { Test, TestingModule } from '@nestjs/testing';
import { TablesController } from './tables.controller';
import { TablesService } from './tables.service';

describe('TablesController', () => {
  let controller: TablesController;
  let tablesService: {
    findAllDiningAreas: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    tablesService = {
      findAllDiningAreas: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TablesController],
      providers: [
        {
          provide: TablesService,
          useValue: tablesService,
        },
      ],
    }).compile();

    controller = module.get<TablesController>(TablesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('uses the authenticated restaurant when listing dining areas', () => {
    const request = {
      user: {
        restaurantId: 7,
      },
    };

    controller.findAllDiningAreas(request as never);

    expect(tablesService.findAllDiningAreas).toHaveBeenCalledWith(7);
  });

  describe('create', () => {
    it('creates a table for the authenticated restaurant', async () => {
      const request = {
        user: { restaurantId: 7 },
      };
      const body = {
        name: 'Mesa Vip',
        seats: 6,
        diningAreaId: 1,
        isActive: true,
      };

      tablesService.create.mockResolvedValue({ id: 1, ...body, restaurantId: 7 });

      const result = await controller.create(request as never, body);

      expect(tablesService.create).toHaveBeenCalledWith(
        'Mesa Vip',
        6,
        1,
        7,
        true,
      );
      expect(result).toEqual({ id: 1, ...body, restaurantId: 7 });
    });
  });

  describe('update', () => {
    it('updates a table using authenticated restaurant id', async () => {
      const request = {
        user: { restaurantId: 7 },
      };
      const body = {
        name: 'Mesa Nueva',
        seats: 4,
        diningAreaId: 2,
        isActive: false,
      };

      tablesService.update.mockResolvedValue({ id: 10, ...body, restaurantId: 7 });

      const result = await controller.update(request as never, 10, body);

      expect(tablesService.update).toHaveBeenCalledWith(
        10,
        7,
        'Mesa Nueva',
        4,
        2,
        false,
      );
      expect(result).toEqual({ id: 10, ...body, restaurantId: 7 });
    });
  });

  describe('remove', () => {
    it('removes a table logically using authenticated restaurant id', async () => {
      const request = {
        user: { restaurantId: 7 },
      };

      tablesService.remove.mockResolvedValue({ id: 15, isDeleted: true, isActive: false });

      const result = await controller.remove(request as never, 15);

      expect(tablesService.remove).toHaveBeenCalledWith(15, 7);
      expect(result).toEqual({ id: 15, isDeleted: true, isActive: false });
    });
  });
});
