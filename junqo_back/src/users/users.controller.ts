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
import { ApiBearerAuth, ApiOperation, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { DashboardStatisticsDTO } from './dto/user-statistics.dto';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly studentProfilesService: StudentProfilesService,
    private readonly companyProfilesService: CompanyProfilesService,
    private readonly schoolProfilesService: SchoolProfilesService,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiOkResponse({ description: 'User profile retrieved successfully', type: UserDTO })
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

  @Get('me/statistics')
  @ApiOperation({ summary: 'Get dashboard statistics for current user' })
  @ApiOkResponse({ 
    description: 'Dashboard statistics retrieved successfully', 
    type: DashboardStatisticsDTO 
  })
  async getMyStatistics(
    @CurrentUser() currentUser: AuthUserDTO,
  ): Promise<DashboardStatisticsDTO> {
    return this.usersService.getDashboardStatistics(currentUser);
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
        break;
      case UserType.COMPANY:
        isSuccess = await this.companyProfilesService.delete(currentUser);
        break;
      case UserType.SCHOOL:
        isSuccess = await this.schoolProfilesService.delete(currentUser);
        break;
    }

    if (!isSuccess) {
      throw new InternalServerErrorException(
        `Failed to delete user #${currentUser.id} profile`,
      );
    }

    return { isSuccessful: isSuccess };
  }
}
