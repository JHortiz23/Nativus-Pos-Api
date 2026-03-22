import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: { $queryRaw: jest.Mock };

  beforeEach(async () => {
    prismaService = {
      $queryRaw: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return the user, restaurant and company when credentials are valid', async () => {
    const createdAt = new Date('2026-03-22T12:00:00.000Z');
    const jwtSecret = process.env.JWT_SECRET;
    process.env.JWT_SECRET = 'test-secret';

    try {
      prismaService.$queryRaw.mockResolvedValue([
        {
          userId: 7,
          userRestaurantId: 3,
          userName: 'Maria',
          userEmail: 'maria@nativus.com',
          userRole: 'CASHIER',
          userIsActive: true,
          userCreatedAt: createdAt,
          restaurantId: 3,
          restaurantClientId: 11,
          restaurantName: 'Sucursal Centro',
          restaurantAddress: 'San Jose',
          restaurantPhone: '5555-5555',
          restaurantEmail: 'centro@nativus.com',
          restaurantCreatedAt: createdAt,
          restaurantIsActive: true,
          companyId: 11,
          companyName: 'Nativus Group',
          companyEmail: 'admin@nativus.com',
          companyPhone: '8888-8888',
          companyCreatedAt: createdAt,
        },
      ]);

      const result = await service.login({
        email: 'maria@nativus.com',
        pin: '1234',
      });

      expect(result.user).toEqual({
        id: 7,
        restaurantId: 3,
        name: 'Maria',
        email: 'maria@nativus.com',
        role: 'CASHIER',
        isActive: true,
        createdAt,
      });

      expect(result.restaurant).toEqual({
        id: 3,
        clientId: 11,
        name: 'Sucursal Centro',
        address: 'San Jose',
        phone: '5555-5555',
        email: 'centro@nativus.com',
        createdAt,
        isActive: true,
      });

      expect(result.company).toEqual({
        id: 11,
        name: 'Nativus Group',
        email: 'admin@nativus.com',
        phone: '8888-8888',
        createdAt,
      });

      expect(typeof result.accessToken).toBe('string');
      expect(result.accessToken.split('.')).toHaveLength(3);
    } finally {
      if (jwtSecret === undefined) {
        delete process.env.JWT_SECRET;
      } else {
        process.env.JWT_SECRET = jwtSecret;
      }
    }

    expect(prismaService.$queryRaw).toHaveBeenCalledTimes(1);
  });

  it('should reject invalid credentials', async () => {
    prismaService.$queryRaw.mockResolvedValue([]);

    await expect(
      service.login({
        email: 'invalid@nativus.com',
        pin: '0000',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('should reject ambiguous credentials when more than one user matches', async () => {
    prismaService.$queryRaw.mockResolvedValue([
      { userId: 1 },
      { userId: 2 },
    ]);

    await expect(
      service.login({
        email: 'shared@nativus.com',
        pin: '1234',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
