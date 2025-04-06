import {
  Body,
  Controller,
  Delete,
  Get,
  NotImplementedException,
  Param,
  Patch,
  Post,
  HttpCode,
} from '@nestjs/common';
import { OffersService } from './offers.service';
import { CreateOfferDTO, OfferDTO, UpdateOfferDTO } from './dto/offer.dto';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CurrentUser } from '../users/users.decorator';
import { AuthUserDTO } from '../shared/dto/auth-user.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('offers')
@ApiBearerAuth()
@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all offers' })
  @ApiOkResponse({
    description: 'List of offers retrieved successfully',
    type: [OfferDTO],
  })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  @ApiForbiddenResponse({ description: 'User not authorized to view offers' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  public async getAll(
    @CurrentUser() currentUser: AuthUserDTO,
  ): Promise<OfferDTO[]> {
    const offers: OfferDTO[] = await this.offersService.findAll(currentUser);
    return offers;
  }

  @Get('my')
  @ApiOperation({ summary: 'Get all offers created by current user' })
  @ApiOkResponse({
    description: 'List of offers retrieved successfully',
    type: [OfferDTO],
  })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  @ApiForbiddenResponse({
    description: 'User not authorized to view these offers',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  public async getMy(
    @CurrentUser() currentUser: AuthUserDTO,
  ): Promise<OfferDTO[]> {
    throw new NotImplementedException();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an offer by ID' })
  @ApiParam({
    name: 'id',
    description: 'ID of the offer',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    description: 'Offer retrieved successfully',
    type: OfferDTO,
  })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  @ApiForbiddenResponse({
    description: 'User not authorized to view this offer',
  })
  @ApiNotFoundResponse({ description: 'Offer not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  public async getOne(
    @CurrentUser() currentUser: AuthUserDTO,
    @Param('id') id: string,
  ): Promise<OfferDTO> {
    const offer: OfferDTO = await this.offersService.findOneById(
      currentUser,
      id,
    );

    if (offer == null) {
      throw new NotFoundException(`Offer #${id} not found`);
    }
    return offer;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new offer' })
  @ApiBody({
    type: CreateOfferDTO,
    description: 'Offer data to create',
  })
  @ApiCreatedResponse({
    description: 'Offer created successfully',
    type: OfferDTO,
  })
  @ApiBadRequestResponse({ description: 'Invalid request data' })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  @ApiForbiddenResponse({ description: 'User not authorized to create offers' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  public async createOffer(
    @CurrentUser() currentUser: AuthUserDTO,
    @Body('offerInput') offerInput: CreateOfferDTO,
  ): Promise<OfferDTO> {
    const offer: OfferDTO = await this.offersService.createOffer(
      currentUser,
      offerInput,
    );
    return offer;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an offer' })
  @ApiParam({
    name: 'id',
    description: 'ID of the offer to update',
    type: String,
    required: true,
  })
  @ApiBody({
    type: UpdateOfferDTO,
    description: 'Updated offer data',
  })
  @ApiOkResponse({
    description: 'Offer updated successfully',
    type: OfferDTO,
  })
  @ApiBadRequestResponse({ description: 'Invalid request data' })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  @ApiForbiddenResponse({
    description: 'User not authorized to update this offer',
  })
  @ApiNotFoundResponse({ description: 'Offer not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  public async updateOffer(
    @CurrentUser() currentUser: AuthUserDTO,
    @Param('id') id: string,
    @Body('offerInput') offerInput: UpdateOfferDTO,
  ): Promise<OfferDTO> {
    const offer: OfferDTO = await this.offersService.updateOffer(
      currentUser,
      id,
      offerInput,
    );
    return offer;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an offer' })
  @ApiParam({
    name: 'id',
    description: 'ID of the offer to delete',
    type: String,
    required: true,
  })
  @ApiNoContentResponse({
    description: 'Offer deleted successfully',
  })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  @ApiForbiddenResponse({
    description: 'User not authorized to delete this offer',
  })
  @ApiNotFoundResponse({ description: 'Offer not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  public async deleteOffer(
    @CurrentUser() currentUser: AuthUserDTO,
    @Param('id') id: string,
  ): Promise<{ isSuccessful: boolean }> {
    const isSuccess: boolean = await this.offersService.deleteOffer(
      currentUser,
      id,
    );

    if (isSuccess === false) {
      throw new InternalServerErrorException(`While deleting offer ${id}`);
    }
    return { isSuccessful: isSuccess };
  }

  @Get('applied')
  @ApiOperation({ summary: 'Get offers to which the current user has applied' })
  @ApiOkResponse({
    description: 'List of applied offers retrieved successfully',
    type: [OfferDTO],
  })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  @ApiForbiddenResponse({
    description: 'User not authorized to view applied offers',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  public async getAppliedOffers(
    @CurrentUser() currentUser: AuthUserDTO,
  ): Promise<OfferDTO[]> {
    throw new NotImplementedException();
  }

  @Post(':id/apply')
  @ApiOperation({ summary: 'Apply to an offer' })
  @ApiParam({
    name: 'id',
    description: 'ID of the offer to apply to',
    type: String,
    required: true,
  })
  @ApiCreatedResponse({
    description: 'Successfully applied to offer',
    type: Boolean,
  })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  @ApiForbiddenResponse({
    description: 'User not authorized to apply to this offer',
  })
  @ApiNotFoundResponse({ description: 'Offer not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  public async applyToOffer(
    @CurrentUser() currentUser: AuthUserDTO,
    @Param('id') id: string,
  ): Promise<{ isSuccessful: boolean }> {
    throw new NotImplementedException();
  }

  @Delete(':id/apply')
  @ApiOperation({ summary: 'Remove application from an offer' })
  @ApiParam({
    name: 'id',
    description: 'ID of the offer to remove application from',
    type: String,
    required: true,
  })
  @ApiNoContentResponse({
    description: 'Application removed successfully',
  })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  @ApiForbiddenResponse({
    description: 'User not authorized to remove this application',
  })
  @ApiNotFoundResponse({ description: 'Offer or application not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  public async removeApplyToOffer(
    @CurrentUser() currentUser: AuthUserDTO,
    @Param('id') id: string,
  ): Promise<{ isSuccessful: boolean }> {
    throw new NotImplementedException();
  }
}
