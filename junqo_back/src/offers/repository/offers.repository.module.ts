import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { OfferModel } from './models/offer.model';
import { OfferSeenModel } from './models/offer-seen.model';
import { OffersRepository } from './offers.repository';

@Module({
  imports: [SequelizeModule.forFeature([OfferModel, OfferSeenModel])],
  providers: [OffersRepository],
  exports: [OffersRepository],
})
export class OffersRepositoryModule {}
