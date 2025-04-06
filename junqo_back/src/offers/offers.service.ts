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
   * Retrieves a specific offer by its ID while enforcing access control.
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
}
