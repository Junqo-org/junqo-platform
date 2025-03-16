import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { OfferModel } from './models/offer.model';
import { OffersRepository } from './offers.repository';

@Module({
  imports: [SequelizeModule.forFeature([OfferModel])],
  providers: [OffersRepository],
  exports: [OffersRepository],
})
export class OffersRepositoryModule {}
