import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: { login: jest.Mock };

  beforeEach(async () => {
    authService = {
      login: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should delegate login requests to the auth service', async () => {
    const body = {
      email: 'cashier@nativus.com',
      pin: '1234',
    };
    const response = {
      accessToken: 'token',
      user: { id: 5, name: 'Cashier' },
      restaurant: { id: 1, name: 'Main Branch' },
      company: { id: 9, name: 'Nativus' },
    };

    authService.login.mockResolvedValue(response);

    await expect(controller.login(body)).resolves.toEqual(response);
    expect(authService.login).toHaveBeenCalledWith(body);
  });
});
