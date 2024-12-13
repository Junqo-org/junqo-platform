import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { UpdateUserInput, User as UserGraphql } from 'src/graphql.schema';
import {
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Action, CaslAbilityFactory } from 'src/casl/casl-ability.factory';

@Resolver('User')
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly caslAbilityFactory: CaslAbilityFactory,
  ) {}

  @Query(() => [UserGraphql])
  public async users(context: ExecutionContext): Promise<UserGraphql[]> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const ability = this.caslAbilityFactory.createForUser(user);

    if (ability.cannot(Action.READ, UserGraphql)) {
      throw new ForbiddenException('You do not have permission to read users');
    }
    return this.usersService.findAll();
  }

  @Query(() => UserGraphql)
  public async user(
    context: ExecutionContext,
    @Args('id') id: string,
  ): Promise<UserGraphql> {
    const request = context.switchToHttp().getRequest();
    const requestUser = request.user;
    const ability = this.caslAbilityFactory.createForUser(requestUser);

    if (ability.cannot(Action.READ, UserGraphql)) {
      throw new ForbiddenException('You do not have permission to read users');
    }
    const user = await this.usersService.findOneById(id);

    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }
    return user;
  }

  @Mutation(() => UserGraphql)
  public async updateUser(
    @Args('id') id: string,
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
  ): Promise<UserGraphql> {
    return await this.usersService.update(id, updateUserInput);
  }

  @Mutation(() => Boolean)
  public async deleteUser(@Args('id') id: string): Promise<boolean> {
    const isSuccess = await this.usersService.delete(id);

    if (!isSuccess) {
      throw new NotFoundException(`User #${id} not found`);
    }
    return isSuccess;
  }
}
