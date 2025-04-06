import { Actions, CaslAbilityFactory } from '../casl/casl-ability.factory';
import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { AuthUserDTO } from '../shared/dto/auth-user.dto';
import { UserType } from './dto/user-type.enum';
import { plainToInstance } from 'class-transformer';
import { Mocked } from '@suites/doubles.jest';
import { TestBed } from '@suites/unit';
import { CreateUserDTO, UpdateUserDTO, UserDTO } from './dto/user.dto';
import { UsersService } from './users.service';
import { UsersRepository } from './repository/users.repository';
import { UserResource } from '../casl/dto/user-resource.dto';

const usersList: UserDTO[] = [
  plainToInstance(UserDTO, {
    id: 'a69cc25b-0cc4-4032-83c2-0d34c84318ba',
    type: UserType.COMPANY,
    email: 'company@test.com',
    name: 'CompanyUser',
    hashedPassword: '',
  }),
  plainToInstance(UserDTO, {
    id: 'b69cc25b-0cc4-4032-83c2-0d34c84318ba',
    type: UserType.STUDENT,
    email: 'student@test.com',
    name: 'StudentUser',
    hashedPassword: '',
  }),
  plainToInstance(UserDTO, {
    id: 'c69cc25b-0cc4-4032-83c2-0d34c84318ba',
    type: UserType.SCHOOL,
    email: 'school@test.com',
    name: 'SchoolUser',
    hashedPassword: '',
  }),
];

const authUsersList: AuthUserDTO[] = usersList.map((user) =>
  plainToInstance(AuthUserDTO, {
    id: user.id,
    type: user.type,
    name: user.name,
    email: user.email,
  }),
);

describe('UsersService', () => {
  let usersService: UsersService;
  let usersRepository: Mocked<UsersRepository>;

  beforeEach(async () => {
    const { unit, unitRef } = await TestBed.sociable(UsersService)
      .expose(CaslAbilityFactory)
      .compile();

    usersService = unit;
    usersRepository = unitRef.get(UsersRepository);
  });

  it('should be defined', () => {
    expect(usersService).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      usersRepository.findAll.mockResolvedValue(usersList);

      const result = await usersService.findAll(authUsersList[0]);
      expect(result).toBe(usersList);
      expect(usersRepository.findAll).toHaveBeenCalled();
    });

    it('should throw NotFoundException if there is no user', async () => {
      usersRepository.findAll.mockResolvedValue([]);

      await expect(usersService.findAll(authUsersList[0])).rejects.toThrow(
        NotFoundException,
      );
      expect(usersRepository.findAll).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user cannot read user', async () => {
      usersRepository.findAll.mockResolvedValue(usersList);

      await expect(usersService.findAll(authUsersList[1])).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('findOneById', () => {
    it('should return a user by ID', async () => {
      usersRepository.findOneById.mockResolvedValue(usersList[0]);

      const result = await usersService.findOneById(
        authUsersList[0],
        usersList[0].id,
      );
      expect(result).toBe(usersList[0]);
      expect(usersRepository.findOneById).toHaveBeenCalledWith(usersList[0].id);
    });

    it("should throw NotFoundException if the user don't exists", async () => {
      usersRepository.findOneById.mockRejectedValueOnce(
        new NotFoundException(),
      );

      await expect(
        usersService.findOneById(authUsersList[0], usersList[0].id),
      ).rejects.toThrow(NotFoundException);
      expect(usersRepository.findOneById).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user cannot read user', async () => {
      usersRepository.findOneById.mockResolvedValue(usersList[0]);

      await expect(
        usersService.findOneById(authUsersList[0], usersList[0].id),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('create', () => {
    it('should create an user', async () => {
      const createUserInput: CreateUserDTO = plainToInstance(
        CreateUserDTO,
        usersList[0],
        {
          excludeExtraneousValues: true,
        },
      );

      usersRepository.create.mockResolvedValue(usersList[0]);

      const result = await usersService.create(
        authUsersList[0],
        createUserInput,
      );
      expect(result).toBe(usersList[0]);
      expect(usersRepository.create).toHaveBeenCalledWith(createUserInput);
    });

    it('should throw ForbiddenException if user cannot create user', async () => {
      const createUserInput: CreateUserDTO = plainToInstance(
        CreateUserDTO,
        usersList[0],
        {
          excludeExtraneousValues: true,
        },
      );

      usersRepository.create.mockResolvedValue(usersList[0]);
      await expect(
        usersService.create(authUsersList[0], createUserInput),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update', () => {
    it('should update an user', async () => {
      const newData = {
        title: 'new title',
      };
      const updateUserInput: UpdateUserDTO = plainToInstance(
        UpdateUserDTO,
        newData,
        {
          excludeExtraneousValues: true,
        },
      );
      const expectedStudentProfile: UserDTO = plainToInstance(UserDTO, {
        ...usersList[0],
        ...newData,
      });

      usersRepository.findOneById.mockResolvedValue(usersList[0]);
      usersRepository.update.mockResolvedValue(expectedStudentProfile);

      const result = await usersService.update(
        authUsersList[0],
        usersList[0].id,
        updateUserInput,
      );
      expect(result).toBe(expectedStudentProfile);
      expect(usersRepository.update).toHaveBeenCalledWith(
        usersList[0].id,
        updateUserInput,
      );
    });

    it('should throw ForbiddenException if user cannot update user', async () => {
      const newData = {
        title: 'new title',
      };
      const updateUserInput: UpdateUserDTO = plainToInstance(
        UpdateUserDTO,
        newData,
      );
      const expectedStudentProfile: UserDTO = plainToInstance(UserDTO, {
        ...usersList[0],
        ...newData,
      });

      usersRepository.findOneById.mockResolvedValue(usersList[0]);
      usersRepository.update.mockResolvedValue(expectedStudentProfile);

      await expect(
        usersService.update(authUsersList[2], usersList[0].id, updateUserInput),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw InternalServerErrorException if update fails', async () => {
      const newData = {
        title: 'new title',
      };
      const updateUserInput: UpdateUserDTO = plainToInstance(
        UpdateUserDTO,
        newData,
      );

      usersRepository.findOneById.mockResolvedValue(usersList[0]);
      usersRepository.update.mockRejectedValue(new Error());

      await expect(
        usersService.update(
          authUsersList[0],
          authUsersList[0].id,
          updateUserInput,
        ),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('delete', () => {
    it('should delete an user', async () => {
      usersRepository.findOneById.mockResolvedValue(usersList[0]);
      usersRepository.delete.mockResolvedValue(true);

      const result = await usersService.delete(
        authUsersList[0],
        authUsersList[0].id,
      );
      expect(result).toBe(true);
      expect(usersRepository.delete).toHaveBeenCalledWith(usersList[0].id);
    });

    it('should throw ForbiddenException if user cannot read user', async () => {
      usersRepository.findOneById.mockResolvedValue(usersList[0]);
      usersRepository.delete.mockResolvedValue(true);

      await expect(
        usersService.delete(authUsersList[0], authUsersList[0].id),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw InternalServerErrorException if delete fails', async () => {
      usersRepository.findOneById.mockResolvedValue(usersList[0]);
      usersRepository.delete.mockRejectedValue(new Error());

      await expect(
        usersService.delete(authUsersList[0], authUsersList[0].id),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
