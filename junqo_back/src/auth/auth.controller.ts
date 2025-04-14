import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Logger,
  Post,
  Headers,
} from '@nestjs/common';
import { Public } from './is_public.decorator';
import { AuthPayloadDTO, TokenPayloadDTO } from './dto/auth-payload.dto';
import { SignUpDTO } from './dto/sign-up.dto';
import { AuthService } from './auth.service';
import { SignInDTO } from './dto/sign-in.dto';
import { AuthGuard } from './auth.guard';
import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
  ) {}
  private readonly logger = new Logger(AuthController.name);

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({
    type: SignUpDTO,
    description: 'User registration data',
  })
  @ApiCreatedResponse({
    description: 'User registered successfully',
    type: AuthPayloadDTO,
  })
  @ApiBadRequestResponse({ description: 'Invalid registration data' })
  @ApiInternalServerErrorResponse({ description: 'Failed to register user' })
  public async signUp(@Body() signUpDto: SignUpDTO): Promise<AuthPayloadDTO> {
    const authPayload: AuthPayloadDTO =
      await this.authService.signUp(signUpDto);

    if (!authPayload) {
      const error = new InternalServerErrorException('Authentication failed');
      error.name = 'AuthenticationError';
      error.message = 'Failed to sign up';
      this.logger.error('Failed to sign up');
      throw error;
    }
    return authPayload;
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Log in a user' })
  @ApiBody({
    type: SignInDTO,
    description: 'User login credentials',
  })
  @ApiOkResponse({
    description: 'User logged in successfully',
    type: AuthPayloadDTO,
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @ApiInternalServerErrorResponse({ description: 'Failed to log in' })
  public async signIn(@Body() signInDto: SignInDTO): Promise<AuthPayloadDTO> {
    const authPayload: AuthPayloadDTO =
      await this.authService.signIn(signInDto);

    if (!authPayload) {
      this.logger.error('Failed sign-in attempt');
      throw new InternalServerErrorException('Failed to sign in');
    }
    return authPayload;
  }

  @Public()
  @Get('is-logged-in')
  @ApiOperation({ summary: 'Check if user is logged in' })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Login status',
    schema: {
      type: 'object',
      properties: {
        isLoggedIn: {
          type: 'boolean',
          description: 'Whether the user is logged in',
        },
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Error checking login status',
  })
  public async isLoggedIn(
    @Headers('Authorization') authHeader: string,
  ): Promise<{ isLoggedIn: boolean }> {
    const token = AuthGuard.extractTokenFromHeader(authHeader);

    if (token == null) {
      return { isLoggedIn: false };
    }

    try {
      const payload: TokenPayloadDTO =
        await this.jwtService.verifyAsync<TokenPayloadDTO>(token, {
          secret: jwtConstants.secret,
        });

      if (
        payload.email == null ||
        payload.sub == null ||
        payload.userType == null ||
        payload.userName == null
      ) {
        return { isLoggedIn: false };
      }
      return { isLoggedIn: true };
    } catch (error) {
      if (
        error instanceof JsonWebTokenError ||
        error instanceof TokenExpiredError
      ) {
        return { isLoggedIn: false };
      }
      throw error;
    }
  }
}
