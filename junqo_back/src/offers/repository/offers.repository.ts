import { InjectModel } from '@nestjs/sequelize';
import { CreateOfferDTO, OfferDTO, UpdateOfferDTO } from '../dto/offer.dto';
import { OfferModel } from './models/offer.model';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

export class OffersRepository {
  constructor(
    @InjectModel(OfferModel)
    private readonly offerModel: typeof OfferModel,
  ) {}

  public async findAll(): Promise<OfferDTO[]> {
    try {
      const offersModels: OfferModel[] = await this.offerModel.findAll();

      if (!offersModels || offersModels.length === 0) {
        throw new NotFoundException('Offer not found');
      }
      const offers: OfferDTO[] = offersModels.map((offer) =>
        offer.toOfferDTO(),
      );

      return offers;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to fetch offers: ${error.message}`,
      );
    }
  }

  public async findOneById(id: string): Promise<OfferDTO> {
    if (!id || typeof id !== 'string') {
      throw new BadRequestException('Invalid offer ID');
    }
    const offerModel: OfferModel = await this.offerModel.findByPk(id);

    if (!offerModel) {
      throw new NotFoundException(`Offer #${id} not found`);
    }
    const offer: OfferDTO = offerModel.toOfferDTO();

    return offer;
  }

  public async createOffer(createOfferDto: CreateOfferDTO): Promise<OfferDTO> {
    try {
      const newOfferModel: OfferModel = await this.offerModel.create({
        ...createOfferDto,
      });

      if (!newOfferModel) {
        throw new InternalServerErrorException('Offer not created');
      }
      const newOffer: OfferDTO = newOfferModel.toOfferDTO();

      return newOffer;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to create Offer: ${error.message}`,
      );
    }
  }

  public async updateOffer(
    id: string,
    updateOfferDto: UpdateOfferDTO,
  ): Promise<OfferDTO> {
    try {
      const updatedOfferModel: OfferModel =
        await this.offerModel.sequelize.transaction(async (transaction) => {
          const offer = await this.offerModel.findByPk(id, {
            transaction,
          });

          if (!offer) {
            throw new NotFoundException(`Offer #${id} not found`);
          }
          const updatedOffer = await offer.update(
            {
              ...(updateOfferDto.title != undefined && {
                title: updateOfferDto.title,
              }),
              ...(updateOfferDto.description != undefined && {
                description: updateOfferDto.description,
              }),
              ...(updateOfferDto.status != undefined && {
                status: updateOfferDto.status,
              }),
              ...(updateOfferDto.duration != undefined && {
                duration: updateOfferDto.duration,
              }),
              ...(updateOfferDto.salary != undefined && {
                salary: updateOfferDto.salary,
              }),
              ...(updateOfferDto.workLocationType != undefined && {
                workLocationType: updateOfferDto.workLocationType,
              }),
              ...(updateOfferDto.skills != undefined && {
                skills: updateOfferDto.skills,
              }),
              ...(updateOfferDto.benefits != undefined && {
                benefits: updateOfferDto.benefits,
              }),
              ...(updateOfferDto.educationLevel != undefined && {
                educationLevel: updateOfferDto.educationLevel,
              }),
            },
            {
              transaction,
            },
          );
          return updatedOffer;
        });

      if (!updatedOfferModel) {
        throw new InternalServerErrorException('Fetched offer is null');
      }
      const updatedOffer: OfferDTO = updatedOfferModel.toOfferDTO();

      return updatedOffer;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to update offer: ${error.message}`,
      );
    }
  }

  public async incrementViewCount(offerId: string): Promise<number> {
    try {
      const offer = await this.offerModel.findByPk(offerId);

      if (!offer) {
        throw new NotFoundException(`Offer #${offerId} not found`);
      }
      const incrementResult = await offer.increment('viewCount', { by: 1 });

      return incrementResult.viewCount;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        `Failed to increment offer viewCount: ${error.message}`,
      );
    }
  }

  public async deleteOffer(offerId: string): Promise<boolean> {
    try {
      const offer = await this.offerModel.findByPk(offerId);

      if (!offer) {
        throw new NotFoundException(`Offer #${offerId} not found`);
      }
      await offer.destroy();

      return true;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        `Failed to delete offer: ${error.message}`,
      );
    }
  }
}
