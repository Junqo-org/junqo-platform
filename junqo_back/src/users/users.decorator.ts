import {
  BadRequestException,
  createParamDecorator,
  InternalServerErrorException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Logger } from '@nestjs/common';
import { AuthUserDTO } from '../shared/dto/auth-user.dto';
import { validateOrReject } from 'class-validator';
import { plainToInstance } from 'class-transformer';

export const CurrentUser = createParamDecorator((data, context) => {
  const ctx = GqlExecutionContext.create(context);
  const req = ctx.getContext().req;

  const logger = new Logger('CurrentUserDecorator');

  if (!req.user) {
    logger.error('No user found in request');
    throw new InternalServerErrorException('No user found in request');
  }
  const authUser: AuthUserDTO = plainToInstance(AuthUserDTO, {
    id: req.user.sub,
    name: req.user.username,
    type: req.user.userType,
    email: req.user.email,
  });

  validateOrReject(authUser).catch((errors) => {
    throw new BadRequestException(errors);
  });
  return authUser;
});
