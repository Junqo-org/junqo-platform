import { Controller, Get, Body, Patch, Param, Query } from '@nestjs/common';
import { CompanyProfilesService } from './company-profiles.service';
import { AuthUserDTO } from '../shared/dto/auth-user.dto';
import { CurrentUser } from '../users/users.decorator';
import {
  UpdateCompanyProfileDTO,
  CompanyProfileDTO,
} from './dto/company-profile.dto';
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
  CompanyProfileQueryDTO,
  CompanyProfileQueryOutputDTO,
} from './dto/company-profile-query.dto';

@ApiTags('company-profiles')
@ApiBearerAuth()
@Controller('company-profiles')
export class CompanyProfilesController {
  constructor(
    private readonly companyProfilesService: CompanyProfilesService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get company profiles by query parameters' })
  @ApiOkResponse({
    description: 'Company profiles retrieved successfully',
    type: CompanyProfileQueryOutputDTO,
  })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  @ApiForbiddenResponse({
    description: 'User not authorized to view company profiles',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  public async findByQuery(
    @CurrentUser() currentUser: AuthUserDTO,
    @Query() query: CompanyProfileQueryDTO,
  ): Promise<CompanyProfileQueryOutputDTO> {
    return this.companyProfilesService.findByQuery(currentUser, query);
  }

  @Get('my')
  @ApiOperation({ summary: "Get current user's company profile" })
  @ApiOkResponse({
    description: 'Company profile retrieved successfully',
    type: CompanyProfileDTO,
  })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  @ApiNotFoundResponse({ description: 'Company profile not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  public async findMy(@CurrentUser() currentUser: AuthUserDTO) {
    return this.companyProfilesService.findOneById(currentUser, currentUser.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a company profile by ID' })
  @ApiParam({
    name: 'id',
    description: 'ID of the company profile',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    description: 'Company profile retrieved successfully',
    type: CompanyProfileDTO,
  })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  @ApiForbiddenResponse({
    description: 'User not authorized to view this company profile',
  })
  @ApiNotFoundResponse({ description: 'Company profile not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  public async findOne(
    @CurrentUser() currentUser: AuthUserDTO,
    @Param('id') id: string,
  ) {
    return this.companyProfilesService.findOneById(currentUser, id);
  }

  @Patch('my')
  @ApiOperation({ summary: "Update current user's company profile" })
  @ApiBody({
    type: UpdateCompanyProfileDTO,
    description: 'Updated company profile data',
  })
  @ApiOkResponse({
    description: 'Company profile updated successfully',
    type: CompanyProfileDTO,
  })
  @ApiBadRequestResponse({ description: 'Invalid request data' })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  @ApiNotFoundResponse({ description: 'Company profile not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  public async updateMy(
    @CurrentUser() currentUser: AuthUserDTO,
    @Body() updateCompanyProfileDto: UpdateCompanyProfileDTO,
  ) {
    return this.companyProfilesService.update(
      currentUser,
      updateCompanyProfileDto,
    );
  }
}
