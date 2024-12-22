import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User as UserModel } from './models/user.model';
import { User as UserGraphql, UserType } from './../graphql.schema';
import * as bcrypt from 'bcrypt';
import { bcryptConstants } from './../auth/constants';
import { Mapper } from './mapper/mapper';
import { CaslAbilityFactory, Action } from './../casl/casl-ability.factory';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UserModel)
    private readonly userModel: typeof UserModel,
    private readonly caslAbilityFactory: CaslAbilityFactory,
  ) {}

  public async findAll(currentUser: UserGraphql): Promise<UserGraphql[]> {
    const ability = this.caslAbilityFactory.createForUser(currentUser);

    if (ability.cannot(Action.READ, UserGraphql)) {
      throw new ForbiddenException('You do not have permission to read users');
    }
    try {
      const users = await this.userModel.findAll();

      if (!users) {
        throw new NotFoundException('Users not found');
      }
      return Mapper.toGraphQl(users);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to fetch users: ${error.message}`,
      );
    }
  }

  public async findOneById(
    currentUser: UserGraphql,
    id: string,
  ): Promise<UserGraphql> {
    if (!id || typeof id !== 'string') {
      throw new BadRequestException('Invalid user ID');
    }
    const ability = this.caslAbilityFactory.createForUser(currentUser);

    const authUser = new UserGraphql();
    authUser.id = id;

    if (ability.cannot(Action.READ, authUser)) {
      throw new ForbiddenException('You do not have permission to read users');
    }
    const userModel = await this.userModel.findByPk(id);
    const userGraphql = Mapper.toGraphQL(userModel);

    if (!userGraphql) {
      throw new NotFoundException(`User #${id} not found`);
    }
    return userGraphql;
  }

  public async findOneByEmail(
    currentUser: UserGraphql,
    email: string,
  ): Promise<UserGraphql> {
    if (!email || typeof email !== 'string') {
      throw new BadRequestException('Invalid email');
    }
    const ability = this.caslAbilityFactory.createForUser(currentUser);

    const userModel = await this.userModel.findOne({
      where: { email },
    });
    const userGraphql = Mapper.toGraphQL(userModel);

    if (ability.cannot(Action.READ, userGraphql)) {
      throw new ForbiddenException('You do not have permission to read users');
    }
    if (!userGraphql) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return userGraphql;
  }

  public async unprotectedFindOneByEmailAndPassword(
    email: string,
    password: string,
  ): Promise<UserGraphql> {
    if (!email || typeof email !== 'string') {
      throw new BadRequestException('Invalid email');
    }
    if (!password || typeof password !== 'string') {
      throw new BadRequestException('Invalid password');
    }
    const user = await this.userModel.findOne({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid password');
    }
    return Mapper.toGraphQL(user);
  }

  public async unprotectedCreate(
    type: UserType,
    name: string,
    email: string,
    password: string,
  ): Promise<UserGraphql> {
    email = UsersService.sanitizeInput(email);
    name = UsersService.sanitizeInput(name);
    password = UsersService.sanitizeInput(password);

    try {
      const existingUser = await this.userModel.findOne({
        where: { email: email },
      });
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }

      const hashed_password = await bcrypt.hash(
        password,
        bcryptConstants.saltOrRounds,
      );
      const newUser = await this.userModel.create({
        type: type,
        name: name,
        email: email,
        password: hashed_password,
      });

      if (!newUser) {
        throw new InternalServerErrorException('User not created');
      }

      return Mapper.toGraphQL(newUser);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to create user: ${error.message}`,
      );
    }
  }

  public async update(
    currentUser: UserGraphql,
    id: string,
    type: UserType,
    name: string,
    email: string,
    password: string,
  ): Promise<UserGraphql> {
    const ability = this.caslAbilityFactory.createForUser(currentUser);
    email = UsersService.sanitizeInput(email);
    name = UsersService.sanitizeInput(name);
    password = UsersService.sanitizeInput(password);

    const authUser = new UserGraphql();
    authUser.id = id;

    if (ability.cannot(Action.UPDATE, authUser)) {
      throw new ForbiddenException(
        'You do not have permission to update users',
      );
    }
    if (type === UserType.ADMIN) {
      throw new ForbiddenException('You cannot update user type to admin');
    }

    const hashedPassword = await bcrypt.hash(
      password,
      bcryptConstants.saltOrRounds,
    );
    try {
      const updatedUser = await this.userModel.sequelize.transaction(
        async (transaction) => {
          const user = await this.userModel.findByPk(id, { transaction });

          if (!user) {
            throw new NotFoundException(`User #${id} not found`);
          }
          const updatedUser = await user.update(
            {
              type: type,
              name: name,
              email: email,
              password: hashedPassword,
            },
            {
              transaction,
            },
          );
          return updatedUser;
        },
      );
      return Mapper.toGraphQL(updatedUser);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to update user: ${error.message}`,
      );
    }
  }

  public async delete(currentUser: UserGraphql, id: string): Promise<boolean> {
    const ability = this.caslAbilityFactory.createForUser(currentUser);

    const authUser = new UserGraphql();
    authUser.id = id;

    if (ability.cannot(Action.DELETE, authUser)) {
      throw new ForbiddenException(
        'You do not have permission to delete users',
      );
    }
    try {
      const user = await this.userModel.findByPk(id);

      if (!user) {
        throw new NotFoundException(`User #${id} not found`);
      }
      await user.destroy();

      return true;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        `Failed to delete user: ${error.message}`,
      );
    }
  }

  private static sanitizeInput(input: string): string {
    input = input?.toLowerCase().replace(/\s/g, '');
    return input;
  }
}
