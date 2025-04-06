import { TestBed, Mocked } from '@suites/unit';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserType } from '../users/dto/user-type.enum';
import { plainToInstance } from 'class-transformer';
import { SignInDTO } from './dto/sign-in.dto';
import { SignUpDTO } from './dto/sign-up.dto';
import { AuthPayloadDTO, TokenPayloadDTO } from './dto/auth-payload.dto';
import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';
import { jwtConstants } from './constants';

const signUpInput: SignUpDTO = plainToInstance(SignUpDTO, {
  name: 'Test User',
  email: 'test@test.com',
  type: UserType.STUDENT,
  password: 'password123',
});

const signInInput: SignInDTO = plainToInstance(SignInDTO, {
  email: 'test@test.com',
  password: 'password123',
});

const mockAuthPayload: AuthPayloadDTO = plainToInstance(AuthPayloadDTO, {
  token: 'test-token',
  user: {
    id: '1',
    type: UserType.STUDENT,
    name: 'Test User',
    email: 'test@test.com',
  },
});

describe('AuthController', () => {
  let authController: AuthController;
  let mockedAuthService: Mocked<AuthService>;
  let mockedJwtService: Mocked<JwtService>;

  beforeEach(async () => {
    const { unit, unitRef } = await TestBed.solitary(AuthController).compile();

    authController = unit;
    mockedAuthService = unitRef.get(AuthService);
    mockedJwtService = unitRef.get(JwtService);
  });

  describe('signUp', () => {
    // Successfully creates new user and returns AuthPayload with token and user data
    it('should create new user and return AuthPayload when valid data provided', async () => {
      // given
      mockedAuthService.signUp.mockResolvedValue(mockAuthPayload);

      // when
      const result = await authController.signUp(signUpInput);

      // then
      expect(mockedAuthService.signUp).toHaveBeenCalledWith(signUpInput);
      expect(result).toEqual(mockAuthPayload);
    });
  });

  describe('signIn', () => {
    // Successfully logs in and returns AuthPayload with token and user data
    it('should return AuthPayload when valid data provided', async () => {
      // given
      mockedAuthService.signIn.mockResolvedValue(mockAuthPayload);

      // when
      const result = await authController.signIn(signInInput);

      // then
      expect(mockedAuthService.signIn).toHaveBeenCalledWith(signInInput);
      expect(result).toEqual(mockAuthPayload);
    });
  });

  describe('isLoggedIn', () => {
    it('should return true if valid token', async () => {
      const token = 'token';
      mockedJwtService.verifyAsync.mockResolvedValueOnce(
        plainToInstance(TokenPayloadDTO, {
          sub: 'sub',
          userName: 'userName',
          userType: 'userType',
          email: 'email',
        }),
      );

      // when
      const result = await authController.isLoggedIn(`Bearer ${token}`);

      // then
      expect(mockedJwtService.verifyAsync).toHaveBeenCalledWith(token, {
        secret: jwtConstants.secret,
      });
      expect(result.isLoggedIn).toBe(true);
    });
  });

  it('should return false if invalid token', async () => {
    const token = 'invalid-token';
    mockedJwtService.verifyAsync.mockImplementationOnce(async (tokenInput) => {
      if (tokenInput == token) {
        throw new JsonWebTokenError('error');
      }
      return plainToInstance(TokenPayloadDTO, {
        sub: 'sub',
        userName: 'userName',
        userType: 'userType',
        email: 'email',
      });
    });

    // when
    const result = await authController.isLoggedIn(`Bearer ${token}`);

    // then
    expect(mockedJwtService.verifyAsync).toHaveBeenCalledWith(token, {
      secret: jwtConstants.secret,
    });
    expect(result.isLoggedIn).toBe(false);
  });

  it('should return false if expired token', async () => {
    const token = 'invalid-token';
    mockedJwtService.verifyAsync.mockImplementation(async (tokenInput) => {
      if (tokenInput == token) {
        throw new TokenExpiredError('error', new Date());
      }
      return plainToInstance(TokenPayloadDTO, {
        sub: 'sub',
        userName: 'userName',
        userType: 'userType',
        email: 'email',
      });
    });

    // when
    const result = await authController.isLoggedIn(`Bearer ${token}`);

    // then
    expect(mockedJwtService.verifyAsync).toHaveBeenCalledWith(token, {
      secret: jwtConstants.secret,
    });
    expect(result.isLoggedIn).toBe(false);
  });

  it('should return false if invalid token decrypted', async () => {
    const token = 'invalid-token';
    mockedJwtService.verifyAsync.mockResolvedValueOnce(
      plainToInstance(TokenPayloadDTO, {
        sub: 'sub',
        userName: 'userName',
        email: 'email',
      }),
    );

    // when
    const result = await authController.isLoggedIn(`Bearer ${token}`);

    // then
    expect(mockedJwtService.verifyAsync).toHaveBeenCalledWith(token, {
      secret: jwtConstants.secret,
    });
    expect(result.isLoggedIn).toBe(false);
  });
});
