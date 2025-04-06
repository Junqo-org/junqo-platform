import { TestBed, Mocked } from '@suites/unit';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserType } from '../users/dto/user-type.enum';
import { AuthPayloadDTO } from './dto/auth-payload.dto';
import { PublicUserDTO, UserDTO } from '../users/dto/user.dto';
import { UsersService } from '../users/users.service';
import { SignUpDTO } from './dto/sign-up.dto';
import { plainToInstance } from 'class-transformer';
import { StudentProfileDTO } from '../student-profiles/dto/student-profile.dto';
import { AuthUserDTO } from '../shared/dto/auth-user.dto';
import { StudentProfilesService } from '../student-profiles/student-profiles.service';

jest.mock('./../users/repository/models/user.model');

describe('AuthService', () => {
  let authService: AuthService;
  let mockUsersService: Mocked<UsersService>;
  let mockStudentProfileService: Mocked<StudentProfilesService>;
  let mockJwtService: Mocked<JwtService>;

  beforeEach(async () => {
    const { unit, unitRef } = await TestBed.solitary(AuthService).compile();

    authService = unit;
    mockUsersService = unitRef.get(UsersService);
    mockStudentProfileService = unitRef.get(StudentProfilesService);
    mockJwtService = unitRef.get(JwtService);
  });

  describe('signUp', () => {
    // Successfully creates new user and returns AuthPayload with token and user data
    it('should create new user and return AuthPayload when valid data provided', async () => {
      // given
      const userData: PublicUserDTO = plainToInstance(PublicUserDTO, {
        id: 'e69cc25b-0cc4-4032-83c2-0d34c84318ba',
        type: UserType.STUDENT,
        name: 'Test User',
        email: 'mail@mail.com',
      });
      const signUpInput: SignUpDTO = plainToInstance(SignUpDTO, {
        name: userData.name,
        email: userData.email,
        type: userData.type,
        password: 'password123',
      });
      const createdUser: UserDTO = plainToInstance(UserDTO, {
        ...userData,
        hashedPassword:
          'EF92B778BAFE771E89245B89ECBC08A44A4E166C06659911881F383D4473E94F',
      });
      const authUser: AuthUserDTO = plainToInstance(AuthUserDTO, signUpInput, {
        excludeExtraneousValues: true,
      });

      const mockAuthPayload: AuthPayloadDTO = plainToInstance(AuthPayloadDTO, {
        token: 'test-token',
        user: userData,
      });

      mockUsersService.create.mockResolvedValue(createdUser);
      mockStudentProfileService.create.mockResolvedValue(
        plainToInstance(StudentProfileDTO, {
          userId: userData.id,
          name: userData.name,
        }),
      );
      mockJwtService.signAsync.mockResolvedValue('test-token');

      // when
      const result = await authService.signUp(signUpInput);

      // then
      expect(mockUsersService.create).toHaveBeenCalledWith(
        authUser,
        signUpInput,
      );
      expect(mockStudentProfileService.create).toHaveBeenCalledWith(
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
