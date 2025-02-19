import { TestBed, Mocked } from '@suites/unit';
import { AuthGuard } from './auth.guard';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { ContextType } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common/interfaces';
import { GqlExecutionContext } from '@nestjs/graphql';

describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  let mockJwtService: Mocked<JwtService>;
  const mockRequest: any = {
    headers: {
      authorization: 'Bearer test-token',
    },
  };

  beforeEach(async () => {
    const { unit, unitRef } = await TestBed.solitary(AuthGuard).compile();

    jest.mock('@nestjs/graphql', () => ({
      GqlExecutionContext: {
        create: jest.fn(),
      },
    }));
    GqlExecutionContext.create = jest.fn().mockReturnValue({
      getContext: () => ({
        req: mockRequest,
      }),
    });

    authGuard = unit;
    mockJwtService = unitRef.get(JwtService);
  });

  describe('canActivate', () => {
    // Successfully attaches user payload to request object
    it('should attach user payload to request object when valid token provided', async () => {
      // given
      const mockPayload = {
        id: '1',
        type: 'STUDENT',
        name: 'Test User',
        email: 'mail@gmail.com',
      };
      const mockContext: ExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
        getHandler: () => null,
        getClass: () => null,
        getType: () => 'http' as ContextType,
        getArgs: () => [],
        getContext() {
          return {
            req: mockRequest,
          };
        },
      } as any as ExecutionContext;

      mockJwtService.verifyAsync.mockResolvedValue(mockPayload);

      // when
      await authGuard.canActivate(mockContext);

      // then
      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith('test-token', {
        secret: jwtConstants.secret,
      });
      expect(mockRequest['user']).toEqual(mockPayload);
    });
  });
});
