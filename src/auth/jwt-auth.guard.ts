import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { createHmac, timingSafeEqual } from 'crypto';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from './public.decorator';

export type AccessTokenPayload = {
  sub: number;
  email: string | null;
  role: string;
  restaurantId: number;
  companyId: number;
  iat: number;
  exp: number;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Missing Authorization header');
    }

    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid Authorization header format');
    }

    const payload = this.verifyAccessToken(token);
    (request as Request & { user: AccessTokenPayload }).user = payload;

    return true;
  }

  private verifyAccessToken(token: string): AccessTokenPayload {
    const [encodedHeader, encodedPayload, signature] = token.split('.');

    if (!encodedHeader || !encodedPayload || !signature) {
      throw new UnauthorizedException('Invalid token structure');
    }

    const content = `${encodedHeader}.${encodedPayload}`;
    const secret = process.env.JWT_SECRET ?? 'nativus-pos-api-dev-secret';
    const expectedSignature = createHmac('sha256', secret)
      .update(content)
      .digest('base64url');

    const isValidSignature = this.safeCompare(signature, expectedSignature);

    if (!isValidSignature) {
      throw new UnauthorizedException('Invalid token signature');
    }

    let payload: AccessTokenPayload;

    try {
      payload = JSON.parse(
        Buffer.from(encodedPayload, 'base64url').toString('utf8'),
      ) as AccessTokenPayload;
    } catch {
      throw new UnauthorizedException('Invalid token payload');
    }

    if (!payload?.exp || typeof payload.exp !== 'number') {
      throw new UnauthorizedException('Invalid token expiration');
    }

    const nowInSeconds = Math.floor(Date.now() / 1000);

    if (payload.exp <= nowInSeconds) {
      throw new UnauthorizedException('Token expired');
    }

    return payload;
  }

  private safeCompare(left: string, right: string): boolean {
    const leftBuffer = Buffer.from(left);
    const rightBuffer = Buffer.from(right);

    if (leftBuffer.length !== rightBuffer.length) {
      return false;
    }

    return timingSafeEqual(leftBuffer, rightBuffer);
  }
}
