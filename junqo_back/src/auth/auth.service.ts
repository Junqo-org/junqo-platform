import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthPayload, CreateUserInput, UserType } from 'src/graphql.schema';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  public async signUp(createUserInput: CreateUserInput): Promise<AuthPayload> {
    if (createUserInput.type === UserType.ADMIN) {
      throw new UnauthorizedException('You cannot create an admin user');
    }
    const user = await this.userService.create(createUserInput);
    const payload = { sub: user.id, username: user.name, userType: user.type };
    const token = await this.jwtService.signAsync(payload);
    return { token, user };
  }

  public async signIn(email: string, pass: string): Promise<AuthPayload> {
    const user = await this.userService.findOneByEmailAndPassword(email, pass);

    if (user == null) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, username: user.name, userType: user.type };
    const token = await this.jwtService.signAsync(payload);
    return { token, user };
  }
}
