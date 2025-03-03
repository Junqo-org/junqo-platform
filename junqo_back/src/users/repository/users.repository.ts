import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UserModel } from './models/user.model';
import { CreateUserDTO, UpdateUserDTO, UserDTO } from './../dto/user.dto';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(UserModel)
    private readonly userModel: typeof UserModel,
  ) {}

  public async findAll(): Promise<UserDTO[]> {
    try {
      const userModels: UserModel[] = await this.userModel.findAll();
      const users: UserDTO[] = userModels?.map((userModel) =>
        userModel?.toUserDTO(),
      );

      if (!users || users.length === 0) {
        throw new NotFoundException('Users not found');
      }
      return users;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to fetch users: ${error.message}`,
      );
    }
  }

  public async findOneById(id: string): Promise<UserDTO> {
    if (!id || typeof id !== 'string') {
      throw new BadRequestException('Invalid user ID');
    }
    const userModel: UserModel = await this.userModel.findByPk(id);
    const user: UserDTO = userModel?.toUserDTO();

    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }
    return user;
  }

  public async findOneByEmail(email: string): Promise<UserDTO> {
    if (!email || typeof email !== 'string') {
      throw new BadRequestException('Invalid email');
    }
    const userModel: UserModel = await this.userModel.findOne({
      where: { email },
    });
    const user: UserDTO = userModel?.toUserDTO();

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  public async create(createUserDto: CreateUserDTO): Promise<UserDTO> {
    try {
      const existingUser: UserModel = await this.userModel.findOne({
        where: { email: createUserDto.email },
      });
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
      const newUserModel: UserModel = await this.userModel.create({
        type: createUserDto.type,
        name: createUserDto.name,
        email: createUserDto.email,
        hashedPassword: createUserDto.password,
      });

      if (!newUserModel) {
        throw new InternalServerErrorException('User not created');
      }
      const newUser: UserDTO = newUserModel?.toUserDTO();
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

  public async update(updateUserDto: UpdateUserDTO): Promise<UserDTO> {
    try {
      const updatedUserModel: UserModel =
        await this.userModel.sequelize.transaction(async (transaction) => {
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
              hashedPassword: updateUserDto.password,
            },
            {
              transaction,
            },
          );
          return updatedUser;
        });
      const updatedUser: UserDTO = updatedUserModel?.toUserDTO();
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
