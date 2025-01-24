import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthPayload, UserType } from './../graphql.schema';
import { UsersRepository } from './../users/repository/users.repository';
import { SignUpDTO } from './dto/sign-up.dto';
import { UserMapper } from './../users/mapper/user-mapper';
import * as bcrypt from 'bcrypt';
import { bcryptConstants } from './constants';

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private jwtService: JwtService,
  ) {}

  public async signUp(signUpInput: SignUpDTO): Promise<AuthPayload> {
    if (signUpInput.type === UserType.ADMIN) {
      throw new UnauthorizedException('You cannot create an admin user');
    }

    if (signUpInput.password.length < 8) {
      throw new UnauthorizedException('Password must be at least 8 characters');
    }
    signUpInput.password = await bcrypt.hash(
      signUpInput.password,
      bcryptConstants.saltOrRounds,
    );
    const userModel = await this.usersRepository.create(signUpInput);
    const user = UserMapper.toDomainUser(userModel);
    const payload = {
      sub: user.id,
      username: user.name,
      userType: user.type,
      email: user.email,
    };
    const token = await this.jwtService.signAsync(payload);
    return { token, user: user.toJSON() };
  }

  public async signIn(email: string, password: string): Promise<AuthPayload> {
    const userModel = await this.usersRepository.findOneByEmail(email);

    if (userModel == null) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const user = UserMapper.toDomainUser(userModel);
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = {
      sub: user.id,
      username: user.name,
      userType: user.type,
      email: user.email,
    };
    const token = await this.jwtService.signAsync(payload);
    return { token, user: user.toJSON() };
  }
}
