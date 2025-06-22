import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ExperiencesService } from './experiences.service';
import {
  CreateExperienceDTO,
  ExperienceDTO,
  UpdateExperienceDTO,
} from './dto/experience.dto';
import { CurrentUser } from '../users/users.decorator';
import { AuthUserDTO } from '../shared/dto/auth-user.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNoContentResponse,
  ApiInternalServerErrorResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';

@ApiTags('experiences')
@ApiBearerAuth()
@Controller('experiences')
export class ExperiencesController {
  constructor(private readonly experiencesService: ExperiencesService) {}

  @Post('my')
  @ApiOperation({ summary: 'Create a new experience for current user' })
  @ApiCreatedResponse({
    description: 'Experience created successfully',
    type: ExperienceDTO,
  })
  @ApiBadRequestResponse({ description: 'Invalid request data' })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  @ApiForbiddenResponse({
    description: 'User not authorized to create experiences',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiBody({
    type: CreateExperienceDTO,
    description: 'Experience data to create',
  })
  async createMy(
    @CurrentUser() currentUser: AuthUserDTO,
    @Body() createExperienceDto: CreateExperienceDTO,
  ): Promise<ExperienceDTO> {
    return this.experiencesService.create(currentUser, createExperienceDto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get all experiences for current user' })
  @ApiOkResponse({
    description: 'List of experiences',
    type: [ExperienceDTO],
  })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  @ApiForbiddenResponse({
    description: 'User not authorized to view these experiences',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async findMy(
    @CurrentUser() currentUser: AuthUserDTO,
  ): Promise<ExperienceDTO[]> {
    return this.experiencesService.findByStudentProfileId(
      currentUser,
      currentUser.id,
    );
  }

  @Get('profile/:profileId')
  @ApiOperation({ summary: 'Get all experiences for a student profile' })
  @ApiOkResponse({
    description: 'List of experiences',
    type: [ExperienceDTO],
  })
  @ApiParam({
    name: 'profileId',
    description: 'ID of the student profile',
    type: String,
    required: true,
  })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  @ApiForbiddenResponse({
    description: 'User not authorized to view these experiences',
  })
  @ApiNotFoundResponse({ description: 'Profile not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async findByProfile(
    @CurrentUser() currentUser: AuthUserDTO,
    @Param('profileId') profileId: string,
  ): Promise<ExperienceDTO[]> {
    return this.experiencesService.findByStudentProfileId(
      currentUser,
      profileId,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an experience by ID' })
  @ApiOkResponse({
    description: 'Experience details',
    type: ExperienceDTO,
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the experience',
    type: String,
    required: true,
  })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  @ApiForbiddenResponse({
    description: 'User not authorized to view this experience',
  })
  @ApiNotFoundResponse({ description: 'Experience not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async findOne(
    @CurrentUser() currentUser: AuthUserDTO,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<ExperienceDTO> {
    return this.experiencesService.findOneById(currentUser, id);
  }

  @Patch('my/:id')
  @ApiOperation({ summary: 'Update an experience' })
  @ApiOkResponse({
    description: 'Experience updated successfully',
    type: ExperienceDTO,
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the experience to update',
    type: String,
    required: true,
  })
  @ApiBody({
    type: UpdateExperienceDTO,
    description: 'Updated experience data',
  })
  @ApiBadRequestResponse({ description: 'Invalid request data' })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  @ApiForbiddenResponse({
    description: 'User not authorized to update this experience',
  })
  @ApiNotFoundResponse({ description: 'Experience not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async update(
    @CurrentUser() currentUser: AuthUserDTO,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateExperienceDto: UpdateExperienceDTO,
  ): Promise<ExperienceDTO> {
    return this.experiencesService.update(currentUser, id, updateExperienceDto);
  }

  @Delete('my/:id')
  @ApiOperation({ summary: 'Delete an experience' })
  @ApiNoContentResponse({
    description: 'Experience deleted successfully',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the experience to delete',
    type: String,
    required: true,
  })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  @ApiForbiddenResponse({
    description: 'User not authorized to delete this experience',
  })
  @ApiNotFoundResponse({ description: 'Experience not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async delete(
    @CurrentUser() currentUser: AuthUserDTO,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<{ isSuccessful: boolean }> {
    const isSuccess = await this.experiencesService.delete(currentUser, id);

    return { isSuccessful: isSuccess };
  }
}
