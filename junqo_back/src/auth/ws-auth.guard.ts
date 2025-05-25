import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>();
    const token = client.handshake.auth.token;

    if (!token) {
      throw new WsException('Authentication failed - token missing');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });

      if (!payload || !payload.sub) {
        throw new WsException('Invalid authentication token');
      }

      // Store user data in socket for later use
      client.data.user = payload;
      client.data.userId = payload.sub;

      return true;
    } catch {
      throw new WsException('Authentication failed - invalid token');
    }
  }
}
