import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { AuthUserDTO } from '../shared/dto/auth-user.dto';
import { CreateOfferDTO, OfferDTO, UpdateOfferDTO } from './dto/offer.dto';
import { OffersRepository } from './repository/offers.repository';
import { Actions, CaslAbilityFactory } from '../casl/casl-ability.factory';
import { OfferResource } from '../casl/dto/offer-resource.dto';
import { plainToInstance } from 'class-transformer';
import { OfferQueryDTO, OfferQueryOutputDTO } from './dto/offer-query.dto';
import { UserType } from '../users/dto/user-type.enum';

@Injectable()
export class OffersService {
  constructor(
    private readonly caslAbilityFactory: CaslAbilityFactory,
    private readonly offersRepository: OffersRepository,
  ) {}

  /**
   * Retrieves all offers from the database after checking user permissions.
   *
   * @param currentUser - The authenticated user requesting the offers
   * @returns A promise that resolves to an array of OfferDTO objects
   * @throws ForbiddenException if user doesn't have READ permission
   * @throws NotFoundException if no offers are found
   * @throws InternalServerErrorException if database query fails
   */
  public async findAll(currentUser: AuthUserDTO): Promise<OfferDTO[]> {
    const ability = this.caslAbilityFactory.createForUser(currentUser);

    if (ability.cannot(Actions.READ, new OfferResource())) {
      throw new ForbiddenException('You do not have permission to read offers');
    }
    try {
      const Offers: OfferDTO[] = await this.offersRepository.findAll();

      if (!Offers || Offers.length === 0) {
        throw new NotFoundException(`Offers not found`);
      }
      return Offers;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (error instanceof ForbiddenException) throw error;
      throw new InternalServerErrorException(
        `Failed to fetch offers: ${error.message}`,
      );
    }
  }

  /**
   * Retrieves offers matching the query if the current user has the required permissions.
   *
   * @param currentUser - The authenticated user requesting the offers
   * @param query - The search query to filter offers
   * @returns Promise containing an array of matching OfferDTO objects
   * @throws ForbiddenException if user lacks READ permission on OfferResource
   * @throws NotFoundException if no matching offers are found
   * @throws InternalServerErrorException if database query fails
   */
  public async findByQuery(
    currentUser: AuthUserDTO,
    query: OfferQueryDTO,
  ): Promise<OfferQueryOutputDTO> {
    const ability = this.caslAbilityFactory.createForUser(currentUser);

    if (ability.cannot(Actions.READ, new OfferResource())) {
      throw new ForbiddenException('You do not have permission to read offers');
    }

    try {
      const queryResult: OfferQueryOutputDTO =
        await this.offersRepository.findByQuery(query, currentUser.id);

      if (!queryResult || queryResult.count === 0) {
        throw new NotFoundException(`No offers found matching query: ${query}`);
      }
      return queryResult;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (error instanceof ForbiddenException) throw error;
      throw new InternalServerErrorException(
        `Failed to fetch offers: ${error.message}`,
      );
    }
  }

  /**
   * Retrieves all offers created by a specific user.
   *
   * @param currentUser - The authenticated user requesting the offers
   * @param userId - The ID of the user whose offers to retrieve
   * @returns Promise containing an array of OfferDTO objects
   * @throws ForbiddenException if user lacks READ permission
   * @throws NotFoundException if no offers are found for the user
   * @throws InternalServerErrorException if database query fails
   */
  public async findByUserId(
    currentUser: AuthUserDTO,
    userId: string,
  ): Promise<OfferDTO[]> {
    const ability = this.caslAbilityFactory.createForUser(currentUser);

    if (ability.cannot(Actions.READ, new OfferResource(userId))) {
      throw new ForbiddenException('You do not have permission to read offers');
    }

    try {
      const offers: OfferDTO[] =
        await this.offersRepository.findByUserId(userId);

      if (!offers || offers.length === 0) {
        throw new NotFoundException(`No offers found for user ${userId}`);
      }
      return offers;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (error instanceof ForbiddenException) throw error;
      throw new InternalServerErrorException(
        `Failed to fetch offers: ${error.message}`,
      );
    }
  }

  /**
   * Retrieves a specific offer by its ID while enforcing access control.
   * Automatically increments view count for non-owner views.
   *
   * @param currentUser - The authenticated user requesting the offer
   * @param id - The unique identifier of the offer to retrieve
   * @returns A promise that resolves to the found offer DTO
   * @throws ForbiddenException if the user doesn't have permission to read the offer
   * @throws NotFoundException if no offer is found with the given ID
   * @throws InternalServerErrorException if database query fails
   */
  public async findOneById(
    currentUser: AuthUserDTO,
    id: string,
  ): Promise<OfferDTO> {
    const ability = this.caslAbilityFactory.createForUser(currentUser);

    try {
      const offer: OfferDTO = await this.offersRepository.findOneById(id);
      const offerResource: OfferResource = plainToInstance(
        OfferResource,
        offer,
        {
          excludeExtraneousValues: true,
        },
      );

      if (ability.cannot(Actions.READ, offerResource)) {
        throw new ForbiddenException(
          'You do not have permission to read this offer',
        );
      }

      if (offer === null) {
        throw new NotFoundException(`Offers ${id} not found`);
      }

      // Increment view count if the viewer is not the owner
      if (offer.userId !== currentUser.id) {
        await this.offersRepository.incrementViewCount(id);
        // Update the returned offer with the new view count
        offer.viewCount = (offer.viewCount || 0) + 1;
      }

      return offer;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (error instanceof ForbiddenException) throw error;
      throw new InternalServerErrorException(
        `Failed to fetch offer: ${error.message}`,
      );
    }
  }

  /**
   * Creates a new offer in the system after checking user permissions.
   *
   * @param currentUser - The authenticated user attempting to create the offer
   * @param createOfferDto - The data transfer object containing the offer details
   * @returns Promise resolving to the newly created offer DTO
   * @throws ForbiddenException if the user lacks permission to create offers
   * @throws NotFoundException if no offer is found with the given ID
   * @throws InternalServerErrorException if offer creation fails or returns null
   */
  public async createOffer(
    currentUser: AuthUserDTO,
    createOfferDto: CreateOfferDTO,
  ): Promise<OfferDTO> {
    if (createOfferDto.userId == null) {
      createOfferDto.userId = currentUser.id;
    }
    const ability = this.caslAbilityFactory.createForUser(currentUser);
    const offerResource: OfferResource = plainToInstance(
      OfferResource,
      createOfferDto,
      { excludeExtraneousValues: true },
    );

    if (ability.cannot(Actions.CREATE, offerResource)) {
      throw new ForbiddenException(
        'You do not have permission to create this offer',
      );
    }

    try {
      const createdOffer: OfferDTO =
        await this.offersRepository.createOffer(createOfferDto);

      if (createdOffer === null) {
        throw new InternalServerErrorException(
          `Failed to create offer: createdOffer is null`,
        );
      }
      return createdOffer;
    } catch (error) {
      if (error instanceof ForbiddenException) throw error;
      throw new InternalServerErrorException(
        `Failed to create offer: ${error.message}`,
      );
    }
  }

  /**
   * Updates an existing offer with the provided data
   *
   * @param currentUser - The authenticated user requesting the update
   * @param offerID - The unique identifier of the offer to update
   * @param updateOfferDto - The DTO containing the updated offer data
   * @returns Promise<OfferDTO> - The updated offer
   * @throws ForbiddenException - If the user doesn't have permission to update the offer
   * @throws NotFoundException if no offer is found with the given ID
   * @throws InternalServerErrorException - If there is an error updating the offer in the database
   */
  public async updateOffer(
    currentUser: AuthUserDTO,
    offerID: string,
    updateOfferDto: UpdateOfferDTO,
  ): Promise<OfferDTO> {
    const ability = this.caslAbilityFactory.createForUser(currentUser);

    const offer: OfferDTO = await this.findOneById(currentUser, offerID);
    const offerResource: OfferResource = plainToInstance(OfferResource, offer, {
      excludeExtraneousValues: true,
    });

    if (ability.cannot(Actions.UPDATE, offerResource)) {
      throw new ForbiddenException(
        'You do not have permission to update this offer',
      );
    }

    try {
      const updatedOffer: OfferDTO = await this.offersRepository.updateOffer(
        offerID,
        updateOfferDto,
      );

      if (updatedOffer === null) {
        throw new InternalServerErrorException(
          `Failed to update offer: updatedOffer is null`,
        );
      }

      return updatedOffer;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (error instanceof ForbiddenException) throw error;
      throw new InternalServerErrorException(
        `Failed to update offer: ${error.message}`,
      );
    }
  }

  /**
   * Deletes an offer from the database after checking user permissions.
   *
   * @param currentUser - The authenticated user attempting to delete the offer
   * @param offerID - The unique identifier of the offer to delete
   * @returns A boolean indicating whether the deletion was successful (true if deleted)
   * @throws ForbiddenException if the user doesn't have permission to delete the offer
   * @throws NotFoundException if the offer doesn't exist
   * @throws InternalServerErrorException if there's an error during deletion
   */
  public async deleteOffer(
    currentUser: AuthUserDTO,
    offerID: string,
  ): Promise<boolean> {
    const ability = this.caslAbilityFactory.createForUser(currentUser);

    const offer: OfferDTO = await this.findOneById(currentUser, offerID);
    const offerResource: OfferResource = plainToInstance(OfferResource, offer, {
      excludeExtraneousValues: true,
    });

    if (ability.cannot(Actions.DELETE, offerResource)) {
      throw new ForbiddenException(
        'You do not have permission to delete this offer',
      );
    }
    try {
      const isSuccess: boolean =
        await this.offersRepository.deleteOffer(offerID);

      if (!isSuccess) {
        throw new InternalServerErrorException(
          `Error while deleting offer ${offerID}`,
        );
      }

      return true;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (error instanceof ForbiddenException) throw error;
      throw new InternalServerErrorException(
        `Failed to delete offer: ${error.message}`,
      );
    }
  }

  public async markOfferAsViewed(
    currentUser: AuthUserDTO,
    offerId: string,
  ): Promise<void> {
    const canMarkAsViewed =
      currentUser.type === UserType.STUDENT ||
      currentUser.type === UserType.ADMIN;

    if (!canMarkAsViewed) {
      throw new ForbiddenException(
        'Only students or admins can mark offers as viewed',
      );
    }

    try {
      const offer: OfferDTO = await this.findOneById(currentUser, offerId);

      if (!offer) {
        throw new NotFoundException(`Offer ${offerId} not found`);
      }

      await this.offersRepository.markOfferAsViewed(currentUser.id, offer.id);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (error instanceof ForbiddenException) throw error;
      throw new InternalServerErrorException(
        `Failed to mark offer as viewed: ${error.message}`,
      );
    }
  }

  /**
   * Gets analytics for a specific offer.
   *
   * @param currentUser - The authenticated user requesting analytics
   * @param offerId - The ID of the offer to get analytics for
   * @returns Promise containing offer analytics
   * @throws ForbiddenException if user doesn't own the offer
   * @throws NotFoundException if offer not found
   */
  public async getOfferAnalytics(
    currentUser: AuthUserDTO,
    offerId: string,
  ): Promise<any> {
    const ability = this.caslAbilityFactory.createForUser(currentUser);

    try {
      const offer: OfferDTO = await this.offersRepository.findOneById(offerId);
      
      if (!offer) {
        throw new NotFoundException(`Offer ${offerId} not found`);
      }

      const offerResource: OfferResource = plainToInstance(
        OfferResource,
        offer,
        { excludeExtraneousValues: true },
      );

      // Only allow owner to see analytics
      if (ability.cannot(Actions.UPDATE, offerResource)) {
        throw new ForbiddenException(
          'You do not have permission to view analytics for this offer',
        );
      }

      // Get applications for this offer
      const applications = await this.offersRepository.getOfferApplications(offerId);

      const analytics = {
        offerId: offer.id,
        totalViews: offer.viewCount || 0,
        totalApplications: applications.length,
        pendingApplications: applications.filter(
          (a) => a.status === 'PENDING' || a.status === 'NOT_OPENED',
        ).length,
        acceptedApplications: applications.filter((a) => a.status === 'ACCEPTED')
          .length,
        deniedApplications: applications.filter((a) => a.status === 'DENIED')
          .length,
        conversionRate:
          offer.viewCount > 0
            ? (applications.length / offer.viewCount) * 100
            : 0,
        acceptanceRate:
          applications.length > 0
            ? (applications.filter((a) => a.status === 'ACCEPTED').length /
                applications.length) *
              100
            : 0,
        daysSinceCreation: Math.floor(
          (Date.now() - new Date(offer.createdAt).getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      };

      return analytics;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (error instanceof ForbiddenException) throw error;
      throw new InternalServerErrorException(
        `Failed to get offer analytics: ${error.message}`,
      );
    }
  }

  /**
   * Gets analytics for all offers of the current user.
   *
   * @param currentUser - The authenticated user requesting analytics
   * @returns Promise containing analytics for all user's offers
   */
  public async getAllOffersAnalytics(currentUser: AuthUserDTO): Promise<any> {
    try {
      const offers = await this.findByUserId(currentUser, currentUser.id);

      const analyticsPromises = offers.map((offer) =>
        this.getOfferAnalytics(currentUser, offer.id),
      );

      const analytics = await Promise.all(analyticsPromises);

      const totals = {
        totalOffers: offers.length,
        totalViews: analytics.reduce((sum, a) => sum + a.totalViews, 0),
        totalApplications: analytics.reduce(
          (sum, a) => sum + a.totalApplications,
          0,
        ),
        averageViewsPerOffer:
          offers.length > 0
            ? analytics.reduce((sum, a) => sum + a.totalViews, 0) /
              offers.length
            : 0,
        averageApplicationsPerOffer:
          offers.length > 0
            ? analytics.reduce((sum, a) => sum + a.totalApplications, 0) /
              offers.length
            : 0,
        overallConversionRate:
          analytics.reduce((sum, a) => sum + a.totalViews, 0) > 0
            ? (analytics.reduce((sum, a) => sum + a.totalApplications, 0) /
                analytics.reduce((sum, a) => sum + a.totalViews, 0)) *
              100
            : 0,
      };

      return {
        analytics,
        totals,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to get offers analytics: ${error.message}`,
      );
    }
  }
}
