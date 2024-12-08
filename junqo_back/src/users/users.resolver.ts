import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './models/user.model';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { NotFoundException } from '@nestjs/common';

@Resolver('User')
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [User])
  public async users(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Query(() => User)
  public async user(@Args('id') id: string): Promise<User> {
    const user = await this.usersService.findOneById(id);
    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }
    return user;
  }

  @Mutation(() => User)
  public async createUser(
    @Args('createUserInput') createUserInput: CreateUserInput,
  ): Promise<User> {
    return await this.usersService.create(createUserInput);
  }

  @Mutation(() => User)
  public async updateUser(
    @Args('id') id: string,
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
  ): Promise<User> {
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
