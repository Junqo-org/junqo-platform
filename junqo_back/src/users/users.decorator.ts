import { createParamDecorator } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from 'src/graphql.schema';

export const CurrentUser = createParamDecorator((data, context) => {
  const ctx = GqlExecutionContext.create(context);
  const req = ctx.getContext().req;

  if (!req.user) {
    console.error('No user found in request');
    return null;
  }
  const user: User = new User();

  user.id = req.user.sub;
  user.name = req.user.username;
  user.type = req.user.userType;
  user.email = req.user.email;
  return user;
});
