import { Controller, Get, Body, Patch, Param, Query } from '@nestjs/common';
import { StudentProfilesService } from './student-profiles.service';
import { AuthUserDTO } from '../shared/dto/auth-user.dto';
import { CurrentUser } from '../users/users.decorator';
import {
  UpdateStudentProfileDTO,
  StudentProfileDTO,
} from './dto/student-profile.dto';
import {
  StudentProfileQueryDTO,
  StudentProfileQueryOutputDTO,
} from './dto/student-profile-query.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('student-profiles')
@ApiBearerAuth()
@Controller('student-profiles')
export class StudentProfilesController {
  constructor(
    private readonly studentProfilesService: StudentProfilesService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get student profiles by query parameters' })
  @ApiQuery({
    type: StudentProfileQueryDTO,
    description: 'Query parameters for filtering student profiles',
  })
  @ApiOkResponse({
    description: 'Student profiles retrieved successfully',
    type: StudentProfileQueryOutputDTO,
  })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  @ApiForbiddenResponse({
    description: 'User not authorized to view student profiles',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  public async findByQuery(
    @CurrentUser() currentUser: AuthUserDTO,
    @Query() query: StudentProfileQueryDTO,
  ): Promise<StudentProfileQueryOutputDTO> {
    return this.studentProfilesService.findByQuery(currentUser, query);
  }

  @Get('my')
  @ApiOperation({ summary: "Get current user's student profile" })
  @ApiOkResponse({
    description: 'Student profile retrieved successfully',
    type: StudentProfileDTO,
  })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  @ApiNotFoundResponse({ description: 'Student profile not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  public async findMy(@CurrentUser() currentUser: AuthUserDTO) {
    return this.studentProfilesService.findOneById(currentUser, currentUser.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a student profile by ID' })
  @ApiParam({
    name: 'id',
    description: 'ID of the student profile',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    description: 'Student profile retrieved successfully',
    type: StudentProfileDTO,
  })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  @ApiForbiddenResponse({
    description: 'User not authorized to view this student profile',
  })
  @ApiNotFoundResponse({ description: 'Student profile not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  public async findOne(
    @CurrentUser() currentUser: AuthUserDTO,
    @Param('id') id: string,
  ) {
    return this.studentProfilesService.findOneById(currentUser, id);
  }

  @Patch('my')
  @ApiOperation({ summary: "Update current user's student profile" })
  @ApiBody({
    type: UpdateStudentProfileDTO,
    description: 'Updated student profile data',
  })
  @ApiOkResponse({
    description: 'Student profile updated successfully',
    type: StudentProfileDTO,
  })
  @ApiBadRequestResponse({ description: 'Invalid request data' })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  @ApiNotFoundResponse({ description: 'Student profile not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  public async updateMy(
    @CurrentUser() currentUser: AuthUserDTO,
    @Body() updateStudentProfileDto: UpdateStudentProfileDTO,
  ) {
    return this.studentProfilesService.update(
      currentUser,
      updateStudentProfileDto,
    );
  }
}
