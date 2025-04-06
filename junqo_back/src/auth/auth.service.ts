import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SignUpDTO } from './dto/sign-up.dto';
import { UsersService } from '../users/users.service';
import { PublicUserDTO, UserDTO } from '../users/dto/user.dto';
import { CreateStudentProfileDTO } from '../student-profiles/dto/student-profile.dto';
import { AuthPayloadDTO, TokenPayloadDTO } from './dto/auth-payload.dto';
import { UserType } from '../users/dto/user-type.enum';
import { SignInDTO } from './dto/sign-in.dto';
import { plainToInstance } from 'class-transformer';
import { AuthUserDTO } from '../shared/dto/auth-user.dto';
import { StudentProfilesService } from '../student-profiles/student-profiles.service';
import { CreateCompanyProfileDTO } from '../company-profiles/dto/company-profile.dto';
import { CreateSchoolProfileDTO } from '../school-profiles/dto/school-profile.dto';
import { CompanyProfilesService } from '../company-profiles/company-profiles.service';
import { SchoolProfilesService } from '../school-profiles/school-profiles.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly studentProfilesService: StudentProfilesService,
    private readonly companyProfilesService: CompanyProfilesService,
    private readonly schoolProfilesService: SchoolProfilesService,
  ) {}

  public async signUp(signUpInput: SignUpDTO): Promise<AuthPayloadDTO> {
    if (signUpInput.type === UserType.ADMIN) {
      throw new ForbiddenException('You cannot create an admin user');
    }
    if (signUpInput.password.length < 8) {
      throw new UnauthorizedException('Password must be at least 8 characters');
    }

    const authUser: AuthUserDTO = plainToInstance(AuthUserDTO, signUpInput, {
      excludeExtraneousValues: true,
    });
    const user: UserDTO = await this.usersService.create(authUser, signUpInput);

    switch (signUpInput.type) {
      case UserType.STUDENT:
        const createStudentProfileDto: CreateStudentProfileDTO =
          plainToInstance(CreateStudentProfileDTO, {
            userId: user.id,
            name: user.name,
          });

        await this.studentProfilesService.create(user, createStudentProfileDto);
        break;
      case UserType.COMPANY:
        const createCompanyProfileDto: CreateCompanyProfileDTO =
          plainToInstance(CreateCompanyProfileDTO, {
            userId: user.id,
            name: user.name,
          });

        await this.companyProfilesService.create(user, createCompanyProfileDto);
        break;
      case UserType.SCHOOL:
        const createSchoolProfileDto: CreateSchoolProfileDTO = plainToInstance(
          CreateSchoolProfileDTO,
          {
            userId: user.id,
            name: user.name,
          },
        );

        await this.schoolProfilesService.create(user, createSchoolProfileDto);
        break;
    }
    const publicUser: PublicUserDTO = plainToInstance(PublicUserDTO, user, {
      excludeExtraneousValues: true,
    });

    const payload = {
      sub: publicUser.id,
      userName: publicUser.name,
      userType: publicUser.type,
      email: publicUser.email,
    };
    const token = await this.jwtService.signAsync(payload);
    return plainToInstance(AuthPayloadDTO, { token, user: publicUser });
  }

  public async signIn(signInInput: SignInDTO): Promise<AuthPayloadDTO> {
    let user: UserDTO = null;

    try {
      user = await this.usersService.findOneByEmail(signInInput.email);
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
      signInInput.password,
      user,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const publicUser: PublicUserDTO = plainToInstance(PublicUserDTO, user, {
      excludeExtraneousValues: true,
    });

    const payload: TokenPayloadDTO = {
      sub: publicUser.id,
      userName: publicUser.name,
      userType: publicUser.type,
      email: publicUser.email,
    };
    const token = await this.jwtService.signAsync(payload);
    return plainToInstance(AuthPayloadDTO, { token, user: publicUser });
  }
}
