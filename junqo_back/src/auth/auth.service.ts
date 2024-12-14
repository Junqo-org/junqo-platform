import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthPayload, UserType } from 'src/graphql.schema';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  public async signUp(
    type: UserType,
    name: string,
    email: string,
    password: string,
  ): Promise<AuthPayload> {
    if (type === UserType.ADMIN) {
      throw new UnauthorizedException('You cannot create an admin user');
    }
    const user = await this.userService.unprotectedCreate(
      type,
      name,
      email,
      password,
    );
    const payload = {
      sub: user.id,
      username: user.name,
      userType: user.type,
      email: user.email,
    };
    const token = await this.jwtService.signAsync(payload);
    return { token, user };
  }

  public async signIn(email: string, password: string): Promise<AuthPayload> {
    const user = await this.userService.unprotectedFindOneByEmailAndPassword(
      email,
      password,
    );

    if (user == null) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, username: user.name, userType: user.type };
    const token = await this.jwtService.signAsync(payload);
    return { token, user };
  }
}
