import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User as UserGraphql, UserType } from './../graphql.schema';
import { NotFoundException } from '@nestjs/common';
import { CurrentUser } from './users.decorator';

@Resolver('User')
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [UserGraphql])
  public async users(
    @CurrentUser() currentUser: UserGraphql,
  ): Promise<UserGraphql[]> {
    const users = await this.usersService.findAll(currentUser);
    return users.map((u) => u.toJSON());
  }

  @Query(() => UserGraphql)
  public async user(
    @CurrentUser() currentUser: UserGraphql,
    @Args('id') id: string,
  ): Promise<UserGraphql> {
    const user = await this.usersService.findOneById(currentUser, id);

    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }
    return user.toJSON();
  }

  @Mutation(() => UserGraphql)
  public async updateUser(
    @CurrentUser() currentUser: UserGraphql,
    @Args('id') id: string,
    @Args('type') type: UserType,
    @Args('name') name: string,
    @Args('email') email: string,
    @Args('password') password: string,
  ): Promise<UserGraphql> {
    const user = await this.usersService.update(currentUser, {
      id,
      type,
      name,
      email,
      password,
    });
    return user.toJSON();
  }

  @Mutation(() => Boolean)
  public async deleteUser(
    @CurrentUser() currentUser: UserGraphql,
    @Args('id') id: string,
  ): Promise<boolean> {
    const isSuccess = await this.usersService.delete(currentUser, id);

    if (!isSuccess) {
      throw new NotFoundException(`User #${id} not found`);
    }
    return isSuccess;
  }
}
