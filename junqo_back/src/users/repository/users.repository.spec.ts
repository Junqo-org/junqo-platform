import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { UsersRepository } from './users.repository';
import { UserModel } from './models/user.model';
import { CreateUserDTO } from '../dto/user.dto';
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
      const expectedUser = { id: '1', ...createUserDto };
      mockUserModel.create.mockResolvedValue(expectedUser);

      const result = await repository.create(createUserDto);
      expect(result).toEqual(expectedUser);
      expect(mockUserModel.create).toHaveBeenCalledWith(createUserDto);
    });
  });
});
