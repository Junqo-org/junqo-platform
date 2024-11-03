import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { UsersService } from './users.service';
import { UsersGuard } from './users.guard';

const pubSub = new PubSub();

@Resolver('User')
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query('users')
  @UseGuards(UsersGuard)
  async getUsers() {
    return this.usersService.getUsers();
  }

  @Query('user')
  async getUser(@Args('id') id: string) {
    return this.usersService.getUser(id);
  }

  @Mutation('createUser')
  async createUser(@Args('name') name: string, @Args('email') email: string) {
    const user = this.usersService.createUser(name, email);
    pubSub.publish('userCreated', { userCreated: user });
    return user;
  }

  @Mutation('updateUser')
  async updateUser(
    @Args('id') id: string,
    @Args('name') name: string,
    @Args('email') email: string,
  ) {
    return this.usersService.updateUser(id, name, email);
  }

  @Mutation('deleteUser')
  async deleteUser(@Args('id') id: string) {
    return this.usersService.deleteUser(id);
  }

  @Subscription('userCreated')
  userCreated() {
    return pubSub.asyncIterator('userCreated');
  }
}
