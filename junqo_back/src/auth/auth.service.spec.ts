import { TestBed, Mocked } from '@suites/unit';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersRepository } from './../users/repository/users.repository';
import { UserModel } from './../users/repository/models/user.model';
import { UserType } from './../users/user-type.enum';
import { AuthPayloadDTO } from './dto/auth-payload.dto';
import { UserMapper } from './../users/mapper/user-mapper';

jest.mock('./../users/repository/models/user.model');

describe('AuthService', () => {
  let authService: AuthService;
  let mockUsersRepository: Mocked<UsersRepository>;
  let mockJwtService: Mocked<JwtService>;

  beforeEach(async () => {
    const { unit, unitRef } = await TestBed.solitary(AuthService).compile();

    authService = unit;
    mockUsersRepository = unitRef.get(UsersRepository);
    mockJwtService = unitRef.get(JwtService);
  });

  describe('signUp', () => {
    // Successfully creates new user and returns AuthPayload with token and user data
    it('should create new user and return AuthPayload when valid data provided', async () => {
      // given
      const mockUser = new UserModel();
      mockUser.id = '1';
      mockUser.type = UserType.STUDENT;
      mockUser.name = 'Test User';
      mockUser.email = 'mail@mail.com';

      const domainUser = UserMapper.toDomainUser(mockUser);

      const mockAuthPayload: AuthPayloadDTO = {
        token: 'test-token',
        user: domainUser,
      };

      mockUser.password = 'password123';
      mockUsersRepository.create.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue('test-token');

      // when
      const result = await authService.signUp({
        name: 'Test User',
        email: 'mail@mail.com',
        type: UserType.STUDENT,
        password: 'password123',
      });

      // then
      expect(mockUsersRepository.create).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'mail@mail.com',
        type: UserType.STUDENT,
        password: expect.stringContaining('$2b$'),
      });
      expect(result).toEqual(mockAuthPayload);
    });
  });
});
