import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Patch,
} from '@nestjs/common';
import { AuthUserDTO } from '../shared/dto/auth-user.dto';
import { CurrentUser } from './users.decorator';
import { UpdateUserDTO, UserDTO } from './dto/user.dto';
import { UsersService } from './users.service';
import { StudentProfilesService } from '../student-profiles/student-profiles.service';
import { CompanyProfilesService } from '../company-profiles/company-profiles.service';
import { SchoolProfilesService } from '../school-profiles/school-profiles.service';
import { UserType } from './dto/user-type.enum';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly studentProfilesService: StudentProfilesService,
    private readonly companyProfilesService: CompanyProfilesService,
    private readonly schoolProfilesService: SchoolProfilesService,
  ) {}

  @Get('me')
  async findMe(@CurrentUser() currentUser: AuthUserDTO): Promise<UserDTO> {
    const user: UserDTO = await this.usersService.findOneById(
      currentUser,
      currentUser.id,
    );

    if (!user) {
      throw new NotFoundException(`Current user #${currentUser.id} not found`);
    }

    delete user.hashedPassword;
    return user;
  }

  @Patch('me')
  async updateMe(
    @CurrentUser() currentUser: AuthUserDTO,
    @Body() updateUserDto: UpdateUserDTO,
  ): Promise<UserDTO> {
    const user: UserDTO = await this.usersService.update(
      currentUser,
      currentUser.id,
      updateUserDto,
    );

    if (!user) {
      throw new NotFoundException(`Current user #${currentUser.id} not found`);
    }

    delete user.hashedPassword;
    return user;
  }

  @Delete('me')
  async deleteMe(
    @CurrentUser() currentUser: AuthUserDTO,
  ): Promise<{ isSuccessful: boolean }> {
    let isSuccess: boolean = await this.usersService.delete(
      currentUser,
      currentUser.id,
    );

    if (!isSuccess) {
      throw new InternalServerErrorException(
        `Failed to delete user #${currentUser.id}`,
      );
    }

    switch (currentUser.type) {
      case UserType.STUDENT:
        isSuccess = await this.studentProfilesService.delete(currentUser);
      case UserType.COMPANY:
        isSuccess = await this.companyProfilesService.delete(currentUser);
      case UserType.SCHOOL:
        isSuccess = await this.schoolProfilesService.delete(currentUser);
    }

    if (!isSuccess) {
      throw new InternalServerErrorException(
        `Failed to delete user #${currentUser.id} profile`,
      );
    }

    return { isSuccessful: isSuccess };
  }
}
