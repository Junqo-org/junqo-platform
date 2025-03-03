import { TestBed, Mocked } from '@suites/unit';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserType } from '../users/dto/user-type.enum';
import { AuthPayloadDTO } from './dto/auth-payload.dto';
import { UserDTO } from '../users/dto/user.dto';
import { UsersService } from '../users/users.service';

jest.mock('./../users/repository/models/user.model');

describe('AuthService', () => {
  let authService: AuthService;
  let mockUsersService: Mocked<UsersService>;
  let mockJwtService: Mocked<JwtService>;

  beforeEach(async () => {
    const { unit, unitRef } = await TestBed.solitary(AuthService).compile();

    authService = unit;
    mockUsersService = unitRef.get(UsersService);
    mockJwtService = unitRef.get(JwtService);
  });

  describe('signUp', () => {
    // Successfully creates new user and returns AuthPayload with token and user data
    it('should create new user and return AuthPayload when valid data provided', async () => {
      // given
      const userData = {
        id: 'e69cc25b-0cc4-4032-83c2-0d34c84318ba',
        type: UserType.STUDENT,
        name: 'Test User',
        email: 'mail@mail.com',
      };
      const userDTO: UserDTO = {
        ...userData,
        hashedPassword: 'password123',
      };

      const mockAuthPayload: AuthPayloadDTO = {
        token: 'test-token',
        user: userData,
      };

      mockUsersService.create.mockResolvedValue(userDTO);
      mockJwtService.signAsync.mockResolvedValue('test-token');

      // when
      const result = await authService.signUp({
        name: 'Test User',
        email: 'mail@mail.com',
        type: UserType.STUDENT,
        password: 'password123',
      });

      // then
      expect(mockUsersService.create).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'mail@mail.com',
        type: UserType.STUDENT,
        password: expect.stringContaining('$2b$'),
      });
      expect(result).toEqual(mockAuthPayload);
    });
  });
});
