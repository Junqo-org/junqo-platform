import { TestBed, Mocked } from '@suites/unit';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserType } from '../users/dto/user-type.enum';
import { AuthPayloadDTO } from './dto/auth-payload.dto';
import { UserDTO } from '../users/dto/user.dto';
import { UsersService } from '../users/users.service';
import { ProfilesService } from '../profiles/profiles.service';
import { SignUpDTO } from './dto/sign-up.dto';

jest.mock('./../users/repository/models/user.model');

describe('AuthService', () => {
  let authService: AuthService;
  let mockUsersService: Mocked<UsersService>;
  let mockProfileService: Mocked<ProfilesService>;
  let mockJwtService: Mocked<JwtService>;

  beforeEach(async () => {
    const { unit, unitRef } = await TestBed.solitary(AuthService).compile();

    authService = unit;
    mockUsersService = unitRef.get(UsersService);
    mockProfileService = unitRef.get(ProfilesService);
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
      const signUpInput: SignUpDTO = {
        name: userData.name,
        email: userData.email,
        type: userData.type,
        password: 'password123',
      };
      const createdUser: UserDTO = {
        ...userData,
        hashedPassword:
          'EF92B778BAFE771E89245B89ECBC08A44A4E166C06659911881F383D4473E94F',
      };

      const mockAuthPayload: AuthPayloadDTO = {
        token: 'test-token',
        user: userData,
      };

      mockUsersService.create.mockResolvedValue(createdUser);
      mockProfileService.createStudentProfile.mockResolvedValue({
        userId: userData.id,
        name: userData.name,
      });
      mockJwtService.signAsync.mockResolvedValue('test-token');

      // when
      const result = await authService.signUp(signUpInput);

      // then
      expect(mockUsersService.create).toHaveBeenCalledWith(signUpInput);
      expect(mockProfileService.createStudentProfile).toHaveBeenCalledWith(
        createdUser,
        {
          userId: userData.id,
          name: userData.name,
        },
      );
      expect(result).toEqual(mockAuthPayload);
    });
  });
});
