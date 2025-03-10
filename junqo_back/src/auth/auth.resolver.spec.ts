import { TestBed, Mocked } from '@suites/unit';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { UserType } from './../graphql.schema';

describe('AuthResolver', () => {
  let authResolver: AuthResolver;
  let mockAuthService: Mocked<AuthService>;

  beforeEach(async () => {
    const { unit, unitRef } = await TestBed.solitary(AuthResolver).compile();

    authResolver = unit;
    mockAuthService = unitRef.get(AuthService);
  });

  describe('signUp', () => {
    // Successfully creates new user and returns AuthPayload with token and user data
    it('should create new user and return AuthPayload when valid data provided', async () => {
      // given
      const mockAuthPayload = {
        token: 'test-token',
        user: {
          id: '1',
          type: UserType.STUDENT,
          name: 'Test User',
          email: 'test@test.com',
        },
      };
      mockAuthService.signUp.mockResolvedValue(mockAuthPayload);

      // when
      const result = await authResolver.signUp(
        UserType.STUDENT,
        'Test User',
        'test@test.com',
        'password123',
      );

      // then
      expect(mockAuthService.signUp).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@test.com',
        type: UserType.STUDENT,
        password: 'password123',
      });
      expect(result).toEqual(mockAuthPayload);
    });
  });

  describe('signIn', () => {
    // Successfully logs in and returns AuthPayload with token and user data
    it('should return AuthPayload when valid data provided', async () => {
      // given
      const mockAuthPayload = {
        token: 'test-token',
        user: {
          id: '1',
          type: UserType.STUDENT,
          name: 'Test User',
          email: 'test@test.com',
        },
      };
      mockAuthService.signIn.mockResolvedValue(mockAuthPayload);

      // when
      const result = await authResolver.signIn('test@test.com', 'password123');

      // then
      expect(mockAuthService.signIn).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'password123',
      });
      expect(result).toEqual(mockAuthPayload);
    });
  });

  describe('isLoggedIn', () => {
    // Always returns true
    it('should return true', async () => {
      // when
      const result = await authResolver.isLoggedIn();

      // then
      expect(result).toBe(true);
    });
  });
});
