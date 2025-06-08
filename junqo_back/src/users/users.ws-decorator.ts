import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { AuthUserDTO } from '../shared/dto/auth-user.dto';
import { validateOrReject } from 'class-validator';
import { plainToInstance } from 'class-transformer';

export const WsCurrentUser = createParamDecorator(
  async (data, context: ExecutionContext) => {
    const client = context.switchToWs().getClient();

    const logger = new Logger('WsCurrentUserDecorator');

    if (!client.data || !client.data.user) {
      logger.error('No user found in WebSocket client data');
      throw new InternalServerErrorException(
        'No user found in WebSocket client data',
      );
    }

    const authUser: AuthUserDTO = plainToInstance(AuthUserDTO, {
      id: client.data.user.sub,
      name: client.data.user.userName,
      type: client.data.user.userType,
      email: client.data.user.email,
    });

    try {
      await validateOrReject(authUser);
      return authUser;
    } catch (errors) {
      throw new BadRequestException(
        [new Error('WebSocket authentication validation error')] + errors,
      );
    }
  },
);
