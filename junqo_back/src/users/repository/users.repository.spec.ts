import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { UsersRepository } from './users.repository';
import { UserModel } from './models/user.model';
import { CreateUserDTO, UserDTO } from '../dto/user.dto';
import { UserType } from '../dto/user-type.enum';

describe('UsersRepository', () => {
  let repository: UsersRepository;
  let mockUserModel: any;

  beforeEach(async () => {
    mockUserModel = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findByPk: jest.fn(),
      update: jest.fn(),
      destroy: jest.fn(),
      toUserDTO: jest.fn(),
      sequelize: {
        transaction: jest.fn((transaction) => transaction()),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersRepository,
        {
          provide: getModelToken(UserModel),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    repository = module.get<UsersRepository>(UsersRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDTO = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        type: UserType.STUDENT,
      };
      const expectedUser: UserDTO = {
        id: 'e69cc25b-0cc4-4032-83c2-0d34c84318ba',
        type: UserType.STUDENT,
        name: 'Test User',
        email: 'test@example.com',
        hashedPassword:
          '9f40fc5e51daeef6ef4e4343b8946536c5a267b30c1ea4d314f67e9f2b6d9704',
      };
      const createdUser: UserModel = {
        ...expectedUser,
        ...mockUserModel,
      };

      createdUser.toUserDTO = jest.fn().mockResolvedValue(expectedUser);
      mockUserModel.create.mockResolvedValue(createdUser);

      const result = await repository.create(createUserDto);
      expect(result).toEqual(expectedUser);
      expect(createdUser.toUserDTO).toHaveBeenCalled();
      expect(mockUserModel.create).toHaveBeenCalledWith(createUserDto);
    });
  });
});
