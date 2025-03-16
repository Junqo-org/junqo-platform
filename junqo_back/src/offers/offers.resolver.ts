import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { OffersService } from './offers.service';
import { CreateOfferInput, Offer, UpdateOfferInput } from '../graphql.schema';
import { CreateOfferDTO, OfferDTO, UpdateOfferDTO } from './dto/offer.dto';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { validateOrReject } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CurrentUser } from '../users/users.decorator';
import { AuthUserDTO } from '../shared/dto/auth-user.dto';

@Resolver('Offers')
export class OffersResolver {
  constructor(private readonly offersService: OffersService) {}

  @Query(() => [Offer])
  public async offers(
    @CurrentUser() currentUser: AuthUserDTO,
  ): Promise<Offer[]> {
    const offers: OfferDTO[] = await this.offersService.findAll(currentUser);
    return offers;
  }

  @Query(() => Offer)
  public async offer(
    @CurrentUser() currentUser: AuthUserDTO,
    @Args('id') id: string,
  ): Promise<Offer> {
    const offer: OfferDTO = await this.offersService.findOneById(
      currentUser,
      id,
    );

    if (offer == null) {
      throw new NotFoundException(`Offer #${id} not found`);
    }
    return offer;
  }

  @Mutation(() => Offer)
  public async createOffer(
    @CurrentUser() currentUser: AuthUserDTO,
    @Args('offerInput') offerInput: CreateOfferInput,
  ): Promise<Offer> {
    const offerInputDto: CreateOfferDTO = plainToInstance(
      CreateOfferDTO,
      offerInput,
    );

    try {
      await validateOrReject(offerInputDto);
    } catch (errors) {
      throw new BadRequestException(errors);
    }
    const offer: OfferDTO = await this.offersService.createOffer(
      currentUser,
      offerInputDto,
    );
    return offer;
  }

  @Mutation(() => Offer)
  public async updateOffer(
    @CurrentUser() currentUser: AuthUserDTO,
    @Args('offerId') offerId: string,
    @Args('offerInput') offerInput: UpdateOfferInput,
  ): Promise<Offer> {
    const offerInputDto: UpdateOfferDTO = plainToInstance(
      UpdateOfferDTO,
      offerInput,
    );

    try {
      await validateOrReject(offerInputDto);
    } catch (errors) {
      throw new BadRequestException(errors);
    }
    const offer: OfferDTO = await this.offersService.updateOffer(
      currentUser,
      offerId,
      offerInputDto,
    );
    return offer;
  }

  @Mutation(() => Offer)
  public async deleteOffer(
    @CurrentUser() currentUser: AuthUserDTO,
    @Args('offerId') offerId: string,
  ): Promise<boolean> {
    const isSuccess: boolean = await this.offersService.deleteOffer(
      currentUser,
      offerId,
    );

    if (isSuccess === false) {
      throw new InternalServerErrorException(`While deleting offer ${offerId}`);
    }
    return isSuccess;
  }
}
