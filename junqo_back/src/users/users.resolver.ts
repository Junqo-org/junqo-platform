import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User as UserGraphql, UserType } from './../graphql.schema';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CurrentUser } from './users.decorator';
import { UpdateUserDTO, UserDTO } from './dto/user.dto';
import { AuthUserDTO } from '../shared/dto/auth-user.dto';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';

@Resolver('User')
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query()
  public async users(
    @CurrentUser() currentUser: AuthUserDTO,
  ): Promise<UserGraphql[]> {
    const users: UserDTO[] = await this.usersService.findAll(currentUser);
    const safeUsers: UserGraphql[] = users.map((user) => {
      delete user.hashedPassword;
      return user;
    });
    return safeUsers;
  }

  @Query()
  public async user(
    @CurrentUser() currentUser: AuthUserDTO,
    @Args('id') id: string,
  ): Promise<UserGraphql> {
    const user = await this.usersService.findOneById(currentUser, id);

    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }
    delete user.hashedPassword;
    return user;
  }

  @Mutation()
  public async updateUser(
    @CurrentUser() currentUser: AuthUserDTO,
    @Args('id') id: string,
    @Args('type') type: UserType,
    @Args('name') name: string,
    @Args('email') email: string,
    @Args('password') password: string,
  ): Promise<UserGraphql> {
    const updateUserDto: UpdateUserDTO = plainToInstance(UpdateUserDTO, {
      id,
      type,
      name,
      email,
      password,
    });

    try {
      await validateOrReject(updateUserDto);
    } catch (errors) {
      throw new BadRequestException(errors);
    }

    const user = await this.usersService.update(currentUser, updateUserDto);
    delete user.hashedPassword;
    return user;
  }

  @Mutation()
  public async deleteUser(
    @CurrentUser() currentUser: AuthUserDTO,
    @Args('id') id: string,
  ): Promise<boolean> {
    const isSuccess = await this.usersService.delete(currentUser, id);

    if (!isSuccess) {
      throw new NotFoundException(`User #${id} not found`);
    }
    return isSuccess;
  }
}
