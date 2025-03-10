import { Mutation, Resolver, Args, Query } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { Public } from './../auth/is_public.decorator';
import {
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { AuthPayload, UserType } from './../graphql.schema';
import { SignUpDTO } from './dto/sign-up.dto';
import { validateOrReject } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { SignInDTO } from './dto/sign-in.dto';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}
  private readonly logger = new Logger(AuthResolver.name);

  @Public()
  @Mutation(() => AuthPayload)
  public async signUp(
    @Args('type') type: UserType,
    @Args('name') name: string,
    @Args('email') email: string,
    @Args('password') password: string,
  ): Promise<AuthPayload> {
    const signUpDto: SignUpDTO = plainToInstance(SignUpDTO, {
      type,
      name,
      email,
      password,
    });

    try {
      await validateOrReject(signUpDto);
    } catch (errors) {
      throw new BadRequestException(errors);
    }

    const authPayload: AuthPayload = await this.authService.signUp(signUpDto);
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
  @Mutation(() => AuthPayload)
  public async signIn(
    @Args('email') email: string,
    @Args('password') password: string,
  ): Promise<AuthPayload> {
    const signInDto: SignInDTO = plainToInstance(SignInDTO, {
      email,
      password,
    });

    try {
      await validateOrReject(signInDto);
    } catch (errors) {
      throw new BadRequestException(errors);
    }
    const authPayload: AuthPayload = await this.authService.signIn(signInDto);

    if (!authPayload) {
      this.logger.error('Failed sign-in attempt');
      throw new InternalServerErrorException('Failed to sign in');
    }
    return authPayload;
  }

  @Query(() => Boolean)
  public async isLoggedIn(): Promise<boolean> {
    return true;
  }
}
