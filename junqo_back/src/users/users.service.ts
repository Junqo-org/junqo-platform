import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User as UserModel } from './models/user.model';
import {
  CreateUserInput,
  UpdateUserInput,
  User as UserGraphql,
} from 'src/graphql.schema';
import * as bcrypt from 'bcrypt';
import { bcryptConstants } from 'src/auth/constants';
import { Mapper } from './mapper/mapper';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UserModel)
    private readonly userModel: typeof UserModel,
  ) {}

  public async findAll(): Promise<UserGraphql[]> {
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

  public async findOneById(id: string): Promise<UserGraphql> {
    if (!id || typeof id !== 'string') {
      throw new BadRequestException('Invalid user ID');
    }
    const user = await this.userModel.findByPk(id);

    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }
    return Mapper.toGraphQL(user);
  }

  public async findOneByEmail(email: string): Promise<UserGraphql> {
    if (!email || typeof email !== 'string') {
      throw new BadRequestException('Invalid email');
    }
    const user = await this.userModel.findOne({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return Mapper.toGraphQL(user);
  }

  public async findOneByEmailAndPassword(
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

  public async create(createUserInput: CreateUserInput): Promise<UserGraphql> {
    try {
      const existingUser = await this.userModel.findOne({
        where: { email: createUserInput.email },
      });
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }

      createUserInput = UsersService.sanitizeUserInput(createUserInput);
      const hashed_password = await bcrypt.hash(
        createUserInput.password,
        bcryptConstants.saltOrRounds,
      );
      const newUser = await this.userModel.create({
        type: createUserInput.type,
        name: createUserInput.name,
        email: createUserInput.email,
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
    id: string,
    updateUserInput: UpdateUserInput,
  ): Promise<UserGraphql> {
    try {
      const updatedUser = await this.userModel.sequelize.transaction(
        async (transaction) => {
          const user = await this.userModel.findByPk(id, { transaction });

          if (!user) {
            throw new NotFoundException(`User #${id} not found`);
          }
          updateUserInput = UsersService.sanitizeUserInput(updateUserInput);
          const updatedUser = await user.update(updateUserInput, {
            transaction,
          });
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

  public async delete(id: string): Promise<boolean> {
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

  private static sanitizeUserInput(
    userInput: CreateUserInput | UpdateUserInput,
  ): CreateUserInput {
    let { name, email } = userInput;

    name = name?.trim();
    email = email?.toLowerCase().replace(/\s/g, '');
    return {
      type: userInput.type,
      name: name,
      email: email,
      password: userInput.password,
    };
  }
}
