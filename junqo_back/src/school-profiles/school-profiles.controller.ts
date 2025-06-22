import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { SchoolProfilesService } from './school-profiles.service';
import { AuthUserDTO } from '../shared/dto/auth-user.dto';
import { CurrentUser } from '../users/users.decorator';
import {
  UpdateSchoolProfileDTO,
  SchoolProfileDTO,
} from './dto/school-profile.dto';
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
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  SchoolProfileQueryDTO,
  SchoolProfileQueryOutputDTO,
} from './dto/school-profile-query.dto';

@ApiTags('school-profiles')
@ApiBearerAuth()
@Controller('school-profiles')
export class SchoolProfilesController {
  constructor(private readonly schoolProfilesService: SchoolProfilesService) {}

  @Get()
  @ApiOperation({ summary: 'Get school profiles by query parameters' })
  @ApiOkResponse({
    description: 'School profiles retrieved successfully',
    type: SchoolProfileQueryOutputDTO,
  })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  @ApiForbiddenResponse({
    description: 'User not authorized to view school profiles',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  public async findByQuery(
    @CurrentUser() currentUser: AuthUserDTO,
    @Query() query: SchoolProfileQueryDTO,
  ): Promise<SchoolProfileQueryOutputDTO> {
    return this.schoolProfilesService.findByQuery(currentUser, query);
  }

  @Get('my')
  @ApiOperation({ summary: "Get current user's school profile" })
  @ApiOkResponse({
    description: 'School profile retrieved successfully',
    type: SchoolProfileDTO,
  })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  @ApiNotFoundResponse({ description: 'School profile not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  public async findMy(@CurrentUser() currentUser: AuthUserDTO) {
    return this.schoolProfilesService.findOneById(currentUser, currentUser.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a school profile by ID' })
  @ApiParam({
    name: 'id',
    description: 'ID of the school profile',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    description: 'School profile retrieved successfully',
    type: SchoolProfileDTO,
  })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  @ApiForbiddenResponse({
    description: 'User not authorized to view this school profile',
  })
  @ApiNotFoundResponse({ description: 'School profile not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  public async findOne(
    @CurrentUser() currentUser: AuthUserDTO,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.schoolProfilesService.findOneById(currentUser, id);
  }

  @Patch('my')
  @ApiOperation({ summary: "Update current user's school profile" })
  @ApiBody({
    type: UpdateSchoolProfileDTO,
    description: 'Updated school profile data',
  })
  @ApiOkResponse({
    description: 'School profile updated successfully',
    type: SchoolProfileDTO,
  })
  @ApiBadRequestResponse({ description: 'Invalid request data' })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  @ApiNotFoundResponse({ description: 'School profile not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  public async updateMy(
    @CurrentUser() currentUser: AuthUserDTO,
    @Body() updateSchoolProfileDto: UpdateSchoolProfileDTO,
  ) {
    return this.schoolProfilesService.update(
      currentUser,
      updateSchoolProfileDto,
    );
  }
}
