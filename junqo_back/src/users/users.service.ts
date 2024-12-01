import { Injectable, HttpException } from '@nestjs/common';
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
    return this.userModel.findAll();
  }

  public async findOneById(id: string): Promise<User> {
    const user = await this.userModel.findByPk(id);
    if (!user) {
      throw new HttpException(`User #${id} not found`, 404);
    }
    return user;
  }

  public async create(createUserInput: CreateUserInput): Promise<User> {
    try {
      const newUser = this.userModel.create({
        name: createUserInput.name,
        email: createUserInput.email,
      });
      if (!newUser) {
        throw new HttpException('User not created', 500);
      }
      return newUser;
    } catch (error) {
      throw new HttpException(error, 500);
    }
  }

  public async update(
    id: string,
    updateUserInput: UpdateUserInput,
  ): Promise<User> {
    const user = await this.findOneById(id);
    await user.update(updateUserInput);
    return user;
  }

  public async delete(id: string): Promise<any> {
    const user = await this.findOneById(id);
    await user.destroy();
  }
}
