import { TestBed, Mocked } from '@suites/unit';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './../users/users.service';
import { AuthPayload, User, UserType } from './../graphql.schema';

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
      const mockUser: User = {
        id: '1',
        type: UserType.STUDENT,
        name: 'Test User',
        email: 'mail@gmail.com',
      };
      const mockAuthPayload: AuthPayload = {
        token: 'test-token',
        user: mockUser,
      };

      mockUsersService.unprotectedCreate.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue('test-token');

      // when
      const result = await authService.signUp(
        UserType.STUDENT,
        'Test User',
        'mail@gmail.com',
        'password123',
      );

      // then
      expect(mockUsersService.unprotectedCreate).toHaveBeenCalledWith(
        UserType.STUDENT,
        'Test User',
        'mail@gmail.com',
        'password123',
      );
      expect(result).toEqual(mockAuthPayload);
    });
  });
});
