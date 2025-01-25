import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UserModel } from './models/user.model';
import { CreateUserDTO } from './../dto/create-user.dto';
import { UpdateUserDTO } from './../dto/update-user.dto';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(UserModel)
    private readonly userModel: typeof UserModel,
  ) {}

  public async findAll(): Promise<UserModel[]> {
    try {
      const users = await this.userModel.findAll();

      if (!users) {
        throw new NotFoundException('Users not found');
      }
      return users;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to fetch users: ${error.message}`,
      );
    }
  }

  public async findOneById(id: string): Promise<UserModel> {
    if (!id || typeof id !== 'string') {
      throw new BadRequestException('Invalid user ID');
    }
    const userModel = await this.userModel.findByPk(id);

    if (!userModel) {
      throw new NotFoundException(`User #${id} not found`);
    }
    return userModel;
  }

  public async findOneByEmail(email: string): Promise<UserModel> {
    if (!email || typeof email !== 'string') {
      throw new BadRequestException('Invalid email');
    }
    const userModel = await this.userModel.findOne({
      where: { email },
    });
    if (!userModel) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return userModel;
  }

  public async create(createUserDto: CreateUserDTO): Promise<UserModel> {
    try {
      const existingUser = await this.userModel.findOne({
        where: { email: createUserDto.email },
      });
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
      const newUser = await this.userModel.create({
        type: createUserDto.type,
        name: createUserDto.name,
        email: createUserDto.email,
        password: createUserDto.password,
      });

      if (!newUser) {
        throw new InternalServerErrorException('User not created');
      }
      return newUser;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to create user: ${error.message}`,
      );
    }
  }

  public async update(updateUserDto: UpdateUserDTO): Promise<UserModel> {
    try {
      const updatedUser = await this.userModel.sequelize.transaction(
        async (transaction) => {
          const user = await this.userModel.findByPk(updateUserDto.id, {
            transaction,
          });

          if (!user) {
            throw new NotFoundException(`User #${updateUserDto.id} not found`);
          }
          const updatedUser = await user.update(
            {
              type: updateUserDto.type,
              name: updateUserDto.name,
              email: updateUserDto.email,
              password: updateUserDto.password,
            },
            {
              transaction,
            },
          );
          return updatedUser;
        },
      );
      return updatedUser;
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
}
