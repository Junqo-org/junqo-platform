import { Mutation, Resolver, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { Public } from './../auth/is_public.decorator';
import { AuthPayload, UserType } from './../graphql.schema';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Public()
  @Mutation(() => AuthPayload)
  public async signUp(
    @Args('type') type: UserType,
    @Args('name') name: string,
    @Args('email') email: string,
    @Args('password') password: string,
  ): Promise<AuthPayload> {
    const authPayload = await this.authService.signUp(
      type,
      name,
      email,
      password,
    );
    if (!authPayload) {
      console.error('Failed to sign up');
      return null;
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
      console.error('Failed to sign in');
      return null;
    }
    return authPayload;
  }
}
