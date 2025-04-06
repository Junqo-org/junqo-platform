import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { CaslAbilityFactory, Actions } from './../casl/casl-ability.factory';
import { UsersRepository } from './repository/users.repository';
import { AuthUserDTO } from '../shared/dto/auth-user.dto';
import { UserType } from './dto/user-type.enum';
import { CreateUserDTO, UpdateUserDTO, UserDTO } from './dto/user.dto';
import { UserResource } from '../casl/dto/user-resource.dto';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UsersService {
  constructor(
    private readonly caslAbilityFactory: CaslAbilityFactory,
    private readonly usersRepository: UsersRepository,
  ) {}

  /**
   * Retrieves all users from the system if the current user has appropriate permissions.
   *
   * @param currentUser - The authenticated user making the request
   * @returns A Promise that resolves to an array of UserDTO objects
   * @throws ForbiddenException if the current user lacks permission to read users
   * @throws NotFoundException if no users are found in the system
   * @throws InternalServerErrorException if there's an error fetching the users
   */
  public async findAll(currentUser: AuthUserDTO): Promise<UserDTO[]> {
    const ability = this.caslAbilityFactory.createForUser(currentUser);

    if (ability.cannot(Actions.READ, new UserResource({ id: null }))) {
      throw new ForbiddenException('You do not have permission to read users');
    }
    try {
      const users: UserDTO[] = await this.usersRepository.findAll();

      if (!users || users.length === 0) {
        throw new NotFoundException('Users not found');
      }
      return users;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (error instanceof ForbiddenException) throw error;
      throw new InternalServerErrorException(
        `Failed to fetch users: ${error.message}`,
      );
    }
  }

  /**
   * Finds a user by their ID and checks if the current user has permission to read it.
   *
   * @param currentUser - The authenticated user making the request
   * @param id - The ID of the user to find
   * @returns A Promise that resolves to the found user's data
   * @throws ForbiddenException if the current user lacks permission to read the user
   * @throws NotFoundException if no user is found with the given ID
   * @throws InternalServerErrorException if there's an error fetching the users
   */
  public async findOneById(
    currentUser: AuthUserDTO,
    id: string,
  ): Promise<UserDTO> {
    const ability = this.caslAbilityFactory.createForUser(currentUser);

    try {
      const user: UserDTO = await this.usersRepository.findOneById(id);
      const userResource: UserResource = plainToInstance(UserResource, user, {
        excludeExtraneousValues: true,
      });

      if (ability.cannot(Actions.READ, userResource)) {
        throw new ForbiddenException(
          'You do not have permission to read this user',
        );
      }

      if (!user) {
        throw new NotFoundException(`User #${id} not found`);
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (error instanceof ForbiddenException) throw error;
      throw new InternalServerErrorException(
        `Failed to fetch user: ${error.message}`,
      );
    }
  }

  /**
   * Retrieves a user by their email address
   * /!\ unprotected, should only be used in environment when we don't
   * resolve the value to the final user
   *
   * @param email - The email address to search for
   * @returns Promise resolving to the UserDTO if found
   * @throws NotFoundException if no user is found with the given email
   * @throws InternalServerErrorException if there's an error fetching the users
   */
  public async findOneByEmail(email: string): Promise<UserDTO> {
    try {
      const user: UserDTO = await this.usersRepository.findOneByEmail(email);

      if (!user) {
        throw new NotFoundException(`User with email ${email} not found`);
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        `Failed to fetch user: ${error.message}`,
      );
    }
  }

  /**
   * Creates a new user in the system.
   *
   * @param createUserDto - The data for creating a new user
   * @returns A Promise that resolves to the created UserDTO
   * @throws ForbiddenException if the user lacks permission to create user
   * @throws ConflictException if there's a conflict with existing user data
   * @throws InternalServerErrorException if user creation fails
   */
  public async create(
    currentUser: AuthUserDTO,
    createUserDto: CreateUserDTO,
  ): Promise<UserDTO> {
    const ability = this.caslAbilityFactory.createForUser(currentUser);
    const userResource: UserResource = plainToInstance(
      UserResource,
      createUserDto,
      { excludeExtraneousValues: true },
    );

    if (ability.cannot(Actions.CREATE, userResource)) {
      throw new ForbiddenException(
        'You do not have permission to create this user',
      );
    }

    try {
      const newUser = await this.usersRepository.create(createUserDto);

      if (!newUser) {
        throw new InternalServerErrorException('User not created');
      }

      return newUser;
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      if (error instanceof ForbiddenException) throw error;
      throw new InternalServerErrorException(
        `Failed to create user: ${error.message}`,
      );
    }
  }

  /**
   * Updates a user from the system if the current user has appropriate permissions.
   *
   * @param currentUser - The authenticated user making the request
   * @param updateData - The data to update for the user, with the id of the user to update
   * @returns A Promise that resolves to the updated UserDTO
   * @throws ForbiddenException if the user lacks permission or tries to set admin type
   * @throws NotFoundException if the user to update is not found
   * @throws InternalServerErrorException if the update operation fails
   */
  public async update(
    currentUser: AuthUserDTO,
    id: string,
    updateData: UpdateUserDTO,
  ): Promise<UserDTO> {
    const ability = this.caslAbilityFactory.createForUser(currentUser);

    const user: UserDTO = await this.findOneById(currentUser, id);
    const userResource: UserResource = plainToInstance(UserResource, user, {
      excludeExtraneousValues: true,
    });

    if (ability.cannot(Actions.UPDATE, userResource)) {
      throw new ForbiddenException(
        'You do not have permission to update this user',
      );
    }

    if (updateData.type === UserType.ADMIN) {
      throw new ForbiddenException('You cannot update user type to admin');
    }

    try {
      const updatedUser = await this.usersRepository.update(id, updateData);
      return updatedUser;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (error instanceof ForbiddenException) throw error;
      throw new InternalServerErrorException(
        `Failed to update user: ${error.message}`,
      );
    }
  }

  /**
   * Deletes a user from the system if the current user has appropriate permissions.
   *
   * @param currentUser - The authenticated user making the request
   * @param id - The ID of the user to delete
   * @returns A Promise that resolves to true if deletion is successful
   * @throws ForbiddenException if the current user lacks permission to delete users
   * @throws NotFoundException if the user to delete is not found
   * @throws InternalServerErrorException if the deletion operation fails
   */
  public async delete(currentUser: AuthUserDTO, id: string): Promise<boolean> {
    const ability = this.caslAbilityFactory.createForUser(currentUser);

    try {
      const user: UserDTO = await this.findOneById(currentUser, id);
      const userResource: UserResource = plainToInstance(UserResource, user, {
        excludeExtraneousValues: true,
      });

      if (ability.cannot(Actions.DELETE, userResource)) {
        throw new ForbiddenException(
          'You do not have permission to delete this user',
        );
      }

      const isSuccess = await this.usersRepository.delete(id);

      if (!isSuccess) {
        throw new InternalServerErrorException(
          `Error while deleting offer ${id}`,
        );
      }

      return true;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (error instanceof ForbiddenException) throw error;
      throw new InternalServerErrorException(
        `Failed to delete user: ${error.message}`,
      );
    }
  }

  /**
   * Compares a plain text password with a user's hashed password.
   *
   * @param password - The plain text password to compare
   * @param userDto - The user DTO containing the hashed password
   * @returns A Promise that resolves to true if passwords match, false otherwise
   */
  public async comparePassword(
    password: string,
    userDto: UserDTO,
  ): Promise<boolean> {
    const result = await bcrypt.compare(password, userDto.hashedPassword);

    return result;
  }
}
