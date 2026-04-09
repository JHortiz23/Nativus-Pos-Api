import { Test, TestingModule } from '@nestjs/testing';
import { TablesController } from './tables.controller';
import { TablesService } from './tables.service';

describe('TablesController', () => {
  let controller: TablesController;
  let tablesService: {
    findAllDiningAreas: jest.Mock;
  };

  beforeEach(async () => {
    tablesService = {
      findAllDiningAreas: jest.fn(),
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
});
