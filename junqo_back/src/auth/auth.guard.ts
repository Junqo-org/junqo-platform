import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './../auth/is_public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  /**
   * AuthGuard is a NestJS guard that implements the CanActivate interface to protect routes
   * by verifying JWT tokens. It checks if a route is marked as public using the Reflector
   * and the IS_PUBLIC_KEY. If the route is not public, it extracts the JWT token from the
   * request header, verifies it using the JwtService, and attaches the decoded payload to
   * the request object. Throws an UnauthorizedException if the token is missing or invalid.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const authHeader = request?.headers?.authorization;
    const token = AuthGuard.extractTokenFromHeader(authHeader);

    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  /**
   * Extracts the JWT token from the 'Authorization' header of the request.
   * The token is expected to be in the format 'Bearer <token>'.
   *
   * @param request - The incoming request object containing headers.
   * @returns The extracted token if present and valid, otherwise undefined.
   */
  public static extractTokenFromHeader(authHeader: string): string | undefined {
    if (authHeader == null) return undefined;

    const [type, token] = authHeader.split(' ') ?? [];

    return type === 'Bearer' ? token : undefined;
  }
}
