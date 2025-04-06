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

export const CurrentUser = createParamDecorator(
  async (data, context: ExecutionContext) => {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest();

    const logger = new Logger('CurrentUserDecorator');

    if (!req.user) {
      logger.error('No user found in request');
      throw new InternalServerErrorException('No user found in request');
    }

    const authUser: AuthUserDTO = plainToInstance(AuthUserDTO, {
      id: req.user.sub,
      name: req.user.userName,
      type: req.user.userType,
      email: req.user.email,
    });

    try {
      await validateOrReject(authUser);
      return authUser;
    } catch (errors) {
      throw new BadRequestException(
        [new Error('Authentication validation error')] + errors,
      );
    }
  },
);
