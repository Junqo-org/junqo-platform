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
import * as bcrypt from 'bcrypt';
import { bcryptConstants } from './../../auth/constants';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(UserModel)
    private readonly userModel: typeof UserModel,
  ) {}

  public async findAll(): Promise<UserDTO[]> {
    try {
      const userModels: UserModel[] = await this.userModel.findAll();

      if (!userModels || userModels.length === 0) {
        throw new NotFoundException('Users not found');
      }
      const users: UserDTO[] = userModels.map((userModel) =>
        userModel.toUserDTO(),
      );

      return users;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
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

    if (!userModel) {
      throw new NotFoundException(`User #${id} not found`);
    }
    const user: UserDTO = userModel.toUserDTO();

    return user;
  }

  public async findOneByEmail(email: string): Promise<UserDTO> {
    if (!email || typeof email !== 'string') {
      throw new BadRequestException('Invalid email');
    }
    const userModel: UserModel = await this.userModel.findOne({
      where: { email },
    });

    if (!userModel) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    const user: UserDTO = userModel.toUserDTO();

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
      const hashedPassword = await bcrypt.hash(
        createUserDto.password,
        bcryptConstants.saltOrRounds,
      );
      const newUserModel: UserModel = await this.userModel.create({
        type: createUserDto.type,
        name: createUserDto.name,
        email: createUserDto.email,
        hashedPassword: hashedPassword,
      });

      if (!newUserModel) {
        throw new InternalServerErrorException('User not created');
      }
      const newUser: UserDTO = newUserModel.toUserDTO();

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

  public async update(
    id: string,
    updateUserDto: UpdateUserDTO,
  ): Promise<UserDTO> {
    let hashedPassword: string = null;

    try {
      const updatedUserModel: UserModel =
        await this.userModel.sequelize.transaction(async (transaction) => {
          const user = await this.userModel.findByPk(id, {
            transaction,
          });

          if (!user) {
            throw new NotFoundException(`User #${id} not found`);
          }

          if (updateUserDto.password != null) {
            hashedPassword = await bcrypt.hash(
              updateUserDto.password,
              bcryptConstants.saltOrRounds,
            );
          }

          const updatedUser = await user.update(
            {
              ...(updateUserDto.type != undefined && {
                type: updateUserDto.type,
              }),
              ...(updateUserDto.name != undefined && {
                name: updateUserDto.name,
              }),
              ...(updateUserDto.email != undefined && {
                email: updateUserDto.email,
              }),
              ...(hashedPassword != undefined && {
                hashedPassword: hashedPassword,
              }),
            },
            {
              transaction,
            },
          );
          return updatedUser;
        });

      if (!updatedUserModel) {
        throw new InternalServerErrorException('Fetched user is null');
      }
      const updatedUser: UserDTO = updatedUserModel.toUserDTO();

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
