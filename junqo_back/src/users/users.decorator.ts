import { createParamDecorator } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Logger } from '@nestjs/common';
import { User } from './../graphql.schema';

export const CurrentUser = createParamDecorator((data, context) => {
  const ctx = GqlExecutionContext.create(context);
  const req = ctx.getContext().req;

  const logger = new Logger('CurrentUserDecorator');

  if (!req.user) {
    logger.error('No user found in request');
    return null;
  }
  const user: User = new User();

  user.id = req.user.sub;
  user.name = req.user.username;
  user.type = req.user.userType;
  user.email = req.user.email;
  return user;
});
