import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { CaslAbilityFactory, Action } from './../casl/casl-ability.factory';
import { UsersRepository } from './repository/users.repository';
import { AuthUserDTO } from '../shared/dto/auth-user.dto';
import { DomainUser } from './users';
import { UserType } from './user-type.enum';
import { UserMapper } from './mapper/user-mapper';
import * as bcrypt from 'bcrypt';
import { bcryptConstants } from './../auth/constants';
import { UpdateUserDTO } from './dto/update-user.dto';
import { UserIdDTO } from './../casl/dto/user-id.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly caslAbilityFactory: CaslAbilityFactory,
    private readonly usersRepository: UsersRepository,
  ) {}

  public async findAll(currentUser: AuthUserDTO): Promise<DomainUser[]> {
    const ability = this.caslAbilityFactory.createForUser(currentUser);

    if (ability.cannot(Action.READ, AuthUserDTO)) {
      throw new ForbiddenException('You do not have permission to read users');
    }
    try {
      const users = await this.usersRepository.findAll();

      if (!users || users.length === 0) {
        throw new NotFoundException('Users not found');
      }
      return UserMapper.toDomainUsers(users);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to fetch users: ${error.message}`,
      );
    }
  }

  public async findOneById(
    currentUser: AuthUserDTO,
    id: string,
  ): Promise<DomainUser> {
    if (!id || typeof id !== 'string') {
      throw new BadRequestException('Invalid user ID');
    }
    const ability = this.caslAbilityFactory.createForUser(currentUser);

    const authUser = new AuthUserDTO();
    authUser.id = id;

    if (ability.cannot(Action.READ, authUser)) {
      throw new ForbiddenException('You do not have permission to read users');
    }
    const userModel = await this.usersRepository.findOneById(id);
    const domainUser = UserMapper.toDomainUser(userModel);

    if (!domainUser) {
      throw new NotFoundException(`User #${id} not found`);
    }
    return domainUser;
  }

  public async findOneByEmail(
    currentUser: AuthUserDTO,
    email: string,
  ): Promise<DomainUser> {
    if (!email || typeof email !== 'string') {
      throw new BadRequestException('Invalid email');
    }
    const ability = this.caslAbilityFactory.createForUser(currentUser);

    const userModel = await this.usersRepository.findOneByEmail(email);
    const userDomain = UserMapper.toDomainUser(userModel);

    if (ability.cannot(Action.READ, userDomain)) {
      throw new ForbiddenException('You do not have permission to read users');
    }
    if (!userDomain) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return userDomain;
  }

  public async create(
    type: UserType,
    name: string,
    email: string,
    password: string,
  ): Promise<DomainUser> {
    try {
      const hashed_password = await bcrypt.hash(
        password,
        bcryptConstants.saltOrRounds,
      );
      const newUser = await this.usersRepository.create({
        type: type,
        name: name,
        email: email,
        password: hashed_password,
      });

      if (!newUser) {
        throw new InternalServerErrorException('User not created');
      }

      return UserMapper.toDomainUser(newUser);
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
  ): Promise<DomainUser> {
    const ability = this.caslAbilityFactory.createForUser(currentUser);

    const authUser = new UserIdDTO(currentUser.id);

    if (ability.cannot(Action.UPDATE, authUser)) {
      throw new ForbiddenException(
        'You do not have permission to update users',
      );
    }
    if (updateData.type === UserType.ADMIN) {
      throw new ForbiddenException('You cannot update user type to admin');
    }

    const hashedPassword = await bcrypt.hash(
      updateData.password,
      bcryptConstants.saltOrRounds,
    );
    try {
      const updatedUser = await this.usersRepository.update({
        id: currentUser.id,
        type: updateData.type,
        name: updateData.name,
        email: updateData.email,
        password: hashedPassword,
      });
      return UserMapper.toDomainUser(updatedUser);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to update user: ${error.message}`,
      );
    }
  }

  public async delete(currentUser: AuthUserDTO, id: string): Promise<boolean> {
    const ability = this.caslAbilityFactory.createForUser(currentUser);

    const authUser = new UserIdDTO(currentUser.id);

    if (ability.cannot(Action.DELETE, authUser)) {
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
}
