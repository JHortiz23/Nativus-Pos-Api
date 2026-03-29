import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createHmac } from 'crypto';
import { Prisma } from '../generated/prisma';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

type AuthQueryRow = {
  userId: number;
  userRestaurantId: number;
  userName: string;
  userEmail: string | null;
  userRole: string;
  userIsActive: boolean;
  userCreatedAt: Date;
  restaurantId: number;
  restaurantClientId: number;
  restaurantName: string;
  restaurantAddress: string | null;
  restaurantPhone: string | null;
  restaurantEmail: string | null;
  restaurantCreatedAt: Date;
  restaurantIsActive: boolean;
  companyId: number;
  companyName: string;
  companyEmail: string | null;
  companyPhone: string | null;
  companyCreatedAt: Date;
};

type AccessTokenPayload = {
  sub: number;
  email: string | null;
  role: string;
  restaurantId: number;
  companyId: number;
  iat: number;
  exp: number;
};

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async login({ email, pin, expiresIn }: LoginDto) {
    const users = await this.prisma.$queryRaw<AuthQueryRow[]>(Prisma.sql`
      SELECT
        u.id AS "userId",
        u."restaurantId" AS "userRestaurantId",
        u.name AS "userName",
        u.email AS "userEmail",
        u.role AS "userRole",
        u."isActive" AS "userIsActive",
        u."createdAt" AS "userCreatedAt",
        r.id AS "restaurantId",
        r."clientId" AS "restaurantClientId",
        r.name AS "restaurantName",
        r.address AS "restaurantAddress",
        r.phone AS "restaurantPhone",
        r.email AS "restaurantEmail",
        r."createdAt" AS "restaurantCreatedAt",
        r."isActive" AS "restaurantIsActive",
        c.id AS "companyId",
        c.name AS "companyName",
        c.email AS "companyEmail",
        c.phone AS "companyPhone",
        c."createdAt" AS "companyCreatedAt"
      FROM "User" u
      INNER JOIN "Restaurant" r ON r.id = u."restaurantId"
      INNER JOIN "Client" c ON c.id = r."clientId"
      WHERE u.email = ${email}
        AND u.pin = ${pin}
        AND u."isActive" = true
        AND r."isActive" = true
      LIMIT 2
    `);

    if (users.length !== 1) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const [user] = users;

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = this.createAccessToken(
      {
        sub: user.userId,
        email: user.userEmail,
        role: user.userRole,
        restaurantId: user.restaurantId,
        companyId: user.companyId,
      },
      expiresIn,
    );

    return {
      accessToken,
      user: {
        id: user.userId,
        restaurantId: user.userRestaurantId,
        name: user.userName,
        email: user.userEmail,
        role: user.userRole,
        isActive: user.userIsActive,
        createdAt: user.userCreatedAt,
      },
      restaurant: {
        id: user.restaurantId,
        clientId: user.restaurantClientId,
        name: user.restaurantName,
        address: user.restaurantAddress,
        phone: user.restaurantPhone,
        email: user.restaurantEmail,
        createdAt: user.restaurantCreatedAt,
        isActive: user.restaurantIsActive,
      },
      company: {
        id: user.companyId,
        name: user.companyName,
        email: user.companyEmail,
        phone: user.companyPhone,
        createdAt: user.companyCreatedAt,
      },
    };
  }

  private createAccessToken(
    payload: Omit<AccessTokenPayload, 'iat' | 'exp'>,
    expiresIn = '12h',
  ) {
    const nowInSeconds = Math.floor(Date.now() / 1000);
    const ttlInSeconds = this.parseExpiresIn(expiresIn);
    const fullPayload: AccessTokenPayload = {
      ...payload,
      iat: nowInSeconds,
      exp: nowInSeconds + ttlInSeconds,
    };

    const header = {
      alg: 'HS256',
      typ: 'JWT',
    };

    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(fullPayload));
    const content = `${encodedHeader}.${encodedPayload}`;
    const secret = process.env.JWT_SECRET ?? 'nativus-pos-api-dev-secret';
    const signature = createHmac('sha256', secret)
      .update(content)
      .digest('base64url');

    return `${content}.${signature}`;
  }

  private parseExpiresIn(expiresIn: string) {
    const match = /^(\d+)([smhd])$/.exec(expiresIn);

    if (!match) {
      return 12 * 60 * 60;
    }

    const value = Number(match[1]);
    const unit = match[2];

    const unitInSeconds = {
      s: 1,
      m: 60,
      h: 60 * 60,
      d: 24 * 60 * 60,
    }[unit];

    if (!unitInSeconds) {
      return 12 * 60 * 60;
    }

    return value * unitInSeconds;
  }

  private base64UrlEncode(value: string) {
    return Buffer.from(value).toString('base64url');
  }
}
