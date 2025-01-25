import { Mutation, Resolver, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { Public } from './../auth/is_public.decorator';
import { Logger } from '@nestjs/common';
import { AuthPayload, UserType } from './../graphql.schema';

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
    const authPayload = await this.authService.signUp({
      type,
      name,
      email,
      password,
    });
    if (!authPayload) {
      const error = new Error('Authentication failed');
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
    const authPayload = await this.authService.signIn(email, password);
    if (!authPayload) {
      this.logger.error('Failed to sign in');
      return null;
    }
    return authPayload;
  }
}
