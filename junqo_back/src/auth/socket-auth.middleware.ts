import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { jwtConstants } from './constants';

@Injectable()
export class SocketAuthMiddleware {
  private readonly logger = new Logger(SocketAuthMiddleware.name);

  constructor(private readonly jwtService: JwtService) {}

  /**
   * Socket.IO middleware for handling authentication during handshake
   * This runs before the connection is established, providing more reliable auth
   */
  createAuthMiddleware() {
    return async (socket: Socket, next: (err?: Error) => void) => {
      try {
        const token = this.extractToken(socket);

        if (!token) {
          this.logger.error(
            `Authentication failed - token missing for socket ${socket.id}`,
          );
          return next(new Error('Authentication failed - token missing'));
        }

        const payload = await this.validateToken(token);

        if (!payload || !payload.sub) {
          this.logger.error(`Invalid token payload for socket ${socket.id}`);
          return next(
            new Error('Authentication failed - invalid token payload'),
          );
        }

        // Store user data in socket for later use
        socket.data.user = payload;
        socket.data.userId = payload.sub;
        socket.data.userEmail = payload.email;
        socket.data.isAuthenticated = true;

        this.logger.log(
          `Socket ${socket.id} authenticated for user ${payload.sub}`,
        );

        next();
      } catch (error) {
        this.logger.error(
          `Authentication middleware error for socket ${socket.id}:`,
          error.message,
        );
        next(new Error('Authentication failed - invalid token'));
      }
    };
  }

  /**
   * Extract token from various possible locations in the handshake
   */
  private extractToken(socket: Socket): string | null {
    // Try to get token from auth object first (most common)
    if (socket.handshake.auth?.token) {
      return socket.handshake.auth.token;
    }

    // Try to get token from query parameters
    if (socket.handshake.query?.token) {
      return Array.isArray(socket.handshake.query.token)
        ? socket.handshake.query.token[0]
        : socket.handshake.query.token;
    }

    // Try to get token from headers (Authorization header)
    const authHeader = socket.handshake.headers?.authorization;
    if (authHeader) {
      if (authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
      }
      return authHeader;
    }

    return null;
  }

  /**
   * Validate JWT token and return payload
   */
  private async validateToken(token: string): Promise<any> {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });
    } catch (error) {
      this.logger.error('JWT verification failed:', error.message);
      throw error;
    }
  }

  /**
   * Helper method to check if a socket is authenticated
   */
  static isAuthenticated(socket: Socket): boolean {
    return socket.data?.isAuthenticated === true;
  }

  /**
   * Helper method to get user ID from authenticated socket
   */
  static getUserId(socket: Socket): string | null {
    return socket.data?.userId || null;
  }

  /**
   * Helper method to get user data from authenticated socket
   */
  static getUser(socket: Socket): any | null {
    return socket.data?.user || null;
  }
}
