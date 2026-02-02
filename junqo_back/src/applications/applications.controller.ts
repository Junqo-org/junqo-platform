import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../users/users.decorator';
import { ApplicationDTO, UpdateApplicationDTO } from './dto/application.dto';
import { AuthUserDTO } from '../shared/dto/auth-user.dto';
import { UserType } from '../users/dto/user-type.enum';
import {
  ApplicationQueryDTO,
  ApplicationQueryOutputDTO,
} from './dto/application-query.dto';
import {
  BulkUpdateApplicationsDTO,
  BulkUpdateResultDTO,
} from './dto/bulk-update-applications.dto';
import { PreAcceptApplicationDTO } from './dto/pre-accept-application.dto';

@ApiBearerAuth()
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) { }

  @Get()
  @ApiOperation({ summary: 'Get applications by query parameters' })
  @ApiOkResponse({
    description: 'Applications retrieved successfully',
    type: ApplicationQueryOutputDTO,
  })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  @ApiForbiddenResponse({
    description: 'User not authorized to fetch corresponding applications',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  public async findByQuery(
    @CurrentUser() currentUser: AuthUserDTO,
    @Query() query: ApplicationQueryDTO,
  ): Promise<ApplicationQueryOutputDTO> {
    return this.applicationsService.findByQuery(currentUser, query);
  }

  @Get('my')
  @ApiOperation({
    summary: `If the logged in user is of type STUDENT:
    Return applications that the logged in user has applied to.

    If the logged in user is of type COMPANY:
    Return applications linked to the company profile`,
  })
  @ApiOkResponse({
    description: 'List of application retrieved successfully',
    type: [ApplicationDTO],
  })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  @ApiForbiddenResponse({
    description: 'User not authorized to view applied offers',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  public async getMy(
    @CurrentUser() currentUser: AuthUserDTO,
  ): Promise<ApplicationDTO[]> {
    if (currentUser.type === UserType.STUDENT) {
      return this.applicationsService.findByStudentId(
        currentUser,
        currentUser.id,
      );
    }
    if (currentUser.type === UserType.COMPANY) {
      return this.applicationsService.findByCompanyId(
        currentUser,
        currentUser.id,
      );
    }
    throw new ForbiddenException(
      'Invalid user type. Must be either STUDENT or COMPANY',
    );
  }

  @Post('apply/:offerId')
  @ApiOperation({ summary: 'Apply to an offer' })
  @ApiParam({
    name: 'offerId',
    description: 'ID of the offer to apply to',
    type: String,
    required: true,
  })
  @ApiCreatedResponse({
    description: 'The created application',
    type: ApplicationDTO,
  })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  @ApiForbiddenResponse({
    description: 'User not authorized to apply to this offer',
  })
  @ApiNotFoundResponse({ description: 'Offer not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  public async create(
    @CurrentUser() currentUser: AuthUserDTO,
    @Param('offerId', ParseUUIDPipe) offerId: string,
  ): Promise<ApplicationDTO> {
    return this.applicationsService.create(currentUser, offerId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an application' })
  @ApiParam({
    name: 'id',
    description: 'ID of the application to update',
    type: String,
    required: true,
  })
  @ApiBody({
    type: UpdateApplicationDTO,
    description: 'Updated application data',
  })
  @ApiOkResponse({
    description: 'The updated application',
    type: ApplicationDTO,
  })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  @ApiForbiddenResponse({
    description: 'User not authorized to remove this application',
  })
  @ApiNotFoundResponse({ description: 'Application not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  public async update(
    @CurrentUser() currentUser: AuthUserDTO,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() applicationInput: UpdateApplicationDTO,
  ): Promise<ApplicationDTO> {
    return this.applicationsService.update(currentUser, id, applicationInput);
  }

  @Post('bulk/update-status')
  @ApiOperation({ summary: 'Bulk update application status (companies only)' })
  @ApiBody({
    type: BulkUpdateApplicationsDTO,
    description: 'Application IDs and new status',
  })
  @ApiOkResponse({
    description: 'Applications updated successfully',
    type: BulkUpdateResultDTO,
  })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  @ApiForbiddenResponse({
    description: 'User not authorized to update these applications',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  public async bulkUpdateStatus(
    @CurrentUser() currentUser: AuthUserDTO,
    @Body() bulkUpdateDto: any,
  ): Promise<any> {
    return this.applicationsService.bulkUpdateStatus(
      currentUser,
      bulkUpdateDto.applicationIds,
      bulkUpdateDto.status,
    );
  }

  @Patch(':id/mark-opened')
  @ApiOperation({
    summary:
      'Mark an application as opened (changes from NOT_OPENED to PENDING)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the application',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    description: 'Application marked as opened',
    type: ApplicationDTO,
  })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  @ApiForbiddenResponse({
    description: 'User not authorized to mark this application as opened',
  })
  @ApiNotFoundResponse({ description: 'Application not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  public async markAsOpened(
    @CurrentUser() currentUser: AuthUserDTO,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<ApplicationDTO> {
    return this.applicationsService.markAsOpened(currentUser, id);
  }

  @Post('pre-accept')
  @ApiOperation({
    summary: 'Pre-accept a student for an offer (companies only)',
    description:
      'Allows a company to express interest in a student before final acceptance. Creates an application with PRE_ACCEPTED status.',
  })
  @ApiBody({
    type: PreAcceptApplicationDTO,
    description: 'Student and offer IDs for pre-acceptance',
  })
  @ApiCreatedResponse({
    description: 'The created or updated application with PRE_ACCEPTED status',
    type: ApplicationDTO,
  })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  @ApiForbiddenResponse({
    description: 'User not authorized to pre-accept for this offer',
  })
  @ApiNotFoundResponse({ description: 'Student or offer not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  public async preAccept(
    @CurrentUser() currentUser: AuthUserDTO,
    @Body() preAcceptDto: PreAcceptApplicationDTO,
  ): Promise<ApplicationDTO> {
    return this.applicationsService.preAccept(currentUser, preAcceptDto);
  }
}
