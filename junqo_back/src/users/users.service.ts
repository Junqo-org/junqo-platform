import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './models/user.model';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
  ) {}

  public async findAll(): Promise<User[]> {
    try {
      return await this.userModel.findAll();
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to fetch users: ${error.message}`,
      );
    }
  }

  public async findOneById(id: string): Promise<User> {
    if (!id || typeof id !== 'string') {
      throw new BadRequestException('Invalid user ID');
    }
    const user = await this.userModel.findByPk(id);

    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }
    return user;
  }

  public async create(createUserInput: CreateUserInput): Promise<User> {
    try {
      const existingUser = await this.userModel.findOne({
        where: { email: createUserInput.email },
      });
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }

      createUserInput = this.sanitizeUserInput(createUserInput);
      const newUser = await this.userModel.create({
        name: createUserInput.name,
        email: createUserInput.email,
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

  public async update(
    id: string,
    updateUserInput: UpdateUserInput,
  ): Promise<User> {
    try {
      return await this.userModel.sequelize.transaction(async (transaction) => {
        const user = await this.findOneById(id);
        if (!user) {
          throw new NotFoundException(`User #${id} not found`);
        }
        updateUserInput = this.sanitizeUserInput(updateUserInput);
        await user.update(updateUserInput, { transaction });
        return user;
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to update user: ${error.message}`,
      );
    }
  }

  public async delete(id: string): Promise<boolean> {
    try {
      const user = await this.findOneById(id);
      await user.destroy();
      return true;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        `Failed to delete user: ${error.message}`,
      );
    }
  }

  private sanitizeUserInput(
    userInput: CreateUserInput | UpdateUserInput,
  ): CreateUserInput {
    let { name, email } = userInput;

    name = name?.trim();
    email = email?.toLowerCase().replace(/\s/g, '');
    return { name, email };
  }
}
