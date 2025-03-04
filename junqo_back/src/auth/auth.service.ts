import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SignUpDTO } from './dto/sign-up.dto';
import { ProfilesService } from '../profiles/profiles.service';
import { UsersService } from '../users/users.service';
import { UserDTO } from '../users/dto/user.dto';
import { CreateStudentProfileDTO } from '../profiles/dto/student-profile.dto';
import { AuthPayloadDTO } from './dto/auth-payload.dto';
import { UserType } from '../users/dto/user-type.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly profilesService: ProfilesService,
    private readonly jwtService: JwtService,
  ) {}

  public async signUp(signUpInput: SignUpDTO): Promise<AuthPayloadDTO> {
    if (signUpInput.type === UserType.ADMIN) {
      throw new UnauthorizedException('You cannot create an admin user');
    }
    if (signUpInput.password.length < 8) {
      throw new UnauthorizedException('Password must be at least 8 characters');
    }

    const user: UserDTO = await this.usersService.create(signUpInput);
    if (signUpInput.type === UserType.STUDENT) {
      const createStudentProfileDto: CreateStudentProfileDTO =
        new CreateStudentProfileDTO({
          userId: user.id,
          name: user.name,
        });
      await this.profilesService.createStudentProfile(
        user,
        createStudentProfileDto,
      );
    }

    const payload = {
      sub: user.id,
      username: user.name,
      userType: user.type,
      email: user.email,
    };
    const token = await this.jwtService.signAsync(payload);
    delete user.hashedPassword;
    return { token, user: user };
  }

  public async signIn(
    email: string,
    password: string,
  ): Promise<AuthPayloadDTO> {
    let user: UserDTO = null;

    try {
      user = await this.usersService.findOneByEmail(email);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new UnauthorizedException('Invalid email or password');
      }
      throw error;
    }

    if (user == null) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid: boolean = await this.usersService.comparePassword(
      password,
      user,
    );

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
    delete user.hashedPassword;
    return { token, user: user };
  }
}
