import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { CaslAbilityFactory, Actions } from './../casl/casl-ability.factory';
import { UsersRepository } from './repository/users.repository';
import { AuthUserDTO } from '../shared/dto/auth-user.dto';
import { UserType } from './dto/user-type.enum';
import { CreateUserDTO, UpdateUserDTO, UserDTO } from './dto/user.dto';
import { UserIdDTO } from './../casl/dto/user-id.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    private readonly caslAbilityFactory: CaslAbilityFactory,
    private readonly usersRepository: UsersRepository,
  ) {}

  public async findAll(currentUser: AuthUserDTO): Promise<UserDTO[]> {
    const ability = this.caslAbilityFactory.createForUser(currentUser);

    if (ability.cannot(Actions.READ, AuthUserDTO)) {
      throw new ForbiddenException('You do not have permission to read users');
    }
    try {
      const users: UserDTO[] = await this.usersRepository.findAll();

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

  public async findOneById(
    currentUser: AuthUserDTO,
    id: string,
  ): Promise<UserDTO> {
    if (!id || typeof id !== 'string') {
      throw new BadRequestException('Invalid user ID');
    }
    const ability = this.caslAbilityFactory.createForUser(currentUser);

    const authUser = new UserIdDTO(id);

    if (ability.cannot(Actions.READ, authUser)) {
      throw new ForbiddenException('You do not have permission to read users');
    }
    const user = await this.usersRepository.findOneById(id);

    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }
    return user;
  }

  public async findOneByEmail(email: string): Promise<UserDTO> {
    if (!email || typeof email !== 'string') {
      throw new BadRequestException('Invalid email');
    }

    const user: UserDTO = await this.usersRepository.findOneByEmail(email);

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  public async create(createUserDto: CreateUserDTO): Promise<UserDTO> {
    try {
      const newUser = await this.usersRepository.create(createUserDto);

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
    currentUser: AuthUserDTO,
    updateData: UpdateUserDTO,
  ): Promise<UserDTO> {
    const ability = this.caslAbilityFactory.createForUser(currentUser);

    const authUser = new UserIdDTO(currentUser.id);

    if (ability.cannot(Actions.UPDATE, authUser)) {
      throw new ForbiddenException(
        'You do not have permission to update users',
      );
    }
    if (updateData.type === UserType.ADMIN) {
      throw new ForbiddenException('You cannot update user type to admin');
    }
    try {
      const updatedUser = await this.usersRepository.update({
        id: currentUser.id,
        type: updateData.type,
        name: updateData.name,
        email: updateData.email,
        password: updateData.password,
      });
      return updatedUser;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to update user: ${error.message}`,
      );
    }
  }

  public async delete(currentUser: AuthUserDTO, id: string): Promise<boolean> {
    const ability = this.caslAbilityFactory.createForUser(currentUser);

    const authUser = new UserIdDTO(currentUser.id);

    if (ability.cannot(Actions.DELETE, authUser)) {
      throw new ForbiddenException(
        'You do not have permission to delete users',
      );
    }
    try {
      const user = await this.usersRepository.delete(id);

      if (!user) {
        throw new NotFoundException(`User #${id} not found`);
      }

      return true;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        `Failed to delete user: ${error.message}`,
      );
    }
  }

  public async comparePassword(
    password: string,
    userDto: UserDTO,
  ): Promise<boolean> {
    const result = await bcrypt.compare(password, userDto.hashedPassword);

    return result;
  }
}
